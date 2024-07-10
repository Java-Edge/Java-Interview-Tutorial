# 04-Tomcat实现热部署、热加载原理解析

不重启系统，在系统运行过程中升级Web应用，有两种方案：

- 热加载
- 热部署

## 1 实现原理

都跟类加载机制有关。

### 1.1 热加载

Web容器启动一个后台线程，定期检测类文件变化。若有变化，重新加载类，在这过程不清空Session ，一般用在开发环境。

### 1.2 热部署

也由后台线程定时检测Web应用变化，但会重新加载整个Web应用。会清空Session，比热加载更干净、彻底，一般用在生产环境。

## 2 Tomcat实现热加载、热部署

Tomcat开启后台线程，使各层的容器组件都有机会完成一些周期性任务。

实际开发也需要执行一些周期性任务，如监控程序周期性拉取系统健康状态。

### 2.1 Tomcat后台线程

开启后台线程做周期性任务，Tomcat就是通过ScheduledThreadPoolExecutor线程池开启后台线程：

```java
backgroundProcessorFuture = Container.getService(this).getServer().getUtilityExecutor()
			               .scheduleWithFixedDelay(
			                // 要周期性执行的Runnable
			                new ContainerBackgroundProcessor(),
			                // 第一次执行延迟多久
			                backgroundProcessorDelay,
			                // 之后每次执行间隔多久
			                backgroundProcessorDelay,
			                // 时间单位
			                TimeUnit.SECONDS);
```

任务类ContainerBackgroundProcessor是ContainerBase的内部类，ContainerBase是所有容器组件的基类。

### 2.2 ContainerBackgroundProcessor

```java
protected class ContainerBackgroundProcessor implements Runnable {

    @Override
    public void run() {
        // 入参"宿主类"实例
        processChildren(ContainerBase.this);
    }

    protected void processChildren(Container container) {
        try {
            // 1. 当前容器的后台任务：定时任务，如热加载。此方法将在此容器的类加载上下文中调用
            container.backgroundProcess();
            
            // 2. 遍历所有子容器，递归调用processChildren
            // 这样当前容器的子孙都会被处理            
            Container[] children = container.findChildren();
            for (int i = 0; i < children.length; i++) {
	            // 容器基类有个变量叫做backgroundProcessorDelay
	            // 如果大于0，表明子容器有自己的后台线程
	            // 无需父容器来调用它的processChildren方法
                if (children[i].getBackgroundProcessorDelay() <= 0) {
                    processChildren(children[i]);
                }
            }
        } catch (Throwable t) { ... }
```

processChildren把“宿主类”，即ContainerBase的类实例当成参数传给了run方法。

processChildren就做两步：

- 调用当前容器的backgroundProcess方法
- 递归调用子孙的backgroundProcess方法

backgroundProcess是Container接口的方法，即所有类型的容器都可实现该方法，在这里完成需周期性执行的任务。

这样，只需在顶层容器Engine中启动一个后台线程，则该线程：

- 不但执行Engine容器的周期性任务
- 还会执行所有子容器的周期性任务

### 2.3 backgroundProcess方法

上述代码都是在基类ContainerBase实现，具体容器类需要做啥？

- 有周期性任务，就实现backgroundProcess
- 没有，则复用基类ContainerBase的方法

#### ContainerBase#backgroundProcess



```java
public void backgroundProcess() {

    // 1.执行容器中Cluster组件的周期性任务
    Cluster cluster = getClusterInternal();
    if (cluster != null) {
        cluster.backgroundProcess();
    }
    
    // 2.执行容器中Realm组件的周期性任务
    Realm realm = getRealmInternal();
    if (realm != null) {
        realm.backgroundProcess();
   }
   
   // 3.执行容器中Valve组件的周期性任务
    Valve current = pipeline.getFirst();
    while (current != null) {
       current.backgroundProcess();
       current = current.getNext();
    }
    
    // 4. 触发容器的"周期事件"，Host容器的监听器HostConfig就靠它来调用
    fireLifecycleEvent(Lifecycle.PERIODIC_EVENT, null);
}
```

