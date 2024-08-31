# RocketMQ各版本新特性

## RocketMQ 3.0.0

新增：支持Master/Slave的强一致性保障
新增：支持多Master多Slave的部署架构
新增：消息可靠性保障，确保消息不丢失
新增：支持每秒上百万消息的处理能力

## RocketMQ 3.2.6版本

新增：增加了对事务消息的支持
新增：增加了对批量消息的支持
新增：增加了对消息过滤（基于TAG和SQL92）的支持
新增：增加了对消息顺序发送和消费的支持

## 2016-09-21 RocketMQ 3.5.8



## 2017-02-21 RocketMQ 4.0.0版本

新增：增加了对延迟消息的支持

新增：增加了DLQ（死信队列）的支持

新增：增加了对IPv6网络环境的支持

新增：增加了消费进度跨集群的支持



- Pub/Sub 和 P2P 消息传递模型
- 在同一个队列中实现可靠的先进先出（FIFO）和严格的顺序消息传递
- 长轮询队列模型，也支持推送消费方式
- 单个队列中可积累数百万条消息的能力
- 支持多种消息协议，例如 JMS、MQTT 等。
- 分布式高可用部署架构，满足至少一次消息传递语义
- 用于隔离测试和云隔离集群的 Docker 镜像
  功能丰富的管理仪表板，用于配置、指标和监控

## RocketMQ 4.3.0版本

新增：增加了RocketMQ-Console新版监控平台

新增：增加了对批量消息最大限制的支持

改进：消费者消费重试优化，为每一种消费结果添加了不同的延迟级别

正式引入了事务消息，如果大家希望使用事务消息，其版本最低建议为 4.6.1。

## RocketMQ 4.4.0版本

### 权限控制 (ACL)

