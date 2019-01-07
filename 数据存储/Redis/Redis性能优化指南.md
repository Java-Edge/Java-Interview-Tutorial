# 1 客户端优化
## pipeline 批量操作
## 连接池应用

# 2 合理的淘汰机制
- 设置合理的内存大小
- 设置合理的过期时间
- 选择合适的淘汰策略

# 3 内存优化
https://redis.io/topics/memory-optimization 
不同大小，底层数据结构不同：

```bash
hash-max-ziplist-value 64 
zset-max-ziplist-value 64
```
# 4 CPU优化
不要阻塞，特别是 lua 脚本，不要有长时间睡眠操作，不然其它操作全部阻塞！
谨慎使用范围操作
SLOWLOG get 10 默认10ms，默认只保留最后的128条

# 5 key设计
## 可读性和可管理性
以业务名(或数据库名)为前缀(防止key冲突)，用冒号分隔，比如业务名:表名:id
##  简洁性
保证语义的前提下，控制key的长度，当key较多时，内存占用也不容忽视
## 不要含特殊字符
比如:包含空格、换行、单双引号以及其他转义字符
# 6 value设计
- 拒绝bigkey(防止网卡流量、慢查询)， string类型控制在10KB以内， hash、 list. set. zset元素 个数不要超过5000
- 选择适合的数据类型
- 控制key的生命周期，redis不是垃圾桶


# 7 分区
多个业务系统，共用一个redis，还是应该分开。规划好key，特别是前缀，a.b.c.d

如果缓存数据变大了，就可以分区，但注意按业务垂直拆分，避免 key 的冲突。
一般小公司研发团队都是需要申请缓存资源直接得到对应的 ip 地址，但大公司最多只能得到key/token。

# 8 Big Key
那么什么样的Key才算是Big Key呢? 
一般key的值大于10KB时可以算是Big Key了。
如下场景都有可能遇到Big Key，比如：
- 粉丝列表
- 统计数据，比如PV或者UV统计
- 使用不当的数据缓存，比如通过String保存序列化后的用户数据等

出现了Big Key你也不用非常紧张，因为某些场景下不得不使用，而不应该是你的使用不当造成的。下面我们看一下如何进行发现与优化
## 查询 Big Key
可以使用脚本进行查询，大概思路就是使用 scan 游标查询 key，然后使用 memory usage key 获取这个 key 与 value 的字节数，这样就能很方便的得出结论进行优化。比如

```python
import sys
import redis

def check_big_key(r, k):
  bigKey = False
  length = 0 
  try:
    type = r.type(k)
    if type == "string":
      length = r.strlen(k)
    elif type == "hash":
      length = r.hlen(k)
    elif type == "list":
      length = r.llen(k)
    elif type == "set":
      length = r.scard(k)
    elif type == "zset":
      length = r.zcard(k)
  except:
    return
  if length > 10240:
    bigKey = True
  if bigKey :
    print db,k,type,length

def find_big_key_normal(db_host, db_port, db_password, db_num):
  r = redis.StrictRedis(host=db_host, port=db_port, password=db_password, db=db_num)
  for k in r.scan_iter(count=1000):
    check_big_key(r, k)

def find_big_key_sharding(db_host, db_port, db_password, db_num, nodecount):
  r = redis.StrictRedis(host=db_host, port=db_port, password=db_password, db=db_num)
  cursor = 0
  for node in range(0, nodecount) :
    while True:
      iscan = r.execute_command("iscan",str(node), str(cursor), "count", "1000")
      for k in iscan[1]:
        check_big_key(r, k)
      cursor = iscan[0]
      print cursor, db, node, len(iscan[1])
      if cursor == "0":
        break;
  
if __name__ == '__main__':
  if len(sys.argv) != 4:
     print 'Usage: python ', sys.argv[0], ' host port password '
     exit(1)
  db_host = sys.argv[1]
  db_port = sys.argv[2]
  db_password = sys.argv[3]
  r = redis.StrictRedis(host=db_host, port=int(db_port), password=db_password)
  nodecount = r.info()['nodecount']
  keyspace_info = r.info("keyspace")
  for db in keyspace_info:
    print 'check ', db, ' ', keyspace_info[db]
    if nodecount > 1:
      find_big_key_sharding(db_host, db_port, db_password, db.replace("db",""), nodecount)
    else:
      find_big_key_normal(db_host, db_port, db_password, db.replace("db", ""))
```
可以通过 python find_bigkey host 6379 password 来执行，默认大 key 的阈值为 10240(10KB)，也就是对于 string 类型的 value 大于 10240 的认为是大 key，对于 list 的话如果 list 长度大于 10240 认为是大 key，对于 hash 的话如果 field 的数目大于 10240 认为是大 key。另外默认该脚本每次搜索 1000 个 key，对业务的影响比较低，不过最好在业务低峰期进行操作，避免 scan 命令对业务的影响。

