# 03-HDFS伪分布式环境搭建

## 0 环境参数

*   JDK1.8
*   Hadoop 2.6.0-cdh5.7.0
*   ssh
*   rsync

下载`Hadoop 2.6.0-cdh5.7.0`的tar.gz包并解压：
![CentOS 环境安装步骤](https://img-blog.csdnimg.cn/img_convert/1fe4f5630d0cd9fdc77ed63e1c8112cb.png)

/usr/libexec/java_home -V:列出所有版本的JAVA_HOME：

![](https://img-blog.csdnimg.cn/img_convert/cc4b6fbc9ecfbb76b0417140326ffcbf.png)

设置 JAVA_HOME，添加java_home到.bash_profile：

```
export JAVA_HOME=$(/usr/libexec/java_home)
export PATH=$JAVA_HOME/bin:$PATH
export CLASS_PATH=$JAVA_HOME/lib 
```

![ Mac OS X ssh设置](https://img-blog.csdnimg.cn/img_convert/5b01e89d5179954e9c919d6c129a6f64.png)



ssh localhost，可能遇到如下问题
![](https://img-blog.csdnimg.cn/img_convert/3486dbbc38545ec22838f55a586b6047.png)

没打开远程登录，进入系统设置->共享->远程登录打开：
![](https://img-blog.csdnimg.cn/img_convert/5a31e260a53635b442268b182ed011ca.png)

再ssh localhost：
![](https://img-blog.csdnimg.cn/img_convert/4ce412abb490853be976ec9fd56f7579.png)

## 下载 Hadoop

```bash
tar -zxvf hadoop-2.6.0-cdh5.7.0.tar.gz
```

解压到doc目录，解压完后，进入到解压后的目录，可看到hadoop的目录结构：![](https://img-blog.csdnimg.cn/20190403011130884.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- bin目录存放可执行文件
- etc目录存放配置文件
- sbin目录下存放服务的启动命令
- share目录下存放jar包与文档

以上就算是把hadoop给安装好了，接下来就是编辑配置文件，把JAVA_HOME配置一下

```
cd etc/
cd hadoop
vim hadoop-env.sh
export JAVA_HOME=/usr/local/jdk1.8/  # 根据你的环境变量进行修改
```

![](https://img-blog.csdnimg.cn/20190403011442235.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)


![官方指南](https://img-blog.csdnimg.cn/img_convert/95d13b781df30d54b1ec40c0464c3cd6.png)

### hadoop-env.sh

```
export JAVA_HOME=${/usr/libexec/java_home}
```



![](https://img-blog.csdnimg.cn/20190403013455353.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
由于我们要进行的是单节点伪分布式环境的搭建，所以还要配置两个配置文件：

- core-site.xml
- hdfs-site.xml

Hadoop也可在伪分布模式下的单节点上运行，其中每个Hadoop守护进程都在单独的Java进程中运行
![](https://img-blog.csdnimg.cn/img_convert/06ca9aaec2c4259a61ee45da425ad584.png)
![具体更改](https://img-blog.csdnimg.cn/img_convert/fe507118beb94e5fb2d32ed0d4045a09.png)



![](https://img-blog.csdnimg.cn/img_convert/9216f0da5bf8d3d368b4f06ae1d9803d.png)



![](https://img-blog.csdnimg.cn/img_convert/390d403865811111803b7cb7ea5ee597.png)
![配置 datanode 节点数](https://img-blog.csdnimg.cn/img_convert/e8632fdfbca77f72e337296d00739fa9.png)
启动 hdfs
![](https://img-blog.csdnimg.cn/img_convert/ad99b27b89db7779d6d463b918c18f0a.png)
![](https://img-blog.csdnimg.cn/img_convert/5c0e0ba5a160ab094fd166cf6c2ef2b7.png)
![](https://img-blog.csdnimg.cn/img_convert/bebfeb42efcae88b649e7696c865a305.png)

![](https://img-blog.csdnimg.cn/img_convert/f24f81c4ddf58ab5c16993414b166180.png)
![](https://img-blog.csdnimg.cn/img_convert/4a42ebb0096a3615269c2a2d099d51e5.png)
查看进程
![](https://img-blog.csdnimg.cn/img_convert/4c88b8e9e3048792c7cfa61a8600f59a.png)
访问 [WebUI](http://localhost:50070/)：
![](https://img-blog.csdnimg.cn/img_convert/b1a3fc052c445ceca20ff151c33fc1bb.png)
表示HDFS已经安装成功
![存活节点](https://img-blog.csdnimg.cn/img_convert/6da1c853f986efaf66957a4ba7ee2743.png)
步骤小结
![](https://img-blog.csdnimg.cn/img_convert/f298fcf68acbda0924b5bc0313bfacbd.png)
关闭
![](https://img-blog.csdnimg.cn/img_convert/218d31f814e5d1e00a3b6e8268c3f989.png)



## HDFS Shell 操作

![](https://img-blog.csdnimg.cn/img_convert/a1fe03f45713f5d3d74a58aea45a71e5.png)
官网指南
![](https://img-blog.csdnimg.cn/img_convert/291e116634cfdb44dc52431073f9dfc2.png)
先启动 HDFS

![配置 hadoop 环境变量](https://img-blog.csdnimg.cn/img_convert/b23502209a27e57b67ee86f8b71f1911.png)
![成功](https://img-blog.csdnimg.cn/img_convert/7ff62877d435871580cb449e891b937a.png)
![指令集](https://img-blog.csdnimg.cn/img_convert/4bd2304d31d6eb560799284e87231b60.png)
![dfs fs 无差异](https://img-blog.csdnimg.cn/img_convert/0e4be9810ed70c5155ba9ad682e9f12c.png)
![上传一个 txt 文件](https://img-blog.csdnimg.cn/img_convert/e5b06aa9269dfb9246dc8ade594fac58.png)

![](https://img-blog.csdnimg.cn/img_convert/35a483d08002883f69571114dc88fd30.png)
创建文件夹
![](https://img-blog.csdnimg.cn/img_convert/bc2232b852c7ef72f5828d2bf0e6b311.png)
多层次文件夹
![](https://img-blog.csdnimg.cn/img_convert/774ef16b35f3e0dbb53f980a16b03f1f.png)
遍历所有文件夹
![](https://img-blog.csdnimg.cn/img_convert/009ec8967eac0df1181e1916a9d0c188.png)
![](https://img-blog.csdnimg.cn/img_convert/7626ffc8c308c1c983c614fd35130358.png)
![](https://img-blog.csdnimg.cn/img_convert/d37bd80468f6dc7c1eefde07c085ebc2.png)
![](https://img-blog.csdnimg.cn/img_convert/97bfa941384139fcb1a04e43fca7666c.png)
删除文件/文件夹
![](https://img-blog.csdnimg.cn/img_convert/05e1eacd1adfd6adf507b89a4310d4e4.png)
![](https://img-blog.csdnimg.cn/img_convert/b38a796b664e0b628b33dd4b005ba682.png)
![所上传的文件](https://img-blog.csdnimg.cn/img_convert/5a7f65deb67cf635c9c03ff186e82f2a.png)

# Java 操作 HDFS 开发环境搭建

![](https://img-blog.csdnimg.cn/img_convert/248c8a92a3718cd3feb5af3c8f309281.png)
![](https://img-blog.csdnimg.cn/img_convert/4badf3bd29a695ce82043a8e94dc36ce.png)
![](https://img-blog.csdnimg.cn/img_convert/7d4ca4852f4f625add198102035b50e4.png)
![](https://img-blog.csdnimg.cn/img_convert/0b33bf7cffa1307fbec81cf504aea79d.png)
![](https://img-blog.csdnimg.cn/img_convert/e74404d22c48c5e8a9693f4e1a26ea92.png)
![pom 文件](https://img-blog.csdnimg.cn/img_convert/1c06fde159c77db1ad418d880615b99a.png)

# JavaAPI 操作 HDFS文件系统

![](https://img-blog.csdnimg.cn/img_convert/9bb212431672a30a4ee634af0ecf6cde.png)
![测试通过](https://img-blog.csdnimg.cn/img_convert/bffef3e76207025f8e74d89784b19c05.png)
![](https://img-blog.csdnimg.cn/img_convert/1efae059f025f9b6927e5d63fe57944d.png)

- 测试创建文件方法
  ![](https://img-blog.csdnimg.cn/img_convert/e41acbd6824978314776c8d5b2d34bc3.png)
  ![](https://img-blog.csdnimg.cn/img_convert/c8c0b3df415dbac42ff0238eb2b2bc29.png)
- 查看 HDFS 文件的内容
  ![](https://img-blog.csdnimg.cn/img_convert/4af6c91bc70fa3280f36d38ea50339c9.png)
  ![](https://img-blog.csdnimg.cn/img_convert/915c6588e7d155b91c75bec68a569d62.png)
- 上传文件到 HDFS
  ![](https://img-blog.csdnimg.cn/img_convert/327dd44b63e3e529b3c23017595f1a9a.png)
- 上传文件到 HDFS(带进度条)
  ![](https://img-blog.csdnimg.cn/img_convert/fd4ab77f2ec9e0f7774f9ce47b289e42.png)
  ![测试通过](https://img-blog.csdnimg.cn/img_convert/0ecb7677b131d62e60ca2de3e138f565.png)
  ![](https://img-blog.csdnimg.cn/img_convert/6c60fbeea25405a1bf0b3efe7e46397c.png)
- 下载文件到本地
  ![](https://img-blog.csdnimg.cn/img_convert/a8d9e8e61cf704884fc7f3e71c7ecbbb.png)
  ![测试通过](https://img-blog.csdnimg.cn/img_convert/77f9fd2a90d54ffd13a9290bd4c8a4b4.png)
  ![](https://img-blog.csdnimg.cn/img_convert/e380c8dc8cc3d29126a283037152a87b.png)
- 查看某个目录下的所有文件
  ![](https://img-blog.csdnimg.cn/img_convert/536149c7d50e05fdda418c2ac847d925.png)
  ![测试通过](https://img-blog.csdnimg.cn/img_convert/28f30f2086965157554a22fea49a83a6.png)
  ![](https://img-blog.csdnimg.cn/img_convert/3c647f2789ef4ec31f1f08fa46586795.png)
- 删除文件/文件夹
  ![](https://img-blog.csdnimg.cn/img_convert/1a7318e28a11169978cbd3c5e389b5de.png)
  ![](https://img-blog.csdnimg.cn/img_convert/7f88da84a65eb06ea7ec5eafc899c9ab.png)
  ![](https://img-blog.csdnimg.cn/img_convert/6fdf3dc426377a4b9b44cf101db76519.png)

参考

- https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html