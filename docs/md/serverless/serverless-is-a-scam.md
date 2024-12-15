# Serverless不香了？深扒其背后的巨大骗局！

Serverless解决方案正逐渐回归到服务器上。我最近在《Serverless悼词》（A Eulogy For Serverless）一文中讨论了这个问题。这篇文章的最初想法是我对另一篇关于微服务的文章的更新。但后来我开始写这篇文章时，就有了一些创意。最终的结果就是这篇观点多于事实的文章。



我还以为这没什么。我的意思是，每个人都知道Serverless是个骗局，对吗？看来不是。所以我收到了很多负面评论。我还记得第一次出现这种情况时，有人发了三条错误的评论。其中一条是关于 SQLite 的，说什么真正的公司不会使用 SQLite。也许我不该参与其中，但我还是发表了评论，说 SQLite 可以很好地扩展到中等规模的任务。

但另外两条评论则纯粹是在咆哮，说我不知道自己在说什么，而他们这些大坏蛋 Azure 程序员却知道Serverless是如何工作的。这让我想起了我上一篇文章《为什么微服务是Serverless的最佳选择》中的这一部分：

> 提供如此多的服务还有另一个好处。如果我们把服务做得过于复杂，我们就可以通过提供培训实现双赢。而且，由于使用的是我们的商标，我们可以控制它的一切。

> 事实上，我们还可以三倍增长，因为这也是免费广告。甚至是四倍，因为现在人们找的不是 "Go 程序员"、"Unix 程序员 "或".Net 程序员"，而是 "AWS 程序员"。这就好比我们自创了一门编程语言，但我们并没有这么做，而是偷窃了开源代码，并将其包装成专有软件包。这才是抢劫。

我本该加上第四条：我们可以四面出击。因为现在你有一群 "AWS 高级程序员 "或 "Azure 高级程序员 "或 "GCP 高级程序员"，他们会为我们鼓吹，因为这简直就是他们的饭碗。这就像那些在比特币上花了一大笔钱的人，所以不管出于什么原因，他们都在黑别人的 YouTube 频道来推广比特币。但对我们来说，它是Serverless的。台词是什么？"当一个人的薪水取决于他对某件事情的理解程度时 很难让他理解这件事"在这里也是一样我想在山谷里，他们称之为 "飞轮"。

我认为这是我在那篇文章上受到的所有反击的主要原因。如果你看一下评论，就会发现有很多攻击，但实质内容却很少。虽然不是所有的评论都是这样，但那篇文章中也有一些很好的论点。最突出的论点就是你获得了 DDoS 保护。

## DDoS

这里有一个关键的区别，你可以获得免费的 DDoS 保护。当你在新闻中听到有人如何缓解了巨大的 DDoS 攻击时，他们可能说的是付费产品。


此外，通过 Cloudflare，您完全可以在不使用Serverless的情况下获得同样的 DDoS 保护。您只需打开他们的 "代理 "功能即可。这允许 Cloudflare 拦截 DDoS 攻击，类似于Serverless DDoS 保护产品。


不过需要注意的是，我第一次打开代理功能时，出现了无限重定向循环。有一个简单的解决方法，只需将 SSL/TLS 加密模式从 "灵活 "切换到 "完全 "即可。这样就能完美运行，无需任何配置，只需单击即可实现全面的 DDoS 保护。

## Complexity 复杂性

这就是Serverless产品的另一个问题：它们太他妈复杂了。当谷歌让一个价值1350亿美元的养老基金化为乌有时，我曾写过一篇关于这个问题的文章。原因何在？配置中缺少一个字段。


"但你说我绝不会那么做"哦，是吗？那你给我解释一下，为什么会有那么多人忘记更改默认的 S3 存储桶，导致用户的账单爆炸。这里面错得太多了。AWS 不应该向他们收取写入失败的费用，公司也不应该将大量可能是机密的数据写入某个随机的默认位置。


