# 03-如何在Spring Boot中无缝集成LangChain4j，玩转AI大模型！

## 0 前言

LangChain4j 提供了用于以下功能的 [Spring Boot 启动器](https://github.com/langchain4j/langchain4j-spring)：

- 常用集成
- 声明式 [AI 服务](https://docs.langchain4j.dev/tutorials/ai-services)

## 1 常用集成的 Spring Boot starters

Spring Boot 启动器帮助通过属性创建和配置 [语言模型](https://docs.langchain4j.dev/category/language-models)、[嵌入模型](https://docs.langchain4j.dev/category/embedding-models)、[嵌入存储](https://docs.langchain4j.dev/category/embedding-stores) 和其他核心 LangChain4j 组件。

要使用 Spring Boot 启动器，请导入相应的依赖包。

Spring Boot 启动器依赖包的命名规范是：`langchain4j-{integration-name}-spring-boot-starter`。

如对于 OpenAI（`langchain4j-open-ai`），依赖包名称为 `langchain4j-open-ai-spring-boot-starter`：

```xml
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-open-ai-spring-boot-starter</artifactId>
    <version>0.34.0</version>
</dependency>
```

然后，可在 `application.properties` 文件中配置模型参数：

```text
langchain4j.open-ai.chat-model.api-key=${OPENAI_API_KEY}
langchain4j.open-ai.chat-model.model-name=gpt-4o
langchain4j.open-ai.chat-model.log-requests=true
langchain4j.open-ai.chat-model.log-responses=true
...
```

此时，将自动创建一个 `OpenAiChatModel` 实例（`ChatLanguageModel` 的实现），并且可通过自动注入在需要的地方使用它：

```java
@RestController
public class ChatController {

    ChatLanguageModel chatLanguageModel;

    public ChatController(ChatLanguageModel chatLanguageModel) {
        this.chatLanguageModel = chatLanguageModel;
    }

    @GetMapping("/chat")
    public String model(@RequestParam(value = "message", defaultValue = "Hello") String message) {
        return chatLanguageModel.generate(message);
    }
}
```

如需一个 `StreamingChatLanguageModel` 实例，使用 `streaming-chat-model` 代替 `chat-model` 属性：

```text
langchain4j.open-ai.streaming-chat-model.api-key=${OPENAI_API_KEY}
...
```

## 2 声明式 AI 服务的 Spring Boot 启动器

LangChain4j 提供一个 Spring Boot 启动器，用于自动配置 [AI 服务](https://docs.langchain4j.dev/tutorials/ai-services)、[RAG](https://docs.langchain4j.dev/tutorials/rag)、[工具](https://docs.langchain4j.dev/tutorials/tools) 等功能。

假设您已经导入了某个集成启动器（见上文），然后导入 `langchain4j-spring-boot-starter`：

```xml
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-spring-boot-starter</artifactId>
    <version>0.34.0</version>
</dependency>
```

现在，可定义 AI 服务接口，并使用 `@AiService` 注解：

```java
@AiService
interface Assistant {

    @SystemMessage("You are a polite assistant")
    String chat(String userMessage);
}
```

可把它看作一个带有 AI 功能的标准 Spring Boot `@Service`。

当应用程序启动时，LangChain4j 启动器将扫描类路径并找到所有带有 `@AiService` 注解的接口。对于每个找到的 AI 服务，它将使用应用程序上下文中的所有 LangChain4j 组件创建此接口的实现，并将其注册为一个 bean，因此您可以在需要的地方进行自动注入：

```java
@RestController
class AssistantController {

    @Autowired
    Assistant assistant;

    @GetMapping("/chat")
    public String chat(String message) {
        return assistant.chat(message);
    }
}
```

更多细节请见 [这里](https://github.com/langchain4j/langchain4j-spring/blob/main/langchain4j-spring-boot-starter/src/main/java/dev/langchain4j/service/spring/AiService.java)。

## 3 支持的版本

LangChain4j 的 Spring Boot 集成需要 Java 17 和 Spring Boot 3.2。

## 4 示例

- [低级 Spring Boot 示例](https://github.com/langchain4j/langchain4j-examples/blob/main/spring-boot-example/src/main/java/dev/langchain4j/example/lowlevel/ChatLanguageModelController.java) 使用 [ChatLanguageModel API](https://docs.langchain4j.dev/tutorials/chat-and-language-models)

- [高级 Spring Boot 示例](https://github.com/langchain4j/langchain4j-examples/blob/main/spring-boot-example/src/main/java/dev/langchain4j/example/aiservice/AssistantController.java) 使用 [AI 服务](https://docs.langchain4j.dev/tutorials/ai-services)

### 使用 Spring Boot 的客户支持代理示例

从官网拉下代码后，直接修改配置文件中的 api-key 如下（仅做本地演示用）：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/568682a48a55957e1f886146495fc512.png)

启动CustomerSupportAgentApplication应用后，直接在控制台交互：