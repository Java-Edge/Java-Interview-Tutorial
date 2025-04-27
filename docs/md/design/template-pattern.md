# 模板方法设计模式（Template Pattern）

## 1 定义

模板模式，全称模板方法设计模式，Template Method Design Pattern。

GoF《设计模式》的定义： Define the skeleton of an algorithm in an operation, deferring some steps to subclasses. Template Method lets subclasses redefine certain steps of an algorithm without changing the algorithm’s structure.

模板方法模式在一个方法中定义一个**算法骨架**，并将某些步骤推迟到子类中实现。模板方法模式可以让子类在不改变算法整体结构的情况下，重新定义算法中的某些步骤。

- 算法骨架就是“模板”
- 包含算法骨架的方法就是**模板方法**

所以叫模板方法模式，属行为型模式。

一个抽象类公开定义了执行它的方法的方式/模板。它的子类可以按需要重写方法实现，但调用将以抽象类中定义的方式进行。

## 2 原理

模板方法模式的通用类图：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/cd217a65bf37b7874a4ae2871b42fd6c.png)

仅利用了Java的继承机制，AbstractClass是抽象模板，其方法分为两类：

- 基本方法
  基本操作，定义为abstract，强制子类实现，并在模板方法被调用
- 模板方法
  一般是一个具体方法，即一个框架，实现对基本方法的调度，完成固定逻辑

模板方法加上final关键字，不允许被重写。

在类图中还有一个角色：具体模板。ConcreteClass1和ConcreteClass2属于具体模板，实现父类所定义的一个或多个抽象方法，即父类定义的基本方法在子类中得以实现。

抽象模板类

```java
public abstract class AbstractClass {

     // 基本方法
     protected abstract void doSomething();
     
     // 基本方法
     protected abstract void doAnything();
     
     // 模板方法
     public void templateMethod() {
     
             /*
              * 调用基本方法，完成相关的逻辑
              */
             this.doAnything();
             this.doSomething();
     }
}
```

具体模板类

```java
public class ConcreteClass1 extends AbstractClass {

     // 实现基本方法
     protected void doAnything() {
             // 业务逻辑
     }
     
     protected void doSomething() {
             // 业务逻辑处理
     }
}

public class ConcreteClass2 extends AbstractClass {
     // 实现基本方法
     protected void doAnything() {
             // 业务逻辑处理
     }
     protected void doSomething() {
             // 业务逻辑处理
     }
}
```

场景类

```java
public class Client {
     public static void main(String[] args) {
             AbstractClass class1 = new ConcreteClass1();
             AbstractClass class2 = new ConcreteClass2();               
             //调用模板方法
             class1.templateMethod();
             class2.templateMethod();
     }
}
```

抽象模板中的基本方法尽量设计为protected类型，符合迪米特法则，不需要暴露的属性或方法尽量不要设置为protected类型。实现类若非必要，尽量不要扩大父类中的访问权限。

Spring 中对 Hibernate 的支持，将一些已经定好的方法封装起来，比如开启事务、获取 Session、关闭 Session 等，程序员不重复写那些已规范好的代码，直接丢一个实体即可保存。

## 3 使用场景

- 多个子类有公有的方法，并且逻辑基本相同时
- 重要、复杂的算法，可将不变的核心算法设计为模板方法，周边的相关细节功能、可变的行为由各个子类实现

重构时，模板方法模式是一个经常使用的模式，把相同代码抽取到父类，然后通过钩子函数约束其行为

## 4 案例

创建一个定义操作的 Game 抽象类，其中，模板方法设置为 final，这样它就不会被重写。

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/%E6%A8%A1%E6%9D%BF%E6%96%B9%E6%B3%95%E6%A1%88%E4%BE%8B.png)

```java
package com.javaedge.design.pattern.behavioral.templatemethod.game;

/**
 * @author JavaEdge
 * @date 2021/9/30
 */
public abstract class Game {

    /**
     * 初始化游戏
     */
    abstract void initialize();

    /**
     * 开始游戏
     */
    abstract void startPlay();

    /**
     * 结束游戏
     */
    abstract void endPlay();

    /**
     * 模板方法 final修饰
     */
    public final void play() {

        initialize();

        startPlay();

        endPlay();
    }
}
```

```java
package com.javaedge.design.pattern.behavioral.templatemethod.game;

/**
 * 扩展了Game类的实体类
 * @author JavaEdge
 * @date 2021/9/30
 */
public class Cricket extends Game {

    @Override
    void endPlay() {
        System.out.println("Cricket Game Finished!");
    }

    @Override
    void initialize() {
        System.out.println("Cricket Game Initialized! Start playing.");
    }

    @Override
    void startPlay() {
        System.out.println("Cricket Game Started. Enjoy the game!");
    }
}
```

