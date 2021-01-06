function show() {
  var time = /(..)(:..)/.exec(new Date());     // 当前时间.
  var hour = time[1] % 12 || 12;               // 小时
  var period = time[1] < 12 ? 'a.m.' : 'p.m.'; // 上午、下午
  new Notification(hour + time[2] + ' ' + period, {
    icon: '48.png',
    body: '是时候起来溜达一下了~~'
  });
}

// 判断是否已经初始化
if (!localStorage.isInitialized) {
  localStorage.isActivated = true;   // 是否激活
  localStorage.frequency = 1;        // 显示间隔，分钟
  localStorage.isInitialized = true; // 初始化状态
}

// 浏览器是否支持通知
if (window.Notification) {
  // 加载时就先显示一下
  if (JSON.parse(localStorage.isActivated)) { show(); }

  var interval = 0; // 间隔分钟数

  setInterval(function() {
    interval++;

    if (
      JSON.parse(localStorage.isActivated) &&
        localStorage.frequency <= interval
    ) {
      show();
      interval = 0;
    }
  }, 60000);
}
