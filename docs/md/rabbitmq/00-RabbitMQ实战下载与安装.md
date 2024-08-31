# 00-RabbitMQ实战下载与安装

## 1 准备

```bash
yum install 
build-essential openssl openssl-devel unixODBC unixODBC-devel 
make gcc gcc-c++ kernel-devel m4 ncurses-devel tk tc xz
```

## 2 下载

```bash
wget www.rabbitmq.com/releases/erlang/erlang-18.3-1.el7.centos.x86_64.rpm
wget http://repo.iotti.biz/CentOS/7/x86_64/socat-1.7.3.2-5.el7.lux.x86_64.rpm
wget www.rabbitmq.com/releases/rabbitmq-server/v3.6.5/rabbitmq-server-3.6.5-1.noarch.rpm
```

## 3 配置文件

```
vim /usr/lib/rabbitmq/lib/rabbitmq_server-3.6.5/ebin/rabbit.app
```

如修改密码、配置等，如：loopback_users  中的`<<"guest">> ` 只保留guest

### 服务启停

```bash
# 启动 
rabbitmq-server start &
# 停止 
rabbitmqctl app_stop
```

## 4 管理插件：rabbitmq-plugins enable rabbitmq_management

访问地址：http://192.168.11.76:15672/

Management Plugin e

## 5 安装

###  7.1 指南

 - 官网地址: http://www.rabbitmq.com/
 - 预先准备:安装Linux必要依赖包
 - 下载RabbitMQ必须安装包
 - 配置文件修改

### 7.2 下载及安装

#### 7.2.1 Ubuntu环境

Ubuntu16.04.1

下载地址：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1MTQ0XzQ2ODU5NjgtZDc2NWE2YTJlM2MzYTc2NC5wbmc?x-oss-process=image/format,png)

操作系统：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI2MjcyXzQ2ODU5NjgtMGE1OWI1OWE3ZDhhZTEwNC5wbmc?x-oss-process=image/format,png)

下载方式：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1NjU4XzQ2ODU5NjgtMGNjYzVkZDBjNjBlMjE4OC5wbmc?x-oss-process=image/format,png)

erlang 版本：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI0OTk0XzQ2ODU5NjgtODRhMjdjYjJiOGRkNDA0OC5wbmc?x-oss-process=image/format,png)

开始下载：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1MDQ2XzQ2ODU5NjgtNDk2ODVhYWYwY2ViYzc5MC5wbmc?x-oss-process=image/format,png)

```bash
vim /etc/apt/sources.list
```

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1MTg1XzQ2ODU5NjgtYTNiNmRhY2UwNDEzMWY0MS5wbmc?x-oss-process=image/format,png)

````
apt-get install rabbitmq-server
````

```bash
# 查看rabbitmq启动情况
ps -ef|grep rabbit
```

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1MTE4XzQ2ODU5NjgtZmVjZGU0N2I4OWQzMzNiOC5wbmc?x-oss-process=image/format,png)

#### 7.2.2 CentOS7.3

初学者推荐一键式RPM安装，注意与 erlang 版本对应：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM5MDMxXzQ2ODU5NjgtNGViNGQxMmY3ZWYyNjU1NS5wbmc?x-oss-process=image/format,png)

笔者用3.6.5，查看对应erlang：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/a8867146e2f9f8bc8ae3bc56d9f09fae.png)



##### [下载 erlang 环境](https://github.com/rabbitmq/erlang-rpm/releases/tag/v18.3.4.7)

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM5MDM1XzQ2ODU5NjgtYzFmMDE2ZjIxZjdmM2U2Ny5wbmc?x-oss-process=image/format,png)

wget下载即可。

##### rpm

报错，缺少依赖：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM5MDEzXzQ2ODU5NjgtYWVkNzFiYmNlOWRkZjU0NS5wbmc?x-oss-process=image/format,png)

解决：

```bash
yum -y install openssl openssl-devel
```

再 rpm：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM4OTg1XzQ2ODU5NjgtYWQ5YWExOTVlZTIzZjFjOC5wbmc?x-oss-process=image/format,png)

