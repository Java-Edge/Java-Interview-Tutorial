# Meta如何用极致技术实现接近完美的缓存一致性？

## 0 导言

缓存是一种强大的技术，广泛应用于计算机系统的各个方面，从缓存等硬件到操作系统、网络浏览器，尤其是后端开发。对于 Meta 这样的公司来说，缓存是非常重要的，因为它可以帮助他们减少延迟、扩展繁重的工作负载并节省资金。由于他们的用例非常依赖缓存，这就给他们带来了另一系列问题，那就是缓存失效。

多年来，Meta 已将缓存一致性从 99.9999（6 个 9）提高到 99.99999999（10 个 9），即其缓存集群中，100 亿次缓存写入中只有不到 1 次不一致。本文讨论：

1. 什么是缓存失效和缓存一致性？
2. Meta 为何如此重视缓存一致性，以至于连六个九都不够？
3. Meta 的监控系统如何帮助他们改进缓存失效、缓存一致性并修复错误

## 1 缓存失效和缓存一致性

顾名思义，缓存并不保存数据真实来源，因此当真实来源中的数据发生变化时，应该有一个主动失效陈旧缓存条目的过程。若失效过程处理不当，会在缓存中无限期地留下与真实源中不同的不一致值。

### 咋才能使缓存失效？

可设置一个 TTL 保持缓存的新鲜度，就不会有来自其他系统的缓存失效。但本文讨论mata的缓存一致性问题，我们将假设无效操作是由缓存本身以外的其他系统执行的。

 先看咋引入的缓存不一致：

