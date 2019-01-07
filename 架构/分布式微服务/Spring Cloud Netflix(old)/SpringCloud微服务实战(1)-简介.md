微服务是一种架构风格：
- 一系列微小的服务共同组成
- 跑在自己的进程
- 每个服务为独立的业务开发
- 独立部署
- 分布式的管理

# 1 微服务架构简介
## 1.1 起点和终点
- 起点
既有架构的形态
- 终点
好的架构不是设计出来的，而是进化而来的，一直在演进ing

**单一应用架构=》垂直应用架构=》分布式服务架构=》流动计算架构**
![](https://img-blog.csdnimg.cn/20201208204147756.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 1.2 需考虑因素
什么不适合微服务？
- 系统中包含很多很多强事务场景
- 业务相对稳定，迭代周期长
- 访问压力不大，可用性要求不高

## 1.3 原则
### 沟通的问题会影响系统设计（康威定律）
Organizations which design systems are constrained toproduce designs which are copies of the communication structures of these organizations.
任何组织在设计一套系统(广义概念上的系统)时，所交付的设计方案在结构上都与该组织的沟通结构保持一致。
### 围绕业务构建团队
> Any organization that designs a system (defined broadly) will produce a design whose structure is a copy of the organization's communication structure.
设计系统的架构受制于产生这些设计的组织的沟通结构。产品必然是其(人员)组织沟通结构的缩影。
跨部门沟通是非常难的，系统各个模块的接口也反映了它们之间的信息流动和合作方式。

- 单体
![](https://img-blog.csdnimg.cn/20210129162603737.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 微服务![](https://img-blog.csdnimg.cn/20210129162645832.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
### 去中心化的数据管理
![](https://img-blog.csdnimg.cn/20210129180758372.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)