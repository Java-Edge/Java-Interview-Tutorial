# 1 面试题

一般实现分布式锁都有哪些方式？使用redis如何设计分布式锁？使用zk来设计分布式锁可以吗？这两种分布式锁的实现方式哪种效率比较高？

# 2 考点分析

一般先问问你zk，然后过渡到zk关联的一些问题，比如分布式锁.

因为在分布式系统开发中，分布式锁的使用场景还是很常见的~

# 3 Redis分布式锁

官方叫做RedLock算法，是Redis官方支持的分布式锁算法.

这个分布式锁有3个重要的考量点

- 互斥（只能有一个客户端获取锁）
- 不能死锁
- 容错（大部分Redis节点或者这个锁就可以加可以释放）

## 3.1 最普通的实现方式

创建一个key

```
SET my:lock 随机值 NX PX 30000
```

- NX : 只有key不存在的时候才会设置成功
- PX 30000 : 30秒后锁自动释放。别人创建的时候如果发现已经有了就不能加锁了.

释放锁就是删除key，但是一般可以用lua脚本删除，判断value一样才删除:

> 关于redis如何执行lua脚本，自行百度

```
if redis.call("get",KEYS[1]) == ARGV[1] then
return redis.call("del",KEYS[1])
else
    return 0
end
```

为啥用随机值呢？

因为如果某客户端获取锁，但阻塞了很长时间才执行完，此时可能已经超时释放锁了，可能别的客户端已经获取到了锁，要是此时你直接删除key会有问题，所以得用随机值加上面的lua脚本来释放锁.

但是这样是肯定不行的

