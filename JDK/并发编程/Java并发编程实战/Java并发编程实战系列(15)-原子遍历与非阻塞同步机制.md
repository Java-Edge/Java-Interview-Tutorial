非阻塞算法，用底层的原子机器指令代替锁，确保数据在并发访问中的一致性。
非阻塞算法被广泛应用于OS和JVM中实现线程/进程调度机制和GC及锁，并发数据结构中。

与锁相比，非阻塞算法复杂的多，在可伸缩性和活跃性上（避免死锁）有巨大优势。
非阻塞算法，即多个线程竞争相同的数据时不会发生阻塞，因此能更细粒度的层次上进行协调，而且极大减少调度开销。
# 1 锁的劣势
独占，可见性是锁要保证的。

许多JVM都对非竞争的锁获取和释放做了很多优化，性能很不错。
但若一些线程被挂起然后稍后恢复运行，当线程恢复后还得等待其他线程执行完他们的时间片，才能被调度，所以挂起和恢复线程存在很大开销。
其实很多锁的粒度很小，很简单，若锁上存在激烈竞争，那么 调度开销/工作开销 比值就会非常高，降低业务吞吐量。

而与锁相比，volatile是一种更轻量的同步机制，因为使用volatile不会发生上下文切换或线程调度操作，但volatile的指明问题就是虽然保证了可见性，但是原子性无法保证。

- 若一个线程正在等待锁，它不能做任何事情
- 若一个线程在持有锁情况下被延迟执行了，如发生缺页错误，调度延迟，就没法执行
- 若被阻塞的线程优先级较高，就会出现priority invesion问题，被永久阻塞
# 2  硬件对并发的支持
独占锁是悲观锁，对细粒度的操作，更高效的应用是乐观锁，这种方法需要借助**冲突监测机制，来判断更新过程中是否存在来自其他线程的干扰，若存在，则失败重试**。

几乎所有现代CPU都有某种形式的原子读-改-写指令，如compare-and-swap等，JVM就是使用这些指令来实现无锁并发。
## 2.1 比较并交换
CAS（Compare and set）乐观的技术。Java实现的一个compare and set如下，这是一个模拟底层的示例：
```java
@ThreadSafe
public class SimulatedCAS {

    @GuardedBy("this") private int value;

    public synchronized int get() {
        return value;
    }

    public synchronized int compareAndSwap(int expectedValue,
                                           int newValue) {
        int oldValue = value;
        if (oldValue == expectedValue)
            value = newValue;
        return oldValue;
    }

    public synchronized boolean compareAndSet(int expectedValue,
                                              int newValue) {
        return (expectedValue
                == compareAndSwap(expectedValue, newValue));
    }
}
```
## 2.2 非阻塞的计数器
```java
public class CasCounter {
    private SimulatedCAS value;

    public int getValue() {
        return value.get();
    }

    public int increment() {
        int v;
        do {
            v = value.get();
        } while (v != value.compareAndSwap(v, v + 1));
        return v + 1;
    }
}
```
Java中使用AtomicInteger。

竞争激烈一般时，CAS性能远超基于锁的计数器。看起来他的指令更多，但无需上下文切换和线程挂起，JVM内部的代码路径实际很长，所以反而好些。

但激烈程度较高时，开销还是较大，但会发生这种激烈程度非常高的情况只是理论，实际生产环境很难遇到。况且JIT很聪明，这种操作往往能非常大的优化。

为确保正常更新，可能得将CAS操作放到for循环，从语法结构看，使用**CAS**比使用锁更加复杂，得考虑失败情况（锁会挂起线程，直到恢复）。
但基于**CAS**的原子操作，性能基本超过基于锁的计数器，即使只有很小的竞争或不存在竞争！

在轻度到中度争用情况下，非阻塞算法的性能会超越阻塞算法，因为 CAS 的多数时间都在第一次尝试时就成功，而发生争用时的开销也不涉及**线程挂起**和**上下文切换**，只多了几个循环迭代。
没有争用的 CAS 要比没有争用的锁轻量得多（因为没有争用的锁涉及 CAS 加上额外的处理，加锁至少需要一个CAS，在有竞争的情况下，需要操作队列，线程挂起，上下文切换），而争用的 CAS 比争用的锁获取涉及更短的延迟。

CAS的缺点是，它使用调用者来处理竞争问题，通过重试、回退、放弃，而锁能自动处理竞争问题，例如阻塞。

