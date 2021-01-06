// 在popup.html的页面里，Dom内容加载完毕后执行
document.addEventListener('DOMContentLoaded', function(event) {
    var resultsButton = document.getElementById('getResults');
    resultsButton.onclick = getResults;
});
// 当点击按钮时，获取当前活动Tab窗口，并发送消息到content_script
function getResults() {
    chrome.tabs.query(
        { active: true, currentWindow: true },
        function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { action: 'checkForContent' },
                function (response) {
                    showResults(response.results);
                }
            );
        }
    );
}
// 获取从content_script的返回结果
function showResults(results) {
    var resultsElement = document.getElementById('results');
    resultsElement.innerText = results ?
        results :
        '没有收到content script的内容';
}
