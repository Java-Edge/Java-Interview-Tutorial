# 1 线程封闭

多线程访问共享可变数据时，涉及到线程间数据同步的问题。并不是所有时候，都要用到
共享数据，所以线程封闭概念就提出来了。

数据都被封闭在各自的线程之中，就不需要同步，这种通过将数据封闭在线程中而避免使
用同步的技术称为**线程封闭**。

**避免并发异常最简单的方法就是线程封闭**
即 把对象封装到一个线程里,只有该线程能看到此对象;
那么该对象就算非线程安全,也不会出现任何并发安全问题.

## 1.1 栈封闭

局部变量的固有属性之一就是封闭在线程中。
它们位于执行线程的栈中，其他线程无法访问这个栈


## 1.2 使用`ThreadLocal`是实现线程封闭的最佳实践.

**ThreadLocal是Java里一种特殊的变量。**
它是一个线程级变量，每个线程都有一个ThreadLocal, 就是每个线程都拥有了自己独立的一个变量,
竞争条件被彻底消除了，在并发模式下是绝对安全的变量。

- 用法
- 
```java
ThreadLocal<T> var = new ThreadLocal<T>();
```

会自动在每一个线程上创建一个T的副本，副本之间彼此独立，互不影响。
可以用 ThreadLocal 存储一些参数， 以便在线程中多个方法中使用，用来代替方法传参的做法。

实例
![](https://img-blog.csdnimg.cn/20191009013555646.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
`ThreadLocal`内部维护了一个Map,Map的key是每个线程的名称,Map的值就是我们要封闭的对象.
每个线程中的对象都对应着Map中一个值,也就是`ThreadLocal`利用Map实现了对象的线程封闭.




对于CS游戏,开始时,每个人能够领到一把枪,枪把上有三个数字:子弹数、杀敌数、自己的命数，为其设置的初始值分别为1500、0、10.

设战场上的每个人都是一个线程,那么这三个初始值写在哪里呢?
如果每个线程都写死这三个值,万一将初始子弹数统一改成 1000发呢?
如果共享,那么线程之间的并发修改会导致数据不准确.
能不能构造这样一个对象,将这个对象设置为共享变量,统一设置初始值,但是每个线程对这个值的修改都是互相独立的.这个对象就是ThreadLocal
>注意不能将其翻译为线程本地化或本地线程
英语恰当的名称应该叫作:CopyValueIntoEveryThread

示例代码
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTA2MWI2N2QzYjdkZDAyNjcucG5n?x-oss-process=image/format,png)

> 实在难以理解的，可以理解为，JVM维护了一个Map<Thread, T>,每个线程要用这个T的时候，用当前的线程去Map里面取。仅作为一个概念理解


该示例中,无 set 操作,那么初始值又是如何进入每个线程成为独立拷贝的呢?
首先,虽然`ThreadLocal`在定义时重写了`initialValue()` ,但并非是在`BULLET_ NUMBER_ THREADLOCAL`对象加载静态变量的时候执行;
而是每个线程在`ThreadLocal.get()`时都会执行到;
其源码如下
![ThreadLocal # get()](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTdkY2JjNjZjOTY5YzUzMDcucG5n?x-oss-process=image/format,png)

每个线程都有自己的`ThreadLocalMap`;
如果`map ==null`,则直接执行`setInitialValue()`;
如果 map 已创建,就表示 Thread 类的`threadLocals` 属性已初始化完毕;
如果 `e==null`,依然会执行到`setinitialValue()`
`setinitialValue() `的源码如下:
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTQ4MzcxODdjNTk4NjIwN2EucG5n?x-oss-process=image/format,png)
这是一个保护方法，CsGameByThreadLocal中初始化ThreadLocal对象时已覆写value = initialValue() ;
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWM0NDI3Mzk3ZDBjMDRkZmMucG5n?x-oss-process=image/format,png)
` getMap `的源码就是提取线程对象t的ThreadLocalMap属性: t. threadLocals.

> 在`CsGameByThreadLocal`第1处，使用了`ThreadLocalRandom` 生成单独的`Random`实例;
该类在JDK7中引入,它使得每个线程都可以有自己的随机数生成器;
我们要避免`Random`实例被多线程使用,虽然共享该实例是线程安全的,但会因竞争同一`seed`而导致性能下降.

