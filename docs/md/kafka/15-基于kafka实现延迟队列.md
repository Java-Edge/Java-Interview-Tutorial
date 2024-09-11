# 15-基于kafka实现延迟队列

搜“kafka 延迟队列”，都是讲解时间轮或只是提供思路，没有真实可用代码实现，本文提供一份可运行代码。

## 1 分解问题

先让消息延迟发送出去。

方案：

1. 发送延迟消息时，不直接发到目标topic，而是发到一个用于处理延迟消息的topic，如`delay-minutes-1`
2. 写一段代码拉取`delay-minutes-1`中的消息，将满足条件的消息发送到真正目标主题

## 2 完善细节

### 问题出在哪里？

延迟消息发出去之后，代码程序就会立刻收到延迟消息，咋处理才能让延迟消息等待一段时间才发送到真正的topic。

代码程序收到消息之后判断条件不满足，就调用`sleep`方法，过了一段时间我再进行下一个循环拉取消息。

这可行吗？当然不行！因为轮询kafka拉取消息时，返回max.poll.records 指定的批量数消息，但当程序不能在`max.poll.interval.ms`配置的期望时间内处理这些消息，kafka就认为这消费者已挂，会`rebalance`，同时你这消费者就无法再拉取到任何消息。

### 实例

当你需要一个24h延迟消息队列，写下`Thread.sleep(1000*60*60*24);`，为避免`rebalance`，你还把`max.poll.interval.ms` 也改成`1000*60*60*24`，这时你或许感到怪异了吧？

有更优雅的解决问题方案。

KafkaConsumer 提供了暂停和恢复的API函数，调用消费者的暂停方法后就无法再拉新消息，同时长时间不消费kafka也不会认为这个消费者已挂。为更优雅，我们启动一个定时器替换`sleep`。完整流程图如下，当消费者发现消息不满足条件时，我们就暂停消费者，并把偏移量seek到上一次消费的位置以便等待下一个周期再次消费这条消息。

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240307161552374.png?size=20%)

### Java代码



```java
@Slf4j
@SpringBootTest
public class DelayQueueTest {

    private KafkaConsumer<String, String> consumer;
    private KafkaProducer<String, String> producer;
    private volatile Boolean exit = false;
    private final Object lock = new Object();
    private final String servers = "";

    @BeforeEach
    void initConsumer() {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, servers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "d");
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.ISOLATION_LEVEL_CONFIG, "read_committed");
        props.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, "5000");
        consumer = new KafkaConsumer<>(props, new StringDeserializer(), new StringDeserializer());
    }

    @BeforeEach
    void initProducer() {
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, servers);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        producer = new KafkaProducer<>(props);
    }

    @Test
    void testDelayQueue() throws JsonProcessingException, InterruptedException {
        String topic = "delay-minutes-1";
        List<String> topics = Collections.singletonList(topic);
        consumer.subscribe(topics);

        Timer timer = new Timer();
        timer.schedule(new TimerTask() {
            @Override
            public void run() {
                synchronized (lock) {
                    consumer.resume(consumer.paused());
                    lock.notify();
                }
            }
        }, 0, 1000);

        do {

            synchronized (lock) {
                ConsumerRecords<String, String> consumerRecords = consumer.poll(Duration.ofMillis(200));

                if (consumerRecords.isEmpty()) {
                    lock.wait();
                    continue;
                }

                boolean timed = false;
                for (ConsumerRecord<String, String> consumerRecord : consumerRecords) {
                    long timestamp = consumerRecord.timestamp();
                    TopicPartition topicPartition = new TopicPartition(consumerRecord.topic(), consumerRecord.partition());
                    if (timestamp + 60 * 1000 < System.currentTimeMillis()) {

                        String value = consumerRecord.value();
                        ObjectMapper objectMapper = new ObjectMapper();
                        JsonNode jsonNode = objectMapper.readTree(value);
                        JsonNode jsonNodeTopic = jsonNode.get("topic");

                        String appTopic = null, appKey = null, appValue = null;

                        if (jsonNodeTopic != null) {
                            appTopic = jsonNodeTopic.asText();
                        }
                        if (appTopic == null) {
                            continue;
                        }
                        JsonNode jsonNodeKey = jsonNode.get("key");
                        if (jsonNodeKey != null) {
                            appKey = jsonNode.asText();
                        }

                        JsonNode jsonNodeValue = jsonNode.get("value");
                        if (jsonNodeValue != null) {
                            appValue = jsonNodeValue.asText();
                        }
                        // send to application topic
                        ProducerRecord<String, String> producerRecord = new ProducerRecord<>(appTopic, appKey, appValue);
                        try {
                            producer.send(producerRecord).get();
                            // success. commit message
                            OffsetAndMetadata offsetAndMetadata = new OffsetAndMetadata(consumerRecord.offset() + 1);
                            HashMap<TopicPartition, OffsetAndMetadata> metadataHashMap = new HashMap<>();
                            metadataHashMap.put(topicPartition, offsetAndMetadata);
                            consumer.commitSync(metadataHashMap);
                        } catch (ExecutionException e) {
                            consumer.pause(Collections.singletonList(topicPartition));
                            consumer.seek(topicPartition, consumerRecord.offset());
                            timed = true;
                            break;
                        }
                    } else {
                        consumer.pause(Collections.singletonList(topicPartition));
                        consumer.seek(topicPartition, consumerRecord.offset());
                        timed = true;
                        break;
                    }
                }

                if (timed) {
                    lock.wait();
                }
            }
        } while (!exit);

    }
}
```

