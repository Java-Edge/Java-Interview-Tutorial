# 1 角色
RocketMQ由四个角色组成：
- Producer
消息生产者
- Consumer
消费者
- Broker
MQ服务，负责接收、分发消息
- NameServer
负责MQ服务之间的协调
# 2 架构设计
![](https://img-blog.csdnimg.cn/20191025001711704.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

## NameServer-MQ服务注册发现中心
提供轻量级服务发现和路由。
每个名称服务器记录完整的路由信息，提供相应的读写服务，并支持快速存储扩展。

> NameServer 充当路由信息提供者。生产者/消费者客户查找主题以查找相应的broker列表。
#  3 搭建
## 配置
- runserver.sh 设置小点
![](https://img-blog.csdnimg.cn/20191103145158719.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
- runbroker.sh 设置小点
![](https://img-blog.csdnimg.cn/20191103145746578.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
## 启动
```bash
nohup sh bin/mqnamesrv > logs/namesrv.log 2>&1 &
```
```bash
nohup sh bin/mqbroker -n localhost:9876 > 
~/logs/rocketmqlogs/broker.log 2>&1 &
```
- 启动报错
![](https://img-blog.csdnimg.cn/20191103151015192.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
- 查看日志![](https://img-blog.csdnimg.cn/20191103150942509.png)
- 改启动文件,添加JAVA_HOME变量![](https://img-blog.csdnimg.cn/20191103154507585.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 启动成功
![](https://img-blog.csdnimg.cn/20191103154618638.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
启动broker
```bash
nohup sh bin/mqbroker -c conf/broker.conf -n localhost:9876 > logs/broker.log 2>&1 &
```
![](https://img-blog.csdnimg.cn/20191103155747201.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
# remoting模块架构
![](https://img-blog.csdnimg.cn/20201008002847207.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)