我们已经知道了`ThreadLocal`是每一个线程单独持有的;
因为每一个线程都有独立的变量副本,其他线程不能访问,所以不存在线程安全问题,也不会影响程序的执行性能.
`ThreadLocal`对象通常是由`private static`修饰的,因为都需要复制到本地线程,所以非`static`作用不大;
不过,`ThreadLocal`无法解决共享对象的更新问题,下面的实例将证明这点.
因为`CsGameByThreadLocal`中使用的是`Integer `不可变对象,所以可使用相同的编码方式来操作一下可变对象看看
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTAwZTRhNTYwMDAwZmRiZDMucG5n?x-oss-process=image/format,png)
输出的结果是乱序不可控的,所以使用某个引用来操作共享对象时,依然需要进行线程同步
![ThreadLocal和Thread的类图](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTE3MWU5NjMyMWNmZGI3ZjIucG5n?x-oss-process=image/format,png)

`ThreadLocal` 有个静态内部类`ThreadLocalMap`，它还有一个静态内部类`Entry`;
在Thread中的`ThreadLocalMap`属性的赋值是在`ThreadLocal`类中的`createMap`.

`ThreadLocal `与`ThreadLocalMap`有三组对应的方法: get()、set()和remove();
在`ThreadLocal`中对它们只做校验和判断，最终的实现会落在`ThreadLocalMap.`.
`Entry`继承自`WeakReference`,只有一个value成员变量,它的key是ThreadLocal对象

再从栈与堆的内存角度看看两者的关系
![ThreadLocal的弱引用路线图](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LThjN2M4ZjkwMjJkNTE1NWQucG5n?x-oss-process=image/format,png)
一个Thread有且仅有一个`ThreadLocalMap`对象
一个`Entry`对象的 key 弱引用指向一个`ThreadLocal`对象
一个`ThreadLocalMap `对象存储多个Entry 对象
一个`ThreadLocal` 对象可被多个线程共享
`ThreadLocal`对象不持有Value,Value 由线程的Entry 对象持有.

Entry 对象源码如下
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWU1OTljYmM3ZWVkNjQ4MTAucG5n?x-oss-process=image/format,png)

所有的`Entry`对象都被`ThreadLocalMap`类实例化对象`threadLocals`持有;
当线程执行完毕时,线程内的实例属性均会被垃圾回收,弱引用的`ThreadLocal`,即使线程正在执行,只要`ThreadLocal`对象引用被置成`null`,`Entry`的Key就会自动在下一次Y - GC时被垃圾回收;
而在`ThreadLocal`使用`set()/get()`时,又会自动将那些`key=null`的value 置为`null`,使value能够被GC,避免内存泄漏,现实很骨感, ThreadLocal如源码注释所述:
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTdkNTU3NGM5YjdiZTY1OTMucG5n?x-oss-process=image/format,png)
`ThreadLocal`对象通常作为私有静态变量使用,那么其生命周期至少不会随着线程结束而结束.

### 三个重要方法:
- set()
如果没有set操作的`ThreadLocal`, 很容易引起脏数据问题
- get()
始终没有get操作的`ThreadLocal`对象是没有意义的
- remove()
如果没有remove操作,则容易引起内存泄漏

