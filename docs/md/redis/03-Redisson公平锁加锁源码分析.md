# 03-Redisson公平锁加锁源码分析

## Redisson公平锁加锁源码分析

![image-20240305145104682](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240305145104682.png)

上一篇说了 **可重入锁** 加锁的流程，这个可重入锁其实就是非公平锁，**非公平体现在哪里呢？**

体现在当前客户端如果抢锁失败的话，会拿到这个锁的剩余存活时间，会进行等待，等待之后再次去尝试加锁，里边是没有任何排队的逻辑的，因此是非公平锁

首先还是将使用的代码给放上：

```java
public static void main(String[] args) throws InterruptedException {
    Config config = new Config();
    config.useSingleServer()
            .setAddress("redis://127.0.0.1:6379")
            .setPassword("123456")
            .setDatabase(0);
    //获取客户端
    RedissonClient redissonClient = Redisson.create(config);
    RLock fairLock = redissonClient.getFairLock("fair_11_come");
    fairLock.lock();
}
```



### 队列放在哪里存储？

Redisson 的公平锁和非公平锁的区别只在最终执行的 lua 脚本有区别，所以这里就只说 **最后的 lua 脚本是怎么实现公平锁的！**

首先来思考一下，要实现公平锁肯定是需要一个队列的，**那这个队列放在哪里存储呢？** 

**可以放在本地吗？** 肯定不行，因为 Redisson 分布式锁使用在分布式环境下的，放在本地其他节点都感知不到，当然不行

因此，这个队列还是放在分布式缓存 Redis 中比较合适，毕竟锁也是在 Redis 中记录的，将队列也放在 Redis 中也不用引入其他的技术栈，并且可以通过 lua 脚本执行，来保证原子性



### 公平锁 lua 脚本分析

公平锁的加锁流程最终会走到 `RedissonFairLock # tryLockInnerAsync()` 方法中，在该方法中执行 lua 脚本进行排队、加锁等一系列操作，因此这个 lua 脚本是比较长的，而关于这个 lua 脚本网上也有许多讲解的，这里直接将注释贴在 lua 脚本上，接下来通过画图的方式讲解这个公平锁的加锁以及排队流程

接下来为了保证阅读起来比较方便，将这个 lua 脚本分为 5 个分支来讲

#### lua 脚本参数

这个 lua 脚本中有一些参数，**这里先介绍一下这些参数是什么：**

- `KEYS[1]` ：锁的名称，即 `fair_11_come`
- `KEYS[2]` ：Redis 中的等待队列名称，即 `redisson_lock_queue:{fair_11_come}`
- `KEYS[3]` ：Redis 中的 Set 有序集合名称，超时时间作为 score 进行排序，即 `redisson_lock_timeout:{fair_11_come}`

- `ARGV[1]` ：默认的锁释放时间，即 `30000ms`
- `ARGV[2]` ：UUID + threadId，用于标识具体加锁线程，即 `54a63d7a-926a-4ef8-9155-3f5769a10a1f:1`
- `ARGV[3]` ：线程等待的时间，即 `300000ms`
- `ARGV[4]`：当前的时间戳，即 `1709556953230`



有了这些参数，接下来看 lua 脚本就清晰很多了，这里我先将这 5 个分支的 lua 脚本以及注释贴出来，这里先不细说 lua 脚本，大家可以直接跳过这个 lua 脚本看后边的客户端加锁案例， **根据客户端加锁案例来理解加锁的流程，通过加锁案例来理解 lua 脚本为什么这么设计！** 



#### 分支1

![image-20240305104109434](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240305104109434.png)

#### 分支2

![image-20240305104120054](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240305104120054.png)

#### 分支3

![image-20240305104132195](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240305104132195.png)

#### 分支4

![image-20240305143223651](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240305143223651.png)

#### 分支5

![image-20240305104149819](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240305104149819.png)





