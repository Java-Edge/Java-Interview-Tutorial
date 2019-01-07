线程可以充分发挥系统的处理能力，提高资源利用率。同时现有的线程可以提升系统响应性。

但是在安全性与极限性能上，我们首先需要保证的是安全性。

### [](#111-%E5%AF%B9%E6%80%A7%E8%83%BD%E7%9A%84%E6%80%9D%E8%80%83)11.1 对性能的思考

提升性能=用更少的资源做更多的事情（太对了，这才是问题的本质）。

资源包括：CPU时钟周期，内存，网络带宽，I/O带宽，数据请求，磁盘空间等。

资源密集型说的就是对上述维度敏感的应用。

与单线程相比，多线程总会一起一些额外的性能开销：

*   线程协调with coordinating between threads (locking, signaling, and memory synchronization)
*   上下文切换increased context switching
*   线程创建和销毁thread creation and teardown
*   线程调度scheduling overhead

可伸缩性是指：增加资源，程序的吞吐可以成比例的增加。

性能的提高往往是一个权衡的过程，需要考虑诸多因素。

### [](#112-amdahl%E5%AE%9A%E5%BE%8B-amdahls-law)11.2 Amdahl定律 Amdahl's Law

收割可以靠并行提高性能，而作物生长则不行。这是一个很简单的自然界的问题，在计算机界也存在，需要对问题进行合理的分解，发现潜在的并行能力。

Amdahl定律：[并行计算](https://zh.wikipedia.org/wiki/%E5%B9%B6%E8%A1%8C%E8%AE%A1%E7%AE%97)中的**加速比**是用并行前的执行速度和并行后的执行速度之比来表示的，它表示了在并行化之后的效率提升情况。

speedup <= 1 / F + (1 - F) /N

F表示被串行化的部分，N表示处理器数量。

如果N无穷大，那么最大的加速比例是1/F。理论上如果50%是串行的，那么最大的加速比只能是2。如果10%串行。那么最大加速比接近10，如果N=10也就是说有10个处理器资源，那么最高的加速比是5.4，在100个处理器的情况下是9.2。

但是任何程序都存在串行部分，例如从队列中take数据，访问数据库的操作等，这是绝对的。

书中举了一个例子是Synchronized linkedlist和ConcurrentLinkedQueue的吞吐率对比，在处理器数量到达上限后，他们的吞吐都基本是一条持平的线，但是Synchronized linkedlist吞吐率更低，在处理器较少的情况下就到达了极限，这主要受context switch的限制。

### [](#113-%E7%BA%BF%E7%A8%8B%E5%BC%95%E5%85%A5%E7%9A%84%E5%BC%80%E9%94%80)11.3 线程引入的开销

单线程不存在线程调度，也不存在同步开销，不需要使用锁来保证安全一致性。而多线程这些都需要考虑。

#### [](#1131-%E4%B8%8A%E4%B8%8B%E6%96%87%E5%88%87%E6%8D%A2)11.3.1 上下文切换

操作系统的设计者巧妙地利用了时间片轮转的方式, CPU给每个任务都服务一定的时间, 然后把当前任务的状态保存下来, 在加载下一任务的状态后, 继续服务下一任务. 如果可运行的线程数大于CPU数量，那么OS会最终将某个正在运行的线程调度出来，从而让其他线程能够使用CPU，这会导致一次上下文切换，主要包括当前线程“保存现场”，并且新调度出来的线程需要“恢复现场“。这里的context switch直接消耗包括: CPU寄存器需要保存和加载, 系统调度器的代码需要执行, TLB实例需要重新加载, CPU 的pipeline需要刷掉; 间接消耗指的是多核的cache之间得共享数据, 间接消耗对于程序的影响要看线程工作区操作数据的大小). 

JVM和OS消耗的CPU时钟周期越少，那么APP可用的CPU时钟周期就越多。

往往OS有一个最小的执行时间，防止过于频繁的上下文切换。

JVM会因为阻塞比如锁、阻塞I/O而挂起线程，如果频繁的阻塞，就会无法使用完整的调度时间片。//?

如果可运行的线程数大于CPU的内核数，那么OS会根据一定的调度算法，强行切换正在运行的线程，从而使其它线程能够使用CPU周期。

