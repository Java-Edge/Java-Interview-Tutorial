# 01-JVM虚拟机-上篇



JVM 架构如下图，接下来将从类加载子系统、运行时数据区来逐步讲解 JVM 虚拟机

![1702361654299](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702361654299.png)



## 类加载子系统



### 类加载的时机

类加载的时机主要有 4 个：

- 遇到 `new、getstatic、putstatic、invokestatic` 这四条字节码指令时，如果对应的类没有初始化，则要先进行初始化
  - new 关键字创建对象时
  - 读取或设置一个类型的静态字段时（被 final 修饰、已在编译器将结果放入常量池的静态类型字段除外）
  - 调用一个类型的静态方法的时候
- 对类进行 `反射调用` 时
- 初始化一个类的时候，如果其父类未初始化，要先初始化其父类
- 虚拟机启动时，要先加载主类（程序入口）



### 类加载过程

类的生命周期如下图：

![1702217979389](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702217979389.png)

- **加载**

  1. 通过二进制字节流加载 class 文件
  2. 创建该 class 文件在方法区的运行时数据结构
  3. 创建字节码对象 Class 对象 

- **链接**

  1. 验证：目的在于确保 class 文件的字节流中包含信息符合当前虚拟机要求，保证被加载类的正确性

     主要包括四种验证：文件格式验证、元数据验证、字节码验证、符号引用验证


  2. 准备：为类变量（即静态变量）分配内存并且设置类变量的默认初始值，即零值。

     这里不包含用 final 修饰的 static 变量，因为 final 修饰的变量在编译为 class 字节码文件的时候就会分配了，准备阶段会显式初始化

     这里不会为实例变量分配初始化，类变量会分配在方法区，而实例变量是会随着对象一起分配到 Java 堆中


  3. 解析：将常量池内的符号引用转换为直接引用的过程

     事实上，解析操作往往会伴随着 JVM 在执行完初始化之后再执行

     符号引用就是一组符号来描述所引用的莫表。符号引用的字面量形式明确定义在《java虚拟机规范》的Class 文件格式中。直接引用就是直接指向目标的指针、相对偏移量或一个间接定位到目标的句柄。

     解析动作主要针对类或接口、字段、类方法、接口方法、方法类型等。

- **初始化**

  虚拟机在初始化阶段才真正开始执行类中编写的 Java 程序代码

  初始化阶段就是执行类构造器 `<clinit>()` 方法的过程，`<clinit>()` 是 Javac 编译器自动生成的，该方法由编译器自动收集类中的所有类变量的赋值动作和静态语句块中的语句合并生成的，如果一个类中没有静态代码块， 也没有变量赋值的动作，那么编译器可以不为这个类生成 `<clinit>()` 方法

### 类加载器

JVM 中类加载是通过类加载器来完成的

![1702216110216](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702216110216.png)



- **启动类加载器(Bootstrap ClassLoader)：**
  - 负责加载 `JAVA_HOME\lib` 目录中的，或通过 `-Xbootclasspath` 参数指定路径中的，且被虚拟机认可（按文件名识别，如rt.jar）的类。由 C++ 实现，不是 ClassLoade r的子类
- **扩展类加载器(Extension ClassLoader)：**
  - 负责加载 `JAVA_HOME\lib\ext` 目录中的，或通过 `java.ext.dirs` 系统变量指定路径中的类库。
- **应用程序类加载器(Application ClassLoader)：**
  - 负责加载用户路径 `classpath` 上的类库
- **自定义类加载器（User ClassLoader）：**
  - 作用：JVM自带的三个加载器只能加载指定路径下的类字节码，如果某些情况下，我们需要加载应用程序之外的类文件，就需要用到自定义类加载器



通过代码查看类加载器的父子关系：

