# 1 Redis分布式算法原理

## 1.1 传统分布式算法

![举个例子](http://upload-images.jianshu.io/upload_images/4685968-5c1cb1df981c0b7c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
 ![](http://upload-images.jianshu.io/upload_images/4685968-29e7f518af44976c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/4685968-42557a8e685b46d3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![蓝色表与4个节点时相同槽](http://upload-images.jianshu.io/upload_images/4685968-0d4f3d16c4265f4b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/4685968-a94bed84b8cb3e26.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/4685968-e927570534e48183.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 1.2 Consistent hashing一致性算法原理
- 环形 hash 空间：按照常用的 hash 算法来将对应的 key 哈希到一个具有 232 个桶的空间，即（0-232-1）的数字空间中，现在我们将这些数字头尾相连，想象成一个闭合的环形
- 把数据通过一定的 hash 算法映射到环上
- 将机器通过一定的 hash 算法映射到环上
- 节点按顺时针转动，遇到的第一个机器，就把数据放在该机器上 
![](http://upload-images.jianshu.io/upload_images/4685968-2476ec31828ad0c4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/4685968-02b2746f7824f19c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![ ](http://upload-images.jianshu.io/upload_images/4685968-22f8b7bff7177de6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
在移除 or 添加一个 cache 时，他能够尽可能小的改变已经存在 key 映射关系
![](http://upload-images.jianshu.io/upload_images/4685968-2f12b00ac8807fce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![删除CacheB后,橙色区为被影响范围](http://upload-images.jianshu.io/upload_images/4685968-70f0b98dbeee1a9f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/4685968-55a087651d90f824.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![也许心中的分布式这样的](http://upload-images.jianshu.io/upload_images/4685968-69729b4979a27a37.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![但实际会这样拥挤-即倾斜性](http://upload-images.jianshu.io/upload_images/4685968-b26fc49122f8898b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##1.3 Hash倾斜性
![](http://upload-images.jianshu.io/upload_images/4685968-52cc24cb673f8313.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
为解决此类事件,引入了虚拟节点
![](http://upload-images.jianshu.io/upload_images/4685968-9a233266814a9bfd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/4685968-0e85f1c5a6b813cf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![服务器台数n,新增服务器数m](http://upload-images.jianshu.io/upload_images/4685968-c3f4ec8e890d2e9d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#2 Redis分布式环境配置
![启动两台Redis-server](http://upload-images.jianshu.io/upload_images/4685968-420a6f79a5543ddb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 3  Redis分布式服务端及客户端启动
![](http://upload-images.jianshu.io/upload_images/4685968-3d82384b1a8dd628.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#4封装分布式Shared Redis API
##4.1 SharedJedis源码解析
![ShardedJedis.png](http://upload-images.jianshu.io/upload_images/4685968-9c7c2de780d0c75a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##封装RedisSharedPool
##测试代码
##集成测试
#5 Redis分布式环境验证
![](http://upload-images.jianshu.io/upload_images/4685968-19822fc1998dd190.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 6 集群和分布式

- 分布式：不同的业务模块拆分到不同的机器上，解决高并发的问题。 工作形态 redis服务器各工作方式不同一般称为Redis分布式

- 集群：同一个业务部署在多台机器上，提高系统可用性 是物理形态,一般称Tomcat集群。
集群可能运行着一个或多个分布式系统，也可能根本没有运行分布式系统；分布式系统可能运行在一个集群上，也可能运行在不属于一个集群的多台（2台也算多台）机器上。

你前台页面有10个用户，分别发送了1个请求，那么如果不是集群的话，那这10个请求需要并行在一台机器上处理，如果每个请求都是1秒钟，那么就会有一个人等待10秒钟，有一个人等待9秒钟，以此类推；那么现在在集群环境下，10个任务并分发到10台机器同时进行，那么每个人的等待时间都还是1秒钟；
当然，你说的浪费确实是，如果系统的并发不是很高，只有一台或者两台机器就能处理的话，那确实是有很大的浪费。