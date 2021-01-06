function trigger(isDeactivated) {
  // 设定颜色
  document.getElementById("options").style.color = isDeactivated ? 'graytext' : 'black';
  // 设定可用状态
  document.getElementById("options").frequency.disabled = isDeactivated; 
}
// 页面加载方法
window.addEventListener('load', function() {
  // 获取页面对象
  const obj = document.getElementById("options"); 
  // 显示存储的值
  obj.isActivated.checked = localStorage.isActivated ? JSON.parse(localStorage.isActivated) : true;
  // 显示存储的值
  obj.frequency.value = localStorage.frequency;

  // 根据存储值来设定页面上的勾选状态
  if (!obj.isActivated.checked) { trigger(true); }

  // 绑定勾选的变化事件
  obj.isActivated.onchange = function() {
    localStorage.isActivated = obj.isActivated.checked; // 设定本地存储
    trigger(!obj.isActivated.checked);
  };
  // 绑定间隔的变化事件
  obj.frequency.onchange = function() {
    localStorage.frequency = obj.frequency.value; // 设定本地存储
  };
});
