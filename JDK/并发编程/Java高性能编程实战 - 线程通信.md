要想实现多个线程之间的协同，如:线程执行先后顺序、获取某个线程执行的结果等等。
涉及到线程之间相互通信，分为下面四类:

# 1 文件共享
![](https://img-blog.csdnimg.cn/20191008023446691.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
# 2 网络共享
socket编程问题,非本文重点,不再赘述

# 3 共享变量
![](https://img-blog.csdnimg.cn/20191008023621435.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

# 4 线程协作 - JDK API
细分为: ~~suspend/resume~~ 、 wait/notify、 park/unpark

JDK中对于需要多线程协作完成某一任务的场景，提供了对应API支持。
多线程协作的典型场景是:生产者-消费者模型。(线程阻塞、 线程唤醒)

示例:线程1去买包子，没有包子，则不再执行。线程-2生产出包子，通知线程-1继续执行。
![](https://img-blog.csdnimg.cn/2019100802383347.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

## 4.1 API - 被弃用的suspend和resume
作用:调用suspend挂起目标线程，通过resume可以恢复线程执行
![](https://img-blog.csdnimg.cn/20191008025019964.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

被弃用的主要原因是，容易写出
### 死锁代码
- 同步代码中使用
![](https://img-blog.csdnimg.cn/2019100802572960.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191008030038265.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
- 先后顺序:suspend比resume后执行
![](https://img-blog.csdnimg.cn/2019100803021180.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20191008030515787.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
所以用wait/notify和park/unpark机制对它进行替代

## 4.2 wait/notify
这些方法只能由**同一对象锁**的持有者线程调用，也就是写在同步块里面，否则会抛IllegalMonitorStateException

**wait** 方法导致当前线程等待，加入该对象的等待集合中，并且**放弃当前持有的对象锁**

**notify**/**notifyAll** 方法唤醒一个 或所有正在等待这个对象锁的线程。

> 虽然wait会自动解锁，但是**对顺序有要求**，如果在notify被调用之后， 才开始wait方法的调用，线程会永远处于**WAITING**状态。

-  正常使用
![](https://img-blog.csdnimg.cn/20191008031659529.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
- 死锁
![](https://img-blog.csdnimg.cn/20191008032042659.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191008032138968.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
- 小结
![](https://img-blog.csdnimg.cn/20191008031954289.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

## 4.3 park/unpark
线程调用park则等待“许可”，unpark方法为指定线程提供“许可(permit)” 。

**不要求park和unpark方法的调用顺序**

多次调用unpark之后，再调用park, 线程会直接运行。
**但不会叠加**，即连续多次调用park方法，第一次会拿到“许可”直接运行，后续调
用会进入等待。

- 正常![](https://img-blog.csdnimg.cn/20191008033156471.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
- 死锁
![](https://img-blog.csdnimg.cn/20191008033327469.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

# 5 伪唤醒
** 之前代码中用if语句来判断，是否进入等待状态，是错误的! **

官方建议`应该在循环中检查等待条件`，原因是处于等待状态的线程可能会收到**错误警报和伪
唤醒**，如果不在循环中检查等待条件，程序就会在没有满足结束条件的情况下退出。

伪唤醒是指线程并非因为notify、notifyall、 unpark等 api调用而唤醒，是更底层原因导致的。
![](https://img-blog.csdnimg.cn/20191008034349825.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

#  6 总结
 涉及很多JDK多线程开发工具类及其底层实现的原理