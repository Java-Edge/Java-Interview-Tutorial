# 1 为什么需要消息有序
996 一年终于攒了十万存在银行卡里准备存取款，对应两个异步的短信消息，要保证先存后取：
- M1 - 存钱
- M2 - 取钱
![](https://img-blog.csdnimg.cn/20191110204432867.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

而MQ默认发消息到不同queue显然是行不通的，会乱序。因此，需要发往同一queue，依靠其先进先出机制。

# 2 基本概念
有序消息又叫顺序消息(FIFO 消息)，指消息的消费顺序和产生顺序相同。

比如订单的生成、付款、发货，这串消息必须按顺序处理。
顺序消息又分为如下：
## 2.1 全局顺序
一个Topic内所有的消息都发布到同一个queue，按照FIFO顺序进行发布和消费：
![](https://img-blog.csdnimg.cn/20191110205132371.png)

### 适用场景
性能要求不高，所有消息严格按照FIFO进行消息发布和消费的场景。

## 2.2 分区顺序
对于指定的一个Topic，所有消息按`sharding key`进行区块(queue)分区，同一queue内的消息严格按FIFO发布和消费。

- Sharding key是顺序消息中用来区分不同分区的关键字段，和普通消息的Key完全不同。
![](https://img-blog.csdnimg.cn/20191110205442842.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

### 适用场景
性能要求高，根据消息中的sharding key去决定消息发送到哪个queue。

## 2.3 对比
- 发送方式对比
![](https://img-blog.csdnimg.cn/20191110210418100.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

# 3 如何保证消息顺序？
在MQ模型中，顺序需由3个阶段去保障
1. 消息被发送时保持顺序
2. 消息被存储时保持和发送的顺序一致
3. 消息被消费时保持和存储的顺序一致

![](https://img-blog.csdnimg.cn/20191110210708395.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

# 4 RocketMQ 有序消息实现原理
![](https://img-blog.csdnimg.cn/20191110210921254.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

RocketMQ消费端有两种类型：
- MQPullConsumer
- MQPushConsumer
![](https://img-blog.csdnimg.cn/20201114141638859.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

底层都是通过pull机制实现，pushConsumer是一种API封装而已。
- `MQPullConsumer` 由用户控制线程，主动从服务端获取消息，每次获取到的是一个`MessageQueue`中的消息。
	- `PullResult`中的 `List<MessageExt> msgFoundList`
![](https://img-blog.csdnimg.cn/20201114142006113.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

- `MQPushConsumer`由用户注册`MessageListener`来消费消息，在客户端中需要保证调用`MessageListener`时消息的顺序性
![](https://img-blog.csdnimg.cn/20191110212543478.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191110212631690.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

看源码
![](https://img-blog.csdnimg.cn/20191110212737291.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191110212759611.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191110212955469.png)
- 拉取生产端消息
![](https://img-blog.csdnimg.cn/20191110213124288.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 判断是并发的还是有序的,对应不同服务实现类
![](https://img-blog.csdnimg.cn/20191110213603167.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

# 5 有序消息的缺陷
发送顺序消息无法利用集群的Failover特性，因为不能更换MessageQueue进行重试。

因为发送的路由策略导致的热点问题，可能某一些MessageQueue的数据量特别大
- 消费的并行读依赖于queue数量
- 消费失败时无法跳过