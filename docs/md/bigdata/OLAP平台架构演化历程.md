# OLAP平台架构演化历程

## 0 导读

随着大数据的持续发展及数字化转型的兴起，大数据OLAP分析需求越来越迫切，不论是大型互联网企业，还是中小型传统企业，都在积极探索及实践OLAP引擎选型及平台架构建设，大数据技术的蓬勃发展过程中产生了大量优秀的OLAP引擎，其带来的好处是，大家在做OLAP架构是可以有多种选择，其带来的弊端是，如何在众多OLAP引擎中选择适合业务需求的现状及后续发展，成为解决这一行业性难题的关键能力。今天会和大家分享下公司OLAP平台架构及演进。

今天的分享会围绕下面三点展开：

- OLAP平台架构演化历程
- OLAP引擎选型
- 未来工作规划

## 1 OLAP平台架构演进

- Hive to MySQL初级阶段
- 基于Kylin的OLAP平台建设阶段，这个阶段OLAP平台建设是围绕Kylin引擎来进行的，Kylin是唯一支持的OLAP引擎
- 支持多种OLAP引擎的平台建设阶段，该阶段是第二个阶段的增强与扩展，解耦了OLAP平台与Kylin引擎的强耦合，能够灵活支持除Kylin之外的其他OLAP引擎

### 1.1 Hive2MySQL

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240331183824498.png)

从无到有：落地简单。

#### 1.1.1 问题

- 受限于MySQL能力，无法支持大数据量的存储与快速查询
- 缺少共性能力沉淀，需求驱动，Case byCase解决问题，定制开发时间较长

数据流程简单，数据处理流程简单，数据包括日志、DB log等，经Sqoop批量或Kafka实时接入大数据平台HDFS里，在大数据平台进行ETL后，通过大数据调度系统Ooize，每天定时写入到关系型数据库MySQL，再以MySQL中数据为基础产出各种报表。

该阶段是OLAP平台架构从无到有的一个过程，很多公司在初始的时候都是按该架构设计实现

#### 1.1.2 特点

① 架构简单，几个初级甚至中级工程师就能搭好，快速落地跑通

② 报表查询性能差，所有结果数据都存储在OLTP型MySQL，MySQL无法支持大数据量查询，百万级到千万级别数量，MySQL性能明显下降

③ 需求驱动、高层抽象不足，缺少共性能力沉淀，case by case的开发模式，即按业务数据需求，从数据采集接入、数据处理、数据调度全流程“烟囱式”开发，没有将共性的数据处理方法或手段沉淀，导致每个需求开发时间都长，大量重复工作。

总之，该阶段无沉淀共性的数据处理方法，不具备平台化。

随业务迅速发展，数据应用需求增加，数据分析任务量越来越重，Hive2MySQL问题逐步暴露，原始架构升级改造是必然。

#### 1.1.3 改造目标

##### ① 解决MySQL无法支持海量数据分析查询的问题

MySQL分析能力不足问题的问题，引入能支持大数据量的OLAP引擎（存储与快速查询），经调研选择Kylin

##### ② 平台化，沉淀共性能力

需求驱动，平台化不够，需建设公司级OLAP 平台，即指标平台。

指标：业务单元细分后量化的度量值

- 维度：观察数据的角度，如时间、地点
- 度量：需统计聚合的值，如GMV、带看量

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240331211311510.png)

对需求驱动、缺少共性沉淀，平台化不够：

- 一方面规范化数仓建模，沉淀一些可复用性的中间层表，即借鉴业界通用经验分为ODS、DWD、DWS、OLAP等层
- 另一方面引入一个指标和指标平台，通过指标向公司各业务线提供数据分析服务。指标是业务单元细分后量化的度量值，包括维度（即看数的角度）和度量（需要统计聚合的值）。指标平台将数仓开发人员的维度建模（星型或雪花模型）暴露成业务方容易理解的指标。

### 1.2 基于Kylin

引入OLAP引擎Kylin

在Kylin之上引入指标平台：

