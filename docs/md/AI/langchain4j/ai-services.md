# 07-AI服务

至此，我们一直在讨论底层组件，如 `ChatLanguageModel`、`ChatMessage`、`ChatMemory` 等。在这层工作非常灵活，让你拥有完全自由，但也要编写大量模板代码。由于大多数依赖LLM的应用程序不仅需要单个组件，还需要多组件协作（如提示词模板、聊天记忆、LLM、输出解析器、RAG 组件：嵌入模型和存储等），且往往涉及多次交互，因此协调这些组件变得更繁琐。

我们希望专注业务逻辑，而非底层实现细节。因此，LangChain4j 提供两个高层概念帮助解决这问题：AI 服务和链（Chains）。

## 1 链（Chains）（旧版）

链的概念源于 Python 版的 LangChain（在引入 LCEL 前）。其核心思想是为每个常见的用例（如聊天机器人、RAG 等）创建一个 `Chain`。链将多个底层组件结合起来，并在它们之间协调交互。主要问题是，当你需要自定义某些内容时，链显得过于僵化。LangChain4j 目前仅实现两个链：

- `ConversationalChain` 
- `ConversationalRetrievalChain`）

## 2 AI 服务

提出另一种针对 Java 的解决方案，称为 AI 服务。其目的是通过一个简单的 API 隐藏与LLM和其他组件交互的复杂性。类似 Spring Data JPA 或 Retrofit：你以声明方式定义一个带有所需

API 的接口，LangChain4j 提供一个对象（代理）来实现该接口。你可以将 AI 服务视为应用程序服务层的一个组件，提供 *AI* 服务，因此得名。

AI 服务处理最常见操作：

- 格式化传递给LLM的输入
- 解析来自LLM的输出

它们还支持一些更高级功能：

- 聊天记忆
- 工具
- RAG

AI 服务可用于构建有状态的聊天机器人，实现往返交互，也可用于每次调用 LLM 都是独立的自动化过程。

让我们先来看一个最简单的 AI 服务，然后再探讨一些更复杂的例子。

## 3 实例 - 最简单的 AI 服务

定义一个带有单个方法 `chat` 的接口，该方法接收一个 `String` 作为输入并返回一个 `String`。

```java
interface Assistant {

    String chat(String userMessage);
}
```

创建底层组件。这些组件将在 AI 服务的底层使用。只需要 `ChatLanguageModel`：

```java
ChatLanguageModel model = OpenAiChatModel.builder()
    .apiKey(System.getenv("OPENAI_API_KEY"))
    .modelName(GPT_4_O_MINI)
    .build();
```

最后，用 `AiServices` 类创建 AI 服务实例：

```java
Assistant assistant = AiServices.create(Assistant.class, model);
```

在Spring Boot 应用程序中，这可以是一个 bean，你可在需要 AI 服务的地方注入代码。

现在就可用 `Assistant`：

```java
String answer = assistant.chat("Hello");
System.out.println(answer); // Hello, how can I help you?
```

## 4 工作原理

你提供接口的 `Class` 和底层组件给 `AiServices`，`AiServices` 会创建一个实现该接口的代理对象。目前，它使用反射机制，但我们也在考虑其他替代方案。该代理对象处理所有输入和输出的转换。在这个例子中，输入是一个 `String`，但我们使用的是 `ChatLanguageModel`，它接收 `ChatMessage` 作为输入。因此，`AiService` 会自动将其转换为 `UserMessage` 并调用 `ChatLanguageModel`。由于 `chat` 方法的输出类型是 `String`，所以在 `ChatLanguageModel` 返回 `AiMessage` 后，它会被转换为 `String`，然后从 `chat` 方法返回。

## 5 在 Spring Boot 应用中使用 AI 服务

