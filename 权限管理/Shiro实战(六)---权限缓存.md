# 1 概述
![](https://upload-images.jianshu.io/upload_images/4685968-fbc0bc35714425fb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-21082a09aef44a84.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
Shiro提供了类似于Spring的Cache抽象，即Shiro本身不实现Cache，但是对Cache进行了又抽象，方便更换不同的底层Cache实现。

Shiro提供的Cache接口：
```
public interface Cache<K, V> {
    //根据Key获取缓存中的值
    public V get(K key) throws CacheException;
    //往缓存中放入key-value，返回缓存中之前的值
    public V put(K key, V value) throws CacheException; 
    //移除缓存中key对应的值，返回该值
    public V remove(K key) throws CacheException;
    //清空整个缓存
    public void clear() throws CacheException;
    //返回缓存大小
    public int size();
    //获取缓存中所有的key
    public Set<K> keys();
    //获取缓存中所有的value
    public Collection<V> values();
}
```
- Shiro提供的CacheManager接口
![](https://upload-images.jianshu.io/upload_images/4685968-3bb58467e670fbce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- Shiro还提供了CacheManagerAware用于注入CacheManager
![](https://upload-images.jianshu.io/upload_images/4685968-33e2103cc907404f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Shiro内部相应的组件（DefaultSecurityManager）会自动检测相应的对象（如Realm）是否实现了CacheManagerAware并自动注入相应的CacheManager
# 2 Realm缓存
![](https://upload-images.jianshu.io/upload_images/4685968-12e6769b81662d11.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Shiro提供了CachingRealm，其实现了CacheManagerAware接口，提供了缓存的一些基础实现；另外AuthenticatingRealm及AuthorizingRealm分别提供了对AuthenticationInfo 和AuthorizationInfo信息的缓存

- ini配置   
```
userRealm=com.sss.realm.UserRealm
userRealm.credentialsMatcher=$credentialsMatcher
userRealm.cachingEnabled=true
userRealm.authenticationCachingEnabled=true
userRealm.authenticationCacheName=authenticationCache
userRealm.authorizationCachingEnabled=true
userRealm.authorizationCacheName=authorizationCache
securityManager.realms=$userRealm

cacheManager=org.apache.shiro.cache.ehcache.EhCacheManager
cacheManager.cacheManagerConfigFile=classpath:shiro-ehcache.xml
securityManager.cacheManager=$cacheManager;
```
userRealm.cachingEnabled：启用缓存，默认false；

userRealm.authenticationCachingEnabled：启用身份验证缓存，即缓存AuthenticationInfo信息，默认false；

userRealm.authenticationCacheName：缓存AuthenticationInfo信息的缓存名称；

userRealm. authorizationCachingEnabled：启用授权缓存，即缓存AuthorizationInfo信息，默认false；

userRealm. authorizationCacheName：缓存AuthorizationInfo信息的缓存名称；

cacheManager：缓存管理器，此处使用EhCacheManager，即Ehcache实现，需要导入相应的Ehcache依赖，请参考pom.xml；

因为测试用例的关系，需要将Ehcache的CacheManager改为使用VM单例模式：
```
this.manager = new net.sf.ehcache.CacheManager(getCacheManagerConfigFileInputStream());
```
改为
```
this.manager = net.sf.ehcache.CacheManager.create(getCacheManagerConfigFileInputStream());
```

- 测试用例 
```
@Test
public void testClearCachedAuthenticationInfo() {
    login(u1.getUsername(), password);
    userService.changePassword(u1.getId(), password + "1");

    RealmSecurityManager securityManager =
     (RealmSecurityManager) SecurityUtils.getSecurityManager();
    UserRealm userRealm = (UserRealm) securityManager.getRealms().iterator().next();
    userRealm.clearCachedAuthenticationInfo(subject().getPrincipals());

    login(u1.getUsername(), password + "1");
}
```
首先登录成功（此时会缓存相应的AuthenticationInfo），然后修改密码；此时密码就变了；接着需要调用Realm的clearCachedAuthenticationInfo方法清空之前缓存的AuthenticationInfo；否则下次登录时还会获取到修改密码之前的那个AuthenticationInfo
```
@Test
public void testClearCachedAuthorizationInfo() {
    login(u1.getUsername(), password);
    subject().checkRole(r1.getRole());
    userService.correlationRoles(u1.getId(), r2.getId());

    RealmSecurityManager securityManager =
      (RealmSecurityManager) SecurityUtils.getSecurityManager();
    UserRealm userRealm = (UserRealm)securityManager.getRealms().iterator().next();
    userRealm.clearCachedAuthorizationInfo(subject().getPrincipals());

    subject().checkRole(r2.getRole());
}
```
和之前的用例差不多；此处调用Realm的clearCachedAuthorizationInfo清空之前缓存的AuthorizationInfo；

 

另外还有clearCache，其同时调用clearCachedAuthenticationInfo和clearCachedAuthorizationInfo，清空AuthenticationInfo和AuthorizationInfo。

 

UserRealm还提供了clearAllCachedAuthorizationInfo、clearAllCachedAuthenticationInfo、clearAllCache，用于清空整个缓存。
# 3 Session缓存
![](https://upload-images.jianshu.io/upload_images/4685968-7b7b15b21d9b1bb3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

当我们设置了SecurityManager的CacheManager时，如：
```
securityManager.cacheManager=$cacheManager
```
当我们设置SessionManager时：
```
sessionManager=org.apache.shiro.session.mgt.DefaultSessionManager
securityManager.sessionManager=$sessionManager;
```
如securityManager实现了SessionsSecurityManager，其会自动判断SessionManager是否实现了CacheManagerAware接口，如果实现了会把CacheManager设置给它。然后sessionManager会判断相应的sessionDAO（如继承自CachingSessionDAO）是否实现了CacheManagerAware，如果实现了会把CacheManager设置给它；如第九章的MySessionDAO就是带缓存的SessionDAO；其会先查缓存，如果找不到才查数据库。

 

对于CachingSessionDAO，可以通过如下配置设置缓存的名称：
```
sessionDAO=com.github.zhangkaitao.shiro.chapter11.session.dao.MySessionDAO
sessionDAO.activeSessionsCacheName=shiro-activeSessionCache;
```
activeSessionsCacheName默认就是shiro-activeSessionCache