如果`ThreadLocal`是非静态的,属于某个线程实例,那就失去了线程间共享的本质属性;
那么`ThreadLocal`到底有什么作用呢?
我们知道,局部变量在方法内各个代码块间进行传递,而类变量在类内方法间进行传递;
复杂的线程方法可能需要调用很多方法来实现某个功能,这时候用什么来传递线程内变量呢?
即`ThreadLocal`,它通常用于同一个线程内,跨类、跨方法传递数据;
如果没有ThreadLocal,那么相互之间的信息传递,势必要靠返回值和参数,这样无形之中,有些类甚至有些框架会互相耦合;
通过将Thread构造方法的最后一个参数设置为true,可以把当前线程的变量继续往下传递给它创建的子线程
```
public Thread (ThreadGroup group, Runnable target, String name,long stackSize, boolean inheritThreadLocals) [
   this (group, target, name,  stackSize, null, inheritThreadLocals) ;
}
```
parent为其父线程
```
if (inheritThreadLocals && parent. inheritableThreadLocals != null)
      this. inheritableThreadLocals = ThreadLocal. createInheritedMap (parent. inheritableThreadLocals) ;
```
`createlnheritedMap()`其实就是调用`ThreadLocalMap`的私有构造方法来产生一个实例对象,把父线程中不为`null`的线程变量都拷贝过来
```
private ThreadLocalMap (ThreadLocalMap parentMap) {
    // table就是存储
    Entry[] parentTable = parentMap. table;
    int len = parentTable. length;
    setThreshold(len) ;
    table = new Entry[len];

    for (Entry e : parentTable) {
      if (e != null) {
        ThreadLocal<object> key = (ThreadLocal<object>) e.get() ;
        if (key != null) {
          object value = key. childValue(e.value) ;
          Entry c = new Entry(key, value) ;
          int h = key. threadLocalHashCode & (len - 1) ;
          while (table[h] != null)
            h = nextIndex(h, len) ;
          table[h] = C;
          size++;
        }
    }
}
```
很多场景下可通过`ThreadLocal`来透传全局上下文的;
比如用`ThreadLocal`来存储监控系统的某个标记位,暂且命名为traceld.
某次请求下所有的traceld都是一致的,以获得可以统一解析的日志文件;
但在实际开发过程中,发现子线程里的traceld为null,跟主线程的traceld并不一致,所以这就需要刚才说到的`InheritableThreadLocal`来解决父子线程之间共享线程变量的问题,使整个连接过程中的traceld一致.
示例代码如下
```
import org.apache.commons.lang3.StringUtils;

/**
 * @author sss
 * @date 2019/1/17
 */
public class RequestProcessTrace {

    private static final InheritableThreadLocal<FullLinkContext> FULL_LINK_CONTEXT_INHERITABLE_THREAD_LOCAL
            = new InheritableThreadLocal<FullLinkContext>();

    public static FullLinkContext getContext() {
        FullLinkContext fullLinkContext = FULL_LINK_CONTEXT_INHERITABLE_THREAD_LOCAL.get();
        if (fullLinkContext == null) {
            FULL_LINK_CONTEXT_INHERITABLE_THREAD_LOCAL.set(new FullLinkContext());
            fullLinkContext = FULL_LINK_CONTEXT_INHERITABLE_THREAD_LOCAL.get();
        }
        return fullLinkContext;
    }

    private static class FullLinkContext {
        private String traceId;

        public String getTraceId() {
            if (StringUtils.isEmpty(traceId)) {
                FrameWork.startTrace(null, "JavaEdge");
                traceId = FrameWork.getTraceId();
            }
            return traceId;
        }

        public void setTraceId(String traceId) {
            this.traceId = traceId;
        }
    }

}
```
使用`ThreadLocal`和`InheritableThreadLocal`透传上下文时,需要注意线程间切换、异常传输时的处理,避免在传输过程中因处理不当而导致的上下文丢失.

最后,`SimpleDateFormat` 是非线程安全的类,定义为static,会有数据同步风险.
通过源码可以看出,`SimpleDateFormat` 内部有一个`Calendar`对象;
在日期转字符串或字符串转日期的过程中,多线程共享时很可能产生错误;
推荐使用` ThreadLocal`,让每个线程单独拥有这个对象.
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWVmMWM2OGY0ODUzYWYwNWQucG5n?x-oss-process=image/format,png)


# ThreadLocal的副作用
为了使线程安全地共享某个变量，JDK给出了`ThreadLocal`.
但`ThreadLocal`的主要问题是会产生脏数据和内存泄漏;
这两个问题通常是在线程池的线程中使用ThreadLocal引发的，因为线程池有线程复用和内存常驻两是在线程池的线程中使用ThreadLocal 引发的，因为线程池有线程复用和内存常驻两个特点

## 1 脏数据
线程复用会产生脏数据;
由于线程池会重用 `Thread` 对象,与 `Thread` 绑定的静态属性 `ThreadLoca` l变量也会被重用.
如果在实现的线程run()方法中不显式调用`remove()`清理与线程相关的`ThreadLocal`信息,那么若下一个线程不调用`set()`,就可能`get()` 到重用的线程信息;
包括`ThreadLocal`所关联的线程对象的**value**值.

