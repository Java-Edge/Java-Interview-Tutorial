# Ribbon是什么?
Netflix开源的客户端侧负载均衡器

- 可以简化如下代码![](https://img-blog.csdnimg.cn/20191023233351917.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 简化后
![](https://img-blog.csdnimg.cn/20191023233804153.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 架构演进
![](https://img-blog.csdnimg.cn/20191023233425236.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# Ribbon的组成
![](https://img-blog.csdnimg.cn/20191023233911903.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# Ribbon内置的负载均衡规则
![](https://img-blog.csdnimg.cn/20191023234220719.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 细粒度配置自定义
## Java代码配置
- 代码
![](https://img-blog.csdnimg.cn/20191024005309647.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 与启动类非同目录下建立, 即, 单独为该类建立一个包
![](https://img-blog.csdnimg.cn/20191023235029790.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 该类有一个config注解![](https://img-blog.csdnimg.cn/2019102323522599.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 而config注解又有conp注解
![](https://img-blog.csdnimg.cn/20191023235455499.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
即config注解也是一种特殊的comp

- 而启动类的注解
![](https://img-blog.csdnimg.cn/20191023235628759.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 又包含以下注解,用来扫描comp注解,即默认会扫描启动类所在包所有的comp注解
![](https://img-blog.csdnimg.cn/20191023235707191.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

因为sb扫描的是主上下文,而ribbon也有一个上下文(子上下文)
- 具体原因推荐阅读
[Spring+SpringMVC 配置事务管理无效原因及解决方案。](https://blog.csdn.net/qq_32588349/article/details/52097943)
所以父子上下文不能重叠!!!

- 官方文档告警原文![](https://img-blog.csdnimg.cn/20191024000640727.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
如果你把它放在了和启动类同目录下, 那么内容中心不管是调用用户中心还是微服务A都会调用该规则,成了全局的配置了,就不是粒度了
## 用配置属性配置
简单而且无坑!
![](https://img-blog.csdnimg.cn/20191024001118311.png)
## 代码配置方式 VS 属性配置方式

![](https://img-blog.csdnimg.cn/20191024001226255.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 最佳实践
◆ 尽量使用属性配置，属性方式实现不了的情况下再考虑用代码配置
◆ 在同一个微服务内**尽量保持单一性**,比如统一使用属性配置,不要两种方式混用,增加定位代码的复杂性

# 全局配置
通过前面细粒度可知
## 方式一 : 让EComponentScan上下交重叠
强烈不建议使用

## 方式二 : 唯一正确的途径
- @RibbonClients(defaultConfiguration= xxx.class)
![](https://img-blog.csdnimg.cn/20191024005343286.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 支持的配置项
- 前面的配置表格举例
![](https://img-blog.csdnimg.cn/20191024005522423.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 配置属性方式
`<clientName>. ribbon.` 如下属性:
● NFLoadBal ancerClassName: ILoadBalancer 实现类
● NFLoadBalancerRuleClassName: IRule 买现类
● NFLoadBalancerP ingClassName: IPing 实现类
● NIWSServerListClassName: ServerList 实现类
● NIWSServerListFil terClassName : ServerListFilter 实现类

# 饥饿加载
默认服务都是懒加载的, 当以下代码第一次被调用时,才会创建一个名为user-center的ribbon client,会导致localhost8080/shares/1首次请求过慢的问题
![](https://img-blog.csdnimg.cn/2019102400582034.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
因此在content-center改为饥饿加载方式
![](https://img-blog.csdnimg.cn/20191024010601244.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 
![](https://img-blog.csdnimg.cn/20191024010721592.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191024010706340.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
站在巨人肩膀,实现负载均衡算法
![](https://img-blog.csdnimg.cn/20191024130757881.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

既然NACOs已经内置了负载均衡算法,SCA为何还要整合ribbbon呢?直接用NACOS不就ok了吗
主要为了符合SC的标准
SC的子项目spring cloud commons --> 定义了标准
SCC的子项目 spring cloud loadbalancer --> 没有权重,所以SCA遵循标准整合了ribbon
- 推荐阅读
[扩展Ribbon支持Nacos权重的三种方式](https://www.imooc.com/article/288660)

# 扩展Ribbon - 同集群优先调用
- nacos 集群
![](https://img-blog.csdnimg.cn/20191025125151875.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 新建类

- 配置文件
![](https://img-blog.csdnimg.cn/20191025125512554.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 追踪源码
![](https://img-blog.csdnimg.cn/20191025130235733.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191025130411478.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 一直到这里
![](https://img-blog.csdnimg.cn/20191025130529818.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 给一个list,返回一个host实例,
![](https://img-blog.csdnimg.cn/20191025130702747.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 但是该方法protected,所以需要继承实现!
![](https://img-blog.csdnimg.cn/201910251308474.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 加到ribbon的全局配置中去
![](https://img-blog.csdnimg.cn/20191025131200653.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 基于元数据的版本控制
至此已实现
- 优先调用同集群下的实例
- 基于权重的负载均衡

但可能还会有这样的需求：

## `一个微服务在线上可能多版本共存`
例如：
- 服务提供者有两个版本：v1、v2
- 服务消费者也有两个版本：v1、v2

v1/v2是不兼容的
服务消费者v1只能调用服务提供者v1
消费者v2只能调用提供者v2

如何实现呢？

下面围绕该场景，实现微服务之间的版本控制。

## 元数据
元数据就是一堆的描述信息，以map存储
例如:

```bash
spring:
  cloud:
    nacos:
        metadata: 
          # 自己这个实例的版本
          version: v1
          # 允许调用的提供者版本
          target-version: v1
```

## 需求分析
我们需要实现的有两点：
- 优先选择同集群下，符合metadata的实例
- 如果同集群下没有符合metadata的实例，就选择所有集群下，符合metadata的实例

## 实战

```java
@Slf4j
public class NacosFinalRule extends AbstractLoadBalancerRule {
    @Autowired
    private NacosDiscoveryProperties nacosDiscoveryProperties;

    @Override
    public Server choose(Object key) {
        // 负载均衡规则：优先选择同集群下，符合metadata的实例
        // 如果没有，就选择所有集群下，符合metadata的实例

        // 1. 查询所有实例 A
        // 2. 筛选元数据匹配的实例 B
        // 3. 筛选出同cluster下元数据匹配的实例 C
        // 4. 如果C为空，就用B
        // 5. 随机选择实例
        try {
            String clusterName = this.nacosDiscoveryProperties.getClusterName();
            String targetVersion = this.nacosDiscoveryProperties.getMetadata().get("target-version");

            DynamicServerListLoadBalancer loadBalancer = (DynamicServerListLoadBalancer) getLoadBalancer();
            String name = loadBalancer.getName();

            NamingService namingService = this.nacosDiscoveryProperties.namingServiceInstance();

            // 所有实例
            List<Instance> instances = namingService.selectInstances(name, true);

            List<Instance> metadataMatchInstances = instances;
            // 如果配置了版本映射，那么只调用元数据匹配的实例
            if (StringUtils.isNotBlank(targetVersion)) {
                metadataMatchInstances = instances.stream()
                        .filter(instance -> Objects.equals(targetVersion, instance.getMetadata().get("version")))
                        .collect(Collectors.toList());
                if (CollectionUtils.isEmpty(metadataMatchInstances)) {
                    log.warn("未找到元数据匹配的目标实例！请检查配置。targetVersion = {}, instance = {}", targetVersion, instances);
                    return null;
                }
            }

            List<Instance> clusterMetadataMatchInstances = metadataMatchInstances;
            // 如果配置了集群名称，需筛选同集群下元数据匹配的实例
            if (StringUtils.isNotBlank(clusterName)) {
                clusterMetadataMatchInstances = metadataMatchInstances.stream()
                        .filter(instance -> Objects.equals(clusterName, instance.getClusterName()))
                        .collect(Collectors.toList());
                if (CollectionUtils.isEmpty(clusterMetadataMatchInstances)) {
                    clusterMetadataMatchInstances = metadataMatchInstances;
                    log.warn("发生跨集群调用。clusterName = {}, targetVersion = {}, clusterMetadataMatchInstances = {}", clusterName, targetVersion, clusterMetadataMatchInstances);
                }
            }

            Instance instance = ExtendBalancer.getHostByRandomWeight2(clusterMetadataMatchInstances);
            return new NacosServer(instance);
        } catch (Exception e) {
            log.warn("发生异常", e);
            return null;
        }
    }

    @Override
    public void initWithNiwsConfig(IClientConfig iClientConfig) {
    }
}
```

负载均衡算法：

```java
public class ExtendBalancer extends Balancer {
    /**
     * 根据权重，随机选择实例
     *
     * @param instances 实例列表
     * @return 选择的实例
     */
    public static Instance getHostByRandomWeight2(List<Instance> instances) {
        return getHostByRandomWeight(instances);
    }
}
```

#  深入理解Nacos的Namespace

# 现有架构存在的问题
![](https://img-blog.csdnimg.cn/20191025202922102.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)