# TCP连接的建立和断开受哪些系统配置影响？

- Client为什么无法和Server建立连接呢？
- 三次握手都完成了，为什么会收到Server的reset呢？
- 建立TCP连接怎么会消耗这么多时间？
- 系统中为什么会有这么多处于time-wait的连接？该这么处理？
- 系统中为什么会有这么多close-wait的连接？
- 针对我的业务场景，这么多的网络配置项，应该要怎么配置呢？

想让业务行为符合预期，要了解Linux相关网络配置，让这些配置更适用你的业务。本文以最常用TCP/IP协议为例，从一个网络连接是咋建立起来的及如何断开。

## TCP连接的建立过程会受哪些配置项的影响？

![TCP建连过程](https://static001.geekbang.org/resource/image/af/44/afc841ee3822fyye3ec186b28ee93744.jpg)

TCP连接建立过程。从Client侧调用connect()，到Server侧accept()成功返回的过程。整个TCP建立连接的过程中，各个行为都有配置选项控制。

Client调用connect()后，Linux内核开始三次握手。

Client会给Server发个SYN包，但该SYN包可能会在传输过程中丢失或因为其他原因导致Server无法处理，此时Client侧就会触发超时重传机制。但也不能一直重传，重传次数有限制，即tcp_syn_retries。假设tcp_syn_retires为3，则SYN包重传策略如下：

![tcp_syn_retries示意图](https://static001.geekbang.org/resource/image/01/e4/012b9bf3e59f3abd5c5588a968e354e4.jpg)

- Client发出SYN后，若过1s ，还没收到Server响应，就会进行第一次重传
- 经过2s还没收到Server响应，就会进行第二次重传
- 一直重传tcp_syn_retries次。

tcp_syn_retries为3，总共重传3次，即从第一次发出SYN包后，会一直等待（1 + 2 + 4 + 8）秒，若还没收到Server响应，connect()就产生ETIMEOUT错误。

tcp_syn_retries默认为6，即若SYN一直发送失败，会在（1 + 2 + 4 + 8 + 16+ 32 + 64）秒，即127s后产生ETIMEOUT错误。

生产的Server因为某些原因被下线，但Client没有被通知到，所以Client的connect()被阻塞127s才去尝试连接一个新Server， 这么长的超时等待时间对应用很难接受。

**所以一般都会将IDC内部服务器的tcp_syn_retries调小，推荐设为2，减少阻塞的时间。**因为对IDC，其网络质量很好，若得不到Server响应，很可能Server本身问题。此时，Client及早尝试连接其他Server是较好选择，所以对客户端而言，一般调整如下：

> net.ipv4.tcp_syn_retries = 2

有时1s阻塞时间可能都很久，所以也会将三次握手的初始超时时间从默认值1s调为较小值，如100ms，这样整体阻塞时间就小很多。

若Server没有响应Client的SYN，除了Server已不存在，还可能因为Server太忙没来及响应或Server已积压太多的半连接（incomplete）而无法及时处理。

半连接，即收到SYN后还没回复SYNACK的连接，Server每收到一个新SYN包，都会创建一个半连接，然后把该半连接加入半连接队列（syn queue）。syn queue的长度就是tcp_max_syn_backlog配置，当系统积压的半连接个数超过该值，新SYN包就会被丢弃。

对服务器，可能瞬间会有很多的新建连接，所以可适当调大该值，以免SYN包被丢弃而导致Client收不到SYNACK：

> net.ipv4.tcp_max_syn_backlog = 16384

**Server积压的半连接较多，也可能因为有恶意Client在进行SYN Flood攻击**。典型SYN Flood攻击：Client高频地向Server发SYN包，并且该SYN包的源IP地址不停变换，则Server每次接收到一个新SYN后，都会给它分配一个半连接，Server的SYNACK根据之前的SYN包找到的是错误的Client IP， 所以也就无法收到Client的ACK包，导致无法正确建立TCP连接，就会让Server的半连接队列耗尽，无法响应正常SYN包。

为防止SYN Flood攻击，Linux内核引入

## SYN Cookies机制

Server收到SYN包时，不去分配资源来保存Client信息，而是根据该SYN包计算出一个Cookie值，然后将Cookie记录到SYNACK包中发出去。对正常连接，该Cookies值会随Client的ACK报文被带回来。然后Server再根据该Cookie检查该ACK包合法性，若合法，才创建新的TCP连接。于是，SYN Cookies就能防止部分SYN Flood攻击。所以对Linux服务器，推荐开启SYN Cookies：

> net.ipv4.tcp_syncookies = 1



Server向Client发送的SYNACK包也可能被丢弃或因某些原因收不到Client的响应，这时Server也会重传SYNACK包。重传次数由tcp_synack_retries控制。

tcp_synack_retries重传策略跟tcp_syn_retries一致。系统中默认为5，对IDC的服务器，通常都不需这么大，推荐设为2 :

> net.ipv4.tcp_synack_retries = 2

Client收到Serve的SYNACK包后，就会发出ACK，Server收到该ACK后，三次握手就完成，即产生一个TCP全连接（complete），被添加到全连接队列（accept queue）。然后Server就会调用accept()完成TCP连接的建立。

就像半连接队列（syn queue）长度有限，全连接队列（accept queue）长度也有限，是为防止Server不能及时调用accept()而浪费太多系统资源。

全连接队列（accept queue）长度由listen(sockfd, backlog)函数的backlog控制，而该backlog的最大值则是somaxconn。somaxconn在5.4之前的内核中，默认都是128（5.4开始调整为默认的4096），建议将该值适当调大：

> net.core.somaxconn = 16384

当服务器中积压的全连接个数超过该值，新的全连接就会被丢弃。Server在将新连接丢弃时，有时需发送reset通知Client，这样Client就不会再次重试。不过，默认行为是直接丢弃而不去通知Client。是否需要给Client发送reset，由tcp_abort_on_overflow控制，默认为0，即不发送reset给Client。推荐将该值配为0:

> net.ipv4.tcp_abort_on_overflow = 0

因为，Server若来不及accept()而导致全连接队列满，这往往是由瞬间有大量新建连接请求导致，正常情况下Server很快就能恢复，然后Client再次重试后就能建连成功。即将 tcp_abort_on_overflow 配置为0，给Client一个重试机会。

accept()成功返回后，一个新的TCP连接就建立完成，TCP连接进入到了ESTABLISHED状态：

![TCP状态转换](https://static001.geekbang.org/resource/image/e0/3c/e0ea3232fccf6bba8bace54d3f5d8d3c.jpg)

上图就是从Client调用connect()，到Server侧accept()成功返回这一过程中的TCP状态转换。这些状态可netstat或ss查看。

至此，Client和Server两边就可以正常通信了。

## TCP连接的断开过程会受哪些配置项的影响？

![TCP的四次挥手](https://static001.geekbang.org/resource/image/1c/cf/1cf68d3eb4f07113ba13d84124f447cf.jpg)

当应用程序调用close()时，会向对端发送FIN包，然后会接收ACK；对端也会调用close()来发送FIN，然后本端也会向对端回ACK，这就是TCP的四次挥手过程。

首先调用close()的一侧是active close（主动关闭）；而接收到对端的FIN包后再调用close()来关闭的一侧，称之为passive close（被动关闭）。四次挥手过程中，需额外关注上图中深红色的那三个状态：

- 主动关闭方的FIN_WAIT_2和TIME_WAIT
- 被动关闭方的CLOSE_WAIT状态

除了CLOSE_WAIT状态，其余两个状态都有对应的系统配置项控制。

### FIN_WAIT_2状态

TCP进入该态后，如本端迟迟收不到对端的FIN包，就会一直处该态，于是一直消耗系统资源。Linux为防止这种资源开销，设置了该状态的超时时间tcp_fin_timeout，默认60s，超过自动销毁该连接。

至于本端为何迟迟收不到对端FIN包，通常因为对端机器异常或因为太繁忙而不能及时close()。推荐 tcp_fin_timeout 调小一些，以尽量避免这种状态下的资源开销。对于数据中心内部的机器而言，将它调整为2s足以：

> net.ipv4.tcp_fin_timeout = 2

### TIME_WAIT状态

该状态存在意义：最后发送的这个ACK包可能被丢弃掉或有延迟，这样对端就会再发FIN包。如不维持TIME_WAIT态，那么再次收到对端FIN包后，本端就会回一个Reset包，这可能产生一些异常。

所以维持该态一段时间，可保障TCP连接正常断开。TIME_WAIT默认TTL在Linux是60s（TCP_TIMEWAIT_LEN），对数据中心可能还是有些长，所以有时也会修改内核做些优化来减小该值或将该值置为可通过sysctl调节。

该态存在这么久，也是对系统资源浪费，所以系统也有配置项tcp_max_tw_buckets限制该状态的最大个数。数据中心的网络相对很稳定，基本不存在FIN包异常，推荐调小：

> net.ipv4.tcp_max_tw_buckets = 10000

Client关闭跟Server的连接后，也有可能很快再次跟Server之间建立一个新的连接，而由于TCP端口最多只有65536个，如果不去复用处于TIME_WAIT状态的连接，就可能在快速重启应用程序时，出现端口被占用而无法创建新连接的情况。所以建议你打开复用TIME_WAIT的选项：

> net.ipv4.tcp_tw_reuse = 1

还有另外一个选项tcp_tw_recycle来控制TIME_WAIT状态，但是该选项是很危险的，因为它可能会引起意料不到的问题，比如可能会引起NAT环境下的丢包问题。所以建议将该选项关闭：

> net.ipv4.tcp_tw_recycle = 0

因为打开该选项后引起了太多的问题，所以新版本的内核就索性删掉了这个配置选项：[tcp: remove tcp_tw_recycle.](https://git.kernel.org/pub/scm/linux/kernel/git/next/linux-next.git/commit/?id=4396e46187ca5070219b81773c4e65088dac50cc)

对于CLOSE_WAIT状态而言，系统中没有对应的配置项。但是该状态也是一个危险信号，如果这个状态的TCP连接较多，那往往意味着应用程序有Bug，在某些条件下没有调用close()来关闭连接。我们在生产环境上就遇到过很多这类问题。所以，如果你的系统中存在很多CLOSE_WAIT状态的连接，那你最好去排查一下你的应用程序，看看哪里漏掉了close()。

## 总结

![](https://static001.geekbang.org/resource/image/3d/de/3d60be2523528f511dec0fbc88ce1ede.jpg)

有些配置项也可根据服务器负载及CPU和内存大小做灵活配置，如tcp_max_syn_backlog、somaxconn、tcp_max_tw_buckets这三项，若你的物理内存足够大、CPU核数足够多，你可以适当地增大这些值，这些往往都是经验值。

## FAQ

Q：若不开启abort_on_overflow，是否这时client认为连接建立成功了，就会发送数据。server端发现这连接没建立，直接就再次发送reset回去咯？所以设置成1意义不大？

A：并非这样，在Server侧此时这连接还是半连接，他会忽略client发的三次握手阶段的最后一个ack，而是继续给client发送synack，synack有次数限制，Server给client发送的synack超过这个次数后才会断开这个连接。
如果是为1的话，Server就不会重传synack，而是直接发送Reset来断开连接。

Q：isn和paws可细讲不，还有nat转换会转换seq吗？

A：当然可以！让我们详细讲解一下 `isn` 和 `paws` 这两个概念，以及 NAT（网络地址转换）是否会转换序列号（seq）。

### 1. `isn`（Initial Sequence Number）

在 TCP（传输控制协议）中，`isn` 是初始序列号（Initial Sequence Number）。TCP 使用序列号来确保数据包的顺序和可靠性。每个 TCP 连接在建立时，通信双方都会选择一个初始序列号。

#### 详细解释：

- **初始序列号的选择**：在 TCP 连接建立时，客户端和服务器都会选择一个初始序列号。这个序列号通常是一个随机数，以增加安全性，防止某些类型的攻击（如序列号预测攻击）。
- **SYN 包**：在 TCP 的三次握手过程中，客户端发送的第一个包（SYN 包）会携带一个初始序列号。服务器在接收到 SYN 包后，会回复一个 SYN-ACK 包，其中包含服务器选择的初始序列号。
- **序列号的使用**：在连接建立后，数据包的序列号会基于初始序列号递增。每个数据包的序列号表示该数据包中数据的第一个字节的编号。

### 2. `paws`（Protect Against Wrapped Sequence numbers）

`paws` 是 TCP 中的一种机制，用于防止序列号回绕（Sequence Number Wrap-around）。序列号是一个 32 位的无符号整数，当数据传输量非常大时，序列号可能会回绕到初始值，导致旧数据包被误认为是新数据包。

#### 详细解释：

- **序列号回绕问题**：由于序列号是 32 位的，当数据传输量非常大时，序列号可能会从最大值（2^32 - 1）回绕到 0。这会导致旧的数据包被误认为是新的数据包，从而引发数据混乱。
- **PAWS 机制**：PAWS 机制通过在 TCP 选项中添加时间戳（Timestamp）来解决这个问题。每个数据包都会携带一个时间戳，接收方可以根据时间戳来判断数据包的顺序，即使序列号回绕，也能正确处理数据包。
- **时间戳选项**：时间戳选项包含两个 32 位的字段：发送方时间戳和接收方时间戳。发送方在发送数据包时会记录当前时间戳，接收方在接收到数据包时会检查时间戳，确保数据包的顺序正确。

### 3. NAT（网络地址转换）是否会转换序列号（seq）？

NAT（网络地址转换）主要用于修改 IP 地址和端口号，但它不会直接修改 TCP 或 UDP 数据包中的序列号（seq）或确认号（ack）。

#### 详细解释：

- **NAT 的工作原理**：NAT 主要用于将私有 IP 地址转换为公共 IP 地址，以便多个设备可以通过一个公共 IP 地址访问互联网。NAT 会修改数据包的源 IP 地址和端口号，或者目标 IP 地址和端口号。
- **序列号和确认号的保留**：NAT 不会修改 TCP 或 UDP 数据包中的序列号（seq）或确认号（ack）。这些字段是由发送方和接收方在 TCP 连接中维护的，用于确保数据包的顺序和可靠性。
- **NAT 对 TCP 连接的影响**：虽然 NAT 不会修改序列号和确认号，但它可能会影响 TCP 连接的建立和维护。例如，NAT 可能会导致某些类型的 NAT 穿透问题，特别是在使用 P2P 应用时。

### 总结：

- `isn` 是 TCP 连接的初始序列号，用于确保数据包的顺序和可靠性。
- `paws` 是 TCP 中的一种机制，用于防止序列号回绕，确保数据包的顺序正确。
- NAT 主要用于修改 IP 地址和端口号，不会直接修改 TCP 或 UDP 数据包中的序列号（seq）或确认号（ack）。

Q：FIN_WAIT_2 超时时间是 tcp_fin_timeout 控制，TIME_WAIT 默认也60s，但/proc/sys/net/ipv4/下没有wait相关文件名，TIME_WAIT 是与 FIN_WAIT_2 共用了同一个选项吗?

A：默认内核里TIME-WAIT时间是不可修改的，也就是没有对应的sysctl选项。