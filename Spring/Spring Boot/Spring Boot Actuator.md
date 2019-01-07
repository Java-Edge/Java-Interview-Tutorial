# 整合
- 添加依赖
![](https://img-blog.csdnimg.cn/20190916234856333.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 启动应用
![](https://img-blog.csdnimg.cn/2019091623500231.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- [打开链接](http://localhost:8080/actuator)
![](https://img-blog.csdnimg.cn/20190916235411576.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190917001217324.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 健康信息
健康信息可以检查应用的运行状态，它经常被监控软件用来提醒人们生产环境是否存在问题。health端点暴露的默认信息取决于端点是如何被访问的。对于一个非安全，未认证的连接只返回一个简单的'status'信息。对于一个安全或认证过的连接其他详细信息也会展示
Spring Boot包含很多自动配置的HealthIndicators，你也可以写自己的。

### 自动配置的HealthIndicators
Spring Boot在合适的时候会自动配置以下HealthIndicators：
![](https://img-blog.csdnimg.cn/20190917002830278.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 下表显示了内置状态的默认状态映射：
![](https://img-blog.csdnimg.cn/20190917003004321.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 让我们配置一下health节点,并重启应用
![](https://img-blog.csdnimg.cn/20190917001814832.png)
- 可看到对于磁盘的监控信息
![](https://img-blog.csdnimg.cn/20190917001849686.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 应用信息
应用信息会暴露所有InfoContributor beans收集的各种信息，Spring Boot包含很多自动配置的InfoContributors，你也可以编写自己的实现。
### 自动配置的InfoContributors
Spring Boot会在合适的时候自动配置以下InfoContributors：
![](https://img-blog.csdnimg.cn/20190917003252246.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

> 注 使用management.info.defaults.enabled属性可禁用以上所有InfoContributors。

### 自定义应用info信息
通过设置Spring属性info.*，你可以定义info端点暴露的数据。所有在info关键字下的Environment属性都将被自动暴露，例如，你可以将以下配置添加到application.properties：
```
info.app.encoding=UTF-8
info.app.java.source=1.8
info.app.java.target=1.8
```
注 你可以在构建时扩展info属性，而不是硬编码这些值。假设使用Maven，你可以按以下配置重写示例：
```
info.app.encoding=@project.build.sourceEncoding@
info.app.java.source=@java.version@
info.app.java.target=@java.version@
```
### Git提交信息
info端点的另一个有用特性是，在项目构建完成后发布git源码仓库的状态信息。如果GitProperties bean可用，Spring Boot将暴露git.branch，git.commit.id和git.commit.time属性。

> 注 如果classpath根目录存在git.properties文件，Spring Boot将自动配置GitProperties bean。查看Generate git information获取更多详细信息。

使用management.info.git.mode属性可展示全部git信息（比如git.properties全部内容）：
```
management.info.git.mode=full
```
### 构建信息
如果BuildProperties bean存在，info端点也会发布你的构建信息。

注 如果classpath下存在META-INF/build-info.properties文件，Spring Boot将自动构建BuildProperties bean。Maven和Gradle都能产生该文件

- 配置info
![](https://img-blog.csdnimg.cn/20190917003634110.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 启动观察输出信息![](https://img-blog.csdnimg.cn/20190917003721284.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- SpringBoot支持很多端点,除了默认显示的几个,还可以激活暴露所有端点
![](https://img-blog.csdnimg.cn/20190917004116115.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190917004052711.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 如果只想暴露某个端点也是可以的
![](https://img-blog.csdnimg.cn/2019091700435537.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 查看JVM最大内存
![](https://img-blog.csdnimg.cn/20190917004447618.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
## 3 Beans
Bean 端点提供有关应用程序 bean 的信息。
### 获取 Beans
- /actuator/beans GET 请求
![](https://img-blog.csdnimg.cn/9f6178ded60f4b8ba018bc2bdef864de.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_12,color_FFFFFF,t_70,g_se,x_16)
响应的结构：
![](https://img-blog.csdnimg.cn/2f2e8b7d5b0643c5a18f25968242c948.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