脏读问题其实十分常见.
比如,用户A下单后没有看到订单记录,而用户B却看到了用户A的订单记录.
通过排查发现是由于 session 优化引发.
在原来的请求过程中,用户每次请求Server,都需要通过 sessionId 去缓存里查询用户的session信息,这样无疑增加了一次调用.
因此,工程师决定采用某框架来缓存每个用户对应的`SecurityContext`, 它封装了session 相关信息.
优化后虽然会为每个用户新建一个 session 相关的上下文,但由于`Threadlocal`没有在线程处理结束时及时`remove()`;
在高并发场景下,线程池中的线程可能会读取到上一个线程缓存的用户信息.
- 示例代码
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTNhN2IyNTg1ZGQ1NTljMjkucG5n?x-oss-process=image/format,png)
![输出结果](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTI5ZTI0NTA2ZmI3YmJjYWEucG5n?x-oss-process=image/format,png)
 ##  2 内存泄漏
在源码注释中提示使用static关键字来修饰`ThreadLocal`.
在此场景下,寄希望于`ThreadLocal`对象失去引用后,触发弱引用机制来回收`Entry`的`Value`就不现实了.
在上例中,如果不进行`remove()`,那么当该线程执行完成后,通过`ThreadLocal`对象持有的String对象是不会被释放的.

- **以上两个问题的解决办法很简单
每次用完ThreadLocal时,及时调用`remove()`清理**




# What is ThreadLocal
该类提供了线程局部 (thread-local) 变量;
这些变量不同于它们的普通对应物,因为访问某变量（通过其 get /set 方法）的每个线程都有自己的局部变量,它独立于变量的初始化副本.

`ThreadLocal` 实例通常是类中的 `private static `字段,希望将状态与某一个线程（e.g. 用户 ID 或事务 ID）相关联.

一个以`ThreadLocal`对象为键、任意对象为值的存储结构;
有点像`HashMap`,可以保存"key : value"键值对,但一个`ThreadLocal`只能保存一个键值对,各个线程的数据互不干扰.
该结构被附带在线程上,也就是说一个线程可以根据一个`ThreadLocal`对象查询到绑定在这个线程上的一个值.
```
ThreadLocal<String> localName = new ThreadLocal();
localName.set("JavaEdge");
String name = localName.get();
```
在线程A中初始化了一个ThreadLocal对象localName，并set了一个值JavaEdge;
同时在线程A中通过get可拿到之前设置的值;
但是如果在线程B中,拿到的将是一个null.

因为`ThreadLocal`保证了各个线程的数据互不干扰
看看set(T value)和get()方法的源码
![返回当前线程该线程局部变量副本中的值](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTBhMWVjNWY4NTJkZWM0OGEucG5n?x-oss-process=image/format,png)
![设置此线程局部变量的当前线程的副本到指定的值,大多数的子类都不需要重写此方法](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTQ5NTE5ZTU4OTUzMzM1NjQucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTc0N2NlYmE1MTdjY2NmMTEucG5n?x-oss-process=image/format,png)

![Thread#threadLocals](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWMyMjI5NzUzZWZkYzVhZDkucG5n?x-oss-process=image/format,png)

可见,每个线程中都有一个`ThreadLocalMap`
- 执行set时,其值是保存在当前线程的`threadLocals`变量
- 执行get时,从当前线程的`threadLocals`变量获取

所以在线程A中set的值,是线程B永远得不到的
即使在线程B中重新set,也不会影响A中的值;
保证了线程之间不会相互干扰.

# 追寻本质 - 结构
从名字上看猜它类似HashMap,但在`ThreadLocal`中,并无实现Map接口

- 在`ThreadLoalMap`中,也是初始化一个大小为16的Entry数组
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTBhY2Y2MDExZWU0NDk0MDMucG5n?x-oss-process=image/format,png)

- Entry节点对象用来保存每一个key-value键值对
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTliMjFiODc3YjYyODNlYzgucG5n?x-oss-process=image/format,png)
这里的**key 恒为 ThreadLocal**;
通过`ThreadLocal`的`set()`,把`ThreadLocal`对象自身当做key,放进`ThreadLoalMap`
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMjNlZWIwOGVhMDgyNmM4Mi5wbmc?x-oss-process=image/format,png)
`ThreadLoalMap`的`Entry`继承`WeakReference`
和HashMap很不同,`Entry`中没有`next`字段,所以不存在链表情形.

# hash冲突
无链表,那发生hash冲突时何解？

先看看`ThreadLoalMap`插入一个 key/value 的实现
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTNmNzQ1ZTNmMmQ1YzIyZDIucG5n?x-oss-process=image/format,png)

