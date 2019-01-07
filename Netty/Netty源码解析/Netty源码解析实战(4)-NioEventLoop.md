# 1  NioEventLoop概述
- Netty服务端默认起多少个线程?何时启动?
- Netty如何解决JDK空轮询bug?
- Netty如何保证异步串行无锁化?

综述：
- NioEventLoop创建
- NioEventLoop启动
- NioEventLoop执行逻辑

# 2 NioEventLoop创建
## 概述
new NioEventLoopGroup) [线程组，默认 2*cpu]
- new ThreadPerTaskExecutor() [线程创建器]
- for() {newChild() } [构造 NioEventLoop]
- chooserFactory.newChooser() [线程选择器]

![](https://img-blog.csdnimg.cn/20201223151600107.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/img_convert/9d66f715ed513663b5a81314f2407a08.png)
![](https://img-blog.csdnimg.cn/img_convert/d6d7f15501ef57c946d0cef368267e41.png)
![](https://img-blog.csdnimg.cn/img_convert/7ee54a6793057dac0108040c503f90df.png)
![](https://img-blog.csdnimg.cn/img_convert/26f5c2f895eab5c650a1a50ddf2e38d6.png)
![](https://img-blog.csdnimg.cn/img_convert/f008249acab8670ac65c455854685c20.png)
![](https://img-blog.csdnimg.cn/img_convert/340d1f61b5e1899dd3fb90f5a740d659.png)
![](https://img-blog.csdnimg.cn/img_convert/183d5860d611b7a77c45ff6dccee0b1a.png)
![](https://img-blog.csdnimg.cn/img_convert/0ec8c44bdac281dab3f04e4c2081f154.png)
对应

```java
new NioEventLoopGroup) [线程组，默认 2*cpu]
```

![](https://img-blog.csdnimg.cn/img_convert/d1ad45077e4f781cde935ba4b422518c.png)
对应
```java
new ThreadPerTaskExecutor() [线程创建器]
```
![](https://img-blog.csdnimg.cn/img_convert/4e4f1e8d4cb971315d039b0a149a89e2.png)
对应

```java
for() {newChild() } [构造 NioEventLoop]
```

![](https://img-blog.csdnimg.cn/img_convert/1d351bd98c99048ec7f02c6a02927d4f.png)
对应

```java
chooserFactory.newChooser() [线程选择器]
```

# 3 ThreadPerTaskThread

# 2 服务端Channel的创建
- 服务端的socket在哪里初始化?
- 在哪里accept连接?

## 流程
创建服务端Channel
- bind() [用户代码入口]
- initAndRegister() [初始化并注册]
- newChannel() [创建服务端channel]

初始化服务端Channel
注册selector
端口绑定

下面看源码：
bind 对应样例的
![跟进调试](https://img-blog.csdnimg.cn/img_convert/d256fd162c9317b9c8c2fedd1e3ba05a.png)
![](https://img-blog.csdnimg.cn/img_convert/1f30c41ff19f8fa11ff17bcb4c278d40.png)
![](https://img-blog.csdnimg.cn/img_convert/1a0cef536f0f8ec83e5d9d7d55f4b836.png)
![](https://img-blog.csdnimg.cn/img_convert/c009d08795bd7e5fdec6665c1c742844.png)
![](https://img-blog.csdnimg.cn/img_convert/3fc8f6a93ba36c3a9751b34cc2e013ea.png)
- 通过反射创建的 channel![](https://img-blog.csdnimg.cn/img_convert/aba26ca33a0b0458fdb05da49dab4326.png)
看看 channelFactory
![](https://img-blog.csdnimg.cn/img_convert/6d511919d23f6fbb312671cb768661aa.png)
![](https://img-blog.csdnimg.cn/img_convert/472c63d6530f7a6b060d95b056227e60.png)
- 反射创建服务端 Channel
newSocket() [通过jdk来创建底层jdk channel]
NioServerSocketChannelConfig0 [tcp 参数配置类]
AbstractNioChannel()
	- configureBlocking(false) [阻塞模式]
	- AbstractChannel() [创建 id，unsafe,pipeline]

下面来看这个流程，首先

```java
newSocket() [通过jdk来创建底层jdk channel]
```

![](https://img-blog.csdnimg.cn/img_convert/8912efe382d0f21938b12429861c5d19.png)
- 创建完毕了![](https://img-blog.csdnimg.cn/img_convert/06732a3e0c9d691d38857676045af43b.png)

```java
NioServerSocketChannelConfig0 [tcp 参数配置类]
```

![](https://img-blog.csdnimg.cn/img_convert/6bf1158850ee4b0df7ab1ad4dee4cfe4.png)

```java
AbstractNioChannel()
```

- ANC

```java
configureBlocking(false) [阻塞模式]
```

![](https://img-blog.csdnimg.cn/img_convert/c07cfa6c1938fc654ec2be11f3b7c143.png)
![](https://img-blog.csdnimg.cn/img_convert/8da2f84bfeed249c3e269d4678c3253e.png)
![](https://img-blog.csdnimg.cn/img_convert/a07800c1881ef866dff58c8547250d0e.png)

```java
AbstractChannel() [创建 id，unsafe,pipeline]
```

![](https://img-blog.csdnimg.cn/img_convert/4336a837f16f8f025412a2ac58a54939.png)
![](https://img-blog.csdnimg.cn/img_convert/7a1619552cbd128abdbd8e9013b5d8e9.png)
# 4 创建NioEventLoop线程
newchild()
- 保存线程执行器 ThreadPerTaskExecutor
- 创建一个 MpscQueue
- 创建一个 selector
![](https://img-blog.csdnimg.cn/img_convert/52dfd070a2d5340ff8efa12e691ebd3b.png)
![](https://img-blog.csdnimg.cn/img_convert/0f91167f3e77a945edac83c5f804f1ab.png)
![](https://img-blog.csdnimg.cn/img_convert/c761de1900f27d4a211d6c1b0e6fc2b0.png)
![](https://img-blog.csdnimg.cn/img_convert/da9e6fd66a76b75d22550e608d9fd95a.png)
![](https://img-blog.csdnimg.cn/img_convert/0e2034461af8a85f9751d257727b4f48.png)
![](https://img-blog.csdnimg.cn/img_convert/6a480ba1569662cad30357d3ea2babf4.png)
![](https://img-blog.csdnimg.cn/img_convert/2d8d0be8401691091e37dc2320edace0.png)
![](https://img-blog.csdnimg.cn/img_convert/3c374af70091948d6b11cfc9ec53bb92.png)
# 5 创建线程选择器
```java
chooser = chooserFactory.newChooser(children);
```
NioEventLoopGroup.next()
![](https://img-blog.csdnimg.cn/20201223161225505.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

isPowerOfTwo() [判断是否为 2 的幂]
- PowerOfTwoEventExecutorChooser [优化]
	- index++ & (length-1)
- GenericEventExecutorChooser [普通]
	- abs(index++ % length)
![](https://img-blog.csdnimg.cn/img_convert/2d9bd47d5d3b5ee6438f861f9eb73882.png)
- 先看看普通的
![](https://img-blog.csdnimg.cn/img_convert/4d0912983f2483c8b53beefaaa94f3a2.png)
![](https://img-blog.csdnimg.cn/img_convert/e29b02799b1a5d35f93cf9d7db33582d.png)
- 再看幂2的
![](https://img-blog.csdnimg.cn/img_convert/de174a5b24bc2a748ca069d8d0495fe3.png)

> 循环取数组索引下标,& 比取模性能更高

# 6 NioEventLoop的启动
NioEventLoop启动触发器
- 服务端启动绑定端口
- 新连接接入通过chooser绑定一 个NioEventLoop

NioEventLoop启动
- bind() > execute(task) [入口]
![](https://img-blog.csdnimg.cn/img_convert/73c89cdef38f853dab21cf2b9408d71c.png)
- startThread() -> doStartThread() [创建线程]
![](https://img-blog.csdnimg.cn/img_convert/215a414b066961fc2801e0eaf05b4b97.png)
![](https://img-blog.csdnimg.cn/img_convert/07ad1eea1cfdb8195626a08ed10dcedd.png)
![](https://img-blog.csdnimg.cn/img_convert/e091d554c96fa04a09f49ec04f9d28df.png)
![](https://img-blog.csdnimg.cn/img_convert/df8621beab8f8377c42052b89014edff.png)
![](https://img-blog.csdnimg.cn/img_convert/54d091da288b8e07a58d0f9adc6fa458.png)
![](https://img-blog.csdnimg.cn/img_convert/d1ed8d630dafe9d7f1fd1027cb19c234.png)
- ThreadPerTaskExecutorexecute()
![](https://img-blog.csdnimg.cn/img_convert/2795b42f3a35af454e2a6b05d4bb5389.png)
![](https://img-blog.csdnimg.cn/img_convert/95a92a64b35ec7159a10db98c2a86dea.png)
- thread = Thread.currentThread()
![](https://img-blog.csdnimg.cn/img_convert/befacb3e2081e03d2e0b006959dce22e.png)
- NioEventLoop.run() [启动]
![](https://img-blog.csdnimg.cn/img_convert/9313566c3cf468bf1ee27e547b90c6b0.png)
# 7 NioEventLoop执行概述
# 8 检测IO事件
select()方法执行逻辑

- deadline以及任务穿插逻辑处理![](https://img-blog.csdnimg.cn/img_convert/ac5edde5456c436e7cc234f00cc218c5.png)
![](https://img-blog.csdnimg.cn/img_convert/3668e9fae48ebc10053b317121a1d159.png)
![](https://img-blog.csdnimg.cn/img_convert/4df5843d6308f8146cb9933e728bfc2a.png)
![](https://img-blog.csdnimg.cn/img_convert/950db20673b9a84d4ccc8bc79275c22f.png)

- 阻塞式select
![](https://img-blog.csdnimg.cn/img_convert/184237a5998d0d6b7f1d87f2c204f1c9.png)
- 避免jdk空轮训的bug
![执行至此,说明已进行了一次阻塞式的 select 操作](https://img-blog.csdnimg.cn/img_convert/b8e2124b5f60c76597e9fb87bad8b23a.png)
![产生空轮询的判断](https://img-blog.csdnimg.cn/img_convert/f630c4e0deef4f8b4fe12298ff96985b.png)
![当空轮询次数大于阈值](https://img-blog.csdnimg.cn/img_convert/ad23f94babfaca6516e80cfbcebe9259.png)
![阈值定义](https://img-blog.csdnimg.cn/img_convert/d5ab6293c09bd535c4b7a96d2e40b5bd.png)
![](https://img-blog.csdnimg.cn/img_convert/2384b6ec96c2c9a67cde52f500ba9608.png)
![阈值](https://img-blog.csdnimg.cn/img_convert/356f7ef2a3775b83ab89f97209d978d3.png)
![](https://img-blog.csdnimg.cn/img_convert/1220e12d4fadd66d6ed91b97ceb1bd45.png)

避免空轮询的再次发生
- 创建新选择器
![](https://img-blog.csdnimg.cn/img_convert/121cbee44c0067b8829d9bc957995b39.png)
- 获取旧选择器的所有 key 值![](https://img-blog.csdnimg.cn/img_convert/a8f1c62908c8f82c6d56fe2187b19da6.png)
- netty 包装的 channel![](https://img-blog.csdnimg.cn/img_convert/165f0d0b3de1475edd0e3e917f94be1a.png)
- 更新选择器的 key![](https://img-blog.csdnimg.cn/img_convert/e34d471b2a7d5057508de3301fdd6f02.png)
- 至此,解决了空轮bug![](https://img-blog.csdnimg.cn/img_convert/ec66df06f21a73300f8bdeadf83b3a1d.png)
# 9 处理IO事件

processSelectedKey 执行流程
- selected keySet优化
![](https://img-blog.csdnimg.cn/img_convert/e1d54553af3d2cd8699ec594a295c9b6.png)
![原生JDK创建一个 selector](https://img-blog.csdnimg.cn/img_convert/17abb583fb689ddecfd69a2dc082d816.png)
![](https://img-blog.csdnimg.cn/img_convert/8c5424f942fd568ddd25a3009ec3be56.png)
![单线程处理,其实不需要两个数组,后续版本已经是一个数组](https://img-blog.csdnimg.cn/img_convert/c4ed4b5127a5fc54018bf31690206818.png)
![只需关注](https://img-blog.csdnimg.cn/img_convert/8efd1bf5fdf56939fd8d19692cfb599c.png)
![根本不需要此三个方法](https://img-blog.csdnimg.cn/img_convert/7e1fb17aaa9c123065775276751c5899.png)
![](https://img-blog.csdnimg.cn/img_convert/38e62804b607b5ad14ed447846f8ca50.png)
![通过反射](https://img-blog.csdnimg.cn/img_convert/7f6ddd5c7fe2a0d1db8988b7de8d6899.png)
![即此类](https://img-blog.csdnimg.cn/img_convert/bc0ee36affd4454cfb91748a7e0896e6.png)
![](https://img-blog.csdnimg.cn/img_convert/090fbbfef0f2ec8074f55acbb3957fac.png)
![继续反射流程](https://img-blog.csdnimg.cn/img_convert/e606c84deb713c9e27f39b3a7c2880b8.png)
![替换为优化后的 set 集合](https://img-blog.csdnimg.cn/img_convert/8ece940fa620e81735d752340d404eab.png)
一句话总结:用数组替换HashSet 的实现,做到 add 时间复杂度为O(1)
- processSelectedKeysOptimized
![](https://img-blog.csdnimg.cn/img_convert/9bd05d468863727d596ce301870f135f.png)
![](https://img-blog.csdnimg.cn/img_convert/4a2b64b5c1722df8da5bbd5338c7b640.png)
![](https://img-blog.csdnimg.cn/img_convert/75dc0d868168053b636955a25ca41c34.png)
```java
 private void processSelectedKey(SelectionKey k, AbstractNioChannel ch) {
        final AbstractNioChannel.NioUnsafe unsafe = ch.unsafe();
        if (!k.isValid()) {
            final EventLoop eventLoop;
            try {
                eventLoop = ch.eventLoop();
            } catch (Throwable ignored) {
                // If the channel implementation throws an exception because there is no event loop, we ignore this
                // because we are only trying to determine if ch is registered to this event loop and thus has authority
                // to close ch.
                return;
            }
            // Only close ch if ch is still registerd to this EventLoop. ch could have deregistered from the event loop
            // and thus the SelectionKey could be cancelled as part of the deregistration process, but the channel is
            // still healthy and should not be closed.
            // See https://github.com/netty/netty/issues/5125
            if (eventLoop != this || eventLoop == null) {
                return;
            }
            // close the channel if the key is not valid anymore
            unsafe.close(unsafe.voidPromise());
            return;
        }

        try {
            int readyOps = k.readyOps();
            // We first need to call finishConnect() before try to trigger a read(...) or write(...) as otherwise
            // the NIO JDK channel implementation may throw a NotYetConnectedException.
            if ((readyOps & SelectionKey.OP_CONNECT) != 0) {
                // remove OP_CONNECT as otherwise Selector.select(..) will always return without blocking
                // See https://github.com/netty/netty/issues/924
                int ops = k.interestOps();
                ops &= ~SelectionKey.OP_CONNECT;
                k.interestOps(ops);

                unsafe.finishConnect();
            }

            // Process OP_WRITE first as we may be able to write some queued buffers and so free memory.
            if ((readyOps & SelectionKey.OP_WRITE) != 0) {
                // Call forceFlush which will also take care of clear the OP_WRITE once there is nothing left to write
                ch.unsafe().forceFlush();
            }

            // Also check for readOps of 0 to workaround possible JDK bug which may otherwise lead
            // to a spin loop
            if ((readyOps & (SelectionKey.OP_READ | SelectionKey.OP_ACCEPT)) != 0 || readyOps == 0) {
                unsafe.read();
                if (!ch.isOpen()) {
                    // Connection already closed - no need to handle write.
                    return;
                }
            }
        } catch (CancelledKeyException ignored) {
            unsafe.close(unsafe.voidPromise());
        }
    }
```
Netty 默认通过反射将selector 底层的 HashSet 实现转为数组优化
处理每个 ketSet 时都会取到对应的 attachment,即在向 selector注册 io 事件时绑定的经过 Netty 封装后的 channel
# 10 reactor线程任务的执行
runAllTasks()执行流程

- task 的分类和添加
![](https://img-blog.csdnimg.cn/img_convert/74844f53dd299d1faf147c542d105a04.png)
![](https://img-blog.csdnimg.cn/img_convert/c2ff7576eb58afaf0b900952a82713a4.png)
![](https://img-blog.csdnimg.cn/img_convert/6b6f0fc93f4df1a61715b82285d12f33.png)
![](https://img-blog.csdnimg.cn/img_convert/e651e7b2b8a743ea96f3847e5a15f852.png)
![](https://img-blog.csdnimg.cn/img_convert/075caaf332b91ee6c82056b3f9e70f12.png)
![定时任务](https://img-blog.csdnimg.cn/img_convert/1f8031346f64f210180f8eb3e6c762c0.png)
![](https://img-blog.csdnimg.cn/img_convert/50008f7572aa4bfc5bf23fc079b7bd32.png)
![](https://img-blog.csdnimg.cn/img_convert/74b4905a6c75fa8c43c188f23087c6ed.png)
- 任务的聚合
![](https://img-blog.csdnimg.cn/img_convert/59c9ea77055ebf8bd377504258100fb2.png)
![从定时任务中拉取](https://img-blog.csdnimg.cn/img_convert/603ab5c646a0861297c496ec2c94d465.png)
![](https://img-blog.csdnimg.cn/img_convert/b7805783696eadc794ea7a2763f96726.png)
![根据时间,时间相同根据名称](https://img-blog.csdnimg.cn/img_convert/5dc5d0c1433d2ad851f60e57d49d9d13.png)
![取nanotime 截止时间前的定时任务](https://img-blog.csdnimg.cn/img_convert/9fd7e44fbc38006e2f3c2fb1217034d0.png)
![](https://img-blog.csdnimg.cn/img_convert/0dcd051611ae954f05a858d6d712388b.png)
- 任务的执行
![从普通 taskqueue 中取任务](https://img-blog.csdnimg.cn/img_convert/432268a910e9048d33bf8188f4a61e57.png)
![](https://img-blog.csdnimg.cn/img_convert/bd7d2231cb976575433af3a3fc5decad.png)
