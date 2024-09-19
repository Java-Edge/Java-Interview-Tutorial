# ChatGPT为啥不用Websocket而是EventSource

## 1 前言

在ChatGPT官网我们可以看到，对话的方式仅仅只有一个`post`请求，而没有使用`IM`中使用的`websocket`链接。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/6462b9dffb8a2d79d2be30d7b6c5a18f.png)

和普通`POST`请求不一样的，返回信息`Response`没了，取而代之的是`EventStream`。

这`EventStream`是啥玩意？gpt 一下，原来是Web API中的`EventSource`接口返回的数据。

## 2 MDN官方描述

`EventSource` 接口是 web 内容与服务器发送事件 一个 `EventSource` 实例会对HTTP服务器开启一个持久化的连接，以 `text/event-stream` 格式发送事件，此连接会一直保持开启直到通过调用 `EventSource.close()` 关闭。

EventSource也称为 Server-Sent Events，SSE。

## 3  EventSource V.S  Websocket

### 3.1 EventSource

#### 3.1.1 优势

##### ① 简单易用

EventSource API非常简单，只需要创建一个 `EventSource` 对象并指定服务器端的 URL，就可以开始接收服务器推送的消息。相比之下，WebSocket 需要处理更多的事件和状态变化。

##### ② 服务器推送

EventSource适用于服务器主动向客户端推送数据，客户端只能接收服务器发送的事件。

**服务器端实现简单**：服务器端可以通过简单的 HTTP 响应流推送事件给客户端，而不需要处理复杂的 WebSocket 协议。

##### ③ 自动重连

EventSource 有内置的自动重新连接功能，断开连接后会自动尝试重新连接，适用于长期保持连接并接收事件流的场景。

这在 WebSocket 中需要手动实现。

##### ④ 兼容性

EventSource在大多数现代浏览器中得到支持，无需额外的库支持。

**利用现有的 HTTP 基础设施**：EventSource 使用标准的 HTTP 协议，易通过现有的代理、防火墙和负载均衡器，而这些在 WebSocket 中可能需要额外配置。

**长连接**：SSE 建立后会保持一个长期的 HTTP 连接，并不断从服务器接收数据。

#### 3.1.2  劣势

##### ① 单向通信

只支持从服务器到客户端的单向通信，客户端无法向服务器发送数据。如需双向通信（例如聊天应用），WebSocket 更适合。

##### ① 较少的功能

相比于WebSocket，EventSource提供的功能较为有限，仅限于接收服务器发送的事件。

##### ② 性能和效率

**效率较低**：在大量小消息或高频率消息传输的场景下，WebSocket 的二进制传输和帧控制带来更高的效率。

#### 3.1.3 适用场景

考虑以上优劣，EventSource 适用于以下场景：

- **实时更新**：需要从服务器实时接收数据更新，如股票行情、新闻推送等。
- **简单的通知系统**：例如简单的服务器状态或系统通知。
- **资源受限的应用**：对于只需要简单实时通信的应用，EventSource 的实现和维护成本更低。

综上所述，选择 EventSource 而非 WebSocket 主要是因为其简单性、HTTP 兼容性、自动重连功能以及更易于实现和维护的服务器端需求。然而，如果应用需要复杂的双向通信和高效的数据传输，WebSocket 会是更好的选择。

### 3.2 WebSocket

#### 3.2.1 优势

##### ① 双向通信

WebSocket支持双向通信，客户端和服务器可以彼此发送数据。

##### ② 实时性

WebSocket提供了更低的延迟和更快的数据传输速度，适用于实时性要求较高的应用场景。

##### ③ 丰富的功能

WebSocket提供了更多的功能，例如数据帧的自定义和二进制数据的传输等。

#### 3.2.2 劣势

##### ① 复杂性

WebSocket API相对于EventSource更为复杂，使用起来可能需要更多的代码和理解。

##### ② 需要服务器支持

使用WebSocket需要服务器端实现对应的WebSocket协议，而EventSource只需要服务器端支持发送事件即可。

##### ③ 兼容性

相对于EventSource，WebSocket在某些较旧的浏览器或网络环境中的支持可能不够广泛。

综上，`EventSource` 适用于服务器主动推送事件给客户端，并且在保持长期连接和接收事件流时表现良好。 `WebSocket` 适用于需要实时双向通信和更丰富功能的场景，但需要服务器端和客户端都支持 `WebSocket` 协议，选择使用哪种技术应基于具体需求和应用场景进行评估。

## 4 ChatGPT选择理由

个人猜测是考虑到：

### 4.1 仅服务器推送

`EventSource`专注于服务器向客户端主动推送事件的模型，这对于`ChatGPT`对话非常适用。`ChatGPT`通常是作为一个长期运行的服务，当有新的回复可用时，服务器可以主动推送给客户端，而不需要客户端频繁发送请求。

### 4.2 自动重连和容错

`EventSource`具有内置的自动重连机制，它会自动处理连接断开和重新连接的情况。这对于`ChatGPT`对话而言很重要，因为对话可能需要持续一段时间，连接的稳定性很重要。

### 4.3 简单易用

相比`WebSocket`，`EventSource`的API更加简单易用，只需实例化一个`EventSource`对象，并处理服务器发送的事件即可。这使得开发者可以更快速地实现对话功能，减少了一些复杂性。

### 4.3 浏览器兼容性

`EventSource`在大多数现代浏览器中得到广泛支持，包括移动端浏览器。相比之下，`WebSocket`在某些旧版本的浏览器中可能不被完全支持，需要考虑兼容性问题。

`WebSocket`也是一种很好的选择，特别是当需要实现更复杂的实时双向通信、自定义协议等功能时，或者对浏览器的兼容性要求较高时。最终选择使用`WebSocket`还是`EventSource`应该根据具体的项目需求和技术考虑来确定。

注意`EventSource`只支持GET请求。ChatGPT是通过自己重写方法来发起POST请求的。