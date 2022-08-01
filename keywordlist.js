var KEYWORDLIST = {};
//所有类型："main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", or "other"
//不拦截的请求类型
KEYWORDLIST.whiteType = ["main_frame", "stylesheet", "image", "font", "media"];
//不拦截跨域调用的域名
KEYWORDLIST.whiteXssiDomains = [
    "127.0.0.1",
    "localhost",
    "translate.googleapis.com",
    "translate.google.cn",
    "fofa.info",
    "gblobscdn.gitbook.com",
];
//需要检查的请求类型
KEYWORDLIST.xssiType = ["script", "xmlhttprequest", "sub_frame"];
//XSSI域名封禁
KEYWORDLIST.blackXssiDomain = [
    "comment.api.163.com",
    "now.qq.com",
    "node.video.qq.com",
    "access.video.qq.com",
    "passport.game.renren.com",
    "wap.sogou.com",
    "v2.sohu.com",
    "login.sina.com.cn",
    "m.iask.sina.com.cn",
    "bbs.zhibo8.cc",
    "appscan.360.cn",
    "wz.cnblogs.com",
    "api.csdn.net",
    "so.v.ifeng.com",
    "api-live.iqiyi.com",
    "account.itpub.net",
    "m.mi.com",
    "hudong.vip.youku.com",
    "home.51cto.com",
    "passport.baidu.com",
    "baike.baidu.com",
    "zhifu.duxiaoman.com",
    "zhifu.baidu.com",
    "chinaunix.net",
    "www.cndns.com",
    "remind.hupu.com",
    "api.m.jd.com",
    "passport.tianya.cn",
    "my.zol.com.cn",
    "account.cnblogs.com",
    "pcw-api.iqiyi.com",
    "stadig.ifeng.com",
    "account.xiaomi.com",
    "cmstool.youku.com",
    "api.ip.sb",
    "log.mmstat.com",
    "s1.mi.com",
    "fourier.taobao.com",
    "cndns.com",
    "sitestar.cn",
    "tie.163.com",
    "musicapi.taihe.com",
    "databack.dangdang.com",
    "accounts.ctrip.com",
    "api.fpjs.io",
    "api.sjpf.io",
    "eu.api.fpjs.io",
    "myjr.suning.com",
    "loginst.suning.com",
    "ajax.58pic.com",
    "www.fhyx.com",
    "so.u17.com",
    "i.vip.iqiyi.com",
    "v-api-plus.huya.com",
    "mapp.jrj.com.cn",
    "www.ixueshu.com",
    "hackit.me",
    "10010.com",
    "h5.verification.jiguang.cn",
    "www.cmpassport.com",
    "opencloud.wostore.cn",
    "static.e.189.cn",
    "id6.me",
];
//ban掉其他危险的域名，譬如统计网站。对于防追踪，用一些adblock插件会更全一些，效果更哈奥
KEYWORDLIST.blackOtherXssiDomain = [
    "hm.baidu.com",
    "cnzz.com",
    "51.la",
    "google-analytics.com",
    "googletagservices.com",
];
//ban掉URI部分中的关键词。
KEYWORDLIST.blackXssiUriKeywords = []; //['.json', 'jsonp'];误报比较严重
//ban掉Query部分中的关键词
KEYWORDLIST.blackXssiQueryKeyWords = [
    "callback",
    "jsonp",
    "token=",
    "=json",
    "json=",
    "=jquery",
    "js_token",
    "window.name",
    "eval(",
];

//蜜罐Uri级别检测
KEYWORDLIST.honeypotUri = [
    "func-sns.php",
    "immortal_etag.php",
    "immortal_cache.php",
    "immortal_png.php",
    "immortal.js",
    "monitordevinfo/common.js",
    "/safeframe/",
    "portrait.js",
];
//蜜罐深度检测，通过二次请求，匹配body中关键字
KEYWORDLIST.honeypotTraits = [
    {
        honeypotName: "HFish",
        urlKeyword: "/x.js",
        blackKeywords: ["sec_key", "login_field", "user_login"],
    },
    {
        honeypotName: "Unknown",
        urlKeyword: "/monitordevinfo/common.js",
        blackKeywords: ["联通"],
    },
];
