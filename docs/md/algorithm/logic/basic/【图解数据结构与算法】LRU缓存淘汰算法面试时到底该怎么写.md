# 【图解数据结构与算法】LRU缓存淘汰算法面试时到底该怎么写

链表实现的LRU缓存淘汰算法的时间复杂度O(n)，通过散列表可以将这个时间复杂度降低到O(1)。

Redis有序集合即使用跳表实现，跳表可以看作一种改进版的链表。Redis有序集合不仅使用了跳表，还用到了散列表。

LinkedHashMap也用到了散列表和链表两种数据结构。散列表和链表都是如何组合起来使用的，以及为什么散列表和链表会经常放到一块使用。

## 1 LRU缓存淘汰算法

### 1.1 链表实现LRU

需维护一个按访问时间从大到小有序排列的链表结构。因为缓存大小有限，当缓存空间不够，需淘汰数据时，直接将链表头部结点删除。

当要缓存某数据，先在链表查找这数据：

- 没找到，数据放到链表尾部
- 找到了，就把它移动到链表尾部

因为查找数据需遍历链表，所以单纯用链表实现LRU缓存淘汰算法需O(n)。

#### 缓存（cache）系统的主要操作

- 往缓存中添加一个数据
- 从缓存中删除一个数据
- 在缓存中查找一个数据

都涉及“查找”，如单纯采用链表，只能O(n)。如将散列表和链表组合，可将这三个操作的时间复杂度都降到O(1)。

#### 结构



![](https://codeselect.oss-cn-shanghai.aliyuncs.com/%E6%95%A3%E5%88%97%2B%E5%8F%8C%E5%90%91%E9%93%BE%E8%A1%A8.png)
使用双向链表存储数据，链表中的每个结点除了存储：

- 数据（data）
- 前驱指针（prev）
- 后继指针（next)
- 还新增一个特殊字段hnext

因为通过链表法解决哈希冲突，所以每个结点在两条链中：

- 双向链表
  前驱和后继指针，将结点串在双向链表
- 散列表中的拉链
  hnext指针，将结点串在散列表的拉链

### 1.2 查找

散列表中查找数据的时间复杂度接近O(1)，所以通过散列表，我们可以很快地在缓存中找到一个数据。当找到数据之后，我们还需要将它移动到双向链表的尾部。

### 1.3 删除

需要找到数据所在的结点，然后将结点删除。借助散列表，我们可以在O(1)时间复杂度里找到要删除的结点。因为我们的链表是双向链表，双向链表可以通过前驱指针O(1)时间复杂度获取前驱结点，所以在双向链表中，删除结点只需要O(1)的时间复杂度。

### 1.4 添加

添加数据到缓存稍微有点麻烦，我们需要先看这个数据是否已经在缓存中。如果已经在其中，需要将其移动到双向链表的尾部；如果不在其中，还要看缓存有没有满。如果满了，则将双向链表头部的结点删除，然后再将数据放到链表的尾部；如果没有满，就直接将数据放到链表的尾部。

过程中的查找操作都可通过hash表。所以，这三个操作的时间复杂度都是O(1)。

通过散列表和双向链表的组合使用，实现了一个高效的、支持LRU缓存淘汰算法的缓存系统原型。

## 2 Redis有序集合

在有序集合中，每个成员对象有两个重要的属性，key（键值）和score（分值）。
不仅会通过score来查找数据，还会通过key来查找数据。

举个例子，比如用户积分排行榜有这样一个功能：我们可以通过用户的ID来查找积分信息，也可以通过积分区间来查找用户ID或者姓名信息。这里包含ID、姓名和积分的用户信息，就是成员对象，用户ID就是key，积分就是score。

所以，如果我们细化一下Redis有序集合的操作，那就是下面这样：

- 添加一个成员对象
- 按照键值来删除一个成员对象
- 按照键值来查找一个成员对象
- 按照分值区间查找数据，比如查找积分在[100, 356]之间的成员对象
- 按照分值从小到大排序成员变量；

若仅按分值将成员对象组织成跳表的结构，那按照键删除、查询成员对象就会很慢，解决方法与LRU缓存淘汰算法的解决方法类似。
可再按照键值构建一个散列表，这样按照key来删除、查找一个成员对象的时间复杂度就变成了O(1)。

