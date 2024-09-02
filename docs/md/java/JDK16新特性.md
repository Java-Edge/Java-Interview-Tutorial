# JDK16新特性

JDK 16 在 2021 年 3 月 16 号发布：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/734c8b1d1a36ac785120e9443b4627f0.png)



## 1 语言特性增强

### JEP 394: instanceof 模式匹配

> 模式匹配（Pattern Matching）最早在 Java 14 中作为预览特性引入，在 Java 15 中还是预览特性，在Java 16中成为正式版。模式匹配通过对 instacneof 运算符进行模式匹配来增强 Java 编程语言。

对 instanceof 的改进，主要目的是为了让创建对象更简单、简洁和高效，并且可读性更强、提高安全性。

如果 if 条件中有 && 运算符时，当 instanceof 类型匹配成功，模式局部变量的作用范围也可以相应延长，如下面代码：

```java
if (obj instanceof String s && s.length() > 5) {.. s.contains(..) ..}
```

注意，这种作用范围延长，并不适用于或 || 运算符，因为即便 || 运算符左边的 instanceof 类型匹配没有成功也不会造成短路，依旧会执行到||运算符右边的表达式，但是此时，因为 instanceof 类型匹配没有成功，局部变量并未定义赋值，此时使用会产生问题。

与传统写法对比，可以发现模式匹配不但提高了程序的安全性、健壮性，另一方面，不需要显式的去进行二次类型转换，减少了大量不必要的强制类型转换。模式匹配变量在模式匹配成功之后，可以直接使用，同时它还被限制了作用范围，大大提高了程序的简洁性、可读性和安全性。instanceof 的模式匹配，为 Java 带来的有一次便捷的提升，能够剔除一些冗余的代码，写出更加简洁安全的代码，提高码代码效率。

### JEP 395: Records (正式版)

Records 最早在 Java 14 中作为预览特性引入，在 Java 15 中还是预览特性，在Java 16中成为正式版。

记录类可以声明嵌套类型，包括嵌套记录类。 如果一个记录类本身是嵌套的，那么它就是隐式静态的；这就避免了紧接着的外层实例会默默地为记录类添加状态。

### Allow static members to be declared in inner classes

目前的规定是，如果内部类声明的成员是显式或隐式静态成员，则编译时会出错，除非该成员是常量变量。 例如，这意味着内部类不能声明记录类成员，因为嵌套的记录类是隐式静态的。 但该版本放宽了这一限制，允许内部类声明显式或隐式静态成员。 特别是，这允许内部类声明一个记录类的静态成员。

#### 摘要

放宽禁止内部类声明静态成员的语言限制。 

#### 问题

自嵌套类首次引入 Java 以来，除了通过常量表达式初始化的静态最终字段外，禁止内部嵌套类声明静态成员。 这一限制适用于非静态成员类、局部类和匿名类。 

JEP 384 中，记录类的第二个预览版增加了对局部接口、枚举类和记录类的支持。 这是一个广受好评的增强功能，它允许将某些声明的范围缩小到本地上下文的编码样式。 

JEP 384 允许使用静态局部类和接口，但没有放宽对内部类的静态成员类和接口的限制。 因此，内部类可以在其方法体中声明静态接口，但不能作为类成员。

作为自然的下一步，JEP 395 建议进一步放宽嵌套限制，允许在内部类中声明静态类、方法、字段等。 JEP 384 中的语言修改已经解决了变量和方法引用等在这些上下文中的行为问题，因此只需取消限制即可。 

#### 解决方案

取消不允许在内部类（包括非静态成员类、局部类和匿名类）中进行静态声明的限制。 新允许的声明包括：

- 静态字段
- 静态方法
- 静态成员类和接口
- 静态初始化器

嵌套的静态声明不能访问外层实例、局部变量或类型参数。 这些规则已由 JEP 384 建立，用于处理本地接口、枚举和记录。 

由于内部类可以继承静态成员，这对语言处理其他地方发生的限定成员访问没有影响。

 这一变更对现有程序没有影响--它扩展了合法程序集，但不会使任何现有程序成为非法程序或改变其行为。

