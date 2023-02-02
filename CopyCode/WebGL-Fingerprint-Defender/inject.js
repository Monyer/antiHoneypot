chrome.storage.local.get(
  {
    exceptDomains: [],
  },
  function (items) {
    if (!items.exceptDomains.includes(document.domain)) {
      var injectWebGL = function () {
        /* Chrome Extension antiHoneypot inject JS for WebGL Fingerprint confuse */
        var config = {
          random: {
            value: function () {
              return Math.random();
            },
            item: function (e) {
              var rand = e.length * config.random.value();
              return e[Math.floor(rand)];
            },
            array: function (e) {
              var rand = config.random.item(e);
              return new Int32Array([rand, rand]);
            },
            items: function (e, n) {
              var length = e.length;
              var result = new Array(n);
              var taken = new Array(length);
              if (n > length) n = length;
              //
              while (n--) {
                var i = Math.floor(config.random.value() * length);
                result[n] = e[i in taken ? taken[i] : i];
                taken[i] = --length in taken ? taken[length] : length;
              }
              //
              return result;
            },
          },
          spoof: {
            webgl: {
              buffer: function (target) {
                const bufferData = target.prototype.bufferData;
                Object.defineProperty(target.prototype, "bufferData", {
                  value: function () {
                    var index = Math.floor(config.random.value() * 10);
                    var noise =
                      0.1 * config.random.value() * arguments[1][index];
                    arguments[1][index] = arguments[1][index] + noise;
                    window.top.postMessage(
                      {
                        msgType: "fingerprint",
                        msgData: {
                          type: "webgl",
                        },
                      },
                      "*"
                    );
                    //
                    return bufferData.apply(this, arguments);
                  },
                });
              },
              parameter: function (target) {
                const getParameter = target.prototype.getParameter;
                Object.defineProperty(target.prototype, "getParameter", {
                  value: function () {
                    var float32array = new Float32Array([1, 8192]);
                    window.top.postMessage(
                      {
                        msgType: "fingerprint",
                        msgData: {
                          type: "webgl",
                        },
                      },
                      "*"
                    );
                    //
                    if (arguments[0] === 3415) return 0;
                    else if (arguments[0] === 3414) return 24;
                    else if (arguments[0] === 35661)
                      return config.random.items([128, 192, 256]);
                    else if (arguments[0] === 3386)
                      return config.random.array([8192, 16384, 32768]);
                    else if (arguments[0] === 36349 || arguments[0] === 36347)
                      return config.random.item([4096, 8192]);
                    else if (arguments[0] === 34047 || arguments[0] === 34921)
                      return config.random.items([2, 4, 8, 16]);
                    else if (
                      arguments[0] === 7937 ||
                      arguments[0] === 33901 ||
                      arguments[0] === 33902
                    )
                      return float32array;
                    else if (
                      arguments[0] === 34930 ||
                      arguments[0] === 36348 ||
                      arguments[0] === 35660
                    )
                      return config.random.item([16, 32, 64]);
                    else if (
                      arguments[0] === 34076 ||
                      arguments[0] === 34024 ||
                      arguments[0] === 3379
                    )
                      return config.random.item([16384, 32768]);
                    else if (
                      arguments[0] === 3413 ||
                      arguments[0] === 3412 ||
                      arguments[0] === 3411 ||
                      arguments[0] === 3410 ||
                      arguments[0] === 34852
                    )
                      return config.random.item([2, 4, 8, 16]);
                    else
                      return config.random.item([
                        0, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096,
                      ]);
                    //
                    return getParameter.apply(this, arguments);
                  },
                });
              },
            },
          },
        };
        //
        config.spoof.webgl.buffer(WebGLRenderingContext);
        config.spoof.webgl.buffer(WebGL2RenderingContext);
        config.spoof.webgl.parameter(WebGLRenderingContext);
        config.spoof.webgl.parameter(WebGL2RenderingContext);
        //
        document.documentElement.dataset.wgscriptallow = true;
      };

      var scriptWebGL_1 = document.createElement("script");
      scriptWebGL_1.textContent = "(" + injectWebGL + ")()";
      document.documentElement.appendChild(scriptWebGL_1);

      if (!document.documentElement.dataset.wgscriptallow) {
        var scriptWebGL_2 = document.createElement("script");
        scriptWebGL_2.textContent = `{
          const iframes = window.top.document.querySelectorAll("iframe[sandbox]");
          for (var i = 0; i < iframes.length; i++) {
            if (iframes[i].contentWindow) {
              if (iframes[i].contentWindow.WebGLRenderingContext) {
                iframes[i].contentWindow.WebGLRenderingContext.prototype.bufferData = WebGLRenderingContext.prototype.bufferData;
                iframes[i].contentWindow.WebGLRenderingContext.prototype.getParameter = WebGLRenderingContext.prototype.getParameter;
              }
              if (iframes[i].contentWindow.WebGL2RenderingContext) {
                iframes[i].contentWindow.WebGL2RenderingContext.prototype.bufferData = WebGL2RenderingContext.prototype.bufferData;
                iframes[i].contentWindow.WebGL2RenderingContext.prototype.getParameter = WebGL2RenderingContext.prototype.getParameter;
              }
            }
          }
        }`;
        //
        window.top.document.documentElement.appendChild(scriptWebGL_2);
      }
    }
  }
);
