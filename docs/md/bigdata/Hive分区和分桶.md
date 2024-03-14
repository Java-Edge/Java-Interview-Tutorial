# Hive分区和分桶

两种用于优化查询性能的数据组织策略，数仓设计的关键概念，可提升Hive在读取大量数据时的性能。

## 1 分区（Partitioning）

根据表的某列的值来组织数据。每个分区对应一个特定值，并映射到HDFS的不同目录。为大幅减少数据量，基本必须要做！

常用于经常查询的列，如日期、区域等。这样可以在查询时仅扫描相关的分区，而不是整个数据集，从而减少查询所需要处理的数据量，提高查询效率。

物理上将数据按照指定的列（分区键）值分散存放于不同的目录中，每个分区都作为表的一个子目录。

### 创建分区表

在新能源汽车数仓项目中，如希望对整车日志表按照统计日期字段进行分区，建表语句：

```sql
# 车辆标识`vehicle_id`、事件发生的时间戳`timestamp`、日志级别`log_level`、日志消息`message`、引擎温度`engine_temperature`、电池电量`battery_level`以及车辆位置`location`等
CREATE EXTERNAL TABLE ev_vehicle_logs (
    vehicle_id STRING,
    timestamp BIGINT,
    log_level STRING,
    message STRING,
    engine_temperature DOUBLE,
    battery_level INT,
    location STRING
)
PARTITIONED BY (log_date DATE)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\t'
STORED AS TEXTFILE
LOCATION '/path/to/hdfs/new_energy_vehicle/logs';
```

`PARTITIONED BY (log_date DATE)`子句定义`log_date`作为表的分区键，即按照统计日期对数据进行分区存储。

分区键`log_date`通常是日志数据中的一个字段，该字段存储每条日志记录的日期。按日期分区日志数据可以极大地提高查询性能，特别是对于那些限定在特定日期范围内的查询。例如，如果用户只想看昨天的日志，Hive只需要扫描昨天日期分区对应的数据，而不必扫描整个数据表。

创建分区表之后，可以根据实际需要将数据加载到对应的分区目录中。例如，如果有一份新的日志数据，其日期为2023年10月1日，你可以这样导入数据：

```sql
LOAD DATA INPATH '/path/to/local/file/2023-10-01.log' INTO TABLE ev_vehicle_logs PARTITION (log_date='2023-10-01');
```

或也可用Hive的动态分区特性让Hive在数据加载时自动根据数据内容创建分区。

## 2 分桶（Bucketing）

使用哈希函数将数据行分配到固定数量的存储桶（即文件）中。这在表内部进一步组织数据。

- 对提高具有大量重复值的列（如用户ID）上JOIN操作的效率特别有用，因为它可以更有效地处理数据倾斜
- 要求在创建表时指定分桶的列和分桶的数目

### 创建分桶表

```sql
CREATE TABLE user_activities (
    user_id INT,
    activity_date DATE,
    page_views INT
)
CLUSTERED BY (user_id) INTO 256 BUCKETS;
```

`user_id`是用于分桶的列，数据会根据用户ID的哈希值分配到256个存储桶中。

## 3 对比

- 分区是基于列的值，将数据分散到不同的HDFS目录；分桶则基于哈希值，将数据均匀地分散到固定数量的文件中。
- 分区通常用于减少扫描数据的量，特别适用于有高度选择性查询的场景；而分桶有助于优化数据的读写性能，特别是JOIN操作。
- 分区可以动态添加新的分区，只需要导入具有新分区键值的数据；分桶的数量则在创建表时定义且不能更改。

使用分区时要注意避免过多分区会导致元数据膨胀，合理选择分区键，确保分布均匀；而分桶则通常针对具有高度重复值的列。两者结合使用时，可以进一步优化表的读写性能和查询效率。