# 1 为什么要使用ConcurrentHashMap(全靠同行衬托)
## 1.1 HashMap : 线程不安全!
最常用的Map类，性能好、速度快，但不能保证线程安全！

在多线程环境下,使用HashMap进行put操作会引起死循环！因为多线程会导致HashMap的Entry链表成环,一旦成环,Entry的next节点永远不为空！

## 1.2 HashTable : 效率低下!
百分百线程安全的Map类，对外方法全部使用synchronize修饰

这意味着在多线程下，每个线程操作都会锁住整个map，操作完成后才释放锁。这会导致竞争愈发的激烈，效率自然很低！

## 是时候表演高端操作 : 锁分段, 可有效提升并发访问率
HashTable在竞争激烈的并发环境下表现出效率低下的原因是所有访问HashTable的线程都必须竞争同一把锁
假如容器里有多把锁,每一把锁用于锁容器其中一部分的数据,那么当多线程访问容器里不同数据段的数据时,线程间就不会存在锁竞争,从而可以有效提高并发访问效率,这就是ConcurrentHashMap所使用的锁分段技术
   - 首先将数据分成一段一段地存储
   - 然后给每一段数据配一把锁
   - 当一个线程占用锁访问其中一个段数据的时候,其他段的数据也能被其他线程访问

# 2 ConcurrentHashMap的结构
通过ConcurrentHashMap的类图来分析ConcurrentHashMap的结构
ConcurrentHashMap 以下简称 CHM
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtZTAxNjJkZWQ2NGY5MjU0Zg)
由Segment数组和HashEntry数组组成.

Segment是一种可重入锁,在CHM里扮演锁的角色;
HashEntry则用于存储键值对数据.

一个CHM里包含一个Segment数组.
Segment的结构和HashMap类似,是一种数组和链表结构.

一个Segment元素里包含一个HashEntry数组
每个HashEntry是一个链表结构的元素
每个Segment守护着一个HashEntry数组里的元素,当对HashEntry数组的数据进行修改时,
必须首先获得与它对应的Segment锁

![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtOGRkNTJjY2Q3NWZhN2RlMQ)

# 3 ConcurrentHashMap的初始化
## 3.1 Segment详解
###  Segment的索引与读取
ConcurrentHashMap类中包含三个与Segment相关的成员变量：

```java
/**
 * Mask value for indexing into segments. The upper bits of a
 * key's hash code are used to choose the segment.
 */ final int segmentMask;

/**
 * Shift value for indexing within segments.
 */ final int segmentShift;

/**
 * The segments, each of which is a specialized hash table.
 */ final Segment<K,V>[] segments;
```

其中segments是Segment的原生数组，此数组的长度可以在CHM的构造函数中使用并发度参数指定，默认值为
DEFAULT_CONCURRENCY_LEVEL=16

- segmentShift : 计算segments数组索引的位移量
- segmentMask : 计算索引的掩码值

例如并发度为16时（即segments数组长度为16），segmentShift为32-4=28（因为2的4次幂为16），而segmentMask则为1111（二进制），索引的计算式如下：
```java
int j = (hash >>> segmentShift) & segmentMask;
```

### 多线程访问共享变量的解决方案
为保证数据的正确，可以采用以下方法
|  方案| 性能 |性质 |
|--|--|--|
| 加锁 |最低  | 能保证原子性、可见性，防止指令重排
|volatile | 中等 | 保证可见性，防止指令重排
|getObjectVolatile | 最好 |防止指令重排

因此ConcurrentHashMap选择了使用Unsafe的getObjectVolatile来读取segments中的元素，相关代码如下

