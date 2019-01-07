# 1 Sharding
把数据库横向扩展到多个物理节点的一种有效方式，主要是为了突破数据库单机服务器的 I/O 瓶颈，解决数据库扩展问题。

Sharding可简单定义为将大数据库分布到多个物理节点上的一个分区方案。每一个分区包含数据库的某一部分，称为一个shard，分区方式可以是任意的，并不局限于传统的水平分区和垂直分区。
一个shard可以包含多个表的内容甚至可以包含多个数据库实例中的内容。每个shard被放置在一个数据库服务器上。一个数据库服务器可以处理一个或多个shard的数据。系统中需要有服务器进行查询路由转发，负责将查询转发到包含该查询所访问数据的shard或shards节点上去执行。

# 2 垂直切分/水平切分
## 2.1 MySQL的扩展方案
- Scale Out 水平扩展
一般对数据中心应用，添加更多机器时，应用仍可很好利用这些资源提升自己的效率从而达到很好的扩展性
- Scale Up 垂直扩展
一般对单台机器，Scale Up指当某个计算节点添加更多的CPU Cores，存储设备，使用更大的内存时，应用可以很充分的利用这些资源来提升自己的效率从而达到很好的扩展性

## 2.2 MySQL的Sharding策略
1. 垂直切分：按功能模块拆分，以解决`表与表之间`的I/O竞争
e.g. 将原来的老订单库，切分为基础订单库和订单流程库。数据库之间的`表结构不同`
![](https://img-blog.csdnimg.cn/20200829110221177.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

2. 水平切分：将`同个表`的数据分块，保存至不同的数据库
以解决单表中数据量增长压力。这些数据库中的`表结构完全相同`

## 2.3 表结构设计案例
### 垂直切分
1. 大字段
单独将大字段建在另外的表中，提高基础表的访问性能，原则上在性能关键的应用中应当避免数据库的大字段
2. 按用途
例如企业物料属性，可以按照基本属性、销售属性、采购属性、生产制造属性、财务会计属性等用途垂直切分
3. 按访问频率
例如电子商务、Web 2.0系统中，如果用户属性设置非常多，可以将基本、使用频繁的属性和不常用的属性垂直切分开

### 水平切分
1. 比如在线电子商务网站，订单表数据量过大，按照年度、月度水平切分
2. 网站注册用户、在线活跃用户过多，按照用户ID范围等方式，将相关用户以及该用户紧密关联的表做水平切分
3. 论坛的置顶帖，因为涉及到分页问题，每页都需显示置顶贴，这种情况可以把置顶贴水平切分开来，避免取置顶帖子时从所有帖子的表中读取

# 3 分表和分区
分表：把一张表分成多个小表；
分区：把一张表的数据分成N多个区块，这些区块可以在同一个磁盘上，也可以在不同的磁盘上。

## 3.1 分表和分区的区别
- 实现方式 
MySQL的一张表分成多表后，每个小表都是完整的一张表，都对应三个文件（MyISAM引擎：.MYD数据文件，.MYI索引文件，.frm表结构文件）
- 数据处理
	- 分表后数据都存放在分表里，总表只是个外壳，存取数据发生在一个个的分表里
	- 分区则不存在分表的概念，分区只不过把存放数据的文件分成许多小块，分区后的表还是一张表，数据处理还是自己完成。
- 性能
	- 分表后，单表的并发能力提高了，磁盘I/O性能也提高了。分表的关键是存取数据时，如何提高 MySQL并发能力
	- 分区突破了磁盘I/O瓶颈，想提高磁盘的读写能力，来增加MySQL性能 
- 实现成本
	- 分表的方法有很多，用merge来分表，是最简单的一种。这种方式和分区难易度差不多，并且对程序代码透明，如果用其他分表方式就比分区麻烦
	- 分区实现比较简单，建立分区表，跟建平常的表没区别，并且对代码端透明 


## 3.2 分区适用场景
1. 一张表的查询速度慢到影响使用
2. 表中的数据是分段的
3. 对数据的操作往往只涉及一部分数据，而不是所有的数据
![](https://img-blog.csdnimg.cn/20200829015141290.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

## 3.3 分表适用场景
1. 一张表的查询速度慢到影响使用
2. 频繁插入或连接查询时，速度变慢
3. 分表的实现需要业务结合实现和迁移，较为复杂

# 4 分库
分表能解决`单表数据量过大带来的查询效率下降`问题，但无法给数据库的并发处理能力带来质的提升。面对高并发的读写访问，当数据库主服务器无法承载写压力，不管如何扩展从服务器，都没有意义了。
换个思路，对数据库进行拆分，`提高数据库写性能`，即分库。

## 4.1 分库的解决方案
一个MySQL实例中的多个数据库拆到不同MySQL实例中：
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTFhNzBiNTMzNDY1MDU3NTQucG5n?x-oss-process=image/format,png)
- 缺陷
有的节点还是无法承受写压力。

### 4.1.1 查询切分
- 将key和库的映射关系单独记录在一个数据库。
![](https://img-blog.csdnimg.cn/20200829114917514.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
- 优点
key和库的映射算法可以随便自定义
- 缺点
引入了额外的单点

### 4.1.2 范围切分
- 按照时间区间或ID区间切分。
![](https://img-blog.csdnimg.cn/20200829115657202.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
- 优点
单表容量可控，水平扩展很方便。
- 缺点
无法解决集中写入的瓶颈问题。

### 4.1.3 Hash切分（重点）
- 一般都是采用hash切分。
![](https://img-blog.csdnimg.cn/20200829112801122.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

数据水平切分后我们希望是一劳永逸或者是易于水平扩展的，所以推荐采用mod 2^n这种一致性Hash。

比如一个订单库，分库分表方案是32*32，即通过UserId后四位mod 32分到32个库中，同时再将UserId后四位Div 32 Mod 32将每个库分为32个表，共计分为1024张表。
> 线上部署情况为8个集群(主从)，每个集群4个库。
![](https://img-blog.csdnimg.cn/20200829112716345.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

为什么说这易于水平扩展？分析如下场景：
#### 数据库性能达到瓶颈
1. 现有规则不变，可直接扩展到32个数据库集群。
![](https://img-blog.csdnimg.cn/20200829120226464.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
2. 如果32个集群也无法满足需求，那么将分库分表规则调整为(32*2^n)*(32⁄2^n)，可以达到最多1024个集群。
![](https://img-blog.csdnimg.cn/20200829120300693.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
#### 单表容量达到瓶颈
或1024都无法满足。
![](https://img-blog.csdnimg.cn/20200829120344287.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
假如单表都突破200G，200*1024=200T
没关系，32 * (32 * 2^n)，这时分库规则不变，单库里的表再裂变，当然，在目前订单这种规则下（用userId后四位 mod）还是有极限的，因为只有四位，所以最多拆8192个表。

## 选择分片键
- 尽量避免跨分区查询的发生(无法完全避免)
- 尽量使各个分片中的数据平均
## 如何存储无需分片的表
- 每个分片中存储一份相同的数据
对于数据量不大且并不经常被更新的字典类表，经常需要和分区表一起关联查询，每个分片中存储一份冗余的数据可以更好提高查询效率，维护其一致性就很重要了。
- 使用额外的节点统一存储
没有冗余问题,但是查询效率较差,需要汇总
## 在节点上部署分片
- 每个分片使用单一数据库,并且数据库名也相同
结构也保持相同,和单一节点时的一致
- 将多个分片表存储在一个数据库中,并在表名上加入分片号后缀
- 在一个节点中部署多个数据库,每个数据库包含一个切片

# 5 分库分表后的难题
##  全局唯一ID生成方案
方案很多，主流的如下：
### 数据库自增ID
使用
- `auto_increment_increment `
- `auto_increment_offset`

系统变量让MySQL以期望的值和偏移量来增加`auto_increment`列的值。
- 优点
最简单，不依赖于某节点，较普遍采用但需要非常仔细的配置服务器哦！
- 缺点
单点风险、单机性能瓶颈。不适用于一个节点包含多个分区表的场景。

### 数据库集群并设置相应步长（Flickr方案）
在一个全局数据库节点中创建一个包含`auto_increment`列的表，应用通过该表生成唯一数字。
- 优点
高可用、ID较简洁。
- 缺点
需要单独的数据库集群。

### Redis等缓存NoSQL服务
避免了MySQL性能低的问题。

###  Snowflake（雪花算法）
- 优点
高性能高可用、易拓展。 
- 缺点
需要独立的集群以及ZK。
### 各种GUID、Random算法
- 优点
简单。
- 缺点
生成ID较长，且有重复几率。
### 业务字段（美团的实践方案）
为减少运营成本并减少额外风险，美团排除了所有需要独立集群的方案，采用了带有业务属性的方案： `时间戳+用户标识码+随机数`

#### 优点：
- 方便、成本低
- 基本无重复的可能
- 自带分库规则，这里的用户标识码即为`userID的后四位`，在查询场景，只需订单号即可匹配到相应库表而无需用户ID，只取四位是希望订单号尽可能短，评估后四位已足。
- 可排序，因为时间戳在最前

#### 缺点
- 长度稍长，性能要比int/bigint的稍差。


## 事务
分库分表后，由于数据存到了不同库，数据库事务管理出现困难。如果依赖数据库本身的分布式事务管理功能去执行事务，将付出高昂的性能代价；如果由应用程序去协助控制，形成程序逻辑上的事务，又会造成编程方面的负担。
- 解决方案
比如美团，是将整个订单领域聚合体切分，维度一致，所以对聚合体的事务是支持的。

## 跨库跨表的join问题
分库分表之后，难免会将原本逻辑关联性很强的数据划分到不同的表、不同的库上，这时，表的关联操作将受到限制，我们无法join位于不同分库的表，也无法join分表粒度不同的表，结果原本一次询能够完成的业务，可能需要多次查询才能完成。
- 解决方案
垂直切分后，就跟join说拜拜了；水平切分后，查询的条件一定要在切分的维度内。
比如查询具体某个用户下的订单等；
禁止不带切分的维度的查询，即使中间件可以支持这种查询，可以在内存中组装，但是这种需求往往不应该在在线库查询，或者可以通过其他方法转换到切分的维度来实现。

## 额外的数据管理和运算压力
额外的数据管理负担，最显而易见的就是数据的定位问题和数据的增删改查的重复执行问题，这些都可以通过应用程序解决，但必然引起额外的逻辑运算。
例如，对于一个记录用户成绩的用户数据表userTable，业务要求查出成绩最好的100位，在进行分表前，只需一个order by即可。但分表后，将需要n个order by语句，分别查出每一个分表前100名用户数据，然后再对这些数据进行合并计算，才能得出结果。

# 总结
并非所有表都需要水平拆分，要看增长的类型和速度，水平拆分是大招，拆分后会增加开发的复杂度，不到万不得已不使用。
拆分维度的选择很重要，要尽可能在解决拆分前问题的基础上，便于开发。

参考
- https://tech.meituan.com/2016/11/18/dianping-order-db-sharding.html

![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)