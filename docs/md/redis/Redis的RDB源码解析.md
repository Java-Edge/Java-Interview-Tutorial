# Redis的RDB源码解析

可靠性保证模块，了解Redis数据持久化的实现，其中包括Redis内存快照RDB文件的生成方法，以及AOF日志的记录与重写。掌握RDB文件的格式，学习到如何制作数据库镜像，并且你也会进一步掌握AOF日志重写对Redis性能影响。

主从复制是分布式数据系统保证可靠性的一个重要机制，而Redis就给我们提供了非常经典的实现，所以通过学习这部分内容，你就可以掌握到在数据同步实现过程中的一些关键操作。

## 1 RDB创建的入口函数

创建RDB文件的函数如下：

### 1.1 rdbSave

在本地磁盘创建RDB文件。对应save命令，在实现函数saveCommand中被调用。rdbSave最终会调用rdbSaveRio实际创建RDB文件。rdbSaveRio执行逻辑就体现了RDB文件的格式和生成过程。

### 1.2 rdbSaveBackground

使用后台子进程方式，在本地磁盘创建RDB文件。对应bgsave命令，在bgsaveCommand中被调用。

调用fork创建一个子进程，让子进程调用rdbSave继续创建RDB文件，而父进程，即主线程本身可继续处理客户端请求。

rdbSaveBackground创建子进程的过程：

