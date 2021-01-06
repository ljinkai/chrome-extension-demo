const CAPTURE_DELAY = 150;
var num = 1;

/**
 * 监听来自popup.html的消息
 * @param request
 * @param sender
 * @param callback
 */
function onMessage(request, sender, callback) {
    if (request.msg === 'scrollPage') {
        getPositions(callback);
    } else if (request.msg == 'logMessage') {
        console.log('[POPUP LOG]', request.data);
    } else {
        console.error('Unknown message received from background: ' + request.msg);
    }
}

// 判断当前网页是否已经开启了监听方法
if (!window.hasScreenCapturePage) {
    window.hasScreenCapturePage = true;
    chrome.extension.onRequest.addListener(onMessage);
}

function max(nums) {
    return Math.max.apply(Math, nums.filter(function(x) { return x; }));
}

/**
 * 获取当前网页的可视页面的位置坐标数据信息
 * @param callback
 */
function getPositions(callback) {
    var body = document.body,
        widths = [
            document.documentElement.clientWidth,
            document.body.scrollWidth,
            document.documentElement.scrollWidth,
            document.body.offsetWidth,
            document.documentElement.offsetWidth
        ],
        heights = [
            document.documentElement.clientHeight,
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight
        ],
        fullWidth = max(widths),
        fullHeight = max(heights),
        windowWidth = window.innerWidth, //窗口的内部宽度
        windowHeight = window.innerHeight,
        originalX = window.scrollX, // 开始滚动的像素值
        originalY = window.scrollY,
        originalOverflowStyle = document.documentElement.style.overflow,
        arrangements = [],
        // 设置滚动的区域
        scrollPad = windowHeight,
        yDelta = windowHeight - (windowHeight > scrollPad ? scrollPad : 0),
        xDelta = windowWidth,
        yPos = fullHeight - windowHeight,
        xPos,
        numArrangements;

    // 禁用掉滚动条，获取完整的不带滚动条的网页图片
    document.documentElement.style.overflow = 'hidden';

    while (yPos > -yDelta) {// 如果没有滚动到最后，就一直执行
        xPos = 0;
        while (xPos < fullWidth) {// 横向滚动页面的位置信息
            arrangements.push([xPos, yPos]);// 页面片段的位置信息
            xPos += xDelta;
        }
        yPos -= yDelta; // 页面竖向位置信息
    }

    numArrangements = arrangements.length;

    /**
     * 重置页面为初始状态
     */
    function cleanUp() {
        document.documentElement.style.overflow = originalOverflowStyle;
        window.scrollTo(originalX, originalY);
        num = 1;
    }

    (function processArrangements() {
        if (!arrangements.length) {// 页面滚动是完成则重置页面状态
            cleanUp();
            if (callback) {
                callback();
            }
            return;
        }

        var next = arrangements.shift(),
            x = next[0], y = next[1];

        window.scrollTo(x, y); // 滚动到相应位置，然后发送capturePage消息给popup.js

        var data = {
            msg: 'capturePage',
            x: window.scrollX,
            y: window.scrollY,
            complete: (numArrangements-arrangements.length)/numArrangements,
            totalWidth: fullWidth,
            totalHeight: fullHeight,
            devicePixelRatio: window.devicePixelRatio
        };

        // 设置一个间隔时间，页面滚动到相应位置需要一点时间，然后执行
        window.setTimeout(function() {
            // In case the below callback never returns, cleanup
            var cleanUpTimeout = window.setTimeout(cleanUp, 1250);
            // 将滚动后获取的网页的可视位置坐标数据发送消息给popup.js
            chrome.extension.sendRequest(data, function(captured) {
                window.clearTimeout(cleanUpTimeout);
                if (captured) {
                    // 继续滚动获取下一网页片段
                    processArrangements();
                    num++;
                } else {
                    // 重置页面到初始化状态
                    cleanUp();
                }
            });

        }, CAPTURE_DELAY);
    })();
}