### 从加锁流程分析 lua 脚本

这里从加锁流程来分析上边的 lua 脚本，来理解整个公平锁的加锁流程是怎样的，假设有 3 个客户端：A、B、C

这里假设加的公平锁的名称为 `fair_11_come`

#### 客户端 A 加锁

此时加入客户端 A 第一个过来加锁，到【分支1】，毫无疑问会从 while 循环中跳出来，因为等待队列中根本就没有等待线程，于是向下继续执行

到【分支2】，客户端 A 发现在 Redis 中不存在 `fair_11_come` 这个哈希结构， 并且等待队列中也没有等待线程，于是客户端 A 可以加锁，通过 `hset` 进行加锁，并且设置 `过期时间为 30000ms` ，也就是 `30s`，此时 Redis 中存在了该哈希结构如下：

```json
"fair_11_come": {
    "UUID_A + threadId_A": "1"
}
```

#### 客户端 B 来加锁

那么此时如果客户端 B 来加锁，假设此时 A 还没有释放锁

那么 B 走到 【分支1】，也会从 while 循环中跳出来，因为等待队列为空

到【分支2】，发现这个哈希结构已经存在了，说明锁被其他客户端线程占有了，于是跳过【分支2】

到【分支3】，发现不是重入锁，跳过【分支3】

到【分支4】，取当前线程的等待时间，由于还没有加入等待队列中，所以取出来是空，跳过【分支4】

到【分支5】，获取最后一个等待线程，发现为空，此时 `ttl` 为这个 `fair_11_come` 这个锁的剩余存活时间，这里假设为 `ttl` 为 25s，那么计算出来的 `timeout` 的值为 `ttl +  ARGV[3] + ARGV[4]` 也就是 `ttl + 300000ms + 当前时间戳` ，假设当前时间为 `10:00:00`

于是将当前节点加入等待队列中，这里假设客户端 B 的线程标识为 `UUID_B:threadId_B` ，此时 Redis 中锁结构以及等待队列如下：

![image-20240305144335392](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240305144335392.png)



#### 客户端 C 来加锁

此时假设客户端 C 来加锁，首先到【分支1】，发现没有等待超时的节点，于是退出 while 循环

到【分支2】，发现这个哈希结构已经存在了，说明锁被其他客户端线程占有了，于是跳过【分支2】

到【分支3】，发现不是重入锁，跳过【分支3】

到【分支4】，取当前线程的等待时间，由于还没有加入等待队列中，所以取出来是空，跳过【分支4】

到【分支5】，取出最后一个等待线程，发现不是空，说明前边有线程在等待了，此时 `ttl` 为 `前一个等待线程的 score - ARGV[4]` ，前一个节点也就是 B 的 score 为 `25s + 300s + 10:00:00`，再减去 `ARGV[4] = 10:00:00`

于是客户端 C 的 `ttl` 为 `25s + 300s`

接下来计算客户端 C 的 `timeout = ttl + 300s + 当前时间戳` ，假设当前时间为 `10:00:05` ，那么客户端 C 的 `timeout = (25s+300s) + 300s + 10:00:05`

**我们可以发现，这里客户端 C 的 timeout 也就是 score 每进入一个节点排队都会多加一个 300s，所以在【分支2】中，如果有线程获取锁的话，会遍历这个 Set 集合将所有节点的 score 都减去 300s** 

并且将客户端 C 加入等待队列：

![image-20240305144344171](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240305144344171.png)



那么至此正常的加锁流程就已经说完了



#### 客户端存在网络问题无法加锁怎么办？

但是除了这些正常情况，还会存在异常情况，如果轮到某一个客户端加锁了，但是该客户端网络存在异常，导致无法加锁，那么肯定不能让这个客户端在等待队列中一直等，从而导致后边的客户端线程也无法加锁，

