---
title: 一个统一的返回样式方案
date: 2016-12-08 01:12:35
categories: Code
tags:
- iOS
- Objective-C
- Code
description: 记录了开发一整套返回按钮解决方案的思考过程和实施方案。
---
最近接手了一个已经开发了几年的项目，里面各种风格的代码都有，很多时候会看到完成同一件事，不同的人会调用截然不同的“公用”方法。

恰好赶上产品设计团队有一个在产品内部统一返回样式的任务，让我有机会可以在一个整体的高度上完整地考虑这一小块的问题。

## 现状

经过对现有代码的搜索和整理，当前工程中在设置返回按钮时，有下面几种形式：

1. 直接创建一个Button，配置后传入`UIBarButtonItem`的`initWithCustomView`方法，之后设为`navigationItem.leftBarButtonItem`；
2. 调用一个封装好的`attachBackButton`方法；
3. 调用另一个封装好的`- (void)setupBackButtonWithText:(NSString *)title color:(UIColor *)color target:(id)target action:(SEL)selector`方法，此方法位于一个`UIViewController`的category中；
4. 调用再另一个封装好的`+ (UIBarButtonItem *)createBackButtonWithText:(NSString*)title color:(UIColor*)color target:(id)target action:(SEL)selector`方法，此方法与上一个方法的主要区别是：箭头所用的资源不同，所以前者是黑色箭头，这里是白色箭头。

而设计团队提出的统一视觉样式方案为：

- 二级页面返回采用形如 “< 工作台” 样式；
- 其他页面统一为形如 “<” 样式。

## 分析

总结一下，对于返回按钮的需求，其实包含了三个维度的定制需求。

首先是__样式__。

返回的箭头是一张自定义的图片。

其次是__文字内容__。

iOS的系统默认行为是在返回按钮处显示上一个页面的标题，这里显然要通过自定义来取代默认效果。
而且注意，这里要支持文字的更新。

最后是__颜色__。

这一点的情况比较多，首先它包含两个部分：文字颜色和箭头颜色，这意味着要对自定义图片中箭头的颜色进行更换；另外除了显式地指定颜色外，当`NavigationBar`的颜色改变时，返回按钮的颜色显然要有对应的改变，即：浅色背景对应深色（黑色）文字，深色背景对应浅色（白色）文字。

## 实现

我们来试着一步步达成需求。

### 实现自定义箭头

第一步比较简单，只需调用系统提供的方法即可实现：

```objc
[[UIBarButtonItem appearance] setBackButtonBackgroundImage:backButtonImage
                                                forState:UIControlStateNormal
                                                barMetrics:UIBarMetricsDefault];
```

### 隐藏系统默认文字

实现这个也比较简单，只需新增一个`UINavigationItem`的category:

```objc
#import "UINavigationItem+BackButton.h"

@implementation UINavigationItem(BackButton)

- (UIBarButtonItem *)backBarButtonItem
{
    return [[UIBarButtonItem alloc] initWithTitle:@"" style:UIBarButtonItemStylePlain target:nil action:nil];
}

@end
```

截至目前，经过两个简单的步骤，我们已经达到了默认的效果：不经任何配置时，push一个新的页面，会显示一个只有自定义返回箭头，没有文字的返回按钮。

接下来，我们要针对其他情形进行定制。

### 实现自定义文字

由于`UINavigationItem`的`backBarButtonItem`方法已经被我们使用，此处我们用自己生成的`UIBarButtonItem`设置到`UINavigationItem`的`leftBarButtonItem`中，来达到实现自定义文字的目的。

具体实现的代码特别常规，唯独要说明的是，这里的箭头要根据传进来颜色值变换颜色，来和文字匹配，具体不表。

方法名依然是`- (void)setupBackButtonWithText:(NSString *)title color:(UIColor *)color target:(id)target action:(SEL)selector`，后面会用到。

### 实现在返回按钮显示上一个页面标题

为了便于灵活配置，我们新增一个`UIViewController`的category，并增加一个property来开启此项功能：

```objc
@interface UIViewController (NavigationAddition)
@property (nonatomic, assign) BOOL showPreviousViewTitleAsBackButtonTitle;
@end

@implementation UIViewController (NavigationAddition)
const char * backButtonTitleValue;
-(void)setShowPreviousViewTitleAsBackButtonTitle:(BOOL)isShowPreviousViewTitleAsBackButtonTitle{
    objc_setAssociatedObject(self, &backButtonTitleValue, @(isShowPreviousViewTitleAsBackButtonTitle), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    if (isShowPreviousViewTitleAsBackButtonTitle) {
        NSArray *viewControllers = [[self navigationController] viewControllers];
        if (viewControllers.count > 1) {
            UIViewController *previousViewController = [viewControllers objectAtIndex:([viewControllers indexOfObject:self] - 1)];
            [self setupBackButtonWithText:previousViewController.navigationItem.title color: [UIColor blackColor] target:self action:@selector(backButtonPressed:)];
        }
    }
}

- (void)viewWillAppear:(BOOL)animated{
    id boolObject = objc_getAssociatedObject(self, &backButtonTitleValue);
    if (boolObject != nil) {
        BOOL isShowPreviousViewTitleAsBackButtonTitle = [(NSNumber *)boolObject boolValue];
        if (isShowPreviousViewTitleAsBackButtonTitle) {
            [self setShowPreviousViewTitleAsBackButtonTitle:isShowPreviousViewTitleAsBackButtonTitle];
        }
    }
}
@end
```

