# 1 概述
# 2 单体应用
一个归档包(例如war包)包含所有功能的应用程序,我们通常称为单体应用。而架构单体应用的方法论就是单体应用架构。
- 架构图
![](https://img-blog.csdnimg.cn/20190918010552283.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
## 2.1 单体架构的优点
- 架构简单
- 开发、测试、部署方便

## 2.2 单体架构的缺点
- 复杂性高
- 部署慢,频率低
- 扩展能力受限
- 阻碍技术创新
# 3 微服务
一词最早来自于Martin Fowler的一篇[微服务文章](https://martinfowler.com/articles/microservices.html)
![](https://img-blog.csdnimg.cn/20190918011511609.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 翻译
微服务架构风格是一种将一个单一应用程序开发为`一组小型服务`的方法，每个服务运行在`自己的进程`中，服务间通信采用`轻量级通信机制`(通常用HTTP资源
API)。这些服务`围绕业务能力构建`并且可通过全自动部署机制独立部署。这些服务共用一个`最小型的集中式的管理`，服务可用`不同的语言开发`，使用`不同的数据存储技术`

## 3.1 特性
- 每个微服务可独立运行在自己的进程里
- 一系列独立，运行的微服务共同构建起整个系统
- 每个服务为独立的业务开发,一个微服务只关注某个特定的功能,例如订单管理、用户管理等
- 可使用不同的语言与数据存储技术(契合项目情
况和团队实力)
- 微服务之间通过轻量的通信机制进行通信,例如通过REST API进行调用;
- 全自动的部署机制

## 3.2 全景架构图
![](https://img-blog.csdnimg.cn/20190918012706755.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 3.3 优点
- 单个服务更易于开发、维护
- 单个微服务启动较快
- 局部修改容易部署
- 技术栈不受限
- 按需伸缩

## 3.4 缺点
- 运维要求高
- 分布式固有的复杂性
- 重复劳动

## 3.5 适用场景
- 大型、复杂的项目
- 有快速迭代的需求
- 访问压力大
## 3.6 不适用场景
 - 业务稳定
 - 迭代周期长
# 4 微服务拆分
## 4.1 拆法
◆ 领域驱动设计( Domain Driven Design )
◆ 面向对象 ( by name./ by verb. )
## 4.2 最佳实践
◆ 职责划分
◆ 通用性划分
## 4.3 粒度合理
◆ 良好地满足业务
◆ 幸福感
◆ 增量迭代
◆ 持续演进
- 拆分
![](https://img-blog.csdnimg.cn/20190919000515857.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 项目架构图
 ![](https://img-blog.csdnimg.cn/20190919000634696.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 5 数据库设计
## 5.1 数据表


![](https://img-blog.csdnimg.cn/20190920010842793.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)






![](https://img-blog.csdnimg.cn/20190920011208258.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190920011250860.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 6 创建小程序
![](https://img-blog.csdnimg.cn/20190920012606456.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190920013614996.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/201909200136399.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190920013727185.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70) 
# 7 前端代码 - JavaEdge-miniapp
## 7.1  安装Node.js
**建议和笔者保持一致**
* 前往 <https://nodejs.org/en/download/> 下载Node.js。
*  建议使用 <https://nodejs.org/dist/v8.15.0/node-v8.15.0.pkg> 下载  。
* 安装说明
  * macOS操作系统，用pkg直接拖动安装即可
  ![](https://img-blog.csdnimg.cn/20190925012531172.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)


## 7.2 修改app信息
修改 `project.config.json` ，按需修改如下两行

```yaml
"appid": "修改为你的appid"
"projectname": "修改为你的项目名称，尽量用英文",
```
![](https://img-blog.csdnimg.cn/2019092501134367.png)
![](https://img-blog.csdnimg.cn/20190925011444863.png)
其中，appid在 [微信公众平台](https://mp.weixin.qq.com/) - 开发 - 开发设置中可以找到。

## 7.3 安装 & 启动
### 安装项目相关依赖 加速!
```shell
npm --registry https://registry.npm.taobao.org install
```
![](https://img-blog.csdnimg.cn/20190925013206878.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
### 开发环境启动部署
```shell
npm run dev
```
![](https://img-blog.csdnimg.cn/2019092501335558.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
### 生产环境构建
```shell
npm run build
```

## 7.4 下载 & 安装微信开发者工具
* 前往 <https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html> 下载开发者工具。
![](https://img-blog.csdnimg.cn/20190925012151820.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
* 安装开发者工具
双击安装即可!

## 7.5 修改调用API地址

找到`src/utils/api.js` ，找到

```shell
// 后端接口基础路径
export const BASE_API_URL = '';
```

将其修改为你的后端地址，例如：

```shell
export const BASE_API_URL = 'http://localhost:8080';
```

## 7.6  将代码导入到开发者工具

注意：**务必勾选 `不校验合法域名...` 。**

![](https://img-blog.csdnimg.cn/20190925014122900.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190925014521709.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 8 创建项目
## 8.1 技术选型
- Spring Boot ( 快速迭代开发 )
- Spring MVC ( MVC框架 )
Mybatis ( 持久层框架,操作数据库 ) +通用Mapper
- Spring Cloud Aliababa ( 分布式 )

- 参考
* [mpvue](https://github.com/Meituan-Dianping/mpvue)
* [vant-weapp](https://github.com/youzan/vant-weapp)
http://mpvue.com/build/