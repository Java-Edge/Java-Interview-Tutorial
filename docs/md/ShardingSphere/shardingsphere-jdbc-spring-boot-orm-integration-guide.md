# 04-分库分表别再硬写了：ShardingSphere 接入 Spring Boot + MyBatis，照着配就能跑

## 1 开源框架的应用方式

设计和实现开源框架时，咋规划它的应用方式？

作为数据库访问相关的开源框架，ShardingSphere提供多维的应用方式，可对这些应用方式抽象，提炼出一种模版。这个模版由四个维度组成：底层工具、基础规范、开发框架和领域框架

### 1.1 底层工具

底层工具指的是这个开源框架所面向的目标工具或所依赖的第三方工具。这种底层工具往往不是框架本身可以控制和管理的,框架的作用只是在它上面添加一个应用层,用于封装对这些底层工具的使用方式。

对于 ShardingSphere 而言,**这里所说的底层工具实际上指的是关系型数据库**。目前,ShardingSphere 支持包括 MySQL、Oracle、SQLServer、PostgreSQL 以及任何遵循 SQL92 标准的数据库。

### 1.2 基础规范 

作为一个开源框架,很多时候需要兼容业界已经形成标准的基础性规范。换句话说,想要框架被其他开发人员所认可,就得要考虑开发人员目前在使用的基础规范。例如,如果设计一个与链路跟踪相关的开源框架,一般都需要兼容 OpenTracing 这一开放式分布式追踪规范。

对于 ShardingSphere 而言,所涉及的基础规范很明确,就是我们在上一课时中所详细阐述的 JDBC 规范。

### 1.3 开发框架

开源框架本身也是一个开发框架,但我们通常不会自己设计和实现一个全新的开发框架,而是更倾向于与现有的主流开发框架进行集成。目前,Java 世界中最主流的开发框架就是 Spring 家族系列框架。

ShardingSphere 同时集成了 Spring 和 Spring Boot 这两款 Spring 家族的主流开发框架。**熟悉这两款框架的开发人员在应用 ShardingSphere 进行开发时将不需要任何学习成本**。

### 1.4 领域框架

对于某些开源框架而言,也需要考虑和领域框架进行集成,以便提供更好的用户体验和使用友好性,区别于前面提到的适用于任何场景的开发框架。**所谓领域框架,是指与所设计的开源框架属于同一专业领域的开发框架。** 业务开发人员已经习惯在日常开发过程中使用这些特定于某一领域的开发框架,所以在设计自己的开源框架时,也需要充分考虑与这些框架的整合和集成。

对于 ShardingSphere 而言,领域框架指的是 MyBatis、Hibernate 等常见的 ORM 框架。ShardingSphere 对这领域框架提供了无缝集成的实现方案,熟悉 ORM 框架的开发人员在应用 ShardingSphere 进行开发时同样不需要任何学习成本。

接下来,我们就结合前面抽象的开源框架应用方式来具体分析 ShardingSphere 框架为开发人员提供了哪些开发上的支持。

## 2 数据库和JDBC集成

由于 ShardingSphere 最终操作的还是关系型数据库,并基于 JDBC 规范做了重写。所以**在具体应用上相对比较简单,我们只要把握 JDBC 驱动和数据库连接池的使用方式即可。**

### 2.1 JDBC驱动

ShardingSphere 支持 MySQL、Oracle 等实现 JDBC 规范的主流关系型数据库。我们在使用这些数据库时,常见的做法就是指定具体数据库对应的 JDBC 驱动类、URL 以及用户名和密码。

Spring Boot 应用程序中通过 .yml 文件指定 JDBC 驱动：

```properties
driverClassName: com.mysql.jdbc.Driver
url: jdbc:mysql://localhost:3306/test_database  
username: root
password: root
```

### 2.2 数据库连接池

配置 JDBC 驱动的目的是获取访问数据库所需的 Connection。为了提高性能,主流做法是采用数据库连接池方案,数据库连接池将创建的 Connection 对象存放到连接池中,然后从池中提供 Connection。

ShardingSphere 支持一批主流的第三方数据库连接池,包括 DBCP、C3P0、BoneCP、Druid 和 HikariCP 等。在应用 ShardingSphere 时,我们可以通过创建 DataSource 来使用数据库连接池。例如,在 Spring Boot 中,可以在 .properties 配置文件中使用阿里巴巴提供的 DruidDataSource 类,初始化基于 Druid 数据库连接池的 DataSource:

