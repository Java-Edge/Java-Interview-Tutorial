Condition就是实现了管程里面的条件变量。
Java 语言内置的管程里只有一个条件变量，而Lock&Condition实现的管程支持多个条件变量。
支持多个条件变量，能让代码可读性更好，实现也更容易。例如，你看我这里实现一个阻塞队列，就需要两个条件变量：
- 队列不空
空队列自然没有元素能出队
- 队列不满
队列已满，当然也不可有元素再入队
![](https://img-blog.csdnimg.cn/20210421150133653.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
Lock和Condition实现的管程，线程等待和通知需要调用await()、signal()、signalAll()，它们的语义和wait()、notify()、notifyAll()相同。
- Lock&Condition实现的管程里只能使用await()、signal()、signalAll()
- synchronized实现的管程才能使用wait()、notify()、notifyAll()

如果在Lock&Condition实现的管程里调用wait()、notify()、notifyAll()，你距离离职就更近一步了。

### Thread.sleep() V.S Condition.await()
Object.wait()和Condition.await()的原理是基本一致的，不同在于Condition.await()底层是调用LockSupport.park()实现阻塞当前线程。它在阻塞当前线程前，其实还做了：
1. 把当前线程添加到条件队列
2. **完全**释放锁，即让state=0，然后才调用`LockSupport.park()`阻塞当前线程

JDK的Lock和Condition不过就是管程的一种实现，一般如何使用呢？

> 什么是同步与异步？
- 同步
调用方需要等待结果
- 异步
不需要等待结果

> 代码里如何实现异步？

- 调用方创建一个子线程，在子线程中执行方法调用，即异步调用
- 方法实现时，创建一个新的线程执行主要逻辑，主线程直接return，即异步方法。

异步场景挺多，比如TCP协议本身是异步的，日常的RPC调用，在TCP协议层面，发送完RPC请求后，线程不会等待RPC响应结果。

> 是不是好奇了，明明日常使用的RPC调用都是同步的呀？这到底是同步还是异步？

这肯定有人帮忙实现了异步转同步。比如RPC框架Dubbo，具体它是怎么做到的呢？

对于下面一个简单的RPC调用，默认情况下sayHello()是个同步方法，即执行service.sayHello(“dubbo”)时，线程会停下来等结果。

```java
DemoService service = 初始化部分省略
String message = service.sayHello("dubbo");
System.out.println(message);
```

- 若此时dump调用线程的调用栈
![](https://img-blog.csdnimg.cn/20210421154327773.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
发现调用线程阻塞了，线程状态是**TIMED_WAITING**。本来发送请求是异步的，但是调用线程却阻塞了，说明Dubbo帮我们做了异步转同步的事情。通过调用栈看到线程是阻塞在`DefaultFuture.get()`，所以Dubbo异步转同步的功能应该是通过DefaultFuture实现。

DefaultFuture.get()之前发生了什么呢：
![](https://img-blog.csdnimg.cn/20210421160657953.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

> 我们的期望：
> - RPC返回结果前，阻塞调用线程，让调用线程等待
> - RPC返回结果后，唤醒调用线程，让调用线程重新执行

这就是经典的等待-通知机制，即管程的实现方案。
- 看看Dubbo是怎么实现的。
![](https://img-blog.csdnimg.cn/20210421170330667.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)