# SpringCloudGateway核心之Predicate


![在这里插入图片描述](https://yhmx.oss-rg-china-mainland.aliyuncs.com/springcloud/0824f170afc24252883854915b7aa74b.png)
## Predicate路由工厂
> Spring Cloud Gateway 将路由作为 Spring WebFluxHandlerMapping基础设施的一部分进行匹配。Spring Cloud Gateway 包含许多内置的路由Predicate 工厂。所有这些谓词都匹配 HTTP 请求的不同属性。多个 Route Predicate Factory 可以组合，并通过逻辑组合and。
##  After Route Predicate Factory
> After Route Predicate Factory 采用一个参数，即日期时间。此谓词匹配当前日期时间之后发生的请求。

```yaml
例子：此路线匹配 2017 年 1 月 20 日 17:42 山地时间（丹佛）之后的任何请求。
spring:
  cloud:
    gateway:
      routes:
      - id: after_route
        uri: https://example.org
        predicates:
        - After=2017-01-20T17:42:47.789-07:00[America/Denver]
```

##  Before Route Predicate Factory
> Before Route Predicate Factory 采用一个参数，即日期时间。此谓词匹配当前日期时间之前发生的请求。

```yaml
例子：此路线匹配 2017 年 1 月 20 日 17:42 山地时间（丹佛）之前的任何请求。
spring:
  cloud:
    gateway:
      routes:
      - id: before_route
        uri: https://example.org
        predicates:
        - Before=2017-01-20T17:42:47.789-07:00[America/Denver]
```
## Between Route Predicate Factory
>Between Route Predicate Factory 采用两个参数：datetime1 和 datetime2。此谓词匹配在 datetime1 之后和 datetime2 之前发生的请求。datetime2 参数必须位于 datetime1 之后。

```yaml
例子：此路线匹配 2017 年 1 月 20 日 17:42 山地时间（丹佛）之后和 2017 年 1 月 21 日 17:42 山地时间（丹佛）之前的任何请求。这对于维护窗口可能很有用。
spring:
  cloud:
    gateway:
      routes:
      - id: between_route
        uri: https://example.org
        predicates:
        - Between=2017-01-20T17:42:47.789-07:00[America/Denver], 2017-01-21T17:42:47.789-07:00[America/Denver]
```
##  Cookie Route Predicate Factory
> Cookie 路由谓词工厂采用两个参数：cookie 名称和正则表达式。此谓词匹配具有给定名称且值与正则表达式匹配的 cookie。

```yaml
例子：该路由匹配请求有一个名为chocolatewho 的值与ch.p正则表达式匹配的 cookie。
spring:
  cloud:
    gateway:
      routes:
      - id: cookie_route
        uri: https://example.org
        predicates:
        - Cookie=chocolate, ch.p
```
##  Header Route Predicate Factory
> 标头路由谓词工厂采用两个参数：标头名称和正则表达式。此谓词与具有给定名称且值与正则表达式匹配的标头匹配。

```yaml
例子：如果请求具有名为X-Request-Idwhos 值与\d+正则表达式匹配的标头（具有一位或多位数字的值），则此路由匹配。
spring:
  cloud:
    gateway:
      routes:
      - id: header_route
        uri: https://example.org
        predicates:
        - Header=X-Request-Id, \d+
```
##  Host Route Predicate Factory
> 主机路由谓词工厂采用一个参数：主机名模式列表。该模式是一个 Ant 风格模式，以.分隔符作为分隔符。该谓词匹配Host与模式匹配的标头。

```yaml
例子：还支持 URI 模板变量，例如{sub}.myhost.org.
如果请求的Host标头值为www.somehost.orgorbeta.somehost.org或，则此路由将匹配www.anotherhost.org。
该谓词提取 URI 模板变量（如上sub例中定义的）作为名称和值的映射，并将其放置在 中，ServerWebExchange.getAttributes()并使用 中定义的键ServerWebExchangeUtils.URI_TEMPLATE_VARIABLES_ATTRIBUTE。这些值随后可供GatewayFilter Factory使用
spring:
  cloud:
    gateway:
      routes:
      - id: header_route
        uri: https://example.org
        predicates:
        - Header=X-Request-Id, \d+
```
## Method Route Predicate Factory
> 方法路由谓词工厂采用一个参数：要匹配的 HTTP 方法。

```yaml
例子：如果请求方法是 ，则该路由将匹配GET。
spring:
  cloud:
    gateway:
      routes:
      - id: method_route
        uri: https://example.org
        predicates:
        - Method=GET
```
## Path Route Predicate Factory
> 路径路由谓词工厂采用两个参数：Spring 模式列表PathMatcher和可选标志matchOptionalTrailingSeparator。

```yaml
例子：如果请求路径是，例如：/foo/1or /foo/baror ，则该路由将匹配/bar/baz。
该谓词提取 URI 模板变量（如上segment例中定义的）作为名称和值的映射，并将其放置在 中，ServerWebExchange.getAttributes()并使用 中定义的键ServerWebExchangeUtils.URI_TEMPLATE_VARIABLES_ATTRIBUTE。这些值随后可供GatewayFilter Factory使用
spring:
  cloud:
    gateway:
      routes:
      - id: host_route
        uri: https://example.org
        predicates:
        - Path=/foo/{segment},/bar/{segment}
```
## Query Route Predicate Factory
> 查询路由谓词工厂采用两个参数：必需的param和可选的regexp。

```yaml
例子：如果请求包含baz查询参数，则该路由将匹配。
spring:
  cloud:
    gateway:
      routes:
      - id: query_route
        uri: https://example.org
        predicates:
        - Query=baz

```
## RemoteAddr Route Predicate Factory
> RemoteAddr 路由谓词工厂采用 CIDR 表示法（IPv4 或 IPv6）字符串的列表（最小大小为 1），例如192.168.0.1/16（其中192.168.0.1是 IP 地址，16是子网掩码）。

```yaml
例子：如果请求的远程地址是 ，则该路由将匹配192.168.1.10
spring:
  cloud:
    gateway:
      routes:
      - id: remoteaddr_route
        uri: https://example.org
        predicates:
        - RemoteAddr=192.168.1.1/24
```
## Modifying the way remote addresses are resolved
> 默认情况下，RemoteAddr 路由谓词工厂使用传入请求中的远程地址。如果 Spring Cloud Gateway 位于代理层后面，这可能与实际的客户端 IP 地址不匹配。
您可以通过设置自定义来自定义远程地址的解析方式RemoteAddressResolver。Spring Cloud Gateway 附带一个非默认远程地址解析器，该解析器基于X-Forwarded-For 标头, XForwardedRemoteAddressResolver。
XForwardedRemoteAddressResolver有两个静态构造函数方法，它们采用不同的安全方法：
XForwardedRemoteAddressResolver::trustAll返回 a RemoteAddressResolver，它始终采用标头中找到的第一个 IP 地址X-Forwarded-For。X-Forwarded-For这种方法很容易受到欺骗，因为恶意客户端可以设置解析器接受的初始值。
XForwardedRemoteAddressResolver::maxTrustedIndex采用与 Spring Cloud Gateway 前面运行的可信基础设施数量相关的索引。例如，如果 Spring Cloud Gateway 只能通过 HAProxy 访问，则应使用值 1。如果在访问 Spring Cloud Gateway 之前需要可信基础设施的两跳，则应使用值 2。

给定下面的header值:

> X-Forwarded-For: 0.0.0.1, 0.0.0.2, 0.0.0.3

使用Java配置：

```java
RemoteAddressResolver resolver = XForwardedRemoteAddressResolver
    .maxTrustedIndex(1);

...

.route("direct-route",
    r -> r.remoteAddr("10.1.1.1", "10.10.1.1/24")
        .uri("https://downstream1")
.route("proxied-route",
    r -> r.remoteAddr(resolver,  "10.10.1.1", "10.10.1.1/24")
        .uri("https://downstream2")
)
```
