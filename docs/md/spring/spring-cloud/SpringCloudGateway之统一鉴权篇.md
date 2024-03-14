# SpringCloudGateway之统一鉴权篇
## SpringCloudGateway实现统一鉴权的方式
### 基于JWT（JSON Web Token）
>在客户端登录成功后，服务端生成一个包含用户信息和过期时间等数据的JWT令牌返回给客户端。
客户端在后续请求中将此令牌放在请求头（如Authorization: Bearer token）中发送给网关。
网关层通过自定义的GatewayFilter Factory来拦截所有请求，并检查请求头中的JWT令牌，使用对应的解码器对其进行解密和校验，包括但不限于签名验证、过期时间检查等。

```java
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationGatewayFilterFactory extends AbstractGatewayFilterFactory<JwtAuthenticationGatewayFilterFactory.Config> {

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String jwtToken = getTokenFromRequest(request);
            
            // 假设我们有一个JwtService类来处理验证逻辑
            JwtService jwtService = new JwtService();
            if (jwtService.isTokenValid(jwtToken)) {
                return chain.filter(exchange);
            } else {
                return unauthorizedResponse(exchange);
            }
        };
    }

    private Mono<Void> unauthorizedResponse(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    private String getTokenFromRequest(ServerHttpRequest request) {
        // 从请求头中获取JWT令牌
        return request.getHeaders().getFirst("Authorization").replace("Bearer ", "");
    }

    // 配置类可选，根据需要添加配置参数
    public static class Config {
        // 示例配置项，实际应用可能不需要
        // private String headerName;
        // ...
    }
}
```
- yaml配置
```yaml
spring:
  cloud:
    gateway:
      routes:
      - id: users-service-route
        uri: lb://users-service
        predicates:
          - Path=/api/users/**
        filters:
          - name: JwtAuthentication # 自定义过滤器名称
            # 如果有配置项，则可以在这里传入
```

### 集成OAuth2授权服务器
>Spring Cloud Gateway与OAuth2授权服务器（如Keycloak、Spring Authorization Server等）结合，处理OAuth2的访问令牌（Access Token）和刷新令牌（Refresh Token）的验证。
当接收到带有令牌的请求时，网关可以调用授权服务器的/oauth/check_token端点或其他方式进行令牌的有效性验证。
#### 配置Oauth2资源服务器：

首先需要有一个独立的OAuth2授权服务器，用于处理用户的登录、发放令牌（如JWT）等授权流程。
在各个微服务应用中配置自己为Oauth2资源服务器，通过spring-security-oauth2-resource-server模块来保护资源，并验证从Gateway传递过来的访问令牌的有效性。
#### 配置Spring Cloud Gateway：

添加必要的依赖项，集成Spring Security与OAuth2客户端支持。
在Gateway的配置文件中设置路由规则，指定哪些路由需要经过OAuth2的过滤器进行鉴权。
配置OAuth2的客户端信息，以便向授权服务器请求令牌验证信息。
使用spring-cloud-starter-gateway 和 spring-security-oauth2-client 等相关依赖并配置Gateway路由过滤器，例如添加 OAuth2AuthorizationCodeGrantFilter 或 OAuth2LoginFilter 用于处理用户身份认证。
#### 路由规则及鉴权过滤器：

定义路由规则，比如：

```yaml

     gateway:
       routes:
         - id: oauth2-api-route
           uri: lb://your-microservice-name # 路由到的实际服务地址
           predicates:
             - Path=/api/** # 匹配特定路径的请求
           filters:
             - name: OAuth2Authorization Bearer Token Relay # 或者其他适合的过滤器名称，用于转发令牌到下游服务
```

#### 令牌验证与权限控制：
当请求到达Gateway时，带有OAuth2令牌的请求将被特定的过滤器拦截，过滤器会验证令牌的有效性。
如果令牌有效，则允许请求继续通过Gateway路由至相应的微服务；如果无效，则返回未授权错误。

### 基于API Gateway层面的过滤器实现
>创建自定义的GatewayFilter Factory，根据需要设计并实现自己的鉴权逻辑，比如检查请求头中的特定字段、查询参数或Cookie等。
如果是微服务架构，还可以利用服务间通信机制，向认证服务发起请求以进行用户身份和权限的验证。
- 创建自定义过滤器
> 创建一个继承org.springframework.cloud.gateway.filter.GatewayFilter或实现org.springframework.cloud.gateway.filter.factory.GatewayFilterFactory的类，并在其内部实现鉴权逻辑。

