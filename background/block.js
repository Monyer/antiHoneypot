/**
 * 设置block信息到全局变量，并改变icon状态
 * @param {number} tabId 
 * @param {string} blockUrl 
 * @param {string} blockReason 
 * @param {string} blockInfo 
 */
function setBlockInfo(tabId, blockUrl, blockReason, blockInfo) {
  if (!GLOBAL.blockTabs[tabId]) {
    GLOBAL.blockTabs[tabId] = [];
  }
  GLOBAL.blockTabs[tabId].push({
    "blockUrl": blockUrl,
    "blockReason": blockReason,
    "blockInfo": blockInfo
  });
  getCurrentTab((tab) => {
    if (tab && tab.id == tabId) {
      setIconStatus(tabId);
    }
  });
}

/**
 * 放行安全的请求
 * @param {object} details 
 */
function _greenLight(details) {
  //不拦截对扩展的请求
  if (details.url.includes("chrome-extension://")) {
    return true;
  }
  //所有类型："main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", or "other"
  //有风险的类型：sub_frame、script
  //不拦截的请求类型
  if (['main_frame', 'stylesheet', 'image', 'font', 'media'].includes(details.type)) {
    return true;
  }
  //没有发起人情况，暂时先放行，视情况而定
  if (details.initiator == undefined) {
    console.log("initiator undefined", details);
    return true;
  }

  //获取发起人和请求的URL的域名和顶级域名
  let {
    topDomain: initiatorTopDomain
  } = _getDomain(details.initiator);

  let {
    topDomain: urlTopDomain,
    domain: urlDomain
  } = _getDomain(details.url);
  //域名相同不拦截，顶级域名相同不拦截。
  if (initiatorTopDomain == urlTopDomain) {
    return true;
  }
  let whiteDomains = ['translate.googleapis.com'];
  if (whiteDomains.includes(urlDomain)) {
    return true;
  }

}

/**
 * 判断content字符串中是否含有keywords中的关键词，返回true并添加拦截信息
 * @param {string} content 
 * @param {string[]} keywords 
 * @param {string} summary 
 * @param {object} details 
 */
function blockKeywords(content, keywords, summary, details) {
  let includesKeywords = (content, keywords) => keywords.filter(keyword => content.toLowerCase().includes(keyword));
  let blockInfo = includesKeywords(content, keywords);
  if (blockInfo.length !== 0) {
    setBlockInfo(details.tabId, details.url, summary, blockInfo.join(','));
    return true;
  }
  return false;
}

/**
 * 移除requestHeaders中的Cookie字段
 * @param {*} details 
 */
function _removeCookie(details) {
  for (var i = 0; i < details.requestHeaders.length; ++i) {
    if (details.requestHeaders[i].name.toLowerCase() === 'cookie') {
      details.requestHeaders.splice(i, 1);
      break;
    }
  }
  return {
    requestHeaders: details.requestHeaders
  };
}

/**
 * 移除responseHeaders中的set-cookie
 * @param {*} details 
 */
function _removeSetCookie(details) {
  for (var i = 0; i < details.responseHeaders.length; ++i) {
    if (details.responseHeaders[i].name.toLowerCase() === 'set-cookie') {
      details.responseHeaders.splice(i, 1);
      break;
    }
  }
  return {
    responseHeaders: details.responseHeaders
  };
}

/**
 * 判断请求URL是否在黑名单中
 * @param {*} details 
 */
function _checkIfUrlBlack(details) {
  var url = details.url.toLowerCase();
  let {
    domain: urlDomain
  } = _getDomain(url);
  //TODO:可以增加一个规则，如果没有Cookie字段则放行。
  //   console.log(details);

  //ban掉URL中所有打中关键词。
  if (['script', 'xmlhttprequest', 'sub_frame'].includes(details.type)) {

    //ban掉蜜罐中出现过的jsonp域名
    let blackJsonpDomain = ['comment.api.163.com', 'now.qq.com', 'node.video.qq.com', 'passport.game.renren.com', 'wap.sogou.com', 'v2.sohu.com', 'login.sina.com.cn', 'm.iask.sina.com.cn', 'bbs.zhibo8.cc', 'appscan.360.cn', 'wz.cnblogs.com', 'api.csdn.net', 'so.v.ifeng.com', 'api-live.iqiyi.com', 'account.itpub.net', 'm.mi.com', 'hudong.vip.youku.com', 'home.51cto.com', 'passport.baidu.com', 'baike.baidu.com', 'zhifu.duxiaoman.com', 'zhifu.baidu.com', 'chinaunix.net', 'www.cndns.com', 'remind.hupu.com', 'api.m.jd.com', 'passport.tianya.cn', 'my.zol.com.cn', 'account.cnblogs.com', 'pcw-api.iqiyi.com', 'stadig.ifeng.com', 'account.xiaomi.com', 'cmstool.youku.com', 'api.ip.sb', 'log.mmstat.com', 's1.mi.com', 'fourier.taobao.com', 'cndns.com', 'sitestar.cn', 'tie.163.com', 'musicapi.taihe.com', 'databack.dangdang.com', 'accounts.ctrip.com'];
    if (blockKeywords(urlDomain, blackJsonpDomain, "black jsonp domain", details)) {
      return true;
    }
    //ban掉其他危险的域名，譬如统计网站。对于防追踪，用一些adblock插件会更全一些，效果更哈奥
    let blackOtherDomain = ['hm.baidu.com', 'cnzz.com', '51.la', 'google-analytics.com', 'googletagservices.com'];
    if (blockKeywords(urlDomain, blackOtherDomain, "danger domain", details)) {
      return true;
    }

    let blackUriKeywords = ['.json', 'jsonp'];
    if ("误杀比较严重，先屏蔽" === false &&
      blockKeywords(url.split("?").slice(0, 1).join('?'), blackUriKeywords, "black url keyword", details)) {
      return true;
    }

    let blackQueryKeyWords = ["callback", "jsonp", "token=", "=json", "json=", "=jquery", "js_token", "window.name", "eval("];
    if (blockKeywords(url.split("?").slice(1).join('?'), blackQueryKeyWords, "black query keyword", details)) {
      return true;
    }
  }
  return false;
}