```java
public class ClassLoaderTest {
   public static void main(String[] args) {

      // 获取系统类加载器
      ClassLoader systemClassLoader = ClassLoader.getSystemClassLoader();
      System.out.println(systemClassLoader); // sun.misc.Launcher$AppClassLoader@18b4aac2

      // 获取其上层：扩展类加载器
      ClassLoader extClassLoader = systemClassLoader.getParent();
      System.out.println(extClassLoader); // sun.misc.Launcher$ExtClassLoader@1b6d3586

      // 获取其上层：引导类加载器（引导类加载器为 null）
      ClassLoader bootstrapClassLoader = extClassLoader.getParent();
      System.out.println(bootstrapClassLoader); // null

      // 对于用户自定义类来说：默认使用系统类加载器进行加载
      ClassLoader classLoader = ClassLoaderTest.class.getClassLoader();
      System.out.println(classLoader); // sun.misc.Launcher$AppClassLoader@18b4aac2

      // String类使用引导类加载器进行加载的 ---> java的核心类库都是使用引导类加载器进行加载的
      ClassLoader classLoader1 = String.class.getClassLoader();
      System.out.println(classLoader1); // null
   }
}
```





### 双亲委派机制

加载类的class文件时，Java虚拟机采用的是`双亲委派机制`，即把请求交给父类加载器去加载

**工作原理：**

1. 如果一个类加载器收到了类加载请求，他并不会自己先去加载，而是把这个请求委托给父类的加载器去执行
2. 如果父类加载器也存在其父类加载器，则继续向上委托
3. 如果父类加载器可以完成类加载任务，就成功返回；如果父类加载器无法完成类加载任务，则会由自家在其尝试自己去加载

**优势：**

1. 避免类的重复加载
2. 保护程序安全，防止核心API被篡改（例如，如果我们自定义一个java.lang.String类，然后我们去new String()，我们会发现创建的是jdk自带的String类，而不是我们自己创建的String类）



**为什么还需要破坏双亲委派？**

- 在实际应用中，可能存在 JDK 的基础类需要调用用户代码，例如：SPI 就打破双亲委派模式（打破双亲委派意味着上级委托下级加载器去加载类）
  - 比如，数据库的驱动，Driver 接口定义在 JDK 中，但是其实现由各个数据库的服务上提供，由系统类加载器进行加载，此时就需要 `启动类加载器` 委托子类加载器去加载 Driver 接口的实现



## 运行时数据区

JVM 由三部分组成：类加载系统、运行时数据区、执行引擎

![1702216687413](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702216687413.png)



下边讲一下运行时数据区中的构成

根据线程的使用情况分为两类：

- 线程独享（此区域不需要垃圾回收）
  - 虚拟机栈、本地方法栈、程序计数器
- 线程共享（数据存储区域，此区域需要垃圾回收）
  - 存储类的静态数据和对象数据
  - 堆和方法区



### 堆

Java 堆在 JVM 启动时创建内存区域去实现对象、数组与运行时常量的内存分配，它是虚拟机管理最大的，也是垃圾回收的主要内存区域

![1702217081095](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702217081095.png)

在 JDK1.8 中，堆由两部分组成：新生代和老年代

而在 JDK1.9 中，取消了新生代和老年代的物理划分，将堆划分为若干个区域 Region，如下图：

![1702217197789](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702217197789.png)



可以通过代码查看堆空间的大小：

```java
public class HeapSpaceInitial {
   public static void main(String[] args) {
      /**
         使用Runtime.getRuntime()获取当前 （运行时数据区） ， 是单例的。
       */

      // 返回Java虚拟机中的堆内存总量
      long initialMemory = Runtime.getRuntime().totalMemory() / 1024 / 1024;
      // 返回Java虚拟机试图使用的最大堆内存量
      long maxMemory = Runtime.getRuntime().maxMemory() / 1024 / 1024;

      System.out.println("-Xms: " + initialMemory + "M");
      System.out.println("-Xmx: " + maxMemory + "M");

      System.out.println("系统初始内存大小为: " + initialMemory * 64.0 / 1024 + "G");
      System.out.println("系统最大内存大小为: " + maxMemory * 4.0 / 1024 + "G");

      /**
       输出：
       -Xms: 243M
       -Xmx: 3609M
       系统初始内存大小为: 15.1875G
       系统最大内存大小为: 14.09765625G
       */
   }
}
```



