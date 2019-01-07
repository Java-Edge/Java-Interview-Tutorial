为了更细粒度的事务划分，Spring提供如下两种方式的编程式事务管理：
# 1 PlatformTransactionManager
你也可以使用 org.springframework.transaction.PlatformTransactionManager 来直接管理你的事务。只需通过bean的引用，简单的把你在使用的PlatformTransactionManager 传递给你的bean。 然后，使用TransactionDefinition和TransactionStatus对象， 你可以启动，回滚和提交事务。

```java
DefaultTransactionDefinition def = new DefaultTransactionDefinition();
// explicitly setting the transaction name is something that can only be done programmatically
def.setName("SomeTxName");
def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);

TransactionStatus status = txManager.getTransaction(def);
try {
  // 执行业务逻辑
}
catch (MyException ex) {
  txManager.rollback(status);
  throw ex;
}
txManager.commit(status);
```

# 2 TransactionTemplate
PlatformTransactionManager中部分代码是可以重用的，所以spring对其进行了优化，采用模板方法模式就其进行封装，主要省去了提交或者回滚事务的代码。

若你选择编程式事务管理，Spring推荐使用 TransactionTemplate。 类似使用JTA的 UserTransaction API （除了异常处理的部分稍微简单点）。
## 2.1 简介
TransactionTemplate 采用与Spring中别的模板同样的方法，如 JdbcTemplate 。
使用回调机制，将应用代码从样板式的资源获取和释放代码中解放。

