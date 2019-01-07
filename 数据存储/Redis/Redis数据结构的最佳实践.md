# 1 概述
## 数据结构和内部编码
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWEyYzI5MzFmYzlkMGQ1OGEucG5n?x-oss-process=image/format,png)
## 无传统关系型数据库的 Table 模型
schema 所对应的db仅以编号区分。同一 db 内，key 作为顶层模型，它的值是扁平化的。即 db 就是key的命名空间。
key的定义通常以 `:` 分隔，如：`Article:Count:1`
常用的Redis数据类型有：string、list、set、map、sorted-set
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWEwNzBkZWExMTNlYWY4ZDEucG5n?x-oss-process=image/format,png)
## redisObject通用结构
Redis中的所有value 都是以object 的形式存在的，其通用结构如下
![](https://img-blog.csdnimg.cn/2021061610354559.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- type 数据类型
指 string、list 等类型
- encoding 编码方式
指的是这些结构化类型具体的实现方式，同一个类型可以有多种实现。e.g. string 可以用int 来实现，也可以使用char[] 来实现；list 可以用ziplist 或者链表来实现
- lru
本对象的空转时长，用于有限内存下长时间不访问的对象清理
- refcount
对象引用计数，用于GC
- ptr 数据指针
指向以 encoding 方式实现这个对象实际实现者的地址。如：string 对象对应的SDS地址（string的数据结构/简单动态字符串）

## 单线程
![](https://img-blog.csdnimg.cn/20210205224515421.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
### 单线程为何这么快？
- 纯内存
- 非阻塞I/O
- 避免线程切换和竞态消耗
![](https://img-blog.csdnimg.cn/20210205224529469.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 一次只运行一条命令
- 拒绝长(慢)命令
keys, flushall, flushdb, slow lua script, mutil/exec, operate big value(collection)
- 其实不是单线程
fysnc file descriptor
close file descriptor

# 2 string
Redis中的 string 可表示很多语义
- 字节串（bits）
- 整数
- 浮点数

redis会根据具体的场景完成自动转换，并根据需要选取底层的实现方式。
例如整数可以由32-bit/64-bit、有符号/无符号承载，以适应不同场景对值域的要求。

- 字符串键值结构，也能是 JSON 串或 XML 结构
![](https://img-blog.csdnimg.cn/20210205224713852.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
## 内存结构
在Redis内部，string的内部以 int、SDS（简单动态字符串 simple dynamic string）作为存储结构
- int 用来存放整型
- SDS 用来存放字节/字符和浮点型SDS结构
### SDS
```c
typedef struct sdshdr {
    // buf中已经占用的字符长度
    unsigned int len;
    // buf中剩余可用的字符长度
    unsigned int free;
    // 数据空间
    char buf[];
}
```
- 结构图![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQ3OWZlMGFhYzZmYmU0NGQucG5n?x-oss-process=image/format,png)
存储的内容为“Redis”，Redis采用类似C语言的存储方法，使用'\0'结尾（仅是定界符）。
SDS的free 空间大小为0，当free > 0时，buf中的free 区域的引入提升了SDS对字符串的处理性能，可以减少处理过程中的内存申请和释放次数。
### buf 的扩容与缩容
当对SDS 进行操作时，如果超出了容量。SDS会对其进行扩容，触发条件如下：
- 字节串初始化时，buf的大小 = len + 1，即加上定界符'\0'刚好用完所有空间
- 当对串的操作后小于1M时，扩容后的buf 大小 = 业务串预期长度 * 2 + 1，也就是扩大2倍。
- 对于大小 > 1M的长串，buf总是留出 1M的 free空间，即2倍扩容，但是free最大为 1M。
### 字节串与字符串
SDS中存储的内容可以是ASCII 字符串，也可以是字节串。由于SDS通过len 字段来确定业务串的长度，因此业务串可以存储非文本内容。对于字符串的场景，buf[len] 作为业务串结尾的'\0' 又可以复用C的已有字符串函数。
### SDS编码的优化
value 在内存中有2个部分：redisObject和ptr指向的字节串部分。
在创建时，通常要分别为2个部分申请内存，但是对于小字节串，可以一次性申请。

incr userid:pageview (单线程:无竞争)。缓存视频的基本信息(数据源在MySQL)
![](https://img-blog.csdnimg.cn/20210205230250128.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
```java
public VideoInfo get(Long id) {
	String redisKey = redisPrefix + id;
	VideoInfo videoInfo e redis.get(redisKey);
	if (videoInfo == null) {
		videoInfo = mysql.get(id);
		if (videoInfo != null) {
			// 序列化
			redis.set(redisKey serialize(videoInfo)):
		}
	}
}			
```


![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWUwMjdmOWUwYmY4NWQ2MzgucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LThhYmU4MTk1OTZkNzE1ZmYucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQyYzYzMTk4ZDMzZWU2Y2QucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTZlMDM2MWI2NGRhODI1MzMucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTIxZWVjZDkwNzI2MmJjN2QucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTYxYTUwYWI3Y2QzN2FhYjkucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTRhOTg4NmI4ZGEyNGZlZDIucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWJiODU2MDBiM2I1Mjg4ODgucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTI3NjAzOTRkNTk5M2FkODgucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQwNzZjOWM1ZGQwZjUwNzMucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWMwODNlYzM5MzQ0ZmEyM2EucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQxYzRmZGNlN2Q3ZDA2YTQucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTJlN2RiOGNiNTU2Mzg3ZWQucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTBhODMxZmE4NjQwNmJjMjkucG5n?x-oss-process=image/format,png)
![String类型的value基本操作](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTdjZGRlZTM3NGU4M2I3ZDYucG5n?x-oss-process=image/format,png)
除此之外，string 类型的value还有一些CAS的原子操作，如：get、set、set value nx（如果不存在就设置）、set value xx（如果存在就设置）。

String 类型是二进制安全的，也就是说在Redis中String类型可以包含各种数据，比如一张JPEG图片或者是一个序列化的Ruby对象。一个String类型的值最大长度可以是512M。

在Redis中String有很多有趣的用法
*   把String当做原子计数器，这可以使用INCR家族中的命令来实现：[INCR](https://github.com/antirez/redis-doc/blob/master/commands/incr), [DECR](https://github.com/antirez/redis-doc/blob/master/commands/decr), [INCRBY](https://github.com/antirez/redis-doc/blob/master/commands/incrby)。
*   使用[APPEND](https://github.com/antirez/redis-doc/blob/master/commands/append)命令来给一个String追加内容。
*   把String当做一个随机访问的向量（Vector），这可以使用[GETRANGE](https://github.com/antirez/redis-doc/blob/master/commands/getrange)和 [SETRANGE](https://github.com/antirez/redis-doc/blob/master/commands/setrange)命令来实现
*   使用[GETBIT](https://github.com/antirez/redis-doc/blob/master/commands/getbit) 和[SETBIT](https://github.com/antirez/redis-doc/blob/master/commands/setbit)方法，在一个很小的空间中编码大量的数据，或者创建一个基于Redis的Bloom Filter 算法。
# List
可从头部（左侧）加入元素，也可以从尾部（右侧）加入元素。有序列表。

像微博粉丝，即可以list存储做缓存。
```bash
key = 某大v

value = [zhangsan, lisi, wangwu]
```
所以可存储一些list型的数据结构，如：
- 粉丝列表
- 文章的评论列表

可通过lrange命令，即从某元素开始读取多少元素，可基于list实现分页查询，这就是基于redis实现简单的高性能分页，可以做类似微博那种下拉不断分页的东西，性能高，就一页一页走。

搞个简单的消息队列，从list头推进去，从list尾拉出来。

List类型中存储一系列String值，这些String按照插入顺序排序。

## 5.1 内存数据结构
List 类型的 value对象，由 linkedlist 或 ziplist 实现。
当 List `元素个数少并且元素内容长度不大`采用ziplist 实现，否则使用linkedlist

### 5.1.1 linkedlist实现
链表的代码结构
```c
typedef struct list {
  // 头结点
  listNode *head;
  // 尾节点
  listNode *tail;
  // 节点值复制函数
  void *(*dup)(void * ptr);
  // 节点值释放函数
  void *(*free)(void *ptr);
  // 节点值对比函数
  int (*match)(void *ptr, void *key);
  // 链表长度
  unsigned long len;  
} list;

// Node节点结构
typedef struct listNode {
	struct listNode *prev;
	struct listNode *next;
	void *value;
} listNode;
```
linkedlist 结构图
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTg1NzAyZDg2NzYxZDFiZjMucG5n?x-oss-process=image/format,png)
### 5.1.2 ziplist实现
存储在连续内存
![](https://img-blog.csdnimg.cn/ac58e5b93d294a958940f681d4b165e5.png)
- zlbytes
ziplist 的总长度
- zltail
指向最末元素。
- zllen
元素的个数。
- entry
元素内容。
- zlend
恒为0xFF，作为ziplist的定界符

linkedlist和ziplist的rpush、rpop、llen的时间复杂度都是O(1)：
- ziplist的lpush、lpop都会牵扯到所有数据的移动，时间复杂度为O(N)
由于List的元素少，体积小，这种情况还是可控的。

ziplist的Entry结构：
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTJkNWQ1YWI3NGRhYmZhOTkucG5n?x-oss-process=image/format,png)
记录前一个相邻的Entry的长度，便于双向遍历，类似linkedlist的prev指针。
ziplist是连续存储，指针由偏移量来承载。
Redis中实现了2种方式实现：
- 当前邻 Entry的长度小于254 时，使用1字节实现
- 否则使用5个字节

> 当前一个Entry长度变化时，可能导致后续的所有空间移动，虽然这种情况发生可能性较小。

Entry内容本身是自描述的，意味着第二部分（Entry内容）包含了几个信息：Entry内容类型、长度和内容本身。而内容本身包含：类型长度部分和内容本身部分。类型和长度同样采用变长编码：
- 00xxxxxx ：string类型；长度小于64，0~63可由6位bit 表示，即xxxxxx表示长度
- 01xxxxxx|yyyyyyyy ： string类型；长度范围是[64, 16383]，可由14位 bit 表示，即xxxxxxyyyyyyyy这14位表示长度。
- 10xxxxxx|yy..y(32个y) : string类型，长度大于16383.
- 1111xxxx ：integer类型，integer本身内容存储在xxxx 中，只能是1~13之间取值。也就是说内容类型已经包含了内容本身。
- 11xxxxxx ：其余的情况，Redis用1个字节的类型长度表示了integer的其他几种情况，如：int_32、int_24等。
由此可见，ziplist 的元素结构采用的是可变长的压缩方法，针对于较小的整数/字符串的压缩效果较好

- LPUSH命令
在头部加入一个新元素
- RPUSH命令
在尾部加入一个新元素

当在一个空的K执行这些操作时，会创建一个新列表。当一个操作清空了一个list时，该list对应的key会被删除。若使用一个不存在的K，就会使用一个空list。
```bash
LPUSH mylist a&nbsp;&nbsp; # 现在list是 "a"
LPUSH mylist b&nbsp;&nbsp; # 现在list是"b","a"
RPUSH mylist c&nbsp;&nbsp; # 现在list是 "b","a","c" (注意这次使用的是 RPUSH)
```
list的最大长度是`2^32 – 1`个元素（4294967295，一个list中可以有多达40多亿个元素）。

从时间复杂度的角度来看，Redis list类型的最大特性是：即使是在list的头端或者尾端做百万次的插入和删除操作，也能保持稳定的很少的时间消耗。在list的两端访问元素是非常快的，但是如果要访问一个很大的list中的中间部分的元素就会比较慢了，时间复杂度是O(N)
## 适用场景
- 社交中使用List进行时间表建模，使用 LPUSH 在用户时间线中加入新元素，然后使用 LRANGE 获得最近加入元素
- 可以把[LPUSH] 和[LTRIM] 命令结合使用来实现定长的列表，列表中只保存最近的N个元素
- 做MQ，依赖BLPOP这种阻塞命令
# Set
类似List，但无序且其元素不重复。

向集合中添加多次相同的元素，集合中只存在一个该元素。在实际应用中，这意味着在添加一个元素前不需要先检查元素是否存在。

支持多个服务器端命令来从现有集合开始计算集合，所以执行集合的交集，并集，差集都很快。

set的最大长度是`2^32 – 1`个元素（一个set中可多达40多亿个元素）。
## 内存数据结构
Set在Redis中以intset 或 hashtable存储：
- 对于Set，HashTable的value永远为NULL
- 当Set中只包含整型数据时，采用intset作为实现

### intset
核心元素是一个字节数组，从小到大有序的存放元素
![](https://img-blog.csdnimg.cn/20200911231000505.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)
结构图
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTczN2MzY2NiZDAxMzcxZjEucG5n?x-oss-process=image/format,png)
因为元素有序排列，所以SET的获取操作采用二分查找，复杂度为O(log(N))。

进行插入操作时：
- 首先通过二分查找到要插入位置
- 再对元素进行扩容
- 然后将插入位置之后的所有元素向后移动一个位置
- 最后插入元素

时间复杂度为O(N)。为使二分查找的速度足够快，存储在content 中的元素是定长的。
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTkwODQ2NzBlNzk2MTJlMGIucG5n?x-oss-process=image/format,png)
当插入2018 时，所有的元素向后移动，并且不会发生覆盖。
当Set 中存放的整型元素集中在小整数范围[-128, 127]内时，可大大的节省内存空间。
IntSet支持升级，但是不支持降级。

- Set 基本操作
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LThkYmNkMTJiMDRlZmJjZmQucG5n?x-oss-process=image/format,png)
## 适用场景
无序集合，自动去重，数据太多时不太推荐使用。
直接基于set将系统里需要去重的数据扔进去，自动就给去重了，如果你需要对一些数据进行快速的全局去重，你当然也可以基于JVM内存里的HashSet进行去重，但若你的某个系统部署在多台机器呢？就需要基于redis进行全局的set去重。

可基于set玩交集、并集、差集操作，比如交集：
- 把两个人的粉丝列表整一个交集，看看俩人的共同好友
- 把两个大v的粉丝都放在两个set中，对两个set做交集

全局这种计算开销也大。

- 记录唯一的事物
比如想知道访问某个博客的IP地址，不要重复的IP，这种情况只需要在每次处理一个请求时简单的使用SADD命令就可以了，可确保不会插入重复IP

- 表示关系
你可以使用Redis创建一个标签系统，每个标签使用一个Set表示。然后你可以使用SADD命令把具有特定标签的所有对象的所有ID放在表示这个标签的Set中
如果你想要知道同时拥有三个不同标签的对象，那么使用SINTER

- 可使用[SPOP](https://github.com/antirez/redis-doc/blob/master/commands/spop) 或 [SRANDMEMBER](https://github.com/antirez/redis-doc/blob/master/commands/srandmember) 命令从集合中随机的提取元素。

# Hash/Map
一般可将结构化的数据，比如一个对象（前提是这个对象未嵌套其他的对象）给缓存在redis里，然后每次读写缓存的时候，即可直接操作hash里的某个字段。
```json
key=150

value={
  “id”: 150,
  “name”: “zhangsan”,
  “age”: 20
}
```
hash类的数据结构，主要存放一些对象，把一些简单的对象给缓存起来，后续操作的时候，可直接仅修改该对象中的某字段的值。
```c
value={
  “id”: 150,
  “name”: “zhangsan”,
  “age”: 21
}
```
因为Redis本身是一个K.V存储结构，Hash结构可理解为subkey - subvalue
这里面的subkey - subvalue只能是
- 整型
- 浮点型
- 字符串

因为Map的 value 可表示整型和浮点型，因此Map也可以使用` hincrby` 对某个field的value值做自增操作。

## 内存数据结构
hash有HashTable 和 ziplist 两种实现。对于数据量较小的hash，使用ziplist 实现。
### HashTable 实现
HashTable在Redis 中分为3 层，自底向上分别是：
- dictEntry：管理一个field - value 对，保留同一桶中相邻元素的指针，以此维护Hash 桶中的内部链
- dictht：维护Hash表的所有桶链
- dict：当dictht需要扩容/缩容时，用户管理dictht的迁移

dict是Hash表存储的顶层结构
```c
// 哈希表（字典）数据结构，Redis 的所有键值对都会存储在这里。其中包含两个哈希表。
typedef struct dict {
    // 哈希表的类型，包括哈希函数，比较函数，键值的内存释放函数
    dictType *type;
    // 存储一些额外的数据
    void *privdata;
    // 两个哈希表
    dictht ht[2];
    // 哈希表重置下标，指定的是哈希数组的数组下标
    int rehashidx; /* rehashing not in progress if rehashidx == -1 */
    // 绑定到哈希表的迭代器个数
    int iterators; /* number of iterators currently running */
} dict;
```
Hash表的核心结构是dictht，它的table 字段维护着 Hash 桶，桶（bucket）是一个数组，数组的元素指向桶中的第一个元素（dictEntry）。

```c
typedef struct dictht { 
    //槽位数组
    dictEntry **table; 
    //槽位数组长度
    unsigned long size; 
    //用于计算索引的掩码 
    unsigned long sizemask;
    //真正存储的键值对数量
    unsigned long used; 
} dictht;
```
结构图![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTEwYzRhMWFkMGY3MDExMTcucG5n?x-oss-process=image/format,png)
Hash表使用【链地址法】解决Hash冲突。当一个 bucket 中的 Entry 很多时，Hash表的插入性能会下降，此时就需要增加bucket的个数来减少Hash冲突。
#### Hash表扩容
和大多数Hash表实现一样，Redis引入负载因子判定是否需要增加bucket个数：
```bash
负载因子 = Hash表中已有元素 / bucket数量
```
扩容后，bucket 数量是原先2倍。目前有2 个阀值：
- 小于1 时一定不扩容
- 大于5 时一定扩容

- 在1 ~ 5 之间时，Redis 如果没有进行`bgsave/bdrewrite` 操作时则会扩容
- 当key - value 对减少时，低于0.1时会进行缩容。缩容之后，bucket的个数是原先的0.5倍
### ziplist 实现
这里的 ziplist 和List#ziplist的实现类似，都是通过Entry 存放元素。
不同的是，Map#ziplist的Entry个数总是2的整数倍：
-  第奇数个Entry存放key
- 下个相邻Entry存放value

ziplist承载时，Map的大多数操作不再是O(1)了，而是由Hash表遍历，变成了链表的遍历，复杂度变为O(N)
由于Map相对较小时采用ziplist，采用Hash表时计算hash值的开销较大，因此综合起来ziplist的性能相对好一些

哈希键值结构
![](https://img-blog.csdnimg.cn/919d84762fc44637b12de9e9ebf11a94.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTE1MTAyZWVkODNjMzA4ZWMucG5n?x-oss-process=image/format,png)
特点：
- Map的map
- Small redis
- field不能相同，value可相同

```bash
hget key field O(1)
# 获取 hash key 对应的 field 的 value

hset key field value O(1)
#  设置 hash key 对应的 field 的 value

hdel key field O(1)
# 删除 hash key 对应的 field 的 value
```
## 实操
```bash
127.0.0.1:6379> hset user:1:info age 23
(integer) 1
127.0.0.1:6379> hget user:1:info age
"23"
127.0.0.1:6379> hset user:1:info name JavaEdge
(integer) 1
127.0.0.1:6379> hgetall user:1:info
1) "age"
2) "23"
3) "name"
4) "JavaEdge"
127.0.0.1:6379> hdel user:1:info age
(integer) 1
127.0.0.1:6379> hgetall user:1:info
1) "name"
2) "JavaEdge"
```

```bash
hexists key field O(1)
# 判断hash key是否有field
hlen key O(1)
# 获取hash key field的数量
```

```bash
127.0.0.1:6379> hgetall user:1:info
1) "name"
2) "JavaEdge"
127.0.0.1:6379> HEXISTS user:1:info name
(integer) 1
127.0.0.1:6379> HLEN user:1:info
(integer) 1
```

```bash
hmget key field1 field2... fieldN O(N)
# 批量获取 hash key 的一批 field 对应的值
hmset key field1 value1 field2 value2...fieldN valueN O(N)
# 批量设置 hash key的一批field value

```
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWU3NjM0MmRkMDlkNjAwNzYucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTc3M2FjMWI5NGVhZDA3MTAucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTFmZDkzNTYyMWNjYzg5NTUucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTJhODk3MjllYTA0ODg2YmQucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTM3Y2ZiOTcxY2JlMDhiOTQucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTFmMzJmMGJkMjk0MDFhZmEucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTE3OTRmMjk0NTMzZjQ2ZGMucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWVhMTVmZDBkNjg2YjlkNmQucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTFmNzRhMjEwOTE5YjJhN2UucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LThhMWE1MjNhNWE4NDJiOTAucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTI1OThiNTVlN2FlNzA1ZGMucG5n?x-oss-process=image/format,png)
![方便单条更新,但是信息非整体,不便管理](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LThiODAyYmFhODgyNzBlZTgucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWE2ZDZhOGZmMmVmYTM4NmIucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTIwMjg4MjgzZDE1ODUyYWQucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWI1YTNmZGQwODdjMTIzM2MucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTJjNzdkNWQzYTc1OTc5NzMucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTQ0NGYzNWU3MzM5MzRjNTkucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTA5OTc2M2M1YzM0YjM4YzUucG5n?x-oss-process=image/format,png)
Redis Hashes 保存String域和String值之间的映射，所以它们是用来表示对象的绝佳数据类型（比如一个有着用户名，密码等属性的User对象）
```
| `1` | `@cli` |

| `2` | `HMSET user:1000 username antirez password P1pp0 age 34` |

| `3` | `HGETALL user:1000` |

| `4` | `HSET user:1000 password 12345` |

| `5` | `HGETALL user:1000` |
```
一个有着少量数据域（这里的少量大概100上下）的hash，其存储方式占用很小的空间，所以在一个小的Redis实例中就可以存储上百万的这种对象

Hash的最大长度是2^32 – 1个域值对（4294967295，一个Hash中可以有多达40多亿个域值对）
# Sorted sets(zset)
有序集合，去重但可排序，写进去时候给个分数，可以自定义排序规则。比如想根据时间排序，则写时可以使用时间戳作为分数。

排行榜：将每个用户以及其对应的什么分数写进去。
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
类似于Map的key-value对，但有序
- key ：key-value对中的键，在一个Sorted-Set中不重复
- value ： 浮点数，称为 score
- 有序 ：内部按照score 从小到大的顺序排列
## 基本操作
由于Sorted-Set 本身包含排序信息，在普通Set 的基础上，Sorted-Set 新增了一系列和排序相关的操作：
- Sorted-Set的基本操作
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTI2OTNlZDUxNGU0Njc5MTgucG5n?x-oss-process=image/format,png)
## 内部数据结构
Sorted-Set类型的valueObject 内部结构有两种：
1. ziplist
![](https://img-blog.csdnimg.cn/20200911183043109.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
实现方式和Map类似，由于Sorted-Set包含了Score的排序信息，ziplist内部的key-value元素对的排序方式也是按照Score递增排序的，意味着每次插入数据都要移动之后的数据，因此ziplist适于元素个数不多，元素内容不大的场景。
2. skiplist+hashtable
![](https://img-blog.csdnimg.cn/20200911183355830.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
更通用的场景，Sorted-Set使用sliplist来实现。
### 8.2.1 zskiplist
和通用的跳表不同的是，Redis为每个level 对象增加了span 字段，表示该level 指向的forward节点和当前节点的距离，使得getByRank类的操作效率提升
- 数据结构
![](https://img-blog.csdnimg.cn/20200911184359226.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)
- 结构示意图![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTk5OGJhNjJjZTQ1MTE1YTcucG5n?x-oss-process=image/format,png)

每次向skiplist 中新增或者删除一个节点时，需要同时修改图标中红色的箭头，修改其forward和span的值。

需要修改的箭头和对skip进行查找操作遍历并废弃过的路径是吻合的。span修改仅是+1或-1。
zskiplist 的查找平均时间复杂度 O(Log(N))，因此add / remove的复杂度也是O(Log(N))。因此Redis中新增的span 提升了获取rank（排序）操作的性能，仅需对遍历路径相加即可（矢量相加）。

还有一点需要注意的是，每个skiplist的节点level 大小都是随机生成的（1-32之间）。
- zskiplistNode源码
![](https://img-blog.csdnimg.cn/20200911185457885.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)
### 8.2.2 hashtable
zskiplist 是zset 实现顺序相关操作比较高效的数据结构，但是对于简单的zscore操作效率并不高。Redis在实现时，同时使用了Hashtable和skiplist，代码结构如下：
![](https://img-blog.csdnimg.cn/20200911190122653.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)
Hash表的存在使得Sorted-Set中的Map相关操作复杂度由O(N)变为O(1)。

Redis有序集合类型与Redis的集合类型类似，是非重复的String元素的集合。不同之处在于，有序集合中的每个成员都关联一个Score，Score是在排序时候使用的，按照Score的值从小到大进行排序。集合中每个元素是唯一的，但Score有可能重复。

使用有序集合可以很高效的进行，添加，移除，更新元素的操作（时间消耗与元素个数的对数成比例）。由于元素在集合中的位置是有序的，使用get ranges by score或者by rank（位置）来顺序获取或者随机读取效率都很高。（本句不确定，未完全理解原文意思，是根据自己对Redis的浅显理解进行的翻译）访问有序集合中间部分的元素也非常快，所以可以把有序集合当做一个不允许重复元素的智能列表，你可以快速访问需要的一切：获取有序元素，快速存在测试，快速访问中间的元素等等。

简短来说，使用有序集合可以实现很多高性能的工作，这一点在其他数据库是很难实现的。

## 应用
*   在大型在线游戏中创建一个排行榜，每次有新的成绩提交，使用[ZADD]命令加入到有序集合中。可以使用[ZRANGE]命令轻松获得成绩名列前茅的玩家，你也可以使用[ZRANK]根据一个用户名获得该用户的分数排名。把ZRANK 和 ZRANGE结合使用你可以获得与某个指定用户分数接近的其他用户。这些操作都很高效。

*   有序集合经常被用来索引存储在Redis中的数据。比如，如果你有很多用户，用Hash来表示，可以使用有序集合来为这些用户创建索引，使用年龄作为Score，使用用户的ID作为Value，这样的话使用[ZRANGEBYSCORE]命令可以轻松和快速的获得某一年龄段的用户。zset有个ZSCORE的操作，用于返回单个集合member的分数，它的操作复杂度是O(1)，这就是收益于你这看到的hash table。这个hash table保存了集合元素和相应的分数，所以做ZSCORE操作时，直接查这个表就可以，复杂度就降为O(1)了。

而跳表主要服务范围操作，提供O(logN)的复杂度。
# Bitmaps
位图类型，String类型上的一组面向bit操作的集合。由于 strings是二进制安全的blob，并且它们的最大长度是512m，所以bitmaps能最大设置 2^32个不同的bit。
# HyperLogLogs
pfadd/pfcount/pfmerge。
在redis的实现中，使用标准错误小于1％的估计度量结束。这个算法的神奇在于不再需要与需要统计的项相对应的内存，取而代之，使用的内存一直恒定不变。最坏的情况下只需要12k，就可以计算接近2^64个不同元素的基数。 
# GEO
geoadd/geohash/geopos/geodist/georadius/georadiusbymember 
Redis的GEO特性在 Redis3.2版本中推出，这个功能可以将用户给定的地理位置（经、纬度）信息储存起来，并对这些信息进行操作。