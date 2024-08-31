# 为什么阿里不推荐使用MySQL分区表？

## 1 啥是分区表？

```sql
CREATE TABLE `tt` (
  `ftime` datetime NOT NULL,  -- datetime 类型，且不能为 NULL
  `c` int(11) DEFAULT NULL,
  KEY (`ftime`)
) ENGINE=InnoDB
DEFAULT CHARSET=latin1

-- 使用 RANGE 分区方式，根据 `ftime` 字段 YEAR 值分区
PARTITION BY RANGE (YEAR(`ftime`)) (
  PARTITION p_2017 VALUES LESS THAN (2017) ENGINE = InnoDB,  -- 分区 p_2017，存放 YEAR(`ftime`) 小于 2017 的数据
  PARTITION p_2018 VALUES LESS THAN (2018) ENGINE = InnoDB,  -- 分区 p_2018，存放 YEAR(`ftime`) 小于 2018 的数据
  PARTITION p_2019 VALUES LESS THAN (2019) ENGINE = InnoDB,  -- 分区 p_2019，存放 YEAR(`ftime`) 小于 2019 的数据
  PARTITION p_others VALUES LESS THAN MAXVALUE ENGINE = InnoDB  -- 分区 p_others，存放 YEAR(`ftime`) 大于等于 2019 的数据
);

-- 插数据
INSERT INTO `tt`
VALUES ('2017-4-1', 1),
       ('2018-4-1', 1);
```

按分区规则，记录分别落在**p_2018**和**p_2019**分区。可见，该表包含：

- 一个`.frm`文件
- 4个`.ibd`文件：每个分区对应一个`.ibd`文件：
  - 对于引擎层，这是4个表
  - 对于Server层，这是1个表

## 2 分区表的引擎层行为

在分区表加间隙锁，说明对InnoDB，这是4个表：

### 分区表间隙锁

|      | S1                                                           | S2                                                           |
| :--- | :----------------------------------------------------------- | ------------------------------------------------------------ |
| T1   | begin; <br>select * from tt<br> where ftime='2017-5-1' <br>for update; |                                                              |
| T2   |                                                              | insert into tt values ('2018-2-1', 1); (Query OK) <br> insert into tt values  ('2017-12-1', 1); (block) |

初始化表tt时，只插入两行数据。session1的select语句对索引ftime上这两个记录之间的间隙加了锁。若是一个普通表，T1时刻，在表tt的ftime索引，间隙和加锁状态应该如下，普通表的加锁范围：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/de31861aa3f9b8c5db544614cf9a5316.png)

即‘2017-4-1’ 、’2018-4-1’ 两条记录之间的间隙会被锁住。那S2的两条插入语句应该都要进入锁等待状态。

但S2的第一个insert成功。因为对于引擎，p_2018和p_2019是两个不同表，即2017-4-1的下一个记录并非2018-4-1，而是p_2018分区的supremum。

所以T1在表tt的ftime索引上，间隙和加锁的状态其实是，分区表tt的加锁范围：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/ce1a364de175c92c3b6175b3c12b00ae.png)

由于分区表规则，S1的select只操作分区p_2018，因此加锁范围就是上图深色。所以，S2写2018-2-1成功，而要写2017-12-1，要等S1的间隙锁。

这时show engine innodb status部分结果：

session2被锁住信息：

