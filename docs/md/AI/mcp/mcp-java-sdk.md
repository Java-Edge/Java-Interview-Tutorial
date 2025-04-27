# MCP Java SDK 与 Spring AI 强强联手：简化 Java AI 开发流程

## 0 前言

MCP Java SDK 为 AI 模型与工具和数据源的集成提供了强大基础，文章介绍了 SDK 中的核心功能。

## 1 MCP Java SDK 简介

这个 SDK 最初在去年十一月是一个实验性项目，如今已经发展为与 Spring AI 团队和 Anthropic 的正式合作成果。如今这个实验项目已经正式成为 MCP Java SDK。

MCP Java SDK 是继 Python、TypeScript 和 Kotlin SDK 之后，协议支持的最新语言绑定，可在MCP 官网找到：

![](https://p.ipic.vip/l1y7zb.png)

Java 一直是企业级开发的主流语言，而 MCP Java SDK 的出现，使企业更容易开发前沿的 AI 应用。该 SDK 为 AI 模型与外部工具和数据源的集成提供了全面的基础功能。

## 2 核心特性

### 客户端与服务端实现

- 支持同步和异步的 MCP 通信。
- 支持协议版本兼容性协商，实现良好的互操作性。

### 工具与资源管理

- 可动态发现、注册并执行工具。
- 实时接收工具和资源列表的变更通知。
- 通过 URI 模板管理资源，实现结构化访问和订阅。

### Prompt 处理与 AI 采样支持

- 获取并管理 Prompt，以定制 AI 模型的行为。
- 支持多种采样策略，优化 AI 交互效果。

### 多种传输实现

- 基于 Stdio 的传输，用于直接进程通信
- 基于 Java HttpClient 的 SSE 客户端传输，用于基于 HTTP 的流式通信
- 基于 Servlet 的 SSE 服务端传输，适用于传统服务器环境的 HTTP 流式传输
- 基于 Spring 的传输方式，便于与 Spring Boot 集成：
  - 基于 Spring WebFlux 的 SSE 传输，适用于响应式应用
  - 基于 Spring WebMVC 的 SSE 传输，适用于基于 servlet 的应用

## 3 Spring AI 与 MCP

Spring AI 项目基于 MCP Java SDK 进行了扩展，提升与 Spring Boot 应用集成的开发效率。通过Spring Boot starters，开发者可用 Spring 的依赖注入和配置管理功能，快速配置 MCP 客户端和服务端，让基于 AI 的工作流更易接入应用系统。

#### 客户端Starters

- `spring-ai-mcp-client-spring-boot-starter` —— 核心客户端启动器，支持 STDIO 和基于 HTTP 的 SSE 传输。
- `spring-ai-mcp-client-webflux-spring-boot-starter` —— 支持响应式应用的 WebFlux SSE 传输实现。

#### 服务端Starters

- `spring-ai-mcp-server-spring-boot-starter` —— 核心服务端启动器，支持 STDIO 传输
- `spring-ai-mcp-server-webmvc-spring-boot-starter` —— 基于 Spring MVC 的 SSE 传输实现，适用于 servlet 应用
- `spring-ai-mcp-server-webflux-spring-boot-starter` —— 基于 WebFlux 的 SSE 传输实现，适用于响应式应用

### 示例

通过声明方式配置 STDIO 传输客户端应用。在 `application.yml` 中添加如下配置：

```yaml
spring:
  ai:
    mcp:
      client:
        stdio:
          servers-configuration: classpath:mcp-servers.json
```

而所引用的 JSON 文件，采用 Claude Desktop 格式定义要连接的 MCP 服务端：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/Desktop",
        "/Users/username/Downloads"
      ]
    }
  }
}
```

当客户端应用启动时，它会自动启动 MCP 服务端，建立 STDIO 通信通道，并负责管理服务端生命周期。

Spring AI M6 版本引入 `@Tool` ，简化 MCP 服务端创建过程。