下载 rabbitmq rpm 文件：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM5MjMyXzQ2ODU5NjgtMjViZTI2ZGFjMjA2ZjMxOS5wbmc?x-oss-process=image/format,png)

wget下载即可。

##### 安装

报错：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM4OTkxXzQ2ODU5NjgtYWZiZGE2ZjA5Y2FjNmVlZC5wbmc?x-oss-process=image/format,png)

[下载 socat](http://repo.iotti.biz/CentOS/7/x86_64/socat-1.7.3.2-5.el7.lux.x86_64.rpm)

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM4OTg4XzQ2ODU5NjgtY2IzYmFiNWZjOTYxZWJjMS5wbmc?x-oss-process=image/format,png)

安装 socat：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM4OTg1XzQ2ODU5NjgtMjdlNzc5ZTJlZjc5Zjc4YS5wbmc?x-oss-process=image/format,png)

再安装 rebbitmq：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM5MjA2XzQ2ODU5NjgtMWY5ODcwNWYxZTMzNWVmMi5wbmc?x-oss-process=image/format,png)

##### 配置文件

默认端口号：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM4OTcwXzQ2ODU5NjgtNDlmNDcxMTJiZDllMmMzMS5wbmc?x-oss-process=image/format,png)

编辑用户访问权限：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM5MDI2XzQ2ODU5NjgtZWU4OTY2NTA3NGE3ODkyNC5wbmc?x-oss-process=image/format,png)

修改如下，暂时本地可访问：

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM4OTgwXzQ2ODU5NjgtODEyYjBiYjdmNjYzZjllMi5wbmc?x-oss-process=image/format,png)

#### 7.2.3 macOS

##### 下载安装RabbitMQ

```bash
brew install rabbitmq
```

MQ的安装目录在 /usr/local/Cellar/rabbitmq

##### 安装RabiitMQ可视化监控插件

```bash
// 切换到MQ目录,注意你的安装版本可能不是3.7.15
cd /usr/local/Cellar/rabbitmq/3.12.1/
// 启用rabbitmq management插件
javaedge@JavaEdgedeMac-mini 3.12.1 % sudo sbin/rabbitmq-plugins enable rabbitmq_management
Password:
Enabling plugins on node rabbit@localhost:
rabbitmq_management
The following plugins have been configured:
  rabbitmq_amqp1_0
  rabbitmq_management
  rabbitmq_management_agent
  rabbitmq_mqtt
  rabbitmq_stomp
  rabbitmq_stream
  rabbitmq_web_dispatch
Applying plugin configuration to rabbit@localhost...
Plugin configuration unchanged.
```

##### 配置环境变量

```bash
linux：
sudo vi /etc/profile
//加入以下两行
export RABBIT_HOME=/usr/local/Cellar/rabbitmq/3.12.1
export PATH=$PATH:$RABBIT_HOME/sbin
// 立即生效
source /etc/profile

macos：
javaedge@JavaEdgedeMac-mini 3.12.1 % vim ~/.zshrc
javaedge@JavaEdgedeMac-mini 3.12.1 % source ~/.zshrc
javaedge@JavaEdgedeMac-mini 3.12.1 %
```

## 6 后台启动rabbitMQ

```bash
# linux
rabbitmq-server -detached

# mac
brew services start rabbitmq
```

```bash
# macOS
$ brew services restart rabbitmq
Stopping `rabbitmq`... (might take a while)
==> Successfully stopped `rabbitmq` (label: homebrew.mxcl.rabbitmq)
==> Successfully started `rabbitmq` (label: homebrew.mxcl.rabbitmq)
```

## 7 查看状态

```bash
javaedge@JavaEdgedeMac-mini 3.12.1 % rabbitmqctl status
```

### 访问可视化监控插件的界面

浏览器内输入 http://localhost:15672，默认用户名密码guest。登录后可在Admin那一列菜单内添加自己的用户：

![](https://img-blog.csdnimg.cn/f3256c455f6a4ca68626b0cf2a1c144d.png)

### 关闭

```bash
rabbitmqctl stop
```