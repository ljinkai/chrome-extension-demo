// 监听收到的消息，根据action来分别处理
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === 'checkForContent') {
            checkForContent(request, sender, sendResponse);
            return true;
        }
    }
);

// 返回值处理
function checkForContent(request, sender, sendResponse) {
    return sendResponse({ results: 'Hello World! 我是来自「' + document.title + '」content script世界的消息~' });
}
