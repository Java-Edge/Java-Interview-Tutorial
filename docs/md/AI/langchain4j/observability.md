# 10-可观测性

## LLM 可观测性

[特定](/integrations/language-models) 的 `ChatLanguageModel` 和 `StreamingChatLanguageModel` 实现（请参见“可观测性”列）允许配置 `ChatModelListener`，用于监听以下事件：

- 对 LLM 的请求
- LLM 的响应
- 错误

这些事件包含的属性包括[OpenTelemetry 生成 AI 语义约定](https://opentelemetry.io/docs/specs/semconv/gen-ai/)中的描述，例如：

- 请求：
  - 模型
  - 温度（Temperature）
  - Top P
  - 最大 Tokens
  - 消息
  - 工具
- 响应：
  - ID
  - 模型
  - Token 使用情况
  - 结束原因
  - AI 助手消息

以下是使用 `ChatModelListener` 的示例：

```java
ChatModelListener listener = new ChatModelListener() {

    @Override
    public void onRequest(ChatModelRequestContext requestContext) {
        ChatModelRequest request = requestContext.request();
        Map<Object, Object> attributes = requestContext.attributes();
        // 在此处理请求事件
        ...
    }

    @Override
    public void onResponse(ChatModelResponseContext responseContext) {
        ChatModelResponse response = responseContext.response();
        ChatModelRequest request = responseContext.request();
        Map<Object, Object> attributes = responseContext.attributes();
        // 在此处理响应事件
        ...
    }

    @Override
    public void onError(ChatModelErrorContext errorContext) {
        Throwable error = errorContext.error();
        ChatModelRequest request = errorContext.request();
        ChatModelResponse partialResponse = errorContext.partialResponse();
        Map<Object, Object> attributes = errorContext.attributes();
        // 在此处理错误事件
        ...
    }
};

ChatLanguageModel model = OpenAiChatModel.builder()
        .apiKey(System.getenv("OPENAI_API_KEY"))
        .modelName(GPT_4_O_MINI)
        .listeners(List.of(listener))
        .build();

model.generate("讲一个关于 Java 的笑话");
```

`attributes` 映射允许在 `onRequest`、`onResponse` 和 `onError` 方法之间传递信息。