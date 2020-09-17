window.addEventListener("message", function(e) {
  if (!e.data || !e.data.msgType || typeof chrome.app.isInstalled == 'undefined') {
    return;
  }
  chrome.runtime.sendMessage({
    msgType: e.data.msgType,
    msgData: e.data.msgData
  });
});