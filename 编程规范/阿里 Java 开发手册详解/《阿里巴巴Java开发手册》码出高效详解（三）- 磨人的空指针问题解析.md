#  1 引导语
话不多说，先看手册指引的规范
![](https://img-blog.csdnimg.cn/20200204171730661.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/2020020417181021.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

手册已经帮助我们总结了常见问题场景，让我们详细了解下这些场景吧。
# 2 问世间空指针为何物
## 2.1 源码定位
![](https://img-blog.csdnimg.cn/2020020417225118.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
应用需要一个对象时却传入了 `null`，包含如下场景：
1. 调用 null 对象的实例方法
2. 访问或者修改 null 对象的属性
3. 获取值为 null 的数组的长度
4. 访问或者修改值为 null 的二维数组的列时
5. 把 null 当做 Throwable 对象抛出时。

在开发中遇到这些场景时，务必注意代码处理，防止NPE。
## 2.2 继承体系![](https://img-blog.csdnimg.cn/20200204185225287.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
# 3. 空指针案例全方位 show
## 3.1 基本的 bug 生产场景
- 集合为 null 则抛NPE
![](https://img-blog.csdnimg.cn/20200206172226518.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
- type 属性为 null 则抛NPE
![](https://img-blog.csdnimg.cn/20200206172324609.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
可能觉得这个例子太简单，看到输入的参数有 null 自己肯定会考虑空指针问题，但请注意，你自己写对外的接口时，可是并不知道用户参数会不会为 null 哦。

## 3.2 固步自封得返回对象
为了避免空指针或避免检查到 null 参数抛异常，直接返回一个空参构造函数创建的对象：

```java
/**
 * 根据订单编号查询订单
 *
 * @param orderNo 订单编号
 * @return 订单
 */
public Order getByOrderNo(String orderNo) {

    if (StringUtils.isEmpty(orderNo)) {
        return new Order();
    }
    // 查询order
    return doGetByOrderNo(orderNo);
}
```
单数据的查询接口，参数检查不符时会抛异常或者返回 null。
少有上述的写法，因为外部调用者的习惯是看到结果不为 null 就直接使用其中的字段。

外部调用判断返回值不为 null , 外部就会大胆得调用实例函数，导致NPE。

## 3.3 @NonNull 属性反序列化
有一订单更新的 RPC 接口，该接口有一个 *OrderUpdateParam* 参数，之前有两个属性一个是 id 一个是 name 。
在某个需求时，新增了一个 extra 属性，且该字段不能为 null 。

采用 lombok 的 @NonNull 注解来避免空指针：

```java
import lombok.Data;
import lombok.NonNull;

import java.io.Serializable;

@Data
public class OrderUpdateParam implements Serializable {
    private static final long serialVersionUID = 3240762365557530541L;

    private Long id;

    private String name;

     // 其它属性
  
    // 新增的属性
    @NonNull
    private String extra;
}
```

上线后导致没有使用最新 jar 包的服务对该接口的 RPC 调用报错。

我们来分析一下原因，在 IDEA 的 target - classes 目录下找到 DEMO 编译后的 class 文件，IDEA 会自动帮我们反编译：

```java
public class OrderUpdateParam implements Serializable {
    private static final long serialVersionUID = 3240762365557530541L;
    private Long id;
    private String name;
    @NonNull
    private String extra;

    public OrderUpdateParam(@NonNull final String extra) {
        if (extra == null) {
            throw new NullPointerException("extra is marked non-null but is null");
        } else {
            this.extra = extra;
        }
    }

    @NonNull
    public String getExtra() {
        return this.extra;
    }
    public void setExtra(@NonNull final String extra) {
        if (extra == null) {
            throw new NullPointerException("extra is marked non-null but is null");
        } else {
            this.extra = extra;
        }
    }
  // 其他代码

}
```

> 还可以使用反编译工具：JD-GUI 对编译后的 class 文件进行反编译，查看源码。

由于调用方调用的是不含 extra 属性的 jar 包，并且序列化编号是一致的，反序列化时会抛出 NPE。

```bash
Caused by: java.lang.NullPointerException: extra

​        at com.xxx.OrderUpdateParam.<init>(OrderUpdateParam.java:21)
```

RPC 参数新增 lombok 的 @NonNull 注解时，要考虑调用方是否及时更新 jar 包，避免出现空指针。

## 3.4 自动拆箱
### 案例 1
```java
@Data
/**
 * 我们自己服务的对象
 */
public class GoodCreateDTO {
    private String title;

    private Long price;

    private Long count;
}

@Data
/**
 * 我们调用服务的参数对象
 */
public class GoodCreateParam implements Serializable {

    private static final long serialVersionUID = -560222124628416274L;
    private String title;

    private long price;

    private long count;
}
```

GoodCreateDTO 的 count 字段在我们的系统中是非必传参数，在本系统内可能为 null。
如果我们没有拉取源码的习惯，直接通过前面的转换工具类去转换。我们会潜意识地认为外部接口的对象类型也都是包装类型，这时候很容易因为转换出现 NPE。

- 转换工具类
```java
public class GoodCreateConverter {

    public static GoodCreateParam convertToParam(GoodCreateDTO goodCreateDTO) {
        if (goodCreateDTO == null) {
            return null;
        }
        GoodCreateParam goodCreateParam = new GoodCreateParam();
        goodCreateParam.setTitle(goodCreateDTO.getTitle());
        goodCreateParam.setPrice(goodCreateDTO.getPrice());
        goodCreateParam.setCount(goodCreateDTO.getCount());
        return goodCreateParam;
    }
}
```
当转换器执行到 `goodCreateParam.setCount(goodCreateDTO.getCount());` 会自动拆箱会报NPE

当 GoodCreateDTO 的 count 属性为 null 时，自动拆箱将报NPE

### 案例 2
调用如下的二方服务接口：

```java
public Boolean someRemoteCall();
```

然后自以为对方肯定会返回 TRUE 或 FALSE，然后直接拿来作为判断条件或者转为基本类型，如果返回的是 null，则会报NPE。

```java
if (someRemoteCall()) {
           // 业务代码
 }
```

## 3.5 分批调用合并结果时空指针
因为某些批量查询的二次接口在数据较大时容易超时，因此可以分为小批次调用。

下面封装一个将 List 数据拆分成每 size 个一批数据，去调用 function RPC 接口，然后将结果合并。
![](https://img-blog.csdnimg.cn/20200205013958911.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
设想如果某个批次请求无数据，不是返回空集合而是 null，会怎样？
很不幸，又一个NPE向你飞来 …

此时要根据具体业务场景来判断如何处理这里可能产生的 NPE

如果在某个场景中，返回值为 null 是一定不允许的行为，可以在 function 函数中对结果进行检查，如果结果为 null，可抛异常。

如果是允许的，在调用 map 后，可以过滤 null :

```java
// 省略前面代码
.map(function)
.filter(Objects::nonNull)
// 省略后续代码
```

# 4 预防指南
![](https://img-blog.csdnimg.cn/20200205014206427.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
## 4.1 接口开发者
### 4.1.1 返回空集合
如果参数不符合要求直接返回空集合，底层的函数也使用一致的方式：

```java
public List<Order> getByOrderName(String name) {
    if (StringUtils.isNotEmpty(name)) {
        return doGetByOrderName(name);
    }
    return Collections.emptyList();
}
```

### 4.1.2 使用 Optional
Optional 是 Java 8 引入的特性，返回一个 Optional 则明确告诉使用者结果可能为空：

```java
public Optional<Order> getByOrderId(Long orderId) {
    return Optional.ofNullable(doGetByOrderId(orderId));
}
```

如果大家感兴趣可以进入 Optional 的源码，结合前面介绍的 codota 工具进行深入学习，也可以结合《Java 8 实战》的相关章节进行学习。

### 4.1.3 使用空对象设计模式
该设计模式为了解决 NPE 产生原因的case1，经常需要先判空再继续执行方法：

```java
public void doSomeOperation(Operation operation) {
    int a = 5;
    int b = 6;
    if (operation != null) {
        operation.execute(a, b);
    }
}
```

《设计模式之禅》（第二版）554 页在拓展篇讲述了 “空对象模式”。

可以构造一个 NullXXX 类拓展自某个接口， 这样这个接口需要为 null 时，直接返回该对象即可：

```java
public class NullOperation implements Operation {

    @Override
    public void execute(int a, int b) {
        // do nothing
    }
}
```

这样上面的判空操作就不再有必要， 因为我们在需要出现 null 的地方都统一返回 NullOperation，而且对应的对象方法都是有的：

```java
public void doSomeOperation(Operation operation) {
    int a = 5;
    int b = 6;
    operation.execute(a, b);
}
```

## 4.2 接口调用者
### 4.2.1 null 检查
正如 clean code 所说
![](https://img-blog.csdnimg.cn/20200205155851419.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
> 可以进行参数检查，对不满足的条件抛出异常。

直接在使用前对不能为 null 的和不满足业务要求的条件进行检查，是一种最简单最常见的做法。

通过防御性参数检测，可以极大降低出错的概率，提高程序的健壮性：

```java
@Override
public void updateOrder(OrderUpdateParam orderUpdateParam) {
    checkUpdateParam(orderUpdateParam);
    doUpdate(orderUpdateParam);
}

private void checkUpdateParam(OrderUpdateParam orderUpdateParam) {
    if (orderUpdateParam == null) {
        throw new IllegalArgumentException("参数不能为空");
    }
    Long id = orderUpdateParam.getId();
    String name = orderUpdateParam.getName();
    if (id == null) {
        throw new IllegalArgumentException("id不能为空");
    }
    if (name == null) {
        throw new IllegalArgumentException("name不能为空");
    }
}
```

- JDK线程池方法
![](https://img-blog.csdnimg.cn/20200205204921131.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

- Spring 中的AbstractApplicationContext#assertBeanFactoryActive
![](https://img-blog.csdnimg.cn/20200205205122421.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

### 4.2.2 使用 Objects
可以使用 Java 7 引入的 Objects 类，来简化判空抛出空指针的代码。

使用方法如下：

```java
private void checkUpdateParam2(OrderUpdateParam orderUpdateParam) {
    Objects.requireNonNull(orderUpdateParam);
    Objects.requireNonNull(orderUpdateParam.getId());
    Objects.requireNonNull(orderUpdateParam.getName());
}
```
- 原理很简单，我们看下源码
![](https://img-blog.csdnimg.cn/20200205205641553.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
### 4.2.3 使用 commons 工具包
#### 4.2.3.1 字符串工具类：org.apache.commons.lang3.StringUtils
```java
public void doSomething(String param) {
    if (StringUtils.isNotEmpty(param)) {
        // 使用param参数
    }
}
```

#### 4.2.3.2 校验工具类：org.apache.commons.lang3.Validate

```java
public static void doSomething(Object param) {
    Validate.notNull(param,"param must not null");
}
public static void doSomething2(List<String> parms) {
    Validate.notEmpty(parms);
}
```

该校验工具类支持多种类型的校验，支持自定义提示文本等。


```java
public static <T extends Collection<?>> T notEmpty(final T collection, final String message, final Object... values) {
    if (collection == null) {
        throw new NullPointerException(String.format(message, values));
    }
    if (collection.isEmpty()) {
        throw new IllegalArgumentException(String.format(message, values));
    }
    return collection;
}
```

该如果集合对象为 null 则会抛NPE 如果集合为空则抛出 IllegalArgumentException。

### 4.2.4 集合工具类：org.apache.commons.collections4.CollectionUtils

```java
public void doSomething(List<String> params) {
    if (CollectionUtils.isNotEmpty(params)) {
        // 使用params
    }
}
```

### 4.2.5 使用 guava 包
可以使用 guava 包的 `com.google.common.base.Preconditions` 前置条件检测类。

同样看源码，源码给出了一个范例。原始代码如下：

```java
public static double sqrt(double value) {
    if (value < 0) {
        throw new IllegalArgumentException("input is negative: " + value);
    }
    // calculate square root
}
```

使用 Preconditions 后，代码可以简化为：

 

```java
public static double sqrt(double value) {
   checkArgument(value >= 0, "input is negative: %s", value);
   // calculate square root
 }
```

 

Spring 例子：
- org.springframework.context.annotation.AnnotationConfigApplicationContext#register
![](https://img-blog.csdnimg.cn/20200205232057366.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

- org.springframework.util.Assert#notEmpty(java.lang.Object[], java.lang.String)
![](https://img-blog.csdnimg.cn/20200205232259179.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

虽然使用的具体工具类不一样，核心的思想都是一致的。

### 4.2.6 自动化 API
### 4.2.6.1 lombok # @Nonnull

```java
 public void doSomething5(@NonNull String param) {
      // 使用param
      proccess(param);
 }
```

编译后的代码：

```java
 public void doSomething5(@NonNull String param) {
      if (param == null) {
          throw new NullPointerException("param is marked non-null but is null");
      } else {
          this.proccess(param);
      }
  }
```

#### 4.2.6.2 IntelliJ IDEA#  @NotNull && @Nullable
maven 依赖如下：

```xml
<!-- https://mvnrepository.com/artifact/org.jetbrains/annotations -->
<dependency>
    <groupId>org.jetbrains</groupId>
    <artifactId>annotations</artifactId>
    <version>17.0.0</version>
</dependency>
```

@NotNull 在参数上的用法和上面的例子非常相似。

```java
public static void doSomething(@NotNull String param) {
    // 使用param
    proccess(param);
}
```

# 5. 总结
本节主要讲述空指针的含义，空指针常见的中枪姿势，以及如何避免空指针异常。下一节将为你揭秘 当 switch 遇到空指针，又会发生什么奇妙的事情。

# 参考
- 《 阿里巴巴Java 开发手册 1.5.0：华山版》
-  《Java Language Specification: Java SE 8 Edition》
- 码出规范：《阿里巴巴Java开发手册》详解