## 2 新工具和库



### JEP 390: 对基于值的类发出警告

JDK9注解@Deprecated得到了增强，增加了 since 和 forRemoval 两个属性；

JDK16中对`@jdk.internal.ValueBased`注解加入了基于值的类的告警，所以继续在 Synchronized 同步块中使用值类型，将会在编译期和运行期产生警告，甚至是异常。

JDK16中对基于值的类（@jdk.internal.ValueBased）给出告警。

在JDK9中我们可以看到Integer.java类构造函数中加入了`@Deprecated(since="9")`，表示在JDK9版本中被弃用并且在将来的某个版本中一定会被删除

```java
public final class Integer extends Number implements Comparable<Integer> {

// ... 
    /**
     * Constructs a newly allocated {@code Integer} object that
     * represents the specified {@code int} value.
     *
     * @param   value   the value to be represented by the
     *                  {@code Integer} object.
     *
     * @deprecated
     * It is rarely appropriate to use this constructor. The static factory
     * {@link #valueOf(int)} is generally a better choice, as it is
     * likely to yield significantly better space and time performance.
     */
    @Deprecated(since="9")
    public Integer(int value) {
        this.value = value;
    }
// ... 

}
```

JDK16 Integer.java：

```java
/*
* <p>This is a <a href="{@docRoot}/java.base/java/lang/doc-files/ValueBased.html">value-based</a>
 * class; programmers should treat instances that are
 * {@linkplain #equals(Object) equal} as interchangeable and should not
 * use instances for synchronization, or unpredictable behavior may
 * occur. For example, in a future release, synchronization may fail.
 *
 * <p>Implementation note: The implementations of the "bit twiddling"
 * methods (such as {@link #highestOneBit(int) highestOneBit} and
 * {@link #numberOfTrailingZeros(int) numberOfTrailingZeros}) are
 * based on material from Henry S. Warren, Jr.'s <i>Hacker's
 * Delight</i>, (Addison Wesley, 2002).
 */
@jdk.internal.ValueBased
public final class Integer extends Number
        implements Comparable<Integer>, Constable, ConstantDesc {

// ... 
  /**
    * Constructs a newly allocated {@code Integer} object that
    * represents the specified {@code int} value.
    *
    * @param   value   the value to be represented by the
    *                  {@code Integer} object.
    *
    * @deprecated
    * It is rarely appropriate to use this constructor. The static factory
    * {@link #valueOf(int)} is generally a better choice, as it is
    * likely to yield significantly better space and time performance.
    */
  @Deprecated(since="9", forRemoval = true)
  public Integer(int value) {
      this.value = value;
  }
// ...
```

添加`@jdk.internal.ValueBased`和`@Deprecated(since="9", forRemoval = true)`为了啥？

**JDK设计者建议用Integer a = 10或Integer.valueOf()函数，而非new Integer()，让其抛出告警？**

构造函数都标记@Deprecated(since="9", forRemoval = true)，即其构造函数在将来会被删除，不应在程序中继续用如new Integer(); 如继续用，编译期产生'Integer(int)' is deprecated and marked for removal 告警。

**并发环境下，Integer 对象根本无法通过 Synchronized 来保证线程安全，让其抛出告警？**

由于JDK中对`@jdk.internal.ValueBased`注解加入了基于值的类的告警，所以继续在 Synchronized 同步块中使用值类型，将会在编译期产生警告，甚至异常。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/547ddc6eff04774b09ef2b5413fc872e.png)

### JEP 392：打包工具（正式版）

此特性最初是作为 Java 14 中的一个孵化器模块引入的，该工具允许打包自包含的 Java 应用程序。它支持原生打包格式，为最终用户提供自然的安装体验，这些格式包括 Windows 上的 msi 和 exe、macOS 上的 pkg 和 dmg，还有 Linux 上的 deb 和 rpm。它还允许在打包时指定启动时参数，并且可以从命令行直接调用，也可以通过 ToolProvider API 以编程方式调用。注意 jpackage 模块名称从 jdk.incubator.jpackage 更改为 jdk.jpackage。这将改善最终用户在安装应用程序时的体验，并简化了“应用商店”模型的部署。

