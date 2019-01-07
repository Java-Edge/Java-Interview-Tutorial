# 1 目标
![](https://upload-images.jianshu.io/upload_images/4685968-eed053d251275855.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 2事务回顾
## 什么是事务
![](https://upload-images.jianshu.io/upload_images/4685968-83d81f1c7b75ae07.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 具体案例
![](https://upload-images.jianshu.io/upload_images/4685968-1028f8592a327682.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![钱转了,李四却没收到!!!](https://upload-images.jianshu.io/upload_images/4685968-ce870c99003f98c5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![需要事务!!!](https://upload-images.jianshu.io/upload_images/4685968-a102d0e9734d4216.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 事务的特性
![](https://upload-images.jianshu.io/upload_images/4685968-3a6300f87c2a1953.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![原子性](https://upload-images.jianshu.io/upload_images/4685968-6cc65f05555dd413.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![一致性](https://upload-images.jianshu.io/upload_images/4685968-f76d2f7cab3ca00c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-889156dab97b9c97.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-226a7bf9ea65ab08.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ec18c46d3c08b495.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 3 事务的API
## Spring 接口介绍
![](https://upload-images.jianshu.io/upload_images/4685968-96ed77d556799458.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-01dd1056fff16546.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-2172687122971173.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-5c61cb9956587e6e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## PlatformTransactionManager
![](https://upload-images.jianshu.io/upload_images/4685968-e13c0def9040a4c9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## TransactionDefinition
![](https://upload-images.jianshu.io/upload_images/4685968-d7ca52c82a556b36.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 脏读
![](https://upload-images.jianshu.io/upload_images/4685968-d722077c8547ab50.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 不可重复读
![](https://upload-images.jianshu.io/upload_images/4685968-c78a6f53c4ec2014.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 幻读
![](https://upload-images.jianshu.io/upload_images/4685968-c3a2b2720333ad2b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 事务隔离级别
![](https://upload-images.jianshu.io/upload_images/4685968-d7e2033751124d7b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-133d4393a443117a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-738039998b94ad7f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## TransactionDefinition事务传播行为
![](https://upload-images.jianshu.io/upload_images/4685968-937d0ca6d13ec7d9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## TransactionStatus

# 4 环境搭建
![](https://upload-images.jianshu.io/upload_images/4685968-d705cb27a349cc84.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
