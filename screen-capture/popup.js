// 工具类方法，在弹出层里添加显示内容
var log = (function() {
    var parElt = document.getElementById('wrap'),
        logElt = document.createElement('div');
    logElt.id = 'log';
    logElt.style.display = 'block';
    parElt.appendChild(logElt);

    return function() {
        var a, p, results = [];
        for (var i=0, len=arguments.length; i<len; i++) {
            a = arguments[i];
            try {
                a = JSON.stringify(a, null, 2);
            } catch(e) {}
            results.push(a);
        }
        p = document.createElement('p');
        p.innerText = results.join(' ');
        p.innerHTML = p.innerHTML.replace(/ /g, '&nbsp;');
        logElt.appendChild(p);
    };
})();

/**
 * 工具类方法
 */
function $(id) { return document.getElementById(id); }
function show(id) { $(id).style.display = 'block'; }
function hide(id) { $(id).style.display = 'none'; }

/**
 * 验证URL是否是可以截屏的
 */
var matches = ['http://*/*', 'https://*/*', 'ftp://*/*', 'file://*/*'],
    noMatches = [/^https?:\/\/chrome.google.com\/.*$/];
function testURLMatches(url) {
    var r, i;
    for (i=noMatches.length-1; i>=0; i--) {
        if (noMatches[i].test(url)) {
            return false;
        }
    }
    for (i=matches.length-1; i>=0; i--) {
        r = new RegExp('^' + matches[i].replace(/\*/g, '.*') + '$');
        if (r.test(url)) {
            return true;
        }
    }
    return false;
}

/**
 * 事件
 */
var screenshot, contentURL = '';

/**
 * 发送消息通知事件：scrollPage
 */
function sendScrollMessage(tab) {
    chrome.tabs.sendMessage(tab.id, {msg: 'scrollPage'}, function() {
        // 发送后的回调函数
        console.log("after send scrollPage message")
    });
}

function sendLogMessage(data) {
    let queryOptions = { active: true};
    chrome.tabs.query(queryOptions, function(tabs) {
        let tab = tabs[0]
        chrome.tabs.sendMessage(tab.id, {msg: 'logMessage', data: data}, function() {
        });
    });
}
/**
 * 监听来自page.js的消息通知事件：capturePage
 */
 chrome.runtime.onMessage.addListener(async function(request, sender) {
    if (request.msg === 'capturePage') {
        await capturePage(request, sender);
    } else if (request.msg === 'capturePageComplete') {
        openPage()
    } else {
        console.error('Unknown message received from content script: ' + request.msg);
    }
});
/**
 * 在popup.html里显示截取页面的进度
 */
 async function capturePage(data, sender, sendResponse) {
    return new Promise((resolve, reject) => {
        var canvas;
        $('bar').style.width = parseInt(data.complete * 100, 10) + '%';
        // 使用多少屏幕实际像素来绘制单个 CSS 像素。
        var scale = data.devicePixelRatio && data.devicePixelRatio !== 1 ?
            1 / data.devicePixelRatio : 1;
    
        // 将缩放比例考虑进去，以正常尺寸来截取，这个数据会应用到canvas生成的图片
        if (scale !== 1) {
            data.x = data.x / scale;
            data.y = data.y / scale;
            data.totalWidth = data.totalWidth / scale;
            data.totalHeight = data.totalHeight / scale;
        }
    
        if (!screenshot.canvas) {
            canvas = document.createElement('canvas');
            canvas.width = data.totalWidth;
            canvas.height = data.totalHeight;
            screenshot.canvas = canvas;
            screenshot.ctx = canvas.getContext('2d');
        }
    
        /**
         * 重要
         * API: https://developer.chrome.com/docs/extensions/reference/tabs/#method-captureVisibleTab
         * chrome.tabs.captureVisibleTab(windowId?: number, options?: extensionTypes.ImageDetails, callback: function)
         */
        chrome.tabs.captureVisibleTab(
            null, {format: 'png', quality: 100}, function(dataURI) {
                if (dataURI) {
                    var image = new Image();
                    image.onload = function() {
                        sendLogMessage('draw img postions: ' + data.x + ', ' + data.y);
                        screenshot.ctx.drawImage(image, data.x, data.y);// 将当前片段图片放到相应位置
                            let queryOptions = { active: true, lastFocusedWindow: true };
                            chrome.tabs.query(queryOptions, function(tabs) {
                                let tab = tabs[0]
                                sendScrollMessage(tab);
                                resolve(); 
                            });
                    };
                    image.src = dataURI;
                }
            });
    });
}
/**
 * 图片截取成功后，打开新的tab页面
 */
function openPage() {
    var dataURI = screenshot.canvas.toDataURL();
    
    // 得到图片名称
    var name = contentURL.split('?')[0].split('#')[0];
    if (name) {
        name = name
            .replace(/^https?:\/\//, '')
            .replace(/[^A-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^[_\-]+/, '')
            .replace(/[_\-]+$/, '');
        name = '-' + name;
    } else {
        name = '';
    }
    name = 'screen-capture-' + name + '.png';

    function onwriteend() {
        // 存储图片对象至本地存储
        chrome.storage.local.remove(['screencaptureimg'], function(obj){
            console.log("remove success");
        });

        chrome.storage.local.set({'screencaptureimg': dataURI, 'name': name}, function() {
            // 打开图片的下载管理页面
            chrome.tabs.create({'url': chrome.runtime.getURL('capture/capture.html')}, function(tab) {
                console.log("after created")
            });
        });
    }
    onwriteend()
}

/**
 * popup.js的入口方法，打开popup.html后，立即执行，向网页页面执行page.js的执行
 */
 let queryOptions = { active: true, lastFocusedWindow: true };
 chrome.tabs.query(queryOptions, function(tabs) {
    let tab = tabs[0]
    contentURL = tab.url;
    screenshot = {};
    if (testURLMatches(tab.url)) {
        let loaded = false;
        chrome.scripting.executeScript({target: {tabId: tab.id} , files: ['page.js'],}, function() {
            loaded = true;
            show('loading'); // 加载loading提示
            sendScrollMessage(tab); // 发送消息通知
        });
        // 如果网页没有执行page.js，则提示报错信息
        window.setTimeout(function() {
            if (!loaded) {
                show('uh');
            }
        }, 1000);
    } else {
        // 不是正常的网页
        show('invalid');
    }
});
