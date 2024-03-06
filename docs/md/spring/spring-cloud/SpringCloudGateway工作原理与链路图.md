# SpringCloudGateway基本介绍

> Spring Cloud Gateway 构建于Spring Boot 2.x、 Spring WebFlux和Project Reactor之上。因此，在使用 Spring Cloud Gateway 时，您可能不会应用许多熟悉的同步库（例如 Spring Data 和 Spring Security）和模式。
> Spring Cloud Gateway 需要 Spring Boot 和 Spring Webflux 提供的 Netty 运行时。它不能在传统的 Servlet 容器中工作，也不能作为 WAR 构建。
> 该项目提供了一个用于在 Spring WebFlux 或 Spring WebMVC 之上构建 API 网关的库。Spring Cloud Gateway 旨在提供一种简单而有效的方法来路由到 API 并为其提供横切关注点，例如：安全性、监控/指标和弹性。

## SpringCloudGateway工作原理
### Spring Cloud网关的特点：
1. 基于 Spring 框架和 Spring Boot 构建
2.  能够匹配任何请求属性上的路由。
3.  谓词和过滤器特定于路由。
4.  断路器集成。
5. Spring Cloud Discovery客户端集成
6. 易于编写谓词和过滤器
7. 请求速率限制
8. 路径重写

### Spring Cloud网关请求链路图
![在这里插入图片描述](http://124.222.54.192:4000/public/upload/2024/03/06/202403061427488662.png)
1. Route：一个 Route 由路由 ID，转发 URI，多个 Predicates 以及多个 Filters 构成。Gateway 上可以配置多个 Routes。处理请求时会按优先级排序，找到第一个满足所有 Predicates 的 Route；
2. Predicate：表示路由的匹配条件，可以用来匹配请求的各种属性，如请求路径、方法、header 等。一个 Route 可以包含多个子 Predicates，多个子 Predicates 最终会合并成一个；
3. Filter：过滤器包括了处理请求和响应的逻辑，可以分为 pre 和 post 两个阶段。多个 Filter 在 pre 阶段会按优先级高到低顺序执行，post 阶段则是反向执行。Gateway 包括两类 Filter。
4. 全局 Filter：每种全局 Filter 全局只会有一个实例，会对所有的 Route 都生效。
5. 路由 Filter：路由 Filter 是针对 Route 进行配置的，不同的 Route 可以使用不同的参数，因此会创建不同的实例。

```java
调试Demo局部code
@SpringBootApplication
public class DemogatewayApplication {
	@Bean
	public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
		return builder.routes()
			.route("path_route", r -> r.path("/get")
				.uri("http://httpbin.org"))
			.route("host_route", r -> r.host("*.myhost.org")
				.uri("http://httpbin.org"))
			.route("rewrite_route", r -> r.host("*.rewrite.org")
				.filters(f -> f.rewritePath("/foo/(?<segment>.*)", "/${segment}"))
				.uri("http://httpbin.org"))
			.route("hystrix_route", r -> r.host("*.hystrix.org")
				.filters(f -> f.hystrix(c -> c.setName("slowcmd")))
				.uri("http://httpbin.org"))
			.route("hystrix_fallback_route", r -> r.host("*.hystrixfallback.org")
				.filters(f -> f.hystrix(c -> c.setName("slowcmd").setFallbackUri("forward:/hystrixfallback")))
				.uri("http://httpbin.org"))
			.route("limit_route", r -> r
				.host("*.limited.org").and().path("/anything/**")
				.filters(f -> f.requestRateLimiter(c -> c.setRateLimiter(redisRateLimiter())))
				.uri("http://httpbin.org"))
			.build();
	}
}
```
## SpringCloudGateway版本介绍
![在这里插入图片描述](http://124.222.54.192:4000/public/upload/2024/03/05/202403051401373075.png)

## SpringCloudGateway运行结构图
![在这里插入图片描述](http://124.222.54.192:4000/public/upload/2024/03/05/202403051401372859.png)

1. 客户端向 Spring Cloud Gateway 发出请求。
2. 如果网关处理程序映射确定请求与路由匹配，则会将其发送到网关 Web 处理程序。
3. 此处理程序运行通过特定于请求的过滤器链发送请求。
4. 过滤器被虚线分开的原因是过滤器可能在发送代理请求之前或之后执行逻辑。
5. 执行所有“预”过滤器逻辑，然后发出代理请求。
6. 发出代理请求后，执行“post”过滤器逻辑。

*在没有端口的路由中定义的 URI 将分别为 HTTP 和 HTTPS URI 设置为 80 和 443 的默认端口。*