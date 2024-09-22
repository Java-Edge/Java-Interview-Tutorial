# 06-响应流

本文描述了使用低级别大语言模型（LLM）API的响应流处理。有关高级 LLM API，请参见[AI 服务](/tutorials/ai-services#streaming)。

LLM 是逐个 token 生成文本的，因此许多 LLM 提供商提供了一种逐个 token 流式传输响应的方式，而不是等待整个文本生成完成。这显著改善了用户体验，因为用户无需等待未知的时间，可以几乎立即开始阅读响应内容。

对于 `ChatLanguageModel` 和 `LanguageModel` 接口，存在相应的 `StreamingChatLanguageModel` 和 `StreamingLanguageModel` 接口。它们的 API 类似，但可以流式传输响应。它们接受一个实现 `StreamingResponseHandler` 接口的参数。

```java
public interface StreamingResponseHandler<T> {

    void onNext(String token);
 
    default void onComplete(Response<T> response) {}

    void onError(Throwable error);
}
```

通过实现 `StreamingResponseHandler`，可为以下事件定义操作：

- 当下一个 token 被生成时：会调用 `onNext(String token)`。  如可在 token 可用时将其直接发送到 UI
- 当 LLM 完成生成时：会调用 `onComplete(Response<T> response)`。在 `StreamingChatLanguageModel` 中，`T` 代表 `AiMessage`，在 `StreamingLanguageModel` 中，`T` 代表 `String`。`Response` 对象包含完整的响应
- 当发生错误时：会调用 `onError(Throwable error)`

使用 `StreamingChatLanguageModel` 实现流式传输示例

```java
StreamingChatLanguageModel model = OpenAiStreamingChatModel.builder()
    .apiKey(System.getenv("OPENAI_API_KEY"))
    .modelName(GPT_4_O_MINI)
    .build();

String userMessage = "给我讲个笑话";

model.generate(userMessage, new StreamingResponseHandler<AiMessage>() {

    @Override
    public void onNext(String token) {
        System.out.println("onNext: " + token);
    }

    @Override
    public void onComplete(Response<AiMessage> response) {
        System.out.println("onComplete: " + response);
    }

    @Override
    public void onError(Throwable error) {
        error.printStackTrace();
    }
});
```