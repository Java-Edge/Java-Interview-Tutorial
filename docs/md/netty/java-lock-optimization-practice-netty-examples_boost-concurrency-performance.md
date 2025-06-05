# Java锁优化实战：从Netty案例学提升并发性能

## 1 锁的对象和范围

缩小粒度：

```java
public class ServerBootstrap extends AbstractBootstrap<ServerBootstrap, ServerChannel> {

  	@Override
    void init(Channel channel) {
      	// 注意newOptionsArray
        setChannelOptions(channel, newOptionsArray(), logger);
        setAttributes(channel, newAttributesArray());
```

```java
public abstract class AbstractBootstrap {

    static Map.Entry<ChannelOption<?>, Object>[] newOptionsArray(Map<ChannelOption<?>, Object> options) {
      // see!
      synchronized (options) {
          return new LinkedHashMap<ChannelOption<?>, Object>(options).entrySet().toArray(EMPTY_OPTION_ARRAY);
      }
  }
```

## 2 锁的对象本身大小

减少空间占用：

```java
public final class ChannelOutboundBuffer {
  
  private static final AtomicLongFieldUpdater<ChannelOutboundBuffer> TOTAL_PENDING_SIZE_UPDATER =
            AtomicLongFieldUpdater.newUpdater(ChannelOutboundBuffer.class, "totalPendingSize");
```

### 2.1 AtomicLong V.S long

前者是对象，包含对象头（object header）以保存hashcode、lock等信息，64位系统下：

- volatile long = 8bytes
- AtomicLong = 8bytes（volatile long）+ 16bytes（对象头）+ 8 bytes（引用）= 32 bytes，至少节约24字节

所以 Atomic* objects =》 Volatile primary type + Static Atomic*FieldUpdater

## 3 锁的速度

提高并发性。

### 3.1 LongCounter

记录内存分配字节数等功能用到的。
高并发下: java.util.concurrent.atomic.AtomicLong => java.util.concurrent.atomic.LongAdder

```java
// 为当前平台创建新的最快的LongCounter实现
public final class PlatformDependent {
  
  public static LongCounter newLongCounter() {
      if (javaVersion() >= 8) {
          return new LongAdderCounter();
      } else {
          return new AtomicLongCounter();
      }
  }
```

及时衡量、使用JDK最新功能。

### 3.2 根据不同情况，选择不同的并发包实现

JDK < 1.8考虑ConcurrentHashMapV8（ConcurrentHashMap在JDK8中的版本）：

![](https://p.ipic.vip/besi8s.png)

## 4 不同场景选择不同的并发类

因需而变。关闭和等待关闭事件执行器( Event Executor)：
Object.wait/ notify =》 CountDownLatch

```java
private final CountDownLatch threadLock = new CountDownLatch(1);
```

Nio Event loop中负责存储task的Queue，JDK's LinkedBlockingQueue (MPMC，多生产者多消费者) -> jctools' MPSC。io.netty.util.internal.PlatformDependent.Mpsc#newMpscQueue(int)：

```java
public final class PlatformDependent {
  
  static <T> Queue<T> newChunkedMpscQueue(final int chunkSize, final int capacity) {
            return USE_MPSC_CHUNKED_ARRAY_QUEUE ? new MpscChunkedArrayQueue<T>(chunkSize, capacity)
                    : new MpscChunkedAtomicArrayQueue<T>(chunkSize, capacity);
        }
```

```java
public class MpscUnboundedArrayQueue<E> extends BaseMpscLinkedArrayQueue<E>
{
  
  	public MpscUnboundedArrayQueue(int chunkSize) {
        super(chunkSize);
    }
```

## 5 锁的价值

能不用则不用。Netty应用场景下：

```java
局部串行+整体并行   > 一个队列+多个线程模式
```

- 降低用户开发难度、逻辑简单、提升处理性能
- 避免锁带来的上下文切换和并发保护等额外开销

避免用锁：ThreadLocal避免资源争用，如Netty轻量级的线程池实现

```java
public abstract class Recycler<T> {
  
  private final FastThreadLocal<Stack<T>> threadLocal = new FastThreadLocal<Stack<T>>() {
```