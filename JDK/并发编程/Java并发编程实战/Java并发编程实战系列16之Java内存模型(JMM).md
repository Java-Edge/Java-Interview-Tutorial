前面几章介绍的安全发布、同步策略的规范还有一致性，这些安全性都来自于JMM。

### [](#161-%E4%BB%80%E4%B9%88%E6%98%AF%E5%86%85%E5%AD%98%E6%A8%A1%E5%9E%8B%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81%E5%AE%83)16.1 什么是内存模型，为什么需要它？

假设

```
a=3

```

内存模型要解决的问题是：“在什么条件下，读取a的线程可以看到这个值为3？”

如果缺少同步会有很多因素导致无法立即、甚至永远看不到一个线程的操作结果，包括

*   编译器中指令顺序
*   变量保存在寄存器而不是内存中
*   处理器可以乱序或者并行执行指令
*   缓存可能会改变将写入变量提交到主内存的次序
*   处理器中也有本地缓存，对其他处理器不可见

单线程中，会为了提高速度使用这些技术，但是Java语言规范要求JVM在线程中维护一种类似串行的语义：只要程序的最终结果与在严格环境中的执行结果相同，那么上述操作都是允许的。

随着处理器越来越强大，编译器也在不断的改进，通过指令重排序实现优化执行，使用成熟的全局寄存器分配算法，但是单处理器存在瓶颈，转而变为多核，提高并行性。

在多线程环境中，维护程序的串行性将导致很大的性能开销，并发程序中的线程，大多数时间各自为政，线程之间协调操作只会降低应用程序的运行速度，不会带来任何好处，只有当多个线程要共享数据时，才必须协调他们之间的操作，并且JVM依赖程序通过同步操作找出这些协调操作将何时发生。

JMM规定了JVM必须遵循一组最小的保证，**保证规定了对变量的写入操作在何时将对其他线程可见。**JMM需要在各个处理器体系架构中实现一份。

#### [](#1611-%E5%B9%B3%E5%8F%B0%E7%9A%84%E5%86%85%E5%AD%98%E6%A8%A1%E5%9E%8B)16.1.1 平台的内存模型

在共享内存的多处理器体系架构中，每个处理器拥有自己的缓存，并且定期的与主内存进行协调。在不同的处理器架构中提供了不同级别的缓存一致性（cache coherence）。其中一部分只提供最小的保证，即允许不同的处理器在任意时刻从同一个存储位置上看到不同的值。操作系统、编译器以及runtime需要弥补这种硬件能力与线程安全需求之间的差异。

要确保每个处理器在任意时刻都知道其他处理器在进行的工作，这将开销巨大。多数情况下，这完全没必要，可随意放宽存储一致性，换取性能的提升。存在一些特殊的指令（成为内存栅栏），当需要共享数据时，这些指令就能实现额外的存储协调保证。为了使Java开发人员无须关心不同架构上内存模型之间的差异，产生了JMM，JVM通过在适当的位置上插入内存栅栏来屏蔽JMM与底层平台内存模型之间的差异。

按照程序的顺序执行，这种乐观的串行一致性在任何一款现代多处理器架构中都不会提供这种串行一致性。当跨线程共享数据时，会出现一些奇怪的情况，除非通过使用内存栅栏来防止这种情况的发生。

#### [](#1612-%E9%87%8D%E6%8E%92%E5%BA%8F)16.1.2 重排序

下面的代码，4中输出都是有可能的。

```
public class ReorderingDemo {

    static int x = 0, y = 0, a = 0, b = 0;

    public static void main(String[] args) throws Exception {
        Bag bag = new HashBag();
        for (int i = 0; i < 10000; i++) {
            x = y = a = b = 0;
            Thread one = new Thread() {
                public void run() {
                    a = 1;
                    x = b;
                }
            };
            Thread two = new Thread() {
                public void run() {
                    b = 1;
                    y = a;
                }
            };
            one.start();
            two.start();
            one.join();
            two.join();
            bag.add(x + "_" + y);
        }
        System.out.println(bag.getCount("0_1"));
        System.out.println(bag.getCount("1_0"));
        System.out.println(bag.getCount("1_1"));
        System.out.println(bag.getCount("0_0"));
        // 结果是如下的或者其他情况，证明可能发生指令重排序
        //        9999
        //        1
        //        0
        //        0

        //        9998
        //        2
        //        0
        //        0
    }

```

#### [](#1613-java%E5%86%85%E5%AD%98%E6%A8%A1%E5%9E%8B%E7%AE%80%E4%BB%8B)16.1.3 Java内存模型简介

JMM通过各种操作来定义，包括对变量的读写操作，监视器monitor的加锁和释放操作，以及线程的启动和合并操作，JMM为程序中所有的操作定义了一个偏序关系，成为Happens-before，要想保证执行操作B的线程看到A的结果，那么A和B之间必须满足Happens-before关系。如果没有这个关系，JVM可以任意的重排序。

