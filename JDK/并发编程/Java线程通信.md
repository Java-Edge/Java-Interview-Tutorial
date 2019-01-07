要想实现多个线程之间的协同，如：线程执行先后顺序、获取某个线程执行的结果等。
涉及到线程之间相互通信，分为如下四类：
# 1 文件共享
![](https://img-blog.csdnimg.cn/20191008023446691.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
# 2 网络共享
socket编程

# 3 共享变量
![](https://img-blog.csdnimg.cn/20191008023621435.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

# 4 线程协作（JDK API）
细分为: ~~suspend/resume~~ 、 wait/notify、 park/unpark

JDK中对于需要多线程协作完成某一任务的场景，提供了对应API支持。
多线程协作的典型场景是:生产者-消费者模型。(线程阻塞、 线程唤醒)

## 示例
- 线程-1去买包子，没有包子，则不再执行
- 线程-2生产出包子，通知线程-1继续执行
![](https://img-blog.csdnimg.cn/2019100802383347.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

## 4.1 suspend、resume（废弃）
- 调用suspend挂起目标线程
- resume恢复线程执行
![](https://img-blog.csdnimg.cn/2021071910523538.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
但该组合很容易写出
### 死锁
- 同步代码中使用
![](https://img-blog.csdnimg.cn/2019100802572960.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210719133903312.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

- 先后顺序：suspend比resume后执行
![](https://img-blog.csdnimg.cn/2019100803021180.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191008030515787.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
所以用如下机制替代
## 4.2 wait/notify
这些方法只能由**同一对象锁**的持有者线程调用，也就是写在同步块里面，否则抛IllegalMonitorStateException。

**wait** 方法导致当前线程等待，加入该对象的等待集合中，并且**放弃当前持有的对象锁**。

**notify**/**notifyAll** 方法唤醒**一个**/**所有**正在等待这个对象锁的线程。

> 虽然wait会自动解锁，但**对顺序有要求**。若在notify被调用后， 才调用wait，则线程会永远处于**WAITING**态。

### 正常使用
![](https://img-blog.csdnimg.cn/20191008031659529.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
### 死锁
![](https://img-blog.csdnimg.cn/20191008032042659.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191008032138968.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
## 4.3 park/unpark
LockSupport用来创建锁和其他同步类的基本线程阻塞原语：
- 线程调用`LockSupport.park`，则等待“许可”
- 线程调用`LockSupport.unpark`，必须把等待获得许可的线程作为参数进行传递，好让此线程继续运行，为指定线程提供“许可(permit)” 

**不要求park和unpark方法的调用顺序**。

多次调用unpark之后，再调用park，线程会直接运行，**不会叠加**，即连续多次调用park，第一次会拿到“许可”直接运行，后续调用会进入等待。

### 正常![](https://img-blog.csdnimg.cn/20191008033156471.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
### 死锁
![](https://img-blog.csdnimg.cn/20191008033327469.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
# 5 伪唤醒
**之前代码中用if语句来判断，是否进入等待状态，是错误的**。

官方推荐`应该在循环中检查等待条件`，因为处于等待状态的线程可能会收到**错误警报和伪唤醒**，如果不在循环中检查等待条件，程序就可能在没有满足结束条件的情况下退出。

伪唤醒是指线程并非因为notify、notifyall、 unpark等API调用而唤醒，而是更底层原因导致的。
![](https://img-blog.csdnimg.cn/20191008034349825.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)