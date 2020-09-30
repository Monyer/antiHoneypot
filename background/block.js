/**
 * 放行安全的请求
 * @param {object} details 
 */
function _greenLight(details) {
  //不拦截的请求类型
  if (KEYWORDLIST.whiteType.includes(details.type)) {
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
  if (KEYWORDLIST.whiteXssiDomains.includes(urlDomain)) {
    return true;
  }
}

/**
 * 通过二次发送请求
 * @param {*} details 
 */
function _checkInHttpBody(details, needCheckRequest) {
  //   console.log(details);
  //   console.log(needCheckRequest);
  var addition = {};
  //method
  if (details.method !== undefined) {
    addition.method = details.method;
  }
  //post data
  if (needCheckRequest.requestBody) {
    let formData = needCheckRequest.requestBody.formData;
    let body = "";
    Object.keys(formData).forEach(key => {
      formData[key].forEach(vals => {
        body += encodeURIComponent(key) + "=" + encodeURIComponent(vals) + "&";
      });
    });
    addition.body = body;
  }
  //refer
  //   let getHeader = headerKey => details.requestHeaders.filter(header => header.name == headerKey);
  //   let referer = getHeader("Referer") ? getHeader("Referer")[0].value : details.initiator;
  //   //   addition.referrer = referer;
  //   addition.referrerPolicy = "origin";

  //headers
  if (details.requestHeaders) {
    let headers = {};
    details.requestHeaders.forEach(header => headers[header.name] = header.value);
    addition.headers = headers
  }
  //   console.log(addition);
  fetch(details.url, addition).then(data => data.text()).then(body => {
    // console.log(body);
    let isBlack = needCheckRequest.blackKeywords.filter(keyword => body.includes(keyword));
    if (isBlack.sort().toString() === needCheckRequest.blackKeywords.sort().toString()) {
      //获取请求的网站域名
      let {
        domain: urlDomain
      } = _getDomain(details.url.toLowerCase());

      let msg = "此站被识别为[" + needCheckRequest.honeypotName + "]蜜罐，将予以屏蔽。";
      sendNotice(details.tabId, details.url, "蜜罐深度检测", msg);

      addHoneypotDomain(urlDomain);
    }
  }).catch(e => {});

}

function _checkIfHoneypot(details) {
  var url = details.url.toLowerCase();
  //拦截URI关键词，这几个关键词是蜜罐特有的。
  if (blockKeywords(url.split('?').slice(0, 1).join(), KEYWORDLIST.honeypotUri,
      "main_frame url black keywords", details)) {
    return true;
  }

  //蜜罐特征深度检测，获取postbody等待二次请求，
  KEYWORDLIST.honeypotTraits.forEach(suspect => {
    if (details.url.includes(suspect.urlKeyword)) {
      GLOBAL.needCheckRequest[details.requestId] = {
        requestBody: details.requestBody || false,
        blackKeywords: suspect.blackKeywords,
        honeypotName: suspect.honeypotName,
      };
    }
  });
  return false;
}

/**
 * 去除http header中的特定字段
 * @param {*} headers 
 * @param {*} key 
 */
function _removeHeaderItem(headers, key) {
  for (var i = 0; i < headers.length; ++i) {
    if (headers[i].name.toLowerCase() === key.toLowerCase()) {
      headers.splice(i, 1);
      break;
    }
  }
  return headers;
}

/**
 * 判断请求URL是否在黑名单中
 * @param {*} details 
 */
function _checkIfUrlBlack(details) {
  var url = details.url.toLowerCase();
  let {
    domain: urlDomain,
  } = _getDomain(url);
  //TODO:可以尝试增加一个规则，如果没有Cookie字段则放行。

  //ban掉URL中所有打中关键词。
  if (KEYWORDLIST.xssiType.includes(details.type)) {
    //ban掉蜜罐中出现过的jsonp域名
    if (blockKeywords(urlDomain, KEYWORDLIST.blackXssiDomain, "jsonp域名黑名单", details)) {
      return true;
    }
    //ban掉其他危险的域名，譬如统计网站。对于防追踪，用一些adblock插件会更全一些，效果更哈奥
    if (blockKeywords(urlDomain, KEYWORDLIST.blackOtherXssiDomain, "其他域名黑名单", details)) {
      return true;
    }
    //ban掉URI部分中的关键词。
    if (blockKeywords(url.split("?").slice(0, 1).join('?'), KEYWORDLIST.blackXssiUriKeywords, "URI关键字黑名单", details)) {
      return true;
    }
    //ban掉Query部分中的关键词
    if (blockKeywords(url.split("?").slice(1).join('?'), KEYWORDLIST.blackXssiQueryKeyWords, "Query关键字黑名单", details)) {
      return true;
    }
  }
  return false;
}

/**
 * 在请求发起前
 * @param {*} details 
 */
function beforeRequest(details) {
  //不拦截对扩展的请求
  if ((details.url && details.url.includes("chrome-extension://")) ||
    (details.initiator && details.initiator.includes("chrome-extension://"))
  ) {
    return;
  }
  var url = details.url.toLowerCase();
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
  if (GLOBAL.exceptDomains.includes(initiatorDomain) ||
    GLOBAL.exceptDomains.includes(urlDomain)) {
    return;
  }

  //如果域名是honeypot的域名，则所有相关请求全部阻断掉
  if (GLOBAL.honeypotDomains.includes(urlDomain) ||
    GLOBAL.honeypotDomains.includes(initiatorDomain)) {

    if (CONF.blockHoneypotDomain) {
      //提示并拦截
      let msg = "请注意，本域名已被识别为蜜罐，将会拦截所有请求：[发起者：" +
        initiatorDomain + ", 请求域名：" + urlDomain;
      sendNotice(details.tabId, url, "蜜罐域名阻断", msg);
      return cancel;
    } else {
      //只提示不拦截
      setBlockInfo(details.tabId, url, "蜜罐域名阻断", [initiatorDomain, urlDomain]);
      return;
    }
  }

  //检测是不是蜜罐，通过URL关键词，以及二次请求body中的内容关键词，需要放在_greenLight之前
  if (_checkIfHoneypot(details)) {
    addHoneypotDomain(urlDomain);
    addHoneypotDomain(initiatorDomain);
    return cancel;
  }

  //放行无危险的请求类型，放行与发起人同网站的请求
  if (_greenLight(details) === true) {
    return;
  }

  //主要通过URL的关键词来检测是否是XSSI。
  if (_checkIfUrlBlack(details)) {
    return cancel;
  }

}

/**
 * 按照domain、uri和querystring进行拦截
 * @param {object} details 
 * @todo 一种思路：可以parse query string，获取所有value，然后去tab页面判断value===undefined是否成立
 */
function beforeSendHeaders(details) {
  //不拦截对扩展的请求
  if ((details.url && details.url.includes("chrome-extension://")) ||
    (details.initiator && details.initiator.includes("chrome-extension://"))
  ) {
    return;
  }
  //检测是不是蜜罐，通过二次请求body中的内容关键词
  if (GLOBAL.needCheckRequest[details.requestId]) {
    //异步请求
    _checkInHttpBody(details, GLOBAL.needCheckRequest[details.requestId]);
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

  let getHeader = headerKey => details.responseHeaders.filter(
    header => header.name.toLowerCase() == headerKey.toLowerCase()
  );
  //某蜜罐服务器的Server字段特征
  //   let headerServerBlackKeywords = ['*****'];
  //   let headerServer = getHeader('server');
  //   if (headerServer.length !== 0 &&
  //     blockKeywords(headerServer[0].value, headerServerBlackKeywords, "black header[server]", details)
  //   ) {
  //     return cancel;
  //   }

}


//设置监听器于Header发送开始前，主要用于缓存requestBody
chrome.webRequest.onBeforeRequest.addListener(
  beforeRequest, {
    urls: ["<all_urls>"]
  }, ['blocking', 'extraHeaders', 'requestBody']
);

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