/**
 * 按照domain、uri和querystring进行拦截
 * @param {object} details 
 * @todo 一种思路：可以parse query string，获取所有value，然后去tab页面判断value===undefined是否成立
 */
function beforeSendHeaders(details) {
  var url = details.url.toLowerCase();
  //   console.log(details);
  const cancel = {
    cancel: true
  };
  //获取请求的网站域名
  let {
    domain: urlDomain
  } = _getDomain(url);
  let {
    domain: initiatorDomain
  } = _getDomain(details.initiator);

  //如果是排除的白名单域名，则放行
  if (GLOBAL.exceptDomains.includes(initiatorDomain)) {
    return;
  }
  //如果域名是honeypot的域名（通过content-script传递过来的），则所有相关请求全部阻断掉
  if (GLOBAL.honeypotDomains.includes(urlDomain) ||
    GLOBAL.honeypotDomains.includes(initiatorDomain)) {
    setBlockInfo(details.tabId, url, "honeypot block all", [initiatorDomain, urlDomain]);
    return cancel;
  }
  //拦截URI关键词，这几个关键词是蜜罐特有的。
  //swfobject-2.2.min.js：flash反正没啥用，先干掉，以后再说
  const mainFrameUrlBlackKeywords = ['func-sns.php', 'immortal_etag.php', 'immortal_cache.php', 'immortal_png.php', 'immortal.js', 'swfobject-2.2.min.js'];
  if (blockKeywords(url.split('?').slice(0, 1).join(), mainFrameUrlBlackKeywords,
      "main_frame url black keywords", details)) {
    addHoneypotDomain(initiatorDomain);
    return cancel;
  }
  //放行无危险的请求类型，放行与发起人同网站的请求
  if (_greenLight(details) === true) {
    return;
  }
  //ban掉URL中所有打中关键词。
  if (_checkIfUrlBlack(details)) {
    if (CONF.doNotBlockButRemoveCookie) {
      return _removeCookie(details);
    } else {
      return cancel;
    }
  }

}

/**
 * 在收到服务器端header后，按照header头信息进行拦截
 * @param {object} details 
 */
function headersReceived(details) {
  //   return;
  const cancel = {
    cancel: true
  };
  let {
    domain: initiatorDomain
  } = _getDomain(details.initiator);

  //如果是排除的域名，则放行
  if (GLOBAL.exceptDomains.includes(initiatorDomain)) {
    return;
  }

  let getHeader = headerKey => details.responseHeaders.filter(header => header.name.toLowerCase() == headerKey);
  //某蜜罐服务器的Server字段特征
  let headerServerBlackKeywords = ['*****'];
  let headerServer = getHeader('server');
  if (headerServer.length !== 0 &&
    blockKeywords(headerServer[0].value, headerServerBlackKeywords, "black header[server]", details)
  ) {
    return cancel;
  }
  //根据请求类型、发起人情况放行
  if (_greenLight(details) === true) {
    return;
  }

  //ban掉URL中所有打中关键词。
  if (_checkIfUrlBlack(details)) {
    if (CONF.doNotBlockButRemoveCookie) {
      return _removeSetCookie(details);
    } else {
      return cancel;
    }
  }

  //如果顶级域名不一致，又是以script方式加载，type为json的那么是jsonp，type为text/html的那么是动态生成的js。
  if ("误杀太严重，暂时屏蔽" === 0 && ['script', 'xmlhttprequest'].includes(details.type)) {
    let poweredBy = getHeader('x-powered-by');
    if (poweredBy.length !== 0) {
      setBlockInfo(details.tabId, details.url, "black header[x-powered-by]", "x-powered-by");
      if (CONF.doNotBlockButRemoveCookie) {
        return _removeSetCookie(details);
      } else {
        return cancel;
      }
    }

    let contentType = getHeader('content-type');
    let contentTypeBlackKeywords = ['json', 'text/html'];
    if (contentType.length !== 0 &&
      blockKeywords(contentType[0].value, contentTypeBlackKeywords, "black header[content-type]", details)
    ) {
      if (CONF.doNotBlockButRemoveCookie) {
        return _removeSetCookie(details);
      } else {
        return cancel;
      }
    }
  }

}

//设置监听器于Header发送开始前
chrome.webRequest.onBeforeSendHeaders.addListener(
  beforeSendHeaders, {
    urls: ["<all_urls>"]
  }, ['blocking', 'extraHeaders', 'requestHeaders']
);

//设置监听器于服务器端header发送后，body发送之前
chrome.webRequest.onHeadersReceived.addListener(
  headersReceived, {
    urls: ['<all_urls>']
  }, ['blocking', 'extraHeaders', 'responseHeaders']
);