# 1 MySQL锁
## 1.1 表锁
- 开销小，加锁快
- 不会出现死锁
- 锁定粒度大，发生锁冲突的概率最高，并发度最低

## 1.2 行锁
- 开销大，加锁慢
- 会出现死锁
- 锁定粒度小，发生锁冲突的概率最低，并发度最高

## 1.3 页锁
- 开销和加锁时间介于表锁和行锁之间
- 会出现死锁
- 锁定粒度介于表锁和行锁之间，并发度一般

## 1.4 引擎与锁
- ` MyISAM`和MEMORY`支持表锁`
- BDB支持页锁,也支持表锁
- `Innodb`既支持行锁，也支持表锁，`默认行锁`


## 1.5 查询表锁争用情况
检查`table_locks_waited`和`table_locks_immediate`状态变量分析
- table_locks_immediate : 可以立即获取锁的次数
- table_locks_waited : 不能立即获取锁，需要等待锁的次数

![image](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMzY5NmUyN2ZmYTk3YjBkZg)

![image](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtNDZiZDg5NzI2MmNmZWExZQ)

> table_locks_waited 的值越高，则说明存在严重的表级锁的争用情况


# 2 MyISAM的表锁
ＭySQL的表锁有两种模式
- 表共享读锁（Table Read Lock）
- 表独占写锁（Table Write Lock）

## 2.1 表锁兼容性
锁模式的兼容：
| 是否兼容 | 请求none | 请求读锁 | 请求写锁 |
| --- | --- | --- | --- |
| 当前处于读锁 | 是 | 是 | 否 |
| 当前处于写锁 | 是 | 否 | 否 |

> ＭyISAM表的读操作不会阻塞其他用户对同一表的读请求，但会阻塞对同一表的写请求。
ＭyISAM表的写操作会阻塞其他用户对同一表的读和写请求。
ＭyISAM表的读和写操作之间，以及写和写操作之间是串行的。即当某一线程获得对一个表的写锁后，只有持有锁的线程可对表进行更新，其他线程的读、写操作都会阻塞，直到锁被释放为止。

## 2.2 如何加表锁
对于 **MyISAM** 引擎
- 执行`select`前，会自动给涉及的所有表加 **读**
- 执行更新（update,delete,insert)会自动给涉及到的表加 **写**

无需直接显式用`lock table`命令。

对于给MyISAM显式加锁，**一般是为了模拟事务操作，实现对某一个时间点多个表一致性读取**

### 2.2.1  实例
- 订单表 **orders**
记录各订单的总金额`total`

- 订单明细表 **order_detail**
记录各订单每一产品的金额小计`subtotal`

假设需检查这两个表的金额合计是否相符，可能执行如下SQL

```sql
Select sum(total) from orders;
Select sum(subtotal) from order_detail;
```

如果不先给这两个表加锁，就可能产生错误的结果：因为第一条语句执行过程中，`order_detail`表可能已发生改变：
因此,正确写法应该如下

```sql
Lock tables orders read local, order_detail read local;
Select sum(total) from orders;
Select sum(subtotal) from order_detail;
Unlock tables;
```

在`Lock tables`时加的 **local** 选项，以满足MyISAM表并发插入时，允许其他用户在表尾插入记录。

在用`Lock tables`给表显式加表锁时，必须同时取得所有涉及表的锁，并且MySQL不支持锁升级：即在执行`Lock tables`后，只能访问显式加锁的这些表，不能访问未加锁的表；
同时，如果加的是读锁，那么只能执行查询，而不能执行更新。在自动加锁情况下也这样，MySQL会一次获得SQL语句所需要的全部锁，这也正是MyISAM表不会死锁的原因。

## 2.3  tips
当使用`lock tables`时,不仅需要一次锁定用到的所有表
且同一表在SQL语句中出现多少次,就要通过与SQL语句中别名锁多少次
```
lock table actor read
```
会提示错误
```
select a.first_name.....
```
需要对别名分别锁定
```
lock table actor as a read,actor as b read;
```

# 3 MyISAM的并发锁
在一定条件下，`MyISAM`也支持并发插入和读取

