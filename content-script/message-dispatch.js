window.addEventListener("message", function(e) {
  if (!e.data || !e.data.msgType || typeof chrome.app.isInstalled == 'undefined') {
    return;
  }
  if (e.data.msgType == "indexedDB") {
    let ls = localStorage || {};
    e.data.msgData.ls = ls;
  }
  chrome.runtime.sendMessage({
    msgType: e.data.msgType,
    msgData: e.data.msgData
  });
});