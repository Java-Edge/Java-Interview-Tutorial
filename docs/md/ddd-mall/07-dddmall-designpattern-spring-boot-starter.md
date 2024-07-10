# 07-dddmall-designpattern-spring-boot-starter

## 3 策略模式

### 3.1 策略的创建

策略模式包含一组同类的策略，通过类型判断创建哪种策略来使用。

可用工厂模式创建策略，以屏蔽策略创建细节：

```java
public class PaymentFactory {
    private static final Map<PayTypeEnum, Payment> payStrategies = new HashMap<>();

    static {
        payStrategies.put(PayTypeEnum.WX, new WxPayment());
        payStrategies.put(PayTypeEnum.ALIPAY, new AlipayPayment());
        payStrategies.put(PayTypeEnum.BANK_CARD, new BankCardPayment());
    }
    
    public static Payment getPayment(PayTypeEnum payType) {
        if (payType == null) {
            throw new IllegalArgumentException("pay type is empty.");
        }
        if (!payStrategies.containsKey(payType)) {
            throw new IllegalArgumentException("pay type not supported.");
        }
        return payStrategies.get(payType);
    }

}
```

或用 Spring 创建：

```java
@Component
public class PaymentFactory implements InitializingBean, ApplicationContextAware {
    private static final Map<PayTypeEnum, Payment> payStrategies = new HashMap<>();

    private ApplicationContext appContext;
    
    public static Payment getPayment(PayTypeEnum payType) {
        if (payType == null) {
            throw new IllegalArgumentException("pay type is empty.");
        }
        if (!payStrategies.containsKey(payType)) {
            throw new IllegalArgumentException("pay type not supported.");
        }
        return payStrategies.get(payType);
    }
    
    @Override
    public void setApplicationContext(@NonNull ApplicationContext applicationContext) {
        appContext = applicationContext;
    }
    
    @Override
    public void afterPropertiesSet() {
        // 将 Spring 容器中所有的 Payment 接口实现类注册到 payStrategies
        appContext.getBeansOfType(Payment.class)
                  .values()
                  .forEach(payment -> payStrategies.put(payment.getPayType(), payment));
    }

}
```

以上两种创建都是无状态：不包含成员变量，可被共享使用。

若策略类有状态，需根据业务场景每次创建新的策略对象，可在工厂方法中，每次生成新的策略对象，而非使用提前缓存好的策略对象。如：

```java
public class PaymentFactory {
    public static Payment getPayment(PayTypeEnum payType) {
        if (payType == null) {
            throw new IllegalArgumentException("pay type is empty.");
        }
        if (payType == PayTypeEnum.WX) {
            return new WxPayment();
        }
        if (payType == PayTypeEnum.ALIPAY) {
            return new AlipayPayment();
        }
        if (payType == PayTypeEnum.BANK_CARD) {
            return new BankCardPayment();
        }
        throw new IllegalArgumentException("pay type not supported.");
    }

}
```

### 3.2 策略的使用

事先不知会用啥策略，运行时再根据配置、用户输入、计算结果等决策策略。如根据用户选择，决定支付方式：

```java
Order order = 订单信息
PayResult payResult = PaymentFactory.getPayment(payType).pay(order);
if (payResult == PayResult.SUCCESS) {
    System.out.println("支付成功");
} else if (payType == 支付宝) {
    System.out.println("支付失败");
}
```

综上，接口类只负责业务策略的定义，每个策略的具体实现单独放在实现类中，工厂类 Factory 只负责获取具体实现类，而具体调用代码则负责业务逻辑的编排。

这些实现用到面向接口而非实现编程，满足职责单一、开闭原则，从而达到了功能上的高内聚低耦合、提高了可维护性、扩展性以及代码的可读性。

### 3.3 onApplicationEvent()与run()区别



`ApplicationListener<ApplicationInitializingEvent>`#onApplicationEvent()

CommandLineRunner#run()

#### 功能

onApplicationEvent()，事件监听器，在应用初始化过程中处理特定事件。可执行与应用初始化相关操作。

CommandLineRunner#run()，在应用程序启动后执行一些命令行任务或操作。

#### 触发时机

onApplicationEvent()在应用程序初始化过程中，当特定事件被触发时才调用。

run()在应用程序启动后立即执行，无需等待特定事件触发。

#### 使用方式

onApplicationEvent()需将实现类注册为事件监听器，并根据具体事件类型进行触发和处理

run()直接在实现类上实现该方法，在应用程序启动时自动执行。

### 3.4 抽象接口行为

