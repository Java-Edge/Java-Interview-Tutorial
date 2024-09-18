# 对象内存分配及Minor GC和Full GC全过程

## 1 案例

注意，本文用例基于 JDK8 的默认垃圾收集器，不适用于 G1。

某数据计算系统，日处理亿级数据量。系统不停通过SQL从各数据源读数据，加载到JVM内存进行计算处理：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/b08dc08e678a04bd8576cba65e94a6bb.png)

执行500次/min的数据提取和计算任务。分布式系统，线上部署多台机器：

- 每台机器约负责执行100次/min的数据提取和计算任务
- 每次读约1w条数据到内存计算，每次计算约耗10s
- 机器4核8G，JVM内存4G：新生代、老年代分别1.5G

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/1878c16b04cd4ab32fa7ef1c8da2869c.png)

## 2 新生代多久满？

每次1w条数据，约占多大内存？这每条数据较大，平均每条数据含20个字段，可认为平均每条数据1KB，则每次计算任务的1w条数据就是10MB。

若新生代按默认的8:1:1分配Eden和两块Survivor区域，则Eden=1.2GB，每块Survivor=100MB：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/edcbd78a392a204b7d6f6a541ef0aba1.png)

则每次执行一个计算任务，就会在Eden分配10MB对象，约对应100次/min的计算任务。所以Eden基本1min左右就满了。

## 3 Minor GC时，多少对象进老年代？

假设Eden 1min后满，接着继续执行计算任务时，必Minor GC，回收一部分垃圾对象。Minor GC前会先检查：

### 3.1 老年代可用内存 ＞ 新生代全部对象？

此时老年代空，有1.5G可用内存，Eden算做1.2G对象：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/545fdf320fcc713dc890fc037be8c658.png)

此时，即使一次Minor GC，全部对象都存活，老年代也能放下，则此时直接执行Minor GC。

### 3.2 此时Eden多少对象存活，无法被GC？

每个计算任务1w条数据，需10s，假设此时80个计算任务都执行结束，但还有20个计算任务共200M数据还在计算，就是200MB对象存活，不能被GC，然后有1G对象可GC：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/cf3e82302d495a235af192737a7f93ce.png)

此时一次Minor GC就回收1G对象，然后200M对象放入Survivor吗？

**不能！**因为任一块Survivor区实际上就100M空间，此时就会通过空间担保机制，让这200M对象直接进入老年代，然后Eden区清空：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/8f54752e91d1367433d6b6f2253e4283.png)

## 4 系统运行多久，老年代就满了？

按上述计算，每min都是个轮回，约每min都将Eden填满，然后触发一次Minor GC，然后约200M数据进入老年代。

若2min过去，此时老年代有400M被占用，剩1.1G可用，若第3min运行完毕，又Minor GC，会做啥检查？

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/568e87810ebd14cd267c078916001895.png)

### 4.1 先检查老年代可用空间 ＞ 新生代全部对象？

此时老年代可用1.1G，新生代对象有1.2GB。

此时假设一次Minor GC过后新生代对象全部存活，老年代放不下了，就得看参数：

```
-XX:-HandlePromotionFailure
```

当JVM执行Minor GC时，如发现老年代（Tenured/Old Generation）无足够空间容纳从新生代晋升的对象，那么GC将触发一个Full GC来尝试清理老年代的空间。如

参数被禁用（即使用 `-XX:+HandlePromotionFailure`），JVM不会在Minor GC时考虑老年代的空间不足，可能导致晋升失败并OOM。

一般都会打开，就进入第二步检查。

### 4.2 老年代可用空间 ＞ 历次Minor GC过后进入老年代的对象的平均大小

大概每min执行一次Minor GC，每次大概200M对象进入老年代。那此时发现老年代1.1G，大于每次Minor GC后平均的200M。所以本次Minor GC后大概率还是有200MB对象进入老年代，1.1G可用空间足够。所以此时就会放心执行一次Minor GC，然后又是200MB对象进入老年代。

转折点大概在运行了7min后，7次Minor GC后，大概1.4G对象进入老年代，老年代剩余空间就不到100MB ，几乎快满：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/1912b1b7d8d3499836936b2ca482dd22.png)

## 5 系统运行多久，老年代会触发1次Full GC？

约第8min运行结束时，新生代又满，执行Minor GC前进行检查，发现老年代只有100M，比200M小，就会直接触发一次Full GC。

Full GC会把老年代的垃圾对象都回收，若此时老年代被占据的1.4G都是可回收对象，则此时一次就会把这些对象都回收：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/46d08245babebd0df7399ef01e649f79.png)

接着就会执行Minor GC，此时Eden区情况，200MB对象再次进老年代，之前Full GC就是为这些新生代本次Minor GC要进入老年代的对象准备：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/32bd6f0b6af188f8e2486916c34e2a9d.png)

基本平均7、8min一次Full GC，这频率相当高。因为每次Full GC很慢， 性能很差。

## 6 咋调优？

因为这数据计算系统，每次Minor GC时，必有一批数据没计算完，但按现有内存模型，最大问题是每次Survivor放不下存活对象。

所以增加新生代内存比例，3G堆内存，2G给新生代， 1G老年代。这样Survivor区大概200M，每次刚好能放下Minor GC后的存活对象：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/ce725bd57ddb9fb1c1ab55e9fdd2eadd.png)

只要每次Minor GC过后200MB存活对象可以放Survivor区域，等下次Minor GC时，这个Survivor区的对象对应的计算任务早就结束了，都可回收。

此时，比如Eden 1.6G被占满，然后S0有200MB上一轮 Minor GC后存活的对象：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/6da0d253022cd4a1c96e35ac9d92937e.png)

然后此时执行Minor GC，就会把Eden 1.6G对象回收，S0里200MB对象也会回收，然后Eden剩余的200M存活对象会放入S1：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/9beeed110be394a4ec98a2b6d0743c6c.png)

以此类推，基本上就很少对象会进入老年代，老年代里的对象也不会太多。

通过这个优化，成功将生产系统的老年代Full GC频率从几min一次降低到几h一次，大幅提升系统性能，避免频繁Full GC对系统性能影响。

动态年龄判定升入老年代的规则，若：
$$
Survivor区中的同龄对象＞超过Survivor区内存/2
$$
就直接升入老年代。所以此处优化仅为说明：增加Survivor区大小，让Minor GC后的对象进入Survivor区中，避免进入老年代。

为避免动态年龄判定规则把Survivor区中的对象直接升入老年代，若新生代内存有限，可调整

XX:SurvivorRatio=8：默认Eden区比例80%，也可降低Eden区比例，给两块Survivor区更多内存空间。

然后让每次Minor GC后的对象进入Survivor区中，还可避免动态年龄判定规则直接把他们送入老年代。