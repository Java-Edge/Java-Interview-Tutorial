HttpServlet为什么要实现serializable？在什么情况下，servlet会被序列化？
如果未显示定义serialVersionUID，系统会用什么算法给指定一个？
![](https://img-blog.csdnimg.cn/d745c434cdc8418e9519cb821fbd9317.png)
![](https://img-blog.csdnimg.cn/71dc3f2b6ef14d1099605a75c4412639.png)
Serializable是可序列化。
简单点将，就是实现了这个接口后，实例就可以转化为数据流了。

Servlet 是有状态的，所以需要持久化到本地（钝化），然后当 Tomcat 重启时，重新加载出来。比如Servlet存储了一些用户登录信息，而当时分布式缓存 redis 也还没流行，所以需要支持可序列化。