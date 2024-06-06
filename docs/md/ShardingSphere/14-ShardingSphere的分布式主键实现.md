# 14-ShardingSphere的分布式主键实现

## 1 ShardingSphere自动生成键

MySQL自增键、Oracle自增序列等。分片场景下问题就复杂了，不能依靠单实例上的自增键来实现不同数据节点之间的全局唯一主键，分布式主键的需求应运而生。ShardingSphere 作为一款优秀分库分表开源软件，同样提供分布式主键实现机制。

### 1.1 GeneratedKey

使用 ShardingSphere 提供的自动生成键方案时，开发过程及效果和上面描述完全一致。

ShardingSphere实现了 GeneratedKey 类：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/b3eb80de283b1b314709315bcaaf51d1.png)

先从 ShardingRule 找主键对应 Column是否已包含：

- 是，则找到该主键
- 不是，则生成新主键

分布式主键的生成看：

![image-20240605101514365](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/12bf0b3fc60d543f1a4ccad3369edd64.png)

GeneratedKey#generatedValues变量保存生成的主键，但生成主键的工作转移到 ShardingRule#generateKey，跳转过去：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/46241447c52719e408b7cb4b3e6776f0.png)

根据logicTableName找TableRule，再找其包含的 ShardingKeyGenerator，再通过 ShardingKeyGenerator#generateKey 生成主键。

#### 设计模式分析

ShardingRule只是个外观类，真正创建 ShardingKeyGenerator 的过程在 TableRule。而这里的 ShardingKeyGenerator 显然就是真正生成分布式主键入口。

### 1.2 ShardingKeyGenerator

```java
public interface ShardingKeyGenerator extends TypeBasedSPI {
    
    /**
     * Generate key.
     * 
     * @return generated key
     */
    Comparable<?> generateKey();
}
```

TableRule一个构造器找到 ShardingKeyGenerator 创建：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/c1c648ee2548bd7f42f714e909ae3aeb.png)

ShardingKeyGeneratorServiceLoader类定义：

```java
// 继承了 TypeBasedSPIServiceLoader
public final class ShardingKeyGeneratorServiceLoader extends TypeBasedSPIServiceLoader<ShardingKeyGenerator> {

  static {
    // 注册类路径中所有的 ShardingKeyGenerator
    NewInstanceServiceLoader.register(ShardingKeyGenerator.class);
  }

  public ShardingKeyGeneratorServiceLoader() {
    super(ShardingKeyGenerator.class);
  }
}
```

执行完后，ShardingKeyGeneratorServiceLoader#newService基于类型参数通过 SPI 创建实例，并赋值 Properties 属性：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/5c6f934c7245abcee5408b298ffcbabe.png)

继承 TypeBasedSPIServiceLoader 创建一个新的 ServiceLoader 类，然后在其静态方法注册相应 SPI 实现，这是 ShardingSphere 应用微内核模式常见做法。

sharding-core-common 工程的 META-INF/services 目录看到具体 SPI 定义：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/bb664f47ff3d538575391351de081b80.png)

## 2 ShardingSphere分布式主键实现

ShardingKeyGenerator 接口存在一批实现类。除前面:

- SnowflakeShardingKeyGenerator
- UUIDShardingKeyGenerator

还实现了：

- LeafSegmentKeyGenerator
- LeafSnowflakeKeyGenerator

### 2.1 UUIDShardingKeyGenerator

最简单的ShardingKeyGenerator：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/97739e2ee8e97855559216cd0b52b166.png)

### 2.2 SnowflakeShardingKeyGenerator

ShardingSphere最大容忍的时钟回拨毫秒数的默认0，可通过max.tolerate.time.difference.milliseconds设置。

常量定义，维护 SnowFlake 算法中各个 bit 之间的关系

generateKey 负责生成具体ID：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/fba010b5151bd83d3dafeb8aff2b0575.png)

综合考虑时钟回拨、同一ms内请求，才完成 SnowFlake 算法具体实现。

### 2.3 LeafSegmentKeyGenerator 和 LeafSnowflakeKeyGenerator

