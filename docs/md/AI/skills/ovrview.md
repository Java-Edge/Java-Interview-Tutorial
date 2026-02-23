# Agent Skills概述

##  0 前言

Agent Skills 是扩展 Claude 功能的模块化能力。每个 Skill 包含指令（instructions）、元数据（metadata）和可选资源（scripts脚本、templates模板），Claude 在相关时会自动使用这些资源。

## 1 为啥用 Skills

Skills 是可重用的、基于文件系统的资源，为 Claude 提供特定领域的专业知识：工作流、上下文和最佳实践，将通用代理转变为专家。与提示不同（提示是对话级别的一次性任务指令），Skills 按需加载，无需在多个对话中重复提供相同的指导。

### 1.1 优势

- **专业化 Claude**：为特定领域的任务定制功能
- **减少重复**：创建一次，自动使用
- **组合功能**：结合 Skills 构建复杂工作流

Agent Skills 的架构和实际应用的深入讨论：[使用 Agent Skills 为真实世界装备代理](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)。

## 2 使用 Skills

Anthropic 为常见文档任务（PPT、Excel、Word、PDF）提供:

- 预构建的 Agent Skills
- 也可创建自定义 Skills

二者工作方式相同。Claude 在与您的请求相关时会自动使用它们。

### 2.1 预构建的 Agent Skills

