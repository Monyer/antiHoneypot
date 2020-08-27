var bg = chrome.extension.getBackgroundPage();

chrome.storage.local.get({
  CONF: bg.CONF
}, function(items) {
  bg.CONF = items.CONF;
  document.querySelector("#sameIdMinLength").value = bg.CONF.sameIdMinLength;
  document.querySelector("#sameIdAlert").checked = bg.CONF.sameIdAlert;
  document.querySelector("#openDatabaseAlert").checked = bg.CONF.openDatabaseAlert;
  document.querySelector("#indexedDBAlert").checked = bg.CONF.indexedDBAlert;
  document.querySelector("#fingerPrintAlert").checked = bg.CONF.fingerPrintAlert;
  document.querySelector("#doNotBlockButRemoveCookie").checked = bg.CONF.doNotBlockButRemoveCookie;
});

document.querySelector("#sameIdMinLength").addEventListener("change", function() {
  bg.CONF.sameIdMinLength = this.value;
  chrome.storage.local.set({
    CONF: bg.CONF
  });
});
document.querySelector("#sameIdAlert").addEventListener("change", function() {
  bg.CONF.sameIdAlert = this.checked;
  chrome.storage.local.set({
    CONF: bg.CONF
  });
});
document.querySelector("#openDatabaseAlert").addEventListener("change", function() {
  bg.CONF.openDatabaseAlert = this.checked;
  chrome.storage.local.set({
    CONF: bg.CONF
  });
});
document.querySelector("#indexedDBAlert").addEventListener("change", function() {
  bg.CONF.indexedDBAlert = this.checked;
  chrome.storage.local.set({
    CONF: bg.CONF
  });
});
document.querySelector("#fingerPrintAlert").addEventListener("change", function() {
  bg.CONF.fingerPrintAlert = this.checked;
  chrome.storage.local.set({
    CONF: bg.CONF
  });
});
document.querySelector("#doNotBlockButRemoveCookie").addEventListener("change", function() {
  bg.CONF.doNotBlockButRemoveCookie = this.checked;
  chrome.storage.local.set({
    CONF: bg.CONF
  });
});