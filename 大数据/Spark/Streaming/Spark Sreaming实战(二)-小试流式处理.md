# 1 业务分析
## 1.1 需求
统计主站每个(指定)教程访问的客户端、地域信息分布

地域: ip转换 Spark SQL项目实战
客户端:useragent获取 Hadoop基础教程

=》如上两个操作:采用离线(Spark/MapReduce )的方式进行统计
## 1.2 实现步骤
课程编号、ip信息、useragent
进行相应的统计分析操作: MapReduce/Spark

## 1.3 项目架构
日志收集: Flume
离线分析: MapReduce/Spark
统计结果图形化展示

看起来很简单，没什么高深的，但是现在需求改了嘛，很正常的骚操作对不对！
现在要求实时的精度大幅度提高！那么现在的架构已经无法满足需求了！
### 1.3.1 问题
小时级别
10分钟
5分钟
1分钟
秒级别
根本达不到精度要求！

# 实时流处理，应运而生！

# 2 实时流处理产生背景
◆ 时效性高
◆ 数据量大

◆ 实时流处理架构与技术选型
# 3 实时流处理概述
- 实时计算：响应时间比较短。
- 流式计算：数据不断的进入，不停顿。
- 实时流式计算：在不断产生的数据流上，进行实时计算

# 4 离线计算与实时计算对比
## 4.1 数据来源
离线：HDFS历史数据，数据量较大。
实时：消息队列（Kafka），实时新增/修改记录实时过来的某一笔数据。

## 4.2 处理过程
离线：Map + Reduce
实时：Spark(DStream/SS)

## 4.3 处理速度
离线：速度慢
实时：快速拿到结果


## 4.4 进程角度
离线：启动 + 销毁进程
实时： 7 * 24小时进行统计，线程不停止

# 5 实时流处理架构与技术选型
![](https://img-blog.csdnimg.cn/20190522010115726.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- Flume实时收集WebServer产生的日志
- 添加Kafka消息队列，进行流量消峰，防止Spark/Storm崩掉
- 处理完数据，持久化到RDBMS/NoSQL
- 最后进行可视化展示

Kafka、Flume一起搭配更舒服哦~

# 6 实时流处理在企业中的应用
- 电信行业：推荐流量包
- 电商行业：推荐系统算法
# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)

## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)

## [Github](https://github.com/Wasabi1234)