因此，它不仅是配置方面的噩梦，也是安全方面的噩梦。如果你有一个 VPS，那么锁定它就非常简单了。互联网上到处都有这样做的教程，首先你要安装 fail2ban 并禁用 root 用户的密码登录。但在Serverless上呢？祝你好运。尤其是在使用微服务的情况下，Serverless公司非常喜欢微服务（他们为什么不喜欢呢？）因为微服务通过 HTTP/S 请求进行通信，所以你最好单独锁定每个微服务。你最好查看每个微服务，找出正确的命令组合来锁定它。这可是个大工程。现在你明白为什么有那么多人在鼓吹Serverless了吧：如果Serverless消失了，那么很多人都会失业。这是一个巨大的金字塔计划。

## Uptime 正常运行时间


但至少还有正常运行时间。对吧？好吧，自从我的 RSS 阅读器改用 VPS 后，就再也没有出过故障。也就是说，它从来没有自己宕机过。为了更新一些东西，我重启过几次。但时间通常都很短，不到一秒钟。而Serverless呢？


你知道我说过Serverless太复杂了吗？从逻辑上讲，过于复杂的系统会比简单的系统更不可靠。就拿 Firebase 来说吧。在我使用它的时候，2023 年发生了一次涉及 Firebase Auth 的大规模故障。花了几个小时才解决，非常明显。其他服务也是如此。2023 年，AWS 在西海岸也发生了 EC2 故障。此外，Azure 也在 2023 年发生了自己的故障，不过这次故障似乎是由电源浪涌引起的，因此更容易理解。2023 年？

正如我之前所说：

> 我对这些 "9 "持高度怀疑态度，因为如果你的某个员工不小心弄掉了一个表什么的（以前也发生过），那就等于一大堆 "9 "没了。在我看来，云数据库面临的最大威胁是 "胖手指"，而不是自然灾害。


另外，我想重申一下，我的预算 VPS 从未出过问题。我原本很担心，因为我之前那台笨拙的 puppeteer "服务器 "总是崩溃。但事实证明，PocketBase 和 Go 一直坚如磐石。100% 的正常运行时间。

## Price 价格

最后就是价格了。这个问题我已经说过很多次了，现在感觉自己就像个老唱片。Serverless之所以如此昂贵，是因为它实际上是一种垄断。我的意思是，如果你使用的是像Postgres这样的行业标准，那就不一定了，但在大多数情况下，如果你被锁定在例如AWS上，你就真的离不开它了。再加上巨额的数据出口费用。

<iframe class="" src="https://cdn.embedly.com/widgets/media.html?type=text%2Fhtml&amp;key=a19fcc184b9711e1b4764040d3dc5c07&amp;schema=twitter&amp;url=https%3A//x.com/ImSh4yy/status/1762575172576428241&amp;image=" allowfullscreen="" frameborder="0" height="281" width="500" style="box-sizing: border-box; border: 0px solid rgb(229, 231, 235); --tw-border-spacing-x: 0; --tw-border-spacing-y: 0; --tw-translate-x: 0; --tw-translate-y: 0; --tw-rotate: 0; --tw-skew-x: 0; --tw-skew-y: 0; --tw-scale-x: 1; --tw-scale-y: 1; --tw-pan-x: ; --tw-pan-y: ; --tw-pinch-zoom: ; --tw-scroll-snap-strictness: proximity; --tw-gradient-from-position: ; --tw-gradient-via-position: ; --tw-gradient-to-position: ; --tw-ordinal: ; --tw-slashed-zero: ; --tw-numeric-figure: ; --tw-numeric-spacing: ; --tw-numeric-fraction: ; --tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: rgba(59,130,246,.5); --tw-ring-offset-shadow: 0 0 #0000; --tw-ring-shadow: 0 0 #0000; --tw-shadow: 0 0 #0000; --tw-shadow-colored: 0 0 #0000; --tw-blur: ; --tw-brightness: ; --tw-contrast: ; --tw-grayscale: ; --tw-hue-rotate: ; --tw-invert: ; --tw-saturate: ; --tw-sepia: ; --tw-drop-shadow: ; --tw-backdrop-blur: ; --tw-backdrop-brightness: ; --tw-backdrop-contrast: ; --tw-backdrop-grayscale: ; --tw-backdrop-hue-rotate: ; --tw-backdrop-invert: ; --tw-backdrop-opacity: ; --tw-backdrop-saturate: ; --tw-backdrop-sepia: ; display: block; vertical-align: middle; max-width: 100%; width: 680px; min-height: 240px;"></iframe>


