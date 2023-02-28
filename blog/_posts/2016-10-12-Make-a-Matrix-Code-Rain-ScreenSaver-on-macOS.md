---
title: 用Core Graphic做个macOS上的屏保
date: 2016-10-12 19:28:54
categories: Code
tags:
- Objective-C
- macOS
- Code
- 作品
description: 把上一篇里面的Code Rain移植到了macOS，做了个屏保。
---
在写[上一篇](/blog/2016/10/09/Project-Matrix-Code-Rain/)的同时我就在考虑，既然都做到了这个地步，能不能干脆移植到macOS上，做个屏保呢？

我决定试一试。

## 确定方案

在真正开始做之前我考察了一下Metal和OpenGL，觉得学习曲线相对“移植”这个任务来讲有点过于陡峭。由于之前从没正经做过macOS上的项目，还是觉得这次步子先迈小一点，大方向上继续沿用之前的Core Graphic方案。

由于上一篇的工程是基于Swift 3的，而如果你在XCode中创建屏幕保护的模板工程的话，会发现它并没有给你选择语言的余地，直接就给了你一个Objective-C的工程。由于程序员天生有着~~爱偷懒~~不喜欢重复造轮子的优良品性，我的第一反应是，能不能我自己手动建个Swift的工程？

但是我实验的结果是似乎目前存在兼容性问题，编译出的屏保总是莫名其妙crash。有人也遇到了同样的问题：

![5613ec79jw1f8prz5wucij21cc11w7jv.png](https://s2.loli.net/2023/02/28/CxV2J9XfpUboLS6.jpg)

无奈，我还是及时止损，老老实实用Objective-C重写了遍主要的逻辑。

仅就这个项目中用到的东西而言，Cocoa和Cocoa Touch的差别比预想中的还要小，夸张点说，基本上只是把“UI”打头的东西换成“NS”就搞定了（比如`UIFont`和`NSFont`，`UIScreen`和`NSScreen`等）。

顺便一题，默认的屏保模板是不能debug的，你需要自己手动添加一个target，然后在该target的`AppDelegate`里面自己把屏保的view加进来：

```objc
_rainView = [[CodeRainView alloc] initWithFrame:CGRectZero isPreview:NO];
_rainView.frame = _window.contentView.bounds;
[_window.contentView addSubview:_rainView];
```

但是当我费半天劲翻译完程序，真正运行起来后却发现，这货在堂堂电脑上居然跑得比在手机上更慢！

想了一下，大概的原因可能是，由于电脑的屏幕大，能同时容纳的track就更多，因此同时要刷新的track数量在运行开始后就会很快上升到可观的程度。

要是像上一篇那样，改成后台渲染呢？

试了一下，效果也不是很好。

于是，我开始琢磨换一种实现方式。

## CALayer黄金搭档

考虑到这个效果的本质其实是“照亮”已经排布好的矩阵，我们可以尝试不去自己绘制字符，而是也先排布好字符，然后照亮它！

于是自然就想到CALayer家族中的两位成员和一个小弟：`CATextLayer`、`CAGradientLayer`和`mask`属性。

顾名思义，他们一个用来显示字符，一个用来显示渐变，一个用来产生遮罩。

无图无真相，大概是下面这个意思：

### 产生字符（CATextLayer）
```objc
NSArray *characters = [[JSMatrixDataSource sharedDataSource] characters][track.trackNum];
NSString *trackString = [characters componentsJoinedByString:@""];
attrString = [[NSMutableAttributedString alloc] initWithString:trackString
                                                    attributes: [JSMatrixDataSource getStringAttrs]];
self.string = attrString;
```
![5613ec79jw1f8pt5xzfm8j21kw162npd.jpeg](https://s2.loli.net/2023/02/28/Lsx4KrHuA5UMGqC.jpg)

### 产生遮罩(CAGradientLayer)
![5613ec79jw1f8pt72dip5j21kw162kjl.jpeg](https://s2.loli.net/2023/02/28/DWe9U2pAYBzvSEy.jpg)
```objc
self.gradientLayer = [CAGradientLayer layer];
self.gradientLayer.colors = @[(__bridge id)[NSColor whiteColor].CGColor, (__bridge id)[[NSColor whiteColor] colorWithAlphaComponent:0].CGColor];
self.gradientLayer.startPoint = CGPointMake(0.5, 0);
self.gradientLayer.endPoint = CGPointMake(0.5, 1);
NSMutableDictionary *newActions = [[NSMutableDictionary alloc] initWithObjectsAndKeys:[NSNull null], @"onOrderIn",
                                   [NSNull null], @"onOrderOut",
                                   [NSNull null], @"sublayers",
                                   [NSNull null], @"contents",
                                   [NSNull null], @"bounds",
                                   [NSNull null], @"position",
                                   nil];
self.gradientLayer.actions = newActions;
```
中间给actions设置的一段是为了禁用CALayer的隐式动画，因为我们此处需要的就是一跳一跳的效果。

### 设置蒙版（mask）
![5613ec79jw1f8pt8rjb9yj21kw162qdn.jpeg](https://s2.loli.net/2023/02/28/uhXPdoRnMKVsHyF.jpg)
```objc
self.mask = self.gradientLayer;
```

1 + 2 = 3. Simple like that.


PS. 有一个小坑就是CATextLayer的刷新并不及时，因此需要我们手动清空它的内容并标记为需要刷新：

```objc
self.contents = nil;        // Force the layer to clear its content
[self setNeedsDisplay];     // Then mark the layer needs redraw

self.string = ...           // Set the new content
```

## 改进

然后我用Instrument进行了一下测试，惊讶地发现在一个简单的取屏幕最大行数的方法上居然耗费了主线程10%的时间：

![5613ec79jw1f8ptg868ejj21080bu0z6.png](https://s2.loli.net/2023/02/28/8gpRVOTYMliaekn.jpg)

为了解决这个问题，我把计算结果缓存了下来，这样以后每次取用时只需读取之前的计算结果：
```objc
+ (UInt)maxNum{
    static UInt num;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        num = ceilf([NSScreen mainScreen].frame.size.height / [JSMatrixDataSource capHeight]);
    });
    return num;
}
```
而在Swift上，只需把变量声明为`static`即可达到上述效果。

```swift
static let maxNum: Int = Int(ceilf(Float(UIScreen.main.bounds.height / JSMatrixCodeRainView.characterSize.height)))
```

（我真的不是在黑OC，没有任何这个意思。）

## 成果

大概是酱紫：

![5613ec79jw1f8pvcic6h7j21kw16owmx.png](https://s2.loli.net/2023/02/28/NYmrQL9Ksp2gDRl.jpg)
![5613ec79jw1f8puwcp8rcg20b4069qv6.png](https://s2.loli.net/2023/02/28/9hea5N8XvH3JDTO.gif)

其实在运行时还是会注意到有些不自然，但更加出色的表现还是得祭出OpenGL或者Metal来做。这就留给以后了。包括还可以设置`zPosition`实现一些纵深感的变换效果，由于这些先天不足也懒得做了。

另外我其实完全抛弃了系统默认的屏保实现机制（在`animateOneFrame`方法中写动画逻辑来前进一帧），也算是个非主流的屏保……

代码已经共享到了GitHub：
[https://github.com/zshowing/JSMatrixCodeRainScreenSaver](https://github.com/zshowing/JSMatrixCodeRainScreenSaver)

或者直接下载：
[https://pan.baidu.com/s/1eRJE2P0](https://pan.baidu.com/s/1eRJE2P0)