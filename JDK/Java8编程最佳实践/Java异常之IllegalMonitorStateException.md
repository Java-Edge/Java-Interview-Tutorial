# JavaDoc
Thrown to indicate that a thread has attempted to wait on an object's monitor or to notify other threads waiting on an object's monitor without owning the specified monitor.
其实意思就是说,也就是当前的线程不是此对象监视器的所有者。也就是要在当前线程锁定对象，才能用锁定的对象此行这些方法，需要用到synchronized ，锁定什么对象就用什么对象来执行  notify(), notifyAll(),wait(), wait(long), wait(long, int)操作，否则就会报IllegalMonitorStateException

A thread becomes the owner of the object's monitor in one of three ways:
1\. By executing a synchronized instance method of that object.
2\. By executing the body of a synchronized statement that synchronizes on the object.
3\. For objects of type Class, by executing a synchronized static method of that class. 
通过以下三种方法之一，线程可以成为此对象监视器的所有者：

*   执行此对象的同步 (Sychronized) 实例方法
*   执行在此对象上进行同步的 synchronized 语句的正文
*   对于 Class 类型的对象，执行该类的同步静态方法

也就是在说,就是需要在调用wait()或者notify()之前，必须使用synchronized语义绑定住被wait/notify的对象。

# 解决方法:
通过实现加锁的方式实现线程同步时产生的并发问题
## 1 锁定方法所属的实例对象
```
public synchronized void method（）{
    //然后就可以调用：this.notify()...
    //或者直接调用notify()...
}
```
## 2 锁定方法所属的实例的Class
```
public Class Test{
 public static synchronized void method（）{
    //然后调用：Test.class.notify()...
 }
}
```
## 3 锁定其他对象
```
public Class Test{
public Object lock = new Object();
 public static void method（）{
    synchronized (lock) {
     //需要调用 lock.notify();
    } 
 }
}
```
# 总结
线程操作的wait()、notify()、notifyAll()只能在同步控制方法或同步控制块内调用
如果在非同步控制方法或控制块里调用，程序能通过编译，但运行的时候，将得到  IllegalMonitorStateException 异常，并伴随着一些含糊信息，比如 ‘当前线程不是拥有者’。
其实异常的含义是 调用wait()、notify()、notifyAll()的任务在调用这些方法前必须 ‘拥有’（获取）对象的锁。”
