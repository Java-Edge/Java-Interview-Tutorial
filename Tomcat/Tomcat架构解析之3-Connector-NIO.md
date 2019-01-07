 上文简单记录了默认的`Connector`的内部构造及消息流，同时此`Connector`也是基于BIO的实现。
除BIO，也可以通过配置快速部署NIO的connector。在server.xml中如下配置； 
![](https://upload-images.jianshu.io/upload_images/4685968-87f363fd5799f01e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
整个Tomcat是一个比较完善的框架体系，各组件间都是基于接口实现，方便扩展
像这里的`org.apache.coyote.http11.Http11NioProtocol`和BIO的`org.apache.coyote.http11.Http11Protocol`都是统一的实现`org.apache.coyote.ProtocolHandler`接口
![ProtocolHandler的实现类](https://upload-images.jianshu.io/upload_images/4685968-1692695fcf7cdd96.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
从整体结构上来说，NIO还是与BIO的实现保持大体一致 
![NIO connector的内部结构](http://upload-images.jianshu.io/upload_images/4685968-c5e5606d449d79fe.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
还是可以看见`Connector`中三大件 
*   Http11NioProtocol
*   Mapper
*   CoyoteAdapter

基本功能与BIO的类似
重点看看Http11NioProtocol.
![](https://upload-images.jianshu.io/upload_images/4685968-2e26d52579579cb1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-1d7fdae8653721dd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
和JIoEndpoint一样，`NioEndpoint`是`Http11NioProtocol`中负责接收处理`socket`的主要模块
![NioEndpoint的主要流程](http://upload-images.jianshu.io/upload_images/4685968-fa5b7563c9ebbbd7.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "点击查看原始大小图片")
`Acceptor`及`Worker`分别是以线程池形式存在
Poller是一个单线程
注意，与BIO的实现一样,默认状态下，在server.xml中
- 没有配置<Executor>，则以Worker线程池运行
- 配置了<Executor>，则以基于juc 系列的ThreadPoolExecutor线程池运行。 

# Acceptor
- 接收socket线程，这里虽然是基于NIO的connector，但是在接收socket方面还是传统的serverSocket.accept()方式，获得SocketChannel对象
- 然后封装在一个tomcat的实现类`org.apache.tomcat.util.net.NioChannel`对象中
- 然后将NioChannel对象封装在一个PollerEvent对象中，并将PollerEvent对象压入events queue里。这里是个典型的生产者-消费者模式，Acceptor与Poller线程之间通过queue通信，Acceptor是events queue的生产者，Poller是events queue的消费者。 

#Poller
Poller线程中维护了一个Selector对象，NIO就是基于Selector来完成逻辑的
在`Connector`中并不止一个`Selector`，在`Socket`的读写数据时，为了控制timeout也有一个Selector，在后面的BlockSelector中介绍。可以先把Poller线程中维护的这个Selector标为主Selector
Poller是NIO实现的主要线程。首先作为events queue的消费者，从queue中取出PollerEvent对象，然后将此对象中的channel以OP_READ事件注册到主Selector中，然后主Selector执行select操作，遍历出可以读数据的socket，并从Worker线程池中拿到可用的Worker线程，然后将socket传递给Worker。整个过程是典型的NIO实现。 

# Worker
Worker线程拿到Poller传过来的socket后，将socket封装在SocketProcessor对象中。然后从Http11ConnectionHandler中取出Http11NioProcessor对象，从Http11NioProcessor中调用CoyoteAdapter的逻辑，跟BIO实现一样。在Worker线程中，会完成从socket中读取http request，解析成HttpServletRequest对象，分派到相应的servlet并完成逻辑，然后将response通过socket发回client。在从socket中读数据和往socket中写数据的过程，并没有像典型的非阻塞的NIO的那样，注册OP_READ或OP_WRITE事件到主Selector，而是直接通过socket完成读写，这时是阻塞完成的，但是在timeout控制上，使用了NIO的Selector机制，但是这个Selector并不是Poller线程维护的主Selector，而是BlockPoller线程中维护的Selector，称之为辅Selector。 
# NioSelectorPool
NioEndpoint对象中维护了一个NioSelecPool对象，这个NioSelectorPool中又维护了一个BlockPoller线程，这个线程就是基于辅Selector进行NIO的逻辑。以执行servlet后，得到response，往socket中写数据为例，最终写的过程调用NioBlockingSelector的write方法。 

```
public int write(ByteBuffer buf, NioChannel socket, long writeTimeout,MutableInteger lastWrite) throws IOException {  
        SelectionKey key = socket.getIOChannel().keyFor(socket.getPoller().getSelector());  
        if ( key == null ) throw new IOException("Key no longer registered");  
        KeyAttachment att = (KeyAttachment) key.attachment();  
        int written = 0;  
        boolean timedout = false;  
        int keycount = 1; //assume we can write  
        long time = System.currentTimeMillis(); //start the timeout timer  
        try {  
            while ( (!timedout) && buf.hasRemaining()) {  
                if (keycount > 0) { //only write if we were registered for a write  
                    //直接往socket中写数据  
                    int cnt = socket.write(buf); //write the data  
                    lastWrite.set(cnt);  
                    if (cnt == -1)  
                        throw new EOFException();  
                    written += cnt;  
                    //写数据成功，直接进入下一次循环，继续写  
                    if (cnt > 0) {  
                        time = System.currentTimeMillis(); //reset our timeout timer  
                        continue; //we successfully wrote, try again without a selector  
                    }  
                }  
                //如果写数据返回值cnt等于0，通常是网络不稳定造成的写数据失败  
                try {  
                    //开始一个倒数计数器   
                    if ( att.getWriteLatch()==null || att.getWriteLatch().getCount()==0) att.startWriteLatch(1);  
                    //将socket注册到辅Selector，这里poller就是BlockSelector线程  
                    poller.add(att,SelectionKey.OP_WRITE);  
                    //阻塞，直至超时时间唤醒，或者在还没有达到超时时间，在BlockSelector中唤醒  
                    att.awaitWriteLatch(writeTimeout,TimeUnit.MILLISECONDS);  
                }catch (InterruptedException ignore) {  
                    Thread.interrupted();  
                }  
                if ( att.getWriteLatch()!=null && att.getWriteLatch().getCount()> 0) {  
                    keycount = 0;  
                }else {  
                    //还没超时就唤醒，说明网络状态恢复，继续下一次循环，完成写socket  
                    keycount = 1;  
                    att.resetWriteLatch();  
                }  
  
                if (writeTimeout > 0 && (keycount == 0))  
                    timedout = (System.currentTimeMillis() - time) >= writeTimeout;  
            } //while  
            if (timedout)   
                throw new SocketTimeoutException();  
        } finally {  
            poller.remove(att,SelectionKey.OP_WRITE);  
            if (timedout && key != null) {  
                poller.cancelKey(socket, key);  
            }  
        }  
        return written;  
    }  
```
也就是说当socket.write()返回0时，说明网络状态不稳定，这时将socket注册OP_WRITE事件到辅Selector，由BlockPoller线程不断轮询这个辅Selector，直到发现这个socket的写状态恢复了，通过那个倒数计数器，通知Worker线程继续写socket动作。

看一下BlockSelector线程的逻辑； 
```
public void run() {  
            while (run) {  
                try {  
                    ......  
  
                    Iterator iterator = keyCount > 0 ? selector.selectedKeys().iterator() : null;  
                    while (run && iterator != null && iterator.hasNext()) {  
                        SelectionKey sk = (SelectionKey) iterator.next();  
                        KeyAttachment attachment = (KeyAttachment)sk.attachment();  
                        try {  
                            attachment.access();  
                            iterator.remove(); ;  
                            sk.interestOps(sk.interestOps() & (~sk.readyOps()));  
                            if ( sk.isReadable() ) {  
                                countDown(attachment.getReadLatch());  
                            }  
                            //发现socket可写状态恢复，将倒数计数器置位，通知Worker线程继续  
                            if (sk.isWritable()) {  
                                countDown(attachment.getWriteLatch());  
                            }  
                        }catch (CancelledKeyException ckx) {  
                            if (sk!=null) sk.cancel();  
                            countDown(attachment.getReadLatch());  
                            countDown(attachment.getWriteLatch());  
                        }  
                    }//while  
                }catch ( Throwable t ) {  
                    log.error("",t);  
                }  
            }  
            events.clear();  
            try {  
                selector.selectNow();//cancel all remaining keys  
            }catch( Exception ignore ) {  
                if (log.isDebugEnabled())log.debug("",ignore);  
            }  
        }  
```

使用这个辅Selector主要是减少线程间的切换，同时还可减轻主Selector的负担。以上描述了NIO connector工作的主要逻辑，可以看到在设计上还是比较精巧的。NIO connector还有一块就是Comet，有时间再说吧。需要注意的是，上面从Acceptor开始，有很多对象的封装，NioChannel及其KeyAttachment，PollerEvent和SocketProcessor对象，这些不是每次都重新生成一个新的，都是NioEndpoint分别维护了它们的对象池； 

```
ConcurrentLinkedQueue<SocketProcessor> processorCache = new ConcurrentLinkedQueue<SocketProcessor>()  
ConcurrentLinkedQueue<KeyAttachment> keyCache = new ConcurrentLinkedQueue<KeyAttachment>()  
ConcurrentLinkedQueue<PollerEvent> eventCache = new ConcurrentLinkedQueue<PollerEvent>()  
ConcurrentLinkedQueue<NioChannel> nioChannels = new ConcurrentLinkedQueue<NioChannel>()  
```
当需要这些对象时，分别从它们的对象池获取，当用完后返回给相应的对象池，这样可以减少因为创建及GC对象时的性能消耗