**JVM来定义了JMM（Java内存模型）来屏蔽底层平台不同带来的各种同步问题，使得程序员面向JAVA平台预期的结果都是一致的，对于“共享的内存对象的访问保证因果性正是JMM存在的理由”（这句话说的太好了！！！）。**

因为没法枚举各种情况，所以提供工具辅助程序员自定义，另外一些就是JMM提供的通用原则，叫做happens-before原则，就是如果动作B要看到动作A的执行结果（无论A/B是否在同一个线程里面执行），那么A/B就需要满足happens-before关系。下面是所有的规则，满足这些规则是一种特殊的处理措施，否则就按照上面背景提到的对于可见性、顺序性是没有保障的，会出现“意外”的情况。

如果多线程写入遍历，没有happens-before来排序，那么会产生race condition。在正确使用同步的的程序中，不存在数据竞争，会表现出串行一致性。

*   （1）同一个线程中的每个Action都happens-before于出现在其后的任何一个Action。//控制流，而非语句
*   （2）对一个监视器的解锁happens-before于每一个后续对同一个监视器的加锁。//lock、unlock
*   （3）对volatile字段的写入操作happens-before于每一个后续的同一个字段的读操作。
*   （4）Thread.start()的调用会happens-before于启动线程里面的动作。
*   （5）Thread中的所有动作都happens-before于其他线程检查到此线程结束或者Thread.join（）中返回或者Thread.isAlive()==false。
*   （6）一个线程A调用另一个另一个线程B的interrupt（）都happens-before于线程A发现B被A中断（B抛出异常或者A检测到B的isInterrupted（）或者interrupted()）。
*   （7）一个对象构造函数的结束happens-before与该对象的finalizer的开始
*   （8）如果A动作happens-before于B动作，而B动作happens-before与C动作，那么A动作happens-before于C动作。

#### [](#1614-%E5%80%9F%E5%8A%A9%E5%90%8C%E6%AD%A5)16.1.4 借助同步

piggyback（借助）现有的同步机制可见性。例如在AQS中借助一个volatile的state变量保证happens-before进行排序。

举例：Inner class of FutureTask illustrating synchronization piggybacking. (See JDK source)

还可以记住CountDownLatch，Semaphore，Future，CyclicBarrier等完成自己的希望。

### [](#162-%E5%8F%91%E5%B8%83)16.2 发布

第三章介绍了如何安全的或者不正确的发布一个对象，其中介绍的各种技术都依赖JMM的保证，而造成发布不正确的原因就是

*   发布一个共享对象
*   另外一个线程访问该对象

之间缺少一种happens-before关系。

#### [](#1621-%E4%B8%8D%E5%AE%89%E5%85%A8%E7%9A%84%E5%8F%91%E5%B8%83)16.2.1 不安全的发布

缺少happens-before就会发生重排序，会造成发布一个引用的时候，和内部各个field初始化重排序，比如

```
init field a
init field b
发布ref
init field c

```

这时候从使用这角度就会看到一个被部分构造的对象。

错误的延迟初始化将导致不正确的发布，如下代码。这段代码不光有race condition、创建低效等问题还存储在另外一个线程会看到部分构造的Resource实例引用。

```
@NotThreadSafe
public class UnsafeLazyInitialization {
    private static Resource resource;

    public static Resource getInstance() {
        if (resource == null)
            resource = new Resource(); // unsafe publication
        return resource;
    }

    static class Resource {
    }
}

```

那么，除非使用final，或者发布操作线程在使用线程开始之前执行，这些都满足了happens-before原则。

#### [](#1622-%E5%AE%89%E5%85%A8%E7%9A%84%E5%8F%91%E5%B8%83)16.2.2 安全的发布

使用第三章的各种技术可以安全发布对象，去报发布对象的操作在使用对象的线程开始使用对象的引用之前执行。如果A将X放入BlockingQueue，B从队列中获取X，那么B看到的X与A放入的X相同，实际上由于使用了锁保护，实际B能看到A移交X之前所有的操作。

#### [](#1623-%E5%AE%89%E5%85%A8%E7%9A%84%E5%88%9D%E5%A7%8B%E5%8C%96%E6%A8%A1%E5%BC%8F)16.2.3 安全的初始化模式

有时候需要延迟初始化，最简单的方法：

```
@ThreadSafe
public class SafeLazyInitialization {
    private static Resource resource;

    public synchronized static Resource getInstance() {
        if (resource == null)
            resource = new Resource();
        return resource;
    }

    static class Resource {
    }
}

```

如果getInstance调用不频繁，这绝对是最佳的。

