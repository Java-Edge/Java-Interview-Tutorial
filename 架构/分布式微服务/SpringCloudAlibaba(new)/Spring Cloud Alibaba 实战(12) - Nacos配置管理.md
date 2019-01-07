该技术类似Spring Cloud Config。

# 1 配置管理的意义
## 现实的痛点
- 不同环境，不同配置
- 配置属性动态刷新

为解决痛点，常用方案是引入配置服务器，架构如下
![](https://img-blog.csdnimg.cn/20191215221554158.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 引入依赖
![](https://img-blog.csdnimg.cn/20191215221821994.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 写配置(约定大于配置)，要谨遵如下映射关系图哦
![](https://img-blog.csdnimg.cn/20191215222031784.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 创建新的bootstrap.yml配置文件
![](https://img-blog.csdnimg.cn/20191215222158954.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 在NACOS操作面板配置
![](https://img-blog.csdnimg.cn/20191215222601454.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/2019121522261920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 启动内容中心
![](https://img-blog.csdnimg.cn/20191215222843437.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 2 配置的动态刷新
修改配置后，应用可动态刷新配置，而无需重启应用
- 添加 **@RefreshScope** 注解即可
![](https://img-blog.csdnimg.cn/20191215223346781.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 回滚Bug
不要回滚到初始状态! Nacos 至今未解决。
- https://github.com/alibaba/nacos/issues/186
![](https://img-blog.csdnimg.cn/2019121522510516.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- https://qithub.com/alibaba/nacos/issues/434
![](https://img-blog.csdnimg.cn/20191215225151357.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

既然迟迟不修复，我们只能尽量避免使用历史版本，而直接修改配置。

# 3  共享配置
## 3.1 相同应用内

```bash
所指定的 > 通用的
```

## 3.2 不同应用间
- 比如这段配置在用户/内容中心都有，可以将其交给nacos管理共享配置
![](https://img-blog.csdnimg.cn/201912152258123.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

下面看NACOS配置共享的两种方案：
### shared-detaids
![](https://img-blog.csdnimg.cn/20191215230042683.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
### ext-config
![](https://img-blog.csdnimg.cn/20191215230201384.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
### 优先级
```bash
shared-dataids < ext-config < 自动
```

# 4 引导上下文
## 4.1 用来连接配置服务器,读取外部配置
bootstrap.yml就是引导上下文的配置文件。对于应用，就是来连接Nacos以读取Nacos中的配置。
## 4.2  Application Context的父上下文
远程配置(Nacos) & 本地配置优先级
默认情况下,远程配置优先级较高哦
- 如下的配置文件必须放在远程配置中才生效
![](https://img-blog.csdnimg.cn/20191215230727734.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 5 数据持久化
## 5.1 作为服务发现组件
其数据都是存在本地路径:

```bash
~/nacos/naming/public
```
![](https://img-blog.csdnimg.cn/2019121523504728.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191215235208474.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
## 5.2 作为配置服务器
数据分为如下两部分
### NACOS web ui中添加的配置数据: 
```bash
$NACOS_ HOME/data/derby-data
```
- 如果想查看其具体内容，必须停止nacos，然后连接Derby这个Apache开发的内嵌数据库，通过IDEA的数据源连接
![](https://img-blog.csdnimg.cn/20191215235547255.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191215235915619.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- 配置属性的快照
~/nacos/config

# 6 Nacos配置管理最佳实践
- 能放本地,不放远程
- 尽量规避优先级
- 定规范，例如所有配置属性都要加上注释
- 配置管理人员尽量少(官方正在开发权限控制)