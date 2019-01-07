项目实例代码已上传github
https://github.com/Wasabi1234/mmall
# 1\. 什么是连接池
一般在程序中如果要和其他的系统创建连接进行交互并且连接的创建代价比较"昂贵"就需要用到连接池.
 那怎么样才算是昂贵呢? 简单说来就是创建连接的时间接近甚至超过交互的时间.
 所以连接池就是一个创建连接管理连接, 对连接进行缓存的技术. 
最常见的连接池就是数据库连接池

# 2\. Jedis的连接池

既然连接池的作用就是管理连接, 那`Jedis`的连接池也不例外,
它的作用就是缓存`Jedis`和`redis server`之间的连接
 `Jedis` 连接池的作用具体来说分为以下几个部分

## 2.1 创建保存连接的容器
当初始化一个`JedisPool`的时候会创建一个
`LinkedBlockingDeque<PooledObject<T>> idleObjects`队列
 这个队列用于存放已经和`redis server`建立连接**并且已经使用过**的连接对象(实际上存放的是`DefaultPooledObject<Jedis>`对象, 后面会看到)
同时还会创建一个
`Map<IdentityWrapper<T>, PooledObject<T>> allObjects`对象,
这个`Map`用于没有可用的连接时新创建出来的连接
## 2.2 发起请求获取连接
当发起请求从连接池中获取一个连接的时候, 连接池会先从`idleObjects`队列中获取连接, 如果获取不到则开始创建一个新的连接, 创建新的连接是首先判断当前已经存在的连接是否已经大于连接池可容纳的连接数量, 如果是则不予创建, 以阻塞等的方式从`idleObjects`中等待获取可用连接(默认是阻塞不超时等待即等待直到有可用的连接, 但是也可以配置超时时间). 如果可以创建, 则创建一个新的连接放入到`allObjects`对象中, 同时将连接返回.

##### 2.3 连接使用完毕关闭连接

