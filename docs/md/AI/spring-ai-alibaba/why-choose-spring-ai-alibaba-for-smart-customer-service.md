# 为何选择Spring AI Alibaba开发智能客服平台？

## 0 前言

本文来看如何使用Spring AI Alibaba构建Agent应用。

## 1 需求

智能客服平台，可帮助用户完成机票预定、问题解答、机票改签、取消等动作，具体要求：

- 基于 AI 大模型与用户对话，理解用户自然语言表达的需求
- 支持多轮连续对话，能在上下文中理解用户意图
- 理解机票操作相关的术语与规范并严格遵守，如航空法规、退改签规则等
- 在必要时可调用工具辅助完成任务

## 2 技术架构



![](https://sca.aliyun.com/img/1728554016353.png)

### 2.1 接入AI大模型

不过是用 Spring Boot 开发普通 Java 应用，要能持续接收用户提问，解决机票相关问题，叫它Agent应用是因为这应用可与 AI 交互，由 AI 帮助应用理解用户问题并为用户做决策，简化分解后的架构：

![](https://sca.aliyun.com/img/1728554016631.png)

### 2.2 利用RAG增加机票退改签规则

应用由 AI 模型理解用户问题，决策下一步动作、驱动业务流程。但任一通用大模型都能解决机票相关问题吗？依赖模型的决策是可靠的吗？如有用户提出机票改签的诉求，模型一定能很好理解用户意图，没疑问。但：

- 它咋知当前用户符不符合退票规则？毕竟每个航空公司改签规则都不同
- 它咋知改签手续费的规定？在这样一个可能带来经济纠纷、法律风险的应用场景下，AI模型必须要知道改签规则的所有细节，并逐条确认用户信息复合规则后，才能最终作出是否改签的决策

显然，单纯依赖 AI 模型本身不能满足需求，就要用到RAG模式。通过 RAG 将机票退改签相关领域知识输入给应用和 AI 模型，让 AI 结合这些规则与要求辅助决策，增加 RAG 后的架构：

![](https://sca.aliyun.com/img/1728554016827.png)

有了RAG，应用才真正成为智能化的机票问题专家，就像一个经公司业务培训的客服代表，既能人性化与用户对话，又能根据规则引导用户行为。

### 2.3 使用Function Calling执行业务动作

AI Agent可帮应用理解用户需求并决策，但没法代替应用完成决策执行，决策执行还是要由应用自己完成，这点和传统应用无区别，不论智能化的还是预先编排好的应用，都是要由应用本身去调用函数修改数据库记录实现数据持久化。

通过 Spring AI 框架，可将模型的决策转换为对某个具体函数的调用，从而完成机票的最终改签或者退票动作，将用户数据写入数据库，即Function Calling模式。

![](https://sca.aliyun.com/img/1728554017286.png)

### 2.4 使用 Chat Memory 增加多轮对话能力

大模型是无状态的，它看到的只有当前这轮对话的内容。因此若要支持多轮对话效果，需应用每次都将之前对话上下文保留，并与最新问题一并作为 prompt 发送给模型。这时，我们可以利用 Spring AI Alibaba 提供的内置 Conversation Memory 支持，方便的维护对话上下文。

至此，让我们总结在这个智能客服平台应用使用到的

## 3 Spring AI Alibaba 核心能力

1. 基本模型对话能力，通过 Chat Model API 与通义模型交互
2. Prompt 管理能力
3. Chat Memory 聊天记忆，支持多轮对话
4. RAG、Vector Store，机票预定、改签、退票等相关规则

![](https://sca.aliyun.com/img/1728554017504.png)

## 4 使用 ChatClient 完成编码

Spring AI Alibaba 不止提供了以上原子能力抽象，还提供了高阶 “智能体” API 抽象 `ChatClient`，让我们可以非常方便的使用流式 Fluent API 把多个组件组装起来，成为一个AI Agent。

具体使用：

```java
this.chatClient = modelBuilder
        .defaultSystem("""
            您是“Funnair”航空公司的客户聊天支持代理。请以友好、乐于助人且愉快的方式来回复。
             您正在通过在线聊天系统与客户互动。
             在提供有关预订或取消预订的信息之前，您必须始终
             从用户处获取以下信息：预订号、客户姓名。
             在询问用户之前，请检查消息历史记录以获取此信息。
             在更改预订之前，您必须确保条款允许这样做。
             如果更改需要收费，您必须在继续之前征得用户同意。
             使用提供的功能获取预订详细信息、更改预订和取消预订。
             如果需要，可以调用相应函数调用完成辅助动作。
             请讲中文。
             今天的日期是 {current_date}.
          """)
        .defaultAdvisors(
            new PromptChatMemoryAdvisor(chatMemory), // Chat Memory
            new VectorStoreChatMemoryAdvisor(vectorStore)),
            new QuestionAnswerAdvisor(vectorStore, SearchRequest.defaults()), // RAG
            new LoggingAdvisor())
        .defaultFunctions("getBookingDetails", "changeBooking", "cancelBooking") // FUNCTION CALLING

        .build();
```

这样ChatClient就为我们屏蔽了所有与大模型交互的细节，只需要把ChatClient注入常规的 Spring Bean 就可以为我们的机票应用加入智能化能力了。

## 5 运行效果

![](https://sca.aliyun.com/img/1728554017887.png)

