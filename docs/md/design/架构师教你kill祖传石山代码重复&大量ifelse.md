# 架构师教你kill祖传石山代码重复&大量ifelse

本文就教你如何优雅消除重复代码并改变你对业务代码没技术含量的观念。

## 1 crud 工程师之“痛”

很多 crud 工程师抱怨业务开发没有技术含量，什么设计模式、高并发都用不到，就是堆CRUD。每次面试被问到“讲讲常用设计模式？”，都只能把单例讲到精通，其他设计模式即使听过也只会简单说说，因为根本没实际用过。
对于反射、注解，也只是知道在框架中用的很多，但自己又不写框架，更不知道该如何使用。

- 设计模式是世界级软件大师在大型项目的经验所得，是被证实利于维护大型项目的。
- 反射、注解、泛型等高级特性在框架被大量使用，是因为框架往往需要以同一套算法应对不同数据结构，而这些特性可以帮助减少重复代码，也是利于维护。

提升项目的可维护性是每个 coder 必须注意的，非常重要的一个手段就是减少代码重复，因为重复过多会导致：

- 容易修改一处忘记修改另一处，造成Bug
- 有一些代码并非完全重复，而是相似度高，修改这些类似的代码容易改（cv）错，把原本有区别的地方改成一样

## 2 工厂+模板方法模式

消除多if和重复代码！

### 2.1 需求

开发购物车下单，对不同用户不同处理：

- 普通用户需要收取运费，运费是商品价格的10%，无商品折扣
- VIP用户同样需要收取商品价格10%的快递费，但购买两件以上相同商品时，第三件开始享受一定折扣
- 内部用户可以免运费，无商品折扣

实现三种类型的购物车业务逻辑，把入参Map对象（K：商品ID，V：商品数量），转换为出参购物车类型Cart。

###  2.2 菜鸟实现