该特性主要为 RocketMQ 提供权限访问控制。其中，用户可以通过 yaml 配置文件来定义权限访问的相关属性，包括白名单 IP 地址、用户的 AK/SK 访问秘钥对、Topic 和 ConsumerGroup 的访问权限。这样，Topic 资源之间也就具备了一定的隔离性，用户无法访问没有权限的 Topic 资源。同时，开源用户使用带有 ACL 鉴权信息的开源客户端可以无缝对接云 MQ，而无需对业务系统进行任何的其他改造。 社区 RIP [ACL] 链接：[https://github.com/apache/rocketmq/wiki/RIP-5-RocketMQ-ACL](https://www.oschina.net/action/GoToLink?url=https%3A%2F%2Fgithub.com%2Fapache%2Frocketmq%2Fwiki%2FRIP-5-RocketMQ-ACL)

### 消息轨迹 (Msg Trace)

消息轨迹主要指的是一条消息从生产方发出到消费方消费处理，整个过程中的各个相关节点的时间地点等数据汇聚而成的完整链路信息。RocketMQ 中的一条消息的完整链路包含消息生产方、Broker 服务方、消息消费方三个角色，这其中每个部分处理消息的过程中都会在轨迹链路中增加相关的信息，将这些信息汇聚即可获取任意消息的当前状态，从而为生产环境中的问题排查提供强有力的数据支持。 社区 RIP [Msg_Trace] 链接：[https://github.com/apache/rocketmq/wiki/RIP-6-Message-Trace](https://www.oschina.net/action/GoToLink?url=https%3A%2F%2Fgithub.com%2Fapache%2Frocketmq%2Fwiki%2FRIP-6-Message-Trace)

如果需要使用这些功能，其版本最低建议为 4.7.0。

## RocketMQ 4.5.0版本

新增：增加了对消息的事务性发送和消费的支持

新增：增加了新的基于SQL92标准的过滤器

新增：增加了消费者流控功能

新增：增加了消费者组的动态调整功能

引入了多副本(主从切换)，其版本建议使用4.7.0。

## RocketMQ 4.6.0

支持了消息轨迹，可以追踪消息从生产到消费的全过程。

提供了命令行工具，方便用户管理和监控RocketMQ集群。

引入了请求-响应模型。

## RocketMQ 4.7.0

支持了RocketMQ的集群复制和迁移。

使用新的日志框架SLF4J来增强日志的管理。

改进了对Docker和Kubernetes的支持。

## RocketMQ 4.8.0

提供了新的消息回查机制，提高了事务消息的性能和可靠性。

改进了命令行工具，增加了新的命令和选项，提高了易用性。

https://mp.weixin.qq.com/s/jxepHRioglqiOlX2pImC7A

## RocketMQ 5.0.0

POP消费模式
增加Proxy代理层
Controller模式

## 2023年2月20号 RocketMQ 5.1.0

1. Proxy 支持 Remoting 协议。 [#5575](https://github.com/apache/rocketmq/pull/5575)
2. Pop 顺序消息模式能力增强，支持动态修改不可见时间[#5367](https://github.com/apache/rocketmq/pull/5367)，增加通知机制，提升消费实时性[#5387](https://github.com/apache/rocketmq/pull/5387)。
3. Broker 启动加速，ConsumeQueue 并发加载。[#5093](https://github.com/apache/rocketmq/pull/5093)
4. 性能提升，事务消息 Compaction 批量优化。[#5386](https://github.com/apache/rocketmq/pull/5386)
5. 位点重置特性优化，支持服务端位点重置，支持广播消费模式、Pop 消费模式的重置场景。[#5293](https://github.com/apache/rocketmq/pull/5293)
6. 可观测增强，增加客户端连接、消费延迟、定时器、Pop、网络、存储指标
7. 兼容 RocketMQ MQTT 位点保存。[#5208](https://github.com/apache/rocketmq/pull/5208)
8. 增加 CompactTopic 删除策略。[#5260](https://github.com/apache/rocketmq/pull/5260)
9. 5.0 客户端增加 BrokerName 字段传输，弱化 RocketMQ 架构的 Broker 状态。[#5334](https://github.com/apache/rocketmq/pull/5334)
10. 网络模块优化，网络拥塞背压，快速失败；在 remoting 协议支持 RPC 响应时间分布统计，并输出日志； 网络异常日志输出优化；
11. 消息生命周期定义富化，增加就绪、inflight 状态。[#5357](https://github.com/apache/rocketmq/pull/5357)

更多细节详见[https://github.com/apache/rocketmq/releases/tag/rocketmq-all-5.1.0](https://github.com/apache/rocketmq/releases/tag/rocketmq-all-5.1.0?spm=5176.29160081.0.0.a2803e35mJrexy&file=rocketmq-all-5.1.0)

## RocketMQ 5.2.0 2024年2月14号 

1. 发布百万级队列实现，基于 rocksdb 实现 consume queue，RocketMQ 单机 topic、队列数从十万级提升到百万级。更适用于物联网海量队列、移动 APP 的场景。[详见](https://github.com/apache/rocketmq/issues/7064)
2. 在多级存储的基础上，实现面向海量消息规模的消息索引能力。使得多级存储的消息和本地消息都具备同样的索引能力，消息查询能力。[详见](https://github.com/apache/rocketmq/issues/7545)
3. 5.0 HA 升级，基于 Jraft 的 HA controller，具备更完整、更成熟的高可用能力。[详见](https://github.com/apache/rocketmq/issues/7300)
4. 支持多级存储更丰富的消费能力，新增 tag 过滤和 sql 过滤消费模式。
5. 无损变更能力增强，客户端增加优雅断开和重连机制。

更多细节详见 https://github.com/apache/rocketmq/releases/tag/rocketmq-all-5.2.0

## 2024年7月17号发布 5.3.0

1. RocketMQ 权限认证体系进行了全面升级，发布了 ACL 2.0。
2. 在多级存储基础上提供了 Topic 粒度的 TTL，支持更细粒度的消息保留时长。
3. 消费链路性能优化，针对多级存储的 tag 消费模式、长轮询 Pop 的 SQL 过滤消费模式进行性能优化，提升数倍性能。
4. 增强可观测能力，新增多项 metric，包括 rocketmq_topic_number、rocketmq_consumer_group_number、rocketmq_topic_create_execution_time 等

更多细节详见 https://github.com/apache/rocketmq/releases/tag/rocketmq-all-5.3.0

## 特点

RocketMQ Client 相关的变更非常少，即与用户关系紧密的消息发送、消息消费这块的代码非常的稳定，理论上基本不存在兼容性问题

并且每一个版本都修复了一些重大的BUG，性能提升也比较明显，

## 升级步骤

https://www.51cto.com/article/658043.html