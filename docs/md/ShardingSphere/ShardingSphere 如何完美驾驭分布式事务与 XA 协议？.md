# ShardingSphere 如何完美驾驭分布式事务与 XA 协议？

## 0 前言

基于上一文基础，详细展开 ShardingSphere 分布式事务实现。先看支持强一致性事务的XAShardingTransactionManager。

## 1 XAShardingTransactionManager

回到 ShardingSphere，来到 sharding-transaction-xa-core 工程的 XAShardingTransactionManager 类，分布式事务的 XA 实现类。

### 1.1 类定义和变量

```java
// 实现ShardingTransactionManager接口
public final class XAShardingTransactionManager implements ShardingTransactionManager {
    
  	// 保存一组 XATransactionDataSource
    private final Map<String, XATransactionDataSource> cachedDataSources = new HashMap<>();
    
    private final XATransactionManager xaTransactionManager = XATransactionManagerLoader.getInstance().getTransactionManager();

...
}
```

XATransactionManager 实例加载仍采用 JDK ServiceLoader 类：

```java
private XATransactionManager load() {
        Iterator<XATransactionManager> xaTransactionManagers = ServiceLoader.load(XATransactionManager.class).iterator();
        XATransactionManager result = xaTransactionManagers.next();
        return result;
}
```

XATransactionManager 是对第三方 XA 事务管理器的抽象，通过上述代码，可看到在找不到合适XATransactionManager时，系统会默认创建一个AtomikosTransactionManager。而这XATransactionManager的定义实际位于单独的一个代码工程sharding-transaction-xa-spi，接口定义：

```java
public interface XATransactionManager extends AutoCloseable {

    //初始化 XA 事务管理器
    void init();

    //注册事务恢复资源
    void registerRecoveryResource(String dataSourceName, XADataSource xaDataSource);

    //移除事务恢复资源
    void removeRecoveryResource(String dataSourceName, XADataSource xaDataSource);

    //嵌入一个 SingleXAResource 资源
    void enlistResource(SingleXAResource singleXAResource);

    //返回 TransactionManager
    TransactionManager getTransactionManager();
}
```

详细用法还要结合具体XATransactionManager实现类进行理解。这里我们还发现了一个 SingleXAResource，这个类同样位于 sharding-transaction-xa-spi 工程中，名称上看应该是对 JTA 中 XAResource 接口的实现：

```java
public final class SingleXAResource implements XAResource {

    private final String resourceName;

    private final XAResource delegate;

    @Override
    public void start(final Xid xid, final int i) throws XAException {
        delegate.start(xid, i);
    } 
    @Override
    public void commit(final Xid xid, final boolean b) throws XAException {
        delegate.commit(xid, b);
    }

	@Override
    public void rollback(final Xid xid) throws XAException {
        delegate.rollback(xid);
    } 
    @Override
    public boolean isSameRM(final XAResource xaResource) {
        SingleXAResource singleXAResource = (SingleXAResource) xaResource;
        return resourceName.equals(singleXAResource.getResourceName());
	}
	…
}
```

虽实现JTA的XAResource接口，但更像是代理类，具体操作还是委托给内部XAResource实现。

## 2 XA分布式事务的核心类

### 2.1 XADataSource

属JDBC规范内容，为获取XAConnection。

#### 构建

XADataSourceFactory负责生成具体XADataSource：

```java
public static XADataSource build(final DatabaseType databaseType, final DataSource dataSource) {
        XADataSourceDefinition xaDataSourceDefinition = XADataSourceDefinitionFactory.getXADataSourceDefinition(databaseType);
        XADataSource result = createXADataSource(xaDataSourceDefinition);
        Properties xaProperties = xaDataSourceDefinition.getXAProperties(SWAPPER.swap(dataSource));
        PropertyUtils.setProperties(result, xaProperties);
        return result;
}
```

先用到XADataSourceDefinition接口：

```java
public interface XADataSourceDefinition extends DatabaseTypeAwareSPI {

    //获取 XA 驱动类名
    Collection<String> getXADriverClassName();

    //获取 XA 属性
    Properties getXAProperties(DatabaseAccessConfiguration databaseAccessConfiguration);
}
```

该接口继承DatabaseTypeAwareSPI：

```java
public interface DatabaseTypeAwareSPI { 
    //获取数据库类型
    String getDatabaseType();
}
```

ShardingSphere继承 DatabaseTypeAwareSPI 接口的只有 XADataSourceDefinition 接口，而后者存在一批实现类，整体的类层结构如下所示：

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20241112210726811.png)

以MySQLXADataSourceDefinition为例，该类分别实现DatabaseTypeAwareSPI 和 XADataSourceDefinition 这两个接口中所定义的三个方法：

