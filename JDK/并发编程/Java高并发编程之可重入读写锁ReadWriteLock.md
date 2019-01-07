![](https://img-blog.csdnimg.cn/2021042313262066.JPG?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)


> 了解读写锁吗？

互联网的并发场景大多是读多写少。所以缓存技术使用普遍。JUC也提供了读写锁-ReadWriteLock。

> 那你说说什么是读写锁？

读写锁一般遵循以下设计原则：
- 允许多个线程同时读共享变量
- 只允许一个线程写共享变量
- 如果一个写线程正在执行写操作，此时禁止读线程读共享变量。

> 知道读写锁与互斥锁的区别吗？

读写锁允许多个线程同时读共享变量，而互斥锁不允许。这也是读多写少时读写锁的优势。
读写锁的写是互斥的，当一个线程在写共享变量时，其他线程不允许执行写或读。

> 知道如何使用ReadWriteLock实现一个缓存吗？

声明了一个Cache<K, V>类，其中类型参数K代表缓存里key的类型，V代表缓存里value的类型。

> 你是怎么解决缓存数据的初始化问题的？

这得看源数据量大不大了。

若源数据量不大，采用**一次性加载**，方便简单，在应用启动时把源数据全部查询出来并put()。

若源数据量很大，就得**按需加载**，即懒加载。当应用查询缓存，并且数据不在缓存时，才触发加载源数据进缓存。
代码如下：
![](https://img-blog.csdnimg.cn/20210422174748811.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

高并发下，多线程会竞争写锁。假设缓存为空，若此时有三个线程t1、t2和t3同时调用get()，并且参数相同。则它们会同时执行到代码5处，但此时只有一个线程能够获得写锁，假设是t1。
t1获取写锁后，查询DB并更新缓存，最终释放写锁。此时t2、t3会再有一个线程能够获取写锁，假设t2。若这里不去再次验证，此时t2会再查DB。t2释放写锁后，t3还会查DB。而事实上t2、t3完全没必要再查询DB。所以这里的再次验证很重要，能避免高并发竞争场景下重复查DB。


这里并没有解决缓存数据与源头数据的一致性问题。解决数据一致性问题的一个最简单的方案就是超时：加载进缓存的数据不是长久有效的，而是有时效的，当缓存的数据超过时效，也就是超时之后，这条数据在缓存中就失效了。而访问缓存中失效的数据，会触发缓存重新从源头把数据加载进缓存。

也可以在源头数据发生变化时，快速反馈给缓存，但这个就要依赖具体的场景了。例如MySQL作为数据源头，可以通过近实时地解析binlog来识别数据是否发生了变化，如果发生了变化就将最新的数据推送给缓存。另外，还有一些方案采取的是数据库和缓存的双写方案。

> 说说读写锁的升级与降级？

按需加载的代码中，是否可在第2步下面增加验证并更新缓存的逻辑呢？
如下：
![](https://img-blog.csdnimg.cn/20210422175821172.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

看起来没问题的，先获取读锁，再升级为写锁，这是锁的升级。可惜ReadWriteLock并不支持这种升级。在上面的代码示例中，读锁还没有释放，此时获取写锁，会导致写锁永久等待，最终导致相关线程都被阻塞，永远也没有机会被唤醒。所以读写锁是不支持锁升级的！

但锁的降级是可以的。代码如下：
![](https://img-blog.csdnimg.cn/20210422180421485.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

只有写锁支持条件变量，读锁是不支持条件变量的，读锁调用newCondition()会抛出UnsupportedOperationException异常。