# 1 概述
HashMap是基于哈希表实现的,每一个元素是一个key-value对,其内部通过单链表解决冲突问题,容量不足(超过了阀值)时,同样会自动增长.
	
HashMap是非线程安全的,只适用于单线程环境,多线程环境可以采用并发包下的`concurrentHashMap`
    
HashMap 实现了Serializable接口，因此它支持序列化，实现了Cloneable接口，能被克隆
	
HashMap是基于哈希表的Map接口的非同步实现.此实现提供所有可选的映射操作,并允许使用null值和null键.此类不保证映射的顺序,特别是它不保证该顺序恒久不变.
	
Java8中又对此类底层实现进行了优化，比如引入了红黑树的结构以解决哈希碰撞
　
# 2 HashMap的数据结构
在Java中,最基本的结构就是两种,一个是数组,另外一个是模拟指针(引用),所有的数据结构都可以用这两个基本结构来构造,HashMap也不例外.
HashMap实际上是一个"链表散列"的数据结构,即数组和链表的结合体.

![HashMap的结构](http://upload-images.jianshu.io/upload_images/4685968-cd353393ebc2ddf7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
HashMap的主结构类似于一个数组,添加值时通过`key`确定储存位置.
每个位置是一个Entry的数据结构,该结构可组成链表.
当发生冲突时,相同hash值的键值对会组成链表.
这种`数组+链表`的组合形式大部分情况下都能有不错的性能效果,Java6、7就是这样设计的.
然而,在极端情况下,一组（比如经过精心设计的）键值对都发生了冲突，这时的哈希结构就会退化成一个链表，使HashMap性能急剧下降.

所以在Java8中,HashMap的结构实现变为数组+链表+红黑树
![Java8 HashMap的结构](https://upload-images.jianshu.io/upload_images/4685968-0e08421c5183e8ec.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
可以看出,HashMap底层就是一个数组结构
数组中的每一项又是一个链表
当新建一个HashMap时,就会初始化一个数组.

# 3 三大集合与迭代子
HashMap使用三大集合和三种迭代子来轮询其Key、Value和Entry对象
```
public class HashMapExam {
    public static void main(String[] args) {
        Map<Integer, String> map = new HashMap<>(16);
        for (int i = 0; i < 15; i++) {
            map.put(i, new String(new char[]{(char) ('A'+ i)}));
        }

        System.out.println("======keySet=======");
        Set<Integer> set = map.keySet();
        Iterator<Integer> iterator = set.iterator();
        while (iterator.hasNext()) {
            System.out.println(iterator.next());
        }

        System.out.println("======values=======");
        Collection<String> values = map.values();
        Iterator<String> stringIterator=values.iterator();
        while (stringIterator.hasNext()) {
            System.out.println(stringIterator.next());
        }

        System.out.println("======entrySet=======");
        for (Map.Entry<Integer, String> entry : map.entrySet()) {
            System.out.println(entry);
        }
    }
}
```

# 4 源码分析
```    
    //默认的初始容量16,且实际容量是2的整数幂 
    static final int DEFAULT_INITIAL_CAPACITY = 1 << 4;
    
    //最大容量(传入容量过大将被这个值替换)
    static final int MAXIMUM_CAPACITY = 1 << 30;
     
    // 默认加载因子为0.75(当表达到3/4满时,才会再散列),这个因子在时间和空间代价之间达到了平衡.更高的因子可以降低表所需的空间,但是会增加查找代价,而查找是最频繁操作
    static final float DEFAULT_LOAD_FACTOR = 0.75f;

	//桶的树化阈值：即 链表转成红黑树的阈值，在存储数据时，当链表长度 >= 8时，则将链表转换成红黑树
    static final int TREEIFY_THRESHOLD = 8;
   // 桶的链表还原阈值：即 红黑树转为链表的阈值，当在扩容（resize（））时（HashMap的数据存储位置会重新计算），在重新计算存储位置后，当原有的红黑树内数量 <= 6时，则将 红黑树转换成链表
    static final int UNTREEIFY_THRESHOLD = 6;
   //最小树形化容量阈值：即 当哈希表中的容量 > 该值时，才允许树形化链表 （即 将链表 转换成红黑树）
```
因为红黑树的平均查找长度是log(n)，长度为8的时候，平均查找长度为3，如果继续使用链表，平均查找长度为8/2=4，这才有转换为树的必要
链表长度如果是小于等于6，6/2=3，虽然速度也很快的，但是转化为树结构和生成树的时间并不会太短

还有选择6和8，中间有个差值7可以有效防止链表和树频繁转换
假设一下，如果设计成链表个数超过8则链表转换成树结构，链表个数小于8则树结构转换成链表，如果一个HashMap不停的插入、删除元素，链表个数在8左右徘徊，就会频繁的发生树转链表、链表转树，效率会很低。
```
    // 为了避免扩容/树形化选择的冲突，这个值不能小于 4 * TREEIFY_THRESHOLD
    // 小于该值时使用的是扩容哦!!!
    static final int MIN_TREEIFY_CAPACITY = 64;
    
    // 存储数据的Node数组,长度是2的幂.    
    // HashMap采用链表法解决冲突，每一个Node本质上是一个单向链表 
    //HashMap底层存储的数据结构,是一个Node数组.上面得知Node类为元素维护了一个单向链表.至此,HashMap存储的数据结构也就很清晰了:维护了一个数组,每个数组又维护了一个单向链表.之所以这么设计,考虑到遇到哈希冲突的时候,同index的value值就用单向链表来维护
    //与 JDK 1.7 的对比（Entry类），仅仅只是换了名字
    transient Node<K,V>[] table;

    // HashMap的底层数组中已用槽的数量 
    transient int size;
    // HashMap的阈值，用于判断是否需要调整HashMap的容量（threshold = 容量*加载因子） 
    int threshold;
    
    // 负载因子实际大小
    final float loadFactor;
    
    // HashMap被改变的次数 
    transient int modCount;
    
    // 指定“容量大小”和“加载因子”的构造函数,是最基础的构造函数
    public HashMap(int initialCapacity, float loadFactor) {
        if (initialCapacity < 0)
            throw new IllegalArgumentException("Illegal initial capacity: " +
                                               initialCapacity);
        // HashMap的最大容量只能是MAXIMUM_CAPACITY                                       
        if (initialCapacity > MAXIMUM_CAPACITY)
            initialCapacity = MAXIMUM_CAPACITY;
        //负载因子须大于0
        if (loadFactor <= 0 || Float.isNaN(loadFactor))
            throw new IllegalArgumentException("Illegal load factor: " +
                                               loadFactor);
        // 设置"负载因子"                                        
        this.loadFactor = loadFactor;
        // 设置"HashMap阈值",当HashMap中存储数据的数量达到threshold时,就需将HashMap的容量加倍    
        this.threshold = tableSizeFor(initialCapacity);
    }
```

- 上面的tableSizeFor有何用?
tableSizeFor方法保证函数返回值是大于等于给定参数initialCapacity最小的2的幂次方的数值
```
    static final int tableSizeFor(int cap) {
        int n = cap - 1;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
    }
```
 可以看出该方法是一系列的二进制位操作

>a |= b 等同于 a = a|b

逐行分析
- `int n = cap - 1`
给定的cap 减 1,为了避免参数cap本来就是2的幂次方,这样一来,经过后续操作，cap将会变成2 * cap,是不符合我们预期的

- `n |= n >>> 1`
n >>> 1 : n无符号右移1位,即n二进制最高位的1右移一位
n | (n >>> 1) 导致 n二进制的高2位值为1
目前n的高1~2位均为1
- `n |= n >>> 2`
n继续无符号右移2位
n | (n >>> 2) 导致n二进制表示的高3~4位经过运算值均为1
目前n的高1~4位均为1
- `n |= n >>> 4`
n继续无符号右移4位
n | (n >>> 4) 导致n二进制表示的高5~8位经过运算值均为1
目前n的高1~8位均为1
- `n |= n >>> 8`
n继续无符号右移8位
n | (n >>> 8) 导致n二进制表示的高9~16位经过运算值均为1
目前n的高1~16位均为1	

可以看出,无论给定cap(cap < MAXIMUM_CAPACITY )的值是多少,经过以上运算,其值的二进制所有位都会是1.再将其加1,这时候这个值一定是2的幂次方.
当然如果经过运算值大于MAXIMUM_CAPACITY,直接选用MAXIMUM_CAPACITY.

![](http://upload-images.jianshu.io/upload_images/4685968-ffb968a6b1a70fa9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

至此tableSizeFor如何保证cap为2的幂次方已经显而易见了,那么问题来了

## 4.1 **为什么cap要保持为2的幂次方？**
主要与HashMap中的数据存储有关.

在Java8中,HashMap中key的Hash值由Hash(key)方法计得
![](https://upload-images.jianshu.io/upload_images/4685968-e8540295874593d7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

HashMap中存储数据table的index是由key的Hash值决定的.
在HashMap存储数据时,我们期望数据能均匀分布,以防止哈希冲突.
自然而然我们就会想到去用`%`取余操作来实现我们这一构想

>取余(%)操作 : 如果除数是2的幂次则等价于与其除数减一的与(&)操作.

这也就解释了为什么一定要求cap要为2的幂次方.再来看看table的index的计算规则：
![](https://upload-images.jianshu.io/upload_images/4685968-ddd3a2805bea14c4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
 等价于:
```
 index = e.hash % newCap
```
采用二进制位操作&,相对于%,能够提高运算效率,这就是cap的值被要求为2幂次的原因
![](https://upload-images.jianshu.io/upload_images/4685968-5b47864c20546b8d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![数据结构 & 参数与 JDK 7 / 8](https://upload-images.jianshu.io/upload_images/4685968-80fbc4a63ab41290.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 4.2 **Node类**

```
static class Node<K,V> implements Map.Entry<K,V> {
        final int hash;
        final K key;
        V value;
        Node<K,V> next;

        Node(int hash, K key, V value, Node<K,V> next) {
            this.hash = hash;
            this.key = key;
            this.value = value;
            this.next = next;
        }

        public final K getKey()        { return key; }
        public final V getValue()      { return value; }
        public final String toString() { return key + "=" + value; }

        public final int hashCode() {
            return Objects.hashCode(key) ^ Objects.hashCode(value);
        }

        public final V setValue(V newValue) {
            V oldValue = value;
            value = newValue;
            return oldValue;
        }

        public final boolean equals(Object o) {
            if (o == this)
                return true;
            if (o instanceof Map.Entry) {
                Map.Entry<?,?> e = (Map.Entry<?,?>)o;
                if (Objects.equals(key, e.getKey()) &&
                    Objects.equals(value, e.getValue()))
                    return true;
            }
            return false;
        }
    }
```
Node<K,V> 类是HashMap中的静态内部类,实现Map.Entry<K,V>接口.定义了key键、value值、next节点,也就是说元素之间构成了单向链表.

## 4.3 TreeNode
```
static final class TreeNode<K,V> extends LinkedHashMap.Entry<K,V> {
        TreeNode<K,V> parent;  // red-black tree links
        TreeNode<K,V> left;
        TreeNode<K,V> right;
        TreeNode<K,V> prev;    // needed to unlink next upon deletion
        boolean red;
        TreeNode(int hash, K key, V val, Node<K,V> next) {}

        // 返回当前节点的根节点  
        final TreeNode<K,V> root() {  
          for (TreeNode<K,V> r = this, p;;) {  
            if ((p = r.parent) == null)  
                return r;  
            r = p;  
        }  
    } 
 }
```
红黑树结构包含前、后、左、右节点，以及标志是否为红黑树的字段
此结构是Java8新加的

## 4.4 hash方法
Java 8中的散列值优化函数
![](https://upload-images.jianshu.io/upload_images/4685968-2c057211c7051fd9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
只做一次16位右位移异或
key.hashCode()函数调用的是key键值类型自带的哈希函数，返回int型散列值

理论上散列值是一个int型，如果直接拿散列值作为下标访问HashMap主数组的话，考虑到2进制32位带符号的int范围大概40亿的映射空间。只要哈希函数映射得比较均匀松散，一般应用是很难出现碰撞的。
但问题是一个40亿长度的数组，内存是放不下的.HashMap扩容之前的数组初始大小才16,所以这个散列值是不能直接拿来用的.
用之前还要先做对数组的长度取模运算，得到的余数才能用来访问数组下标
源码中模运算就是把散列值和数组长度做一个"与"操作，
![](https://upload-images.jianshu.io/upload_images/4685968-4fcd8fe2039d26c5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这也正好解释了为什么HashMap的数组长度要取2的整次幂
因为这样（数组长度-1）正好相当于一个“低位掩码”
“与”操作的结果就是散列值的高位全部归零，只保留低位值，用来做数组下标访问

以初始长度16为例，16-1=15
2进制表示是00000000 00000000 00001111
和某散列值做“与”操作如下，结果就是截取了最低的四位值
![](https://upload-images.jianshu.io/upload_images/4685968-89fececc1ca1c0b7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
但这时候问题就来了,这样就算我的散列值分布再松散,要是只取最后几位的话,碰撞也会很严重

这时候“扰动函数”的价值就体现出来了
![](https://upload-images.jianshu.io/upload_images/4685968-4825a9e897a9723b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
右位移16位，正好是32位一半，自己的高半区和低半区做异或，就是为了混合原始hashCode的高位和低位，以此来加大低位的随机性
而且混合后的低位掺杂了高位的部分特征，这样高位的信息也被变相保留下来。

index的运算规则是
```
e.hash & (newCap - 1)
```
newCap是2的幂,所以newCap - 1的高位全0

若e.hash值只用自身的hashcode,index只会和e.hash的低位做&操作.这样一来,index的值就只有低位参与运算,高位毫无存在感,从而会带来哈希冲突的风险
所以在计算key的hashCode时,用其自身hashCode与其低16位做异或操作
这也就让高位参与到index的计算中来了,即降低了哈希冲突的风险又不会带来太大的性能问题

## 4.5 Put方法
![](https://upload-images.jianshu.io/upload_images/4685968-ac54873c0837d3ba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/4685968-76c3c90239e1f15e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![HashMap-put(k,v)](http://upload-images.jianshu.io/upload_images/4685968-0ccc069e89b40e4c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
①.判断键值对数组table[i]是否为空或为null，否则执行resize()进行扩容

②.根据键值key计算hash值得到插入的数组索引i，如果table[i]==null，直接新建节点添加，转向⑥，如果table[i]不为空，转向③

③.判断table[i]的首个元素是否和key一样，如果相同直接覆盖value，否则转向④，这里的相同指的是hashCode以及equals

④.判断table[i] 是否为treeNode，即table[i] 是否是红黑树，如果是红黑树，则直接在树中插入键值对，否则转向⑤

⑤.遍历table[i]，判断链表长度是否大于8，大于8的话把链表转换为红黑树，在红黑树中执行插入操作，否则进行链表的插入操作；遍历过程中若发现key已经存在直接覆盖value即可

⑥.插入成功后，判断实际存在的键值对数量size是否超多了最大容量threshold，如果超过，执行resize()扩容
```
 public V put(K key, V value) {
        // 对key的hashCode()做hash
        return putVal(hash(key), key, value, false, true);
    }
    
final V putVal(int hash, K key, V value, boolean onlyIfAbsent, boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        // 步骤① tab为空则调用resize()初始化创建
        if ((tab = table) == null || (n = tab.length) == 0)         
            n = (tab = resize()).length;
        // 步骤② 计算index,并对null做处理  
        //tab[i = (n - 1) & hash对应下标的第一个节点   
        if ((p = tab[i = (n - 1) & hash]) == null)
            // 无哈希冲突的情况下,将value直接封装为Node并赋值
            tab[i] = newNode(hash, key, value, null);
        else {
            Node<K,V> e; K k;
            // 步骤③ 节点的key相同,直接覆盖节点
            if (p.hash == hash && ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
            // 步骤④ 判断该链为红黑树    
            else if (p instanceof TreeNode)
                 // p是红黑树类型，则调用putTreeVal方式赋值
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            // 步骤⑤ p非红黑树类型,该链为链表    
            else {
                // index 相同的情况下
                for (int binCount = 0; ; ++binCount) {
                    if ((e = p.next) == null) {
                        // 如果p的next为空,将新的value值添加至链表后面
                        p.next = newNode(hash, key, value, null);
                        if (binCount >= TREEIFY_THRESHOLD - 1)
                            // 如果链表长度大于8,链表转化为红黑树,执行插入
                            treeifyBin(tab, hash);
                        break;
                    }
                    // key相同则跳出循环
                    if (e.hash == hash &&  ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    //就是移动指针方便继续取 p.next
    
                    p = e;
                }
            }
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                //根据规则选择是否覆盖value
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        // 步骤⑥:超过最大容量,就扩容
        if (++size > threshold)
            // size大于加载因子,扩容
            resize();
        afterNodeInsertion(evict);
        return null;
    }
```
在构造函数中最多也只是设置了initialCapacity、loadFactor的值,并没有初始化table,table的初始化工作是在put方法中进行的.
## 4.6 resize
![](https://upload-images.jianshu.io/upload_images/4685968-fd60bec62611e900.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
扩容(resize)就是重新计算容量,向HashMap对象里不停的添加元素,内部的数组无法装载更多的元素时,就需要扩大数组的长度.
当然Java里的数组是无法自动扩容的,方法是使用一个新的数组代替已有的容量小的数组
```
   /**
     * 该函数有2种使用情况：1.初始化哈希表 2.当前数组容量过小，需扩容
     */
final Node<K,V>[] resize() {
        Node<K,V>[] oldTab = table;
        int oldCap = (oldTab == null) ? 0 : oldTab.length;
        int oldThr = threshold;
        int newCap, newThr = 0;

        // 针对情况2：若扩容前的数组容量超过最大值，则不再扩充
        if (oldCap > 0) {
            if (oldCap >= MAXIMUM_CAPACITY) {
                threshold = Integer.MAX_VALUE;
                return oldTab;
            }
            // 针对情况2：若无超过最大值，就扩充为原来的2倍
            else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                     oldCap >= DEFAULT_INITIAL_CAPACITY)
                //newCap设置为oldCap的2倍并小于MAXIMUM_CAPACITY，且大于默认值, 新的threshold增加为原来的2倍
                newThr = oldThr << 1; // double threshold
        }
     
        // 针对情况1：初始化哈希表（采用指定 or 默认值）
        else if (oldThr > 0) // initial capacity was placed in threshold
            // threshold>0, 将threshold设置为newCap,所以要用tableSizeFor方法保证threshold是2的幂次方
            newCap = oldThr;
        else {               // zero initial threshold signifies using defaults
            // 默认初始化
            newCap = DEFAULT_INITIAL_CAPACITY;
            newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
        }

        // 计算新的resize上限
        if (newThr == 0) {
            // newThr为0，newThr = newCap * 0.75
            float ft = (float)newCap * loadFactor;
            newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                      (int)ft : Integer.MAX_VALUE);
        }
        threshold = newThr;
        @SuppressWarnings({"rawtypes","unchecked"})
            // 新生成一个table数组
            Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
        table = newTab;
        if (oldTab != null) {
            // oldTab 复制到 newTab
            for (int j = 0; j < oldCap; ++j) {
                Node<K,V> e;
                if ((e = oldTab[j]) != null) {
                    oldTab[j] = null;
                    if (e.next == null)
                       // 链表只有一个节点，直接赋值
                       //为什么要重新Hash呢？因为长度扩大以后，Hash的规则也随之改变。
                        newTab[e.hash & (newCap - 1)] = e;
                    else if (e instanceof TreeNode)
                        // e为红黑树的情况
                        ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                    else { // preserve order链表优化重hash的代码块
                        Node<K,V> loHead = null, loTail = null;
                        Node<K,V> hiHead = null, hiTail = null;
                        Node<K,V> next;
                        do {
                            next = e.next;
                            // 原索引
                            if ((e.hash & oldCap) == 0) {
                                if (loTail == null)
                                    loHead = e;
                                else
                                    loTail.next = e;
                                loTail = e;
                            }
                            // 原索引 + oldCap
                            else {
                                if (hiTail == null)
                                    hiHead = e;
                                else
                                    hiTail.next = e;
                                hiTail = e;
                            }
                        } while ((e = next) != null);
                        // 原索引放到bucket里
                        if (loTail != null) {
                            loTail.next = null;
                            newTab[j] = loHead;
                        }
                        // 原索引+oldCap放到bucket里
                        if (hiTail != null) {
                            hiTail.next = null;
                            newTab[j + oldCap] = hiHead;
                        }
                    }
                }
            }
        }
        return newTab;
    }
```
![图片发自简书App](http://upload-images.jianshu.io/upload_images/4685968-3edeccbe9811a4c3.jpg)



## 4.7 remove方法
remove(key) 方法 和 remove(key, value) 方法都是通过调用removeNode的方法来实现删除元素的
```
 final Node<K,V> removeNode(int hash, Object key, Object value,
                               boolean matchValue, boolean movable) {
        Node<K,V>[] tab; Node<K,V> p; int n, index;
        if ((tab = table) != null && (n = tab.length) > 0 &&
            (p = tab[index = (n - 1) & hash]) != null) {
            Node<K,V> node = null, e; K k; V v;
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                // index 元素只有一个元素
                node = p;
            else if ((e = p.next) != null) {
                if (p instanceof TreeNode)
                    // index处是一个红黑树
                    node = ((TreeNode<K,V>)p).getTreeNode(hash, key);
                else {
                    // index处是一个链表，遍历链表返回node
                    do {
                        if (e.hash == hash &&
                            ((k = e.key) == key ||
                             (key != null && key.equals(k)))) {
                            node = e;
                            break;
                        }
                        p = e;
                    } while ((e = e.next) != null);
                }
            }
            // 分不同情形删除节点
            if (node != null && (!matchValue || (v = node.value) == value ||
                                 (value != null && value.equals(v)))) {
                if (node instanceof TreeNode)
                    ((TreeNode<K,V>)node).removeTreeNode(this, tab, movable);
                else if (node == p)
                    tab[index] = node.next;
                else
                    p.next = node.next;
                ++modCount;
                --size;
                afterNodeRemoval(node);
                return node;
            }
        }
        return null;
    }
```
## 4.8 get
```
/**
   * 函数原型
   * 作用：根据键key，向HashMap获取对应的值
   */ 
   map.get(key)；


 /**
   * 源码分析
   */ 
   public V get(Object key) {
    Node<K,V> e;
    // 1. 计算需获取数据的hash值
    // 2. 通过getNode（）获取所查询的数据 ->>分析1
    // 3. 获取后，判断数据是否为空
    return (e = getNode(hash(key), key)) == null ? null : e.value;
}

/**
   * 分析1：getNode(hash(key), key))
   */ 
final Node<K,V> getNode(int hash, Object key) {
    Node<K,V>[] tab; Node<K,V> first, e; int n; K k;

    // 1. 计算存放在数组table中的位置
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (first = tab[(n - 1) & hash]) != null) {

        // 4. 通过该函数，依次在数组、红黑树、链表中查找（通过equals（）判断）
        // a. 先在数组中找，若存在，则直接返回
        if (first.hash == hash && // always check first node
            ((k = first.key) == key || (key != null && key.equals(k))))
            return first;

        // b. 若数组中没有，则到红黑树中寻找
        if ((e = first.next) != null) {
            // 在树中get
            if (first instanceof TreeNode)
                return ((TreeNode<K,V>)first).getTreeNode(hash, key);

            // c. 若红黑树中也没有，则通过遍历，到链表中寻找
            do {
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    return e;
            } while ((e = e.next) != null);
        }
    }
    return null;
}
```
> 在JDK1.7及以前的版本中，HashMap里是没有红黑树的实现的，在JDK1.8中加入了红黑树是为了防止哈希表碰撞攻击，当链表链长度为8时，及时转成红黑树，提高map的效率

如果某个桶中的记录过大的话（当前是TREEIFY_THRESHOLD = 8），HashMap会动态的使用一个专门的treemap实现来替换掉它。这样做的结果会更好，是O(logn)，而不是糟糕的O(n)。它是如何工作的？
前面产生冲突的那些KEY对应的记录只是简单的追加到一个链表后面，这些记录只能通过遍历来进行查找。但是超过这个阈值后HashMap开始将列表升级成一个二叉树，使用哈希值作为树的分支变量，如果两个哈希值不等，但指向同一个桶的话，较大的那个会插入到右子树里。如果哈希值相等，HashMap希望key值最好是实现了Comparable接口的，这样它可以按照顺序来进行插入。这对HashMap的key来说并不是必须的，不过如果实现了当然最好。如果没有实现这个接口，在出现严重的哈希碰撞的时候，你就并别指望能获得性能提升了。

这个性能提升有什么用处？比方说恶意的程序，如果它知道我们用的是哈希算法，它可能会发送大量的请求，导致产生严重的哈希碰撞。然后不停的访问这些key就能显著的影响服务器的性能，这样就形成了一次拒绝服务攻击（DoS）。JDK 8中从O(n)到O(logn)的飞跃，可以有效地防止类似的攻击，同时也让HashMap性能的可预测性稍微增强了一些
```
/**
   * 源码分析：resize(2 * table.length)
   * 作用：当容量不足时（容量 > 阈值），则扩容（扩到2倍）
   */ 
   void resize(int newCapacity) {  

    // 1. 保存旧数组（old table） 
    Entry[] oldTable = table;  

    // 2. 保存旧容量（old capacity ），即数组长度
    int oldCapacity = oldTable.length; 

    // 3. 若旧容量已经是系统默认最大容量了，那么将阈值设置成整型的最大值，退出    
    if (oldCapacity == MAXIMUM_CAPACITY) {  
        threshold = Integer.MAX_VALUE;  
        return;  
    }  

    // 4. 根据新容量（2倍容量）新建1个数组，即新table  
    Entry[] newTable = new Entry[newCapacity];  

    // 5. （重点分析）将旧数组上的数据（键值对）转移到新table中，从而完成扩容 ->>分析1.1 
    transfer(newTable); 

    // 6. 新数组table引用到HashMap的table属性上
    table = newTable;  

    // 7. 重新设置阈值  
    threshold = (int)(newCapacity * loadFactor); 
} 

 /**
   * 分析1.1：transfer(newTable); 
   * 作用：将旧数组上的数据（键值对）转移到新table中，从而完成扩容
   * 过程：按旧链表的正序遍历链表、在新链表的头部依次插入
   */ 
void transfer(Entry[] newTable) {
      // 1. src引用了旧数组
      Entry[] src = table; 

      // 2. 获取新数组的大小 = 获取新容量大小                 
      int newCapacity = newTable.length;

      // 3. 通过遍历 旧数组，将旧数组上的数据（键值对）转移到新数组中
      for (int j = 0; j < src.length; j++) { 
          // 3.1 取得旧数组的每个元素  
          Entry<K,V> e = src[j];           
          if (e != null) {
              // 3.2 释放旧数组的对象引用（for循环后，旧数组不再引用任何对象）
              src[j] = null; 

              do { 
                  // 3.3 遍历 以该数组元素为首 的链表
                  // 注：转移链表时，因是单链表，故要保存下1个结点，否则转移后链表会断开
                  Entry<K,V> next = e.next; 
                 // 3.3 重新计算每个元素的存储位置
                 int i = indexFor(e.hash, newCapacity); 
                 // 3.4 将元素放在数组上：采用单链表的头插入方式 = 在链表头上存放数据 = 将数组位置的原有数据放在后1个指针、将需放入的数据放到数组位置中
                 // 即 扩容后，可能出现逆序：按旧链表的正序遍历链表、在新链表的头部依次插入
                 e.next = newTable[i]; 
                 newTable[i] = e;  
                 // 访问下1个Entry链上的元素，如此不断循环，直到遍历完该链表上的所有节点
                 e = next;             
             } while (e != null);
             // 如此不断循环，直到遍历完数组上的所有数据元素
         }
     }
 }
```
从上面可看出：在扩容resize（）过程中，在将旧数组上的数据 转移到 新数组上时，转移数据操作 = 按旧链表的正序遍历链表、在新链表的头部依次插入，即在转移数据、扩容后，容易出现链表逆序的情况

>`设重新计算存储位置后不变，即扩容前 = 1->2->3，扩容后 = 3->2->1`

此时若并发执行 put 操作，一旦出现扩容情况，则 容易出现 环形链表，从而在获取数据、遍历链表时 形成死循环（Infinite Loop），即死锁
![](https://upload-images.jianshu.io/upload_images/4685968-f0fc8abf5588bda4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![image.png](https://upload-images.jianshu.io/upload_images/4685968-33e1eb8ca4751050.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-52f69ae7fb5284dc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![为什么 HashMap 中 String、Integer 这样的包装类适合作为 key 键](https://upload-images.jianshu.io/upload_images/4685968-7ab28eced8714fe6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 单线程rehash
单线程情况下，rehash无问题
[![HashMap rehash single thread](http://upload-images.jianshu.io/upload_images/4685968-a36b5a282b6ffefa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)](http://www.jasongj.com/img/java/concurrenthashmap/single_thread_rehash.png)
# 多线程并发下的rehash

这里假设有两个线程同时执行了put操作并引发了rehash，执行了transfer方法，并假设线程一进入transfer方法并执行完next = e.next后，因为线程调度所分配时间片用完而“暂停”，此时线程二完成了transfer方法的执行。此时状态如下。

[![HashMap rehash multi thread step 1](http://upload-images.jianshu.io/upload_images/4685968-c68bf4c25dfd8f2d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)](http://www.jasongj.com/img/java/concurrenthashmap/multi_thread_rehash_1.png)
接着线程1被唤醒，继续执行第一轮循环的剩余部分
```
e.next = newTable[1] = null
newTable[1] = e = key(5)
e = next = key(9)
```
结果如下图所示
[![HashMap rehash multi thread step 2](http://upload-images.jianshu.io/upload_images/4685968-39e50bf8b6272f1d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)](http://www.jasongj.com/img/java/concurrenthashmap/multi_thread_rehash_2.png) 

接着执行下一轮循环，结果状态图如下所示
[![HashMap rehash multi thread step 3](http://upload-images.jianshu.io/upload_images/4685968-4d3ecfe9177c8ec5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)](http://www.jasongj.com/img/java/concurrenthashmap/multi_thread_rehash_3.png) 

继续下一轮循环，结果状态图如下所示
[![HashMap rehash multi thread step 4](http://upload-images.jianshu.io/upload_images/4685968-14ed3884c7e20cd0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)](http://www.jasongj.com/img/java/concurrenthashmap/multi_thread_rehash_4.png) 

此时循环链表形成，并且key(11)无法加入到线程1的新数组。在下一次访问该链表时会出现死循环。
# Fast-fail
### [](http://www.jasongj.com/java/concurrenthashmap/#%E4%BA%A7%E7%94%9F%E5%8E%9F%E5%9B%A0 "产生原因")产生原因

在使用迭代器的过程中如果HashMap被修改，那么`ConcurrentModificationException`将被抛出，也即Fast-fail策略。

当HashMap的iterator()方法被调用时，会构造并返回一个新的EntryIterator对象，并将EntryIterator的expectedModCount设置为HashMap的modCount（该变量记录了HashMap被修改的次数）。
```
HashIterator() {
  expectedModCount = modCount;
  if (size > 0) { // advance to first entry
  Entry[] t = table;
  while (index < t.length && (next = t[index++]) == null)
    ;
  }
}
```


在通过该Iterator的next方法访问下一个Entry时，它会先检查自己的expectedModCount与HashMap的modCount是否相等，如果不相等，说明HashMap被修改，直接抛出`ConcurrentModificationException`。该Iterator的remove方法也会做类似的检查。该异常的抛出意在提醒用户及早意识到线程安全问题。

### [](http://www.jasongj.com/java/concurrenthashmap/#%E7%BA%BF%E7%A8%8B%E5%AE%89%E5%85%A8%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88 "线程安全解决方案")线程安全解决方案

单线程条件下，为避免出现`ConcurrentModificationException`，需要保证只通过HashMap本身或者只通过Iterator去修改数据，不能在Iterator使用结束之前使用HashMap本身的方法修改数据。因为通过Iterator删除数据时，HashMap的modCount和Iterator的expectedModCount都会自增，不影响二者的相等性。如果是增加数据，只能通过HashMap本身的方法完成，此时如果要继续遍历数据，需要重新调用iterator()方法从而重新构造出一个新的Iterator，使得新Iterator的expectedModCount与更新后的HashMap的modCount相等。

多线程条件下，可使用`Collections.synchronizedMap`方法构造出一个同步Map，或者直接使用线程安全的ConcurrentHashMap。

