Shiro提供了完整的企业级会话管理功能，不依赖于底层容器（如web容器Tomcat），不管JavaSE还是JavaEE环境都可以使用，提供了会话管理、会话事件监听、会话存储/持久化、容器无关的集群、失效/过期支持、对Web的透明支持、SSO单点登录的支持等特性
即直接使用Shiro的会话管理可以直接替换Web容器的会话管理
![](https://upload-images.jianshu.io/upload_images/4685968-0dedfbeb9e54a867.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 1 会话简介
即用户访问应用时保持的连接关系，在多次交互中应用能够识别出当前访问的用户是谁，且可以在多次交互中保存一些数据
如访问一些网站时登录成功后，网站可以记住用户，且在退出之前都可以识别当前用户是谁。

 Shiro的会话支持不仅可以在普通的JavaSE应用中使用，也可以在JavaEE应用中使用，如web应用。且使用方式是一致的。 
```
login("classpath:shiro.ini", "zhang", "123");
Subject subject = SecurityUtils.getSubject();
Session session = subject.getSession();
```
登录成功后使用`Subject.getSession()`即可获取会话
![](https://upload-images.jianshu.io/upload_images/4685968-5366ff519d5e4b70.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
其等价于Subject.getSession(true)
![](https://upload-images.jianshu.io/upload_images/4685968-10da55cf9fd96893.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
即如果当前没有创建Session对象会创建一个；另外Subject.getSession(false)，如果当前没有创建Session则返回null（不过默认情况下如果启用会话存储功能的话在创建Subject时会主动创建一个Session）
![DelegatingSubject#getSession(boolean create)](https://upload-images.jianshu.io/upload_images/4685968-0470b2911ba138dc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 获取当前会话的唯一标识
```
session.getId();
```
![](https://upload-images.jianshu.io/upload_images/4685968-9041b98ce6ad9b62.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 获取当前Subject的主机地址，该地址是通过HostAuthenticationToken.getHost()提供的
```
session.getHost();  
```
![](https://upload-images.jianshu.io/upload_images/4685968-6d5d23196bf5e3cb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 获取/设置当前Session的过期时间；如果不设置默认是会话管理器的全局过期时间
```
session.getStartTimestamp()
session.getLastAccessTime();
```
![](https://upload-images.jianshu.io/upload_images/4685968-a306ea20de35a7b6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d6e7a022b8ab39a8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

获取会话的启动时间及最后访问时间；如果是JavaSE应用需要自己定期调用session.touch()去更新最后访问时间；如果是Web应用，每次进入ShiroFilter都会自动调用session.touch()来更新最后访问时间
- 更新会话最后访问时间及销毁会话
当Subject.logout()
![](https://upload-images.jianshu.io/upload_images/4685968-4437e8cb8bfc2832.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
会自动调用stop
![](https://upload-images.jianshu.io/upload_images/4685968-40c496cc5979051d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
销毁会话
在web中，调用javax.servlet.http.HttpSession. invalidate()
![](https://upload-images.jianshu.io/upload_images/4685968-f6fadf8511170f89.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
也会自动调用Shiro Session.stop方法进行销毁Shiro的会话
- 设置/获取/删除会话属性；在整个会话范围内都可以对这些属性进行操作
 ```
session.setAttribute("key", "123");
Assert.assertEquals("123", session.getAttribute("key"));
session.removeAttribute("key");
``` 

Shiro提供的会话可以用于JavaSE/JavaEE环境，不依赖于任何底层容器，可以独立使用，是完整的会话模块
# 2 会话管理器
Shiro的核心组件,会话管理器管理着应用中所有Subject的会话的创建、维护、删除、失效、验证等工作
![](https://upload-images.jianshu.io/upload_images/4685968-f7656732787bcdf2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- SessionManager提供了如下接口
![](https://upload-images.jianshu.io/upload_images/4685968-cb6857453d8ac922.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-dbf88b2fda8d33bb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 用于Web环境的`WebSessionManager`又提供了如下接口
![](https://upload-images.jianshu.io/upload_images/4685968-3360401751ccd233.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 还提供了ValidatingSessionManager用于验证过期会话
![](https://upload-images.jianshu.io/upload_images/4685968-14064fd79e772d3e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 2.1 Shiro提供了三个默认实现
- DefaultSessionManager
DefaultSecurityManager使用的默认实现，用于JavaSE环境
- ServletContainerSessionManager
DefaultWebSecurityManager使用的默认实现，用于Web环境，其直接使用Servlet容器的会话；
- DefaultWebSessionManager
用于Web环境的实现，可以替代ServletContainerSessionManager，自行维护会话，直接废弃Servlet容器的会话管理
 

替换SecurityManager默认的SessionManager可以在ini中配置（shiro.ini）
```
[main]
sessionManager=org.apache.shiro.session.mgt.DefaultSessionManager
securityManager.sessionManager=$sessionManager&nbsp;
```
Web环境下的ini配置(shiro-web.ini)
```
[main]
sessionManager=org.apache.shiro.web.session.mgt.ServletContainerSessionManager
securityManager.sessionManager=$sessionManager
```
- 可以设置会话的全局过期时间（毫秒为单位），默认30分钟：
```
sessionManager. globalSessionTimeout=1800000;
```
默认情况下globalSessionTimeout将应用给所有Session。可以单独设置每个Session的timeout属性来为每个Session设置其超时时间。

另外如果使用`ServletContainerSessionManager`进行会话管理
Session的超时依赖于底层Servlet容器的超时时间，可以在web.xml中配置其会话的超时时间（分钟为单位）： 
```
<session-config>
  <session-timeout>30</session-timeout>
</session-config>
```
在Servlet容器中，默认使用JSESSIONID Cookie维护会话，且会话默认是跟容器绑定的
在某些情况下可能需要使用自己的会话机制，此时我们可以使用`DefaultWebSessionManager`来维护会话
```
// 创建会话Cookie的模板
sessionIdCookie=org.apache.shiro.web.servlet.SimpleCookie
sessionManager=org.apache.shiro.web.session.mgt.DefaultWebSessionManager
// 设置Cookie名字，默认为JSESSIONID
sessionIdCookie.name=sid
// 设置Cookie的域名，默认空，即当前访问的域名
#sessionIdCookie.domain=sishuok.com
// 设置Cookie的路径，默认空，即存储在域名根下
#sessionIdCookie.path=
// 设置Cookie的过期时间，秒为单位，默认-1表示关闭浏览器时过期Cookie
sessionIdCookie.maxAge=1800
// 如果设置为true，则客户端不会暴露给客户端脚本代码，使用HttpOnly cookie有助于减少某些类型的跨站点脚本攻击；此特性需要实现了Servlet 2.5 MR6及以上版本的规范的Servlet容器支持；
sessionIdCookie.httpOnly=true
sessionManager.sessionIdCookie=$sessionIdCookie
// 是否启用/禁用Session Id Cookie，默认是启用的；如果禁用后将不会设置Session Id Cookie，即默认使用了Servlet容器的JSESSIONID，且通过URL重写（URL中的“;JSESSIONID=id”部分）保存Session Id。
sessionManager.sessionIdCookieEnabled=true
securityManager.sessionManager=$sessionManager;
```
另外我们可以如“sessionManager. sessionIdCookie.name=sid”这种方式操作Cookie模板
# 3 会话监听器
用于监听会话创建、过期及停止事件 
```
public class MySessionListener1 implements SessionListener {
    @Override
    public void onStart(Session session) {//会话创建时触发
        System.out.println("会话创建：" + session.getId());
    }
    @Override
    public void onExpiration(Session session) {//会话过期时触发
        System.out.println("会话过期：" + session.getId());
    }
    @Override
    public void onStop(Session session) {//退出/会话过期时触发
        System.out.println("会话停止：" + session.getId());
    }  
}
```
- 如果只想监听某一个事件，可以继承SessionListenerAdapter
![](https://upload-images.jianshu.io/upload_images/4685968-bf78cd22f7ff79cc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
public class MySessionListener2 extends SessionListenerAdapter {
    @Override
    public void onStart(Session session) {
        System.out.println("会话创建：" + session.getId());
    }
}
```
- 在shiro-web.ini配置文件中可以进行如下配置设置会话监听器
```
sessionListener1=com.github.zhangkaitao.shiro.chapter10.web.listener.MySessionListener1
sessionListener2=com.github.zhangkaitao.shiro.chapter10.web.listener.MySessionListener2
sessionManager.sessionListeners=$sessionListener1,$sessionListener2
```
# 4 会话存储
Shiro提供SessionDAO用于会话的CRUD，即DAO（Data Access Object）模式实现
```
//如DefaultSessionManager在创建完session后会调用该方法；如保存到关系数据库/文件系统/NoSQL数据库；即可以实现会话的持久化；返回会话ID；主要此处返回的ID.equals(session.getId())；
Serializable create(Session session);
//根据会话ID获取会话
Session readSession(Serializable sessionId) throws UnknownSessionException;
//更新会话；如更新会话最后访问时间/停止会话/设置超时时间/设置移除属性等会调用
void update(Session session) throws UnknownSessionException;
//删除会话；当会话过期/会话停止（如用户退出时）会调用
void delete(Session session);
//获取当前所有活跃用户，如果用户量多此方法影响性能
Collection<Session> getActiveSessions();
```
Shiro内嵌了如下SessionDAO实现
![](https://upload-images.jianshu.io/upload_images/4685968-a1810d96113763b8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- AbstractSessionDAO提供了SessionDAO的基础实现，如生成会话ID
- CachingSessionDAO提供了对开发者透明的会话缓存的功能，只需要设置相应的CacheManager即可
- MemorySessionDAO直接在内存中进行会话维护
- EnterpriseCacheSessionDAO提供了缓存功能的会话维护，默认情况下使用MapCache实现，内部使用ConcurrentHashMap保存缓存的会话
![](https://upload-images.jianshu.io/upload_images/4685968-e5f2b4276a1c6906.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 可以通过如下配置设置SessionDAO
```
sessionDAO=org.apache.shiro.session.mgt.eis.EnterpriseCacheSessionDAO
sessionManager.sessionDAO=$sessionDAO;
```
Shiro提供了使用Ehcache进行会话存储，Ehcache可以配合TerraCotta实现容器无关的分布式集群
首先在pom.xml里添加如下依赖：
```
<dependency>
    <groupId>org.apache.shiro</groupId>
    <artifactId>shiro-ehcache</artifactId>
    <version>1.2.2</version>
</dependency>
```
接着配置shiro-web.ini文件
```
sessionDAO=org.apache.shiro.session.mgt.eis.EnterpriseCacheSessionDAO
// 设置Session缓存名字，默认就是shiro-activeSessionCache
sessionDAO. activeSessionsCacheName=shiro-activeSessionCache
sessionManager.sessionDAO=$sessionDAO
// 缓存管理器，用于管理缓存的，此处使用Ehcache实现
cacheManager = org.apache.shiro.cache.ehcache.EhCacheManager
// 设置ehcache缓存的配置文件
cacheManager.cacheManagerConfigFile=classpath:ehcache.xml
// 设置SecurityManager的cacheManager，会自动设置实现了CacheManagerAware接口的相应对象，如SessionDAO的cacheManager
securityManager.cacheManager = $cacheManager;
```
然后配置ehcache.xml
```
<cache name="shiro-activeSessionCache"
       maxEntriesLocalHeap="10000"
       overflowToDisk="false"
       eternal="false"
       diskPersistent="false"
       timeToLiveSeconds="0"
       timeToIdleSeconds="0"
       statistics="true"/>;
```
Cache的名字为`shiro-activeSessionCache`，即设置的sessionDAO的activeSessionsCacheName属性值。

 另外可以通过如下ini配置设置会话ID生成器
```
sessionIdGenerator=org.apache.shiro.session.mgt.eis.JavaUuidSessionIdGenerator
sessionDAO.sessionIdGenerator=$sessionIdGenerator;
```
用于生成会话ID，默认就是JavaUuidSessionIdGenerator，使用java.util.UUID生成

如果自定义实现SessionDAO，继承CachingSessionDAO即可
```java
public class MySessionDAO extends CachingSessionDAO {
    private JdbcTemplate jdbcTemplate = JdbcTemplateUtils.jdbcTemplate();
     protected Serializable doCreate(Session session) {
        Serializable sessionId = generateSessionId(session);
        assignSessionId(session, sessionId);
        String sql = "insert into sessions(id, session) values(?,?)";
        jdbcTemplate.update(sql, sessionId, SerializableUtils.serialize(session));
        return session.getId();
    }
protected void doUpdate(Session session) {
    if(session instanceof ValidatingSession && !((ValidatingSession)session).isValid()) {
        return; //如果会话过期/停止 没必要再更新了
    }
        String sql = "update sessions set session=? where id=?";
        jdbcTemplate.update(sql, SerializableUtils.serialize(session), session.getId());
    }
    protected void doDelete(Session session) {
        String sql = "delete from sessions where id=?";
        jdbcTemplate.update(sql, session.getId());
    }
    protected Session doReadSession(Serializable sessionId) {
        String sql = "select session from sessions where id=?";
        List<String> sessionStrList = jdbcTemplate.queryForList(sql, String.class, sessionId);
        if(sessionStrList.size() == 0) return null;
        return SerializableUtils.deserialize(sessionStrList.get(0));
    }
}
```
此处通过把会话序列化后存储到数据库实现
接着在shiro-web.ini中配置
```
sessionDAO=com.sss.session.dao.MySessionDAO
```
其他设置和之前一样，因为继承了CachingSessionDAO；所有在读取时会先查缓存中是否存在，如果找不到才到数据库中查找
# 5 会话验证
Shiro提供了会话验证调度器，用于定期的验证会话是否已过期，如果过期将停止会话
出于性能考虑，一般情况下都是获取会话时来验证会话是否过期并停止会话的
但是如在web环境中，如果用户不主动退出是不知道会话是否过期的，因此需要定期的检测会话是否过期，Shiro提供了会话验证调度器SessionValidationScheduler来做这件事情

 可以通过如下ini配置开启会话验证
```
// 会话验证调度器，sessionManager默认就是使用ExecutorServiceSessionValidationScheduler，其使用JDK的ScheduledExecutorService进行定期调度并验证会话是否过期
sessionValidationScheduler=org.apache.shiro.session.mgt.ExecutorServiceSessionValidationScheduler
// 设置调度时间间隔，单位毫秒，默认就是1小时
sessionValidationScheduler.interval = 3600000
// 设置会话验证调度器进行会话验证时的会话管理器
sessionValidationScheduler.sessionManager=$sessionManager
// 设置全局会话超时时间，默认30分钟，即如果30分钟内没有访问会话将过期
sessionManager.globalSessionTimeout=1800000
// 是否开启会话验证器，默认是开启的
sessionManager.sessionValidationSchedulerEnabled=true
// 设置会话验证调度器，默认就是使用ExecutorServiceSessionValidationScheduler
sessionManager.sessionValidationScheduler=$sessionValidationScheduler;
```
Shiro也提供了使用Quartz会话验证调度器
```
sessionValidationScheduler=org.apache.shiro.session.mgt.quartz.QuartzSessionValidationScheduler
sessionValidationScheduler.sessionValidationInterval = 3600000
sessionValidationScheduler.sessionManager=$sessionManager;
```
使用时需要导入shiro-quartz依赖
```
<dependency>
     <groupId>org.apache.shiro</groupId>
     <artifactId>shiro-quartz</artifactId>
     <version>1.2.2</version>
</dependency>
```
如上会话验证调度器实现都是直接调用AbstractValidatingSessionManager 的validateSessions方法进行验证，其直接调用SessionDAO的getActiveSessions方法获取所有会话进行验证，如果会话比较多，会影响性能；可以考虑如分页获取会话并进行验证
```
//分页获取会话并验证
String sql = "select session from sessions limit ?,?";
int start = 0; //起始记录
int size = 20; //每页大小
List<String> sessionList = jdbcTemplate.queryForList(sql, String.class, start, size);
while(sessionList.size() > 0) {
  for(String sessionStr : sessionList) {
    try {
      Session session = SerializableUtils.deserialize(sessionStr);
      Method validateMethod = 
        ReflectionUtils.findMethod(AbstractValidatingSessionManager.class, 
            "validate", Session.class, SessionKey.class);
      validateMethod.setAccessible(true);
      ReflectionUtils.invokeMethod(validateMethod, 
        sessionManager, session, new DefaultSessionKey(session.getId()));
    } catch (Exception e) {
        //ignore
    }
  }
 start = start + size;
  sessionList = jdbcTemplate.queryForList(sql, String.class, start, size);
}
```
其直接改造自ExecutorServiceSessionValidationScheduler，如上代码是验证的核心代码，可以根据自己的需求改造此验证调度器器

如果在会话过期时不想删除过期的会话，可以通过如下ini配置进行设置
```
sessionManager.deleteInvalidSessions=false
```
默认是开启的，在会话过期后会调用SessionDAO的delete方法删除会话：如会话时持久化存储的，可以调用此方法进行删除。

 

如果是在获取会话时验证了会话已过期，将抛出InvalidSessionException；因此需要捕获这个异常并跳转到相应的页面告诉用户会话已过期，让其重新登录，可以在web.xml配置相应的错误页面
```
<error-page>
    <exception-type>org.apache.shiro.session.InvalidSessionException</exception-type>
    <location>/invalidSession.jsp</location>
</error-page>
```
# 6 sessionFactory
sessionFactory是创建会话的工厂，根据相应的Subject上下文信息来创建会话

默认提供了SimpleSessionFactory用来创建SimpleSession会话。
![](https://upload-images.jianshu.io/upload_images/4685968-6e42b0d238977997.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

首先自定义一个Session
```
public class OnlineSession extends SimpleSession {
    public static enum OnlineStatus {
        on_line("在线"), hidden("隐身"), force_logout("强制退出");
        private final String info;
        private OnlineStatus(String info) {
            this.info = info;
        }
        public String getInfo() {
            return info;
        }
    }
    private String userAgent; //用户浏览器类型
    private OnlineStatus status = OnlineStatus.on_line; //在线状态
    private String systemHost; //用户登录时系统IP
    //省略其他
}
```
`OnlineSession`用于保存当前登录用户的在线状态，支持如离线等状态的控制。
接着自定义SessionFactory
```
public class OnlineSessionFactory implements SessionFactory {

    @Override
    public Session createSession(SessionContext initData) {
        OnlineSession session = new OnlineSession();
        if (initData != null && initData instanceof WebSessionContext) {
            WebSessionContext sessionContext = (WebSessionContext) initData;
            HttpServletRequest request = (HttpServletRequest) sessionContext.getServletRequest();
            if (request != null) {
                session.setHost(IpUtils.getIpAddr(request));
                session.setUserAgent(request.getHeader("User-Agent"));
                session.setSystemHost(request.getLocalAddr() + ":" + request.getLocalPort());
            }
        }
        return session;
    }
}
```
根据会话上下文创建相应的OnlineSession。

 

最后在shiro-web.ini配置文件中配置
```
sessionFactory=org.apache.shiro.session.mgt.OnlineSessionFactory
sessionManager.sessionFactory=$sessionFactory
```
