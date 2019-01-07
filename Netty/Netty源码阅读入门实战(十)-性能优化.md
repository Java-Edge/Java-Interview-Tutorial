# 1 性能优化工具类
## 1.1 FastThreadLocal
### 1.1.1 **传统的ThreadLocal**
ThreadLocal最常用的两个接口是set和get
最常见的应用场景为在线程上下文之间传递信息，使得用户不受复杂代码逻辑的影响
```
public void set(T value) {
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
```
```
 t.threadLocals;
```

我们使用set的时候实际上是获取Thread对象的threadLocals属性，把当前ThreadLocal当做参数然后调用其set(ThreadLocal，Object)方法来设值
threadLocals是ThreadLocal.ThreadLocalMap类型的
![Thread、ThreadLoca以及ThreadLocal.ThreadLocalMap的关系](https://upload-images.jianshu.io/upload_images/4685968-9c61866272f5ba66.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
每个线程对象关联着一个ThreadLocalMap实例,主要是维护着一个Entry数组
Entry是扩展了WeakReference，提供了一个存储value的地方
一个线程对象可以对应多个ThreadLocal实例，一个ThreadLocal也可以对应多个Thread对象，当一个Thread对象和每一个ThreadLocal发生关系的时候会生成一个Entry，并将需要存储的值存储在Entry的value内
-  一个ThreadLocal对于一个Thread对象来说只能存储一个值，为Object型
- 多个ThreadLocal对于一个Thread对象，这些ThreadLocal和线程相关的值存储在Thread对象关联的ThreadLocalMap中
- 使用扩展WeakReference的Entry作为数据节点在一定程度上防止了内存泄露
- 多个Thread线程对象和一个ThreadLocal发生关系的时候其实真实数据的存储是跟着线程对象走的，因此这种情况不讨论

我们在看看ThreadLocalMap#set：

```
Entry[] tab = table;
int len = tab.length;
int i = key.threadLocalHashCode & (len-1);

for (Entry e = tab[i];
     e != null;
     e = tab[i = nextIndex(i, len)]) {
    ThreadLocal k = e.get();
    if (k == key) {
        e.value = value;
        return;
    }
    if (k == null) {
        replaceStaleEntry(key, value, i);
        return;
    }
}
tab[i] = new Entry(key, value);
int sz = ++size;
if (!cleanSomeSlots(i, sz) && sz >= threshold)
    rehash();
```
每个ThreadLocal实例都有一个唯一的`threadLocalHashCode`初始值
上面首先根据threadLocalHashCode值计算出i，有下面两种情况会进入for循环：
- 由于`threadLocalHashCode &（len-1）`对应的槽有内容，因此满足tab[i]!=null条件，进入for循环，如果满足条件且当前key不是当前threadlocal只能说明hash冲突了
- ThreadLocal实例之前被设置过，因此满足tab[i]!=null条件，进入for循环

进入for循环会遍历tab数组，如果遇到以当前threadLocal为key的槽，即上面第（2）种情况，有则直接将值替换
如果找到了一个已经被回收的ThreadLocal对应的槽，也就是当key==null的时候表示之前的threadlocal已经被回收了，但是value值还存在，这也是ThreadLocal内存泄露的地方。碰到这种情况，则会引发替换这个位置的动作
如果上面两种情况都没发生，即上面的第（1）种情况，则新创建一个Entry对象放入槽中
```
private Entry getEntry(ThreadLocal key) {
    int i = key.threadLocalHashCode & (table.length - 1);
    Entry e = table[i];
    if (e != null && e.get() == key)
        return e;
    else
        return getEntryAfterMiss(key, i, e);
}
```

当命中的时候，也就是根据当前ThreadLocal计算出来的i恰好是当前ThreadLocal设置的值的时候，可以直接根据hashcode来计算出位置，当没有命中的时候，这里没有命中分为三种情况：
- 当前ThreadLocal之前没有设值过，并且当前槽位没有值。
- 当前槽位有值，但是对于的不是当前threadlocal，且那个ThreadLocal没有被回收。
- 当前槽位有值，但是对于的不是当前threadlocal，且那个ThreadLocal被回收了。

上面三种情况都会调用getEntryAfterMiss方法。调用getEntryAfterMiss方法会引发数组的遍历。

总结一下ThreadLocal的性能，一个线程对应多个ThreadLocal实例的场景中
在没有命中的情况下基本上一次hash就可以找到位置
如果发生没有命中的情况，则会引发性能会急剧下降，当在读写操作频繁的场景，这点将成为性能诟病。
### 1.1.2 实例
![](https://upload-images.jianshu.io/upload_images/4685968-bb0c0176141cde0e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
两个线程操作同一object 对象,显然非线程安全,但是由于使用了 FTL, 线程安全!
![](https://upload-images.jianshu.io/upload_images/4685968-ecd0ffef98c67168.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
结果表明内存地址不同,并非操作同一个 object!
![](https://upload-images.jianshu.io/upload_images/4685968-3eb162c3e74d410c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
让T1每1s 中新生成一个 object 对象
T2验证当前 object 是否与之前状态相同
![](https://upload-images.jianshu.io/upload_images/4685968-75fb90e28f07645f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
显然,每个线程拿到的对象都是线程独享的!
某线程对变量的修改不影响其他线程!
通过对象隔离优化了程序性能!
### 1.1.3 **Netty FastThreadLocal**源码解析
![](https://upload-images.jianshu.io/upload_images/4685968-23c71f987b2e34ae.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 1.1.3.1 创建
![](https://upload-images.jianshu.io/upload_images/4685968-c2448920d6232ee5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
创建时重写一下初始值方法

![](https://upload-images.jianshu.io/upload_images/4685968-fcfeec45c3a4e293.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
实际上在构造FastThreadLocal实例的时候就决定了这个实例的索引
![](https://upload-images.jianshu.io/upload_images/4685968-9242cafbf09cd55c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
index 为 private 且非 static, 说明每个实例都有该值

再看看索引的生成相关代码
![](https://upload-images.jianshu.io/upload_images/4685968-0cd28e7f9fb4ba7d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
index 从0开始计数
![](https://upload-images.jianshu.io/upload_images/4685968-686121f78019a471.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-25b1500bb4a08b3d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
nextIndex是InternalThreadLocalMap父类的一个全局静态的AtomicInteger类型的对象，这意味着所有的FastThreadLocal实例将共同依赖这个指针来生成唯一的索引，而且是线程安全的
Netty重新设计了更快的FastThreadLocal，主要实现涉及
- FastThreadLocalThread
- FastThreadLocal
- InternalThreadLocalMap

FastThreadLocalThread是Thread类的简单扩展，主要是为了扩展threadLocalMap属性
![](https://upload-images.jianshu.io/upload_images/4685968-68540ec98e912c8e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
FastThreadLocal提供的接口和传统的ThreadLocal一致，主要是set和get方法，用法也一致
不同地方在于FastThreadLocal的值是存储在InternalThreadLocalMap这个结构里面的，传统的ThreadLocal性能槽点主要是在读写的时候hash计算和当hash没有命中的时候发生的遍历，我们来看看FastThreadLocal的核心实现


InternalThreadLocalMap实例和Thread对象一一对应
UnpaddedInternalThreadLocalMap维护着一个数组：
![](https://upload-images.jianshu.io/upload_images/4685968-ef086fd158031138.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这个数组用来存储跟同一个线程关联的多个FastThreadLocal的值，由于FastThreadLocal对应indexedVariables的索引是确定的，因此在读写的时候将会发生随机存取，非常快。

另外这里有一个问题，nextIndex是静态唯一的，而indexedVariables数组是实例对象的，因此我认为随着FastThreadLocal数量的递增，这会造成空间的浪费
### 1.1.3.2 get方法实现
#### 获取 ThreadLocalMap
![](https://upload-images.jianshu.io/upload_images/4685968-c5f54a33b87de654.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-851acdfeccef3c93.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7c83b5734348c46a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-750255981769ce82.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
首先拿到当前线程,再判断是否为 FTL 线程快速获取否则慢速获取
- 让我们先分析一下 slowGet方法
![](https://upload-images.jianshu.io/upload_images/4685968-c839379e34b3b152.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
首先会获取一个 ThreadLocal 变量
![](https://upload-images.jianshu.io/upload_images/4685968-632b9a3294996cb8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
拿到 JDK 的 ThreadLocal 变量,用于给每个线程拿到`InternalThreadLocalMap`变量,所以过程较慢,该方法称为 slowGet 可想而知!
![](https://upload-images.jianshu.io/upload_images/4685968-d496eb18cf9752d0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
由于在创建 ThreadLocal 时,并没有重写 initValue 方法,所以可能为 `null`
- 接下啦看 fastGet 方法
![](https://upload-images.jianshu.io/upload_images/4685968-1fd21c51538c85d3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-662492ca753eb6f5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-3f160006e3ebfc7a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a3e5f6eb6435f19e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#### 直接通过索引取出对象
![](https://upload-images.jianshu.io/upload_images/4685968-b0cfcd1813aad206.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0a334b196b85724c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c2ef92b333c2d579.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

通过每个线程独享的 ThreadLocalMap 对象借助在 JVM 中每个 FTL 的唯一索引
## 1.2  轻量级对象池 Recycler
### 1.2.1 Recycler的使用
![](https://upload-images.jianshu.io/upload_images/4685968-f4241ca63191c72b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-4091b79f1714d7c1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
所以不使用 new 而是直接复用
![](https://upload-images.jianshu.io/upload_images/4685968-674cf700f2e0d011.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Netty使用
![](https://upload-images.jianshu.io/upload_images/4685968-3ab14ae41d8032c1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 1.2.2 Recycler的创建
- 创建方式为直接new 一个 Recycler 对象,然后重写 newObject 方法
![](https://upload-images.jianshu.io/upload_images/4685968-6798869bdd5a2112.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)