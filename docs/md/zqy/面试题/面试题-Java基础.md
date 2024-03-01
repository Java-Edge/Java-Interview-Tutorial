---
typora-copy-images-to: imgs
---

# Java 基础面试题

项目推荐：京东的 asyncTool 并发框架，大量使用到了 `CompletableFuture`。



> 1. 如何设计一个能够根据优先级来执行的线程池？

首先对于阻塞队列，可以考虑使用 `PriorityBlockingQueue `作为任务队列。

`PriorityBlockingQueue` 是一个支持优先级的无解阻塞队列，要想对任务进行排序，需要让提交到线程池的任务实现 `Comparable` 接口，并重写 `compareTo` 方法来指定任务之间的优先级比较规则，还有一种方式就是创建 `PriorityBlockingQueue` 时传入一个 Comparator 对象来制定任务之间的排序规则（推荐第二种方式）。

但是还存在几个问题：

1. 在使用优先级任务队列时，当生产者速度快于消费者时，时间长之后会造成 OOM，因为该队列并不会阻塞生产者，只会阻塞消费者，当没有任务消费时，会阻塞消费者
2. 会导致饥饿问题，即优先级低的任务长时间不执行
3. 由于对队列中的元素进行排序以及保证线程安全（并发控制采用的可重入锁 ReentrantLock），因此会降低性能

对于 OOM 问题，可以继承 `PriorityBlockingQueue` 并且重写 `offer` 方法，即入队逻辑，当插入的元素数量超过指定值就返回 false

饥饿问题可以通过优化设计来解决，比如等待时间过长的任务会被移除，并重新添加到队列中，并且提升优先级





## ArrayList 和 LinkedList 区别

ArrayList 底层是基于 `数组` 实现的，而 LinkedList 底层是基于 `双向链表` 实现的 ，这里主要说一下数组和链表的一些区别即可，区别主要表现在访问、插入、删除这三个操作上：

- 对于插入元素和删除元素的性能来说
  - LinkedList 要好一些，如果在头尾插入元素时间复杂度为 O(1)，如果在指定位置插入元素，那么时间复杂度是 O(n)
  - 而向 ArrayList 中间插入元素时，需要将后边的元素都向后移动一位，时间复杂度为 O(n)
- 是否支持快速访问
  - ArrayList 可以根据下标快速访问元素，时间复杂度 O(1)
  - LinkedList 不可以快速访问元素，需要遍历链表，时间复杂度 O(n)

综上，可以发现 LinkedList 和 ArrayList 相比，没有太大优势，一般在项目中不会使用 LinkedList

**这里再说一下 ArrayList 的扩容机制：**

ArrayList 底层是基于数组实现的，是动态数组，那么它的大小也是动态变化的，这里我说一下扩容的流程：

当添加元素时，发现容量不足，则对数组进行扩容，大小扩容为原来的 1.5 倍，`int newCapacity = oldCapacity + (oldCapacity >> 1)`，通过位运算进行扩容后容量的计算（位运算比较快）



## 为什么 LinkedList 的插入会比 ArrayList 插入效率高

对于 LinkedList 来说，在头部和尾部插入的效率是比较高的，因为可以直接找到头尾节点

但是如果在中间插入的话，也是需要遍历链表找到中间位置的，因此插入的效率和 ArrayList 是差不多的，时间复杂度都是 O(n)





> 1. 线程池原理？线程池如何回收线程？（怎么知道任务处理完毕？）依据什么去设置核心线程数？(CPU密集型和IO密集型）









> 1. threadlocal 底层实现







> 1. 为什么threadlocal的key是弱引用





> 1. 怎么处理线程安全的问题？（我说了死锁和threadlocal)





> 1. thread内存泄漏





> 1. 怎么获取子线程的返回值？





> 1. 子线程抛异常，主线程try-catch 是否可以获取到异常 。













## 创建对象构造方法执行顺序

构造方法、构造代码块、静态代码块加载顺序，以及子类继承父类加载顺序

```java
public class A {
    public A() {
        System.out.println("A构造方法");
    }
    {
        System.out.println("A构造代码块");
    }
    static {
        System.out.println("A静态代码块");
    }
}

public class B extends A{
    public B() {
        System.out.println("B构造方法");
    }
    {
        System.out.println("B构造代码块");
    }
    static {
        System.out.println("B静态代码块");
    }
    public static void main(String[] args) {
        new B();
    }
    /**
     * A静态代码块
     * B静态代码块
     * A构造代码块
     * A构造方法
     * B构造代码块
     * B构造方法
     */
}
```





## 了解泛型吗？

参考文章：https://blog.csdn.net/qq_43546676/article/details/128790980

泛型就是在编译时检查类型安全，并且不需要强制进行类型转换

**泛型擦除了解吗？**

泛型擦除即在编译生成的字节码中，所有声明泛型的地方都会被擦除，擦除之后设置的类型会根据是否指定泛型上界而不同：

- 如果没有指定泛型上界，则所有的泛型类型在编译之后都替换为 Object 类型

  即在 `generic.set("张三")` 时，会将 String 类型的参数擦除为 Object 类型

  通过反编译指令 `javap -c` 得到字节码，发现在 11 行 set 值类型为 Object，在 15 行 get 值类型为 Object，在 18 行编译器会插入 `checkcast` 语句将 Object 类型转为 String 类型

  ```java
  public class GenericTest<T> {
      private T t;
      public T get(){
          return t;
      }
      public void set(T t) {
          this.t = t;
      }
      public static void main(String[] args) {
          GenericTest<String> generic = new GenericTest<>();
          generic.set("张三");
          generic.get();
      }
  }
  // 通过 javap -c 反编译得到字节码指令
    public static void main(java.lang.String[]);
      Code:
         0: new           #3                  // class com/example/nettystudy/AlgorithmTest/GenericTest
         3: dup
         4: invokespecial #4                  // Method "<init>":()V
         7: astore_1
         8: aload_1
         9: ldc           #5                  // String 张三
        11: invokevirtual #6                  // Method set:(Ljava/lang/Object;)V
        14: aload_1
        15: invokevirtual #7                  // Method get:()Ljava/lang/Object;
        18: checkcast     #8                  // class java/lang/String
        21: astore_2
        22: return

  ```

  

- 如果指定泛型上界，则所有的泛型类型在编译之后都替换为 String 类型（也就是上界的类型）

  可以发现在字节码第 11 行和第 15 行即 set 和 get 时，类型都为 String 类型，而不是 Object 类型

  ```java
  public class GenericTest<T extends String> {
      private T t;
      public T get(){
          return t;
      }
      public void set(T t) {
          this.t = t;
      }
      public static void main(String[] args) {
          GenericTest<String> generic = new GenericTest<>();
          generic.set("张三");
          String s = generic.get();
      }
  }
  // 通过 javap -c 反编译得到字节码
  public static void main(java.lang.String[]);
    Code:
       0: new           #3                  // class com/example/nettystudy/AlgorithmTest/GenericTest
       3: dup
       4: invokespecial #4                  // Method "<init>":()V
       7: astore_1
       8: aload_1
       9: ldc           #5                  // String 张三
      11: invokevirtual #6                  // Method set:(Ljava/lang/String;)V
      14: aload_1
      15: invokevirtual #7                  // Method get:()Ljava/lang/String;
      18: astore_2
      19: return
  ```

  

