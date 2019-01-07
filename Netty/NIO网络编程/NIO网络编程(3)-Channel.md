Java NIO的Channel类似流，但有不同：
- 既可以从通道中读取数据，又可以写数据到通道。但流的读写通常是单向的
- 通道可以异步地读写
- 通道中的数据总是要先读到一个Buffer，或者总是要从一个Buffer中写入。


从Channel读数据到缓冲区，从缓冲区写数据到Channel。
![](https://img-blog.csdnimg.cn/20201105002543632.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)


# Channel的实现
Java NIO中最重要的通道的实现：
- FileChannel
从文件中读写数据。
- DatagramChannel
通过UDP读写网络中的数据。
- SocketChannel
通过TCP读写网络中的数据。
- ServerSocketChannel
监听新进来的TCP连接，像Web服务器那样。对每一个新进来的连接都会创建一个SocketChannel。

# Channel 示例
下面是一个使用FileChannel读取数据到Buffer中的示例：

```java
RandomAccessFile aFile = new RandomAccessFile("data/nio-data.txt", "rw");
FileChannel inChannel = aFile.getChannel();

ByteBuffer buf = ByteBuffer.allocate(48);

int bytesRead = inChannel.read(buf);
while (bytesRead != -1) {
  System.out.println("Read " + bytesRead);
  buf.flip();

  while(buf.hasRemaining()){
      System.out.print((char) buf.get());
  }

  buf.clear();
  bytesRead = inChannel.read(buf);
}
aFile.close()
```

注意 `buf.flip()`，首先读取数据到Buffer，然后反转Buffer，接着再从Buffer中读取数据。

参考
- http://tutorials.jenkov.com/java-nio/channels.html