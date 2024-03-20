# 策略模式Strategy Pattern

## 1 简介

### 1.1 定义

也叫政策模式（Policy Pattern）

#### wiki

对象有某个行为，但是在不同的场景中，该行为有不同的实现算法。

如每个人都要“交个人所得税”，但是“在美国交个人所得税”和“在中国交个人所得税”就有不同算税方法。

#### 定义

Define a family of algorithms,encapsulate each one,and make them interchangeable.
定义一组算法，将每个算法都封装起来，并且使它们之间可互换。

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

## 7 源码应用解析

### 7.1 JDK中的比较器接口

策略比较器：
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTMwNzY2Njg5NmMzZDE4MDAucG5n?x-oss-process=image/format,png)
![具体策略](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQ5MjhkZDE2YmVhNDRhNjAucG5n?x-oss-process=image/format,png)

如Arrays类中的 sort 方法通过传入不同比较接口器的实现达到不同排序策略：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/format%252Cpng.png)

### 7.2 JDK中的TreeMap

类似于促销活动中有促销策略对象，在T reeMap 中也有比较器对象

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/format%252Cpng-20240320122203514.png)

compare 方法进步加工：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/format%252Cpng-20240320122215980.png)

### 7.3 Spring 中的Resource

不同访问策略：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/format%252Cpng-20240320122225193.png)



### 7.4 Spring bean 初始化InstantiationStrategy

两种 bean 的初始化策略：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240320121809393.png)