# 1 前言
很多需要使用事务的场景，都只是在方法上直接添加个`@Transactional`注解
![](https://img-blog.csdnimg.cn/20201113124942738.png#pic_center)
**但是，你以为这真的够了吗？**

事务如果未达到完美效果，在开发和测试阶段都难以被发现，因为你难以考虑到太多意外场景。但当业务数据量发展，就可能导致大量数据不一致的问题，就会造成前人栽树后人踩坑，需要大量人力排查解决问题和修复数据。

# 2 如何确认Spring事务生效了？
使用`@Transactional`一键开启声明式事务， 这就真的事务生效了？过于信任框架总有“意外惊喜”。来看如下案例
### 领域层
#### 实体
![](https://img-blog.csdnimg.cn/20210206225925639.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20210206230331301.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

#### 领域服务
- `createUserError1`调用private方法
![](https://img-blog.csdnimg.cn/20210207213945975.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- createUserPrivate，被`@Transactional`注解。当传入的用户名包含`test`则抛异常，让用户的创建操作失败
![](https://img-blog.csdnimg.cn/20201116223137819.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
- getUserCount
![](https://img-blog.csdnimg.cn/20201116223600764.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
### 用户接口层
调用UserService#`createUserError1`
![](https://img-blog.csdnimg.cn/20210206233642484.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- 测试结果
即便用户名不合法，用户也能创建成功。刷新浏览器，多次发现有十几个的非法用户注册。

## @Transactional生效原则
### public方法
除非特殊配置（比如使用AspectJ静态织入实现AOP），**@Transactional**必须定义在public方法才生效。

因为Spring的AOP，private方法无法被代理到，自然也无法动态增强事务处理逻辑。

那简单，把**createUserPrivate**方法改为public不就行了。
但发现事务依旧**未生效**。

### 必须通过代理过的类从外部调用目标方法
要调用增强过的方法必然是调用代理后的对象。
尝试修改UserService，注入一个self，然后再通过self实例调用标记有 **@Transactional** 注解的createUserPublic方法。设置断点可以看到，self是由Spring通过CGLIB方式增强过的类：
![](https://img-blog.csdnimg.cn/20210207164512699.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
CGLIB通过继承实现代理类，private方法在子类不可见，所以无法进行事务增强。而this指针代表调用对象本身，Spring不可能注入this，所以通过this访问方法必然不是代理。
把this改为self，这时即可验证事务生效：非法的用户注册操作可回滚。

虽然在UserDomainService内部注入自己调用自己的createUserPublic可正确实现事务，但这不符常规。更合理的实现方式是，让Controller直接调用之前定义的UserService的createUserPublic方法。
![](https://img-blog.csdnimg.cn/20210207165532655.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## this/self/Controller调用UserDomainService
![](https://img-blog.csdnimg.cn/20201116225531888.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- this自调用
无法走到Spring代理类
- 后两种
调用的Spring注入的UserService，通过代理调用才有机会对createUserPublic方法进行动态增强。

> 推荐开发时打开Debug日志以了解Spring事务实现的细节。
比如JPA数据库访问，开启Debug日志：
`logging.level.org.springframework.orm.jpa=DEBUG`

开启日志后再比较下在UserService中this调用、Controller中通过注入的UserService Bean调用createUserPublic的区别。

很明显，this调用因没走代理，事务没有在`createUserPublic`生效，只在Repository的`save`生效：

```java
// 在UserService中通过this调用public的createUserPublic
[23:04:30.748] [http-nio-45678-exec-5] [DEBUG] [o.s.orm.jpa.JpaTransactionManager:370 ] - 
Creating new transaction with name [org.springframework.data.jpa.repository.support.SimpleJpaRepository.save]: 
PROPAGATION_REQUIRED,ISOLATION_DEFAULT

[DEBUG] [o.s.orm.jpa.JpaTransactionManager       :370 ] - Creating new transaction with name [org.springframework.data.jpa.repository.support.SimpleJpaRepository.save]: PROPAGATION_REQUIRED,ISOLATION_DEFAULT
//在Controller中通过注入的UserService Bean调用createUserPublic
[10:10:47.750] [http-nio-45678-exec-6] [DEBUG] [o.s.orm.jpa.JpaTransactionManager       :370 ] - Creating new transaction with name [org.geekbang.time.commonmistakes.transaction.demo1.UserService.createUserPublic]: PROPAGATION_REQUIRED,ISOLATION_DEFAULT
```
这种实现在Controller里处理异常显得繁琐，还不如直接把`createUserWrong2`加`@Transactional`注解，然后在`Controller`中直接调用该方法。
这既能从外部（Controller中）调用UserService方法，方法又是public的能够被动态代理AOP增强。

## 小结
务必确认调用被`@Transactional`注解标记的方法被`public`修饰，并且是通过Spring注入的Bean进行调用。

但有时因没有正确处理异常，导致事务即便生效也不一定能回滚。

# 2 事务生效不代表能正确回滚
AOP实现事务：使用try/catch包裹`@Transactional`注解的方法：
- 当方法出现异常并满足**一定条件**，在catch里可设置事务回滚
- 没有异常则直接提交事务

## 一定条件
只有异常传播出了标记了`@Transactional`注解的方法，事务才能回滚。

Spring的TransactionAspectSupport#invokeWithinTransaction就是在处理事务。可见，只有捕获到异常后才能进行后续事务处理：
![](https://img-blog.csdnimg.cn/20210207210542836.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
默认情况下，出现RuntimeException（非受检异常）或Error，Spring才会回滚事务。

Spring的DefaultTransactionAttribute：
- 受检异常一般是业务异常或类似另一种方法的返回值，出现这种异常可能业务还能完成，所以不会主动回滚
- 而Error或RuntimeException代表非预期结果，应该回滚
![](https://img-blog.csdnimg.cn/20210207213319889.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
# 事务无法正常回滚的各种惨案 
## 异常无法传播出方法
![](https://img-blog.csdnimg.cn/2021020721574291.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 受检异常
注册的同时会有一次文件读，若读文件失败，希望用户注册的DB操作回滚。因读文件抛的是受检异常，createUserError2传播出去的也是受检异常
![](https://img-blog.csdnimg.cn/20210207222108619.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210207222202446.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
以上方法虽然避开了事务不生效的坑，但因异常处理不当，导致异常时依旧不回滚事务。

## 修复回滚失败bug
### 1 手动设置让当前事务处回滚态
若希望自己捕获异常并处理，可手动设置让当前事务处回滚态
![](https://img-blog.csdnimg.cn/20210207223516636.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
查看日志，事务确定回滚。
> `Transactional code has requested rollback`：手动请求回滚。
![](https://img-blog.csdnimg.cn/20201117212046958.png#pic_center)![](https://img-blog.csdnimg.cn/20201117212204857.png#pic_center)
### 2 注解中声明，期望所有Exception都回滚事务
- 突破**默认不回滚受检异常**的限制
![](https://img-blog.csdnimg.cn/20201117214047682.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
- 查看日志，提示回滚：
![](https://img-blog.csdnimg.cn/20201117214205401.png#pic_center)
该案例有DB操作、IO操作，在IO操作问题时期望DB事务也回滚，以确保逻辑一致性。

## 小结
由于异常处理不正确，导致虽然事务生效，但出现异常时没回滚。
Spring默认只对被`@Transactional`注解的方法出现`RuntimeException`和`Error`时回滚，所以若方法捕获了异常，就需要通过手写代码处理事务回滚。
若希望Spring针对其他异常也可回滚，可相应配置`@Transactional`注解的`rollbackFor`和`noRollbackFor`属性覆盖Spring的默认配置。

> 有些业务可能包含多次DB操作，不一定希望将两次操作作为一个事务，这时就需仔细考虑事务传播的配置。

# 3 事务传播配置是否符合业务逻辑
## 案例
用户注册：会插入一个主用户到用户表，还会注册一个关联的子用户。期望将子用户注册的DB操作作为一个独立事务，即使失败也不影响注册主用户的流程。

- UserService：创建主、子用户
![](https://img-blog.csdnimg.cn/20201117215231616.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

- SubUserService：使子用户注册失败。期望子用户注册作为一个事务单独回滚而不影响注册主用户
![](https://img-blog.csdnimg.cn/20201117215759910.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- 启动调用后查看日志：事务回滚了
![](https://img-blog.csdnimg.cn/20201117221137343.png#pic_center)
不对呀！因为运行时异常逃出被`@Transactional`注解的`createUserWrong`，Spring当然会回滚事务。若期望主方法不回滚，应捕获子方法所抛的异常。
### 修正方案
把`subUserService#createSubUserWithExceptionError`包上catch，这样外层主方法`createUserError2`就不会出现异常
![](https://img-blog.csdnimg.cn/20201117222417198.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

启动后查看日志注意到：
- 对`createUserError2`开启异常处理
- 子方法因出现运行时异常，标记当前事务为回滚
- 主方法捕获异常并打印`create sub user error`
- 主方法提交事务

但Controller出现一个`UnexpectedRollbackException`，异常描述提示最终该事务回滚了且为静默回滚：因`createUserError2`本身并无异常，只不过提交后发现子方法已把当前事务设为回滚，无法完成提交。

**明明无异常发生，但事务也不一定可提交**
因为主方法注册主用户的逻辑和子方法注册子用户的逻辑为同一事务，子逻辑标记了事务需回滚，主逻辑自然也无法提交。
那么修复方式就明确了，独立子逻辑的事务，即修正SubUserService注册子用户方法，为注解添加`propagation = Propagation.REQUIRES_NEW`设置`REQUIRES_NEW`事务传播策略。即执行到该方法时开启新事务，并挂起当前事务。
创建一个新事务，若存在则暂停当前事务。类似同名的EJB事务属性。
注：实际事务暂停不会对所有事务管理器外的开箱。 这特别适于`org.springframework.transaction.jta.JtaTransactionManager` ，这就需要`javax.transaction.TransactionManager`被提供给它（这是服务器特定的标准Java EE）
![](https://img-blog.csdnimg.cn/20201117225930918.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- 主方法无变化，依旧需捕获异常，防止异常外泄导致主事务回滚，重命名为`createUserRight`：
![](https://img-blog.csdnimg.cn/20201117230327604.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

修正后再查看日志

- Creating new transaction with name createUserRight
对`createUserRight`开启主方法事务
- createMainUser finish
创建主用户完成
- Suspending current transaction, creating new transaction with name createSubUserWithExceptionRight
主事务挂起，开启新事务，即对`createSubUserWithExceptionRight`创建子用户的逻辑
- Initiating transaction rollback
子方法事务回滚
- Resuming suspended transaction after completion of inner transaction
子方法事务完成，继续主方法之前挂起的事务
- create sub user error:invalid status
主方法捕获到了子方法的异常
- Committing JPA transaction on EntityManager
主方法的事务提交了，随后我们在Controller里没看到静默回滚异常

## 小结
若方法涉及多次DB操作，并希望将它们作为独立事务进行提交或回滚，即需考虑细化配置事务传播方式，即配置`@Transactional`注解的`Propagation`属性。

#  4 总结
若要针对private方法启用事务，动态代理方式的AOP不可行，需要使用静态织入方式的AOP，也就是在编译期间织入事务增强代码，可以配置Spring框架使用AspectJ来实现AOP。