- 对外提供统一的API
- 指标统一定义，统一口径管理
- 实现指标查询

应用层统一通过指标API来获取数据，不直接使用SQL访问Kylin。

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240331213935072.png)

基于前面思考，就有基于Kylin的OLAP平台架构。从底向上分3层：

- OLAP引擎层，此处即Apache Kylin，只支持Apache Kylin引擎
- Kylin之上是指标平台，对外提供统一API、指标统一定义和口径管理以，支持指标高效查询
- 最上面应用层，XX一个数据可视化产品和各种数据应用产品，它们通过统一的指标API来获得数据，不直接使用SQL访问Kylin。Kylin下面的Hive数据仓库层里有ODS、DWD、DWS、OLAP各层数仓表

## 2 指标平台

### 2.1 指标定义

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240331214419884.png)

每个指标通过很多维度去描述，上图展示一个指标包含基本信息及血缘。

基本信息包含指标名称，如带看量_集团？若是房产相关公司，就是卖房租房都要带客去看，所以这是重要指标。

关注指标的支持维度，即允许业务方从哪些维度去看数据，如：

- 分公司编码，代表一个分公司的带看量
- 运营管理大区编码维度，代表运营管理大区的带看量

支持从组织架构的不同层级查看集团带看量。

也可以查看区域的带看量，可以看某个具体人的带看量，可以看到20多个维度的带看量。另外比较关键的信息，指标的口径描述了指标计算方式。通过这个指标定义，方便了解指标信息及直观定义。

指标是指是对维度建模（星型或雪花模型）的抽象，指标包括维度和度量，分别对应维度建模中的度量和维度。

许多使用指标时需要了解的重要信息，如指标的口径描述了指标计算方式。

#### 指标类型

- 原子指标，即基础指标
- 派生指标：基础指标+业务限定。对于一个已有的指标，不管是原子还是派生的还是复合的，都可以对它进行再派生，加一些条件，就可以得到一个新的派生指标
- 复合指标：通过指标四则运算生成新的指标。

指标平台实现指标的统一定义和口径管理。

所有的指标的定义和口径都是在指标平台进行管理的。各个业务方都主要通过在OLAP平台上定义和使用指标，来实现多维数据分析的。

### 2.2 指标查询

指标平台对外提供统一的API来获取指标数据，上图就是一个指标调用参数示例，参数传到指标平台，指标平台会根据调用参数自动转换为Kylin查询SQL，对Kylin发起查询，获得数据，并根据需求进一步处理。

左图调用参数，转化成对应Kylin SQL如右图：

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240331220720314.png)

左边的指标调用参数，JSON直观。如startDatae为开始日期，endDate为截止日期，描述需查询哪个时间范围的指标数据；filter表示过滤条件，如city_code等于11000，表示要查看北京的带看量。Json中还可以配置是否分页，是否需要计算同环比。Json查询参数传送到指标平台，指标平台负责将调用参数转换成对底层OLAP查询引擎Kylin的查询语句。从生成的Kylin SQL中可以看到，startDate及endDate被转换成了一个SQL中的过滤条件，dim描述的city_code转换为groupby聚合语句。参数与SQL的这类转换映射关系，在指标开发的时候，通过在Kylin的Cube模型里面定义的，调用人员就不需要显示指定。为提高查询性能，Kylin也会做一些维度补全的工作，如示例中的sun_dt及month这类层级维度。

### 2.3 指标API应用

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240331222809869.png)

指标完成开发之后，就可在内部可视化平台利用指标配置各种报表，也可以自己开发数据应用产品，在产品里调用指标API获取数据。

上图展示利用指标在可视化平台中配置报表的救命，通过在数据源中选择一个指标，指标对应的维度和度量呈现出来。通过拖拽维度、度量便能快速完成报表。内部也有大量的数据产品通过调用指标API来获取指标数据。

## 3 Kylin选型及简介

为什么选择Kylin？根据第一阶段的问题，需求是：

- 支持百亿级别大数据量
- 比较快的响应时间
- 能够支持较高的并发