- 购物车
  ![](https://img-blog.csdnimg.cn/20201025224823758.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

- 购物车中的商品
  ![](https://img-blog.csdnimg.cn/20201025225037879.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

### 2.2.1 普通用户

![](https://img-blog.csdnimg.cn/20201025230743632.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)


### 2.2.2 VIP用户

VIP用户能享受同类商品多买的折扣。只需额外处理多买折扣部分。
![](https://img-blog.csdnimg.cn/20201025231001596.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

### 2.2.3 内部用户

免运费、无折扣，只处理商品折扣和运费时的逻辑差异。
![](https://img-blog.csdnimg.cn/20201025231120780.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

**三种购物车超过一半代码重复。**
虽然不同类型用户计算运费和优惠的方式不同，但整个购物车的初始化、统计总价、总运费、总优惠和支付价格逻辑都一样。

**代码重复本身不可怕，可怕的是漏改或改错**。
比如，写VIP用户购物车的同学发现商品总价计算有Bug，不应该是把所有Item的price加在一起，而是应该把所有Item的`price*quantity`相加。
他可能只修VIP用户购物车的代码，漏了普通用户、内部用户的购物车中重复逻辑实现的相同Bug。

有三个购物车，就需根据不同用户类型使用不同购物车。

- 使用多if实现不同类型用户调用不同购物车process
- ![](https://img-blog.csdnimg.cn/20201025231313298.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

就只能不断增加更多的购物车类，写重复的购物车逻辑、写更多if逻辑吗？
当然不是，**相同的代码应该只在一处出现**！

### 2.3 重构秘技 - 模板方法模式

可以把重复逻辑定义在抽象类，三个购物车只要分别实现不同部分的逻辑。
这其实就是**模板方法模式**。
在父类中实现购物车处理的流程模板，然后把需要特殊处理的留抽象方法定义，让子类去实现。由于父类逻辑无法单独工作，因此需要定义为抽象类。

如下代码所示，AbstractCart抽象类实现了购物车通用的逻辑，额外定义了两个抽象方法让子类去实现。其中，processCouponPrice方法用于计算商品折扣，processDeliveryPrice方法用于计算运费。
![](https://img-blog.csdnimg.cn/20201025231522267.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)


有抽象类，三个子类的实现就简单了。

- 普通用户的购物车NormalUserCart，实现0优惠和10%运费
  ![](https://img-blog.csdnimg.cn/2020102523161665.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

- VIP用户的购物车VipUserCart，直接继承NormalUserCart，只需修改多买优惠策略
  ![](https://img-blog.csdnimg.cn/20201025231840673.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

- 内部用户购物车InternalUserCart最简单，直接设置0运费、0折扣
  ![](https://img-blog.csdnimg.cn/20201025231929708.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

### 抽象类和三个子类的实现关系图

![](https://img-blog.csdnimg.cn/20201025205252522.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

### 2.4 重构秘技之工厂模式 - 消除多if

既然三个购物车都叫`XXXUserCart`，可将用户类型字符串拼接`UserCart`构成购物车Bean的名称，然后利用IoC容器，通过Bean的名称直接获取到AbstractCart，调用其process方法即可实现通用。

这就是工厂模式，借助Spring容器实现：
![](https://img-blog.csdnimg.cn/20201025232047710.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

若有新用户类型、用户逻辑，只要新增一个XXXUserCart类继承AbstractCart，实现特殊的优惠和运费处理逻辑即可。

工厂+模板方法模式，消除了重复代码，还避免修改既有代码。这就是设计模式中的OCP：对修改关闭，对扩展开放。

## 3 注解+反射消除重复代码

### 3.1 需求

银行提供了一些API接口，对参数的序列化不使用JSON，而需要我们把参数依次拼在一起构成一个大字符串。

- 按照银行提供的API文档的顺序，把所有参数构成定长的数据，然后拼接在一起作为整个字符串
- 因为每种参数都有固定长度，未达到长度时需填充：
  - 字符串类型的参数不满长度部分需要以下划线右填充，也就是字符串内容靠左
  - 数字类型的参数不满长度部分以0左填充，也就是实际数字靠右
  - 货币类型的表示需要把金额向下舍入2位到分，以分为单位，作为数字类型同样进行左填充。
    对所有参数做MD5操作作为签名（为了方便理解，Demo中不涉及加盐处理）。

比如，创建用户方法和支付方法的定义是这样的：

![](https://img-blog.csdnimg.cn/20201025211145124.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

![](https://img-blog.csdnimg.cn/20201025211155432.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

### 3.2 菜鸟实现

直接根据接口定义实现填充、加签名、请求调用：

```java
public class BankService {

    // 创建用户
    public static String createUser(String name, String identity, String mobile, int age) throws IOException {
        StringBuilder stringBuilder = new StringBuilder();
        // 字符串靠左，多余的地方填充_
        stringBuilder.append(String.format("%-10s", name).replace(' ', '_'));
        stringBuilder.append(String.format("%-18s", identity).replace(' ', '_'));
        // 数字靠右，多余的地方用0填充
        stringBuilder.append(String.format("%05d", age));
        // 字符串靠左
        stringBuilder.append(String.format("%-11s", mobile).replace(' ', '_'));
        // MD5签名
        stringBuilder.append(DigestUtils.md2Hex(stringBuilder.toString()));
        return Request.Post("http://localhost:45678/reflection/bank/createUser")
                .bodyString(stringBuilder.toString(), ContentType.APPLICATION_JSON)
                .execute().returnContent().asString();
    }
    
    // 支付
    public static String pay(long userId, BigDecimal amount) {
        StringBuilder sb = new StringBuilder();
        // 数字靠右
        sb.append(String.format("%020d", userId));
        // 金额向下舍入2位到分，以分为单位，作为数字靠右，多余的地方用0填充
        sb.append(String.format("%010d", amount.setScale(2, RoundingMode.DOWN).multiply(new BigDecimal("100")).longValue()));
        // MD5签名
        sb.append(DigestUtils.md2Hex(stringBuilder.toString()));
        return Request.Post("http://localhost:45678/reflection/bank/pay")
                .bodyString(sb.toString(), ContentType.APPLICATION_JSON)
                .execute().returnContent().asString();
    }
}
```

这段代码的重复粒度更细：

- 三种标准数据类型的处理逻辑有重复
- 处理流程中字符串拼接、加签和发请求的逻辑，在所有方法重复
- 实际方法的入参的参数类型和顺序，不一定和接口要求一致，容易出错
- 代码层面针对每一个参数硬编码，无法清晰地进行核对，如果参数达到几十个、上百个，出错的概率极大。

### 3.3 重构之自定义注解&反射

针对银行请求的所有逻辑均使用一套代码实现，不会出现任何重复。

要实现接口逻辑和逻辑实现的剥离，首先要以POJO类定义所有的接口参数。

- 创建用户API的参数

```java
@Data
public class CreateUserAPI {
    private String name;
    private String identity;
    private String mobile;
    private int age;
}
```

有了接口参数定义，就能自定义注解，为接口和所有参数增加一些元数据。如定义一个接口API的注解BankAPI，包含接口URL地址和接口说明

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Inherited
public @interface BankAPI {
    String desc() default "";

    String url() default "";
}
```

再自定义注解`@BankAPIField`，描述接口的每一个字段规范，包含参数的次序、类型和长度三个属性：

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@Documented
@Inherited
public @interface BankAPIField {

    /**
     * 参数的次序
     * @return
     */
    int order() default -1;

    /**
     * 长度
     * @return
     */
    int length() default -1;

    /**
     * 类型
     * @return
     */
    String type() default "";
}
```

定义`CreateUserAPI`描述创建用户接口的信息，为接口增加@BankAPI，来补充接口的URL和描述等元数据；为每个字段增加@BankAPIField，来补充参数的顺序、类型和长度等元数据：

```java
@BankAPI(url = "/bank/createUser", desc = "创建用户接口")
@Data
public class CreateUserAPI extends AbstractAPI {
    @BankAPIField(order = 1, type = "S", length = 10)
    private String name;
    @BankAPIField(order = 2, type = "S", length = 18)
    private String identity;
    @BankAPIField(order = 4, type = "S", length = 11)
    private String mobile;
    @BankAPIField(order = 3, type = "N", length = 5)
    private int age;
}
```

类似的PayAPI类：

```java
@BankAPI(url = "/bank/pay", desc = "支付接口")
@Data
public class PayAPI extends AbstractAPI {
    @BankAPIField(order = 1, type = "N", length = 20)
    private long userId;
    @BankAPIField(order = 2, type = "M", length = 10)
    private BigDecimal amount;
}
```

他俩继承的AbstractAPI类是空实现，因为该例接口无公共数据。

```java
public abstract class AbstractAPI {

}
```

通过这俩类，即可快速核对API清单表格。若核心翻译过程（把注解和接口API序列化为请求需要的字符串）没问题，只要注解和表格一致，API请求翻译就没问题。这就通过注解实现了对API参数的描述。

下面看反射咋配合注解实现动态的接口参数组装：

```java
private static String remoteCall(AbstractAPI api) throws IOException {
    // 从类上获得 @BankAPI，获其URL属性以远程调用
    BankAPI bankAPI = api.getClass().getAnnotation(BankAPI.class);
    bankAPI.url();
    StringBuilder stringBuilder = new StringBuilder();
    // 使用stream快速实现，并把字段按order属性排序，然后设置私有字段反射可访问
    Arrays.stream(api.getClass().getDeclaredFields()) //获得所有字段
	    	     // 过滤带 @BankAPIField 的字段
            .filter(field -> field.isAnnotationPresent(BankAPIField.class))
            // 根据注解的order属性，对字段排序
            .sorted(Comparator.comparingInt(a -> a.getAnnotation(BankAPIField.class).order()))
      			 // 设置可访问私有字段	
            .peek(field -> field.setAccessible(true))
            .forEach(field -> {
            	// 实现了反射获取注解的值，然后根据BankAPIField拿到的参数类型，按照三种标准进行格式化，将所有参数的格式化逻辑集中在了这一处
                // 获得注解
                BankAPIField bankAPIField = field.getAnnotation(BankAPIField.class);
                Object value = "";
                try {
                    // 反射获取字段值
                    value = field.get(api);
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                }
                // 根据字段类型以正确的填充方式格式化字符串
                switch (bankAPIField.type()) {
                    case "S": {
                        stringBuilder.append(String.format("%-" + bankAPIField.length() + "s", value.toString()).replace(' ', '_'));
                        break;
                    }
                    case "N": {
                        stringBuilder.append(String.format("%" + bankAPIField.length() + "s", value.toString()).replace(' ', '0'));
                        break;
                    }
                    case "M": {
                        if (!(value instanceof BigDecimal))
                            throw new RuntimeException(String.format("{} 的 {} 必须是BigDecimal", api, field));
                        stringBuilder.append(String.format("%0" + bankAPIField.length() + "d", ((BigDecimal) value).setScale(2, RoundingMode.DOWN).multiply(new BigDecimal("100")).longValue()));
                        break;
                    }
                    default:
                        break;
                }
            });
    // 实现参数加签和请求调用
    // 签名逻辑stringBuilder.append(DigestUtils.md2Hex(stringBuilder.toString()));
    String param = stringBuilder.toString();
    long begin = System.currentTimeMillis();
    // 请求
    String result = Request.Post("http://localhost:45678/reflection" + bankAPI.url())
            .bodyString(param, ContentType.APPLICATION_JSON)
            .execute().returnContent().asString();
    return result;
}
```

所有处理参数排序、填充、加签、请求调用的核心逻辑，都汇聚在`remoteCall`。有这方法，BankService每个接口实现就简单了：参数组装，再调用remoteCall。

![](https://img-blog.csdnimg.cn/2020102523304434.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

涉及类结构性的通用处理，都可按照该模式减少重复代码：

- 反射使我们在不知类结构时，按固定逻辑处理类成员
- 注解给我们为这些成员补充元数据的能力，使我们利用反射实现通用逻辑时，可从外部获得更多关心的数据

## 4  属性拷贝

对于三层架构系统，层间解耦及每层对数据的不同需求，每层都会有自己的POJO实体。
手动写这些实体之间的赋值代码，容易出错。对于复杂业务系统，实体有几十甚至几百个属性也很正常。比如ComplicatedOrderDTO，描述一个订单中几十个属性。如果转换为一个类似的DO，复制其中大部分的字段，然后把数据入库，势必需要进行很多属性映射赋值操作。就像这样，密密麻麻的代码是不是已经让你头晕了？

```java
ComplicatedOrderDTO orderDTO = new ComplicatedOrderDTO();
ComplicatedOrderDO orderDO = new ComplicatedOrderDO();
orderDO.setAcceptDate(orderDTO.getAcceptDate());
orderDO.setAddress(orderDTO.getAddress());
orderDO.setAddressId(orderDTO.getAddressId());
orderDO.setCancelable(orderDTO.isCancelable());
orderDO.setCommentable(orderDTO.isComplainable()); //属性错误
orderDO.setComplainable(orderDTO.isCommentable()); //属性错误
orderDO.setCancelable(orderDTO.isCancelable());
orderDO.setCouponAmount(orderDTO.getCouponAmount());
orderDO.setCouponId(orderDTO.getCouponId());
orderDO.setCreateDate(orderDTO.getCreateDate());
orderDO.setDirectCancelable(orderDTO.isDirectCancelable());
orderDO.setDeliverDate(orderDTO.getDeliverDate());
orderDO.setDeliverGroup(orderDTO.getDeliverGroup());
orderDO.setDeliverGroupOrderStatus(orderDTO.getDeliverGroupOrderStatus());
orderDO.setDeliverMethod(orderDTO.getDeliverMethod());
orderDO.setDeliverPrice(orderDTO.getDeliverPrice());
orderDO.setDeliveryManId(orderDTO.getDeliveryManId());
orderDO.setDeliveryManMobile(orderDO.getDeliveryManMobile()); //对象错误
orderDO.setDeliveryManName(orderDTO.getDeliveryManName());
orderDO.setDistance(orderDTO.getDistance());
orderDO.setExpectDate(orderDTO.getExpectDate());
orderDO.setFirstDeal(orderDTO.isFirstDeal());
orderDO.setHasPaid(orderDTO.isHasPaid());
orderDO.setHeadPic(orderDTO.getHeadPic());
orderDO.setLongitude(orderDTO.getLongitude());
orderDO.setLatitude(orderDTO.getLongitude()); //属性赋值错误
orderDO.setMerchantAddress(orderDTO.getMerchantAddress());
orderDO.setMerchantHeadPic(orderDTO.getMerchantHeadPic());
orderDO.setMerchantId(orderDTO.getMerchantId());
orderDO.setMerchantAddress(orderDTO.getMerchantAddress());
orderDO.setMerchantName(orderDTO.getMerchantName());
orderDO.setMerchantPhone(orderDTO.getMerchantPhone());
orderDO.setOrderNo(orderDTO.getOrderNo());
orderDO.setOutDate(orderDTO.getOutDate());
orderDO.setPayable(orderDTO.isPayable());
orderDO.setPaymentAmount(orderDTO.getPaymentAmount());
orderDO.setPaymentDate(orderDTO.getPaymentDate());
orderDO.setPaymentMethod(orderDTO.getPaymentMethod());
orderDO.setPaymentTimeLimit(orderDTO.getPaymentTimeLimit());
orderDO.setPhone(orderDTO.getPhone());
orderDO.setRefundable(orderDTO.isRefundable());
orderDO.setRemark(orderDTO.getRemark());
orderDO.setStatus(orderDTO.getStatus());
orderDO.setTotalQuantity(orderDTO.getTotalQuantity());
orderDO.setUpdateTime(orderDTO.getUpdateTime());
orderDO.setName(orderDTO.getName());
orderDO.setUid(orderDTO.getUid());
```

如果原始的DTO有100个字段，我们需要复制90个字段到DO中，保留10个不赋值，最后应该如何校验正确性呢？

- 数数吗？即使数出有90行代码，也不一定正确，因为属性可能重复赋值
- 有时字段名相近，比如complainable和commentable，容易搞反
- 对两个目标字段重复赋值相同的来源字段
- 明明要把DTO的值赋值到DO中，却在set的时候从DO自己取值，导致赋值无效

使用类似`BeanUtils`这种Mapping工具来做Bean的转换，`copyProperties`方法还允许我们提供需要忽略的属性：

![](https://img-blog.csdnimg.cn/20201025233148273.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

## 5 总结

重复代码多了总有一天会出错。

- 有多个并行的类实现相似的代码逻辑
  考虑提取相同逻辑在父类中实现，差异逻辑通过抽象方法留给子类实现。使用类似的模板方法把相同的流程和逻辑固定成模板，保留差异的同时尽可能避免代码重复。同时，可以使用Spring的IoC特性注入相应的子类，来避免实例化子类时的大量if…else代码。

- 使用硬编码的方式重复实现相同的数据处理算法
  考虑把规则转换为自定义注解，作为元数据对类或对字段、方法进行描述，然后通过反射动态读取这些元数据、字段或调用方法，实现规则参数和规则定义的分离。也就是说，把变化的部分也就是规则的参数放入注解，规则的定义统一处理。

- 业务代码中常见的DO、DTO、VO转换时大量字段的手动赋值，遇到有上百个属性的复杂类型，非常非常容易出错
  不要手动进行赋值，考虑使用Bean映射工具进行。此外，还可以考虑采用单元测试对所有字段进行赋值正确性校验。

代码重复度是评估一个项目质量的重要指标，如果一个项目几乎没有任何重复代码，那么它内部抽象一定非常好。重构时，首要任务是消除重复。

参考：

- 《重构》
- 搞定代码重复的三个绝招
- https://blog.csdn.net/qq_32447301/article/details/107774036