```java
// Unsafe mechanics private static final sun.misc.Unsafe UNSAFE;
private static final long SBASE;
private static final int SSHIFT;
private static final long TBASE;
private static final int TSHIFT;
private static final long HASHSEED_OFFSET;
private static final long SEGSHIFT_OFFSET;
private static final long SEGMASK_OFFSET;
private static final long SEGMENTS_OFFSET;

static {
    int ss, ts;
    try {
        UNSAFE = sun.misc.Unsafe.getUnsafe();
        Class tc = HashEntry[].class;
        Class sc = Segment[].class;
        TBASE = UNSAFE.arrayBaseOffset(tc);
        SBASE = UNSAFE.arrayBaseOffset(sc);
        ts = UNSAFE.arrayIndexScale(tc);
        ss = UNSAFE.arrayIndexScale(sc);
        HASHSEED_OFFSET = UNSAFE.objectFieldOffset(
            ConcurrentHashMap.class.getDeclaredField("hashSeed"));
        SEGSHIFT_OFFSET = UNSAFE.objectFieldOffset(
            ConcurrentHashMap.class.getDeclaredField("segmentShift"));
        SEGMASK_OFFSET = UNSAFE.objectFieldOffset(
            ConcurrentHashMap.class.getDeclaredField("segmentMask"));
        SEGMENTS_OFFSET = UNSAFE.objectFieldOffset(
            ConcurrentHashMap.class.getDeclaredField("segments"));
    } catch (Exception e) {
        throw new Error(e);
    }
    if ((ss & (ss-1)) != 0 || (ts & (ts-1)) != 0)
        throw new Error("data type scale not a power of two");
    SSHIFT = 31 - Integer.numberOfLeadingZeros(ss);
    TSHIFT = 31 - Integer.numberOfLeadingZeros(ts);
}


private Segment<K,V> segmentForHash(int h) {
    long u = (((h >>> segmentShift) & segmentMask) << SSHIFT) + SBASE;
    return (Segment<K,V>) UNSAFE.getObjectVolatile(segments, u);
}
```

观察segmentForHash(int h)方法可知
- 首先使用`(h >>> segmentShift) & segmentMask`
计算出该h对应的segments索引值（假设为x）
- 然后使用索引值`(x<<SSHIFT) + SBASE`计算出segments中相应Segment的地址
- 最后使用`UNSAFE.getObjectVolatile(segments,u)`取出相应的Segment，并保持volatile读的效果
### Segment的锁
Segment继承了ReentrantLock，因此它实际上是一把锁。在进行put、remove、replace、clear等更新操作，需加锁

```
final V put(K key, int hash, V value, boolean onlyIfAbsent) {
    HashEntry<K,V> node = tryLock() ? null :
        scanAndLockForPut(key, hash, value);
    V oldValue;
    try {
//实际代码……
        }
    } finally {
        unlock();
    }
    return oldValue;
}
```
首先调用tryLock，如果加锁失败，则进入`scanAndLockForPut(key, hash, value)`
该方法实际上是先自旋等待其他线程解锁，直至指定的次数`MAX_SCAN_RETRIES`
若自旋过程中，其他线程释放了锁，导致本线程直接获得了锁，就避免了本线程进入等待锁的场景，提高了效率
若自旋一定次数后，仍未获取锁，则调用lock方法进入等待锁的场景

采用这种自旋锁和独占锁结合的方法，在很多场景下能够提高Segment并发操作数据的效率。




初始化方法是通过initialCapacity、loadFactor和concurrencyLevel等几个
参数来初始化segment数组、段偏移量segmentShift、段掩码segmentMask和每个segment里的HashEntry数组来实现的.

 -  初始化segments数组
 

```
	   if (concurrencyLevel > MAX_SEGMENTS)
	        concurrencyLevel = MAX_SEGMENTS;
	        int sshift = 0;
	        int ssize = 1;
	        while (ssize < concurrencyLevel) {
	            ++sshift;
	            ssize <<= 1;
	   }
       segmentShift = 32 - sshift;
       segmentMask = ssize - 1;
       this.segments = Segment.newArray(ssize);
```
segments数组的长度`ssize`是通过`concurrencyLevel`计算得出的
为了能通过按位与的散列算法来定位segments数组的索引,必须保证segments数组的长度是2的N次方,所以必须计算出一个大于或等于concurrencyLevel的最小的2的N次方值来作为segments数组的长度

> concurrencyLevel的最大值是65535,这意味着segments数组的长度最大为65536,对应的二进制是16位

