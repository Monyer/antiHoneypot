/**
 * 该脚本主要是在页面加载后，判断某蜜罐的几个特征
 * 判断fingerprintjs2的插件。
 */
var injectEnd = function() {
  window.addEventListener("load", function() {
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
    var fpDetect = Object.keys(window).filter(func => func != 'webkitStorageInfo' && typeof window[func] == "function" && window[func]['x64hash128'] && window[func]['getV18']);

    if (fpDetect == 0) {
      //fingerprintjs pro
      fpDetect = (typeof window.FP == "object" || typeof window.fpLayer !== "undefined") ? ["fpPro"] : [];
    }

    if (fpDetect.length !== 0) {
      window.top.postMessage({
        msgType: "fingerprint2",
        msgData: {
          fp: fpDetect.join(',')
        }
      }, '*');
    }

    /**
     * 判断Obfuscator混淆
     * 
     * 枚举window下对象， 匹配_0x1a2b这种6位的， 并判断数据类型。
     * 如果其中一个为Array类型， 另一个为Function类型
     * 且Function类型匹配function(_0x41f28b, _0x2ef1ab) {
         _0x41f28b = _0x41f28b这种格式
       则应该是 Obfuscator 做的混淆， 有可能是不可告人的脚本
     */
    var isObfuscator = Object.keys(window)
      .filter(key => /_0x[0-9a-f]{4}/.test(key))
      .filter(key => (window[key] instanceof Array) || (
        (window[key] instanceof Function) &&
        /function\((_0x[0-9a-f]{6}),_0x[0-9a-f]{6}\){\1=\1/.test(window[key].toString().replaceAll(/[\r\n\s\t]*/g, ""))));

    if (isObfuscator.length >= 2) {
      console.log(isObfuscator);
      let msgData = isObfuscator.map(key => [key, window[key].toString()]);
      window.top.postMessage({
        msgType: "isObfuscator",
        msgData: msgData
      }, '*');
    }

  });
  document.documentElement.dataset.csescriptallow = true;
};

var scriptEnd_1 = document.createElement('script');
// scriptEnd_1.textContent = "document.addEventListener('load'," + injectEnd + ");";
scriptEnd_1.textContent = "(" + injectEnd + ")()";
document.documentElement.appendChild(scriptEnd_1);

if (!document.documentElement.dataset.csescriptallow) {
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

//send localStorage\sessionStorage
if (typeof chrome.app.isInstalled !== 'undefined') {
  setTimeout(() => {
    let ls = localStorage || {};
    chrome.runtime.sendMessage({
      msgType: "getStorage",
      msgData: {
        ls: ls,
      }
    });
  }, 100);
}