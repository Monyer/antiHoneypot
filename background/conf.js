var CONF = {
  sameIdMinLength: 16,
  sameIdAlert: true,
  openDatabaseAlert: true,
  indexedDBAlert: true,
  fingerPrintAlert: true,
  getClipboardAlert: true,
  doNotBlockButRemoveCookie: false
};

//从storage中拉取配置，覆盖CONF
chrome.storage.local.get({
  CONF: CONF
}, function(items) {
  CONF = items.CONF;
  //   console.log(CONF);
});