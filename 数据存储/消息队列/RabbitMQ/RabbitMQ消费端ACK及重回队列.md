# 1 ACK和NACK
当设置` autoACK=false` 时，就可以使用手工ACK。
其实手工方式包括了手工ACK、手工NACK。

- 手工 ACK 时，会发送给Broker一个应答，代表消息处理成功，Broker就可回送响应给Pro
- NACK 则表示消息处理失败，如果设置了重回队列，Broker端就会将没有成功处理的消息重新发送

## 使用方式
Con消费时，若由于业务异常，可**手工 NACK** 记录日志，然后进行补偿
```java
void basicNack(long deliveryTag, 
			   boolean multiple,
			   boolean requeue)
```

如果由于服务器宕机等严重问题，就需要**手工 ACK** 保障Con消费成功
```java
void basicAck(long deliveryTag, boolean multiple)
```

# 2 消费端的重回队列
重回队列针对没有处理成功的消息，将消息重新投递给Broker。
重回队列会把消费失败的消息重新添加到队列尾端，供Con重新消费。
一般在实际应用中，都会关闭重回队列，即设置为false。

# 3 代码实战
- Con，关闭自动签收功能
![](https://img-blog.csdnimg.cn/20190630181703179.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 自定义Con，对第一条消息(序号0)进行NACK，并设置重回队列
![](https://img-blog.csdnimg.cn/20190630181751190.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- Pro 对消息设置序号,以便区分
![](https://img-blog.csdnimg.cn/20190630182157417.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 启动Con，查看管控台
![](https://img-blog.csdnimg.cn/20190630181903266.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190630181927663.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 启动Pro,这里第一条消息由于我们调用了NACK，并且设置了重回队列，所以会导致该条消息一直重复发送，消费端就会一直循环消费
![](https://img-blog.csdnimg.cn/20190630182519169.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190630183129436.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)