切换线程会导致上下文切换。线程的调度会导致CPU需要在操作系统和进程间花费更多的时间片段，这样真正执行应用程序的时间就减少了。另外上下文切换也会导致缓存的频繁进出，对于一个刚被切换的线程来说，可能由于高速缓冲中没有数据而变得更慢，从而导致更多的IO开销。

`vmstat` 命令可以看cs这一个字段看上下文切换的数据。

#### [](#1132-%E5%86%85%E5%AD%98%E5%90%8C%E6%AD%A5)11.3.2 内存同步

同步的性能开销包括多个方面。在synchronized和volatile提供的可见性保证中会使用一些特殊指令，即内存栅栏（memory barrier），内存栅栏可以刷新缓存，满足可见性，但是它也会抑制一些编译器优化，例如不能指令重排序。

现代的JVM对于无竞争的synchronized的消耗非常小，基本微乎其微。

同时现代的JVM编译优化做的非常成熟，一些不必要的同步开销往往可以优化掉。例如，下面的代码会去掉锁获取。

```
synchronized (new Object()) {
 // do something
} 

```

还有一些比如escape analysis会找出不会发布到堆上的本地对象，锁的获取和释放会被优化为最小的次数甚至去掉。例如下面的操作。

```
public String getStoogeNames() {
 List<String> stooges = new Vector<String>();
 stooges.add("Moe");
 stooges.add("Larry");
 stooges.add("Curly");
 return stooges.toString();
} 

```

当然即使不escape，也会有lock coarsening过程，将临近的同步代码块使用同一个锁合并起来。这都减少了同步的开销。

所以不必过度担心非竞争同步带来的开销，这个基本的机制已经非常的快了，而且JVM还有能进行额外的优化以进一步降低或者消除开销的本领。

不同线程间要进行数据同步，synchronized以及volatile提供的可见性都会导致缓存失效。线程栈之间的数据要和主存进行同步，这些同步有一些小小的开销。如果线程间同时要进行数据同步，那么这些同步的线程可能都会受阻。

#### [](#1133-%E9%98%BB%E5%A1%9E)11.3.3 阻塞

竞争的同步需要OS介入，从而增加了开销。当在锁上发生竞争时，失败者线程会被阻塞，JVM在实现发现阻塞的行为时，可以采用

*   自旋等待 spin-waiting
*   或者OS挂起被阻塞的线程

这两种的效率高低取决于上下文切换的开销以及成功获取锁之前的等待时间，如果等待时间较短，则spin-waiting，如果较长则挂起。

一个线程被阻塞会产生上下文切换的影响，但是它到底何时执行这是由OS决定的，靠时间分片机制，这个调度的策略是OS解决的，而JVM的scheduler解决的是阻塞释放锁之后哪个线程需要被select出来执行，也就是转到runnable状态。

There is no single Java Virtual Machine; JVM is a specification, and there are multiple implementations of it, including the OpenJDK version and the Sun version of it, among others. I don't know for certain, but I would guess that any reasonable JVM would simply use the underlying threading mechanism provided by the OS, which would imply POSIX Threads (pthreads) on UNIX (Mac OS X, Linux, etc.) and would imply WIN32 threads on Windows. Typically, those systems use a round-robin strategy by default. Many types of algorithms exist like **preemptive** and **time slicing**with **round robin** etc. 

The JVM is based on **preemptive and priority based** scheduling algorithm to select thread to run.

每个Java线程一对一映射到Solaris平台上的一个本地线程上，并将线程调度交由本地线程的调度程序。由于Java线程是与本地线程是一对一地绑在一起的，所以改变Java线程的优先权也不会有可靠地运行结果。

