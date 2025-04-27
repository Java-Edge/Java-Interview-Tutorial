# 结构化输出

## 0 前言

“结构化输出”含义广，可指两件事：

- LLM 以结构化格式生成输出的一般能力（本文内容）
- OpenAI 的[结构化输出](https://platform.openai.com/docs/guides/structured-outputs)功能，适用于响应格式和工具（函数调用）

许多 LLM 和 LLM provider支持生成结构化格式（通常是JSON）的输出。这些输出可轻松映射到 Java 对象，并用于应用程序的其他部分。

如有个 `Person` 类：

```java
record Person(String name, int age, double height, boolean married) {
}
```

目标：从非结构化文本中提取一个 `Person` 对象，如：

```text
John is 42 years old and lives an independent life.
He stands 1.75 meters tall and carries himself with confidence.
Currently unmarried, he enjoys the freedom to focus on his personal goals and interests.
```

目前，根据 LLM 和 LLM provider的不同，有如下三种方法实现此目标（从最可靠到最不可靠）：

## 1 JSON Schema JSON 模式

一些 LLM 提供商（目前包括 Azure OpenAI、Google AI Gemini、Mistral、Ollama 和 OpenAI）允许为所需输出指定 [JSON 模式 ](https://json-schema.org/overview/what-is-jsonschema)。可在[此处的 ](https://docs.langchain4j.dev/integrations/language-models)“JSON 模式”列中查看所有受支持的 LLM 提供商。

当请求中指定 JSON 模式时，LLM 预计会生成符合该模式的输出。

> JSON 模式是在对 LLM 提供商 API 的请求中的专用属性中指定的，不需要在prompt中包含任何自由格式的指令（如在系统或用户消息中）。

LangChain4j 在低级 `ChatLanguageModel` API 和高级 AI Service API 中都支持 JSON Schema 功能。

### 1.1 使用 JSON Schema 和 ChatLanguageModel

在低级 `ChatLanguageModel` API 中，可以在创建 `ChatRequest` 时使用 LLM-provider-agnostic `ResponseFormat` 和 `JsonSchema` 指定 JSON 模式：

```java
ResponseFormat responseFormat = ResponseFormat.builder()
        .type(JSON) // type can be either TEXT (default) or JSON
        .jsonSchema(JsonSchema.builder()
                .name("Person") // OpenAI requires specifying the name for the schema
                .rootElement(JsonObjectSchema.builder() // see [1] below
                        .addStringProperty("name")
                        .addIntegerProperty("age")
                        .addNumberProperty("height")
                        .addBooleanProperty("married")
                        .required("name", "age", "height", "married") // see [2] below
                        .build())
                .build())
        .build();

UserMessage userMessage = UserMessage.from("""
        John is 42 years old and lives an independent life.
        He stands 1.75 meters tall and carries himself with confidence.
        Currently unmarried, he enjoys the freedom to focus on his personal goals and interests.
        """);

ChatRequest chatRequest = ChatRequest.builder()
        .responseFormat(responseFormat)
        .messages(userMessage)
        .build();

ChatLanguageModel chatModel = OpenAiChatModel.builder()
        .apiKey(System.getenv("OPENAI_API_KEY"))
        .modelName("gpt-4o-mini")
        .logRequests(true)
        .logResponses(true)
        .build();
// OR
ChatLanguageModel chatModel = AzureOpenAiChatModel.builder()
        .endpoint(System.getenv("AZURE_OPENAI_URL"))
        .apiKey(System.getenv("AZURE_OPENAI_API_KEY"))
        .deploymentName("gpt-4o-mini")
        .logRequestsAndResponses(true)
        .build();
// OR
ChatLanguageModel chatModel = GoogleAiGeminiChatModel.builder()
        .apiKey(System.getenv("GOOGLE_AI_GEMINI_API_KEY"))
        .modelName("gemini-1.5-flash")
        .logRequestsAndResponses(true)
        .build();
// OR
ChatLanguageModel chatModel = OllamaChatModel.builder()
        .baseUrl("http://localhost:11434")
        .modelName("llama3.1")
        .logRequests(true)
        .logResponses(true)
        .build();
// OR
ChatLanguageModel chatModel = MistralAiChatModel.builder()
        .apiKey(System.getenv("MISTRAL_AI_API_KEY"))
        .modelName("mistral-small-latest")
        .logRequests(true)
        .logResponses(true)
        .build();

ChatResponse chatResponse = chatModel.chat(chatRequest);

String output = chatResponse.aiMessage().text();
System.out.println(output); // {"name":"John","age":42,"height":1.75,"married":false}

Person person = new ObjectMapper().readValue(output, Person.class);
System.out.println(person); // Person[name=John, age=42, height=1.75, married=false]
```

大多情况下，根元素必须是 `JsonObjectSchema` 类型，但 Gemini 也允许 `JsonEnumSchema` 和 `JsonArraySchema` 。

必须明确指定必需属性；否则，它们将被视为可选。JSON 模式的结构使用 `JsonSchemaElement` 接口定义，具有以下子类型：

- `JsonObjectSchema` - for object types.
- `JsonStringSchema` - for `String`, `char`/`Character` types.
- `JsonIntegerSchema` - for `int`/`Integer`, `long`/`Long`, `BigInteger` types.
- `JsonNumberSchema` - for `float`/`Float`, `double`/`Double`, `BigDecimal` types.
- `JsonBooleanSchema` - for `boolean`/`Boolean` types.
- `JsonEnumSchema` - for `enum` types.
- `JsonArraySchema` - for arrays and collections (e.g., `List`, `Set`).
- `JsonReferenceSchema` - to support recursion (e.g., `Person` has a `Set<Person> children` field).
- `JsonAnyOfSchema` - to support polymorphism (e.g., `Shape` can be either `Circle` or `Rectangle`).
- `JsonNullSchema` - to support nullable type.

#### JsonObjectSchema

`JsonObjectSchema` 表示具有嵌套属性的对象。它通常是 `JsonSchema` 的根元素。

有几种方法可向 `JsonObjectSchema` 添加属性：

可用 `properties(Map<String, JsonSchemaElement> properties)` 一次性添加所有属性：

```java
JsonSchemaElement citySchema = JsonStringSchema.builder()
        .description("The city for which the weather forecast should be returned")
        .build();

JsonSchemaElement temperatureUnitSchema = JsonEnumSchema.builder()
        .enumValues("CELSIUS", "FAHRENHEIT")
        .build();

Map<String, JsonSchemaElement> properties = Map.of(
        "city", citySchema,
        "temperatureUnit", temperatureUnitSchema
);

JsonSchemaElement rootElement = JsonObjectSchema.builder()
        .addProperties(properties)
        .required("city") // required properties should be specified explicitly
        .build();
```

可用 `addProperty(String name, JsonSchemaElement jsonSchemaElement)` 单独添加属性：

```java
JsonSchemaElement rootElement = JsonObjectSchema.builder()
        .addProperty("city", citySchema)
        .addProperty("temperatureUnit", temperatureUnitSchema)
        .required("city")
        .build();
```

可用 `add{Type}Property(String name)` 或 `add{Type}Property(String name, String description)` 方法之一单独添加属性：

```java
JsonSchemaElement rootElement = JsonObjectSchema.builder()
        .addStringProperty("city", "The city for which the weather forecast should be returned")
        .addEnumProperty("temperatureUnit", List.of("CELSIUS", "FAHRENHEIT"))
        .required("city")
        .build();
```

参阅 [JsonObjectSchema](https://github.com/langchain4j/langchain4j/blob/main/langchain4j-core/src/main/java/dev/langchain4j/model/chat/request/json/JsonObjectSchema.java) 了解更多详情。

#### JsonStringSchema

An example of creating `JsonStringSchema`:
创建 `JsonStringSchema` 的示例：

```java
JsonSchemaElement stringSchema = JsonStringSchema.builder()
        .description("The name of the person")
        .build();
```



#### `JsonIntegerSchema`[](https://docs.langchain4j.dev/tutorials/structured-outputs#jsonintegerschema)

An example of creating `JsonIntegerSchema`:
创建 `JsonIntegerSchema` 的示例：

```java
JsonSchemaElement integerSchema = JsonIntegerSchema.builder()
        .description("The age of the person")
        .build();
```



#### `JsonNumberSchema`[](https://docs.langchain4j.dev/tutorials/structured-outputs#jsonnumberschema)

An example of creating `JsonNumberSchema`:
创建 `JsonNumberSchema` 的示例：

```java
JsonSchemaElement numberSchema = JsonNumberSchema.builder()
        .description("The height of the person")
        .build();
```



#### `JsonBooleanSchema`[](https://docs.langchain4j.dev/tutorials/structured-outputs#jsonbooleanschema)

An example of creating `JsonBooleanSchema`:
创建 `JsonBooleanSchema` 的示例：

```java
JsonSchemaElement booleanSchema = JsonBooleanSchema.builder()
        .description("Is the person married?")
        .build();
```



#### `JsonEnumSchema`[](https://docs.langchain4j.dev/tutorials/structured-outputs#jsonenumschema)

An example of creating `JsonEnumSchema`:
创建 `JsonEnumSchema` 的示例：

```java
JsonSchemaElement enumSchema = JsonEnumSchema.builder()
        .description("Marital status of the person")
        .enumValues(List.of("SINGLE", "MARRIED", "DIVORCED"))
        .build();
```



#### `JsonArraySchema`[](https://docs.langchain4j.dev/tutorials/structured-outputs#jsonarrayschema)

An example of creating `JsonArraySchema` to define an array of strings:
创建 `JsonArraySchema` 来定义字符串数组的示例：

```java
JsonSchemaElement itemSchema = JsonStringSchema.builder()
        .description("The name of the person")
        .build();

JsonSchemaElement arraySchema = JsonArraySchema.builder()
        .description("All names of the people found in the text")
        .items(itemSchema)
        .build();
```



#### `JsonReferenceSchema`[](https://docs.langchain4j.dev/tutorials/structured-outputs#jsonreferenceschema)

The `JsonReferenceSchema` can be used to support recursion:
`JsonReferenceSchema` 可用于支持递归：

```java
String reference = "person"; // reference should be unique withing the schema

JsonObjectSchema jsonObjectSchema = JsonObjectSchema.builder()
        .addStringProperty("name")
        .addProperty("children", JsonArraySchema.builder()
                .items(JsonReferenceSchema.builder()
                        .reference(reference)
                        .build())
                .build())
        .required("name", "children")
        .definitions(Map.of(reference, JsonObjectSchema.builder()
                .addStringProperty("name")
                .addProperty("children", JsonArraySchema.builder()
                        .items(JsonReferenceSchema.builder()
                                .reference(reference)
                                .build())
                        .build())
                .required("name", "children")
                .build()))
        .build();
```



note 笔记

The `JsonReferenceSchema` is currently supported only by Azure OpenAI, Mistral and OpenAI.
`JsonReferenceSchema` 目前仅受 Azure OpenAI、Mistral 和 OpenAI 支持。

#### `JsonAnyOfSchema`[](https://docs.langchain4j.dev/tutorials/structured-outputs#jsonanyofschema)

The `JsonAnyOfSchema` can be used to support polymorphism:
`JsonAnyOfSchema` 可用于支持多态性：

```java
JsonSchemaElement circleSchema = JsonObjectSchema.builder()
        .addNumberProperty("radius")
        .build();

JsonSchemaElement rectangleSchema = JsonObjectSchema.builder()
        .addNumberProperty("width")
        .addNumberProperty("height")
        .build();

JsonSchemaElement shapeSchema = JsonAnyOfSchema.builder()
        .anyOf(circleSchema, rectangleSchema)
        .build();

JsonSchema jsonSchema = JsonSchema.builder()
        .name("Shapes")
        .rootElement(JsonObjectSchema.builder()
                .addProperty("shapes", JsonArraySchema.builder()
                        .items(shapeSchema)
                        .build())
                .required(List.of("shapes"))
                .build())
        .build();

ResponseFormat responseFormat = ResponseFormat.builder()
        .type(ResponseFormatType.JSON)
        .jsonSchema(jsonSchema)
        .build();

UserMessage userMessage = UserMessage.from("""
        Extract information from the following text:
        1. A circle with a radius of 5
        2. A rectangle with a width of 10 and a height of 20
        """);

ChatRequest chatRequest = ChatRequest.builder()
        .messages(userMessage)
        .responseFormat(responseFormat)
        .build();

ChatResponse chatResponse = model.chat(chatRequest);

System.out.println(chatResponse.aiMessage().text()); // {"shapes":[{"radius":5},{"width":10,"height":20}]}
```



note 笔记

The `JsonAnyOfSchema` is currently supported only by OpenAI and Azure OpenAI.
`JsonAnyOfSchema` 目前仅受 OpenAI 和 Azure OpenAI 支持。

#### Adding Description 添加描述[](https://docs.langchain4j.dev/tutorials/structured-outputs#adding-description)

All of the `JsonSchemaElement` subtypes, except for `JsonReferenceSchema`, have a `description` property. If an LLM does not provide the desired output, descriptions can be provided to give more instructions and examples of correct outputs to the LLM, for example:
除了 `JsonReferenceSchema` 之外，所有 `JsonSchemaElement` 子类型都具有 `description` 属性。如果 LLM 未提供所需的输出，则可以提供 description 属性，以便为 LLM 提供更多说明和正确输出的示例，例如：

```java
JsonSchemaElement stringSchema = JsonStringSchema.builder()
        .description("The name of the person, for example: John Doe")
        .build();
```



#### Limitations 限制[](https://docs.langchain4j.dev/tutorials/structured-outputs#limitations)

When using JSON Schema with `ChatLanguageModel`, there are some limitations:
当使用 JSON Schema 与 `ChatLanguageModel` 时，存在一些限制：

- It works only with supported Azure OpenAI, Google AI Gemini, Mistral, Ollama and OpenAI models.
  它仅适用于受支持的 Azure OpenAI、Google AI Gemini、Mistral、Ollama 和 OpenAI 模型。
- It does not work in the [streaming mode](https://docs.langchain4j.dev/tutorials/ai-services#streaming) for OpenAI yet. For Google AI Gemini, Mistral and Ollama, JSON Schema can be specified via `responseSchema(...)` when creating/building the model.
  它目前还不支持 OpenAI 的[流式传输模式 ](https://docs.langchain4j.dev/tutorials/ai-services#streaming)。对于 Google AI Gemini、Mistral 和 Ollama，可以在创建/构建模型时通过 `responseSchema(...)` 指定 JSON Schema。
- `JsonReferenceSchema` and `JsonAnyOfSchema` are currently supported only by Azure OpenAI, Mistral and OpenAI.
  `JsonReferenceSchema` 和 `JsonAnyOfSchema` 目前仅受 Azure OpenAI、Mistral 和 OpenAI 支持。

### 1.2 将 JSON 模式与 AI 服务结合使用

使用 [AI 服务](https://docs.langchain4j.dev/tutorials/ai-services)时，可以更轻松地实现相同的功能，并用更少代码：

```java
interface PersonExtractor {
    
    Person extractPersonFrom(String text);
}

ChatLanguageModel chatModel = OpenAiChatModel.builder() // see [1] below
        .apiKey(System.getenv("OPENAI_API_KEY"))
        .modelName("gpt-4o-mini")
        .supportedCapabilities(Set.of(RESPONSE_FORMAT_JSON_SCHEMA)) // see [2] below
        .strictJsonSchema(true) // see [2] below
        .logRequests(true)
        .logResponses(true)
        .build();
// OR
ChatLanguageModel chatModel = AzureOpenAiChatModel.builder() // see [1] below
        .endpoint(System.getenv("AZURE_OPENAI_URL"))
        .apiKey(System.getenv("AZURE_OPENAI_API_KEY"))
        .deploymentName("gpt-4o-mini")
        .strictJsonSchema(true)
        .supportedCapabilities(Set.of(RESPONSE_FORMAT_JSON_SCHEMA)) // see [3] below
        .logRequestsAndResponses(true)
        .build();
// OR
ChatLanguageModel chatModel = GoogleAiGeminiChatModel.builder() // see [1] below
        .apiKey(System.getenv("GOOGLE_AI_GEMINI_API_KEY"))
        .modelName("gemini-1.5-flash")
        .responseFormat(ResponseFormat.JSON) // see [4] below
        .logRequestsAndResponses(true)
        .build();
// OR
ChatLanguageModel chatModel = OllamaChatModel.builder() // see [1] below
        .baseUrl("http://localhost:11434")
        .modelName("llama3.1")
        .supportedCapabilities(RESPONSE_FORMAT_JSON_SCHEMA) // see [5] below
        .logRequests(true)
        .logResponses(true)
        .build();
// OR
ChatLanguageModel chatModel = MistralAiChatModel.builder()
         .apiKey(System.getenv("MISTRAL_AI_API_KEY"))
         .modelName("mistral-small-latest")
         .supportedCapabilities(RESPONSE_FORMAT_JSON_SCHEMA) // see [6] below
         .logRequests(true)
         .logResponses(true)
         .build();

PersonExtractor personExtractor = AiServices.create(PersonExtractor.class, chatModel); // see [1] below

String text = """
        John is 42 years old and lives an independent life.
        He stands 1.75 meters tall and carries himself with confidence.
        Currently unmarried, he enjoys the freedom to focus on his personal goals and interests.
        """;

Person person = personExtractor.extractPersonFrom(text);

System.out.println(person); // Person[name=John, age=42, height=1.75, married=false]
```

- [1] - In a Quarkus or a Spring Boot application, there is no need to explicitly create the `ChatLanguageModel` and the AI Service, as these beans are created automatically. More info on this: [for Quarkus](https://docs.quarkiverse.io/quarkus-langchain4j/dev/ai-services.html), [for Spring Boot](https://docs.langchain4j.dev/tutorials/spring-boot-integration#spring-boot-starter-for-declarative-ai-services).
  [1] - 在 Quarkus 或 Spring Boot 应用程序中，无需显式创建 `ChatLanguageModel` 和 AI 服务， 因为这些 bean 是自动创建的。更多信息请见： [对于 Quarkus 来说 ](https://docs.quarkiverse.io/quarkus-langchain4j/dev/ai-services.html)， [适用于 Spring Boot](https://docs.langchain4j.dev/tutorials/spring-boot-integration#spring-boot-starter-for-declarative-ai-services) 。
- [2] - This is required to enable the JSON Schema feature for OpenAI, see more details [here](https://docs.langchain4j.dev/integrations/language-models/open-ai#structured-outputs-for-response-format).
  [2] - 这是为 OpenAI 启用 JSON Schema 功能所必需的，请[在此处](https://docs.langchain4j.dev/integrations/language-models/open-ai#structured-outputs-for-response-format)查看更多详细信息。
- [3] - This is required to enable the JSON Schema feature for [Azure OpenAI](https://docs.langchain4j.dev/integrations/language-models/azure-open-ai).
  [3] - 这是为 [Azure OpenAI](https://docs.langchain4j.dev/integrations/language-models/azure-open-ai) 启用 JSON 架构功能所必需的。
- [4] - This is required to enable the JSON Schema feature for [Google AI Gemini](https://docs.langchain4j.dev/integrations/language-models/google-ai-gemini).
  [4] - 这是启用 [Google AI Gemini](https://docs.langchain4j.dev/integrations/language-models/google-ai-gemini) 的 JSON Schema 功能所必需的。
- [5] - This is required to enable the JSON Schema feature for [Ollama](https://docs.langchain4j.dev/integrations/language-models/ollama).
  [5] - 这对于启用 [Ollama](https://docs.langchain4j.dev/integrations/language-models/ollama) 的 JSON Schema 功能是必需的。
- [6] - This is required to enable the JSON Schema feature for [Mistral](https://docs.langchain4j.dev/integrations/language-models/mistral-ai).
  [6] - 这对于启用 [Mistral 的 ](https://docs.langchain4j.dev/integrations/language-models/mistral-ai)JSON Schema 功能是必需的。

When all the following conditions are met:
当满足以下所有条件时：

- AI Service method returns a POJO
  AI 服务方法返回一个 POJO
- The used `ChatLanguageModel` [supports](https://docs.langchain4j.dev/integrations/language-models/) the JSON Schema feature
  使用的 `ChatLanguageModel`[ 支持 ](https://docs.langchain4j.dev/integrations/language-models/)JSON Schema 功能
- The JSON Schema feature is enabled on the used `ChatLanguageModel`
  在所使用的 `ChatLanguageModel` 上启用了 JSON Schema 功能

then the `ResponseFormat` with `JsonSchema` will be generated automatically based on the specified return type.
然后将根据指定的返回类型自动生成具有 `JsonSchema` 的 `ResponseFormat` 。

note 笔记

Make sure to explicitly enable JSON Schema feature when configuring `ChatLanguageModel`, as it is disabled by default.
确保在配置 `ChatLanguageModel` 时明确启用 JSON Schema 功能，因为默认情况下该功能是禁用的。

The `name` of the generated `JsonSchema` is a simple name of the return type (`getClass().getSimpleName()`), in this case: "Person".
生成的 `JsonSchema` 的 `name` 是返回类型的简单名称（ `getClass().getSimpleName()` ），在本例中为：“Person”。

Once LLM responds, the output is parsed into an object and returned from the AI Service method.
一旦 LLM 响应，输出就会被解析为一个对象并从 AI 服务方法返回。

You can find many examples of supported use cases [here](https://github.com/langchain4j/langchain4j/blob/main/langchain4j/src/test/java/dev/langchain4j/service/AiServicesWithJsonSchemaIT.java) and [here](https://github.com/langchain4j/langchain4j/blob/main/langchain4j/src/test/java/dev/langchain4j/service/AiServicesWithJsonSchemaWithDescriptionsIT.java).
您可以找到许多受支持的用例示例 [这里](https://github.com/langchain4j/langchain4j/blob/main/langchain4j/src/test/java/dev/langchain4j/service/AiServicesWithJsonSchemaIT.java) 还有[这里 ](https://github.com/langchain4j/langchain4j/blob/main/langchain4j/src/test/java/dev/langchain4j/service/AiServicesWithJsonSchemaWithDescriptionsIT.java)。

#### Required and Optional 必需和可选[](https://docs.langchain4j.dev/tutorials/structured-outputs#required-and-optional)

By default, all fields and sub-fields in the generated `JsonSchema` are considered ***optional\***. This is because LLMs tend to hallucinate and populate fields with synthetic data when they lack sufficient information (e.g., using "John Doe" when then name is missing)".
默认情况下，生成的 `JsonSchema` 中的所有字段和子字段都被视为***可选的\*** 。这是因为 LLM 在缺乏足够信息时，往往会产生幻觉，用合成数据填充字段（例如，在缺少姓名的情况下使用“John Doe”）。

note 笔记

Please note that optional fields with primitive types (e.g., `int`, `boolean`, etc.) will be initialized with default values (e.g., `0` for `int`, `false` for `boolean`, etc.) if the LLM does not provide a value for them.
请注意，如果 LLM 没有为原始类型（例如， `int` 、 `boolean` 等）的可选字段提供值，则将使用默认值进行初始化（例如， `int` 为 `0` 、 `boolean` 为 `false` 等）。

note 笔记

Please note that optional `enum` fields can still be populated with hallucinated values when strict mode is on (`strictJsonSchema(true)`).
请注意，当严格模式开启（ `strictJsonSchema(true)` ）时，可选 `enum` 字段仍然可以填充幻觉值。

To make the field required, you can annotate it with `@JsonProperty(required = true)`:
要使该字段成为必填字段，您可以使用 `@JsonProperty(required = true)` 对其进行注释：

```java
record Person(@JsonProperty(required = true) String name, String surname) {
}

interface PersonExtractor {
    
    Person extractPersonFrom(String text);
}
```



note 笔记

Please note that when used with [tools](https://docs.langchain4j.dev/tutorials/tools), all fields and sub-fields are considered ***required\*** by default.
请注意，与[工具](https://docs.langchain4j.dev/tutorials/tools)一起使用时，所有字段和子字段默认***被视为必填\*** 。

#### Adding Description 添加描述[](https://docs.langchain4j.dev/tutorials/structured-outputs#adding-description-1)

If an LLM does not provide the desired output, classes and fields can be annotated with `@Description` to give more instructions and examples of correct outputs to the LLM, for example:
如果 LLM 未提供所需的输出，则可以使用 `@Description` 注释类和字段 为 LLM 提供更多指导和正确输出的示例，例如：

```java
@Description("a person")
record Person(@Description("person's first and last name, for example: John Doe") String name,
              @Description("person's age, for example: 42") int age,
              @Description("person's height in meters, for example: 1.78") double height,
              @Description("is person married or not, for example: false") boolean married) {
}
```



note 笔记

Please note that `@Description` placed on an `enum` value has ***no effect\*** and ***is not\*** included in the generated JSON schema:
请注意，放置在 `enum` 值上的 `@Description` ***没有任何效果\*** ，并且***不\***包含在生成的 JSON 模式中：

```java
enum Priority {

    @Description("Critical issues such as payment gateway failures or security breaches.") // this is ignored
    CRITICAL,
    
    @Description("High-priority issues like major feature malfunctions or widespread outages.") // this is ignored
    HIGH,
    
    @Description("Low-priority issues such as minor bugs or cosmetic problems.") // this is ignored
    LOW
}
```

#### 限制

在 AI 服务中使用 JSON Schema 时的限制：

- 仅适用于受支持的 Azure OpenAI、Google AI Gemini、Mistral、Ollama 和 OpenAI 模型。

- 配置 `ChatLanguageModel` 时需要明确启用对 JSON Schema 的支持

- [流模式](https://docs.langchain4j.dev/tutorials/ai-services#streaming)下不​​起作用。

- 并非所有类型都受支持。请参阅[此处的](https://docs.langchain4j.dev/tutorials/structured-outputs#supported-types)支持类型列表

- POJO 可包含：

  - Scalar/simple types (e.g., `String`, `int`/`Integer`, `double`/`Double`, `boolean`/`Boolean`, etc.)
    标量/简单类型（例如 `String` 、 `int` / `Integer` 、 `double` / `Double` 、 `boolean` / `Boolean` 等）
  - `enum`s `enum`
  - Nested POJOs 嵌套 POJO
  - `List<T>`, `Set<T>` and `T[]`, where `T` is a scalar, an `enum` or a POJO
    `List<T>` 、 `Set<T>` 和 `T[]` ，其中 `T` 是标量、 `enum` 或 POJO

- 目前只有 Azure OpenAI、Mistral 和 OpenAI 支持递归

- 尚不支持多态。返回的 POJO 及其嵌套的 POJO 必须是具体类；不支持接口或抽象类。

- 当 LLM 不支持 JSON Schema 功能、未启用该功能或​​不支持类型时，AI Service 将回退到[提示 ](https://docs.langchain4j.dev/tutorials/structured-outputs#prompting)

## 2 Prompting + JSON Mode 提示符 + JSON 模式

更多信息即将发布。先阅读[本节](https://docs.langchain4j.dev/tutorials/ai-services#json-mode) 和[这篇文章 ](https://glaforge.dev/posts/2024/11/18/data-extraction-the-many-ways-to-get-llms-to-spit-json-content/)。

## 3 Prompting 提示

使用prompting时（默认选择，除非启用对 JSON 模式支持），AI 服务将自动生成格式说明并将其附加到 `UserMessage` 末尾，指明LLM应采用的响应格式。 方法返回前，AI 服务会将 LLM 的输出解析为所需的类型。

可通过[启用日志记录](https://docs.langchain4j.dev/tutorials/logging)来观察附加的说明。

> 这种方法不太可靠。如果 LLM 课程和 LLM 提供商支持上述方法，最好使用这些方法。

## 4 Supported Types 支持的类型

| Type 类型                                                    | JSON Schema JSON 模式 | Prompting 提示 |
| ------------------------------------------------------------ | --------------------- | -------------- |
| `POJO`                                                       | ✅                     | ✅              |
| `List<POJO>`, `Set<POJO>` `List<POJO>` ， `Set<POJO>`        | ✅                     | ❌              |
| `Enum`                                                       | ✅                     | ✅              |
| `List<Enum>`, `Set<Enum>` `List<Enum>` ， `Set<Enum>`        | ✅                     | ✅              |
| `List<String>`, `Set<String>` `List<String>` ， `Set<String>` | ✅                     | ✅              |
| `boolean`, `Boolean` `boolean` , `Boolean`                   | ✅                     | ✅              |
| `int`, `Integer` `int` `Integer`                             | ✅                     | ✅              |
| `long`, `Long` `long` ， `Long`                              | ✅                     | ✅              |
| `float`, `Float` `float` ， `Float`                          | ✅                     | ✅              |
| `double`, `Double` `double` ， `Double`                      | ✅                     | ✅              |
| `byte`, `Byte` `byte` ， `Byte`                              | ❌                     | ✅              |
| `short`, `Short` `short` ， `Short`                          | ❌                     | ✅              |
| `BigInteger`                                                 | ❌                     | ✅              |
| `BigDecimal`                                                 | ❌                     | ✅              |
| `Date`                                                       | ❌                     | ✅              |
| `LocalDate`                                                  | ❌                     | ✅              |
| `LocalTime`                                                  | ❌                     | ✅              |
| `LocalDateTime`                                              | ❌                     | ✅              |
| `Map<?, ?>`                                                  | ❌                     | ✅              |

A few examples: 举几个例子：

```java
record Person(String firstName, String lastName) {}

enum Sentiment {
    POSITIVE, NEGATIVE, NEUTRAL
}

interface Assistant {

    Person extractPersonFrom(String text);

    Set<Person> extractPeopleFrom(String text);

    Sentiment extractSentimentFrom(String text);

    List<Sentiment> extractSentimentsFrom(String text);

    List<String> generateOutline(String topic);

    boolean isSentimentPositive(String text);

    Integer extractNumberOfPeopleMentionedIn(String text);
}
```

## 5 相关教程

- [Data extraction: The many ways to get LLMs to spit JSON content](https://glaforge.dev/posts/2024/11/18/data-extraction-the-many-ways-to-get-llms-to-spit-json-content/) by [Guillaume Laforge](https://glaforge.dev/about/)
  [数据提取：让 LLM 输出 JSON 内容的多种方法，](https://glaforge.dev/posts/2024/11/18/data-extraction-the-many-ways-to-get-llms-to-spit-json-content/) 

