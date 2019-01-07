- 这三者都是web server，那他们各自有什么特点呢？
- 他们之间的区别是什么呢？
- nginx 和 tomcat在性能上面有何异同?
- tomcat用在java后台程序上，java后台程序难道不能用apache和nginx吗？

Apache HTTP Server Project、Nginx都是开源的HTTP服务器软件。

HTTP服务器本质上也是一种应用程序——它通常运行在服务器之上，绑定服务器的IP地址并监听某一个TCP端口来接收并处理HTTP请求，这样客户端（如Firefox，Chrome这样的浏览器）就能通过HTTP协议获取服务器上的网页（HTML格式）、文档（PDF格式）、音频（MP4格式）、视频（MOV格式）等资源。

下图描述的就是这一过程：
![](https://img-blog.csdnimg.cn/20210628155422614.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
不仅仅是Apache HTTP Server和Nginx，编程语言比如 Java的类库中也实现了简单的HTTP服务器方便开发者使用：
- HttpServer (Java HTTP Server )

使用这些类库能够非常容易的运行一个HTTP服务器，它们都能够通过绑定IP地址并监听tcp端口来提供HTTP服务。

Apache Tomcat与Apache HTTP Server相比，Tomcat能够动态生成资源并返回到客户端。Apache HTTP Server和Nginx都能够将某一文本文件内容通过HTTP协议返回到客户端，但该文本文件的内容固定——即无论何时、任何人访问它得到的内容都完全相同，这就是`静态资源`。

动态资源则在不同时间、客户端访问得到的内容不同，例如：
- 包含显示当前时间的页面
- 显示当前IP地址的页面

Apache HTTP Server和Nginx本身不支持生成动态页面，但它们可以通过其他模块来支持（例如通过Shell、PHP、Python脚本程序来动态生成内容）。若想要使用Java程序动态生成资源内容，使用这一类HTTP服务器很难做到。Java Servlet以及衍生的JSP可以让Java程序也具有处理HTTP请求并且返回内容（由程序动态控制）的能力，Tomcat正是支持运行Servlet/JSP应用程序的容器（Container）：
![](https://img-blog.csdnimg.cn/2021062816011444.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
Tomcat运行在JVM之上，和HTTP服务器一样，绑定IP地址并监听TCP端口，同时还包含如下职责：
- 管理Servlet程序的生命周期
- 将URL映射到指定Servlet进行处理
- 与Servlet程序合作处理HTTP请求
根据HTTP请求生成HttpServletRequest对象并传递给Servlet进行处理，将Servlet中的HttpServletResponse对象生成的内容返回给浏览器

虽然Tomcat也可以认为是HTTP服务器，但通常它仍然会和Nginx配合在一起使用：
- 动静态资源分离
运用Nginx的反向代理功能分发请求：所有动态资源的请求交给Tomcat，而静态资源的请求（例如图片、视频、CSS、JavaScript文件等）则直接由Nginx返回到浏览器，大大减轻Tomcat压力
- 负载均衡
当业务压力增大时，可能一个Tomcat的实例不足以处理，那么这时可以启动多个Tomcat实例进行水平扩展，而Nginx的负载均衡功能可以把请求通过算法分发到各个不同的实例进行处理