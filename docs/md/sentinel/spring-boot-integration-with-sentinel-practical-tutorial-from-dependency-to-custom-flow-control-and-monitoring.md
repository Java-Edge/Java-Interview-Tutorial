# SpringBoot集成Sentinel实战：从依赖到自定义限流与监控

## 1 添加依赖

### 1.1 JDK8

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
    <version>2.2.10-RC1</version>
</dependency>
```

> groupId也可为 org.springframework.cloud。

涵盖依赖包：

![](https://p.ipic.vip/9ldrap.png)

### 1.2 JDK21

我使用的 JDK23+SpringBoot3.4.1：

```xml
<!-- Sentinel 依赖-->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
    <version>2023.0.3.2</version>
</dependency>
```

## 2 暴露端点

整合成功后，会暴露actuator/Sentinel端点，所以再添依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

还需配置才能暴露端点（默认不暴露）：

```yml
management:
  endpoints:
    web:
      exposure:
        include: '*'
```

## 3 配置文件

连接Sentinel控制台的地址信息配置

```yml
spinrg:
 cloud:
  sentinel:
    transport:
      dashboard: localhost:8080
```

## 4 Sentinel 自定义限流响应与实时监控

### Sentinel 自定义资源与限流规则

如针对接口限流：

```java
@RestController
@RequestMapping("/pilot")
public class PilotController {

    @SentinelResource(value = "pilot_list", 
                     blockHandler = "blockHandler")
    @GetMapping("/getList")
    public ResultBody list() {
        Map<String, List<Pilot>> pilotServiceList = pilotService.getList();
        return ResultBody.success(pilotServiceList);
    }

    // 限流降级方法
    public ResultBody blockHandler(BlockException e) {
        log.warn("触发限流", e);
        return ResultBody.error("服务繁忙，请稍后再试");
    }
}
```

value对应的资源名称：

![](https://p.ipic.vip/tf6m4m.png)

```java
@Configuration
public class SentinelConfig implements BlockExceptionHandler {
    
    @PostConstruct
    private void initFlowRules() {
        List<FlowRule> rules = new ArrayList<>();
        
        // 创建流控规则
        FlowRule rule = new FlowRule();
        // 设置受保护的资源
        rule.setResource("pilot_list");
        // 设置流控规则 QPS
        rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
        // 设置受保护的资源阈值
        rule.setCount(1);
        rules.add(rule);
        
        // 加载规则
        FlowRuleManager.loadRules(rules);
    }

    @Bean
    public SentinelResourceAspect sentinelResourceAspect() {
        return new SentinelResourceAspect();
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, String resourceName, BlockException e) throws Exception {
        response.setStatus(429);
        response.getWriter().write("访问过于频繁，请稍后再试");
    }
}
```

限流效果：

![](https://p.ipic.vip/o69cp4.png)

## 注意

升级后，注意验证规则是否失效，避免版本差异bug。

参考：

- https://github.com/alibaba/spring-cloud-alibaba/wiki/%E7%89%88%E6%9C%AC%E8%AF%B4%E6%98%8E