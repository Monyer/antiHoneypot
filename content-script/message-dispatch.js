window.addEventListener("message", function(e) {
  if (!e.data || !e.data.msgType || !chrome.app || typeof chrome.app.isInstalled == 'undefined') {
    return;
  }
  if (e.data.msgType == "indexedDB") {
    let ls = localStorage || {};
    e.data.msgData.ls = ls;
  }
  try{
      chrome.runtime.sendMessage({
        msgType: e.data.msgType,
        msgData: e.data.msgData
      });
  }catch($e){
    console.log(e.data.msgData);
  }
});