```java
package com.javaedge.design.pattern.behavioral.templatemethod.game;

/**
 * 演示游戏的定义方式
 *
 * @author JavaEdge
 * @date 2021/9/30
 */
public class TemplatePatternDemo {
    public static void main(String[] args) {

        Game game = new Cricket();
        game.play();
        System.out.println();
        game = new Football();
        game.play();
    }
}
```

## 5 优点

- 提高复用性
- 提高扩展性
- 符合OCP
- 封装不变部分，扩展可变部分
  把认为是不变部分的算法封装到父类实现，而可变部分的则可以通过继承来继续扩展
- 提取公共部分代码，便于维护
  如果我们不抽取到父类中，任由这种散乱的代码发生，想想后果是什么样子？维护人员为了修正一个缺陷，需要到处查找类似的代码
- 行为由父类控制，子类实现
  基本方法由子类实现，因此子类可以通过扩展的方式增加相应的功能，符合OCP

## 6 缺点

- 类数目增加
- 增加了系统实现的复杂度
- 继承关系自身缺点，如果父类添加新的抽象方法，所有子类都要改一遍。每一个不同的实现都需要一个子类来实现，导致类的个数增加，使得系统更加庞大。

抽象类负责声明最抽象、最一般的事物属性和方法，实现类完成具体的事物属性和方法
但是模板方法模式却颠倒了，抽象类定义了部分抽象方法，由子类实现，子类执行的结果影响了父类的结果，也就是子类对父类产生了影响，这在复杂的项目中，会带来代码阅读的难度，而且也会让新手产生不适感。

## 7 相关设计模式

模板方法模式和工厂方法模式
模板方法模式和策略模式

## 8 案例

```java
package com.javaedge.design.pattern.behavioral.templatemethod;

public class DesignPatternCourse extends ACourse {

    @Override
    void packageCourse() {
        System.out.println("提供课程 Java 源代码");
    }

    @Override
    protected boolean needWriteArticle() {
        return true;
    }
}
```

```java
package com.javaedge.design.pattern.behavioral.templatemethod;

public abstract class ACourse {

    protected final void makeCourse() {
        this.makePPT();
        this.makeVideo();
        if (needWriteArticle()) {
            this.writeArticle();
        }
        this.packageCourse();
    }

    final void makePPT() {
        System.out.println("制作 PPT");

    }

    final void makeVideo() {
        System.out.println("制作视频");
    }

    final void writeArticle() {
        System.out.println("编写博客");
    }

    //钩子方法
    protected boolean needWriteArticle() {
        return false;
    }

    abstract void packageCourse();
}
```

```java
package com.javaedge.design.pattern.behavioral.templatemethod;

public class FECourse extends ACourse {

    private boolean needWriteArticleFlag;

    @Override
    void packageCourse() {
        System.out.println("提供课程的前端代码");
        System.out.println("提供课程的图片等多媒体资源");
    }

    public FECourse(boolean needWriteArticleFlag) {
        this.needWriteArticleFlag = needWriteArticleFlag;
    }

    @Override
    protected boolean needWriteArticle() {
        return super.needWriteArticle();
    }
}
```

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/d5a0c37391d58ef0e1f746e6652e5f5a.png)

## 9 最佳实践

初级程序员在写程序的时候经常会问高手“父类怎么调用子类的方法”。这个问题很有普遍性，反正我是被问过好几回，那么父类是否可以调用子类的方法呢？我的回答是能，但强烈地、极度地不建议这么做，那该怎么做呢?

● 把子类传递到父类的有参构造中，然后调用
● 使用反射的方式调用
● 父类调用子类的静态方法

这三种都是父类直接调用子类的方法，好用不？好用！解决问题了吗？解决了！项目中允许使用不？不允许！
我就一直没有搞懂为什么要用父类调用子类的方法。如果一定要调用子类，那为什么要继承它呢？搞不懂。其实这个问题可以换个角度去理解，父类建立框架，子类在重写了父类部分的方法后，再调用从父类继承的方法，产生不同的结果（而这正是模板方法模式）。这是不是也可以理解为父类调用了子类的方法呢？你修改了子类，影响了父类行为的结果，曲线救国的方式实现了父类依赖子类的场景，模板方法模式就是这种效果。

模板方法在一些开源框架中应用非常多，它提供了一个抽象类，然后开源框架写了一堆子类。
如果你需要扩展功能，可以继承这个抽象类，然后重写protected方法，再然后就是调用一个类似execute方法，就完成你的扩展开发，非常容易扩展的一种模式。

## 10 应用

主要是用来解决复用和扩展两个问题。

### 复用

所有子类可复用父类中模板方法定义的流程代码。

Java IO库，如InputStream、OutputStream、Reader、Writer。以InputStream为例说明。

read()是个模板方法，定义了读取数据的整个流程，并且暴露了一个可以由子类来定制的抽象方法。
不过这个方法也被命名为了read()，只是参数跟模板方法不同。

### 扩展

#### AbstractList