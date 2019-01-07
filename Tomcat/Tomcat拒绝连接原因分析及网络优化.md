Java Socket网络编程常见的异常有哪些，然后通过一个实验来重现其中的Connection reset异常，并且通过配置Tomcat的参数来解决这个问题。

# 异常场景
### java.net.SocketTimeoutException
超时异常，超时分为
- 连接超时
在调用Socket.connect方法的时候超时，大多因为网络不稳定
- 读取超时
调用Socket.read方法时超时。不一定是因为网络延迟，很可能下游服务的响应时间过长

### java.net.BindException: Address already in use: JVM_Bind
端口被占用。
当服务器端调用
- new ServerSocket(port) 
- 或Socket.bind函数

若端口已被占用，就会抛该异常。

可以用

```bash
netstat –an
```
![](https://img-blog.csdnimg.cn/982f7e6b965a44ceb3733716134b387e.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
查看端口被谁占用了，换个空闲端口即可。

### java.net.ConnectException: Connection refused: connect
连接被拒绝。
当客户端调用
- new Socket(ip, port) 
- 或Socket.connect函数

原因是：
- 未找到指定IP的机器
- 机器存在，但该机器上没有开启指定监听端口
#### 解决方案
从客户端机器ping一下服务端IP：
- ping不通，看看IP是不是写错了？
- ping通，需要确认服务端的服务是不是挂了？

### java.net.SocketException: Socket is closed
连接已关闭。

通信的一方主动关闭了Socket连接（调用了Socket的close方法），接着又对Socket连接进行了读写操作，这时os会报“Socket连接已关闭”。
### java.net.SocketException: Connection reset/Connect reset by peer: Socket write error
连接被重置。
- 通信的一方已将Socket关闭，可能是主动关闭或是因为异常退出，这时如果通信的另一方还在写数据，就会触发这个异常（Connect reset by peer）
- 若对方还在尝试从TCP连接中读数据，则会抛出Connection reset异常。

为了避免这些异常发生，在编写网络通信程序时要确保：
- 程序退出前要主动关闭所有的网络连接
- 检测通信的另一方的关闭连接操作，当发现另一方关闭连接后自己也要关闭该连接。

### java.net.SocketException: Broken pipe
通信管道已坏。

发生这个异常的场景是，通信的一方在收到“Connect reset by peer: Socket write error”后，如果再继续写数据则会抛出Broken pipe异常，解决方法同上。

### java.net.SocketException: Too many open files
进程打开文件句柄数超过限制。

当并发用户数比较大时，服务器可能会报这个异常。这是因为每创建一个Socket连接就需要一个文件句柄，此外服务端程序在处理请求时可能也需要打开一些文件。

可以通过lsof -p pid命令查看进程打开了哪些文件，是不是有资源泄露，即进程打开的这些文件本应该被关闭，但由于程序的Bug而没有被关闭。

如果没有资源泄露，可以通过设置增加最大文件句柄数。具体方法是通过ulimit -a来查看系统目前资源限制，通过ulimit -n 10240修改最大文件数。

# Tomcat网络参数
- maxConnections
- acceptCount

## TCP连接的建立过程
客户端向服务端发送SYN包，服务端回复**SYN＋ACK**，同时将这个处于**SYN_RECV**状态的连接保存到半连接队列。

客户端返回ACK包完成三次握手，服务端将ESTABLISHED状态的连接移入accept队列，等待应用程序（Tomcat）调用accept方法将连接取走。
这里涉及两个队列：
- 半连接队列：保存SYN_RECV状态的连接
队列长度由`net.ipv4.tcp_max_syn_backlog`设置
- accept队列：保存ESTABLISHED状态的连接
队列长度为`min(net.core.somaxconn，backlog)`。其中backlog是我们创建ServerSocket时指定的参数，最终会传递给listen方法：
```c
int listen(int sockfd, int backlog);
```
若设置的backlog大于`net.core.somaxconn`，accept队列的长度将被设置为`net.core.somaxconn`，而这个backlog参数就是Tomcat中的acceptCount参数，默认值100，但请注意`net.core.somaxconn`默认值128。
在高并发情况下当Tomcat来不及处理新连接时，这些连接都被堆积在accept队列，而acceptCount参数可以控制accept队列长度。超过该长度，内核会向客户端发送RST，这样客户端会触发“Connection reset”异常。

**Tomcat#maxConnections** 指Tomcat在任意时刻接收和处理的最大连接数。
当Tomcat接收的连接数达到maxConnections时，Acceptor线程不会再从accept队列取走连接，这时accept队列中的连接会越积越多。

maxConnections的默认值与连接器类型有关：NIO的默认值是10000，APR默认是8192。

所以Tomcat
```bash
最大并发连接数 = maxConnections + acceptCount
```
若acceptCount- 
设置得过大，请求等待时间会比较长；如果acceptCount设置过小，高并发情况下，客户端会立即触发Connection reset异常。

# Tomcat网络调优实战
接下来我们通过一个直观的例子来加深对上面两个参数的理解。我们先重现流量高峰时accept队列堆积的情况，这样会导致客户端触发“Connection reset”异常，然后通过调整参数解决这个问题。主要步骤有：

1. JMeter 创建一个测试计划、一个线程组、一个请求。
测试计划：
![](https://img-blog.csdnimg.cn/d3a1aff7976b460da92a6cdb74928677.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
线程组（线程数这里设置为1000，模拟大流量）：
![](https://img-blog.csdnimg.cn/d8311ca4a98540d98b61b381315d0df2.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

请求（请求的路径是Tomcat自带的例子程序）：
![](https://img-blog.csdnimg.cn/915ac9b81cfd4a7c91ed93f9a74f3d76.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

2.启动Tomcat。
3.开启JMeter测试，在View Results Tree中会看到大量失败的请求，请求的响应里有“Connection reset”异常，也就是前面提到的，当accept队列溢出时，服务端的内核发送了RST给客户端，使得客户端抛出了这个异常。
![](https://img-blog.csdnimg.cn/eba2bf60725848548186bc6378b0c363.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

4.修改内核参数，在/etc/sysctl.conf中增加一行net.core.somaxconn=2048，然后执行命令sysctl -p。
5.修改Tomcat参数acceptCount为2048，重启Tomcat
![](https://img-blog.csdnimg.cn/49394caf8a8941f4ae49b6c16fca7514.png)

6.再次启动JMeter测试，这一次所有的请求会成功，也看不到异常了。我们可以通过下面的命令看到系统中ESTABLISHED的连接数增大了，这是因为我们加大了accept队列的长度。
![](https://img-blog.csdnimg.cn/2aa712c36fbb4b2d8fb166763369f2ed.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)


如果一时找不到问题代码，还可以通过网络抓包工具来分析数据包。