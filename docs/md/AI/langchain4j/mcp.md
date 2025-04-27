# LangChain4j + MCP：让你的 AI 轻松调用外部工具（内附GitHub-MCP实战）

## 0 前言

LangChain4j 支持模型上下文协议（MCP），用于与符合 MCP 标准的服务器通信，从而调用并执行工具。

该协议支持两种通信方式，LangChain4j 均已支持：

- HTTP 模式：客户端通过 SSE 通道接收服务端事件，并通过 HTTP POST 请求发指令
- stdio 模式：客户端可将 MCP 服务器作为本地子进程运行，并通过标准输入/输出与其通信

想让聊天模型或 AI 服务使用 MCP 服务器提供的工具，先得创建一个 MCP 工具提供者实例。

## 1 创建 MCP 工具提供者（MCP tool provider）

### 1.1 MCP通信方式

先要构建一个 MCP 通信方式的实例。

#### ① stdio

以本地启动 NPM 包为例：

```java
McpTransport transport = new StdioMcpTransport.Builder()
    .command(List.of("/usr/bin/npm", "exec", "@modelcontextprotocol/server-everything@0.6.2"))
    .logEvents(true) // 开启日志记录（可选）
    .build();
```

#### ② HTTP

需要两个 URL：

- 一个用于启动 SSE channel
- 另一个用于通过 POST 提交命令：

```java
McpTransport transport = new HttpMcpTransport.Builder()
    .sseUrl("http://localhost:3001/sse") // SSE 事件channel地址
    .logRequests(true) // 开启请求日志
    .logResponses(true) // 开启响应日志
    .build();
```

### 1.2 创建 MCP 客户端

代表可以通过给定的传输协议，使用服务器检索和执行工具的客户端，该客户端可以与MCP服务器通信。

使用 transport 实例创建 MCP 客户端：

```java
McpClient mcpClient = new DefaultMcpClient.Builder()
    .transport(transport)
    .build();
```

### 1.3 创建 MCP 工具提供者

工具提供者。每次调用AI服务并为该特定调用提供工具时，都会调用它。 toolproviderresult中返回的工具将包含在对LLM的请求中。

使用 MCP 客户端创建工具提供者：

```java
ToolProvider toolProvider = McpToolProvider.builder()
    .mcpClients(List.of(mcpClient))
    .build();
```

一个 MCP 工具提供者可同时用多个 MCP 客户端。如需自定义在连接某个服务器失败时行为，可 `builder.failIfOneServerFails(boolean)` 设置：

- 默认 `false`：忽略单个服务器失败，继续使用其他服务器
- 若置 `true`：任一服务器失败都会导致整个工具提供者抛异常

将工具提供者绑定到 AI 服务中，只需在构建 AI 服务时传入：

```java
Bot bot = AiServices.builder(Bot.class)
    .chatModel(model)
    .toolProvider(toolProvider)
    .build();
```

## 2 日志功能

MCP 协议支持服务端向客户端发送日志消息。默认，客户端会将这些日志转为 SLF4J 格式输出。如想自定义日志处理逻辑，可实现 `dev.langchain4j.mcp.client.logging.McpLogMessageHandler` 接口，并传入客户端构造器：

```java
McpClient mcpClient = new DefaultMcpClient.Builder()
    .transport(transport)
    .logMessageHandler(new MyLogMessageHandler()) // 自定义日志处理器
    .build();
```

## 3 资源操作

