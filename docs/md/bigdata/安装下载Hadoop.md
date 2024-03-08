# 安装下载Hadoop

## 1 下载并解压

```bash
tar -zxvf hadoop-2.6.0-cdh5.15.1.tar.gz
```

![](https://img-blog.csdnimg.cn/74d9ac8111a24c9aae306ecc542ceb0e.png)

```bash
➜  doc vi ~/.bash_profile
➜  doc source ~/.bash_profile
➜  doc echo $HADOOP_HOME
/Users/apple/doc/hadoop-2.6.0-cdh5.15.1
```

## 2 修改配置文件

### hadoop-env.sh

```shell
export JAVA_HOME=/Users/javaedge/Library/Java/JavaVirtualMachines/corretto-1.8.0_362/Contents/Home

```

### core-site.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>

<configuration>
  <property>
    <name>fs.defaultFS</name>
    <value>hdfs://172.16.1.55:9000</value>
  </property>
  <property>
    <name>hadoop.tmp.dir</name>
    <value>/Users/javaedge/Downloads/soft/hadoop-2.6.0-cdh5.15.1/tmp</value>
  </property>
</configuration>


```

### hdfs-site.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>

<configuration>

<!-- 文件系统的副本数 -->
  <property>
    <name>dfs.replication</name>
    <value>1</value>
  </property>

  <!-- NameNode 存储数据的目录 -->
  <property>
    <name>dfs.namenode.name.dir</name>
    <value>/Users/javaedge/Downloads/soft/hadoop-2.6.0-cdh5.15.1/tmp/dfs/name</value>
  </property>

   <!-- DataNode 存储数据的目录 -->
  <property>
    <name>dfs.permission</name>
    <value>false</value>
  </property>  

<!-- HDFS 中的文件和目录权限设置的属性。它决定了在 HDFS 中新创建的文件和目录的默认权限 -->
  <property>
    <name>dfs.datanode.data.dir</name>
    <value>/Users/javaedge/Downloads/soft/hadoop-2.6.0-cdh5.15.1/tmp/dfs/data</value>
  </property>
</configuration>
```

### yarn-site.xml

```xml
<?xml version="1.0"?>
<configuration>

  <!-- Generic YARN configurations -->
  <property>
    <name>yarn.nodemanager.aux-services</name>
    <value>mapreduce_shuffle</value>
    <description>The auxiliary service name used by NodeManagers for map reduce shuffles.</description>
  </property>

</configuration>

```

### mapred-site.xml

```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>

  <property>
    <name>mapreduce.framework.name</name>
    <value>yarn</value>
    <description>The framework name to use.</description>
  </property>

</configuration>

```

## 3 初始化



```bash
javaedge@JavaEdgedeMac-mini bin % ./hdfs namenode -format
23/03/25 23:48:55 INFO namenode.NameNode: STARTUP_MSG:
/************************************************************
STARTUP_MSG: Starting NameNode
STARTUP_MSG:   user = javaedge
STARTUP_MSG:   host = JavaEdgedeMac-mini.local/172.16.1.55
STARTUP_MSG:   args = [-format]
STARTUP_MSG:   version = 2.6.0-cdh5.15.1
STARTUP_MSG:   classpath = 
STARTUP_MSG:   build = http://github.com/cloudera/hadoop -r 2d822203265a2827554b84cbb46c69b86ccca149; compiled by 'jenkins' on 2018-08-09T16:23Z
STARTUP_MSG:   java = 1.8.0_362
************************************************************/
23/03/25 23:48:55 INFO namenode.NameNode: registered UNIX signal handlers for [TERM, HUP, INT]
23/03/25 23:48:55 INFO namenode.NameNode: createNameNode [-format]
23/03/25 23:48:56 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
23/03/25 23:48:56 WARN common.Util: Path /Users/javaedge/Downloads/soft/hadoop-2.6.0-cdh5.15.1/tmp/dfs/name should be specified as a URI in configuration files. Please update hdfs configuration.
23/03/25 23:48:56 WARN common.Util: Path /Users/javaedge/Downloads/soft/hadoop-2.6.0-cdh5.15.1/tmp/dfs/name should be specified as a URI in configuration files. Please update hdfs configuration.
Formatting using clusterid: CID-964e69db-6a76-463e-bf84-2975109581db
23/03/25 23:48:56 INFO namenode.FSEditLog: Edit logging is async:true
23/03/25 23:48:56 INFO namenode.FSNamesystem: No KeyProvider found.
23/03/25 23:48:56 INFO namenode.FSNamesystem: fsLock is fair: true
23/03/25 23:48:56 INFO blockmanagement.DatanodeManager: dfs.block.invalidate.limit=1000
23/03/25 23:48:56 INFO blockmanagement.DatanodeManager: dfs.namenode.datanode.registration.ip-hostname-check=true
23/03/25 23:48:56 INFO blockmanagement.BlockManager: dfs.namenode.startup.delay.block.deletion.sec is set to 000:00:00:00.000
23/03/25 23:48:56 INFO blockmanagement.BlockManager: The block deletion will start around 2023 三月 25 23:48:56
23/03/25 23:48:56 INFO util.GSet: Computing capacity for map BlocksMap
23/03/25 23:48:56 INFO util.GSet: VM type       = 64-bit
23/03/25 23:48:56 INFO util.GSet: 2.0% max memory 889 MB = 17.8 MB
23/03/25 23:48:56 INFO util.GSet: capacity      = 2^21 = 2097152 entries
23/03/25 23:48:56 INFO blockmanagement.BlockManager: dfs.block.access.token.enable=false
23/03/25 23:48:56 WARN conf.Configuration: No unit for dfs.heartbeat.interval(3) assuming SECONDS
23/03/25 23:48:56 INFO blockmanagement.BlockManager: defaultReplication         = 1
23/03/25 23:48:56 INFO blockmanagement.BlockManager: maxReplication             = 512
23/03/25 23:48:56 INFO blockmanagement.BlockManager: minReplication             = 1
23/03/25 23:48:56 INFO blockmanagement.BlockManager: maxReplicationStreams      = 2
23/03/25 23:48:56 INFO blockmanagement.BlockManager: replicationRecheckInterval = 3000
23/03/25 23:48:56 INFO blockmanagement.BlockManager: encryptDataTransfer        = false
23/03/25 23:48:56 INFO blockmanagement.BlockManager: maxNumBlocksToLog          = 1000
23/03/25 23:48:56 INFO namenode.FSNamesystem: fsOwner             = javaedge (auth:SIMPLE)
23/03/25 23:48:56 INFO namenode.FSNamesystem: supergroup          = supergroup
23/03/25 23:48:56 INFO namenode.FSNamesystem: isPermissionEnabled = true
23/03/25 23:48:56 INFO namenode.FSNamesystem: HA Enabled: false
23/03/25 23:48:56 INFO namenode.FSNamesystem: Append Enabled: true
23/03/25 23:48:56 INFO util.GSet: Computing capacity for map INodeMap
23/03/25 23:48:56 INFO util.GSet: VM type       = 64-bit
23/03/25 23:48:56 INFO util.GSet: 1.0% max memory 889 MB = 8.9 MB
23/03/25 23:48:56 INFO util.GSet: capacity      = 2^20 = 1048576 entries
23/03/25 23:48:56 INFO namenode.FSDirectory: POSIX ACL inheritance enabled? false
23/03/25 23:48:56 INFO namenode.NameNode: Caching file names occuring more than 10 times
23/03/25 23:48:56 INFO snapshot.SnapshotManager: Loaded config captureOpenFiles: false, skipCaptureAccessTimeOnlyChange: false, snapshotDiffAllowSnapRootDescendant: true
23/03/25 23:48:56 INFO util.GSet: Computing capacity for map cachedBlocks
23/03/25 23:48:56 INFO util.GSet: VM type       = 64-bit
23/03/25 23:48:56 INFO util.GSet: 0.25% max memory 889 MB = 2.2 MB
23/03/25 23:48:56 INFO util.GSet: capacity      = 2^18 = 262144 entries
23/03/25 23:48:56 INFO namenode.FSNamesystem: dfs.namenode.safemode.threshold-pct = 0.9990000128746033
23/03/25 23:48:56 INFO namenode.FSNamesystem: dfs.namenode.safemode.min.datanodes = 0
23/03/25 23:48:56 INFO namenode.FSNamesystem: dfs.namenode.safemode.extension     = 30000
23/03/25 23:48:56 INFO metrics.TopMetrics: NNTop conf: dfs.namenode.top.window.num.buckets = 10
23/03/25 23:48:56 INFO metrics.TopMetrics: NNTop conf: dfs.namenode.top.num.users = 10
23/03/25 23:48:56 INFO metrics.TopMetrics: NNTop conf: dfs.namenode.top.windows.minutes = 1,5,25
23/03/25 23:48:56 INFO namenode.FSNamesystem: Retry cache on namenode is enabled
23/03/25 23:48:56 INFO namenode.FSNamesystem: Retry cache will use 0.03 of total heap and retry cache entry expiry time is 600000 millis
23/03/25 23:48:56 INFO util.GSet: Computing capacity for map NameNodeRetryCache
23/03/25 23:48:56 INFO util.GSet: VM type       = 64-bit
23/03/25 23:48:56 INFO util.GSet: 0.029999999329447746% max memory 889 MB = 273.1 KB
23/03/25 23:48:56 INFO util.GSet: capacity      = 2^15 = 32768 entries
23/03/25 23:48:56 INFO namenode.FSNamesystem: ACLs enabled? false
23/03/25 23:48:56 INFO namenode.FSNamesystem: XAttrs enabled? true
23/03/25 23:48:56 INFO namenode.FSNamesystem: Maximum size of an xattr: 16384
23/03/25 23:48:56 INFO namenode.FSImage: Allocated new BlockPoolId: BP-197026088-172.16.1.55-1679759336523
23/03/25 23:48:56 INFO common.Storage: Storage directory /Users/javaedge/Downloads/soft/hadoop-2.6.0-cdh5.15.1/tmp/dfs/name has been successfully formatted.
23/03/25 23:48:56 INFO namenode.FSImageFormatProtobuf: Saving image file /Users/javaedge/Downloads/soft/hadoop-2.6.0-cdh5.15.1/tmp/dfs/name/current/fsimage.ckpt_0000000000000000000 using no compression
23/03/25 23:48:56 INFO namenode.FSImageFormatProtobuf: Image file /Users/javaedge/Downloads/soft/hadoop-2.6.0-cdh5.15.1/tmp/dfs/name/current/fsimage.ckpt_0000000000000000000 of size 325 bytes saved in 0 seconds .
23/03/25 23:48:56 INFO namenode.NNStorageRetentionManager: Going to retain 1 images with txid >= 0
23/03/25 23:48:56 INFO util.ExitUtil: Exiting with status 0
23/03/25 23:48:56 INFO namenode.NameNode: SHUTDOWN_MSG:
/************************************************************
SHUTDOWN_MSG: Shutting down NameNode at JavaEdgedeMac-mini.local/172.16.1.55
************************************************************/
```

## HDFS的启动

```bash
javaedge@JavaEdgedeMac-mini sbin % ./hadoop-daemon.sh start namenode
starting namenode, logging to /Users/javaedge/Downloads/soft/hadoop-2.6.0-cdh5.15.1/logs/hadoop-javaedge-namenode-JavaEdgedeMac-mini.local.out

javaedge@JavaEdgedeMac-mini sbin % ./hadoop-daemon.sh start datanode
starting datanode, logging to /Users/javaedge/Downloads/soft/hadoop-2.6.0-cdh5.15.1/logs/hadoop-javaedge-datanode-JavaEdgedeMac-mini.local.out
```

```
javaedge@JavaEdgedeMac-mini sbin % jps
39552 DataNode
36654 NameNode
```

打开控制台：

http://localhost:50070/dfshealth.html#tab-overview

![](https://img-blog.csdnimg.cn/beff4a2bc94147db9a9a68d23371afaa.png)

## HDFS的停止

注意顺序和启动时相反：

```
javaedge@JavaEdgedeMac-mini sbin % ./hadoop-daemon.sh stop datanode
stopping datanode

javaedge@JavaEdgedeMac-mini sbin % ./hadoop-daemon.sh stop namenode
stopping namenode
```

## 业务操作

```bash
javaedge@JavaEdgedeMac-mini sbin % hadoop fs -ls /

// 创建 pk 目录
javaedge@JavaEdgedeMac-mini sbin % hadoop fs -mkdir /pk
javaedge@JavaEdgedeMac-mini sbin % hadoop fs -ls /
Found 1 items
drwxr-xr-x   - javaedge supergroup          0 2023-03-26 00:03 /pk

// 传送个文件到 pk 目录
javaedge@JavaEdgedeMac-mini sbin % ls
Linux			httpfs.sh		start-all.sh		start-yarn.sh		stop-secure-dns.sh
distribute-exclude.sh	kms.sh			start-balancer.sh	stop-all.cmd		stop-yarn.cmd
hadoop-daemon.sh	mr-jobhistory-daemon.sh	start-dfs.cmd		stop-all.sh		stop-yarn.sh
hadoop-daemons.sh	refresh-namenodes.sh	start-dfs.sh		stop-balancer.sh	yarn-daemon.sh
hdfs-config.cmd		slaves.sh		start-secure-dns.sh	stop-dfs.cmd		yarn-daemons.sh
hdfs-config.sh		start-all.cmd		start-yarn.cmd		stop-dfs.sh
javaedge@JavaEdgedeMac-mini sbin % hadoop fs -put slaves.sh /pk/


javaedge@JavaEdgedeMac-mini sbin % hadoop fs -ls /pk
Found 1 items
-rw-r--r--   1 javaedge supergroup       2145 2023-03-26 00:04 /pk/slaves.sh
```