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



vim /usr/lib/rabbitmq/lib/rabbitmq_server-3.6.5/ebin/rabbit.app
比如修改密码、配置等等，例如：loopback_users 中的 <<"guest">>,只保留guest
服务启动和停止：

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

![Linux环境参数](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1MTI2XzQ2ODU5NjgtNzlkM2Y3MTVkZjUxYTg1ZS5wbmc?x-oss-process=image/format,png)

![下载页](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1MTQ0XzQ2ODU5NjgtZDc2NWE2YTJlM2MzYTc2NC5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI2MjcyXzQ2ODU5NjgtMGE1OWI1OWE3ZDhhZTEwNC5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1NjU4XzQ2ODU5NjgtMGNjYzVkZDBjNjBlMjE4OC5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI0OTk0XzQ2ODU5NjgtODRhMjdjYjJiOGRkNDA0OC5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1MDQ2XzQ2ODU5NjgtNDk2ODVhYWYwY2ViYzc5MC5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1MzQ3XzQ2ODU5NjgtZTMzNjNhZTk3ZTFlM2FhNy5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1MTg1XzQ2ODU5NjgtYTNiNmRhY2UwNDEzMWY0MS5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1MTIxXzQ2ODU5NjgtNDQ4NmU5OGVlODlhMjMwMi5wbmc?x-oss-process=image/format,png)
![ps -ef|grep rabbit 查看rabbitmq的启动情况](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MTgvNTA4ODc1NV8xNTYwODUxMDI1MTE4XzQ2ODU5NjgtZmVjZGU0N2I4OWQzMzNiOC5wbmc?x-oss-process=image/format,png)

#### 7.2.2 CentOS7.3

对于初学者,推荐使用一键式的RPM安装方式

注意与 erlang 版本的对应关系!
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM5MDMxXzQ2ODU5NjgtNGViNGQxMmY3ZWYyNjU1NS5wbmc?x-oss-process=image/format,png)

由于笔者使用3.6.5 版本.查看对应 erlang  
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM4OTY0XzQ2ODU5NjgtMGY4MmFjOTY4MDVkZmI1ZC5wbmc?x-oss-process=image/format,png)

- [下载 erlang 环境](https://github.com/rabbitmq/erlang-rpm/releases/tag/v18.3.4.7)
  ![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM5MDM1XzQ2ODU5NjgtYzFmMDE2ZjIxZjdmM2U2Ny5wbmc?x-oss-process=image/format,png)

- 下载完毕
  ![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM5MDYzXzQ2ODU5NjgtZDk0YmM1MmMyNTFmMTNhZS5wbmc?x-oss-process=image/format,png)

- rpm时报错,缺少依赖
  ![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM5MDEzXzQ2ODU5NjgtYWVkNzFiYmNlOWRkZjU0NS5wbmc?x-oss-process=image/format,png)

解决问题：yum -y install openssl openssl-devel
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM5Mjk0XzQ2ODU5NjgtNTQ2NmViYjc3YzlkZTU1MS5wbmc?x-oss-process=image/format,png)

再次 rpm
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM4OTg1XzQ2ODU5NjgtYWQ5YWExOTVlZTIzZjFjOC5wbmc?x-oss-process=image/format,png)

下载 rabbitmq rpm 文件
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM5MjMyXzQ2ODU5NjgtMjViZTI2ZGFjMjA2ZjMxOS5wbmc?x-oss-process=image/format,png)

下载完毕
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM5MjA3XzQ2ODU5NjgtZGM4ZGRmMDNkODA2YzQ0ZC5wbmc?x-oss-process=image/format,png)

安装报错
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM4OTkxXzQ2ODU5NjgtYWZiZGE2ZjA5Y2FjNmVlZC5wbmc?x-oss-process=image/format,png)

[下载 socat](http://repo.iotti.biz/CentOS/7/x86_64/socat-1.7.3.2-5.el7.lux.x86_64.rpm)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM4OTg4XzQ2ODU5NjgtY2IzYmFiNWZjOTYxZWJjMS5wbmc?x-oss-process=image/format,png)

安装 socat
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM4OTg1XzQ2ODU5NjgtMjdlNzc5ZTJlZjc5Zjc4YS5wbmc?x-oss-process=image/format,png)

再次安装 rebbitmq 即可
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM5MjA2XzQ2ODU5NjgtMWY5ODcwNWYxZTMzNWVmMi5wbmc?x-oss-process=image/format,png)

####    配置文件

默认端口号
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM4OTcwXzQ2ODU5NjgtNDlmNDcxMTJiZDllMmMzMS5wbmc?x-oss-process=image/format,png)

编辑用户访问权限
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM5MDI2XzQ2ODU5NjgtZWU4OTY2NTA3NGE3ODkyNC5wbmc?x-oss-process=image/format,png)

修改如下，暂时本地可访问
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjkvNTA4ODc1NV8xNTYxNzY3OTM4OTgwXzQ2ODU5NjgtODEyYjBiYjdmNjYzZjllMi5wbmc?x-oss-process=image/format,png)

#### 7.2.3 macOS

下载安装RabbitMQ

```bash
brew install rabbitmq
```

MQ的安装目录在 /usr/local/Cellar/rabbitmq

安装RabiitMQ的可视化监控插件

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
javaedge@JavaEdgedeMac-mini 3.12.1 %
```

配置环境变量

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
rabbitmq-server -detached
```

```bash
javaedge@JavaEdgedeMac-mini bin % brew services restart rabbitmq
Stopping `rabbitmq`... (might take a while)
==> Successfully stopped `rabbitmq` (label: homebrew.mxcl.rabbitmq)
==> Successfully started `rabbitmq` (label: homebrew.mxcl.rabbitmq)
```





## 7 查看状态



```bash
javaedge@JavaEdgedeMac-mini 3.12.1 % rabbitmqctl status
```

### 访问可视化监控插件的界面

浏览器内输入 http://localhost:15672,默认的用户名密码都是guest,登录后可以在Admin那一列菜单内添加自己的用户

![](https://img-blog.csdnimg.cn/f3256c455f6a4ca68626b0cf2a1c144d.png)

### 关闭

```bash
rabbitmqctl stop
```