# SpringCloudGateway-核心之Filter-自定义全局Filter-自定义局部Filter介绍
## 核心之Filter
>路由过滤器允许以某种方式修改传入的 HTTP 请求或传出的 HTTP 响应。
>路由过滤器的范围仅限于特定路由。
>Spring Cloud Gateway 包含许多内置的 GatewayFilter Factory。
### AddRequestHeader网关过滤器工厂
>AddRequestHeader GatewayFilter Factory 采用名称和值参数。
```yaml
例子：这会将X-Request-Foo:Bar标头添加到所有匹配请求的下游请求标头中。
spring:
  cloud:
    gateway:
      routes:
      - id: add_request_header_route
        uri: https://example.org
        filters:
        - AddRequestHeader=X-Request-Foo, Bar
AddRequestHeader 知道用于匹配路径或主机的 URI 变量。URI 变量可以在值中使用，并将在运行时扩展。
spring:
  cloud:
    gateway:
      routes:
      - id: add_request_header_route
        uri: https://example.org
        predicates:
        - Path=/foo/{segment}
        filters:
        - AddRequestHeader=X-Request-Foo, Bar-{segment}
```

### 添加请求参数网关过滤器工厂
>AddRequestHeader GatewayFilter Factory 采用名称和值参数。
```yaml
例子：这将添加foo=bar到所有匹配请求的下游请求的查询字符串中。
spring:
  cloud:
    gateway:
      routes:
      - id: add_request_parameter_route
        uri: https://example.org
        filters:
        - AddRequestParameter=foo, bar

AddRequestParameter 知道用于匹配路径或主机的 URI 变量。URI 变量可以在值中使用，并将在运行时扩展。
spring:
  cloud:
    gateway:
      routes:
      - id: add_request_parameter_route
        uri: https://example.org
        predicates:
        - Host: {segment}.myhost.org
        filters:
        - AddRequestParameter=foo, bar-{segment}

```
### 添加响应头网关过滤器工厂
>AddResponseHeader GatewayFilter Factory 采用名称和值参数。
```yaml
例子：这会将X-Response-Foo:Bar标头添加到所有匹配请求的下游响应标头中。
spring:
  cloud:
    gateway:
      routes:
      - id: add_response_header_route
        uri: https://example.org
        filters:
        - AddResponseHeader=X-Response-Foo, Bar

AddResponseHeader 知道用于匹配路径或主机的 URI 变量。URI 变量可以在值中使用，并将在运行时扩展。
spring:
  cloud:
    gateway:
      routes:
      - id: add_response_header_route
        uri: https://example.org
        predicates:
        - Host: {segment}.myhost.org
        filters:
        - AddResponseHeader=foo, bar-{segment}

```
### DedupeResponseHeader 网关过滤器工厂
>DedupeResponseHeader GatewayFilter Factory 采用一个name参数和一个可选strategy参数。name可以包含标头名称列表，以空格分隔。
```yaml
例子：当网关 CORS 逻辑和下游都添加重复值Access-Control-Allow-Credentials和响应标头时，这将删除它们。Access-Control-Allow-Origin
DedupeResponseHeader 过滤器还接受可选strategy参数。接受的值为RETAIN_FIRST（默认）、RETAIN_LAST和RETAIN_UNIQUE。
spring:
  cloud:
    gateway:
      routes:
      - id: dedupe_response_header_route
        uri: https://example.org
        filters:
        - DedupeResponseHeader=Access-Control-Allow-Credentials Access-Control-Allow-Origin

```


