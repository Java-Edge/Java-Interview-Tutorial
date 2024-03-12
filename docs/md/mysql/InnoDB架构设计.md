# InnoDB架构设计

```sql
update `user` set `name`='xxx' where `id`=1;
```

业务系统通过一个数据库连接发给MySQL，经过SQL接口、解析器、优化器、执行器，解析SQL语句，生成执行计划，接着由执行器负责执行该计划，调用InnoDB的接口去实际执行。

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/watermark%252Ctype_d3F5LXplbmhlaQ%252Cshadow_50%252Ctext_SmF2YUVkZ2U%253D%252Csize_20%252Ccolor_FFFFFF%252Ct_70%252Cg_se%252Cx_16.png)

本文研究存储引擎的架构设计，探索存储引擎内部如何完成一条更新语句。

## InnoDB的内存结构：缓冲池

InnoDB内部放在内存里的组件，缓冲池（Buffer Pool），会缓存很多数据， 以便之后查询时，若缓冲池有数据，无需查磁盘：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/watermark%252Ctype_d3F5LXplbmhlaQ%252Cshadow_50%252Ctext_SmF2YUVkZ2U%253D%252Csize_20%252Ccolor_FFFFFF%252Ct_70%252Cg_se%252Cx_16-20240312091704955.png)﻿

所以当InnoDB执行更新语句时  ，如对“id=1”这行数据，会先将“id=1”这行数据看是否在缓冲池：

- 若不在，则直接从磁盘里加载到缓冲池，接着对这行记录加独占锁（更新“id=1”这行数据时，肯定不允许别人同时更新）

## undo日志文件：让你更新的数据可回滚

假设“id=1”这行数据的name原来是“Java”，现在我们要更新为“Edge”，则此时得先把要更新的原来的值“Java”和“id=1”这些信息，写入undo日志文件。

若执行一个更新语句，要是他在一个事务里，则事务提交前，我们都可以对数据进行回滚，即把你更新为“Edge”的值回滚到之前的“Java”。

所以考虑到后续可能需要回滚数据，这里会把你更新前的值写入undo日志文件：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/watermark%252Ctype_d3F5LXplbmhlaQ%252Cshadow_50%252Ctext_SmF2YUVkZ2U%253D%252Csize_20%252Ccolor_FFFFFF%252Ct_70%252Cg_se%252Cx_16-20240312091709463.png)﻿

## 更新buffer pool

当要更新的那行记录从磁盘文件加载到缓冲池，同时对其锁后，而且还把更新前的旧值写入undo日志文件后，就能开始更新该行记录。

更新时，**先更新缓冲池中的记录**，此时这个数据就是脏数据了。

把内存里的“id=1”这行数据的name字段修改为“Edge”，为何此时这行数据就是脏数据了？因为这时磁盘上 中“id=1”这行数据的name还是“Java”，但内存里这行数据已被修改，所以它就是脏数据：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/watermark%252Ctype_d3F5LXplbmhlaQ%252Cshadow_50%252Ctext_SmF2YUVkZ2U%253D%252Csize_20%252Ccolor_FFFFFF%252Ct_70%252Cg_se%252Cx_16-20240312091713975.png)

## Redo Log Buffer

万一系统宕机，如何避免数据丢失？

现在已修改了内存数据，但还没修改磁盘数据，若此时MySQL所在机器宕机，内存里修改过的数据就会丢失，咋办？

这时，就得将对内存所做的修改写到**Redo Log Buffer**，也是内存里的一个缓冲区，存放redo日志。redo log记录了你对数据做了什么修改，如：对id=1这行记录修改了name字段的值为"Edge"：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/watermark%252Ctype_d3F5LXplbmhlaQ%252Cshadow_50%252Ctext_SmF2YUVkZ2U%253D%252Csize_20%252Ccolor_FFFFFF%252Ct_70%252Cg_se%252Cx_16-20240312091717936.png)

redo log就是在MySQL宕机时，用来恢复你更新过的数据。

## 若还没提交事务，MySQL宕机了，咋办？