在property的setter方法中，我们用runtime方法为UIViewController新增了一个属性，增加的原因是，有时我们需要在`UIViewController`创建时灵活指定此行为，而不是在构造方法中配置。

这样，在`viewWillAppear`方法中再去读取这个属性，就能实现灵活配置所需行为的目的。

在具体的实现中，实际上是取了当前`NavigationController`的`viewControllers`属性数组中当前页面的前一个变量，然后读取它的标题。

然而，以上的实现还是遗留了一些问题。比如，这里对字体的颜色进行了hardcode；另外，当实际代码中在`viewWillAppear`里又设置了`NavigationBar`的颜色的时候，两者就可能产生冲突，最终的效果就是可能会看不清按钮。

所以，我们还需要增加一些逻辑。

### 处理颜色

首先，我们再为`UIViewController`增添一个属性，来储存自定义的后退按钮颜色。

```objc
const char * backButtonForcedColorValue;

- (void)setupBackButtonWithText:(NSString *)title color:(UIColor *)color target:(id)target action:(SEL)selector;
{
    if (color != nil) {
        objc_setAssociatedObject(self, &backButtonForcedColorValue, color, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    self.navigationItem.leftBarButtonItem = [self.class reateBackButtonWithText:title color:color target:target action:selector];
}
```

一旦显式地为后退按钮指定了颜色，这里就会储存下来。

然后，在设置后退按钮时，我们再把这个属性取出来：

```objc
-(void)setShowPreviousViewTitleAsBackButtonTitle:(BOOL)isShowPreviousViewTitleAsBackButtonTitle{
    ... // 略

    UIColor *defaultColor = [UIColor blackColor];
    id colorObject = objc_getAssociatedObject(self, &backButtonForcedColorValue);
    if (colorObject != nil && [colorObject isKindOfClass:[UIColor class]]) {
        defaultColor = (UIColor *)colorObject;
    }
    [self wbg_setupBackButtonWithText:previousViewController.navigationItem.title color:defaultColor target:self action:@selector(backButtonPressed:)];
}
```

其次，我们因为在设置后退按钮时一定要给定一个颜色，但只有少数时候我们是真正要指定一种颜色（比如蓝色），其他时候只是取一个合理的值即可。为了区分显式指定和自动指定两种情况，我们再加一个指示：

```objc
const UIColor * UIColorAutomatic;
```

所以最终的方法是这样的：

```objc
- (void)setupBackButtonWithText:(NSString *)title color:(UIColor *)color target:(id)target action:(SEL)selector;
{
    if (color != nil && color != UIColorAutomatic) {// 只在不为自动颜色的时候才设置这里的颜色变量
        objc_setAssociatedObject(self, &backButtonForcedColorValue, color, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    
    self.navigationItem.leftBarButtonItem = [self.class createBackButtonWithText:title color:[self getProperItemColor] target:target action:selector];
}

- (void)setShowPreviousViewTitleAsBackButtonTitle:(BOOL)isShowPreviousViewTitleAsBackButtonTitle{
    objc_setAssociatedObject(self, &backButtonTitleValue, @(isShowPreviousViewTitleAsBackButtonTitle), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    if (isShowPreviousViewTitleAsBackButtonTitle) {
        NSArray *viewControllers = [[self navigationController] viewControllers];
        if (viewControllers.count > 1) {
            UIViewController *previousViewController = [viewControllers objectAtIndex:([viewControllers indexOfObject:self] - 1)];

            [self setupBackButtonWithText:previousViewController.navigationItem.title
                                    color:UIColorAutomatic // 这个方法只负责开启带文字的返回按钮，并不指定颜色，所以传入自动
                                   target:self
                                   action:@selector(backButtonPressed:)];
        }
    }
}
```

然后，在设置`NavigationBar`颜色的时候，还需要同步更新一下按钮的颜色：
```objc
- (void)setNavigationBarColor:(UIColor *)barColor
{
    ...
    // 设置导航条颜色代码
    
    [self setNavigationBarItemColor: [self getProperItemColor]];    // 设置NavigationItem的颜色
    [self setupCustomizedBackButtonIfNeeded];                       // 如果需要，设置自定义按钮的颜色
}
```
由于我们的返回箭头是个自定义的图片，所以在每次颜色改变时，都需要用新的颜色的箭头图片重新设置一次。为此，我们再次新加一个category来达到这个目的：

