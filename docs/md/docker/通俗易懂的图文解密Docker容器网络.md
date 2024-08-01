# 通俗易懂的图文解密Docker容器网络

一个Linux容器能看见的“网络栈”，被隔离在它自己的Network Namespace。

## 1 “网络栈”的内容



- 网卡（Network Interface）
- 回环设备（Loopback Device）
- 路由表（Routing Table）
- iptables规则

对于一个进程，这些构成它发起、响应网络请求的基本环境。

### 1.1 直接用宿主机的网络栈

作为一个容器，它可声明直接使用宿主机的网络栈（–net=host），即不开启Network Namespace：

```bash
$ docker run –d
–net=host
--name nginx-host nginx
```

该容器启动后，直接监听宿主机80端口。

#### 缺点

虽可为容器提供良好网络性能，但引入共享网络资源问题，如端口冲突。一般都希望容器进程使用自己Network Namespace里的网络栈，即拥有属于自己的IP地址和端口。

但这被隔离的容器进程，咋和其他Network Namespace里的容器进程交互？可将每个容器看做一台主机，它们都有一套独立“网络栈”，想实现：

- 两台主机间通信，最直接的把它们用一根网线连接

- 多台主机间通信，就要用网线，把它们连接在一台交换机

Linux中起到虚拟交换机作用的网络设备是网桥（Bridge），工作在数据链路层（Data Link），根据MAC地址学习，将数据包转发到网桥的不同端口（Port）。

### 1.2 为何主机间需MAC地址才能通信？

MAC地址是识别网络设备的唯一标识符。网络设备（如网卡）出厂时会被预先分配一个全球唯一MAC地址。

主机发数据时，它会通过目标主机IP地址将数据包传送到网络。然后，根据目标主机IP地址，路由器会将数据包传送到目标主机所在子网。

子网中，主机间通信则需借助MAC地址。主机通过ARP协议将目标主机IP地址转换为对应MAC地址，并将数据包发送到目标主机MAC地址。拥有正确MAC地址，才能确保数据包被正确地发送到目标主机，实现主机间通信。

为此，Docker默认在宿主机创建一个docker0网桥，凡连接在docker0网桥的容器，都可通过它进行通信。

### 1.3 Docker网络

单机：

- Bridge Network
- Host Network
- None Network

多机：

- Overlay Network

## 2 咋把这些容器“连接”到docker0网桥？

要使用名为**Veth Pair**的虚拟设备。

### 2.1 Veth Pair设备特点

它被创建出来后，总以两张虚拟网卡（Veth Peer）形式成对出现。从其中一个“网卡”发出的数据包，可直接出现在与它对应的另一张“网卡”，哪怕这两个“网卡”在不同Network Namespace。

这使得Veth Pair常被用作连接不同Network Namespace 的“网线”。

启动nginx-1容器：

```bash
$ docker run –d --name nginx-1 nginx
```

进入容器，查看其网络设备：

```bash
# 在宿主机执行
$ docker exec -it nginx-1 /bin/bash
# 在容器里
root@2b3c181aecf1:/# ifconfig
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.17.0.2  netmask 255.255.0.0  broadcast 0.0.0.0
        inet6 fe80::42:acff:fe11:2  prefixlen 64  scopeid 0x20<link>
        ether 02:42:ac:11:00:02  txqueuelen 0  (Ethernet)
        RX packets 364  bytes 8137175 (7.7 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 281  bytes 21161 (20.6 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        
lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        
$ route
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
default         172.17.0.1      0.0.0.0         UG    0      0        0 eth0
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 eth0
```

eth0网卡正是Veth Pair设备在容器里的这端。

通过route命令查看nginx-1容器的路由表，可见这eth0网卡是这容器里的默认路由设备；所有对172.17.0.0/16网段的请求，也会被交给eth0处理（第二条172.17.0.0路由规则）。

Veth Pair设备的另一端则在宿主机。可通过查看宿主机的网络设备看到它：

