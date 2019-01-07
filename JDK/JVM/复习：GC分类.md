
## 复习：GC分类

针对 HotSpot VM 的实现，它里面的 GC 按照回收区域又分为两大种类型：一种是部分收集（Partial GC），一种是整堆收集（Full GC）

- 部分收集（Partial GC）：不是完整收集整个 Java 堆的垃圾收集。其中又分为：

  - 新生代收集（Minor GC / Young GC）：只是新生代（Eden / S0, S1）的垃圾收集
  - 老年代收集（Major GC / Old GC）：只是老年代的垃圾收集。目前，只有 CMS GC 会有单独收集老年代的行为。<mark>注意，很多时候 Major GC 会和 Full GC 混淆使用，需要具体分辨是老年代回收还是整堆回收。</mark>
- 混合收集（Mixed GC）：收集整个新生代以及部分老年代的垃圾收集。目前，只有 G1 GC 会有这种行为
- 整堆收集（Full GC）：收集整个 java 堆和方法区的垃圾收集。

1. 新生代收集：只有当Eden区满的时候就会进行新生代收集，所以新生代收集和S0区域和S1区域情况无关

2. 老年代收集和新生代收集的关系：进行老年代收集之前会先进行一次年轻代的垃圾收集，原因如下：一个比较大的对象无法放入新生代，那它自然会往老年代去放，如果老年代也放不下，那会先进行一次新生代的垃圾收集，之后尝试往新生代放，如果还是放不下，才会进行老年代的垃圾收集，之后在往老年代去放，这是一个过程，我来说明一下为什么需要往老年代放，但是放不下，而进行新生代垃圾收集的原因，这是因为新生代垃圾收集比老年代垃圾收集更加简单，这样做可以节省性能

3. 进行垃圾收集的时候，堆包含新生代、老年代、元空间/永久代：可以看出Heap后面包含着新生代、老年代、元空间，但是我们设置堆空间大小的时候设置的只是新生代、老年代而已，元空间是分开设置的

4. 哪些情况会触发Full GC：
- 老年代空间不足
- 方法区空间不足
- 显示调用System.gc()
- Minior GC进入老年代的数据的平均大小 大于 老年代的可用内存
- 大对象直接进入老年代，而老年代的可用空间不足



## 不同GC分类的GC细节

用例代码:

```Java
/**
 *  -XX:+PrintCommandLineFlags
 *
 *  -XX:+UseSerialGC:表明新生代使用Serial GC ，同时老年代使用Serial Old GC
 *
 *  -XX:+UseParNewGC：标明新生代使用ParNew GC
 *
 *  -XX:+UseParallelGC:表明新生代使用Parallel GC
 *  -XX:+UseParallelOldGC : 表明老年代使用 Parallel Old GC
 *  说明：二者可以相互激活
 *
 *  -XX:+UseConcMarkSweepGC：表明老年代使用CMS GC。同时，年轻代会触发对ParNew 的使用
 * @author shkstart
 * @create 17:19
 */
public class GCUseTest {
    public static void main(String[] args) {
        ArrayList<byte[]> list = new ArrayList<>();

        while(true){
            byte[] arr = new byte[1024 * 10];//10kb
            list.add(arr);
//            try {
//                Thread.sleep(5);
//            } catch (InterruptedException e) {
//                e.printStackTrace();
//            }
        }
    }
} 
```

### 老年代使用CMS GC

**GC设置方法**：参数中使用-XX:+UseConcMarkSweepGC，说明老年代使用CMS GC，同时年轻代也会触发对ParNew的使用，因此添加该参数之后，新生代使用ParNew GC，而老年代使用CMS GC，整体是并发垃圾收集，主打低延迟

