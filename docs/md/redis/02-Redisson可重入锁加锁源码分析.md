# 02-Redisson可重入锁加锁源码分析


## Redisson可重入锁加锁源码分析

![微信图片_20240304200448](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240304200448.png)

一般在分布式环境下，需要控制并发安全的地方，基本上都要用到分布式锁，所以分布式锁相关的内容以及实现原理是比较重要的，Redisson 是 Redis 中比较优秀的一个客户端工具，源码写的非常规范，值得我们学习，这里说一下 **Redisson 可重入锁** 的源码

这里 Redisson 版本使用的是 `3.15.5` ，其实版本不重要，主要理解里边的加锁原理即可

### 1、加锁入口

相关的使用就不说了，这里直接看源码，首先是加锁的入口：

![image-20240304194920960](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240304194920960.png)

```java
public static void main(String[] args) {
    Config config = new Config();
    config.useSingleServer()
            .setAddress("redis://127.0.0.1:6360")
            .setPassword("123456")
            .setDatabase(0);
    //获取客户端
    RedissonClient redissonClient = Redisson.create(config);
    RLock rLock = redissonClient.getLock("11_come");
    rLock.lock();
}
```

通过 redissonClient 获得 RLock 的锁对象，通过 rLock 的 lock 方法进行，接下来进入 `lock()` 方法：

```java
// RedissonLock
@Override
public void lock() {
    try {
        lock(-1, null, false);
    } catch (InterruptedException e) {
        throw new IllegalStateException();
    }
}

// RedissonLock
private void lock(long leaseTime, TimeUnit unit, boolean interruptibly) throws InterruptedException {
    long threadId = Thread.currentThread().getId();
    // 加锁
    Long ttl = tryAcquire(-1, leaseTime, unit, threadId);
    // lock acquired
    if (ttl == null) {
        return;
    }
    // ... 先省略
}
```



### 2、tryAcquire 尝试加锁

![image-20240304194940949](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240304194940949.png)

`lock()` 方法最终就走到了 `RedissonLock` 实现类中，先去获取了线程 ID 也就是 `threadId` ，这个其实就是标记到底是哪个线程获取的 Redisson 锁的

之后通过 `tryAcquire()` 方法尝试获取锁，这个方法就是获取锁的 `核心代码` ：

```java
// RedissonLock
private Long tryAcquire(long waitTime, long leaseTime, TimeUnit unit, long threadId) {
    return get(tryAcquireAsync(waitTime, leaseTime, unit, threadId));
}
```

这里是包含了两层方法，`get()` 嵌套了 `tryAcquireAsync()` ，`get()` 就是阻塞获取异步拿锁的结果

### 3、tryAcquireAsync 异步加锁

![image-20240304194959000](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240304194959000.png)

先来看里边的方法尝试异步加锁 `tryAcquireAsync()` ：

```java
// RedissonLock
private <T> RFuture<Long> tryAcquireAsync(long waitTime, long leaseTime, TimeUnit unit, long threadId) {
    RFuture<Long> ttlRemainingFuture;

    if (leaseTime != -1) {
        ttlRemainingFuture = tryLockInnerAsync(waitTime, leaseTime, unit, threadId, RedisCommands.EVAL_LONG);
    } else {
        ttlRemainingFuture = tryLockInnerAsync(waitTime, internalLockLeaseTime,
                TimeUnit.MILLISECONDS, threadId, RedisCommands.EVAL_LONG);
    }
    // ... 先省略
}
```



在 `tryAcquireAsync()` 方法中，先判断 `leaseTime` 是否为 -1，我们不指定锁的释放时间的话，默认 `leaseTime` 就是 -1，于是使用默认的锁释放时间（超过这个时间就会自动释放锁）也就是 30s，接下来进 `tryLockInnerAsync()` 方法：

![image-20240304195009048](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240304195009048.png)

