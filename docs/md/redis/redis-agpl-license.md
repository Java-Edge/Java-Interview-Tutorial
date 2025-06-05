# Redis重回开源：回归AGPL，不觉得晚了吗？

[Redis 8 已于近日正式发布](https://redis.io/blog/redis-8-ga/)，并采用 AGPLv3 开源许可证。一年前，为了对抗云服务商，Redis 放弃了开源路线并引发了 Valkey 项目的诞生。如今，Redis 重新聘请了其创始人，并再次转向开源。

Redis 最初是以较为宽松的 BSD 许可证发布的，但在 2024 年 3 月，项目转向更具限制性的、且不被视为开源的 SSPLv1 许可证，这一变化引发了社区的不安，也促成了 Valkey 的成功分支。而仅仅一年后，Redis 的发展方向再次发生重大转变，Redis 8.0 现在又成为开源软件，这次是采用 OSI 认可的 AGPLv3 许可证。

根据 Redis 官方公告，这一重大版本带来了多个性能提升，包括命令执行速度最高提升 87%、每秒操作吞吐量提升最多 2 倍，以及复制速度提升最多 18%。此外，还推出了新的测试功能 Vector Sets，InfoQ 上对此也有单独报道。Redis 的创始人 [Salvatore Sanfilippo](https://www.linkedin.com/in/salvatore-sanfilippo-b52b47249/)（网名 antirez）[解释说](https://antirez.com/news/151)：

> 五个月前，我重新加入了 Redis，很快就和同事们开始讨论是否切换到 AGPL 许可证，结果发现其实早就有相关讨论了，而且是很早以前就开始的讨论。(...) 写开源软件已经深深地刻在我的职业生涯中：我几乎没写过非开源的软件。现在开始改变也太晚了。

一年前，Redis 转向更严格的许可证后，出现了多个分支，其中最成功的就是得到了 CNCF 支持的 Valkey，许多云服务提供商（包括 AWS 和 Google Cloud）立即表示支持。AWS 推出了专门针对 Valkey 的 ElastiCache 和 MemoryDB 服务，价格比原本基于 Redis 的版本要低不少。

虽然目前 [Valkey 在真实使用场景下的性能优于 Redis 8.0](https://www.gomomento.com/blog/valkey-turns-one-how-the-community-fork-left-redis-in-the-dust/)，但 Momento 的 CEO 兼联合创始人 [Khawaja Shams](https://www.linkedin.com/in/kshams/) 仍然欢迎 Sanfilippo 回归，并写道：

> 我真的很高兴他回来了，这已经带来了实质性影响。他确实履行了承诺，为 Redis 带来了新功能和性能优化。更重要的是，Redis 8.0 再次成为开源项目。

尽管许多人认为使用 Valkey 的开发者[不会轻易回到 Redis](https://www.linkedin.com/posts/peterzaitsev_activity-7324943971397378048-p2GI?utm_source=share&utm_medium=member_desktop&rcm=ACoAABaQ5R4B1z_TPIVzQKBvbJ9SpDn29zaiJcY)，他们也承认 Valkey 面临的竞争会更加激烈。Percona 创始人、开源倡导者 Peter Zaitsev [指出](https://www.linkedin.com/posts/peterzaitsev_release-800-redisredis-activity-7324199641200140288-Ab47) Redis 的一个重要优势：

> 尽管大家都在讨论 Redis 回归开源、采用 AGPLv3 的消息，但很多人可能忽略了，现在的 Redis 已不再是几年前那个基于 BSD 的 Redis 了 —— 现在包括 RedisJSON 在内的多个扩展模块（自 2018 年以来并非开源）如今都已被整合进 Redis，并统一采用 AGPLv3。这可能是对 Valkey 的直接回应，毕竟 Valkey 只继承了“核心”Redis BSD 代码，缺少这些功能。

在文章《[Redis 现在以 AGPLv3 开源许可证发布](https://redis.io/blog/agplv3/)》中确认，除了新数据类型 Vector Sets 外，Redis 8 还将 Redis Stack 中的多个技术集成到核心代码中，包括 JSON、时间序列、概率数据类型和查询引擎，这些都已统一采用 AGPL 许可证。

此次重大版本更新和许可证变更也在 [Reddit](https://www.reddit.com/r/linux/comments/1kcdc2j/redis_is_open_source_again/) 上引发了热议，不少开发者认为这步棋下得太晚，是过去错误决策的结果。有些开发者认为 Redis 最大的资产仍然是它的创始人，而 AboutCode 的维护者 Philippe Ombredanne 则[更为悲观](https://www.linkedin.com/posts/philippeombredanne_redis-license-is-bsd-and-will-remain-bsd-activity-7323828480847081472-D_th?utm_source=share&utm_medium=member_desktop&rcm=ACoAABaQ5R4B1z_TPIVzQKBvbJ9SpDn29zaiJcY)地看待这一转变：

> 用户一眼就能看穿这些操作。对 Redis 来说，它失去的用户基础恐怕已经无法挽回，而信任的破裂也是永久性的。

Redis 并不是第一个因 SSPLv1 引发分支、社区流失和信任危机后又改回 AGPL 的项目。一年前，[Elastic 的创始人兼 CEO Shay Banon](https://www.linkedin.com/in/kimchy)也为 Elasticsearch 和 Kibana 做出了类似决定。