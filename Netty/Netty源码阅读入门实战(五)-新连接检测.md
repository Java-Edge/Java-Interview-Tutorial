![](https://upload-images.jianshu.io/upload_images/4685968-82f4c3e10e82692f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e872805fe23374f5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 1 检测新连接
![](https://upload-images.jianshu.io/upload_images/4685968-153778c1a7c9bf0a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![打断点](https://upload-images.jianshu.io/upload_images/4685968-b8b838fdeba16606.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
telnet 此机地址,引起连接建立
![执行到此,进入查看](https://upload-images.jianshu.io/upload_images/4685968-ae3bdf29eb497cf5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-07f4d660aa7fa5a0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7966d10791db4b74.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![以上即对应 read 方法](https://upload-images.jianshu.io/upload_images/4685968-21d9debf039422de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7dad000eec086a14.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-903de91ec4edacc6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-5a1cdd5cfbe624e5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c384ea865b032494.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
继续返回原先位置
# 2 NioSocketChannel的创建
![](https://upload-images.jianshu.io/upload_images/4685968-647c96dbd1e78a16.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-013fc30fb2fc0753.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e155c372b2a6bcd6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7d13ad60fe40ec6c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-b415bec97c8cfce7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-06ffa91c79377599.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-188a44e54c15675d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-5075fcc2b55c3b0b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
禁止小包组成大包再发送方法
![](https://upload-images.jianshu.io/upload_images/4685968-7e3797cfe543c403.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-1d49894fd77d5612.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
看看这个静态变量
![](https://upload-images.jianshu.io/upload_images/4685968-397f5c66ac433ad8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-fc95cf0f37887a49.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-83a049dbe3909434.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-6f8988addbb5b30a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
由于 netty 常部署在服务端,所以默认启动 TCP无延时
![](https://upload-images.jianshu.io/upload_images/4685968-c855121c69a6dff0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0d25250cd6f46349.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c9dbb1c30702cbef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 3 Channel的分类
![](https://upload-images.jianshu.io/upload_images/4685968-04b9d6922210f30c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e59f9d20b37cef98.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
先看看最顶层的框架 Channel
![](https://upload-images.jianshu.io/upload_images/4685968-843dc27965709b9f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
网络 Socket 读写绑定的一种抽象
![](https://upload-images.jianshu.io/upload_images/4685968-909823755c5f97ed.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![作为骨架,保存了很多基础且重要的信息](https://upload-images.jianshu.io/upload_images/4685968-631b8076f4f03731.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ebd92923bd7aba17.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-6fbf5a4df22b1aa3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
使用选择器监听 IO 事件的一个抽象类
保存了 JDK 底层的一个 Channel
![开启非阻塞模式](https://upload-images.jianshu.io/upload_images/4685968-5b375626d12e93c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-6f2c4db3877b3446.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-65bb4df3e72805eb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-544035ff367ac8af.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![回到了抽象类,即保存了一个ACCEPT 事件](https://upload-images.jianshu.io/upload_images/4685968-95ffd151eb086037.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
看过服务 Channel 后,再看看客户端 Channel
![](https://upload-images.jianshu.io/upload_images/4685968-1cff6a124cf6a8ef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-14db32612fd8cb1c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ea6d6e38b5eddb4c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d86e20f04538c5c5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-3f3ead021a03739d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
客户端与服务端的 Channel 在 unsafe 类上也不同
客户端 Chanel
![](https://upload-images.jianshu.io/upload_images/4685968-8b127646df7189bc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-932e22334f9881fc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
服务端 Chanel
![](https://upload-images.jianshu.io/upload_images/4685968-649ccf219e119b59.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
用于某种 Chanel 的读写情况
![主要负责读事件](https://upload-images.jianshu.io/upload_images/4685968-fca626f2525be9a4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![读字节](https://upload-images.jianshu.io/upload_images/4685968-28f51dd6a2f102c9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
不同端配置项也不同
![](https://upload-images.jianshu.io/upload_images/4685968-4f4b5381882986f0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 4 新连接NioEventLoop的分配和selector注册
![](https://upload-images.jianshu.io/upload_images/4685968-a63fd8e061f4f0b4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-41bcbed71900c23e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a281db0fd9c51fa0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ed0f172cecfb4941.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
即为此处调用

![](https://upload-images.jianshu.io/upload_images/4685968-a2185e7d8be5ed58.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c02beb3305a4c3b1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![回调之后,最终都会删除自身](https://upload-images.jianshu.io/upload_images/4685968-a35dba0841019f83.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-80ac0551fc8fd753.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c15714b365bd7fb7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-27f5f994e3019ee2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-1f3c75872c498b42.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-8edf96ebff86c9ab.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-2200c311cc7d1f58.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-27f9c9325d4664f7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-9c1f3a7e7035445c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0dfad3da5ca3b88b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-29db7804405e204f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d69b8c5bca5ef41f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
回去看看 register 方法
![](https://upload-images.jianshu.io/upload_images/4685968-a293b371e2f7b7d7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7f8ccc643006d7aa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-93d0f6f001ec2e12.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-6fccbd27dd0223e8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-4749199c674ee183.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-2f017eb658969f3c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 5 NioSocketChannel读事件的注册
![](https://upload-images.jianshu.io/upload_images/4685968-46323b999c7b1e4b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-30bc74945e970fd9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-992a5110c0e939f1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7d0765411dd01aec.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-bde4d52dacbfd912.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d283c5c40d2fe86b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-95e07810657c3a94.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-3d3db00c01a5851c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-3007e69b2514dc4f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-727fb415cf2fead5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-1ada5b3ce203998e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
可以开始接收数据了
![](https://upload-images.jianshu.io/upload_images/4685968-3f76ca5e48aa3cc0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a8592fe84ef63070.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
回顾一下创建
![](https://upload-images.jianshu.io/upload_images/4685968-b11de4cff58c5d22.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-78f882bc1f86d06a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-98fd3e3ee315a996.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 6 新连接接入总结
![](https://upload-images.jianshu.io/upload_images/4685968-e5eff7d4523b9764.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-3831d1b58cd81d4c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
boss线程的第一个过程轮训处Accept事件，然后boss线程第二个过程通过jdk底层的channel的accept方法创建该连接。
![](https://upload-images.jianshu.io/upload_images/4685968-5edc177c40f49349.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
新连接NioEventLoop的分配和selector注册可以回答。boss线程调用chooser的next方法，拿到一个NioEventLoop，然后将这条连接注册到NioEventLoop的selector上面。