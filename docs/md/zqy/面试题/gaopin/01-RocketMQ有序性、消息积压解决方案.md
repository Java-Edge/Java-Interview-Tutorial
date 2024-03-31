# 01-RocketMQ有序性、消息积压解决方案.md
## RocketMQ 如何保证消息有序？

RocketMQ 保证消息的有序性分为了两种：

- **全局有序：** 适用于并发度不大，并且对消息要求严格一致性的场景下

  通过创建一个 topic，并且该 topic 下只有一个队列，那么生产者向着一个队列中发消息，消费者也在这一个队列中消费消息，来保证消息的有序性

- **局部有序：** 适用于对性能要求比较高的场景，在设计层面将需要保证有序的消息放在 Topic 下的同一个队列即可保证有序

那么一般情况下，我们只需要保证局部有序即可，那么为了保证局部有序，可以在发送消息时，指定一个 **MessageSelector** 对象，来指定消息发送到哪一个 Message Queue 中去，将需要保证有序的消息发送到同一个 Message Queue 来保证消息的局部有序性



**这里说一下如何保证消息的局部有序：**

将需要保证有序的消息放在 Topic 下的同一个 Message Queue 即可，如下图：

![1702709559999](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1702709559999.png)

代码如下，在发送消息的时候，指定 **MessageSelector 对象** 来将需要保证有序的消息发送到同一个队列中去即可：

```java
/**
 * 这里发送消息的时候，根据 orderId 来选择对应发送的队列
 */
producer.send(msg, new MessageQueueSelector() {
    @Override
    public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
        int orderId = (int)arg;
        int idx = orderId % mqs.size();
        return mqs.get(idx);
    }
}, order.orderId);
```

上边在 **发送消息时保证了消息的有序性** ，那么在 **消费消息** 时也需要保证消息的有序消费，RocketMQ 的 MessageListener 回调函数提供了两种消费模式：

- **有序消费：** MessageListenerOrderly
- **并发消费：** MessageListenerConcurrently

为了保证有序消费，需要保证消费者注册 **MessageListenerOrderly** 的回调函数，来实现 **顺序消费**

上边两种消费方式都是使用线程池去消费消息，只不过在 **MessageListenerOrderly** 通过分布式锁和本地锁来保证同时只有一条线程去队列中消费数据，以此来保证顺序消费



但是使用了 MessageListenerOrderly 顺序消费会导致 **两个问题：**

- 使用了锁，导致吞吐量下降
- 前一个消息阻塞时，会导致后边消息都被阻塞。因此如果消息消费失败，要设置好最大重试





## RocketMQ 消息积压如何处理？

### 事发时处理

RocketMQ 发生了消息积压， **事发时** 一般有两种处理方式：

- **增加消费者的数量：** 如果 Topic 下的 Message Queue 有很多，可以通过 **增加消费者的数量** 来处理消息积压，如果 Topic 下的 Message Queue 有很多，那么每个消费者是会分配一个或多个 Message Queue 进行消费的，那么此时就可以通过增加消费者的数量，来加快该 Topic 中消息的消费速度
- **新建 Topic 进行消息迁移：** 如果 Topic 下的 Message Queue 很少， 那么此时增加消费者的数量也没有用了，可以临时 **新创建一个 Topic** ，并且将该 Topic 的 Message Queue 设置多一点，再新创建一组消费者将原 Topic 中的消息转发到新 Topic 中，此时就可以对新 Topic 采用增加消费者数量的方式来处理消息积压了



**如何增加消费者的数量：**

增加消费者的数量的话，可以通过 **增加机器** 或者在已有的机器上 **启动新的进程** 来实现

这里增加消费者的数量是有依据的，比如一个 Topic 下有 8 个 MessageQueue，那么最多将消费者数量增加到 8 个，因为 Topic 下一个队列只可以被同一消费者组的一个消费者消费，如果消费者的数量比 Topic 下的队列数量多的话，会有部分消费者分不到队列，因此消费者数量最多和 Topic 下的队列数量相同



上边说了增加消费者的数量来处理消息积压，还可以通过 **提高单个消费者的消费能力** ，来尽快处理消息，避免消息积压

**如何提高单个消费者的并发线程数：**

提高单个消费者的消费并发线程，在 5.x 之前可以通过修改 DefaultMQPushConsumer 类中的 **consumeThreadMin** 、**consumeThreadMax** 来提高单个消费者的并发能力（调整消费者的线程池的线程数量），在 5.x 版本可以通过**PushConsumerBuilder.setConsumptionThreadCount()** 设置线程数，SimpleConsumer可以由业务线程自由增加并发，底层线程安全





### 针对消息积压问题，提前预防

提前预防的话，主要可以从以下几个方面来考虑：

- **生产者**

对于生产者，可以进行限流，并且评估 Topic 峰值流量，合理设计 Topic 下的队列数量，添加异常监控，及时发现

- **存储端**

可以将次要消息转移

- **消费者**

对于消费者来说，可以进行 **降级** 处理：将消息先落库，再去异步处理

并且要合理地根据 Topic 的队列数量和应用性能来部署响应的消费者机器数量

- **上线前**

在上线前，采用灰度发布，先灰度小范围用户进行使用，没问题之后，再全量发布



