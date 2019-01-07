![](https://upload-images.jianshu.io/upload_images/4685968-23388388187b86e2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 1.1 Memcached入门
![](https://upload-images.jianshu.io/upload_images/4685968-98ad6716eac1934a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 1.2 Memcached安装部署
- libevent安装
![](https://upload-images.jianshu.io/upload_images/4685968-4842325c0ef337bb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![wget https://github.com/libevent/libevent/releases/download/release-2.1.8-stable/libevent-2.1.8-stable.tar.gz](https://upload-images.jianshu.io/upload_images/4685968-396c2de5d5fb4cf8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![./configure --prefix=/opt/install/libevent](https://upload-images.jianshu.io/upload_images/4685968-4eb4ee2ec9bb5b9d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![make make install](https://upload-images.jianshu.io/upload_images/4685968-0747fee6b4ca74c4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![安装成功](https://upload-images.jianshu.io/upload_images/4685968-f2f3119705bfed0c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- memcached 安装
![ wget https://memcached.org/files/memcached-1.5.8.tar.gz](https://upload-images.jianshu.io/upload_images/4685968-e71d50f7674f2079.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![tar -zxvf memcached-1.5.8.tar.gz](https://upload-images.jianshu.io/upload_images/4685968-3ef1f1a99dcb5fd4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![./configure --prefix=/opt/install/memcached --with-libevent=/opt/install/libevent](https://upload-images.jianshu.io/upload_images/4685968-6cfa9dd3a5fbfc47.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![make & make install](https://upload-images.jianshu.io/upload_images/4685968-69f118b9e9e9a9c8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![安装成功](https://upload-images.jianshu.io/upload_images/4685968-f80d91588f054a3d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 1.3 Memcached启动参数讲解
![](https://upload-images.jianshu.io/upload_images/4685968-d5a93d0fa454fb9e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![bin/memcached --help](https://upload-images.jianshu.io/upload_images/4685968-c583a47b8401a0b5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 启动参数 使之成为守护进程
![bin/memcached -d -u root -l 192.168.1.191 -p 2222 -c 128 -m 100 -P myPid](https://upload-images.jianshu.io/upload_images/4685968-c020e808e267aaab.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 1.4 命令演示准备以及新增操作实战
![](https://upload-images.jianshu.io/upload_images/4685968-2e4bb51369472ae2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
安装 Telnet
![yum install telnet](https://upload-images.jianshu.io/upload_images/4685968-eb14a98e42dec5f1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-56a0e7fd7d1055c2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 1.5 替换操作
![](https://upload-images.jianshu.io/upload_images/4685968-c53cd60d0bc41768.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 1.6 检查更新操作演示
![](https://upload-images.jianshu.io/upload_images/4685968-65f216372ed0b5b5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 1.7 删除操作
![](https://upload-images.jianshu.io/upload_images/4685968-b30afbff93d6ff14.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 1.8 Memcached内存分配机制
![](https://upload-images.jianshu.io/upload_images/4685968-a57f438d13f85874.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 1.9寻找Chunk历险记
![](https://upload-images.jianshu.io/upload_images/4685968-ed78c1b8d89343c4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
