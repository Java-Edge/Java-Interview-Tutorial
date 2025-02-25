# 全球最强即时推理AI大模型Claude 3.7发布！

## 0 前言

2025年2月25日，今天发布迄今为止最智能的模型——**Claude 3.7 Sonnet**，全球首个**混合推理（Hybrid Reasoning）**模型。

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/02/cc3a0232463aeeceb09b9c415b3e0c11.png)

提供：

- 近乎实时回答
- 同时进行深入的、分步骤的推理
- 且这种思考过程可[直观展示给用户](https://youtu.be/t3nnDXa81Hs)
- 对API用户，还可**精细控制**模型的思考时长

在**编程和前端开发**方面表现尤为出色。还推出一款**全新的命令行工具——Claude Code**，专为**智能代理式（Agentic）编码**设计。目前处**限量研究预览**阶段，允许开发者直接在终端委托 Claude 执行**复杂工程任务**。

Claude Code介绍界面：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/02/f1f7aa4bc58d71d90cec6ce7fd1a6a6d.png&w=3840&q=75)

## 1 面向所有用户



![](https://my-img.javaedge.com.cn/javaedge-blog/2025/02/0979de78d760ea8f66ec6ace9a9de376.png)

### 1.1 访问入口

- **Claude 官网**（[Claude.ai](https://claude.ai/new)），支持**免费版、Pro、团队版和企业版**（免费版不支持“扩展思考”模式）
- **API 接入**：[Anthropic API](https://docs.anthropic.com/en/docs/about-claude/models)
- **云服务**：[Amazon Bedrock](https://aws.amazon.com/bedrock/claude/)、[Google Cloud Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-claude)

### 1.2 价格

**标准模式和扩展思考模式**均维持与前代相同费用：

- **输入**：每百万 tokens **$3**
- **输出**：每百万 tokens **$15**（包含思考过程的 tokens）

## 2 让最强推理更实用

采用不同市场上其他推理模型的设计理念。与人类一样，我们认为 AI **不应将快速反应与深度思考分离**，而应统一到同一个模型。这种方法能带来更流畅的用户体验，并让 AI 更自然地**在不同任务间切换推理方式**。

### 2.1 Claude 3.7 Sonnet的核心特性

#### 2.1.1 普通 LLM + 推理模型【合体】

用户可选**快速回答**，也可让 Claude **深度思考**后再作答。

**扩展思考模式**下，Claude 3.7 Sonnet会进行自我反思，以提升**数学、物理、代码编写、指令执行**等表现。

#### 2.1.2 API可控的思考预算

开发者可通过 API 设置 Claude **最多思考 N 个 tokens**（最高可达 **128K tokens**），实现**速度、成本和回答质量**的三角平衡。

#### 2.1.3 更贴近真实业务场景的优化

相较数学或编程竞赛问题，我们更专注**企业实际使用 LLM 的需求**，如代码维护、调试、自动化开发等。

[早期测试](https://www.anthropic.com/claude/sonnet)中，Claude 3.7 Sonnet编程能力遥遥领先：

- **Cursor**：Claude继续成为**处理真实代码任务**的**最佳 AI**，能处理**复杂代码库**并使用高级工具
- **Cognition**：Claude 在**代码修改规划**和**全栈开发**方面远超其他模型
- **Vercel**：Claude 在**复杂自动化任务**中表现极为精准
- **Replit**：Claude 能**从零构建**复杂的 Web 应用和仪表盘，而其他模型常会卡住
- **Canva**：Claude 生成的代码不仅**生产就绪**，而且设计风格更优，错误率显著减少

### 2.2 关键基准测试表现卓越

#### 2.2.1 SWE-bench Verified

评估 AI 解决**真实软件问题**的能力，取得最先进的表现：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/02/9e194a1f49d28516f8d9a445240700ee.png&w=3840&q=75)

#### 2.2.2 TAU-bench

测试 AI 在复杂任务中的**用户交互和工具调用**能力，依然领先：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/02/cc3b111394525cee41454efd89768a34.png&w=3840&q=75)

#### 2.2.3 综合能力

在**指令跟随、推理、多模态理解、代码代理**等方面均表现优异，扩展思考模式在**数学和科学任务**中带来额外优势。前沿推理模型对比：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/02/c98054281434e8f7bdf31ccccbbeac10.png&w=3840&q=75)

## 3 Claude Code：智能代理式编程助手

自 2024 年 6 月以来，Sonnet 已成为开发者首选模型。今天进一步推出**Claude Code**——Anthropic 的首款**智能代理编程工具**（限量研究预览）。

Claude Code 能执行**代码搜索、文件编辑、测试编写和运行、GitHub 提交、命令行操作**，整个过程保持**透明可控**。

Claude Code在内测中**大幅提高开发效率**：

- **复杂调试、重构**：可高效解决**复杂 bug**，并进行大规模代码重构
- **任务自动化**：完成**原本需 45+ 分钟**的任务，仅需**一次性执行**

计划在未来几周内不断

### 优化

- 提升工具调用的可靠性
- 支持长时间运行的命令
- 增强代码解析和交互能力

[申请加入 Claude Code 预览](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview)，一起塑造 Claude 的未来！

## 4 展望

Claude 3.7 Sonnet 和 Claude Code 标志着 AI **从助手向智能伙伴进化**的重要一步。它们不仅具备**深度推理、自动执行任务**的能力，还能**高效协作**，真正扩展人类的创造力。

期待看到大家用它们创造出怎样的精彩应用！🎉