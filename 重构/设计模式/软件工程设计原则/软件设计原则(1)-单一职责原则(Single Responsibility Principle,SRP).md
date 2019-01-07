# 1 简介
- 定义
不要存在多于一个导致类变更的原因。

- 特点
一个类/接口/方法只负责一项职责。

- 优点
降低类的复杂度、提高类的可读性，提高系统的可维护性、降低变更引起的风险。

名字容易让人望文生义，大部分人可能理解成：一个类只干一件事，看起来似乎很合理呀。几乎所有程序员都知道“高内聚、低耦合”，应该把相关代码放一起。

若随便拿个模块去问作者，这个模块是不是只做了一件事，他们异口同声：对，只做了一件事。看来，这个原则很通用啊，所有人都懂，为啥还要有这样一个设计原则？

因为一开始的理解就是错的！错在把单一职责理解成有关如何组合的原则，实际上，它是关于如何分解的。

Robert Martin对单一职责的定义的变化：
- 《敏捷软件开发：原则、实践与模式》
一个模块应该有且仅有一个变化的原因
- 《架构整洁之道》
一个模块应该对一类且仅对一类行为者（actor）负责

- 单一职责原则 V.S 一个类只干一件事
最大的差别就是，将变化纳入考量。

分析第一个定义：一个模块应该有且仅有一个变化的原因。
软件设计关注长期变化，拥抱变化，我们最不愿意面对却不得不面对，只因变化会产生不确定性，可能：
- 新业务的稳定问题
- 旧业务遭到损害而带来的问题

所以，一个模块最理想的状态是不改变，其次是少改变，它可成为一个模块设计好坏的衡量标准。

