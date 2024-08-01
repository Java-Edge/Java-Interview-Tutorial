# Docker环境搭建

## 1 MAC安装Docker

先从官网将 dmg 文件下载到本地

![ step 1](https://upload-images.jianshu.io/upload_images/4685968-f37742ca35cab86d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



![ step 2](https://upload-images.jianshu.io/upload_images/4685968-abe6ff148a2837de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



![ step 3](https://upload-images.jianshu.io/upload_images/4685968-1335c1136f2d2663.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



![](https://upload-images.jianshu.io/upload_images/4685968-9929ac723c4657e2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



![打开](https://upload-images.jianshu.io/upload_images/4685968-8b4382019cb0152f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



![](https://upload-images.jianshu.io/upload_images/4685968-9c55e9b9b46118b1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



![](https://upload-images.jianshu.io/upload_images/4685968-5fa7d8bdd0d0a7ed.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



![](https://upload-images.jianshu.io/upload_images/4685968-e9cca938f1349518.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)





![注册一份免费的 docker 账户](https://upload-images.jianshu.io/upload_images/4685968-e8a985359ae969ab.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



![](https://upload-images.jianshu.io/upload_images/4685968-7b44d779ee32443a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



![](https://upload-images.jianshu.io/upload_images/4685968-e3895531e1896e4c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



![点击下载该工具](https://upload-images.jianshu.io/upload_images/4685968-b939ea1209472e91.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)





![一种便于制作 container 的工具](https://upload-images.jianshu.io/upload_images/4685968-e5a3ac4f67d82023.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 4 Vagrant & VirtualBox for Mac

[Mac OS 下安装 Vagrant](https://www.jianshu.com/p/3249d3bbe44e)

## 5 Vagrant & VirtualBox for Windows

大家自行研究，笔者是 Mac，无法演示

## 6 在 Linux-Ubuntu 安装 Docker

16.04.1 LTS。

[官方安装文档](https://docs.docker.com/install/linux/docker-ce/ubuntu/)：

![](https://upload-images.jianshu.io/upload_images/4685968-6fdaebae83fa3e01.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

卸载旧版本 Docker：

```bash
sudo apt-get remove docker docker-engine docker.io
```

安装所需仓库：

![](https://upload-images.jianshu.io/upload_images/4685968-fe98517add96ef14.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```bash
sudo apt-get update
```

```bash
sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
```

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

```bash
sudo apt-key fingerprint 0EBFCD88
```

开始安装：

![](https://upload-images.jianshu.io/upload_images/4685968-8e2d644f77c7e673.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```bash
sudo apt-get update
```

```bash
sudo apt-get install docker-ce
```

```bash
apt-cache madison docker-ce
```

```bash
sudo docker run hello-world
```

```bash
docker version
```

## 7 Docker Machine的本地使用(MacOS)

能自动在虚拟机安装 docker engine 的一个工具

![](https://upload-images.jianshu.io/upload_images/4685968-54ce5441138159db.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-adc6d555a5b2c973.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
准备好一台 VirtualBox
![](https://upload-images.jianshu.io/upload_images/4685968-3dcc0ee9b519aa3f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![docker-machine create demo](https://upload-images.jianshu.io/upload_images/4685968-9cbad43ee2408d4b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-308a17bd073ed589.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![docker-machine ls](https://upload-images.jianshu.io/upload_images/4685968-4a56c66cbda92729.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![docker-machine ssh demo](https://upload-images.jianshu.io/upload_images/4685968-e0bf03b238915617.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![再新建一个 docker 实例](https://upload-images.jianshu.io/upload_images/4685968-a9d0af0033b13530.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-89d817b0fc3626bd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a1ad10508c5088a5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![docker-machine stop demo1](https://upload-images.jianshu.io/upload_images/4685968-1183684630f3af65.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-305e584d7769a6ae.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-487167e30e5dffbb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

接下来将 demo 实例也关闭

![](https://upload-images.jianshu.io/upload_images/4685968-3f8e9ea24237b37d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

因为本地的 docker还在运行

![](https://upload-images.jianshu.io/upload_images/4685968-453f08e4ffd99e75.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

将其退出,再执行 version 命令
![](https://upload-images.jianshu.io/upload_images/4685968-6a708b45ba1d22e2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

只剩客户端,没有服务端,接下来重启 demo
![](https://upload-images.jianshu.io/upload_images/4685968-b92884d85bacc2a2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

并重进 demo
![](https://upload-images.jianshu.io/upload_images/4685968-0169061d29ba3c13.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![退出命令](https://upload-images.jianshu.io/upload_images/4685968-79ac1d414a4ee85a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

此时,肯定是无法连接 docker
![](https://upload-images.jianshu.io/upload_images/4685968-db7de6d238d0f5a5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 使用本地的客户端连接远程的服务器

但是可以连接 docker-machine 上的 docker
![docker-machine env demo](https://upload-images.jianshu.io/upload_images/4685968-828bf8936dd157c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
该命令输出的内容可以作为命令来设置一些 Docker 客户端使用的环境变量，从而让本机的 Docker 客户端可以与远程的 Docker 服务器通信

运行改该命令后,发现可连

![](https://upload-images.jianshu.io/upload_images/4685968-0cd7843323f7e83a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
好了，在当前的命令行终端中，接下来运行的 docker 命令操作的都是远程主机 demo 上的 Docker daemon

## 8 命令



![](https://upload-images.jianshu.io/upload_images/4685968-ab44b16e75870da8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



![](https://upload-images.jianshu.io/upload_images/4685968-22e881aa102035bd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-225db675a2e853a9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



![下载并移动到本地环境路径下](https://upload-images.jianshu.io/upload_images/4685968-5f59602c5534df99.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



![验证是否安装成功](https://upload-images.jianshu.io/upload_images/4685968-91cf7afccb1cb4a9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



![](https://upload-images.jianshu.io/upload_images/4685968-8c259e843cba3b7f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 9 Docker Playground



![](https://upload-images.jianshu.io/upload_images/4685968-cd20a8deb3a54037.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-497b403c798d2d1b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-cc00f5e00e8012eb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 10 总结

在Mac上玩Docker：

- Docker for Mac直接装
- 通过Virtualbox或Vmware虚拟化软件直接创建Linux虚拟机，在虚拟机里安装使用Docker
- 通过Vagrant + VirtualBox快速搭建Docker host
- 通过docker-machine快速搭建Docker host

在Windows上玩Docker：

- Docker for windows直接装（至少win10）
- 通过Virtualbox或者Vmware虚拟化软件直接创建Linux虚拟机，在虚拟机里安装使用Docker
- 通过Vagrant + VirtualBox快速搭建Docker host
- 通过docker-machine快速搭建Docker host

在Linux上玩Docker：

- Linux主机
- Linux虚机（支持虚拟化的任何操作系统或者平台）

在云上玩Docker：

- Docker-machine + driver（AWS，Aliyun等）    
- 直接使用云服务商提供的容器服务
  - AWS的ECS(Amazon Elastic Container Service)
  - Aliyun的Container Service