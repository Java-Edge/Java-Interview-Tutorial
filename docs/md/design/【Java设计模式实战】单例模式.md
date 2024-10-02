# 【Java设计模式实战】单例模式

## 产生动机

系统中的某些类，只有一个实例很重要，如：

- 一个系统中可能存在多个打印任务，但只能有一个正在工作的任务
- 一个系统只能有一个窗口管理器或文件系统
- 一个系统只能有一个计时工具或ID（序号）生成器

这些类的共同点：

1. 只有一个实例
2. 该实例易于访问

那定义一个全局变量可以满足吗？虽然保证了对象易于访问，但无法避免实例化多个对象。

更好的是让类自身负责保存它的唯一实例，该类可保证：

1. 没有其他实例被创建
2. 可提供一个访问该实例的方法

## 简介

一种对象创建型模式，单例模式是保证一个类仅有一个实例，并提供一个它的全局访问点。

- 单例类的构造器私有，以避免被new直接实例化
- 提供一个自身的静态私有成员变量
- 提供一个public static工厂方法
- 检验实例的存在性并实例化自己，然后存储在static成员变量中，以确保只有一个实例被创建

## UML

![](https://img-blog.csdnimg.cn/img_convert/e80f1d0c58dc677832a47a1cc48baeda.png)

getInstance()需用锁 synchronized (Singleton.class) 防止多线程同时进入，导致 instance 被多次实例化。

## 优点

- 在内存里只有一个实例，减少了内存开销，尤其是频繁的创建和销毁实例
- 避免对资源的多重占用（比如写文件操作）

* 提供了对唯一实例的受控访问

  因为单例类封装其唯一实例，所以可严格控制客户怎样及何时访问它，并为设计及开发团队提供共享的概念

* 由于在系统内存中只存在一个对象，因此可以节约系统资源

  对一些需频繁创建和销毁的对象，单例模式可提高系统性能

* 允许可变数目的实例

  可基于单例模式进行扩展，使用与单例控制相似的方法获得指定个数的对象实例。

## 缺点

### 无接口，不能继承

与单一职责原则冲突：一个类应该只关心内部逻辑，而不关心外面怎么样来实例化。

### 无抽象层，难扩展

单例类的职责过重，在一定程度上违背“单一职责原则”。
因为单例类既充当了工厂角色，提供了工厂方法，同时又充当了产品角色，包含一些业务方法，将产品的创建和产品的本身的功能融合到一起。

### 滥用单例也带来负面问题

如：

- 为节省资源将数据库连接池对象设计为单例类，可能导致共享连接池对象的程序过多而出现连接池溢出
- 现在很多OOP语言运行环境都提供自动GC技术，因此，若实例化的对象长时不被利用，系统会认为它是垃圾，自动销毁并回收资源，下次利用时又将重新实例化，这将导致对象状态丢失

## 适用场景

系统只需要一个实例对象，如

- 系统要求提供一个唯一的序列号生成器

  一个具有自动编号主键的表可以有多个用户同时使用，但DB中只能有一个地方分配下一个主键编号，否则会出现主键重复，因此该主键编号生成器必须具备唯一性

- 需要考虑资源消耗太大而只允许创建一个对象（一些处理器）

- 客户调用类的单个实例只允许使用一个公共访问点，除了该公共访问点，不能通过其他途径访问该实例

- WEB 中的计数器，不用每次刷新都在数据库里加一次，用单例先缓存起来

- 创建的一个对象需要消耗的资源过多，比如 I/O 与数据库的连接等。

## 实现方式

### 1 懒汉式(非线程安全)

最基本的实现方式，不支持多线程。因为未加synchronized锁 ，严格意义上也不算单例模式。
这种方式 lazy loading 很明显，不要求线程安全，当有多个线程并行调用 getInstance()，会创建多个实例：

```java
public class Singleton {
  
    private static Singleton instance;
  
    private Singleton (){}  
  
    public static Singleton getInstance() {  
       if (instance == null) {  
           instance = new Singleton();  
       }  
       return instance;  
    }  
}  
```

### 2 懒汉式(线程安全)

为了解决上面问题，最简单的，将整个 getInstance() 方法设为同步（synchronized）。
优点：第一次调用才初始化，避免内存浪费。
缺点：必须加锁 synchronized 才能保证单例，但加锁会影响效率。

虽然保证了线程安全，避免了多实例，但不高效。因为任一时候，只能有一个线程调用 getInstance()，但同步操作只需在第一次调用时才被需要，即第一次创建单例实例对象时。
这就引出了双重检验锁。

```java
public class Singleton {
    private static volatile Singleton INSTANCE = null;
  
    // Private constructor suppresses 
    // default public constructor
    private Singleton() {}
  
    //thread safe and performance  promote 
    public static  Singleton getInstance() {
        if(INSTANCE == null){
             synchronized(Singleton.class){
                 //when more than two threads run into the first null check same time, to avoid instanced more than one time, it needs to be checked again.
                 if(INSTANCE == null){ 
                     INSTANCE = new Singleton();
                  }
              } 
        }
        return INSTANCE;
    }
  }
```

## 3 饿汉式

较常用，但易产生垃圾对象

- 优点：无锁，执行效率高
- 缺点：类加载时就初始化，浪费内存

实例被声明成 `static final `变量，在第一次加载类到内存中时就会初始化，所以创建实例本身是线程安全的。基于类加载机制，避免了多线程的同步问题。

但`instance `在类装载时就实例化，虽然导致类装载的原因有很多种，在单例模式中大多数都是调用 `getInstance`， 但也不能确定有其他的方式（或者其他的静态方法）导致类装载，这时候初始化` instance` 显然没有达到` lazy loading` 

```java
 public class Singleton {
    private final static Singleton INSTANCE = new Singleton();
  
    // Private constructor suppresses   
    private Singleton() {}
 
    // default public constructor
    public static Singleton getInstance() {
        return INSTANCE;
    }
  }
```

这种写法若完美，就无需啰嗦双检锁了。其缺点就是它不是一种懒加载模式，单例会在加载类后一开始就被初始化，即使客户端没有调用getInstance()。

#### 局限性

Singleton实例创建依赖参数或配置文件，在 getInstance() 之前必须调用某个方法设置参数给它，那样这种单例写法就无法使用了。

## 4 双重检验锁模式（double checked locking pattern，DCL）

一种使用同步块加锁的方法。双重检查锁，是因为有两次检查` instance == null`：

![](https://img-blog.csdnimg.cn/a0e55ea7d720491aa7ba2378b4071f7e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

还是有问题，这行代码并非原子操作：

![](https://img-blog.csdnimg.cn/c368c77423e246fb96cbf81c258e8462.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

JVM对这一行 Java 代码大概做了：

1. memory = allocate()，分配对象的内存空间
2. ctorInstance()，调用 Singleton 的构造器初始化成员变量
3. `instance = memory` 设置instance指向刚分配的内存执行完这步 instance 就为非 null 了）

JVM和CPU优化，发生了指令重排，但是在JIT中存在指令重排序的优化。即第2步和第3步的顺序无法保证，最终执行顺序可能是 1-2-3 也可能 1-3-2。若为后者：

- 1、memory = allocate()，分配对象的内存空间
- 3、instance = memory，设置instance指向刚分配的内存
- 2、ctorInstance()，初始化对象
  则在 3 执行完毕、2 未执行之前，被线程二抢占了，这时 instance 已非 null，所以线程二会直接返回 instance，然后使用，然后顺理成章报错！

只需将 instance 变量声明成` volatile` 

有些人认为使用 volatile 的原因是可见性，即保证线程在本地不会存有 instance 的副本，每次都是去主存读取。但在这里不对，使用 volatile 的主要原因是其另一特性：禁止指令重排序优化。
在 volatile 变量的赋值操作后面会有一个内存屏障（生成的汇编代码），读操作不会被重排序到内存屏障前。
如上面的例子，取操作必须在执行完 1-2-3 之后或 1-3-2 之后，不存在执行到 1-3 然后取到值的情况。从「先行发生原则」理解，volatile变量的写操作都先行发生于后面对该变量的读操作（时间上的先后）。



线程安全的单例模式本质上其实也是单次初始化，可用Balking模式：

```java
class Singleton{
  private static Singleton singleton;
  // 构造方法私有化  
  private Singleton(){}
  // 获取实例（单例）
  public synchronized static Singleton getInstance(){
    if(singleton == null) {
      singleton = new Singleton();
    }
    return singleton;
  }
}
```

这个实现性能很差，因为互斥锁synchronized将getInstance()方法串行化了，是否可优化一下呢？

那就是DCL，一旦Singleton对象被成功创建之后，就不会执行synchronized(Singleton.class){}，即此时getInstance()方法的执行路径是无锁的，从而解决性能问题。使用volatile禁止编译优化。获取锁后的二次检查，出于安全性。

```java
class Singleton{
  private static volatile 
    Singleton singleton;
  //构造方法私有化  
  private Singleton() {}
  //获取实例（单例）
  public static Singleton 
  getInstance() {
    // 各种业务代码
    // 业务代码执行完后，才开始加锁
    // 第一次检查
    if(singleton==null){
      synchronize{Singleton.class){
        //获取锁后二次检查
        if(singleton==null){
          singleton=new Singleton();
        }
      }
    }
    return singleton;
  }
}
```

也可以使用DCL优化性能，双重检查中的第一次检查，完全是出于对性能的考量：避免执行加锁操作，因为加锁操作很耗时。而加锁之后的二次检查，则是出于对安全性负责。双重检查方案在优化加锁性能方面经常用到，ReadWriteLock实现缓存按需加载功能时，也用DCL。



![](https://img-blog.csdnimg.cn/20200404222647127.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200404222706217.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
对于 `T t = new T();`
其实有如下字节码指令完成

```bash
_new 'org/openjdk/jol/T'
dup
INVOKESPECIAL org/openjdk/jol/T.<init> ()V
astore 1
return
```



![](https://img-blog.csdnimg.cn/20200404223410946.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

线程一 new 到一半时,m=0,发生重排序
这时线程 2 来了!看到 t 已经指向了一个半初始化的实例了!
![](https://img-blog.csdnimg.cn/20200404223535766.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
这个概率很小,但是并发如淘宝,都是可能发生的!所以必须要加!



注意在 Java 5 以前的版本使用 volatile 双检锁还是有问题，因 Java 5 以前的 JMM （Java 内存模型）有缺陷，即使将变量声明成 volatile，也不能完全避免重排序。这个 volatile 屏蔽重排序的问题在 Java 5 才修复。

相信你不会喜欢这种复杂又隐含各种问题的方式，还有更好的实现线程安全的单例模式的方案。

## 5 静态内部类（线程安全）

能达到双检锁方式一样的功效，但实现更简单！
对static域使用延迟初始化，应使用这种方式而非DCL。

该方案只适于static域的情况，DCL可在实例域需延迟初始化时使用。
该方案同样利用 classloder 机制保证初始化 instance 时只有一个线程，和第 3 种方式不同：

- 第 3 种方式只要 Singleton 类被装载，instance 就会被实例化（没有达到 lazy loading 效果）
- 这种方式是 Singleton 类被装载，instance 不一定被初始化。因为 SingletonHolder 类没有被主动使用，只有通过显式调用 getInstance，才会显式装载 SingletonHolder 类，从而实例化 instance。若实例化 instance 很消耗资源，所以想让它延迟加载，又不希望在 Singleton 类加载时就实例化，因为不能确保 Singleton 类还可能在其他的地方被主动使用从而被加载，则此时实例化 instance 显然不合适。这时，就比第 3 种合理                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             

![](https://img-blog.csdnimg.cn/1d97b0361e5040029ef81e81fa15c1db.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 6 枚举（线程安全）

JDK5 起，实现单例模式的最佳方法。
最简洁，自动支持序列化机制，绝对防止多次实例化。
Effective Java 作者 Josh Bloch 提倡的方案：

- 避免多线程同步
- 自动支持序列化机制
- 防止反序列化重新创建新的对象
- 绝对防止多次实例化
- 不能通过反射侵入调用私有构造器

```java
public enum Singleton {  
    INSTANCE;  
    public void whateverMethod() {  
    }  
}  
```

## 总结

单例模式确保某一个类只有一个实例，而且自行实例化并向整个系统提供这个实例，这个类称为单例类，它提供全局访问的方法。单例模式的要点有三个：一是某个类只能有一个实例；二是它必须自行创建这个实例；三是它必须自行向整个系统提供这个实例。单例模式是一种对象创建型模式。

单例模式只包含一个单例角色：在单例类的内部实现只生成一个实例，同时它提供一个静态的工厂方法，让客户可以使用它的唯一实例；为了防止在外部对其实例化，将其构造函数设计为私有。

单例模式的目的是保证一个类仅有一个实例，并提供一个访问它的全局访问点。单例类拥有一个私有构造函数，确保用户无法通过new关键字直接实例化它。除此之外，该模式中包含一个静态私有成员变量与静态公有的工厂方法。该工厂方法负责检验实例的存在性并实例化自己，然后存储在静态成员变量中，以确保只有一个实例被创建。

单例模式的主要优点在于提供了对唯一实例的受控访问并可以节约系统资源；其主要缺点在于因为缺少抽象层而难以扩展，且单例类职责过重。

单例模式适用情况包括：系统只需要一个实例对象；客户调用类的单个实例只允许使用一个公共访问点。

## 最佳实践

不推荐懒汉式，推荐饿汉式。
只有在要明确实现懒加载时，才使用第 5 种。
若涉及到反序列化创建对象时，推荐使用枚举。
若有其他特殊需求，可考虑DCL。