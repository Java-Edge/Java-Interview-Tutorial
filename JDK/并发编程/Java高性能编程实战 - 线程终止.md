# 0 [相关源码](https://github.com/Wasabi1234/Java-Concurrency-Progamming-Tutorial)

# 1 虚假的线程中止- Stop
Stop:中止线程，并且清除监控器锁的信息，但是可能导致线程安全问题，JDK不建议用。
Destroy: JDK未实现该方法

![](https://img-blog.csdnimg.cn/201908260337305.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/201908260337546.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 理想输出
i=1 j=1
- 程序执行结果
![](https://img-blog.csdnimg.cn/2019082702021450.png)

**`没有保证同步代码块里面数据的一致性，破坏了线程安全`**

# 2 真正的线程终止

## 2.1  interrupt
如果目标线程在调用Object class 的
- wait()
![](https://img-blog.csdnimg.cn/20190828014520704.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- wait(long)
![](https://img-blog.csdnimg.cn/20190828014439994.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70) 
- wait(long, int)
![](https://img-blog.csdnimg.cn/20190828014959986.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

或者Thread类的
- join()
![](https://img-blog.csdnimg.cn/20190828015451863.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- join(long, int)
![](https://img-blog.csdnimg.cn/20190829011105200.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- sleep(long, int)
![](https://img-blog.csdnimg.cn/20190829011219813.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

时被阻塞,那么**Interrupt**会生效， 该线程的中断状态将被清除，拋**InterruptedException**

如果目标线程是被I/O或者NIO中的Channel所阻塞，同样，I/O操作会被中断或者返回特殊异常值。达到终止线程的目的。

如果以上条件都不满足，则会设置此线程的中断状态。
对于上面的示例
- stop改成interrupt
![](https://img-blog.csdnimg.cn/20190829011507232.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 最终输出为“i=1 j=1”,数据一致
![](https://img-blog.csdnimg.cn/20190829011539438.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)


## 2.2 标志位
- 即代码中，增加一个判断，来控制线程执行的中止
![](https://img-blog.csdnimg.cn/20190829012012993.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)
## [Github](https://github.com/Wasabi1234)
