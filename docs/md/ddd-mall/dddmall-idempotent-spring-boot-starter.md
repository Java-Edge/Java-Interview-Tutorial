# dddmall-idempotent-spring-boot-starter

## 1 注册幂等组件



```java
/**
 * 幂等自动装配
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
@EnableConfigurationProperties(IdempotentProperties.class)
public class IdempotentAutoConfiguration {
    
    /**
     * 幂等切面
     */
    @Bean
    public IdempotentAspect idempotentAspect() {
        return new IdempotentAspect();
    }
    
    /**
     * 参数方式幂等实现，基于 RestAPI 场景
     */
    @Bean
    @ConditionalOnMissingBean
    public IdempotentParamService idempotentParamExecuteHandler(RedissonClient redissonClient) {
        return new IdempotentParamExecuteHandler(redissonClient);
    }
    
    /**
     * Token 方式幂等实现，基于 RestAPI 场景
     */
    @Bean
    @ConditionalOnMissingBean
    public IdempotentTokenService idempotentTokenExecuteHandler(DistributedCache distributedCache,
                                                                IdempotentProperties idempotentProperties) {
        return new IdempotentTokenExecuteHandler(distributedCache, idempotentProperties);
    }
    
    /**
     * 申请幂等 Token 控制器，基于 RestAPI 场景
     */
    @Bean
    public IdempotentTokenController idempotentTokenController(IdempotentTokenService idempotentTokenService) {
        return new IdempotentTokenController(idempotentTokenService);
    }
    
    /**
     * SpEL 方式幂等实现，基于 RestAPI 场景
     */
    @Bean
    @ConditionalOnMissingBean
    public IdempotentSpELService idempotentSpELByRestAPIExecuteHandler(RedissonClient redissonClient) {
        return new IdempotentSpELByRestAPIExecuteHandler(redissonClient);
    }
    
    /**
     * SpEL 方式幂等实现，基于 MQ 场景
     */
    @Bean
    @ConditionalOnMissingBean
    public IdempotentSpELByMQExecuteHandler idempotentSpELByMQExecuteHandler(DistributedCache distributedCache) {
        return new IdempotentSpELByMQExecuteHandler(distributedCache);
    }
}
```

## 2 幂等执行处理器工厂

Q：为啥采用简单工厂模式？策略模式不行？

A：策略模式同可。但从设计模式语义来说，简单工厂模式更合适。

```java
/**
 * 幂等执行处理器工厂
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
public final class IdempotentExecuteHandlerFactory {
    
    /**
     * 获取幂等执行处理器
     *
     * @param scene 指定幂等验证场景类型
     * @param type  指定幂等处理类型
     * @return 幂等执行处理器
     */
    public static IdempotentExecuteHandler getInstance(IdempotentSceneEnum scene, IdempotentTypeEnum type) {
        IdempotentExecuteHandler result = null;
        switch (scene) {
            case RESTAPI:
                switch (type) {
                    case PARAM:
                        result = ApplicationContextHolder.getBean(IdempotentParamService.class);
                        break;
                    case TOKEN:
                        result = ApplicationContextHolder.getBean(IdempotentTokenService.class);
                        break;
                    case SPEL:
                        result = ApplicationContextHolder.getBean(IdempotentSpELByRestAPIExecuteHandler.class);
                        break;
                    default:
                        break;
                }
                break;
            case MQ:
                result = ApplicationContextHolder.getBean(IdempotentSpELByMQExecuteHandler.class);
                break;
            default:
                break;
        }
        return result;
    }
}
```

## 3 幂等执行处理器



```java
/**
 * 幂等执行处理器
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
public interface IdempotentExecuteHandler {
    
    /**
     * 幂等处理逻辑
     *
     * @param wrapper 幂等参数包装器
     */
    void handler(IdempotentParamWrapper wrapper);
    
    /**
     * 执行幂等处理逻辑
     *
     * @param joinPoint  AOP 方法处理
     * @param idempotent 幂等注解
     */
    void execute(ProceedingJoinPoint joinPoint, Idempotent idempotent);
    
    /**
     * 异常流程处理
     */
    default void exceptionProcessing() {
        
    }
    
    /**
     * 后置处理
     */
    default void postProcessing() {
        
    }
}
```

