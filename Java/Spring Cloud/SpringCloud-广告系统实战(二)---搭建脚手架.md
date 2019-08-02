# 0 联系我
![](http://upload-images.jianshu.io/upload_images/4685968-d7307e723c8c29ad?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "图片标题")
1.Q群【Java开发技术交流】：[https://jq.qq.com/?_wv=1027&k=5UB4P1T](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
2.完整博客链接:[www.shishusheng.com](http://www.shishusheng.com)
3.知乎:[http://www.zhihu.com/people/shi-shu-sheng-](http://www.zhihu.com/people/shi-shu-sheng-)
4.gayhub:[https://github.com/Wasabi1234](https://github.com/Wasabi1234)

# 源码地址
https://github.com/Wasabi1234/JavaEdge-Ad-Spring-Cloud

# 1 Maven 基础
![Maven 介绍](https://upload-images.jianshu.io/upload_images/4685968-4c3fe7f49f7cf594.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![基本样式](https://upload-images.jianshu.io/upload_images/4685968-8e0aceea5baad8a0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0b8f05499b5133de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 坐标
![](https://upload-images.jianshu.io/upload_images/4685968-30cf58d8cdbdd2b6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 常用命令
![](https://upload-images.jianshu.io/upload_images/4685968-514b18e68518230a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 2 Maven 相关特性
- 传递依赖与排除依赖
![](https://upload-images.jianshu.io/upload_images/4685968-2811c0adf4bc9d09.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 依赖冲突
![](https://upload-images.jianshu.io/upload_images/4685968-c5057067a48dcff8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 多模块项目 / 聚合
![](https://upload-images.jianshu.io/upload_images/4685968-4da8f940e790576c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 3  主工程搭建
![](https://upload-images.jianshu.io/upload_images/4685968-19de6133d1af3e87.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-008d3c4fa13fcd38.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-cac3d4de1f85d358.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7da7f99631c2acd7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-01e810ac8a6fdf7f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 4 开发单节点 Eureka Server
![](https://upload-images.jianshu.io/upload_images/4685968-4ec4dc830762cd69.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ebc2eb0705407199.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-97d665fd4977526d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-53c3630f55d286bf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-9e1aa463e7e3a660.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 父 pom 文件新添内容
![](https://upload-images.jianshu.io/upload_images/4685968-4b365cf62fb421cf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-2ba3161bebae44d0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a7f3e3c36c6fc550.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 5 Eureka Server 的部署
- 启动前面的 e-s
![](https://upload-images.jianshu.io/upload_images/4685968-1d57f5e3e4be0378.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 使不同服务名走相同的 ip 地址,防止单机下的注册失败
![](https://upload-images.jianshu.io/upload_images/4685968-ac20d18c7e8a55d0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-89ca00bfe81ccf09.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 单机多节点配置信息
![](https://upload-images.jianshu.io/upload_images/4685968-24ad0eac048c5e7b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 将服务打成 jar 包
![](https://upload-images.jianshu.io/upload_images/4685968-8d1a8a99a1b4c093.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-169702420225f7ec.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-560a95ed2b79537d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- jar 包形式,须根据配置选项启动 e-s
![java -jar ad-eureka-1.0-SNAPSHOT.jar --spring.profiles.active=server2
](https://upload-images.jianshu.io/upload_images/4685968-9c238061d65e66fb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-809191ac8c1c8c60.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-1829a1609f2fa1bc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ce31a333b8ed2933.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- e-s 变化之处,已有三个注册实例
![](https://upload-images.jianshu.io/upload_images/4685968-1e24b6520a507a92.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


# 6   微服务架构及网关组件介绍

## 6.1 微服务架构及其应用场景

### 6.1.1 微服务架构的两种方式
![](https://upload-images.jianshu.io/upload_images/4685968-a025ea2509b14517.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![应用最广泛的方式](https://upload-images.jianshu.io/upload_images/4685968-43bff3a7aadc9dde.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 6.2 Zuul 的生命周期
![](https://upload-images.jianshu.io/upload_images/4685968-678fe19cd8e9d472.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 7 网关启动程序的开发
- 由于只是小型演示系统,就不使用多节点了
![](https://upload-images.jianshu.io/upload_images/4685968-dfd1b1c6293b7661.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a8c23b04ae17b6e7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 8 自定义网关过滤器的开发
![](https://upload-images.jianshu.io/upload_images/4685968-898accc7886196b2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0c07e1c300b65eb9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 之后,启动 e-s
![](https://upload-images.jianshu.io/upload_images/4685968-4b259050bfadb207.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
