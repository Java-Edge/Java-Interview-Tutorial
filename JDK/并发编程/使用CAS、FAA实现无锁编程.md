锁会导致性能降低，在特定情况可用硬件同步原语替代锁，保证和锁一样数据安全，同时提供更好性能。

# 硬件同步原语（Atomic Hardware Primitives）
由计算机硬件提供的一组原子操作，较常用的原语主要是CAS和FAA两种。
- CAS（Compare and Swap）比较交换
- FAA原语（Fetch and Add）语义是，先获取变量p当前的值value，然后给变量p增加inc，最后返回变量p之前的值value。

原语有什么特殊的呢？
用编程语言来实现，肯定是无法保证原子性的。而原语是由计算机CPU提供实现，可保证操作的原子性。

原子操作具有不可分割性，不存在并发问题。所以在某些情况下，原语可以用来替代锁，实现一些即安全又高效的并发操作。

CAS和FAA在各种编程语言中，都有相应的实现，可直接使用，各种语言底层实现一样的。
注意并不是通过系统调用实现的，系统调用的开销不小，cas本来就是为了提升性能，不会走系统调用。事实上是在用户态直接使用汇编指令就可以实现。

# 账户服务示例

有个共享变量balance，保存当前账户余额，然后模拟多线程并发转账，看如何使用CAS原语来保证数据的安全性。

## 锁实现：
```go
package main

import (
	"fmt"
	"sync"
)

func main() {
	// 账户初始值为0元
	var balance int32
	balance = int32(0)
	done := make(chan bool)
	// 执行10000次转账，每次转入1元
	count := 10000

	var lock sync.Mutex

	for i := 0; i < count; i++ {
		// 这里模拟异步并发转账
		go transfer(&balance, 1, done, &lock)
	}
	// 等待所有转账都完成
	for i := 0; i < count; i++ {
		<-done
	}
	// 打印账户余额
	fmt.Printf("balance = %d \n", balance)
}
// 转账服务
func transfer(balance *int32, amount int, done chan bool, lock *sync.Mutex) {
	lock.Lock()
	*balance = *balance + int32(amount)
	lock.Unlock()
	done <- true
}
```
然后启动多协程并发执行10000次转账，每次往账户中转入1元，全部转账执行完成后，账户中的余额应该正好10000。
反复多次执行，每次balance的结果都正好是10000，那安全性没问题。
## CAS实现
```go
func transferCas(balance *int32, amount int, done chan bool) {
	for {
		old := atomic.LoadInt32(balance)
		new := old + int32(amount)
		if atomic.CompareAndSwapInt32(balance, old, new) {
			break
		}
	}
	done <- true
}
```

首先，for做个没有退出条件的循环。在这个循环内，反复调用CAS尝试给账户余额+1。
CAS前置条件：只有变量balance的值等于old，才会将balance赋为new。

在for循环中执行3条语句，在并发的环境中执行，会有两种可能：
1. 执行到第3条CAS时，没有其他线程同时改变账户余额，那可安全变更账户余额。这时CAS返回值一定true，转账成功，即可退出循环。并且CAS语句，是个原子操作，赋值安全性也可保证。
2. 在这过程，有其他线程改变账户余额，这时是无法保证数据安全的，不能再赋值。执行CAS时，由于无法通过比较步骤，所以不会执行赋值。本次尝试转账失败，当前线程并没有对账户余额做任何变更。由于返回值为false，不会退出循环，所以会继续重试，直到转账成功退循环。

这样每次转账操作，都可通过若干次重试，在保证安全性前提下，完成并发转账。

其实该例还有更简单性能更好方案：
# FAA
```go
func transferFaa(balance *int32, amount int, done chan bool) {
	atomic.AddInt32(balance, int32(amount))
	done <- true
}
```
java.util.concurrent.atomic.AtomicLong#getAndAdd


- FAA原语
获取变量当前值，然后把它做个加法，且保证该操作的原子性，一行代码即可。你开始好奇了，那CAS还有何意义？

该案例肯定FAA更合适，但CAS适用范围更广。
类似逻辑：先读数据，做计算，然后更新数据，无论这个计算啥样，都可用CAS保护数据安全。
但FAA逻辑局限于简单加减法。所以并非说CAS没有意义。

使用CAS反复重试赋值比较耗费CPU，因为for循环如果赋值不成，会立即进入下一次循环，没有等待的。如果线程间碰撞频繁，经常反复重试，这重试的线程会占用大量CPU时间，系统性能就会下降。

缓解这问题的一个方法是使用Yield()， 大部分编程语言都支持Yield()系统调用。
- Yield()作用
告诉os，让出当前线程占用的CPU给其他线程。每次循环结束前调用下Yield()，可在一定程度上降低CPU使用率，缓解该问题。也可在每次循环结束后，Sleep()小段时间，但这样性能会严重下降。
所以，这种方法它只适于线程碰撞不太频繁，即执行CAS不需要重试这样的场景。


# 用锁、CAS和FAA完整实现账户服务
https://github.com/shenyachen/JKSJ/blob/master/study/src/main/java/com/jksj/study/casAndFaa/CASThread.java
https://github.com/xqq1994/algorithm/blob/master/src/main/java/com/test/concurrency/MutxLock.java
https://github.com/xqq1994/algorithm/blob/master/src/main/java/com/test/concurrency/CAS.java