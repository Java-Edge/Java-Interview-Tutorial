# 02-MacOS下载安装启动ES和Kibana

## 1 下载

### 1.1  homebrew

```bash
brew install elasticsearch
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/7a1a1243ee86aaf6cbcb3990ff2caadf.png)

### 1.2 docker（当代主流方式）



```bash
javaedge@JavaEdgedeMac-mini ~ % docker pull elasticsearch:7.16.1
7.16.1: Pulling from library/elasticsearch
7b1a6ab2e44d: Pull complete
f85c3fdbf085: Pull complete
0ee9ef16ef16: Pull complete
1b555fc21eda: Pull complete
5195df1d2493: Pull complete
b22dfd95268f: Pull complete
762293acfd23: Pull complete
e7d18a44f390: Pull complete
Digest: sha256:8d5fd89230d7985b106bc0586080647a6650ca0f6dfe6c22541ef149045ad52e
Status: Downloaded newer image for elasticsearch:7.16.1
docker.io/library/elasticsearch:7.16.1
javaedge@JavaEdgedeMac-mini ~ %
```

创建目录：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/50386a8f0ba8a9ec25b8707c4b9bd2b5.png)

到 config 目录下，新增配置文件：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/2d72621a52cc5d4ba213b58b6a1fb501.png)

内容：

````yml
# 设置es可以被远程任何的计算机访问，redis和mysql都是这样的
http.host: 0.0.0.0
````

启动 ES 容器：

```bash
javaedge@JavaEdgedeMac-mini ~ % docker run --name elasticsearch \
-p 9200:9200 -p 9300:9300 \
-e "discovery.type=single-node" \
-e ES_JAVA_OPS="-Xms64m -Xmx128m" \
-v /Users/javaedge/Downloads/soft/es7/config/elasticsearch.yml:/usr/share/elasticsearch.yml \
-v /Users/javaedge/Downloads/soft/es7/data:/usr/share/elasticsearch/data \
-v /Users/javaedge/Downloads/soft/es7/plugins:/usr/share/elasticsearch/plugins \
--restart=always \
-d elasticsearch:7.16.1
6b84b33e4e9c7140d082ae318196e2b71d6602eb1c31909db1f5e8144d96e77d
javaedge@JavaEdgedeMac-mini ~ %
```

9200就是通过 RESTful 请求需要的端口

9300 是 ES 集群内部通信端口

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/94ab29b73f7fb56236d44421018a5343.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/a477026e42137901124057546d5329f3.png)

打开本地浏览器访问：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/aa111420f4b6a6ebbc8d82f33fc13ebe.png)

## 2 启动

es特点之一就是开箱即用，如中小型应用，数据量少，操作不是很复杂，直接启动就可用。

```bash
elasticsearch
```

```bash
elasticsearch --version
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/a90d1be6f2aeef9c7a99c66118011400.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/000cdf7dc0d8c978902f2fedb92e2530.png)

## 3 检查是否启动成功

http://localhost:9200/?pretty

name: node名称
cluster_name: 集群名称（默认的集群名称就是elasticsearch）
version.number: 5.2.0，es版本号

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/0b28b86ef4bffa549419cf3d2afff286.png)

## 5 修改集群名称

elasticsearch.yml

## 6 Kibana

### 6.1 安装Kibana

使用里面的开发界面，去操作elasticsearch，作为我们学习es知识点的一个主要的界面入口

Kibana是ES的一个配套工具，让用户在网页中可以直接与ES进行交互。
安装命令：

```bash
brew install kibana
```

安装完成后直接执行kibana命令启动Kibana启动Kibana

```bash
-> ~ kibana
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/96afd8e11f9582ab5df2e9a6f33c1e2a.png)

### 6.2  进入Kibana界面



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/55de2c6eaa5aa2f3c850a238e6ada636.png)

刚进入，会推荐我们选择安装官方自带的样例数据：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/595c8f3fe61302a8349e616b4f5bd118.png)

切换到 Dev Tools：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/260a1f361e5e2ee1842f14e86063fa0f.png)

## 7 es-head

类似 kibana。

### 7.1 安装

最推荐谷歌插件方式。搜索【Multi Elasticsearch Head】打开插件：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/29f1e205d5080cae73c51fac2f66307f.png)