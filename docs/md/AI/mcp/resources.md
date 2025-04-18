# 释放数据潜力：利用 MCP 资源让大模型读懂你的服务器

## 0 前言

> 向LLM暴露服务器上的数据和内容

资源（Resources）是MCP核心概念，允许服务器将数据和内容暴露，供客户端读取，并作为大模型交互的上下文使用。

### 注意

资源是**由应用控制**的，即客户端应用可自行决定资源的使用方式和时机。不同 MCP 客户端可能不同方式处理资源，如：

- Claude Desktop 要求用户手动选择资源后才能用
- 其他客户端可能会基于启发式方法自动选择资源
- 有些实现甚至允许 AI 模型自行决定使用哪些资源。

因此，服务器开发者在实现资源支持时，应考虑各种交互方式。如希望自动将数据暴露给模型，应使用**由模型控制**的工具。

## 1 概述

资源可代表 MCP 服务器希望提供给客户端的任何类型的数据，包括但不限于：

- 文件内容
- 数据库记录
- API 响应
- 实时系统数据
- 截图和图像
- 日志文件
- 其他各种数据

每个资源都有一个唯一 URI 标识，内容可以是文本或二进制数据。

## 2 URI

资源通过 URI 唯一标识，格式如下：

```
[protocol]://[host]/[path]
```

示例：

- `file:///home/user/documents/report.pdf`
- `postgres://database/customers/schema`
- `screen://localhost/display1`

URI 的协议和路径结构由 MCP 服务器自行定义，服务器可定制自己的 URI 方案。

## 3 类型

资源内容可分为两种类型：

### 3.1 文本

包含 UTF-8 编码的文本数据，适合以下内容：

- 源代码
- 配置文件
- 日志文件
- JSON/XML 数据
- 纯文本

### 3.2 二进制

包含使用 base64 编码的原始二进制数据，适合以下内容：

- 图像
- PDF
- 音频文件
- 视频文件
- 其他非文本格式

## 4 发现方式

客户端可通过两种方式发现可用资源：

### 4.1 直接资源列表

服务器通过 `resources/list` 接口提供明确的资源清单，每个资源包含以下信息：

```typescript
{
  uri: string;           // 资源唯一标识
  name: string;          // 可读名称
  description?: string;  // 可选描述信息
  mimeType?: string;     // 可选 MIME 类型
}
```

### 4.2 资源模板

对于动态资源，服务器可暴露 [URI 模板](https://datatracker.ietf.org/doc/html/rfc6570)，客户端可根据模板生成合法的资源 URI：

```typescript
{
  uriTemplate: string;   // 遵循 RFC 6570 的 URI 模板
  name: string;          // 可读名称
  description?: string;  // 可选描述
  mimeType?: string;     // 可选 MIME 类型
}
```

## 5 读取资源内容

客户端使用资源 URI 通过 `resources/read` 请求读取资源，服务器返回资源内容列表：

```typescript
{
  contents: [
    {
      uri: string;        // 资源 URI
      mimeType?: string;  // 可选 MIME 类型

      // 二选一：
      text?: string;      // 文本内容
      blob?: string;      // 二进制内容（base64 编码）
    }
  ]
}
```

服务器可在一次 `resources/read` 请求中返回多个资源，如读取目录时可返回其中的所有文件。

## 6 更新

MCP 支持实时资源更新，主要有两种机制：

### 6.1 列表变更

当服务器的资源列表发生变化时，通过 `notifications/resources/list_changed` 通知客户端。

### 6.2 内容变更

客户端可以订阅某个资源的变更：

1. 客户端发送 `resources/subscribe` 请求并附带资源 URI；
2. 服务器在资源内容变更时，发送 `notifications/resources/updated` 通知；
3. 客户端通过 `resources/read` 获取最新内容；
4. 客户端可以发送 `resources/unsubscribe` 取消订阅。

## 7 示例

简单的 MCP 服务器实现资源支持的例子：

```js
// 提供资源列表
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "file:///logs/app.log",
        name: "应用日志",
        mimeType: "text/plain"
      }
    ]
  };
});

// 读取资源内容
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === "file:///logs/app.log") {
    const logContents = await readLogFile();
    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: logContents
        }
      ]
    };
  }

  throw new Error("未找到资源");
});
```

```python
@app.list_resources()
async def list_resources() -> list[types.Resource]:
    return [
        types.Resource(
            uri="file:///logs/app.log",
            name="应用日志",
            mimeType="text/plain"
        )
    ]

@app.read_resource()
async def read_resource(uri: AnyUrl) -> str:
    if str(uri) == "file:///logs/app.log":
        log_contents = await read_log_file()
        return log_contents

    raise ValueError("未找到资源")

# 启动服务器
async with stdio_server() as streams:
    await app.run(
        streams[0],
        streams[1],
        app.create_initialization_options()
    )
```

## 8 最佳实践

实现资源支持时，建议：

1. 使用清晰、具描述性的资源名称和 URI；
2. 添加有用的描述，帮助大模型理解资源；
3. 在已知的情况下设置合适的 MIME 类型；
4. 为动态内容实现资源模板；
5. 对频繁变更的资源使用订阅机制；
6. 出错时返回清晰明了的错误信息；
7. 对资源列表进行分页处理（如有必要）；
8. 在适当情况下缓存资源内容；
9. 处理资源前先验证 URI；
10. 文档中注明自定义的 URI 方案。

## 9 安全

在暴露资源时，请注意以下安全措施：

- 验证所有资源 URI 的合法性；
- 实施适当的访问控制策略；
- 清理文件路径，防止目录遍历攻击；
- 谨慎处理二进制数据；
- 对资源读取设置速率限制；
- 审计资源访问记录；
- 传输过程中加密敏感数据；
- 验证 MIME 类型是否符合预期；
- 为耗时较长的读取操作设置超时机制；
- 适时清理过期或无效资源。