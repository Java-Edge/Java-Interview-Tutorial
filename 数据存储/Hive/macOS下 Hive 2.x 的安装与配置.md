# 1 简介
[Hive](https://hive.apache.org/)是基于Hadoop的一个数据仓库工具，可以将结构化的数据文件映射为一张数据库表，并提供简单的[SQL]查询功能，可以将SQL语句转换为MapReduce任务进行运行。其优点是学习成本低，可以通过类SQL语句快速实现简单的MapReduce统计，不必开发专门的MapReduce应用，十分适合数据仓库的统计分析。

它提供了一系列的工具，可以用来进行数据提取转化加载（ETL），这是一种可以存储、查询和分析存储在 Hadoop 中的大规模数据的机制。Hive 定义了简单的类 SQL 查询语言，称为 HQL，它允许熟悉 SQL 的用户查询数据。同时，这个语言也允许熟悉 MapReduce 开发者的开发自定义的 mapper 和 reducer 来处理内建的 mapper 和 reducer 无法完成的复杂的分析工作。

Hive 没有专门的数据格式。 Hive 可以很好的工作在 Thrift 之上，控制分隔符，也允许用户指定数据格式。


Apache Hive起初由[Facebook]开发，目前也有其他公司使用和开发Apache Hive，例如[Netflix]等。[亚马逊公司](https://zh.wikipedia.org/wiki/%E4%BA%9A%E9%A9%AC%E9%80%8A%E5%85%AC%E5%8F%B8 "亚马逊公司")也开发了一个定制版本的Apache Hive，亚马逊网络服务包中的Amazon Elastic MapReduce包含了该定制版本。

# 2 环境
- 操作系统

![](https://upload-images.jianshu.io/upload_images/16782311-bcc38449a27a5014.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- Hadoop版本
hadoop-2.6.0-cdh5.7.0

- MySQL版本
![](https://upload-images.jianshu.io/upload_images/16782311-db67b7eb99002aee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- mysql-connector-java
5.1.37

- Hive版本
2.3.4

# 3 安装Hive
## 3.1 先确保已经正确安装并运行了hadoop

## 3.2 下载Hive安装包 
[官网下载](http://mirror.bit.edu.cn/apache/hive/hive-2.3.4/)

将安装包移动至：
../hadoop-2.6.0-cdh5.7.0/ 目录下，此目录是本地安装Hadoop的目录

移动至此处后，解压缩
- tar -xzvf apache-hive-2.3.4-bin.tar.gz
![](https://upload-images.jianshu.io/upload_images/16782311-bd088928b7a60a4c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

并将解压后的文件名改为hive，方便配置。 

例如本机Hive的安装路径为
![](https://upload-images.jianshu.io/upload_images/16782311-51937a6fae66f951.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 3.3 配置系统环境变量 
### 3.3.1 修改~/.bash_profile
// 或者修改/etc/profile文件
```
vim ~/.bash_profile
```
 
添加内容
```
export HIVE_HOME=/Volumes/doc/hadoop-2.6.0-cdh5.7.0/hive
export PATH=$PATH:$HIVE_HOME/bin:$HIVE_HOME/conf
```

 退出保存后，在终端输入，使环境变量立即生效
```
source ~/.bash_profile
```

# 4 修改Hive配置
## 4.1 新建文件hive-site.xml

- 在 ../hive/conf下
![](https://upload-images.jianshu.io/upload_images/16782311-4983ccaf4ab9de99.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 添加`hive-site.xml`内容
![](https://upload-images.jianshu.io/upload_images/16782311-8754cf0dc39cb006.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 4.2 hive-env.sh
-  复制hive-env.sh.template为hive-env.sh
![](https://upload-images.jianshu.io/upload_images/16782311-e07bdf9382b947a2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 修改hive-env.sh内容
![](https://upload-images.jianshu.io/upload_images/16782311-60758eb384849339.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 5 MySQL 权限配置 
## 5.1 给用户赋予权限
- 以使得该用户可以远程登录数据库：
![](https://upload-images.jianshu.io/upload_images/16782311-3e652dd9a335442c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 如果上面查询到有信息,但host为localhost或其他值，就需要根据实际需求来更新表信息
```
grant all privileges on 库名.表名 to '用户名'@'IP地址' identified by '密码' with grant option;
flush privileges;
```
> 库名:要远程访问的数据库名称,所有的数据库使用“*” 
表名:要远程访问的数据库下的表的名称，所有的表使用“*” 
用户名:要赋给远程访问权限的用户名称 
IP地址:可以远程访问的电脑的IP地址，所有的地址使用“%” 
密码:要赋给远程访问权限的用户对应使用的密码

```
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
```
使改变立即生效：
```
FLUSH PRIVILEGES;

```
![](https://upload-images.jianshu.io/upload_images/16782311-8b9f16bc279d8c54.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 6 向/usr/hadoop/hadoop-2.6.2/hive/lib中添加mySql连接库： 
## 6.1 [官网下载连接驱动包](https://dev.mysql.com/downloads/connector/j/)


## 6.2 将下好的包解压缩
- 解压后,将此文件夹下mysql-connector-java-8.0.15.jar
![](https://upload-images.jianshu.io/upload_images/16782311-fbd0d44ece0a36b5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


- 复制到../hive/lib下
![image.png](https://upload-images.jianshu.io/upload_images/16782311-9336f9b6da0dbb5e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


> 注意：需要给/tmp文件夹设置写权限，同时确保 hadoop不在安全模式下，可以执行此命令使hadoop退出安全模式：hadoop dfsadmin -safemode leave

# 7 启动Hive
在命令行运行 hive 命令时必须保证HDFS 已经启动。可以使用 start-dfs.sh 脚本来启动 HDFS。

## 7.1 如果是第一次启动Hive，则需要先执行如下初始化命令
```
schematool -dbType mysql -initSchema
```
![](https://upload-images.jianshu.io/upload_images/16782311-62391a0223e9c65d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 7.2 启动Hive
![](https://upload-images.jianshu.io/upload_images/16782311-0bba4985ef3ac3cc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

 # 完成基本的环境配置!

# X 交流学习
![](https://upload-images.jianshu.io/upload_images/16782311-8d7acde57fdce062.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)


## [博客](https://blog.csdn.net/qq_33589510)



## [Github](https://github.com/Wasabi1234)

