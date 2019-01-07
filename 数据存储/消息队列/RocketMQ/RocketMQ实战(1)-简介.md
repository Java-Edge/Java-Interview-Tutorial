# 1 RocketMQ是什么
RocketMQ是由阿里捐赠给Apache的一款分布式、队列模型的开源消息中间件，经历了淘宝双十一的洗礼。

- 官网
![](https://img-blog.csdnimg.cn/20191024132120332.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 2 RocketMQ的发展史
![](https://img-blog.csdnimg.cn/20191024131500529.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 2017开始发布即最新4.0.0版本![](https://img-blog.csdnimg.cn/20191024131837417.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
# 3  RocketMQ的特性
![](https://img-blog.csdnimg.cn/20191024131953983.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/2019102413215576.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 4 RocketMQ基本概念
Client端
- Producer Group
一类Producer的集合名称，这类Producer通常发送一类消息，且发送逻辑一致
- Consumer Group
一类Consumer的集合名称，这类Consumer通常消费一类消息，且消费逻辑一致

Server端
- Broker
消息中转角色，负责存储消息，转发消息，这里就是RocketMQ Server
- Topic
消息的主题，用于定义并在服务端配置，消费者可以按照主题进行订阅，也就是消息分类,通常一个系统一个Topic

--------------------------------

- Message
在生产者、消费者、服务器之间传递的消息，一个message必须属于一个Topic
消息是要传递的信息。邮件中必须包含一个主题，该主题可以解释为要发送给您的信的地址。消息还可能具有可选标签和额外的键值对。例如，您可以为消息设置业务密钥，然后在代理服务器上查找消息以在开发过程中诊断问题。

- Namesrver
一个无状态的名称服务，可以集群部署，每一个broker启动的时候都会向名称服务器注册，主要是接收broker的注册，接收客户端的路由请求并返回路由信息
- Offset
偏移量，消费者拉取消息时需要知道上一次消费到了什么位置, 这一次从哪里开始
- Partition
分区，Topic物理上的分组，一个Topic可以分为多个分区，每个分区是一一个有序的队列。
分区中的每条消息都会给分配一个有序的ID,也就是偏移量,保证了顺序,消费的正确性

- Tag
用于对消息进行过滤，理解为message的标记，同一业务不同目的的message可以用相同的topic但是
可以用不同的tag来区分
- key
消息的KEY字段是为了唯- -表示消息的，方便查问题，不是说必须设置，只是说设置为了方便开发和运维定位问题。
比如:这个KEY可以是订单ID等

# 5 下载与安装
- 进入下载页面 ![](https://img-blog.csdnimg.cn/20191024233641247.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 下载
![](https://img-blog.csdnimg.cn/20191024233733483.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 解压
- 启动namespace  默认4g![](https://img-blog.csdnimg.cn/2019102423483883.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 启动成功日志![](https://img-blog.csdnimg.cn/20191206001814128.png)
- 启动broke 默认8g
```bash
nohup sh bin/mqbroker -n localhost:9876 
> ~/logs/rocketmqlogs/broker.log 2>&1 &
```
![](https://img-blog.csdnimg.cn/20191206003703263.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 验证启动成功![](https://img-blog.csdnimg.cn/20191206003753507.png)![](https://img-blog.csdnimg.cn/20191024134451940.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- 发送消息

```bash
export NAMESRV ADDR=localhost:9876
bin/tools.sh org.apache.rocketmq.example.quickstart.Producer
```
- 接收消息

```bash
bin/tools.sh org.apache.rocketmq.example.quickstart.Consumer
```
# 6 引入客户端
Maven依赖

```bash
<dependency>
	<groupld>org.apache.rocketmq</groupld>
	<artifactld> rocketmq-client</artifactld>
	<version>4.3.0</version>
</dependency>
```

# 参考
[RocketMQ官网](https://rocketmq.apache.org/docs/core-concept/)
