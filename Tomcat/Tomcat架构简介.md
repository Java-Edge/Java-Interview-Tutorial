Tomcat除了能够支撑通常的web app外，其本身高度模块化的架构体系，也能带来最大限度的可扩展性。
目前tomcat版本已经衍生到tomcat9，但是主流的版本还是tomcat6。此系列架构体系介绍还是以tomcat6为蓝本。 
Tomcat是有一系列逻辑模块组织而成，这些模块主要包括: 

*   核心架构模块，例如Server，Service，engine，host和context及wrapper等
*   网络接口模块connector
*   log模块
*   session管理模块
*   jasper模块
*   naming模块
*   JMX模块
*   权限控制模块
*   ……

这些模块会在相关的文档里逐一描述，本篇文档以介绍核心架构模块为主。 

#1 核心架构模块说明
核心架构模块之间是层层包含关系。
例如可以说Service是Server的子组件，Server是Service的父组件。
在server.xml已经非常清晰的定义了这些组件之间的关系及配置。 
需要强调的是Service中配置了实际工作的Engine，同时配置了用来处理时间业务的线程组Executor（如果没有配置则用系统默认的WorkThread模式的线程组），以及处理网络socket的相关组件connector。详细情况如图所示。
![1:n代表一对多的关系；1:1代表一对一的关系](http://upload-images.jianshu.io/upload_images/4685968-926f64eb9064c15b.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
StandEngine, StandHost, StandContext及StandWrapper是容器，他们之间有互相的包含关系。例如，StandEngine是StandHost的父容器，StandHost是StandEngine的子容器。在StandService内还包含一个Executor及Connector。 
- Executor是线程池，它的具体实现是executor，这个不是必须的，如果没有配置，则使用自写的worker thread线程池 
- Connector是网络socket相关接口模块，它包含两个对象，ProtocolHandler及Adapter 
  *   ProtocolHandler是接收socket请求，并将其解析成HTTP请求对象，可以配置成nio模式或者传统io模式
  *   Adapter是处理HTTP请求对象，它就是从StandEngine的valve一直调用到StandWrapper的valve

#2 分层建模
一个服务器无非是接受HTTP request，然后处理，产生HTTP response通过原有连接返回给客户端。
那为什么会整出这么多的模块进行处理，这些模块是不是有些多余呢? 
其实这些模块各司其职，我们从底层`wrapper`开始，一直到顶层的`server`
通过这些描述，会发现这正是tomcat架构的高度模块化的体现。这些细分的模块，使得tomcat非常健壮，通过一些配置和模块定制化，可以很大限度的扩展tomcat。 
首先，我们以一个典型的页面访问为例，假设访问的URL是 
`http://www.mydomain.com/app/index.html` 
![详细情况](http://upload-images.jianshu.io/upload_images/4685968-2ffe3df65bb766fb.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
*   Wrapper封装了具体的访问资源 `index.html`
*   Context 封装了各个wrapper资源的集合 `app`
*   Host 封装了各个context资源的集合 `www.mydomain.com`

按照领域模型，这个典型的URL访问，可以解析出三层领域对象，他们之间互有隶属关系。这是最基本的建模。
从上面的分析可以看出，从`wrapper`到`host`层层递进，层层组合。
那么host 资源的集合是什么呢，就是上面所说的`engine`。
 如果说以上的三个容器可以看成是物理模型的封装，那么`engine`可以看成是一种逻辑的封装。 

有这套`engine`的支持，我们已经可以完成从`engine`到`host`到`context`再到某个特定wrapper的定位，然后进行业务逻辑的处理

先说线程池，这是典型的线程池的应用。首先从线程池中取出一个可用线程，来处理请求，这个组件就是`connector`。
它就像酒店的前台服务员登记客人信息办理入住一样，主要完成了HTTP消息的解析，根据tomcat内部的`mapping`规则，完成从`engine`到`host`到`context`再到某个特定`wrapper`的定位，进行业务处理，然后将返回结果返回。之后，此次处理结束，线程重新回到线程池中，为下一次请求提供服务。 

如果线程池中没有空闲线程，则请求被阻塞，直到有空闲线程进行处理，最多至阻塞超时。
线程池的实现有`executor`及`worker thread`(默认)

至此，可以说一个酒店有了前台接待，有了房间等硬件设施，就可以开始正式运营了。

那么把`engine`，处理线程池，`connector`封装在一起，形成了一个完整独立的处理单元，这就是`service`，就好比某个独立的酒店。 

通常，我们经常看见某某集团旗下酒店。也就是说，每个品牌有多个酒店同时运营。就好比tomcat中有多个`service`独自运行。那么这多个`service`的集合就是`server`，就好比是酒店所属的集团。 

#3 作用域
为什么要按层次分别封装一个对象呢？这主要是为了方便统一管理。
类似命名空间的概念，在不同层次的配置，其作用域不一样。
以tomcat自带的打印request与response消息的RequestDumperValve为例。这个valve的类路径
`org.apache.catalina.valves.RequestDumperValve`
valve机制是tomcat非常重要的处理逻辑的机制，会在相关文档里专门描述。 如果这个valve配置在server.xml的节点下，则其只打印出访问这个app(my)的request与response消息。 
```
<Host name="localhost" appBase="webapps"  
          unpackWARs="true" autoDeploy="true"  
          xmlValidation="false" xmlNamespaceAware="false">  
             <Context path="/my" docBase=" /usr/local/tomcat/backup/my" >  
                   <Valve className="org.apache.catalina.valves.RequestDumperValve"/>  
             </Context>  
             <Context path="/my2" docBase=" /usr/local/tomcat/backup/my" >  
             </Context>  
  </Host> 
``` 
若这个`valve`配置在`server.xml`节点下，则可以打印出访问这个`host`下两个`app`的`request`与`response`信息 
```
<Host name="localhost" appBase="webapps"  
                unpackWARs="true" autoDeploy="true"  
                xmlValidation="false" xmlNamespaceAware="false">  
                    <Valve className="org.apache.catalina.valves.RequestDumperValve"/>  
                    <Context path="/my" docBase=" /usr/local/tomcat/backup/my" >  
                    </Context>  
                    <Context path="/my2" docBase=" /usr/local/tomcat/backup/my" >   
                    </Context>  
  </Host> 
```
在这里贴一个默认的`server.xml`的配置，通过这些配置可以加深对tomcat核心架构分层模块的理解
```
<Server port="8005" shutdown="SHUTDOWN">  
         <Listener className="org.apache.catalina.core.AprLifecycleListener" SSLEngine="on" />  
         <Listener className="org.apache.catalina.core.JasperListener" />   
         <Listener className="org.apache.catalina.mbeans.ServerLifecycleListener" />  
         <Listener className="org.apache.catalina.mbeans.GlobalResourcesLifecycleListener" />  
         <GlobalNamingResources>  
              <Resource name="UserDatabase" auth="Container"  
                      type="org.apache.catalina.UserDatabase"  
                     description="User database that can be updated and saved"  
                     factory="org.apache.catalina.users.MemoryUserDatabaseFactory"  
                     pathname="conf/tomcat-users.xml" />   
          </GlobalNamingResources>  
          <Service name="Catalina">  
               <Executor name="tomcatThreadPool" namePrefix="catalina-exec-"   
                     maxThreads="150" minSpareThreads="4"/>  
               <Connector port="80" protocol="HTTP/1.1"   
                     connectionTimeout="20000"   
                     redirectPort="7443" />  
               <Connector port="7009" protocol="AJP/1.3" redirectPort="7443" />  
               <Engine name="Catalina" defaultHost="localhost">  
                    <Realm className="org.apache.catalina.realm.UserDatabaseRealm"  
                           resourceName="UserDatabase"/>  
                    <Host name="localhost" appBase="webapps"  
                           unpackWARs="true" autoDeploy="true"  
                           xmlValidation="false" xmlNamespaceAware="false">  
                           <Context path="/my" docBase="/usr/local/tomcat/backup/my" >  
                           </Context>   
                    </Host>   
                </Engine>  
            </Service>  
  </Server>  

```
至此，头脑中应该有tomcat整体架构的概念
