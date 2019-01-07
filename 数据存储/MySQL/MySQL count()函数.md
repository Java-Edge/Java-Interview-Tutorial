为统计记录数，由SELECT返回。假如有如下数据：
- 所有记录
![](https://img-blog.csdnimg.cn/img_convert/bdc833650ffa00c374d040b6a3645fab.png)
- 统计行的总数
![](https://img-blog.csdnimg.cn/img_convert/45f4593176cfd0f35a4214394690d6b7.png)
- 计算 Zara 的记录数
![](https://img-blog.csdnimg.cn/img_convert/e04db05f173e28beac8991188a9ecff8.png)

count(1)、count(*) 都是检索表中所有记录行的数目，不论其是否包含null值。
count(1)比count(*)效率高。

count(字段)是检索表中的该字段的**非空**行数，不统计这个字段值为null的记录。

任何情况下最优选择

```sql
SELECT COUNT(1) FROM tablename
```
尽量减少类似：
```java
SELECT COUNT(*) FROM tablename WHERE COL = 'value' 
```
杜绝：

```java
SELECT COUNT(COL) FROM tablename WHERE COL2 = 'value' 
```

如果表没有主键，那么count（1）比count（*）快
如果有主键，那么count（主键，联合主键）比count（*）快
如果表只有一个字段，count（*）最快

count(1)跟count(主键)一样，只扫描主键。
count(*)跟count(非主键)一样，扫描整个表
明显前者更快一些。
# 执行效果
## count(1) V.S count(*)
当表的数据量大些时，对表作分析之后，使用count(1)还要比使用count(*)用时多！
 
从执行计划来看，count(1)和count(*)的效果是一样的。 但是在表做过分析之后，count(1)会比count(*)的用时少些（1w以内数据量），不过差不了多少。 
 
如果count(1)是聚索引,id,那肯定是count(1)快。但是差的很小的。 
因为count(*) 会自动优化指定到那一个字段。所以没必要去count(1)，用count(*)，sql会帮你完成优化的 因此：count(1)和count(*)基本没有差别！ 
 
## count(1) and count(字段)
- count(1) 会统计表中的所有的记录数，包含字段为null 的记录
- count(字段) 会统计该字段在表中出现的次数，忽略字段为null 的情况。即不统计字段为null 的记录。 

## count(*) 和 count(1)和count(列名)区别  

执行效果上：  
count(*)包括了所有的列，相当于行数，在统计结果的时候，不会忽略列值为NULL  
count(1)包括了忽略所有列，用1代表代码行，在统计结果的时候，不会忽略列值为NULL  
count(列名)只包括列名那一列，在统计结果的时候，会忽略列值为空（这里的空不是只空字符串或者0，而是表示null）的计数，即某个字段值为NULL时，不统计。

# 执行效率
列名为主键，count(列名)会比count(1)快  
列名不为主键，count(1)会比count(列名)快  
如果表多个列并且没有主键，则 count（1） 的执行效率优于 count（*）  
如果有主键，则 select count（主键）的执行效率是最优的  
如果表只有一个字段，则 select count（*）最优。
# 实例
![](https://img-blog.csdnimg.cn/bb6fd75177d9428abfaa837ef5879604.png)
![](https://img-blog.csdnimg.cn/fda1c0fe3b09444a80c138d1806bea59.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

```sql
select name, count(name), count(1), count(*), count(age), count(distinct(age))
from counttest
group by name;
```
![](https://img-blog.csdnimg.cn/9f7da59b31ad4ae78c41efcbfaf303c7.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

MyISAM有表元数据的缓存，例如行，即COUNT(*)值，对于MyISAM表的COUNT(*)无需消耗太多资源，但对于Innodb，就没有这种元数据，CONUT（*）执行较慢。