### JEP 396：默认强封装 JDK 内部元素

此特性会默认强封装 JDK 的所有内部元素，但关键内部 API（例如 sun.misc.Unsafe）除外。默认情况下，使用早期版本成功编译的访问 JDK 内部 API 的代码可能不再起作用。鼓励开发人员从使用内部元素迁移到使用标准 API 的方法上，以便他们及其用户都可以无缝升级到将来的 Java 版本。强封装由 JDK 9 的启动器选项–illegal-access 控制，到 JDK 15 默认改为 warning，从 JDK 16 开始默认为 deny。（目前）仍然可以使用单个命令行选项放宽对所有软件包的封装，将来只有使用–add-opens 打开特定的软件包才行。

## 3 JVM 优化

### JEP 376：ZGC 并发线程处理

JEP 376 将 ZGC 线程栈处理从安全点转移到一个并发阶段，甚至在大堆上也允许在毫秒内暂停 GC 安全点。消除 ZGC 垃圾收集器中最后一个延迟源可以极大地提高应用程序的性能和效率。

### JEP 387：弹性元空间

此特性可将未使用的 HotSpot 类元数据（即元空间，metaspace）内存更快速地返回到操作系统，从而减少元空间的占用空间。具有大量类加载和卸载活动的应用程序可能会占用大量未使用的空间。新方案将元空间内存按较小的块分配，它将未使用的元空间内存返回给操作系统来提高弹性，从而提高应用程序性能并降低内存占用。

## 4 新功能的预览和孵化



### JEP 338：向量 API（孵化器）

AVX（Advanced Vector Extensions，高级向量扩展）实际上是 x86-64 处理器上的一套 SIMD（Single Instruction Multiple Data，单指令多数据流）指令集，相对于 SISD（Single instruction, Single dat，单指令流但数据流）而言，SIMD 非常适用于 CPU 密集型场景，因为向量计算允许在同一个 CPU 时钟周期内对多组数据批量进行数据运算，执行性能非常高效，甚至从某种程度上来看，向量运算似乎更像是一种并行任务，而非像标量计算那样，在同一个 CPU 时钟周期内仅允许执行一组数据运算，存在严重的执行效率低下问题。

随着 Java16 的正式来临，开发人员可以在程序中使用 Vector API 来实现各种复杂的向量计算，由 JIT 编译器 Server Compiler(C2)在运行期将其编译为对应的底层 AVX 指令执行。当然，在讲解如何使用 Vector API 之前，我们首先来看一个简单的标量计算程序。如：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/37aaf1b5c982c5ad328f9664858eeb30.png)

在上述程序示例中，循环体内每次只能执行一组浮点运算，总共需要执行约 1000 万次才能够获得最终的运算结果，可想而知，这样的执行效率必然低效。

从 Java6 的时代开始，Java 的设计者们就在 HotSpot 虚拟机中引入了一种被称之为 SuperWord 的自动向量优化算法，该算法缺省会将循环体内的标量计算自动优化为向量计算，以此来提升数据运算时的执行效率。当然，我们可以通过虚拟机参数-XX:-UseSuperWord来显式关闭这项优化（从实际测试结果来看，如果不开启自动向量优化，存在约 20%~22%之间的性能下降）。

尽管 HotSpot 缺省支持自动向量优化，但局限性仍然非常明显:

- 首先，JIT 编译器 Server Compiler(C2)仅仅只会对循环体内的代码块做向量优化，并且这样的优化也是极不可靠的
- 其次，对于一些复杂的向量运算，SuperWord 则显得无能为力

因此，在一些特定场景下（比如：机器学习，线性代数，密码学等），建议大家还是尽可能使用 Java16 为大家提供的 Vector API 来实现复杂的向量计算。如：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/478909005a4d16f3b7f59c67519aa1e7.png)

Vector API 包含在 jdk.incubator.vector 模块中，程序中如果需要使用 Vector API，要在 module-info.java 文件中引入该模块：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/e4bbed8b656725b8609611eabd2dda5b.png)

