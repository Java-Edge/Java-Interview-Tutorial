# 04-Seata是什么?

开源分布式事务解决方案，提供高性能和简单易用的分布式事务服务。Seata 提供 AT、TCC、SAGA 和 XA 事务模式，为用户打造一站式分布式解决方案。 

![](https://user-images.githubusercontent.com/68344696/145942191-7a2d469f-94c8-4cd2-8c7e-46ad75683636.png)

## 1 AT 模式

### 1.1 前提

- 基于支持本地 ACID 事务的关系型数据库
- Java应用通过 JDBC 访问数据库

### 1.2 整体机制

2PC协议演变：

- 一阶段：业务数据和回滚日志记录在同一本地事务中提交，释放本地锁和连接资源。
- 二阶段：
  - 提交异步化，极速完成
  - 回滚，通过一阶段的回滚日志进行反向补偿

## 2 写隔离

- 一阶段本地事务提交前，要确保先拿到 **全局锁** 
- 拿不到 **全局锁** ，不能提交本地事务
- 拿 **全局锁** 的尝试被限制在一定范围内，超出范围将放弃，并回滚本地事务并释放本地锁

### 2.1 示例

两个全局事务tx1、tx2，分别对 a 表m字段进行更新操作，m初始值1000。

- tx1先开启本地事务
- 拿到本地锁，更新操作m = 1000 - 100 = 900
- 本地事务提交前，先拿到该记录的 **全局锁** 
- 本地提交，释放本地锁
- tx2后开始，开启本地事务
- 拿到本地锁，更新操作 m = 900 - 100 = 800
- 本地事务提交前，尝试拿该记录的 **全局锁** 
- tx1 全局提交前，该记录的全局锁被 tx1 持有，tx2 需重试等待 **全局锁** 

![Write-Isolation: Commit](https://img.alicdn.com/tfs/TB1zaknwVY7gK0jSZKzXXaikpXa-702-521.png)

- tx1二阶段全局提交
- 释放 **全局锁**
- tx2 拿到 **全局锁** 提交本地事务

![Write-Isolation: Rollback](https://img.alicdn.com/tfs/TB1xW0UwubviK0jSZFNXXaApXXa-718-521.png)

如 tx1 的二阶段全局回滚，则 tx1 需重新获取该数据的本地锁，进行反向补偿的更新操作，实现分支回滚。

此时，如 tx2 仍在等待该数据的 **全局锁**，同时持有本地锁，则 tx1 的分支回滚会失败。分支的回滚会一直重试，直到 tx2 的 **全局锁** 等锁超时，放弃 **全局锁** 并回滚本地事务释放本地锁，tx1 分支回滚最终成功。

因为整个过程 **全局锁** 在 tx1 结束前一直被 tx1 持有，所以不会 **脏写** 。

## 3 读隔离

数据库本地事务隔离级别 **读已提交（Read Committed）** 或以上，Seata（AT 模式）默认全局隔离级别是 **读未提交（Read Uncommitted）** 。

如应用在特定场景下，必需要求全局的 **读已提交** ，目前 Seata 是通过 SELECT FOR UPDATE 语句的代理。

![Read Isolation: SELECT FOR UPDATE](https://img.alicdn.com/tfs/TB138wuwYj1gK0jSZFuXXcrHpXa-724-521.png)

SELECT FOR UPDATE 执行会申请 **全局锁** ，如 **全局锁** 被其他事务持有，则释放本地锁（回滚 SELECT FOR UPDATE 语句的本地执行）并重试。这过程中，查询是被 block 住的，直到 **全局锁** 拿到，即读取的相关数据是 **已提交** 的才返回。

总体性能考虑，Seata目前没有对所有 SELECT 语句都代理，仅针对 FOR UPDATE 的 SELECT 语句。

## 4 工作机制

整个 AT 分支的工作过程。业务表：`product`

| Field | Type         | Key  |
| ----- | ------------ | ---- |
| id    | bigint(20)   | PRI  |
| name  | varchar(100) |      |
| since | varchar(100) |      |

AT 分支事务的业务逻辑：

```sql
update product set name = 'GTS' where name = 'TXC';
```

### 4.1 一阶段

1. 解析SQL：得到SQL类型（UPDATE），表（product），条件（where name = 'TXC'）等信息
2. 查询前镜像：根据解析得到的条件信息，生成查询语句，定位数据

```sql
select id, name, since from product where name = 'TXC';
```

得到前镜像：

| id   | name | since |
| ---- | ---- | ----- |
| 1    | TXC  | 2014  |

1. 执行业务 SQL：更新这条记录的 name 为 'GTS'
2. 查询后镜像：根据前镜像的结果，通过 **主键** 定位数据

```sql
select id, name, since from product where id = 1;
```

得到后镜像：

| id   | name | since |
| ---- | ---- | ----- |
| 1    | GTS  | 2014  |

1. 插入回滚日志：把前后镜像数据及业务 SQL 相关的信息组成一条回滚日志记录，插入 `UNDO_LOG` 表。

```json
{
	"branchId": 641789253,
	"undoItems": [{
		"afterImage": {
			"rows": [{
				"fields": [{
					"name": "id",
					"type": 4,
					"value": 1
				}, {
					"name": "name",
					"type": 12,
					"value": "GTS"
				}, {
					"name": "since",
					"type": 12,
					"value": "2014"
				}]
			}],
			"tableName": "product"
		},
		"beforeImage": {
			"rows": [{
				"fields": [{
					"name": "id",
					"type": 4,
					"value": 1
				}, {
					"name": "name",
					"type": 12,
					"value": "TXC"
				}, {
					"name": "since",
					"type": 12,
					"value": "2014"
				}]
			}],
			"tableName": "product"
		},
		"sqlType": "UPDATE"
	}],
	"xid": "xid:xxx"
}
```

1. 提交前，向 TC 注册分支：申请 `product` 表中，主键值等于 1 的记录的 **全局锁** 
2. 本地事务提交：业务数据的更新和前面步骤中生成的 UNDO LOG 一并提交
3. 将本地事务提交的结果上报给 TC

### 4.2 二阶段-回滚

1. 收到 TC 的分支回滚请求，开启一个本地事务，执行如下操作
2. 通过 XID 和 Branch ID 查找到相应 UNDO LOG 记录
3. 数据校验：拿 UNDO LOG 中的后镜与当前数据比较，如有不同，说明数据被当前全局事务外的动作做了修改。这就需要根据配置策略来做处理
4. 根据 UNDO LOG 中的前镜像和业务 SQL 的相关信息生成并执行回滚的语句：

```sql
update product set name = 'TXC' where id = 1;
```

1. 提交本地事务。并把本地事务的执行结果（即分支事务回滚的结果）上报给 TC。

### 4.3 二阶段-提交

1. 收到 TC 的分支提交请求，把请求放入一个异步任务的队列中，马上返回提交成功的结果给 TC。
2. 异步任务阶段的分支提交请求将异步和批量地删除相应 UNDO LOG 记录。

## 附录

### 回滚日志表

UNDO_LOG Table，以 MySQL 为例：

| Field         | Type         |
| ------------- | ------------ |
| branch_id     | bigint PK    |
| xid           | varchar(100) |
| context       | varchar(128) |
| rollback_info | longblob     |
| log_status    | tinyint      |
| log_created   | datetime     |
| log_modified  | datetime     |

```sql
-- 注意此处0.7.0+ 增加字段 context
CREATE TABLE `undo_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `branch_id` bigint(20) NOT NULL,
  `xid` varchar(100) NOT NULL,
  `context` varchar(128) NOT NULL,
  `rollback_info` longblob NOT NULL,
  `log_status` int(11) NOT NULL,
  `log_created` datetime NOT NULL,
  `log_modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_undo_log` (`xid`,`branch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
```

## TCC 模式

一个分布式的全局事务，整体是 **两阶段提交** 模型。全局事务是由若干分支事务组成，分支事务要满足 **两阶段提交** 模型要求，即需要每个分支事务都具备自己的：

- 一阶段 prepare 行为
- 二阶段 commit/rollback 行为

![](https://img.alicdn.com/tfs/TB14Kguw1H2gK0jSZJnXXaT1FXa-853-482.png)

根据两阶段行为模式的不同，分支事务划分：

-  **Automatic (Branch) Transaction Mode** 
-  **Manual (Branch) Transaction Mode**

AT 模式（[参考链接 TBD](https://seata.io/zh-cn/docs/overview/what-is-seata.html)）基于 **支持本地 ACID 事务** 的 **关系型数据库**：

- 一阶段 prepare 行为：在本地事务中，一并提交业务数据更新和相应回滚日志记录。
- 二阶段 commit 行为：马上成功结束，**自动** 异步批量清理回滚日志。
- 二阶段 rollback 行为：通过回滚日志，**自动** 生成补偿操作，完成数据回滚。

相应的，TCC 模式，不依赖于底层数据资源的事务支持：

- 一阶段 prepare 行为：调用 **自定义** 的 prepare 逻辑。
- 二阶段 commit 行为：调用 **自定义** 的 commit 逻辑。
- 二阶段 rollback 行为：调用 **自定义** 的 rollback 逻辑。

TCC 模式，指支持把 **自定义** 的分支事务纳入到全局事务的管理中。

## Saga 模式

SEATA提供的长事务解决方案，业务流程每个参与者都提交本地事务，当某个参与者失败，则补偿前面已成功参与者，一阶段正向服务和二阶段补偿服务都由业务开发实现：

Saga模式示意图：

![](https://img.alicdn.com/tfs/TB1Y2kuw7T2gK0jSZFkXXcIQFXa-445-444.png)

理论基础：Hector & Kenneth 发表论⽂ Sagas （1987）

## 适用场景

- 业务流程长、业务流程多
- 参与者包含其它公司或遗留系统服务，无法提供 TCC 模式要求的三个接口

## 优势

- 一阶段提交本地事务，无锁，高性能
- 事件驱动架构，参与者可异步执行，高吞吐
- 补偿服务易于实现

## 缺点

- 不保证隔离性（应对方案见[用户文档](https://seata.io/zh-cn/docs/user/saga.html)）

## Seata术语

#### TC (Transaction Coordinator) - 事务协调者

维护全局和分支事务的状态，驱动全局事务提交或回滚。

#### TM (Transaction Manager) - 事务管理器

定义全局事务的范围：开始全局事务、提交或回滚全局事务。

#### RM (Resource Manager) - 资源管理器

管理分支事务处理的资源，与TC交谈以注册分支事务和报告分支事务的状态，并驱动分支事务提交或回滚。