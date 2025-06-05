# 响应式编程的适用场景

## 0 前提

响应式流、背压及响应式流规范。

## 1 引言

- 响应式编程能应用到啥场景?
- 目前有啥框架用到这技术体系?

## 2 响应式编程应用场景

响应式编程不仅是编程技术，更是一种架构设计的系统方法，可应用于任何地方：

- 简单的 Web 应用系统
- 大型企业解决方案

数据流处理是响应式编程一大应用场景，流式系统特点：

- 低延迟
- 高吞吐量

用非阻塞式通信，可确保资源高效利用，实现低延迟、高吞吐量。

高并发通常涉及大量 IO 操作，相比传统同步阻塞式 IO 模型，响应式编程的异步非阻塞式IO模型适合应对。

网关：响应来自前端系统的流量，并将其转发到后端服务。

### 核心诉求

构建一个具有异步非阻塞式的请求处理流程的 Web 服务，需要高效处理跨服务之间的网络请求。

响应式编程的广泛应用：Hystrix、Spring Cloud Gateway 及 Spring WebFlux。

## 3 响应式流规范

### 3.1 Hystrix滑动窗口

Spring Cloud Netflix Hystrix 基于 Netflix Hystrix 实现服务熔断功能。Netflix Hystrix，Netflix 开源的一款容错库，使用HystrixCircuitBreaker类实现熔断器。

#### 咋动态获取系统运行时的各项数据？

HealthCountsStream采用滑动窗口，大量采用数据流处理方面技术及 RxJava 响应式编程框架。Hystrix 以s为单位统计系统中所有请求的处理情况，再每次取最近 10s 数据计算，如失败率超过阈值，熔断。

#### 实现

把系统运行时产生数据视为一个个事件，滑动窗口中每个桶的数据都来自事件，通常需对其转换以便后续操作。

Hystrix采用RxJava，用其一系列操作符实现滑动窗口：

- window 操作符，把当前流中的元素收集到另外的流序列
- flatMap 操作符，把流中的每个元素转换成一个流，再把转换之后得到的所有流中的元素进行合并
- reduce 操作符，对流中包含的所有元素进行累积操作，得到一个包含计算结果的流

```java
this.bucketedStream = Observable.defer(new Func0<Observable<Bucket>>() {

    @Override
    public Observable<Bucket> call() {
        return inputEventStream
            .observe()
            // 使用 window 操作符收集一个 Bucket 时间内的数据
            .window(bucketSizeInMs, TimeUnit.MILLISECONDS)
            // 将每个 window 内聚集起来的事件集合汇总成 Bucket
            .flatMap(reduceBucketToSummary)
            .startWith(emptyEventCountsToStart);
    }
});
```

```java
this.sourceStream = bucketedStream
    // 将 N 个 Bucket 进行汇总
    .window(numBuckets, 1)
    // 汇总成一个窗口
    .flatMap(reduceWindowToSummary)
    ...
    // 添加背压控制
    .onBackpressureDrop();
```

Hystrix 用 RxJava 的 window、flatMap等操作符来将单位窗口时间内的事件。以及将一个窗口大小内的 Bucket 聚集到一起形成滑动窗口，并基于滑动窗口集成指标数据。

### 3.2 Spring Cloud Gateway中的过滤器

Spring开发的API网关，基于Spring5和Spring Boot2和Proiect Reactor框架提供响应式、非阻塞式I/O模型：

