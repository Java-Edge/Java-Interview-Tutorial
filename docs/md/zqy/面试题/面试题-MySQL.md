# MySQL 面试题



## 为什么 mysql 删了行记录，反而磁盘空间没有减少？

答：

在 mysql 中，当使用 delete 删除数据时，mysql 会将删除的数据标记为已删除，但是并不去磁盘上真正进行删除，而是在需要使用这片存储空间时，再将其从磁盘上清理掉，这是 MySQL 使用`延迟清理`的方式。 



**延迟清理的优点：**

- 如果 mysql 立即删除数据，会导致磁盘上产生大量的碎片，使用`延迟清理`可以减少磁盘碎片，提高磁盘的读写效率
- 如果删除数据时立即清理磁盘上的数据，会消耗大量的性能。（如果一个大表存在索引，只删除其中一行，整个索引结构就会发生变化）

**延迟清理的缺点：**

- 这些被标记为删除的数据，就是数据空洞，不仅浪费空间，还影响查询效率。

  mysql 是以数据页为单位来存储和读取数据，如果一个表有大量的数据空洞，那么 mysql 读取一个数据页，可能被标记删除的数据就占据了大量的空间，导致需要读取很多个数据页，影响查询效率

**如何回收未使用空间：**

`optimize table 表名`



## 索引的结构？

答：

索引是存储在引擎层而不是服务层，所以不同存储引擎的索引的工作方式也不同，我们只需要重点关注 InnoDB 存储引擎和 InnoDB 存储引擎中的索引实现，以下如果没有特殊说明，则都为 InnoDB 引擎。



mysql 支持两种索引结构： `B-tree` 和 `HASH` 

- B-tree 索引

B-tree 索引结构使用 B+ 树来进行实现，结构如下图（粉色区域存放索引数据，白色区域存放下一级磁盘文件地址）：

![1698208834191](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698208834191.png)

B-tree 索引（B+ 树实现）的一些特点：

- B+ 树叶子节点之间按索引数据的大小顺序建立了双向链表指针，适合按照范围查找
- 使用 B+ 树非叶子节点 `只存储索引`，在 B 树中，每个节点的索引和数据都在一起，因此使用 B+ 树时，通过一次磁盘 IO 拿到相同大小的存储页，B+ 树可以比 B 树拿到的索引更多，因此减少了磁盘 IO 的次数。
- B+ 树查询性能更稳定，因为数据 `只保存在叶子节点`，每次查询数据，磁盘 IO 的次数是稳定的





## 为什么索引能提高查询速度？

答：

索引可以让服务器快速定位到表的指定位置，索引有以下几个优点：

- 索引大大减少了服务器需要扫描的数据量
- 索引可以帮助服务器避免排序和临时表
- 索引可以将随机 IO 变为顺序 IO

## 前缀索引和索引的选择性？

答：

**索引的选择性：**指的是不重复的索引值与数据表的记录总数的比值。

索引的选择性越高，查询效率也越高，因为选择性高的索引可以让 mysql 在查找时过滤掉更多的行。`唯一索引`的选择性是1，这也是最好的索引选择性，性能也是最好的



**前缀索引：**

有时候为了提高索引的性能，并且节省索引的空间，只对字段的前一部分字符进行索引，但是存在的缺点就是：`降低了索引的选择性`



**如何选择前缀索引的长度呢？**

前缀索引的长度选择我们要兼顾索引的选择性和存储索引的空间两个方面，因此既不能太长也不能太短，可以通过计算`不同前缀索引长度的选择性`，找到最接近`完整列的选择性`的前缀长度，通过以下 sql 进行计算`不同前缀索引长度的选择性`：

```sql
select 
count(distinct left(title, 6)) / count(*) as sel6,
count(distinct left(title, 7)) / count(*) as sel7,
count(distinct left(title, 8)) / count(*) as sel8,
count(distinct left(title, 9)) / count(*) as sel9,
count(distinct left(title, 10)) / count(*) as sel10,
count(distinct left(title, 11)) / count(*) as sel11,
count(distinct left(title, 12)) / count(*) as sel12,
count(distinct left(title, 13)) / count(*) as sel13,
count(distinct left(title, 14)) / count(*) as sel14,
count(distinct left(title, 15)) / count(*) as sel15,
count(distinct left(title, 16)) / count(*) as sel16,
count(distinct left(title, 17)) / count(*) as sel17,
count(distinct left(title, 18)) / count(*) as sel18,
count(distinct left(title, 19)) / count(*) as sel19,
count(distinct left(title, 20)) / count(*) as sel20,
count(distinct left(title, 21)) / count(*) as sel21
from interview_experience_article 
```

计算结果如下：

![1698218076575](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698218076575.png)

再计算`完整列的选择性`：

```sql
select count(distinct title)/count(*)  from interview_experience_article 
```

计算结果如下：

![1698218008368](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698218008368.png)



完整列的选择性是 0.6627，而前缀索引在长度为 16 的时候选择性为（`sel16=0.6592`），就已经很接近完整列的选择性了，此使再增加前缀索引的长度，选择性的提升幅度就已经很小了，因此在本例中，可以选择前缀索引长度为 16



**本例中的数据是随便找的一些文本数据，类型是 text**



**如何创建前缀索引：**

```sql
alter table table_name add key(title(16))
```



## 如何选择合适的索引顺序？

答：

来源于《高性能MySQL》（第4版）

对于选择合适的索引顺序来说，有一条重要的`经验法则`：**将选择性最高的列放到索引的最前列**

在通常境况下，这条法则会有所帮助，但是存在一些特殊情况：

对于下面这个查询语句来说：

```sql
select count(distinct threadId) as count_value
from message
where (groupId = 10137) and (userId = 1288826) and (anonymous = 0)
order by priority desc, modifiedDate desc
```

explain 的结果如下（只列出使用了哪个索引）：

```yaml
id: 1
key: ix_groupId_userId
```

可以看出选择了索引（groupId, userId），看起来比较合理，但是我们还没有考虑（groupId、userId）所匹配到的数据的行数：

```sql
select count(*), sum(groupId=10137), sum(userId=1288826), sum(anonymous=0)
from message
```

结果如下：

```sql
count(*): 4142217
sum(groupId=10137): 4092654
sum(userId=1288826): 1288496
sum(anonymous=0): 4141934
```

可以发现通过 groupId 和 userId 基本上没有筛选出来多少条数据

 **因此上边说的经验法则一般情况下都适用，但是在特殊形况下，可能会摧毁整个应用的性能**



上边这种情况的出现是因为这些数据是从其他应用迁移过来的，迁移的时候把所有的消息都赋予了管理组的用户，因此导致这样查询出来的数据量非常大，这个案例的解决情况是修改应用程序的代码：**区分这类特殊用户和组，禁止针对这类用户和组执行这个查询**





## 聚簇索引和非聚簇索引的区别？非聚集索引一定回表查询吗？

答：

聚簇索引并不是一种单独的索引类型，而是一种数据存储方式。

当表里有聚簇索引时，它的数据行实际上存放在索引的叶子节点中。

`聚簇`表示数据行和相邻和键值存储在一起

InnoDB 根据主键来聚簇数据，如果没有定义主键的话，InnoDB 会隐式定义一个主键来作为聚簇索引，

**聚簇索引的优点：**

- 数据访问更快。聚簇索引将数据和索引保存在同一个 B-tree 中，获取数据比非聚簇索引更快
- 使用覆盖索引扫描的查询可以直接使用叶节点的主键值

**聚簇索引的缺点：**

- 提升了 IO 密集型应用的性能。（如果数据全部放在内存中的话，不需要执行 IO 操作，聚集索引就没有什么优势了）

- 插入速度严重依赖于插入顺序。按照主键的顺序插入行是将数据加载到 InnoDB 表中最快的方式。

  如果不是按照逐渐顺序加载数据，在加载完之后最好使用 `optimize table` 重新组织一下表，该操作会重建表。重建操作能更新索引统计数据并释放聚簇索引中的未使用的空间。

  可以使用`show table status like '[table_name]' `查看优化前后表占用的存储空间

- 更新聚集索引的代价很高。因为会强制 InnoDB 将每个被更新的行移动到新的位置

- 基于聚簇索引的表在插入新行是或者主键被更新到只需要移动行的时候，可能面临 `页分裂` 的问题，当行的主键值需要插入某个已经满了的页中时，存储引擎会将该页分裂成两个页面来存储，也就是页分裂操作，页分裂会导致`表占用更多的磁盘空间`

- 聚簇索引可能会导致全表扫描变慢，尤其是行比较稀疏或者由于页分裂导致数据存储不连续的时候

- 二级索引（也是非聚簇索引）可能比想象的要更大，因为在二级索引的叶子节点存储了指向行的主键列。

- 二级索引访问需要两次索引查找，而不是一次。

  二级索引中，叶子节点保存的是指向行的主键值，那么如果通过二级索引进行查找，找到二级索引的叶子节点，会先获取对应数据的主键值，然后再根据这个值去聚簇索引中查找对应的行数据。（`两次索引查找`）

## 二级索引是什么？为什么已经有了聚集索引还需要使用二级索引？

答：

`二级索引`是非主键索引，也是`非聚集索引`（索引和数据分开存放），也就是在非主键的字段上创建的索引就是二级索引。

比如我们给一张表里的 name 字段加了一个索引，在插入数据的时候，就会重新创建一棵 B+ 树，在这棵 B+ 树中，就来存放 name 的二级索引。

即在二级索引中，索引是 name 值，数据（data）存放的是主键的值，第一次索引查找获取了主键值，之后根据主键值再去聚集索引中进行第二次查找，才可以找到对应的数据。

**常见的二级索引：**

- 唯一索引
- 普通索引
- 前缀索引：只适用于字符串类型的字段，取字符串的前几位字符作为前缀索引。



**为什么已经有了聚簇索引还需要使用二级索引？**

聚簇索引的叶子节点存储了完整的数据，而二级索引只存储了主键值，因此二级索引更节省空间。

如果需要为表建立多个索引的话，都是用聚簇索引的话，将占用大量的存储空间。



## 回表什么时候会发生？

当使用 SQL 查询时，如果走了索引，但是要查询的列并不全在索引上，因此还需要回表查询完整的数据

在非聚簇索引中，叶子节点保存的是主键的值，如果查询走的非聚簇索引，但是要查询的数据不只有主键的值，还有其他值，此时在非聚簇索引中拿到主键值，还需要再去聚簇索引回表查询，根据主键值查询到整行数据



- 聚簇索引和非聚簇索引如下，这里画图比较简略了
  - 根据非聚簇索引查询的话，是通过普通的索引字段进行判断的（比如在 name 上建立索引，那就是通过 name 字段去非聚簇索引上进行查询）
  - 根据聚簇索引查询的话，是通过主键进行判断的，直接从 SQL 语句中拿到主键值或者从非聚簇索引中拿到主键值，去聚簇索引中进行查询

![1706951062617](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706951062617.png)

![1706951051285](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706951051285.png)



## 为什么在 InnoDB 表中按逐渐顺序插入行速度更快呢？

答：

向表里插入数据，主键可以选择整数自增 ID 或者 UUID。

- 如果选择自增 ID 作为主键

