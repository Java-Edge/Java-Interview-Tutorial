Java5之前只能用synchronized和volatile，5后Doug Lea加入了ReentrantLock，并不是替代内置锁，而是当内置锁机制不适用时，作为一种可选择的高级功能
不适用包括
- 无法中断一个正在等待获取锁的线程
- 无限的锁等待
- 内置锁必须放在代码块里面（编程有些局限性）

所以提供了J.U.C的Lock
# 1.  Lock和ReentrantLock
![Lock接口定义](http://upload-images.jianshu.io/upload_images/4685968-dc1ca37c9ee37a2c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![使用范例](http://upload-images.jianshu.io/upload_images/4685968-f31c64919b44f26e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
之所以叫ReentrantLock，可理解为两部分
- Re-entrant
可重入，lock多少次都没关系，只需要unlock即可，或者lock里面嵌套了别的lock都可以
- Lock
提供了和synchronized一样的互斥性和内存可见性，与synchronized的monitor内存语义一样

#2. synchronized（S）    VS     lock（L） 
-  L 是接口，S 是关键字 
- S异常时，会自动释放线程占有的锁，不会发生死锁
L异常时，若没有主动通过 unlock（）释放锁，则很有可能造成死锁.所以用 lock 时要在 finally 中释放锁. 
- L 可以当等待锁的线程响应中断
使用 S 时，等待的线程将会一直等下去，不能响应中断
- 通过 L 可以知道是否成功获得锁，S 不可以 
- L 可以提高多个线程进行读写操作的效率 

#3 Lock的特性
*   可定时锁等待
*   可轮询锁等待
*   可中断锁等待
*   公平性
*   实现非块结构的加锁
*   绑定多个Condition。通过多次newCondition可以获得多个Condition对象,可以简单的实现比较复杂的线程同步的功能.通过await(),signal();

下面依次讲解：

##3.1 轮询锁和定时锁
内置锁的死锁问题只能通过重启解决，可定时和可轮询锁提供了另一种选择
通过`tryLock`解决
```
public class DeadlockAvoidance {
    private static Random rnd = new Random();

    public boolean transferMoney(Account fromAcct,
                                 Account toAcct,
                                 DollarAmount amount,
                                 long timeout,
                                 TimeUnit unit)
            throws InsufficientFundsException, InterruptedException {
        long fixedDelay = getFixedDelayComponentNanos(timeout, unit);
        long randMod = getRandomDelayModulusNanos(timeout, unit);
        long stopTime = System.nanoTime() + unit.toNanos(timeout); //定时，轮询

        while (true) {
            if (fromAcct.lock.tryLock()) {
                try {
                    if (toAcct.lock.tryLock()) {
                        try {
                            if (fromAcct.getBalance().compareTo(amount) < 0)
                                throw new InsufficientFundsException();
                            else {
                                fromAcct.debit(amount);
                                toAcct.credit(amount);
                                return true;
                            }
                        } finally {
                            toAcct.lock.unlock();
                        }
                    }
                } finally {
                    fromAcct.lock.unlock();
                }
            }
            if (System.nanoTime() < stopTime)
                return false;
            NANOSECONDS.sleep(fixedDelay + rnd.nextLong() % randMod);
        }
    }

    private static final int DELAY_FIXED = 1;
    private static final int DELAY_RANDOM = 2;

    static long getFixedDelayComponentNanos(long timeout, TimeUnit unit) {
        return DELAY_FIXED;
    }

    static long getRandomDelayModulusNanos(long timeout, TimeUnit unit) {
        return DELAY_RANDOM;
    }

    static class DollarAmount implements Comparable<DollarAmount> {
        public int compareTo(DollarAmount other) {
            return 0;
        }

        DollarAmount(int dollars) {
        }
    }

    class Account {
        public Lock lock;

        void debit(DollarAmount d) {
        }

        void credit(DollarAmount d) {
        }

        DollarAmount getBalance() {
            return null;
        }
    }

    class InsufficientFundsException extends Exception {
    }
}

```
##3.2 带有时间限制的锁
![](http://upload-images.jianshu.io/upload_images/4685968-2042b71c6e0a7eec.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##3.3 可中断的锁
![](http://upload-images.jianshu.io/upload_images/4685968-d1bcc5b13fa2deae.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##3.4关于Condition
最典型的就是阻塞的有界队列的实现。
```
public class BoundedBuffer {

    private static final Logger logger = LoggerFactory.getLogger(BoundedBuffer.class);

    final Lock lock = new ReentrantLock();

    final Condition notFull = lock.newCondition();

    final Condition notEmpty = lock.newCondition();

    final Object[] items = new Object[2]; // 阻塞队列

    int putptr, takeptr, count;

    private void log(String info) {
        logger.info(Thread.currentThread().getName() + " - " + info);
    }

    public void put(Object x) throws InterruptedException {
        log(x + ",执行put");
        lock.lock();
        log(x + ",put lock.lock()");
        try {
            while (count == items.length) { // 如果队列满了，notFull就一直等待
                log(x + ",put notFull.await() 队列满了");
                notFull.await(); // 调用await的意思取反，及not notFull -> Full
            }
            items[putptr] = x; // 终于可以插入队列
            if (++putptr == items.length) {
                putptr = 0; // 如果下标到达数组边界，循环下标置为0
            }
            ++count;
            log(x + ",put成功 notEmpty.signal() 周知队列不为空了");
            notEmpty.signal(); // 唤醒notEmpty
        } finally {
            log(x + ",put lock.unlock()");
            lock.unlock();
        }
    }

    public Object take() throws InterruptedException {
        log("执行take");
        lock.lock();
        Object x = null;
        log("take lock.lock()");
        try {
            while (count == 0) {
                log("take notEmpty.await() 队列为空等等");
                notEmpty.await();
            }
            x = items[takeptr];
            if (++takeptr == items.length) {
                takeptr = 0;
            }
            --count;
            log(x + ",take成功 notFull.signal() 周知队列有剩余空间了");
            notFull.signal();
            return x;
        } finally {
            lock.unlock();
            log(x + ",take lock.unlock()");
        }
    }

    public static void main(String[] args) throws InterruptedException {
        final BoundedBuffer bb = new BoundedBuffer();
        ExecutorService executor = Executors.newFixedThreadPool(10);

        for (char i = 'A'; i < 'F'; i++) {
            final char t = i;
            executor.execute(() -> {
                try {
                    bb.put(t);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            });
        }

        List<Character> res = new LinkedList<>();
        for (char i = 'A'; i < 'F'; i++) {
            executor.execute(() -> {
                try {
                    char c = (char) bb.take();
                    res.add(c);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            });
        }

        try {
            executor.awaitTermination(2, TimeUnit.SECONDS);
        } catch (InterruptedException ie) {
            ie.printStackTrace();
        }

        logger.info(res.toString());
        executor.shutdownNow();
    }
}

```
#4 性能考虑因素
Java5的时候J.U.C的ReentrantLock锁竞争性能非常好，到了Java6使用了改进后的算法来管理内置锁，所以现在差不太多了，只好一点点

竞争性能的影响可伸缩性的关键要素：如果有越多的资源被耗费在锁的管理和线程调度上，那么应用程序得到的资源就越少，锁的实现方式越好，将需要越少的系统调用和上下文切换。

#5 公平性
ReentrantLock默认创建非公平的锁，非公平是指
被阻塞挂起的线程(LockSupport.park)都在AQS的CLH队列中排队等待自己被唤醒
他们是按照发出的请求顺序来排队的
但一旦有一个唤醒的就会和新来的线程竞争锁，新来的可能会“插队”，如果新来的成功获取锁，那么它将跳过所有等待线程而开始执行，这意味着本该被唤醒的线程失败了，对不起您回到队列的尾部继续等
这就是非公平性。

一般，非公平锁的性能要好于公平锁。
原因在于一个线程被唤醒是需要时间的，挂起线程和唤醒恢复线程存在开销，这个空隙如果有其他线程处于ready状态，不需要上下文切换，那么直接运行就行，
A持有锁，B请求，但是B在恢复的过程中,C可以插队"非公平"的获取锁，然后执行再释放，这时候B刚刚好做完上下文切换可以
 执行，这个对于B和C来说是一个“双赢”的局面，是提高吞吐量的原因。

那么JVM也没有在其内置锁上采用公平性的机制。

#6 synchronized和ReentrantLock的选择
除非使用到3提到的高级特性，或者内置锁无法满足需求时，否则还是老实用内置锁，毕竟是JVM自身提供的，而不是靠类库，因此可能会执行一些优化。

另外内置锁在利用kill -3 dump thread的时候可以发现栈帧上的一些monitor lock的信息，识别死锁，而J.U.C的锁这方面就不太行，当然JAVA6之后提供了管理和调试接口解决了。

#7 读-写锁
ReentrantLock每次只有一个线程能持有锁，但是这种严格的互斥也会抑制并发。会抑制
*   写/写
*   写/读
*   读/读

冲突，但是很多情况下读操作是非常多的，如果放宽加锁的需求，允许多个读操作可以同时访问数据，那么就可以提升性能
**但是要保证读取的数据是最新的,不会有其他线程修改数据**

使用ReadWriteLock的场景是
- 一个资源可以被多个读操作访问
- 被一个写操作访问

但是二者不能同时进行
![](http://upload-images.jianshu.io/upload_images/4685968-f67b0246c467a4af.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
如果读线程正在持有锁,这时候另外一个写线程,那么会优先获取写锁

应用
```
public class ReadWriteMap<K, V> {
    private final Map<K, V> map;
    private final ReadWriteLock lock=new ReentrantReadWriteLock();
    private final Lock r=lock.readLock();
    private final Lock w=lock.writeLock();

    public ReadWriteMap(Map<K, V> map) {
        this.map=map;
    }

    public V put(K key, V value) {
        w.lock();
        try {
            return map.put( key, value );
        } finally {
            w.unlock();
        }
    }

    public V remove(Object key) {
        w.lock();
        try {
            return map.remove( key );
        } finally {
            w.unlock();
        }
    }

    public void putAll(Map<? extends K, ? extends V> m) {
        w.lock();
        try {
            map.putAll( m );
        } finally {
            w.unlock();
        }
    }

    public void clear() {
        w.lock();
        try {
            map.clear();
        } finally {
            w.unlock();
        }
    }

    public V get(Object key) {
        r.lock();
        try {
            return map.get( key );
        } finally {
            r.unlock();
        }
    }

    public int size() {
        r.lock();
        try {
            return map.size();
        } finally {
            r.unlock();
        }
    }

    public boolean isEmpty() {
        r.lock();
        try {
            return map.isEmpty();
        } finally {
            r.unlock();
        }
    }

    public boolean containsKey(Object key) {
        r.lock();
        try {
            return map.containsKey( key );
        } finally {
            r.unlock();
        }
    }

    public boolean containsValue(Object value) {
        r.lock();
        try {
            return map.containsValue( value );
        } finally {
            r.unlock();
        }
    }
}
```
