简单来说，这个类用于在多线程情况下的求和。
![官方文档的说明](https://upload-images.jianshu.io/upload_images/4685968-06c72cfbe4dc4230.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

从关键方法
#add
![](https://upload-images.jianshu.io/upload_images/4685968-bad92d53219ce616.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
包含了一个Cell数组，`Striped64`的一个内部类
![](https://upload-images.jianshu.io/upload_images/4685968-d2d7d1ed29af4dc0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
`Padded variant of AtomicLong supporting only raw accesses plus CAS`
即`AtomicLong`的填充变体且只支持原始访问和CAS
有一个value变量，并且提供了一个cas方法更新value值

接下来看第一个if语句，这句首先判断cells是否还没被初始化，并且尝试对value值进行cas操作。如果cells已经初始化并且cas操作失败，则运行if内部的语句。在进入第一个if语句之后紧接着是另外一个if，这个if有4个判断：cell[]数组是否初始化；cell[]数组虽然初始化了但是数组长度是否为0；该线程所对应的cell是否为null；尝试对该线程对应的cell单元进行cas更新是否失败，如果这些条件有一条为true，则运行最为核心的方法longAccumulate，下面列出这个方法，为了便于理解，直接将对其的分析写为注释。
![JavaDoc](https://upload-images.jianshu.io/upload_images/4685968-9d6da5cb49142c38.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
/**
  * 处理涉及初始化，调整大小，创建新Cell，和/或争用的更新案例
  *
  * @param x 值
  * @param fn 更新方法
  * @param wasUncontended 调用
  */
 final void longAccumulate(long x, LongBinaryOperator fn, boolean wasUncontended) {
     int h;
     // 获取线程probe的值
     if ((h = getProbe()) == 0) {
         // 值为0则初始化
         ThreadLocalRandom.current(); //强制初始化
         h = getProbe();
         wasUncontended = true;
     }
     boolean collide = false;                // True if last slot nonempt
     for (;;) {
         Cell[] as; Cell a; int n; long v;
         // 这个if分支处理上述四个条件中的前两个相似，此时cells数组已经初始化了并且长度大于0
         if ((as = cells) != null && (n = as.length) > 0) {
             // 线程对应的cell为null
             if ((a = as[(n - 1) & h]) == null) {
                 // 如果busy锁未被占有
                 if (cellsBusy == 0) {       // Try to attach new Cell
                     // 新建一个cell
                     Cell r = new Cell(x);   // Optimistically create
                     // 检测busy是否为0,并且尝试锁busy
                     if (cellsBusy == 0 && casCellsBusy()) {
                         boolean created = false;
                         try {               // Recheck under lock
                             Cell[] rs; int m, j;
                             //再次确认线程probe所对应的cell为null，将新建的cell赋值
                             if ((rs = cells) != null &&
                                 (m = rs.length) > 0 &&
                                 rs[j = (m - 1) & h] == null) {
                                 rs[j] = r;
                                 created = true;
                             }
                         } finally {
                             // 解锁
                             cellsBusy = 0;
                         }
                         if (created)
                             break;
                         //如果失败，再次尝试
                         continue;           // Slot is now non-empty
                     }
                 }
                 collide = false;
             }
             //置为true后交给循环重试
             else if (!wasUncontended)       // CAS already known to fail
                 wasUncontended = true;      // Continue after rehash
             //尝试给线程对应的cell update
             else if (a.cas(v = a.value, ((fn == null) ? v + x :
                                          fn.applyAsLong(v, x))))
                 break;
             else if (n >= NCPU || cells != as)
                 collide = false;            // At max size or stale
             else if (!collide)
                 collide = true;
             //在以上条件都无法解决的情况下尝试扩展cell
             else if (cellsBusy == 0 && casCellsBusy()) {
                 try {
                     if (cells == as) {      // Expand table unless stale
                         Cell[] rs = new Cell[n << 1];
                         for (int i = 0; i < n; ++i)
                             rs[i] = as[i];
                         cells = rs;
                     }
                 } finally {
                     cellsBusy = 0;
                 }
                 collide = false;
                 continue;                   // Retry with expanded table
             }
             h = advanceProbe(h);
         }
         //此时cells还未进行第一次初始化，进行初始化
         else if (cellsBusy == 0 && cells == as && casCellsBusy()) {
             boolean init = false;
             try {                           // Initialize table
                 if (cells == as) {
                     Cell[] rs = new Cell[2];
                     rs[h & 1] = new Cell(x);
                     cells = rs;
                     init = true;
                 }
             } finally {
                 cellsBusy = 0;
             }
             if (init)
                 break;
         }
         //busy锁不成功或者忙，则再重试一次casBase对value直接累加
         else if (casBase(v = base, ((fn == null) ? v + x :
                                     fn.applyAsLong(v, x))))
             break;                          // Fall back on using base
     }
 }
  /**
   * Spinlock (locked via CAS) used when resizing and/or creating Cells.
   * 通过cas实现的自旋锁，用于扩大或者初始化cells
   */
  transient volatile int cellsBusy;
```
从以上分析来看，`longAccumulate`就是为了尽量减少多个线程更新同一个value，实在不行则扩大cell

`LongAdder`减少冲突的方法以及在求和场景下比`AtomicLong`更高效。
因为`LongAdder`在更新数值时并非对一个数进行更新，而是分散到多个cell，这样在多线程的情况下可以有效的嫌少冲突和压力，使得更加高效。
# 使用场景
适用于统计求和计数的场景，因为它提供了`add`、`sum`方法
# [](http://blog.jerkybible.com/2018/01/11/Java%E5%B9%B6%E5%8F%91%E6%BA%90%E7%A0%81%E4%B9%8BLongAdder/#LongAdder%E6%98%AF%E5%90%A6%E8%83%BD%E5%A4%9F%E6%9B%BF%E6%8D%A2AtomicLong "LongAdder是否能够替换AtomicLong")LongAdder是否能够替换AtomicLong

从上面的分析来看是不行的，因为`AtomicLong`提供了很多cas方法，例如`getAndIncrement`、`getAndDecrement`等，使用起来非常的灵活，而`LongAdder`只有`add`和`sum`，使用起来比较受限。
优点:由于 JVM 会将 64位的double,long 型变量的读操作分为两次32位的读操作,所以低并发保持了 AtomicLong性能,高并发下热点数据被 hash 到多个 Cell,有限分离,通过分散提升了并行度
但统计时有数据更新,也可能会出现数据误差,但高并发场景有限使用此类,低时还是可以继续 AtomicLong