当使用完连接调用连接关闭的时候, 连接池会将归还连接从`allObjects`中拿出来放入到`idleObjects`中, 所以下一次再获取连接将从`idleObjects`直接获取.
但是这里要特别注意, 从`allObjects`中拿出来放入到`idleObjects`中时, 并没有将连接从`allObjects`中删除, 也就是说`allObjects`和`idleObjects`中的连接实际上是指向同一个对象实例的. 为什么要这么做, 而不是直接删除`allObjects`中的连接呢? 因为`JedisPool`会在指定的时间内对连接池中空闲对象进行删除, 这样可以减少资源的占用, 这个是`JedisPool`的单独线程自动完成的操作. 所以说, 如果有个连接创建出来长时间没有使用是会被自动销毁的, 而不是一直连接着占用资源.
#3. 源码解析
##3.1 创建连接池
![](http://upload-images.jianshu.io/upload_images/4685968-5526d3f56cefd8a0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
其中最关键的部分就是JedisPoolConfig对象的创建
![JedisPoolConfig源码](http://upload-images.jianshu.io/upload_images/4685968-aa59d7d5285200c5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
在创建连接池的同时会创建idleObjects对象
![GenericObjectPool.java源码-1](http://upload-images.jianshu.io/upload_images/4685968-3c081d4f42331d94.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![ GenericObjectPool.java源码-2](http://upload-images.jianshu.io/upload_images/4685968-64dd70c71b8f1c90.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在上面的代码中创建了idleObjects对象
`startEvictor(getTimeBetweenEvictionRunsMillis());`
启动自动回收空闲连接的代码!
![BaseGenericObjectPool.java](http://upload-images.jianshu.io/upload_images/4685968-34a642fa944f7b86.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
至于保存刚创建出来的连接的allObjects对象是GenericObjectPool的成员变量
![GenericObjectPool的域](http://upload-images.jianshu.io/upload_images/4685968-fd25b9e750ee7f8c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##3.2 获取连接
 `Jedis jedis = pool.getResource();`
调用上面的代码就可以获取一个连接了
获取连接最关键的就是borrowObject

`GenericObjectPool.java`
```java

public T borrowObject(long borrowMaxWaitMillis) throws Exception {
        assertOpen();

        ...other code...

        PooledObject<T> p = null;

        // 没有空闲连接的时候是否阻塞的等待连接
        boolean blockWhenExhausted = getBlockWhenExhausted();

        boolean create;
        long waitTime = System.currentTimeMillis();

        while (p == null) {
            create = false;
            // 没有空闲连接时等待
            if (blockWhenExhausted) {
                // 先从idleObjects队列中获取
                p = idleObjects.pollFirst();
                if (p == null) {
                  // 如果队列中没有空闲的连接, 则创建一个连接
                    p = create();
                    if (p != null) {
                        create = true;
                    }
                }
                // 如果连接创建失败, 则继续从idleObjects中阻塞的获取连接
                if (p == null) {
                    if (borrowMaxWaitMillis < 0) {
                     // 无限制的等待, 不会超时
                        p = idleObjects.takeFirst();
                    } else {
                     // 有超时时间的等待
                        p = idleObjects.pollFirst(borrowMaxWaitMillis,
                                TimeUnit.MILLISECONDS);
                    }
                }
                if (p == null) {
                    throw new NoSuchElementException(
                            "Timeout waiting for idle object");
                }
                if (!p.allocate()) {
                    p = null;
                }
            } else { // 没有空闲连接时直接抛出异常
                p = idleObjects.pollFirst();
                if (p == null) {
                    p = create();
                    if (p != null) {
                        create = true;
                    }
                }
                if (p == null) {
                    throw new NoSuchElementException("Pool exhausted");
                }
                if (!p.allocate()) {
                    p = null;
                }
            }
    ...other code...
        }

        updateStatsBorrow(p, System.currentTimeMillis() - waitTime);
   
   // 返回连接
        return p.getObject();
    }
```

上面是获取连接时的一个完整的流程, 包括有空闲连接时直接返回, 没有空闲连接时创建空闲连接, 连接创建失败后是继续阻塞等待(包括是否超时)还是直接抛出异常. 下面看一下是如何创建一个连接的
`GenericObjectPool.java`
```java
private PooledObject<T> create() throws Exception {

   // 判断当前已经创建的连接是否已经超过设置的最大连接数(默认是8)
        int localMaxTotal = getMaxTotal();
        long newCreateCount = createCount.incrementAndGet();
        if (localMaxTotal > -1 && newCreateCount > localMaxTotal ||
                newCreateCount > Integer.MAX_VALUE) {
            createCount.decrementAndGet();
            return null;
        }

        final PooledObject<T> p;
        try {
          // 创建一个到redis server的连接
            p = factory.makeObject();
        } catch (Exception e) {
            createCount.decrementAndGet();
            throw e;
        }

       ...other code...

        createdCount.incrementAndGet();
        // 将新创建的连接放入到allObjects中
        allObjects.put(new IdentityWrapper<T>(p.getObject()), p);
        // 返回新创建的连接
        return p;
 }
```
上面就是创建一个到redis server连接的过程. 但是上面没有深究是如何与redis server创建连接的, 因为这次介绍的主题是JedisPool, 所以客户端与redis server创建连接的具体细节会在之后的文章中介绍.
##3.3 关闭连接
在使用完一个连接之后就要将一个连接关闭. 其实上面创建一个连接之后还有一个比较重要的步骤
```java
  @Override
  public Jedis getResource() {
    // 获取连接
    Jedis jedis = super.getResource();
   // 将连接池放入到连接中, 这里这么做的目的其实就是为关闭连接的时候作准备的
    jedis.setDataSource(this);
    return jedis;
  }
```
调用下面的代码就可以关闭连接
` jedis.close();`
连接池的作用就是为了缓存连接而生的, 所以这里的关闭连接肯定不能是直接和redis server断开连接
所以让我们看看这里的关闭连接到底是做了什么操作从而实现连接的复用
![Jedis方法源码](http://upload-images.jianshu.io/upload_images/4685968-69cf6b2f7f199610.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

所以当关闭一个连接的时候如果连接存在其实是将资源还给了连接池. 其中最核心的方法就是returnObject
![GenericObjectPool方法源码](http://upload-images.jianshu.io/upload_images/4685968-bd1ff00deb8ecd4f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#4. 总结
Jedis的连接池使用上是对apache common pool2的一个实现, 有了Jedis Pool这个例子以后要是要实现自己的连接池也方便许多
