# 1 lucene VS elasticsearch
lucene，最先进、功能最强大的Java搜索类库。直接基于lucene开发，非常复杂，api复杂（实现简单功能，写大量java代码），需要深入理解原理（各种索引结构）。

elasticsearch，基于lucene，隐藏复杂性，提供简单易用的restful api接口、java api接口（还有其他语言的api接口）
（1）分布式的文档存储引擎
（2）分布式的搜索引擎和分析引擎
（3）分布式，支持PB级数据

开箱即用，优秀的默认参数，不需要任何额外设置，完全开源。

# 2 核心概念
## 2.1 近实时-Near Realtime(NRT)
从写入数据到数据可以被搜索到有一个小延迟（大概1秒），基于es执行搜索和分析可以达到秒级。
## 2.2 集群-Cluster
包含多个节点，每个节点属于哪个集群是通过一个配置（集群名称，默认是elasticsearch）决定。
对于中小型应用来说，刚开始一个集群就一个节点很正常。

## 2.3 节点-Node
集群中的一个节点，节点也有一个名称（默认是随机分配的），节点名称很重要（在执行运维管理操作的时候），默认节点会去加入一个名称为“elasticsearch”的集群，如果直接启动一堆节点，那么它们会自动组成一个elasticsearch集群，当然一个节点也可以组成一个elasticsearch集群

## 2.4 索引-Index(表)
由具有相同字段的文档列表组成，包含一堆相似结构的文档数据。

比如可以有一个客户索引，商品分类索引，订单索引。索引有一个名称
一个index包含很多document，一个index就代表了一类类似/相同的document。

比如建立一个product index 商品索引，里面可能就存放了所有的商品数据（商品document）。

索引中存储具有相同结构的文档(Document)
- 每个索引都有自己的`mapping`定义（类似 MySQL 的 schema），用于定义字段名和类型
- 一个集群可以有多个索引，比如
	- nginx日志存储的时候可以按照日期每天生成一个索引来存储
	nginx-log-2020-01-01
	nginx-log-2020-01-02
	nginx-log-2020-01-03

## 2.5 Document & field（行 & 列）
### document
JSON结构，用户存储在 ES 中的数据文档。一个document可以是一条客户数据，一条商品分类数据，一条订单数据。由字段 Filed 组成。

每个文档有唯一的id标识：
- 自行指定
- es自动生成
#### 数据类型
- 字符串
text, keyword
- 数值型
long, integer, short, byte, double, float half_float, scaled_float
- 布尔
boolean
- 日期
date
- 二进制
binary
- 范围类型
integer_range, float_range, long_range, double_range, date_ range

#### 元数据-用于标注文档的相关信息
- _ index: 文档所在的索引名
- _type: 文档所在的类型名
- _id:文档唯一id
-  _uid：组合id,由type和. jid 组成(ES 6.x开始 `_type`不再起作用，同_id)
- _source：文档原始JSON数据，可以从这里获取每个字段的内容
- _all：整合所有字段内容到该字段，默认禁用，因其针对所有字段内容分词，很占磁盘空间

### field
每个index下的type，都可以存储多个document。一个document里面有多个field，每个field就是一个数据字段列。
```json
product document
{
  "product_id": "1",
  "product_name": "JavaEdge 公众号",
  "product_desc": "全是技术干货",
  "category_id": "2",
  "category_name": "技术追求"
}
```

## 2.6 shard
单台机器无法存储大量数据，es可以将一个索引中的数据切分为多个shard，分布在多台服务器上存储
有了shard就可以横向扩展，存储更多数据，让搜索和分析等操作分布到多台服务器上去执行，提升吞吐量和性能
每个shard都是一个lucene index。

## 2.7 replica
任何一个服务器随时可能故障或宕机，此时shard可能就会丢失，因此可以为每个shard创建多个replica副本。
replica可以在shard故障时提供备用服务，保证数据不丢失，多个replica还可以提升搜索操作的吞吐量和性能。primary shard（建立索引时一次设置，不能修改，默认5个），replica shard（随时修改数量，默认1个），默认每个索引10个shard，5个primary shard，5个replica shard，最小的高可用配置，是2台服务器。

- shard和replica的解释
![](https://img-blog.csdnimg.cn/20191117222016634.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
## 类型 Type（表逻辑类型）ES 7.x中已废除
每个index都可有一或多个type，type是index的一个逻辑数据分类。
一个type下的document，都有相同field。
比如博客系统，有一个索引，可定义用户数据type，博客数据type，评论数据type。

商品index，里面存放了所有的商品数据，商品document
但是商品分很多种类，每个种类的document的field可能不太一样
比如说电器商品，可能还包含一些诸如售后时间范围这样的特殊field；生鲜商品，还包含一些诸如生鲜保质期之类的特殊field

type，日化商品type，电器商品type，生鲜商品type
```sql
日化商品type：product_id，product_name，product_desc，category_id，category_name
电器商品type：product_id，product_name，product_desc，category_id，category_name，service_period
生鲜商品type：product_id，product_name，product_desc，category_id，category_name，eat_period
```

每个type里，包含一堆document
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

# 3 RESTful API（REpresentational State Transfer）
Elasticsearch 集群对外提供RESTful API
- URI 指定资源 , 如 Index、Document等
- Http Method 指明资源操作类型，如GET、POST、 PUT、DELETE 

## 交互方式
- curl 命令行
- Kibana DevTools
![](https://img-blog.csdnimg.cn/20201129010757614.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
