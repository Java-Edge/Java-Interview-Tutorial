# 1   Producer
1. 一个应用尽可能用一个Topic,消息子类型用tags来标识，tags可以由应用自由设置

只有发送消息设置了tags,消费方在订阅消息时，才可以利用tags在broker做消息过滤
```java
message.setTags("TagA"); 
```

2. 如有可靠性需要，消息发送成功或者失败，要打印消息日志(sendresult和key信 息)

3. 如果相同性质的消息量大，使用批量消息，可以提升性能

4. 建议消息大小不超过512KB

5. send(msg)会阻塞，如果有性能要求，可以使用异步的方式: send(msg, callback)

6. 如果在一个JVM中，有多个生产者进行大数据处理，建议:
● 少数生产者使用异步发送方式(3~5个就够了)
● 通过setInstanceName方法，给每个生产者设置一个实例名

7. send消息方法，只要不抛异常，就代表发送成功 , 但是发送成功会有多个状态， 在`sendStatus`类里定义
![](https://img-blog.csdnimg.cn/20191111014711180.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
● SEND_ OK : 消息发送成功
● FLUSH_ DISK_ _TIMEOUT: 消息发送成功， 但是服务器刷盘超时，消息已经进入
服务器队列，只有此时服务器宕机，消息才会丢失
● FLUSH_ SLAVE_ TIMEOUT: 消息发送成功，但是服务器同步到Slave时超时,
消息已经进入服务器队列，只有此时服务器宕机，消息才会丢失
● SLAVE_ NOT_ AVAILABLE: 消息发送成功， 但是此时slave不可用， 消息已经进入服务器队列，只有此时服务器宕机，消息才会丢失

● 如果状态是FLUSH_ DISK_ _TIMEOUT或FLUSH_ SLAVE_ _TIMEOUT,并且Broker正好关闭
此时，可以丢弃这条消息，或者重发。但建议最好重发，由消费端去重

● Producer向Broker发送请求会等待响应，但如果达到最大等待时间，未得到响应，则客户端将抛出RemotingTimeoutException
● 默认等待时间是3秒，如果使用send(msg, timeout),则可以自己设定超时时间,
但超时时间不能设置太小，应为Borker需要一些时间来刷新磁盘或与从属设备同步
● 如果该值超过syncFlushTimeout,则该值可能影响不大，因为Broker可能会在超时之前返回FLUSH_ SLAVE_ TIMEOUT或FLUSH_ SLAVE_ TIMEOUT的响应

![](https://img-blog.csdnimg.cn/20191111014958681.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

8. 对于消息不可丢失应用，务必要有消息重发机制
Producer的send方法本身支持内部重试:
● 至多重试3次
● 如果发送失败，则轮转到下一-个Broker
● 这个方法的总耗时时间不超过sendMsgTimeout设置的值，默认10s
所以，如果本身向broker发送消息产生超时异常,就不会再做重试

> 以上策略仍然不能保证消息一定发送成功，为保证消息一定成功，建议将消息存储到db,由后台线程定时重试，保证消息一定到达Broker

# 2  Consumer
每个消息在业务层面的唯一标识码，要设置到keys字段，方便将来定位消息丢失问题

服务器会为每个消息创建索引(哈希索引)，应用可以通过topic, key来查询这条消息内容,以及消息被谁消费

由于是哈希索引，请务必保证key尽可能唯一,这样可以避免潜在的哈希冲突

```java
String orderld =“1250689524981";
message.setKeys(orderld);
```

console客户端使GUI
![](https://img-blog.csdnimg.cn/20191111010735138.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- mvn clean package -Dmaven.test.skip=true![](https://img-blog.csdnimg.cn/20191111013815328.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
```bash
--server.port=8081 --rocketmq.config. namesrvAddr=192.168.1.17:9876
```
![](https://img-blog.csdnimg.cn/20191111014401856.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- http://localhost:8081/#/![](https://img-blog.csdnimg.cn/2019111101415789.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
## 2.1 消费者组和订阅
不同的消费群体可以独立地消费同样的主题，并且每个消费者都有自己的消费偏移量(offsets) 。

确保同一组中的每个消费者订阅相同的主题

## 2.2 消息监听器(MessageListener)
### 2.2.1 顺序 (Orderly)
消费者将锁定每个MessageQueue,以确保每个消息被一个按顺序使用。
这将导致性能损失

如果关心消息的顺序时，它就很有用了。不建议抛出异常，可以返回
ConsumeOrderlyStatus. SUSPEND_ CURRENT_ QUEUE_ A_ MOMENT代替

### 2.2.2 消费状态(Consume Status)
![](https://img-blog.csdnimg.cn/20191111021304691.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
对于MessageListenerConcurrently,可以返回RECONSUME_ LATER告诉消费者，当前不能消费它并且希望以后重新消费。然后可以继续使用其他消息

![](https://img-blog.csdnimg.cn/20191111021407679.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
对于MessageListenerOrderly, 如果关心顺序，就不能跳过消息，可以返回*SUSPEND_ CURRENT_ QUEUE_ A_ MOMENT*来告诉消费者等待片刻。

### 阻塞(Blocking)
不建议阻塞Listener,因为它会阻塞线程池，最终可能会停止消费程序

### 线程数
`DefaultMQPushConsumer`
消费者使用一个ThreadPoolExecutor来处理内部的消费，因此可以通过设
置
![](https://img-blog.csdnimg.cn/20191111022201651.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)更改它

### 从何处开始消费
● 当建立一个新的Consumer Group时，需要决定是否需要消费Broker中已经
存在的历史消息。
● CONSUME_ _FROM_ LAST_ OFFSET将忽略历史消息，并消费此后生成的任何
内容。
● CONSUME_ FROM_ FIRST_ OFFSET将消耗Broker中存在的所有消息。还可以使用CONSUME_ FROM_ TIMESTAMP 来消费在指定的时间戳之后生成的消息。

### 重复(幂等性)
RocketMQ无法避免消息重复，如果业务对重复消费非常敏感，务必在业务层面做去重:
● 通过记录消息唯一键进行去重
● 使用业务层面的状态机制去重

# 3 最佳实践之 NameServer
在Apache RocketMQ中，NameServer用于协调分布式系统的每个组件，主要通过管理`主题路由信息`来实现协调。

`管理由两部分组成:`
1. Brokers定期更新保存在每个名称服务器中的元数据
2. 名称服务器是为客户端提供最新的路由信息服务的，包括生产者、消费者和命令行客户端。

因此，在启动brokers和clients之前，我们需要告诉他们如何通过给他们提
供的一个名称服务器地址列表来访问名称服务器。

在Apache RocketMQ中，可以用四种方式完成。

## 3.1 编程方式
- 对于brokers,我们可以在broker的配置文件中指定
```
namesrvAddr=name-server-ip1:port;name-server-ip2:port
```
- 对于生产者和消费者，我们可以给他们提供姓名服务器地址列表如下:
```
DefaultMQProducer producer = new DefaultMQProducer(" please_ rename_ unique_ group name");
producer.setNamesrvAddr("name-server1-ip:port;name-server2-ip:port"); 
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer(" please_ rename_ unique_ _group_ name");
consumer.setNamesrvAddr(" name-server1-ip:port;name-server2-ip:port");
```
- 如果从shell中使用管理命令行，也可以这样指定:
```
sh mqadmin command-name -n name-server-ip1:port;name-server-ip2:port -X OTHER-OPTION
```

- 一个简单的例子，在NameServer节点上查询集群信息:
```
sh mqadmin -n localhost:9876 clusterList
```
- 如果将管理工具集成到自己的项目中，可以这样
```
DefaultMQAdminExt defaultMQAdminExt = new DefaultMQAdminExt(" please_ rename_ _unique_ group_ _name");
defaultMQAdminExt.setNamesrvAddr("name-server1-ip:port;name-server2-ip:port");
```

## 3.2 Java参数
NameServer的地址列表也可以通过java参数`rocketmq.namesrv.addr`
在启动之前指定

## 3.3 环境变量
可以设置NAMESRV_ ADDR环境变量。如果设置了，Broker和clients将检 查并使用其值

## 3.4 HTTP端点(HTTP Endpoint)
如果没有使用前面提到的方法指定NameServer地址列表，Apache RocketMQ将每2分钟发送一次HTTP请求，以获取和更新NameServer地址列表，初始延迟10秒。

默认情况下，访问的HTTP地址是:
```
http://jmenv.tbsite.net:8080/rocketmq/nsaddr
```
通过Java参数rocketmq.namesrv.domain,可以修改jmenv.tbsite.net
通过Java参数rocketmq.namesrv.domain.subgroup,可以修改nsaddr

## 3.5 优先级
编程方式> Java参数>环境变量> HTTP方式
# 4 JVM与Linux内核配置
## 4.1 JVM配置
推荐使用JDK 1.8版本，使用服务器编译器和8g堆。
设置相同的Xms和Xmx值，以防止JVM动态调整堆大小以获得更好的性能。

简单的JVM配置如下所示:
```
-server -Xms8g -Xmx8g -Xmn4g
```
如果不关心Broker的启动时间，可以预先触摸Java堆，以确保在JVM初始化期间分配页是更好的选择。
```
-XX:+AlwaysPreTouch
```
- 禁用偏置锁定可能会减少JVM暂停:
```
-XX: UseBiasedL ocking
```
- 对于垃圾回收，建议使用G1收集器:
```
-XX:+UseG1GC -XX:G1HeapRegionSize= 16m -XX:G lReservePercent=25 -XX:InitiatingHeapOccupancyPercent=30
```
这些GC选项看起来有点激进,但事实证明它在生产环境中具有良好的性能。

-XX:MaxGCPauseMillis不要设置太小的值，否则JVM将使用一个小的新生代，这将导致非常频繁的新生代GC。

- 推荐使用滚动GC日志文件:
```
-XX:+UseGCLogFileRotation -Xx:NumberOfGCLogFiles=5 -XX:GCLogFileSize=30m
```
- 如果写入GC文件会增加代理的延迟，请将重定向GC日志文件考虑在内存文件系统中:
```
-Xloggc:/dev/shm/mq_ gc. _%p.log
```

## 4.2 Linux内核配置
- 在bin目录中，有一个os.sh脚本列出了许多内核参数，只需要稍微的修改，就可以用于生产环境。
- 以下参数需要注意，详细信息请参考
https://www.kernel.org/doc/Documentation/sysctl/vm.txt