## JDK 动态代理和 CGLIB 动态代理对比

1. JDK 动态代理只能代理实现了接口的类，而 CGLIB 可以代理未实现任何接口的类。另外CGLIB 动态代理是通过生成一个被代理类的子类来拦截被代理类的方法调用，因此不能代理声明为final 类型的类和方法
2. 就二者的效率来说，大部分情况都是JDK 动态代理更优秀，随着 JDK 版本的升级，这个优势更加明显。
3. JDK 动态代理利用了拦截器、反射机制生成一个代理接口的匿名类，在调用具体方法前调用 InvokeHandler 来处理；CGLIB 动态代理利用了 ASM 框架，将代理对象类的 class 文件加载进来，通过修改其字节码生成子类来处理

**JDK动态代理底层原理：**

假如目前有一个接口 `HelloService（包含一个 say() 方法，需要被增强）`、实现类`HelloServiceImpl`、增强类`MyInvocationHandler`

在 JDK 动态代理中，生成的代理类 `$Proxy1` 是继承 Proxy 并且实现 `HelloService` 接口，当调用代理类的方法时，会进入到拦截器 `MyInvocationHandler` 的 invoke 方法中，下边为代理类生成代码：

```java
// 生成代理对象
HelloService helloService = (HelloService) Proxy.newProxyInstance(MyInvocationHandler.class.getClassLoader(), new Class[]{HelloService.class}, new MyInvocationHandler());
helloService.say();
```

通过上述代码拿到的 helloService 对象其实就是 JDK 动态代理对象，我们可以通过添加 VM options 来将动态代理对象保存下来，添加 VM options 如下：

`-Dsun.misc.ProxyGenerator.saveGeneratedFiles=true`

之后生成的动态代理对象如下（这里为了更直观的看代理类，因此只保留了最关键的代码），say() 其实就是定义在 HelloService 中需要被增强的方法，那么当调用 `helloService.say()` 时，其实就是调用 `$Proxy1.say()` 方法，在该方法中会调用 `h.invoke()` 方法，这里的 h 就是我们自己定义的 `MyInvocationHandler` 拦截器，之后就会进入到拦截器的 `invoke` 方法，

```java
import com.example.nettystudy.JdkProxyTest.HelloService;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.lang.reflect.UndeclaredThrowableException;

public final class $Proxy1 extends Proxy implements HelloService {
    private static Method m1;
    private static Method m2;
    private static Method m3;
    private static Method m0;

    ...
    
    public final void say() throws  {
        try {
            super.h.invoke(this, m3, (Object[])null);
        } catch (RuntimeException | Error var2) {
            throw var2;
        } catch (Throwable var3) {
            throw new UndeclaredThrowableException(var3);
        }
    }

    ...
}

```



下边来看一下拦截器的 invoke 方法，该方法有 3 个参数，第一个参数 proxy 也就是上边的代理类对象， method 就是接口中的 say 方法，那么在拦截器中就会执行我们自己添加的增强操作了

```java
public class MyInvocationHandler implements InvocationHandler {

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("方法执行前");
        // 这里 HelloServiceImpl 是被代理对象，被代理对象执行方法
        Object result = method.invoke(new HelloServiceImpl(), args);
        System.out.println("方法执行后");
        return result;
    }
}

```



**cglib动态代理底层原理**

cglib 采用底层的字节码技术，为一个类创建子类，并且在子类中使用方法去拦截所有的父类调用，并织入横切逻辑

cglib 使用如下：

```java
// Human.java
public class Human {
    public void info() {
        System.out.println("Human invoke info");
    }
    public void fly() {
        System.out.println("Human invoke fly");
    }
}

// CGLibProxy.java  拦截器
class CGLibProxy implements MethodInterceptor {
     
  
	 // CGLib需要代理的目标对象 
    private Object targetObject;
  
    public Object getProxyInstance(Object obj) { 
     
        this.targetObject = obj;  
        //1. 创建一个工具类
        Enhancer enhancer = new Enhancer();
        // 2.设置父类--可以是类或者接口
        enhancer.setSuperclass(obj.getClass());  
        //3. 设置回调函数
        enhancer.setCallback(this);  
        //4. 创建子类对象，即代理对象
        Object proxyObj = enhancer.create();  
        // 返回代理对象 
        return proxyObj;
    }  
  
    public Object intercept(Object proxy, Method method, Object[] args,
                            MethodProxy methodProxy) throws Throwable {
        System.out.println("方法执行前增强处理");
        // 执行目标目标对象方法
        Object obj = method.invoke(targetObject, args);
        System.out.println("方法执行后增强处理");
        return obj;
    }  
}

// TestCglibProxy.java 测试类
public class TestCglibProxy {
	public static void main(String[] args) {
		// 创建被代理对象
		Human man = new Human();
		// 添加如下代码，获取代理类源文件
		String path = CGLibProxy.class.getResource(".").getPath();
		System.out.println(path);
		System.setProperty(DebuggingClassWriter.DEBUG_LOCATION_PROPERTY, path);

		CGLibProxy cgLibProxy = new CGLibProxy();
		Object obj = cgLibProxy.getProxyInstance(man);
		System.out.println(obj.getClass());
		Human hu = (Human)obj;
		hu.info();
		hu.fly();
	}
}
```

上边程序输出为：

![1699772937119](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1699772937119.png)

可以根据红色输出的路径找到我们生成的代理类的 class 文件

在这个 Human 类，也就是需要被增强的类中，我们定义了两个方法 `info()、fly()`，那么 cglib 生成的子类会继承 Human 类，并且重写这两个方法，生成的代理类如下：

> 在代理类中，会先将拦截器赋值给 `var10000`，之后再调用 `var10000.intercept` 这个方法，也就是我们自己定义的拦截器的拦截方法`CGLibProxy#intercept()`

```java
public class Human$$EnhancerByCGLIB$$a1812f09 extends Human implements Factory {
	// ...    省略其余代码
    public final void info() {
        MethodInterceptor var10000 = this.CGLIB$CALLBACK_0;
        if (var10000 == null) {
            CGLIB$BIND_CALLBACKS(this);
            var10000 = this.CGLIB$CALLBACK_0;
        }

        if (var10000 != null) {
            var10000.intercept(this, CGLIB$info$0$Method, CGLIB$emptyArgs, CGLIB$info$0$Proxy);
        } else {
            super.info();
        }
    }
    // ...
}

```