[LangChain4j Spring Boot 启动器](http://www.javaedge.cn/md/AI/langchain4j/spring-boot-integration.html) 大大简化了在 Spring Boot 应用程序中使用 AI 服务的过程。

## 6 @SystemMessage

更复杂案例。通过使用俚语强制 LLM 回复😉。这通常是通过在 `SystemMessage` 中提供指令来实现。

```java
interface Friend {

    @SystemMessage("You are a good friend of mine. Answer using slang.")
    String chat(String userMessage);
}

Friend friend = AiServices.create(Friend.class, model);

String answer = friend.chat("Hello"); // Hey! What's up?
```

添加了 `@SystemMessage` ，并指定希望使用的系统提示词模板。这会在后台转换为 `SystemMessage` 并与 `UserMessage` 一起发送给 LLM。

@SystemMessage也可从资源加载提示模板：

```java
@SystemMessage(fromResource = "my-prompt-template.txt")
```

### 系统消息提供者

系统消息还可通过系统消息提供者动态定义：

```java
Friend friend = AiServices.builder(Friend.class)
    .chatLanguageModel(model)
    .systemMessageProvider(chatMemoryId -> "You are a good friend of mine. Answer using slang.")
    .build();
```

如你所见，你可基于聊天记忆 ID（用户或对话）提供不同的系统消息。

## 7 @UserMessage

假设我们使用模型不支持系统消息或我们仅希望使用 `UserMessage` 来达到同样的效果。

```java
interface Friend {

    @UserMessage("You are a good friend of mine. Answer using slang. {{it}}")
    String chat(String userMessage);
}

Friend friend = AiServices.create(Friend.class, model);

String answer = friend.chat("Hello"); // Hey! What's shakin'?
```

我们将 `@SystemMessage` 替换为 `@UserMessage`，并指定了一个带有变量 `it` 的提示模板来引用唯一的方法参数。

@UserMessage也可以从资源加载提示模板：

```java
@UserMessage(fromResource = "my-prompt-template.txt")
```

此外，还可以通过 `@V` 注解为 `String userMessage` 分配一个自定义名称的提示模板变量：

```java
interface Friend {

    @UserMessage("You are a good friend of mine. Answer using slang. {{message}}")
    String chat(@V("message") String userMessage);
}
```

## 8 输出解析（也称为结构化输出）

如果你希望从 LLM 接收结构化输出，可将 AI 服务方法的返回类型从 `String` 更改为其他类型。目前，AI 服务支持以下返回类型：

- `String`
- `AiMessage`
- `boolean`/`Boolean`，如果你需要得到“是”或“否”的答案
- `byte`/`Byte`/`short`/`Short`/`int`/`Integer`/`BigInteger`/`long`/`Long`/`float`/`Float`/`double`/`Double`/`BigDecimal`
- `Date`/`LocalDate`/`LocalTime`/`LocalDateTime`
- `List<String>`/`Set<String>`，如果你希望以项目符号列表的形式获取答案
- 任何 `Enum`、`List<Enum>` 和 `Set<Enum>`，如果你希望对文本进行分类，例如情感、用户意图等
- 任何自定义 POJO
- `Result<T>`，如果你需要访问 `TokenUsage`、`FinishReason`、RAG 获取的来源（`Content`）以及执行的工具，除了 `T` 之外，`T` 可以是上述任何类型。例如：`Result<String>`、`Result<MyCustomPojo>`

除 `String` 或 `AiMessage` 外，AI 服务会自动在 `UserMessage` 的末尾附加指令，指示 LLM 以何种格式响应。在方法返回之前，AI 服务会将 LLM 的输出解析为所需的类型。

通过[启用日志记录](https://docs.langchain4j.dev/tutorials/logging)，你可以观察到附加的指令。

让我们看看一些例子。

### 8.1 `boolean` 作为返回类型

```java
interface SentimentAnalyzer {

    @UserMessage("Does {{it}} has a positive sentiment?")
    boolean isPositive(String text);
}

SentimentAnalyzer sentimentAnalyzer = AiServices.create(SentimentAnalyzer.class, model);

boolean positive = sentimentAnalyzer.isPositive("It's wonderful!");
// true
```

### 8.2 `Enum` 作为返回类型

```java
enum Priority {
    
    @Description("Critical issues such as payment gateway failures or security breaches.")
    CRITICAL,
    
    @Description("High-priority issues like major feature malfunctions or widespread outages.")
    HIGH,
    
    @Description("Low-priority issues such as minor bugs or cosmetic problems.")
    LOW
}

interface PriorityAnalyzer {
    
    @UserMessage("Analyze the priority of the following issue: {{it}}")
    Priority analyzePriority(String issueDescription);
}

PriorityAnalyzer priorityAnalyzer = AiServices.create(PriorityAnalyzer.class, model);

Priority priority = priorityAnalyzer.analyzePriority("The main payment gateway is down, and customers cannot process transactions.");
// CRITICAL
```

`@Description` 可选。建议在枚举名称不够自解释时使用。

### 8.3 POJO 作为返回类型

```java
class Person {

    @Description("first name of a person") // 你可以添加可选描述，以帮助 LLM 更好地理解
    String firstName;
    String lastName;
    LocalDate birthDate;
    Address address;
}

class Address {
    String street;
    Integer streetNumber;
    String city;
}

interface PersonExtractor {

    @UserMessage("Extract information about a person from {{it}}")
    Person extractPersonFrom(String text);
}

PersonExtractor personExtractor = AiServices.create(PersonExtractor.class, model);

String text = """
            In 1968, amidst the fading echoes of Independence Day,
            a child named John arrived under the calm evening sky.
            This newborn, bearing the surname Doe, marked the start of a new journey.
            He was welcomed into the world at 345 Whispering Pines Avenue
            a quaint street nestled in the heart of Springfield
            an abode that echoed with the gentle hum of suburban dreams and aspirations.
            """;

Person person = personExtractor.extractPersonFrom(text);

System.out.println(person); // Person { firstName = "John", lastName = "Doe", birthDate = 1968-07-04, address = Address { ... } }
```

## 9 JSON 模式

提取自定义 POJO（实际上是 JSON，然后解析为 POJO）时，建议在模型配置中启用“JSON 模式”。这样，LLM 将被强制以有效的 JSON 进行响应。

### 9.1 注意

JSON 模式和工具/函数调用是相似的功能，但有不同的 API 并用于不同的目的。

JSON 模式适用于当你*始终*需要 LLM 以结构化格式（有效 JSON）进行响应的情况。此外，通常不需要状态/记忆，因此与 LLM 的每次交互都是独立的。例如，你可能希望从文本中提取信息，如该文本中提到的人物列表，或者将自由格式的产品评论转换为结构化形式，包含 `String productName`、`Sentiment sentiment`、`List<String> claimedProblems` 等字段。

另一方面，当 LLM 需要执行某些动作时（例如，查阅数据库、搜索网络、取消用户的预订等），工具/函数调用会派上用场。在这种情况下，会向 LLM 提供工具列表及其预期的 JSON 架构，LLM 自主决定是否调用其中的任何工具以满足用户的请求。

以前，函数调用常用于结构化数据提取，但现在我们有了 JSON 模式功能，更适合此目的。

### 9.2 启用 JSON 模式

#### OpenAI：

对于支持[结构化输出](https://openai.com/index/introducing-structured-outputs-in-the-api/)的新模型如gpt-4o-mini/gpt-4o-2024-08-06：

```java
OpenAiChatModel.builder()
    ...
    .responseFormat("json_schema")
    .strictJsonSchema(true)
    .build();
```

详细信息：https://docs.langchain4j.dev/integrations/language-models/open-ai#structured-outputs

对于旧模型（如 gpt-3.5-turbo、gpt-4）：

```java
OpenAiChatModel.builder()
    ...
    .responseFormat("json_object")
    .build();
```

#### Azure OpenAI：

```java
AzureOpenAiChatModel.builder()
    ...
    .responseFormat(new ChatCompletionsJsonResponseFormat())
    .build();
```

#### Vertex AI Gemini：

```java
VertexAiGeminiChatModel.builder()
    ...
    .responseMimeType("application/json")
    .build();
```

#### Google AI Gemini：

```java
GoogleAiGeminiChatModel.builder()
    ...
    .responseMimeType("application/json")
    .build();
```

#### Ollama:

```java
OllamaChatModel.builder()
    ...
    .format("json")
    .build();
```

#### 针对其他模型提供商

如果底层模型提供商不支持 JSON 模式，提示词工程是你最好的选择。同时，尝试降低 `temperature` 以提高确定性。

[更多示例](https://github.com/Java-Edge/langchain4j-examples/blob/main/other-examples/src/main/java/OtherServiceExamples.java)

## 10 流式传输

当用 `TokenStream` 返回类型时，AI 服务可逐个 token 地[流式传输响应](https://docs.langchain4j.dev/tutorials/response-streaming)：

```java
interface Assistant {

    TokenStream chat(String message);
}

StreamingChatLanguageModel model = OpenAiStreamingChatModel.builder()
    .apiKey(System.getenv("OPENAI_API_KEY"))
    .modelName(GPT_4_O_MINI)
    .build();

Assistant assistant = AiServices.create(Assistant.class, model);

TokenStream tokenStream = assistant.chat("Tell me a joke");

tokenStream.onNext(System.out::println)
    .onComplete(System.out::println)
    .onError(Throwable::printStackTrace)
    .start();
```

[流式传输示例](https://github.com/Java-Edge/langchain4j-examples/blob/main/other-examples/src/main/java/ServiceWithStreamingExample.java)

## 11 聊天记忆

AI 服务可用[聊天记忆](http://www.javaedge.cn/md/AI/langchain4j/chat-memory.html)来“记住”之前的互动：

```java
Assistant assistant = AiServices.builder(Assistant.class)
    .chatLanguageModel(model)
    .chatMemory(MessageWindowChatMemory.withMaxMessages(10))
    .build();
```

在这种情况下，相同的 `ChatMemory` 实例将用于 AI 服务的所有调用。但是，如果你有多个用户，这种方法将不起作用，因为每个用户都需要自己的 `ChatMemory` 实例来维护其个人对话。

解决方案是使用 `ChatMemoryProvider`：

```java
interface Assistant  {
    String chat(@MemoryId int memoryId, @UserMessage String message);
}

Assistant assistant = AiServices.builder(Assistant.class)
    .chatLanguageModel(model)
    .chatMemoryProvider(memoryId -> MessageWindowChatMemory.withMaxMessages(10))
    .build();

String answerToKlaus = assistant.chat(1, "Hello, my name is Klaus");
String answerToFrancine = assistant.chat(2, "Hello, my name is Francine");
```

在这种情况下，`ChatMemoryProvider` 将为每个 memory ID 提供两个不同的 `ChatMemory` 实例。

若 AI 服务方法没有使用 `@MemoryId` 注解的参数，`ChatMemoryProvider` 中的 `memoryId` 默认值将是字符串 `"default"`。

- [单一聊天记忆示例](https://github.com/Java-Edge/langchain4j-examples/blob/main/other-examples/src/main/java/ServiceWithMemoryExample.java)
- [为每个用户提供聊天记忆的示例](https://github.com/Java-Edge/langchain4j-examples/blob/main/other-examples/src/main/java/ServiceWithMemoryForEachUserExample.java)
- [单一持久聊天记忆示例](https://github.com/Java-Edge/langchain4j-examples/blob/main/other-examples/src/main/java/ServiceWithPersistentMemoryExample.java)
- [为每个用户提供持久聊天记忆的示例](https://github.com/Java-Edge/langchain4j-examples/blob/main/other-examples/src/main/java/ServiceWithPersistentMemoryForEachUserExample.java)

## 12 工具（函数调用）

AI 服务可配置 LLM 可使用的工具：

```java
class Tools {
    
    @Tool
    int add(int a, int b) {
        return a + b;
    }

    @Tool
    int multiply(int a, int b) {
        return a * b;
    }
}

Assistant assistant = AiServices.builder(Assistant.class)
    .chatLanguageModel(model)
    .tools(new Tools())
    .build();

String answer = assistant.chat("What is 1+2 and 3*4?");
```

在这种情况下，LLM 将在提供答案之前执行 `add(1, 2)` 和 `multiply(3, 4)` 方法。这些工具的调用使 LLM 能够通过计算来提供更加准确的回答。

有关工具的更多详细信息请参见[此处](https://docs.langchain4j.dev/tutorials/tools#high-level-tool-api)。

## 13 RAG

AI 服务可配置 `ContentRetriever` 以启用 RAG：

```java
EmbeddingStore embeddingStore  = ...
EmbeddingModel embeddingModel = ...

ContentRetriever contentRetriever = new EmbeddingStoreContentRetriever(embeddingStore, embeddingModel);

Assistant assistant = AiServices.builder(Assistant.class)
    .chatLanguageModel(model)
    .contentRetriever(contentRetriever)
    .build();
```

配置 `RetrievalAugmentor` 提供了更多的灵活性，能够启用高级的 RAG 功能，如查询转换、重新排序等：

```java
RetrievalAugmentor retrievalAugmentor = DefaultRetrievalAugmentor.builder()
        .queryTransformer(...)
        .queryRouter(...)
        .contentAggregator(...)
        .contentInjector(...)
        .executor(...)
        .build();

Assistant assistant = AiServices.builder(Assistant.class)
    .chatLanguageModel(model)
    .retrievalAugmentor(retrievalAugmentor)
    .build();
```

有关 RAG 的更多详细信息请参见[此处](https://docs.langchain4j.dev/tutorials/rag)。

更多 RAG 示例请参见[此处](https://github.com/langchain4j/langchain4j-examples/tree/main/rag-examples/src/main/java)。

## 14 自动审核

[示例](https://github.com/langchain4j/langchain4j-examples/blob/main/other-examples/src/main/java/ServiceWithAutoModerationExample.java)

## 15 链接多个 AI 服务

随着 LLM 驱动的应用逻辑变得越来越复杂，将其分解为较小的部分变得至关重要，这是软件开发中的常见做法。

例如，将大量指令塞进系统提示词中以应对所有可能的场景容易出错且效率低下。如果指令过多，LLM 可能会忽略其中一些。此外，指令的顺序也很重要，使得这一过程更加具有挑战性。

这个原则同样适用于工具、RAG 和模型参数，例如 `temperature`、`maxTokens` 等。

你的聊天机器人可能并不总是需要知道你所有的工具。例如，当用户只是向机器人打招呼或说再见时，让 LLM 访问数十个或数百个工具是昂贵的，有时甚至是危险的（每个包含在 LLM 调用中的工具都会消耗大量的 tokens），并且可能导致意外结果（LLM 可能会生成虚假信息或被引导使用意外的工具输入）。

关于 RAG：类似地，有时需要为 LLM 提供一些上下文，但并不总是如此，因为这会增加额外的成本（更多上下文 = 更多 tokens），并且会增加响应时间（更多上下文 = 更高延迟）。

关于模型参数：在某些情况下，你可能需要 LLM 高度确定的行为，因此你会设置较低的 `temperature`。在其他情况下，你可能会选择较高的 `temperature`，等等。

重点是，较小且更具体的组件更容易开发、测试、维护和理解，并且成本更低。

另一个要考虑的方面涉及两个极端：

- 你是否希望应用程序高度确定的行为，应用程序控制流程，而 LLM 只是其中的一个组件？
- 或者你希望 LLM 拥有完全自主权并驱动应用程序？

或者根据情况，两者的结合？当你将应用程序分解为较小且更易于管理的部分时，所有这些选项都是可能的。

AI 服务可以像常规（确定性）软件组件一样使用并与之结合：

- 你可以一个接一个地调用多个 AI 服务（即链式调用）。
- 你可以使用确定性和 LLM 驱动的 `if`/`else` 语句（AI 服务可以返回 `boolean`）。
- 你可以使用确定性和 LLM 驱动的 `switch` 语句（AI 服务可以返回 `enum`）。
- 你可以使用确定性和 LLM 驱动的 `for`/`while` 循环（AI 服务可以返回 `int` 和其他数值类型）。
- 你可以在单元测试中对 AI 服务进行模拟测试（因为它是一个接口）。
- 你可以单独对每个 AI 服务进行集成测试。
- 你可以单独评估并找到每个 AI 服务的最佳参数。
- 等等

让我们来看一个简单的例子。我想为我的公司构建一个聊天机器人。如果用户向机器人打招呼，我希望它回应预设的问候语，而不是依赖 LLM 生成问候语。如果用户提出问题，我希望 LLM 使用公司的内部知识库（即 RAG）生成回复。

这是如何将此任务分解为两个独立的 AI 服务的：

```java
interface GreetingExpert {

    @UserMessage("Is the following text a greeting? Text: {{it}}")
    boolean isGreeting(String text);
}

interface ChatBot {

    @SystemMessage("You are a polite chatbot of a company called Miles of Smiles.")
    String reply(String userMessage);
}

class MilesOfSmiles {

    private final GreetingExpert greetingExpert;
    private final ChatBot chatBot;
    
    ...
    
    public String handle(String userMessage) {
        if (greetingExpert.isGreeting(userMessage)) {
            return "Greetings from Miles of Smiles! How can I make your day better?";
        } else {
            return chatBot.reply(userMessage);
        }
    }
}

GreetingExpert greetingExpert = AiServices.create(GreetingExpert.class, llama2);

ChatBot chatBot = AiServices.builder(ChatBot.class)
    .chatLanguageModel(gpt4)
    .contentRetriever(milesOfSmilesContentRetriever)
    .build();

MilesOfSmiles milesOfSmiles = new MilesOfSmiles(greetingExpert, chatBot);

String greeting = milesOfSmiles.handle("Hello");
System.out.println(greeting); // Greetings from Miles of Smiles! How can I make your day better?

String answer = milesOfSmiles.handle("Which services do you provide?");
System.out.println(answer); // At Miles of Smiles, we provide a wide range of services ...
```

请注意，我们使用了较便宜的 Llama2 来完成识别问候语的简单任务，并使用了带有内容检索器（RAG）的更昂贵的 GPT-4 来处理更复杂的任务。

这是一个非常简单且有些天真的示例，但希望它能够展示这个想法。

现在，可模拟 `GreetingExpert` 和 `ChatBot`，并在隔离环境中测试 `MilesOfSmiles`。此外，我可以分别对 `GreetingExpert` 和 `ChatBot` 进行集成测试。我可以分别评估它们，并找到每个子任务的最优参数，或者从长远来看，甚至可以为每个特定子任务微调一个小型专用模型。

## 16 相关教程

- [LangChain4j AiServices 教程](https://www.sivalabs.in/langchain4j-ai-services-tutorial/) by [Siva](