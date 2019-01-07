# 1 概述
当你想使用 JNDI 查询定位各种服务时，便可考虑该模式。
由于为某个服务查找 JNDI 的代价很高，服务定位器模式（后文简称为 SLP）充分利用了缓存技术。在首次请求某服务时，服务定位器在 JNDI 中查找服务，并缓存该服务对象。当再次请求相同服务时，服务定位器会在它的缓存中查找，便可极大提高应用程序的性能。

# 2 构成
- 服务（Service） 
实际处理请求的服务。对该服务的引用可在 JNDI 服务器中查到
- Context / 初始的 Context
JNDI Context 带有对要查找的服务的引用
- 服务定位器（Service Locator） 
服务定位器是通过 JNDI 查找和缓存服务来获取服务的单点接触
- 缓存（Cache） 
缓存存储服务的引用，以便复用它们
- 客户端（Client） 
Client 是通过 ServiceLocator 调用服务的对象。

# 3 示例
- UML 图设计
![](https://img-blog.csdnimg.cn/20200815022746580.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)


我们将创建 ServiceLocator、InitialContext、Cache、Service 作为表示实体的各种对象。Service1 和 Service2 表示实体服务。

ServiceLocatorPatternDemo，我们的演示类在这里是作为一个客户端，将使用 ServiceLocator 来演示服务定位器设计模式。

服务定位器模式的 UML 图

## 3.1 服务接口Service
![](https://img-blog.csdnimg.cn/20200815022826979.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

## 3.2 实体服务
![](https://img-blog.csdnimg.cn/20200815022921998.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
![](https://img-blog.csdnimg.cn/20200815023002337.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

前两主要表现接口之间的多态性，指定行为方式。

## 3.3 为 JNDI 查询创建 InitialContext
- 工厂模式的应用，通过类名确定要实例化的对象。
![](https://img-blog.csdnimg.cn/20200815023108959.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

## 3.4 创建缓存 Cache
-  对实体类集合进行操作，主要是在集合中 获取/添加 实体类对象。
![](https://img-blog.csdnimg.cn/20200815023215564.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

## 3.5 创建服务定位器
- 使用步骤3来创建实例，使用步骤4来添加到集合，或者从集合中获取。（缓存中没有才会创建） 
![](https://img-blog.csdnimg.cn/20200815023254180.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

## 3.6 测试
使用 ServiceLocator 来演示服务定位器设计模式。
调用步骤5得到实体类，并执行实体类的方法。
![](https://img-blog.csdnimg.cn/20200815023358115.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)


- 完整源码案例请上号：
https://github.com/Wasabi1234/Java-DesignPatterns-Tuitorial/tree/master/src/main/java/com/javaedge/design/pattern/javaee/servicelocator



![](https://img-blog.csdnimg.cn/20200815233520523.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

