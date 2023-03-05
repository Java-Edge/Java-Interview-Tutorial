和其他机器通讯，就需要一个通讯地址，要给网卡配置这样一个地址。

# 1 配置IP地址
可使用：
- ifconfig
- ip addr

设置后，用这俩命令，将网卡up一下，即可开始工作。

## 1.1 net-tools
```bash
$ sudo ifconfig eth1 10.0.0.1/24
$ sudo ifconfig eth1 up
```
## 1.2 iproute2
```bash
$ sudo ip addr add 10.0.0.1/24 dev eth1
$ sudo ip link set up eth1
```
若配置的是一个和谁都无关的地址呢？
例如，旁边机器都是192.168.1.x，我就配置个16.158.23.6，会咋样？
包发不出去！

这是为啥？
***192.168.1.6*** 就在你这台机器的旁边，甚至在同一交换机，而你把机器地址设为 ***16.158.23.6***。
在这台机器，企图去ping ***192.168.1.6***，觉得只要将包发出去，同一交换机的另一台机器应该马上就能收到，是嘛？
Linux不是这样的，它并不智能，你眼睛看到那台机器就在旁边，Linux则是根据自己的逻辑处理的：
**`只要是在网络上跑的包，都是完整的，可以有下层没上层，绝对不可能有上层没下层`**。
所以它：
- 有自己的源IP地址 ***16.158.23.6***
- 也有目标IP地址 ***192.168.1.6***

但包发不出去，是因为MAC层还没填。自己的MAC地址自己肯定知道，但目标MAC填啥？
是不是该填 ***192.168.1.6*** 机器的MAC地址？
不是!
Linux会判断要去的这个地址和我是一个网段吗，或者和我的一个网卡是同一网段吗？
只有是一个网段的，它才会发送ARP请求，获取MAC地址
如果发现不是呢？

Linux默认的逻辑，如果这是一个跨网段的调用，它不会直接将包发送到网络上，而是将包发送到网关。

如果配置了网关，Linux会获取网关的MAC地址，然后将包发出去
对于 ***192.168.1.6*** 机器，虽然路过家门的这个包，目标IP是它，但是无奈MAC地址不是它的，所以它的网卡是不会把包收进去的

**如果没有配置网关呢**？
那包压根就发不出去

如果将网关配置为 ***192.168.1.6*** 呢？
不可能，Linux不会让你配置成功
因为 **`网关要和当前的网络至少一个网卡是同一个网段`** 
怎能允你16.158.23.6的网关是192.168.1.6呢？

所以，当你需要手动配置一台机器的网络IP时，一定要好好问问你的网管
如果在机房里面，要去网管那申请，让他给你分配一段正确的IP地址
当然，真正配置的时候，一定不是直接用命令配置的，而是放在一个配置文件里面
**不同系统的配置文件格式不同，但是无非就是CIDR、子网掩码、广播地址和网关地址**

# 2 DHCP - 动态主机配置协议
配置IP后一般不能变，配置一个服务端的机器还可以，但如果是客户端的机器呢？
我抱着一台笔记本电脑在公司里走来走去，或者白天来晚上走，每次使用都要配置IP地址，那可怎么办？还有人事、行政等非技术人员，如果公司所有的电脑都需要IT人员配置，肯定忙不过来啊。

需要有一个自动配置的协议，即**动态主机配置协议（Dynamic Host Configuration Protocol），简称DHCP**

那网管就轻松多了。只需要配置一段共享的IP地址
每一台新接入的机器都通过DHCP协议，来这个共享的IP地址里申请，然后自动配置好就可
等用完了，还回去，这样其他的机器也能用。

**数据中心里面的服务器，IP一旦配置好，基本不会变
这就相当于买房自己装修。DHCP的方式就相当于租房。你不用装修，都是帮你配置好的。你暂时用一下，用完退租就可以了。**

