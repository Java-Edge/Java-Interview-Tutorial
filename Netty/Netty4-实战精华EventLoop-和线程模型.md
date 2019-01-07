线程模型指定了os、编程语言、框架或应用程序的上下文中的线程管理的关键方面。如何、何时创建线程将对应用程序代码执行产生显著影响，开发人员必须理解不同模型之间的权衡。

而 Netty 的线程模型强大又易用，正如 Netty 的宗旨：简化你的应用程序代码，同时最大限度提高性能和可维护性。

# 1 线程模型血泪史
早期使用多线程是按需创建启动新 `Thread` 执行并发的任务单元，但这在高负载下表现很差。Java5 引入`Executor`，其线程池通过缓存和重用 `Thread` 极大提升性能。

基本的线程池化模式：
1. 从池的空闲线程列表中选择一个 `Thread`，并被指派运行一个已提交的任务（`Runnable` 实现）
2. 任务完成时，将该 `Thread` 返回给该列表，使其被重用

- Executor 的执行逻辑
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWYxZDNhMTE1NjMyZDBmMGYucG5n)

虽然**池化/重用**线程相对为每个任务都创建、销毁线程是一种进步，但它并不能消除**上下文切换的开销**，其随线程数的增加而很快变得明显，并在高负载下更严重。此外，仅由于APP整体复杂性或并发需求，在项目生命周期内也可能会出现其他和线程相关问题。总之多线程处理很复杂，但 Netty 简化之！

# 2 EventLoop 接口
## 网络框架的基本功能
运行任务来处理在连接的生命周期内发生的**事件**。在代码中称为**事件循环**，即 `io.netty.channel.EventLoop `。
![](https://img-blog.csdnimg.cn/20201030005241155.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)


- 在事件循环中执行任务![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTFjYjg1ZTZkMzBlMWQ3ZDAucG5n)

`EventLoop` 是协同设计的一部分，采用了两个基本 API：并发和网络编程。
1. `io.netty.util.concurrent` 包基于 JDK 的juc包而构建，以提供线程执行器
2. `io.netty.channel` 包中的类，为了与 `Channel` 的事件交互，扩展了这些接口/类

- EventLoop 的类层次结构
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTE1OTQ2NjI5NzMyNGZmNzkucG5n)

该模型中，一个 `EventLoop` 由一个永不变的 `Thread` 驱动，同时任务（`Runnable` 或 `Callable`）可直接提交给 `EventLoop` 的实现，以立即或调度执行。

根据配置和可用核的不同，可能会创建多个 `EventLoop` 实例，以优化资源使用，且单个 `EventLoop` 可能会被指派以服务多个 `Channel`。

`EventLoop`继承`ScheduledExecutorService`时，只定义了一个方法 `parent()` (重写 `EventExecutor` 的 `EventExecutorGroup#parent()`)。

![](https://img-blog.csdnimg.cn/20201030011231551.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

该方法用以返回到当前`EventLoop`实例所属的`EventLoopGroup`的引用。

## 事件/任务的执行顺序 
事件和任务以 FIFO 顺序执行。这可通过保证字节内容总是按正确顺序被处理，消除数据被损坏的可能性。

## Netty4 的 I/O 和事件处理
由 I/O 操作触发的事件将流经安装了一或多个`ChannelHandler` 的 `ChannelPipeline`。
传播这些事件的方法调用可随后被 ` ChannelHandler`拦截并可按需处理事件。

事件的性质决定它将被如何处理：
- 可能将数据从网络栈中传递到你的APP
- 逆向操作
- 执行一些截然不同的操作

但事件的处理逻辑须高可复用，以处理所有可能的用例。因此在Netty4，所有I/O操作和事件都由已被分配给`EventLoop`的`Thread`处理(注意这里是“处理”而非“触发”，因其中的写操作可从外部的任意线程触发)
## Netty3 的 I/O 操作
在旧版线程模型仅保证：
- 入站（之前称为上游）事件会在 I/O 线程（Netty 4 中的 EventLoop）中执行
- 所有出站（下游）事件都由调用线程处理，其可能是 I/O 线程也可能是其它线程

起初挺好，但已被发现有问题，因需在` ChannelHandler `中同步出站事件：不可能保证多线程不会在同时刻尝试访问出站事件。
例如，若你通过在不同线程中调用 `Channel.write()`，针对同一 `Channel` 同时触发出站的事件，就会发生这种情况。
当出站事件触发入站事件时，将导致另一个负面影响。当 `Channel.write()`导致异常时，需生成并触发一个 `exceptionCaught` 事件。但在 Netty3 的模型，因这是个入站事件，需在调用线程中执行代码，然后将事件移交给 I/O 线程去执行，这会带来额外上下文切换开销。

而 Netty4 的线程模型，在同一线程中处理某给定 `EventLoop `中所产生的所有事件，则解决了该问题。其提供了更简单的执行体系架构，并消除了在多`ChannelHandler `中需同步的必要（除任何可能需在多 Channel 中共享的）。

# 3 任务调度
当需要调度一个任务以延迟或周期执行时。

例如想注册一个在客户端连接 5 min后触发的任务：发送心跳到远程节点，以检查连接是否存活。若无响应，便知可关闭该 Channel。

## 3.1 JDK 任务调度
Java5 前，任务调度基于 `java.util.Timer `类，其使用一个后台 `Thread` 且具有与标准线程相同的限制。
后来JDK提供juc包，定义了`ScheduledExecutorService`接口：
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LThiZjYyYTVjMzhiNTFiYWMucG5n)
虽然可选项不多(JDK提供该接口的唯一实现`java.util.concurrent.ScheduledThreadPoolExecutor`)，但该实现足以应对大多场景：
- 使用 ScheduledExecutorService 在 60 秒的延迟之后执行一个任务
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWE2OWE5NGU4NTgxOTYzOGQucG5n)

