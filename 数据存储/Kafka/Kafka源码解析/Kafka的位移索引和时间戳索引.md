在Kafka的数据路径下有很多`.index`和`.timeindex`后缀文件：
- `.index`文件，即Kafka中的位移索引文件
- `.timeindex`文件，即时间戳索引文件。

#  1 OffsetIndex - 位移索引
## 1.1 定义
用于根据位移值快速查找消息所在文件位置。

每当Consumer需要从`topic`分区的某位置开始读消息时，Kafka就会用`OffsetIndex`直接定位物理文件位置，避免从头读取消息的I/O性能开销。

不同索引类型保存不同的 K.V 对。OffsetIndex的K即消息的相对位移，V即保存该消息的日志段文件中该消息第一个字节的物理文件位置。

### 相对位移
AbstractIndex类中的抽象方法entrySize定义了单个K.V对所用的字节数。
OffsetIndex的entrySize就是8，如OffsetIndex.scala中定义的那样：
![](https://img-blog.csdnimg.cn/20201201192406457.png)

相对位移是个Integer，4字节，物理文件位置也是一个Integer，4字节，因此共8字节。

Kafka的消息位移值是一个长整型（Long），应占8字节。在保存OffsetIndex的K.V对时，Kafka做了一些优化。每个OffsetIndex对象在创建时，都已保存了对应日志段对象的起始位移，因此，OffsetIndex无需保存完整8字节位移值。实际上，只需保存与起始位移的差值，该差值整型存储足矣。这种设计就让OffsetIndex每个索引项都节省4字节。

假设某一索引文件保存1000个索引项，使用相对位移值就能节省大约4M。
AbstractIndex定义了relativeOffset方法
- 将一个Long位移值转换成相对偏移
![](https://img-blog.csdnimg.cn/20201201193800727.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 真正的转换![](https://img-blog.csdnimg.cn/20201201193834787.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

读取**OffsetIndex**时，还需将相对偏移值还原成之前的完整偏移。
- parseEntry：构造OffsetPosition所需的Key和Value
![](https://img-blog.csdnimg.cn/20201201194443600.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)![](https://img-blog.csdnimg.cn/20201201195152956.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 该方法返回`OffsetPosition`类型。因为该类的俩方法分别返回索引项的K、V。
![](https://img-blog.csdnimg.cn/2020120119482864.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- physical![](https://img-blog.csdnimg.cn/20201201200410307.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)



# 写索引项 - append
通过Long位移值和Integer物理文件位置参数，然后向mmap写入相对位移值、物理文件位置![](https://img-blog.csdnimg.cn/20201201201321375.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# Truncation 截断
将索引文件内容直接裁剪掉部分。比如，**OffsetIndex**索引文件中当前保存100个索引项，现在只想保留最开始40个索引项。
- truncateToEntries
![](https://img-blog.csdnimg.cn/20201201202437994.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 使用OffsetIndex
OffsetIndex被用来快速定位消息所在的物理文件位置，那么必然需定义一个方法执行对应的查询逻辑。这个方法就是lookup。
![](https://img-blog.csdnimg.cn/20201201204338312.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

该方法返回的，是不大于给定位移值targetOffset的最大位移值，以及对应的物理文件位置。你大致可以把这个方法，理解为位移值的FLOOR函数。

# 2 TimeIndex - 时间戳索引
## 2.1 定义
用于根据时间戳快速查找特定消息的位移值。

TimeIndex保存`<时间戳，相对位移值>`对：
- 时间戳需长整型存储
- 相对偏移值使用Integer存储

因此，TimeIndex单个索引项需要占12字节。
**存储同数量索引项，TimeIndex比OffsetIndex占更多磁盘空间。**

## 2.2 写索引

- maybeAppend
![](https://img-blog.csdnimg.cn/20201201220136250.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

向TimeIndex写索引的主体逻辑，是向mmap分别写入时间戳和相对偏移值。
除校验偏移值的单调增加性之外，TimeIndex还会确保顺序写入的时间戳也单调增加。

### 不单调增加会咋样？
向TimeIndex索引文件中写入一个过期时间戳和位移，就会导致消费端程序混乱。因为，当消费者端程序根据时间戳信息去过滤待读取消息时，它读到了这个过期时间戳并拿到错误位移值，于是返回错误数据。


# 3 总结及 FAQ
虽然**OffsetIndex**和**TimeIndex**是不同类型索引，但Kafka内部把二者结合使用。通常先使用**TimeIndex**寻找满足时间戳要求的消息位移值，然后再利用**OffsetIndex**定位该位移值所在的物理文件位置。因此，它们其实是协作关系。
- 二者的 broker 端参数都是`log.index.size.max.bytes`
![](https://img-blog.csdnimg.cn/20201201221627578.png)



- 为什么需要一起使用，消费者不是根据Offset找到对于位置值开始消费就好吗？而且结合使用性能也应该降低吧？
没错。不过一般情况下消费者并不是直接能够定位目标offset，相反地它是通过时间戳先找到目标offset。

不要对索引文件做任何修改！擅自重命名索引文件可能导致Broker崩溃无法启动的场景。虽然Kafka能重建索引，但随意删除索引文件很危险！

- 建立分区初始化的时候，log-segment的位移索引和时间索引文件将近有10M的数据？
里面为空，只是预分配了10MB的空间

- kafka记录消费者的消费offset是对消费者组，还是对单个消费者？比如一个消费者组中新加入一个消费者，分区重新分配，那新加入的消费者是从哪里开始消费？
针对消费者组，或者说针对每个group id。保存的是<groupId, topicPartition, offset>三元组。新增消费者拿到要消费的分区后，去查看有无对应的三元组记录，如果没有，则根据consumer端参数auto.offset.reset值来决定从哪里开始消费


- Kafka没有提供延时消息机制，只能自己实现的哈。