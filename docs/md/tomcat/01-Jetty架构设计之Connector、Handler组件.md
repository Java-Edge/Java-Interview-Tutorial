# 01-Jetty架构设计之Connector、Handler组件

Jetty，Eclipse基金会开源项目，和Tomcat一样，Jetty也是“HTTP服务器 + Servlet容器”，且Jetty和Tomcat在架构设计相似。但Jetty也有自己特点，更小巧，更易定制化。Jetty作为后起之秀，应用范围越来越广，如Google App Engine就采用Jetty作Web容器。

## 1 Jetty整体架构

Jetty Server：多个Connector（连接器）、多个Handler（处理器）及一个线程池

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/56bfbe091bc78b560a9e01d3749f37d4.png)

Jetty的Connector、Handler组件分别实现HTTP服务器、Servlet容器功能，这俩组件工作时所需线程资源都直接从一个全局线程池ThreadPool获取。

Jetty Server可以有多个Connector在不同端口监听客户请求，请求处理的Handler组件，也可根据具体场景使用不同Handler。该设计提高Jetty灵活性：

- 需支持Servlet，可用ServletHandler
- 需支持Session，则再增加一个SessionHandler

即我们可用Servlet或Session，只要配置对应Handler。

一个Socket上可接收多个HTTP请求，每次请求跟一个Hanlder线程是一对一，因为keepalive，一次请求处理完成后Socket不会立即关闭，下一次再来请求，会分配一个新Hanlder线程。

若很多TCP建立连接后迟迟未写入数据，导致连接请求堵塞，或有很多handle处理耗时I/O操作，同样可能拖慢整个线程池，进而影响accepters和selectors，拖慢整个线程池，jetty咋应对的？

这就是为啥Servlet3.0引入异步Servlet，即遇到耗时I/O操作，Tomcat的线程会立即返回，当业务线程处理完后，再调用Tomcat的线程将响应发回给浏览器。

为启动和协调上面的核心组件工作，Jetty提供Server类做这事，负责创建并初始化Connector、Handler、ThreadPool组件，然后调用start方法启动它们。

## 2 对比Tomcat架构

Tomcat整体和Jetty相似，但：

- Jetty无Service概念
- Tomcat的Service包装了多个连接器和一个容器组件，一个Tomcat实例可配置多个Service，不同Service通过不同的连接器监听不同的端口；而Jetty中Connector是被所有Handler共享
  ![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/903b9e3f0ab69a15a1ba0f6a759be05d.png)

- Tomcat中每个连接器都有自己的线程池，而Jetty中所有Connector共享一个全局的线程池。

## 3 Connector组件

跟Tomcat一样，Connector主要功能是封装I/O模型和应用层协议：

- I/O模型，最新Jetty 9只支持NIO，因此Jetty的Connector设计有明显的Java NIO通信模型痕迹
- 应用层协议，跟Tomcat的Processor一样，Jetty抽象出Connection组件来封装应用层协议的差异

## 4 Java NIO

Java NIO核心组件：Channel、Buffer和Selector。

Channel表示一个连接，可理解为一个Socket，通过它读写数据，但不能直接操作数据，需通过Buffer中转。

Selector可检测Channel上的I/O事件，如读就绪、写就绪、连接就绪，一个Selector可同时处理多个Channel，因此单线程可监听多个Channel，大量减少线程上下文切换开销。

同一个浏览器发过来的请求会复用TCP连接，即用同一Channel。Channel是非阻塞的，连接器里维护了这些Channel实例，超时时间到了后，channel还没数据到来，表象即用户长时间未操作浏览器，这时Tomcat才关闭该channel。

## 5 服务端NIO程序

1. 创建服务端Channel，绑定监听端口并把Channel设为非阻塞方式。

```java
ServerSocketChannel server = ServerSocketChannel.open();
server.socket().bind(new InetSocketAddress(port));
server.configureBlocking(false);
```

2. 创建Selector，并在Selector中注册Channel感兴趣的事件**OP_ACCEPT**，告诉Selector如果客户端有新的连接请求到这个端口就通知我。

```java
Selector selector = Selector.open();
server.register(selector, SelectionKey.OP_ACCEPT);
```

3. Selector会在一个死循环里不断调用select去查询I/O状态，查询某个Channel上是否有数据可读。select会返回一个SelectionKey列表，Selector会遍历这个列表，看看是否有“客户”感兴趣的事件，如果有，就采取相应的动作。

如下例，若有新的连接请求，就建立一个新的连接。连接建立后，再注册Channel的可读事件到Selector中，告诉Selector我对这个Channel上是否有新的数据到达感兴趣。