通过选型测试Kylin正好满足。

### 3.1 OLAP选型：Apache Kylin

- 最初由eBay开发贡献至Apache开源社区
- 支持大规模数据，能够处理TB乃至PB级别的分析任务，支持高并发、亚秒级查询
- 其核心思想是预计算，即对多维分析可能用到的度量进行预计算，将计算好的结果保存成cube，供之后查询

### 3.2 Kylin架构

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240331223112186.png)

核心思想就是预计算，对多维分析可能用到度量进行预计算，把预计算结果存在Cube，供后续查询。Kylin整体架构如上。

#### 3.2.1 主要模块

##### ① Metadata管理模块

先要知道咋预计算，即知晓哪些维度和度量，Kylin要求用户先定义Cube来获得这些信息，Cube定义支持星型或雪花模型，由Metadata模块管理。

##### ② Cube Build Engine

提供Cube构建引擎做预计算，支持MR引擎、Spark引擎、Flink引擎，将预计算结果存到HBase。

##### ③ 查询引擎（Query Engine）

用户可通过REST API及JDBC/ODBC来查询Kylin，利用SQL来查询Cube数据，Kylin的Query Engine会把SQL等查询请示自动转化为对底层HBase查询。

### 3.3 解决维度爆炸

预计算一个最大问题“维度爆炸”，维度组合太多，计算量过大。Kylin咋优化呢？只是Kylin基于大数据平台实现这套，使它可支持海量数据，而之前基于这种预计算方式的引擎支持的数据量很有限。

这样，在OLAP平台就

#### 3.3.1 建立标准的指标开发流程

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240331224706689.png)

- Cube定义和创建：Kylin
- 指标创建：指标平台

有在Kylin中操作的部分，也有在指标平台操作的部分。所以是围绕Kylin来构建的OLAP平台。

#### 3.3.2 指标（Kylin）使用统计

经过两三年推广，基于Kylin的OLAP平台在公司得到了较广泛的应用，支撑整个公司指标体系的建立，覆盖所有业务线。目前，平台上有：

- 6000多个指标
- 日均调用量大概2000w
- 99.5%的指标调用3内返回

#### 3.3.3 Kylin相关工作和应用情况

> https://www.slidestalk.com/Kyligence/ApacheKylinInBeike

在Kylin使用过程中，为了保障Kylin的稳定性及提升Kylin构建和查询性能，围绕Kylin做的工作：

- Kylin监控管理平台建设
- Kylin优化与定制改造
- Kylin与公司内部大数据系统的整合

Kylin在公司内应用现状：

- 800多个Cube
- 300多TB的存储量，总的数据量大约1600亿以上，单个Cube最大有60个亿以上
- 日查询2000万+
- Kylin的实例大概在100以上，30个以上HBase节点

## 4 新问题

指标大量推广使用后，业务方也反馈许多问题：

### 4.1 指标支持的维度数量有限

很多业务方的指标一般有30-40个维度；为了满足需求，数仓开发人员只能把一个指标拆成几个指标，限制每个指标的维度数量，导致指标维护和管理困难

### 4.2 Cube构建时间长

特别是数据规模增大以后，导致指标的产出时间较晚

### 4.3 灵活性不够

每次修改Cube（维度变更）需全量回刷Cube，耗时时间长

### 4.4 性能优化困难

Kylin基于HBase存储预计算结果，Rowkey的设计对性能影响很大，性能可以相差几十上百甚至上千倍。指标的开发人员往往是一些数仓人员，对HBase的理解不够深刻，难以进行性能优化

### 4.5 不支持实时指标

Kylin3.0引入了实时指标支持。

通过分析，我们总结出，问题的根源在于Kylin的预计算原理，全量预计算：

- 计算量大，耗时长
- 如有部分变更就需要重算，如果只依赖Kylin是没法解决的


因此，团队认为单一Kylin引擎无法满足公司不同业务场景下的应用需求，OLAP平台需要能够针对不同的业务场景使用不同的OLAP引擎。