- 每个`ThreadLocal`对象都有一个hash值 - `threadLocalHashCode`
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTk3MzM5MWVlZmNkYWQwMzUucG5n?x-oss-process=image/format,png)
- 每初始化一个`ThreadLocal`对象,hash值就增加一个固定大小
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTUzZjMzZTU4MWMzZjc1MjAucG5n?x-oss-process=image/format,png)

在插入过程中,根据`ThreadLocal`对象的hash值,定位至table中的位置i.
过程如下
- 若当前位置为空,就初始化一个Entry对象置于i;
- 位置i已有对象
    - 若该`Entry`对象的key正是将设置的key,覆盖其value(和HashMap 处理相同);
    - 若和即将设置的key 无关,则寻找下一个空位

如此,在`get`时,也会根据`ThreadLocal`对象的hash值,定位到table中的位置.然后判断该位置Entry对象中的key是否和get的key一致,如果不一致,就判断下一个位置.

可见,set和get如果冲突严重的话,效率很低,因为`ThreadLoalMap`是Thread的一个属性，所以即使在自己的代码中控制了设置的元素个数，但还是不能控制其它代码的行为

# 内存泄露
ThreadLocal可能导致内存泄漏，为什么？
先看看Entry的实现： 
```
static class Entry extends WeakReference<ThreadLocal<?>> {
    /** The value associated with this ThreadLocal. */
    Object value;

    Entry(ThreadLocal<?> k, Object v) {
        super(k);
        value = v;
    }
}
```

通过之前的分析已经知道，当使用ThreadLocal保存一个value时，会在ThreadLocalMap中的数组插入一个Entry对象，按理说key-value都应该以强引用保存在Entry对象中，但在ThreadLocalMap的实现中，key被保存到了WeakReference对象中

这就导致了一个问题，ThreadLocal在没有外部强引用时，发生GC时会被回收，如果创建ThreadLocal的线程一直持续运行，那么这个Entry对象中的value就有可能一直得不到回收，发生内存泄露。

##  避免内存泄露
既然发现有内存泄露的隐患，自然有应对策略，在调用ThreadLocal的get()、set()可能会清除ThreadLocalMap中key为null的Entry对象，这样对应的value就没有GC Roots可达了，下次GC的时候就可以被回收，当然如果调用remove方法，肯定会删除对应的Entry对象。

如果使用ThreadLocal的set方法之后，没有显示的调用remove方法，就有可能发生内存泄露，所以养成良好的编程习惯十分重要，使用完ThreadLocal之后，记得调用remove方法。
```
    ThreadLocal<String> localName = new ThreadLocal();
    try {
        localName.set("JavaEdge");
        // 其它业务逻辑
    } finally {
        localName.remove();
    }
```

# 题外小话
首先，ThreadLocal 不是用来解决共享对象的多线程访问问题的.
一般情况下，通过set() 到线程中的对象是该线程自己使用的对象,其他线程是不需要访问的,也访问不到的;
各个线程中访问的是不同的对象.

**另外，说ThreadLocal使得各线程能够保持各自独立的一个对象;
并不是通过set()实现的,而是通过每个线程中的new 对象的操作来创建的对象,每个线程创建一个，不是什么对象的拷贝或副本。**
通过set()将这个新创建的对象的引用保存到各线程的自己的一个map中,每个线程都有这样一个map;
执行get()时,各线程从自己的map中取出放进去的对象,因此取出来的是各自线程中的对象.
ThreadLocal实例是作为map的key来使用的.

如果set()进去的东西本来就是多个线程共享的同一个对象;
那么多个线程的get()取得的还是这个共享对象本身，还是有并发访问问题。

# Hibernate中典型的 ThreadLocal 应用
```
private static final ThreadLocal threadSession = new ThreadLocal();  
  
public static Session getSession() throws InfrastructureException {  
    Session s = (Session) threadSession.get();  
    try {  
        if (s == null) {  
            s = getSessionFactory().openSession();  
            threadSession.set(s);  
        }  
    } catch (HibernateException ex) {  
        throw new InfrastructureException(ex);  
    }  
    return s;  
}  
```
首先判断当前线程中有没有放入 session,如果还没有,那么通过`sessionFactory().openSession()`来创建一个session;
再将session `set()`到线程中,实际是放到当前线程的`ThreadLocalMap`;
这时,对于该 session 的唯一引用就是当前线程中的那个ThreadLocalMap;
threadSession 作为这个值的key，要取得这个 session 可以通过threadSession.get();
里面执行的操作实际是先取得当前线程中的ThreadLocalMap;
然后将threadSession作为key将对应的值取出.
这个 session 相当于线程的私有变量,而不是public的.