这段程序是基于SpringBoot `2.4.4`版本和 kafka-client `2.7.0`版本编写的一个单元测试，需要修改私有变量`servers`为kafka broker的地址。

在启动程序后，向Topic `delay-minutes-`1 发送如以下格式的json字符串数据

```json
{
    "topic": "target",
    "key": "key1",
    "value": "value1"
}
```

同时启动一个消费者监听topic `target`，在一分钟后，将会收到一条 key="key1", value="value1"的数据。

### **还需要做什么？**

创建多个topic用于处理不同时间的延迟消息，例如`delay-minutes-1` `delay-minutes-5` `delay-minutes-10` `delay-minutes-15`以提供指数级别的延迟时间，这样比一个topic要好很多，毕竟在顺序拉取消息的时候，有一条消息不满足条件，后面的将全部进行排队。

## FAQ

Q：这个实现，是不是只能要求后来的数据的执行时间一定要比先来的数据的执行时间要晚，不然就会延迟很多？

A：这个得看等级划分得好不好了，如果只有延时10min的topic，那么19min、15min依次进来 肯定会按照你说的 会延迟很多，但如果加上延时1min的topic，那么就会上述两个延时的消息都会流转到1min的topic当中，当每次1min走完了，都会将消息重新划分等级，这样子就不会出现你那种情况了

Q：消费者发现消息不满足条件时，我们就暂停消费者，并把偏移量seek到上一次消费的位置以便等待下一个周期再次消费这条消息。

这里有个疑问请教下，如果重置偏移量，假如我已经消费到第五条，这时第一条不满足条件的话，重置offset为1 ，岂不是要重复消费后面4条？

还是说我只能第一条消费完成功后才能消费第二条，仅能顺序消费执行？

A：重置会重复消费，暂停只是避免kafka rebalance的手段。
另一个问题的答案是只有一个分区时，kafka 是按顺序消费的。

- 那就没有必要了。其实有key的，是不是多个分区利用好key可以实现顺序消费呢，但是复杂度有提升了。

Q：在多分区下有个问题，一次poll了多个分区的消息时，seek只设置了第一个消息的分区就break了，导致其他分区的消息没消费到？

A：这个属于内部的topic ，创建的时候就一个分区，不能修改的，其实也够用了，延迟消息并没有那么多。

Q：你这代码一直在resume，没意义吧。你就干脆一直seek就完了？

A：不暂停会导致 rebalance，文中说过了的。

Q：是否可以将过期时间在消息体上面附加一个expire字段记录呢，这样就不用分这么多topic区分不同过期时间了？

A：不可以的，同一个topic中的数据，如果在同一个partition 是按顺序消费的，这种情况下，如果前面有一个超时时间特别久的数据，就会导致后面的永远无法消费。![[捂脸]](https://pic1.zhimg.com/v2-b62e608e405aeb33cd52830218f561ea.png)

Q：对于处理多个不同时间的延迟消息这里，是否有点不够灵活？如果想每增加一个延时时间段，就需要增加一个topic，假如有需求要1-60分钟内可能都有需要延时处理的消息，那岂不是需要60个topic甚至更多？而且不能弹性伸缩。是否可以使用单独的延时topic-delay，每次拉取到的消息如果不符合要求可以再次进入topic-delay，直到符合处理的时间才进入topic-real进行处理。当然这种方式可能会造成一定的资源浪费，并且在队列过长时会导致延时时间误差，但是相对来说比较灵活一点，可以同时兼容处理多个时间的延迟消息？

A：正常情况下系统的延迟任务也就几个，不会说1-60分钟都有需要设置，如果有就是系统设计的不合理。如果收到了消息没有到时间再重新发送进去这样会造成资源的极大浪费，另外存储也会变大很多，不如用其他方案的延迟队列了。

原文链接：https://zhuanlan.zhihu.com/p/365802989