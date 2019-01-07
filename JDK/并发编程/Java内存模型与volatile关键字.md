#  volatile 的实现维度
|级别|实现  |
|--|--|
| Java 代码	 |volatile int i  |
| ByteCode 字节码	 | ACC_VOLATILE  |
| JVM 虚拟机规范	 | JVM 内存屏障 |
|  HotSpot 实现	 |汇编语言调用 |
|  CPU 级别	 | MESI 原语支持总线锁  |

- 可见性问题
让一个线程对共享变量的修改，能够及时的被其他线程看到。

根据JMM中规定的happen before和同步原则：
对某个volatile字段的写操作happens- before每个后续对该volatile字段的读操作。
对volatile变量v的写入，与所有其他线程后续对v的读同步

要满足这些条件，所以volatile关键字就有这些功能：
- 禁止缓存;
[volatile变量的访问控制符会加个**ACC_VOLATILE**](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.5)
- 对volatile变 量相关的指令不做重排序

**`volatile`** 变量可以被看作是一种 **"轻量的 `synchronized`**，可算是JVM提供的最轻量级的同步机制。

当一个变量定义为volatile后，可以保证此变量对所有线程的可见性。
# 2 原子性(Atomicity)
一次只允许一个线程持有某锁，一次只有一个线程能使用共享数据

由JMM直接保证的原子性变量操作包括read、load、use、assign、store和write六个，大致可以认为基础数据类型的访问读写是原子性的

如果应用场景需要一个更大范围的原子性保证，JMM还提供了lock和unlock操作来满足这种需求，尽管虚拟机未把lock与unlock操作直接开放给用户使用，但是却提供了更高层次的字节码指令monitorenter和monitorexit来隐匿地使用这两个操作，这两个字节码指令反映到Java代码中就是同步块synchronized关键字，因此在synchronized块之间的操作也具备原子性

# 5  可见性(Visibility)
当一个线程修改了线程共享变量的值，其它线程能够立即得知这个修改。

由于现代可共享内存的多处理器架构可能导致一个线程无法马上看到另一个线程操作产生的结果。所以 Java 内存模型规定了 JVM 的一种最小保证：什么时候写入一个变量对其他线程可见。

在现代可共享内存的多处理器体系结构中每个处理器都有自己的缓存，并周期性的与主内存协调一致。假设线程 A 写入一个变量值 V，随后另一个线程 B 读取变量 V 的值
在下列情况下，线程 B 读取的值可能不是线程 A 写入的最新值：
- 执行线程 A 的处理器把变量 V 缓存到寄存器中。
- 执行线程 A 的处理器把变量 V 缓存到自己的缓存中，但还没有同步刷新到主内存中去。
- 执行线程 B 的处理器的缓存中有变量 V 的旧值。

JMM通过在变量修改后将新值同步回主内存，在变量读取前从主内存刷新变量值这种依赖主内存作为传递媒介的方法来实现可见性，无论是普通变量还是volatile变量都是如此。

普通变量与volatile变量的区别：
volatile保证了新值能`立即同步`到主内存，以及每使用前`立即从内存刷新`。因此volatile保证了线程操作时变量的可见性，而普通变量则不能保证。

除了volatile，Java还有两个关键字能**实现可见性**：
### synchronized
由“对一个变量执行`unlock`前，必须先把此变量同步回主内存中(执行`store`和`write`)”这条规则获得的
### final
被final修饰的字段在构造器中一旦初始化完成，并且构造器没有把"this"的引用传递出去（this引用逃逸是一件很危险的事情，其他线程有可能通过这个引用访问到“初始化了一半”的对象），那在其他线程中就能看见final字段的值

final在该对象的构造函数中设置对象的字段，当线程看到该对象时，将始终看到该对象的final字段的正确构造版本。
伪代码示例
```java
f = new finalDemo();
```
读取到的 f.x 一定最新，x为final字段。

