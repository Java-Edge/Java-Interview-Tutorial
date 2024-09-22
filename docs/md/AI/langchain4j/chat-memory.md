# 05-聊天内存

## 0  前言

手动维护和管理`ChatMessage`比较繁琐。因此，LangChain4j 提供了`ChatMemory`抽象以及多个开箱即用的实现：

- `ChatMemory`可以作为一个独立的底层组件使用
- 也可作为类似[AI服务](/tutorials/ai-services)等高级组件的一部分使用

`ChatMemory`作为`ChatMessage`的容器（基于`List`），并提供以下附加功能：

- 驱逐策略
- 持久化
- 对`SystemMessage`的特殊处理
- 对[工具](/tutorials/tools)消息的特殊处理

## 1 内存 V.S 历史记录

“内存”和“历史记录”相似但有区别：

- 历史记录会完整保留用户和 AI 之间的**所有**消息。历史记录是用户在界面中看到的内容，表示实际发生的对话。
- 内存则保存**部分信息**，这些信息会提供给 LLM，使其看起来像是“记住”了对话内容。  内存与历史记录非常不同，根据使用的内存算法，它可以以多种方式修改历史记录：  驱逐某些消息，总结多条消息，提取独立消息的摘要，去除不重要的细节，注入额外信息（如用于 RAG 的信息）或指令（如用于结构化输出的指令）到消息中等。

LangChain4j 当前仅提供“内存”，而非“历史记录”。如果您需要保留整个历史记录，请手动进行保存。

## 2 驱逐策略

### 2.1必要性

#### 适应 LLM 的上下文窗口

LLM 能一次处理的 token 数是有限。在某些情况下，对话可能会超出这个限制，此时需要驱逐部分消息。  通常，最早的消息会被驱逐，但如果需要，也可以实现更复杂的算法。

#### 控制成本

每个 token 都有成本，因此每次调用 LLM 的成本会逐渐增加。驱逐不必要的消息可以降低成本。

#### 控制延迟

发送给 LLM 的 token 越多，处理时间越长。



目前，LangChain4j 提供两种开箱即用的

### 2.2 实现

#### 简单的`MessageWindowChatMemory`

作为滑动窗口保留最近的`N`条消息，并驱逐不再符合条件的较旧消息。  由于每条消息包含的 token 数可能不同，`MessageWindowChatMemory` 主要用于快速原型开发。

#### 复杂的`TokenWindowChatMemory`

也是滑动窗口，但重点是保留最近的`N`个**token**，并根据需要驱逐较旧的消息。  消息是不可分割的。如果某条消息不符合条件，它将被完全驱逐。  `TokenWindowChatMemory` 需要一个`Tokenizer`来统计每条`ChatMessage`中的 token 数。

## 3 持久化

默认情况下，`ChatMemory`的实现将`ChatMessage`存储在内存中。如需持久化，可以实现自定义的`ChatMemoryStore`，  将`ChatMessage`存储在您选择的任何持久存储中：

```java
class PersistentChatMemoryStore implements ChatMemoryStore {

        @Override
        public List<ChatMessage> getMessages(Object memoryId) {
          // TODO: 实现通过内存 ID 从持久存储中获取所有消息的功能。
          // 可以使用 ChatMessageDeserializer.messageFromJson(String) 和 
          // ChatMessageDeserializer.messagesFromJson(String) 来轻松从 JSON 反序列化聊天消息。
        }

        @Override
        public void updateMessages(Object memoryId, List<ChatMessage> messages) {
            // TODO: 实现通过内存 ID 更新持久存储中的所有消息。
            // 可以使用 ChatMessageSerializer.messageToJson(ChatMessage) 和 
            // ChatMessageSerializer.messagesToJson(List<ChatMessage>) 来轻松将聊天消息序列化为 JSON。
        }

        @Override
        public void deleteMessages(Object memoryId) {
          // TODO: 实现通过内存 ID 删除持久存储中所有消息的功能。
        }
    }

ChatMemory chatMemory = MessageWindowChatMemory.builder()
        .id("12345")
        .maxMessages(10)
        .chatMemoryStore(new PersistentChatMemoryStore())
        .build();
```

每当新的`ChatMessage`添加到`ChatMemory`中时，`updateMessages()`方法就会被调用。  通常在每次与 LLM 交互的过程中，这个方法会被调用两次：  

- 一次是当添加新的`UserMessage`时
- 另一次是当添加新的`AiMessage`时。 

`updateMessages()`方法需要更新与给定内存 ID 相关联的所有消息。   可以将`ChatMessage`分别存储（例如，每条消息一个记录/行/对象），   也可以将其一起存储（例如，整个`ChatMemory`作为一个记录/行/对象）。

> 从`ChatMemory`中驱逐的消息也将从`ChatMemoryStore`中驱逐。  当某条消息被驱逐时，`updateMessages()`方法将被调用，  并且传递的消息列表不包含已驱逐的消息。

每当`ChatMemory`的用户请求所有消息时，都会调用`getMessages()`方法。  通常在每次与 LLM 交互时调用一次。  `Object memoryId`参数的值对应于创建`ChatMemory`时指定的`id`，  
它可以用于区分多个用户和/或对话。  `getMessages()`方法应该返回与给定内存 ID 相关联的所有消息。

每当调用`ChatMemory.clear()`时，都会调用`deleteMessages()`方法。  如果不使用此功能，可以将此方法留空。

## 4 SystemMessage的特殊处理

一种特殊的消息类型，因此它的处理方式与其他消息类型不同：

- 一旦添加，`SystemMessage`将始终保留。
- 一次只能保存一个`SystemMessage`。
- 如果添加了相同内容的`SystemMessage`，则会被忽略。
- 如果添加了不同内容的`SystemMessage`，它将替换之前的消息。

## 5 工具消息的特殊处理

如果包含`ToolExecutionRequest`的`AiMessage`被驱逐，  后续的孤立`ToolExecutionResultMessage`也会自动被驱逐，  以避免某些 LLM 提供商（如 OpenAI）不允许在请求中发送孤立的`ToolExecutionResultMessage`的问题。

## 6 示例

- 使用`AiServices`：
  - [聊天内存](https://github.com/langchain4j/langchain4j-examples/blob/main/other-examples/src/main/java/ServiceWithMemoryExample.java)
  - [为每个用户提供单独的聊天内存](https://github.com/langchain4j/langchain4j-examples/blob/main/other-examples/src/main/java/ServiceWithMemoryForEachUserExample.java)
  - [持久化聊天内存](https://github.com/langchain4j/langchain4j-examples/blob/main/other-examples/src/main/java/ServiceWithPersistentMemoryExample.java)
  - [为每个用户提供持久化聊天内存](https://github.com/langchain4j/langchain4j-examples/blob/main/other-examples/src/main/java/ServiceWithPersistentMemoryForEachUserExample.java)
- 使用传统`Chain`s：
  - [使用ConversationalChain的聊天内存](https://github.com/langchain4j/langchain4j-examples/blob/main/other-examples/src/main/java/ChatMemoryExamples.java)
  - [使用ConversationalRetrievalChain的聊天内存](https://github.com/langchain4j/langchain4j-examples/blob/main/other-examples/src/main/java/ChatWithDocumentsExamples.java)

## 7 相关教程

- [使用LangChain4j ChatMemory实现生成式AI对话](https://www.sivalabs.in/generative-ai-conversations-using-langchain4j-chat-memory/)  

参考：https://www.sivalabs.in/