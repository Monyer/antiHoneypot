# AntiHoneypot - 一个拦截蜜罐XSSI的Chrome扩展
## 说明
这是一个带有学习和研究性质的Chrome扩展程序。
## 功能
1. 截获页面中发起的XSSI请求，通过特征识别阻断可疑的XSSI（Jsonp Callback、XSS等）
2. 分析和攫取蜜罐固有特征，识别蜜罐并拦截所有请求
3. 判断fingerprintjs库是否存在并提示，判断是否有其他web指纹的相关调用
4. 判断是否有持久化身份标识的相关调用
5. 判断页面中是否对剪贴板的粘贴进行了取值（待进一步验证）
6. 一键清除当前网站的所有浏览器数据功能（包括所有缓存的、存储的）

## 声明

指纹调用识别采用的拿来主义，把mybrowseraddon.com的[AudioContext Fingerprint Defender](https://mybrowseraddon.com/audiocontext-defender.html)、[Canvas Fingerprint Defender](https://mybrowseraddon.com/canvas-defender.html)、[Font Fingerprint Defender](https://mybrowseraddon.com/font-defender.html)、[WebGL Fingerprint Defender](https://mybrowseraddon.com/webgl-defender.html)四个扩展的脚本直接拷过来了。这样四个扩展变一个，可同时实现对四种指纹的混淆，同时也可直接对四种指纹的提取进行监控。

正是因为Copy了四份代码，所以本扩展代码仅作为Chrome扩展编写学习和个人研究使用，并不会发布到chrome网上应用店中。

如果你使用了该代码，则默认同意该原则。否则请不要使用。

## 使用
代码下载&扩展使用：
* 下载代码并解压到本地合适位置
* 打开[chrome扩展程序页](chrome://extensions/)
* 切换到开发者模式
* 使用“加载已解压的扩展程序”加载扩展即可