---
title: 公司周报点赞关系的数据可视化尝试
date: 2017-06-30 23:58:06
categories: 
- 数据可视化
tags: 
- 数据可视化
- Python
- Code
- 作品
description: 对公司周报下同事互相的点赞关系尝试进行了数据可视化，得出了一些有趣的结论。
---
## 背景

前一阵，在和小段同学聊天时，我们拿每周要交的周报下面互相点赞的文化开玩笑，比如一个小团体间会互相吹捧，比如某些人会狂给别人点赞（点赞狂魔）等等。然后我突然想到前一阵看过一篇把唐朝诗人间互相提及的数据进行可视化的文章[《计算机告诉你，唐朝诗人之间的关系到底什么样？》](http://www.guokr.com/article/442052/)，跟这是完全类似的场景。于是我的好奇心起，如果对公司里的汇报进行一番分析，结果会是什么样呢？再加上我本就一直对数据可视化感兴趣，正好趁机练练手。


![盛唐时期诗人关系图](http://ww1.sinaimg.cn/large/5613ec79ly1fh3ompk8cwj20qk0jy76e.jpg)
图：《计算机告诉你，唐朝诗人之间的关系到底什么样？》中盛唐时期的诗人关系图

## 数据准备和初步统计

首先要做的自然是爬数据，借助瑞士军刀般好用的Python（和requests库），这个过程乏善可陈。首先我调用请求汇报列表的接口拿到了3000条汇报的id（时间跨度大约是从2016年11月初到2017年6月末），然后慢慢地一条一条拿这3000条汇报的详情，并建了个数据库保存在本地。

![](http://ww1.sinaimg.cn/large/5613ec79ly1fh33a95p9bj21200n644f.jpg)



然后我们就能写代码了。其中最简单的就是点赞数和被点赞数的排行，只要简单地加起来即可：

| 姓名   | 被点赞数 |
| ---- | ---- |
| 郝思阳  | 296  |
| 李增辉  | 254  |
| 濮智光  | 233  |
| 何亮   | 226  |
| 张硕   | 224  |
| 杨培玉  | 218  |
| 杜庆   | 204  |
| 杨嘉琦  | 203  |
| 李雪然  | 201  |

| 姓名   | 点赞数  |
| ---- | ---- |
| 李增辉  | 2557 |
| 濮智光  | 615  |
| 吴凯   | 602  |
| 张敏   | 602  |
| 杨培玉  | 440  |
| 黄家辉  | 364  |
| 方语微  | 335  |
| 胡燕玲  | 308  |
| 郑立宝  | 296  |

事先我和小段同学对前几名先进行了猜想，基本被程序跑出来的结果印证。包括万人迷——设计组的郝思阳，点赞狂魔——测试组的李增辉。当然还有些出乎意料的，主要是和自己没什么交集的人，比如我们猜出了点赞数615的濮智光，但点赞数602的吴凯和张敏我们却完全没想到。以及点赞数排在前面的人，在被点赞数列表里很多都能看到，说明这也存在礼尚往来的问题，辛苦就会得到回报xD

然后就是一些更细粒度的分析，比如具体到每个人，被谁点赞最多：

| 姓名   | 被别人点赞前两名         |
| ---- | ---------------- |
| 胡燕玲  | 李增辉, 30; 濮智光, 28 |
| 夏轩   | 李增辉, 28; 张敏, 22  |
| 吴呈邑  | 张敏, 29; 李增辉, 28  |
| 韩君男  | 李增辉, 28; 罗宇翔, 16 |

很快会发现，这个表被前面点赞数最多的几个人的霸榜了……去除他们之后的数据更有意义一些：

| 姓名   | 被别人点赞前三名（去除李增辉濮智光）        |
| ---- | ------------------------- |
| 胡燕玲  | 杨培玉, 23; 郑明君, 19; 张硕, 18; |
| 夏轩   | 张敏, 22; 郑晓洛, 21; 魏定阔, 17; |
| 吴呈邑  | 张敏, 29; 宋忠森, 18; 吴凯, 14;  |
| 韩君男  | 罗宇翔, 16; 段宏思, 7; 张敏, 6;   |

## 引入Plotly图形库

在网上搜到的图形库中看上去最好看的就是[Plotly](https://plot.ly)，我研究了一下，发现三维可拖动的效果虽然看上去高大上，但实际并不直观，也没法灵活配置参数（比如每条线的粗细，每个圆的大小等等），我能达到的最好效果大概就是下面这样：

![](http://ww1.sinaimg.cn/large/5613ec79ly1fh360g8lvfj20ob0jomyy.jpg)

其中最明显的就是最上面给产品老大点赞的一群销售/实施，下面产品设计部的关系并不明显。

上面这个图的地址是：[https://plot.ly/~JonShowing9266/0/the-like-relation-of-qiyu-weibangong/](https://plot.ly/~JonShowing9266/0/the-like-relation-of-qiyu-weibangong/)

于是我去找来了上面那篇唐朝诗人关系图的源码，在它的基础上改了一下，终于有了比较满意的结果。

## 引入ECharts图形库

[ECharts](echarts.baidu.com/examples.html)是个前端的图形库，最开始我研究了半天怎么在Python上直接用这个库，最后实在没搞懂才转投Plotly。经过对上面源码的分析，我发现其实只要用Python拼一下ECharts所需要的JavaScript代码就行了，最终直接生成HTML文件。

结果大概是这样的：

![](http://ww1.sinaimg.cn/large/5613ec79ly1fh367veohij21bw0tp7ez.jpg)

这里对数据做了个预处理：首先是读取了上面提到的每个人给别人点赞的排序列表，且只取前三个的数据，这样可以有效降低互相间点赞关系过于混乱的情况，又能把握最主要的动向；第二是只取赞数大于5的数据，如果没到5说明两人间的关系不明显，可以忽略。

经过上面的处理，此时其实互相间的关系已经比较明显了，接下来我又做了个简单的聚类，就是把互相之间点赞数大于5的人放到一组：

```python
group = []
picked = []

for pid in likeUniqueArray:
    ppl = peopleMap[pid]
    for like in ppl.getLikes():
        if like[1] > 5: 
            # only calculate the ones whose like count is greater than 5
            found = False
            for subGroup in group:
                if pid in subGroup or like[0] in subGroup: 
                    # check both ppl and target, 
                    # if found any of the two, check if it is valid
                    found = True
                    notInGroup = False
                    for item in subGroup:
                        if item == pid or item == like[0]: 
                            # skip item itself
                            continue
                        anotherPPL = peopleMap[item]
                        if anotherPPL.getLikeValue(pid) < 5 or anotherPPL.getLikeValue(like[0]) < 5: 
                            # total like count reversely
                            notInGroup = True
                            break
                    if not notInGroup and not (pid in picked and like[0] in picked):
                        subGroup.add(pid)
                        subGroup.add(like[0])
                        picked.append(pid)
                        picked.append(like[0])
                        break
            if not found and not (pid in picked and like[0] in picked):
                s = set([pid])
                s.add(like[0])
                picked.append(pid)
                picked.append(like[0])
                group.append(s)
```

代码写得仓促，看起来比较恶心，但效果很明显：

![](http://ww1.sinaimg.cn/large/5613ec79ly1fh369lvvjuj20jm0dh0x6.jpg)

上图的填色就是基于这个分组的。

把上图人工画一下分组，大概是：

![](http://ww1.sinaimg.cn/large/5613ec79ly1fh36chfnrnj21hc0u0dtk.jpg)

可以说，我们得到了和唐朝诗人关系图那篇文章中相同的结论，即使对这个公司没有任何了解，仅仅凭借对点赞关系的分析，就能大致还原组织架构图。

最终效果图的地址是：http://jonshowing.com/like-network/output.html