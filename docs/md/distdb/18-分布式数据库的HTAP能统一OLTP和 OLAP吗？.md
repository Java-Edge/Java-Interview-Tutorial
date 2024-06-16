# 18-分布式数据库的HTAP能统一OLTP和 OLAP吗？

!![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/7d6d7bee87413076a0f0e33b1d5da975.jpg)

OLAP和OLTP通过ETL衔接。为提升OLAP性能，需在ETL过程进行大量预计算，包括：

- 数据结构调整
- 业务逻辑处理

好处：可控制OLAP的访问延迟，提升用户体验。但因为要避免抽取数据影响OLTP系统，须在日终的交易低谷期才能启动ETL过程。因此，OLAP与OLTP的数据延迟通常至少一天，这种时效性表述即T+1：

- T日，即OLTP系统产生数据的日期
- T+1日，即OLAP中数据可用的日期
- 两者间隔为1天

这个体系的主要问题就是OLAP系统的数据时效性，T+1太慢了。是的，进入大数据时代后，商业决策更加注重数据的支撑，而且数据分析也不断向一线操作渗透，这都要求OLAP系统更快速地反映业务的变化。

## 1 解决思路

HTAP要解决的就是OLAP时效性问题，不过它也不是唯一的选择，这问题的解决思路：

1. 用准实时数据计算替代原有批量ETL过程，重建OLAP体系
2. 弱化甚至是干脆拿掉OLAP，直接在OLTP系统内扩展，即HTAP

### 1.1 重建OLAP体系