![](https://img-blog.csdnimg.cn/2021060321513617.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 3 MyISAM分区表

```sql
# 把表tt改成MyISAM表
alter table t engine=myisam
```

对MyISAM，这是4个表。

### MyISAM表锁验证

| S1                                                           | S2                                                           |
| :----------------------------------------------------------- | ------------------------------------------------------------ |
| alter table t engine=myisam; <br>  update tt set c=sleep(100) <br> where ftime='2017-4-1'; |                                                              |
|                                                              | select * from  tt where ftime='2018-4-1'; <br>(Query OK) <br>select * from  tt where ftime='2017-5-1';<br>(block) |

S1，sleep(100)将该语句执行时间设为100s。由于MyISAM引擎只支持表锁，所以这条update锁住整个表tt的读。

但S2的第一条查询语句可正常执行，第二条语句才进入锁等待。因为MyISAM的表锁实现在引擎层，S1加的表锁，其实锁在分区**p_2018**。因此，只会堵住在这个分区上执行的查询，其他分区查询不受影响。

分区表用着看来挺好使呀，为啥禁用？使用分区表的一个重要原因就是单表过大。若不使用分区表，就要手动分表。

## 4 手动分表 V.S 分区表

如按年划分，分别创建普通表：

- t_2017
- t_2018
- t_2019

手动分表也要找到需更新的所有分表，然后依次执行更新。性能和分区表无异。

- 分区表由server层决定使用哪个分区

- 手动分表由应用层代码决定使用哪个分表

引擎层看，也无差。

两种方式区别主要在server层。server层的分区表一个严重问题就是打开表的行为。

## 5 分区策略

第一次访问一个分区表时，MySQL要把所有分区都访问一遍。

### 典型报错场景

若一个分区表的分区很多，如超过1000，而MySQL启动时，**open_files_limit**参数默认1024，则访问该表时，由于要打开所有文件，导致打开表文件的个数超过上限而报错。

如对一个包含很多分区的表，执行insert直接报错：

![](https://img-blog.csdnimg.cn/20210603224117872.png)

这条insert只需要访问一个分区，但语句报错。这个表是MyISAM，如用InnoDB，不会出现该问题。

MyISAM分区表使用通用分区策略（generic partitioning），每次访问分区都由server层控制。通用分区策略是MySQL一开始支持分区表时就存在的代码，文件管理、表管理的实现粗糙，性能问题严重。

MySQL 5.7.9开始，InnoDB引入本地分区策略（native partitioning），在InnoDB内部自己管理打开分区的行为；

MySQL 5.7.17开始，将MyISAM分区表标记为deprecated；

MySQL 8.0开始，已禁止创建MyISAM分区表，只允许创建已实现了本地分区策略的引擎。

![](https://img-blog.csdnimg.cn/20210603224805894.png)

目前仅InnoDB和NDB引擎支持本地分区策略。

## 6 分区表的server层行为

对于server层，一个分区表就只是一个表。

如图，分别是该例的操作序列和执行结果图。

### 6.1 分区表的MDL锁

| s1                                                           | s2                                                  |
| :----------------------------------------------------------- | --------------------------------------------------- |
| begin; <br> select * from tt <br> where ftime='2018-4-1';    |                                                     |
|                                                              | alter table tt truncate partition p_2017 <br>(阻塞) |
| ![](https://img-blog.csdnimg.cn/20210603225710983.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70) |                                                     |
| ![](https://img-blog.csdnimg.cn/20210603225731845.png)       |                                                     |

show processlist：

![](https://img-blog.csdnimg.cn/20210603230224399.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

虽然s2只需操作**p_2107**分区，但因s1持有整个表tt的MDL锁，导致s2的alter语句被阻塞。

所以分区表做DDL时，影响更大。若用普通分表，则你在truncate一个分表时，肯定不会和另外一个分表上的查询语句，出现MDL锁冲突。

- server层，认为是同一张表，因此所有分区共用同一MDL锁
- 引擎层，认为是不同表，因此MDL锁之后的执行过程，会根据分区表规则，只访问必要分区

### 6.2 啥是必要分区**？**

根据where条件，结合分区规则，如：

```sql
where ftime='2018-4-1'
```

根据分区规则year函数算出2018，就落在**p_2019**分区。

但若where条件改成 `where ftime>='2018-4-1'`，虽查询结果相同，但根据where条件，就要访问**p_2019**、**p_others**俩分区。

若查询语句的where条件没有分区key，就只能访问所有分区。当然，这并非分区表的问题。即使用业务分表，where条件没有使用分表的key，也必须访问所有分表。

## 7 分区表的应用场景

对业务透明，相对用户分表，使用分区表的业务代码更简洁。

分区表可方便清理历史数据。

若某业务跑的时间够长，往往有根据时间删除历史数据的需求。这时按时间分区的分区表，就可直接通过alter table t drop partition …删分区，从而删掉历史数据。

alter table t drop partition …是直接删除分区文件：

- 跟drop普通表类似
- 与delete相比，其速度快、对系统影响小

## 8 总结

本文以范围分区（range）为例，MySQL还支持hash分区、list分区等分区方法。实际使用，分区表跟用户分表，有两个问题：

- 第一次访问时，需要访问所有分区
- 共用MDL锁

因此，若用分区表，别创建太多分区。见过某用户直接按天分区，然后预先创建10年的分区。访问分区表的性能就不好。

- 分区不是越细越好：单表或单分区的数据一千万行，只要没有特别大的索引，对于现在的硬件能力来说都已是小表
- 分区不要提前预留太多，在使用之前预创建即可：如若按月分区，每年年底时再把下一年度的12个新分区创建上即可。对于没有数据的历史分区，及时drop

分区表的其他问题，如查询跨多分区取数据，查询性能较慢，基本就不是分区表本身问题，而是数据量或说使用方式问题。