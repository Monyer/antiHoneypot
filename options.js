var bg = chrome.extension.getBackgroundPage();

var ConfOptions = {
  sameIdMinLength: {
    "label": "识别追踪字符串的最小长度",
    "type": "number",
    "min": 1,
    "max": 256
  },
  sameIdAlert: {
    "label": "是否对跟踪标识进行通知",
    "type": "checkbox"
  },
  openDatabaseAlert: {
    "label": "是否对openDatabase进行通知",
    "type": "checkbox"
  },
  indexedDBAlert: {
    "label": "是否对indexDB进行通知",
    "type": "checkbox"
  },
  fingerPrintAlert: {
    "label": "是否对疑似的获取指纹标识进行通知",
    "type": "checkbox"
  },
  getClipboardAlert: {
    "label": "是否对获取剪切板行为进行通知",
    "type": "checkbox"
  },
  doNotBlockButRemoveCookie: {
    "label": "不进行阻断，只移除请求中的Cookie",
    "type": "checkbox"
  },
};

Object.keys(bg.CONF).forEach(key => {
  var option_div = document.createElement("div");

  var label = document.createElement("label");
  label.innerHTML = ConfOptions[key].label;
  label.setAttribute("for", key);
  option_div.appendChild(label);

  var input = document.createElement("input");
  input.id = key;
  input.name = key;
  input.type = ConfOptions[key].type;
  if (input.type == "number") {
    input.min = ConfOptions[key].min;
    input.max = ConfOptions[key].max;
    input.value = bg.CONF[key];
  }
  if (input.type == "checkbox") {
    input.checked = bg.CONF[key] == true ? "checked" : "";
  }

  input.addEventListener("change", function() {
    bg.CONF[this.id] = (this.type == "checkbox" || this.type == "radio") ? this.checked : this.value;
    chrome.storage.local.set({
      CONF: bg.CONF
    });
  });

  option_div.appendChild(input);
  document.body.appendChild(option_div);
});