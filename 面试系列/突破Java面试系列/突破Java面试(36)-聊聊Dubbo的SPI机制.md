# 1 面试题

Dubbo中的SPI是什么？

# 2 考点分析

前面基础性的东西问完了，确定你应该了解Dubbo，那么自然问个稍微难的问题，就是SPI，先问问你这是个啥,然后问问你怎么实现的!

其实就是看看你对dubbo的掌握如何

# 3 SPI简介

SPI 全称为 Service Provider Interface，是一种服务发现机制.

说白了是啥呢，比如你有个接口，该接口有3个实现类，那么在系统运行时,这个接口到底选择哪个实现类呢？这就需要SPI了，需要**根据指定的配置或者是默认的配置，找到对应的实现类加载进来，然后使用该实现类的实例**.

> 接口A => 实现A1，实现A2，实现A3
> 配置一下，接口A = 实现A2
> 在系统实际运行的时候，会加载你的配置，用实现A2实例化一个对象来提供服务

比如说你要通过jar包的方式给某个接口提供实现，然后你就在自己jar包的`META-INF/services/`目录下放一个接口同名文件，指定接口的实现是自己这个jar包里的某个类.

ok了，别人用了一个接口，然后用了你的jar包，就会在运行的时候通过你的jar包的那个文件找到这个接口该用哪个实现类.

这是JDK提供的一个功能.

比如你有个工程A，有个接口A，接口A在工程A是没有实现类的,那么问题来了,系统运行时,怎么给接口A选择一个实现类呢?

你可以自己搞一个jar包，`META-INF/services/`,放上一个文件,文件名即接口名，接口A，接口A的实现类=`com.javaedge.service.实现类A2`

让工程A来依赖你的jar包,然后在系统运行时,工程A跑起来,对于接口A,就会扫描依赖的jar包,看看有没有`META-INF/services`文件夹,如果有,看再看有没有名为接口A的文件,如果有,在里面找一下指定的接口A的实现是你的jar包里的哪个类!

# 4 适用场景

插件扩展的场景,比如你开发了一个开源框架，若你想让别人自己写个插件，安排到你的开源框架里中，扩展功能

## 4.1  Java中的SPI

经典的思想体现，其实大家平时都在用，比如说JDBC

Java定义了一套JDBC的接口，但是并没有提供其实现类

但实际上项目运行时,要使用JDBC接口的哪些实现类呢?

一般来说，我们要根据自己使用的数据库，比如

- MySQL,你就将`mysql-jdbc-connector.jar`
- oracle，你就将`oracle-jdbc-connector.jar`引入

系统运行时,碰到你使用JDBC的接口,就会在底层使用你引入的那个jar中提供的实现类

## 4.2 Dubbo中的SPI

Dubbo 并未使用 Java SPI，而是重新实现了一套功能更强的 SPI 机制。Dubbo SPI 的相关逻辑被封装在了 ExtensionLoader 类中，通过 ExtensionLoader，我们可以加载指定的实现类。Dubbo SPI 所需的配置文件需放置在 META-INF/dubbo 路径下，配置内容如下。

```
Protocol protocol = ExtensionLoader.getExtensionLoader(Protocol.class).getAdaptiveExtension();
```

Dubbo要判断一下，在系统运行时，应该选用这个Protocol接口的哪个实现类.

它会去找一个你配置的Protocol，将你配置的Protocol实现类，加载进JVM，将其实例化.

微内核，可插拔，大量的组件，Protocol负责RPC调用的东西，你可以实现自己的RPC调用组件，实现Protocol接口，给自己的一个实现类即可.

这行代码就是Dubbo里大量使用的，就是对很多组件，都是保留一个接口和多个实现，然后在系统运行的时候动态根据配置去找到对应的实现类。如果你没配置，那就走默认的实现好了,问题不大.

### 4.2.1 实例

```
@SPI("dubbo")  
public interface Protocol {  
      
    int getDefaultPort();  
  
    @Adaptive  
    <T> Exporter<T> export(Invoker<T> invoker) throws RpcException;  
  
    @Adaptive  
    <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException;  

    void destroy();  
}  
```

在Dubbo自己的jar里，在`/META_INF/dubbo/internal/com.alibaba.dubbo.rpc.Protocol`文件中:

```
dubbo=com.alibaba.dubbo.rpc.protocol.dubbo.DubboProtocol
http=com.alibaba.dubbo.rpc.protocol.http.HttpProtocol
hessian=com.alibaba.dubbo.rpc.protocol.hessian.HessianProtocol
```

这就可以看到Dubbo的SPI机制默认怎么玩的了,其实就是Protocol接口

- @SPI("dubbo")
通过SPI机制提供实现类，实现类是通过将`dubbo`作为默认key去配置文件里找到的，配置文件名称为接口全限定名，通过`dubbo`作为key可以找到默认的实现类`com.alibaba.dubbo.rpc.protocol.dubbo.DubboProtocol`

> Dubbo的默认网络通信协议，就是dubbo协议，用的DubboProtocol

若想要动态替换默认的实现类，需使用`@Adaptive`接口，Protocol接口中，有两个方法添加了`@Adaptive`注解，就是说那俩接口会被代理实现.

具体啥玩意儿呢?

比如这个Protocol接口搞了俩`@Adaptive`注解了方法，在运行时会针对Protocol生成代理类，该代理类的那俩方法中会有代理代码，代理代码会在运行时动态根据url中的protocol来获取key(默认是dubbo)，也可以自己指定，如果指定了别的key，那么就会获取别的实现类的实例.

通过这个url中的参数不同，就可以控制动态使用不同的组件实现类

# 5 扩展Dubbo组件

自己写个工程，可以打成jar包的那种哦

- 里面的`src/main/resources`目录下<dubbo:protocol name=”my” port=”20000” />这个时候provider启动的时候，就会加载到我们jar包里的`my=com.javaedge.MyProtocol`这行配置，接着会根据你的配置使用你定义好的MyProtocol了，这个就是简单说明一下，你通过上述方式，可以替换掉大量的dubbo内部的组件，就是扔个你自己的jar包，然后配置一下即可~
- 搞一个`META-INF/services`
- 里面放个文件叫：`com.alibaba.dubbo.rpc.Protocol`
- 文件里搞一个`my=com.javaedge.MyProtocol`
- 自己把jar弄到nexus私服
- 然后自己搞一个dubbo provider工程，在这个工程里面依赖你自己搞的那个jar
- 然后在spring配置文件里给个配置：
- Dubbo的SPI原理图
![](https://ask.qcloudimg.com/http-save/1752328/b7iaarse08.png)

Dubbo中提供了大量的类似上面的扩展点.

你要扩展一个东西，只需自己写个jar，让你的consumer或者是provider工程，依赖它，在你的jar里指定目录下配置好接口名称对应的文件，里面通过`key=实现类`然后对对应的组件，用类似`<dubbo:protocol>`用你的哪个key对应的实现类来实现某个接口，你可以自己去扩展dubbo的各种功能，提供你自己的实现!

# 参考

- 《Java工程师面试突击第1季-中华石杉老师》
- [Dubbo官方文档](https://dubbo.apache.org/zh-cn/docs/source_code_guide/)


# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](http://www.shishusheng.com)
## [Github](https://github.com/Wasabi1234)