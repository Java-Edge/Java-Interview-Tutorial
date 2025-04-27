# 策略模式（Strategy Pattern）

## 1 简介

### 1.1 定义

也叫政策模式（Policy Pattern）

#### wiki

对象有某个行为，但是在不同的场景中，该行为有不同的实现算法。

如每个人都要“交个人所得税”，但是“在美国交个人所得税”和“在中国交个人所得税”就有不同算税方法。

#### 定义

Define a family of algorithms,encapsulate each one,and make them interchangeable.
定义一组算法，将每个算法都封装起来，并且使它们之间可互换。

每种算法可以根据当前场景相互替换，从而使算法的变化独立于使用它们的客户端（即算法的调用者）。

常见 if/else 结构。

### 1.2 类型

行为型。
在`运行时`(**非编译时**)改变软件的算法行为。

### 1.3 主要思想

定义一个通用问题，使用不同算法实现，然后将这些算法都封装在统一接口。

策略模式使用的就是OOP的继承和多态。

### 1.4 主要角色

#### 通用类图

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20230901104310625.png)



#### Context 环境封装

即上下文角色，起承上启下的封装作用。屏蔽高层模块对策略&算法的直接访问，封装可能存在的变化。

持有一个策路类的引用，最终给客户端调用。

#### Strategy 抽象策略

策略&算法家族的抽象，通常为接口，定义每个策略或算法必须的方法和属性。

#### ConcreteStrategy 具体策略

实现抽象策略定义的接口，提供具体算法实现。

#### 通用源码

抽象策略角色：一个非常普通的接口，在项目中就是一个普通接口，定义一或多个具体算法。

## 2 适用场景

一个对象，其行为有些固定不变，有些又容易变化。对于这些容易变化的行为，我们不希望将其实现绑定在对象，而希望能动态针对不同场景产生不同应对策略。
就用到策略模式，就是为应对对象中复杂多变的行为而产生的：

- 系统有很多类，而他们的区别仅在于行为不同
- 一个系统需要动态地在几种算法中选择一种



当一个类存在两个独立变化的维度，目这两个维度都需要进行扩展时
当一个系统不希望使用继承，或因多层次继承导致系统类的个数急剧增加时
当一个系统需要在构件的抽象化角色、具体化角色之间增加更多的灵活性时

## 3 优点

- 符合OCP
- 避免使用多重条件转移语句
  e.g. 省去大量 if/else、switch，降低代码耦合度
- 提高算法的保密性和安全性
  只需知道策略的业务功能，而不关心内部实现

## 4 缺点

- 客户端须知所有策略类，并决定使用哪个策略类
- 产生很多策略类

## 5 相关设计模式的差异

前面的都是策略模式表述。

### 5.1 V.S 工厂模式

- 行为型
  接收已创建好的对象实现不同行为
- 创造型
  接收指令，创建符合要求的具体对象

### 5.2 V.S 状态模式

- 若系统中某类的某行为存在多种实现方式，客户端需知使用哪个策略
- 若系统中某对象存在多种状态，不同状态下的行为又有差异，状态之间会自动转换，客户端无需关心具体状态

### 5.3 V.S 模板模式

- 注重选择结果，只有选择权（由用户自己选择已有算法）
- 关心业务流程的固定（修改某部分的逻辑，但不影响流程执行）。侧重点不是选择，你没得选，你必须这么做。你可参与某部分内容的自定义

### 5.4 V.S 命令模式

注重命令的个数，分类相当于菜单（内容如何定义）。没有UI以前的DOC界面。

```bash
请选择以下功能：
1.开户   2.转账   3.挂失   4.退出

1：
1.信用卡    2.借记卡
```



### 5.5 V.S 多态

多态：Java语法（有些语言的语法是不支持多态的，它照样也要用来实现业务逻辑，也要使用设计模式）
策略：是一种经验的总结

## 6 实战

### 价格策略



![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20230901134751994.png)

