
除了B-Tree 索引，MySQL还提供了如下索引：
- Hash索引
只有Memory引擎支持，场景简单
- R-Tree索引
MyISAM的一个特殊索引类型，主要用于地理空间数据类型
- Full-text
MyISAM的一个特殊索引，主要用于全文索引，从MySQL 5.6开始InnoDB支持全文索引

| 索引 / 存储引擎 | MyISAM | InnoDB | Memory |
| --- | --- | --- | --- |
| B-Tree索引 | 支持 | 支持 | 支持 |
| HASH索引 | `不支持` | `不支持` | 支持 |
| R-Tree索引 | 支持 | 支持 | `不支持` |
| Full-text索引 | 支持 | 支持 | `不支持` |

最常用的索引也就是B-tree索引和Hash索引，且只有`Memory`，` NDB`两种引擎支持Hash索引。
Hash索引适于key-value查询，通过Hash索引比B-tree索引查询更加迅速。但Hash索引不支持范围查找例如<><==,>==等。
**Memory只有在"="的条件下才会使用hash索引**

MySQL在 8.0才支持函数索引，在此之前是能对列的前面某一部分进行索引，例如标题title字段，可以只取title的前10个字符索引，这样的特性大大缩小了索引文件的大小，但前缀索引也有缺点，在order by和group by操作时失效。

```sql
create index idx_title on film(title(10));
```
# 1 特点
值存在数组，用一个hash函数把key转换成一个确定的内存位置，然后把value放在数组的该位置。使用 hash 自然会有哈希冲突可能，MySQL 采取拉链法解决。

Hash索引基于Hash表实现，只有查询条件精确匹配Hash索引中的列时，才能够使用到hash索引。对于Hash索引中的所有列，存储引擎会为每行计算一个hashcode，Hash索引中存储的就是hashcode。

- 例如一个维护了身份证号和姓名的表，根据身份证号查找对应名字，其hash索引如下：
![](https://img-blog.csdnimg.cn/2020083018125272.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

比如我们想查`ID_card_n4`对应username：
1. 将`ID_card_n4`通过hash函数算出A
2. 按顺序遍历，找到User4

四个`ID_card_n`值并不一定递增，这样即使增加新的User，速度也快，只需在后追加。
当然缺点也很明显，不是有序，所以hash索引做区间查询速度很慢。比如要找身份证号在[ID_card_X, ID_card_Y]区间的所有用户，就须全表扫描。


# 2 Hash索引的缺陷
- 必须二次查找
- 不支持部分索引查找、范围查找
- 哈希码可能存在哈希冲突，如果hash 算法设计不好，碰撞过多，性能也会变差
- 索引存放的是hash值,所以仅支持 < = > 以及 IN
- 无法通过操作索引来排序，因为存放的时候会经过hash计算，但是计算的hash值和存放的不一定相等，所以无法排序
- 不能避免全表扫描，只是由于在memory表里支持非唯一值hash索引，即不同的索引键，可能存在相同hash值
- 因为哈希表是一种根据关键字直接访问内存存储位置的数据结构 ，所以利用其原理的hash 索引，也就需要将所有数据文件添加到内存，这就很耗内存
- 如果所有的查询都是等值查询，那么hash确实快，但实际上范围查找数据更多
- 只能处理键值的全值匹配查询
- Hash函数决定着索引键的大小

> 要使InnoDB或MyISAM支持哈希索引，可以通过伪哈希索引来实现，叫自适应哈希索引。
可通过增加一个字段，存储hash值，将hash值建立索引，在插入和更新的时候，建立触发器，自动添加计算后的hash到表里。

哈希表这种结构适用于只有等值查询的场景，比如Memcached。

# 3 案例应用
假如有一个非常非常大的表，比如用户登录时需要通过email检索出用户，如果直接在email列建索引，除了索引区间匹配，还要进行字符串匹配比对，email短还好，如果长的话这个查询代价就比较大。
若此时，在email建立哈希索引，查询以int查询，性能就比字符串比对查询快多了。

### Hash 算法
建立哈希索引，首先就要选定哈希算法，《高性能MySQL》说到的CRC32算法。

### INSERT UPDATE SELECT 操作
在表中添加hash值的字段：

```sql
ALTER TABLE `User` ADD COLUMN email_hash int unsigned NOT NULL DEFAULT 0;
```

接下来就是在UPDATE和INSERT时，自动更新 `email_hash` 字段，通过触发器实现：

```sql
DELIMITER |
CREATE TRIGGER user_hash_insert BEFORE INSERT ON `User` FOR EACH ROW BEGIN
SET NEW.email_hash=crc32(NEW.email);
END;
|
CREATE TRIGGER user_hash_update BEFORE UPDATE ON `User` FOR EACH ROW BEGIN
SET NEW.email_hash=crc32(NEW.email);
END;
|
DELIMITER ;
```

这样SELECT请求就会变成：

```c
SELECT `email`, `email_hash` FROM `User` WHERE 
	email_hash = CRC32(“xxoo@gmail.com”) 
			AND `email`= “xxoo@gmail.com”;
```

```bash
+----------------------------+------------+
| email                      | email_hash |
+----------------------------+------------+
| xxoo@gmail.com             | 2765311122 |
+----------------------------+------------+

```

`AND email = "xxoo@gmail.com"` 是为了防止哈希碰撞时数据不准确。
