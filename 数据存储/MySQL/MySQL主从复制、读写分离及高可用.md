# 1 单机 =》集群
随着数据量的增大，读写并发的增加，系统可用性要求的提升，单机 MySQL 出现危机：
- 容量问题，难以扩容，考虑数据库拆分、**分库分表**
- 读写压力，QPS 过大，特别是分析类需求会影响到业务事务，考虑多机集群、**主从复制**
- 高可用性不足，易宕机，考虑故障转移、MHA/MGR/Orchestrator
- 高峰时数据库连接数经常超过上限

> 一致性问题，考虑分布式事务，X/A 柔性事务

读写分离的实现是基于主从复制架构：一主多从，只写主库，主库会自动将数据同步到从库。

## 为什么要读写分离？
高并发场景下MySQL的一种优化方案，依靠主从复制使得MySQL实现了数据复制为多份，增强了抵抗 高并发读请求的能力，提升了MySQL查询性能同时，也提升了数据的安全性。当某一个MySQL节点，无论是主库还是从库故障时，还有其他的节点中存储着全量数据，保证数据不会丢失。

主库将变更写binlog日志，然后从库连接到主库后，从库有个I/O线程，将主库的binlog日志拷贝到本地，写入一个中继日志。
接着从库中有一个SQL线程会从中继日志读取binlog，然后执行binlog日志中的内容。即在本地再次执行一遍SQL，确保跟主库的数据相同。

# 2 MySQL主从复制
##  2.1 发展史

2000年，MySQL 3.23.15版本引入了复制
2002年，MySQL 4.0.2版本分离 IO 和 SQL 线程，引入了 relay log
2010年，MySQL 5.5版本引入半同步复制
2016年，MySQL 在5.7.17中引入 InnoDB Group Replication