实现类似SnowflakeShardingKeyGenerator的ShardingKeyGenerator困难，也属重复造轮子。因此，尽管 ShardingSphere 4.x提供了完整实现：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/d6f68d9bc53508ce1d9792be6c1ce202.png)

但5.x移除。目前，ShardingSphere 专门提供 OpenSharding 库存放新版的 LeafSegmentKeyGenerator 和 LeafSnowflakeKeyGenerator。新版实现类直接采用第三方美团提供的 Leaf 开源实现。

Leaf 提供两种生成 ID 方式：

- 号段（Segment）模式
- Snowflake 模式

无论哪种，都要提供一个 leaf.properties 文件，并设置配置项。无论哪种，应用程序都要设置一个leaf.key：

```properties
# for keyGenerator key
leaf.key=sstest

# for LeafSnowflake
leaf.zk.list=localhost:2181
```

如用号段模式，需依赖一张数据库表存储运行时数据，因此要在 leaf.properties 文件中添加数据库配置：

```properties
# for LeafSegment
leaf.jdbc.url=jdbc:mysql://127.0.0.1:3306/test?serverTimezone=UTC&useSSL=false
leaf.jdbc.username=root
leaf.jdbc.password=123456
```

即可创建对应DataSource，并进一步创建用于生成分布式 ID 的 IDGen 实现类。

#### LeafSegmentKeyGenerator

基于号段模式的 SegmentIDGenImpl 实现类：

```java
//通过DruidDataSource构建数据源并设置属性
DruidDataSource dataSource = new DruidDataSource();
        dataSource.setUrl(properties.getProperty(LeafPropertiesConstant.LEAF_JDBC_URL));
        dataSource.setUsername(properties.getProperty(LeafPropertiesConstant.LEAF_JDBC_USERNAME));
        dataSource.setPassword(properties.getProperty(LeafPropertiesConstant.LEAF_JDBC_PASSWORD));
dataSource.init();
        
//构建数据库访问Dao组件
IDAllocDao dao = new IDAllocDaoImpl(dataSource);
//创建IDGen实现类
this.idGen = new SegmentIDGenImpl();
//将Dao组件绑定到IDGen实现类
((SegmentIDGenImpl) this.idGen).setDao(dao);
this.idGen.init();
this.dataSource = dataSource;
```

创建IDGen实现类，即可通过该类生成目标 ID，LeafSegmentKeyGenerator 类中包含所有的实现细节：

```java
Result result = this.idGen.get(properties.getProperty(LeafPropertiesConstant.LEAF_KEY));
return result.getId();
```

####  LeafSnowflakeKeyGenerator

LeafSnowflakeKeyGenerator实现依赖于分布式协调框架 Zookeeper,所以在配置文件中需要指定 Zookeeper 的目标地址：

```properties
# for LeafSnowflake
leaf.zk.list=localhost:2181
```

创建用于 LeafSnowflake 的 IDGen 实现类 SnowflakeIDGenImpl 相对比较简单，直接在构造器设置 zk 地址即可：

```java
IDGen idGen = new SnowflakeIDGenImpl(properties.getProperty(LeafPropertiesConstant.LEAF_ZK_LIST), 8089);
```

通过 IDGen 获取模板 ID 的方式一致：

```java
idGen.get(properties.getProperty(LeafPropertiesConstant.LEAF_KEY)).getId();
```

基于 Leaf 框架实现号段模式和 Snowflake 模式下的分布式 ID 生成方式非常简单，Leaf 框架为我们屏蔽了内部实现复杂性。

## 3 总结

ShardingSphere的分布式主键设计非常独立，本文各种分布式主键实现完全可直接套用到日常开发。

无论ShardingSphere自身实现的SnowflakeShardingKeyGenerator，还是基于第三方框架实现的 LeafSegmentKeyGenerator 和 LeafSnowflakeKeyGenerator，都为我们使用分布式主键提供直接解决方案。

参考：

- [分布式主键](https://shardingsphere.apache.org/document/4.1.0/cn/features/sharding/other-features/key-generator/)