```properties
spring.shardingsphere.datasource.names= test_datasource
spring.shardingsphere.datasource.test_datasource.type=com.alibaba.druid.pool.DruidDataSource 
spring.shardingsphere.datasource.test_datasource.driver-class-name=com.mysql.jdbc.Driver
spring.shardingsphere.datasource.test_datasource.jdbc-url=jdbc:mysql://localhost:3306/test_database
spring.shardingsphere.datasource.test_datasource.username=root
spring.shardingsphere.datasource.test_datasource.password=root
```

而对于使用 Spring 框架的开发人员而言,可以直接在 Spring 容器中注入一个 DruidDataSource 的 JavaBean:

```xml
<bean id="test_datasource" class="com.alibaba.druid.pool.DruidDataSource" destroy-method="close">
  <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
  <property name="url" value="jdbc:mysql://localhost:3306/ test_database"/>
  <property name="username" value="root"/>
  <property name="password" value="root"/>
</bean>
```

## 3 开发框架集成

ShardingSphere中集成的两款主流开发框架：Spring 和 Spring Boot，它们都对 JDBC 规范做了封装。没用或无法用 Spring 家族框架的场景，也可直接在原生 Java 应用程序用ShardingSphere。

### 3.0 业务

系统中存在一用户表 User，数据量较大，所以我们将它分库分表，计划分成两个数据库 ds0、ds1,然后每个库中再分成两张表 user0、user1：

