# 简介
Redis，全名`RE`mote `DI`ctionary `S`erver，开源的高性能的KV内存数据库，支持数据持久化。
开源的支持多种数据结构的基于键值的存储服务系统，高性能、功能丰富。

提供了Java , C/C++ , C# , PHP , JavaScript ,Perl, Object-C , Python , Ruby , Erlang等客户端
- 从2010年3月15日起, Redis的开发工作由VMware主持
- 从2013年5月开始, Redis的开发由Pivotal赞助
# 1 高性能
- 底层使用ANSI C语言编写，纯内存数据库，所以读取速度快
- 通讯采用epolI非阻塞I/O多路复用机制，减少了线程切换时上下文的切换和竞争
- Redis采用单线程的模型，保证了每个操作的原子性，也减少了线程的上下文切换和竞争
- Redis存储结构多样化，不同的数据结构对数据存储进行了优化加快读取的速度
- Redis采用自己实现的事件分离器，效率比较高，内部采用非阻塞的执行方式，吞吐能力比较大。

Redis能读的速度是11w次/s,写的速度是81000次/s。

官方bench-mark数据：测试完成了50个并发执行100000个请求。设置和获取的值是一个256字节字符串。 
结果：读的速度是10000次/s，写的速度是81000次/s。redis尽量少写多读，符合缓存的适用要求。单机redis支撑万级， 如果10万+可采用主从复制的模式。


# 单线程
Redis 作为一个进程，一直是多线程的。
## IO线程
- redis 6前（2020年5月），单线程
- redis 6后，多线程，NIO模型 ==> 主要的性能提升点 

## 内存处理线程
- 单线程
高性能的核心


## 原因
- 无需各种锁的性能消耗
- 单线程多进程的集群方案
- CPU 消耗

## 单进程单线程优势
- 代码更清晰，处理逻辑更简单
- 不用去考虑各种锁的问题，不存在加锁释放锁操作，没有因为可能出现死锁而导致的性能消耗
- 不存在多进程或者多线程导致的切换而消耗CPU

### 单进程单线程弊端
- 无法发挥多核CPU性能，不过可以通过在单机开多个Redis实例来完善

# 2 线程安全
Redis 操作都是单线程，原子性的。多线程其实体现在数据解析和同步数据。底层内部的核心操作还是单线程的。

# 3 丰富的功能
## 3.1 数据结构
string、hash、list、set、sorted set，raw、int、ht、zipmap、linkedlist、ziplist、intset。
## 3.2  持久化
- RDB持久化
- AOF持久化
- 4.0 引入RDB- AOF混合持久化

## 3.3 主从模式
## 3.4 哨兵
## 集群
## 模块化


# 4 适用场景
缓存、分布式锁、队列、集合、GEO、BitMap、消息队列等。

- 主流互联网微服务架构下的 redis

![](https://img-blog.csdnimg.cn/20201221160230748.JPG?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
# 常见缓存中间件对比
![](https://img-blog.csdnimg.cn/20201221170911359.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 发展史

## Redis2.6
1)键的过期时间支持毫秒。
2)从节点支持只读功能。
## Redis2.8
1)可以用bind命令绑定多个IP地址。
2)发布订阅添加了pub/sub.
3) Redis Sentinel第二版, 相比于Redis2.6的Redis Sentinel, 此版本已经变成生产可用。
## Redis3.0 (里程碑)
1) Redis最大的改动就是添加Redis的分布式实现Redis Cluster。
## Redis3.2
Redis3.2在2016年5月6日正式发布，相比于Redis3.0主要特征如下:
1)添加GE0相并功能。
2)新的List编码类型: quicklist.
## Redis4.0 (重大改版)
1)提供了模块系统，方便第三方开发者拓展Redis的功能。
2)提供了新的缓存剔除算法: LFU (Last Frequently Used)，并对已有算法进行了优化。
3)提供了非阻塞del和flushall/flushdb功能,有效解决删除了bigkey可能造成的Redis阻塞。
4)提供了RDB-AOF混合持久化格式，充分利用了'AOF和RDB各自优势。

## Redis5.0
1)新的Stream数据类型。
2)客户经常连接和断开连接时性能更好。
## Redis6.0
1) 多线程。多线程部分只是用来处理网络数据的读写和协议解析，执行命令仍然是单线程。

# 使用场景
## 业务数据缓存
- 通用数据缓存
string，int，list，map

- 实时热数据，最新N条数据
- 会话缓存，token缓存

## 业务数据处理
- 非严格一致性要求的数据：评论，点击等
- 业务数据去重：订单处理的幂等校验等
- 业务数据排序：排名，排行榜等

## 全局一致计数
- 全局流控计数
简单的限流组件
- 秒杀的库存计算
- 抢红包
- 全局ID生成

## 高效统计计数
- id去重
记录访问ip等全局bitmap操作
- UV、PV等访问量
非严格一致性要求
## 发布订阅与Stream
- Pub-Sub 模拟队列 subscribe comments publish comments java
![](https://img-blog.csdnimg.cn/20210205234355569.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- Redis Stream 是 Redis 5.0 版本新增加的数据结构。 Redis Stream 主要用于MQ。可参考 https://www.runoob.com/redis/redis-stream.html![](https://img-blog.csdnimg.cn/20210205234412361.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
## 分布式锁
- 获取锁 原子性操作 
`SET dlock my_random_value NX PX 30000`

- 释放锁，lua脚本，保证原子性+单线程，从而具有事务性 

```lua
if redis.call("get",KEYS[1]) == ARGV[1] then 
	return redis.call("del",KEYS[1]) 
else 
	return 0 
end 
```

关键点：原子性、互斥、超时

# Redis Lua
类似于数据库的存储过程，mongodb的js脚本。
open resty = nginx + lua jit。


直接执行 

```bash
eval "return'hello java'" 0 
eval "redis.call('set',KEYS[1],ARGV[1])" 1 lua-key lua-value
```


预编译 
script load script脚本片段 
返回一个SHA-1签名 shastring 

```bash
evalsha shastring keynum [key1 key2 key3 ...] [param1 param2 param3 ...]
```