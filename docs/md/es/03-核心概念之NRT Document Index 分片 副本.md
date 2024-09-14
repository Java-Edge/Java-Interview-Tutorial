# 03-核心概念之NRT Document Index 分片 副本

## 1 Lucene 基本概念
![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/02f9274a0dc9f34de786593c63a09a6f.png)

### segment file（Lucene）

存储倒排索引的文件，每个segment本质上就是个倒排索引，每s都会生成一个segment文件。

当文件过多时，ES会自动segment merge（合并文件），合并时会同时将已标注删除的文档物理删除。

### commit point

记录当前所有可用的segment，每个commit point都会维护一个.del文件（ES删除数据本质不属于物理删除）。

当ES删改操作时，先在.del文件声明某个document已被删除，文件内记录了在某个segment内某个文档已被删除。

当查询请求过来时，在segment中被删除的文件是能够查出来的，但当返回结果时会根据commit point维护的那个.del文件，将已删除的文档过滤。

###  translog日志文件

为防止ES宕机造成数据丢失保证可靠存储，ES会将每次写入数据同时写到translog日志。

## 2 核心概念

### 2.1 近实时-Near Realtime(NRT)

从写数据到数据可被搜索到有一个小延迟（大概1s），基于ES执行搜索和分析可达秒级。

### 2.2 集群-Cluster

包含多个节点，每个节点属于哪个集群是通过一个配置（集群名称默认elasticsearch）决定。

中小型应用刚开始的一个集群就一个节点很正常。

### 2.3 节点-Node

集群中的一个节点，节点也有一个名称（默认随机分配），节点名称很重要（在执行运维管理操作的时候），默认节点会去加入一个名称为“elasticsearch”的集群，如果直接启动一堆节点，那么它们会自动组成一个ES集群，当然一个节点也能组成一个ES集群。

### 2.4 索引-Index（表）

具有相同字段的文档列表组成，一堆相似结构的文档的集合。如有一个客户索引，商品分类索引，订单索引。索引有一个名称，一个index包含很多document，一个index代表一类相似/相同的document。

如建立一个product index（商品索引），里面可能就存放所有商品数据（商品document）。索引中存储具有相同结构的文档(Document)。每个索引都有自己的`mapping`定义（类似MySQL的schema），以定义字段名和类型。一个集群能有多个索引，如nginx日志存储时，可按日期每天生成一个索引存储：

- nginx-log-2020-01-01
- nginx-log-2020-01-02
- nginx-log-2020-01-03

### 2.5 Document & field（数据行&列）

#### 2.5.1 document

JSON结构，用户存储在ES中的数据。一个document可以是一条客户数据，一条商品分类数据，一条订单数据。由字段 Filed 组成。每个文档有唯一id标识：

- 自行指定
- ES自动生成

#### 2.5.2 数据类型

- 字符串
  text、keyword
- 数值型
  long、integer、short, byte, double, float half_float, scaled_float
- 布尔
  boolean
- 日期
  date
- 二进制
  binary
- 范围
  integer_range, float_range, long_range, double_range, date_ range

#### 2.5.3 元数据，标注文档的相关信息

- _ index: 文档所在索引名
- _type: 文档所在类型名
- _id:文档唯一id
- _uid：组合id,由type和_id 组成(ES 6.x开始 `_type`不再起作用，同_id)
- _source：文档原始JSON数据，存储了文档的完整原始数据，可从这里获取每个字段内容
- _all：整合所有字段内容到该字段，默认禁用，因其针对所有字段内容分词，很占磁盘空间

#### 2.5.4 field

每个index下的type，都可以存储多个document。一个document里面有多个field，每个field就是一个数据字段列。也就是 JSON 文档中的字段：

```json
product document
{
  "product_id": "1",
  "product_name": "JavaEdge公众号",
  "product_desc": "全是技术干货",
  "category_id": "2",
  "category_name": "技术追求"
}
```

#### 2.5.5 mapping

索引中文档的约束，如字段的类型约束，类似 MySQL 中的表结构的定义。

### 2.6 shard

单台机器无法存储大量数据，ES可将一个index中的数据切分为多个shard，分布在多台服务器存储。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/5b079991595b81279afccbf65a54658d.png)

实现横向扩展，存储更多数据，让搜索、分析等操作分布到多台服务器上去执行，提升吞吐量和性能。

每个shard都是一个lucene index：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/5b4852b9d89be9a4e2452c1ce6b2f881.png)

### 2.7 replica

任何一个服务器随时可能故障或宕机，此时shard可能就会丢失，因此可以为每个shard创建多个replica副本。
replica可在shard故障时提供备用服务，保证数据不丢失，多个replica还可以提升搜索操作的吞吐量和性能。primary shard（建立索引时一次设置，不能修改，默认5个），replica shard（随时修改数量，默认1个），默认每个索引10个shard，5个primary shard，5个replica shard，最小的高可用配置，是2台服务器。

#### shard V.S replica



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/dab36d197ec1267963549799b053e35e.png)

### 2.8 类型-Type （表逻辑类型）

ES 7.x中已废除。每个index都可有一或多个type，type是index的一个逻辑数据分类。
一个type下的document，都有相同field。
比如博客系统，有一个索引，可定义用户数据type，博客数据type，评论数据type。

商品index里存放所有的商品数据，商品document
但是商品分很多种类，每个种类的document的field可能不太一样
比如说电器商品，可能还包含一些诸如售后时间范围这样的特殊field；生鲜商品，还包含一些诸如生鲜保质期之类的特殊field

type，日化商品type，电器商品type，生鲜商品type

```bash
日化商品type：product_id，product_name，product_desc，category_id，category_name
电器商品type：product_id，product_name，product_desc，category_id，category_name，service_period
生鲜商品type：product_id，product_name，product_desc，category_id，category_name，eat_period
```

每个type包含一堆document：

```json
{
  "product_id": "2",
  "product_name": "长虹电视机",
  "product_desc": "4k高清",
  "category_id": "3",
  "category_name": "电器",
  "service_period": "1年"
}
{
  "product_id": "3",
  "product_name": "基围虾",
  "product_desc": "纯天然，冰岛产",
  "category_id": "4",
  "category_name": "生鲜",
  "eat_period": "7天"
}
```

## 3 RESTful API

ES 集群对外提供RESTful API

- URI 指定资源 , 如 Index、Document等
- Http Method 指明资源操作类型，如GET、POST、 PUT、DELETE 

### 3.1 交互方式

- curl 命令行
- Kibana DevTools

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/dc0b1db3ecca2295aa3aad70f2b671ba.png)