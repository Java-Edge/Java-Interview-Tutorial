# UNIX系统的I/O模型
同步阻塞I/O、同步非阻塞I/O、I/O多路复用、信号驱动I/O和异步I/O。

## 什么是 I/O
就是计算机内存与外部设备之间拷贝数据的过程。

## 为什么需要 I/O
CPU访问内存的速度远远高于外部设备，因此CPU是先把外部设备的数据读到内存里，然后再进行处理。
当你的程序通过CPU向外部设备发出一个读指令，数据从外部设备拷贝到内存需要一段时间，这时CPU没事干，你的程序是：
- 主动把CPU让给别人
- 还是让CPU不停查：数据到了吗？数据到了吗？...

这就是I/O模型要解决的问题。
# Java I/O模型
对于一个网络I/O通信过程，比如网络数据读取，会涉及两个对象:
- 调用这个I/O操作的用户线程
- 操作系统内核

一个进程的地址空间分为用户空间和内核空间，用户线程不能直接访问内核空间。
当用户线程发起I/O操作后（Selector发出的select调用就是一个I/O操作），网络数据读取操作会经历两个步骤：
1. 用户线程等待内核将数据从网卡拷贝到内核空间
2. 内核将数据从内核空间拷贝到用户空间

有人会好奇，内核数据从内核空间拷贝到用户空间，这样会不会有点浪费？
毕竟实际上只有一块内存，能否直接把内存地址指向用户空间可以读取？
Linux中有个叫mmap的系统调用，可以将磁盘文件映射到内存，省去了内核和用户空间的拷贝，但不支持网络通信场景！


各种I/O模型的区别就是这两个步骤的方式不一样。

## 同步阻塞I/O
用户线程发起read调用后就阻塞了，让出CPU。内核等待网卡数据到来，把数据从网卡拷贝到内核空间，接着把数据拷贝到用户空间，再把用户线程叫醒。

