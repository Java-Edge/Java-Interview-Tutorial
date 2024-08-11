# Netty基本组件

## 1 传统socket编程

### 1.1 实战

#### 服务端：ServerBoot



```java
/**
 * @author JavaEdge
 */
public class ServerBoot {

    private static final int PORT = 8000;

    public static void main(String[] args) {
        Server server = new Server(PORT);
        server.start();
    }
}
```

#### Server

```java
/**
 * @author JavaEdge
 */
public class Server {

    private ServerSocket serverSocket;

    public Server(int port) {
        try {
            this.serverSocket = new ServerSocket(port);
            System.out.println("Server starts success，端口:" + port);
        } catch (IOException exception) {
            System.out.println("Server starts failed");
        }
    }

    public void start() {
        new Thread(() -> doStart()).start();
    }

    private void doStart() {
        while (true) {
            try {
                Socket client = serverSocket.accept();
                new ClientHandler(client).start();
            } catch (IOException e) {
                System.out.println("Server failure");
            }
        }
    }
}
```

#### ClientHandler

```java
/**
 * @author JavaEdge
 */
public class ClientHandler {

    public static final int MAX_DATA_LEN = 1024;
    private final Socket socket;

    public ClientHandler(Socket socket) {
        this.socket = socket;
    }

    public void start() {
        System.out.println("新客户端接入");
        new Thread(() -> doStart()).start();
    }

    private void doStart() {
        try {
            InputStream inputStream = socket.getInputStream();
            while (true) {
                byte[] data = new byte[MAX_DATA_LEN];
                int len;
                while ((len = inputStream.read(data)) != -1) {
                    String message = new String(data, 0, len);
                    System.out.println("客户端传来消息: " + message);
                    socket.getOutputStream().write(data);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

#### Client

```java
/**
 * @author JavaEdge
 */
public class Client {
    private static final String HOST = "127.0.0.1";
    private static final int PORT = 8000;
    private static final int SLEEP_TIME = 5000;

    public static void main(String[] args) throws IOException {
        final Socket socket = new Socket(HOST, PORT);
        new Thread(() -> {
            System.out.println("客户端启动成功!");
            while (true) {
                try {
                    String message = "hello world";
                    System.out.println("客户端发送数据: " + message);
                    socket.getOutputStream().write(message.getBytes());
                } catch (Exception e) {
                    System.out.println("写数据出错!");
                }
                sleep();
            }
        }).start();
    }

