# Kubernetes容器日志处理方案

## 0 前言

k8s里面对容器日志的处理都叫cluster-level-logging，即该日志处理系统，与容器、Pod及Node的生命周期完全无关。这种设计当然为保证，无论容器挂、Pod被删，甚至节点宕机，应用日志依然可被正常获取。

对于一个容器，当应用把日志输出到 stdout、stderr后，容器项目默认就会把这些日志输出到宿主机上的JSON文件。你就能kubectl logs看到这些容器的日志。

该机制就是本文要讲解的容器日志收集的基础假设。而若你的应用是把文件输出到其他地方，如容器里的某个件或输出到远程存储，那就属特殊情况。

k8s本身不会为你做容器日志收集，为实现cluster-level-logging，你要在部署集群时，提前规划日志方案。

而 k8s本身推荐：

## 1 三种日志方案

### 1.1 在 Node 上部署 logging agent

将日志文件转发到后端存储里保存。方案架构图：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/b8f898c247155dbe0ca831cb8ec1df77.png)

logging agent ，一般以 DaemonSet 运行在节点，然后将宿主机上的容器日志目录挂载进去，最后由 logging-agent 把日志转发出去。

如可通过 Fluentd 作为宿主机上的 logging-agent，然后把日志转发到远端的 ES 保存供检索。

