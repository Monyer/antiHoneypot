// var background = (function () {
//   var tmp = {};
//   chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     for (var id in tmp) {
//       if (tmp[id] && (typeof tmp[id] === "function")) {
//         if (request.path === 'background-to-page') {
//           if (request.method === id) tmp[id](request.data);
//         }
//       }
//     }
//   });
//   /*  */
//   return {
//     "receive": function (id, callback) {tmp[id] = callback},
//     "send": function (id, data) {chrome.runtime.sendMessage({"path": 'page-to-background', "method": id, "data": data})}
//   }
// })();

var injectFont = function() {
  var rand = {
    "noise": function() {
      var SIGN = Math.random() < Math.random() ? -1 : 1;
      return Math.floor(Math.random() + SIGN * Math.random());
    },
    "sign": function() {
      const tmp = [-1, -1, -1, -1, -1, -1, +1, -1, -1, -1];
      const index = Math.floor(Math.random() * tmp.length);
      return tmp[index];
    }
  };
  //
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    get() {
      const height = Math.floor(this.getBoundingClientRect().height);
      const valid = height && rand.sign() === 1;
      const result = valid ? height + rand.noise() : height;
      //
      if (valid && result !== height) {
        window.top.postMessage("font-fingerprint-defender-alert", '*');
      }
      //
      return result;
    }
  });
  //
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    get() {
      const width = Math.floor(this.getBoundingClientRect().width);
      const valid = width && rand.sign() === 1;
      const result = valid ? width + rand.noise() : width;
      //
      if (valid && result !== width) {
        window.top.postMessage("font-fingerprint-defender-alert", '*');
      }
      //
      return result;
    }
  });
  //
  document.documentElement.dataset.fbscriptallow = true;
};

var scriptFont_1 = document.createElement('script');
scriptFont_1.textContent = "(" + injectFont + ")()";
document.documentElement.appendChild(scriptFont_1);

if (document.documentElement.dataset.fbscriptallow !== "true") {
  var scriptFont_2 = document.createElement('script');
  scriptFont_2.textContent = `{
    const iframes = window.top.document.querySelectorAll("iframe[sandbox]");
    for (var i = 0; i < iframes.length; i++) {
      if (iframes[i].contentWindow) {
        if (iframes[i].contentWindow.HTMLElement) {
          iframes[i].contentWindow.HTMLElement.prototype.offsetWidth = HTMLElement.prototype.offsetWidth;
          iframes[i].contentWindow.HTMLElement.prototype.offsetHeight = HTMLElement.prototype.offsetHeight;
        }
      }
    }
  }`;
  //
  window.top.document.documentElement.appendChild(scriptFont_2);
}


window.addEventListener("message", function(e) {
  if (e.data && e.data === "webgl-fingerprint-defender-alert" &&
    typeof chrome.app.isInstalled !== 'undefined') {
    chrome.runtime.sendMessage({
      "fingerprint": 'font'
    });
  }
}, false);