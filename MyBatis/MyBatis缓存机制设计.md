# 1 数据缓存设计结构
## 1.1  一级缓存
Session会话级别的缓存，位于表示一次数据库会话的`SqlSession`对象之中，即`本地缓存`。
 
一级缓存是MyBatis内部实现的一个特性，`用户不能配置`，`默认自动支持`，用户无定制权利。

## 1.2 二级缓存
Application应用级别的缓存，生命周期长，跟**Application**的生命周期一样，即作用范围为整个**Application**应用。

- 缓存架构
![](https://img-blog.csdnimg.cn/img_convert/467c160b28d36dbc89025aae196fa514.png)
# 2 工作机制
## 2.1 一级缓存的工作机制
 一级缓存是**Session**级别，一般一个**SqlSession**对象会使用一个**Executor**对象来完成会话操作，**Executor**对象会维护一个**Cache**缓存，以提高查询性能。
![](https://img-blog.csdnimg.cn/img_convert/b8e294c3fca853664aa4397656f9f640.png)
## 2.2 二级缓存的工作机制
一个**SqlSession**对象会使用一个**Executor**对象来完成会话操作，**MyBatis**的二级缓存机制的关键就是对这个**Executor**对象做文章

如果用户配置了`cacheEnabled=true`，那么在为**SqlSession**对象创建**Executor**对象时，会对**Executor**对象加上一个装饰者 `CachingExecutor`，这时**SqlSession**使用`CachingExecutor`对象来完成操作请求
**CachingExecutor**对于查询请求，会先判断该查询请求在**Application**级别的二级缓存中是否有缓存结果
- 如果有查询结果，则直接返回缓存结果
- 如果缓存未命中，再交给真正的**Executor**对象来完成查询操作，之后**CachingExecutor**会将真正**Executor**返回的查询结果放置到缓存中，然后再返回给用户

**MyBatis**的二级缓存设计得比较灵活，可以使用**MyBatis**自己定义的二级缓存实现。也可通过实现**org.apache.ibatis.cache.Cache**接口自定义缓存
也可以使用第三方内存缓存库，如**Memcached**等。
![](https://img-blog.csdnimg.cn/img_convert/ce84ae9d34d83b3f148b9d08132765e7.png)
![](https://img-blog.csdnimg.cn/img_convert/b40150aeace181dcbc50d6ddfa4190f2.png)
# 使用
MyBatis: 
```xml
<cache type="org.mybatis.caches.ehcache.LoggingEhcache" > <property name="memoryStoreEvictionPolicy" value="LRU"/></cache> <select id="selectArticleListPage" resultMap="resultUserArticleList" useCache="false">
```