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
  if (e.data && e.data === "openDatabase-alert" &&
    typeof chrome.app.isInstalled !== 'undefined') {
    chrome.runtime.sendMessage({
      "openDatabase": true
    });
  }
  if (e.data && e.data === "indexedDB-alert" &&
    typeof chrome.app.isInstalled !== 'undefined') {
    chrome.runtime.sendMessage({
      "indexedDB": true
    });
  }
}, false);