> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

# 0 存储引擎的意义
## 为什么是可插拔式的？
可插拔存储引擎体系结构使
- 数据库专业人员可以为特定业务需求选型合适的存储引擎
- 完全不受管理任何特定应用程序编码需求的需要

这种高效的模块化体系结构为那些希望专门针对特定应用程序需求（例如数据仓库，事务处理或高可用性情况）的用户提供了巨大的好处，同时享有利用独立于任何一个的一组接口和服务的优势存储引擎。
MySQL服务器体系结构将应用程序开发者和DBA与存储级别的所有底层实现细节隔离，从而提供了一致且简单的应用程序模型和API。因此，尽管跨不同的存储引擎具有不同的功能，但应用程序不受这些差异的影响。

## MySQL架构
- 具有可插拔式存储引擎的MySQL体系结构
![](https://img-blog.csdnimg.cn/20200828194011627.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

- Connectors 各种语言的客户端应用
- Connection Pool 为应用层，负责连接、验证等功能
应用层，负责和客户端,用户交互，需要和不同的客户端和中间服务器进行交互，建立连接，记住连接的状态，响应它们的请求，返回数据和控制信息（错误信息，状态码等）。
- NoSQL Interface、SQL Interface、Parser、Optimizer、Cache & Buffers、Storage Engines——逻辑层
逻辑层，负责具体的查询处理、事务管理、存储管理、恢复管理,以及其他的附加功能。查询处理器负责查询解析、执行，当接收到客户端的Sql查询，数据库就分配一个线程来处理它，由查询处理器生成执行计划，交由计划执行器来执行，执行器的部分操作还需要访问更底层的事务存储管理器操作数据，事务、存储管理器主要负责我们的事务管理、并发控制、存储管理，由我们的事务管理器来确保“ACID”特性，由锁管理器来控制我们的并发，由日志管理器来确保我们的数据持久化，存储管理器一般还包括一个bufer管理器，由它来确定磁盘和内存缓冲之间的数据传输。

-  Files& Logs 物理层
物理层，实际物理磁盘(存储)上的数据库文件。如我们的数据文件、日志文件等。

可插拔存储引擎体系结构提供了在所有基础存储引擎中通用的一组标准管理和支持服务。
存储引擎本身是数据库服务器的组件，它们实际上对在物理服务器级别维护的基础数据执行操作，规定了数据文件的组织形式。


应用程序程序员和DBA通过存储引擎上方的连接器API和服务层与MySQL数据库交互。如果应用程序更改带来了要求基础存储引擎更改的要求，或者添加了一个或多个存储引擎来支持新需求，则无需进行重大的编码或流程更改即可使工作正常进行。 MySQL服务器体系结构通过提供适用于整个存储引擎的一致且易于使用的API，使应用程序免受存储引擎的潜在复杂性的影响。

# 1  Isam  
在读取数据方面速度很快，而且不占用大量的内存和存储资源
但不支持事务、外键、索引。
MySQL≥5.1版本中不再支持。
# 2 Berkeley
支持COMMIT和ROLLBACK等事务特性。

MySQL在 ≥  5.1版本中不再支持。

# 3 CSV
使用该引擎的MySQL数据库表会在MySQL安装目录data文件夹中的和该表所在数据库名相同的目录中生成一个.CSV文件（所以，它可以将CSV类型的文件当做表进行处理），这种文件是一种普通文本文件，每个数据行占用一个文本行。

但是不支持索引，即使用该种类型的表没有主键列；
也不允许表中的字段为null。csv的编码转换需要格外注意。

### 适用场景
支持从数据库中拷入/拷出CSV文件。如果从电子表格软件输出一个CSV文件，将其存放在MySQL服务器的数据目录中，服务器就能够马上读取相关的CSV文件。同样，如果写数据库到一个CSV表，外部程序也可以立刻读取它。在实现某种类型的日志记录时，CSV表作为一种数据交换格式，特别有用。

# 4 MEMORY（亦称HEAP）
在内存中创建临时表来存储数据。

初衷是速度，逻辑存储介质是内存。


每个基于该引擎的表实际对应一个磁盘文件，文件名和表名相同，类型为.frm。
磁盘文件只存储表结构，数据存储在内存，所以使用该种引擎的表拥有极高插入、更新和查询效率。

默认使用的是哈希（Hash）索引，速度比B+Tree快，也可使用B+树索引。

由于这种存储引擎所存储的数据保存在内存中，所以无法持久化！其保存的数据具有不稳定性，如果mysqld进程发生异常，这些数据可能消失，所以该存储引擎下的表的生命周期很短，一般只使用一次。

## 适用场景
如果需要该数据库中一个用于查询的临时表。

# 5 BLACKHOLE - 黑洞引擎

支持事务，而且支持mvcc的行级锁，写入这种引擎表中的任何数据都会消失，主要用于做日志记录或同步归档的中继存储，该存储引擎除非有特别目的，否则不适合使用。

### 适用场景1
使用BLACKHOLE存储引擎的表不存储任何数据，但如果mysql启用了二进制日志，SQL语句被写入日志（并被复制到从服务器）。这样使用BLACKHOLE存储引擎的mysqld可以作为主从复制中的中继重复器或在其上面添加过滤器机制。例如,假设你的应用需要从服务器侧的过滤规则，但传输所有二进制日志数据到从服务器会导致较大的网络流量。在这种情况下，在主服务器主机上建立一个伪从服务器进程。

![image](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtYjAzNTUxODY3NmI4MzE5ZA?x-oss-process=image/format,png)

场景2：

如果配置一主多从的话，多个从服务器会在主服务器上分别开启自己相对应的线程，执行binlogdump命令而且多个此类进程并不是共享的。为了避免因多个从服务器同时请求同样的事件而导致主机资源耗尽，可以单独建立一个伪的从服务器或者叫分发服务器。

![image](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtNjk2MTU5ODU1NzQwNTk3Yw?x-oss-process=image/format,png)

# ARCHIVE
区别于InnoDB和MyISAM，ARCHIVE提供压缩功能，拥有高效地插入。
但不支持索引，所以查询性能较差。 
支持insert、replace和select操作，不支持update和delete。

## 适用场景
### 数据归档
压缩比非常高，存储空间大概是innodb的10-15分之一，所以存储历史数据非常适合，由于不支持索引也不能缓存索引和数据，不适合作为并发访问表。

### 日志表
因为高压缩和快速插入的特点。
但前提是不经常对该表进行查询。

#### PERFORMANCE_SCHEMA：

该引擎主要用于收集数据库服务器性能参数。这种引擎提供以下功能：提供进程等待的详细信息，包括锁、互斥变量、文件信息；保存历史的事件汇总信息，为提供MySQL服务器性能做出详细的判断；对于新增和删除监控事件点都非常容易，并可以随意改变mysql服务器的监控周期，例如（CYCLE、MICROSECOND）。 MySQL用户是不能创建存储引擎为PERFORMANCE_SCHEMA的表。

场景： DBA能够较明细得了解性能降低可能是由于哪些瓶颈。


## Merge
Merge允许将一组使用MyISAM存储引擎的并且表结构相同（即每张表的字段顺序、字段名称、字段类型、索引定义的顺序及其定义的方式必须相同）的数据表合并为一个表，方便了数据的查询。

场景：MySQL中没有物化视图，视图的效率极低，故数据仓库中数据量较大的每天、每周或者每个月都创建一个单一的表的历史数据的集合可以通过Merge存储引擎合并为一张表。
## Federated
该存储引擎可以不同的Mysql服务器联合起来，逻辑上组成一个完整的数据库。
这种存储引擎非常适合数据库分布式应用。
Federated存储引擎可以使你在本地数据库中访问远程数据库中的数据，针对federated存储引擎表的查询会被发送到远程数据库的表上执行，本地是不存储任何数据的。

场景： dblink。

![image](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtNzkzZGU3MGVjZWJlYjZhMg?x-oss-process=image/format,png)

缺点：

1.对本地虚拟表的结构修改，并不会修改远程表的结构

2.truncate 命令，会清除远程表数据

3. drop命令只会删除虚拟表，并不会删除远程表

4.不支持 alter table 命令

5. select count(*), select * from limit M, N 等语句执行效率非常低，数据量较大时存在很严重的问题，但是按主键或索引列查询，则很快，如以下查询就非常慢（假设 id 为主索引）

select id from db.tablea where id >100 limit 10 ;

而以下查询就很快：

select id from db.tablea where id >100 and id<150

6.  如果虚拟虚拟表中字段未建立索引，而实体表中为此字段建立了索引，此种情况下，性能也相当差。但是当给虚拟表建立索引后，性能恢复正常。

7. 类似 where name like "str%" limit 1 的查询，即使在 name 列上创建了索引，也会导致查询过慢，是因为federated引擎会将所有满足条件的记录读取到本，再进行 limit 处理。

# Cluster/NDB
该存储引擎用于多台数据机器联合提供服务以提高整体性能和安全性。适合数据量大、安全和性能要求高的场景。

CAP理论。CAP理论(Brewer’s CAP Theorem) ，是说Consistency(一致性), Availability(可用性), Partition tolerance(分布) 三部分在系统实现只可同时满足二点，没法三者兼顾。如果对"一致性"要求高，且必需要做到"分区"，那么就要牺牲可用性;而对大型网站，可用性与分区容忍性优先级要高于数据一致性，一般会尽量朝着 A、P 的方向设计，然后通过其它手段保证对于一致性的商务需求。

#  MyISAM
MySQL5.5版本之前默认数据库引擎，由早期的ISAM所改良，提供ISAM所没有的索引和字段管理等大量功能。
适用于查询密集型，插入密集型。性能极佳，但却有一个缺点：不支持事务处理（transaction）。
因此，几年发展后，MySQL引入InnoDB，以强化参照完整性与并发违规处理机制，取代了MyISAM。

每个MyISAM表，由存储在硬盘上的3个文件组成，每个文件都以表名称为文件主名，并搭配不同扩展名区分文件类型：
- .frm－－存储资料表定义，此文件非MyISAM引擎的一部分
- .MYD－－存放真正的资料
- .MYI－－存储索引信息。

MyISAM使用表锁机制优化并发读写操作，但需要经常运行OPTIMIZE TABLE命令恢复被更新机制所浪费的空间，否则碎片也会随之增加，最终影响数据访问性能。


MyISAM强调快速读取操作，主要用于高并发select，这也是MySQL深受Web开发喜爱原因：Web场景下大量操作都是读数据，所以大多数虚拟主机提供商和Internet平台提供商（Internet Presence Provider，IPP）只允许MyISAM格式。

MyISAM类型的表支持三种不同的存储结构：静态型、动态型、压缩型。
- 静态表(默认的存储格式) 表中的字段都是非变长字段，这样每个记录都是固定长度的，这样存储
    - 优点:非常迅速，易缓存，出现故障容易恢复
    - 缺点:占用的空间通常比动态表多。静态表在数据存储时会根据列定义的宽度定义补足空格，但是在访问的时候并不会得到这些空格，这些空格在返回给应用之前已经去掉。同时需要注意：在某些情况下可能需要返回字段后的空格，而使用这种格式时后面到空格会被自动处理掉。
- 动态表 包含变长字段，记录非固定长度的
    - 优点:占用空间较少
    - 缺点:频繁更新删除记录会产生碎片，需要定期执行`OPTIMIZE TABLE`或`myisamchk -r`改善性能，并且出现故障的时候恢复相对比较困难
- 压缩表 由myisamchk工具创建，占据非常小空间，因为每条记录都是被单独压缩，所以只有非常小的访问开支

# InnoDB
- MySQL5.5后的默认存储引擎
![](https://img-blog.csdnimg.cn/20200825042612761.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

适用于更新密集型。

- 系统崩溃修复能力
InnoDB可借由事务记录日志（Transaction Log）恢复程序崩溃（crash），或非预期结束所造成的资料错误；
而MyISAM遇到错误，必须完整扫描后才能重建索引，或修正未写入硬盘的错误。InnoDB的修复时间，大都固定，但MyISAM的修复时间，与数据量成正比。相对比较，随数据量增加，InnoDB有更佳稳定性。

- 缓存
MyISAM必须依靠操作系统来管理读与写的缓存，而InnoDB则是有自己的读写缓存管理机制。InnoDB不会将被修改的数据页立即交给操作系统（page cache），因此在某些情况下，InnoDB的数据访问会比MyISAM更有效率。

- 提供ACID事务、多版本并发MVCC控制的行锁。
- 支持自增长列
自增长列的值不能为空，如果在使用的时候为空，则自动从现有值开始增值，如果有但是比现在的还大，则直接保存这个值。
- 支持外键（foreign key） 
外键所在的表称为子表而所依赖的表称为父表。

当操作完全兼容ACID时，虽然InnoDB会自动合并多个连接，但每次有事务产生时，仍至少须写入硬盘一次，因此对于某些硬盘或磁盘阵列，会造成每秒200次的事务处理上限。若希望达到更高的性能且保持事务的完整性，就必使用磁盘缓存与电池备援。当然InnoDB也提供数种对性能冲击较低的模式，但相对的也会降低事务的完整性。
而MyISAM则无此问题，但这并非因为它比较先进，这只是因为它不支持事务。

# Infobright

mysql的列存储引擎，适用于数据分析和数据仓库设计。

优点:

1.查询性能高        --比普通Mysql 数据库引擎(MyISAM、InnoDB)  快5-60倍.

2.存储数据量大   --能存储的数据量特别大.

3.高压缩比             --与普通数据库存放的数据文件相比, 可以达到55:1

4.不需要建立索引  --省去了大量建立索引的时间.(对于我们非常有优势)

缺点:

1.不能高并发.最多10个并发

2.Infobright分两个版本:社区版(ICE,免费)、企业版(IEE,收费),社区版在添加数据时,只支持loaddata , 而不支持.insert,update ,delete . 企业版,则全部支持.

# TokuDB

支持数据压缩，支持高速写入的一个引擎，但是不适合update多的场景。

# XtraDB
XtraDB为派生自InnoDB的强化版，由Percona开发，从MariaDB的10.0.9版起取代InnoDB成为默认的数据库引擎。

# 常用的MyISAM与InnoDB引擎选型

#### MyISAM与InnoDB
InnoDB和MyISAM是许多人在使用MySQL时最常用的两个表类型，这两个表类型各有优劣，视具体应用而定。

- MyISAM类型不支持事务处理等高级处理，而InnoDB类型支持
- MyISAM类型的表强调的是性能，其执行数度比InnoDB类型更快，但是不提供事务支持，而InnoDB提供事务支持以及外部键等高级数据库功能。

所以从宏观来讲，事务数据库关注细节，而数据仓库关注高层次的聚集，所以，InnoDB更适合作为线上的事务处理，而MyISAM更适合作为ROLAP型数据仓库。

#### InnoDB引擎适合线上事物型数据库
1.InnoDB引擎表是基于B+树的索引组织表(IOT)；

2.每个表都需要有一个聚集索引(clustered index)；

3.所有的行记录都存储在B+树的叶子节点(leaf pages of the tree)；

4.基于聚集索引的增、删、改、查的效率相对是最高的；

5.如果我们定义了主键(PRIMARY KEY)，那么InnoDB会选择器作为聚集索引；

6.如果没有显式定义主键，则InnoDB会选择第一个不包含有NULL值的唯一索引作为主键索引；

7.如果也没有这样的唯一索引，则InnoDB会选择内置6字节长的ROWID作为隐含的聚集索引(ROWID随着行记录的写入而主键递增，这个ROWID不像ORACLE的ROWID那样可引用，是隐含的)。

#### MYISAM引擎适用于ROLAP数据仓库：
1.读取效率：数据仓库的高并发上承载的大部分是读， MYISAM强调的是性能，每次查询具有原子性,其执行数度比InnoDB类型更快。

2\. 存储空间：MyISAM： MyISAM的索引和数据是分开的，并且索引是有压缩的，内存使用率就对应提高了不少。InnoDB：需要更多的内存和存储，它会在主内存中建立其专用的缓冲池用于高速缓冲数据和索引。

3\. MyISAM可移植性备份及恢复：MyISAM：数据是以文件的形式存储，所以在跨平台的数据转移中会很方便。在备份和恢复时可单独针对某个表进行操作。InnoDB：免费的方案可以是拷贝数据文件、备份 binlog，或者用 mysqldump，在数据量达到几十G的时候就相对痛苦了。移植过程中MyISAM不受字典数据的影响。

4.从接触的应用逻辑来说，select count(*) 和order by 是最频繁的，大概能占了整个sql总语句的60%以上的操作，而这种操作Innodb其实也是会锁表的，很多人以为Innodb是行级锁，那个只是where对它主键是有效，非主键的都会锁全表的。但MYISAM对于count操作只需要在元数据中读取，不用扫表。

5.如果和MyISAM比insert写操作的话，Innodb还达不到MyISAM的写性能，如果是针对基于索引的update操作，虽然MyISAM可能会逊色Innodb,但是那么高并发的写，从库能否追的上也是一个问题，且不建议数据仓库中频繁update数据。

6.如果是用MyISAM的话，merge引擎可以大大加快数据仓库开发速度，非常适合大项目总量约几亿的rows某一类型(如日志，调查统计)的业务表。

7.全文索引：MyISAM：支持 FULLTEXT类型的全文索引。InnoDB：不支持FULLTEXT类型的全文索引，但是innodb可以使用sphinx插件支持全文索引，并且效果更好。

8.表主键：MyISAM：允许没有任何索引和主键的表存在，索引都是保存行的地址。InnoDB：如果没有设定主键或者非空唯一索引，就会自动生成一个6字节的主键(用户不可见)，数据是主索引的一部分，附加索引保存的是主索引的值。

9.对于AUTO_INCREMENT类型的字段，InnoDB中必须包含只有该字段的索引，但是在MyISAM表中，可以和其他字段一起建立联合索引。

10\. MyISAM不支持外键，需通过其他方式弥补。

#### 根据引擎特性的优化

如何对InnoDB引擎的表做最优的优化：

1.使用自增列(INT/BIGINT类型)做主键，这时候写入顺序是自增的，和B+数叶子节点分裂顺序一致，这时候存取效率是最高的

2.该表不指定自增列做主键，同时也没有可以被选为主键的唯一索引(上面的条件)，这时候InnoDB会选择内置的ROWID作为主键，写入顺序和ROWID增长顺序一致。



参考
- https://zh.wikipedia.org/wiki/MyISAM 
- https://zhuanlan.zhihu.com/p/19965157

![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)