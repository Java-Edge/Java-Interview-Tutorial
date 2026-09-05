# GBrain：为 AI Agent 打造的开源大脑

GBrain 是一个面向 AI Agent 的开源“大脑”，由 Garry Tan 开发。Garry Tan 是 Y Combinator 的总裁兼 CEO。GBrain 于 2026 年 4 月开源。

https://github.com/garrytan/gbrain

GBrain 并不是把 Agent 的知识存储在传统数据库里，而是将知识以 Markdown 文件的形式存储在你自己拥有的 Git 仓库中，然后对这些文件建立索引，以便进行检索。

Garry 将它部署在自己的 OpenClaw 和 Hermes Agent 后面，并据其介绍，目前这个系统已经存储了 **146,646 个页面、24,585 个人物和 5,339 家公司**，同时运行着 **66 个 Cron Job**，能够在夜间自主完成知识丰富和整合。

GBrain 最值得理解的设计选择，是它的**知识图谱（Knowledge Graph）**。

这个知识图谱完全通过简单的模式匹配构建，**零 LLM 调用**，而且根据其 Benchmark，它是 GBrain 检索质量提升的最大因素，甚至超过了大多数系统所依赖的向量搜索。

本文将拆解 GBrain 的工作方式，包括：

- Markdown 作为唯一事实来源
- 无成本自动构建、自动连接的知识图谱
- 构建在其之上的混合检索与答案合成层
- Agent “睡眠”期间自动进行知识整合的 Dream Cycle
- 类似 Mem0 的专用 Memory Layer 应该如何与 GBrain 配合

## 1 Markdown 是唯一事实来源