但实际开发中，一个模块频繁变化，在于能诱导它改变的原因太多！
# 2 案例
## 2.1 鸟类案例
- 最开始的 Bird 类
![](https://img-blog.csdnimg.cn/20201011052517957.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)
- 简单测试类
![](https://img-blog.csdnimg.cn/img_convert/7ea1da00d7a9e0615db6170063d5d468.png)

显然鸵鸟还用翅膀飞是错误的！于是，我们修改类实现
![](https://img-blog.csdnimg.cn/2020101105314531.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)
这种设计依旧很low，总不能一味堆砌 if/else 添加鸟类。结合该业务逻辑，考虑分别实现类职责，即根据单一原则创建两种鸟类即可：
![](https://img-blog.csdnimg.cn/20201011053445284.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)
![](https://img-blog.csdnimg.cn/20201011053528342.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)
![](https://img-blog.csdnimg.cn/20201011053706470.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
## 2.2 课程案例
- 最初的课程接口有两个职责，耦合过大
![](https://img-blog.csdnimg.cn/20201011054054803.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
- 按职责拆分
![](https://img-blog.csdnimg.cn/20201011063546976.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
![](https://img-blog.csdnimg.cn/20201011063629925.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

![](https://img-blog.csdnimg.cn/img_convert/82c766b21a88c40cdc3a1946c5cf51c4.png)

## 2.3 用户管理
用户、机构、角色管理这些模块，基本上使用的都是RBAC模型（Role-Based Access Control，基于角色的访问控制，通过分配和取消角色来完成用户权限的授予和取消，使动作主体（用户）与资源的行为（权限）分离），这确实是一个很好的解决办法。

对于用户管理、修改用户的信息、增加机构（一个人属于多个机构）、增加角色等，用户有这么多的信息和行为要维护，我们就把这些写到一个接口中，都是用户管理类：
- 用户信息维护类图
![](https://img-blog.csdnimg.cn/20210705144728253.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

很有问题，用户属性和用户行为严重耦合！这个接口确实设计得一团糟：
- 应该把用户信息抽取成一个BO（Business Object，业务对象）
- 把行为抽取成一个Biz（Business Logic，业务逻辑）

- 职责划分后的类图
![](https://img-blog.csdnimg.cn/20210705145341688.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

重新拆分成两个接口：
- IUserBO
负责用户的属性，职责就是收集和反馈用户的属性信息
- IUserBiz
负责用户的行为，完成用户信息的维护和变更

我们是面向接口编程，所以产生了这个UserInfo对象后，当然可以把它当IUserBO接口使用，也可以当IUserBiz接口使用，这看你的使用场景。
- 要获得用户信息，就当做IUserBO的实现类
- 要是希望维护用户的信息，就把它当做IUserBiz的实现类
```java
IUserInfo userInfo = new UserInfo();
// 我要赋值了，我就认为它是一个纯粹的BO
IUserBO userBO = (IUserBO)userInfo;
userBO.setPassword("abc");
// 我要执行动作了，我就认为是一个业务逻辑类
IUserBiz userBiz = (IUserBiz)userInfo;
userBiz.deleteUser();
```

确实这样拆分后，问题就解决了，分析一下我们的做法，为什么要把一个接口拆分成两个？
实际的使用中，更倾向于使用两个不同的类或接口：一个是IUserBO，一个是IUserBiz
- 项目中经常采用的SRP类图
![](https://img-blog.csdnimg.cn/img_convert/ddf683f0892e2a6a08726c7642b9dd25.png)

以上我们把一个接口拆分成两个接口的动作，就是依赖了单一职责原则，那什么是单一职责原则呢？单一职责原则的定义是：应该有且仅有一个原因引起类的变更。

## 2.4 电话通话
电话通话的时候有4个过程发生：拨号、通话、回应、挂机。
那我们写一个接口
![电话类图](https://img-blog.csdnimg.cn/img_convert/a7fab40bd3a15f919374e59ecb03b59a.png)
- 电话过程
![](https://img-blog.csdnimg.cn/20210705150128534.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

这个接口有问题吗？是的，这个接口接近于完美。
单一职责原则要求一个接口或类只有一个原因引起变化，即一个接口或类只有一个职责，它就负责一件事情，看看上面的接口：
- 只负责一件事情吗？
- 是只有一个原因引起变化吗？

好像不是！IPhone这个接口可不是只有一个职责，它包含了两个职责：
- 协议管理
dial()和hangup()两个方法实现的是协议管理，分别负责拨号接通和挂机
- 数据传送
chat()实现的是数据的传送，把我们说的话转换成模拟信号或数字信号传递到对方，然后再把对方传递过来的信号还原成我们听得懂的语言。

协议管理的变化会引起这个接口或实现类的变化吗？
会的！
那数据传送（电话不仅可以通话，还可以上网！）的变化会引起这个接口或实现类的变化吗？
会的！

这里有两个原因都引起了类变化。这两个职责会相互影响吗？
- 电话拨号，我只要能接通就成，不管是电信的还是联通的协议
- 电话连接后还关心传递的是什么数据吗？

经过分析，我们发现类图上的IPhone接口包含了两个职责，而且这两个职责的变化不相互影响，那就考虑拆分成两个接口：
- 职责分明的电话类图
![](https://img-blog.csdnimg.cn/img_convert/a32b12f5a750fccb83178a41a30131d5.png)
完全满足了单一职责原则要求，每个接口职责分明，结构清晰，但相信你在设计时肯定不会采用这种方式。一个 Phone类要把ConnectionManager和DataTransfer组合在一块才能使用。组合是一种强耦合关系，共同生命周期，这样强耦合不如使用接口实现，而且还增加了类的复杂性，多了俩类。

那就再修改一下类图：
- 简洁清晰、职责分明的电话类图
![](https://img-blog.csdnimg.cn/img_convert/6440c34103fafd869b635156ddff80cf.png)

一个类实现了两个接口，把两个职责融合在一个类中。
你可能会说Phone有两个原因引起变化了呀！
是的，但是别忘了我们是面向接口编程，我们对外公布的是接口而非实现类。而且，若真要实现类的单一职责，还就必须使用组合模式了，这会引起类间耦合过重、类的数量增加等问题，人为地增加了设计复杂性。

## 好处
- 类的复杂性降低，实现什么职责都有清晰明确的定义
- 可读性提高，复杂性降低，那当然可读性提高了
- 可维护性提高，可读性提高，那当然更容易维护了
- 变更引起的风险降低，变更是必不可少的。若接口的单一职责做得好，一个接口修改只对相应的实现类有影响，对其他的接口无影响。这对系统的扩展性、维护性都有非常大帮助。

单一职责原则最难划分的就是职责。
一个职责一个接口，但问题是“职责”没有一个量化的标准，一个类到底要负责那些职责？这些职责该怎么细化？细化后是否都要有一个接口或类？
这些都需要从实际的项目去考虑，从功能上来说，定义一个IPhone接口也没有错，实现了电话的功能，而且设计还很简单，仅仅一个接口一个实现类，实际的项目我想大家都会这么设计。项目要考虑可变因素和不可变因素，以及相关的收益成本比率，因此设计一个IPhone接口也可能是没有错的。

但若纯从“学究”理论上分析就有问题了，有两个可以变化的原因放到了一个接口中，这就为以后的变化带来了风险。如果以后模拟电话升级到数字电话，我们提供的接口IPhone是不是要修改了？接口修改对其他的Invoker类是不是有很大影响？

单一职责原则提出了一个编写程序的标准，用“职责”或“变化原因”来衡量接口或类设计得是否优良，但是“职责”和“变化原因”都是不可度量的，因项目而异，因环境而异。

## 2.5 项目管理
开发一个项目管理工具，可能设计如下用户类：
![](https://img-blog.csdnimg.cn/ac02aaf76ba14b9ab65300e770cd750c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_15,color_FFFFFF,t_70,g_se,x_16)类设计得看着很合理，有用户信息管理、项目管理等。
现在新需求规定每个用户能够设置电话号码，于是你新增方法：
![](https://img-blog.csdnimg.cn/450501655028452b856e417b817f6657.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_19,color_FFFFFF,t_70,g_se,x_16)
又来新需求：查看一个用户加入了多少项目：
![](https://img-blog.csdnimg.cn/20a70e69316e47d7a8a671f8554b1524.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_19,color_FFFFFF,t_70,g_se,x_16)
就这样，几乎每个和用户沾边的需求，你都改了user类，导致：
- User类不断膨胀
- 内部实现越来越复杂

这个类变动的频繁程度显然不理想，在于它诱导变动的需求太多：
- 为什么要增加电话号码？
用户管理的需求。用户管理的需求还会有很多，比如，用户实名认证、用户组织归属等
- 为什么要查看用户加入多少项目？
项目管理的需求。项目管理的需求还会有很多，比如，团队管理、项目权限等。

这是两种完全不同的需求，但你都改同一个类，所以，User类无法稳定。
最好的方案是拆分不同需求引起的变动。
对于用户管理、项目管理两种不同需求，完全可以把User拆成两个类：
- 用户管理类需求放到User
- 项目管理类的需求放到Member

![](https://img-blog.csdnimg.cn/92686f9f4c774c909e7aa4227c44f0aa.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_15,color_FFFFFF,t_70,g_se,x_16)这样，用户管理的需求只需调整User类，项目管理的需求只需调整Member类，二者各自变动的理由就少了。

### 变化的来源
上面的做法类似分离关注点。

要更好地理解单一职责原则，关键就是分离不同关注点。该案例分离的是不同的业务关注点。所以，理解单一职责原则奥义在于理解分离关注点。

分离关注点，发现的关注点越多越好，粒度越小越好。你能看到的关注点越多，就能构建出更多的类，但每个类的规模相应越小，与之相关需求变动也越少，能稳定的几率就越大。
代码库里稳定的类越多越好，这是我们努力的方向。

> 如果将这种思路推演到极致，那一个类就应该只有一个方法，这样，它受到影响最小。

的确如此，但实际项目，一个类通常都不只一个方法，要求所有人都做到极致，不现实。

> 那应该把哪些内容组织到一起？

这就需要考虑单一职责原则定义的升级版，即第二个定义：一个模块应该对一类且仅对一类行为者负责。

若第一个定义将变化纳入考量，则升级版定义则将变化的来源纳入考量。

> 需求为什么会改变？

因为有各种人提需求，不同人提的需求关注点不同。
关心用户管理和关心项目管理的可能是两种不同角色的人。两件不同的事，到了代码，却混在一起，这显然不合理。
所以，分开才是一个好选择：
- 用户管理的人，我和他们聊User
- 项目管理的人，我们来讨论Member

> 康威定律：一个组织设计出的系统，其结构受限于其组织的沟通结构。

Robert Martin说，单一职责原则是基于康威定律的一个推论：一个软件系统的最佳结构高度依赖于使用这个软件的组织的内部结构。
若我们的软件结构不能够与组织结构对应，就会带来一系列麻烦。

实际上，当我们更新了对于单一职责原则的理解，你会发现，它的应用范围不仅可放在类这个级别，也可放到更大级别。

某交易平台有个关键模型：手续费率，交易一次按xx比例收佣金。平台可以利用手续费率做不同的活动，比如，给一些人比较低的手续费率，鼓励他们来交易，不同的手续费率意味着对不同交易行为的鼓励。
- 对运营人员
手续费率是一个可以玩出花的东西
- 对交易系统而言
稳定高效是重点。显然，经常修改的手续费率和稳定的系统之间存在矛盾。

分析发现，这是两类不同行为者。所以，设计时，把手续费率设置放到运营子系统，而交易子系统只负责读取手续费率:
- 当运营子系统修改了手续费率，会把最新结果更新到交易子系统
- 至于各种手续费率设置的花样，交易子系统根本无需关心

单一职责原则还能指导我们在不同的子系统之间进行职责分配。所以，单一职责原则这个看起来最简单的原则，实际上也蕴含着很多值得挖掘的内容。
要想理解好单一职责原则：
- 需要理解封装，知道要把什么样的内容放到一起
- 理解分离关注点，知道要把不同的内容拆分开来
- 理解变化的来源，知道把不同行为者负责的代码放到不同的地方。


你就可以更好地理解函数要小的含义了，每个函数承担的职责要单一，这样，它才能稳定。

# 4 单一且快乐
对于：
- 接口，设计时一定要单一
- 但对于实现类就需要多方面考虑

生搬硬套单一职责原则会引起类的剧增，给维护带来非常多的麻烦，而且过分细分类的职责也会人为地增加系统的复杂性。本来一个类可以实现的行为硬要拆成两个类，然后再使用聚合或组合的方式耦合在一起，人为制造了系统的复杂性。所以原则是死的，人是活的。

## 单一职责原则很难体现在项目
国内的技术人员地位和话语权都是最低的，在项目中需要考虑环境、工作量、人员的技术水平、硬件的资源情况等，最终妥协经常违背单一职责原则。

单一职责适用于接口、类，同时也适用于方法。一个方法尽可能做一件事情，比如一个方法修改用户密码，不要把这个方法放到“修改用户信息”方法中，这个方法的颗粒度很粗.

- 一个方法承担多个职责
![](https://img-blog.csdnimg.cn/img_convert/5cebbf619d200508262e3ddd37e4251e.png)

在IUserManager中定义了一个方法changeUser，根据传递的类型不同，把可变长度参数changeOptions修改到userBO这个对象上，并调用持久层的方法保存到数据库中。

这种代码看到，直接要求其重写即可：方法职责不清晰，不单一，不要让别人猜测这个方法可能是用来处理什么逻辑的。

比较好的设计如下：
- 一个方法承担一个职责
![](https://img-blog.csdnimg.cn/img_convert/21d3889d0f1a23a242e5a24cc464dea5.png)
若要修改用户名称，就调用changeUserName方法
要修改家庭地址，就调用changeHomeAddress方法
要修改单位电话，就调用changeOfficeTel方法
每个方法的职责非常清晰明确，不仅开发简单，而且日后的维护也非常容易。
# 5 最佳实践
类的单一职责确实受非常多因素的制约，纯理论地来讲，这个原则很好，但现实有很多难处，你必须考虑项目工期、成本、人员技术水平、硬件情况、网络情况甚至有时候还要考虑政府政策、垄断协议等因素。

对于单一职责原则，推荐：
- 接口一定要做到单一职责
- 类的设计尽量做到只有一个原因引起变化

> 参考
> - 《设计模式之蝉》