```objc
@interface UINavigationBar(CustomColor)
@end

@implementation UINavigationBar(CustomColor)
- (void)setTintColor:(UIColor *)tintColor{
    [super setTintColor:tintColor];
    
    UIImage *arrowImage = [UIImage imageNamed:@"navi_back_icon"];
    
    UIGraphicsBeginImageContextWithOptions(arrowImage.size, NO, arrowImage.scale);
    CGRect rect = CGRectMake(0, 0, arrowImage.size.width, arrowImage.size.height);
    [tintColor set];
    UIRectFill(rect);
    [arrowImage drawAtPoint:CGPointMake(0, 0) blendMode:kCGBlendModeDestinationIn alpha:1];
    UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    UIImage *backButtonImage = [newImage resizableImageWithCapInsets:UIEdgeInsetsMake(0, 20, 0, 0)];
    
    [[UIBarButtonItem appearance] setBackButtonBackgroundImage:backButtonImage
                                                      forState:UIControlStateNormal
                                                    barMetrics:UIBarMetricsDefault];
}
@end
```

同时，后一个方法其实就是把之前写在`viewWillAppear`里的代码挪了过来：

```objc
-(void)setupCustomizedBackButtonIfNeeded{
    id boolObject = objc_getAssociatedObject(self, &backButtonTitleValue);
    if (boolObject != nil) {
        BOOL isShowPreviousViewTitleAsBackButtonTitle = [(NSNumber *)boolObject boolValue];
        if (isShowPreviousViewTitleAsBackButtonTitle) {
            [self setShowPreviousViewTitleAsBackButtonTitle:isShowPreviousViewTitleAsBackButtonTitle];
        }
    }
}

- (void)viewWillAppear:(BOOL)animated{
    [self setupCustomizedBackButtonIfNeeded];
}
```

而`getProperItemColor`方法集中处理了合理的颜色值：

```objc
- (UIColor *)getProperItemColor{
    UIColor *defaultColor = UIColorAutomatic;
    id colorObject = objc_getAssociatedObject(self, &backButtonForcedColorValue);
    if (colorObject != nil && [colorObject isKindOfClass:[UIColor class]]) {
        // 如果存在钦定的颜色，读取之
        defaultColor = (UIColor *)colorObject;
    }else{
        // 否则，根据导航条背景颜色自动决定颜色
        CGFloat red, green, blue;
        UIColor *color;
        
        UINavigationBar *bar = self.navigationController.navigationBar;
        if ([bar isKindOfClass:[CRGradientNavigationBar class]]) {
            CRGradientNavigationBar *crBar = (CRGradientNavigationBar *)bar;
            NSArray *colors = crBar.gradientLayer.colors;
            if (colors.count > 0) {
                color = [UIColor colorWithCGColor:(__bridge CGColorRef)colors[0]];
            }else{
                color = [UIColor whiteColor];
            }
        }else{
            color = self.navigationController.navigationBar.barTintColor;
        }
        
        // 根据背景颜色自动决定前景颜色，参考以下网址的算法
        // http://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
        [color getRed:&red green:&green blue:&blue alpha:nil];
        CGFloat luminance = red * 0.299 + green * 0.587 + blue * 0.114;
        
        defaultColor = luminance > 186.0 / 256.0 ? [UIColor blackColor] : [UIColor whiteColor];
    }
    
    return defaultColor;
}
```

如果存在之前设定过的颜色值，就取出并且返回；否则就根据当前导航条的颜色自动设置为与之反向的颜色。这里参考了一篇Stackoverflow上的[讨论帖](http://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color)，直接拿过来了其中使用的算法。

至此，我们已经达到了预期的目的，而且在调用时也比较方便，自动处理了大部分的情况。比如，如果仅仅想改变返回按钮的颜色，之前可能会创建一个仅指定了颜色的按钮并设置为返回按钮，现在则可以写`[self setNavigationBarItemColor:[UIColor someCustomColor]]`，虽然代码量与之前一样，但逻辑上比较优雅。

但是也遇到了两个坑：一个是某个二级页面采用了HTML页面实现，所以特别蛋疼地需要手动通过回调处理一切更新；另一个是某个页面是自己创建了一个`UINavigationController`然后push进来的（因为该页面需要侧边栏），导致没法拿到上级页面的名称，只能不用`showPreviousViewTitleAsBackButtonTitle`属性，退而求其次用`setupBackButtonWithText`方法自行创建一个后退按钮。

## 最终效果

- 默认情况：什么都不用做，自动出现自定义的“<”；
- 需要显示上级页面：设置`showPreviousViewTitleAsBackButtonTitle`属性；
- 需要自定义按钮文字：方法1. 调用`setupBackButtonWithText`方法，用于指定颜色；方法2. 调用'attachBackButtonTitle:'方法，用于自动获取颜色。