# 1 SQL优化
通过show status命令了解各种sql的执行效率

```sql
查看本session的sql执行效率
show status like 'Com_%';
查看全局的统计结果
SHOW GLOBAL STATUS LIKE  'Com_%'
查看服务器的状态
show global status;
```

结果

*   Com_select:执行select操作的次数，依次查询之累加1
*   Com_insert:执行insert操作的次数，对于批量插入的insert操作，只累加依次
*   Com_update:执行update操作的次数
*   Com_delete:执行delete的次数

上面的参数是对所有存储引擎的表进行累计，下面参数是针对InnoDB存储引擎的，累加的算法也是略有不同的

*   Innodb_rows_read:SELECT查询返回的行数
*   Innodb_rows_insered:执行inser操作插入的行数
*   Innodb_rows_updated:执行UPDATE操作更新的行数
*   Innodb_rows_deleted执行DELETE操作删除的行数

通过上述的参数可以了解当前数据库的应用是插入更新为主还是查询操作为主，以及各类的SQL的执行比例是多少。对于更新操作的计算，是对执行次数的计数，无论提交还是回滚都会进行累加对于事务形的应用，通过Com_commit和Com_rollback可以了解事务提交和回滚的情况，对于回滚操作非常频繁的数据库，可能意味着应用编写存在的问题

*   Connections:试图连接MySql服务器的次数
*   Uptime：服务器工作时间
*   Slow_queries:慢查询的次数

# 2 定位执行效率低的SQL语句
1.  慢查询日志
`--log-show-queries[=file_name]`选项去启动
mysqlId写一个包含所有执行时间超过`long_querty_time`秒的sql语句的日志文件
2.  show processlist命令
慢查询日志在查询结束后才记录，所以在应用反应执行效率出现问题的时候查询慢查询日志并不能定位问题
可以使用`show processlist`命令查看当前Mysql在进行的线程，包括线程的状态，是否锁表等，可以实时查看sql的执行情况，同时对一些锁表进行优化

# 3  通过explain分析执行sql的执行计划


# 4  简单的优化方法

本语句可以用于分析和存储表的关键字分布，分析的结果可以使得系统得到准确的统计信息使得sql，能够生成正确的执行计划。如果用户感觉实际执行计划并不预期的执行计划，执行一次分析表可能会解决问题

```
analyze table payments;
```

检查表：检查表：检查表的作用是检查一个表或多个表是否有错误,也可以检查视图是否错误

```
check table payment;
```

优化表:如果删除了表的一大部分，或者如果已经对可变长度的行表（含varchar、blob、text列）的表进行改动，则使用optimize 进行表优化，这个命令**可以使表中的空间碎片进行合并、并且可以消除由于删除或者更新造成的空间浪费**

```
optimize table payment;
```

对于innodb引擎的表，可以通过设置innodb_file_per_taable参数，设置InnoDb为独立表空间模式，这样每个数据库的每个表都会生成一个独立的idb文件，用于存储表的数据和索引，可以一定程度减少Innodb表的空间回收问题,另外，在删除大量数据后，Innodb表可以通过alter table但是不锈钢引擎方式来回收不用的空间

```
alter table payment enigine=innodb;
```

**ANALYZE,CHECK,OPTIMIZE,ALTER TABLE执行期间都是对表进行锁定，因此要在数据库不频繁的时候执行相关的操作**




- 拆分表： 分区将数据在物理上分隔开，不同分区的数据可以制定保存在处于不同磁盘上的数据文件里。
这样，当对这个表进行查询时，只需要在表分区中进行扫描，而不必进行全表扫描，明显缩短了查询时间，
另外处于不同磁盘的分区也将对这个表的数据传输分散在不同的磁盘I/O，一个精心设置的分区可以将数据传输对磁盘I/O竞争均匀地分散开。
对数据量大的时时表可采取此方法。可按月自动建表分区。

# 存储过程与触发器的区别
两者唯一的区别是触发器不能用EXECUTE语句调用，而是在用户执行Transact-SQL语句时自动触发（激活）执行。
触发器是在一个修改了指定表中的数据时执行的存储过程。
通常通过创建触发器来强制实现不同表中的逻辑相关数据的引用完整性和一致性。
触发器不同于存储过程，触发器主要是通过事件执行触发而被执行的，
存储过程可以通过存储过程名称名字而直接调用。
当对某一表进行诸如UPDATE、INSERT、DELETE这些操作时，SQLSERVER就会自动执行触发器所定义的SQL语句，从而确保对数据的处理必须符合这些SQL语句所定义的规则。

