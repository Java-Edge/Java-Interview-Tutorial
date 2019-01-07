# 0  [Github](https://github.com/Wasabi1234)

# 1 面试题

ZooKeeper的适用场景?

# 2 考点分析

现在聊的面试主题，是分布式系统，其实跟你聊完Dubbo以及相关的一些问题，确认你现在分布式服务框架，RPC框架，基本都有一些认知.

下面,可能开始要跟你聊分布式相关的其他问题了.

分布式锁这个东西，还是很常用的，做Java开发，分布式系统，可能会有一些场景会用到.

最常用的分布式锁就是ZooKeeper来实现.

这个问题，一般就是看看你是否了解ZK，因为ZK是分布式系统中的一个基础系统.

问的话常问的就是说ZK的使用场景是什么？看你知道不知道一些基本的使用场景.

但是其实ZK挖深了自然也是可以很深很深!

# 3 ZooKeeper的适用场景

## 3.1 分布式协调

这是ZK很经典的一个用法

- ZooKeeper的分布式协调场景图![](https://ask.qcloudimg.com/http-save/1752328/38j6wsemzh.png)

如上图所示,系统A发送一个请求到MQ，然后系统B消费消息之后处理了。那系统A如何知道系统B的处理结果?

用ZK就可实现分布式系统之间的协调工作!

系统A发送请求之后可以在ZK上对某个节点的值注册监听器，一旦系统B处理完了就修改ZK那个节点的值，A立马就可以收到通知，完美解决~

## 3.2 分布式锁

- ZooKeeper的分布式锁场景图
![](https://ask.qcloudimg.com/http-save/1752328/txasblc01j.png)
对某一个数据连续发出两个修改操作，两台机器同时收到了请求，但只能一台机器先执行另外一个后执行.
那么此时就可以使用ZK分布式锁:
- 一个机器接收到了请求之后先获取ZK上的锁，即可以去创建一个znode，接着执行操作
- 然后另外一个机器也尝试去创建那个znode，结果发现自己创建不了，因为被别人创建了,那只能等着，等第一个机器执行完了自己再执行

## 3.3 元数据/配置信息管理

- ZooKeeper的元数据/配置管理场景
![](https://ask.qcloudimg.com/http-save/1752328/2okg4rsg2r.png)
ZK可以用作很多系统的配置信息的管理，比如Kafka、Storm等等很多分布式系统都会用ZK来做一些元数据、配置信息的管理，包括Dubbo注册中心

## 3.4 HA高可用性

- ZooKeeper的HA高可用性场景
![](https://ask.qcloudimg.com/http-save/1752328/eeuv23gxte.png)
这个应该是很常见的，比如hadoop、hdfs、yarn等很多大数据系统，都选择基于ZK来开发HA高可用机制，就是一个重要进程一般会做主备两个，主进程挂了立马通过ZK感知到切换到备用进程


# 参考

- 《Java工程师面试突击第1季-中华石杉老师》

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)
## [Github](https://github.com/Wasabi1234)
