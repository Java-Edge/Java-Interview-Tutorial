# 04-聊天和语言模型

本文描述了底层的大语言模型（LLM）API。高级的LLM API，请参见[AI服务](/tutorials/ai-services)。

## 1 LLM API的类型

### 1.1 LanguageModel

非常简单—，接受一个`String`作为输入，并返回一个`String`作为输出。

该API现正逐渐被聊天API（第二种API类型）取代。

### 1.2 ChatLanguageModel

这种API接受一或多个`ChatMessage`作为输入，并返回一个`AiMessage`作为输出。 `ChatMessage`通常包含文本，但有些LLM还支持混合文本和`Image`的输入。如OpenAI的`gpt-4o-mini`和Google的`gemini-1.5-pro`都属于这种。

LangChain4j中，将不再扩展对`LanguageModel`的支持，因此所有新功能采用`ChatLanguageModel` API。

`ChatLanguageModel`是LangChain4j中的底层API，提供了最大的功能和灵活性。还有高级API（如`Chain`和`AiServices`）。

除了`ChatLanguageModel`和`LanguageModel`，LangChain4j还支持以下类型的模型：

- `EmbeddingModel`：可将文本转换为`Embedding`。
- `ImageModel`：可生成和编辑`Image`。
- `ModerationModel`：可检查文本中是否包含有害内容。
- `ScoringModel`：可根据查询对多段文本进行评分（或排名），以确定每段文本与查询的相关性。这在RAG（检索增强生成）中非常有用。

## 2 ChatLanguageModel API

```java
public interface ChatLanguageModel {

    String generate(String userMessage);
    
    ...
}
```

`generate`方法接受一个`String`作为输入并返回一个`String`作为输出，类似于`LanguageModel`。这是一个便捷方法，可快速使用它，无需将`String`包装在`UserMessage`中。

但这才是实际的聊天API：

```java
...

Response<AiMessage> generate(ChatMessage... messages);

Response<AiMessage> generate(List<ChatMessage> messages);

...
```

这些`generate`接受一或多个`ChatMessage`作为输入。`ChatMessage`是一个表示聊天消息的基础接口。

## 3 ChatMessage的类型

目前有四种聊天消息类型，每种消息对应不同的“来源”：

- `UserMessage`：这是来自用户的消息。用户可以是您的应用程序的最终用户（人类）或应用程序本身。 
  根据LLM支持的模态，`UserMessage`可以包含仅文本（`String`）或文本和/或图像（`Image`）。
- `AiMessage`：这是由AI生成的消息，通常是对`UserMessage`的响应。 
  如您所见，`generate`方法返回一个包含在`Response`中的`AiMessage`。 
  `AiMessage`可以包含文本响应（`String`）或请求执行工具（`ToolExecutionRequest`）。稍后我们会深入探讨工具的使用。
- `ToolExecutionResultMessage`：这是`ToolExecutionRequest`的结果。我们稍后会详细讲解。
- `SystemMessage`：这是系统的消息。通常，您作为开发者应定义此消息的内容。 
  您可以在此编写关于LLM在对话中的角色、应如何表现、以何种风格回答等指令。 
  LLM被训练得更加关注`SystemMessage`，因此要小心，最好不要让最终用户随意定义或注入一些输入到`SystemMessage`中。 
  它通常位于对话的开始。

### 如何在对话中组合它们？

最简单的场景，可在`generate`方法中提供一个`UserMessage`实例。  这与第一个版本的`generate`方法类似，它接受一个`String`作为输入。 主要区别在于它现在返回的不是`String`，而是`Response<AiMessage>`。 

`Response`是一个包装了内容（负载）的对象，经常看到它作为`*Model`类的返回类型。  除了内容（在这种情况下是`AiMessage`），`Response`还包含生成的元信息：

- `TokenUsage`，统计了输入（提供给`generate`方法的所有`ChatMessage`）中包含的token数及输出（`AiMessage`）中生成的token数，并给出总数（输入 + 输出）。需要这些信息来计算每次调用LLM的成本
- `FinishReason`，枚举类型，表示生成停止的各种原因。通常，如果LLM自行决定停止生成，则原因会是`FinishReason.STOP`

### 创建UserMessage

`有多种方式，取决于内容。最简单的`new UserMessage("Hi")`或`UserMessage.from("Hi")`。

## 4 多个ChatMessage

为啥要提供多个`ChatMessage`作为输入，而不仅是一个？ 因为LLM本质上是无状态的，这意味着它们不会维护对话的状态。 因此，如果你想支持多轮对话，则需要自己管理对话的状态。

假设想构建一个聊天机器人。想象一下用户和聊天机器人（AI）之间的简单多轮对话：

- 用户：你好，我叫JavaEdge
- AI：你好JavaEdge，我能帮你什么？
- 用户：我叫什么名字？
- AI：JavaEdge

这就是与`ChatLanguageModel`交互的样子：

```java
UserMessage firstUserMessage = UserMessage.from("Hello, my name is JavaEdge");
AiMessage firstAiMessage = model.generate(firstUserMessage).content(); // JavaEdge，我能帮你什么？
UserMessage secondUserMessage = UserMessage.from("What is my name?");
AiMessage secondAiMessage = model.generate(firstUserMessage, firstAiMessage, secondUserMessage).content(); // JavaEdge
```

如你所见，在第二次调用`generate`方法时，不仅提供了`secondUserMessage`，还提供了对话中的前几条消息。

手动维护和管理这些消息比较繁琐，因此引入`ChatMemory`。