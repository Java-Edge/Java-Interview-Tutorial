# 02-JVM虚拟机-下篇
## 垃圾回收

在 JVM 中需要对没有被引用的对象，也就是垃圾对象进行垃圾回收



### 对象存活判断算法

判断对象存活有两种方式：引用计数法、可达性分析算法



**引用计数法**

引用计数法通过记录每个对象被引用的次数，例如对象 A 被引用 1 次，就将 A 的引用计数器加 1，当其他对象对 A 的引用失效了，就将 A 的引用计数器减 1

- 优点：
  - 实现简单，判定效率高
- 缺点：
  - 需要单独的字段存储计数器，增加存储空间开销
  - 每次赋值都要更新计数器，增加时间开销
  - 无法处理循环引用的情况，致命问题！即 A 引用 B，B 引用 A，那么他们两个的引用计数器永远都为 1





**可达性分析算法**

可达性分析算法可以有效解决循环引用的问题，Java 选择了这种算法

可达性分析算法以`根对象集合（GC Roots）`为起使点，按照`从上至下的方式搜索被根对象集合所连接的目标对象是否可达`，通过可达性分析算法分析后，内存中的存活对象都会被根对象集合直接或间接连接着，搜索过程所走过的路径称为`引用链`，如果目标对象没有任何`引用链`相连，则是不可达的，就可以标记为垃圾对象



**GC Roots 主要包含以下几类元素：**

- 虚拟机栈中引用的对象

  如：各个线程被调用的方法中所使用的参数、局部变量等

- 本地方法栈内的本地方法引用的对象

- 方法区中引用类型的静态变量

- 方法区中常量引用的对象

  如：字符串常量池里的引用

- 所有被 `synchronized` 持有的对象

- Java 虚拟机内部的引用

  如：基本数据类型对应的 Class 对象、异常对象（如 NullPointerException、OutOfMemoryError）、系统类加载器



### 垃圾回收过程

在 Java 中对垃圾对象进行回收需要至少经历两次标记过程：

- 第一次标记：如果经过可达性分析后，发现没有任何引用链相连，则会第一次被标记
- 第二次标记：判断第一次标记的对象是否有必要执行 `finalize()` 方法，如果在 `finalize()` 方法中没有重新与引用链建立关联，则会被第二次标记

第二次被标记成功的对象会进行回收；否则，将继续存活



**对象的 finalization 机制：**

Java 提供了 `finalization` 机制来允许开发人员 `自定义对象被销毁之前的处理逻辑`，即在垃圾回收一个对象之前，会先调用这个对象的 `finalize()` 方法，该方法允许在子类中被重写，`用于在对象被回收时进行资源释放的工作`



### 对象引用

在 JDK1.2 之后，Java 对引用的概念进行了扩张，将引用分为强引用（StrongReference）、软引用（SoftReference）、弱引用（WeakReference）、虚引用（PhantomReference）四种，这四种引用强度依次逐渐减弱

- 强引用-不回收：强引用是最普遍的对象引用，也是默认的引用类型，强引用的对象是可触及的，垃圾回收器永远不会回收被引用的对象，因此`强引用是造成Java内存泄漏的主要原因之一`。

  - 当使用new操作创建一个新对象时，并且将其赋值给一个变量时，这个变量就成为该对象的一个`强引用`

- 软引用-内存不足回收：在即将发生内存溢出时，会将这些对象列入回收范围进行第二次回收，如果回收之后仍然没有足够的内存，则会抛出`内存溢出异常`

  - 软引用通常用来实现内存敏感的缓存，例如`高速缓存`使用了软引用，如果内存足够就暂时保留缓存；如果内存不足，就清理缓存

    ```java
    // 创建弱引用
    SoftReference<User> softReference = new SoftReference<>(user);
    // 从软引用中获取强引用对象
    System.out.println(softReference.get());
    ```

- 弱引用-发现即回收：被弱引用关联的对象只能存活在下一次垃圾回收之前，在垃圾回收时，无论空间是否足够，都会会受掉被弱引用关联的对象

  - 弱引用常用于监控对象是否已经被垃圾回收器标记为即将回收的垃圾，可以通过弱引用的 `isEnQueued` 方法判断对象是否被垃圾回收器标记

    ```java
    Object obj = new Object();
    WeakReference<Object> wf = new WeakReference<Object>(obj);
    obj = null;
    // System.gc();
    // 有时候会返回null
    Object o = wf.get(); 
    // 返回是否被垃圾回收器标记为即将回收的垃圾
    boolean enqueued = wf.isEnqueued(); 
    System.out.println("o = " + o);
    System.out.println("enqueued = " + enqueued);
    ```

- 虚引用：垃圾回收时，直接回收，无法通过虚引用获取对象实例

  - 为一个对象设置虚引用关联的唯一目的就是能在这个对象被垃圾回收时收到一个系统通知

    ```java
    Object obj = new Object();
    PhantomReference<Object> pf = new PhantomReference<Object>(obj, new
    ReferenceQueue<>());
    obj=null;
    // 永远返回null
    Object o = pf.get();
    // 返回是否从内存中已经删除
    boolean enqueued = pf.isEnqueued();
    System.out.println("o = " + o);
    System.out.println("enqueued = " + enqueued);
    ```



### 垃圾清除算法

GC最基础的算法有三种： 标记 -清除算法、复制算法、标记-压缩算法，我们常用的垃圾回收器一般都采用分代收集算法。

- `标记-清除算法`：在标记阶段，从 GC Roots 开始遍历，标记所有被引用的对象，标记为可达对象，再对堆内存从头到尾遍历，回收没有标记为可达对象的对象（标记清除算法可以标记存活对象也可以标记待回收对象）

  - 这里并不是真正清除，而是将清除对象的地址放在空闲的地址列表中
  - 缺点
    - 效率不高
    - GC 时需要停止整个应用进程，用户体验不好
    - 会产生内存碎片

  ![1702345215721](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702345215721.png)

