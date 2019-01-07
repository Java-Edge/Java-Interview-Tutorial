本文主要讲解RabbitMQ的介绍和安装,Spring Cloud Stream核心概念,Spring Cloud Alibaba RocketMQ学习,异步消息推送与消费

# 1 审核业务的实现![](https://img-blog.csdnimg.cn/20191205233128685.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191205233308197.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- `com/javaedge/contentcenter/service/content/ShareService.java`![](https://img-blog.csdnimg.cn/20191205235858942.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

假设添加积分操作很耗时,我们的主要操作是审核,而不关心积分,所以可以将其异步化

## 1.1 Spring实现异步的方法
◆ AsyncRestTemplate
- 参考文档
Spring 的异步HTTP请求AsyncRestTemplate

◆ @ Async注解
- 参考文档
https://spring.io/guides/gs/async-method/

◆ WebClient ( Spring 5.0引入 ,为取代AsyncRestTemplate)
- 参考文档
https://docs.spring.io/spring/docs5.1. RELEASE/spring-framework-reference/web-reactive.html#webflux-client
 
◆ MQ
我们采用此法
# 2 引入MQ后的架构演进
![](https://img-blog.csdnimg.cn/20191206000146998.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

# 3 MQ适用场景
- 异步处理
- 流量削峰填谷
- 解耦微服务
# 4 MQ的选择
流行的MQ那么多,如何选择?
- Kafka、RabbitMQ、 RocketMQ、 ActiveMQ...

![](https://img-blog.csdnimg.cn/20191206000646829.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191206000852962.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
# 5 搭建RocketMQ
- 下载与安装
[RocketMQ实战(一) - 简介](https://blog.csdn.net/qq_33589510/article/details/102721192)
# 6 搭建RocketMQ控制台
![](https://img-blog.csdnimg.cn/20191206005215904.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

- 修改pom.xml版本
![](https://img-blog.csdnimg.cn/20191206005542761.png)

- 修改代码
![](https://img-blog.csdnimg.cn/20191206010145609.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191206010213484.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

# 7 Spring消息编程模型
- 推荐Maven依赖版本分析插件
![](https://img-blog.csdnimg.cn/20191206214039934.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

## 7.1 编写生产者
content-center

开始拿出三板斧:
- 引入依赖
![](https://img-blog.csdnimg.cn/20191206213602204.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 添加注解
无
- 写配置
![](https://img-blog.csdnimg.cn/20191206214458431.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 服务类添加模板类
![](https://img-blog.csdnimg.cn/20191206214640566.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191206222134700.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

## 7.2 编写消费者
user-center
- 依赖![](https://img-blog.csdnimg.cn/20191207213233707.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 配置
![](https://img-blog.csdnimg.cn/20191207213323344.png)
- `com.javaedge.contentcenter.rocketmq.AddBonusTransactionListener`
![](https://img-blog.csdnimg.cn/20191208135707174.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

### 小结
- RocketMQ : RocketMQMessageListener
- ActiveMQ/Artemis : JmsListener
- RabbitMQ : RabbitListener
- Kafka : KafkaListener
# 8 分布式事务
流程剖析、概念术语、
如何实现事务呢,我们知道Spring有事务注解,那么直接就添加@Transaction注解吧!
![](https://img-blog.csdnimg.cn/20191208140035308.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
可这样是万无一失了吗?显然不行,因为消息已经发出,没法撤回了
那么看看RocketMQ是怎么解决分布式事务问题呢
## 8.1 实现分布式事务流程
![](https://img-blog.csdnimg.cn/20191208160157632.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

业务流程图
![](https://img-blog.csdnimg.cn/20191208160249241.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
1. 半消息,虽然被存储到MQserver,但会被标记为暂时不能投递,所以消费者不会接受到该消息
2. 半消息发送成功,开始3
3. 开始执行本地事务
4. 生产者根据本地事务,发送二次确认请求
MQServer如果从4中接收到的是
	- commit,就把消息置为可投递,这样消费者就可消费该消息了
	- rollback:将该消息删除
5. MQServer未收到4中的二次确认消息,就会回查
6. 生产者检查本地事务的执行结果
7. 根据本地事务执行结果,发送commit/rollback消息

总体来说,就是生产者把消息发送到MQ,但MQ只是将其标记,不让消费者消费
然后生产者就执行本地事务,执行完后就知道到底是该投递还是丢弃该消息了!
这其实就是典型的二次确认
消费回查就是防止二次确认消息发送异常的容错处理

## 8.2 关键概念
◆ 半消息( Half(Prepare) Message )
暂时无法消费的消息。生产者将消息发送到了MQ server ,但这个消息会被标记为"暂不能投递"状态,先存储起来;消费者不会去消费这条消息。
并不是消息的状态,只是一种特殊的消息而已
◆ 消息回查(Message Status Check )
网络断开或生产者重启可能导致丢失事务消息的第二次确认。当MQ Server发现消息长时间处于半消息状态时,将向消息生产者发送请求,询问该消息的最终状态(提交或回滚)。

## 8.3 事务消息三状态
![](https://img-blog.csdnimg.cn/20191208181542145.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
◆ Commit
提交事务消息,消费者可以消费此消息
◆ Rollback
回滚事务消息, broker会删除该消息,消费者不能消费.
◆UNKNOWN
broker需要回查确认该消息的状态


# 9 分布式事务 - 编码实现
- 在内容中心新增事务日志表`rocketmq_transaction_log`
![](https://img-blog.csdnimg.cn/20191208163631244.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
对照上一小节流程图,开始code!
## 9.1/2 发半消息
![](https://img-blog.csdnimg.cn/20191208173431299.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
### 改造接口 
- 将原先如下代码删除
![](https://img-blog.csdnimg.cn/20191208174829576.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 改为如下接方法![](https://img-blog.csdnimg.cn/20191208174627695.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
## 9.3 执行本地事务

- 新建`rocketmq`包,并在其中创建一个新类`AddBonusTransactionListener`
![](https://img-blog.csdnimg.cn/20191208181419403.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 一定要在该类上加`@RocketMQTransactionListener`注解
其中的txProducerGroup一定要对应哦

![](https://img-blog.csdnimg.cn/20191208175758488.png)
![](https://img-blog.csdnimg.cn/20191208180050986.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

注意这里的
![](https://img-blog.csdnimg.cn/20191208180450275.png)
- msg参数即对应
![](https://img-blog.csdnimg.cn/20191208180518349.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- args参数即对应
![](https://img-blog.csdnimg.cn/2019120818074067.png)
- 回查本地事务执行结果,即通过查询日志记录表,该表在执行完本地事务后更新
![](https://img-blog.csdnimg.cn/20191208181934885.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 这即可回查啦
![](https://img-blog.csdnimg.cn/20191208182024750.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

# 参考
- [消息队列对比参照表](https://blog.csdn.net/fxbin123/article/details/90261669)
- [RocketMQ vs. ActiveMQ vs. Kafka](http://rocketmq.apache.org/docs/motivation/)
- [面向未来微服务:Spring Cloud Alibaba从入门到进阶](https://coding.imooc.com/class/358.html?mc_marking=1f1eb391b59b3e4139718a46d8673049&mc_channel=syb10)