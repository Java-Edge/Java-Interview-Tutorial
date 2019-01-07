> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

Redis 服务器的事件主要处理两方面：
- 处理文件事件：在多个客户端中实现多路复用，接受它们发来的命令请求，并将命令的执行结果返回给客户端
- 时间事件：实现服务器常规操作

# 1 文件事件
Redis server通过在多个客户端间多路复用， 实现了高效的命令请求处理： 多个客户端通过socket连接到 Redis server， 但只有在socket可无阻塞读/写时， server才会和这些客户端交互。

Redis 将这类因为对socket进行多路复用而产生的事件称为文件事件， 文件事件可分类如下：

## 1.1 读事件
读事件标志着客户端命令请求的发送状态。

当一个新的client连接到服务器时， server会给该client绑定读事件， 直到client断开连接后， 该读事件才会被移除。

读事件在整个网络连接的生命期内， 都会在等待和就绪两种状态之间切换：
- 当client只是连接到server，但并未向server发送命令时，该客户端的读事件就处于等待状态
- 当client给server发送命令请求，并且请求已到达时（相应的套接字可以无阻塞地执行读操作），该client的读事件处于就绪状态。

### 示例
如图展示三个已连接到server、但并未发命令的client
![](https://img-blog.csdnimg.cn/2020090213262737.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

此时客户端的状态：
| Client |读事件状态  |命令发送状态|
|--|--|--|
|A  |等待  |未发送 |
|B  |  等待| 未发送|
|C  |  等待| 未发送|

后来，A向服务器发送命令请求， 并且命令请求已到达时， A的读事件状态变为就绪：
![](https://img-blog.csdnimg.cn/2020090213275226.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
此时客户端的状态：
| Client |读事件状态  |命令发送状态|
|--|--|--|
|A  |就绪  |已发送且已到达 |
|B  |  等待| 未发送|
|C  |  等待| 未发送|

当**事件处理器**被执行时，就绪的**文件事件**会被识别到，相应的命令请求就会被发送到**命令执行器**，并对命令进行求值。

## 1.2 写事件
写事件标志着client对命令结果的接收状态。

和client自始至终都关联着读事件不同， server只会在有命令结果要传回给client时， 才会为client关联写事件， 并且在命令结果传送完毕之后， client和写事件的关联就会被移除。

一个写事件会在两种状态之间切换：

- 当server有命令结果需返回给client，但client还未能执行无阻塞写，那么写事件处等待状态
- 当server有命令结果需返回给client，且client可无阻塞写，那么写事件处就绪状态

当client向server发命令请求， 且请求被接受并执行后， server就需将保存在缓存内的命令执行结果返回给client， 这时server就会为client关联写事件。

### 示例
server正等待client A 变得可写， 从而将命令结果返回给A：
![](https://img-blog.csdnimg.cn/20200902140433912.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
此时客户端的状态：
| Client |读事件状态  |写事件状态|
|--|--|--|
|A  |等待  |等待 |
|B  |  等待| 无|
|C  |  等待| 无|

当A的socket可无阻塞写时， 写事件就绪， server将保存在缓存内的命令执行结果返回给client：
![](https://img-blog.csdnimg.cn/20200902140750136.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
此时client状态：
| Client |读事件状态  |写事件状态|
|--|--|--|
|A  |等待  | 已就绪 |
|B  |  等待| 无|
|C  |  等待| 无|

当命令执行结果被传回client后， client和写事件的关联会被解除（只剩读事件），返回命令执行结果的动作执行完毕，回到最初：
![](https://img-blog.csdnimg.cn/20200902140952982.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

## 1.3 同时关联读/写事件
我们说过，读事件只有在client断开和server的连接时，才会被移除。即当client关联写事件时，实际上它在同时关联读/写事件。

因为在同一次文件事件处理器的调用中， 单个客户端只能执行其中一种事件（要么读，要么写，不能又读又写）， 当出现读事件和写事件同时就绪时，事件处理器**优先处理读事件**。

即当server有命令结果要返回client， 而client又有新命令请求进入时， server先处理新命令请求。

# 2 时间事件
时间事件记录着那些要在指定时间点运行的事件，多个时间事件以无序链表结构保存在服务器状态中。

> 无序链表并不影响时间事件处理器的性能。
在Redis3.0版本，正常模式下的 Redis 只带有 serverCron 一个时间事件， 而在 benchmark 模式下， Redis 也只使用两个时间事件。
在这种情况下， 程序几乎是将无序链表退化成一个指针来使用， 所以使用无序链表来保存时间事件， 并不影响事件处理器性能。


- 时间事件的数据结构
![](https://img-blog.csdnimg.cn/20200902173947946.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

根据 `timeProc` 函数返回值，将时间事件分类如下：
-  返回 `AE_NOMORE` 
![](https://img-blog.csdnimg.cn/20200902174708189.png#pic_center)
那么这个事件为单次执行事件。该事件会在指定时间被处理一次，之后该事件就会被删除
-  返回一个非 `AE_NOMORE` 的整数值，则为循环执行事件。该事件会在指定时间被处理，之后它会按照timeProc的返回值，更新事件的 when 属性，让这个事件在之后某时间点再运行，以这种方式一直更新运行。

伪代码表示的两种事件处理：

```python
def handle_time_event(server, time_event):
    # 执行事件处理器，并获取返回值
    retval = time_event.timeProc()
    
    if retval == AE_NOMORE:
        # 如果返回 AE_NOMORE ，那么将事件从链表中删除，不再执行
        server.time_event_linked_list.delete(time_event)
    else:
        # 否则，更新事件的 when 属性
        # 让它在当前时间之后的 retval 毫秒之后再次运行
        time_event.when = unix_ts_in_ms() + retval
```
当时间事件处理器被执行时， 它遍历链表中所有的时间事件， 检查它们的`when` 属性，并执行已到达事件：

```python
def process_time_event(server):

    # 遍历时间事件链表
    for time_event in server.time_event_linked_list:
        # 检查事件是否已经到达
        if time_event.when <= unix_ts_in_ms():
            # 处理已到达事件
            handle_time_event(server, time_event)
```

## 时间事件实例
服务器需要定期对自身的资源和状态进行检查、整理， 保证服务器维持在一个健康稳定状态， 这类操作被统称为常规操作（cron job）。

在 Redis 中， 常规操作由 `redis.c/serverCron` 实现， 包括如下操作：
- 更新服务器的各类统计信息，比如时间、内存占用、数据库占用情况等
- 清理数据库中的过期键值对
- 对不合理的数据库进行大小调整
- 关闭和清理连接失效的客户端
- 尝试进行 AOF 或 RDB 持久化操作
- 如果服务器是主节点的话，对附属节点进行定期同步
- 如果处于集群模式的话，对集群进行定期同步和连接测试

Redis 将 serverCron（后文简称为sC） 作为时间事件运行， 确保它能够定期自动运行一次，又因 sC 需要在 Redis 服务器运行期一直定期运行， 所以它是一个循环时间事件：sC 会一直定期执行，直至服务器关闭。

Redis 2.6 的 sC 每秒运行 10 次，即平均每 100 ms运行一次。
Redis 2.8 用户可以通过修改 `hz` 选项设置 sC 的每秒执行次数。

# 3 两种事件的调度

简单地说， Redis 里面的两种事件呈协作关系， 它们之间包含如下属性：
- 一种事件会等待另一种事件执行完后，才开始执行，事件之间不会出现抢占
- 事件处理器先处理文件事件（即处理命令请求），再执行时间事件（调用 sC）
- 文件事件的等待时间（类 poll 函数的最大阻塞时间），由距离到达时间最短的时间事件决定

这表明， 实际处理时间事件的时间， 通常会比事件所预定的时间要晚， 延迟时间取决于时间事件执行前， 执行完成文件事件所耗时间。

## 示例
### 常规案例
虽然时间事件 **Time Event Y** 可设置其`when`属性计划在 `t1` 时间执行， 但因为文件事件 **File Event X** 正在运行， 所以 **Time Event Y** 的执行被延迟。
![](https://img-blog.csdnimg.cn/20200902204150894.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
### sC 案例
而且对于 **sC** 这类循环执行的时间事件来说，如果事件处理器的返回值是 t ，那么 Redis 只保证：
- 如果两次执行时间事件处理器之间的时间间隔≥t ，则该时间事件至少会被处理一次
- 而非，每隔 t 时间，就一定要执行一次事件
这对于不使用抢占调度的 Redis 事件处理器而言，也不可能做到

比如，虽然 sC 设定的间隔为 10 ms，但它并非是如下那样每隔 10 ms就运行一次：
![](https://img-blog.csdnimg.cn/20200902213555519.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

实际的 sC 运行方式更可能如下：
![](https://img-blog.csdnimg.cn/20200902214433599.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

根据情况，如果处理文件事件耗费了非常多的时间，sC 被推迟到一两秒之后才能执行，也有可能。
整个事件处理器程序可以用以下伪代码描述：

```python
def process_event():
	# 获取执行时间最接近现在的一个时间事件
	te = get_nearest_time_event(server.time_event_linked_list)
	
	# 检查该事件的执行时间和现在时间之差
	# 如果值 <= 0 ，说明至少有一个时间事件已到达
	# 如果值 > 0 ，说明目前没有任何时间事件到达
	nearest_te_remaind_ms = te.when - now_in_ms()
	
	if nearest_te_remaind_ms <= 0:
		# 若有时间事件已达，则调用不阻塞的文件事件等待函数
		poll(timeout=None)
	else:
		# 若时间事件还没到达，则阻塞的最大时间不超过 te 的到达时间
		poll(timeout=nearest_te_remaind_ms)
		
	# 优先处理已就绪的文件事件
	process_file_events()
	
	# 再处理已到达的时间事件
	process_time_event()
```

可以看出：
- 到达时间最近的时间事件，决定了 poll 的最大阻塞时长
- 文件事件优先于时间事件处理

将这个事件处理函数置于一个循环中，加上初始化和清理函数，这就构成了 Redis 服务器的主
函数调用：

```python
def redis_main():
	# 初始化服务器
	init_server()
	
	# 一直处理事件，直到服务器关闭为止
	while server_is_not_shutdown():
		process_event()
	
	# 清理服务器
	clean_server()
```
参考
- 《Redis 设计与实现》

![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)