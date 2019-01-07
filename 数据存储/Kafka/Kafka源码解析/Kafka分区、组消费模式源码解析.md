> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

# 1 分区消费模式
直接由客户端(任一语言编写)使用Kafka提供的协议向服务器发送RPC请求获取数据，服务器接受到客户端的RPC请求后，将数据构造成RPC响应，返回给客户端，客户端解析相应的RPC响应获取数据。

Kafka支持的协议众多，使用比较重要的有:
- 获取消息的FetchRequest和FetchResponse
- 获取offset的OffsetRequest和OffsetResponse
- 提交offset的OffsetCommitRequest和OffsetCommitResponse
- 获取Metadata的Metadata Request 和 Metadata Response
- 生产消息的 ProducerRequest 和 ProducerResponse

## 1.1 分区消费模式服务器端源码过程
![](https://img-blog.csdnimg.cn/20201202132206585.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)


# 2 组消费者模式
## 2.1 流程
![](https://img-blog.csdnimg.cn/20201203164353424.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20201203165002973.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

# 3 总结
## 3.1 分区消费模式特点
- 指定消费topic、partition和offset通过向服务 器发送RPC请求进行消费
- 需要自己提交offset
- 需要自己处理各种错误，如:leader切换错误
- 需自行处理消费者负载均衡策略

## 3.2 组消费模式特点
- 最终也是通过向服务器发送RPC请求完成的(和分区消费模式一样)
- 组消费模式由Kafka服务器端处理各种错误，然后将消息放入队列再封装为迭代器(队列为**FetchedDataChunk**对象)，客户端只需在迭代器上迭代取出消息
- 由Kafka服务器端周期性的通过scheduler提交当前消费的offset，无需客户端负责
- Kafka服务器端处理消费者负载均衡
- 监控工具Kafka Offset Monitor和Kafka Manager均是基于组消费模式

所以，尽可能使用组消费模式，除非需要
- 自己管理offset，比如想实现消息投递的其他语义
- 自己处理各种错误，根据自己业务的需求