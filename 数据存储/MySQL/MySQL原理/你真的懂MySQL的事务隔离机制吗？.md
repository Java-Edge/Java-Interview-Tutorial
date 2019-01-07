> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

默认使用MySQL 5.5后的InnoDB引擎。

# 1 隔离性与隔离级别
ACID的I - “隔离性”。当db上有多事务同时执行时，可能出现如下问题：
- 脏读（dirty read）
- 不可重复读（non-repeatable read）
- 幻读（phantom read）


为解决上述问题，隔离级别诞生了。级别越高，性能越低。因此要根据业务折中选择。

## 1.1 事务隔离级别
- 读未提交（read uncommitted，RU）
一个事务还没提交，它的变更就能被其它事务看到
- 读已提交（read committed，RC）
一个事务提交后，其变更才会被其他事务看到
- 可重复读（repeatable read，RR）
一个事务执行过程中看到的数据，和该事务在启动时看到的数据一致。
自然未提交的变更对其他事务也是不可见的。一个事务启动时，能够看到所有已提交的事务结果。但之后的该事务执行期间，其他事务的更新对它就不可见了
- 串行化（serializable）
对同行记录，“写”加“写锁”，“读”加“读锁”。出现读写锁冲突时，后访问的事务必须等前一个事务执行完成

## 1.2 示例
假设表T中仅一列，一行值1：

```sql
create table T(c int) engine=InnoDB;
insert into T(c) values(1);
```
- 如下为按照时间顺序执行两个事务的行为。（B 比 A 稍后被访问）

|事务 A|事务 B  |
|--|--|
| 启动事务，查询得到值 1 |  启动事务 |
| |  查询得到值 1 |
|  |  将 1改成 2 |
| 查询得到值 V1 |   |
|  |  提交事务B |
|  查询得到值 V2 |   |
| 提交事务A |   |
| 查询得到值 V3 |  |

下面具体来看不同隔离级别的事务A返回结果，即V1、V2、V3是什么。
- 读未提交
显然读取了未提交的事务B修改后的值都是2
- 读已提交
V1是1；读取到提交后的B，V2、V3值为2
- 可重复读
V1、V2（事务在执行期间，即未提交前，看到的数据全程一致）是1，V3是2
- 串行化
事务B执行“将1改成2”时，会被锁。直到事务A提交后，事务B（后访问的事务）才可继续执行。
所以在A看来， V1、V2是1，V3是2。

## 1.3 原来是视图
实现上，db里会创建一个视图，访问时以视图的逻辑结果为准。
- 可重复读
视图在事务启动时创建，整个事务存在期间都只用该视图
- 读提交
视图在每个SQL语句开始执行时创建。RC下，一个select语句S1在它开始时刻照快照，然后S1语句运行期间如果有其他并发事务提交并且他们正好修改了满足S1过滤条件的行，那么S1并不能看到那些事务最新的改动，返回的是S1的快照中已提交的事务的改动。
- 读未提交
直接返回记录上的最新值，无视图
- 串行化
直接加锁避免并行（注意这里不是并发概念的同时间段）访问

# 2 隔离级别的配置
若想更改，可将启动参数transaction-isolation的值set成READ-COMMITTED。

可用show variables来查看当前值。

