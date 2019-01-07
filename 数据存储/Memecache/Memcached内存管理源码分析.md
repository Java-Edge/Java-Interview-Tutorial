# 版本
1.4.20
# 1 模型分析
memcached内存管理的模型与作业本“画格子给我们往格子里面写字”的逻辑很像，一个个作业本就是我们的内存空间，而我们往里写的字就是我们要存下来的数据，所以分析的时候可以想像一下用方格作业本写字的情景
## 1.1 重要的概念
### 1.1.1 slab、chunk
`slab`是一块内存空间，默认大小为1M，而memcached会把一个`slab`分割成一个个`chunk`
比如说1M的`slab`分成两个0.5M的`chunk`，所以说`slab`和`chunk`其实都是代表实质的内存空间，`chunk`只是把slab分割后的更小的单元而已。
`slab`就相当于作业本中的“页”，而`chunk`则是把一页画成一个个格子中的“格”
### 1.1.2 item
item是我们要保存的数据，例如
![](https://upload-images.jianshu.io/upload_images/4685968-4522ffb2003d941e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
代表我们把一个key，value键值对保存在内存中0秒，那么上述中的”key”, “value”, 0这些数据实质都是我们要Memcached保存下来的数据， Memcached会把这些数据打包成一个item，这个item其实是Memcached中的一个结构体（当然结构远不止上面提到的三个字段这么简单），把打包好的item保存起来，完成工作。而item保存在哪里？其实就是上面提到的”chunk”，一个item保存在一个chunk中。

chunk是实质的内存空间，item是要保存的东西，所以关系是：item是往chunk中塞的。

item就是相当于我们要写的“字”，把它写到作业本某一“页（slab）”中的“格子（chunk）”里。

### 1.1.3 slabclass
我们要把这个1M的slab割成多少个chunk？就是一页纸，要画多少个格子？

我们往chunk中塞item的时候，item总不可能会与chunk的大小完全匹配吧，chunk太小塞不下或者chunk太大浪费了怎么办？就是我们写字的时候，格子太小，字出界了，或者我们的字很小写在一个大格子里面好浪费。

所以Memcached的设计是，我们会准备“几种slab”，而不同一种的slab分割的chunk的大小不一样，也就是说根据“slab分割的chunk的大小不一样”来分成“不同的种类的slab”，而 slabclass就是“slab的种类”

假设我们现在有很多张A4纸，有些我们画成100个格子，有些我们画成200个格子，有些300…。
我们把画了相同个格子（也相同大小）的纸钉在一起，成为一本本“作业本”，每本“作业本”的格子大小都是一样的，不同的“作业本”也代表着“画了不同的大小格子的A4纸的集合”，而这个作业本就是slabclass啦！

所以当你要写字（item）的时候，你估一下你的字有多“大”，然后挑一本作业本（slabclass），在某一页（slab）空白的格子（chunk）上写。

每个slabclass在memcached中都表现为一个结构体，里面会有个指针，指向它的那一堆slab。

**2）对上面的概念有了个感性的认识了，我们来解剖memcached中比较重要的结构体和变量：**

**a）slabclass_t（即上面说到的slabclass类型）**

```
typedef struct {
    //chunk的大小 或者说item的大小
    unsigned int size;  

    //每个slab有多少个item，slab又称“页”
    unsigned int perslab;

    /**
    当前slabclass的空闲item链表，也是可用item链表，当前slabclass一切可以用的内存空间都在此，
    这里是内存分配的入口，分配内存的时候都是在这个链表上挤一个出去。
    ps：memcached的新版本才开始把slots作为“所有空闲的item链接”的用途，以前的版本slots链表保存的是“回收的item”的意思，
    而旧版本新分配的slab，是用end_page_ptr指针及end_page_free来控制，此版本已不用。
    */
    void *slots;

    //当前slabclass还剩多少空闲的item，即上面的slots数
    unsigned int sl_curr; 
    
    //这个slabclass分配了多少个slab了
    unsigned int slabs;  
    /**
    下面slab_list和lisa_size的解析：
    slab_list是这个slabclass下的slabs列表，逻辑上是一个数组，每个元素是一个slab指针。
    list_size是slab_list的元素个数。
    注意这个list_size和上面的slabs的不同：
        由于slab_list是一个空间大小固定的数组，是数组！而list_size是这个数组元素的个数，代表slab_list的空间大小。
        slabs代表已经分配出去的slabs数，list_size则代表可以有多少个slabs数
        所以当slabs等于list_size的时候代表这个slab_list已经满了，得增大空间。
    */
    void **slab_list;
    unsigned int list_size;
    unsigned int killing; /* index+1 of dying slab, or zero if none */
    size_t requested; /* The number of requested bytes */
} slabclass_t;
```
再重点解析一个字段：slot

回想我们的作业本，写字的时候只需要知道作业本中的下一个空白格子在哪里然后写上去即可，因为用作业本写字是有规律的，总是从第一页第一行左边开始往右写，所以已经用的格子总是连续的。

旧版本的memcached也是用这种思路，每个slabclass保存着一个指向下一个空白chunk的指针的变量（end_page_ptr），但memcached内存管理和写作业很不一样的地方在于，memcached里面保存的item是会过期的，而且每个item的过期时间都很可能不一样，也就是说作业本里面有些字会过期，过期之后相应的空格可以回收并再次利用，由于这些回收的item是不连续的，所以旧版本的memcached把每个slabclass中过期的item串成一个链表，而每个slabclass中的slot就是它相应的被回收的item链表。所以旧版本的memcached在分配内存空间的时候，先去slot找有没有回收的item，没有的话再去end_page_ptr找到下一个新的可用的空白的chunk。

新版本的memcached包括现在分析的1.4.20版本，memcached把旧版本end_page_ptr去掉，把新的可用的chunk也整合到slot中，也就是说slot的定义由“回收的item”变为“空闲可用的item”，每当我们新开辟一个slab并把它分割成一个个chunk的时候，同时马上把这些chunk先初始化成有结构的item（item是一个结构体），只是这个item的用户数据字段为空，待填充状态，称这些item为”free的item”，并把这些free的item串成链表保存在slot中。而旧的item过期了，回收了，也变成”free的item”，也同样插入到这个slot链表中。所以在新版本memcached中slabclass的slot的概念是指“空闲的item链表”！虽然这时内存分配的逻辑没有旧版本那样像作业本的思路那么形象，但代码和逻辑都变得更纯粹了，每次要分配内存，只需要直接从slot链表中拿一个出去即可。

memcached在启动的时候会实例化几本“作业本”：

```
static slabclass_t slabclass[MAX_NUMBER_OF_SLAB_CLASSES];
```

slabclass[i]就是一本”作业本”，i理解为作业本的id。

**b）item结构体**
```
typedef struct _stritem {
    struct _stritem *next; //链表中下一个，这个链表有可能是slots链表，也有可能是LRU链表，但一个item不可能同时这两个链表中，所以复用一个指针。
    struct _stritem *prev; //链表中上一个。
    struct _stritem *h_next;  //相同hash值中链表的下一个。
    rel_time_t time;   //最近访问时间
    rel_time_t exptime;  //过期时间
    int nbytes;  //value的字节数
    unsigned short refcount; //引用计数
    uint8_t nsuffix;  //后缀长度
    uint8_t it_flags;  //标记
    uint8_t slabs_clsid;  //item所在的slabclass的id值
    uint8_t nkey; //键长
    /* this odd type prevents type-punning issues when we do
     * the little shuffle to save space when not using CAS. */
    union {
        uint64_t cas;
        char end;
    } data[]; //数据，这个数据不仅仅包括key对应的value，还有key、CAS、后缀等等数据也存在此，所以它有4部分“拼”成：CAS(可选)，KEY，后缀，VALUE。
    /* if it_flags & ITEM_CAS we have 8 bytes CAS */
    /* then null-terminated key */
    /* then " flags length\r\n" (no terminating null) */
    /* then data with terminating \r\n (no terminating null; it's binary!) */
} item;
```
#### head变量和tail变量
使用内存保存数据总会有满的情况，满就得淘汰，而memcached中的淘汰机制是LRU，所以每个slabclass都保存着一个LRU队列
head[i]和tail[i]则就是`id = i` 的slabclass LRU队列的头尾，尾部的item是最应该淘汰的项，也就是最近最少使用的项
![](https://upload-images.jianshu.io/upload_images/4685968-6c862aa7dc970031.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
**3）下面结合下面的结构图对memcached内存分配的模型进行解说：**
- 初始化slabclass数组，每个元素slabclass[i]都是不同size的slabclass
- 每开辟一个新的slab，都会根据所在的slabclass的size来分割chunk，分割完chunk之后，把chunk空间初始化成一个个free item，并插入到slot链表中
- 每使用一个free item都会从slot链表中删除掉并插入到LRU链表相应的位置
- 每当一个used item被访问的时候都会更新它在LRU链表中的位置，以保证LRU链表从尾到头淘汰的权重是由高到低的
- 会有另一个叫“item爬虫”的线程慢慢地从LRU链表中去爬，把过期的item淘汰掉然后重新插入到slot链表中（但这种方式并不实时，并不会一过期就回收）
- 当我们要进行内存分配时，例如一个set命令，它的一般步骤是
    - 计算出要保存的数据的大小，然后选择相应的slabclass进入下面处理：
首先，从相应的slabclass LRU链表的尾部开始，尝试找几次（默认5次），看看有没有过期的item（虽然有item爬虫线程在帮忙查找，但这里分配的时候，程序还是会尝试一下自己找，自己临时充当牛爬虫的角色），如果有就利用这个过期的item空间。
如果没找到过期的，则尝试去slot链表中拿空闲的free item。
如果slot链表中没有空闲的free item了，尝试申请内存，开辟一块新的slab，开辟成功后，slot链表就又有可用的free item了。
如果开不了新的slab那说明内存都已经满了，用完了，只能淘汰，所以用LRU链表尾部找出一个item淘汰之，并作为free item返回

# 2 代码实现
从函数item_alloc说起，上一篇状态机文中也提到，如果是SET命令最终会来到item_alloc函数执行内存分配的工作，我们看下它的代码：
```
item *item_alloc(char *key, size_t nkey, int flags, rel_time_t exptime, int nbytes) {
    item *it;
    it = do_item_alloc(key, nkey, flags, exptime, nbytes, 0); //调用do_item_alloc
    return it;
}
/**
item分配
把这个函数弄清楚，基本就把memcached内存管理机制大体弄清楚了。
*/
item *do_item_alloc(char *key, const size_t nkey, const int flags,
                    const rel_time_t exptime, const int nbytes,
                    const uint32_t cur_hv) {
    uint8_t nsuffix;
    item *it = NULL;
    char suffix[40];
    size_t ntotal = item_make_header(nkey + 1, flags, nbytes, suffix, &nsuffix); //item总大小
    if (settings.use_cas) {
        ntotal += sizeof(uint64_t); //如果有用到cas 那么item大小还要加上unit64_t的size
    }
    unsigned int id = slabs_clsid(ntotal); //根据item大小，找到适合的slabclass
    if (id == 0)
        return 0;
    mutex_lock(&cache_lock); //cache锁
    /* do a quick check if we have any expired items in the tail.. */
    /* 准备分配新的item了，随便快速瞄一下lru链表末尾有没有过期item，有的话就用过期的空间 */
    int tries = 5;
    int tried_alloc = 0;
    item *search;
    void *hold_lock = NULL;
    rel_time_t oldest_live = settings.oldest_live;
    search = tails[id]; //这个tails是一个全局变量，tails[xx]是id为xx的slabclass lru链表的尾部
    //从LRU链表尾部（就是最久没使用过的item）开始往前找
    for (; tries > 0 && search != NULL; tries--, search=search->prev) {
        if (search->nbytes == 0 && search->nkey == 0 && search->it_flags == 1) {
            /* We are a crawler, ignore it. */
            /*
                这里注释意思是说我们现在是以爬虫的身份来爬出过期的空间，
                像爬到这种异常的item，就别管了，不是爬虫要做的事，不要就行了。
             */
            tries++;
            continue;
        }
        /**
        你会看到很多地方有下面这个hv，在这先简单说下，也可先略过，其实它是对item的一个hash，得到hv值，这个hv主要有两个
        作用：
        1）用于hash表保存item，通过hv计算出哈希表中的桶号
        2）用于item lock表中锁住item，通过hv计算出应该用item lock表中哪个锁对当前item进行加锁
        这两者都涉及到一个粒度问题，不可能保证每个不一样的key的hv不会相同，所有hash方法都可能
        出现冲突。
        所以hash表中用链表的方式处理冲突的item，而item lock表中会多个item共享一个锁，或者说
        多个桶共享一个锁。
        */
        uint32_t hv = hash(ITEM_key(search), search->nkey);
        /* Attempt to hash item lock the "search" item. If locked, no
         * other callers can incr the refcount
         */
        /* Don't accidentally grab ourselves, or bail if we can't quicklock */
         /**
         尝试去锁住当前item。
         */
        if (hv == cur_hv || (hold_lock = item_trylock(hv)) == NULL)
            continue;
        if (refcount_incr(&search->refcount) != 2) {
            refcount_decr(&search->refcount);
            /* Old rare bug could cause a refcount leak. We haven't seen
             * it in years, but we leave this code in to prevent failures
             * just in case
            没看懂这里的意思.....
             */
            if (settings.tail_repair_time &&
                    search->time + settings.tail_repair_time < current_time) {
                itemstats[id].tailrepairs++;
                search->refcount = 1;
                do_item_unlink_nolock(search, hv);
            }
            if (hold_lock)
                item_trylock_unlock(hold_lock);
            continue;
        }
        /* Expired or flushed */
        //超时了...
        if ((search->exptime != 0 && search->exptime < current_time)
            || (search->time <= oldest_live && oldest_live <= current_time)) {
            itemstats[id].reclaimed++;
            if ((search->it_flags & ITEM_FETCHED) == 0) {
                itemstats[id].expired_unfetched++;
            }
            it = search; //拿下空间
            slabs_adjust_mem_requested(it->slabs_clsid, ITEM_ntotal(it), ntotal); //更新统计数据
            /**
            什么是link，在这简单说下，就是把item加到哈希表和LRU链表的过程。详见items::do_item_link函数 这里把item旧的link取消掉，当前函数do_item_alloc的工作只是拿空间，而往后可知道拿到item空间后会对这块item进行“link”工作，而这里这块item空间是旧的item超时然后拿来用的，所以先把它unlink掉
            */
            do_item_unlink_nolock(it, hv);
            /* Initialize the item block: */
            it->slabs_clsid = 0;
        } else if ((it = slabs_alloc(ntotal, id)) == NULL) {/*如果没有找到超时的item，则
                调用slabs_alloc分配空间，详见slabs_alloc
                如果slabs_alloc分配空间失败，即返回NULL，则往下走，下面的代码是
                把LRU列表最后一个给淘汰，即使item没有过期。
                这里一般是可用内存已经满了，需要按LRU进行淘汰的时候。
            */
            tried_alloc = 1; //标记一下，表示有进入此分支，表示有尝试过调用slabs_alloc去分配新的空间。
            //记下被淘汰item的信息，像我们使用memcached经常会查看的evicted_time就是在这里赋值啦！
            if (settings.evict_to_free == 0) {
                itemstats[id].outofmemory++;
            } else {
                itemstats[id].evicted++;
                itemstats[id].evicted_time = current_time - search->time; //被淘汰的item距离上次使用多长时间了
                if (search->exptime != 0)
                    itemstats[id].evicted_nonzero++;
                if ((search->it_flags & ITEM_FETCHED) == 0) {
                    itemstats[id].evicted_unfetched++;
                }
                it = search;
                slabs_adjust_mem_requested(it->slabs_clsid, ITEM_ntotal(it), ntotal);//更新统计数据
                do_item_unlink_nolock(it, hv); //从哈希表和LRU链表中删掉
                /* Initialize the item block: */
                it->slabs_clsid = 0;
                /*
                 在这也可以先略过下面的逻辑
                 如果当前slabclass有item被淘汰掉了，说明可用内存都满了，再也没有
                 slab可分配了，
                 而如果 slab_automove=2 (默认是1)，这样会导致angry模式，
                 就是只要分配失败了，就马上进行slab重分配：把别的slabclass空间牺牲
                 掉一些，马上给现在的slabclass分配空间，而不会合理地根据淘汰统计
                 数据来分析要怎么重分配（slab_automove = 1则会）。
                 */
                if (settings.slab_automove == 2)
                    slabs_reassign(-1, id);
            }
        }
        refcount_decr(&search->refcount);
        /* If hash values were equal, we don't grab a second lock */
        if (hold_lock)
            item_trylock_unlock(hold_lock);
        break;
    }
    /**
    如果上面的for循环里面没有找到空间，并且没有进入过else if ((it = slabs_alloc(ntotal, id)) == NULL)这个分支没有 尝试调slabs_alloc分配空间（有这种可能性），那么，下面这行代码就是再尝试分配。
    你会觉得上面那个循环写得特纠结，逻辑不清，估计你也看醉了。其实整个分配原则是这样子：
    1）先从LRU链表找下看看有没有恰好过期的空间，有的话就用这个空间。
    2）如果没有过期的空间，就分配新的空间。
    3）如果分配新的空间失败，那么往往是内存都用光了，则从LRU链表中把最旧的即使没过期的item淘汰掉，空间分给新的item用。
    问题是：这个从“LRU链表找到的item”是一个不确定的东西，有可能这个item数据异常，有可能这个item由于与别的item共用锁的桶号
    这个桶被锁住了，所以总之各种原因这个item此刻不一定可用，因此用了一个循环尝试找几次（上面是5）。
    所以逻辑是：
    1）我先找5次LRU看看有没有可用的过期的item，有就用它。（for循环5次）
    2）5次没有找到可用的过期的item，那我分配新的。
    3）分配新的不成功，那我再找5次看看有没有可用的虽然没过期的item，淘汰它，把空间给新的item用。（for循环5次）
    那么这里有个问题，如果代码要写得逻辑清晰一点，我得写两个for循环，一个是为了第2）步前“找可用的过期的”item，
    一个是第2）步不成功后“找可用的用来淘汰的”空间。而且有重复的逻辑“找到可用的”，所以memcached作者就合在一起了，
    然后只能把第2）步也塞到for循环里面，确实挺尴尬的。。。估计memcached作者也写得很纠结。。。
    所以就很有可能出现5次都没找到可用的空间，都没进入过elseif那个分支就被continue掉了，为了记下有没有进过elseif
    分支就挫挫地用一个tried_alloc变量来做记号。。
    */
    if (!tried_alloc && (tries == 0 || search == NULL))
        it = slabs_alloc(ntotal, id);
    if (it == NULL) {
        itemstats[id].outofmemory++;
        mutex_unlock(&cache_lock);
        return NULL; //没错！会有分配新空间不成功，而且尝试5次淘汰旧的item也没成功的时候，只能返回NULL。。
    }
    assert(it->slabs_clsid == 0);
    assert(it != heads[id]);
    //来到这里，说明item分配成功，下面主要是一些初始化工作。
    /* Item initialization can happen outside of the lock; the item's already
     * been removed from the slab LRU.
     */
    it->refcount = 1; /* the caller will have a reference */
    mutex_unlock(&cache_lock);
    it->next = it->prev = it->h_next = 0;
    it->slabs_clsid = id;
    DEBUG_REFCNT(it, '*');
    it->it_flags = settings.use_cas ? ITEM_CAS : 0;
    it->nkey = nkey;
    it->nbytes = nbytes;
    memcpy(ITEM_key(it), key, nkey);
    it->exptime = exptime;
    memcpy(ITEM_suffix(it), suffix, (size_t)nsuffix);
    it->nsuffix = nsuffix;
    return it;
}
```
至此，我们已经把“分配”item空间的工作说完了，但是分配完item空间之后实质还有一些”收尾工作”
我们的一个SET命令分成两部分，一部分是“命令”行，第二部分是“数据”行，而上面所提到的item空间分配工作都是完成“命令”行的工作，回忆一下，状态机在完成“SET命令”第二部分行为（即把value塞到了我们分配的item的data字段的value位置）的时候，收尾的时候会来到：

```
static void complete_nread_ascii(conn *c) {
 //。。
 ret = store_item(it, comm, c);
 //。。
}
```

其实这个store_item会对这个item进行一些收尾工作：

```
enum store_item_type store_item(item *item, int comm, conn* c) {
    enum store_item_type ret;
    uint32_t hv;
    hv = hash(ITEM_key(item), item->nkey); //锁住item
    item_lock(hv);
    ret = do_store_item(item, comm, c, hv);
    item_unlock(hv);
    return ret;
}
enum store_item_type do_store_item(item *it, int comm, conn *c, const uint32_t hv) {
  //。。。
      do_item_link(it, hv);
  //。。。
}
```

上面的do_item_link函数引出了一个叫“link”，链接的概念，这个link的意思就是主要包括下面三部分：

a）改变一些统计数据

b）把item加到哈希表

c）把item插入到相应的slabclass lru链表中

```
int do_item_link(item *it, const uint32_t hv) {
    MEMCACHED_ITEM_LINK(ITEM_key(it), it->nkey, it->nbytes);
    assert((it->it_flags & (ITEM_LINKED|ITEM_SLABBED)) == 0);
    mutex_lock(&cache_lock);
    it->it_flags |= ITEM_LINKED;
    it->time = current_time;
    STATS_LOCK();
    stats.curr_bytes += ITEM_ntotal(it);
    stats.curr_items += 1;
    stats.total_items += 1;
    STATS_UNLOCK();
    /* Allocate a new CAS ID on link. */
    ITEM_set_cas(it, (settings.use_cas) ? get_cas_id() : 0);
    assoc_insert(it, hv); //插入哈希表
    item_link_q(it); //加入LRU链表
    refcount_incr(&it->refcount);
    mutex_unlock(&cache_lock);
    return 1;
}
```
link收尾工作做完，我们的分配内存工作总算完成了。
