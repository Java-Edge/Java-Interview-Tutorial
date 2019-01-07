# 1 概述

## 1.1 zookeeper 简介
- 中间件,提供协调服务
- 作用于分布式系统,发挥其优势,可以为大数据服务
- 支持 Java, 提供 Java 和 C语言的客户端 API
## 1.2 什么是分布式系统
- 很多台计算机组成一个整体,一个整体一致对外并且处理同一请求
- 内部的每台计算机都可以相互通信(REST/RPC)
- 客户端到服务端的一次请求到响应结束会经历多台计算机
## 1.3 分布式系统的瓶颈
### 1.3.1 zookeeper 的特性
- 一致性
数据一致性,数据按照顺序分批入库
- 原子性
事务要么成功要么失败,不会局部化
- 单一视图
客户端连接集群中的任一 zk 节点,数据都是一致的
- 可靠性
每次对 zk的操作状态都会保存在服务端
- 实时性
客户端可以读取到 zk 服务端的最新数据

# 2 下载、安装以及配置 
安装 JDK
## 2.1 单机模式

### 2.1.1 Linux环境操作
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTZiNjMxZTM4YTYyY2MxZGEucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTcwMDc1MzU4MGVjODUyZGMucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTI2MWI4MmZlMjI2NDc1NDcucG5n?x-oss-process=image/format,png)

![linux etc/profile](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWRlYWU3NTFjNTVhMzJiN2EucG5n?x-oss-process=image/format,png)

### 2.1.2 Mac OS操作
```
$brew install zookeeper
==> Downloading https://homebrew.bintray.com/bottles/zookeeper-3.4.6_1.mavericks.bottle.2.tar.gz
######################################################################## 100.0%
==> Pouring zookeeper-3.4.6_1.mavericks.bottle.2.tar.gz
==> Caveats
To have launchd start zookeeper at login:
  ln -sfv /usr/local/opt/zookeeper/*.plist ~/Library/LaunchAgents
Then to load zookeeper now:
  launchctl load ~/Library/LaunchAgents/homebrew.mxcl.zookeeper.plist
Or, if you don't want/need launchctl, you can just run:
  zkServer start
==> Summary

```

- 安装后，在/usr/local/etc/zookeeper/目录下，已经有了默认的配置文件
![](https://img-blog.csdnimg.cn/20190831224753215.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 配置[/usr/local/etc/zookeeper/zoo.cfg] 文件
```
# The number of milliseconds of each tick
tickTime=2000
# The number of ticks that the initial
# synchronization phase can take
initLimit=10
# The number of ticks that can pass between
# sending a request and getting an acknowledgement
syncLimit=5
# the directory where the snapshot is stored.
# do not use /tmp for storage, /tmp here is just
# example sakes.
dataDir=/usr/local/var/run/zookeeper/data
# the port at which the clients will connect
clientPort=2181
# the maximum number of client connections.
# increase this if you need to handle more clients
#maxClientCnxns=60
#
# Be sure to read the maintenance section of the
# administrator guide before turning on autopurge.
#
# http://zookeeper.apache.org/doc/current/zookeeperAdmin.html#sc_maintenance
#
# The number of snapshots to retain in dataDir
#autopurge.snapRetainCount=3
# Purge task interval in hours
# Set to "0" to disable auto purge feature
#autopurge.purgeInterval=1
```

- 在bin下有很多可执行文件
![](https://img-blog.csdnimg.cn/20190901100223178.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 3 常用命令
## 3.1 启动
- 执行命令zkServer
![](https://img-blog.csdnimg.cn/20190831225057740.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- zkServer status
![](https://img-blog.csdnimg.cn/20190901095002120.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- zkServer start
![](https://img-blog.csdnimg.cn/20190901095055784.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 3.2 查看运行状态

![](https://img-blog.csdnimg.cn/20190901100422776.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)