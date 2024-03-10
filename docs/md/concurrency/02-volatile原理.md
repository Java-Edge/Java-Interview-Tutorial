# 02-volatile原理
## volatile

synchronized 在多线程场景下存在性能问题

而 `volatile` 关键字是一个更轻量级的线程安全解决方案

volatile 关键字的作用：保证多线程场景下变量的可见性和有序性

- 可见性：保证此变量的修改对所有线程的可见性。
- 有序性：禁止指令重排序优化，编译器和处理器在进行指令优化时，不能把在 volatile 变量操作(读/写)后面的语句放到其前面执行，也不能将volatile变量操作前面的语句放在其后执行。遵循了JMM 的 happens-before 规则

线程写 volatile 变量的过程：

1. 改变线程本地内存中volatile变量副本的值；
2. 将改变后的副本的值从本地内存刷新到主内存

线程读 volatile 变量的过程：

1. 从主内存中读取volatile变量的最新值到线程的本地内存中
2. 从本地内存中读取volatile变量的副本



### volatile 实现原理

如果面试中问到了 volatile 关键字，应该从 Java 内存模型开始讲解，再说到原子性、可见性、有序性是什么

之后说 volatile 解决了`有序性`和`可见性`，但是并不解决`原子性`

volatile 可以说是 Java 虚拟机提供的最轻量级的同步机制，在很多开源框架中，都会大量使用 volatile 保证并发下的有序性和可见性

> volatile 实现 `可见性`和 `有序性` 就是基于 `内存屏障` 的：

内存屏障是一种 `CPU 指令`，用于控制特定条件下的重排序和内存可见性问题

- 写操作时，在写指令后边加上 store 屏障指令，让线程本地内存的变量能立即刷到主内存中
- 读操作时，在读指令前边加上 load 屏障指令，可以及时读取到主内存中的值

JMM 中有 4 类`内存屏障`：（Load 操作是从主内存加载数据，Store 操作是将数据刷新到主内存）

- LoadLoad：确保该内存屏障前的 Load 操作先于屏障后的所有 Load 操作。对于屏障前后的 Store 操作并无影响屏障类型 


- StoreStore：确保该内存屏障前的 Store 操作先于屏障后的所有 Store 操作。对于屏障前后的Load操作并无影响
- LoadStore：确保屏障指令之前的所有Load操作，先于屏障之后所有 Store 操作
- StoreLoad：确保屏障之前的所有内存访问操作(包括Store和Load)完成之后，才执行屏障之后的内存访问操作。全能型屏障，会屏蔽屏障前后所有指令的重排



在字节码层面上，变量添加 volatile 之后，读取和写入该变量都会加入内存屏障：

**读取 volatile 变量时，在后边添加内存屏障，不允许之后的操作重排序到读操作之前**

```java
volatile变量读操作
LoadLoad 
LoadStore
```

**写入 volatile 变量时，前后加入内存屏障，不允许写操作的前后操作重排序**

```java
LoadStore
StoreStore 
volatile变量写操作
StoreLoad
```




**volatile 的缺陷就是不能保证变量的原子性**

解决方案：可以通过加锁或者 `AtomicInteger`原子操作类来保证该变量操作时的原子性

```java
public static AtomicInteger count = new AtomicInteger(0);
```

