var injectStart = function() {
  //劫持openDataBase
  const openDb = openDatabase;
  openDatabase = (...args) => {
    window.top.postMessage("openDatabase-alert", '*');
    return openDb(...args);
  }

  //劫持indexedDB
  const idxDbOpen = indexedDB.__proto__.open;
  Object.defineProperty(indexedDB.__proto__, "open", {
    "value": function() {
      window.top.postMessage("indexedDB-alert", '*');
      return idxDbOpen.apply(this, arguments);
    }
  });

  //劫持clipboard的粘贴事件，但是不劫持drop的事件（通过uninitialized，两者都用DataTransfer）
  const dcGetData = DataTransfer.prototype.getData;
  DataTransfer.prototype.getData = function() {
    if (this.effectAllowed == "uninitialized") {
      window.top.postMessage("getClipboard-alert", '*');
    }
    return dcGetData.apply(this, arguments);
  };

  document.documentElement.dataset.odbscriptallow = "true";
};


var scriptStart_1 = document.createElement('script');
scriptStart_1.textContent = "(" + injectStart + ")()";
document.documentElement.appendChild(scriptStart_1);

if (document.documentElement.dataset.odbscriptallow !== "true") {
  var scriptStart_2 = document.createElement('script');
  scriptStart_2.textContent = `{
    const iframes = window.top.document.querySelectorAll("iframe[sandbox]");
    for (var i = 0; i < iframes.length; i++) {
      if (iframes[i].contentWindow) {
        if (iframes[i].contentWindow.openDatabase) {
          iframes[i].contentWindow.openDatabase = openDatabase;
        }
        if (iframes[i].contentWindow.indexedDB) {
          iframes[i].contentWindow.indexedDB.__proto__.open = indexedDB.__proto__.open;
        }  
      }
    }
  }`;
  window.top.document.documentElement.appendChild(scriptStart_2);
}

window.addEventListener("message", function(e) {
  if (e.data && typeof chrome.app.isInstalled !== 'undefined') {
    if (e.data === "openDatabase-alert") {
      chrome.runtime.sendMessage({
        "openDatabase": true
      });
    }
    if (e.data === "indexedDB-alert") {
      chrome.runtime.sendMessage({
        "indexedDB": true
      });
    }
    if (e.data === "getClipboard-alert") {
      chrome.runtime.sendMessage({
        "getClipboard": true
      });
    }

  }

}, false);