# 07-整合进 SpringBoot 项目

## 1 概述

- Elasticsearch
- 倒排索引
- SpringBoot整合版本
- Docker安装配置 HEAD插件
- _mapping 映射
- 文档的CRUD
- match all/term/match
- 复杂多条件数据检索
- ES分词

## 2  ES全文检索概述

### 2.1 现有搜索

- HR搜索简历
- 求职者搜索职位

复杂条件搜索需连接多张表！

### 2.2  分布式搜索引擎

- 搜索引擎
- 分布式存储与搜索

### 2.3 Lucene vs Solr vs ES

- 倒排索引
- Lucene是类库
- Solr基于lucene
- ES基于lucene

## 3 倒排索引

正排索引：

![](https://img-blog.csdnimg.cn/98d01e267e574f68bb88b92bbc44267c.png)

倒排索引：

![](https://img-blog.csdnimg.cn/ddc0808bc5ce49f8b596640d0776858e.png)

倒排索引源于实际应用中需要根据属性值来查记录。这种索引表中的每一项都包括一个属性值和包含该属性值的各个记录地址。由于不是根据记录来确定属性，而是根据属性来确定记录的位置，所以称倒排索引。

### 项目新建

新建 module

![](https://img-blog.csdnimg.cn/d18b28fa524b41a3b6f142eca1488298.png)

完成新模块的初始配置，开始准备测试：

![](https://img-blog.csdnimg.cn/00356a1e5c1c4260a2f91d48a306823f.png)

修改路由：

```yaml
spring:
  redis:
    host: localhost
    port: 6379
    database: 0
    password: 123456
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
    sentinel:
      transport:
        port: 8719
        dashboard: localhost:8080
    gateway:
      discovery:
        locator:
          enabled: true     # 动态路由，从注册中心根据微服务的名字获得目标节点的地址
      routes:       # 路由规则（数组）
        - id: userRoute   # 每一项路由都有一个唯一的id编号，可以自定义
          uri: lb://user-service    # lb=负载均衡，会动态寻址
          # uri: http://192.168.1.111:7001
          predicates:   # 匹配断言，符合条件则放行（可以模糊匹配，或者精确匹配到某个具体的端口和名称）
            - Path=/u/**,/admininfo/**,/userinfo/**
        - id: companyRoute
          uri: lb://company-service
          predicates:
            - Path=/c/**,/company/**,/tradeOrder/**
        - id: authRoute
          uri: lb://auth-service
          predicates:
            - Path=/a/**,/passport/**,/saas/**,/admin/**
        - id: resourceRoute
          uri: lb://resource-service
          predicates:
            - Path=/industry/**,/dataDict/**,/jobType/**,/sys/**
        - id: workRoute
          uri: lb://work-service
          predicates:
            - Path=/w/**,/resume/**,/job/**,/counts/**,/report/**
        - id: fileRoute
          uri: lb://file-service
          predicates:
            - Path=/file/**,/static/**
        - id: esRoute
          uri: lb://es-service
          predicates:
            - Path=/es/**
```

修改排除路径：

```properties
exclude.urls[0]=/passport/getSMSCode
exclude.urls[1]=/passport/login
exclude.urls[2]=/passport/logout
exclude.urls[3]=/saas/getQRToken
exclude.urls[4]=/saas/scanCode
exclude.urls[5]=/saas/codeHasBeenRead
exclude.urls[6]=/saas/goQRLogin
exclude.urls[7]=/saas/checkLogin
exclude.urls[8]=/saas/info
exclude.urls[9]=/saas/logout
exclude.urls[10]=/admin/login
exclude.urls[11]=/admin/logout
exclude.urls[12]=/w/port
exclude.urls[13]=/dataDict/app/getItemsByKeys
exclude.urls[14]=/dataDict/app/getItemsByKeys2
exclude.urls[15]=/company/modify
exclude.urls[16]=/company/fairLock
exclude.urls[17]=/company/readLock
exclude.urls[18]=/company/writeLock
exclude.urls[19]=/company/semaphore/lock
exclude.urls[20]=/company/semaphore/release
exclude.urls[21]=/company/release/car
exclude.urls[22]=/company/doneStep/car
exclude.urls[23]=/resume/refresh
exclude.urls[24]=/tradeOrder/notifyMerchantOrderPaid
exclude.urls[25]=/es/hello
```



## 4 引入依赖



```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-elasticsearch</artifactId>
</dependency>
```

观察依赖：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/500893bd5506c343ea88abe1f0516d7a.png)

现在使用的下面高版本客户端，上面的已过时，所以报错过时：

![](https://img-blog.csdnimg.cn/cc17bd7876324d11ae7aeb7751bd64ad.png)

改成如下：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
  elasticsearch:
    uris: http://localhost:9200
```

API上面的也过时了：

![](https://img-blog.csdnimg.cn/5b1e8c14016f40a88e7a6701e51eb220.png)

## 5 创建、删除 index

```java
package com.javaedge.controller;

import com.javaedge.grace.result.GraceJSONResult;
import com.javaedge.pojo.eo.Stu;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

@RestController
@RequestMapping("es")
public class HelloController {

    @Resource
    private ElasticsearchRestTemplate esTemplate;

    @GetMapping("createIndex")
    public Object createIndex() {
        esTemplate.indexOps(Stu.class).create();
        return GraceJSONResult.ok();
    }

    @GetMapping("deleteIndex")
    public Object deleteIndex() {
        esTemplate.indexOps(Stu.class).delete();
        return GraceJSONResult.ok();
    }
}
```

启动服务并 [执行接口](http://127.0.0.1:2001/es/createIndex)：

![](https://img-blog.csdnimg.cn/05813a550085428795facff5aa47ac6a.png)

查看到该index：

![](https://img-blog.csdnimg.cn/876581e2222246e791495def5610cc52.png)

可见，默认创建了一个主分片、一个副分片。不推荐这么做，因为一开始就限制了主副分片个数。最好自己手动创建指定数量

删除：

![](https://img-blog.csdnimg.cn/545560f61e85401ba9314c307ab43612.png)

数据就没了：

![](https://img-blog.csdnimg.cn/9c6fb404298c4bf7b6bb06bc237043bb.png)

## 6 保存

```java
@GetMapping("save")
public Object save() {
    Stu stu = new Stu();
    stu.setStuId(1L);
    stu.setName("JavaEdge");
    stu.setAge(18);
    stu.setMoney(16.000000F);
    stu.setDescription("欢迎关注【JavaEdge】公众号");

    IndexQuery iq = new IndexQueryBuilder().withObject(stu).build();
    IndexCoordinates ic = IndexCoordinates.of("stu");
    esTemplate.index(iq, ic);
    return GraceJSONResult.ok();
}
```



[执行操作](http://127.0.0.1:2001/es/save)：

![](https://img-blog.csdnimg.cn/46f6d5edcc9e4811b66487cd9f4a234d.png)

查询到：

![](https://img-blog.csdnimg.cn/2972be5f0cdb4742bbb28d2005146e3b.png)

## 7 修改

```java
@GetMapping("update")
public Object update() {

    HashMap<String, Object> map = new HashMap<>();
    map.put("name", "JavaEdge");
    map.put("age", 18);
    map.put("money", 666F);
    map.put("decription", "公众号");
    UpdateQuery uq = UpdateQuery.builder("1")
            .withDocument(Document.from(map))
            .build();
    esTemplate.update(uq, IndexCoordinates.of("stu"));
    return GraceJSONResult.ok();
}
```

执行接口：

![](https://img-blog.csdnimg.cn/e1203c537292472884ded55cbb79d3eb.png)

更新成功：

![](https://img-blog.csdnimg.cn/beed894ff55642089bc81ab0aa0cddb1.png)

## 8 文档数据的查询与删除

```java
@GetMapping("get")
public Object get() {
    /**
     * searchOne
     */
    Criteria criteria = new Criteria().and("stuId").is(1L);
    Query query = new CriteriaQuery(criteria);
    Stu stu = esTemplate.searchOne(query, Stu.class).getContent();

    /**
     * search
     */
    Criteria criteria2 = new Criteria().and("age").is(22)
            .and("money").greaterThan(500);
    Query query2 = new CriteriaQuery(criteria2);
    SearchHits<Stu> searchHits = esTemplate.search(query, Stu.class);
    List<SearchHit<Stu>> hits = searchHits.getSearchHits();
    List<Stu> stuList = new ArrayList<>();
    for (SearchHit<Stu> searchHit: hits) {
        Stu res = searchHit.getContent();
        stuList.add(res);
    }
    return GraceJSONResult.ok(stuList);
}
```

[执行接口](http://127.0.0.1:2001/es/get)：

![](https://img-blog.csdnimg.cn/280c4db9e6ef4a10ab6cf9a1c7fd7e33.png)

## 9 match_all 搜索



```java
@GetMapping("match_all")
public Object matchAll(Integer page, Integer pageSize) {
    if (page < 1) {
        page = 1;
    }
    page--;
    Pageable pageable = PageRequest.of(page, pageSize);

    Query query = new NativeSearchQueryBuilder()
            .withQuery(QueryBuilders.matchAllQuery())
            .withPageable(pageable)
            .build();
    SearchHits<SearchResumesEO> searchHits = esTemplate.search(query, SearchResumesEO.class);
    List<SearchHit<SearchResumesEO>> hits = searchHits.getSearchHits();
    List<SearchResumesEO> list = new ArrayList<>();
    for (SearchHit<SearchResumesEO> searchHit: hits) {
        SearchResumesEO res = searchHit.getContent();
        list.add(res);
    }
    return GraceJSONResult.ok(list);
}
```

[执行接口](http://127.0.0.1:2001/es/match_all?page=1&pageSize=10)：

![](https://img-blog.csdnimg.cn/081f51bc828048f18c430d7a480b93e6.png)

## 10 term与 match 搜索



```java
@GetMapping("term")
public Object matchAll() {
    Query query = new NativeSearchQueryBuilder()
            .withQuery(QueryBuilders.termQuery("sex", 1))
            .build();
    SearchHits<Stu> searchHits = esTemplate.search(query, Stu.class);
    List<SearchHit<Stu>> hits = searchHits.getSearchHits();
    List<Stu> list = new ArrayList<>();
    for (SearchHit<Stu> searchHit : hits) {
        Stu res = searchHit.getContent();
        list.add(res);
    }
    return GraceJSONResult.ok(list);
}
```

[执行接口]()：

![](https://img-blog.csdnimg.cn/55335cda53bd4ff29aeadc842baae2bb.png)