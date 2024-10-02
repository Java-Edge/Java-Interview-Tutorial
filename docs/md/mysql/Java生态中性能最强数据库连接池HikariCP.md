# Java生态中性能最强数据库连接池HikariCP

## 1 简介

[github](https://github.com/brettwooldridge/HikariCP)地址。

Hikari日文，“光”，阳光的光。

字节码精简：优化代码，直到编译后的字节码最少，这样，CPU缓存可以加载更多的程序代码；
优化代理和拦截器：减少代码，例如HikariCP的Statement proxy只有100行代码，只有BoneCP的十分之一；
自定义数组类型（FastStatementList）代替ArrayList：避免每次get()调用都要进行range check，避免调用remove()时的从头到尾的扫描；
自定义集合类型（ConcurrentBag）：提高并发读写的效率；

### 跑分



![](https://img-blog.csdnimg.cn/20200426220608509.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

### 好评如潮



![](https://img-blog.csdnimg.cn/20200426220808582.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

这么好，会不会很多参数要配置才行？No！
若之前用的BoneCP配置数据源，就简单了，只需将dataSource换下，微调参数：

## HiKariCP数据源配置

```bash
 <!-- Hikari Datasource -->
 <bean id="dataSourceHikari" class="com.zaxxer.hikari.HikariDataSource"  destroy-method="shutdown">
  <!-- <property name="driverClassName" value="${db.driverClass}" /> --> <!-- 无需指定，除非系统无法自动识别 -->
  <property name="jdbcUrl" value="jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=UTF-8" />
  <property name="username" value="${db.username}" />
  <property name="password" value="${db.password}" />
   <!-- 连接只读数据库时配置为true， 保证安全 -->
  <property name="readOnly" value="false" />
  <!-- 等待连接池分配连接的最大时长（毫秒），超过这个时长还没可用的连接则发生SQLException， 缺省:30秒 -->
  <property name="connectionTimeout" value="30000" />
  <!-- 一个连接idle状态的最大时长（毫秒），超时则被释放（retired），缺省:10分钟 -->
  <property name="idleTimeout" value="600000" />
  <!-- 一个连接的生命时长（毫秒），超时而且没被使用则被释放（retired），缺省:30分钟，建议设置比数据库超时时长少30秒，参考MySQL wait_timeout参数（show variables like '%timeout%';） -->
  <property name="maxLifetime" value="1800000" />
  <!-- 连接池中允许的最大连接数。缺省值：10；推荐的公式：((core_count * 2) + effective_spindle_count) -->
  <property name="maximumPoolSize" value="15" />
 </bean>
```

很多配置使用默认值即可，除了maxLifetime和maximumPoolSize要注意自己计算。

其他配置（sqlSessionFactory、MyBatis MapperScannerConfigurer、transactionManager等）统统不用变。

## Datasource配置参数

Configure your HikariCP idleTimeout and maxLifeTime settings to be one minute less than the wait_timeout of MySQL.
对于有Java连接池的系统，建议MySQL的wait_timeout使用默认8h（http://www.rackspace.com/knowledge_center/article/how-to-change-the-mysql-timeout-on-a-server）。

web项目记得配置：destroy-method="shutdown"

## 使用

直接集成在 SpringBoot。