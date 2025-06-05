# ES实战从零搭建高性能商品搜索系统

搜索这个特性可以说是无处不在，现在很少有网站或者系统不提供搜索功能了，所以，即使你不是一个专业做搜索的程序员，也难免会遇到一些搜索相关的需求。搜索这个东西，表面上看功能很简单，就是一个搜索框，输入关键字，然后搜出来想要的内容就好了。

## 搜索背后的实现

- 可以非常简单，用一个SQL，LIKE一下就能实现
- 也可很复杂，不说百度谷歌这种专业做搜索的公司，其他非专业做搜索的互联网大厂，搜索团队大多是千人规模，这里面不仅有程序员，还有算法工程师、业务专家等等

区别仅是搜索速度快慢及搜出来的内容好坏。

## 倒排索引（Inverted Index）

数据大多存数据库，用SQL的LIKE也能实现匹配搜出结果，为啥还专门做搜索系统？

### 为啥数据库不适合做搜索？

搜索的核心需求是全文匹配，对此，数据库索引派不上用场，那只能全表扫描。全表扫描慢，还需要在每条记录上做全文匹配，即一个字一个字比对，就更慢。所以，使用数据做搜索，性能差。

ES咋解决搜索问题？假设两个商品：

- 烟台红富士苹果
- 苹果手机iPhone XS Max

| DOCID | SKUID        | 标题                                                         |
| ----- | ------------ | ------------------------------------------------------------ |
| 666   | 100002860826 | 烟台红富士苹果 5kg 一级铂金大果 单果230g以上 新鲜水果        |
| 888   | 100000177760 | 苹果 Apple iPhone XS Max (A2104) 256GB 金色 移动联通电信4G手机 双卡双待 |

DOCID就是唯一标识一条记录的ID，类似数据库主键。为支持快速全文搜索，ES对文本采用倒排索引。ES中这两条商品数据倒排索引：

| TERM   | DOCID   |
| ------ | ------- |
| 烟台   | 666     |
| 红富士 | 666     |
| 苹果   | 666,888 |
| 5kg    | 666     |
| 一级   | 666     |
| 铂金   | 666     |
| 大果   | 666     |
| Apple  | 888     |
| iphone | 888     |
| XS     | 888     |
| Max    | 888     |
| 手机   | 888     |
| ...    | ...     |

倒排索引表，以单词作为索引的K，每个单词的倒排索引的值是一个列表，这个列表的元素就是含有这个单词的商品记录的DOCID。

### 倒排索引构建

往ES写商品记录时，ES先对需搜索的字段（商品标题）进行分词，即把一段连续文本按语义拆成多个单词。然后ES按单词给商品记录做索引，就形成上表的倒排索引。

搜“苹果手机”时，ES对关键字也进行分词，如“苹果手机”分为“苹果”、“手机”。然后，ES在倒排索引搜索输入的每个关键字分词，搜索结果：

| TERM | DOCID   |
| ---- | ------- |
| 苹果 | 666,888 |
| 手机 | 888     |

666、888两条记录都能匹配上搜索的关键词，但888商品比666这商品匹配度更高，因为它两个单词都能匹配上，所以按匹配度把结果做一个排序，最终返回的搜索结果：

- 苹果Apple iPhone XS Max (A2104) 256GB 金色 移动联通电信4G手机双卡双待
- 烟台红富士苹果5kg 一级铂金大果 单果230g以上 新鲜水果

### 为何倒排索引能做到快速搜索

这搜索过程是对上面的倒排索引做二次查找，一次找“苹果”，一次找“手机”。

整个搜索过程，没有做过任何文本模糊匹配。ES的存储引擎存储倒排索引时，肯定不是像我们上面表格中展示那样存成一个二维表，实际上它的物理存储结构和InnoDB索引差不多，都是一颗查找树。

对倒排索引做两次查找，即对树进行二次查找，时间复杂度类似MySQL二次命中索引的查找。这查找速度比用MySQL全表扫描+模糊匹配，快好几个数量级。

## 如何在ES中构建商品的索引?

用ES构建一个商品索引，实现一个商品搜索系统。ES为搜索而生，但本质仍是个存储系统：

| ElasticSearch | RDBMS  |
| ------------- | ------ |
| INDEX         | 表     |
| DOCUMENT      | 行     |
| FIELD         | 列     |
| MAPPING       | 表结构 |

ES数据的逻辑结构类似MongoDB，每条数据称为一个DOCUMENT，简称DOC，是个JSON对象，DOC中的每个JSON字段，在ES中称为FIELD，把一组具有相同字段的DOC存放在一起，存放它们的逻辑容器叫INDEX，这些DOC的JSON结构称为MAPPING。

这里面最不好理解的就是这INDEX，类似MySQL表，而不是通常理解的用于查找数据的索引。

为让ES支持中文分词，需要给ES安装一个中文的分词插件IK Analysis for Elasticsearch，告诉ES怎么对中文文本分词。

直接执行下面的命令自动下载并安装：

