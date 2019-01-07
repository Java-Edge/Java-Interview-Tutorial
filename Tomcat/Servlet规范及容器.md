# 1 遥远的CGI
实现Web动态内容的技术，最早使用的是CGI（Common Gateway Interface，通用网关接口）技术，根据用户输入的请求动态地传送HTML数据。
CGI并不是开发语言，而只是能够利用为它编写的程序来实现Web服务器的一种协议。
可用来实现电子商务网站、搜索引擎处理和在线登记等功能。当用户在Web页面中提交输入的数据时，Web浏览器就会将用户输入的数据发送到Web服务器上。在服务器上，CGI程序对输入的数据进行格式化，并将这个信息发送给数据库或服务器上运行的其他程序，然后将结果返回给Web服务器。最后，Web服务器将结果发送给Web浏览器，这些结果有时使用新的Web页面显示，有时在当前Web页面中显示。

编写自定义CGI脚本需要相当多的编程技巧，多数CGI脚本是由Perl,Java,C和C++等语言编写的，服务器上通常很少运行用JavaScript编写的服务器脚本，不管使用何种语言，Web页面设计者都需要控制服务器，包括所需要的后台程序（如数据库），这些后台程序提供结果或来自用户的消息。即使拥有基于服务器的网站设计工具，编写CGI程序也要求程序设计者有一定的经验。

由于每一次对于动态内容的请求都需要启动一个新的CGI程序，因而会增加Web服务器的负担，所以CGI的一个很大缺陷是容易影响Web服务器的运行速度。
## 脚本编程
由于CGI程序与HTML文档需要分开编写、分开运行，要将两者融合在一起并不容易，因此，CGI程序的维护与编写比较困难。为了解决这一问题，一些厂商推出了脚本语言来增强网页开发功能。

脚本语言是一种文本型编程语言，可嵌入到HTML文档中。脚本语言分客户端和服务器端两种类型，分别在Web浏览器和Web服务器中运行。

客户端脚本语言主要有JavaScript、Jscript（Microsoft公司的JavaSCript版本）和VBscript等。当Web浏览器需要浏览使用客户端脚本语言编写的Web页面时，Web服务器将客户端脚本连同Web页面一起传送到Web浏览器，Web浏览器同时显示HTML的显示效果和客户端脚本的运行效果， 客户端脚本可减轻Web服务器的处理负担，提高Web页面的响应速度。

服务器端脚本语言主要有ASP，JSP，PHP和LiveWire等。当Web浏览器需要浏览使用服务器端脚本语言编写的Web页面时，Web服务器运行Web页面中的服务器端脚本，将由脚本语言的运行结果与Web页面的HTML部分生成的新的Web页面传送到Web浏览器，Web浏览器显示生成的新的Web页面， 服务器端脚本可减少不同Web浏览器的运行差异，提高Web页面的实用性。

这期间，Java 的 Servlet模型也就诞生了。
# 2 Servlet
一种基于Java技术的Web组件，用于生成动态内容，由容器管理。类似于其它Java技术组件，Servlet 是平台无关的Java类组成，并且由Java Web服务器加载执行。

通常由Servlet容器提供运行时环境。Servlet 容器，有时候也称作为Servlet引擎，作为Web服务器或应用服务器的一部分 。通过请求和响应对话，提供Web客户端与Servlets 交互的能力。容器管理Servlets实例以及它们的生命周期。