# 3 DHCP的工作方式
当一台机器新加入一个网络的时候，肯定啥情况都不知道，只知道自己的MAC地址
怎么办？先吼一句，我来啦，有人吗？这时候的沟通基本靠“吼”
这一步，我们称为DHCP Discover。

新来的机器使用IP地址 ***0.0.0.0*** 发送了一个广播包，目的IP地址为 ***255.255.255.255***
广播包封装了UDP，UDP封装了BOOTP
其实DHCP是BOOTP的增强版，但是如果去抓包的话，很可能看到的名称还是BOOTP协议

在广播包里，新人大喊：我是新来的（Boot request），我的MAC地址是这个，我还没有IP，谁能给租给我个IP地址！

- 格式就像
![](https://img-blog.csdnimg.cn/20190820013104636.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

如果一个网管在网络里面配置了**DHCP Server**，他就相当于这些IP的管理员
立刻能知道来了一个“新人”
这个时候，我们可以体会MAC地址唯一的重要性了
当一台机器带着自己的MAC地址加入一个网络的时候，MAC是它唯一的身份，如果连这个都重复了，就没办法配置了。

只有MAC唯一，IP管理员才能知道这是一个新人，需要租给它一个IP地址，这个过程我们称为**DHCP Offer**
同时，DHCP Server为此客户保留为它提供的IP地址，从而不会为其他DHCP客户分配此IP地址。

DHCP Offer的格式就像这样，里面有给新人分配的地址。

![](https://img-blog.csdnimg.cn/20190820013258466.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

DHCP Server 仍然使用广播地址作为目的地址
因为，此时请求分配IP的新人还没有自己的IP
DHCP Server回复说，我分配一个可用的IP给你，你看如何？
除此之外，服务器还发送了子网掩码、网关和IP地址租用期等信息。

新来的机器很开心，它的“吼”得到了回复，并且有人愿意租给它一个IP地址了，这意味着它可以在网络上立足了
当然更令人开心的是，如果有多个DHCP Server，这台新机器会收到多个IP地址，简直受宠若惊!!!

它会选择其中一个DHCP Offer，一般是最先到达的那个，并且会向网络发送一个DHCP Request广播数据包，包中包含客户端的MAC地址、接受的租约中的IP地址、提供此租约的DHCP服务器地址等，并告诉所有DHCP Server它将接受哪一台服务器提供的IP地址，告诉其他DHCP服务器，谢谢你们的接纳，并请求撤销它们提供的IP地址，以便提供给下一个IP租用请求者
![](https://img-blog.csdnimg.cn/201908202336176.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

还没得到DHCP Server的最后确认，客户端仍然使用0.0.0.0为源IP地址、255.255.255.255为目标地址进行广播
在BOOTP里面，接受某个DHCP Server的分配的IP。

当DHCP Server接收到客户机的DHCP request之后，会广播返回给客户机一个DHCP ACK消息包，表明已经接受客户机的选择，并将这一IP地址的合法租用信息和其他的配置信息都放入该广播包，发给客户机，欢迎它加入网络大家庭
![](https://img-blog.csdnimg.cn/20190820233637478.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

最终租约达成的时候，还是需要广播一下，让大家都知道。

# IP地址的收回和续租
既然是租房子，就是有租期的。租期到了，管理员就要将IP收回。
如果不用的话，收回就收回了。就像你租房子一样，如果还要续租的话，不能到了时间再续租，而是要提前一段时间给房东说
**DHCP也是这样**

客户机会在租期过去50%的时候，直接向为其提供IP地址的DHCP Server发送DHCP request消息包
客户机接收到该服务器回应的DHCP ACK消息包，会根据包中所提供的新的租期以及其他已经更新的TCP/IP参数，更新自己的配置
这样，IP租用更新就完成了。

网络管理员不仅能自动分配IP地址，还能帮你自动安装操作系统！

# 预启动执行环境（PXE）
数据中心里面的管理员可能一下子就拿到几百台空的机器，一个个安装操作系统，会累死的。

所以管理员希望的不仅仅是自动分配IP地址，还要自动安装系统。装好系统之后自动分配IP地址，直接启动就能用了

安装操作系统，应该有个光盘吧。数据中心里不能用光盘吧，想了一个办法就是，可以将光盘里面要安装的操作系统放在一个服务器上，让客户端去下载
但是客户端放在哪里呢？它怎么知道去哪个服务器上下载呢？客户端总得安装在一个操作系统上呀，可是这个客户端本来就是用来安装操作系统的呀？

其实，这个过程和操作系统启动的过程有点儿像。
- 首先，启动BIOS,读取硬盘的MBR启动扇区，将GRUB启动起来
- 然后将权力交给GRUB，GRUB加载内核、加载作为根文件系统的initramfs文件
- 再将权力交给内核
- 最后内核启动，初始化整个操作系统。

安装操作系统的过程，只能插在BIOS启动之后了
因为没安装系统之前，连启动扇区都没有。因而这个过程叫做预启动执行环境 **（Pre-boot Execution Environment），PXE**

PXE协议分为客户端和服务器端，由于还没有操作系统，只能先把客户端放在BIOS里面
当计算机启动时，BIOS把PXE客户端调入内存里面，就可以连接到服务端做一些操作了。

首先，PXE客户端自己也需要有个IP地址
因为PXE的客户端启动起来，就可以发送一个DHCP的请求，让DHCP Server给它分配一个地址。PXE客户端有了自己的地址，那它怎么知道PXE服务器在哪里呢？对于其他的协议，都好办，要么人告诉他
例如，告诉浏览器要访问的IP地址，或者在配置中告诉它；例如，微服务之间的相互调用。

但是PXE客户端启动的时候，啥都没有
好在DHCP Server除了分配IP地址以外，还可以做一些其他的事情。这里有一个DHCP Server的一个样例配置：
```
ddns-update-style interim;
ignore client-updates;
allow booting;
allow bootp;
subnet 192.168.1.0 netmask 255.255.255.0
{
	option routers 192.168.1.1;
	option subnet-mask 255.255.255.0;
	option time-offset -18000;
	default-lease-time 21600;
	max-lease-time 43200;
	range dynamic-bootp 192.168.1.240 192.168.1.250;
	filename "pxelinux.0";
	next-server 192.168.1.180;
}
```
按照上面的原理，默认的DHCP Server是需要配置的，无非是我们配置IP的时候所需要的IP地址段、子网掩码、网关地址、租期等
如果想使用PXE，则需要配置next-server，指向PXE服务器的地址，另外要配置初始启动文件filename

这样PXE客户端启动之后，发送DHCP请求之后，除了能得到一个IP地址，还可以知道PXE服务器在哪里，也可以知道如何从PXE服务器上下载某个文件，去初始化操作系统。

# 解析PXE的工作过程
## 启动PXE客户端
通过DHCP协议告诉DHCP Server，我,穷b，打钱!
DHCP Server便租给它一个IP地址，同时也给它PXE服务器的地址、启动文件pxelinux.0

## 初始化机器
PXE客户端知道要去PXE服务器下载这个文件后，就可以初始化机器
便开始下载(TFTP协议),还需要有一个TFTP服务器
PXE客户端向TFTP服务器请求下载这个文件，TFTP服务器说好啊，于是就将这个文件传给它

## 执行文件
然后，PXE客户端收到这个文件后，就开始执行这个文件
这个文件会指示PXE客户端，向TFTP服务器请求计算机的配置信息pxelinux.cfg
TFTP服务器会给PXE客户端一个配置文件，里面会说内核在哪里、initramfs在哪里。PXE客户端会请求这些文件。

## 启动Linux内核
一旦启动了操作系统，以后就啥都好办了
![](https://img-blog.csdnimg.cn/20190821003023985.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

# 总结
DHCP协议主要是用来给客户租用IP地址，和房产中介很像，要商谈、签约、续租，广播还不能“抢单”；

DHCP协议能给客户推荐“装修队”PXE，能够安装操作系统，这个在云计算领域大有用处。