```java
 while (true) {
        selector.select();//查询I/O事件
        for (Iterator<SelectionKey> i = selector.selectedKeys().iterator(); i.hasNext();) { 
            SelectionKey key = i.next(); 
            i.remove(); 

            if (key.isAcceptable()) { 
                // 建立一个新连接 
                SocketChannel client = server.accept(); 
                client.configureBlocking(false); 
                
                // 连接建立后，告诉Selector，我现在对I/O可读事件感兴趣
                client.register(selector, SelectionKey.OP_READ);
            } 
        }
    } 
```

所以服务端在I/O通信上主要完成了三件事情：

- 监听连接
- I/O事件查询
- 数据读写

Jetty设计Acceptor、SelectorManager和Connection来分别做这三事。

### Acceptor

独立的Acceptor线程组处理连接请求。多个Acceptor共享同一个ServerSocketChannel。多个Acceptor线程调用同一个ServerSocketChannel#accept，由操作系统保证线程安全。

为啥Acceptor组件是直接使用 ServerSocketChannel.accept() 接受连接的，为什么不使用向Selector注册OP_ACCEPT事件的方式来接受连接？直接调用.accept()方法有什么考虑？
直接调用accept方法，编程上简单一些，否则每个Acceptor又要自己维护一个Selector。

在Connector的实现类ServerConnector中，有一个_acceptors的数组，在Connector启动的时候, 会根据_acceptors数组的长度创建对应数量的Acceptor，而Acceptor的个数可以配置。

```java
for (int i = 0; i < _acceptors.length; i++)
{
  Acceptor a = new Acceptor(i);
  getExecutor().execute(a);
}
```

Acceptor是ServerConnector中的一个内部类，同时也是一个Runnable，Acceptor线程是通过getExecutor得到的线程池来执行的，前面提到这是一个全局的线程池。

Acceptor通过阻塞方式接受连接。

```java
public void accept(int acceptorID) throws IOException
{
  ServerSocketChannel serverChannel = _acceptChannel;
  if (serverChannel != null && serverChannel.isOpen())
  {
    // 这里是阻塞的
    SocketChannel channel = serverChannel.accept();
    // 执行到这里时说明有请求进来了
    accepted(channel);
  }
}
```

接受连接成功后会调用accepted，将SocketChannel设置为非阻塞模式，然后交给Selector去处理。

```java
private void accepted(SocketChannel channel) throws IOException
{
    channel.configureBlocking(false);
    Socket socket = channel.socket();
    configure(socket);
    // _manager是SelectorManager实例，里面管理了所有的Selector实例
    _manager.accept(channel);
}
```

### SelectorManager

Jetty的Selector由SelectorManager类管理，而被管理的Selector叫作ManagedSelector。SelectorManager内部有一个ManagedSelector，真正的打工人。

每个ManagedSelector都有自己的Selector，多个Selector可以并行管理大量的channel，提高并发，连接请求到达时采用Round Robin的方式选择ManagedSelector。


```java
public void accept(SelectableChannel channel, Object attachment)
{
  //选择一个ManagedSelector来处理Channel
  final ManagedSelector selector = chooseSelector();
  //提交一个任务Accept给ManagedSelector
  selector.submit(selector.new Accept(channel, attachment));
}
```

SelectorManager从本身的Selector数组中选择一个Selector来处理这个Channel，并创建一个任务Accept交给ManagedSelector，ManagedSelector在处理这个任务主要做了两步：

1. 调用Selector#register把Channel注册到Selector上，拿到一个SelectionKey

```java
 _key = _channel.register(selector, SelectionKey.OP_ACCEPT, this);
```

2. ，创建一个EndPoint和Connection，并跟这个SelectionKey（Channel）绑定

```java
private void createEndPoint(SelectableChannel channel, SelectionKey selectionKey) throws IOException
{
    //1. 创建EndPoint
    EndPoint endPoint = _selectorManager.newEndPoint(channel, this, selectionKey);
    
    //2. 创建Connection
    Connection connection = _selectorManager.newConnection(channel, endPoint, selectionKey.attachment());
    
    //3. 把EndPoint、Connection和SelectionKey绑在一起
    endPoint.setConnection(connection);
    selectionKey.attach(endPoint);
    
}
```

就好像到餐厅吃饭：

- 先点菜（注册I/O事件）
- 服务员（ManagedSelector）给你一个单子（SelectionKey）
- 等菜做好了（I/O事件到了）
- 服务员根据单子就知道是哪桌点了这个菜，于是喊一嗓子某某桌的菜做好了（调用了绑定在SelectionKey上的EndPoint的方法）

ManagedSelector并没有调用直接EndPoint的方法去处理数据，而是通过调用EndPoint的方法返回一个Runnable，然后把这个Runnable扔给线程池执行，这个Runnable才会去真正读数据和处理请求。