## 了解 HashMap 源码吗？

参考文章：https://juejin.cn/post/6844903682664824845

https://blog.51cto.com/u_15344989/3655921

以下均为 jdk1.8 的 HashMap 讲解



**首先，HashMap 的底层结构了解吗？**

底层结构为：数组 + 链表 + 红黑树

**什么时候链表会转换为红黑树呢？**

当一个位置上哈希冲突过多时，会导致数组中该位置上的链表太长，链表的查询时间复杂度是`O(N)`，即查询代价随着链表长度线性增长，那么在 HashMap 中就通过 `TREEIFY_THRESHOLD=8` 来控制链表的长度，当`链表的长度大于 8 时并且数组长度大于 64 时`，就将链表转换为红黑树

这里在冲突插入链表时，使用的是尾插法，会顺着链表进行判断，当遍历到链表最后一个节点时，并判断链表长度是否需要转为红黑树，之后再通过`尾插法`，插入在最后一个节点的后边

> 扩展：jdk8 之前是头插法，但是 jdk8 改为了尾插法，这是为什么呢？为什么 jdk8 之前要采用头插法呢？
>
> jdk1.7 使用头插法的一种说法是，利用到了缓存的时间局部性，即最近访问过的数据，下次大概率还会进行访问，因此把刚刚访问的数据放在链表头，可以减少查询链表的次数
>
> jdk1.7 中的头插法是存在问题的，在并发的情况下，插入元素导致扩容，在扩容时，会改变链表中元素原本的顺序，因此会导致`链表成环`的问题
>
> 那么 jdk8 之后改为了尾插法，保留了元素的插入顺序，在并发情况下就不会导致链表成环了，但是 HashMap 本来就不是线程安全的，如果需要保证线程安全，使用 ConcurrentHashMap 就好了！

**如何计算插入节点在数组中需要存储的下标呢？**

计算下标是先计算出 key 的 hash 值，在将 hash 值对数组长度进行取模，拿到在数组中存放的位置

计算 hash 值代码如下：

`(h = key.hashCode()) ^ (h >>> 16)`

首先拿到 key 的 hashCode，将 hashCode 和 h >>> 16 进行异或运算，此时计算出来 key 的`哈希值 hash`，这里计算 `哈希值` 时，因为在计算数组中的下标时，会让 hash 值对数组长度取模，一般数组长度不会太大，导致 hash 值的高 16 位参与不到运算，因此让 hashCode 在与 `hashCode >>> 16` 进行异或操作，让 hashCode 的高 16 位也可以参与到下标的计算中去，这样计算出的下标更不容易冲突

这里面试官问了 hashCode 一定是 32 位吗？当时没反应过来，其实一定是 32 位的，因为 hashCode 是 int 类型，这里说的 32 位其实是二进制中是 32 位，int 类型是 4B = 32bit

那么在数组中的下标为：`hash & (n-1)` 也就是让 hash 值对数组长度进行取模，从而拿到在数组中的下标。（这里 `hash & (n-1)` == `hash % n`，hash 值和 `n-1` 进行与操作其实就是使用二进制运算进行取模）

> 这里举个取模运算的例子：
>
> 比如数组长度为 8，计算出来的 hash 值为 19，那么
>
> 19 & (8 - 1) = 10011 & 00111（二进制） = 00011（二进制） = 3
>
> 19 % 8 = 3

 

**HashMap 中如何进行扩容的呢？**

当 HashMap 中的元素个数超过`数组长度 * loadFactor`（负载因子）时，就会进行数组扩容，负载因子默认为 0.75，数组大小默认为 16，因此默认是 HashMap 中的元素个数超过 （16 * 0.75 = 12） 时，就会将数组的大小扩展为原来的一倍，即 32，之后再重新计算数组的下标，这异步操作是比较耗费性能的，所以如果可以预知 HashMap 中元素的个数，可以提前设置容量，避免频繁的扩容



在 HashMap 扩容时，即在 resize() 方法中，如果数组中某个位置上的链表有多个元素，那么我们如果`对整条链表上的元素都重新计算下标是非常耗时的操作`，因此在 HashMap 中进行了优化，HashMap 每次扩容都是原来容量的 2 倍，那么一条链表上的数据在扩容之后，这一条链表上的数据要么在`原来位置`上，要么在`原来位置+原来数组长度`上，这样就不需要再对这一条链表上的元素重新计算下标了，下边来解释一下为什么这一条链表扩容后的位置只可能是这两种情况：

因为每一次扩容都是容量翻倍，在下标计算中 `(n-1) & hash` 值，n 每次扩容都会增大一倍，那么 `(n-1)` 在高位就会多一个 1，比如（可能写的有些啰嗦，主要是这一段用文字不太好描述，耐心看一下就可以看懂）：

> 假如说我们插入一个 `key="zqy"` 时，从 16 扩容为 32 ，我们来看一下扩容前后的如何计算下标：
>
> - n 为 16 时，n-1 只有 4 个 1
> - n 为 32 时，n-1 有 5 个 1，在高位多出来了一个 1
>
> ![1699607812930](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1699607812930.png)
>
> 下标的计算公式为 `(n-1)&hash`，n 每次都是扩容1倍，也就是 n-1 的二进制中会在高位多一个 1，那么如果 `hash 值`在多出来的 1 这一位上为 1，那么下标计算之后就比原下标多了一个 oldCap，如果 `hash 值`在多出来的 1 这一位上为 0，那么就不会对下标计算有影响，新下标还是等于原下标
>
> 那么怎么判断在多出来的这一个 1 的位置上，hash 值是否为 1 呢？只需要让 `hash & oldCap` 即可，对上图来说，在扩容之后，当 n 为 32 时， n-1 中会多出来标位`红色的1`，那么需要判断的就是"zqy"的 hash 值中`绿色的位置`那一位是否为1（通过 `hash&oldCap` 来判断），如果为1，新下标=原下标+oldCap；如果为 0，新下标=原下标

上边说的源码位置如下图，下边为 `resize()` 方法中的部分代码，优化位置在 `738` 和 `742` 行，在 `715` 行开始的 else 语句中，针对的就是原数组的位置上的链表有多个元素，在 `721` 行判断，如果 `hash & oldCap` 是 0 的话，表示该链表上的元素的新下标为原下标；如果是 1，表示新下标=原下标+原数组长度

![1699609319680](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1699609319680.png)



**HashMap 在链表长度达到 8 之后一定会转为红黑树吗？如何转为红黑树呢？**

HashMap 会在数组长度大于 64 并且链表长度大于 8 才会将链表转为红黑树

在下边这个转成红黑树的方法中，757 行就判断了 tab.length 也就是数组的长度，如果小于 64，就进行扩容，不会将链表转成红黑树

