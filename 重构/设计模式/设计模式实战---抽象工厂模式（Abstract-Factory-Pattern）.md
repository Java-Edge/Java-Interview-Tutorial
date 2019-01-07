# 0 导读
工厂方法模式人是造出来了，可都是清一色的类型，缺少关爱、仇恨、喜怒哀乐等情绪，人类的生命太平淡了,忘记给人类定义性别了，那怎么办？
从头开始建立所有的事物也是不可能的，那就想在现有的条件下重新造人，尽可能旧物利用嘛
人种（Product产品类）应该怎么改造呢？怎么才能让人类有爱有恨呢？定义互斥的性别，然后在每个个体中埋下一颗种子：异性相吸，成熟后就一定会去找个异性
从设计角度来看，一个具体的对象通过两个坐标就可以确定：肤色和性别
![肤色性别坐标图](https://upload-images.jianshu.io/upload_images/4685968-794124f7d9c17852.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 产品类分析完，生产的工厂类（八卦炉）该怎么改造呢？
只有一个生产设备，要么生产出来的全都是男性，要么都是女性,何以解忧?
把目前已经有的生产设备—八卦炉拆开，于是女娲就使用了“八卦复制术”，把原先的八卦炉一个变两个，并且略加修改，就成了女性八卦炉（只生产女性人种）和男性八卦炉（只生产男性人种），于是就开始准备生产
![重新生产人类](https://upload-images.jianshu.io/upload_images/4685968-b76d80614966356e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
一个接口，多个抽象类，然后是N个实现类，每个人种都是一个抽象类，性别是在各个实现类中实现的
特别需要说明的是`HumanFactory`接口，在这个接口中定义了三个方法，分别用来生产三个不同肤色的人种，也就是我们在坐标图的Y坐标，它的两个实现类分别是性别，也就是坐标图的X坐标
通过X坐标（性别）和Y坐标（肤色）唯一确定了一个生产出来的对象
- Human接口如代码
![](https://upload-images.jianshu.io/upload_images/4685968-8acf156ce75550ea.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 人种有三个抽象类，负责人种的抽象属性定义
肤色和语言,白色人种、黑色人种、黄色人种
![](https://upload-images.jianshu.io/upload_images/4685968-97b3915e62cce02a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-5ba5c07c978bb1e3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-da1d364ddba8b412.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

每个抽象类都有两个实现类，分别实现公共的最细节、最具体的事物：肤色和语言
具体的实现类实现肤色、性别定义
- 以黄色女性人种为例
![](https://upload-images.jianshu.io/upload_images/4685968-9c037fa483ae781a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 黄色男性人种
![](https://upload-images.jianshu.io/upload_images/4685968-c6c9160e81defdfb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

剩下的工作就是怎么制造人类
- 接口HumanFactory
![](https://upload-images.jianshu.io/upload_images/4685968-d812bb7032aaecce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
在接口中，看到八卦炉是可以生产出不同肤色人种的，有多少个八卦炉呢？
两个，分别生产女性和男性，女性和男性八卦炉
![](https://upload-images.jianshu.io/upload_images/4685968-5b538ebe11b84c21.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-9c21722f20eaf606.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
人种有了，八卦炉也有了，我们就来重现一下造人的光景
![](https://upload-images.jianshu.io/upload_images/4685968-b035239be8186ba3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d28f2de2a0a6b655.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
各种肤色的男性、女性都制造出来了
回头来想想我们的设计，不知道大家有没有去过工厂，每个工厂分很多车间，每个车间又分多条生产线，分别生产不同的产品
我们可以把八卦炉比喻为车间，把八卦炉生产的工艺（生产白人、黑人还是黄人）称为生产线，如此来看就是一个女性生产车间，专门生产各种肤色的女性，一个是男性生产车间，专门生产各种肤色男性
在这样的设计下，各个车间和各条生产线的职责非常明确，在车间内各个生产出来的产品可以有耦合关系，你要知道世界上黑、黄、白人种的比例是：1∶4∶6，那这就需要女娲娘娘在烧制的时候就要做好比例分配，在一个车间内协调好
这就是抽象工厂模式
# 1 定义
- 官方定义
Provide an interface for creating families of related or dependent objects without specifying their concrete classes.
![](https://upload-images.jianshu.io/upload_images/4685968-1c2ea67b567e5e49.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-bdcd7c9a1d5a88d2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![抽象工厂模式的通用类图](https://upload-images.jianshu.io/upload_images/4685968-132a8a0dadc1e808.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
抽象工厂模式是工厂方法模式的升级版本
在有多个业务品种、业务分类时，通过抽象工厂模式产生需要的对象是一种非常好的解决方式
我们来看看抽象工厂的通用源代码，首先有两个互相影响的产品线（产品族），例如制造汽车的左侧门和右侧门，这两个应该是数量相等的——两个对象之间的约束，每个型号的车门都是不一样的，这是产品等级结构约束的，我们先看看两个产品族的类图
![抽象工厂模式的通用源码类图](https://upload-images.jianshu.io/upload_images/4685968-abef7b194adee63d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
注意类图上的圈圈、框框相对应，两个抽象的产品类可以有关系，例如共同继承或实现一个抽象类或接口
- 抽象产品类
![](https://upload-images.jianshu.io/upload_images/4685968-5a5dc22c5b8f2176.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 产品A1的实现类
![](https://upload-images.jianshu.io/upload_images/4685968-f4fb0775307a2aa7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 产品A2的实现类
![](https://upload-images.jianshu.io/upload_images/4685968-1382c4ca1a97062f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
产品B与此类似，不再赘述

- 抽象工厂类
抽象工厂类`AbstractCreator`的职责是定义每个工厂要实现的功能，在通用代码中，抽象工厂类定义了两个产品族的产品创建
![](https://upload-images.jianshu.io/upload_images/4685968-9756c6a75567619f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
有N个产品族，在抽象工厂类中就应该有N个创建方法

如何创建一个产品，则是由具体的实现类来完成的
- 产品等级1的实现类
![](https://upload-images.jianshu.io/upload_images/4685968-9a2be091a5ed4c76.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 产品等级2的实现类
![](https://upload-images.jianshu.io/upload_images/4685968-e893e3623872ebbc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

`有M个产品等级就应该有M个实现工厂类，在每个实现工厂中，实现不同产品族的生产任务`

在具体的业务中如何产生一个与实现无关的对象呢？
![](https://upload-images.jianshu.io/upload_images/4685968-88f7eda644844f04.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
在场景类中，没有任何一个方法与实现类有关系，对于一个产品来说，我们只要知道它的工厂方法就可以直接产生一个产品对象，无须关心它的实现类

# 2 适用场景
![](https://upload-images.jianshu.io/upload_images/4685968-09c8d2f0fa107553.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 一个对象族（或是一组没有任何关系的对象）都有相同的约束
例如一个文本编辑器和一个图片处理器，都是软件实体，但是*nix下的文本编辑器和Windows下的文本编辑器虽然功能和界面都相同，但是代码实现是不同的，图片处理器也有类似情况。也就是具有了共同的约束条件：操作系统类型。于是我们可以使用抽象工厂模式，产生不同操作系统下的编辑器和图片处理器


# 3 优点
![](https://upload-images.jianshu.io/upload_images/4685968-c2a16dc315ce941c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 封装性
每个产品的实现类不是高层模块要关心的
它要关心的是什么？是接口，是抽象，它不关心对象是如何创建出来，这由谁负责呢？工厂类，只要知道工厂类是谁，我就能创建出一个需要的对象，省时省力，优秀设计就应该如此
## 产品族内的约束为非公开状态
例如生产男女比例的问题上，肯定有自己的打算，不能让女盛男衰，否则女性的优点不就体现不出来了吗？
那在抽象工厂模式，就应该有这样的一个约束：每生产1个女性，就同时生产出1.2个男性，这样的生产过程对调用工厂类的高层模块来说是透明的，它不需要知道这个约束，我就是要一个黄色女性产品就可以了，具体的产品族内的约束是在工厂内实现的
# 4 缺点
![](https://upload-images.jianshu.io/upload_images/4685968-7aec69f70da20ccd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 产品族扩展非常困难
以通用代码为例，如果要增加一个产品C，也就是说产品家族由原来的2个增加到3个，看看我们的程序有多大改动吧！
抽象类AbstractCreator要增加一个方法createProductC()，然后两个实现类都要修改，想想看，这严重违反了开闭原则，而且我们一直说明抽象类和接口是一个契约
改变契约，所有与契约有关系的代码都要修改，那么这段代码叫什么？叫“有毒代码”，——只要与这段代码有关系，就可能产生侵害的危险！

是产品族扩展困难，而不是产品等级
在该模式下，产品等级是非常容易扩展的，增加一个产品等级，只要增加一个工厂类负责新增加出来的产品生产任务即可。也就是说横向扩展容易，纵向扩展困难。以人类为例子，产品等级中只有男、女两个性别，现实世界还有一种性别：双性人，那我们要扩展这个产品等级也是非常容易的，增加三个产品类，分别对应不同的肤色，然后再创建一个工厂类，专门负责不同肤色人的双性人的创建任务，完全通过扩展来实现需求的变更，从这一点上看，抽象工厂模式是符合开闭原则的
# 产品等级结构与产品族
![](https://upload-images.jianshu.io/upload_images/4685968-b4a03aa7c73d9f11.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-dbb9f48190b4fa15.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
当一个工厂可以创建出分属于不同产品等级结构的一个产品族中的所有对象时
抽象工厂比工厂方法更适合!!!
# 5 实践 coding
![](https://upload-images.jianshu.io/upload_images/4685968-71fff6a4554af337.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c366ae81a8ff1824.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-be5a9e40ae228c7b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
Java 类相关
![](https://upload-images.jianshu.io/upload_images/4685968-fa486226f23baac8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-855c67a98eaae010.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-f18c08956b6bde7c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
Python相关
![](https://upload-images.jianshu.io/upload_images/4685968-0dbe68d65e7607b3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-1985bc33ec40f736.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d5f4452e0854afc9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-fd8d8b57fd488938.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
工厂方法关注产品等级结构
抽象工厂关注产品族
# 6 源码应用
![](https://upload-images.jianshu.io/upload_images/4685968-dacaed22eddc3d9e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
获取的都是 MySQL 的 db 连接,为一个产品族
Mybatis工厂应用
![](https://upload-images.jianshu.io/upload_images/4685968-22e1fd52e2375950.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![默认实现](https://upload-images.jianshu.io/upload_images/4685968-345a018522dfc1e1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-b1138dbb5d3183ca.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
首先从配置中获取环境变量
初始化事务工厂,并对其赋值
再从事务工厂中获取事务实例对象
再以之为参数得到执行线程池
最后再生成返回默认 sqlsession 实例
# 7 最佳实践
抽象工厂模式是一个简单的模式，使用的场景非常多，大家在软件产品开发过程中，涉及不同操作系统的时候，都可以考虑使用抽象工厂模式，例如一个应用，需要在三个不同平台上运行，你会怎么设计？分别设计三套不同的应用？
非也，通过抽象工厂模式屏蔽掉操作系统对应用的影响。三个不同操作系统上的软件功能、应用逻辑、UI都应该是非常类似的，唯一不同的是调用不同的工厂方法，由不同的产品类去处理与操作系统交互的信息