## 3.1 系统变量 : concurrent_insert
控制其并发插入的行为,其值分别可以为
*   0 不允许并发插入,所有插入对表加互斥锁
*   1 只要表中无空洞,就允许并发插入.
MyISAM允许在一个读表的同时，另一个进程从表尾插入记录(MySQL的默认设置)
*   2 无论MyISAM表中有无空洞,都强制在表尾并发插入记录
若无读线程,新行插入空洞中

可以利用`MyISAM`的并发插入特性，来解决应用中对同表查询和插入的锁争用
例如,将`concurrent_insert`系统变量设为2，总是允许并发插入;
同时,通过定期在系统空闲时段执行OPTIONMIZE TABLE语句来整理空间碎片，收到因删除记录而产生的中间空洞

`删除操作`不会重整整个表,只是把 行 标记为删除,在表中留下`空洞`
MyISAM倾向于在可能时填满这些空洞,插入时就会重用这些空间,无空洞则把新行插到表尾

## 3.2  MyISAM的锁调度
`MyISAM`的读和写锁互斥,读操作串行的

- 一个进程请求某个`MyISAM`表的读锁,同时另一个进程也请求同表的写锁，MySQL如何处理呢？
写进程先获得锁!!! 
不仅如此,即使读进程先请求先到锁等待队列,写请求后到,写锁也会插到读请求之前!!!

这是因为MySQL认为`写请求一般比读请求重要`
这也正是`MyISAM`表`不适合有大量更新 / 查询`操作应用的原因
大量的更新操作会造成查询操作很难获得读锁,从而可能永远阻塞

幸好,我们可以通过一些设置来调节`MyISAM`的调度行为
*   指定启动参数`low-priority-updates`
使MyISAM引擎默认给予读请求以优先权利
*   执行命令`SET LOW_PRIORITY_UPDATES=1`
使该连接发出的更新请求优先级降低
*   指定INSERT、UPDATE、DELETE语句的`LOW_PRIORITY`属性
降低该语句的优先级

虽然上面3种方法都是要么更新优先，要么查询优先，但还是可以用其来解决查询相对重要的应用（如用户登录系统）中，读锁等待严重的问题

另外，MySQL也提供了一种折中的办法来调节读写冲突;
即给系统参数`max_write_lock_count`设置一个合适的值;
当一个表的读锁达到这个值后，MySQL便暂时将写请求的优先级降低，给读进程一定获得锁的机会

# 4 InnoDB锁
InnoDB与MyISAM的最大不同有两点
- 支持事务
- 采用行锁

行级锁和表级锁本来就有许多不同之处，另外，事务的引入也带来了一些问题。

### 查看Innodb行锁争用情况
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTI3YzQzMDJiMzllYjY5MDQucG5n)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTNiMjVjZmM1ZWVhNzg0Y2MucG5n)
>如果发现争用比较严重，如`Innodb_row_lock_waits`和`Innodb_row_lock_time_avg`的值比较高

### 查询information_schema相关表来查看锁情况
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTgwNmRkNGMwZjI3NGQ3MmEucG5n)

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LThlYjgyYmU2NThkYzQwMTkucG5n)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTJlYzI1MGVmNjJmNDhkYWYucG5n)

### 设置Innodb monitors
进一步观察发生锁冲突的表，数据行等，并分析锁争用的原因
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWM4OTk1MDM0ODQ5MzNiNTcucG5n)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTAwMTA3MGU1NDIwNWM4ZTEucG5n)
### 停止监视器
![drop table innodb_monitor](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTQxYzVlMzc2MmE3MWU1YWQucG5n)

默认情况每15秒会向日志中记录监控的内容;
如果长时间打开会导致.err文件变得非常巨大;
所以确认原因后,要删除监控表关闭监视器,或者通过使用--console选项来启动服务器以关闭写日志功能

## 4.4  InnoDB的行锁
InnoDB支持以下两种类型的`行锁`
- 共享锁（读锁S）
若事务 T 对数据对象 A 加了 S 锁;
则事务 T 可以读 A 但不能修改 A;
其它事务只能再对它加 S 锁,而不能加 X 锁,直到 T 释放 A 上的 S 锁;
这保证了,其他事务可以读 A，但在事务 T 释放 S 锁之前，不能对 A 做任何修改操作.
- 排他锁（写锁X）
若事务 T 对数据对象A加 X 锁;
事务 T 可以读 A 也可以修改 A;
其他事务不能对 A 加任何锁,直到 T 释放 A 上的锁;
这保证了,其他事务在 T 释放 A 上的锁之前不能再读取和修改 A .

