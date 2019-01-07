# 1 思考过如下现实场景吗？
看到本文，再不思考，那可就等面试官吊打你喽。

RocketMQ的Pro只需配置一个接入地址，即可访问整个集群，而无需client配置每个Broker的地址。
即RocketMQ会自动根据要访问的topic名称和queue序号，找到对应的Broker地址。

想过这是如何实现的吗？

这些功能由NameServer协调Broker和 client共同实现，最关键的就是NameServer。任一可伸缩的分布式集群，都需类似服务，即所谓的
# 2 NamingService 有啥作用？
即为client提供路由信息，帮助client找到对应的Broker。
比如Dubbo的注册中心亦是如此，这是分布式集群架构下的一种通用设计。

NamingService负责维护集群内所有节点的路由信息。
NamingService本身也是个集群，由多个NamingService节点组成。
这里的“路由信息”是一种通用抽象：“ client需要访问的某个特定服务在哪个节点”。

集群中的节点会主动连接NamingService服务，注册自身路由信息。给client提供路由寻址服务的方式可以有两种：
1. client直连NamingService，查询路由信息
2. client连接集群内任一节点查询路由信息，节点再从自身缓存或查询NamingService。

# 3 NameServer如何提供服务？
RocketMQ的NameServer是独立进程，为Broker、Pro、Con提供服务。NameServer最主要是为 client 提供寻址服务，协助 client 找到topic对应的Broker地址。也负责监控每个Broker的存活状态。


NameServer支持单点部署，也支持多节点集群部署，即可避免单点故障。
每个NameServer节点上都保存了集群所有Broker的路由信息，因此可独立提供服务。

