![](https://upload-images.jianshu.io/upload_images/4685968-13ca703de2c3197c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 1 CachingUserDetailsService
![](https://upload-images.jianshu.io/upload_images/4685968-d4b45a45d35070c7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
 Spring Security提供了一个实现了可以缓存UserDetails的UserDetailsService实现类，CachingUserDetailsService
该类的构造接收一个用于真正加载UserDetails的UserDetailsService实现类
当需要加载UserDetails时，其首先会从缓存中获取，如果缓存中没有对应的UserDetails存在，则使用持有的UserDetailsService实现类进行加载，然后将加载后的结果存放在缓存中。
UserDetails与缓存的交互是通过UserCache接口来实现的
CachingUserDetailsService默认拥有UserCache的一个空实现引用`NullUserCache`
![](https://upload-images.jianshu.io/upload_images/4685968-04393d7064337fa8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
当缓存中不存在对应的UserDetails时将使用引用的UserDetailsService类型的delegate进行加载
加载后再把它存放到Cache中并进行返回
除了NullUserCache之外，Spring Security还为我们提供了一个基于Ehcache的UserCache实现类
```
public class EhCacheBasedUserCache implements UserCache, InitializingBean {
	// ~ Static fields/initializers
	// =====================================================================================

	private static final Log logger = LogFactory.getLog(EhCacheBasedUserCache.class);

	// ~ Instance fields
	// ================================================================================================

	private Ehcache cache;

	// ~ Methods
	// ========================================================================================================

	public void afterPropertiesSet() throws Exception {
		Assert.notNull(cache, "cache mandatory");
	}

	public Ehcache getCache() {
		return cache;
	}

	public UserDetails getUserFromCache(String username) {
		Element element = cache.get(username);

		if (logger.isDebugEnabled()) {
			logger.debug("Cache hit: " + (element != null) + "; username: " + username);
		}

		if (element == null) {
			return null;
		}
		else {
			return (UserDetails) element.getValue();
		}
	}

	public void putUserInCache(UserDetails user) {
		Element element = new Element(user.getUsername(), user);

		if (logger.isDebugEnabled()) {
			logger.debug("Cache put: " + element.getKey());
		}

		cache.put(element);
	}

	public void removeUserFromCache(UserDetails user) {
		if (logger.isDebugEnabled()) {
			logger.debug("Cache remove: " + user.getUsername());
		}

		this.removeUserFromCache(user.getUsername());
	}

	public void removeUserFromCache(String username) {
		cache.remove(username);
	}

	public void setCache(Ehcache cache) {
		this.cache = cache;
	}
}
```
