# 01-HelloSpringBoot应用程序

## 1 前言

Spring Boot对Spring平台和第三方库整合，可创建`可运行的、独立的、生产级的`基于Spring的应用程序，大多Spring Boot应用程序只需很少的Spring配置。

Spring Boot可用java -jar或更传统war部署启动的Java应用程序创建，可内嵌Tomcat 、Jetty 、Undertow容器，快速启动web程序。

## 2 目录结构



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/ac2927fd006aa622065db58637e5f2a8.png)

## 3 代码

```java
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @RequestMapping(value = "/hello",method = RequestMethod.GET)
    public String say() {
        return "Hello Spring Boot!";
    }
}
```

### @RequestMapping

将请求URL，如 /hello，映射到整个类或某特定的处理器方法。

一般类级别的注解负责将一个特定(或符合某种模式)的请求路径映射到一个控制器上，同时通过方法级别的注解来细化映射，即根据特定的HTTP请求方法("GET""POST"方法等)、HTTP请求中是否携带特定参数等条件，将请求映射到匹配的方法上。

### @RestController

当今让控制器实现一个REST API，控制器只需提供JSON、XML或其他自定义的媒体类型内容即可，无需在每个 @RequestMapping 方法上都增加一个 @ResponseBody 注解，更简明的做法，是给你的控制器加上一个 @RestController 的注解。

@RestController是一个原生内置注解，结合了 @ResponseBody 与 @Controller 功能。不仅如此，也让你的控制器更表义，且在框架未来的发布版本中，它也可能承载更多意义。

与普通的 @Controller 本质无异。

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GirlApplication {

    public static void main(String[] args) {
        SpringApplication.run(GirlApplication.class, args);
    }
}

```

### @SpringBootApplication

开启Spring的组件扫描和Spring Boot的自动配置功能。底层将3个有用的注解组合：

- import org.springframework.boot.autoconfigure.EnableAutoConfiguration：开启Spring Boot自动配置。
- import org.springframework.context.annotation.ComponentScan：启用组件扫描，如此所写的web控制器类和其他组件才能被自动发现并注册为Spring应用上下文里的bean（即启用Spring Boot的自动bean加载机制）
- import org.springframework.context.annotation.Configuration：标明该类使用Spring基于Java的配置

自动配置侧重于根据项目依赖和配置来自动配置应用程序，而自动Bean加载机制侧重于扫描和加载标注了Spring注解的类。

## 4 效果



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/6b1a58193df08268f83fd35cb0e82c5b.png)