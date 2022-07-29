var GLOBAL = {
  sameIds: {}, //用于存储一些网站的跟踪标识
  fingerPrints: {}, //临时存储攫取指纹的种类，超过一定量触发报警
  blockTabs: {}, //临时存储被阻断的链接信息
  honeypotDomains: [], //用于存储确定是蜜罐的域名
  exceptDomains: [], //用于存储白名单域名
  needCheckRequest: {}, //用于临时存储需要再次请求的RequestBody
};

var initGLOBAL = () => {
    GLOBAL = {
    sameIds: {}, //用于存储一些网站的跟踪标识
    fingerPrints: {}, //临时存储攫取指纹的种类，超过一定量触发报警
    blockTabs: {}, //临时存储被阻断的链接信息
    honeypotDomains: [], //用于存储确定是蜜罐的域名
    exceptDomains: [], //用于存储白名单域名
    needCheckRequest: {}, //用于临时存储需要再次请求的RequestBody
    };
}

//从storage中读取并写入全局变量honeypotDomains
chrome.storage.local.get({
  honeypotDomains: []
}, function(items) {
  GLOBAL.honeypotDomains = items.honeypotDomains;
});

var addHoneypotDomain = (domain) => {
  GLOBAL.honeypotDomains.push(domain);
  chrome.storage.local.set({
    honeypotDomains: GLOBAL.honeypotDomains
  });
};

var clearHoneypotDomain = () => {
  GLOBAL.honeypotDomains = [];
  chrome.storage.local.set({
    honeypotDomains: GLOBAL.honeypotDomains
  });
};

//从storage中读取并写入全局变量exceptDomains
chrome.storage.local.get({
  exceptDomains: []
}, function(items) {
  GLOBAL.exceptDomains = items.exceptDomains;
});

var addExceptDomain = (domain) => {
  GLOBAL.exceptDomains.push(domain);
  chrome.storage.local.set({
    exceptDomains: GLOBAL.exceptDomains
  });
};

var delExceptDomain = (domain) => {
  GLOBAL.exceptDomains.splice(GLOBAL.exceptDomains.indexOf(domain), 1);
  chrome.storage.local.set({
    exceptDomains: GLOBAL.exceptDomains
  });
};