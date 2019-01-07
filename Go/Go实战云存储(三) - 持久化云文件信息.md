# 0 [相关源码](https://github.com/Wasabi1234/Go-Cloud-Store)

# 1 MySQL基础
## 简介
为避免每次重启系统从零开始的问题,需要将数据持久化.
![](https://upload-images.jianshu.io/upload_images/16782311-d59a5f2a87c4a342.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 服务架构变迁
![](https://upload-images.jianshu.io/upload_images/16782311-7888a1be823355ef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 安装配置
### 安装模式
- 单点
- 主从

![](https://upload-images.jianshu.io/upload_images/16782311-a588e4e352f3b543.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 多主

# 2 文件表设计
- 新建数据库
![](https://upload-images.jianshu.io/upload_images/16782311-93d994cc266e86d3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 新建文件表
![](https://upload-images.jianshu.io/upload_images/16782311-03abc93755e61f19.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 分库分表
### 水平分表
![](https://upload-images.jianshu.io/upload_images/16782311-1cd30450d73cbafa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-1dcc2a59e1813009.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## Golang 操作MySQL
![](https://upload-images.jianshu.io/upload_images/16782311-e96ba8777c17421c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 4 持久化元数据到文件表
![](https://upload-images.jianshu.io/upload_images/16782311-c495ccb60d234cd8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/16782311-86b0de25058fd99a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 5  从文件表中获取元数据
- file.go
![](https://upload-images.jianshu.io/upload_images/16782311-df37fab7de1abb14.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- handler.go
![](https://upload-images.jianshu.io/upload_images/16782311-f716d1c342913724.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- filemeta.go
![](https://upload-images.jianshu.io/upload_images/16782311-a58f2e525809ead1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- test over!
![](https://upload-images.jianshu.io/upload_images/16782311-2dd492a053782a40.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 6 Go - MySQL使用小结
## 通过sqI.DB来管理数据库连接对象
## 通过sql.Open来创建协程安全的sql.DB对象
## 优先使用Prepared Statement

###  1 MySQL特点与应用场景
### 2 主从架构与文件表设计逻辑
### 3 Golang与MySQL的亲密接触

# X 交流学习
![](https://upload-images.jianshu.io/upload_images/16782311-8d7acde57fdce062.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)


## [博客](https://blog.csdn.net/qq_33589510)



## [Github](https://github.com/Wasabi1234)