```bash
# 在宿主机执行
$ ifconfig
...
docker0   Link encap:Ethernet  HWaddr 02:42:d8:e4:df:c1  
          inet addr:172.17.0.1  Bcast:0.0.0.0  Mask:255.255.0.0
          inet6 addr: fe80::42:d8ff:fee4:dfc1/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:309 errors:0 dropped:0 overruns:0 frame:0
          TX packets:372 errors:0 dropped:0 overruns:0 carrier:0
 collisions:0 txqueuelen:0 
          RX bytes:18944 (18.9 KB)  TX bytes:8137789 (8.1 MB)
veth9c02e56 Link encap:Ethernet  HWaddr 52:81:0b:24:3d:da  
          inet6 addr: fe80::5081:bff:fe24:3dda/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:288 errors:0 dropped:0 overruns:0 frame:0
          TX packets:371 errors:0 dropped:0 overruns:0 carrier:0
 collisions:0 txqueuelen:0 
          RX bytes:21608 (21.6 KB)  TX bytes:8137719 (8.1 MB)
          
$ brctl show
bridge name bridge id  STP enabled interfaces
docker0  8000.0242d8e4dfc1 no  veth9c02e56
```

nginx-1容器对应的Veth Pair设备，在宿主机上是张虚拟网卡-veth9c02e56。通过brctl show，可见这张网卡被“插”在docker0。

这时，若再在这台宿主机启动另一个Docker容器nginx-2：

```bash
$ docker run –d --name nginx-2 nginx
$ brctl show
bridge name bridge id  STP enabled interfaces
docker0  8000.0242d8e4dfc1 no  veth9c02e56
       vethb4963f3
```

就会发现新的、名叫vethb4963f3的虚拟网卡，也被“插”在docker0网桥。

这时候，若你在nginx-1容器ping一下nginx-2容器的IP地址（172.17.0.3），就会发现同一宿主机上的两个容器默认相互连通。

## 3 同一宿主机的容器默认互连的原理

在nginx-1容器访问nginx-2容器IP地址（如ping 172.17.0.3）时，这目的IP地址会匹配到nginx-1容器里的第二条路由规则。可见，这条路由规则的网关（Gateway）是0.0.0.0，即这是一条直连规则，凡是匹配到这条规则的IP包，应经过本机的eth0网卡，通过二层网络直接发往目的主机。

要通过二层网络到达nginx-2容器，就要有172.17.0.3 IP地址对应的MAC地址。所以nginx-1容器的网络协议栈，就需要通过eth0网卡发送一个ARP广播，来通过IP地址查找对应的MAC地址。

> ARP（Address Resolution Protocol），通过三层的IP地址找到对应的二层MAC地址的协议。

这个eth0网卡，是一个Veth Pair：

- 一端在nginx-1容器的Network Namespace里
- 另一端则位于宿主机上（Host Namespace）
- 并被“插”在宿主机的docker0网桥

一旦一张虚拟网卡被“插”在网桥，它就会变成该网桥的“从设备”。从设备会被“剥夺”调用网络协议栈处理数据包的资格，“降级”成网桥上的一个端口。

### 这端口的唯一作用

接收流入的数据包，然后把这些数据包的“生杀大权”（如转发或丢弃），全部交给对应网桥。

所以，收到这些ARP请求后，docker0网桥就会扮演二层交换机，把ARP广播转发到其他被“插”在docker0上的虚拟网卡上。同样连接在docker0上的nginx-2容器的网络协议栈就会收到这个ARP请求，从而将172.17.0.3所对应的MAC地址回复给nginx-1容器。

有这目的MAC地址，nginx-1容器的eth0网卡就可将数据包发出去。

根据Veth Pair设备原理，这数据包会立刻出现在宿主机上的veth9c02e56虚拟网卡。不过，此时这veth9c02e56网卡的网络协议栈资格已被“剥夺”，所以这数据包就直接流入到docker0网桥。

docker0处理转发的过程，则继续扮演二层交换机的角色。此时，docker0网桥根据数据包的目的MAC地址（即nginx-2容器的MAC地址），在其CAM表（即交换机通过MAC地址学习维护的端口和MAC地址的对应表）里查到对应端口为：vethb4963f3，然后把数据包发往这端口。