如果需要转换成红黑树，就进入到 759 行的 if 判断，先将链表的第一个节点赋值为 `e`，之后将 e 转为 `TreeNode`，并且将转换后的树节点给串成一个新的链表，hd 为链表头，tl 为链表尾，当将链表所有节点转为 `TreeNode` 之后，在 771 行使用转换后的双向链表替代原来位置上的单链表，之后再 772 行调用 `treeify()` ，该方法就是将链表中的元素一个一个插入到树中

![1699629989303](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1699629989303.png)



**HashMap不是线程安全的，那么举一个不安全的例子吧？**

我们可以来分析一下，在多线程情况下，那么一般是多个线程修改同一个 HashMap 所导致的线程不安全，那么也就是 `put()` 操作中，会造成线程不安全了，那么我们看下边 putVal() 方法，来分析一下在哪里会造成线程不安全：

假如初始时，HashMap 为空，此时线程 A 进到 630 行的 if 判断，为 true，当线程 A 准备执行 631 行时，此时线程 B 进入在 630 行 if 判断发现也为 true，于是也进来了，在 631 行插入了节点，此时线程 B 执行完毕，线程 A 继续执行 631 行，就会出现`线程 A 插入节点将线程 B 插入的节点覆盖的情况`

![1699802174777](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1699802174777.png)



那么**简单说一下**就是，HashMap 插入元素时，如果计算出来在数组中的下标，在该位置上没有发生哈希冲突，如果两个线程同时进来了，那么后边的线程就会把前边线程插入的元素给覆盖掉：

![1706151095970](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706151095970.png)



**为什么 HashMap 中使用红黑树而不使用 B+ 树呢？**

首先说一下红黑树和 B+ 树有什么区别：

- **红黑树：** 是自平衡的二叉搜索树，可以保证树的平衡，确保在最坏情况下将查找、插入、删除的操作控制在 O(logN) 的时间复杂度
- **B+ 树：** 是多路平衡查找树，多用于数据库系统，B+ 树的特点就是非叶子节点不存储数据，只存储子节点的指针，这样可以减少每个节点的大小，在读取一个磁盘页时可以拿到更多的节点，减少磁盘 IO 次数

那么 HashMap 是在内存中存放数据的，不存在说磁盘 IO 次数影响性能的问题，所以说直接使用红黑树就可以保证性能了，并且实现起来也相对比较简单



## 说说头插法和尾插法

头插法和尾插法指的是，在元素插入 HashMap 时，计算出来在数组中的下标，发现在这个下标的位置上已经有元素了，发生了哈希冲突，那么就会在冲突的元素给转成链表存储起来，用来解决哈希冲突

那么向链表中插入元素时，可以使用头插法和尾插法，JDK1.8 之前就是头插法，JDK1.8 的时候改为了尾插法

**为什么 JDK1.8 之前要采用头插法呢？**

JDK1.7 使用头插法的一种说法是，利用到了缓存的时间局部性，即最近访问过的数据，下次大概率还会进行访问，因此把刚刚访问的数据放在链表头，可以减少查询链表的次数

JDK1.7 中的头插法是存在问题的，在并发的情况下，插入元素导致扩容，在扩容时，会改变链表中元素原本的顺序，因此会导致`链表成环`的问题

那么 JDK1.8 之后改为了尾插法，保留了元素的插入顺序，在并发情况下就不会导致链表成环了，但是 HashMap 本来就不是线程安全的，如果需要保证线程安全，使用 ConcurrentHashMap 就好了！





## ConcurrentHashMap 如何保证线程安全的呢？

答：

虽然 Java 提供了线程安全的 `HashTable` 和由同步器包装的 `Collections.synchronizedMap` 可以代替 HashMap，但是他两个是通过使用全局的锁来同步线程的访问，因此导致性能不好。



**这里最重要的就是，了解 ConcurrentHashMap 在插入元素的时候，在哪里通过 CAS 和 synchronized 进行加锁了，是对什么进行加锁**

**对于 ConcurrentHashMap 来说：**

- 在 JDK1.7 中，通过 `分段锁` 来实现线程安全，将整个数组分成了多段（多个 Segment），在插入元素时，根据 hash 定位元素属于哪个段，对该段上锁即可
- 在 JDK1.8 中，通过 `CAS + synchronized` 来实现线程安全，相比于分段锁，锁的粒度进一步降低，提高了并发度



**这里说一下在 `插入元素` 的时候，如何做了线程安全的处理（JDK1.8）：**

在将节点往数组中存放的时候（没有哈希冲突），通过 `CAS` 操作进行存放

如果节点在数组中存放的位置有元素了，发生哈希冲突，则通过 `synchronized` 锁住这个位置上的第一个元素

那么面试官可能会问 ConcurrentHashMap 向数组中存放元素的流程，这里我给写一下（主要看一下插入元素时，在什么时候加锁了）：

1. 根据 key 计算出在数组中存放的索引

2. 判断数组是否初始化过了

3. 如果没有初始化，先对数组进行初始化操作，通过 CAS 操作设置数组的长度，如果设置成功，说明当前线程抢到了锁，当前线程对数组进行初始化

4. 如果已经初始化过了，判断当前 key 在数组中的位置上是否已经存在元素了（是否哈希冲突）

5. 如果当前位置上没有元素，则通过 CAS 将要插入的节点放到当前位置上

6. 如果当前位置上有元素，则对已经存在的这个元素通过 synchronized 加锁，再去遍历链表，通过将元素插到链表尾

   6.1 如果该位置是链表，则遍历该位置上的链表，比较要插入节点和链表上节点的 hash 值和 key 值是否相等，如果相等，说明 key 相同，直接更新该节点值；如果遍历完链表，发现链表没有相同的节点，则将新插入的节点插入到链表尾即可

   6.2 如果该位置是红黑树，则按照红黑树的方式写入数据

7. 判断链表的大小和数组的长度是否大于预设的阈值，如果大于则转为红黑树

   当链表长度大于 8 并且数组长达大于 64 时，才会将链表转为红黑树






初始化是懒加载的

在向数组中赋值时，使用 CAS



CAS 和 synchronized 区别

cas ：乐观锁，不需要线程上下文切换

synchronized：悲观锁，需要线程上下文切换









> 1. hashcode 和 equals 区别？只重写 equals 行不行？
> 2. Collection 和 List 详细讲一下？arraylist和linkedkist ？ArrayList扩容？
> 3. hash map 和 hash table 的区别？hashmap 操作的时间复杂度？HashMap底层数据结构，扩容（可以从哈希函数说起，扩容不要忘记考虑负载因子）？HashMap为什么总是保证数组个数为2的幂次方（我觉得有两个角度：取余用&代替，扩容方便）









> 1. 序列化，String 和枚举类有什么区别，如果序列值一样会有什么问题？





> 1. 排序的稳定性，解释一下？ 



