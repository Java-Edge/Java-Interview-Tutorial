> 通过startup.sh启动Tomcat后会发生什么呢？

![](https://img-blog.csdnimg.cn/20210720163627669.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
1. Tomcat也是Java程序，因此startup.sh脚本会启动一个JVM运行Tomcat的启动类Bootstrap
2. Bootstrap主要负责初始化Tomcat的类加载器，并创建Catalina
3. Catalina是个启动类，解析server.xml、创建相应组件，并调用Server#start
4. Server组件负责管理Service组件，会调用Service#start
5. Service组件负责管理连接器和顶层容器Engine，因此会调用连接器和Engine的start()

这些启动类或组件不处理具体的请求，它们主要是“管理”，管理下层组件的生命周期，并给下层组件分配任务，即路由请求到应负责的组件。
# Catalina
主要负责创建Server，并非直接new个Server实例就完事了，而是：
- 解析server.xml，将里面配的各种组件创建出来
- 接着调用Server组件的init、start方法，这样整个Tomcat就启动起来了

Catalina还需要处理各种“异常”，比如当通过“Ctrl + C”关闭Tomcat时，

> Tomcat会如何优雅停止并清理资源呢？

因此Catalina在JVM中注册一个 **关闭钩子**。
```java
public void start() {
    // 1. 如果持有的Server实例为空，就解析server.xml创建出来
    if (getServer() == null) {
        load();
    }
    // 2. 如果创建失败，报错退出
    if (getServer() == null) {
        log.fatal(sm.getString("catalina.noServer"));
        return;
    }

    // 3.启动Server
    try {
        getServer().start();
    } catch (LifecycleException e) {
        return;
    }

    // 创建并注册关闭钩子
    if (useShutdownHook) {
        if (shutdownHook == null) {
            shutdownHook = new CatalinaShutdownHook();
        }
        Runtime.getRuntime().addShutdownHook(shutdownHook);
    }

    // 监听停止请求
    if (await) {
        await();
        stop();
    }
}
```
## 关闭钩子
若需在JVM关闭时做一些清理，比如：
- 将缓存数据刷盘
- 清理一些临时文件

就可以向JVM注册一个关闭钩子，其实就是个线程，JVM在停止之前会尝试执行该线程的run()。

Tomcat的**关闭钩子** 就是CatalinaShutdownHook：
![](https://img-blog.csdnimg.cn/eeb4c65673154a25876ec027c1f488df.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)

Tomcat的“关闭钩子”实际上就执行了Server#stop，会释放和清理所有资源。
# Server组件
Server组件具体实现类StandardServer。

Server继承了LifecycleBase，它的生命周期被统一管理
![](https://img-blog.csdnimg.cn/20210720165154608.png)
它的子组件是Service，因此它还需要管理Service的生命周期，即在启动时调用Service组件的启动方法，在停止时调用它们的停止方法。Server在内部维护了若干Service组件，它是以数组来保存的，那Server是如何添加一个Service到数组中的呢？
```java
@Override
public void addService(Service service) {

    service.setServer(this);

    synchronized (servicesLock) {
        // 长度+1的数组并没有一开始就分配一个很长的数组
        // 而是在添加的过程中动态地扩展数组长度，当添加一个新的Service实例时
        // 会创建一个新数组并把原来数组内容复制到新数组，节省内存
        Service results[] = new Service[services.length + 1];
        
        // 复制老数据
        System.arraycopy(services, 0, results, 0, services.length);
        results[services.length] = service;
        services = results;

        // 启动Service组件
        if (getState().isAvailable()) {
            try {
                service.start();
            } catch (LifecycleException e) {
                // Ignore
            }
        }

        // 触发监听事件
        support.firePropertyChange("service", null, service);
    }

}
```

Server组件还需要启动一个Socket来监听停止端口，所以才能通过shutdown命令关闭Tomcat。
上面Catalina的启动方法最后一行代码就是调用Server#await。

在await方法里会创建一个Socket监听8005端口，并在一个死循环里接收Socket上的连接请求，如果有新的连接到来就建立连接，然后从Socket中读取数据；如果读到的数据是停止命令“SHUTDOWN”，就退出循环，进入stop流程。

# Service组件
Service组件的具体实现类StandardService
```java
public class StandardService extends LifecycleBase implements Service {
    //名字
    private String name = null;
    
    //Server实例
    private Server server = null;

    //连接器数组
    protected Connector connectors[] = new Connector[0];
    private final Object connectorsLock = new Object();

    //对应的Engine容器
    private Engine engine = null;
    
    //映射器及其监听器
    protected final Mapper mapper = new Mapper();
    protected final MapperListener mapperListener = new MapperListener(this);
```

StandardService继承了LifecycleBase抽象类，此外StandardService中还有一些我们熟悉的组件，比如Server、Connector、Engine和Mapper。

Tomcat支持热部署，当Web应用的部署发生变化，Mapper中的映射信息也要跟着变化，MapperListener就是监听器，监听容器的变化，并把信息更新到Mapper。

## Service启动方法
```java
protected void startInternal() throws LifecycleException {

    // 1. 触发启动监听器
    setState(LifecycleState.STARTING);

    // 2. 先启动Engine，Engine会启动它子容器
    if (engine != null) {
        synchronized (engine) {
            engine.start();
        }
    }
    
    // 3. 再启动Mapper监听器
    mapperListener.start();

    // 4.最后启动连接器，连接器会启动它子组件，比如Endpoint
    synchronized (connectorsLock) {
        for (Connector connector: connectors) {
            if (connector.getState() != LifecycleState.FAILED) {
                connector.start();
            }
        }
    }
}
```
Service先后启动Engine、Mapper监听器、连接器。
内层组件启动好了才能对外提供服务，才能启动外层的连接器组件。而Mapper也依赖容器组件，容器组件启动好了才能监听它们的变化，因此Mapper和MapperListener在容器组件之后启动。
# Engine组件
最后我们再来看看顶层的容器组件Engine具体是如何实现的。Engine本质是一个容器，因此它继承了ContainerBase基类，并且实现了Engine接口。

```java
public class StandardEngine extends ContainerBase implements Engine {
}
```
Engine的子容器是Host，所以它持有了一个Host容器的数组，这些功能都被抽象到了ContainerBase，ContainerBase中有这样一个数据结构：
```java
protected final HashMap<String, Container> children = new HashMap<>();
```
ContainerBase用HashMap保存了它的子容器，并且ContainerBase还实现了子容器的“增删改查”，甚至连子组件的启动和停止都提供了默认实现，比如ContainerBase会用专门的线程池来启动子容器。
```java
for (int i = 0; i < children.length; i++) {
   results.add(startStopExecutor.submit(new StartChild(children[i])));
}
```
所以Engine在启动Host子容器时就直接重用了这个方法。
## Engine自己做了什么？
容器组件最重要的功能是处理请求，而Engine容器对请求的“处理”，其实就是把请求转发给某一个Host子容器来处理，具体是通过Valve来实现的。

每个容器组件都有一个Pipeline，而Pipeline中有一个基础阀（Basic Valve）。
Engine容器的基础阀定义如下：

```java
final class StandardEngineValve extends ValveBase {

    public final void invoke(Request request, Response response)
      throws IOException, ServletException {
  
      // 拿到请求中的Host容器
      Host host = request.getHost();
      if (host == null) {
          return;
      }
  
      // 调用Host容器中的Pipeline中的第一个Valve
      host.getPipeline().getFirst().invoke(request, response);
  }
  
}
```
把请求转发到Host容器。
处理请求的Host容器对象是从请求中拿到的，请求对象中怎么会有Host容器？
因为请求到达Engine容器前，Mapper组件已对请求进行路由处理，Mapper组件通过请求URL定位了相应的容器，并且把容器对象保存到请求对象。

所以当我们在设计这样的组件时，需考虑：
- 用合适的数据结构来保存子组件，比如
Server用数组来保存Service组件，并且采取动态扩容的方式，这是因为数组结构简单，占用内存小
ContainerBase用HashMap来保存子容器，虽然Map占用内存会多一点，但是可以通过Map来快速的查找子容器
- 根据子组件依赖关系来决定它们的启动和停止顺序，以及如何优雅的停止，防止异常情况下的资源泄漏。

# 总结
- Server 组件, 实现类 StandServer
- 继承了 LifeCycleBase
- 子组件是 Service, 需要管理其生命周期(调用其 LifeCycle 的方法), 用数组保存多个 Service 组件, 动态扩容数组来添加组件
- 启动一个 socket Listen停止端口, Catalina 启动时, 调用 Server await 方法, 其创建 socket Listen 8005 端口, 并在死循环中等连接, 检查到 shutdown 命令, 调用 stop 方法
- Service 组件, 实现类 StandService
- 包含 Server, Connector, Engine 和 Mapper 组件的成员变量
- 还包含 MapperListener 成员变量, 以支持热部署, 其Listen容器变化, 并更新 Mapper, 是观察者模式
- 需注意各组件启动顺序, 根据其依赖关系确定
- 先启动 Engine, 再启动 Mapper Listener, 最后启动连接器, 而停止顺序相反.
- Engine 组件, 实现类 StandEngine 继承 ContainerBase
- ContainerBase 实现了维护子组件的逻辑, 用 HaspMap 保存子组件, 因此各层容器可重用逻辑
- ContainerBase 用专门线程池启动子容器, 并负责子组件启动/停止, "增删改查"
- 请求到达 Engine 之前, Mapper 通过 URL 定位了容器, 并存入 Request 中. Engine 从 Request 取出 Host 子容器, 并调用其 pipeline 的第一个 valve