# 0 前言
全是干货的技术殿堂

> `文章收录在我的 GitHub 仓库，欢迎Star/fork：`
> 
> [Java-Interview-Tutorial](https://github.com/Wasabi1234/Java-Interview-Tutorial)
> 
> https://github.com/Wasabi1234/Java-Interview-Tutorial

#  1 引导语
《手册》的异常处理规约对异常的处理方式提出了一些指导规范1，如：

![](https://img-blog.csdnimg.cn/20200206000837876.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200206000908110.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

# 2 "吞掉"异常？
## 2.1 简介
即，处理后不再将异常传给上层。其中包括 catch 到异常并处理（打印日志、发通知等）后不再扔给上层；捕捉到异常后给上层返回 null 值等行为。

前一小节的强制 5就属于该种措施。

## 2.2 为什么要手动回滚
先看事务的执行入口：

- TransactionInterceptor#invoke
![](https://img-blog.csdnimg.cn/20200206002732147.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- TransactionAspectSupport#invokeWithinTransaction ：

```java
	@Nullable
	protected Object invokeWithinTransaction(Method method, @Nullable Class<?> targetClass,
			final InvocationCallback invocation) throws Throwable {

		// If the transaction attribute is null, the method is non-transactional.
		TransactionAttributeSource tas = getTransactionAttributeSource();
		final TransactionAttribute txAttr = (tas != null ? tas.getTransactionAttribute(method, targetClass) : null);
		final PlatformTransactionManager tm = determineTransactionManager(txAttr);
		final String joinpointIdentification = methodIdentification(method, targetClass, txAttr);

		if (txAttr == null || !(tm instanceof CallbackPreferringPlatformTransactionManager)) {
			// Standard transaction demarcation with getTransaction and commit/rollback calls.
			TransactionInfo txInfo = createTransactionIfNecessary(tm, txAttr, joinpointIdentification);

			Object retVal;
			try {
				// This is an around advice: Invoke the next interceptor in the chain.
				// This will normally result in a target object being invoked.
				retVal = invocation.proceedWithInvocation();
			}
			catch (Throwable ex) {
				// target invocation exception
				completeTransactionAfterThrowing(txInfo, ex);
				throw ex;
			}
			finally {
				cleanupTransactionInfo(txInfo);
			}
			commitTransactionAfterReturning(txInfo);
			return retVal;
		}
		...
```
带 @Transaction 注解的事务函数中捕获到异常后，执行
- TransactionAspectSupport#completeTransactionAfterThrowing

```java
	protected void completeTransactionAfterThrowing(@Nullable TransactionInfo txInfo, Throwable ex) {
		if (txInfo != null && txInfo.getTransactionStatus() != null) {
			if (logger.isTraceEnabled()) {
				logger.trace("Completing transaction for [" + txInfo.getJoinpointIdentification() +
						"] after exception: " + ex);
			}
			if (txInfo.transactionAttribute != null && txInfo.transactionAttribute.rollbackOn(ex)) {
				try {
					txInfo.getTransactionManager().rollback(txInfo.getTransactionStatus());
				}
				catch (TransactionSystemException ex2) {
					logger.error("Application exception overridden by rollback exception", ex);
					ex2.initApplicationException(ex);
					throw ex2;
				}
				catch (RuntimeException | Error ex2) {
					logger.error("Application exception overridden by rollback exception", ex);
					throw ex2;
				}
			}
			else {
				// We don't roll back on this exception.
				// Will still roll back if TransactionStatus.isRollbackOnly() is true.
				try {
					txInfo.getTransactionManager().commit(txInfo.getTransactionStatus());
				}
				catch (TransactionSystemException ex2) {
					logger.error("Application exception overridden by commit exception", ex);
					ex2.initApplicationException(ex);
					throw ex2;
				}
				catch (RuntimeException | Error ex2) {
					logger.error("Application exception overridden by commit exception", ex);
					throw ex2;
				}
			}
		}
	}
```

可以看到，如果设置了事务属性且当前异常满足 rollbackOn 指定的异常（默认为 RuntimeException 类型及其子类以及Error 及其子类），则会将当前事务回滚，否则提交。

因此如果 catch 异常后没有再次将异常抛出或者不手动回滚，将会导致事务提交。

在封装二方接口很多人也会选择 “吞掉” 异常，示意代码如下：

```java
@Component
public class DemoClient {

    @Resource
    private XXServcie xxServcie;

    public XXInfo someMethod(Long id) {
        try {
            return xxServcie.getXXInfo(id);
        } catch (Exception e) {
            log.warn("调用xx服务异常，参数:{}", id, e);
            return null;
        }
    }
}
```
当调用异常时打印异常信息后直接返回 null。

此时如果调用方直接拿到返回值对象而未做判空处理直接使用其属性，易 NPE。

另外由于此处 “吞掉” 了二方接口的异常，有些业务异常中包含的错误原因（如包含xxx敏感词汇、标题不能超过20个字等）无法传给上层再封装给前端，可能会造成出错后用户懵逼，增加很多用户咨询。

比如用户输入了某个敏感词汇，调用二方接口时 “吞掉” 了敏感词汇的业务异常提示（输入中包含 xx敏感词），用户通过技术支持咨询，开发人员要查日志才能知道具体的错误原因（如果此处没打印日志，可能连日志都没得查），非常低效。

开发中要根据具体业务场景慎重确定是否要“吞掉” 异常，一个 “不经意” 的写法可能会造成很多线上咨询甚至线上 BUG。

# 3 循环中的异常处理问题
`特别注意循环的代码异常处理的对程序的影响。`

## 案例1

![](https://img-blog.csdnimg.cn/20200206004731574.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
在写代码时这种场景非常常见，如果不对循环代码进行捕捉，如果循环中出现异常，后续代码则无法执行。

但是如果在 for 循环外部捕捉异常，虽然for循环后如果有代码依然可以执行，但是列表中的非最后一个元素作为参数调用 doSomeRemoteInvoke 出现异常，后续数据无法继续执行。
```java
try {
    for (String str : data) {
        // 远程方法调用（可能出现异常）
        String result = doSomeRemoteInvoke(str);
        System.out.println(result);
    }
} catch (Exception e) {
    log.error("程序出错，参数data:{},错误详情", JSON.toJSONString(data), e);
}
```

因此需要对 for 循环代码内对可能出现的异常进行捕捉：

```java
for (String str : data) {
    try {
        // 远程方法调用（可能出现异常）
        String result = doSomeRemoteInvoke(str);
        System.out.println(result);
    } catch (Exception e) {
        log.error("程序出错，参数data:{},错误详情", JSON.toJSONString(data), e);
    }
}
```

## 案例 2 
思考两个问题：
- 分别调用两个函数 pirntList1 和 printList2 输出的结果有何不同
- 哪个不需要捕捉异常也不会造成中间有一个出错后续处理中断

代码如下：
![](https://img-blog.csdnimg.cn/20200206014222563.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 在函数 pirntList1
![](https://img-blog.csdnimg.cn/20200206014457752.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
和上面的代码非常相似，for 循环在线程池代码外部，每次循环调用线程池去执行判断和打印语句。

此时依次传入 a、ab、abc、abcd 四个字符串；当执行到 ab 时会抛出 IllegalArgumentException，此时线程池中的唯一的线程销毁；当执行到 abc 字符串时，再次在线程池中执行，线程池创建新的线程来执行，依然可以正常执行。
![](https://img-blog.csdnimg.cn/20200206015117943.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 而在函数 pirntList2
![](https://img-blog.csdnimg.cn/20200206014639452.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
中 for 循环在 线程池 execute 参数的lambda表达式内，所有的循环执行都在同一个线程内。当执行到 ab 字符串时，抛出了异常，导致整个线程销毁，无法继续执行。
![](https://img-blog.csdnimg.cn/20200206020252356.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

因此为了不让一个数据出错导致后续的代码都无法执行，如果采用第二种方式来执行可以对代码做出如下修改：
![](https://img-blog.csdnimg.cn/20200206020409740.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
在实际业务开发过程中，这种问题比较隐蔽，尤其是在异步线程中执行时，如果不加留意，很容易出现上面所描述的问题。

# 4 tips
## 慎重思考是否“吞掉” 异常
在二方服务封装时，如捕捉异常，应打印出查询参数和异常详情。
实际开发中，一般都不会吞掉异常，遇到 “吞掉” 异常的场景要慎重思考是否合理。
另外，正如第二部分给出的范例所示，如果调用二方接口出现异常没有打印日志，将对排查问题造成很大的困难。

## 要理解好受检异常和非受检异常的区别
Java 中的异常主要分为两类：受检异常和非受检异常。

根据 [JLS 异常部分的描述](https://docs.oracle.com/javase/specs/jls/se9/html/jls-11.html#jls-11.1)
- 受检异常主要指编译时强制检查的异常，包括非受检异常之外的其他 Throwable 的子类
- 非受检异常主要指编译器免检异常，通常包括运行时异常类和 Error相关类。

![](https://img-blog.csdnimg.cn/20200206021343267.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
Error 和 Exception 都是 Throwable的子类。 RuntimeException 和其子类都属于运行时异常。Error 类和其子类都属于错误类。RuntimeException 及其子类 和 Error类及其子类 属于非受检异常，除此之外的 其他 Throwable 子类属于受检异常。
通常开发中自定义的业务异常（BusinessException）属于非受检异常，会定义为 RuntimeException 的子类。

有些朋友可能会将业务异常定义为受检异常，导致底层抛出后上层调用每层都要被迫处理它。

## 努力使失败保持原子性。
《Effective Java》第 3 版 第 76条 努力使失败保持原子性[^2] 所提到的那样。

我们可以在函数核心代码执行前对参数进行检查，对不满足的条件抛出适当的异常。

实际开发中通常可以使用 com.google.common.base.Preconditions 或者 org.apache.commons.lang3.Validate 第三方库提供的参数检查工具类来实现。

## 如果忽略异常，请给出理由
如果 catch 住异常却没有进行编写任何处理代码，请在注释中给出充分的理由，避免其他人产生困惑，避免留坑。

大家可以参考 org.springframework.context.support.AbstractApplicationContext#close 源码：
![](https://img-blog.csdnimg.cn/20200206021818756.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

上面的源码捕捉到 IllegalStateException 异常以后没有处理，给出了处理方式和原因: 忽略此异常，因为虚拟机已经正在关闭。

# 5.总结
本节主要讲异常的一些处理建议，包括是否要 “吞掉” 异常，循环中的异常处理，以及一些补充建议。希望大家可以重视异常，少趟坑。

# 参考
- 阿里巴巴Java 开发手册 华山版
- 《Effective Java 中文版 (原书第 3 版)》