>MySQL InnoDB默认行级锁
行级锁都是基于索引的,若一条SQL语句用不到索引是不会使用行级锁的,会使用表级锁把整张表锁住


为了允许行/表锁共存，实现多粒度锁，InnoDB还有两种内部使用的：
### 意向锁（Intention Locks）
这两种意向锁都是表级锁：
- 意向共享锁（IS）
事务打算给数据行共享锁，事务在给一个数据行加共享锁前必须先取得该表的IS锁
- 意向排他锁（IX）
事务打算给数据行加排他锁，事务在给一个数据行加排他锁前必须先取得该表的IX锁

| 当前锁/是否兼容/请求锁 | X | IX | S | IS |
| --- | --- | --- | --- | --- |
| X | 冲突 | 冲突 | 冲突 | 冲突 |
| IX | 冲突 | 兼容 | 冲突 | 兼容 |
| S | 冲突 | 冲突 | 兼容 | 兼容 |
| IS | 冲突 | 兼容 | 兼容 | 兼容 |

如果一个事务请求的锁模式与当前锁兼容，InnoDB就请求的锁授予该事务，反之如果两者不兼容，该事务就要等待锁释放

意向锁是InnoDB自动加的，不需用户干预.
对于UPDATE、DELETE和INSERT语句，InnoDB会自动给涉及及数据集加排他锁（Ｘ）;
对于普通SELECT语句，InnoDB不会加任何锁.


对于SELECT语句,可以通过以下语句显式地给记录加读/写锁
- 共享锁（Ｓ）
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWE4Mjg0M2FiNTQ5MWM2YzgucG5n)

*   排他锁（X）
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTcyMjMzNzUyNTU5M2FhYWYucG5n)
共享锁语句主要用在需要数据依存关系时确认某行记录是否存在;
并确保没有人对这个记录UPDATE或DELETE.
但如果当前事务也需要对该记录进行更新,则很有可能造成死锁;
对于锁定行记录后需要进行更新操作的应用,应该使用排他锁语句.

此外还有自增锁（auto-in）和 lock tables/DDL等表级锁
查看锁：
```sql
SHOW ENGINE INNODB STATUS;
```
## 4.5 实例
### 4.5.1  Innodb共享锁
| session_1 | session_2 |
| --- | --- |
| set autocommit=0,select * from actor where id =1 | set autocommit=0,select * from actor where id =1 |
| 当前seesion对id为1的记录加入共享锁 select * from actor where id =1 lock in share mode |  |
|  | 其他seesion仍然可以查询，并对该记录加入 select * from actor where id =1 lock in share mode |
| 当前session对锁定的记录进行更新，等待锁 update。。。where id=1 |  |
|  | 当前session对锁定记录进行更新，则会导致死锁退出 update。。。where id=1 |
| 获得锁，更新成功 |

### 4.5.2  Innodb排他锁
| session_1 | session_2 |
| --- | --- |
| set autocommit=0,select * from actor where id =1 | set autocommit=0,select * from actor where id =1 |
| 当前seesion对id为1的记录加入for update 共享锁 select * from actor where id =1 for update |  |
|  | 可查询该记录select *from actor where id =1,但是不能再记录共享锁，会等待获得锁select *from actor where id =1 for update |
| 更新后释放锁 update。。。 commit |  |
|  | 其他session，获得锁，得到其他seesion提交的记录 |

## 4.6 行锁的实现
行锁是通过给索引上的索引项加锁来实现
如果没有索引，InnoDB将通过隐藏的聚簇索引来对记录加锁
*   Record Locks:对索引项加锁
*   Gap lock:对索引项之的“间隙“，第一条记录前的”间隙“，或最后一条记录后的”间隙“，加锁
*   Next-key lock：前两种的组合，对记录及其前面的间隙加锁

行锁实现特点意味着：
`如果不通过索引条件检索数据,那么Innodb将对表的所有记录加锁，和表锁一样`

### 间隙锁（Next-Key锁）
当我们用范围条件而不是相等条件检索数据,并请求共享或排他锁时,InnoDB会给符合条件的已有数据的索引项加锁;
对于键值在条件范围内但并不存在的记录,叫做“间隙(GAP)”,InnoDB也会对这个“间隙”加锁,这种锁机制就是所谓的间隙锁（Next-Key锁）.

