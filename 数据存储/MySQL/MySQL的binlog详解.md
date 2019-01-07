> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

# 1 简介
二进制日志，记录对数据发生或潜在发生更改的SQL语句，并以二进制形式保存在磁盘。

# 2 Binlog 的作用
主要作用：复制、恢复和审计。

# 3 开启Binlog
## 3.1 查询当前 MySQL 是否支持 binlog
如下OFF代表不支持
![](https://img-blog.csdnimg.cn/20190226103658150.png)

![](https://img-blog.csdnimg.cn/20190226103724662.png)

## 3.2 修改 my.cnf 文件以支持 binlog
### 查看my.cnf路径
- mysql --help --verbose | grep my.cnf
![mysql --help --verbose | grep my.cnf](https://img-blog.csdnimg.cn/20190226145447126.png)
![](https://img-blog.csdnimg.cn/20190226145609552.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

### 在/etc 新建文件my.cnf并添加如下内容
- 注意添加 mysqld 组
![](https://img-blog.csdnimg.cn/20190226151409568.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 重启 MySQL![](https://img-blog.csdnimg.cn/20190226151443363.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 再次查看是否支持binlog![](https://img-blog.csdnimg.cn/20190226151707772.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

# 3 binlog管理命令
## show master logs
- 查看所有Binlog的日志列表。
![](https://img-blog.csdnimg.cn/20201008223019405.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

## show master status
- 查看binlog日志状态。查看最后一个Binlog日志的编号名称，及最后一个事件结束的位置( pos )
![](https://img-blog.csdnimg.cn/20201008223132389.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)


##  flush logs
刷新binlog日志文件，刷新之后会创建一个新的Binlog日志文件

## reset master
清空所有的 binlog 日志文件


## 查看binlog日志文件
mysqlbinlog mysql-bin.000002


# 4 Binlog相关变量
## log_bin
Binlog的开关。

查看该变量： 

```bash
show variables like 'log_bin';
```
![](https://img-blog.csdnimg.cn/20201008221436787.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

## binlog_format
Binlog日志的格式。

查看变量：

```bash
show variables like 'binlog_format';
```
![](https://img-blog.csdnimg.cn/20201008221610595.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

# 5 Binlog日志的格式

## ROW
仅保存记录被修改细节，不记录SQL语句上下文相关信息。

### 优点
binlog中可以不记录执行的sql语句的上下文相关的信息，仅需要记录那一条记录被修改成什么了。所以rowlevel的日志内容会非常清楚的记录下每一行数据修改的细节。而且不会出现某些特定情况下的存储过程，或function，以及trigger的调用和触发无法被正确复制的问题

### 缺点
所有的执行的语句当记录到日志中的时候，都将以每行记录的修改来记录，这样可能会产生大量的日志内容,比如一条update语句，修改多条记录，则binlog中每一条修改都会有记录，这样造成binlog日志量会很大，特别是当执行alter table之类的语句的时候，由于表结构修改，每条记录都发生改变，那么该表每一条记录都会记录到日志中。

## STATEMENT
每一条会修改数据的 SQL 都会记录在Binlog中。

### 优点
无需记录每行变化，减少了binlog日志量，节约了IO，提高性能。
相比row能节约多少性能与日志量，这个取决于应用的SQL情况，正常同一条记录修改或者插入row格式所产生的日志量还小于Statement产生的日志量，但是考虑到如果带条件的update操作，以及整表删除，alter表等操作，ROW格式会产生大量日志，因此在考虑是否使用ROW格式日志时应该跟据应用的实际情况，其所产生的日志量会增加多少，以及带来的IO性能问题。

### 缺点
由于记录的只是执行语句，为了这些语句能在slave上正确运行，因此还必须记录每条语句在执行的时候的一些相关信息，以保证所有语句能在slave得到和在master端执行时候相同 的结果。另外mysql 的复制,像一些特定函数功能，slave可与master上要保持一致会有很多相关问题(如sleep()函数， last_insert_id()，以及user-defined functions(udf)会出现问题).

## MIXED
以上两种level的混合使用。
一般的语句修改使用statment格式保存binlog，如一些函数，statement无法完成主从复制的操作，则采用row格式保存binlog,MySQL会根据执行的每一条具体的sql语句来区分对待记录的日志形式，也就是在Statement和Row之间选择一种.新版本的MySQL中队row level模式也被做了优化，并不是所有的修改都会以row level来记录，像遇到表结构变更的时候就会以statement模式来记录。至于update或者delete等修改数据的语句，还是会记录所有行的变更。

## Binlog日志格式选择

Mysql默认是使用Statement日志格式，推荐使用MIXED.

由于一些特殊使用，可以考虑使用ROWED，如自己通过binlog日志来同步数据的修改，这样会节省很多相关操作。对于binlog数据处理会变得非常轻松,相对mixed，解析也会很轻松(当然前提是增加的日志量所带来的IO开销在容忍的范围内即可)。

## mysqlbinlog格式选择

mysql对于日志格式的选定原则:如果是采用 INSERT，UPDATE，DELETE 等直接操作表的情况，则日志格式根据 binlog_format 的设定而记录,如果是采用 GRANT，REVOKE，SET PASSWORD 等管理语句来做的话，那么无论如何 都采用 SBR 模式记录



# 6 查看Binlog相关的SQL

```sql
show binlog events [IN 'log_name'] [FROM pos] [LIMIT [offset,] row_count] 
```

## 查看第一个Binlog日志
```sql
show binlog events;
```
![](https://img-blog.csdnimg.cn/20201008224623427.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
## 查看指定的Binlog日志
```sql
show binlog events in 'mysql-bin.000001';
```
![](https://img-blog.csdnimg.cn/20201008225104881.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
## 从指定的位置开始,查看指定的Binlog日志

```bash
show binlog events in 'mysql-bin.000001' from 666;
```


## 从指定的位置开始,查看指定的Binlog日志,限制查询的条数

```bash
show binlog events in 'mysql-bin.000001' from 666 limit 2;
```


## 从指定的位置开始，带有偏移，查看指定的Binlog日志,限制查询的条数

```bash
show binlog events in 'mysql-bin.000001' from 666 limit 1, 2; 
```

# 7 Binlog 列说明
## Event_type
- QUERY_ EVENT
与数据无关的操作，begin、drop table、truncate table等
- TABLE _MAP_ EVENT
记录下一个操作所对应的表信息，存储了数据库名和表名
- XID_ EVENT
标记事务提交
- WRITE_ ROWS_ EVENT
插入数据,即insert操作
- UPDATE_ ROWS_ EVENT
更新数据,即update操作
- DELETE ROWS EVENT
删除数据,即delete操作


参考
- https://blog.csdn.net/vhomes/article/details/8082734

![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)