# 03-Seata柔性事务

## 1 核心概念

AT 事务的目标是在微服务架构下，提供增量的事务 ACID 语意，让开发者像使用本地事务一样，使用分布式事务，核心理念同ShardingSphere。

Seata AT 事务模型包含：

- TM事务管理器：全局事务的发起方，负责全局事务开启，提交和回滚

- RM资源管理器：全局事务的参与者，负责分支事务的执行结果上报，并通过 TC 的协调进行分支事务的提交和回滚

- TC事务协调器

TC是独立部署的服务，TM、RM 以 jar 包同业务应用一同部署，它们同 TC 建立长连接，整个事务生命周期内，保持远程通信。

Seata 管理的分布式事务的典型生命周期：

1. TM 要求 TC 开始一个全新的全局事务。TC 生成一个代表该全局事务的 XID。
2. XID 贯穿于微服务的整个调用链。
3. 作为该 XID 对应到的 TC 下的全局事务的一部分，RM 注册本地事务。
4. TM 要求 TC 提交或回滚 XID 对应的全局事务。
5. TC 驱动 XID 对应的全局事务下的所有分支事务完成提交或回滚。

Seata AT事务模型：

![](https://static.sitestack.cn/projects/shardingsphere-5.0.0-beta/0453ba86b501b6a496cadb45782dc523.png)

## 2 实现原理

整合 Seata AT 事务时，需将 TM，RM 和 TC 的模型融入ShardingSphere的分布式事务生态。

在数据库资源上，Seata 通过对接 `DataSource` 接口，让 JDBC 操作可以同 TC 进行远程通信。 ShardingSphere 也面向 `DataSource` 接口，对用户配置的数据源进行聚合。 因此，将 `DataSource` 封装为 基于Seata 的 `DataSource` 后，就可将 Seata AT 事务融入到ShardingSphere的分片生态中。

![柔性事务Seata](https://static.sitestack.cn/projects/shardingsphere-5.0.0-beta/7a573bcb380c5e716cee5ae319d721f1.png)

### 引擎初始化

包含 Seata 柔性事务的应用启动时，用户配置的数据源会根据 `seata.conf` 的配置，适配为 Seata 事务所需的 `DataSourceProxy`，并且注册至 RM。

### 开启全局事务

- TM 控制全局事务的边界，TM 通过向 TC 发送 Begin 指令，获取全局事务 ID
- 所有分支事务通过此全局事务 ID，参与到全局事务中
- 全局事务 ID 的上下文存放在当前线程变量

### 执行真实分片SQL

处于 Seata 全局事务中的分片 SQL 通过 RM 生成 undo 快照，并发送 `participate` 指令至 TC，加入全局事务。

由于 ShardingSphere 的分片物理 SQL 采取多线程，因此整合 Seata AT 事务时，需要在主线程、子线程间进行全局事务 ID 的上下文传递。

### 提交或回滚事务

提交 Seata 事务时，TM 会向 TC 发送全局事务的提交或回滚指令，TC 根据全局事务 ID 协调所有分支事务进行提交或回滚。

## 3 使用规范

### 支持项

- 支持数据分片后的跨库事务；
- 支持RC隔离级别；
- 通过undo快照进行事务回滚；
- 支持服务宕机后的，自动恢复提交中的事务。

### 不支持项

- 不支持除RC之外的隔离级别。

### 待优化项

- Apache ShardingSphere 和 Seata 重复 SQL 解析。