这些 Redisson 都考虑到了，会给每一个客户端线程设置一个最长的等待时间，每个线程进入队列之后，最多允许等待【锁的剩余存活时间 + 300s】，所以每当有线程进入【分支1】的 while 循环中，如果发现队列中的线程已经【等待超时】了，说明这个线程可能存在网络问题，也可能是锁一直被占有没有释放，**那么直接就将这个线程扔出队列即可** 

- **那么被扔出去的线程如何再次加入队列呢？**  

在这个 lua 脚本中，如果加锁失败，在【分支4】中会返回锁的剩余存活时间，之后会在 `RedissonLock # lock()` 方法中进入到 while 循环，在这个 while 循环中通过信号量 Semaphore 来阻塞等待一会（锁的剩余存活时间），等待完之后，再次尝试去加锁就可以了

如果客户端被扔出队列了之后，就会在这个 lock 方法中的 while 循环中一直尝试去加锁，最后走到 lua 脚本中，会将自己重新加入到等待队列中进行等待

这里在将可重入锁的时候已经说过了，为了避免忘记还是将代码再贴一下：

![image-20240305130726172](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240305130726172.png)





### 公平锁加锁总结

**最后总结一下公平锁的加锁流程** 

公平锁的排队主要是靠 **等待队列** 来实现公平的，这个等待队列就是 Redis 中的列表，并且为了避免网络有问题的客户端一直在队列中，导致其他客户端线程无法获取锁的情况，因此还通过一个 **有序 Set 集合** 来存储每个排队客户端线程的超时等待时间，每个客户端线程最多等待【锁的剩余存活时间 + 300s】

公平锁的 lua 脚本虽然比较长，有 5 个分支，但是每个分支的功能其实是很明确的，这里再归纳一下：

【分支1】：从任务队列中剔除等待超时的节点

【分支2】：如果锁未被占有，并且自己是第一个等待锁的线程，就直接加锁

【分支3】：执行重入逻辑

【分支4】：如果当前客户端线程已经在等待队列中了，就返回实际需要等待的时间，也就是锁的剩余存活时间，返回这个时间就是方便在获取锁失败之后，阻塞等待这个时间之后，再来重试加锁

【分支5】：如果当前线程获取锁失败，就将自己加入到等待队列中，并且将等待超时时间设置到 Set 集合中去



### 完整的 lua 脚本

