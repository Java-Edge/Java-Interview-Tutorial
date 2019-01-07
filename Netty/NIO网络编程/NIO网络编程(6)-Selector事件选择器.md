Selector提供选择执行已经就绪的任务的能力，使得多元 I/O 成为可能，就绪选择和多元执行使得单线程能够有效率地同时管理多个 I/O channel。 

C/C++许多年前就已经有 select()和 poll()这两个POSIX（可移植性操作系统接口）系统调用可供使用。许多os也提供相似的功能，但对Java 程序员来说，就绪选择功能直到 JDK 1.4 才成为可行方案。

# 简介
获取到`SocketChannel`后，直接包装成一个任务，提交给线程池。
引入Selector后， 需要将之前创建的一或多个可选择的Channel注册到Selector对象，一个键(`SelectionKey`)将会被返回。
`SelectionKey` 会记住你关心的Channel，也会追踪对应的Channel是否已就绪。
![](https://img-blog.csdnimg.cn/20201103004955128.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

每个Channel在注册到Selector时，都有一个感兴趣的操作。
- **ServerSocketChannel** 只会在选择器上注册一个，其感兴趣的操作只有**ACCEPT**，表示其只关心客户端的连接请求
- **SocketChannel**，通常会注册多个，因为一个server通常会接受到多个client的请求，就有对应数量的SocketChannel。SocketChannel感兴趣的操作是**CONNECT**、**READ**、**WRITE**，因为其要与server建立连接，也需要进行读、写数据。

# 1 Selector
## 1.1 API
### open
- 打开一个 selector
新的selector是通过调用系统默认的SelectorProvider对象的openSelector方法而创建的。
![](https://img-blog.csdnimg.cn/20201103010536593.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- 注意到默认选择器提供者![](https://img-blog.csdnimg.cn/20201103011031429.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- Mac下的JDK，所以我们需要下载对应平台下的 JDK 哦！
![](https://img-blog.csdnimg.cn/20201103011146123.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
`Selector.open()`不是单例模式的，每次调用该静态方法，会返回新的Selector实例。
# 2 SelectableChannel
## 简介
可通过 Selector 被多路复用的channel。

## register
为了与一个 selector 被使用，这个类的一个实例必须首先经由register方法。 该方法返回一个新SelectionKey表示与所述选择channel的注册对象。
- 使用给定的Selector注册此channel，并返回Selectionkey
![](https://img-blog.csdnimg.cn/20210518173303515.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
一旦与一个Selector注册，直到它的channel资源被关闭完毕。 这包括被分配到由选择的channel任何资源解除分配。

当channel被关闭，该channel上的所有相关key会被自动取消，无论是通过调用其close方法或通过中断一个线程阻塞于所述channel的I/O操作。同时，该 channel 注册到的 selector 也会将该 key 设置为被取消键。
![](https://img-blog.csdnimg.cn/20210528163415876.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210528163502158.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/2021052816381935.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

所以如果后续使用已被取消的 key，会报错：
![](https://img-blog.csdnimg.cn/20210528162934579.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- 若是Selector本身被关闭，则所有注册到该Selector的channel都将被关闭，并且相关的键也立即被取消。

虽然说一个channel可以被注册到多个Selector，但对每个Selector而言，该 channel只能被注册一次。

无论是否channel与一个或多个选择可能通过调用来确定注册isRegistered方法。

### 阻塞模式
可选择的信道或者是在阻断模式或非阻塞模式。 在阻塞模式中，每一个I / O操作在所述信道调用将阻塞，直到它完成。 在非阻塞模式的I / O操作不会阻塞，并且可以传送比被要求或所有可能没有字节更少的字节。 可选择信道的阻塞模式可通过调用其来确定isBlocking方法。
新创建的可选择通道总是处于阻塞模式。 非阻塞模式是在与基于选择复用相结合最有用的。 信道必须被放置到非阻塞模式与一个选择器注册之前，并且可以不被返回到直到它已被注销阻塞模式。

Selector（选择器）是Java NIO中能够检测一到多个NIO通道，并能够知晓通道是否为诸如读写事件做好准备的组件。这样，一个单独的线程可以管理多个channel，从而管理多个网络连接。

# 3 为什么使用Selector?
Selector允许单线程处理多个Channel。使用Selector，首先得向Selector注册
Channel，然后调用它的**select()**。该方法会一直阻塞，直到某个注册的Channel有事件就绪。一旦这个方法返回，线程就可以处理这些事件，事件的例子如新连接
进来，数据接收等。

**单线程处理多Channel的好处**：
只需更少线程处理channel。事实上就是可以只用**一个线程处理所有Channel**。对于os，线程间上下文切换开销很大且每个线程都要占用系统资源。因此，使用线程越少越好。

但现代os和CPU在多任务方面表现的越来越好，多线程开销变得越来越小。实际上，若CPU是多核的，不使用多任务可能就是在浪费CPU性能。使用Selector能够处理多个**通道**就足够了。

- 单线程使用一个Selector处理3个channel示例图
![](https://img-blog.csdnimg.cn/2020110400210082.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

> Selector选择器对象是线程安全的，但它们包含的键集合不是。通过keys()和selectKeys()返回的键的集合是Selector对象内部的私有的Set对象集合的直接引用。这些集合可能在任意时间被改变。已注册的键的集合是只读的。

> 如果在多个线程并发地访问一个选择器的键的集合的时候存在任何问题，可以采用同步的方式进行访问，在执行选择操作时，选择器在Selector对象上进行同步，然后是已注册的键的集合，最后是已选择的键的集合。
> 
> 在并发量大的时候，使用同一个线程处理连接请求以及消息服务，可能会出现拒绝连接的情况，这是因为当该线程在处理消息服务的时候，可能会无法及时处理连接请求，从而导致超时；一个更好的策略是对所有的可选择通道使用一个选择器，并将对就绪通道的服务委托给其它线程。只需一个线程监控通道的就绪状态并使用一个协调好的的工作线程池来处理接收及发送数据

# 4 Selector的创建
通过调用Selector.open()方法创建一个Selector，如下：
![](https://img-blog.csdnimg.cn/20201103211007422.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

# 5 向Selector注册Channel
为了将Channel和Selector搭配使用，必须将channel注册到selector。
通过`SelectableChannel.register()`：
```java
// 必须是非阻塞模式
channel.configureBlocking(false);
SelectionKey key = channel.register(selector, Selectionkey.OP_READ);
```
### configureBlocking
`configureBlocking()`用于设置通道的阻塞模式，该方法会调用`implConfigureBlocking`
![](https://img-blog.csdnimg.cn/2021052713243197.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
`implConfigureBlocking`会更改阻塞模式为新传入的值，默认为true，传入false，那么该通道将调整为非阻塞。而NIO最大优势就是非阻塞模型，所以一般都需要设置`SocketChannel.configureBlocking(false)`。
可以通过调用`isBlocking()`判断某个socket通道当前处于何种模式。

与Selector一起使用时，Channel必须处于非阻塞模式，所以不能将FileChannel和Selector一起使用，因为FileChannel不能切换到非阻塞模式。而socketChannel都可以。

注意register()方法的第二个参数。这是一个“感兴趣的事件集合”，意思是在通过Selector监听Channel时，对什么事件感兴趣。可监听四种不同类型事件：
- Read
一个有数据可读的通道可以说是“读就绪”。
- Write
等待写数据的通道可以说是“写就绪”。
- Connect
通道触发了一个事件意思是该事件已经就绪。所以，某个channel成功连接到另一个服务器称为“连接就绪”。
- Accept
一个server socket channel准备好接收新进入的连接称为“接收就绪”。

这四种事件用SelectionKey的四个常量来表示：
![](https://img-blog.csdnimg.cn/20201103211755909.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

若对不止一种事件感兴趣，那么可以用“|”操作符将常量连接：
```java
int interestSet = SelectionKey.OP_READ | SelectionKey.OP_WRITE;
```
# 6 SelectionKey
封装了特定的channel与特定的Selector的注册关系。
![](https://img-blog.csdnimg.cn/20210528105807285.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

SelectionKey对象被SelectableChannel.register(Selector sel, int ops)返回并提供一个表示这种注册关系的标记。
![](https://img-blog.csdnimg.cn/20210527144220779.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

**SelectionKey**包含两个比特集（以整数形式编码）：该注册关系所关心的channel操作及channel已就绪的操作。
![](https://img-blog.csdnimg.cn/20210527144438676.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

> interestOps(int) 
> 将此key的interest设置为给定值。 可以随时调用此方法。它是否阻塞以及持续多久取决于实现。

- 兴趣set确定下一次调用选择器的选择方法之一时，将测试哪些操作类别是否准备就绪。使用创建key时给定的值来初始化兴趣set；以后可以通过interestOps(int)对其进行更改。
- 准备集标识键的选择器已检测到键的通道已准备就绪的操作类别。创建密钥时，将就绪集初始化为零；否则，将其初始化为零。它可能稍后会在选择操作期间由选择器更新，但无法直接更新。

向Selector注册Channel时，register()方法会返回一个SelectionKey对象，包含了一些你感兴趣的属性：

- ready集合
- Channel
- Selector
- 附加的对象（可选）
interest集合
## interest集合
interest集合是你所选择的感兴趣的事件集合。可以通过SelectionKey读写interest集合，像这样：

```java
int interestSet = selectionKey.interestOps();
boolean isInterestedInAccept  = (interestSet & SelectionKey.OP_ACCEPT) == SelectionKey.OP_ACCEPT；
boolean isInterestedInConnect = interestSet & SelectionKey.OP_CONNECT;
boolean isInterestedInRead    = interestSet & SelectionKey.OP_READ;
boolean isInterestedInWrite   = interestSet & SelectionKey.OP_WRITE;
```

“位与”interest 集合和给SelectionKey常量，可以确定某事件是否在interest 集合。

## ready集合
通道已经准备就绪的操作的集合。在一次选择(Selection)之后，你会首先访问这个ready set。可以这样访问ready集合：
![](https://img-blog.csdnimg.cn/20201103212408880.png#pic_center)

可用像检测interest集合那样检测channel中什么事件或操作已就绪。
也可使用以下四个方法，它们都会返回一个布尔类型：

```java
selectionKey.isAcceptable();
selectionKey.isConnectable();
selectionKey.isReadable();
selectionKey.isWritable();
```

> 推荐使用内部的已取消的键的集合来延迟注销，是一种防止线程在取消键时阻塞，并防止与正在进行的选择操作冲突的优化。

## Channel + Selector
从SelectionKey访问Channel和Selector很简单。如下：
![](https://img-blog.csdnimg.cn/20201103212802626.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- **SelectionKey.channel()** 返回的channel需要转型成你要处理的类型
![](https://img-blog.csdnimg.cn/20210528151530345.png)

![](https://img-blog.csdnimg.cn/20201103213124598.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
## 附加的对象
### attach、attachment
附加给定对象到该key。一个被附加的对象可能稍后就会被attachment获取。 只有一个对象可以在一个时间被附加。调用此方法会使先前的附加对象被丢弃。 当前附加对象可通过附加`null`丢弃。
![](https://img-blog.csdnimg.cn/20201104002644277.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
![](https://img-blog.csdnimg.cn/20201104002815286.png#pic_center)

可将一个对象或更多信息附到SelectionKey，方便识别channel。
例如，可以附加与channel一起使用的Buffer，或是包含聚集数据的某个对象。
```java
selectionKey.attach(theObject);
Object attachedObj = selectionKey.attachment();
```

还可用register()向Selector注册Channel的时候附加对象。如：
```java
SelectionKey key = channel.register(selector, SelectionKey.OP_READ, theObject);
```

# 通过Selector选择通道
一旦向Selector注册了一或多通道，就可调用重载的select()。这些方法返回你所感兴趣的事件（如连接、接受、读或写）已经准备就绪的那些通道。即如果你对“读就绪”通道感兴趣，select()方法会返回读事件已经就绪的那些通道。

## select() API
### select()
- 阻塞，直到至少有一个channel在你注册的事件上就绪。
![](https://img-blog.csdnimg.cn/20201104003219724.png#pic_center)

select()的返回值不是已就绪的channel的总数，而是从上一个select()调用之后，进入就绪态的channel的数量。
之前的调用中就绪的，并在本次调用中仍就绪的channel不会被计入。那些在前一次调用中已就绪，但已不再处于就绪态的通道也不会计入。这些channel可能仍然在SelectionKey集合中，但不会被计入返回值中，所以返回值可能是0。
#### 优雅关闭执行select()的线程
- 使用volatile boolean变量标识线程是否停止
- 停止线程时，需要调用停止线程的interrupt()方法，因为线程有可能在wait()或sleep()，提高停止线程的及时性
- 处于阻塞 IO的处理，尽量使用InterruptibleChannel来代替阻塞 IO。对于NIO，若线程处于select()阻塞状态，这时无法及时检测到条件变量变化，就需要人工调用wakeup()，唤醒线程，使得其可以检测到条件变量。


### select(long timeout)
![](https://img-blog.csdnimg.cn/20201104003551973.png#pic_center)
和select()一样，只是规定了最长会阻塞timeout毫秒(参数)。

### selectNow()
![](https://img-blog.csdnimg.cn/20201104003621879.png#pic_center)
不会阻塞，不管什么channel就绪都立刻返回（此方法执行非阻塞的选择操作。若自从上一次选择操作后，没有channel可选择，则此方法直接返回0）。

select()系列方法返回的int值表示**有多少channel已就绪**，即自上次调用select()方法后有多少channel变成就绪状态。
若调用select()方法，因为有一个channel变成就绪状态，返回了1，若再次调用select()方法，如果另一个通道就绪了，它会再次返回1。
若对第一个就绪的channel没有做任何操作，现在就有两个已就绪channel。但是在每次select()方法调用之间，只有一个channel就绪了。

### selectedKeys()
一旦调用select()方法，并且返回值表明有一个或更多个通道就绪了，然后可以通过调用selector的selectedKeys()方法，访问“已选择键集（selected key set）”中的就绪通道：
```java
Set selectedKeys = selector.selectedKeys();
```
当像Selector注册Channel时，Channel.register()方法会返回一个SelectionKey 对象。这个对象代表了注册到该Selector的Channel。可通过SelectionKey的selectedKeySet()方法访问这些对象。

可遍历该**selectedKeys**访问就绪的Channel：
![](https://img-blog.csdnimg.cn/20210528110235184.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

这个循环遍历已选择键集中的每个键，并检测各个键所对应的通道的就绪事件。

注意每次迭代末尾调用`keyIterator.remove()`。Selector不会自己从**selectedKeys**中移除SelectionKey实例。必须在处理完通道时自己移除。下次该通道变成就绪时，Selector会再次将其放入**selectedKeys**。

### wakeUp()
某个线程调用 **select()** 后阻塞了，即使没有channel已就绪，也有办法让其从select()返回。
只需通过其它线程在第一个线程调用select()方法的那个对象上调用Selector.wakeup()。阻塞在select()方法上的线程会立马返回。

若有其它线程调用了wakeup()，但当前没有线程阻塞在select()，下个调用select()方法的线程会立即“醒来（wake up）”。

作用总结：
- 解除阻塞在Selector.select()/select(long)上的线程，立即返回
- 两次成功的select之间多次调用wakeup等价于一次调用
- 如果当前没有阻塞在select上，则本次wakeup调用将作用于下一次select操作

### close()
用完Selector后调用其close()会关闭该Selector，且使注册到该Selector上的所有SelectionKey实例无效。但channel本身并不会关闭。

### 示例
打开一个Selector，将一个channel注册到这个Selector，然后持续监控这个Selector的四种事件（接受，连接，读，写）是否就绪。

```java
Selector selector = Selector.open();
channel.configureBlocking(false);
SelectionKey key = channel.register(selector, SelectionKey.OP_READ);
while(true) {
	int readyChannels = selector.select();
	if(readyChannels == 0) continue;
		Set selectedKeys = selector.selectedKeys();
		Iterator keyIterator = selectedKeys.iterator();
		while(keyIterator.hasNext()) {
		SelectionKey key = keyIterator.next();
	if(key.isAcceptable()) {
		// a connection was accepted by a ServerSocketChannel.
	} else if (key.isConnectable()) {
		// a connection was established with a remote server.
	} else if (key.isReadable()) {
		// a channel is ready for reading
	} else if (key.isWritable()) {
	 	// a channel is ready for writing
	}
	keyIterator.remove();
	}
}
```