# 1 数据丢失的两个场景

主备切换的过程，可能会导致数据丢失

## 1.1 异步复制

由于 `master => slave`的复制是异步的，所以可能有部分数据还没复制到slave，master就宕机，于是这些数据就丢失了

![](https://ask.qcloudimg.com/http-save/1752328/93jl4vswgy.png)

## 1.2 脑裂导致

脑裂，也就是说，某个master所在节点突然脱离正常的网络，无法和其他slave机器连接，但实际上master还运行着

此时哨兵可能就会认为master宕机了，然后开启选举，将其他slave切换成了master

这个时候，集群里就会有两个master，也就是所谓的`脑裂`

此时虽然某个slave被切换成了master，但是可能client还没来得及切换到新的master，还继续写向旧master的数据可能也丢失了

因此旧master再次恢复时，会被作为一个slave挂到新的master上去，自己的数据会被清空，重新从新的master复制数据

![](https://ask.qcloudimg.com/http-save/1752328/q5320luqi1.png)

# 2 数据丢失的解决方案

如下配置可以减少异步复制和脑裂导致的数据丢失

```
min-slaves-to-write 1
min-slaves-max-lag 10
```

配置要求至少有1个slave，数据复制和同步的延迟不能超过10秒

一旦所有的slave，数据复制和同步的延迟都超过了10秒钟，master就不再接收任何请求!

## 2.1 异步复制数据丢失解决方案

`min-slaves-max-lag` 配置

即可确保，一旦slave复制数据和ack延时过长，就认为可能master宕机后损失的数据太多了，那么就拒绝写请求

这样就可把master宕机时由于部分数据未同步到slave导致的数据丢失降低在可控范围

![](https://ask.qcloudimg.com/http-save/1752328/znnqfrs21u.png)

## 2.2 脑裂数据丢失解决方案

若一个master出现了脑裂，跟其他slave失去连接，那么开始的两个配置可以确保

若不能继续给指定数量的slave发送数据，而且slave超过10秒没有给自己ack消息，那么就直接拒绝客户端的写请求

这样脑裂后的旧master就不会接受client的新数据，也就避免了数据丢失

上面的配置就确保了，如果跟任何一个slave丢了连接，在10秒后发现没有slave给自己ack，那么就拒绝新的写请求

因此在脑裂场景下，最多就丢失10秒的数据

![](https://ask.qcloudimg.com/http-save/1752328/aamxilr8we.png)

# 参考

《Java工程师面试突击第1季-中华石杉老师》

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)
## [Github](https://github.com/Wasabi1234)