```java
public final class MySQLXADataSourceDefinition implements XADataSourceDefinition {

    @Override
    public String getDatabaseType() {
        return "MySQL";
    }

    @Override
    public Collection<String> getXADriverClassName() {
        return Arrays.asList("com.mysql.jdbc.jdbc2.optional.MysqlXADataSource", "com.mysql.cj.jdbc.MysqlXADataSource");
    }

    @Override
    public Properties getXAProperties(final DatabaseAccessConfiguration databaseAccessConfiguration) {
        Properties result = new Properties();
        result.setProperty("user", databaseAccessConfiguration.getUsername());
        result.setProperty("password", Optional.fromNullable(databaseAccessConfiguration.getPassword()).or(""));
        result.setProperty("URL", databaseAccessConfiguration.getUrl());
        … 
        return result;
    }
}
```

作为数据库供应商，MySQL 提供两个 XADataSource 驱动程序。getXAProperties发现 URL、Username 和 Password 等信息是通过 DatabaseAccessConfiguration 对象获取。

因为 DatabaseTypeAwareSPI 接口，各种 XADataSourceDefinition 也是基于 SPI 加载的，获取 XADataSourceDefinition 的工厂类 XADataSourceDefinitionFactory 中验证：

```java
public final class XADataSourceDefinitionFactory {

    private static final Map<DatabaseType, XADataSourceDefinition> XA_DATA_SOURCE_DEFINITIONS = new HashMap<>();

	static {
       //通过 ServiceLoader 加载 XADataSourceDefinition
        for (XADataSourceDefinition each : ServiceLoader.load(XADataSourceDefinition.class)) {
            XA_DATA_SOURCE_DEFINITIONS.put(DatabaseTypes.getActualDatabaseType(each.getDatabaseType()), each);
        }
    }

    public static XADataSourceDefinition getXADataSourceDefinition(final DatabaseType databaseType) {
        return XA_DATA_SOURCE_DEFINITIONS.get(databaseType);
    }
}
```

sharding-transaction-xa-core 工程中的 SPI 配置：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/11/b32f8e50ce484704049b23b685b06f47.png)

当根据数据库类型获取对应 XADataSourceDefinition 之后，即可根据 XADriverClassName 来创建具体的 XADataSource：

```java
private static XADataSource loadXADataSource(final String xaDataSourceClassName) {
        Class xaDataSourceClass;
           	//加载 XADataSource 实现类
  xaDataSourceClass = Thread.currentThread().getContextClassLoader().loadClass(xaDataSourceClassName);
  return (XADataSource) xaDataSourceClass.newInstance();
}
```

先从当前线程的 ContextClassLoader 中加载目标驱动的实现类，如加载不到，直接反射创建，最后返回 XADataSource 的实例对象。

获取 XADataSource 的实例对象之后，我们需要设置它的属性，这部分工作是由 DataSourceSwapper 类来完成的。在这里，ShardingSphere 针对不同类型的数据库连接池工具还专门做了一层封装，提取了 DataSourcePropertyProvider 接口用于对 DataSource的URL 、Username 和 Password 等基础信息进行抽象。

DataSourcePropertyProvider 接口定义：

```java
public interface DataSourcePropertyProvider {
    String getDataSourceClassName();
    String getURLPropertyName();
    String getUsernamePropertyName();
    String getPasswordPropertyName();
}
```

DataSourcePropertyProvider 实现类：

- DefaultDataSourcePropertyProvider
- HikariCPPropertyProvider：默认使用，SPI 配置验证：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/11/9a25223e4ef34499fcf33497743bfbd6.png)

```java
public final class HikariCPPropertyProvider implements DataSourcePropertyProvider {

    @Override
    public String getDataSourceClassName() {
        return "com.zaxxer.hikari.HikariDataSource";
    }

    @Override
    public String getURLPropertyName() {
        return "jdbcUrl";
    }

    @Override
    public String getUsernamePropertyName() {
        return "username";
    }

    @Override
    public String getPasswordPropertyName() {
        return "password";
    }
}
```

DataSourceSwapper#swap 反射构建 findGetterMethod 工具方法，以获取 URL、Username 和 Password 等信息，并返回DatabaseAccessConfiguration对象供具体 XADataSourceDefinition 使用。

```java
public DatabaseAccessConfiguration swap(final DataSource dataSource) {
        DataSourcePropertyProvider provider = DataSourcePropertyProviderLoader.getProvider(dataSource);
            String url = (String) findGetterMethod(dataSource, provider.getURLPropertyName()).invoke(dataSource);
            String username = (String) findGetterMethod(dataSource, provider.getUsernamePropertyName()).invoke(dataSource);
            String password = (String) findGetterMethod(dataSource, provider.getPasswordPropertyName()).invoke(dataSource);
            return new DatabaseAccessConfiguration(url, username, password);
}
```