对于类Unix系统而言，一般都是进程作为任务的调度单位，也即是操作系统调度器，只会针对进程来分配CPU等资源。由于进程彼此独立，相互不可进行直接访问，这增加了应用的通信成本。所以后面有了微进程，微进程与进程不同的是，允许一定程度上，彼此可以直接进行访问，详细可参考[LinuxThreads](http://en.wikipedia.org/wiki/LinuxThreads)。JVM在一些类Unix平台下，就是将线程映射到操作系统的微进程，来实现线程调度。这样多线程能够直接被系统调度器进行调度，与此对应的就是其线程的创建和销毁的成本就比较高，而且JVM的线程优先级很难进行匹配，无法提供确切的保证，仅仅是个hint。

当发生锁竞争时，失败的线程会导致阻塞。通常阻塞的线程可能在JVM内部进行自旋等待，或者被操作系统挂起。自旋等待可能会导致更多的CPU切片浪费，而操作系统挂起则会导致更多的上下文切换。

### [](#114-%E5%87%8F%E5%B0%91%E9%94%81%E7%9A%84%E7%AB%9E%E4%BA%89)11.4 减少锁的竞争

减少锁的竞争能够提高性能和可伸缩性。

在并发程序中，对可伸缩性的最主要的威胁就是独占方式的资源锁。

有三种方式可以减低锁的竞争程度：

*   减少锁的持有时间
*   降低锁的请求频率
*   使用带有协调机制的独占锁，这些机器允许更好的并发性。//?

#### [](#1141-%E7%BC%A9%E5%B0%8F%E9%94%81%E7%9A%84%E8%8C%83%E5%9B%B4%E5%BF%AB%E8%BF%9B%E5%BF%AB%E5%87%BA)11.4.1 缩小锁的范围（快进快出）

原理就是Amdah定律，串行的代码总量减少了。

#### [](#1142-%E5%87%8F%E5%B0%8F%E9%94%81%E7%9A%84%E7%B2%92%E5%BA%A6)11.4.2 减小锁的粒度

这种方式就是降低线程请求锁的频率，通过锁分解来实现。

下面的应用明显锁的粒度太粗了。

```
public class ServerStatusBeforeSplit {
    @GuardedBy("this") public final Set<String> users;
    @GuardedBy("this") public final Set<String> queries;

    public ServerStatusBeforeSplit() {
        users = new HashSet<String>();
        queries = new HashSet<String>();
    }

    public synchronized void addUser(String u) {
        users.add(u);
    }

    public synchronized void addQuery(String q) {
        queries.add(q);
    }

    public synchronized void removeUser(String u) {
        users.remove(u);
    }

    public synchronized void removeQuery(String q) {
        queries.remove(q);
    }
}

```

锁分解就是独立的变量独立分配锁，不适用全局锁。优化后如下：

```
public class ServerStatusAfterSplit {
    @GuardedBy("users") public final Set<String> users;
    @GuardedBy("queries") public final Set<String> queries;

    public ServerStatusAfterSplit() {
        users = new HashSet<String>();
        queries = new HashSet<String>();
    }

    public void addUser(String u) {
        synchronized (users) {
            users.add(u);
        }
    }

    public void addQuery(String q) {
        synchronized (queries) {
            queries.add(q);
        }
    }

    public void removeUser(String u) {
        synchronized (users) {
            users.remove(u);
        }
    }

    public void removeQuery(String q) {
        synchronized (users) {
            queries.remove(q);
        }
    }
}

```

#### [](#1143-%E9%94%81%E5%88%86%E6%AE%B5)11.4.3 锁分段

最典型的例子就是ConcurrentHashMap。

```
public class StripedMap {
    // Synchronization policy: buckets[n] guarded by locks[n%N_LOCKS]
    private static final int N_LOCKS = 16;
    private final Node[] buckets;
    private final Object[] locks;

    private static class Node {
        Node next;
        Object key;
        Object value;
    }

    public StripedMap(int numBuckets) {
        buckets = new Node[numBuckets];
        locks = new Object[N_LOCKS];
        for (int i = 0; i < N_LOCKS; i++)
            locks[i] = new Object();
    }

    private final int hash(Object key) {
        return Math.abs(key.hashCode() % buckets.length);
    }

    public Object get(Object key) {
        int hash = hash(key);
        synchronized (locks[hash % N_LOCKS]) {
            for (Node m = buckets[hash]; m != null; m = m.next)
                if (m.key.equals(key))
                    return m.value;
        }
        return null;
    }

    public void clear() {
        for (int i = 0; i < buckets.length; i++) {
            synchronized (locks[i % N_LOCKS]) {
                buckets[i] = null;
            }
        }
    }
}

```

#### [](#1144-%E9%81%BF%E5%85%8D%E7%83%AD%E7%82%B9%E5%9F%9Fhot-field)11.4.4 避免热点域hot field

比如HashMap的size方法，ConcurrentHashMap采用了牺牲size的准确性的策略。

#### [](#1145-%E4%B8%80%E4%BA%9B%E6%9B%BF%E4%BB%A3%E7%8B%AC%E5%8D%A0%E9%94%81%E7%9A%84%E6%96%B9%E6%B3%95)11.4.5 一些替代独占锁的方法

ReadWriteLock，AtomicInteger，UNSAFE.compareAndSwap(..)

#### [](#1146-%E7%9B%91%E6%B5%8Bcpu%E7%9A%84%E5%88%A9%E7%94%A8%E7%8E%87)11.4.6 监测CPU的利用率

vmstat，kill -3 pid

”waiting to lock monitor…“有这句就证明竞争太激烈了。

### [](#115-%E7%A4%BA%E4%BE%8B%E6%AF%94%E8%BE%83map%E7%9A%84%E6%80%A7%E8%83%BD)11.5 示例：比较Map的性能

比较了ConcurrentHashMap和synchronized hashmap的性能对比。

串行访问Map一个锁 pk 多个线程能并发的访问Map通过分段锁。

竞争非常激烈的时候，synchronized hashmap伸缩性非常差，吞吐量不会随着线程数增加而增加，反而降低，因为每个操作消耗的时间大部分都用于上下文切换和调度延迟上了。

### [](#116-%E5%87%8F%E5%B0%91%E4%B8%8A%E4%B8%8B%E6%96%87%E5%88%87%E6%8D%A2%E7%9A%84%E5%BC%80%E9%94%80)11.6 减少上下文切换的开销

举个例子，就是APP记录日志，例如写日志到本地或者远程RPC，直接记录会存在I/O阻塞，靠一个轻量级的queue来解耦，使得APP不感知影响，减少阻塞。

[http://www.artima.com/insidejvm/ed2/threadsynch.html](http://www.artima.com/insidejvm/ed2/threadsynch.html) //TODO

### [](#%E6%80%BB%E7%BB%93)总结

了解了性能的提升的几个方面，也了解性能的开销后，应用程序就要根据实际的场景进行取舍和评估。没有一劳永逸的优化方案，不断的进行小范围改进和调整是提高性能的有效手段。当前一些大的架构调整也会导致较大的性能的提升。

性能提升考虑的方面：

*   系统平台的资源利用率

一个程序对系统平台的资源利用率是指某一个设备繁忙且服务于此程序的时间占所有时间的比率。从物理学的角度讲类似于有用功的比率。简单的说就是：资源利用率=有效繁忙时间/总耗费时间。

也就说尽可能的让设备做有用的功，同时榨取其最大值。无用的循环可能会导致CPU 100%的使用率，但不一定是有效的工作。有效性通常难以衡量，通常只能以主观来评估，或者通过被优化的程序的行为来判断是否提高了有效性。

*   延迟

延迟描述的是完成任务所耗费的时间。延迟有时候也成为响应时间。如果有多个并行的操作，那么延迟取决于耗费时间最大的任务。

*   多处理

多处理是指在单一系统上同时执行多个进程或者多个程序的能力。多处理能力的好处是可以提高吞吐量。多处理可以有效利用多核CPU的资源。

*   多线程

多线程描述的是同一个地址空间内同时执行多个线程的过程。这些线程都有不同的执行路径和不同的栈结构。我们说的并发性更多的是指针对线程。

*   并发性

同时执行多个程序或者任务称之为并发。单程序内的多任务处理或者多程序间的多任务处理都认为是并发。

*   吞吐量

吞吐量衡量系统在单位之间内可以完成的工作总量。对于硬件系统而言，吞吐量是物理介质的上限。在没有达到物理介质之前，提高系统的吞吐量也可以大幅度改进性能。同时吞吐量也是衡量性能的一个指标。

*   瓶颈

程序运行过程中性能最差的地方。通常而言，串行的IO、磁盘IO、内存单元分配、网络IO等都可能造成瓶颈。某些使用太频繁的算法也有可能成为瓶颈。

*   可扩展性

这里的可扩展性主要是指程序或系统通过增加可使用的资源而增加性能的能力。