在数据库中，哪怕执行一条SQL语句，其实也可算做一个独立事务，只有当你提交事务后，SQL语句才算执行结束。

所以至此，其实还没提交事务，若此时MySQL宕机，导致内存里Buffer Pool中的修改过的数据丢失了，同时你写入Redo Log Buffer中的redo日志也会丢失，﻿这咋办？

其实没必要惊恐，因为这条更新语句，没提交事务，就代表他还没执行成功，此时MySQL宕机了，虽然导致内存的数据更新都丢失了，但磁盘上的数据依然还停留在原样。

即“id=1”那行数据的name还是原值，所以此时你的这个事务就是执行失败了，没能成功完成更新，那你就会收到一个数据库异常。然后当MySQL重启正常后，你会发现你的数据并没有任何变化。所以此时即使MySQL宕机，也不会有任何问题。

## 提交事务时，将redo日志写盘

现在真的想提交一个事务，就会根据策略将redo log从redo log buffer里刷盘。

该策略可通过innodb_flush_log_at_trx_commit配置：

- 参数=0时，那你提交事务时，不会把redo log buffer里的数据刷盘，此时可能你都提交事务了，结果MySQL宕机了，然后此时内存里的数据全部丢失。相当于你提交事务成功了，但由于MySQL突然宕机，导致内存中的数据和redo日志都丢了。

 - 参数=1，你提交事务时，就必须把redo log从内存刷盘，只要事务提交成功，则redo log必然在磁盘

   ![](https://codeselect.oss-cn-shanghai.aliyuncs.com/watermark%252Ctype_d3F5LXplbmhlaQ%252Cshadow_50%252Ctext_SmF2YUVkZ2U%253D%252Csize_20%252Ccolor_FFFFFF%252Ct_70%252Cg_se%252Cx_16-20240312091722659.png)

那么只要提交事务成功后，redo日志一定在磁盘，此时你肯定会有一条redo日志说，“我此时对哪个数据做了一个什么修改，如name修改为Edge了”。

即使此时Buffer  Pool中更新过的数据还没刷盘，此时内存数据是更新后的“name=Edge”，而磁盘上的数据还是未更新的“name=Java”。

提交事务后，可能处于的一个状态：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/watermark%252Ctype_d3F5LXplbmhlaQ%252Cshadow_50%252Ctext_SmF2YUVkZ2U%253D%252Csize_20%252Ccolor_FFFFFF%252Ct_70%252Cg_se%252Cx_16-20240312091726527.png)﻿

此时，若提交事务后处于上图状态，然后MySQL突然宕机，也不会丢失数据。

虽然内存里的修改成name=Edge的数据会丢，但redo日志里已经记录：对某数据做了修改name=Edge。

所以之前由于系统崩溃，而现在MySQL重启后，还能根据redo日志，恢复之前做过的修改：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/watermark%252Ctype_d3F5LXplbmhlaQ%252Cshadow_50%252Ctext_SmF2YUVkZ2U%253D%252Csize_20%252Ccolor_FFFFFF%252Ct_70%252Cg_se%252Cx_16-20240312091730346.png)﻿

若innodb_flush_log_at_trx_commit=2呢？

提交事务时，把redo日志写入磁盘文件对应的os cache缓存，而不是直接进入磁盘文件，可能1s后，才把os cache里的数据写入到磁盘文件。这种模式下，提交事务后，redo log可能仅停留在os cache内存缓存，还没实际进入磁盘文件，若此时宕机，则os cache里的redo log就会丢失，同样会让你感觉提交事务了，但结果数据丢了：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/watermark%252Ctype_d3F5LXplbmhlaQ%252Cshadow_50%252Ctext_SmF2YUVkZ2U%253D%252Csize_20%252Ccolor_FFFFFF%252Ct_70%252Cg_se%252Cx_16-20240312091734055.png)

### redo日志刷盘策略的最佳实践

针对redo日志的三种刷盘策略，推荐设为1：提交事务时，redo日志必须刷入磁盘文件。

这就能严格保证提交事务后，数据绝对不会丢失，因为有redo日志在磁盘文件，可以恢复你做的所有修改。

