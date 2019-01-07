# 0 联系我
![](http://upload-images.jianshu.io/upload_images/4685968-10e219418608a3d4?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "图片标题") 
1.Q群【Java开发技术交流】：[https://jq.qq.com/?_wv=1027&k=5UB4P1T](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
2.完整博客链接:[www.shishusheng.com](https://blog.csdn.net/qq_33589510)
3.知乎:[http://www.zhihu.com/people/shi-shu-sheng-](http://www.zhihu.com/people/shi-shu-sheng-)
4.gayhub:[https://github.com/Wasabi1234](https://github.com/Wasabi1234)

# 0.0 相关源码链接
https://github.com/Wasabi1234/design-patterns

# 1 定义
![](https://upload-images.jianshu.io/upload_images/4685968-f3e6ce1684ece913.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
也叫做政策模式（Policy Pattern）
- 维基百科
对象有某个行为，但是在不同的场景中，该行为有不同的实现算法.
比如每个人都要“交个人所得税”，但是“在美国交个人所得税”和“在中国交个人所得税”就有不同的算税方法.
- 定义
Define a family of algorithms,encapsulate each one,and make them interchangeable.
定义一组算法,将每个算法都封装起来,并且使它们之间可以互换.


在`运行时`(非编译时)改变软件的算法行为
- 主要思想
定义一个通用的问题,使用不同的算法来实现,然后将这些算法都封装在一个统一接口的背后.

![策略模式的通用类图](https://upload-images.jianshu.io/upload_images/4685968-ad1caf184324decf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
策略模式使用的就是面向对象的继承和多态机制

策略模式的三个角色
● Context 封装角色
也叫做上下文角色，起承上启下封装作用;
屏蔽高层模块对策略、算法的直接访问，封装可能存在的变化.

● Strategy抽象策略角色
策略、算法家族的抽象，通常为接口，定义每个策略或算法必须具有的方法和属性

● ConcreteStrategy具体策略角色
实现抽象策略中的操作，含有具体的算法

### 通用源码
- 抽象策略角色，它是一个非常普通的接口，在我们的项目中就是一个普通得不能再普通的接口了，定义一个或多个具体的算法


# 2 适用场景
针对一个对象，其行为有些是固定的不变的，有些是容易变化的，针对不同情况有不同的表现形式。那么对于这些容易变化的行为，我们不希望将其实现绑定在对象中，而是希望以动态的形式，针对不同情况产生不同的应对策略。那么这个时候就要用到策略模式了。简言之，策略模式就是为了应对对象中复杂多变的行为而产生的。

- 系统有很多类,而他们的区别仅仅在于他们的行为不同
- 一个系统需要动态地在几种算法中选择一种

# 3 优点
- 符合开闭原则
- 避免使用多重条件转移语句
比如省去大量的 if/else 和 switch 语句,降低代码的耦合
- 提高算法的保密性和安全性
只需知道策略的作用,而不关心内部实现

# 4 缺点
- 客户端必须知道所有的策略类,并自行决定使用哪一个策略类
- 产生很多策略类

# 5 相关设计模式的差异
## 策略模式和工厂模式
- 行为型
接收已经创建好的对象,从而实现不同的行为
- 创造型
接收指令,创建出符合要求的具体对象

## 策略模式和状态模式
- 若系统中某个类的某个行为存在多种实现方式,客户端需要知道到底使用哪个策略
- 若系统中某个对象存在多种状态,不同状态下的行为又具有差异性,状态之间会自动转换,客户端不需要关心具体状态

# 6 实战
![](https://upload-images.jianshu.io/upload_images/4685968-0ebc08f41e07cdca.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/4685968-98e2b70fe0d9a3f0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ecbce7b0043a7490.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-5dab16664b2d6639.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-57e3f0490d67cfb0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-8a75a258378f8a69.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![image.png](https://upload-images.jianshu.io/upload_images/4685968-844075f01a9e349b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
改造后的测试类
![](https://upload-images.jianshu.io/upload_images/4685968-4991d2eaad9357c1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
可见 if/else 语句过多,采取策略+工厂模式结合
- 策略工厂
![](https://upload-images.jianshu.io/upload_images/4685968-230088ca260db256.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 最新测试类
![](https://upload-images.jianshu.io/upload_images/4685968-acf80da4fa5ea954.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 输出结果
![](https://upload-images.jianshu.io/upload_images/4685968-7d26033a1b39bd6a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 7 源码应用解析
## JDK中的比较器接口
- 策略比较器
![](https://upload-images.jianshu.io/upload_images/4685968-307666896c3d1800.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![具体策略](https://upload-images.jianshu.io/upload_images/4685968-d928dd16bea44a60.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
比如Arrays类中的 sort 方法通过传入不同比较接口器的实现达到不同排序策略
![](https://upload-images.jianshu.io/upload_images/4685968-f92073712e30ce66.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## JDK中的TreeMap
类似于促销活动中有促销策略对象,在T reeMap 中也有比较器对象
![](https://upload-images.jianshu.io/upload_images/4685968-424f787da17d4876.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
compare 方法进步加工
![](https://upload-images.jianshu.io/upload_images/4685968-32e02456542c1e48.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## Spring 中的Resource
不同访问策略
![](https://upload-images.jianshu.io/upload_images/4685968-66d6191177faaf2a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## Spring 中bean 的初始化ceInstantiationStrategy
- 两种 bean 的初始化策略
![](https://upload-images.jianshu.io/upload_images/4685968-8fa5e44e491aafdc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
