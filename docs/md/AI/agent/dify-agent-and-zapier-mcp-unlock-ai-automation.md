# Dify Agent 与 Zapier MCP：解锁 AI 自动化新境界

## 0 前言

随AI Agent快速发展，使LLM与现实数据和工具无缝交互成为关键挑战。

## 1 Dify社区的MCP插件

Dify社区贡献了强大插件，以简化将外部 MCP 服务（如 Zapier MCP 和 Composio MCP）连接到你的 Agent 工作流过程：

### 1.1 MCP SSE

该插件用 HTTP + SSE与一或多个 MCP 服务器进行通信，使你的代理能动态发现和调用外部工具。

### 1.2 MCP Agent Strategy

该插件将 MCP 直接集成到工作流代理节点中，使代理能根据 MCP 定义的逻辑自主决定并调用外部工具。

![](https://p.ipic.vip/59zpeg.png)

## 2 Dify集成Zapier MCP

Zapier MCP 服务器将超过 7,000 个应用和 30,000 个操作打包到单个 MCP 服务器 URL 中。从电子邮件到 CRM 更新或 Slack 通知，可在 Zapier 中快速配置操作，再直接插入Dify Agent工作流。

### 2.1 快速设置

1. 访问 [Zapier MCP 设置 ](https://actions.zapier.com/settings/mcp/)，https://mcp.zapier.com/mcp/servers/7cda9b58-3bd3-4165-aff5-4b6a6945173a/connections
2. 复制你唯一的 MCP 服务器端点链接
3. 单击“编辑 MCP 操作”以添加新工具和操作

![](https://p.ipic.vip/i4n4nn.png)

4. 选择一个应用程序（如Gmail）
5. 选择并配置特定操作，如【Send Email】

![](https://p.ipic.vip/83wri7.png)

6. 设置【Send Email】：

- 点击 Gmail 下的“连接”，登录并授权你的账户。
- 对于收件人、主题和正文等字段，选择“让 AI 猜测一个值”，允许根据您的代理的交互动态生成 AI 驱动的内容。

![](https://p.ipic.vip/k3w8v2.png)

新UI：

![](https://p.ipic.vip/aiwjw5.png)

7. 重复此操作，以添加其他操作，扩展你的工具包：

![](https://p.ipic.vip/for6h3.png)

### 新增工具

![](https://p.ipic.vip/mzb9s5.png)

可见很多工具，选择【Gmail】：

![](https://p.ipic.vip/wdyw93.png)

再挑选【Gmail tools】，如【Send Email】：

![](https://p.ipic.vip/zuwnuk.png)

### 设置要连接的MCP client

![](https://p.ipic.vip/3x7na0.png)

先临时设置 cursor 为客户端，再点击【Connect】选项页：

![](https://p.ipic.vip/79nuij.png)

采集这里的 Server URL。

## 3 用于动态工具调用的 MCP SSE 插件

从 Dify Marketplace 安装 MCP SSE 插件：

![](https://p.ipic.vip/v6li0k.png)

安装完成后，将下方模板中的 URL 替换为刚才配置的 Zapier MCP 服务器 URL：

```json
{
  "server_name": {
    "url": "https://actions.zapier.com/mcp/*******/sse",
    "headers": {},
    "timeout": 5,
    "sse_read_timeout": 300
  }
}
```

打开已安装的【MCP SSE 插件】，填写【MCP 服务配置】：

![](https://p.ipic.vip/39p8wb.png)

保存操作成功：

![](https://p.ipic.vip/b1dofw.png)

### 多个 MCP 服务器（如Composio）配置

可能如下：

```json
{
  "server_name1": {
    "url": "http://127.0.0.1:8000/sse",
    "headers": {},
    "timeout": 5,
    "sse_read_timeout": 300
  },
  "server_name2": {
    "url": "http://127.0.0.1:8001/sse"
  }
}
```

### 新建Agent类型的应用

配置完成后，创建新应用，并在“工具”部分启用你的 MCP SSE 插件

![](https://p.ipic.vip/ib0kjh.png)

Agent 将根据用户意图智能地调用相关工具，如通过集成的 Gmail 操作自动起草和【Send Email】：

![](https://p.ipic.vip/ux5mpt.png)

 我的 qq 邮箱就收到邮件：

![](https://p.ipic.vip/lrl793.png)

还可将联系人 Excel 文件上传到 Dify 的知识库。这样，当你仅提供收件人姓名和邮件内容时，代理即可自动匹配收件人的邮件地址。

还可设置特定提示，以确保邮件在发送前得到用户的确认：

![](https://p.ipic.vip/rsg2k1.png)

回复确认即可：

![](https://p.ipic.vip/ig5s5u.png)

收到邮件：

![](https://p.ipic.vip/5xynwh.png)

#### 提示词

联系我本人 vx 获取。

## 4 通过Agent Strategy插件集成 MCP

除了 SSE 插件，MCP Agent Strategy 插件将 MCP 直接嵌入到你的工作流 Agent 节点：

![](https://p.ipic.vip/fzip11.png)

安装完成后，按照类似方式配置MCP服务器 URL：

```json
{
  "server_name": {
    "url": "https://actions.zapier.com/mcp/*******/sse",
    "headers": {},
    "timeout": 5,
    "sse_read_timeout": 300
  }
}
```

![](https://p.ipic.vip/5jboy9.png)

通过此配置，你的工作流代理可自主利用 Zapier MCP 执行诸如发送 Gmail 电子邮件之类的任务，作为自动化工作流的一部分。

![](https://p.ipic.vip/cc8ref.png)

## 5 总结

Dify MCP 功能依赖社区开发的优秀插件。Dify正积极开发原生 MCP 支持，以更轻松在 Dify 直接配置 Zapier MCP 和 Composio 等外部服务，为用户打造更丰富、更强大集成功能。