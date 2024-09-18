# 线上频繁Full GC，原来是外包同学不合理设置JVM参数！

某外包兄弟设置了个JVM参数后，直接导致线上频繁Full GC！

## 1 查看GC日志

看到GC日志有大量Full GC记录，啥导致的？日志看到“Metadata GC Threshold”字样，类似：

```
【Full GC（Metadata GC Threshold）xxxxx, xxxxx】
```

可知，这频繁Full GC，是JDK 1.8后的Metadata元数据区导致，即永久代。这Metadata一般放一些加载到JVM里去的类。但为啥Metadata区域频繁被塞满，会触发Full GC？而且Full GC本身就会带动CMS回收Old，还会回收Metadata区。

![](https://s1.51cto.com/oss/201909/10/6d20169f0cdf97be3159dca9dbb43dba.jpeg)

## 2 查看Metaspace内存占用情况

简单的通过jstat观察。若有监控系统，会展示Metaspace内存区域占用波动曲线：

![](https://s1.51cto.com/oss/201909/10/fb892e3d223c912a9f1373f974e41abc.jpeg)

Metaspace区内存总会先增加，达到波峰后，就会把Metaspace区域占满，然后触发Full GC，带着Metaspace区一起垃圾回收，所以接下来Metaspace区内存占用又变小了。

## 3 一个综合性的分析思路

显然是系统运行过程中，不断有新类产生，被加载到Metaspace，然后不停把Metaspace搞满，接着触发一次Full GC，回收Metaspace中的部分类。然后不断循环这过程，造成Metaspace区域反复被搞满，导致Full GC频繁：

![](https://s5.51cto.com/oss/201909/10/078c05e9cb8b00af98de4d18c4049725.jpeg)

是啥类不停被加载到JVM的Metaspace？ 这就要在JVM启动参数加入：

- -XX:TraceClassLoading
- -XX:TraceClassUnloading

追踪类加载和类卸载的情况，会通过日志打印出来JVM中加载了啥类，卸载了啥类。 就能看到Tomcat的catalina.out日志文件，输出日志类似：

```bash
【 Loaded sun.reflect.GeneratedSerializationConstructorAccessor from JVM_Defined_Class 】
```

JVM运行期间不停加载大量“GeneratedSerializationConstructorAccessor”类到Metaspace：

![](https://s5.51cto.com/oss/201909/10/499cfcb59763fee720debe95688a6820.jpeg)

**这是个实用技巧，务必掌握**，频繁Full GC不光是老年代触发，有时也会因为Metaspace的类太多而触发。

![](https://img-blog.csdnimg.cn/ded75dcd07d44c118b8505b16162c958.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_14,color_FFFFFF,t_70,g_se,x_16)

## 4 为啥会频繁加载莫名其妙的类？

看看那种不停加载的类，是你自己写的类？还是JDK内置的？

本案例那个类大概是在你使用Java的反射时加载的：

```java
Method method = XXX.class.getDeclaredMethod(xx,xx); method.invoke(target,params);
```

通过XXX.class获取到某个类，然后通过getDeclaredMethod获取到那个类的方法。

该方法就是个Method对象，再通过Method.invoke调用那个类的某个对象的方法。 在执行这种反射代码时，JVM会在你反射调用一定次数后就动态生成一些类，就是那种莫名其妙的类。下次你再执行反射时，就直接调用这些类的方法，这是JVM底层优化。

**所以当你在代码里大量用了类似上面的反射的东西，那么JVM就是会动态的去生成一些类放入Metaspace区！**

所以上面看到的那些奇怪的类，就是由于不停的执行反射的代码才生成：

![](https://s1.51cto.com/oss/201909/10/43b29b4b1ce8ef4f4e876547c88f0d4c.jpeg)

## 5 JVM为何不停创建这些怪类，然后放到Metaspace？

JVM自己创建的怪类的Class对象都是SoftReference，软引用。所以这里所说的Class对象，就是JVM在发射过程中动态生成的类的Class对象，他们都是SoftReference，它们正常情况下不会回收，但若内存紧张时，就会回收这些对象。那SoftReference对象到底在GC时，要不要回收是通过什么判断的？

$clock - timestamp <= freespace \* SoftRefLRUPolicyMSPerMB$

- clock - timestamp，一个软引用对象有多久没被访问

- freespace，JVM中空闲内存空间

- SoftRefLRUPolicyMSPerMB，每一MB空闲内存空间，允许SoftReference对象存活多久

  ![](https://img-blog.csdnimg.cn/3b3263fa1de546b5b827837c98cae5cc.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

若现在JVM创建一大堆怪类，这些类本身的Class对象都是被SoftReference软引用。然后现在JVM内存空间有3000MB，SoftRefLRUPolicyMSPerMB的默认值1000ms，则那些怪SoftReference软引用的Class对象，可存活3000 * 1000 = 3000s=50min。

一般GC时，其实JVM内部或多或少总有一些空间内存的，所以基本上如果不是快要发生OOM内存溢出了，一般软引用也不会被回收。

按理JVM会随着反射代码执行，动态创建怪类，他们的Class对象都是软引用，正常情况下不会被回收，但也不应该快速增长。

## 6 为何JVM创建的怪类会不停变多？

因为外包兄弟不知道从哪扒出SoftRefLRUPolicyMSPerMB参数，直接把这个参数设为0。

他觉得这参数设为0，任何软引用对象都可尽快释放掉，不用占住内存，尽量给内存释放空间出来，这样不就可以提高内存利用效率？

然而一旦该参数为0，直接导致

$clock - timestamp <= freespace * SoftRefLRUPolicyMSPerMB$

公式右半边0，就导致所有软引用对象，如JVM生成的那些怪Class对象，刚创建出来就可能被一次YGC给带着立马回收掉一些。

如下图所示。

![](https://s4.51cto.com/oss/201909/10/e8e345fe57124d7e94cdad330451db37.jpeg)

比如JVM好不容易给你弄出来100怪类，结果因为你瞎设置软引用的参数，导致突然一次GC就给你回收掉几十个类接着JVM在反射代码执行的过程中，就会继续创建这种奇怪的类，在JVM机制下，会导致这种奇怪类越来越多。

也许下一次gc又会回收掉一些奇怪的类，但是马上JVM还会继续生成这种类，最终就会导致Metaspace区域被放满了，一旦Metaspace区域被占满了，就会触发Full GC，然后回收掉很多类，接着再次重复上述循环：

![](https://s5.51cto.com/oss/201909/10/cbe745b829d0c9ca21873716b6a0d42b.jpeg)

## 7 解决

只要把

-XX:SoftRefLRUPolicyMSPerMB=0

这个参数设置大一些，设置个1000，2000，3000，或者5000毫秒都可。

提高这个数值，让反射过程中JVM自动创建的软引用的一些类的Class对象不要被随便回收，当时我们优化这个参数之后，就可以看到系统稳定运行了。基本上Metaspace区域的内存占用是稳定的，不会来回大幅度波动了。