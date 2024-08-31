# RocketMQ 5.x任意时间延时消息（RIP-43） 原理详解

## 1 任意时间定时

要点在于:

- 知道在某一时刻需要投递哪些消息
- 破除一个队列只能保存同一个延迟等级的消息的限制

联想 `IndexFile`，可辅助定时消息的查询。需要建立这样的一个索引结构：

- K=时间戳
- V=这个时间要投递的所有定时消息

```java
Map<Long /* 投递时间戳 */, List<Message /* 被定时的消息 */>>
```

把这个索引结构以文件形式实现，其中的 `Message` 可仅保存消息的存储位置，投递时候再查出来。

RIP-43引入这样两个存储文件：`TimerWheel` 和 `TimerLog`，存储结构如下：

![](https://scarb-images.oss-cn-hangzhou.aliyuncs.com/img/202308072300082.png)

`TimerWheel` 是时间轮的抽象，表示投递时间，保存2天（默认）内的所有时间窗。每个槽位表示一个对应的投递时间窗，可调整槽位对应的时间窗长度来控制定时的精确度。

可复用，2天后无需新建时间轮文件，只要将当前时间轮直接覆盖。

`TimerLog` 是定时消息文件，保存定时消息的索引（在`CommitLog` 中存储的位置）。

`TimerWheel` 中的每个槽位都可保存一个指向 `TimerLog` 中某个元素的索引，`TimerLog` 中的元素又保存它前一个元素的索引。也就是说，`TimerLog` 呈链表结构，存储着 `TimerWheel` 对应槽位时间窗所要投递的所有定时消息。

#### 2.2.2 定时消息轮转：避免定时消息被老化删除

为防止定时消息在投递之前就被老化删除，能想到的办法：

- 单独文件存储，不受 Rocketmq 老化时间限制：需要引入新的存储文件，占用磁盘空间
- 定时消息被老化前，重新将他放入 CommitLog：需要在消息被老化前重新将其放入 `CommitLog`，增加处理逻辑的复杂性

RIP-43选择第二种方案，在定时消息**放入时间轮前**进行判断，如果在 2 天内要投递（在时间轮的时间窗口之内），则放入时间轮，否则重新放入 `CommitLog` 进行轮转。

#### 2.2.3 定时任务划分和解耦

RIP-43 中，将定时消息的保存和投递分为多个步骤。为每个步骤单独定义了一个服务线程来处理。

保存：

1. 从定时消息 Topic 中扫描定时消息
2. 将定时消息（偏移量）放入 `TimerLog` 、 `TimeWheel` 保存

投递：

1. 从时间轮中扫描到期的定时消息（偏移量）
2. 根据定时消息偏移量，到 `CommitLog` 中查询完整的消息体
3. 将查到的消息投递到 `CommitLog` 的目标 Topic

每两个步骤之间都用生产-消费模式，用一个有界的 `BlockingQueue` 作为任务的缓冲区，通过缓冲区实现每个步骤的流量控制。当队列满时，新的任务需要等待，无法直接执行。

##  定时消息文件设计

RIP-43引入两个采用本地文件系统存储的文件：`TimerWheel` 和 `TimerLog`

###  `TimerWheel` 时间轮

时间轮是对时刻表的抽象，是个数组，表示一段时间。每项都是一个槽位，表示时刻表上的每一秒。

#### 采用时间轮的好处

可循环使用，在时间轮表示的这段时间过去之后，无需创建新的文件，直接可以表示下一段时间。

时间轮的每个槽位表示这一时刻需投递的所有定时消息，槽位中保存指向 `TimerLog` 的指针，与 `TimerLog` 一同构成一个链表，表示这组消息。

#### 时间轮的槽位设计



| delayed_time(8B) 延迟时间 | first_pos(8B) 首条位置 | last_pos(8B) 最后位置 | num(4B)消息条数 |
| ------------------------- | ---------------------- | --------------------- | --------------- |

- `first_pos`：TimerLog 中该时刻定时消息链表的第一个消息的物理偏移量（链表尾）
- `last_pos`：TimerLog 中该时刻定时消息链表的最后（最新）一个消息的物理偏移量（链表头）

### TimerLog 定时消息索引文件

`TimerLog` 与 `TimerWheel` 配合，表示某时刻需要投递的定时消息集合。

是与 `CommitLog` 相似的 Append-only Log，不过每项无需保存消息的全量信息，只保存了消息在 `CommitLog` 上的物理偏移量，节省空间。

它与 `TimerWheel` 中的槽位组成链表结构，所以它的每一项也有一个指向该项上一项的指针。

它的每项结构：

| 名称         | 大小 | 备注                                     |
| ------------ | ---- | ---------------------------------------- |
| size         | 4B   | 保存记录的大小                           |
| prev_pos     | 8B   | 前一条记录的位置                         |
| next_Pos     | 8B   | 后一条记录的位置，暂时为-1，作为保留字段 |
| magic        | 4B   | magic value                              |
| delayed_time | 4B   | 该条记录的定时时间                       |
| offset_real  | 8B   | 该条消息在commitLog中的位置              |
| size_real    | 4B   | 该条消息在commitLog中的大小              |
| hash_topic   | 4B   | 该条消息topic的hash code                 |
| varbody      |      | 存储可变body，暂时为空                   |

### 3.2 定时消息投递步骤

定时消息主要的逻辑分为保存、投递两阶段，RIP-43将每个节点都拆分成不同任务（服务线程），用生产-消费模式衔接每个任务，实现任务的解耦和流控。

![](https://scarb-images.oss-cn-hangzhou.aliyuncs.com/img/202308081638752.png)

如上图，带有 `enqueue` 的为定时消息保存的线程和队列，带有 `dequeue` 的为定时消息投递的线程和队列。

#### 定时消息保存

定时消息被保存到 `CommitLog` 前，会检查其属性，若消息属性包含定时属性，则会将真正要投递的 Topic 暂存到消息属性中，把投递的 Topic 改成 `rmq_sys_wheel_timer`。

随后等待服务线程扫描这个定时 Topic 中的消息，放入时间轮，开始定时。

为避免瞬时保存的定时消息过多，采用生产-消费模式，将保存过程分为扫描、入轮两步。

#### 扫描定时消息

TimerEnqueueGetService遍历消费队列索引，不断扫描定时消息 Topic 中新的定时消息。

扫描到了，就将消息从 `CommitLog` 中查出来，封装成 `TimerRequest`，放入有界阻塞队列 `enqueuePutQueue`。如果队列满，则会无限次重试等待，达到流控效果。

##### `TimerEnqueuePutService` 将定时消息放入时间轮和 `TimerLog`

不断扫描队列 `enqueuePutQueue`，取出 `TimerRequest`，并**批量**放入 `TimerLog`，再放入时间轮槽位。一批结束之后再操作下一批。

若定时时间小于当前写 `TimerLog` 的时间，说明消息已到期，直接加入 `dequeuePutQueue`，准备投递到 `CommitLog`。

#### 定时消息投递

投递的步骤被分为三个任务：

1. 从时间轮中扫描到期的定时消息（偏移量）
2. 根据定时消息偏移量，到 `CommitLog` 中查询完整的消息体
3. 将查到的消息投递到 `CommitLog` 的目标 Topic

##### `TimerDequeueGetService` 扫描时间轮中到期的消息

推进时间轮，将时间轮槽位对应的定时消息请求从时间轮和 `TimerLog` 取出，加入 `dequeueGetQueue`。

- 每 0.1s 执行一次，根据当前扫描时间轮的时间戳，从时间轮和 `TimerLog` 中查询出 `TimerRequest`，并分成定时请求、定时消息取消请求两类。
- 先批量将取消请求入队，等待处理完毕，再将定时消息请求入队，等待处理完毕。
- 该槽位的定时消息都处理完成后，推进时间轮扫描时间到下一槽位。

##### `TimerDequeueGetMessageService` 查询原始消息

处理 `dequeueGetQueue` 中的 `TimerRequest`，根据索引在 `CommitLog` 中查出原始消息，放到 `dequeuePutQueue`。

- 从 `dequeueGetQueue` 中取出 `TimerRequest`
- 对取出的 `TimerRequst`，从 `CommitLog` 中查询原始消息
- 处理定时消息取消请求，查询出原始消息中要取消消息的 `UNIQ_KEY`，放入 `deleteUniqKeys` Set
- 处理普通定时消息请求
  - 如果 `DeleteUniqKeys` 中包含这个消息，则什么都不做（取消投递）
  - 否则将查出的原始消息放入 `TimerRequest`，然后将 `TimerRequest` 放入 `dequeuePutQueue`，准备投递到 `CommitLog`

##### `TimerDequeuePutMessageService` 投递定时消息

这个线程的作用是：将消息从 `dequeuePutQueue` 中取出，若已经到期，投递到 `CommitLog` 中

- 无限循环从 `dequeuePutQueue` 中取出 `TimerRequest`
- 将原始消息的 Topic 和 queueId 从消息属性中取出，用它们构造成一个新的消息
- 将消息投递到 `CommitLog`
- 如果投递失败，则需要等待{精确度 / 2}时间然后重新投递，必须保证消息投递成功。

##  定时消息文件的恢复

Broker可能宕机，`TimerLog` 和 `TimerWheel` 都有定时持久化，所以对已经持久化的数据影响不大。

对在内存中还未持久化的数据，可通过 `TimerLog` 原封不动还原。在 RIP-43 中设置了 `Checkpoint` 文件，以记录 `TimerLog` 中已经被 `TimerWheel` 记录的消息 offset。在重新启动时，将从该 `checkpoint` 记录的位置重新开始向后遍历 `TimerLog` 文件，并开始订正 `TimerWheel` 每一格中的头尾消息索引。

## 随机读/PageCache 污染问题

在 `TimerLog` 和 `CommitLog` 中去查询定时消息，不可避免发生随机读。

要避免这个情况，要对消息写入优化：排序，或按时间轮的定位情况写入多个文件。但可能带来另一问题：大量的随机写。

读写难两全，由于**定时消息对写入更敏感**，所以可**牺牲一定读性能，来保障写入速度**。

## 另一种实现方案：RocksDB

RIP-43还提出另一种任意时间定时消息的实现方案，即使用 RocksDB（一种 KV 本地存储）：

- K=定时时间
- V=消息

可以做到根据时间查询该时刻的所有定时消息。

![](https://scarb-images.oss-cn-hangzhou.aliyuncs.com/img/202308081824587.png)

- K=延时时间 + Topic + 消息 ID
- V=延时消息数据

根据 K 扫描 RocksDB 中的定时消息，若到期则用生产-消费模式投递到CommitLog。

### 优点

- 流程较简单
- 可避免消息的滚动导致的写放大
- 一定程度上避免 pagecache 污染

### 缺点

- 写入时需排序，额外消耗时间
- 对 key 进行 compaction 过程，可能会耗费额外 CPU 资源
- 消息的检索需消耗较多计算资源

### 权衡

延时消息的写入速度与读取速度难平衡：

- 若 V 较大，大量消息的存储导致 compaction 计算量较大。随消息存储量增加，**写入速度将逐渐变慢**
- 若采用 KV 分离以此保障写速度，则**读消息的速度将受到较严重影响**