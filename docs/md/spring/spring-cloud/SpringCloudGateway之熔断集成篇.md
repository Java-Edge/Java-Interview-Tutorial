# SpringCloudGateway之熔断集成篇
> 熔断应用：
> 金融市场中的熔断机制：在金融交易系统中，熔断机制（Circuit Breaker）是一种市场保护措施，旨在预防市场剧烈波动时可能导致的系统性风险。当某个基准指数（如股票指数或期货价格）在短时间内发生急剧上涨或下跌达到预先设定的阈值时，交易所会自动暂停交易一段时间或者限制涨跌幅度，类似于电器中的保险丝在电流过载时熔断以切断电流。例如，在美国股市中，曾经存在三级熔断机制，分别在标普500指数下跌7%、13%和20%时触发。
> 分布式计算中的熔断机制： 在分布式系统或微服务架构中，熔断机制是一种容错设计模式，其目的是防止因依赖的服务出现故障而引发整个系统的雪崩效应。当一个服务调用另一个服务时，如果后者频繁失败或响应时间过长，熔断器组件（如Hystrix、Resilience4j或Alibaba Sentinel）就会“熔断”该调用链路，不再继续请求有问题的服务，而是直接返回预设的错误信息或默认值，同时给调用方提供一个快速的失败反馈，而不是长时间等待或阻塞资源。在后续的一段时间内（冷却期），即使问题服务恢复，熔断器也可能保持打开状态，仅在一段时间后尝试半开状态重新发起调用，以确认服务是否真正恢复正常。这样可以确保整个系统的稳定性，并允许其他健康的服务不受影响地继续运行。

> Spring Cloud Gateway 本身并不自带完整的熔断机制，但在早期版本中可以通过集成 Hystrix 来实现服务熔断和降级。然而，随着Hystrix的维护状态变更，社区推荐使用如Resilience4j或Alibaba Sentinel等其他更活跃的容错库。
## SpringCloudGateway集成Hystrix实现熔断
### 第一步添加依赖：
>在pom.xml或build.gradle文件中引入Spring Cloud Gateway与Hystrix的相关依赖。
```xml
 <dependency>
       <groupId>org.springframework.cloud</groupId>
       <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
   </dependency>
```
### 第二部添加路由配置
> 在Spring Cloud Gateway配置中添加Hystrix过滤器，并定义相关的路由规则

```yaml
  spring:
     cloud:
       gateway:
         routes:
           - id: your_route_id
             uri: lb://your_service_id
             predicates:
               - Path=/api/** # 例如，匹配所有/api开头的路径
             filters:
               - name: Hystrix
                 args:
                   name: fallbackcmd
                   fallbackUri: forward:/fallback  # 当熔断发生时转发到的本地fallback处理逻辑
```
### 第三步添加回退提示
> 创建一个Controller或Endpoint来处理当Hystrix触发熔断时的回退操作。

```java
  @RestController
   public class FallbackController {

       @GetMapping("/fallback")
       public Mono<String> fallback() {
           return Mono.just("Fallback response due to service unavailable.");
       }
   }
```
### 第四步添加Hystrix熔断配置
>确保Hystrix的全局配置已启用，并根据需要配置熔断阈值、超时时间等参数。

```java
import com.netflix.hystrix.HystrixCommandProperties;

@Configuration
public class HystrixConfiguration {

    @Bean
    public HystrixCommandProperties.Setter hystrixCommandProperties() {
        return HystrixCommandProperties.Setter()
                .withExecutionTimeoutInMilliseconds(5000) // 设置命令执行超时时间为5秒
                .withCircuitBreakerEnabled(true) // 启用熔断器
                .withCircuitBreakerErrorThresholdPercentage(50) // 当错误率达到50%时触发熔断
                .withCircuitBreakerSleepWindowInMilliseconds(30000); // 熔断后的休眠窗口期为30秒
    }
}
```

```yaml
hystrix:
  command:
    default: # 这里是全局默认配置，也可以针对特定命令键做单独配置
      execution:
        isolation:
          thread:
            timeoutInMilliseconds: 5000 # 设置命令执行超时时间为5秒
      circuitBreaker:
        enabled: true # 启用熔断器
        errorThresholdPercentage: 50 # 当错误率达到50%时触发熔断
        sleepWindowInMilliseconds: 30000 # 熔断后的休眠窗口期为30秒
```
### 第五步实现熔断逻辑
>自定义熔断 Hystrix Gateway Filter来完成熔断逻辑的适配。

