Spring 3.1后引入注解缓存，其本质不是一个具体的缓存实现，而是一个对缓存使用的抽象。
通过在既有代码中添加少量自定义注解，即可够达到使用缓存对象和缓存方法的返回对象的效果。
Spring的缓存技术具备相当的灵活性，不仅能够使用SpEL来定义缓存的key和各种condition，还提供开箱即用的缓存临时存储方案，也支持和主流的专业缓存集成。

# 特点
- 基于注解和AOP，使用方便
- 开箱即用，不用安装和部署额外的第三方组件即可使用缓存
- 可以配置Condition和SPEL，能使用对象的任何属性或者方法来定义缓存的key和使用规则条件
- 支持自定义key和自定义缓存管理者，具有相当的灵活性和可扩展性
- 绕过Spring的话，注解无效

Spring Cache的关键原理就是Spring AOP，通过Spring AOP实现了在方法调用前、调用后获取方法的入参和返回值，进而实现了缓存的逻辑。而Spring Cache利用了Spring AOP的动态代理技术，即当客户端尝试调用pojo的foo()方法的时候，给它的不是pojo自身的引用，而是一个动态生成的代理类
- Spring动态代理调用图
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtZDNlNjRlYjVjOTNlYmMwYy5wbmc?x-oss-process=image/format,png)
如上图所示，实际客户端获取的是一个代理的引用，在调用foo()方法的时候，会首先调用proxy的foo()方法，这个时候proxy可以整体控制实际的pojo.foo()方法的入参和返回值，比如缓存结果，比如直接略过执行实际的foo()方法等，都是可以轻松做到的。

Spring Cache主要使用如下注解
- @Cacheable
- @CachePut
- @CacheEvict

主要针对方法上注解使用，部分场景也可类上注解。当在类上使用时，该类所有方法都将受影响。

作用和配置方法表：

| 标签类型 | 作用 | 主要配置参数说明 |
| --- | --- | --- |
| @Cacheable | 主要针对方法配置，能够根据方法的请求参数对其结果进行缓存 | **value**：缓存的名称，在 Spring 配置文件中定义，必须指定至少一个<br></br> **key**：缓存的 key，可为null，若指定要按 SpEL 表达式编写，若不指定，则默认按方法的所有参数进行组合 <br></br> **condition**：缓存的条件，可为null，使用 SpEL 编写，返回 true 或者 false，为 true 时才进行缓存 |
| @CachePut | 主要针对方法配置，能够根据方法的请求参数对其结果进行缓存，和 @Cacheable 不同的是，它每次都会触发真实方法的调用 | 同上 |
| @CacheEvict | 主要针对方法配置，能够根据一定的条件对缓存进行清空 | 同上。 <br></br>**allEntries**：是否清空所有缓存内容，默认为 false，如果指定为 true，则方法调用后将立即清空所有缓存； <br></br>**beforeInvocation**：是否在方法执行前就清空，默认为 false，如果指定为 true，则在方法还没有执行的时候就清空缓存，默认情况下，如果方法执行抛出异常，则不会清空缓存 |

### 可扩展
Spring注解能满足一般应用对缓存的需求，但随着应用服务的复杂化，大并发高可用性能要求下，需要进行一定的扩展，这时对其自身集成的缓存方案可能不太适用，该怎么办？



这能满足一般应用的缓存需求，但当用户量上去或性能跟不上，总需要进行扩展，这时你或许对其提供的内存缓存不满意了，因为其不支持高可用，也不持久化。这时就需要自定义你缓存方案了，Spring也想到了这点。

先不考虑如何持久化缓存，毕竟这种三方实现很多，要考虑的是，怎么利用Spring提供的扩展点实现我们自己的缓存，且在不改原来已有代码的情况下进行扩展，是否在方法执行前就清空，默认为false，如果指定为true，则在方法还没有执行的时候就清空缓存，默认情况下，如果方法执行抛出异常，则不会清空缓存。
三步：
- 提供一个CacheManager接口的实现（继承AbstractCacheManager），管理自身的cache实例
- 实现自己的cache实例MyCache(继承至Cache)，在这里面引入我们需要的第三方cache或自定义cache
- 对配置项进行声明，将MyCache实例注入CacheManager进行统一管理。

# 自定义注解缓存
注解缓存的使用，可有效增强代码可读性，同时统一管理缓存，提供较好的可扩展性。
为此，酒店商家端在Spring注解缓存基础上，自定义了适合自身业务特性的注解缓存。
主要使用两个标签，即**@HotelCacheable**、**@HotelCacheEvict**，其作用和配置方法见下表：
| 标签类型 | 作用 | 主要配置参数说明 |
| --- | --- | --- |
| @HotelCacheable | 主要针对方法配置，能够根据方法的请求参数对其结果进行缓存 | **domain**作用域，针对集合场景，解决批量更新问题； **domainKey**作用域对应的缓存key； **key**缓存对象key 前缀； **fieldKey**缓存对象key，与前缀合并生成对象key； **condition**缓存获取前置条件，支持spel语法； **cacheCondition**缓存刷入前置条件，支持spel语法； **expireTime**超时时间设置 |
| @HotelCacheEvict | 主要针对方法配置，能够根据一定的条件对缓存进行清空 | **同上** |

增加作用域的概念，解决商家信息变更下，多重重要信息实时更新的问题。
- 域缓存处理图
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMDBkZWVmMzBkNWRjNTY5OS5wbmc?x-oss-process=image/format,png)
如上图，按旧方案，当cache0发送变化时，为保持信息的实时更新，需手动删除cache1、cache2、cache3的缓存。
`增加域缓存概念`，cache0、cache1、cache2、cache3是以账号ID为基础，相互存在影响约束的集合体，我们作为一个域集合，增加域缓存处理，当cache0发送变化时，整体的账号ID domain域已发生更新，自动影响cache1、cache2、cache3等处的缓存数据。将相关联逻辑缓存统一化，有效提升代码可读性，同时更好服务业务，账号重点信息能够实时变更刷新，相关服务响应速度提升。

增加cacheCondition缓存刷入前置判断，有效解决商家业务多重外部依赖场景下，业务降级有损服务下，业务数据一致性保证，不因为缓存的增加影响业务的准确性；自定义CacheManager缓存管理器，可以有效兼容公共基础组件Medis、Cellar相关服务，在对应用程序不做改动的情况下，有效切换缓存方式；同时，统一的缓存服务AOP入口，结合接入Mtconfig统一配置管理，对应用内缓存做好降级准备，一键关闭缓存。

Spring Cache的原理是基于动态生成的proxy代理机制来进行切面处理，关键点是对象的引用问题，如果对象的方法是类里面的内部调用（this引用）而不是外部引用的场景下，会导致proxy失败，那么我们所做的缓存切面处理也就失效了。因此，应避免已注解缓存的方法在类里面的内部调用。

使用的key约束，缓存的key应尽量使用简单的可区别的元素，如ID、名称等，不能使用list等容器的值，或者使用整体model对象的值。非public方法无法使用注解缓存实现。

# 总结
注解驱动的Spring Cache能够极大的减少我们编写常见缓存的代码量，通过少量的注释标签和配置文件，即可达到使代码具备缓存的能力，且具备很好的灵活性和扩展性。但是我们也应该看到，Spring Cache由于基于Spring AOP技术，尤其是动态的proxy技术，导致其不能很好的支持方法的内部调用或者非public方法的缓存设置，当然这些都是可以解决的问题。

参考
- https://developer.ibm.com/zh/articles/os-cn-spring-cache/