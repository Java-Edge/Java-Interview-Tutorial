# 1 安装JDK
至少1.8.0_73以上版本
```bash
java -version
```
# 2 下载
```bash
brew install elasticsearch
```
![](https://img-blog.csdnimg.cn/2020112214145444.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

# 启动Elasticsearch
es本身特点之一就是开箱即用，如果是中小型应用，数据量少，操作不是很复杂，直接启动就可以用了
```bash
elasticsearch
```

```bash
elasticsearch --version
```
![](https://img-blog.csdnimg.cn/20201122154221607.png#pic_center)
```bash
[2020-11-22T14:57:44,933][INFO ][o.e.n.Node               ] [AppledeMac-mini.local] version[7.9.2-SNAPSHOT], pid[16495], build[oss/tar/unknown/2020-10-03T08:22:40.976826Z], OS[Mac OS X/10.15.7/x86_64], JVM[Oracle Corporation/OpenJDK 64-Bit Server VM/14.0.1/14.0.1+14]
[2020-11-22T14:57:44,936][INFO ][o.e.n.Node               ] [AppledeMac-mini.local] JVM home [/usr/local/Cellar/openjdk/14.0.1/libexec/openjdk.jdk/Contents/Home]
[2020-11-22T14:57:44,937][INFO ][o.e.n.Node               ] [AppledeMac-mini.local] JVM arguments [-Xshare:auto, -Des.networkaddress.cache.ttl=60, -Des.networkaddress.cache.negative.ttl=10, -XX:+AlwaysPreTouch, -Xss1m, -Djava.awt.headless=true, -Dfile.encoding=UTF-8, -Djna.nosys=true, -XX:-OmitStackTraceInFastThrow, -XX:+ShowCodeDetailsInExceptionMessages, -Dio.netty.noUnsafe=true, -Dio.netty.noKeySetOptimization=true, -Dio.netty.recycler.maxCapacityPerThread=0, -Dio.netty.allocator.numDirectArenas=0, -Dlog4j.shutdownHookEnabled=false, -Dlog4j2.disable.jmx=true, -Djava.locale.providers=SPI,COMPAT, -Xms1g, -Xmx1g, -XX:+UseG1GC, -XX:G1ReservePercent=25, -XX:InitiatingHeapOccupancyPercent=30, -Djava.io.tmpdir=/var/folders/gd/7v6l67j50mx_bvxd4w04fh9h0000gn/T/elasticsearch-2351844098276453547, -XX:+HeapDumpOnOutOfMemoryError, -XX:HeapDumpPath=data, -XX:ErrorFile=logs/hs_err_pid%p.log, -Xlog:gc*,gc+age=trace,safepoint:file=/usr/local/var/log/elasticsearch/gc.log:utctime,pid,tags:filecount=32,filesize=64m, -XX:MaxDirectMemorySize=536870912, -Des.path.home=/usr/local/Cellar/elasticsearch/7.9.2/libexec, -Des.path.conf=/usr/local/etc/elasticsearch, -Des.distribution.flavor=oss, -Des.distribution.type=tar, -Des.bundled_jdk=false]
[2020-11-22T14:57:44,937][WARN ][o.e.n.Node               ] [AppledeMac-mini.local] version [7.9.2-SNAPSHOT] is a pre-release version of Elasticsearch and is not suitable for production
[2020-11-22T14:57:45,731][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [aggs-matrix-stats]
[2020-11-22T14:57:45,731][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [analysis-common]
[2020-11-22T14:57:45,731][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [geo]
[2020-11-22T14:57:45,732][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [ingest-common]
[2020-11-22T14:57:45,732][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [ingest-geoip]
[2020-11-22T14:57:45,732][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [ingest-user-agent]
[2020-11-22T14:57:45,732][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [kibana]
[2020-11-22T14:57:45,732][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [lang-expression]
[2020-11-22T14:57:45,733][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [lang-mustache]
[2020-11-22T14:57:45,733][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [lang-painless]
[2020-11-22T14:57:45,733][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [mapper-extras]
[2020-11-22T14:57:45,733][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [parent-join]
[2020-11-22T14:57:45,733][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [percolator]
[2020-11-22T14:57:45,734][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [rank-eval]
[2020-11-22T14:57:45,734][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [reindex]
[2020-11-22T14:57:45,734][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [repository-url]
[2020-11-22T14:57:45,734][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [tasks]
[2020-11-22T14:57:45,735][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] loaded module [transport-netty4]
[2020-11-22T14:57:45,735][INFO ][o.e.p.PluginsService     ] [AppledeMac-mini.local] no plugins loaded
[2020-11-22T14:57:45,776][INFO ][o.e.e.NodeEnvironment    ] [AppledeMac-mini.local] using [1] data paths, mounts [[/System/Volumes/Data (/dev/disk1s2)]], net usable_space [332.2gb], net total_space [465.6gb], types [apfs]
[2020-11-22T14:57:45,777][INFO ][o.e.e.NodeEnvironment    ] [AppledeMac-mini.local] heap size [1gb], compressed ordinary object pointers [true]
[2020-11-22T14:57:45,823][INFO ][o.e.n.Node               ] [AppledeMac-mini.local] node name [AppledeMac-mini.local], node ID [jHttjUoGRumT-noY43O0pA], cluster name [elasticsearch_brew]
[2020-11-22T14:57:48,070][INFO ][o.e.t.NettyAllocator     ] [AppledeMac-mini.local] creating NettyAllocator with the following configs: [name=unpooled, factors={es.unsafe.use_unpooled_allocator=false, g1gc_enabled=true, g1gc_region_size=1mb, heap_size=1gb}]
[2020-11-22T14:57:48,119][INFO ][o.e.d.DiscoveryModule    ] [AppledeMac-mini.local] using discovery type [zen] and seed hosts providers [settings]
[2020-11-22T14:57:48,297][WARN ][o.e.g.DanglingIndicesState] [AppledeMac-mini.local] gateway.auto_import_dangling_indices is disabled, dangling indices will not be automatically detected or imported and must be managed manually
[2020-11-22T14:57:48,403][INFO ][o.e.n.Node               ] [AppledeMac-mini.local] initialized
[2020-11-22T14:57:48,403][INFO ][o.e.n.Node               ] [AppledeMac-mini.local] starting ...
[2020-11-22T14:57:48,520][INFO ][o.e.t.TransportService   ] [AppledeMac-mini.local] publish_address {127.0.0.1:9300}, bound_addresses {[::1]:9300}, {127.0.0.1:9300}
[2020-11-22T14:57:48,699][WARN ][o.e.b.BootstrapChecks    ] [AppledeMac-mini.local] the default discovery settings are unsuitable for production use; at least one of [discovery.seed_hosts, discovery.seed_providers, cluster.initial_master_nodes] must be configured
[2020-11-22T14:57:48,708][INFO ][o.e.c.c.ClusterBootstrapService] [AppledeMac-mini.local] no discovery configuration found, will perform best-effort cluster bootstrapping after [3s] unless existing master is discovered
[2020-11-22T14:57:51,712][INFO ][o.e.c.c.Coordinator      ] [AppledeMac-mini.local] setting initial configuration to VotingConfiguration{jHttjUoGRumT-noY43O0pA}
[2020-11-22T14:57:51,823][INFO ][o.e.c.s.MasterService    ] [AppledeMac-mini.local] elected-as-master ([1] nodes joined)[{AppledeMac-mini.local}{jHttjUoGRumT-noY43O0pA}{M0fYmhtVRMS_n0dsGytG5g}{127.0.0.1}{127.0.0.1:9300}{dimr} elect leader, _BECOME_MASTER_TASK_, _FINISH_ELECTION_], term: 1, version: 1, delta: master node changed {previous [], current [{AppledeMac-mini.local}{jHttjUoGRumT-noY43O0pA}{M0fYmhtVRMS_n0dsGytG5g}{127.0.0.1}{127.0.0.1:9300}{dimr}]}
[2020-11-22T14:57:51,875][INFO ][o.e.c.c.CoordinationState] [AppledeMac-mini.local] cluster UUID set to [VxIeMldTRDS2C47jc_Y7Jg]
[2020-11-22T14:57:51,935][INFO ][o.e.c.s.ClusterApplierService] [AppledeMac-mini.local] master node changed {previous [], current [{AppledeMac-mini.local}{jHttjUoGRumT-noY43O0pA}{M0fYmhtVRMS_n0dsGytG5g}{127.0.0.1}{127.0.0.1:9300}{dimr}]}, term: 1, version: 1, reason: Publication{term=1, version=1}
[2020-11-22T14:57:51,954][INFO ][o.e.h.AbstractHttpServerTransport] [AppledeMac-mini.local] publish_address {127.0.0.1:9200}, bound_addresses {[::1]:9200}, {127.0.0.1:9200}
[2020-11-22T14:57:51,954][INFO ][o.e.n.Node               ] [AppledeMac-mini.local] started
[2020-11-22T14:57:51,984][INFO ][o.e.g.GatewayService     ] [AppledeMac-mini.local] recovered [0] indices into cluster_state
[2020-11-22T14:58:09,209][INFO ][o.e.c.m.MetadataCreateIndexService] [AppledeMac-mini.local] [.kibana_1] creating index, cause [api], templates [], shards [1]/[1]
[2020-11-22T14:58:09,218][INFO ][o.e.c.r.a.AllocationService] [AppledeMac-mini.local] updating number_of_replicas to [0] for indices [.kibana_1]
[2020-11-22T14:58:09,582][INFO ][o.e.c.r.a.AllocationService] [AppledeMac-mini.local] Cluster health status changed from [YELLOW] to [GREEN] (reason: [shards started [[.kibana_1][0]]]).
[2020-11-22T14:58:56,633][INFO ][o.e.c.m.MetadataCreateIndexService] [AppledeMac-mini.local] [kibana_sample_data_ecommerce] creating index, cause [api], templates [], shards [1]/[1]
[2020-11-22T14:58:56,635][INFO ][o.e.c.r.a.AllocationService] [AppledeMac-mini.local] updating number_of_replicas to [0] for indices [kibana_sample_data_ecommerce]
[2020-11-22T14:58:56,901][INFO ][o.e.c.r.a.AllocationService] [AppledeMac-mini.local] Cluster health status changed from [YELLOW] to [GREEN] (reason: [shards started [[kibana_sample_data_ecommerce][0]]]).
[2020-11-22T14:59:00,388][INFO ][o.e.c.m.MetadataMappingService] [AppledeMac-mini.local] [.kibana_1/FRGMCYCXT66CQEP5lLVleQ] update_mapping [_doc]
[2020-11-22T14:59:00,452][INFO ][o.e.c.m.MetadataMappingService] [AppledeMac-mini.local] [.kibana_1/FRGMCYCXT66CQEP5lLVleQ] update_mapping [_doc]
[2020-11-22T14:59:00,509][INFO ][o.e.c.m.MetadataMappingService] [AppledeMac-mini.local] [.kibana_1/FRGMCYCXT66CQEP5lLVleQ] update_mapping [_doc]
[2020-11-22T14:59:00,567][INFO ][o.e.c.m.MetadataMappingService] [AppledeMac-mini.local] [.kibana_1/FRGMCYCXT66CQEP5lLVleQ] update_mapping [_doc]
[2020-11-22T14:59:01,663][INFO ][o.e.c.m.MetadataMappingService] [AppledeMac-mini.local] [.kibana_1/FRGMCYCXT66CQEP5lLVleQ] update_mapping [_doc]
```
![](https://img-blog.csdnimg.cn/20201122154053718.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

# 4 检查ES是否启动成功：http://localhost:9200/?pretty

name: node名称
cluster_name: 集群名称（默认的集群名称就是elasticsearch）
version.number: 5.2.0，es版本号
![](https://img-blog.csdnimg.cn/20191117222753528.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
# 5 修改集群名称：elasticsearch.yml
# 6 安装Kibana
使用里面的开发界面，去操作elasticsearch，作为我们学习es知识点的一个主要的界面入口

Kibana是ES的一个配套工具，让用户在网页中可以直接与ES进行交互。
安装命令：
```bash
brew install kibana
```

```bash
➜  ~ brew install kibana
==> Downloading https://homebrew.bintray.com/bottles/icu4c-67.1.catalina.bottle.tar.gz
==> Downloading from https://d29vzk4ow07wi7.cloudfront.net/2d1e91b5127f66e7941790c004817c94c892725c88f84f1e4c37297fcbc0c72f?res
######################################################################## 100.0%
==> Downloading https://homebrew.bintray.com/bottles/node%4010-10.22.1.catalina.bottle.tar.gz
==> Downloading from https://d29vzk4ow07wi7.cloudfront.net/19bbe37c6f2500673abd3c527df1bb70ea377d9830af32455b4992c94ab592d8?res
######################################################################## 100.0%
==> Downloading https://homebrew.bintray.com/bottles/kibana-7.8.1_1.catalina.bottle.tar.gz
==> Downloading from https://d29vzk4ow07wi7.cloudfront.net/ab4ebbdabe531a35369b61b5770d0b7a0028a21ec8cdd1dfc7070041c1fa358e?res
######################################################################## 100.0%
==> Installing dependencies for kibana: icu4c and node@10
==> Installing kibana dependency: icu4c
==> Pouring icu4c-67.1.catalina.bottle.tar.gz
==> Caveats
icu4c is keg-only, which means it was not symlinked into /usr/local,
because macOS provides libicucore.dylib (but nothing else).

If you need to have icu4c first in your PATH run:
  echo 'export PATH="/usr/local/opt/icu4c/bin:$PATH"' >> ~/.zshrc
  echo 'export PATH="/usr/local/opt/icu4c/sbin:$PATH"' >> ~/.zshrc

For compilers to find icu4c you may need to set:
  export LDFLAGS="-L/usr/local/opt/icu4c/lib"
  export CPPFLAGS="-I/usr/local/opt/icu4c/include"

==> Summary
🍺  /usr/local/Cellar/icu4c/67.1: 258 files, 71.2MB
==> Installing kibana dependency: node@10
==> Pouring node@10-10.22.1.catalina.bottle.tar.gz
==> Caveats
node@10 is keg-only, which means it was not symlinked into /usr/local,
because this is an alternate version of another formula.

If you need to have node@10 first in your PATH run:
  echo 'export PATH="/usr/local/opt/node@10/bin:$PATH"' >> ~/.zshrc

For compilers to find node@10 you may need to set:
  export LDFLAGS="-L/usr/local/opt/node@10/lib"
  export CPPFLAGS="-I/usr/local/opt/node@10/include"

==> Summary
🍺  /usr/local/Cellar/node@10/10.22.1: 4,266 files, 53.7MB
==> Installing kibana
==> Pouring kibana-7.8.1_1.catalina.bottle.tar.gz
==> Caveats
Config: /usr/local/etc/kibana/
If you wish to preserve your plugins upon upgrade, make a copy of
/usr/local/opt/kibana/plugins before upgrading, and copy it into the
new keg location after upgrading.

To have launchd start kibana now and restart at login:
  brew services start kibana
Or, if you don't want/need a background service you can just run:
  kibana
==> Summary
🍺  /usr/local/Cellar/kibana/7.8.1_1: 60,210 files, 440MB
==> Caveats
==> icu4c
icu4c is keg-only, which means it was not symlinked into /usr/local,
because macOS provides libicucore.dylib (but nothing else).

If you need to have icu4c first in your PATH run:
  echo 'export PATH="/usr/local/opt/icu4c/bin:$PATH"' >> ~/.zshrc
  echo 'export PATH="/usr/local/opt/icu4c/sbin:$PATH"' >> ~/.zshrc

For compilers to find icu4c you may need to set:
  export LDFLAGS="-L/usr/local/opt/icu4c/lib"
  export CPPFLAGS="-I/usr/local/opt/icu4c/include"

==> node@10
node@10 is keg-only, which means it was not symlinked into /usr/local,
because this is an alternate version of another formula.

If you need to have node@10 first in your PATH run:
  echo 'export PATH="/usr/local/opt/node@10/bin:$PATH"' >> ~/.zshrc

For compilers to find node@10 you may need to set:
  export LDFLAGS="-L/usr/local/opt/node@10/lib"
  export CPPFLAGS="-I/usr/local/opt/node@10/include"

==> kibana
Config: /usr/local/etc/kibana/
If you wish to preserve your plugins upon upgrade, make a copy of
/usr/local/opt/kibana/plugins before upgrading, and copy it into the
new keg location after upgrading.

To have launchd start kibana now and restart at login:
  brew services start kibana
Or, if you don't want/need a background service you can just run:
  kibana
```

安装完成后直接执行kibana命令启动Kibana启动Kibana

```bash
-> ~ kibana
  log   [06:58:07.910] [warning][plugins-discovery] Expect plugin "id" in camelCase, but found: apm_oss
  log   [06:58:08.641] [info][plugins-service] Plugin "visTypeXy" is disabled.
  log   [06:58:08.787] [info][plugins-system] Setting up [42] plugins: [usageCollection,telemetryCollectionManager,telemetry,kibanaLegacy,devTools,uiActions,statusPage,share,newsfeed,mapsLegacy,kibanaUtils,kibanaReact,indexPatternManagement,inspector,embeddable,esUiShared,discover,charts,bfetch,expressions,data,home,console,apm_oss,management,advancedSettings,telemetryManagementSection,visualizations,visTypeVislib,visTypeTimeseries,visTypeVega,visTypeTimelion,visTypeTable,visTypeTagcloud,visTypeMetric,visTypeMarkdown,inputControlVis,savedObjects,navigation,visualize,dashboard,savedObjectsManagement]
  log   [06:58:08.925] [info][savedobjects-service] Waiting until all Elasticsearch nodes are compatible with Kibana before starting saved objects migrations...
  log   [06:58:09.022] [info][savedobjects-service] Starting saved objects migrations
  log   [06:58:09.044] [info][savedobjects-service] Creating index .kibana_1.
  log   [06:58:09.626] [info][savedobjects-service] Pointing alias .kibana to .kibana_1.
  log   [06:58:09.700] [info][savedobjects-service] Finished in 662ms.
  log   [06:58:09.701] [info][plugins-system] Starting [27] plugins: [usageCollection,telemetryCollectionManager,telemetry,kibanaLegacy,share,discover,bfetch,expressions,data,home,console,apm_oss,management,advancedSettings,visualizations,visTypeVislib,visTypeTimeseries,visTypeVega,visTypeTimelion,visTypeTable,visTypeTagcloud,visTypeMetric,visTypeMarkdown,inputControlVis,visualize,dashboard,savedObjectsManagement]
  log   [06:58:11.765] [info][status][plugin:console_legacy@7.8.1] Status changed from uninitialized to green - Ready
  log   [06:58:11.767] [info][status][plugin:apm_oss@7.8.1] Status changed from uninitialized to green - Ready
  log   [06:58:11.769] [info][status][plugin:kibana@7.8.1] Status changed from uninitialized to green - Ready
  log   [06:58:11.772] [info][status][plugin:elasticsearch@7.8.1] Status changed from uninitialized to yellow - Waiting for Elasticsearch
  log   [06:58:11.772] [warning] You're running Kibana 7.8.1 with some different versions of Elasticsearch. Update Kibana or Elasticsearch to the same version to prevent compatibility issues: v7.9.2 @ 127.0.0.1:9200 (127.0.0.1)
  log   [06:58:11.773] [info][status][plugin:elasticsearch@7.8.1] Status changed from yellow to green - Ready
  log   [06:58:11.774] [info][status][plugin:region_map@7.8.1] Status changed from uninitialized to green - Ready
  log   [06:58:11.776] [info][status][plugin:ui_metric@7.8.1] Status changed from uninitialized to green - Ready
  log   [06:58:11.780] [info][listening] Server running at http://localhost:5601
  log   [06:58:11.804] [info][server][Kibana][http] http server running at http://localhost:5601
```

![](https://img-blog.csdnimg.cn/20201122150330595.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

# 7 进入Kibana界面
- http://localhost:5601
![](https://img-blog.csdnimg.cn/20191117223248477.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 刚进入，会推荐我们选择安装官方自带的样例数据![](https://img-blog.csdnimg.cn/20201122150506282.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- 切换到 Dev Tools![](https://img-blog.csdnimg.cn/20201122153343847.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
