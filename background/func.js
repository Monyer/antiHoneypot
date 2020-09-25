/**
 * 获取域名和顶级域名
 * @param {string} url 
 * @returns {object} {domain: domainVar, topDomain: topDomainVar}
 */
function _getDomain(url) {
  var ret = {
    "domain": "",
    "topDomain": ""
  };
  const domainRegex = /\:\/\/([^/]+)/i;
  if (url == undefined || !url.match(domainRegex)) {
    return ret;
  } else {
    ret.domain = url.match(domainRegex)[1].toLowerCase();
  }
  //非单一后缀的域名进行一下替换
  const multisuffix_regex = /(com.cn|net.cn|org.cn)$/i;
  var domainPrepare = ret.domain.replace(multisuffix_regex, match => match.replace(".", "_"));
  //匹配IP
  const ip_regex = /(\d{0,3}\.){3}\d{0,3}/i;
  var matchIp = domainPrepare.match(ip_regex);
  if (matchIp) {
    ret.topDomain = matchIp[0];
  }
  //匹配顶级域名
  const topDomainRegex = /[^\.]+\.[^\.]+?$/i;
  var matchTopDomain = domainPrepare.match(topDomainRegex);
  if (!matchTopDomain) {
    ret.topDomain = ret.domain;
    return ret;
  }
  ret.topDomain = matchTopDomain[0];
  return ret;
}

/**
 * 向浏览器发送通知
 * @param {*} msg 
 */
function sendNotifaction(msg) {
  chrome.notifications.create(null, {
    type: 'basic',
    iconUrl: 'icon/icon128.png',
    title: 'AntiHoneypot提醒',
    message: msg
  });
}

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