# 02-快速上手

## 0 前言

> 如在用 Spring Boot，参见 [Spring Boot 集成](https://docs.langchain4j.dev/tutorials/spring-boot-integration/)

LangChain4j 提供了[与多个 LLM 提供商的集成](https://docs.langchain4j.dev/integrations/language-models/)。每个集成都有其独立的 Maven 依赖。最简单的入门方式是使用 OpenAI 集成：

##  1 添加依赖



```xml
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-open-ai</artifactId>
    <version>0.34.0</version>
</dependency>
```

如想用高级 [AI 服务](https://docs.langchain4j.dev/tutorials/ai-services) API，还需添加依赖：

```xml
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j</artifactId>
    <version>0.34.0</version>
</dependency>
```

### BOM



```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>dev.langchain4j</groupId>
            <artifactId>langchain4j-bom</artifactId>
            <version>0.34.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### SNAPSHOT依赖（最新功能）

想在官方发布前测试最新功能，可用最近 SNAPSHOT 依赖：

```xml
<repositories>
    <repository>
        <id>snapshots-repo</id>
        <url>https://s01.oss.sonatype.org/content/repositories/snapshots</url>
        <snapshots>
            <enabled>true</enabled>
        </snapshots>
    </repository>
</repositories>

<dependencies>
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j</artifactId>
        <version>0.35.0-SNAPSHOT</version>
    </dependency>
</dependencies>
```

接下来，导入 OpenAI API 密钥。建议将 API 密钥存储在环境变量中，以降低其公开暴露的风险。

```java
String apiKey = System.getenv("OPENAI_API_KEY");
```

### 注意

如没有自己的 OpenAI API 密钥，请不用担心。可暂时使用我们提供的演示密钥 `demo`，该密钥是免费提供用于演示目的：

```java
String apiKey = "demo";
```

使用 `demo` 密钥时，所有发送至 OpenAI API 的请求都会通过我们的代理进行，该代理会在将请求转发到 OpenAI API 之前注入真实密钥。我们不会以任何方式收集或使用您的数据。`demo` 密钥有使用配额限制，仅供演示用。

一旦您设置好密钥，接下来创建一个 `OpenAiChatModel` 实例：

```java
OpenAiChatModel model = OpenAiChatModel.builder()
    .apiKey(apiKey)
    .modelName(GPT_4_O_MINI)
    .build();
```

现在可以开始对话了！

```java
String answer = model.generate("Say 'Hello World'");
System.out.println(answer); // Hello World
```