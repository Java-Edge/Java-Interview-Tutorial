位运算表示线程池状态，因为位运算是改变当前值的一种高效手段。

# 属性
##  线程池状态
Integer 有32位：
- 最左边3位表示线程池状态，可表示从0至7的8个不同数值
- 最右边29位表工作线程数
```java
private static final int COUNT_BITS = Integer.SIZE - 3;
```


线程池的状态用高3位表示，其中包括了符号位。五种状态的十进制值按从小到大依次排序为：

```bash
RUNNING < SHUTDOWN < STOP < TIDYING <TERMINATED
```
这就能通过比较值的大小来确定线程池的状态。

源码中经常出现通过isRunning判断
![](https://img-blog.csdnimg.cn/20210713164331545.png)

000-1111111111111111111111111;
类似于子网掩码，用于与运算。得到左3位 or 右29位
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUzMzA5XzQ2ODU5NjgtNmM3Zjg5NDExNjk3MmEyZi5wbmc?x-oss-process=image/format,png)

- 111 - 0000000000000000000000000000(十进制: -536, 870, 912);
该状态表示：线程池能接受新任务
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzEzXzQ2ODU5NjgtZTgzOGM1NmI5OTU0NGU5My5wbmc?x-oss-process=image/format,png)
- 000 - 0000000000000000000000000(十进制: 0);
不再接受新任务，但可继续执行队列中的任务
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUzMDI1XzQ2ODU5NjgtZDM0NDc2NzhiNzdjODUxZi5wbmc?x-oss-process=image/format,png)

- 001 - 00000000000000000000000000(十进制: 536,870， 912);
全面拒绝，并中断正在处理的任务
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyODcyXzQ2ODU5NjgtNmMzOTlhMjhkZTBmMzc1Yi5wbmc?x-oss-process=image/format,png)

- 010 - 00000000000000000000000000.(十进制值: 1, 073, 741, 824);
所有任务已经被终止
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyODE0XzQ2ODU5NjgtZTEzNDFjY2FlM2Q3MzQ3My5wbmc?x-oss-process=image/format,png)

- 101 - 000000000000000000000000000(十进制值: 1, 610,612, 736)
已清理完现场
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzEzXzQ2ODU5NjgtMmI4M2VmMmEwZjI4YjU3MC5wbmc?x-oss-process=image/format,png)

### 与运算
000 - 11111111111111111111 位掩码，用于后续的掩码参与计算。
```java
private static final int CAPACITY   = (1 << COUNT_BITS) - 1;
```

比如：001 - 000000000000000000000100011 表 35 个工作线程。
掩码取反：111 - 00000000000000000000000，即得到左边3位001;
表示线程池当前处于**STOP**状态

```java
private static int runStateOf(int c)     { return c & ~CAPACITY; }
```
同理掩码 000 - 11111111111111111111，得到右29位，即工作线程数：
```java
private static int workerCountOf(int c)  { return c & CAPACITY; }
```


把左3位与右29位或运算,合并成一个值

```java
private static int ctlOf(int rs, int wc) { return rs | wc; }
```

线程池状态控制器，保存了线程池的状态、工作线程数
```java
private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));
```

