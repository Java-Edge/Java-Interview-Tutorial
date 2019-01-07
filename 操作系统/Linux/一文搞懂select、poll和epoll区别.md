# 1 select
select本质上是通过设置或检查存放fd标志位的数据结构进行下一步处理。
这带来缺点：
- 单个进程可监视的fd数量被限制，即能监听端口的数量有限
单个进程所能打开的最大连接数有`FD_SETSIZE`宏定义，其大小是32个整数的大小（在32位的机器上，大小就是3232，同理64位机器上FD_SETSIZE为3264），当然我们可以对进行修改，然后重新编译内核，但是性能可能会受到影响，这需要进一步的测试
一般该数和系统内存关系很大，具体数目可以`cat /proc/sys/fs/file-max`察看。32位机默认1024个，64位默认2048。
![](https://img-blog.csdnimg.cn/20201103231954394.png#pic_center)

- 对socket是线性扫描，即轮询，效率较低：
仅知道有I/O事件发生，却不知是哪几个流，只会无差异轮询所有流，找出能读数据或写数据的流进行操作。同时处理的流越多，无差别轮询时间越长 - O(n)。


当socket较多时，每次select都要通过遍历`FD_SETSIZE`个socket，不管是否活跃，这会浪费很多CPU时间。如果能给 socket 注册某个回调函数，当他们活跃时，自动完成相关操作，即可避免轮询，这就是**epoll**与**kqueue**。

## 1.1 调用过程
![](https://img-blog.csdnimg.cn/20201103234504233.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
```c
asmlinkage long sys_poll(struct pollfd * ufds, unsigned int nfds, long timeout)
{
	int i, j, fdcount, err;
	struct pollfd **fds;
	struct poll_wqueues table, *wait;
	int nchunks, nleft;

	/* Do a sanity check on nfds ... */
	if (nfds > NR_OPEN)
		return -EINVAL;

	if (timeout) {
		/* Careful about overflow in the intermediate values */
		if ((unsigned long) timeout < MAX_SCHEDULE_TIMEOUT / HZ)
			timeout = (unsigned long)(timeout*HZ+999)/1000+1;
		else /* Negative or overflow */
			timeout = MAX_SCHEDULE_TIMEOUT;
	}
	// 2. 注册回调函数__pollwait
	poll_initwait(&table);
	wait = &table;
	if (!timeout)
		wait = NULL;

	err = -ENOMEM;
	fds = NULL;
	if (nfds != 0) {
		fds = (struct pollfd **)kmalloc(
			(1 + (nfds - 1) / POLLFD_PER_PAGE) * sizeof(struct pollfd *),
			GFP_KERNEL);
		if (fds == NULL)
			goto out;
	}

	nchunks = 0;
	nleft = nfds;
	while (nleft > POLLFD_PER_PAGE) { /* allocate complete PAGE_SIZE chunks */
		fds[nchunks] = (struct pollfd *)__get_free_page(GFP_KERNEL);
		if (fds[nchunks] == NULL)
			goto out_fds;
		nchunks++;
		nleft -= POLLFD_PER_PAGE;
	}
	if (nleft) { /* allocate last PAGE_SIZE chunk, only nleft elements used */
		fds[nchunks] = (struct pollfd *)__get_free_page(GFP_KERNEL);
		if (fds[nchunks] == NULL)
			goto out_fds;
	}

	err = -EFAULT;
	for (i=0; i < nchunks; i++)
		// 
		if (copy_from_user(fds[i], ufds + i*POLLFD_PER_PAGE, PAGE_SIZE))
			goto out_fds1;
	if (nleft) {
		if (copy_from_user(fds[nchunks], ufds + nchunks*POLLFD_PER_PAGE, 
				nleft * sizeof(struct pollfd)))
			goto out_fds1;
	}

	fdcount = do_poll(nfds, nchunks, nleft, fds, wait, timeout);

	/* OK, now copy the revents fields back to user space. */
	for(i=0; i < nchunks; i++)
		for (j=0; j < POLLFD_PER_PAGE; j++, ufds++)
			__put_user((fds[i] + j)->revents, &ufds->revents);
	if (nleft)
		for (j=0; j < nleft; j++, ufds++)
			__put_user((fds[nchunks] + j)->revents, &ufds->revents);

	err = fdcount;
	if (!fdcount && signal_pending(current))
		err = -EINTR;

out_fds1:
	if (nleft)
		free_page((unsigned long)(fds[nchunks]));
out_fds:
	for (i=0; i < nchunks; i++)
		free_page((unsigned long)(fds[i]));
	if (nfds != 0)
		kfree(fds);
out:
	poll_freewait(&table);
	return err;
}
```
```c
static int do_poll(unsigned int nfds, unsigned int nchunks, unsigned int nleft, 
	struct pollfd *fds[], struct poll_wqueues *wait, long timeout)
{
	int count;
	poll_table* pt = &wait->pt;

	for (;;) {
		unsigned int i;

		set_current_state(TASK_INTERRUPTIBLE);
		count = 0;
		for (i=0; i < nchunks; i++)
			do_pollfd(POLLFD_PER_PAGE, fds[i], &pt, &count);
		if (nleft)
			do_pollfd(nleft, fds[nchunks], &pt, &count);
		pt = NULL;
		if (count || !timeout || signal_pending(current))
			break;
		count = wait->error;
		if (count)
			break;
		timeout = schedule_timeout(timeout);
	}
	current->state = TASK_RUNNING;
	return count;
}
```

1. 使用copy_from_user从用户空间拷贝fd_set到内核空间
2. 注册回调函数`__pollwait`
![](https://img-blog.csdnimg.cn/908c942c09594f048dc2bebc05608ff9.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
3. 遍历所有fd，调用其对应的poll方法（对于socket，这个poll方法是sock_poll，sock_poll根据情况会调用到tcp_poll，udp_poll或datagram_poll）
4. 以tcp_poll为例，核心实现就是`__pollwait`，即上面注册的回调函数
5. `__pollwait`，就是把current（当前进程）挂到设备的等待队列，不同设备有不同等待队列，如tcp_poll的等待队列是sk->sk_sleep（把进程挂到等待队列中并不代表进程已睡眠）。在设备收到一条消息（网络设备）或填写完文件数据（磁盘设备）后，会唤醒设备等待队列上睡眠的进程，这时current便被唤醒。
```c
void __pollwait(struct file *filp, wait_queue_head_t *wait_address, poll_table *_p)
{
	struct poll_wqueues *p = container_of(_p, struct poll_wqueues, pt);
	struct poll_table_page *table = p->table;

	if (!table || POLL_TABLE_FULL(table)) {
		struct poll_table_page *new_table;

		new_table = (struct poll_table_page *) __get_free_page(GFP_KERNEL);
		if (!new_table) {
			p->error = -ENOMEM;
			__set_current_state(TASK_RUNNING);
			return;
		}
		new_table->entry = new_table->entries;
		new_table->next = table;
		p->table = new_table;
		table = new_table;
	}

	/* 添加新节点 */
	{
		struct poll_table_entry * entry = table->entry;
		table->entry = entry+1;
	 	get_file(filp);
	 	entry->filp = filp;
		entry->wait_address = wait_address;
		init_waitqueue_entry(&entry->wait, current);
		add_wait_queue(wait_address,&entry->wait);
	}
}
```
```c
static void do_pollfd(unsigned int num, struct pollfd * fdpage,
	poll_table ** pwait, int *count)
{
	int i;

	for (i = 0; i < num; i++) {
		int fd;
		unsigned int mask;
		struct pollfd *fdp;

		mask = 0;
		fdp = fdpage+i;
		fd = fdp->fd;
		if (fd >= 0) {
			struct file * file = fget(fd);
			mask = POLLNVAL;
			if (file != NULL) {
				mask = DEFAULT_POLLMASK;
				if (file->f_op && file->f_op->poll)
					mask = file->f_op->poll(file, *pwait);
				mask &= fdp->events | POLLERR | POLLHUP;
				fput(file);
			}
			if (mask) {
				*pwait = NULL;
				(*count)++;
			}
		}
		fdp->revents = mask;
	}
}
```
6. poll方法返回时会返回一个描述读写操作是否就绪的mask掩码，根据这个mask掩码给fd_set赋值
7. 若遍历完所有fd，还没返回一个可读写的mask掩码，则调schedule_timeout是调用select的进程（也就是current）进入睡眠。当设备驱动发生自身资源可读写后，会唤醒其等待队列上睡眠的进程。若超过一定超时时间（schedule_timeout指定），还没人唤醒，则调用select的进程会重新被唤醒获得CPU，进而重新遍历fd，判断有无就绪的fd
8. 把fd_set从内核空间拷贝到用户空间
## 1.2 缺点
内核需要将消息传递到用户空间，都需要内核拷贝动作。需要维护一个用来存放大量fd的数据结构，使得用户空间和内核空间在传递该结构时复制开销大。

- 每次调用select，都需把fd集合从用户态拷贝到内核态，fd很多时开销就很大
- 同时每次调用select都需在内核遍历传递进来的所有fd，fd很多时开销就很大
- select支持的文件描述符数量太小了，默认最大支持1024个
- 主动轮询效率很低
# 2 poll
和select类似，只是描述fd集合的方式不同，poll使用`pollfd`结构而非select的`fd_set`结构。
管理多个描述符也是进行轮询，根据描述符的状态进行处理，但**poll没有最大文件描述符数量的限制**。

poll和select同样存在一个缺点就是，包含大量文件描述符的数组被整体复制于用户态和内核的地址空间之间，而不论这些文件描述符是否就绪，它的开销随着文件描述符数量的增加而线性增大。
- 它将用户传入的数组拷贝到内核空间
- 然后查询每个fd对应的设备状态：
	- 如果设备就绪
在设备等待队列中加入一项继续遍历
	- 若遍历完所有fd后，都没发现就绪的设备
挂起当前进程，直到设备就绪或主动超时，被唤醒后它又再次遍历fd。这个过程经历多次无意义的遍历。

没有最大连接数限制，因其基于链表存储，其缺点：
- 大量fd数组被整体复制于用户态和内核地址空间间，而不管是否有意义
- 如果报告了fd后，没有被处理，那么下次poll时会再次报告该fd

所以又有了epoll模型。
# 3 epoll
epoll模型修改主动轮询为被动通知，当有事件发生时，被动接收通知。所以epoll模型注册套接字后，主程序可做其他事情，当事件发生时，接收到通知后再去处理。

可理解为**event poll**，epoll会把哪个流发生哪种I/O事件通知我们。所以epoll是事件驱动（每个事件关联fd），此时我们对这些流的操作都是有意义的。复杂度也降到O(1)。
```c
asmlinkage int sys_epoll_ctl(int epfd, int op, int fd, struct epoll_event *event)
{
	int error;
	struct file *file, *tfile;
	struct eventpoll *ep;
	struct epitem *epi;
	struct epoll_event epds;

	error = -EFAULT;
	if (copy_from_user(&epds, event, sizeof(struct epoll_event)))
		goto eexit_1;

	/* Get the "struct file *" for the eventpoll file */
	error = -EBADF;
	file = fget(epfd);
	if (!file)
		goto eexit_1;

	/* Get the "struct file *" for the target file */
	tfile = fget(fd);
	if (!tfile)
		goto eexit_2;

	/* The target file descriptor must support poll */
	error = -EPERM;
	if (!tfile->f_op || !tfile->f_op->poll)
		goto eexit_3;

	/*
	 * We have to check that the file structure underneath the file descriptor
	 * the user passed to us _is_ an eventpoll file. And also we do not permit
	 * adding an epoll file descriptor inside itself.
	 */
	error = -EINVAL;
	if (file == tfile || !IS_FILE_EPOLL(file))
		goto eexit_3;

	/*
	 * At this point it is safe to assume that the "private_data" contains
	 * our own data structure.
	 */
	ep = file->private_data;

	/*
	 * Try to lookup the file inside our hash table. When an item is found
	 * ep_find() increases the usage count of the item so that it won't
	 * desappear underneath us. The only thing that might happen, if someone
	 * tries very hard, is a double insertion of the same file descriptor.
	 * This does not rapresent a problem though and we don't really want
	 * to put an extra syncronization object to deal with this harmless condition.
	 */
	epi = ep_find(ep, tfile);

	error = -EINVAL;
	switch (op) {
	case EPOLL_CTL_ADD:
		if (!epi) {
			epds.events |= POLLERR | POLLHUP;

			error = ep_insert(ep, &epds, tfile);
		} else
			error = -EEXIST;
		break;
	case EPOLL_CTL_DEL:
		if (epi)
			error = ep_remove(ep, epi);
		else
			error = -ENOENT;
		break;
	case EPOLL_CTL_MOD:
		if (epi) {
			epds.events |= POLLERR | POLLHUP;
			error = ep_modify(ep, epi, &epds);
		} else
			error = -ENOENT;
		break;
	}

	/*
	 * The function ep_find() increments the usage count of the structure
	 * so, if this is not NULL, we need to release it.
	 */
	if (epi)
		ep_release_epitem(epi);

eexit_3:
	fput(tfile);
eexit_2:
	fput(file);
eexit_1:
	DNPRINTK(3, (KERN_INFO "[%p] eventpoll: sys_epoll_ctl(%d, %d, %d, %u) = %d\n",
		     current, epfd, op, fd, event->events, error));

	return error;
}

```

## 3.1 触发模式
**EPOLLLT**和**EPOLLET**两种：

- LT，默认的模式（水平触发）
只要该fd还有数据可读，每次 `epoll_wait` 都会返回它的事件，提醒用户程序去操作，
- ET是“高速”模式（边缘触发）
![](https://img-blog.csdnimg.cn/20201103232957391.png#pic_center)
只会提示一次，直到下次再有数据流入之前都不会再提示，无论fd中是否还有数据可读。所以在ET模式下，read一个fd的时候一定要把它的buffer读完，即读到read返回值小于请求值或遇到EAGAIN错误

epoll使用“事件”的就绪通知方式，通过`epoll_ctl`注册fd，一旦该fd就绪，内核就会采用类似回调机制激活该fd，`epoll_wait`便可收到通知。
### EPOLLET触发模式的意义
若用`EPOLLLT`，系统中一旦有大量无需读写的就绪文件描述符，它们每次调用`epoll_wait`都会返回，这大大降低处理程序检索自己关心的就绪文件描述符的效率。
而采用`EPOLLET`，当被监控的文件描述符上有可读写事件发生时，`epoll_wait`会通知处理程序去读写。如果这次没有把数据全部读写完(如读写缓冲区太小)，那么下次调用`epoll_wait`时，它不会通知你，即只会通知你一次，直到该文件描述符上出现第二次可读写事件才会通知你。这比水平触发效率高，系统不会充斥大量你不关心的就绪文件描述符。

## 3.2 优点
- 没有最大并发连接的限制，能打开的FD的上限远大于1024（1G的内存上能监听约10万个端口）
- 效率提升，不是轮询，不会随着FD数目的增加效率下降。只有活跃可用的FD才会调用callback函数
即Epoll最大的优点就在于它只关心“活跃”的连接，而跟连接总数无关，因此在实际的网络环境中，Epoll的效率就会远远高于select和poll
- 内存拷贝，利用mmap()文件映射内存加速与内核空间的消息传递；即epoll使用mmap减少复制开销。
- epoll通过内核和用户空间共享一块内存来实现的

表面上看epoll的性能最好，但是在连接数少并且连接都十分活跃的情况下，select和poll的性能可能比epoll好，毕竟epoll的通知机制需要很多函数回调。

epoll跟select都能提供多路I/O复用的解决方案。在现在的Linux内核里有都能够支持，其中epoll是Linux所特有，而select则应该是POSIX所规定，一般操作系统均有实现。

select和poll都只提供了一个函数——select或者poll函数。而epoll提供了三个函数，epoll_create,epoll_ctl和epoll_wait，epoll_create是创建一个epoll句柄；epoll_ctl是注册要监听的事件类型；epoll_wait则是等待事件的产生。
- 对于第一个缺点，epoll的解决方案在epoll_ctl函数中。每次注册新的事件到epoll句柄中时（在epoll_ctl中指定EPOLL_CTL_ADD），会把所有的fd拷贝进内核，而不是在epoll_wait的时候重复拷贝。epoll保证了每个fd在整个过程中只会拷贝一次。
- 对于第二个缺点，epoll的解决方案不像select或poll一样每次都把current轮流加入fd对应的设备等待队列中，而只在epoll_ctl时把current挂一遍（这一遍必不可少）并为每个fd指定一个回调函数，当设备就绪，唤醒等待队列上的等待者时，就会调用这个回调函数，而这个回调函数会把就绪的fd加入一个就绪链表）。epoll_wait的工作实际上就是在这个就绪链表中查看有没有就绪的fd（利用schedule_timeout()实现睡一会，判断一会的效果，和select实现中的第7步是类似的）。
- 对于第三个缺点，epoll没有这个限制，它所支持的FD上限是最大可以打开文件的数目，这个数字一般远大于2048,举个例子,在1GB内存的机器上大约是10万左右，具体数目可以cat /proc/sys/fs/file-max察看,一般来说这个数目和系统内存关系很大。
# 4 总结
select，poll，epoll都是IO多路复用机制，即可以监视多个描述符，一旦某个描述符就绪（读或写就绪），能够通知程序进行相应读写操作。
但select，poll，epoll本质上都是**同步I/O**，因为他们都需要在读写事件就绪后自己负责进行读写，也就是说这个读写过程是阻塞的，而异步I/O则无需自己负责进行读写，异步I/O的实现会负责把数据从内核拷贝到用户空间。  

- select，poll实现需要自己不断轮询所有fd集合，直到设备就绪，期间可能要睡眠和唤醒多次交替。而epoll其实也需要调用epoll_wait不断轮询就绪链表，期间也可能多次睡眠和唤醒交替，但是它是设备就绪时，调用回调函数，把就绪fd放入就绪链表中，并唤醒在epoll_wait中进入睡眠的进程。虽然都要睡眠和交替，但是select和poll在“醒着”的时候要遍历整个fd集合，而epoll在“醒着”的时候只要判断一下就绪链表是否为空就行了，这节省了大量的CPU时间。这就是回调机制带来的性能提升。

- select，poll每次调用都要把fd集合从用户态往内核态拷贝一次，并且要把current往设备等待队列中挂一次，而epoll只要一次拷贝，而且把current往等待队列上挂也只挂一次（在epoll_wait的开始，注意这里的等待队列并不是设备等待队列，只是一个epoll内部定义的等待队列）。这也能节省不少的开销。 

> 参考
> - Linux下select/poll/epoll机制的比较
> - https://www.cnblogs.com/anker/p/3265058.html