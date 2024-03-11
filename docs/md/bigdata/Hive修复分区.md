# Hive修复分区

## 简介

Hive的`MSCK REPAIR TABLE`命令用于修复（即添加丢失的）表分区。通常用于那些已在HDFS中存在，但尚未在Hive元数据中注册的分区。

当你在HDFS文件系统中手动添加或删除分区目录，Hive并不会自动识别这些更改。为同步元数据与实际文件系统之间的状态，可用命令：

```sql
MSCK REPAIR TABLE table_name;
```

较老Hive版本，用旧命令：

```sql
ALTER TABLE table_name RECOVER PARTITIONS;
```

执行后，Hive会检查表的分区列在HDFS中的路径，并将在HDFS中找到但Hive元数据中缺失的分区添加到元数据中。这样，当你查询那些分区时，Hive就能够正确地检索到数据。

这个命令并不会修复损坏的分区文件；如果分区文件损坏或丢失，你需要从备份中恢复或重新计算分区数据。`MSCK REPAIR TABLE`只是同步元数据与文件系统的状态，不会更改实际的文件。

## 手动删除分区目录，会恢复吗？

若你在HDFS中手动删除了一个分区目录，执行`MSCK REPAIR TABLE`命令并不会恢复已被删除的分区目录或数据。`MSCK REPAIR TABLE`命令的作用是同步Hive元数据与HDFS上当前的实际文件系统状态，它会添加那些存在于HDFS上但尚未在Hive元数据中注册的分区。

在你手动删除HDFS上的一个分区目录的情况下，执行`MSCK REPAIR TABLE`命令将会从Hive元数据中移除对应这个已删除目录的分区信息，因为该命令会发现HDFS上不再有这个分区的目录，并更新Hive元数据以反映这个变化。

若希望恢复被删除的分区数据，你要从备份中恢复数据或者重新计算并重新写入这些分区数据到HDFS中。一旦数据在HDFS中被恢复或重新放置，你可再运行`MSCK REPAIR TABLE`更新Hive元数据，使其包含新恢复的分区信息。

## 总结

`MSCK REPAIR TABLE`用于同步Hive元数据，不能用来恢复在HDFS中被删除的数据。