![](https://p.ipic.vip/2gmsko.png)

### 3.1 Java原生

需全通过 Java 代码创建和管理 ShardingSphere 中与分库分表相关的所有类。

#### ① 引入依赖

```xml
<dependency>
  <groupId>org.apache.shardingsphere</groupId>
  <artifactId>sharding-jdbc-core</artifactId>
</dependency>
```

#### ② JDBC接口实现

按JDBC用法，创建 DataSource、Connection、Statement 等接口的实现类，以完成数据库访问。

DataSource 的工具类 DataSourceHelper，基于 Druid 获取一个 DruidDataSource：

```java
public final class DataSourceHelper {

  private static final String HOST = "localhost";
  private static final int PORT = 3306;
  private static final String USER_NAME = "root";
  private static final String PASSWORD = "root";
  
  public static DataSource createDataSource(final String dataSourceName) {
    DruidDataSource result = new DruidDataSource();
    result.setDriverClassName(com.mysql.jdbc.Driver.class.getName());
    result.setUrl(String.format("jdbc:mysql://%s:%s/%s, HOST, PORT, dataSourceName));  
    result.setUsername(USER_NAME);
    result.setPassword(PASSWORD);
    return result;
  } 
}
```

```java
 private static Map<String, DataSource> createDataSourceMap() {
    // 要创建两个用户库，可用Map保存两个数据源对象
    Map<String, DataSource> result = new HashMap<>();
    result.put("ds0", DataSourceHelper.createDataSource("ds0"));
    result.put("ds1", DataSourceHelper.createDataSource("ds1"));
    return result;
 }
```

#### ③ 分库分表规则

有了包含初始化 DataSource 对象的数据源集合后，设计分库分表规则来获取目标DataSource：

```java
public DataSource dataSource() throws SQLException {
   // 创建分片规则配置类
   ShardingRuleConfiguration shardingRuleConfig = new ShardingRuleConfiguration();
   
   // 创建分表规则配置类
   TableRuleConfiguration tableRuleConfig = new TableRuleConfiguration("user", "ds${0..1}.user${0..1}");
   
   // 创建分布式主键生成配置类
   Properties properties = new Properties();
   properties.setProperty("worker.id", "33");
   KeyGeneratorConfiguration keyGeneratorConfig = new KeyGeneratorConfiguration("SNOWFLAKE", "id", properties);              
   tableRuleConfig.setKeyGeneratorConfig(keyGeneratorConfig);      
   shardingRuleConfig.getTableRuleConfigs().add(tableRuleConfig);
   
   // 根据性别分库,一共分为 2 个库
   shardingRuleConfig.setDefaultDatabaseShardingStrategyConfig(new InlineShardingStrategyConfiguration("sex", "ds${sex % 2}"));
   
   // 根据用户 ID 分表,一共分为 2 张表
   shardingRuleConfig.setDefaultTableShardingStrategyConfig(new StandardShardingStrategyConfiguration("id", "user${id % 2}"));
   
   // 通过工厂类创建具体的 DataSource
   return ShardingDataSourceFactory.createDataSource(createDataSourceMap(), shardingRuleConfig, new Properties());
}
```

这用到ShardingSphere的规则配置类：分片规则配置、分表规则配置、分布式主键生成配置等。

在分片规则配置中用行表达式来设置具体分片规则。根据年龄和 ID 分别进行分库和分表。在方法最后传入已初始化的 DataSource 集合并通过工厂类来创建具体的某个目标 DataSource。

一旦获取了目标DataSource后，就可用 JDBC 中的核心接口来执行传入的SQL：

```java
List<User> getUsers(final String sql) throws SQLException {
  List<User> result = new LinkedList<>();
  try (Connection connection = dataSource.getConnection();
       PreparedStatement preparedStatement = connection.prepareStatement(sql);
       ResultSet resultSet = preparedStatement.executeQuery()) {
    while (resultSet.next()) {
        User user= new User();
        //省略设置User对象的赋值语句
        result.add(user);
    }
  }
  return result;
}
```

整个过程就像是在用普通的 JDBC。但这些 JDBC 接口背后的实现类都已嵌入了分片功能。

### 3.2 Spring

JDBC中各核心对象的创建过程都交给Spring容器。ShardingSphere中基于NameSpace机制完成与Spring框架无缝集成。

#### ① 引入依赖

```xml
<dependency>
  <groupId>org.apache.shardingsphere</groupId>
  <artifactId>sharding-jdbc-spring-namespace</artifactId> 
</dependency>
```

#### ② 配置项

Spring的NameSpace机制就是基于 Spring 配置文件的 XML Scheme 添加定制化的配置项并进行解析，所以会在 XML 配置文件中看到一系列与分片相关的自定义配置项。如DataSource初始化过程相当于创建一个Java Bean的过程：

```xml
<bean id="ds0" class="com.alibaba.druid.pool.DruidDataSource">
  <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
  <property name="url" value="jdbc:mysql://localhost:3306/ds0"/>
  <property name="username" value="root"/>
  <property name="password" value="root"/>
</bean>
```

同理，通过配置项初始化分库规则，并最终完成目标 DataSource 的创建过程：

```xml
<!-- 创建分库配置 -->
<sharding:inline-strategy id="databaseStrategy" sharding-column="sex" algorithm-expression="ds${sex % 2}" />

<!-- 创建分表配置 -->
<sharding:inline-strategy id="tableStrategy" sharding-column="id" algorithm-expression="user${id % 2}" />

<!-- 创建分布式主键生成配置 -->  
<bean:properties id="properties">
  <prop key="worker.id">33</prop>
</bean:properties>
<sharding:key-generator id="keyGenerator" type="SNOWFLAKE" column="id" props-ref="properties" />

<!-- 创建分片规则配置 -->
<sharding:data-source id="shardingDataSource">
  <sharding:sharding-rule data-source-names="ds0, ds1">
    <sharding:table-rules>
      <sharding:table-rule logic-table="user" actual-data-nodes="ds${0..1}.user${0..1}" database-strategy-ref="databaseStrategy" table-strategy-ref="tableStrategy" key-generator-ref="keyGenerator" />
    </sharding:table-rules>
  </sharding:sharding-rule>
</sharding:data-source>
```

### 3.3 Spring Boot

要做的也是编写配置项。

#### 引入依赖

```xml
<dependency>
    <groupId>org.apache.shardingsphere</groupId>
    <artifactId>shardingsphere-jdbc-core-spring-boot-starter</artifactId>
    <version>5.2.0</version>
</dependency>
```

#### ② 配置项

Spring Boot的配置项组织形式有.yaml和.properties文件。.yaml 为例给出 DataSource 配置：

```yaml
spring:
  shardingsphere:
    # 配置数据源名称列表
    datasource:
      names: ds0,ds1
      # 配置第一个数据源 ds0
      ds0:
        type: com.alibaba.druid.pool.DruidDataSource
        driver-class-name: com.mysql.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/ds0
        username: root
        password: root
      # 配置第二个数据源 ds1
      ds1:
        type: com.alibaba.druid.pool.DruidDataSource
        driver-class-name: com.mysql.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/ds1
        username: root
        password: root
```

同理设置分库策略、分表策略及分布式主键生成策略：

```yaml
spring:
  shardingsphere:
    sharding:
      # 全局默认分库策略
      default-database-strategy:
        inline:
          sharding-column: sex       # 分库依据的字段
          algorithm-expression: ds->{sex % 2}  # 分库算法：按sex取模，0→ds0，1→ds1
      # 分表规则
      tables:
        user:
          actual-data-nodes: ds->{0..1}.user->{0..1}  # 实际数据节点：ds0/user0、ds0/user1、ds1/user0、ds1/user1
          # 分表策略
          table-strategy:
            inline:
              sharding-column: id    # 分表依据的字段
              algorithm-expression: user->{id % 2}  # 分表算法：按id取模，0→user0，1→user1
          # 主键生成策略
          key-generator:
            column: id               # 主键字段
            type: SNOWFLAKE          # 雪花算法生成主键
            props:
              worker.id: 33          # 雪花算法的workerId（集群内唯一）
```

提供这些配置项，就可直接在应用程序中注入一个 DataSource 来获取 Connection 等 JDBC 对象。

但日常开发过程，若用Spring和Spring Boot开发框架，一般都不直接用原生JDBC接口操作数据库，而是通过ORM框架。

## 4 ORM框架集成

- JPA规范，如Hibernate、TopLink
- 完全采用自定义的方式来实现对象和关系之间的映射，如MyBatis

基于 Spring Boot 自动配置机制，看集成这些 ORM 框架的方式。

### 4.1 JPA

#### ① 添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

Spring Boot 就会自动导入 spring-orm、hibernate-entity-manager、spring-data-jpa 等包。

#### ② 配置项

添加JPA相关配置项：

```yaml
spring:
  jpa:
    properties:
      hibernate:
        # 自动建表策略：启动时创建表，应用停止时删除表（仅建议测试环境使用）
        hbm2ddl.auto: create-drop
        # 指定 Hibernate 方言，适配 MySQL5 版本语法
        dialect: org.hibernate.dialect.MySQL5Dialect
        # 是否在控制台打印 SQL 语句
        show_sql: false
```

还要在业务代码中完成 JPA 的 Entity 实体类、Repository 仓库类的定义，并在 Spring Boot 的启动类中完成对包含对应包结构的扫描：

```java
@ComponentScan("com.user.jpa")
@EntityScan(basePackages = "com.user.jpa.entity")
public class UserApplication
```

### 4.2 MyBatis

#### ① 添加依赖

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
</dependency>
```

#### ② 启动配置

MyBatis启动依赖于框架提供的专用配置项，一般把这些配置项组织在一个独立配置文件，并在 Spring Boot 的 application.properties 引用该配置文件：

```properties
mybatis.config-location=classpath:META-INF/mybatis-config.xml
```

mybatis-config.xml至少包含各种 Mybatis Mapper 文件定义：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
  PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
   <mappers>
     <mapper resource="mappers/UserMapper.xml"/>
   </mappers>
</configuration>
```

Mapper 文件就包含运行 MyBatis 所需的实体与数据库模式之间的映射关系，以及各种数据库操作的 SQL 语句定义。

#### ③ 扫描

启动类添加对包含各种 Entity 和 Repository 定义的包结构的扫描机制：

```java
@ComponentScan("com.user.mybatis")  
@MapperScan(basePackages = "com.user.mybatis.repository")
public class UserApplication
```

## 5 总结

从JDBC规范到 Spring、Spring Boot框架，再到 JPA、MyBatis 等主流 ORM 框架，ShardingSphere 都提供完善的集成方案。

## FAQ

Q：为实现框架的易用性,ShardingSphere 为开发人员提供了哪些工具和规范的集成?

A：使用 ShardingSphere 的主要方式事实上就是基于它所提供的配置体系，来完成各种配置项的创建和设置。配置工作是使用 ShardingSphere 进行开发的主要工作。