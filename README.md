# AntiHoneypot - 一个拦截蜜罐XSSI的Chrome扩展
## 说明
这是一个带有学习和研究性质的Chrome扩展程序。
## 功能
1. 截获页面中发起的XSSI请求，通过域名、URI、Query黑名单特征识别阻断可疑的XSSI（Jsonp Callback、XSS等）
2. 对可疑URL进行深度检测，通过发送请求获取body内容，进行关键字匹配识别
3. 分析页面JS，攫取蜜罐固有特征，识别蜜罐并拦截所有请求（HFish、Moan、Beef）
4. 判断fingerprintjs库是否存在并提示
5. 判断是否有其他针对Canvas、Font、Audio、WebGL的指纹相关调用
6. 混淆Canvas、Font、Audio、WebGL的指纹，扰乱Fingerprint
7. 判断是否有持久化身份标识的相关调用（Cookie、LocalStorage、WebSQL、FileSystem、IndexedDB）
8. 判断页面中是否对剪贴板的粘贴进行了取值（待进一步验证，目前没发现不粘贴就能取值的利用方式）
9. 一键清除当前网站的所有浏览器数据功能（包括所有缓存的数据、存储的信息）
10. 增加了对Obfuscator混淆脚本的识别（很多蜜罐用在代码混淆上）

## 声明

指纹调用识别采用的拿来主义，把mybrowseraddon.com的[AudioContext Fingerprint Defender](https://mybrowseraddon.com/audiocontext-defender.html)、[Canvas Fingerprint Defender](https://mybrowseraddon.com/canvas-defender.html)、[Font Fingerprint Defender](https://mybrowseraddon.com/font-defender.html)、[WebGL Fingerprint Defender](https://mybrowseraddon.com/webgl-defender.html)四个扩展的脚本直接拷过来了。这样四个扩展变一个，可同时实现对四种指纹的混淆，同时也可直接对四种指纹的提取进行监控。

正是因为Copy了四份代码，所以本扩展代码仅作为Chrome扩展编写学习和个人研究使用，并不会发布到chrome网上应用店中。

如果你使用了该代码，则默认同意该原则。否则请不要使用。

## 使用
代码下载&扩展使用：
* 下载代码并解压到本地合适位置（使用git clone会更加方便，可以随时更新）
* 打开[chrome扩展程序页](chrome://extensions/)
* 切换到开发者模式
* 使用“加载已解压的扩展程序”加载扩展即可（已经加载的点击刷新按钮即可）

## 信息共享
* 大家如果有Bug反馈、新功能建议，请直接发到issue。
* 如果遇到新的蜜罐，请打开新的chrome的无痕模式，然后打开“开发者工具”，切换到“Network”标签，选中“disable cache”，然后请求或刷新页面。待页面完全加载完成后，右键选择“Save all as HAR with content”生成HAR文件发到issue即可（如果比较大，压缩成zip上传）。
* 如果遇到页面包含反调试功能，切换到“开发者工具”的“Source”标签，点击右上的“Deactivate breakpoints”按钮，再点击“Resume script execution”按钮即可。注：有些反调试功能会通过死循环耗尽浏览器资源，所以如果发现页面卡了，抓完包关闭当前标签即可