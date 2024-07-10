# 别小看Spring过滤器,这些知识点你必须得掌握

容器启动时过滤器初始化以及排序注册相关逻辑。

# 1 @WebFilter过滤器使用@Order无效

启动程序：
![](https://img-blog.csdnimg.cn/24375a4162b144aaa1a4bcc61645a8fc.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
Controller：
![](https://img-blog.csdnimg.cn/052ff71c5f5d49c1a3df5ca5a6bd2f4e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
实现俩过滤器：

- AuthFilter
  ![](https://img-blog.csdnimg.cn/7b6a861da8f545419a01b667b6c375eb.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
- TimeCostFilter
  ![](https://img-blog.csdnimg.cn/db9d092c6120462d9e12eed044e2d179.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
  使用 **@Order**，期望 **TimeCostFilter** 先被执行，因为TimeCostFilter原本设计是统计这个接口性能，所以需要统计AuthFilter执行的授权过程。

全部代码实现完毕，执行结果如下：
![](https://img-blog.csdnimg.cn/2f434d6ba68243c9b43fdcf889a2375c.png)
观察日志，执行时间并不包含授权过程，所以这违背预期，明明加了 **@Order**呀！
但若交换Order指定的值，发现也没效果，why？Order不能排序WebFilter？

## 源码解析

当请求来时，会执行到 **StandardWrapperValve#invoke()**，创建 ApplicationFilterChain，并通过**ApplicationFilterChain#doFilter()** 触发过滤器执行，并最终执行到内部私有方法**internalDoFilter()**，尝试在internalDoFilter()中寻找一些启示：
![](https://img-blog.csdnimg.cn/39a44997d98143fea4074428380febf0.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
可知，过滤器执行顺序由实例变量Filters维护，Filters是createFilterChain()在容器启动时顺序遍历StandardContext中的成员变量FilterMaps所获：
![](https://img-blog.csdnimg.cn/83d3b96957bf47a6a1911f766ae89f57.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
发现对 **StandardContext#FilterMaps** 的写入是在

### addFilterMapBefore()

![](https://img-blog.csdnimg.cn/570b994bbac744c792a799f296438ee3.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
过滤器的执行顺序由**StandardContext#FilterMaps**顺序决定，而FilterMaps则是一个包装过的数组，所以只要进一步弄清FilterMaps中各元素的排列顺序即可。

addFilterMapBefore()中加入断点：
![](https://img-blog.csdnimg.cn/27ab221470464b20b7ab48abf15d66e5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
Spring从selfInitialize()一直调用到addFilterMapBefore()。
selfInitialize()通过调用getServletContextInitializerBeans()获取所有ServletContextInitializer类型Bean，并调用该Bean的onStartup()，最终调用到addFilterMapBefore()。
![](https://img-blog.csdnimg.cn/d6dfc3bf66384106ace2b4e0ac8de94f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
上述的selfInitialize()又从何处调用过来呢？

### selfInitialize()

- getServletContextInitializerBeans()
  返回的ServletContextInitializer类型Beans顺序=》
  决定了addFilterMapBefore()调用顺序=》
  决定FilterMaps内元素顺序=》
  最终决定了过滤器的执行顺序。

### getServletContextInitializerBeans()

仅返回了ServletContextInitializerBeans类的一个实例，参考代码如下：
![](https://img-blog.csdnimg.cn/00fd1c1971934295b0baed25cfe38723.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
ServletContextInitializerBeans是个集合类
![](https://img-blog.csdnimg.cn/33fa2a60219647ecb39b77511e82dd52.png)
所以，selfInitialize()能遍历 ServletContextInitializerBeans，查看其iterator()所遍之物：
![](https://img-blog.csdnimg.cn/eab3aa9423f742efa2dbd3eaf4953c23.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
对外暴露的集合遍历元素为sortedList成员变量，即selfInitialize()最终遍历sortedList。
综上，sortedList中的过滤器Bean元素顺序决定最终过滤器的执行顺序。
继续查看ServletContextInitializerBeans构造器：
![](https://img-blog.csdnimg.cn/d2758b1fc95b407e800347515d12a31a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
第87行可知：`sortedList`元素顺序由`this.initializers.values`通过**AnnotationAwareOrderComparator**排序而得。

**AnnotationAwareOrderComparator**通过两种方式获取比较器需要的order值以决定sortedInitializers的排列顺序：

- 待排序的对象元素实现**Order**接口，则通过 ***getOrder()*** 获取order值
- 否则执行 ***OrderUtils.findOrder()*** 获取该对象类 **@Order** 的属性

因为`this.initializers.values`类型为ServletContextInitializer，其实现了**Ordered**接口，所以此处比较器使用 ***getOrder()*** 获取order值，对应实例变量`order`。

如下方法均构建了ServletContextInitializer子类的实例，并添加到了`this.initializers`：

- addAdaptableBeans()
- addServletContextInitializerBeans()
  这里只看**addServletContextInitializerBeans**，因为使用 **@WebFilter** 标记添加过滤器的方案最终只会通过该方法生效：实例化并注册了所有的ServletRegistrationBean、FilterRegistrationBean以及ServletListenerRegistrationBean。

在这个方法中，Spring通过 ***getOrderedBeansOfType()*** 实例化了所有**ServletContextInitializer**子类：
![](https://img-blog.csdnimg.cn/8588ca639f9d4c3f9b54b291bac3def8.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
根据不同类型，调用addServletContextInitializerBean()，ServletContextInitializer子类包括：

- ServletRegistrationBean
- FilterRegistrationBean
- ServletListenerRegistrationBean

正好对应了Servlet三大要素。
现在只关心对应Filter的**FilterRegistrationBean**，显然，FilterRegistrationBean是ServletContextInitializer的子类（实现了Ordered接口），同样由成员变量order的值决定其执行的优先级。

```java
private void addServletContextInitializerBean(String beanName, ServletContextInitializer initializer,
      ListableBeanFactory beanFactory) {
      ...
   if (initializer instanceof FilterRegistrationBean) {
      Filter source = ((FilterRegistrationBean<?>) initializer).getFilter();
      addServletContextInitializerBean(Filter.class, beanName, initializer, beanFactory, source);
   }
   ...
}
```

最终添加到`this.initializers`：
![](https://img-blog.csdnimg.cn/52f4ca01517042d0b10d826ed9f53122.png)
我们没有定义**FilterRegistrationBean**，那这里**FilterRegistrationBean**在哪里被定义出的？其order类成员变量是否有特定取值逻辑？

#### WebFilterHandler#doHandle()

![](https://img-blog.csdnimg.cn/5873db5c7ffd4ffb8c62a3c228821fc9.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
通过 BeanDefinitionBuilder动态构建了FilterRegistrationBean类型BeanDefinition。然而这里并未设置order值，也没设置 **@Order** 指定值。

至此，也就知道问题根因，所有被**@WebFilter**注解的类，最终都会在此处被包装为FilterRegistrationBean类的BeanDefinition。
虽FilterRegistrationBean也实现了Ordered接口
![](https://img-blog.csdnimg.cn/a7f7773a33454d1b965bd9dc1a4c3ab6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
但在这并未填充值，因为：

- 这里所有属性都是从 **@WebFilter** 对应的属性获取
- 但 **@WebFilter** 本身**没有指定可以辅助排序的属性**

## 过滤器执行顺序

- RegistrationBean中order属性的值
- ServletContextInitializerBeans类成员变量sortedList中元素的顺序
- ServletWebServerApplicationContext#selfInitialize()遍历FilterRegistrationBean的顺序
- addFilterMapBefore()调用的顺序
- filterMaps内元素的顺序
- 过滤器的执行顺序

RegistrationBean中order属性的值最终可以决定过滤器的执行顺序。
然而，使用 **@WebFilter** 时，构建的FilterRegistrationBean并未依据 **@Order** 的值去设置order属性，所以 **@Order** 失效。

## 修正

实现自己的FilterRegistrationBean配置添加过滤器，不再使用 **@WebFilter** ：
![](https://img-blog.csdnimg.cn/c3700a81ae664b4ab4c04e008e00efae.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)
由于WebFilterHandler#doHandle()虽构建FilterRegistrationBean类型BeanDefinition，但未设置order值。

所以，考虑直接手动实例化FilterRegistrationBean实例且设置其setOrder()。
切记去掉AuthFilter和TimeCostFilter类中的**@WebFilter** 即可。

## 2 竟然重复执行了？

解决排序问题，有人就想是否有其他解决方案？

如在两个过滤器中用 **@Component**，让@Order生效？代码如下：

```java
@WebFilter
@Slf4j
@Order(2)
@Component
public class AuthFilter implements Filter {
    @SneakyThrows
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain){
        if(isPassAuth()){
            System.out.println("通过授权");
            chain.doFilter(request, response);
        }else{
            System.out.println("未通过授权");
            ((HttpServletResponse)response).sendError(401);
        }
    }
    private boolean isPassAuth() throws InterruptedException {
        System.out.println("执行检查权限");
        Thread.sleep(1000);
        return true;
    }
}
```

TimeCostFilter：

```java
@WebFilter
@Slf4j
@Order(1)
@Component
public class TimeCostFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        System.out.println("#开始计算接口耗时");
        long start = System.currentTimeMillis();
        chain.doFilter(request, response);
        long end = System.currentTimeMillis();
        long time = end - start;
        System.out.println("#执行时间(ms)：" + time);
    }
}
```

最终执行结果：

```clike
#开始计算接口耗时
执行检查权限
通过授权
执行检查权限
通过授权
#开始计算接口耗时
......用户注册成功
#执行时间(ms)：73
#执行时间(ms)：2075
```

更改 AuthFilter 类中的Order值为0，测试结果：

```clike
执行检查权限
通过授权
#开始计算接口耗时
执行检查权限
通过授权
#开始计算接口耗时
......用户注册成功
#执行时间(ms)：96
#执行时间(ms)：1100
```

看来控制Order值可调整Filter执行顺序，但过滤器本身却被执行2次，why？

### 源码解析

被@WebFilter的过滤器，会在WebServletHandler类中被重新包装为FilterRegistrationBean类的BeanDefinition，而非Filter类型。

而自定义过滤器增加 **@Component** 时，怀疑Spring会根据当前类再次包装一个新过滤器，因而doFIlter()被执行两次。

ServletContextInitializerBeans构造器：
![](https://img-blog.csdnimg.cn/57382f5d0200401d92a49e3f5ce9144a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

#### addAdaptableBeans()

实例化并注册了所有实现Servlet、Filter及EventListener接口的类，重点看Filter实现类，然后再逐一包装为FilterRegistrationBean。

于是，可知Spring能直接实例化FilterRegistrationBean类型过滤器的原因：
WebFilterHandler相关类通过扫描 **@WebFilter**，动态构建了FilterRegistrationBean类型的BeanDefinition，并注册到Spring；
或我们自己使用 **@Bean** 显式实例化FilterRegistrationBean并注册到Spring，如案例1中的解决方案。

但Filter类型的过滤器如何才能被Spring直接实例化呢？
任何通过 **@Component** 修饰的的类，都可自动注册到Spring，被Spring直接实例化。

调用了addAsRegistrationBean()，其beanType为**Filter.class**：

```java
protected void addAdaptableBeans(ListableBeanFactory beanFactory) {
   // ...
   addAsRegistrationBean(beanFactory, Filter.class, new FilterRegistrationBeanAdapter());
   // ...
}
```

继续查看最终调用到的方法addAsRegistrationBean()：

```java
private <T, B extends T> void addAsRegistrationBean(ListableBeanFactory beanFactory, Class<T> type,
      Class<B> beanType, RegistrationBeanAdapter<T> adapter) {
   // 创建所有 Filter 子类的实例，即所有实现Filter接口且被@Component修饰的类
   List<Map.Entry<String, B>> entries = getOrderedBeansOfType(beanFactory, beanType, this.seen);
   // 依次遍历这些Filter类实例
   for (Entry<String, B> entry : entries) {
      String beanName = entry.getKey();
      B bean = entry.getValue();
      if (this.seen.add(bean)) {
         // 通过RegistrationBeanAdapter将这些类包装为RegistrationBean
         RegistrationBean registration = adapter.createRegistrationBean(beanName, bean, entries.size());
         // 获取Filter类实例的Order值
         int order = getOrder(bean);
         // 设置到包装类 RegistrationBean
         registration.setOrder(order);
         // 将RegistrationBean添加到this.initializers
         this.initializers.add(type, registration);
         if (logger.isTraceEnabled()) {
            logger.trace("Created " + type.getSimpleName() + " initializer for bean '" + beanName + "'; order="
                  + order + ", resource=" + getResourceDescription(beanName, beanFactory));
         }
      }
   }
}
```

当过滤器同时被 **@WebFilter**、**@Component** 修饰时，会导致两个FilterRegistrationBean实例产生：

- addServletContextInitializerBeans()
- addAdaptableBeans()

最终都会创建FilterRegistrationBean的实例，但：

- **@WebFilter** 会让addServletContextInitializerBeans()实例化，并注册所有动态生成的FilterRegistrationBean类型的过滤器
- **@Component** 会让addAdaptableBeans()实例化所有实现Filter接口的类，然后再逐一包装为FilterRegistrationBean类型的过滤器

### 修正

参考案例1的问题修正部分。

也可去掉@WebFilter，只保留@Component：

```java
//@WebFilter
@Slf4j
@Order(1)
@Component
public class TimeCostFilter implements Filter {
   //省略非关键代码
}
```

## 总结

@WebFilter和@Component的相同点：

- 最终都被包装并实例化成为了FilterRegistrationBean
- 最终都是在 ServletContextInitializerBeans的构造器中开始被实例化

@WebFilter和@Component的不同：

- 被@WebFilter修饰的过滤器会被提前在BeanFactoryPostProcessors扩展点包装成FilterRegistrationBean类型的BeanDefinition，然后在ServletContextInitializerBeans.addServletContextInitializerBeans() 进行实例化
- @Component修饰的过滤器类，在ServletContextInitializerBeans.addAdaptableBeans() 中被实例化成Filter类型后，再包装为RegistrationBean类型
- 被@WebFilter修饰的过滤器不会注入Order属性
- 被@Component修饰的过滤器会在ServletContextInitializerBeans.addAdaptableBeans() 中注入Order属性