## 删除 Big Key
Redis4.0 新特性 - Lazy Free
当删除键的时候, redis 提供异步延时释放 key 内存的功能，把 key 释放操作放在 bio(Background I/O) 单独的子线程处理中，减少删除 big key 对 redis 主线程的阻塞。有效地避免删除 big key 带来的性能和可用性问题。因此删除 Big Key 时使用 unlink 操作。

# 9 复制
## 9.1 避免全量复制
Redis 复制分为全量复制和部分复制，但全量复制的开销很大。如何尽量避免全量复制呢？
### 解决方案
- 当某个 Replica 第一次去挂到 master 上时，无法避免要做一次全量复制，那又该如何尽量降低开销呢？
既然第一次无法避免，那就选在集群低峰时间（凌晨）挂载 Replica
- 选举Replica为主节点
如果有某个Replica已经有了主节点数据了，那就将其选举为 master。通过人为或者哨兵实现选举。
#### 复制积压缓冲区不足
master 生成 RDB 同步到 Replica，Replica 加载 RDB 这段时间里，master 的所有写命令都会保存到一个复制缓冲队列（如果主从之间网络抖动，进行部分复制也是执行该逻辑），待 Replica 加载完 RDB，拿 offset 值到该队列判断，若在该队列，则把该队列从 offset 到末尾全部同步过来，这个队列的默认值为 1M。若发现 offset 不在队列，就会发起全量复制。
所以增大复制缓冲区的配置 **repl_backlog_size** 默认是 1M，可以设置大一些，从而增大 offset 的命中率。那么如何估算该值呢？一般我们网络故障时间一般是min级别，所以如下公式：
```go
理想值 = 根据当前QPS估算每分钟可写入多少字节 ✖️ 可能发生故障的min
```
## 9.2 避免复制风暴
### 9.2.1 单主节点复制风暴
一般发生在 **Master 挂在多个 Replica 场景**。
当 Master 重启恢复后，其 master 下所有 Replica 检测到 RunID 变化，导致所有 Replica 向 master 做全量复制。此时 Master 会为 Replica 创建 RDB 快照，若在快照创建完毕前，有多个 Replica 尝试与 Master 进行全量同步，那么其他的 Replica 将共享这份 RDB 快照。尽管 Redis 对这个问题做了优化，即只生成一份 RDB，但仍需多次传输，开销很大。同时给多个 Replica 发送快照，可能会使 Master 的网络带宽消耗严重，造成 Master 延迟变大，极端情况会出现主从断开，导致复制失败。
#### 解决方案
- 采用树状复制结构（一传二，二传四，分摊网络压力）
- 当 Master 宕机，选举一台 Replica 晋升为 Master，减少全量复制的产生


### 9.2.2 单机多主复制风暴
一台机器，多个主节点（树状复制结构）。
因为Redis是单线程结构，所以发挥不了 CPU多核的优势，于是有的人为了省钱就在同一机器部署多个 redis 主节点了。
#### 解决方案
- 应当把主节点尽量分散在多台机器上，避免在单台机器上部署过多的主节点
- 当主节点所在机器故障后提供故障恢复转移机制，避免机器恢复后进行密集的全量复制

# 禁止使用


#  使用经验
## 性能
- 线程数（4~8）与连接数（redis 服务端 10000）
- 监控系统读写比（ 至少9：1）和缓存命中率

## 容量
1) 做好容量评估，合理使用缓存资源
## 资源管理和分配
- 尽量每个业务集群单独使用自己的Redis，不混用； 

- 控制Redis资源的申请与使用，规范环境和Key的管理（以一线互联网为例）； 
 
 - 监控CPU 100%（单线程），所以此时基本不响应了，需要优化高延迟操作。