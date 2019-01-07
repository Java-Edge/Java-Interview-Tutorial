
# 1 Redis高并发跟整个系统的高并发之间的关系
Redis，你要搞高并发的话，不可避免，要把底层的缓存搞得很好

MySQL高并发，做到了，那么也是通过一系列复杂的分库分表，订单系统，事务要求的，QPS到几万，比较高了

要做一些电商的商品详情页，真正的超高并发，QPS上十万，甚至是百万，一秒钟百万的请求量

光是Redis是不够的，但是Redis是整个大型的缓存架构中，支撑高并发的架构里面，非常重要的一个环节

- 首先，你的底层的缓存中间件，缓存系统，必须能够支撑的起我们说的那种高并发
- 其次，再经过良好的整体的缓存架构的设计（多级缓存架构、热点缓存），支撑真正的上十万，甚至上百万的高并发

# 2 Redis不能支撑高并发的瓶颈
单机
![](https://img-blog.csdnimg.cn/20190506220559684.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 3 如果redis要支撑超过10万+的并发，何如？
单机的Redis几乎不太可能说QPS超过10万+，除非一些特殊情况，比如你的机器性能特别好，配置特别高，物理机，维护做的特别好，而且你的整体的操作不是太复杂

单机在几万

读写分离，一般来说，对缓存，一般都是用来支撑读高并发的，写的请求是比较少的，可能写请求也就一秒钟几千，一两千

大量的请求都是读，一秒钟二十万次读

读写分离

主从架构 -> 读写分离 -> 支撑10万+读QPS的架构

![](https://img-blog.csdnimg.cn/20190506220626223.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 4 接下来要讲解的一个topic
redis replication

redis主从架构 -> 读写分离架构 -> 可支持水平扩展的读高并发架构

- 参考
《Java工程师面试突击第1季-中华石杉老师》
