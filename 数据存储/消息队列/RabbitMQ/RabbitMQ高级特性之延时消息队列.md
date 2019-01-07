RabbitMQ本身没有延时队列功能，无法直接指定一个队列类型为延时队列，然后去延时处理。有两种实现方案：插件和功能搭配。

这里只介绍其二。可以将TTL+DLX相结合，就能组成一个延时队列。

# 案例
下完订单后20min未付款，就关闭该订单，如果使用RabbitMQ，就需要结合TTL+DLX。

# 解决方案
先把订单消息设置好15分钟TTL，到点过期后队列将消息转发给`DLX`，再将消息分发给我们配置的所绑定的队列，再定义消费者去消费这个队列中的消息，就做到了延时十五分钟消费。

![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)