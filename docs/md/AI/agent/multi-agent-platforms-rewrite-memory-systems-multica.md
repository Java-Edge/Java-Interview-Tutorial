# 多智能体平台正在重写记忆系统：从 Multica 说起！

## 0 前言

![](https://pbs.twimg.com/media/HGKeTDnaUAAMz7r?format=jpg&name=medium)

最近，像 Paperclip、Multica 和 Claude Managed Agents “托管智能体”工具，让开发者更轻松把具体任务分配给 Claude、Hermes、OpenClaw 或 Codex 等系统。

[@MulticaAI](https://x.com/@MulticaAI)

## 1 啥是托管智能体？

允许你在同一工作流中运行多个 AI 智能体。你可将：

- 一个任务交给 Claude
- 把下一个交给 Hermes
- 把一个 bug 分配给 Codex
- 把一个执行项交给 OpenClaw

平台会负责分发任务、跟踪状态，并保持各个智能体之间的协同。

于各类 CLI 工具之上的一层抽象。你不再需考虑该打开哪个工具，只需思考哪个智能体适合处理哪项任务。

## 2 使用多智能体系统的体验

之前一直用Claude Cowork，整体不错，但当多个智能体需共享状态时，很快遇到瓶颈，要在不同会话之间复制粘贴上下文。

后来：

- Anthropic 推出 Claude Managed Agents，体验更好，但主要围绕 Claude 生态
- Paperclip，功能很强大，但对我来说偏重——包括组织架构、审批流程、成本控制等，更像是在模拟一个企业系统

而[Multica](https://multica.ai/)是一个开源的托管智能体平台。

Multica 吸引我的：

### 可混用不同智能体

Claude、Codex、Hermes、OpenClaw、Gemini、Pi、Cursor Agent 都可以在同一个面板中协同工作，并共享同一套技能库，实现厂商无关。

Agent's Snapshot：

![](https://pbs.twimg.com/media/HGKRe_SakAApN-j?format=jpg&name=medium)

### 人在回路中（Human-in-the-loop）

智能体会提出修改建议、评论问题、标记阻塞点，而我始终参与决策。这是“人 + AI”的协作，而不是“人操作工具”。

### 界面简洁

UI/UX 很直观，可以轻松创建 issue、智能体并分配不同运行环境。

Multica Issue Board：

![](https://pbs.twimg.com/media/HGKRKKUb0AAQWXu?format=jpg&name=medium)

在深入使用后，我开始研究它的源码，想弄清楚它的记忆模型。结果发现了一个有意思的点：**它完全没有使用向量嵌入。**

## 3 任务中的记忆是如何流动

![](https://p.ipic.vip/ben4ws.png)

把一个 issue 分配给智能体时的流程：

**步骤 1：** 用户创建一个 issue，包含标题、描述及可选的 context_refs（关联其他 issue）

**步骤 2：** 该记录被插入到 issue 表中，并绑定workspace_id

**步骤 3：** issue 被分配给某个智能体或用户

**步骤 4：** 后端构建一个上下文快照：包括 **workspace.context**、当前 issue、相关 issue 以及绑定的技能。然后打包成一个 JSONB 数据块，写入 **agent_task_queue**，状态为 `queued`

**步骤 5：** 后台守护进程通过部分索引（**idx_agent_task_queue_pending**）轮询待处理任务

**步骤 6：** 守护进程获取任务，读取 JSONB 快照，并调用对应的 CLI（如 claude、codex、gemini、hermes、openclaw、cursor 等），同时加载技能文件

**步骤 7：** 智能体执行过程中持续返回更新：既更新原记录，也向 **comment** 和 **activity_log** 表写入数据，并通过 WebSocket 实时推送。这些数据同时作为实时状态和历史记录的统一来源

**步骤 8：** 任务完成后，其结果会转化为新的或更新后的 skill，并在后续类似任务中通过 **agent_skill** 被复用

这种设计让记忆不断累积。最开始技能表是空的，但随着时间推移，智能体可以继承整个团队沉淀下来的经验。

## 4 Multica 中构成智能体记忆的六张表

Multica 的记忆系统由六张表构成：

![](https://p.ipic.vip/0wamxo.png)

全部以 **workspace_id** 为作用域：

1. **workspace.context（TEXT）**：整个工作空间的全局提示，每个智能体都会继承（在迁移 006 中引入）。
2. **issue（含 context_refs 和 acceptance_criteria，JSONB）**：任务单元，包含关联 issue 和完成条件。
3. **agent_task_queue.context（JSONB）**：一次性上下文快照，供守护进程读取，推理过程中无需再访问数据库（在迁移 003 中引入）。
4. **skill + skill_file + agent_skill**：可复用能力，按 workspace 组织，并通过关联表绑定到具体智能体（在迁移 008 中引入）。
5. **comment**：任务执行过程中的线程式工作记忆，每条记录都明确来自人或智能体。
6. **activity_log**：追加式审计日志，记录所有状态变化。

只有六张表，没有向量相似度搜索，也没 embedding 存储。

## 5 智能体如何获取记忆？

每个智能体都绑定一组技能。这些技能不是通过相似度检索，而是通过 agent_skill 显式关联。查询非常简单：

```sql
# 无余弦相似度计算，无 top-K 检索
# 就是普通关联查询
SELECT * FROM skill s
  JOIN agent_skill a_s ON a_s.skill_id = s.id
 WHERE a_s.agent_id = $1
   AND s.workspace_id = $2
```

对于代码智能体，人工筛选的相关性往往优于统计相似度。如数据库迁移任务需要“精确的操作手册”，而不是“看起来最相似的文档”。筛选成本低于检索错误的代价。

> 聊天助手、商品搜索或研究分析，这种方式就未必适用，Multica 也并非为这些场景设计。

## 6 工作空间隔离才是核心

每张表都包含 workspace_id，通过外键约束（ON DELETE CASCADE）关联。所有查询都以此为过滤条件，索引也以此为前缀。

这让系统具备良好的可部署性：若一个团队需要删除，只需执行：

```sql
DELETE FROM workspace WHERE id = $1
```

所有相关数据会自动级联删除。

这种设计如果一开始是基于向量数据库，很难后期补上，往往需要重构。

Multica 从关系型数据库出发，非常合理。这种结构也可以与 AI 智能体的记忆系统结合，进一步提升体验。

## 7 JSONB快照模式

一个非常值得借鉴的设计：**agent_task_queue.context JSONB**。

很多多智能体系统要么在执行过程中频繁查询数据库，要么把所有信息塞进一个超长 prompt。Multica 则采用第三种方式：在任务分发时构建一个定制化快照，然后直接交给智能体执行，推理过程中数据库保持“冷状态”。

## 8 对26年的托管智能体的意义

### 记忆系统有多种实现，取决于场景

Multica 用纯关系型数据库 + JSONB 就获得了 15,400+ 星，说明“须用 embedding”说法不成立（至少在基础设施层面）。不过在下游的上下文理解（如聊天助手）中，embedding 依然重要。

### 可积累的记忆和可检索的记忆同样重要

一个不断增长的技能库，会持续提升系统价值。而聊天记录等数据，则需要额外的记忆层来支持上下文组织。

### 人在回路中，其实是数据结构设计问题

通过 author_type、assignee_type、actor_type 等字段，每一条消息和状态变化都有明确归属。这不是简单的 UI 设计，而是底层机制。

## 9 局限

1. **缺乏模糊检索**：未标记的技能在任务分发时无法被发现。
2. **快照可能过时**：任务执行过程中，智能体无法获取新评论。
3. **技能质量依赖团队习惯**：如果不及时沉淀经验，技能库会退化。
4. **快照体积随技能库增长**：例如 200 个技能就意味着一个很大的上下文块。
5. **缺乏跨工作空间记忆**：团队 A 的经验无法直接帮助团队 B，如果能共享会更理想。

## 10 优化方向

关系型结构本身无问题：工作空间隔离、级联删除、审计日志都很扎实。

但在智能体体验和上下文层面，还有提升空间。

PostgreSQL 很适合作为系统“骨架”（管理技能、任务、状态等），但不一定适合承载智能体的全部上下文。

智能体的上下文不仅仅是技能，还包括历史决策、行为模式、与团队协作的方式，以及逐渐形成的风格。单靠 skill_file 和 agent_skill 还不够。

若能引入一个专门为智能体设计的上下文层，支持模糊检索和语境理解，与现有 schema 协同工作，会更完整。

**可以这样理解：Schema 是骨架，而上下文层是神经系统。**

**下一篇文章，我会把 mem0 接入这个托管智能体体系，来解决这些问题。**