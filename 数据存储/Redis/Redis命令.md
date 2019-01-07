# 1 Server
## info 
以一种易于理解和阅读的格式，返回关于Redis服务器的各种信息和统计数值
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtNzM4MTAxNTc5OGVjZDZiMC5wbmc?x-oss-process=image/format,png)
## select
选择一个数据库，下标值从0开始，一个新连接默认连接的数据库是DB0
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtNmU1MDM5MTM3OGI3MzE2ZS5wbmc?x-oss-process=image/format,png)
## flushdb
删除当前数据库里面的所有数据
这个命令永远不会出现失败
这个操作的时间复杂度是O(N),N是当前数据库的keys数量
## flushall
删除所有数据库里面的所有数据，注意不是当前数据库，而是所有数据库
这个命令永远不会出现失败
这个操作的时间复杂度是O(N),N是数据库的数量
## ping
如果后面没有参数时返回PONG，否则会返回后面带的参数
这个命令经常用来测试一个连接是否还是可用的，或者用来测试一个连接的延时
如果客户端处于频道订阅模式下，它将是一个multi-bulk返回，第一次时返回”pong”，之后返回空（empty bulk），除非命令后面更随了参数
##quit
请求服务器关闭连接。连接将会尽可能快的将未完成的客户端请求完成处理
## save
执行一个同步操作，以RDB文件的方式保存所有数据的快照 很少在生产环境直接使用SAVE 命令，因为它会阻塞所有的客户端的请求，可以使用[BGSAVE](http://www.redis.cn/commands/bgsave.html) 命令代替. 如果在[BGSAVE](http://www.redis.cn/commands/bgsave.html)命令的保存数据的子进程发生错误的时,用 SAVE命令保存最新的数据是最后的手段,详细的说明请参考持久化文档
## dbsize
> 自 1.0.0 起可用。

返回当前数据里面keys的数量
![](https://img-blog.csdnimg.cn/20200906175405753.png#pic_center)

# 2 keys 命令集
## 2.1 keys
>  1.0.0 起可用。
时间复杂度：O（N）与N是数据库中的键数，假设数据库中的键名称和给定的模式的长度有限。

返回所有键匹配模式。
虽然此操作的时间复杂性为 O（N），但常量时间相当低。例如，在入门级笔记本电脑上运行的 Redis 可以在 40 毫秒内扫描 100 万个key数据库。

注意，将 KEYS 视为一个命令，该命令应仅在生产环境中使用。当对大型数据库执行时，可能会破坏性能。此命令用于调试和特殊操作，例如更改key空间布局。不要在常规应用程序代码中使用 KEYS。如果你想在key空间子集中查找key，请考虑使用 SCAN 命令或sets结构。

- keys * 遍历所有 key。一般不在生产环境使用
![](https://img-blog.csdnimg.cn/20200906173839841.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)

那何时使用该命令呢？
- 热备从节点
- 使用scan替代吧
## 2.2 set
将键key设定为指定的“字符串”值
如果key	已经保存了一个值，那么这个操作会直接覆盖原来的值，并且忽略原始类型
当set命令执行成功之后，之前设置的过期时间都将失效
如果SET命令正常执行那么回返回OK，否则如果加了NX 或者 XX选项，但是没有设置条件。那么会返回nil

## 2.3 del
删除指定的一批keys，如果删除中的某些key不存在，则直接忽略。
返回值:被删除的keys的数量

## 2.4 exists
> 自 1.0.0 起可用。
时间复杂度：O（1）

如果key存在，则返回。

由于 Redis 3.0.3 可以指定多个键而不是单个键。在这种情况下，它将返回现有key的总数。请注意，为单个键返回 1 或 0 只是 variadic 使用的特殊情况，因此该命令完全向后兼容。

用户应该知道，如果在参数中多次提到相同的现有key，则将多次计数该key。因此，如果存在某些key，则存在某些key，则返回 2。

### 返回值
- 1 key存在
- 0 key不存在

## 2.5 ttl（pttl）
![](https://img-blog.csdnimg.cn/20200906202145593.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)

返回key剩余的过期时间。 这种反射能力允许Redis客户端检查指定key在数据集里面剩余的有效期。
从Redis2.8开始，错误返回值的结果:
- 若key不存在或已过期，返回 `-2`
- 若key存在且没有设置过期时间，返回 `-1`

与之相关的 PTTL 命令实现完全相同，返回相同的信息，只不过其时间单位是毫秒（仅适用于Redis 2.6及更高版本）。

## 返回值
 key有效的秒数（TTL in seconds），或者一个负值的错误 (参考上文)

## 2.6 expire key seconds
> 自 1.0.0 起可用。
时间复杂度：O（1）

设置`key`的过期时间。超时后，将会自动删除该`key`。在Redis的术语中一个`key`的相关超时是volatile的。

超时后只有对`key`执行DEL、SET、GETSET时才会清除。 这意味着，从概念上讲所有改变`key`而不用新值替换的所有操作都将保持超时不变。 例如，使用 `INCR` 递增key的值，执行 `LPUSH` 将新值推到 list 中或用 `HSET` 改变hash的`field`，这些操作都使超时保持不变。

- 使用 `PERSIST` 命令可以清除超时，使其变成一个永久`key`
- 若 `key` 被 `RENAME` 命令修改，相关的超时时间会转移到新`key`
- 若 `key` 被 `RENAME` 命令修改，比如原来就存在 `Key_A`，然后调用 `RENAME Key_B Key_A` 命令，这时不管原来 `Key_A` 是永久的还是设为超时的，都会由`Key_B`的有效期状态覆盖

注意，使用非正超时调用 EXPIRE/PEXPIRE 或具有过去时间的 EXPIREAT/PEXPIREAT 将导致key被删除而不是过期（因此，发出的key事件将是 del，而不是过期）。

### 刷新过期时间
对已经有过期时间的`key`执行`EXPIRE`操作，将会更新它的过期时间。有很多应用有这种业务场景，例如记录会话的session。

### Redis 之前的 2.1.3 的差异
在 Redis 版本之前 2.1.3 中，使用更改其值的命令更改具有过期集的密钥具有完全删除key的效果。由于现在修复的复制层中存在限制，因此需要此语义。

EXPIRE 将返回 0，并且不会更改具有超时集的键的超时。

### 返回值
*   `1` 如果成功设置过期时间。
*   `0` 如果`key`不存在或者不能设置过期时间。


### 示例
![](https://img-blog.csdnimg.cn/20200906190447334.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)

假设有一 Web 服务，对用户最近访问的最新 N 页感兴趣，这样每个相邻页面视图在上一个页面之后不超过 60 秒。从概念上讲，可以将这组页面视图视为用户的导航会话，该会话可能包含有关ta当前正在寻找的产品的有趣信息，以便你可以推荐相关产品。

可使用以下策略轻松在 Redis 中对此模式建模：每次用户执行页面视图时，您都会调用以下命令：

```shell
MULTI
RPUSH pagewviews.user:<userid> http://.....
EXPIRE pagewviews.user:<userid> 60
EXEC
```
如果用户空闲超过 60 秒，则将删除该key，并且仅记录差异小于 60 秒的后续页面视图。
此模式很容易修改，使用 INCR 而不是使用 RPUSH 的列表。

### 带过期时间的 key
通常，创建 Redis 键时没有关联的存活时间。key将永存，除非用户以显式方式（例如 DEL 命令）将其删除。
EXPIRE 族的命令能够将过期项与给定key关联，但代价是该key使用的额外内存。当key具有过期集时，Redis 将确保在经过指定时间时删除该key。
可使用 EXPIRE 和 PERSIST 命令（或其他严格命令）更新或完全删除生存的关键时间。
### 过期精度
在 Redis 2.4 中，过期可能不准确，并且可能介于 0 到 1 秒之间。
由于 Redis 2.6，过期误差从 0 到 1 毫秒。

### 过期和持久化
过期信息的键存储为绝对 Unix 时间戳（Redis 版本 2.6 或更高版本为毫秒）。这意味着即使 Redis 实例不处于活动状态，时间也在流动。
要使过期工作良好，必须稳定计算机时间。若将 RDB 文件从两台计算机上移动，其时钟中具有大 desync，则可能会发生有趣的事情（如加载时加载到过期的所有key）。
即使运行时的实例，也始终会检查计算机时钟，例如，如果将一个key设置为 1000 秒，然后在将来设置计算机时间 2000 秒，则该key将立即过期，而不是持续 1000 秒。

### Redis 如何使key过期
键的过期方式有两种：被动方式和主动方式。

当某些客户端尝试访问key时，key会被动过期，并且该key已定时。
当然，这是不够的，因为有过期的key，永远不会再访问。无论如何，这些key都应过期，因此请定期 Redis 在具有过期集的key之间随机测试几个key。已过期的所有key将从key空间中删除。

具体来说，如下 Redis 每秒 10 次：
1. 测试 20 个带有过期的随机键
2. 删除找到的所有已过期key
3. 如果超过 25% 的key已过期，从步骤 1 重新开始

这是一个微不足道的概率算法，基本上假设我们的样本代表整个key空间，继续过期，直到可能过期的key百分比低于 25%。
这意味着在任何给定时刻，使用内存的已过期的最大键量等于最大写入操作量/秒除以 4。

### 在复制链路和 AOF 文件中处理过期的方式
为了在不牺牲一致性的情况下获得正确行为，当key过期时，DEL 操作将同时在 AOF 文件中合成并获取所有附加的从节点。这样，过期的这个处理过程集中到主节点中，还没有一致性错误的可能性。

但是，虽然连接到主节点的从节点不会独立过期key（但会等待来自master的 DEL），但它们仍将使用数据集中现有过期的完整状态，因此，当选择slave作为master时，它将能够独立过期key，完全充当master。

## 2.7 type
返回`key`所存储的`value`的数据结构类型
### 返回值
返回当前`key`的数据类型，如果`key`不存在时返回`none`
## rename
将key重命名为newkey，如果key与newkey相同，将返回一个错误
如果newkey已经存在，则值将被覆盖
### 返回值
[simple-string-reply](http://www.redis.cn/topics/protocol.html#simple-string-reply)
## renamenx
当且仅当 newkey 不存在时，将 key 改名为 newkey 
当 key 不存在时，返回一个错误
### 返回值
[integer-reply](http://www.redis.cn/topics/protocol.html#integer-reply)：OK

*   修改成功时，返回 1 。
*   如果 newkey 已经存在，返回 0 
## randomkey
从当前数据库返回一个随机的key
# 3 string命令
## setex
设置key对应字符串value，并且设置key在给定的seconds时间之后超时过期。这个命令等效于执行下面的命令
```
SET mykey value
EXPIRE mykey seconds
```
SETEX是原子的，也可以通过把上面两个命令放到[MULTI](http://www.redis.cn/commands/multi.html)/[EXEC](http://www.redis.cn/commands/exec.html)块中执行的方式重现。相比连续执行上面两个命令，它更快，因为当Redis当做缓存使用时，这个操作更加常用。
### 返回值
[simple-string-reply](http://www.redis.cn/topics/protocol.html#simple-string-reply)OK
## psetex
[PSETEX](http://www.redis.cn/commands/psetex.html)和[SETEX](http://www.redis.cn/commands/setex.html)一样，唯一的区别是到期时间以毫秒为单位,而不是秒
## getset(具有原子性)
自动将key对应到value并且返回原来key对应的value
如果key存在但是对应的value不是字符串，就返回错误

GETSET可以和INCR一起使用实现支持重置的计数功能。
举个例子：每当有事件发生的时候，一段程序都会调用INCR给key mycounter加1，但是有时我们需要获取计数器的值，并且自动将其重置为0。这可以通过GETSET mycounter “0”来实现：
```
INCR mycounter
GETSET mycounter "0"
GET mycounter
```
### 返回值
[bulk-string-reply](http://www.redis.cn/topics/protocol.html#bulk-string-reply): 返回之前的旧值，如果之前`Key`不存在将返回`nil`
## mset
对应给定的keys到他们相应的values上。
`MSET`会用新的value替换已经存在的value，就像普通的[SET](http://www.redis.cn/commands/set.html)命令一样
`MSET`是原子的，所以所有给定的keys是一次性set的。客户端不可能看到这种一部分keys被更新而另外的没有改变的情况
### 返回值
[simple-string-reply](http://www.redis.cn/topics/protocol.html#simple-string-reply)：总是OK，因为MSET不会失败
##mget
返回所有指定的key的value。对于每个不对应string或者不存在的key，都返回特殊值`nil`。正因为此，这个操作从来不会失败。
### 返回值
[array-reply](http://www.redis.cn/topics/protocol.html#array-reply): 指定的key对应的values的list
## setnx(防止set覆盖问题,具有原子性)
将`key`设置值为`value`
如果`key`不存在，这种情况下等同set
当`key`存在时，什么也不做
`SETNX`是”**SET** if **N**ot e**X**ists”的简写
### 返回值
[Integer reply](http://www.redis.cn/topics/protocol.html#integer-reply), 特定值
*   `1` 如果key被设置了
*   `0` 如果key没有被设置
## msetnx
对应给定的keys到他们相应的values上
只要有一个key已存在，`MSETNX`一个操作都不会执行
 由于这种特性，`MSETNX`可以实现要么所有的操作都成功，要么一个都不执行，这样可以用来设置不同的key，来表示一个唯一的对象的不同字段

`MSETNX`是原子的，所以所有给定的keys是一次性set的
客户端不可能看到这种一部分keys被更新而另外的没有改变的情况
### 返回值
[integer-reply](http://www.redis.cn/topics/protocol.html#integer-reply)，只有以下两种值：
*   1 如果所有的key被set
*   0 如果没有key被set(至少其中有一个key是存在的)
## incr
对存储在指定`key`的数值执行原子的加1操作
如果指定的key不存在，那么在执行incr操作之前，会先将它的值设定为`0`
### 返回值
[integer-reply](http://www.redis.cn/topics/protocol.html#integer-reply):执行递增操作后`key`对应的值
##incrby
将key对应的数字加decrement
如果key不存在，操作之前，key就会被置为0。
###返回值
[integer-reply](http://www.redis.cn/topics/protocol.html#integer-reply)： 增加之后的value值
## decr
对key对应的数字做减1操作
如果key不存在，那么在操作之前，这个key对应的值会被置为0
### 返回值
数字：减小之后的value
## decrby
将key对应的数字减decrement
如果key不存在，操作之前，key就会被置为0
### 返回值
数字：减少之后的value值
## apend
如果 `key` 已经存在，并且值为字符串，那么这个命令会把 `value` 追加到原来值（value）的结尾
 如果 `key` 不存在，那么它将首先创建一个空字符串的`key`，再执行追加操作，这种情况 [APPEND](http://www.redis.cn/ommands/append.html) 将类似于 [SET](http://www.redis.cn/ommands/set.html) 操作。
### 返回值
[Integer reply](htp://www.redis.cn/topics/protocol.html#integer-reply)：返回append后字符串值（value）的长度
#  4 hashes


## 3.1 hset key field value [field value ...]
> 2.0.0提供。
时间复杂度：O(1)对每个字段/值对添加，因此 O（N） 在调用具有多个字段/值对的命令时添加 N 个字段/值对。

设置存储在键到值的哈希中的字段。如果key不存在，则创建一个持有哈希的新key。如果哈希中已存在字段，则覆盖该字段。

Redis 4.0.0 起，HSET 是万数值，允许多个字段/值对。

设置 key 指定的哈希集中指定字段的值
如果 key 指定的哈希集不存在，会创建一个新的哈希集并与 key 关联
如果字段在哈希集中存在，它将被重写

### 返回值
添加的字段数。
- 1：如果field是一个新的字段
- 0：如果filed原来在hash里已存在
![](https://img-blog.csdnimg.cn/20200906173606528.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)

## 3.2 hexists key field
返回hash里面field是否存在
### 返回值
[integer-reply](http://www.redis.cn/topics/protocol.html#integer-reply), 含义如下
*   1 hash里面包含该field
*   0 hash里面不包含该field或者key不存在
## 3. hget key field
返回 key 指定的哈希集中该字段所关联的值
### 返回值
[bulk-string-reply](http://www.redis.cn/topics/protocol.html#bulk-string-reply)：该字段所关联的值
当字段不存在或者 key 不存在时返回nil
## 4.  hgetall key
返回 key 指定的哈希集中所有的字段和值
返回值中，每个字段名的下一个是它的值，所以返回值的长度是哈希集大小的两倍
### 返回值
[array-reply](http://www.redis.cn/topics/protocol.html#array-reply)：哈希集中字段和值的列表。当 key 指定的哈希集不存在时返回空列表。
## hkeys key
返回 key 指定的哈希集中所有字段的名字
### 返回值
[array-reply](http://www.redis.cn/topics/protocol.html#array-reply)：哈希集中的字段列表，当 key 指定的哈希集不存在时返回空列表
## hvals key
返回 key 指定的哈希集中所有字段的值
### 返回值
[array-reply](http://www.redis.cn/topics/protocol#array-reply)：哈希集中的值的列表，当 key 指定的哈希集不存在时返回空列表。
## 7.  hlen
返回 `key` 指定的哈希集包含的字段的数量
### 返回值
[integer-reply](http://www.redis.cn/topics/protocol.html#integer-reply)： 哈希集中字段的数量，当 `key` 指定的哈希集不存在时返回 0
## 8. hmget
返回 `key` 指定的哈希集中指定字段的值。
对于哈希集中不存在的每个字段，返回 `nil` 值。因为不存在的keys被认为是一个空的哈希集，对一个不存在的 `key` 执行 [HMGET](http://www.redis.cn/commands/hmget.html) 将返回一个只含有 `nil` 值的列表
### 返回值
[array-reply](http://www.redis.cn/topics/protocol.html#array-reply)：含有给定字段及其值的列表，并保持与请求相同的顺序。
##9. hmset key field value [field value ...]
设置 key 指定的哈希集中指定字段的值。该命令将重写所有在哈希集中存在的字段。如果 key 指定的哈希集不存在，会创建一个新的哈希集并与 key 关联
## 10. hsetnx key field value
只在 key 指定的哈希集中不存在指定的字段时，设置字段的值
如果 key 指定的哈希集不存在，会创建一个新的哈希集并与 key 关联
如果字段已存在，该操作无效果

# 4 list 结构
双向列表，适用于最新列表，关注列表

## 1. lpush
将指定的值插入列表头
- key 不存在， push 前会创建一个空列表
- key 对应的值不是一个 list 的话，那么会返回一个错误

可以使用一个命令把多个元素 push 进入列表，只需在命令末尾加上多个指定的参数
元素是从最左端的到最右端的、一个接一个被插入到 list 的头部
```
lpush mylist a b c
返回的列表是 c 为第一个元素， b 为第二个元素， a 为第三个元素
```

### 返回值
push 后的 list 长

### 2. llen
返回存储在 key 里的list的长度
如果 key 不存在，那么就被看作是空list，并且返回长度为 0
当存储在 key 里的值不是一个list的话，会返回error
### 返回值
key对应的list的长
## 3. lrange key start stop
返回存储在 key 的列表里指定范围内的元素
start 和 end 偏移量都是基于0的下标，即list的第一个元素下标是0（list的表头），第二个元素下标是1，以此类推

偏移量也可以是负数，表示偏移量是从list尾部开始计数。 例如， -1 表示列表的最后一个元素，-2 是倒数第二个，以此类推。

###在不同编程语言里，关于求范围函数的一致性
需要注意的是，如果你有一个list，里面的元素是从0到100，那么 `LRANGE list 0 10` 这个命令会返回11个元素，即最右边的那个元素也会被包含在内。 在你所使用的编程语言里，这一点**可能是也可能不是**跟那些求范围有关的函数都是一致的。（像Ruby的 Range.new，Array#slice 或者Python的 range() 函数。）
###超过范围的下标
当下标超过list范围的时候不会产生error。 如果start比list的尾部下标大的时候，会返回一个空列表。 如果stop比list的实际尾部大的时候，Redis会当它是最后一个元素的下标。
###返回值
指定范围里的列表元素
##4. lset key index value
设置 index 位置的list元素的值为 value
当index超出范围时会返回一个error
##5.  lindex key index
返回列表里的元素的索引 index 存储在 key 里面。 
下标是从0开始,-1 表示最后一个元素
当 key 位置的值不是一个列表的时候，会返回一个error
### 返回值
[bulk-reply](http://www.redis.cn/topics/protocol.html#bulk-reply)：请求的对应元素，或者当 index 超过范围的时候返回 nil
##6. lpop
移除并且返回 key 对应的 list 的第一个元素
### 返回值
bulk-string-reply返回第一个元素的值，或者当 key 不存在时返回 nil。
##7.  rpop
移除并返回存于 key 的 list 的最后一个元素。
###返回值
bulk-string-reply最后一个元素的值，或者当 key 不存在的时候返回 nil
## 8 bl-pop key [key ...] timeout
阻塞列表的弹出
是命令 l-pop的阻塞版本,当给定列表内没有元素可供弹出时, 连接将被阻塞
当给定多个 key 参数时,按参数 key 的先后顺序依次检查各个列表,弹出第一个非空列表的头元素
### 8.1 非阻塞行为
被调用时，如果给定 key 内至少有一个非空列表，那么弹出遇到的第一个非空列表的头元素，并和被弹出元素所属的列表的名字 key 一起，组成结果返回给调用者

设 key list1 不存在，而 list2 和 list3 都是非空列表
```
BLPOP list1 list2 list3 0
```
BLPOP 保证返回一个存在于 list2 里的元素（因为它是从 list1 –> list2 –> list3 这个顺序查起的第一个非空列表）。
### 8.2  阻塞行为
如果所有给定 key 都不存在或包含空列表，那么 [BLPOP](http://www.redis.cn/commands/blpop.html) 命令将阻塞连接， 直到有另一个客户端对给定的这些 key 的任意一个执行 [LPUSH](http://www.redis.cn/commands/lpush.html) 或 [RPUSH](http://www.redis.cn/commands/rpush.html) 命令为止。

一旦有新的数据出现在其中一个列表里，那么这个命令会解除阻塞状态，并且返回 key 和弹出的元素值。

当命令引起客户端阻塞并且设置了一个非零的超时参数 `timeout` 时, 若经过了指定的 `timeout` 仍没有出现一个针对某一特定 key 的 push 操作，则客户端会解除阻塞状态并且返回一个 nil 的多组合值(multi-bulk value)

**timeout 参数表示的是一个指定阻塞的最大秒数的整型值**
当 timeout 为 0 是表示阻塞时间无限制

###8.3 什么 key 会先被处理？是什么客户端？什么元素？优先顺序细节。
*   当客户端为多个 key 尝试阻塞的时候，若至少存在一个 key 拥有元素，那么返回的键值对(key/element pair)就是从左到右数第一个拥有一个或多个元素的key。 
在这种情况下客户端不会被阻塞
*   当多个客户端为同一个 key 阻塞的时候，第一个被处理的客户端是等待最长时间的那个（即第一个因为该key而阻塞的客户端）。 一旦一个客户端解除阻塞那么它就不会保持任何优先级，当它因为下一个 BLPOP 命令而再次被阻塞的时候，会在处理完那些 被同个 key 阻塞的客户端后才处理它（即从第一个被阻塞的处理到最后一个被阻塞的）。
*   当一个客户端同时被多个 key 阻塞时，若多个 key 的元素同时可用（可能是因为事务或者某个Lua脚本向多个list添加元素）， 那么客户端会解除阻塞，并使用第一个接收到 push 操作的 key（假设它拥有足够的元素为我们的客户端服务，因为有可能存在其他客户端同样是被这个key阻塞着）。 从根本上来说，在执行完每个命令之后，Redis 会把一个所有 key 都获得数据并且至少使一个客户端阻塞了的 list 运行一次。 这个 list 按照新数据的接收时间进行整理，即是从第一个接收数据的 key 到最后一个。在处理每个 key 的时候，只要这个 key 里有元素， Redis就会对所有等待这个key的客户端按照“先进先出”(FIFO)的顺序进行服务。若这个 key 是空的，或者没有客户端在等待这个 key， 那么将会去处理下一个从之前的命令或事务或脚本中获得新数据的 key，如此等等。

## 当多个元素被 push 进入一个 list 时 BLPOP 的行为

有时候一个 list 会在同一概念的命令的情况下接收到多个元素：

*   像 LPUSH mylist a b c 这样的可变 push 操作。
*   在对一个向同一个 list 进行多次 push 操作的 MULTI 块执行完 EXEC 语句后。
*   使用 Redis 2.6 或者更新的版本执行一个 Lua 脚本。

当多个元素被 push 进入一个被客户端阻塞着的 list 的时候，Redis 2.4 和 Redis 2.6 或者更新的版本所采取行为是不一样的。

对于 Redis 2.6 来说，所采取的行为是先执行多个 push 命令，然后在执行了这个命令之后再去服务被阻塞的客户端。看看下面命令顺序。

```
Client A:   BLPOP foo 0
Client B:   LPUSH foo a b c

```

如果上面的情况是发生在 Redis 2.6 或更高版本的服务器上，客户端 A 会接收到 c 元素，因为在 [LPUSH](http://www.redis.cn/commands/lpush.html) 命令执行后，list 包含了 c,b,a 这三个元素，所以从左边取一个元素就会返回 c。

相反，Redis 2.4 是以不同的方式工作的：客户端会在 push 操作的上下文中被服务，所以当 LPUSH foo a b c 开始往 list 中 push 第一个元素，它就被传送给客户端A，也就是客户端A会接收到 a（第一个被 push 的元素）。

Redis 2.4的这种行为会在复制或者持续把数据存入AOF文件的时候引发很多问题，所以为了防止这些问题，很多更一般性的、并且在语义上更简单的行为被引入到 Redis 2.6 中。

需要注意的是，一个Lua脚本或者一个 [MULTI](http://www.redis.cn/commands/multi.html) / [EXEC](http://www.redis.cn/commands/exec.html) 块可能会 push 一堆元素进入一个 list 后，再 删除这个 list。 在这种情况下，被阻塞的客户端完全不会被服务，并且只要在执行某个单一命令、事务或者脚本后 list 中没有出现元素，它就会被继续阻塞下去。

## 在一个 MULTI / EXEC 事务中的 BLPOP

[BLPOP](http://www.redis.cn/commands/blpop.html) 可以用于流水线（pipeline，发送多个命令并且批量读取回复），特别是当它是流水线里的最后一个命令的时候，这种设定更加有意义。

在一个 [MULTI](http://www.redis.cn/commands/multi.html) / [EXEC](http://www.redis.cn/commands/exec.html) 块里面使用 [BLPOP](http://www.redis.cn/commands/blpop.html) 并没有很大意义，因为它要求整个服务器被阻塞以保证块执行时的原子性，这就阻止了其他客户端执行一个 push 操作。 因此，一个在 [MULTI](http://www.redis.cn/commands/multi.html) / [EXEC](http://www.redis.cn/commands/exec.html) 里面的 [BLPOP](http://www.redis.cn/commands/blpop.html) 命令会在 list 为空的时候返回一个 `nil` 值，这跟超时(timeout)的时候发生的一样。

如果你喜欢科幻小说，那么想象一下时间是以无限的速度在 MULTI / EXEC 块中流逝……

##返回值

[多批量回复(multi-bulk-reply)](http://www.redis.cn/topics/protocol.html#multi-bulk-reply): 具体来说:

*   当没有元素的时候会弹出一个 nil 的多批量值，并且 timeout 过期。
*   当有元素弹出时会返回一个双元素的多批量值，其中第一个元素是弹出元素的 key，第二个元素是 value。

## 例子

```
redis> DEL list1 list2
(integer) 0
redis> RPUSH list1 a b c
(integer) 3
redis> BLPOP list1 list2 0
1) "list1"
2) "a"

```

## 可靠的队列

当 [BLPOP](http://www.redis.cn/commands/blpop.html) 返回一个元素给客户端的时候，它也从 list 中把该元素移除。这意味着该元素就只存在于客户端的上下文中：如果客户端在处理这个返回元素的过程崩溃了，那么这个元素就永远丢失了。

在一些我们希望是更可靠的消息传递系统中的应用上，这可能会导致一些问题。在这种时候，请查看 [BRPOPLPUSH](http://www.redis.cn/commands/brpoplpush.html) 命令，这是 [BLPOP](http://www.redis.cn/commands/blpop.html) 的一个变形，它会在把返回元素传给客户端之前先把该元素加入到一个目标 list 中。

## 模式：事件提醒

用来阻塞 list 的操作有可能是不同的阻塞原语。 比如在某些应用里，你也许会为了等待新元素进入 Redis Set 而阻塞队列，直到有个新元素加入到 Set 中，这样就可以在不轮询的情况下获得元素。 这就要求要有一个 [SPOP](http://www.redis.cn/commands/spop.html) 的阻塞版本，而这事实上并不可用。但是我们可以通过阻塞 list 操作轻易完成这个任务。

消费者会做的：

```
LOOP forever
    WHILE SPOP(key) returns elements
        ... process elements ...
    END
    BRPOP helper_key
END

```

而在生产者这角度我们可以这样简单地使用：

```
MULTI
SADD key element
LPUSH helper_key x
EXEC
```
# 5 set结构
适用于无序的集合
点赞点踩,抽奖,已读,共同好友
## 1.  sadd key member [member ...]
**时间复杂度：**O(N)
添加一个或多个指定的member元素到集合的 key中.指定的一个或者多个元素member 如果已经在集合key中存在则忽略.
如果集合key 不存在，则新建集合key,并添加member元素到集合key中.
##2. scard
**时间复杂度：**O(1)
返回集合存储的key的基数 (集合元素的数量)
如果key不存在,则返回 0
##3. smembers key
**时间复杂度：**O(N)
返回key集合所有的元素.
该命令的作用与使用一个参数的[SINTER](http://www.redis.cn/commands/sinter.html) 命令作用相同.
## 4. sdiff key [key ...]
**时间复杂度：**O(N)
返回一个集合与给定集合的差集的元素
不存在的key认为是空集.
##5. sinner key [key ...]
**时间复杂度：**O(N*M)
返回指定所有的集合的成员的交集.
###返回值
[array-reply](http://www.redis.cn/topics/protocol.html#array-reply): 结果集成员的列表.
##6. sunion key [key ...]
**时间复杂度：**O(N) where N is the total number of elements in all given sets.
返回给定的多个集合的并集中的所有成员.
不存在的key可以认为是空的集合.
###返回值
[array-reply](http://www.redis.cn/topics/protocol#array-reply):并集的成员列表
##7. srandmember key [count]
**时间复杂度：**Without the count argument O(1), otherwise O(N) where N is the absolute value of the passed count
仅提供key参数,那么随机返回key集合中的一个元素.

Redis 2.6开始, 可以接受 count 参数,如果count是整数且小于元素的个数，返回含有 count 个不同的元素的数组,如果count是个整数且大于集合中元素的个数时,仅返回整个集合的所有元素,当count是负数,则会返回一个包含count的绝对值的个数元素的数组，如果count的绝对值大于元素的个数,则返回的结果集里会出现一个元素出现多次的情况.

仅提供key参数时,该命令作用类似于SPOP命令, 不同的是SPOP命令会将被选择的随机元素从集合中移除, 而SRANDMEMBER仅仅是返回该随记元素,而不做任何操作.
### 返回值
[bulk-string-reply](http://www.redis.cn/topics/protocol.html#bulk-string-reply): 不使用count 参数的情况下该命令返回随机的元素,如果key不存在则返回nil.
[array-reply](http://www.redis.cn/topics/protocol.html#array-reply): 使用count参数,则返回一个随机的元素数组,如果key不存在则返回一个空的数组.
##8. sismember key member
**时间复杂度：**O(1)
返回成员 member 是否是存储的集合 key的成员.
###返回值
[integer-reply](http://www.redis.cn/topics/protocol.html#integer-reply),详细说明
*   是则返回1
*   不是或者key不存在，则返回0
##9. srem key member [member ...]
**时间复杂度：**O(N)
在key集合中移除指定的元素. 
不是key集合中的元素则忽略 
如果key集合不存在则被视为一个空的集合，该命令返回0.
如果key的类型不是一个集合,则返回错误.
### 返回值
integer-reply:从集合中移除元素的个数，不包括不存在的成员
##10. spop  key [count]
时间复杂度：O(1)
从键的set值存储中移除并返回count个随机元素
#sorted set
##1. zadd key [NX|XX] [CH] [INCR] score member [score member ...]
将所有指定成员添加到键为key有序集合（sorted set）里
##2. zcard key
**时间复杂度：**O(1)
返回key的有序集元素个数
###返回值
[integer-reply](http://www.redis.cn/topics/protocol#integer-reply): key存在的时候，返回有序集的元素个数，否则返回0
##3. zscoer key member
**时间复杂度：**O(1)
返回有序集key中，成员member的score值。
如果member元素不是有序集key的成员，或key不存在，返回nil。
###返回值
[bulk-string-reply](http://www.redis.cn/topics/protocol#bulk-string-reply): member成员的score值（double型浮点数），以字符串形式表示
## 4. zcount key min max
**时间复杂度：**O(log(N)) with N being the number of elements in the sorted set.
返回有序集key中，score值在min和max之间(默认包括score值等于min或max)的成员。 
###返回值
[integer-reply](http://www.redis.cn/topics/protocol#integer-reply): 指定分数范围的元素个数
## 5. zrank key member
**时间复杂度：**O(log(N))
返回有序集key中成员member的排名。其中有序集成员按score值递增(从小到大)顺序排列。排名以0为底，也就是说，score值最小的成员排名为0。
使用ZREVRANK命令可以获得成员按score值递减(从大到小)排列的排名。
###返回值
*   如果member是有序集key的成员，返回[integer-reply](http://www.redis.cn/topics/protocol#integer-reply)：member的排名。
*   如果member不是有序集key的成员，返回[bulk-string-reply](http://www.redis.cn/topics/protocol#bulk-string-reply): `nil`。
## 6. zincrby key increment member
**时间复杂度：**O(log(N)) where N is the number of elements in the sorted set.
为有序集key的成员member的score值加上增量increment。如果key中不存在member，就在key中添加一个member，score是increment（就好像它之前的score是0.0）。如果key不存在，就创建一个只含有指定member成员的有序集合。
当key不是有序集类型时，返回一个错误。
score值必须是字符串表示的整数值或双精度浮点数，并且能接受double精度的浮点数。也有可能给一个负数来减少score的值。
###返回值
[Bulk string reply](http://www.redis.cn/topics/protocol#Bulk string reply): member成员的新score值，以字符串形式表示
##7. zrange key start stop [WITHSCORES]

##8. ZREVRANGE key start stop [WITHSCORES]
返回sorted set key中，指定区间内的成员。其中成员的位置按score值递减(从大到小)来排列。具有相同score值的成员按字典序的反序排列。 除了成员按score值递减的次序排列这一点外，[ZREVRANGE](http://www.redis.cn/commands/zrevrange.html)命令的其他方面和[ZRANGE](http://www.redis.cn/commands/zrange.html)命令一样。
##返回值
[array-reply](http://www.redis.cn/topics/protocol#array-reply): 指定范围的元素列表(可选是否含有分数)。

例子

```
redis> ZADD myzset 1 "one"
(integer) 1
redis> ZADD myzset 2 "two"
(integer) 1
redis> ZADD myzset 3 "three"
(integer) 1
redis> ZREVRANGE myzset 0 -1
1) "three"
2) "two"
3) "one"
redis> ZREVRANGE myzset 2 3
1) "one"
redis> ZREVRANGE myzset -2 -1
1) "two"
2) "one"
redis> 
```

## monitor 
[MONITOR](http://www.redis.cn/commands/monitor.html) 是一个调试命令，返回服务器处理的每一个命令，它能帮助我们了解在数据库上发生了什么操作，可以通过redis-cli和telnet命令使用.

# 6 Redis 复制
## PSYNC
2.8.0 起可用。

从主机启动复制流。
PSYNC 命令由 Redis 从节点调用，用于从主副本启动复制流。

## wait
此命令阻塞当前客户端，直到所有以前的写命令都成功的传输和指定的slaves确认。如果超时，指定以毫秒为单位，即使指定的slaves还没有到达，命令任然返回。

命令始终返回之前写命令发送的slaves的数量，无论是在指定slaves的情况还是达到超时。

注意点:
1. 当’WAIT’返回时，所有之前的写命令保证接收由WAIT返回的slaves的数量。
2. 如果命令呗当做事务的一部分发送，该命令不阻塞，而是只尽快返回先前写命令的slaves的数量。
3. 如果timeout是0那意味着永远阻塞。
4. 由于WAIT返回的是在失败和成功的情况下的slaves的数量。客户端应该检查返回的slaves的数量是等于或更大的复制水平。

### 一致性（Consistency and WAIT）
WAIT 不能保证Redis强一致：尽管同步复制是复制状态机的一个部分，但是还需要其他条件。不过，在sentinel和Redis群集故障转移中，WAIT 能够增强数据的安全性。

如果写操作已经被传送给一个或多个slave节点，当master发生故障我们极大概率(不保证100%)提升一个受到写命令的slave节点为master:不管是Sentinel还是Redis Cluster 都会尝试选slave节点中最优(日志最新)的节点，提升为master。

尽管是选择最优节点，但是仍然会有丢失一个同步写操作可能行。

### 实现细节
因为引入了部分同步，Redis slave节点在ping主节点时会携带已经处理的复制偏移量。 这被用在多个地方：
1. 检测超时的slaves
2. 断开连接后的部分复制
3. 实现WAIT

在WAIT实现的案例中，当客户端执行完一个写命令后，针对每一个复制客户端，Redis会为其记录写命令产生的复制偏移量。当执行命令WAIT时，Redis会检测 slaves节点是否已确认完成该操作或更新的操作。

### 返回值
integer-reply: 当前连接的写操作会产生日志偏移，该命令会返回已处理至该偏移量的slaves的个数。

例子

```shell
> SET foo bar
OK
> WAIT 1 0
(integer) 1
> WAIT 2 1000
(integer) 1
```
在例子中，第一次调用WAIT并没有使用超时设置，并且设置写命令传输到一个slave节点，返回成功。第二次使用时，我们设置了超时值并要求写命令传输到两个节点。 因为只有一个slave节点有效，1秒后WAIT解除阻塞并返回1–传输成功的slave节点数。