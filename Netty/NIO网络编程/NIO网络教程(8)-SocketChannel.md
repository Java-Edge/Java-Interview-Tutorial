Java NIO中的SocketChannel是一个连接到TCP  网络套接字的通道。

可通过如下方式创建SocketChannel：
- 打开一个SocketChannel，并连接到网络上的某台服务器
- 一个新连接到达ServerSocketChannel时，会创建一个SocketChannel

# 打开 SocketChannel
下面是SocketChannel的打开方式的简单用法：
```java
SocketChannel socketChannel = SocketChannel.open();
socketChannel.connect(new InetSocketAddress("http://jenkov.com", 80));
```
看看Tomcat#NioEndpoint是如何使用的
```java
ServerSocketChannel serverSock = ServerSocketChannel.open();
socketProperties.setProperties(serverSock.socket());
InetSocketAddress addr = new InetSocketAddress(getAddress(), getPortWithOffset());
serverSock.socket().bind(addr,getAcceptCount());
```

# 关闭 SocketChannel
当用完SocketChannel之后调用`SocketChannel.close()`关闭SocketChannel：
```java
socketChannel.close();
```
# 从 SocketChannel 读取数据
要从SocketChannel中读取数据，调用一个read()的方法之一。如下：
```java
ByteBuffer buf = ByteBuffer.allocate(48);

int bytesRead = socketChannel.read(buf);
```
首先，分配一个Buffer。从SocketChannel读取到的数据将会放到这个Buffer中。

然后，调用SocketChannel.read()。该方法将数据从SocketChannel 读到Buffer中。read()方法返回的int值表示读了多少字节进Buffer里。如果返回的是-1，表示已经读到了流的末尾（连接关闭了）。

# 写入 SocketChannel
写数据到SocketChannel用的是`SocketChannel.write()`，该方法以一个Buffer作为参数。

如下：
```java
String newData = "New String to write to file..." + System.currentTimeMillis();
ByteBuffer buf = ByteBuffer.allocate(48);
buf.clear();
buf.put(newData.getBytes());
buf.flip();
while(buf.hasRemaining()) {
    channel.write(buf);
}
```

注意SocketChannel.write()方法的调用是在一个while循环中的。Write()方法无法保证能写多少字节到SocketChannel。所以，我们重复调用write()直到Buffer没有要写的字节为止。

# 非阻塞模式
可以设置 SocketChannel 为非阻塞模式（non-blocking mode）。设置后，就可以在异步模式下调用connect(), read() 和write()。

## connect()
如果SocketChannel在非阻塞模式下，此时调用connect()，该方法可能在连接建立之前就返回了。为了确定连接是否建立，可以调用finishConnect()的方法。像这样：

```java
socketChannel.configureBlocking(false);
socketChannel.connect(new InetSocketAddress("http://jenkov.com", 80));
while(! socketChannel.finishConnect() ){
    //wait, or do something else...
}
```

## write()
非阻塞模式下，write()方法在尚未写出任何内容时可能就返回了。所以需要在循环中调用write()。前面已经有例子了，这里就不赘述了。

## read()
非阻塞模式下,read()方法在尚未读取到任何数据时可能就返回了。所以需要关注它的int返回值，它会告诉你读取了多少字节。

# 非阻塞模式与Selector
非阻塞模式与Selectors搭配会工作的更好，通过将一或多个SocketChannel注册到Selector，可以询问选择器哪个通道已经准备好了读取，写入等。