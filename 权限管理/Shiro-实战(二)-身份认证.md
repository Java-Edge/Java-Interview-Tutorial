# 1 认证原理
## 1.1 Principals与Credentials
认证就是进行身份确认的过程，也就是用户（对应Shiro中的Subject）需要提供证明来证实自己的身份
就像到自动取款机取款，持有银行卡的人就可以理解为此处的用户，银行卡的取款密码就是证明材料，如果输入正确的密码，就可以进行取款
在这个过程中，有两个概念，用户和证明材料，对应Shiro中的就分别是Principals与Credentials
## 1.2 认证步骤
要进行认证，我们需要先收集用户的Principals与Credentials
比如用户通过页面上的表单提交用户名和密码，APP用户通过提交手机号与短信验证码，然后交由服务端进行处理。
### ①服务端首先收集Principals与Credentials，对应Shiro的代码
```
UsernamePasswordToken token = new UsernamePasswordToken("username", "passwd");
```
![](https://upload-images.jianshu.io/upload_images/4685968-140ba0acad2b0cbc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里我们使用Shiro中通过的用户名/密码认证方式，或者你可以实现AuthenticationToken接口来自定义
### ②接下来进行提交，对应代码
```
Subject currentUser = SecurityUtils.getSubject();
currentUser.login(token);
```
通过SecurityUtils得到Subject，其会自动绑定到当前线程如果在web环境在请求结束时需要解除绑定
然后获取身份验证的Token，如用户名/密码；
### ③认证结果
```
if (currentUser.isAuthenticated()) {
    // success do something
} else {
    // fail throw exception
}
```
## 1.3 认证原理
在了解了Shiro认证过程的基本代码操作后，我们来看下底层是到底如何实现
首先我们先通过Shiro官方给出的一张认证流程图来作全局的了解，看看底层认证都涉及到了哪些东西
![](https://upload-images.jianshu.io/upload_images/4685968-1867f3d8eb7d96bc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### ① 获取Subject对象
然后收集用户的认证资料，调用Subject对象的login(token)方法
### ② 将方法的调用传递给底层的SecurityManager
DelegatingSubject作为Subject的实现，本身并不负责处理认证与授权的逻辑
本质上，`DelegatingSubject`只是`SecurityManager`的代理类，①中login(token)方法的调用，本质上调用的是SecurityManager接口的login(token)方法，而DefaultSecurityManager作为SecurityManager的默认实现，将调用Authenticator进行认证逻辑处理
### ③ Authenticator接口是Shiro API中的主要入口之一，就是用来负责应用中的认证操作的
该类作为顶级接口，只有一个authenticate(AuthenticationToken token)方法
而ModularRealmAuthenticator作为Shiro默认的认证处理实现类将会接过认证处理的枪，通过doAuthenticate(AuthenticationToken token)进行认证
源码如下
```
Collection<Realm> realms = getRealms();
if (realms.size() == 1) {
    return doSingleRealmAuthentication(realms.iterator().next(), authenticationToken);
} else {
    return doMultiRealmAuthentication(realms, authenticationToken);
}
```
### ④ 通常情况下应用中会使用单个的Realm来进行认证授权处理，但是强大的Shiro却支持配置多个Realm，在多个Realm对象存在的情况下，就需要指定认证策略AuthenticationStrategy ，Shiro提供了三种具体的认证策略实现
![](https://upload-images.jianshu.io/upload_images/4685968-81fe63c5a3ecd27c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- AtLeastOneSuccessfulStrategy
![](https://upload-images.jianshu.io/upload_images/4685968-a2e31fd30ed3eb32.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
ModularRealmAuthenticator的默认实现，多个Realm中，如果有一个或以上认证通过，就表示认证成功
- FirstSuccessfulStrategy：只使用第一个认证通过的Realm返回的信息，后面的Realm将会被忽略
![](https://upload-images.jianshu.io/upload_images/4685968-d9f5fbe54a31c18a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- AllSuccessfulStrategy：所有Realm认证通过才算认证成功，否则认证失败
```
public class AllSuccessfulStrategy extends AbstractAuthenticationStrategy {

    /** Private class log instance. */
    private static final Logger log = LoggerFactory.getLogger(AllSuccessfulStrategy.class);

    /**
     * Because all realms in this strategy must complete successfully, this implementation ensures that the given
     * <code>Realm</code> {@link org.apache.shiro.realm.Realm#supports(org.apache.shiro.authc.AuthenticationToken) supports} the given
     * <code>token</code> argument.  If it does not, this method throws an
     * {@link UnsupportedTokenException UnsupportedTokenException} to end the authentication
     * process immediately. If the realm does support the token, the <code>info</code> argument is returned immediately.
     */
    public AuthenticationInfo beforeAttempt(Realm realm, AuthenticationToken token, AuthenticationInfo info) throws AuthenticationException {
        if (!realm.supports(token)) {
            String msg = "Realm [" + realm + "] of type [" + realm.getClass().getName() + "] does not support " +
                    " the submitted AuthenticationToken [" + token + "].  The [" + getClass().getName() +
                    "] implementation requires all configured realm(s) to support and be able to process the submitted " +
                    "AuthenticationToken.";
            throw new UnsupportedTokenException(msg);
        }

        return info;
    }

    /**
     * Merges the specified <code>info</code> into the <code>aggregate</code> argument and returns it (just as the
     * parent implementation does), but additionally ensures the following:
     * <ol>
     * <li>if the <code>Throwable</code> argument is not <code>null</code>, re-throws it to immediately cancel the
     * authentication process, since this strategy requires all realms to authenticate successfully.</li>
     * <li>neither the <code>info</code> or <code>aggregate</code> argument is <code>null</code> to ensure that each
     * realm did in fact authenticate successfully</li>
     * </ol>
     */
    public AuthenticationInfo afterAttempt(Realm realm, AuthenticationToken token, AuthenticationInfo info, AuthenticationInfo aggregate, Throwable t)
            throws AuthenticationException {
        if (t != null) {
            if (t instanceof AuthenticationException) {
                //propagate:
                throw ((AuthenticationException) t);
            } else {
                String msg = "Unable to acquire account data from realm [" + realm + "].  The [" +
                        getClass().getName() + " implementation requires all configured realm(s) to operate successfully " +
                        "for a successful authentication.";
                throw new AuthenticationException(msg, t);
            }
        }
        if (info == null) {
            String msg = "Realm [" + realm + "] could not find any associated account data for the submitted " +
                    "AuthenticationToken [" + token + "].  The [" + getClass().getName() + "] implementation requires " +
                    "all configured realm(s) to acquire valid account data for a submitted token during the " +
                    "log-in process.";
            throw new UnknownAccountException(msg);
        }

        log.debug("Account successfully authenticated using realm [{}]", realm);

        // If non-null account is returned, then the realm was able to authenticate the
        // user - so merge the account with any accumulated before:
        merge(info, aggregate);

        return aggregate;
    }
}
```
⑤ 通过Realm进行认证最终的逻辑判断，我们此处以应用只存在单个Realm来进行介绍。Realm首先会通过realm.supports(token)进行验证，验证Realm是否支持对应的token进行认证操作，如果返回true，将会进行认证逻辑处理，否则直接忽略认证逻辑，如果我们的应用只想处理授权，可以自定义Realm，并将supports方法返回false即可。

Realm会通过token与INI配置文件中的配置项进行对比，或者与我们数据库存储的数据进行对比，如果相同则认证通过。

## 1.4 IniRealm认证实现
Shiro默认使用IniRealm
![](https://upload-images.jianshu.io/upload_images/4685968-97ed24283f538cbc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
但是前提是我们在INI配置中指定了[users]或[roles]有效配置数据，否则就会用配置中指定的securityManager的realms，如果两者都没有指定那么就会抛出错误，因为Shiro应用，至少要配置一个Realm

IniRealm在初始化onInit()时，会将已经加载的INI文件中的[users]、[roles]配置进行处理，分别转换为SimpleRole、SimpleAccount，再将SimpleAccount与SimpleRole进行绑定，至此，IniRealm对INI配置文件处理已经完毕。

但是认证的操作并没有完成，IniRealm仍需要与传递过来的token进行对比，判断是否相同，具体的判断逻辑交由AuthenticatingRealm来进行。
## 1.5 AuthenticatingRealm
AuthenticatingRealm是Realm的顶级抽象实现类
![](https://upload-images.jianshu.io/upload_images/4685968-98ace36ff056ac86.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
主要用于处理认证操作，至于授权等操作则交由该类的子类去处理。

AuthenticatingRealm拿到token后，会先去缓存中查找是否存在对应的认证信息，如果存在直接使用缓存中的认证信息与token进行比对，如果缓存中不存在，则直接获取IniRealm中的认证信息进行比对，比对通过后，返回认证成功的Subject对象。