```java
/**
 * 基于 Token 验证请求幂等性, 通常应用于 RestAPI 方法
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
@RequiredArgsConstructor
public final class IdempotentTokenExecuteHandler extends AbstractIdempotentTemplate implements IdempotentTokenService {
    
    private final DistributedCache distributedCache;
    private final IdempotentProperties idempotentProperties;
    
    private static final String TOKEN_KEY = "idempotent-token";
    private static final String TOKEN_PREFIX_KEY = "idempotent:token:";
    private static final long TOKEN_EXPIRED_TIME = 6000;
    
    @Override
    protected IdempotentParamWrapper buildWrapper(ProceedingJoinPoint joinPoint) {
        return new IdempotentParamWrapper();
    }
    
    @Override
    public String createToken() {
        String token = Optional.ofNullable(Strings.emptyToNull(idempotentProperties.getPrefix())).orElse(TOKEN_PREFIX_KEY) + UUID.randomUUID();
        distributedCache.put(token, "", Optional.ofNullable(idempotentProperties.getTimeout()).orElse(TOKEN_EXPIRED_TIME));
        return token;
    }
    
    @Override
    public void handler(IdempotentParamWrapper wrapper) {
        HttpServletRequest request = ((ServletRequestAttributes) (RequestContextHolder.currentRequestAttributes())).getRequest();
        String token = request.getHeader(TOKEN_KEY);
        if (StrUtil.isBlank(token)) {
            token = request.getParameter(TOKEN_KEY);
            if (StrUtil.isBlank(token)) {
                throw new ClientException(BaseErrorCode.IDEMPOTENT_TOKEN_NULL_ERROR);
            }
        }
        Boolean tokenDelFlag = distributedCache.delete(token);
        if (!tokenDelFlag) {
            String errMsg = StrUtil.isNotBlank(wrapper.getIdempotent().message())
                    ? wrapper.getIdempotent().message()
                    : BaseErrorCode.IDEMPOTENT_TOKEN_DELETE_ERROR.message();
            throw new ClientException(errMsg, BaseErrorCode.IDEMPOTENT_TOKEN_DELETE_ERROR);
        }
    }
}
```

利用分布式缓存 Redis 实现幂等性。distributedCache 属性就是用来操作 Redis 缓存的对象。

- createToken() 方法中，调用 distributedCache.put() 将生成的幂等 Token 存储到 Redis 缓存，并设置TTL
- handler() 方法中，使用 distributedCache.delete() 从 Redis 缓存中删除幂等 Token

通过将幂等 Token 存储在 Redis，可实现分布式环境下的幂等性控制。不同节点上的服务可共享同一 Redis 缓存，确保相同的 Token 在任一节点上只能被成功处理一次。就能避免重复执行相同操作所带来的副作用和数据不一致性问题。

幂等性（Idempotency）在分布式系统中是一个重要概念，确保即使在多次执行相同操作的情况下，系统状态和结果保持不变。

本模块通过AOP（面向切面编程）实现幂等性设计，具有以下意义：

## 4 优点

### 4.1 技术角度

1. **解耦和重用**：通过AOP实现幂等性，将幂等逻辑与业务逻辑分离，提高了代码的重用性和可维护性。开发者可以专注于业务逻辑的实现，而幂等性保证由AOP统一处理。

2. **灵活性**：AOP提供了在不同层面（如方法前后、异常时）插入幂等性处理逻辑的能力，使得幂等性策略的实现更加灵活。例如，可以根据不同的业务场景选择不同的幂等实现策略（如基于Token、请求参数等）。

3. **减少侵入性**：使用AOP实现幂等性，无需修改业务方法的代码，只需在方法上添加相应的注解即可。这种非侵入式设计减少了对业务代码的影响。

### 4.2 业务角度

1. **提高系统稳定性**：在分布式环境下，网络请求可能会因为各种原因（如网络波动、服务重启）重复发送。AOP幂等性设计确保了系统能够处理这些重复请求，避免数据的不一致性，提高系统的稳定性和可靠性。

## 5 抽象模板方法



```java
/**
 * 抽象幂等执行处理器
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
public abstract class AbstractIdempotentTemplate implements IdempotentExecuteHandler {
    
    /**
     * 构建幂等验证过程中所需要的参数包装器
     *
     * @param joinPoint AOP 方法处理
     * @return 幂等参数包装器
     */
    protected abstract IdempotentParamWrapper buildWrapper(ProceedingJoinPoint joinPoint);
    
    /**
     * 执行幂等处理逻辑
     *
     * @param joinPoint  AOP 方法处理
     * @param idempotent 幂等注解
     */
    public void execute(ProceedingJoinPoint joinPoint, Idempotent idempotent) {
        // 模板方法模式：构建幂等参数包装器
        IdempotentParamWrapper idempotentParamWrapper = buildWrapper(joinPoint).setIdempotent(idempotent);
        handler(idempotentParamWrapper);
    }
}
```

## 6 AOP拦截器



```java
/**
 * 幂等注解 AOP 拦截器
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
@Aspect
public final class IdempotentAspect {
    
    /**
     * 增强方法标记 {@link Idempotent} 注解逻辑
     */
    @Around("@annotation(org.opengoofy.congomall.springboot.starter.idempotent.annotation.Idempotent)")
    public Object idempotentHandler(ProceedingJoinPoint joinPoint) throws Throwable {
        Idempotent idempotent = getIdempotent(joinPoint);
        IdempotentExecuteHandler instance = IdempotentExecuteHandlerFactory.getInstance(idempotent.scene(), idempotent.type());
        try {
            instance.execute(joinPoint, idempotent);
            return joinPoint.proceed();
        } catch (RepeatConsumptionException ex) {
            if (!ex.getError()) {
                return null;
            }
            throw ex;
        } finally {
            instance.postProcessing();
            IdempotentContext.clean();
        }
    }
    
    public static Idempotent getIdempotent(ProceedingJoinPoint joinPoint) throws NoSuchMethodException {
        MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();
        Method targetMethod = joinPoint.getTarget().getClass().getDeclaredMethod(methodSignature.getName(), methodSignature.getMethod().getParameterTypes());
        return targetMethod.getAnnotation(Idempotent.class);
    }
}
```