```java
/**
 * 策略执行抽象
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
public interface AbstractExecuteStrategy<REQUEST, RESPONSE> {
    
    /**
     * 执行策略标识
     */
    String mark();
    
    /**
     * 执行策略
     *
     * @param requestParam 执行策略入参
     */
    default void execute(REQUEST requestParam) {
        
    }
    
    /**
     * 执行策略，带返回值
     *
     * @param requestParam 执行策略入参
     * @return 执行策略后返回值
     */
    default RESPONSE executeResp(REQUEST requestParam) {
        return null;
    }
}
```

策略选择器

```java
/**
 * 策略选择器
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
public class AbstractStrategyChoose implements ApplicationListener<ApplicationInitializingEvent> {
    
    /**
     * 执行策略集合
     */
    private final Map<String, AbstractExecuteStrategy> abstractExecuteStrategyMap = new HashMap<>();
    
    /**
     * 根据 mark 查询具体策略
     *
     * @param mark 策略标识
     * @return 实际执行策略
     */
    public AbstractExecuteStrategy choose(String mark) {
        return Optional.ofNullable(abstractExecuteStrategyMap.get(mark)).orElseThrow(() -> new ServiceException(String.format("[%s] 策略未定义", mark)));
    }
    
    /**
     * 根据 mark 查询具体策略并执行
     *
     * @param mark         策略标识
     * @param requestParam 执行策略入参
     * @param <REQUEST>    执行策略入参范型
     */
    public <REQUEST> void chooseAndExecute(String mark, REQUEST requestParam) {
        AbstractExecuteStrategy executeStrategy = choose(mark);
        executeStrategy.execute(requestParam);
    }
    
    /**
     * 根据 mark 查询具体策略并执行，带返回结果
     *
     * @param mark         策略标识
     * @param requestParam 执行策略入参
     * @param <REQUEST>    执行策略入参范型
     * @param <RESPONSE>   执行策略出参范型
     * @return
     */
    public <REQUEST, RESPONSE> RESPONSE chooseAndExecuteResp(String mark, REQUEST requestParam) {
        AbstractExecuteStrategy executeStrategy = choose(mark);
        return (RESPONSE) executeStrategy.executeResp(requestParam);
    }
    
    @Override
    public void onApplicationEvent(ApplicationInitializingEvent event) {
        Map<String, AbstractExecuteStrategy> actual = ApplicationContextHolder.getBeansOfType(AbstractExecuteStrategy.class);
        actual.forEach((beanName, bean) -> {
            AbstractExecuteStrategy beanExist = abstractExecuteStrategyMap.get(bean.mark());
            if (beanExist != null) {
                throw new ServiceException(String.format("[%s] Duplicate execution policy", bean.mark()));
            }
            abstractExecuteStrategyMap.put(bean.mark(), bean);
        });
    }
}

```

支付策略

```java
/**
 * 阿里支付组件
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
@Slf4j
@Service
@RequiredArgsConstructor
public final class AliPayNativeHandler extends AbstractPayHandler implements AbstractExecuteStrategy<PayRequest, PayResponse> {
    
    private final AliPayProperties aliPayProperties;
    
    @SneakyThrows(value = AlipayApiException.class)
    @Override
    public PayResponse pay(PayRequest payRequest) {
        AliPayRequest aliPayRequest = payRequest.getAliPayRequest();
        AlipayConfig alipayConfig = BeanUtil.convert(aliPayProperties, AlipayConfig.class);
        AlipayClient alipayClient = new DefaultAlipayClient(alipayConfig);
        AlipayTradePagePayModel model = new AlipayTradePagePayModel();
        model.setOutTradeNo(aliPayRequest.getOrderRequestId());
        model.setTotalAmount(aliPayRequest.getTotalAmount());
        model.setSubject(aliPayRequest.getSubject());
        model.setProductCode("FAST_INSTANT_TRADE_PAY");
        AlipayTradePagePayRequest request = new AlipayTradePagePayRequest();
        request.setNotifyUrl(aliPayProperties.getNotifyUrl());
        request.setBizModel(model);
        AlipayTradePagePayResponse response = alipayClient.pageExecute(request);
        log.info("发起支付宝支付，订单号：{}，子订单号：{}，订单请求号：{}，订单金额：{} \n调用支付返回：\n\n{}\n",
                aliPayRequest.getOrderSn(),
                aliPayRequest.getOutOrderSn(),
                aliPayRequest.getOrderRequestId(),
                aliPayRequest.getTotalAmount(),
                response.getBody());
        return new PayResponse(response.getBody());
    }
    
    @Override
    public String mark() {
        return StrBuilder.create()
                .append(PayChannelEnum.ALI_PAY.name())
                .append("_")
                .append(PayTradeTypeEnum.NATIVE.name())
                .toString();
    }
    
    @Override
    public PayResponse executeResp(PayRequest requestParam) {
        return pay(requestParam);
    }
}
```