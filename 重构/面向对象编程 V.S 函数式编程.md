# 面对不断增加的需求
假设有一组学生：
![](https://img-blog.csdnimg.cn/b82c41eefdbc4916ab8530bec8f79068.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_13,color_FFFFFF,t_70,g_se,x_16)
若按姓名找出其中一个，你的代码可能如下：
![](https://img-blog.csdnimg.cn/d159c250c9754da6a5475aafe1737564.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_17,color_FFFFFF,t_70,g_se,x_16)
突然紧急需求来了，按学号找人，代码如下：
![](https://img-blog.csdnimg.cn/012914c7599f4366b1fe52624733efac.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_15,color_FFFFFF,t_70,g_se,x_16)
又一个新需求来了，这次按照ID 找人，代码可以如法炮制：
![](https://img-blog.csdnimg.cn/59b45b54cf2e480e9371e4311465d334.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_14,color_FFFFFF,t_70,g_se,x_16)
你发现，它们除查询条件不同，其余基本一模一样，别忘了代码结构重复也是代码重复！

> 如何消除重复呢？

引入查询条件，这里只需要返回一个bool值，可这样定义：
![](https://img-blog.csdnimg.cn/44989bcbe1a84c02bcafa36df8e1fad8.png)
通过查询条件，改造查询方法，把条件作为参数传入：

于是，按名字查找变成：
![](https://img-blog.csdnimg.cn/79abe26749554583adcb9e4fed93abd6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_18,color_FFFFFF,t_70,g_se,x_16)
已经很好了，但你发现，每有一个新查询，都要做一层封装。

> 如何才能省去这层封装？

可将查询条件做成一个方法：
![](https://img-blog.csdnimg.cn/9b69ac1bdf9848bb957fdc12f86a77ee.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
其它字段也可做类似封装，如此，要查询什么就由使用方自行决定：
![](https://img-blog.csdnimg.cn/a34c2a3780b74569a58f2bf77085dc92.png)


现在想用名字和学号同时查询，咋办？
我猜你肯定要写一个byNameAndSno方法。若是如此，岂不是每种组合你都要新写一个？。
完全可以用已有的两个方法组合出一个新查询：
![](https://img-blog.csdnimg.cn/2621efeaeab94b4ca7321b93d1008fc1.png)

> 这个神奇的and方法是如何实现的呢？

按普通and逻辑写即可：
![](https://img-blog.csdnimg.cn/67fb3925fe104efdbf4f617c1efa0bf6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
or和not同理，相信聪明如你也会实现。这样，使用方能够使用的查询条件完全可按需组合。

现在想找出所有指定年龄的人。写个byAge就很简单了。
那找到所有人该怎么写？
![](https://img-blog.csdnimg.cn/29accac3556c4b2896a3bf403cda9139.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)

- 要做什么动作（查询一个、所有）
- 用什么条件（名字、学号、ID、年龄等）

就成了两个维度，使用方可按需组合。

同样都是常规Java代码，效果确很奇妙。这段代码：
- 作者只提供了各种基本元素（动作和条件）
- 用户可通过组合这些元素完成需求

这种做法完全不同于常规OO，其思想源自函数式编程。
质变在于引入了Predicate，它就是个函数。

按“消除重复”这样一个简单目的，不断调整代码，就能写出这种函数式风格代码。

现在看看函数式编程到底是啥
# 函数式编程
一种编程范式，提供的编程元素就是函数。
这个函数源于数学里的函数，因为它的起源是数学家Alonzo Church发明的Lambda演算（Lambda calculus，也写作 λ-calculus）。所以，Lambda这个词在函数式编程中经常出现，可简单理解成匿名函数。

和 Java的方法相比，它要规避状态和副作用，即同样输入一定会给出同样输出。

虽然函数式编程语言早就出现，但函数式编程概念却是John Backus在其1977 年图灵奖获奖的演讲上提出。

函数式编程第一个需要了解的概念就是函数。在函数式编程中，函数是一等公民（first-class citizen）：
- 可按需创建
- 可存储在数据结构中
- 可以当作实参传给另一个函数
- 可当作另一个函数的返回值

对象，是OOP语言的一等公民，它就满足上述所有条件。所以，即使语言没有这种一等公民的函数，也完全能模拟。之前就用Java对象模拟出一个函数Predicate。

随着函数式编程这几年蓬勃的发展，越来越多的“老”程序设计语言已经在新的版本中加入了对函数式编程的支持。所以，如果你用的是新版本，可以不必像我写得那么复杂。

比如，在Java里，Predicate是JDK自带的，and方法也不用自己写，加上Lambda语法简化代码：
![](https://img-blog.csdnimg.cn/cab94be419d24ede8ce83b515aa4ad27.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
按对象的理解方式，Predicate是个对象接口，但它可接受Lambda为其赋值。
可将其理解成一个简化版匿名内部类。主要工作都是编译器帮助做了类型推演（Type Inference）。