[相关代码](https://github.com/Wasabi1234/Spring-Cloud-Alibaba-in-Acrion-ContentCenter)

# 1 拉（pull）模式
## 1.1 架构设计
该模式的数据源（如本地文件、RDBMS 等）一般可写入。使用时需在客户端注册数据源：将对应读数据源注册至对应的 `RuleManager`，将写数据源注册至 `transport` 的 `WritableDataSourceRegistry` 中。

以本地文件数据源为例：

```java
public class FileDataSourceInit implements InitFunc {

    @Override
    public void init() throws Exception {
        String flowRulePath = "xxx";

        ReadableDataSource<String, List<FlowRule>> ds = new FileRefreshableDataSource<>(
            flowRulePath, source -> JSON.parseObject(source, new TypeReference<List<FlowRule>>() {})
        );
        // 将可读数据源注册至 FlowRuleManager.
        FlowRuleManager.register2Property(ds.getProperty());

        WritableDataSource<List<FlowRule>> wds = new FileWritableDataSource<>(flowRulePath, this::encodeJson);
        // 将可写数据源注册至 transport 模块的 WritableDataSourceRegistry 中.
        // 这样收到控制台推送的规则时，Sentinel 会先更新到内存，然后将规则写入到文件中.
        WritableDataSourceRegistry.registerFlowDataSource(wds);
    }

    private <T> String encodeJson(T t) {
        return JSON.toJSONString(t);
    }
}
```

本地文件数据源会定时轮询文件的变更，读取规则。这样我们既可以在应用本地直接修改文件来更新规则，也可以通过 Sentinel 控制台推送规则。以本地文件数据源为例，推送过程如下图所示：
![](https://img-blog.csdnimg.cn/20201008180526659.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

## 1.2 执行流程
- `FileRefreshableDataSource` 定时从指定文件中读取规则JSON文件【上图：本地文件】，如果发现文件发生变化，就更新规则缓存。
- `FileWritableDataSource` 接收控制台规则推送，并根据配置，修改规则JSON文件【图中的本地文件】。

##  1.3 代码实战
### 1.3.1 添加依赖

```xml
<dependency>
  <groupId>com.alibaba.csp</groupId>
  <artifactId>sentinel-datasource-extension</artifactId>
</dependency>
```
### 1.3.2 Java代码
![](https://img-blog.csdnimg.cn/20191205011656174.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
### 1.3.3 配置
在项目的 `resources/META-INF/services` 目录下创建文件
命名为：`com.alibaba.csp.sentinel.init.InitFunc` ![](https://img-blog.csdnimg.cn/20191205011807245.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

## 1.4 优缺点分析
- 优点
	- 简单
	- 不会引入新的依赖
- 缺点，无法保证监控数据的一致性：
	- 由于规则是用 `FileRefreshableDataSource` 定时更新，所以规则更新会有延迟。如果`FileRefreshableDataSource`定时时间过大，可能长时间延迟；如果`FileRefreshableDataSource`过小，又会影响性能
	- 规则存储在本地文件，如果有一天需要迁移微服务，那么需要把规则文件一起迁移，否则规则会丢失。

# 2 推（Push）模式
## 2.1 架构设计
**生产环境下更常用 push 模式的数据源**。
对于 push 模式的数据源，如远程配置中心（ZooKeeper, Nacos, Apollo等），推送操作不应由 Sentinel 客户端进行，而应该经控制台统一管理，直接推送。
**数据源仅负责获取配置中心推送的配置并更新到本地**。因此推送规则正确做法应该是 
`配置中心控制台/Sentinel 控制台 → 配置中心 → Sentinel 数据源 → Sentinel`，
而非经 Sentinel 数据源推至配置中心。

所以可得如下设计：
![](https://img-blog.csdnimg.cn/2020100819181370.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

- 官方提供了 ZooKeeper, Apollo, Nacos 等的动态数据源实现。
![](https://img-blog.csdnimg.cn/20201008192530949.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

以 `ZooKeeper` 为例，若使用第三方配置中心作为配置管理，需做如下事项：
1. 实现一个公共的 `ZooKeeper` 客户端用于推送规则，在 Sentinel 控制台配置项中需要指定 ZooKeeper 的地址，启动时即创建 ZooKeeper Client
2. 针对每个应用（appName），每种规则设置不同的 path（可随时修改）；或者约定大于配置（如 path 的模式统一为 `/sentinel_rules/{appName}/{ruleType}`，e.g. `sentinel_rules/appA/flowRule`）
3. 规则配置页需要进行相应的改造，直接针对**应用维度**进行规则配置；修改同个应用多个资源的规则时可以批量进行推送，也可以分别推送。Sentinel 控制台将规则缓存在内存中（如 InMemFlowRuleStore），可以对其进行改造使其支持应用维度的规则缓存（key 为 appName），每次添加/修改/删除规则都先更新内存中的规则缓存，然后需要推送的时候从规则缓存中获取全量规则，然后通过上面实现的 Client 将规则推送到 ZooKeeper 即可
4. 应用客户端需要注册对应的读数据源以监听变更
从 Sentinel 1.4.0 开始，Sentinel 控制台提供 DynamicRulePublisher 和 DynamicRuleProvider 接口用于实现应用维度的规则推送和拉取，并提供了相关的示例。Sentinel 提供应用维度规则推送的示例页面（/v2/flow），用户改造控制台对接配置中心后可直接通过 v2 页面推送规则至配置中心。


部署多个控制台实例时，通常需要将规则存至 DB 中，规则变更后同步向配置中心推送规则。

## 2.2 执行流程
### 控制台推送规则
- 将规则推送到Nacos或其他远程配置中心
- Sentinel客户端链接Nacos，获取规则配置；并监听Nacos配置变化，如发生变化，就更新本地缓存（从而让本地缓存总是和Nacos一致）

控制台监听Nacos配置变化，如发生变化就更新本地缓存（从而让控制台本地缓存总是和Nacos一致）

##  2.3 代码实战
### 2.3.1 添加依赖

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-nacos</artifactId>
</dependency>
```
### 修改配置

```yml
spring:
  cloud:
    sentinel:
      datasource:
        # 名称随意
        flow:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-flow-rules
            groupId: SENTINEL_GROUP
            # 规则类型，取值见：
            # org.springframework.cloud.alibaba.sentinel.datasource.RuleType
            rule-type: flow
        degrade:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-degrade-rules
            groupId: SENTINEL_GROUP
            rule-type: degrade
        system:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-system-rules
            groupId: SENTINEL_GROUP
            rule-type: system
        authority:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-authority-rules
            groupId: SENTINEL_GROUP
            rule-type: authority
        param-flow:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-param-flow-rules
            groupId: SENTINEL_GROUP
            rule-type: param-flow
```
重启服务

# 生产环境使用Sentinel
◆ 推拉模式持久化规则
- 推模式更佳

◆ AHAS
- 开通地址
https://ahas.console.aliyun.com/
- 开通说明
https://help.aliyun.com/document detail/90323.html

参考

-  [在生产环境中使用-Sentinel](https://github.com/alibaba/Sentinel/wiki/%E5%9C%A8%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E4%B8%AD%E4%BD%BF%E7%94%A8-Sentinel)