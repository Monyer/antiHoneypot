var CONF = {
  sameIdMinLength: 16, //识别追踪字符串的最小长度
  sameIdAlert: true, //是否对跟踪标识进行通知
  openDatabaseAlert: true, //是否对openDatabase进行通知
  indexedDBAlert: true, //是否对indexDB进行通知
  fingerPrintAlert: true, //是否对疑似的获取指纹标识进行通知
  doNotBlockButRemoveCookie: false, //不进行阻断，只移除Cookie
};

chrome.storage.local.get({
  CONF: CONF
}, function(items) {
  CONF = items.CONF;
});