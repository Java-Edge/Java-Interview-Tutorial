# 1 简介
本篇尽量用一些简单的数学式子和流程图和大家一起梳理一下这些集群容错算法.


# 2 灵魂拷问
- 谈谈dubbo中的负载均衡算法及特点
- 最小活跃数算法中是如何统计这个活跃数的
- 简单谈谈你对一致性哈希算法的认识

# 3 接口的继承体系
![](https://img-blog.csdnimg.cn/20191123012928105.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

# 4 RandomLoadBalance(随机)
> 随机，按权重设置随机概率
> 在一个截面上碰撞的概率高，但调用量越大分布越均匀，而且按概率使用权重后也比较均匀，有利于动态调整提供者权重。

默认策略,但是这个随机和我们理解上的随机还是不一样的,因为他还有个概念叫weight(权重),就是用来控制这个随机的概率的,我们来看代码实现.

```java
package org.apache.dubbo.rpc.cluster.loadbalance;

import org.apache.dubbo.common.URL;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.Invoker;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
  * 此类从多个提供者中随机选择一个提供者。
  * 可以为每个提供商定义权重：
  * 如果权重都相同，则将使用random.nextInt（调用者数）。
  * 如果权重不同，则将使用random.nextInt（w1 + w2 + ... + wn）
  * 请注意，如果机器的性能优于其他机器，则可以设置更大的重量。
  * 如果性能不是很好，则可以设置较小的重量。
 */
public class RandomLoadBalance extends AbstractLoadBalance {

    public static final String NAME = "random";

    /**
     * 使用随机条件在列表之间选择一个invoker
     * @param invokers 可能的invoker列表
     * @param url URL
     * @param invocation Invocation
     * @param <T>
     * @return 被选的invoker
     */
    @Override
    protected <T> Invoker<T> doSelect(List<Invoker<T>> invokers, URL url, Invocation invocation) {
        // invoker的数量
        int length = invokers.size();
        // 每个 invoker 有相同权重
        boolean sameWeight = true;
        // 每个invoker的权重
        int[] weights = new int[length];
        // 第一个 invoker 的权重
        int firstWeight = getWeight(invokers.get(0), invocation);
        weights[0] = firstWeight;
        // 权重之和
        int totalWeight = firstWeight;
        for (int i = 1; i < length; i++) {
            int weight = getWeight(invokers.get(i), invocation);
            // 保存以待后用
            weights[i] = weight;
            // Sum
            totalWeight += weight;
            if (sameWeight && weight != firstWeight) {
                sameWeight = false;
            }
        }
        if (totalWeight > 0 && !sameWeight) {
            // 如果并非每个invoker都具有相同的权重且至少一个invoker的权重大于0，请根据totalWeight随机选择
            int offset = ThreadLocalRandom.current().nextInt(totalWeight);
            // 根据随机值返回invoker
            for (int i = 0; i < length; i++) {
                offset -= weights[i];
                if (offset < 0) {
                    return invokers.get(i);
                }
            }
        }
        // 如果所有invoker都具有相同的权重值或totalWeight = 0，则平均返回。
        return invokers.get(ThreadLocalRandom.current().nextInt(length));
    }

}

```

## 分析
- 流程图
![](https://img-blog.csdnimg.cn/20191123015220149.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

假设有四个集群节点A,B,C,D,对应的权重分别是1,2,3,4,那么请求到A节点的概率就为1/(1+2+3+4) = 10%.B,C,D节点依次类推为20%,30%,40%.

虽然这个随机算法理解起来是比较容易的,面试一般不会问这个,但是假如我们要实现类似的功能,他这个代码实现的思路还是很优雅的,非常具有借鉴意义
他这个实现思路从纯数学角度是很好理解的,我们还是按照上面数学分析中的前提条件.我们知道总权重为10(1+2+3+4),那么怎么做到按权重随机呢?
根据10随机出一个整数,假如为随机出来的是2.然后依次和权重相减,比如2(随机数)-1(A的权重) = 1,然后1(上一步计算的结果)-2(B的权重) = -1,此时-1 < 0,那么则调用B,其他的以此类推

# 5 RoundRobinLoadBalance(轮询)
> 轮询，按公约后的权重设置轮循比率
> 存在慢的提供者累积请求的问题，比如：第二台机器很慢，但没挂，当请求调到第二台时就卡在那，久而久之，所有请求都卡在调到第二台上

```java

package org.apache.dubbo.rpc.cluster.loadbalance;

import org.apache.dubbo.common.URL;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.Invoker;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Round robin load balance.
 */
public class RoundRobinLoadBalance extends AbstractLoadBalance {
    public static final String NAME = "roundrobin";
    
    private static final int RECYCLE_PERIOD = 60000;
    
    protected static class WeightedRoundRobin {
        private int weight;
        private AtomicLong current = new AtomicLong(0);
        private long lastUpdate;
        public int getWeight() {
            return weight;
        }
        public void setWeight(int weight) {
            this.weight = weight;
            current.set(0);
        }
        public long increaseCurrent() {
            return current.addAndGet(weight);
        }
        public void sel(int total) {
            current.addAndGet(-1 * total);
        }
        public long getLastUpdate() {
            return lastUpdate;
        }
        public void setLastUpdate(long lastUpdate) {
            this.lastUpdate = lastUpdate;
        }
    }

    private ConcurrentMap<String, ConcurrentMap<String, WeightedRoundRobin>> methodWeightMap = new ConcurrentHashMap<String, ConcurrentMap<String, WeightedRoundRobin>>();
    private AtomicBoolean updateLock = new AtomicBoolean();
    
    /**
     * 获取为指定invocation缓存的invocation地址列表
     * for unit test only
     */
    protected <T> Collection<String> getInvokerAddrList(List<Invoker<T>> invokers, Invocation invocation) {
        String key = invokers.get(0).getUrl().getServiceKey() + "." + invocation.getMethodName();
        Map<String, WeightedRoundRobin> map = methodWeightMap.get(key);
        if (map != null) {
            return map.keySet();
        }
        return null;
    }
    
    @Override
    protected <T> Invoker<T> doSelect(List<Invoker<T>> invokers, URL url, Invocation invocation) {
        String key = invokers.get(0).getUrl().getServiceKey() + "." + invocation.getMethodName();
        ConcurrentMap<String, WeightedRoundRobin> map = methodWeightMap.get(key);
        if (map == null) {
            methodWeightMap.putIfAbsent(key, new ConcurrentHashMap<String, WeightedRoundRobin>());
            map = methodWeightMap.get(key);
        }
        int totalWeight = 0;
        long maxCurrent = Long.MIN_VALUE;
        long now = System.currentTimeMillis();
        Invoker<T> selectedInvoker = null;
        WeightedRoundRobin selectedWRR = null;
        for (Invoker<T> invoker : invokers) {
            String identifyString = invoker.getUrl().toIdentityString();
            WeightedRoundRobin weightedRoundRobin = map.get(identifyString);
            int weight = getWeight(invoker, invocation);

            if (weightedRoundRobin == null) {
                weightedRoundRobin = new WeightedRoundRobin();
                weightedRoundRobin.setWeight(weight);
                map.putIfAbsent(identifyString, weightedRoundRobin);
            }
            if (weight != weightedRoundRobin.getWeight()) {
                //weight changed
                weightedRoundRobin.setWeight(weight);
            }
            long cur = weightedRoundRobin.increaseCurrent();
            weightedRoundRobin.setLastUpdate(now);
            if (cur > maxCurrent) {
                maxCurrent = cur;
                selectedInvoker = invoker;
                selectedWRR = weightedRoundRobin;
            }
            totalWeight += weight;
        }
        if (!updateLock.get() && invokers.size() != map.size()) {
            if (updateLock.compareAndSet(false, true)) {
                try {
                    // copy -> modify -> update reference
                    ConcurrentMap<String, WeightedRoundRobin> newMap = new ConcurrentHashMap<>(map);
                    newMap.entrySet().removeIf(item -> now - item.getValue().getLastUpdate() > RECYCLE_PERIOD);
                    methodWeightMap.put(key, newMap);
                } finally {
                    updateLock.set(false);
                }
            }
        }
        if (selectedInvoker != null) {
            selectedWRR.sel(totalWeight);
            return selectedInvoker;
        }
        // should not happen here
        return invokers.get(0);
    }

}

```

> Nginx的负载均衡默认就是轮询

# 6 LeastActiveLoadBalance(最少活跃数)
- 最少活跃调用数，相同活跃数的随机，活跃数指调用前后计数差
- 使慢的提供者收到更少请求，因为越慢的提供者的调用前后计数差会越大。

举个例子.每个服务有一个活跃计数器
那么我们假如有A,B两个提供者.计数初始均为0
当A提供者开始处理请求,该计数+1,此时A还没处理完,当处理完后则计数-1
而B请求接收到请求处理得很快.B处理完后A还没处理完,所以此时A,B的计数为1,0
那么当有新的请求来的时候,就会选择B提供者(B的活跃计数比A小)
这就是文档说的,使慢的提供者收到更少请求

```java 
package org.apache.dubbo.rpc.cluster.loadbalance;

import org.apache.dubbo.common.URL;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.RpcStatus;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 过滤活动调用次数最少的调用者数量，并计算这些调用者的权重和数量。
 * 如果只有一个调用程序，则直接使用该调用程序；
 * 如果有多个调用者并且权重不相同，则根据总权重随机；
 * 如果有多个调用者且权重相同，则将其随机调用。
 */
public class LeastActiveLoadBalance extends AbstractLoadBalance {

    public static final String NAME = "leastactive";

    @Override
    protected <T> Invoker<T> doSelect(List<Invoker<T>> invokers, URL url, Invocation invocation) {
        // invoker的总个数
        int length = invokers.size();
        // invoker最小的活跃数
        int leastActive = -1;
        // 相同最小活跃数(leastActive)的invoker个数
        int leastCount = 0;
        // 相同最小活跃数(leastActive)的下标
        int[] leastIndexes = new int[length];
        // the weight of every invokers
        int[] weights = new int[length];
        // 所有最不活跃invoker的预热权重之和
        int totalWeight = 0;
        // 第一个最不活跃的invoker的权重, 用于于计算是否相同
        int firstWeight = 0;
        // 每个最不活跃的调用者都具有相同的权重值？
        boolean sameWeight = true;


        // Filter out all the least active invokers
        for (int i = 0; i < length; i++) {
            Invoker<T> invoker = invokers.get(i);
            // Get the active number of the invoker
            int active = RpcStatus.getStatus(invoker.getUrl(), invocation.getMethodName()).getActive();
            // Get the weight of the invoker's configuration. The default value is 100.
            int afterWarmup = getWeight(invoker, invocation);
            // save for later use
            weights[i] = afterWarmup;
            // If it is the first invoker or the active number of the invoker is less than the current least active number
            if (leastActive == -1 || active < leastActive) {
                // Reset the active number of the current invoker to the least active number
                leastActive = active;
                // Reset the number of least active invokers
                leastCount = 1;
                // Put the first least active invoker first in leastIndexes
                leastIndexes[0] = i;
                // Reset totalWeight
                totalWeight = afterWarmup;
                // Record the weight the first least active invoker
                firstWeight = afterWarmup;
                // Each invoke has the same weight (only one invoker here)
                sameWeight = true;
                // If current invoker's active value equals with leaseActive, then accumulating.
            } else if (active == leastActive) {
                // 记录leastIndexes order最小活跃数下标
                leastIndexes[leastCount++] = i;
                // 累计总权重
                totalWeight += afterWarmup;
                // If every invoker has the same weight?
                if (sameWeight && i > 0
                        && afterWarmup != firstWeight) {
                    sameWeight = false;
                }
            }
        }
        // Choose an invoker from all the least active invokers
        if (leastCount == 1) {
            // 如果只有一个最小则直接返回
            return invokers.get(leastIndexes[0]);
        }
        if (!sameWeight && totalWeight > 0) {
            // 如果权重不相同且权重大于0则按总权重数随机
            int offsetWeight = ThreadLocalRandom.current().nextInt(totalWeight);
            // 并确定随机值落在哪个片断上
            for (int i = 0; i < leastCount; i++) {
                int leastIndex = leastIndexes[i];
                offsetWeight -= weights[leastIndex];
                if (offsetWeight < 0) {
                    return invokers.get(leastIndex);
                }
            }
        }
        // 如果权重相同或权重为0则均等随机
        return invokers.get(leastIndexes[ThreadLocalRandom.current().nextInt(leastCount)]);
    }
}

```
## 分析
这部分代码概括起来就两部分
- 活跃数和权重的统计
- 选择invoker.也就是他把最小活跃数的invoker统计到leastIndexs数组中,如果权重一致(这个一致的规则参考上面的随机算法)或者总权重为0,则均等随机调用,如果不同,则从leastIndexs数组中按照权重比例调用(还是和随机算法中的那个依次相减的思路一样).还不明白没关系,看下面的流程图和数学分析

- 流程图
![](https://img-blog.csdnimg.cn/2019112319470815.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

## 理论
假设A,B,C,D节点的最小活跃数分别是1,1,2,3,权重为1,2,3,4.则leastIndexs(该数组是最小活跃数组,因为A,B的活跃数是1,均为最小)数组内容为[A,B].A,B的权重是1和2,所以调用A的概率为 1/(1+2) = 1/3,B的概率为 2/(1+2) = 2/3

活跃数的变化是在`org.apache.dubbo.rpc.filter.ActiveLimitFilter`中
如果没有配置`dubbo:reference`的`actives`属性,默认是调用前活跃数+1,调用结束-1
鉴于很多人可能没用过这个属性,所以我把文档截图贴出来

![](https://img-blog.csdnimg.cn/20191123194855158.png)
另外如果使用该种负载均衡算法,则`dubbo:service`中还需要配置`filter="activelimit"`

# 7 ConsistentHashLoadBalance(一致性哈希)
- 一致性 Hash，相同参数的请求总是发到同一提供者
- 当某一台提供者挂时，原本发往该提供者的请求，基于虚拟节点，平摊到其它提供者，不会引起剧烈变动。
- 推荐阅读
http://en.wikipedia.org/wiki/Consistent_hashing

缺省只对第一个参数 Hash，如果要修改，请配置

```bash
<dubbo:parameter key="hash.arguments" value="0,1" />
```

缺省用 160 份虚拟节点，如果要修改，请配置

```bash
<dubbo:parameter key="hash.nodes" value="320" />
```

```java
package org.apache.dubbo.rpc.cluster.loadbalance;

import org.apache.dubbo.common.URL;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.support.RpcUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import static org.apache.dubbo.common.constants.CommonConstants.COMMA_SPLIT_PATTERN;


public class ConsistentHashLoadBalance extends AbstractLoadBalance {
    public static final String NAME = "consistenthash";

    /**
     * Hash nodes name
     */
    public static final String HASH_NODES = "hash.nodes";

    /**
     * Hash arguments name
     */
    public static final String HASH_ARGUMENTS = "hash.arguments";

    private final ConcurrentMap<String, ConsistentHashSelector<?>> selectors = new ConcurrentHashMap<String, ConsistentHashSelector<?>>();

    @SuppressWarnings("unchecked")
    @Override
    protected <T> Invoker<T> doSelect(List<Invoker<T>> invokers, URL url, Invocation invocation) {
        String methodName = RpcUtils.getMethodName(invocation);
        String key = invokers.get(0).getUrl().getServiceKey() + "." + methodName;
        int identityHashCode = System.identityHashCode(invokers);
        ConsistentHashSelector<T> selector = (ConsistentHashSelector<T>) selectors.get(key);
        if (selector == null || selector.identityHashCode != identityHashCode) {
            selectors.put(key, new ConsistentHashSelector<T>(invokers, methodName, identityHashCode));
            selector = (ConsistentHashSelector<T>) selectors.get(key);
        }
        return selector.select(invocation);
    }

    private static final class ConsistentHashSelector<T> {

        private final TreeMap<Long, Invoker<T>> virtualInvokers;

        private final int replicaNumber;

        private final int identityHashCode;

        private final int[] argumentIndex;

        ConsistentHashSelector(List<Invoker<T>> invokers, String methodName, int identityHashCode) {
            this.virtualInvokers = new TreeMap<Long, Invoker<T>>();
            this.identityHashCode = identityHashCode;
            URL url = invokers.get(0).getUrl();
            this.replicaNumber = url.getMethodParameter(methodName, HASH_NODES, 160);
            String[] index = COMMA_SPLIT_PATTERN.split(url.getMethodParameter(methodName, HASH_ARGUMENTS, "0"));
            argumentIndex = new int[index.length];
            for (int i = 0; i < index.length; i++) {
                argumentIndex[i] = Integer.parseInt(index[i]);
            }
            for (Invoker<T> invoker : invokers) {
                String address = invoker.getUrl().getAddress();
                for (int i = 0; i < replicaNumber / 4; i++) {
                    byte[] digest = md5(address + i);
                    for (int h = 0; h < 4; h++) {
                        long m = hash(digest, h);
                        virtualInvokers.put(m, invoker);
                    }
                }
            }
        }

        public Invoker<T> select(Invocation invocation) {
            String key = toKey(invocation.getArguments());
            byte[] digest = md5(key);
            return selectForKey(hash(digest, 0));
        }

        private String toKey(Object[] args) {
            StringBuilder buf = new StringBuilder();
            for (int i : argumentIndex) {
                if (i >= 0 && i < args.length) {
                    buf.append(args[i]);
                }
            }
            return buf.toString();
        }

        private Invoker<T> selectForKey(long hash) {
            Map.Entry<Long, Invoker<T>> entry = virtualInvokers.ceilingEntry(hash);
            if (entry == null) {
                entry = virtualInvokers.firstEntry();
            }
            return entry.getValue();
        }

        private long hash(byte[] digest, int number) {
            return (((long) (digest[3 + number * 4] & 0xFF) << 24)
                    | ((long) (digest[2 + number * 4] & 0xFF) << 16)
                    | ((long) (digest[1 + number * 4] & 0xFF) << 8)
                    | (digest[number * 4] & 0xFF))
                    & 0xFFFFFFFFL;
        }

        private byte[] md5(String value) {
            MessageDigest md5;
            try {
                md5 = MessageDigest.getInstance("MD5");
            } catch (NoSuchAlgorithmException e) {
                throw new IllegalStateException(e.getMessage(), e);
            }
            md5.reset();
            byte[] bytes = value.getBytes(StandardCharsets.UTF_8);
            md5.update(bytes);
            return md5.digest();
        }

    }

}

```

该算法的代码实现拿出来讲的话篇幅较大,主要讲三个关键词,原理,down机影响,虚拟节点


### 原理
简单讲就是,假设我们有个时钟,各服务器节点映射放在钟表的时刻上,把key也映射到钟表的某个时刻上,然后key顺时针走,碰到的第一个节点则为我们需要找的服务器节点

还是假如我们有a,b,c,d四个节点(感觉整篇文章都在做这个假如....),把他们通过某种规则转成整数,分别为0,3,6,9.所以按照时钟分布如下图


![](https://img-blog.csdnimg.cn/20191123202305708.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
假设这个key通过某种规则转化成1,那么他顺时针碰到的第一个节点就是b,也就是b是我们要找的节点

> 这个规则你可以自己设计,但是要注意的是,不同的节点名,转换为相同的整数的概率就是衡量这个规则的好坏,如果你能做到不同的节点名唯一对应一个整数,那就是棒棒哒.当然java里面的CRC32这个类你可以了解一下.

说到这里可能又会有另个疑问,时钟点数有限,万一装不下怎么办

其实这个时钟只是方便大家理解做的比喻而已,在实际中,我们可以在圆环上分布[0,2^32-1]的数字,这量级全世界的服务器都可以装得下.

### down机影响
通过上图我们可以看出,当b节点挂了之后,根据顺时针的规则,那么目标节点就是c,也就是说,只影响了一个节点,其他节点不受影响.

如果是轮询的取模算法,假设从N台服务器变成了N-1台,那么命中率就变成1/(N-1),因此服务器越多,影响也就越大.

### 虚拟节点
为什么要有虚拟节点的概念呢?我们还是回到第一个假设,我们还是有a,b,c,d四个节点,他们通过某个规则转化成0,3,6,9这种自然是均匀的.但是万一是0,1,2,3这样,那就是非常不均匀了.事实上, 一般的Hash函数对于节点在圆环上的映射,并不均匀.所以我们需要引入虚拟节点,那么什么是虚拟节点呢?

假如有N个真实节点,把每个真实节点映射成M个虚拟节点,再把 M*N 个虚拟节点, 散列在圆环上. 各真实节点对应的虚拟节点相互交错分布这样,某真实节点down后,则把其影响平均分担到其他所有节点上.

也就是a,b,c,d的虚拟节点a0,a1,a2,b0,b1,b2,c0,c1,c2,d0,d1,d2散落在圆环上,假设C号节点down,则c0,c1,c2的压力分别传给d0,a1,b1,如下图
![](https://img-blog.csdnimg.cn/20191123210112583.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
# 参考
- https://www.jianshu.com/p/53feb7f5f5d9
- Dubbo官网
