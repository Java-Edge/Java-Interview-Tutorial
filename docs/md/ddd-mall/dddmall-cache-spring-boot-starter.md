# dddmall-cache-spring-boot-starter



#### 缓存穿透布隆过滤器

```java
/**
 * 防止缓存穿透的布隆过滤器
 */
@Bean
@ConditionalOnProperty(prefix = BloomFilterPenetrateProperties.PREFIX, name = "enabled", havingValue = "true", matchIfMissing = true)
public RBloomFilter<String> cachePenetrationBloomFilter(RedissonClient redissonClient, BloomFilterPenetrateProperties bloomFilterPenetrateProperties) {
    RBloomFilter<String> cachePenetrationBloomFilter = redissonClient.getBloomFilter(bloomFilterPenetrateProperties.getName());
    cachePenetrationBloomFilter.tryInit(bloomFilterPenetrateProperties.getExpectedInsertions(), bloomFilterPenetrateProperties.getFalseProbability());
    return cachePenetrationBloomFilter;
}
```

#### 静态代理模式

静态代理模式：Redis 客户端代理类增强

```java
@Bean
public StringRedisTemplateProxy stringRedisTemplateProxy(RedisKeySerializer redisKeySerializer,
                                                         StringRedisTemplate stringRedisTemplate,
                                                         RedissonClient redissonClient) {
    stringRedisTemplate.setKeySerializer(redisKeySerializer);
    return new StringRedisTemplateProxy(stringRedisTemplate, redisDistributedProperties, redissonClient);
}
```

使用静态代理模式自己实现一个StringRedisTemplateProxy类，而非直接通过Spring的@Bean注解引入框架自带的StringRedisTemplate实例，主要有以下几个好处：

定制化：通过静态代理类，可不修改原StringRedisTemplate类基础，增加额外功能。如在代理类中添加日志记录、性能监控、安全检查等功能

解耦：静态代理类作为中间层，减少业务代码与第三方库的直接依赖。这样，如果未来需要替换底层的Redis客户端，只需修改代理类而不影响业务代码

增强控制：代理类可控制对被代理类的访问，实现懒加载、权限控制等高级功能

统一管理：若项目中多处使用到StringRedisTemplate，通过代理类可以统一管理这些使用点，便于维护和更新

扩展性：静态代理类可以根据需要实现多个接口，提供更丰富的功能，而直接使用Spring的@Bean注解引入的实例则受限于原有类的功能。

总之，使用静态代理模式自定义StringRedisTemplateProxy类，提供了更大的灵活性和控制力，有助于构建更加健壮和可维护的应用。