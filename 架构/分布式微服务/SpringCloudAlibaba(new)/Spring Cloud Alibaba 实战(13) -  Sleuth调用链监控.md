> 本文概要:大白话剖析调用链监控原理,然后学习Sleuth,Zipkin,然后将Sleuth整合Zipkin,最后学习Zipkin数据持久化（Elasticsearch）以及Zipkin依赖关系图

- 实战至此,基本功能已经全部实现
![](https://img-blog.csdnimg.cn/20191216001513406.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

# 1 剖析调用链监控原理
 如果我们的项目出现异常了,怎么办呢?
 
## 1.1 问题定位需求
◆ 跨微服务的API调用发生异常,要求快速定位(比如5分钟以内)出问题出在哪里，该怎么办?
◆  跨微服务的API调用发生性能瓶颈,要求迅速定位(比如5分钟以内)出系统瓶颈,该怎么办?

对于这两种情况,传统方式很难解决,需要调用链监控工具排查(有点类似于Linux内核的调用栈日志哦)

调用链监控工具可谓分布式项目维护的必备工具!

## 1.2 监控的基本原理
- 譬如说,对于本项目,监控如下请求
![](https://img-blog.csdnimg.cn/20191216002113194.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 定义如下4个时间节点
![](https://img-blog.csdnimg.cn/20191216002209227.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 在DB中维护了一张自关联型数据trace表: 唯一标识,父spanid,服务名称,调用的API,四个时间节点的阶段,数据发生的时间戳
![](https://img-blog.csdnimg.cn/20191216002317990.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
如此一来,正常情况下,一次调用,DB会生成四条数据,即可知道哪个阶段发生问题!

# 2 优雅地使用 Sleuth
## 2.1 何为 Sleuth
![](https://img-blog.csdnimg.cn/20191216002945143.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 官方定位 : Sleuth是一 个Spring Cloud的分布式跟踪解决方案
讲人话就是调用链监控工具的客户端

## 2.2 术语条目
### Span (跨度) 
Sleuth的基本工作单元,它用一个64位的id唯一标识。
除ID外，span还包含其他数据,例如描述、时间戳事件、键值对的注解(标签)、span ID、span父ID等。

前面我们DB中的一条数据就是一个span

### trace (跟踪) 
一组span组成的树状结构称为trace

即DB中完整的四条数据

### Annotation (标注)
● CS ( Client Sent客户端发送) 
客户端发起一一个请求,该annotation描述了span的开始。
●SR ( Server Received服务器端接收) 
服务器端获得请求并准备处理它。
●SS( Server Sent服务器端发送) 
该annotation表明完成请求处理(当响应发回客户端时)。
●CR( Client Received客户端接收) 
span结束的标识。客户端成功接收到服务器端的响应。

## 2.3 为用户中心整合Sleuth
- 添加依赖
![](https://img-blog.csdnimg.cn/20191216004527195.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191216005026836.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
然后直接启动服务即可
# 3  Zipkin搭建与整合
## 3.1 何为Zipkin
Zipkin是Twitter开源的分布式跟踪系统,主要用来收集系统的时序数据,从而追踪系统的调用问题

## 3.2 搭建 Zipkin Server
Zipkin Server的 API兼容性（微服务通过集成reporter模块，从而Zipkin Server通信） 非常好，对于Spring Cloud Greenwich，Zipkin Server只需安装2.x即可。
- 下载 : Zipkin官方的Shell下载最新版本
```bash
curl -sSL https://zipkin.io/quickstart.sh | bash -s
之后 java -jar启动
```
可看到也是一个SpringBoot应用
![](https://img-blog.csdnimg.cn/20191216005824127.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191216010010990.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 查看9411端口

```bash
http://localhost:9411/zipkin/
```

![](https://img-blog.csdnimg.cn/20191216010120784.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 添加依赖,由于zipkin已经包含sleuth,所以移除那个依赖
![](https://img-blog.csdnimg.cn/20191216010243377.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191216010401952.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191216010603743.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
抽样是为了减少性能损失,默认是只上报0.1的trace数据
调用请求后,zipkin:
![](https://img-blog.csdnimg.cn/20191216010814480.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191216011311632.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191216011337721.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 由于该请求客户端是浏览器,而其没有集成sleuth,不上报zipkin,所以不显示![](https://img-blog.csdnimg.cn/20191216011359876.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
# 4 整合Zipkin之后Nacos报错解决
- 推荐阅读
[解决Spring Cloud Alibaba/Spring Cloud整合Zipkin之后的报错问题](https://www.imooc.com/article/291578)
# 5 为所有微服务整合Zipkin
对内容中心和网关都按照前面用户中心的步骤整合即可

# 6 Zipkin数据持久化（Elasticsearch）
- Elasticsearch的下载安装参阅
[Elasticsearch 实战(三) - Mac OS上安装和启动Elasticserch, Kibana](https://blog.csdn.net/qq_33589510/article/details/103114676)

- Zipkin提供了很多的环境变量
![](https://img-blog.csdnimg.cn/20191216232909379.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
配置环境变量，即可把数据存入ES

```bash
STORAGE_TYPE=elasticsearch ES_HOSTS=localhost:9200 
java -jar zipkin.jar
```
![](https://img-blog.csdnimg.cn/2019121623370178.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

- [Zipkin其他环境变量](https://github.com/openzipkin/zipkin/tree/master/zipkin-server#environment-variables)

# 7 依赖关系图
- 一般情况下，是不会显示依赖图的
![](https://img-blog.csdnimg.cn/20191216234200981.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 对此，官方有给出说明
![](https://img-blog.csdnimg.cn/20191216234254361.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 使用了ES就需要使用zipkin-dependencies![](https://img-blog.csdnimg.cn/20191216234439270.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- Zipkin Dependencies使用Elasticsearch的环境变量![](https://img-blog.csdnimg.cn/2019121623404031.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 开始下载

```bash
curl -sSL https://zipkin.io/quickstart.sh 
| bash -s io.zipkin.dependencies:zipkin-dependencies:LATEST zipkin-dependencies.jar
```
- 启动

```bash
STORAGE_TYPE=elasticsearch ES_HOSTS=localhost:9200 java -jar zipkin-dependencies.jar
```
![](https://img-blog.csdnimg.cn/201912162348041.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 现在就展示依赖图了！实际可以配置定时任务![](https://img-blog.csdnimg.cn/20191216234910536.png)
## Zipkin Dependencies指定分析日期

```bash
#分析昨天的数据 (OS/X下的命令)
STORAGE_ TYPE=elasticsearch java -jar zipkin-dependencies.jar
`date -uv-ld +%F`

#分析昨天的数据 (Linux下的命令)
STORAGE_ TYPE=elasticsearch java -jar zipkin-dependencies.jar
`date -u -d '1 day ago' +%F`

#分析指定日期的数据
STORAGE TYPE=elasticsearch java -jar zipkin-dependencies.jar 2019-12-25
```