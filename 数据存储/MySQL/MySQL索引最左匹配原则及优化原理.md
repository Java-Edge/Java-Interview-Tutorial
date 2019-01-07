# 1  索引的好处
- 大大减少存储引擎需要扫描的数据量
- 排序以避免使用临时表
- 把随机I/O变为顺序I/O

# 2  实例
执行 select * from T where k between 3 and 5，需要几次树的搜索，扫描多少行？


- 创建表
![](https://img-blog.csdnimg.cn/20200717010752915.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 插入数据![](https://img-blog.csdnimg.cn/20200717011210977.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- InnoDB索引组织结构
![](https://img-blog.csdnimg.cn/20200717011304619.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

SQL查询语句的执行流程：
1. 在k索引树找到k=3，取得 ID 300
2. 再到ID树查到ID 300对应的R3
3. 在k树取下个值5，取得ID 500
4. 再回到ID树查到ID 500对应R4
5. 在k树取下个值6，不满足条件，循环结束

回到主键索引树搜索的过程，称为回表。
查询过程读了k索引树的3条记录（步骤135），回表两次（24）
由于查询结果所需数据只在主键索引有，不得不回表。那么，有无可能经过索引优化，避免回表？

# 3 覆盖索引
执行语句
select ID from T where k between 3 and 5

只需查ID值，而ID值已在k索引树，因此可直接提供结果，不需回表。即在该查询，索引k已“覆盖”我们的查询需求，称为覆盖索引。

覆盖索引可减少树的搜索次数，显著提升查询性能，使用覆盖索引是个常用性能优化手段。

使用覆盖索引在索引k上其实读了三个记录，R3~R5（对应的索引k上的记录项）
但对于Server层，就是找引擎拿到两条记录，因此MySQL认为扫描行数是2。

## 问题
在一个市民信息表，有必要将身份证号和名字建立联合索引？

假设这个市民表的定义：
```sql
CREATE TABLE `tuser` (
  `id` int(11) NOT NULL,
  `id_card` varchar(32) DEFAULT NULL,
  `name` varchar(32) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `ismale` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_card` (`id_card`),
  KEY `name_age` (`name`,`age`)
) ENGINE=InnoDB
```
身份证号是市民唯一标识。有根据身份证号查询市民信息的，只要在身份证号字段建立索引即可。再建立一个（身份证号、姓名）联合索引，是不是浪费空间？

如果现在有一个高频请求，根据身份证号查询姓名，联合索引就有意义了。可在这个高频请求上用到覆盖索引，不再回表查整行记录，减少了执行时间。
当然索引字段的维护总是有代价。建立冗余索引支持覆盖索引就需权衡考虑。

# 2 何时用索引
(1) 定义有主键的列一定要建立索引 : 主键可以加速定位到表中的某行
(2) 定义有外键的列一定要建立索引 : 外键列通常用于表与表之间的连接，在其上创建索引可以加快表间的连接
(3) 对于经常查询的数据列最好建立索引
 ① 对于需要在指定范围内快速或频繁查询的数据列，因为索引已经排序，其指定的范围是连续的，查询可以利用索引的排序，加快查询的时间
② 经常用在 `where`子句中的数据列，将索引建立在`where`子句的集合过程中，对于需要加速或频繁检索的数据列，可以让这些经常参与查询的数据列按照索引的排序进行查询，加快查询的时间

如果为每一种查询都设计个索引，索引是不是太多？
如果我现在要按身份证号去查家庭地址？虽然该需求概率不高，但总不能让它全表扫描？
但单独为一个不频繁请求创建（身份证号，地址）索引又有点浪费。怎么做？

B+树这种索引，可利用索引的“最左前缀”，来定位记录。

为了直观地说明这个概念，用（name，age）联合索引分析。
![](https://img-blog.csdnimg.cn/20200717013408249.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

索引项按照索引定义出现的字段顺序排序。

当逻辑需求是查到所有名字“张三”的，可快速定位到ID4，然后向后遍历得到所有结果。
要查所有名字第一个字“张”的，条件"where name like ‘张%’"。也能够用上索引，查找到第一个符合条件的记录是ID3，然后向后遍历，直到不满足。

不只是索引的全部定义，只要满足最左前缀，就可利用索引加速。
最左前缀可以是
- 联合索引的最左N个字段
- 字符串索引的最左M个字符


## 联合索引内的字段顺序
- 标准
索引的复用能力。因为可以支持最左前缀，所以当已经有了(a,b)这个联合索引后，一般就不需要单独在a上建立索引了。
- 原则
如果调整顺序，可少维护一个索引，那么这顺序优先考虑。

为高频请求创建(身份证号，姓名）联合索引，并用这索引支持“身份证号查地址”需求。

如果既有联合查询，又有基于a、b各自的查询？
查询条件里只有b的，无法使用(a,b)联合索引，这时不得不维护另外一个索引，即需同时维护(a,b)、(b) 两个索引。
- 这时要考虑原则就是空间
比如市民表，name字段比age字段大 ，建议创建一个（name,age)的联合索引和一个(age)的单字段索引

# 3 索引优化
MySQL的优化主要分为
- 结构优化（Scheme optimization）
- 查询优化（Query optimization）

讨论的高性能索引策略主要属于结构优化。

为了讨论索引策略，需要一个数据量不算小的数据库作为示例
选用MySQL官方文档中提供的示例数据库之一：employees
这个数据库关系复杂度适中，且数据量较大。下图是这个数据库的E-R关系图（引用自MySQL官方手册）：

![图12 示例数据库](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtOWMyNWFkYWY5YjE4MmMxZi5wbmc?x-oss-process=image/format,png)
## 3.1  最左前缀原理与相关优化
要知道什么样的查询会用到索引，和B+Tree中的“最左前缀原理”有关。

### 联合索引（又名复合索引）
MySQL中的索引可以以一定顺序引用多列，这种索引叫做`联合索引`，是个有序元组<a1, a2, …, an>。

`如何选择索引列的顺序`
- 经常会被使用到的列优先
- 选择性高的列优先
- 宽度小的列优先
### 覆盖索引(Covering Indexes)
包含满足查询的所有列。

只需读索引而不用读数据，大大提高查询性能。

#### 优点
(1)索引项通常比记录要小，使得MySQL访问更少的数据
(2)索引都按值排序存储，相对于随机访问记录，需要更少的I/O
(3)大多数据引擎能更好的缓存索引。比如MyISAM只缓存索引
(4)覆盖索引对于InnoDB表尤其有用，因为InnoDB使用`聚集索引`组织数据，如果二级索引中包含查询所需的数据，就不再需要在聚集索引中查找了

覆盖索引只有B-TREE索引存储相应的值
并不是所有存储引擎都支持覆盖索引(Memory/Falcon)
![覆盖索引](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtYjVjYjQxMjZiMjdhNmVhYi5wbmc?x-oss-process=image/format,png)

对于索引覆盖查询(index-covered query)，使用`EXPLAIN`时，可以在`Extra`列中看到`Using index`

在大多数引擎中，只有当查询语句所访问的列是索引的一部分时，索引才会覆盖
但是，`InnoDB`不限于此，`InnoDB`的二级索引在叶节点中存储了primary key的值
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMzZhMDFiZGViZjEwMGMzMC5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtZjRhZGFjYzBmMzFiYzE5MC5wbmc?x-oss-process=image/format,png)
![使用覆盖索引查询数据](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtNDgyMjZmZDBmODJhZTI2Yi5wbmc?x-oss-process=image/format,png)
![select *不能用覆盖索引](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtNzdmOTE4ZWE5N2Y1YTlmYi5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMmE4MDczODI3NDcxNWI1MC5wbmc?x-oss-process=image/format,png)

以employees.titles表为例，下面先查看其上都有哪些索引：
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtNDY2ZWMxOWI2YmJmYWI5Mi5wbmc?x-oss-process=image/format,png)
从结果中可以看到titles表的主索引为<emp_no, title, from_date>，还有一个辅助索引<emp_no>
为了避免多个索引使事情变复杂（MySQL的SQL优化器在多索引时行为比较复杂），我们将辅助索引drop掉
```
ALTER TABLE employees.titles DROP INDEX emp_no;
```
这样就可以专心分析索引PRIMARY
#### 情况一：全值匹配
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtZmFmZmY5MTVmZGQwOWY2NC5wbmc?x-oss-process=image/format,png)
很明显，当按照索引中所有列进行精确匹配（这里精确匹配指“=”或“IN”匹配）时，索引可以被用到。
这里有一点需要注意，理论上`索引对顺序敏感`，但是由于MySQL的查询优化器会自动调整where子句的条件顺序以使用适合的索引
例如我们将where中的条件顺序颠倒
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtNGNkMzNiNDkyNzkyNmZlMy5wbmc?x-oss-process=image/format,png)
效果是一样的
#### 情况二：最左前缀匹配
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtZDQzZTMyZjk3ZmFmNDYzNS5wbmc?x-oss-process=image/format,png)
当查询条件精确匹配索引的左边连续一个或几个列时，如<emp_no>或<emp_no, title>，所以可以被用到，但是只能用到一部分，即条件所组成的最左前缀
上面的查询从分析结果看用到了PRIMARY索引，但是key_len为4，说明只用到了索引的第一列前缀
#### 情况三：查询条件用到了索引中列的精确匹配，但是中间某个条件未提供
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtYzk5NzM1ZjI1OWQwZTRhMi5wbmc?x-oss-process=image/format,png)
此时索引使用情况和情况二相同，因为title未提供，所以查询只用到了索引的第一列，而后面的`from_date`虽然也在索引中，但是由于`title`不存在而无法和左前缀连接，因此需要对结果进行过滤`from_date`（这里由于`emp_no`唯一，所以不存在扫描）
如果想让`from_date`也使用索引而不是where过滤，可以增加一个辅助索引`<emp_no, from_date>`，此时上面的查询会使用这个索引
除此之外，还可以使用一种称之为“隔离列”的优化方法，将`emp_no`与`from_date`之间的“坑”填上

首先我们看下title一共有几种不同的值
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtOTY1ZThjYjUwODk5Nzk0OS5wbmc?x-oss-process=image/format,png)
只有7种
在这种成为“坑”的列值比较少的情况下，可以考虑用“IN”来填补这个“坑”从而形成最左前缀
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMGJhYzRlODIxM2EzOWQ1Mi5wbmc?x-oss-process=image/format,png)
这次key_len为59，说明索引被用全了，但是从type和rows看出IN实际上执行了一个range查询，这里检查了7个key。看下两种查询的性能比较：
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMzI1YzU4NjY4NWZkNTEzYi5wbmc?x-oss-process=image/format,png)
“填坑”后性能提升了一点。如果经过emp_no筛选后余下很多数据，则后者性能优势会更加明显。当然，如果title的值很多，用填坑就不合适了，必须建立辅助索引
### 情况四：查询条件没有指定索引第一列
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtYmYyZTY5OGIxOGUzYWYyZi5wbmc?x-oss-process=image/format,png)
由于不是最左前缀，这样的查询显然用不到索引
### 情况五：匹配某列的前缀字符串
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtZGQxNTJmNGZjOGUzYjEyZi5wbmc?x-oss-process=image/format,png)
此时可以用到索引，通配符%不出现在开头，则可以用到索引，但根据具体情况不同可能只会用其中一个前缀
### 情况六：范围查询(由于B+树的顺序特点,尤其适合此类查询)
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtYWY0MzMxMDFhYjAxYmI0NS5wbmc?x-oss-process=image/format,png)
- 范围列可以用到索引（必须是最左前缀），但是范围列后面的列无法用到索引
- 索引最多用于一个范围列，因此如果查询条件中有两个范围列则无法全用到索引
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtOTg1NGNjMGFhZGI5MTAxYy5wbmc?x-oss-process=image/format,png)
- 可以看到索引对第二个范围索引无能为力。这里特别要说明MySQL一个有意思的地方，那就是仅用explain可能无法区分范围索引和多值匹配，因为在type中这两者都显示为range
- 用了“between”并不意味着就是范围查询，例如下面的查询：
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtZDFjZTBkZjBjZTg1NmRkNC5wbmc?x-oss-process=image/format,png)

看起来是用了两个范围查询，但作用于emp_no上的“BETWEEN”实际上相当于“IN”，也就是说emp_no实际是多值精确匹配。可以看到这个查询用到了索引全部三个列。因此在MySQL中要谨慎地区分多值匹配和范围匹配，否则会对MySQL的行为产生困惑。
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtYTcyMjAwMjNmNjNiMmFjMS5wbmc?x-oss-process=image/format,png)

### 情况七：查询条件中含有函数或表达式
如果查询条件中含有函数或表达式，则MySQL不会为这列使用索引（虽然某些在数学意义上可以使用）
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtNjFhYjY4N2U2MGE3YmE0ZS5wbmc?x-oss-process=image/format,png)
虽然这个查询和情况五中功能相同，但是由于使用了函数left，则无法为title列应用索引，而情况五中用LIKE则可以。再如：
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMzIwOGU2NzgzNzRmNDMyZC5wbmc?x-oss-process=image/format,png)
显然这个查询等价于查询emp_no为10001的函数，但是由于查询条件是一个表达式，MySQL无法为其使用索引。看来MySQL还没有智能到自动优化常量表达式的程度，因此在写查询语句时尽量避免表达式出现在查询中，而是先手工私下代数运算，转换为无表达式的查询语句。
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtYTdiNjNiYjlhODU3ZTI5Ni5wbmc?x-oss-process=image/format,png)


最左前缀可用于在索引中定位记录。那不符合最左前缀的部分，会怎么样？

以市民表的联合索引（name, age）为例。
- 需求
检索表中“名字第一个字是张，且年龄是10的所有男孩”

SQL：
```sql
select * from tuser where name like '张%' and age=10 and ismale=1;
```
语句在搜索索引树时，只能用 “张”，找到第一个满足条件记录ID3。还不错，总比全表扫好。然后判断其他条件。
MySQL5.6前，只能从ID3开始个个回表，到主键索引上找数据行，再对比字段值。
5.6引入索引下推优化（index condition pushdown)， 在索引遍历过程，对索引中包含的字段先做判断，直接过滤不满足条件的记录，减少回表。

这两个过程的执行流程图：
- 无索引下推执行流程
![](https://img-blog.csdnimg.cn/20200717015457694.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 索引下推执行流程
![](https://img-blog.csdnimg.cn/20200717015536407.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

两个图里面，每一个虚线箭头表示回表一次。
无索引下推执行流程，在(name,age)索引里特意去掉age的值，这过程InnoDB并不看age的值，只按顺序把“name第一个字是’张’”的记录一条条取出来回表，回表4次。

区别是，InnoDB在(name,age)**索引内部**就开始判断了age是否等于10，对不等10的记录，直接判断并跳过。这个例子中，只需对ID4、ID5这两条记录回表取数据判断，只需回表2次。

## 3.4 Btree索引的限制
- 如果不是从**索引的最左列**开始查找，则无法使用索引
- 使用索引时不能**跳过**索引中的列
- Not in和<>操作无法使用索引
- 若查询中有某列的范围查询，则其右边所有列都无法使用索引


### 3.4.1 即使设置索引，也无法使用
- “%”开头的LIKE语句，模糊匹配
- OR语句前后没有同时使用索引
- 数据类型出现隐式转化（如varchar不加单引号，可能会自动转int型）

### 3.4.2 索引选择性与前缀索引
```sql
CREATE INDEX index_ name ON table(col_ name(n));
```
![](https://img-blog.csdnimg.cn/20200726144819969.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- 索引的选择性
不重复的索引值和表的记录数的比值

#### 既然索引可加速查询，是否只要是查询语句，就建索引?
NO！因为索引虽然加速查询，但索引也有代价：索引文件本身要消耗存储空间。
- 索引会加重插入、删除和修改记录时的负担，增加写操作的成本
- 太多索引会增加查询优化器的分析选择时间
- MySQL在运行时也要消耗资源维护索引

#### 索引并非越多越好，如下情况不推荐建索引
- 对于那些查询中很少涉及的列、重复值比较多的列不要建立索引
例如，在查询中很少使用的列，有索引并不能提高查询的速度，相反增加了系统维护时间和消耗了系统空间
又如，“性别”列只有列值“男”和“女”，增加索引并不能显著提高查询的速度
对于定义为text、image和bit数据类型的列不要建立索引。因为这些数据类型的数据列的数据量要么很大，要么很小，不利于使用索引
- 表记录比较少
例如一两千条甚至只有几百条记录的表，没必要建索引，让查询做全表扫描就好了
- 索引的选择性较低
所谓索引的选择性（Selectivity），是指不重复的索引值（也叫基数，Cardinality）与表记录数（#T）的比值
`Index Selectivity = Cardinality / #T`
显然选择性的取值范围为(0, 1]，选择性越高的索引价值越大，这是由B+Tree的性质决定的。
例如，上文用到的employees.titles表，如果title字段经常被单独查询，是否需要建索引，我们看一下它的选择性
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMDJjOWQ1NzYwY2NhMzQxMy5wbmc?x-oss-process=image/format,png)
title的选择性不足0.0001（精确值为0.00001579），所以实在没有什么必要为其单独建索引

