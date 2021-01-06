let targetWindow = null; //当前激活的浏览器窗口
let tabCount = 0; //当前激活浏览器窗口里的tab的数量

/**
 * 点击浏览器图标绑定的事件
 * @param tab
 */
function start(tab) {
  chrome.windows.getCurrent(getWindows)
}
function getWindows(win) {
  targetWindow = win;
  chrome.tabs.getAllInWindow(targetWindow.id, getTabs);
}
function getTabs(tabs) {
  tabCount = tabs.length;
  chrome.windows.getAll({"populate": true}, moveTabs);
}
function moveTabs(windows) {
  var numWindows = windows.length;
  var tabPosition = tabCount;
  for (var i = 0; i < numWindows; i++) {
    var win = windows[i];
    if (targetWindow.id != win.id) {
      var numTabs = win.tabs.length;
      for (var j = 0; j < numWindows; j++) {
        var tab = win.tabs[j];
        chrome.tabs.move(tab.id, {"windowId":targetWindow.id, "index": tabPosition});
        tabPosition++;
      }
    }

  }

}
// 地址栏图标绑定点击事件
chrome.browserAction.onClicked.addListener(start);
