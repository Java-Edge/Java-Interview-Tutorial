# RocketMQ实战(03)-消息的有序性

## 1 为什么需要消息有序

去银行存取款，对应两个异步短信消息，要保证先存后取：
- M1 存钱
- M2 取钱
![](https://img-blog.csdnimg.cn/20191110204432867.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

而MQ默认发消息到不同Q显然是行不通的，会乱序。因此，需发往同一Q，依赖队列的FIFO。
## 2 基本概念
顺序消息(FIFO消息)，指消息的消费顺序和产生顺序相同。如订单的生成、付款、发货，这串消息须按序处理。

### 2.1 全局顺序
一个Topic内所有的消息都发布到同一Q，FIFO进行发布和消费：
![](https://img-blog.csdnimg.cn/20191110205132371.png)

#### 适用场景
性能要求不高，所有消息严格FIFO进行消息发布和消费。
### 2.2 分区顺序
对于指定的一个Topic，所有消息按`sharding key`进行区块(queue)分区，同一Q内的消息严格按FIFO发布和消费。

- Sharding key是顺序消息中用来区分不同分区的关键字段，和普通消息的Key完全不同。
![](https://img-blog.csdnimg.cn/20191110205442842.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
#### 适用场景
性能要求高，根据消息中的sharding key决定消息发送到哪个queue。
### 2.3 对比
![](https://img-blog.csdnimg.cn/20191110210418100.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
## 顺序消费的难点

### Pro角度

对Pro，RocketMQ默认情况下不保障顺序，RocketMQ支持多Topic，每个Topic支持划分不同Q，若消息生产时：

- 落到不同Topic
- 或相同Topic的不同Queue

就无法仅依赖MQ保障时序，需消费端处理，需要消费端做消息重排，类似TCP窗口。

### Con

消息生产到特定Queue中，消费者在消费消息时，也可能并发消费，导致乱序消费。

### 架构角度

可能导致乱序：

- 基于NameServer-Broker的架构模式，若消费者链接到不同NameServer，这些NameServer对Broker的状态理解不一致
- 消费端或broker端抖动，导致重平衡

### 其它

- 运维调整，调整Topic，Queue，扩容
- 不同机器环境差异，比如CPU，内存，磁盘，网络差异，导致不同broker上queue的处理速度不同

## 3 如何保证消息顺序？

### 3.1 顺序消费前提

设置MQ模式：

- 全局有序：单topic，单queue模式
- 部分有序：单topic，多queue模式，确保对某个对象的消息在同一个Q

### 3.2 生产者端保障写入有序

- 单头写
- 多头写，保障多头之间有顺序控制

```java
DefaultMQProducer producer = new DefaultMQProducer("please_rename_unique_group_name");
            producer.setNamesrvAddr(":9876");
            producer.start();

            //String[] tags = new String[] {"TagA", "TagB", "TagC", "TagD", "TagE"};
            String[] tags = new String[] {"TagA"};
            for (int i = 0; i < 5; i++) {
                int orderId = i % 10;
                Message msg =
                    new Message("TopicTest", tags[i % tags.length], "KEY" + i,
                        ("Hello RocketMQ " + i).getBytes(RemotingHelper.DEFAULT_CHARSET));

                // 选择对应的Queue，控制消息发往哪个Queue
                SendResult sendResult = producer.send(msg, new MessageQueueSelector() {
                    @Override
                    public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
                        Integer id = (Integer) arg;
                        int index = id % mqs.size();
                        index = 0;
                        return mqs.get(index);
                    }
                }, orderId);

                System.out.printf("%s%n", sendResult);
            }
```

### 消费端顺序消费

消费端要设置消息模式为clustering，且使用`MessageListenerOrderly`类，解决消费者拉取到消息后并发消费case。跟并发消费类`MessageListenerConcurrently`类的几个核心差别。

#### offset的维护

```java
switch (this.defaultMQPushConsumer.getMessageModel()) {
      case BROADCASTING:
           // 广播模式，本地维护，每个消费者都可拿到一份消息
           this.offsetStore = new LocalFileOffsetStore(this.mQClientFactory, this.defaultMQPushConsumer.getConsumerGroup());
           break;
      case CLUSTERING:
           // 集群模式，broker维护，每个消费者只能消费一份消息
           this.offsetStore = new RemoteBrokerOffsetStore(this.mQClientFactory, this.defaultMQPushConsumer.getConsumerGroup());
           break;
      default:
           break;
}
```

在MQ模型中，顺序由3个阶段保障
1. 消息被发送时保持顺序：
2. 消息被存储时保持和发送的顺序一致
3. 消息被消费时保持和存储的顺序一致
    ![](https://img-blog.csdnimg.cn/20191110210708395.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

## 4 实现原理

## 4.1 结构

![](https://img-blog.csdnimg.cn/20191110210921254.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

Pro发消息时，把消息发到同一队列（queue），Con注册消息监听器为MessageListenerOrderly，就能保证消费端只有一个线程去消费消息。

是把消息发到同一队列（queue），而非同一topic，默认情况下，一个topic包括4个queue。

RocketMQ消费端有两种类型：

- MQPullConsumer
- MQPushConsumer
![](https://img-blog.csdnimg.cn/20201114141638859.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

底层都是通过pull机制实现，pushConsumer只是一种API封装。
- `MQPullConsumer` 由用户控制线程，主动从服务端获取消息，每次获取到的是一个`MessageQueue`中的消息。
	- `PullResult`中的 `List<MessageExt> msgFoundList`
	![](https://img-blog.csdnimg.cn/20201114142006113.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

- `MQPushConsumer`由用户注册`MessageListener`来消费消息，在客户端中需要保证调用`MessageListener`时消息的顺序性
![](https://img-blog.csdnimg.cn/20191110212543478.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191110212631690.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

### Pro

```java
import java.io.UnsupportedEncodingException;
import java.util.List;
import org.apache.rocketmq.client.exception.MQBrokerException;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.apache.rocketmq.client.producer.MQProducer;
import org.apache.rocketmq.client.producer.MessageQueueSelector;
import org.apache.rocketmq.client.producer.SendResult;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.common.message.MessageQueue;
import org.apache.rocketmq.remoting.common.RemotingHelper;
import org.apache.rocketmq.remoting.exception.RemotingException;

public class Producer {
    public static void main(String[] args) throws UnsupportedEncodingException {
        try {
            MQProducer producer = new DefaultMQProducer("please_rename_unique_group_name");
            producer.start();

            String[] tags = new String[] {"TagA", "TagB", "TagC", "TagD", "TagE"};
            for (int i = 0; i < 100; i++) {
                int orderId = i % 10;
                Message msg =
                    new Message("TopicTestjjj", tags[i % tags.length], "KEY" + i,
                        ("Hello RocketMQ " + i).getBytes(RemotingHelper.DEFAULT_CHARSET));
                SendResult sendResult = producer.send(msg, new MessageQueueSelector() {
                    @Override
                    public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
                        Integer id = (Integer) arg;
                        int index = id % mqs.size();
                        return mqs.get(index);
                    }
                }, orderId);

                System.out.printf("%s%n", sendResult);
            }

            producer.shutdown();
        } catch (MQClientException | RemotingException | MQBrokerException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```
### Con
```java
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;
import org.apache.rocketmq.client.consumer.listener.ConsumeOrderlyContext;
import org.apache.rocketmq.client.consumer.listener.ConsumeOrderlyStatus;
import org.apache.rocketmq.client.consumer.listener.MessageListenerOrderly;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.common.consumer.ConsumeFromWhere;
import org.apache.rocketmq.common.message.MessageExt;

public class Consumer {

    public static void main(String[] args) throws MQClientException {
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("please_rename_unique_group_name_3");

        consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_FIRST_OFFSET);

        consumer.subscribe("TopicTest", "TagA || TagC || TagD");

        consumer.registerMessageListener(new MessageListenerOrderly() {
            AtomicLong consumeTimes = new AtomicLong(0);

            @Override
            public ConsumeOrderlyStatus consumeMessage(List<MessageExt> msgs, ConsumeOrderlyContext context) {
                context.setAutoCommit(false);
                System.out.printf(Thread.currentThread().getName() + " Receive New Messages: " + msgs + "%n");
                this.consumeTimes.incrementAndGet();
                if ((this.consumeTimes.get() % 2) == 0) {
                    return ConsumeOrderlyStatus.SUCCESS;
                } else if ((this.consumeTimes.get() % 3) == 0) {
                    return ConsumeOrderlyStatus.ROLLBACK;
                } else if ((this.consumeTimes.get() % 4) == 0) {
                    return ConsumeOrderlyStatus.COMMIT;
                } else if ((this.consumeTimes.get() % 5) == 0) {
                    context.setSuspendCurrentQueueTimeMillis(3000);
                    return ConsumeOrderlyStatus.SUSPEND_CURRENT_QUEUE_A_MOMENT;
                }

                return ConsumeOrderlyStatus.SUCCESS;
            }
        });

        consumer.start();
        System.out.printf("Consumer Started.%n");
    }

}
```

### 4.2 源码

![](https://img-blog.csdnimg.cn/20191110212737291.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191110212759611.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191110212955469.png)

拉取生产端消息
![](https://img-blog.csdnimg.cn/20191110213124288.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

判断是并发的还是有序，对应不同服务实现类

```java
if (this.getMessageListenerInner() instanceof MessageListenerOrderly) {
                    this.consumeOrderly = true;
                    this.consumeMessageService =
                        new ConsumeMessageOrderlyService(this, (MessageListenerOrderly) this.getMessageListenerInner());
                } else if (this.getMessageListenerInner() instanceof MessageListenerConcurrently) {
                    this.consumeOrderly = false;
                    this.consumeMessageService =
                        new ConsumeMessageConcurrentlyService(this, (MessageListenerConcurrently) this.getMessageListenerInner());
                }
```

## 5 缺陷

无法利用集群的Failover特性，因为不能更换MessageQueue进行重试。

因为发送的路由策略导致的热点问题，可能某些MessageQueue的数据量特别大
- 消费的并行读依赖于queue数量
- 消费失败时无法跳过

参考：

- [RocketMQ顺序消费 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/585080971)