在初始化中使用static会提供额外的线程安全保证。静态初始化是由JVM在类的初始化阶段执行，并且在类被加载后，在线程使用前的。静态初始化期间，内存写入操作将自动对所有线程可见。因此静态初始化对象不需要显示的同步。下面的代码叫做eager initialization。

```
@ThreadSafe
public class EagerInitialization {
    private static Resource resource = new Resource();

    public static Resource getResource() {
        return resource;
    }

    static class Resource {
    }
}

```

下面是lazy initialization。JVM推迟ResourceHolder的初始化操作，直到开始使用这个类时才初始化，并且通过一个static来做，不需要额外的同步。

```
@ThreadSafe
public class ResourceFactory {
    private static class ResourceHolder {
        public static Resource resource = new Resource();
    }

    public static Resource getResource() {
        return ResourceFactory.ResourceHolder.resource;
    }

    static class Resource {
    }
}

```

#### [](#1624-%E5%8F%8C%E9%87%8D%E6%A3%80%E6%9F%A5%E5%8A%A0%E9%94%81cdl)16.2.4 双重检查加锁CDL

DCL实际是一种糟糕的方式，是一种anti-pattern，它只在JAVA1.4时代好用，因为早期同步的性能开销较大，但是现在这都不是事了，已经不建议使用。

```
@NotThreadSafe
public class DoubleCheckedLocking {
    private static Resource resource;

    public static Resource getInstance() {
        if (resource == null) {
            synchronized (DoubleCheckedLocking.class) {
                if (resource == null)
                    resource = new Resource();
            }
        }
        return resource;
    }

    static class Resource {

    }
}

```

初始化instance变量的伪代码如下所示：

```
memory = allocate();   //1：分配对象的内存空间
ctorInstance(memory);  //2：初始化对象
instance = memory;     //3：设置instance指向刚分配的内存地址

```

之所以会发生上面我说的这种状况，是因为在一些编译器上存在指令排序，初始化过程可能被重排成这样：

```
memory = allocate();   //1：分配对象的内存空间
instance = memory;     //3：设置instance指向刚分配的内存地址
                       //注意，此时对象还没有被初始化！
ctorInstance(memory);  //2：初始化对象

```

而volatile存在的意义就在于禁止这种重排！解决办法是声明为volatile类型。这样就可以用DCL了。

```
@NotThreadSafe
public class DoubleCheckedLocking {
    private static volatile Resource resource;

    public static Resource getInstance() {
        if (resource == null) {
            synchronized (DoubleCheckedLocking.class) {
                if (resource == null)
                    resource = new Resource();
            }
        }
        return resource;
    }

    static class Resource {

    }
}

```

### [](#163-%E5%88%9D%E5%A7%8B%E5%8C%96%E8%BF%87%E7%A8%8B%E4%B8%AD%E7%9A%84%E5%AE%89%E5%85%A8%E6%80%A7)16.3 初始化过程中的安全性

final不会被重排序。

下面的states因为是final的所以可以被安全的发布。即使没有volatile，没有锁。但是，如果除了构造函数外其他方法也能修改states。如果类中还有其他非final域，那么其他线程仍然可能看到这些域上不正确的值。也导致了构造过程中的escape。

写final的重排规则：

*   JMM禁止编译器把final域的写重排序到构造函数之外。
*   编译器会在final域的写之后，构造函数return之前，插入一个StoreStore屏障。这个屏障禁止处理器把final域的写重排序到构造函数之外。也就是说：写final域的重排序规则可以确保：在对象引用为任意线程可见之前，对象的final域已经被正确初始化过了。

读final的重排规则：

*   在一个线程中，初次读对象引用与初次读该对象包含的final域，JMM禁止处理器重排序这两个操作（注意，这个规则仅仅针对处理器）。编译器会在读final域操作的前面插入一个LoadLoad屏障。也就是说：读final域的重排序规则可以确保：在读一个对象的final域之前，一定会先读包含这个final域的对象的引用。

如果final域是引用类型，那么增加如下约束：

*   在构造函数内对一个final引用的对象的成员域的写入，与随后在构造函数外把这个被构造对象的引用赋值给一个引用变量，这两个操作之间不能重排序。（个人觉得基本意思也就是确保在构造函数外把这个被构造对象的引用赋值给一个引用变量之前，final域已经完全初始化并且赋值给了当前构造对象的成员域，至于初始化和赋值这两个操作则不确保先后顺序。）

```
@ThreadSafe
public class SafeStates {
    private final Map<String, String> states;

    public SafeStates() {
        states = new HashMap<String, String>();
        states.put("alaska", "AK");
        states.put("alabama", "AL");
        /*...*/
        states.put("wyoming", "WY");
    }

    public String getAbbreviation(String s) {
        return states.get(s);
    }
}
```
