/**
 * 填充阻断信息
 * @param {*} blockInfo 
 */
function showBlockInfo(blockInfo) {
  if (blockInfo.length == 0) {
    return;
  }
  var html = "<ol>";
  blockInfo.forEach(info => {
    let blockUrl = info.blockUrl.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html += "<li>";
    html += "<div><span class='reason'>" + info.blockReason + "</span>";
    html += "<span class='keyword'>" + info.blockInfo + "</span></div>";
    html += "<div class='url'>" + blockUrl + "</div>";
    html += "</li>";
    // console.log(info.blockUrl);
  });
  html += "</ol>";
  document.querySelector("#info").innerHTML = html;
}

var bg = chrome.extension.getBackgroundPage();
bg.getActiveTabInfo(showBlockInfo);

//放行按钮状态
bg.getSwitchStatus(status => {
  var icon = "icon/switch-on.png";
  if (status == "off") {
    icon = "icon/switch-off.png";
  }
  document.querySelector("#power-switch").src = icon;
});

//放行按钮点击事件监听
document.querySelector("#power-switch").addEventListener("click", function() {
  bg.changeSwitch(status => {
    var icon = "icon/switch-on.png";
    if (status == "off") {
      icon = "icon/switch-off.png";
    }
    document.querySelector("#power-switch").src = icon;
  });
});