# 面试数据库优化问题回答方向:
（1）、根据服务层面：配置mysql性能优化参数
（2）、从系统层面增强mysql的性能：优化数据表结构、字段类型、字段索引、分表，分库、读写分离等等
（3）、从数据库层面增强性能：优化SQL语句，合理使用字段索引。
（4）、从代码层面增强性能：使用缓存和NoSQL数据库方式存储，如MongoDB/Memcached/Redis来缓解高并发下数据库查询的压力。
（5）、减少数据库操作次数，尽量使用数据库访问驱动的批处理方法。
（6）、不常使用的数据迁移备份，避免每次都在海量数据中去检索。
（7）、提升数据库服务器硬件配置，或者搭建数据库集群。
（8）、编程手段防止SQL注入：使用JDBC PreparedStatement按位插入或查询；正则表达式过滤（非法字符串过滤）


#### 大批量的插入数据

当用load导入数据，适当的设置可以提供导入的速度
对于MyISAM存储引擎的表，可以通过以下方式快速导入大量的数据

```
alter table tab_name disable keys;
loading the data
alter table tab_name disable keys;
```

disable keys和enable keys 用来打开或者关闭MyISAM表非索引的更新。在导入大量的数据到一个非空的MyISAM表，通过设置这两个命令，可以提高导入的效率
对于Innodb类型的表不能使用上面的方式提高导入效率
因为Innodb类型的表是按照主键的顺序保存，所有将导入的数据按照主键的顺序排序，可以有效地提高导入数据的效率

在导入数据强执行SET UNIQUE_CHECKS=0，关闭唯一性校验，在导入结束后执行SET UNIQUE_CHECKS=1.恢复唯一性校验，可以提高导入的效率，如果应用使用自动提交的方式，建议在导入前执行SET AUTOCOMMIT=0时，关闭自动提交，导入结束后再执行SET AUTOCOMMIT=1，打开自动提交，也可以提高导入的效率

#### 优化insert语句

*   如果同时从一个客户端插入很多行，应尽量使用多个值表的insert语句，这种方式将大大缩减客户端与数据库之间的连接、关闭等消耗，使得效率比分开执行的单个insert语句快（大部分情况下，使用多个值表的insert语句那比单个insert语句快上好几倍）。

    ```
    insert into test values(1,2),(1,3)...
    ```

    *   如果从不同客户插入很多行，可以通过使用insert delayed语句提高更高的速度，delayed的含义是让insert语句马上执行，其实数据都被放到内存的队列中，并没有真正写入磁盘，这比每条语句分别插入要快的多；LOW_PRIORITY刚好相反，在所有其他用户对表的读写完成后才可以进行
    *   将索引文件和数据文件分在不同的磁盘上存放（利用建表中的选项）
    *   如果进行批量插入，可以通过增加bulk_insert_buffer_size变量值的方法来通过速度，但是，这只能对MyISAM表使用。
    *   当从一个文本文件装载一个表时，使用LOAD DATA INFILE。这通常比使用很多INSERT语句块快20倍

#### 优化ORDER BY语句
*   第一种通过有序排序索引顺序扫描，这种方式在使用explain分析查询的时候显示为Using Index，不需要额外的排序，操作效率较高-innodb引擎
![条件](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtODM2N2U0ODJhODBhYWYzYS5wbmc?x-oss-process=image/format,png)


    ```
    explain select customer_id from customer order by store_id;
    ```
![表](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtODk0MjI2N2U1ZDg0MTliMC5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMDExNDE4OTU3M2Q3YzFkOC5wbmc?x-oss-process=image/format,png)
![违反规则,则filesort](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMjJkZGRhYWExMzk3Y2QzYi5wbmc?x-oss-process=image/format,png)


*   第二张通过返回数据进行排序，也就是通常说的Filesort排序，所有不是通过索引直接返回排序结果的排序豆角Filesort排序。Filesort并不代表通过磁盘文件进行排序，而只是说明进行了一个排序操作，至于排序操作是否进行了磁盘文件或临时表等，则取决于MySql服务器对排序参数的设置和需要排序数据的大小-myshim引擎

    ```
    explain select * from customer order by store_id;
    ```

    Filesort是通过相应的排序算法，将取得的数据在sort_buffer_size系统变量设置的内存排序区进行排序，如果内存装载不下，它会将磁盘上的数据进行分块，再对各个数据块进行排序，然后将各个块合并成有序的结果集。sort_buffer_size设置的排序区是每个线程独占的，所有同一个时刻，MySql存在多个sort buffer排序区

