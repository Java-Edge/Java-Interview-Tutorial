# 08-使用LangChain4J实现Agent与Tool调用

一些LLM除了生成文本，还可触发操作。

> 所有支持tools的LLMs可在[此处](http://www.javaedge.cn/md/AI/langchain4j/01-intro.html#:~:text=%E4%B8%BB%E6%B5%81%20LLM%20%E6%8F%90%E4%BE%9B-,%E5%95%86,-Provider)找到（参见“Tools”栏）。

有一个被称为“工具（tools）”或“函数调用（function calling）”的概念。它允许LLM在必要时调用一或多个由开发者定义的工具。工具可以是任何东西：网页搜索、外部API调用、或执行一段特定代码等。LLM本身无法实际调用这些工具；它们会在响应中表达出调用某个工具的意图（而不是直接生成文本）。我们开发者，则需要根据提供的参数来执行这些工具并报告工具执行结果。

如我们知道LLM本身并不擅长数学运算。若你的应用场景涉及偶尔的数学计算，你可能希望为LLM提供一个“math tool”。通过在请求中声明一个或多个工具，LLM可以在认为适合时调用其中一个。如遇到数学问题并拥有一组数学工具时，LLM可能会决定首先调用其中的一个来正确回答问题。

## 1 有无工具时的效果

### 1.1 没有工具的消息示例

```text
Request:
- messages:
    - UserMessage:
        - text: What is the square root of 475695037565?

Response:
- AiMessage:
    - text: The square root of 475695037565 is approximately 689710.
```

接近正确，但不完全对。

### 1.2 使用以下工具的消息示例



```java
@Tool("Sums 2 given numbers")
public double sum(double a, double b) {
    return a + b;
}

@Tool("Returns a square root of a given number")
public double squareRoot(double x) {
    return Math.sqrt(x);
}
```

```text
Request 1:
- messages:
    - UserMessage:
        - text: What is the square root of 475695037565?
- tools:
    - sum(double a, double b): Sums 2 given numbers
    - squareRoot(double x): Returns a square root of a given number

Response 1:
- AiMessage:
    - toolExecutionRequests:
        - squareRoot(475695037565)


... here we are executing the squareRoot method with the "475695037565" argument and getting "689706.486532" as a result ...


Request 2:
- messages:
    - UserMessage:
        - text: What is the square root of 475695037565?
    - AiMessage:
        - toolExecutionRequests:
            - squareRoot(475695037565)
    - ToolExecutionResultMessage:
        - text: 689706.486532

Response 2:
- AiMessage:
    - text: The square root of 475695037565 is 689706.486532.
```

如你所见，当LLM拥有工具时，它可在适当时决定调用其中的一个。

这是一个非常强大的功能。这简单例子，我们给LLM提供原始的数学工具，但可想象如提供如`googleSearch`和`sendEmail`工具，然后提供一个查询“我的朋友想知道AI领域的最新消息。请将简短的总结发送到[friend@email.com](mailto:friend@email.com)”，那它可用`googleSearch`工具找到最新消息，然后总结并通过`sendEmail`工具发送总结。

### 经验法则

为了增加LLM调用正确工具和参数的几率，我们应该提供清晰且明确的：

- 工具名称
- 工具的功能描述以及何时使用
- 每个工具参数的描述

一个好的经验法则是：如果人类能理解工具的用途和如何使用，那么LLM也能理解。



LLM被专门微调，以检测何时调用工具以及如何调用它们。某些模型甚至可以一次调用多个工具，如[OpenAI](https://platform.openai.com/docs/guides/function-calling/parallel-function-calling)。

> 注意，工具/函数调用与[JSON模式](http://www.javaedge.cn/md/AI/langchain4j/ai-services.html#_9-json-%E6%A8%A1%E5%BC%8F)不同。

## 2 两个抽象层次

LangChain4j 提供两个使用工具的抽象层：

- 底层，使用 `ChatLanguageModel` API
- 高级，使用[AI服务](http://www.javaedge.cn/md/AI/langchain4j/ai-services.html)和`@Tool`注解的Java方法

## 3 底层工具API

### 3.1 generate

可用`ChatLanguageModel#generate(List<ChatMessage>, List<ToolSpecification>)`：

```java
/**
  * 根据消息列表和工具规范列表从模型生成响应。响应可以是文本消息，也可以是执行指定工具之一的请求。通常，该列表包含按以下顺序排列的消息：System (optional) - User - AI - User - AI - User ...
  * messages – 消息列表
  * toolSpecifications – 允许模型执行的工具列表。该模型自主决定是否使用这些工具中的任何一个
  * return：模型生成的响应
  * AiMessage 可以包含文本响应或执行其中一个工具的请求。
  */
default Response<AiMessage> generate(List<ChatMessage> messages, List<ToolSpecification> toolSpecifications) {
    throw new IllegalArgumentException("Tools are currently not supported by this model");
}
```

类似方法也存于`StreamingChatLanguageModel`。

### 3.2 ToolSpecification

```java
package dev.langchain4j.agent.tool;

// 包含工具所有信息
public class ToolSpecification {
    // 工具的`名称`
    private final String name;
    // 工具的`描述`
    private final String description;
    // 工具的`参数`及其描述
    private final ToolParameters parameters;
```

推荐尽可能提供关于工具的所有信息：清晰的名称、详尽的描述和每个参数的描述等。

#### 3.2.1 创建ToolSpecification

##### ① 手动

```java
ToolSpecification toolSpecification = ToolSpecification.builder()
    .name("getWeather")
    .description("返回指定城市的天气预报")
    .addParameter("city", type("string"), description("应返回天气预报的城市"))
    .addParameter("temperatureUnit", enums(TemperatureUnit.class)) // 枚举 TemperatureUnit { 摄氏, 华氏 }
    .build();
```

##### ② 使用辅助方法

- `ToolSpecifications.toolSpecificationsFrom(Class)`
- `ToolSpecifications.toolSpecificationsFrom(Object)`
- `ToolSpecifications.toolSpecificationFrom(Method)`

```java
class WeatherTools { 
  
    @Tool("Returns the weather forecast for a given city")
    String getWeather(
            @P("The city for which the weather forecast should be returned") String city,
            TemperatureUnit temperatureUnit
    ) {
        ...
    }
}

List<ToolSpecification> toolSpecifications = ToolSpecifications.toolSpecificationsFrom(WeatherTools.class);
```

一旦你拥有`List<ToolSpecification>`，可调用模型：

```java
UserMessage userMessage = UserMessage.from("伦敦明天的天气如何？");
Response<AiMessage> response = model.generate(List.of(userMessage), toolSpecifications);
AiMessage aiMessage = response.content();
```

若LLM决定调用工具，返回的`AiMessage`将包含`toolExecutionRequests`字段中的数据。此时，`AiMessage.hasToolExecutionRequests()`将返回`true`。根据LLM不同，它可包含一或多个`ToolExecutionRequest`对象（某些LLM支持并行调用多个工具）。

每个`ToolExecutionRequest`应包含：

```java
public class ToolExecutionRequest {
  	// 工具调用的`id`（某些LLM不提供）
    private final String id;
  	// 要调用的工具名称，例如：`getWeather`
    private final String name;
  	// 工具的`参数`，例如：`{ "city": "London", "temperatureUnit": "CELSIUS" }`
    private final String arguments;
```

你要用`ToolExecutionRequest`中的信息手动执行工具。

如希望将工具执行的结果发回LLM，你要为每个`ToolExecutionRequest`创建一个`ToolExecutionResultMessage`并与之前的所有消息一起发送：

```java
String result = "预计明天伦敦会下雨。";
ToolExecutionResultMessage toolExecutionResultMessage = ToolExecutionResultMessage.from(toolExecutionRequest, result);
List<ChatMessage> messages = List.of(userMessage, aiMessage, toolExecutionResultMessage);
Response<AiMessage> response2 = model.generate(messages, toolSpecifications);
```

## 4 高级工具API

高层，你可为任何Java方法添加`@Tool`注解，并将其与[AI服务](http://www.javaedge.cn/md/AI/langchain4j/ai-services.html)一起使用。

AI服务会自动将这些方法转换为`ToolSpecification`，并在每次与LLM的交互中包含它们。当LLM决定调用工具时，AI服务将自动执行相应的方法，并将方法的返回值（如果有）发送回LLM。实现细节可以在`DefaultToolExecutor`中找到。

```java
@Tool("Searches Google for relevant URLs, given the query")
public List<String> searchGoogle(@P("search query") String query) {
    return googleSearchService.search(query);
}

@Tool("Returns the content of a web page, given the URL")
public String getWebPageContent(@P("URL of the page") String url) {
    Document jsoupDocument = Jsoup.connect(url).get();
    return jsoupDocument.body().text();
}
```

### 4.1 @Tool

任何用`@Tool`注解并在构建AI服务时**明确**指定的Java方法，都可以被LLM执行

```java
interface MathGenius {
    
    String ask(String question);
}

class Calculator {
    
    @Tool
    public double add(int a, int b) {
        return a + b;
    }

    @Tool
    public double squareRoot(double x) {
        return Math.sqrt(x);
    }
}

MathGenius mathGenius = AiServices.builder(MathGenius.class)
    .chatLanguageModel(model)
    .tools(new Calculator())
    .build();

String answer = mathGenius.ask("What is the square root of 475695037565?");

System.out.println(answer); // The square root of 475695037565 is 689706.486532.
```

调用`ask`方法时，会发生两次与LLM的交互，如前文所述。交互期间，会自动调用`squareRoot`方法。

`@Tool`注解有两个可选字段：

- `name`: 工具的名称。如果未提供，方法名将作为工具名称。
- `value`: 工具的描述。

根据具体工具，即使不提供描述，LLM也可能理解其用途（例如，`add(a, b)`很明显），但通常最好提供清晰且有意义的名称和描述。这样，LLM在决定是否调用工具以及如何调用时会有更多信息。

### 4.2 @P

方法的参数可以使用`@P`注解。

`@P`注解有两个字段：

- `value`: 参数的描述，此字段是必填的。
- `required`: 参数是否是必需的，默认值为`true`，此字段为可选。

### 4.3 @ToolMemoryId

如果AI服务方法的某个参数使用了`@MemoryId`注解，则可以在`@Tool`方法的参数上使用`@ToolMemoryId`进行注解。这样，提供给AI服务方法的值将自动传递给`@Tool`方法。这对于多个用户和/或每个用户有多个聊天或记忆的场景非常有用，可以在`@Tool`方法中区分它们。

### 4.4 访问已执行的工具

如果你希望访问AI服务调用过程中执行的工具，可以通过将返回类型封装在`Result`类中轻松实现：

```java
interface Assistant {

    Result<String> chat(String userMessage);
}

Result<String> result = assistant.chat("取消我的预订 123-456");

String answer = result.content();
List<ToolExecution> toolExecutions = result.toolExecutions();
```

### 4.5 以编程方式指定工具

在使用AI服务时，也可以通过编程方式指定工具。这种方法非常灵活，因为工具可以从外部资源（如数据库和配置文件）加载。

工具名称、描述、参数名称和描述都可以使用`ToolSpecification`进行配置：

```java
ToolSpecification toolSpecification = ToolSpecification.builder()
    .name("get_booking_details")
    .description("返回预订详情")
    .addParameter("bookingNumber", type("string"), description("B-12345格式的预订编号"))
    .build();
```

对于每个`ToolSpecification`，需要提供一个`ToolExecutor`实现来处理LLM生成的工具执行请求：

```java
ToolExecutor toolExecutor = (toolExecutionRequest, memoryId) -> {
    Map<String, Object> arguments = fromJson(toolExecutionRequest.arguments());
    String bookingNumber = arguments.get("bookingNumber").toString();
    Booking booking = getBooking(bookingNumber);
    return booking.toString();
};
```

一

旦我们拥有一个或多个（`ToolSpecification`，`ToolExecutor`）对，我们可以在创建AI服务时指定它们：

```java
Assistant assistant = AiServices.builder(Assistant.class)
    .chatLanguageModel(chatLanguageModel)
    .tools(singletonMap(toolSpecification, toolExecutor))
    .build();
```

### 4.6 动态指定工具

在使用AI服务时，每次调用时也可以动态指定工具。可以配置一个`ToolProvider`，该提供者将在每次调用AI服务时被调用，并提供应包含在当前请求中的工具。`ToolProvider`接受一个包含`UserMessage`和聊天记忆ID的`ToolProviderRequest`，并返回包含工具的`ToolProviderResult`，其形式为`ToolSpecification`到`ToolExecutor`的映射。

下面是一个示例，展示如何仅在用户消息中包含“预订”一词时添加`get_booking_details`工具：

```java
ToolProvider toolProvider = (toolProviderRequest) -> {
    if (toolProviderRequest.userMessage().singleText().contains("booking")) {
        ToolSpecification toolSpecification = ToolSpecification.builder()
            .name("get_booking_details")
            .description("返回预订详情")
            .addParameter("bookingNumber", type("string"))
            .build();
        return ToolProviderResult.builder()
            .add(toolSpecification, toolExecutor)
            .build();
    } else {
        return null;
    }
};

Assistant assistant = AiServices.builder(Assistant.class)
    .chatLanguageModel(model)
    .toolProvider(toolProvider)
    .build();
```

## 5 示例

- [带工具的示例](https://github.com/Java-Edge/langchain4j-examples/blob/main/other-examples/src/main/java/ServiceWithToolsExample.java)
- [带动态工具的示例](https://github.com/Java-Edge/langchain4j-examples/blob/main/other-examples/src/main/java/ServiceWithDynamicToolsExample.java)

参考：

- [关于工具的精彩指南](https://www.youtube.com/watch?v=cjI_6Siry-s) 