- `复制算法`：它将可用内存按容量划分为大小相等的两块，每次只使用其中的一块。当这一块的内存用完了，就将还`存活`着的对象复制到另外一块上面，然后再把已使用过的内存空间一次清理掉

  `现在商用的 Java 虚拟机大多都优先采用这种收集算法去回收新生代`，如果将内存区域划分为容量相同的两部分太占用空间，因此将`复制算法进行了优化`，优化后将新生代分为了 Eden 区、Survivor From 区、Survivor To 区，Eden 和 Survivor 的大小比例为 `8:1:1`，每次分配内存时只使用 Eden 和其中的一块 Survivor 区，在进行垃圾回收时，将 Eden 和已经使用过的 Survivor 区的存活对象转移到另一块 Survivor 区中，再清理 Eden 和已经使用过的 Survivor 区域，当 Survivor 区域的空间不足以容纳一次 Minor GC 之后存活的对象时，就需要依赖老年代进行分配担保（通过分配担保机制，将存活的对象放入老年代即可）

  - 优点
    - 实现简单，运行高效
    - 复制之后，保证空间的连续性，不会出现“内存碎片”
  - 缺点
    - 存在空间浪费
  - 应用场景
    - 在新生代，常规的垃圾回收，一次可以回收大部分内存空间，`剩余存活对象不多`，因此现在的商业虚拟机都是用这种收集算法回收新生代

  ![1702345244609](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702345244609.png)

- `标记-压缩算法`：标记过程仍然与“标记-清除”算法一样，之后将所有的存活对象压到内存的一端，按顺序排放，之后，清理边界外的内存

  - 优点
    - 解决了标记-清除算法出现内存碎片的问题
    - 解决了复制算法中空间浪费的问题
  - 缺点
    - 效率上低于复制算法
    - 移动对象时，如果对象被其他对象引用，则还需要调整引用的地址
    - 移动过程中，需要暂停用户应用程序。即 STW

  ![1702345389289](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702345389289.png)

- `分代收集算法`：把 Java 堆分为新生代和老年代，这样就可以对不同生命周期的对象采取不同的收集方式，以提高回收效率

  当前商业虚拟机都采用这种算法

  - 新生代中的对象生命周期短，存活率低，因此适合使用`复制算法`（存活对象越少，复制算法效率越高）
  - 老年代中对象生命周期长，存活率高，回收没有新生代频繁，一般使用`标记-清除`或者是`标记-压缩`



## 垃圾回收器

有 8 种垃圾回收器，分别用于不同分代的垃圾回收：

- 新生代回收器：Serial、ParNew、Parallel Scavenge
- 老年代回收器：Serial Old、Parallel Old、CMS
- 整堆回收器：G1、ZGC



### Serial：串行回收

- Serial是最基本、最古老的垃圾收集器
- `Serial收集器采用复制算法、单线程执行和 “STW” 机制的方式进行内存回收`
- 除了年轻代之外，Serial 收集器还提供了用于执行老年代垃圾收集的 Serial Old 收集器。`Serial Old 同样采用串行回收和 “STW” 机制，只不过内存回收算法使用的是标记-压缩算法。`


- **`优势`**
  - 简单高效（与其他收集器的单线程相比），在垃圾收集时暂停了用户线程，专心回收内存，因此单线程效率很高
- **`缺点`**
  - 垃圾回收时，有STW时间，不适用于交互性强的应用程序
- **`应用场景`**
  - 可以在Client模式下的虚拟机运行
  - 在用户的桌面应用场景中，可用内存一般不大（几十MB至上百MB），可以在较短时间内完成垃圾收集

![1702281572682](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702281572682.png)

### ParNew：并行回收

- Par指Parallel，New指处理新生代的垃圾收集
- ParNew在新生代采用`并行回收、复制算法、STW机制`回收内存
- ParNew是很多 JVM 运行在 Server 模式下新生代的默认垃圾收集器

ParNew + SerialOld 配合使用，ParNew 回收新生代，并行更高效，老年代回收次数少，使用串行更节省资源

![1702281543251](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702281543251.png) 

### Parallel Scavenge：吞吐量优先

- Parallel Scavenge 收集器采用`复制算法、并行回收和STW机制`进行内存回收
- Paralle 收集器和 ParNew 收集器是否重复呢？
  - 不是。Parallel Scavenge 收集器的目标是达到一个`可控制的吞吐量`，他也被称为吞吐量优先的垃圾收集器
  - `自适应调节策略`也是 Parallel 与 ParNew 一个重要区别
    - 自适应调节策略即 Parallel 收集器自动调整 年轻代的大小、Eden 和 Survivor 的比例、晋升老年代的对象年龄等参数，为了更好的平衡堆大小、吞吐量和停顿时间
- 高吞吐量可以高效地利用 CPU 时间，尽快完成程序的运算任务，主要适合`在后台运算不需要太多交互的任务`

![1702281628171](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702281628171.png)

### Parallel Old：吞吐量优先

- Parallel Scavenge 收集器在 JDK1.6 时提供了用于回收老年代的 Parallel Old 收集器，用来代替老年代的 Serial Old 收集器
- Parallel Old 收集器采用了`标记-压缩算法、并行回收和STW`机制回收老年代内存

![1702281553579](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702281553579.png)

### CMS：低延迟

- 在 JDK1.5 时，HotSpot 推出了 CMS 收集器，CMS 收集器是 HotSpot 虚拟机中第一款真正意义上的`并发收集器`，它第一次实现了让`垃圾收集线程和用户线程同时工作`
- CMS 收集器关注尽可能地降低用户线程的停顿时间，停顿时间越短，用户的体验越好
- CMS 收集器采用`标记-清除算法和STW机制`来回收内存
- CMS 作为老年代的收集器无法与之前的新生代收集器 Parallel Scavenge 配合工作，所以在 JDK1.5 时使用 CMS 收集老年代，新生代只可以选择 ParNew 或者 Serial

