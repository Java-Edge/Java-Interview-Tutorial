# 0 概要
- API网关权限验证和其他服务交互
- 开发Springboot的自定义配置
- Dubbo负载均衡策略选择和使用


- 用户表结构
![](https://img-blog.csdnimg.cn/2019090817232563.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 修改Guns的JWT
◆ 增加忽略验证URL配置
◆ 修改返回内容匹配业务
◆ 增加Threadlocal的用户信息保存

业务功能开发
◆增加用户服务并提供接口
初步了解AP|网关与服务之间交互的过程
根据接口文档开发用户接口 

# 用户服务与网关交互
- 添加user模块
![](https://img-blog.csdnimg.cn/20190908184346438.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 基于Springboot配置忽略列表
自动配置好jwt前缀配置内容
![](https://img-blog.csdnimg.cn/20190908195730510.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190908195800515.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 基于用户业务的API修改
![](https://img-blog.csdnimg.cn/20190908201551995.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190908201354612.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/2019090820143714.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190908201515144.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 修改JWT申请的返回报文
Threadlocal保存用户信息
JWT修改测试和总结
 用户模块-DAO层代码生成
# 用户模块
## 注册业务实现
![](https://img-blog.csdnimg.cn/20190912223309644.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 登陆和用户名验证实现
 ![](https://img-blog.csdnimg.cn/20190913004532607.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
 ![](https://img-blog.csdnimg.cn/20190913004507280.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 查询用户信息
 ![](https://img-blog.csdnimg.cn/20190913013739577.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 修改用户信息实现
![](https://img-blog.csdnimg.cn/20190913014248581.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 网关模块
## 注册功能实现
![](https://img-blog.csdnimg.cn/20190913015443546.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 网关模块-用户名检查和退出功能实现
 ![](https://img-blog.csdnimg.cn/20190913020156418.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190913020222167.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
 4-16 网关模块-用户信息相关功能实现
 ![](https://img-blog.csdnimg.cn/20190913024616532.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 业务功能测试
## 用户名验证接口测试
- 确保启动ZooKeeper
- 启动用户中心
![](https://img-blog.csdnimg.cn/20190913025633731.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 启动gateway
![](https://img-blog.csdnimg.cn/20190913025834895.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 用户表已有数据行
![](https://img-blog.csdnimg.cn/20190913033053570.png)
- 测试用例
![](https://img-blog.csdnimg.cn/20190913033210357.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190913033302702.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 用户注册接口测试

![](https://img-blog.csdnimg.cn/20190913034343197.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190913034521146.png)

#  Dubbo特性
◆ 必须先启动服务提供者，否则会报错
## 启动检查 TODO
服务启动过程中验证服务提供者的可用性
验证过程出现问题，则阻止整个Spring容器初始化
服务启动检查可以尽可能早的发现服务问题

◆ 如果我们将用户模块部署多台，消费者会如何访问
## 负载均衡
 ![](https://img-blog.csdnimg.cn/20190914022734946.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190914023906657.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 多协议支持
Dubbo支持多种协议,最常见的协议是dubbo
- 项目应用
![](https://img-blog.csdnimg.cn/20190914024516841.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

也支持 RMI、Hessian、 HTTP、 Redis、 Memcached等多种协议 
![](https://img-blog.csdnimg.cn/20190914024552573.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)