重视数据加工的时效性，近年大数据技术主要发展方向。Kappa架构就是新体系代表，最早由LinkedIn的Jay Kreps在2014年[一篇文章](https://www.oreilly.com/radar/questioning-the-lambda-architecture/)提出：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/940e335118bca3acb5a75c70a8b1f324.jpg)

原来的批量文件传输方式完全被Kafka替代，通过流计算系统完成数据快速加工，数据最终落地Serving DB中提供查询服务。Serving DB泛指各种类型存储如HBase、Redis或MySQL。

Kappa架构还没有完全实现，因为实践中流计算仍无法替代批计算，Serving DB也无法满足各种类型分析查询需求。

Kappa架构需继续完善：

1. 流计算能力的增强，要用到Kafka和Flink
2. Serving DB即时计算能力的增强，寄希望于OLAP数据库突破，就像ClickHouse

新OLAP体系试图提升即时运算能力，去除批量ETL，降低数据延迟。这新体系是流计算机遇，也是OLAP数据库自我救赎时机。

### 1.2 新建HTAP系统（Hybrid Transaction/Analytical Processing）

混合事务分析处理，最早出现在 2014年[Gartner的一份报告中](https://www.gartner.com/en/documents/2657815)，和Kappa架构同年。Gartner用HTAP来描述一种新型数据库，打破OLTP和OLAP隔阂，在一个数据库系统中同时支持事务型数据库场景和分析型数据库场景。构想美妙，HTAP可省去繁琐ETL操作，避免批量处理造成的滞后，更快分析最新数据。

这个构想很快表现出它侵略性一面，由于数据源头在OLTP系统，所以HTAP概念很快成为OLTP数据库，尤其NewSQL风格分布式数据库，向OLAP领域进军的一面旗帜。

NewSQL初步解决OLTP场景的高并发、强一致性等问题后，能否再兼顾OLAP场景通吃？

还难讲，从技术实践看，重建OLAP路线的相关技术似乎发展更快，参与厂商也更广泛，实际生产环境落地效果也不断改善。

而HTAP进展缓慢，鲜有生产级工业实践，但仍有不少厂商将其作为产品演进方向：

- 厂商官宣的HTAP至少包括TiDB和TBase
- OceanBase也宣布在近期版本中推出OLAP场景的特性

考虑商业策略，未来还有更多分布式数据库起HTAP大旗。

## 2 HTAP存储设计

### 2.0 OLTP和OLAP架构差异

#### 计算

计算引擎的差异，目标都是调度多节点的计算资源，做到最大程度并行处理。因为OLAP是海量数据要追求高吞吐量，而OLTP是少量数据更重视低延迟，所以它们计算引擎的侧重点不同

#### 存储

数据在磁盘上的组织方式不同，而组织方式直接决定了数据的访问效率。OLTP和OLAP的存储格式分别为行式存储和列式存储。

分布式数据库的流设计理念是计算与存储分离，计算就比较容易实现无状态化，所以在一个HTAP系统内构建多个计算引擎不太困难，而真要将HTAP概念落地为可运行系统，根本性挑战是存储。面对这挑战，业界解决思路：

1. Spanner使用的融合性存储PAX（Partition Attributes Across），试图同时兼容两类场景
2. TiDB4.0版本中的设计，在原有行式存储的基础上，新增列式存储，并通过创新性的设计，保证两者的一致性

### 2.1 Spanner：存储合一

Spanner2017论文“Spanner: Becoming a SQL System”介绍它新一代存储Ressi，使用类似PAX方式。这PAX并不是Spanner的创新，早在VLDB2002的论文 “[Data Page Layouts for Relational Databases on Deep Memory Hierarchies](http://research.cs.wisc.edu/multifacet/papers/vldbj02_pax.pdf)” 就提出。论文从CPU缓存友好性角度，探讨不同存储方式，涉及NSM、DSM、PAX存储格式。

#### NSM （行式存储）

NSM（N-ary Storage Model）就是行式存储，OLTP数据库默认存储方式，始终伴随关系型数据库发展。常用OLTP数据库，如MySQL（InnoDB）、PostgreSQL、Oracle和SQL Server等都使用行式存储。

将一条数据记录集中存在一起，更贴近关系模型。写效率较高，读时也可快速获得一个完整数据记录，这种特点称为记录内的局部性（Intra-Record Spatial Locality）。

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/aa9a1c530231f625d2fde65d59ba5c6c.jpg)

但行式存储对OLAP分析查询不友好。OLAP系统数据往往从多个OLTP系统中汇合，单表可能上百字段：

- 而用户一次查询通常只访问少量字段，如以行为单位读取数据，查询出多数字段无用，大量I/O操作无效
- 大量无效数据读取，又造成CPU缓存失效，加剧降低系统性能



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/2563e98bdae858fe114c90be35925ea7.jpg)

图示CPU缓存处理情况，可见很多无效数据被填充到缓存，挤掉那些原本有机会复用的数据。

#### DSM（列式存储）

DSM（Decomposition Storage Model），出现晚于行式存储。典型代表系统C-Store，迈克尔 · 斯通布雷克（Micheal Stonebraker）主导的开源项目，后来商业化产品Vertica。

将所有列集中存储，不仅更适应OLAP访问特点，对CACHE也更友好。这种特点称为记录间的局部性（Inter-Record Spatial Locality）。列式存储能大幅提升查询性能，以快著称的ck即列式存储。

列式存储的问题是写开销更大，因为根据关系模型，在逻辑上数据的组织单元仍是行，改为列式存储后，同样的数据量会被写入到更多的数据页（page），而数据页直接对应物理扇区，磁盘I/O开销自然增大。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/6fbd31f124c650e1970449a5bec7af9f.jpg)

列式存储的第二个问题，难将不同列高效关联。毕竟在多数应用场景中，不只是使用单列或单表数据，数据分散后，关联成本更高。

#### PAX

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/f69ae8b9053817145daf03113cf28cdd.jpg)

PAX新增minipage概念，是原有的数据页下的二级单位，这样一行数据记录在数据页的基本分布不会被破坏，而相同列的数据又集中存储。PAX更接近行存储，但它也在努力平衡记录内局部性和记录间局部性，提升了OLAP性能。

理论上，PAX提供了一种兼容性更好存储方式，可让人信心不足的是其2002年提出，但在Spanner之前却少有落地实现。类似设计还有HyPer的[DataBlock](http://db.in.tum.de/downloads/publications/datablocks.pdf)(SIGMOD2016)，DataBlock构造了一种独有的数据结构，同时面向OLTP和OLAP。

### TiFlash：存储分离

如果底层存储是一份数据，那么天然就可以保证OLTP和OLAP的数据一致性，这是PAX的最大优势，但是由于访问模式不同，性能的相互影响似乎也是无法避免，只能尽力选择一个平衡点。TiDB展现了一种不同的思路，介于PAX和传统OLAP体系之间，那就是OLTP和OLAP采用不同的存储方式，物理上是分离的，然后通过创新性的复制策略，保证两者的数据一致性。

TiDB是在较早的版本中就提出了HTAP这个目标，并增加了TiSpark作为OLAP的计算引擎，但仍然共享OLTP的数据存储TiKV，所以两种任务之间的资源竞争依旧不可避免。直到近期的4.0版本中，TiDB正式推出了TiFlash作为OLAP的专用存储。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/143953cfcf49d890137174900ff180fc.jpg)

