> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

# 1 什么是DLX？
利用DLX，当消息在一个队列中变成死信后，它能被重新发布到另一个Exchange中，这个Exchange就是DLX。
本质就是**该消息不会再被任何消费端消费**（但你可以自定义某消费者单独处理这些死信）。

# 2 DLX产生场景
- 消息被拒绝(`basic.reject`/`basic.nack`)，且`requeue = false`
- 消息因TTL过期
- 队列达到最大长度，先入队的消息会被删除

# 3 死信的处理过程

DLX亦为一个普通的Exchange，它能在任何队列上被指定，实际上就是设置某个队列的属性
- 当某队列中有死信时，RabbitMQ会自动地将该消息重新发布到设置的Exchange，进而被路由到另一个队列
- 可以监听这个队列中的消息做相应的处理。该特性可以弥补RabbitMQ 3.0以前支持的`immediate`参数的功能 

![](https://img-blog.csdnimg.cn/20201114132603154.JPG?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

# 4 DLX的配置
##  4.1 设置DLX的exchange和queue并绑定
- Exchange:`dlx.exchange`
- Queue: `dlx.queue`
- RoutingKey:`#`


## 4.2 正常声明交换机、队列、绑定
只不过需要在队列加上一个参数：
```java
arguments.put(" x-dead-letter-exchange"，"dlx.exchange");
```
这样消息在发生DLX产生条件时，消息即可直接路由到DLX。

# 5 代码实战
- 自定义Con
![](https://img-blog.csdnimg.cn/20190701051311419.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- Pro
![](https://img-blog.csdnimg.cn/20190701051358203.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- Con
![](https://img-blog.csdnimg.cn/20190701051437854.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 启动Con,查看管控台
![](https://img-blog.csdnimg.cn/20190701051807823.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190701051953228.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190701052047932.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190701052124645.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 现在,让我们停止Con,并启动Pro,由于没有Con,TTL为10s的消息将送往死信队列
![](https://img-blog.csdnimg.cn/20190701052632765.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 10s后
![](https://img-blog.csdnimg.cn/20190701052800405.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

实际环境我们还需要对死信队列进行一个监听和处理，当然具体的处理逻辑和业务相关，这里只是简单演示死信队列是否生效。


![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)