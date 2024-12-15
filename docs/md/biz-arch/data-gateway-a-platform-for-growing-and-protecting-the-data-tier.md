# Netflix数据网关背后的设计奥秘！

Netflix的在线数据存储团队构建了一个名为数据网关（Data Gateway）的平台，使我们的数据存储工程师能够提供强大的数据抽象，保护Netflix应用开发人员免受复杂分布式数据库和不兼容API变更的影响。在这篇开篇帖子中，我们将介绍这个平台，作为系列文章的第一部分，展示我们如何使用这个平台提高应用开发人员每天使用的数据创建、访问和维护的抽象层次。

# 动机

在Netflix，我们采用并为数据层的大量开源（OSS）技术和数据库做出了贡献，包括[Apache Cassandra](https://cassandra.apache.org/)、[EVCache](https://github.com/Netflix/EVCache)（[memcached](https://memcached.org/)）、[OpenSearch](https://opensearch.org/）等。传统上，在线数据平台运营这些数据存储，并通过客户端库提供它们的OSS API。例如，我们运营Apache Cassandra集群，并为开发人员提供基于Thrift或Cassandra查询语言（CQL）协议的客户端库。这种策略使得数据平台能够利用OSS，因为这意味着较少的工程师可以为更多的用户运营更多类型的数据库。然而，虽然这促进了快速扩张，但将应用程序与Netflix不控制的多种API耦合在一起，从长远来看，维护成本显著增加。

大多数数据库都有庞大的API表面积和很少的保护措施，这导致了一些使用上的反模式，需要高级知识来避免，可能需要数年才能被发现。例如，开发人员必须避免将太多数据写入一行或一个字段，而每个数据存储的限制都在变化。随着Netflix工程组织的增长和用例的激增，工程师们在减轻数据库滥用和重新设计应用程序的负担上遇到了更多的问题。这也增加了产品中断的风险，因为大多数关键应用程序都依赖于数据库服务，而数据库迁移本质上是危险的。

此外，某些用例需要结合不同的数据库架构，以实现具有可扩展性、可用性和一致性能的所需API。随着时间的推移，我们发现Netflix的开发人员一次又一次地实现相同的模式——例如，在键值查找中添加缓存——换句话说，就是“重新发明轮子”。

最后，我们必须将Netflix的标准服务发现、远程过程调用弹性技术、认证和授权系统集成到每一个OSS数据库中，以便Netflix应用程序能够使用它们。将每一个单独的数据库和每个数据库协议与这些系统集成是具有挑战性的，因为每个实现都是不同的，必须由不同的专家（例如Memcached专家、Cassandra专家等）维护。

# 介绍数据网关

Netflix的数据网关是一个为解决这些问题而构建的平台，它使得Netflix能够轻松构建和管理稳定的在线数据访问层（DAL）。它通过提供定制的API使用标准的IPC协议，如gRPC和HTTP，简化和保护数据访问，抽象背后的分布式数据库的复杂性，防止它们的使用反模式，同时增强安全性、可靠性和可扩展性。

# 组件概览

数据网关位于应用程序和数据库之间，使Netflix能够提供用户友好、安全和可靠的数据持久性服务。该平台旨在：

**用户友好：**托管数据访问层，为Netflix的常见使用模式提供熟悉的gRPC或HTTP API，例如键值或时间序列。

**安全：**将mTLS、连接管理、认证和授权委托给高性能的服务网格作为通用解决方案。

**可靠：**将OSS数据存储的API表面积减少到只有它们的安全可扩展子集，防止反模式，并提供弹性[技术](https://www.infoq.com/presentations/netflix-stateful-cache/)的间接层，包括断路器、后压和负载卸载。

![img](https://miro.medium.com/v2/resize:fit:875/0*hNeXq0ZpuYlI9YXr)

数据网关实例

如您所见，数据网关的数据平面实例由以下组成：

- **EC2实例：**标准云计算Linux虚拟机，由Netflix性能团队调整为高性能和低延迟。
- **数据网关代理：**边车进程，协调专门构建的容器镜像，并在健康时管理服务注册（即发现）。
- **容器运行时：**标准OCI容器运行时，运行、监控、重启和连接代理和DAL容器。
- **Envoy代理：**行业标准的服务网格容器作为反向代理。
- **数据抽象层（DAL）：**作为容器部署的应用程序代码，托管专门构建的HTTP或gRPC数据访问服务，如键值。
- **声明式配置：**简洁的声明式配置提供目标集群和数据平面实例状态。

应用程序客户端通过标准的Netflix发现服务或AWS负载均衡器（例如ALB/NLB）连接到这些网关。Envoy终止TLS，授权每个连接，然后将请求转发到适当的DAL容器，这些容器使用数据库特定协议与数据库通信以完成每个查询。

# 配置和声明式交付

声明式配置通过数据网关代理在实例上驱动部署，也在整个舰队中驱动。我们将声明式配置分为两类：运行时和部署。

## 运行时配置

单个实例目标状态的配置称为“运行时”配置。此配置包括所需的数据抽象容器的组合、它们的环境和与代理的网络连接，以形成一个数据平面实例。以下是一个运行时配置的示例：

```
# 配置代理以接受协议
proxy_config:
  public_listeners:
    secure_grpc: {mode: grpc, tls_creds: metatron, authz: gandalf, path: 8980}

# 配置实现协议的DAL容器
container_dals:
  cql:
    container_listeners: {secure_grpc: 8980}
    image: "dgw-kv"
  thrift:
    container_listeners: {secure_grpc: 8980}
    image: "dgw-kv"
    env:
      STORAGE_ENGINE: "thrift"

# 配置协议的高级布线
wiring:
  thrift: {mode: shadow, target: cql}
```

这指定了两个名为`cql`和`thrift`的键值DAL容器，从`dgw-kv`镜像的部署特定版本创建，以及一个代理监听主机端口`8980`的外部互TLS（mTLS通过[metatron](https://www.usenix.org/conference/enigma2016/conference-program/presentation/payne)）连接。这个协议被命名为`secure_grpc`，这些连接应该使用mTLS进行身份验证，使用Netflix的Gandalf授权系统进行授权，并将每个请求转发到容器内部监听`secure_grpc`的DAL进程`8980`端口。最后，布线部分指定我们希望`thrift`调用阴影到`cql`容器。这在下面的图表中可视化：

![img](https://miro.medium.com/v2/resize:fit:875/0*1y4WFUGWe-TX-CJj)

## **部署配置（愿望）**

虽然运行时配置限于单个实例，我们还必须配置这些实例的愿望部署。部署愿望声明性地描述了数据网关的部署属性。以下是一个部署配置的示例：

```
deploy_desires:
  # 访问模式和容量是什么
  capacity:
    model_name: org.netflix.key-value
    query_pattern:
      access_pattern: latency
      estimated_read_per_second:  {low: 2000, mid: 20000, high: 200000}
      estimated_write_per_second: {low: 2000, mid: 20000, high: 200000}
    data_shape:
      estimated_state_size_gib:   {low:   20, mid: 200,   high: 2000}
      reserved_instance_app_mem_gib: 20
  # 这个部署对Netflix有多重要
  service_tier: 0
  # 应该部署哪个版本的软件
  version_set:
      artifacts:
        dals/dgw-kv:  {kind: branch, value: main}
        # 运行时配置也是一个容器！
        configs/main: {kind: branch, sha: ${DGW_CONFIG_VERSION}}
  # 我们应该在哪里部署，包括多个集群
  locations:
    - account: prod
      regions: [us-east-2, us-east-1, eu-west-1, us-west-2]
    - account: prod
      regions: [us-east-1]
      stack: leader
  # 谁拥有（负责）这个部署
  owners:
    - {type: google-group, value: our-cool-team@netflix.com}
    - {type: pager, value: our-cool-pagerduty-service}
  # 谁消费（使用）这个部署，以及什么角色？
  consumers:
    - {type: account-app, value: prod-api, group: read-write}
    - {type: account-app, value: studio_prod-ui, group: read-only}
```

这个配置指定了高层次的愿望：[容量](https://github.com/Netflix-Skunkworks/service-capacity-modeling)需求和工作负载上下文，服务重要性，软件组合包括镜像和运行时配置的版本，部署位置包括区域和账户，以及访问控制。服务层是一个简洁的上下文片段，作为0到3+之间的数值提供，指示重要性，并影响车队管理、容量规划和警报。

我们使用部署愿望来为每个分片提供硬件和软件，例如，使用RPS和数据大小的期望容量作为输入到我们的自动化[容量规划器](https://www.youtube.com/watch?v=Lf6B1PxIvAs)，它将这个愿望编译为价格最优的EC2实例选择以及期望的ASG缩放策略。我们还使用部署愿望来通知舰队的持续部署，同时实现更安全的阶段性推出（即，首先部署较不重要的层），工件固定和其他关键功能。

我们称一组集群为“分片”，因为它们为有状态服务提供[故障隔离](https://www.infoq.com/presentations/netflix-stateful-cache/)边界。在Netflix，分片部署或单租户架构对于在线数据服务是首选的，因为它们最小化了行为不当应用程序的影响范围，并保护更广泛的Netflix产品免受嘈杂邻居的影响。到2024年，数据网关平台声明性地管理着数千个分片的舰队，用于数十种不同的数据抽象。

## **数据网关代理协调专门构建的组件**

每个数据网关的核心是我们在Netflix EC2 VM上放置的代理，它从简洁的配置启动，管理所需的容器，并将代理连接起来，最终向用户公开数据抽象的组合。

如果您熟悉docker-compose，数据网关在哲学上是类似的，只是集成了一流的网格[代理](https://www.envoyproxy.io/)和一个持续运行的代理，不断[推动](https://ieeexplore.ieee.org/document/9377621)[[pdf](https://jolynch.github.io/pdf/practical-self-healing-databases.pdf)]实例朝着目标配置和状态。我们集成多个组件以提供网关：

- **可靠的系统组件：**EC2 VM、containerd、数据网关代理、有效压缩的软件镜像。
- **进程间通信：**可插入的注册到服务注册表，mTLS、认证、授权、连接管理以及外部和内部实例网络。
- **监控：**完整的系统健康检查，自动修复死亡或失败的容器。
- **配置和软件：**软件和配置的版本集，以及基于环境的配置。

您可能会问，“为什么不使用Kubernetes”？确实，Kubernetes[ pods](https://kubernetes.io/docs/concepts/workloads/pods/)加上[istio](https://istio.io/)是一个更通用的计算平台，但也是一个复杂的解决方案，用于解决我们的相对简单的问题。在Netflix，计算平台团队有很好的单租户EC2实例部署，并且在此模式下性能隔离和工具非常好。如果我们偏离这条铺好的道路，我们的团队将负责运营Kubernetes和Istio。我们没有兴趣采用和维护这样一个复杂的多租户调度器和容器解决方案来解决我们的相对简单的组件组合问题，这些组件共位于一个主机上。

简单地说，Kubernetes并没有解决我们的许多实际问题，例如允许我们独立于pod启动和停止容器，它更复杂，并为我们的基础设施带来了许多我们不愿意在骨干数据层中的依赖。数据网关平台旨在只有三个外部依赖：一个Linux VM（EC2）、一个健壮的调度器（ASG）和一个blob存储系统（S3）。这种表面积的减少对于一个将为Netflix部署所有基础数据访问层的骨干基础设施组件来说非常有吸引力——由一个小团队维护。

# 案例研究：键值服务

在Netflix，我们将键值服务（KV）作为DAL部署在数据网关平台上。键值是基于数据网关构建的`HashMap[String, SortedMap[Bytes, Bytes]]`映射映射数据模型和查询API，具有每个命名空间的一致性和持久性控制，[抽象](https://www.youtube.com/watch?v=sQ-_jFgOBng&t=880s)了数据存储的细节。键值被Netflix的数百个团队用于为全活跃的全球应用程序提供在线数据持久性。

![img](https://miro.medium.com/v2/resize:fit:875/0*DOPP14gy-M6wijOi)

**键值服务数据网关**

键值DAL运行一个Java Spring Boot应用程序，为键值API暴露gRPC和HTTP接口。这个应用程序组合了各种存储引擎，并在上面实现了诸如对冲、旁路缓存、透明大数据分块、自适应分页、通过资源限制器的断路器等特性。

键值DAL镜像是使用[JIB](https://github.com/GoogleContainerTools/jib)构建的。Netflix的标准应用程序框架是Spring Boot，但数据网关平台与任何OCI兼容的镜像兼容，无论应用程序编程语言或客户端操作系统如何。DAL镜像在CI（持续集成）期间安全地上传到S3工件存储，并进行校验和以检测供应链篡改。

键值使用运行时配置实现环境特定配置。例如：

```
proxy_config:
  public_listeners:
    secure_grpc: {authz: gandalf, mode: grpc, path: "8980", tls_creds: metatron}
    secure_http: {authz: gandalf, mode: http, path: "8443", tls_creds: metatron}

container_dals:
  kv:
    # 可插拔的启动命令
    container_cmd: /apps/dgw-kv/start.sh
    container_listeners: {http: "8080", secure_grpc: "8980", secure_http: "8443"}
    # 配置堆和其他属性
    env:
      MEMORY: 8000m
      spring.app.property: property_value
    # 定义“健康”用于启动检查
    healthcheck:
      test:
        - CMD-SHELL
        - /usr/bin/curl -f -s --connect-timeout 0.500 --max-time 2 http://envoy:8080/admin/health
    image: "dgw-kv"

# 配置Netflix发现目标
registrations:
  - address: shard.dgwkvgrpc,shard.dgwkv
    mode: nflx-discovery
```

代理运行一个名为`kv`的容器，由`container_dals.kv`对象配置，包括镜像名称、环境变量、容器健康检查命令和要公开的容器端口。

代理将为`public_listeners`中的每个条目配置一个Envoy主机侦听器，绑定在所有地址（`0.0.0.0` ipv4或`::` ipv6）。这些侦听器通过名称转发到容器侦听器，例如`secure_grpc`指定从主机端口`::8980`路由到DAL容器端口`8980`。代理确保没有主机端口冲突。代理最后确定使用`registrations`配置在服务发现中注册哪个数据网关分片。

容器级别的运行时配置与应用程序细节（如监听的端口或健康检查端点）无关。它与多种数据网关应用程序兼容，并实现了更便宜的推出，通过将快速变化的配置与应用程序代码库解耦。

# 案例研究：安全RDS

安全RDS使用数据网关平台实现了一个简单的透传架构，以保护到PostgreSQL和MySQL的L4连接。这个架构在Envoy进程中终止mTLS连接，然后将底层L4流代理到后端AWS RDS集群。这通过Netflix的标准mTLS认证和授权系统保护客户端访问，并依赖于后端AWS服务器TLS。

客户端安装一个前向代理边车进程，该进程发现数据网关并在客户端的主机端口`localhost:5432`（PostgreSQL）上侦听。当客户端使用标准RDBMs客户端（如JDBC）连接到前向代理时，前向代理使用客户端应用程序的metatron TLS证书通过mTLS连接到数据网关端口`5432`。在数据网关服务器上，连接针对客户端的身份进行授权。如果允许，客户端应用程序通过L4 mTLS隧道从其出站代理连接，通过数据网关剥离mTLS，然后通过RDS终止连接，使用标准服务器端TLS。

![img](https://miro.medium.com/v2/resize:fit:875/0*ephV9EV7ij-Q-dR0)

安全RDS数据网关

这种架构使我们能够无缝地使用Netflix的认证和授权铺好路径，为*任何*数据库协议提供安全保障，我们已经为AWS RDS、Open Search、CockroachDB、Neptune等使用了它。此外，我们还计划使用这种技术来保护其他现成的数据库，而无需修补这些数据库。它还使用户名/密码认证变得多余，只要数据库集群是单租户的，因为认证由Netflix的Metatron mTLS处理，授权由Netflix的Gandalf系统处理。我们还可以将现有的用户名/密码认证数据库纳入这个平台，通过Netflix的秘密系统安全地加密凭据，使用分片的数据访问控制策略。

安全RDS运行时配置指定没有容器DALs，而是配置反向代理路由到`network_dals.rds.listeners.secure_postgres`下的RDS实例和一个网络DAL目标：

```
proxy_config:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
  public_listeners:                                                                                                                                                                                                                                                                    
    secure_postgres: {mode: tcp, path: "5432", tls_creds: metatron, authz: gandalf} 

# RDS Gateways run no DAL containers
container_dals: {}        
                                                                                                                                                                                                                                                             
network_dals:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
  rds:                                                                                                                                                                                                                                                                                 
    listeners:                                                                                                                                                                                                                                                                         
      secure_postgres: postgresql://rds-db.ih34rtn3tflix.us-east-1.rds.amazonaws.com:5432                                                                                                                                                                                                                                                                                                                                                                                                                                       
    mode: logical_dns 
```

# 案例研究：无缝数据迁移

工程师需要出于各种原因迁移数据存储之间的数据，我们之前已经[介绍](https://www.youtube.com/watch?v=3bjnm1SXLlo&t=122s)过。现代数据存储针对特定的使用模式和数据模型而设计，因此当使用模式发生变化时，数据存储技术也会发生变化。数据库迁移通常是必不可少的，因为安全漏洞、弃用的API、过时的软件或需要增强性能/功能等因素。无论是转移数据以减轻嘈杂邻居问题还是提供新功能，这些迁移在无法进行就地升级时，在维护系统完整性和效率方面发挥着关键作用。为了使这些过程对开发人员无缝，数据网关平台提供了一个流量阴影层，以复制数据并在不同的存储引擎之间性能测试查询负载。有了数据网关，我们可以[管理](https://www.youtube.com/watch?v=3bjnm1SXLlo&t=408s)整个迁移生命周期：

![img](https://miro.medium.com/v2/resize:fit:875/0*QPZjqrdCswU4Wt1o) 

数据网关通过在数据平面实例中部署两个DAL容器来支持流量阴影，一个作为连接到现有数据存储的“主”容器，另一个作为连接到新数据存储的“次”容器。我们配置反向代理将实时流量路由到主容器，并将“阴影”（换句话说，复制）流量路由到次容器。在从主容器到次容器回填数据后，我们然后提升次容器以接收主流量，从而完成数据迁移。以下是一个运行时配置的示例，其中`thrift`作为主DAL，`cql`作为次DAL：

```yaml
proxy_config:
  public_listeners:
    secure_grpc: { mode: grpc, path: 8980 }

container_dals:
  cql:
    container_listeners:
      secure_grpc: 8980
  thrift:
    container_listeners:
      secure_grpc: 8980

wiring:
  thrift: { mode: shadow, target: cql }
```


我们使用这个平台提供的数据迁移能力[迁移](https://youtu.be/3bjnm1SXLlo?t=2078)了数百个已弃用的Apache Cassandra 2数据库到新的主要版本3。由于Cassandra 3对Thrift存储引擎有向后不兼容的更改，因此无法安全地执行就地更新，因此我们必须迁移数百个应用程序和Cassandra集群。我们首先将应用程序从直接Cassandra访问迁移到数据网关代理到他们现有的thrift数据的键值服务，然后通过阴影流量和回填将用户数据从Cassandra 2迁移到Cassandra 3。

使用相同的基础设施组件集中数据迁移是一个重要的杠杆点，因为它使我们这些专家能够自动化这个过程，节省了数千个工程小时，并减少了数据损坏的风险。

# 结论和未来工作

数据网关证明了Netflix对我们在线数据层的技术革新和运营卓越的承诺。它不仅解决了即时的运营挑战，而且为未来的运营数据存储的进步铺平了道路，以满足Netflix不断增长的业务需求，从我们不断增长的SVOD业务到新的业务线，如广告、游戏和直播。

在后续的文章中，我们计划分享更多关于我们如何使用这个平台快速开发、部署和维护为我们的开发人员提供高级数据抽象的细节，例如：

- 在任意L4/L7数据库前统一认证和授权
- gRPC *键值*服务，为我们的开发人员抽象出不断演变的键值存储引擎（Cassandra、EVCache、Netflix构建的其他自定义存储）数千种不同的用例。
- gRPC *时间序列*服务，组合多个存储引擎以实现大规模摄取、保留策略以及搜索和检索。
- gRPC *实体*服务，提供灵活的CRUD+QE（查询和事件）接口，融合CockroachDB、键值、Kafka和Elasticsearch