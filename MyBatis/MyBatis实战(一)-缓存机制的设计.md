# 1 数据缓存设计结构
## 1.1  一级缓存
 Session会话级别的缓存，位于表示一次数据库会话的`SqlSession`对象之中，又被称之为`本地缓存`
一级缓存是MyBatis内部实现的一个特性，`用户不能配置`，`默认情况下自动支持的缓存`，一般用户没有定制它的权利
## 1.2 二级缓存
Application应用级别的缓存，生命周期长，跟**Application**的生命周期一样，即作用范围为整个**Application**应用
![缓存架构](https://upload-images.jianshu.io/upload_images/4685968-389b17ae58a342b6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 2 工作机制
## 2.1 一级缓存的工作机制
 一级缓存是**Session**会话级别的，一般而言，一个**SqlSession**对象会使用一个**Executor**对象来完成会话操作，**Executor**对象会维护一个**Cache**缓存，以提高查询性能
![](https://upload-images.jianshu.io/upload_images/4685968-3cb4fdced66fa14c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 2.2 二级缓存的工作机制
如上所言，一个**SqlSession**对象会使用一个**Executor**对象来完成会话操作，**MyBatis**的二级缓存机制的关键就是对这个**Executor**对象做文章
如果用户配置了`cacheEnabled=true`，那么在为**SqlSession**对象创建**Executor**对象时，会对**Executor**对象加上一个装饰者 `CachingExecutor`，这时**SqlSession**使用`CachingExecutor`对象来完成操作请求
**CachingExecutor**对于查询请求，会先判断该查询请求在**Application**级别的二级缓存中是否有缓存结果
- 如果有查询结果，则直接返回缓存结果
- 如果缓存未命中，再交给真正的**Executor**对象来完成查询操作，之后**CachingExecutor**会将真正**Executor**返回的查询结果放置到缓存中，然后再返回给用户


> **MyBatis**的二级缓存设计得比较灵活，可以使用**MyBatis**自己定义的二级缓存实现
也可以通过实现**org.apache.ibatis.cache.Cache**接口自定义缓存
也可以使用第三方内存缓存库，如**Memcached**等

![](https://upload-images.jianshu.io/upload_images/4685968-e634f3282ffe0775.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-89178fc0aaa38c16.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
