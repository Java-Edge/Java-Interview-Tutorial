# Kafka运维利器：深入解析AdminClient原理与实战

## 1 Kafka脚本弊端

Kafka自带各种命令行脚本，用起来虽方便，但是：

- 只能运行在控制台。若想在应用程序、运维框架或是监控平台中集成难
- 很多通过连接zk来提供服务。而社区越来越不推荐任何工具直连zk，因为这可能绕过Kafka安全设置。kafka-topics脚本连接zk时，不会考虑Kafka设置的用户认证机制。即任何使用该脚本的用户，不论是否具有创建主题的权限，都成功“跳过”权限检查，强行创建主题
- 运行它们要用Kafka内部类实现，即Kafka**服务器端**代码。社区希望用户只用Kafka**客户端**代码，通过现有请求机制运维管理集群。这样所有运维操作都能统一处理，方便功能演进

因此，社区0.11版推出Java客户端版AdminClient，**服务器端也有一个AdminClient**，包路径是kafka.admin，是之前的老运维工具类，提供的功能也比较有限，社区已经不再推荐使用它了。

![](https://img-blog.csdnimg.cn/39a17bf7e6f647568e234db27608af0a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

所以，现在统一使用客户端的AdminClient。

## 2 咋用？

Java客户端提供的工具，要在你工程中显式增加依赖，以2.3版本为例。

```xml
<dependency>
    <groupId>org.apache.kafka</groupId>
    <artifactId>kafka-clients</artifactId>
    <version>2.3.0</version>
</dependency>
```

```groovy
compile group: 'org.apache.kafka', name: 'kafka-clients', version: '2.3.0'
```

## 3 功能

2.3版的AdminClient支持：

1. 主题管理：包括主题创建、删除和查询
2. 权限管理：包括具体权限的配置与删除
3. 配置参数管理：包括Kafka各种资源的参数设置、详情查询。所谓的Kafka资源，主要有Broker、主题、用户、Client-id等
4. 副本日志管理：包括副本底层日志路径的变更和详情查询。
5. 分区管理：即创建额外的主题分区
6. 消息删除：即删除指定位移之前的分区消息
7. Delegation Token管理：包括Delegation Token的创建、更新、过期和详情查询
8. 消费者组管理：包括消费者组的查询、位移查询和删除
9. Preferred领导者选举：推选指定主题分区的Preferred Broker为领导者

## 4 工作原理

AdminClient是双线程设计：

- 前端主线程：将用户要执行的操作转换成对应请求，发到后端I/O线程的队列

- 后端I/O线程：从队列中读取相应请求，发到对应Broker节点，再把执行结果保存，待前端线程来获取


使用生产者-消费者模式将请求生成与处理解耦：

![](https://p.ipic.vip/81250j.png)

### 前端主线程

会创建名为Call的请求对象实例。该实例有两个主要的任务。

#### 构建对应的请求对象

如若要创建主题，那么就创建CreateTopicsRequest；如果是查询消费者组位移，就创建OffsetFetchRequest。

#### 指定响应的回调逻辑

如从Broker端接收到CreateTopicsResponse之后要执行的动作。一旦创建好Call实例，前端主线程会将其放入到新请求队列（New Call Queue）中，此时，前端主线程的任务就算完成了。它只需要等待结果返回即可。

剩下工作都是

### 后端I/O线程

该线程用3个队列来承载不同时期的请求对象：

- 新请求队列
- 待发送请求队列
- 处理中请求队列

为啥要用3个？目前新请求队列的线程安全是由Java monitor锁保证。为确保前端主线程不会因monitor锁被阻塞，后端I/O线程定期将新请求队列中的所有Call实例全部搬移到待发送请求队列中进行处理。图中的待发送请求队列和处理中请求队列只由后端I/O线程处理，因此无需任何锁机制保证线程安全。

当I/O线程在处理某请求时，它会显式将该请求保存在处理中请求队列。一旦处理完成，I/O线程会自动地调用Call对象中的回调逻辑完成最后的处理。把这些都做完之后，I/O线程会通知前端主线程说结果已经准备完毕，这样前端主线程能够及时获取到执行操作的结果。AdminClient是使用Java Object对象的wait和notify实现的这种通知机制。

 AdminClient没有用Java已有的队列去实现上面的请求队列，它用ArrayList、HashMap这样的简单容器类，再配monitor锁来保证线程安全的。但鉴于它们充当的角色就是请求队列，我还是坚持用队列来指代它们。

### AdminClient工作原理

好在它能帮助针对性地对调用AdminClient的程序调试。后端I/O线程名有前缀kafka-admin-client-thread。有时AdminClient貌似正常工作，但执行操作没返回结果或hang住，现在你该知道这可能因为I/O线程异常。碰到类似问题，不妨jstack看AdminClient程序，确认I/O线程是否正常。

这是社区bug。这问题根本原因，就是I/O线程未捕获某些异常导致意外“挂”掉。由于AdminClient是双线程设计，前端主线程不受任何影响，依然可正常接收用户发送的命令请求，但此时程序已不能正常工作。

## 5 构造和销毁AdminClient实例

如果你正确地引入了kafka-clients依赖，那么你应该可以在编写Java程序时看到AdminClient对象。**切记它的完整类路径是org.apache.kafka.clients.admin.AdminClient，而不是kafka.admin.AdminClient**。后者就是我们刚才说的服务器端的AdminClient，它已经不被推荐使用了。

创建AdminClient实例和创建KafkaProducer或KafkaConsumer实例的方法类似，需手动构造一个Properties对象或Map对象，然后传给对应方法。社区为AdminClient提供几十个专属参数，最常见且须显式指定的参数如 bootstrap.servers。

完整参数列表看[官网](https://kafka.apache.org/documentation/#adminclientconfigs)。如要销毁AdminClient实例，需显式调用AdminClient#close。

## 6 AdminClient实例的创建与销毁

```java
Properties props = new Properties();
props.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka-host:port");
props.put("request.timeout.ms", 600000);

try (AdminClient client = AdminClient.create(props)) {
         // 执行你要做的操作……
}
```

## 7 AdminClient应用

讲完了AdminClient的工作原理和构造方法，接下来，我举几个实际的代码程序来说明一下如何应用它。这几个例子，都是我们最常见的。

### 创建主题

首先，我们来看看如何创建主题，代码如下：

```scala
String newTopicName = "test-topic";
try (AdminClient client = AdminClient.create(props)) {
         NewTopic newTopic = new NewTopic(newTopicName, 10, (short) 3);
         CreateTopicsResult result = client.createTopics(Arrays.asList(newTopic));
         result.all().get(10, TimeUnit.SECONDS);
}
```

这段代码调用AdminClient的createTopics方法创建对应的主题。构造主题的类是NewTopic类，它接收主题名称、分区数和副本数三个字段。

注意这段代码倒数第二行获取结果的方法。目前，AdminClient各个方法的返回类型都是名为***Result的对象。这类对象会将结果以Java Future的形式封装起来。如果要获取运行结果，你需要调用相应的方法来获取对应的Future对象，然后再调用相应的get方法来取得执行结果。

当然，对于创建主题而言，一旦主题被成功创建，任务也就完成了，它返回的结果也就不重要了，只要没有抛出异常就行。

### 查询消费者组位移

接下来，我来演示一下如何查询指定消费者组的位移信息，代码如下：

```scala
String groupID = "test-group";
try (AdminClient client = AdminClient.create(props)) {
         ListConsumerGroupOffsetsResult result = client.listConsumerGroupOffsets(groupID);
         Map<TopicPartition, OffsetAndMetadata> offsets = 
                  result.partitionsToOffsetAndMetadata().get(10, TimeUnit.SECONDS);
         System.out.println(offsets);
}
```

和创建主题的风格一样，**我们调用AdminClient的listConsumerGroupOffsets方法去获取指定消费者组的位移数据**。

不过，对于这次返回的结果，我们不能再丢弃不管了，**因为它返回的Map对象中保存着按照分区分组的位移数据**。你可以调用OffsetAndMetadata对象的offset()方法拿到实际的位移数据。

### 获取Broker磁盘占用

获取某Broker上Kafka主题占用磁盘量。目前Kafka的JMX监控指标未提供该功能，而磁盘占用是很多Kafka运维需实时监控且重视。

好在可用AdminClient实现：

```scala
try (AdminClient client = AdminClient.create(props)) {
  				// 使用AdminClient#describeLogDirs获取指定Broker上所有分区主题的日志路径信息
         DescribeLogDirsResult ret = client.describeLogDirs(Collections.singletonList(targetBrokerId)); // 指定Broker id
         long size = 0L;
         for (Map<String, DescribeLogDirsResponse.LogDirInfo> logDirInfoMap : ret.all().get().values()) {
           				 // 然后把它们累积在一起，得出总磁盘占用量
                  size += logDirInfoMap.values().stream().map(logDirInfo -> logDirInfo.replicaInfos).flatMap(
                           topicPartitionReplicaInfoMap ->
                           topicPartitionReplicaInfoMap.values().stream().map(replicaInfo -> replicaInfo.size))
                           .mapToLong(Long::longValue).sum();
         }
         System.out.println(size);
}
```