通过命令行查看堆中的参数：

```bash
jps # 查看运行的进程
jstat -gc 进程id  # 查看该进程的堆中参数
```



通过 VM options 查看垃圾回收时的信息：

```bash
-XX:+PrintGCDetails
```



### 虚拟机栈

虚拟机栈为每个线程所私有的，如下图：

![1702219415676](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702219415676.png)



**栈帧是什么？**

栈帧存储了方法的`局部变量表、操作数栈、动态链接和方法返回地址`等信息

栈内存为线程私有的空间，每个方法在执行时都会创建一个栈帧，执行该方法时，就会将该方法所对应的栈帧入栈

- 局部变量表：用于存储方法参数和定义在方法体内部的局部变量，局部变量表的容量在编译器就被确定下来


- 操作数栈：在方法执行过程中，根据字节码指令，往栈中写入数据或者提取数据，即入栈、出栈


- 动态链接：每一个栈帧内部都包含一个指向 `运行时常量池` 中该栈所属方法的引用，包含这个引用的目的就是为了支持当前方法的代码能够实现动态链接，在 Java 源代码被编译为字节码文件时，所有变量和方法都为符号引用保存在 class 文件的常量池，`动态链接的作用就是将这些符号引用转换为调用方法的直接引用`
- 方法返回地址：无论哪种方法，在方法退出后都该回到该方法被调用的位置，因此 `方法返回地址` 存储调用者的 pc 计数器的值



**这里说一下符号引用和直接引用的区别？**

符号引用的字面量明确定义在 《Java虚拟机规范》 的 Class 文件格式中

直接引用就是直接指向目标的指针、相对偏移量或简介定位到目标的句柄



**栈会溢出吗？**

虚拟机栈会溢出的，如果方法调用的过多，导致栈中压入的栈帧太多，就会出现 `栈溢出错误`

- 如果线程请求的栈深度大于虚拟机所允许的深度（Xss默认1m），会抛出 StackOverflowError 异常
- 如果在创建新的线程时，没有足够的内存去创建对应的虚拟机栈，会抛出 OutOfMemoryError 异常



**静态方法不能使用 this，而非静态方法中可以使用 this？**

如果当前帧（虚拟机栈最上方的帧，即当前执行方法的栈帧）是由构造方法或者实例方法所产生的，那么该对象的 this 引用会被放在局部变量表中 index 为 0 的地方，因此在示例方法和构造方法中可以使用 this 关键字，而在静态方法的局部变量表中没有存储 this 的引用，因此无法使用 this 关键字



可以在 IDEA 中安装 `jclasslib` 插件，通过该插件来查看文件的字节码：

```java
public class Test {
    public void testThis() {
        int b = 100;
        System.out.println("testThis");
    }
    public static void testNoThis() {
        int a = 10;
        System.out.println("testNoThis");
    }
}
```

对于上述生成的字节码文件，我们可以看到 `testThis` 方法的局部变量表中有 this 变量，而 testNoThis 方法的局部变量表中没有 this 变量，如下图：

![1702261303511](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702261303511.png)



### 本地方法栈

本地方法栈是虚拟机所使用到的 `本地方法` ，比如 C++ 方法

一个 Native 方法就是一个 Java 调用非 Java 代码的接口



**为什么需要本地方法？**

Java是一门高级语言，我们不直接与操作系统资源、系统硬件打交道。如果想要直接与操作系统与硬件打交道，就需要使用到本地方法了

底层就是这么实现的，在多线程部分就会有很多 Java 调用 Native 方法的示例



### 方法区

方法区本质上是 Java 编译后代码的存储区域，存储了每一个类的结构信息，如：`运行时常量池`、成员变量、方法、构造方法和普通方法的字节码指令等内容



方法区主要存储的数据如下：

