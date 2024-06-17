# redisson分布式锁使用

## 1 简介

Redisson，高级的分布式协调 Redis 客服端，帮助用户在分布式环境轻松实现一些 Java 对象 (Bloom filter, BitSet, Set, SetMultimap, ScoredSortedSet, SortedSet, Map, ConcurrentMap, List, ListMultimap, Queue, BlockingQueue, Deque, BlockingDeque, Semaphore, Lock, ReadWriteLock, AtomicLong, CountDownLatch, Publish / Subscribe, HyperLogLog)。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/943c32c2d8bbebcf05345cc0876c9d9a.png)

## 2 适用场景

分布式应用，分布式缓存，分布式回话管理，分布式服务（任务，延迟任务，执行器），分布式 redis 客户端，一般用其分布式锁功能。

## 3 添加依赖

在项目中添加 redisson-spring-boot-starter 依赖关系：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/7e0da2a6d5738ed355ad2a54cabb69bb.png)

将 Redisson 与 Spring Boot 库集成。依赖于 Spring Data Redis 模块。支持 Spring Boot 1.3.x - 3.3.x

```xml
<dependency>
     <groupId>org.redisson</groupId>
     <artifactId>redisson-spring-boot-starter</artifactId>
     <version>3.31.0</version>
</dependency>
```

redisson-spring-boot-starter 依赖于与最新版本 Spring Boot 兼容的 redisson-spring-data 模块。如有必要，可降级 redisson-spring-data 模块，以支持以前的 Spring Boot 版本：

| redisson-spring-data module name | Spring Boot version |
| -------------------------------- | ------------------- |
| redisson-spring-data-16          | 1.3.y               |
| redisson-spring-data-17          | 1.4.y               |
| redisson-spring-data-18          | 1.5.y               |
| redisson-spring-data-2x          | 2.x.y               |
| redisson-spring-data-3x          | 3.x.y               |

看这里：https://github.com/redisson/redisson/tree/master/redisson-spring-data#1-add-redisson-spring-data-dependency-into-your-project

https://github.com/redisson/redisson/tree/master/redisson-spring-data#1-add-redisson-spring-data-dependency-into-your-project

## 配置文件

### Spring Boot 2.7.x 以下设置

```yaml
spring:
  redis:
    database: 
    host:
    port:
    password:
    ssl: 
    timeout:
    connectTimeout:
    clientName:
    cluster:
      nodes:
    sentinel:
      master:
      nodes:
```



### Spring Boot 3.x+ 设置



```yaml
spring:
  data:
    redis:
      database: 
      host:
      port:
      password:
      ssl: 
      timeout:
      connectTimeout:
      clientName:
      cluster:
        nodes:
      sentinel:
        master:
        nodes:
```



## 4 引入依赖

```java
@Resource
private RedissonClient redissonClient;
```



## 5 代码示例

