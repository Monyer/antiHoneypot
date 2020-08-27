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