```bash
$elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.6.0/elasticsearch-analysis-ik-7.6.0.zip
```

安装完成后，需要重启ES，验证一下是否安装成功：

```json
curl -X POST "localhost:9200/_analyze?pretty" -H 'Content-Type: application/json' -d '{ "analyzer": "ik_smart", "text": "JavaEdge" }'
{
  "tokens" : [
    {
      "token" : "极",
      "start_offset" : 0,
      "end_offset" : 1,
      "type" : "CN_CHAR",
      "position" : 0
    },
    {
      "token" : "客",
      "start_offset" : 1,
      "end_offset" : 2,
      "type" : "CN_CHAR",
      "position" : 1
    },
    {
      "token" : "天地",
      "start_offset" : 2,
      "end_offset" : 4,
      "type" : "CN_WORD",
      "position" : 2
    }
  ]
}
```

这分词器把“极客天地”分成“极”、“客”和“天地”，没认出来“极客”，有改进空间。

为实现商品搜索，需先把商品信息存放到ES。先定义存放在ES中商品的数据结构，即MAPPING：

| Field  | Datatype | 说明     |
| ------ | -------- | -------- |
| sku_id | long     | 商品ID   |
| title  | text     | 商品标题 |

这MAPPING只需两个字段：

- sku_id
- title

用户搜索商品时，在ES中匹配商品标题，返回符合条件商品的sku_ids。ES默认提供标准RESTful接口，直接HTTP访问即可。

使用上面这MAPPING创建INDEX，类似MySQL创建一个表：

```json
// INDEX的名称是“sku”
curl -X PUT "localhost:9200/sku" -H 'Content-Type: application/json' -d '{
        "mappings": {
                "properties": {
                        "sku_id": {
                                "type": "long"
                        },
                  		  // 要在title字段进行全文搜索
                        "title": {
                                "type": "text",
                          			 // 中文分词插件IK
                                "analyzer": "ik_max_word",
                                "search_analyzer": "ik_max_word"
                        }
                }
        }
}'
```

往INDEX写两条商品数据：

```json
curl -X POST "localhost:9200/sku/_doc/" -H 'Content-Type: application/json' -d '{
        "sku_id": 100002860826,
        "title": "烟台红富士苹果 5kg 一级铂金大果 单果230g以上 新鲜水果"
}'

{"_index":"sku","_type":"_doc","_id":"yxQVSHABiy2kuAJG8ilW","_version":1,"result":"created","_shards":{"total":2,"successful":1,"failed":0},"_seq_no":0,"_primary_term":1}


curl -X POST "localhost:9200/sku/_doc/" -H 'Content-Type: application/json' -d '{
        "sku_id": 100000177760,
        "title": "苹果 Apple iPhone XS Max (A2104) 256GB 金色 移动联通电信4G手机 双卡双待"
}'
```

HTTP GET商品搜索：

```bash
curl -X GET 'localhost:9200/sku/_search?pretty' -H 'Content-Type: application/json' -d '{
  "query" : { "match" : { "title" : "苹果手机" }}
}'
{
  "took" : 23,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 2,
      "relation" : "eq"
    },
    "max_score" : 0.8594865,
    "hits" : [
      {
        "_index" : "sku",
        "_type" : "_doc",
        "_id" : "zBQWSHABiy2kuAJGgim1",
        "_score" : 0.8594865,
        "_source" : {
          "sku_id" : 100000177760,
          "title" : "苹果 Apple iPhone XS Max (A2104) 256GB 金色 移动联通电信4G手机 双卡双待"
        }
      },
      {
        "_index" : "sku",
        "_type" : "_doc",
        "_id" : "yxQVSHABiy2kuAJG8ilW",
        "_score" : 0.18577608,
        "_source" : {
          "sku_id" : 100002860826,
          "title" : "烟台红富士苹果 5kg 一级铂金大果 单果230g以上 新鲜水果"
        }
      }
    ]
  }
}
```

请求中的URL:

- “sku”代表要在sku这个INDEX内进行查找
- “_search”是一个关键字，表示要进行搜索
- pretty表示格式化返回的JSON

请求BODY的JSON，query中的match表示要进行全文匹配，匹配的字段就是title，关键字是“苹果手机”。返回结果中匹配到2条商品记录。

## 总结

ES构建商品搜索服务：

- 先安装ES并启动服务
- 创建一个INDEX，定义MAPPING
- 写入数据后，执行查询并返回查询结果

类似数据库先建表、插入数据然后查询。把ES当做一个支持全文搜索的数据库即可。

ES本质是支持全文搜索的分布式内存数据库，适用于构建搜索系统。全文搜索性能最关键是采用倒排索引，一种特别为搜索而设计的索引结构：

- 先对需索引的字段进行分词
- 再以分词为索引组成一个查找树
- 就把一个全文匹配的查找转换成对树的查找

这是倒排索引能够快速进行搜索的根本原因。但倒排索引相比B树索引，写和更新性能较差，只适合全文搜索，不适合更新频繁的交易数据。