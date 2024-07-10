# 05-dddmall-database-spring-boot-starter

## 1 MybatisPlus配置

### 1.1 分页插件集成

通过`mybatisPlusInterceptor`方法集成`MybatisPlus`的分页插件，使得分页查询能够自动适应不同数据库方言，提高开发效率，减少重复代码。

```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
    return interceptor;
}
```

### 1.2 自动填充功能

`myMetaObjectHandler`方法提供元数据填充的能力，允许在插入或更新数据时自动填充某些字段（如创建时间、更新时间等），减少了手动设置这些字段的需要。

```java
@Bean
public MyMetaObjectHandler myMetaObjectHandler() {
    return new MyMetaObjectHandler();
}
```

### 1.3 自定义ID生成策略

通过`idGenerator`方法引入自定义的ID生成器，这里使用雪花算法，保证分布式系统中ID的唯一性和顺序性，对于业务的扩展性和数据的一致性至关重要。

```java
@Bean
@Primary
public IdentifierGenerator idGenerator() {
    return new CustomIdGenerator();
}
```

### 1.4 好处

1. **统一配置管理**：将Mybatis Plus的关键配置集中管理，提高项目的可维护性和可读性。开发者可以在一个地方快速查看和修改与Mybatis Plus相关的配置，而不需要在多个地方进行搜索和修改

2. **业务扩展性**：通过自定义ID生成器和自动填充功能，为业务数据的一致性和完整性提供了保障。特别是在处理大量数据和高并发场景时，这些配置确保了数据处理的效率和准确性

3. **提高开发效率**：自动配置分页插件和元数据填充功能，减少了开发者在进行数据操作时的重复工作，使得开发者可以将更多的精力集中在业务逻辑的实现上，加快了开发周期