- 若选择0，可能你提交事务后，MySQL宕机，则此时redo日志没有刷盘，导致内存里的redo日志丢失，你提交的事务更新的数据就丢了
- 若选择2，虽然之前提交事务时，redo日志进入os cache了，但还没进入磁盘文件，此时MySQL宕机还是会导致os cache里的redo日志丢失

所以对于MySQL这种严格的系统，推荐redo日志刷盘策略设为1，这样就能保证在事务提交后，数据绝对不可能丢失。

增删改都是针对表中的某些数据处理，先找到表对应的表空间，然后找到表空间对应的磁盘文件，接着从磁盘文件里将待更新的那批数据所在的数据页从磁盘读出来，放到BP的缓存页里：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/watermark%252Ctype_d3F5LXplbmhlaQ%252Cshadow_50%252Ctext_SmF2YUVkZ2U%253D%252Csize_20%252Ccolor_FFFFFF%252Ct_70%252Cg_se%252Cx_16-20240312091738408.png)﻿    

接着增删改SQL就会针对缓存页去执行你的更新逻辑，如插入、更新或删除一行数据。﻿

## binlog到底是啥？

redo log，偏向物理性质的重做日志，因其记录的东西类似“对哪个数据页中的什么记录，做了什么修改”。而且redo log本身是属于InnoDB存储引擎特有的东西。

binlog，归档日志，记录的是偏向于逻辑性的日志，类似“对user表中的id=1这行数据做了更新操作，更新以后的值是xxx”。

binlog不是InnoDB存储引擎特有的日志文件，是属于MySQL Server自己的日志文件。

### 提交事务时，同时会写入binlog

提交事务时，会把redo log写入磁盘文件，其实这同时还会把这次更新对应的binlog日志写入磁盘文件：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/watermark%252Ctype_d3F5LXplbmhlaQ%252Cshadow_50%252Ctext_SmF2YUVkZ2U%253D%252Csize_20%252Ccolor_FFFFFF%252Ct_70%252Cg_se%252Cx_16-20240312091742176.png)

执行器负责和InnoDB交互：

- 从磁盘里加载数据到Buffer Pool中进行缓存
- 写入undo日志
- 更新Buffer Pool里的数据
- 写入redo log buffer
- redo log刷入磁盘
- 写binlog等

可见，执行器非常核心，负责跟InnoDB存储引擎配合完成一个SQL语句在磁盘与内存层面的全部数据更新操作。

也能看出，一次更新语句的执行，其实分为如下阶段：

- 1、2、3、4其实都是你执行该更新语句时做的事
- 5、6是从你提交事务时开始，属于提交事务的阶段了

### binlog日志的刷盘策略

**sync_binlog**参数可控制binlog的刷盘策略：

- 默认为0，此时将binlog写入磁盘时，其实不是直接进入磁盘文件，而是进入os cache内存缓存。所以类似 redo log，若此时MySQL宕机，则你在os cache里的binlog日志会丢失
- 设置为1，则此时会强制在提交事务的时候，把binlog直接写入到磁盘文件，这样提交事务之后，即使 MySQL宕机，磁盘上的binlog不会丢失

## 基于binlog和redo log完成事务的提交

将binlog写入磁盘文件后，就会完成最终的事务提交，此时会把本次更新对应的binlog文件名称和这次更新的binlog日志在文件里的位置，都写入redo log日志文件，同时在redo log日志文件里写入一个commit标记。

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/watermark%252Ctype_d3F5LXplbmhlaQ%252Cshadow_50%252Ctext_SmF2YUVkZ2U%253D%252Csize_20%252Ccolor_FFFFFF%252Ct_70%252Cg_se%252Cx_16-20240312091746174.png)

﻿完成此事后，才算最终完成事务的提交。

## 最后在redo日志中写入commit标记有啥用？

用来保持redo log日志与binlog日志一致。

假设提交事务时，有⑤、⑥、⑦三步，必须这三步都执行完，才算完整提交了事务。