- 初始化segmentShift和segmentMask
这两个全局变量需要在定位segment时的散列算法里使用
sshift等于ssize从1向左移位的次数,默认concurrencyLevel等于16,1需要向左移位移动4次,所以sshift为4.
   - segmentShift用于定位参与散列运算的位数,segmentShift等于32减sshift,所以等于28,这里之所以用32是因为ConcurrentHashMap里的hash()方法输出的最大数是32位,后面的测试中我们可以看到这点
   - segmentMask是散列运算的掩码,等于ssize减1,即15,掩码的二进制各个位的值都是1.因为ssize的最大长度是65536,所以segmentShift最大值是16,segmentMask最大值是65535,对应的二进制是16位,每个位都是1
- 初始化每个segment
输入参数initialCapacity是ConcurrentHashMap的初始化容量,loadfactor是每个segment的负载因子,在构造方法里需要通过这两个参数来初始化数组中的每个segment.
```
       if (initialCapacity > MAXIMUM_CAPACITY)
            initialCapacity = MAXIMUM_CAPACITY;
        int c = initialCapacity / ssize;
        if (c * ssize < initialCapacity)
            ++c;
        int cap = 1;
        while (cap < c)
            cap <<= 1;
        for (int i = 0; i < this.segments.length; ++i)
            this.segments[i] = new Segment<K, V>(cap, loadFactor);
```
上面代码中的变量cap就是segment里HashEntry数组的长度,它等于initialCapacity除以ssize的倍数c,如果c大于1,就会取大于等于c的2的N次方值,所以cap不是1,就是2的N次方.
segment的容量threshold＝（int）cap*loadFactor,默认initialCapacity等于16,loadfactor等于0.75,通过运算cap等于1,threshold等于零.

- 定位Segment
既然ConcurrentHashMap使用分段锁Segment来保护不同段的数据,那么在插入和获取元素时,必须先通过散列算法定位到Segment.可以看到ConcurrentHashMap会首先使用Wang/Jenkins hash的变种算法对元素的hashCode进行一次再散列.
```
       private static int hash(int h) {
            h += (h << 15) ^ 0xffffcd7d;
            h ^= (h >>> 10);
            h += (h << 3);
            h ^= (h >>> 6);
            h += (h << 2) + (h << 14);
            return h ^ (h >>> 16);
        }
```
进行再散列,是为了减少散列冲突,使元素能够均匀地分布在不同的Segment上,从而提高容器的存取效率.
假如散列的质量差到极点,那么所有的元素都在一个Segment中,不仅存取元素缓慢,分段锁也会失去意义.

ConcurrentHashMap通过以下散列算法定位segment

```
final Segment<K,V> segmentFor(int hash) {
      return segments[(hash >>> segmentShift) & segmentMask];
}
```
默认情况下segmentShift为28,segmentMask为15,再散列后的数最大是32位二进制数据,向右无符号移动28位,即让高4位参与到散列运算中,(hash>>>segmentShift)&segmentMask的运算结果分别是4、15、7和8,可以看到散列值没有发生冲突.

### HashEntry
如果说ConcurrentHashMap中的segments数组是第一层hash表，则每个Segment中的HashEntry数组（transient volatile
HashEntry<K,V>[] table）是第二层hash表。每个HashEntry有一个next属性，因此它们能够组成一个单向链表。HashEntry相关代码如下：