![](https://img-blog.csdnimg.cn/82492e5325a8474490b27099e2516073.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 同步非阻塞I/O
用户进程主动发起read调用，这是个系统调用，CPU由用户态切换到内核态，执行内核代码。
内核发现该socket上的数据已到内核空间，将用户线程挂起，然后把数据从内核空间拷贝到用户空间，再唤醒用户线程，read调用返回。

用户线程不断发起read调用，数据没到内核空间时，每次都返回失败，直到数据到了内核空间，这次read调用后，在等待数据从内核空间拷贝到用户空间这段时间里，线程还是阻塞的，等数据到了用户空间再把线程叫醒。
![](https://img-blog.csdnimg.cn/99ce6ef4b03d4b629d5c69cb04650765.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
## I/O多路复用
用户线程的读取操作分成两步：
- 线程先发起select调用，问内核：数据准备好了吗？
- 等内核把数据准备好了，用户线程再发起read调用
在等待数据从内核空间拷贝到用户空间这段时间里，线程还是阻塞的

为什么叫I/O多路复用？
因为一次select调用可以向内核查多个数据通道（Channel）的状态。
![](https://img-blog.csdnimg.cn/1fdf320b193142c0be25d8ed73988961.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

>NIO API可以不用Selector，就是同步非阻塞。使用了Selector就是IO多路复用。

## 异步I/O
用户线程发起read调用的同时注册一个回调函数，read立即返回，等内核将数据准备好后，再调用指定的回调函数完成处理。在这个过程中，用户线程一直没有阻塞。
![](https://img-blog.csdnimg.cn/2a9157c42ae04ecfa35075059df25547.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
## 信号驱动I/O
可以把信号驱动I/O理解为“半异步”，非阻塞模式是应用不断发起read调用查询数据到了内核没有，而信号驱动把这个过程异步了，应用发起read调用时注册了一个信号处理函数，其实是个回调函数，数据到了内核后，内核触发这个回调函数，应用在回调函数里再发起一次read调用去读内核的数据。
所以是半异步。
# NioEndpoint组件
Tomcat的NioEndpoint实现了I/O多路复用模型。

## 工作流程
Java的多路复用器的使用：
1. 创建一个Selector，在其上注册感兴趣的事件，然后调用select方法，等待感兴趣的事情发生
2. 感兴趣的事情发生了，比如可读了，就创建一个新的线程从Channel中读数据

NioEndpoint包含LimitLatch、Acceptor、Poller、SocketProcessor和Executor共5个组件。
![](https://img-blog.csdnimg.cn/df667632760040c4a197f55936a8eec7.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
## LimitLatch
连接控制器，控制最大连接数，NIO模式下默认是8192。
![](https://img-blog.csdnimg.cn/cbc41d109e944a14ad51650ec491da8f.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
当连接数到达最大时阻塞线程，直到后续组件处理完一个连接后将连接数减1。
到达最大连接数后，os底层还是会接收客户端连接，但用户层已不再接收。
核心代码：
```java
public class LimitLatch {
    private class Sync extends AbstractQueuedSynchronizer {
     
        @Override
        protected int tryAcquireShared() {
            long newCount = count.incrementAndGet();
            if (newCount > limit) {
                count.decrementAndGet();
                return -1;
            } else {
                return 1;
            }
        }

        @Override
        protected boolean tryReleaseShared(int arg) {
            count.decrementAndGet();
            return true;
        }
    }

    private final Sync sync;
    private final AtomicLong count;
    private volatile long limit;
    
    // 线程调用该方法，获得接收新连接的许可，线程可能被阻塞
    public void countUpOrAwait() throws InterruptedException {
      sync.acquireSharedInterruptibly(1);
    }

    // 调用这个方法来释放一个连接许可，则前面阻塞的线程可能被唤醒
    public long countDown() {
      sync.releaseShared(0);
      long result = getCount();
      return result;
   }
}
```
用户线程调用**LimitLatch#countUpOrAwait**拿到锁，若无法获取，则该线程会被阻塞在AQS队列。
AQS又是怎么知道是阻塞还是不阻塞用户线程的呢？
由AQS的使用者决定，即内部类Sync决定，因为Sync类重写了**AQS#tryAcquireShared()**：若当前连接数count ＜ limit，线程能获取锁，返回1，否则返回-1。

如何用户线程被阻塞到了AQS的队列，由Sync内部类决定什么时候唤醒，Sync重写AQS#tryReleaseShared()，当一个连接请求处理完了，又可以接收新连接，这样前面阻塞的线程将会被唤醒。

LimitLatch用来限制应用接收连接的数量，Acceptor用来限制系统层面的连接数量，首先是LimitLatch限制，应用层处理不过来了，连接才会堆积在操作系统的Queue，而Queue的大小由acceptCount控制。
## Acceptor
Acceptor实现了Runnable接口，因此可以跑在单独线程里，在这个死循环里调用accept接收新连接。一旦有新连接请求到达，accept方法返回一个Channel对象，接着把Channel对象交给Poller去处理。

一个端口号只能对应一个ServerSocketChannel，因此这个ServerSocketChannel是在多个Acceptor线程之间共享的，它是Endpoint的属性，由Endpoint完成初始化和端口绑定。
可以同时有过个Acceptor调用accept方法，accept是线程安全的。

### 初始化
```java
protected void initServerSocket() throws Exception {
    if (!getUseInheritedChannel()) {
        serverSock = ServerSocketChannel.open();
        socketProperties.setProperties(serverSock.socket());
        InetSocketAddress addr = new InetSocketAddress(getAddress(), getPortWithOffset());

        serverSock.socket().bind(addr,getAcceptCount());
    } else {
        // Retrieve the channel provided by the OS
        Channel ic = System.inheritedChannel();
        if (ic instanceof ServerSocketChannel) {
            serverSock = (ServerSocketChannel) ic;
        }
        if (serverSock == null) {
            throw new IllegalArgumentException(sm.getString("endpoint.init.bind.inherited"));
        }
    }
    // 阻塞模式
    serverSock.configureBlocking(true); //mimic APR behavior
}
```
- bind方法的 getAcceptCount() 参数表示os的等待队列长度。当应用层的连接数到达最大值时，os可以继续接收连接，os能继续接收的最大连接数就是这个队列长度，可以通过acceptCount参数配置，默认是100
![](https://img-blog.csdnimg.cn/0129d890067c4dafb5465f301990581b.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

ServerSocketChannel通过accept()接受新的连接，accept()方法返回获得SocketChannel对象，然后将SocketChannel对象封装在一个PollerEvent对象中，并将PollerEvent对象压入Poller的Queue里。
这是个典型的“生产者-消费者”模式，Acceptor与Poller线程之间通过Queue通信。

## Poller
本质是一个Selector，也跑在单独线程里。

Poller在内部维护一个Channel数组，它在一个死循环里不断检测Channel的数据就绪状态，一旦有Channel可读，就生成一个SocketProcessor任务对象扔给Executor去处理。

内核空间的接收连接是对每个连接都产生一个channel，该channel就是Acceptor里accept方法得到的scoketChannel，后面的Poller在用selector#select监听内核是否准备就绪，才知道监听内核哪个channel。


维护了一个 Queue:
![](https://img-blog.csdnimg.cn/8957657d0d404199b57624d13cdeab49.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

SynchronizedQueue的方法比如offer、poll、size和clear都使用synchronized修饰，即同一时刻只有一个Acceptor线程读写Queue。
同时有多个Poller线程在运行，每个Poller线程都有自己的Queue。
每个Poller线程可能同时被多个Acceptor线程调用来注册PollerEvent。
Poller的个数可以通过pollers参数配置。
### 职责
- Poller不断的通过内部的Selector对象向内核查询Channel状态，一旦可读就生成任务类SocketProcessor交给Executor处理
![](https://img-blog.csdnimg.cn/26a153742fe14f55b5919e86e03782cf.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- Poller循环遍历检查自己所管理的SocketChannel是否已超时。若超时就关闭该SocketChannel

## SocketProcessor
Poller会创建SocketProcessor任务类交给线程池处理，而SocketProcessor实现了Runnable接口，用来定义Executor中线程所执行的任务，主要就是调用Http11Processor组件处理请求：Http11Processor读取Channel的数据来生成ServletRequest对象。

Http11Processor并非直接读取Channel。因为Tomcat支持同步非阻塞I/O、异步I/O模型，在Java API中，对应Channel类不同，比如有AsynchronousSocketChannel和SocketChannel，为了对Http11Processor屏蔽这些差异，Tomcat设计了一个包装类叫作SocketWrapper，Http11Processor只调用SocketWrapper的方法去读写数据。
## Executor
线程池，负责运行SocketProcessor任务类，SocketProcessor的run方法会调用Http11Processor来读取和解析请求数据。我们知道，Http11Processor是应用层协议的封装，它会调用容器获得响应，再把响应通过Channel写出。

Tomcat定制的线程池，它负责创建真正干活的工作线程。就是执行SocketProcessor#run，即解析请求并通过容器来处理请求，最终调用Servlet。

# Tomcat的高并发设计
高并发就是能快速地处理大量请求，需合理设计线程模型让CPU忙起来，尽量不要让线程阻塞，因为一阻塞，CPU就闲了。
有多少任务，就用相应规模线程数去处理。
比如NioEndpoint要完成三件事情：接收连接、检测I/O事件和处理请求，关键就是把这三件事情分别定制线程数处理：
- 专门的线程组去跑Acceptor，并且Acceptor的个数可以配置
- 专门的线程组去跑Poller，Poller的个数也可以配置
- 具体任务的执行也由专门的线程池来处理，也可以配置线程池的大小

# 总结
I/O模型是为了解决内存和外部设备速度差异。
- 所谓阻塞或非阻塞是指应用程序在发起I/O操作时，是立即返回还是等待
- 同步和异步，是指应用程序在与内核通信时，数据从内核空间到应用空间的拷贝，是由内核主动发起还是由应用程序来触发。

Tomcat#Endpoint组件的主要工作就是处理I/O，而NioEndpoint利用Java NIO API实现了多路复用I/O模型。
读写数据的线程自己不会阻塞在I/O等待上，而是把这个工作交给Selector。

当客户端发起一个HTTP请求时，首先由Acceptor#run中的
```java
socket = endpoint.serverSocketAccept();
```

接收连接，然后传递给名称为Poller的线程去侦测I/O事件，Poller线程会一直select，选出内核将数据从网卡拷贝到内核空间的 channel（也就是内核已经准备好数据）然后交给名称为Catalina-exec的线程去处理，这个过程也包括内核将数据从内核空间拷贝到用户空间这么一个过程，所以对于exec线程是阻塞的，此时用户空间（也就是exec线程）就接收到了数据，可以解析然后做业务处理了。

> 参考
> - https://blog.csdn.net/historyasamirror/article/details/5778378