### Connection

这个Runnable是EndPoint的一个内部类，它会调用Connection的回调方法来处理请求。Jetty的Connection组件类比就是Tomcat的Processor，负责具体协议的解析，得到Request对象，并调用Handler容器进行处理。下面我简单介绍一下它的具体实现类HttpConnection对请求和响应的处理过程。

请求处理：HttpConnection并不会主动向EndPoint读取数据，而是向在EndPoint中注册一堆回调方法：

```java
getEndPoint().fillInterested(_readCallback);
```

告诉EndPoint，数据到了你就调我这些回调方法_readCallback吧，有点异步I/O的感觉，也就是说Jetty在应用层面模拟了异步I/O模型。

回调方法_readCallback里，会调用EndPoint的接口去读数据，读完后让HTTP解析器去解析字节流，HTTP解析器会将解析后的数据，包括请求行、请求头相关信息存到Request对象。

响应处理：Connection调用Handler进行业务处理，Handler会通过Response对象来操作响应流，向流里面写入数据，HttpConnection再通过EndPoint把数据写到Channel，这样一次响应就完成了。

- Connector的工作流
  ![](https://img-blog.csdnimg.cn/aa67e9e0f8ca44f2b878812763cdb708.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
  1.Acceptor监听连接请求，当有连接请求到达时就接受连接，一个连接对应一个Channel，Acceptor将Channel交给ManagedSelector来处理
  2.ManagedSelector把Channel注册到Selector上，并创建一个EndPoint和Connection跟这个Channel绑定，接着就不断地检测I/O事件
  3.I/O事件到了就调用EndPoint的方法拿到一个Runnable，并扔给线程池执行
  4.线程池中调度某个线程执行Runnable
  5.Runnable执行时，调用回调函数，这个回调函数是Connection注册到EndPoint中的
  6.回调函数内部实现，其实就是调用EndPoint的接口方法来读数据
  7.Connection解析读到的数据，生成请求对象并交给Handler组件去处理

## 6 Handler

一个接口，有一堆实现类，Jetty的Connector组件调用这些接口来处理Servlet请求，我们先来看看这个接口定义成什么样子。

```java
public interface Handler extends LifeCycle, Destroyable
{
    // 处理请求的方法
    public void handle(String target, Request baseRequest, HttpServletRequest request, HttpServletResponse response)
        throws IOException, ServletException;
    
    // 每个Handler都关联一个Server组件，被Server管理
    public void setServer(Server server);
    public Server getServer();

    // 销毁方法相关的资源
    public void destroy();
}
```

任何一个Handler都需要关联一个Server组件，也就是说Handler需要被Server组件来管理。一般来说Handler会加载一些资源到内存，因此通过设置destroy方法来销毁。

### Handler继承关系

Handler只是一个接口，完成具体功能的还是它的子类。那么Handler有哪些子类呢？它们的继承关系又是怎样的？这些子类是如何实现Servlet容器功能的呢？

Jetty中定义了一些默认Handler类，并且这些Handler类之间的继承关系比较复杂，我们先通过一个全景图来了解一下
![](https://img-blog.csdnimg.cn/d4ddf6cfe8114375980fe06be6022bcf.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
Handler接口之下有抽象类AbstractHandler，之下有AbstractHandlerContainer，为什么需要这个类呢？
过渡，为实现链式调用，一个Handler内部必然要有其他Handler的引用，所以这个类的名字里才有Container。

- HandlerWrapper和HandlerCollection都是Handler，但这些Handler里还包括其他Handler的引用
- HandlerWrapper只包含一个其他Handler的引用，而HandlerCollection中有一个Handler数组的引用。
  ![](https://img-blog.csdnimg.cn/1e4cb3dd192445cba95e317d89fbed55.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

HandlerWrapper有两个子类：

- Server
  Handler模块的入口，必然要将请求传递给其他Handler来处理，为了触发其他Handler的调用，所以它是一个HandlerWrapper。
- ScopedHandler
  实现了“具有上下文信息”的责任链调用。Servlet规范规定Servlet在执行过程中有上下文。这些Handler在执行过程中就是通过ScopedHandler来实现的获得上下文。
  ScopedHandler有一堆的子类用来实现Servlet规范，比如ServletHandler、ContextHandler、SessionHandler、ServletContextHandler和WebAppContext

### HandlerCollection

维护了一个Handler数组。因为Jetty可能需要同时支持多个Web应用，如果每个Web应用有一个Handler入口，那么多个Web应用的Handler就成了一个数组，比如Server中就有一个HandlerCollection，Server会根据用户请求的URL从数组中选取相应的Handler来处理，就是选择特定的Web应用来处理请求。

### Handler的类型

#### 协调Handler

负责将请求路由到一组Handler中去，比如HandlerCollection，它内部持有一个Handler数组，当请求到来时，它负责将请求转发到数组中的某一个Handler。

#### 过滤器Handler

自己会处理请求，处理完了后再把请求转发到下一个Handler，比如HandlerWrapper，它内部持有下一个Handler的引用。
所有继承了HandlerWrapper的Handler都具有了过滤器Handler的特征，比如ContextHandler、SessionHandler和WebAppContext等。

#### 内容Handler

这些Handler会真正调用Servlet来处理请求，生成响应内容，比如ServletHandler。
如果浏览器请求的是一个静态资源，也有相应的ResourceHandler来处理这个请求，返回静态页面。

### 实现Servlet规范

上文提到，ServletHandler、ContextHandler以及WebAppContext等，它们实现了Servlet规范，那具体是怎么实现的呢？为了帮助你理解，在这之前，我们还是来看看如何使用Jetty来启动一个Web应用。

```java
//新建一个WebAppContext，WebAppContext是一个Handler
WebAppContext webapp = new WebAppContext();
webapp.setContextPath("/mywebapp");
webapp.setWar("mywebapp.war");

//将Handler添加到Server中去
server.setHandler(webapp);

//启动Server
server.start();
server.join();
```

上面的过程主要分为两步：

第一步创建一个WebAppContext，接着设置一些参数到这个Handler中，就是告诉WebAppContext你的WAR包放在哪，Web应用的访问路径是什么。

第二步就是把新创建的WebAppContext添加到Server中，然后启动Server。

WebAppContext对应一个Web应用。我们回忆一下Servlet规范中有Context、Servlet、Filter、Listener和Session等，Jetty要支持Servlet规范，就需要有相应的Handler来分别实现这些功能。因此，Jetty设计了3个组件：ContextHandler、ServletHandler和SessionHandler来实现Servlet规范中规定的功能，而WebAppContext本身就是一个ContextHandler，另外它还负责管理ServletHandler和SessionHandler。

我们再来看一下什么是ContextHandler。ContextHandler会创建并初始化Servlet规范里的ServletContext对象，同时ContextHandler还包含了一组能够让你的Web应用运行起来的Handler，可以这样理解，Context本身也是一种Handler，它里面包含了其他的Handler，这些Handler能处理某个特定URL下的请求。比如，ContextHandler包含了一个或者多个ServletHandler。

再来看ServletHandler，它实现了Servlet规范中的Servlet、Filter和Listener的功能。ServletHandler依赖FilterHolder、ServletHolder、ServletMapping、FilterMapping这四大组件。FilterHolder和ServletHolder分别是Filter和Servlet的包装类，每一个Servlet与路径的映射会被封装成ServletMapping，而Filter与拦截URL的映射会被封装成FilterMapping。

SessionHandler从名字就知道它的功能，用来管理Session。除此之外WebAppContext还有一些通用功能的Handler，比如SecurityHandler和GzipHandler，同样从名字可以知道这些Handler的功能分别是安全控制和压缩/解压缩。

WebAppContext会将这些Handler构建成一个执行链，通过这个链会最终调用到我们的业务Servlet。我们通过一张图来理解一下。



通过对比Tomcat的架构图，你可以看到，Jetty的Handler组件和Tomcat中的容器组件是大致是对等的概念，Jetty中的WebAppContext相当于Tomcat的Context组件，都是对应一个Web应用；而Jetty中的ServletHandler对应Tomcat中的Wrapper组件，它负责初始化和调用Servlet，并实现了Filter的功能。

对于一些通用组件，比如安全和解压缩，在Jetty中都被做成了Handler，这是Jetty Handler架构的特点。

因此对于Jetty来说，请求处理模块就被抽象成Handler，不管是实现了Servlet规范的Handler，还是实现通用功能的Handler，比如安全、解压缩等，我们可以任意添加或者裁剪这些“功能模块”，从而实现高度的可定制化。

## 7 总结

Jetty的Connector只支持NIO模型，跟Tomcat的NioEndpoint组件一样，它也是通过Java的NIO API实现的。

在线程模型设计上Tomcat的NioEndpoint跟Jetty的Connector是相似的，都是用一个Acceptor数组监听连接，用一个Selector数组侦测I/O事件，用一个线程池执行请求。它们的不同点在于，Jetty使用了一个全局的线程池，所有的线程资源都是从线程池来分配。
Jetty Connector使用回调函数模拟异步I/O，比如Connection向EndPoint注册了一堆回调函数。它的本质将函数当作一个参数来传递，告诉对方，你准备好了就调这个回调函数。