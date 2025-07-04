# 开闭原则（Open Close Principle，OCP）

## 1 定义

来个需求就改一次代码，理所当然？反正修改也易，再CV一份，也不费脑。但每人每次改点，日积月累，再来新需求，后人改动量就大了。每人都无辜，都只是简单修改一点。但最终导致接盘侠无法维护，直接推翻老系统，写新系统（也算是创造就业机会了）。

既然“修改”这么多问题，不修改行吗？就得精通OCP。

`Software entities like classes,modules and functions should be open for extension but closed for modifications`
一个软件实体如类、模块和方法应对扩展开放，对修改关闭。这是Bertrand Meyer在《面向对象软件构造》（Object-Oriented Software Construction）提出，它给软件设计提出极高要求：不修改代码，对扩展开放。可问题：

- 开放啥？
- 对修改关闭，咋关闭？

### 1.1 不修改代码，还能写需求？

扩展，即新需求用新代码实现。OCP向我们描述的是结果：可不修改代码，仅靠扩展就完成新功能。

#### 前提

在软件内部留好扩展点，这就需要设计（高级工程师的素质了）。每个扩展点都是个需要设计的模型。

### 1.2 用抽象构建框架，用实现扩展细节

一个软件实体应通过扩展实现变化，而不是通过修改已有代码实现变化。它是为软件实体的未来事件而制定的对现行开发设计进行约束的一个原则。

## 2 案例 - 书店

###  2.1 源码

```java
package com.javaedge.design.principle.openclose;

/**
 * 书籍接口
 * 
 * @author JavaEdge
 */
public interface BaseBook {

    /**
     * 获取书籍 ID
     *
     * @return 书籍 ID
     */
    Integer getId();

    /**
     * 获取书籍名
     *
     * @return 书籍名
     */
    String getName();

    /**
     * 获取书籍价
     *
     * @return 书籍价
     */
    Double getPrice();
}
```

```java
/**
 * Java书籍实现类
 * 
 * @author JavaEdge
 */
@AllArgsConstructor
@Getter
@Setter
public class JavaBook implements BaseBook {

    private Integer id;

    private String name;

    private Double price;
}
```

```java
/**
 * 测试类
 *
 * @author JavaEdge
 */
@Slf4j
public class Test {
    public static void main(String[] args) {
        JavaBook baseCourse = new JavaBook(66, "Java编程思想", 98d);

        JavaDiscountBook discountBook = (JavaDiscountBook) baseCourse;
        log.info("书籍ID:" + discountBook.getId() +
                " 书籍名称:" + discountBook.getName() +
                " 书籍原价:" + discountBook.getPrice() +
                "书籍优惠价:" + discountBook.getDiscountPrice());
    }
}
```

### 2.2 需求

新增一个折扣优惠方法：若直接修改原接口，则每个实现类都得重新添加方法实现。但接口应稳定，不应频繁修改！

```java
package com.javaedge.design.principle.openclose;

/**
 * Java 书籍折扣类
 *
 * @author JavaEdge
 */
public class JavaDiscountBook extends JavaBook {

    public JavaDiscountBook(Integer id, String name, Double price) {
        super(id, name, price);
    }

    public Double getDiscountPrice() {
        return super.getPrice() * 0.8;
    }
}
```

现UML：