### [#](#jep-389-外部链接器-api-孵化器) JEP 389：外部链接器 API（孵化器）

该孵化器 API 提供了静态类型、纯 Java 访问原生代码的特性，该 API 将大大简化绑定原生库的原本复杂且容易出错的过程。Java 1.1 就已通过 Java 原生接口（JNI）支持了原生方法调用，但并不好用。Java 开发人员应该能够为特定任务绑定特定的原生库。它还提供了外来函数支持，而无需任何中间的 JNI 粘合代码。

### JEP 393：外部存储器访问 API（第三次孵化）

> 在 Java 14 和 Java 15 中作为孵化器 API 引入的这个 API 使 Java 程序能够安全有效地对各种外部存储器（例如本机存储器、持久性存储器、托管堆存储器等）进行操作。它提供了外部链接器 API 的基础。

在实际的开发过程中，绝大多数的开发人员基本都不会直接与堆外内存打交道，但这并不代表你从未接触过堆外内存，像大家经常使用的诸如：RocketMQ、MapDB 等中间件产品底层实现都是基于堆外存储的，换句话说，我们几乎每天都在间接与堆外内存打交道。那么究竟为什么需要使用到堆外内存呢？简单来说，主要是出于以下 3 个方面的考虑：

- 减少 GC 次数和降低 Stop-the-world 时间；
- 可以扩展和使用更大的内存空间；
- 可以省去物理内存和堆内存之间的数据复制步骤。

在 Java14 之前，如果开发人员想要操作堆外内存，通常的做法就是使用 ByteBuffer 或者 Unsafe，甚至是 JNI 等方式，但无论使用哪一种方式，均**无法同时有效解决安全性和高效性等 2 个问题**，并且，堆外内存的释放也是一个令人头痛的问题。以 DirectByteBuffer 为例，该对象仅仅只是一个引用，其背后还关联着一大段堆外内存，由于 DirectByteBuffer 对象实例仍然是存储在堆空间内，只有当 DirectByteBuffer 对象被 GC 回收时，其背后的堆外内存才会被进一步释放。



在此大家需要注意，程序中通过 ByteBuffer.allocateDirect()方法来申请物理内存资源所耗费的成本远远高于直接在 on-heap 中的操作，而且实际开发过程中还需要考虑数据结构如何设计、序列化/反序列化如何支撑等诸多难题，所以与其使用语法层面的 API 倒不如直接使用 MapDB 等开源产品来得更实惠。

如今，在堆外内存领域，我们似乎又多了一个选择，**从 Java14 开始，Java 的设计者们在语法层面为大家带来了崭新的 Memory Access API，极大程度上简化了开发难度，并得以有效的解决了安全性和高效性等 2 个核心问题**。示例：

```java
// 获取内存访问var句柄
var handle = MemoryHandles.varHandle(char.class,
        ByteOrder.nativeOrder());
// 申请200字节的堆外内存
try (MemorySegment segment = MemorySegment.allocateNative(200)) {
    for (int i = 0; i < 25; i++) {
        handle.set(segment, i << 2, (char) (i + 1 + 64));
        System.out.println(handle.get(segment, i << 2));
    }
}
```

关于堆外内存段的释放，Memory Access API 提供有显式和隐式 2 种方式，开发人员除了可以在程序中通过 MemorySegment 的 close()方法来显式释放所申请的内存资源外，还可以注册 Cleaner 清理器来实现资源的隐式释放，后者会在 GC 确定目标内存段不再可访问时，释放与之关联的堆外内存资源。

### JEP 397：密封类（第二预览）

> **封闭类**可以是封闭类和或者封闭接口，用来增强 Java 编程语言，**防止其他类或接口扩展或实现它们**。这个特性由Java 15的预览版本晋升为正式版本。

参考：

- https://docs.oracle.com/en/java/javase/16/
- https://xie.infoq.cn/article/8304c894c4e38318d38ceb116
- https://www.oracle.com/java/technologies/javase/16all-relnotes.html