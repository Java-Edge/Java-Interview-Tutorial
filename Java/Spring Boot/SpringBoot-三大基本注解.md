# 1 @RestController
![](https://upload-images.jianshu.io/upload_images/4685968-2598be573b324d42.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
该注解被称作 stereotype 注解。它能为代码阅读者提供一些提示，对于 Spring 而言，这个类具有特殊作用。我们的类是一个 web @Controller，因此 Spring 在处理传入的 web 请求时会考虑它
@RequestMapping 注解提供了 routing（路由）信息。它告诉 Spring，任何具有路径为 / 的 HTTP 请求都应映射到 home 方法
@RestController 注解告知 Spring 渲染结果字符串直接返回给调用者
>@RestController 和 @RequestMapping 是 Spring MVC 注解（它们不是 Spring Boot 特有的）
# 2 @EnableAutoConfiguration
![](https://upload-images.jianshu.io/upload_images/4685968-5507d450a6e8eb8f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
第二个类级别注解
此注解告知 Spring Boot 根据您添加的 jar 依赖来“猜测”您想如何配置 Spring 并进行自动配置，由于` spring-boot-starter-web `添加了 Tomcat 和 Spring MVC，auto-configuration（自动配置）将假定您要开发 web 应用并相应设置了 Spring

> - Starter 与自动配置 
Auto-configuration 被设计与 Starter 配合使用，但这两个概念并不是直接相关的。您可以自由选择 starter 之外的 jar 依赖，Spring Boot 仍然会自动配置您的应用程序
# 3 @SpringBootApplication
![](https://upload-images.jianshu.io/upload_images/4685968-b23bd908285f1079.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

很多 Spring Boot 开发者总是使用 `@Configuration`、`@EnableAutoConfiguration` 和 `@ComponentScan` 注解标记在主类上
由于 这些注解经常一起使用（特别是如果您遵循上述的[最佳实践](https://docshome.gitbooks.io/springboot/content/pages/using-spring-boot.html#using-boot-structuring-your-code)）。Spring Boot 提供了一个更方便的 `@SpringBootApplication` 注解可用来替代这个组合。
>@SpringBootApplication 还提供了别名来自定义 @EnableAutoConfiguration 和 @ComponentScan 的属性。
