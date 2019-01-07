# 1 sdown和odown转换机制
> 两种失败状态

## 1.1 概念
- sdown主观宕机
一个哨兵自己觉得一个master宕机
- odown客观宕机
quorum数量的哨兵都觉得一个master宕机

## 1.2 达成条件
- sdown
一个哨兵ping一个master，超过`is-master-down-after-milliseconds`
- odown
一个哨兵在指定时间内，收到了quorum指定数量的其他哨兵也认为那个master是sdown了，那么就认为是odown

# 2 自动发现机制
通过Redis的pub/sub实现哨兵互相之间的发现，每个哨兵都会往`__sentinel__:hello`这个channel发一个消息，此时所有其他哨兵都可消费到该消息，于是感知到其他哨兵的存在.

每隔2s，哨兵都会往自己监控的某个master+slaves对应的`__sentinel__:hello `channel里发一个消息，内容为自己的host、ip和runid还有对该master的监控配置

每个哨兵也会去监听自己监控的每个master+slaves对应的`__sentinel__:hello` channel，然后去感知到同样在监听这个master+slaves的其他哨兵的存在

每个哨兵还会跟其他哨兵交换对master的监控配置，互相进行监控配置的同步

# 3 slave配置的自动纠正
哨兵会负责自动纠正slave的一些配置,比如
- slave要成为潜在的master候选人，哨兵会确保slave复制现有master的数据
- slave连接到了一个错误的master上，比如故障转移之后，那么哨兵会确保它们连接至正确的master

# 4 slave => master选举算法
若一个master被认为odown了，而且majority数量的哨兵都允许了主备切换，那么某个哨兵就会执行主备切换操作，此时首先要选举一个slave,会考虑slave的一些信息
- 跟master断开连接的时长
- slave优先级
- 复制offset
- run id

若一个slave跟master断开连接的时间已经超过`down-after-milliseconds`的10倍，外加master的宕机时长，那么slave就会被认为不适合选举为master
```
(down-after-milliseconds * 10) + milliseconds_since_master_is_in_SDOWN_state
```

接下来会对slave进行排序
1. 按照slave优先级进行排序，slave priority越低，优先级就越高
2. 如果slave priority相同，那么看replica offset，哪个slave复制了越多的数据，offset越靠后，优先级就越高
3. 如果上面两个条件都相同，那么选择一个run id比较小的那个slave

# 5 quorum和majority
每次一个哨兵要做主备切换，首先需要quorum数量的哨兵认为odown，然后选举出一个哨兵来做切换
该哨兵还得得到majority个哨兵的授权，才能正式执行切换

- 若quorum < majority
比如5个哨兵，majority就是3，quorum设置为2，那么就3个哨兵授权就可以执行切换

- 若quorum >= majority
那么必须quorum数量的哨兵都授权，比如5个哨兵，quorum是5，那么必须5个哨兵都同意授权，才能执行切换

# 6 configuration epoch
哨兵会监控一套Redis master+slave，并有相应的监控配置

执行切换的哨兵，会从要切换到的新master（salve => master）那里得到一个configuration epoch，这就是一个version号，每次切换的version号都必须是唯一的

如果第一个选举出的哨兵切换失败，那么其他哨兵，会等待`failover-timeout`时间，然后接替继续执行切换，此时会重新获取一个新的configuration epoch，作为新的version号

# 7 configuraiton传播
哨兵完成切换之后，会在自己本地更新生成最新的master配置，然后同步给其他哨兵
> 这里是通过pub/sub机制传递的

到了这里,之前提到的version号就很重要了，因为各种消息都是通过一个channel去发布和监听的，所以一个哨兵完成一次新的切换之后，新的master配置是跟着新的version号的

其他的哨兵也都是根据版本号的大小来更新自己的master配置的

# 参考

《Java工程师面试突击第1季-中华石杉老师》

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)
## [Github](https://github.com/Wasabi1234)




