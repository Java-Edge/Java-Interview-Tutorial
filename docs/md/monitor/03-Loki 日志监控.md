# 03-Loki 日志监控

## 1 Loki

### 1.1 简介

功能强大；轻量级，可以在配置更低的设备上部署；完全契合现代化部署方式；

[github](https://github.com/grafana/loki)

Loki是受[Prometheus](https://prometheus.io/)启发的水平可扩展、高可用、多租户日志聚合系统。它的设计非常具有成本效益且易于操作。它不索引日志的内容，而是索引每个日志流的一组标签。

### 1.2 优点

与其他日志聚合系统相比，Loki优势在于：

不对日志进行全文索引。通过存储压缩的非结构化日志和仅索引元数据，Loki 更易操作且运行成本更低。

使用你已经在 Prometheus 中使用的相同标签对日志流进行索引和分组，让你能使用你已在 Prometheus 中使用的相同标签在指标和日志之间无缝切换。

尤其适合存储 [Kubernetes](https://kubernetes.io/) Pod 日志。Pod 标签等元数据会被自动抓取和索引。

在 Grafana 中有本机支持（需要 Grafana v6.0）。

### 1.3 Loki日志栈

- promtail，代理，收集日志并发给Loki

- loki，主服务器，存储日志和处理查询

- Grafana，查询和显示日志

Loki 像 Prometheus，但对于日志：我们更喜欢基于多维标签的索引方法，并想要单二进制、易于os且没有依赖关系的系统。Loki 与 Prometheus 不同在于专注日志而非指标，并通过push而非pull交付日志。

### 1.4 下载及安装

[Github](https://github.com/grafana/loki/releases)：

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/b45fa1ef751e4dd38d0ff33f9918297b.png)

#### ① 解压loki的安装包至指定目录（/data/software/loki/）



```bash
mkdir /data/software/loki/

unzip -q loki-linux-amd64.zip -d /data/software/loki/
```

#### ② 新建或上传loki配置文件到指定目录（/data/software/loki/etc）



```bash
mkdir /data/software/loki/etc

vim /data/software/loki/etc/loki-local-config.yaml
```

##### 配置文件内容

```yaml
# 认证配置
auth_enabled: false

# 端口配置
server:
	# 监听的端口
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s
  max_transfer_retries: 0

schema_config:
  configs:
    - from: 2020-07-29
      store: boltdb
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 168h

# 存储位置配置
storage_config:
	# 流文件存储地址
  boltdb:
  	# 自定义boltdb目录
    directory: /data/software/loki/data/index
	# 索引存储地址
  filesystem:
  	# 自定义filesystem目录
    directory: /data/software/loki/data/chunks

# 采集限制配置
limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h
  # 修改每用户摄入速率限制，即每秒样本量，默认值为4M
  ingestion_rate_mb: 30
  # 修改每用户摄入速率限制，即每秒样本量，默认值为6M
  ingestion_burst_size_mb: 15

# 日志回看配置
chunk_store_config:
	#  max_look_back_period: 0s
	# 回看日志行的最大时间，只适用于即时日志，7天
  max_look_back_period: 168h

# 表的保留期配置
#table_manager:
#  retention_deletes_enabled: false
#  retention_period: 0s

table_manager:
	# 日志保留周期开关，默认false
  retention_deletes_enabled: true
  # 日志保留周期
  retention_period: 168h  
```

### 1.5 启动loki



```bash
[root@service-monitoring etc]# nohup /data/software/loki/loki-linux-amd64 -config.file=/data/software/loki/etc/loki-local-config.yaml &
[1] 10508
[root@service-monitoring etc]# nohup: ignoring input and appending output to ‘nohup.out’
```

### 1.6 验证是否启动成功



```bash
[root@service-monitoring etc]# ps -ef|grep loki
root     10508  9405  0 17:27 pts/4    00:00:00 /data/software/loki/loki-linux-amd64 -config.file=/data/software/loki/etc/loki-local-config.yaml
root     10535  9405  0 17:27 pts/4    00:00:00 grep --color=auto loki
```

## 2 安装promtail

Grafana可以和loki部署在同一台服务器。

而promtail需安装在每台有日志输出文件的应用服务器。

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/4972c3d8be6c4ee6b7937ae8828e6b42.png)

### 2.1 解压安装包至指定目录

```bash
unzip -q promtail-linux-amd64.zip -d /data/software/promtail/
```

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/3e7796311f254d58bd0a870c8fbf049e.png)

### 2.2 新建或上传loki配置文件到指定目录

/data/software/promtail/etc/

```bash
vim /data/software/promtail/etc/promtail-local-config.yaml
```

##### 配置文件内容

```yaml
# 端口配置
server:
  http_listen_port: 9080
  grpc_listen_port: 0

# 记录游标位置
positions:
	# 游标记录上一次同步位置
  filename: /data/software/promtail/tmp/positions.yaml
  # 每10s同步一次
  sync_period: 10s

# Loki服务器地址
clients:
  - url: http://ip:3100/loki/api/v1/push

# 日志文件配置
scrape_configs:
- job_name: monitor-platform-task-test-job-name
  static_configs:
  - targets:
      - localhost
    labels:
      job: monitor-platform-task-test-job
      __path__: /usr/local/javaedge/monitor-platform/task/logs/monitor-platform-task.log
```

### 2.3 启动promtail

```bash
[root@service-monitoring etc]# nohup /data/software/promtail/promtail-linux-amd64 -config.file=/data/software/promtail/etc/promtail-local-config.yaml &
[1] 12772
[root@service-monitoring etc]# nohup: ignoring input and appending output to ‘nohup.out’
```

### 2.4 验证promtail是否启动成功

```bash
[root@service-monitoring etc]# ps -ef|grep promtail
root     12772 12231  0 17:48 pts/1    00:00:00 /data/software/loki/promtail-linux-amd64 -config.file=/data/software/loki/etc/promtail-local-config.yaml
root     12796 12231  0 17:48 pts/1    00:00:00 grep --color=auto promtail
```

### 重启

```bash
# 1 查找正在运行的 Promtail 进程的 PID
[root@javaedge-car-receiver-test etc]# ps aux | grep promtail
root     12711  0.0  0.0 112712   964 pts/0    S+   16:26   0:00 grep --color=auto promtail
root     14423  0.4  0.8 1150788 65720 ?       Sl   Apr02 274:46 /data/software/promtail/promtail-linux-amd64 -config.file=/data/software/promtail/etc/promtail-local-config.yaml
# 这将显示所有包含 promtail 的进程。找到与你之前启动的 Promtail 实例对应的进程，记下其 PID。

# 2 停止正在运行的 Promtail 进程：
[root@javaedge-car-receiver-test etc]# kill PID
# 使用与原始启动命令相同的命令来重新启动 Promtail
[root@javaedge-car-receiver-test etc]# nohup /data/software/promtail/promtail-linux-amd64 -config.file=/data/software/promtail/etc/promtail-local-config.yaml &
[1] 12779
[root@javaedge-car-receiver-test etc]# nohup: ignoring input and appending output to ‘nohup.out’

[root@javaedge-car-receiver-test etc]# ps aux | grep promtail
root     12779 44.7  0.8 1150980 70088 pts/0   Sl   16:28   0:04 /data/software/promtail/promtail-linux-amd64 -config.file=/data/software/promtail/etc/promtail-local-config.yaml
root     12795  0.0  0.0 112712   968 pts/0    S+   16:29   0:00 grep --color=auto promtail
[root@javaedge-car-receiver-test etc]# 
```

## 3 在Grafana中添加Loki数据源

进入Grafana，选择 `Configuration` -> `Data sources` -> `Add data source` 进入选择页面，找到 `Loki`

选择数据源：

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/20211213174852.png)

