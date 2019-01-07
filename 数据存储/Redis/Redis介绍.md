Redis，全名`RE`mote `DI`ctionary `S`erver
Redis是一个编写的开源的高性能的KV内存数据库，支持数据持久化。
开源的支持多种数据结构的基于键值的存储服务系统，高性能、功能丰富。

# 1 高性能
底层使用ANSI C语言编写，内存数据库，通讯采用epolI非阻塞I/O多路复用机制。

- 提供了Java , C/C++ , C# , PHP , JavaScript ,Perl, Object-C , Python , Ruby , Erlang等客户端
- 从2010年3月15日起, Redis的开发工作由VMware主持
- 从2013年5月开始, Redis的开发由Pivotal赞助

# 2 线程安全
Redis 操作都是单线程，原子性的。多线程其实体现在数据解析和同步数据。底层内部的核心操作还是单线程的。

# 3 丰富的功能
## 3.1 数据结构
![](https://img-blog.csdnimg.cn/img_convert/701421b431088e3665d78f43131e2b49.png)
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