举例来说，假如emp表中只有101条记录，其empid的值分别是1,2,...,100,101，下面的SQL：
InnoDB 不仅会对符合条件的 empid 值为 101 的记录加锁;
也会对 `empid`大于`101`（这些记录并不存在）的“间隙”加锁
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWNiNDY5YzhiNWNlN2VmZGMucG5n)
#### 作用
- 防止幻读,以满足相关隔离级别的要求
对于上例,若不使用间隙锁,如果其他事务插入 empid 大于 100 的任何记录,;
那么本事务如果再次执行上述语句,就会发生幻读
- 满足其恢复和复制的需要
在使用范围条件检索并锁定记录时;
InnoDB 这种加锁机制会阻塞符合条件范围内键值的并发插入,这往往会造成严重的锁等待;
因此,在实际开发中,尤其是并发插入较多的应用;
我们要尽量优化业务逻辑,尽量使用`相等条件来访问更新数据`,避免使用范围条件.

## 4.7 when 使用表锁
对于InnoDB,在绝大部分情况下都应该使用行锁
因为`事务`,`行锁`往往是我们选择InnoDB的理由

但在个别特殊事务中,也可以考虑`使用表锁`
* 事务需要更新大部分数据，表又较大
若使用默认的行锁,不仅该事务执行效率低(因为需要对较多行加锁,加锁是需要耗时的);
而且可能造成其他事务长时间锁等待和锁冲突;
这种情况下可以考虑使用表锁来提高该事务的执行速度
* 事务涉及多个表，较复杂，很可能引起死锁，造成大量事务回滚
这种情况也可以考虑一次性锁定事务涉及的表，从而避免死锁、减少数据库因事务回滚带来的开销

当然，应用中这两种事务不能太多，否则，就应该考虑使用`ＭyISAＭ`

 在InnoDB下 ,使用表锁要注意
- 使用`LOCK TALBES`虽然可以给`InnoDB`加表锁
表锁不是由`InnoDB`引擎层管理的,而是由其上一层ＭySQL Server负责;
仅当`autocommit=0、innodb_table_lock=1（默认设置）`,InnoDB 引擎层才知道MySQL加的表锁,ＭySQL Server才能感知InnoDB加的行锁;
这种情况下，InnoDB才能自动识别涉及表锁的死锁
否则，InnoDB将无法自动检测并处理这种死锁
- 在用`LOCK TALBES`对`InnoDB`锁时要注意,要将`autocommit`设为0，否则ＭySQL不会给表加锁
事务结束前,不要用`UNLOCK TALBES`释放表锁,因为它会隐式地提交事务
COMMIT或ROLLBACK不能释放用`LOCK TALBES`加的表锁，必须用UNLOCK TABLES释放表锁，正确的方式见如下语句
- 需要写表t1并从表t读
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTk2NDgyZmY2ODlkNzc1NzUucG5n)
# 5 死锁
**ＭyISAM表锁是deadlock free的，这是因为ＭyISAM总是一次性获得所需的全部锁，要么全部满足，要么等待，因此不会出现死锁**

但在InnoDB中，除单个SQL组成的事务外，锁是逐步获得的，这就决定了InnoDB发生死锁是可能的

发生死锁后，InnoDB一般都能自动检测到，并使一个事务释放锁并退回，另一个事务获得锁，继续完成事务

- 但在涉及外部锁，或涉及锁的情况下，InnoDB并不能完全自动检测到死锁
**这需要通过设置锁等待超时参数innodb_lock_wait_timeout来解决**
需要说明的是，这个参数并不是只用来解决死锁问题，在并发访问比较高的情况下，如果大量事务因无法立即获取所需的锁而挂起，会占用大量计算机资源，造成严重性能问题，甚至拖垮数据库
我们通过设置合适的锁等待超时阈值，可以避免这种情况发生。

通常来说，死锁都是应用设计的问题，通过调整业务流程、数据库对象设计、事务大小、以及访问数据库的SQL语句，绝大部分都可以避免

