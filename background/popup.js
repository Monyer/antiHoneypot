/**
 * 获取当前窗口的选项卡
 * @param {*} callback 
 */
function getCurrentTab(callback) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    if (callback) {
      callback(tabs.length ? tabs[0] : null);
      if (!tabs[0].id) {
        console("getCurrentTab no tabId", tabs);
      }
    }
  });
}

/**
 * 获取当前选项卡的拦截信息（popup调用）
 * @param {*} callback
 */
function getActiveTabInfo(callback) {
  getCurrentTab((tab) => {
    if (tab && GLOBAL.blockTabs[tab.id]) {
      callback(GLOBAL.blockTabs[tab.id]);
    } else {
      callback([]);
    }
  });
}

/**
 * 获取当前网站的开关状态（popup调用）
 * @param {*} callback 
 */
function getSwitchStatus(callback) {
  getCurrentTab((tab) => {
    if (tab) {
      let {
        domain: domain
      } = _getDomain(tab.url);
      if (GLOBAL.exceptDomains.includes(domain)) {
        callback("off");
      } else {
        callback("on");
      }
    }
  });
}

/**
 * 更改对当前网站的开关状态（popup调用）
 * @param {*} callback 
 */
function changeSwitch(callback) {
  getCurrentTab((tab) => {
    if (tab) {
      let {
        domain: domain
      } = _getDomain(tab.url);
      if (GLOBAL.exceptDomains.includes(domain)) {
        delExceptDomain(domain);
        callback("on");
      } else {
        addExceptDomain(domain);
        callback("off");
      }
    }
  });
}