# SpringCloudGateway之限流集成篇
>在Spring Cloud Gateway中实现限流（Rate Limiting）可以通过集成Spring Cloud Gateway的熔断和限流功能以及第三方限流组件如Sentinel或Resilience4j。

## SpringCloudGateway与Sentinel组件集成
### 添加依赖

```xml
首先确保项目包含Spring Cloud Gateway和Sentinel相关依赖。
<dependencies>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>
    <!-- Sentinel Spring Cloud Gateway Adapter -->
    <dependency>
        <groupId>com.alibaba.csp</groupId>
        <artifactId>sentinel-adapter-spring-cloud-gateway-2.x</artifactId>
        <version>{sentinel-version}</version>
    </dependency>
    <!-- Sentinel Core -->
    <dependency>
        <groupId>com.alibaba.csp</groupId>
        <artifactId>sentinel-core</artifactId>
        <version>{sentinel-version}</version>
    </dependency>
</dependencies>
```
### 配置Sentinel
> 在application.yml或application.properties文件中配置Sentinel的相关参数

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080 # Sentinel控制台地址
        port: 8719 # Sentinel与控制台之间的通讯端口
      filter:
        url-patterns: "/api/**" # 需要进行限流处理的路由路径
```

### 启用Sentinel Gateway适配器
>创建一个配置类以启用Sentinel适配器，并注册到Spring容器中

```java
import com.alibaba.csp.sentinel.adapter.gateway.sc.SentinelGatewayFilter;
import com.alibaba.csp.sentinel.adapter.gateway.sc.config.SentinelGatewayConfig;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SentinelGatewayConfiguration {

    @Bean
    public GlobalFilter sentinelGatewayFilter() {
        return new SentinelGatewayFilter();
    }

    @Bean
    public SentinelGatewayConfig sentinelGatewayConfig() {
        return new SentinelGatewayConfig();
    }
}
```
### 配置限流规则
>通过Sentinel控制台或API动态添加限流规则，包括QPS限制、热点限流等策略
>为/api/user路由设置QPS限流
为/api/user路由设置QPS限流
在Sentinel控制台上新建一个限流规则，资源名可以是/api/user，然后设置每秒允许的请求次数。