有种与索引选择性有关的优化策略 - 前缀索引。
用列的前缀代替整列作为索引key，当前缀长度合适时，可实现既使得前缀索引的选择性接近全列索引，又因为索引key变短而减少索引文件的大小和维护开销。

以employees.employees表为例介绍前缀索引的选择和使用。

从图12可以看到employees表只有一个索引`<emp_no>`，那么如果我们想按名字搜索人，就只能全表扫描
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtOWRkNjQ2OGM5ZTIwYzg3OC5wbmc?x-oss-process=image/format,png)
如果频繁按名字搜索员工，显然效率很低，考虑建索引。
有两种选择，建
1. <first_name>
2. <first_name, last_name>

看两个索引选择性：
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMDFjYjQ5MTU3NWEwOWM3MC5wbmc?x-oss-process=image/format,png)

<first_name>显然选择性太低，<first_name, last_name>选择性很好。
但first_name和last_name加起来长度30，有没有兼顾长度和选择性的办法？

- 可以考虑用first_name和last_name的前几个字符建立索引，例如<first_name, left(last_name, 3)>，看看其选择性
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtNzEwNWI2NGJkOTY2ZmEwNC5wbmc?x-oss-process=image/format,png)
- 选择性还不错，但离0.9313还是有点距离，那么把last_name前缀加到4
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtNmZhYWQ5ODM5N2QwYWI4MS5wbmc?x-oss-process=image/format,png)