那么在向表中插入数据时，插入的每一条新数据都在上一条数据的后边，当达到页的最大填充因子（InnoDB 默认的最大填充因子是页大小的 15/16，留出部分空间用于以后修改）时，下一条记录就会被写入到新的页中。



- 如果选择 UUID 作为主键

在插入数据时，由于新插入的数据的主键的不一定比之前的大，所以 InnoDB 需要为新插入的数据找到一个合适的位置——通常是已有数据的中间位置，有以下缺点：

1. 写入的目标也可能已经刷到磁盘上并从内存中删除，或者还没有被加载到内存中，那么 InnoDB 在插入之前，需要先将目标页读取到内存中。`这会导致大量随机 IO`
2. 写入数据是乱序的，所以 InnoDB 会频繁执行页分裂操作
3. 由于频繁的页分裂，页会变得稀疏并且被不规则地填充，最终数据会有碎片

**什么时候使用自增 ID 作为主键反而更糟？**

在高并发地工作负载中，并发插入可能导致间隙锁竞争。







## 了解覆盖索引吗？

答：

覆盖索引：一个索引包含（或说覆盖）所有需要查询的字段的值，我们就称之为“覆盖索引”。

覆盖索引是非常有用的工具，能够极大的提高性能，只需要查询索引而不需要回表，好处有很多：



MySQL 回表指的是在InnoDB存储引擎下，二级索引查询到的索引列，如果需要查找所有列的数据，则需要到主键索引里面去取出数据。这个过程就称为回表

- **索引条目通常远小于数据行的大小，如果只需要读取索引，mysql可以大幅减少数据访问量。**对缓存的负载很重要，可以减少数据拷贝花费的时间。覆盖索引对IO密集型应用也很有帮助，索引比数据更小，放到内存中更节省空间。
- 因为索引是按照顺序存放的（至少在单个页内是如此），所以对于IO密集型的范围查询，会比随机从磁盘读取每一行数据的IO要少得多。
- 由于InnoDB的聚簇索引，覆盖索引对InnoDB表特别有用。InnoDB的二级索引在叶子节点中保存了行的主键值，所以如果二级索引能够覆盖查询，则可以避免对主键索引的二次查询。





## 了解索引扫描吗？

答：

MySQL有两种方法生成有序结果：

- 通过排序操作
- 按照索引顺序扫描

如果 explain 出来的 type 列值为 "index" 的话，说明是按照索引扫描了。



**索引扫描本身的速度是很快的。但是如果索引不能覆盖查询所需的全部列的话，那在每次查询索引时都需要回表再查询其他字段，这样的话，按索引顺序读取的速度通常比顺序地全表扫描要慢。如下图，select \*时没有使用索引，select age时使用了索引。**



```sql
explain select age from user order by age; # 结果1
explain select * from user order by age; # 结果2
```





![1698384995928](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698384995928.png)



**设计：**设计的时候，尽可能让同一个索引既满足排序，又用于查找行，这样是最好的。

只有当索引的列顺序和`order by`子句的顺序完全一致时，MySQL才能使用索引来对结果进行排序，如果查询需要关联多张表时，只有`order by`子句引用的字段全部为第一个表时，才能使用索引做排序。

`order by`查询时，需要满足索引的最左前缀要求，否则MySQL需要执行排序操作，无法利用索引进行排序。

`order by`有一种情况可以不满足索引的最左前缀的要求：前导列为常量。（即如果age,name为索引列，那么`select * from user where age = 30 order by name`，使用where将age指定为常量，这时也是可以使用索引排序的）



## 索引这么多优点，为什么不对表中的每一个列创建一个索引呢？使用索引一定提高查询性能吗？

答：

如果出现过多的重复索引和未使用索引，会影响插入、删除、更新的性能。

例如，如果创建了一个主键id，再去向id上添加索引，那么就添加了重复的索引，因为MySQL的主键限制也是通过索引实现的。

冗余索引是：如果创建了索引（A, B），再创建索引（A）就是冗余索引，因为（A）是（A, B）的前缀索引。

还有一种情况是，（A, ID）其中ID是主键，也是冗余索引，因为在 InnoDB 中，二级索引的叶子节点中已经包含主键值了。



**使用索引一定提高查询性能吗？**

不一定

- 在数据量比较小的表中，使用全表扫描比使用索引扫描速度更快，并且可以直接获取到全量数据
- 索引虽然提高了查询性能，但是在插入、删除、更新的过程中也是需要进行维护的



## 最左前缀匹配原则？

答：

最左前缀原则：规定了联合索引在何种查询中才能生效。

规则如下：

- 如果想使用联合索引，联合索引的最左边的列必须作为过滤条件，否则联合索引不生效

如下图：

![1705986243662](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705986243662.png)

```sql
假如索引为：(name, age, position)
select * from employee where name = 'Bill' and age = 31;
select * from employee where age = 30 and position = 'dev';
select * from employee where position = 'manager';
```

索引的顺序是：name、age、position，因此对于上边三条 sql 语句，只有第一条 sql 语句走了联合索引

第二条语句将索引中的第一个 name 给跳过了，因此不走索引

第三条语句将索引中的前两个 name、age 给跳过了，因此不走索引

**为什么联合索引需要遵循最左前缀原则呢？**

因为索引的排序是根据第一个索引、第二个索引依次排序的，假如我们单独使用第二个索引 age 而不使用第一个索引 name 的话，我们去查询age为30的数据，会发现age为30的数据散落在链表中，并不是有序的，所以使用联合索引需要遵循最左前缀原则。







## 索引下推？

答：

在索引遍历过程中，对索引中包含的所有字段先做判断，过滤掉不符合条件的记录之后再回表，可以有效减少回表次数

比如：

```sql
索引：（name, age, positioni）
SELECT * FROM employees WHERE name like 'LiLei%' AND age = 22 AND position ='manager';
```

对上面这条 sql 语句就是用了`索引下推`，经过索引下推优化后，在联合索引（name，age，position）中，匹配到名字是 LiLei 开头的索引之后，同时还会在索引中过滤 age、position 两个字段的值是否符合，最后会拿着过滤完剩下的索引对应的主键进行回表，查询完整数据

（MySQL5.6 之前没有索引下推，因此匹配到 name 为 LiLei 开头的索引之后，会直接拿到主键，进行回表查询）



**优点：**

- 索引下推可以有效减少回表次数
- 对于 InnoDB 引擎的表，索引下推只能`用于二级索引`，因为 InnoDB 的主键索引的叶子节点存储的是全行数据，如果在主键索引上使用索引下推并不会减少回表次数 






## 如何判断是否使用索引？

答：

### 建表 SQL