> 具体操作：[这篇文档](https://k8s.io/docs/user-guide/logging/elasticsearch)。

很多 k8s 部署里，会自动启用 [logrotate](https://linux.die.net/man/8/logrotate)，在日志文件超过10MB 时自动对日志文件rotate。

可见 Node 上部署logging agent最大优点：一个节点只需部署一个 agent，且不会对应用和 Pod 有任何侵入性。所以，该方案最常用。



但不足在于，它要求应用输出的日志，须直接输出到容器的 stdout、stderr 。所以，k8s 容器日志方案第二种，就是对这种特殊情况的处理，即：当容器的日志只能输出到某些文件，可通过一个 sidecar 容器把这些日志文件重新输出到 sidecar 的 stdout、stderr，就能继续使用第一种方案。

方案具体工作原理：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/d985d80a4c0ca56779d1c7f57e04ce1d.png)
比如，现在我的应用 Pod 只有一个容器，它会把日志输出到容器里的/var/log/1.log 和2.log 这两个文件里。这个 Pod 的 YAML 文件如下所示：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: counter
spec:
  containers:
  - name: count
    image: busybox
    args:
    - /bin/sh
    - -c
    - >
      i=0;
      while true;
      do
        echo "$i: $(date)" >> /var/log/1.log;
        echo "$(date) INFO $i" >> /var/log/2.log;
        i=$((i+1));
        sleep 1;
      done
    volumeMounts:
    - name: varlog
      mountPath: /var/log
  volumes:
  - name: varlog
    emptyDir: {}
```

在这种情况下，你用 kubectl logs 命令是看不到应用的任何日志的。而且我们前面讲解的、最常用的方案一，也是没办法使用的。

那么这个时候，我们就可以为这个 Pod 添加两个 sidecar容器，分别将上述两个日志文件里的内容重新以 stdout 和 stderr 的方式输出出来，这个 YAML 文件的写法如下所示：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: counter
spec:
  containers:
  - name: count
    image: busybox
    args:
    - /bin/sh
    - -c
    - >
      i=0;
      while true;
      do
        echo "$i: $(date)" >> /var/log/1.log;
        echo "$(date) INFO $i" >> /var/log/2.log;
        i=$((i+1));
        sleep 1;
      done
    volumeMounts:
    - name: varlog
      mountPath: /var/log
  - name: count-log-1
    image: busybox
    args: [/bin/sh, -c, 'tail -n+1 -f /var/log/1.log']
    volumeMounts:
    - name: varlog
      mountPath: /var/log
  - name: count-log-2
    image: busybox
    args: [/bin/sh, -c, 'tail -n+1 -f /var/log/2.log']
    volumeMounts:
    - name: varlog
      mountPath: /var/log
  volumes:
  - name: varlog
    emptyDir: {}
```

这时候，你就可以通过 kubectl logs 命令查看这两个 sidecar 容器的日志，间接看到应用的日志内容了，如下所示：

```bash
$ kubectl logs counter count-log-1
0: Mon Jan 1 00:00:00 UTC 2001
1: Mon Jan 1 00:00:01 UTC 2001
2: Mon Jan 1 00:00:02 UTC 2001
...
$ kubectl logs counter count-log-2
Mon Jan 1 00:00:00 UTC 2001 INFO 0
Mon Jan 1 00:00:01 UTC 2001 INFO 1
Mon Jan 1 00:00:02 UTC 2001 INFO 2
...
```

由于 sidecar 跟主容器之间是共享 Volume 的，所以这里的 sidecar 方案的额外性能损耗并不高，也就是多占用一点 CPU 和内存罢了。

但需要注意的是，这时候，宿主机上实际上会存在两份相同的日志文件：一份是应用自己写入的；另一份则是 sidecar 的 stdout 和 stderr 对应的 JSON 文件。这对磁盘是很大的浪费。所以说，除非万不得已或者应用容器完全不可能被修改，否则我还是建议你直接使用方案一，或者直接使用下面的第三种方案。

**第三种方案，就是通过一个 sidecar 容器，直接把应用的日志文件发送到远程存储里面去。**也就是相当于把方案一里的 logging agent，放在了应用 Pod 里。这种方案的架构：

![](https://img-blog.csdnimg.cn/6fde1722fa80437aa41d71e3ce51fd6c.png)
这种方案里，你的应用还可直接把日志输出到固定的文件里而不是 stdout，你的 logging-agent 还可以使用 fluentd，后端存储还可是 ElasticSearch。只不过， fluentd 的输入源变成应用的日志文件。一般会把 fluentd 的输入源配置保存在ConfigMap：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
data:
  fluentd.conf: |
    <source>
      type tail
      format none
      path /var/log/1.log
      pos_file /var/log/1.log.pos
      tag count.format1
    </source>
    
    <source>
      type tail
      format none
      path /var/log/2.log
      pos_file /var/log/2.log.pos
      tag count.format2
    </source>
    
    <match **>
      type google_cloud
    </match>
```

然后，我们在应用 Pod 的定义里，就可以声明一个Fluentd容器作为 sidecar，专门负责将应用生成的1.log 和2.log转发到 ElasticSearch 当中。这个配置，如下所示：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: counter
spec:
  containers:
  - name: count
    image: busybox
    args:
    - /bin/sh
    - -c
    - >
      i=0;
      while true;
      do
        echo "$i: $(date)" >> /var/log/1.log;
        echo "$(date) INFO $i" >> /var/log/2.log;
        i=$((i+1));
        sleep 1;
      done
    volumeMounts:
    - name: varlog
      mountPath: /var/log
  - name: count-agent
    image: k8s.gcr.io/fluentd-gcp:1.30
    env:
    - name: FLUENTD_ARGS
      value: -c /etc/fluentd-config/fluentd.conf
    volumeMounts:
    - name: varlog
      mountPath: /var/log
    - name: config-volume
      mountPath: /etc/fluentd-config
  volumes:
  - name: varlog
    emptyDir: {}
  - name: config-volume
    configMap:
      name: fluentd-config
```

可以看到，这个 Fluentd 容器使用的输入源，就是通过引用我们前面编写的 ConfigMap来指定的。这里我用到了 Projected Volume 来把 ConfigMap 挂载到 Pod 里。回顾15文《 深入解析Pod对象（二）：使用进阶》。

这方案虽部署简单，且对宿主机非常友好，但这 sidecar 容器很可能会消耗较多的资源，甚至拖垮应用容器。并且，由于日志还是没有输出到 stdout上，所以你通过 kubectl logs 是看不到任何日志输出的。

## 总结

k8s 项目对容器应用日志的收集方式。综合对比以上三种方案，建议你将应用日志输出到 stdout 和 stderr，然后通过在宿主机上部署 logging-agent 的方式来集中处理日志。

这方案管理简单，kubectl logs 也可用，可靠性高，且宿主机本身很可能就自带 rsyslogd 等非常成熟的日志收集组件来供使用。

还有一种方式就是在编写应用时，就直接指定好日志的存储后端：

![](https://img-blog.csdnimg.cn/b3c935fd405b4afbbc63c54e230cef85.png)
这种方案下，k8s 就完全不必操心容器日志收集，这对于本身已经有完善的日志处理系统的公司很友好。

无论哪种方案，须及时将这些日志文件从宿主机上清理掉或给日志目录专门挂载一些容量巨大的远程盘。一旦主磁盘分区被打满，整个系统就可能会陷入崩溃。

## FAQ

日志量很大时，直接将日志输出到容器 stdout 和 stderr上，有什么隐患？解决办法？

### **日志直接输出到容器 stdout 和 stderr 的隐患**

将大量日志直接输出到容器的 `stdout` 和 `stderr` 是常见的日志处理方式，尤其是在使用容器编排工具（如 Kubernetes）时。但在高日志量场景下，这种方式可能引发以下隐患：  

---

#### **1. 容器日志文件膨胀**  

- **问题**：  
  - 容器运行时（如 Docker）会将 `stdout` 和 `stderr` 的日志保存到宿主机上的日志文件（如 `/var/lib/docker/containers/<container-id>/*.log`）。  
  - 大量日志会导致这些文件快速增长，占用磁盘空间，可能最终耗尽宿主机的存储资源。
- **影响**：  
  - 宿主机磁盘写满后，可能导致其他容器无法正常写日志甚至崩溃。  

#### **2. 日志丢失**  

- **问题**：  
  - 当容器被删除或重启时，其日志可能随之丢失，尤其是没有配置持久化存储时。  
- **影响**：  
  - 关键问题或事件无法追溯，增加排查难度。  

#### **3. 性能问题**  

- **问题**：  
  - 高并发日志写入会增加容器 I/O 和 CPU 开销，尤其是使用同步写入的日志库时，可能导致应用性能下降。  
- **影响**：  
  - 应用延迟增加，吞吐量下降。  

#### **4. 不便于集中管理和分析**  

- **问题**：  
  - 容器内的 `stdout` 和 `stderr` 日志分散在宿主机本地，不易直接检索或分析。  
- **影响**：  
  - 无法快速定位问题，难以实现实时监控和数据聚合。  

---

### **解决方案**

针对上述隐患，可以从日志的 **存储方式**、**处理流程** 和 **工具选型** 入手优化。

#### **1. 配置日志轮转（Log Rotation）**  

- **方法**：  

  - 配置 Docker 或容器运行时的日志驱动，启用日志轮转功能，限制日志文件大小和数量。  

  - 示例（Docker `daemon.json` 配置）：  

    ```json
    {
      "log-driver": "json-file",
      "log-opts": {
        "max-size": "100m",
        "max-file": "3"
      }
    }
    ```

- **优点**：  

  - 防止日志文件无限增长，保护宿主机存储空间。  

#### **2. 使用日志收集与持久化工具**  

- **方法**：  

  - 利用日志收集工具（如 Fluentd、Logstash、Filebeat），将容器的日志从 `stdout` 和 `stderr` 收集到集中式日志系统中（如 Elasticsearch、Splunk、Graylog）。  

  - 示例：  

    - **Fluentd 配置**：收集 Docker 容器日志到 Elasticsearch。  

      ```yaml
      <source>
        @type tail
        path /var/lib/docker/containers/*/*.log
        pos_file /var/log/td-agent/docker-containers.log.pos
        tag docker.*
        format json
      </source>
      <match docker.*>
        @type elasticsearch
        host elasticsearch.local
        port 9200
      </match>
      ```

- **优点**：  

  - 日志可集中管理、持久化存储，便于分析和监控。  
  - 支持高级功能如全文搜索和指标生成。  

#### **3. 使用异步日志库**  

- **方法**：  
  - 在应用中使用异步日志框架（如 Logback AsyncAppender 或 SLF4J 异步日志实现），降低高并发日志写入的性能开销。  
- **优点**：  
  - 提升日志写入性能，减少对主线程的影响。  

#### **4. 优化日志内容**  

- **方法**：  
  - 控制日志级别：仅输出必要的日志（如 `INFO`、`ERROR`），避免过多的 `DEBUG` 信息。  
  - 合理归档：将历史日志归档到冷存储，避免占用热存储资源。  
- **优点**：  
  - 减少日志体积，优化资源使用。  

#### **5. 使用容器运行时支持的日志驱动**  

- **方法**：  

  - 配置 Docker 或 Kubernetes 使用远程日志驱动（如 `syslog`、`fluentd`、`awslogs`），将日志直接推送到外部存储系统，而不落地到宿主机。  

  - 示例（Docker `daemon.json` 配置）：  

    ```json
    {
      "log-driver": "fluentd",
      "log-opts": {
        "fluentd-address": "localhost:24224"
      }
    }
    ```

- **优点**：  

  - 减轻宿主机的存储压力，提升日志管理能力。  

---

### **推荐实践**

1. **短期解决**：启用日志轮转，限制日志文件大小和数量，避免存储膨胀。  
2. **长期解决**：  
   - 集成日志收集和分析工具，将日志集中存储和管理。  
   - 根据系统负载和日志量，调整日志级别，优化性能和可用性。  
3. **实时监控**：结合工具（如 ELK Stack、Prometheus + Grafana），建立实时告警机制，快速定位和解决问题。  

通过上述方法，可以有效规避将日志直接输出到 `stdout` 和 `stderr` 带来的隐患，同时提升日志的可用性和管理效率。