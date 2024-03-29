---
title : 个人网站
cover: jonshowing-website
date: 2016年，2023年
type: 设计/程序
---

2022年9月17号，我写道：
> 作为古典网络时代过来的遗老，我到现在依然对个人网站这种Web 1.0时代的东西有种执念，不真的好好搞一个，灵魂里就有某些地方不能安分。
总觉得在其他地方都只是自己向外发出广播的举动，只有个人网站算是在网络上的「家」。

诚如这段话所述，想拥有一个真正属于自己的个人网站是我一贯的执念。这个执念始于何时已经不可考，我只知道它伴随了我太长时间，以至于这两年身体开始变差后，它是我能想到的「如果很快就要死的话一定要完成的事情」里排在最前面的。

之前有篇[日志](/blog/2016/06/26/feeling-of-belong/)总结了在这之前我在网络上寻找归属感的历程，这里只叙述自己决定着手建站的部分。
在本站之前，我在Bluehost上面花了好几年的钱租服务器，但一直没时间和精力真正动手写，硬盘里只有一个半成品，和一些设计文稿（我戏称这些钱是「给自己留个念想」）。当时设计的首页是这样的：
![画板 1 - v0510 - with bottom.jpg](https://s2.loli.net/2023/02/23/HtYdj7VpbZCLKWk.jpg)

后来扩展出了整个页面：
![](https://s2.loli.net/2023/02/28/xkodhwDMBGEi6Z5.jpg)
![homepage.jpg](https://s2.loli.net/2023/02/23/P8WTqIR6U9SN1wM.jpg)

我还真大致把这个页面写了出来，但它显然承载不了我完整的野望。我把它放在那个Bluehost站点，随即不管它了。
手机里还存有两张当时的效果照：
![IMG_5997.jpeg](https://s2.loli.net/2023/02/26/oSM2uEYtLwaB6Kj.jpg)
![IMG_5873.jpeg](https://s2.loli.net/2023/02/26/2Dn7dTkfOvq5bmo.jpg)

顺便，可以看到，这套设计里面的Logo和几个手写文字的素材一直沿用到了现在的这个站，也算是一种传承。

最后，我还是在Github Pages基于Hexo+Next主题搭建了一个博客，运行了好几年：

![下载 _1_.png](https://s2.loli.net/2023/02/23/OMujc6z9F5kEUNq.png)

这个博客显然只有日志区，主题也只是加上了我自己的logo而已，不管从哪方面讲都很难称作我的作品。因此，我的那个愿望也继续被埋藏起来，等待复苏的时机。

到了2022年9月底，我偶然看到一篇[介绍自己博客技术演化的文章](https://mebtte.com/migration_of_my_blog_structure)，里面提到了基于Github Pages和Github Actions的建站方案，这比我之前用Hexo在本地build然后推送酷了不少，看起来很有搞头。但此时我处于一波情绪低谷，完全提不起力气做稍微困难的事情。10月初的时候我花了几天时间挑出了上面明信片封面所需的[精选照片](https://www.douban.com/photos/album/1897181383/)，又差不多完成了上方明信片部分的开发，就遇到了设计和程序上的双重停滞。一直拖到2023年1月，在我搜到了另一个开发者Marc基于Jekyll搭建的[开源个人网站](https://github.com/marcgg/marcgg.github.com)之后，才照猫画虎开始有实质性进展。

在设计上，我参考了许多其他站点，但细节上还是自己把控，希望最终尽量在视觉上有统一性。值得一提的是，我有意在很多地方想向明信片的样式靠拢，因为**这些年联系越来越少的好朋友们给我寄过的实体明信片是给了我很多力量和抚慰的事物**，我想在自己的线上空间复刻这个感觉。

最终形成了现在的首页：
![截屏2023-02-28 22.25.41.jpg](https://s2.loli.net/2023/02/28/XTZKmk1d5R3QPvz.jpg)

这个页面的明信片每5秒钟会轮换展示我拍的照片也是我比较喜爱的设计，我建议您~~也像我一样~~打开之后一直放在那里当作屏保。

从0到1可能确实是最难的，不过一旦开辟出这块空间，后面想再继续往里添置东西可能就好办多了。
——或者，也许现在的我需要打起精神重新活得精彩起来，才能继续往里填内容🤦‍♂️

--- 

## Credit

以下是一些我能想得起来的参考：

- 首先依然是整站开发加速的开端来自于Marc的[开源个人网站](https://github.com/marcgg/marcgg.github.com)
- 部分设计依旧是之前blog主题[Next](https://theme-next.js.org/docs/)的复刻，比如表格配色，底部版权栏
- 首页增加友情链接区域的想法来自于看到[「小球飞鱼」](https://mantyke.icu/friendslink/)站写在友链页的一句话：
> 我想，交换友链仍然是赛博世界珍贵的仪式感之一：好，我们现在是朋友了！
- 导航栏的翻转效果来自于搜到的一个示例：[https://codepen.io/kanishkkunal/pen/wgEBgX](https://codepen.io/kanishkkunal/pen/wgEBgX)
- 看到这么一篇[Google Fonts 已支持思源宋体！](https://io-oi.me/tech/noto-serif-sc-added-on-google-fonts/)之后，把本站的阅读字体也改成了思源宋。衬线字体更适合阅读，这点是真的。
- Jekyll没有原生支持tag生成，[Jekyll Tags on Github Pages](https://longqian.me/2017/02/09/github-jekyll-tag/)这个页面介绍了通过脚本辅助达到类似效果的办法
- [404页面](/404)的对话气泡代码参考了[https://codepen.io/Founts/pen/AJyVOr](https://codepen.io/Founts/pen/AJyVOr)。当然，这个设计来自于我翻看到自己2015年的[一条广播](https://www.douban.com/people/zshowing/status/1665917007/)
- 首页的loading特效来自于[https://cssloaders.github.io/](https://cssloaders.github.io/)

---

## DevLog

由于日子过得太混沌，我没有留意记录开发日志。大致的时间点是：

|2022.9.27|项目建立|
|10.10|完成轮播精选照片挑选|
|2023.1.15|有Marc的站点参考，开发正式加速|
|1.21|应该基本完成首页导航栏等，开始导入历史日志|
|1.31|完成日志页和想法页，发布截图于SNS|
|2.3|完成照片页|
|2.9|完成项目页|
|2.10 - 16|增加标签等功能|
|2.16 - 23|想法页数据准备|
|2.24 - 27|相册数据准备，日志图片恢复|
|2.28|首个版本正式上线|

以下是上线以来的一些较大更新：

{% capture content %}
{% include site-log.md %}
{% endcapture %}
{{ content | markdownify }}