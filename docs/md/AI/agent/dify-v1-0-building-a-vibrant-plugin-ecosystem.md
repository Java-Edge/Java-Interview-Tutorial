# Dify v1.0.0：以插件生态和智能工作流驱动 AI 创新

## 0 前言

Dify v1.0.0正式发布，这标志着 Dify 作为 AI 应用开发平台迈出了重要的一步。

### 版本亮点

- **版本升级：** Dify 社区升级至 v1.0.0。
- **插件机制** ：基于插件的新架构，模型和工具已迁移到插件，引入了代理策略、扩展和捆绑包
- **工作流增强功能** ：已添加代理节点，用于在工作流和聊天流中实现智能编排和任务执行。
- **开放生态系统** ： [Dify Marketplace](https://marketplace.dify.ai/) 的推出是为了与社区、合作伙伴和企业开发人员一起培育一个蓬勃发展的插件生态系统。

## 1 人工智能应用开发的新范式

随着生成式人工智能的迅速崛起，2025 年迎来了一系列重大创新：

- 基于强化学习的大型语言模型（LLM），如 OpenAI 的 o1 和 DeepSeek-R1，在推理能力上表现出色
- OpenAI Operator 正在探索通过计算机驱动的模型实现现实世界的任务自动化
- Deep Research 则在智能异步信息处理方面表现出色

这些进步标志着人工智能应用正在向独立执行复杂任务的方向转变。Dify 致力于打造下一代 AI 应用平台，为开发者提供四大核心能力：

- **推理** ：整合增强的推理模型，以实现更佳的问题解决能力
- **行动** ：扩展人工智能能力，以在数字（例如，执行软件操作）和物理环境（例如，智能家居和工厂的物联网设备集成）中执行操作
- **动态内存** ：优化的 RAG 和内存机制，以改善上下文理解和长期任务执行
- **多模式 I/O** ：处理多种数据模式（文本、图像、视频和语音），实现直观的人机交互

Dify 提供灵活的开发框架，集成日益强大的模型、工具、决策逻辑和数据库，不断增强 AI 核心能力，使开发更加高效、智能，满足复杂的需求。

鉴于人工智能应用的多样性，单一平台无法满足所有需求，标准化接口和通信协议至关重要。Dify 致力于构建一个开放、共享、充满活力的生态系统，让来自 Dify、社区开发者、企业以及第三方平台的组件无缝集成，实现价值共享和资源共享。最终，Dify 希望加速人工智能的落地，并推动创新。

为了实现这一目标，Dify 开发了一个插件系统和市场，这是构建生态系统的关键一步。

## 2 插件架构

v1.0.0 版前，Dify面临重大挑战： **模型和工具与核心平台紧密集成，添加新功能需要修改核心代码库，这拖慢了开发速度并阻碍了创新。** 为解决这问题，重构了 Dify 的架构，并引入了一个插件系统，该系统具有以下四个主要优势：

- **模块化插件：** 插件与 Dify 的核心架构分离，允许模型和工具独立运行，无需完整平台升级即可进行更新。用户只需更新相关插件，简化维护并确保兼容性。这也使新工具的开发和共享更加便捷，确保无缝集成。

- **开发人员友好体验：** 插件遵循标准化开发协议，提供带有远程调试、代码示例和 API 文档的综合工具链，以简化开发

- **热插拔设计** ：系统支持动态插件扩展和灵活使用，确保最佳的平台性能

### 多种分发渠道

![](https://framerusercontent.com/images/W7mBSNOkSJdEvAdnrjjDxXmkWo.jpg)

#### Dify 市场（Dify Marketplace）

一个用于聚合、分发和管理插件的平台。开发者可以提交他们的插件以供审核，并将其发布到 Dify 的插件库中。该市场目前提供 120 多个插件，包括：

- **模型：** OpenAI o1 系列（o1、o3-mini 等）、Gemini 2.0 系列、DeepSeek-R1 及其提供商，包括 OpenRouter、Ollama、Azure AI Foundry、Nvidia Catalog 等
- **工具：** Perplexity、Discord、Slack、Firecrawl、Jina AI、Stability、ComfyUI、Telegraph 等
- [Dify Marketplace](https://marketplace.dify.ai/) 上有更多插件可供探索。查看[如何将插件发布到 Dify Marketplace](https://docs.dify.ai/plugins/publish-plugins/publish-to-dify-marketplace)


#### 社区共享

开发人员可以在 GitHub 等平台上自由共享插件，促进开源协作和社区驱动的创新。

#### 本地部署

Dify 社区版、云版、企业版用户均可从本地包文件安装插件，共享内部工具，加速部署速度，促进团队内部资源共享。

这种模块化方法显著提高了 Dify 的灵活性和可扩展性，从而促进了更高效、更具创新性的生态系统。

## 3 智能工作流

开发者可以使用 Dify 的工作流和聊天流节点灵活地编排应用程序并解决复杂问题。Dify 专注于优化节点类型和功能，并强调开放性，以更好地满足开发者的多样化需求。v1.0.0 版本引入了 Agent 节点，并通过 Agent Strategy 插件增强了推理策略，从而实现了工作流和聊天流的智能、自主编排。

https://framerusercontent.com/assets/YLncpf6QY0fFdPaIMoRXe4eVx8.mp4

- [**代理节点** ](https://docs.dify.ai/guides/workflow/node/agent)：工作流和聊天流中的决策中心，根据资源调度、状态管理、推理记录、工具选择等策略动态调用模型，提升工作流效率和场景适应性。
- [**Agent 策略** ](https://docs.dify.ai/plugins/quick-start/develop-plugins/agent-strategy-plugin)：将决策逻辑抽象为插件，并预设 **ReAct** 和 **Function Calling** 等策略，支持 Chain-of-Thoughts 和 Tree-of-Thoughts 等推理策略。同时，我们也提供了插件的开发标准，鼓励创新和共享

## 4 开放生态系统

多样化的插件将为 AI 应用提供核心能力，将 Dify 连接到外部平台，支持多模式交互，推动价值交换。

![](https://framerusercontent.com/images/BcMft7b8RR1lmBCJPFH2CjuPF4Y.png)

- **生态系统连接器：这些扩展功能**可实现与外部平台（例如 Slack）的无缝集成，从而促进数据和功能的互操作，从而构建高效的交互网络。插件端点还支持反向调用 Dify 的核心功能，包括模型、工具和工作流节点。
- **多模态交互：** Dify 支持图像生成、语音交互等多模态模型和工具插件，扩展 AI 应用处理多样化输入输出格式的能力。
- **价值共享平台：** Dify Marketplace 既是插件分发平台，也是创意交流中心。社区版下载量达 240 万次，企业版服务于众多财富 500 强企业。我们的目标是帮助企业找到解决方案，同时赋能开发者推动创新并创造收益。
- 为了构建蓬勃发展的插件生态系统，我们渴望与更多合作伙伴携手，为用户提供更全面、更成熟的解决方案。 **在 v1.0.0 版本中，我们的首批合作伙伴包括 OpenRouter、Brave、E2B、SiliconFlow、Agora、Fish Audio、Dupdub 等。** 我们衷心感谢合作伙伴的支持，并期待为用户和开发者提供更丰富、更先进的解决方案，同时推进 AI 技术与现有软件的融合。


这个开放的生态系统促进所有参与者的协作、创新和共同成功。

## 5 前景

我们将继续通过插件的方式解耦和开放 Dify 的核心能力，增强平台的灵活性，以满足多样化的开发需求。例如，我们利用数据处理组件来改进 RAG 工作流编排，帮助开发者应对复杂的挑战。

为支持生态系统发展，我们将建立持续的合作伙伴网络，打造开放的 AI 中间件平台，连接工具与用户，并提供定制化的解决方案。我们还将推广行业专属用例，加速企业数字化转型和智能化升级。

此外，Dify 将完善开发者文档和工具链支持，并通过线上线下活动邀请全球开发者共建。我们将认真倾听社区反馈，持续优化产品功能，致力于构建一个开放、繁荣、促进创新、资源共享的生态系统。

## 6 总结

为了让大家更便捷地体验 Dify v1.0.0，探索平台功能，参与 Dify 生态共建，相关访问链接如下：

- [**Dify Community Version Dify 社区版**](https://github.com/langgenius/dify/releases/tag/1.0.0)
- [**Dify Cloud Version Dify 云版本**](https://cloud.dify.ai/apps)
- [**Dify Plugins Repo Dify 插件库**](https://github.com/langgenius/dify-plugins)
- [**Dify Marketplace Dify 市场**](https://marketplace.dify.ai/)
- [**Dify Plugin Docs Dify 插件文档**](https://docs.dify.ai/plugins/introduction)