![](https://p.ipic.vip/ix904j.png)

`接口应稳定且可靠，不应经常变化`，否则接口作为契约的作用就失去效能。

### 2.3 修改实现类

在getPrice()实现打折处理，低级程序员都习惯这样通过class文件替换，极速完成部分业务变化（或bugfix）。

该方法在项目有明确章程（团队内约束）或优良架构设计时，很优秀，但若采购书籍人员也要看价格，由于该方法已实现打折处理价格，因此采购人员看到也是折后价，会`因信息不对称而出现决策失误`。因此，这不是最优解。

### 2.4 通过扩展实现变化

`增加子类`OffNovelBook，重写getPrice，高层次模块（static静态模块区）通过OffNovelBook类产生新对象，完成业务变化对系统的最小化开发。

好办法！修改少，风险也小。

OCP对扩展开放，对修改关闭，但并不是说不做任何修改，低层模块的变更，必然要与高层模块耦合，否则就是孤立无意义的代码段。

## 3 变化的类型

### 3.1 逻辑变化

只变化一个逻辑，不涉及其它模块。如原算法`a*b+c`，要修改为`a*b*c`，那就直接修改原有类中的方法，但前提条件：所有依赖或关联类都按相同逻辑处理。

### 3.2 子模块变化

一个模块变化，会对其他的模块产生影响，特别是一个低层次的模块变化必然引起高层模块的变化，因此在通过扩展完成变化时，高层次的模块修改是必然的。

### 3.3 可见视图变化

如Swing。若仅是按钮、文字重排还简单，最司空见惯的是业务耦合变化一个展示数据的列表，按原有需求是6列，突然要增加1列，而且这一列要跨N张表，处理M个逻辑才能展现，这样的变化是恐怖的，但还是能通过扩展完成变化。

### 3.4 小结

放弃修改历史的想法吧！一个项目的基本路径：项目开发、重构、测试、投产、运维。

- 重构，可对原有设计和代码进行修改
- 运维，尽量减少对原有代码的修改，保持历史代码的纯洁性，提高系统稳定性

## 4 案例 - 酒店会员

开发酒店CRS系统，针对不同用户，计算不同房价：

- 普通用户全价
- 金卡8折
- 银卡9折

代码可能：
![](https://img-blog.csdnimg.cn/d74b8a7ac93f45a0b259be02bffe8c75.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 4.1 新需求

增加白金会员75折，CV大法好：
![](https://img-blog.csdnimg.cn/e35d591b809f47bdbc8788bd6766e102.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

这就是【修改代码】，每增加一个新类型，就修改一次代码。
但一个有各种级别用户的酒店系统肯定不只房价不同，提供服务也可能有区别，如是否有早餐？预付现付？优惠券力度、连住优惠规则？。可预见，每增加一个用户级别，要改的代码散布各地。

### 4.2 何解？

应考虑设计成可扩展模型。既然每次要增加的是用户级，且各种服务差异都体现在用户级，就需要一个用户级模型。

#### ① 用户级别重构



![](https://p.ipic.vip/8gg2cy.png)

原代码即可重构成：

![](https://img-blog.csdnimg.cn/7e59471ba0924cccbd4fac2503eb4f7e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

此时再增加白金用户，只需新写一个类：

![](https://img-blog.csdnimg.cn/34ec979369794553827bfe978fb70bc2.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_18,color_FFFFFF,t_70,g_se,x_16)
可以这么做，是因为代码里留好了扩展点：UserLevel把原来只支持枚举值的UserLevel，升级成【有行为】的UserLevel。

改造后，HotelService的getRoomPrice就稳定了，无需根据用户级别不断调整。
一旦有稳定的构造块，就能在后续将其当做一个稳定模块复用。

## 5 构建扩展点

其实我们修改代码效果不佳，但真到自己写代码，就晕了。你开发的系统有问题吗？相信大部人都承认有。但又问：你经常主动优化吗？大部人却又沉默。
它虽然垃圾，但在线上运行好好，万一我优化坏了咋办，绩效可就 3.25！现实就是这样 ，系统宏观层面人人都懂，而代码落地层，却各种原因本能的忽视。

所以，写软件系统，就该提供一个个稳定小模块，然后，将它们组合。一个经常变动的模块不稳定，用它去构造更大模块，必后患无穷。

### 5.1 为什么懂很多道理，却依旧写不好代码？

阻碍我们构造稳定模块的，是构建模型的能力。回想产生变化的UserLevel是如何升级成有行为的UserLevel。

封装的要点是行为，数据只是实现细节，而很多人习惯性面向数据写法，导致设计缺乏扩展性。

### 5.2构建模型的难点

1. 分离关注点
2. 找到共性

**要构建起抽象就要找到事物的共同点**，业务处理过程发现共性对大部分人就已经开始有难度。

## 6 案例 - 报表服务

![](https://img-blog.csdnimg.cn/f2d1fb410ecb49ed8b2d30cf24a89d7c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
很多人日常写代码就这风格，代码流程僵化。只要有新需求，基本都要修改这段。

### 6.1 需求

把统计信息发给另外一个内部系统，该内部系统可将统计信息展示出来，供外部合作伙伴查阅。

### 6.2 分析

发给另一个系统的内容是**统计信息**。原代码里：

- 前2步获取源数据，生成**统计信息**
- 后2步生成报表，将**统计信息**通过邮件发出

后2步和即将添加的步骤有个共同点，都使用统计信息。所以，可用共同模型，如OrderStatisticsConsumer：
![](https://img-blog.csdnimg.cn/927eade9b0d74d9392b5bb987100577a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

这样，新需求也只需添加一个新类，而非 if/else：
![](https://img-blog.csdnimg.cn/07d88e8615564fb2974ea0631b48b087.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

该案例中，第一步要做的还是分解：

- 把一个个步骤分开
- 然后找出步骤间相似点
- 并构建一个新模型

实际项目代码更复杂，但并非一定业务逻辑复杂，而是代码写得就垃圾且复杂。
所以，要先根据SRP，将不同需求来源引起的变动拆到不同方法，形成一个个小单元，再做这里的分析。

实际项目达到OCP并非一朝一夕。这里只是因为有需求变动，才提取出一个OrderStatisticsConsumer。

未来可能还有其它变动，如生成报表的逻辑。那时，也许再提取一个新OrderStatisticsGenerator的接口。但不管怎样，每做一次这种模型构建，最核心的类就会朝稳定发展。

**好的设计都会提供足够扩展点给新功能去扩展（想起 Spring 生命周期）。**
《Unix 编程艺术》提倡“提供机制，而非策略”，这就体现OCP。

很多系统的插件机制，如IDEA和VS Code都体现OCP。去了解它们的接口，即可看到这个软件给我们提供的各种能力。

### 6.3 抓手

OCP还可帮助我们优化系统，查看Git，找出那些最经常变动的文件，它们通常都没满足OCP，这就能成为你系统优化的起航点。

## 7 为何选择OCP？

### 7.1 OCP对测试的影响

有变化提出时，就要考虑：原有的健壮代码是否能不修改，而仅通过扩展实现变化？否则，就需要把原有测试过程全部回笼一遍，需要进行UT、功能测试、集成测试甚至验收测试。

回看书店案例，*BaseBook*接口写完，实现类JavaBook也写好了，写个测试类：

```java
public class JavaBookTest extends TestCase {
     private String name = "Java666";
     private int price = 6000;
     private String author = "JavaEdge";      
     private BaseBook javaBook = new JavaBook(name,price,author);
     
     // 测试getPrice方法
     public void testGetPrice() {
             //原价销售，根据输入和输出的值是否相等进行断言
             super.assertEquals(this.price, this.novelBook.getPrice());
     }
}
```

若加个打折销售需求，直接修改getPrice，就要修改UT类。而实际项目，一个类一般只有一个测试类，其中可以有很多测试方法，在一堆本就复杂的断言中进行大量修改，难免测试遗漏。

**所以，要通过扩展实现业务逻辑变化，而非修改**。可通过增加一个子类OffJavaBook完成业务需求变化，这对测试有啥好处？重新生成一个测试文件OffJavaBookTest，然后对getPrice测试，UT是孤立测试，只要保证我提供的方法正确就成，其他不管：

```java
public class OffNovelBookTest extends TestCase {   
     private BaseBook below40NovelBook = new OffJavaBook("Java666",3000,"JavaEdge");
     private BaseBook above40NovelBook = new OffJavaBook("Go999",6000,"JavaEdge");
      
     // 测试低于40元的数据是否是打8折
     public void testGetPriceBelow40() {
             super.assertEquals(2400, this.below40NovelBook.getPrice());
     }
     
     // 测试大于40的书籍是否是打9折
     public void testGetPriceAbove40(){
             super.assertEquals(5400, this.above40NovelBook.getPrice());
     }
}
```

新增加的类，新增加的测试方法，只要保证新增加类是正确的就可以了。

### 7.2 提高复用性

OOP中，所有逻辑都从原子逻辑组合而来，而非在一个类中独立实现一个业务逻辑。只有这样代码才可复用，粒度越小，被复用可能性越大。

#### ①  为何要复用？

减少代码量，避免相同逻辑分散，避免后来的维护人员为修改一个小bug或加个新功能，而在整个项目到处查找相关代码，然后发出对开发人员吼出“极度失望”的感慨。

#### ②  如何提高复用率？

缩小逻辑粒度，直到一个逻辑不可再拆分。

### 7.3 提高可维护性

一款软件投产后，接盘侠不仅要对数据进行维护，还可能要对程序进行扩展，接盘侠最爱干的就是扩展一个类，而非修改一个类，甭管原有代码好坏，让接盘侠先看懂原有代码，再修改，就是炼狱！不要让他在原有代码海洋里瞎游完毕后再修改，那是对接盘侠的摧残，会缺水溺死。

### 7.4 OOP

万物皆对象，我们要把所有事物抽象成对象，再针对对象操作，但运动是一定的，有运动就有变化，有变化就要有策略应对，如何快速应对？就需要在设计之初考虑到所有可能变化的因素，然后留下接口，等待“可能”转为“现实”。

## 8 总结

若说SRP主要看封装，而OCP须有多态。要想提供扩展点，就要面向接口编程。

Java SPI提供扩展机制，Spring Boot和Dubbo继续改进，各自提供扩展点：

- Spring Boot允许用户自定义starter
- Dubbo可自定义协议

1、识别修改点，构建模型，将原来静态逻辑转为动态逻辑
2、构建模型的难点在于分离关注点，其次找到共性