# Redis缓存雪崩、缓存穿透、缓存击穿解决方案详解

## 1 缓存雪崩（Cache Avalanche）

### 1.1 产生原因

- 应用设计层面，大量Key同时过期
- 缓存服务宕机
- ...

导致缓存数据同一时刻大规模不可用，或都更新。

集中过期，其实不是太致命，最致命的是缓存服务器某个节点宕机：

- 自然形成的缓存雪崩，一定是在某个时间段集中创建缓存，那么这时DB也可顶住压力，无非就是对DB产生周期性压力
- 而缓存服务节点的宕机，这时所有缓存 key 都没了，请求全部打入 DB，对DB造成的压力不可预知，很可能瞬间就把DB压垮，需通过主从集群哨兵等解决

像电商项目，一般采取将不同分类的商品，缓存不同周期。在同一分类中的商品，加上一个随机因子。尽可能分散缓存过期时间，而且，热门类目的商品缓存时间长一些，冷门类目的商品缓存时间短一些，也能节省缓存服务的资源。

### 1.2 解决方案

- 更新策略在时间上做到比较均匀
- 使用的热数据尽量分散到不同的机器上
- 多台机器做主从复制或多副本，实现高可用

#### ①  差异化缓存过期时间

别让大量Key同时过期。
在原有失效时间基础上增加一个随机值，比如1~5分钟的随机，这样每个缓存的过期时间重复率就会降低，集体失效概率也会大大降低。

#### ② 让缓存不主动过期

初始化缓存数据时，设置缓存永不过期，然后启动一个后台线程30s定时将所有数据更新到缓存，而且通过适当sleep，控制从DB更新数据的频率，降低DB压力。

两种解决方案截然不同，若无法全量缓存所有数据，则只能使用方案一。
即使使用方案二，同样需在查询时，确保有回源逻辑。因为无法确保缓存系统中的数据永不丢失。

不管哪个方案，在把数据从DB加入缓存时，都需判断来自DB的数据是否合法，如最基本的判空，否则在某时间点，若DBA将DB原始数据归档了，因为缓存中的数据一直在所以一开始没什么问题，但也许N年后，某天缓存数据突然过期，就从DB查到空数据加入缓存。

#### ③ 缓存预热

#### ④ 对缓存键加互斥锁

## 2 缓存穿透（Cache Penetration）

### 2.1 产生原因

高并发查询不存在的K，导致将压力都直接透传到DB。缓存和数据库都无对应数据！

为何会多次透传？因为缓存不存在该数据，一直为空。 

> 注意让缓存能够区分 key 是不存在 or 存在但查询得到一个空值。 
> 如访问**id=-1**的数据。可能出现绕过Redis频繁访问DB，称为缓存穿透，多出现在查询为null的情况不被缓存时。

### 2.2 解决方案

两种方案：

1. 约定：若数据在DB中不存在，依旧进行缓存
2. 过滤：使用bitMap或布隆过滤器制定过滤规则去过滤一些不存在的问题。

#### ① 业务代码层拦截无效 key

接口层加校验，如用户鉴权校验, id做基础校验：id<=0的直接拦截。

#### ② 布隆过滤器 or RoaringBitmap

提供一个迅速判断请求是否有效的拦截机制。如布隆过滤器，维护一系列合法有效 key，迅速判断请求所携带的 Key 是否合法有效：若不合法，则直接返回，避免直接查询DB。

#### ③ 缓存空值key

若从DB查询的对象为空，也放入缓存，只是设定缓存TTL较短，如60s。

这样第一次不存在也会被加载会记录，下次拿到就有这个key了。

#### ④ 完全以缓存为准

更简单粗暴的，若一个查询返回的数据为空，不管是：

- 数据不存在
- 还是系统故障

仍缓存该空结果，但其过期时间很短，最长不超过5min。

```java
if(list == null) {
    // key value 有效时间 时间单位
    redisTemplate.opsForValue().set(navKey,null,10, TimeUnit.MINUTES);
} else {
    redisTemplate.opsForValue().set(navKey,result,7,TimeUnit.DAYS);
}
```

#### 异步更新

使用 延迟异步加载 的策略2，这样业务前端不会触发更新，只有我们数据更新时后端去主动更新。

#### 服务降级

hystrix

#### 互斥锁（不推荐）

问题根本在于限制处理线程的数量，即key的更新操作添加全局互斥锁。
在缓存失效时（判断拿出来的值为空），不是立即去load db，而是

- 先使用缓存工具的某些带成功操作返回值的操作（Redis的SETNX）去set一个mutex key
- 当操作返回成功时，再load db的操作并回设缓存；否则，就重试整个get缓存的方法。

```java
public String get(key) {
      String value = redis.get(key);
      if (value == null) { // 缓存已过期
          // 设置超时，防止del失败时，下次缓存过期一直不能load db
		  if (redis.setnx(key_mutex, 1, 3 * 60) == 1) { // 设置成功
               value = db.get(key);
                      redis.set(key, value, expire_secs);
                      redis.del(key_mutex);
          } else {
            		// 其他线程已load db并回设缓存，重试获取缓存即可
                    sleep(50);
                    get(key);  //重试
          }
        } else { // 缓存未过期
            return value;      
        }
 }
```

