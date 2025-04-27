# 对标cursor，JetBrains官方推出Junie！

![](https://blog.jetbrains.com/wp-content/uploads/2025/01/Blog_1280x720.png)

## 0 前言

Junie 能根据开发者在 IDE 中提供的项目上下文信息，执行所分配的编码任务。

可让 Junie “实现用于管理书签的增删改查操作，并带有用户界面”。Junie 会收集所有相关的上下文信息，然后规划出完成任务的各个步骤，包括分析项目结构、检查依赖项、确认是否存在需要通过的测试、创建所需的源文件、运行测试等。

![](https://imgopt.infoq.com/fit-in/3000x4000/filters:quality(85)/filters:no_upscale()/news/2025/01/jetbrains-junie-agent/en/resources/1jetbrains-junie-1738338914161.jpg)

任务完成后，Junie 会指出当前方案可能存在的已知限制，用户可以进行查看、修改，最终决定是否接受。Junie 还能为现有程序编写测试用例、运行代码检查等。

## 1 基准测试

![](https://blog.jetbrains.com/wp-content/uploads/2025/01/Blog_body_1280x604.png)

Junie 在 [SWEBench Verified 基准测试](https://www.swebench.com/#verified) 中完成 53.6% 任务，该测试涵盖 500 多个编程任务。

根据 SWEBench Verified —— 一个涵盖 500 个开发任务的权威基准测试，Junie 在单次运行中可完成 53.6% 的任务。这一成绩展示了它强大的潜力，也证明了 Junie 能适应现代软件开发中各种复杂程度不同的任务，为全球数百万开发者和企业解锁 AI 编码代理的力量。

## 2 AI 编码代理 V.S AI 编码助手

AI 编码代理可以看作是 AI 编码助手的进化版：

- 后者主要是在编辑器中根据用户提示提供代码补全或重构建议，比如根据方法签名或注释建议实现方式、生成文档等
- 而 AI 代理则更强调自主完成整个任务，从“辅助开发者”向“与开发者协作”的模式转变

已有许多大厂和初创公司加入这一领域，如：

- AWS 最近为其 [Q Developer](https://www.infoq.com/news/2024/12/new-amazon-q-developer-agent/) 助手增加代理功能
- Google 发布基于 Gemini 2.0 的 [Jules 代理](https://www.infoq.com/news/2024/12/google-jules-agent/)
- GitHub 推出基于 GPT-4 Turbo 的 [Copilot Workspace](https://www.infoq.com/news/2024/05/github-copilot-workspace-preview/)
- 许多表现突出的代理工具跻身 SWEBench Verified 排行榜前十，如 [W&B Programmer O1 crosscheck5](https://wandb.ai/)、[Blackbox AI Agent](https://www.blackbox.ai/)、[CodeStory Midwit Agent + swe-search](https://aide.dev/)、[Emergent.ai](https://emergent.sh/) 等

JetBrains  2023 年就推出[AI Assistant](https://www.infoq.com/news/2023/12/jetbrains-ai-assistant-ga/)，但市场反馈褒贬不一，[有开发者称其功能强大，也有人提出批评](https://plugins.jetbrains.com/plugin/22282-jetbrains-ai-assistant/reviews)。目前市场上还有其他编码助手可选，如 [GitHub Copilot](https://www.infoq.com/news/2024/12/github-copilot-free-vscode/)、[Google Code Assist](https://www.infoq.com/news/2025/01/gemini-code-assist-tools/)、[AWS CodeWhisperer](https://www.infoq.com/news/2022/07/aws-codewhisperer-coding/)。

## 3 JetBrains使命

推动新一代技术的发展，让软件开发变得更高效、更有趣。为了赋能开发者，我们打造了众多专业开发工具，包括强大的 AI 功能，已经显著提升了开发效率，并为创意打开了新的可能。那么，我们能否更进一步：提升代码质量、激发创新、完成复杂任务、彻底改变编程方式？

答案是：**当然可以！**

随着 Junie 的推出，JetBrains 正在重新定义编码方式。借助 Junie 的“代理智能”能力，你可以在 IDE 中将繁琐的任务完全交由它处理，也可以与它协作完成复杂任务。得益于 JetBrains IDE 的强大能力与可靠的大型语言模型（LLM），Junie 能解决原本需要几个小时的工作。

<iframe title="See Junie in Action: Your Coding Agent in IntelliJ IDEA, a JetBrains IDE" width="500" height="281" src="https://www.youtube.com/embed/ufPGsZtqrac?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="" style="box-sizing: inherit; max-height: 100%; max-width: 100%; top: 0px; left: 0px; width: 849px; height: 477.138px;"></iframe>

## 4 重塑开发者体验

### 4.1 无缝集成到你熟悉IDE

Junie不会打乱你的工作节奏，而是帮助你更高效地创造与实现。只需在 IDE 中安装 Junie，即可开始使用。你可以先将简单任务交给它处理，逐步适应这种协作方式，无需改变现有的开发流程。

等你熟悉之后，可以让 Junie 处理更复杂的任务，融入团队协作流程，重新定义任务分配方式，从而提升生产效率，激发创造力，释放 AI 编码代理带来的全新开发体验。

<iframe title="Meet Junie: Your Coding Agent in PyCharm, a JetBrains IDE" width="500" height="281" src="https://www.youtube.com/embed/wpz_0MgNZ5w?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="" style="box-sizing: inherit; max-height: 100%; max-width: 100%; top: 0px; left: 0px; width: 849px; height: 477.138px;"></iframe>

### 4.2 始终掌控你的代码

开发者可以快速查看 Junie 提出的更改、保持对项目上下文的把握，并主导关键决策。即使将任务交给 Junie，你也始终掌握主导权，可以审阅代码更动以及它执行命令的方式。

### 4.3 提升代码质量

AI 生成的代码同样可能存在缺陷。Junie 的目标不仅是加快开发速度，更是提升代码质量标准。借助 JetBrains IDE 与 LLM 的结合，Junie 能生成代码、运行检查、编写测试并验证测试是否通过。

### 4.4 让 Junie 成为值得信赖的队友

Junie 设计上能够理解每个项目的上下文，也能适应你的编程风格。它还能遵循特定的编码规范，让 Junie 更好地与你的工作方式保持一致。这不仅提升了代码质量，也让 Junie 在执行任务时更可靠，成为你团队中值得信赖的协作伙伴。