不仅每个容器可有周期性任务，每个容器中的其他通用组件，如跟集群管理有关的Cluster组件、跟安全管理有关的Realm组件都可有自己的周期性任务。

容器之间链式调用通过Pipeline-Valve机制实现，容器中的Valve也可有周期性任务，且被ContainerBase统一处理。

在backgroundProcess方法的最后，触发容器的“周期事件”。

### 2.4 周期事件是啥？

跟生命周期事件一样，是一种扩展机制，可理解：又一段时间过去，容器还活着，你想做点啥吗？如你想做点啥，就创建一个监听器来监听这个“周期事件”，事件到了，我负责调用你的方法。

总之，有了ContainerBase中的后台线程和backgroundProcess方法，各子容器和通用组件再也无需各自弄个后台线程来处理周期性任务。

##  3 Tomcat热加载

有了ContainerBase的周期性任务处理“框架”，具体容器子类只需实现自己的周期性任务。Tomcat的热加载，就实现在Context容器。

### 3.1 Context#backgroundProcess

StandardContext实现类中：

```java
@Override
public void backgroundProcess() {

    if (!getState().isAvailable())
        return;

    // WebappLoader周期性检查
    // WEB-INF/classes、WEB-INF/lib 目录下的类文件是否有更新
    Loader loader = getLoader();
    if (loader != null) {
        loader.backgroundProcess();        
    }
    
    // Session管理器周期性检查是否有Session过期
    Manager manager = getManager();
    if (manager != null) {
        manager.backgroundProcess();
    }
    
    // 周期性检查静态资源是否有更新
    WebResourceRoot resources = getResources();
    if (resources != null) {
        resources.backgroundProcess();
    }
    super.backgroundProcess();
}
```

### WebappLoader咋实现热加载的？

调用了Context#reload：

- 停止和销毁Context容器及其所有子容器（Wrapper），即Wrapper里的Servlet实例也被销毁
- 停止和销毁Context容器关联的Listener和Filter
- 停止和销毁Context下的Pipeline和各种Valve
- 停止和销毁Context的类加载器，以及类加载器加载的类文件资源

启动Context容器，在这个过程中会重新创建前面四步被销毁的资源。
这过程中，类加载器发挥关键作用。一个Context容器对应一个类加载器，类加载器在销毁过程中，会把它加载的所有类全部销毁。Context容器启动过程中，会创建一个新的类加载器来加载新的类文件。

Context#reload里，并未调用Session管理器的destroy方法，即该Context关联的Session没有销毁。

Tomcat热加载默认关闭，需在conf目录下的context.xml文件中设置reloadable参数开启：

```xml
<Context reloadable="true"/>
```

## 4 Tomcat热部署

### 4.1 跟热加载的本质区别

热部署会重新部署Web应用，原Context对象会被整个被销毁，因此该Context所关联一切资源都会被销毁，包括Session。

### 4.2 Tomcat热部署由哪个容器实现？

不是由Context，因为热部署过程中Context容器被销毁了，所以就是Host，Context的父容器。

Host容器并未在backgroundProcess中实现周期性检测，而是通过监听器HostConfig实现。
HostConfig就是前面提到的“周期事件”的监听器，“周期事件”达到时，HostConfig会做什么呢？

```java
public void lifecycleEvent(LifecycleEvent event) {
    // 执行check
    if (event.getType().equals(Lifecycle.PERIODIC_EVENT)) {
        check();
    } 
}
```

```java
protected void check() {

    if (host.getAutoDeploy()) {
        // 检查这个Host下所有已经部署的Web应用
        DeployedApplication[] apps =
            deployed.values().toArray(new DeployedApplication[0]);
            
        for (int i = 0; i < apps.length; i++) {
            //检查Web应用目录是否有变化
            checkResources(apps[i], false);
        }

        // 执行部署
        deployApps();
    }
}
```

HostConfig会检查webapps目录下的所有Web应用：

- 如果原来Web应用目录被删掉了，就把相应Context容器整个销毁掉
- 是否有新的Web应用目录放进来了，或者有新的WAR包放进来了，就部署相应的Web应用

因此HostConfig做的事情都是比较“宏观”的，它不会去检查具体类文件或者资源文件是否有变化，而是检查Web应用目录级别变化。