显然，其他线程中是取不到这个session的，他们也只能取到自己的ThreadLocalMap中的东西。要是session是多个线程共享使用的，那还不乱套了.

## 如果不用ThreadLocal怎么实现呢？
可能就要在action中创建session，然后把session一个个传到service和dao中，这可够麻烦的;
或者可以自己定义一个静态的map，将当前thread作为key，创建的session作为值，put到map中，应该也行，这也是一般人的想法.
但事实上，ThreadLocal的实现刚好相反，它是在每个线程中有一个map，而将ThreadLocal实例作为key，这样每个map中的项数很少，而且当线程销毁时相应的东西也一起销毁了

总之，`ThreadLocal`不是用来解决对象共享访问问题的;
而主要是提供了保持对象的方法和避免参数传递的方便的对象访问方式

- 每个线程中都有一个自己的`ThreadLocalMap`类对象;
可以将线程自己的对象保持到其中,各管各的,线程可以正确的访问到自己的对象.
- 将一个共用的`ThreadLocal`静态实例作为key,将不同对象的引用保存到不同线程的ThreadLocalMap中,然后在线程执行的各处通过这个静态ThreadLocal实例的get()方法取得自己线程保存的那个对象,避免了将这个对象作为参数传递的麻烦.

当然如果要把本来线程共享的对象通过set()放到线程中也可以，可以实现避免参数传递的访问方式;
但是要注意get()到的是那同一个共享对象，并发访问问题要靠其他手段来解决;
但一般来说线程共享的对象通过设置为某类的静态变量就可以实现方便的访问了，似乎没必要放到线程中 

# **ThreadLocal的应用场合**
我觉得最适合的是按线程多实例（每个线程对应一个实例）的对象的访问，并且这个对象很多地方都要用到。

可以看到ThreadLocal类中的变量只有这3个int型：

```
private final int threadLocalHashCode = nextHashCode();  
private static AtomicInteger nextHashCode =
        new AtomicInteger();
private static final int HASH_INCREMENT = 0x61c88647; 
```
而作为ThreadLocal实例的变量只有 **threadLocalHashCode** 
**nextHashCode** 和**HASH_INCREMENT** 是ThreadLocal类的静态变量
实际上
- HASH_INCREMENT是一个常量，表示了连续分配的两个ThreadLocal实例的threadLocalHashCode值的增量
- nextHashCode 表示了即将分配的下一个ThreadLocal实例的threadLocalHashCode 的值

看一下创建一个ThreadLocal实例即new ThreadLocal()时做了哪些操作，构造方法`ThreadLocal()`里什么操作都没有，唯一的操作是这句
```
private final int threadLocalHashCode = nextHashCode();  
```
那么nextHashCode()做了什么呢
```
private static int nextHashCode() {
        return nextHashCode.getAndAdd(HASH_INCREMENT);
    }
```
就是将ThreadLocal类的下一个hashCode值即nextHashCode的值赋给实例的threadLocalHashCode，然后nextHashCode的值增加HASH_INCREMENT这个值。.

因此ThreadLocal实例的变量只有这个threadLocalHashCode，而且是final的，用来区分不同的ThreadLocal实例;
ThreadLocal类主要是作为工具类来使用，那么set()进去的对象是放在哪儿的呢？

看一下上面的set()方法，两句合并一下成为 
```
ThreadLocalMap map = Thread.currentThread().threadLocals;  
```
这个ThreadLocalMap 类是ThreadLocal中定义的内部类，但是它的实例却用在Thread类中： 

```
public class Thread implements Runnable {  
    ......  
  
    /* ThreadLocal values pertaining to this thread. This map is maintained 
     * by the ThreadLocal class. */  
    ThreadLocal.ThreadLocalMap threadLocals = null;    
    ......  
} 
```
再看这句：

```
if (map != null)  
    map.set(this, value);  
```
也就是将该ThreadLocal实例作为key，要保持的对象作为值，设置到当前线程的ThreadLocalMap 中，get()方法同样看了代码也就明白了.

# 参考
《码出高效：Java开发手册》
