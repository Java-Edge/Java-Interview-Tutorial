# RocketMQ实战(01)-基本概念

## 1 角色

### Producer
消息生产者。

Producer与NameServer集群中的其中一个节点（随机选择）建立长连接，定期从Name Server取Topic路由信息，并向提供Topic服务的Master建立长连接，且定时向Master发送心跳。

完全无状态，可集群部署。

Producer每隔30s（ClientConfig#pollNameServerInterval）

![](https://img-blog.csdnimg.cn/0b76a91e606a48c890dab6e573f44831.png)

从Name server获取所有topic队列的最新情况，即若Broker不可用，Producer最多30s就能感知，但期间内发往Broker的所有消息都失败了。

Producer每隔30s（ClientConfig#heartbeatBrokerInterval决定）

![](https://img-blog.csdnimg.cn/a0b3ee79f9cb42d0a173891558f4159a.png)

向所有关联的broker发送心跳，Broker每隔10s中扫描所有存活的连接，若Broker在2min内没收到心跳数据，则关闭与Producer的连接。

### Producer Group
一类Producer的集合名称，这类Producer通常发送一类消息，且发送逻辑一致

### Consumer
消费者。

Consumer与NameServer集群中的其中一个节点（随机选择）建立长连接，定期从Name Server取Topic路由信息，并向提供Topic服务的Master、Slave建立长连接，定时向Master、Slave发送心跳。

Consumer既能从Master订阅消息，也能从Slave订阅消息，订阅规则由Broker配置决定。

Consumer每隔30s从Name server获取topic的最新队列情况，这意味着Broker不可用时，Consumer最多最需要30s才能感知。

Consumer每隔30s（ClientConfig#heartbeatBrokerInterval决定）向所有关联的broker发送心跳，Broker每隔10s扫描所有存活的连接，若某连接2min内没有发送心跳数据，则关闭连接；并向该Consumer Group的所有Consumer发出通知，Group内的Consumer重新分配队列，然后继续消费。

当Consumer得到master宕机通知后，转向slave消费，slave不能保证master的消息100%都同步过来了，会有少量消息丢失。还好一旦master恢复，未同步过去的消息会被最终消费。

### Consumer Group
一类Consumer的集合名称，这类Consumer通常消费一类消息，且消费逻辑一致

## 2 高可用

### Broker

MQ服务，负责接收、分发消息。

消息中转角色，负责存储消息，转发消息，这里就是RocketMQ Server。

一个Master可多Slave，但一个Slave只能对应一个Master，Master与Slave的对应关系通过指定相同的Broker Name，不同Broker Id来定义：

- BrokerId为0表示Master
- 非0表示Slave

Master也可以部署多个。每个Broker与Name Server集群中的所有节点建立长连接：

- 定时(每隔30s)注册Topic信息到所有NameServer
- Name Server定时(每隔10s)扫描所有存活broker的连接，若Name Server超过2min没有收到心跳，则Name Server断开与Broker的连接

#### 可用性

每个Broker节点都是主从架构：

##### 主从节点如何数据同步？
每一个Slave-Broker节点都会去自己的Master节点那里拉取数据，以进行同步

##### 是否具有故障自动转移机制（即主节点宕机后，从节点自动成为主节点，无需人工介入）？

RocketMQ：

- 4.5前，若Master节点挂了，需手动选出一个Slave节点重新作为Master节点，效率低

- 4.5后，RocketMQ引入Dleger机制，采用Raft协议进行主从节点选举，实现了故障自动转移

  ![img](https://files.tpvlog.com/tpvlog/mq/20200220212759717.png)

### NameServer

无状态节点，节点之间无任何信息同步。负责MQ服务之间的协调。一个无状态的名称服务，可以集群部署，每一个broker启动的时候都会向名称服务器注册，主要是接收broker的注册，接收客户端的路由请求并返回路由信息。

NameServer-MQ服务注册发现中心，提供轻量级服务发现和路由。
每个名称服务器记录完整的路由信息，提供相应读写服务，并支持快速存储扩展。

NameServer 充当路由信息提供者。生产者/消费者客户查找topic以查找相应broker列表。

## 3 可拓展

RocketMQ有可扩展性，因为每个Broker节点只保存整体数据的一部分，数据量越来越大时，可进行水平切分。

而RabbitMQ每个节点保存全量数据，数据量越来越大时，没法水平扩展，而RocketMQ通过数据分散集群的模式实现水平扩展。

### 3.1 Topic

消息的主题，定义并在服务端配置，Con按主题订阅，即消息分类，通常一个系统一个Topic。

一个Topic可有多个消息队列，一个Broker默认为每个Topic创建4个读队列、4个写队列。多个Broker组成一个集群，多个BrokerName一样的Broker组成主从架构。brokerId大于0表示从节点，brokerId等于0表示是主节点。



假设订单系统要往MQ发订单消息，就建立一个Topic，名为：topic_orderInfo，即一个包含了所有订单消息的数据集合：

- Pro发消息时，须指定好消息所属Topic
- Con消费消息时，也需指定从哪个Topic获取消息

Broker存储消息时，每个Topic的所有消息数据可能分散在不同Broker节点，可在创建Topic时指定。假设topic_orderInfo包含900万条消息，指定分散在3个Broker节点，则每个节点就包含300万条消息数据：

![](https://files.tpvlog.com/tpvlog/mq/20200220212806938.png)

### 3.2 Tag

除了Topic外，还有一个Tag分类，区分在于 Topic 是一级分类，而 Tag 可以理解为是二级分类。

对消息进行过滤，理解为message的标记，同一业务不同目的的message可用相同topic（业务通用 topic）但
可用不同tag（再细分）区分。

![](https://files.tpvlog.com/tpvlog/mq/20200224002046775.png)

### 3.3 Topic、Tag的最佳实践

#### 消息类型是否一致

如普通消息、事务消息、延时消息、顺序消息，不同消息类型用不同Topic，无法通过 Tag 进行区分

#### 业务是否相关联

无直接关联的消息，如淘宝交易消息，京东物流消息使用不同的 Topic 进行区分；而同样是天猫交易消息，电器类订单、女装类订单、化妆品类订单的消息可以用 Tag 进行区分；

#### 消息优先级是否一致

如同样是物流消息，盒马必须小时内送达，天猫超市 24 小时内送达，淘宝物流则相对会慢一些，不同优先级的消息用不同的 Topic 进行区分。

#### 消息量级是否相当

有些业务消息虽然量小但是实时性要求高，如果跟某些万亿量级的消息使用同一个 Topic，则有可能会因为过长的等待时间而“饿死”，此时需要将不同量级的消息进行拆分，使用不同的 Topic。



每个Broker都通过心跳告诉NameServer：我这里有哪些类型的Topic，每类Topic的哪些数据保存在我这。所以Pro才知道向哪个Broker发送消息，Con同理。

- Pro只能往Master-Broker发消息
- Con既可从Master-Broker消费消息，也可从Slave-Broker消费消息

### Message

在生产者、消费者、服务器之间传递的消息，一个message必须属于一个Topic
消息是要传递的信息。邮件中必须包含一个主题，该主题可以解释为要发送给你的信的地址。消息还可能具有可选标签和额外的键值对。例如，你可以为消息设置业务密钥，然后在代理服务器上查找消息以在开发过程中诊断问题。

### Offset
偏移量，消费者拉取消息时需要知道上一次消费到了什么位置, 这一次从哪里开始

### Partition
分区，Topic物理上的分组，一个Topic可以分为多个分区，每个分区是一一个有序的队列。
分区中的每条消息都会给分配一个有序的ID,也就是偏移量,保证了顺序,消费的正确性

### key
消息的KEY字段是为了唯一表示消息的，方便查问题，不是说必须设置，只是说设置为了方便开发和运维定位问题。
如KEY可以是订单ID。

## 2 集群架构设计

![](https://img-blog.csdnimg.cn/20191025001711704.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## remoting模块架构
![](https://img-blog.csdnimg.cn/20201008002847207.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
