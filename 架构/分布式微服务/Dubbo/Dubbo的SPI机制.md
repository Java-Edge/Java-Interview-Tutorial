Dubbo 没使用 Java SPI，而重新实现了一套功能更强的 SPI。

Dubbo SPI 逻辑封装在 ExtensionLoader 类，通过 ExtensionLoader，可加载指定实现类。Dubbo SPI 所需配置文件需放置在 `META-INF/dubbo` 路径：![](https://img-blog.csdnimg.cn/20201220143821997.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

配置内容如下：
```java
Protocol protocol = ExtensionLoader
					.getExtensionLoader(Protocol.class)
					.getAdaptiveExtension();
```
Dubbo要判断系统运行时，应该选用该Protocol接口的哪个实现类。
它会去找一个你配置的Protocol，将你配置的Protocol实现类，加载进JVM，将其实例化。

微内核，可插拔，大量的组件，Protocol负责RPC调用的东西，你可以实现自己的RPC调用组件，实现Protocol接口，给自己的一个实现类即可。
这行代码就是Dubbo里大量使用的，对很多组件都保留一个接口和多个实现，然后在系统运行的时候动态根据配置去找到对应实现类。
若你没配置，那就走默认实现。
# 实例
![](https://img-blog.csdnimg.cn/2020122014531547.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
在Dubbo自己的jar里
在`/META_INF/dubbo/internal/com.alibaba.dubbo.rpc.Protocol`文件中：
![](https://img-blog.csdnimg.cn/20201220145724211.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20201220150004508.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20201220150358794.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
即可看到Dubbo的SPI机制默认流程，就是Protocol接口
- **@SPI("dubbo")**
通过SPI机制提供实现类，实现类是通过将`dubbo`作为默认key去配置文件里找到的，配置文件名称为接口全限定名，通过`dubbo`作为key可以找到默认的实现类`org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol`

> Dubbo的默认网络通信协议，就是dubbo协议，用的DubboProtocol
> 在 Java 的 SPI 配置文件里每一行只有一个实现类的全限定名，在 Dubbo的 SPI配置文件中是 key=value 的形式，我们只需要对应的 key 就能加载对应的实现。
# 源码
```java
/**
  * 返回指定名字的扩展。如果指定名字的扩展不存在，则抛异常 {@link IllegalStateException}.
  */
@SuppressWarnings("unchecked")
public T getExtension(String name) {
	if (name == null || name.length() == 0)
	    throw new IllegalArgumentException("Extension name == null");
	if ("true".equals(name)) {
	    return getDefaultExtension();
	}
	Holder<Object> holder = cachedInstances.get(name);
	if (holder == null) {
	    cachedInstances.putIfAbsent(name, new Holder<Object>());
	    holder = cachedInstances.get(name);
	}
	//  DCL(double check lock)
	Object instance = holder.get();
	if (instance == null) {
	    synchronized (holder) {
            instance = holder.get();
            if (instance == null) {
                instance = createExtension(name);
                holder.set(instance);
            }
        }
	}
	return (T) instance;
}
```
不用像 Java 原生的 SPI 那样去遍历加载对应的服务类，只需要通过 key 去寻找，并且寻找的时候会先从缓存的对象里去取。
```java
private T createExtension(String name) {
    Class<?> clazz = getExtensionClasses().get(name);
    if (clazz == null) {
        throw findException(name);
    }
    try {
        T instance = (T) EXTENSION_INSTANCES.get(clazz);
        if (instance == null) {
            EXTENSION_INSTANCES.putIfAbsent(clazz, clazz.newInstance());
            instance = (T) EXTENSION_INSTANCES.get(clazz);
        }
        injectExtension(instance);
        Set<Class<?>> wrapperClasses = cachedWrapperClasses;
        if (CollectionUtils.isNotEmpty(wrapperClasses)) {
            for (Class<?> wrapperClass : wrapperClasses) {
                instance = injectExtension((T) wrapperClass.getConstructor(type).newInstance(instance));
            }
        }
        initExtension(instance);
        return instance;
    } catch (Throwable t) {
        throw new IllegalStateException("Extension instance (name: " + name + ", class: " +
                type + ") couldn't be instantiated: " + t.getMessage(), t);
    }
}
```

若想动态替换默认实现类，需使用`@Adaptive`接口。Protocol接口中，有两个方法添加了`@Adaptive`注解，就是说那俩接口会被代理实现。

比如这个Protocol接口搞了俩`@Adaptive`注解了方法，在运行时会针对Protocol生成代理类，该代理类的那俩方法中会有代理代码，代理代码会在运行时动态根据url中的protocol来获取key(默认是dubbo)，也可以自己指定，如果指定了别的key，那么就会获取别的实现类的实例。通过这个url中的参数不同，就可以控制动态使用不同的组件实现类

# 扩展Dubbo组件
自己写个工程，可以打成jar包的那种哦
- 里面的`src/main/resources`目录下
- 搞一个`META-INF/services`
- 里面放个文件叫：`com.alibaba.dubbo.rpc.Protocol`
- 文件里搞一个`my=com.javaedge.MyProtocol`
- 自己把jar弄到nexus私服
- 然后自己搞一个dubbo provider工程，在这个工程里面依赖你自己搞的那个jar
- 然后在spring配置文件里给个配置：
```xml
<dubbo:protocol name=”my” port=”20000” />
```
这个时候provider启动的时候，就会加载到我们jar包里的`my=com.javaedge.MyProtocol`这行配置，接着会根据你的配置使用你定义好的MyProtocol了，这个就是简单说明一下，你通过上述方式，可以替换掉大量的dubbo内部的组件，就是扔个你自己的jar包，然后配置一下即可~
- Dubbo的SPI原理图
![](https://img-blog.csdnimg.cn/20190709133144886.png)
Dubbo中提供了大量的类似上面的扩展点。
你要扩展一个东西，只需自己写个jar，让你的consumer或者是provider工程，依赖它，在你的jar里指定目录下配置好接口名称对应的文件，里面通过`key=实现类`然后对对应的组件，用类似`<dubbo:protocol>`用你的哪个key对应的实现类来实现某个接口，你可以自己去扩展dubbo的各种功能，提供你自己的实现!