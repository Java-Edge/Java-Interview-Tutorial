> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

Kafka使用zk实现和RocketMQ的NameServer相似的功能。
#  1 Kafka的zk有什么作用？
首先我们来看一下Kafka在ZooKeeper都保存了哪些信息：

- 0.8.x的旧版本的情况，最新版本的Kafka已经将消费位置管理等一些原本依赖ZooKeeper实现的功能，替换成了其他的实现方式。
![](https://img-blog.csdnimg.cn/202009150023042.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)绿色框形是临时节点，其它是持久节点。

## 1.1 ids 子树（临时节点）
保存的是Kafka的Broker信息，`/brokers/ids/[0…N]`，每个临时节点对应一个在线Broker，Broker启动后会创建一个临时节点，代表Broker已经加入集群，可提供服务了，节点名称就是BrokerID，节点内保存了包括Broker的地址、版本号、启动时间等信息。若Broker宕机或与zk集群失联，该临时节点也会消失。

## 1.2 topics 子树
### topic
保存topic和partition信息。`/brokers/topics/`节点下的每个子节点都是一个topic，节点的名称就是topic名称。
### partitions
每个topic节点下面都包含 **一个固定** 的partitions节点，pattitions节点的子节点就是主题下的所有分区，节点名称即分区编号。
### state（临时节点）
位于每个分区节点下，其保存着 **分区当前的leader和所有ISR的BrokerID**。该state临时节点由该分区当前的Leader Broker创建。
若该分区的Leader Broker宕机，对应state节点也会消失，直至新Leader被选举出来，再次创建state节点。

这份元数据同时被缓存到每一个Broker。
Kafka主要使用zk保存其元数据、监控Broker和分区的存活状态，并利用zk进行选举。
#  2 Kafka client如何定位Broker？
先根据topic和queue，在topics树中找到分区对应的state临时节点。从中取得该Leader的BrokerID，再去ids 子树，找到BrokerID对应的临时节点，即可获取到Broker真正的物理地址。

**Kafka client不会直接连zk，而是在需要时，通过RPC请求从Broker拉取所关心的topic的元数据，然后保存到client的元数据缓存，以便client的生产和消费。** zk上的元数据都是通过Broker中转给各个Kafka client。



Kafka client（客户端）真正与Broker（服务端）数据通信是在NetworkClient#poll实现，经过如下调用链：
![](https://img-blog.csdnimg.cn/20200915052922414.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
![](https://img-blog.csdnimg.cn/2020091505320277.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

该方法里面，Kafka构造了一个更新元数据请求：
![](https://img-blog.csdnimg.cn/20200915053520885.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

该方法创建的并不是一个真正的更新元数据的MetadataRequest，而是一个用于构造MetadataRequest的构造器MetadataRequest.Builder，等到真正要发送请求之前，Kafka才会调用Builder.buid()方法把这个MetadataRequest构建出来然后发送出去。其实不仅是元数据的请求，所有的请求都是这样处理的。

调用sendInternalMetadataRequest()方法时，这个请求也并没有被真正发出去，依然是保存在待发送的队列中，然后择机来异步批量发送。

请求的具体数据内容封装在MetadataRequestData 类
![](https://img-blog.csdnimg.cn/2020091505411912.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

# 3 Broker如何处理客户端的更新元数据请求？

Broker处理所有RPC请求的入口方法
## KafkaApis#handleTopicMetadataRequest
- 处理更新元数据的方法
![](https://img-blog.csdnimg.cn/20200915050158644.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

handleTopicMetadataRequest(RequestChannel.Request)：
```scala
 def handleTopicMetadataRequest(request: RequestChannel.Request): Unit = {
 	...
    // 需要获取哪些topic的元数据
    val topics = if (metadataRequest.isAllTopics)
      metadataCache.getAllTopics()
    // 不会披露未经Describe授权的主题的存在，因此甚至都没有检查它们是否存在
    val unauthorizedForDescribeTopicMetadata =
      // 对于所有主题，请勿包括未经授权的主题
      // 在旧版本的协议中，每次都获取所有主题的元数据
      if ((requestVersion == 0 && (metadataRequest.topics == null || metadataRequest.topics.isEmpty)) || metadataRequest.isAllTopics)
        Set.empty[MetadataResponseTopic]
      else
        unauthorizedForDescribeTopics.map(topic =>
          metadataResponseTopic(Errors.TOPIC_AUTHORIZATION_FAILED, topic, false, util.Collections.emptyList()))
        // 从元数据缓存过滤出相关主题的元数据
        getTopicMetadata(metadataRequest.allowAutoTopicCreation, authorizedTopics, request.context.listenerName,
          errorUnavailableEndpoints, errorUnavailableListeners)

    var clusterAuthorizedOperations = Int.MinValue
    if (request.header.apiVersion >= 8) {
      // 获取集群授权的操作
      if (metadataRequest.data.includeClusterAuthorizedOperations) {
      	...
      // 获取主题授权操作
      if (metadataRequest.data.includeTopicAuthorizedOperations) {
      	...
    val completeTopicMetadata = topicMetadata ++ unauthorizedForCreateTopicMetadata ++ unauthorizedForDescribeTopicMetadata
    // 获取所有Broker列表
    val brokers = metadataCache.getAliveBrokers
    // 构建Response并发送
    sendResponseMaybeThrottle(request, requestThrottleMs =>
    ...
  }
```

0. 先根据请求中的topic列表
1. 去本地元数据缓存MetadataCache中过滤出相应主题的元数据，即  topics 子树的子集
2. 然后再去本地元数据缓存中获取所有Broker的集合， 即 ids 子树
3. 最后把这两部分合在一起，作为响应返回给客户端。

Kafka在每个Broker中都维护了一份和zk中一样的元数据缓存，并非每次client请求元数据就去读一次zk。由于zk的Watcher机制，Kafka可感知到zk中的元数据变化，从而及时更新Broker的元数据缓存。

# 4 最佳实践
目前Kafka集群的可用性高度耦合zk，若zk集群不能提供服务，整个Kafka集群就无法服务了，Kafka的开发者也意识到了这个问题，目前正在讨论开发一个元数据服务来替代 zk。

若需部署大规模Kafka集群，推荐拆分成多个互相独立的小集群部署，每个小集群都使用一组独立的zk提供服务。这样，每个zk中存储的数据相对较少，且若某zk集群异常，只会影响一个小Kafka集群，尽量减小了影响范围。

参考
- https://www.bcoder.top/2019/12/14/%E6%B6%88%E6%81%AF%E9%98%9F%E5%88%97%E4%B9%8BKafka%E5%8D%8F%E8%B0%83%E6%9C%8D%E5%8A%A1ZooKeeper/


![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)