var CONF = {
  sameIdMinLength: 16,
  blockHoneypotDomain: true,
  sameIdAlert: true,
  openDatabaseAlert: true,
  indexedDBAlert: true,
  fingerPrintAlert: true,
  getClipboardAlert: true,
  requestFileSystemAlert: true,
  obfuscatorAlert: true,
  //   doNotBlockButRemoveCookie: false
};

//从storage中拉取配置，覆盖CONF
chrome.storage.local.get({
  CONF: CONF
}, function(items) {
  if (Object.keys(items.CONF) == Object.keys(CONF)) {
    CONF = items.CONF;
  }
});