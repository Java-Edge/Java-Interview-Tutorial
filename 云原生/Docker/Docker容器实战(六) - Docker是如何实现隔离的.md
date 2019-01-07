# 1 Namespace
## 1.1 容器为何需要进程隔离
- 被其他容器修改文件，导致安全问题
- 资源的并发写入导致不一致性
- 资源的抢占，导致其他容器被影响

```bash
docker run -it --name demo_docker busybox /bin/sh
/ # ps -ef
```
![](https://img-blog.csdnimg.cn/20200923172437444.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

在宿主机查看进程ID

```bash
ps -ef|grep busybox
```
真实的 docker 容器 pid
![](https://img-blog.csdnimg.cn/20200923173033582.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
这就是进程资源隔离表象：
- 对于宿主机 `docker run` 启动的只是一个进程，它的pid是44451
- 而容器程序本身被隔离了，容器的内部都只能看到自己内部的进程
- 这其实是基于Linux的Namespace技术（即使是 Windows 版本的 Docker 也是依托于 Windows 实现的类似Namespace的技术）

## 1.2 Linux Namespace
Linux 命名空间对全局操作系统资源进行了抽象，对于命名空间内的进程来说，他们拥有独立的资源实例，在命名空间内部的进程可以实现资源可见。
对于命名空间外部的进程，则不可见，实现了资源的隔离。这种技术广泛的应用于容器技术里。

`Namespace实际上修改了应用进程看待整个计算机“视图”，即它的“视线”被操作系统做了限制，只能“看到”某些指定的内容`。对于宿主机来说，这些被“隔离”了的进程跟其他进程并没有区别。

## 1.3 Docker Engine 使用了如下 Linux 的隔离技术
- The pid namespace：管理 PID namespace (PID: Process ID)
- The net namespace: 管理网络namespace(NET: Networking)
- The ipc namespace: 管理进程间通信命名空间(IPC: InterProcess Communication)
- The mnt namespace：管理文件系统挂载点命名空间(MNT: Mount).
- The uts namespace: Unix 时间系统隔离(UTS: Unix Timesharing
System).

## 1.4 进程资源隔离原理
Linux Namespaces是Linux创建新进程时的一个可选参数，在Linux系统中创建进程的系统调用是clone()方法。

```c
int clone(int (*fn) (void *)，void *child stack,
int flags， void *arg， . . .
/* pid_ t *ptid, void *newtls, pid_ t *ctid */ ) ;
```

通过调用该方法，这个进程会获得一个独立的进程空间，它的pid是1 ,并且看不到宿主机上的其他进程，也就是在容器内执行PS命令的结果。

不应该把Docker Engine或者任何容器管理工具放在跟Hypervisor相同的位置，因为它们并不像Hypervisor那样对应用进程的隔离环境负责，也不会创建任何实体的“容器”，真正对隔离环境负责的是宿主机os：
![](https://img-blog.csdnimg.cn/20210112193730251.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190922013040574.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
该对比图应该把Docker画在跟应用同级别并且靠边的位置。
用户运行在容器里的应用进程，跟宿主机上的其他进程一样，都由宿主机操作系统统一管理，只不过这些被隔离的进程拥有额外设置过的Namespace参数，Docker在这里更多的是辅助和管理工作。

这也解释了
### 为何Docker项目比虚拟机更好?
使用虚拟化技术作为应用沙盒，就必须由Hypervisor负责创建虚拟机，这个虚拟机是真实存在的，它里面必须运行一个完整的Guest OS才能执行用户的应用进程。这就不可避免地带来额外的资源消耗和占用。

> 据实验，一个运行着CentOS的KVM虚拟机启动后，在不做优化的情况下，虚拟机自己就需要占用100~200 MB内存。此外，用户应用运行在虚拟机里面，它对宿主机操作系统的调用就不可避免地要经过虚拟化软件的拦截和处理，这本身又是一层性能损耗，尤其对计算资源、网络和磁盘I/O的损耗非常大。

而容器化后的用户应用，依然还是宿主机上的一个普通进程，这就意味着这些因为虚拟化而带来的性能损耗都不存在。
使用Namespace作为隔离手段的容器无需单独的Guest OS，使得容器额外的资源占用可忽略不计。

“敏捷”和“高性能”是容器相较于虚拟机最大的优势。

有利必有弊，基于 Namespace 的隔离机制相比虚拟化技术也有很多不足。
## 1.5 Namespace的缺点
### 隔离不彻底
- 多容器间使用的还是同一宿主机os内核
尽管可在容器里通过 `Mount Namespace` 单独挂载其他不同版本的os文件，比如 CentOS 或者 Ubuntu，但这并不能改变共享宿主机内核的事实!
所以不可能在Windows宿主机运行Linux容器或在低版本Linux宿主机运行高版本Linux容器。
而拥有硬件虚拟化技术和独立Guest OS的虚拟机，比如Microsoft的云计算平台Azure，就是运行于Windows服务器集群，但可在其上面创建各种Linux虚拟机。

- Linux内核很多资源无法被Namespace
最典型的比如时间。
若你的容器中的程序使用`settimeofday(2)`系统调用修改时间，整个宿主机的时间都会被随之修改，这并不符合用户预期。
而相比于在虚拟机里可自己随便折腾，在容器里部署应用时，“什么能做，什么不能做”，用户都必须考虑。

尤其是**共享宿主机内核**：

- 容器给应用暴露出来的攻击面是相当大的
应用“越狱”难度也比虚拟机低得多。
尽管可使用Seccomp等技术，过滤和甄别容器内部发起的所有系统调用来进行安全加固，但这就多了一层对系统调用的过滤，一定会拖累容器性能。默认情况下，也不知道到底该开启哪些系统调用，禁止哪些系统调用。
所以，在生产环境中，无人敢把运行在物理机上的Linux容器直接暴露至公网。

>基于虚拟化或者独立内核技术的容器实现，则可以比较好地在隔离与性能之间做出平衡。

# 2 限制容器
Linux Namespace创建了一个“容器”，为什么还要对容器做“限制”？

以PID Namespace为例：
虽然容器内的第1号进程在“障眼法”干扰下只能看到容器里的情况，但在宿主机，它作为第100号进程与其他所有进程之间依然是`平等竞争关系`。
这意味着，虽然第100号进程表面上被隔离，但它所能够使用到的资源（比如CPU、内存），可随时被宿主机其他进程（或容器）占用。当然，该100号进程也可能自己就把所有资源吃光。这些显然都不是一个“沙盒”的合理行为。

于是，就有了下面的

# 3 Cgroups（ control groups）
2006由Google工程师发起，曾将其命名为“进程容器”（process container）。实际上，在Google内部，“容器”这个术语长期以来都被用于形容被Cgroups限制过的进程组。后来Google的工程师们说，他们的KVM虚拟机也运行在Borg所管理的“容器”里，其实也是运行在Cgroups“容器”当中。这和我们今天说的Docker容器差别很大。

2008年并入 Linux Kernel 2.6.24。它最主要的作用，就是限制一个进程组能够使用的资源上限，包括CPU、内存、磁盘、网络带宽等等。
Docker实现CPU、内存、网络的限制也均通过cgroups实现。

此外，Cgroups还能够对进程进行优先级设置、审计，以及将进程挂起和恢复等操作。只探讨它与容器关系最紧密的“限制”能力，并通过一组实践来认识一下Cgroups。

在Linux中，Cgroups给用户暴露出来的操作接口是文件系统，即它以文件和目录的方式组织在os的/sys/fs/cgroup路径。

- 在笔者的 CentOS7 VM里，可以用mount指令把它们展示出来![](https://img-blog.csdnimg.cn/20191006205125242.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
它的输出结果，是一系列文件系统目录(如果你在自己的机器上没有看到这些目录，那你就需要自己去挂载Cgroups)

在/sys/fs/cgroup下面有很多诸如cpuset、cpu、 memory这样的子目录，也叫`子系统`
这些都是我这台机器当前可以被Cgroups进行限制的资源种类。

而在子系统对应的资源种类下，你就可以看到该类资源具体可以被限制的方法。

- 譬如,对CPU子系统来说，就可以看到如下配置文件
![](https://img-blog.csdnimg.cn/20191006205510919.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
注意到cfs_period和cfs_quota这样的关键词,这两个参数需要组合使用，可用来
`限制进程在长度为cfs_period的一段时间内，只能被分配到总量为cfs_quota的CPU时间`

### 这样的配置文件如何使用呢？
需要在对应的子系统下面创建一个目录
比如，我们现在进入/sys/fs/cgroup/cpu目录下：
![](https://img-blog.csdnimg.cn/20191006210203229.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
这个目录就称为一个“控制组”。
OS会在你新创建的container目录下，自动生成该子系统对应的资源限制文件!
# 4 Cgroups实战
## 4.1 创建 CPU 100%的进程
- 执行脚本
![](https://img-blog.csdnimg.cn/20191006210331271.png)
- 死循环可致CPU 100%，top确认：
![](https://img-blog.csdnimg.cn/20191008004521574.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

此时，可以查看container目录下的文件，看到
- container控制组里的CPU quota还没有任何限制（即：-1）
![](https://img-blog.csdnimg.cn/20191008004706365.png)
- CPU period则是默认的100 ms（100000 us）：![](https://img-blog.csdnimg.cn/20191008004733979.png)

##  4.2 限制该进程
接下来修改这些文件的内容来设置限制。

- 向container组里的cfs_quota文件写入20 ms（20000 us）![](https://img-blog.csdnimg.cn/2019100800500195.png)即100ms，被该控制组限制的进程只能使用20ms的CPU，即该进程只能使用到20%的CPU带宽。

- 接下来把被限制的进程的PID写入container组里的tasks文件，上面的设置就会对该进程生效
![](https://img-blog.csdnimg.cn/20191008005155574.png)
- top，可见CPU使用率立刻降到20%
![](https://img-blog.csdnimg.cn/20191008005126191.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

除CPU子系统外，Cgroups的每一项子系统都有其独有的资源限制能力，比如：
- blkio，为​​​块​​​设​​​备​​​设​​​定​​​I/O限​​​制，一般用于磁盘等设备
- cpuset，为进程分配单独的CPU核和对应的内存节点
- memory，为进程设定内存使用的限制

# 5 Docker中如何限制？
`Cgroups 就是一个子系统目录加上一组资源限制文件的组合`
而对于Docker等Linux容器，只需在每个子系统下面，为每个容器创建一个控制组（即创建一个新目录），然后在启动容器进程之后，把这个进程的PID填写到对应控制组的tasks文件中!
而至于在这些控制组下面的资源文件里填上什么值，就靠用户执行docker run时的参数指定
- Docker  ≥1.13

```bash
docker run -it --cpus=".5" ubuntu /bin/bash
```
- Docker ≤1.12
```bash
docker run -it --cpu-period=100000 
	--cpu-quota=50000 ubuntu /bin/bash
```

启动容器后，可通过查看Cgroups文件系统下，CPU子系统中，“docker”这个控制组里的资源限制文件的内容来确认：
```bash
cat /sys/fs/cgroup/cpu/docker/5d5c9f67d/cpu.cfs_period_us 
xxx
cat /sys/fs/cgroup/cpu/docker/5d5c9f67d/cpu.cfs_quota_us 
xxx
```

# 6 总结
![](https://img-blog.csdnimg.cn/20210112194029263.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

容器只是一种特殊的进程，一个正在运行的Docker容器，就是一个启用了多个Linux Namespace的应用进程，而该进程能够使用的资源量，则受Cgroups限制。即`容器是一个“单进程”模型`。

由于一个容器本质就是一个进程，用户的应用进程实际上就是容器里PID=1的进程，也是其他后续创建的所有进程的父进程。
这意味着，在一个容器，无法同时运行两个不同应用，除非你能事先找到一个公共的PID=1的程序充当两个不同应用的父进程，这也解释了为何很多人会用`systemd`或`supervisord`这样的软件代替应用本身作为容器的启动进程。

容器本身设计就是希望容器和应用能同生命周期，这对容器的编排很重要。否则，一旦出现类似于“容器是正常运行的，但是里面的应用早已经挂了”的情况，编排系统处理起来就非常麻烦了。

跟Namespace的情况类似，Cgroups对资源的限制能力也有很多不完善的地方，被提及最多的就是/proc文件系统的问题。
如果在容器里执行top，会发现它显示的信息是宿主机的CPU和内存数据，而不是当前容器的。造成这个问题的原因就是，/proc文件系统并不知道用户通过Cgroups给这个容器做了什么样的资源限制，即：/proc文件系统不了解Cgroups限制的存在。

在生产环境中，这个问题必须修正，否则应用程序在容器里读取到的CPU核数、可用内存等信息都是宿主机上的数据，这会给应用的运行带来非常大的困惑和风险。这也是在企业中，容器化应用碰到的一个常见问题，也是容器相较于虚拟机另一个不尽如人意的地方

参考
- Docker官网
- Docker实战
- 深入剖析Kubernetes
- https://tech.meituan.com/2015/03/31/cgroups.html