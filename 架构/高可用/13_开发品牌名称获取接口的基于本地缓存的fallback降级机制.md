
回顾执行流程
1. 创建command
2. 执行command
3. request cache
4. 短路器，如果打开了，fallback降级机制

# 1 fallback降级机制
- Hystrix调用各种接口，或者访问外部依赖，MySQL，Redis，ZooKeeper，Kafka等,出现任何异常的情况,比如访问报错
- 对每个外部依赖，无论是服务接口，中间件，资源隔离，对外部依赖只能用一定量的资源去访问，线程池/信号量等资源池已满
- reject访问外部依赖的时候，访问时间过长，可能就会导致超时，报一个TimeoutException异常，timeout
- 对外部依赖的东西访问的时候出现了异常，发送异常事件到短路器中去进行统计
如果短路器发现异常事件的占比达到了一定比例，直接开启短路(circuit breaker)

上述四种情况，都会去调用fallback降级机制
fallback,你之前都是必须去调用外部的依赖接口，或者从MySQL中去查询数据的，但是为了避免说可能外部依赖会有故障

# 2  实现方案
## 2.1 纯内存数据
可以在内存中维护一个ECache，作为基于LRU自动清理的纯内存缓存，数据也可放入缓存
如果说外部依赖有异常，fallback这里，直接尝试从ECache中获取数据
## 2.2 默认值
本来你是从mysql，redis，或者其他任何地方去获取数据的，获取调用其他服务的接口的，结果人家故障了，人家挂了，fallback，可以返回一个默认值


run()抛出异常，超时，线程池或信号量满了，或短路了，都会调用fallback机制
## 案例
现在有个商品数据，brandId，品牌，假设拿到了一个商品数据以后，用brandId再调用一次请求，到其他的服务去获取品牌的最新名称

假如那个品牌服务挂掉了，那么我们可以尝试本地内存中，会保留一份时间比较过期的一份品牌数据，有些品牌没有，有些品牌的名称过期了,调用品牌服务失败了，fallback降级就从本地内存中获取一份过期的数据，先凑合着用着
```
public class CommandHelloFailure extends HystrixCommand<String> {

    private final String name;

    public CommandHelloFailure(String name) {
        super(HystrixCommandGroupKey.Factory.asKey("ExampleGroup"));
        this.name = name;
    }

    @Override
    protected String run() {
        throw new RuntimeException("this command always fails");
    }

    @Override
    protected String getFallback() {
        return "Hello Failure " + name + "!";
    }

}

@Test
public void testSynchronous() {
    assertEquals("Hello Failure World!", new CommandHelloFailure("World").execute());
}
```
HystrixObservableCommand，是实现resumeWithFallback方法

2、fallback.isolation.semaphore.maxConcurrentRequests

这个参数设置了HystrixCommand.getFallback()最大允许的并发请求数量，默认值是10，也是通过semaphore信号量的机制去限流 

如果超出了这个最大值，那么直接被reject
```
HystrixCommandProperties.Setter()
   .withFallbackIsolationSemaphoreMaxConcurrentRequests(int value)

```

# 参考

- 《Java工程师面试突击第1季-中华石杉老师》

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)

## [Github](https://github.com/Wasabi1234)