- RocketMQ集群中，NameServer是如何配合Broker、 Pro和 Con一起工作的。
![](https://img-blog.csdnimg.cn/20200913042118149.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

每个Broker都需和所有 NameServer 节点通信。当 Broker 保存的 Topic 信息变化时，它会主动通知所有 NameServer 更新路由信息。


为保证数据一致性，Broker会与所有NameServer节点建立长连接，定期上报Broker的路由信息。该上报路由信息的RPC请求，同时还起到 Broker 与 NameServer 间心跳作用，NameServer 依靠该心跳确定Broker的健康状态。
client会选择连接某一NameServer节点，定期获取订阅topic的路由信息，用于Broker寻址。

因每个 NameServer 节点都可独立提供服务，因此对 client来说，包括Pro和Con，只需选择任一 NameServer 节点来查询路由信息就可以了。
client在生产或消费某个topic的消息之前，会先从NameServer上查询这个topic的路由信息，然后根据路由信息获取到当前topic和队列对应的Broker物理地址，再连接到Broker节点上生产或消费。

如果NameServer检测到与Broker的连接中断了，NameServer会认为这个Broker不能再提供服务。NameServer会立即把这个Broker从路由信息中移除掉，避免 client连接到一个不可用的Broker上去。而 client在与Broker通信失败之后，会重新去NameServer上拉取路由信息，然后连接到其他Broker上继续生产或消费消息，这样就实现了自动切换失效Broker的功能。


# 4 NameServer 由哪些组件构成？
主要有如下6类：
![](https://img-blog.csdnimg.cn/20200913235933512.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

1. NamesrvStartup：程序入口
2. NamesrvController：NameServer的总控制器，负责所有服务的生命周期管理
3. BrokerHousekeepingService：监控Broker连接状态的代理类
4. DefaultRequestProcessor：负责处理 client 和 Broker 发送过来的RPC请求的处理器
5. ClusterTestRequestProcessor：用于测试的请求处理器
6. RouteInfoManager：NameServer最核心的实现类，负责维护所有集群路由信息，这些路由信息都保存在内存，无持久化。

RouteInfoManager的如下5个Map保存了集群所有的Broker和topic的路由信息
![](https://img-blog.csdnimg.cn/20200913172735276.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
其中的Broker信息用BrokerData表示：
![](https://img-blog.csdnimg.cn/20200913171035351.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

#  5 NameServer如何处理Broker注册的路由信息？
NameServer处理Broker和client所有RPC请求的入口方法：

## DefaultRequestProcessor#processRequest
- 处理Broker注册请求
![](https://img-blog.csdnimg.cn/20200913174416282.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
典型的Request请求分发器，根据request.getCode()来分发请求到对应处理器。
Broker发给NameServer注册请求的Code为REGISTER_BROKER，根据Broker版本号不同，分别有两个不同处理方法
![](https://img-blog.csdnimg.cn/20200913175638365.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
![](https://img-blog.csdnimg.cn/20200913192218370.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
![](https://img-blog.csdnimg.cn/20200913192649693.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

两个方法流程差不多，都是调用
### RouteInfoManager#registerBroker
注册Broker路由信息。
```java
    public RegisterBrokerResult registerBroker(
        final String clusterName,
        final String brokerAddr,
        final String brokerName,
        final long brokerId,
        final String haServerAddr,
        final TopicConfigSerializeWrapper topicConfigWrapper,
        final List<String> filterServerList,
        final Channel channel) {
        RegisterBrokerResult result = new RegisterBrokerResult();
        try {
            try {
                // 加写锁，防止并发修改数据
                this.lock.writeLock().lockInterruptibly();
                // 更新clusterAddrTable
                Set<String> brokerNames = this.clusterAddrTable.get(clusterName);
                if (null == brokerNames) {
                    brokerNames = new HashSet<>();
                    this.clusterAddrTable.put(clusterName, brokerNames);
                }
                brokerNames.add(brokerName);
                // 更新brokerAddrTable
                boolean registerFirst = false;

                BrokerData brokerData = this.brokerAddrTable.get(brokerName);
                if (null == brokerData) {
                    registerFirst = true; // 标识需要先注册
                    brokerData = new BrokerData(clusterName, brokerName, new HashMap<>());
                    this.brokerAddrTable.put(brokerName, brokerData);
                }
                Map<Long, String> brokerAddrsMap = brokerData.getBrokerAddrs();
                //Switch slave to master: first remove <1, IP:PORT> in namesrv, then add <0, IP:PORT>
                //The same IP:PORT must only have one record in brokerAddrTable
                // 更新brokerAddrTable中的brokerData
                Iterator<Entry<Long, String>> it = brokerAddrsMap.entrySet().iterator();
                while (it.hasNext()) {
                    Entry<Long, String> item = it.next();
                    if (null != brokerAddr && brokerAddr.equals(item.getValue()) && brokerId != item.getKey()) {
                        it.remove();
                    }
                }
                // 如果是新注册的Master Broker，或者Broker中的路由信息变了，需要更新topicQueueTable
                String oldAddr = brokerData.getBrokerAddrs().put(brokerId, brokerAddr);
                registerFirst = registerFirst || (null == oldAddr);

                if (null != topicConfigWrapper
                    && MixAll.MASTER_ID == brokerId) {
                    if (this.isBrokerTopicConfigChanged(brokerAddr, topicConfigWrapper.getDataVersion())
                        || registerFirst) {
                        ConcurrentMap<String, TopicConfig> tcTable =
                            topicConfigWrapper.getTopicConfigTable();
                        if (tcTable != null) {
                            for (Map.Entry<String, TopicConfig> entry : tcTable.entrySet()) {
                                this.createAndUpdateQueueData(brokerName, entry.getValue());
                            }
                        }
                    }
                }
                // 更新brokerLiveTable
                BrokerLiveInfo prevBrokerLiveInfo = this.brokerLiveTable.put(brokerAddr,
                    new BrokerLiveInfo(
                        System.currentTimeMillis(),
                        topicConfigWrapper.getDataVersion(),
                        channel,
                        haServerAddr));
                if (null == prevBrokerLiveInfo) {
                    log.info("new broker registered, {} HAServer: {}", brokerAddr, haServerAddr);
                }
                // 更新filterServerTable
                if (filterServerList != null) {
                    if (filterServerList.isEmpty()) {
                        this.filterServerTable.remove(brokerAddr);
                    } else {
                        this.filterServerTable.put(brokerAddr, filterServerList);
                    }
                }
                // 若是Slave Broker，需要在返回的信息中带上master的相关信息
                if (MixAll.MASTER_ID != brokerId) {
                    String masterAddr = brokerData.getBrokerAddrs().get(MixAll.MASTER_ID);
                    if (masterAddr != null) {
                        BrokerLiveInfo brokerLiveInfo = this.brokerLiveTable.get(masterAddr);
                        if (brokerLiveInfo != null) {
                            result.setHaServerAddr(brokerLiveInfo.getHaServerAddr());
                            result.setMasterAddr(masterAddr);
                        }
                    }
                }
            } finally {
                // 释放写锁
                this.lock.writeLock().unlock();
            }
        } catch (Exception e) {
            log.error("registerBroker Exception", e);
        }

        return result;
    }
```
# 6 client如何定位Broker？
NameServer如何帮助client找到对应的Broker呢？
对于 client，无论是Pro、Con，通过topic寻找Broker的流程一致，使用的也是同一实现。 
client在启动后，会启动定时器，定期从NameServer拉取相关topic的路由信息，缓存在本地内存，在需要时使用。
- 每个topic的路由信息由TopicRouteData对象表示：
![](https://img-blog.csdnimg.cn/20200913211447359.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

client选定队列后，可在对应QueueData找到对应BrokerName，然后找到对应BrokerData对象，最终找到对应Master Broker物理地址。

# 7 如何根据 topic查询Broker路由信息？
## RouteInfoManager#pickupTopicRouteData
NameServer处理 client请求和处理Broker请求流程一致，都是通过路由分发器将请求分发的对应的处理方法中，源码如下：
```java
    public TopicRouteData pickupTopicRouteData(final String topic) {
        // 1.初始化返回值 topicRouteData
        TopicRouteData topicRouteData = new TopicRouteData();
        boolean foundQueueData = false;
        boolean foundBrokerData = false;
        Set<String> brokerNameSet = new HashSet<>();
        List<BrokerData> brokerDataList = new LinkedList<>();
        topicRouteData.setBrokerDatas(brokerDataList);

        HashMap<String, List<String>> filterServerMap = new HashMap<>();
        topicRouteData.setFilterServerTable(filterServerMap);

        try {
            try {
                // 2.加读锁
                this.lock.readLock().lockInterruptibly();
                // 3.先获取topic对应的queue信息
                List<QueueData> queueDataList = this.topicQueueTable.get(topic);
                if (queueDataList != null) {
                    // 4.将queue信息存入返回值
                    topicRouteData.setQueueDatas(queueDataList);
                    foundQueueData = true;
                    // 5.遍历队列，找出相关的所有BrokerName
                    for (QueueData qd : queueDataList) {
                        brokerNameSet.add(qd.getBrokerName());
                    }
                    // 6.遍历BrokerName，找到对应BrokerData，并写入返回结果中
                    for (String brokerName : brokerNameSet) {
                        BrokerData brokerData = this.brokerAddrTable.get(brokerName);
                        if (null != brokerData) {
                            BrokerData brokerDataClone = new BrokerData(brokerData.getCluster(), brokerData.getBrokerName(), (HashMap<Long, String>) brokerData
                                .getBrokerAddrs().clone());
                            brokerDataList.add(brokerDataClone);
                            foundBrokerData = true;
                            for (final String brokerAddr : brokerDataClone.getBrokerAddrs().values()) {
                                List<String> filterServerList = this.filterServerTable.get(brokerAddr);
                                filterServerMap.put(brokerAddr, filterServerList);
                            }
                        }
                    }
                }
            } finally {
                // 7.释放读锁
                this.lock.readLock().unlock();
            }
        } catch (Exception e) {
            log.error("pickupTopicRouteData Exception", e);
        }

        log.debug("pickupTopicRouteData {} {}", topic, topicRouteData);

        if (foundBrokerData && foundQueueData) {
        	// 8.返回结果
            return topicRouteData;
        }

        return null;
    }
```