# 1 MyBatis的初始化做了什么
任何框架的初始化，无非是加载自己运行时所需要的配置信息。MyBatis的配置信息，大概包含以下信息，其高层级结构如下：
![](https://upload-images.jianshu.io/upload_images/4685968-0c45dabf64e579f9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
MyBatis的上述配置信息会配置在XML配置文件中，那么，这些信息被加载进入MyBatis内部，MyBatis是怎样维护的呢？

MyBatis采用了一个非常直白和简单的方式---使用 `org.apache.ibatis.session.Configuration `对象作为一个所有配置信息的容器，Configuration对象的组织结构和XML配置文件的组织结构几乎完全一样
![](https://upload-images.jianshu.io/upload_images/4685968-3a368ed13c5c304f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
MyBatis根据初始化好Configuration信息，这时候用户就可以使用MyBatis进行数据库操作了

**可以这么说，MyBatis初始化的过程，就是创建 Configuration对象的过程。**
MyBatis的初始化可以有两种方式：
> *   基于XML配置文件：基于XML配置文件的方式是将MyBatis的所有配置信息放在XML文件中，MyBatis通过加载并XML配置文件，将配置文信息组装成内部的Configuration对象
> *   基于Java API：这种方式不使用XML配置文件，需要MyBatis使用者在Java代码中，手动创建Configuration对象，然后将配置参数set 进入Configuration对象中
接下来我们将通过 基于XML配置文件方式的MyBatis初始化，深入探讨MyBatis是如何通过配置文件构建Configuration对象，并使用它的。
# 2 MyBatis基于XML配置文件创建Configuration对象的过程
现在就从使用MyBatis的简单例子入手，深入分析一下MyBatis是怎样完成初始化的，都初始化了什么

有过MyBatis使用经验的读者会知道，上述语句的作用是执行**com.foo.bean.BlogMapper.queryAllBlogInfo** 定义的SQL语句，返回一个List结果集
总的来说，上述代码经历了
**mybatis初始化 -->创建SqlSession -->执行SQL语句** 
返回结果三个过程。 

上述代码的功能是根据配置文件mybatis-config.xml  配置文件，创建SqlSessionFactory对象，然后产生SqlSession，执行SQL语句
而mybatis的初始化就发生在第三句
```
SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);  
```
现在就让我们看看第三句到底发生了什么。
# 2 **MyBatis初始化基本过程**
**SqlSessionFactoryBuilder根据传入的数据流生成Configuration对象，然后根据Configuration对象创建默认的SqlSessionFactory实例。**
![](https://upload-images.jianshu.io/upload_images/4685968-ce21b0677a44f26b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
由上图所示，mybatis初始化要经过简单的以下几步
- 调用SqlSessionFactoryBuilder对象的build(inputStream)方法
![](https://upload-images.jianshu.io/upload_images/4685968-a5c1546967283fba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- SqlSessionFactoryBuilder会根据输入流inputStream等信息创建XMLConfigBuilder对象
- SqlSessionFactoryBuilder调用XMLConfigBuilder对象的parse()方法
![](https://upload-images.jianshu.io/upload_images/4685968-6271cc4234a5b7bf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- XMLConfigBuilder对象返回Configuration对象
- SqlSessionFactoryBuilder根据Configuration对象创建一个DefaultSessionFactory对象
![](https://upload-images.jianshu.io/upload_images/4685968-29392888c3913ea0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- SqlSessionFactoryBuilder返回 DefaultSessionFactory对象给Client，供Client使用

上述的初始化过程中，涉及到了以下几个对象：
*   SqlSessionFactoryBuilder ： SqlSessionFactory的构造器，用于创建SqlSessionFactory，采用了Builder设计模式 
*   Configuration ：该对象是mybatis-config.xml文件中所有mybatis配置信息
*   SqlSessionFactory：SqlSession工厂类，以工厂形式创建SqlSession对象，采用了工厂设计模式
 *   XmlConfigParser ：负责将mybatis-config.xml配置文件解析成Configuration对象，共SqlSessonFactoryBuilder使用，创建SqlSessionFactory
# 3 创建Configuration对象
SqlSessionFactoryBuilder执行build()方法，调用了XMLConfigBuilder的parse()方法，然后返回了Configuration对象。那么parse()方法是如何处理XML文件，生成Configuration对象的呢？

-  XMLConfigBuilder会将XML配置文件的信息转换为Document对象，而XML配置定义文件DTD转换成XMLMapperEntityResolver对象，然后将二者封装到XpathParser对象中，XpathParser的作用是**提供根据Xpath表达式获取基本的DOM节点Node信息的操作**
![](https://upload-images.jianshu.io/upload_images/4685968-c3eab1987c538598.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a9ef1bb384b05601.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
之后XMLConfigBuilder调用parse()方法：会从XPathParser中取出 <configuration>节点对应的Node对象，然后解析此Node节点的子Node：properties, settings, typeAliases,typeHandlers, objectFactory, objectWrapperFactory, plugins, environments,databaseIdProvider, mappers
```
    public Configuration parse()
    {
        if (parsed)
        {
            throw new BuilderException("Each XMLConfigBuilder can only be used once.");
        }
        parsed = true;
        //源码中没有这一句，只有 parseConfiguration(parser.evalNode("/configuration"));
        //为了让读者看得更明晰，源码拆分为以下两句
        XNode configurationNode = parser.evalNode("/configuration");
        parseConfiguration(configurationNode);
        return configuration;
    }
    /*
    解析 "/configuration"节点下的子节点信息，然后将解析的结果设置到Configuration对象中
    */
  private void parseConfiguration(XNode root) {
    try {
      //1.首先处理properties 节点	
      propertiesElement(root.evalNode("properties")); //issue #117 read properties first
      //2.处理typeAliases
      typeAliasesElement(root.evalNode("typeAliases"));
      //3.处理插件
      pluginElement(root.evalNode("plugins"));
      //4.处理objectFactory
      objectFactoryElement(root.evalNode("objectFactory"));
      //5.objectWrapperFactory
      objectWrapperFactoryElement(root.evalNode("objectWrapperFactory"));
      //6.settings
      settingsElement(root.evalNode("settings"));
      //7.处理environments
      environmentsElement(root.evalNode("environments")); // read it after objectFactory and objectWrapperFactory issue #631
      //8.database
      databaseIdProviderElement(root.evalNode("databaseIdProvider"));
      //9. typeHandlers
      typeHandlerElement(root.evalNode("typeHandlers"));
      //10 mappers
      mapperElement(root.evalNode("mappers"));
    } catch (Exception e) {
      throw new BuilderException("Error parsing SQL Mapper Configuration. Cause: " + e, e);
    }
  }
```
- 然后将这些值解析出来设置到Configuration对象中
解析子节点的过程这里就不一一介绍了，用户可以参照MyBatis源码仔细揣摩，我们就看上述的environmentsElement(root.evalNode("environments")); 方法是如何将environments的信息解析出来，设置到Configuration对象中的
```
/*
   解析environments节点，并将结果设置到Configuration对象中
   注意：创建envronment时，如果SqlSessionFactoryBuilder指定了特定的环境（即数据源）；
         则返回指定环境（数据源）的Environment对象，否则返回默认的Environment对象；
         这种方式实现了MyBatis可以连接多数据源
*/
private void environmentsElement(XNode context) throws Exception
{
    if (context != null)
    {
        if (environment == null)
        {
            environment = context.getStringAttribute("default");
        }
        for (XNode child : context.getChildren())
        {
            String id = child.getStringAttribute("id");
            if (isSpecifiedEnvironment(id))
            {
                //1.创建事务工厂 TransactionFactory
                TransactionFactory txFactory = transactionManagerElement(child.evalNode("transactionManager"));
                DataSourceFactory dsFactory = dataSourceElement(child.evalNode("dataSource"));
                //2.创建数据源DataSource
                DataSource dataSource = dsFactory.getDataSource();
                //3. 构造Environment对象
                Environment.Builder environmentBuilder = new Environment.Builder(id)
                .transactionFactory(txFactory)
                .dataSource(dataSource);
                //4. 将创建的Envronment对象设置到configuration 对象中
                configuration.setEnvironment(environmentBuilder.build());
            }
        }
    }
}
private boolean isSpecifiedEnvironment(String id)
{
    if (environment == null)
    {
        throw new BuilderException("No environment specified.");
    }
    else if (id == null)
    {
        throw new BuilderException("Environment requires an id attribute.");
    }
    else if (environment.equals(id))
    {
        return true;
    }
    return false;
}
```
- 返回Configuration对象
![MyBatis初始化基本过程的序列图](https://upload-images.jianshu.io/upload_images/4685968-5ac113150029374b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 4 手动加载XML配置文件创建Configuration对象完成初始化，创建并使用SqlSessionFactory对象
我们可以使用XMLConfigBuilder手动解析XML配置文件来创建Configuration对象，代码如下
![](https://upload-images.jianshu.io/upload_images/4685968-7f716a450062bcfc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 5 涉及到的设计模式
## 5.1 **Builder模式应用1： SqlSessionFactory的创建**
对于创建SqlSessionFactory时，会根据情况提供不同的参数，其参数组合可以有以下几种
![](https://upload-images.jianshu.io/upload_images/4685968-0951bb9c904e8a45.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
由于构造时参数不定，可以为其创建一个构造器Builder，将SqlSessionFactory的构建过程和表示分开
![ MyBatis将SqlSessionFactoryBuilder和SqlSessionFactory相互独立](https://upload-images.jianshu.io/upload_images/4685968-3e834245c96bf463.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 5.2 **Builder模式应用2： 数据库连接环境Environment对象的创建**
在构建Configuration对象的过程中，XMLConfigParser解析 mybatis XML配置文件节点<environment>节点时，会有以下相应的代码
```
  private void environmentsElement(XNode context) throws Exception {
    if (context != null) {
      if (environment == null) {
        environment = context.getStringAttribute("default");
      }
      for (XNode child : context.getChildren()) {
        String id = child.getStringAttribute("id");
        //是和默认的环境相同时，解析之
        if (isSpecifiedEnvironment(id)) {
          TransactionFactory txFactory = transactionManagerElement(child.evalNode("transactionManager"));
          DataSourceFactory dsFactory = dataSourceElement(child.evalNode("dataSource"));
          DataSource dataSource = dsFactory.getDataSource();
 
          //使用了Environment内置的构造器Builder，传递id 事务工厂和数据源
          Environment.Builder environmentBuilder = new Environment.Builder(id)
              .transactionFactory(txFactory)
              .dataSource(dataSource);
          configuration.setEnvironment(environmentBuilder.build());
        }
      }
    }
  }
```
在Environment内部，定义了静态内部Builder类
```
public final class Environment {
  private final String id;
  private final TransactionFactory transactionFactory;
  private final DataSource dataSource;
 
  public Environment(String id, TransactionFactory transactionFactory, DataSource dataSource) {
    if (id == null) {
      throw new IllegalArgumentException("Parameter 'id' must not be null");
    }
    if (transactionFactory == null) {
        throw new IllegalArgumentException("Parameter 'transactionFactory' must not be null");
    }
    this.id = id;
    if (dataSource == null) {
      throw new IllegalArgumentException("Parameter 'dataSource' must not be null");
    }
    this.transactionFactory = transactionFactory;
    this.dataSource = dataSource;
  }
 
  public static class Builder {
      private String id;
      private TransactionFactory transactionFactory;
      private DataSource dataSource;
 
    public Builder(String id) {
      this.id = id;
    }
 
    public Builder transactionFactory(TransactionFactory transactionFactory) {
      this.transactionFactory = transactionFactory;
      return this;
    }
 
    public Builder dataSource(DataSource dataSource) {
      this.dataSource = dataSource;
      return this;
    }
 
    public String id() {
      return this.id;
    }
 
    public Environment build() {
      return new Environment(this.id, this.transactionFactory, this.dataSource);
    }
 
  }
 
  public String getId() {
    return this.id;
  }
 
  public TransactionFactory getTransactionFactory() {
    return this.transactionFactory;
  }
 
  public DataSource getDataSource() {
    return this.dataSource;
  }
 
}
```
