# 1 统一配置中心概述
##为什么需要统一配置中心
![](https://upload-images.jianshu.io/upload_images/4685968-f0f3d011837db423.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-643d79fbceb00776.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 2 Config Server
![](https://upload-images.jianshu.io/upload_images/4685968-0fad7b5dca0b3a38.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7e711c92c0453468.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
直接运行报错,因为会从 git拉取配置文件
![](https://upload-images.jianshu.io/upload_images/4685968-9cc4e0bef5893fae.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
在 Git 建立新仓库存放配置文件
![](https://upload-images.jianshu.io/upload_images/4685968-420d649f55c1b7a0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![配置 Git 信息后,重启成功,无报错](https://upload-images.jianshu.io/upload_images/4685968-7852959592bd1918.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![访问配置文件yml 格式](https://upload-images.jianshu.io/upload_images/4685968-5b7951651045396f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![properties格式](https://upload-images.jianshu.io/upload_images/4685968-423951f19ae6b435.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![json格式](https://upload-images.jianshu.io/upload_images/4685968-5814672f3cb205c4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
若故意将 yml 格式写错,则会报错
![](https://upload-images.jianshu.io/upload_images/4685968-489cc6a257433f45.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
两种配置文件访问路径
```
/{name}-{profiles}.yml
/{label}/{name}-{profiles}.properties]
```
name  服务名
profiles 环境
label 分支( branch)

新建一个分支
![](https://upload-images.jianshu.io/upload_images/4685968-6c4062f69c2a9b3e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
修改下配置文件,以示区别
![](https://upload-images.jianshu.io/upload_images/4685968-264e6d807eb94200.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
访问成功
![](https://upload-images.jianshu.io/upload_images/4685968-38b3d9837b956ce7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
git默认存放路径
![](https://upload-images.jianshu.io/upload_images/4685968-c91e79e187a22836.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
亦可自定义路径
![](https://upload-images.jianshu.io/upload_images/4685968-26a5431fa67a0b63.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 3 Config Client
![在 order 添加 config-client 依赖](https://upload-images.jianshu.io/upload_images/4685968-15bf14c76ab8ceb0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![配置文件修改,删除多余信息](https://upload-images.jianshu.io/upload_images/4685968-f4c7b53b65e4a4c2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 4 SpringCloud Bus 自动刷新配置
![架构图](https://upload-images.jianshu.io/upload_images/4685968-9578a72bb05c0772.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 参考

[SpringCloud Finchley三版本微服务实战](https://coding.imooc.com/class/187.html)
