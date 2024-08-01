# 短链系统设计（design tiny url）

如脉脉，不会纵容你发太长的网址，会给你转成短链。

## 1 Scenario 场景

根据一个 long url 生成一个short url。

如 http://www.javaedge.com => http://bit.ly/1ULoQB6

根据 short url 还原 long url，并跳转：

![](https://img-blog.csdnimg.cn/f6d7c5eace164968b50deaa18755a8aa.png)



需和面试官确认的问题：

long url和short url必须一一对应吗？

Short url长时间没人用，需要释放吗？

### 1.1 QPS 分析

1. 问日活，如微博100M
2. 推算产生一条 tiny url 的 qps
   1. 假设每个用户平均每天 0.1（发10 条，有一条有链接） 条带 URL 的微博
   2. 平均写 QPS = 100M * 0.1 / 86400 = 100
   3. 峰值写 qps = 100 * 2 = 200
3. 推算点击一条tiny url的 qps
   1. 假设每个用户平均点 1 个tiny url
   2. 平均写 QPS = 100M * 1 / 86400 = 1k
   3. 峰值读 qps = 1k * 2 = 2k
4. deduce 每天产生的新 URL 所占存储
   1. 100M * 0.1 = 10M 条
   2. 每条 URL 长度平均按 100 算，共 1G
   3. 1T 硬盘能用 3 年

由2、3 分析可知，并不需要分布式或者 sharding，支持 2k QPS，一台 SSD MySQL 即可。

## 2 Service 服务 - 逻辑块聚类与接口设计

该系统其实很简单，只需要有一个 service即可：URL Service。由于 tiny url只有一个 UrlService：

- 本身其实就是个小的独立应用
- 也无需关心其他任何业务功能

### 方法设计：

UrlService.encode(long_url)：编码方法

UrlService.decode(long_url)：解码方法

访问端口设计，当前有如下两种常用主流风格：

- GET /<short_url> REST 风格

  Return a http redirect resonse
  ![](https://img-blog.csdnimg.cn/7a8f45bb24844165838f7365a494e61d.png)

- POST /data/shorten（不太推荐，不符合 REST 设计风格，但也有人在用）
  returh a short url
  ![](https://img-blog.csdnimg.cn/9f82dc6d1c0c44228ec6ce070c1a3edf.png)

![](https://img-blog.csdnimg.cn/19558fb66afb473a82017cd5a45a7498.png)
那么，你们公司的短链系统是选择哪种服务设计呢？

## 3  Storage 数据存取（最能体现实践经验）

1. select 选存储结构
2. scheme 细化数据表

### 3.1 SQL V.S NoSQL

需要事务吗？No，nosql+1

需要丰富的 sql query 吗？no，nosql+1

想偷懒吗?tiny url需要写的代码不复杂，nosql+1

qps高吗？2k，不高。sql+1

scalability 要求多高？存储和 qps 都不高，单机都能搞定。sql+1

	- sql 需要自己写代码来 scale
	- nosql，这些都帮你做了

是否需要 sequential ID？取决于你的算法

- sql 提供 auto_increment 的 sequencetial ID，即 1,2,3
- nosql 的 ID 不是 sequential

### 3.2 算法

long ur 转成一个 6 位的 short url。给出一个长网址，返回一个短网址。

实现两个方法：

- `longToShort(url)` 把一个长网址转换成一个以`http://tiny.url/`开头的短网址
- `shortToLong(url)` 把一个短网址转换成一个长网址

标准：

1. 短网址的key的长度应为6 （不算域名和反斜杠）。 可用字符只有 `[a-zA-Z0-9]`. 比如: `abcD9E`
2. 任意两个长的url不会对应成同一个短url，反之亦然。



用两个哈希表：

- 一个是短网址映射到长网址
- 一个是长网址映射到短网址

短网址是固定的格式: "http://tiny.url/" + 6个字符, 字符可任意。

为避免重复, 我们可以按照字典序依次使用, 或者在随机生成的基础上用一个集合来记录是否使用过。

#### 使用哈希函数（不可行）

如取 long url的 MD5 的最后 6 位：

- 快
- 难以设计无哈希冲突的哈希算法

#### 随机生成 shortURL+DB去重

随机取一个 6 位的 shortURL，若没使用过，就绑定到改 long url。

```java
public String long2Short(String url) {
  while(true) {
    String shortURL = randomShortURL();
    if (!databse.filter(shortURL=shortURL).exists()) {
      database.create(shortURL=shortURL, longURL=url);
      return shortURL;
    }
  }
  
}

public class TinyUrl {
    
    public TinyUrl() {
        long2Short = new HashMap<String, String>();
        short2Long = new HashMap<String, String>();
    }

    /**
     * @param url a long url
     * @return a short url starts with http://tiny.url/
     */
    public String longToShort(String url) {
        if (long2Short.containsKey(url)) {
            return long2Short.get(url);
        }

        while (true) {
            String shortURL = generateShortURL();
            if (!short2Long.containsKey(shortURL)) {
                short2Long.put(shortURL, url);
                long2Short.put(url, shortURL);
                return shortURL;
            }
        }
    }

    /**
     * @param url a short url starts with http://tiny.url/
     * @return a long url
     */
    public String shortToLong(String url) {
        if (!short2Long.containsKey(url)) {
            return null;
        }

        return short2Long.get(url);
    }

    private String generateShortURL() {
        String allowedChars = "0123456789" + "abcdefghijklmnopqrstuvwxyz" + "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        Random rand = new Random();
        String shortURL = "http://tiny.url/";
        for (int i = 0; i < 6; i++) {
            int index = rand.nextInt(62);
            shortURL += allowedChars.charAt(index);
        }

        return shortURL;
    }
}
```

优点：实现简单

缺点：生成短链接的速度，随着短链接越多而越慢

关系型数据库表：只需Short key和 long url两列，并分别建立索引

也可使用 nosql，但需要建立两张表：

- 根据 long 查询 short
  key=longurl 列=shorturl value=null or timestamp
- 根据 short 查询 long
  key=shorturl 列=longurl value=null or timestamp
  ![](https://img-blog.csdnimg.cn/86909cb3afbd434b9c680d58683a2068.png)
  ![](https://img-blog.csdnimg.cn/846199b122a14acebc814c9a1ad4dd7a.png)

#### 进制转换 Base32(微博实现方案)

Base62：

- 将 6 位 short url 看做一个 62 进制数（0-9,a-z,A-Z）
- 每个 short url 对应到一个整数
- 该整数对应 DB 表的主键

6 位可表示的不同 URL：

- 5 位 = 62^5=0.9B= 9亿
- 6 位 = 62^6=57B= 570亿
- 7 位 = 62^7=3.5T= 35000亿

优点：效率高

缺点：强依赖于全局的自增 id

```java
public class TinyUrl {
    public static int GLOBAL_ID = 0;
    private HashMap<Integer, String> id2url = new HashMap<Integer, String>();
    private HashMap<String, Integer> url2id = new HashMap<String, Integer>();

    private String getShortKey(String url) {
        return url.substring("http://tiny.url/".length());
    }

    private int toBase62(char c) {
        if (c >= '0' && c <= '9') {
            return c - '0';
        }
        if (c >= 'a' && c <= 'z') {
            return c - 'a' + 10;
        }
        return c - 'A' + 36;
    }

    private int shortKeytoID(String short_key) {
        int id = 0;
        for (int i = 0; i < short_key.length(); ++i) {
            id = id * 62 + toBase62(short_key.charAt(i));
        }
        return id;
    }

    private String idToShortKey(int id) {
        String chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String short_url = "";
        while (id > 0) {
            short_url = chars.charAt(id % 62) + short_url;
            id = id / 62;
        }
        while (short_url.length() < 6) {
            short_url = "0" + short_url;
        }
        return short_url;
    }

    /**
     * @param url a long url
     * @return a short url starts with http://tiny.url/
     */
    public String longToShort(String url) {
        if (url2id.containsKey(url)) {
            return "http://tiny.url/" + idToShortKey(url2id.get(url));
        }
        GLOBAL_ID++;
        url2id.put(url, GLOBAL_ID);
        id2url.put(GLOBAL_ID, url);
        return "http://tiny.url/" + idToShortKey(GLOBAL_ID);
    }

    /**
     * @param url a short url starts with http://tiny.url/
     * @return a long url
     */
    public String shortToLong(String url) {
        String short_key = getShortKey(url);
        int id = shortKeytoID(short_key);
        return id2url.get(id);
    }
}
```

因为要用到自增 id，所以只能用关系型 DB 表：

id主键、long url（索引）

## 4 Scale

如何提高响应速度，和直接打开原链接一样的效率。

明确，这是个读多写少业务。

### 4.1 缓存提速

Cache Aside。缓存需存储两类数据：

- long2short（生成新 short url 需要）
- short2long（查询 short url 时需要）

![](https://img-blog.csdnimg.cn/8b7949bfa8d44ba3a2353bcf586c8559.png)

### 4.2 CDN

利用地理位置信息提速。

优化服务器访问速度：

- 不同地区，使用不同 web 服务器
- 通过 DNS 解析不同地区用户到不同服务器

优化数据访问速度：

- 使用中心化的MySQL+分布式Redis
- 一个 MySQL 配多个 Redis，Redis 跨地区分布

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/faaf462e00de586fe755c7b9f4b15be0.png)

### 4.3 何时需要多台 DB 服务器

cache 资源不够或命中率低

写操作过多

越来越多请求无法通过 cache 满足

多台DB服务器可以优化什么?

- 解决存不下：存储
- 解决忙不过：qps

那么 tiny url 的主要问题是啥？存储是没问题的，重点是 qps。那么，如何 sharding 呢?

垂直拆分：将多张表分别分配给多台机器。对此不适用，只有两列，无法再拆分。

横向拆分：

若id、shortURL 做分片键：

- long2short 查询时，只能广播给 N 台 db 都去查询
- 为何要查 long2short？避免重复创建呀
- 若不需要避免重复创建，则这样可行

用 long url 做分片键：

short2long 查询时，只能广播给 N 台 DB 查询。

#### 4.3.1 分片键选择

##### 若一个 long 可对应多个 short

- 使用 cache 缓存所有 long2short
- 在为一个 long url 创建 short url 时，若 cache miss，则创建新 short

##### 若一个 long 只能对应一个 short

- 若使用随机生成算法
  - 两张表，一张存储 long2short，一张存储short2long
  - 每个映射关系存两份，则能同时支持 long2short short2long 查询
- 若使用 base62 进制转换法
  - 有个严重问题，多台机器之间如何维护一个全局自增的 id？
  - 一般关系型DB只支持在一台机器上实现这台机器上全局自增的 id

### 4.4 全局自增 id

#### 4.4.1 专用一台 DB 做自增服务

该 DB不存储真实数据，也不负责其他查询。

为避免单点故障，可能需要多台 DB。

#### 4.4.2 使用 zk

但使用全局自增 id 不是解决 tiny url最佳方案。
[Generating a Distributed Sequence Number](http://srinathsview.blogspot.com/2012/04/generating-distributed-sequence-number.html)

### 4.5 基于 base62 的分片策略

Hash(long_url)%62作为分片键

并将 hash(long_url)%62直接放到 short url

若原来的 short key 是 AB1234，则现在的 short key 是

- hash(long_url) % 62 + AB1234
- 若 hash(long_url)%62=0，那就是0AB1234

这样，就能同时通过 short、long 得到分片键。

缺点：DB 的机器数目不能超过 62。

所以，最后最佳架构：

![](https://img-blog.csdnimg.cn/ce1a029a8ef54d958e9aba3587dcad1e.png)

### 4.6 还能优化吗？

web server 和 database 之间的通信。

中心化的服务器集群和跨地域的 web server 之间通信较慢：如中国的 Server 需访问美国的 DB。

为何不让中国的 Server 访问中国的 DB 呢?

若数据重复写到中国 DB，如何解决一致性问题？很难解决！

思考用户的习惯：

- 中国用户访问时，会被 DNS 分配中国的服务器
- 中国用户访问的网站一般都是中国的网站
- 所以可按网站的地域信息来 sharding
  - 如何获得网站的地域信息？只需将用户常访问的网站汇总在一张表。
- 中国用户访问美国网站咋办?
  - 就中国 server 访问美国 db，也不会慢太多
  - 中访中是用户主流，优化系统就是针对主要需求

于是，得到最终架构：

![](https://img-blog.csdnimg.cn/806327409ac14b579221bc8526bc5f7f.png)

还可以维护一份域名白名单，访问对应地域的 DB。

## 5 用户自定义短链接

实现一个顾客短网址，使得顾客能创立他们自己的短网址。即你需要在前文基础上再实现一个 `createCustom`。

需实现三个方法：

- `long2Short(url)` 把一个长网址转换成一个以`http://tiny.url/`开头的短网址
- `short2Long(url)` 把一个短网址转换成一个长网址
- `createCustom(url, key)` 设定一个长网址的短网址为 `http://tiny.url/` + `key`

注意：

1. `long2Short` 生成的短网址的key的长度应该等于6 （不算域名和反斜杠）。 可以使用的字符只有 `[a-zA-Z0-9]`。如: `abcD9E`
2. 任意两个长的url不会对应成同一个短url，反之亦然
3. 如果 `createCustom` 不能完成用户期望的设定, 那么应该返回 `"error"`, 反之如果成功将长网址与短网址对应，应该返回这个短网址

### 5.1 基于 Base62

在URLTable里，直接新增一列custom_url记录对应的custom url是否可行？

不可行！对于大部分数据，该列其实都为空，就会浪费存储空间。

新增一个表，存储自定义 URL：CustomURLTable。

![](https://img-blog.csdnimg.cn/ec296e0c67ec408090ac0adb74e1c0b1.png)

创建自定义短链接：在 CustomURLTable 中查询和插入

根据长链接创建普通短链接：

- 先查询CustomURLTable是否存在
- 再在URLTable查询和插入

同前文一样，用两个哈希表处理长网址和短网址之间的相互映射关系。需额外处理的是用户设定的网址与已有冲突时，需返回 "error"。注意：若用户设定的和已有恰好相同，则同样应该返回短网址。

```java
public class TinyUrl2 {
    private HashMap<String,String> s2l = new HashMap<String,String>();
    private HashMap<String,String> l2s = new HashMap<String,String>();
    private int cnt = 0;
    private final StringBuffer tinyUrl = new StringBuffer("http://tiny.url/");
    private final String charset = "qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM";
    
    private String newShortUrl() {
        StringBuffer res = new StringBuffer();
        for (int i = 0, j = cnt; i < 6; i++, j /= 62)
            res.append(charset.charAt(j % 62));
        cnt++;
        return tinyUrl + res.toString();
    }
    
    /*
     * @param long_url: a long url
     * @param key: a short key
     * @return: a short url starts with http://tiny.url/
     */
    public String createCustom(String long_url, String key) {
        String short_url = tinyUrl + key;
        if (l2s.containsKey(long_url)) {
            if (l2s.get(long_url).equals(short_url))
                return short_url;
            else
                return "error";
        }
        if (s2l.containsKey(short_url))
            return "error";
        l2s.put(long_url, short_url); 
        s2l.put(short_url, long_url);
        return short_url;
    }

    /*
     * @param long_url: a long url
     * @return: a short url starts with http://tiny.url/
     */
    public String longToShort(String long_url) {
        if (l2s.containsKey(long_url))
            return l2s.get(long_url);
        String short_url = newShortUrl(); 
        l2s.put(long_url, short_url); 
        s2l.put(short_url, long_url);
        return short_url; 
    }

    /*
     * @param short_url: a short url starts with http://tiny.url/
     * @return: a long url
     */
    public String shortToLong(String short_url) {
        if (s2l.containsKey(short_url))
            return s2l.get(short_url);
        return "error";
    }
}
```

### 5.2 基于随机生成算法

无需做任何改动，直接把custom url当short url创建即可！

参考

- https://www.zhihu.com/question/29270034