![1702281533315](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702281533315.png)

**CMS收集过程**

CMS收集过程较为复杂，分为4个阶段：

- 初始标记：会出现 STW，所有工作线程停止，该阶段主要`标记与GC Roots能直接关联的对象`，由于直接关联的对象很少，所以`速度很快`
- 并发标记：从GC Roots的`直接关联对象开始遍历整个对象图的过程`，这个阶段比较耗时但是不需要暂停用户线程
- 重新标记：在并发标记阶段，由于用户线程和垃圾收集线程同时运行，因此在这个阶段`修正并发标记阶段因为用户线程运行而产生变动的对象的标记`，这个阶段速度虽然比初始标记阶段慢点，但是比并发标记阶段快多了
- 并发清除：`清除标记阶段判断的已经死亡的对象，释放内存空间`

虽然 CMS 是并发收集器，但是仍然存在短暂的 STW 时间

并且在 CMS 回收过程中，需要确保用户线程有足够的内存可以使用，因此在堆内存使用率达到某一阈值，就需要开始内存回收，如果 CMS 运行期间预留的内存不够用户线程使用的话，会临时启动 Serial Old 收集器来回收老年代。

**`优点`**

- 并发收集
- 低延迟

**`缺点`**

- **使用标记-清除算法，会有内存碎片**。在无法分配大对象的情况下，不得不提前触发Full GC
- **CMS收集器对CPU资源非常敏感**。虽然不会导致用户线程停顿，但是会因为占用了一部分线程而导致应用线程变慢，总吞吐量降低
- **CMS收集器无法处理浮动垃圾**。如果在并发标记阶段产生新的垃圾对象，CMS收集器将无法对这些垃圾对象进行标记，只能等下一次执行GC的时候进行回收



**JDK后续版本中CMS的变化**

- JDK9 中，CMS 被标记为 Deprecate，即 CMS 未来将会被废弃
- JDK14 中，删除 CMS 垃圾收集器

### G1：区域化分代式（面试官：聊聊 G1，你清楚 G1 的特性吗？）

![image-20240219104838570](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240219104838570.png)

G1（Garbage-First）垃圾收集器是在 Java7 update4 之后引入的一个新的垃圾收集器，它开创了收集器面向局部收集的设计思路和基于 Region 的内存布局形式

G1 最大的 **特点** 就是 **满足 GC 停顿时间的同时，还具备高吞吐量的性能特征**

- G1的出现就是为了适应`不断扩大的内存和不断增加的处理器数量`，进一步降低暂停时间，同时兼顾良好的吞吐量

- G1是一款面向服务端应用的垃圾收集器，主要针对 `配备多核CPU以及大容量内存的机器` ，兼顾了低GC停顿时间和高吞吐量
- 在 JDK1.7 正式启用，是 JDK 9以后的默认垃圾收集器，取代了 CMS 以及 Parallel+Parallel Old 的组合，被 Oracle 官方称为“全功能的垃圾收集器”



**G1 最显著的特点：**

天生适合于大内存机器！

为什么这么说，就是因为 G1 是可以控制 GC 停顿时间的，那么比如说对于 Kafka 类似的高并发消息中间件，一般来说都需要大内存机器部署，比如 64G，那么可以给年轻代 30G 内存来存放对象

但是由于内存太大，达到 30G，那么它的 GC 肯定不会几十毫秒就结束了，可能要几秒钟才可以 GC 完成，那几秒钟的卡顿时间对用户感知还是比较明显的，而且 Kafka 作为高并发的消息中间件，可能没多长时间，几分钟就会将内存占满，导致频繁 GC

那么使用了 G1 之后，我们可以 `设置期望的 GC 停顿时间` ，比如设置为 50ms`（-XX:MaxGCPauseMillis=50）`，那么这对于用户来说就几乎没有感知

**因此说，G1 天生适合于大内存机器！**



**G1 中区域的划分**

![G1region-huafen](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240217223505467.png)

G1 是将 JVM 堆内存划分为了多个 `Region`，也就是多个相同大小的区域，默认 Region 的大小是堆内存的 1/2048，因此如果设置堆内存大小为 4096MB，那么每个 Region 的大小为 2M

在 G1 中年轻代和老年代都是一多个 Region 的集合，并且 Region 的区域会动态变化，也就是一个 Region 本来是年轻代，GC 之后，可能会变为老年代



**G1 中对大对象的优化**

在G1中，有一种特殊的区域叫 `Humongous` 区域

- 如果一个对象占用的空间超过了分区容量 50% 以上，G1 收集器就认为这是一个巨型对象。 这些巨型对象，默认直接会被分配在老年代
- 但是，如果是一个短期存在的巨型对象，在分区之间来回拷贝，就会对垃圾收集器造成负面影响。为了解决这个问题，G1 划分了 Humongous 区，它用来专门存放巨型对象。如果一个 H 区装不下一个巨型对象，那么 G1 会寻找连续的 H 分区来存储，从而避免大对象进入老年代占用大量空间，导致 full gc 带来的性能开销！





**G1 的 GC 过程**

1. 初始标记：标记一下 GC Roots 能直接关联到的对象，需要停顿用户线程，但耗时很短
2. 并发标记：是从 GC Roots 开始对堆中对象进行可达性分析，找出存活的对象，这阶段耗时较长，但可与用户程序并发执行


3. 最终标记：修正在并发标记期间因用户程序继续运作而导致标记产生变动的那一部分标记记录
4. 筛选回收：对各个 Region 的回收价值和成本进行排序，根据用户所期望的 GC 停顿时间来制定回收计划

G1 的回收算法主要使用 `复制算法`，将存活对象从一个 Region 复制到另一个 Region，再清空原 Region

并且 G1 会维护一个 `优先列表`，会在允许的停顿时间之内，尽可能回收价值更大的 Region，尽可能提升回收效率！



![1702282372857](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702282372857.png)

**为什么叫做 Garbage First 呢？**

