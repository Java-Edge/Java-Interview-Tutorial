> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

网上写的很多很散，比较权威的咱们看看 Redis 作者在 Stack Overflow 问答给出的几个对比维度。
# 1 不应该太在意的维度
## 1.1 性能
- 平均到单核的性能，在单条数据不大时，Redis更快。以前因为Redis是单线程的，只能使用一个核。而Memcached是多线程的，所以对一个实例来说，性能上肯定是Memcached占优势。但现在Redis 6.x 已经支持多线程，Redis 在这点也没劣势了。
- memcached可通过单个可执行文件和TCP端口使用多个内核，而无需客户端的帮助的多线程、非阻塞 IO 模式。memcached可以更快地获得大约100k的大值数据。Redis最近对大值（不稳定的分支）进行了很多改进，但是在这种场景下，memcached仍然更快（不过这个回答已经是很多年前了，现在优化的应该也没劣势了）。
这里的重点是：`任何一个查询都不应该成为它们每秒可以提供的查询的瓶颈`。
# 2 应该在意的维度
## 2.1 内存利用率
- 对于简单的键/值对，memcached的内存利用率更高。
- 而如果Redis采用hash结构存储键/值对，由于其组合式的压缩，其内存利用率会高于Memcached。

## 2.2 持久化和复制
- Memcached都不支持。
- 仅在Redis中可用的两个功能。即使你的目标是建立缓存，它也可以帮助你在升级或重启后仍然保留数据。
## 2.3 所需的数据类型
- Memcached是一个内存中键值存储，用于存储来自数据库调用，API调用或页面呈现结果的小数据块（字符串、对象）。通常需要将数据拿到客户端（即只能在客户端完成计算）来进行类似的修改再set回去，这大大增加了网络I/O的次数和数据大小。
- 在Redis中，提供更多复杂的数据类型，因此也能支持更多应用场景。即使仅考虑缓存场景，通常也可以在单个操作中完成更多操作，而无需在客户端处理数据（即Redis支持服务器端数据计算），该操作通常和普通的GET和SET一样快。因此，如果你不仅需要GET / SET，还需要更复杂的功能，则Redis可以提供很大帮助（请考虑使用时间轴缓存）。
##   2.4 集群模式
- memcached没有原生的集群模式，需要依靠客户端来实现往集群中分片写入数据
- 但是redis目前是原生支持cluster模式的，redis官方就是支持redis cluster集群模式的，比memcached来说要更好

# 3 总结
没有场景，就难以选型，但Redis在很多事情上都是有意义的，因为即使你不想将其用作数据库，也可以通过使用更多功能来解决更多问题，不只是缓存，甚至是消息队列，排名等。

参考：
- https://stackoverflow.com/questions/2873249/is-memcached-a-dinosaur-in-comparison-to-redis
- https://github.com/memcached/memcached/wiki


![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)