- 如果是普通的Redis单实例，那就是单点故障
- 是Redis普通主从，那Redis主从异步复制，如果主节点挂了，key还没同步到从节点，此时从节点切换为主节点，别人就会拿到锁.
- Redis最普通的分布式锁的实现原理
![](https://img-blog.csdnimg.cn/20190710192527101.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 3.2 RedLock算法

假设有一个redis cluster，有5个redis master实例.

执行如下步骤获取锁：

1. 获取当前时间戳(ms)
2. 尝试轮流在每个master节点创建锁，过期时间较短(几十ms)
3. 尝试在大多数节点建立一个锁，比如5个节点就要求是3个节点（n / 2 +1）
4. 客户端计算建立锁的时间，如果建立锁的时间小于超时时间，即建立成功
5. 如果锁建立失败，那么就依次删除这个锁
6. 只要别人建立了一把分布式锁，就得不断轮询去尝试获取锁
- RedLock算法![](https://ask.qcloudimg.com/http-save/1752328/2jcxo2yx5u.png)

# 4 ZooKeeper分布式锁

## 4.1 方案一

可以做的比较简单，就是某个节点尝试创建znode，创建成功了就获取了这个锁

这个时候别的客户端创建锁会失败，只能注册监听器监听这个锁

释放锁就是删除这个znode，一旦释放掉就会通知客户端，然后有一个等待着的客户端就可以重新加锁。

```
/**
 * ZooKeeperSession
 * 
 * @author JavaEdge
 *
 */
public class ZooKeeperSession {
	
	private static CountDownLatch connectedSemaphore = new CountDownLatch(1);
	
	private ZooKeeper zookeeper;
	private CountDownLatch latch;

	public ZooKeeperSession() {
		try {
			this.zookeeper = new ZooKeeper(
					"192.168.31.187:2181,
					192.168.31.19:2181,
					192.168.31.227:2181", 
					50000, 
					new ZooKeeperWatcher());			
			try {
				connectedSemaphore.await();
			} catch(InterruptedException e) {
				e.printStackTrace();
			}
			System.out.println("ZooKeeper session established......");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
```

```
	/**
	 * 获取分布式锁
	 * @param productId
	 */
	public Boolean acquireDistributedLock(Long productId) {
		String path = "/product-lock-" + productId;
	
		try {
			zookeeper.create(path, "".getBytes(), 
						  	 Ids.OPEN_ACL_UNSAFE, 
						  	 CreateMode.EPHEMERAL);
		 	return true;
		} catch (Exception e) {
			while(true) {
				try {
					// 相当于是给node注册一个监听器，去看看这个监听器是否存在
					Stat stat = zk.exists(path, true); 
					
					if(stat != null) {
						this.latch = new CountDownLatch(1);
						this.latch.await(waitTime, TimeUnit.MILLISECONDS);
						this.latch = null;
					}
					zookeeper.create(path, "".getBytes(), 
									 Ids.OPEN_ACL_UNSAFE, 
									 CreateMode.EPHEMERAL);
					return true;
					} catch(Exception e) {
							continue;
					}
				}

				// 很不优雅，我呢就是给大家来演示这么一个思路
				// 比较通用的，我们公司里我们自己封装的基于zookeeper的分布式锁，我们基于zookeeper的临时顺序节点去实现的，比较优雅的
			}
			return true;
	}
```

```
	/**
	 * 释放掉一个分布式锁
	 * 
	 * @param productId
	 */
	public void releaseDistributedLock(Long productId) {
		String path = "/product-lock-" + productId;
		try {
			zookeeper.delete(path, -1); 
			System.out.println("release the lock for product[id=" + productId + "]......");  
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
```

```
	/**
	 * 建立zk session的watcher
	 * 
	 * @author JavaEdge
	 *
	 */
	private class ZooKeeperWatcher implements Watcher {

		public void process(WatchedEvent event) {
			System.out.println("Receive watched event: " + event.getState());

			if(KeeperState.SyncConnected == event.getState()) {
				connectedSemaphore.countDown();
			} 

			if(this.latch != null) {  
				this.latch.countDown();  
			}
		}
	}
```

```
	/**
	 * 封装单例的静态内部类
	 * 
	 * @author JavaEdge
	 *
	 */
	private static class Singleton {
		
		private static ZooKeeperSession instance;
		
		static {
			instance = new ZooKeeperSession();
		}
		
		public static ZooKeeperSession getInstance() {
			return instance;
		}
		
	}

	/**
	 * 获取单例
	 * @return
	 */
	public static ZooKeeperSession getInstance() {
		return Singleton.getInstance();
	}
	
	/**
	 * 初始化单例的便捷方法
	 */
	public static void init() {
		getInstance();
	}
	
}
```

## 4.2 方案二

也可以采用另一种方式，创建临时顺序节点

如果有一把锁，被多个人给竞争，此时多个人会排队，第一个拿到锁的人会执行，然后释放锁

后面的每个人都会去监听排在自己前面的那个人创建的 node 上，一旦某个人释放了锁，排在自己后面的人就会被 zookeeper 给通知，一旦被通知了之后，就 ok 了，自己就获取到了锁，就可以执行代码了

```
public class ZooKeeperDistributedLock implements Watcher {

    private ZooKeeper zk;
    private String locksRoot = "/locks";
    private String productId;
    private String waitNode;
    private String lockNode;
    private CountDownLatch latch;
    private CountDownLatch connectedLatch = new CountDownLatch(1);
    private int sessionTimeout = 30000;

    public ZooKeeperDistributedLock(String productId) {
        this.productId = productId;
        try {
            String address = "192.168.31.187:2181,192.168.31.19:2181,192.168.31.227:2181";
            zk = new ZooKeeper(address, sessionTimeout, this);
            connectedLatch.await();
        } catch (IOException e) {
            throw new LockException(e);
        } catch (KeeperException e) {
            throw new LockException(e);
        } catch (InterruptedException e) {
            throw new LockException(e);
        }
    }

    public void process(WatchedEvent event) {
        if (event.getState() == KeeperState.SyncConnected) {
            connectedLatch.countDown();
            return;
        }

        if (this.latch != null) {
            this.latch.countDown();
        }
    }

    public void acquireDistributedLock() {
        try {
            if (this.tryLock()) {
                return;
            } else {
                waitForLock(waitNode, sessionTimeout);
            }
        } catch (KeeperException e) {
            throw new LockException(e);
        } catch (InterruptedException e) {
            throw new LockException(e);
        }
    }

    public boolean tryLock() {
        try {
 		    // 传入进去的locksRoot + “/” + productId
		    // 假设productId代表了一个商品id，比如说1
		    // locksRoot = locks
		    // /locks/10000000000，/locks/10000000001，/locks/10000000002
            lockNode = zk.create(locksRoot + "/" + productId, new byte[0], ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL_SEQUENTIAL);
   
            // 看看刚创建的节点是不是最小的节点
	 	    // locks：10000000000，10000000001，10000000002
            List<String> locks = zk.getChildren(locksRoot, false);
            Collections.sort(locks);
	
            if(lockNode.equals(locksRoot+"/"+ locks.get(0))){
                //如果是最小的节点,则表示取得锁
                return true;
            }
	
            //如果不是最小的节点，找到比自己小1的节点
	  int previousLockIndex = -1;
            for(int i = 0; i < locks.size(); i++) {
		if(lockNode.equals(locksRoot + “/” + locks.get(i))) {
	         	    previousLockIndex = i - 1;
		    break;
		}
	   }
	   
	   this.waitNode = locks.get(previousLockIndex);
        } catch (KeeperException e) {
            throw new LockException(e);
        } catch (InterruptedException e) {
            throw new LockException(e);
        }
        return false;
    }

    private boolean waitForLock(String waitNode, long waitTime) throws InterruptedException, KeeperException {
        Stat stat = zk.exists(locksRoot + "/" + waitNode, true);
        if (stat != null) {
            this.latch = new CountDownLatch(1);
            this.latch.await(waitTime, TimeUnit.MILLISECONDS);
            this.latch = null;
        }
        return true;
    }

    public void unlock() {
        try {
            // 删除/locks/10000000000节点
            // 删除/locks/10000000001节点
            System.out.println("unlock " + lockNode);
            zk.delete(lockNode, -1);
            lockNode = null;
            zk.close();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (KeeperException e) {
            e.printStackTrace();
        }
    }

    public class LockException extends RuntimeException {
        private static final long serialVersionUID = 1L;

        public LockException(String e) {
            super(e);
        }

        public LockException(Exception e) {
            super(e);
        }
    }
}
```

- ZooKeeper的分布式锁原理

![](https://ask.qcloudimg.com/http-save/1752328/00kqnkibdb.png)

# 5 Redis & ZooKeeper分布式锁实现的对比
- Redis分布式锁，需要自己不断去尝试获取锁，比较消耗性能
- ZooKeeper分布式锁，获取不到锁，注册个监听器即可，不需要不断主动尝试获取锁，性能开销较小

另外一点就是

- 如果Redis获取锁的那个客户端挂了，那么只能等待超时时间之后才能释放锁
- 而对于ZooKeeper，因为创建的是临时znode，只要客户端挂了，znode就没了，此时就自动释放锁

Redis分布式锁大家没发现好麻烦吗？

遍历上锁，计算时间等等

ZooKeeper的分布式锁语义清晰实现简单

所以先不分析太多的东西，就说这两点，个人实践认为ZooKeeper的分布式锁比Redis的分布式锁牢靠、而且模型简单易用

# 参考

- 《Java工程师面试突击第1季-中华石杉老师》

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)
## [Github](https://github.com/Wasabi1234)