- Garbage First 也就是垃圾优先，G1 是一个并行回收器，将堆内存分割为多个不相关区域，称为 Region，使用不同的 Region 来表示 Eden、Survivor0、Survivor1、老年代等
- G1有计划地避免在整个 Java 堆中进行全区域的垃圾收集，G1跟踪各个Region的垃圾堆积的价值大小，在后台维护一个优先级列表，每次根据允许的收集时间，优先回收价值最大的Region，G1侧重于回收垃圾最大量的区间，因此称之为Garbage-First 垃圾优先



**G1 应用场景**

- 服务端应用，针对具有大内存、多核处理器的机器
- 最主要的应用是需要低 GC 延迟、并且具有大堆的应用程序
- HotSpot 除了 G1，其他的垃圾收集器使用内置的 JVM 线程执行 GC 的多线程操作，而 G1 采用应用线程承担后台运行的 GC 工作，即当 JVM 的 GC 线程处理速度慢时，系统会调用应用程序线程帮助加速垃圾回收过程



**G1 相关参数：**

```bash
# 使用 G1 垃圾收集器
-XX:+UseG1GC
# 设置期望达到的最大GC停顿时间指标（JVM会尽力实现，但不保证达到），默认值是 200 毫秒。
-XX:MaxGCPauseMillis=
# 设置的 G1 区域的大小。值是 2 的幂，范围是 1 MB 到 32 MB 之间。
# 目标是根据最小的 Java 堆大小划分出约 2048 个区域。
# 默认是堆内存的 1/2000。
-XX:G1HeapRegionSize=n
# 设置并行垃圾回收线程数，一般将n的值设置为逻辑处理器的数量，建议最多为8。
-XX:ParallelGCThreads=n
# 设置并行标记的线程数。将n设置为ParallelGCThreads的1/4左右。
-XX:ConcGCThreads=n
# 设置触发标记周期的 Java 堆占用率阈值。默认占用率是整个 Java 堆的 45%。
-XX:InitiatingHeapOccupancyPercent=n
```





**`优势`**

- `并行与并发`
  - 并行：G1 在回收期间，可以有多个 GC 线程同时工作，此时用户线程 STW
  - 并发：G1 部分工作可以和应用程序同时执行
- `分代收集`
  - G1 将堆空间分为若干个区域 Region，这些区域包含了逻辑上的新生代和老年代
  - 之前的垃圾收集器要么工作在新生代，要么工作在老年代，而 G1 同时`兼顾了新生代和老年代`
- `空间整合`
  - G1 将堆内存划分为若干 Region，内存回收以 Region 为单位，Region 之间是`复制算法`，整体上可以看作是`标记-压缩算法`，两种算法都可以避免出现内存碎片
- `可预测的停顿时间模型`
  - G1 除了追求低停顿外，还能建立可预测的停顿时间模型，能让使用者明确指定在一个长度为M毫秒的时间片段内，消耗在垃圾收集上的时间不超过N毫秒





### ZGC：低延迟

在 JDK11 中引入的一种可扩展的低延迟垃圾收集器，在 JDK15 中发布稳定版

ZGC 的`目标`是在尽可能对吞吐量影响不大的前提下，实现在任意堆内存大小都可以把垃圾收集的停顿时间限制在 10 ms 以内（在 JDK16 之前是 10 ms，在 JDK16 之后目标是 1 ms 的低延迟）的低延迟

ZGC 收集器也是基于 Region 内存布局，使用了`读屏障`、`染色指针`和`内存多重映射`等技术来实现`可并发的标记-整理算法`的，以低延迟为首要目标的一款垃圾收集器。ZGC 的核心是一个`并发垃圾`收集器，这意味着所有繁重的工作都在 Java 线程继续执行的同时完成。这极大地限制了垃圾收集对应用程序响应时间的影响



**ZGC 的关键技术**

ZGC 通过 `染色指针`  和 `读屏障` 技术解决了对象转移过程中准确访问对象的问题，实现了垃圾回收过程中对象的并发转移

