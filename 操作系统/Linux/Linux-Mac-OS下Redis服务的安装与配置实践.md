# 下载源码
执行命令
`wget http://download.redis.io/releases/redis-2.8.3.tar.gz`
![Linux](http://upload-images.jianshu.io/upload_images/4685968-d8e6a7be570c8625.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![MacOS](https://upload-images.jianshu.io/upload_images/4685968-da63cf65861b273c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
刚才下载的 redis文件夹拷贝进入`/usr/local/`
# 解压
![](http://upload-images.jianshu.io/upload_images/4685968-7732fb9f4083de41.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 将其移动到usr/local目录下并重命名为redis
![](http://upload-images.jianshu.io/upload_images/4685968-0a8cbba8be546754.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 4个CPU进行编译
![Linux make -j4 ](http://upload-images.jianshu.io/upload_images/4685968-f7fbc76fed2d7bd5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![MacOS make编译](https://upload-images.jianshu.io/upload_images/4685968-c59ca547001bbce1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 将编译后的文件添加到启动目录
- make install
![Linux](http://upload-images.jianshu.io/upload_images/4685968-0123fccb5a841353.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![Mac OS](https://upload-images.jianshu.io/upload_images/4685968-b4127ec2d23b0721.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
将程序安装至系统中。如果原始码编译无误，且执行结果正确，便可以把程序安装至系统预设的可执行文件存放路径
# 查看服务器
![Linux](http://upload-images.jianshu.io/upload_images/4685968-cc6d37828483b067.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![Mac OS](https://upload-images.jianshu.io/upload_images/4685968-4cdec277eeb9e824.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 查看配置文件 redis.conf(文件很长,仅截取第一页)
`vi redis.conf`
![](http://upload-images.jianshu.io/upload_images/4685968-aed44d3ddb73eae7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 修改配置文件参数
###bind参数:即允许指定ip访问redis服务器,默认本机才能访问(127.0.0.1),在此改成如下(允许任意ip访问)
![](http://upload-images.jianshu.io/upload_images/4685968-f73bba909c910070.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### daemonize参数:守护线程，用来指定redis是否要用守护线程的方式启动。默认是no
- daemonize:yes
代表开启守护进程模式。redis采用的是单进程多线程的模式。在该模式下，redis会在后台运行，并将进程pid号写入至redis.conf选项pidfile设置的文件中，此时redis将一直运行，除非手动kill该进程。
- daemonize:no
当前界面将进入redis的命令行界面，exit强制退出或者关闭连接工具(putty,xshell等)都会导致redis进程退出。

修改为yes
![daemonize:yes](http://upload-images.jianshu.io/upload_images/4685968-1c3dff636827e2fc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 启动redis服务
![](http://upload-images.jianshu.io/upload_images/4685968-5c2d7770ce0ab0ba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#查看进程号
![](http://upload-images.jianshu.io/upload_images/4685968-434a736e34b25b00.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 访问
![redis-cli](http://upload-images.jianshu.io/upload_images/4685968-30937b837060989a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 基本的set/get操作
![](http://upload-images.jianshu.io/upload_images/4685968-5da734870791c47f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 设置密码
![](http://upload-images.jianshu.io/upload_images/4685968-b3b3599f4b34a868.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 之后关闭并重启redis服务
![](http://upload-images.jianshu.io/upload_images/4685968-6ed1eb0b4d7c33d2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 需要密码重登陆
![](http://upload-images.jianshu.io/upload_images/4685968-37020eeb411ed3c1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#访问redis的utils目录将redis设置为系统服务
![](http://upload-images.jianshu.io/upload_images/4685968-d4dbdd54e78235fe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#检验服务注册信息
![](http://upload-images.jianshu.io/upload_images/4685968-37a79558b4fbbf69.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#查看状态信息
![image.png](http://upload-images.jianshu.io/upload_images/4685968-a970147d3cb435ec.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#至此redis服务已经安装完毕

# MacOS
下载安装
```bash
brew install redis
```
```bash
brew service start redis
```
启动redis