```java
// 分支 1：while 循环，主要是将等待队列中已经【等待超时】的线程给扔出去
// 因为这些线程可能因为网络问题而无法获取锁，如果网络没有问题的话，这些线程会再次将自己加入到等待队列的
"while true do " +
    // 从等待队列中取出第一个等待的线程
    "local firstThreadId2 = redis.call('lindex', KEYS[2], 0);" +
    // 如果为空的话，说明队列中没有线程等待了，那么自己就可以跳出 while 循环出去获取锁了
    "if firstThreadId2 == false then " +
        "break;" +
    "end;" +
    // 如果不为空的话，从 Set 集合中取出这个线程的 score 值，也就是它的等待超时的时间
    "local timeout = tonumber(redis.call('zscore', KEYS[3], firstThreadId2));" +
    // 如果超时时间 <= 当前时间戳的话，说明已经过了这个线程的等待超时时间，于是将这个线程直接从等待队列中扔出去，为什么要扔出去呢，因为这个线程可能因为网络问题无法获取锁了，就将他扔出去，当这个线程网络恢复之后还是会将自己加入到等待队列中去的
    "if timeout <= tonumber(ARGV[4]) then " +
        "redis.call('zrem', KEYS[3], firstThreadId2);" +
        "redis.call('lpop', KEYS[2]);" +
    // 如果超时时间 > 当前时间戳的话，说明队列中的第一个线程还没有等待超时，因此当前线程直接跳出 while 循环，接着向下走其他分支即可
    "else " +
        "break;" +
    "end;" +
"end;" +

// 分支 2：当前线程如果符合获取锁的条件，就在该分支中进行加锁
// 满足下边这两个条件，就进入这个 if 分支
// 条件 1："fair_11_come" 这个锁的哈希结构在 Redis 中不存在
// 条件 2：(等待队列不存在)或者(等待队列存在且第一个等待的线程是当前线程)
"if (redis.call('exists', KEYS[1]) == 0) " +
    "and ((redis.call('exists', KEYS[2]) == 0) " +
        "or (redis.call('lindex', KEYS[2], 0) == ARGV[2])) then " +

    // 从等待队列中移除第一个等待的节点
    "redis.call('lpop', KEYS[2]);" +
    "redis.call('zrem', KEYS[3], ARGV[2]);" +

    // 获取 Set 结合中的所有节点，对他们的 score 都减去 300000ms
    // 这里当有客户端成功获取锁时，将等待队列中的超时等待时间都减去 300000ms，那么其他客户端在分支 1 的 while 循环中就将这些超时等待的线程从等待队列中剔除掉，并在后边的分支中重新加入到等待队列中
    "local keys = redis.call('zrange', KEYS[3], 0, -1);" +
    "for i = 1, #keys, 1 do " +
        "redis.call('zincrby', KEYS[3], -tonumber(ARGV[3]), keys[i]);" +
    "end;" +

    // 在这里进行加锁，并设置锁的过期时间为 30000ms
    "redis.call('hset', KEYS[1], ARGV[2], 1);" +
    "redis.call('pexpire', KEYS[1], ARGV[1]);" +
    "return nil;" +
"end;" +

// 分支 3：如果当前线程的键值对在 "fair_11_come" 这个哈希结构中存在的话，说明是重入了，直接重入次数 + 1 即可
"if redis.call('hexists', KEYS[1], ARGV[2]) == 1 then " +
    "redis.call('hincrby', KEYS[1], ARGV[2],1);" +
    "redis.call('pexpire', KEYS[1], ARGV[1]);" +
    "return nil;" +
"end;" +
    
    
// 分支 4：走到这里的话，说明分支 2 和分支 3 都不满足，也就是当前线程既不是第一个等待的线程，又不是发生重入
// 获取当前线程在 Set 集合中的 score，也就是等待超时时间
"local timeout = redis.call('zscore', KEYS[3], ARGV[2]);" +
// 如果 timeout 不是 false 的话，也就是这个当前线程已经在等待了
"if timeout ~= false then " +
    // 加锁失败，返回锁的存活时间，这里要减去这两个参数是因为 timeout = 锁的剩余存活时间+ARGV[3]+ARGV[4]，这里减去这两个参数就返回锁的剩余存活时间了
    "return timeout - tonumber(ARGV[3]) - tonumber(ARGV[4]);" +
"end;" +
    
    
// 分支 5：
// 获取最后一个等待的线程
"local lastThreadId = redis.call('lindex', KEYS[2], -1);" +
"local ttl;" +
// 如果最后一个等待的线程不是空，并且不是当前线程
"if lastThreadId ~= false and lastThreadId ~= ARGV[2] then " +
    // 这里 ttl 就是上一个等待线程的等待时间 - 当前时间戳
    "ttl = tonumber(redis.call('zscore', KEYS[3], lastThreadId)) - tonumber(ARGV[4]);" +
"else " +
    // 如果最后一个等待的线程是空，说明当前线程是第一个等待的线程，ttl 设置为这个锁的剩余存活时间
    "ttl = redis.call('pttl', KEYS[1]);" +
"end;" +
// 这里计算一下 timeout
"local timeout = ttl + tonumber(ARGV[3]) + tonumber(ARGV[4]);" +
// 将当前线程加入等待队列中
"if redis.call('zadd', KEYS[3], timeout, ARGV[2]) == 1 then " +
    "redis.call('rpush', KEYS[2], ARGV[2]);" +
"end;" +
"return ttl;"
```







