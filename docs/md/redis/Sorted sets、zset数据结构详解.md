# Sorted sets、zset数据结构详解

## 0 前言

有序集合，去重但可排序，写进去时候给个分数，可自定义排序规则。如根据时间排序，则写时可用时间戳作分数。

排行榜：将每个用户及其对应分数写进去。

```bash
127.0.0.1:6379> zadd board 1.0 JavaEdge
(integer) 1
```

获取排名前100的用户：

```bash
127.0.0.1:6379> zrevrange board 0 99
1) "JavaEdge"
```

用户在排行榜里的排名：

```bash
127.0.0.1:6379> zrank board JavaEdge
(integer) 0
```

```bash
127.0.0.1:6379> zadd board 85 zhangsan
(integer) 1
127.0.0.1:6379> zadd board 72 wangwu
(integer) 1
127.0.0.1:6379> zadd board 96 lisi
(integer) 1
127.0.0.1:6379> zadd board 62 zhaoliu
(integer) 1

# 获取排名前3的用户
127.0.0.1:6379> zrevrange board 0 3
1) "lisi"
2) "zhangsan"
3) "wangwu"
4) "zhaoliu"

127.0.0.1:6379> zrank board zhaoliu
(integer) 1
```

类似Map的KV对，但有序

- K ：key-value对中的键，在一个Sorted-Set中不重复
- V ： 浮点数，称为 score
- 有序 ：内部按照score 从小到大的顺序排列

## 1 API

由于SortedSet本身包含排序信息，在普通Set基础，SortedSet新增一系列排序相关操作：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTI2OTNlZDUxNGU0Njc5MTgucG5n?x-oss-process=image/format,png)

## 2 数据结构

SortedSet的valueObject内部结构有两种：

### 2.1 ziplist

![](https://img-blog.csdnimg.cn/20200911183043109.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

类似Map，由于SortedSet包含Score的排序信息，ziplist内部的KV元素对的排序方式也是按Score递增排序，意味着每次插入数据都要移动之后的数据，因此ziplist适于元素个数不多，元素内容不大的场景。

### 2.2 skiplist+hashtable

![](https://img-blog.csdnimg.cn/20200911183355830.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
更通用的场景，Sorted-Set使用sliplist来实现。

### zskiplist

和通用的跳表不同的是，Redis为每个level 对象增加了span 字段，表示该level 指向的forward节点和当前节点的距离，使得getByRank类的操作效率提升

- 数据结构
  ![](https://img-blog.csdnimg.cn/20200911184359226.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
- 结构示意图![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTk5OGJhNjJjZTQ1MTE1YTcucG5n?x-oss-process=image/format,png)

每次向skiplist 中新增或者删除一个节点时，需要同时修改图标中红色的箭头，修改其forward和span的值。

需要修改的箭头和对skip进行查找操作遍历并废弃过的路径是吻合的。span修改仅是+1或-1。
zskiplist 的查找平均时间复杂度 O(Log(N))，因此add / remove的复杂度也是O(Log(N))。因此Redis中新增的span 提升了获取rank（排序）操作的性能，仅需对遍历路径相加即可（矢量相加）。

还有一点需要注意的是，每个skiplist的节点level 大小都是随机生成的（1-32之间）。

- zskiplistNode源码
  ![](https://img-blog.csdnimg.cn/20200911185457885.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

### hashtable

zskiplist 是zset 实现顺序相关操作比较高效的数据结构，但是对于简单的zscore操作效率并不高。Redis在实现时，同时使用了Hashtable和skiplist，代码结构如下：
![](https://img-blog.csdnimg.cn/20200911190122653.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
Hash表的存在使得Sorted-Set中的Map相关操作复杂度由O(N)变为O(1)。

Redis有序集合类型与Redis的集合类型类似，是非重复的String元素的集合。不同之处在于，有序集合中的每个成员都关联一个Score，Score是在排序时候使用的，按照Score的值从小到大进行排序。集合中每个元素是唯一的，但Score有可能重复。

使用有序集合可以很高效的进行，添加，移除，更新元素的操作（时间消耗与元素个数的对数成比例）。由于元素在集合中的位置是有序的，使用get ranges by score或者by rank（位置）来顺序获取或者随机读取效率都很高。（本句不确定，未完全理解原文意思，是根据自己对Redis的浅显理解进行的翻译）访问有序集合中间部分的元素也非常快，所以可以把有序集合当做一个不允许重复元素的智能列表，你可以快速访问需要的一切：获取有序元素，快速存在测试，快速访问中间的元素等等。

简短来说，使用有序集合可以实现很多高性能的工作，这一点在其他数据库是很难实现的。

## 3 应用

- 在大型在线游戏中创建一个排行榜，每次有新的成绩提交，使用[ZADD]命令加入到有序集合中。可以使用[ZRANGE]命令轻松获得成绩名列前茅的玩家，你也可以使用[ZRANK]根据一个用户名获得该用户的分数排名。把ZRANK 和 ZRANGE结合使用你可以获得与某个指定用户分数接近的其他用户。这些操作都很高效。
- 有序集合经常被用来索引存储在Redis中的数据。比如，如果你有很多用户，用Hash来表示，可以使用有序集合来为这些用户创建索引，使用年龄作为Score，使用用户的ID作为Value，这样的话使用[ZRANGEBYSCORE]命令可以轻松和快速的获得某一年龄段的用户。zset有个ZSCORE的操作，用于返回单个集合member的分数，它的操作复杂度是O(1)，这就是收益于你这看到的hash table。这个hash table保存了集合元素和相应的分数，所以做ZSCORE操作时，直接查这个表就可以，复杂度就降为O(1)了。

而跳表主要服务范围操作，提供O(logN)的复杂度。