> 1. 为什么 ConcurrentHashMap 的 key 和 value 不支持 Null 值?

key 和 value 不能为 null 主要是为了避免二义性。null 是一个特殊的值，表示没有对象或没有引用。如果你用null作为键，那么你就无法区分这个键是否存在于ConcurrentHashMap中，还是根本没有这个键。同样，如果你用null作为值，那么你就无法区分这个值是否是真正存储在ConcurrentHashMap中的，还是因为找不到对应的键而返回的。



多线程环境下，存在一个线程操作该ConcurrentHashMap时，其他的线程将该 ConcurrentHashMap 修改的情况，所以无法通过 containsKey(key) 来判断否存在这个键值对，也就没办法解决二义性问题了。



于此相比，HashMap 可以存储 null 的 key 和 value，但是 null 作为键只有一个，作为值可以有多个。如果传入null作为参数，就会返回hash值为0的位置的值。单线程环境下，不存在一个线程操作该HashMap时，其他的线程将该HashMap修改的情况，所以可以通过contains(key)来做判断是否存在这个键值对，从而做相应的处理，也就不存在二义性问题。



**那么为什么 ConcurrentHashMap 源码不设计成可以判断是否存在 null 值的 key？**

如果 key 为 null，那么就会带来很多不必要的麻烦和开销。比如，你需要用额外的数据结构或者标志位来记录哪些key是null的，而且在多线程环境下，还要保证对这些额外的数据结构或者标志位的操作也是线程安全的。而且，key为null的意义也不大，因为它并不能表示任何有用的信息。





**执行containsKey()后，在调用get()方法之前可能会被其他线程修改或者删除，这算是不可重复读，那这算是线程不安全吗？**

ConcurrentHashMap 是线程安全的，但它不能保证所有的复合操作都是原子性的。如果需要保证复合操作的原子性，就要使用额外的同步或协调机制。这并不违反线程安全的定义，而是属于不同层次的一致性要求。

containsKey() 和 get() 方法都是单独的操作，它们之间没有同步保证。因此，如果在调用 containsKey() 后，另一个线程修改或删除了相应的键值对，那么 get() 方法可能会返回 null 或者过期的值。这确实是不可重复读的情况，但这并不违反线程安全的定义。







## 线程的状态以及线程状态的转换

线程的状态有 6 种：新建 New、就绪 Ready、运行中 Running、阻塞 Blocker、超时等待 Timed Waiting、退出 Terminated

接下来说一下各个状态之间如何转变：

![1706588358946](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706588358946.png)



接下来说一下上边出现的几个方法的含义：

- **wait() 和 sleep()：**

wait() 来自 Object 类，会释放锁

sleep() 来自 Thread 类，不会释放锁

- **interrupt()**

用于停止线程，给线程发出一个中断信号，但是并不会立即中断，会设置线程的中断标志位为 true

一般停止线程都会使用 interrupt() 方法，但是这个方法并不会立即中断正在运行的线程，想要立即停止线程，可以使用 sleep() 和 interrupt() 搭配使用：

从下边输出可以看到，当子线程 sleep() 时，我们在 main 线程中调用了子线程的 interrupt()，那么子线程就会抛出 InterruptedException（只要 sleep() 和 interrupt() 方法碰到一起，就一定会抛出异常，我们可以使用抛出异常的方法，来优雅的停止线程的执行）

```java
public static void main(String[] args) {
    try {
        Thread thread = new Thread(()->{
            try {
                // 让子线程先 sleep
                System.out.println("run begin");
                Thread.sleep(2000);
                System.out.println("run end");
            } catch (InterruptedException e) {
                System.out.println("子线程 sleep 过程中被 interrupt，导致抛出 InterruptedException");
                e.printStackTrace();
            }
        });
        thread.start();
        // 让主线程等子线程启动起来
        Thread.sleep(200);
        // 调用子线程的 interrupt()
        thread.interrupt();
    } catch (InterruptedException e) {
        System.out.println("主线程捕获中断异常");
    }
    System.out.println("end");
}

// 程序输出
run begin
end
子线程 sleep 过程中被 interrupt，导致抛出 InterruptedException
java.lang.InterruptedException: sleep interrupted
	at java.lang.Thread.sleep(Native Method)
	at com.alibaba.craftsman.command.PaperMetricAddCmdExe.lambda$main$0(PaperMetricAddCmdExe.java:42)
	at java.lang.Thread.run(Thread.java:748)

```

- **yield()**

让当前线程放弃对 cpu 的占用，放弃的时间不确定，有可能刚刚放弃，马上又获得了 cpu 的时间片

- **join()**

用于阻塞等待另一个线程执行完毕

```java
public static void main(String[] args) {
    try {
        MyThread thread = new MyThread();
        thread.start();
        // 主线程等待子线程运行完毕
        thread.join();
        System.out.println("主线程等待子线程运行完毕，再执行后来的操作");
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}
```

- **LockSupport.park()/unpark()**

用于阻塞当前线程，可以通过另一个线程调用 `LockSupport.unpark()` 方法来唤醒它





## Future 获得结果怎么处理

Future 可以用于获取异步计算的结果，Future 的使用比较简单，主要有以下四个方法：

```java
// 检查任务是否完成
boolean isTaskDone = future.isDone();
// 等待任务完成
Object result = future.get();
// 带超时的等待
Object result = future.get(1, TimeUnit.SECONDS);
// 取消任务
boolean isCancelled = future.cancel(true);
```

使用 Future 时，需要正确处理抛出的异常：

- `InterruptedException` 表示在等待过程中线程被中断
- `ExecutionException` 表示任务执行过程中抛出了异常

```java
try {
    Object result = future.get();
} catch (InterruptedException e) {
    // 处理中断异常
    Thread.currentThread().interrupt(); // 重新设置中断状态
} catch (ExecutionException e) {
    // 处理执行异常，这通常意味着任务抛出了异常
} catch (TimeoutException e) {
    // 如果设置了超时时间，但没有在规定时间内完成任务
}
```



## JUC 工具类用过哪些？

上边既然说到了 Future，接下来可以说一下 CompletableFuture，因为 CompletableFuture 使用的还是比较多的，通过 CompletableFuture 大大加快任务的计算速度

其实 CompletableFuture 用起来也比较简单，将一些比较耗时的操作，比如 IO 操作等结果放到 CompletableFuture 中去，当需要用的时候，再从 CompletableFuture 中取出来即可



当然在实际使用中还有一些问题需要注意：

**第一点：使用自定义的线程池，避免核心业务和非核心业务竞争同一个池中的线程**

如果在使用中，没有传入自定义线程池，将使用默认线程池 ForkJoinPool 中的共用线程池 CommonPool（CommonPool的大小是CPU核数-1，如果是IO密集的应用，线程数可能成为瓶颈）

如果执行两个任务时，传入了自定义的线程池，使用 thenRun 和 thenRunAsync 还有一点小区别;