```
static final class HashEntry<K,V> {
    final int hash;
    final K key;
    volatile V value;
    volatile HashEntry<K,V> next;

    HashEntry(int hash, K key, V value, HashEntry<K,V> next) {
        this.hash = hash;
        this.key = key;
        this.value = value;
        this.next = next;
    }

    /**
     * Sets next field with volatile write semantics.  (See above
     * about use of putOrderedObject.)
     */ final void setNext(HashEntry<K,V> n) {
        UNSAFE.putOrderedObject(this, nextOffset, n);
    }

    // Unsafe mechanics static final sun.misc.Unsafe UNSAFE;
    static final long nextOffset;
    static {
        try {
            UNSAFE = sun.misc.Unsafe.getUnsafe();
            Class k = HashEntry.class;
            nextOffset = UNSAFE.objectFieldOffset
                (k.getDeclaredField("next"));
        } catch (Exception e) {
            throw new Error(e);
        }
    }
}

/**
 * Gets the ith element of given table (if nonnull) with volatile
 * read semantics. Note: This is manually integrated into a few
 * performance-sensitive methods to reduce call overhead.
 */ @SuppressWarnings("unchecked")
static final <K,V> HashEntry<K,V> entryAt(HashEntry<K,V>[] tab, int i) {
    return (tab == null) ? null :
        (HashEntry<K,V>) UNSAFE.getObjectVolatile
        (tab, ((long)i << TSHIFT) + TBASE);
}

/**
 * Sets the ith element of given table, with volatile write
 * semantics. (See above about use of putOrderedObject.)
 */ static final <K,V> void setEntryAt(HashEntry<K,V>[] tab, int i,
                                   HashEntry<K,V> e) {
    UNSAFE.putOrderedObject(tab, ((long)i << TSHIFT) + TBASE, e);
}
```
与Segment类似，HashEntry使用UNSAFE.putOrderedObject来设置它的next成员变量，这样既可以提高性能，又能保持并发可见性。同时，entryAt方法和setEntryAt方法也使用了UNSAFE.getObjectVolatile和UNSAFE.putOrderedObject来读取和写入指定索引的HashEntry。

总之，Segment数组和HashEntry数组的读取写入一般都是使用UNSAFE。


#5 ConcurrentHashMap的操作
主要研究ConcurrentHashMap的3种操作——get操作、put操作和size操作.

## 5.1 get操作
  Segment的get操作实现非常简单和高效.
  - 先经过一次再散列
  - 然后使用这个散列值通过散列运算定位到Segment
  - 再通过散列算法定位到元素.
 

```
public V get(Object key) {
    Segment<K,V> s; 
    HashEntry<K,V>[] tab;
    int h = hash(key);
//找到segment的地址 long u = (((h >>> segmentShift) & segmentMask) << SSHIFT) + SBASE;
//取出segment，并找到其hashtable if ((s = (Segment<K,V>)UNSAFE.getObjectVolatile(segments, u)) != null &&
        (tab = s.table) != null) {
//遍历此链表，直到找到对应的值 for (HashEntry<K,V> e = (HashEntry<K,V>) UNSAFE.getObjectVolatile
                 (tab, ((long)(((tab.length - 1) & h)) << TSHIFT) + TBASE);
             e != null; e = e.next) {
            K k;
            if ((k = e.key) == key || (e.hash == h && key.equals(k)))
                return e.value;
        }
    }
    return null;
}
```
整个get方法不需要加锁，只需要计算两次hash值，然后遍历一个单向链表（此链表长度平均小于2），因此get性能很高。
高效之处在于整个过程不需要加锁,除非读到的值是空才会加锁重读.
HashTable容器的get方法是需要加锁的,那ConcurrentHashMap的get操作是如何做到不加锁的呢?
原因是它的get方法将要使用的**共享变量都定义成了volatile类型**,
如用于统计当前Segement大小的count字段和用于存储值的HashEntry的value.**定义成volatile的变量,能够在线程之间保持可见性,能够被多线程同时读,并且保证不会读到过期的值,但是只能被单线程写**(有一种情况可以被多线程写,就是写入的值不依赖于原值),
在get操作里只需要读不需要写共享变量count和value,所以可以不用加锁.
之所以不会读到过期的值,是因为根据Java内存模型的happen before原则,对volatile字段的写操作先于读操作,即使两个线程同时修改和获取
volatile变量,get操作也能拿到最新的值,
这是用volatile替换锁的经典应用场景.

```
transient volatile int count;
volatile V value;
```
在定位元素的代码里可以发现,定位HashEntry和定位Segment的散列算法虽然一样,都与数组的长度减去1再相“与”,但是相“与”的值不一样
  
   - 定位Segment使用的是元素的hashcode再散列后得到的值的高位
   - 定位HashEntry直接使用再散列后的值.

其目的是避免两次散列后的值一样,虽然元素在Segment里散列开了,但是却没有在HashEntry里散列开.

```
hash >>> segmentShift & segmentMask　　 // 定位Segment所使用的hash算法
int index = hash & (tab.length - 1);　　 // 定位HashEntry所使用的hash算法
```