我们都知道`Executor`接口有且只有一个方法`execute()`，通过参数传入待执行线程的对象。
## execute
线程池执行任务
```java
public void execute(Runnable command) {
    if (command == null)
        throw new NullPointerException();
    /**
     * 分 3 步：
     * 2. 如果一个任务可以成功排队，那么仍需double-check我们是否应该添加一个线程（因为自上次检查以来现有线程已死亡）或池在进入此方法后关闭.所以我们重新检查状态，并在必要时回滚.如果停止，或者如果没有，则启动一个新线程
     * 3. 如果我们无法将任务排队，则尝试添加一个新线程。如果失败，我们知道我们已经关闭或饱和，因此拒绝该任务
     */
    int c = ctl.get();

    // 1. 若工作线程数 < 核心线程数,则创建新线程并执行当前任务
    if (workerCountOf(c) < corePoolSize) {
        if (addWorker(command, true))
	        return;
         // 若创建失败,为防止外部已经在线程池中加入新任务,在此重新获取一下
         c = ctl.get();
     }
```
`execute`方法在不同的阶段有三次`addWorker`的尝试动作。
```java
// 若 工作线程数 >=核心线程数 或线程创建失败,则将当前任务放到工作队列中
// 只有线程池处于 RUNNING 态,才执行后半句 : 置入队列
if (isRunning(c) && workQueue.offer(command)) {
    int recheck = ctl.get();
    
    // 只有线程池处于 RUNNING 态,才执行后半句 : 置入队列
    if (! isRunning(recheck) && remove(command))
        reject(command);
    // 若之前的线程已被消费完,新建一个线程
    else if (workerCountOf(recheck) == 0)
        addWorker(null, false);
// 核心线程和队列都已满,尝试创建一个新线程
}
else if (!addWorker(command, false))
    // 抛出RejectedExecutionException异常
    // 若 addWorker 返回是 false,即创建失败,则唤醒拒绝策略.
    reject(command);
}
```
发生拒绝的理由有两个
( 1 )线程池状态为非RUNNING状态
(2)等待队列已满。

下面继续分析`addWorker`

## addWorker 源码解析
原子性地检查 runState 和 workerCount，通过返回 false 来防止在不应该添加线程时出现误报。

根据当前线程池状态，检查是否可以添加新的线程：
- 若可
则创建并启动任务;若一切正常则返回true;
- 返回false的可能原因：
1. 线程池没有处`RUNNING`态
2. 线程工厂创建新的任务线程失败
### 参数
- firstTask
外部启动线程池时需要构造的第一个线程，它是线程的母体
- core
新增工作线程时的判断指标
     - true
需要判断当前`RUNNING`态的线程是否少于`corePoolsize`
    - false
需要判断当前`RUNNING`态的线程是否少于`maximumPoolsize`
### JDK8源码
```java
private boolean addWorker(Runnable firstTask, boolean core) {
	// 1. 不需要任务预定义的语法标签，响应下文的continue retry
	// 	快速退出多层嵌套循环
    retry:
    // 外自旋,判断线程池的运行状态
    for (;;) {
        int c = ctl.get();
        int rs = runStateOf(c);
		// 2. 若RUNNING态,则条件为false,不执行后面判断
		//  若STOP及以上状态,或firstTask初始线程非空,或队列为空
		//  都会直接返回创建失败
        // Check if queue empty only if necessary.
        if (rs >= SHUTDOWN &&
            ! (rs == SHUTDOWN &&
               firstTask == null &&
               ! workQueue.isEmpty()))
            return false;

        for (;;) {
            int wc = workerCountOf(c);
            // 若超过最大允许线程数，则不能再添加新线程
            if (wc >= CAPACITY ||
                wc >= (core ? corePoolSize : maximumPoolSize))
                return false;
            // 3. 将当前活动线程数+1
            if (compareAndIncrementWorkerCount(c))
                break retry;
			// 线程池状态和工作线程数是可变化的，需经常读取最新值
            c = ctl.get();  // Re-read ctl
            // 若已关闭，则再次从retry 标签处进入，在第2处再做判断(第4处)
            if (runStateOf(c) != rs)
                continue retry;
            //如果线程池还是RUNNING态,说明仅仅是第3处失败
//继续循环执行(第5外)    
            // else CAS failed due to workerCount change; retry inner loop
        }
    }
    
	// 开始创建工作线程
    boolean workerStarted = false;
    boolean workerAdded = false;
    Worker w = null;
    try {
        // 利用Worker 构造方法中的线程池工厂创建线程,并封装成工作线程Worker对象
        // 和 AQS 有关！！！
        w = new Worker(firstTask);
        // 6. 注意这是Worker中的属性对象thread
        final Thread t = w.thread;
        if (t != null) {
        	// 在进行ThreadpoolExecutor的敏感操作时
        	// 都需要持有主锁，避免在添加和启动线程时被干扰
            final ReentrantLock mainLock = this.mainLock;
            mainLock.lock();
            try {
                // Recheck while holding lock.
                // Back out on ThreadFactory failure or if
                // shut down before lock acquired.
                int rs = runStateOf(ctl.get());
				// 当线程池状态为RUNNING 或SHUTDOWN
				// 且firstTask 初始线程为空时
                if (rs < SHUTDOWN ||
                    (rs == SHUTDOWN && firstTask == null)) {
                    if (t.isAlive()) // precheck that t is startable
                        throw new IllegalThreadStateException();
                    workers.add(w);
                    int s = workers.size();
                    // 整个线程池在运行期间的最大并发任务个数
                    if (s > largestPoolSize)
                    	// 更新为工作线程的个数
                        largestPoolSize = s;
                    // 新增工作线程成功    
                    workerAdded = true;
                }
            } finally {
                mainLock.unlock();
            }
            if (workerAdded) {
            	// 看到亲切迷人的start方法了!
            	// 这并非线程池的execute 的command 参数指向的线程
                t.start();
                workerStarted = true;
            }
        }
    } finally {
	    // 线程启动失败，把刚才第3处加，上的工作线程计数再减-回去
        if (! workerStarted)
            addWorkerFailed(w);
    }
    return workerStarted;
}
```
#### 第1处
配合循环语句出现的标签，类似于goto语法作用。label 定义时，必须把标签和冒号的组合语句紧紧相邻定义在循环体之前，否则编译报错。目的是在实现多重循环时能够快速退出到任何一层。出发点似乎非常贴心，但在大型软件项目中，滥用标签行跳转的后果将是无法维护的！