- 当使用 `thenRun` 执行第二个任务时，将会使用和第一个任务相同的线程池
- 当使用 `thenRunAsync` 执行第二个任务时，那么第一个任务会使用自己传入的线程池，而第二个任务则会使用 `ForkJoin` 线程池。（`thenAccept、thenApply`同理）

在实际使用时，建议使用自定义的线程池，并且根据实际情况进行线程池隔离。避免核心业务与非核心业务竞争同一个池中的线程，减少不同业务之间相互干扰



**第二点：线程池循环引用导致死锁**

```java
public Object doGet() {
  // 创建一个有 10 个核心线程的线程池
  ExecutorService threadPool1 = new ThreadPoolExecutor(10, 10, 0L, TimeUnit.MILLISECONDS, new ArrayBlockingQueue<>(100));
  CompletableFuture cf1 = CompletableFuture.supplyAsync(() -> {
  //do sth
    return CompletableFuture.supplyAsync(() -> {
        System.out.println("child");
        return "child";
      }, threadPool1).join();//子任务
    }, threadPool1);
  return cf1.join();
}
```

对于上边代码，如果同一时刻有 10 个请求到达，`threadPool1` 被打满，而 `cf1` 的 子任务也需要使用到 `threadPool1` 的线程，从而导致子任务无法执行，而且父任务依赖于子任务，也无法结束，导致死锁



而像其他一些 JUC 的工具类也要了解：

- Semaphore：信号量，用于控制访问特定资源的线程数量
- CountDownLatch：可以阻塞线程，等待指定数量的线程执行完毕之后再放行，直到所有的线程都执行完毕之后，才可以将所有线程放行。比如需要读取 6 个文件的数据，最后合并 6 个文件的数据，那么就可以创建 6 个线程读取，并且使用 CountDownLatch 让主线程阻塞等待子线程读取完毕塞，当所有子线程都读取完毕之后，再放行






## 这次彻底说明白 ThreadLocal 内存泄漏问题

ThreadLocal 用于存储线程本地的变量，如果创建了一个 ThreadLocal 变量，在多线程访问这个变量的时候，每个线程都会在自己线程的本地内存中创建一份变量的副本，从而起到线程隔离的作用



**Thread、ThreadLocal、ThreadLocalMap 之间的关系：**

![1706850199755](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706850199755.png)

每一个`Thread`对象均含有一个`ThreadLocalMap`类型的成员变量`threadLocals`，它存储本线程所有的ThreadLocal对象及其对应的值

`ThreadLocalMap`由一个个的`Entry<key,value>`对象构成，Entry继承自`weakReference<ThreadLocal<?>>`，一个`Entry`由`ThreadLocal`对象和`Object`构成

- Entry 的 key 是ThreadLocal对象，并且是一个弱引用。当指向key的强引用消失后，该key就会被垃圾收集器回收
- Entry 的 value 是对应的变量值，Object 对象

当执行set方法时，ThreadLocal首先会获取当前线程 Thread 对象，然后获取当前线程的ThreadLocalMap对象，再以当前ThreadLocal对象为key，获取对应的 value。

由于每一条线程均含有各自私有的 ThreadLocalMap 对象，这些容器相互独立互不影响，因此不会存在线程安全性问题，从而也就无需使用同步机制来保证多条线程访问容器的互斥性



**ThreadLocal 使用场景：**

1、在进行对象跨层传递的时候，使用ThreadLocal可以避免多次传送，打破层次间的约束。

> 即如果一个User对象需要从Controller层传到Service层再传到Dao层，那么把User放在ThreadLocal中，每次使用ThreadLocal来进行获取即可

2、线程间数据隔离

3、进行事务操作，用于存储线程事务信息

4、数据库连接，Session会话管理



**ThreadLocal 的内存泄漏问题：**

![1706851147001](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706851147001.png)

这里假设将 ThreadLocal 定义为方法中的局部变量，那么当线程进入该方法的时候，就会将 ThreadLocal 的引用给加载到线程的栈 Stack 中

如上图所示，在线程栈 Stack 中，有两个变量，ThreadLocalRef 和 CurrentThreadRef，分别指向了声明的局部变量 ThreadLocal ，以及当前执行的线程

而 ThreadLocalMap 中的 key 是弱引用，当线程执行完该方法之后，Stack 线程栈中的 ThreadLocalRef 变量就会被弹出栈，因此 ThreadLocal 变量的强引用消失了，那么 ThreadLocal 变量只有 Entry 中的 key 对他引用，并且还是弱引用，因此这个 ThreadLocal 变量会被回收掉，导致 Entry 中的 key 为 null，而 value 还指向了对 Object 的强引用，因此 value 还一直存在 ThreadLocalMap 变量中，由于 ThreadLocal 被回收了，无法通过 key 去访问到这个 value，导致这个 value 一直无法被回收，ThreadLocalMap 变量的生命周期是和当前线程的生命周期一样长的，只有在当前线程运行结束之后才会清除掉 value，因此会导致这个 value 一直停留在内存中，导致内存泄漏

当然 JDK 的开发者想到了这个问题，在使用 set get remove 的时候，会对 key 为 null 的 value 进行清理，使得程序的稳定性提升。

当然，我们要保持良好的编程习惯，在线程对于 ThreadLocal 变量使用的代码块中，在代码块的末尾调用 remove 将 value 的空间释放，防止内存泄露。

**ThearLocal 内存泄漏的根源是：**

由于 ThreadLocalMap 的生命周期跟 Thread 一样长，如果没有手动删除对应 key 就会导致内存泄漏

**ThreadLocal 正确的使用方法：**

- 每次使用完 ThreadLocal 都调用它的 remove() 方法清除数据
- 将 ThreadLocal 变量定义成 private static final，这样就一直存在 ThreadLocal 的强引用，也能保证任何时候都能通过 ThreadLocal 的弱引用访问到 Entry 的 value 值，进而清除掉

下面给出 ThreadLocal 的用法：

```java
public class ThreadLocalExample {
    private static final ThreadLocal<Integer> counter = new ThreadLocal<Integer>() {
        @Override
        protected Integer initialValue() {
            return 0;
        }
    };

    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            try {
                int value = counter.get(); // 获取当前线程的副本值
                counter.set(value + 1); // 修改副本值
                System.out.println("Thread " + Thread.currentThread().getName() + " value: " + counter.get());
            } finally {
                // 手动移除
                counter.remove(); // 在线程结束时移除变量
            }
        });

        Thread t2 = new Thread(() -> {
            try {
                int value = counter.get();
                counter.set(value + 1);
                System.out.println("Thread " + Thread.currentThread().getName() + " value: " + counter.get());
            } finally {
                // 手动移除
                counter.remove();
            }
        });

        t1.start();
        t2.start();
    }
}
```



**那么 ThreadLocal 为什么要将 key 设计为弱引用呢？**