我们的关注点集中在TiFlash与TiKV之间的同步机制上。其实，这个同步机制仍然是基于Raft协议的。TiDB在Raft协议原有的Leader和Follower上增加了一个角色Learner。这个Learner和Paxos协议中的同名角色，有类似的职责，就是负责学习已经达成一致的状态，但不参与投票。这就是说，Raft Group在写入过程中统计多数节点时，并没有包含Learner，这样的好处是Learner不会拖慢写操作，但带来的问题是Learner的数据更新必然会落后于Leader。

这不就是一个异步复制吗，换了个马甲，有啥创新。这也保证不了AP与TP之间数据一致性吧？

Raft协议能够实现数据一致性，是因为限制了只有主节点提供服务，否则别说是Learner就是Follower直接对外服务，都不能满足数据一致性。所以，这里还有另外一个设计。

Learner每次接到请求后，首先要确认本地的数据是否足够新，而后才会执行查询操作。怎么确认足够新呢？ Learner会拿着读事务的时间戳向Leader发起一次请求，获得Leader 最新的 Commit Index，就是已提交日志的顺序编号。然后，就等待本地日志继续Apply，直到本地的日志编号等于Commit Index后，数据就足够新了。而在本地 Region 副本完成同步前，请求会一直等待直到超时。

这种同步机制有效运转的前提是TiFlash不能落后太多，否则每次请求都会带来数据同步操作，大量请求就会超时，也就没法实际使用了。但是，TiFlash是一个列式存储，列式存储的写入性能通常不好，TiFlash怎么能够保持与TiKV接近的写入速度呢？TiFlash的存储引擎Delta Tree参考B+ Tree和LSM-Tree的设计，分为Delta Layer 和 Stable Layer两层，其中Delta Layer保证了写入具有较高的性能。因为目前还没有向你介绍过存储引擎的背景知识，所以这里不再展开Delta Tree。

TiFlash是OLAP系统，首要目标保证读性能，因此写入无论多重要，都要让位读优化。作为分布式系统，还有最后一招可用，那就是通过扩容降低单点写入的压力。

## 总结

1. OLTP通过ETL与OLAP衔接，所以OLAP数据时效性通常T+1，不能及时反映业务变化。这问题两种解决思路：重建OLAP体系，通过流计算方式替代批量数据处理，缩短OLAP的数据延迟，典型代表是Kappa架构；Gartner提出的HTAP
2. HTAP的设计要点在计算引擎和存储引擎，其中存储引擎是基础。对于存储引擎也两种不同的方案，一种是以PAX为代表，用一份物理存储融合行式和列式的特点，Spanner采用了这种方式。另一种是TiDB的TiFlash，为OLTP和OLAP分别设置行式存储和列式存储，通过创新性的同步机制保证数据一致。
3. TiDB的同步机制仍然是基于Raft协议的，通过增加Learner角色实现异步复制。异步复制必然带来数据的延迟，Learner在响应请求前，通过与Leader同步增量日志的方式，满足数据一致性，但这会带来通讯上的额外开销。
4. TiFlash作为列存，首先要保证读取性能，但因为要保证数据一致性，所以也要求具备较高的写入性能，TiFlash通过Delta Tree的设计来平衡读写性能。这个问题我们没有展开，将在22讲继续讨论。

总的来说，HTAP是解决传统OLAP的一种思路，但是推动者只是少数OLTP数据库厂商。再看另一边，以流计算为基础的新OLAP体系，这些技术本身就是大数据技术生态的一部分，有更多的参与者，不断有新的成果落地。至于HTAP具有绝对优势的数据一致性，其实在商业场景中也未必有足够多的刚性需求。所以，从实践效果出发，我个人更加看好后者，也就是新OLAP体系。