- Class
  1. 类型信息，如该 Class 为 class 类、接口、枚举、注解，类的修饰符等等信息
  2. 方法信息（方法名称、方法返回值、方法参数等等）
  3. 字段信息：保存字段信息，如字段名称、字段类型、字段修饰符
  4. 类变量（静态变量）：JDK1.7 之后转移到堆中存储
- 运行时常量池（字符串常量池）：JDK1.7 之后，转移到堆中存储
- JIT 编译器编译之后的代码缓存



方法区的具体实现有两种：永久代（PermGen）、元空间（Metaspace）

- JDK1.8 之前通过永久代实现方法区，JDK1.8 及之后使用元空间实现方法区
- 这两种实现的不同，从存储位置来看：
  - 永久代使用的内存区域为 JVM 进程所使用的区域，大小受 JVM 限制
  - 元空间使用的内存区域为物理内存区域，大小受机器的物理内存限制
- 从存储内容来看：
  - 永久代存储的信息上边方法区中规定的信息
  - 元空间只存储类的元信息，`而静态变量和运行时常量池都转移到堆中进行存储`



**为什么永久代要被元空间替换？**

-  字符串存在永久代中，容易出现性能问题和永久代内存溢出。
-  类及方法的信息等比较难确定其大小，因此对于永久代的大小指定比较困难，太小容易出现永久代溢出，太大则容易导致老年代溢出。
-  永久代会为 GC 带来不必要的复杂度，并且回收效率偏低。



**常量池**

- class常量池：一个class文件只有一个class常量池

  字面量：数值型（int、float、long、double）、双引号引起来的字符串值等

  符号引用：Class、Method、Field等

- 运行时常量池：一个class对象有一个运行时常量池

  字面量：数值型（int、float、long、double）、双引号引起来的字符串值等

  符号引用：Class、Method、Field等

- 字符串常量池：全局只有一个字符串常量池

  双引号引起来的字符串值



### 程序计数器

程序计数器用于存储当前线程所执行的字节码指令的行号，用于选取下一条需要执行的字节码指令

分支，循环，跳转，异常处理，线程回复等都需要依赖这个计数器来完成

通过程序计数器，可以在线程发生切换时，可以保存该线程执行的位置





### 直接内存

直接内存（也称为堆外内存）并不是虚拟机运行时数据区的一部分，直接内存的大小受限于系统的内存

在 JDK1.4 引入了 NIO 类，在 NIO 中可以通过使用 native 函数库直接分配堆外内存，然后通过存储在堆中的 `DirectByteBuffer` 对象作为这块内存的引用进行操作

使用直接内存，可以避免了 Java 堆和 Native 堆中来回复制数据



**直接内存使用场景：**

- 有很大的数据需要存储，且数据生命周期长
- 频繁的 IO 操作，如网络并发场景



**直接内存与堆内存比较：**

- 直接内存申请空间耗费更高的性能，当频繁申请到一定量时尤为明显
- 直接内存IO读写的性能要优于普通的堆内存，在多次读写操作的情况下差异明显



**直接内存相比于堆内存，避免了数据的二次拷贝。**

- 我们先来分析`不使用直接内存`的情况，我们在网络发送数据需要将数据先写入 Socket 的缓冲区内，那么如果数据存储在 JVM 的堆内存中的话，会先将堆内存中的数据复制一份到直接内存中，再将直接内存中的数据写入到 Socket 缓冲区中，之后进行数据的发送 

  - **`为什么不能直接将 JVM 堆内存中的数据写入 Socket 缓冲区中呢？`**

    在 JVM 堆内存中有 GC 机制，GC 后可能会导致堆内存中数据位置发生变化，那么如果直接将 JVM 堆内存中的数据写入 Socket 缓冲区中，如果写入过程中发生 GC，导致我们需要写入的数据位置发生变化，就会将错误的数据写入 Socket 缓冲区

