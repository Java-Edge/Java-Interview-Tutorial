BaseExecutor是Executor的一个子类，是一个抽象类，实现接口Executor的部分方法，并提供了三个抽象方法
- doUpdate
- doFlushStatements
- doQuery

在他的子类SimpleExecutor、ReuseExecutor和BatchExecutor中实现。
BaseExecutor也算是一个模板类，几个抽象方法在子类中实现
![](https://upload-images.jianshu.io/upload_images/4685968-59b15d72bf6c43cf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
具体选用哪个子类实现，可以在Mybatis的配置文件中进行配，配置如下：
```
    <settings>
     	<setting name="defaultExecutorType" value="REUSE"/> <!--SIMPLE、REUSE、BATCH-->
     </settings>
```
配置之后在Configuration类中的newExecutor（）函数会选择具体使用的子类，实现如下：
```
public Executor newExecutor(Transaction transaction, ExecutorType executorType) {
    //根据executorType来选择实现子类
    executorType = executorType == null ? defaultExecutorType : executorType;
    executorType = executorType == null ? ExecutorType.SIMPLE : executorType;
    Executor executor;
    if (ExecutorType.BATCH == executorType) {
      executor = new BatchExecutor(this, transaction);
    } else if (ExecutorType.REUSE == executorType) {
      executor = new ReuseExecutor(this, transaction);
    } else {
      executor = new SimpleExecutor(this, transaction);
    }
	//cacheEnabled默认是true，所以还是会使用CachingExecutor，不知何意
    if (cacheEnabled) {
      executor = new CachingExecutor(executor);
    }
    executor = (Executor) interceptorChain.pluginAll(executor);
    return executor;
  }

```
# BaseExecutor源码解析
```
/**
 * @author Clinton Begin
 */
public abstract class BaseExecutor implements Executor {
  protected Transaction transaction;
  protected Executor wrapper;
  protected ConcurrentLinkedQueue<DeferredLoad> deferredLoads;
  //缓存 永久缓存   本地缓存
  protected PerpetualCache localCache;

  protected PerpetualCache localOutputParameterCache;
  //mybatis配置信息
  protected Configuration configuration;
 
  //查询堆栈
  protected int queryStack = 0;
  private boolean closed;
 
  protected BaseExecutor(Configuration configuration, Transaction transaction) {
    this.transaction = transaction;
    this.deferredLoads = new ConcurrentLinkedQueue<DeferredLoad>();
    this.localCache = new PerpetualCache("LocalCache");
    this.localOutputParameterCache = new PerpetualCache("LocalOutputParameterCache");
    this.closed = false;
    this.configuration = configuration;
    this.wrapper = this;
  }
 
 public void close(boolean forceRollback) {
    try {
      try {
        rollback(forceRollback);
      } finally {
        if (transaction != null) transaction.close();
      }
    } catch (SQLException e) {
      // Ignore.  There's nothing that can be done at this point.
      log.warn("Unexpected exception on closing transaction.  Cause: " + e);
    } finally {
      transaction = null;
      deferredLoads = null;
      localCache = null;
      localOutputParameterCache = null;
      closed = true;
    }
  }
 
  //SqlSession的update/insert/delete会调用该方法
  public int update(MappedStatement ms, Object parameter) throws SQLException {
    ErrorContext.instance().resource(ms.getResource()).activity("executing an update").object(ms.getId());
    if (closed) throw new ExecutorException("Executor was closed.");
	//先清局部缓存，再更新，如何更新由子类实现，模板方法模式
    clearLocalCache();
    return doUpdate(ms, parameter);
  }
 
  public List<BatchResult> flushStatements() throws SQLException {
    return flushStatements(false);
  }
 
  public List<BatchResult> flushStatements(boolean isRollBack) throws SQLException {
    if (closed) throw new ExecutorException("Executor was closed.");
    return doFlushStatements(isRollBack);
  }

  //SqlSession.selectList会调用此方法
  public <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler) throws SQLException {
	//得到绑定sql
    BoundSql boundSql = ms.getBoundSql(parameter);
	//创建缓存key
    CacheKey key = createCacheKey(ms, parameter, rowBounds, boundSql);
	//查询
    return query(ms, parameter, rowBounds, resultHandler, key, boundSql);
 }
 
  @SuppressWarnings("unchecked")
  public <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql) throws SQLException {
    ErrorContext.instance().resource(ms.getResource()).activity("executing a query").object(ms.getId());
	//如果已经关闭，报错
    if (closed) throw new ExecutorException("Executor was closed.");
	//先清局部缓存，再查询，但仅当查询堆栈为0时才清，为了处理递归调用
    if (queryStack == 0 && ms.isFlushCacheRequired()) {
      clearLocalCache();
    }
    List<E> list;
    try {
	  //加一，这样递归调用到上面的时候就不会再清局部缓存了
      queryStack++;
	  //根据cachekey从localCache去查
      list = resultHandler == null ? (List<E>) localCache.getObject(key) : null;
      if (list != null) {
		//如果查到localCache缓存，处理localOutputParameterCache
        handleLocallyCachedOutputParameters(ms, key, parameter, boundSql);
      } else {
		//从数据库查
        list = queryFromDatabase(ms, parameter, rowBounds, resultHandler, key, boundSql);
      }
    } finally {
	  //清空堆栈
      queryStack--;
    }
    if (queryStack == 0) {
	  //延迟加载队列中所有元素
      for (DeferredLoad deferredLoad : deferredLoads) {
        deferredLoad.load();
      }
	  //清空延迟加载队列
      deferredLoads.clear(); // issue #601
      if (configuration.getLocalCacheScope() == LocalCacheScope.STATEMENT) {
		//如果是statement，清本地缓存
        clearLocalCache(); // issue #482
      }
    }
    return list;
  }

  //延迟加载
  public void deferLoad(MappedStatement ms, MetaObject resultObject, String property, CacheKey key, Class<?> targetType) {
    if (closed) throw new ExecutorException("Executor was closed.");
    DeferredLoad deferredLoad = new DeferredLoad(resultObject, property, key, localCache, configuration, targetType);
	//如果能加载则立即加载，否则加入到延迟加载队列中
    if (deferredLoad.canLoad()) {
    	deferredLoad.load();
    } else {
		//这里怎么又new了一个新的，性能有点问题
    	deferredLoads.add(new DeferredLoad(resultObject, property, key, localCache, configuration, targetType));
    }
  }

  //创建缓存key
  public CacheKey createCacheKey(MappedStatement ms, Object parameterObject, RowBounds rowBounds, BoundSql boundSql) {
    if (closed) throw new ExecutorException("Executor was closed.");
    CacheKey cacheKey = new CacheKey();
	//MyBatis 对于其 Key 的生成采取规则为：[mappedStementId + offset + limit + SQL + queryParams + environment]生成一个哈希码
    cacheKey.update(ms.getId());
    cacheKey.update(rowBounds.getOffset());
    cacheKey.update(rowBounds.getLimit());
    cacheKey.update(boundSql.getSql());
    List<ParameterMapping> parameterMappings = boundSql.getParameterMappings();
    TypeHandlerRegistry typeHandlerRegistry = ms.getConfiguration().getTypeHandlerRegistry();
    for (int i = 0; i < parameterMappings.size(); i++) { // mimic DefaultParameterHandler logic
      ParameterMapping parameterMapping = parameterMappings.get(i);
      if (parameterMapping.getMode() != ParameterMode.OUT) {
        Object value;
        String propertyName = parameterMapping.getProperty();
        if (boundSql.hasAdditionalParameter(propertyName)) {
          value = boundSql.getAdditionalParameter(propertyName);
        } else if (parameterObject == null) {
          value = null;
        } else if (typeHandlerRegistry.hasTypeHandler(parameterObject.getClass())) {
          value = parameterObject;
        } else {
          MetaObject metaObject = configuration.newMetaObject(parameterObject);
          value = metaObject.getValue(propertyName);
        }
        cacheKey.update(value);
      }
    }
    return cacheKey;
  }    
 
  public void commit(boolean required) throws SQLException {
    if (closed) throw new ExecutorException("Cannot commit, transaction is already closed");
    clearLocalCache();
    flushStatements();
    if (required) {
      transaction.commit();
    }
  }
 
  public void rollback(boolean required) throws SQLException {
    if (!closed) {
      try {
        clearLocalCache();
        flushStatements(true);
      } finally {
        if (required) {
          transaction.rollback();
        }
      }
    }
  }

  //清空本地缓存，一个map结构
  public void clearLocalCache() {
    if (!closed) {
      localCache.clear();
      localOutputParameterCache.clear();
    }
  }
 
  //子类中实现
  protected abstract int doUpdate(MappedStatement ms, Object parameter)
      throws SQLException;
 
  //子类中实现
  protected abstract List<BatchResult> doFlushStatements(boolean isRollback)
      throws SQLException;
  //子类中实现
  protected abstract <E> List<E> doQuery(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql)
      throws SQLException;
 
  protected void closeStatement(Statement statement) {
    if (statement != null) {
      try {
        statement.close();
      } catch (SQLException e) {
        // ignore
      }
    }
  }
  //处理存储过程的out参数
  private void handleLocallyCachedOutputParameters(MappedStatement ms, CacheKey key, Object parameter, BoundSql boundSql) {
    if (ms.getStatementType() == StatementType.CALLABLE) {
      final Object cachedParameter = localOutputParameterCache.getObject(key);
      if (cachedParameter != null && parameter != null) {
        final MetaObject metaCachedParameter = configuration.newMetaObject(cachedParameter);
        final MetaObject metaParameter = configuration.newMetaObject(parameter);
        for (ParameterMapping parameterMapping : boundSql.getParameterMappings()) {
          if (parameterMapping.getMode() != ParameterMode.IN) {
            final String parameterName = parameterMapping.getProperty();
            final Object cachedValue = metaCachedParameter.getValue(parameterName);
            metaParameter.setValue(parameterName, cachedValue);
          }
        }
      }
    }
  }
  //从数据库中查
  private <E> List<E> queryFromDatabase(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql) throws SQLException {
    List<E> list;
	//向缓存中放入占位符
    localCache.putObject(key, EXECUTION_PLACEHOLDER);
    try {
      list = doQuery(ms, parameter, rowBounds, resultHandler, boundSql);
    } finally {
	  //清除占位符
      localCache.removeObject(key);
    }
	//加入缓存
    localCache.putObject(key, list);
	//如果是存储过程，OUT参数也加入缓存
    if (ms.getStatementType() == StatementType.CALLABLE) {
      localOutputParameterCache.putObject(key, parameter);
    }
    return list;
  }
 
  protected Connection getConnection(Log statementLog) throws SQLException {
    Connection connection = transaction.getConnection();
    if (statementLog.isDebugEnabled()) {
      return ConnectionLogger.newInstance(connection, statementLog, queryStack);
    } else {
      return connection;
    }
  }
  
  public void setExecutorWrapper(Executor wrapper) {
    this.wrapper = wrapper;
  }
  //延迟加载
  private static class DeferredLoad {
 
    private final MetaObject resultObject;
    private final String property;
    private final Class<?> targetType;
    private final CacheKey key;
    private final PerpetualCache localCache;
    private final ObjectFactory objectFactory;
    private final ResultExtractor resultExtractor;
 
    public DeferredLoad(MetaObject resultObject,
                        String property,
                        CacheKey key,
                        PerpetualCache localCache,
                        Configuration configuration,
                        Class<?> targetType) { // issue #781
      this.resultObject = resultObject;
      this.property = property;
      this.key = key;
      this.localCache = localCache;
      this.objectFactory = configuration.getObjectFactory();
      this.resultExtractor = new ResultExtractor(configuration, objectFactory);
      this.targetType = targetType;
    }
	//缓存中找到，且不为占位符，代表可以加载
    public boolean canLoad() {
      return localCache.getObject(key) != null && localCache.getObject(key) != EXECUTION_PLACEHOLDER;
    }
	//加载
    public void load() {
      @SuppressWarnings( "unchecked" ) // we suppose we get back a List
      List<Object> list = (List<Object>) localCache.getObject(key);
      Object value = resultExtractor.extractObjectFromList(list, targetType);
      resultObject.setValue(property, value);
    }
 
  }
 
}

```
