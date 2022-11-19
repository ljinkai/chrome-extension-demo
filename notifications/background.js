const LS = chrome.storage.local

function show() {
  var time = /(..)(:..)/.exec(new Date());     // 当前时间.
  var hour = time[1] % 12 || 12;               // 小时
  var period = time[1] < 12 ? 'a.m.' : 'p.m.'; // 上午、下午
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'img/icon_48.png',
    title: '是时候起来溜达一下了~~',
    message: hour + time[2] + ' ' + period,
    priority: 0
  });
}

// 判断是否已经初始化
async function init() {
  let isInitializedInitObj = await LS.get(['isInitialized'])
  if (!isInitializedInitObj.isInitializedInit) {
    LS.set({"isActivated": true})   // 是否激活
    LS.set({"frequency": 1})   // 显示间隔，分钟
    LS.set({"isInitialized": true})   // 初始化状态
  }
  // 浏览器是否支持通知
  var window = window ?? self;
  if (window.Notification) {
    // 加载时就先显示一下
    let tmp = await LS.get(['isActivated'])
    if (tmp.isActivated) { show(); }

    var interval = 0; // 间隔分钟数

    setInterval(async () => {
      interval++;
      let isActivatedObj = await LS.get(['isActivated'])
      let frequencyObj = await LS.get(['frequency'])
      if (
        isActivatedObj.isActivated &&
        (frequencyObj.frequency <= interval)
      ) {
        show();
        interval = 0;
      }
    }, 60000);
  }
}

init()


