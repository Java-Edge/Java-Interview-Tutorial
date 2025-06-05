# 不止是编码：Codex 如何重塑软件工程的未来（现已登陆 ChatGPT）

## 0 前言

Codex 是一款基于云端的软件工程代理工具，能够同时处理多项任务，由 codex-1 提供支持。今天起，它已向 ChatGPT Pro、Team 和 Enterprise 用户开放，Plus 用户也将很快可用。

[Try Codex](https://chatgpt.com/codex)。

仪表盘询问“接下来我们应该编写什么代码？”背景是淡彩色代码主题，带有提示框、仓库/分支选择器和任务列表：

![](https://p.ipic.vip/h6412e.jpg)

今天，推出 Codex 研究预览版：一款基于云端的软件工程代理工具，能同时处理多项任务。Codex 可执行诸如编写功能、回答代码库相关问题、修复漏洞及提出待审核的拉取请求等任务；每个任务都在其自己的云端沙盒环境中运行，预先加载了你的代码库。

Codex 由 codex-1 提供支持， OpenAI o3 的一个版本，专为软件工程优化。通过在多种环境中对真实世界的编码任务进行强化学习训练，生成的代码能够紧密反映人类风格和拉取请求偏好，严格遵循指令，并且可以迭代运行测试，直到获得通过结果。我们今天开始向 ChatGPT Pro、Enterprise 和 Team 用户推出 Codex，很快也将支持 Plus 和 Edu 用户。

## 1 Codex 的工作原理

现可在 ChatGPT 的侧边栏中访问 Codex，并通过输入提示词并点击 **“Code”** 来为其分配新的编码任务。如想向 Codex 询问有关代码库的问题，点击 **“Ask”**。每个任务都在一个独立的隔离环境中独立处理，该环境预先加载了你的代码库。Codex 可读取和编辑文件及运行包括测试框架、代码检查工具和类型检查器在内的命令。任务完成通常需要 1~30min，具体取决于复杂程度，你可以实时监控 Codex 的进度。

完成任务后，Codex 会在其环境中提交更改。Codex 通过引用终端日志和测试输出提供其操作的可验证证据，使你能够追溯任务完成过程中的每一步。然后，你可以审查结果，请求进一步修订，打开 GitHub 拉取请求，或将更改直接集成到你的本地环境中。在产品中，你可以配置 Codex 环境，使其尽可能接近你的实际开发环境。





Codex 可以通过放置在代码库中的 AGENTS.md 文件进行引导。这些是类似于 README.md 的文本文件，你可以通过它们告知 Codex 如何导航代码库、运行哪些命令进行测试，以及如何最好地遵循项目的标准实践。与人类开发人员一样，当提供配置好的开发环境、可靠的测试设置和清晰的文档时，Codex 代理的表现最佳。

在编码评估和内部基准测试中，即使没有 AGENTS.md 文件或自定义脚手架，codex-1 也显示出强大的性能。

![](https://p.ipic.vip/zdj7w5.png)

23 个经过 SWE-Bench 验证的样本由于无法在我们的内部基础设施上运行而被排除在外。codex-1 的测试最大上下文长度为 192k 个标记，推理努力程度为中等，这正是今天产品中将提供的设置。有关 o3 评估的详细信息，see [here⁠](https://openai.com/index/introducing-o3-and-o4-mini/)。

我们的内部 SWE 任务基准是一组精选的真实世界内部 SWE 任务，来自 OpenAI。

## 2 构建安全可信的代理工具

我们以研究预览的形式发布 Codex，这与我们的迭代部署策略一致。我们在设计 Codex 时优先考虑了安全性和透明度，以便用户可以验证其输出 —— 随着 AI 模型独立处理更复杂的编码任务，以及安全考虑因素的演变，这一保障措施变得越来越重要。用户可以通过引用、终端日志和测试结果来检查 Codex 的工作。当不确定或遇到测试失败时，Codex 代理会明确沟通这些问题，使用户能够就如何继续做出明智的决策。在集成和执行之前，用户手动审查和验证所有代理生成的代码仍然至关重要。

代码审查截图，带有测试文件覆盖层，验证了带引号的文件名，以及在蓝色背景上的总结和通过的测试：

![](https://p.ipic.vip/saxj1h.jpg)

代码审查截图，带有黑色终端覆盖层，显示带引号的文件名通过了一个测试；“修复 /diff 中特殊字符的错误”更改的总结和差异在淡蓝色背景上可见：

![](https://p.ipic.vip/tzqxoa.jpg)

## 3 与人类偏好保持一致

训练 codex-1 的主要目标之一是使其输出紧密符合人类编码偏好和标准。与 OpenAI o3 相比，codex-1 始终能够产生更干净的补丁，准备好立即进行人类审查并集成到标准工作流程中。

> 案例详见官网：https://openai.com/index/introducing-codex/

## 4 防止滥用

防止人工智能驱动的软件工程被恶意应用，例如用于恶意软件开发，正变得越来越重要。同时，保护措施不应过度阻碍合法且有益的应用，这些应用可能涉及有时也用于恶意软件开发的技术，例如低级内核工程。

为了平衡安全性和实用性，Codex经过训练，能够识别并明确拒绝针对恶意软件开发的请求，同时清晰区分并支持合法任务。我们还增强了政策框架，并纳入了严格的安全评估，以有效强化这些边界。我们已发布对[o3系统卡的补充说明](https://openai.com/index/o3-o4-mini-codex-system-card-addendum/)，以反映这些评估。

## 5 安全执行

Codex代理完全在云端的安全、隔离容器中运行。在任务执行期间，互联网访问被禁用，将代理的交互限制为仅限于通过GitHub仓库明确提供的代码和用户通过设置脚本配置的预安装依赖项。代理无法访问外部网站、API或其他服务。

## 6 早期用例

OpenAI的技术团队已开始将Codex作为其日常工具的一部分使用。它通常被OpenAI工程师用于处理重复且范围明确的任务，例如重构、重命名和编写测试，这些任务否则会打断专注。它同样适用于搭建新功能、连接组件、修复漏洞和起草文档。团队正在围绕它形成新的习惯：处理值班问题、在一天开始时规划任务以及卸载后台工作以保持进度。通过减少上下文切换和提醒被遗忘的待办事项，Codex帮助工程师更快地交付产品，并专注于最重要的事务。

在发布之前，我们还与一组外部测试者合作，以更好地了解Codex在不同代码库、开发流程和团队中的表现。

- [思科](https://blogs.cisco.com/news/the-future-is-coming-faster-than-you-think)正在探索Codex如何帮助其工程团队更快地实现雄心勃勃的想法。作为早期设计合作伙伴，思科通过在产品组合中评估Codex的实际用例并向OpenAI团队提供反馈，正在帮助塑造Codex的未来。
- [Temporal](https://temporal.io/)使用Codex加速功能开发、调试问题、编写和执行测试以及重构大型代码库。它还通过在后台运行复杂任务来帮助他们保持专注，使工程师保持流畅的工作状态，同时加快迭代速度。
- [Superhuman](https://superhuman.com/)使用Codex加快小型但重复的任务，如提高测试覆盖率和修复集成失败。它还通过使产品经理能够贡献轻量级代码更改（无需工程师介入，除非进行代码审查）来帮助他们更快地交付产品。
- [Kodiak](https://kodiak.ai/)正在使用Codex编写调试工具、提高测试覆盖率和重构代码，以加快其自动驾驶技术Kodiak Driver的开发。Codex还成为了一个有价值的参考工具，通过提供相关上下文和过去的更改，帮助工程师理解不熟悉的堆栈部分。

根据早期测试者的经验，我们建议同时将范围明确的任务分配给多个代理，并尝试不同类型的任务和提示，以有效地探索模型的能力。

## 7 Codex CLI的更新

上个月，我们推出了Codex CLI，这是一个轻量级的开源编码代理，可在您的终端中运行。它将像o3和o4-mini这样的模型的强大功能带入您的本地工作流程，使您能够与它们配对，更快地完成任务。

今天，我们还发布了codex-1的较小版本，这是专为在Codex CLI中使用而设计的o4-mini版本。这个新模型支持CLI中的更快工作流程，并针对低延迟代码问答和编辑进行了优化，同时保留了指令遵循和风格方面的相同优势。它现在作为Codex CLI中的默认模型以及API中的codex-mini-latest提供。随着我们继续改进Codex-mini模型，底层快照将定期更新。

我们还使将您的开发者账户连接到Codex CLI变得更加容易。您不再需要手动生成和配置API密钥，而是可以使用ChatGPT账户登录并选择您想要使用的API组织。我们将为您自动生成和配置API密钥。使用ChatGPT登录Codex CLI的Plus和Pro用户还可以分别从今天开始兑换5美元和50美元的免费API积分，有效期为接下来的30天。

## 8 Codex的可用性、定价和限制

从今天起，我们开始向全球的ChatGPT Pro、企业版和团队用户推出Codex，很快将支持Plus和Edu用户。在接下来的几周内，用户将获得慷慨的访问权限，无需额外费用，以便您探索Codex的功能，之后我们将推出限速访问和灵活的定价选项，让您能够按需购买额外的使用量。我们计划很快向Plus和Edu用户扩展访问权限。

对于使用codex-mini-latest进行开发的开发者，该模型在响应API上提供，定价为每100万输入标记1.50美元，每100万输出标记6美元，并提供75%的提示缓存折扣。

Codex仍处于早期发展阶段。作为研究预览，它目前缺少一些功能，例如前端工作所需的图像输入，以及在代理工作时对其进行纠正的能力。此外，将任务委托给远程代理比交互式编辑花费的时间更长，这可能需要一些时间来适应。随着时间的推移，与Codex代理的互动将越来越类似于与同事进行异步协作。随着模型能力的提升，我们预计代理将能够处理更复杂的任务并持续更长时间。

## 9 下一步计划

我们设想了一个未来，开发者将主导他们想要负责的工作，并将其他工作委托给代理——通过人工智能更快地移动并提高生产力。为了实现这一目标，我们正在构建一套支持实时协作和异步委托的Codex工具。

与Codex CLI等人工智能工具配对已迅速成为行业标准，帮助开发者在编码时更快地移动。但我们相信，Codex在ChatGPT中引入的异步多代理工作流程将成为工程师生产高质量代码的默认方式。

最终，我们认为这两种互动模式——实时配对和任务委托——将融合。开发者将在他们的IDE和日常工具中与人工智能代理协作，以提问、获取建议和委托长期任务，所有这些都在一个统一的工作流程中。

展望未来，我们计划引入更具互动性和灵活性的代理工作流程。开发者将很快能够在任务中途提供指导、协作制定实施策略并接收主动的进度更新。我们还设想与您已经使用的工具进行更深入的集成：今天Codex连接到GitHub，很快您将能够从Codex CLI、ChatGPT桌面版甚至您的问题跟踪器或CI系统等工具中分配任务。

软件工程是第一个体验显著人工智能驱动生产力提升的行业之一，为个人和小团队开辟了新的可能性。尽管我们对这些收益持乐观态度，但我们也正在与合作伙伴合作，以更好地理解广泛代理采用对开发者工作流程、人员技能发展、技能水平和地理区域的影响。

这只是开始——我们期待看到您用Codex构建什么。

## 10 提示词

我们分享codex-1系统消息，以帮助开发者了解模型的默认行为，并将Codex定制为在自定义工作流程中有效工作。例如，codex-1系统消息鼓励Codex运行AGENTS.md文件中提到的所有测试，但如果你时间紧迫，可以要求Codex跳过这些测试。

```java
# Instructions
- The user will provide a task.
- The task involves working with Git repositories in your current working directory.
- Wait for all terminal commands to be completed (or terminate them) before finishing.

# Git instructions
If completing the user's task requires writing or modifying files:
- Do not create new branches.
- Use git to commit your changes.
- If pre-commit fails, fix issues and retry.
- Check git status to confirm your commit. You must leave your worktree in a clean state.
- Only committed code will be evaluated.
- Do not modify or amend existing commits.

# AGENTS.md spec
- Containers often contain AGENTS.md files. These files can appear anywhere in the container's filesystem. Typical locations include `/`, `~`, and in various places inside of Git repos.
- These files are a way for humans to give you (the agent) instructions or tips for working within the container.
- Some examples might be: coding conventions, info about how code is organized, or instructions for how to run or test code.
- AGENTS.md files may provide instructions about PR messages (messages attached to a GitHub Pull Request produced by the agent, describing the PR). These instructions should be respected.
- Instructions in AGENTS.md files:
  - The scope of an AGENTS.md file is the entire directory tree rooted at the folder that contains it.
  - For every file you touch in the final patch, you must obey instructions in any AGENTS.md file whose scope includes that file.
  - Instructions about code style, structure, naming, etc. apply only to code within the AGENTS.md file's scope, unless the file states otherwise.
  - More-deeply-nested AGENTS.md files take precedence in the case of conflicting instructions.
  - Direct system/developer/user instructions (as part of a prompt) take precedence over AGENTS.md instructions.
- AGENTS.md files need not live only in Git repos. For example, you may find one in your home directory.
- If the AGENTS.md includes programmatic checks to verify your work, you MUST run all of them and make a best effort to validate that the checks pass AFTER all code changes have been made.
  - This applies even for changes that appear simple, i.e. documentation. You still must run all of the programmatic checks.

# Citations instructions
- If you browsed files or used terminal commands, you must add citations to the final response (not the body of the PR message) where relevant. Citations reference file paths and terminal outputs with the following formats:
  1) `【F:<file_path>†L<line_start>(-L<line_end>)?】`
  - File path citations must start with `F:`. `file_path` is the exact file path of the file relative to the root of the repository that contains the relevant text.
  - `line_start` is the 1-indexed start line number of the relevant output within that file.
  2) `【<chunk_id>†L<line_start>(-L<line_end>)?】`
  - Where `chunk_id` is the chunk_id of the terminal output, `line_start` and `line_end` are the 1-indexed start and end line numbers of the relevant output within that chunk.
- Line ends are optional, and if not provided, line end is the same as line start, so only 1 line is cited.
- Ensure that the line numbers are correct, and that the cited file paths or terminal outputs are directly relevant to the word or clause before the citation.
- Do not cite completely empty lines inside the chunk, only cite lines that have content.
- Only cite from file paths and terminal outputs, DO NOT cite from previous pr diffs and comments, nor cite git hashes as chunk ids.
- Use file path citations that reference any code changes, documentation or files, and use terminal citations only for relevant terminal output.
- Prefer file citations over terminal citations unless the terminal output is directly relevant to the clauses before the citation, i.e. clauses on test results.
  - For PR creation tasks, use file citations when referring to code changes in the summary section of your final response, and terminal citations in the testing section.
  - For question-answering tasks, you should only use terminal citations if you need to programmatically verify an answer (i.e. counting lines of code). Otherwise, use file citations.
```