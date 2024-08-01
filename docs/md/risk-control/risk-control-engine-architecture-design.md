# 05-风控引擎架构设计

## 1 架构师能力思维模型

- 全局思维
- 抽象思维

## 2 新需求的思考路径

需求是否合理，是否能解决问题？

能划分多少个子系统？

每个子系统能划分多少个模块？这个系统需要可靠性吗，需要扩展能力吗？成本需要控制吗？

表如何设计？API如何设计？模块之间如何通信？

## 3 风控引擎设计的核心点

架构会围绕核心点进行设计：

### 3.1 高效率的规则(策略)选代

风险规则可动态，自由组合的调整

#### 风险规则设计思路

- 风险规则可由多个基础规则(因子)组成
- 风险规则就是与(AND)或(OR)非(NOT)组合的逻辑运算
- 不同业务场景的风险规则也不同

都是多对多关系：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/3f7209ae6b84e4b1eaf715a94d6fd3be.png)

如

优惠券场景：

风险规则1：检测时间差（基础规则、因子） > 3h &&  用户活跃度 > 5（活跃系数）

> 其中的用户活跃度 > 5（活跃系数）就是指标计算。

注册场景：

风险规则1：手机号段非170 或 检测时间差 > 1h（输入的上下文参数）

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/7257fc27c9ed22e06e9cb6cd6d102463.png)

于是就能总结得出：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/05fb39012ab700975e414514bdee64eb.png)

### 3.2 充分的运营支撑

监控大屏 + 完善的运营后台。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/c548840ce906ac26d2179df70623ab96.png)

### 3.3 无缝对接不同业务线

统一SDK：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/e9595e912a3d350790e81749e01fc2e5.png)

### 3.4 事件接入中心

#### 为什么需要事件接入中心？

- 将所有的事件数据进行统一管理
- 从任意的数据源以流式传输大量的事件数据

不同的业务场景，包含不同的事件类型（evenType），事件接入中心是整个风控引擎的数据流入口。包含数据：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/2b09618bc7f135fc57973924f84ce88a.png)

### 3.5 风控服务稳定可靠

服务高可用+熔断降级。

因此，得到最终的

## 4 风控引擎的系统架构图

说一大段话，不如画一张图让人更加容易理解：

### 业务架构图



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/7c2ac4d29dc6f72b4514b80e5487702a.png)

### 应用架构图

需要划分出系统的层级，各个层级的应用服务

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/32c9cbbca002df1eeef28fe887d1b8b9.png)

### 数据架构图



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/3161e1a34fa0d4aa50a37e8d52e16adb.png)

### 技术架构图



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/58f5886d3f31a69cdc7353e6c108a98e.png)