### Hystrix 网关过滤器工厂
>Hystrix是 Netflix 的一个库，它实现了断路器模式。Hystrix GatewayFilter 允许您在网关路由中引入断路器，保护您的服务免受级联故障的影响，并允许您在出现下游故障时提供回退响应。
要在项目中启用 Hystrix GatewayFilters，请添加spring-cloud-starter-netflix-hystrix来自Spring Cloud Netflix 的依赖项。
```yaml
Hystrix GatewayFilter Factory 需要一个name参数，即HystrixCommand.

spring:
  cloud:
    gateway:
      routes:
      - id: hystrix_route
        uri: https://example.org
        filters:
        - Hystrix=myCommandName
这将剩余的过滤器包装在HystrixCommandwith command name中myCommandName。

Hystrix 过滤器还可以接受可选fallbackUri参数。目前，仅forward:支持方案 URI。如果调用后备，请求将转发到与 URI 匹配的控制器。


spring:
  cloud:
    gateway:
      routes:
      - id: hystrix_route
        uri: lb://backing-service:8088
        predicates:
        - Path=/consumingserviceendpoint
        filters:
        - name: Hystrix
          args:
            name: fallbackcmd
            fallbackUri: forward:/incaseoffailureusethis
        - RewritePath=/consumingserviceendpoint, /backingserviceendpoint
/incaseoffailureusethis当 Hystrix 回退被调用时，这将转发到URI。lb请注意，此示例还通过目标 URI 上的前缀演示（可选）Spring Cloud Netflix Ribbon 负载平衡。

主要场景是使用fallbackUri网关应用程序内的内部控制器或处理程序。但是，也可以将请求重新路由到外部应用程序中的控制器或处理程序，如下所示：



spring:
  cloud:
    gateway:
      routes:
      - id: ingredients
        uri: lb://ingredients
        predicates:
        - Path=//ingredients/**
        filters:
        - name: Hystrix
          args:
            name: fetchIngredients
            fallbackUri: forward:/fallback
      - id: ingredients-fallback
        uri: http://localhost:9994
        predicates:
        - Path=/fallback
在此示例中，网关应用程序中没有fallback端点或处理程序，但是，另一个应用程序中有一个端点或处理程序，在http://localhost:9994.

如果请求被转发到回退，Hystrix Gateway 过滤器还会提供Throwable导致该请求的原因。它被添加到ServerWebExchange作为 ServerWebExchangeUtils.HYSTRIX_EXECUTION_EXCEPTION_ATTR在网关应用程序中处理回退时可以使用的属性。

对于外部控制器/处理程序场景，可以添加包含异常详细信息的标头。您可以在FallbackHeaders GatewayFilter Factory 部分找到更多信息。

Hystrix 设置（例如超时）可以使用全局默认值进行配置，也可以使用应用程序属性按路由进行配置，如Hystrix wiki中所述。

要为上面的示例路由设置 5 秒超时，将使用以下配置：



hystrix.command.fallbackcmd.execution.isolation.thread.timeoutInMilliseconds : 5000
```
### FallbackHeaders GatewayFilter 工厂
>AddRequestHeader GatewayFilter Factory 采用名称和值参数。
```yaml
例子：工厂FallbackHeaders允许您在转发到外部应用程序的请求的标头中添加 Hystrix 执行异常详细信息fallbackUri
spring:
  cloud:
    gateway:
      routes:
      - id: ingredients
        uri: lb://ingredients
        predicates:
        - Path=//ingredients/**
        filters:
        - name: Hystrix
          args:
            name: fetchIngredients
            fallbackUri: forward:/fallback
      - id: ingredients-fallback
        uri: http://localhost:9994
        predicates:
        - Path=/fallback
        filters:
        - name: FallbackHeaders
          args:
            executionExceptionTypeHeaderName: Test-Header
在此示例中，在运行 时发生执行异常后HystrixCommand，请求将被转发到fallback在 上运行的应用程序中的端点或处理程序localhost:9994。带有异常类型、消息以及（如果可用）根本原因异常类型和消息的标头将由过滤器添加到该请求中FallbackHeaders。
通过设置下面列出的参数值及其默认值，可以在配置中覆盖标头的名称：
executionExceptionTypeHeaderName( "Execution-Exception-Type")
executionExceptionMessageHeaderName( "Execution-Exception-Message")
rootCauseExceptionTypeHeaderName( "Root-Cause-Exception-Type")
rootCauseExceptionMessageHeaderName( "Root-Cause-Exception-Message")
```
### MapRequestHeader网关过滤器工厂
>MapRequestHeader GatewayFilter Factory 采用“fromHeader”和“toHeader”参数。它创建一个新的命名标头 (toHeader)，并从传入的 http 请求中的现有命名标头 (fromHeader) 中提取该值。如果输入标头不存在，则过滤器没有影响。如果新的命名标头已经存在，那么它的值将使用新值进行扩充。
```yaml
例子：这会将X-Request-Foo:<values>标头添加到下游请求，其中包含来自传入 http 请求Bar标头的更新值。
spring:
  cloud:
    gateway:
      routes:
      - id: map_request_header_route
        uri: https://example.org
        filters:
        - MapRequestHeader=Bar, X-Request-Foo

```
### PrefixPath 网关过滤器工厂
>PrefixPath GatewayFilter Factory 采用单个prefix参数。
```yaml
例子：这将/mypath作为所有匹配请求的路径的前缀。因此，请求/hello, 将被发送至/mypath/hello。
spring:
  cloud:
    gateway:
      routes:
      - id: prefixpath_route
        uri: https://example.org
        filters:
        - PrefixPath=/mypath

```
### PreserveHostHeader 网关过滤器工厂
>PreserveHostHeader GatewayFilter Factory 没有参数。该过滤器设置一个请求属性，路由过滤器将检查该属性以确定是否应发送原始主机标头，而不是由 http 客户端确定的主机标头。
```yaml
例子：这会将X-Request-Foo:Bar标头添加到所有匹配请求的下游请求标头中。
AddRequestHeader 知道用于匹配路径或主机的 URI 变量。URI 变量可以在值中使用，并将在运行时扩展。
spring:
  cloud:
    gateway:
      routes:
      - id: preserve_host_route
        uri: https://example.org
        filters:
        - PreserveHostHeader

```
### RequestRateLimiter网关过滤器工厂
>RequestRateLimiter GatewayFilter Factory 使用RateLimiter实现来确定是否允许当前请求继续。如果不是，HTTP 429 - Too Many Requests则返回状态（默认情况下）。
该过滤器采用可选keyResolver参数和特定于速率限制器的参数（见下文）。
keyResolver是一个实现该接口的bean KeyResolver。在配置中，使用 SpEL 按名称引用 bean。#{@myKeyResolver}是引用名为 的 bean 的 SpEL 表达式myKeyResolver。
```yaml
例子：这会将X-Request-Foo:Bar标头添加到所有匹配请求的下游请求标头中。
AddRequestHeader 知道用于匹配路径或主机的 URI 变量。URI 变量可以在值中使用，并将在运行时扩展。
spring:
  cloud:
    gateway:
      routes:
      - id: requestratelimiter_route
        uri: https://example.org
        filters:
        - name: RequestRateLimiter
          args:
            redis-rate-limiter.replenishRate: 10
            redis-rate-limiter.burstCapacity: 20

```
### 重定向到网关过滤器工厂
>RedirectTo GatewayFilter Factory 采用status和url参数。状态应该是 300 系列重定向 http 代码，例如 301。 url 应该是有效的 url。这将是标头的值Location。
```yaml
例子：这会将X-Request-Foo:Bar标头添加到所有匹配请求的下游请求标头中。
AddRequestHeader 知道用于匹配路径或主机的 URI 变量。URI 变量可以在值中使用，并将在运行时扩展。
spring:
  cloud:
    gateway:
      routes:
      - id: prefixpath_route
        uri: https://example.org
        filters:
        - RedirectTo=302, https://acme.org

```
### RemoveHopByHopHeadersFilter网关过滤器工厂
>RemoveHopByHopHeadersFilter GatewayFilter Factory 从转发的请求中删除标头。删除的默认标头列表来自IETF。
默认删除的标头是：
联系
活着
代理认证
代理授权
TE
预告片
传输编码
升级
要更改此设置，请将该spring.cloud.gateway.filter.remove-non-proxy-headers.headers属性设置为要删除的标头名称列表。
```yaml
例子：这会将X-Request-Foo:Bar标头添加到所有匹配请求的下游请求标头中。
AddRequestHeader 知道用于匹配路径或主机的 URI 变量。URI 变量可以在值中使用，并将在运行时扩展。
spring:
  cloud:
    gateway:
      routes:
      - id: removerequestheader_route
        uri: https://example.org
        filters:
        - RemoveRequestHeader=X-Request-Foo

```
### 删除请求头网关过滤器工厂
>RemoveRequestHeader GatewayFilter Factory 采用一个name参数。它是要删除的标头的名称。
```yaml
例子：X-Request-Foo这将在向下游发送之前删除标头。
spring:
  cloud:
    gateway:
      routes:
      - id: removeresponseheader_route
        uri: https://example.org
        filters:
        - RemoveResponseHeader=X-Response-Foo

```
### 删除响应头网关过滤器工厂
>RemoveResponseHeader GatewayFilter Factory 采用一个name参数。它是要删除的标头的名称。
```yaml
例子：X-Response-Foo这将在响应返回到网关客户端之前从响应中删除标头。

要删除任何类型的敏感标头，您应该为您可能想要执行此操作的任何路由配置此过滤器。此外，您可以在使用后配置此过滤器spring.cloud.gateway.default-filters 并将其应用于所有路由。
spring:
  cloud:
    gateway:
      routes:
      - id: removeresponseheader_route
        uri: https://example.org
        filters:
        - RemoveResponseHeader=X-Response-Foo

```
### RewritePath 网关过滤器工厂
>RewritePath GatewayFilter Factory 采用路径regexp参数和replacement参数。这使用 Java 正则表达式来灵活地重写请求路径。
```yaml
例子：这会将X-Request-Foo:Bar标头添加到所有匹配请求的下游请求标头中。
AddRequestHeader 知道用于匹配路径或主机的 URI 变量。URI 变量可以在值中使用，并将在运行时扩展。
spring:
  cloud:
    gateway:
      routes:
      - id: rewriteresponseheader_route
        uri: https://example.org
        filters:
        - RewriteResponseHeader=X-Response-Foo, , password=[^&]+, password=***

```
### RewriteLocationResponseHeader 网关过滤器工厂
>RewriteLocationResponseHeader GatewayFilter Factory 修改响应标头的值Location，通常是为了删除后端特定的详细信息。它需要stripVersionMode、locationHeaderName、hostValue和protocolsRegex参数。
```yaml
例子：例如，对于请求，响应标头值将被重写为。POST https://api.example.com/some/object/nameLocationhttps://object-service.prod.example.net/v2/some/object/idhttps://api.example.com/some/object/id
参数stripVersionMode有以下可能值：NEVER_STRIP、AS_IN_REQUEST（默认）、ALWAYS_STRIP。
NEVER_STRIP- 版本不会被剥离，即使原始请求路径不包含版本
AS_IN_REQUEST- 仅当原始请求路径不包含版本时才会删除版本
ALWAYS_STRIP- 版本将被剥离，即使原始请求路径包含版本
参数hostValue（如果提供）将用于替换host:port响应Location标头的部分。Host如果未提供，则将使用请求标头的值。
参数protocolsRegex必须是有效的正则表达式String，协议名称将与其匹配。如果不匹配，过滤器将不执行任何操作。默认为http|https|ftp|ftps.
spring:
  cloud:
    gateway:
      routes:
      - id: rewriteresponseheader_route
        uri: https://example.org
        filters:
        - RewriteResponseHeader=X-Response-Foo, , password=[^&]+, password=***

```
### RewriteResponseHeader 网关过滤器工厂
>RewriteResponseHeader GatewayFilter Factory 采用name、regexp和replacement参数。它使用 Java 正则表达式以灵活的方式重写响应标头值。
```yaml
例子：对于标头值，它将在发出下游请求后/42?user=ford&password=omg!what&flag=true设置为。/42?user=ford&password=***&flag=true请使用$\表示$因为 YAML 规范。
spring:
  cloud:
    gateway:
      routes:
      - id: rewriteresponseheader_route
        uri: https://example.org
        filters:
        - RewriteResponseHeader=X-Response-Foo, , password=[^&]+, password=***

```
### 保存会话网关过滤器工厂
>SaveSession GatewayFilter Factory在将调用转发到下游之前WebSession::save强制执行操作。当使用带有惰性数据存储的Spring Session之类的东西时，这特别有用，并且需要确保在进行转发调用之前已保存会话状态。
```yaml
例子：如果您正在将Spring Security与 Spring Session 集成，并且希望确保安全详细信息已转发到远程进程，那么这一点至关重要。
spring:
  cloud:
    gateway:
      routes:
      - id: save_session
        uri: https://example.org
        predicates:
        - Path=/foo/**
        filters:
        - SaveSession

```