这端口正是nginx-2容器“插”在docker0网桥的另一块虚拟网卡，也是个Veth Pair设备。这样，数据包就进入了nginx-2容器的Network Namespace。

所以，nginx-2容器看到它自己的eth0网卡出现了流入的数据包。这样，nginx-2的网络协议栈就会对请求进行处理，最后将响应（Pong）返回到nginx-1。

### 同一宿主机的不同容器通过docker0网桥通信流程



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/cae3dcd10b04923717a5678d60006fc1.png)

实际数据传递时，上述数据的传递过程在网络协议栈的不同层次，都有Linux内核Netfilter参与。可通过打开iptables的TRACE功能查看到数据包传输过程：

```bash
# 在宿主机上执行
$ iptables -t raw -A OUTPUT -p icmp -j TRACE
$ iptables -t raw -A PREROUTING -p icmp -j TRACE
```

就可在/var/log/syslog里看到数据包传输的日志。[iptables的相关知识](https://en.wikipedia.org/wiki/Iptables)进行实践，验证数据包传递流程。

默认，被限制在Network Namespace里的容器进程，就是通过【Veth Pair设备+宿主机网桥】，实现同其他容器的数据交换。

类似，当你在一台宿主机，访问该宿主机上的容器的IP地址时，这请求的数据包，也是先根据路由规则到达docker0网桥，然后被转发到对应Veth Pair设备，最后出现在容器：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/c4db16306bdb1b2c5f0f66ca381a784c.png)

接下来，这数据包就会经宿主机的eth0网卡转发到宿主机网络，最终到达10.168.0.3对应宿主机。这过程要求这两台宿主机本身连通：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/d5ec028e7b0b92663a507601827e984c.png)

在最后一个“Docker容器连接其他宿主机”案例，你可能联想到：若在另一宿主机（如：10.168.0.3）也有一个Docker容器。我们的nginx-1容器又该如何访问它？

## 4 容器的“跨主通信”问题

Docker默认配置下，一台宿主机上的docker0网桥，和其他宿主机上的docker0网桥无任何关联，互相无法连通。所以，连接在这些网桥的容器，自然也无法通信，咋办呢？

若通过软件创建一个整个集群“公用”的网桥，再把集群里的所有容器都连接到这网桥，不就能相互通信？

这样，整个集群里的容器网络就类似：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/64a66173749f03eb06cdce42305c6f20.png)

构建这种容器网络的核心：要在已有的宿主机网络，再通过软件构建一个覆盖在已有宿主机网络之上的、可将所有容器连通在一起的虚拟网络。所以，这技术称为：Overlay Network（覆盖网络)。

而这Overlay Network本身，可由每台宿主机上的一个“特殊网桥”共同组成。如当Node 1上的Container 1要访问Node 2上的Container 3时，Node 1上的“特殊网桥”在收到数据包后，能通过某种方式，把数据包发到正确宿主机，如Node 2。

而Node 2上的“特殊网桥”收到数据包后，也能通过某种方式，把数据包转发给正确容器，如Container 3。

甚至，每台宿主机上，都无需这种特殊网桥，而仅通过某种方式配置宿主机的路由表，就能把数据包转发到正确宿主机。

## 5 总结

本地环境下，单机容器网络的实现原理和docker0网桥的作用。

容器想跟外界通信，它发出的IP包须从它的Network Namespace里出来，来到宿主机。

解决这问题的方法：为容器创建一个一端在容器里充当默认网卡、另一端在宿主机上的Veth Pair设备。

## 6 FAQ

尽管容器的Host Network模式有缺点，但性能好、配置简单，易调试，很多团队直接用。要在生产环境中使用容器的Host Network模式，做哪些额外准备工作？

- 限制容器使用的端口范围，避免与主机上的其他服务冲突
- 部署网络安全措施，如防火墙和访问控制列表，以保护主机和容器之间的通信
- 配置适当的监控和日志记录，以便及时发现和解决问题
- 对主机进行安全加固，以避免容器之间或容器与主机之间的攻击
- 对主机性能测试，以确保它能够承受额外的负载，并且不会影响其他服务的性能