```java
// RedissonLock
<T> RFuture<T> tryLockInnerAsync(long waitTime, long leaseTime, TimeUnit unit, long threadId, RedisStrictCommand<T> command) {
    return evalWriteAsync(getRawName(), LongCodec.INSTANCE, command,
        "if (redis.call('exists', KEYS[1]) == 0) then " +
                "redis.call('hincrby', KEYS[1], ARGV[2], 1); " +
                "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                "return nil; " +
                "end; " +
         "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
                "redis.call('hincrby', KEYS[1], ARGV[2], 1); " +
                "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                "return nil; " +
                "end; " +
         "return redis.call('pttl', KEYS[1]);",
        Collections.singletonList(getRawName()), unit.toMillis(leaseTime), getLockName(threadId));
}·
```

这里就是执行一个 lua 脚本，这个 lua 脚本就是加锁的核心代码，主要关注 lua 脚本去 Redis 中 `做了哪些事情` ，以及 lua 脚本中的参数 `KEYS` 和 `ARGV` 到底是什么

首先看一下 lua 脚本中的参数：

- **KEYS** ：KEYS 参数是一个数组，也就是 `Collections.singletonList(getRawName())` ，这里的 `KEYS[1]` 其实就是我们定义的 RLock 的名称 `11_come`
- **ARGV** ：ARGV 参数就是 KEYS 参数后边跟的参数了
  - `ARGV[1]` 是 `unit.toMillis(leaseTime)` ，也就是锁的释放时间，30000ms 也就是 30s
  - `ARGV[2]` 是 `getLockName(threadId)` ，也就是 `UUID + “:” + threadId` ，比如 `ffa56698-e0f7-4412-ad5a-00669156d187:1`



### 4、加锁 lua 脚本

那么参数说完了，这里用 lua 脚本执行加锁的命令其实就是 **想通过 lua 脚本来保证命令执行的原子性** ，因为 Redis 处理请求是单线程执行，那么在执行 lua 脚本时，其他请求需要等待，以此来保证原子性



**接下来看一下讲一下这个 lua 脚本在做什么事情：**

**1、第一个 if 分支** 

首先会去判断 `KEYS[1]` 这个哈希结构是否存在，也就是我们定义的锁的哈希结构是否存在

如果不存在，也就是 `redis.call('exists', KEYS[1]) == 0` ，说明没有线程持有这个锁，就直接执行 `redis.call('hincrby', KEYS[1], ARGV[2], 1)` 也就是给这个哈希结构中添加一个键值对，value 设置为 1，表示加锁成功，哈希结构如下所示：

```json
"11_come": {
  ffa56698-e0f7-4412-ad5a-00669156d187:1: 1
}
```

再通过 `pexpire` 设置 key 的过期时间为 30000ms

最后 `return nil` 也就是返回 `null` 表示当前线程成功获取到了锁

**2、第二个 if 分支** 

如果 `redis.call('hexists', KEYS[1], ARGV[2]) == 1` ，表示  `11_come` 这个哈希结构存在，并且当前线程的键值对存在于这个哈希结构中，表明当前线程已经已经上过锁了，于是通过 `hincrby` 命令给键值对的 value + 1，**表示重入次数 +1** ，并且使用 `pexpire` 命令将锁过期时间重置，最后 `return nil` 表示线程加锁成功

**3、第三个 if 分支** 

如果走到这里了，说明前边两个 if 条件都没满足，也就是 `11_come` 这个锁的哈希结构已经存在了，并且当前线程的键值对并不在这个哈希结构中，说明是其他线程持有了这个锁，因此当前线程就加锁失败

这里注意一下，加锁失败使用了 `pttl` 命令来查询 `11_come` 这个哈希结构的剩余存活时间

为什么加锁失败要返回存活时间呢？不要着急，之后我们会讲到