当然HTAP也具有相对优势，那就是通过全家桶方案避免了用户集成多个技术产品，整体技术复杂度有所降低。最后，TiDB给出的解决方案很有新意，但是能否覆盖足够大的OLAP场景，仍有待观察。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/d6ce49bfe9f4e2a13f13accabd00eaa8.png)

## FAQ

介绍TiDB的OLAP组件TiFlash，它保持数据一致性的方法是，每次TiFlash接到请求后，都会向TiKV Leader请求最新的日志增量，本地replay日志后再继续处理请求。这种模式虽然能够保证数据足够新，但比起TiFlash独立服务多了一次网络通讯，在延迟上有较大的影响。我的问题就是，你觉得这个模式还能优化吗？在什么情况下不需要与Leader通讯？

参考

- Anastassia Ailamaki et al.: [*Data Page Layouts for Relational Databases on Deep Memory Hierarchies*](http://research.cs.wisc.edu/multifacet/papers/vldbj02_pax.pdf)
- Harald Lang et al: [*Data Blocks: Hybrid OLTP and OLAP on Compressed Storage using both Vectorization and Compilation*](http://db.in.tum.de/downloads/publications/datablocks.pdf)
- Jay Kreps: [*Questioning the Lambda Architecture*](https://www.oreilly.com/radar/questioning-the-lambda-architecture/)
- Nigel Rayner et al.: [*Hybrid Transaction/Analytical Processing Will Foster Opportunities for Dramatic Business Innovation*](https://www.gartner.com/en/documents/2657815)



可以后台启动一个轮询日志增量的线程，当差异大于一定量的时候触发实际的数据同步。或者在心跳包中增加一个版本用于比对，当差异大的时候，触发主动同步。这样不用等到请求到达时触发，省掉这个等待时延。但是由于是Raft的非成员节点，怎么做都会有一定的数据差异，单对于大多OLAP分析场景应该是足够使用了。





没有接触过OLAP。

是不是可以不用每次都去请求“最新”的日志增量，而是按需请求数据：本地保存一个数据新旧的时间戳，如果早于读请求的时间戳，就不用去请求了；

或者设置一个质量因子，可以做到分配请求数据，采用类似滑动平均的算法，动态计算目标指标，达到质量要求后就停止请求数据。

> Q：当客户请求的时间戳可以确信小于服务端的时间戳时。难点应该就是如何保证客户端和服务端在时间上的同步。

解决时间同步问题常见方法：

1. **使用NTP（Network Time Protocol）**：
   NTP是一个网络协议，用于同步计算机系统的时钟。服务器和客户端可以使用NTP服务来保持时间的一致性。建议服务器和客户端都配置NTP客户端，以确保它们能够与可靠的NTP服务器同步时间。
2. **时间戳容忍度**：
   在设计协议和系统时，考虑到网络延迟和轻微的时间不同步，可在一定范围内允许时间戳偏差。如服务端可接受客户端的时间戳，只要它与服务端的时间戳在允许的误差范围内（例如，几秒到几分钟）。
3. **服务端时间校准**：
   在客户端发起请求时，可以在请求的响应中包含服务端的时间戳。客户端可以使用这个时间戳来校正后续请求的时间戳。这种方法可能不是很精确，但可以在一定程度上减少客户端和服务端时间的偏差。
4. **服务端时间戳签发**：
   客户端在发起请求时不发送时间戳，而是由服务端负责在处理请求时生成时间戳。这样可以确保时间戳的准确性，但可能需要调整应用逻辑以支持这种模式。
5. **客户端时间同步请求**：
   客户端在需要准确时间戳前，先向服务端发送时间同步请求，服务端返回当前的服务器时间戳。客户端以此作为参考来同步自己的时钟或调整请求。
6. **使用HTTPS协议**：
   在HTTPS握手过程中，服务端会发送一个时间戳给客户端，这可以作为客户端时间校准的一个参考点。

在任何情况下，都需要考虑到网络延迟和可能的时钟偏差，并在设计系统时做出相应的容错处理。时间同步是一个复杂的问题，通常需要综合多种策略来确保系统的稳定和安全。