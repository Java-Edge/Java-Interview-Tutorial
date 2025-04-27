# HTTP 客户端

>LangChain4j HTTP 客户端定制：解锁 LLM API 交互的更多可能性

## 0 前言

一些 LangChain4j 模块（目前是 OpenAI 和 Ollama）支持自定义用于调用 LLM 提供程序 API 的 HTTP 客户端。

`langchain4j-http-client` 模块实现了一个 `HttpClient` SPI，这些模块用它来调用 LLM 提供程序的 REST API。即底层 HTTP 客户端可自定义，并通过实现 `HttpClient` SPI 来集成任何其他 HTTP 客户端。

## 1 实现方案

目前，有两种开箱即用的实现：

### 1.1 JdkHttpClient

`langchain4j-http-client-jdk` 模块中的 `JdkHttpClient` 。当使用受支持的模块（如 `langchain4j-open-ai` ）时，默认使用它。

### 1.2 SpringRestClient

`langchain4j-http-client-spring-restclient` 中的 `SpringRestClient` 。当使用受支持的模块的 Spring Boot 启动器（例如 `langchain4j-open-ai-spring-boot-starter` ）时，默认使用它。

## 2 自定义JDK的HttpClient

```java
HttpClient.Builder httpClientBuilder = HttpClient.newBuilder()
        .sslContext(...);

JdkHttpClientBuilder jdkHttpClientBuilder = JdkHttpClient.builder()
        .httpClientBuilder(httpClientBuilder);

OpenAiChatModel model = OpenAiChatModel.builder()
        .httpClientBuilder(jdkHttpClientBuilder)
        .apiKey(System.getenv("OPENAI_API_KEY"))
        .modelName("gpt-4o-mini")
        .build();
```

## 3 定制 Spring 的RestClient

```java
RestClient.Builder restClientBuilder = RestClient.builder()
        .requestFactory(new HttpComponentsClientHttpRequestFactory());

SpringRestClientBuilder springRestClientBuilder = SpringRestClient.builder()
        .restClientBuilder(restClientBuilder)
        .streamingRequestExecutor(new VirtualThreadTaskExecutor());

OpenAiChatModel model = OpenAiChatModel.builder()
        .httpClientBuilder(springRestClientBuilder)
        .apiKey(System.getenv("OPENAI_API_KEY"))
        .modelName("gpt-4o-mini")
        .build();
```