# 1 分布式锁的概念与数据最终不一致性的场景
![](https://upload-images.jianshu.io/upload_images/4685968-69489f8c1c565e76.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
在分布式系统中访问共享资源就需要一种互斥机制，来防止彼此之间的互相干扰，以保证一致性,就需要用到分布式锁。
## 分布式一致性问题
假设某商城有一个商品库存剩10个，用户A想要买6个，用户B想要买5个，在理想状态下，用户A先买走了6了，库存减少6个还剩4个，此时用户B应该无法购买5个，给出数量不足的提示；而在真实情况下，用户A和B同时获取到商品剩10个，A买走6个，在A更新库存之前，B又买走了5个，此时B更新库存，商品还剩5个，这就是典型的电商“秒杀”活动。

不做处理将会出现各种不可预知的后果。那么在这种高并发多线程的情况下，解决问题最有效最普遍的方法就是给共享资源或对共享资源的操作加一把锁，来保证对资源的访问互斥。
在Java JDK已经为我们提供了这样的锁，利用`ReentrantLcok`或者`synchronized`，即可达到资源互斥访问的目的。
但是在分布式系统中，由于分布式系统的分布性，即多线程和多进程并且分布在不同机器中，这两种锁将失去原有锁的效果，需要我们自己实现分布式锁——分布式锁。
## 分布式锁需要具备哪些条件
- 获取/释放锁的性能要好
- 判断是否获得锁必须是原子性的操作，否则可能导致多个请求都获取到锁
- 网络中断或宕机无法释放锁时，锁必须被清除，不然会发生死锁
- 可重入一个线程中多次获取同一把锁，比如一个线程在执行一个带锁的方法，该方法中又调用了另一个需要相同锁的方法，则该线程可以直接执行调用的方法，而无需重新获得锁；
- 阻塞锁和非阻塞锁，阻塞锁即没有获取到锁，则继续等待获取锁；非阻塞锁即没有获取到锁后，不继续等待，直接返回锁失败。
## 分布式锁实现方式
一、数据库锁
- 基于MySQL锁表
完全依靠数据库唯一索引来实现，当想要获得锁时，即向数据库中插入一条记录，释放锁时就删除这条记录
这种方式存在以下问题：
   - 锁没有失效时间，解锁失败会导致死锁，其他线程无法再获取到锁，因为唯一索引insert都会返回失败
  - 只能是非阻塞锁，insert失败直接就报错了，无法进入队列进行重试
  -   不可重入，同一线程在没有释放锁之前无法再获取到锁
- 采用乐观锁
增加版本号,根据版本号来判断更新之前有没有其他线程更新过，如果被更新过，则获取锁失败

二、缓存锁
这里主要是几种基于redis的
- 基于`setnx`、`expire`
基于setnx（set if not exist）的特点，当缓存里key不存在时，才会去set，否则直接返回false
如果返回true则获取到锁，否则获取锁失败，为了防止死锁，我们再用expire命令对这个key设置一个超时时间来避免。
但是这里看似完美，实则有缺陷，当我们setnx成功后，线程发生异常中断，expire还没来的及设置，那么就会产生死锁。

解决上述问题有两种方案
- 采用redis2.6.12版本以后的set，它提供了一系列选项
`EX seconds` – 设置键key的过期时间，单位时秒
`PX milliseconds` – 设置键key的过期时间，单位时毫秒
`NX` – 只有键key不存在的时候才会设置key的值
`XX` – 只有键key存在的时候才会设置key的值
- 第二种采用setnx()，get()，getset()
(1) 线程Asetnx，值为超时的时间戳(t1)，如果返回true，获得锁。
(2) 线程B用get 命令获取t1，与当前时间戳比较，判断是否超时，没超时false，如果已超时执行步骤3
(3) 计算新的超时时间t2，使用getset命令返回t3(这个值可能其他线程已经修改过)，如果t1==t3,获得锁,如果t1!=t3说明锁被其他线程获取了
(4) 获取锁后，处理完业务逻辑，再去判断锁是否超时，如果没超时删除锁，如果已超时，不用处理（防止删除其他线程的锁）

- RedLock算法

redlock算法是redis作者推荐的一种分布式锁实现方式
(1) 获取当前时间；
(2) 尝试从5个相互独立redis客户端获取锁
(3) 计算获取所有锁消耗的时间，当且仅当客户端从多数节点获取锁，并且获取锁的时间小于锁的有效时间，认为获得锁
(4) 重新计算有效期时间，原有效时间减去获取锁消耗的时间
(5) 删除所有实例的锁
redlock算法相对于单节点redis锁可靠性要更高，但是实现起来条件也较为苛刻
(1) 必须部署5个节点才能让Redlock的可靠性更强
(2) 需要请求5个节点才能获取到锁，通过Future的方式，先并发向5个节点请求，再一起获得响应结果，能缩短响应时间，不过还是比单节点redis锁要耗费更多时间
然后由于必须获取到5个节点中的3个以上，所以可能出现获取锁冲突，即大家都获得了1-2把锁，结果谁也不能获取到锁，这个问题，redis作者借鉴了raft算法的精髓，通过冲突后在随机时间开始，可以大大降低冲突时间，但是这问题并不能很好的避免，特别是在第一次获取锁的时候，所以获取锁的时间成本增加了
如果5个节点有2个宕机，此时锁的可用性会极大降低，首先必须等待这两个宕机节点的结果超时才能返回，另外只有3个节点，客户端必须获取到这全部3个节点的锁才能拥有锁，难度也加大了
如果出现网络分区，那么可能出现客户端永远也无法获取锁的情况
介于这种情况，下面我们来看一种更可靠的分布式锁zookeeper锁
# zookeeper分布式锁
![](https://upload-images.jianshu.io/upload_images/4685968-3875fb878387f14f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7f8af9c1220692ea.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ffa244c1f8cff785.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e9377631da774151.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-5dcb81799d929cb8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
zookeeper是一个为分布式应用提供一致性服务的软件，它内部是一个分层的文件系统目录树结构，规定统一个目录下只能有一个唯一文件名
## 数据模型
- 永久节点
节点创建后，不会因为会话失效而消失
- 临时节点
与永久节点相反，如果客户端连接失效，则立即删除节点
- 顺序节点
与上述两个节点特性类似，如果指定创建这类节点时，zk会自动在节点名后加一个数字后缀，并且是有序的
##监视器（watcher）：
当创建一个节点时，可以注册一个该节点的监视器，当节点状态发生改变时，watch被触发时，ZooKeeper将会向客户端发送且仅发送一条通知，因为watch只能被触发一次

根据zookeeper的这些特性来实现分布式锁
1. 创建一个锁目录lock
2. 希望获得锁的线程A就在lock目录下，创建临时顺序节点
3. 获取锁目录下所有的子节点，然后获取比自己小的兄弟节点，如果不存在，则说明当前线程顺序号最小，获得锁
4. 线程B获取所有节点，判断自己不是最小节点，设置监听(watcher)比自己次小的节点（只关注比自己次小的节点是为了防止发生“羊群效应”）
5. 线程A处理完，删除自己的节点，线程B监听到变更事件，判断自己是最小的节点，获得锁。
![](https://upload-images.jianshu.io/upload_images/4685968-1b8567add0b63a5a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d380a3ebd473f7f8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c295c9f4387bb014.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ec0d924f41c10335.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7b8a075a42e58e9a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


![](https://upload-images.jianshu.io/upload_images/4685968-f49b004b19f76da8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-f5ca952f661317b1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#  小结
在分布式系统中，共享资源互斥访问问题非常普遍，而针对访问共享资源的互斥问题，常用的解决方案就是使用分布式锁，这里只介绍了几种常用的分布式锁，分布式锁的实现方式还有有很多种，根据业务选择合适的分布式锁
下面对上述几种锁进行一下比较：
## 数据库锁
优点：直接使用数据库，使用简单。
缺点：分布式系统大多数瓶颈都在数据库，使用数据库锁会增加数据库负担。
## 缓存锁
优点：性能高，实现起来较为方便，在允许偶发的锁失效情况，不影响系统正常使用，建议采用缓存锁。
缺点：通过锁超时机制不是十分可靠，当线程获得锁后，处理时间过长导致锁超时，就失效了锁的作用。
## zookeeper锁
优点：不依靠超时时间释放锁；可靠性高；系统要求高可靠性时，建议采用zookeeper锁。
缺点：性能比不上缓存锁，因为要频繁的创建节点删除节点。
