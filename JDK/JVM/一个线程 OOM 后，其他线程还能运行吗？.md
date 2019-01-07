![](https://img-blog.csdnimg.cn/20210628172622676.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
由于面试官仅提到OOM，但 Java 的OOM又分很多类型的呀：
- 堆溢出（“java.lang.OutOfMemoryError: Java heap space”）
- 永久代溢出（“java.lang.OutOfMemoryError:Permgen space”）
- 不能创建线程（“java.lang.OutOfMemoryError:Unable to create new native thread”）

	OOM在《Java虚拟机规范》里，除程序计数器，虚拟机内存的其他几个运行时区域都可能发生OOM，那本文的目的是啥呢？
- 通过代码验证《Java虚拟机规范》中描述的各个运行时区域储存的内容
- 在工作中遇到实际的内存溢出异常时，能根据异常的提示信息迅速得知是哪个区域的内存溢出，知道怎样的代码可能会导致这些区域内存溢出，以及出现这些异常后该如何处理。

本文代码均由笔者在基于OpenJDK 8中的HotSpot虚拟机上进行过实际测试。

# 1 Java堆溢出
Java堆用于储存对象实例，只要不断地创建对象，并且保证GC Roots到对象之间有可达路径来避免GC机制清除这些对象，则随对象数量增加，总容量触及最大堆的容量限制后就会产生内存溢出异常。

限制Java堆的大小20MB，不可扩展
```bash
-XX：+HeapDumpOnOutOf-MemoryError
```
可以让虚拟机在出现内存溢出异常的时候Dump出当前的内存堆转储快照。
## 案例1
![](https://img-blog.csdnimg.cn/20210628172310407.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 报错
![](https://img-blog.csdnimg.cn/20210628172350886.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
Java堆内存的OOM是实际应用中最常见的内存溢出异常场景。出现Java堆内存溢出时，异常堆栈信息“java.lang.OutOfMemoryError”会跟随进一步提示“Java heap space”。 

那既然发生了，**如何解决这个内存区域的异常呢**？
一般先通过内存映像分析工具（如jprofile）对Dump出来的堆转储快照进行分析。
第一步首先确认内存中导致OOM的对象是否是必要的，即先分清楚到底是
- 内存泄漏（Memory Leak）
- 还是内存溢出（Memory Overflow）

- 下图是使用 jprofile打开的堆转储快照文件（java_pid44526.hprof） 
![](https://img-blog.csdnimg.cn/20210628174931619.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

若是内存泄漏，可查看泄漏对象到GC Roots的引用链，找到泄漏对象是通过怎样的引用路径、与哪些GC Roots相关联，才导致垃圾收集器无法回收它们，根据泄漏对象的类型信息以及它到GC Roots引用链的信息，一般可以比较准确地定位到这些对象创建的位置，进而找出产生内存泄漏的代码的具体位置。

若不是内存泄漏，即就是内存中的对象确实都必须存活，则应：
1. 检查JVM堆参数（-Xmx与-Xms）的设置，与机器内存对比，看是否还有向上调整的空间
2. 再检查代码是否存在某些对象生命周期过长、持有状态时间过长、存储结构设计不合理等情况，尽量减少程序运 行期的内存消耗

以上是处理Java堆内存问题的简略思路。

## 案例 2
JVM启动参数设置：
```bash
-Xms5m -Xmx10m -XX:+HeapDumpOnOutOfMemoryError
```
![](https://img-blog.csdnimg.cn/20210628191435587.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210628191613580.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)


- JVM堆空间的变化
![](https://img-blog.csdnimg.cn/20210628191655896.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
堆的使用大小，突然抖动！说明当一个线程抛OOM后，它所占据的内存资源会全部被释放掉，而不会影响其他线程的正常运行！
所以一个线程溢出后，进程里的其他线程还能照常运行。
发生OOM的线程一般情况下会死亡，也就是会被终结掉，该线程持有的对象占用的heap都会被gc了，释放内存。因为发生OOM之前要进行gc，就算其他线程能够正常工作，也会因为频繁gc产生较大的影响。

堆溢出和栈溢出，结论是一样的。
# 2 虚拟机栈/本地方法栈溢出
由于**HotSpot JVM并不区分虚拟机栈和本地方法栈**，因此HotSpot的`-Xoss`参数（设置本地方法栈的大小）虽然存在，但无任何效果，栈容量只能由`-Xss`参数设定。

关于虚拟机栈和本地方法栈，《Java虚拟机规范》描述如下异常： 
1. 若线程请求的栈深度大于虚拟机所允许的最大深度，将抛出StackOverflowError异常
2. 若虚拟机的栈内存允许动态扩展，当扩展栈容量无法申请到足够的内存时，将抛出 OutOfMemoryError异常

《Java虚拟机规范》明确允许JVM实现自行选择是否支持栈的动态扩展，而HotSpot虚拟机的选择是**不支持扩展**，所以除非在创建线程申请内存时就因无法获得足够内存而出现OOM，否则在线程运行时是不会因为扩展而导致内存溢出的，只会因为栈容量无法容纳新的栈帧而导致StackOverflowError。 

## 如何验证呢？
做俩实验，先在单线程操作，尝试下面两种行为是否能让HotSpot OOM： 
### 使用`-Xss`减少栈内存容量
- 示例
![](https://img-blog.csdnimg.cn/20210628195430820.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 结果
![](https://img-blog.csdnimg.cn/20210628210011222.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
抛StackOverflowError异常，异常出现时输出的堆栈深度相应缩小。

不同版本的Java虚拟机和不同的操作系统，栈容量最小值可能会有所限制，这主要取决于操作系统内存分页大小。譬如上述方法中的参数-Xss160k可以正常用于62位macOS系统下的JDK 8，但若用于64位Windows系统下的JDK 11，则会提示栈容量最小不能低于180K，而在Linux下这个值则可能是228K，如果低于这个最小限制，HotSpot虚拟器启动时会给出如下提示：

```bash
The stack size specified is too small, Specify at
```

### 定义大量局部变量，增大此方法帧中本地变量表的长度
- 示例
![](https://img-blog.csdnimg.cn/20210628210928936.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 结果
![](https://img-blog.csdnimg.cn/20210628210958901.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)所以无论是由于栈帧太或虚拟机栈容量太小，当新的栈帧内存无法分配时， HotSpot 都抛SOF。可若在允许动态扩展栈容量大小的虚拟机上，相同代码则会导致不同情况。

若测试时不限于单线程，而是不断新建线程，在HotSpot上也会产生OOM。但这样产生OOM和栈空间是否足够不存在直接的关系，主要取决于os本身内存使用状态。甚至说这种情况下，给每个线程的栈分配的内存越大，反而越容易产生OOM。 
不难理解，os分配给每个进程的内存有限制，比如32位Windows的单个进程最大内存限制为2G。HotSpot提供参数可以控制Java堆和方法区这两部分的内存的最大值，那剩余的内存即为2G（os限制）减去最大堆容量，再减去最大方法区容量，由于程序计数器消耗内存很小，可忽略，若把直接内存和虚拟机进程本身耗费的内存也去掉，剩下的内存就由虚拟机栈和本地方法栈来分配了。因此为每个线程分配到的栈内存越大，可以建立的线程数量越少，建立线程时就越容易把剩下的内存耗尽：
- 示例
![](https://img-blog.csdnimg.cn/20210628215114730.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 结果
```bash
Exception in thread "main" java.lang.OutOfMemoryError: unable to create native thread
```
出现SOF时，会有明确错误堆栈可供分析，相对容易定位问题。如果使用HotSpot虚拟机默认参数，栈深度在大多数情况下（因为每个方法压入栈的帧大小并不是一样的）到达1000~2000没有问题，对于正常的方法调用（包括不能做尾递归优化的递归调用），这个深度应该完全够用。但如果是建立过多线程导致的内存溢出，在不能减少线程数量或者更换64位虚拟机的情况下，就只能通过减少最大堆和减少栈容量换取更多的线程。这种通过“减少内存”手段解决内存溢出的方式，如果没有这方面处理经验，一般比较难以想到。也是由于这种问题较为隐蔽，从 JDK 7起，以上提示信息中“unable to create native thread”后面，虚拟机会特别注明原因可能是“possibly

```bash
#define OS_NATIVE_THREAD_CREATION_FAILED_MSG 	
	"unable to create native thread: possibly out of memory or process/resource limits reached"
```
# 3 方法区和运行时常量池溢出
运行时常量池是方法区的一部分，所以这两个区域的溢出测试可以放到一起。

HotSpot从JDK 7开始逐步“去永久代”，在JDK 8中完全使用元空间代替永久代，那么方法区使用“永久代”还是“元空间”来实现，对程序有何影响呢。 

String::intern()是一个本地方法：若字符串常量池中已经包含一个等于此String对象的字符串，则返回代表池中这个字符串的String对象的引用；否则，会将此String对象包含的字符串添加到常量池，并且返回此String对象的引用。

在JDK6或之前HotSpot虚拟机，常量池都是分配在永久代，可以通过如下两个参数：
![](https://img-blog.csdnimg.cn/20210628222603375.png)
限制永久代的大小，即可间接限制其中常量池的容量，
- 实例
![](https://img-blog.csdnimg.cn/20210628223514617.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- 结果

```bash
Exception in thread "main" java.lang.OutOfMemoryError: PermGen space 
	at java.lang.String.intern(Native Method) 
	at org.fenixsoft.oom.RuntimeConstantPoolOOM.main(RuntimeConstantPoolOOM.java: 18)
```
可见，运行时常量池溢出时，在OutOfMemoryError异常后面跟随的提示信息是“PermGen space”，说明运行时常量池的确是属于方法区（即JDK 6的HotSpot虚拟机中的永久代）的 一部分。

而使用JDK 7或更高版本的JDK来运行这段程序并不会得到相同的结果，无论是在JDK 7中继续使 用-XX：MaxPermSize参数或者在JDK 8及以上版本使用-XX：MaxMeta-spaceSize参数把方法区容量同样限制在6MB，也都不会重现JDK 6中的溢出异常，循环将一直进行下去，永不停歇。
这种变化是因为自JDK 7起，原本存放在永久代的字符串常量池被移至Java堆，所以在JDK 7及以上版 本，限制方法区的容量对该测试用例来说是毫无意义。

这时候使用-Xmx参数限制最大堆到6MB就能看到以下两种运行结果之一，具体取决于哪里的对象分配时产生了溢出：

```bash
// OOM异常一： Exception in thread "main" java.lang.OutOfMemoryError: Java heap space 
at java.base/java.lang.Integer.toString(Integer.java:440) 
at java.base/java.lang.String.valueOf(String.java:3058) 
at RuntimeConstantPoolOOM.main(RuntimeConstantPoolOOM.java:12) 

// OOM异常二： Exception in thread "main" java.lang.OutOfMemoryError: Java heap space at java.base/java.util.HashMap.resize(HashMap.java:699) 
at java.base/java.util.HashMap.putVal(HashMap.java:658) 
at java.base/java.util.HashMap.put(HashMap.java:607) 
at java.base/java.util.HashSet.add(HashSet.java:220) 
at RuntimeConstantPoolOOM.main(RuntimeConstantPoolOOM.java from InputFile-Object:14)
```

字符串常量池的实现位置还有很多趣事：
![](https://img-blog.csdnimg.cn/20210629230502171.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
JDK 6中运行，结果是两个false
JDK 7中运行，一个true和一个false
![](https://img-blog.csdnimg.cn/20210629231042658.png)
因为JDK6的intern()会把首次遇到的字符串实例复制到永久代的字符串常量池中，返回的也是永久代里这个字符串实例的引用，而由StringBuilder创建的字符串对象实例在 Java 堆，所以不可能是同一个引用，结果将返回false。

JDK 7及以后的intern()无需再拷贝字符串的实例到永久代，字符串常量池已移到Java堆，只需在常量池里记录一下首次出现的实例引用，因此intern()返回的引用和由StringBuilder创建的那个字符串实例是同一个。

str2比较返回false，这是因为“java”这个字符串在执行String-Builder.toString()之前就已经出现过了，字符串常量池中已经有它的引用，不符合intern()方法要求“首次遇到”的原则，而“计算机软件”这个字符串则是首次 出现的，因此结果返回true！

对于方法区的测试，基本的思路是运行时产生大量类去填满方法区，直到溢出。虽然直接使用Java SE API也可动态产生类（如反射时的 GeneratedConstructorAccessor和动态代理），但操作麻烦。
借助了CGLib直接操作字节码运行时生成大量动态类。 当前的很多主流框架，如Spring、Hibernate对类进行增强时，都会使用到 CGLib字节码增强，当增强的类越多，就需要越大的方法区以保证动态生成的新类型可以载入内存。
很多运行于JVM的动态语言（例如Groovy）通常都会持续创建新类型来支撑语言的动态性，随着这类动态语言的流行，与如下代码相似的溢出场景也越来越容易遇到

在JDK 7中的运行结果： 
```bash
Caused by: java.lang.OutOfMemoryError: PermGen space 
	at java.lang.ClassLoader.defineClass1(Native Method) 
	at java.lang.ClassLoader.defineClassCond(ClassLoader.java:632) 
	at java.lang.ClassLoader.defineClass(ClassLoader.java:616)
```

JDK8及以后：可以使用

```bash
-XX:MetaspaceSize=10M
-XX:MaxMetaspaceSize=10M
```
设置元空间初始大小以及最大可分配大小。
1.如果不指定元空间的大小，默认情况下，元空间最大的大小是系统内存的大小，元空间一直扩大，虚拟机可能会消耗完所有的可用系统内存。
2.如果元空间内存不够用，就会报OOM。
3.默认情况下，对应一个64位的服务端JVM来说，其默认的-XX:MetaspaceSize值为21MB，这就是初始的高水位线，一旦元空间的大小触及这个高水位线，就会触发Full GC并会卸载没有用的类，然后高水位线的值将会被重置。
4.从第3点可以知道，如果初始化的高水位线设置过低，会频繁的触发Full GC，高水位线会被多次调整。所以为了避免频繁GC以及调整高水位线，建议将-XX:MetaspaceSize设置为较高的值，而-XX:MaxMetaspaceSize不进行设置。


JDK8 运行结果：
![](https://img-blog.csdnimg.cn/20210630161717101.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
一个类如果要被gc，要达成的条件比较苛刻。在经常运行时生成大量动态类的场景，就应该特别关注这些类的回收状况。
这类场景除了之前提到的程序使用了CGLib字节码增强和动态语言外，常见的还有：
- 大量JSP或动态产生JSP 文件的应用（JSP第一次运行时需要编译为Java类）
- 基于OSGi的应用（即使是同一个类文件，被不同的加载器加载也会视为不同的类）

JDK8后，永久代完全废弃，而使用元空间作为其替代者。在默认设置下，前面列举的那些正常的动态创建新类型的测试用例已经很难再迫使虚拟机产生方法区OOM。
为了让使用者有预防实际应用里出现类似于如上代码那样的破坏性操作，HotSpot还是提供了一些参数作为元空间的防御措施：
- -XX:MetaspaceSize
指定元空间的初始空间大小，以字节为单位，达到该值就会触发垃圾收集进行类型卸载，同时收集器会对该值进行调整。如果释放了大量的空间，就适当降低该值，如果释放了很少空间，则在不超过-XX:MaxMetaspaceSize（如果设置了的话）的情况下，适当提高该值
- -XX:MaxMetaspaceSize
设置元空间最大值，默认-1，即不限制，或者说只受限于本地内存的大小
- -XX:MinMetaspaceFreeRatio
在GC后控制最小的元空间剩余容量的百分比，可减少因为元空间不足导致的GC频率
- -XX:Max-MetaspaceFreeRatio
控制最大的元空间剩余容量的百分比

# 本机直接内存溢出
直接内存（Direct Memory）的容量大小可通过`-XX:MaxDirectMemorySize`指定，若不指定，则默认与Java堆最大值（`-Xmx`）一致。

这里越过DirectByteBuffer类，直接通过反射获取Unsafe实例进行内存分配。
Unsafe类的getUnsafe()指定只有引导类加载器才会返回实例，体现了设计者希望只有虚拟机标准类库里面的类才能使用Unsafe，JDK10时才将Unsafe的部分功能通过VarHandle开放给外部。
因为虽然使用DirectByteBuffer分配内存也会抛OOM，但它抛异常时并未真正向os申请分配内存，而是通过计算得知内存无法分配，就在代码里手动抛了OOM，真正申请分配内存的方法是**Unsafe::allocateMemory()**
- 使用unsafe分配本机内存
![](https://img-blog.csdnimg.cn/20210630163836454.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 结果
![](https://img-blog.csdnimg.cn/2021063016375144.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
由直接内存导致的内存溢出，一个明显的特征是在Heap Dump文件中不会看见有什么明显异常，若发现内存溢出之后产生的Dump文件很小，而程序中又直接或间接使用了 DirectMemory（比如使用NIO），则该考虑直接内存了。