具体细节这里先略过，可以参考美团技术团队的文章[新一代垃圾回收器ZGC的探索与实践](https://tech.meituan.com/2020/08/06/new-zgc-practice-in-meituan.html)





## JVM 相关工具

### JDK 工具包



#### jps

查看 Java 进程

```bash
jps ：列出Java程序进程ID和Main函数名称
jps -q ：只输出进程ID
jps -m ：输出传递给Java进程（主函数）的参数
jps -l ：输出主函数的完整路径
jps -v ：显示传递给Java虚拟机的参数
```



#### jstat

查看 Java 程序运行时相关信息，可以查看运行时堆的相关情况

```bash
jstat -<options> [-t] [-h<lines>] <vmid> [<interval> [<count>]]

options：由以下值构成
-class：显示ClassLoader的相关信息
-compiler：显示JIT编译的相关信息
-gc：显示与GC相关信息
-gccapacity：显示各个代的容量和使用情况
-gccause：显示垃圾收集相关信息（同-gcutil），同时显示最后一次或当前正在发生的垃圾收集的诱发原因
-gcnew：显示新生代信息
-gcnewcapacity：显示新生代大小和使用情况
-gcold：显示老年代信息
-gcoldcapacity：显示老年代大小
-gcpermcapacity：显示永久代大小
-gcutil：显示垃圾收集信息
```



示例1：

```bash
# 进程 ID 515460 ，采样间隔 250 ms，采样数 4
jstat -gc 515460 250 4
```

![1702298891799](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702298891799.png)

- S0C：年轻代中第一个survivor（幸存区）的容量 （单位kb）
- S1C：年轻代中第二个survivor（幸存区）的容量 (单位kb)
- S0U ：年轻代中第一个survivor（幸存区）目前已使用空间 (单位kb)
- S1U ：年轻代中第二个survivor（幸存区）目前已使用空间 (单位kb)
- EC ：年轻代中Eden的容量 (单位kb)
- EU ：年轻代中Eden目前已使用空间 (单位kb)
- OC ：Old代的容量 (单位kb)
- OU ：Old代目前已使用空间 (单位kb)
- MC：metaspace的容量 (单位kb)
- MU：metaspace目前已使用空间 (单位kb)
- CCSC：压缩类空间大小
- CCSU：压缩类空间使用大小
- YGC ：从应用程序启动到采样时年轻代中gc次数
- YGCT ：从应用程序启动到采样时年轻代中gc所用时间(s)
- FGC ：从应用程序启动到采样时old代(全gc)gc次数
- FGCT ：从应用程序启动到采样时old代(全gc)gc所用时间(s)
- GCT：从应用程序启动到采样时gc用的总时间(s)



示例2：

```bash
jstat -gcutil 515256 1s 5
# 进程ID 30108，采样间隔1s，采样数5
```

![1702298956640](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702298956640.png)

- S0 年轻代中第一个survivor（幸存区）已使用的占当前容量百分比
- S1 年轻代中第二个survivor（幸存区）已使用的占当前容量百分比
- E 年轻代中Eden（伊甸园）已使用的占当前容量百分比
- O old代已使用的占当前容量百分比
- M metaspace已使用的占当前容量百分比
- CCS 压缩使用比例
- YGC 从应用程序启动到采样时年轻代中gc次数
- YGCT 从应用程序启动到采样时年轻代中gc所用时间(s)
- FGC 从应用程序启动到采样时old代(全gc)gc次数
- FGCT 从应用程序启动到采样时old代(全gc)gc所用时间(s)
- GCT 从应用程序启动到采样时gc用的总时间(s)





#### jinfo

查看正在运行的 Java 程序的扩展参数

```bash
jinfo [option] <pid>

option 参数：
# 打印虚拟机 VM 参数
-flags 
# 打印指定虚拟机 VM 参数
-flag <name> 
# 打开或关闭虚拟机参数
-flag [+|-]<name> 
# 设置指定虚拟机参数的值
-flag <name>=<value> 
```



#### jmap

查看堆内存使用情况，一般结合 jhat 使用

```bash
# 显示 Java 堆的详细信息
jmap -heap pid
# 显示堆中对象的统计信息
jmap -histo:live pid
# 打印类加载器信息
jmap -clstats pid
# 打印等待终结的对象信息
jmap -finalizerinfo pid
# 生成堆转储快照 dump 文件，如果堆内存较大，该命令比较耗时，并且该命令执行过程中会暂停应用，线上系统慎用
jmap -dump:format=b,file=heapdump.hprof pid
```



#### jhat

jhat 命令会解析 Java 堆转储文件，并且启动一个 web server，再用浏览器就可以查看 dump 出来的 heap 二进制文件

使用 `jmap -dump` 可以在 jvm  运行时获取 dump

再通过 `jhat ./heapdump.hprof` 命令，就可以启动一个 web server，用浏览器访问即可



#### jstack

用于生成 Java 虚拟机当前时刻的线程快照，生成线程快照的主要目的是定位线程出现长时间停顿的原因

生成的线程快照中，需要主要留意以下几种状态：

- 死锁，Deadlock
- 等待资源，Waiting  on  condition
- 等待获取管程，Waiting on monitor entry
- 阻塞，Blokced

```bash
# 查看当前时间点，指定进程的dump堆栈信息
jstack [ option ] pid 
# 将当前时间点的指定进程的dump堆栈信息，写入到指定文件中
jstack [ option ] pid > 文件 
# 注:若该文件不存在，则会自动生成; 若该文件存在，则会覆盖源文件
# 查看当前时间点，core文件的dump堆栈信息
jstack [ option ] executable core 
# 查看当前时间点，远程机器的dump堆栈信息
jstack [ option ] [server_id@]<remote server IP or hostname> 

# options 说明
-F # 当进程挂起了，此时'jstack [-l] pid'是没有相应的，这时候可使用此参数来强制打印堆栈信息,强制jstack），一般情况不需要使用。
-m # 打印 java 和 native c/c++ 框架的所有栈信息。可以打印 JVM 的堆栈，以及Native的栈帧，一般应用排查不需要使用。
-l # 长列表. 打印关于锁的附加信息。例如属于java.util.concurrent的ownable synchronizers列表，会使得JVM停顿得长久得多（可能会差很多倍，比如普通的jstack可能几毫秒和一次GC没区别，加了-l 就是近一秒的时间），-l 建议不要用。一般情况不需要使用。
-h or -hel # 打印帮助信息

# 使用示例：统计线程数
jstack -l 513792 | grep 'java.lang.Thread.State' | wc -l
```



### JVM 调试工具

JVM 常用调试工具有：visualvm 以及 Arthas

## JVM 调优

首先，为什么要 JVM 调优呢？

JVM 调优的目的就是为了让应用程序使用最小的硬件消耗来承载更大的吞吐量

![1702522657503](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702522657503.png)

**什么情况下需要 JVM 调优呢？**

1. 系统吞吐量下降，或系统延迟较高
2. 出现 OOM
3. Full GC 频繁
4. GC 停顿时间过长（超过 1s，已经影响用户体验）





**调优主要调什么？**

JVM 调优主要是两方面：`内存分配`和`垃圾回收`，大多数情况下是不需要进行 JVM 调优的，JVM 调优是不得已的手段，如果要对系统进行优化，则优先对系统架构和代码进行优化！

1. 合理的设置堆内存
2. GC 高效回收占用内存的垃圾对象


![1702522680294](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702522680294.png)


**JVM 调优步骤：**

1. 分析 GC 日志
2. 判断系统 GC 频率、GC 耗时
3. 调整参数



### GC 日志分析

JVM 中常用参数设置：

```bash
-Xms 堆内存最小值
-Xmx 堆内存最大值
-Xmn 新生代内存的最大值
-Xss 每个线程的栈内存
```



首先通过设置 VM Options 来打开 GC 日志的打印，开启 GC 日志参数设置如下：

```bash
 # 开启 GC 日志创建更详细的 GC 日志
 -XX:+PrintGCDetails 
 # 开启 GC 时间提示
-XX:+PrintGCTimeStamps，-XX:+PrintGCDateStamps
# 打印堆的GC日志
-XX:+PrintHeapAtGC 
# 指定GC日志路径
-Xloggc:./logs/gc.log
```



#### Young GC 日志

```bash
2023-06-18T14:31:11.340+0800: 2.340: [GC (Allocation Failure) [PSYoungGen: 896512K->41519K(1045504K)]
896512K-41543K(3435008K), 0.0931965 secs] [Times: user=0.14 sys=0.02, real=0.10 secs]

# GC 日志参数解释
2023-06-18T14:31:11.340+0800 # GC 开始的时间，+0800 代表中国所在的东区
2.340 # GC 事件开始时间相对于 JVM 开始启动的间隔秒数
GC # 区分 Young GC 和 Full GC 的标志，GC 代表 Young GC
(Allocation Failure) # 触发 GC 原因
PSYoungGen # 垃圾回收器的名称
896512K->41519K # 垃圾收集前后新生代的内存使用量由 896512K 变为 41519K
(1045504K) # 新生代内存总大小
896512K-41543K # 垃圾收集前后，整个堆内存使用量由 896512K 变为 41543K
(3435008K) # 堆空间的总大小
0.0931965 secs # GC 持续时间
user=0.14 # GC 线程消耗 CPU 时间为 0.14
sys=0.02 # GC 过程中操作系统调用和系统等待事件所消耗的事件为 0.02
real=0.10 secs # 应用程序暂停的事件为 0.10
```





#### Full GC 日志

```bash
2021-05-19T14:46:07.367+0800: 1.562: [Full GC (Metadata GC Threshold)[PSYoungGen: 18640K-
>0K(1835008K)] [ParOldGen: 16K->18327K(1538048K)] 18656K->18327K(3373056K), [Metaspace: 20401K-
>20398K(1069056K)], 0.0624559 secs] [Times: user=0.19 sys=0.00, real=0.06 secs]

2021-05-19T14:46:07.367+0800 # GC 开始的时间，+0800 代表中国所在的东区
1.562 # GC 事件开始时间相对于 JVM 开始启动的间隔秒数
Full GC # 区分 Young GC 和 Full GC 的标志
(Metadata GC Threshold) # 触发 GC 原因
PSYoungGen # 垃圾回收器的名称
18640K->0K(1835008K) # 垃圾收集前后新生代的内存使用量由 18640K 变为 0K，新生代内存总大小为 1835008K
ParOldGen # 老年代垃圾收集器名称
16K->18327K(1538048K) # 垃圾收集前后老年代的内存使用量由 16K 变为 18327K，老年代内存总大小为 1538048K
18656K->18327K # 垃圾收集前后，整个堆内存使用量由 896512K 变为 41543K
(3373056K) # 堆总空间大小 
Metaspace # 元空间区域垃圾收集器是 Metaspace
20401K->20398K(1069056K) # 垃圾收集前后元空间的内存使用量由 20401K 变为 20398K，元空间总大小为 1069056K
0.0624559 secs # GC 持续时间
user=0.19 # GC 线程消耗 CPU 时间为 0.19
sys=0.00 # GC 过程中操作系统调用和系统等待事件所消耗的事件为 0.00
real=0.06 secs # 应用程序暂停的事件为 0.06
```



### 通过 gceasy工具对生成的 GC 日志进行分析

> 这里使用的 JDK 版本为 JDK8！ 

在分析 GC 日志时，可以同时采用多种工具`（Arthas、gceasy、JVM 连接 Graphana 监控）`进行分析，避免某种工具分析不准确

gceasy 每个月只可以免费分析 5 个 gc 日志，因此要节约机会！hhh！

**我们先将 gc.log 文件放入 gceasy 中进行分析，分析结果如下：**

首先是 JVM 内存大小，可以看到新生代分配了 624 mb，而 Peak 也就是峰值也达到了 624 mb，说明新生代很容易就被占满了，而对于元空间 Meta Space 来说，分配了 1 个 gb，而峰值才使用了 59 mb，因此元空间分配的大小也不合理，对于 JDK8 来说，如果不指定元空间的大小，默认元空间的最大值是系统内存的大小，在 64 位操作系统中，元空间默认初始值为 21MB，如果初始未给定的元空间的大小，导致初始元空间过小，会 `频繁触发 Full GC` 来调高元空间大小

![1702354463085](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702354463085.png)



接下来看一些关键的性能指标，可以看到 Avg Pause GC Time 也就是平均 GC 时间为 10 ms，最大 GC 时间为 190 ms，这些参数目前看来也正常，没有出现过长的 GC 时间

![1702354780555](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702354780555.png)



接下来看一下 GC 持续时间的一些情况，可以看到在系统刚开始就发生了几次 Full GC，这是很严重的问题，可以看到这三次 Full GC 产生的原因分别是：`Metadata GC Threashold` 和 `Ergonomics`，即元空间超过阈值，`Ergonomics` 的含义是自动调节 GC 暂停时间和吞吐量从而产生的 GC，是虚拟机中对性能的优化，那么因为 `Ergonomics` 产生的 GC 我们可以不管，总结一下这几次 Full GC 产生的原因就是 `元空间超过阈值！`

![1702355101117](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702355101117.png)



最后我们可以看一下 GC 的指标，可以看到 Full GC 总共发生了 6 次，还是比较多的，需要控制一下 Full GC 的次数，因为 Full GC 对系统性能影响是比较大的

![1702355831346](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702355831346.png)



上边我们已经通过 gceasy 分析了 gc 日志了，存在的问题主要有以下几点：

- Meta Space 空间分配不合理
- Full GC 产生次数过多

#### 堆和元空间优化

那么优化参数我们从 `堆空间`、`元空间`、`新生代` 3 个方面进行入手，参数调整如下：

```bash
-Xms1096m -Xmx1096m -Xmn408m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=128m
```

- 堆空间通过 `-Xms -Xmx` 来进行调整，为了尽量避免 Full GC，堆空间可以设置为 `Full GC 后老年代空间占用的 3-4 倍` ，这样的话一般可以避免老年代空间不足从而导致 Full GC 的情况，最好设置为 8 的整数倍，我们通过上边 easygc 分析中的 JVM Memory Size 得知，老年代的峰值为 274mb，因此这里设置`堆空间`大小为 274 * 4 = 1096 mb，设置堆空间为 Full GC 后老年代对象的 4 倍大小
- 元空间通过 `-XX:MetaspaceSize=N` 来设置，这里设置元空间大小为 128 mb
- 新生代通过 `-Xmn` 来设置，新生代可以设置为 `Full GC 后老年代空间占用的 1-1.5 倍` ，即 274 * 1.5 = 411 mb，最好设置为 8 的整数倍，因此改为 408 mb



可以看到优化后，JVM 内存的使用更加合理了，新生代也没有超过分配的内存大小，如下图：

![1702358050297](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702358050297.png)

并且 Full GC 的次数为 0

![1702358074010](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702358074010.png)



这里需要注意的是，如果使用 Docker 部署的 java 应用，可以在 Dockerfile 中设置 JVM 的参数，并且在启动的时候，尽量去将 JVM 参数打印出来，`确保设置的参数生效！`





#### 线程堆栈优化

上边对 JVM 中的堆和方法区的大小进行了优化，接下来看一下如何对 JVM 中的线程堆栈进行优化

JDK5.0 后每个线程堆栈大小为 1M，在相同物理内存下，线程堆栈越小，就能生成更多的线程，但是操作系统对一个进程内的线程数量还是有限制的，如果堆栈不是很深可以设置 256k，如果是很大的应用可以使用 512k

对于平常的系统来说，是不需要进行线程堆栈的优化的，但是如果开发一些中间件的话，需要创建出很多的线程，那么对于线程堆栈的优化还是比较有必要的，线程堆栈大小设置通过 `-Xss` 进行设置

```bash
-Xms1096m -Xmx1096m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=128m -Xss512k
```



#### 垃圾回收器组合优化

- 吞吐量优先：Parallel Scavenge + ParallelOldGC 
- 响应时间优先（低延迟）：ParNew + CMS



#### G1 垃圾回收器配置

G1 兼顾了吞吐量和响应时间，尤其在大内存的情况下比较好，配置 G1 只需要 3 步：

1. 开启 G1 垃圾收集器
2. 设置堆内存
3. 设置最大的停顿时间

```bash
# 设置堆、元空间大小
-Xms256m -Xmx256m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=128m -Xss512k
# 开启 G1
-XX:+UseG1GC -XX:MaxGCPauseMillis=100
# 开启 GC 日志创建更详细的 GC 日志
-XX:+PrintGCDetails -XX:+PrintGCTimeStamps，-XX:+PrintGCDateStamps -XX:+PrintHeapAtGC -Xloggc:./logs/gc.log
```



### 调优实战-内存溢出的定位与分析

首先，对于以下代码如果造成内存溢出该如何进行定位呢？通过 `jmap` 与 `MAT` 工具进行定位分析

代码如下：

```java
public class TestJvmOutOfMemory {
    public static void main(String[] args) {
        List<Object> list = new ArrayList<>();
        for (int i = 0; i < 10000000; i++) {
            StringBuilder str = new StringBuilder();
            for (int j = 0; j < 1000; j++) {
                str.append(UUID.randomUUID().toString());
            }
            list.add(str.toString());
        }
        System.out.println("ok");
    }
}
```



设置虚拟机参数如下：

```bash
-Xms8m -Xmx8m -XX:+HeapDumpOnOutOfMemoryError
```



再执行上边代码，发现执行之后，发生了内存溢出，并且在当前项目的目录下产生了 `java_pid520944.hprof` 文件

#### 使用 MAT 工具分析

在 https://eclipse.dev/mat/downloads.php 中下载 MAT 工具，MAT 工具就是用于分析 Java 堆内存的，可以查看内存泄漏以及内存使用情况

![1702387120888](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702387120888.png)

下载解压之后，点击 exe 文件启动 MAT 工具，将生成的 `hprof` 文件拖入即可，那么通过 MAT 工具可以看到，81% 的内存都被 Object[] 数组占用，**从而导致了内存溢出**

![1706075428868](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706075428868.png)



### 调优实战-高并发场景调优

首先，这里先假设一下业务场景，系统主要与用户交互，并且主要是提供 API 服务，因此对于系统延时比较敏感，存在的问题为，发现该系统在高峰期延时过高，通过监控平台发现以下问题：

- Young GC 比较频繁，每 10 分钟有 50-60 次，峰值达到 400 次
- Full GC 比较频繁，每 1 个小时平均一次，峰值为 10 分钟 5 次



那么首先排除代码层面的问题，之后再来看 JVM 参数配置所存在的问题，项目使用 JDK8，调优前 JVM 参数如下：

```bash
# 设置了堆大小为 4G，新生代大小为 1G
-Xms4096M -Xmx4096M -Xmn1024M
# 设置了永久代大小为 512M，但是并不会生效，因为 JDK8 中使用元空间来实现方法区，永久代已经不使用了，因此下边这两个参数没有起作用
-XX:PermSize=512M
-XX:MaxPermSize=512M
```



#### 存在问题

问题1：未设置垃圾回收器

从配置的 JVM 参数中可以看到，并未指定使用的垃圾回收器，在 JDK8 中默认使用的垃圾回收器为：（可以在命令行通过 `java -XX:+PrintCommandLineFlags -version` 来查看 JDK 默认的一些配置信息）  

- 年轻代使用 Parallel Scavenge
- 老年代使用 Parallel Old

这个组合的垃圾回收器是以 `吞吐量优先` 的，适合于后台任务型服务器，但是当前服务是与用户进行交互的，因此需要使用 `低延迟优先` 的垃圾回收器



问题2：年轻代分配不合理

当前系统主要是向外提供 API，那么系统中大多数对象的生命周期都是比较短的，通过 Young GC 都可以进行回收，但是目前的 JVM 配置给堆空间分配了 4G，新生代只有 1G，而新生代又分为 Eden 和 Survivor 区，因此新生代有效大小为 Eden + 一个 Survivor 区，也就是 0.9 G

那么在服务高负载的情况下，新生代中的 Eden + Survivor 区会迅速被占满，进而导致频繁 Young GC，还会引起本应该被 Young GC 回收的垃圾提前晋升到老年代中，导致 Full GC 的频率增加，老年代使用的 Parallel Old 无法与用户线程并发执行进行垃圾回收，因此 STW 时间比较长



问题3：未设置元空间大小

调优前设置了永久代大小，但是 JDK8 中已经废弃了永久代，因此设置永久代大小无效

对于 JDK8 来说，如果不指定元空间的大小，在 64 位操作系统中，默认元空间初始值为 21MB，默认元空间的最大值是系统内存的大小，初始未给定的元空间的大小，因此元空间初始为 21MB，导致 `频繁触发 Full GC` 来扩张元空间大小



#### 优化方案

首先，针对垃圾回收器，常用的组合如下：

- Parallel Scavenge + Parallel Old：吞吐量优先，适合后台任务型服务
- ParNew + CMS：低延迟优先，适合对延迟时间比较敏感的服务
- G1：JDK9 默认垃圾回收器，兼顾了高吞吐量和低延迟
- ZGC：JDK11 中退出的低延迟垃圾回收器，无论堆空间多大，都可以保证低延迟

因此，对于目前的系统选择 ParNew + CMS 的组合

而元空间大小的设置，可以通过监控查看元空间峰值为多少，也可以通过命令 `jstat -gc [进程id]` 查看元空间占用在 150MB 左右，因此可以将元空间大小设置为 256MB

对于年轻代的设置，我们可以考虑在堆空间大小不变的情况下，将新生代空间扩展为 0.5 ~ 1 倍，可以分别扩展 0.5 倍、1 倍，再对扩展后的应用进行压测分析，来选择表现性能更好的方案，这里我们就将年轻代扩展 0.5 倍



**优化后的参数设置如下：**

```bash
# 新生代扩展 0.5 倍
-Xms4096M -Xmx4096M -Xmn1536M
# 初始元空间大小设置为 256M
-XX:MetaspaceSize=256M
-XX:MaxMetaspaceSize=256M
# 使用 ParNew + CMS 垃圾回收器
-XX:+UseParNewGC
-XX:+UseConcMarkSweepGC
# CMS 在重新标记阶段，会暂停用户线程，重新扫描堆中的对象，进行可达性分析，标记活着的对象，因为并发阶段 GC 线程和用户线程是并发执行的，可能有些对象的状态会因为用户线程的执行而变化，因此在重新标记节点需要进行标记修正，重新标记阶段会以新生代中的对象作为 GC Roots 的一部分，通过开启下边这个参数会在重新标记之前先执行一次 YoungGC 可以回收掉大部分的新生代对象，从而减少扫描 GC Roots 的开销
-XX:+CMSScavengeBeforeRemark
```



#### 优化方案发布

通过灰度发布，选择部分实例上线，当线上实例指标符合预期之后，再进行全量升级





## JVM 线上问题实战

### CPU 占用率 100% 该怎么解决

这属于是生产环境中的问题了，主要考察有没有 linux 中排查问题的经验，以及对 linux 排查问题的命令是否熟悉

1、首先查看 cpu 使用率

显示 cpu 使用率，执行完该命令后，输入 P，按照 cpu 使用率排序

使用 `top -c` 命令，找到占用 cpu 最多的进程 id（找 java 项目的）

2、查看占用 cpu 最多的进程中每个线程的资源消耗

通过 `top -Hp <进程id>` 命令，显示这个进程中所有【线程】的详细信息，包括每个线程的 CPU 使用率、内存使用情况、线程状态

找到 cpu 使用率最高的那个 java 进程，记下进程 id

3、将占用 cpu 最高的线程的线程 id 转成 16 进制

通过 `printf "%x\n" <线程id>` 命令输出这个线程 id 的 16 进制

4、定位哪段代码导致的 cpu 使用率过高：jstack 43987 | grep '0x41e8' -C5--color'

通过命令 `jstack <进程id> | grep '<16进制线程id>' -C5--color` 定位到占用 cpu 过高的代码

jstack 生成该进程的堆栈信息，通过线程的 16 进制线程 id 过滤出指定线程的信息

-C5 表示显示匹配行的 5 行上下文

--color：高亮显示，方便阅读







### JVM 堆内存缓慢增长如何定位哪行代码出问题？

这里说一下如何通过 Java VisualVM 工具来定位 JVM 堆内存缓慢增长的问题

堆内存缓慢增长，可能是内存泄漏，也可能是 GC 效率低等原因

下边这段为演示代码：

```java
public static void main(String[] args) throws InterruptedException {
List<Object> strs = new ArrayList<>();
    while (true) {
        strs.add(new DatasetController());
        Thread.sleep(10);
    }
}
```

可以通过命令 `jvisualvm` 来启动 Java VisualVM，隔一段时间生成一份堆 dump 文件，也就是堆转储文件

![1706879981564](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706879981564.png)



通过不同时间点的堆转储文件之间的 **对比** 来分析是因为哪些对象增长的比较多

![1706880079478](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706880079478.png)



下边这张图就是两个堆转储文件之间的对比图，可以发现 DatasetController 这个实例对象相比于上个堆转储文件增长了 2 w 多个数量，那么就可以去分析一下哪里的代码创建了这个对象，就可以定位到问题代码

![1706880239601](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706880239601.png)







