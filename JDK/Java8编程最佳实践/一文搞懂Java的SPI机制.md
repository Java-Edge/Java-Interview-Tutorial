# 1 简介
SPI，Service Provider Interface，一种服务发现机制。
![](https://img-blog.csdnimg.cn/7921efaa5683447cbb1bc6cf351c4332.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
有了SPI，即可实现服务接口与服务实现的解耦：
- 服务提供者（如 springboot starter）提供出 SPI 接口。身为服务提供者，在你无法形成绝对规范强制时，适度"放权" 比较明智，适当让客户端去自定义实现
- 客户端（普通的 springboot 项目）即可通过本地注册的形式，将实现类注册到服务端，轻松实现可插拔

## 缺点
- 不能按需加载。虽然 ServiceLoader 做了延迟加载，但是只能通过遍历的方式全部获取。如果其中某些实现类很耗时，而且你也不需要加载它，那么就形成了资源浪费
- 获取某个实现类的方式不够灵活，只能通过迭代器的形式获取

> Dubbo SPI 实现方式对以上两点进行了业务优化。

# 源码
![](https://img-blog.csdnimg.cn/339efe7e74764bbc91f8ea037c3f69a6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
应用程序通过迭代器接口获取对象实例，这里首先会判断 providers 对象中是否有实例对象：
- 有实例，那么就返回
- 没有，执行类的装载步骤，具体类装载实现如下：

LazyIterator#hasNextService 读取 META-INF/services 下的配置文件，获得所有能被实例化的类的名称，并完成 SPI 配置文件的解析


LazyIterator#nextService 负责实例化 hasNextService() 读到的实现类，并将实例化后的对象存放到 providers 集合中缓存

# 使用
如某接口有3个实现类，那系统运行时，该接口到底选择哪个实现类呢？
这时就需要SPI，**根据指定或默认配置，找到对应实现类，加载进来，然后使用该实现类实例**。

如下系统运行时，加载配置，用实现A2实例化一个对象来提供服务：
![](https://img-blog.csdnimg.cn/20201220141747102.png)
再如，你要通过jar包给某个接口提供实现，就在自己jar包的`META-INF/services/`目录下放一个接口同名文件，指定接口的实现是自己这个jar包里的某类即可：
![](https://img-blog.csdnimg.cn/20201220142131599.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
别人用这个接口，然后用你的jar包，就会在运行时通过你的jar包指定文件找到这个接口该用哪个实现类。这是JDK内置提供的功能。

> 我就不定义在 META-INF/services 下面行不行？就想定义在别的地方可以吗？

No！JDK 已经规定好配置路径，你若随便定义，类加载器可就不知道去哪里加载了
![](https://img-blog.csdnimg.cn/bba23763598a4d19a80616e85623c7c9.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
假设你有个工程P，有个接口A，A在P无实现类，系统运行时怎么给A选实现类呢?
可以自己搞个jar包，`META-INF/services/`，放上一个文件，文件名即接口名，接口A的实现类=`com.javaedge.service.实现类A2`。
让P来依赖你的jar包，等系统运行时，P跑起来了，对于接口A，就会扫描依赖的jar包，看看有没有`META-INF/services`文件夹：
- 有，再看看有无名为接口A的文件：
	- 有，在里面查找指定的接口A的实现是你的jar包里的哪个类即可
# 适用场景
## 插件扩展
比如你开发了一个开源框架，若你想让别人自己写个插件，安排到你的开源框架里中，扩展功能时。

如JDBC。Java定义了一套JDBC的接口，但并未提供具体实现类，而是在不同云厂商提供的数据库实现包。
> 但项目运行时，要使用JDBC接口的哪些实现类呢?

一般要根据自己使用的数据库驱动jar包，比如我们最常用的MySQL，其`mysql-jdbc-connector.jar` 里面就有：
![](https://img-blog.csdnimg.cn/20201220151405844.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
系统运行时碰到你使用JDBC的接口，就会在底层使用你引入的那个jar中提供的实现类。
## 案例
如sharding-jdbc 数据加密模块，本身支持 AES 和 MD5 两种加密方式。但若客户端不想用内置的两种加密，偏偏想用 RSA 算法呢？难道每加一种算法，sharding-jdbc 就要发个版本？

sharding-jdbc 可不会这么蠢，首先提供出 EncryptAlgorithm 加密算法接口，并引入 SPI 机制，做到服务接口与服务实现分离的效果。
客户端想要使用自定义加密算法，只需在客户端项目 `META-INF/services` 的路径下定义接口的全限定名称文件，并在文件内写上加密实现类的全限定名
![](https://img-blog.csdnimg.cn/fea9f40870554ee8b579af6e34e22171.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
![](https://img-blog.csdnimg.cn/2025dd20872942c8a0560338787e9a63.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
这就显示了SPI的优点：
- 客户端（自己的项目）提供了服务端（sharding-jdbc）的接口自定义实现，但是与服务端状态分离，只有在客户端提供了自定义接口实现时才会加载，其它并没有关联；客户端的新增或删除实现类不会影响服务端
- 如果客户端不想要 RSA 算法，又想要使用内置的 AES 算法，那么可以随时删掉实现类，可扩展性强，插件化架构