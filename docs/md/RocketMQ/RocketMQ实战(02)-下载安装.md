# RocketMQ实战(02)-下载安装
## 1 RocketMQ是什么

RocketMQ是由阿里捐赠给Apache的一款分布式、队列模型的开源消息中间件，经历了淘宝双十一的洗礼。

官网
![](https://img-blog.csdnimg.cn/20191024132120332.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 2 RocketMQ的发展史

![](https://img-blog.csdnimg.cn/20191024131500529.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

2017开始发布即最新4.0.0版本![](https://img-blog.csdnimg.cn/20191024131837417.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 3  RocketMQ的特性

![](https://img-blog.csdnimg.cn/20191024131953983.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/2019102413215576.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 5 下载与安装

进入下载页：

![](https://img-blog.csdnimg.cn/20191024233641247.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

下载
![](https://img-blog.csdnimg.cn/20191024233733483.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

解压

启动namespace  默认4g![](https://img-blog.csdnimg.cn/2019102423483883.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

启动成功日志![](https://img-blog.csdnimg.cn/20191206001814128.png)

启动broke 默认8g

```bash
nohup sh bin/mqbroker -n localhost:9876 
> ~/logs/rocketmqlogs/broker.log 2>&1 &
```

![](https://img-blog.csdnimg.cn/20191206003703263.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

验证启动成功![](https://img-blog.csdnimg.cn/20191206003753507.png)![](https://img-blog.csdnimg.cn/20191024134451940.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

发消息

```bash
export NAMESRV ADDR=localhost:9876
bin/tools.sh org.apache.rocketmq.example.quickstart.Producer
```

收消息

```bash
bin/tools.sh org.apache.rocketmq.example.quickstart.Consumer
```

##  3 搭建

### 配置

runserver.sh 设置小点
![](https://img-blog.csdnimg.cn/20191103145158719.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

runbroker.sh 设置小点
![](https://img-blog.csdnimg.cn/20191103145746578.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

### 启动

```bash
nohup sh bin/mqnamesrv > logs/namesrv.log 2>&1 &
```

```bash
nohup sh bin/mqbroker -n localhost:9876 > 
~/logs/rocketmqlogs/broker.log 2>&1 &
```

启动报错
![](https://img-blog.csdnimg.cn/20191103151015192.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

查看日志![](https://img-blog.csdnimg.cn/20191103150942509.png)

改启动文件，添加JAVA_HOME变量![](https://img-blog.csdnimg.cn/20191103154507585.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

启动成功
![](https://img-blog.csdnimg.cn/20191103154618638.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
启动broker

```bash
nohup sh bin/mqbroker -c conf/broker.conf -n localhost:9876 > logs/broker.log 2>&1 &
```

![](https://img-blog.csdnimg.cn/20191103155747201.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 6 引入客户端

```xml
<dependency>
	<groupld>org.apache.rocketmq</groupld>
	<artifactld> rocketmq-client</artifactld>
	<version>4.3.0</version>
</dependency>
```

参考

- [RocketMQ官网](https://rocketmq.apache.org/docs/core-concept/)