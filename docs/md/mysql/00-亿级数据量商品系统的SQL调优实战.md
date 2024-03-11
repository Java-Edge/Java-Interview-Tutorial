# 00-亿级数据量商品系统的SQL调优实战

## 为何MySQL没有使用我建立的索引？

MySQL选了个不恰当索引而导致的慢查询。

某晚收到了线上数据库的频繁报警，数据库突然大量慢查询，导致每个数据库连接执行一个慢查询都要耗费很久。这还导致突然过来的很多查询需要让MySQL开辟更多连接，因此报警也告诉我们，数据库的连接剧增，而且每个连接都打满，每个连接都要执行一个慢查询。

接着DB的连接全部打满，无法开辟新连接，但还持续的有新的查询请求，导致DB无法处理新查询，很多查询发到DB直接就阻塞然后超时，导致商品系统频繁报警，出现大量DB查询超时报错的异常。

这意味着商品数据库及商品系统濒临崩溃，大量慢查询耗尽DB连接资源，而且一直阻塞在数据库里执行，数据库没法执行新的查询，商品数据库无法执行查询，用户没法使用商品系统，也就没法查询和筛选电商网站里的商品了。

报警时机又正是晚高峰，虽说商品数据有多级缓存架构，但下单过程还是会大量请求商品系统，所以晚高峰时，商品系统本身TPS大致几千。因此发现数据库的监控里显示每min的慢查询超过10w+：商品系统大量的查询都变成了慢查询。

慢查询主要就是如下语句：

```sql
# 用户在电商网站上根据商品品类及子类筛选
# 按id倒序排序，最后分页
select * 
from products 
where category='xx' 
	and sub_category='xx' 
order by id 
desc 
limit xx,xx
```

该语句执行的商品表里大致1亿左右数据量，该量级已稳定很长时间，主要也就是这么多商品，但上面语句居然一执行就是几十s！基本上数据库的连接全部被慢查询打满，一个连接要执行几十s的SQL，然后才能执行下一个SQL，此时数据库基本就废了，没法执行什么查询。所以商品系统本身也报警查询数据库的超时异常。

## 为什么会出现这样

经常用到的查询字段肯定都建了索引，即index_category(catetory,sub_category)肯定存在。因为如果你一旦用上了品类索引，按品类和子类去在索引里筛选：

- 筛选很快速

- 筛出来的数据不多

理论上执行速度很快，即使表有亿级数据，但也不应超过1s。但跑了几十秒，说明肯定没用那个索引，看执行计划：

```sql
explain select * from products where category='xx' and sub_category='xx' order by id desc limit xx,xx 
```

possible_keys=index_category的，key=PRIMARY，Extra=Using where

就是在扫描主键索引，还用where条件里的两个字段做筛选，所以这么扫描就会耗费几十s。

## 解决方案

为快速解决问题，使用force index语法，强制改变MySQL自动选择不恰当聚簇索引进行扫描的行为：

```sql
select * from products force index(index_category) where category='xx' and sub_category='xx' order by id desc limit xx,xx
```

再次执行SQL，仅耗费100多ms。

所以若MySQL使用了错误的执行计划，那就force index语法改变它。

但案例还有问题：

- 为何MySQL会选择扫描主键索引？
- 为何不用index_category二级索引扫描？
- 即使用了聚簇索引，为何该SQL之前没有问题，现在突然就有问题了？

该表是个亿级数据量大表，那index_category二级索引也比较大，所以此时MySQL觉得如果从index_category二级索引查找符合where条件的一波数据，接着还得回表。因为要select *，所以必然涉及回表，但在回表前，必然要做完order by id desc limit xx,xx操作。

举个例子，根据where category='xx' and sub_category='xx'，从index_category二级索引里查找出一波数据，假设几万条，

因为二级索引包含主键id，就得按order by id desc，对这几万条数据基于临时磁盘文件进行ﬁlesort磁盘排序，排序后，再按limit xx,xx语法将指定位置的几条数据拿出来，假设limit 0,10，那么就是把10条数据拿出来。拿出来10条数据之后，再回到聚簇索引根据id查，把这10条数据的完整字段都查出来，这就是MySQL认为如果你使用index_category的话，可能会发生的一个情况。

所以他担心，你根据

```sql
where category='xx' and sub_category='xx'
```

从index_category二级索引里查出来的数据太多了，还得在临时磁盘里排序，可能性能很差，因此MySQL就把这种方式判定不太好。

因此他选择直接扫描主键的聚簇索引，因为聚簇索引按id值有序，所以扫描时，直接按order by id desc倒序得顺序扫描即可，然后因为他知道你是

```sql
limit 0,10
```

也就知道你仅仅只要拿到10条数据就行了。所以他在按序扫描聚簇索引时，就会对每条数据都采用Using where，跟

```sql
where category='xx' and sub_category='xx'
```

条件进行比对，符合条件的就直接放入结果集里去，最多就是放10条数据进去就可以返回了。

此时MySQL认为，按顺序扫描聚簇索引，拿到10条符合where条件的数据，应该很快，很可能比使用index_category二级索引更快，因此此时他就采用了扫描聚簇索引的这种方式。

这SQL之前在线上系统运行一直没问题，即之前在线上系统而言，即使采用扫描聚簇索引，该SQL也确实运行不慢，最起码是不会超过1s。

为何突然大量报慢查询，耗时几十s？因为之前

```sql
where category='xx' and sub_category='xx'
```

条件通常有返回值，即根据条件里的取值，扫描聚簇索引，通常都是很快就能找到符合条件的值并返回，所以之前其实性能也没啥问题。

但后来可能是商品系统里的运营人员，在商品管理的时候加了几种商品分类和子类，但是这几种分类和子类的组合其实没有对应的商品，导致很多用户使用这种分类和子类去筛选商品

```sql
where category='新分类' andsub_category='新子类'
```

条件实际上是查不到任何数据的！所以扫描聚簇索引时，怎么都扫不到符合条件的结果，一下就把聚簇索引全部扫了一遍，等于上亿数据全表扫描一遍，都没找到符合where category='新分类' and sub_category='新子类'这个条件的数据。

正因如此，才导致这个SQL语句频繁的出现几十秒的慢查询，进而导致MySQL连接资源打满，商品系统崩溃！

## 总结

SQL调优并不太难，核心是看懂SQL执行计划，理解慢的原因，然后想法解决，本案例就得通过force index语法来强制某个SQL用我们指定的索引。
