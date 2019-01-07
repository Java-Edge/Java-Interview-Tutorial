很多低级开发工程师都想当然觉得自增主键是严格连续递增的，但事实真的如此吗？

创建一个测试表，执行
![](https://img-blog.csdnimg.cn/2021061110044492.png)
- show create table
![](https://img-blog.csdnimg.cn/20210611100749288.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

> SHOW CREATE TABLE tbl_name：显示创建指定命名表的 CREATE TABLE 语句。要使用此语句，必须对该表具有一定的权限。此语句也适用于视图。
> 更改表的存储引擎时，不适用于新存储引擎的表选项会保留在表定义，以便在必要时将具有先前定义选项的表恢复到原始存储引擎。例如，将存储引擎从 InnoDB 更改为 MyISAM 时，将保留 InnoDB 特定的选项，例如 ROW_FORMAT=COMPACT。
```sql
mysql> CREATE TABLE t1 (c1 INT PRIMARY KEY) ROW_FORMAT=COMPACT ENGINE=InnoDB;
mysql> ALTER TABLE t1 ENGINE=MyISAM;
mysql> SHOW CREATE TABLE t1\G
*************************** 1. row ***************************
       Table: t1
Create Table: CREATE TABLE `t1` (
  `c1` int(11) NOT NULL,
  PRIMARY KEY (`c1`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 ROW_FORMAT=COMPACT
```

> 创建禁用严格模式的表时，若不支持指定的行格式，则使用存储引擎的默认行格式。表的实际行格式在 Row_format 列中报告，以响应
> SHOW TABLE STATUS。 SHOW CREATE TABLE 显示在 CREATE TABLE 语句中指定的行格式。

`AUTO_INCREMENT=2`，表示下一次插入数据时，若需要自动生成自增值，会生成id=2。

这个输出结果容易引起误解：自增值是保存在表结构定义里的。实际上，表的结构定义存在`.frm`文件，但不会保存自增值。
## 自增值的保存策略
### MyISAM
自增值保存在数据文件中。
### InnoDB
自增值保存在内存，MySQL 8.0后，才有了“自增值持久化”能力，即才实现了“若重启，表的自增值可以恢复为MySQL重启前的值”，具体情况是：
≤5.7，自增值保存在内存，无持久化。每次重启后，第一次打开表时，都会去找自增值的最大值max(id)，然后将max(id)+1作为这个表当前的自增值。
﻿
﻿若一个表当前数据行里最大的id是10，`AUTO_INCREMENT=11`。这时，我们删除id=10的行，**AUTO_INCREMENT**还是11。但若马上重启实例，重启后，该表的**AUTO_INCREMENT**就会变成10。﻿
即MySQL重启可能会修改一个表的**AUTO_INCREMENT**值。
MySQL 8.0将自增值的变更记录在redo log，重启时依靠redo log恢复重启之前的值。
理解了MySQL对自增值的保存策略以后，我们再看看自增值修改机制。

## 自增值的修改策略
若字段id被定义为**AUTO_INCREMENT**，在插入一行数据时，自增值的行为如下：
1. 若插入数据时id字段指定为0、null 或未指定值，则把该表当前**AUTO_INCREMENT**值填到自增字段
2. 若插入数据时id字段指定了具体值，则使用语句里指定值

根据要插入的值和当前自增值大小关系，假设要插入值X，而当前自增值Y，若：
- X<Y，则该表的自增值不变
- X≥Y，把当前自增值修改为新自增值

#### 自增值生成算法
从
- **auto_increment_offset**（自增的初始值）开始
- 以**auto_increment_increment**（步长）持续叠加

直到找到第一个大于X的值，作为新的自增值。
两个系统参数默认值都是1。

某些场景使用的就不全是默认值。比如，双M架构要求双写时，可能设置成**auto_increment_increment=2**，让一个库的自增id都是奇数，另一个库的自增id都是偶数，避免两个库生成的主键发生冲突。

所以，默认情况下，若准备插入的值≥当前自增值：
- 新自增值就是“准备插入的值+1”
- 否则，自增值不变

# 自增值的修改时机
- 表t里面已有如下记录
![](https://img-blog.csdnimg.cn/20210611135004750.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)再执行一条插入数据命令
![](https://img-blog.csdnimg.cn/20210611135103260.png)

该唯一键冲突的语句执行流程：
1. 执行器调用InnoDB引擎接口写入一行，传入的这一行的值是(0,1,1)
2. InnoDB发现用户没有指定自增id的值，获取表t当前的自增值2
3. 将传入的行的值改成(2,1,1)
4. 将表的自增值改成3
5. 继续执行插入数据(2,1,1)，由于已存在c=1，所以报Duplicate key error
6. 语句返回

该表的自增值已经改成3，是在真正执行插入数据之前。而该语句真正执行时，因唯一键冲突，所以id=2这行插入失败，但却没有将自增值改回去。

- 此后再成功插入新数据，拿到自增id就是3了
![](https://img-blog.csdnimg.cn/20210611135641125.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

如你所见，自增主键不连续了！所以唯一键冲突是导致自增主键id不连续的一大原因。

事务回滚是二大原因。
![](https://img-blog.csdnimg.cn/20210611140347623.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
为何现唯一键冲突或回滚时，MySQL不把自增值回退？

这么设计是为了**提升性能**。
假设有俩并行执行的事务，在申请自增值时，为避免两个事务申请到相同自增id，肯定要加锁，然后顺序申请。
假设事务 B 稍后于 A
|事务A|事务B  |
|--|--|
| 申请到id=2||
| |  申请到id=3  |
| 此时表t的自增值4|此时表t的自增值4
| |  正确提交了  |
|唯一键冲突||

若允许A把自增id回退，即把t的当前自增值改回2，则：表里已有id=3，而当前自增id值是2。
接下来，继续执行其它事务就会申请到id=2，然后再申请到id=3：报错“主键冲突”。

要解决该主键冲突，怎么办？
![](https://img-blog.csdnimg.cn/20210611154731840.png)

1. 每次申请id前，先判断表里是否已存该id。若存在，就跳过该id。但这样操作成本很高。因为申请id本来很快的，现在竟然还要人家再去主键索引树判断id是否存在
2. 把自增id的锁范围扩大，必须等到一个事务执行完成并提交，下一个事务才能再申请自增id。但这样锁的粒度太大，系统度大大下降！
![](https://img-blog.csdnimg.cn/20210611155029829.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

低级的工程师想到的这些方案都会导致性能问题。之所以走进如此的怪圈，就因为“允许自增id回退”这个前提的存在。
所以InnoDB放弃这样的设计，语句即使执行失败了，也不回退自增id！
所以自增id只保证是递增的，但不保证是连续的！

# 自增锁的养成计划
所以自增id的锁并非事务锁，而是每次申请完就马上释放，其它事务可以再申请。其实，在MySQL 5.1版本之前，并不是这样的。

MySQL 5.0时，自增锁的范围是语句级别：若一个语句申请了一个表自增锁，该锁会等语句执行结束以后才释放。显然，这样影响并发度

MySQL 5.1.22版本引入了一个新策略，新增参数**innodb_autoinc_lock_mode**，默认值`1`。该参数的值为0时，表示采用5.0的策略，设置为1时：
- 普通insert语句
申请后，马上释放；
- 类似**insert … select** 这样的批量插入语句
等语句结束后，才释放

设置为2时，所有的申请自增主键的动作都是申请后就释放锁。

为什么默认设置下的**insert … select** 偏偏要使用语句级锁？为什么该参数默认值不是2？
![](https://img-blog.csdnimg.cn/20210611155800913.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
为了**数据的一致性**。

看个案例：批量插入数据的自增锁

|session1|session2 |
|--|--|
| insert into t values (null, 2, 2); <br>insert into t values (null, 3, 3);<br>insert into t values (null, 4, 4);<br>||
| |  create table t2 like t;  |
| insert into t values (null, 5, 5);|insert into t2(c,d) select c,d from t;

若session2申请了自增值后，马上释放自增锁，则可能发生：
- session2先插入了两个记录，(1,1,1)、(2,2,2)
- 然后，session1来申请自增id得到id=3，插入（3,5,5)
- session2继续执行，插入两条记录(4,3,3)、 (5,4,4)

这好像也没关系吧，毕竟session 2语义本身就没有要求t2的所有行数据都和session1相同。
从数据逻辑角度看是对的。但若此时`binlog_format=statement`，binlog会怎么记录呢？
先看看 MySQL 此时的告警：

```sql
mysql> insert into t2(c,d) select c,d from t;
Query OK, 4 rows affected, 1 warning (0.01 sec)
Records: 4  Duplicates: 0  Warnings: 1

mysql> show warnings;
+-------+------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Level | Code | Message                                                                                                                                                                                                                                                                                                                                                                          |
+-------+------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Note  | 1592 | Unsafe statement written to the binary log using statement format since BINLOG_FORMAT = STATEMENT. Statements writing to a table with an auto-increment column after selecting from another table are unsafe because the order in which rows are retrieved determines what (if any) rows will be written. This order cannot be predicted and may differ on master and the slave. |
+-------+------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

由于两个session同时执行插入数据命令，所以binlog里对表t2的更新日志只有两种情况：要么先记session1，要么先记session2。
但无论哪种，这个binlog拿去从库执行或用来恢复临时实例，备库和临时实例里面，session2这个语句执行出来，生成的结果里，id都是连续的。 此时该库就发生了数据不一致。

因为原库session2的insert语句，生成的id不连续。这个不连续的id，用statement格式的binlog来串行执行，是执行不出来的。
要解决该问题，有如下方案：
1. 让原库的批量插入数据语句，固定生成连续id值
所以，自增锁直到语句执行结束才释放，就是为了达此目的
2. 在binlog里把插入数据的操作都如实记录进来，到备库执行时，不依赖自增主键去生成
其实就是**innodb_autoinc_lock_mode=2**，同时`binlog_format=row`。

所以生产上有**insert … select**这种批量插入场景时，从并发插入的性能考虑，推荐设置：`innodb_autoinc_lock_mode=2 &&  binlog_format=row`，既能提升并发性，又不会出现数据一致性问题。

> 这里的“批量插入数据”，包含如下语句类型：
> - insert … select
> - replace … select
> - load data

在普通insert语句包含多个value值的场景，即使`innodb_autoinc_lock_mode=1`，也不会等语句执行完成才释放锁。因为这类语句在申请自增id时，可以精确计算出需要多少个id，然后一次性申请，申请完成后锁即可释放。

即批量插入数据的语句，之所以需要这么设置，是因为“不知道要预先申请多少个id”。
既然不知道要申请多少个自增id，那么最简单的就是需要一个时申请一个。但若一个**select … insert**要插入10万行数据，就要申请10w次，速度慢还影响并发插入性能。

因此，对于批量插入数据语句，MySQL提供了批量申请自增id的策略：
 1. 语句执行过程中，第一次申请自增id，会分配1个
 2. 1个用完以后，这个语句第二次申请自增id，会分配2个
 3. 2个用完以后，还是这个语句，第三次申请自增id，会分配4个

依此类推，同一个语句去申请自增id，每次申请到的自增id个数都是上一次的两倍。

看案例：
![](https://img-blog.csdnimg.cn/20210611171615128.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
```sql
mysql> create table t2 like t;
mysql> insert into t2(c,d) select c,d from t;
Query OK, 4 rows affected, 1 warning (0.00 sec)
Records: 4  Duplicates: 0  Warnings: 1

mysql> insert into t2 values(null, 5,5);
Query OK, 1 row affected (0.00 sec)

mysql> select * from t2;
+----+------+------+
| id | c    | d    |
+----+------+------+
|  1 |    1 |    1 |
|  2 |    2 |    2 |
|  3 |    3 |    3 |
|  4 |    4 |    4 |
|  8 |    5 |    5 |
+----+------+------+
5 rows in set (0.00 sec)
```
**insert…select**实际上往t2中插入4行数据。但这四行数据是分三次申请的自增id，第一次申请到id=1，第二次id=2和id=3， 第三次id=4到id=7。
由于该语句实际只用上了4个id，所以id=5到id=7就被浪费了。之后，再执行
```sql
insert into t2 values(null, 5,5)
```
实际上插入的数据是（8,5,5)。这是主键自增id不连续的三大原因。