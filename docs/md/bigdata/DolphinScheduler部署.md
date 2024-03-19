# DolphinScheduler部署

3种方式通过 Docker 完成 DolphinScheduler 的部署

- 快速体验，推荐 standalone-server 镜像
- 较完整服务，推荐 docker-compose 启动服务
- 已有自己数据库或 zk 服务，想沿用这些基础服务，参考沿用已有的 PostgreSQL 和 ZooKeeper 服务完成部署

## 1 前置条件

- [Docker](https://docs.docker.com/engine/install/) ≥1.13.1
- [Docker Compose](https://docs.docker.com/compose/) ≥1.28.0

## 2 启动服务

### 2.1 使用 standalone-server 镜像

使用 standalone-server 镜像启动一个 DolphinScheduler standalone-server 容器应该是最快体验 DolphinScheduler 的方法。通过这个方式 你可以最快速的体验到 DolphinScheduler 的大部分功能，了解主要和概念和内容。

```shell
$ DOLPHINSCHEDULER_VERSION=3.2.0
$ docker run --name dolphinscheduler-standalone-server -p 12345:12345 -p 25333:25333 -d apache/dolphinscheduler-standalone-server:"${DOLPHINSCHEDULER_VERSION}"
```

> 不要将 apache/dolphinscheduler-standalone-server 镜像作为生产镜像，应该仅仅作为快速体验 DolphinScheduler 的功能的途径。 除了因为他将全部服务运行在一个进程中外，还因为其使用内存数据库 H2 储存其元数据，当服务停止时内存数据库中的数据将会被清空。另外 apache/dolphinscheduler-standalone-server 仅包含 DolphinScheduler 核心服务，部分任务组件（如 Spark 和 Flink 等）， 告警组件（如 Telegram 和 Dingtalk 等）需要外部的组件或对应的配置后

### 2.2 使用 docker-compose 启动服务

相比 standalone-server 优点：

- DolphinScheduler 的各个是独立的容器和进程，相互影响降到最小，且能在服务重启时保留元数据（如需挂载到本地路径需指定）
- 更健壮，能保证用户体验更完整 DolphinScheduler 服务。这种方式需要先安装 [docker-compose](https://docs.docker.com/compose/install/)，适用于 Mac，Linux，Windows

确保 docker-compose 顺利安装后，需获取 `docker-compose.yaml` 文件，通过[下载页面](https://dolphinscheduler.apache.org/en-us/download/3.2.0) 下载对应版本源码包可能是最快的方法，当下载完源码后就可以运行命令进行部署了。

```shell
Explain$ DOLPHINSCHEDULER_VERSION=3.2.0
$ tar -zxf apache-dolphinscheduler-"${DOLPHINSCHEDULER_VERSION}"-src.tar.gz
# Mac Linux 用户
$ cd apache-dolphinscheduler-"${DOLPHINSCHEDULER_VERSION}"-src/deploy/docker
# Windows 用户, `cd apache-dolphinscheduler-"${DOLPHINSCHEDULER_VERSION}"-src\deploy\docker`

# 如果需要初始化或者升级数据库结构，需要指定profile为schema
$ docker-compose --profile schema up -d

# 启动dolphinscheduler所有服务，指定profile为all
$ docker-compose --profile all up -d
```

> 安装完成 docker-compose 后需要修改部分配置以便能更好体验 DolphinScheduler 服务，我们推荐配置不少于 4GB 的空闲内存，详见 [How to assign more memory to docker container](https://stackoverflow.com/a/44533437/7152658).
>
> 通过 docker-compose 启动服务时，除了会启动 DolphinScheduler 对应的服务外，还会启动必要依赖服务，如数据库 PostgreSQL 和 服务发现 ZooKeeper

### 2.3 沿用已有的 PostgreSQL 和 ZK 服务

使用 docker-compose 启动服务会新启动数据库，以及 ZooKeeper 服务。如果你已经有在运行中的数据库，或者 ZooKeeper 且不想启动新的服务，可以使用这个方式分别启动 DolphinScheduler 容器。

```shell
Explain$ DOLPHINSCHEDULER_VERSION=3.2.0
# 初始化数据库，其确保数据库 <DATABASE> 已经存在
$ docker run -d --name dolphinscheduler-tools \
    -e DATABASE="postgresql" \
    -e SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/<DATABASE>" \
    -e SPRING_DATASOURCE_USERNAME="<USER>" \
    -e SPRING_DATASOURCE_PASSWORD="<PASSWORD>" \
    -e SPRING_JACKSON_TIME_ZONE="UTC" \
    --net host \
    apache/dolphinscheduler-tools:"${DOLPHINSCHEDULER_VERSION}" tools/bin/upgrade-schema.sh
# 启动 DolphinScheduler 对应的服务
$ docker run -d --name dolphinscheduler-master \
    -e DATABASE="postgresql" \
    -e SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/dolphinscheduler" \
    -e SPRING_DATASOURCE_USERNAME="<USER>" \
    -e SPRING_DATASOURCE_PASSWORD="<PASSWORD>" \
    -e SPRING_JACKSON_TIME_ZONE="UTC" \
    -e REGISTRY_ZOOKEEPER_CONNECT_STRING="localhost:2181" \
    --net host \
    -d apache/dolphinscheduler-master:"${DOLPHINSCHEDULER_VERSION}"
$ docker run -d --name dolphinscheduler-worker \
    -e DATABASE="postgresql" \
    -e SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/dolphinscheduler" \
    -e SPRING_DATASOURCE_USERNAME="<USER>" \
    -e SPRING_DATASOURCE_PASSWORD="<PASSWORD>" \
    -e SPRING_JACKSON_TIME_ZONE="UTC" \
    -e REGISTRY_ZOOKEEPER_CONNECT_STRING="localhost:2181" \
    --net host \
    -d apache/dolphinscheduler-worker:"${DOLPHINSCHEDULER_VERSION}"
$ docker run -d --name dolphinscheduler-api \
    -e DATABASE="postgresql" \
    -e SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/dolphinscheduler" \
    -e SPRING_DATASOURCE_USERNAME="<USER>" \
    -e SPRING_DATASOURCE_PASSWORD="<PASSWORD>" \
    -e SPRING_JACKSON_TIME_ZONE="UTC" \
    -e REGISTRY_ZOOKEEPER_CONNECT_STRING="localhost:2181" \
    --net host \
    -d apache/dolphinscheduler-api:"${DOLPHINSCHEDULER_VERSION}"
$ docker run -d --name dolphinscheduler-alert-server \
    -e DATABASE="postgresql" \
    -e SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/dolphinscheduler" \
    -e SPRING_DATASOURCE_USERNAME="<USER>" \
    -e SPRING_DATASOURCE_PASSWORD="<PASSWORD>" \
    -e SPRING_JACKSON_TIME_ZONE="UTC" \
    -e REGISTRY_ZOOKEEPER_CONNECT_STRING="localhost:2181" \
    --net host \
    -d apache/dolphinscheduler-alert-server:"${DOLPHINSCHEDULER_VERSION}"
```

> 注意：如果你本地还没有对应的数据库和 ZooKeeper 服务，但是想要尝试这个启动方式，可以先安装并启动 [PostgreSQL](https://www.postgresql.org/download/)(8.2.15+) 以及 [ZooKeeper](https://zookeeper.apache.org/releases.html)(3.8.0)

## 3 登录系统

不管你是用那种方式启动的服务，只要服务启动后，你都可以通过 http://localhost:12345/dolphinscheduler/ui 访问 DolphinScheduler。访问上述链接后会跳转到登陆页面，DolphinScheduler 默认的用户和密码分别为 `admin` 和 `dolphinscheduler123`。 想要了解更多操作请参考用户手册[快速上手](https://dolphinscheduler.apache.org/zh-cn/docs/3.2.0/guide/start/quick-start)。

![login](https://dolphinscheduler.apache.org/img/new_ui/dev/quick-start/login.png)

> 注意：如果你使用沿用已有的 PostgreSQL 和 ZooKeeper 服务方式启动服务，且服务分布在多台机器中， 请将上述的地址改成你 API 容器启动的 hostname 或者 IP。

## 4 环境变量

可以通过环境变量来修改 Docker 运行的配置，我们在沿用已有的 PostgreSQL 和 ZooKeeper 服务中就通过环境变量修改了 Docker 的数据库配置和 注册中心配置，关于全部的配置环境可以查看对应组件的 application.yaml 文件了解。

## 5 普通部署说明

### 5.1 软硬件环境要求

#### 操作系统版本要求

| ***\*操作系统\****                 | ***\*版本\**** |
| ---------------------------------- | -------------- |
| ***\*Red Hat Enterprise Linux\**** | 7.0 及以上     |
| ***\*CentOS\****                   | 7.0 及以上     |
| ***\*Oracle Enterprise Linux\****  | 7.0 及以上     |
| ***\*Ubuntu LTS\****               | 16.04 及以上   |

#### 服务器硬件要求



| ***\*CPU\****  | 内存  | ***\*硬盘类型\**** | ***\*网络\**** | ***\*实例数量\**** |
| -------------- | ----- | ------------------ | -------------- | ------------------ |
| ***\*4核+\**** | 8 GB+ | SAS                | 千兆网卡       | 1+                 |

## 6 部署模式

DolphinScheduler支持多种部署模式，包括单机模式（Standalone）、伪集群模式（Pseudo-Cluster）、集群模式（Cluster）等。

### 单机模式

单机模式（standalone）模式下，所有服务均集中于一个StandaloneServer进程中，并且其中内置了注册中心Zookeeper和数据库H2。只需配置JDK环境，就可一键启动DolphinScheduler，快速体验其功能。

### 伪集群模式

伪集群模式（Pseudo-Cluster）是在单台机器部署 DolphinScheduler 各项服务，该模式下master、worker、api server、logger server等服务都只在同一台机器上。Zookeeper和数据库需单独安装并进行相应配置。

### 集群模式

集群模式（Cluster）与伪集群模式的区别就是在多台机器部署 DolphinScheduler各项服务，并且Master、Worker等服务可配置多个。

## 7 集群模式部署

### 集群规划

可配置多个Master及多个Worker。通常配置2~3个Master，若干个Worker。由于集群资源有限，此处配置一个Master，三个Worker，集群规划：

| hadoop102 | master、worker |
| --------- | -------------- |
| hadoop103 | worker         |
| hadoop104 | worker         |

### 前置准备

（1）三台节点均需部署JDK（1.8+），并配置相关环境变量

（2）需部署数据库，支持MySQL（5.7+）或者PostgreSQL（8.2.15+）

（3）需部署Zookeeper（3.4.6+）

（4）三台节点均需安装进程树分析工具psmisc

```bash
[@hadoop102 ~]$ sudo yum install -y psmisc
[@hadoop103 ~]$ sudo yum install -y psmisc
[@hadoop104 ~]$ sudo yum install -y psmisc
```

### 解压DolphinScheduler安装包

（1）上传DolphinScheduler安装包到hadoop102节点的/opt/software目录

（2）解压安装包到当前目录

注：解压目录并非最终的安装目录

[@hadoop102 software]$ tar -zxvf apache-dolphinscheduler-2.0.5-bin 

### 创建元数据库及用户

DolphinScheduler 元数据存储在关系型数据库中，故需创建相应的数据库和用户。

（1）创建数据库

```bash
mysql> CREATE DATABASE dolphinscheduler DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;
```

（2）创建用户

```bash
mysql> CREATE USER 'dolphinscheduler'@'%' IDENTIFIED BY 'dolphinscheduler';
```

若出现以下错误信息，表明新建用户的密码过于简单。

ERROR 1819 (HY000): Your password does not satisfy the current policy requirements

可提高密码复杂度或者执行以下命令降低MySQL密码强度级别。

```bash
mysql> set global validate_password_policy=0;

mysql> set global validate_password_length=4;
```

（3）赋予用户相应权限

```bash
mysql> GRANT ALL PRIVILEGES ON dolphinscheduler.* TO 'dolphinscheduler'@'%';

mysql> flush privileges;
```