---
title: 用Github Actions搭建自己的自动化中心
date:  2023-03-16 17:54
categories: 
- Code
tags:
- 脚本
- 自动化
description: 后知后觉地发现Github Actions竟然如此良心。
---
窗外已经是人工智能时代了，我竟然刚发现Github Actions是如此的良心。

注意到Github Actions，是前一阵建立本站时偶然看到的[豆瓣书影音同步 GitHub Action](https://imnerd.org/doumark.html)这篇文章，里面提到了他通过Github Action实现了定期同步自己的豆瓣观影记录到自己blog的需求。我一看，嚯，我也有这个需求啊！然后就开了这个坑。

## 豆瓣同步

于是我就从同步豆瓣书影游数据开始研究起来。由于我想最大程度地控制数据格式，所以想找到上面提到的这篇文章里共享出来的源码进行修改，然而仔细看了下才发现他分享出来的是封装好的docker，真正的源代码我似乎是看不到的……

没办法，只能自己再造一遍轮子了。我手头能用到的是一款叫[「豆坟」](https://blog.doufen.org/)的Chrome插件，它已经很好地完成了豆瓣数据的抓取和备份工作，所以我能拿到存有我当前书影游数据的CSV文件。接下来我只需做增量的部分就行了。

写Python脚本的过程没什么可说的，总之，借助上面「豆坟」插件运行时的log暴露出的豆瓣API，我比较顺利地拿到了数据，把它与CSV文件中的最新一条进行比对，如果不一样就存进去，如果一样就中止。

接下来就是Github Actions的部分了。我最开始以为在脚本中对CSV文件的操作就直接改了仓库里的文件，在这种错误的认知下，我还查了半天怎么自己来做这个Jekyll站点的构建和发布；结果最后发现，还是需要自己手动commit和push的……那就好办了，因为push操作本身自然就会触发之前已有的系统自带的站点构建和发布Action，我就完全不用管了。

自然，我还花了两天从头写了一个单独的[书影游页面](/ACGBM/)来承载这些数据，不赘述。

> 说起来，让我感到神奇的是，这个Actions每次在执行时都要从头重新完全初始化一遍环境——当然，这从软件的层面上说不仅逻辑完全正确而且非常有必要，只是我还是会想到，这就像每次要玩游戏都从头装一遍系统orz

## 豆瓣捧哏

一旦尝到甜头，我就开始想这玩意还能用来做些什么。
正好最近ChatGPT火热，我就顺手又写了个脚本，让Github Actions定时检查我的豆瓣动态，如果有新的，就自动调用ChatGPT的API发表一条回复。

这个脚本也没啥可讲的，只是在这里用到了`Github Actions Secrets`值得一提，它可以隐藏你重要的隐私数据，比如API token，在程序里只需引用设定好的指代ID就可以。

不过由于我没有小号，甚至没有可以用来申小号的手机号，因此所有的回复都是以**我自己回复自己**这种撒鼻息的形式进行的……

![截屏2023-03-16 21.50.24.png](https://s2.loli.net/2023/03/16/zl5eQXSjfr17CBZ.png)

## 自动上访

一不做二不休！我干脆把我的赛博上访工作也挪到这个境外势力这里来吧！

### 网易云音乐

去年我的网易云音乐账号被封禁了评论功能，他们官方提供了一个申诉接口，于是我曾经写过一个Python脚本帮我在收到「申诉被驳回」结果的两分钟内再次提交申诉。但当时我只能在自己的电脑上跑，于是我那阵得有一个多月没怎么关过电脑，见证了网易方面在深夜也有人以随机的时间点击驳回的活体西西弗斯搞笑场景（如果不是人点击的，而是程序随机驳回的，就更搞笑了<span class='shady'>什么程序对攻</span>）。

现在，我可以把这个脚本移植到Github Actions了，我只需大概每过一周更新一下cookie就可以了。

我还花了点时间研究了下怎么把结果发送到Telegram Bot，这样每次它提交完申诉我就能在第一时间知道了。这也不难，我复用的是别人做好的现成的Action：`appleboy/telegram-action@master`，只是在自定义通知内容这件事上有点麻烦，因为似乎Github Actions没有提供很方便的办法能让脚本输出的内容在后面的步骤使用，我只能把要给Telegram发的文本保存到本地，然后在后面再把它读取到环境变量里。大概是：

{% raw %}
```yaml
- name: 输出 Python 脚本运行结果
    id: python-output
   run: echo "RESULT=$(cat 163-output.txt)" >> $GITHUB_OUTPUT

- name: Send Notification
    if: ${{ env.NEED-REPORT != 'false' }}
uses: appleboy/telegram-action@master
    to: ${{ secrets.TELEGRAM_CHAT_ID }}
  token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
message:|
    ${{ steps.python-output.outputs.RESULT }}
```
{% endraw %}

最后的成果大概是：
<img src="https://s2.loli.net/2023/03/16/uCtvsEy6qbZezIP.png" width = "60%">

> 请忽略这个bot的名字。
三年前我似乎想写个服务来记录豆瓣上面电影的评分变化，结果马上发现早有人[造好了这个轮子](https://douyabot.com/)。~~然后bot的名字也没法改了~~

Github Actions的最短执行间隔是5分钟，这比不上我当初在电脑上每2分钟检测一次的正义执行力（这也是网易云音乐网页版里面他们自己的轮询频率），但也足够了。基于公德心，我把间隔设置成了10分钟。而且从结果上看，现在的驳回速度远远赶不上去年夏天了，不知为什么=v=

### 互联网信息服务投诉平台

**互联网信息服务投诉平台**（[https://ts.isc.org.cn/](https://ts.isc.org.cn/)），在2020年的知乎文章和答案中似乎还是个非常有用的平台，但到了2022年已经完全是个样子货了。

不过没关系，我的应对办法就是同样用样子货——我写的脚本——来无情反复投诉新浪微博。

这家网站的限制是每天对同一企业只能投诉两次，每次投诉后大概三五天后会收到一条文本完全一样的「已处理」短信。我之前在手机上用[Scriptable](https://scriptable.app/)这个App写了个脚本，让我可以在手机上随时想起来就投一条；并且还在「快捷指令」的自动化栏目下增添了收到那条文本万年不变的短信时自动上诉的应答。

现在，这些就可以全不要啦！我也要把它们放在Github Actions上面！

这个网站有一点好，就是它的cookie似乎不会过期，至少从我提取时到现在都半年多了还能继续用。

我把上访的时间设在了凌晨，每天两次，不多不少。

<img src="https://s2.loli.net/2023/03/16/DntBf4JTPhKNyua.png" width = "60%">

## 新种子报喜器

接下来的应用略有扩展，它来源于我时不时会做的一件事：查看我喜欢的女演员的新作是不是出了下载。

我本来觉得这也是随便写个脚本的事，没想到还颇有一番周折：我常用的那个可以查看影片下载种子的网站，在我本地跑脚本时一切正常，可一旦在Github的服务器上跑脚本，就会触发它的反爬虫机制，开启Cloudflare的防护服务。

我试了几个现成的库，都对这层防护无能为力。后来受到一篇文章的启发，还是启用了爬虫的最终杀手锏——模拟网页登录，用起了Selenium，或者准确地说，是基于Selenium魔改，对反爬机制进行了有针对性破解的[undetected_chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver)。

在接入这个库的过程中也报了许多错，几乎是改一步前进一寸。
- 比如报错`This version of ChromeDriver only supports Chrome version 110`，解决办法是后来才看到文档里就写了一个初始化参数`version_main=110`；
- 比如报错`cannot connect to chrome at 127.0.0.1:xxx from chrome not reachable`，搜到在Github上的[一个回答](https://github.com/acheong08/ChatGPT/issues/502)说`Make sure you have Xvfb installed :`
```bash
Xvfb :99 -ac 2>/dev/null & 
export DISPLAY=:99 
```
我最开始完全没理解这个程序是做什么的，以为是无关的东西，没想到试了下居然真的管用orz
- 比如无法加载cookie（`invalid cookie domain`），最后[有人说](https://stackoverflow.com/a/44857193)只需**先访问那个网站一次，再清除所有cookie，最后再进行实际的访问**即可，听起来也太tricky了吧……结果照这么做还真行……

最终结果还算是不错，虽然还没有得到检验，我已经开始期待某一天早上收到Telegram发来的信息——
**「XXX-XXX出种子啦！」**

> *更新于2023.3.19：*
早上终于收到了这条通知！
<a href="https://smms.app/image/9ZEoS1FAcU27Vte" target="_blank"><img src="https://s2.loli.net/2023/03/19/9ZEoS1FAcU27Vte.png" width="60%"></a>

## 其他以及Todo

整个过程中new Bing也帮了不少忙，它对于信息的搜索和整合能力真的对提高工作效率帮助良多。我的体会是，基本上常识性、文档或手册里有的问题，以及从提纲挈领高维度问的问题，当然包括现生成代码段的问题，问它都比较好；而细节、偏门、全网就一个帖子的某个角落能提到解决方案的问题，还是Google搜索更精准一些。<span class="shady">与此同时，我甚至怀疑百度有没有收录那个关键的网页</span>

另外还有个#Todo，就是不知能否自动获取本地浏览器的cookie然后上传更新到Github。

目前暂时就是这些，不知以后还能想出什么玩法来。