![](https://engineering.fb.com/wp-content/uploads/2022/06/Cache-made-consisent-image-1.png?w=1024)

1、2、3、4 依次递增的时间戳

1. 缓存尝试从数据库中填充值
2. 但 x=42 的值到达缓存前，一些操作更新了数据库中 x=43 的值
3. 数据库为 x=43 发送缓存失效事件，该事件在 x=42 之前到达缓存，缓存值被置 43
4. 事件 x =42 现在到达缓存，缓存被设置为 42，出现不一致


对此，可用version字段解决该冲突，旧版本就不会覆盖新版本。这种解决方案已适用互联网 99% 公司，但由于系统过于复杂，这样的解决方案也可能不满足 Meta 的运营规模。

## 2 为啥这么关注缓存一致性？

- Meta的角度，这几乎与数据库数据丢失一样糟糕
- 用户角度，它可能导致糟糕的用户体验

试想一下，将Alice的主信息存储从region2 转移到region1 后，Bob和Mary都向Alice发送了信息：

- 当Bob向Alice发信息时，系统查询了Bob居住地附近区域的 TAO 副本，并将信息发送到region1
- 当Mary向Alice发送信息时，系统查询了Mary居住地附近区域的 TAO 副本，命中了不一致的 TAO 副本，并将信息发送到region2
- Mary和Bob将信息发送到不同的区域，两个region/存储都没有Alice信息的完整副本

cache invalidations：

![](https://engineering.fb.com/wp-content/uploads/2022/06/Cache-made-consisent-image-2.png?w=1024)

## 3 缓存失效的心理模型



![](https://engineering.fb.com/wp-content/uploads/2022/06/Cache-made-consisent-image-3.png?w=1024)

理解缓存失效的独特挑战很困难。从一个简单的心理模型开始。缓存的核心是一个有状态的服务，它将数据存储在可寻址的存储介质。分布式系统本质是个状态机。若每次状态转换都正确执行，就有了个按预期运行的分布式系统。否则，就会遇到问题。关键问题是：啥改变了有状态服务的数据？

![](https://engineering.fb.com/wp-content/uploads/2022/06/Cache-made-consisent-image-4.png?w=1024)

一个静态缓存有一个很简单的缓存模型（如一个简化的 CDN 就符合该模型）。数据是不可变的，无需缓存失效。对于数据库，数据仅在写入（或复制）时发生变更。通常会记录几乎所有数据库的状态更改日志。每当发生异常，日志可帮助我们了解发生过啥，缩小问题范围并定位问题。构建一个容错的分布式数据库（本身已很困难）自带一系列独特的挑战。这些只是简化的心理模型，不会无意轻视任何人的困难。

![](https://engineering.fb.com/wp-content/uploads/2022/06/Cache-made-consisent-image-5.png?w=1024)

对于动态缓存，如 [TAO](https://www.usenix.org/system/files/conference/atc13/atc13-bronson.pdf) 和 [Memcache](https://research.facebook.com/publications/scaling-memcache-at-facebook/)，数据在读（缓存填充）和写（缓存失效）路径上都会发生变更。这种确切的结合使许多竞争条件成为可能，并使缓存失效成为难题。缓存中的数据不持久，即有时在冲突解决中重要的版本信息可能会被逐出。结合所有这些特性，动态缓存产生了超出你想象的竞争条件。

要记录和追踪每次缓存状态的更改几乎不可能。引入缓存通常是为扩展以读为主的工作负载。即大多缓存状态更改是通过缓存填充路径发生。TAO每天处理超过一千万亿次查询。即使缓存命中率达到 99%，每天仍需进行超过 10 万亿次缓存填充。记录和追踪所有的缓存状态变化，会将以读为主的缓存工作负载变成对日志系统来说极为写密集的工作负载。调试分布式系统本已极具挑战性；在没有缓存状态更改日志或追踪时，调试分布式缓存系统几乎不可能。

尽管面临这些挑战，Meta仍将 TAO 的缓存一致性从 99.9999 提高到了 99.99999999。他们是如何做到的呢？

## 4 可靠的一致性可观测性

要解决缓存失效和缓存一致性问题，第一步是进行监测。我们需要监测缓存的一致性，并在缓存中存在不一致条目时告警。监测结果不能包含任何误报。人脑可轻松忽略噪声，若存在误报，人们会迅速学会忽略这些警报，导致该指标失去信任并变得无用。还需要监测结果精确，因为我们讨论的是 10 个 9 的一致性水平。若进行了一次一致性修复，希望能够定量地监测其改进。

![](https://engineering.fb.com/wp-content/uploads/2022/06/Cache-made-consisent-image-6.png?w=1024)



## 5 Polaris

为解决监测问题，Meta构建了一种 Polaris 服务。对有状态服务中的任何异常，仅当客户端能以某种方式观察到它时，它才是异常。否则，我们认为它不重要。基此原则，Polaris 专注监测客户端可观察的不变量的违例情况。

高层讲，Polaris 以客户端的身份与有状态服务交互，并假定不了解服务的内部细节。这使其具有通用性。Meta有数十个 Polaris 集成。如“缓存应该最终与数据库一致”是 Polaris 监控的一个典型客户端可观察不变量，尤其在异步缓存失效时。此时，Polaris 伪装成一个缓存服务器并接收缓存失效事件。如若 Polaris 收到一个失效事件 “x=4 @version 4”，它就会作为客户端查询所有缓存副本以验证是否存在违反该不变量的情况。若某缓存副本返回“x=3 @version 3”，Polaris 会将其标记为不一致，并将该样本重新排队以稍后再次检查同一目标缓存主机。Polaris 会按一定时间尺度报告不一致，如1min、5min或10min。若该样本在1min后仍显示为不一致，Polaris 会将其报告为相应时间尺度的不一致。

这种多时间尺度设计不仅允许 Polaris 在内部拥有多个队列以高效地实现回退和重试，对防止产生误报至关重要。

### 更有趣案例

假设 Polaris 收到一个失效事件“x=4 @version 4”。但当它查询缓存副本时，得到的回复 *x* 并不存在。此时，Polaris 是否应将其标记为不一致并不明确：

- 可能 *x* 在version 3 不可见，version 4 写入是该K的最新写入，这确实是个缓存不一致问题
- 也可能已存在一个version 5 的写入删除了键 *x*，或许 Polaris 只是看到了比失效事件中数据更新的视图更近期的数据

为区分这俩情况，需绕过缓存并检查数据库内容。绕过缓存的查询计算密集型操作，也给数据库带来风险——保护数据库并扩展以读为主的工作负载是缓存最常见的用途之一。因此，无法发送过多绕过缓存的查询。Polaris 通过延迟执行计算密集型操作直到不一致样本跨过报告时间尺度（如1min或5min）来解决此问题。真正的缓存不一致和同一K的竞争写入操作很少见。因此，在跨过下一个时间尺度边界之前重试一致性检查，有助减少大部分需要执行这些绕过缓存查询的需求。

此外，还在 Polaris 发送到缓存服务器的查询中添加了一个特殊标志。因此，在回复中，Polaris 可知目标缓存服务器是否已看到并处理了缓存失效事件。这点使 Polaris 能区分：

- 暂时的缓存不一致（通常由复制/失效延迟引起）
- 和“永久”缓存不一致——当缓存中的过期值在处理最新失效事件后仍无限期存在

Polaris 生成一个指标，类似“在 M 分钟内，N 个 9 的缓存写入是一致的”。Polaris 提供了5min时间尺度的这些数字。即5min内，99.99999999% 的缓存写入是一致的。在 TAO 中，5min后不到每 100 亿次缓存写入中会出现一次不一致。

将 Polaris 部署为一个独立服务，以便它能独立于生产服务及其工作负载进行扩展。若希望监测更高的 N 个 9，只需增加 Polaris 的吞吐量或在更长的时间窗口内进行聚合。

##  6 编码示例

一个咋产生缓存不一致的编码示例，看 polaris 咋帮 Meta 解决的一个 bug。设有一高速缓存，维护着K到Meta数据的映射和K到version的映射：

![](https://cdn-images-1.readmedium.com/v2/resize:fit:800/1*b0OLg-8qs95RIZ4glFefbQ.jpeg)

```python
cache_data = {}
cache_version = {}
meta_data_table = {"1": 42}
version_table = {"1": 4}
```

1. 当读请求到来，先检查缓存值，如缓存中无该值，则从数据库返回该值：

```python
def read_value(key):
    value = read_value_from_cache(key)
    if value is not None:
        return value
    else:
        return meta_data_table[key]


def read_value_from_cache(key):
    if key in cache_data:
        return cache_data[key]
    else:
        fill_cache_thread = threading.Thread(target=fill_cache(key))
        fill_cache_thread.start()
        return None
```

2.缓存返回 None 结果，然后开始从数据库填充缓存。我在这里使用了线程来使进程异步。

```python
def fill_cache_metadata(key):
    meta_data = meta_data_table[key]
    print("Filling cache meta data for", meta_data)
    cache_data[key] = meta_data
    
def fill_cache_version(key):
    time.sleep(2)
    version = version_table[key]
    print("Filling cache version data for", version)
    cache_version[key] = version    

def write_value(key, value):
    version = 1
    if key in version_table:
        version = version_table[key]
        version = version + 1    

    write_in_databse_transactionally(key, value, version)
    time.sleep(3)
    invalidate_cache(key, value, version)
    
def write_in_databse_transactionally(key, data, version):
    meta_data_table[key] = data
    version_table[key] = version
```

3.与此同时，当版本数据被填入缓存时，数据库会有新的写入请求来更新元数据值和版本值。此时此刻，这看起来像是一个错误，但其实不是，因为缓存失效应使缓存恢复到与数据库一致的状态（在缓存中添加了 time.sleep，并在数据库中添加了写入函数，以重现该问题）。

```python
def invalidate_cache(key, metadata, version):
    try:
        cache_data = cache_data[key][value] ## To produce error
    except:
        drop_cache(key, version)
        
def drop_cache(key, version):
    cache_version_value = cache_version[key]
    if version > cache_version_value:
        cache_data.pop(key)
        cache_version.pop(key)
```

4. 之后，在缓存失效过程中，由于某些原因导致失效失败，在这种情况下，异常处理程序有条件放弃缓存。

   删除缓存函数的逻辑是，如果最新值大于 cache_version_value，则删除该键，但在我们的情况下并非如此。因此，这会导致在缓存中无限期地保留陈旧的元数据

记住，这只是错误可能发生的非常简单的变体，实际的错误更加错综复杂，涉及到数据库复制和跨区域通信。只有当上述所有步骤都按此顺序发生时，才会触发错误。不一致性很少被触发。错误隐藏在交错操作和瞬时错误后面的错误处理代码中。

## 7 一致性跟踪

大多架构图用一个简单方框表示缓存。即使省略许多依赖和数据流，现实更接近如下：

![](https://engineering.fb.com/wp-content/uploads/2022/06/Cache-made-consisent-image-7.png?w=1024)

缓存可在不同时间点从不同的上游填充，这可能发生在区域内或跨区域。促销活动、分片迁移、故障恢复、网络分区以及硬件故障都可能导致缓存不一致。

但如前所述，记录并追踪每个缓存数据的变化不现实。但若仅记录和追踪那些可能引发缓存不一致（或错误处理缓存失效）的缓存变更呢？分布式系统中，任一组件的细微缺陷都可能导致缓存不一致，是否有一个大部分甚至所有缓存不一致的引入点呢？

我们得找到一个简单的解决方案管理这复杂性。希望从单个缓存服务器的视角评估整个缓存一致性问题。最终，缓存的不一致必须在某缓存服务器上体现出来。缓存服务器的角度，它关心：

- 它是否接收到失效通知？
- 它是否正确处理了失效通知？
- 该节点之后是否变得不一致？

![](https://engineering.fb.com/wp-content/uploads/2022/06/Cache-made-consisent-image-8.png?w=1024)

这是文章开头解释的相同例子，现以时空图展示。关注底部缓存主机的时间线，可见在客户端写入后，有一个窗口期，在此期间，失效通知和缓存填充会竞速更新缓存。一段时间后，缓存会进入静止状态。在这种状态下，尽管缓存填充仍可能高频发生，但从一致性角度来看，其重要性降低，因为没有写入操作，它只是一个静态缓存。

可构建一个有状态的追踪库，记录并追踪这个小紫色窗口中的缓存变更，在其中，所有有趣且复杂的交互都可能触发导致缓存不一致的错误。该库涵盖了缓存驱逐，甚至日志缺失也能表明失效事件是否未到达。它被嵌入到几个主要缓存服务和整个失效管道中。它会缓冲最近修改数据的索引，判断后续的缓存状态变化是否需要记录。还支持代码追踪，因此我们可了解每个被追踪查询的具体代码路径。

这种方法帮助发现并修复许多bug。它提供一种系统性且更具可扩展性的方法来诊断缓存不一致问题，已被证明很有效。

我们还观察到，该追踪库的实现具有高度灵活性：

- 不仅可用于诊断缓存一致性问题
- 还能扩展支持更复杂的使用场景。如通过简单配置，可将其应用于不同的数据存储服务。内置的代码追踪功能进一步帮助工程师快速定位问题的根本原因，从而大幅提升问题排查效率

相比传统的日志记录方法，这种基于状态的追踪方式性能更优。它仅在可能引发缓存不一致的关键时刻记录数据，避免冗余信息的生成和不必要系统开销。这特适用于大规模分布式系统，性能开销降低会带来显著的整体效益。

这种创新的方法不仅能够解决当前的缓存一致性挑战，还为未来分布式系统的诊断工具开发提供重要启示。

## 8 记录一次bug修复

![](https://engineering.fb.com/wp-content/uploads/2022/06/Cache-made-consisent-image-9.png?w=1024)

某系统中，为每条数据分配了版本，用于排序和冲突解决。观察到：

- 缓存中数据“metadata=0 @version 4”
- 而数据库中数据“metadata=1 @version 4”

缓存状态一直保持不一致。这种情况本不可能发生。若是你，咋解决这问题？若能获得导致最终不一致状态的每个步骤的完整时间线，这会多么有用？

一致性追踪提供了我们所需的完整时间线：

![缓存失效](https://engineering.fb.com/wp-content/uploads/2022/06/Cache-made-consisent-image-10.png?w=1024)

在系统中发生了一种罕见的操作事务性地更新底层数据库中的两个表——metadata表和version表。基于一致性追踪，我们知道：

1. 缓存尝试用version数据填充元数据
2. 第一轮，缓存先填充了旧的metadata
3. 接着，一次写事务原子地更新了metadata表和version表
4. 第二轮中，缓存填充了新version数据。在这里，缓存填充操作与数据库事务交错。这种情况很少发生，因为竞争窗口很小。你可能想这就是bug。实际上到目前为止一切都按预期工作，因为缓存失效应该让缓存达到一致状态
5. 后来，缓存失效在尝试更新缓存条目为新metadata和新version时到来。这几乎总是有效的，但这次没有
6. 缓存失效在缓存主机上遇到了一个罕见的瞬态错误，这触发了错误处理代码
7. 错误处理程序从缓存中删除了该条目。伪代码：

```python
drop_cache(key, version);
```

即若缓存中的version小于指定version，就删除该条目。但不一致的缓存条目包含了最新version。因此，这段代码啥也没做，导致缓存中的陈旧元数据无限期保留，这就是bug。这里对案例进行了大幅简化，实际更复杂，涉及数据库复制和跨区域通信。只有当上述所有步骤以这种特定顺序发生时，才会触发不一致。这种不一致很罕见，bug隐藏在错误处理代码中，交错操作和瞬态错误的后面。

多年前，找到这种bug的根因需代码和服务非常熟悉的人费数周时间，且要幸运才能找到。而在这案例，Polaris 立即识别了异常并告警。借助一致性追踪的信息，值班工程师在不到 30min 内就定位该漏洞。

## 9 总结

本文分享咋通过一种通用的、系统性的和可扩展的方法，使缓存更一致。未来规划将所有缓存一致性提升到物理上可能的最高接近 100% 的水平。对于分离的二级索引，一致性带来了一个有趣的挑战。我们还正在监测并显著改善读取时的缓存一致性。最后，我们正在为分布式系统构建一个高级一致性 API——可以将其类比为 C++ 的 `std::memory_order`，但针对的分布式系统。