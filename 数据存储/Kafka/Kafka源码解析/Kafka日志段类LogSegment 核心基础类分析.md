> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

# 1 Kafka日志结构概览
- Kafka日志在磁盘上的组织架构
![](https://img-blog.csdnimg.cn/20200921214638339.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)


如上图可见，Kafka日志对象由多个日志段对象组成，而每个日志段对象会在磁盘上创建一组文件，包括不止如下：
- 消息日志文件（.log）
- 位移索引文件（.index）
- 时间戳索引文件（.timeindex）
- 已中止（Aborted）事务的索引文件（.txnindex）
![](https://img-blog.csdnimg.cn/20200917045701343.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

若没有使用Kafka事务，已中止事务的索引文件不会被创建。
图中的一串数字0是该日志段的起始位移值（Base Offset），即该日志段中所存的第一条消息的位移值。

一般一个Kafka主题有很多分区，每个分区就对应一个Log对象，在物理磁盘上则对应一个子目录。比如创建一个双分区的主题test-topic，那么，Kafka在磁盘上会创建两个子目录：
1. test-topic-0
2. test-topic-1

而在服务器端，这就是两个Log对象。每个子目录下存在多组日志段，即多组.log、.index、.timeindex文件组合，只不过文件名不同（因每个日志段的起始位移不同）

# 2 日志段代码解析
日志段是Kafka保存消息的最小载体。Kafka 的消息就是保存在日志段。

## 2.1 案例
大面积日志段同时间切分，导致瞬时打满磁盘I/O带宽。最后在LogSegment的shouldRoll方法找到解决方案：设置Broker端参数log.roll.jitter.ms值大于0，即通过给日志段切分执行时间加一个扰动值的方式，来避免大量日志段在同一时刻执行切分动作，从而显著降低磁盘I/O。

所以，阅读源码很重要。
**毕竟单纯查看官网对该参数的说明，不一定能够全面了解它的作用。**


- 日志段源码位 core 工程下的LogSegment.scala
![](https://img-blog.csdnimg.cn/20200917050528745.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

- 该文件下定义了三个 Scala 对象：
![](https://img-blog.csdnimg.cn/20200917050656895.png#pic_center)

主要关心前两者。

## 2.2 日志段类解析
### 类综述

- LogSegment 类定义
![](https://img-blog.csdnimg.cn/20200918050135890.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

### 核心 API
读写日志是Kafka最常用的操作，而日志读取底层调用的就是日志段的这两个方法。

#### append（写消息）
重点关注一下写操作过程中更新索引的时机是如何设定的。
##### 执行流程![](https://img-blog.csdnimg.cn/20200921223322493.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

###### step1
- 先判断该日志段是否为空，若为空，则Kafka需记录要写入消息集的最大时间戳，并将其作为后面新增日志段倒计时的依据。
![](https://img-blog.csdnimg.cn/20200919233135213.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

###### step2
![](https://img-blog.csdnimg.cn/20200919233953343.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)


###### step3
![](https://img-blog.csdnimg.cn/20200919234144915.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
###### step4
- 每个日志段都要保存当前最大时间戳和所属消息的偏移信息。
![](https://img-blog.csdnimg.cn/20200919234342115.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

Broker 端提供有定期删除日志的功能。比如我只想保留最近 7 天日志，就是基于当前最大时间戳值。
而最大时间戳对应的消息的偏移值则用于时间戳索引项。时间戳索引项保存时间戳与消息偏移的对应关系。该步骤中，Kafka更新并保存这组对应关系。

###### step5

![](https://img-blog.csdnimg.cn/20200920000510815.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

#### read（读消息）
关注下Kafka计算待读取消息字节数的逻辑，也就是maxSize、maxPosition和startOffset是如何共同影响read方法的。
- 方法签名
![](https://img-blog.csdnimg.cn/20200920002156625.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

##### 执行流程
![](https://img-blog.csdnimg.cn/20200921223712624.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)


###### step1
![](https://img-blog.csdnimg.cn/20200920013219285.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
###### step2
![](https://img-blog.csdnimg.cn/20200920013315498.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)


待确定了读取起始位置，日志段代码需要根据这部分信息以及 maxSize 和 maxPosition 参数共同计算要读取的总字节数。举个例子，假设 maxSize=100，maxPosition=300，startPosition=250，那么 read 方法只能读取 50 字节，因为 maxPosition - startPosition = 50。我们把它和maxSize参数相比较，其中的最小值就是最终能够读取的总字节数。

###### step3
![](https://img-blog.csdnimg.cn/20200920013400716.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

#### recover（恢复日志段）
- 什么是恢复日志段？
Broker 在启动时会从磁盘上加载所有日志段信息到内存中，并创建相应的 LogSegment 对象实例。是Broker重启后恢复日志段的操作逻辑。

##### 执行流程
![](https://img-blog.csdnimg.cn/20200921224447823.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

###### step1
![](https://img-blog.csdnimg.cn/20200921045718209.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
###### step2
![](https://img-blog.csdnimg.cn/20200921045820233.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
###### step3
![](https://img-blog.csdnimg.cn/2020092104585662.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

注意该操作在执行过程中要读取日志段文件。因此，若你的环境有很多日志段文件，你又发现Broker重启很慢，那你现在就知道了，这是因为Kafka在执行recover的过程中需要读取大量磁盘文件。

参考
- https://tech.meituan.com/2015/01/13/kafka-fs-design-theory.html

![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)