# 1 为什么需要新的日期和时间库？
Java开发人员的一个长期烦恼是对普通开发人员的日期和时间用例的支持不足。

例如，现有的类（例如java.util.Date和SimpleDateFormatter）是非线程安全的，从而导致用户潜在的并发问题，这不是一般开发人员在编写日期处理代码时会期望处理的问题。
一些日期和时间类还表现出相当差的API设计。例如，年份java.util.Date从1900开始，月份从1开始，天从0开始，这不是很直观。

这些问题以及其他一些问题导致第三方日期和时间库（例如Joda-Time）的欣欣向荣。

为了解决这些问题并在JDK内核中提供更好的支持，针对Java SE 8设计了一个新的没有这些问题的日期和时间API。该项目由Joda-Time（Stephen Colebourne）和Oracle的作者在JSR 310下共同领导，出现在Java SE 8软件包中java.time。


# 2 核心思想

## 不可变值类
Java现有格式化程序的严重缺陷之一是它们不是线程安全的。这给开发人员带来了负担，使其需要以线程安全的方式使用它们并在其日常处理日期处理代码的过程中考虑并发问题。新的API通过确保其所有核心类都是不可变的并表示定义明确的值来避免此问题。

## 域驱动
新的API模型与代表不同的用例类域非常精确Date和Time严密。这与以前的Java库不同，后者在这方面很差。例如，java.util.Date在时间轴上表示一个时刻（一个自UNIX纪元以来的毫秒数的包装器），但如果调用toString()，结果表明它具有时区，从而引起开发人员之间的困惑。

这种对域驱动设计的重视在清晰度和易理解性方面提供了长期利益，但是当从以前的API移植到Java SE 8时，您可能需要考虑应用程序的域日期模型。

## 按时间顺序分隔
新的API使人们可以使用不同的日历系统来满足世界某些地区（例如日本或泰国）用户的需求，而这些用户不一定遵循ISO-8601。这样做不会给大多数开发人员带来额外负担，他们只需要使用标准的时间顺序即可。


# 3 LocalDate、LocalTime、LocalDateTime
## 3.1 相比 Date 的优势
-  Date 和 SimpleDateFormatter 非线程安全，而 LocalDate 和 LocalTime 和 String 一样，是final类型 - 线程安全且不能被修改。
-  Date 月份从0开始,一月是0，十二月是11。LocalDate 月份和星期都改成了 enum ，不会再用错。
- Date是一个“万能接口”，它包含日期、时间，还有毫秒数。如果你只需要日期或时间那么有一些数据就没啥用。在新的Java 8中，日期和时间被明确划分为 LocalDate 和 LocalTime，LocalDate无法包含时间，LocalTime无法包含日期。当然，LocalDateTime才能同时包含日期和时间。
- Date 推算时间(比如往前推几天/ 往后推几天/ 计算某年是否闰年/ 推算某年某月的第一天、最后一天、第一个星期一等等)要结合Calendar要写好多代码，十分恶心！

两个都是本地的，因为它们从观察者的角度表示日期和时间，例如桌子上的日历或墙上的时钟。

