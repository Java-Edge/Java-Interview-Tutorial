#1 Java中的阻塞队列
![](https://upload-images.jianshu.io/upload_images/4685968-cbf23e2eb43aceed.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##1.1 简介
一种支持两个附加操作的队列,是一系列阻塞队列类的接口
当存取条件不满足时,阻塞在操作处

 - 队列满时,阻塞存储元素的线程,直到队列可用
 - 队列空时,获取元素的线程会等待队列非空
 
阻塞队列常用于生产者/消费者场景,生产者是向队列里存元素的线程,消费者是从队列里取元素的线程.阻塞队列就是生产者存储元素、消费者获取元素的容器
![BlockingQueue继承体系](http://upload-images.jianshu.io/upload_images/4685968-9e7f1b6c305819cc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![阻塞队列不可用时,两个附加操作提供了4种处理方式](http://upload-images.jianshu.io/upload_images/4685968-a29ee4f281eb03ad?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
 - ***抛出异常***
    -  当队列满时,如果再往队列里插入元素,会抛出IllegalStateException("Queuefull")异常
   - 当队列空时，从队列里获取元素会抛出NoSuchElementException异常
 - ***返回特殊值***
   - 当往队列插入元素时,会返回元素是否插入成功,成功则返回true
   - 若是移除方法,则是从队列里取出一个元素,若没有则返回null
 - ***一直阻塞***
   - 当阻塞队列满时,如果生产者线程往队列里put元素,队列会一直阻塞生产者线程,直到队列有可用空间或响应中断退出
   - 当队列空时,若消费者线程从队列里take元素,队列会阻塞住消费者线程,直到队列非空 
 - ***超时退出***
   - 当阻塞队列满时,若生产者线程往队列里插入元素,队列会阻塞生产者线程
一段时间,若超过指定的时间,生产者线程就会退出

>若是无界阻塞队列,队列不会出现满的情况,所以使用put或offer方法永远不会被阻塞,使用offer方法时,永远返回true
> 
> BlockingQueue 不接受 null 元素,抛 NullPointerException
null 被用作指示 poll 操作失败的警戒值(无法通过编译)
> 
> 
BlockingQueue 实现主要用于生产者/使用者队列，但它另外还支持 Collection 接口。
因此，举例来说，使用 remove(x) 从队列中移除任意一个元素是有可能的。
然而，这种操作通常表现并不高效，只能有计划地偶尔使用，比如在取消排队信息时。

> BlockingQueue 的实现是线程安全的
所有排队方法都可使用内置锁或其他形式的并发控制来自动达到它们的目的
然而，大量的Collection 操作（addAll、containsAll、retainAll 和 removeAll）没有必要自动执行，除非在实现中特别说明
因此，举例来说，在只添加 c 中的一些元素后，addAll(c) 有可能失败（抛出一个异常）

> BlockingQueue 实质上不支持使用任何一种“close”或“shutdown”操作来指示不再添加任何项
这种功能的需求和使用有依赖于实现的倾向
例如，一种常用的策略是：对于生产者，插入特殊的 end-of-stream 或 poison 对象，并根据使用者获取这些对象的时间来对它们进行解释 

#2 生产者和消费者例子
在介绍具体的阻塞类之前，先来看看阻塞队列最常应用的场景，即生产者和消费者例子
一般而言，有n个生产者，各自生产产品，并放入队列
同时有m个消费者，各自从队列中取出产品消费
当队列已满时（队列可以在初始化时设置Capacity容量），生产者会在放入队列时阻塞；当队列空时，消费者会在取出产品时阻塞。代码如下：
```
public class BlockingQueueExam {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<String> blockingQueue = new LinkedBlockingQueue<>(3);
        ExecutorService service = Executors.newCachedThreadPool();
        for (int i = 0; i < 5; i++) {
            service.submit(new Producer("Producer" + i, blockingQueue));
        }
        for (int i = 0; i < 5; i++) {
            service.submit(new Consumer("Consumer" + i, blockingQueue));
        }
        service.shutdown();
    }
}

class Producer implements Runnable {
    private final String name;
    private final BlockingQueue<String> blockingQueue;
    private static Random rand = new Random(47);
    private static AtomicInteger productID = new AtomicInteger(0);

    Producer(String name, BlockingQueue<String> blockingQueue) {
        this.name = name;
        this.blockingQueue = blockingQueue;
    }

    @Override
    public void run() {
        try {
            for (int i = 0; i < 10; i++) {
                SECONDS.sleep(rand.nextInt(5));
                String str = "Product" + productID.getAndIncrement();
                blockingQueue.add(str);
                //注意，这里得到的size()有可能是错误的
                System.out.println(name + " product " + str + ", queue size = " + blockingQueue.size());
            }
            System.out.println(name + " is over");
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

class Consumer implements Runnable {
    private final String name;
    private final BlockingQueue<String> blockingQueue;
    private static Random rand = new Random(47);

    Consumer(String name, BlockingQueue<String> blockingQueue) {
        this.name = name;
        this.blockingQueue = blockingQueue;
    }

    @Override
    public void run() {
        try {
            for (int i = 0; i < 10; i++) {
                SECONDS.sleep(rand.nextInt(5));
                String str = blockingQueue.take();
                //注意，这里得到的size()有可能是错误的
                System.out.println(name + " consume " + str + ", queue size = " + blockingQueue.size());
            }
            System.out.println(name + " is over");
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```
以上代码中的阻塞队列是LinkedBlockingQueue，初始化容量为3
生产者5个，每个生产者间隔随机时间后生产一个产品put放入队列，每个生产者生产10个产品
消费者也是5个，每个消费者间隔随机时间后take取出一个产品进行消费，每个消费者消费10个产品
可以看到，当队列满时，所有生产者被阻塞
当队列空时，所有消费者被阻塞
代码中还用到了AtomicInteger原子整数，用来确保产品的编号不会混乱

# 2 **Java里的阻塞队列**
![BlockingQueue的实现类](http://upload-images.jianshu.io/upload_images/4685968-d05fd46243a9bf6f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
至JDK8,Java提供了7个阻塞队列
- ArrayBlockingQueue：数组结构组成的有界阻塞队列
- LinkedBlockingQueue：链表结构组成的有界(默认MAX_VALUE容量)阻塞队列
- PriorityBlockingQueue：支持优先级调度的无界阻塞队列,排序基于compareTo或Comparator完成
- DelayQueue：支持延迟获取元素,在OS调用中较多或者应用于某些条件变量达到要求后需要做的事情
- SynchronousQueue：一个不存储元素的阻塞队列。
- LinkedTransferQueue：链表结构的TransferQueue,无界阻塞队列
- LinkedBlockingDeque：链表结构的双向阻塞队列
## 2.1 LinkedBlockingQueue和ArrayBlockingQueue
![](https://upload-images.jianshu.io/upload_images/4685968-469fae51c96576fd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a8d5673e8779077b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
基于数组的阻塞队列实现，在`ArrayBlockingQueue`内部，维护了一个定长数组，以便缓存队列中的数据对象，这是一个常用的阻塞队列，除了一个定长数组外，ArrayBlockingQueue内部还保存着两个整形变量，分别标识着队列的头部和尾部在数组中的位置。

　　ArrayBlockingQueue在生产者放入数据和消费者获取数据，都是共用同一个锁对象，由此也意味着两者无法真正并行运行，这点尤其不同于LinkedBlockingQueue；按照实现原理来分析，ArrayBlockingQueue完全可以采用分离锁，从而实现生产者和消费者操作的完全并行运行。Doug Lea之所以没这样去做，也许是因为ArrayBlockingQueue的数据写入和获取操作已经足够轻巧，以至于引入独立的锁机制，除了给代码带来额外的复杂性外，其在性能上完全占不到任何便宜。 ArrayBlockingQueue和LinkedBlockingQueue间还有一个明显的不同之处在于，前者在插入或删除元素时不会产生或销毁任何额外的对象实例，而后者则会生成一个额外的Node对象。这在长时间内需要高效并发地处理大批量数据的系统中，其对于GC的影响还是存在一定的区别。而在创建ArrayBlockingQueue时，我们还可以控制对象的内部锁是否采用公平锁，默认采用非公平锁。
都是FIFO队列
正如其他Java集合一样，链表形式的队列，其存取效率要比数组形式的队列高
但是在一些并发程序中，数组形式的队列由于具有一定的可预测性，因此可以在某些场景中获得更好的效率
 
另一个不同点在于，ArrayBlockingQueue支持“公平”策略
若在构造函数中指定了“公平”策略为true,可以有效避免一些线程被“饿死”,公平性通常会降低吞吐量,但也减少了可变性和避免了“不平衡性" 
`BlockingQueue queue = new ArrayBlockingQueue<>(3, true); `
总体而言，LinkedBlockingQueue是阻塞队列的最经典实现，在不需要“公平”策略时，基本上使用它就够了
> 所谓公平访问队列是指阻塞的线程,可以按照阻塞的先后顺序访问队列,即先阻塞的线程先访问队列
> 非公平性是对先等待的线程是非公平的,当队列有可用空间时,阻塞的线程都可以争夺访问队列的资格,有可能先阻塞的线程最后才访问队列

为保证公平性,通常会降低吞吐量.我们可以使用以下代码创建一个公平的阻塞队列
```
ArrayBlockingQueue fairQueue = new ArrayBlockingQueue(1000,true);
```
![访问者的公平性是使用可重入锁实现的](http://upload-images.jianshu.io/upload_images/4685968-1e4244e433e8c991.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##2.2  SynchronousQueue同步队列
![](https://upload-images.jianshu.io/upload_images/4685968-37f19ec95f4dbe98.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

比较特殊的阻塞队列，它具有以下几个特点： 
1. 一个插入方法的线程必须等待另一个线程调用取出 
2. 队列没有容量Capacity（或者说容量为0），事实上队列中并不存储元素，它只是提供两个线程进行信息交换的场所 
3. 由于以上原因，队列在很多场合表现的像一个空队列。不能对元素进行迭代，不能peek元素，poll会返回null 
4. 队列中不允许存入null元素 
5. SynchronousQueue如同ArrayedBlockingQueue一样，支持“公平”策略 

下面是一个例子，5个Producer产生产品，存入队列
5个Consumer从队列中取出产品，进行消费。

```
public class SynchronizeQueueExam {
    public static void main(String[] args) {
        SynchronousQueue<String> queue = new SynchronousQueue<>(false);
        ExecutorService service = Executors.newCachedThreadPool();
        for (int i = 0; i < 5; i++) {
            service.submit(new Producer(queue, "Producer" + i));
        }
        for (int i = 0; i < 5; i++) {
            service.submit(new Consumer(queue, "Consumer" + i));
        }
        service.shutdown();
    }

    static class Producer implements Runnable {
        private final SynchronousQueue<String> queue;
        private final String name;
        private static Random rand = new Random(47);
        private static AtomicInteger productID = new AtomicInteger(0);

        Producer(SynchronousQueue<String> queue, String name) {
            this.queue = queue;
            this.name = name;
        }

        @Override
        public void run() {
            try {
                for (int i = 0; i < 5; i++) {
                    TimeUnit.SECONDS.sleep(rand.nextInt(5));
                    String str = "Product" + productID.incrementAndGet();
                    queue.put(str);
                    System.out.println(name + " put " + str);
                }
                System.out.println(name + " is over.");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }


    static class Consumer implements Runnable {
        private final SynchronousQueue<String> queue;
        private final String name;

        Consumer(SynchronousQueue<String> queue, String name) {
            this.queue = queue;
            this.name = name;
        }

        @Override
        public void run() {
            try {
                for (int i = 0; i < 5; i++) {
                    String str = queue.take();
                    System.out.println(name + " take " + str);
                }
                System.out.println(name + " is over.");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```
##2.3  PriorityBlockingQueue优先级阻塞队列 
![](https://upload-images.jianshu.io/upload_images/4685968-1873eb6013d54379.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
1. 队列中的元素总是按照“自然顺序”排序，或者根据构造函数中给定的Comparator进行排序
2. 队列中不允许存在null，也不允许存在不能排序的元素 
3. 对于排序值相同的元素，其序列是不保证的，当然你可以自己扩展这个功能 
4. 队列容量是没有上限的，但是如果插入的元素超过负载，有可能会引起OOM
5. 使用迭代子iterator()对队列进行轮询，其顺序不能保证
6. 具有BlockingQueue的put和take方法，但是由于队列容量没有上线，所以put方法是不会被阻塞的，但是take方法是会被阻塞的
7. 可以给定初始容量，这个容量会按照一定的算法自动扩充 

下面是一个PriorityBlockingQueue的例子，例子中定义了一个按照字符串倒序排列的队列
5个生产者不断产生随机字符串放入队列
5个消费者不断从队列中取出随机字符串
同一个线程取出的字符串基本上是倒序的（因为不同线程同时存元素，因此取的字符串打印到屏幕上往往不是倒序的了）                  
```
public class PriorityBlockingQueueExam {
    public static void main(String[] args) {
        //创建一个初始容量为3，排序为字符串排序相反的队列
        PriorityBlockingQueue<String> queue = new PriorityBlockingQueue<>(3, (o1, o2) -> {
            if (o1.compareTo(o2) < 0) {
                return 1;
            } else if (o1.compareTo(o2) > 0) {
                return -1;
            } else {
                return 0;
            }
        });

        ExecutorService service = Executors.newCachedThreadPool();
        for (int i = 0; i < 5; i++) {
            service.submit(new Producer("Producer" + i, queue));
        }
        for (int i = 0; i < 5; i++) {
            service.submit(new Consumer("Consumer" + i, queue));
        }
        service.shutdown();
    } 

    static class Producer implements Runnable {
        private final String name;
        private final PriorityBlockingQueue<String> queue;
        private static Random rand = new Random(System.currentTimeMillis());

        Producer(String name, PriorityBlockingQueue<String> queue) {
            this.name = name;
            this.queue = queue;
        }

        @Override
        public void run() {
            for (int i = 0; i < 10; i++) {
                String str = "Product" + rand.nextInt(1000);
                queue.put(str);
                System.out.println("->" + name + " put " + str);
                try {
                    TimeUnit.SECONDS.sleep(rand.nextInt(5));
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            System.out.println(name + " is over");
        }
    }


    static class Consumer implements Runnable {
        private final String name;
        private final PriorityBlockingQueue<String> queue;
        private static Random rand = new Random(System.currentTimeMillis());

        Consumer(String name, PriorityBlockingQueue<String> queue) {
            this.name = name;
            this.queue = queue;
        }

        @Override
        public void run() {
            try {
                for (int i = 0; i < 10; i++) {
                    String str = queue.take();
                    System.out.println("<-" + name + " take " + str);
                    TimeUnit.SECONDS.sleep(rand.nextInt(5));
                }
                System.out.println(name + " is over");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```
##2.4  DelayQueue
队列中只能存入Delayed接口实现的对象
![DelayQueue](http://upload-images.jianshu.io/upload_images/4685968-66f774931c2df19a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/4685968-e9e3297ac26ca792.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/4685968-57058c0b0980efe6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
DelayQueue中存入的对象要同时实现getDelay和compareTo
- getDelay方法是用来检测队列中的元素是否到期
- compareTo方法是用来给队列中的元素进行排序
![DelayQueue持有一个PriorityBlockingQueue](http://upload-images.jianshu.io/upload_images/4685968-9d79acebc32249fb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
每个Delayed对象实际上都放入了这个队列，并按照compareTo方法进行排序

当队列中对象的getDelay方法返回的值<=0（即对象已经超时）时，才可以将对象从队列中取出
若使用take方法，则方法会一直阻塞，直到队列头部的对象超时被取出
若使用poll方法，则当没有超时对象时，直接返回null 

总结来说，有如下几个特点： 
1. 队列中的对象都是Delayed对象，它实现了getDelay和compareTo
2. 队列中的对象按照优先级（按照compareTo）进行了排序，队列头部是最先超时的对象 
3. take方法会在没有超时对象时一直阻塞，直到有对象超时；poll方法会在没有超时对象时返回null。 
4. 队列中不允许存储null，且iterator方法返回的值不能确保按顺序排列
 
下面是一个列子，特别需要注意getDelay和compareTo方法的实现：

```
public class DelayQueueExam {
    public static void main(String[] args) throws InterruptedException {
        DelayQueue<DelayElement> queue = new DelayQueue<>();
        for (int i = 0; i < 10; i++) {
            queue.put(new DelayElement(1000 * i, "DelayElement" + i));
        }
        while (!queue.isEmpty()) {
            DelayElement delayElement = queue.take();
            System.out.println(delayElement.getName());
        }
    }

    static class DelayElement implements Delayed {
        private final long delay;
        private long expired;
        private final String name;

        DelayElement(int delay, String name) {
            this.delay = delay;
            this.name = name;
            expired = System.currentTimeMillis() + delay;
        }

        public String getName() {
            return name;
        }

        @Override
        public long getDelay(TimeUnit unit) {
            return unit.convert(expired - System.currentTimeMillis(), TimeUnit.MILLISECONDS);
        }

        @Override
        public int compareTo(Delayed o) {
            long d = (getDelay(TimeUnit.MILLISECONDS) - o.getDelay(TimeUnit.MILLISECONDS));
            return (d == 0) ? 0 : ((d < 0) ? -1 : 1);
        }
    }
}
```
DelayQueue通过PriorityQueue，使得超时的对象最先被处理，将take对象的操作阻塞住，避免了遍历方式的轮询，提高了性能。在很多需要回收超时对象的场景都能用上
###  BlockingDeque阻塞双向队列
BlockingDeque中各种特性上都非常类似于BlockingQueue，事实上它也继承自BlockingQueue，它们的不同点主要在于BlockingDeque可以同时从队列头部和尾部增删元素。 
因此，总结一下BlockingDeque的四组增删元素的方法： 
第一组，抛异常的方法，包括addFirst(e)，addLast(e)，removeFirst()，removeLast()，getFirst()和getLast()； 
第二组，返回特殊值的方法，包括offerFirst(e) ，offerLast(e) ，pollFirst()，pollLast()，peekFirst()和peekLast()； 
第三组，阻塞的方法，包括putFirst(e)，putLast(e)，takeFirst()和takeLast()； 
第四组，超时的方法，包括offerFirst(e, time, unit)，offerLast(e, time, unit)，pollFirst(time, unit)和pollLast(time, unit)。 
BlockingDeque目前只有一个实现类LinkedBlockingDeque，其用法与LinkedBlockingQueue非常类似，这里就不给出实例了。
### TransferQueue传输队列
TransferQueue继承自BlockingQueue，之所以将它独立成章，是因为它是一个非常重要的队列，且提供了一些阻塞队列所不具有的特性。 
简单来说，TransferQueue提供了一个场所，生产者线程使用transfer方法传入一些对象并阻塞，直至这些对象被消费者线程全部取出。前面介绍的SynchronousQueue很像一个容量为0的TransferQueue。 
下面是一个例子，一个生产者使用transfer方法传输10个字符串，两个消费者线程则各取出5个字符串，可以看到生产者在transfer时会一直阻塞直到所有字符串被取出：

```
public class TransferQueueExam {
    public static void main(String[] args) {
        TransferQueue<String> queue = new LinkedTransferQueue<>();
        ExecutorService service = Executors.newCachedThreadPool();
        service.submit(new Producer("Producer1", queue));
        service.submit(new Consumer("Consumer1", queue));
        service.submit(new Consumer("Consumer2", queue));
        service.shutdown();
    }

    static class Producer implements Runnable {
        private final String name;
        private final TransferQueue<String> queue;

        Producer(String name, TransferQueue<String> queue) {
            this.name = name;
            this.queue = queue;
        }
        @Override
        public void run() {
            System.out.println("begin transfer objects");

            try {
                for (int i = 0; i < 10; i++) {
                    queue.transfer("Product" + i);
                    System.out.println(name + " transfer "+"Product"+i);
                }
                System.out.println("after transformation");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println(name + " is over");
        }
    }

    static class Consumer implements Runnable {
        private final String name;
        private final TransferQueue<String> queue;
        private static Random rand = new Random(System.currentTimeMillis());

        Consumer(String name, TransferQueue<String> queue) {
            this.name = name;
            this.queue = queue;
        }

        @Override
        public void run() {
            try {
                for (int i = 0; i < 5; i++) {
                    String str = queue.take();
                    System.out.println(name + " take " + str);
                    TimeUnit.SECONDS.sleep(rand.nextInt(5));
                }
                System.out.println(name + " is over");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```
上面的代码中只使用了transfer方法，TransferQueue共包括以下方法： 
1. transfer(E e)，若当前存在一个正在等待获取的消费者线程，即立刻移交之；否则会将元素e插入到队列尾部，并进入阻塞状态，直到有消费者线程取走该元素。 
2. tryTransfer(E e)，若当前存在一个正在等待获取的消费者线程（使用take()或者poll()函数），即立刻移交之； 否则返回false，并且不进入队列，这是一个非阻塞的操作。 
3. tryTransfer(E e, long timeout, TimeUnit unit) 若当前存在一个正在等待获取的消费者线程，即立刻移交之；否则会将元素e插入到队列尾部，并且等待被消费者线程获取消费掉，若在指定的时间内元素e无法被消费者线程获取，则返回false，同时该元素被移除。 
4. hasWaitingConsumer() 判断是否存在消费者线程。 
5. getWaitingConsumerCount() 获取所有等待获取元素的消费线程数量。 
再来看两个生产者和两个消费者的例子：

```
public class TransferQueueExam2 {
    public static void main(String[] args) {
        TransferQueue<String> queue = new LinkedTransferQueue<>();
        ExecutorService service = Executors.newCachedThreadPool();
        service.submit(new Producer("Producer1", queue));
        service.submit(new Producer("Producer2", queue));
        service.submit(new Consumer("Consumer1", queue));
        service.submit(new Consumer("Consumer2", queue));
        service.shutdown();
    }

    static class Producer implements Runnable {
        private final String name;
        private final TransferQueue<String> queue;

        Producer(String name, TransferQueue<String> queue) {
            this.name = name;
            this.queue = queue;
        }

        @Override
        public void run() {
            System.out.println(name + " begin transfer objects");

            try {
                for (int i = 0; i < 5; i++) {
                    queue.transfer(name + "_Product" + i);
                    System.out.println(name + " transfer " + name + "_Product" + i);
                }
                System.out.println(name + " after transformation");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println(name + " is over");
        }
    }

    static class Consumer implements Runnable {
        private final String name;
        private final TransferQueue<String> queue;
        private static Random rand = new Random(System.currentTimeMillis());

        Consumer(String name, TransferQueue<String> queue) {
            this.name = name;
            this.queue = queue;
        }

        @Override
        public void run() {
            try {
                for (int i = 0; i < 5; i++) {
                    String str = queue.take();
                    System.out.println(name + " take " + str);
                    TimeUnit.SECONDS.sleep(rand.nextInt(5));
                }
                System.out.println(name + " is over");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```
它的作者Doug Lea 这样评价它：TransferQueue是一个聪明的队列，它是ConcurrentLinkedQueue, SynchronousQueue (在公平模式下), 无界的LinkedBlockingQueues等的超集。 
所以，在合适的场景中，请尽量使用TransferQueue，目前它只有一个实现类LinkedTransferQueue。

### ConcurrentLinkedQueue并发链接队列
#### 1 并发与并行
写到此处时，应该认真梳理一下关于多线程编程中的一些名词了，具体包括多线程（MultiThread）、并发（Concurrency）和并行（Parrellism）。多线程的概念应该是比较清晰的，是指计算机和编程语言都提供线程的概念，多个线程可以同时在一台计算机中运行。 
而并发和并行则是两个非常容易混淆的概念，第一种区分方法是以程序在计算机中的执行方式来区分。我称之为“并发执行”和“并行执行”的区分： 
并发执行是指多个线程（例如n个）在一台计算机中宏观上“同时”运行，它们有可能是一个CPU轮换的处理n个线程，也有可能是m个CPU以各种调度策略来轮换处理n个线程； 
并行执行是指多个线程（n个）在一台计算机的多个CPU（m个，m>=n）上微观上同时运行，并行执行时操作系统不需要调度这n个线程，每个线程都独享一个CPU持续运行直至结束。 
第二种区分方法则是“并发编程”和“并行编程”的区别： 
并发编程可以理解为多线程编程，并发编程的代码必定以“并发执行”的方式运行； 
并行编程则是一种更加特殊的编程方法，它需要使用特殊的编程语言（例如Cilk语言），或者特殊的编程框架（例如Parallel Java 2 Library）。另外，我在本系列的第一篇中提到的Fork-Join框架也是一种并行编程框架。
#### 2 并发的基础
理解了并发的概念，我们再来看首次遇到的带有并发字眼（Concurrent）的类ConcurrentLinkedQueue，并发链接队列。 
目前看来，可以这么认为，在java.util.concurrency包内，凡是带有Concurrent字眼的类，都是以CAS为基础的非阻塞工具类。例如ConcurrentLinkedQueue、ConcurrentLinkedDeque、ConcurrentHashMap、ConcurrentSkipListMap、ConcurrentSkipListSet。 
好了，那么什么是CAS呢？CAS即CompareAndSwap“比较并交换”，具体的细节将会在后续的关于原子变量（Atomic）章节中介绍。简而言之，当代的很多CPU提供了一种CAS指令，由于指令运行不会被打断，因此依赖这种指令就可以设计出一种不需要锁的非阻塞并发算法，依赖这种算法，就可以设计出各种并发类。 
#### 3 各类队列的例子
下面的例子中，我们使用参数控制，分别测试了四种队列在多个线程同时存储变量时的表现：

```
public class ConcurrentLinkedQueueExam {
    private static final int TEST_INT = 10000000;

    public static void main(String[] args) throws InterruptedException {
        long start = System.currentTimeMillis();
        Queue<Integer> queue = null;
        if (args.length < 1) {
            System.out.println("Usage: input 1~4 ");
            System.exit(1);
        }
        int param = Integer.parseInt(args[0]);
        switch (param) {
            case 1:
                queue = new LinkedList<>();
                break;
            case 2:
                queue = new LinkedBlockingQueue<>();
                break;
            case 3:
                queue = new ArrayBlockingQueue<Integer>(TEST_INT * 5);
                break;
            case 4:
                queue = new ConcurrentLinkedQueue<>();
                break;
            default:
                System.out.println("Usage: input 1~4 ");
                System.exit(2);
        }
        System.out.println("Using " + queue.getClass().getSimpleName());

        ExecutorService service = Executors.newCachedThreadPool();
        for (int i = 0; i < 5; i++) {
            service.submit(new Putter(queue, "Putter" + i));
        }
        TimeUnit.SECONDS.sleep(2);
        for (int i = 0; i < 5; i++) {
            service.submit(new Getter(queue, "Getter" + i));
        }
        service.shutdown();
        service.awaitTermination(1, TimeUnit.DAYS);
        long end = System.currentTimeMillis();
        System.out.println("Time span = " + (end - start));
        System.out.println("queue size = " + queue.size());
    }

    static class Putter implements Runnable {
        private final Queue<Integer> queue;
        private final String name;

        Putter(Queue<Integer> queue, String name) {
            this.queue = queue;
            this.name = name;
        }


        @Override
        public void run() {
            for (int i = 0; i < TEST_INT; i++) {
                queue.offer(1);
            }
            System.out.println(name + " is over");
        }
    }

    static class Getter implements Runnable {
        private final Queue<Integer> queue;
        private final String name;

        Getter(Queue<Integer> queue, String name) {
            this.queue = queue;
            this.name = name;
        }

        @Override
        public void run() {
            int i = 0;
            while (i < TEST_INT) {
                synchronized (Getter.class) {
                    if (!queue.isEmpty()) {
                        queue.poll();
                        i++;
                    }
                }
            }
            System.out.println(name + " is over");
        }
    }
}
```

```
输入1，结果如下：

Using LinkedList
…
Time span = 16613
queue size = 10296577
输入2，结果如下：

Using LinkedBlockingQueue
…
Time span = 16847
queue size = 0
输入3，结果如下：

Using ArrayBlockingQueue
…
Time span = 6815
queue size = 0
输入4，结果如下：

Using ConcurrentLinkedQueue
…
Time span = 22802
queue size = 0
```
分析运行的结果，有如下结论： 
第一，非并发类例如LinkedList在多线程环境下运行是会出错的，结果的最后一行输出了队列的size值，只有它的size值不等于0，这说明在多线程运行时许多poll操作并没有弹出元素，甚至很多offer操作也没有能够正确插入元素。其他三种并发类都能够在多线程环境下正确运行； 
第二，并发类也不是完全不需要注意加锁，例如这一段代码：

```
while (i < TEST_INT) {
    synchronized (Getter.class) {
        if (!queue.isEmpty()) {
            queue.poll();
            i++;
        }
    }
}
```
如果不加锁，那么isEmpty和poll之间有可能被其他线程打断，造成结果的不确定性。 
第三，本例中LinkedBlockingQueue和ArrayBlockingQueue并没有因为生产-消费关系阻塞，因为容量设置得足够大。它们的元素插入和弹出操作是加锁的，而ConcurrentLinkedQueue的元素插入和弹出操作是不加锁的，而观察性能其实并没有数量级上的差异（有待进一步测试）。 
第四，ArrayBlockingQueue性能明显好于LinkedBlockingQueue，甚至也好于ConcurrentLinkedQueue，这是因为它的内部存储结构是原生数组，而其他两个是链表，需要new一个Node。同时，链表也会造成更多的GC。
###  ConcurrentLinkedDeque并发链接双向队列
ConcurrentLinkedDeque与ConcurrentLinkedQueue非常类似，不同之处仅在于它是一个双向队列。

##3 **阻塞队列的实现原理**

> Java的并发队列，具体包括BlockingQueue阻塞队列、BlockingDeque阻塞双向队列、TransferQueue传输队列、ConcurrentLinkedQueue并发链接队列和ConcurrentLinkedDeque并发链接双向队列。BlockingQueue和BlockingDeque的内部使用锁来保护元素的插入弹出操作，同时它们还提供了生产者-消费者场景的阻塞方法；TransferQueue被用来在多个线程之间优雅的传递对象；ConcurrentLinkedQueue和ConcurrentLinkedDeque依靠CAS指令，来实现非阻塞的并发算法。


若队列为空，消费者会一直等待，当生产者添加元素时，消费者是如何知道当前队列有元素的呢？让我们看看JDK是如何实现的。
***使用通知模式实现***。所谓通知模式，就是当生产者往满的队列里添加元素时会阻塞住生产者，当消费者消费了一个队列中的元素后，会通知生产者当前队列可用。通过查看源码发现ArrayBlockingQueue使用了Condition来实现，代码如下。

```
    private final Condition notFull;
    private final Condition notEmpty;
    
    public ArrayBlockingQueue(int capacity, boolean fair) {
        // 省略其他代码
        notEmpty = lock.newCondition();
        notFull = lock.newCondition();

    public void put(E e) throws InterruptedException {
        checkNotNull(e);
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
            while (count == items.length)
                notFull.await();
            enqueue(e);
        } finally {
            lock.unlock();
        }
    }
    
    public E take() throws InterruptedException {
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
            while (count == 0)
                notEmpty.await();
            return dequeue();
        } finally {
            lock.unlock();
        }
    }
    
     private void enqueue(E x) {
        // assert lock.getHoldCount() == 1;
        // assert items[putIndex] == null;
        final Object[] items = this.items;
        items[putIndex] = x;
        if (++putIndex == items.length)
            putIndex = 0;
        count++;
        notEmpty.signal();
    }

```
当往队列里插入一个元素时，如果队列不可用，那么阻塞生产者主要通过
LockSupport.park（this）来实现。

```
    public final void await() throws InterruptedException {
        if (Thread.interrupted())
            throw new InterruptedException();
        Node node = addConditionWaiter();
        int savedState = fullyRelease(node);
        int interruptMode = 0;
        while (!isOnSyncQueue(node)) {
            LockSupport.park(this);
            if ((interruptMode = checkInterruptWhileWaiting(node)) != 0)
                break;
        }
        if (acquireQueued(node, savedState) && interruptMode != THROW_IE)
            interruptMode = REINTERRUPT;
        if (node.nextWaiter != null) // clean up if cancelled
            unlinkCancelledWaiters();
        if (interruptMode != 0)
            reportInterruptAfterWait(interruptMode);
    }
```

继续进入源码，发现调用setBlocker先保存一下将要阻塞的线程，然后调用unsafe.park阻塞当前线程。

```
 public static void park(Object blocker) {
        Thread t = Thread.currentThread();
        setBlocker(t, blocker);
        unsafe.park(false, 0L);
        setBlocker(t, null);
    }
```
unsafe.park是个native方法，代码如下。

```
public native void park(boolean isAbsolute, long time);
```
park这个方法会阻塞当前线程，只有以下4种情况中的一种发生时，该方法才会返回。

 - 与park对应的unpark执行或已经执行时。“已经执行”是指unpark先执行，然后再执行park的情况。
 - 线程被中断时。
 - 等待完time参数指定的毫秒数时。
 - 异常现象发生时，这个异常现象没有任何原因。