XADataSource 构建完毕，XADataSourceFactory 为中心的类图：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/11/3f49c8d1fd2da9e9b2ea3678b5e6dbfa.png)

### 2.2 XAConnection

JDBC 规范接口。负责创建 XAConnection 的工厂类 XAConnectionFactory：

```java
public final class XAConnectionFactory {
 
    // 基于普通 Connection 创建 XAConnection
    public static XAConnection createXAConnection(final DatabaseType databaseType, final XADataSource xaDataSource, final Connection connection) {
      	// 根据数据库类型分别构建了对应的 ConnectionWrapper
        switch (databaseType.getName()) {
            case "MySQL":
            		// 返回 XAConnection
                return new MySQLXAConnectionWrapper().wrap(xaDataSource, connection);
            		...
        }
    }
}
```

MySQLXAConnectionWrapper 实现 XAConnectionWrapper 接口，先看它：

```java
public interface XAConnectionWrapper {
    // 基于 XADataSource 把 Connection 包装成 XAConnection
    XAConnection wrap(XADataSource xaDataSource, Connection connection);
}
```

按传入XADataSource、Connection创建新XAConnection。XAConnectionWrapper 接口类层结构：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/11/5d7fe49fe1de15f85f71a8d8b8a1d40a.png)

#### MySQLXAConnectionWrapper#warp

```java
@Override
public XAConnection wrap(final XADataSource xaDataSource, final Connection connection) {
        // 将传入的 Connection 转变为一个真实的连接对象
        Connection physicalConnection = unwrapPhysicalConnection(xaDataSource.getClass().getName(), connection);
        Method method = xaDataSource.getClass().getDeclaredMethod("wrapConnection", Connection.class);
        method.setAccessible(true);
        // 通过反射包装 Connection 对象
        return (XAConnection) method.invoke(xaDataSource, physicalConnection);
}
```

再基于 XADataSource#wrapConnection，通过反射对这物理连接进行包装，形成一个 XAConnection 对象。

MySQL有两种 XADataSource 驱动类。而 MySQLXAConnectionWrapper 也找到如下这两种驱动类：

```java
public final class MySQLXAConnectionWrapper implements XAConnectionWrapper {
    
    String MYSQL_XA_DATASOURCE_5 = "com.mysql.jdbc.jdbc2.optional.MysqlXADataSource";
    
    String MYSQL_XA_DATASOURCE_8 = "com.mysql.cj.jdbc.MysqlXADataSource";
```

根据数据库版本，两个驱动类行为也不同。因此，处理也不同：

```java
private Connection unwrapPhysicalConnection(final String xaDataSourceClassName, final Connection connection) {
        switch (xaDataSourceClassName) {
            case MYSQL_XA_DATASOURCE_5:
                return (Connection) connection.unwrap(Class.forName("com.mysql.jdbc.Connection"));
            case MYSQL_XA_DATASOURCE_8:
                return (Connection) connection.unwrap(Class.forName("com.mysql.cj.jdbc.JdbcConnection"));
        }
}
```

对比看 PostgreSQLXAConnectionWrapper#wrap：

```java
public XAConnection wrap(final XADataSource xaDataSource, final Connection connection) {
        BaseConnection physicalConnection = (BaseConnection) connection.unwrap(Class.forName("org.postgresql.core.BaseConnection"));
        return new PGXAConnection(physicalConnection);
}
```

### 2.3 XATransactionDataSource

XAShardingTransactionManager用的 DataSource 并非 JDBC 原生 XADataSource，而是XATransactionDataSource：

```java
private final DatabaseType databaseType;
private final String resourceName;
private final DataSource dataSource;
private XADataSource xaDataSource;
private XATransactionManager xaTransactionManager; 
	 
public XATransactionDataSource(final DatabaseType databaseType, final String resourceName, final DataSource dataSource, final XATransactionManager xaTransactionManager) {
        this.databaseType = databaseType;
        this.resourceName = resourceName;
        this.dataSource = dataSource;
        this.xaDataSource = XADataSourceFactory.build(databaseType, dataSource);
        this.xaTransactionManager = xaTransactionManager;
  			// 将构建的 XADataSource 作为一种资源进行注册
        xaTransactionManager.registerRecoveryResource(resourceName, xaDataSource);
}
```

#### getConnection

