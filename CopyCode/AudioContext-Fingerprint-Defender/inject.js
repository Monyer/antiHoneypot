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

var injectAudio = function() {
  const context = {
    "BUFFER": null,
    "getChannelData": function(e) {
      const getChannelData = e.prototype.getChannelData;
      Object.defineProperty(e.prototype, "getChannelData", {
        "value": function() {
          const results_1 = getChannelData.apply(this, arguments);
          if (context.BUFFER !== results_1) {
            context.BUFFER = results_1;
            window.top.postMessage("audiocontext-fingerprint-defender-alert", '*');
            for (var i = 0; i < results_1.length; i += 100) {
              let index = Math.floor(Math.random() * i);
              results_1[index] = results_1[index] + Math.random() * 0.0000001;
            }
          }
          //
          return results_1;
        }
      });
    },
    "createAnalyser": function(e) {
      const createAnalyser = e.prototype.__proto__.createAnalyser;
      Object.defineProperty(e.prototype.__proto__, "createAnalyser", {
        "value": function() {
          const results_2 = createAnalyser.apply(this, arguments);
          const getFloatFrequencyData = results_2.__proto__.getFloatFrequencyData;
          Object.defineProperty(results_2.__proto__, "getFloatFrequencyData", {
            "value": function() {
              window.top.postMessage("audiocontext-fingerprint-defender-alert", '*');
              const results_3 = getFloatFrequencyData.apply(this, arguments);
              for (var i = 0; i < arguments[0].length; i += 100) {
                let index = Math.floor(Math.random() * i);
                arguments[0][index] = arguments[0][index] + Math.random() * 0.1;
              }
              //
              return results_3;
            }
          });
          //
          return results_2;
        }
      });
    }
  };
  //
  context.getChannelData(AudioBuffer);
  context.createAnalyser(AudioContext);
  context.getChannelData(OfflineAudioContext);
  context.createAnalyser(OfflineAudioContext);
  document.documentElement.dataset.acxscriptallow = true;
};

var scriptAudio_1 = document.createElement('script');
scriptAudio_1.textContent = "(" + injectAudio + ")()";
document.documentElement.appendChild(scriptAudio_1);

if (document.documentElement.dataset.acxscriptallow !== "true") {
  var scriptAudio_2 = document.createElement('script');
  scriptAudio_2.textContent = `{
    const iframes = window.top.document.querySelectorAll("iframe[sandbox]");
    for (var i = 0; i < iframes.length; i++) {
      if (iframes[i].contentWindow) {
        if (iframes[i].contentWindow.AudioBuffer) {
          if (iframes[i].contentWindow.AudioBuffer.prototype) {
            if (iframes[i].contentWindow.AudioBuffer.prototype.getChannelData) {
              iframes[i].contentWindow.AudioBuffer.prototype.getChannelData = AudioBuffer.prototype.getChannelData;
            }
          }
        }

        if (iframes[i].contentWindow.AudioContext) {
          if (iframes[i].contentWindow.AudioContext.prototype) {
            if (iframes[i].contentWindow.AudioContext.prototype.__proto__) {
              if (iframes[i].contentWindow.AudioContext.prototype.__proto__.createAnalyser) {
                iframes[i].contentWindow.AudioContext.prototype.__proto__.createAnalyser = AudioContext.prototype.__proto__.createAnalyser;
              }
            }
          }
        }

        if (iframes[i].contentWindow.OfflineAudioContext) {
          if (iframes[i].contentWindow.OfflineAudioContext.prototype) {
            if (iframes[i].contentWindow.OfflineAudioContext.prototype.__proto__) {
              if (iframes[i].contentWindow.OfflineAudioContext.prototype.__proto__.createAnalyser) {
                iframes[i].contentWindow.OfflineAudioContext.prototype.__proto__.createAnalyser = OfflineAudioContext.prototype.__proto__.createAnalyser;
              }
            }
          }
        }

        if (iframes[i].contentWindow.OfflineAudioContext) {
          if (iframes[i].contentWindow.OfflineAudioContext.prototype) {
            if (iframes[i].contentWindow.OfflineAudioContext.prototype.__proto__) {
              if (iframes[i].contentWindow.OfflineAudioContext.prototype.__proto__.getChannelData) {
                iframes[i].contentWindow.OfflineAudioContext.prototype.__proto__.getChannelData = OfflineAudioContext.prototype.__proto__.getChannelData;
              }
            }
          }
        }
      }
    }
  }`;
  window.top.document.documentElement.appendChild(scriptAudio_2);
}

window.addEventListener("message", function(e) {
  if (e.data && e.data === "audiocontext-fingerprint-defender-alert" &&
    typeof chrome.app.isInstalled !== 'undefined') {
    chrome.runtime.sendMessage({
      "fingerprint": 'audio'
    });
  }
}, false);