使用起来简单粗暴。

## 3.2 Netty#EventLoop 调度任务
##### JDK 的`ScheduledExecutorService `实现局限性
作为线程池管理的部分功能，将有额外线程创建：若有大量任务被密集调度，这将成为瓶颈。

`Channel` 的 `EventLoop` 实现任务调度解决了该问题：
- `EventLoop` 调度任务，60s后`Runnable`实例由 `Channel` 的 `EventLoop` 执行![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTA5MGZiOWQ4MGM2NGIxODgucG5n)

若要调度任务以`每60s执行一次`，使用 `scheduleAtFixedRate()`
- 使用 EventLoop 调度周期性的任务
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWJiMDFkMmY5ZDM0ZmFjY2QucG5n)

`EventLoop`继承于`ScheduledExecutorService`，所以也提供了JDK实现的所有方法，包括之前的`schedule()`和`scheduleAtFixedRate()`。
要想取消或检查被调度任务的执行状态，可使用每个异步操作所返回的 `ScheduledFuture`,
- 使用 ScheduledFuture 取消任务
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTYzZmJmODliMDVmNjY4ZTYucG5n)
# 4 实现原理
## 4.1 线程管理
Netty线程模型的高性能取决于对当前执行的`Thread`的身份的确定(通过调用` EventLoop#inEventLoop(Thread)`实现负责处理一个Channel的整个生命周期内的所有事件）。

- 若当前调用线程正是支撑 `EventLoop` 的线程，那么所提交的代码块将会被直接执行
- 否则，`EventLoop` 将调度该任务以稍后执行，并将它放到内部队列。当 `EventLoop`下次处理它的事件时，会执行队列中的那些任务/事件
这也解释了任何 `Thread` 如何与 `Channel` 直接交互，而无需在 `ChannelHandler` 中额外同步。

每个 `EventLoop` 都有自已的**任务队列**（不像线程池共用一个任务队列并抢夺）。
- `EventLoop` 调度任务的执行逻辑                             
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTk5YWRhOTcxNDNkNzNiMzUucG5n)

**禁止将一个长时间运行的任务放入执行队列，因它将阻塞需在同一线程上执行的其他任务！**
> 若必须阻塞调用或执行长时间运行的任务，推荐使用专门的`EventExecutor`。

除这种受限场景，传输所采用的不同事件处理实现，其线程模型也会严重影响排队的任务对整体系统性能影响。

## 4.2 EventLoop线程的分配
服务于 `Channel` 的 I/O 和事件的` EventLoop` 包含在 `EventLoopGroup `中。不同传输实现，`EventLoop `的创建、分配方式也不同。

### 异步传输
异步传输实现只使用少量 `EventLoop` 及和它们相关联的 `Thread`，且在当前线程模型，它们可能会被多个 `Channel` 共享。这使得可通过尽可能少的 `Thread` 支撑大量 `Channel`，而非每个 `Channel` 分配一个 `Thread`。

- 一个 `EventLoopGroup`，具有3个固定大小 `EventLoop`（每个 `EventLoop`由一个 Thread 支撑）。在创建 `EventLoopGroup `时直接分配了` EventLoop`（以及支撑它们的 Thread），以确保在需要时它们可用：
![用于非阻塞传输（如 NIO 和 AIO）的 EventLoop 分配方式](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTQxZjNkOWIxZTEyNzMyOWIucG5n)

`EventLoopGroup` 负责为每个新创建 Channel 分配一个 `EventLoop`。
当前实现中使用顺序循环（round-robin）分配均衡分布，并且相同 `EventLoop`可能会被分配给多个 Channel。（这点在将来版本中可能变）。

一旦一个 Channel 被分配给一个 `EventLoop`，它将在它的整个生命周期都使用这`EventLoop`及相关联 Thread）。它可以使你从担忧你的`ChannelHandler`实现中的线程安全和同步问题中解脱。

### `EventLoop` 的分配方式对 `ThreadLocal` 的使用影响
因一个`EventLoop` 通常会被用于支撑多个 Channel，所以对于所有相关联 Channel，`ThreadLocal `都将一样。这使得它对于实现状态追踪等功能来说是个糟糕选择。然而在一些无状态上下文中，它仍可被用于在多个 Channel 之间共享一些重度的或者代价昂贵的对象，甚至是事件
## 阻塞传输
用于像 OIO（旧的阻塞 I/O）这样的其他传输的设计略有不同。
- 阻塞传输（如 OIO）的 EventLoop 分配方式，每个 Channel 都将被分配给一个 EventLoop及它的 Thread
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTRmNDM4MjBhNTBmZGM3NzUucG5n)

> 如果你使用过 java.io 包的阻塞 I/O，可能就遇到过这种模型。

得到的保证是每个 Channel 的 I/O 事件都只会被一个 Thread（用于支撑该 Channel 的 `EventLoop` 的那个 Thread）处理。这也是另一个` Netty 设计一致性`的例子，这种设计上的一致性对 Netty 的可靠性和易用性做出了巨大贡献。

参考
- 《Netty实战》