![image-20220419202643](http://pan.icebule.top/%E6%9C%89%E9%81%93%E4%BA%91%E7%AC%94%E8%AE%B0%E5%9B%BE%E5%BA%8A/%E4%B8%AA%E4%BA%BA%E7%AC%94%E8%AE%B0/JAVA/JVM/20220419202551.png)

打印出来的GC细节：

![image-20220419211943](http://pan.icebule.top/%E6%9C%89%E9%81%93%E4%BA%91%E7%AC%94%E8%AE%B0%E5%9B%BE%E5%BA%8A/%E4%B8%AA%E4%BA%BA%E7%AC%94%E8%AE%B0/JAVA/JVM/20220419211943.png)



### 新生代使用Serial GC

 **GC设置方法**：参数中使用-XX:+UseSerialGC，说明新生代使用Serial GC，同时老年代也会触发对Serial Old GC的使用，因此添加该参数之后，新生代使用Serial GC，而老年代使用Serial Old GC，整体是串行垃圾收集

![image-20220419212907](http://pan.icebule.top/%E6%9C%89%E9%81%93%E4%BA%91%E7%AC%94%E8%AE%B0%E5%9B%BE%E5%BA%8A/%E4%B8%AA%E4%BA%BA%E7%AC%94%E8%AE%B0/JAVA/JVM/20220419212907.png)

 打印出来的GC细节：

![image-20220419212940](http://pan.icebule.top/%E6%9C%89%E9%81%93%E4%BA%91%E7%AC%94%E8%AE%B0%E5%9B%BE%E5%BA%8A/%E4%B8%AA%E4%BA%BA%E7%AC%94%E8%AE%B0/JAVA/JVM/20220419212940.png)

DefNew代表新生代使用Serial GC，然后Tenured代表老年代使用Serial Old GC

## GC 日志分类

### MinorGC

MinorGC（或 young GC 或 YGC）日志：

```java
[GC (Allocation Failure) [PSYoungGen: 31744K->2192K (36864K) ] 31744K->2200K (121856K), 0.0139308 secs] [Times: user=0.05 sys=0.01, real=0.01 secs]
```

![image-20220419202643](http://pan.icebule.top/%E6%9C%89%E9%81%93%E4%BA%91%E7%AC%94%E8%AE%B0%E5%9B%BE%E5%BA%8A/%E4%B8%AA%E4%BA%BA%E7%AC%94%E8%AE%B0/JAVA/JVM/20220419202643.png)

![image-20220419202718](http://pan.icebule.top/%E6%9C%89%E9%81%93%E4%BA%91%E7%AC%94%E8%AE%B0%E5%9B%BE%E5%BA%8A/%E4%B8%AA%E4%BA%BA%E7%AC%94%E8%AE%B0/JAVA/JVM/20220419202718.png)

### FullGC

```java
[Full GC (Metadata GC Threshold) [PSYoungGen: 5104K->0K (132096K) ] [Par01dGen: 416K->5453K (50176K) ]5520K->5453K (182272K), [Metaspace: 20637K->20637K (1067008K) ], 0.0245883 secs] [Times: user=0.06 sys=0.00, real=0.02 secs]
```

![image-20220419202740](http://pan.icebule.top/%E6%9C%89%E9%81%93%E4%BA%91%E7%AC%94%E8%AE%B0%E5%9B%BE%E5%BA%8A/%E4%B8%AA%E4%BA%BA%E7%AC%94%E8%AE%B0/JAVA/JVM/20220419202740.png)

![image-20220419202804](http://pan.icebule.top/%E6%9C%89%E9%81%93%E4%BA%91%E7%AC%94%E8%AE%B0%E5%9B%BE%E5%BA%8A/%E4%B8%AA%E4%BA%BA%E7%AC%94%E8%AE%B0/JAVA/JVM/20220419202804.png)

## GC 日志结构剖析

### 透过日志看垃圾收集器

- Serial 收集器：新生代显示 "[DefNew"，即 Default New Generation

- ParNew 收集器：新生代显示 "[ParNew"，即 Parallel New Generation

- Parallel Scavenge 收集器：新生代显示"[PSYoungGen"，JDK1.7 使用的即 PSYoungGen

- Parallel Old 收集器：老年代显示"[ParoldGen"

- G1 收集器：显示”garbage-first heap“

### 透过日志看 GC 原因

- Allocation Failure：表明本次引起 GC 的原因是因为新生代中没有足够的区域存放需要分配的数据
- Metadata GCThreshold：Metaspace 区不够用了
- FErgonomics：JVM 自适应调整导致的 GC
- System：调用了 System.gc()方法

### 透过日志看 GC 前后情况

通过图示，我们可以发现 GC 日志格式的规律一般都是：GC 前内存占用-＞ GC 后内存占用（该区域内存总大小）

```java
[PSYoungGen: 5986K->696K (8704K) ] 5986K->704K (9216K)
```

- 中括号内：GC 回收前年轻代堆大小，回收后大小，（年轻代堆总大小）

- 括号外：GC 回收前年轻代和老年代大小，回收后大小，（年轻代和老年代总大小）

<mark>注意</mark>：Minor GC 堆内存总容量 = 9/10 年轻代 + 老年代。原因是 Survivor 区只计算 from 部分，而 JVM 默认年轻代中 Eden 区和 Survivor 区的比例关系，Eden:S0:S1=8:1:1。

### 透过日志看 GC 时间

GC 日志中有三个时间：user，sys 和 real

- user：进程执行用户态代码（核心之外）所使用的时间。这是执行此进程所使用的实际 CPU 时间，其他进程和此进程阻塞的时间并不包括在内。在垃圾收集的情况下，表示 GC 线程执行所使用的 CPU 总时间。
- sys：进程在内核态消耗的 CPU 时间，即在内核执行系统调用或等待系统事件所使用的 CPU 时间
- real：程序从开始到结束所用的时钟时间。这个时间包括其他进程使用的时间片和进程阻塞的时间（比如等待 I/O 完成）。对于并行 gc，这个数字应该接近（用户时间＋系统时间）除以垃圾收集器使用的线程数。

由于多核的原因，一般的 GC 事件中，real time 是小于 sys time ＋ user time 的，因为一般是多个线程并发的去做 GC，所以 real time 是要小于 sys ＋ user time 的。如果 real ＞ sys ＋ user 的话，则你的应用可能存在下列问题：IO 负载非常重或 CPU 不够用。

## Minor GC 日志解析

### 日志格式

```Java
2021-09-06T08:44:49.453+0800: 4.396: [GC (Allocation Failure) [PSYoungGen: 76800K->8433K(89600K)] 76800K->8449K(294400K), 0.0060231 secs] [Times: user=0.02 sys=0.01, real=0.01 secs]
```

### 日志解析

#### 2021-09-06T08:44:49.453+0800

日志打印时间 日期格式 如  2013-05-04T21:53:59.234+0800

添加-XX:+PrintGCDateStamps参数

#### 4.396

gc 发生时，Java 虚拟机启动以来经过的秒数

添加-XX:+PrintGCTimeStamps该参数

#### [GC (Allocation Failure)

发生了一次垃圾回收，这是一次 Minor GC。它不区分新生代 GC 还是老年代 GC，括号里的内容是 gc 发生的原因，这里 Allocation Failure 的原因是新生代中没有足够区域能够存放需要分配的数据而失败。

#### [PSYoungGen: 76800K->8433K(89600K)]

**PSYoungGen**：表示GC发生的区域，区域名称与使用的GC收集器是密切相关的

- **Serial收集器**：Default New Generation 显示Defnew
- **ParNew收集器**：ParNew
- **Parallel Scanvenge收集器**：PSYoung
- 老年代和新生代同理，也是和收集器名称相关

**76800K->8433K(89600K)**：GC前该内存区域已使用容量->GC后盖区域容量(该区域总容量)

- 如果是新生代，总容量则会显示整个新生代内存的9/10，即eden+from/to区
- 如果是老年代，总容量则是全身内存大小，无变化

#### 76800K->8449K(294400K)

虽然本次是Minor GC，只会进行新生代的垃圾收集，但是也肯定会打印堆中总容量相关信息

在显示完区域容量GC的情况之后，会接着显示整个堆内存区域的GC情况：GC前堆内存已使用容量->GC后堆内存容量（堆内存总容量），并且堆内存总容量 = 9/10 新生代 + 老年代，然后堆内存总容量肯定小于初始化的内存大小

#### ,0.0088371

整个GC所花费的时间，单位是秒

#### [Times：user=0.02 sys=0.01,real=0.01 secs]

- **user**：指CPU工作在用户态所花费的时间
- **sys**：指CPU工作在内核态所花费的时间
- **real**：指在此次事件中所花费的总时间

## Full GC 日志解析

### 日志格式

```Java
2021-09-06T08:44:49.453+0800: 4.396: [Full GC (Metadata GC Threshold) [PSYoungGen: 10082K->0K(89600K)] [ParOldGen: 32K->9638K(204800K)] 10114K->9638K(294400K), [Metaspace: 20158K->20156K(1067008K)], 0.0149928 secs] [Times: user=0.06 sys=0.02, real=0.02 secs]
```

### 日志解析

#### 2020-11-20T17:19:43.794-0800

日志打印时间 日期格式 如  2013-05-04T21:53:59.234+0800

添加-XX:+PrintGCDateStamps参数

#### 1.351

gc 发生时，Java 虚拟机启动以来经过的秒数

添加-XX:+PrintGCTimeStamps该参数

#### Full GC(Metadata GCThreshold)

括号中是gc发生的原因，原因：Metaspace区不够用了。
除此之外，还有另外两种情况会引起Full GC，如下：

1. Full GC(FErgonomics)
   原因：JVM自适应调整导致的GC
2. Full GC（System）
   原因：调用了System.gc()方法

#### [PSYoungGen: 100082K->0K(89600K)]

**PSYoungGen**：表示GC发生的区域，区域名称与使用的GC收集器是密切相关的

- **Serial收集器**：Default New Generation 显示DefNew
- **ParNew收集器**：ParNew
- **Parallel Scanvenge收集器**：PSYoungGen
- 老年代和新生代同理，也是和收集器名称相关

**10082K->0K(89600K)**：GC前该内存区域已使用容量->GC该区域容量(该区域总容量)

- 如果是新生代，总容量会显示整个新生代内存的9/10，即eden+from/to区

- 如果是老年代，总容量则是全部内存大小，无变化

#### ParOldGen：32K->9638K(204800K)

老年代区域没有发生GC，因此本次GC是metaspace引起的

#### 10114K->9638K(294400K),

在显示完区域容量GC的情况之后，会接着显示整个堆内存区域的GC情况：GC前堆内存已使用容量->GC后堆内存容量（堆内存总容量），并且堆内存总容量 = 9/10 新生代 + 老年代，然后堆内存总容量肯定小于初始化的内存大小

#### [Meatspace:20158K->20156K(1067008K)],

metaspace GC 回收2K空间



## 论证FullGC是否会回收元空间/永久代垃圾

```Java
/**
 * jdk6/7中：
 * -XX:PermSize=10m -XX:MaxPermSize=10m
 * <p>
 * jdk8中：
 * -XX:MetaspaceSize=10m -XX:MaxMetaspaceSize=10m
 *
 * @author IceBlue
 * @create 2020  22:24
 */
public class OOMTest extends ClassLoader {
    public static void main(String[] args) {
        int j = 0;
        try {
            for (int i = 0; i < 100000; i++) {
                OOMTest test = new OOMTest();
                //创建ClassWriter对象，用于生成类的二进制字节码
                ClassWriter classWriter = new ClassWriter(0);
                //指明版本号，修饰符，类名，包名，父类，接口
                classWriter.visit(Opcodes.V1_8, Opcodes.ACC_PUBLIC, "Class" + i, null, "java/lang/Object", null);
                //返回byte[]
                byte[] code = classWriter.toByteArray();
                //类的加载
                test.defineClass("Class" + i, code, 0, code.length);//Class对象
            	test = null;
                j++;
            }
        } finally {
            System.out.println(j);
        }
    }
}
```

输出结果：

```
[GC (Metadata GC Threshold) [PSYoungGen: 10485K->1544K(152576K)] 10485K->1552K(500736K), 0.0011517 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
[Full GC (Metadata GC Threshold) [PSYoungGen: 1544K->0K(152576K)] [ParOldGen: 8K->658K(236544K)] 1552K->658K(389120K), [Metaspace: 3923K->3320K(1056768K)], 0.0051012 secs] [Times: user=0.00 sys=0.00, real=0.01 secs] 
[GC (Metadata GC Threshold) [PSYoungGen: 5243K->832K(152576K)] 5902K->1490K(389120K), 0.0009536 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 

-------省略N行-------

[Full GC (Last ditch collection) [PSYoungGen: 0K->0K(2427904K)] [ParOldGen: 824K->824K(5568000K)] 824K->824K(7995904K), [Metaspace: 3655K->3655K(1056768K)], 0.0041177 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
Heap
 PSYoungGen      total 2427904K, used 0K [0x0000000755f80000, 0x00000007ef080000, 0x00000007ffe00000)
  eden space 2426880K, 0% used [0x0000000755f80000,0x0000000755f80000,0x00000007ea180000)
  from space 1024K, 0% used [0x00000007ea180000,0x00000007ea180000,0x00000007ea280000)
  to   space 1536K, 0% used [0x00000007eef00000,0x00000007eef00000,0x00000007ef080000)
 ParOldGen       total 5568000K, used 824K [0x0000000602200000, 0x0000000755f80000, 0x0000000755f80000)
  object space 5568000K, 0% used [0x0000000602200000,0x00000006022ce328,0x0000000755f80000)
 Metaspace       used 3655K, capacity 4508K, committed 9728K, reserved 1056768K
  class space    used 394K, capacity 396K, committed 2048K, reserved 1048576K

进程已结束,退出代码0

```

通过不断地动态生成类对象,输出GC日志

根据GC日志我们可以看出当元空间容量耗尽时,会触发FullGC,而每次FullGC之前,至会进行一次MinorGC,而MinorGC只会回收新生代空间;

只有在FullGC时,才会对新生代,老年代,永久代/元空间全部进行垃圾收集