下面就通过实例来介绍几种死锁的常用方法。
- 应用中，不同的程序会并发存取多个表
尽量约定以`相同的顺序`访问表
- 程序批处理数据时
`事先对数据排序`,保证每个线程按固定的顺序来处理记录
- 在事务中,要更新记录
应`直接申请排他锁,而不应该先申请共享锁`
- 在`可重复读`下,如果两个线程同时对相同条件记录用`SELECT...ROR UPDATE`加排他写锁
在没有符合该记录情况下，两个线程都会加锁成功
程序发现记录尚不存在，就试图插入一条新记录，如果两个线程都这么做，就会出现死锁
这种情况下，将隔离级别改成READ COMMITTED，就可以避免问题
- 当隔离级别为READ COMMITED时，如果两个线程都先执行`SELECT...FOR UPDATE`
判断是否存在符合条件的记录，没有 -> 插入记录;
此时，只有一个线程能插入成功，另一个线程会出现锁等待.
当第１个线程提交后，第２个线程会因主键重出错，但虽然这个线程出错了，却会获得一个排他锁！这时如果有第３个线程又来申请排他锁，也会出现死锁.
对于这种情况，可以直接做插入操作，然后再捕获主键重异常，或者在遇到主键重错误时，总是执行ROLLBACK释放获得的排他锁

**如果出现死锁，可以用SHOW INNODB STATUS命令来确定最后一个死锁产生的原因和改进措施。**

# 6 总结
## 6.1 **MyISAM**的表锁
- 共享读锁之间是兼容的,但`共享读锁和排他写锁`之间,以及`排他写锁之间`互斥,即读写串行
- 在一定条件下,`ＭyISAM`允许查询/插入并发,可利用这一点来解决应用中对同一表查询/插入的锁争用问题
- `ＭyISAM`默认的锁调度机制是写优先,这并不一定适合所有应用,用户可以通过设置`LOW_PRIPORITY_UPDATES`参数或在INSERT、UPDATE、DELETE语句中指定`LOW_PRIORITY`选项来调节读写锁的争用
- 由于表锁的锁定粒度大,读写又是串行的,因此如果更新操作较多,`ＭyISAM`表可能会出现严重的锁等待,可以考虑采用InnoDB表来减少锁冲突

## 6.2 对于**InnoDB表**
- 行锁基于索引实现
如果不通过索引访问数据,InnoDB会使用表锁
- 间隙锁机制及使用间隙锁的原因
- 不同的隔离级别下，InnoDB的锁机制和一致性读策略不同
- ＭySQL的恢复和复制对InnoDB锁机制和一致性读策略也有较大影响
- 锁冲突甚至死锁很难完全避免

# 7 索引与锁
在了解InnoDB的锁特性后，用户可以通过设计和SQL调整等措施减少锁冲突和死锁
*   尽量使用较低的隔离级别
*   精心设计索引，并尽量使用索引访问数据，使加锁更精确，从而减少锁冲突的机会。


利用索引优化锁
- 索引可以减少锁定的行数
- 索引可以加快处理速度,同时也加快了锁的释放


*   选择合理的事务大小，小事务发生锁冲突的几率也更小
*   给记录集显式加锁时，最好一次性请求足够级别的锁。比如要修改数据的话，最好直接申请排他锁，而不是先申请共享锁，修改时再请求排他锁，这样容易产生死锁。
*   不同的程序访问一组表时，应尽量约定以相同的顺序访问各表，对一个表而言，尽可能以固定的顺序存取表中的行。这样可以大减少死锁的机会。
*   尽量用相等条件访问数据，这样可以避免间隙锁对并发插入的影响。
*   不要申请超过实际需要的锁级别；除非必须，查询时不要显示加锁。
*   对于一些特定的事务，可以使用表锁来提高处理速度或减少死锁的可能

## 索引的维护和优化
删除重复和冗余的索引
primary key(id) ,unique key (id) ，index(id)
主键索引、唯一索引、单列索引

- 注意加粗的联合索引
Index(a),**index(a,b)**
primary key(id),**index(a,id)**


- 删除重复和冗余的索引
![](https://img-blog.csdnimg.cn/20210219154350316.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
查找未被使用过的索引
![](https://img-blog.csdnimg.cn/20210219154317840.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 更新索引统计信息及减少索引碎片
analyze table    table_ name
optimize table table_ name
使用不当会导致锁表

> 参考
> - [MySQL中的锁（表锁、行锁）](https://www.cnblogs.com/chenqionghe/p/4845693.html)
> - https://developer.aliyun.com/article/3780