![](https://p.ipic.vip/cgphl2.png)

只需实现GlobalFilter接口，重写 filter()：

```java
public class IPLimitFilter implements GlobalFilter

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        // 1 获取当前请求路径
        String url = exchange.getRequest().getURI().getPath();

        // 2 获得所有需ip限流校验的url list
        List<String> ipLimitList = excludeUrlProperties.getIpLimitUrls();

        // 3 校验并判断
        if (ipLimitList != null && !ipLimitList.isEmpty()) {
            for (String limitUrl : ipLimitList) {
                if (antPathMatcher.matchStart(limitUrl, url)) {
                    // 若匹配到，则表明需进行ip拦截校验
                    log.info("IPLimitFilter - 拦截到需要进行ip限流校验的方法：URL = " + url);
                    return doLimit(exchange, chain);
                }
            }
        }

        // 4 默认放行
        return chain.filter(exchange);
    }
}
```

filter()返回的Mono对象，是响应式编程框架 Project Reactor 中代表**单个返回值的流式对象**。

#### 案例

```java
@Component
public class PreGatewayFilterFactory extends AbstractGatewayFilterFactory<PreGatewayFilterFactory.Config> {

	public PreGatewayFilterFactory() {
		super(Config.class);
	}

	@Override
	public GatewayFilter apply(Config config) {
		// grab configuration from Config object
		return (exchange, chain) -> {
			//If you want to build a "pre" filter you need to manipulate the
			//request before calling chain.filter
			ServerHttpRequest.Builder builder = exchange.getRequest().mutate();
			//use builder to manipulate the request
			return chain.filter(exchange.mutate().request(builder.build()).build());
		};
	}

	public static class Config {
		//Put the configuration properties for your filter here
	}

}
```

### 3.3 Spring Webflux 中的请求处理流程

Spring 5 中引入的全新的响应式 Web 服务开发框架。针对涉及大量I/O 操作的服务化架构，WebFlux也是解决方案。

#### 工作流程

![](https://p.ipic.vip/3v94dk.png)

#### 示例

```java
public Mono<Void> handle(ServerWebExchange exchange) {
    if (this.handlerMappings == null) {
        return createNotFoundError();
    }

    return Flux.fromIterable(this.handlerMappings)
            .concatMap(mapping -> mapping.getHandler(exchange))
            .next()
            // 如果没有找到 HandlerMapping，则抛出异常
            .switchIfEmpty(createNotFoundError())
            // 触发 HandlerAdapter 的 handle 方法
            .flatMap(handler -> invokeHandler(exchange, handler))
            // 触发HandlerResultHandler的handleResult方法
            .flatMap(result -> handleResult(exchange, result));
}
```

## 4 总结

通过理论联系实际，讨论了响应式编程的具体应用场景。

响应式编程技术已经应用到了日常开发的很多开源框架中，这些框架在分布式系统和微服务架构中得到了广泛的应用。

## FAQ

Q：Netflix Hystrix 中基于响应式流的滑动窗口实现机制?

A：Netflix Hystrix 中基于响应式流的滑动窗口实现机制是通过在数据流中使用滑动窗口来实现的。滑动窗口是一种将数据流分成固定大小的块的技术，每个块的大小和时间范围是可配置的。在 Hystrix 中，滑动窗口被用来收集服务调用的响应时间、成功率等指标，并在这些指标上执行断路器逻辑。

### 具体实现

1. Hystrix为每个服务调用创建一个独立的滑动窗口，滑动窗口包含最近一段时间内所有调用指标
2. 滑动窗口会根据配置的时间范围和块大小进行分割，并在每个块中记录指标数据
3. 每个块都有一个计数器来记录成功和失败的调用次数以及响应时间等指标
4. 在每个块的结束时，Hystrix会根据计数器中的数据计算出该块的成功率、平均响应时间等指标，并将这些数据发送到断路器中进行判断
5. 如果断路器发现连续若干个时间段内的成功率低于阈值或平均响应时间超过阈值，就会触发断路器打开操作，停止向该服务发送请求
6. 当断路器打开后，Hystrix 会定期尝试发送一个测试请求到该服务，如果测试请求成功，则断路器关闭，否则继续保持打开状态

通过基于响应式流的滑动窗口实现机制，Hystrix 可以快速地检测到服务调用失败、超时等问题，并在出现问题时快速地停止向该服务发送请求，从而提高了系统的可靠性和稳定性。