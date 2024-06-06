# 04-Kibana常见RESTful API操作

## 1 document数据格式

### 1.1 面向文档的搜索分析引擎

- 应用系统的数据结构都是面向对象的，复杂的
- 对象数据存储到DB中，只能拆解开来，变为扁平的多张表，每次查询的时候还得还原回对象格式，相当麻烦
- ES面向文档，文档中存储的数据结构，与面向对象的数据结构是一样的，基于这种文档数据结构，es可以提供复杂的索引，全文检索，分析聚合等功能
- es的document用json数据格式来表达

```java
public class Employee {

  private String email;
  private String firstName;
  private String lastName;
  private EmployeeInfo info;
  private Date joinDate;

}

private class EmployeeInfo {
  
  private String bio; // 性格
  private Integer age;
  private String[] interests; // 兴趣爱好

}

EmployeeInfo info = new EmployeeInfo();
info.setBio("curious and modest");
info.setAge(30);
info.setInterests(new String[]{"bike", "climb"});

Employee employee = new Employee();
employee.setEmail("zhangsan@sina.com");
employee.setFirstName("san");
employee.setLastName("zhang");
employee.setInfo(info);
employee.setJoinDate(new Date());
```

### 1.2 employee对象

里面包含了Employee类自己的属性，还有一个EmployeeInfo对象

#### 两张表

将employee对象的数据重新拆开来，变成Employee数据和EmployeeInfo数据

##### employee表

email，first_name，last_name，join_date，4个字段

##### employee_info表

employee_info表：bio，age，interests，3个字段；

还有一个外键字段如employee_id，关联employee表。

即 field name 和 field value

```json
{
    "email": "JavaEdge公众号@javaedge.cn",
    "first_name": "公众号",
    "last_name": "JavaEdge",
    "info": {
        "bio":         "curious and modest",
        "age":         30,
        "interests": [ "bike", "climb" ]
    },
    "join_date": "2019/11/17"
}
```

就明白es的document数据格式和数据库的关系型数据格式的区别

## 2 电商商品管理业务需求

基于ES构建一个后台系统，支持：

- 对商品信息CRUD
- 执行简单的结构化查询
- 可执行简单的全文检索及复杂的phrase（短语）检索
- 全文检索结果，可高亮显示
- 对数据进行简单的聚合分析

## 3 简单的集群管理

### 3.1 集群健康状况

es提供了cat api，可查看es中各种各样的数据

```bash
GET /_cat/health?v
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/02863072b29d332fb668145e65355c39.png)

#### 集群健康状况

#### green

每个索引的primary shard和replica shard都是active态

#### yellow

每个索引的primary shard都是active状态的，但部分replica shard处不可用状态。

我们现在就一个笔记本电脑，就启动了一个es进程，相当于就只有一个node。
现在es中有一个index，就是kibana自己内置建立的index。
由于默认的配置是给每个index分配5个primary shard和5个replica shard，而且primary shard和replica shard不能在同一台机器上（为了容错）。
现在kibana自己建立的index是1个primary shard和1个replica shard。当前就一个node，所以只有1个primary shard被分配了和启动了，但是一个replica shard没有第二台机器去启动。

实验：只要启动第二个es进程，就会在es集群中有2个node，然后那1个replica shard就会自动分配过去，然后cluster status就会变成green状态。

#### red

不是所有索引的primary shard都是active状态的，部分索引有数据丢失了

### 3.2 快速查看集群的索引

GET /_cat/indices?v

![](https://img-blog.csdnimg.cn/20191117232939898.png)
![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/91d58bcd211a955190ff441f385592c2.png)

## 3 Index API 操作

左框内为 **requests**，右框内为 **response**：

### 3.1 创建索引 - PUT

```bash
PUT /索引名
```

PUT /test_index?pretty           对应

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/7d4ff21a90f00cb61bbeb6ad08484838.png)

老版响应：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/7463e242f91dde08c01d81d8c27f9874.png)

创建文档时，若**index**不存在，ES会自动创建对应的**index**和**type**

PUT /index/type/id

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/8f6819be61f07bbaa4c3e1086f539ece.png)

### 查看现有索引

```
GET _cat/indices
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/6e4bedb7640022d0a0290852bf82b088.png)

### 删除索引:DELETE

```bash
DELETE /test_index?pretty
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/cd491626abd442fb61ca1bb2fc7107f1.png)

## 4  Document API 操作

### 4.1 新增文档

创建文档时，若索引不存在，ES会自动创建对应的**index**和**type**。

```bash
PUT /index/type/id
{
  "JSON 数据":"JavaEdge"
}
```

```bash
{
  "_index" : "index",
  "_type" : "type",
  "_id" : "id",
  "_version" : 1, 每次更新文档都会自增，作为 MVCC 乐观锁机制
  "result" : "created",
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 0,
  "_primary_term" : 1
}

```

#### 不指定 id 创建文档 API

```bash
PUT /index/type
{
  "公众号":"JavaEdge"
}
```

```bash
{
  "_index" : "index",
  "_type" : "type",
  "_id" : "uNLtD3YBqIyYzzh7-hHH", # 不指定时，自动生成
  "_version" : 1,
  "result" : "created",
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 1,
  "_primary_term" : 1
}
```

ES 会自动建立index和type，无需提前创建，ES默认会对document每个field都建立倒排索引，让其可被搜索。

#### 批量创建文档 API

ES允许一次创建多个文档，以减少网络传输开销，提升写性能

endpoint为 _bulk：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/7dec7cb6f843b4c6f85e49d8c29c2cbe.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/3230402f0cc5e92303111f05014d6dfd.png)

### 4.2 查询文档

#### 指定要查询的文档 id

```bash
GET /index/type/id
```

```bash
{
  "_index" : "index",
  "_type" : "type",
  "_id" : "id",
  "_version" : 1,
  "_seq_no" : 0,
  "_primary_term" : 1,
  "found" : true,
  "_source" : {
    "JSON 数据" : "JavaEdge"
  }
}
```

#### 查询所有文档

```bash
GET /index/type/_search
{
  "query":{
    "term":{
      "_id":"1"
    }
  }
}
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/493a9737801b93fd915c22996f0f4e79.png)

```bash
GET _search
{
  "query": {
    "match_all": {}
  }
}
```

#### 批量查询文档 API



 ![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/6da4d7ac340ebdc4e4c00a3b773500af.png)

### 4.3 修改商品

```bash
PUT /ecommerce/product/1
{
    "name" : "jiaqiangban gaolujie yagao",
    "desc" :  "gaoxiao meibai",
    "price" :  30,
    "producer" :      "gaolujie producer",
    "tags": [ "meibai", "fangzhu" ]
}

{
  "_index": "ecommerce",
  "_type": "product",
  "_id": "1",
  "_version": 1,
  "result": "created",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "created": true
}

{
  "_index": "ecommerce",
  "_type": "product",
  "_id": "1",
  "_version": 2,
  "result": "updated",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "created": false
}


PUT /ecommerce/product/1
{
    "name" : "jiaqiangban gaolujie yagao"
}
```

替换方式有一个不好，即使必须带上所有的field，才能去进行信息的修改

### 4.4 修改商品

```bash
POST /ecommerce/product/1/_update
{
  "doc": {
    "name": "jiaqiangban gaolujie yagao"
  }
}

{
  "_index": "ecommerce",
  "_type": "product",
  "_id": "1",
  "_version": 8,
  "result": "updated",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  }
}
```