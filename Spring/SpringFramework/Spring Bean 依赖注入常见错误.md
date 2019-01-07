有时我们会使用@Value自动注入，同时也存在注入到集合、数组等复杂类型的场景。这都是方便写 bug 的场景。

# 1 @Value未注入预期值
在字段或方法/构造函数参数级别使用，指示带注释元素的默认值表达式。
通常用于表达式驱动或属性驱动的依赖注入。 还支持处理程序方法参数的动态解析
例如，在 Spring MVC 中，一个常见的用例是使用#{systemProperties.myProp} systemProperties.myProp #{systemProperties.myProp}样式的 SpEL（Spring 表达式语言）表达式注入值。 
或可使用${my.app.myProp}样式属性占位符注入值。

**@Value**实际处理由BeanPostProcessor执行，这意味着不能在BeanPostProcessor或BeanFactoryPostProcessor类型中使用 **@Value**。
## V.S Autowired
在装配对象成员属性时，常使用@Autowired来装配。但也使用@Value进行装配：
- 使用@Autowired一般都不会设置属性值
- @Value必须指定一个字符串值，因其定义做了要求：
![](https://img-blog.csdnimg.cn/3182d920dc254a90a519f4691a4f2b6c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)

一般都会因 **@Value** 常用于String类型的装配，误以为其不能用于非内置对象的装配。

可用如下方式注入一个属性成员：
![](https://img-blog.csdnimg.cn/5404d551f42f4937bbc915911e007e58.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
使用 **@Value**更多是用来装配String，而且支持多种强大的装配方式
![](https://img-blog.csdnimg.cn/84ffc52fd3db4f89b14ca60c2beebccb.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_16,color_FFFFFF,t_70,g_se,x_16)
application.properties配置了这样一个属性：
```java
user=admin
password=pass
```

然后我们在一个Bean中，分别定义两个属性来引用它们：
![](https://img-blog.csdnimg.cn/12b3b5bc840f4133b41d71ac8af8e2da.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
password返回了配置值，但user却不是配置文件的指定值，而是PC用户名。
## 答疑
有一个正确的，说明 **@Value**使用姿势没问题，但user为啥不正确？
这就得精通Spring到底如何根据 **@Value**查询值。
### @Value的核心工作流程
#### DefaultListableBeanFactory#doResolveDependency
```java
@Nullable
public Object doResolveDependency(DependencyDescriptor descriptor, @Nullable String beanName,
      @Nullable Set<String> autowiredBeanNames, @Nullable TypeConverter typeConverter) throws BeansException {
    // ...
    Class<?> type = descriptor.getDependencyType();
      // 寻找@Value
      Object value = getAutowireCandidateResolver().getSuggestedValue(descriptor);
      if (value != null) {
         if (value instanceof String) {
            // 解析Value值
            String strVal = resolveEmbeddedValue((String) value);
            BeanDefinition bd = (beanName != null && containsBean(beanName) ?
                  getMergedBeanDefinition(beanName) : null);
            value = evaluateBeanDefinitionString(strVal, bd);
         }
         
         // 转化Value解析的结果到装配的类型
         TypeConverter converter = (typeConverter != null ? typeConverter : getTypeConverter());
         try {
            return converter.convertIfNecessary(value, type, descriptor.getTypeDescriptor());
         }
         catch (UnsupportedOperationException ex) {}
      }
    // ...
  }
```
**@Value** 的工作大体分为以下三个核心步骤。
#### 1 寻找@Value
判断这个属性字段是否标记为@Value：
##### QualifierAnnotationAutowireCandidateResolver#findValue
- valueAnnotationType就是 **@Value**
![](https://img-blog.csdnimg.cn/8588a95243e1400d82181d711b97b1ef.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
![](https://img-blog.csdnimg.cn/46f640ee047c4f3d8d85c085770e64c9.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
#### 2 解析@Value的字符串值
若一个字段标记了 **@Value**，则可拿到对应字符串值，然后根据字符串值解析，最终解析的结果可能是一个字符串or对象，取决于字符串怎么写。

#### 3 将解析结果转化为待装配的对象的类型
当拿到上一步生成的结果后，我们会发现可能和我们要装配的类型不匹配。
比如定义的是UUID，而结果是个字符串，此时就会根据目标类型来寻找转化器执行转化：
![](https://img-blog.csdnimg.cn/18ed8af280474e6887aa5da59ef53c9d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)

分析可得问题关键在第二步，执行过程：
![](https://img-blog.csdnimg.cn/728d4ba5c3154e2eb952d32609d53995.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
这里是在解析嵌入的值，替换掉占位符。使用PropertySourcesPlaceholderConfigurer根据PropertySources替换。

当使用 `${user}` 获取替换值时，最终执行的查找并非只在application.property文件。
可以发现如下“源”都是替换的依据：
![](https://img-blog.csdnimg.cn/3b8888a22217457b8e04c0da90afe8e8.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
而具体的查找执行，通过
##### PropertySourcesPropertyResolver#getProperty
获取执行方式
![](https://img-blog.csdnimg.cn/ed8efa9caf61487795c573a75b13d67b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
在解析Value字符串有顺序，源都存在CopyOnWriteArrayList，启动时就被按序固定下来了，一个一个“源”顺序查找，在其中一源找到后，就直接返回。

查看systemEnvironment源，发现刚好有个user和自定义的重合，且值不是admin。
![](https://img-blog.csdnimg.cn/24b383c3c8a84d7a8edf3f98dfd42e78.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
所以这真是冤家路窄了，刚好系统环境变量（systemEnvironment）含同名配置。若没有意识到它们的存在，起了同名字符串作为 **@Value**，就容易引发这类问题。
## 修正
避免使用同一个名称，具体修改如下：
```java
user.name=admin
user.password=pass
```
其实还是不行。
在systemProperties这个PropertiesPropertySource源中刚好存在user.name，真是无巧不成书。所以命名时，我们一定要注意不仅要避免和环境变量冲突，也要注意避免和系统变量等其他变量冲突，才能从根本解决该问题。

Spring给我们提供了很多好用的功能，但是这些功能交织到一起后，就有可能让我们误入一些坑，只有了解它的运行方式，我们才能迅速定位问题、解决问题。