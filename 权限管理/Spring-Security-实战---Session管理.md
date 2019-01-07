> Session在网络应用中，称为“会话控制”
Session 对象存储特定用户会话所需的属性及配置信息。这样，当用户在应用程序的 Web 页之间跳转时，存储在 Session 对象中的变量将不会丢失，而是在整个用户会话中一直存在下去
当用户请求来自应用程序的 Web 页时，如果该用户还没有会话，则 Web 服务器将自动创建一个 Session 对象
当会话过期或被放弃后，服务器将终止该会话
Session 对象最常见的一个用法就是存储用户的首选项

# 管理
Session超时时间
Session的并发策略
集群环境Session处理
## Session超时
- application.yml配置超时时间
![](https://upload-images.jianshu.io/upload_images/4685968-ece5d97df1a1c6c3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 配置MerryyouSecurityConfig
![](https://upload-images.jianshu.io/upload_images/4685968-e719b60ee323b637.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- Cotroller中/session/invalid
![](https://upload-images.jianshu.io/upload_images/4685968-8e7f36851b208f7b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## Session 并发
## 配置 MerryyouSecurityConfig
![](https://upload-images.jianshu.io/upload_images/4685968-826c33ff39a1ba9c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## MerryyounExpiredSessionStrategy
![](https://upload-images.jianshu.io/upload_images/4685968-1962e0218c1bc0b3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 集群
- 添加spring-session-data-redis依赖
```xml
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>
```



- 配置Spring-session存储策略
![](https://upload-images.jianshu.io/upload_images/4685968-9cea621f1f3b3f20.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 测试8080和8081端口分别启动项目
```
java -jar spring-security.jar --server.port=8080
java -jar spring-security.jar --server.port=8081
```
