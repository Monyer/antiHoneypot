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
  var color = (status == "off") ? "black" : "red";
  document.querySelector("#power-switch").style.color = color;
});

//放行按钮点击事件监听
document.querySelector("#power-switch").addEventListener("click", function() {
  bg.changeSwitch(status => {
    var color = (status == "off") ? "black" : "red";
    document.querySelector("#power-switch").style.color = color;
  });
});

//清除当前网站的所有浏览器数据
document.getElementById("clear-data").addEventListener("click", function() {
  if (!confirm("是否要清除当前网站的所有浏览器数据（包括所有缓存的、存储的）？\n\n" +
      "注意：整个清除过程大概需要10-30秒，请不管关闭当前弹出窗口直至弹出“清除完成”的警告框！")) {
    return;
  }
  //这是一个很挫，但是很能给人心理安慰的旋转，嘿嘿！
  document.getElementById("clear-data").classList.add("fa-spin")
  bg.removeBrowsingData(function() {
    document.getElementById("clear-data").classList.remove("fa-spin");
    alert("所有的当前网站浏览器数据（包括所有缓存的、存储的）均已清除。");
  });
});