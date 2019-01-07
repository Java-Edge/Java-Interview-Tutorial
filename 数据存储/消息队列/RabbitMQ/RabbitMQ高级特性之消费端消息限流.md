# 1 消息过载
假设RabbitMQ服务器有上万条未处理消息，随便打开一个消费端，会造成巨量消息瞬间全部推送过来，然而我们单个客户端无法同时处理这么多数据。


还比如说单个Pro一分钟产生了几百条数据，但是单个Con一分钟可能只能处理60条，这时Pro-Con不平衡。通常Pro没办法做限制，所以Con就需要做一些限流措施，否则如果超出最大负载，可能导致Con性能下降，服务器卡顿甚至崩溃。

因此，我们需要Con限流。

# 2 Con限流机制
RabbitMQ提供了一种qos (服务质量保证)功能，在非自动确认消息的前提下，若一定数目的消息 (通过基于Con或者channel设置Qos的值) 未被确认前，不消费新的消息。

> 不能设置自动签收功能(autoAck = false)
> 如果消息未被确认，就不会到达Con，目的就是给Pro减压

## 限流设置API 
## basicQos
- QoS
![](https://img-blog.csdnimg.cn/2020111416443320.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

请求特定设置“服务质量（quality of service）”。 这些设置强加数据的服务器将需要确认之前，为消费者发送的消息数量限制。 因此，他们提供消费者发起的流量控制的一种手段。
![](https://img-blog.csdnimg.cn/20201114163559162.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

```java
void BasicQos(uint prefetchSize, ushort prefetchCount,
				bool global);
```

- prefetchSize: 单条消息的大小限制，Con通常设置为0，表示不做限制
- prefetchCount: 一次最多能处理多少条消息
- global: 是否将上面设置true应用于channel级别还是取false代表Con级别

> prefetchSize和global这两项，RabbitMQ没有实现，不研究
> prefetchCount在 `autoAck=false` 的情况下生效，即在自动应答的情况下该值无效，所以必须手工ACK。

```java
void basicAck(Integer deliveryTag，boolean multiple)
```

调用该方法就会主动回送给Broker一个应答，表示这条消息我处理完了，你可以给我下一条了。参数multiple表示是否批量签收，由于我们是一次处理一条消息，所以设置为false。


#  3 代码实战
- 自定义Con
![](https://img-blog.csdnimg.cn/201906301734580.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- Con
![](https://img-blog.csdnimg.cn/20190630173039409.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- Pro
![](https://img-blog.csdnimg.cn/20190630173213500.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 启动Con,查看管控台
![](https://img-blog.csdnimg.cn/20190630173605441.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)![](https://img-blog.csdnimg.cn/20190630174106823.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 启动Pro,开始发送消息,Con接收消息
![](https://img-blog.csdnimg.cn/20190630174244847.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 实现限流,仅仅处理一条消息,其余的都在等待![](https://img-blog.csdnimg.cn/20190630174441686.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 现在,我们开启ACK应答处理
![](https://img-blog.csdnimg.cn/20190630174837306.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 重新启动Con,发现剩余的2条消息也全都发送并接收了!
- 我们之前是注释掉手工ACK方法，然后启动消费端和生产端，当时Con只打印一条消息,这是因为我们设置了手工签收,并且设置了一次只处理一条消息,当我们没有回送ACK应答时，Broker端就认为Con还没有处理完这条消息,基于这种限流机制就不会给Con发送新的消息了,所以Con那时只打印了一条消息
![](https://img-blog.csdnimg.cn/20190630175019653.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190630174947771.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)