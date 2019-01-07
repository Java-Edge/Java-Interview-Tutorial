# 1 背景
Java8前，处理日期时间时，使用的“三大件”
- Date
- Calender
- SimpleDateFormat

以声明时间戳、使用日历处理日期和格式化解析日期时间。但这些类的API可读性差、使用繁琐，且非线程安全，如同设计的翔一样的IO，也是Java让人诟病的一大原因。

于是Java8推出全新日期时间类。这些类的API功能强大简便、线程安全。

但毕竟Java8刚出这些类，诸如序列化、数据访问等类库都不支持Java8日期时间类，需在新老类中来回切换。比如，在业务逻辑层使用**LocalDateTime**，存入数据库或者返回前端的时候还要切换回**Date**。因此，还不如沿用老的日期时间类。

不过我们生活在最好的时代，基本主流类库都支持新日期时间类型，但还有项目因还是用祖传日期时间类，出现很多古今交错的错误实践。
比如
- 通过随意修改时区，使读取到的数据匹配当前时钟
- 直接对读取到的数据做加、减几个小时的操作，来“修正数据”

本文旨在分析古今时间错乱的本质原因，看看使用遗留日期时间类，来处理日期时间初始化、格式化、解析、计算等可能会遇到的问题，以及如何使用新日期时间类解决。

# 2 初始化日期时间
- 初始化**2020年11月11日11点11分11秒**时间，这样可行吗？
![](https://img-blog.csdnimg.cn/20201122161130956.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- 日志输出时间是**3029年12月11日11点11分11秒**：
```bash
date : Sat Dec 11 11:11:11 CST 3920
```

这明显是彩笔才会写的垃圾代码，因为
- **年应该是和1900差值**
- **月应该是 0~11 而非 1~12**
- **时应该是 0~23，而非 1~24**
![](https://img-blog.csdnimg.cn/20201122193720701.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- 修正上述代码如下：
```java
Date date = new Date(2020 - 1900, 10, 11, 11, 11, 11);
```
- 日志输出：
```bash
Mon Nov 11 11:11:11 CST 2019
```

当有国际化需求时，又得使用**Calendar**类初始化时间。

使用Calendar改造后，初始化时年参数直接使用当前年即可，月**0~11**。亦可直接使用**Calendar.DECEMBER**初始化月份，肯定不会犯错。

- 分别使用当前时区和纽约时区初始化两个相同日期：
![](https://img-blog.csdnimg.cn/20201122200346657.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- 日志输出![](https://img-blog.csdnimg.cn/20201122200418945.png#pic_center)
显示两个不同时间，说明时区发生作用。但更习惯**年/月/日 时:分:秒**日期时间格式，对现在输出的日期格式还不满意，那就格式化日期时间

# 3 时区问题
全球有24个时区，同一个时刻不同时区（比如中国上海和美国纽约）的时间不同。全球化项目，若初始化时间时未提供时区，那就不是真正意义上的时间，只能认为是我看到的当前时间的一个表示。

## 3.1 Date类
- Date无时区概念，任一机器使用`new Date()`初始化得到时间相同。因为，Date中保存的是UTC时间，其为以原子钟为基础的统一时间，不以太阳参照计时，无时区划分
- Date中保存的是一个时间戳，代表从1970年1月1日0点（Epoch时间）到现在的毫秒数。尝试输出Date(0)：

```java
System.out.println(new Date(0));
System.out.println(TimeZone.getDefault().getID() + ":" +
	TimeZone.getDefault().getRawOffset()/3600000);
```

得到1970年1月1日8点。我的机器在中国上海，相比UTC时差+8小时：

```bash
Thu Jan 01 08:00:00 CST 1970
Asia/Shanghai:8
```

对于国际化项目，处理好时间和时区问题首先就是要正确保存日期时间。
这里有两种
## 3.2 如何正确保存日期时间
- 保存UTC
保存的时间无时区属性，不涉及时区时间差问题的世界统一时间。常说的时间戳或Java中的Date类就是这种方式，也是**推荐方案**
- 保存字面量
比如**年/月/日 时:分:秒**，务必同时保存时区信息。有了时区，才能知道该字面量时间真正的时间点，否则它只是一个给人看的时间表示且只在当前时区有意义。
而**Calendar**才具有时区概念，所以通过使用不同时区初始化**Calendar**，才能得到不同时间。

正确地保存日期时间后，就是**正确展示**，即要使用正确时区，将时间点展示为符合当前时区的时间表示。至此也就能理解为何会发生“时间错乱”。

## 从字面量解析成时间 & 从时间格式化为字面量
### 对同一时间表示，不同时区转换成Date会得到不同时间戳
- 比如**2020-11-11 11:11:11**
![](https://img-blog.csdnimg.cn/20201122210342482.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

- 对当前上海时区/纽约时区，转化为UTC时间戳不同

```bash
Wed Nov 11 11:11:11 CST 2020:1605064271000
Thu Nov 12 00:11:11 CST 2020:1605111071000
```
这就是UTC的意义，并非时间错乱。对同一本地时间的表示，不同时区的人解析得到的UTC时间必定不同，反过来不同本地时间可能对应同一UTC。

### 格式化后出现的错乱
即同一Date，在不同时区下格式化得到不同时间表示。

- 在当前时区和纽约时区格式化**2020-11-11 11:11:11**![](https://img-blog.csdnimg.cn/20201122211200826.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

- 输出如下，当前时区Offset（时差）是+8小时，对于-5小时的纽约
![](https://img-blog.csdnimg.cn/20201122211259222.png#pic_center)
因此，有时数据库中相同时间，由于服务器时区设置不同，读取到的时间表示不同。这不是时间错乱，而是时区作用，因为`UTC时间需根据当前时区解析为正确的本地时间`。

所以要正确处理时区，在于存和读两阶段
- 存，需使用正确的当前时区来保存，这样UTC时间才会正确
- 读，也须正确设置本地时区，才能把UTC时间转换为正确当地时间

# Java8处理时区问题
时间日期类ZoneId、ZoneOffset、LocalDateTime、ZonedDateTime和DateTimeFormatter，使用起来更简单清晰。

## 初始化上海、纽约和东京三时区
可使用`ZoneId.of`初始化一个标准时区，也可使用`ZoneOffset.ofHours`通过一个offset初始化一个具有指定时间差的自定义时区。


## 日期时间表示
- `LocalDateTime`无时区属性，所以命名为本地时区的日期时间
- `ZonedDateTime=LocalDateTime+ZoneId`，带时区属性

因此，`LocalDateTime`仅是一个时间表示，`ZonedDateTime`才是一个有效时间。这里将把2020-01-02 22:00:00这个时间表示，使用东京时区解析得到一个`ZonedDateTime`。

## DateTimeFormatter格式化时间
可直接通过`withZone`直接设置格式化使用的时区。最后，分别以上海、纽约和东京三个时区来格式化这个时间输出：
![](https://img-blog.csdnimg.cn/20201122213801478.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

日志输出：
- 相同时区，经过解析存和读的时间表示一样（比如最后一行）
- 不同时区，比如上海/纽约，输出本地时间不同。
 +9小时时区的晚上10点，对上海时区+8小时，所以上海本地时间为早10点
 而纽约时区-5小时，差14小时，为晚上9点
![](https://img-blog.csdnimg.cn/20201122214645307.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

## 小结
要正确处理国际化时间问题，推荐Java8的日期时间类，即
1. 使用`ZonedDateTime`保存时间
2. 然后使用设置了`ZoneId`的`DateTimeFormatter`配合`ZonedDateTime`进行时间格式化得到本地时间表示