```java 
参考
import com.netflix.hystrix.HystrixCommand;
import com.netflix.hystrix.exception.HystrixRuntimeException;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

public class HystrixGatewayFilterFactory extends AbstractGatewayFilterFactory<HystrixGatewayFilterFactory.Config> {

    public static class Config {
        // 可配置属性，如命令名称、组键等
        private String commandKey;
        // 其他可能的配置项...

        // 构造函数和getters/setters省略...
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // 创建Hystrix Command，封装请求处理逻辑
            HystrixCommand<String> command = new HystrixCommand<String>(Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey(config.getCommandKey()))) {
                @Override
                protected String run() throws Exception {
                    // 执行原始请求并获取响应
                    return chain.filter(exchange).block();
                }

                // 自定义fallback逻辑
                @Override
```

## SpringCloudGateway集成Sentinel实现熔断
### 第一步配置依赖

```xml
 <dependency>
       <groupId>com.alibaba.cloud</groupId>
       <artifactId>spring-cloud-starter-alibaba-sentinel-gateway</artifactId>
       <version>{latest_version}</version>
   </dependency>

```
#### yaml配置

```yaml
  implementation 'com.alibaba.cloud:spring-cloud-starter-alibaba-sentinel-gateway:{latest_version}'
```

### 第二步配置拦截器

```yaml
  spring:
     cloud:
       gateway:
         routes:
           - id: your_route_id
             uri: lb://your_service_id
             predicates:
               - Path=/your-api-path/**
             filters:
               - name: SentinelGatewayFilter
                 args:
                   resource: your_api_resource_name
                   limitApp: default # 可选，限制调用来源应用，默认不限制
                   fallbackUri: forward:/fallback  # 可选，设置降级处理逻辑路径
```
### 第三步启动sentinel服务
![202403141432485820.png](http://124.222.54.192:4000/public/upload/2024/03/14/202403141432485820.png)


#### 通过 Docker 镜像快速部署 Sentinel 控制台
>拉取 Sentinel 控制台镜像： 在终端中运行以下命令从 Docker Hub 拉取最新的 Sentinel 控制台镜像：

```powershell
docker pull bladex/sentinel-dashboard
```

>运行 Sentinel 控制台容器： 使用以下命令创建并启动一个 Docker 容器，其中 -p 参数用于映射宿主机端口到容器内部的 Sentinel 控制台端口（默认为 8080），--name 参数用于指定容器名称，-d 参数表示在后台运行。

```powershell
 docker run -d --name sentinel-dashboard -p 8080:8080 bladex/sentinel-dashboard
```

>访问 Sentinel 控制台： Sentinel 控制台服务启动后，可以通过浏览器访问 http://localhost:8080 来登录控制台。默认用户名和密码都是 sentinel。

#### 手动下载编译后的 jar 包运行
>下载 Sentinel 控制台 jar 包： 访问 [Sentinel GitHub Release](https://github.com/alibaba/Sentinel/releases) 页面 下载最新版本的 sentinel-dashboard.jar 文件。
>运行 Sentinel 控制台： 在下载目录下，使用 Java 运行该 jar 包，并指定端口号（例如 8080）

```powershell
 java -jar sentinel-dashboard.jar --server.port=8080
```

>访问 Sentinel 控制台： 同样地， Sentinel 控制台服务启动后，可以在浏览器中输入 http://localhost:8080 来访问和管理 Sentinel 策略。

### 配置熔断规则
>登录 Sentinel 控制台，为之前定义的资源名称（例如 your_api_resource_name）配置流控、降级、系统保护等策略。
![202403141432483963.png](http://124.222.54.192:4000/public/upload/2024/03/14/202403141432483963.png)

### 编写降级处理逻辑
> 如果在配置中指定了 fallbackUri，则需要在服务端实现对应的降级处理逻辑，当触发熔断时将执行这个逻辑。
#### yaml配置
> 在 Spring Cloud Gateway 的路由配置中，为 SentinelGatewayFilter 添加 fallbackUri 参数，指定一个本地处理熔断或降级的 URI。

```yaml
 spring:
     cloud:
       gateway:
         routes:
           - id: your_route_id
             uri: lb://your_service_id
             predicates:
               - Path=/your-api-path/**
             filters:
               - name: SentinelGatewayFilter
                 args:
                   resource: your_api_resource_name
                   fallbackUri: forward:/fallback
```
####  具体实现
> 在您的 Spring Boot 应用中创建一个 Controller 或者 Endpoint 来处理这个 /fallback 请求。

```java
@RestController
   public class FallbackController {

       @GetMapping("/fallback")
       public Mono<String> fallback(ServerWebExchange exchange) {
           // 这里可以根据需要自定义降级返回的内容
           return Mono.just("Fallback response due to service unavailable.");
       }
   }
```