```sql
CREATE TABLE `employees` (
`id` int(11) NOT NULL AUTO_INCREMENT,
`name` varchar(24) NOT NULL DEFAULT '' COMMENT '姓名',
`age` int(11) NOT NULL DEFAULT '0' COMMENT '年龄',
`position` varchar(20) NOT NULL DEFAULT '' COMMENT '职位',
`hire_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入职时间',
PRIMARY KEY (`id`),
KEY `idx_name_age_position` (`name`,`age`,`position`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='员工记录表';

INSERT INTO employees(name,age,position,hire_time) VALUES('LiLei',22,'manager',NOW());
INSERT INTO employees(name,age,position,hire_time) VALUES('HanMeimei', 23,'dev',NOW());
INSERT INTO employees(name,age,position,hire_time) VALUES('Lucy',23,'dev',NOW());

 ‐‐ 插入一些示例数据
drop procedure if exists insert_emp;
delimiter ;;
create procedure insert_emp()
begin
declare i int;
set i=1;
while(i<=100000)do
insert into employees(name,age,position) values(CONCAT('zqy',i),i,'dev');
set i=i+1;
end while;
end;;
delimiter ;
call insert_emp()
```



### 1、联合索引第一个字段用范围不走索引

```sql
EXPLAIN SELECT * FROM employees WHERE name > 'LiLei' AND age = 22 AND position ='manager';
```

![1698410787474](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698410787474.png)



`结论：`type 为 ALL 表示进行了全表扫描，mysql 内部可能认为第一个字段使用范围，结果集可能会很大，如果走索引的话需要回表导致效率不高，因此直接使用全表扫描



### 2、强制走索引

```sql
EXPLAIN SELECT * FROM employees force index(idx_name_age_position) WHERE name > 'LiLei' AND age = 22 AND position ='manager';
```

![1698410943905](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698410943905.png)



`结论：`虽然走了索引，扫描了 50103 行，相比于上边不走索引扫描的行数少了一半，但是查找效率不一定比全表扫描高，因为回表导致效率不高。



**可以使用以下代码测试：**

```sql
set global query_cache_size=0;
set global query_cache_type=0;
SELECT * FROM employees WHERE name > 'LiLei' limit 1000;
> OK
> 时间: 0.408s
SELECT * FROM employees force index(idx_name_age_position) WHERE name > 'LiLei' limit 1000;
> OK
> 时间: 0.479s
SELECT * FROM employees WHERE name > 'LiLei' limit 5000;
> OK
> 时间: 0.969s
SELECT * FROM employees force index(idx_name_age_position) WHERE name > 'LiLei' limit 5000;
> OK
> 时间: 0.827s
```

`结论：`在查询 1000 条数据的话，全表扫描还是比走索引消耗时间短的，但是当查询 5000 条数据时，还是走索引效率高





### 3、覆盖索引优化

```sql
EXPLAIN SELECT name,age,position FROM employees WHERE name > 'LiLei' AND age = 22 AND position ='manager';
```

![1698411792445](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698411792445.png)

`结论：`将 `select *` 改为 `select name, age, position`，优化为使用覆盖索引，因此不需要回表，效率更高





### 4、in、or

in和or在表数据量比较大的情况会走索引，在表记录不多的情况下会选择全表扫描

```sql
EXPLAIN SELECT * FROM employees WHERE name in ('LiLei','HanMeimei','Lucy') AND age = 22 AND position='manager'; # 结果1
EXPLAIN SELECT * FROM employees WHERE (name = 'LiLei' or name = 'HanMeimei') AND age = 22 AND position='manager'; # 结果2
```

![1698412051558](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698412051558.png)

![1698412060745](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698412060745.png)

`结论：`in、or 的查询的 type 都是 range，表示使用一个索引来检索给定范围的行



给原来的 employee 表复制为一张新表 employee_copy ，里边只保留 3 条记录

![1698412157784](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698412157784.png)

```sql
EXPLAIN SELECT * FROM employees_copy WHERE name in ('LiLei','HanMeimei','Lucy') AND age = 22 AND position ='manager';
EXPLAIN SELECT * FROM employees_copy WHERE (name = 'LiLei' or name = 'HanMeimei') AND age = 22 AND position ='manager';
```

![1698412186513](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698412186513.png)

![1698412193177](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698412193177.png)

`结论：`in、or 的查询的 type 都是 ALL，表示进行了全表扫描，没有走索引





### 5、like KK% 一般情况都会走索引

```sql
 EXPLAIN SELECT * FROM employees WHERE name like 'LiLei%' AND age = 22 AND position ='manager';
```

![1698412776696](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698412776696.png)

```sql
EXPLAIN SELECT * FROM employees_copy WHERE name like 'LiLei%' AND age = 22 AND position ='manager';
```

![1698412788320](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698412788320.png)







## MySQL 索引失效的几种情况？

接下来说一下 MySQL 在哪些情况下索引会失效，在实际使用的时候，要尽量避免索引失效：

- **使用左模糊查询**

```sql
select id,name,age,salary from table_name where name like '%lucs';
```

在进行 SQL 查询时，要尽量避免左模糊查询，可以改为右模糊查询，在右模糊查询的情况下一般都会走索引

```sql
select id,name,age,salary from table_name where name like 'lucs%';
```

- **不符合最左前缀原则的查询**

对于联合索引（a，b，c），来说，不能直接用 b 和 c 作为查询条件而直接跳过 a，这样就不会走索引了

如果查询条件使用 a，c，跳过了 b，那么只会用到 a 的索引

- **联合索引的第一个字段使用范围查询**

比如联合索引为：（name，age，position）

```sql
select * from employees where name > 'LiLei' and age = 22 and position ='manager';
```

如上，联合索引的第一个字段 name 使用范围查询，那么 InnoDB 存储引擎可能认为结果集会比较大，如果走索引的话，再回表查速度太慢，所以干脆不走索引了，直接全表扫描比较快一些

可以将范围查询放在联合索引的最后一个字段

- **联合索引中有一个字段做范围查询时用到了索引，那么该字段后边的列都不能走索引**

```
select * from employees where name = 'LiLei' and age > 10 and age < 20 and position = 'manager';
```

因为联合索引中这个字段如果使用范围查询的话，查询出来的数据对该字段后边的列并不是有序的，因此不能走索引了，所以尽量把范围查询都放在后边

- **对索引列进行了计算或函数操作**

当你在索引列上进行计算或者使用函数，MySQL 无法有效地使用索引进行查询，索引在这种情况下也会失效，如下：

```sql
select * from employees where LEFT(name,3) = 'abc';
```

应该尽量避免在查询条件中对索引字段使用函数或者计算。

- **使用了 or 条件**

当使用 or 条件时，只要 or 前后的任何一个条件列不是索引列，那么索引就会失效

```sql
select * from emp where id = 10010 or name = 'abcd';
```

如上，假如 name 列不是索引列，即使 id 列上有索引，这个查询语句也不会走索引

- **索引列上有 Null 值**

```sql
select * from emp where name is null;
```

如上，name 字段存在 null 值，索引会失效

应该尽量避免索引列的值为 null，可以在创建表的时候设置默认值或者将 null 替换为其他特殊值。





## MySQL 索引设计原则

了解了 MySQL 索引失效的情况之后，我们要对表设计索引，来尽量让查询语句都可以使用到索引

一般索引设计要遵循以下几条原则：

- **代码先行，索引后上**

索引不要在建完表之后立马建立索引，而是要等主体业务功能开发完毕之后，把该表相关的 SQL 语句进行分析之后，再建立索引

在建立索引的时候根据 where、order by、group by 中的条件字段建立索引，尽量让每一个联合索引都包含这 3 个条件上的字段，并且尽量要符合最左前缀原则，减少索引失效的情况

- **覆盖索引**

联合索引要尽量设计成覆盖索引，也就是让联合索引包含所有查询的字段，这样就避免了 MySQL 在二级索引中拿不到所有的数据还要回表查询的情况出现

- **索引的选择性**

索引的选择性是指不重复的记录与总记录的比值，选择性越高，表明通过索引可以过滤出更多的数据，查询效率也就越高

这里举一个反例，对性别字段建立索引，由于性别字段只有 3 种（男、女、未知），选择性很小，通过性别根本筛选不掉太多的数据，有没有索引区别不大

- **长字符串采用前缀索引**

采用前缀索引即只对长字符串的前一部分字符进行索引

这样做虽然提高了索引的性能，并且节省索引的空间，但是存在的缺点就是：降低了索引的选择性

那么对长字符串的前多少位建立索引也是就讲究的，可以通过下边这个 SQL 语句来计算不同长度的前缀索引的选择性，随着前缀长度的增长，选择性逐渐稳定时，就选择对应的前缀索引长度

```sql
# 长度为 6 的前缀索引的选择性
select count(distinct left(title, 6)) / count(*) as sel6 from table_name
```

如何建立前缀索引？`alter table table_name add key(title(6))`

- **where、order by 索引设计冲突时，优先 where 设计**

有些 SQL 查询语句是需要通过 order by 进行排序的，那么可能 where 的条件和 order by 的条件不同，那么这时要优先根据 where 条件的字段设计索引

因为先通过 where 条件使用索引筛选出来一小部分指定的数据，再通过 order by 去进行排序，性能消耗要小很多

- **基于慢 SQL 做优化**

慢 SQL 是指执行时间超过一定阈值的 SQL 查询语句

慢 SQL 相关的 MySQL 参数：

- `slow_query_log`：是否开启慢查询日志，默认关闭，通过 `SHOW VARIABLES LIKE '%slow_query%'`
- `long_query_time`：设置慢查询的时间阈值，默认 10s，通过 `SHOW VARIABLES LIKE '%long_query_time%';` 查询
- `log-slow-queries`：慢查询的日志存储路径（MySQL 5.6 版本及以下）
- `slow-query-log-file`：慢查询的日志存储路径（MySQL 5.6 版本及以上）

通过命令 `SHOW VARIABLES LIKE '%slow_query%'` 可以查询慢 SQL 相关的配置信息

**默认情况下慢查询日志是关闭的，开启慢查询日志会带来一定的性能影响，因此建议只在调优期间开启**








## 了解 Explain 执行计划吗？

答：

### 为什么要知道 SQL 的执行计划？

**首先我们为什么要去学习 MySQL 中的执行计划呢？**

我们知道，在大多数场景下对于 MySQL 的优化都是通过建立索引来完成的，但是在实际业务场景中，可能一个 SQL 非常复杂，其中执行起来我们可能并不能去预测它的执行方式，也不知道它到底走没有走索引

那么就可能出现我们去针对这个 SQL 建立了联合索引，但是性能还是非常差的情况，因此针对这种情况，我们需要去查看 SQL 的**执行计划**，了解 SQL 是如何运行的，之后再针对它进行索引、性能优化！



### 详解执行计划 type 列

通过 explain 语句可以帮助我们查看查询语句的具体执行计划，那么在执行计划中的 type 列表示 MySQL 是如何查找对应的数据了，我们先来说一下 type 列中常见的几种值的含义

这里主要说一下常见的几种：const、ref、range、index，性能从左到右逐渐变差

- **首先，const 的话表示性能是常量级的，非常快**

就比如对于 SQL 语句：`select * from table where id = 1` 

SQL 语句可以通过 `聚簇索引` 或者 `二级唯一索引 + 聚簇索引` 的方式，在常量级别的时间内找到我们想要的数据

这里需要注意的是，如果使用的是二级唯一索引的方式，必须保证建立 unique key 唯一索引，来保证二级索引列中的值都是唯一的，比如对于 SQL：`select * from table where name = x` ，那么就需要保证 name 列的值是唯一的，且 name 列是二级索引

![1707581883781](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1707581883781.png)



- **ref 级别的查询**

如果在 SQL 中只使用到了普通的二级索引，如：`select * from table where name = x` ，name 为普通二级索引，不是唯一索引，那么此时 SQL 的查询级别就是 ref，速度也比较快

如果对聚簇索引或者唯一索引判断是否为 null 值的话，也是 ref 级别的查询，如：`select * from table where name is NULL` ，如果 name 是聚簇索引（主键索引）或者唯一索引的话，此时查询级别为 ref

![1707583045414](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1707583045414.png)



- **range 级别的查询**

使用索引进行范围查询的 SQL，此时就是 range 级别的查询

如：`select * from table where age >= 18 and age <= 30` ，如果 age 为普通索引，通过 age 进行范围查询，则查询为 range 级别的



- **index 级别的查询**

看到 index 级别，可能觉得很快，其实不是这样的，index 级别的 SQL 查询性能仅仅比全表扫描要略好一些而已

index 的意思就是，如果有一个 SQL，发现你建立了一个联合索引，这个索引恰好是覆盖索引，因此直接遍历这个联合索引的叶子节点，将要查询的值全部取出来之后，就不需要再去聚簇索引中取值了，这种情况下查询的级别就是 index，性能仅仅比全表扫描要好一些而已

比如说 `select account, name, age from table where name = x` ，建立的联合索引为（account, name, age），那么发现 where 条件中直接根据 name 判断，不符合最左前缀原则，但是符合覆盖索引，因此 MySQL 判断二级索引大小还是比较小的，因此直接扫描二级索引的全部叶子节点，直接将对应的值给取出来即可

![1707583100390](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1707583100390.png)





### explain 各列含义

explain 查出来的各列含义如下：

- id：在一个大的查询语句中，每个 select 关键字都对应一个唯一的 id

- select_type：select 关键字对应的那个查询的类型

  - simple：简单查询。表示查询不包含子查询和union

  - primary：复杂查询中最外层的 select

  - subquery：包含在 select 中的子查询（不在 from 子句中）

  - derived：包含在 from 子句中的子查询。MySQL会将结果存放在一个临时表中，也称为派生表（derived的英文含义）

    ```sql
    set session optimizer_switch='derived_merge=off';  #关闭 mysql5.7 新特性对衍生表的合并优化
    explain select (select 1 from employees where id = 5) from (select * from account where id = 3) der;
    set session optimizer_switch='derived_merge=on'; #还原默认配置
    ```

    ![1698718620195](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698718620195.png)

  - union：在 union 中的第二个和随后的 select

    ```sql
    explain select 1 union all select 1;
    ```

    

- partitions：匹配的分区信息

- type：表示访问类型，即 MySQL 决定如何查找表中的行。从最优到最差分别为：`system > const > eq_ref > ref > range > index > ALL`

  一般来说得保证查询达到 range 级别，最好达到 ref

  - Null：表示 MySQL 在优化阶段分解查询语句，执行时不需要再访问表或索引。例如 `explain select min(id) from account;` 在索引列中取最小值，单独查询索引即可，执行时不需要再访问表

  - system：当表中只有一条记录并且该表使用的存储引擎的统计数据是精确的，比如 `explain select * from test;` 在 `test` 表中只有一条数据，如果 test 表使用 MyISAM 存储引擎，则 type 为 system；如果 test 表使用 InnoDB 存储引擎，则 type 为 ALL

  - const：const 表示代价时常数级别，当根据主键索引、唯一索引、二级索引与常数进行等值匹配时，对单表访问就是 const，只匹配到一行数据，很快.

    `explain select * from account where id = 1 `

  - eq_ref：primary key 或 unique key 索引的所有部分被连接使用 ，最多只会返回一条符合条件的记录。这可能是在 const 之外最好的联接类型了，简单的 select 查询不会出现这种 type。

    `explain select * from t1 left join t2 on t1.id=t2.id`

  - ref：相比于 eq_ref，不使用唯一索引，使用普通索引或者唯一索引的部分前缀，索引值和某个值相比较，可能找到多个符合条件的行

    name 是普通索引（非唯一索引），`explain select * from account where name = 'abc'`

  - range：范围扫描通常出现在 `in()`、`between`、`>`、`<`等操作

  - index：扫描全索引就能拿到结果，一般是扫描某个二级索引，会直接对二级索引的叶子节点遍历和扫描。这种查询一般为使用了覆盖索引，二级索引比较小，所以通常比 ALL 快一些

  - ALL：全表扫描，扫描聚簇索引的所有叶子节点，通常情况下这需要增加索引来进行优化

- possible_keys：可能用到的索引

  查询时可能出现 possible_keys 有列，但是 key 显示 Null 的情况，这是因为表中数据不多，MySQL 认为索引帮助不大，选择了全表扫描

  如果该列是 Null，说明没有相关索引，可以通过添加索引来提高查询性能

- key：实际上使用的索引

  如果为 Null 表示没有使用索引，可以使用 `force index`、`ignore index` 来强制使用索引

- key_len：实际使用到的索引长度

  key_len 计算规则如下：

  - 字符串，char(n)、varchar(n) 在 5.0.3 之后，n 代表字符数，而不是字节数，如果是 utf-8，一个数字或字母占 1 个字节，1 个汉字占 3 个字节
    - char(n)：如果存汉字，长度为 3n 字节
    - varchar(n)：
      - 如果存汉字（utf8），长度为 3n+2 字节，加的 2 字节用来存储字符串长度（varchar 是变长字符串）
      - 如果存汉字（utf8-mb4），长度为 4n+2 字节
  - 数值类型
    - tinyint：1 字节
    - smallint：2 字节
    - int：4 字节
    - bigint：8 字节
  - 时间类型：
    - date：3 字节
    - timestamp：4 字节
    - datetime：8 字节
  - 如果字段允许为 Null，则还需要 1 字节记录是否为 Null

  **计算示例：**

  - 设置索引：`idx_balance(balance)`，SQL 语句为 `explain select name from account where balance = '111' ;`

    该 SQL key_len = 5，4 个字节用于存储 balance（int，4B），1 个字节记录是否为 Null

  - 设置索引：idx_name(name)，name 字段编码为 uft8-mb4，长度为varchar(10)，`explain select name from account where name = 'abc';`

    该 SQL key_len = 43，name 索引长度为 10，使用 utf8-mb4 存储汉字的话，1 个汉字占 4 个字节，长度为 10 所占用字节为 4 * 10 = `40`，还需要 `2` 个字节存储 varchar 的长度，name 字段可以为空，因此还需要 `1` 个字节记录是否为 Null，因此 name 索引的长度为 `40 + 2 + 1 = 43`

    如果是 utf-8 编码，1 个汉字是占 3 个字节的。

- ref：当使用索引列等值查询时，与索引列进行等值匹配的对象信息，常见的 ref 值有：const（常量），字段名（例如：film.id）

- rows：预估的需要读取的记录条数，并不是结果集中的实际行数

- Extra：—些额外的信息，常见的重要值如下：

  - Using index：使用覆盖索引
  - Using where：使用 where 语句来处理结果，并且查询的列未被索引覆盖
  - Using index condition：查询的列不完全被索引覆盖，where 条件中是一个前导列的范围
    - 示例：索引（name，balance） `explain select *from account where name > 'a';`
  - Using temporary：mysql 需要创建一张临时表来处理查询。出现这种情况需要使用索引进行优化
    - 示例：name 字段没有索引，此时创建一张临时表来 distinct，`explain select distinct name from account`
  - Using filesort：使用外部排序而不是索引排序，数据较少时在内存中排序，数据较大时在磁盘中排序，一般情况下也是需要考虑使用索引进行优化
    - 示例：name 字段没有索引，`explain select name from account order by name`
  - Select tables optimized away：使用聚合函数来访问存在索引的某个字段
    - 示例：`explain select min(id) from account;`



### 通过实操理解 explain 执行计划



- **案例一：开胃小菜**

SQL 语句：

```sql
explain select * from test1;
```

执行计划如下：

![image-20240212195020126](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240212195020126.png)

首先，**id = 1**，id 是每一个 SQL 语句的唯一标识

**select_type** 值为 SIMPLE 表示这个 SQL 是一个简单的查询，不包含子查询以及 union 等操作

table 表明对哪个表进行的操作

**type = index** 表明对二级索引的叶子节点进行扫描得到了结果，因为这个 test1 表里只有两个字段，id 和 name，我在 name 列上建立了索引，因此对 name 索引的叶子节点扫描一遍就可以得到 id 和 name 值

**rows = 3** 表明扫描了 3 行数据

**filtered = 100** 表明没有通过 where 过滤数据，因此筛选出来的数据在表里数据的占比为 100%



- **案例二：多表查询**

SQL 语句：

```sql
explain select * from test1 join test2;
```

执行计划：

![image-20240212195845525](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240212195845525.png)

可以发现有两条执行计划，也就是说明会访问两个表，两条执行计划的 id 都是 1，说明是同一个 SQL 语句

首先第一条执行计划是对 test2 表进行全表扫描（type = ALL），rows = 1 表明扫描出来了 1 条数据，在表中占比为 100%

第二条执行计划是对 test1 表进行全表扫描，rows = 3 表明扫描出来 3 条数据，占比 100%，其中 Extra 列与第一条执行计划有所不同

可以看到 Extra 列值为 `Using join buffer(Block Nested Loop)`，

这是因为使用了 join 对两个表进行连表查询，这样其实查出来的是笛卡尔积，对两个表中的所有数据进行关联，在 MySQL 中一般会以数据量比较小的表作为驱动表，因此以 test2 表为驱动表，去 test1 表中找到所有数据进行匹配，小表作为驱动表可以减少比较的行数，在 test1 表中对数据进行匹配时使用到了 Using join buffer，也就是通过一块内存区域 join buffer 来对数据进行连接操作，而 Nested Loop 表明进行嵌套循环连接，也就是笛卡尔积（test2 表的每一行数据都和 test1 表的每行数据做连接）



- **案例三：union 并集查询**

SQL 语句：

```sql
explain select * from test1 union select * from test2;
```

执行计划：

![image-20240212201840172](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240212201840172.png)

前两条执行计划就是对 test1 和 test2 这两张表进行全表扫描操作

第 3 条执行计划是对两张表中的数据进行合并去重操作，`table = <union 1,2>` 指的是这个临时表的表名，`extra = Using temporary` 也表明了使用了临时表

`union` 是对两张表的结果进行合并去重

`union all` 的话不会对数据进行去重操作






## 并发事务带来的问题

答：

- `脏写：`多个事务更新同一行，每个事务不知道其他事务的存在，最后的更新覆盖了其他事务所做的更新
- `脏读：`事务 A 读取到了事务 B 已经修改但是没有提交的数据，此时如果事务 B 回滚，事务 A 读取的则为脏数据
- `不可重复读：`事务 A 内部相同的查询语句在不同时刻读出的结果不一致，在事务 A 的两次相同的查询期间，有其他事务修改了数据并且提交了
- `幻读：`当事务 A 感知到了事务 B 提交的新增数据

**不可重复读和幻读很类似，都是事务 A 读取到了事务 B 新提交的数据，区别为：**

- 不可重复读是读取了其他事务更改的数据，针对 `update` 操作
- 幻读是读取了其他事务新增的数据，针对 `insert` 和 `delete` 操作



**不同的事务隔离级别可能带来的问题：**

| 隔离级别                   | 脏读（Dirty Read） | 不可重复读（NonRepeatable Read） | 幻读（Phantom Read） |
| ---------------------- | -------------- | ------------------------- | ---------------- |
| 未提交读（Read uncommitted） | 可能             | 可能                        | 可能               |
| 已提交读（Read committed）   | 不可能            | 可能                        | 可能               |
| 可重复读（Repeatable read）  | 不可能            | 不可能                       | 可能               |
| 可串行化（Serializable ）    | 不可能            | 不可能                       | 不可能              |





## MySQL 的事务隔离级别了解吗？

答：

MySQL 的事务隔离级别分为：

- 读未提交：事务 A 会读取到事务 B 更新但没有提交的数据。如果事务 B 回滚，事务 A 产生了脏读

- 读已提交：事务 A 会读取到事务 B 更新且提交的数据。事务 A 在事务 B 提交前后两次查询结果不同，产生不可重复读

- 可重复读：保证事务 A 中多次查询数据一致。**`可重复读是 MySQL 的默认事务隔离级别`**。可重复读可能会造成`幻读` ，事务A进行了多次查询，但是事务B在事务A查询过程中新增了数据，事务A虽然查询不到事务B中的数据，但是可以对事务B中的数据进行更新

- 可串行化：并发性能低，不常使用




## 幻读问题

在可重复读隔离级别中，通过 `临键锁` 在一定程度上缓解了幻读的问题，但是在特殊情况下，还是会出现幻读

以下两种情况下，会出现 `幻读`，大家可以先看一下如何出现的幻读， `思考一下为什么会出现幻读` ，答案会写在后边！

- **情况1：事务 A 通过更新操作获取最新视图之后，可以读取到事务 B 提交的数据，出现幻读现象**

对于下图中的执行顺序，会出现幻读现象，可以看到在事务 A 执行到第 7 行发现查询到了事务 B 新提交的数据了

这里都假设使用的 InnoDB 存储引擎，事务隔离级别默认都是 `可重复读`

在可重复读隔离级别下，使用了 MVCC 机制，select 操作并不会更新版本号，是快照读（历史版本），执行 insert、update 和 delete 时会更新版本号，是当前读（当前版本），因此在事务 A 执行了第 6 行的 update 操作之后，更新了版本号，读到了 id = 5 这一行数据的最新版本，因此出现了幻读！

![1705415508036](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705415508036.png)



- **情况2：事务 A 在步骤 2 执行的读操作并不会生成间隙锁，因此事务 B 会在事务 A 的查询范围内插入行**

对于下边这种情况也会出现幻读，在第 6 行使用 `select ... for update` 进行查询，这个查询语句是当前读（查询的最新版本），因此查询到了事务 B 新提交的数据，出现了幻读！



![1705415928868](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705415928868.png)



**那么对于以上两种情况来说，为什么会出现幻读呢？**

对于事务 A 出现了幻读，原因就是，事务 A 执行的第 2 行是普通的 select 查询，这个普通的 select 查询是快照读，不会生成临键锁（具体生成临键锁、记录锁还是间隙锁根据 where 条件的不同来选择），因此就 `不会锁住这个快照读所覆盖的记录行以及区间`

那么事务 B 去执行插入操作，发现并没有生成临键锁，因此直接可以插入成功



**重要：那么我们从代码层面尽量去避免幻读问题呢？**

在一个事务开始的时候，尽量先去执行 `select ... for update`，执行这个当前读的操作，会先去生成临键锁，锁住查询记录的区间，不会让其他事务插入新的数据，因此就不会产生幻读

这里我也画了一张图如下，你也可以去启动两个会话窗口，连接上 mysql 执行一下试试，就可以发现，当事务 A 执行 `select ... for update` 操作之后，就会加上临键锁（由于 where 后的条件是 id=5，因此这个临键锁其实会退化为记录锁，将 id=5 这一行的数据锁起来），那么事务 B 再去插入 id=5 这条数据，就会因为有锁的存在，阻塞插入语句

![1705416690115](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705416690115.png)






## 设置 MySQL 的事务隔离级别

答：

通过以下命令设置：

```sql
show variables like 'tx_isolation'; # 查看事务隔离级别
set tx_isolation='read-uncommitted'; # 设置读未提交
set tx_isolation='read-committed'; # 设置读已提交
set tx_isolation='repeatable-read'; # 设置可重复读
set tx_isolation='serializable'; # 设置可串行化
```





## MySQL 的锁

为什么要了解 MySQL 中的锁呢？

其实了解 MySQL 中的锁，并不一定是我们必须要去使用它，而是说在我们写 SQL 语句时，更加清楚在 MySQL 的底层是如何通过加锁去对共享数据保证在多个事务执行时的安全

**MySQL 锁的使用建议：一般来讲，不建议在数据库层面去加锁来实现复杂的业务逻辑，因为这样会导致加的锁隐藏在 SQL 语句中，业务语义不清晰，对后来的维护带来很大的麻烦，因此更推荐使用 Redis、ZooKeeper 提供的分布式锁来实现复杂业务场景下的锁机制！**

MySQL 这一块锁的内容还是比较复杂的，需要写一些功夫来学习，接下来我尽量写的简单易懂一些

首先还是先给锁分类，之后再来逐个了解：

**按照功能划分：**

- 共享锁：也叫 `S 锁` 或 `读锁`，是共享的，不互斥（共享锁的使用一般是比较少的）

  加锁方式：`select ... lock in share mode`

- 排他锁：也叫 `X 锁` 或 `写锁`，写锁阻塞其他锁

  加锁方式：`select ... for update`

**按照锁的粒度划分：**

- 全局锁：锁整个数据库
- 表级锁：锁整个表
- 行级锁：锁一行记录的索引
  - 记录锁：锁定索引的一条记录
  - 间隙锁：锁定一个索引区间
  - 临键锁：记录锁和间隙锁的结合，`解决幻读问题`
  - 插入意向锁：执行 insert 时添加的行记录 id 的锁



### 全局锁

全局锁是对整个数据库实例加锁，加锁后整个数据库实例就处于只读状态

什么时候会用到全局锁呢？

在 `全库逻辑备份` 的时候，对整个数据库实例上锁，不允许再插入新的数据



**相关命令：**

```sql
# 加锁
flush tables with read lock;
# 释放锁
unlock tables;
```





### 表级锁

表级锁其实是 MySQL 中非常鸡肋的功能，几乎没有人会去对 MySQL 添加表级锁

表级锁中又分为以下几种：

- 表读锁：阻塞对当前表的写，但不阻塞读
- 表写锁：阻塞队当前表的读和写
- 元数据锁：这个锁不需要我们手动去添加，在访问表的时候，会自动加上，这个锁是为了保证读写的正确
  - 当对表做 `增删改查` 时，会自动添加元数据读锁
  - 当对表做 `结构变更` 时，会自动添加元数据写锁
- 自增锁：是一种特殊的表级锁，自增列事务执行插入操作时产生



**查看表级锁的命令：**

```sql
-- 查看表锁定状态
show status like 'table_locks%';
-- 添加表读锁
lock table user read;
-- 添加表写锁
lock table user write;
-- 查看表锁情况
show open tables;
-- 删除表锁
unlock tables;
```

![1705387575276](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705387575276.png)





### 行级锁

MySQL 的行级锁是由存储引擎是实现的，InnoDB 的行锁就是通过给 `索引加锁` 来实现

注意：**`InnoDB 的行锁是针对索引加的锁，不是针对记录加的锁。并且该索引不能失效，否则会从行锁升级为表锁`**

行锁根据 `范围` 分为：记录锁（Record Locks）、间隙锁（Gap Locks）、临键锁（Next-Key Locks）、插入意向锁（Insert Intention Locks）

行锁根据 `功能` 分为：读锁和写锁



**什么时候会添加行锁呢？**

- 对于 update、insert 语句，InnoDB 会自动添加写锁（具体添加哪一种锁会根据 where 条件判断，后边会提到 `加锁规则`）
- 对于 select 不会添加锁
- 事务手动给 select 记录集添加读锁或写锁



接下来对记录锁、间隙锁、临键锁、插入意向锁来一个一个解释，这几个锁还是比较重要的，一定要学习！

> **记录锁：**

记录锁：锁的是一行索引，而不是记录

那么可能有人会有疑问了，如果这一行数据上没有索引怎么办呢？

其实如果一行数据没有索引，InnoDB 会自动创建一个隐藏列 ROWID 的聚簇索引，因此每一行记录是一定有一个索引的

下边给出记录锁的一些命令：

```sql
-- 加记录读锁
select * from user where id = 1 lock in share mode;
-- 加记录写锁
select * from user where id = 1 for update;
-- 新增、修改、删除会自动添加记录写锁
insert into user values (1, "lisi");
update user set name = "zhangsan" where id = 1;
delete from user where id = 1;
```



> **间隙锁**

间隙锁用于锁定一个索引区间，开区间，不包括两边端点，用于在索引记录的间隙中加锁，不包括索引记录本身

间隙锁的作用是 `防止幻读`，保证索引记录的间隙不会被插入数据

**间隙锁在 `可重复读` 隔离级别下才会生效**

如下：

```sql
select * from users where id between 1 and 10 for update;
```



#### 间隙锁、临键锁区间图

这里将间隙锁和临键锁（下边会讲到）在主键索引 id 列和普通索引 num 列上的区间图画出来，方便通过图片更加直观的学习

首先，表字段和表中数据如下：

![1705395524928](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705395524928.png)



对于这两个字段，他们的间隙锁和临键锁的区间如下（红色部分）：

![1705395642183](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705395642183.png)



> **临键锁**

临键锁是记录锁和间隙锁的组合，这里之所以称临键锁是这两个锁的组合是因为它会锁住一个左开右闭的区间（间隙锁是两边都是开区间，通过记录锁锁住由边的记录，成为左开右闭的区间），可以看上边的图片来查看临键锁的范围

**默认情况下，InnoDB 使用临键锁来锁定记录，但会在不同场景中退化**

- 使用唯一索引（Unique index）等值（=）且记录存在，退化为 `记录锁`
- 使用唯一索引（Unique index）等值（=）且记录不存在，退化为 `间隙锁`
- 使用唯一索引（Unique index）范围（>、<），使用 `临键锁`
- 非唯一索引字段，默认是 `临键锁`

每个数据行上的 `非唯一索引` 都会存在一把临键锁，但某个事务持有这个临键锁时，会锁一段左开右闭区间的数据



> **插入意向锁**

间隙锁在一定程度上可以解决幻读问题，但是如果一个间隙锁锁定的区间范围是（10，100），那么在这个范围内的 id 都不可以插入，锁的范围很大，导致很容易发生锁冲突的问题

**插入意向锁就是用来解决这个问题**

插入意向锁是在 Insert 操作之前设置的一种 `特殊的间隙锁`，表示一种插入意图，即当多个不同的事务同时向同一个索引的同一个间隙中插入数据时，不需要等待

插入意向锁不会阻塞 `插入意向锁`，但是会阻塞其他的 `间隙写锁`、`记录锁`



举个例子：就比如说，现在有两个事务，插入值为 50 和值为 60 的记录，每个事务都使用 `插入意向锁` 去锁定 （10，100）之间的间隙，这两个事务之间不会相互阻塞！



### 加锁规则【重要】

加锁规则非常重要，要了解 MySQL 会在哪种情况下去加什么锁，避免我们使用不当导致加锁范围很大，影响写操作性能

**对于 `主键索引` 来说：**

- 等值条件，命中，则加记录锁
- 等值条件，未命中，则加间隙锁
- 范围条件，命中，对包含 where 条件的临建区间加临键锁
- 范围条件，没有命中，加间隙锁

**对于 `辅助索引` 来说：**

- 等值条件，命中，则对命中的记录的 `辅助索引项` 和 `主键索引项` 加 `记录锁` ，辅助索引项两侧加 `间隙锁`
- 等值条件，未命中，则加间隙锁
- 范围条件，命中，对包含 where 条件的临建区间加临键锁，对命中纪录的 id 索引项加记录锁
- 范围条件，没有命中，加间隙锁



### 行锁变成表锁

锁主要是加在索引上，如果对非索引字段更新，`行锁可能会变表锁`：

假如 account 表有 3 个字段（id, name, balance），我们在 name、balance 字段上并没有设置索引

session1 执行：

```sql
mysql> begin;
Query OK, 0 rows affected (0.00 sec)

mysql> select * from account;
+----+------+---------+
| id | name | balance |
+----+------+---------+
|  1 | zs   |     777 |
|  2 | ls   |     800 |
|  3 | ww   |     777 |
|  4 | abc  |     999 |
| 10 | zzz  |    2000 |
| 20 | mc   |    1500 |
+----+------+---------+
6 rows in set (0.01 sec)

mysql> update account set balance = 666 where name='zs';
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0
```



此时 session2 执行（发现执行阻塞，经过一段时间后，返回结果锁等待超时，证明 session1 在没有索引的字段上加锁，导致`行锁升级为表锁`，因此 session2 无法对表中其他数据做修改）：

```sql
mysql> begin;
Query OK, 0 rows affected (0.00 sec)

mysql> update account set balance = 111 where name='abc';
RROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction
```

**`InnoDB 的行锁是针对索引加的锁，不是针对记录加的锁。并且该索引不能失效，否则会从行锁升级为表锁`**



### 行锁分析实战【重要】

这里主要对下边这两条 sql 进行分析，判断看到底会添加什么样的行锁：

```sql
-- sql1
select * from user where id = 5;
-- sql2
delete from user where id = 5;
```

而对于 sql1 来说，select 查询是快照读，不会加锁，因此下边主要是对 sql2 进行分析

其实只通过 sql 是没有办法去分析到底会添加什么样的行锁，还需要结合 where 后边的条件，还有索引的字段来综合分析

以下分析基于 `可重复读` 隔离级别进行分析

> 情况1：id 列是主键

当 id 列是主键的时候，delete 操作对 id=5 的数据删除，此时根据【加锁规则】，只需要对 id=5 这条记录加上 `记录写锁` 即可

只对这一条记录加锁，比较简单，这里就不画图了

> 情况2：id 列是二级唯一索引

如果 id 列是二级唯一索引的话，此时根据【加锁规则】，那么需要对 id=5 这条记录加上 `记录写锁`，再通过这个二级唯一索引去 `主键索引` 中找到对应的记录，也加上 `记录写锁`，添加的锁如下图：

![1705472551662](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705472551662.png)

**为什么主键索引中也需要加锁呢？**

如果另一个并发的 sql 通过主键索引来更新这条记录：`update user set id = 11 where name = 'a';`，而 delete 没有对主键索引上的记录加锁，就会导致这条 update 语句并不知道 delete 在对这条数据进行操作



> 情况3：id 列是二级非唯一索引

在 `可重复读` 隔离级别下，通过间隙锁去避免了幻读的问题，虽然还有可能出现幻读，还是大多数情况下不会出现

如何通过添加 `间隙锁` 去避免幻读问题呢？

当删除 id = 5 的数据时，由于 id 是二级非唯一索引（辅助索引），由上边的加锁规则可以知道，会对命中的记录的 `辅助索引项` 和 `主键索引项` 加 `记录锁` ，辅助索引项两侧加 `间隙锁`，加的锁如下图红色所示：

![1705470546944](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705470546944.png)





> 情况4：id 列上没有索引

如果 id 列上没有索引，那么就只能全表扫描，因此会给整个表都加上写锁，也就是锁上 `表的所有记录` 和 `聚簇索引的所有间隙`

那么如果表中有 `上千万条数据`，那么在这么大的表上，除了不加锁的快照读操作，无法执行其他任何需要加锁的操作，那么在整个表上锁的期间，执行 SQL 的并发度是很低的，导致性能很差

因此，一定要注意，尽量避免在没有索引的字段上进行加锁操作，否则行锁升级为表锁，导致性能大大降低



### 死锁分析

死锁 `造成的原因`：两个及以上会话的 `加锁顺序不当` 导致死锁

**死锁案例**：两个会话都持有一把锁，并且去争用对方的锁，从而导致死锁

![1705473744024](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705473744024.png)



**如何排查和避免死锁问题：**

通过 sql 查询最近一次死锁日志：

```sql
show engine innodb status;
```



MySQL 默认会主动探知死锁，并回滚某一个影响最小的事务，等另一个事务执行完毕后，在重新执行回滚的事务

可以从以下几个方面降低死锁问题出现的概率：

- 尽量减小锁的粒度，保持事务的轻量，可以降低发生死锁的概率
- 尽量避免交叉更新的代码逻辑
- 尽快提交事务，减少锁的持有时间





## select for update 了解吗？

答：

`select for update` 即排他锁，根据 where 条件的不同，对数据加的锁又分为行锁和表锁：

- 如果 where 字段使用到了索引，则会添加行锁，具体加行锁中的哪一种所，可以通过上边的【加锁规则】进行判断
- 如果 where 字段没有使用索引，则会添加表锁





## 什么是慢 sql，如何查找，如何优化？

答：

慢 SQL 是指执行时间超过一定阈值的 SQL 查询语句

慢 SQL 相关的 MySQL 参数：

- `slow_query_log`：是否开启慢查询日志，默认关闭，通过 `SHOW VARIABLES LIKE '%slow_query%'`
- `long_query_time`：设置慢查询的时间阈值，默认 10s，通过 `SHOW VARIABLES LIKE '%long_query_time%';` 查询

通过命令 `SHOW VARIABLES LIKE '%slow_query%'` 可以查询慢 SQL 相关的配置信息



**如何优化慢 SQL 呢？**

- 通过 explain 命令分析慢 sql 的执行计划，了解在该 sql 中索引的使用是否合理，先对索引进行优化
- 简化查询逻辑，避免不必要的子查询、函数操作，避免索引失效的情况出现
- 优化表结构，避免过多的联合查询
- 对于频繁查询并且不经常变化的数据，可以考虑通过缓存来减少对数据库的消耗



参考文章：

- [慢SQL解决方案](https://blog.csdn.net/wu_noah/article/details/121597321)



## 介绍一下 join、left join、right join 区别？

答：

- join 和 inner join 是相同的，inner join 可以简写为 join，表示两个表的交集
- left join 是左连接，以左表为主，查询左表所有数据，显示右表与左表相关联部分的数据
- right join 是右连接，以右表为主，查询右表所有数据，显示左表与右表相关联部分的数据

下边我们为测试数据：

**t1 表数据：** 

![1698727323906](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698727323906.png)

**t2 表数据：**

![1698727335433](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698727335433.png)



**测试结果：**

```sql
select * from t1 join t2 on t1.id = t2.id; # 结果1
select * from t1 left join t2 on t1.id = t2.id; # 结果2
select * from t1 right join t2 on t1.id = t2.id; # 结果3
```

![1698727481314](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698727481314.png)

![1698727487706](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698727487706.png)

![1698727494906](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698727494906.png)







## left join 和 exists 的区别和使用场景



**先说一下这两个的区别：**

- left join 是连表查询，会返回左边表的所有数据，如果右表有匹配的记录则显示右表中对应的记录，如果右表中没有匹配的记录，则右表对应的列全部为 Null
- exists 是一种子查询，返回 true 或 false，用于判断在另一个表中是否有对应的记录，但是并不需要这些记录的具体内容



**适用场景：**

- left join 适用于需要保留左表中的全部记录，并且只关心右表中匹配的行记录的情况，但是如果使用 left join 处理大量数据时，可能会有性能问题
- exists 适用于判断某个条件是否满足，也就是某些记录在另一个表中是否存在，并不关心这些记录的具体内容是什么



**这里给出 exists 的使用示例，以及使用建议：**

当 A 表的数据集小于 B 表的数据集时，使用 `exists`

将主查询 A 的数据放到子查询 B 中做条件验证，根据验证结果（true 或 false）来决定主查询的数据是否保留

```sql
select * from A where exists (select 1 from B where B.id = A.id)
```









## 介绍一下Union和union all的区别？

答：

使用union关键字时，可以给出多条select 语句，并将它们的结果合成单个结果集合并时两个表对应的列数和数据类型必须相同。

- union 对两个结果集进行并集操作，并且去重和排序
- union all 只是合并多个查询结果，不会进行去重和排序，效率比 union 高



## 常见的 SQL 优化

答：

接下来的 SQL 优化，以下边这个 employees 表为例进行优化：

```sql
CREATE TABLE `employees` (
`id` int(11) NOT NULL AUTO_INCREMENT,
`name` varchar(24) NOT NULL DEFAULT '' COMMENT '姓名',
`age` int(11) NOT NULL DEFAULT '0' COMMENT '年龄',
`position` varchar(20) NOT NULL DEFAULT '' COMMENT '职位',
`hire_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入职时间',
PRIMARY KEY (`id`),
KEY `idx_name_age_position` (`name`,`age`,`position`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='员工记录表';

INSERT INTO employees(name,age,position,hire_time) VALUES('LiLei',22,'manager',NOW());
INSERT INTO employees(name,age,position,hire_time) VALUES('HanMeimei', 23,'dev',NOW());
INSERT INTO employees(name,age,position,hire_time) VALUES('Lucy',23,'dev',NOW());

‐‐ 插入一些示例数据
drop procedure if exists insert_emp;
delimiter ;;
create procedure insert_emp()
begin
declare i int;
set i=1;
while(i<=100000)do
insert into employees(name,age,position) values(CONCAT('zqy',i),i,'dev');
set i=i+1;
end while;
end;;
delimiter ;
call insert_emp();
```



### order by、group by 优化

下边是 8 种使用 order by 的情况，我们通过分析以下案例，可以判断出如何使用 order by 和 where 进行配合可以走`using index condition（索引排序）`而不是 `using filesort（文件排序）`

**联合索引为 （name，age，position）**

- **case1**

```sql
EXPLAIN SELECT * FROM employees WHERE name = 'LiLei' and position = 'dev' order by age;
```

![1698414238215](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698414238215.png)

`分析：`查询用到了 name 索引，从 key_len=74 也能看出，age 索引列用在排序过程中，符合最左前缀原则，使用了索引排序，因此 Extra 字段为 Using index condition



- **case2**

```sql
EXPLAIN SELECT * FROM employees WHERE name = 'LiLei' order by position;
```

![1698414291344](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698414291344.png)



`分析：`从 explain 执行结果来看，key_len = 74，查询使用了 name 索引，由于 order by 用了 position 进行排序，跳过了 age，不符合最左前缀原则，因此不走索引，使用了文件排序 Using filesort





- **case3**

```sql
EXPLAIN SELECT * FROM employees WHERE name = 'LiLei' order by age, position;
```

![1698414875454](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698414875454.png)

`分析：`查找只用到索引 name，age 和 position用于排序，与联合索引顺序一致，符合最左前缀原则，使用了索引排序，因此 Extra 字段为 Using index condition





- **case4**

```sql
EXPLAIN SELECT * FROM employees WHERE name = 'LiLei' order by position, age;
```

![1698417882580](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698417882580.png)

`分析：`因为索引的创建顺序为 name,age,position，但是排序的时候 age 和 position 颠倒位置了，和索引创建顺序不一致，不符合最左前缀原则，因此不走索引，使用了文件排序 Using filesort





- **case5**

```sql
EXPLAIN SELECT * FROM employees WHERE name = 'LiLei' and age = 18 order by position, age;
```

![1698415102710](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698415102710.png)

`分析：`与 case 4 相比，Extra 中并未出现 using filesort，并且查询使用索引 name，age，排序先根据 position 索引排序，索引使用顺序与联合索引顺序一致，因此使用了索引排序





- **case6**

```sql
EXPLAIN SELECT * FROM employees WHERE name = 'zqy' order by age asc, position desc;
```

![1698415273825](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698415273825.png)

`分析：`虽然排序字段列与联合索引顺序一样，但是这里的 position desc 变成了降序排序，`导致与联合索引的排序方式不同`，因此不走索引，使用了文件排序 Using filesort





- **case7**

```sql
EXPLAIN SELECT * FROM employees WHERE name in ('LiLei', 'zqy') order by age, position;
```

![1698415435334](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698415435334.png)

`分析：`先使用索引 name 拿到 LiLei，zqy 的数据，之后需要根据 age、position 排序，但是根据 name 所拿到的数据对于 age、position 两个字段来说是无序的，因此不走索引，使用了文件排序 Using filesort

> 为什么根据 `name in` 拿到的数据对于 age、position 来说是无序的：
>
> 对于下图来说，如果取出 name in (Bill, LiLei) 的数据，那么对于 age、position 字段显然不是有序的，因此肯定无法使用索引扫描排序



![1698416520734](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698416520734.png)





- **case8**

```sql
EXPLAIN SELECT * FROM employees WHERE name > 'a' order by name;
```

![1698416982916](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698416982916.png)

`分析：`对于上边这条 sql 来说，使用了 select *，因此 mysql 判断如果不走索引，直接使用全表扫描更快，因此不走索引，使用了文件排序 Using filesort

```sql
EXPLAIN SELECT name FROM employees WHERE name > 'a' order by name;
```

![1698416970884](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698416970884.png)

`分析：`因此可以使用`覆盖索引`来优化，只通过索引查询就可以查出我们需要的数据，不需要回表，通过覆盖索引优化，因此没有出现 using filesort





#### 优化总结

1. MySQL支持两种方式的排序 filesort 和 index，Using index 是指 MySQL 扫描索引本身完成排序。index 效率高，filesort 效率低。
2. order by满足两种情况会使用Using index。
   - order by语句使用索引最左前列。
   - 使用where子句与order by子句条件列组合满足索引最左前列。
3. 尽量在索引列上完成排序，遵循索引建立（索引创建的顺序）时的最左前缀法则。
4. 如果order by的条件不在索引列上，就会产生Using filesort。
5. 能用覆盖索引尽量用覆盖索引
6. group by 与 order by 很类似，其实质是先排序后分组，遵照索引创建顺序的最左前缀法则。对于 group by 的优化如果不需要排序的可以加上 order by null 禁止排序。注意，where 高于 having，能写在 where 中的限定条件就不要去 having 限定了。


### 分页查询优化

我们实现分页功能可能会用以下 sql：

```sql
select * from employees limit 10000, 10;
```

该 sql 表示从 employees 表的第 10001 行开始的 10 行数据，虽然只查询了 10 条数据，但是会先去读取 10010 条记录，再抛弃前 10000 条数据，因此如果查询的数据比较靠后，效率非常低



#### 1、根据自增且连续的主键排序的分页查询

该优化必须保证主键是自增的，并且主键连续，中间没有断层。



**未优化 sql** 

```sql
select * from employees limit 9000, 5;
```

**结果：**

![1698420438962](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698420438962.png)

**执行计划：**

![1698420480234](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698420480234.png)



因为 id 是连续且自增的，所以可以直接通过 id 判断拿到 id 比 9000 大的 5 条数据，效率更高：





**优化后 sql**

```sql
select * from employees where id > 9000 limit 5;
```



**结果**

![1698420450449](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698420450449.png)

**执行计划：** 

![1698420463722](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698420463722.png)





**总结**

- 如果主键空缺，则不能使用该优化方法

#### 2、根据非主键字段排序的分页查询



**未优化 sql**

```sql
select * from employees order by name limit 9000, 5;
> OK
> 时间: 0.066s
```

![1698421203659](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698421203659.png)

```sql
explain select * from employees order by name limit 9000, 5;
```

![1698421230058](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698421230058.png)

根据`执行计划`得，使用了全表扫描（type=ALL），并且 Extra 列为 using filesort，原因是联合索引为（name，age，position），但是使用了 select \* 中有的列并不在联合索引中，如果使用索引还需要回表，因此 mysql 直接进行全表扫描





**优化 sql**

`优化的点在于：`让在排序时返回的字段尽量为覆盖索引，这样就会走索引并且还会使用索引排序

先让排序和分页操作查出主键，再根据主键查到对应记录

```sql
select * from employees e inner join (select id from employees order by name limit 9000, 5) ed on e.id = ed.id;
> OK
> 时间: 0.032s
```

![1698421454673](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698421454673.png)

```sql
explain select * from employees e inner join (select id from employees order by name limit 9000, 5) ed on e.id = ed.id;
```

![1698421472937](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698421472937.png)

根据`执行计划`得，优化后查询走了索引，并且排序使用了索引排序





**总结**

- 优化后，sql 语句的执行时间时原 sql 的一半







### in 和 exists 优化

原则：小表驱动大表

`in：`当 B 表的数据集小于 A 表的数据集时，使用 `in`

```sql
select * from A where id in (select id from B)
```



`exists：`当 A 表的数据集小于 B 表的数据集时，使用 `exists`

将主查询 A 的数据放到子查询 B 中做条件验证，根据验证结果（true 或 false）来决定主查询的数据是否保留

```sql
select * from A where exists (select 1 from B where B.id = A.id)
```



**总结**

- exists 只返回 true 或 false，因此子查询中的 select * 也可以用 select 1 替换



### count(\*)查询优化

```sql
‐‐ 临时关闭mysql查询缓存，为了查看sql多次执行的真实时间
set global query_cache_size=0;
set global query_cache_type=0;
EXPLAIN select count(1) from employees;
EXPLAIN select count(id) from employees;
EXPLAIN select count(name) from employees;
EXPLAIN select count(*) from employees;
```

![1698458884241](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698458884241.png)



`分析：`4 条 sql 语句的执行计划一样，说明这 4 个 sql 的执行效率差不多





**总结**

- 当字段有索引，执行效率：`count(*) ≈ count(1) > count(字段) > count(主键id)`

  如果字段有索引，走二级索引，二级索引存储的数据比主键索引少，所以 `count(字段)` 比 `count(主键id)` 效率更高

- 当字段无索引，执行效率：`count(*) ≈ count(1) > count(主键id) > count(字段)`

- `count(1)` 和 `count(*)` 比较

  - `count(1)` 不需要取出字段统计，使用常量 1 做统计，`count(字段)` 还需要取出字段，所以理论上 `count(1)` 比 `count(字段)` 快

  - `count(*)` 是例外，mysql 并不会把全部字段取出来，会忽略所有的列直接，效率很高，所以不需要用

    `count(字段)` 或 `count(常量)` 来替代 `count(*)`

- 为什么对于 `count(id)`，mysql最终选择辅助索引而不是主键聚集索引？因为二级索引相对主键索引存储数据更少，检索

  性能应该更高，mysql内部做了点优化（在5.7版本才优化）。









## 了解 MVCC 吗？

答：

MVCC（Multi-Version Concurrency Control） 是用来保证 MySQL 的事务隔离性的，对一行数据的读和写两个操作默认是不会通过加锁互斥来保证隔离性，避免了频繁加锁互斥，而在串行化隔离级别为了保证较高的隔离性是通过将所有操作加锁互斥来实现的。



**MySQL 在`读已提交`和`可重复读`隔离级别下都实现了 MVCC 机制，ReadView 生成规则为：**

- 在读已提交隔离级别下，ReadView 生成的时机是每个 Select 生成一个 ReadView
- 在可重复读隔离级别下，ReadView 生成的时机是每个事务生成一个 ReadView

MVCC 是基于 **undolog**、**版本链**、**readview** 实现的。

![MVCC](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/MVCC.png)

在每次更新或者删除数据时，都会将操作记录在 `undo 日志`中，每条 `undo 日志` 通过 `roll_pointer` 进行关联，构成了数据的`版本链`



**ReadView** 中包含以下参数：

- m_ids：表示生成 ReadView 时，当前系统中活跃（未提交）的事务 id 数组
- min_trx_id：表示生成 ReadView 时，当前系统中活跃的事务中最小的事务 id，也就是 m_ids 中的最小值
- max_trx_id：表示生成 ReadView 时，已经创建的最大事务 id`（事务创建时，事务 id 是自增的）`
- creator_trx_id：表示生成 ReadView 的事务的事务 id



那么在事务里的 sql 查询会根据 ReadView 去数据的版本链中判断哪些数据是可见的：

1. 如果 row 的 trx_id < min_trx_id，表示这一行数据的事务 id 比 ReadView 中活跃事务的最小 id 还要小，表示这行数据是已提交事务生成的，因此该行数据可见
2. 如果 row 的 trx_id > max_id，表示这一行数据是由将来启动的事务生成的，不可见（如果 row 的 trx_id 就是当前事务自己的 id，则可见）
3. 如果 row 的 min_id <= trx_id <= max_id，则有两种情况：
   1. 如果 trx_id 在 ReadView 的活跃事务 id 数组（m_ids）中，则表明该事务还未提交，则该行数据不可见
   2. 如果不在，则表明该事务已经提交，可见

**注意：**

- 执行 start transaction 之后，并不会立即生成事务 id，而是在该事务中，第一次修改 InnoDB 时才会为该事务生成事务 id
- MVCC 机制就是通过 ReadView 和 undo 日志进行对比，拿到当前事务可见的数据
- 可重复读隔离级别就是通过 MVCC 机制来实现的



## 了解 BufferPool 缓存机制吗？

答：

**Buffer Pool** 是 MySQL 中的一个很重要的内存结构，MySQL 的增删改查都是直接操作 BufferPool 的，一般设置 BufferPool 的大小为机器内存的 60% ，Buffer Pool 的大小在 `/etc/my.cnf` 中进行配置：

![1698594156950](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698594156950.png)



### 为什么要使用 BufferPool 呢？

**为什么不直接更新磁盘上的数据，而是需要设置一套复杂的机制来执行 SQL 呢？**

因为针对数据库数据的读写其实是随机的读写，而对于日志文件的读写是顺序的读写，而顺序读写和随机读写速度差距在 2~3 个数量级，磁盘的顺序 IO 几乎可以和操作内存相媲美。

通过 BufferPool 可以保证每个更新请求都是更新内存 BufferPool，然后顺序写日志文件，同时可以保证各种异常情况下的数据一致性，正是通过这套配置，才能让我们的 MySQL 数据库在较高配置的机器上每秒可以抗下几千的读写请求



### 为什么说数据库数据的读写是随机 IO 呢？

因为数据库存储在磁盘中的数据是会被删除的，我们在写的时候就算一直顺序写，但是如果后边删除了中间的一些数据，那么在之后读就不能顺序读了，因为中间有一些数据已经不存在了



### InnoDB 更新数据的 SQL 执行流程：

![BufferPool](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/BufferPool-7301788257.png)

1、如果需要更新的数据不在缓冲池中，就先去磁盘中加载数据页，把需要修改数据所在的数据页，缓存到 BufferPool，`BufferPool 中缓存的其实就是一个个的数据页`

2、修改记录前，写 undo 日志，记录更改前数据，如果事务执行失败，使用 undo 日志进行数据回滚

3、更新 Buffer Pool 中的数据，并且将 redo log 写到 redo buffer 中

4、提交事务时，会做两件事情：将 bin log 日志写入到磁盘，保存操作记录；将 redo buffer 中的 redo log 刷到磁盘中去，保存操作记录。

bin log 会按照一定的策略刷新到磁盘中去（通过 innodb_flush_log_at_trx_commit 参数来控制）

当 bin log 成功写入到磁盘后，接着就会完成事务的最终提交，之后会将更新的 bin log 的文件名称以及 bin log 日志在文件里的位置都写入到 redo log 中去，并且在 redo log 里写入一个 commit 标记

5、数据持久化，IO 线程不定期把 Buffer Pool 中的数据随机写入到磁盘，完成持久化



**在 redo log 中写入 commit 标记的原因：**

在 redo 日志中记录 commit 标记是为了保证事务提交之后，redo log与 bin log 数据一致

可以假设一种情况：当 bin log 刚写入磁盘之后，MySQL 宕机了，此时 redo log 还没有写入，那么此时就会出现数据的不一致现象

因此，当 bin log 写入磁盘成功后，在 redo log 中加上 commit 标记，这样即使在 bin log 写入磁盘后，MySQL 宕机了，此时 redo log 还没有加上 commit 标记，因此就认为此次事务执行失败



### bin log、redo log、undo log 作用：

- bin log：bin log 叫做归档日志，主要记录了做了什么操作，比如更新一行数据，bin log 就记录了对哪一行数据做更改，更新前的值是什么，更新为了什么值。bin log 日志是用于恢复磁盘中的数据

  **其中 redo 日志和 undo 日志是 InnoDB 引擎特有的，而 bin log 是属于 Server 层的，与存储引擎无关**

- redo log：redo log 叫做重做日志，用于恢复 BufferPool 中的数据

- undo log：用于进行数据的回滚


### redo log 如何恢复 BufferPool 中的数据呢？

如果 MySQL 在 BufferPool 中修改过数据之后宕机了，此时 BufferPool 中的数据还没有来得及刷到磁盘中，而 BufferPool 是在内存中的，因此里边的数据会在宕机之后会全部丢失

而 redo log 就是用于恢复 BufferPool 中的数据，在 BufferPool 中修改数据后，会将 redo log 写入到 redo buffer 中，此时 redo log 还没有刷到磁盘中去，如果 MySQL 宕机的话，redo log 也会丢失，而当提交事务之后，会将 redo log 刷到磁盘中去，此时 MySQL 宕机的话，也可以根据磁盘中的 redo log 将这一次的更新操作给恢复到 BufferPool 中



### redo log 的刷盘策略：

redo log 的刷盘策略通过 `innodb_flush_log_at_trx_commit` 参数来配置

- `innodb_flush_log_at_trx_commit` 值为 0 时：提交事务时，不会把 redo buffer 中的数据刷入到磁盘中（一般不使用）
- `innodb_flush_log_at_trx_commit` 值为 1 时：提交事务时，必须把 redo buffer 中的数据刷入到磁盘中（建议使用）
- `innodb_flush_log_at_trx_commit` 值为 2 时：提交事务时，把 redo buffer 中的数据写入到 os cache 中，而不是直接写入磁盘，过一会再写入磁盘，此时如果机器宕机的话，os cache 中的数据也会丢失（一般不使用）




### 深入探讨 redo log 的作用

我们知道 MySQL 在 BufferPool 中修改过数据之后，会先将修改数据的动作写到 redo log 中去

**那么为什么不直接将修改的数据刷入磁盘呢？**

如果直接将修改的数据刷入磁盘的话，会触发磁盘的 **随机读写** ，这个操作是很慢的，并且如果提交事务之后，如果 BufferPool 中的数据没来得及刷到磁盘中，MySQL 就宕机的话，会导致 BufferPool 中的数据丢失，导致提交的事务数据并没有更新到磁盘中去

![1707462191681](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1707462191681.png)

**因此 redo log 提供两个功能：高性能的写操作、保证数据不丢失**

接下来说一下 redo log 是如何实现这两个功能

- 首先对于 **高性能的写操作** 来说，当我们去 MySQL 中更新数据，先不直接将数据刷到磁盘中去，而是先将更新数据的操作给记录到 redo log buffer 中去，再根据 redo log 的刷盘策略写到磁盘中去，日志格式大概为：对表空间 XX 中的数据页 XX 中的偏移量为 XX 的地方更新了数据 XX，**将 redo log 刷入磁盘使用的是磁盘的顺序写**，性能几乎和内存读写相当

  并且如果没有 redo log 的话，假如只修改了一个数据页中的一小部分数据，那么事务提交之后，我们需要将这整个数据页都给刷回磁盘中去，而使用 redo log 只需要将修改这一小部分数据的操作记录给追加到 redo log 中去，可以大量减少写入磁盘的数据大小，因此 redo log 极大程度提升了数据库写操作的性能！

- 对于 **保证数据不丢失** 来说，当事务提交之后，就会将 redo log 按照对应的刷盘策略给刷回磁盘中去，那么只要 redo log 被刷到磁盘之后，就算 MySQL 宕机了，导致 BufferPool 中的数据全部丢失，此时也可以去磁盘中读取 redo log，通过 redo log 对 BufferPool 中的数据进行重做恢复



**redo log 不停的写会导致占用的磁盘空间越来越大吗？**

其实不会的，默认情况下 redo log 会写入到一个日志目录中去，在该日志目录下会写 redo log，默认会有两个 redo log 的磁盘文件，每个文件大小为 48MB

当第一个 redo log 的磁盘文件写满之后，就会去写第二个 redo log 磁盘文件，写满之后，会重新去写第一个磁盘文件，直接覆盖第一个文件中的 redo log 日志，因此默认情况下，MySQL 会保留 96MB 的 redo log 日志在磁盘中

也可以根据自己的需要来设置 redo log 的存储目录，以及存储文件个数和大小









### bin log 的刷盘策略：

在准备提交事务时，会写入 bin log 到磁盘中去，bin log 也有不同的刷盘策略，通过 `sync_binlog` 参数控制

- `sync_binlog` 值为 0：默认情况，在bin log 写入磁盘的时候，不直接写入磁盘文件，而是先写入到 os cache 中，隔一段时间后再写入到磁盘中去
- `sync_binlog` 值为 1：提交事务时，会强制将 bin log 写入到磁盘中去






### MySQL 的预读机制：

当从磁盘上加载一个数据页时，MySQL 可能会连带着把这个数据页相邻的其他数据页也加载到缓存里去。



**触发 MySQL 的预读机制的场景？**

1. 线性预读：参数 `innodb_read_ahead_threshold` 默认值是 56，表示如果顺序的访问了一个区里的多个数据页，访问的数据页的数量超过了这个阈值，就会触发预读机制，把下一个相邻区中的所有数据页都加载到缓存里去

   查看默认值：`show variables like 'innodb_read_ahead_threshold'`

   ![1698630976445](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698630976445.png)

2. 随机预读：如果 Buffer Pool 里缓存了一个区里的 13 个连续的数据页，而且这些数据页都是比较频繁会被访问的，此时就会直接触发预读机制，把这个区里的其他的数据页都加载到缓存里去。`性能不稳定，在 5.5 中已经被废弃，默认是 OFF`

   `show variables like 'innodb_random_read_ahead'`

   ![1698630938748](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698630938748.png)

   

### LRU 优化—冷热分离

![1698639424959](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698639424959.png)

MySQL 通过使用 LRU 来判断哪些缓存页经常访问，哪些缓存页不常访问，来判断当 BufferPool 缓存被占满之后去淘汰哪些缓存页。

在 MySQL 的 LRU 链表中，采取了 `冷热数据分离的思想` ，LRU 链表被拆为了两部分，一部分是热数据，一部分是冷数据，冷数据默认占比 37%，由 `innodb_old_blocks_pct` 参数控制

> 查看参数：`show variables like 'innodb_old_blocks_pct'`，默认是37





`原理：数据页第一次被加载到缓存页之后，这个缓存页被放在 LRU 链表的冷数据区域的头部，在 1s（可配置） 之后，如果这个缓存页再次配访问，该缓存页才会被移动到热数据区域的头部。`

> 查看参数：`show variables like 'innodb_old_blocks_time'` ，默认是 1000 毫秒（配置多长时间之后访问该缓存页，才将该缓存页加入热数据区域头部）



**为什么 LRU 要进行冷热分离？**

如果不这样优化，在 LRU 只使用一个链表，那么在预读机制中多加载的一些缓存页，可能就在刚加载进缓存时使用一下，之后就不再使用了，如果被放在 LRU 链表头部了，会将频繁访问的缓存页挤在 LRU 链表尾部，最后被淘汰。预读机制和全表扫描加载进来的一大堆缓存页，此时都在冷数据区域里，跟热数据区域里的频繁访问的缓存页时没有关系的。



**LRU 中热数据区域访问的一些优化：**

一般在热数据区域头部的缓存页可能是经常被访问的，所以频繁移动性能不太好，所以 MySQL 对于热数据区域的访问优化了一下，只有在热数据区域的后 3/4 部分的缓存页被访问了，才会被移动到链表头部去（这样就

不会出现链表头部数据频繁交替访问，导致频繁移动链表头部数据）。





### 什么时间将缓存页刷入磁盘呢？

在 MySQL 中会有一个后台线程运行定时任务，定时将 LRU 链表的 **冷数据区域尾部** 的一些缓存页刷入磁盘里去，清空这几个缓存页，将他们加入到 free 链表中（free 链表存放的就是 BufferPool 中的空缓存页的地址）

并且这个后台线程也会在 MySQL 空闲时，将 flush 链表（flush 链表存放的是 BufferPool 中被修改过的缓存页，也称为脏页，脏页都是需要刷回磁盘的）中的缓存页都刷入磁盘中



### 在 BufferPool 中存储的是什么数据呢？

我们在 MySQL 中看到的数据是一个一个的表，表中有一行一行的数据

那么难道 BufferPool 中存储的是一行一行的数据吗？

肯定不是的，我们可以来思考一下，如果 BufferPool 存储一行一行的数据，那么每次一修改数据时，都需要去磁盘中读取一行数据到 BufferPool 中，而磁盘 IO 是很慢的，一次磁盘 IO 只读取一行数据显然不划算！

所以，在 MySQL 的设计中， BufferPool 存储的其实是 **数据页**

MySQL 中将很多行的数据放在一个数据页中，当数据在磁盘文件中存储的时候，就是存储的很多数据页：

![1707303320322](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1707303320322.png)

当数据页进入到 BufferPool 之后，除了数据页之外，每个缓存也还会有对应的描述数据，存储一些数据页的信息，BufferPool 默认大小是 128MB，而数据页大小是 16KB，缓存页大小与数据页大小是相等的，如下：

![1707303987441](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1707303987441.png)

### BufferPool 中缓存页的管理（free、flush链表）

MySQL 在启动的时候，就会在内存区域中初始化 BufferPool，此时 BufferPool 中会直接划分出一个一个的缓存页，初始时所有的缓存也都为空

**那么 BufferPool 如何来管理这些缓存页呢，怎么知道哪些缓存页是空的？（free 链表）**

BufferPool 通过 free 链表来管理空的缓存页，是一个双向链表，由缓存页的描述数据组成，里边有一个 **基础节点** ，可以通过基础节点快速找到开始节点和结束节点，并且基础节点中记录了 free 链表的总节点数：

![1707308646244](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1707308646244.png)



**flush 链表**

当缓存页中数据被修改之后，这个缓存页就变为了脏页，这些脏页此时和磁盘中的数据是不一致的，因此称为 **脏页**

这些脏页就是由 BufferPool 中的 flush 链表来管理的，flush 链表和 free 链表结构一样，都是双向链表

![1707312274987](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1707312274987.png)















## 数据库如何做乐观锁？

通过版本号实现乐观锁，如下面 SQL

```sql
UPDATE table_name SET column1 = new_value, version = version + 1 WHERE id = some_id AND version = old_version;
```

如果 version 未被修改，则允许更新；如果 version 已被修改，则拒绝更新操作

乐观锁适用于并发冲突较少的场景，因为它避免了在读取数据时加锁，从而减少了锁的开销

但是在高并发环境中，如果冲突频繁，乐观锁可能导致大量的重试操作，从而影响性能。在这种情况下，可能需要考虑使用悲观锁或其他并发控制策略









如何保证mysql的RR（用锁和MVCC）





调试过数据库参数吗









mysql主从数据库设计





mysql刷盘原理





SELECT COUNT(*)怎么走索引







已经用了MQ了为什么还会出现mysql连接数过高，怎么优化mysql的性能瓶颈，怎么分库分表？

mysql 连接数过高的原因？？？







MySql怎么删除数据。







delete和truncate的区别（不会）







写查询语句的时候应该从哪些方面考虑来注意性能。







什么是联合索引，为什么要建联合索引？









a,b,c,d，四个字段，查询语句的where条件a=b，orderby c。（mysql翻页越翻越慢怎么优化，满足a=b的字段很多，怎么高效的排序，分页查询）







SQL explain 会输出哪些信息？







sql怎么手动加锁







mysql 的三大日志？

> 1. mysql 的事务隔离级别？各自解决了什么问题？mvcc的流程？

> 1. mysql 性能怎么优化？

索引（比如覆盖索引、最左前缀匹配原则）、表结构（选择合适的字段属性和数据类型）、SQL基本编写规范、优化慢SQL（慢SQL定位、Explain 命令使用）、分库分表和读写分离、加强运维（比如通过一些监控工具监控慢 SQL）

可以先聊慢SQL定位以及EXPLAIN 命令的应用，再聊索引、表结构以及SQL基本编写规范，分库分表和读写分离这些最后考虑。如非迫不得已，一定不需要选择分库分表，带来的问题不少

读写分离：https://javaguide.cn/high-performance/read-and-write-separation-and-library-subtable.html

https://javaguide.cn/database/mysql/mysql-high-performance-optimization-specification-recommendations.html

> 1. 索引失效七种？



> 1. mysql 的三大 log 的执行时机？redolog刷盘时机？



> 1. 一条模糊查询语句，查询速度越来越慢怎么排查？

从两个方面进行排查：

1. 确认是否建立了索引
2. 确认索引是否生效



> 1. MySQL 新旧数据同步，怎么切流量使同步更平滑？







> 1. 分布式数据库的主从怎么做的？（读写分离）







> 1. 如果主数据库崩了怎么办？



