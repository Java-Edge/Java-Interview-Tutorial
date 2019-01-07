> 以下用ES表Elastic Search

# 1 面试题
ES写入/查询数据的工作原理是什么呀？

# 2 考点分析
面试官就是想看看你是否了解ES的一些基本原理.
ES无非就是写/查数据,你如果不明白你发起写入/搜索请求后,ES做了什么,那你该劝退了.

# 3 详解
## 3.1 ES写数据的执行流程
- 客户端选择一个node发送请求过去,该node就是coordinating node(协调节点);
- coordinating node对document进行路由,将请求转发给对应的node(有primary shard);
- 实际的node上的primary shard处理请求,然后将数据同步到replica node;
- coordinating node若发现primary node和所有replica node都响应完操作后,就返回结果给客户端.

## 3.2 ES读数据的执行流程
查询，GET某一条数据，写入了某个document,该document会自动给你分配一个全局唯一id-doc id,同时也是根据doc id进行hash路由到对应的primary shard上面去.也可以手动指定doc id,比如用订单id,用户id.

可以通过doc id来查询,会根据doc id进行hash,判断出当时把doc id分配到了哪个shard,从那个shard去查询

- 客户端发送请求到任意一个node，成为coordinate node
- coordinate node对document路由,将请求转发到对应的node,此时会使用round-robin随机轮询算法，在primary shard及其所有replica中随机选择，使读请求负载均衡
- 接收请求的node返回document给coordinate node
- coordinate node返回document给客户端

## 3.3 ES查询数据的执行流程
最强大的是做全文检索,比如有三条数据
```
JavaEdge公众号呀
Java学习者们建议关注哦
java就很好学了呢
```
> 注意这里的字母大小写哟~

根据Java关键词来搜索,将包含Java的document给搜索出来

ES就会给你返回：JavaEdge公众号呀,Java学习者们建议关注哦

- 客户端发送请求到一个coordinate node
- 协调节点将搜索请求转发到所有的shard对应的primary shard或replica shard
- query phase
每个shard将自己的搜索结果（本质上就是一些doc id），返回给coordinate node，由coordinate node进行数据的合并、排序、分页等,以生成最终结果
- fetch phase
接着由coordinate node,根据doc id去各节点中拉取实际的document数据,最终返回给客户端

