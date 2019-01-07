Google开源的Java重用工具集库Guava里的一款缓存工具，实现的缓存功能：
- 自动将entry节点加载进缓存结构
- 当缓存的数据超过设置的最大值时，使用LRU移除
- 具备根据entry节点上次被访问或者写入时间计算它的过期机制
- 缓存的key被封装在WeakReference引用内
- 缓存的Value被封装在WeakReference或SoftReference引用内
- 统计缓存使用过程中命中率、异常率、未命中率等统计数据

Guava Cache架构设计源于ConcurrentHashMap，简单场景下可自行编码通过HashMap做少量数据的缓存。
但若结果可能随时间改变或希望存储的数据空间可控，最好自己实现这种数据结构。

使用多个segments方式的细粒度锁，在保证线程安全的同时，支持高并发场景需求。
Cache类似Map，是存储K.V对的集合，不过它还需处理evict、expire、dynamic load等算法逻辑，需要一些额外信息实现这些操作，需做方法与数据的关联封装。
## Guava Cache数据结构
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMjVhY2JjYzk3NGJlYjk0MS5wbmc?x-oss-process=image/format,png)
Cache由多个Segment组成，而每个Segment包含一个ReferenceEntry数组：

```java
volatile @MonotonicNonNull AtomicReferenceArray<ReferenceEntry<K, V>> table;
```
每个ReferenceEntry数组项都是一条ReferenceEntry链。
![](https://img-blog.csdnimg.cn/8088871d635349d88e7bd52e5f795d08.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_Q1NETiBASmF2YUVkZ2Uu,size_16,color_FFFFFF,t_70,g_se,x_16)

一个ReferenceEntry包含key、hash、value Reference、next字段，除了在ReferenceEntry数组项中组成的链。

ReferenceEntry可以是强引用类型的key，也可以WeakReference类型的key，为了减少内存使用量，还可以根据是否配置了expireAfterWrite、expireAfterAccess、maximumSize来决定是否需要write链和access链确定要创建的具体Reference：StrongEntry、StrongWriteEntry、StrongAccessEntry、StrongWriteAccessEntry等。
### ReferenceEntry接口
![](https://img-blog.csdnimg.cn/a16a7a0d4a2a49b9ab33ca85c09e666d.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_Q1NETiBASmF2YUVkZ2Uu,size_16,color_FFFFFF,t_70,g_se,x_16)

引用 map 中的节点。
map 中的节点可处于如下状态：
有效的：
- Live：设置了有效的键/值
- Loading：加载中

无效的：
- Expired：时间已过（键/值仍可设置）
- Collected：键/值已部分收集，但尚未清理
- Unset：标记为未设置，等待清理或重用

### ValueReference
Value的引用
![](https://img-blog.csdnimg.cn/96d7ae6da2c34356848e23e801ccd85f.png)

之所以用Reference命令，是因为Cache要支持：
- WeakReference K
- SoftReference、WeakReference V


**ValueReference** 因为Cache支持强引用的Value、SoftReference Value以及WeakReference Value，因而它对应三个实现类：StrongValueReference、SoftValueReference、WeakValueReference。
为了支持动态加载机制，它还有一个LoadingValueReference，在需要动态加载一个key的值时，先把该值封装在LoadingValueReference中，以表达该key对应的值已经在加载了，如果其他线程也要查询该key对应的值，就能得到该引用，并且等待改值加载完成，从而保证该值只被加载一次，在该值加载完成后，将LoadingValueReference替换成其他ValueReference类型。ValueReference对象中会保留对ReferenceEntry的引用，这是因为在Value因为WeakReference、SoftReference被回收时，需要使用其key将对应的项从Segment的table中移除。

### Queue
在一个Segment中，所有ReferenceEntry还组成：
- access链（accessQueue）
- write链（writeQueue）

为了实现LRU，Guava Cache在Segment中添加的这两条链，都是双向链表，通过ReferenceEntry中的如下链接而成：
- `previousInWriteQueue`
- `nextInWriteQueue`
- `previousInAccessQueue`
- `nextInAccessQueue`
#### WriteQueue
![](https://img-blog.csdnimg.cn/e8080405487b4cab8a7898dce01d9486.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_Q1NETiBASmF2YUVkZ2Uu,size_13,color_FFFFFF,t_70,g_se,x_16)
#### AccessQueue
![](https://img-blog.csdnimg.cn/c8127cb7a26348da8490fab748749bf4.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_Q1NETiBASmF2YUVkZ2Uu,size_13,color_FFFFFF,t_70,g_se,x_16)

WriteQueue和AccessQueue都自定义了offer、peek、remove、poll等操作：
![](https://img-blog.csdnimg.cn/1cec317938ad4ca0ad54ee1e825eb391.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_Q1NETiBASmF2YUVkZ2Uu,size_10,color_FFFFFF,t_70,g_se,x_16)
offer操作，若是：
- 新增节点
直接加到该链的结尾
- 已存在的节点
将该节点链接的链尾

remove操作：
直接从该链中移除该节点

poll操作：
将头节点的下一个节点移除，并返回。

## 缓存相关操作
## Segment的evict清除策略
在每次调用操作的开始和结束时触发清理工作，这样比一般的缓存另起线程监控清理相比，可减少开销。
但若长时间没有调用方法，会导致不能及时清理释放内存空间。

evict主要处理四个Queue：
- keyReferenceQueue
- valueReferenceQueue
- writeQueue
- accessQueue

前两个queue是因为WeakReference、SoftReference被垃圾回收时加入的，清理时只需遍历整个queue，将对应项从LocalCache移除即可：
- keyReferenceQueue存放ReferenceEntry
- valueReferenceQueue存放的是ValueReference

要从Cache中移除需要有key，因而ValueReference需要有对ReferenceEntry的引用。

后两个Queue，只需检查是否配置了相应的expire时间，然后从头开始查找已经expire的Entry，将它们移除。

Segment中的put操作：put操作相对比较简单，首先它需要获得锁，然后尝试做一些清理工作，接下来的逻辑类似ConcurrentHashMap中的rehash，查找位置并注入数据。需要说明的是当找到一个已存在的Entry时，需要先判断当前的ValueRefernece中的值事实上已经被回收了，因为它们可以是WeakReference、SoftReference类型，如果已经被回收了，则将新值写入。并且在每次更新时注册当前操作引起的移除事件，指定相应的原因：COLLECTED、REPLACED等，这些注册的事件在退出的时候统一调用Cache注册的RemovalListener，由于事件处理可能会有很长时间，因而这里将事件处理的逻辑在退出锁以后才做。最后，在更新已存在的Entry结束后都尝试着将那些已经expire的Entry移除。另外put操作中还需要更新writeQueue和accessQueue的语义正确性。

Segment带CacheLoader的get操作
```java
V get(K key, int hash, CacheLoader<? super K, V> loader) throws ExecutionException {
      checkNotNull(key);
      checkNotNull(loader);
      try {
        if (count != 0) { // read-volatile
          // don't call getLiveEntry, which would ignore loading values
          ReferenceEntry<K, V> e = getEntry(key, hash);
          if (e != null) {
            long now = map.ticker.read();
            V value = getLiveValue(e, now);
            if (value != null) {
              recordRead(e, now);
              statsCounter.recordHits(1);
              return scheduleRefresh(e, key, hash, value, now, loader);
            }
            ValueReference<K, V> valueReference = e.getValueReference();
            if (valueReference.isLoading()) {
              return waitForLoadingValue(e, key, valueReference);
            }
          }
        }

        // at this point e is either null or expired;
        return lockedGetOrLoad(key, hash, loader);
      } catch (ExecutionException ee) {
        Throwable cause = ee.getCause();
        if (cause instanceof Error) {
          throw new ExecutionError((Error) cause);
        } else if (cause instanceof RuntimeException) {
          throw new UncheckedExecutionException(cause);
        }
        throw ee;
      } finally {
        postReadCleanup();
      }
    }
```
1\. 先查找table中是否已存在没有被回收、也没有expire的entry，如果找到，并在CacheBuilder中配置了refreshAfterWrite，并且当前时间间隔已经操作这个事件，则重新加载值，否则，直接返回原有的值
2\. 如果查找到的ValueReference是LoadingValueReference，则等待该LoadingValueReference加载结束，并返回加载的值
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTA3ZTRkNDY4NmQzMTJjMWIucG5n?x-oss-process=image/format,png)
3\. 如果没有找到entry，或者找到的entry的值为null，则加锁后，继续在table中查找已存在key对应的entry，如果找到并且对应的entry.isLoading()为true，则表示有另一个线程正在加载，因而等待那个线程加载完成，如果找到一个非null值，返回该值，否则创建一个LoadingValueReference
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTRlNDgyZjczMjRiMjdkZGEucG5n?x-oss-process=image/format,png)
并调用loadSync加载相应的值
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQwOGM0ODUzYmExYmE1MGQucG5n?x-oss-process=image/format,png)
在加载完成后，将新加载的值更新到table中，即大部分情况下替换原来的LoadingValueReference
# CacheBuilder
提供Builder模式的CacheBuilder生成器来创建缓存。
各个缓存参数的配置设置，类似函数式编程，可自行设置各类参数选型。

```java
Cache<String,String> cache = CacheBuilder.newBuilder() 		
	.maximumSize(1024)
	.expireAfterWrite(60,TimeUnit.SECONDS)
	.weakValues() .build(); 

cache.put("word","Hello Guava Cache"); 
System.out.println(cache.getIfPresent("word"));
```

它提供三种方式加载到缓存：
1.  在构建缓存的时候，使用build方法内部调用CacheLoader方法加载数据；
2.  callable 、callback方式加载数据；
3. 直接Cache.put 加载数据，但自动加载是首选的，因为它更容易推断所有缓存内容的一致性

build生成器的两种方式都实现了一种逻辑：
`从缓存中取key的值，如果该值已经缓存过了则返回缓存中的值，如果没有缓存过可以通过某个方法来获取这个值`。

### CacheLoader
针对整个cache定义的，可认为是统一的根据K值load V的方法：
```java
/**
 * CacheLoader
 */
public void loadingCache() {
    LoadingCache<String, String> graphs = CacheBuilder.newBuilder()
            .maximumSize(1000)
            .build(new CacheLoader<String, String>() {
                @Override
                public String load(String key) {
                    if ("key".equals(key)) {
                        return "key return result";
                    } else {
                        return "get-if-absent-compute";
                    }
                }
            });
    String resultVal = null;
    try {
        resultVal = graphs.get("key");
    } catch (ExecutionException e) {
        e.printStackTrace();
    }
}
```
### callable
较为灵活，允许你在get的时候指定load方法

```java
/**
 *
 * Callable
*/
public void callablex() throws ExecutionException
 {
   Cache<String, String> cache = CacheBuilder.newBuilder()
     .maximumSize(1000).build();
   String result = cache.get("key", new Callable<String>()
    {
      public String call()
      {
       return "result";
      }
    });
  System.out.println(result);
 }
```
# 总结
Guava Cache基于ConcurrentHashMap的设计，在高并发场景支持和线程安全上都有相应改进策略，使用Reference引用命令，提升高并发下的数据访问速度并保持了GC的可回收，有效节省空间。

write链和access链的设计，能更灵活、高效的实现多种类型的缓存清理策略，包括基于容量的清理、基于时间的清理、基于引用的清理等。

编程式的build生成器管理，让使用者有更多的自由度，能够根据不同场景设置合适的模式。

还可以显式清除、统计信息、移除事件的监听器、自动加载等功能。