这里还要看一下具体是如何使用 ThreadLocal 了

- 如果定义 ThreadLocal 为局部变量，那么这个 ThreadLocal 对象就会放在堆中，如果不手动 remove() 的话，当线程执行完当前方法退出时，这个局部变量对 ThreadLocal 的强引用就消失了，只剩下 Thread.ThreadLocalMap 中的 key 对 ThreadLocal 的弱引用，因此会将 ThreadLocal 给回收掉，而 value 还存在强引用，而我们没有了 TheadLocal 的引用导致访问不到 value，导致 value 无法回收，因此 JDK 设计者在 ThreadLocal 还添加了清除 ThreadLocalMap 中 key 为 null 的 value，避免内存泄漏，这是在设计时为了避免内存泄漏而采取的措施，而我们使用的时候要保持良好的编程规范，也要手动去 remove，避免内存泄露的发生
- 如果定义 ThreadLocal 为 private static final，那么这个 ThreadLocal 就会在常量池中存储，而不是存储在堆中，这时候要考虑的问题是当前线程在使用完 ThreadLocal 之后要主动 remove 避免出现脏数据（而不是内存泄漏问题，因为我们可以随时通过该 ThreadLocal 去访问到 ThreadLocalMap 中的 value 值，并随时进行回收，因此不会存在内存泄漏），因为在多线程的环境中，如果上一个线程使用完 ThreadLocal 之后并没有 remove，下一个线程来使用时可能会拿到上个线程的数据，产生了脏数据



**总结一下：**

那么这里总结一下，将 ThreadLocal 定义为局部变量，会导致方法执行完之后 ThreadLocal 被回收，而 value 没有被回收，导致无法通过 key 访问到这个 value，导致内存泄漏

如果规范使用，将 ThreadLocal 定义为 private static final，那么这个 ThreadLocal 不会被回收，可以随时通过这个 ThreadLocal 去访问到 value，随时可以手动回收，因此不会内存泄漏，但是会导致脏数据

所以在 ThreadLocal 的内存泄漏问题主要是针对将 ThreadLocal 定义为局部变量的时候，如果不手动 remove 可能会导致 ThreadLocalMap 中的 Entry 对象无法回收，一直占用内存导致内存泄漏，直到当前 Thread 结束之后才会被回收

**这里再说一下 ThreadLocal 的使用规范就是：将 ThreadLocal 变量定义为 private static final，并且在使用完，记得通过 try finally 来 remove 掉，避免出现脏数据**

（以上均为个人见解，如有不足，欢迎指正）







## 乐观锁如何实现，有哪些缺点？

常见的乐观锁的实现有两种方式：数据库和 CAS

- **通过数据库实现乐观锁：**

通过版本号实现乐观锁，如下面 SQL

```sql
UPDATE table_name SET column1 = new_value, version = version + 1 WHERE id = some_id AND version = old_version;
```

如果 version 未被修改，则允许更新；如果 version 已被修改，则拒绝更新操作



- **通过 CAS 实现乐观锁：**

CAS 的原理就是，去要写入的内存地址判断，如果这个值等于预期值，那么就在这个位置上写上要写入的值



**乐观锁的缺点：**

乐观锁适用于并发冲突较少的场景，因为它避免了在读取数据时加锁，从而减少了锁的开销

但是在高并发环境中，如果冲突频繁，乐观锁可能导致大量的重试操作，从而影响性能。在这种情况下，可能需要考虑使用悲观锁或其他并发控制策略





## 对称加密和非对称加密的区别？HTTPS 使用的哪个？

HTTPS 使用的 **对称加密 + 非对称加密** 两者结合的算法

HTTPS 在 HTTPS 握手的时候，使用的是非对称加密，服务器会发送给浏览器数字证书，包含了公钥，浏览器使用公钥加密一个随机生成的 `对称密钥` ，发送给服务器

当浏览器和服务器建立通信之后，使用对称密钥来进行数据的加密解密，这个过程使用的对称加密



**为什么要使用两种加密算法的结合呢？**

- 对称加密：加密解密过程中使用相同的密钥，速度很快，但是如何让双方都安全的拿到这个密钥比较困难（因此和非对称加密结合，来安全的传输这个对称密钥）
- 非对称加密：加密解密过程中使用一对密钥，即公钥和私钥。公钥是公开的，用于加密；私钥只能自己拿到，用于解密，整个过程相对复杂，比较耗时，一般用于密钥的交换

通过了解这两种算法的区别，也就知道了为什么要使用这两种算法的结合了，**HTTPS 既想要对称加密的性能，又想要非对称加密的安全性！**



整个 HTTPS 使用非对称加密以及对称加密的流程如下：

![1707122304326](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1707122304326.png)



## 怎么防止下载的文件被劫持和篡改？

这里说一下我自己的思路，其实跟上边的 HTTPS 中校验证书的流程是差不多的

服务器提供文件下载的功能，在服务器端，先对文件数据进行一个加密，生成一个加密后的值称为指纹，这里设为 S，服务器会将指纹 S 公布出来

当用户下载了文件之后，也对文件中的数据以相同方式进行加密，生成一个加密后的值，这里设为 T，如果 T 和 S 相同，那就证明下载的文件没有被劫持和篡改



加密的时候通过散列函数进行加密，通过散列函数加密的结果是不可逆的，所以说每个文件所生成的指纹都是唯一的，如果文件被篡改的话，加密后的值一定和原文件的指纹不同





## volatile 和 synchronized 的区别？

volatile 是用于保证变量的可见性并且禁止指令重排，保证了变量的有序性和可见性

synchronized 可以保证方法的同步，通过 synchronized 可以保证有序性、可见性和原子性

如果仅仅需要保证变量的可见性，可以使用 volatile

如果需要控制代码块的同步，可以使用 synchronized





## 线程池了解过吗？

### 简单介绍一下线程池

首先，线程池是将多个线程进行池化操作，统一进行管理，这样做有什么好处呢？

- `降低创建、销毁线程的开销` ：线程池中维护固定数量的线程，不需要临时进行线程的创建和销毁
- `提高响应速度` ：对于新提交到线程池中的任务，直接使用线程池中的空闲线程可以直接进行处理，不需要等待创建线程
- `节省资源`：可以重复利用线程

### 线程池中重要的参数

线程池中重要的参数如下：

- `corePoolSize` ：核心线程数量
- `maximumPoolSize` ：线程池最大线程数量 = 非核心线程数+核心线程数
- `keepAliveTime` ：非核心线程存活时间
- `unit`：空闲线程存活时间单位（keepAliveTime单位）
- `workQueue` ：工作队列（任务队列），存放等待执行的任务
  - LinkedBlockingQueue：无界的阻塞队列，最大长度为 Integer.MAX_VALUE
  - ArrayBlockingQueue：基于数组的有界阻塞队列，按FIFO排序
  - SynchronousQueue：同步队列，不存储元素，对于提交的任务，如果有空闲线程，则使用空闲线程来处理；否则新建一个线程来处理任务
  - PriorityBlockingQueue：具有优先级的无界阻塞队列，优先级通过参数Comparator实现。
