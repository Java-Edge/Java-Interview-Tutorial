| BIO |NIO  |AIO
|--|--|--|
| Thread-Per-Connection | Reactor |  Proactor|

# 什么是Reactor
Reactor是一种开发模式，模式的核心流程:
注册感兴趣的事件->扫描是否有感兴趣的事件发生->事件发生后做出相应的处理。

| client/Server |SocketChannel/ServerSocketChannel  | OP_ACCEPT|OP_CONNECT   |OP_WRITE|OP_READ
|--|--|--|--|--|--|
| client | SocketChannel |  |Y|Y|Y|Y|
| client | ServerSocketChannel | Y |||||
| client | SocketChannel |||Y|Y|
# 三种版本
## Thread-Per-Connection模式![](https://img-blog.csdnimg.cn/20201210220757211.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

注意到每个 handler 里的 read 和 send都是阻塞操作，那用线程池不就行了？但那只是避免了线程数量无限增长而已，依旧无法避免等待线程的阻塞。
![](https://img-blog.csdnimg.cn/2020121022133866.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- Reactor 模式 V1：单线程，一个线程太累啦，而且他一旦挂了，整个系统挂了。相当于创业初期，老板就是个全干工程师。
![](https://img-blog.csdnimg.cn/20201210221414672.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- Reactor 模式 V2：多线程，老板开始招合伙人了，大家一起干！![](https://img-blog.csdnimg.cn/20201210221611888.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- Reactor 模式 V3：主从多线程。对于服务器来说，最重要的莫过于接收连接，使用主线程做这些事。老板真的成为资本家了，开始招聘打工人啦！老板只负责最关键的事情即可。
![](https://img-blog.csdnimg.cn/20201210221718404.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 在 netty 中使用 reactor 模式
```java
# Reactor单线程模式
EventLoopGroup eventGroup = new NioEventLoopGroup(1);
ServerBootstrap serverBootstrap = new ServerBootstrap();
serverBootstrap.group(eventGroup);

# 非主从Reactor多线程模式
EventLoopGroup eventGroup = new NioEventLoopGroup();
ServerBootstrap serverBootstrap = new ServerBootstrap();
I serverBootstrap.group eventGroup);

# 主从Reactor多线程模式
EventLoopGroup bossGroup = new NioEventLoopGroup();
EventLoopGroup workerGroup = new NioEventLoopGroup();
ServerBootstrap serverBootstrap = new ServerBootstrap();
serverBootstrap.group( bossGroup, workerGroup);
```
●Netty 如何支持主从Reactor模式的?
●为什么说Netty的main reactor大多并不能用到- -个线程组，只能线程组里面的一-个?
●Netty 给Channel 分配NIO event loop的规则是什么
●通用模式的NIO实现多路复用器是怎么跨平台的
https://github.com/frohoff/ jdk8u-
jdk/blob/ master/src/macosx/ classes/sun/ nio/ch/DefaultSelectorProvider.java

# 源码解析
跨平台实现的根本

```java
    public static SelectorProvider provider() {
        synchronized (lock) {
            if (provider != null)
                return provider;
            return AccessController.doPrivileged(
                new PrivilegedAction<SelectorProvider>() {
                    public SelectorProvider run() {
                            if (loadProviderFromProperty())
                                return provider;
                            if (loadProviderAsService())
                                return provider;
                            provider = sun.nio.ch.DefaultSelectorProvider.create();
                            return provider;
                        }
                    });
        }
    }
```
![](https://img-blog.csdnimg.cn/20201210224408226.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