## 2.2 核心
- 主库写 binlog
- 从库 relay log
![](https://img-blog.csdnimg.cn/20210201232044541.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
## binlog格式
- ROW
记录详细但日志量会比较大
- Statement
只是记录SQL，记录简单
没有查询语句
- Mixed

```sql
# 查看binlog
mysqlbinlog -vv mysql-bin.000005
```

## 异步复制
异步复制：经典的主从复制，Primary-Secondary Replication，2000年MySQL 3.23.15版本引入 Replication。

传统的MySQL复制提供了一种简单的主从复制方案。有一个主（source）并且有一或多个从（replicas）。主数据库execute事务，将其commit，然后将它们稍后（异步）发送给从数据库，以re-executed（在基于语句的复制中）或apply（在基于行的复制中）。它是一个无共享系统，默认情况下所有服务器都具有数据的完整副本。

- MySQL Asynchronous Replication
![](https://img-blog.csdnimg.cn/20210202121510248.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)![](https://img-blog.csdnimg.cn/20210202123049502.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)



### 优点
简单
### 缺点
- 网络或机器故障，会造成数据不一致




SQL的每个增删改的会改变数据的操作，除了更新数据外，对这个增删改操作还会写入一个日志文件，记录这个操作的日志，即binlog。

mysql 5.7新版本的并行复制，多个SQL线程，每个线程从relay日志里读一个库的
日志，重放。
从库同步主库数据的过程是**串行化**的，即主库上并行的操作，在从库上会串行执行。
由于从库从主库拷贝日志以及串行执行SQL的特点，在高并发下就有延时，从库数据一定比主库慢，所以经常出现，刚写入主库的数据读不到，要过几十甚至几百ms才能读到。
从库串行化过程：
1. 读取binlog日志
2. 写relay日志、应用日志变更到自己本地数据

从库的I/O线程，读取主库的binlog日志时，老版本是单线程，5.6.x之后的新版本改为多线程读取。

若主库宕机时，恰好数据还没同步到从库，则有些数据可能在从库上没有，可能就这么丢失了。

所以MySQL实际上在这有两个机制

半同步复制，它向协议添加了一个同步步骤。这意味着主数据库在提交时等待从数据库确认已接收到事务。只有这样，主数据库才会恢复提交操作。
## 半同步复制
2010 年引入Semisynchronous Replication，5.5 可用，解决主库数据丢失问题，保证 Source 和 Replica 的最终一致性。
需要启用插件。
![](https://img-blog.csdnimg.cn/20210202122803481.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210202123017251.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

1. 主库写入binlog日志后，会强制立即将数据同步到从库
2. 从库将日志写入自己的relay log后，会返回ack给主库
3. 主库接收到至少一个从库的ack后才会认为写操作完成

> 上面的图片可看到经典的异步MySQL复制协议（及其半同步变量）的示意图。不同实例之间的箭头表示服务器之间交换的消息或服务器与客户端应用程序之间交换的消息。


## 组复制
2016年引入，5.7 开始，启用插件。
![](https://img-blog.csdnimg.cn/20210202125837266.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

基于 Paxos 协议实现的组复制，保证数据一致性。


组复制是一种可用于实施容错系统的技术。复制组是一组服务器，每个服务器都有自己的完整数据副本（无共享复制方案），并通过消息传递相互交互。通信层提供了一组保证，例如原子消息和总订单消息传递。这些功能非常强大，可以转化为非常有用的抽象，可以用来构建更高级的数据库复制解决方案。

MySQL组复制建立在这些属性和抽象之上，并在所有复制协议中实现多源更新。一个复制组由多个服务器组成，该组中的每个服务器可以随时独立执行事务。但是，所有读写事务只有在组批准后才提交。换句话说，对于任何读写事务，组都需要决定是否提交，因此提交操作不是来自原始服务器的单方面决定。只读事务无需组内的任何协调即可立即提交。

当读写事务准备好在原始服务器上提交时，服务器自动广播写值（已更改的行）和相应的写集（已更新的行的唯一标识符）。由于事务是通过原子广播发送的，因此该组中的所有服务器都将接收该事务，否则将不会。如果他们收到了，那么相对于之前发送的其他事务，他们都将以相同的顺序收到它。因此，所有服务器都以相同的顺序接收相同的交易集，并且为交易建立了全局总订单。

但是，在不同服务器上同时执行的事务之间可能存在冲突。通过在称为认证的过程中检查并比较两个不同并发事务的写集，可以检测到此类冲突。在认证过程中，冲突检测是在行级别执行的：如果在不同服务器上执行的两个并发事务更新同一行，则存在冲突。冲突解决过程指出，已首先订购的事务在所有服务器上提交，而已订购第二的事务中止，因此在原始服务器上回滚并由组中的其他服务器丢弃。例如，如果t1和t2在不同的站点上同时执行，都更改了同一行，并且t2在t1之前排序，则t2赢得了冲突，并且t1被回滚。这实际上是一个分布式的首次提交胜出规则。请注意，如果两个事务之间的冲突经常发生，那么在同一个服务器上启动它们是一个好习惯，在那里，它们有机会在本地锁管理器上进行同步，而不必由于认证而回滚。

对于应用和外部化已认证的交易，如果不破坏一致性和有效性，组复制允许服务器偏离交易的约定顺序。组复制是最终的一致性系统，这意味着一旦传入流量减慢或停止，所有组成员将具有相同的数据内容。当流量在流动时，可以按略有不同的顺序对事务进行外部化，或者对某些成员先进行外部化。例如，在多主要模式下，尽管尚未应用全局顺序中较早的远程事务，但是本地事务可能会在认证后立即被外部化。当证明过程确定交易之间没有冲突时，这是允许的。在单主模式下，在主服务器上，并发，无冲突的本地事务以与组复制所同意的全局顺序不同的顺序进行提交和外部化的可能性很小。在不接受来自客户端的写操作的辅助服务器上，事务始终按照约定的顺序进行提交和外部化。

下图描述了MySQL组复制协议，通过将其与MySQL复制（甚至MySQL半同步复制）进行比较，您可以看到一些区别。请注意，为清楚起见，此图中缺少一些基本的共识和Paxos相关的消息。
![](https://img-blog.csdnimg.cn/20210202123232152.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 3 主从复制的缺点及解决方案
## 3.1 主从延迟
- 只能数据分片，把数据量做小

### 主从同步适用场景
推荐在读 >> 写，且读时对数据时效性要求不高时采用。所以可以考虑用MySQL的并行复制，但问题是那是库级别的并行，所以有时作用不是很大。

### 主从延迟严重解决方案
1. 分库 : 将一个主库拆分，每个主库的写并发就降低了，主从延迟即可忽略不计
2. 打开MySQL支持的并行复制，多个库并行复制，若某个库的写入并发特别高，写并发达到了2000/s，并行复制还是没意义。二八法则，很多时候比如说，就是少数的几个订单表，写入了2000/s，其他几十个表10/s。
从库开启多线程，并行读取relay log中不同库的日志，然后**并行重放不同库的日志**，这是**库级别的并行**。
3. 重构代码 : 重构代码，插入数据后，直接更新，不查询
4. 若确实存在必须先插入，立马要求查询，然后立马就反过来执行一些操作，对这个查询设置**直连主库**(不推荐，这会导致读写分离失去意义)

## 3.2 应用侧需要配合读写分离框架

### 读写分离
借助于主从复制，我们现在有了多个 MySQL 服务器示例。
如果借助这个新的集群，改进我们的业务系统数据处理能力？

最简单的就是配置多个数据源，实现读写分离
#### 动态切换数据源
1. 基于 Spring/Spring Boot，配置多个数据源(例如2个，master 和 slave)
2. 根据具体的 Service 方法是否会操作数据，注入不同的数据源，1.0版本

优化：
1.1：基于操作 AbstractRoutingDataSource 和自定义注解 readOnly 之类的，简化自动切换数据源
1.2：支持配置多个从库
1.3：支持多个从库的负载均衡
![](https://img-blog.csdnimg.cn/2021020217201480.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
#### 框架
“动态切换数据源”版问题：
- 代码侵入性强
- 降低侵入性会导致”写后立即读”不一致问题
写时（还没同步到从库），立马读（从库），导致你 insert 数据后去查却查不到！

改进方式，ShardingSphere-jdbc 的 Master-Slave 功能
1）SQL 解析和事务管理，自动实现读写分离
2）解决”写完读”不一致的问题
只要一个事务中解析到有写，所有读都读主库，而无需我们业务代码处理。

#### 数据库中间件
“框架版本”的问题？
- 对业务系统还是有侵入
- 对已存在的旧系统改造不友好

优化方案：MyCat/ShardingSphere-Proxy 的 Master-Slave 功能
- 需要部署一个中间件，规则配置在中间件
- 模拟一个 MySQL 服务器，对业务系统无侵入

但是该方案需要单独部署中间件，需要运维成本和领导审批，所以一般开发人员使用框架方案。

## 3.3  无法高可用
### 3.3.1 为什么要高可用
1、读写分离，提升读的处理能力
2、故障转移，提供 failover 能力

加上业务侧连接池的心跳重试，实现断线重连，业务不间断，降低RTO和RPO。

高可用意味着，更少的不可服务时间。一般用SLA/SLO衡量。

```bash
1年 = 365天 = 8760小时
99 = 8760 * 1% = 8760 * 0.01 = 87.6小时
99.9 = 8760 * 0.1% = 8760 * 0.001 = 8.76小时
99.99 = 8760 * 0.0001 = 0.876小时 = 0.876 * 60 = 52.6分钟
99.999 = 8760 * 0.00001 = 0.0876小时 = 0.0876 * 60 = 5.26分钟
```

###  3.3.2 failover，故障转移，灾难恢复
容灾：热备与冷备
对于主从来说，就是主挂了，某一个从，变成主，整个集群来看，正常对外提供服务。
常见的一些策略：
- 多个实例不在一个主机/机架上
- 跨机房和可用区部署
- 两地三中心容灾高可用方案

###  3.3.3 高可用方案
####  3.3.3.1 主从手动切换
如果主节点挂掉，将某个从改成主；重新配置其他从节点。修改应用数据源配置。
缺点：
1. 可能数据不一致
2. 需要人工干预
3. 代码和配置的侵入性

#### 3.3.3.2 主从手动切换
用 LVS+Keepalived 实现多个节点的探活+请求路由。
配置 VIP 或 DNS 实现配置不变更。
缺点：
- 手工处理主从切换
- 大量的配置和脚本定义

只能算半自动。
#### 3.3.3.2 MHA
MHA，Master High Availability，目前在 MySQL 高可用方面是一个相对成熟的解决方案，它由日本 DeNA 公司的 youshimaton（现就职于 Facebook）开发，是一套优秀的作为 MySQL 高可用性环境下故障切换和主从提升的高可用软件。
![](https://img-blog.csdnimg.cn/20210202210732135.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

基于 Perl 语言开发，一般能在30s内实现主从切换。
切换时，直接通过 SSH 复制主节点的日志。

缺点：
- 需要配置 SSH 信息
- 至少3台
#### 3.3.3.2 MGR
不借助外部力量，只使用 MySQL 本身。如果主节点挂掉，将自动选择某个从改成主；无需人工干预，基于组复制，保证数据一致性。
![](https://img-blog.csdnimg.cn/20210202211228144.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

缺点：
- 外部获得状态变更需要读取数据库
- 外部需要使用 LVS/VIP 配置

特点：
- 高一致性
基于分布式Paxos协议实现组复制，保证数据一致性
- 高容错性
自动检测机制，只要不是大多数节点都宕机就可继续工作，内置防脑裂保护机制
- 高扩展性
节点的增加与移除会自动更新组成员信息，新节点加入后，自动从其他节点同步增量数据，直到与其他节点数据一致
- 高灵活性
提供单主模式和多主模式，单主模式在主库宕机后能够自动选主，所有写入都在主节点进行，多主模式支持多节点写入

适用场景：
- 弹性复制
需要非常流畅的复制基础架构的环境，其中服务器的数量必须动态地增长或缩减，而最少尽可能的痛苦。
![](https://img-blog.csdnimg.cn/20210202212608960.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 高可用分片
Sharding is a popular approach to achieve write scale-out. Users can use MySQL Group Replication to implement highly available shards. Each shard
can map into a Replication Group.
分片是实现写横向扩展的一种流行方法。用户可以使用MySQL组复制来实现高度可用的分片。每个分片可以映射到副本组。
![](https://img-blog.csdnimg.cn/20210202212748415.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

#### 3.3.3.4 MySQL Cluster
完整的数据库层高可用解决方案。
**MySQL InnoDB Cluster**是一个高可用的框架，构成组件： 
- MySQL Group Replication
提供DB的扩展、自动故障转移
- MySQL Router
轻量级中间件，提供应用程序连接目标的故障转移。MySQL Router是一个轻量级的中间件，可以提供负载均衡和应用连接的故障转移。它是MySQL团队为MGR量身打造的，通过使用Router和Shell,用户可以利用MGR实现完整的数据库层的解决方案。如果您在使用MGR，请一定配合使用Router和Shell，可以理解为它们是为MGR而生的，会配合MySQl 的开发路线图发展的工具。
- MySQL Shell
新的MySQL客户端，多种接口模式。可以设置群组复制及Router。MySQL Shell是MySQL团队打造的一个统一的客户端， 它可以对MySQL执行数据操作和管理。它支持通过JavaScript，Python，SQL对关系型数据模式和文档型数据模式进行操作。使用它可以轻松配置管理InnoDB Cluster。
![](https://img-blog.csdnimg.cn/20210202224102202.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
#### 3.3.3.5 Orchestrator
如果主节点挂掉，将某个从改成主。
一款MySQL高可用和复制拓扑管理工具，支持复制拓扑结构的调整，自动故障转移和手动主从切换等。后端数据库用MySQL或SQLite存储元数据，并提供Web界面展示MySQl 复制的拓扑关系及状态，通过Web可更改MySQL实例的复制关系和部分配置信息，同时也提供命令行和API接口，方便运维管理。

特点:
1. 自动发现MySQL的复 制拓扑，并且在web.上展示;
2. 重构复制关系， 可以在web进行拖图来进行复制关系变更;
3. 检测主异常，并可以自动或手动恢复，通过Hooks进行自定义脚本;
4. 支持命令行和web界面管理复制。

基于 Go 语言开发，实现了中间件本身的高可用。

两种部署方式
orchestrator/raft：
1. 数据一致性由orchestrator的raft协议保证
2. 数据库之间不通信
orchestrator/[galera | xtradb cluster | innodb cluster]:
1. 数据一致性由数据库集群保证
2. 数据库结点之间通信

如果不部署client
1. 使用HTTP (/api/leader-check)查询并路由到主节点

优势：
能直接在 UI 界面
拖拽改变主从关系
![](https://img-blog.csdnimg.cn/20210202231819583.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

> 参考 
> - https://dev.mysql.com/doc/refman/5.7/en/group-replication-primary-secondary-replication.html