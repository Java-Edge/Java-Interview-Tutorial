我们一般使用`application.yml`实现Spring Boot应用参数配置。但Spring配置有优先级，实际开发中要避免重复配置项的覆盖，就必须清晰这个优先级。

Spring通过Environment抽象出：
- Profile
规定场景。定义诸如dev、test、prod等环境
- Property
PropertySources，各种配置源。一个环境中可能有多个配置源，每个配置源有许多配置项。查询配置信息时，按配置源优先级进行查询
![](https://img-blog.csdnimg.cn/2021051910232476.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

> Property是如何查询配置的？

首先看下配置的优先级：

```java
env.getPropertySources().stream()
	.forEach(System.out::println);
```
如下共九个配置源：
![](https://img-blog.csdnimg.cn/3b8888a22217457b8e04c0da90afe8e8.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)


- systemProperties
系统配置
- applicationConfig
配置文件，我们的 yml 文件配置。如 application.yml 和 bootstrap.yml，首先加载bootstrap.yml。
![](https://img-blog.csdnimg.cn/20210709155626321.png)


其中的**OriginAwareSystemEnvironmentPropertySource**就是我们的`application.yml`。

StandardEnvironment，继承自
# AbstractEnvironment
- MutablePropertySources#propertySources
所有的配置源
- getProperty
通过PropertySourcesPropertyResolver类进行查询配置
![](https://img-blog.csdnimg.cn/20210519120036370.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 实例化PropertySourcesPropertyResolver时，传入了当前的MutablePropertySources
![](https://img-blog.csdnimg.cn/20210519115930680.png)

那就来具体看看该类：
# MutablePropertySources
![](https://img-blog.csdnimg.cn/20210519120800958.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

# PropertySourcesPropertyResolver
构造器传入后面用来遍历的**propertySources**。
![](https://img-blog.csdnimg.cn/20210519130713181.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
结合**AbstractEnvironment**，这个**propertySources**就是**AbstractEnvironment#MutablePropertySources**。

遍历时，若发现配置源中有对应K的V，则使用该V。
所以**MutablePropertySources**中的配置源顺序很关键。
- 真正查询配置的方法
![](https://img-blog.csdnimg.cn/20210519130402101.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
在查询所有配置源时，NO.1的 **ConfigurationPropertySourcesPropertySource**并非一个实际存在的配置源，而是一个代理。debug 下查看到"user.name"的值是由它提供并返回，且没有再遍历后面的PropertySource看看有无"user.name"
![](https://img-blog.csdnimg.cn/2021051913313372.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
# ConfigurationPropertySourcesPropertySource
- getProperty()最终还调用findConfigurationProperty查询对应配置
![](https://img-blog.csdnimg.cn/20210516153002620.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

- 上图中**getSource**()结果就是**SpringConfigurationPropertySources**
![](https://img-blog.csdnimg.cn/20210515204232227.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 其中包含的配置源列表
![](https://img-blog.csdnimg.cn/20210515204514320.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
第一个就是ConfigurationPropertySourcesPropertySource，这遍历不会导致死循环吗？

注意到configurationProperty的实际配置是从系统属性来的。
![](https://img-blog.csdnimg.cn/20210515205923497.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

# SpringConfigurationPropertySources
![](https://img-blog.csdnimg.cn/20210515222936881.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
**ConfigurationPropertySourcesPropertySource**是所有配置源的NO.1，其早就知道了**PropertySourcesPropertyResolver**的遍历逻辑。

> 那知道遍历逻辑后，如何暗箱操作可以让自己成为南波湾配置源？

**ConfigurationPropertySourcesPropertySource**实例化时
![](https://img-blog.csdnimg.cn/20210515223624562.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)**ConfigurationPropertySourcesPropertySource**是在**ConfigurationPropertySources**#attach中被 new 出来的。

获得MutablePropertySources，把自己加入成为第一
![](https://img-blog.csdnimg.cn/20210516152639338.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
这个attach方法就是在Spring应用程序启动时准备环境的时候调用的。
![](https://img-blog.csdnimg.cn/20210516153250188.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)