那么 `tryLockInnerAsync()` 方法就已经讲完了，这里稍微总结一下，**如果当前线程成功加锁的话，就会返回 `null` ，如果当前线程加锁失败的话，就会返回这个锁的剩余存活时间** 

那么接下来看一下在执行 `tryLockInnerAsync()` 加锁之后，还会做一些什么操作

### 5、锁续期

在执行完 `tryLockInnerAsync` 方法之后，返回了一个 `RFuture` 对象，这里学过 JUC 的应该都清楚，Future 中就包装了异步操作的执行结果

接下来通过 `tlRemainingFuture.onComplete()` 其实就是给这个 Future 对象注册了一个监听器，等加锁的异步操作执行完成之后，就执行我们定义的这个监听器中的操作

**这个监听器中做要做什么呢？**

```java
// RedissonLock
private <T> RFuture<Long> tryAcquireAsync(long waitTime, long leaseTime, TimeUnit unit, long threadId) {
    ttlRemainingFuture.onComplete((ttlRemaining, e) -> {
        if (e != null) {
            return;
        }
        // 获取锁
        if (ttlRemaining == null) {
            if (leaseTime != -1) {
                internalLockLeaseTime = unit.toMillis(leaseTime);
            } else {
                scheduleExpirationRenewal(threadId);
            }
        }
    });
    return ttlRemainingFuture;
}
```

在监听器中先判断 `ttlRemaining` 是否为空，之前我们讲到在 lua 脚本中去加锁，如果加锁成功的话，返回 `null` ，加锁失败的话，返回这个锁的剩余存活时间

那么这里的 `ttlRemaining` 就是 lua 脚本的返回值，如果为空的话，表明加锁成功，于是进入这个 if 分支中：

```java
// RedissonLock # tryAcquireAsync
private <T> RFuture<Long> tryAcquireAsync(long waitTime, long leaseTime, TimeUnit unit, long threadId) {
		// ...
        // 获取锁
        if (ttlRemaining == null) {
            if (leaseTime != -1) {
                internalLockLeaseTime = unit.toMillis(leaseTime);
            } else {
                // 锁续期
                scheduleExpirationRenewal(threadId);
            }
        }
    });
    return ttlRemainingFuture;
}
```

获取锁成功之后，会在这个 if 分支中判断 leaseTime 是否为 -1，我们在加锁的时候没有设置释放时间，因此肯定是 -1，于是 Redisson 会对我们加的锁自动进行续期，进入到 `scheduleExpirationRenewal()` 方法，这个方法就是对我们加的锁进行 `续期` 操作：

```java
// RedissonBaseLock（RedissonLock 的父类）
protected void scheduleExpirationRenewal(long threadId) {
    ExpirationEntry entry = new ExpirationEntry();
    ExpirationEntry oldEntry = EXPIRATION_RENEWAL_MAP.putIfAbsent(getEntryName(), entry);
    if (oldEntry != null) {
        oldEntry.addThreadId(threadId);
    } else {
        entry.addThreadId(threadId);
        // 锁续期
        renewExpiration();
    }
}
```

可以看到，在这个方法中创建了一个 `ExpirationEntry` 对象，你也别管这个对象干嘛的，Redisson 底层对锁续期肯定需要存储一些信息，这里就是存储线程的信息，那么创建完这个对象后，就去将这个 Entry 对象放到一个 ConcurrentHashMap 中存放以便在后边取出使用

接下来有个 if 分支，如果这个 Map 原来没有这个 Entry 对象，就将 threadId 放到新创建的这个 Entry 中，并调用 `renewExpiration()`

这里从 ConcurrentHashMap 中获取这个 Entry 就是根据 `EntryName` 来获取的，这个 EntryName 其实就是你的 `RedissonLock 的 id` + `name` ，也就是：`ffa56698-e0f7-4412-ad5a-00669156d187:11_come`

那么也就是你第一次来加锁的时候，肯定是没有这个 Entry 的，所以一定会进入到 `renewExpiration()` 方法中：

