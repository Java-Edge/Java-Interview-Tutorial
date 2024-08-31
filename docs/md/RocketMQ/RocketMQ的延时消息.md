# RocketMQ的延时消息

注意，本文基于 RocketMQ 4.9.4
## 1 基本概念

定时消息是指消息发到Broker后，不能立刻被Consumer消费，要到特定时间点或等待特定的时间后才能被消费。

若要支持任意时间精度，在Broker层须做消息排序，若再涉及
持久化，则消息排序不可避免产生巨大开销。

RocketMQ支持定时消息，但不支持任意时间精度，支持特定的level，如定时5s，10s， 1m等。

## 2 延迟级别

![](https://img-blog.csdnimg.cn/20191110221833832.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)



```java
private String messageDelayLevel = "1s 5s 10s 30s 1m 2m 3m 4m 5m 6m 7m 8m 9m 10m 20m 30m 1h 2h";
```

可在 Broker 端通过 `messageDelayLevel` 参数进行配置。RocketMQ 定时消息受 CommitLog 保存时间限制。即若 CommitLog 最长保存 3 天（默认），那么延迟时间最长为 3 天。

## 3 Pro

发消息时，在消息属性中设置延迟等级：

![](https://img-blog.csdnimg.cn/20191110221959154.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

```java
// 在Producer端设置消息为定时消息
Message msg = new Message();
msg.setTopic("TopicA");
msg.setTags("Tag");
msg.setBody("this is a delay message".getBytes());
// 设置延迟level为5，对应延迟1分钟
msg.setDelayTimeLevel(5);
producer.send(msg);
```



## 4 Broker

1. Broker 初始化时会创建一个 Topic，专门存放延迟消息。该 Topic 默认有 18（延迟等级个数）个 Queue

2. Broker 启动时，为每个延迟等级都创建一个处理线程。该线程扫描对应的延迟等级 Queue。

3. Broker 收到消息后，查看属性中是否有延迟等级信息。如果有，则将该消息的 Topic 和 QueueId 分别替换成延迟消息对应的 Topic 和延迟等级对应的 QueueId。

   然后将消息真正的 Topic 和 QueueId 放到消息的 properties 属性中

   最后将消息保存到磁盘。

4. 延迟消息保存后，会在其 ConsumeQueue 生成索引（上面说过，每个延迟等级都有一个 Queue）

5. 延迟等级处理线程周期性扫描对应的延迟等级 ConsumeQueue 中是否有到期的消息，如果有则将消息真正的 Topic 和 QueueId 恢复，然后重新投递，如果没有则继续循环扫描

## 5 消费者

当延迟消息被延迟等级处理线程重新投递后，消费者可消费到该消息：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/ee932022dc199db4c1af28f2103ebfba.png)

## 6 相关类

### SCHEDULE_TOPIC_XXXX

```java
package org.apache.rocketmq.common.topic;

public class TopicValidator {

    public static final String RMQ_SYS_SCHEDULE_TOPIC = "SCHEDULE_TOPIC_XXXX";
}
```

系统Topic，Broker启动时自动创建，专门保存还没有到投递时间的定时消息。系统级Topic无法被Con消费，所以在被重新投递前，Con也就无法消费到未到期的定时消息。

默认的18 个 Queue，对应 18 个延迟等级。每个 Queue 都保存所有对应延迟等级的定时消息。

```java
package org.apache.rocketmq.broker.topic;

public class TopicConfigManager extends ConfigManager {
  
    private static final int SCHEDULE_TOPIC_QUEUE_NUM = 18;
}
```

这么设计的原因：延迟消息每个消息的投递时间不确定，Broker端需将消息根据投递时间排序后投递。而只支持指定时间延迟，并为每个延迟等级设计单独的 Queue，就是为了解决消息排序。这样一来，每个 Queue 中的消息都是按消息产生的时间顺序发送的。

### CommitLog

RocketMQ 消息存储的实现。定时消息功能中，其负责在保存消息时将原消息的 Topic 和 QueueId 替换成定时消息对应的 Topic 和 QueueId。

`putMessage() / AsyncPutMessage()`：同步和异步的消息存储函数，Broker 收到消息后存储消息时调用。

```java
public class CommitLog {
  ...
    
  // Delay Delivery
  // 存盘之前，检查消息属性，判断是否是定时消息
  if (msg.getDelayTimeLevel() > 0) {
      if (msg.getDelayTimeLevel() > this.defaultMessageStore.getScheduleMessageService().getMaxDelayLevel()) {
          msg.setDelayTimeLevel(this.defaultMessageStore.getScheduleMessageService().getMaxDelayLevel());
      }

      topic = TopicValidator.RMQ_SYS_SCHEDULE_TOPIC;
      // 直接使用延时级别作为队列 id
      int queueId = ScheduleMessageService.delayLevel2QueueId(msg.getDelayTimeLevel());

      // 备份原真实topic和queueId，将消息真正的 Topic 和 QueueId 存放到消息 `properties`属性
      MessageAccessor.putProperty(msg, MessageConst.PROPERTY_REAL_TOPIC, msg.getTopic());
      MessageAccessor.putProperty(msg, MessageConst.PROPERTY_REAL_QUEUE_ID, String.valueOf(msg.getQueueId()));
      msg.setPropertiesString(MessageDecoder.messageProperties2String(msg.getProperties()));
      // 替换成定时消息对应的 Topic
      msg.setTopic(topic);
      // 替换成定时消息对应的 QueueId
      msg.setQueueId(queueId);
  }
  ...
}
```

将消息存储。之后会根据存储的消息构建消息的索引文件 ConsumeQueue 和 IndexFile

重投递时，会计算出消息的真正投递时间，保存到 ConsumeQueue 索引的 `tagsCode` 位置。

### ConsumeQueue

RocketMQ的消费队列，用于消费者消费消息。每个队列元素是一个消息的索引，该索引主要包含消息在 CommitLog 中的偏移量。

消费者消费时查询 ConsumeQueue，一旦发现新的索引项，就可以用该项中的偏移量从 CommitLog 中找到消息并消费。

### ScheduleMessageService

实现定时消息延迟投递主要逻辑。

为每个延迟等级的 Queue 创建一个线程，该线程循环扫描对应的 Queue，如果发现到投递时间的消息，则把消息的 Topic 和 QueueId 恢复，然后重新投递到 CommitLog 中。

这个类扩展了 `ConfigManager`，`ConfigManager` 提供了管理一个配置文件的功能，包含配置文件持久化的函数和重新加载配置文件到内存的函数。

```java
// 每个延迟等级扫描的逻辑 offset，会被作为配置文件保存，在启动时从磁盘中加载。
private final ConcurrentMap<Integer /* level */, Long/* offset */> offsetTable =
    new ConcurrentHashMap<Integer, Long>(32);
```

#### start()



```java
public class DefaultMessageStore implements MessageStore {
  ...
  @Override
  public void handleScheduleMessageService(final BrokerRole brokerRole) {
      if (this.scheduleMessageService != null) {
          if (brokerRole == BrokerRole.SLAVE) {
              this.scheduleMessageService.shutdown();
          } else {
              // Broker 不为 `SLAVE` 时，在 Broker 启动时运行
              this.scheduleMessageService.start();
          }
      }

  }
}
```

1. 从磁盘中加载`offsetTable`
  2. 为每个延迟等级创建一个`DeliverDelayedMessageTimerTask`，用于周期性扫描延迟等级的消息，将到期的消息重新投递
  3. 创建一个周期性定时任务，定时将`offsetTable`持久化

`Timer timer`：最初 RocketMQ 使用 Java  `Timer` 来执行定时任务，但 Timer 内部只有一个线程同步执行，无法同时投递多个延迟等级的消息。(PR#3287)[https://github.com/apache/rocketmq/pull/3287] 中替换成 `ScheduledExecutorService`，用以提高定时消息重投递的性能。

### DeliverDelayedMessageTimerTask

`ScheduleMessageService`的内部类，扩展了 `TimerTask`，用以被 `Timer` 定时调用。（后改成 Runnable，用以被`ScheduledExecutorService`定时调用）

每个该类对应一个延迟等级的 Queue，负责周期性扫描该 Queue 中是否有到期消息，如果有则将到期消息都投递到 CommitLog，如果没有则等待 0.1s 继续下次扫描。

- `run()`：执行入口，这里没有用 while 循环或者是周期性定时任务来周期执行，而是每次 `run()` 里面都会执行一个新的定时任务（`DeliverDelayedMessageTimerTask`），以此来达到周期性执行该任务的效果。
- `executeOnTimeup()`：扫描消息并且检查是否到投递时间的主要逻辑都在这个函数里面，由`run()`调用

### 定时消息时序图

```txt
@startuml
participant DefaultMessageStore
participant CommitLog
participant ConsumeQueue
participant ScheduleMessageService

DefaultMessageStore -> CommitLog++: putMessage/putMessageAsync

CommitLog -> CommitLog: Modify Topic to SCHEDULE_TOPIC_XXXX \n Modify Queueld to DelayLevel - 1


CommitLog -> CommitLog: Save message to CommitLog
CommitLog --> DefaultMessageStore--: return
DefaultMessageStore -> ConsumeQueue++: dispatch

ConsumeQueue -> ConsumeQueue: Save message to ConsumeQueue
ConsumeQueue --> DefaultMessageStore--: return

ScheduleMessageService -> ConsumeQueue : DeliverDelayedMessageTimerTask#executeOnTimeup
ScheduleMessageService -> ConsumeQueue : poll due message periodicity

ScheduleMessageService -> DefaultMessageStore++:delay message timeup、putMessage
DefaultMessageStore -> CommitLog++: dispatch
CommitLog --> DefaultMessageStore--: return
DefaultMessageStore --> ScheduleMessageService--: return

@enduml
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/8d247a68ec18405197db17e0fbe92b70.png)

1. DefaultMessageStore 调用 putMessage 方法保存消息，内部调用 CommitLog 保存消息
2. CommitLog 保存消息时检查是否是延迟消息（即是否有 DelayLevel 属性）
   1. 如果是，则修改消息的topic 和 queueId

### DeliverDelayedMessageTimerTask

#### executeOnTimeup

如果现在已经到了投递时间点，投递消息
如果现在还没到投递时间点，继续创建一个定时任务，countdown 秒之后执行，然后 return

1. 先获延迟等级取对应的 ConsumeQueue，然后根据 `offsetTable` 中获取的延迟等级对应的 offset（记录这个队列扫描的偏移量）开始扫描后面的消息
2. 从 ConsumeQueue 获取 tagsCode，这里面存的是真正投递时间，跟现在的时间戳比较，来判断该消息是否要投递
3. 等待 0.1s，执行一个新的 `DeliverDelayedMessageTimerTask`

### 详细流程

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/d226cbb1643551eed4c55778fab53edd.png)

## 7 实现任意时间的定时消息

### 实现有一定成本

受到 CommitLog 保存时间限制：现在的延迟消息机制基于 CommitLog，消息到期之后会从 CommitLog 把定时消息查出来重新投递，如果 CommitLog 被删除，那么无法重新投递。

### 商业化

为了提供差异化服务，云厂商自己优先使用高级功能。