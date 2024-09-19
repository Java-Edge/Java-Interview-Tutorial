# Tomcat进程占用CPU过高怎么办？

CPU经常会成为系统性能的瓶颈，可能：

- 内存泄露导致频繁GC，进而引起CPU使用率过高
- 代码Bug创建了大量的线程，导致CPU频繁上下文切换

通常所说的CPU使用率过高，隐含着一个用来比较高与低的基准值，比如

- JVM在峰值负载下的平均CPU利用率40％
- CPU使用率飙到80%就可认为不正常

JVM进程包含多个Java线程：

- 一些在等待工作
- 另一些则正在执行任务

最重要的是找到哪些线程在消耗CPU，通过线程栈定位到问题代码
如果没有找到个别线程的CPU使用率特别高，考虑是否线程上下文切换导致了CPU使用率过高。

## 案例

模拟CPU使用率过高 - 在线程池中创建4096个线程。Linux环境下启动程序：

```bash
java -Xss256k -jar demo-0.0.1-SNAPSHOT.jar
```

线程栈大小指定256KB。对于测试程序，os默认值8192KB过大，因为需要创建4096个线程。

top看到Java进程CPU使用率达961.6%，注意进程ID 55790：

![](https://img-blog.csdnimg.cn/ccc4bf66ef604b20a0875593d571c134.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

精细化top查看这Java进程中各线程使用CPU情况：

```java
$ top -H -p 55790
```

![](https://img-blog.csdnimg.cn/513921500f344102b8857b0cf937b6f4.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

有个“scheduling-1”线程占用较多CPU。下一步就找出这个线程在做啥。jstack生成线程快照。jstack输出较大，一般将其写入文件：

```java
jstack 55790 > 55790.log
```

打开55790.log，定位到第4步中找到的名为 **scheduling-1** 的线程，其线程栈：

![](https://img-blog.csdnimg.cn/fa069dc8e34e4c209d72b5b9a6fa8c40.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

看到AbstractExecutorService#submit函数调用，说明它是Spring Boot启动的周期性任务线程，向线程池中提交任务，该线程消耗大量CPU。

## 上下文切换开销？

经历上述过程，往往已经可以定位到大量消耗CPU的线程及bug代码，比如死循环。但对于该案例：Java进程占用的CPU是961.6%， 而“scheduling-1”线程只占用了42.5%的CPU，那其它CPU被谁占用了？

第4步用top -H -p pid命令看到的线程列表中还有许多名为“pool-1-thread-x”的线程，它们单个的CPU使用率不高，但是似乎数量比较多。你可能已经猜到，这些就是线程池中干活的线程。那剩下的CPU是不是被这些线程消耗了呢？

还需要看jstack的输出结果，主要是看这些线程池中的线程是不是真的在干活，还是在“休息”呢？
![](https://img-blog.csdnimg.cn/4346e7a5f97943458a0878b66b1a1298.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)发现这些“pool-1-thread-x”线程基本都处WAITING状态。
![](https://img-blog.csdnimg.cn/d36a43b009fd4ec9beef152b8b980408.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- Blocking：一个线程因等待临界区的锁（Lock或synchronized）而被阻塞，该态的线程还没获取锁
- Waiting：一个线程拿到了锁，但需等待其他线程执行某些操作。如调用了Object.wait、Thread.join或LockSupport.park时，就进入Waiting状态。前提是该线程已持有锁，且在进入Waiting状态前，os层面会自动释放锁，当等待条件满足，外部调用Object.notify或LockSupport.unpark，线程会重新竞争锁，成功获得锁后才能进入Runnable状态继续执行。

“pool-1-thread-x”线程们都处于“Waiting”状态，从线程栈看到，这些线程“等待”在getTask方法，线程尝试从线程池的队列中取任务，但队列为空，所以通过LockSupport.park调用进入“Waiting”状态。

那“pool-1-thread-x”线程有多少个呢？统计结果正好和线程池中的线程数相等：

```bash
grep -o 'pool-2-thread' 55790.log | wc -l
```

![](https://img-blog.csdnimg.cn/7085afda568d461d8dc52c2d6a92b602.png)

剩下的CPU到底被谁消耗了？怀疑CPU的上下文切换开销了，因为看到Java进程中的线程数比较多。vmstat查看os层面的线程上下文切换活动：
![](https://img-blog.csdnimg.cn/a72a837da75e427a902b1c60c4210614.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- procs：线程上下文切换次数

- in：CPU中断次数，这俩数字非常高，基本证实猜测，线程上下文切切换消耗大量CPU。

那到底是啥进程导致的？

停止Spring Boot程序，再次运行vmstat命令：in和procs都大幅下降，说明引起线程上下文切换开销的Java进程正是55790。
![](https://img-blog.csdnimg.cn/9200ce42e84543d6b2564f7f501d9b47.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 总结

遇到CPU过高，首先定位哪个进程导致，之后可通过top -H -p pid命令定位到具体的线程。
其次还要通jstack查看线程的状态，看看线程的个数或者线程的状态，如果线程数过多，可以怀疑是线程上下文切换的开销，我们可以通过vmstat和pidstat这两个工具进行确认。