这时选择性已很理想，而该索引长度仅18，比<first_name, last_name>短了一半。
把该前缀索引建上：
1.  ALTER TABLE employees.employees
2.  ADD INDEX `first_name_last_name4`  (first_name, last_name(4));

- 再执行一遍按名字查询，比较建索引前的结果
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtYmJhOTFiOWJkNjBhYmEwNy5wbmc?x-oss-process=image/format,png)
性能提升显著，查询加速120多倍。

前缀索引兼顾索引大小和查询速度，但其
#### 缺点
- 不能用于ORDER BY和GROUP BY
- 也不能用于Covering index（即当索引本身包含查询所需全部数据时，不再访问数据文件本身）

## 索引诗歌
全值匹配我最爱，最左前缀要遵守 带头大哥不能死，中间兄弟不能断 索引列上少计算，范围之后全失效 Like百分写最右，覆盖索引不写* 不等空值还有or，索引失效要少用 字符引号不能丢，SQL高级也不难。

## 3.5  InnoDB的主键选择与插入优化
在使用InnoDB存储引擎时，如果没有特别的需要，请永远使用一个与`业务无关的自增字段`作为主键

经常看到有帖子或博客讨论主键选择问题，有人建议使用业务无关的自增主键，有人觉得没有必要，完全可以使用如学号或身份证号这种唯一字段作为主键。不论支持哪种论点，大多数`论据都是业务层面`的。
如果从`数据库索引优化`角度看，使用InnoDB引擎而不使用自增主键绝对是一个糟糕的主意

