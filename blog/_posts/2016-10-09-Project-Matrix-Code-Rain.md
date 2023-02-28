---
title: 第一个练手作品：Matrix Code Rain<br>及对Core Graphics绘制的优化
date: 2016-10-09 01:33:22
categories: Code
tags: 
- iOS
- Code
- Swift
description: 记录了实现电影《黑客帝国》中代码雨效果的过程，以及随后对Core Graphics绘制的优化。
---
## 前情提要

书接上文，上回书说到我意识到自己在专业领域有欠缺，于是正在大量阅读Blog。在9月25号看到Kevin Chou的[这篇](http://blog.zhowkev.in/2013/11/11/pnchart-hit-no-1-objective-c-repos-in-github/)介绍他开源的组件库[PNChart](https://github.com/kevinzhow/PNChart)受到欢迎的文章时，我突然想到：对啊，这是个把自己喜好与技术积累结合起来的好途径！之前总觉得往开源社区贡献代码需要超强的底层代码功力，又不想仿写已有的组件重复造轮子，这时我才刚刚意识到，上层的UI层面同样需要优秀的贡献——某种程度上讲更加稀缺，毕竟同时对设计和代码都有研究的程序员比较少。

恰好，一个做前端的朋友Fanta发来了一份他业余时间用HTML+JS写着玩做的《黑客帝国》代码雨效果的demo：
![5613ec79jw1f8m0vyssmbg20b406m7wh.png](https://s2.loli.net/2023/02/28/5nN3sgGzt7mYvI1.gif)

我觉得这个还挺有意思，搜了一下GitHub上还没有做过的，于是便开始了编码工作。

## 架构及轨迹生成

这是一个很简单的小组件，所以基本架构也很简单：
![5613ec79jw1f8m1v5se6mj20y80jyt9v.png](https://s2.loli.net/2023/02/28/CSaP8KF2kJvwflp.jpg)

我们约定将每一条下落的轨迹都称为一个`Track`，由一个`Generator`实例专门来生成，每隔指定的时间（显然，随机亦可）就新生成一条，加到`DataSource`中，并创建其对应的`CALayer`子类`CodeRainLayer`加到最底层的`UIView`上。

## 下落及轨迹清理

如何产生动画呢？最开始自然想到用`CAAnimation`来做。
因为代码太简单，就不在这里写了。
但是写完个大概之后，运行起来却发现不对劲：总感觉没有电影里面酷。

问题出在哪里呢？我又从移动硬盘里翻出了那三部曲仔细地研究了一下，经过一帧一帧地探究，我找到了原因：
电影里面的代码并不是在“下落”，如果你盯着一个字母看，会发现它根本就没移动过位置（除去镜头本身的移动）。换句话说，整个空间是一个已经排列好的字母矩阵，而我们看到的表象是**一阵脉冲流过**而已。

![5613ec79gw1f8m3n5c8j6g20b404vx6p.png](https://s2.loli.net/2023/02/28/BhzYTJM6vSwgtXC.gif)

所以最后改成的方案是由每个`Track`实例自带的`Timer`负责驱动控制自身的下落（为表述方便我们依然沿用这个词），当需要刷新时，通知其对应的`CodeRainLayer`实例（`-setNeedsDisplay`）进行重绘。至于如何重绘，由每个`CodeRainLayer`自行负责。

而当整条轨迹掉出屏幕的时候，`Track`会检测出边界条件，然后把对应的`CALayer`执行`removeFromSuperlayer`，最后把自身从`DataSource`中清除。

## 阶段性成果

OK, so far so good. 我们成功实现了整个的动画效果，看起来也确实蛮酷的：
![5613ec79jw1f8hmevmxy9g20a00hsb29.png](https://s2.loli.net/2023/02/28/2XzS13o7FPvixEK.gif)

## 封装
在把它传到GitHub之前，还需要进行一些封装。这里主要有两方面的工作，一个是增加控制关键字来限制外界能接触到的内部类和方法，另一个是将可调节的参数向外界暴露出来。

### Access Control
在Swift 3中特地新加了`fileprivate`这个访问权限，正好在这里可以用到。我们把不希望暴露给外界的类都加上这个限定关键字。

顺便，Swift 3中的访问权限依次是：
> open，public，internal，fileprivate，private.

### Configurable Parameters

在之前，组件中用到的所有参数都定义在了一个`struct`里：

```swift
fileprivate struct JSMatrixConstants {
    static let maxGlowLength: Int = 3 // Characters
    static let minTrackLength: Int = 8 // Characters
    static let maxTrackLength: Int = 40 // Characters
    static let charactersSpacing: CGFloat = 0.0 // pixel
    static let characterChangeRate = 0.9
    static let firstDropShowTime = 2.0 // Time between the First drop and the later
    
    // Configurable
    static let speed: TimeInterval = 0.15 // Seconds that new character pop up
    static let newTrackComingLap: TimeInterval = 0.4
    static let tracksSpacing: Int = 5
}
```

为了暴露其中的一些参数，我们在`CodeRainView`那里增加几个变量：
```swift
var trackSpacing: Int
var newTrackComingLap: CGFloat
var speed: CGFloat
```

那么如果用户不设置的时候呢？我们应该用回默认值。比如这样：
```swift
var speed: CGFloat = CGFloat(JSMatrixConstants.speed){
    didSet{
        datasource.speed = TimeInterval(speed)
    }
}
var newTrackComingLap: CGFloat = CGFloat(JSMatrixConstants.newTrackComingLap){
    didSet{
        datasource.newTrackComingLap = TimeInterval(newTrackComingLap)
    }
}
var trackSpacing: Int = JSMatrixConstants.tracksSpacing{
    didSet{
        datasource.trackSpacing = trackSpacing
    }
}
```

而一个2016年的UI组件应当是Interface Builder-Friendly的——尤其是，要做到这点只需举手之劳：将上面的参数声明为`@IBInspectable`。

最后在IB中看到的效果是：
![5613ec79jw1f8hq5majxfj20du050jrx.png](https://s2.loli.net/2023/02/28/qcnXkEifUF6ZwIo.jpg)

## 优化性能
在我的iPhone6s上测试时，整个组件的表现没什么大问题；但在比较老的iPhone5s上测试时，就有点吃力了。虽然画面依然比较流畅，在CPU监测中能明显看出占用：
![5613ec79jw1f8m6n7zdqcj21cu112dn7.png](https://s2.loli.net/2023/02/28/rMfgVGjEt3RZksd.jpg)

而在我后面想结合一些`CoreMotion`的回调实现`视角缩放`效果时，在5s上的画面终于卡了起来。

之所以会卡很容易理解，整个组件在主线程中进行了大量的绘制工作，搁你你也卡。

在我搜索相关信息的时候，偶然看到一篇叫[《一些提高UI绘制性能的技巧》](http://vizlabxt.github.io/blog/2013/07/12/custom-drawing/)的文章中写道：

> 绘制UIView最快的方法就是把它当成imageview，我们把需要用Core Graphic绘制的代码放到另一个线程中去绘制，生成image后直接赋值给view，达到异步绘制的目的。

我试了一下，差不多是这样：

```swift
let track = self.track
DispatchQueue.global().async {
    let size = self.bounds.size
    UIGraphicsBeginImageContext(size)
    context.saveGState()

    ... // Calculate positions, etc.

    context.restoreGState()
    self.render(in: context)
    let resultImage = UIGraphicsGetImageFromCurrentImageContext();
    DispatchQueue.main.async {
        if let image = resultImage{
            self.contents = image.cgImage
        }
    }
    UIGraphicsEndImageContext()
}
```
但这样做有问题：在每一次更新的时候，这个Layer需要在空白的背景下进行绘制，而直接调用`self.render(in: context)`方法，绘制的内容会叠加在当前显示的内容之上，出来的效果是不可用的。（截图过于残暴，从略）

那么怎么解决这个问题呢？一个直接的想法是，如果能在一个新的context上绘制就好了。

带着这个目标去搜索，在[这个文章](http://www.b2cloud.com.au/tutorial/cgcontext-drawing-in-a-thread/)里面介绍了创建context的方法，于是上面的代码变成了：

```swift
let track = self.track
DispatchQueue.global().async {
    let size = self.bounds.size
    UIGraphicsBeginImageContext(size)
    
    /* Create drawing context */
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    let createdContext = CGContext(data: nil, width: Int(size.width), height: Int(size.height), bitsPerComponent: 8, bytesPerRow: 0, space: colorSpace, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
    
    if let context = createdContext{
        context.saveGState()
        
        ... // calc positions, etc.
        
        context.restoreGState()
        self.render(in: context)
        let resultImage = UIGraphicsGetImageFromCurrentImageContext();
        DispatchQueue.main.async {
            if let image = resultImage{
                self.contents = image.cgImage
            }
        }
    }
    UIGraphicsEndImageContext()
}
```

## 优化结果

搞定了这些之后兴冲冲地在5s上跑了一下，发现除了线程多了一些之外，差别几乎不可见：

![5613ec79jw1f8m6mvur82j21cm10wwmk.png](https://s2.loli.net/2023/02/28/SN3blWAxpPc7v6E.jpg)

细想一下也可以理解，我们并没有减少任何绘制的工作量，只不过是把它们移到了后台线程而已。

那么接下来的问题是，在为主线程减了这么多负之后，程序的响应性能有提高吗？因为要是再没什么变化的话，我要为前面这些花出的时间哭几秒。

接下来我搜到了一篇讲述如何测量程序响应性的[文章](https://medium.com/@mandrigin/ios-app-performance-instruments-beyond-48fe7b7cdf2#.i64rhcfy0)，还附了源码的截图，非常良心。

```swift
fileprivate class PingThread: Thread{
    var pingTaskIsRunning = false
    var semaphore = DispatchSemaphore(value: 0)
    override func main(){
        while !self.isCancelled{
            pingTaskIsRunning = true
            DispatchQueue.main.async {
                self.pingTaskIsRunning = false
                self.semaphore.signal()
            }
            Thread.sleep(forTimeInterval: 1/30.0)
            if pingTaskIsRunning {
                NSLog("Delayed!")
            }
            _ = semaphore.wait(timeout: DispatchTime.distantFuture)
        }
    }
}
```

核心思想是，每隔一定的时间就在主线程给该线程的信号量发消息，要是主线程因为卡顿耽搁了，该线程就会输出警告信息。
我把时间设为1/30秒，因为这是一个流畅的动画所应当达到的帧率。
这下终于有了喜人的对比结果：

之前：
![5613ec79jw1f8m6w0biu1j20wq1321kx.png](https://s2.loli.net/2023/02/28/b3i8ShjLRrGYzAq.jpg)

之后：
![5613ec79jw1f8m6wnhmlfj20y40lowj8.png](https://s2.loli.net/2023/02/28/6ObYeTItMS9R35m.jpg)

直到启动20多秒后收到内存警告，都没有一次卡顿出现！

虽然我不是一个使用meme表情控，但看国外的blog看多了之后，总觉得在这种情况下需要出现一个表情……
就是下面这个：
![5613ec79gw1f8m74cap54j20b40b4aal.png](https://s2.loli.net/2023/02/28/8PlauBF7Wq54TYf.jpg)

## 最后的话
整个项目已经传到了GitHub上：
[https://github.com/zshowing/JSMatrixCodeRainView](https://github.com/zshowing/JSMatrixCodeRainView)

通过这个项目，我学到的东西包括：
- Core Graphic的一些深入内容
- 一些之前用不到的封装策略
- 一个优化绘制性能的方法
- 一个测量程序响应性能的方法


接下来又想到一个比较有趣的项目，不知道什么时候能填坑。
感谢观赏。