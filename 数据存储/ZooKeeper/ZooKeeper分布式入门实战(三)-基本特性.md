# 1 zookeeper常用命令行操作
![](https://upload-images.jianshu.io/upload_images/4685968-ccd590412a2cd494.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-cf2a871d4258bcfd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-52de2287ea69d1ac.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-b725b4c488f456a7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-fee31ba95638cac7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 2 session的基本原理与create命令的使用
![](https://upload-images.jianshu.io/upload_images/4685968-ca5f378e430694de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d64e121dfe5b96b2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-4d66d950bd45c28a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ced556810acfdcbf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-dfe1ff7cc11cf559.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 临时节点自动删除,根据心跳机制
先 Ctrl+C 断开连接
再重连
![已经无 tmp 临时目录](https://upload-images.jianshu.io/upload_images/4685968-5bcadc31859ebef0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 创建顺序节点
![](https://upload-images.jianshu.io/upload_images/4685968-a589c77abe637665.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 3 set与delete命令的使用
![先 get 一下](https://upload-images.jianshu.io/upload_images/4685968-859d2c4c3efa2538.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-4a999a52257a1113.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-911c29c53114e28a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
dataVersion从0到1,即是乐观锁版本变化
![](https://upload-images.jianshu.io/upload_images/4685968-00a477acefe434c6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![可看出有锁](https://upload-images.jianshu.io/upload_images/4685968-38100eab0ee08857.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![不加版本号可以直接删除操作](https://upload-images.jianshu.io/upload_images/4685968-e84981b0c8a94f0b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e4e2d688085b0880.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
版本号0过时,无法操作删除
![对应版本号删除即可](https://upload-images.jianshu.io/upload_images/4685968-124e27421db5a14b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 4 zk特性 – 理解watcher机制
![](https://upload-images.jianshu.io/upload_images/4685968-0bb9debe3f12942a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0eccecbcbe34795c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 5 父节点watcher事件
![](https://upload-images.jianshu.io/upload_images/4685968-dafc9161a6e47981.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-67dfabef11c7dc88.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-6c44714b20b72c5d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![直接删除无事件触发](https://upload-images.jianshu.io/upload_images/4685968-9671d16b5047d9bc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![如此添加事件即可](https://upload-images.jianshu.io/upload_images/4685968-ca7b9c32a8bd2636.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 6 子节点watcher事件
![](https://upload-images.jianshu.io/upload_images/4685968-00317f3425078295.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e60302b5949f2b39.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-f52e53dc7b2963de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a3c2c112f4befcbd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/4685968-7466a005e98a3821.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
上图并无触发 watch 事件
![如此才能触发](https://upload-images.jianshu.io/upload_images/4685968-645c0ddde37cfe95.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 7 watcher常用使用场景
![](https://upload-images.jianshu.io/upload_images/4685968-9129b2e7cb04c735.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 8 ACL(access control lists)权限控制
![](https://upload-images.jianshu.io/upload_images/4685968-7721db45d89fa2e5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-f453d1b7235545aa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![默认权限](https://upload-images.jianshu.io/upload_images/4685968-9737e69d204d4e20.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a32a89fc5213ea1c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-78ec94df59de45f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-9f63b42e87dcf491.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-4c7ed28b59d48ad4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d42aadd747e3e3da.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 9 ACL命令行
## 9.1 world讲解
![设权限](https://upload-images.jianshu.io/upload_images/4685968-fbab9ed711079d84.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![无删除权限](https://upload-images.jianshu.io/upload_images/4685968-625079774d114aec.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![添加权限,成功删除](https://upload-images.jianshu.io/upload_images/4685968-c0e976a0fcabf226.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 9.2 auth讲解
![](https://upload-images.jianshu.io/upload_images/4685968-dd0470b4d5c7c8f8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![初始化](https://upload-images.jianshu.io/upload_images/4685968-a663ea5fdb2f55cd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![须先注册](https://upload-images.jianshu.io/upload_images/4685968-dbf1a6c69db5d5ab.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d0a14f3858ac2a3a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-631d9df6ce76b77f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
其实, 只要添加 addauth 后,都是跟着第一次的那套密码走的,所以直接省略不写亦可
![](https://upload-images.jianshu.io/upload_images/4685968-f7335aeba8ce817e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 9.3 digest讲解
Ctrl+C 先退出注销用户
![](https://upload-images.jianshu.io/upload_images/4685968-c316ad7abba05886.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-2d13023219303ef2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![可删除,不可写](https://upload-images.jianshu.io/upload_images/4685968-7cd545442a0a8594.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)