## 主要版本
![](https://img-blog.csdnimg.cn/9bdc4d3780174fe6a963291dfea900bb.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
## 核心组件
|核心组件 API|说明  | 起始版本| Spring framework 代表实现 |
|--|--|--|--|
|javax. servlet .Servlet  |  动态内容组件|  1.0| DispatcherServlet|
|javax. servlet .Filter  |  Servlet过滤器| 2.3| CharacterEncodingFilter|
|javax. servlet .ServletContext  |  Servlet应用上下文| | |
|javax. servlet .AsyncContext  |  异步上下文|3.0 | 无|
|javax. servlet .ServletContextistener  |  ServletContext生命周期监听器| 2.3 | ContextLoaderListener   |
|javax . servlet . ServletRequestlistener  |  ServletRequest生命周期监听器| 2.3 | RequestContextListener |
|javax. servlet .http.HttpSessionListener  | 生命周期监听器|  2.3|   HttpSessionMutexListener |
|javax. servlet .Asynclistener  | 异步上下文监听器|  3.0|  StandardServletAsyncWebRequest  |
|javax. servlet .ServletContainerInitializer  | Servlet容器初始化器|3.0  |  SpringServletContainerInitializer  |


浏览器发给服务端的是一个HTTP请求，HTTP服务器收到请求后，需调用服务端程序处理请求。

> HTTP服务器怎么知道要调用哪个处理器方法？

最简单的就是在HTTP服务器代码写一堆if/else：若是A请求就调x类m1方法，若是B请求就调o类的m2方法。
这种设计的致命点在于HTTP服务器代码跟业务逻辑耦合，若你新增了业务方法，竟然还得改HTTP服务器代码。
**面向接口编程**算得上是解决耦合问题的银弹，我们可定义一个接口，各业务类都实现该接口，没错，他就是Servlet接口，实现了Servlet接口的业务类也叫作Servlet。

解决了业务逻辑和HTTP服务器的耦合问题，那又有问题了：对特定请求，HTTP服务器又如何知道：
- 哪个Servlet负责处理请求？
- 谁负责实例化Servlet？

显然HTTP服务器不适合负责这些，否则又要和业务逻辑耦合。

于是，诞生了Servlet容器。
# 3 Servlet容器
用于加载和管理业务类。

HTTP服务器不直接和业务类交互，而是把请求先交给Servlet容器，Servlet容器内部将请求转发到具体Servlet。
若该Servlet还没创建，就加载并实例化之，然后调用该Servlet的接口方法。

因此Servlet接口其实是Servlet容器跟具体业务类之间的接口：
![](https://img-blog.csdnimg.cn/20210716140239681.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
左：HTTP服务器直接调用具体业务类，但紧耦合。
右：HTTP服务器不直接调用业务类，而是把请求移交给容器，容器通过Servlet接口调用业务类。因此Servlet接口和Servlet容器，实现了HTTP服务器与业务类的解耦。

**Servlet接口和Servlet容器**这一整套规范叫作**Servlet规范**。Tomcat按Servlet规范要求实现了Servlet容器，又兼备HTTP服务器功能。
若实现新业务，只需实现一个Servlet，并把它注册到Tomcat（Servlet容器），剩下的事情就由Tomcat帮忙。
# 4  Servlet接口
Servlet接口定义了下面五个方法：
![](https://img-blog.csdnimg.cn/20210716140638840.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

具体业务类在service方法实现处理逻辑，入参这两个类是对通信协议的封装：
- ServletRequest
封装请求信息
- ServletResponse
封装响应信息

HTTP协议中的请求和响应就对应
- HttpServletRequest
获取所有请求相关的信息，包括请求路径、Cookie、HTTP头、请求参数等。还能创建和获取Session
- HttpServletResponse
封装HTTP响应

生命周期相关方法：
- init
Servlet容器在加载Servlet类的时候会调用，可能会在init方法里初始化一些资源。比如Spring MVC中的DispatcherServlet，就是在init方法里创建了自己的Spring容器。
- destroy
卸载时会调用，可能在destroy方法里释放这些资源

## ServletConfig
ServletConfig的作用就是封装Servlet的初始化参数。
可以在`web.xml`给Servlet配置参数，并在程序通过getServletConfig拿到这些参数。

有接口一般就有抽象类，抽象类用来实现接口和封装通用的逻辑，因此Servlet规范提供了GenericServlet抽象类，可以通过扩展它来实现Servlet。虽然Servlet规范并不在乎通信协议是什么，但是大多数的Servlet都是在HTTP环境中处理的，因此Servet规范还提供了HttpServlet来继承GenericServlet，并且加入了HTTP特性。这样我们通过继承HttpServlet类来实现自己的Servlet，只需要重写两个方法：doGet和doPost。
![](https://img-blog.csdnimg.cn/20210716162226262.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
# 5 Servlet容器
## 工作流程
当客户请求某个资源时
- HTTP服务器用ServletRequest对象封装客户的请求信息
- 然后调用Servlet容器的service方法
- Servlet容器拿到请求后，根据请求的URL和Servlet的映射关系，找到相应的Servlet
- 如果Servlet还没有被加载，就用反射创建该Servlet
- 调用Servlet的init方法来完成初始化
- 调用Servlet的service方法来处理请求
- 把ServletResponse对象返回给HTTP服务器，HTTP服务器会把响应发送给客户端

![](https://img-blog.csdnimg.cn/20210716165416791.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
## Web应用
Servlet容器会实例化和调用Servlet，那Servlet怎么注册到Servlet容器？

根据Servlet规范，Web应用程序有一定目录结构，放置了
- Servlet的类文件
- 配置文件
- 静态资源

Servlet容器通过读取配置文件，就能找到并加载Servlet。Web应用的大致目录结构：
```bash
| -  MyWebApp
      | -  WEB-INF/web.xml        -- 配置文件，用来配置Servlet等
      | -  WEB-INF/lib/           -- 存放Web应用所需各种JAR包
      | -  WEB-INF/classes/       -- 存放你的应用类，比如Servlet类
      | -  META-INF/              -- 目录存放工程的一些信息
```
# 6 ServletContext

> 定义了一系列servlet用于与其servlet容器通信的方法。如获取文件的 MIME 类型、调度请求或写入日志文件。
> 每个JVM的Web应用程序都有一个上下文。（Web 应用程序是安装在服务器 URL 名称空间（如
> `/catalog`）的特定子集下并可能通过 。war 文件安装的服务和内容的集合。如果在部署描述符中标
> 
> 分布式系统下，则每个机器节点都有一个上下文实例。在这种情况下，上下文不能用作共享全局信息的位置（因为信息不会是真正的全局的）。应该改用数据库等外部资源。ServletContext
> 对象包含在 ServletConfig 对象中，当服务器初始化时，Web 服务器会提供该对象。

Servlet规范定义了ServletContext接口对应一个Web应用。比如一个 SpringBoot 应用，那就只有一个ServletContext。
不要和 Spring 的 applicationContext 混为一谈，因为一个应用中，可以有多个Spring 的 applicationContext。

Web应用部署好后，Servlet容器在启动时会加载Web应用，并为每个Web应用创建一个全局的上下文环境ServletContext对象，为后面的Spring容器提供宿主环境。

可将**ServletContext**看做一个全局对象，一个Web应用可能有多个Servlet，这些Servlet可通过全局ServletContext共享数据：
- Web应用的初始化参数
- Web应用目录下的文件资源等

**ServletContext** 持有所有Servlet实例，所以也能实现Servlet请求的转发。

Tomcat&Jetty在启动过程中触发容器初始化事件，Spring的ContextLoaderListener会监听到这个事件，它的contextInitialized方法会被调用，在这个方法中，Spring会初始化全局的Spring根容器，这个就是Spring的IoC容器。
IoC容器初始化完毕后，Spring将其存储到**ServletContext**，便于以后获取。
![](https://img-blog.csdnimg.cn/20210716220353539.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
ServletContext就是用来共享数据的，比如SpringMVC需要从ServletContext拿到全局的Spring容器，把它设置成自己的父容器。

Tomcat&Jetty在启动过程中还会扫描Servlet，一个Web应用中的Servlet可以有多个，以SpringMVC中的DispatcherServlet为例，这个Servlet实际上是一个标准的前端控制器，用以转发、匹配、处理每个Servlet请求。

Servlet一般会延迟加载，当第一个请求达到时，Tomcat&Jetty发现DispatcherServlet还没有被实例化，就调用DispatcherServlet的init方法，DispatcherServlet在初始化的时候会建立自己的容器，叫做SpringMVC 容器，用来持有Spring MVC相关的Bean。同时，Spring MVC还会通过ServletContext拿到Spring根容器，并将Spring根容器设为SpringMVC容器的父容器，请注意，Spring MVC容器可以访问父容器中的Bean，但是父容器不能访问子容器的Bean， 也就是说Spring根容器不能访问SpringMVC容器里的Bean。说的通俗点就是，在Controller里可以访问Service对象，但是在Service里不可以访问Controller对象。
# 初始化工作
Tomcat/Jetty启动，对于每个WebApp，依次进行初始化工作：
1、对每个WebApp，都有一个WebApp ClassLoader，和一个ServletContext
2、ServletContext启动时，会扫描web.xml配置文件，找到Filter、Listener和Servlet配置

3、如果Listener中配有spring的ContextLoaderListener
3.1、ContextLoaderListener就会收到webapp的各种状态信息。
3.3、在ServletContext初始化时，ContextLoaderListener也就会将Spring IOC容器进行初始化，管理Spring相关的Bean。
3.4、ContextLoaderListener会将Spring IOC容器存放到ServletContext中

4、如果Servlet中配有SpringMVC的DispatcherServlet
4.1、DispatcherServlet初始化时（其一次请求到达）。
4.2、其中，DispatcherServlet会初始化自己的SpringMVC容器，用来管理Spring MVC相关的Bean。
4.3、SpringMVC容器可以通过ServletContext获取Spring容器，并将Spring容器设置为自己的根容器。而子容器可以访问父容器，从而在Controller里可以访问Service对象，但是在Service里不可以访问Controller对象。
4.2、初始化完毕后，DispatcherServlet开始处理MVC中的请求映射关系。

Servlet默认单例模式，Spring的Bean默认也是单例模式，则Spring MVC是如何处理并发请求？
DispatcherServlet中的成员变量都是初始化好后就不会被改变了，所以是线程安全的，那“可见性”怎么保证呢？
由Web容器比如Tomcat保证，Tomcat在调用Servlet的init方法时，用synchronized。

- 若还没有至少一个已初始化的实例，则加载并初始化该 servlet 的一个实例。 例如，这可用于加载deployment descriptor中标记为在服务器启动时加载的 servlet。
实现说明：类名以`org.apache.catalina.`开头的 Servlet org.apache.catalina. （所谓的 servlet容器）由加载此类的同一类加载器加载，而非由当前 Web 应用程序的类加载器加载。 这使此类可以访问 Catalina 内部结构，而对于为 Web 应用程序加载的类，这种访问权限是被阻止的
![](https://img-blog.csdnimg.cn/20210716204054195.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210716210859693.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210716210934704.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
# 扩展机制
引入了Servlet规范后，无需关心Socket网络通信、HTTP协议或你的业务类是如何被实例化和调用的，因为这些都被Servlet规范标准化了，我们只需关心怎么实现业务逻辑。

有规范看着很方便，但若规范不能满足你的个性需求，就没法用了，因此设计一个规范或者一个中间件，要充分考虑到可扩展性。
Servlet规范提供了两种扩展机制：Filter和Listener。
## Filter
过滤器，该接口允许你对请求和响应做一些统一的定制化处理。Filter是基于过程的，它是过程的一部分，是基于过程行为的。比如：
- 根据请求频率限制访问
- 根据地区不同修改响应内容

 过滤器是 Servlet 的重要标准之一:
- 请求和响应的统一处理
- 访问日志记录
- 请求权限审核
 ......
都发挥重要作用

### 工作原理
Web应用部署完成后，Servlet容器需要实例化Filter并把Filter链接成一个FilterChain。当请求进来时，获取第一个Filter并调用doFilter方法，doFilter方法负责调用这个FilterChain中的下一个Filter。

## Listener
监听器，Listener是基于状态的，任何行为改变同一个状态，触发的事件是一致的。当Web应用在Servlet容器中运行时，Servlet容器内部会不断的发生各种事件，如Web应用的启动和停止、用户请求到达等。 Servlet容器提供了一些默认的监听器来监听这些事件，当事件发生时，Servlet容器会负责调用监听器的方法。当然，你可以定义自己的监听器去监听你感兴趣的事件，将监听器配置在web.xml中。比如Spring就实现了自己的监听器，来监听ServletContext的启动事件，目的是当Servlet容器启动时，创建并初始化全局的Spring容器。

# X  FAQ
**service方法为什么把request和response都当作输入参数，而不是输入参数只有request，response放到返回值里呢？**
方便责任链模式下层层传递。

在SpringBoot项目中，为什么没有web.xml了？
SpringBoot是以嵌入式的方式来启动Tomcat。对于SpringBoot来说，Tomcat只是个JAR包。SpringBoot通过Servlet3.0规范中 **@WebServlet** 注解或者API直接向Servlet容器添加Servlet，无需web.xml。

## 分不清的xxx容器
### Servlet容器
用于管理Servlet生命周期。
### SpringMVC容器
管理SpringMVC Bean生命周期。
### Spring容器
用于管理Spring Bean生命周期。包含许多子容器，其中SpringMVC容器就是其中常用的，DispatcherServlet就是SpringMVC容器中的servlet接口，也是SpringMVC容器的核心类。

Spring容器主要用于整个Web应用程序需要共享的一些组件，比如DAO、数据库的ConnectionFactory等，SpringMVC容器主要用于和该Servlet相关的一些组件，比如Controller、ViewResovler等。
至此就清楚了Spring容器内部的关系。

**Spring和SpringMVC分别有自己的IOC容器或上下文，为何分成俩容器？** 
隔离管理的Bean，各管各的，职责明确。SpringMVC的容器直接管理跟DispatcherServlet相关的Bean，也就是Controller，ViewResolver等，并且SpringMVC容器是在DispacherServlet的init方法里创建的。而Spring容器管理其他的Bean比如Service和DAO。

并且SpringMVC容器是Spring容器的子容器，所谓的父子关系意味着什么呢，就是你通过子容器去拿某个Bean时，子容器先在自己管理的Bean中去找这个Bean，如果找不到再到父容器中找。但是父容器不能到子容器中去找某个Bean。

其实这个套路跟JVM的类加载器设计有点像，不同的类加载器也为了隔离，不过加载顺序是反的，子加载器总是先委托父加载器去加载某个类，加载不到再自己来加载。

并且通过父子关系，使得SpringMVC容器可以从父亲Spring容器那里拿Bean，因为Spring容器管理的是公共的Bean。
当然可以用同一个容器来管理，SpringBoot就是这样做的。

Spring和SpringMVC是通过配置文件来明确指定各自管理的Bean。

**Servlet容器跟Spring容器又有什么关系呢？**
有人说spring容器是servlet容器的子容器，但是这个servlet容器到底是tomcat实现的容器呢，还是jetty实现的容器呢？所以spring容器与servlet容器他们之间并没有直接的血缘关系，可以说spring容器依赖了servlet容器，spring容器的实现遵循了Servlet 规范。

spring容器只是servlet容器上下文(ServletContext)的一个属性，web容器启动时通过ServletContextListener机制构建出来。SpringBoot中只有一个Spring上下文：

```bash
org.springframework.boot.web.servlet.context.AnnotationConfigServletWebServerApplicationContext
```

![](https://img-blog.csdnimg.cn/20210716201457871.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)servlet容器初始化成功后被spring监听，创建spring容器放入servlet容器中，访问到达，初始化dispatcher servlet时创建springmvc容器，通过servletContext拿到spring容器，并将其作为自己的父容器，spring mvc容器会定义controller相关的bean,spring会定义业务逻辑相关的bean。


> 参考
> - https://blog.csdn.net/zhanglf02/article/details/89791797
> - https://docs.oracle.com/cd/E19146-01/819-2634/abxbh/index.html
> - https://matthung0807.blogspot.com/2020/09/tomcat-how-servlet-construct.html
> - https://github.com/heroku/devcenter-embedded-tomcat
> - https://biang.io/blog/mixed/cgi