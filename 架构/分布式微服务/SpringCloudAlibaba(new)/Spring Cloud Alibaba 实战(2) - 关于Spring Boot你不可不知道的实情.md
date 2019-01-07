# 0 [相关源码](https://github.com/Wasabi1234/spring-boot-demo)

# 1 什么是Spring Boot
#### 一个快速开发的脚手架
## 作用
快速创建独立的、生产级的基于Spring的应用程序

## 特性
- 无需部署WAR文件
- 提供starter简化配置
- 尽可能自动配置Spring以及第三方库
- 提供“生产就绪”功能,例如指标、健康检查、外部配置等
- 无代码生成&无XML

# 2  编写一个Spring Boot应用
## 2.1 需求
- 整合Spring MVC
- /test路径(端点)

## 2.2 使用Spring Initializr快速创建Spring Boot应用
![](https://img-blog.csdnimg.cn/20190915224518162.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/2019091522465518.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190915224815715.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190915224857320.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 编写测试代码
![](https://img-blog.csdnimg.cn/20190916230109746.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 运行输出![](https://img-blog.csdnimg.cn/20190916225949364.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

也可以使用
- mvn clean install确保打包成功
![](https://img-blog.csdnimg.cn/20190916230626259.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- java -jar 运行程序
![](https://img-blog.csdnimg.cn/2019091623075122.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 3 组成分析
- pom.xml
![](https://img-blog.csdnimg.cn/20190915230543265.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 配置文件
![](https://img-blog.csdnimg.cn/20190916231327244.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- static目录
存放静态文件
- template目录
存放模板文件,已过时

# 4 开发利器
## 添加依赖
- pom.xml中的依赖实例
![](https://img-blog.csdnimg.cn/20190916232115980.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- [官方支持依赖列表](https://docs.spring.io/spring-boot/docs/2.1.8.RELEASE/reference/html/using-boot-build-systems.html#using-boot-starter)
![](https://img-blog.csdnimg.cn/2019091623203064.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 写注解
![](https://img-blog.csdnimg.cn/20190916232246747.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 写配置
![](https://img-blog.csdnimg.cn/20190916232311912.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 5 Spring Boot Actuator
## 什么是Spring Boot Actuator

## 整合
- 添加依赖
![](https://img-blog.csdnimg.cn/20190916234856333.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 启动应用
![](https://img-blog.csdnimg.cn/2019091623500231.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- [打开链接](http://localhost:8080/actuator)
![](https://img-blog.csdnimg.cn/20190916235411576.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190917001217324.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 健康信息
健康信息可以检查应用的运行状态，它经常被监控软件用来提醒人们生产环境是否存在问题。health端点暴露的默认信息取决于端点是如何被访问的。对于一个非安全，未认证的连接只返回一个简单的'status'信息。对于一个安全或认证过的连接其他详细信息也会展示
Spring Boot包含很多自动配置的HealthIndicators，你也可以写自己的。

### 自动配置的HealthIndicators
Spring Boot在合适的时候会自动配置以下HealthIndicators：
![](https://img-blog.csdnimg.cn/20190917002830278.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 下表显示了内置状态的默认状态映射：
![](https://img-blog.csdnimg.cn/20190917003004321.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 让我们配置一下health节点,并重启应用
![](https://img-blog.csdnimg.cn/20190917001814832.png)
- 可看到对于磁盘的监控信息
![](https://img-blog.csdnimg.cn/20190917001849686.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 应用信息
应用信息会暴露所有InfoContributor beans收集的各种信息，Spring Boot包含很多自动配置的InfoContributors，你也可以编写自己的实现。
### 自动配置的InfoContributors
Spring Boot会在合适的时候自动配置以下InfoContributors：
![](https://img-blog.csdnimg.cn/20190917003252246.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

> 注 使用management.info.defaults.enabled属性可禁用以上所有InfoContributors。

### 自定义应用info信息
通过设置Spring属性info.*，你可以定义info端点暴露的数据。所有在info关键字下的Environment属性都将被自动暴露，例如，你可以将以下配置添加到application.properties：
```
info.app.encoding=UTF-8
info.app.java.source=1.8
info.app.java.target=1.8
```
注 你可以在构建时扩展info属性，而不是硬编码这些值。假设使用Maven，你可以按以下配置重写示例：
```
info.app.encoding=@project.build.sourceEncoding@
info.app.java.source=@java.version@
info.app.java.target=@java.version@
```
### Git提交信息
info端点的另一个有用特性是，在项目构建完成后发布git源码仓库的状态信息。如果GitProperties bean可用，Spring Boot将暴露git.branch，git.commit.id和git.commit.time属性。

> 注 如果classpath根目录存在git.properties文件，Spring Boot将自动配置GitProperties bean。查看Generate git information获取更多详细信息。

使用management.info.git.mode属性可展示全部git信息（比如git.properties全部内容）：
```
management.info.git.mode=full
```
### 构建信息
如果BuildProperties bean存在，info端点也会发布你的构建信息。

注 如果classpath下存在META-INF/build-info.properties文件，Spring Boot将自动构建BuildProperties bean。Maven和Gradle都能产生该文件

- 配置info
![](https://img-blog.csdnimg.cn/20190917003634110.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 启动观察输出信息![](https://img-blog.csdnimg.cn/20190917003721284.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- SpringBoot支持很多端点,除了默认显示的几个,还可以激活暴露所有端点
![](https://img-blog.csdnimg.cn/20190917004116115.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190917004052711.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 如果只想暴露某个端点也是可以的
![](https://img-blog.csdnimg.cn/2019091700435537.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 查看JVM最大内存
![](https://img-blog.csdnimg.cn/20190917004447618.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)


# 6 Spring Boot配置管理
##  yml配置
- 注意缩进同一与冒号左右的空格
![](https://img-blog.csdnimg.cn/20190917005043710.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 注意与properties文件的不同
![](https://img-blog.csdnimg.cn/20190917005217589.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)


## 配置管理的各种姿势
![](https://img-blog.csdnimg.cn/20190917005505319.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
### 配置管理常用方式
- 配置文件
- 环境变量
- 外部配置文件
会读取和jar文件相同路径下的配置文件,且优先级高于jar配置
- 命令行参数

> 尽量保持配置最简单且统一,规避优先级冲突问题!

# 7  Profile
## 不同环境不同配置

## 使用
- yml配置文件
![](https://img-blog.csdnimg.cn/20190918001149455.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190918001242792.png)
- 添加参数并启动程序
![](https://img-blog.csdnimg.cn/20190918001315885.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 查看端点以确认信息
![](https://img-blog.csdnimg.cn/20190918001637603.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 那么如果不指定参数呢,又运行的何种环境呢,让我们来看一下:
![](https://img-blog.csdnimg.cn/20190918001833546.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 默认是default,难道我非要将dev环境改为default才可以使用默认配置?显然SpringBoot另辟蹊径:
![](https://img-blog.csdnimg.cn/20190918002043518.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190918002139308.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

如果不是yml文件,而是用properties配置呢

![](https://img-blog.csdnimg.cn/20190918002537331.png)
![](https://img-blog.csdnimg.cn/20190918002558361.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 指定参数
![](https://img-blog.csdnimg.cn/20190918002624145.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190918002653576.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 默认dev
![](https://img-blog.csdnimg.cn/20190918002755192.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 注意先将启动参数prod关闭,避免配置优先级冲突!
![](https://img-blog.csdnimg.cn/20190918002917164.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
# 8 总结
- 使用Spring Initializr快速创建应用
- 应用组成分析
- 开发三部曲
- Actuator
- 配置管理
- Profile

# 参考
[Spring Boot官方文档](https://docs.spring.io/spring-boot/docs/2.1.8.RELEASE/reference/html)