- 若刚完成⑤时，MySQL宕机了，咋办？由于此时没有最终的事务commit标记在redo日志，所以此次事务判定为失败。不会说redo日志文件里有这次更新的日志，而binlog日志文件里没有这次更新的日志，所以不会出现数据不一致问题。
- 若完成⑥时，MySQL宕机了，同理，因无redo log中的最终commit标记，本次事务提交也是失败的

综上，必须在redo log中写入最终事务commit标记，然后此时事务提交成功，而且redo log里有本次更新对应日志，binlog里也有本次更新对应日志 ，redo log和binlog就数据一致了。

## 后台I/O线程随机将内存更新后的脏数据刷回磁盘

假设已提交事务，此时一次更新“update user set name='Edge' where id=1”，他已将内存里的Buffer Pool中的缓存数据更新了，同时磁盘文件里已有redo、binlog日志，都记录了把我们指定的“id=1”这行数据修改为“name='Edge'”。

但此时，磁盘上的数据文件里的“id=1”这行数据name还是Java这个旧值呀。所以MySQL有个后台I/O线程，会在之后某时间，**随机地**把内存Buffer Pool中的修改后的脏数据给刷回到磁盘上的数据文件：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/20.png)

﻿当I/O线程将Buffer Pool中修改后的脏数据刷回磁盘后，磁盘上的数据才和内存一致，都是name=Edge这个修改后的值了。

在I/O线程把脏数据刷盘前，MySQL宕机也没事，因为重启后，会根据redo log，将之前提交事务做过的修改恢复到内存，就是id=1的数据的name修改为了Edge，I/O线程伺机将修改后的数据，刷到磁盘的数据文件。

该机制最大问题在于，若你一个事务里有增删改SQL更新了缓存页，然后事务提交了，结果还没来得及让I/O线程把缓存页刷到磁盘文件，MySQL宕机了，然后内存数据丢失，你事务更新的数据就丢失了！

但也不可能每次你事务一提交，就把你事务更新的缓存页都刷回磁盘文件，因为缓存页刷到磁盘文件，是随机磁盘读写，性能很差，会导致DB性能和并发能力都很低下。

所以才引入redo log机制：提交事务时，保证将你对缓存页做的修改以日志形式，写入redo log日志文件。格式如下：对表空间XX中的数据页XX中的偏移量为OOOO的地方更新了数据YYY。

只要事务提交时，保证你做的修改以日志形式写入redo log日志，即使此时宕机，也没关系。因为MySQL重启后，把你之前事务更新过做的修改根据redo log在Buffer Pool里重做一遍就可以了，就可以恢复出来当时你事务对缓存页做的修改，然后找时机再把缓存页刷入磁盘文件。

事务提交时，把修改过的缓存页都刷盘，跟你事务提交的时候把你做的修改的redo log都写入日志文件，不都是写磁盘？差别在于：

- 若将修改过的缓存页都刷盘，首先缓存页一个16K，数据较大，刷盘较耗时，而且你可能就修改了缓存页里的几个字节的数据，难道也把完整缓存页刷盘吗？
- 缓存页刷盘是随机写磁盘，性能差，因其一个缓存页对应位置可能在磁盘文件的一个随机位置

但若写redo log：

- 一行redo log可能就占据几十个字节，就包含表空间号、数据页号、磁盘文件偏移打印量、更新值，这写盘速度很快
- redo log写日志，是顺序写磁盘文件，直接追加到磁盘文件末尾去，速度很快

所以提交事务时，用redo log记录修改，性能＞＞刷缓存页，可让你的DB并发能力更强。

## 总结

InnoDB主要包含一些buffer pool、redo log buffer等内存里的缓存数据，还包含一些undo日志文件，redo日志文件等，同时mysql server自己还有binlog日志文件。

执行更新时，每条SQL语句，都会对应修改buffer pool里的缓存数据、写undo日志、写redo log buffer几个步骤。

但当你提交事务时，一定会把redo log刷入磁盘，binlog刷入磁盘，完成redo log中的事务commit标记；最后后台的I/O线程会随机把buffer pool里的脏数据刷入磁盘里去。