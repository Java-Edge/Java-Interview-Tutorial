IO 是主存和外部设备 ( 硬盘、各种移动终端及网络等 ) 拷贝数据的过程。IO 是操作系统的底层功能，通过 I/O 指令完成。网络编程领域的IO专指网络IO。

# JDK 的 NIO
NIO，即NEW IO，引入了多路选择器、Channel 和 Bytebuffer。
os为了保护自身稳定，会将内存空间划分为内核、用户空间。当需通过 TCP 发送数据时，在应用程序中实际上执行了将数据从用户空间拷贝至内核空间，再由内核进行实际的发送动作；而从 TCP 读取数据时则反过来，等待内核将数据准备好，再从内核空间拷贝至用户空间，应用数据才能处理。针对在两个阶段上不同的操作，Unix 定义了 5 种 IO 模型
# 1 阻塞式IO（Blocking IO）
最流行的 IO 模型，在客户端上特别常见，因为其编写难度最低，也最好理解。

在linux中，默认情况下所有的socket都是blocking，一个典型的读操作流程大概是这样：
1. 通常涉及等待数据从网络中到达。当所有等待数据到达时，它被复制到内核中的某个缓冲区
2. 把数据从内核缓冲区复制到应用程序缓冲区
![](https://img-blog.csdnimg.cn/20201102000306356.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

用户进程调用`recvfrom（系统调用）`，kernel开始IO的第一个阶段：准备数据。
对network io，很多时候数据在一开始还没有到达（比如，还没收到一个完整的UDP包），这时kernel就要等待足够数据。
而用户进程整个被阻塞。当kernel一直等到数据准备好了，它就会将数据从kernel中拷贝到用户内存，然后kernel返回结果，用户进程才解除 block状态，重新运行。

所以，blocking IO的特点就是在IO执行的两个阶段都被阻塞。调用返回成功或发生错误前，应用程序都在阻塞在方法的调用上。当方法调用成功返回后，应用程序才能开始处理数据。

JDK1.4前，Java只支持BIO。
示例代码：
```java
public static void main(String[] args) throws IOException {
	// 创建一个客户端socket实例
    Socket socket = new Socket();
    // 尝试连接一个远端的服务器地址
    socket.connect(InetSocketAddress.createUnresolved("localhost", 4591));
    // 在连接成功后则获取输入流
    InputStream inputStream = socket.getInputStream();
    byte[] content = new byte[128];
    // 并且尝试读取数据
    int bytesOfRead = inputStream.read(content);
}
```

在输入流上的read调用会阻塞，直到有数据被读取成功或连接发生异常。
read的调用就会经历上述将程序阻塞，然后内核等待数据准备后，将数据从内核空间复制到用户空间，即入参传递进来的二进制数组中。
实际读取的字节数可能小于数组的长度，方法的返回值正是实际读取的字节数。

# 非阻塞式IO
允许将一个套接字设置为非阻塞。当设置为非阻塞时，是在通知内核：如果一个操作需要将当前的调用线程阻塞住才能完成时，不采用阻塞的方式，而是返回一个错误信息。其模型如下



可以看到，在内核没有数据时，尝试对数据的读取不会导致线程阻塞，而是快速的返回一个错误。直到内核中收到数据时，尝试读取，就会将数据从内核复制到用户空间，进行操作。

可以看到，在非阻塞模式下，要感知是否有数据可以读取，需要不断的轮训，这么做往往会耗费大量的 CPU。所以这种模式不是很常见。

JDK1.4提供新的IO包  - NIO，其中的SocketChannel提供了对非阻塞 IO 的支持。
```java
public static void main(String[] args) throws IOException
    {
        SocketChannel socketChannel = SocketChannel.open();
        socketChannel.configureBlocking(false);
        socketChannel.connect(InetSocketAddress.createUnresolved("192.168.31.80", 4591));
        ByteBuffer buffer = ByteBuffer.allocate(128);
        while (socketChannel.read(buffer) == 0)
        {
            ;
        }
    }
```

一个SocketChannel实例就类似从前的一个Socket对象。

首先是通过`SocketChannel.open()`调用新建了一个SocketChannel实例，默认情况下，新建的socket实例都是阻塞模式，通过`java.nio.channels.spi.AbstractSelectableChannel#configureBlocking`调用将其设置为非阻塞模式，然后连接远程服务端。

`java.nio.channels.SocketChannel`使用`java.nio.ByteBuffer`作为数据读写的容器，可简单将`ByteBuffer`看成是一个内部持有二进制数据的包装类。

调用方法java.nio.channels.SocketChannel#read(java.nio.ByteBuffer)时会将内核中已经准备好的数据复制到ByteBuffer中。但是如果内核中此时并没有数据（或者说socket的读取缓冲区没有数据），则方法会立刻返回，并不会阻塞住。这也就对应了上图中，在内核等待数据的阶段（socket的读取缓冲区没有数据），读取调用时会立刻返回错误的。只不过在Java中，返回的错误在上层处理为返回一个读取为0的结果。

# IO复用
IO复用指的应用程序阻塞在系统提供的两个调用select或poll上。当应用程序关注的套接字存在可读情况（也就是内核收到数据了），select或poll的调用被返回。此时应用程序可以通过recvfrom调用完成数据从内核空间到用户空间的复制，进而进行处理。具体的模型如下



可以看到，和 阻塞式IO 相比，都需要等待，并不存在优势。而且由于需要2次系统调用，其实还稍有劣势。但是IO复用的优点在于，其select调用，可以同时关注多个套接字，在规模上提升了处理能力。

IO复用的模型支持一样也是在JDK1.4中的 NIO 包提供了支持。可以参看如下示例代码：

```java
public static void main(String[] args) throws IOException
    {
        /**创建2个Socket通道**/
        SocketChannel socketChannel = SocketChannel.open();
        socketChannel.configureBlocking(false);
        socketChannel.connect(InetSocketAddress.createUnresolved("192.168.31.80", 4591));
        SocketChannel socketChannel2 = SocketChannel.open();
        socketChannel2.configureBlocking(false);
        socketChannel2.connect(InetSocketAddress.createUnresolved("192.168.31.80", 4591));
        /**创建2个Socket通道**/
        /**创建一个选择器，并且两个通道在这个选择器上注册了读取关注**/
        Selector selector = Selector.open();
        socketChannel.register(selector, SelectionKey.OP_READ);
        socketChannel2.register(selector, SelectionKey.OP_READ);
        /**创建一个选择器，并且两个通道在这个选择器上注册了读取关注**/
        ByteBuffer buffer = ByteBuffer.wrap(new byte[128]);
        //选择器可以同时检查所有在其上注册的通道，一旦哪个通道有关注事件发生，select调用就会返回，否则一直阻塞
        selector.select();
        Set<SelectionKey>      selectionKeys = selector.selectedKeys();
        Iterator<SelectionKey> iterator      = selectionKeys.iterator();
        while (iterator.hasNext())
        {
            SelectionKey  selectionKey = iterator.next();
            SocketChannel channel      = (SocketChannel) selectionKey.channel();
            channel.read(buffer);
            iterator.remove();
        }
    }
```

代码一开始，首先是新建了2个客户端通道，连接到服务端上。接着创建了一个选择器Selector。选择器就是 Java 中实现 IO 复用的关键。选择器允许通道将自身的关注事件注册到选择器上。完成注册后，应用程序调用java.nio.channels.Selector#select()方法，程序进入阻塞等待直到注册在选择器上的通道中发生其关注的事件，则select调用会即可返回。然后就可以从选择器中获取刚才被选中的键。从键中可以获取对应的通道对象，然后就可以在通道对象上执行读取动作了。

结合IO复用模型，可以看到，select调用的阻塞阶段，就是内核在等待数据的阶段。一旦有了数据，内核等待结束，select调用也就返回了。

# 信号驱动IO
![](https://img-blog.csdnimg.cn/20201102011116492.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

与非阻塞IO类似，其在数据等待阶段并不阻塞，但是原理不同。信号驱动IO是在套接字上注册了一个信号调用方法。这个注册动作会将内核发出一个请求，在套接字的收到数据时内核会给进程发出一个sigio信号。该注册调用很快返回，因此应用程序可以转去处理别的任务。当内核准备好数据后，就给进程发出了信号。进程就可以通过recvfrom调用来读取数据。其模型如下



这种模型的优点就是在数据包到达之前，进程不会被阻塞。而且采用通知的方式也避免了轮训带来的损耗。

这种模型在Java中并没有对应的实现。

# 异步IO
异步IO的实现一般是通过系统调用，向内核注册了一个套接字的读取动作。这个调用一般包含了：缓存区指针，缓存区大小，偏移量、操作完成时的通知方式。该注册动作是即刻返回的，并且在整个IO的等待期间，进程都不会被阻塞。当内核收到数据，并且将数据从内核空间复制到用户空间完成后，依据注册时提供的通知方式去通知进程。其模型如下：



与信号驱动 IO 相比，最大的不同在于信号驱动 IO 是内核通知应用程序可以读取数据了；而 异步IO 是内核通知应用程序数据已经读取完毕了。

Java 在 1.7 版本引入对 异步IO 的支持，可以看如下的例子：

```java
public class MainDemo
{
    public static void main(String[] args) throws IOException, ExecutionException, InterruptedException
    {
        final AsynchronousSocketChannel asynchronousSocketChannel = AsynchronousSocketChannel.open();
        Future<Void>                    connect                   = asynchronousSocketChannel.connect(InetSocketAddress.createUnresolved("192.168.31.80", 3456));
        connect.get();
        ByteBuffer buffer = ByteBuffer.wrap(new byte[128]);
        asynchronousSocketChannel.read(buffer, buffer, new CompletionHandler<Integer, ByteBuffer>()
        {
            @Override
            public void completed(Integer result, ByteBuffer buffer)
            {
                //当读取到数据，流中止，或者读取超时到达时均会触发回调
                if (result > 0)
                {
                    //result代表着本次读取的数据，代码执行到这里意味着数据已经被放入buffer了
                    processWithBuffer(buffer);
                }
                else if (result == -1)
                {
                    //流中止，没有其他操作
                }
                else{
                    asynchronousSocketChannel.read(buffer, buffer, this);
                }
            }

            private void processWithBuffer(ByteBuffer buffer)
            {
            }

            @Override
            public void failed(Throwable exc, ByteBuffer attachment)
            {
            }
        });
    }
}
```

代码看上去和IO复用时更简单了。

首先是创建一个异步的 Socket 通道，注意，这里和 NIO 最大的区别就在于创建的是异步Socket通道，而 NIO 创建的属于同步通道。

执行connect方法尝试连接远程，此时方法会返回一个future，这意味着该接口是非阻塞的。实际上connect动作也是可以传入回调方法，将连接结果在回调方法中进行传递的。这里为了简化例子，就直接使用future了。

连接成功后开始在通道上进行读取动作。这里就是和 NIO 中最大的不同。读取的时候需要传入一个回调方法。当数据读取成功时回调方法会被调用，并且当回调方法被调用时读取的数据已经被填入了ByteBuffer。

主线程在调用读取方法完成后不会被阻塞，可以去执行别的任务。可以看到在整个过程都不需要用户线程参与，内核完成了所有的工作。

# 同步 V.S 异步
根据 POSIX 的定义：
- 同步：同步操作导致进程阻塞，直到 IO 操作完成
- 异步：异步操作不导致进程阻塞

来看下五种 IO 模型的对比，如下



可以看到，根据定义，前 4 种模型，在数据的读取阶段，全部都是阻塞的，因此是同步IO。而异步IO模型在整个IO过程中都不阻塞，因此是异步IO。

参考
 - http://www.tianshouzhi.com/api/tutorials/netty/221