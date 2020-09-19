/**
 * 比对两个数组中是否有相同的值，
 * @param {string[]} sVals - 原字符串数组
 * @param {string[]} tVals - 目标字符串数组
 * @param {string} domain
 */
function sameIdCompare(sVals, tVals, domain) {
  var ids = sVals.filter(sVal => tVals.includes(sVal) || Object.keys(GLOBAL.sameIds).includes(sVal));
  for (let i = 0; i < ids.length; i++) {
    //如果值的长度太短了，则可能不是evercookie
    if (ids[i].length < CONF.sameIdMinLength) {
      continue;
    }
    if (!Object.keys(GLOBAL.sameIds).includes(ids[i])) {
      GLOBAL.sameIds[ids[i]] = [];
    }
    if (!GLOBAL.sameIds[ids[i]].includes(domain)) {
      GLOBAL.sameIds[ids[i]].push(domain);
      if (CONF.sameIdAlert) {
        chrome.notifications.create(null, {
          type: 'basic',
          iconUrl: 'icon/icon128.png',
          title: 'AntiHoneypot提醒',
          message: '这个网站设置了跟踪标识：' +
            domain + "[" + ids[i] + "]"
        });
      }
    }
  }
}

/**
 * 通过分析前端页面中DOM和JS判断蜜罐
 * @param {object} request
 * @param {object} sender
 * @param {object} sendResponse
 */
function onMessageCallback(request, sender, sendResponse) {
  let {
    domain: urlDomain
  } = _getDomain(sender.url);

  //如果是排除的白名单域名，则放行
  if (GLOBAL.exceptDomains.includes(urlDomain)) {
    return;
  }

  //未知消息忽略掉
  if (!request.msgType) {
    return;
  }
  //check evercookie。比较localStorage、cookies，indexedDB是响应式
  if (["getStorage", "indexedDB", 'setlocalStorage'].includes(request.msgType)) {
    setTimeout(function() {
      chrome.cookies.getAll({
        url: sender.url
      }, cos => {
        var co_vals = [];
        cos.forEach(c => co_vals.push(c.value));
        ls_vals = Object.values(request.msgData.ls);
        sameIdCompare(co_vals, ls_vals, urlDomain);
        if (request.msgType == "indexedDB") {
          idb_vals = Object.values(request.msgData.idb);
          sameIdCompare(ls_vals, idb_vals, urlDomain);
          sameIdCompare(idb_vals, co_vals, urlDomain);
        }
      });
    }, 1000);
  }

  //content-script-start的消息
  //openDatabase
  if (request.msgType == "openDatabase" && CONF.openDatabaseAlert) {
    let msg = "这个网页调用了openDatabase！";
    setBlockInfo(sender.tab.id, sender.url, "openDatabase hit", msg);
    chrome.notifications.create(null, {
      type: 'basic',
      iconUrl: 'icon/icon128.png',
      title: 'AntiHoneypot提醒',
      message: msg + sender.url
    });
  }

  //getClipboard
  if (request.msgType == "getClipboard" && CONF.getClipboardAlert) {
    let msg = "这个网页调用了剪切板粘贴取值函数！";
    setBlockInfo(sender.tab.id, sender.url, "getClipboard hit", msg);

    chrome.notifications.create(null, {
      type: 'basic',
      iconUrl: 'icon/icon128.png',
      title: '剪切板粘贴取值提醒',
      message: msg + sender.url
    });
  }

  //判断是否被获取指纹，准确度不高，误报挺严重。发现不少网站会调用font、canvas、audio、webgl的相关函数
  if (request.msgType == "fingerprint" && GLOBAL.fingerPrints[sender.tab.id] !== true) {
    if (!GLOBAL.fingerPrints[sender.tab.id]) {
      GLOBAL.fingerPrints[sender.tab.id] = {};
    }
    var before_len = Object.keys(GLOBAL.fingerPrints[sender.tab.id]).length;
    GLOBAL.fingerPrints[sender.tab.id][request.msgData.type] = true;
    var after_len = Object.keys(GLOBAL.fingerPrints[sender.tab.id]).length;

    if (before_len < 4 && after_len >= 4) {
      setBlockInfo(sender.tab.id, sender.url, "fingerprint hit",
        Object.keys(GLOBAL.fingerPrints[sender.tab.id]));

      if (CONF.fingerPrintAlert) {
        chrome.notifications.create(null, {
          type: 'basic',
          iconUrl: 'icon/icon128.png',
          title: 'AntiHoneypot提醒',
          message: '这个网页有指纹识别功能，请小心！' + sender.url
        });
      }

    }
  }

  //判断fingerPrintJs是否存在，准确率应该挺高
  if (request.msgType == "fingerprint2") {
    setBlockInfo(sender.tab.id, sender.url, "fingerPrintJs hit", request.msgData.fp);
    GLOBAL.fingerPrints[sender.tab.id] = true;

    chrome.notifications.create(null, {
      type: 'basic',
      iconUrl: 'icon/icon128.png',
      title: 'AntiHoneypot提醒',
      message: '这个网页有FingerPrint2指纹识别程序，请小心！' + sender.url
    });
  }

  //如果前端判断是蜜罐，直接后续阻断所有请求
  if (request.msgType == "honeypotAlert" && !GLOBAL.honeypotDomains.includes(urlDomain)) {
    addHoneypotDomain(urlDomain);
    setBlockInfo(sender.tab.id, sender.url, "honeypot frontend hit", request.msgData.blockInfo);
  }
  sendResponse(true);
}


chrome.runtime.onMessage.addListener(onMessageCallback);