## 5 最终阶段-支持多种OLAP引擎的OLAP平台

### 5.1 目标

- 灵活支持各种引擎，可插拔OLAP引擎绑定
- 指标平台与OLAP引擎解耦，支持动态切换OLAP引擎
- 应用接口层保持一致

### 5.2 架构

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240331231757407.png)

引入其他引擎如Druid、Clickhouse、Doris，中间增加查询引擎层，其中标红的是Cube管理负责管理Kylin中迁移过来的指标。统一指标API屏蔽了底层接口，保证兼容性，应用层保持不变。

### 5.3 新架构改动关键

#### ① 统一Cube定义与管理

将Cube定义和管理从Kylin中解耦到指标平台：

- 为了兼容用户的使用习惯，指标平台设计中参考Kylin、Mondrian等Cube定义原理
- 在指标平台及底层OLAP引擎中引入抽象层
- 实现Cube动态绑定到不同的OLAP引擎

#### ② 查询引擎

- 在指标平台与底层OLAP引擎之间引入统一的查询接口（结构化）
- 屏蔽不同引擎查询语言的差异，保证数据应用层，如XX可视化、图灵等数据应用产品也不受底层多引擎切换影响
- 查询引擎把统一的查询请求转换到特定的一个引擎，同时，提供路由、垄断能力

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240331232405319.png)

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240331232451647.png)

查询引擎会根据传入的指标调用参数自动生成不同引擎的查询语句，指标平台不用再承担这部分工作。

#### ③ 标准化指标开发流程

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240331233520661.png)

- 构建Cube：对Druid/CK/Doris就是完成数据源(表)的导入
- 以Druid引擎为例：构建Cube就是根据Cube中的Join关系生成临时宽表，将宽表导入Druid

这样一来，指标开发流程变得更加通用，虽各节点不变，但所有工作都在指标平台实现，不用强依赖Kylin。整个开发流程语义有变，如：

- 对Kylin构建Cube语义，是真实的执行预计算
- 对Druid/CK/Doris等构建Cube，就是一个数据源（表）导入

具体而言，Druid引擎构建Cube，就转换为根据Cube中的Join关系生成宽表，指标平台会把对指标的查询转换照宽表查询。针对Doris引擎，支持较好的关系关联Join查询，就不用转换为宽表，直接把几个维表和事实表都导入，直接执行Join查询。因此，不同引擎有不同语义。

### 5.4 指标开发工具

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240331233829406.png)

为更好实现指标开发，我们开发了一站式指标开发工具VILI，整个指标开发过程，包括数仓规划和建模，Cube建模，指标定义、指标加工，复合指标加工等都在该工具上实现。类似于实现阿里的OneData体系。

现在 OLAP 平台能够灵活地支持不同的 OLAP 引擎，该选啥 OLAP 引擎？

## 6 OLAP平台架构演化历程

### 6.1 OLAP技术选型

#### ① 数据量

能支持多大量级的数据量，例如 TB 级甚至更大；

#### ② 查询性能

- 响应时间快不快，是否支持亚秒级响应
- 支持的 QPS，在高 QPS 的情况下整体查询的性能怎么样

#### ③ 灵活性

灵活性没有具体的标准， OLAP 引擎是否支持 SQL、是否支持实时导入、是否支持实时更新、是否支持实时动态变更等等，这些都是灵活性的体现，具体要求是根据自己的应用需求来确定；

目前没有一种开源 OLAP 引擎能够同时满足这三个方面，在 OLAP 引擎选型时，需要在这三个方面之间进行折衷，3选2。

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240331234005440.png)

目前开源 OLAP 引擎数量比较多，往好说百花齐放，但也说明这块很混乱。

### 6.2 分类原则

- 第一看架构原理，MPP或批处理
- 第二看是否有自定义存储格式，管理自己的数据，即是否存储与计算分离

首先是 SQL on Hadoop，它又可分两类：

