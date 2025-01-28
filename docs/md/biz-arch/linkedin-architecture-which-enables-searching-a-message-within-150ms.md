# LinkedIn搜索架构独家解析：如何实现150毫秒极速响应？

## 0 前言

你在 LinkedIn 上收到一位老同事请求推荐的信息。你还在996，所以只是快速确认了信息，却忘记保存他们发的简历。几天后想起这段聊天，但又懒得滚动，于是直接输入关键词搜索：

![](https://cdn-images-1.readmedium.com/v2/resize:fit:800/1*xocsMb0aBN10ELhjIJDFcw.png)

这简单操作正是 LinkedIn 消息搜索系统的全部功能。但为何这么流畅？幕后原理是啥？本文深入了解 LinkedIn 搜索架构及。

## 1 搜索服务

搜索信息的一个核心理念：每条信息的搜索都仅限于用户，即用户只能在自己的收件箱中搜索。这点很重要，因为我们知道搜索时只需搜索用户，可根据用户创建搜索索引。

![](https://cdn-images-1.readmedium.com/v2/resize:fit:800/1*7V8IUZAYSVycf39hQHAX-w.png)

但Linkedin 的一大发现：并非所有用户都用搜索功能。因此，他们没有为每个用户创建和更新索引，而只为主动进行搜索的用户创建索引。这是为优化成本和写入性能，因为若为每个用户存储索引，索引就会存储在磁盘，而为每个用户创建内存索引的成本会很高。在写繁重的系统，将索引存储在磁盘中将意味着从磁盘中读取索引、解密信息、再次更新信息和索引、加密信息并再次将其存储在磁盘中，导致写效率极低。

## 2  RocksDB: 存储信息

LinkedIn 使用高性能KV存储库 RocksDB 存储消息。每条信息的数据结构都很简单，用键值对代表信息元数据：

- **Key**: `MemberId | ConversationId | MessageId`
- **Value**: The content of the message, 如："嗨，JavaEdge，你好吗？能帮我介绍一下这个职位吗？注意，Value是加密的

当用户的收件箱中收到一条新邮件时，它就会以新记录的形式存储在 RocksDB 中，包括成员 ID、对话 ID 和邮件 ID。如：

- `member-id1|conversation-id1|message-id1`

![](https://cdn-images-1.readmedium.com/v2/resize:fit:800/1*_wct8GPJtY01YfdNd1n-tg.png)



## 3 使用 Lucene 进行反向索引

现在，为搜索消息，LinkedIn 使用 lucene，它使用倒排索引--本质上是单词（或标记）到它们在文档（消息）中出现次数的映射。每条信息都被视为一个文档。如

### 文件 1：

```json
{
  "message": "Hi Mayank, how are you? Can you refer me to this position?"
}
```

### 文件 2：

```json
{
  "message": "Hi Mayank, can you refer me to this new position?"
}
```

### 步骤 1：标记信息

信息被标记为单个单词（忽略标点符号并全部小写）：

**Document 1 Tokens**:

["hi", "mayank", "how", "are", "you", "can", "you", "refer", "me", "to", "this", "position" ]

**Document 2 Tokens**:
["hi", "mayank", "can", "you", "refer", "me", "to", "this", "new", "position"]

### 步骤 2：建立反向索引

Lucene 通过将每个单词（标记）映射到它们出现的文档来创建倒排索引。下面是这两个文档的索引：

![](https://cdn-images-1.readmedium.com/v2/resize:fit:800/1*XIdUVT47N6XHT4sebxvtzg.png)

#### 反向指数的解释

- "hi "出现在两份文件中（信息-id-1 和信息-id-2）。它在两份信息中都位于位置 1。
- "You "出现在两份文件的不同位置：在信息-id-1 的第 5 和第 7 位，在信息-id-2 的第 4 和第 6 位。
- 在两份文件中，"refer "分别出现在 message-id-1 的第 8 位和 message-id-2 的第 6 位。

### 步骤 3：进行搜索

当用户搜索 "refer "一词时，系统将

1. 在倒排索引中查找 "refer"。
2. 发现它分别出现在信息-id-1 和信息-id-2 的第 8 和第 6 位。
3. 然后，系统就能从这两份文件中快速检索出相关信息。

LinkedIn 实施的一项重要性能优化是将索引存储在内存中，而不是磁盘上。这对性能至关重要，因为将索引存储在内存中可以加快搜索结果的速度，最大限度地减少延迟。当提出搜索请求时，系统会快速扫描内存中的索引并返回结果。

## 4 咋决定何时创建索引？

LinkedIn 不会自动为所有用户创建索引。相反，它会在有搜索请求时触发索引创建。具体操作如下：

![](https://cdn-images-1.readmedium.com/v2/resize:fit:800/1*XQx-sL2zVv-41qjybXfjPA.png)

1. 搜索请求：当用户提交搜索请求时，系统会对 RocksDB 中的 MemberId 进行前缀扫描。这将检索与该用户相关的所有信息。
2. 创建文档：为每条信息创建一个文档，其中包含成员 ID、对话 ID、信息 ID 和信息文本。
3. 建立索引：将文件添加到索引中，索引存储在内存中，以便快速查找。

## 5 分区

索引在系统中的多个节点上进行分区，分区的依据是 MemberId 和 DocumentId。这样可以确保不会有任何一个节点因为来自某个用户的大量信息而不堪重负。

为此，有一个协调器节点作为所有搜索查询的入口。协调器节点将搜索查询发送到各个节点，收集搜索结果，并根据相关性对搜索结果进行排序，然后将最终结果发回给用户。

## 6 使用 Zookeeper 进行节点协调

LinkedIn 依靠内部服务 D2（一种分布式协调服务）来维护系统中的节点信息。D2 帮助协调节点确定哪些节点应该处理搜索请求，确保查询被发送到正确的节点。

![](https://cdn-images-1.readmedium.com/v2/resize:fit:800/1*UQwhesTXgCGUdGkGsMssCw.png)

此外，LinkedIn 还采用了粘性路由，这意味着针对特定成员的所有搜索请求都会路由到同一个副本。这可以确保搜索结果的一致性，并防止在多个副本上重建索引，从而提高性能和一致性。

## 7 Conclusion: 结论

我们研究了 Linkedin 所做的一些巧妙的设计决定，这些决定不仅帮助他们节省了搜索时间，还帮助他们降低了基础设施的成本。他们实施的内部搜索解决方案满足了他们的需求。