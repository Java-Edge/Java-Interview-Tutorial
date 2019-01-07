> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> [https://github.com/Wasabi1234/Java-Interview-Tutorial](https://github.com/Wasabi1234/Java-Interview-Tutorial)

Spring在程序运行期，就能帮助我们把切面中的代码织入Bean的方法内，让开发者能无感知地在容器对象方法前后随心添加相应处理逻辑，所以AOP其实就是个代理模式。
但凡是代理，由于代码不可直接阅读，也是初级程序员们 bug 的重灾区。
#  1 案例
某游戏系统，含负责点券充值的类CouponService，它含有一个充值方法deposit()：
![](https://img-blog.csdnimg.cn/d92cc2a3908e4c0f8468ef42440bb940.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
deposit()会使用微信支付充值。因此在这个方法中，加入pay()。

由于微信支付是第三方接口，需记录接口调用时间。
引入 **@Around** 增强 ，分别记录在pay()方法执行前后的时间，并计算pay()执行耗时。
![](https://img-blog.csdnimg.cn/82ec220929644cc7b751b148279a9c92.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
Controller：
![](https://img-blog.csdnimg.cn/815d2b60a2ad49e888132a0da33fdbad.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
访问接口，会发现这段计算时间的切面并没有执行到，输出日志如下：
![](https://img-blog.csdnimg.cn/36db9a5c4f584a6098a9f65be4a76646.png)
切面类明明定义了切面对应方法，但却没执行到。说明在类的内部，通过this调用的方法，不会被AOP增强。
# 2 源码解析
- this对应的对象就是一个普通CouponService对象：
![](https://img-blog.csdnimg.cn/cfb4ccb9412c4f28baba84a0ff75f5b8.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
- 而在Controller层中自动装配的CouponService对象：
![](https://img-blog.csdnimg.cn/24bcddfe649c427cad718d9e0a7fadea.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
是个被Spring增强过的Bean，所以执行deposit()时，会执行记录接口调用时间的增强操作。而this对应的对象只是一个普通的对象，并无任何额外增强。

为什么this引用的对象只是一个普通对象？
要从Spring AOP增强对象的过程来看。
## 实现
AOP的底层是动态代理，创建代理的方式有两种：
- JDK方式
只能对实现了接口的类生成代理，不能针对普通类
- CGLIB方式
可以针对类实现代理，主要是对指定的类生成一个子类，覆盖其中的方法，来实现代理对象。
![](https://img-blog.csdnimg.cn/ddb123e788dc47e083433f5ccd24ce3a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)

针对非Spring Boot程序，除了添加相关AOP依赖项外，还会使用 **@EnableAspectJAutoProxy** 开启AOP功能。
这个注解类引入AspectJAutoProxyRegistrar，它通过实现ImportBeanDefinitionRegistrar接口完成AOP相关Bean准备工作。

现在来看下创建代理对象的过程。先来看下调用栈：
![](https://img-blog.csdnimg.cn/44c0f0955fa74569abd9baa3496a07a8.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
- **创建代理对象的时机**
创建一个Bean时

创建的的关键工作由AnnotationAwareAspectJAutoProxyCreator完成
## AnnotationAwareAspectJAutoProxyCreator
一种BeanPostProcessor。所以它的执行是在完成原始Bean构建后的初始化Bean（initializeBean）过程中
##### AbstractAutoProxyCreator#postProcessAfterInitialization
```java
public Object postProcessAfterInitialization(@Nullable Object bean, String beanName) {
   if (bean != null) {
      Object cacheKey = getCacheKey(bean.getClass(), beanName);
      if (this.earlyProxyReferences.remove(cacheKey) != bean) {
         return wrapIfNecessary(bean, beanName, cacheKey);
      }
   }
   return bean;
}
```
关键方法wrapIfNecessary：在需要使用AOP时，它会把创建的原始Bean对象wrap成代理对象，作为Bean返回。
## AbstractAutoProxyCreator#wrapIfNecessary
```java
protected Object wrapIfNecessary(Object bean, String beanName, Object cacheKey) {
   // 省略非关键代码
   Object[] specificInterceptors = getAdvicesAndAdvisorsForBean(bean.getClass(), beanName, null);
   if (specificInterceptors != DO_NOT_PROXY) {
      this.advisedBeans.put(cacheKey, Boolean.TRUE);
      Object proxy = createProxy(
            bean.getClass(), beanName, specificInterceptors, new SingletonTargetSource(bean));
      this.proxyTypes.put(cacheKey, proxy.getClass());
      return proxy;
   }
   // 省略非关键代码 
}
```
## createProxy
创建代理对象的关键：
```java
protected Object createProxy(Class<?> beanClass, @Nullable String beanName,
      @Nullable Object[] specificInterceptors, TargetSource targetSource) {
  // ...
  // 1. 创建一个代理工厂
  ProxyFactory proxyFactory = new ProxyFactory();
  if (!proxyFactory.isProxyTargetClass()) {
   if (shouldProxyTargetClass(beanClass, beanName)) {
      proxyFactory.setProxyTargetClass(true);
   }
   else {
      evaluateProxyInterfaces(beanClass, proxyFactory);
   }
  }
  Advisor[] advisors = buildAdvisors(beanName, specificInterceptors);
  // 2. 将通知器（advisors）、被代理对象等信息加入到代理工厂
  proxyFactory.addAdvisors(advisors);
  proxyFactory.setTargetSource(targetSource);
  customizeProxyFactory(proxyFactory);
   // ...
   // 3. 通过代理工厂获取代理对象
  return proxyFactory.getProxy(getProxyClassLoader());
}
```
经过这样一个过程，一个代理对象就被创建出来了。我们从Spring中获取到的对象都是这个代理对象，所以具有AOP功能。而之前直接使用this引用到的只是一个普通对象，自然也就没办法实现AOP的功能了。
# 3 修正
经过前面分析可知，**只有引用的是被 `动态代理` 所创对象，才能被Spring增强，实现期望的AOP功能**。

那得怎么处理对象，才具备这样的条件？
### 被@Autowired注解
通过 **@Autowired**，在类的内部，自己引用自己：
![](https://img-blog.csdnimg.cn/6c83d422014c47588a10659ebef5e4ae.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
![](https://img-blog.csdnimg.cn/c4ba19274d3e457a8705790e9ef7d94f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_18,color_FFFFFF,t_70,g_se,x_16)

### 直接从AopContext获取当前Proxy
AopContext，就是通过一个ThreadLocal来将Proxy和线程绑定起来，这样就可以随时拿出当前线程绑定的Proxy。

使用该方案有个前提，需要在 **@EnableAspectJAutoProxy** 加配置项 **exposeProxy = true** ，表示将代理对象放入到ThreadLocal，这才可以直接通过 
```java
AopContext.currentProxy()
```
获取到，否则报错：
![](https://img-blog.csdnimg.cn/8af06b17823a4c8dbec6ca6238807d92.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
于是修改代码：
![](https://img-blog.csdnimg.cn/562eef29a2bb416c85b378a754ef0257.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
勿忘修改**EnableAspectJAutoProxy** 的 **exposeProxy**属性：
![](https://img-blog.csdnimg.cn/11175d6f95ab462a8d444cca182493d3.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)