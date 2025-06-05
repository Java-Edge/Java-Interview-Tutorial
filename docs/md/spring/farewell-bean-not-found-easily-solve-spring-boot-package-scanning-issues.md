# 01-告别 "Bean Not Found"！轻松搞定 Spring Boot 包扫描难题 ✅

## 0 前言

SpringBoot约定大于配置，但不熟悉所有约定，所以经常写bug！

## 1 案例：扫描不到Bean定义

Spring Boot服务包结构：

![](https://p.ipic.vip/ngsrcp.png)

BestPractiseApplication：

```java
package com.javaedge.spring.aop;

/**
 * @author JavaEdge
 */
@SpringBootApplication
public class BestPractiseApplication {

    public static void main(String[] args) {
        SpringApplication.run(BestPractiseApplication.class, args);
    }
}
```

MyController：

```java
package com.javaedge.spring.app;

/**
 * @author JavaEdge
 */
@RestController
public class MyController {

    @GetMapping("hello")
    public String hello() {
        return "hello Java";
    }
}
```

访问`http://localhost:12345/hello`：

![](https://p.ipic.vip/jazxoq.png)

紧急需求，需添加多个Controller，常规操作调整包结构：

![](https://p.ipic.vip/rs3f8j.png)

发现应用不识别MyController，找不到 MyController 这 Bean，why？

![](https://p.ipic.vip/9hb0it.png)

## 2 解惑

### 2.1 之前为啥生效？

@SpringBootApplication继承了其它注解：

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(excludeFilters = { @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
		@Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })
public @interface SpringBootApplication {
```

SpringBootApplication默认开启ComponentScan。SpringBoot应用启动时，ComponentScan扫描所有定义的 Bean，扫描位置由 ComponentScan 的 basePackages 属性指定：

```java
package org.springframework.context.annotation;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Repeatable(ComponentScans.class)
public @interface ComponentScan {

	@AliasFor("basePackages")
	String[] value() default {};

	@AliasFor("value")
	String[] basePackages() default {};
```

但basePackages默认空，那它扫描的啥包？debug 到 ComponentScanAnnotationParser#parse：

![](https://p.ipic.vip/f1ohqq.png)

即declaringClass所在包，即`com.javaedge.app`。

## 3 修正

如下两种方案：

### 3.1 放好位置

![](https://p.ipic.vip/mwbno6.png)

![](https://p.ipic.vip/nunv63.png)

### 3.2 显式配置

#### @ComponentScan

```java
package com.javaedge.spring.app;

@SpringBootApplication()
@ComponentScan("com.javaedge.spring.controller")
public class BestPractiseApplication {

    public static void main(String[] args) {
        SpringApplication.run(BestPractiseApplication.class, args);
    }
}
```

![](https://p.ipic.vip/xybhs1.png)

#### @ComponentScans

```java
package com.javaedge.spring.app;

@SpringBootApplication()
@ComponentScans(value = {@ComponentScan(value = "com.javaedge.spring.controller")})
public class BestPractiseApplication {

    public static void main(String[] args) {
        SpringApplication.run(BestPractiseApplication.class, args);
    }
}
```

ComponentScans 相比 ComponentScan，可指定扫描多个包范围。