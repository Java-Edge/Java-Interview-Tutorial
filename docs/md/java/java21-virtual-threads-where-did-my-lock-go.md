# Java21虚拟线程：我的锁去哪儿了？

## 0 前言

[最近的文章](https://netflixtechblog.com/bending-pause-times-to-your-will-with-generational-zgc-256629c9386b)中，我们详细介绍了当我们迁移到 Java 21 并将代际 ZGC 作为默认垃圾收集器时，我们的工作负载是如何受益的。虚拟线程是我们在这次迁移中兴奋采用的另一个特性。

对虚拟线程新手，[它们被描述为](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html)“轻量级线程，大大减少编写、维护和观察高吞吐量并发应用程序的工作量。”威力来自在阻塞操作发生时，能够通过延续自动挂起和恢复，从而释放底层操作系统线程以供其他操作重用。在适当的上下文中利用虚拟线程可以解锁更高的性能。

本文讨论了在 Java 21 上部署虚拟线程的过程中遇到的一个特殊情况。

## 1 问题

工程师向性能工程和 JVM 生态系统团队提出了几份关于间歇性超时和挂起实例的独立报告。仔细检查后，我们注意到一组共同的特征和症状。在所有受影响的应用程序中，它们都在 Java 21 上运行，使用 SpringBoot 3 和嵌入式 Tomcat 在 REST 端点上提供流量。经历问题的实例甚至在这些实例上的 JVM 仍然运行时就停止了流量服务。一个清晰的、标志着这个问题开始的症状是 `closeWait` 状态的套接字数量持续增加：

![](https://miro.medium.com/v2/resize:fit:1400/1*b5oZiN2Ew96GEeZ9oIIhPA.png) 

- Tomcat服务器的吞吐量在某个时间点突然下降到几乎为0，表明服务器可能停止处理新的请求
- 同时，处于closeWait状态的套接字数量持续增加，这通常表示网络连接没有被正确关闭
- 这两个指标的变化是相关的，可能表明存在严重的网络或应用程序问题，导致连接无法正常关闭，并最终影响了服务器的处理能力

## 2 收集的诊断

停留在 `closeWait` 状态的套接字表明远程对等方关闭了套接字，但本地实例从未关闭它，大概是因为应用程序未能这样做。这通常表明应用程序处于异常状态，这种情况下应用程序线程转储可能会揭示额外的洞察。

为解决这问题，我们首先利用[警报系统](https://netflixtechblog.com/improved-alerting-with-atlas-streaming-eval-e691c60dc61e)捕获处于这种状态的实例。由于我们定期收集并持久化所有 JVM 工作负载的线程转储，我们通常可通过检查这些来自实例的线程转储来追溯行为。然而，惊讶发现我们所有的线程转储都显示一个完全空闲的 JVM，无任何明确的活动。

回顾最近变化，我们发现这些受影响的服务启用了虚拟线程，我们知道虚拟线程的调用栈不会出现在 `jstack` 生成的线程转储中。为了获得包含虚拟线程状态的更完整的线程转储，使用 “`jcmd Thread.dump_to_file`” 命令。作为最后的手段，我们还从实例中收集了一个堆转储。

## 3 分析

线程转储揭示了数千个“空白”虚拟线程：

```
#119821 "" virtual

#119820 "" virtual

#119823 "" virtual

#120847 "" virtual

#119822 "" virtual
...
```

这些是 VT（虚拟线程），其中创建了线程对象，但尚未开始运行，因此没有堆栈跟踪。事实上，空白 VT 的数量与 `closeWait` 状态的套接字数量大致相同。为了理解我们所看到的，我们首先需要了解 VT 的工作原理。

虚拟线程不是 1:1 映射到专用的 OS 级线程。相反，可将其视为计划到 fork-join 线程池中的任务。当虚拟线程进入阻塞调用时，如等待 `Future`，它会放弃它占据的 OS 线程，并简单地保留在内存中，直到它准备恢复。与此同时，OS 线程可以被重新分配以执行同一 fork-join 池中的其他 VT。这允许我们将许多 VT 多路复用到仅有的几个底层 OS 线程上。JVM 术语中，底层 OS 线程被称为“载体线程”，虚拟线程可“安装”在执行时和“卸载”在等待时。

> 虚拟线程的优秀深入描述可以在JEP 444。

在我们的环境下，对 Tomcat 使用了阻塞模型，实际上在请求的生命周期内保留了一个工作线程。通过启用虚拟线程，Tomcat 切换到虚拟执行。每个传入的请求都会创建一个新的虚拟线程，该线程简单地被计划在 [Virtual Thread Executor](https://github.com/apache/tomcat/blob/10.1.24/java/org/apache/tomcat/util/threads/VirtualThreadExecutor.java) 上作为一个任务。可见 Tomcat 在 [这里](https://github.com/apache/tomcat/blob/10.1.24/java/org/apache/tomcat/util/net/AbstractEndpoint.java#L1070-L1071) 创建了 `VirtualThreadExecutor`。

将这些信息联系回我们的问题，症状对应于 Tomcat 不断为每个传入的请求创建一个新的 web 工作 VT，但是没有可用的 OS 线程将它们安装上去的状态。

## 4 Tomcat 为啥卡住了？

OS 线程咋了，它们在忙啥？正如 [这里](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html#GUID-04C03FFC-066D-4857-85B9-E5A27A875AF9) 描述，如虚拟线程在 `synchronized` 块或方法内执行阻塞操作，它将被固定到底层 OS 线程。这正是这里发生的情况。这是从卡住的实例获得的线程转储中的一个相关片段：

```
#119515 "" virtual
      java.base/jdk.internal.misc.Unsafe.park(Native Method)
      java.base/java.lang.VirtualThread.parkOnCarrierThread(VirtualThread.java:661)
      java.base/java.lang.VirtualThread.park(VirtualThread.java:593)
      java.base/java.lang.System$2.parkVirtualThread(System.java:2643)
      java.base/jdk.internal.misc.VirtualThreads.park(VirtualThreads.java:54)
      java.base/java.util.concurrent.locks.LockSupport.park(LockSupport.java:219)
      java.base/java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(AbstractQueuedSynchronizer.java:754)
      java.base/java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(AbstractQueuedSynchronizer.java:990)
      java.base/java.util.concurrent.locks.ReentrantLock$Sync.lock(ReentrantLock.java:153)
      java.base/java.util.concurrent.locks.ReentrantLock.lock(ReentrantLock.java:322)
      zipkin2.reporter.internal.CountBoundedQueue.offer(CountBoundedQueue.java:54)
      zipkin2.reporter.internal.AsyncReporter$BoundedAsyncReporter.report(AsyncReporter.java:230)
      zipkin2.reporter.brave.AsyncZipkinSpanHandler.end(AsyncZipkinSpanHandler.java:214)
      brave.internal.handler.NoopAwareSpanHandler$CompositeSpanHandler.end(NoopAwareSpanHandler.java:98)
      brave.internal.handler.NoopAwareSpanHandler.end(NoopAwareSpanHandler.java:48)
      brave.internal.recorder.PendingSpans.finish(PendingSpans.java:116)
      brave.RealSpan.finish(RealSpan.java:134)
      brave.RealSpan.finish(RealSpan.java:129)
      io.micrometer.tracing.brave.bridge.BraveSpan.end(BraveSpan.java:117)
      io.micrometer.tracing.annotation.AbstractMethodInvocationProcessor.after(AbstractMethodInvocationProcessor.java:67)
      io.micrometer.tracing.annotation.ImperativeMethodInvocationProcessor.proceedUnderSynchronousSpan(ImperativeMethodInvocationProcessor.java:98)
      io.micrometer.tracing.annotation.ImperativeMethodInvocationProcessor.process(ImperativeMethodInvocationProcessor.java:73)
      io.micrometer.tracing.annotation.SpanAspect.newSpanMethod(SpanAspect.java:59)
      java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
      java.base/java.lang.reflect.Method.invoke(Method.java:580)
      org.springframework.aop.aspectj.AbstractAspectJAdvice.invokeAdviceMethodWithGivenArgs(AbstractAspectJAdvice.java:637)
...
```

这堆栈跟踪中，进入了 `brave.RealSpan.finish(RealSpan.java:134)` 的同步。这个虚拟线程实际上被固定了 - 它被安装在一个实际的 OS 线程上，即使在等待获取可重入锁时也是如此。有 3 个 VT 在这种确切状态，另一个 VT 被识别为 “`<redacted> @DefaultExecutor - 46542`”，它也遵循相同的代码路径。这 4 个虚拟线程在等待获取锁时被固定。由于应用程序部署在具有 4 个 vCPU 的实例上，[支撑 VT 执行的 fork-join 池](https://github.com/openjdk/jdk21u/blob/jdk-21.0.3-ga/src/java.base/share/classes/java/lang/VirtualThread.java#L1102-L1134) 也包含 4 个 OS 线程。现在我们已经用尽了它们，没有其他虚拟线程可以取得任何进展。这解释了：

- 为啥 Tomcat 停止处理请求
- 为啥 `closeWait` 态的套接字数量不断攀升

事实上，Tomcat 在套接字上接受连接，创建请求以及与之相关的虚拟线程，并将此请求/线程传递给执行器进行处理。然而，新创建的 VT 无法被调度，因为 fork-join 池中的所有 OS 线程都被固定并且从未释放。因此，这些新创建的 VT 被困在队列中，同时仍然持有套接字。

## 5 谁拥有锁？

现在我们知道 VT 正在等待获取锁，下一个问题是谁拥有锁？回答这个问题是理解最初触发这个条件的关键。通常，线程转储通过 “`- locked <0x…> (at …)`” 或 “`Locked ownable synchronizers`” 指示谁拥有锁，但我们的线程转储中没有出现这些。事实上，`jcmd` 生成的线程转储中没有包含锁定/停车/等待信息。这是 Java 21 的一个限制，并将在未来版本中得到解决。仔细梳理线程转储，我们发现总共有 6 个线程竞争同一个 `ReentrantLock` 和相关的 `Condition`。这六个线程中的四个在前一节中详细说明。这是另一个线程：

```
#119516 "" virtual
      java.base/java.lang.VirtualThread.park(VirtualThread.java:582)
      java.base/java.lang.System$2.parkVirtualThread(System.java:2643)
      java.base/jdk.internal.misc.VirtualThreads.park(VirtualThreads.java:54)
      java.base/java.util.concurrent.locks.LockSupport.park(LockSupport.java:219)
      java.base/java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(AbstractQueuedSynchronizer.java:754)
      java.base/java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(AbstractQueuedSynchronizer.java:990)
      java.base/java.util.concurrent.locks.ReentrantLock$Sync.lock(ReentrantLock.java:153)
      java.base/java.util.concurrent.locks.ReentrantLock.lock(ReentrantLock.java:322)
      zipkin2.reporter.internal.CountBoundedQueue.offer(CountBoundedQueue.java:54)
      zipkin2.reporter.internal.AsyncReporter$BoundedAsyncReporter.report(AsyncReporter.java:230)
      zipkin2.reporter.brave.AsyncZipkinSpanHandler.end(AsyncZipkinSpanHandler.java:214)
      brave.internal.handler.NoopAwareSpanHandler$CompositeSpanHandler.end(NoopAwareSpanHandler.java:98)
      brave.internal.handler.NoopAwareSpanHandler.end(NoopAwareSpanHandler.java:48)
      brave.internal.recorder.PendingSpans.finish(PendingSpans.java:116)
      brave.RealScopedSpan.finish(RealScopedSpan.java:64)
      ...
```

请注意，虽然这个线程似乎经历了完成跨度的相同代码路径，但它没有经过 `synchronized` 块。最后是第 6 个线程：

```
#107 "AsyncReporter <redacted>"
      java.base/jdk.internal.misc.Unsafe.park(Native Method)
      java.base/java.util.concurrent.locks.LockSupport.park(LockSupport.java:221)
      java.base/java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(AbstractQueuedSynchronizer.java:754)
      java.base/java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:1761)
      zipkin2.reporter.internal.CountBoundedQueue.drainTo(CountBoundedQueue.java:81)
      zipkin2.reporter.internal.AsyncReporter$BoundedAsyncReporter.flush(AsyncReporter.java:241)
      zipkin2.reporter.internal.AsyncReporter$Flusher.run(AsyncReporter.java:352)
      java.base/java.lang.Thread.run(Thread.java:1583)
```

这实际上是一个普通的平台线程，而不是虚拟线程。特别注意这个堆栈跟踪中的行号，这个线程似乎在内部 `acquire()` 方法 *之后* 阻塞了 [完成等待](https://github.com/openjdk/jdk21u/blob/jdk-21.0.3-ga/src/java.base/share/classes/java/util/concurrent/locks/AbstractQueuedSynchronizer.java#L1761)。换句话说，这个调用线程在进入 `awaitNanos()` 时拥有锁。我们知道锁是在这里明确获取的 [here](https://github.com/openzipkin/zipkin-reporter-java/blob/3.4.0/core/src/main/java/zipkin2/reporter/internal/CountBoundedQueue.java#L76)。然而，当等待完成时，它无法重新获取锁。总结我们的线程转储分析：



| Thread ID/name                                  | Virtual? | “synchronized” block? | Pinned? | Waiting for the lock? |
| ----------------------------------------------- | -------- | --------------------- | ------- | --------------------- |
| #119513 ""                                      | Yes      | Yes                   | Yes     | Yes                   |
| #119514 ""                                      | Yes      | Yes                   | Yes     | Yes                   |
| #119515 ""                                      | Yes      | Yes                   | Yes     | Yes                   |
| #119517 "\<redacted\> @DefaultExecutor - 46542" | Yes      | Yes                   | Yes     | Yes                   |
| #119516 ""                                      | Yes      | No                    | No      | Yes                   |
| #107 "AsyncReporter <redacted>"                 | No       | No                    | N/A     | Yes                   |

在分析了锁的争夺情况后，我们发现有5个虚拟线程和1个常规线程正在等待锁。其中4个虚拟线程被固定在了fork-join池的OS线程上。尽管如此，我们仍然没有关于谁拥有该锁的信息。由于无法从线程转储中获取更多信息，我们合乎逻辑的下一步是查看堆转储并内省锁的状态。

## 6 检查锁

在堆转储中找到锁是相对直接的。使用出色的Eclipse MAT工具，我们检查了AsyncReporter非虚拟线程的堆栈上的对象，以识别锁对象。推理锁的当前状态可能是我们调查中最棘手的部分。大多数相关代码都可以在`AbstractQueuedSynchronizer.java`中找到。虽然我们不声称完全理解其内部工作原理，但我们逆向工程了足够的信息以匹配我们在堆转储中看到的内容。下面的图表说明了我们的发现：

![](https://miro.medium.com/v2/resize:fit:2000/1*6AOJeVdbhmStpb9CRj30nw.png)

首先，`exclusiveOwnerThread`字段为`null`（2），表示没有人拥有该锁。我们在列表的头部有一个“空”的`ExclusiveNode`（3）（`waiter`为`null`且`status`已清除），后面是另一个`ExclusiveNode`，其`waiter`指向争夺锁的虚拟线程之一——#119516（4）。我们发现唯一清除`exclusiveOwnerThread`字段的地方是在`ReentrantLock.Sync.tryRelease()`方法中（[源代码链接](https://github.com/openjdk/jdk21u/blob/jdk-21.0.3-ga/src/java.base/share/classes/java/util/concurrent/locks/ReentrantLock.java#L178)）。在那里，我们还设置了`state = 0`，与我们在堆转储中看到的状态相匹配（1）。

考虑到这一点，我们追溯了释放锁的代码路径。在成功调用`tryRelease()`之后，持有锁的线程尝试向列表中的下一个等待者发出信号。此时，即使锁的所有权实际上已经释放，持有锁的线程仍然在列表的头部。列表中的下一个节点指向即将获取锁的线程。

为了理解这种信号是如何工作的，让我们看看`AbstractQueuedSynchronizer.acquire()`方法中的锁定获取路径。极度简化地说，它是一个无限循环，线程尝试获取锁，如果尝试不成功，则停车：

```java
while(true) {
   if (tryAcquire()) {
      return; // 锁已获取
   }
   park();
}
```

当持有锁的线程释放锁并发出信号以取消阻塞下一个等待线程时，被取消阻塞的线程将再次遍历这个循环，给它又一次获取锁的机会。事实上，我们的线程转储表明我们所有的等待线程都停在了第754行。一旦被取消阻塞，成功获取锁的线程最终将进入这段代码块中，有效地重置列表的头部并清除对等待者的引用。

更简洁地重新陈述，拥有锁的线程被列表的头部节点引用。释放锁会通知列表中的下一个节点，而获取锁会将列表的头部重置为当前节点。这意味着我们在堆转储中看到的内容反映了一个线程已经释放了锁但下一个线程尚未获取它的状态。这是一个本应是瞬态的奇怪中间状态，但我们的JVM却卡在了这里。我们知道线程#119516已经被通知并且即将获取锁，因为我们在列表头部识别出的`ExclusiveNode`状态。然而，线程转储显示线程#119516继续等待，就像其他争夺相同锁的线程一样。我们如何调和线程和堆转储之间所看到的情况？

## 7 无处运行的锁

知道线程#119516实际上已经被通知，我们回到线程转储中重新检查线程的状态。回想一下，我们总共有6个线程在等待锁，其中4个虚拟线程每个都被固定在OS线程上。这4个线程在获取锁并退出同步块之前不会放弃它们的OS线程。`#107 "AsyncReporter <redacted>"`是一个常规平台线程，所以如果它获取了锁，没有什么可以阻止它继续进行。这让我们剩下最后一个线程：`#119516`。它是一个VT，但它没有被固定在OS线程上。即使它被通知取消停车，它也无法继续，因为fork-join池中没有更多的OS线程可以调度它。正是这里发生的情况——尽管`#119516`被信号取消停车，它不能离开停车状态，因为fork-join池被其他4个等待获取相同锁的VT占据。那些被固定的VT在获取锁之前都不能继续。这是经典死锁问题的变体，但我们有一个锁和一个由fork-join池所代表的4个许可的信号量。

现在我们知道确切发生了什么，很容易想出一个可重现的测试用例。

## 8 结论

虚拟线程预计将通过减少与线程创建和上下文切换相关的开销来提高性能。尽管Java 21还有一些尖锐的边缘，虚拟线程在很大程度上实现了它们的承诺。在我们寻求更高性能的Java应用程序的过程中，我们看到进一步采用虚拟线程是实现该目标的关键。我们期待Java 23及以后，它带来了大量的升级，希望解决虚拟线程和锁定原语之间的集成问题。

这次探索仅突出了性能工程师解决的问题类型之一。我们希望这种对我们解决问题方法的一瞥对其他人在未来的调查中具有价值。

参考：

- https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html#GUID-E695A4C5-D335-4FA4-B886-FEB88C73F23E