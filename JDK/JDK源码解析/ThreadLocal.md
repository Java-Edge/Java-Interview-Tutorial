
# 1 前言

此类提供线程本地变量，与普通变量不同，因为每个访问一个变量（通过其get或set方法）的线程都有其自己的，独立初始化的变量副本。 
ThreadLocal   实例通常是期望将状态与线程(例如，用户ID或事务ID)关联的类中的 private static 字段。

例如，下面的类生成每个线程本地的唯一标识符。线程的ID是在第一次调用ThreadId.get() 时赋值的，并且在以后的调用中保持不变。

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzcvMTcxZWZhYzdiMDdiMDMzNw?x-oss-process=image/format,png) 
 
只要线程是活跃的并且 ThreadLocal 实例是可访问的，则每个线程都对其线程本地变量的副本持有隐式的引用。线程消失后，线程本地实例的所有副本都会被 GC（除非存在对这些副本的其他引用）。

# 2 继续体系
- 继承?不存在的,这其实也是 java.lang 包下的工具类，但是 ThreadLocal 定义带有泛型，说明可以储存任意格式的数据。
![](https://img-blog.csdnimg.cn/20210615235535658.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

 
# 3 属性
ThreadLocal 依赖于附加到每个线程（Thread.threadLocals和InheritableThreadLocals）的线程线性探测哈希表。

## threadLocalHashCode
ThreadLocal 对象充当key，通过 threadLocalHashCode 进行搜索。这是一个自定义哈希码(仅在ThreadLocalMaps 中有用)，它消除了在相同线程使用连续构造的threadlocal的常见情况下的冲突，而在不太常见的情况下仍然表现良好。

ThreadLocal 通过这样的 hashCode，计算当前 ThreadLocal 在 ThreadLocalMap 中的索引
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzcvMTcxZWZhYzdiNDcxM2Q2Mw?x-oss-process=image/format,png) 
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzcvMTcxZWZhYzdhZjZjMDQwMg?x-oss-process=image/format,png) 