- SQL on Hadoop – MPP，基于 MPP 原理实现的引擎，像Presto、Impala、Drill，特点是通过 MPP 的方式去执行 SQL，且不自己管理存储，一般查 HDFS，支持 Parquet 或 ORC 通用列式存储格式；它可以支持较大的数据量，具有较快的响应时间，但是支持的 QPS 不高，往往具有较好的灵活性，支持 SQL、Join
- SQL on Hadoop – Batch，即Spark SQL 或 Hive，把 SQL 转换成 MR 或 Spark 任务执行，可以支持非常大的数据量，灵活性强，对 SQL 支持度高，但是响应时间较长，无法支持亚秒级响应

存储计算不分离的，即引擎自己管理存储的，其架构可能基于 MPP 或 Scatter-Gatter 的或预计算的，这类 OLAP 引擎的特点是，可以支持较大的数据量，具有较快的响应时间和较高的 QPS，灵活性方面各 OLAP 不同，各有特点，如有些对 SQL 支持较好，有些支持 Join，有些 SQL 支持较差。

了解这些，再结合业务权衡。公司业务方一般对响应时间和 QPS 要求均较高，所以基本只能在自带存储引擎里的类型中选择。Kylin 是已经在用，其他主要关注 Druid，Clickhouse 和 Doris。

### 6.3 OLAP引擎对比

![图片](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/640-1899950.)

对于数据量和查询性能（包括响应时间和高并发），这几个引擎的支持都是不错的，可以满足公司 TB 级的需求。

灵活性关注的几个方面主要包括对 SQL 的支持、实时数据导入、实时更新、Online Schema 变更等特性，这些是在业务需求处理中经常需要用到的特性。

### 6.4 案例介绍Druid

#### Druid使用统计

- 目前 Druid 主要用于离线指标
- 实时指标测试中(不支持实时精确去重和实时Update)
- 大概承担了平台 50% 左右的流量，性能还不错
- 3s 的返回率大概在 99.7%
- 相比于 Kylin，Druid 引擎在 Cube 构建速度和存储空间使用方面均有较大的优势，能够有效解决 Cube 构建时间长，指标产出较晚，和指标变更耗时的问题。

以目前在 Druid 平台上访问量 Top 12 的表（Datasource）为对象，对比分析它们在 Kylin 和 Druid 上的数据导入时长和数据膨胀率情况。

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/640-20240331235014267)

大部分表的 Cube 构建时长在 Druid 要比在 Kylin 上快 1 倍以上，而对一些维度多、基数大的表，Kylin 的预计算量巨大，Druid 上的导入时间要比 Kylin 上快 3、4 倍。

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/640-20240331235021054)

Kylin上数据的膨胀率远大于Druid，一般是几倍，十几倍，甚至几百倍，这也是由Kylin的原理（即用空间换时间）所决定的。

#### 围绕 Druid 引擎的工作

- Druid 监控管理平台建设：及时发现和解决 Druid 各种线上问题，保障平台的稳定
- Druid 优化与定制改造：
  - 增加精确去重功能支持
  - 大查询监控与处理
  - 数据导入优化
  - 查询优化
  - gc调优

- Druid 与公司内部大数据系统的整合：和公司大数据系统、元数据管理平台、调度系统等内部系统进行整合；

CK 和 Doris 都是基于 MPP 的，有自定义的存储格式。目前主要用于实时指标和明细数据查询，承担了小部分流量，在 1%-2% 左右，现在还在进一步深度测试。

## 7 规划

- 推广应用 Druid、Clickhouse、Doris 等不同引擎，进一步完善各 OLAP 引擎监控管理平台，优化和完善引擎能力

- 实现多个 OLAP 引擎的智能路由，能够根据数据量、查询特征（例如 QPS 等）之间做自动/半自动的迁移和路由

- 与 Adhoc 平台实现融合，对一些频率高查询慢的查询可以路由到 OLAP 平台上

- 进一步完善和优化实时指标支持，目前实时指标只是基本上把整个流程走通了，引入多种 OLAP 引擎后将进一步考虑如何更好的支持实时指标