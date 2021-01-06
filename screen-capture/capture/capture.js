// 获取本地存储的图片数据，显示在页面上
let captureImg, fileName;
chrome.storage.local.get(['screencaptureimg','name'], function(result) {
    captureImg = result['screencaptureimg'];
    fileName = result['name'];
    document.getElementById('screenCaptureImg').src = captureImg;
});

/**
 * 下载图片通用方法
 * @param fileName
 * @param imgData
 */
function downloadFile(fileName, imgData) {
    let aLink = document.createElement('a');
    let evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", true, true);
    aLink.download = fileName + ".png";
    aLink.href = imgData;
    aLink.click()
}
// 下载按钮绑定点击事件，将图片下载到本地
document.getElementById('downloadFile').addEventListener('click', function() {
    if (captureImg) {
        downloadFile(fileName, captureImg);
    }
});