优化目标:尽量减少额外的排序，**通过索引直接返回有序数据**.where和ordery by 使用相同的索引，并且order by的顺序和索引顺序相同，并且order by的字段都是升序或者都是降序。否则肯定需要额外的排序操作，这样就会出现filesort

#### 优化group by 语句

如果查询包括group by 但用户想要避免排序结果的消耗，可以指定group by null

##### 优化嵌套查询

子查询可以被更有效率的连接替代

```
explain select * from customer where customer_id not in(select customer_id from payment)

explain select * from customer a left join payment b on a.customer_id=b.customer_id where b.customer id is null
```

**连接之所用更有效率是因为mysql不需要在内存中创建临时表来完成这个逻辑上需要两个步骤的查询工作**

###### 优化分页查询

一般分页查询，通过创建覆盖索引能够比较好地提高性能。一个场景是"limit 1000,20",此时Mysql排序出前1020条数据后仅仅需要返回第1001到1020条记录，前1000条数据都被抛弃，查询和排序代价非常高

优化方式：可以增加一个字段last_page_record.记录上一页和最后一页的编号，通过

```
explain select ...where last_page_record<... desc limt ..
```

如果排序字段出现大量重复字段，不适用这种方式进行优化

## MySql常用技巧

#### 正则表达式的使用

| 序列 | 序列说明 |
| --- | --- |
| ^ | 字符串的开始处进行排序 |
| $ | 在字符串的末尾处进行匹配 |
| . | 匹配任意单个字符串，包括换行服 |
| [...] | 匹配括号内的任意字符 |
| {FNXX==XXFN} | 匹配不出括号内任意字符 |
| a* | 匹配零个或多个a(包括空串) |
| a+ | 匹配一个或多个a（不包括字符串) |
| a? | 匹配一个或零个a |
| a1\ | a2 | 匹配a1或a2 |
| a(m) | 匹配m个a |
| a(m,) | 匹配m个或更多a |
| a(m,n) | 匹配m到n个a |
| a(,n) | 匹配0到n个a |
| (...) | 将模式元素组成单一元素 |

使用

```
select 'abcdefg' regexp '^a';
.....
```

#### 如果range()提取随机行

随机抽取某些行

```
select * from categrory order by rand() limit 5;
```

#### 利用group by的with rollup 子句

使用Group By的with rollup可以检索更多分组聚合信息

```
select date_from(payment_date,'%Y-%M'),staff_id,sum(amount) from payment group by date_formate(payment_date,'%Y-%M'),staff_id;
```

#### 用BIT GROUP FUNCTIONS做统计

使用GROUP BY语句和BIT_AND、BIT_OR函数完成统计工作，这两个函数的一般用途就是做数值之间的逻辑

* * *

## 优化数据库对象

#### 优化表类型

表需要使用何种数据类型工具应用来判断，虽然考虑字段的长度会有一定的冗余，但是不推荐让很多字段都留有大量的冗余，这样既浪费磁盘的存储空间，同时在应用操作时也浪费物理内存mysql，可以使用函数procedure analyse对当前的表进行分析

```
//输出的每一类信息都对数据表中的列的数据类型提出优化建议。第二语句高数procedure anaylse不要为那些包含的值多余16个或者256个字节的enum类型提出建议，如果没有这个限制，输出的信息可能很长；ENUM定义通常很难阅读，通过输出信息，可以将表中的部分字段修改为效率更高的字段
select * from tb1_name procedure analyse();
select * from tb2_name procedure analyse(16,256);
```

#### 通过拆分提高表的访问效率

