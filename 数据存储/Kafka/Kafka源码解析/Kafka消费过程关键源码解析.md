> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

# 1 案例引入
- 官方Consumer最简代码用例：
![](https://img-blog.csdnimg.cn/20200912152441269.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

简短的代码，背后牵涉很多问题，Consumer如何绑定特定分区？如何实现订阅 topic 的？又如何实现拉消息？

#  2 订阅流程
![](https://img-blog.csdnimg.cn/20200912170952684.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

订阅主流程主要更新如下关键属性：
1. 订阅状态（SubscriptionState） - subscriptions
主要维护所订阅的topic和patition的消费位置等状态信息
2. 元数据中的topic信息

metadata中维护了Kafka集群元数据的一个子集，包括集群的Broker节点、Topic和Partition在节点上分布，以及我们聚焦的第二个问题：Coordinator给Consumer分配的Partition信息。

注意`acquireAndEnsureOpen()`和`try-finally release()`保证该方法的线程安全。

跟进到更新元数据的方法metadata.requestUpdateForNewTopics()

## Metadata.requestUpdateForNewTopics()
- 请求更新元数据。
![](https://img-blog.csdnimg.cn/20200912223335387.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

这里，并未真正发送更新元数据的请求，只是将需要更新元数据的标志位`needUpdate`置`true`。Kafka必须确保在第一次拉消息前元数据可用，即必须更新一次元数据，否则Consumer不知道应该去哪个Broker拉哪个Partition的消息。


# 3 拉消息流程
那元数据何时才真正更新呢？

- 拉消息时序图
![](https://img-blog.csdnimg.cn/20200818011613644.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

KafkaConsumer#poll()方法中主要调用如下方法：

## updateAssignmentMetadataIfNeeded()

- 更新元数据
![](https://img-blog.csdnimg.cn/20200912225112213.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

其内部调用`coordinator.poll()`，`poll()`里又调用

### `ConsumerNetworkClient#ensureFreshMetadata()`
![](https://img-blog.csdnimg.cn/20200912230653744.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

### `ConsumerNetworkClient#awaitMetadataUpdate`![](https://img-blog.csdnimg.cn/2020091223090427.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
内部调用了client.poll()方法，实现与Cluster通信，在Coordinator注册Consumer并拉取和更新元数据。

这些都是 client 类中方法，ConsumerNetworkClient封装了Consumer和Cluster之间所有网络通信的实现，是个完全的异步实现类。没有维护任何线程
- 待发送Request都存在unsent域
![](https://img-blog.csdnimg.cn/20200912233602689.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

- Response存放在pendingCompletion域
![](https://img-blog.csdnimg.cn/20200912233910950.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

每次调用poll()时，在当前线程中发送所有待发送Request，处理所有收到Response。

#### 异步设计
- 优势：

无需维护用于异步发送的和处理响应的线程，并且能充分发挥批量处理的优势，这也是Kafka的性能非常好的原因之一。
很少的线程实现高吞吐量。劣势：极大增加了代码的复杂度。

好了，下面再看另一关键方法：
![](https://img-blog.csdnimg.cn/20200912232321447.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

## pollForFetches() 
![](https://img-blog.csdnimg.cn/20200912234530380.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

主要由fetcher.sendFetches()实现，由于代码过长，简述其流程如下：
1. 根据元数据的信息，构造所需Broker的拉消息的Request对象
2. 然后调用`ConsumerNetworkClient#send`异步发送Request
3. 并且注册一个回调类处理返回的Response
所有返回的Response被暂时存放在`Fetcher#completedFetches`。注意，此时的Request并未被真正发给各Broker，而被暂存在`client.unsend`等待发送。
4. 然后，在调用`ConsumerNetworkClient#poll`时，会真正将之前构造的所有Request发送出去，并处理收到的Response
5. 最后，fetcher.fetchedRecords()方法中，将返回的Response反序列化后转换为消息列表，返回给调用者

# 总结
综上过程讲解，给出整个拉消息流程涉及关键类的类图
![](https://img-blog.csdnimg.cn/20200820004607238.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
参考
- https://blog.csdn.net/evasnowind/article/details/108534598


![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)