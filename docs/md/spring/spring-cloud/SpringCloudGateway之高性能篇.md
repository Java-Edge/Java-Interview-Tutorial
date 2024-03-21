# SpringCloudGateway之高性能篇
## 背景
>在公司的开放平台中，为了统一管理对外提供的接口、处理公共逻辑、实现安全防护及流量控制，确实需要一个API网关作为中间层。
![在这里插入图片描述](https://yhmx.oss-rg-china-mainland.aliyuncs.com/springcloud/image-20240321114027051.png)

## 场景
>统一接入点:
>API网关作为所有对外服务的单一入口，简化客户端对内部系统的访问，同时方便整体管理和运维。

>公共逻辑处理:
>在Spring Cloud Gateway中，可以通过自定义过滤器（GatewayFilter）的方式集中处理公共逻辑，例如全局异常处理、日志记录、跨域支持等。

>权限验证:
>可以在过滤器中实现JWT token验证或者其他认证方式，验证请求的合法性。例如，可以通过pre类型的过滤器对请求头中的Authorization信息进行验证。

>限流控制:
>使用Spring Cloud Gateway内置的RequestRateLimiter过滤器或者集成第三方限流组件（如Sentinel或Redis RateLimiter），限制来自单个IP地址、用户或服务的请求速率，防止因过载导致系统崩溃。

>路由转发:
>根据请求路径或其他条件，通过定义路由规则（RoutePredicateFactory）将请求转发至对应的服务实例，同时也可在路由层面实现灰度发布、A/B测试等功能。

>熔断与降级:
>集成熔断组件如Hystrix或Resilience4j，当后端服务不可用或响应过慢时，及时触发熔断机制，返回预设的错误提示或默认数据，避免连锁反应导致整个系统崩溃。
## SpringCloudGateway示例
```yaml
spring:
  cloud:
    gateway:
      routes:
      - id: my_public_api
        uri: lb://backend-service
        predicates:
        - Path=/api/public/**
        filters:
        - name: TokenAuthenticationFilter # 自定义的Token验证过滤器
        - name: RequestRateLimiter # 限流过滤器
          args:
            key-resolver: "#{@remoteAddrKeyResolver}"
            rate-limiter: "#{@customRateLimiter}"
        - name: Hystrix # 熔断过滤器
          args:
            name: fallbackcmd
            fallbackUri: forward:/fallback
```

## SpringCloudGateway与zuul区别


| 维度  | SpringCloudGateway |zuul|
|--|--|--|
| 社区生态 | 社区热度高 |社区热度较低、中文文档多|
|易用性 | spring cloud 组件集成;基于springboot2.0;需要项目升级至springboot2.X |spring cloud netflix组件集成zuul1.x版本，1.x版本基于阻塞io;2.X版本就netty，异步非阻塞io，支持长连接，但springcloud暂时未集成。zuu1.x版本基于springboot1.x|
| 性能 | nacos+spring cloud gateway+service;个人本地压测;100并发:3ms;500并发:3ms;5000并发:320ms。相关资料:并发较低的情况下两者一样，并发较高springcloudgateway是zuul1.x的1.6倍 |eureka+zuul+service。个人本地压测:100并发:3ms;500并发:5ms;5000并发:267ms|
| 维护状态 | springcloud组件，持续更新，版本从2.0.0开始 |springcloud组件仅支持到1.X，zuulcore持续维护2.1.4至今|
| 重点功能，特点 | 过滤器有global filter和gatewayfilter，分为全局和局部;基于netty转发。 |过滤器仅为全局过滤器;基于servlet同步阻塞转懾穵咗榼瘛澔者瓯。|

## 网关整体设计及常用架构
![在这里插入图片描述](https://yhmx.oss-rg-china-mainland.aliyuncs.com/springcloud/image-20240321165105648.png)

![在这里插入图片描述](https://yhmx.oss-rg-china-mainland.aliyuncs.com/springcloud/image-20240321165233332.png)

## 优化思路
>1、去掉不必要的日志打印
>2、调整中间件的关键参数和回收机制
>3、框架核心代码重写
>4、路由分级切割
>5、多级网关路由设计
![在这里插入图片描述](https://yhmx.oss-rg-china-mainland.aliyuncs.com/springcloud/image-20240321170452240.png)
![在这里插入图片描述](https://yhmx.oss-rg-china-mainland.aliyuncs.com/springcloud/image-20240321170719040.png)
