现在主流网站都支持手机号登录，如何在手机号这样的字符串字段建立合适的索引呢？

假设，你现在维护一个支持邮箱登录的系统，用户表是这么定义的：

```sql
create table SUser(
	ID bigint unsigned primary key,
	email varchar(64), 
	... 
)engine=innodb; 
```

要使用邮箱登录，会有语句：
```sql
select f1, f2 from SUser where email='xxx';
```

若email字段无索引，该语句只能全表扫描。

MySQL支持前缀索引，可定义字符串的一部分作为索引。
若创建索引的语句不指定前缀长度，那么索引默认包含整个字符串。

比如，这俩在email字段创建索引的语句：

```sql
alter table SUser add index index1(email);
alter table SUser add index index2(email(6));
```
- 第一个语句创建的index1索引，包含每个记录的整个字符串
![](https://img-blog.csdnimg.cn/202007261526195.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 第二个语句创建的index2索引，对每个记录都只取前6个字节
![](https://img-blog.csdnimg.cn/20200726152700656.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

可见，email(6)索引结构中每个邮箱字段都只取前6字节（zhangs），占用空间更小，这就是前缀索引优势。

这同时带来损失：可能会增加额外的记录扫描次数。

看看下面这语句，在这俩索引定义分别怎么执行。

```sql
select id,name,email from SUser where email='zhangssxyz@xxx.com';
```

如果使用index1，执行顺序如下：
1. 从index1索引树找到满足索引值 'zhangssxyz@xxx.com'的记录，取得ID2的值
2. 到主键上查到主键值是ID2的行，判断email值是正确的，将改行记录加入结果集
3. 取index1索引树上刚刚查到位置的下条记录，发现已不满足email='zhangssxyz@xxx.com’条件，结束循环

该过程，只需回主键索引取一次数据，所以系统认为只扫描一行。

如果使用是index2，执行顺序如下：
1. 从index2索引树找到满足索引值是’zhangs’的记录，找到的第一个是ID1
2. 到主键上查到主键值是ID1的行，判断出email的值不是’zhangssxyz@xxx.com’，该行记录丢弃
3. 取index2上刚刚查到的位置的下条记录，仍是’zhangs’，取出ID2，再到ID索引取整行判断，这次值对，将该行记录加入结果集
4. 重复上一步，直到在idxe2上取值不是’zhangs’，结束循环结束

该过程，要回主键索引取4次数据，即扫描4行。

对比发现，使用前缀索引，可能导致查询语句读数据的次数变多。

但对该查询语句，如果定义index2不是email(6)而是email(7），即取email字段前7字节构建索引，即满足前缀’zhangss’记录只有一个，也能直接查到ID2，只扫描一行结束。

即使用前缀索引，定义好长度，就可做到既节省空间，又不用增加额外太多的查询成本。

要给字符串创建前缀索引
# 1 确定前缀长度
在建立索引时我们关注的是区分度，区分度越高越好。区分度越高，重复的键值越少。因此可通过统计索引上有多少不同值判断要使用多长前缀。

可使用如下语句，计算该列上有多少不同值

```sql
select count(distinct email) as L from SUser;
```
依次选取不同长度前缀来测该值，比如看4~7个字节前缀索引：

```sql
select 
  count(distinct left(email,4)）as L4,
  count(distinct left(email,5)）as L5,
  count(distinct left(email,6)）as L6,
  count(distinct left(email,7)）as L7,
from SUser;
```
使用前缀索引可能会损失区分度，所以需要预先设定一个可接受损失比例，比如5%。
然后，在返回的L4~L7中，找出不小于 L * 95%的值，假设L6、L7都满足时，即可选择前缀长度最短为6。

# 2 前缀索引对覆盖索引的影响
看如下SQL：
```sql
select id,email from SUser where email='zhangssxyz@xxx.com';
```
与前例SQL语句：
```sql
select id,name,email from SUser where email='zhangssxyz@xxx.com';
```
相比，该语句只要求返回id和email。

若使用index1，可利用覆盖索引，从index1查到结果后直接返回，不需回到ID索引再查一次。
而若使用index2（email(6)），得回ID索引再判断email字段值。

即使将index2定义改为email(18)，虽然index2已包含所有信息，但InnoDB还是要回id索引再查，因为系统并不确定前缀索引的定义是否截断了完整信息。
即前缀索引根本用不上覆盖索引对查询的优化，这也是选择是否使用前缀索引时需要考虑的因素。

# 3 其他方案
对类似邮箱这样字段，前缀索引可能还行。但遇到前缀区分度不好的，怎么办？

比如身份证号18位，前6位是地址码，所以同县人身份证号前6位一般相同。
假设维护数据库是个市公民信息系统，若对身份证号做长度6前缀索引，区分度非常低。
可能需创建长度12以上前缀索引，才能够满足区分度要求。

但**索引选取越长，占磁盘空间越大，相同数据页能放下索引值越少，查询效率就越低。**

- 若能确定业务需求只有按身份证进行等值查询的需求，还有没有别的处理方法，既可占用更小空间，也能达到相同查询效率？
Yes！

第一种方式使用
## 3.1 倒序存储
如果存储身份证号时把它倒过来存，每次查询这么写：
```sql
select field_list from t where id_card = reverse('input_id_card_string');
```
由于身份证号最后6位没有地址码这样重复逻辑，所以最后6位可能提供足够的区分度。
实践中也别忘记使用count(distinct)验证区分度哦！

第二种方式是使用
## 3.2 hash字段
可在表再创建整数字段，保存身份证的校验码，同时在该字段创建索引。

```sql
alter table t add id_card_crc int unsigned, add index(id_card_crc);
```
每次插新记录时，同时用crc32()函数得到校验码填到该新字段。
由于校验码可能存在冲突，即两不同身份证号crc32()所得结果可能相同（哈希冲突），所以查询语句where部分要判断id_card值是否精确相同。

```sql
select field_list from t where 
id_card_crc=crc32('input_id_card_string') and id_card='input_id_card_string'
```
这索引长度变4字节，比原来小很多。

## 3.3 倒序存储和使用hash字段异同点
### 相同点
都不支持范围查询。

- 倒序存储的字段上创建的索引
按倒序字符串的方式排序，已无法利用索引查出身份证号码在[ID_X, ID_Y]的所有市民
- hash字段也只支持等值查询

### 区别
#### 占用的额外空间
- 倒序存储在主键索引上，不会消耗额外存储空间
当然，倒序存储使用4字节前缀长度应该不够，若再长点，这消耗和hash字段也差不多了
- hash字段需要加个字段

#### CPU消耗
- 倒序方式每次读写时，都需额外调用次reverse函数
- hash字段需额外调用一次crc32()函数

若只从这俩函数计算复杂度看，reverse函数额外消耗CPU资源较少。

#### 查询效率
- hash字段查询性能较稳定
因为crc32值虽然会冲突，但概率很小，可认为每次查询的平均扫描行数接近1
- 倒序存储
还是前缀索引，即还是会增加扫描行数

# 总结
字符串字段创建索引的场景，可使用的方式如下：
1. 直接创建完整索引，这样可能比较占用空间
2. 创建前缀索引，节省空间，但增加查询扫描次数，且不能使用覆盖索引
3. 倒序存储，再创建前缀索引，用于绕过字符串本身前缀的区分度不足缺陷
4. 创建hash字段索引，查询性能稳定，有额外存储和计算消耗，跟第三种方式一样不支持范围扫描


实际应用中，根据业务字段的特点选择使用哪种方式。


# 思考题
维护学生信息数据库，学生登录名的统一格式是”学号@gmail.com"
学号的则是：十五位的数字，其中前三位是所在城市编号、第四到第六位是学校编号、第七位到第十位是入学年份、最后五位是顺序编号。

系统登录时输入登录名和密码，验证正确后才能继续使用系统。
只考虑登录验证，怎么设计这个登录名的索引呢？
上期我留给你的问题是，给一个学号字段创建索引，有哪些方法。

由于学号规则，无论正向反向前缀索引，重复度都较高。
因为维护的只是一个学校的，因此前面6位（其中，前三位是所在城市编号、第四到第六位是学校编号）固定，邮箱后缀都是@gamil.com，因此可只存入学年份加顺序编号，长度9位。

在此基础，可用数字型存这9位数字。比如201100001，只需占4字节。其实这就是种hash，只是用最简单转换规则：字符串转数字，而刚好我们设定背景，可保证转换结果唯一。

当然了，一个学校的总人数这种数据量，50年才100万学生，这表肯定是小表。为了业务简单，直接存原来的字符串。“优化成本和收益”的思想。