同一个事务管理的代码调用逻辑中，每次执行 SQL，都是基于同一连接，所有连接都是从一个公共地方TransactionSynchronizationManager获取。
所以获取连接操作不应该在 ORM 层框架，而是由 Spring 维护。
### JdbcTemplate源码
![](https://img-blog.csdnimg.cn/20210704183829725.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20210704183726428.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

```java
@Override
@Nullable
public <T> T execute(ConnectionCallback<T> action) throws DataAccessException {
	Assert.notNull(action, "Callback object must not be null");

	Connection con = DataSourceUtils.getConnection(obtainDataSource());
	try {
		// Create close-suppressing Connection proxy, also preparing returned Statements.
		Connection conToUse = createConnectionProxy(con);
		return action.doInConnection(conToUse);
	}
	catch (SQLException ex) {
		// Release Connection early, to avoid potential connection pool deadlock
		// in the case when the exception translator hasn't been initialized yet.
		String sql = getSql(action);
		DataSourceUtils.releaseConnection(con, getDataSource());
		con = null;
		throw translateException("ConnectionCallback", sql, ex);
	}
	finally {
		DataSourceUtils.releaseConnection(con, getDataSource());
	}
}
```

从给定的数据源获取连接。 知道绑定到当前线程的相应连接，例如在使用DataSourceTransactionManager 。 如果事务同步处于活动状态，例如在JTA事务中运行时，则将连接绑定到线程。
![](https://img-blog.csdnimg.cn/20210704182450795.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
mybatis 中的各种 Mapper，其实底层就是通过使用 sqlSession 执行的。
而不管是 jdbcTemplate 还是 mybatis，获取连接都是通过 Spring的TransactionSynchronizationManager：
![](https://img-blog.csdnimg.cn/20210704201230242.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
#### 为何使用ThreadLocal存储资源？
若一个线程请求事务处理过程还在正常进行，但同时另一个线程并发也请求了同一事务的处理方法而且出现了异常要回滚了，若两个线程共用同一个数据库连接，就会导致回滚时影响原来正常执行的线程！所以连接对象是使用 ThreadLocal 存储的。就是为了避免多线程共用同一个连接，导致回滚时出现数据错乱。
![](https://img-blog.csdnimg.cn/20210704202442776.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)



> 使用 TransactionTemplate 会增加你的代码与Spring的事务框架和API间的耦合。所以是否使用编程式事务管理由你自己决定。

应用代码必须在一个事务性的上下文中执行，这样就会像这样一样显式的使用TransactionTemplate。作为应用程序员， 会写一个 TransactionCallback 的实现， (通常会用匿名类实现 )这样的实现会包含所以你需要在该事务上下文中执行的代码。
然后你会把一个你自己实现TransactionCallback的实例传递给TransactionTemplate暴露的execute 方法。
```java
public class SimpleService implements Service {

  // single TransactionTemplate shared amongst all methods in this instance
  private final TransactionTemplate transactionTemplate;

  // use constructor-injection to supply the PlatformTransactionManager
  public SimpleService(PlatformTransactionManager transactionManager) {
    Assert.notNull(transactionManager, "The 'transactionManager' argument must not be null.");
    this.transactionTemplate = new TransactionTemplate(transactionManager);
  }

  public Object someServiceMethod() {
    return transactionTemplate.execute(new TransactionCallback() {

      // the code in this method executes in a transactional context
      public Object doInTransaction(TransactionStatus status) {
        updateOperation1();
        return resultOfUpdateOperation2();
      }
    });
  }
}
```
如果不需要返回值，更方便的是创建一个 TransactionCallbackWithoutResult 匿名类
```java
transactionTemplate.execute(new TransactionCallbackWithoutResult() {
  @Override
  protected void doInTransactionWithoutResult(TransactionStatus status) {
    updateOperation1();
    updateOperation2();
  }
});
```

回调方法内的代码可以通过调用 TransactionStatus 对象的 setRollbackOnly() 方法来回滚事务。

```java
transactionTemplate.execute(new TransactionCallbackWithoutResult() {

  protected void doInTransactionWithoutResult(TransactionStatus status) {
    try {
      updateOperation1();
      updateOperation2();
    } catch (SomeBusinessExeption ex) {
      status.setRollbackOnly();
    }
  }
});
```

## 2.2 指定事务设置
诸如传播模式、隔离等级、超时等等的事务设置都可以在TransactionTemplate中或者通过配置或者编程式地实现。 
TransactionTemplate实例默认继承了默认事务设置。 下面有个编程式的为一个特定的TransactionTemplate定制事务设置的例子。
```java
public class SimpleService implements Service {

  private final TransactionTemplate transactionTemplate;

  public SimpleService(PlatformTransactionManager transactionManager) {
    Assert.notNull(transactionManager, "The 'transactionManager' argument must not be null.");
    this.transactionTemplate = new TransactionTemplate(transactionManager);

    // the transaction settings can be set here explicitly if so desired
    this.transactionTemplate.setIsolationLevel(TransactionDefinition.ISOLATION_READ_UNCOMMITTED);
    this.transactionTemplate.setTimeout(30); // 30 seconds
    // and so forth...
  }
}
```

使用Spring XML配置来定制TransactionTemplate的事务属性。 sharedTransactionTemplate 可以被注入到所有需要的服务中去。
```xml
<bean id="sharedTransactionTemplate"
    class="org.springframework.transaction.support.TransactionTemplate">
  <property name="isolationLevelName" value="ISOLATION_READ_UNCOMMITTED"/>
  <property name="timeout" value="30"/>
</bean>"
```
TransactionTemplate 类的实例是线程安全的，任何状态都不会被保存。 TransactionTemplate 实例的确会维护配置状态，所以当一些类选择共享一个单独的 TransactionTemplate实例时，如果一个类需要使用不同配置的TransactionTemplate(比如，不同的隔离等级)， 那就需要创建和使用两个不同的TransactionTemplate。
## 2.3 案例

```java
@Test
public void test1() throws Exception {
    //定义一个数据源
    org.apache.tomcat.jdbc.pool.DataSource dataSource = new org.apache.tomcat.jdbc.pool.DataSource();
    dataSource.setDriverClassName("com.mysql.jdbc.Driver");
    dataSource.setUrl("jdbc:mysql://localhost:3306/mydb?characterEncoding=UTF-8");
    dataSource.setUsername("root");
    dataSource.setPassword("root123");
    dataSource.setInitialSize(5);
    //定义一个JdbcTemplate，用来方便执行数据库增删改查
    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
    //1.定义事务管理器，给其指定一个数据源（可以把事务管理器想象为一个人，这个人来负责事务的控制操作）
    PlatformTransactionManager platformTransactionManager = new DataSourceTransactionManager(dataSource);
    //2.定义事务属性：TransactionDefinition，TransactionDefinition可以用来配置事务的属性信息，比如事务隔离级别、事务超时时间、事务传播方式、是否是只读事务等等。
    DefaultTransactionDefinition transactionDefinition = new DefaultTransactionDefinition();
    transactionDefinition.setTimeout(10);//如：设置超时时间10s
    //3.创建TransactionTemplate对象
    TransactionTemplate transactionTemplate = new TransactionTemplate(platformTransactionManager, transactionDefinition);
    /**
     * 4.通过TransactionTemplate提供的方法执行业务操作
     * 主要有2个方法：
     * （1）.executeWithoutResult(Consumer action)：没有返回值的，需传递一个Consumer对象，在accept方法中做业务操作
     * （2）. T execute(TransactionCallback action)：有返回值的，需要传递一个TransactionCallback对象，在doInTransaction方法中做业务操作
     * 调用execute方法或者executeWithoutResult方法执行完毕之后，事务管理器会自动提交事务或者回滚事务。
     * 那么什么时候事务会回滚，有2种方式：
     * （1）transactionStatus.setRollbackOnly();将事务状态标注为回滚状态
     * （2）execute方法或者executeWithoutResult方法内部抛出异常
     * 什么时候事务会提交？
     * 方法没有异常 && 未调用过transactionStatus.setRollbackOnly();
     */
    transactionTemplate.executeWithoutResult(new Consumer() {
        @Override
        public void accept(TransactionStatus transactionStatus) {
            jdbcTemplate.update("insert into t_user (name) values (?)", "transactionTemplate-1");
            jdbcTemplate.update("insert into t_user (name) values (?)", "transactionTemplate-2");

        }
    });
    System.out.println("after:" + jdbcTemplate.queryForList("SELECT * from t_user"));
}

output:
after:[{id=1, name=transactionTemplate-1}, {id=2, name=transactionTemplate-2}]
```
### executeWithoutResult：无返回值场景
executeWithoutResult(Consumer action)：没有返回值的，需传递一个Consumer对象，在accept方法中做业务操作
![](https://img-blog.csdnimg.cn/baaf82eaee1949ce852206771682c3dc.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)

```java
transactionTemplate.executeWithoutResult(new Consumer() {
    @Override
    public void accept(TransactionStatus transactionStatus) {
        //执行业务操作
    }
});
```
### execute：有返回值场景
T execute(TransactionCallback action)：有返回值的，需要传递一个TransactionCallback对象，在doInTransaction方法中做业务操作