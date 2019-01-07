# 1 Tomcat 核心功能
- 处理Socket连接，负责网络字节流与Request和Response对象的转化
因此Tomcat设计了连接器（Connector），负责对外交流
- 加载和管理Servlet，以及具体处理Request请求
设计了容器（Container），负责内部处理

# 2 Tomcat支持的I/O模型
- NIO
非阻塞I/O，采用Java NIO类库实现。
- NIO.2
异步I/O，采用JDK 7最新的NIO.2类库实现。
- APR
采用Apache可移植运行库实现，是C/C++编写的本地库

![](https://img-blog.csdnimg.cn/d562828da21147818236f6e2d2bbc8d2.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
# 3 Tomcat支持的应用层协议
- HTTP/1.1
大部分Web应用采用的访问协议。
- AJP
用于和Web服务器集成（如Apache）。
- HTTP/2
HTTP 2.0大幅度的提升了Web性能。
# 4 Service
Tomcat为 **支持多种I/O模型和应用层协议**，一个容器可能对接多个连接器。
但单独的连接器或容器都无法对外提供服务，需**组装**才能正常协作，而组装后的整体，就称为Service组件。所以，Service并不神奇，只是在连接器和容器外面多包了一层，把它们组装在一起。

Tomcat内可能有多个Service，在Tomcat中配置多个Service，可实现通过不同端口号访问同一台机器上部署的不同应用。
![](https://img-blog.csdnimg.cn/94069010a40243b3b33fc96ae5f0f3d5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
最顶层是Server（即一个Tomcat实例）。一个Server中有一或多个Service，一个Service中有多个连接器和一个容器。

连接器与容器之间通过标准的ServletRequest/ServletResponse通信。
# 5 连接器架构
连接器对Servlet容器屏蔽了 **协议及I/O模型的区别**，处理Socket通信和应用层协议的解析，得到Servlet请求。
所以无论是HTTP、AJP，最终在容器中获取到的都是标准ServletRequest对象。

## 5.1 功能需求
- 监听网络端口
- 接受网络连接请求
- 读取网络请求字节流
- 根据具体应用层协议（HTTP/AJP）解析字节流，生成统一的Tomcat Request对象
- 将Tomcat Request对象转成标准的ServletRequest
- 调用Servlet容器，得到ServletResponse
- 将ServletResponse转成Tomcat Response对象
- 将Tomcat Response转成网络字节流
- 将响应字节流写回给浏览器。

那它应该有哪些子模块呢？
优秀的模块化设计应该考虑高内聚、低耦合。连接器需完成如下高内聚功能：
- 网络通信
- 应用层协议解析
- Tomcat Request/Response与ServletRequest/ServletResponse的转化

因此Tomcat设计3个组件实现这3功能：Endpoint、Processor和Adapter。

组件间通过抽象接口交互，以封装变化：将系统中经常变化的部分和稳定的部分隔离，有助于增加复用性，并降低系统耦合度。

不管网络通信I/O模型、应用层协议、浏览器端发送的请求信息如何变化，但整体处理逻辑不变：
- Endpoint
提供字节流给Processor
- Processor
提供Tomcat Request对象给Adapter
- Adapter
提供ServletRequest对象给容器

若要支持新的I/O方案、新的应用层协议，只需要实现相关具体子类，而上层通用处理逻辑不变。

由于I/O模型和应用层协议可自由组合，比如NIO + HTTP或者NIO.2 + AJP。Tomcat将网络通信和应用层协议解析放在一起考虑，设计了ProtocolHandler接口，封装这两种变化点。
## 5.2 ProtocolHandler
各种协议和通信模型的组合有相应的具体实现类，如：
![](https://img-blog.csdnimg.cn/20210717231048532.png)
![](https://img-blog.csdnimg.cn/20210717231106745.png)
![](https://img-blog.csdnimg.cn/20210717231144614.png)
Tomcat设计了一系列抽象基类封装稳定部分，抽象基类AbstractProtocol实现了ProtocolHandler接口。
每种应用层协议有自己的抽象基类，如AbstractAjpProtocol、AbstractHttp11Protocol，具体协议实现类扩展了协议层抽象基类。
![](https://img-blog.csdnimg.cn/20210717232129435.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
如此设计，尽量地将稳定的部分放到抽象基类，同时每一种I/O模型和协议的组合都有相应的具体实现类，我们在使用时可以自由选择。

**Endpoint和Processor放在一起抽象成了ProtocolHandler组件**：
![](https://img-blog.csdnimg.cn/8005f739f3f442b28ed568395af2435e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
连接器用ProtocolHandler处理网络连接、应用层协议，包含如下重要部件
### 5.2.1 Endpoint
通信端点，即通信监听的接口，是具体的Socket接收和发送处理器，是对传输层的抽象，因此Endpoint用来实现TCP/IP协议。

Endpoint是一个接口，对应的抽象实现类是AbstractEndpoint，而AbstractEndpoint的具体子类，比如在NioEndpoint和Nio2Endpoint中，有两个重要的子组件：Acceptor和SocketProcessor。
#### Acceptor
用于监听Socket连接请求。SocketProcessor用于处理接收到的Socket请求，它实现Runnable接口，在run方法里调用协议处理组件Processor进行处理。

为了提高处理能力，SocketProcessor被提交到线程池来执行。而这个线程池叫作执行器（Executor)。
###  5.2.2 Processor
Processor用来实现应用层的HTTP协议，接收来自Endpoint的Socket，读取字节流解析成Tomcat Request和Response对象，并通过Adapter将其提交到容器处理。

Processor是一个接口，定义了请求的处理等方法。它的抽象实现类AbstractProcessor对一些协议共有的属性进行封装，没有对方法进行实现。具体的实现有AjpProcessor、Http11Processor等，这些具体实现类实现了特定协议的解析方法和请求处理方式。

连接器的组件图：
![](https://img-blog.csdnimg.cn/8180c30045194e29b5c1d1ef500fa9a9.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
Endpoint接收到Socket连接后，生成一个SocketProcessor任务提交到线程池处理，SocketProcessor的run方法会调用Processor组件去解析应用层协议，Processor通过解析生成Request对象后，会调用Adapter的Service方法。

一个连接器对应一个监听端口，比如一扇门，一个web应用是一个业务部门，进了这个门后你可以到各个业务部门去办事。
Tomcat配置的并发数是endpoint里那个线程池。
###  5.2.3 Adapter
由于协议不同，客户端发过来的请求信息也不尽相同，Tomcat定义了自己的Request类来“存放”这些请求信息。
ProtocolHandler接口负责解析请求并生成Tomcat Request类，但这个Request对象不是标准ServletRequest，不能用Tomcat Request作为参数调用容器。

于是Tomcat引入CoyoteAdapter，连接器调用CoyoteAdapter的sevice方法，传入Tomcat Request对象，CoyoteAdapter负责将Tomcat Request转成ServletRequest，再调用容器的service方法。

连接器用ProtocolHandler接口来封装通信协议和I/O模型的差异，ProtocolHandler内部又分为Endpoint和Processor模块，Endpoint负责底层Socket通信，Processor负责应用层协议解析。连接器通过适配器Adapter调用容器。

**为什么要多一层adapter？**
在processor直接转换为容器的servletrequest和servletresponse是否更好，为何先转化为Tomcat的request和response，再用adapter做一层转换消耗性能？
若连接器直接创建ServletRequest、ServletResponse，就和Servlet协议耦合，连接器尽量保持独立性，它不一定要跟Servlet容器工作。
对象转化的性能消耗还是比较少的，Tomcat对HTTP请求体采取了延迟解析策略，即TomcatRequest对象转化成ServletRequest时，请求体的内容都还没读取，直到容器处理这个请求的时候才读取。

Adapter一层使用的是适配器设计模式，好处是当容器版本升级只修改Adaper组件适配到新版本容器就可以了，protocal handler组件代码不需要改动。
# 6 Tomcat V.S Netty 
**为何Netty常用做底层通讯模块，而Tomcat作为web容器？**
可将Netty理解成Tomcat中的连接器，都负责网络通信、利用了NIO。但Netty素以高性能高并发著称，为何Tomcat不直接将连接器替换成Netty？
- Tomcat的连接器性能已经足够好了，同样是Java NIO编程，底层原理类似
- Tomcat做为Web容器，需考虑Servlet规范，Servlet规范规定了对HTTP Body的读写是阻塞的，因此即使用到Netty，也不能充分发挥其优势。所以Netty一般用在非HTTP协议/Servlet场景。