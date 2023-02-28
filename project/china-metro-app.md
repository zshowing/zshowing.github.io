---
title : 地铁通App V4.0
cover: ChinaMetro
description: 在之前公司时我负责「地铁通」这个项目，最终在离职前，我决定用当时刚刚稳定下来的Swift语言从底层重写了整个App。
date: 2016年
type: 程序
---
## 序

[地铁通](https://itunes.apple.com/cn/app/tie-tong-touchchina-quan-guo/id530096786?mt=8)是一款覆盖了国内全部和国外部分已开通地铁城市的导航类应用，入选了苹果的AppStore精华，至今仍在地铁关键字搜索排名第一。迄今为止（注：2016年2月）iOS版的总下载数为237万，苹果后台显示的日活跃用户约为5万。

我是从2013年起接手的这个应用，在那之前是一个在中国定居的法国同事[Kevin](https://www.linkedin.com/in/kevintingwingyuen)搭起的总体架构，在SVN显示的第一次提交是2012年6月14日。在这漫长的时间里，由于可以想象的项目进度和迭代压力，重写架构这种费力不讨好的事儿自然一直没法安排。

事实上，小规模的重构（即，单个页面规模）一直在进行，在2014年8月的一个版本我由于花了很大力气重构得比较狠，还恶搞苹果的Jony Ive，用他的口吻做了几页宣传PPT：
![5613ec79jw1f7wyleayk0j20z00iwjsq.png](https://s2.loli.net/2023/02/23/iufRQheXCBxIt1p.jpg)
![5613ec79jw1f7wylci9t9j20z00iwdih.png](https://s2.loli.net/2023/02/23/9OcmF4Rg8PdBY6q.jpg)
![5613ec79jw1f7wyldc3a8j20z00jatci.png](https://s2.loli.net/2023/02/23/KLMpsyJdbRnNUc6.jpg)
![5613ec79jw1f7wylcmw7pj20z00j2juh.png](https://s2.loli.net/2023/02/23/HoIM3rLbQBG1YvU.jpg)
![5613ec79jw1f7wylcuyzjj20z00jgq63.png](https://s2.loli.net/2023/02/23/pvCAscur5RiTUfm.jpg)
![5613ec79jw1f7wylbywtgj20z00jg0t1.png](https://s2.loli.net/2023/02/23/SwQkcmoZNIK4q9b.jpg)
![5613ec79jw1f7wylby2xej20z00iwt8s.png](https://s2.loli.net/2023/02/23/5s7fb1ji9wFoJPS.jpg)

（此处有掌声）  
  

尽管如此，更大规模，或者说，更底层的架构级重构还是一直没时间进行。由于横跨多个业务场景，这种级别的重构工作势必占用几周的完整时间，还要进行彻底的测试。作为一家创业公司是承受不起的，只能想想。

正如Pinterest在介绍他们重写程序架构的blog（[《Re-architecting Pinterest's iOS app》](https://engineering.pinterest.com/blog/re-architecting-pinterests-ios-app)）里面写的：
> A small team of Pinterest iOS engineers was recently given **the opportunity every engineer dreams of** - completely rethinking and rebuilding our app.

直到我决定要离职，出于一种代码洁癖和少许的社会责任感（我觉得在我之后怕是没人能做得起这种量级的代码调整了，难道就把这一坨四年历史的充满补丁的垃圾留给200多万用户吗？），外加一股想要自我救赎的冲动（我认为，能自己把自己的烂代码改掉是一种自我救赎），我向Boss提出了重构申请，作为离职前的最后一个项目。

地铁通4.0项目就这么立项了。

## 程序概貌

在深入讲解之前，我先整体介绍一下地铁通这款app的大致组成。

<img src="https://s2.loli.net/2023/02/23/7sjSYyH31ok4UeF.jpg" width="50%"/>

如上面的主界面截图，地铁通的主要功能就是显示地铁图和查询两个站点间的最佳换乘路线，大概的模块划分如下：

![5613ec79jw1f7xleabzvzj21h016eten.png](https://s2.loli.net/2023/02/23/niL4mGECxHTIbQg.jpg)

## 现存问题

接下来，让我们分析一下在3.x版本的地铁通里面都存在哪些需要改进的问题。

### ViewController职责过多

这可以说是任何一个未精心设计过架构的iOS App必然会导致的结果，在苹果的MVC架构中，ViewController这一级是最容易膨胀的，业界风起云涌的诸如MVVM等架构正是为了解决这种问题。

具体到项目中，比如在展示搜索结果的`线路结果页`中，当线路数据传到这个页面时，需要再次加工才能获得该页面所需要的信息（比如哪个站是换乘站、一共需要换乘几次、计算合理的末班车时间等），而这个工作全部放到了当前ViewController中进行。再加上其他一些处理逻辑，导致这个ViewController变得极端臃肿，达到了令人发指的3000多行。

再比如切换不同城市地铁的`城市列表页`中，由于没有做好适当的分层，导致这个ViewController除了显示城市列表的任务之外，还承担了：
- 点选切换城市之后的数据初始化工作；
- 点选开始下载后的进度更新逻辑，甚至下载完成后的解压逻辑；
- 点选删除城市之后的数据清理工作；
- ...

### 耦合过紧

从上面的结构模块示意图中可以看出，在不同模块之间存在着错综复杂的强依赖，其中尤以`DataSource`最为严重，因为在整个App运行期间都要保持不同界面的某种数据一致性。虽然在之前的架构中特地抽象出了DataSource这个单例，但各个模块间都是直接对其进行操作，不仅繁琐、容易出错，从架构的角度来看，某些底层的操作完全不应该由最上层的ViewController来做。

再举个例子，在3.x版本的地图控件中（即上图的`TileView`），存在着大量处理和用户交互的代码逻辑，甚至还有用户点选起点和终点后直接对`DataSource`进行更新的逻辑。过紧的耦合导致了不必要的判断，到现在我都无法完全搞清之前同事写的下面这几行代码中，那两个神奇的数字到底是干嘛的：

``` objc
    NSInteger tag = -1;
    if ([sender isKindOfClass:[UIButton class]]) {
        UIButton *tmpBtn = (UIButton *)sender;
        tag = tmpBtn.tag;
    }
    if (sender == bubbleView.startBtn || tag == 888 || tag == 887) { // WTF??
        ...
    }
```

### 产品逻辑混乱

这条看起来可能有点甩锅的意思，但实际情况确实如此：如果有哪条逻辑写起来非常拧巴，或者连描述起来都拧巴的时候，你可以去认真思考一下，是不是从产品设计上就出了问题。
虽然从流程上讲，这种上溯应该扼杀在需求评审之类的时机，但从实际执行的角度，已经完成的功能并不代表就是不可更改的。尤其在发现那部分代码已经成为维护地狱的时候，应该当机立断进行修正。

比如在书签/历史线路页面，以前产品的需求是查询过的站点和线路按时间逆序混杂在一起显示，这样导致的结果就是，在构造这个页面时需要大量的动态判断逻辑来区分每个cell到底是什么东西：

``` objc
    NSObject *obj = [historyMArray objectAtIndex:row];
    if ([obj isKindOfClass:[NSDictionary class]]) {
        ...
    }else if ([obj isKindOfClass:[Route class]]){
        ...
    }else if ([obj isKindOfClass:[NSArray class]]){
        ...
    }
    return cell;
```

而如果把页面分为若干个section显示，不仅从根源上杜绝了这种混乱的逻辑，从产品的角度也使用户一眼看上去更加清晰。

### 页面布局方式过时

可能对于大部分现有的App来说，这已经不算是个问题，但对于一个有着几年历史的App，基本上最早的那些界面依然是用绝对坐标进行定位的；加载一个动态生成的UI时，也是一点点计算后再`addSubview`上去，或者修改某个控件的`frame.size.height`来更新其高度。这种做法不仅不优雅，更重要的是不直观。一切不直观的代码都会导致以下几点问题：

- 开发时难以调试；
- 出现bug时难以维护；
- 拿到新需求时难以修改。

所谓的KISS原则（Keep It Simple & Stupid），指的就是这样的场景。

<br>

知道了现有的问题，下面要做的就是一些合理的规划了。

## 架构设计

有了上面所述的教训，在设计新版架构的时候，从最开始就确立了几条原则：
1. 尽量打散耦合，只在有必要的情况下采用紧耦合；
2. 切记合理封装，每个模块严格只负责自己的事务；
3. 争取保持简洁，遇到复杂的实现换用简单的设计。

下面是我当时在日记本上画的下载模块的层次结构示意图：

![5613ec79gw1f7y17wt9lbj21kw0yoe0i.png](https://s2.loli.net/2023/02/23/K2MPzb6Cj9EIcNh.jpg)

每一层之间仅保留最基本的数据请求和数据反馈。

新的结构图大概是这个样子：

![5613ec79gw1f7y26hsd5tj21g412m44r.png](https://s2.loli.net/2023/02/23/GoiHa3z8tvOUyVh.jpg)

最明显的区别就是把模块之间的紧耦合变成了虚线显示的Notification，并且去掉了所有跨级调用。

## 准备工作

在开始项目之前，一个要做的选择是，要用原有的Objective-C还是新生的Swift？

最终我选择了Swift。理由是：

1. Swift经过几年的发展，已经趋于稳定；
2. 此次重写的目标就是要面向未来，而Swift就是未来；
3. 借机学习新的技术。

然后，我用"Swift best practices"作为关键词搜索进行了一番调研，尽量从最开始就站在巨人的肩膀上，往正确的方向走。

比如这篇：https://github.com/futurice/ios-good-practices

一些在项目中采纳的点：

### 使用`struct`来定义常量

在Objective-C时代经常用`#define`来定义常量，现在可以使用`struct`来定义。比如：

    ```swift
    struct CMConfig {
        static let AppName: String          = "xxx"
        static let AppStoreID : UInt        = 8888
        static let WeiboKey: String         = "8888"
        static let WeiboAppSecret: String   = "8888"
        static let AppStoreURL: NSURL       = NSURL(string: "itms-apps://itunes.apple.com/cn/app/bei-jing-de-tie-touchchina/id530096786")!
        ...
    }
    ```

这样可以最大程度地利用Swift*类型安全*的语言特性，使你在编译期就可以检查出一些低级的失误。

### 使用`Asset Catalogs`来图像资源文件

之前的图像资源管理非常混乱，不仅所有文件混杂在目录中，而且每个资源对应着两到三个不同分辨率的@2x, @3x传统位图。
采取Asset Catalog进行统一管理后，不仅工程干净清爽了许多，还可以用一张矢量图来让XCode自动为你生成不同分辨率的资源。记得我刚才说的“面向未来”吗？xD
（没错，矢量图是我自己拿Adobe Illustrator重绘的。）

### 设定合理的Logging策略

之前的项目中一直采用`NSLog`，这样的弊端是在正式上线的App中很难把所有NSLog都屏蔽掉，而这些输出的记录会影响程序效能，还可能泄露隐私。

如果在一开始就设定合理的Logging分级机制，这样在打发布包的时候只需把Looging Level调高（甚至可以在切换scheme的时候自动进行调整），就能杜绝上述问题。

### 使用预处理标志

直接看图：
    ![5613ec79jw1f7yui16xaej20y3046q44.png](https://s2.loli.net/2023/02/23/MmFCd3KfhQxcOli.jpg)

使用Preprocessor Symbol的好处是什么呢？还以刚才的常量定义为例：

```swift
    struct CMConfig {
        ...
    #if Debug
        static let BaseURL : NSURL          = NSURL(string: "https://test.itouchchina.com")!
        static let CMBPushMode : BPushMode  = BPushMode.Development
        static let CMLogLevel : SLogLevel   = SLogLevel.Verbose // 百度推送模式
        static let CMDebugStatus : Bool     = true
        static let CMHeaderClass: String    = "test"
    #else
        static let BaseURL : NSURL          = NSURL(string: "https://production.itouchchina.com")!
        static let CMBPushMode : BPushMode  = BPushMode.Production
        static let CMLogLevel : SLogLevel   = SLogLevel.Error
        static let CMDebugStatus : Bool     = false
        static let CMHeaderClass: String    = "production"
    #endif
    }
```

如此便可以一劳永逸地解决各种常量在开发版和正式版中的切换问题，你从此可以忘掉它，在切换scheme的时候一切都会自动调整，免去了可能的错误。

![5613ec79jw1f7yyy6rullj20b606mdgl.png](https://s2.loli.net/2023/02/23/GZDlLAayWtEMCXO.jpg)

如果你有更多的scheme，希望更细粒度地进行控制，可以使用Swift Flag:

![5613ec79jw1f7yxhrdxltj20tb04yq3v.png](https://s2.loli.net/2023/02/23/bgE8mXPyCVO51es.jpg)

在此不再赘述。

### 使用CocoaPods进行第三方库管理

这点应该大家都熟悉，**谁用谁知道**。

## 详细分析

下面选几个有代表性的页面，分别说明一下改进的细节。

### 城市列表页

#### 问题

1. 如前所述，UI层代码、交互层代码、响应层代码和数据处理以及初始化代码没有合理分离。
2. 城市的下载状态没有一个统一的位置持有。
    设计者的本意是通过进入该页面时生成的一个包含所有City实例的`NSArray`管理，可一旦开始下载，就要涉及`DownloadManager`模块里面的下载状态和当前页面数组中的状态之间的同步等一系列问题。
    同时，我们会发现每次在设置城市的下载状态时都会进行很多判断，这些判断还有不少是重复的。更严重的问题是，一个后续的错误状态也许会覆盖掉之前设置过的正确状态（因为在局部没有足够的上下文信息对状态进行充分的判断）。

    举个例子：

    ```objc
    if (cell.state == CGListTableCellStateEdit) {
        NSString * versionFile = getCGDocumentPath([NSString stringWithFormat: @"guides/guide%d/current.version", [guide.metroAppId intValue]]);
        NSString * version = [NSString stringWithContentsOfFile: versionFile encoding: NSUTF8StringEncoding error: nil];
        NSFileManager * fm = [NSFileManager defaultManager];
        
        if ([fm fileExistsAtPath:versionFile]) {
            if ((version != nil) && ([guide.guideupdate compare: version] != NSOrderedSame))
                cell.guide.cellState = CGListTableCellStateUpdate;
            else
                cell.guide.cellState = CGListTableCellStateDownloaded;
        }else{
            cell.guide.cellState = CGListTableCellStateDownloaded;
        }
        
        [self reloadTableView];
    }
    ```

    这只是一个简单的当用户点击一个**编辑状态**的城市时应该采取的动作，但此处的实现居然恐怖到动用了一个`NSFileManager`！而这一切仅仅是为了判断这个城市应该回复到**已下载**状态还是**有更新**状态。

    类似的代码还可以见到好几处（在该页搜索`NSFileManager`，有多达19个结果！）。
3. 最后一个问题也是上面提到的，搭建UI采用绝对坐标。
    甚至有这样恶心的代码：

    ```objc
    - (void)formatUI{
        CGSize size = [cityNameLabel.text sizeWithFont:cityNameLabel.font];
        CGRect rect;
        rect = cityNameLabel.frame;
        rect.size.width = size.width;
        cityNameLabel.frame = rect;
        
        if (size.width > 74) { // Why 74?
            CGRect rect;
            rect = sizeLabel.frame;
            rect.origin.x = 80 + size.width - 74; // ???
            sizeLabel.frame = rect;
        
            ...
        }
    }
```

#### 改进

##### 下载管理

在地铁通4.0中，我把所有对下载状态的管理一概收到了下载模块`CMDataAPI`中，现在获取下载状态只要一行：

```swift
    var currentMode: CMCityListCellMode = CMDataAPI.sharedInstance.getModeForCity(city)
```
在`getModeForCity(_city: CMCity)`的实现中，只需遍历下载和解压两个队列，如果有必要对结果再进行时间戳的比对即可。（顺便，我把下载的时间戳迁移到了`NSUserDefaults`里，避免了文件操作，并在运行时做了缓存。）

##### 进度更新

而下载进度和解压进度的更新，也被封装成了两个方法，只暴露给调用页面需要的参数（之前的版本中，解压进度甚至是无法查看的）：

```swift
public func hookUpDownloadingProgress
        (_progress: ((UInt, Int64, Int64) -> Void)?,
        success: (CMCity -> Void)?,
        failure: (CMCity -> Void)?,
        forCity city: CMCity){
        ...
}

public func hookUpUnzippingProgess
        (_progress: ((Int, Int) -> Void)?,
        success: (CMCity -> Void)?,
        forCity: city: CMCity){
        ...
}
```

##### 与地图页的解耦合

在切换城市时，对地图页的直接调用改为发`NSNotification`：

```swift
NSNotificationCenter.defaultCenter().postNotificationName(PropertyKeys.kCMCityChangeNotification, object: nil)
```

注意所有的广播名称常量也用前述的`struct`进行了统一的定义。

##### 转移数据操作

所有的数据初始化全部移到`CMDataSource`中进行：

```swift
dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), { () -> Void in
    CMDataSource.sharedInstance.loadCity(city) // One line to rule them all!
    dispatch_async(dispatch_get_main_queue(), {[unowned self] () -> Void in
        SVProgressHUD.dismiss()
        self.navigationController?.dismissViewControllerAnimated(true, completion: nil)
    })
})
```

删除城市数据亦然：

```swift
CMDataSource.sharedInstance.removeCity(city)
```

##### 使用Storyboard/Xib

将UI搭建改为Storyboard/Xib这件事早有很多讨论，略去不表。

#### 成果

| 文件                   | 地铁通V3.x | 地铁通V4.0|
|------------           |:---------:|:-----------:|
|CityListViewController |1712行      |280行       |
|CityListCell           |与上面是同一个文件|123行     |

### 线路结果页

#### 问题

1. 如前所述，对于线路数据需要再进行加工才能使用。

    如图，光是确定各种情况下的末班车时间就有下面一大堆方法：
    ![](https://cdn.cdnjson.com/tvax3.sinaimg.cn/large/5613ec79jw1f7z9j3titcj20se09a0vl.jpg)

    在`tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath`里就更加惨不忍睹。

2. 这个页面在搭建UI上的问题更加严重。
    由于每次生成的路线有无数种可能的组合，比如该城市的数据库中有没有出租车信息、起点终点是地铁站还是用户输入的地点、进行百度/Google搜索时有搜索中和搜索完成/失败三种状态……导致整个UI是在不停变化的，而未采用AutoLayout中约束条件的弊端在这种情况下体现得淋漓尽致。

    恶心代码欣赏：
    ```objc
    if (taxiFee.floatValue < 0.01) {
        [headerView removeTaxi];
    }
    if(discountRate > 0){
        [headerView setDiscountRateUI];
        CGRect headerFrame = headerView.frame;
        headerFrame.size.height += CM_ROUTE_SUM_MARGIN;
        headerView.frame = headerFrame;
    }
    ```

    曾经设计师在挑UI问题的时候提出某处的空白留的不够，当时的我盘算了下在这种纷杂状况下想要精确控制空白高度的工作量……决定把这个bug放到最后再改，后来其他需求一来就不了了之了……

3. 直接操作现象。
    在数据变动要更新UI的时候，经常出现直接去更新相关View控件的代码。初看起来这没什么问题，但还是刚才说的问题，当这涉及到控件大小的改动时，就非常令人头疼了。

#### 改进

##### 引入新数据类型

引入新的`Route`和`RouteNode`对象，将所有与表现层无关的数据构建代码一律移入这里。

顺便，还为今后可能的变动做了扩展：
```swift
convenience init(start:CMPOI, end:CMPOI, algorithm: CMRouteAlgorithm, type: CMRouteType)
```

在初始化对象的时候灵活传入所需的算法，可以实现灵活变换不同的算法计算路线。之前出现过针对海外城市采取不同的路线计算方式，当时的实现弄得非常恶心，这样就优雅很多。
再顺便，这是`策略模式`——在面试中经常被问到“你在项目中用了什么设计模式”这种恶心的问题，特地查了一下这种抽象叫什么。
现在，即使是返回cell的回调方法里也清晰多了：

```swift
public func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
    let node = routeArray[indexPath.row]
        
    if let type = node.type, let lineId = node.lineId{
        switch type{
        case .TimeAdjusting:
            var cell: CMRouteTimeAdjustingCell? = tableView.dequeueReusableCellWithIdentifier(TimeAdjustingCellId) as? CMRouteTimeAdjustingCell
            if cell == nil{
                cell = CMRouteTimeAdjustingCell(style: UITableViewCellStyle.Default, reuseIdentifier: TimeAdjustingCellId)
            }
            ... // Initialization code
            return cell!
        case .Normal:
            var cell: CMRouteNormalStationCell? = tableView.dequeueReusableCellWithIdentifier(NormalStationCellId) as? CMRouteNormalStationCell
            ... // Same as above
            return cell!
        case .POI:
            ...
            return cell!
        case .Transfer, .Start, .Destination:
            ...
            return cell!
        }
        return UITableViewCell()
    }
```

##### 使用约束条件建立UI

现在，整个页面，包括cell，都是用Constraints建立起来的（使用了一个第三方库叫[SnapKit](http://snapkit.io/)）。
而且，cell里面的地铁线路，是用`CoreGraphic`自己画的。
甚至，线路上的文字是黑色还是白色，都是通过算法自动生成的（参考了[这里](http://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color)的讨论）。

<img src="https://s2.loli.net/2023/02/23/vcrZwxE3pKiVmQW.jpg" width="60%">
这样的灵活度基本上算是达标了:)

PS. 在完成整个项目之后，我试着把新版app在iPad上跑了一下，惊讶地发现，在我没有改动任何地方的情况下，居然所有页面的UI都显示正常！这在引入约束条件生成UI之前简直是不可想象的。

##### 只更新数据源，不操作控件

事实上，这就是最基本的MVC分层在实际中的应用——当数据变化时，产生变化的组件只负责更新`DataModel`，然后简单地调用`tableView.reloadData()`搞定。剩下的问题都由`View`层自行负责。

后来在浏览博客时发现有关这样的改动，Eden有一篇[《iOS APP 架构漫谈》](http://studentdeng.github.io/blog/2014/08/29/ios-architecture/)差不多是同样的场景，在那篇文章中解释得非常详尽，尤其是：
>我们可以借鉴很多”内存管理中的规则”，比如`谁创建，谁销毁`。同样，在我们的information flow中，我们希望`谁创建Cache，谁更新Cache变化`

这一句，道破本质。有兴趣的可去观摩。

##### 成果

| 文件 | 地铁通3.x | 地铁通4.0|
|-----|:-------:|:------:|
|RouteViewController|3055行|1158行|
|RouteViewCell|158+67+171+89+220+249+245<br>=1199行&lt;1>|400行|
|Route&lt;2>|1045行|N/A|
|DataModel&lt;3>|N/A|629行|
|DijkstraAlgorithm&lt;4>|N/A|320行|

注：
1. 3.x版本中分为NormalCell、TransferCell、HeaderView、SummaryView等许多文件；
2. 3.x版本中的Route文件其实是算法，生成一个不包含meta信息的`NSArray`；
3. 4.0版本中的DataModel定义了程序所需的所有底层对象，不仅有Route，还有下载的城市以及车站等等；
4. 这是计算图上两点间最短路径的Dijkstra算法的实现，从之前的Route文件中抽了出来。

### 书签/历史页

这个页面之前也提到过，主要问题是设计太混乱。

修改之后的逻辑相当的简洁，想出错都难：

```swift
if indexPath.section == 0{//routes
    let route = favRoutes[indexPath.row]
    return getRouteCell(route as! NSDictionary)
}else{//stations
    let station = favStations[indexPath.row]
    return getStationCell(station)
}
```

成果是：

| 文件 | 地铁通3.x | 地铁通4.0|
|-----|:-------:|:------:|
|BookmarkViewController|784行|315行|
|BookmarkCell|109+98+105=312行|90行|

### 车站详情页

这个页面的代码量与之前基本保持一致，不同的是整体的UI搭建逻辑。
之前的搭法：从上到下依次初始化子控件并添加，保持一个`position`变量记录当前高度。
新版中的搭法：每个子控件负责处理自己的UI展现，子控件之间用约束条件加以绑定。
由于这个页面的数据都是不确定的，因此只能用代码添加数据元素间的约束条件，这是与前面那些大体UI已定好只待往里填数据的页面不同的地方。

最终的画风大概是这样的：

```swift
scrollView.translatesAutoresizingMaskIntoConstraints = false
scrollView.addSubview(titleBackgroundView)
scrollView.addSubview(timetableView)
scrollView.addSubview(facilitiesView)
scrollView.addSubview(exitView)
self.view.addSubview(scrollView)

scrollView.snp_makeConstraints { (make) -> Void in
    make.top.equalTo(self.view.snp_top)
    make.width.equalTo(self.view.snp_width)
    make.bottom.equalTo(floatingBGView.snp_top)
}
titleBackgroundView.snp_makeConstraints { (make) -> Void in
    make.top.equalTo(scrollView.snp_top).priorityRequired()
    make.width.equalTo(scrollView.snp_width).priorityRequired()
}
timetableView.snp_makeConstraints { (make) -> Void in
    make.top.equalTo(titleBackgroundView.snp_bottom).offset(10.0)
    make.width.equalTo(scrollView.snp_width)
    make.centerX.equalTo(scrollView.snp_centerX)
}
facilitiesView.snp_makeConstraints { (make) -> Void in
    make.top.equalTo(timetableView.snp_bottom).offset(20.0)
    make.width.equalTo(scrollView.snp_width)
    make.leading.equalTo(scrollView.snp_leading)
}
exitView.snp_makeConstraints { (make) -> Void in
    make.top.equalTo(facilitiesView.snp_bottom).offset(20.0)
    make.leading.equalTo(scrollView.snp_leading)
    make.width.equalTo(scrollView.snp_width)
    make.bottom.equalTo(scrollView.snp_bottom).offset(-Constants.StationDetailViewVerticalSpacing)
}
if let _station = station{
    titleLabel.text = _station.stationName
    iconsDisplayView.setImages(_station.getIcons())
    timetableView.setup(_station.timeTables)
    facilitiesView.setupUI(_station.facilities)
    exitView.setupUI(_station.exits)
}
```

UI约束与数据初始化一气呵成，而且清晰明了。（顺便感谢Swift的链式语法）

### 搜索页

用到搜索页的地方有两处，一个是首页点击最上方进入的页面，一个是首页点击下方右边按钮进入的页面。两者的不同是：前者有输入起点和终点的工具栏，后者只是单纯搜索定位车站。

![5613ec79jw1f7ztpzxw31j21jk0xcn1y.png](https://s2.loli.net/2023/02/23/yb5M2LcIEAno8Vf.jpg)

#### 问题

1. 之前的版本的两个界面完全独立，等于许多逻辑重复了两遍，违背了DRY(Don't Repeat Yourself)原则。
2. 和线路详情页类似，此处也缺少对数据合理的对象化封装，导致在使用时需要大量的判断逻辑。
    比如，会出现下面这样的代码片段：
    ```objc
    if ([workDict objectForKey:@"city"] != nil && [[workDict objectForKey:@"city"] isEqualToString:_cityName]) {
        _isShowingWork = YES;
        if ([workDict objectForKey:@"add"] == nil) { // Station
            ...
        }
        else { // POI
            [self updateHistoryItem:workDict];
        }
    }
    else{ // Have not set
        ...
    }
    ```

    这种直接对原始数据进行操作的做法实在是既繁琐又容易出错。
3. 对子控件的直接更新，这点和前面的线路结果页类似，但更加麻烦：由于当前编辑状态在随时变化，在决定更新控件时必须由零碎的变量来辅助判断到底要对哪个控件进行操作。
    比如在百度定位API返回结果之后，下面的这段响应代码：

    ```objc
    - (void)updatePOIFromLocation:(BMKPoiInfo *)info{
    Station *station = [[CMDataSource getInstance] getNearestStation:info.pt.latitude andLo:info.pt.longitude];
    
    if (isUpdatingStart) {
        ... // Do some work
        self.currentEditing = CMSearchEditingEnd;
    }else if (isUpdatingEnd){
        ... // Doing work
    }
    
    if (isUpdatingStart) {
        isUpdatingStart = NO;
        _startIsShowingLocation = YES;
    }
    
    if (isUpdatingEnd) {
        isUpdatingEnd = NO;
        _endIsShowingLocation = YES;
    }
}
```

又要凭借状态变量进行判断，又要记得时刻更新它们，还得防止考虑不周更新错了状态，简直是车祸现场。

#### 改进

##### 合并两个页面

我直接把两个页面合并到了一起，由入口参数决定最终显示哪个界面。
但后来意识到，这并不是最好的解决方案。弊端是，原来是毫无耦合造成重复，现在两个页面的耦合又太紧了，虽然在这版的需求中工作得很好，再有调整又会比较棘手。更好的做法是使用`组合`，把公共的列表提取出来。
这一点在Casa的[《跳出面向对象思想(一) 继承》](http://casatwy.com/tiao-chu-mian-xiang-dui-xiang-si-xiang-yi-ji-cheng.html)中解释得非常好，我就不再赘述。

##### 新定义数据对象

在前面提到的`DataModel`中增加了`POI`对象，包含`Station`作为它的一个property。

这代表，现在整个界面中，甚至整个app运行期间，都只有一种数据对象——`CMPOI`，清爽，干净，不紧绷。

##### 只更新数据源，不操作控件

基本同前，不赘述。

##### 成果

| 文件 | 地铁通3.x | 地铁通4.0|
|-----|:-------:|:------:|
|SearchStationViewController|2019行|469行|
|StationSearchView|821行|N/A|

### DataSource

#### 明确职责

这个组件作为整个app的数据中心，在新版的开发中更加明确了它的职责，把原来分散在其他组件中的一些功能划了过来。
比如，之前城市列表读取及解析功能是被划到网络请求组件中的，因为从服务器拿过来的返回数据可以就地解析；但从更高层的逻辑考虑这是不正确的，因为对程序城市列表的需求是更直接的，网络模块只要做好本职的网络交互就行了。
修改之后，网络请求组件读取成功城市列表后，并不直接返回，而是将列表保存到本地缓存起来，再发一个Notification通知到关心读取成功这个事件的其他组件：

```swift
func updateCityList(){
    ... // Initialization code for paramaters
        
    let param: [String : String] = ["param": JSONStringParam]
        
    manager.POST(url, parameters: param, success: { (opreation, object) -> Void in
        let data = object as! NSData
        if CMDataSource.sharedInstance.loadXMLResponse(data) == true{
            let documentPath = getDocumentPath("guides/guides.info")
            data.writeToFile(documentPath, atomically: true)
                
            NSNotificationCenter.defaultCenter().postNotificationName(PropertyKeys.kCMCityListUpdateSuccessNotification, object: nil)
        }
    }) { (opreation, error) -> Void in
                ... // Error handler
        }
    }
```

将组件间的耦合降到最低。另外注意这段代码中对返回结果的解析已经移到`DataSource`了。

#### 减少耦合

正如上面提到的做法，之前诸多对`DataSource`直接的操作，在这一版中有许多都改为了通过Notification交互：

```swift
init(){
    let cityComponents = getCityListFromFile()
        
    ... // Data initialization
        
    NSNotificationCenter.defaultCenter().addObserver(self, #selector(CMDataSource.didSetStart()), name: PropertyKeys.kCMSetStartStationNotification, object: nil)
    NSNotificationCenter.defaultCenter().addObserver(self, #selector(CMDataSource.didSetEnd()), name: PropertyKeys.kCMSetEndStationNotification, object: nil)
    NSNotificationCenter.defaultCenter().addObserver(self, #selector(CMDataSource.didRemoveStart()), name: PropertyKeys.kCMRemoveStartNotification, object: nil)
    NSNotificationCenter.defaultCenter().addObserver(self, #selector(CMDataSource.didRemoveEnd()), name: PropertyKeys.kCMRemoveEndNotification, object: nil)
}
    
deinit{
    NSNotificationCenter.defaultCenter().removeObserver(self)
}
```

### 其他

对于与上面谈到的改进点比较接近的页面，限于篇幅不再赘述，只在此处一并提及：

- `地图View`，去掉了与上层的所有耦合，交互改为发`NSNotification`；同时将地图上要显示的控件统一到一个`protocol`之下，这样就可以利用Swift新提供的`泛型`特性，写出很强一致性的代码：
    ```swfit
    func updateCoor<T: TiledScrollViewOverlay where T: UIView>(_view: T, zoom: Bool){
        ... // Update code
    }
    ```
- `网络请求模块`，上面已有提及，在移除不属于自身逻辑的同时，重新整理了解析数据的时机（原来的版本中居然重复着极为相似的三段代码！又一个车祸现场）；
- `分享模块`，之前的封装使用非常繁琐，每次还要自行加到UIWindow上去。于是又重新写了一个，弹出分享控件只需下面几步：
    ```swift
    let shareKit: CMShareKit = CMShareKit.getInstance()
    shareKit.setup("分享文字", 
        emailBody: "邮件文字", 
        smsBody: shareContent, 
        weixinTitle: appName, 
        weixinBody: shareContent, 
        weixinPengyouBody: shareContent, 
        weixinURL: CMConfig.AppDownloadURLTrim.absoluteString, 
        qqTitle: appName, 
        qqBody: shareContent, 
        qqURL: CMConfig.AppDownloadURLTrim.absoluteString, 
        weiboBody: shareContent, 
        image: self.getCurrentViewShot())
    shareKit.show(self)
    ```
    后来看到Matt Gemmell在他的[《API Design》](http://mattgemmell.com/api-design/)这篇blog中也不谋而合地提到了这一点：

    > Rule 6: **Get up and running in 3 lines**
    > Excluding delegate methods, you should aim to make it usable at least for testing purposes with only 3 lines of code.
    > Those lines are:
    >> Instantiate it.
    >> Basically configure, so it will show and/or do something.
    >> Display or otherwise activate it.  
    >     
    > That should be it. Anything substantially more onerous is a code smell.


- `添加/删除书签和历史模块`，干掉，完全移入`DataSource`。并且前一版本是把数据序列化后保存为文件，这导致了相当大的性能问题，在暴力测试疯狂增删时甚至可能导致崩溃。新版中改为只保存必要的信息（比如起点和终点），等需要时再把路线实时计算出来即可。

## 一些私心

上面基本把大块的重构页面讲完了，下面说几个旧版本中没有的页面，也算是我自己的私心。
考虑到这是我最后一次负责这个项目，也是第一次有如此大的决定权，我不禁在重构之余腾出手来加了一些自己想加的页面。

### 致谢页面

作为一个有点情怀的程序员，我一直对于程序中没有对开源库的致谢这一点耿耿于怀。以前对项目没有话语权，也腾不出手做，这次怎么也得补上：
<img src="https://s2.loli.net/2023/02/23/ThS49zNxY6cOBmX.jpg" width="60%">
注：由于当时在发布时CocoaPods和Swift还有些兼容性问题，所以没有用CocoaPods自动生成的，而是自己写了个HTML网页。

### 关于页

关于页也是夙愿之一。事实上更早的版本中有这个页面，但由于一些不可考的原因给砍掉了。
我仿照之前的关于页用Photoshop作了个图，并且顺便把以前版本的关于页也加了进来，往右边滑动即可看到。虽然这么个深藏在n级页面之下的页面估计没多少人点进来，但总算还是为以前那些已经离职的曾经为地铁通出过力的同事在这个角落立了个碑。

<img src="https://s2.loli.net/2023/02/23/SqCpQsx6ad5Z1og.jpg" width="60%">

### 历史版本

这个点子我是在做好线路详情页的时候想到的：既然我做了一套可以在cell上画线路的代码，那么我可以把它复用到别的地方啊——比如整个地铁通的发展史！
于是就有了下面的页面：

<img src="https://s2.loli.net/2023/02/23/GJKOikCTs1F7LPt.jpg" width="60%">

看起来很简单，其实做起来还是有点麻烦的。我在元旦跨年的时候去了趟日本休年假，途中带上了笔记本电脑，那真是一有时间就在做这个页面啊……

![5613ec79jw1f7y52ic05dj21hc1z4x0s.png](https://s2.loli.net/2023/02/23/uDrE93QBvgadKCX.jpg)

### 末班车提示

这也是我私心特别想做的功能，也借着这次机会做了出来：

<img src="https://s2.loli.net/2023/02/23/MExPOTJo6Kj4XUG.jpg" width="60%">

上个动图演示：

![5613ec79gw1f80yq2elx9g20c80lrnpd.png](https://s2.loli.net/2023/02/23/eN1rVqMzhPkomws.gif)

对于地铁线路而言，首班车很简单——只需从数据库中读取起点站的首班车信息即可。可末班车却复杂得多，它既不是简单的起点站末班车时间，也不是最后一个换乘站的末班车时间，而是有点类似于木桶原理，取决于短板——也就是说，取决于整条换乘路径中收班最早的换乘站。
在之前的版本中，我们实现了这个算法，但不时有用户表示疑惑：这个末班车是怎么算出来的？为什么这么诡异？
上面的这个功能就是对这个问题的优雅解答，一切都是自解释的：在用户操作的时候就能注意到变化，一句多余的说明都不用。
只要赶上标红字的站点的末班车，整条末班车线路就能成立。

事实上，之前的产品经理曾经做出过一版设计：
<img src="https://s2.loli.net/2023/02/23/r58NUvdsSymeVpO.jpg" width="60%">

我不喜欢这个设计，因为它割裂了上下文。弹窗是个十分影响交互体验的设计模式，除非你一定要显式地引起用户注意，否则引入弹窗就是错误的。电脑出栈入栈尚且有开销，何况人脑？（另外注意这个页面里的“首班车”和“末班车”按钮——没有比这俩按钮更突兀的设计了）
后来这个功能在反对声中索性被砍掉了，但我还是觉得这个需求是有必要的，只是需要找到更合理的设计。
在找到现在这个解决方案之前也纠结了很久，最终在某个凌晨能很快实现还是要归功于这次合理的架构设计，很难想象在之前那一坨3000行的代码里加个这种功能要抓狂到什么地步。

### 彩蛋

是的，作为一个有着不止一点情怀的程序员……我还埋了个彩蛋，估计没人发现过，即使如此我也不想说xD
PS. 那些大公司的软件里彩蛋到底是怎么埋的？一Code Review不是就直接被辞退了吗？

## 未竟事业

事实上，我还抽空稍微规划了一下iPad版本的地铁通：
![5613ec79jw1f87g7fusumj21kw11xk57.png](https://s2.loli.net/2023/02/23/mExW1lZiNCtI3gb.jpg)

但由于时间实在是不够用，最终作罢。

## 跋

基本写完了程序主体，然后我又开始做起了市场。
当时赶工时每天唯一的娱乐是伴饭看一集《广告狂人》，所以到这个想广告词的环节觉得特别带感，感觉Don Draper（《广告狂人》男主角）上身。
于是就有了我用Photoshop做的下面这一批AppStore宣传图：

![5613ec79jw1f811hg8q9kj21kw0k7dnk.png](https://s2.loli.net/2023/02/23/gc6xaVe42CpjwTI.jpg)

扶上驴，送一程。至此，对于这个项目，我的任务差不多完成了。
用户反馈差不多是这样：

<img src="https://s2.loli.net/2023/02/23/XfZDGl1n7TsxCuI.jpg" width="60%">

就用项目刚开始时我在豆瓣发的一条广播来结束本文吧：

<img src="https://s2.loli.net/2023/02/23/IPHQlh3BS78Ff1v.jpg" width="60%">