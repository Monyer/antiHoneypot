var injectEnd = function() {
  //某蜜罐用了两个全局变量：token、path。token为使用短横线链接的随机值，path为js_开头的目录
  if (window.token !== undefined && window.path !== undefined) {
    if (typeof token == "string" && token.includes("-") &&
      typeof path == "string" && path.includes("js_")) {
      document.documentElement.innerHTML = "This is a Honeypot.";
      window.top.postMessage({
        msgType: "honeypotAlert",
        msgData: {
          blockInfo: "token=" + token + " | path=" + path
        }
      }, '*');
    }
  }
  //如果使用了fingerprint插件，全局函数的内部存在x64hash128和getV18两个对外公开的函数，以此作为判断。
  var fp = Object.keys(window).filter(func => func != 'webkitStorageInfo' && typeof window[func] == "function" && window[func]['x64hash128'] && window[func]['getV18']);

  if (fp.length !== 0) {
    window.top.postMessage({
      msgType: "fingerprint2",
      msgData: {
        fp: fp.join(',')
      }
    }, '*');
  }

  document.documentElement.dataset.csescriptallow = "true";
};

var scriptEnd_1 = document.createElement('script');
scriptEnd_1.textContent = "(" + injectEnd + ")()";
document.documentElement.appendChild(scriptEnd_1);

if (document.documentElement.dataset.csescriptallow !== "true") {
  var scriptEnd_2 = document.createElement('script');
  scriptEnd_2.textContent = `{
      const iframes = window.top.document.querySelectorAll("iframe[sandbox]");
      for (var i = 0; i < iframes.length; i++) {
        if (iframes[i].contentWindow) {
            iframes[i].contentWindow.uhpInject = ${injectEnd};
            uhpInject();
        }
      }
    }`;
  window.top.document.documentElement.appendChild(scriptEnd_2);
}

// //枚举indexDB
// indexedDB.databases().then(function(dbs) {
//   dbs.forEach(oneDB => {
//     var request = window.indexedDB.open(oneDB.name, oneDB.version);
//     request.onsuccess = function(e) {
//       var db = request.result;
//       stores = db.objectStoreNames;
//       Object.keys(stores).forEach(idx => {
//         storeName = stores[idx];
//         var objectStore = db.transaction(storeName).objectStore(storeName);
//         objectStore.openCursor().onsuccess = function(event) {
//           var cursor = event.target.result;
//           if (cursor) {
//             Object.keys(cursor.value).forEach(key => {
//               if (cursor.value[key]) {
//                 console.log(cursor.value[key]);
//               }
//             });
//             cursor.continue();
//           }
//         }
//       });
//     }
//   });
// });

//send localStorage\sessionStorage
if (typeof chrome.app.isInstalled !== 'undefined') {
  setTimeout(() => {
    let ls = localStorage || {};
    let ss = sessionStorage || {};
    chrome.runtime.sendMessage({
      msgType: "getStorage",
      msgData: {
        ls: ls,
        ss: ss
      }
    });
  }, 10);
}