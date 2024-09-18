# 一次由热部署导致的OOM排查经历

代码部署 `test` 环境，容器经常因 OOM 重启，而相同代码部署 `prod` 环境则没问题，怀疑因近期 `test` 环境更换了热部署基础镜像包导致(服务只在 `test` 环境测试，因此使用公司的代码修改热部署插件)。

于是通过 JVM 工具排查 OOM，最终发现历史代码 bug，同时新的热部署基础镜像包放大了这种影响，导致 `metaspace` 内存泄漏。

## 1 查看 JVM 的内存使用情况

- `Arthas` 的 `dashboard` 
- jstat

先看 `arthas`  `dashboard` 的 `Memory` 区域，发现 `metaspace` 区内存使用率一直增加，直到超过 `MaxMetaspaceSize` ，发生 `metaspace` OOM。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/aed0b6236a513ea33951faee130b260b.awebp)

jstat查看GC情况，上次GC是因 `metaspace` 内存占用超过GC阈值，同时 `metaspace` 使用率一直在90%以上，更验证 `metaspace` OOM：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/40ffc2c59aeea101e1d71bf066cdd3d7.awebp)

## 2 分析 MetaSpace OOM 原因

JDK8后，`metaspace` 对应Java运行时数据区的 `方法区` ，存储已被虚拟机加载的类型信息、常量、静态变量、即时编译器编译后的代码缓存等数据，采用本地内存(Native Memory)实现，本身无大小限制（受物理内存大小限制），但可用 `-XX:MaxMetaspaceSize` 参数设置上限，这里设置2G。

既然因为类的元数据信息撑爆元空间，就看类的装载和卸载情况。 `jstat` 看类加载情况，对比 `test` 和 `prod` 环境差异：

test：加载很多类，但几乎没卸载过类

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/33a77da0c54cca4112300bb96586dc36.png)

prod：加载了很多类，也卸载了很多类

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/cd4412a4bf1ffa46272e52072e5a25b5.awebp)

 看test服务的类加载情况，Arthas`  `classloader：

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cdc40e703cb64f519da015425e9379af~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

第一眼就觉得 `AviatorClassLoader` 比较可疑，其他加载器都是spring和jdk的，这个是谷歌的，同时这个类加载器的实例数量和加载的类的数量非常大，同时随着服务的运行在不断的增长。

仅是类加载器的实例数量大倒还好，毕竟它的 `Class` 对象就一份，不会撑爆元空间，但它加载的 `Class` 会有问题，因为判断是不是同一个类，是由 **加载它的类加载器+全限定类名** 一起决定，于是乎，可以从这个类加载器入手，代码中全局搜索一下，找到引入点。

## 3 快速止血

报表类服务，用到一个表达式计算引擎 `AviatorEvaluator` ，根据表达式字符串计算复合指标，伪代码：

```java
public static synchronized Object process(Map<String, Object> eleMap, String expression) {
    // 表达式引擎实例
    AviatorEvaluatorInstance instance = AviatorEvaluator.newInstance();
    // 生产表达式对象
    Expression compiledExp = instance.compile(expression, true);
    // 计算表达式结果
    return compiledExp.execute(eleMap);
}
```

`expression` 是表达式字符串，`eleMap ` 是表达式中变量名和具体值的键值对，如 `expression `对应 `a+b` ，eleMap对应的键值对为 `{"a":10, "b":20}` ，则`process`方法的结果为`30`。

`synchronized ` 和 `newInstance` 重复了吗？`synchronized ` 是做同步，说明这段代码有共享资源竞争，应该就是 `AviatorEvaluator` 实例，目前逻辑每次执行 `process` 都会实例化一个 `AviatorEvaluator` 对象，这已不仅是线程私有，而是每个线程每次调用这个方法都会实例化一个对象，已经属于 **线程封闭** ，不需 `synchronized` 同步。业务场景对这个方法的调用量非常大，每个指标的计算都会调用这个方法。至此，结论：

- `synchronized` 同步和线程封闭每个线程私有一个对象二者选其一就行
- 如果 `AviatorEvaluator` 是线程安全的话，使用单例模式就行，可以减轻堆区的内存压力；

谷歌工具类不是线程安全的？`AviatorEvaluator` 的 `execute` 方法是线程安全的，代码里的使用姿势不对，修改代码如下，重新发布，不再OOM。

```java
// 删除 synchronized
public static Object process(Map<String, Object> eleMap, String expression) {
   AviatorEvaluator.execute(expression, eleMap, true); // true 表示使用缓存
}
```

## 4 代码分析

但是：
 a) 为啥是 `metaspace` ？
 b) 为啥用热部署镜像的 `test` 环境出现 OOM，而 `prod` 没？

若因 `AviatorEvaluator` 对象太多导致，那也该堆区 OOM；同时，`prod` 请求量远大于 `test` 环境，若像目前 `test` 这种 `metaspace` 膨胀速度，线上肯定也OOM，差异在 `test` 用热部署的基础镜像包。

### 4.1 为啥是metaspace？

热部署？ClassLoader? 方法区？阅读 `AviatorEvaluator` 的源码，调用链简化后：

