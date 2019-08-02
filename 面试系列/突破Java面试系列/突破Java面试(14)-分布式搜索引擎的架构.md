> 以下用ES表Elastic Search
# 1 面试题
说说ES的分布式架构原理

# 2 考点分析
在搜索这块，曾经lucene 是最流行的搜索库.
几年前业内一般都问，你了解 lucene 吗？你知道倒排索引的原理吗？
但现在不问了,因为现在项目基本都是采用基于 lucene 的分布式搜索引擎—— ElasticSearch.

现在分布式搜索基本已经成为互联网系统的标配，其中尤为流行的就是 ES，前几年一般用 solr。但是最近基本大部分企业和项目都开始转向 ES.

所以互联网面试，肯定会跟你聊聊分布式搜索引擎，就一定会聊到ES!

如果面试官问你第一个问题，确实一般都会问你 es 的分布式架构设计能介绍一下么？就看看你对分布式搜索引擎架构的一个基本理解。

# 3 详解
ES的设计理念就是分布式搜索引擎，底层其实还是基于 lucene 的.
`核心思想`就是在多台机器上启动多ES进程实例，组成ES集群.

## 3.1 基本单位
ES 中存储数据的`基本单位`是**索引**.
比如说你现在要在 ES 中存储一些订单数据，应该在 ES 中创建一个索引 `order_idx`,所有的订单数据就会写到该索引中.
一个索引概念上差不多就相当于MySQL 中的一张表.

```
index -> type -> mapping -> document -> field。
```

## 3.2 实例
为便于理解,我在这里做个类比.切记,仅仅是类比!绝不等同!

index 相当于 MySQL 里的一张表;
而 type 没法跟 MySQL 里去类比;
一个 index 里可以有多个 type，每个 type 的字段都是差不多的，也有略微差别.

假设有一个订单 index，专门存放订单数据.
就好比说你在 MySQL 中建表
- 有些订单是实物商品的订单，比如一件衣服、一双鞋子
- 有些订单是虚拟商品的订单，比如游戏点卡，话费充值

这两种订单大部分字段是一样的，但是少部分字段还是有略微差别.

类似地,ES就会在订单 index,建两个 type
- 一个是实物商品订单 type
- 一个是虚拟商品订单 type

这两个 type 大部分字段是一样的，少部分字段是不一样的。

很多情况下，一个 index 里可能就一个 type，但是确实如果说是一个 index 里有多个 type 的情况

> `mapping types` 这个概念在 ElasticSearch 7.X 已被完全移除，详细说明参考[官方文档](https://github.com/elastic/elasticsearch/blob/6.5/docs/reference/mapping/removal_of_types.asciidoc)

你可以认为 index 是一个类别的表，具体的每个 type 代表了 MySQL 中的一个表.
每个 type 有一个 mapping,如果假设一个 type 是具体的一个表,index 就代表多个 type 同属于的一个类型,而 mapping 就是这个 type 的**表结构定义**.
你在 MySQL 中创建一个表，肯定是要定义表结构的，里面有哪些字段，每个字段是什么类型.
实际上你往 index 里的一个 type 里面写的一条数据，叫做一条 document;
一条 document 就类似 MySQL 中某个表里的一行;
每个 document 有多个 field;
每个 field 就代表该 document 中的一个字段的值.

## 3.3 结构原理

![](https://uploadfiles.nowcoder.com/files/20190626/5088755_1561482860411_es-index-type-mapping-document-field.png)

你建立一个索引,该索引又可拆分成多个 `shard`,每个 shard 存储部分数据.
拆分成多个 shard 是有好处的
- **支持横向扩展**
比如你数据量 3T，3 个 shard,每个 shard 就 1T 的数据,若现在数据量增到 4T,怎么扩展?
so easy!新建一个有 4 个 shard 的索引，将数据导入
- **提高性能**
数据分布在多个 shard,即多台服务器上,所有的操作,都会在多台机器上并行分布式执行,提高了系统的吞吐量和性能.

接着就是这个 shard 的数据实际是有多个备份,即每个 `shard` 都有一个 `primary shard`负责写入数据,还有几个 `replica shard`.
`primary shard` 写入数据后,会将数据同步到其他几个 `replica shard` 中.

![](https://uploadfiles.nowcoder.com/files/20190626/5088755_1561482858175_20190626004810113.png)
通过 replica 方案,每个 shard 数据都有多个备份.
即使某个节点宕机,其他节点上还有数据,满足高可用性.

## 3.4 主从特性
ES 集群的多个节点,会自动选举一个节点为 master 节点;
master 节点负责一些管理工作,比如维护索引元数据、切换` primary shard` 和` replica shard` 身份等;
若 master 节点宕机,则会重新选举一个节点为 master.

若非 master 节点宕机了,则 master 节点会使宕机节点上的` primary shard `的身份转移到其他可用节点上的 `replica shard`.
接着你要是修复了那个宕机节点,重启后,master 节点会控制将缺失的` replica shard` 分配回去,并且同步后续修改的数据之类的,让集群恢复正常.

更简单点,若某非 master 节点宕机了,那么该节点上的 `primary shard `不也就没了嘛.
那好,master 会让` primary shard` 对应的 `replica shard`（在其他节点上）切换为` primary shard`.待宕机的节点修复了,修复后的节点也不再是 `primary shard`了,而是 `replica shard`.

以上就是 ElasticSearch 作为分布式搜索引擎最基本的架构设计.


# 参考
《Java工程师面试突击第1季-中华石杉老师》

> 更多干货资源请关注JavaEdge公众号

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](http://www.shishusheng.com)
## [Github](https://github.com/Wasabi1234)