获取服务器上的 [MCP 资源](http://www.javaedge.cn/md/AI/mcp/resources.html)，使用：

- client.listResources()：返回 `McpResource` 列表，包含资源元数据及 URI
- client.listResourceTemplates()：获取资源模板

获取资源具体内容时，用client.readResource(uri)，传入资源 URI，返回 `McpReadResourceResult`，其中包含一个或多个 `McpResourceContents`：

- `McpBlobResourceContents`：二进制资源
- `McpTextResourceContents`：文本资源

## 4 提示词操作（Prompts）

获取服务器上定义的[MCP 提示词](https://modelcontextprotocol.io/docs/concepts/prompts)，用：

- `client.listPrompts()`：返回提示词 `McpPrompt` 列表，包含名称和参数信息
- `client.getPrompt(name, arguments)`：渲染具体提示词内容，返回一组 `McpPromptMessage`，包含角色（如 `user`、`assistant`）和消息内容

当前支持的消息内容类型包括：

- `McpTextContent`：文本
- `McpImageContent`：图像
- `McpEmbeddedResource`：嵌入资源

提示词消息可用 `McpPromptMessage.toChatMessage()` 转为通用的 LangChain4j 消息类型 `ChatMessage`，但需满足：

- `role` 为 `assistant` 时，内容须是文本，否则会抛异常
- 包含二进制内容的消息无法转换

## 5 使用 Docker 运行 GitHub MCP 服务器

看一个通过 MCP 协议连接 GitHub 的示例。目标是用 LangChain4j 和 MCP 客户端获取并总结 GitHub 上公开仓库的最新提交信息。

通过 MCP 提供的 GitHub 服务器实现（见 [MCP GitHub 仓库](https://github.com/github/github-mcp-server)），通过 Docker 本地运行。

### 构建 Docker 镜像

先克隆或下载 MCP GitHub 服务器源码，进入根目录，执行以下命令构建镜像：

```bash
docker build -t mcp/github -f Dockerfile .
```

构建完成后，本地会生成 `mcp/github` 镜像：

```bash
docker image ls

REPOSITORY   TAG         IMAGE ID        SIZE
mcp/github   latest      b141704170b1    173MB
```

## 6 开发工具提供者代码示例

创建 Java 类 `McpGithubToolsExample`，使用 LangChain4j 连接 GitHub MCP 服务器，执行以下操作：

- 启动 Docker 容器运行 GitHub MCP 服务器
- 使用 stdio 通信方式连接 MCP 服务器
- 使用语言模型总结 LangChain4j 仓库最近 3 次提交信息

> ⚠️ 提示：下面代码中通过环境变量 `GITHUB_PERSONAL_ACCESS_TOKEN` 传入 GitHub Token，访问公共仓库时可选。

### 获取GITHUB_PERSONAL_ACCESS_TOKEN

直达：https://github.com/settings/personal-access-tokens/new：

![](https://p.ipic.vip/1qknlc.png)

自己保存好：

![](https://p.ipic.vip/ir198y.png)

构建好的镜像：

![](https://p.ipic.vip/m7cgzz.png)


```bash
docker run --rm -d \
  --name mcp-github-server \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=token \
  mcp/github
```

启动成功：

![](https://p.ipic.vip/isdabp.png)

```java
public static void main(String[] args) throws Exception {

    ChatLanguageModel model = OllamaChatModel.builder()
        .baseUrl("http://localhost:11434") // Ollama 默认本地服务地址
        .modelName("llama3-groq-tool-use:8b") // 你本地 Ollama 拉取的模型名称
        .logRequests(true)
        .logResponses(true)
        .build();

    McpTransport transport = new StdioMcpTransport.Builder()
        .command(List.of("/usr/local/bin/docker", "run", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "-i", "mcp/github"))
        .logEvents(true)
        .build();

    McpClient mcpClient = new DefaultMcpClient.Builder()
        .transport(transport)
        .build();

    ToolProvider toolProvider = McpToolProvider.builder()
        .mcpClients(List.of(mcpClient))
        .build();

    Bot bot = AiServices.builder(Bot.class)
        .chatModel(model)
        .toolProvider(toolProvider)
        .build();

    try {
        String response = bot.chat("Summarize the last 3 commits of the LangChain4j GitHub repository");
        System.out.println("RESPONSE: " + response);
    } finally {
        mcpClient.close();
    }
}
```

## 7 执行示例代码

运行 Java 应用后，收到类似输出，总结 LangChain4j 仓库最近 3 次提交内容：

```
以下是 LangChain4j GitHub 仓库最近三次提交的摘要：

1. **提交 [36951f9](https://github.com/langchain4j/langchain4j/commit/36951f9649c1beacd8b9fc2d910a2e23223e0d93)**（时间：2025-02-05）
   - **作者：** Dmytro Liubarskyi
   - **信息：** 更新至 `upload-pages-artifact@v3`
   - **详情：** 此提交将上传页面资源的 GitHub Action 升级至版本 3。

2. **提交 [6fcd19f](https://github.com/langchain4j/langchain4j/commit/6fcd19f50c8393729a0878d6125b0bb1967ac055)**（时间：2025-02-05）
   - **作者：** Dmytro Liubarskyi
   - **信息：** 更新至 `checkout@v4`、`deploy-pages@v4` 和 `upload-pages-artifact@v4`
   - **详情：** 此提交升级了多个 GitHub Action 到版本 4。

3. **提交 [2e74049](https://github.com/langchain4j/langchain4j/commit/2e740495d2aa0f16ef1c05cfcc76f91aef6f6599)**（时间：2025-02-05）
   - **作者：** Dmytro Liubarskyi
   - **信息：** 更新至 `setup-node@v4` 和 `configure-pages@v4`
   - **详情：** 此提交将相关 GitHub Action 升级至版本 4。

这三次提交都由 Dmytro Liubarskyi 完成，时间相同，主要内容为将 GitHub Actions 升级至新版。
```