# 集成 Dify 和 AWS Service 实现更具灵活性的翻译工作流
## 0 前言 

基于Dify现有能力，已能对不少业务场景提供帮助，但对一些特定诉求，还要借助其扩展机制，本文利用翻译场景举例详细说明。

## 1 翻译场景复杂性分析

翻译是从简单到复杂各级都存在的场景，比较简单的翻译可能一句简单 Prompt，但对复杂、效果要求较高翻译场景，可能需要一些复杂 LLM 编排，如吴恩达开源的 Translation Agent 工作。

从效果层面看，有些翻译要求比较高的意译水平，比如广告词的翻译，需要理解原文的深层含义，而非逐字翻译。类似场景实践，采用多轮调用 COT 的技巧，还需不断反思修正，得最优答案。这种场景往往要求灵活 LLM 编排能力。这种场景是 Dify 擅长。

也有另外一些翻译场景，要求非常高的场景化和专业化，比如游戏论坛的评论翻译，需要通过 Prompt 给出目标受众期待的语气和翻译风格，同时还需要专词映射机制，来支持一些专业的游戏词汇（角色/道具/活动）或者黑话。

参考栏中的一文中介绍了专词翻译的方案，其中借助分词器进行专词提取和 KV 数据库存贮映射关系，方案中包含的 DynamoDB & Glue 服务，其服务能力是目前 Dify 所不具备的，单纯依靠 Dify 无法支持这种翻译诉求。

### 方案的问题

它是基于代码实现，未提供友好的界面来调整 Prompt，对于复杂的 LLM 编排仅仅只能通过修改代码实现，没有足够的灵活性去应对各种各样的具体场景，也缺乏通用能力的支持，比如想要实现 stream response 则比较麻烦，而 Dify 的 API 发布能力则可以很轻松的弥补这一点，同时还可以利用 Dify API 监控等一系列通用能力。

为结合两者的优势，本文尝试了对两者进行集成实践。

## 2 Dify与外部工具集成

Dify社区版文档中，目前主要提供 2 种集成：

- HTTP 节点：允许通过 Restful API 与外部接口进行交互。
- 自定义工具：通过自定义工具添加一种新的节点类型，可以编排在工作流中。

AWS的能力从原则上可与 Dify 通过这两种方式进行集成，但依然存在一些

### 2.1 问题

#### 2.1.1 HTTP 方式存在鉴权问题

鉴权步骤较麻烦，且需要用到 AK/SK，可能受安全方面限制。

可通过自定义工具来对接 AWS 的能力，自定义工具本质上是运行在 Dify docker 运行的实例中的，无需 AK/SK 的配置，直接通过实例上 AWS IAM Role 来获得执行权限。

#### 2.1.2 AWS的一些能力

并非直接可访问的 SAAS API 服务，需预先私有化部署，如一直没人用或使用过少，可能存在闲置率率过高问题。其它类似案例设计方案时，主要基于 serverless 服务搭建，大大降低空置问题，其中 Lambda 的接口设计时，也提供多种接口，除了直接翻译，还可以支持获取专词映射和切词结果。

### 2.2 集成过程

#### 2.2.1 部署 Dify

采用社区版 – Docker Compose 方式进行部署。

#### 2.2.2 编辑自定义工具

参考Dify文档定义工具，一个工具一般对应两个文件：

##### ① python 文件

为对接 AWS 服务的连接器，一般利用 boto3 来访问 AWS 服务，Dify 的 Docker 环境中已集成 boto3 的依赖。参考实现：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/02/70978988bea0a796b69ebe11a695c845.png)

##### ② yaml 文件

为该工具的输入输出的界面定义文件，参考代码，注意 name 字段需要和真实文件名保持一致，否则加载时会出现问题。

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/02/e2504b5de83fe524aab040af28ac0999.png)

#### 2.2.3 构建自定义 Docker 镜像

参考下面伪代码：

```bash
# 按照下面步骤把工具对应的代码文件置入指定位置
cp -r ${tool_folder} ~/dify/api/core/tools/provider/builtin/

# 构建新镜像
cd ~/dify/api
sudo docker build -t dify-api:${tag} .

# 指定启动镜像
cd ../dify/docker/
vim docker-compose.yaml
# 修改image
# image: langgenius/dify-api:0.6.11 => image: langgenius/dify-api:${tag}

# 停止docker （也可以只更新修改过镜像的Container）
sudo docker compose down

# 启动docker
sudo docker compose up -d
```

#### 2.2.4 添加自定义工具到工作流

检查自定义工具是否安装成功。

若安装成功，可在 dify 首页的 Tools Tab 中看到新增的工具集：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/02/3c8c664942e76c359bc0fe66fac50e59.png)

工作流编排的时候，右键添加节点，可在 Tools/Built-in 中看到添加的自定义工具：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/02/3d4cbb271630c0a977637503dc924bb7.png)

#### 2.2.5 调试自定义 Tool

当工具没有正确加载不可见时。参考下面伪代码，查看服务的日志，根据日志来修改代码：

```bash
# 查看dify-api所在的container id
sudo docker ps -a

# 查看dify-api 这个container的日志
sudo docker logs <container_id_or_name>
```

## 3 总结

至此，即可基于Dify强大功能，构建高效、智能翻译服务，满足各种复杂可定制化的翻译需求。通过实践此集成：

- 简化开发过程
- 充分发挥Dify在 LLMOps 优势，为用户提供高质量的翻译体验
- 大大扩展了 Dify 的能力边界，让它具备了专词召回的能力
- 对其他复杂AIGC相关场景提供参考

参考：

- https://aws.amazon.com/cn/blogs/china/implementing-llm-translation-with-word-mapping-capabilities-based-on-aws-services/