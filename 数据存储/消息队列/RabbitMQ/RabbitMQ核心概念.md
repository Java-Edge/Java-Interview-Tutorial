# 1 为什么使用 RabbitMQ
开源的消息代理和队列服务器，通过普通协议在完全不同的应用间共享数据，使用Erlang语言编写，并且基于AMQP协议。

据报道，滴滴、美团、头条、去哪儿、艺龙...都选择了它：
- 开源，性能优秀，稳定性有保障
- 提供可靠性消息投递模式（confirm），返回模式（return）
- 与Spring AMQP完美整合，API丰富
- 集群模式丰富，表达式配置，HA模式，镜像队列模型
- 保证数据不丢失的前提做到高可靠性、可用性

# 2 高性能之源
- Erlang语言
最初在于交换机领域的架构模式，这样使得RabbitMQ在Broker之间进行数据交互的性能非常优秀
- Erlang的优点
Erlang有着和原生Socket一样的延迟

# 3 AMQP协议
AMQP，Advanced Message Queuing Protocol，高级消息队列协议。
一个提供统一消息服务的应用层标准的二进制的高级消息队列协议，是应用层协议的一个开放标准，为面向消息的中间件设计。基于该协议的客户端与消息中间件可传递消息，并不受客户端/中间件同产品、不同的开发语言等条件的限制。

- AMQP的实现
RabbitMQ、OpenAMQ、Apache Qpid、Redhat、Enterprise MRG、AMQP Infrastructure、ØMQ、Zyre等。

# 4 协议模型
![协议模型](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI2ODI0XzQ2ODU5NjgtM2ZhMTE4MjFhZmI3YTc2Yy5wbmc?x-oss-process=image/format,png)
# 5 AMQP核心概念
- Server，又称Broker
接受客户端的连接，实现AMQP实体服务
- Connection 连接
应用程序与Broker的网络连接
- Channel，网络信道
几乎所有操作都在Channel中进行，Channel是进行消息读写的通道。客户端可建立多个Channel，每个Channel代表一个会话任务
- Message：消息
服务器和应用程序之间传送的数据，由Properties和Body组成。
	- `Properties` 可修饰消息， 比如消息的优先级、延迟等高级特性
	- `Body` 消息体内容
- Virtual host：虚拟地址
用于逻辑隔离，最上层的消息路由，类似命名空间。一个Virtual Host里可以有若干Exchange和Queue，同一Virtual Host里不能有相同名称的Exchange或Queue
- Exchange：交换机
接收消息，根据路由键转发消息到绑定的队列
- Binding
Exchange和Queue之间的虚拟连接，binding中可以包含routing key
- Routing key
一个路由规则，虚拟机可用它来确定如何路由一个特定消息
- Queue，也称为Message Queue，消息队列
保存消息并将它们转发给消费者
# 6 RabbitMQ工作架构模型
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1MDg4XzQ2ODU5NjgtY2UyOTBjMzczMzMyNDAyNy5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1MzQyXzQ2ODU5NjgtMzJhMzk2YTk0YTJhZTgyMy5wbmc?x-oss-process=image/format,png)
![](https://img-blog.csdnimg.cn/20201113165529857.JPG?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

# 7 特性
1、可靠性
2、灵活的路由
3、消息集群
4、高可用
5、多种协议
6、多语言客户端
7、管理界面
8、插件机制


# 8 基本使用
## 8.1 常用命令
- 启动服务
```
rabbitmq-server start &
```
- 停止服务
```
rabbitmqctl stop_ app
```
- 管理插件
```
rabbitmq-plugins enable rabbitmq_ management
```
- 访问地址
http://192.168.11.76:15672/

## 8.2 重启操作
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1MjE5XzQ2ODU5NjgtOTYzYTI4OTRlYjk4YzRjZi5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI2MDE5XzQ2ODU5NjgtNzRiNjRhYzI2ZDdjMWVhMC5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1NDAzXzQ2ODU5NjgtZTQ3YWNlZTM1OWUwODVkNC5wbmc?x-oss-process=image/format,png)
![启动成功](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1NTU1XzQ2ODU5NjgtMTlmNTI3ODczZTVlZWI5Ni5wbmc?x-oss-process=image/format,png)
# 9 quickstart - 消息的生产与消费
## 9.1 基本构建缺一不可
- ConnectionFactory:获取连接工厂
- Connection:一个连接
- Channel:数据通信信道,可发送和接收消息
- Queue:具体的消息存储队列
- Producer & Consumer生产和消费者
## 9.2 实操演示
- Pro
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyOTYyXzIwMTkwNjI4MTkzNjUyMzA0LnBuZw?x-oss-process=image/format,png)
- Con
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyODU5XzIwMTkwNjI4MTkzOTE1NjY3LnBuZw?x-oss-process=image/format,png)
由于是Con端才创建有对列,所以必须先启动Con端,再启动Pro端!
分别启动运行