商业法则第一条：竞争是为傻瓜准备的。如果你想赚大钱，你就必须拥有垄断地位，而这些Serverless公司通过让离开变得如此痛苦，有效地做到了这一点。

公司也在慢慢接受。你可能听说过 DHH 如何离开云，以及这将如何为他的公司节省 700 万美元。最近他说："我说的是 700 万美元吗？我是说 1000 万美元。

您可能也听说过亚马逊的这个案例。虽然这并不是真的要离开 AWS，因为他们只是重构了一些东西，但这恰恰说明，如果实施不当，价格很容易失控。这很容易做到，因为如上所述，Serverless是如此复杂。在你认为自己永远不会像亚马逊一样愚蠢之前（在我脑子里听起来更好），我还发现了另一篇关于另一家公司做类似事情的文章。

又一个帖子，又一个帖子，还有这个帖子

<iframe class="" src="https://cdn.embedly.com/widgets/media.html?type=text%2Fhtml&amp;key=a19fcc184b9711e1b4764040d3dc5c07&amp;schema=twitter&amp;url=https%3A//x.com/rameerez/status/1841451179609370748&amp;image=" allowfullscreen="" frameborder="0" height="281" width="500" style="box-sizing: border-box; border: 0px solid rgb(229, 231, 235); --tw-border-spacing-x: 0; --tw-border-spacing-y: 0; --tw-translate-x: 0; --tw-translate-y: 0; --tw-rotate: 0; --tw-skew-x: 0; --tw-skew-y: 0; --tw-scale-x: 1; --tw-scale-y: 1; --tw-pan-x: ; --tw-pan-y: ; --tw-pinch-zoom: ; --tw-scroll-snap-strictness: proximity; --tw-gradient-from-position: ; --tw-gradient-via-position: ; --tw-gradient-to-position: ; --tw-ordinal: ; --tw-slashed-zero: ; --tw-numeric-figure: ; --tw-numeric-spacing: ; --tw-numeric-fraction: ; --tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: rgba(59,130,246,.5); --tw-ring-offset-shadow: 0 0 #0000; --tw-ring-shadow: 0 0 #0000; --tw-shadow: 0 0 #0000; --tw-shadow-colored: 0 0 #0000; --tw-blur: ; --tw-brightness: ; --tw-contrast: ; --tw-grayscale: ; --tw-hue-rotate: ; --tw-invert: ; --tw-saturate: ; --tw-sepia: ; --tw-drop-shadow: ; --tw-backdrop-blur: ; --tw-backdrop-brightness: ; --tw-backdrop-contrast: ; --tw-backdrop-grayscale: ; --tw-backdrop-hue-rotate: ; --tw-backdrop-invert: ; --tw-backdrop-opacity: ; --tw-backdrop-saturate: ; --tw-backdrop-sepia: ; display: block; vertical-align: middle; max-width: 100%; width: 680px; min-height: 240px;"></iframe>

还有这篇文章和这篇文章：

> 别看现在，在英国接受调查的企业中，有25%的企业已经将一半或更多基于云的工作负载迁回了内部基础架构。这是云软件集团（Cloud Software Group）业务部门思杰（Citrix）最近的一项研究结果。

Serverless只是一个无穷无尽的钱坑。为其辩护的人可能从未见过账单。或者他们几乎没怎么用过。我有一款中规中矩的应用，带有关卡编辑器和云保存功能。这些都是非常小众的功能，使用的人并不多，这意味着如果我使用Serverless，就不必为它们支付太多费用。

但对于像 RSS 阅读器这样专注于在线内容的应用程序？你需要自己的 VPS。

Serverless是个骗局。它并不总是骗局。最初，要做到 AWS、GCP 和 Azure 所做的某些事情非常困难。但情况发生了变化。在此之前，你永远不会想推出自己的 auth。但现在呢？有一个库可以实现这一点。现在有很多库，甚至是整个后端：PocketBase、Supabase、Appwrite，可能还有其他的。依赖其他公司提供所有服务的时代已经过去了。因为如果你依赖一家公司提供所有服务，你既要相信这家公司不会滥用其垄断地位，又要相信这家公司的创新速度能超过市场。而云服务提供商在这两方面都失败了。