```java
public Connection getConnection() throws SQLException, SystemException, RollbackException {
  			...
        // 从DataSource构建一个Connection
        Connection result = dataSource.getConnection();
        // 通过 XAConnectionFactory 创建一个 XAConnection
        XAConnection xaConnection = XAConnectionFactory.createXAConnection(databaseType, xaDataSource, result);
        // 从 XATransactionManager 获取 Transaction 对象
        final Transaction transaction = xaTransactionManager.getTransactionManager().getTransaction();
        // 判断当前线程是否存在这 Transaction
        if (!enlistedTransactions.get().contains(transaction)) {
         		// 将 XAConnection 中的 XAResource 与目标 Transaction 对象关联
            transaction.enlistResource(new SingleXAResource(resourceName, xaConnection.getXAResource()));
            // Transaction 中注册一个 Synchronization 接口
            transaction.registerSynchronization(new Synchronization() {
                @Override
                public void beforeCompletion() {
                    enlistedTransactions.get().remove(transaction);
                }

                @Override
                public void afterCompletion(final int status) {
                    enlistedTransactions.get().clear();
                }
            });
            // 将该 Transaction 对象放入当前线程
            enlistedTransactions.get().add(transaction);
        }
        return result;
}
```

XATransactionDataSource 中存在一个 ThreadLocal 变量 enlistedTransactions，保存当前线程的 Transaction 列表：

```java
private final ThreadLocal<Set<Transaction>> enlistedTransactions = new ThreadLocal<Set<Transaction>>() {
        @Override
        public Set<Transaction> initialValue() {
            return new HashSet<>();
        }
};
```

#### close

```java
@Override
public void close() {
  // 将资源移出
  xaTransactionManager.removeRecoveryResource(resourceName, xaDataSource);
}
```

## 3 从源码到开发

ShardingSphere 作为完全兼容 JDBC 规范的分布式数据库中间件，同样完成针对分布式事务中的相关对象的兼容。本文进一步强化对 JDBC 规范的理解和如何扩展JDBC 规范中核心接口的方法。同时，在 MySQLXAConnectionWrapper 这个 Wrapper 类中，使用反射创建 XAConnection 对象的实现方法。这些开发技巧都值得应用。

## 4 总结

ShardingSphere 提供强一致性、最终一致性两种实现。本文研究了基于 XA 协议的分片事务管理器 XAShardingTransactionManager，理解 XAShardingTransactionManager 中 XADataSource、XAConnection 等核心对象的关键还是要站在 JDBC 规范基础，掌握与分布式事务集成和兼容的整个过程。

## FAQ

Q：ShardingSphere 中对分布式环境下的强一致性事务做了哪些维度抽象？

ShardingSphere 在处理分布式环境中的强一致性事务时，进行了多个维度的抽象来确保数据一致性和系统的可扩展性。以下是 ShardingSphere 针对强一致性事务做出的主要抽象维度：

1. **事务管理抽象**：
   ShardingSphere 对事务管理进行了抽象，支持不同的事务模型，比如本地事务和分布式事务。分布式事务可以采用两阶段提交（2PC）或三阶段提交（3PC）等协议进行协调。此外，ShardingSphere 还引入了基于柔性事务的最佳努力交付（Best Efforts Delivery, BED）和最终一致性事务，以提供更高的灵活性。

2. **事务协调器抽象**：
   ShardingSphere 设计了事务协调器（Transaction Coordinator），用于在分布式环境下管理和协调事务。通过事务协调器，系统可以在各个分片数据库之间实现事务的全局一致性。协调器负责事务的开始、提交和回滚操作，并监控事务的状态，确保所有参与节点的一致性。

3. **锁机制抽象**：
   为了确保在分布式事务中各个节点的数据一致性，ShardingSphere 引入了分布式锁机制的抽象。在分布式场景下，锁机制用于协调不同事务对同一资源的访问，防止并发冲突。ShardingSphere 提供了基于数据库层面的锁管理，同时支持多种分布式锁实现方式，例如基于 Zookeeper 的分布式锁。

4. **隔离级别与并发控制抽象**：
   ShardingSphere 支持不同的事务隔离级别，通过抽象不同的并发控制机制，如读写锁、行级锁等，来确保事务在分布式环境中的隔离性。在高并发的环境中，这种抽象使得系统能够在性能和一致性之间取得平衡。

5. **数据一致性保障机制抽象**：
   ShardingSphere 对数据一致性保障机制进行了抽象设计，包括数据校验、补偿机制和失败重试策略等。特别是在发生网络分区或节点故障时，这些机制能够确保分布式事务最终能够达到一致性状态。

6. **柔性事务与最终一致性支持**：
   为了在性能和一致性之间找到平衡，ShardingSphere 提供了柔性事务（Flexible Transaction）支持，允许系统在某些场景下使用最终一致性模型，如异步补偿和定期对账等方式，确保数据的一致性和系统的高可用性。

通过以上抽象维度，ShardingSphere 为分布式环境下的强一致性事务提供多种实现方式，使得系统能够在分布式数据库和多数据源架构下平衡一致性和性能需求。