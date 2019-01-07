Exchange：接收消息，并根据路由键转发消息所绑定的队列。注意交换机并非一个单独运行的进程，而是一个有着“地址”的列表而已。
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NjQwXzIwMTkwNjE4MTkwMjM5NDYxLnBuZw?x-oss-process=image/format,png)
蓝区 - Send Message：把消息投递到交换机，由 `RoutingKey` 路由到指定队列。


# 1 交换机属性
声明交换机时可以附带许多属性：
- Name
交换机名称
- Type
交换机类型，direct、topic、 fanout、 headers
- Durability，是否需要持久化。
如果持久化，则RabbitMQ重启后，交换机还存在
- Auto-delete
当最后一个绑定到Exchange 上的队列删除后，自动删除该Exchange
- Internal
当前Exchange是否于RabbitMQ内部使用，默认为False

# 2 交换机类型
交换机主要包括如下4种类型：
1. Direct exchange（直连交换机）
2. Fanout exchange（扇型交换机）
3. Topic exchange（主题交换机）
4. Headers exchange（头交换机）

另外RabbitMQ默认定义一些交换机：
- 默认交换机
`amq.* exchanges`

还有一类特殊的交换机：
- Dead Letter Exchange（死信交换机）


## 2.1  Direct Exchange
所有发送到DE的消息被转发到RouteKey中指定的Queue

> Direct模式可使用RabbitMQ自带的Exchange: default Exchange，所以不需要将Exchange进行任何绑定(binding)，消息传递时，RouteKey必须完全匹配才会被队列接收，否则该消息会被抛弃。

## 2.2  Direct Exchange原理示意图
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NDI5XzIwMTkwNjE5MDgxNTU1ODMwLnBuZw?x-oss-process=image/format,png)
![](https://img-blog.csdnimg.cn/20201113173820823.JPG?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

## 2.3  Direct Exchange实操演示
- Pro
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2MzIwXzIwMTkwNjI4MDIyNDE4NzM0LnBuZw?x-oss-process=image/format,png)

- Con
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NDEwXzIwMTkwNjI4MDIyNzQyMzUucG5n?x-oss-process=image/format,png)

注意路由key保持一致!分别启动
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NDA3XzIwMTkwNjI4MDIyOTQ4MTE3LnBuZw?x-oss-process=image/format,png)

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NjM1XzIwMTkwNjI4MDIzMDM5Njc4LnBuZw?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2MzU4XzIwMTkwNjI4MDIzMTEzMTM0LnBuZw?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2MzMzXzIwMTkwNjI4MDIzMTUwODEzLnBuZw?x-oss-process=image/format,png)

## 2.2 Topic exchange
尽管使用直接交换改进了我们的系统，它仍然有局限性 - 不能做基于多个标准的路由。

比如在日志系统，可能不仅要根据严重性订阅日志，还要根据日志源订阅日志。
> 你可能从syslog unix工具中了解这个概念，它根据严重性（info / warn / crit ...）和facility（auth / cron / kern ...）来路由日志。

这更具灵活性 - 我们可能想要监听来自 `cron` 的关键错误以及来自 `kern` 的所有日志。

为了在日志记录系统中实现这一点，还需要了解更复杂的主题交换机。

-  `*`可匹配一个单词
- `#`可匹配零或多个单词

- 所有发送到Topic Exchange的消息会被转发到所有关心RouteKey中指
定Topic的Queue上
- Exchange将RouteKey和某Topic进行模糊匹配，此时队列需要绑定一个Topic

### 2.2.1 实例1
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2MTk2XzIwMTkwNjI4MDUxMzUyNzkwLnBuZw?x-oss-process=image/format,png)
在这个例子中，我们将发送所有描述动物的消息。消息将与包含三个单词（两个点）的routing key一起发送.
routing key中的第一个单词描述速度，第二颜色，第三是物种：“<speed>。<color>。<species>”。

我们创建了三个绑定：Q1绑定了绑定键“* .orange.*”，Q2绑定了“*.*.rabbit”和“lazy.＃”

