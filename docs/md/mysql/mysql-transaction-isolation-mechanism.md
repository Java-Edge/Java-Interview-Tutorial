# MySQL是怎么实现事务隔离的？

## 0 前言

一个事务要更新一行，若恰有另一事务持有该行的行锁，它会被锁住。既然进入等待状态，那等该事务自己获取到行锁要更新数据时，它读到的值又是啥？

## 1 案例

### 1.1 数据初始化

```sql
mysql> CREATE TABLE `t`
    -> (
    -> `id` int(11) NOT NULL,
    -> `k` int(11) DEFAULT NULL,
    -> PRIMARY KEY (`id`)
    -> ) ENGINE = InnoDB;
Query OK, 0 rows affected, 2 warnings (0.01 sec)

mysql>
mysql> insert into t(id, k)
    -> values (1, 1),
    ->        (2, 2);
```

### 1.2 事务执行流程

| 事务A                                       | 事务B                                                        | 事务C                          |
| ------------------------------------------- | ------------------------------------------------------------ | ------------------------------ |
| start transaction with consistent snapshot; |                                                              |                                |
|                                             | start transaction with consistent snapshot;                  |                                |
|                                             |                                                              | update t set k=k+1 where id=1; |
|                                             | update t set k=k+1 where id=1;  <br/>select k from t where id=1; |                                |
| select k from t where id=1; <br>commit;     |                                                              |                                |
|                                             | commit;                                                      |                                |

### 1.3 事务启动时机

- begin/start transaction：在执行到它们之后的第一个操作InnoDB表的语句，事务才真正启动。一致性视图是在执行【第一个快照读语句】时创建
- **start transaction with consistent snapshot**：想立马启动一个事务时用。一致性视图是在执行【start transaction with consistent snapshot】时创建

默认`autocommit=1`。该案例中：

- 事务C未显式用begin/commit，即该update语句本身就是个事务，语句完成时自动提交
- 事务B更新行后，就查询
- 事务A在一个只读事务中查询，时间上在事务B的查询后

## 2 undo log链

每条undo log有两个隐藏字段：

- trx_id：最近一次更新这条数据的事务id

- roll_pointer：指向更新这个事务之前生成的undo log


若有一事务A（id=50）插入一条数据，则该数据隐藏字段及指向的undo log如下：roll_pointer指向一个空undo log，因为之前没这条数据

