# Docker安装配置Seata-Server

## 1 部署

官方文档指引

![](https://img-blog.csdnimg.cn/b596d0817d18413da0cc8444d7483c34.png)

### 1.1 client

每个业务数据库都要新建 undo_log 表。

对 springboot 应用，执行 client - MySQL - AT，切tag=1.5.2：

https://github.com/seata/seata/blob/v1.5.2/script/client/at/db/mysql.sql

![](https://img-blog.csdnimg.cn/93eb6d40ecfb4a35a84c175549cf1970.png)

### 1.2 server

新建 seata-for-hire 数据库，执行 server - MySQL：

https://github.com/seata/seata/blob/v1.5.2/script/server/db/mysql.sql

## 2 Docker

 拉取镜像：

```bash
$ docker pull seataio/seata-server:1.5.2
1.5.2: Pulling from seataio/seata-server
e7c96db7181b: Already exists
f910a506b6cb: Already exists
b6abafe80f63: Pull complete
f9a900a85ba4: Pull complete
7d27a398a423: Pull complete
8fdfdcebe751: Pull complete
6df95cee0f43: Pull complete
5b571cda842d: Pull complete
Digest: sha256:90c7bae99eba72cdf42847b4812b2b03ade16eebfa33b87badd22a122542d647
Status: Downloaded newer image for seataio/seata-server:1.5.2
docker.io/seataio/seata-server:1.5.2
```

拷贝命令：

![](https://img-blog.csdnimg.cn/208055ab64e14beeb6d69145563811ff.png)

## 3 启动容器

```bash
$ docker run --name seata-server \
-p 8091:8091 \
-d seataio/seata-server:1.5.2
8a83dd2dec376ad884cb83470e99ede3c91dfecb0d6d5d3f1f5dd747b4965d6c

$ docker ps
CONTAINER ID   IMAGE                        COMMAND                   CREATED          STATUS             PORTS                              NAMES
xx   seataio/seata-server:1.5.2   "xx"   51 seconds ago   Up 48 seconds      7091/tcp, 0.0.0.0:8091->8091/tcp   seata-server
```

## 4 配置

进入容器内部看配置文件：

```bash
$ docker exec -it seata-server sh
/seata-server # ls -l
total 16
drwxr-xr-x    6 root     root          4096 Jan  1  1970 classes
drwxr-xr-x    1 root     root          4096 Jan  1  1970 libs
drwxr-xr-x    6 root     root          4096 Jan  1  1970 resources
drwxr-xr-x    2 root     root          4096 Jun 20 07:07 sessionStore


/seata-server # cd resources/
/seata-server/resources # ls -l
total 44
drwxr-xr-x    3 root     root          4096 Jan  1  1970 META-INF
-rw-r--r--    1 root     root          4471 Jan  1  1970 application.example.yml
-rw-r--r--    1 root     root           960 Jan  1  1970 application.yml
-rw-r--r--    1 root     root          2602 Jan  1  1970 logback-spring.xml
```

application.yml，要挂载它。退出容器，将刚才那个配置文件复制到宿主机：

```bash
$ docker cp seata-server:/seata-server/resources /Users/javaedge/Downloads/soft/seata/
Successfully copied 64.5kB to /Users/javaedge/Downloads/soft/seata/
```

这就复制到我的宿主机了：

![](https://img-blog.csdnimg.cn/8246f276ac384236baa1d4476ac3d9ca.png)

注意 nacos（基于 PC 本地下载的 nacos 源码构建启动的） 的 ip：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/11/5ac9a61011e817858a6a1c7f8f717e62.png)

修改新增这段配置：

```yml
server:
  port: 7091

spring:
  application:
    name: seata-server

logging:
  config: classpath:logback-spring.xml
  file:
    path: ${user.home}/logs/seata
  extend:
    logstash-appender:
      destination: 127.0.0.1:4560
    kafka-appender:
      bootstrap-servers: 127.0.0.1:9092
      topic: logback_to_logstash

console:
  user:
    username: seata
    password: seata

seata:
  config:
    # support: nacos, consul, apollo, zk, etcd3
    type: nacos
    nacos:
      server-addr: 172.17.0.2:8848
      namespace:
      group: SEATA_GROUP
      username: nacos
      password: nacos
  registry:
    # support: nacos, eureka, redis, zk, consul, etcd3, sofa
    type: nacos
    nacos:
      application: seata-server
      server-addr: 172.17.0.2:8848
      group: SEATA_GROUP
      namespace:
      cluster: default
      username: nacos
      password: nacos
  store:
    # support: file 、 db 、 redis
    mode: db
    db:
      datasource: druid
      db-type: mysql
      driver-class-name: com.mysql.jdbc.Driver
      url: jdbc:mysql://127.0.0.1:3306/seata-for-hire?rewriteBatchedStatements=true
      user: root
      password: 123456
      min-conn: 5
      max-conn: 100
      global-table: global_table
      branch-table: branch_table
      lock-table: lock_table
      distributed-lock-table: distributed_lock
      query-limit: 100
      max-wait: 5000
#  server:
#    service-port: 8091 #If not configured, the default is '${server.port} + 1000'
  security:
    secretKey: SeataSecretKey0c382ef121d778043159209298fd40bf3850a017
    tokenValidityInMilliseconds: 1800000
    ignore:
      urls: /,/**/*.css,/**/*.js,/**/*.html,/**/*.map,/**/*.svg,/**/*.png,/**/*.ico,/console-fe/public/**,/api/v1/auth/login
```

####  rewriteBatchedStatements

默认 false。无论 'allowMultiQueries' 设置如何，驱动是否应使用多查询，以及在调用 'executeBatch()' 时，是否应对 INSERT 和 REPLACE 类型的预备语句进行改写，把它们变为多值子句语句？ 

如果使用的是非预处理的简单声明，并且没有对输入数据进行妥善清理，这可能导致 SQL 注入。此外，对预备语句，如在使用 'PreparedStatement.set*Stream()' 时没有指定流长度，驱动将无法确定每批次的最优参数数量，并可能报错说生成的数据包过大。 对于仅包括 INSERT 或 REPLACE 语句的批次重写，'Statement.getGeneratedKeys()' 方法才有效果。 

当同时用 "rewriteBatchedStatements=true"、"INSERT ... ON DUPLICATE KEY UPDATE" 对语句改写时，服务器对批量操作中所有受影响（或已找到）的行只会返回一个统一值，并且无法将之正确映射回最初的语句。此时，如果批量操作的总计数为零，驱动会为每一个批量语句返回 "0"；如果总计数大于零，则返回 'Statement.SUCCESS_NO_INFO'。

| Default Value | false  |
| :------------ | ------ |
| Since Version | 3.1.13 |

外部的配置文件修改完毕后，还要挂载，需要重建容器：

```bash
javaedge@JavaEdgedeMac-mini resources % docker stop seata-server
seata-server

javaedge@JavaEdgedeMac-mini resources % docker rm seata-server
seata-server
```

启动容器：

```bash
javaedge@JavaEdgedeMac-mini resources % docker run --name seata-server \
-p 8091:8091 \
-p 7091:7091 \
-v /Users/javaedge/Downloads/soft/seata/resources://seata-server/resources \
-d seataio/seata-server:1.5.2
455c1a2d108e4e533359bda66b6c7c909366e7536dfe4b5e451e97626743f2e4


javaedge@JavaEdgedeMac-mini resources % docker ps
CONTAINER ID   IMAGE                        COMMAND                   CREATED              STATUS              PORTS                                            NAMES
d2555578d828   seataio/seata-server:1.5.2   "java -Djava.securit…"   About a minute ago   Up About a minute   0.0.0.0:7091->7091/tcp, 0.0.0.0:8091->8091/tcp   seata-server
```

查看容器内日志，启动成功：

![](https://img-blog.csdnimg.cn/6ea1749e644c45fd825a0535f8a712e9.png)

成功注册到 nacos：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/11/da231688fca5aa2a03623f76c829ea4e.png)