- `show variables like 'transaction_isolation'`![](https://img-blog.csdnimg.cn/20200715234500847.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

# 3 何时使用可重复读？
比如银行账户表。一个表存每月月底的余额，一个表存账单明细。
- 业务要求做数据校对
即判断上月余额和当前余额的差额，是否与本月账单明细一致。
- 希望在校对过程中，即使有用户发生了一笔新的交易，也不影响校对结果
这时候使用“可重复读”隔离级别就很方便。

事务启动时的视图可认为是静态的，不受其他事务更新影响。

#  4 事务隔离的实现 - undo log
MySQL的每条记录在更新时都会同时记录一条回滚操作。记录上的最新值，通过回滚操作，都可得到前一个状态的值。

## 4.1 示例
假设一个值从1被按顺序改成2、3、4

- undo log中的记录：
![](https://img-blog.csdnimg.cn/20200911032936782.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)

当前值4，但在查询这记录时，不同时刻启动事务有不同read-view。
在视图A、B、C，该记录的值分别是1、2、4，同一记录在系统中可存在多版本，即多版本并发控制（MVCC）。

对read-view A，要得到1，就必须将当前值依次执行图中所有的回滚操作得到。
即使现在有另外一个事务正在将4改成5，这个事务跟read-view A、B、C对应的事务是不会冲突的。

## 何时删除undo log？
不需要时才删除。
即系统会自己判断，当没有事务再用到这些undo log，undo log就会被删除。

## 何时不需要undo log？
当系统里没有比该undo log更早的read-view时。

# 5 避免长事务
长事务意味着系统里面会存在很老的事务视图。由于这些事务随时可能访问db里的任何数据，所以该事务提交之前，db里它可能用到的回滚记录都必须保留，导致大量占存储。

在MySQL 5.5及以前，undo log是跟数据字典一起放在ibdata文件，即使长事务最终提交，回滚段被清理，文件也不会变小。

除了对回滚段影响，长事务还占用锁资源，可能拖慢全库。

# 6 事务启动方式
开发同学并不是有意长事务，通常误用。其实MySQL的事务启动方式有以下几种：

## 6.1 显式启动事务
begin 或 start transaction。配套的
- 提交语句 commit
- 回滚语句 rollback

## 6.2 set autocommit=1
```sql
set autocommit=0 
```
将该线程的自动提交关闭。如果你只执行一个select，事务就启动了，且不会自动提交。
该事务会持续存在，直到主动执行commit 或 rollback，或断开连接。

有些客户端连接框架会默认连接成功后先执行
```sql
set autocommit=0
```
导致接下来的查询都在事务中，若是长连接，就导致意外的长事务。
因此建议总用
```sql
set autocommit=1
```
显式启动事务。

频繁事务的业务，第二种方式每个事务在开始时都不需要主动执行一次 “begin”，减少了语句交互次数。如果你也有这个顾虑，建议使用commit work and chain。

autocommit为1时，用begin显式启动的事务，若执行commit，则提交事务。
若执行 commit work and chain，则是提交事务并自动启动下个事务，省去执行begin语句的开销。从程序开发的角度也能明确知道每个语句是否处于事务。

# 7 查询长事务
information_schema库的innodb_trx表中查询长事务
- 查找持续时间超过60s的事务。
```sql
select * from information_schema.innodb_trx where
TIME_TO_SEC(timediff(now(),trx_started))>60
```

# 8 日备 V.S 周备
好处是“最长恢复时间”更短。
- 一天一备
最坏情况下需要应用一天的binlog。比如，你每天0点做一次全量备份，而要恢复出一个到昨天晚上23点的备份
- 一周一备
最坏情况就要应用一周的binlog啦！

系统的对应指标是RTO（恢复目标时间）。
当然这个是有成本的，因为更频繁全量备份需要消耗更多存储空间，所以这个RTO是成本换来的，需要根据业务评估。

# 9 避免长事务对业务的影响
## 9.1 应用开发端
确认是否使用
```sql
set autocommit=0
```
确认可在测试环境中，把MySQL的general_log开启，随便跑个业务逻辑，通过general_log确认。
一般框架如果设置该值，也会提供参数来控制，目标就是把它改成1。

确认是否有不必要的只读事务。有些框架不管什么语句先begin/commit框。有些是业务并没有这需要，但也把好几个select语句放到事务。这种只读事务可以去掉。

业务连接数据库时，根据业务预估，通过SET MAX_EXECUTION_TIME命令，控制每个语句执行最长时间，避免单语句意外执行太长时间。

## 9.2 数据库端
监控 information_schema.Innodb_trx表，设置长事务阈值，超过就报警/或者kill。

> Percona的pt-kill这个工具不错，推荐。

在业务功能测试阶段要求输出所有的general_log，分析日志行为提前发现问题。
使用的MySQL 5.6或更新版本，把innodb_undo_tablespaces设置成2或更大值。如果真的出现大事务导致回滚段过大，这样设置后清理起来更方便。

![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)