![](https://img-blog.csdnimg.cn/887ff223849e46398e2dd152d2d1bb8b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

﻿再有一事务B修改该数据，改成值B，事务B的id是53，此时更新之前会生成一个undo log记录之前的值，然后roll_pointer指向这个实际的undo log回滚日志：

![](https://img-blog.csdnimg.cn/af32cf5eaecd4610917d181d7e9a69f3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

﻿roll_pointer指向undo log，这undo log就记录你更新之前的那条数据的值。

再事务C来修改这值为C，其事务id=60，此时会把数据行里的txr_id改成60，然后生成一条undo log，记录之前事务B修改的那个值：

![](https://img-blog.csdnimg.cn/bbc7ffed187c4ea59fbecc81f2f0c573.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

﻿多个事务串行执行时，每个人修改了一行数据，都会更新隐藏字段txr_id和roll_pointer，同时之前多个数据快照对应的undo log，会通过roll_pinter指针串联起来，形成版本链！

## 3 视图（ReadView）

执行一个事务时，就给你生成一个ReadView，其关键组成：

- m_ids：此时有哪些事务在MySQL里执行还没提交

- min_trx_id：m_ids里最小的值

- max_trx_id：MySQL下一个要生成的事务id，就是最大事务id

- creator_trx_id：你这个事务的id

若原有一行数据，很早就有事务插入过了，事务id是32，他的值就是初始值：

![](https://img-blog.csdnimg.cn/7522f99e1bca4407843806d070744c2a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

此时两个事务并发来执行了：

- 事务A（id=45）：读取这行数据的值

- 事务B（id=59）：更新这行数据的


﻿现在A直接开启一个ReadView：

- m_ids包含事务A、B的id：45和59
- min_trx_id=45
- max_trx_id=60
- creator_trx_id=45，事务A自己

事务A第一次查询该行数据，判断：

```
当前这行数据的txr_id ＜ReadView中的min_trx_id？
```

txr_id=32小于ReadView里的min_trx_id 45，说明事务开启前，修改这行数据的事务早就提交，所以此时可以查到这行数据。

接着B把这行数据的值修改为了值b，然后这行数据txr_id设为自己的id=59，roll_pointer指向修改之前生成的一个undo log，接着这个事务B就提交了：

![](https://img-blog.csdnimg.cn/97b7e42a361643c8a28ea54e39d33eec.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

A再次查询，发现此时数据行里的txr_id=59：

ReadView里的max_trx_id（60) ＞ txr_id ＞ ReadView里的min_txr_id(45)

说明更新这条数据的事务，很可能就跟自己差不多同时开启，于是会看txr_id=59是否在ReadView的m_ids列表。果然就有45和59两个事务id，证实这修改数据的事务是和自己同一时段并发执行然后提交的，所以对这行数据不能查询！

那查啥？顺着这条数据的roll_pointer顺着undo log日志链条往下找，就会找到最近的一条undo log，发现trx_id=32，小于ReadView里的min_trx_id（45），说明该undo log版本在A开启前就执行且提交。那就查询最近那undo log里的值，这就是undo log多版本链的作用，可保存一个快照链，让你能读到之前的快照值：

![](https://img-blog.csdnimg.cn/dc3062597ed344f788cbe780bc6745c3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

多事务并发时，事务B更新的值，通过这套**ReadView+undo log**日志链机制，保证A不会读到并发执行的B更新的值，而只会读到之前最早的值。

接着若事务A更新了这行数据的值，改成值a，trx_id修改为45，同时保存之前事务B修改的值的快照：

![](https://img-blog.csdnimg.cn/2e5b2e26db8b465884b3160f13c792da.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

﻿此时A来查询这条数据的值，发现trx_id=45，和自己ReadView里的creator_trx_id（45）一样，说明这行数据就是自己修改的，自己修改的值当然可见。

![](https://img-blog.csdnimg.cn/dfa8f7e7253c4914add54b99a85e30a9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

﻿接着在事务A执行的过程中，突然开启事务C，事务id=78，然后他更新那行数据为值C，还提交了：

![](https://img-blog.csdnimg.cn/1e0acc50194e4738824ebac3bf86063f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

这时A再查询，发现当前数据trx_id=78＞自己ReadView的max_trx_id（60)，说明A开启后，然后有个事务更新了数据，自己当然不能看到！

﻿就顺undo log多版本链往下找，先找到值a，自己之前修改的过的那个版本，因为那个trx_id=45跟自己的ReadView里的creator_trx_id一样，所以此时直接读取自己之前修改的那个版本。

## 4 小结

通过undo log多版本链，加上开启事务时产生的ReadView，然后再有一个查询时，根据ReadView进行判断，就能知你应读取哪个版本数据，保证你

### 能读到

- 你事务开启前，其它已提交事务更新的值

- 还有你自己事务更新的值

### 读不到

- 若你事务开启前，就有其它事务在运行，当你事务开启后，其它事务更新了值
- 你事务开启后，比你晚开启的事务更新了值

通过这套机制就可以实现多个事务并发执行时候的数据隔离。

## 5 RC级实现

事务运行期，只要其它事务修改数据并提交，即可读到人家修改的数据，所以会不可重复读、幻读。

ReadView机制基于undo log版本链实现的一套读视图机制，事务生成一个ReadView：

- 若为事务自己更新的数据，自己可读到
- 或你生成ReadView之前的已提交的事务所修改值，也可读到
- 但若你生成ReadView时，就已经活跃的事务，但如果它在你生成ReadView之后修改的数据并提交了，此时你读不到
- 或你生成ReadView以后再开启的事务修改了数据，还提交了，也读不到

所以上面那套机制就是ReadView的一个原理。咋基于ReadView实现RC？当一个事务设置RC，他是每次发起查询，都重新生成一个ReadView！

数据库有行数据，是事务id=50的一个事务很久前插入的，而当前活跃事务：

- 事务A（id=60）
- 事务B（id=70）

现在事务B发起update，更新这条数据为b，所以此时数据的trx_id会变为事务B的id=70，同时生成一条undo log：

![](https://img-blog.csdnimg.cn/c55a614c17014744bf3e8f727412c0f1.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

这时，事务A要发起一次查询操作，就生成一个ReadView：

![](https://img-blog.csdnimg.cn/e0114e59efb54cdd8fba780b5d9abc66.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

这时事务A发起查询，发现当前数据trx_id=70。即属于ReadView的事务id范围之间，说明是他生成ReadView之前就有这活跃的事务，是这事务修改了这条数据的值，但此时事务B还没提交，所以ReadView的m_ids活跃事务列表里，有[60, 70]两个id，此时根据ReadView机制，事务A无法查到事务B修改的值b。

就顺undo log版本链往下找，就找到一个原始值，发现其trx_id是50，小于当前ReadView里的min_trx_id，说明是他生成ReadView之前，就有一个事务插入了这个值并且早就提交了，因此可以查到这个原始值。

接着，假设事务B提交，提交了就说明事务B不会活跃于数据库里了。事务A下次再查询，就可以读到事务B修改过的值了。那到底是怎么让事务A能够读到提交的事务B修改过的值呢？

让事务A下次发起查询，再生成一个ReadView，数据库内活跃的事务只有事务A，因此：

- min_trx_id是60
- mac_trx_id是71
- m_ids=60，事务B的id=70不会出现在m_ids活跃事务列表

此时事务A再基于这ReadView去查询，会发现这条数据的trx_id=70，虽然在ReadView的min_trx_id和max_trx_id范围之间，但是此时并不在m_ids列表内，说明事务B在生成本次ReadView之前就已提交。说明这次你查询就可以查到事务B修改过的这个值了， 此时事务A就会查到值B。

## 6 RR级实现

咋同时避免不可重复读问题、幻读？

MySQL让多事务并发运行的时候能互相隔离，避免同时读写一条数据时有影响，是借助undo log版本链和ReadView机制。

RR级别下，你这事务读一条数据，无论读多少次，都是一个值：

- 别的事务修改数据了后即使提交了，你也看不到人家修改的值，这就解决了不可重复读
- 其它事务插入一些新数据，你也读不到，这就避免幻读

若有一条数据是事务id=50的一个事务插入的，此时有事务A、B同时在运行。﻿事务A发起一个查询，第一次查询就生成一个ReadView：

- creator_trx_id=60
- min_trx_id=60
- max_trx_id=71
- m_ids=[60, 70]

这时，事务A基于该ReadView去查这条数据，发现这条数据的trx_id为50，小于ReadView﻿里的min_trx_id的，说明他发起查询之前，早就有事务插入这条数据还提交了，所以此时可以查到这条原始值的

![](https://img-blog.csdnimg.cn/8db3a28dcea14f7da75098ca5e7212b6.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

接着事务B此时更新了这条数据的值为b，修改trx_id=70，同时生成一个undo log，事务B此时提交

![](https://img-blog.csdnimg.cn/e9fc43838a4d477cac74c192568236c2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

ReadView中的m_ids此时还是60、70，因为ReadView一旦生成了就不会改变！

这时虽然事务B已提交，但事务A的ReadView里， 还是有60、70，即在你事务A开启查询时，事务B当时是在运行的意思而已。

然后事务A查询这条数据，发现此时数据的trx_id=70，在ReadView的min_trx_id和max_trx_id的范围，还在m_ids列表，这说明啥？

事务A开启查询时，id=70的这个事务B还在运行，然后由这个事务B更新了这条数据，所以此时事务A不能查询到事务B更新的这个值，因此顺着指针往历史版本链条上去找，找到trx_id=50，是小于ReadView的min_trx_id的，说明在他开启查询之前，就已提交该事务，所以事务A可查询到该值，此时事务A查到的就是原始值。这就解决了不可重复读。

事务A多次读同一个数据，每次读到的都是一样的值，除非是他自己修改的值，否则读到的一直一样。不管别的事务如何修改数据，事务A的ReadView始终不变，他基于这ReadView看到的值始终如一！

### 解决幻读

假设事务A先

```sql
select * from x where id>10
```

此时可能查到的就是一条数据，而且读到的是这条数据的原始值的那个版本：

![](https://img-blog.csdnimg.cn/47f75068dda147eab73288c81285540d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

现在，有个事务C插入一条数据，然后提交：

![](https://img-blog.csdnimg.cn/78756b3a3f924daa9413d21dbe518cf8.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

﻿接着，事务A再查询，发现符合条件的有2条数据：

- 原始值那个数据

- 事务C插入的那条数据

  但C插入的那条数据的trx_id=80 ＞ ReadView的max_trx_id，说明是自己发起查询后，这个事务才启动，所以此时这条数据不能查询。

﻿因此事务A本次查询，还是只能查到原始值那一条数据。所以这里事务A不会发生幻读，他根据条件范围查询的时候，每次读到的数据都是一样的，不会读到人家插入进去的数据，这都是依托ReadView机制实现的。

## 7 MySQL的两个“视图”

- view：一个用查询语句定义的虚拟表，调用时，执行查询语句并生成结果。创建视图的语法 create view … ，其查询方法与表一样
- InnoDB实现MVCC时用的一致性读视图（consistent read view）：用于支持**读提交**、**可重复读**。没有物理结构，事务执行期间用来定义“我能看到啥数据”。

## 8 “快照”在MVCC咋工作的？

RR下，事务启动时就“拍了个快照”。该快照是基于整库的。若某库有100G，则启动一个事务，MySQL就要拷贝100G数据出来，这得多慢。实际上，并不需要拷贝出这100G数据。

### 8.1 快照的实现

InnoDB每个事务有**唯一事务ID**：transaction id，在事务开始时向InnoDB事务系统申请的，按申请顺序严格递增。

#### 每行数据也有多版本

每次事务更新数据时，都生成一个新**数据版本**，并把`transaction id`赋给该**数据版本**的**事务ID**，记为row trx_id。同时，旧数据版本要保留，并在新数据版本中，能有办法可直接拿到它。

即一行记录可能有多个版本(row)，每个版本有自己的row trx_id。

如图，就是一个记录被多个事务连续更新后的状态。行状态变更图：

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/MySQL%e5%ae%9e%e6%88%9845%e8%ae%b2/assets/68d08d277a6f7926a41cc5541d3dfced.png)

虚线框里是同一行数据的4个版本，当前最新版本是V4，k=22，它是被transaction id=25的事务更新，因此它的row trx_id=25。

- 语句更新会生成undo log（回滚日志），在哪呢？
  三个虚线箭头，就是undo log。V1、V2、V3并非物理上真实存在，而是每次需要时，根据当前版本和undo log计算而得。比如，需要V2时，就通过V4依次执行U3、U2计得。

那InnoDB如何定义那个“100G”快照？
按可重复读定义，一个事务启动时，能够看到所有已提交的事务结果。但之后，该事务执行期间，其他事务的更新对它不可见。

因此，一个事务只需在启动时说，以我启动时刻为准：

- 若一个数据版本是在我启动前生成，就认
- 启动后才生成，我不认，我必须要找到它的上一个版本。若上个版本也不可见，就继续往前找。若是该事务自己更新的数据，它自己还是要认的。

### 视图数组

InnoDB为每个事务构造了一个数组，以保存该事务启动瞬间，当前正“活跃”（启动了，但尚未提交）的所有事务ID。

在该数组里：

- 事务ID的最小值，记为低水位
- 当前系统里已创建过的事务ID的最大值加1，记为高水位

这个视图数组和高水位，就组成了当前事务的一致性视图（read-view）。

而数据版本的可见性规则，就是基于数据的row trx_id和这个一致性视图的对比结果而得。

该视图数组把所有row trx_id 分成：
数据版本可见性规则：

![](https://img-blog.csdnimg.cn/20210615102540744.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

对于当前事务的启动瞬间，一个数据版本的row trx_id，有如下可能：

1. 若落在绿色，表示该版本是已提交的事务或当前事务自己生成的，这个数据是可见的
2. 若落在土色，表示该版本是由将来启动的事务生成的，肯定不可见
3. 若落在黄色，包括两种情况：
   a. 若 row trx_id在数组中，表示该版本是由尚未提交的事务生成的，不可见
   b. 若 row trx_id不在数组中，表示该版本是已提交的事务生成的，可见

比如，对于【行状态变更图】的数据，若有一个事务，它的低水位是18，则当它访问这一行数据时，就会从V4通过U3计算出V3，所以在它看来，这一行值是11。

有了该声明后，系统里随后发生的更新，就跟该事务看到的内容无关了。因为之后的更新，生成的版本一定属于上面的2或者3(a)，而对它来说，这些新的数据版本是不存在的，所以这个事务的快照，就是“静态”的了。

所以InnoDB利用了“所有数据都有多版本”的特性，实现了“秒级创建快照”能力。

接下来，我们开始分析一开始的三个事务

## 事务案例分析

假设：

- 事务A开始前，系统里只有一个活跃事务ID=99
- 事务A、B、C版本号分别是100、101、102，且当前系统里只有这四个事务
- 三个事务开始前，(1,1）这一行数据的row trx_id是90

于是：

- 事务A的视图数组[99,100]
- 事务B的视图数组是[99,100,101]
- 事务C的视图数组是[99,100,101,102]

为简化分析，先把其他干扰语句去掉，只画出跟事务A查询逻辑有关的操作：

事务A查询数据逻辑图：

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/MySQL%e5%ae%9e%e6%88%9845%e8%ae%b2/assets/9416c310e406519b7460437cb0c5c149.png)



- 第一个有效更新是事务C，(1,1)=》(1,2)。这时，该数据的最新版本的row trx_id=102，版本90已成为历史版本
- 第二个有效更新是事务B，(1,2)=》(1,3)。这时，该数据的最新版本（即row trx_id）=101，版本102成为历史版本

事务A查询时，事务B还没提交，但它生成的(1,3)这版本已变成当前版本。但这版本对事务A必须不可见，否则就变成脏读。

现在事务A要来读数据了，它的视图数组是[99,100]。读数据都是从当前版本读起的。所以，事务A查询语句的读数据流程是这样的：

- 找到(1,3)的时候，判断出row trx_id=101，比高水位大，处于红色区域，不可见
- 接着，找到上一个历史版本，一看row trx_id=102，比高水位大，处于红色区域，不可见
- 再往前找，终于找到了（1,1)，它的row trx_id=90，比低水位小，处于绿色区域，可见

这样执行下来，虽然期间这一行数据被修改过，但是事务A不论在什么时候查询，看到这行数据的结果都是一致的，所以称之为一致性读。

一个数据版本，对于一个事务视图来说，除了自己的更新总是可见之外，还有如下情况：

1. 版本未提交，不可见
2. 版本已提交，但是是在视图创建后提交的，不可见
3. 版本已提交，而且是在视图创建前提交的，可见。

现在，让我们用这些规则判断查询结果，事务A的查询语句的视图数组是在事务A启动时生成的，这时：

- (1,3)还没提交，属于case1，不可见
- (1,2)虽然提交了，但却在视图数组创建之后提交，属于case2，不可见
- (1,1)是在视图数组创建之前提交的，可见

现在只需通过时间先后分析即可。

## 更新逻辑

事务B的update语句，若按一致性读，好像结果不对呢？

你看下图，事务B的视图数组是先生成的，之后事务C才提交，不是应该看不见(1,2)吗，怎么能算出(1,3)？

事务B更新逻辑图：

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/MySQL%e5%ae%9e%e6%88%9845%e8%ae%b2/assets/86ad7e8abe7bf16505b97718d8ac149f.png)

若事务B在更新前查询一次数据，该查询返回的k的值确实是1。
但当它要去更新数据时，就不能再在历史版本上更新了，否则事务C的更新就丢失了。因此，事务B此时的set k=k+1是在（1,2）的基础上进行的操作。

所以，这里用到规则：**更新数据，都是先读后写。这个读，只能读当前的值，即“当前读”（current read）。**

因此，在更新时，当前读拿到的数据是(1,2)，更新后生成了新版本数据(1,3)，这个新版本的row trx_id是101。

所以，在执行事务B查询语句时，一看自己的版本号是101，最新数据的版本号也是101，是自己的更新，可以直接使用，所以查询得到的k的值是3。

#### 当前读（current read）

除了update语句外，select语句若加锁，也是当前读。

所以，若修改事务A的查询语句

```sql
select * from t where id=1
```

加上：

- lock in share mode
- 或for update

都可读到version=101的数据，返回的k的值是3。

```sql
// 加了读锁（S锁，共享锁）
mysql> select k from t where id=1 lock in share mode;
// 写锁（X锁，排他锁）
mysql> select k from t where id=1 for update;
```

假设事务C不是马上提交的，而是变成下面的事务C’，会咋样？
事务A、B、C'的执行流程：

| 事务A                                       | 事务B                                                        | 事务C'                                                       |
| ------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| start transaction with consistent snapshot; |                                                              |                                                              |
|                                             | start transaction with consistent snapshot;                  |                                                              |
|                                             |                                                              | start transaction with consistent snapshot;<br>update t set k=k+1 where id=1; |
|                                             | update t set k=k+1 where id=1;<br>select k from t where id=1; |                                                              |
| select k from t where id=1;<br>commit;      |                                                              | commit;                                                      |
|                                             | commit;                                                      |                                                              |

事务C’不同在于更新后并没有马上提交，在它提交前，事务B的更新语句先发起了。前面说过了，虽然事务C’还没提交，但(1,2)这个版本也已经生成了，并且是当前的最新版本。

### 事务B的更新语句会咋处理？

“两阶段锁协议”。事务C’没提交，即(1,2)这个版本上的写锁还没释放。而事务B是当前读，必须要读最新版本，而且必须加锁，因此就被锁住了，必须等到事务C’释放这个锁，才能继续它的当前读。

事务B更新逻辑图（配合事务C'）：

![](https://p.ipic.vip/7zdjb8.png)

至此，一致性读、当前读和行锁就串起来了。

## 事务咋实现可重复读？

- 可重复读的核心是一致性读（consistent read）
- 而事务更新数据时，只能用当前读

若当前记录的行锁被其他事务占用，需进入锁等待。

RC和RR最主要区别：

- RR，事务开始时创建一致性视图，之后事务里的其他查询都共用该一致性视图
- RC，每个语句执行前都会重新算出一个新视图

RC下的事务A、B的查询语句查到的k，分别是啥呢？

```sql
# 从这语句开始，创建一个持续整个事务的一致性快照
start transaction with consistent snapshot; 
```

所以，RC下的这个用法就没意义，等于普通的start transaction。

#### RC时的状态图

这两个查询语句的创建视图数组的时机发生了变化，即图中的read view框。（这用的还是事务C的逻辑直接提交，而非事务C’）

RC下的事务状态图：

![](https://p.ipic.vip/9rwszj.png)

事务A的查询语句的视图数组，是在执行这语句时创建的。时序上(1,2)、(1,3)的生成时间都在创建这个视图数组的时刻之前。但在这个时刻：

- (1,3)还没提交，属于情况1，不可见
- (1,2)提交了，属于情况3，可见

所以，此时：

- 事务A查询语句返回的是k=2
- 事务B查询结果k=3

## 总结

InnoDB的行数据有多个版本，每个数据版本有自己的row trx_id，每个事务或者语句有自己的一致性视图。普通查询语句是一致性读，一致性读会根据`row trx_id`和`一致性视图`确定数据版本的可见性。

- RR：查询只承认在事务启动前，就已提交完成的数据
- RC：查询只承认在语句启动前，就已提交完成的数据
- 当前读：总读取已提交完成的最新版本

Q：为啥表结构不支持“可重复读”？

A：表结构没有对应的行数据，也没row trx_id，因此只能遵循当前读的逻辑。MySQL 8.0已可将表结构放在InnoDB字典里了，也许以后会支持表结构的可重复读。