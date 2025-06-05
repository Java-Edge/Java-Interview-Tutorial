# Amazon 开源 Strands Agents SDK，用于构建 AI 智能体

## 0 前言

Amazon最近发布开源 SDK - Strands Agents，通过模型驱动方法简化智能体开发。框架允许开发者只需少量代码，通过定义提示词和工具列表，就能构建智能体。

该项目得到多家科技公司和咨询公司支持。Amazon 表示：“目前已有多家公司加入我们，共同支持和贡献这个项目，包括 Accenture、Anthropic、Langfuse、mem0.ai、Meta、PwC、Ragas.io 和 Tavily。”Strands 的设计既适用于简单应用，也能扩展到复杂的智能体场景，支持从本地开发到生产部署，为开发者提供从原型到生产级别智能体的一站式路径。

## 1 框架核心组成

“模型（model）、工具（tools）和提示词（prompt）”。这三者构成了 Amazon 所称的“agentic loop”（智能体循环）：智能体通过这三种组件完成任务，往往可以自主执行。

实际运行中，Strands 会将提示词和智能体上下文，以及智能体可用工具的描述，一起发给LLM。系统充分利用了当今 LLM 的强大能力，LLM 现在具备强大的推理、规划和工具选择能力。

![](https://p.ipic.vip/rkikxc.png)

## 2 执行流程

遵循一个结构化模式，LLM 可选择用自然语言向用户回应，规划任务步骤，回顾过去的步骤，或选择一个或多个工具进行使用。

而 Strands 会自动处理工具执行的技术细节：当 LLM 选择一个工具时，Strands 会负责调用工具并将结果返回给 LLM。

这个过程会不断迭代，直到LLM 完成任务，Strands 返回智能体的最终结果。

## 3 定位

Strands Agents 自我[定位](https://strandsagents.com/0.1.x/)为“轻量级且适合生产环境”，支持多种模型提供方和部署方式。这个 SDK 能适配不同类型的工作负载，支持“对话型、非对话型、流式和非流式”智能体。

## 4 主要功能

包括“全面[可观测性](https://strandsagents.com/0.1.x/user-guide/observability-evaluation/observability/)、追踪以及可扩展的部署选项”，并内置了[工具](https://strandsagents.com/0.1.x/user-guide/concepts/tools/tools_overview/)，帮助开发者快速上手。该框架还支持高级功能，如“[多智能体](https://strandsagents.com/0.1.x/user-guide/concepts/multi-agent/agents-as-tools/)协作和自主智能体”，可实现“智能体团队协作，以及智能体随时间自我优化”的能力。

Amazon 强调，Strands 将“安全性与隐私保护”作为重点，确保组织可以在保护数据的前提下负责任地运行智能体。该 SDK 的架构简洁且可定制，不依赖于特定模型或提供商，兼容各种模型和部署环境。

## 5 开发工具

该 SDK 还提供两个用于开发的额外软件包：[strands-agents-tools](https://pypi.org/project/strands-agents-tools/) 和 [strands-agents-builder](https://pypi.org/project/strands-agents-builder/)，均可在 GitHub 获取。tools 包提供了扩展智能体功能的示例实现，而 builder 包内置了一个智能体，可协助开发者创建自己的 Strands 智能体和工具。这些组件支持个性化开发，帮助开发者进一步拓展框架的功能。

## 6 适用范围

[超越](https://strandsagents.com/0.1.x/user-guide/quickstart/)了 Amazon Bedrock，支持多种模型提供方。开发者可：

- 通过 API 接入 [Anthropic](https://docs.anthropic.com/en/home) 的 Claude 模型；
- [LiteLLM](https://docs.litellm.ai/docs/) 提供了统一接口，支持 OpenAI、Mistral 等模型
- 通过 [Llama API](https://strandsagents.com/0.1.x/user-guide/concepts/model-providers/llamaapi/)，框架支持 Meta 的 Llama 模型
- 也可用 [Ollama](https://ollama.com/) 在本地运行模型，满足隐私或离线需求
- OpenAI 的模型也可通过 API 直接访问，包括兼容 OpenAI 接口的替代模型
- 开发者还可以[自定义模型提供方](https://strandsagents.com/0.1.x/user-guide/concepts/model-providers/custom_model_provider/)，以适配特定的实现需求

## 7 总结

有兴趣使用 Strands 构建 AI 智能体的开发者，可前往其[GitHub 页面]()，查看文档、示例代码，并参与到该开源项目的社区。

参考：

- https://aws.amazon.com/cn/blogs/opensource/introducing-strands-agents-an-open-source-ai-agents-sdk/
- https://github.com/strands-agents