促销策略接口

```java
package com.javaedge.design.pattern.behavioral.strategy;

/**
 * 促销策略接口
 *
 * @author JavaEdge
 * @date 2019/1/16
 */
public interface PromotionStrategy {

    /**
     * 促销
     */
    void doPromotion();
}

```

满减策略：

```java
package com.javaedge.design.pattern.behavioral.strategy;

/**
 * 满减策略
 *
 * @author JavaEdge
 * @date 2019/1/16
 */
public class FullOffPromotionStrategy implements PromotionStrategy {
    @Override
    public void doPromotion() {
        System.out.println("满减促销,满200减20元");
    }
}

```

改造后的测试类：

```java
PromotionActivity promotionActivity = null;

String promotionKey = "LIJIAN";

if (StringUtils.equals(promotionKey, "LIJIAN")) {
    promotionActivity = new PromotionActivity(new MinusPromotionStrategy());
} else if (StringUtils.equals(promotionKey, "FANXIAN")) {
    promotionActivity = new PromotionActivity(new CashBackPromotionStrategy());
}//...

promotionActivity.executePromotionStrategy();
```

if/else 过多，采取策略+工厂模式结合

策略工厂：

```java
package com.javaedge.design.pattern.behavioral.strategy;

import java.util.HashMap;
import java.util.Map;

/**
 * 策略工厂
 *
 * @author JavaEdge
 * @date 2019/1/16
 */
public class PromotionStrategyFactory {

    private static Map<String, PromotionStrategy> PROMOTION_STRATEGY_MAP = new HashMap<>();

    static{
        PROMOTION_STRATEGY_MAP.put(PromotionKey.LIJIAN, new MinusPromotionStrategy());
        PROMOTION_STRATEGY_MAP.put(PromotionKey.MANJIAN, new FullOffPromotionStrategy());
        PROMOTION_STRATEGY_MAP.put(PromotionKey.FANXIAN, new CashBackPromotionStrategy());
    }

    private static final PromotionStrategy NON_PROMOTION = new EmptyPromotionStrategy();

    /**
     * 不希望外部调用
     */
    private PromotionStrategyFactory() {}

    public static PromotionStrategy getPromotionStrategy(String promotionKey) {
        PromotionStrategy promotionStrategy = PROMOTION_STRATEGY_MAP.get(promotionKey);
        return promotionStrategy == null ? NON_PROMOTION : promotionStrategy;
    }

    /**
     * 填充 map 中的 key
      */
    private interface PromotionKey {
        String LIJIAN = "LIJIAN";
        String FANXIAN = "FANXIAN";
        String MANJIAN = "MANJIAN";
    }
}
```

最新测试类：

```java
String promotionKey = "LIJIAN";
PromotionActivity promotionActivity = new PromotionActivity(
        PromotionStrategyFactory.getPromotionStrategy(promotionKey));

promotionActivity.executePromotionStrategy();
```

### 支付方式策略

支付时，可根据实际选择不同支付方式（微信支付、支付宝、银行卡支付等），这些支付方式即是不同策略。通常看到如下实现：

```java
Order order = 订单信息
if (payType == 微信支付) {
    ...
} else if (payType == 支付宝) {
    支付宝支付流程
} else if (payType == 银行卡) {
    银行卡支付流程
} else {
    暂不支持的支付方式
}
```

虽写着简单，但违反面向对象2个基本原则：

- 单一职责原则：一个类只有1个发生变化的原因。之后修改任何逻辑，当前方法都会被修改
- 开闭原则：对扩展开放，对修改关闭。当需要增加、减少某种支付方式(积分支付/组合支付)或增加优惠券等功能时，不可避免要修改代码

特别当 if-else 块中的代码量比较大时，后续的扩展和维护会变得非常复杂且容易出错。在阿里《Java开发手册》中，有这样的规则：超过3层的 if-else 的逻辑判断代码可以使用卫语句、策略模式、状态模式等来实现。

