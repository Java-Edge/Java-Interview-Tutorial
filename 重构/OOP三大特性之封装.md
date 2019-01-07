像C语言这种结构化编程帮助我们解决了很多问题，但随现代应用系统的代码量剧增，其局限也越发明显：各模块依赖关系太强，不能有效隔离变化。

于是，OOP诞生。但对于大部分初学就是C语言的开发人员，习惯了结构化编程思维，认为：
```java
OO=数据+函数
```
不能说是错的，但层次太低。结构化编程思维就如管中窥豹，只能看到局部。想要用好OOP，则需更宏观的视野。

# 如何理解封装
OO是解决更大规模应用开发的一种尝试，它提升了程序员管理程序的尺度。

封装，是OO的根基：
- 它把紧密相关的信息放在一起，形成一个单元
- 若该单元稳定，即可将该单元和其它单元继续组合，构成更大单元
- 同理，继续构建更大单元，层层封装变大
# OO的初心
OO由Alan Kay提出，图灵奖获得者。其最初构想，对象就是细胞。将细胞组织起来，组成身体各器官，再组织起来，就构成人体。而当你去观察人时，就不用再去考虑每个细胞如何。所以，OO提供了更宏观思维。

但这一切的前提：每个对象要构建好，即封装要做好。就像每个细胞都有细胞壁将其与外界隔离，形成一个完整个体。

Kay强调**对象之间只能通过消息通信**。
按如今程序设计语言通常做法，发消息就是方法调用，对象之间就是靠方法调用通信。

> 但这方法调用并非简单地把对象内部的数据通过方法暴露。Kay的构想甚至想把数据去掉。

因为封装的重点在于**对象提供了哪些行为，而非有哪些数据**。
即便我们把对象理解成数据+函数，数据、函数也不是对等的:
- 函数是接口
接口是稳定的
- 数据是内部的实现
实现是易变的，应该隐藏

很多人的开发习惯：写一个类，写其一堆字段，然后生成一堆getter、setter，暴露这些字段的访问。
这种做法是错误的，它把数据当成设计核心，这一堆getter、setter，就等于暴露实现细节。

**正确做法**：
1. 设计一个类，先考虑对象应提供哪些**行为**
2. 然后，根据这些行为提供对应方法
3. 最后考虑实现这些方法要有哪些**字段**

所以连接二者的是方法，其命名就是个大学问了，应体现你的意图，而非具体怎么做的。所以，getXXX和setXXX绝不是个好命名。
比如，设计：用户修改密码。

一些人上手就来：
![](https://img-blog.csdnimg.cn/5ab9f7f30f824b32b24444885ef1c1ee.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_19,color_FFFFFF,t_70,g_se,x_16)

但推荐写法是表达你的意图：
![](https://img-blog.csdnimg.cn/3d818b23e99d43b7bdbabf50b007ddd3.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
两段代码只是修改密码的方法名不同，但更重要的差异是：
- 一个在说做什么
- 一个在说怎么做

**将意图与实现分离**，优秀设计须考虑的问题。

实际项目中，有时确实需要暴露一些数据。
所以，当确实需暴露时，再写getter也不迟，你一定要问自己为何要加getter？
关于setter：
- 大概率是你用错名字，应该用一个表达意图的名字
- setter通常意味着修改，这是不推荐的

可变的对象会带来很多的问题，后续再深入讨论。所以，设计中更好的做法是设计不变类。

Lombok很好，少写很多代码，但必须限制它的使用，像Data和Setter都不该用。Java Bean本来也不是应该用在所有情况下的技术，导致很多人误用。
# 减少接口的暴露
之所以需要封装，就是要构建一个内聚单元。所以，要减少该单元对外的暴露：
- 减少内部实现细节的暴露
- 减少对外暴露的接口

OOP语言都支持public、private，日常开发经常会轻率地给一个方法加public，不经意间暴露了一些本是内部实现的部分。

比如，一个服务要停下来时，你可能要把一些任务都停下来：
![](https://img-blog.csdnimg.cn/498578fc8ea2413dadd84961d0067381.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_14,color_FFFFFF,t_70,g_se,x_16)

别人可能这样调用时：
![](https://img-blog.csdnimg.cn/bd93854e9f3a4acb8ecf56f37b3a7122.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_13,color_FFFFFF,t_70,g_se,x_16)

突然某天，你发现停止轮询任务必须在停止定时器任务之前，你就不得不要求别人改代码。而这一切就是因为我们很草率地给那两个方法加上public，让别人有机会看到这俩方法。

设计角度，必须谨慎自省：这个方法有必要暴露吗？
其实可仅暴露一个方法：
![](https://img-blog.csdnimg.cn/18eaf9df12fe4f56b6a32cf226053673.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_14,color_FFFFFF,t_70,g_se,x_16)外部的调用代码也会简化：
![](https://img-blog.csdnimg.cn/85533a09a5cf4e8180b361b02bed0b65.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_11,color_FFFFFF,t_70,g_se,x_16)
尽可能减少接口暴露，该原则适于类的设计、系统设计。
很多人都特别随意在系统里添加接口，让一个看似不复杂的系统，随便就有成百上千个接口。

后续，当你想改造系统，去掉一些接口时，很可能造成线上事故，因为你根本不知道哪个团队在何时用到了它。
所以，软件设计中，谨慎暴露接口！

可总结出：最小化接口暴露，即每增加一个接口，都要找到一个充分的理由！
#  总结
封装，除了要减少内部实现细节的暴露，还要减少对外接口的暴露。每暴露一个公共API就增加一份职责，所以在每次暴露API时就要问自己，这个职责是自己必要的，还是有可能会增加不必要的负担。
一个原则是最小化接口暴露。

注意区分：
- OO和 Java 语言
- 传输数据和业务对象

Java语言特点就是一切皆对象，Java中对象的概念跟OO中对象的概念不同：
- 前者是语言特性
- 后者是一种编程范式

在具体编码中，哪些属于对象，哪些不属于对象，应该是程序员掌控。
比如：
- DDD中的领域实体，就是对象，需仔细设计其行为接口
- 一些POJO，可看成数据载体，可直接加getter、setter的（没有这些默认getter、setter，很多第三方数据转化都很不方便，比如JSON，SQL）。使用时，不归结为对象即可

**基于行为进行封装，不要暴露实现细节，最小化接口暴露。**

Demeter 不是一个人，而是一个项目，项目主页 http://www.ccs.neu.edu/research/demeter/。最早提到迪米特法则的论文出版于 1989 年，Assuring good style for object-oriented programs。还有一本书，1996 年出版，Adaptive Object-Oriented Software: The Demeter Method with Propagation Patterns。没有看过。

Demeter 是希腊神话中的大地和丰收女神，也叫做德墨忒尔。

迪米特法则简单的说，分为两个部分：不该有直接依赖关系的类之间，不要有依赖；有依赖关系的类之间，尽量只依赖必要的接口。其实如果用另一个名字“最小知识原则”可能更容易理解一些，这个也算是程序员的“黑话”吧。

虽然接触OOP已经很久了，不过写程序时，大多数人还是习惯“一个对象一张表”，也没有太多考虑封装。整个类里都是 getter、setter 的事情也做过，这就像是用“面向对象的语言写面向过程的代码”。

> 参考
> - https://www2.ccs.neu.edu/research/demeter/