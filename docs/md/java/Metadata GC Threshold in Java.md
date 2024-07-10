# Metadata GC Threshold in Java

## 1 概述

本文探讨Metaspace和元数据GC阈值（Metadata GC Threshold）及如何调整它们这些参数。

## 2 元数据（Metadata）

Metadata包含有关堆中对象的信息，包括类定义、方法表等相关信息。根据Java的版本，JVM将这些数据存储在永久代（Permanent Generation）或Metaspace。

JVM依靠这些信息来执行类加载、字节码验证和动态绑定等任务。

## 3 PermGen和Metaspace

Java 8开始，JVM用一个叫做Metaspace的新内存区域替代了永久代（PermGen）来存储元数据。

- 永久代是一个固定大小的内存区域，独立于主堆，用于存储JVM加载的类和方法的元数据。它有一个固定的最大大小，一旦满了，JVM就会抛出OOM
- 而Metaspace的大小不固定，可以根据应用中的元数据量动态增长。Metaspace存在于独立于主堆的本地内存（进程内存）段中。它的大小仅受主机os的限制

## 4 元数据GC阈值

Java中，当我们创建一个带有元数据的对象时，它会像其他对象一样占用内存空间。JVM需要这些元数据来执行各种任务。与普通对象不同，元数据在达到某阈值之前不会进行垃圾回收。

随着Java程序执行过程中动态加载的类越来越多，Metaspace会逐渐填满。

JVM为Metaspace内容大小设置了一个阈值，当某个分配不符合此阈值时，会触发一次元数据GC阈值的垃圾回收周期。

## 5 用于元数据的JVM参数

可用类似`-XX:+PrintClassHistogram`和`-XX:+PrintMetaspaceStatistics`的JVM标志来收集有关使用大量元数据内存的类的信息，并打印有关Metaspace的统计信息，如用于类元数据的空间量。

使用这些信息，可优化代码以改善Metaspace和垃圾回收周期的使用情况。此外，我们还可以调整与Metaspace相关的JVM参数。

下面是一些用于调整元数据和Metaspace的JVM参数。

### 5.1 `-XX:MetaspaceSize=<size>` 

用于设置分配给类元数据的初始空间量（初始高水位线，以字节为单位），该空间量可能会导致垃圾回收以卸载类。这个数值是近似的，这意味着JVM也可以决定增加或减少Metaspace的大小。

较大的参数值可以确保垃圾回收发生的频率较低。此参数的默认值取决于平台，范围从12 MB到约20 MB。

如设为128 MB：

```
-XX:MetaspaceSize=128m
```

### 5.2. `-XX:MaxMetaspaceSize=<size>` 

设置Metaspace的最大大小，超过此大小后会抛出OutOfMemory错误。此标志限制了分配给类元数据的空间量，分配给此参数的值是近似的。

默认情况下，没有设置限制，这意味着Metaspace可能增长到可用本地内存的大小。

如置100 MB：

```
‑XX:MaxMetaSpaceSize=100m
```

### 5.3. `-XX:+UseCompressedClassPointers` 

通过压缩对象引用来减少64位Java应用程序的内存占用。当此参数设置为true时，JVM将使用压缩指针来处理类元数据，这使得JVM可以使用32位寻址来处理类相关数据，而不是完整的64位指针。

在64位架构上，此优化尤其有价值，因为它减少了类元数据的内存使用，以及对象引用所需的内存，从而可能提高应用程序的整体性能。

压缩类指针将类空间分配与非类空间分配分开。因此，我们有两个全局Metaspace上下文：一个用于保存Klass结构的分配（压缩类空间），一个用于保存其他所有内容（非类Metaspace）。

最近JVM版本中，通常在运行64位Java应用程序时，默认启用此标志，因此我们通常不需要显式设置此标志。

### 5.4. `-XX:+UseCompressedOops` 

标志启用或禁用在64位JVM中使用压缩指针处理Java对象。当参数设置为true时，JVM将使用压缩指针，这意味着对象引用将使用32位指针，而不是完整的64位指针。

使用压缩指针，只能寻址较小范围的内存。这迫使JVM使用较小的指针并节省内存。

## 6 结论

本文中，我们探讨了元数据和Metaspace的概念。

我们探讨了触发元数据GC阈值的原因。我们还了解了元数据GC阈值以及用于调整Metaspace和优化垃圾回收周期的不同JVM参数。

下一讲，我们讨论Metaspace导致的一个 OOM 生产排查案例！