![image-20240304195046039](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240304195046039.png)

```java
// RedissonBaseLock（RedissonLock 的父类）
private void renewExpiration() {
    ExpirationEntry ee = EXPIRATION_RENEWAL_MAP.get(getEntryName());
    if (ee == null) {
        return;
    }
    // 锁续期的定时任务
    Timeout task = commandExecutor.getConnectionManager().newTimeout(new TimerTask() {
       // ...
    }, internalLockLeaseTime / 3  /*锁续期的间隔时间*/, TimeUnit.MILLISECONDS);

    ee.setTimeout(task);
}
```

这个方法就是就是 **给锁续期的核心方法** 了，因为我们不给锁设置过期时间的话，Redisson 底层会自动去给锁继续宁续期，默认锁过期时间是 30s，那么 Redisson 每隔 1/3 的时间（10s）去判断锁该线程是否还持有锁，如果仍然持有的话，就将锁的过期时间重新设置为 30s

因此在这个方法中就是通过 `commandExecutor` 来执行一个 `TimerTask` ，执行任务的间隔时间为 1/3 的锁施放时间，默认就是 10s，这个任务就是对锁进行续期操作，**也就是每过 10s，发现当前线程还持有这个锁，就将锁的过期时间重置为 30s** ：

```java
// RedissonBaseLock（RedissonLock 的父类） # renewExpiration
private void renewExpiration() {
    // ...
    Timeout task = commandExecutor.getConnectionManager().newTimeout(new TimerTask() {
        @Override
        public void run(Timeout timeout) throws Exception {

            // 锁续期
            RFuture<Boolean> future = renewExpirationAsync(threadId);
            
            future.onComplete((res, e) -> {
                if (res) {
                    // reschedule itself
                    renewExpiration();
                }
            });
        }
    }, internalLockLeaseTime / 3  /*锁续期的间隔时间*/, TimeUnit.MILLISECONDS);
}
```

这个方法中有一些零碎的细节逻辑，个人觉得没必要看，所以这里直接省略掉了，因为我们只是去了解他加锁以及锁续期的原理是怎样的，而不是真正要去实现这个功能，这里直接看核心代码 `renewExpirationAsync()`：

```java
// RedissonBaseLock（RedissonLock 的父类）
protected RFuture<Boolean> renewExpirationAsync(long threadId) {
    return evalWriteAsync(getRawName(), LongCodec.INSTANCE, RedisCommands.EVAL_BOOLEAN,
            "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
                    "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                    "return 1; " +
                    "end; " +
                    "return 0;",
            Collections.singletonList(getRawName()),
            internalLockLeaseTime, getLockName(threadId));
}
```

在这里就是执行一个 lua 脚本：

1、通过 `hexists` 判断当前线程加的锁是否存在，跟之前加锁的 lua 脚本差不多，这里就不再赘述

2、如果存在的话，说明当前线程还持有这个锁，于是通过 `pexpire` 重置过期时间，完成锁续期操作，并返回 1

3、如果不存在，说明当前线程已经不持有这个锁了，显然不需要续期，于是返回 0 即可



那么上边执行完锁续期这个操作之后，这个定时任务就结束了，**下一次怎么进行锁续期呢？** 

```java
// RedissonBaseLock（RedissonLock 的父类）
private void renewExpiration() {
    Timeout task = commandExecutor.getConnectionManager().newTimeout(new TimerTask() {
            // ...
            future.onComplete((res, e) -> {
                // ...
                if (res) {
                    // 如果锁续期成功，继续调用锁续期的代码，来实现不断锁续期
                    renewExpiration();
                }
            });
        }
    }, internalLockLeaseTime / 3, TimeUnit.MILLISECONDS);

    ee.setTimeout(task);
}
```

可以看到在锁续期成功之后，又重新调用了 `renewExpiration()` 方法，再次执行锁续期的操作