```java
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class CustomAuthorizationFilter implements GatewayFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerHttpRequest request, ServerHttpResponse response, GatewayFilterChain chain) {
        // 从请求头或其他位置获取Token信息
        String token = getTokenFromRequest(request);

        // 验证Token有效性（这里只是一个示例，实际验证逻辑需要根据OAuth2服务器的接口和规范进行）
        if (isValidToken(token)) {
            return chain.filter(request);
        } else {
            // Token无效时返回401 Unauthorized
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return response.setComplete();
        }
    }

    private boolean isValidToken(String token) {
        // 实现你的Token验证逻辑，可能需要向OAuth2授权服务器发送请求验证Token
        // ...
        return true; // 假设此处验证通过
    }

    private String getTokenFromRequest(ServerHttpRequest request) {
        // 获取请求中的Token，比如从Authorization Header中提取Bearer Token
        return request.getHeaders().getFirst("Authorization").replace("Bearer ", "");
    }

    @Override
    public int getOrder() {
        // 设置过滤器执行顺序，可以根据需求调整
        return -100;
    }
}
```
- 注册过滤器到路由规则

```yaml
spring:
  cloud:
    gateway:
      routes:
      - id: secured_route
        uri: lb://your-service-id
        predicates:
        - Path=/secured/**
        filters:
        - name: CustomAuthorizationFilter
```

### 配合Spring Security OAuth2
>将Spring Security OAuth2与Spring Cloud Gateway整合，配置OAuth2资源服务器支持，使得网关可以直接处理已验证过的请求，或者在转发请求前进行进一步的权限验证。

```java
首先，需要在pom.xml文件中添加以下依赖：
xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-oauth2-client</artifactId>
</dependency>
在application.yml文件中，配置OAuth2客户端的相关信息：
yaml
spring:
  cloud:
    gateway:
      routes:
        - id: my_route
          uri: http://localhost:8081
          predicates:
            - Path=/api/**
          filters:
            - OAuth2ClientAuthenticationProcessingFilter

spring:
  security:
    oauth2:
      client:
        registration:
          my_client:
            client-id: 123456
            client-secret: abcdef
            authorization-grant-type: authorization_code
            redirect-uri: http://localhost:8080/login/oauth2/code/my_client
            scope: read,write
        provider:
          my_provider:
            authorization-endpoint: http://localhost:8089/oauth2/authorize
            token-endpoint: http://localhost:8089/oauth2/token
            user-info-endpoint: http://localhost:8089/me
在代码中，实现OAuth2客户端的相关逻辑：
java
@Configuration
public class GatewayConfig {

    @Bean
    public RouterFunction<ServerResponse> route(OAuth2ClientAuthenticationProcessingFilter oauth2Filter) {
        return RouterFunctions
                .route(RequestPredicates.path("/api/**"), request -> {
                    request.mutate().header(HttpHeaders.AUTHORIZATION, "Bearer " + getAccessToken(oauth2Filter))
                            .build();
                    return forward(request);
                });
    }

    private String getAccessToken(OAuth2ClientAuthenticationProcessingFilter oauth2Filter) {
        // 获取access token的逻辑
        // ...
    }

    private ServerResponse forward(ServerRequest request) {
        // 路由转发的逻辑
        // ...
    }
}
```

### 基于Redis或数据库存储的Token验证
>对于非JWT类型的Token，可以在Redis或数据库中存储已签发的Token及其相关信息，在网关层从请求中提取Token并对比存储的信息进行有效性验证。
#### 添加依赖
确保项目包含了Spring Cloud Gateway、Spring Security、OAuth2以及Spring Data Redis相关依赖。
```xml
<dependencies>
    <!-- Spring Cloud Gateway -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>

    <!-- Spring Security & OAuth2 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.security.oauth.boot</groupId>
        <artifactId>spring-security-oauth2-resource-server</artifactId>
    </dependency>

    <!-- Spring Data Redis -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis-reactive</artifactId>
    </dependency>
</dependencies>
```
#### 配置Redis Token Store
> 配置Spring Security使用Redis存储和检索JWT或其他类型Token的信息：
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          jwk-set-uri: http://your-oauth2-server.com/jwks # 如果是JWT，则配置公钥库地址
          issuer-uri: http://your-oauth2-server.com # JWT发行者地址
    oauth2:
      client:
        registration:
          your-client:
            # ... 客户端注册信息 ...
        provider:
          your-provider:
            # ... 授权服务器信息 ...
      resource:
        token-info-uri: http://your-oauth2-server.com/check_token # 可选，如果使用服务端校验Token（非JWT）
      redis:
        token-store: true # 开启Redis作为Token存储

  data:
    redis:
      port: 6379
      host: localhost
```
#### 配置路由与过滤器
通过Gateway的路由规则指定哪些请求需要经过OAuth2认证，并使用内置或自定义过滤器处理Token验证。

```yaml
spring:
  cloud:
    gateway:
      routes:
      - id: secured_route
        uri: lb://your-service-id
        predicates:
        - Path=/secured/**
        filters:
        - name: BearerTokenAuthenticationFilter
          args:
            # ... 过滤器参数 ...


```
#### 安全配置
启用资源服务器模式并配置从Redis读取Token信息的逻辑。

### RBAC（Role-Based Access Control）权限控制
>结合角色权限模型，在验证Token有效的同时，检查当前请求路径所要求的角色权限是否与用户持有的Token中声明的角色匹配。