*   重置拆分，把主码和一些列放到一个表，然后把住码和另外的列放到另一个表， 好处**可以将常用的列放在一起，不常用的列放在一起，使得数据行变少，一个数据页可以存放更多的数据，在查询时会减少I/O次数**，缺点：**管理冗余，查询所有数据需要用join操作**
*   水平拆分。根据一列或多列数据把数据行放到两个独立的表中：水平拆分会给应用增加复杂度，它通常在查询时需要多个表名，查询所有数据需要UNION操作，缺点：**只要索引关键字不大，则在索引查询时，表中增加了2-3倍的数据量，查询时也增加了读一个索引的磁盘次数，所有说拆分要考虑数据量的增长速度**。常用场景
    *   表很大，分割后可以降低在查询时需要读的数据和索引的页数，同时也降低了索引的层数，提高查询速度
    *   表中的数据本来就有独立性，例如表中分别记录各个地区的数据或者不同时期的数据，特别是有些数据常用，而有些数据不常用
    *   需要把数据存放在多个介质上：如账单：最近三个月数据存在一个表中，3个月之前的数据存放在另一个表，成功一年的可以存储在单独的存储介质中。

#### 逆规范化

数据库设计时需要瞒住规范化，但是规范化程度越高，产生的关系就越多，**关系越多直接结果就是表直接的连接操作越频繁，而表连接的操作是性能较低的操作，直接影响到查询的数据。**
**反规范化的好处在于降低连接操作的需求，降低外码和索引的数目，还可以减少表的树木，相应带来的问题可能出现数据的完整性问题。加快查询速度，但是降低修改速度。好的索引和其他方法经常能够解决性能问题，而不必采用反规范这种方法**
采用的反规范化技术

*   增加冗余列：指在多个表中具有相同的列，它常用来在查询时避免连接操作
*   增加派生列：指增加的列来自其他表中的数据，由其他表中的数据经过计算生成。增加的派生列其他作业是在查询时减少连接操作，避免使用集函数
*   重新组表：指如果许多用户需要查看两个表连接出来的结果数据，则把这两个表查询组成一个表来减少连接而提高性能
*   分割表

维护数据的完整性

*   批处理维护是指对复制列或派生列的修改积累一定的时间后，运行一批处理作业或修改存储过程对复制或派生列进行修改，这只能对实时性要求不高的情况下使用
*   数据的完整性也可由应用逻辑来实现，这就要求必须在同一事务中对所有涉及的表进行增、删、改操作。用应用逻辑来实现数据的完整性风险较大，因为同一逻辑必须在所有的应用中使用和维护，容易遗漏。特别是在需求变化时，不易于维护
*   使用触发器，**对数据的任何修改立即触发对复制列或者派生列的相应修改**，触发器是实时的，而且相应的处理逻辑只在一个地方出现，易于维护，一般来说，是解决这类问题比较好的方法

#### 使用中间表提高统计查询速度

对于数据量较大的表，在其上进行统计查询通常会效率很低，并且还要考虑统计查询是
否会对在线的应用产生负面影响。通常在这种情况下，使用中间表可以提高统计查询的效率
session 表记录了客户每天的消费记录，表结构如下：

```
CREATE TABLE session (
cust_id varchar(10) , --客户编号
cust_amount DECIMAL(16,2), --客户消费金额
cust_date DATE, --客户消费时间
cust_ip varchar(20) –客户IP 地址
)
```

由于每天都会产生大量的客户消费记录,所以session 表的数据量很大,现在业务部门有
一具体的需求：希望了解最近一周客户的消费总金额和近一周每天不同时段用户的消费总金
额。针对这一需求我们通过2 种方法来得出业务部门想要的结果。
方法1：在session 表上直接进行统计,得出想要的结果。

```
select sum(cust_amount) from session where cust_date>adddate(now(),-7);
```

方法2：创建中间表tmp_session，表结构和源表结构完全相同。

```
CREATE TABLE tmp_session (
cust_id varchar(10) , --客户编号
cust_amount DECIMAL(16,2), --客户消费金额
cust_date DATE, --客户消费时间
cust_ip varchar(20) –客户IP 地址
) ;
```

```
insert into tmp_session select * from session where cust_date>adddate(now(),-7);
```

转移要统计的数据到中间表,然后在中间表上进行统计，得出想要的结果。
在中间表上给出统计结果更为合适,原因是源数据表(session 表)
**cust_date 字段没有索引并且源表的数据量较大，所以在按时间进行分时段统计时效率**
很低，这时可以在中间表上对cust_date 字段创建单独的索引来提高统计查询的速度。
中间表在统计查询中经常会用到，其优点如下:

1.  中间表复制源表部分数据，并且与源表相“隔离”，在中间表上做统计查询不
    会对在线应用产生负面影响.
2.  中间表上可以灵活的添加索引或增加临时用的新字段,从而达到提高统计查询
    效率和辅助统计查询作用。

![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)