Redis有序集合的操作还有另外一类，也就是查找成员对象的排名（Rank）或者根据排名区间查找成员对象。这个功能单纯用刚刚讲的这种组合结构就无法高效实现了。

## 3 Java LinkedHashMap

HashMap就是通过hash表这种数据结构实现的。而LinkedHashMap并不仅仅是通过链表法解决散列冲突的。

```java
HashMap<Integer, Integer> m = new LinkedHashMap<>();
m.put(3, 11);
m.put(1, 12);
m.put(5, 23);
m.put(2, 22);

for (Map.Entry e : m.entrySet()) {
  System.out.println(e.getKey());
}
```

上面的代码会按照数据插入的顺序依次来打印。而hash表数据经过hash函数扰乱后是无规律存储的，它是如何实现按照数据的插入顺序来遍历打印的呢？

就是通过hash表和链表组合实现，可支持：

- 按照插入顺序遍历数据
- 按访问顺序遍历数据

你可以看下面这段代码：
![](https://img-blog.csdnimg.cn/5122f6333b8846159ce6d069b78d349b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)打印结果
![](https://img-blog.csdnimg.cn/bd93399936d348099db7d456fe377f37.png)


每次调用 LinkedHashMap#put()添加数据时，都会将数据添加到链尾，前四个操作完成后，链表数据如下：
![](https://img-blog.csdnimg.cn/6416549ba44749fa985aaf68fa63a7b0.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
第二次将键值为3的数据放入到LinkedHashMap时，会先查找该K是否已有，然后，再将已经存在的(3,11)删除，并将新的(3,26)放到链尾。
这个时候链表中的数据就是下面这样：
![](https://img-blog.csdnimg.cn/32c96b385f1c4c0893f153209b156b30.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
访问K=5数据时，将被访问到的数据移动到链尾。此时，链表数据如下：
![](https://img-blog.csdnimg.cn/a8362c3a9fae4f529306f0d79772a729.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

可见，按访问时间排序的LinkedHashMap本身就是个支持LRU缓存淘汰策略的缓存系统。
LinkedHashMap中的“Linked”实际上是指的是双向链表，并非指用链表法解决哈希冲突。

## 4 为啥hash表和链表经常一块使用？

hash表虽支持高效插入、删除、查找，但hash表数据都是通过hash函数打乱后无规律存储。即无法支持按序快速遍历。

如想按序遍历散列表数据，需将散列表中的数据拷贝到数组，然后排序，再遍历。

因为散列表是动态数据结构，不断有数据插入、删除，所以想按顺序遍历散列表数据时，都要先排序，效率很低。为此，就将散列表和链表（或跳表）结合使用。

## 5 手写LRU

```java
public class LRUCache<K, V> extends LinkedHashMap<K, V> {

    private final int CACHE_SIZE;

    // 这里就是传递进来最多能缓存多少数据
    public LRUCache(int cacheSize) {
        //  true指linkedhashmap将元素按访问顺序排序
        super((int) Math.ceil(cacheSize / 0.75) + 1, 0.75f, true);
        CACHE_SIZE = cacheSize;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry eldest) {
        // 当KV数据量大于指定缓存个数时，就自动删除最老数据
        return size() > CACHE_SIZE;
    }

}
```

## 6 FAQ

Q：本文的散列表和链表结合使用的例子用的都是双向链表。若把双向链表改单链表，还正常工作吗？

删除一个元素时，虽 O(1) 找到目标结点，但要删除该结点需拿到前一个结点的指针，遍历到前一个结点复杂度会变为 O(N），所以用双链表实现比较合适。（硬要操作的话，单链表也可实现 O(1) 时间复杂度删除结点的）。

Q：假设有 10 万名猎头，每个猎头都可做任务（如发布职位）积累积分，然后通过积分下载简历。咋在内存存储这 10 万个猎头 ID 和积分信息，支持如下操作：

- 根据猎头的 ID 快速查找、删除、更新这个猎头的积分信息
- 查找积分在某个区间的猎头 ID 列表
- 查找按照积分从小到大排名在第 x 位到第 y 位之间的猎头 ID 列表

A：以积分排序构建一个跳表，再以猎头 ID 构建一个散列表：

- ID 在散列表中所以可以 O(1) 查找到这个猎头
- 积分以跳表存储，跳表支持区间查询
- 这点根据目前学习的知识暂时无法实现