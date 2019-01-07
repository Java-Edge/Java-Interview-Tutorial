MyBatis的二级缓存是Application级别的缓存，它可以提高对数据库查询的效率，以提高应用的性能
# **1.MyBatis的缓存机制整体设计以及二级缓存的工作模式**
![](https://upload-images.jianshu.io/upload_images/4685968-e32166d46c88d99c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
当开一个会话时，一个**SqlSession**对象会使用一个**Executor**对象来完成会话操作，**MyBatis**的二级缓存机制的关键就是对这个**Executor**对象做文章
如果用户配置了`cacheEnabled=true`，那么**MyBatis**在为**SqlSession**对象创建**Executor**对象时，会对**Executor**对象加上一个装饰者：**CachingExecutor**，这时**SqlSession**使用**CachingExecutor**对象来完成操作请求
**CachingExecutor**对于查询请求，会先判断该查询请求在**Application**级别的二级缓存中是否有缓存结果
- 如果有查询结果，则直接返回缓存结果
- 如果缓存中没有，再交给真正的**Executor**对象来完成查询操作，之后**CachingExecutor**会将真正**Executor**返回的查询结果放置到缓存中，然后在返回给用户
![](https://upload-images.jianshu.io/upload_images/4685968-dc5734c32ff28aeb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
 **CachingExecutor**是**Executor**的装饰者，以增强**Executor**的功能，使其具有`缓存查询`功能，这里用到了设计模式中的装饰者模式，
**CachingExecutor**和**Executor**的接口的关系如下类图所示：
![](https://upload-images.jianshu.io/upload_images/4685968-ac36596f0e769458.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 2 MyBatis二级缓存的划分
**MyBatis**并不是简单地对整个**Application**就只有一个**Cache**缓存对象，它将缓存划分的更细，即是**Mapper**级别的，即每一个Mapper都可以拥有一个**Cache**对象，具体如下： 
>  **a.为每一个Mapper分配一个Cache缓存对象（使用<cache>节点配置）**
**b.多个Mapper共用一个Cache缓存对象（使用<cache-ref>节点配置）**
如果你想让多个**Mapper**公用一个**Cache**的话，你可以使用**<cache-ref namespace="">**节点，来指定你的这个**Mapper**使用到了哪一个**Mapper**的**Cache**缓存
![](https://upload-images.jianshu.io/upload_images/4685968-1f143322892bf4b9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# **3 使用二级缓存，必须要具备的条件**
**MyBatis**对二级缓存的支持粒度很细，它会指定某一条查询语句是否使用二级缓存

虽然在**Mapper**中配置了**<cache>**,并且为此**Mapper**分配了**Cache**对象，这并不表示我们使用**Mapper**中定义的查询语句查到的结果都会放置到**Cache**对象之中
必须指定**Mapper**中的某条选择语句是否支持缓存，即如下所示，在**<select>**节点中配置**useCache="true"**，**Mapper**才会对此**Select**的查询支持缓存，否则，不会对此**Select**查询，不会经过**Cache**缓存
如下，**Select**语句配置了**useCache="true"**，则表明这条**Select**语句的查询会使用二级缓存。 
```
 <select id="selectByMinSalary" resultMap="BaseResultMap" parameterType="java.util.Map" useCache="true">
```

总之，要想使某条**Select**查询支持二级缓存，你需要保证

 > 1.  MyBatis支持二级缓存的总开关：全局配置变量参数   cacheEnabled=true
>2 该select语句所在的Mapper，配置了<cache> 或<cached-ref>节点，并且有效
>3 该select语句的参数 useCache=true
# 4 一级缓存和二级缓存的使用顺序 
如果你的**MyBatis**使用了二级缓存，并且**Mapper**和**select**语句也配置使用了二级缓存，那么在执行**select**查询的时候，**MyBatis**会先从二级缓存中取输入，其次才是一级缓存，即**MyBatis**查询数据的顺序是：
`二级缓存    ———> 一级缓存——> 数据库`
# **5 二级缓存实现的选择**
**MyBatis**对二级缓存的设计非常灵活，它自己内部实现了一系列的**Cache**缓存实现类，并提供了各种缓存刷新策略如**LRU，FIFO**等等
另外，**MyBatis**还允许用户自定义**Cache**接口实现，用户是需要实现**org.apache.ibatis.cache.Cache**接口，然后将**Cache**实现类配置在**<cache  type="">**节点的**type**属性上即可
除此之外，**MyBatis**还支持跟第三方内存缓存库如**Memecached**的集成，总之，使用**MyBatis**的二级缓存有三个选择
- **1.MyBatis自身提供的缓存实现**
- **2\. 用户自定义的Cache接口实现**
- **3.跟第三方内存缓存库的集成**

# **6.  MyBatis自身提供的二级缓存的实现**
**MyBatis**自身提供了丰富的，并且功能强大的二级缓存的实现，它拥有一系列的**Cache**接口装饰者，可以满足各种对缓存操作和更新的策略。

**MyBatis**定义了大量的**Cache**的装饰器来增强**Cache**缓存的功能

对于每个**Cache**而言，都有一个容量限制，**MyBatis**提供了各种策略来对**Cache**缓存的容量进行控制，以及对**Cache**中的数据进行刷新和置换

**MyBatis**主要提供了以下几个刷新和置换策略：
-  **LRU：（Least Recently Used）**,最近最少使用算法，即如果缓存中容量已经满了，会将缓存中最近做少被使用的缓存记录清除掉，然后添加新的记录；
- **FIFO：（First in first out）**,先进先出算法，如果缓存中的容量已经满了，那么会将最先进入缓存中的数据清除掉；
- **Scheduled**：指定时间间隔清空算法，该算法会以指定的某一个时间间隔将**Cache**缓存中的数据清空；
![](https://upload-images.jianshu.io/upload_images/4685968-8b2d02da1e76cb22.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# **6 写在后面（关于涉及到的设计模式）** 
在二级缓存的设计上，MyBatis大量地运用了装饰者模式，如CachingExecutor, 以及各种Cache接口的装饰器