在 **workerCount** 加1成功后，直接退出两层循环。

#### 第2处,这样的表达式不利于阅读,应如是
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzg1XzQ2ODU5NjgtMDg2ZTlkNWY5ZGEyYWZkNC5wbmc?x-oss-process=image/format,png)

#### 第3处
与第1处的标签呼应,`AtomicInteger`对象的加1操作是原子性的。`break retry`表 直接跳出与`retry` 相邻的这个循环体
 
#### 第4处
此`continue`跳转至标签处,继续执行循环.
如果条件为false,则说明线程池还处于运行状态,即继续在`for(;)`循环内执行.

#### 第5处
`compareAndIncrementWorkerCount `方法执行失败的概率非常低.
即使失败,再次执行时成功的概率也是极高的,类似于自旋原理.
这里是先加1,创建失败再减1,这是轻量处理并发创建线程的方式;
如果先创建线程,成功再加1,当发现超出限制后再销毁线程,那么这样的处理方式明显比前者代价要大.

#### 第6处
`Worker `对象是工作线程的核心类实现。它实现了`Runnable`接口,并把本对象作为参数输入给`run()`中的`runWorker (this)`。所以内部属性线程`thread`在`start`的时候，即会调用`runWorker`。

```java
private final class Worker
    extends AbstractQueuedSynchronizer
    implements Runnable
{
    /**
     * This class will never be serialized, but we provide a
     * serialVersionUID to suppress a javac warning.
     */
    private static final long serialVersionUID = 6138294804551838833L;

    /** Thread this worker is running in.  Null if factory fails. */
    final Thread thread;
    /** Initial task to run.  Possibly null. */
    Runnable firstTask;
    /** Per-thread task counter */
    volatile long completedTasks;

    /**
     * Creates with given first task and thread from ThreadFactory.
     * @param firstTask the first task (null if none)
     */
    Worker(Runnable firstTask) {
        setState(-1); // 直到调用runWorker前，禁止被中断
        this.firstTask = firstTask;
        this.thread = getThreadFactory().newThread(this);
    }

    /** 将主线程的 run 循环委托给外部的 runWorker 执行 */
    public void run() {
        runWorker(this);
    }

    // Lock methods
    //
    // The value 0 represents the unlocked state.
    // The value 1 represents the locked state.

    protected boolean isHeldExclusively() {
        return getState() != 0;
    }

    protected boolean tryAcquire(int unused) {
        if (compareAndSetState(0, 1)) {
            setExclusiveOwnerThread(Thread.currentThread());
            return true;
        }
        return false;
    }

    protected boolean tryRelease(int unused) {
        setExclusiveOwnerThread(null);
        setState(0);
        return true;
    }

    public void lock()        { acquire(1); }
    public boolean tryLock()  { return tryAcquire(1); }
    public void unlock()      { release(1); }
    public boolean isLocked() { return isHeldExclusively(); }

    void interruptIfStarted() {
        Thread t;
        if (getState() >= 0 && (t = thread) != null && !t.isInterrupted()) {
            try {
                t.interrupt();
            } catch (SecurityException ignore) {
            }
        }
    }
}
```
#### setState(-1)是为何
设置个简单的状态，检查状态以防止中断。在调用停止线程池时会判断state 字段，决定是否中断之。
![](https://img-blog.csdnimg.cn/20210713174701301.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)![](https://img-blog.csdnimg.cn/20210713175625198.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)![](https://img-blog.csdnimg.cn/20210713175645371.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)![](https://img-blog.csdnimg.cn/20210713175718745.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
#### t 到底是谁？
![](https://img-blog.csdnimg.cn/20210713180707150.png)
# 源码分析
```java
   /**
	 * 检查是否可以根据当前池状态和给定的边界（核心或最大)
     * 添加新工作线程。如果是这样,工作线程数量会相应调整，如果可能的话,一个新的工作线程创建并启动
     * 将firstTask作为其运行的第一项任务。
     * 如果池已停止此方法返回false
     * 如果线程工厂在被访问时未能创建线程,也返回false
     * 如果线程创建失败，或者是由于线程工厂返回null，或者由于异常（通常是在调用Thread.start（）后的OOM）），我们干净地回滚。
	 */
    private boolean addWorker(Runnable firstTask, boolean core) { 
    /**
     * Check if queue empty only if necessary.
     * 
     * 如果线程池已关闭，并满足以下条件之一，那么不创建新的 worker：
     *      1. 线程池状态大于 SHUTDOWN，也就是 STOP, TIDYING, 或 TERMINATED
     *      2. firstTask != null
     *      3. workQueue.isEmpty()
     * 简单分析下：
     *      状态控制的问题，当线程池处于 SHUTDOWN ，不允许提交任务，但是已有任务继续执行
     *      当状态大于 SHUTDOWN ，不允许提交任务，且中断正在执行任务
     *      多说一句：若线程池处于 SHUTDOWN，但 firstTask 为 null，且 workQueue 非空，是允许创建 worker 的
     *  
     */
            if (rs >= SHUTDOWN &&
                ! (rs == SHUTDOWN &&
                   firstTask == null &&
                   ! workQueue.isEmpty()))
                return false;

            for (;;) {
                int wc = workerCountOf(c);
                if (wc >= CAPACITY ||
                    wc >= (core ? corePoolSize : maximumPoolSize))
                    return false;
                // 如果成功，那么就是所有创建线程前的条件校验都满足了，准备创建线程执行任务
                // 这里失败的话，说明有其他线程也在尝试往线程池中创建线程
                if (compareAndIncrementWorkerCount(c))
                    break retry;
                // 由于有并发，重新再读取一下 ctl
                c = ctl.get();  // Re-read ctl
                // 正常如果是 CAS 失败的话，进到下一个里层的for循环就可以了
                // 可如果是因为其他线程的操作，导致线程池的状态发生了变更，如有其他线程关闭了这个线程池
                // 那么需要回到外层的for循环
                if (runStateOf(c) != rs)
                    continue retry;
                // else CAS failed due to workerCount change; retry inner loop
            }
        }

     /* *
        * 到这里，我们认为在当前这个时刻，可以开始创建线程来执行任务
        */
         
        // worker 是否已经启动
        boolean workerStarted = false;
        // 是否已将这个 worker 添加到 workers 这个 HashSet 中
        boolean workerAdded = false;
        Worker w = null;
        try {
           // 把 firstTask 传给 worker 的构造方法
            w = new Worker(firstTask);
            // 取 worker 中的线程对象，Worker的构造方法会调用 ThreadFactory 来创建一个新的线程
            final Thread t = w.thread;
            if (t != null) {
               //先加锁
                final ReentrantLock mainLock = this.mainLock;
                // 这个是整个类的全局锁，持有这个锁才能让下面的操作“顺理成章”，
                // 因为关闭一个线程池需要这个锁，至少我持有锁的期间，线程池不会被关闭
                mainLock.lock();
                try {
                    // Recheck while holding lock.
                    // Back out on ThreadFactory failure or if
                    // shut down before lock acquired.
                    int rs = runStateOf(ctl.get());

                    // 小于 SHUTTDOWN 即 RUNNING
                    // 如果等于 SHUTDOWN，不接受新的任务，但是会继续执行等待队列中的任务
                    if (rs < SHUTDOWN ||
                        (rs == SHUTDOWN && firstTask == null)) {
                        // worker 里面的 thread 不能是已启动的
                        if (t.isAlive()) // precheck that t is startable
                            throw new IllegalThreadStateException();
                        // 加到 workers 这个 HashSet 中
                        workers.add(w);
                        int s = workers.size();
                        if (s > largestPoolSize)
                            largestPoolSize = s;
                        workerAdded = true;
                    }
                } finally {
                    mainLock.unlock();
                }
               // 若添加成功
                if (workerAdded) {
                    // 启动线程
                    t.start();
                    workerStarted = true;
                }
            }
        } finally {
            // 若线程没有启动，做一些清理工作，若前面 workCount 加了 1，将其减掉
            if (! workerStarted)
                addWorkerFailed(w);
        }
        // 返回线程是否启动成功
        return workerStarted;
    }
```
看下  `addWorkFailed` 
![](https://img-blog.csdnimg.cn/20210714141244398.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)


![记录 workers 中的个数的最大值,因为 workers 是不断增加减少的，通过这个值可以知道线程池的大小曾经达到的最大值](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzA4XzQ2ODU5NjgtMDc4NDcyYjY4MmZjYzljZC5wbmc?x-oss-process=image/format,png)
继续看
### runWorker
```java
//  worker 线程启动后调用,while 循环(即自旋!)不断从等待队列获取任务并执行
//  worker 初始化时，可指定 firstTask，那么第一个任务也就可以不需要从队列中获取
final void runWorker(Worker w) {
    Thread wt = Thread.currentThread();
    // 该线程的第一个任务(若有)
    Runnable task = w.firstTask;
    w.firstTask = null;
    // 允许中断
    w.unlock(); 
 
    boolean completedAbruptly = true;
    try {
        // 循环调用 getTask 获取任务
        while (task != null || (task = getTask()) != null) {
            w.lock();          
            // 若线程池状态大于等于 STOP，那么意味着该线程也要中断
              /**
               * 若线程池STOP，请确保线程 已被中断
               * 如果没有，请确保线程未被中断
               * 这需要在第二种情况下进行重新检查，以便在关中断时处理shutdownNow竞争
               */
            if ((runStateAtLeast(ctl.get(), STOP) ||
                 (Thread.interrupted() &&
                  runStateAtLeast(ctl.get(), STOP))) &&
                !wt.isInterrupted())
                wt.interrupt();
            try {
                // 这是一个钩子方法，留给需要的子类实现
                beforeExecute(wt, task);
                Throwable thrown = null;
                try {
                    // 到这里终于可以执行任务了
                    task.run();
                } catch (RuntimeException x) {
                    thrown = x; throw x;
                } catch (Error x) {
                    thrown = x; throw x;
                } catch (Throwable x) {
                    // 这里不允许抛出 Throwable，所以转换为 Error
                    thrown = x; throw new Error(x);
                } finally {
                    // 也是一个钩子方法，将 task 和异常作为参数，留给需要的子类实现
                    afterExecute(task, thrown);
                }
            } finally {
                // 置空 task，准备 getTask 下一个任务
                task = null;
                // 累加完成的任务数
                w.completedTasks++;
                // 释放掉 worker 的独占锁
                w.unlock();
            }
        }
        completedAbruptly = false;
    } finally {
        // 到这里，需要执行线程关闭
        // 1. 说明 getTask 返回 null，也就是说，这个 worker 的使命结束了，执行关闭
        // 2. 任务执行过程中发生了异常
        //    第一种情况，已经在代码处理了将 workCount 减 1，这个在 getTask 方法分析中说
        //    第二种情况，workCount 没有进行处理，所以需要在 processWorkerExit 中处理
        processWorkerExit(w, completedAbruptly);
    }
}
```
看看
### getTask()
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzgwXzQ2ODU5NjgtNWU5NDc3MzE5M2Q5Y2Y0OS5wbmc?x-oss-process=image/format,png)
```java
// 此方法有三种可能
// 1. 阻塞直到获取到任务返回。默认 corePoolSize 之内的线程是不会被回收的，它们会一直等待任务
// 2. 超时退出。keepAliveTime 起作用的时候，也就是如果这么多时间内都没有任务，那么应该执行关闭
// 3. 如果发生了以下条件，须返回 null
//     池中有大于 maximumPoolSize 个 workers 存在(通过调用 setMaximumPoolSize 进行设置)
//     线程池处于 SHUTDOWN，而且 workQueue 是空的，前面说了，这种不再接受新的任务
//     线程池处于 STOP，不仅不接受新的线程，连 workQueue 中的线程也不再执行
private Runnable getTask() {
    boolean timedOut = false; // Did the last poll() time out?

   for (;;) {
   // 允许核心线程数内的线程回收，或当前线程数超过了核心线程数，那么有可能发生超时关闭
 
            // 这里 break，是为了不往下执行后一个 if (compareAndDecrementWorkerCount(c))
            // 两个 if 一起看：如果当前线程数 wc > maximumPoolSize，或者超时，都返回 null
            // 那这里的问题来了，wc > maximumPoolSize 的情况，为什么要返回 null？
            // 换句话说，返回 null 意味着关闭线程。
            // 那是因为有可能开发者调用了 setMaximumPoolSize 将线程池的 maximumPoolSize 调小了
        
            // 如果此 worker 发生了中断，采取的方案是重试
            // 解释下为什么会发生中断，这个读者要去看 setMaximumPoolSize 方法，
            // 如果开发者将 maximumPoolSize 调小了，导致其小于当前的 workers 数量，
            // 那么意味着超出的部分线程要被关闭。重新进入 for 循环，自然会有部分线程会返回 null
            int c = ctl.get();
            int rs = runStateOf(c);

            // Check if queue empty only if necessary.
            if (rs >= SHUTDOWN && (rs >= STOP || workQueue.isEmpty())) {
                // CAS 操作，减少工作线程数
                decrementWorkerCount();
                return null;
            }

            int wc = workerCountOf(c);

            // Are workers subject to culling?
            boolean timed = allowCoreThreadTimeOut || wc > corePoolSize;

            if ((wc > maximumPoolSize || (timed && timedOut))
                && (wc > 1 || workQueue.isEmpty())) {
                if (compareAndDecrementWorkerCount(c))
                    return null;
                continue;
            }

            try {
                Runnable r = timed ?
                    workQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS) :
                    workQueue.take();
                if (r != null)
                    return r;
                timedOut = true;
            } catch (InterruptedException retry) {
            // 如果此 worker 发生了中断，采取的方案是重试
            // 解释下为什么会发生中断，这个读者要去看 setMaximumPoolSize 方法，
            // 如果开发者将 maximumPoolSize 调小了，导致其小于当前的 workers 数量，
            // 那么意味着超出的部分线程要被关闭。重新进入 for 循环，自然会有部分线程会返回 null
                timedOut = false;
            }
        }
}
```
到这里，基本上也说完了整个流程，回到 execute(Runnable command) 方法，看看各个分支，我把代码贴过来一下：
```java
    public void execute(Runnable command) {
        if (command == null)
            throw new NullPointerException();
        //表示 “线程池状态” 和 “线程数” 的整数
        int c = ctl.get();
        // 如果当前线程数少于核心线程数，直接添加一个 worker 执行任务，
        // 创建一个新的线程，并把当前任务 command 作为这个线程的第一个任务(firstTask)
        if (workerCountOf(c) < corePoolSize) {
        // 添加任务成功，即结束
        // 执行的结果，会包装到 FutureTask 
        // 返回 false 代表线程池不允许提交任务
            if (addWorker(command, true))
                return;
           
            c = ctl.get();
        }
        // 到这说明，要么当前线程数大于等于核心线程数，要么刚刚 addWorker 失败
 
        // 如果线程池处于 RUNNING ，把这个任务添加到任务队列 workQueue 中
        if (isRunning(c) && workQueue.offer(command)) {
            /* 若任务进入 workQueue，我们是否需要开启新的线程
             * 线程数在 [0, corePoolSize) 是无条件开启新线程的
             * 若线程数已经大于等于 corePoolSize，则将任务添加到队列中，然后进到这里
             */
            int recheck = ctl.get();
            // 若线程池不处于 RUNNING ，则移除已经入队的这个任务，并且执行拒绝策略
            if (! isRunning(recheck) && remove(command))
                reject(command);
            // 若线程池还是 RUNNING ，且线程数为 0，则开启新的线程
            // 这块代码的真正意图：担心任务提交到队列中了，但是线程都关闭了
            else if (workerCountOf(recheck) == 0)
                addWorker(null, false);
        }
        // 若 workQueue 满，到该分支
        // 以 maximumPoolSize 为界创建新 worker，
        // 若失败，说明当前线程数已经达到 maximumPoolSize，执行拒绝策略
        else if (!addWorker(command, false))
            reject(command);
    }
```
**工作线程**:线程池创建线程时,会将线程封装成工作线程Worker,Worker在执行完任务后,还会循环获取工作队列里的任务来执行.我们可以从Worker类的run()方法里看到这点

```java
  public void run() {
        try {
            Runnable task = firstTask;
            firstTask = null;
            while (task != null || (task = getTask()) != null) {
                runTask(task);
                task = null;
            }
        } finally {
            workerDone(this);
        }
    }
 boolean workerStarted = false;
        boolean workerAdded = false;
        Worker w = null;
        try {
            w = new Worker(firstTask);

            final Thread t = w.thread;
            if (t != null) {
               //先加锁
                final ReentrantLock mainLock = this.mainLock;
                mainLock.lock();
                try {
                    // Recheck while holding lock.
                    // Back out on ThreadFactory failure or if
                    // shut down before lock acquired.
                    int rs = runStateOf(ctl.get());

                    if (rs < SHUTDOWN ||
                        (rs == SHUTDOWN && firstTask == null)) {
                        if (t.isAlive()) // precheck that t is startable
                            throw new IllegalThreadStateException();
                        workers.add(w);
                        int s = workers.size();
                        if (s > largestPoolSize)
                            largestPoolSize = s;
                        workerAdded = true;
                    }
                } finally {
                    mainLock.unlock();
                }
                if (workerAdded) {
                    t.start();
                    workerStarted = true;
                }
            }
        } finally {
            if (! workerStarted)
                addWorkerFailed(w);
        }
        return workerStarted;
    }
```
线程池中的线程执行任务分两种情况
 - 在execute()方法中创建一个线程时,会让这个线程执行当前任务
 - 这个线程执行完上图中 1 的任务后,会反复从BlockingQueue获取任务来执行