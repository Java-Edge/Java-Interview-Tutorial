# 0 联系我

![](https://upload-images.jianshu.io/upload_images/4685968-6a8b28d2fd95e8b7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)

## 1.[Java开发技术交流Q群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)

## 2.[完整博客链接](https://blog.csdn.net/qq_33589510/)

## 3.[个人知乎](http://www.zhihu.com/people/shi-shu-sheng-)

## 4.[gayhub](https://github.com/Wasabi1234)

# [相关源码](https://github.com/Wasabi1234/Security)

> OAuth 是一个开放标准，允许用户让第三方应用访问该用户在某一网站上存储的私密的资源，而不需要将用户名和密码提供给第三方应用
OAuth允许用户提供一个令牌，而不是用户名和密码来访问他们存放在特定服务提供者的数据
每一个令牌授权一个特定的网站在特定的时段内访问特定的资源。这样，OAuth让用户可以授权第三方网站访问他们存储在另外服务提供者的某些特定信息
# 项目准备
- 添加依赖
```
         <dependency>
             <groupId>org.springframework.boot</groupId>
             <artifactId>spring-boot-starter-security</artifactId>
         </dependency>
         <dependency>
             <groupId>org.springframework.boot</groupId>
             <artifactId>spring-boot-starter-web</artifactId>
         </dependency>
         <dependency>
             <groupId>org.springframework.security.oauth</groupId>
             <artifactId>spring-security-oauth2</artifactId>
         </dependency>
         <dependency>
             <groupId>org.springframework.boot</groupId>
             <artifactId>spring-boot-starter-test</artifactId>
         </dependency>
```
- 配置认证服务器
![](https://upload-images.jianshu.io/upload_images/4685968-f3bdcf6969187156.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 配置资源服务器
![](https://upload-images.jianshu.io/upload_images/4685968-9534ae193003562e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 配置application.yml客户端信息（不配置的话，控制台会默认打印clientid和clietSecret）
![](https://upload-images.jianshu.io/upload_images/4685968-c37b2c53bfbffc8c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 定义MyUserDetailsService
![](https://upload-images.jianshu.io/upload_images/4685968-f34fbf925a62e56c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 添加测试类SecurityOauth2Test(用户名密码模式)