填写 `loki` 地址：
![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/20211213175012.png)

保存成功之后，切换到 `Explore` 菜单，在顶部选择数据源中就能找到 `Loki` 了，选中它：
![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/20211213175342.png)

## 4 查看日志

进入链接：http://graphna部署ip:3000/explore：点击 `Log browser` 展开面板，在下面可以看见我们在 `promtail` 配置文件中配置的标签在这里面出现了，并且中间有很多日志文件

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/cfa95652ea51429c945f8d63b17fb170.png)

选择日志文件：

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/20211213180234.png)

在右侧随意选择一个标签就可以过滤中间的文件，只显示到对应的服务的日志文件。
选择一个文件，然后可以看到下面有查询语句，这个是 `Loki` 的查询语言，与 `Prometheus` 查询语言 `PromQL` 类似，可实现强大的搜索过滤等查询。

点击下面的 `Show log` 按钮，即可查看该日志文件最新的日志内容：

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/20211213180812.png)

常用功能说明：

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/20211213182332.png)

## 5 日志选择和过滤

### **1 日志选择器**

对于查询表达式的标签部分，将其用大括号括起来 `{}`，然后使用键值语法选择标签。多个标签表达式用逗号分隔。
例如下面这个查询语句表示的就是查询 `job` 标签为 `gps_server` 中的 `/var/log/gps_server/request.log` 文件

```
{filename="/var/log/gps_server/request.log",job="gps_server"}
```

支持以下标签匹配运算符：

- `=` 完全相等。
- `!=` 不相等。
- `=~` 正则表达式匹配。
- `!~` 不进行正则表达式匹配。

### 2 日志过滤器

编写日志流选择器后，可以通过编写搜索表达式来进一步过滤结果。搜索表达式可以是文本或正则表达式。
示例：查询所有请求 `/v1/web/monitor/statistics` 接口的日志

```
{filename="/var/log/gps_server/request.log"}|="/v1/web/monitor/statistics"
```

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/20211213183314.png)

匹配到结果之后还有高亮显示

过滤器可以多个连续使用，例如：在错误中查找关于邮件发送失败的日志

```
{filename="/var/log/gps_server/runtime.log",job="gps_server"}|="ERRO"|="邮件"
```

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/20211213183900.png)

可用的过滤器类型：

- `|=` 行包含字符串。
- `!=` 行不包含字符串。
- `|~` 行匹配正则表达式。
- `!~` 行与正则表达式不匹配。 regex表达式接受RE2语法。默认情况下，匹配项区分大小写，并且可以将regex切换为不区分大小写的前缀(?i)。