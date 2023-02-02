/**
 * 该脚本主要是在页面加载后，判断某蜜罐的几个特征
 * 判断fingerprintjs2的插件。
 */
chrome.storage.local.get(
  {
    exceptDomains: [],
  },
  function (items) {
    if (!items.exceptDomains.includes(document.domain)) {
      var injectEnd = function () {
        /* Chrome Extension antiHoneypot inject JS for detect Honeypot */
        window.addEventListener("load", function () {
          /**
           * 默安蜜罐
           *
           * 某蜜罐用了两个全局变量： token、 path。 token为使用短横线链接的随机值， path为js_开头的目录
           */
          if (window.token !== undefined && window.path !== undefined) {
            if (
              typeof token == "string" &&
              token.includes("-") &&
              typeof path == "string" &&
              path.includes("js_")
            ) {
              document.documentElement.innerHTML = "This is a Honeypot.";
              window.top.postMessage(
                {
                  msgType: "honeypotAlert",
                  msgData: {
                    blockInfo: "token=" + token + " | path=" + path,
                  },
                },
                "*"
              );
            }
          }
          /**
           * 识别fingerprint插件
           *
           * 如果使用了fingerprint插件， 全局函数的内部存在x64hash128和getV18两个对外公开的函数， 以此作为判断。
           */
          var fpDetect = Object.keys(window).filter(
            (func) =>
              func != "webkitStorageInfo" &&
              typeof window[func] == "function" &&
              window[func]["x64hash128"] &&
              window[func]["getV18"]
          );

          if (fpDetect == 0) {
            //fingerprintjs pro
            fpDetect =
              typeof window.FP == "object" ||
              typeof window.fpLayer !== "undefined"
                ? ["fpPro"]
                : [];
          }

          if (fpDetect.length !== 0) {
            window.top.postMessage(
              {
                msgType: "fingerprint2",
                msgData: {
                  fp: fpDetect.join(","),
                },
              },
              "*"
            );
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
            .filter((key) => /_0x[0-9a-f]{4}/.test(key))
            .filter(
              (key) =>
                window[key] instanceof Array ||
                (window[key] instanceof Function &&
                  /function\((_0x[0-9a-f]{6}),_0x[0-9a-f]{6}\){\1=\1/.test(
                    window[key].toString().replaceAll(/[\r\n\s\t]*/g, "")
                  ))
            );

          if (isObfuscator.length >= 2) {
            //   console.log(isObfuscator);
            let msgData = isObfuscator.map((key) => [
              key,
              window[key].toString(),
            ]);
            window.top.postMessage(
              {
                msgType: "isObfuscator",
                msgData: msgData,
              },
              "*"
            );
          }

          /**
           * 识别BEEF
           */
          if (
            typeof BeefJS == "object" ||
            typeof beef == "object" ||
            typeof beef_init == "function" ||
            typeof _evercookie_flash_var == "function" ||
            window.name.includes("BEEFHOOK=")
          ) {
            window.top.postMessage(
              {
                msgType: "beefAlert",
                msgData: "",
              },
              "*"
            );
          }

          /**
           * openCanary
           */
          //opencanary
          (function () {
            var isOpenCanary = false;
            if (document.title.includes("Synology RackStation")) {
              var metas = document.getElementsByTagName("meta");
              isOpenCanary = Object.keys(metas).some(
                (idx) =>
                  metas[idx].name == "application-name" &&
                  metas[idx].content.includes("DemoSite")
              );
            }
            if (!isOpenCanary) {
              var h1s = document.getElementsByTagName("h1");
              isOpenCanary =
                h1s.length == 1 && h1s[0].innerText == "Network Storage v5.13";
            }
            if (isOpenCanary) {
              window.top.postMessage(
                {
                  msgType: "opencanary",
                  msgData: "",
                },
                "*"
              );
            }
          })();

          /*
           * HFISH WEB蜜罐识别
           */
          (function () {
            var lists = [
              {
                type: "Gitlab Honeypot",
                title: "Sign in · GitLab",
                selector: "link",
                keyhtml:
                  '<link rel="shortcut icon" type="image/png" href="../../assets/favicon-7901bd695fb93edb07975966062049829afb56cf11511236e61bcf425070e36e.png" id="favicon" data-original-href="/assets/favicon-7901bd695fb93edb07975966062049829afb56cf11511236e61bcf425070e36e.png">',
              },
              {
                type: "IIS Honeypot",
                title: "IIS Windows",
                selector: "link",
                keyhtml: '<link rel="icon" href="data:image/ico;base64,aWNv">',
              },
              {
                type: "Nginx Honeypot",
                title: "Welcome to nginx!",
                selector: "link",
                keyhtml: '<link rel="icon" href="data:;base64,=">',
              },
              {
                type: "IBM WebSphere Honeypot",
                title: "IBM WebSphere Portal - Login",
                selector: "link",
                keyhtml:
                  '<link rel="bookmark" href="/wps/poc/!ut/p/digest!N_5daMHgbyRiOPvt7gua6g/nm/oid:6_CGAH47L00O2V002N5SQ0US30M1" title="Login" hreflang="en">',
              },
              {
                type: "Oracle WebLogic Honeypot",
                title: "Oracle WebLogic Server 管理控制台",
                selector: "link",
                keyhtml:
                  '<link rel="stylesheet" type="text/css" href="./general.css">',
              },
              {
                type: "Coremail Honeypot",
                title: "Coremail邮件系统",
                selector: "link[rel='icon']",
                keyhtml: '<link rel="icon" href="data:image/ico;base64,aWNv">',
              },
              {
                type: "Outlook Honeypot",
                title: "Outlook Web App",
                selector: 'input[name="destination"]',
                keyhtml:
                  '<input type="hidden" name="destination" value="https://owa.yuhong.com.cn/owa">',
              },
              {
                type: "Wordpress Honeypot",
                title: "登录 ‹ 内部管理平台 — WordPress",
                selector: "link[rel='icon']",
                keyhtml: '<link rel="icon" href="data:image/ico;base64,aWNv">',
              },
              {
                type: "通用OA Honeypot",
                title: "OA登录",
                selector: "link[rel='icon']",
                keyhtml: '<link rel="icon" href="data:;base64,=">',
              },
              {
                type: "政务OA Honeypot",
                title: "政务外网OA系统",
                selector: 'input[id="rndData"]',
                keyhtml:
                  '<input type="hidden" id="rndData" name="rndData" value="803350804370334">',
              },
              {
                type: "Jira Honeypot",
                title: "登录 - Jira",
                selector: 'form[class="aui"]',
                keyhtml:
                  '<form action="/login" class="aui" id="login-form" method="post">',
              },
              {
                type: "Confluence Honeypot",
                title: "Log In - Confluence",
                selector: 'form[name="loginform"]',
                keyhtml:
                  '<form name="loginform" method="POST" action="login" class="aui login-form-container">',
              },
              {
                type: "Joomla Honeypot",
                title: "管理后台",
                selector: 'script[type="application/json"]',
                keyhtml: '"csrf.token":"77e3c330efab5aa0b838eb5bab269447"',
              },
              {
                type: "Webmin Honeypot",
                title: "Login to Webmin",
                selector: "form",
                keyhtml:
                  '<form class="form-signin session_login clearfix" action="login" method="post" role="form" onsubmit="spinner()">',
              },
              {
                type: "Nagios Honeypot",
                title: "Login • Nagios Network Analyzer",
                selector: "head",
                keyhtml: "da1b307f592a620a2e59fb6f907bec51",
              },
              {
                type: "Zabbix Honeypot",
                title: "ops center: Zabbix",
                selector: 'meta[name="csrf-token"]',
                keyhtml: '<meta name="csrf-token" content="">',
              },
              {
                type: "Jenkins Honeypot",
                title: "Sign in [Jenkins]",
                selector: "form",
                keyhtml: '<form method="post" name="login" action="login">',
              },
              {
                type: "VMware ESXi Honeypot",
                title: "登录 - VMware ESXi",
                selector: "link[rel='icon']",
                keyhtml: '<link rel="icon" href="data:image/ico;base64,aWNv">',
              },
              {
                type: "锐捷交换机 Honeypot",
                title: "锐捷网络-EWEB网管系统",
                selector: "link[rel='icon']",
                keyhtml: '<link rel="icon" href="data:;base64,=">',
              },
              {
                type: "HFish Honeypot",
                title: "Login",
                selector: "link[rel='icon']",
                keyhtml: '<link rel="icon" href="data:;base64,=">',
              },
              {
                type: "H3C仿真登陆 Honeypot",
                title: "ER3108G系统管理",
                selector: 'link[rel="shortcut icon"]',
                keyhtml: '<link rel="shortcut icon" href="#">',
              },
              {
                type: "群晖NAS Honeypot",
                title: "DSM 6.2 - Synology VirtualDSM",
                selector: 'div[id="sds-login-dialog-title"]',
                keyhtml:
                  '<div ext:qtip="DSM-Host" id="sds-login-dialog-title">DSM-Host</div>',
              },
              {
                type: "HFish Honeypot",
                title: "Login",
                selector: "link[rel='icon']",
                keyhtml: '<link rel="icon" href="data:image/ico;base64,aWNv">',
              },
              {
                type: "JspSpy Honeypot",
                title: "JspSpy Codz By - Ninty",
                selector: 'link[rel="shortcut icon"]',
                keyhtml: '<link rel="shortcut icon" href="#" />',
              },
            ];

            // var a = {
            //     type: "",
            //     title: "",
            //     selector: '',
            //     keyhtml: '',
            // }

            lists.forEach((one) => {
              if (
                document.title.includes(one.title) &&
                document
                  .querySelector(one.selector)
                  .outerHTML.includes(one.keyhtml)
              ) {
                window.top.postMessage(
                  {
                    msgType: "hfish",
                    msgData: one.type,
                  },
                  "*"
                );
              }
            });

            if (
              document.title.includes("Apache Tomcat/8.5.15") &&
              document.getElementsByTagName("link").length == 2
            ) {
              window.top.postMessage(
                {
                  msgType: "hfish",
                  msgData: "Apache Tomcat Honeypot",
                },
                "*"
              );
            }
          })();
        });
        document.documentElement.dataset.csescriptallow = true;
      };

      var scriptEnd_1 = document.createElement("script");
      // scriptEnd_1.textContent = "document.addEventListener('load'," + injectEnd + ");";
      scriptEnd_1.textContent = "(" + injectEnd + ")()";
      document.documentElement.appendChild(scriptEnd_1);

      if (!document.documentElement.dataset.csescriptallow) {
        var scriptEnd_2 = document.createElement("script");
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
      if (typeof chrome.app.isInstalled !== "undefined") {
        setTimeout(() => {
          var ls = {};
          try {
            ls = localStorage;
          } catch (e) {}

          chrome.runtime.sendMessage({
            msgType: "getStorage",
            msgData: {
              ls: ls,
            },
          });
        }, 100);
      }
    }
  }
);