```java
@Resource
private RedissonClient redissonClient;

/**
 * 抢购代金券
 *
 * @param voucherId   代金券 ID
 * @param accessToken 登录token
 * @Para path 访问路径
 */
@Transactional(rollbackFor = Exception.class)
public ResultInfo doSeckill(Integer voucherId, String accessToken, String path) {
    // 基本参数校验
    AssertUtil.isTrue(voucherId == null || voucherId < 0, "请选择需要抢购的代金券");
    AssertUtil.isNotEmpty(accessToken, "请登录");

    // ----------注释原始的走 关系型数据库 的流程----------
    // 判断此代金券是否加入抢购
    // SeckillVouchers seckillVouchers = seckillVouchersMapper.selectVoucher(voucherId);
    // AssertUtil.isTrue(seckillVouchers == null, "该代金券并未有抢购活动");

    // ----------采用 Redis 解问题----------
    String redisKey = RedisKeyConstant.seckill_vouchers.getKey() + voucherId;
    Map<String, Object> seckillVoucherMaps = redisTemplate.opsForHash().entries(redisKey);
    SeckillVouchers seckillVouchers = BeanUtil.mapToBean(seckillVoucherMaps, SeckillVouchers.class, true, null);

    // 判断是否有效
    AssertUtil.isTrue(seckillVouchers.getIsValid() == 0, "该活动已结束");
    // 判断是否开始、结束
    Date now = new Date();
    AssertUtil.isTrue(now.before(seckillVouchers.getStartTime()), "该抢购还未开始");
    AssertUtil.isTrue(now.after(seckillVouchers.getEndTime()), "该抢购已结束");

    // 判断是否卖完通过 Lua 脚本扣库存时判断
    //AssertUtil.isTrue(seckillVouchers.getAmount() < 1, "该券已经卖完了");

    // 获取登录用户信息
    String url = oauthServerName + "user/me?access_token={accessToken}";
    ResultInfo resultInfo = restTemplate.getForObject(url, ResultInfo.class, accessToken);
    if (resultInfo.getCode() != ApiConstant.SUCCESS_CODE) {
        resultInfo.setPath(path);
        return resultInfo;
    }
    // 这里的data是一个LinkedHashMap，SignInDinerInfo
    SignInDinerInfo dinerInfo = BeanUtil.fillBeanWithMap((LinkedHashMap) resultInfo.getData(),
            new SignInDinerInfo(), false);
    // 判断登录用户是否已抢到(一个用户针对这次活动只能买一次)
    VoucherOrders order = voucherOrdersMapper.findDinerOrder(dinerInfo.getId(),
            seckillVouchers.getFkVoucherId());
    AssertUtil.isTrue(order != null, "该用户已抢到该代金券，无需再抢");

    // ----------注释原始的走 关系型数据库 的流程----------
    // 扣库存
    // int count = seckillVouchersMapper.stockDecrease(seckillVouchers.getId());
    // AssertUtil.isTrue(count == 0, "该券已经卖完了");

    // 使用 Redis 锁一个账号只能购买一次
    String lockName = RedisKeyConstant.lock_key.getKey() + dinerInfo.getId() + ":" + voucherId;
    // 加锁
    long expireTime = seckillVouchers.getEndTime().getTime() - now.getTime();
    // 自定义 Redis 分布式锁
    // String lockKey = redisLock.tryLock(lockName, expireTime);

    // Redisson 分布式锁
    RLock lock = redissonClient.getLock(lockName);

    try {
        // 不为空意味着拿到锁了，执行下单
        // 自定义 Redis 分布式锁处理
        //if (StrUtil.isNotBlank(lockKey)) {

        // Redisson 分布式锁处理
        boolean isLocked = lock.tryLock(expireTime, TimeUnit.MILLISECONDS);
        if (isLocked) {
            // 下单
            VoucherOrders voucherOrders = new VoucherOrders();
            voucherOrders.setFkDinerId(dinerInfo.getId());
            // Redis 中不需要维护外键信息
            //voucherOrders.setFkSeckillId(seckillVouchers.getId());
            voucherOrders.setFkVoucherId(seckillVouchers.getFkVoucherId());
            String orderNo = IdUtil.getSnowflake(1, 1).nextIdStr();
            voucherOrders.setOrderNo(orderNo);
            voucherOrders.setOrderType(1);
            voucherOrders.setStatus(0);
            long count = voucherOrdersMapper.save(voucherOrders);
            AssertUtil.isTrue(count == 0, "用户抢购失败");

            // ----------采用 Redis 解问题----------
            // 扣库存
            // long count = redisTemplate.opsForHash().increment(redisKey, "amount", -1);
            // AssertUtil.isTrue(count < 0, "该券已经卖完了");

            // ----------采用 Redis + Lua 解问题----------
            // 扣库存
            List<String> keys = new ArrayList<>();
            keys.add(redisKey);
            keys.add("amount");
            Long amount = (Long) redisTemplate.execute(redisScript, keys);
            AssertUtil.isTrue(amount == null || amount < 1, "该券已经卖完了");
        }
    } catch (Exception e) {
        // 手动回滚事物
        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        // 自定义 Redis 解锁
        // redisLock.unlock(lockName, lockKey);

        // Redisson 解锁
        lock.unlock();
        if (e instanceof ParameterException) {
            return ResultInfoUtil.buildError(0, "该券已经卖完了", path);
        }
    }

    return ResultInfoUtil.buildSuccess(path, "抢购成功");
}
```

参考：

- https://gitcode.com/redisson/redisson/blob/master/redisson-spring-boot-starter/README.md?utm_source=csdn_github_accelerator&isLogin=1
- https://blog.csdn.net/Mr_lqh325/article/details/132557086