- 那么如果使用直接内存的时候，我们将`数据直接存放在直接内存中`，在堆内存中只存放了对直接内存中数据的引用，这样在发送数据时，直接将数据从直接内存取出，放入 Socket 缓冲区中即可，`减少了一次堆内存到直接内存的拷贝`  



![1702264173661](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702264173661.png)



直接内存与非直接内存性能比较：

```java
public class ByteBufferCompare {
    public static void main(String[] args) {
        //allocateCompare(); //分配比较
        operateCompare(); //读写比较
    }

    /**
     * 直接内存 和 堆内存的 分配空间比较
     * 结论： 在数据量提升时，直接内存相比非直接内的申请，有很严重的性能问题
     */
    public static void allocateCompare() {
        int time = 1000 * 10000; //操作次数,1千万
        long st = System.currentTimeMillis();
        for (int i = 0; i < time; i++) {
            //ByteBuffer.allocate(int capacity) 分配一个新的字节缓冲区。
            ByteBuffer buffer = ByteBuffer.allocate(2); //非直接内存分配申请
        }
        long et = System.currentTimeMillis();
        System.out.println("在进行" + time + "次分配操作时，堆内存 分配耗时:" +
                (et - st) + "ms");
        long st_heap = System.currentTimeMillis();
        for (int i = 0; i < time; i++) {
            //ByteBuffer.allocateDirect(int capacity) 分配新的直接字节缓冲区。
            ByteBuffer buffer = ByteBuffer.allocateDirect(2); //直接内存分配申请
        }
        long et_direct = System.currentTimeMillis();
        System.out.println("在进行" + time + "次分配操作时，直接内存 分配耗时:" +
                (et_direct - st_heap) + "ms");
    }

    /**
     * 直接内存 和 堆内存的 读写性能比较
     * 结论：直接内存在直接的IO 操作上，在频繁的读写时 会有显著的性能提升
     */
    public static void operateCompare() {
        int time = 10 * 10000 * 10000; //操作次数,10亿
        ByteBuffer buffer = ByteBuffer.allocate(2 * time);
        long st = System.currentTimeMillis();
        for (int i = 0; i < time; i++) {
            // putChar(char value) 用来写入 char 值的相对 put 方法
            buffer.putChar('a');
        }
        buffer.flip();
        for (int i = 0; i < time; i++) {
            buffer.getChar();
        }
        long et = System.currentTimeMillis();
        System.out.println("在进行" + time + "次读写操作时，非直接内存读写耗时：" +
                (et - st) + "ms");
        ByteBuffer buffer_d = ByteBuffer.allocateDirect(2 * time);
        long st_direct = System.currentTimeMillis();
        for (int i = 0; i < time; i++) {
            // putChar(char value) 用来写入 char 值的相对 put 方法
            buffer_d.putChar('a');
        }
        buffer_d.flip();
        for (int i = 0; i < time; i++) {
            buffer_d.getChar();
        }
        long et_direct = System.currentTimeMillis();
        System.out.println("在进行" + time + "次读写操作时，直接内存读写耗时:" +
                (et_direct - st_direct) + "ms");
    }
}
```







## 对象的创建流程与内存分配

对象创建流程如下：

![1702268430947](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702268430947.png)



**Java 中新创建的对象如何分配空间呢？**

1. new 的对象先放 Eden 区（如果是大对象，直接放入老年代）
2. 当 Eden 区满了之后，程序还需要创建对象，则垃圾回收器会对 Eden 区进行垃圾回收
3. 在垃圾回收的时候，会将 Eden 区的幸存对象转移到 Survivor From 区
4. 如果再次触发垃圾回收，此时将 Eden 区的幸存对象转移到 Survivor To 区中，并且将 Survivor From 区中的幸存对象也转移到 Survivor To 区
5. 如果再次出发垃圾回收，此时将 Eden 区和 Survivor To 区中的幸存对象转移到 Survivor From 区中
6. 当对象的生存年龄达到 15 时，会被放入老年代



在幸存对象每次转移的时候，对会将对象的生存年龄 + 1，达到 15 时会放入老年代中