### 6、可重入锁加锁流程总结

那么至此呢，Redisson 的可重入加锁的源码流程就分析完毕了，这里再对整个流程做一下梳理：

首先，通过 `lock()` 进行加锁，加锁最终是走到执行 `lua` 脚本的地方，通过在 **Redis 中的哈希结构** 存入当前线程的键值对来实现加锁，key 是 `RedissonLock.id + threadId`，value 就是 1

那么在加锁成功之后，我们如果没有指定锁的释放时间的话，Redisson 底层默认设置为 30s

并且会启动一个定时任务进行 **锁续期** ，也就是只要我们当前线程持有锁，就会隔一段时间对这个锁进行续期操作，锁续期操作的执行间隔默认为锁释放时间的 `1/3（10s）` 

可以看到，整个 Redisson 中可重入锁加锁的流程还是比较简单的，主要比较核心的功能为：

（1）通过 **Redis 的哈希结构** 进行加锁，并实现不同线程之间的锁互斥（通过 threadId 标识锁信息）

（2）如果不指定锁的释放时间，会启动定时任务去进行 **锁续期** ，每隔 10s 续期一次，最后通过 lua 脚本执行的

（3）**可重入锁** 就是通过 `hincrby` 来对哈希结构中的键值对 +1 实现重入的



## 可重入锁加锁不成功怎么办？

之前说可重入锁加锁的源码时，只讲了客户端加锁成功的流程，如果当前的锁已经被其他客户端锁占有了，当前客户端是会加锁失败的，那么枷锁失败的话，当前客户端是会去停止等待一段时间的

```java
// RedissonLock
private void lock(long leaseTime, TimeUnit unit, boolean interruptibly) throws InterruptedException {
    long threadId = Thread.currentThread().getId();
    Long ttl = tryAcquire(-1, leaseTime, unit, threadId);
    // lock acquired
    if (ttl == null) {
        return;
    }
	// ... 省略 subscribe 的一些方法，不是核心逻辑
    try {
        while (true) {
            ttl = tryAcquire(-1, leaseTime, unit, threadId);
            // lock acquired
            if (ttl == null) {
                break;
            }

            // waiting for message
            if (ttl >= 0) {
                try {
                    future.getNow().getLatch().tryAcquire(ttl, TimeUnit.MILLISECONDS);
                } catch (InterruptedException e) {
                    if (interruptibly) {
                        throw e;
                    }
                    future.getNow().getLatch().tryAcquire(ttl, TimeUnit.MILLISECONDS);
                }
            } 
        }
        // ...
    } 
}
```

在调用 lock 方法后会走到 ReidssonLock 的 lock 方法中，这里可以看到会先通过 `tryAcquire()` 尝试加锁，该方法返回 `ttl` 

大家应该还记得，在最后执行加锁的是一段 lua 脚本:

- 加锁成功的话，返回 null
- 加锁失败的话，返回锁的剩余存活时间

那么这里在 `tryAcquire()` 之后就会进入到 `while` 死循环中，判断 `ttl` 是否为空，如果 `ttl == null` ，说明获取锁成功就直接退出循环即可

如果 `ttl` 不是空，说明锁已经被其他客户端占有了，此时 ttl 为锁的剩余存活时间，那么我们当前这个客户端可以等待 ttl 之后，再去尝试获取锁，也就是 `future.getNow().getLatch().tryAcquire(ttl, TimeUnit.MILLISECONDS)` 这一行代码，**`getLatch() ` 的话是获取一个信号量 Semaphore，通过这个信号量阻塞 ttl 的时间** ，再次通过 `tryAcqure()` 尝试获取锁

**因此如果获取锁失败之后，当前客户端会去等待 ttl 的时间，再次尝试去获取锁**

这里阻塞使用 Semaphore，最后底层也是走到了 AQS 中去，具体的细节这里先不了解，毕竟主干流程是分布式锁

