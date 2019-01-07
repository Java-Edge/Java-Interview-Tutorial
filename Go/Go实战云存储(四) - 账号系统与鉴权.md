# 0 [相关源码](https://github.com/Wasabi1234/Go-Cloud-Store)
修改代码部分直接查看github commit历史即可!

加入用户系统后架构升级说明； 快速实现用户注册/登录/信息查询功能; 快速实现用户资源隔离存储及安全鉴权功能。

# 1 帐号系统介绍与用户表设计

## 1.1  账号系统的功能
支持用户注册/登录
支持用户Session鉴权
用户数据资源隔离

![在系统架构中的地位](https://upload-images.jianshu.io/upload_images/16782311-2392dcd62cfa1819.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 1.2 MySQL用户表的设计
![](https://upload-images.jianshu.io/upload_images/16782311-228a0c7eca1e1093.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



# 2  实现用户注册接口
- 注册页面
![](https://upload-images.jianshu.io/upload_images/16782311-cdd0eba9d8ff9d87.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 成功入库
![](https://upload-images.jianshu.io/upload_images/16782311-4c0e6e59e6c0c98e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 3 实现用户登录接口
![](https://upload-images.jianshu.io/upload_images/16782311-bbe121950f743239.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 添加路由规则,注意静态路由
![](https://upload-images.jianshu.io/upload_images/16782311-40dc32688dcdb765.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 登录界面
![](https://upload-images.jianshu.io/upload_images/16782311-29e162e74da73cde.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 4  实现用户信息查询接口
除了注册登录,其他接口都需要验证token信息

- 登录后的重定向界面
![](https://upload-images.jianshu.io/upload_images/16782311-838a12d892b7c542.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 5 接口梳理小结
## 用户注册
![](https://upload-images.jianshu.io/upload_images/16782311-71e82a1ae3a10986.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 用户登录
![](https://upload-images.jianshu.io/upload_images/16782311-c473e82fd21b0783.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 用户信息查询
![](https://upload-images.jianshu.io/upload_images/16782311-53f80ac192de5dc7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 拦截验证token
业务接口需要验证请求合法性
![](https://upload-images.jianshu.io/upload_images/16782311-b2a446b19d8fae0c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


# 6 编码实战：快速实现访问鉴权接口+小结

## 6.2 小结
###  MySQL 用户表的设计
###  注册/登录/查询接口的实现
###  验证Token的拦截器

