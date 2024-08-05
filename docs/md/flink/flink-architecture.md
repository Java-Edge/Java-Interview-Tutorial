# Flink架构

## 0 前言

Flink 是一个分布式系统，需要有效分配和管理计算资源才能执行流应用程序。它集成了所有常见的集群资源管理器，如Hadoop YARN，但也可以设置作为独立集群甚至库运行。

本文概述 Flink 架构，并描述其主要组件如何交互以执行应用程序和从故障中恢复。

## 1 集群角色

Flink运行时有两种进程：

- 1个JobManager：Flink集群的主控节点，负责作业的调度和资源管理
- 1或多个TaskManager：Flink集群的工作节点，负责接受并执行具体的任务

The processes involved in executing a Flink dataflow：

![](https://nightlies.apache.org/flink/flink-docs-master/fig/processes.svg)

*Client* 不是运行时和程序执行的一部分，而是用于准备数据流并将其发送给 JobManager。之后，客户端可断开连接（*分离模式*）或保持连接来接收进程报告（*附加模式*)。客户端可作为触发执行 Java/Scala 程序的一部分运行，也可以在命令行进程`./bin/flink run ...`中运行。

可通过多种方式启动 JobManager 和 TaskManager：直接在机器上作为[standalone 集群](https://nightlies.apache.org/flink/flink-docs-master/zh/docs/deployment/resource-providers/standalone/overview/)启动、在容器中启动、或者通过[YARN](https://nightlies.apache.org/flink/flink-docs-master/zh/docs/deployment/resource-providers/yarn/)等资源框架管理并启动。TaskManager 连接到 JobManagers，宣布自己可用，并被分配工作。

### 1.1 JobManager

*JobManager* 具有许多与协调 Flink 应用程序的分布式执行有关的职责：它决定何时调度下一个或一组 task（调度的最小单位）、对完成的 task 或执行失败做出反应、协调 checkpoint、并且协调从失败中恢复等等。这个进程由三个不同的组件组成：

- **ResourceManager**

  *ResourceManager* 负责 Flink 集群中的资源提供、回收、分配 - 它管理 **task slots**，这是 Flink 集群中资源调度的单位。Flink 为不同的环境和资源提供者（如 YARN、k8s 和 standalone 部署）实现对应的 ResourceManager。standalone设置中，ResourceManager只能分配可用 TaskManager 的 slots，而不能自行启动新的TaskManager。

- **Dispatcher**

  *Dispatcher* 提供了一个 REST 接口，用来提交 Flink 应用程序执行，并为每个提交的作业启动一个新的 JobMaster。它还运行 Flink WebUI 用来提供作业执行信息。

- **JobMaster**

  *JobMaster* 负责管理单个[JobGraph](https://nightlies.apache.org/flink/flink-docs-master/zh/docs/concepts/glossary/#logical-graph)的执行。Flink 集群中可以同时运行多个作业，每个作业都有自己的 JobMaster。

始终至少有一个 JobManager。高可用（HA）设置中可能有多个 JobManager，其中一个始终是 *leader*，其他的则是 *standby*（请参考 [高可用（HA）](https://nightlies.apache.org/flink/flink-docs-master/zh/docs/deployment/ha/overview/)）。

### 1.2 TaskManager

*TaskManager*（也称 *worker*）执行作业流的 task，并且缓存和交换数据流。

须始终至少有一个 TaskManager。在 TaskManager 中资源调度的最小单位是 task *slot*。TaskManager 中 task slot 的数量表示并发处理 task 的数量。

一个 task slot 中可执行多个算子。

## 2 Tasks和算子链

算子：Flink job 中用于处理数据的一个单元。如 map, keyBy。

对于分布式执行，Flink 将算子的 subtasks *链接*成 *tasks*。每个 task 由一个线程执行。将算子链接成 task 是个有用的优化：它减少线程间切换、缓冲的开销，并且减少延迟的同时增加整体吞吐量。链行为可配置。

样例数据流用 5 个 subtask 执行，因此有 5 个并行线程。

![Operator chaining into Tasks](https://nightlies.apache.org/flink/flink-docs-master/fig/tasks_chains.svg)



## 3 Task Slots 和资源

每个 worker（TaskManager）都是一个 *JVM 进程*，可以在单独的线程中执行一个或多个 subtask。为控制一个 TaskManager 中接受多少个 task，就有了**task slots**（至少一个）。

每个 *task slot* 代表 TaskManager 中资源的固定子集。如具有 3 个 slot 的 TaskManager，会将其托管内存 1/3 用于每个 slot。分配资源意味着 subtask 不会与其他作业的 subtask 竞争托管内存，而是具有一定数量的保留托管内存。这没有 CPU 隔离；当前 slot 仅分离 task 的托管内存。

通过调整 task slot 的数量，用户可以定义 subtask 如何互相隔离。每个 TaskManager 有一个 slot，这意味着每个 task 组都在单独的 JVM 中运行（例如，可以在单独的容器中启动）。具有多个 slot 意味着更多 subtask 共享同一 JVM。同一 JVM 中的 task 共享 TCP 连接（通过多路复用）和心跳信息。它们还可以共享数据集和数据结构，从而减少了每个 task 的开销。

A TaskManager with Task Slots and Tasks：

![](https://nightlies.apache.org/flink/flink-docs-master/fig/tasks_slots.svg)

默认情况下，Flink 允许 subtask 共享 slot，即便它们是不同的 task 的 subtask，只要是来自于同一作业即可。结果就是一个 slot 可持有整个作业管道。允许 *slot 共享*有两个主要优点：

- Flink 集群所需的 task slot 和作业中使用的最大并行度恰好一样。无需计算程序总共包含多少个 task（具有不同并行度）。
- 容易获得更好的资源利用。如果没有 slot 共享，非密集 subtask（*source/map()*）将阻塞和密集型 subtask（*window*） 一样多的资源。通过 slot 共享，我们示例中的基本并行度从 2 增加到 6，可以充分利用分配的资源，同时确保繁重的 subtask 在 TaskManager 之间公平分配。

TaskManagers with shared Task Slots：

![](https://nightlies.apache.org/flink/flink-docs-master/fig/slot_sharing.svg)

## 4 DAG 调度

也就是在代码最后执行完 execute 算子后，一个 **Flink程序** 从提交到最终执行所经历的关键阶段：

1. Flink 程序会被映射为 StreamGraph (Flink程序的初始表示，是个DAG，表示数据流的拓扑结构)
2. Flink JobManager 将 StreamGraph 经过优化生成 JobGraph（在StreamGraph的基础上，经过优化后生成的图，包含了更多的执行细节，如并行度、算子链等）
3. Flink JobManager 根据 JobGraph 生成 ExecutionGraph (JobGraph的物理执行图，包含了任务、子任务、以及它们之间的依赖关系。)
4. JobManager 将 ExecutionGraph (执行图)调度到 TaskManager 执行

### Flink程序执行流程

1. **StreamGraph生成:** Flink程序在提交时，会被编译成一个StreamGraph
2. **JobGraph生成:** JobManager会对StreamGraph进行优化，生成JobGraph
3. **ExecutionGraph生成:** JobManager根据JobGraph生成ExecutionGraph，为任务的调度做准备
4. **任务调度:** JobManager将ExecutionGraph中的任务分配给TaskManager执行