**Java 对象只会分配在堆中吗？**

不是的，如果经过 `逃逸分析` 后发现，一个对象并没有逃逸出方法的话，就可能被优化为在`栈上分配`，这是常见的堆外存储技术。

逃逸分析就是分析对象动态作用域：

- 对象在方法中被定义后，对象只在方法内部使用，则认为没有发生逃逸
- 对象在方法中被定义后，对象被外部方法所引用，则认为发生逃逸




> 在 HashMap 中就将变量声明在方法中，可以将变量存储在栈中，提升速度
>
> ![1702470108410](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702470108410.png)




**什么情况下，对象会直接进入老年代？**

- 对象存储年龄默认超过 15 次（-XX:MaxTenuringThreshold）
- 动态年龄判断：Minor GC 之后，发现 Survivor 区中一批对象的总大小大于这块 Survivor 区的 50%，那么会将此时大于这批对象年龄最大值的所有对象放入老年代，如：一批对象年龄分别为3，4，5，这批对象的总和大于 Survivor 区的 50%，那么会将年龄大于 5 的对象放入老年代
- 大对象直接进入老年代：`前提是 Serial 和 ParNew 收集器`
- MinorGC 后，存活对象太多无法放入 Survivor





**空间担保机制：**空间担保是在 `老年代` 中进行空间分配担保

空间担保指的是在 MinorGC 前，会判断老年代可用内存是否大于新生代全部对象大小，如果大于，则此次 Minor GC 是安全的

如果小于，则会检查老年代最大连续可用空间是否大于 `历次晋升到老年代对象的平均大小`，如果大于，则尝试 Minor GC；如果小于，则进行 Full GC



**老年代的空间担保如下图：**

![1702270007713](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702270007713.png)



### 对象内存布局

对象存储在堆内存中主要分为三块区域：

1. 对象头（Header）：Java 对象头占 8B，如果是数组则占 12 B，因为数组还需要 4B 存储数组大小，对象头又分为：
   - 标记字段 MarkWord
     - 存储对象自身运行时的数据，synchronized 实现的轻量级锁和偏向锁就在这里设置
     - 默认存储：对象 HashCode、GC 分代年龄、锁状态等等
   - 类型指针 KlassPoint
     - KlassPoint 是对象指向它的类元数据的指针，来确定这个对象是哪个类的实例对象
     - 开启指针压缩后存储空间为 4B，不开为 8B
   - 数组长度：如果对象是数组，则记录，占 4B
   - 对其填充：保证数组的大小永远是 8B 的整数倍
2. 示例数据（Instance Data）：生成对象时，对象的非静态成员变量也会在堆内存中存储
3. 对齐填充（Padding）：JVM 内对象都采用 8B 对齐，不够 8B 的会自动补齐

![1702271118104](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702271118104.png)



对象头的信息并非是固定的，根据对象状态的不同，对象头存储的信息也是不同的，在 JDK1.8 中如下图：

![1702271242007](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702271242007.png)



**打印对象的内存布局信息：**

引入依赖：

```xml
<dependency>
  <groupId>org.openjdk.jol</groupId>
  <artifactId>jol-core</artifactId>
  <version>0.9</version>
</dependency>
```

代码：

```java
public class Test {
    public static void main(String[] args) {
        Object o = new Object();
        System.out.println(ClassLayout.parseInstance(o).toPrintable());
    }
}
```



控制台打印如下，对象头占 12B（MarkWord 8B + KlassPoint 4B），有 4B 的对齐填充，实例数据 0B，因此整个对象大小为 16B

![1702271416744](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702271416744.png)



### 对象的访问定位

有两种方式：

- 通过句柄访问：稳定，对象被移动只需要修改句柄中的地址
- 通过直接指针访问：访问速度快，节省了一次指针定位的开销



**句柄访问如下图：**

![1702277415695](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702277415695.png)



**直接指针访问如下图：**

![1702277545036](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702277545036.png)