原子变量可看做更好的volatile类型变量。AtomicInteger在JDK8里面做了改动。
![](https://img-blog.csdnimg.cn/0f94ab5e4b6045e5aa83d99cbc9c03c4.png)
JDK7里面的实现如下：
![](https://img-blog.csdnimg.cn/d2f94066894a4501b6dd5e6d9ad4a8c1.png)
Unsafe是经过特殊处理的，不能理解成常规的Java代码，1.8在调用getAndAddInt时，若系统底层：
- 支持fetch-and-add，则执行的就是native方法，使用fetch-and-add
- 不支持，就按照上面getAndAddInt那样，以Java代码方式执行，使用compare-and-swap

这也正好跟openjdk8中Unsafe::getAndAddInt上方的注释相吻合：
以下包含在不支持本机指令的平台上使用的基于 CAS 的 Java 实现
![](https://img-blog.csdnimg.cn/327bda8392cf4158ab94049e67f9b169.png)
# 3 原子变量类
J.U.C的AtomicXXX。

例如一个AtomictReference的使用如下：
```java
public class CasNumberRange {
    @Immutable
            private static class IntPair {
        // INVARIANT: lower <= upper
        final int lower;
        final int upper;

        public IntPair(int lower, int upper) {
            this.lower = lower;
            this.upper = upper;
        }
    }

    private final AtomicReference<IntPair> values =
            new AtomicReference<IntPair>(new IntPair(0, 0));

    public int getLower() {
        return values.get().lower;
    }

    public int getUpper() {
        return values.get().upper;
    }

    public void setLower(int i) {
        while (true) {
            IntPair oldv = values.get();
            if (i > oldv.upper)
                throw new IllegalArgumentException("Can't set lower to " + i + " > upper");
            IntPair newv = new IntPair(i, oldv.upper);
            if (values.compareAndSet(oldv, newv))
                return;
        }
    }

    public void setUpper(int i) {
        while (true) {
            IntPair oldv = values.get();
            if (i < oldv.lower)
                throw new IllegalArgumentException("Can't set upper to " + i + " < lower");
            IntPair newv = new IntPair(oldv.lower, i);
            if (values.compareAndSet(oldv, newv))
                return;
        }
    }
}
```
# 4 非阻塞算法
Lock-free算法，可以实现栈、队列、优先队列或者散列表。
## 4.1 非阻塞的栈
Trebier算法，1986年提出。
```java
 public class ConcurrentStack <E> {
    AtomicReference<Node<E>> top = new AtomicReference<Node<E>>();

    public void push(E item) {
        Node<E> newHead = new Node<E>(item);
        Node<E> oldHead;
        do {
            oldHead = top.get();
            newHead.next = oldHead;
        } while (!top.compareAndSet(oldHead, newHead));
    }

    public E pop() {
        Node<E> oldHead;
        Node<E> newHead;
        do {
            oldHead = top.get();
            if (oldHead == null)
                return null;
            newHead = oldHead.next;
        } while (!top.compareAndSet(oldHead, newHead));
        return oldHead.item;
    }

    private static class Node <E> {
        public final E item;
        public Node<E> next;

        public Node(E item) {
            this.item = item;
        }
    }
}
```
## 4.2 非阻塞的链表
J.U.C的ConcurrentLinkedQueue也是参考这个由Michael and Scott，1996年实现的算法。
```java
public class LinkedQueue <E> {

    private static class Node <E> {
        final E item;
        final AtomicReference<LinkedQueue.Node<E>> next;

        public Node(E item, LinkedQueue.Node<E> next) {
            this.item = item;
            this.next = new AtomicReference<LinkedQueue.Node<E>>(next);
        }
    }

    private final LinkedQueue.Node<E> dummy = new LinkedQueue.Node<E>(null, null);
    private final AtomicReference<LinkedQueue.Node<E>> head
            = new AtomicReference<LinkedQueue.Node<E>>(dummy);
    private final AtomicReference<LinkedQueue.Node<E>> tail
            = new AtomicReference<LinkedQueue.Node<E>>(dummy);

    public boolean put(E item) {
        LinkedQueue.Node<E> newNode = new LinkedQueue.Node<E>(item, null);
        while (true) {
            LinkedQueue.Node<E> curTail = tail.get();
            LinkedQueue.Node<E> tailNext = curTail.next.get();
            if (curTail == tail.get()) {
                if (tailNext != null) {
                    // Queue in intermediate state, advance tail
                    tail.compareAndSet(curTail, tailNext);
                } else {
                    // In quiescent state, try inserting new node
                    if (curTail.next.compareAndSet(null, newNode)) {
                        // Insertion succeeded, try advancing tail
                        tail.compareAndSet(curTail, newNode);
                        return true;
                    }
                }
            }
        }
    }
}
```
## 4.3 原子域更新
AtomicReferenceFieldUpdater，一个基于反射的工具类，能对指定类的指定的volatile引用字段进行原子更新。(该字段不能是private的) 

通过调用AtomicReferenceFieldUpdater的静态方法newUpdater就能创建它的实例，该方法要接收三个参数： 
*   包含该字段的对象的类 
*   将被更新的对象的类 
*   将被更新的字段的名称 
```java
AtomicReferenceFieldUpdater updater=AtomicReferenceFieldUpdater.newUpdater(Dog.class,String.class,"name");  
        Dog dog1=new Dog();  
        updater.compareAndSet(dog1,dog1.name,"test") ;  
        System.out.println(dog1.name);  

class Dog  {  
     volatile  String name="dog1";  
}  
```