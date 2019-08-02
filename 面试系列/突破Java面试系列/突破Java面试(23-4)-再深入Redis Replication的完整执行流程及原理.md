# 0 [Github](https://github.com/Wasabi1234)

# 1 复制的完整流程

1. slave node启动，仅仅保存master node的信息，包括master node的`host`和`ip`，但复制流程尚未开始master host和ip配置在 `redis.conf` 中的 slaveof
2. slave node内部有个定时任务，每s 检查是否有新的master node要连接和复制，若发现，就跟master node建立socket网络连接
3. slave node发送ping命令给master node
4. 口令认证 - 若master设置了requirepass，那么salve node必须同时发送masterauth的口令认证
5. master node**第一次执行全量复制**，将所有数据发给slave node
6. master node后续持续将写命令，异步复制给slave node
- 完整复制的基本流程图

![](https://ask.qcloudimg.com/http-save/1752328/wlaq0nlan3.png)

# 2 数据同步相关的核心机制
即第一次slave连接msater时，执行的全量复制过程中你必须知道的一些细节

## 2.1 master和slave都会维护一个offset

master会在自身基础上累加offset，slave亦是

slave每秒都会上报自己的offset给master，同时master保存每个slave的offset

倒不是说特定就用在全量复制场景，主要是master和slave都要知道各自的数据的offset，才能知晓互相之间的数据不一致的情况

## 2.2 backlog

master node有一个backlog，默认是1MB

master node给slave node复制数据时，也会将数据在backlog中同步写一份

backlog主要是用来做全量复制中断时候的增量复制

## 2.3 master run id

info server，可以看到master run id

如果根据host+ip定位master node，是不靠谱的，如果master node重启或者数据出现了变化，那么slave node应该根据不同的run id区分，run id不同就做全量复制

如果需要不更改run id重启redis，可以使用

```
redis-cli debug reload
```

## 2.4 psync

从节点使用`psync`从master node复制，psync runid offset

master node会根据自身的情况返回响应信息

- 可能是FULLRESYNC runid offset触发全量复制
- 可能是CONTINUE触发增量复制

# 3 全量复制

1. master执行`bgsave`，在本地生成一份RDB快照client-output-buffer-limit slave 256MB 64MB 60
2. master node将RDB快照发送给salve node，若RDB复制时间超过60秒（repl-timeout），那么slave node就会认为复制失败，可适当调大该参数(对于千兆网卡的机器，一般每秒传输100MB，6G文件，很可能超过60s)
3. master node在生成RDB时，会将所有新的写命令缓存在内存中，在salve node保存了rdb之后，再将新的写命令复制给salve node
4. 若在复制期间，内存缓冲区持续消耗超过64MB，或者一次性超过256MB，那么停止复制，复制失败
5. slave node接收到RDB之后，清空自己的旧数据，然后重新加载RDB到自己的内存中，同时**基于旧的数据版本**对外提供服务
6. 如果slave node开启了AOF，那么会立即执行BGREWRITEAOF，重写AOF

RDB生成、RDB通过网络拷贝、slave旧数据的清理、slave aof rewrite，很耗费时间

如果复制的数据量在4G~6G之间，那么很可能全量复制时间消耗到1分半到2分钟

# 5 增量复制

1. 如果全量复制过程中，master-slave网络连接中断，那么salve重连master时，会触发增量复制
2. master直接从自己的backlog中获取部分丢失的数据，发送给slave node
3. msater就是根据slave发送的psync中的offset来从backlog中获取数据的

# 5 heartbeat

主从节点互相都会发送heartbeat信息

master默认每隔10秒发送一次heartbeat，salve node每隔1秒发送一个heartbeat

# 6 异步复制

master每次接收到写命令之后，先在内部写入数据，然后异步发送给slave node

# 参考

《Java工程师面试突击第1季-中华石杉老师》

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](http://www.shishusheng.com)
## [Github](https://github.com/Wasabi1234)