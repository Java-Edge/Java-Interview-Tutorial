Java NIO中的Buffer用于和NIO Channel交互。数据是从通道读入缓冲区，从缓冲区写入到通道中。

缓冲区本质上是块可以写入数据，然后可从中读数据的内存。这块内存被包装成NIO Buffer对象，并提供了一组方法，用来方便的访问该块内存。

# 1 基本用法
使用Buffer读写数据一般遵循以下四个步骤：

1. 写数据到Buffer
2. 调用`buffer.flip()`
3. 从Buffer中读取数据
4. 调用clear()或compact()

当向buffer写数据时，buffer会记录写了多少数据。一旦要读取数据，需通过flip()将Buffer从写模式切到读模式。
在读模式下，可读之前写到buffer的所有数据。

一旦读完数据，就需要清空缓冲区，让它可以再次被写入。有两种方式能清空缓冲区：调用clear()或compact()方法。clear()方法会清空整个缓冲区。compact()方法只会清除已经读过的数据。任何未读的数据都被移到缓冲区的起始处，新写入的数据将放到缓冲区未读数据的后面。

# 2 使用Buffer的案例

```java
RandomAccessFile aFile = new RandomAccessFile("data/nio-data.txt", "rw");
FileChannel inChannel = aFile.getChannel();

//create buffer with capacity of 48 bytes
ByteBuffer buf = ByteBuffer.allocate(48);

int bytesRead = inChannel.read(buf); //read into buffer.
while (bytesRead != -1) {

  buf.flip();  //make buffer ready for read

  while(buf.hasRemaining()){
      System.out.print((char) buf.get()); // read 1 byte at a time
  }

  buf.clear(); //make buffer ready for writing
  bytesRead = inChannel.read(buf);
}
aFile.close();
```

#  3 Buffer的capacity,position和limit

![](https://img-blog.csdnimg.cn/20201105005432930.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

## 3.1 capacity
作为一个内存块，Buffer有个固定大小，即`capacity`。你只能往里写`capacity`个byte、long，char等。一旦Buffer满，需将其清空（通过读或清除数据）才能继续往里写数据。

## 3.2 position
取决于Buffer处在读还是写模式：
- 写数据到Buffer时，position表示当前位置。初始的position值为0，当一个byte、long等数据写到Buffer后， position会向前移动到下一个可插入数据的Buffer单元。所以position最大可为capacity–1。
- 读数据时，也是从某特定位置读。当将Buffer从写模式切换到读模式，position会被重置为0。当从Buffer的position处读取数据时，position向前移动到下一个可读的位置。

## 3.3  limit
- 写模式
最多能往Buffer写多少数据，所以此时`limit=capacity`。
- 读模式
最多能读到多少数据。

因此，当切换Buffer到读模式时，limit会被设置成写模式下的position值。即你能读到之前写入的所有数据（limit被设置成已写数据的数量，这个值在写模式下就是position）。

# 4 Buffer的类型
- Java NIO Buffer有如下类型
![](https://img-blog.csdnimg.cn/20201105011610540.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

这些Buffer类型代表了不同的数据类型，即可通过这些类型来操作缓冲区中的字节。

# 5 Buffer的分配
要想获得一个Buffer对象首先要进行分配。 每个Buffer类都有一个allocate方法。

分配48字节capacity的ByteBuffer的例子。
```java
ByteBuffer buf = ByteBuffer.allocate(48);
```
分配一个可存储1024个字符的CharBuffer：
```java
CharBuffer buf = CharBuffer.allocate(1024);
```

# 6 向Buffer中写数据
写数据到Buffer有两种方式：
1. 从Channel写到Buffer

```java
int bytesRead = inChannel.read(buf); //read into buffer.
```
2. 通过Buffer的put()方法写到Buffer里。
```java
buf.put(127);
```

put方法有很多版本，允许以不同方式把数据写入到Buffer中。例如， 写到一个指定的位置，或者把一个字节数组写入到Buffer。

# 7 从Buffer读数据
两种方式：
1. 从Buffer读取数据到Channel。

```java
int bytesWritten = inChannel.write(buf);
```
2. 使用get()方法从Buffer中读取数据。
```java
byte aByte = buf.get();
```

get方法有很多版本，允许你以不同的方式从Buffer中读取数据。例如，从指定position读取，或者从Buffer中读取数据到字节数组。

# 8 核心 API
## flip()
- 将Buffer从写模式切换到读模式![](https://img-blog.csdnimg.cn/20201107174036807.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
`limit`置成之前的`position`值
`position`置0

即
- `position`现在用于标记读的位置
- `limit`表示之前写进了多少个byte、char等 —— 现在能读取多少个byte、char等

## rewind()

![](https://img-blog.csdnimg.cn/20201107174323502.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
`position`置0：可重读Buffer中的所有数据
`limit`不变，仍表示能从Buffer中读取多少个元素

## clear() && compact()
读完Buffer中的数据后，需要让Buffer准备再次被写入。
这通过clear()或compact()完成。

### clear()
![](https://img-blog.csdnimg.cn/20201107174554610.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
`position`置0
`limit`置成 `capacity` 的值
即 Buffer 被清空。

Buffer中的数据并未清除，只是这些标识位告诉我们可以从哪开始往Buffer写数据。

若Buffer中尚有未读数据，调用clear()，数据将“被遗忘”，即不再有任何标记会告诉你哪些数据被读过，哪些还没有。
若Buffer中仍有未读的数据且后续还想读这些数据，但你需要先写一些数据，那么使用compact()。
### compact()
将所有未读数据拷贝到Buffer起始处。
- 然后将`position`设到最后一个未读元素正后面
- `limit`属性依然像clear()方法一样，设置成`capacity`。

现在Buffer准备好写数据了，但**不会覆盖未读数据**。

## ByteBuf 的状态图
![](https://img-blog.csdnimg.cn/20201107172540897.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

## mark()与reset()方法
通过调用Buffer.mark()方法，可以标记Buffer中的一个特定position。之后可以通过调用Buffer.reset()方法恢复到这个position。例如：

```java
buffer.mark();
// call buffer.get() a couple of times, e.g. during parsing.
buffer.reset(); 
```

## equals()与compareTo()方法
可以使用equals()和compareTo()方法比较两个Buffer。

### equals()
当满足下列条件时，表示两个Buffer相等：
1. 有相同的类型（byte、char、int等）
2. Buffer中剩余的byte、char等的个数相等
3. Buffer中所有剩余的byte、char等都相同。

equals只是比较Buffer的一部分，不是每一个在它里面的元素都比较。实际上，它只比较Buffer中的剩余元素。

### compareTo()
compareTo()方法比较两个Buffer的剩余元素(byte、char等)， 如果满足下列条件，则认为一个Buffer“小于”另一个Buffer：
1. 第一个不相等的元素小于另一个Buffer中对应的元素
2. 所有元素都相等，但第一个Buffer比另一个先耗尽(第一个Buffer的元素个数比另一个少)。

> 剩余元素是从 position到limit之间的元素。

参考
- http://tutorials.jenkov.com/java-nio/buffers.html
- 《Java的事件驱动网络编程》