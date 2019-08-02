#1 同步容器类
同步容器类包括Vector和HashTable，二者是早期JDK一部分，此外还包括在JDK 1.2中添加的一些功能相似的类，这些的同步封装器类是由Collections.synchronizedXxx等工厂方法创建的。这些类实现线程安全的方式是：将他们的状态封装起来，并对每个共有方法进行同步，使得每次只有一个线程能访问容器的状态。
## 1.1 同步容器类的问题
同步容器类都是线程安全的，但在某些情况可能需额外客户端加锁来保护复合操作。
容器上常见的复合操作包括：

- 迭代(反复访问元素，直到遍历完容器中所有元素)
- 跳转(根据指定顺序找到当前元素的下一个元素)以及条件运算

在同步容器类中，这些复合操作在没有客户端加锁的情况下，仍是线程安全的，
但当其他线程并发的修改容器时，他们可能会表现出意料之外的行为。
# 2 并发容器
Java5提供了多种并发容器来改进同步容器的性能。

同步容器将所有对容器状态的访问都串行化，以实现他们的线程安全性。
这种方法的代价是严重降低并发性，当多个线程竞争容器的锁时，吞吐量将严重降低。

并发容器是针对多个线程并发访问设计的。在Java 5中增加了

- ConcurrentHashMap，用来替代同步且基于散列的Map，增加了对一些常见符合操作的支持，例如“若没有则添加”、替换以及有条件删除等。
- CopyOnWriteArrayList，用于在遍历操作为主要操作的情况下代替同步的List。


![](https://upload-images.jianshu.io/upload_images/4685968-8f68228c343b71ef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
copyOnWriteArrayList 和 copyOnWriteSet 一开始都共享同一个内容，当想要修改内容时,才会真正的把内容 copy 出去,形成一个新的内容后再改
比如：当我们往一个容器添加元素时，不直接往当前容器添加，而是先将容器进行 copy，复制出一个新容器，再往新容器里加元素。添加完之后，再将原容器引用指向新容器。
好处:对 copyOnWrite 容器进行并发读时,不需要加锁,因为当前容器不会增加新元素,读写分离 
`copyOnWriteArrayList#add`要加锁,否则多线程时会 copy N 个副本
 copyOnWrite 适合于`读多写少`场景，但只能保证数据最终一致性,不保证实时一致性
若你希望写入马上被读到，不要用 copyOnWrite 容器 

**通过并发容器来代替同步容器，可以极大地提供伸缩性并降低风险。**
## 2.1 CocurrentHashMap
同步容器在执行每个操作期间都持有一个锁。在一些操作中，例如`HashMashMap.get`或`List.contains`，可能包含大量的工作：当遍历散列桶或链表来查找某个特定的对象时，必须在许多元素上调用equals。在基于散列的容器中，如果hashCode不能很均匀的分布散列值，那么容器中的元素就不会均匀的分布在整个容器中。某些情况下，某个糟糕的散列函数还会把一个散列表变成线性链表。当遍历很长的链表并且在某些或者全部元素上调用equals方法时，会花费很长时间，而其他线程在这段时间内都不能访问容器。

ConcurrentHashMap使用一种粒度更细的称为分段锁的机制来实现更大程度的共享.
在这种机制中，任意数量的读取线程可以并发的访问Map，执行读操作的线程和执行写操作的线程可以并发的访问Map，并且一定数量的写线程可以并发的修改Map.

ConcurrentHashMap与其他并发容器一起增强了同步容器:迭代器不会抛出ConcurrentModificationException,因此迭代过程无需加锁.
其迭代器具有"弱一致性",而并非"及时失败".可以容忍并发的修改,当创建迭代器时会遍历已有的元素,并可以(但不保证)在迭代器被构造后将修改操作反映给容器.

只有当需要加锁Map以进行独占访问时,才应该放弃使用ConcurrentHashMap.
## 2.2 额外的原子Map操作
由于ConcurrentHashMap不能被加锁来执行独占访问,因此 无法使用客户端加锁来创建新的原子操作.
一些常见的复合操作,eg."若没有则添加","若相等则移除"等,都已经实现为原子操作并且在ConcurrentMap接口中声明,如下面代码所示.

```
public interface ConcurrentMap<K, V> extends Map<K, V> {
     //仅当K没有相应的映射值时才插入
	 V putIfAbsent(K key, V value);
	 
     //仅当K被映射到V时才移除
     boolean remove(Object key, Object value);
     
	 //仅当K被映射到oldValue时才替换为newValue
	 boolean replace(K key, V oldValue, V newValue);
	 
	 //仅当K被映射到某个值时才被替换为newValue
	  V replace(K key, V value);
}
```



































