```java
public Object execute(final String expression, final Map<String, Object> env, final boolean cached) {
  // 编译生成 Expression 对象
  Expression compiledExpression = compile(expression, expression, cached);
  // 执行表达式，输出结果
  return compiledExpression.execute(env);
}

private Expression compile(final String cacheKey, final String exp, final String source, final boolean cached) {
  // 编译生成 Expression 对象
	return innerCompile(expression, sourceFile, cached);
}

private Expression innerCompile(final String expression, final String sourceFile, final boolean cached) {
  ExpressionLexer lexer = new ExpressionLexer(this, expression);
  // 这个方法 new AviatorClassLoader 的实例
  CodeGenerator codeGenerator = newCodeGenerator(sourceFile, cached);
  return new ExpressionParser(this, lexer, codeGenerator).parse(); 
}

public CodeGenerator newCodeGenerator(final String sourceFile, final boolean cached) {
    // 每个 AviatorEvaluatorInstance 一个 AviatorClassLoader 的实例作为成员变量
    AviatorClassLoader classLoader = this.aviatorClassLoader;
    // 这个方法通过上面的类加载器不断生成并加载新的Class对象
    return newCodeGenerator(classLoader, sourceFile);
}

public CodeGenerator newCodeGenerator(final AviatorClassLoader classLoader, final String sourceFile) {
	ASMCodeGenerator asmCodeGenerator = 
    // 使用字节码工具ASM生成内部类
    new ASMCodeGenerator(this, sourceFile, classLoader, this.traceOutputStream);
}

public ASMCodeGenerator(final AviatorEvaluatorInstance instance, final String sourceFile,
    final AviatorClassLoader classLoader, final OutputStream traceOut) {
  // 生成唯一内部类
  this.className = "Script_" + System.currentTimeMillis() + "_" + CLASS_COUNTER.getAndIncrement();
}
```

使用 `AviatorEvaluatorInstance` 对象计算表达式，会用成员变量里的一个 `AviatorClassLoader` 加载自定义的字节码生成 `CodeGenerator` 对象。 `AviatorEvaluatorInstance` 用单例模式没问题，但若每次都 new 一个`AviatorEvaluatorInstance` 对象，就会有成百上千的 `AviatorClassLoader` 对象，这也解释上面通过 `Arthas` 查看 `classloader` 会有这么多对应实例，但 `metaspce` 的 `Class` 还是只有一份，问题不大。

同时看到生成的字节码对象都是 `Script_` 开头，使用 `arthas` 的 `sc` 命令看满足条件的类(数量非常多，只截取部分)，果然找到 OOM 元凶：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/3809f82fba4c332d8589f7b9a59854d5.awebp)

### 为啥 `prod` 没OOM？

上面 `jstat` 发现 `prod` 卸载很多类，而 `test` 几乎不卸载类，两个环境唯一的区别 `test` 用热部署的基础镜像。

热部署 agent 会对 `classloader` 有些 `强引用`，监听 `classloader` 的加载的一些类来监听热更新，这会导致内存泄漏。得到反馈，热部署后面会用 `弱引用` 优化。

《深入理解java虚拟机》解释：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/ed1bd43f088fbba1b8c009719236cd17.awebp)

因为大量 `AviatorEvaluatorInstance` 创建大量 `AviatorClassLoader` ，并被热部署 agent 强引用，得不到回收，这些类加载器加载的 `Script_*` 的Class对象也得不到卸载，直到  `metaspace` OOM。

通过 JVM 参数 `-Xlog:class+load=info` 、`-Xlog:class+unload=info` 看下 `prod` 环境的类加载和类卸载日志，确实有大量 `Script_*` 类的加载和卸载:

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/f859934519b76620637100aa3cea105d.awebp)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/72e5bcc84164d03f2253016b207a5253.awebp)

而 `test` 环境这没有此种类的卸载。

热部署包里的什么类型的对象强引用我们的自定义类加载器？使用 `jprofiler` 看两个环境的堆转储文件：

prod：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/efb4ce794a3b13876caffe39e87318c6.awebp)

test：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/1ff467b703179241805211a8f4bf2a63.awebp)

对比 `prod` 和 `test` 环境的引用情况，`test` 环境存在热更新类 `WatchHandler` 对象到 `AviatorClassLoader` 的强引用，而 `prod` 环境不存在； 

选择一个具体的 `AviatorClassLoader` 实例看引用情况：

prod：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/4eb42d78952f6e040e3bedc74b63306c.awebp)

test：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/808894d98133d7fdd314511a8d3ee4da.awebp)

`prod` 环境的 `AviatorClassLoader` 除了加载业务需要的自定义类 `Script_*`，还加载很多热更新相关的类，同时不同 `AviatorClassLoader` 实例加载的热更新相关的类的 `hashcode` 也是不同了，说明每个 `AviatorClassLoader` 实例都加载了一轮，这才是元空间占用内存大头。

当然，正确使用 `AviatorEvaluator` (使用单例模式)，就不会出现这么严重问题，但依然存在热部署 agent 对自定义 classloader 的强引用问题。

## 5 总结

本次排查涉及到的 JVM 基础概念和工具：

**元空间：**
 [segmentfault.com/a/119000001…](https://link.juejin.cn?target=https%3A%2F%2Fsegmentfault.com%2Fa%2F1190000012577387)

**类加载器：**
 [segmentfault.com/a/119000003…](https://link.juejin.cn?target=https%3A%2F%2Fsegmentfault.com%2Fa%2F1190000037574626)
 [segmentfault.com/a/119000002…](https://link.juejin.cn?target=https%3A%2F%2Fsegmentfault.com%2Fa%2F1190000023666707)

**JDK工具：**
 jps  	JVM Process Status Tool 进程状况工具
 jstat 	JVM Statistics M onitoring Tool 统计信息监视工具
 jinfo    Configuration Info for Java Java配置信息工具
 jmap       Memory Map for Java 内存映像工具
 jhat         JVM Heap Analysis Tool 堆转储快照分析工具
 jstack     Stack Trace for Java 堆栈跟踪工具
 Jcmd      多功能诊断命令行工具