# 10 命令行与管控台常规操作
## 10.1  常用命令行
- rabbitmqctl stop_ app: 关闭应用
- rabbitmqctl start app: 启动应用
- rabbitmqctl status: 节点状态
- rabbitmqctl add_ user username password:添加用户
- rabbitmqctl list users:列出所有用户
- rabbitmqctl delete_ user username:删除用户
- rabbitmqctl clear permissions -p vhostpath username:清除用户权限
- rabbitmqctl list user_ permissions username:列出用户权限
- rabbitmqctl change_ password username newpassword:修改密码
- rabbitmqctl set permissions -p vhostpath username
- ".*"".*"".*": 设置用户权限
- rabbitmqctl add vhost vhostpath:创建虚拟主机
- rabbitmqctl list vhosts: 列出所有虚拟主机
- rabbitmqctl list_ permissions -p vhostpath:列出虚拟主机上所有权限
- rabbitmqctl delete vhost vhostpath:删除虚拟主机
- rabbitmqctl list queues:查看所有队列信息
- rabbitmqctl -p vhostpath purge_ queue blue:清除队列里的消息
- rabbitmqctl reset:移除所有数据，要在rabbitmqctl stop_ app之后使用
- rabbitmqctl join_cluster < clusternode > [- -ram] :组成集群命令
- rabbitmqctl cluster status: 查看集群状态 
- rabbitmqctl change_ cluster_ node type disc | ram 修改集群节点的存储形式
- rabbitmqctl forget_ cluster_ node [--offline]忘记节点(摘除节点)
- rabbitmqctl rename_cluster_node oldnode1 newnode1 [oldnode2] [newnode2...]修改节点名称

## 实操
- 查看端口占用
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyOTIxXzIwMTkwNjI5MDcxOTQ3NzcyLnBuZw?x-oss-process=image/format,png)
- ctl命令
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyOTYwXzIwMTkwNjI5MDczMzA4Mjg2LnBuZw?x-oss-process=image/format,png)

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkzNDIyXzIwMTkwNjI5MDczNDI3NzY0LnBuZw?x-oss-process=image/format,png)
## 10.2 管控台的管理
- 主界面
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyODYzXzIwMTkwNjI5MDczNjU2NTU1LnBuZw?x-oss-process=image/format,png)
- 主界面-监测全部信息
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyOTUwXzIwMTkwNjI5MDc0MzAwNDM2LnBuZw?x-oss-process=image/format,png)
- 主界面-当前节点的状态
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyNTcyXzIwMTkwNjI5MDc0NDEyNjg1LnBuZw?x-oss-process=image/format,png)
- 主界面-当前节点一些存储路径
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkzMDQwXzIwMTkwNjI5MDc0NjM0Mjc1LnBuZw?x-oss-process=image/format,png)
- 主界面-端口号集锦
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyODc3XzIwMTkwNjI5MDc0ODIwNTI4LnBuZw?x-oss-process=image/format,png)
- 主界面-配置文件的导入导出 
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyOTE4XzIwMTkwNjI5MDc0OTE5ODA4LnBuZw?x-oss-process=image/format,png)
- 管控台connection界面
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyNjAyXzIwMTkwNjI4MTk1MjMzODcyLnBuZw?x-oss-process=image/format,png)
- 管控台channel界面
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyOTY1XzIwMTkwNjI4MTk1MzI2NTI2LnBuZw?x-oss-process=image/format,png)
- 管控台queues界面
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyOTU4XzIwMTkwNjI4MTk1NDA5MTc5LnBuZw?x-oss-process=image/format,png)
- 管控台Exchanges界面![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyODUzXzIwMTkwNjI5MDczODAxNDcucG5n?x-oss-process=image/format,png)
- 管理员界面-添加用户![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyOTA2XzIwMTkwNjI5MDc0MDA4NjE4LnBuZw?x-oss-process=image/format,png)
- 管理员界面-添加虚拟主机
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyODIxXzIwMTkwNjI5MDc0MDUxOTc5LnBuZw?x-oss-process=image/format,png)
- 管理员界面-集群管理
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyODk2XzIwMTkwNjI5MDc0MTQyNTc1LnBuZw?x-oss-process=image/format,png)

# 14 绑定(Binding)
- Exchange和Exchange、Queue之间的连接关系
- Binding中可以包含RoutingKey或者参数

# 15 Queue-消息队列
- 消息队列，实际存储消息数据
- Durability: 是否持久化，Durable: 是，Transient: 否
- Auto delete:如选yes,代表当最后一个监听被移除之后,该Queue会自动被删除.

# 16 Message-消息
- 服务器和应用程序之间传送的数据
- 本质上就是一段数据，由Properties和Payload ( Body )组成

## 16.1 常用属性
delivery mode、headers (自定义属性)
content_ type. content_ encoding. priority
correlation id. reply to
### expiration - 过期时间
这里就牵涉到RabbitMQ的TTL机制


message_ id
timestamp. type. user id. app_ id. cluster id

## 实操演示
- Con
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkzMDg5XzIwMTkwNjI4MTg1NjExMjUwLnBuZw?x-oss-process=image/format,png)
- 启动消费端
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyODQ5XzIwMTkwNjI4MTg1NzExMjI5LnBuZw?x-oss-process=image/format,png)
- Pro,注意TTL为10s
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyOTc4XzIwMTkwNjI4MTg1OTQwNzYwLnBuZw?x-oss-process=image/format,png)
- 接着启动Pro,Con接收消息
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkyOTQ3XzIwMTkwNjI4MTkwODE5OS5wbmc?x-oss-process=image/format,png)
- 现在5条消息,10s后为0消息全部已清除
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkzMDA2XzIwMTkwNjI4MTkwOTQxNDEyLnBuZw?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3NjkzMjMzXzIwMTkwNjI4MTkxMDUwNTUyLnBuZw?x-oss-process=image/format,png)

通过本文的学习，希望大家对RabbitMQ有一个整体感知!
# 参考
[RabbitMQ官网](https://www.rabbitmq.com/tutorials/tutorial-five-java.html)
[mac + RabbitMQ 安装](https://www.jianshu.com/p/60c358235705)