- `threadFactory` ：线程工厂，创建一个新线程时使用的工厂，可以用来设定线程名、是否为daemon线程等等。
- `handler`： 拒绝策略 ，有4种
  - AbortPolicy ：直接抛出异常，默认策略
  - CallerRunsPolicy：用调用者所在的线程来执行任务
  - DiscardOldestPolicy：丢弃阻塞队列里最老的任务，也就是队列里靠前的任务
  - DiscardPolicy ：当前任务直接丢弃

### 新加入一个任务，线程池如何进行处理呢？

新加入一个任务，线程池处理流程如下：

1. 如果核心线程数量未达到，创建核心线程执行
2. 如果当前运行线程数量已经达到核心线程数量，查看任务队列是否已满
3. 如果任务队列未满，将任务放到任务队列
4. 如果任务队列已满，看最大线程数是否达到，如果未达到，就新建非核心线程处理
5. 如果当前运行线程数量未达到最大线程数，则创建非核心线程执行
6. 如果当前运行线程数量达到最大线程数，根据拒绝策略处理

![1707126890615](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1707126890615.png)

### 如何将任务提交到线程池中呢？

有两种方式：`execute` 和 `submit`

这两种方式的区别：

- execute
  - execute 没有返回值
  - execute 无法捕获任务过程中的异常
- submit
  - submit 会返回一个 `Future` 对象，用来获取任务的执行结果
  - submit 可以通过 Future 对象来捕获任务中的异常

**execute 方式如下：**

```java
ExecutorService executor = Executors.newFixedThreadPool(5);
executor.execute(new Runnable() {
    public void run() {
        // 执行具体的任务逻辑
        System.out.println("Task executed using execute method");
    }
});
executor.shutdown();
```





**submit 方式如下：**

```java
ExecutorService executor = Executors.newFixedThreadPool(5);
Future<String> future = executor.submit(new Callable<String>() {
    public String call() {
        // 执行具体的任务逻辑
        return "Task executed using submit method";
    }
});

try {
    String result = future.get(); // 获取任务执行结果
    System.out.println(result);
} catch (InterruptedException e) {
    // 处理中断异常
} catch (ExecutionException e) {
    // 处理任务执行异常
} finally {
  // 关闭线程池
  executor.shutdown();
}
```





### 线程池是如何关闭的呢？

通过调用线程池的 `shutdown()` 方法即可关闭线程池

调用之后，会设置一个标志位表示当前线程池已经关闭，会禁止向线程池中提交新的任务

去中断所有的空闲线程并且等待正在执行的任务执行完毕（通过调用线程 `interrupt()` 方法），当线程池中所有任务都执行完毕之后，线程池就会被完全关闭



**扩展：thread.interrupt() 方法调用后线程会立即中断吗？**

不会，调用 interrupt 只是将被中断线程的中断状态设置为 true，通知被中断的线程自己处理中断，而不是立即强制的让线程直接中断（强制中断不安全）

当外部调用线程进行中断的命令时，如果该线程处于被阻塞的状态，如 Thread.sleep()，Object.wait()，BlockingQueue#put，BlockingQueue#take 等等时，那么此时调用该线程的 interrupt 方法就会抛出 InterruptedException 异常





### 线程池参数如何设置呢？

线程池参数的设置主要有两个：

1. 线程池中 `线程数量` 的设置
2. `任务队列` 的设置

**线程数量的设置：**



一般情况下线程数量根据是 CPU 密集还是 IO 密集进行设置即可

对于 `核心线程数量` 的设置：

- 对于 CPU 密集型任务，将核心线程数量设置为 cpu 核心核心数量 + 1 即可
- 对于 IO 密集型任务，将核心线程数量设置为 cpu 核心数量的两倍

对于 `最大线程数量` 的设置：

- 最大线程数量设置为核心线程数量一样即可
- 对于 IO 密集型任务，可以将最大线程数量设置的再多一些，避免因为 IO 执行时间过长，导致大量任务阻塞

**任务队列的设置：**

尽量使用有界队列，避免大量任务进入队列中等待，占用大量内存，并且线程数量会一直保持在核心线程数量，不会创建新的线程去处理任务，增加任务响应时间



具体一点的话，可以根据每秒需要执行的任务数量，以及每个任务执行的时间来设置核心线程数量

比如 tasks = 500，taskCost = 0.1s，系统容忍最大响应时间 responseTime = 1s，那么每秒就需要执行 500 个任务，每个任务花费 0.1s，那么核心线程数量需要设置为 `500 / (1 / taskCost) = 500 * 0.1 = 50`，需要 50 个核心线程每秒执行 50 个任务才可以保证在 1s 内将 500 个任务执行完毕

`最大线程数量`的设置可以根据 `（最大任务数 - 队列容量） / 每个线程每秒处理任务数量` 来设置

### 阿里手中的册线程池规范

在使用线程池的时候，需要注意一些规范，以免出现不必要的问题，可以参考阿里巴巴 Java 开发手册，如下：



**线程池名称命名规范：**

![1707126835124](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1707126835124.png)



**线程池创建规范：**

![1707126826497](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1707126826497.png)







> 这里可以扩展说一下，他们对于可见性和有序性的保证其实都是基于内存屏障来做的
>
> 在读取修饰的变量之前，会加一些内存屏障，这个内存屏障的作用就是让当前线程读取这个变量时可以读取到最新的值
>
> 在更新修饰的变量之后，也会加一些内存屏障，作用是可以让更新后的值被其他线程感知到
>
> 通过这个内存屏障可以让多个线程可以互相之间感知到对变量的更新，达到了可见性的作用
>
> 而有序性也是同理，通过内存屏障，来禁止内存屏障对指令进行重排






> 1. 
> 2. 
> 3. Map这种结构在java里有有哪些实现的对象呢？





> 1. Java多态的底层实现





> 1. 讲讲jdk1.8的垃圾回收



> 1. HashMap树化时除了remove还有什么时候链表化





> 1. 双亲委派的实现原理





> 1. 说一下 hashmap 的 put 过程





> 1. 作为 map 的 key 需要重写哪些方法？





> 1. JVM，JDK，JRE三者的之间的联系？







> 1. 方法重载和方法重写区别？





> 1. 接口和抽象类之间的区别？







> 1. 创建对象的几种方式







> 1. 这三行代码jvm做了什么事情
>
> String a = "123";
>
> String b = new("456");
>
> String c = a + b;





> 1. hashmap，为什么要转成红黑树，不是一开始就用（红黑树的缺点）









> 1. 双向链表的缺点？