![](https://img-blog.csdnimg.cn/bf86978d1dfc4199914d9185415d7e4b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 1.3 rdbSaveToSlavesSockets

只在主从复制时调用，Redis Server在采用不落盘方式传输RDB文件进行主从复制时，创建RDB文件。

会被startBgsaveForReplication调用，被如下函数调用：

- syncCommand

  Redis server执行主从复制命令

- replicationCron

  Redis server周期性检测主从复制状态时触发RDB生成

也是通过fork创建子进程，让子进程生成RDB。但rdbSaveToSlavesSockets是通过网络**以字节流直接发送RDB文件的二进制数据=》从节点**。

为使从节点够识别用来同步数据的RDB内容，rdbSaveToSlavesSockets调用rdbSaveRioWithEOFMark，在RDB二进制数据的前后加上标识：

![](https://img-blog.csdnimg.cn/aacb48f236944e079c104e014818bb06.png)

![](https://img-blog.csdnimg.cn/827dc4eb3beb4d22a3723c966ea56ba7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

那RDB文件创建的三个时机，也就分别是：

- save命令执行

- bgsave命令执行

- 主从复制

还有其它地方会触发时机吗？通过在Redis源码中查找**rdbSave、rdbSaveBackground**，就能知道：

- rdbSave还会在：
  - flushallCommand函数被调用，执行flushall命令
  - prepareForShutdown函数中被调用，即正常关闭时
- rdbSaveBackground：
  - 当主从复制采用落盘文件方式传输RDB时，也会被startBgsaveForReplication调用
  - Redis server运行时的周期性执行函数serverCron也会调用rdbSaveBackground

Redis源码中创建RDB文件的函数调用关系：

![](https://img-blog.csdnimg.cn/506f002e4eb2425ca7a99ac662233397.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

最终生成RDB文件的函数其实是rdbSaveRio。

## 2  RDB的组成

一个RDB文件主要是由如下部分组成：

- **文件头**：保存Redis的魔数、RDB版本、Redis版本、RDB文件创建时间、键值对占用的内存大小等信息
- **文件数据部分**：保存Redis数据库实际的所有键值对
- **文件尾**：保存RDB文件的结束标识符及整个文件的校验值。该校验值用来在Redis server加载RDB文件后，检查文件是否被篡改

准备一个RDB文件。

第一步，在Redis目录下，启动一个用来测试的Redis server：

```
./redis-server
```

第二步，执行flushall，清空当前数据库：

```
./redis-cli flushall   
```

第三步，使用redis-cli登录刚启动的Redis server，执行set命令插入一个String类型的键值对，再执行hmset命令插入一个Hash类型的键值对。执行save命令，将当前数据库内容保存到RDB：

```
127.0.0.1:6379>set hello redis
OK
127.0.0.1:6379>hmset userinfo uid 1 name zs age 32
OK
127.0.0.1:6379> save
OK
```

在刚才执行redis-cli命令的目录下，找见刚生成的RDB文件，文件名应是dump.rdb。

因RDB文件实际是个二进制数据组成的文件，所以使用一般文本编辑软件打开RDB，都是乱码。如想查看RDB文件中二进制数据和对应的ASCII字符，可使用**Linux上的od命令**，可用不同进制展示数据，并显示对应ASCII字符。

如执行如下的命令，读取dump.rdb文件，并用十六进制展示文件内容，同时文件中每个字节对应的ASCII字符也会被对应显示出来。

```
od -A x -t x1c -v dump.rdb
```

以下代码展示的就是我用od命令，查看刚才生成的dump.rdb文件后，输出的从文件头开始的部分内容。你可以看到这四行结果中，第一和第三行是用十六进制显示的dump.rdb文件的字节内容，这里每两个十六进制数对应了一个字节。而第二和第四行是od命令生成的每个字节所对应的ASCII字符。

![](https://img-blog.csdnimg.cn/a03634ffc3564fa783f44e3284b732c9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

即在刚才生成的RDB文件中，如想转换成ASCII字符，文件头内容其实就已包含REDIS的字符串和一些数字。

## 3 生成文件头

RDB文件头的内容首先是**魔数**，记录了RDB文件版本。

rdbSaveRio中，魔数通过snprintf生成：字符串“REDIS”+RDB版本的宏定义RDB_VERSION（9）。

然后，rdbSaveRio会调用rdbWriteRaw，将魔数写入RDB文件：

![](https://img-blog.csdnimg.cn/93ba8f9ce01d4d25bb7b84e86c9d5c18.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16) 

**rdbWriteRaw函数**会调用rioWrite完成写入。rioWrite是RDB文件内容的最终写入函数，根据要写入数据长度，把待写入缓冲区中的内容写入RDB。RDB文件生成过程中，会有不同函数负责写入不同部分的内容，不过这些函数最终都还是调用rioWrite完成数据的实际写入。

接着rdbSaveRio调用rdbSaveInfoAuxFields，将和Redis server相关的一些属性信息写入RDB文件头：

![](https://img-blog.csdnimg.cn/1771f58fba194657a9150303877ffaf8.png)

rdbSaveInfoAuxFields使用KV对形式，在RDB文件头中记录Redis server属性信息。RDB文件头记录的一些主要信息及对应K和V：

![](https://img-blog.csdnimg.cn/40e9adb54ad94582a5bceebea7262662.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

rdbSaveAuxFieldStrStr/rdbSaveAuxFieldStrInt都会调用rdbSaveAuxField写入属性值，分三步完成一个属性信息的写入：

1. 调用rdbSaveType写入一个操作码

   用来在RDB文件中标识接下来的内容是啥。当写入属性信息，该操作码即RDB_OPCODE_AUX（250），对应十六进制FA。便于解析RDB文件。如读取RDB文件时，若程序读到FA，表明接下来的内容是属性信息。

RDB文件使用多个操作码标识文件中不同内容：

![](https://img-blog.csdnimg.cn/c007e5c3ad404c88bff1b5adca828f82.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

2. rdbSaveAuxField调用rdbSaveRawString写入属性信息的K，K通常是个字符串。rdbSaveRawString是写入字符串的通用函数：先记录字符串长度（解析RDB文件时，程序可知道当前读取的字符串应该读取多少个字节），再记录实际字符串。

为节省RDB文件所占空间，若字符串记录的是个整数，rdbSaveRawString会调用rdbTryIntegerEncoding，尝试用**紧凑结构**对字符串编码

rdbSaveRawString执行逻辑，它调用rdbSaveLen写入字符串长度，rdbWriteRaw写入实际数据

![](https://img-blog.csdnimg.cn/07bd3f4704f7488f8a80659fa05a05e7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

3. rdbSaveAuxField就需写入属性信息的V。因属性信息的V通常也是字符串，所以类似step2写入属性信息的K，rdbSaveAuxField会调用rdbSaveRawString写入属性信息的V。

rdbSaveAuxField执行过程：

![](https://img-blog.csdnimg.cn/ddf71cceda364b1ca7df7a193c159da3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

至此，RDB文件头写完。

![](https://img-blog.csdnimg.cn/fcec9359dc6a4f80bd993dd81fe35d1d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

于是，rdbSaveRio开始写入实际的KV对。

## 4 生成文件数据

因为Redis server上的KV对可能被保存在不同DB，所以，**rdbSaveRio会执行一个循环，遍历每个DB，将其中的KV对写入RDB**。

这循环流程，rdbSaveRio先将**SELECTDB操作码**和对应数据库编号写入RDB，程序在解析RDB时，就知道接下来的KV所属DB：

![](https://img-blog.csdnimg.cn/aa7b3b6db2ce4065b6c3972e75315f3f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

接着，rdbSaveRio会写入**RESIZEDB操作码**，用标识全局哈希表和过期key哈希表中KV对数量的记录：

![](https://img-blog.csdnimg.cn/6662f80e0061433baa072a9986cbf78c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

![](https://img-blog.csdnimg.cn/83c37ff09f0247c79afa4d3f7ad87c7d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

RESIZEDB操作码后，紧接着记录的是全局哈希表中的KV对，数量是2，然后是过期key哈希表中的键值对，数量为0。刚才在生成RDB文件前，只插入了两个键值对，所以，RDB文件中记录的信息和我们刚才的操作结果是一致。

记录完这些信息后，rdbSaveRio接着**执行一个循环流程**：取出当前数据库中的每个KV对，并调用rdbSaveKeyValuePair，将它写入RDB：

![](https://img-blog.csdnimg.cn/1a00b9da1a784291850e7b52d862ca24.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

rdbSaveKeyValuePair负责将KV对实际写入RDB文件。先将KV对的TTL、LRU空闲时间或LFU访问频率写入RDB。写这些信息时，都先调用rdbSaveType，写入标识这些信息的操作码。

至此，rdbSaveKeyValuePair就要开始实际写入KV对:

- 为便于解析RDB时恢复KV对，rdbSaveKeyValuePair先调用rdbSaveObjectType，写入键值对的类型标识
- 然后调用rdbSaveStringObject写入KV对的K
- 最后，调用rdbSaveObject写入KV对的V

![](https://img-blog.csdnimg.cn/e54c7908f3b84228bff58ef205401782.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

rdbSaveObjectType会根据KV对的V类型，决定写入到RDB中的KV对的类型标识。如创建RDB文件前，写入的KV对分别是String类型、Hash类型，而Hash类型因包含元素个数不多，所以采用ziplist保存。这俩类型标识对应数值：

```c
#define RDB_TYPE_STRING   0
#define RDB_TYPE_HASH_ZIPLIST  13
```

把刚才写入的String类型键值对“hello”“redis”在RDB文件中对应的记录内容，画在下图：

![](https://img-blog.csdnimg.cn/984e87ad62194ce8ab328bec1eb9c33b.png)

可见该KV对的开头类型标识是0，和RDB_TYPE_STRING值一致。紧接着的key和value，都先记录长度信息，再记录实际内容。

因为键值对的key都是String类型，所以rdbSaveKeyValuePair就用rdbSaveStringObject写入。而KV对的V有不同类型，所以，rdbSaveObject根据V类型，将V底层数据结构中的内容写入RDB。

除了键值对类型、键值对的key和value会被记录以外，键值对的过期时间、LRU空闲时间或是LFU访问频率也都会记录到RDB文件中。这就生成了RDB文件的数据部分。

## 5 生成文件尾

当所有KV对都写入RDB，rdbSaveRio就可开始写入文件尾内容：

- RDB文件结束的操作码标识

  调用rdbSaveType，写入文件结束操作码RDB_OPCODE_EOF

- RDB文件的校验值

  调用rioWrite写入检验值

![](https://img-blog.csdnimg.cn/175f83e5b7804155835a5cd0992d9ab4.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

生成的RDB文件的文件尾：

![](https://img-blog.csdnimg.cn/2df93a0bd75644df9d3a3eea73acfb9b.png)

## 6 总结

本文详解了Redis内存快照文件RDB的生成。创建RDB三个入口函数：

- rdbSave

- rdbSaveBackground

- rdbSaveToSlavesSockets

它们在Redis源码中被调用的地方，就是触发RDB文件生成的时机。

关注RDB文件的基本组成，并结合rdbSaveRio函数的执行流程，掌握RDB文件头、文件数据部分和文件尾这三个部分的生成：

- RDB文件使用多种操作码来标识Redis不同的属性信息，以及使用类型码来标识不同value类型
- RDB文件内容是自包含的，也就是说，无论是属性信息还是键值对，RDB文件都会按照类型、长度、实际数据的格式来记录，这样方便程序对RDB文件的解析

RDB文件包含了Redis数据库某一时刻的所有KV对及这些KV对的类型、大小、过期时间等信息。了解RDB文件格式和生成方法，就能开发解析RDB文件的程序或是加载RDB文件的程序。

如可在RDB文件中查找内存空间消耗大的键值对，即优化Redis性能时通常需要查找的bigkey；也可分析不同类型键值对的数量、空间占用等分布情况，了解业务数据特点；还可自行加载RDB文件，测试或排障。

可看[redis-rdb-tools](https://github.com/sripathikrishnan/redis-rdb-tools/)，帮助你分析RDB文件内容。