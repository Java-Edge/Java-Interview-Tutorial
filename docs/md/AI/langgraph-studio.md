# 01-LangGraph Studio：首款智能体（agent）IDE

## 0 前言

LangGraph Studio 提供了一个专门的智能体IDE，用于可视化、交互和调试复杂的智能体应用程序。本文来了解如何在桌面使用。 

LLM为新型*智能体*应用程序的发展铺平了道路——随这些应用程序演进，开发它们所需工具也必须不断改进。今天推出的 LangGraph Studio——首款专为Agent开发设计的IDE，现已开放测试版。

LangGraph Studio 提供一种开发 LLM 应用程序的新方式，专用于可视化、交互和调试复杂的智能体应用程序。

本文简要介绍 LangGraph，并探讨 LangGraph Studio 如何简化智能体应用程序的开发。

## 1 LangGraph: 平衡agent控制与自主性

2023年1月推出了 LangGraph，高度可控的低级编排框架，用于构建智能体应用程序。从那时起，我们看到团队为生产环境构建了更复杂的智能体应用程序；因此，我们大力投资于 LangGraph，并于今年6月推出稳定的 0.1 版本。

LangGraph 具有持久层，支持人类参与的互动，并且在构建需要高度特定领域认知架构的复杂应用程序（即不止一次调用大语言模型）方面表现出色。生产环境中看到的大多智能体都符合这描述。

LangGraph完全开源，提供 [Python](https://github.com/langchain-ai/langgraph?ref=blog.langchain.dev) 和 [Javascript](https://github.com/langchain-ai/langgraphjs?ref=blog.langchain.dev) 版本，与 LangChain 一起使用，也可独立使用，且与 LangSmith 无缝集成。

## 2 可视化并与智能体图形进行交互以快速迭代

虽然 LangGraph 提供开发智能体应用程序的新框架，但我们也坚信需要新工具简化开发过程。构建 LLM 应用程序不同于传统的软件开发，需要在传统代码编辑器之外的不同工具。

代码仍是开发 LLM 应用程序的重要组成部分——毕竟，生产级 LangGraph 应用程序的图中的节点和边缘中包含复杂的自定义逻辑。我们并不打算取代代码编辑器，而是**增强** LangGraph 应用程序开发体验的工具。

LangGraph Studio 通过使智能体图形的可视化和交互变容易，即使开发主要在代码中进行。可视化图形可帮助开发人员理解其结构。此外，可在智能体执行过程中修改结果（或特定节点的底层逻辑）。这创建了一个迭代过程，让你可在特定时间点与状态进行交互和操作。

首先将一些核心功能带入智能体集成开发环境的世界。

## 3 咋用 LangGraph Studio

桌面应用程序，目前适用于 Apple Silicon。更多平台支持即将推出。

下载并打开 LangGraph Studio 后，系统会提示您使用 LangSmith 帐户登录。目前所有 LangSmith 用户（包括免费账户）在测试版期间均可使用 LangGraph Studio。您可以[在此](https://smith.langchain.com/?ref=blog.langchain.dev)注册一个 LangSmith 帐户。

![](https://blog.langchain.dev/content/images/2024/08/login_screen.png)

下载 LangSmith 后，可打开一个目录。至少，该目录需要包含一个定义了图形的 Python 文件。

接下来，要创建一个 `langgraph.json` 文件，其中包含智能体定义位置、要安装的依赖项以及要加载的环境变量等详细信息。此文件可以在 UI 中创建，也可以作为目录中的文件已经存在。有关满足这些要求的示例仓库，请参见[此 GitHub 仓库](https://github.com/langchain-ai/langgraph-example?ref=blog.langchain.dev)。

![](https://blog.langchain.dev/content/images/2024/08/select_project_screen.png)

打开目录后，将构建一个智能体运行的环境。构建完成后，应该会看到图形的可视化以及与智能体交互的框。

![](https://blog.langchain.dev/content/images/2024/08/graph_screen.png)

与智能体交互时，您将实时看到正在发生的步骤信息。可看到智能体决定调用哪些工具、调用这些工具，然后继续循环执行。

如果智能体偏离轨道，您可以随时中断它，或可中断智能体以使其进入“调试模式”，在图形的每一步之后暂停（这样可逐步浏览每个步骤）。

在任何时候，都可与智能体的***\*状态\****进行交互。

如果对智能体在某个特定步骤的响应不满意，可直接修改响应，然后继续使用该新响应。这对于模拟如果智能体或工具返回不同结果会发生什么非常有用。

还可修改底层代码，然后重新运行该节点。LangGraph Studio 会检测到底层代码文件的更改，允许您在代码编辑器中更新提示词并在智能体响应不佳时重新运行节点。这使得迭代长时间运行的智能体变得更加容易。

## 4 结论

构建智能体应用程序不同于传统的软件开发。虽然代码编辑器仍然很重要，但也需要为智能体设计的新集成开发环境 (IDE)。LangGraph Studio 是朝这个方向迈出的一步，我们期待看到它如何提升工作流程。

参考：

- [文档](https://github.com/langchain-ai/langgraph-studio?ref=blog.langchain.dev)
- [YouTube视频演练](https://www.youtube.com/watch?v=pLPJoFvq4_M&ref=blog.langchain.dev)
- https://blog.langchain.dev/langgraph-studio-the-first-agent-ide/

[**注册 LangSmith**](https://smith.langchain.com/?ref=blog.langchain.dev)，开始免费试用 LangGraph Studio吧！