可供 claude.ai 上的所有用户和通过 Claude API 使用。请参阅下面的[可用 Skills](https://platform.claude.com/docs/zh-CN/agents-and-tools/agent-skills/overview#available-skills) 部分了解完整列表。

### 2.2 自定义 Skills

让您打包领域专业知识和组织知识。它们在 Claude 的所有产品中都可用：在 Claude Code 中创建它们、通过 API 上传它们，或在 claude.ai 设置中添加它们。

### 2.3 开始使用

- 预构建的 Agent Skills：[快速入门教程](https://platform.claude.com/docs/zh-CN/agents-and-tools/agent-skills/quickstart)，开始在 API 中使用 PowerPoint、Excel、Word 和 PDF skills
- 自定义 Skills：[Agent Skills 食谱](https://github.com/anthropics/claude-cookbooks/tree/main/skills)，了解如何创建您自己的 Skills

## 3 Skills 如何工作

Skills 利用 Claude 的虚拟机环境提供超越仅使用提示可能实现的功能。Claude 在具有文件系统访问权限的虚拟机中运行，允许 Skills 作为包含指令、可执行代码和参考资料的目录存在，组织方式就像您为新团队成员创建的入职指南。

这种基于文件系统的架构支持**渐进式披露**：Claude 按需分阶段加载信息，而不是预先消耗上下文。

### 3.1 Skill内容类型及其加载级别

Skills 可包含三种类型的内容，每种在不同时间加载：

#### 1级：元数据（始终加载）

**内容类型：指令**。Skill 的 YAML 前置数据提供发现信息：

```bash
---
name: pdf-processing
description: 从 PDF 文件中提取文本和表格、填充表单、合并文档。在处理 PDF 文件或用户提及 PDF、表单或文档提取时使用。
---
```

Claude 在启动时加载此元数据并将其包含在系统提示中。这种轻量级方法意味着您可以安装许多 Skills 而不会产生上下文成本；Claude 只知道每个 Skill 的存在以及何时使用它。

#### 2级：指令（触发时加载）

**内容类型：指令**。SKILL.md 的主体包含程序知识：工作流、最佳实践和指导：

````bash
# PDF 处理

## 快速入门

使用 pdfplumber 从 PDF 中提取文本：

```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

有关高级表单填充，请参阅 [FORMS.md](FORMS.md)。
````

当您请求与 Skill 描述匹配的内容时，Claude 通过 bash 从文件系统读取 SKILL.md。只有这样，此内容才会进入上下文窗口。

#### 3级：资源和代码（按需加载）

**内容类型：指令、代码和资源**。Skills 可捆绑其他材料：

```bash
pdf-skill/
├── SKILL.md (主要指令)
├── FORMS.md (表单填充指南)
├── REFERENCE.md (详细 API 参考)
└── scripts/
    └── fill_form.py (实用脚本)
```

**指令**：包含专业指导和工作流的其他 markdown 文件（FORMS.md、REFERENCE.md）

**代码**：Claude 通过 bash 运行的可执行脚本（fill_form.py、validate.py）；脚本提供确定性操作而不消耗上下文

**资源**：参考资料，如数据库架构、API 文档、模板或示例

Claude 仅在引用时访问这些文件。文件系统模型意味着每种内容类型都有不同的优势：指令用于灵活指导，代码用于可靠性，资源用于事实查询。

| 级别            | 加载时间       | 令牌成本                 | 内容                                             |
| :-------------- | :------------- | :----------------------- | :----------------------------------------------- |
| **1级：元数据** | 始终（启动时） | 每个 Skill 约 100 个令牌 | YAML 前置数据中的 `name` 和 `description`        |
| **2级：指令**   | 触发 Skill 时  | 不到 5k 个令牌           | 包含指令和指导的 SKILL.md 主体                   |
| **3级+：资源**  | 按需           | 实际上无限制             | 通过 bash 执行的捆绑文件，不将内容加载到上下文中 |

渐进式披露确保任何给定时间只有相关内容占据上下文窗口。

### 3.2 Skills 架构

Skills 在代码执行环境中运行，Claude 具有文件系统访问、bash 命令和代码执行功能。可想象成，Skills 作为虚拟机上的目录存在，Claude 使用与您在计算机上导航文件相同的 bash 命令与它们交互。

#### ① Agent Skills 架构

显示 Skills 如何与代理的配置和虚拟机集成：

![](https://platform.claude.com/docs/images/agent-skills-architecture.png)

#### ② Claude 如何访问 Skill 内容

触发 Skill 时，Claude 用 bash 从文件系统读取 SKILL.md，将其指令带入上下文窗口。

若这些指令引用其他文件（如 FORMS.md 或数据库架构），Claude 也会用其他 bash 命令读取这些文件。当指令提及可执行脚本时，Claude 通过 bash 运行它们并仅接收输出（脚本代码本身永远不会进入上下文）。

#### ③ 此架构支持的功能

**按需文件访问**：Claude 仅读取每个特定任务所需的文件。Skill 可以包含数十个参考文件，但如果您的任务只需要销售架构，Claude 仅加载该文件。其余文件保留在文件系统上，消耗零令牌。

**高效的脚本执行**：当 Claude 运行 `validate_form.py` 时，脚本的代码永远不会加载到上下文窗口中。仅脚本的输出（如"验证通过"或特定错误消息）消耗令牌。这使脚本比让 Claude 即时生成等效代码要高效得多。

**捆绑内容没有实际限制**：因为文件在访问前不消耗上下文，Skills 可包含全面的 API 文档、大型数据集、广泛的示例或任何您需要的参考资料。对于未使用的捆绑内容没有上下文成本。

这种基于文件系统的模型是使渐进式披露工作的原因。Claude 导航您的 Skill 就像您参考入职指南的特定部分一样，访问每个任务所需的确切内容。

### 3.3 示例：加载 PDF 处理 skill

Claude加载和使用 PDF 处理 skill 的方式：

1. **启动**：System prompt包括：`PDF Processing - Extract text and tables from PDF files, fill forms, merge documents`
2. **用户请求**：「从此 PDF 中提取文本并总结」
3. **Claude 调用**：`bash: read pdf-skill/SKILL.md` → 指令加载到上下文中
4. **Claude 确定**：不需要表单填充，因此不读取 FORMS.md
5. **Claude 执行**：使用 SKILL.md 中的指令完成任务

Skills 加载到上下文窗口 - 显示 skill 元数据和内容的渐进式加载：

![](https://platform.claude.com/docs/images/agent-skills-context-window.png)

该图表显示：

1. 预加载系统提示和 skill 元数据的默认状态
2. Claude 通过 bash 读取 SKILL.md 触发 skill
3. Claude 根据需要可选地读取其他捆绑文件，如 FORMS.md
4. Claude 继续执行任务

这种动态加载确保只有相关的 skill 内容占据上下文窗口。

## 4 Skills 工作的地方

Skills 在 Claude 的代理产品中可用：

### 4.1 Claude API

Claude API 支持预构建的 Agent Skills 和自定义 Skills。两者的工作方式相同：在 `container` 参数中指定相关的 `skill_id` 以及代码执行工具。

**前提条件**：通过 API 使用 Skills 需要三个 beta 标头：

- `code-execution-2025-08-25` - Skills 在代码执行容器中运行
- `skills-2025-10-02` - 启用 Skills 功能
- `files-api-2025-04-14` - 上传/下载文件到/从容器所需

通过引用其 `skill_id`（例如 `pptx`、`xlsx`）使用预构建的 Agent Skills，或通过 Skills API（`/v1/skills` 端点）创建和上传您自己的。自定义 Skills 在组织范围内共享。

要了解更多信息，请参阅[使用 Claude API 的 Skills](https://platform.claude.com/docs/zh-CN/build-with-claude/skills-guide)。

### 4.2 Claude Code

[Claude Code](https://code.claude.com/docs/overview) 仅支持自定义 Skills。

**自定义 Skills**：创建包含 SKILL.md 文件的目录形式的 Skills。Claude 自动发现并使用它们。

Claude Code 中的自定义 Skills 基于文件系统，不需要 API 上传。

要了解更多信息，请参阅[在 Claude Code 中使用 Skills](https://code.claude.com/docs/skills)。

### 4.3 Claude Agent SDK

[Claude Agent SDK](https://platform.claude.com/docs/zh-CN/agent-sdk/overview) 通过基于文件系统的配置支持自定义 Skills。

**自定义 Skills**：在 `.claude/skills/` 中创建包含 SKILL.md 文件的目录形式的 Skills。通过在 `allowed_tools` 配置中包含 `"Skill"` 来启用 Skills。

SDK 运行时会自动发现 Skills 中的 Skills。

要了解更多信息，请参阅 [SDK 中的 Agent Skills](https://platform.claude.com/docs/zh-CN/agent-sdk/skills)。

### 4.4 Claude.ai

[Claude.ai](https://claude.ai/) 支持预构建的 Agent Skills 和自定义 Skills。

**预构建的 Agent Skills**：这些 Skills 在您创建文档时已在后台工作。Claude 使用它们而不需要任何设置。

**自定义 Skills**：通过设置 > 功能将您自己的 Skills 作为 zip 文件上传。在启用代码执行的 Pro、Max、Team 和 Enterprise 计划上可用。自定义 Skills 对每个用户是个人的；它们不在组织范围内共享，管理员无法集中管理。

要了解更多关于在 Claude.ai 中使用 Skills 的信息，请参阅 Claude 帮助中心中的以下资源：

- [什么是 Skills？](https://support.claude.com/en/articles/12512176-what-are-skills)
- [在 Claude 中使用 Skills](https://support.claude.com/en/articles/12512180-using-skills-in-claude)
- [如何创建自定义 Skills](https://support.claude.com/en/articles/12512198-creating-custom-skills)
- [使用 Skills 教 Claude 您的工作方式](https://support.claude.com/en/articles/12580051-teach-claude-your-way-of-working-using-skills)

## 5 Skill 结构

每个 Skill 都需要一个带有 YAML 前置数据的 `SKILL.md` 文件：

```bash
---
name: your-skill-name
description: Brief description of what this Skill does and when to use it
---

# Your Skill Name

## Instructions
[Clear, step-by-step guidance for Claude to follow]

## Examples
[Concrete examples of using this Skill]
```

**必需字段**：`name` 和 `description`

**字段要求**：

`name`：

- 最多 64 个字符
- 只能包含小写字母、数字和连字符
- 不能包含 XML 标签
- 不能包含保留字：「anthropic」、「claude」

`description`：

- 必须非空
- 最多 1024 个字符
- 不能包含 XML 标签

`description` 应包括 Skill 的功能以及 Claude 何时应使用它。有关完整的创作指导，请参阅[最佳实践](https://platform.claude.com/docs/zh-CN/agents-and-tools/agent-skills/best-practices)。

## 6 安全考虑

我们强烈建议仅从受信任的来源使用 Skills：您自己创建的或从 Anthropic 获得的。Skills 通过指令和代码为 Claude 提供新功能，虽然这使它们功能强大，但也意味着恶意 Skill 可以指导 Claude 以与 Skill 声称的目的不匹配的方式调用工具或执行代码。



如果您必须使用来自不受信任或未知来源的 Skill，请格外谨慎并在使用前彻底审计它。根据 Claude 在执行 Skill 时拥有的访问权限，恶意 Skills 可能导致数据泄露、未授权系统访问或其他安全风险。

**关键安全考虑**：

- **彻底审计**：查看 Skill 中捆绑的所有文件：SKILL.md、脚本、图像和其他资源。寻找异常模式，如意外的网络调用、文件访问模式或与 Skill 声称的目的不匹配的操作
- **外部来源有风险**：从外部 URL 获取数据的 Skills 特别有风险，因为获取的内容可能包含恶意指令。即使是可信的 Skills 如果其外部依赖项随时间变化也可能被破坏
- **工具滥用**：恶意 Skills 可以以有害方式调用工具（文件操作、bash 命令、代码执行）
- **数据泄露**：具有敏感数据访问权限的 Skills 可能被设计为向外部系统泄露信息
- **像安装软件一样对待**：仅从受信任的来源使用 Skills。在将 Skills 集成到具有敏感数据或关键操作访问权限的生产系统时要特别小心

## 7 可用 Skills

### 预构建的 Agent Skills

以下预构建的 Agent Skills 可立即使用：

- **PowerPoint (pptx)**：创建演示文稿、编辑幻灯片、分析演示文稿内容
- **Excel (xlsx)**：创建电子表格、分析数据、生成带图表的报告
- **Word (docx)**：创建文档、编辑内容、格式化文本
- **PDF (pdf)**：生成格式化的 PDF 文档和报告

这些 Skills 在 Claude API 和 claude.ai 上可用。请参阅[快速入门教程](https://platform.claude.com/docs/zh-CN/agents-and-tools/agent-skills/quickstart)开始在 API 中使用它们。

### 自定义 Skills 示例

有关自定义 Skills 的完整示例，请参阅 [Skills 食谱](https://github.com/anthropics/claude-cookbooks/tree/main/skills)。

## 8 限制和约束

了解这些限制有助于您有效规划 Skills 部署。

### 跨平台可用性

**自定义 Skills 不会跨平台同步**。上传到一个平台的 Skills 不会自动在其他平台上可用：

- 上传到 Claude.ai 的 Skills 必须单独上传到 API
- 通过 API 上传的 Skills 在 Claude.ai 上不可用
- Claude Code Skills 基于文件系统，与 Claude.ai 和 API 分离

您需要为要使用 Skills 的每个平台单独管理和上传 Skills。

### 共享范围

Skills 根据使用位置有不同的共享模型：

- **Claude.ai**：仅限个人用户；每个团队成员必须单独上传
- **Claude API**：工作区范围；所有工作区成员可以访问上传的 Skills
- **Claude Code**：个人（`~/.claude/skills/`）或基于项目（`.claude/skills/`）

Claude.ai 目前不支持自定义 Skills 的集中管理员管理或组织范围分发。

### 运行时环境约束

Skills 在代码执行容器中运行，具有以下限制：

- **无网络访问**：Skills 无法进行外部 API 调用或访问互联网
- **无运行时包安装**：仅预安装的包可用。您无法在执行期间安装新包。
- **仅预配置的依赖项**：检查[代码执行工具文档](https://platform.claude.com/docs/zh-CN/agents-and-tools/tool-use/code-execution-tool)了解可用包的列表

规划您的 Skills 在这些约束范围内工作。