策略模式是解决过多 if-else（或者 switch-case） 代码块的方法之一，提高代码的可维护性、可扩展性和可读性。从策略的定义、创建和使用这三个方面以上述网购支付为示例来分别进行说明。

策略的定义
策略接口的定义，通常包含两个方法：获取策略类型的方法和处理策略业务逻辑的方法。

```java
// 第三方支付
public interface Payment {

	// 获取支付方式
  PayTypeEnum getPayType();

  /**
    * 支付调用
    * 
    * @param order 订单信息
    * @return 响应，支付结果
    */
  PayResult pay(Order order);
}
```

策略接口的实现，每种支付类都实现了上述接口（基于接口而非实现编程），这样我们可以灵活的替换不同的支付方式。

每种支付方式的实现：

```java
@Component
public class WxPayment implements Payment {

@Override
public PayTypeEnum getPayType() {
   return PayTypeEnum.WX;
}

@Override
public PayResult pay(Order order) {
   // 调用微信支付
   if (成功) {
       return PayResult.SUCCESS;
   } else {
       return PayResult.FAIL;
   }
}
```

```java
// 支付宝支付
@Component
public class AlipayPayment implements Payment {

@Override
public PayTypeEnum getPayType() {
   return PayTypeEnum.ALIPAY;
}

@Override
public PayResult pay(Order order) {
   // 调用支付宝支付
   if (成功) {
       return PayResult.SUCCESS;
   } else {
       return PayResult.FAIL;
   }
}

}
```

```java
// 银行卡支付
@Component
public class BankCardPayment implements Payment {

@Override
public PayTypeEnum getPayType() {
   return PayTypeEnum.BANK_CARD;
}

@Override
public PayResult pay(Order order) {
   // 调用银行卡支付
   if (成功) {
       return PayResult.SUCCESS;
   } else {
       return PayResult.FAIL;
   }
}
}
```

## 7 框架应用

### 7.1 JDK的比较器

策略比较器：

```java
 * @param <T> the type of objects that may be compared by this comparator
 *
 * @author  Josh Bloch
 * @author  Neal Gafter
 * @see Comparable
 * @see java.io.Serializable
 * @since 1.2
 */
@FunctionalInterface
public interface Comparator<T> {
     boolean equals(Object obj);
}
```

具体策略：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/5164f272a4ffe415b36d676ebab13c84.png)

如Arrays类中的 sort 方法通过传入不同比较器实现达到不同排序策略：

```java
public final class Arrays {

  public static <T> void sort(T[] a, Comparator<? super T> c) {
      if (c == null) {
          sort(a);
      } else {
          if (LegacyMergeSort.userRequested)
              legacyMergeSort(a, c);
          else
              TimSort.sort(a, 0, a.length, c, null, 0, 0);
      }
  }
}
```

### 7.2 JDK的TreeMap

类似于促销活动中有促销策略对象，在T reeMap 中也有比较器对象

```java
public class TreeMap<K,V>
    extends AbstractMap<K,V>
    implements NavigableMap<K,V>, Cloneable, java.io.Serializable
{
    /**
     * The comparator used to maintain order in this tree map, or
     * null if it uses the natural ordering of its keys.
     *
     * @serial
     */
    @SuppressWarnings("serial") // Conditionally serializable
    private final Comparator<? super K> comparator;
```

compare 方法进步加工：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/format%252Cpng-20240320122215980.png)

### 7.3 Spring的Resource

不同访问策略：

```java
// 资源描述符的接口，该描述符从基础资源的实际类型（如文件或类路径资源）中抽象出来
// 若 InputStream 以物理形式存在，则可为每个资源打开它，但只能为某些资源返回 URL 或 File 句柄
public interface Resource extends InputStreamSource {
```

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240320131536330.png)

### 7.4 Spring bean初始化InstantiationStrategy

两种 bean 初始化策略：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240320121809393.png)