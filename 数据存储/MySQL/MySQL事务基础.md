# 1 什么是事务
一种`可靠、一致的`方式,访问和操作数据库中数据的程序单元。

# 2 ACID性质
并非任意的对数据库的操作序列都是数据库事务。数据库事务拥有以下四个特性，习惯上被称之为ACID特性。

## 原子性（Atomicity）
一次事务包含在其中的对数据库的操作中的操作要么全部成功，要么全部失败。

## 一致性（Consistency）
跨表、跨行、跨事务，数据库始终保持一致状态。

事务应确保数据库的状态从一个一致状态转变为另一个一致状态。一致状态的含义是数据库中的数据应满足完整性约束
## 隔离性（Isolation）
可见性，保护事务不会互相干扰, 包含4种隔离级别多个事务并发执行时，一个事务的执行不应影响其他事务的执行
## 持久性（Durability）
事务提交成功后,不会丢数据。如电源故障, 系统崩溃。

# 3 案例
某人要在商店使用电子货币购买100元的东西，当中至少包括两个操作：
- 该人账户减少100元
- 商店账户增加100元

支持事务的数据库管理系统（transactional DBMS）就是要确保以上两个操作（整个“事务”）都能完成，或一起取消；否则就会出现100元平白消失或出现的情况。

但在现实情况下，失败的风险很高。在一个数据库事务的执行过程中，有可能会遇上事务操作失败、数据库系统／操作系统出错，甚至是存储介质出错等情况。这便需要DBMS对一个执行失败的事务执行恢复操作，将其数据库状态恢复到一致状态（数据的一致性得到保证的状态）。为了实现将数据库状态恢复到一致状态的功能，DBMS通常需要维护事务日志以追踪事务中所有影响数据库数据的操作。

# 4 MySQL 事务操作的 SQL

```sql
BEGIN TRANSACTION;
UPDATE t user SET amount = amount-100 WHERE username = 'Java';
UPDATE t user SET amount = amount+ 100 WHERE username = 'Edge';
COMMIT
-- ROLL BACK
```
那么问题来了，Java中如何实现操作呢？
- JDBC事务管理流程
![](https://img-blog.csdnimg.cn/20200315002539801.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

```java
Connection conn = getConnection();
conn.setAutoCommit(false);
Statement stmt1 = conn. prepareStatement(updateUser1SQL); 
stmt1.executeUpdate();
Statement stmt2 = conn.prepareStatement(updateUser2SQL); 
stmt2.executeUpdate();
conn.commit(); // or conn.rollback (); 事务的提交/回滚
```