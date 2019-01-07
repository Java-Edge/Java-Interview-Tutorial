加载Servlet的类不等于创建Servlet实例，Tomcat先加载Servlet的类，然后还得在Java堆创建Servlet实例。

一个Web应用里往往有多个Servlet，而在Tomcat中一个Web应用对应一个Context容器，即一个Context容器需管理多个Servlet实例。
但Context容器并不直接持有Servlet实例，而是通过子容器Wrapper管理Servlet，可以把Wrapper容器看作Servlet的包装。

> 为何需要Wrapper？Context容器直接维护一个Servlet数组还不满足？

Servlet不仅是个类实例，还有相关配置信息，比如URL映射、初始化参数，因此设计出了一个包装器，把Servlet本身和它相关的数据包起来。

> 管理好Servlet就够了吗？

Listener和Filter也是Servlet规范，Tomcat也要创建它们的实例，在合适时机调用它们的方法。
# Servlet管理
Tomcat用Wrapper容器管理Servlet
```java
protected volatile Servlet instance = null;
```
它拥有一个Servlet实例，Wrapper#loadServlet实例化Servlet：
```java
public synchronized Servlet loadServlet() throws ServletException {
    Servlet servlet;
  
    // 1. 创建Servlet实例
    servlet = (Servlet) instanceManager.newInstance(servletClass);    
    
    // 2.调用了Servlet#init【Servlet规范要求】
    initServlet(servlet);
    
    return servlet;
}
```

为加快系统启动速度，一般采取资源延迟加载，所以Tomcat默认情况下Tomcat在启动时不会加载你的Servlet，除非把Servlet loadOnStartup参数置true。

虽然Tomcat在启动时不会创建Servlet实例，但会创建Wrapper容器。当有请求访问某Servlet，才会创建该Servlet实例。

Servlet是被谁调用呢？
Wrapper作为一个容器组件，有自己的Pipeline和BasicValve，其BasicValve为StandardWrapperValve。

当请求到来，Context容器的BasicValve会调用Wrapper容器中Pipeline中的第一个Valve，然后调用到StandardWrapperValve：
```java
public final void invoke(Request request, Response response) {

    // 1.实例化Servlet
    servlet = wrapper.allocate();
   
    // 2.给当前请求创建一个Filter链
    ApplicationFilterChain filterChain =
        ApplicationFilterFactory.createFilterChain(request, wrapper, servlet);

   // 3. 调用这个Filter链，Filter链中的最后一个Filter会调用Servlet
   filterChain.doFilter(request.getRequest(), response.getResponse());

}
```

StandardWrapperValve的invoke就三步：
1. 创建Servlet实例
2. 给当前请求创建一个Filter链
3. 调用Filter链

### 为何要给每个请求创建Filter链
每个请求的请求路径不同，而Filter都有相应路径映射，因此不是所有Filter都需要处理当前请求，要根据请求路径选择特定的一些Filter。

### 为何没调用Servlet#service
Filter链的最后一个Filter会负责调用Servlet。

# Filter管理
跟Servlet一样，Filter也可在`web.xml`配置。
但Filter的作用域是整个Web应用，因此Filter的实例维护在Context容器：Map里存的是filterDef（filter定义），而非filter类实例
![](https://img-blog.csdnimg.cn/a3042975203c43a1bb10f19d23110602.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
Filter链存活期很短，它跟每个请求对应。一个新请求来了，就动态创建一个Filter链，请求处理完，Filter链就被回收。
```java
public final class ApplicationFilterChain implements FilterChain {
  
  // Filter链的Filter数组
  private ApplicationFilterConfig[] filters = new ApplicationFilterConfig[0];
    
  // Filter链的当前的调用位置
  private int pos = 0;
    
  // Filter总数
  private int n = 0;

  // 每个Filter链最终要调用的Servlet
  private Servlet servlet = null;
  
  public void doFilter(ServletRequest req, ServletResponse res) {
        internalDoFilter(request,response);
  }
   
  private void internalDoFilter(ServletRequest req,
                                ServletResponse res){

    if (pos < n) {
        ApplicationFilterConfig filterConfig = filters[pos++];
        Filter filter = filterConfig.getFilter();

        filter.doFilter(request, response, this);
        return;
    }

    servlet.service(request, response);
   
}
```
internalDoFilter里会做个判断：
- 若当前Filter位置 ＜ Filter数组长度，即Filter还没调完，就从Filter数组取下一个Filter，调用其doFilter
- 否则，说明已调用完所有Filter，该调用Servlet#service了。service方法是留给程序员实现业务逻辑的，比如CRUD
```java
public void doFilter(ServletRequest request, ServletResponse response,
        FilterChain chain){
        
          ...
          
          //调用Filter的方法
          chain.doFilter(request, response);
      
      }
```
Filter#doFilter的FilterChain参数，就是Filter链。每个Filter#doFilter里必须调用Filter链的doFilter，而Filter链中保存当前Filter位置，会调用下一个Filter的doFilter方法，这样就能完成链式调用。

### 对应的filter是怎么注册到Servlet的呢？
filter是注册到Servlet容器中，Tomcat的StandardContext类中维护了一个Filter列表，所谓注册就是把你写的filter类实例加到这个列表。

# Listener管理
Listener可以监听容器内部发生的事件：
- 生命状态的变化
比如Context容器启动和停止、Session的创建和销毁。
- 属性变化
比如Context容器某个属性值变了、Session的某个属性值变了以及新的请求来了

## 怎么添加监听器
在web.xml配置或注解添加，在监听器里实现业务逻辑。
Tomcat需读取配置文件，拿到监听器的类名，将它们实例化，并适时调用这些监听器方法。

Tomcat是通过Context容器来管理这些监听器的。Context容器将两类事件分开来管理，分别用不同的集合来存放不同类型事件的监听器：
```java
//监听属性值变化的监听器
private List<Object> applicationEventListenersList = new CopyOnWriteArrayList<>();

//监听生命事件的监听器
private Object applicationLifecycleListenersObjects[] = new Object[0];
剩下的事情就是触发监听器了，比如在Context容器的启动方法里，就触发了所有的ServletContextListener：

// 1 拿到所有生命周期监听器
Object instances[] = getApplicationLifecycleListeners();

for (int i = 0; i < instances.length; i++) {
   // 2 判断Listener的类型是否为ServletContextListener
   if (!(instances[i] instanceof ServletContextListener))
      continue;

   // 3 触发Listener方法
   ServletContextListener lr = (ServletContextListener) instances[i];
   lr.contextInitialized(event);
}
```
这里的ServletContextListener接口是留给用户的扩展机制，用户可以实现该接口定义自己的监听器，监听Context容器的启停事件。
ServletContextListener跟Tomcat自己的生命周期事件LifecycleListener是不同的。LifecycleListener定义在生命周期管理组件中，由基类LifecycleBase统一管理。

可定制监听器监听Tomcat内部发生的各种事件：比如Web应用、Session级别或请求级别的。Tomcat中的Context容器统一维护了这些监听器，并负责触发。

Context组件通过自定义类加载器来加载Web应用，并实现了Servlet规范，直接跟Web应用打交道。
# FAQ
Context容器分别用了CopyOnWriteArrayList和对象数组来存储两种不同的监听器，为什么要这样设计呢？
因为：
- 属性值变化listener能动态配置，所以用CopyOnWriteArray
写不会那么频繁，读取比较频繁
- 生命周期事件listener，不能动态改变，无线程安全问题
生命周期相关的类比如session一个用户分配一个，用完了就会销毁，用对象数组，可以适应增删改操作