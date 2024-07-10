# 10-百万数据量快速导入、导出MySQL

对于大数据量的快速导入MySQL,有以下几个建议:

## 1 MySQL 的 load data infile 语句导入数据

速度很快,但需要数据源文件在服务器本地。

```sql
LOAD DATA INFILE '/path/to/your/file.csv'
INTO TABLE your_table
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
```

## 2 使用 mysqldump 或 mysqlimport 工具导入数据

```sql
mysqlimport --local --fields-terminated-by=',' --fields-enclosed-by='"' --lines-terminated-by='\n' --ignore-lines=1 -u username -p database_name /path/to/your/file.csv
```

导出：

```sql
mysqldump -u username -p database_name table_name > dump_file.sql
```

导入：

```sql
mysql -u username -p database_name < dump_file.sql
```



## 3 多线程并行导入





## 4 使用中间临时表导入数据

先在MySQL中建立临时表无索引,批量导入数据到临时表,最后再用 insert into...select 从临时表导入到正式表。

```sql
-- 创建临时表
CREATE TEMPORARY TABLE temp_table LIKE your_table;

-- 禁用索引
ALTER TABLE temp_table DISABLE KEYS;

-- 导入数据到临时表
LOAD DATA INFILE '/path/to/your/file.csv'
INTO TABLE temp_table
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- 从临时表导入到正式表
INSERT INTO your_table SELECT * FROM temp_table;

-- 启用索引
ALTER TABLE your_table ENABLE KEYS;

-- 删除临时表
DROP TEMPORARY TABLE temp_table;
```



## 5 MyISAM 引擎表

先导入到对应的 .txt 文件,然后使用 REPAIR TABLE 命令修复并重建索引。

## 6 调整 MySQL 的配置参数

增大 bulk_insert_buffer_size、max_allowed_packet 等,以优化导入性能。



## 7 总结

- 如果是自主开发的系统,建议在应用层对数据进行分批插入,可以充分利用多线程,实现更高的导入效率
- 第三方工具如 mysqldump、mydumper、MyData 等,这些工具提供了多线程导入、断点续传等高级功能
- 检查磁盘I/O、CPU等系统资源是否够用,是否有瓶颈。如果资源不足,可以考虑分库分表的策略