这些绑定可总结为：
- Q1对所有橙色动物感兴趣
- Q2希望听到关于兔子的一切，以及关于懒惰动物的一切

routing key设置为“quick.orange.rabbit”的消息将传递到两个队列。消息“lazy.orange.elephant”也将同时发送给他们.
另一方面
- “quick.orange.fox”只会转到第一个队列
- 而“lazy.brown.fox”只会转到第二个队列
- “lazy.pink.rabbit”将仅传递到第二个队列一次，即使它匹配两个绑定
-  “quick.brown.fox”与任何绑定都不匹配，因此它将被丢弃。

如果我们违背我们的约定并发送带有一个或四个单词的消息，例如“orange” or “quick.orange.male.rabbit”，会发生什么?好吧,这些消息将不会匹配任何绑定,因此将丢失.

另一方面，“lazy.orange.male.rabbit”，虽然它有四个单词，也会匹配最后一个绑定，并将被传递到第二个队列。

###  实例图
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NzMwXzIwMTkwNjI4MDUyNTUzOTAwLnBuZw?x-oss-process=image/format,png)
![](https://img-blog.csdnimg.cn/20201113174506713.JPG?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

### 实操演示
- Pro
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NDQ0XzIwMTkwNjI4MDUzMzIyNzc3LnBuZw?x-oss-process=image/format,png)
- Con
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NTc1XzIwMTkwNjI4MDUzNDMzNjU1LnBuZw?x-oss-process=image/format,png)
- 启动消费者:
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NDc0XzIwMTkwNjI4MDUzNjAyMjMyLnBuZw?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NTk5XzIwMTkwNjI4MDUzOTA3MjIwLnBuZw?x-oss-process=image/format,png)

- 启动生产者:
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NjkzXzIwMTkwNjI4MDU0MTU4NDM4LnBuZw?x-oss-process=image/format,png)
消费端收到了消息

- 修改匹配格式,理论上只能接受前两个消息
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2MjUyXzIwMTkwNjI4MDU0MzQ2OTEzLnBuZw?x-oss-process=image/format,png)
- 注意在管控台,先将之前的匹配绑定取消!
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2MzM5XzIwMTkwNjI4MDU0NTIyODg5LnBuZw?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NTgyXzIwMTkwNjI4MDU0NzQwNDc2LnBuZw?x-oss-process=image/format,png)
- 显然仅能接受前两个消息
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NTQ0XzIwMTkwNjI4MDU0NjUwNTk1LnBuZw?x-oss-process=image/format,png)
##  小结
主题交换机功能强大，可以像其他交换机一样运行。
当队列绑定“＃”（哈希）绑定key时 - 它将接收所有消息，而不管routing key - 就像在fanout交换机一样。
当特殊字符“*”（星号）和“＃”（哈希）未在绑定中使用时，主题交换机的行为就像直接交换机一样。

##  13.2.3 Fanout Exchange
- 不处理路由键，只需要简单的将队列绑定到交换机上
- 发送到交换机的消息都会被转发到与该交换机绑定的所有队列上
- Fanout交换机转发消息是最快的
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NDM0XzIwMTkwNjI4MDU1MTA0NjU1LnBuZw?x-oss-process=image/format,png)
![](https://img-blog.csdnimg.cn/20201113190030877.JPG?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

### 实操演示
- Con
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NDY4XzIwMTkwNjI4MDU1NjE4MjA5LnBuZw?x-oss-process=image/format,png)
- Pro
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NDg3XzIwMTkwNjI4MDU1NjU3OTcucG5n?x-oss-process=image/format,png)

- 启动消费端
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NTQ4XzIwMTkwNjI4MDU1ODUwMzM1LnBuZw?x-oss-process=image/format,png)
- 不需要routing key
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2MzEyXzIwMTkwNjI4MDU1OTMwNDE3LnBuZw?x-oss-process=image/format,png)
- 启动生产者后接收到的消息
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjgvNTA4ODc1NV8xNTYxNjc0NTE2NzI4XzIwMTkwNjI4MDYwMTA4MzA1LnBuZw?x-oss-process=image/format,png)
