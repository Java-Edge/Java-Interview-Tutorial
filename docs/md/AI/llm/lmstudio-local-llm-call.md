# Ollama平替！LM Studio本地大模型调用实战

## 0 前言

可像 Ollama 通过暴露本地端口，实现本地客户端调用。

## 1 选择模型

在 LM Studio 的 “开发者” 选项卡中选择模型：

![](https://p.ipic.vip/e81rln.png)



## 2 端口暴露

设置暴露的端口（默认1234）：

![](https://p.ipic.vip/pz7q9q.png)

启用 CORS 后，可对接网页应用或其他客户端工具。

## 3 启动服务

点击状态选项卡：

![](https://p.ipic.vip/1b27ep.png)

控制台会显示运行日志和访问地址：

![](https://p.ipic.vip/mre6nr.png)

## 4 快速上手

### 4.1 快速ping

列出已加载并就绪的模型：

```bash
curl http://127.0.0.1:1234/v1/models/
```

![](https://p.ipic.vip/prjgve.png)

这也是验证服务器是否可访问的一种有效方法！

### 4.2 聊天

这是一个类似调用OpenAI的操作，通过`curl`工具访问`/v1/chat/completion`端点：

- 在Mac或Linux系统，可用任意终端运行
- Windows系统用Git Bash 

```bash
curl http://127.0.0.1:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-4-maverick-17b-128e-instruct",
    "messages": [ 
      { "role": "system", "content": "Always answer in rhymes." },
      { "role": "user", "content": "Introduce yourself." }
    ], 
    "temperature": 0.7, 
    "max_tokens": -1,
    "stream": true
  }'
```

该调用是“无状态的”，即服务器不会保留对话历史记录。调用方有责任在每次调用时提供完整的对话历史记录。 

#### 流式传输 V.S 累积完整响应

注意`"stream": true`（流式传输：开启）参数:

- `true`（开启）时，LM Studio会在预测出标记（token）的同时将其逐一流式返回
- 如将此参数设置为`false`（关闭），在调用返回之前，完整的预测结果会被先累积起来。对于较长的内容生成或者运行速度较慢的模型，这可能需要花费一些时间！