    private static void sleep() {
        try {
            Thread.sleep(SLEEP_TIME);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

#### 先后启动 `ServerBoot`、`Client`，输出

```bash
Server starts success，端口:8000
新客户端接入
客户端传来消息: hello worldhello world
客户端传来消息: hello world
客户端传来消息: hello world
客户端传来消息: hello world
客户端传来消息: hello world
```

```bash
客户端启动成功!
客户端发送数据: hello world
客户端发送数据: hello world
客户端发送数据: hello world
```


### 1.2 传统HTTP服务器原理

1. 创建一个`ServerSocket`
2. 监听并绑定一个端口一系列客户端来请求这个端口服务器使用Accept，获得一个来自客户端的Socket连接对象
3. 启动一个新线程处理连接读Socket， 
   -  得到字节流解码协议
   -  得到Http请求对象处理Http请求
   -  得到一个结果
   -  封装成一个HttpResponse对象编码协议
   -  将结果序列化字节流写Socket，
   -  将字节流发给客户端

- 继续循环步骤3

### 1.3 C/S 交互流程



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/34ee25414a56f38d8d28ad87f9479c88.png)

## 2  Netty版socket编程



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/601b419ed59953ccb6d1a0339839557c.png)



## 3 Netty核心组件

### 3.1 NioEventLoop

#### ① EventLoop

一个 EventLoop 就是一个 eventexecutor：

```java
/**
 * 一旦Channel注册了，将处理所有的  I/O 操作
 * 一个 EventLoop 实例通常处理一个以上Channel
 */
public interface EventLoop extends OrderedEventExecutor, EventLoopGroup {
    @Override
    EventLoopGroup parent();
}
```

`NioEventLoopGroup` ，Netty 框架提供的一个基于 NIO 的实现。是一个处理 I/O 操作的多线程事件循环的组。Netty 为不同类型的传输提供各种 `EventLoopGroup` 实现。

示例代码中实现服务器端应用程序，将用两个NioEventLoopGroup：

- boss，接受传入的连接。因为accept事件只需建立一次连接，连接可复用，所以accept只接受一次

- work，在上司接受连接并登记到工作人员后，处理接受连接的流量。使用多少线程及咋映射到创建的通道

Netty的发动机：通常一个 `NioEventLoop` 会绑定到一个特定的 `Thread`。 `NioEventLoop` 的所有 I/O 操作和任务执行都会在这个绑定的 `Thread` 上进行。这确保了 `NioEventLoop` 的线程安全性，避免多线程并发访问的问题。

Server端：

```java
private void doStart() {
    while (true) {
        try {
            Socket client = serverSocket.accept();
            new ClientHandler(client).start();
        } catch (IOException e) {
            System.out.println("Server failure");
        }
    }
}
```

ClientHandler：

```java
private void doStart() {
    try {
        InputStream inputStream = socket.getInputStream();
        // 对应一个 run 方法
        while (true) {
            byte[] data = new byte[MAX_DATA_LEN];
            int len;
            while ((len = inputStream.read(data)) != -1) {
                String message = new String(data, 0, len);
                System.out.println("客户端传来消息: " + message);
                socket.getOutputStream().write(data);
            }
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

NioEventLoop#run

```java
@Override
protected void run() {
    for (;;) {
        try {
            ...
            if (ioRatio == 100) {
                processSelectedKeys();
                runAllTasks();
            } else {
                // 打断点
                processSelectedKeys();
            }
            ...
        }
}
```

netty的NIO，对IO事件处理是在NioEventLoop，事件的注册：

```java
private void processSelectedKey(SelectionKey k, AbstractNioChannel ch) {
    final AbstractNioChannel.NioUnsafe unsafe = ch.unsafe();
    if (!k.isValid()) {
        final EventLoop eventLoop;
        try {
            eventLoop = ch.eventLoop();
        } catch (Throwable ignored) {
            return;
        }
        if (eventLoop == this) {
            unsafe.close(unsafe.voidPromise());
        }
        return;
    }

    try {
        int readyOps = k.readyOps();
        if ((readyOps & SelectionKey.OP_CONNECT) != 0) {
            int ops = k.interestOps();
            ops &= ~SelectionKey.OP_CONNECT;
            k.interestOps(ops);

            unsafe.finishConnect();
        }

        // 先处理OP_WRITE，因为可写一些排队的缓冲区，从而释放内存
        if ((readyOps & SelectionKey.OP_WRITE) != 0) {
            // 调用 forceFlush,一旦无剩余可写内容,它也将清除 OP_WRITE
            // 可见，注册 OP_WRITE 事件，要执行的就是 flush 操作.
            ch.unsafe().forceFlush();
        }

        // 还要校验 readOps 为0以解决可能的JDK bug,否则可能导致 spin loop
        // 处理读请求（断开连接）或接入连接
        if ((readyOps & (SelectionKey.OP_READ | SelectionKey.OP_ACCEPT)) != 0 || readyOps == 0) {
            unsafe.read();
        }
    }
  ...
}
```



```java
private void processSelectedKeys() {
 if (selectedKeys != null) {
   // 不用 JDK 的 selector.selectedKeys，性能更好（%1-2%），GC更少
   processSelectedKeysOptimized();
 }
 ...
}
```

不同事件调用unsafe的不同方法，Netty对底层socket的操作都通过

##### unsafe

1. NioMessageUnsafe
   `NioServerSocketChannel`使用NioMessageUnsafe做socket操作
2. NioByteUnsafe
   `NioSocketChannel`使用NioByteUnsafe做socket操作

处理每个连接：

```java
private void processSelectedKeysOptimized() {
    for (int i = 0; i < selectedKeys.size; ++i) {
        final SelectionKey k = selectedKeys.keys[i];
        // 数组中的空节点允许通道关闭后对其GC
        // 在SelectedSelectionKeySet中使用单数组
        // 动机:SelectedSelectionKeySet当前在内部使用2个数组，并且期望用户调用flip访问基础数组并切换活动数组。
        // 但是，我们不能同时使用2个数组，如果在重置数组元素时格外小心，就可以摆脱使用单数组。
        // 修改: 介绍包装了Selector的SelectedSelectionKeySetSelector并确保我们在选择之前重置基础的SelectedSelectionKeySet数据结构-
        // NioEventLoop＃processSelectedKeysOptimized中的循环边界可以更精确地定义，因为我们知道基础数组的实际大小
        selectedKeys.keys[i] = null;

        // attachment 就是 NioServerSocketChannel
        final Object a = k.attachment();

      	// 打断点！！！
        if (a instanceof AbstractNioChannel) {
                    processSelectedKey(k, (AbstractNioChannel) a);
        }
        ...
    }
}
```

#### ② EventExecutorGroup

负责：

- 经由其使用`next()`方法，提供`EventExecutor`
- 处理自己的生命周期，并允许在全局模式中关闭它们

#### ③ EventExecutor

特殊的`EventExecutorGroup`，快捷方法查看是否有`Thread`在事件循环执行。 

#### ④ EventLoopGroup

```java
public interface EventLoopGroup extends EventExecutorGroup
```

特殊的 `EventExecutorGroup`，允许注册 `Channel`，即事件循环期间可执行 channel 操作，得到处理，供以后选用。

```java
/**
 * EventExecutorGroup实现的抽象基类，它同时处理多个线程的任务
 */
public abstract class MultithreadEventExecutorGroup extends AbstractEventExecutorGroup {
		// 底层数组存储
    private final EventExecutor[] children;
```

### 3.2 Channel

`Channel` 是 Netty 对 `Socket` 的高层抽象。

检查 `SelectionKey` 的 `readyOps` 标志位，以确定是否有可读或可接受的事件发生。如果有，则调用 `unsafe.read()` 方法进行处理：

```java
NioEventLoop.java

if ((readyOps & (SelectionKey.OP_READ | SelectionKey.OP_ACCEPT)) != 0 || readyOps == 0) {
    unsafe.read();
    if (!ch.isOpen()) {
        // Connection already closed - no need to handle write.
        return;
    }
}
```

NioMessageUnsafe#read()处理是否有新连接进来：

```java
@Override
public void read() {
    ...
                int localRead = doReadMessages(readBuf);
```

具体子类NioServerSocketChannel#doReadMessages：

```java
public class NioServerSocketChannel extends AbstractNioMessageChannel
                             implements io.netty.channel.socket.ServerSocketChannel {
  
  @Override
  protected int doReadMessages(List<Object> buf) throws Exception {
      SocketChannel ch = javaChannel().accept();
      ...
  }
  
  @Override
  protected ServerSocketChannel javaChannel() {
    	// 把底层的 channel 封装成 NioSocketChannel
      return (ServerSocketChannel) super.javaChannel();
  }
}
```


### 3.3 ByteBuf

Netty 对字节数据的高层抽象，提供了更丰富的功能和更灵活的操作方式。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/4907b0ce3ce0f77f0930d0d23dbbdc06.png)

### 3.4 Pipeline

逻辑链（Logic Chain）是指一系列有序的处理步骤或逻辑单元，用于处理特定的任务或数据流。在 Netty 中，逻辑链通常由 `Pipeline` 中的 `ChannelHandler` 组成，每个 `ChannelHandler` 负责处理数据流的一部分。

netty 将其抽象成逻辑链，netty咋把每个 pipeline 加入到客户端连接的呢？

```java
public class NioSocketChannel extends AbstractNioByteChannel implements io.netty.channel.socket.SocketChannel {

  ...
  public NioSocketChannel(Channel parent, SocketChannel socket) {
      super(parent, socket);
      config = new DefaultSocketChannelConfig(this, socket.socket());
  }
  ...
}
```

```java
public abstract class AbstractNioByteChannel extends AbstractNioChannel {
  ...
  protected AbstractNioByteChannel(Channel parent, SelectableChannel ch) {
      super(parent, ch, SelectionKey.OP_READ);
  }
  ...
}
```

```java
public abstract class AbstractChannel extends DefaultAttributeMap implements Channel {
  
  protected AbstractChannel(Channel parent) {
      this.parent = parent;
      unsafe = newUnsafe();
      pipeline = new DefaultChannelPipeline(this);
  }
  
  protected DefaultChannelPipeline newChannelPipeline() {
      return new DefaultChannelPipeline(this);
  }
}
```

```java
final class DefaultChannelPipeline implements ChannelPipeline {

	protected DefaultChannelPipeline(Channel channel) {
    ...
    tail = new TailContext(this);
    head = new HeadContext(this);

    head.next = tail;
    tail.prev = head;
  }
}
```

### 3.5 ChannelHandler

Logic链的一环。

```java
DefaultChannelPipeline.java

// 主要入参的ChannelHandler
@Override
public final ChannelPipeline addAfter(
        EventExecutorGroup group, String baseName, String name, ChannelHandler handler) {
    final AbstractChannelHandlerContext newCtx;
    final AbstractChannelHandlerContext ctx;

    synchronized (this) {
        checkMultiplicity(handler);
        name = filterName(name, handler);
        ctx = getContextOrDie(baseName);

        newCtx = newContext(group, name, handler);

        addAfter0(ctx, newCtx);

        // If the registered is false it means that the channel was not registered on an eventLoop yet.
        // In this case we remove the context from the pipeline and add a task that will call
        // ChannelHandler.handlerRemoved(...) once the channel is registered.
        if (!registered) {
            newCtx.setAddPending();
            callHandlerCallbackLater(newCtx, true);
            return this;
        }
        EventExecutor executor = newCtx.executor();
        if (!executor.inEventLoop()) {
            callHandlerAddedInEventLoop(newCtx, executor);
            return this;
        }
    }
    callHandlerAdded0(newCtx);
    return this;
}
```