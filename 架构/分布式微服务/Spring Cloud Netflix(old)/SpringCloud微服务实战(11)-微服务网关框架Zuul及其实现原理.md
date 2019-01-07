# 1 简介
## 1.1  网关服务的意义
### 1.1.1 点对点
- 服务之间直接调用，每个微服务都开放Rest API，并调用其他微服务的接口
![](https://img-blog.csdnimg.cn/20200726184615994.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

 
### 1.1.2 API网关（使用最广）
随着服务数量增多，如果还是每个服务都直接对外部客户端提供接口，就会变得很复杂，最显然的就是每个服务都得自己实现鉴权。
这时，就需要一个角色充当 request 请求的统一入口，即服务网关。
业务接口通过API网关暴露，是所有客户端接口的唯一入口。 微服务之间的通信也通过API网关。![](https://img-blog.csdnimg.cn/2020072618414676.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 1.2 网关要素及演进史
- 稳定，高可用
- 安全性
- 性能、并发性
- 扩展性
- 限流熔断
- 动态路由和负载均衡
- 基于 Path 的路由
	- api.xxx.com/pathx
- 截获器链
- 日志采集和 Metrics 埋点
- 响应流优化

网关是具体核心业务服务的看门神，相比于具体实现业务的系统服务，它是一个边缘服务，主要提供动态路由，监控，弹性，安全性等功能。

下面我们从单体应用到多体应用的演化过程来讲解网关的演化历程，一般业务系统发展历程都是基本相似的，从单体应用到多应用，从本地调用到远程调用。
###  1.2.1 单体应用
由于只需一个应用，所有业务模块的功能都打包为了一个 War 包进行部署，这可以减少机器资源和部署的繁琐。
![](https://img-blog.csdnimg.cn/20200726220030919.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

单体应用中，网关模块和应用部署到同一JVM进程，当外部移动设备或者web站点访问单体应用的功能时，请求是先被应用的网关模块拦截，网关模块对请求进行鉴权、限流等动作后在把具体的请求转发到当前应用对应的模块处理。

### 多体应用
先看个不用网关的案例，有的公司架构，虽然是微服务，但全部通过 nginx 进行请求转发
![](https://img-blog.csdnimg.cn/20210111113206876.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

这样有啥缺点呢？
每个暴露的服务都需要自己的域名，且一旦修改，其他各个使用该服务的服务配置都需要修改。这些服务直接暴露在公网，存在安全问题。而且随着外部设备种类增多，大量兼容适配工作繁杂。
![](https://img-blog.csdnimg.cn/20210111114006526.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
随着业务发展，网站流量越来越大，在单体应用中简单的通过加机器的方式可以带来的承受流量冲击的能力也越来越低，这时候就会考虑根据业务将单体应用拆成若干功能独立应用，单体应用拆为多个应用后，由于不同的应用开发对应的功能，所以多应用开发之间可以独立开发而不用去理解对方的业务，另外不同的应用模块只承受对应业务流量的压力，不会对其他应用模块造成影响，这时多体的分布式系统就出现了，如下
![](https://img-blog.csdnimg.cn/20200726220331119.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)


多体应用中业务模块A和B单独启个应用，每个应用里有自己的网关模块。
如果业务模块太多，每个应用都有自己的网关模块，复用性不好，考虑把网关模块提出来，单独作为一个应用做服务路由，如下
![](https://img-blog.csdnimg.cn/20200726220357206.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

如上图当移动设备发起请求时候是具体发送到网关应用的，经过鉴权后请求会被转发到具体的后端服务应用上，对应前端移动设备来说他们不在乎也不知道后端服务器应用是一个还是多个，他们只能感知到网关应用的存在。


## 1.3 微服务网关层的功能
### 请求鉴权
发布商品，登录鉴权

### 数据完整性检查
数据包定长 Header+变成Body

### 协议转换
JSON -> HashMap(String, Object)
解析 app 的request参数时，在需要 rpc 调用服务接口时，需要将文本 request 参数转为 map 参数使用 rpc。

### 路由转发
根据 CMD 转发到不同业务逻辑层。对于 HTTP 请求，cmd 就是 url。

### 服务治理
限流、降级、熔断等。

# 2 常用网关方案
![](https://img-blog.csdnimg.cn/20210111151637737.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 3 Zuul 的特点
![](https://img-blog.csdnimg.cn/2020121320503042.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
 
Zuul 网关是具体核心业务服务的看门神，相比具体实现业务的系统服务来说它是一个边缘服务，主要提供动态路由，监控，弹性，安全性等功能。在分布式的微服务系统中，系统被拆为了多套系统，通过zuul网关来对用户的请求进行路由，转发到具体的后台服务系统中。

- 路由+过滤器= Zuul
核心是一系列的过滤器

## 3.1 四种过滤器
在zuul中过滤器分为四种：
1. PRE Filters(前置过滤器) 
当请求会路由转发到具体后端服务器前执行的过滤器，比如鉴权过滤器，日志过滤器，还有路由选择过滤器
2. ROUTING Filters （路由过滤器）
一般通过Apache HttpClient 或者 Netflix Ribbon把请求具体转发到后端服务器
3. POST Filters（后置过滤器）
当把请求路由到具体后端服务器后执行的过滤器；场景有添加标准http 响应头，收集一些统计数据（比如请求耗时等），写入请求结果到请求方等
4. ERROR Filters（错误过滤器）
当上面任何一个类型过滤器执行出错时候执行该过滤器

## 3.2 架构图
Zuul网关核心 Zuul Core本质上就是 Web Servlet，一系列过滤器，用于过滤请求或响应结果。
Zuul 提供一个框架可支持动态加载，编译，运行这些过滤器，这些过滤器通过责任链方式顺序处理请求或者响应结果。过滤器之间不会直接通信，但可通过责任链传递的RequestContext（ThreadLocal 线程级别缓存）参数共享一些信息。

虽然 Zuul 支持任何可以在JVM上跑的语言，但zuul的过滤器只能使用Groovy编写。编写好的过滤器脚本一般放在zuul服务器的固定目录，zuul服务器会开启一个线程定时去轮询被修改或者新增的过滤器，然后**动态编译**，加载到内存，然后等后续有请求进来，新增或者修改后的过滤器就会生效了。
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTMxMzA5NjJmOWVjNjY1NjcucG5n?x-oss-process=image/format,png)
## 3.3 请求生命周期
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTY3OGZlMTljZDhlOWQ0NzIucG5n?x-oss-process=image/format,png)

Zuul接收到请求后：
- Pre事前
	- 请求被路由之前调用首先由前置过滤器处理
	- 身份验证
- Routing事中
	- 由路由过滤器具体地把请求转发到后端应用微服务
	- Apache HttpClient 或 Netflix Ribbon 请求微服务
- Post事后
	- 远程调用后执行
	- 再执行后置过滤器把执行结果写回请求方
	- HTTP Header、收集统计信息和指标、Response
- Error错误时
	- 当上面任何一个类型过滤器出错时执行

## 3.4 核心处理流程 - ZuulServlet类
在Zuul1.0中最核心的是ZuulServlet类，该类是个servlet，用来对匹配条件的请求执行核心的 pre, routing, post过滤器。

- 该类核心时序图
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTQxYTRlNGZhZjVjOTg2YWUucG5n?x-oss-process=image/format,png)

上图可知当请求过来后，先后执行了FilterProcessor管理的三种过滤器：

```java
public void service(javax.servlet.ServletRequest servletRequest, javax.servlet.ServletResponse servletResponse) throws ServletException, IOException {
        try {
            init((HttpServletRequest) servletRequest, (HttpServletResponse) servletResponse);
            ...
            try {
            // 1 前置过滤器
                preRoute();
            } catch (ZuulException e) {
                // 1.1 错误过滤器
                error(e);
                // 1.2 后置过滤器
                postRoute();
                return;
            }
            try {
                // 2 路由过滤器
                route();
            } catch (ZuulException e) {
                // 2.1 错误过滤器
                error(e);
                // 2.2 后置过滤器
                postRoute();
                return;
            }
            try {
                // 3 后置过滤器
                postRoute();
            } catch (ZuulException e) {
                // 3.1 错误过滤器
                error(e);
                return;
            }

        } catch (Throwable e) {
            error(new ZuulException(e, 500, "UNHANDLED_EXCEPTION_" + e.getClass().getName()));
        } finally {
        }
    }
```

如果在三种过滤器执行过程中发生了错误，会执行error(e)，该方法执行错误过滤器，注意如果在pre、route过滤器执行过程中出现错误，在执行错误过滤器后还需再执行后置过滤器。

### FilterProcessor#runFilters
执行具体过滤器：
```java
public Object runFilters(String sType) throws Throwable {
        ...
        boolean bResult = false;
        // 2 获取sType类型的过滤器
        List<ZuulFilter> list = FilterLoader.getInstance().getFiltersByType(sType);
        if (list != null) {
            for (int i = 0; i < list.size(); i++) {
                ZuulFilter zuulFilter = list.get(i);
                // 2.1具体执行过滤器
                Object result = processZuulFilter(zuulFilter);
                if (result != null && result instanceof Boolean) {
                    bResult |= ((Boolean) result);
                }
            }
        }
        return bResult;
    }

```

代码2是具体获取不同类型的过滤器
代码2.1是具体执行过滤器
我们看下代码2看FilterLoader类的getFiltersByType方法如何获取不同类型的过滤器：
### FilterLoader#getFiltersByType
```java
 public List<ZuulFilter> getFiltersByType(String filterType) {

        // 3 分类缓存是否存在
        List<ZuulFilter> list = hashFiltersByType.get(filterType);
        if (list != null) return list;

        list = new ArrayList<ZuulFilter>();
        // 4 获取所有过滤器
        Collection<ZuulFilter> filters = filterRegistry.getAllFilters();
        for (Iterator<ZuulFilter> iterator = filters.iterator(); iterator.hasNext(); ) {
            ZuulFilter filter = iterator.next();
            if (filter.filterType().equals(filterType)) {
                list.add(filter);
            }
        }
        Collections.sort(list); // sort by priority
        // 5 保存到分类缓存
        hashFiltersByType.putIfAbsent(filterType, list);
        return list;
    }
    private final ConcurrentHashMap<String, List<ZuulFilter>> hashFiltersByType = new ConcurrentHashMap<String, List<ZuulFilter>>();
```
- 代码3首先看分类缓存里是否有该类型过滤器，有直接返回
- 否则执行代码4获取所有注册过滤器，然后从中过滤出当前需要类别
- 然后缓存到分类过滤器

看到这里想必大家知道FilterRegistry类是存放所有过滤器的类，FilterRegistry里面 :
private final ConcurrentHashMap<String, ZuulFilter> filters = new ConcurrentHashMap<String, ZuulFilter>();存放所有注册的过滤器，那么这些过滤器什么时候放入的那？这个我们后面讲解。

这里我们剖析了如何获取具体类型的过滤器的，下面回到代码2.1看如何执行过滤器的：
```java
 public Object processZuulFilter(ZuulFilter filter) throws ZuulException {

        RequestContext ctx = RequestContext.getCurrentContext();
        boolean bDebug = ctx.debugRouting();
        final String metricPrefix = "zuul.filter-";
        long execTime = 0;
        String filterName = "";
        try {
            ...
            // 5 执行过滤器
            ZuulFilterResult result = filter.runFilter();
            ExecutionStatus s = result.getStatus();
            execTime = System.currentTimeMillis() - ltime;

            switch (s) {
                case FAILED:
                    t = result.getException();
                    ctx.addFilterExecutionSummary(filterName, ExecutionStatus.FAILED.name(), execTime);
                    break;
                case SUCCESS:
                    o = result.getResult();
                    ctx.addFilterExecutionSummary(filterName, ExecutionStatus.SUCCESS.name(), execTime);
                    
                    break;
                default:
                    break;
            }
            
            if (t != null) throw t;

            usageNotifier.notify(filter, s);
            return o;

        } catch (Throwable e) {
          ...
        }
    }
```
## 3.5   Zuul 2.0 服务架构新特性
zuul2.0使用netty server作为网关监听服务器监听客户端发来的请求，然后把请求转发到前置过滤器（inbound filters）进行处理，处理完毕后在把请求使用netty client代理到具体的后端服务器进行处理，处理完毕后在把结果交给后者过滤器（outbound filters）进行处理，然后把处理结果通过nettyServer写回客户端。
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTE1ZTBiMWFiMjhmY2FkOWQucG5n?x-oss-process=image/format,png)

在zuul1.0时候客户端发起的请求后需要同步等待zuul网关返回，zuul网关这边对每个请求会分派一个线程来进行处理，这会导致并发请求数量有限。
而zuul2.0使用netty作为异步通讯，可以大大加大并发请求量。

#  4 实践
![新建](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQ3MjdiNzM3MzY3ODY1NWIucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWFmZmQ1NDJhNTk4ZmJiMDEucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWE3ZGU4ZDFiZmJmNjJmNjUucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQ5NGM1Mjg1N2Q5ZDBjN2YucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWUzZDMyMjNlNjUxY2E3N2QucG5n?x-oss-process=image/format,png)
- 注意端口![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTFlN2FlOWUyNGI2NzUxNTAucG5n?x-oss-process=image/format,png)

- 嵌入式Zuul反向代理
Spring Cloud已经创建了一个嵌入式Zuul代理，以简化UI应用程序想要代理对一个或多个后端服务的调用的非常常见的用例的开发。此功能对于用户界面对其所需的后端服务进行代理是有用的，避免了对所有后端独立管理CORS和验证问题的需求。

要启用它，使用`@EnableZuulProxy`注释Spring Boot主类，并将本地调用转发到相应的服务
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTY5MmUwNDliMmNjNDM1MDkucG5n?x-oss-process=image/format,png)
按照惯例，ID为“用Users”的服务将接收来自位于`/users`的代理（具有前缀stripped）的请求。
代理使用Ribbon来定位要通过发现转发的实例，并且所有请求都以hystrix命令执行，所以故障将显示在Hystrix指标中，一旦电路打开，代理将不会尝试联系服务。

- 添加注解
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWI3YjFiM2ZkNTk4YTE2M2QucG5n?x-oss-process=image/format,png)
Zuul启动器不包括发现客户端，因此对于基于服务ID的路由，还需要在类路径中提供其中一个路由（例如Eureka）
![欲获取 Product 服务的 list 接口](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWIzOGY3OTc4ZWI4ZGU5YWMucG5n?x-oss-process=image/format,png)
先将 Product 服务启动
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTkzNzdkMzM0MTczZDEwZGUucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWVhMjYzYTYzNzZlZmYzODgucG5n?x-oss-process=image/format,png)