上文讨论过InnoDB的索引实现，InnoDB使用聚集索引，数据记录本身被存于主索引（一颗B+Tree）的叶子节点上。这就要求同一个叶子节点内（大小为一个内存页或磁盘页）的各条数据记录按主键顺序存放，因此每当有一条新的记录插入时，MySQL会根据其主键将其插入适当的节点和位置，如果页面达到装载因子（InnoDB默认为15/16），则开辟一个新的页（节点）。

如果表使用自增主键，那么每次插入新的记录，记录就会顺序添加到当前索引节点的后续位置，当一页写满，就会自动开辟一个新的页。如下图所示：

![图13 ](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtZjJmOTdjZjllMGFlMmM4My5wbmc?x-oss-process=image/format,png)
这样就会形成一个紧凑的索引结构，近似顺序填满
由于每次插入时也不需要移动已有数据，因此效率很高，也不会增加很多开销在维护索引上。

如果使用非自增主键（如果身份证号或学号等），由于每次插入主键的值近似于随机，因此每次新纪录都要被插到现有索引页得中间某个位置：
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMzY0MTU0OTMyYzY0ZGQyMy5wbmc?x-oss-process=image/format,png)
此时MySQL不得不为了将新记录插到合适位置而移动数据，甚至目标页面可能已经被回写到磁盘上而从缓存中清掉，此时又要从磁盘上读回来，这增加了很多开销，同时频繁的移动、分页操作造成了大量的碎片，得到了不够紧凑的索引结构，后续不得不通过OPTIMIZE TABLE来重建表并优化填充页面。

因此，只要可以，请尽量在InnoDB上采用自增字段做主键。

与排序（ORDER BY）相关的索引优化及覆盖索引（Covering index）的话题本文并未涉及，
全文索引等等本文也并未涉及