- 连续生成的哈希码之间的差值，该值的设定参考文章[ThreadLocal的hash算法（关于 0x61c88647）](https://juejin.im/post/5cced289f265da03804380f2)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzcvMTcxZWZhYzdiNmUwNjA0NQ?x-oss-process=image/format,png) 

- 注意 static 修饰。ThreadLocalMap 会被 set 多个 ThreadLocal ，而多个 ThreadLocal 就根据 threadLocalHashCode 区分
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzcvMTcxZWZhYzdkMTkzOWUwMw?x-oss-process=image/format,png) 
# 4 ThreadLocalMap
自定义的哈希表，仅适用于维护线程本地的值。没有操作导出到ThreadLocal类之外。
该类包私有，允许在 Thread 类中的字段声明。为帮助处理非常长的使用寿命，哈希表节点使用 WeakReferences 作为key。
但由于不使用引用队列，因此仅在表空间不足时，才保证删除过时的节点。
```java
static class ThreadLocalMap {

        /**
         * 此哈希表中的节点使用其主引用字段作为key（始终是一个 ThreadLocal 对象），继承了 WeakReference。 
         * 空键（即entry.get（）== null）意味着不再引用该键，因此可以从表中删除该节点。             
         * 在下面的代码中，此类节点称为 "stale entries"
         */
        static class Entry extends WeakReference<ThreadLocal<?>> {
            /** 与此 ThreadLocal 关联的值 */
            Object value;

            Entry(ThreadLocal<?> k, Object v) {
                super(k);
                value = v;
            }
        }
        
        private static final int INITIAL_CAPACITY = 16;

        private Entry[] table;
        
        private int size = 0;

        private int threshold; // 默认为 0
```
## 特点
- key 是 ThreadLocal 的引用
- value 是 ThreadLocal 保存的值
- 数组的数据结构
# 5 set
## 5.1 ThreadLocal#set
将此线程本地变量的当前线程副本设置为指定值。子类无需重写此方法，而仅依靠initialValue方法设置线程本地变量的值。
![](https://img-blog.csdnimg.cn/20210616000550930.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

### 执行流程
1. 获取当前线程
2. 获取线程所对应的ThreadLocalMap。每个线程都是独立的，所以该方法天然线程安全
3. 判断 map 是否为 null
    - 否，K.V 对赋值，k 为this（即当前的 ThreaLocal 对象）
    - 是，初始化一个 ThreadLocalMap 来维护 K.V 对

来具体看看ThreadLocalMap中的 set

## 5.2 ThreadLocalMap#set
```java
private void set(ThreadLocal<?> key, Object value) {
    // 新引用指向 table
    Entry[] tab = table;
    int len = tab.length;
    // 获取对应 ThreadLocal 在table 中的索引
    int i = key.threadLocalHashCode & (len-1);

    /**
     * 从该下标开始循环遍历
     * 1、如遇相同key，则直接替换value
     * 2、如果该key已经被回收失效，则替换该失效的key
     */
    for (Entry e = tab[i];
         e != null; 
         e = tab[i = nextIndex(i, len)]) {
        ThreadLocal<?> k = e.get();
        // 找到内存地址一样的 ThreadLocal，直接替换
        if (k == key) {
            e.value = value;
            return;
        }
        // 若 k 为 null,说明 ThreadLocal 被清理了,则替换当前失效的 k
        if (k == null) {
            replaceStaleEntry(key, value, i);
            return;
        }
    }
    // 找到空位，创建节点并插入
    tab[i] = new Entry(key, value);
    // table内元素size自增
    int sz = ++size;
    // 达到阈值(数组大小的三分之二)时，执行扩容
    if (!cleanSomeSlots(i, sz) && sz >= threshold)
        rehash();
}
```
注意通过 hashCode 计算的索引位置 i 处如果已经有值了，会从 i 开始，通过 +1 不断的往后寻找，直到找到索引位置为空的地方，把当前 ThreadLocal 作为 key 放进去。

# 6 get 
```java
public T get() {
    // 获取当前线程
    Thread t = Thread.currentThread();
    // 获取当前线程对应的ThreadLocalMap
    ThreadLocalMap map = getMap(t);

    // 如果map不为空
    if (map != null) {
        // 取得当前ThreadLocal对象对应的Entry
        ThreadLocalMap.Entry e = map.getEntry(this);
        // 如果不为空，读取当前 ThreadLocal 中保存的值
        if (e != null) {
            @SuppressWarnings("unchecked")
            T result = (T)e.value;
            return result;
        }
    }
    // 否则都执行 setInitialValue
    return setInitialValue();
}
```
### setInitialValue
```java
private T setInitialValue() {
    // 获取初始值，一般是子类重写
    T value = initialValue();

    // 获取当前线程
    Thread t = Thread.currentThread();

    // 获取当前线程对应的ThreadLocalMap
    ThreadLocalMap map = getMap(t);

    // 如果map不为null
    if (map != null)

        // 调用ThreadLocalMap的set方法进行赋值
        map.set(this, value);

    // 否则创建个ThreadLocalMap进行赋值
    else
        createMap(t, value);
    return value;
}
```

接着我们来看下 
## ThreadLocalMap#getEntry
```java
// 得到当前 thradLocal 对应的值，值的类型是由 thradLocal 的泛型决定的
// 由于 thradLocalMap set 时解决数组索引位置冲突的逻辑，导致 thradLocalMap get 时的逻辑也是对应的
// 首先尝试根据 hashcode 取模数组大小-1 = 索引位置 i 寻找，找不到的话，自旋把 i+1，直到找到索引位置不为空为止
private Entry getEntry(ThreadLocal<?> key) {
    // 计算索引位置：ThreadLocal 的 hashCode 取模数组大小-1
    int i = key.threadLocalHashCode & (table.length - 1);
    Entry e = table[i];
    // e 不为空，并且 e 的 ThreadLocal 的内存地址和 key 相同，直接返回，否则就是没有找到，继续通过 getEntryAfterMiss 方法找
    if (e != null && e.get() == key)
        return e;
    else
    // 这个取数据的逻辑，是因为 set 时数组索引位置冲突造成的  
        return getEntryAfterMiss(key, i, e);
}
// 自旋 i+1，直到找到为止
private Entry getEntryAfterMiss(ThreadLocal<?> key, int i, Entry e) {
    Entry[] tab = table;
    int len = tab.length;
    // 在大量使用不同 key 的 ThreadLocal 时，其实还蛮耗性能的
    while (e != null) {
        ThreadLocal<?> k = e.get();
        // 内存地址一样，表示找到了
        if (k == key)
            return e;
        // 删除没用的 key
        if (k == null)
            expungeStaleEntry(i);
        // 继续使索引位置 + 1
        else
            i = nextIndex(i, len);
        e = tab[i];
    }
    return null;
}
```
# 6 扩容
ThreadLocalMap 中的 ThreadLocal 的个数超过阈值时，ThreadLocalMap 就要开始扩容了，我们一起来看下扩容的逻辑：
```java
private void resize() {
    // 拿出旧的数组
    Entry[] oldTab = table;
    int oldLen = oldTab.length;
    // 新数组的大小为老数组的两倍
    int newLen = oldLen * 2;
    // 初始化新数组
    Entry[] newTab = new Entry[newLen];
    int count = 0;
    // 老数组的值拷贝到新数组上
    for (int j = 0; j < oldLen; ++j) {
        Entry e = oldTab[j];
        if (e != null) {
            ThreadLocal<?> k = e.get();
            if (k == null) {
                e.value = null; // Help the GC
            } else {
                // 计算 ThreadLocal 在新数组中的位置
                int h = k.threadLocalHashCode & (newLen - 1);
                // 如果索引 h 的位置值不为空，往后+1，直到找到值为空的索引位置
                while (newTab[h] != null)
                    h = nextIndex(h, newLen);
                // 给新数组赋值
                newTab[h] = e;
                count++;
            }
        }
    }
    // 给新数组初始化下次扩容阈值，为数组长度的三分之二
    setThreshold(newLen);
    size = count;
    table = newTab;
}
```
扩容时是绝对没有线程安全问题的，因为 ThreadLocalMap 是线程的一个属性，一个线程同一时刻只能对 ThreadLocalMap 进行操作，因为同一个线程执行业务逻辑必然是串行的，那么操作 ThreadLocalMap 必然也是串行的。
# 7 总结
我们在写中间件的时候经常会用到，比如说流程引擎中上下文的传递，调用链ID的传递等。