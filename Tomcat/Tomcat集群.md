#目录
![](http://upload-images.jianshu.io/upload_images/4685968-acb84606c660574f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/4685968-0a4525ac6cc0fb3c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 1. Tomcat集群能带来什么
##1.1 提高服务的性能,并发能力以及高可用性
- 一般一台机器部署一个Tomcat,因为部署多个有资源共享瓶颈(比如内存网卡磁盘I/O等),所以一般进行隔离
- 一台TomcatHTTP线程池是有限的,根据机器性能,那么两台很可能可承载的HTTP线程就是2倍
- Ngix下挂了多个Tomcat,当Tomcat1挂掉时,可以把这个节点从ngix负载均衡Tomcat集群的配置中摘掉,ngix还会达到可用的Tomcat服务器上,并不影响我们提供的服务
##1.2 提供项目架构的横向扩展能力
假设有一台服务器,通过不断升级他的内存CPU加固态硬盘etc,这种属于纵向提高机器的配置来达到提高Tmcat所提供服务的性能,随着硬件不断提高,成本是指数级上升的
比如天猫平时访问量不太多,到双十一时就可以通过Tomcat集群做到横向扩展,只需要添加Tomcat节点即可(根据实际数据和历史数据进行评估)
# 2. Tomcat集群实现原理
通过Nginx负载均衡进行请求转发
#3. 一,二期架构对比
![一期架构](http://upload-images.jianshu.io/upload_images/4685968-90417e02c9641c4f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
!["想当然"的二期结构](http://upload-images.jianshu.io/upload_images/4685968-83dedb9e21e57953.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 3.1问题:
- session登录信息存储及读取无法共享问题
- 服务器定时任务并发的问题
eg.当订单没有付款,超时时,多个Tomcat会同时启动定时任务,一起去读取sql然后判断订单,对于逻辑过于复杂的业务就会造成线上数据错乱,数据出现竞争关系,难以排查出问题
- ...

所以并不是随意加Tomcat即可
##3.2解决方案
###3.2.1  采用nginx ip hash policy(单纯解决登录问题)
- 优点: 可以不改变现有技术架构,直接实现横向扩展(省事)
根据请求的ip,对ip进行hash取模,hash后分配到指定服务器
- 缺点:
  - 导致服务器请求(负载)不平均(完全依赖ip hash的结果)
  - 在ip变化的环境下无法服务(每次不同ip hash到不同Tomcat服务器导致)
![二期真架构](http://upload-images.jianshu.io/upload_images/4685968-0b11c76e86e234e6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#4 Tomcat单机部署多应用-CentOS6.8
# Nginx负载均衡配置,常用策略,场景及特点
## 轮询(默认)
实现简单,但是不考虑每台服务器的处理能力
![](http://upload-images.jianshu.io/upload_images/4685968-ea36995c68bceb33.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##权重
考虑了每台服务器的处理能力
![](http://upload-images.jianshu.io/upload_images/4685968-b7ea753668b696b6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##ip hash
能实现同一个用户访问同一个服务器,但是不一定平均
![](http://upload-images.jianshu.io/upload_images/4685968-2fcc834d44a895df.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

##url hash(第三方)
能实现同一个服务访问同一个服务器,但是分配请求会不平均,请求频繁的url请求会请求到同一个服务器上
##fair
##