如果在构造函数中设置字段后发生读取，则会看到该final字段分配的值，否则它将看到默认值;
伪代码示例:
```java
public finalDemo(){x=1;y=x;};
```
y会等于1;

读取该共享对象的final成员变量之前，先要读取共享对象。
伪代码示例: 
```java
r= new ReferenceObj(); 
k=r.f; 
```
这两个操作不能重排序

通常static final是不可以修改的字段。然而System.in, System.out和System.err 是static final字段，遗留原因，必须允许通过set方法改变，我们将这些字段称为写保护，以区别于普通final字段
![](https://img-blog.csdnimg.cn/20191017035805128.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191017035922154.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191017040021853.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

必须确保释放锁之前对共享数据做出的更改对于随后获得该锁的另一个线程可见,对域中的值做赋值和返回的操作通常是原子性的,但递增/减并不是

volatile对所有线程是立即可见的，对volatile变量所有的写操作都能立即返回到其它线程之中，换句话说，volatile变量在各个线程中是一致的，但并非基于volatile变量的运算在并发下是安全的

volatile变量在各线程的工作内存中不存在一致性问题(在各个线程的工作内存中volatile变量也可以存在不一致，但由于
`每次使用之前都要先刷新 ` ，执行引擎看不到不一致的情况,因此可以认为不存在一致性问题)，但Java里的运算并非原子操作，导致volatile变量的运算在并发下一样是不安全的
```java
public class Atomicity {
	int i;
	void f(){
		i++;
	}
	void g(){
		i += 3;
	}
}
```
编译后文件
```java
void f();
		0  aload_0 [this]
		1  dup
		2  getfield concurrency.Atomicity.i : int [17]
		5  iconst_1
		6  iadd
		7  putfield concurrency.Atomicity.i : int [17]
 // Method descriptor #8 ()V
 // Stack: 3, Locals: 1
 void g();
		0  aload_0 [this]
		1  dup
		2  getfield concurrency.Atomicity.i : int [17]
		5  iconst_3
		6  iadd
		7  putfield concurrency.Atomicity.i : int [17]
}
```
每个操作都产生了一个 get 和 put ，之间还有一些其他的指令
因此在获取和修改之间，另一个线程可能会修改这个域
所以，这些操作不是原子性的

再看下面这个例子是否符合上面的描述
```java
public class AtomicityTest implements Runnable {
	  private int i = 0;
	  public int getValue() {
		  return i;
	  }

	  private synchronized void evenIncrement() {
		  i++;
		  i++;
	  }

	  public void run() {
	    while(true)
	      evenIncrement();
	  }

	  public static void main(String[] args) {
	    ExecutorService exec = Executors.newCachedThreadPool();
	    AtomicityTest at = new AtomicityTest();
	    exec.execute(at);
	    while(true) {
	      int val = at.getValue();
	      if(val % 2 != 0) {
	        System.out.println(val);
	        System.exit(0);
	      }
	    }
	  }
}
output:
1
```
该程序将找到奇数值并终止
尽管`return i `原子性，但缺少同步使得其数值可以在处于不稳定的中间状态时被读取
由于 i 不是 volatile ,存在可视性问题
getValue() 和 evenIncrement() 必须synchronized 
 

对于基本类型的读/写操作被认为是安全的原子性操作
但当对象处于不稳定状态时，仍旧很有可能使用原子性操作来访问他们
最明智的做法是遵循同步的规则

**volatile 变量只保证可见性**
在不符合以下条件规则的运算场景中，仍需要通过加锁（使用synchronized或JUC中的原子类）来保证`原子性`
- 运算结果不依赖变量的当前值，或者能确保只有单一的线程修改变量的值
- 变量不需要与其它的状态变量共同参与不可变类约束

基本上,若一个域可能会被多个任务同时访问or这些任务中至少有一个是写任务,那就该将此域设为volatile
当一个域定义为 volatile 后，将具备
> **1.保证此变量对所有的线程的可见性，当一个线程修改了这个变量的值，volatile 保证了新值能立即同步到主内存，其它线程每次使用前立即从主内存刷新**
但普通变量做不到这点，普通变量的值在线程间传递均需要通过主内存来完成
> **2.禁止指令重排序。有volatile修饰的变量，赋值后多执行了一个“load addl $0x0, (%esp)”操作，这个操作相当于一个内存屏障**（指令重排序时不能把后面的指令重排序到内存屏障之前的位置）
这些操作的目的是用线程中的局部变量维护对该域的精确同步

# 6  CPU 性能优化手段 - 运行时指令重排序
编译器生成指令的次序，可以不同于源代码所暗示的“显然”版本。
重排后的指令，对于优化执行以及成熟的全局寄存器分配算法的使用，都是大有脾益的，它使得程序在计算性能上有了很大的提升。

## 6.1 指令重排的场景
当CPU**写缓存时**发现缓存区块正被其他CPU占用，为了提高CPU处理性能, 可能将后面的**读缓存命令优先执行**

- 比如:
![](https://img-blog.csdnimg.cn/20191008014948899.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

并非随便重排，需要遵守
- **as-if-serial语义**
不管怎么重排序(编译器和处理器为了提高并行度),(单线程)程序的执行结果不能被改变。

编译器，runtime 和处理器都必须遵守as-if- serial语义。
也就是说:编译器和处理器**不会对存在数据依赖关系的操作做重排**

## 6.2 重排序类型
包括如下:

- 编译器生成指令的次序，可以不同于源代码所暗示的“显然”版本。
- 处理器可以乱序或者并行的执行指令。
- 缓存会改变写入提交到主内存的变量的次序。

## 问题
CPU执行指令重排序优化下有一个问题:
虽然遵守了**as-if-serial**语义，单仅在单CPU自己执行的情况下能保证结果正确。
多核多线程中，指令逻辑无法分辨因果关联，可能出现**乱序执行**，导致程序运行结果错误。

有序性：**即程序执行的顺序按照代码的先后顺序执行**


### 使用volatile变量的第二个语义是`禁止指令重排序优化`

普通变量仅保证该方法执行过程所有依赖赋值结果的地方能获取到正确结果,而不保证变量赋值操作的顺序与代码执行顺序一致
因为在一个线程的方法执行过程中无法感知到这一点，这也就是JMM中描述的所谓的
`线程内表现为串行的语义(Within-Thread As-If-Serial Sematics)`

#### 实例
![](https://img-blog.csdnimg.cn/20191014024919523.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191014024843306.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)







```
Map configOptions;  
char[] configText;  
//此变量必须定义为volatile  
volatile boolean initialized = false;  

//假设以下代码在线程A中执行  

//模拟读取配置信息，当读取完成后  
//将initialized设置为true来通知其它线程配置可用  
configOptions = new HashMap();  
configText = readConfigFile(fileName);  
processConfigOptions(configText, configOptions);  
initialized = true;  

//假设以下代码在线程B中执行  

//等线程A待initialized为true，代表线程A已经把配置信息初始化完成  
while(!initialized) {  
    sleep();  
}  
//使用线程A中初始化好的配置信息  
doSomethingWithConfig();
```
如果定义`initialized`时没有使用`volatile`，就可能会由于指令重排序优化，导致位于线程A中最后一行的代码`initialized = true`被提前执行，这样在线程B中使用配置信息的代码就可能出现错误，而`volatile`关键字则可以完美避免

volatile变量读操作性能消耗与普通变量几乎无差,但写操作则可能会稍慢，因为它需要在代码中插入许多内存屏障指令来保证处理器不发生乱序执行
不过即便如此，大多数场景下volatile的总开销仍然要比锁小，我们在volatile与锁之中选择的`唯一依据仅仅是volatile的语义能否满足使用场景的需求`
![单例模式](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWRhMWRlZDI5NzkwMTYzNDUucG5n?x-oss-process=image/format,png)
![字节码指令](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWMxZGRjYmRlNjRkZmU2OGQucG5n?x-oss-process=image/format,png)
![汇编指令](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTYzMzMzZTk2ZGRhM2YwYWEucG5n?x-oss-process=image/format,png)
`volatile`修饰的变量，赋值后(前面`mov %eax,0x150 (%esi)` 这句便是赋值操作) 多执行了一个`1ock add1 $ 0x0,(%esp)`,这相当于一个内存屏障(Memory Barrier/Fence,指重排序时不能把后面的指令重排序到内存屏障之前的位置),只有一个CPU 访问内存时,并不需要内存屏障
但如果有两个或更多CPU 访问同一块内存,且其中有一个在观测另一个,就需要内存屏障来保证一致性了

这句指令中的`add1 $0x0, (%esp)`(把ESP 寄存器的值加0) 显然是一个空操作(采用这个空操作而不是空操作指令`nop` 是因为IA32手册规定`lock `前缀不允许配合`nop` 指令使用)，关键在于lock 前缀，查询IA32 手册，它的作用是使得本CPU 的Cache写入内存,该写入动作也会引起别的CPU 或者别的内核无效化(Inivalidate) 其Cache,这种操作相当于对Cache 中的变量做了一次`store和write`。所以通过这样一个空操作，可让前面volatile 变量的修改对其他CPU 立即可见。

### 那为何说它禁止指令重排序呢?
 硬件架构上，指令重排序指CPU 采用了允许将多条指令不按程序规定的顺序分开发送给各相应电路单元处理。但并不是说指令任意重排，CPU需要能正确处理指令依赖情况以保障程序能得出正确的执行结果
譬如指令1把地址A中的值加10，指令2把地址A 中的值乘以2,指令3把地址B 中的值减去了，这时指令1和指令2是有依赖的，它们之间的顺序不能重排,(A+10) *2 与A*2+10显然不等，但指令3 可以重排到指令i、2之前或者中间，只要保证CPU 执行后面依赖到A、B值的操作时能获取到正确的A 和B 值即可。所以在本CPU 中，重排序看起来依然是有序的。因此`lock add1 $0x0,(%esp)` 指令把修改同步到内存时，意味着所有之前的操作都已经执行完成，这样便形成了“指令重排序无法越过内存屏障”的效果

举个例子
```
int i = 0;              
boolean flag = false;
i = 1;                //语句1  
flag = true;          //语句2
```
从代码顺序上看，语句1在2前，JVM在真正执行这段代码的时候会保证**语句1一定会在语句2前面执行吗？**不一定，为什么呢？**这里可能会发生指令重排序（Instruction Reorder）**
比如上面的代码中，语句1/2谁先执行对最终的程序结果并无影响，就有可能在执行过程中，语句2先执行而1后**虽然处理器会对指令进行重排序，但是它会保证程序最终结果会和代码顺序执行结果相同，**靠什么保证？**数据依赖性**

> **编译器和处理器在重排序时，会遵守数据依赖性，编译器和处理器不会改变存在数据依赖关系的两个操作的执行顺序**

举例
```
double pi  = 3.14;    //A  
double r   = 1.0;     //B  
double area = pi * r * r; //C  
```
![三个操作的数据依赖关系](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtNzNkNTFkZjgxMjdjM2YzMw?x-oss-process=image/format,png)
A和C之间存在数据依赖关系，同时B和C之间也存在数据依赖关系。
因此在最终执行的指令序列中，C不能被重排序到A和B的前面（C排到A和B的前面，程序的结果将会被改变）。
但A和B之间没有数据依赖关系，编译器和处理器可以重排序A和B之间的执行顺序
![该程序的两种执行顺序](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtZDNhYjQyM2NjOTFhODg1Nw?x-oss-process=image/format,png)
这里所说的数据依赖性仅针对**单个处理器中执行的指令序列和单个线程中执行的操作**，在单线程程序中，对存在控制依赖的操作重排序，不会改变执行结果
但在**多线程程序中，**对存在控制依赖的操作重排序，可能会改变程序的执行结果。这是就需要**内存屏障来保证可见性了**

回头看一下JMM对volatile 变量定义的特殊规则
假定T 表示一个线程，V 和W 分别表示两个volatile变量，那么在进行read, load, use,assign,store,write时需要满定如下规则
- 只有当线程T 对变量V 执行的前一个动作是load ,线程T 方能对变量V 执行use;并且，只有当线程T 对变量V 执行的后一个动作是`use`,线程T才能对变量V执行load.线程T 对变量V 的`use `可认为是和线程T对变量V的load,read相关联，必须连续一起出现(这条规则要求在工作内存中，每次使用V前都必须先从主内存刷新最新的值语,用于保证能看见其他线程对变量V所做的修改后的值)
- 只有当线程T 对变量V 执行的前一个动作是  `assign` ，线程T才能对变量V 执行`store` 
并且，只有当线程T对变量V执行的后一个动作是`store` ,线程T才能对变量V执行`assign `
线程T对变量V的`assign`可以认为是和线程T对变量V的store,write相关联，必须连续一起出现(这条规则要求在工作内存中，每次修改V 后都必须立刻同步回主内存中，用于保证其他线程可以看到自己对变量V所做的修改)
- 假定动作A 是线程T 对变量V实施的`use`或`assign `,假定动作F 是和动作A 相关联的`load `或`store `,假定动作P 是和动作F 相应的对变量V 的`read` 或`write` 
类似的，假定动作B 是线程T 对变量W 实施的`use `或`assign` 动作，假定动作G是和动作B 相关联的`load `或`store`,假定动作Q 是和动作G 相应的对变量W的`read`或`write`
如果A 先于B，那么P先于Q (这条规则要求volatile修饰的变量不会被指令重排序优化,保证代码的执行顺序与程序的顺序相同)

## 对于Long和double型变量的特殊规则
虚拟机规范中，写64位的double和long分成了两次32位值的操作
由于不是原子操作，可能导致读取到某次写操作中64位的前32位，以及另外一次写操作的后32位

读写volatile的long和double总是原子的。读写引用也总是原子的

商业JVM不会存在这个问题，虽然规范没要求实现原子性，但是考虑到实际应用，大部分都实现了原子性。
对于32位平台，64位的操作需要分两步来进行，与主存的同步。所以可能出现“半个变量”的状态。
![](https://img-blog.csdnimg.cn/20191017040930628.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
在实际开发中，目前各种平台下的商用虚拟机几乎都选择把64位数据的读写操作作为原子操作来对待，因此我们在编码时一般不需要把用到的long和double变量专门声明为volatile。

## Word Tearing字节处理
一个字段或元素的更新不得与任何其他字段或元素的读取或更新交互。
特别是，分别更新字节数组的相邻元素的两个线程不得干涉或交互，也不需要同步以确保顺序一致性。

有些处理器(尤其是早期的Alphas处理器)没有提供写单个字节的功能。
在这样的处理器_上更新byte数组，若只是简单地读取整个内容，更新对应的字节，然后将整个内容再写回内存，将是不合法的。

这个问题有时候被称为“字分裂(word tearing)”,在单独更新单个字节有难度的处理器上，就需要寻求其它方式了。
基本不需要考虑这个，了解就好。

```bash
JAVA代码层级 - volatile
JVM层级 - JSR
os - 具体实现
```
# 内存屏障
## JSR的内存屏障(JVM 规范)
`这只是 JVM 层级的要求,非底层硬件的具体实现！`

- 在 volatile 读写前后都加上屏障
![](https://img-blog.csdnimg.cn/20200405201806565.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
### LoadLoad屏障
对于这样的语句Load1; Loadload; Load2,
在Load2及后续读取操作要读取的数据被访问前，保证Load1要读取的数据被读取完毕

### StoreStore屏障
对于这样的语句Store1; StoreStore; Store2,
在Store2及后续写入操作执行前，保证Store1的写入操作对其它处理器可见。
### LoadStore屏障
对于这样的语甸oad1; LoadStore; Store2,
在Store2及后续写入操作被刷出前，保证Load1要读取的数据被读取完毕。
### Storeload屏障
对于这样的语句Store1; StoreL oad; Ioad2,
在Load2及后续所有读取操作执行前，保证Store1的写入对所有处理器可见。

## JVM 层面 volatile的实现细节

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200424205227180.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## x86 CPU 内存屏障 - 原语级别实现
之所以JVM不直接使用这些指令,是因为并非所有 cpu 都支持,但是所有 cpu 都支持 lock 指令!
lock 指令直接锁定总线,肯定直接禁止了重排序,因此 JVM是调用了该指令,简单暴力!
![](https://img-blog.csdnimg.cn/20200405202125331.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- sfence
在sfence指令前的写操作当必须在sfence指令后的写操作前完成
- lfence
在Ifence指令前的读操作当必须在Ifence指令后的读操作前完成
- mfence
在mfence指令前的读写操作当必须在mfence指令后的读写操作前完成。

有序性保障：intel lock 汇编指令
原子指令，如x86上的lock指令是一个Full Barrier,执行时会锁住内存子系统来确保执行顺序，甚至跨多个CPU。Software Locks通常使用了内存屏障或原子指令来实现变量可见性和保持程序顺序



处理器提供了两个内存屏障指令(Memory Barrier)用于解决上述的两个问题:
## 7.1 指令分类
- 写内存屏障(Store Memory Barrier) 
在指令后插入**Store Barrier**,能让写入缓存中的最新数据更新写入主内存，让其他线程可见
强制写入主内存，这种显示调用，CPU就不会因为性能考虑而去对指令重排

- 读内存屏障(Load Memory Barrier) 
在指令前插入Load Barrier,可以让高速缓存中的数
据失效，强制从新从主内存加载数据。
强制读取主内存内容，让CPU缓存与主内存保持一致，避免了缓存导致的一致性问题

## 7.2  有序性(Ordering)
JMM中程序的天然有序性可以总结为一句话：
`如果在本线程内观察，所有操作都是有序的；如果在一个线程中观察另一个线程，所有操作都是无序的。`
前半句是指“线程内表现为串行语义”
后半句是指“指令重排序”现象和“工作内存主主内存同步延迟”现象

Java提供了volatile和synchronized保证线程之间操作的有序性
volatile本身就包含了禁止指令重排序的语义
synchronized则是由“一个变量在同一时刻只允许一条线程对其进行lock操作”这条规则来获得的，这个规则决定了持有同一个锁的两个同步块只能串行地进入。

## 7.3 Happens-beofre 先行发生原则（JVM 规范）
这八种不能指令重排序
如果JMM中所有的有序性都只靠volatile和synchronized，那么有一些操作将会变得很繁琐，但我们在编写Java并发代码时并没有感到这一点，这是因为Java语言中有一个`先行发生(Happen-Before)`原则。它是判断数据是否存在竞争，线程是否安全的主要依赖。

- 先行发生原则
JMM中定义的两项操作之间的依序关系。

`happens- before关系` 主要是强调两个有冲突的动作之间的顺序，以及定义数据争用的发生时机。

如果操作A先行发生于操作B，就是在说发生B前，A产生的影响能被B观察到，“影响”包含了修改内存中共享变量的值、发送了消息、调用了方法等。案例如下：
```java
// 线程A中执行  
i = 1;  

// 线程B中执行  
j = i;  

// 线程C中执行  
i = 2;
```
下面是JMM下一些”天然的“先行发生关系，无须任何同步器协助就已经存在，可以在编码中直接使用。
如果两个操作之间的关系不在此列，并且无法从下列规则推导出来的话，它们就没有顺序性保障，虚拟机可以对它们进行随意重排序。

`具体的虚拟机实现`，有必要确保以下原则的成立：
- 程序次序规则(Pragram Order Rule)
在一个线程内，按照代码顺序，书写在前面的操作先行发生于书写在后面的操作。准确地说应该是控制流顺序而不是程序代码顺序，因为要考虑分支、循环结构。
- 对象锁(监视器锁)法则(Monitor Lock Rule )
某个管程(也叫做对象锁，监视器锁) 上的unlock动作happens-before同一个管程上后续的lock动作 。这里必须强调的是同一个锁，而”后面“是指时间上的先后。
- volatile变量规则(Volatile Variable Rule)
对某个volatile字段的写操作happens- before每个后续对该volatile字段的读操作，这里的”后面“同样指时间上的先后顺序。
- 线程启动规则(Thread Start Rule)
在某个线程对象 上调用start()方法happens- before该启动了的线程中的任意动作
- 线程终止规则(Thread Termination Rule)
某线程中的所有操作都先行发生于对此线程的终止检测，我们可以通过Thread.join()方法结束(任意其它线程成功从该线程对象上的join()中返回)，Thread.isAlive()的返回值等作段检测到线程已经终止执行。
- 线程中断规则(Thread Interruption Rule)
对线程interrupt()方法的调用先行发生于被中断线程的代码检测到中断事件的发生，可以通过Thread.interrupted()方法检测是否有中断发生
- 对象终结规则(Finalizer Rule)
一个对象初始化完成(构造方法执行完成)先行发生于它的finalize()方法的开始
- 传递性(Transitivity)
如果操作A先行发生于操作B，操作B先行发生于操作C，那就可以得出操作A先行发生于操作C的结论

一个操作”时间上的先发生“不代表这个操作会是”先行发生“，那如果一个操作”先行发生“是否就能推导出这个操作必定是”时间上的先发生“呢？也是不成立的，一个典型的例子就是指令重排序。
所以时间上的先后顺序与先行发生原则之间基本没有什么关系，所以衡量并发安全问题一切必须以先行发生原则为准。

## 7.4 作用
> **1.阻止屏障两侧的指令重排序
> 2.强制把写缓冲区/高速缓存中的脏数据等写回主内存，让缓存中相应的数据失效**
*   对于Load Barrier来说，在指令前插入Load Barrier，可以让高速缓存中的数据失效，强制从新从主内存加载数据
*   对于Store Barrier来说，在指令后插入Store Barrier，能让写入缓存中的最新数据更新写入主内存，让其他线程可见

**Java的内存屏障实际上也是上述两种的组合，完成一系列的屏障和数据同步功能**

> **LoadLoad屏障：** 对于这样的语句Load1; LoadLoad; Load2，在Load2及后续读取操作要读取的数据被访问前，保证Load1要读取的数据被读取完毕。
> **StoreStore屏障：** 对于这样的语句Store1; StoreStore; Store2，在Store2及后续写入操作执行前，保证Store1的写入操作对其它处理器可见。
> **LoadStore屏障：** 对于这样的语句Load1; LoadStore; Store2，在Store2及后续写入操作被刷出前，保证Load1要读取的数据被读取完毕。
> **StoreLoad屏障：** 对于这样的语句Store1; StoreLoad; Load2，在Load2及后续所有读取操作执行前，保证Store1的写入对所有处理器可见。它的开销是四种屏障中最大的。在大多数处理器的实现中，这个屏障是个万能屏障，兼具其它三种内存屏障的功能

`volatile`的内存屏障策略非常严格保守
> **在每个volatile写操作前插入StoreStore屏障，在写操作后插入StoreLoad屏障
> 在每个volatile读操作前插入LoadLoad屏障，在读操作后插入LoadStore屏障**

由于内存屏障的作用，避免了volatile变量和其它指令重排序、线程之间实现了通信，使得volatile表现出了锁的特性。

# 总结
看到了现代CPU不断演进，在程序运行优化中做出的努力。不同CPU厂商所付出的人力物力成本，最终体现在不同CPU性能差距上。而Java就随即推出了大量保证线程安全的机