还有一种称为复合类`LocalDateTime`，这是一个LocalDate和LocalTime的配对。 
![](https://img-blog.csdnimg.cn/20201009175215947.png#pic_center)

时区将不同观察者的上下文区分开来，在这里放在一边；不需要上下文时，应使用这些本地类。这些类甚至可以用于表示具有一致时区的分布式系统上的时间。


## 常用 API
### now()
获取在默认的时区系统时钟内的当前日期。该方法将查询默认时区内的系统时钟，以获取当前日期。
使用该方法将防止使用测试用的备用时钟，因为时钟是硬编码的。
![](https://img-blog.csdnimg.cn/20201102142033421.png#pic_center)

方便的加减年月日，而不必亲自计算！
![](https://img-blog.csdnimg.cn/20201102142431847.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

### plusMonths
返回此副本LocalDate添加了几个月的指定数目。
此方法将分三步指定金额的几个月字段：
-  将输入的月数加到month-of-year字段
- 校验结果日期是否无效
- 调整 day-of-month ，如果有必要的最后有效日期

例如，2007-03-31加一个月会导致无效日期2007年4月31日。并非返回一个无效结果，而是 2007-04-30才是最后有效日期。调用实例的不可变性不会被该方法影响。
![](https://img-blog.csdnimg.cn/20201102142220122.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

# 4 创建对象
## 工厂方法
新API中的所有核心类都是通过熟练的工厂方法构造。
- 当通过其构成域构造值时，称为工厂of
- 从其他类型转换时，工厂称为from
- 也有将字符串作为参数的解析方法。
![](https://img-blog.csdnimg.cn/20201009212940598.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFF00,t_70#pic_center)
## getter约定
- 为了从Java SE 8类获取值，使用了标准的Java getter约定，如下：
![](https://img-blog.csdnimg.cn/2020100921304067.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFF00,t_70#pic_centerr)
## 更改对象值
也可以更改对象值以执行计算。因为新API中所有核心类都是不可变的，所以将调用这些方法with并返回新对象，而不是使用setter。也有基于不同字段的计算方法。 
![](https://img-blog.csdnimg.cn/20201009213918638.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_25,color_FFFF00,t_70#pic_center)
## 调整器
新的API还具有调整器的概念—一块代码块，可用于包装通用处理逻辑。可以编写一个WithAdjuster，用于设置一个或多个字段，也可编写一个PlusAdjuster用于添加或减去某些字段。值类还可以充当调节器，在这种情况下，它们将更新它们表示的字段的值。内置调节器由新的API定义，但是如果您有想要重用的特定业务逻辑，则可以编写自己的调节器。

```java
import static java.time.temporal.TemporalAdjusters.*;

LocalDateTime timePoint = ...
foo = timePoint.with(lastDayOfMonth());
bar = timePoint.with(previousOrSame(ChronoUnit.WEDNESDAY));

// 使用值类作为调整器
timePoint.with(LocalTime.now()); 
```

# 5 截断
新的API通过提供表示日期，时间和带时间的日期的类型来支持不同的精确度时间点，但是显然，精确度的概念比此精确度更高。

该truncatedTo方法存在支持这种使用情况下，它可以让你的值截断到字段，如下

```java
LocalTime truncatedTime = time.truncatedTo(ChronoUnit.SECONDS);
```

# 6 时区
我们之前查看的本地类抽象了时区引入的复杂性。时区是一组规则，对应于标准时间相同的区域。大约有40个。时区由它们相对于协调世界时（UTC，Coordinated Universal Time）的偏移量定义。它们大致同步移动，但有一定差异。

时区可用两个标识符来表示：缩写，例如“ PLT”，更长的例如“ Asia / Karachi”。在设计应用程序时，应考虑哪种情况适合使用时区，什么时候需要偏移量。 

- `ZoneId`是区域的标识符。每个ZoneId规则都对应一些规则，这些规则定义了该位置的时区。在设计软件时，如果考虑使用诸如“ PLT”或“ Asia / Karachi”之类的字符串，则应改用该域类。一个示例用例是存储用户对其时区的偏好。
![](https://img-blog.csdnimg.cn/20201009215908334.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFF00,t_70#pic_centerr)

- `ZoneOffset`是格林威治/ UTC与时区之间的差异的时间段。可在特定的`ZoneId`，在特定时间被解析，如清单7所示。  

```java
ZoneOffset offset = ZoneOffset.of("+2:00");
```

# 7 时区类 
`ZonedDateTime`是具有完全限定时区的日期和时间。这样可以解决任何时间点的偏移。
最佳实践：若要表示日期和时间而不依赖特定服务器的上下文，则应使用`ZonedDateTime`。  

```java
ZonedDateTime.parse("2007-12-03T10:15:30+01:00[Europe/Paris]");
```

`OffsetDateTime`是具有已解决偏移量的日期和时间。这对于将数据序列化到数据库中很有用，如果服务器在不同时区，则还应该用作记录时间戳的序列化格式。

`OffsetTime` 是具有确定的偏移量的时间，如下：


```java
OffsetTime time = OffsetTime.now();
// changes offset, while keeping the same point on the timeline
OffsetTime sameTimeDifferentOffset = time.withOffsetSameInstant(
    offset);
// changes the offset, and updates the point on the timeline
OffsetTime changeTimeWithNewOffset = time.withOffsetSameLocal(
    offset);
// Can also create new object with altered fields as before
changeTimeWithNewOffset
 .withHour(3)
 .plusSeconds(2);
OffsetTime time = OffsetTime.now();
// changes offset, while keeping the same point on the timeline
OffsetTime sameTimeDifferentOffset = time.withOffsetSameInstant(
    offset);
// changes the offset, and updates the point on the timeline
OffsetTime changeTimeWithNewOffset = time.withOffsetSameLocal(
    offset);
// Can also create new object with altered fields as before
changeTimeWithNewOffset
 .withHour(3)
 .plusSeconds(2);
```

Java中已有一个时区类，java.util.TimeZone但Java SE 8并没有使用它，因为所有JSR 310类都是不可变的并且时区是可变的。

# 8 时间段（period）
Period代表诸如“ 3个月零一天”的值，它是时间线上的距离。这与到目前为止我们讨论过的其他类形成了鲜明的对比，它们是时间轴上的重点。

```java
// 3 年, 2 月, 1 天
Period period = Period.of(3, 2, 1);

// 使用 period 修改日期值
LocalDate newDate = oldDate.plus(period);
ZonedDateTime newDateTime = oldDateTime.minus(period);
// Components of a Period are represented by ChronoUnit values
assertEquals(1, period.get(ChronoUnit.DAYS)); 
// 3 years, 2 months, 1 day
Period period = Period.of(3, 2, 1);

// You can modify the values of dates using periods
LocalDate newDate = oldDate.plus(period);
ZonedDateTime newDateTime = oldDateTime.minus(period);
// Components of a Period are represented by ChronoUnit values
assertEquals(1, period.get(ChronoUnit.DAYS)); 
```

# 9 持续时间（Duration）
Duration是时间线上按时间度量的距离，它实现了与相似的目的Period，但精度不同：

```java
// 3 s 和 5 ns 的 Duration 
Duration duration = Duration.ofSeconds(3, 5);
Duration oneDay = Duration.between(today, yesterday);
// A duration of 3 seconds and 5 nanoseconds
Duration duration = Duration.ofSeconds(3, 5);
Duration oneDay = Duration.between(today, yesterday);
```

可以对Duration实例执行常规的加，减和“ with”运算，还可以使用修改日期或时间的值Duration。

# 10 年表
为了满足使用非ISO日历系统的开发人员的需求，Java SE 8引入了Chronology，代表日历系统，并充当日历系统中时间点的工厂。也有一些接口对应于核心时间点类，但通过


```java
Chronology:
ChronoLocalDate
ChronoLocalDateTime
ChronoZonedDateTime
Chronology:
ChronoLocalDate
ChronoLocalDateTime
ChronoZonedDateTime
```

这些类仅适用于正在开发高度国际化的应用程序且需要考虑本地日历系统的开发人员，没有这些要求的开发人员不应使用它们。有些日历系统甚至没有一个月或一周的概念，因此需要通过非常通用的字段API进行计算。

# 11 其余的API
Java SE 8还具有一些其他常见用例的类。有一个MonthDay类，其中包含一对Month和Day，对于表示生日非常有用。该YearMonth类涵盖了信用卡开始日期和到期日期的用例以及人们没有指定日期的场景。

Java SE 8中的JDBC将支持这些新类型，但不会更改公共JDBC API。现有的泛型setObject和getObject方法就足够了。

这些类型可以映射到特定于供应商的数据库类型或ANSI SQL类型。
![](https://img-blog.csdnimg.cn/20201009230518144.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
# 12 总结

Java SE 8在java.time中附带一个新的日期和时间API，为开发人员提供了大大改善的安全性和功能。新的API很好地建模了该领域，并提供了用于对各种开发人员用例进行建模的大量类。