![](https://p.ipic.vip/oq8j70.png)

GBrain 最核心设计决定：

> **知识存在于普通 Git 仓库中的 Markdown 文件里，这个仓库被称为“Brain Repo”，除此之外没有任何存储是权威来源。**

GBrain 会将这个 Git 仓库同步到 PostgreSQL 中用于检索，而 Git 中的删除操作会在数据库中体现为软删除。

即**数据库中的索引只是下游产物，Markdown 文件才是真正的事实来源。**这种设计获得了一些传统数据库很难自然提供的能力：

- **Memory 可 Diff**：你可以像审查 Pull Request 一样，查看 Agent 学到了什么
- **具备版本控制**：如果 Agent 写入了错误信息，可以直接执行 `git revert`
- **人类可读**：知识以 Markdown 保存，人可以直接阅读和编辑
- **由用户掌控**：数据存在自己的磁盘上，由自己的密钥控制，而不是存放在某个第三方厂商的数据库里

GBrain 有两个存储引擎，它们实现的是同一套接口。默认存储引擎 **PGLite**：

- PostgreSQL 17
- 编译为 WebAssembly
- 进程内运行
- 零配置
- 大约 2 秒即可启动

它适合个人知识库，规模大约可以达到 **50,000 个页面**。

如果需要进一步扩展，可用：**PostgreSQL + pgvector**。可部署在 Supabase 上，也可以自行托管，适用于共享、大规模或者多机器部署。

GBrain 定义了一套契约优先的 `BrainEngine` 接口，大约包含 **47 个操作**，两个存储引擎都实现这套接口。

CLI 和 MCP Server 也是从同一个源定义生成的，因此可以替换底层存储，而无需修改上层逻辑。

## 2 不花钱构建的“自连接”知识图谱

每当一个页面被写入时，`put_page` 操作都会从 Markdown 中提取实体引用。如：

```text
[[wiki/people/bob]]
```

这种 Obsidian 风格的 Wikilink，以及 Typed Link 语法，都会被解析，然后转换成知识图谱中的边。

关键在于：

> **整个过程使用正则表达式和字符串匹配完成，完全不需要调用 LLM。**

这些边具有明确类型，如：

- `attended`
- `works_at`
- `invested_in`
- `founded`
- `advises`
- `mentions`

等等。

这些关系最终会写入 `links` 表，包括：

```text
from_page_id
to_page_id
link_type
context
```

然后通过递归 SQL 遍历知识图谱，并通过：

```text
gbrain graph-query
```

提供多跳查询能力。

![](https://p.ipic.vip/3qe9l0.png)

## 3 知识图谱究竟带来了多少提升？

这正是 GBrain 设计最值得关注的地方。根据 GBrain 自己的 **BrainBench** 评测：

| 检索方式                              | P@5       |
| ------------------------------------- | --------- |
| 完整 GBrain 系统                      | **49.1%** |
| 去掉知识图谱，仅使用向量 + 关键词融合 | **17.8%** |
| 纯向量检索                            | **10.8%** |

同时，Recall@5 达到**97.9%**，也就是说：

**一旦关闭知识图谱，P@5 会从 49.1% 直接下降到 17.8%。**

GBrain 的评测文档对此给出了非常直接的结论：

> **知识图谱层贡献了 31 个百分点的 P@5 提升。**

因此，一个非常反直觉的结论出现了：

> **大家通常认为最昂贵、最核心的 Vector Search，反而贡献最小；而免费的 Regex Knowledge Graph，贡献最大。**

![](https://p.ipic.vip/gryik1.png)

## 4 为啥知识图谱这么重要？

因为个人 Agent 实际遇到的很多问题，本质都是**关系型问题（Relational Query）**。如：

> “我投资的那些公司里，哪些人的工作与 AI Agent 有关？”

这不是一个简单的语义相似度搜索问题。

真正的查询路径可能是：

```text
你
 ↓
投资
 ↓
某家公司
 ↓
公司员工
 ↓
某个人
 ↓
研究 / 提及 AI Agent
```

典型的**多跳关系查询**。向量相似度并不了解这种结构，它只能判断两个文本在语义空间里是否相似。而 Typed Edge 恰恰把这种结构显式表示出来：

```properties
Person
  --works_at-->
Company
  --invested_in-->
You

Person
  --mentions-->
AI Agents
```

所以，知识图谱能直接回答关系型问题，而 Vector Search 对这种结构天然不敏感。

![](https://p.ipic.vip/vv2eet.png)

不过需明确：**“零 LLM 调用”只适用于写入阶段的知识图谱构建。**GBrain 在后续的检索和答案合成阶段仍然需要消耗 Token。

## 5 混合检索与答案合成层

GBrain 暴露了两个主要的检索操作：

### 5.1 gbrain search

返回原始页面，并按相关性排序。底层采用**混合检索（Hybrid Retrieval）**。

首先进行向量搜索：

- HNSW
- Cosine Similarity
- 1,536 维向量
- OpenAI `text-embedding-3-large`
- 原始模型为 3,072 维，通过 Dimensions API 降为 1,536 维

与此同时，还会进行 PostgreSQL tsvector 全文关键词搜索，并通过 pg_trgm 实现模糊标题匹配。

随后用**Reciprocal Rank Fusion（RRF）**对多个检索结果进行融合。

标准公式：

```text
1 / (60 + rank)
```

此外还会加入：

- Source Tier Boost
- Reranker

#### Query Expansion

查询先由 **Claude Haiku** 扩展成多个不同表述。

然后：

1. 每个查询变体分别进行 Embedding
2. 并行执行 Vector Search
3. 并行执行 Keyword Search
4. 使用 RRF 融合
5. 执行四层 Dedup

Dedup 包括：

- 按 Source 去重
- Cosine Similarity > 0.85 去重
- 每种类型最多占 60%
- 每个页面设置最大出现次数

### 5.2 gbrain think：真正的答案层

`gbrain think` 才是 Garry Tan 构建 GBrain 的核心。

它并不是简单返回若干 Chunk，而是：

> **基于检索结果生成一个综合答案，同时明确引用来源页面，并诚实说明当前 Brain 不知道什么。**

最后这一点非常关键。

GBrain 不只是告诉你：“这是答案。”它还会主动暴露自身的知识缺口，如：

- 过时页面
- 缺少引用的结论
- 相互矛盾的信息
- 知识空洞

所以 GBrain 对两个能力做出了清晰区分：

- Search 给你原始页面
- Think 给你综合后的答案，并告诉你它哪里不确定

## 6 Dream Cycle：Agent 睡觉时自动整理知识

一个只在用户主动要求时才写入知识的 Brain，最终一定会逐渐失控。如：

- 同一个人出现多个重复页面
- 原始页面发生变化后，引用逐渐失效
- 不同时间写入的内容出现冲突
- 大量脏数据长期无人处理

GBrain 解决方案：**Dream Cycle**，也就是一个由 Cron 驱动的后台知识整理流程。

在系统空闲时间，自动执行：

- 合并重复人物页面
- 修复引用
- 评估信息重要性
- 查找矛盾
- 为第二天的任务做准备  

> **Agent 白天工作，晚上“睡觉”，而 Brain 在 Agent 睡觉的时候自动整理自己。**

参考部署包含 **20+ 个周期性任务**，而 Garry Tan 自己的生产环境运行着 **66 个 Cron Job**。

> https://github.com/garrytan/gbrain/blob/master/docs/GBRAIN_SKILLPACK.md

## 7 自动发现知识矛盾

GBrain 的矛盾检测并不是一个概念上的功能，而是具体实现的。

```text
gbrain eval suspected-contradictions
```

它会：

1. 抽样检索结果对
2. 根据日期进行预过滤
3. 使用 Query-conditioned LLM Judge
4. 找出 Agent 在不同时间写入的相互冲突的信息
5. 将发现的问题接入每日 Dream Cycle

因此，Brain 不只是积累知识，还会主动维护知识的一致性。

## 8 成本控制：把不需要 LLM 的工作移出去

 v0.14.0 开始，确定性的 Cron 工作，如：

- API Fetch
- Token Refresh
- Scrape & Write

都会作为 **Shell Job** 运行。这些任务完全绕过 LLM Gateway：**每次执行消耗 0 Token。**

据其文档描述，这大约释放了 **60% 的 Gateway Headroom**。思想明确：

> **只有真正需要判断能力的工作，才交给昂贵的模型。**

## 9 整个系统最终形成一个闭环

GBrain 的整体运行机制概括为：

```properties
信号到达
   ↓
Agent 首先查询 Brain
   ↓
获得完整上下文
   ↓
Agent 产生响应
   ↓
结果写回 Brain
   ↓
自动建立知识图谱关系
   ↓
Cron 同步
   ↓
Dream Cycle 夜间整理
   ↓
知识持续更新与清理
   ↓
第二天 Agent 获得更好的上下文
```

因此，Agent 的能力会随着时间不断增强。但这种增强并不是因为**模型变得更强了。**而是因为：

> **Brain 在 Agent 空闲时不断完成知识的积累、连接、清洗和整合。**

## 10 Brain ≠ Memory

GBrain 对 **Brain** 和 **Memory** 做明确区分。

### 10.1 Brain：世界知识

Brain 存储：**关于 Agent 外部世界的事实和实体知识。**如：

- 人
- 公司
- 投资交易
- 会议
- 概念
- 想法

### 10.2 Memory：Agent 的运行状态

Memory 存储的是：**Agent 是如何工作的，而不是世界是什么样的。**如：

- 用户偏好
- 已经做出的决策
- Tool 配置
- Session Continuity
- Agent 的操作状态

因此，GBrain 给出的原则是：

> **世界知识持久化在 Brain 中；运行状态持久化在 Agent Memory 中；Agent 永远不要把信息放错层。**

## 11 为啥必须分层？

核心原因是**持久性（Durability）**。某些平台上的 Agent Memory 在 Agent Reset 后可能无法保留。

因此，任何关键的世界知识都应该放进 GBrain。因为 GBrain 的数据最终是：

```text
Markdown
  ↓
Git
```

只要 Git 仓库还在，这些知识就可以长期保存。

所以 GBrain 并没有试图成为：“记住你的偏好、维持跨 Session 工作状态”的系统。

它定位得更加明确：

> **GBrain 是 Agent 的知识库，而不是 Agent 的工作记忆。**

## 12 Benchmark 的真实含义

BrainBench 是一个真实、可复现的评测，但它同时也是一个**由 GBrain 自己维护的评测**。

测试语料包括：

- 240 个虚构页面
- 80 人
- 80 家公司
- 50 场会议
- 30 个概念

这些数据由 Opus 生成，提交到 Git 仓库，并且可以根据 Seed 重新生成。

测试包含**145 个关系型问题。**Vectorize 对其方法进行了独立审查，并认为其：

- 方法内部一致
- 文档完整
- 可复现

同时也确认：**Typed-Edge Knowledge Graph 带来的检索提升大于单纯的 Hybrid Search。**

### Benchmark 有两个重要限制

第一：这个 Benchmark 只覆盖全部检索类别中的 **2/12**。因此，它并不能代表 GBrain 的完整能力。

第二：**它不能用于不同系统之间的直接横向比较。**因为测试语料本身就是 GBrain 自己构建的。

因此目前并不存在：

```text
GBrain vs Mem0
GBrain vs Zep
GBrain vs Letta
```

这样的公平 Head-to-Head Benchmark。

GBrain 使用的是自己的 Corpus，而非诸如：

- BEAM
- LOCOMO

这样的共享 Benchmark。

另外**146,646 个页面和 66 个 Cron Job 是 Garry Tan 自己披露的生产环境数据，并非经过独立测量的数据。**

## 13 GBrain 的局限

它的优势同时也是它的限制。

### 13.1 文件系统并不是所有人的最佳选择

GBrain 选择：**Files on Disk + Git**，这带来：

- 用户拥有数据
- 可以 Diff
- 可以 Version Control
- 人类可直接编辑

但它并不是唯一方案。

Cloudflare 在 2026 年 4 月推出自己的 Agent Memory 时，明确提出相反设计理念：**更紧密的 Ingestion + Retrieval Pipeline，可能优于直接让 Agent 访问原始文件系统。**

Cloudflare理由：

- 成本
- 性能
- Temporal Logic
- Supersession

### 13.2 免费知识图谱依赖良好的 Link Discipline

GBrain 的 Regex Graph 并不是“魔法”。它依赖 Markdown 中存在正确的：

- Wikilink
- Typed Link

若页面写得随意：

```text
Bob works at Acme.
```

而没有明确的关系结构，那么 Regex 就很难构建出高质量的 Graph Edge。

所以**知识图谱的质量取决于写入数据时的链接规范。**

### 13.3 PGLite 是单写入者模型

PGLite 采用 Single Writer。因此：

```text
MCP Server
      +
Cron
```

同时写入时可能发生 Write Lock 竞争。这也是为什么 GBrain 在规模化部署时转向**完整 PostgreSQL**

## 14 Memory Layer 应该放在哪里？

GBrain 自己其实已经明确指出了这个缺口。它是**Brain，而不是 Memory。**

根据 GBrain 自己的设计文档：Operational State 和 Preference State 应该位于另外一个独立层中。

而这正是 **Mem0** 这种框架解决的问题。因此，两者实际上是互补关系。

## 15 GBrain 与 Memory Layer 的职责划分

### GBrain

负责**Durable World Knowledge**，如：

```text
People
Companies
Deals
Meetings
Concepts
```

这些知识以用户自己拥有的文件形式保存，并通过关系图谱增强检索。

### Memory Layer

负责**Agent Operational Knowledge**，如：

```text
用户喜欢怎样工作
用户曾经纠正过什么
Agent 过去尝试过什么
跨 Session 的连续状态
跨机器的运行上下文
```

这些信息通常不会自然对应到一个具体 Entity Page。

### 两者结合才是更完整的 Agent Context Architecture

Memory Layer 可以通过语义理解进行检索，而不需要依赖人工维护的链接。

同时，它可以：

- 按 Identity Scope 隔离
- 让同一份 Memory 跨 Cursor、Terminal Agent、CLI 使用
- 面向长期运行的 Agent
- 在百万到千万 Token 级别的上下文规模下进行评估

因此可以把二者简单概括成：

- GBrain 负责让你的知识保持“清晰”
- Memory Layer 负责让你的 Agent 保持“连续、一致”

最终，更有意思的 Agent 系统很可能不是二选一：

```properties
                 Agent
                   │
          ┌────────┴────────┐
          ↓                 ↓
      GBrain            Memory Layer
          │                 │
    World Knowledge    Operational State
          │                 │
    People / Company    Preferences
    Deals / Meetings    Decisions
    Concepts / Ideas    Session State
          │                 │
          └────────┬────────┘
                   ↓
             Agent Context
```

**真正成熟的 Agent Harness，很可能会同时运行 Brain + Memory 两套系统。**