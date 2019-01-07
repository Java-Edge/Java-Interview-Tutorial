
[相关源码链接点我](https://github.com/Wasabi1234/Java-DesignPatterns-Tuitorial)
# 1 简介
## 1.1 定义
也叫做政策模式（Policy Pattern）
- 维基百科
对象有某个行为，但是在不同的场景中，该行为有不同的实现算法.。比如每个人都要“交个人所得税”，但是“在美国交个人所得税”和“在中国交个人所得税”就有不同的算税方法.
- 定义
Define a family of algorithms,encapsulate each one,and make them interchangeable.
定义一组算法，将每个算法都封装起来，并且使它们之间可以互换。

常见 if/else 结构。

## 1.2 类型
行为型。
在`运行时`(**非编译时**)改变软件的算法行为。

## 1.3 主要思想
定义一个通用的问题，使用不同的算法来实现，然后将这些算法都封装在一个统一接口。

策略模式使用的就是OOP的继承和多态。

## 1.4 主要角色
### 通用类图
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWFkMWNhZjE4NDMyNGRlY2YucG5n?x-oss-process=image/format,png)

- Context 封装角色
即上下文角色，起承上启下的封装作用。屏蔽高层模块对策略&算法的直接访问，封装可能存在的变化。

- Strategy 抽象策略角色
策略&算法家族的抽象，通常为接口，定义每个策略或算法必须具有的方法和属性。

- ConcreteStrategy 具体策略角色
实现抽象策略中的操作，含有具体的算法。

### 通用源码
- 抽象策略角色
一个非常普通的接口，在项目中就是一个普通接口，定义一或多个具体算法。


# 2 适用场景
一个对象，其行为有些固定不变，有些又容易变化。对于这些容易变化的行为，我们不希望将其实现绑定在对象中，而希望能够动态地针对不同场景产生不同应对的策略。
这时就要用到策略模式，就是为了应对对象中复杂多变的行为而产生的：
- 系统有很多类，而他们的区别仅在于行为不同
- 一个系统需要动态地在几种算法中选择一种

# 3 优点
- 符合开闭原则
- 避免使用多重条件转移语句
e.g. 省去大量 if/else、switch，降低代码耦合度
- 提高算法的保密性和安全性
只需知道策略的业务功能，而不关心内部实现
# 4 缺点
- 客户端必须知道所有的策略类，并决定使用哪个策略类
- 产生很多策略类

# 5 相关设计模式的差异
## 5.1 V.S 工厂模式
- 行为型
接收已经创建好的对象，从而实现不同的行为
- 创造型
接收指令，创建符合要求的具体对象

## 5.2 V.S 状态模式
- 若系统中某类的某行为存在多种实现方式，客户端需知道到底使用哪个策略
- 若系统中某对象存在多种状态，不同状态下的行为又具有差异，状态之间会自动转换,客户端不需要关心具体状态

# 6 实战
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTBlYmMwOGY0MWUwN2NkY2EucG5n?x-oss-process=image/format,png)
- 促销策略接口
![](https://img-blog.csdnimg.cn/20201104133917501.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- 返现策略
![](https://img-blog.csdnimg.cn/20201104134155926.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- 立减策略
![](https://img-blog.csdnimg.cn/2020110413472547.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- 满减策略
![](https://img-blog.csdnimg.cn/20201104135011162.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
- 测试类
![](https://img-blog.csdnimg.cn/20201104135935601.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTg0NDA3NWYwMWE5ZTM0OWIucG5n?x-oss-process=image/format,png)
改造后的测试类
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTQ5OTFkMmVhYWQ5MzU3YzEucG5n?x-oss-process=image/format,png)
可见 if/else 语句过多,采取策略+工厂模式结合
- 策略工厂
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTIzMDA4OGNhMjYwZGIyNTYucG5n?x-oss-process=image/format,png)
- 最新测试类
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWFjZjgwZGE0ZmE1ZWE5NTQucG5n?x-oss-process=image/format,png)
- 输出结果
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTdkMjYwMzNhMWIzOWJkNmEucG5n?x-oss-process=image/format,png)

# 7 源码应用解析
## JDK中的比较器接口
- 策略比较器
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTMwNzY2Njg5NmMzZDE4MDAucG5n?x-oss-process=image/format,png)
![具体策略](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQ5MjhkZDE2YmVhNDRhNjAucG5n?x-oss-process=image/format,png)
比如Arrays类中的 sort 方法通过传入不同比较接口器的实现达到不同排序策略
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWY5MjA3MzcxMmUzMGNlNjYucG5n?x-oss-process=image/format,png)
## JDK中的TreeMap
类似于促销活动中有促销策略对象,在T reeMap 中也有比较器对象
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTQyNGY3ODdkYTE3ZDQ4NzYucG5n?x-oss-process=image/format,png)
compare 方法进步加工
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTMyZTAyNDU2NTQyYzFlNDgucG5n?x-oss-process=image/format,png)
## Spring 中的Resource
不同访问策略
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTY2ZDYxOTExNzdmYWFmMmEucG5n?x-oss-process=image/format,png)
## Spring 中bean 的初始化ceInstantiationStrategy
- 两种 bean 的初始化策略
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LThmYTVlNDRlNDkxYWFmZGMucG5n?x-oss-process=image/format,png)

参考
- Java设计模式精讲