#### 提前"使用互斥锁（不推荐）

在value内部设置1个超时值(timeout1)， timeout1比实际的memcache timeout(timeout2)小。当从cache读取到timeout1发现它已经过期时候，马上延长timeout1并重新设置到cache。然后再从数据库加载数据并设置到cache中。伪代码如下：

```java
v = memcache.get(key);  
if (v == null) {  
    if (memcache.add(key_mutex, 3 * 60 * 1000) == true) {  
        value = db.get(key);  
        memcache.set(key, value);  
        memcache.delete(key_mutex);  
    } else {  
        sleep(50);  
        retry();  
    }  
} else {  
    if (v.timeout <= now()) {  
        if (memcache.add(key_mutex, 3 * 60 * 1000) == true) {  
            // extend the timeout for other threads  
            v.timeout += 3 * 60 * 1000;  
            memcache.set(key, v, KEY_TIMEOUT * 2);  
  
            // load the latest value from db  
            v = db.get(key);  
            v.timeout = KEY_TIMEOUT;  
            memcache.set(key, value, KEY_TIMEOUT * 2);  
            memcache.delete(key_mutex);  
        } else {  
            sleep(50);  
            retry();  
        }  
    }  
} 
```

## 3 缓存击穿（Hotspot Invalid）

### 3.1 产生原因

缓存无数据，但数据库有对应数据（不同于缓存穿透）。
一个key。（不同于缓存雪崩）

- 击穿针对的是某一个key缓存
- 而雪崩是很多key

某key失效时，正好有高并发请求访问该key。 

通常使用【缓存 + 过期时间】帮助加速接口访问速度，减少后端负载，同时保证功能的更新，一般情况下这种模式已基本满足需求。

但若同时出现如下问题，可能对系统十分致命：

- 热点key，访问量非常大
  如秒杀时。
- 缓存的构建需要时间（可能是个复杂过程，例如复杂SQL、多次I/O、多个接口依赖）

于是导致在缓存失效瞬间，有大量线程构建缓存，导致后端负载加剧，甚至可能让系统崩溃。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/77d8d46e9e4047133dac4116901522bd.png)

某些Key属极端热点数据，并发量很大情况下，如果这个Key过期，可能会在某个瞬间出现大量的并发请求同时回源，相当于大量的并发请求直接打到了数据库。这就是缓存击穿或缓存并发问题。





1. 加锁，只有一个线程去维护缓存，其他线程阻塞。
2. 异步加载：缓存击穿是热点数据才会出现的问题，可以对这部分数据采用到期自动刷新的策略，而不是到期自动淘汰。

SpringCache采用`sync`属性，只有一个线程去维护缓存，其他线程会被阻塞，直到缓存中更新该条目为止。注意此次不是分布式锁，是进程锁。好处是即使维护线程的请求由于特殊原因被阻塞，其他进程也可以维护线程。防止`死锁`。

```java
@Cacheable(cacheNames="foos", sync=true) 
public Foo executeExpensiveOperation(String id) {...}
```



### 3.2 解决方案

考虑使用锁限制回源的并发。

如下使用Redisson获取一个基于Redis的分布式锁，在查询DB前先尝试获取锁：

```java
@Autowired
private RedissonClient redissonClient;
@GetMapping("right")
public String right() {
    String data = stringRedisTemplate.opsForValue().get("hotsopt");
    if (StringUtils.isEmpty(data)) {
        RLock locker = redissonClient.getLock("locker");
        // 获取分布式锁
        if (locker.tryLock()) {
            try {
                data = stringRedisTemplate.opsForValue().get("hotsopt");
                // 双重检查，因为可能已经有一个B线程过了第一次判断，在等锁，然后A线程已经把数据写入了Redis中
                if (StringUtils.isEmpty(data)) {
                    // 回源到数据库查询
                    data = getExpensiveData();
                    stringRedisTemplate.opsForValue().set("hotsopt", data, 5, TimeUnit.SECONDS);
                }
            } finally {
                // 别忘记释放，另外注意写法，获取锁后整段代码try+finally，确保unlock万无一失
                locker.unlock();
            }
        }
    }
    return data;
}
```

这样，可以把回源到数据库的并发限制在1。
在真实的业务场景下，不一定要这么严格地使用双重检查分布式锁进行全局的并发限制，因为这样虽然可以把数据库回源并发降到最低，但也限制了缓存失效时的并发。

所以可考虑：

#### 进程内锁

这样每个节点都可以以一个并发回源DB。

#### Semaphore

限制并发数，比如限制为10，这样既限制了回源并发数不至于太大，又能使得一定量的线程可以同时回源。

#### 永不过期

从 redis 上看，确实没有设置过期时间。这就保证不会出现热点 key 过期，即 “物理” 不过期。

#### “逻辑” 过期

功能上看，若不过期，不就成静态数据了？
所以我们把过期时间存在 key 对应的 value。若发现要过期了，通过一个后台异步线程进行缓存构建，即 “逻辑” 过期。

#### 服务降级

hystrix

#### 缓存为准

使用异步线程负责维护缓存的数据，定期或根据条件触发更新，这样就不会触发更新。



参考

- https://www.iteye.com/blog/carlosfu-2269687