## 3.4 搜索的底层原理 - 倒排索引
### 画图说明传统数据库和倒排索引的区别
(待更新...)
## 3.5 ES 写数据的执行流程
- ES读写底层原理示意图
![](https://uploadfiles.nowcoder.com/files/20190627/5088755_1561579921192_20190627022247544.png)


(1)  先写入buffer,在buffer里的时候数据是搜索不到的;同时将数据写入translog日志文件
(2)  如果buffer将满,或者定时,就会将buffer中的数据refresh到一个新的segment file中
但此时数据不是直接进入segment file磁盘文件的,而是先进入os cache,即refresh.

每1s,ES 将buffer中的数据写到一个**新的segment file**,segment file磁盘文件每 s 生成一个,其只存储最近1s内buffer中写入的数据

- 如果buffer中此时无数据,自然不会执行refresh操作
- 如果buffer中有数据,默认每1s执行一次refresh,刷入一个新的segment file中

在操作系统的磁盘文件中都有os cache(操作系统缓存),即数据写入磁盘文件前,会先进入os cache,即进入OS级别的一个内存缓存

只要buffer中的数据被refresh刷入os cache,该数据就可被搜索到

为什么称 ES 是准实时(NRT，near real-time)的?
默认每1 s refresh一次,所以 ES 是准实时的,写入的数据1s之后才能被观测到.
可以通过ES的RESRful API或者Java API,手动执行一次refresh,即手动将buffer中数据刷入os cache,让数据立马就可被搜索到.只要数据被输入os cache中,buffer就会被清空,因为不需要保留缓存了,数据在translog里面已经持久化到磁盘.

(3) 只要数据进入os cache，此时就可以让这个segment file的数据对外提供搜索服务了.

(4) 重复1~3步骤,新数据不断进入buffer和translog,不断将buffer数据写入一个个segment file,每次refresh完,清空buffer,保留translog.
随着该过程不断推进,translog会变臃肿,当translog达到一定大小时,就会触发commit操作.

> buffer中的数据，倒是好，每隔1秒就被刷到os cache中去，然后这个buffer就被清空了。所以说这个buffer的数据始终是可以保持住不会填满es进程的内存的。
每次一条数据写入buffer，同时会写入一条日志到translog日志文件中去，所以这个translog日志文件是不断变大的，当translog日志文件大到一定程度的时候，就会执行commit操作。

(5) commit操作第一步,就是将buffer中现有数据refresh到os cache,清空buffer

(6）将一个commit point写到磁盘,以标识该commit point对应的所有segment file

(7）强行将os cache中所有数据都fsync到磁盘

> translog日志文件的作用是什么？
就是在你执行commit之前,数据要么是停留在buffer中,要么os cache中
无论是buffer还是os cache都是内存,一旦这台机器宕掉,数据就会全丢
所以需要将数据对应的操作写入一个专门的日志文件，translog日志文件中，一旦此时机器宕机，再次重启的时候，ES会自动读取translog日志文件中的数据，恢复到内存buffer和os cache中去。

#### commit操作
- 写commit point
- 将os cache数据fsync强刷到磁盘上去
- 清空translog日志文件

(8) 将现有的translog清空,接着重启启用一个translog，此时commit操作完成。默认每隔30分钟会自动执行一次commit，但是如果translog过大，也会触发commit。整个commit的过程，叫做flush操作。我们可以手动执行flush操作，就是将所有os cache数据刷到磁盘文件中去。

不叫做commit操作，flush操作。es中的flush操作，就对应着commit的全过程。我们也可以通过es api，手动执行flush操作，手动将os cache中的数据fsync强刷到磁盘上去，记录一个commit point，清空translog日志文件。

9）translog其实也是先写入os cache,默认每5s刷到磁盘
所以默认情况下,可能有5秒的数据仅仅驻存在buffer或者translog文件的os cache中,若此时机器宕机,会丢失5s的数据.
但是这样性能比较好,最多丢5s的数据.也可将translog设置成每次写操作必须是直接fsync到磁盘，但是性能会差很多.

> 实际上在这里,若面试官没有问你ES丢数据的问题,就可在这里给面试官炫一把:
其实ES第一是准实时性的,数据写入1s后可以搜索到;
可能会丢失数据，你的数据有5s会停留在buffer/translog os cache/segment file os cache中,有5s的数据不在磁盘上,此时如果宕机,会导致这5s的数据丢失.

如果你希望一定不能丢失数据的话，你可以设置个参数，官方文档，百度一下.
每次写入一条数据，都是写入buffer，同时写入磁盘上的translog，但是这会导致写性能、写入吞吐量会下降一个数量级.
本来一秒钟可以写2000条，现在你一秒钟只能写200条，都有可能.


### 小结
数据先写入内存 buffer，然后每隔 1s，将数据 refresh 到 os cache，到了 os cache 数据就能被搜索到（所以我们才说 es 从写入到能被搜索到，中间有 1s 的延迟）.
每隔 5s，将数据写入 translog 文件（这样如果机器宕机，内存数据全没，最多会有 5s 的数据丢失），translog 大到一定程度，或者默认每隔 30mins，会触发 commit 操作，将缓冲区的数据都 flush 到 segment file 磁盘文件中.

> 数据写入 segment file 之后，同时就建立好了倒排索引。

## 3.6 ES 删除数据的执行流程
(1) commit时会生成一个.del文件,将某个doc标识为deleted态,那么搜索的时候根据.del文件就知道该doc已被删除

## 3.7 ES 更新数据的执行流程
(1) 将原来的doc标识为deleted状态，然后新写入一条数据

(2) buffer每refresh一次，就会产生一个segment file，所以默认情况下是1s一个segment file，segment file会越来越多，此时会定期执行merge

(3) 每次merge时,会将多个segment file合并成一个，同时这里会将标识为deleted的doc给**物理删除**掉，然后将新的segment file写入磁盘，这里会写一个commit point，标识所有新的segment file，然后打开segment file供搜索使用，同时删除旧的segment file.

> ES 里的写流程，有4个底层的核心概念，refresh、flush、translog、merge
当segment file多到一定程度的时候，es就会自动触发merge操作，将多个segment file给merge成一个segment file。


# 参考
《Java工程师面试突击第1季-中华石杉老师》