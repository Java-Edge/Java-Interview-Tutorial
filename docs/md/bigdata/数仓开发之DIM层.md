# 数仓开发之DIM层

## 1 设计要点

该层主要记录事物发生的一些环境信息。

### 1.1 设计依据

维度建模理论，该层存储维度模型的维度表

### 1.2 数据存储格式

 orc 列式存储+snappy 压缩。

#### ORC（Optimized Row Columnar）

高效的列式存储格式，优化大数据场景中数据的读取速度及存储效率。列式存储格式特别适用于数据仓库查询操作，因为它允许只读取查询中涉及的列，减少I/O操作。ORC文件还包括轻量级的索引，这可以加速查询，还实现了高级数据类型的支持。

因为我们一般都是按需要的列去查询嘛，先指定好了列，再都查出来，效率大大提升，而不是先定位哪些行，再提取对应列。这样更利于分析计算。

而行式存储更适合于业务代码的crud。

#### Snappy压缩

为速度而不是压缩比优化的压缩库，特别适合大数据技术栈，因其提供合理的压缩率而几乎不增加CPU负担。这意味着在读取和写入数据时，压缩和解压缩的速度都很快，对性能影响较小。

将ORC列式存储和Snappy压缩结合使用，可以有效减少存储空间的使用，同时提高查询性能。在数据仓库中存储DIM数据时，通常需要从两个方面考虑：查询速度和存储成本。列式存储如ORC格式可以提升查询性能，而Snappy压缩可以减少所需的存储空间。

### 1.3 表名命名规范

 `dim_表名_全量表`或拉链表标识（full/zip）

## 2 车辆信息维度表

### 2.1 建表

```sql
drop table if exists dim_car_info_full;
create external table dim_car_info_full
(
    `id`               string comment '车辆唯一编码',
    `type_id`          string comment '车型ID',
    `type`             string comment '车型',
    `sale_type`        string comment '销售车型',
    `trademark`        string comment '品牌',
    `company`          string comment '厂商',
    `seating_capacity` int comment '准载人数',
    `power_type`       string comment '车辆动力类型',
    `charge_type`      string comment '车辆支持充电类型',
    `category`         string comment '车辆分类',
    `weight_kg`        int comment '总质量（kg）',
    `warranty`         string comment '整车质保期（年/万公里）'
  ) comment '车辆信息维度表'
    partitioned by (`dt` string comment '统计日期')
    stored as orc
    location '/warehouse/car_data/dim/dim_car_info_full'
    tblproperties ('orc.compress' = 'snappy');
```

### 2.2 数据装载

离线数据，同步最新的一天的全量数据即可。

```sql
insert overwrite table car_data.dim_car_info_full partition (dt = '2023-05-02')
select id,
       type_id,
       type,
       sale_type,
       trademark,
       company,
       seating_capacity,
       power_type,
       charge_type,
       category,
       weight_kg,
       warranty
from car_data.ods_car_info_full o
where o.dt = '2024-03-11';
```

## 3 日志编码维度表

显然，无需分区。

### 3.1 建表

```sql
drop table if exists dim_code_full;
create external table dim_code_full
(
    `type`               string comment '编码类型',
    `code_id`          string comment '编码ID',
`code_name`             string comment '编码名称'
) comment '日志编码维度表'
 stored as orc
location '/warehouse/car_data/dim/dim_code_full'
tblproperties ('orc.compress' = 'snappy');
```

### 3.2 **数据装载**

因为dim层的表格具有压缩和存储格式，所有不能直接上传文件到hive的表格路径，需要先上传文件car_data_code.txt到临时表。

```sql
drop table if exists tmp_code_full;
# 创建临时表
create external table tmp_code_full
(
    `type`               string comment '编码类型',
    `code_id`          string comment '编码ID',
`code_name`             string comment '编码名称'
) comment '日志编码维度表'
row format delimited
fields terminated by '\t'
location '/warehouse/car_data/tmp/tmp_code_full';
```

把car_data_code.txt文件放入到临时表的路径。

```sql
insert into table dim_code_full select * from tmp_code_full;
```

## 4 数据装载脚本

```shell
#!/bin/bash

# 设置应用名为 car_data
APP='car_data'

# 检查是否传入了日期参数，如果传入了第二个参数（$2），则使用该参数，否则使用昨天的日期
if [ -n "$2" ]; then
    do_date=$2
else
    # 使用 date 命令获取昨天的日期，格式为 YYYY-MM-DD
    do_date=$(date -d '-1 day' +%F)
fi

# Hive SQL 脚本，作用是将数据从ODS层导入到DIM层，并按日期分区
dim_car_info_full="
INSERT OVERWRITE TABLE ${APP}.dim_car_info_full PARTITION (dt = 
'$do_date')
SELECT id,
       type_id,
       type,
       sale_type,
       trademark,
       company,
       seating_capacity,
       power_type,
       charge_type,
       category,
       weight_kg,
       warranty
FROM ${APP}.ods_car_info_full o
WHERE o.dt = '$do_date';
"

# 处理传入的第一个参数($1)，根据参数执行相应Hive脚本
case $1 in
    # 参数 'dim_car_info_full'，执行 DIM 层的数据导入操作
    'dim_car_info_full')
        hive -e "${dim_car_info_full}"
        ;;
    # 参数 'all'，同样执行 DIM 层的数据导入操作 这里是 ETL 的习惯，只是当前仅一张表所以和上一case 等效了
    "all")
        hive -e "${dim_car_info_full}"
        ;;
esac
```

在这个脚本中，我们定义了一个名为 `APP` 的变量来表示数据库名称。脚本会检查是否给定了一个日期参数 `$2`，如果没有给定，它将默认使用昨天的日期。随后，我们定义了一个名为 `dim_car_info_full` 的 Hive SQL 语句，用于从 ODS 层向 DIM 层覆盖插入数据，并将数据分区为指定日期。最后，通过 `case` 语句，脚本根据传入参数决定执行关联的 Hive 命令。

```bash
# 给脚本添加执行权限
chmod +x your_script_name.sh

# 自测脚本功能：传参使用
./your_script_name.sh dim_car_info_full 2024-03-12
./your_script_name.sh all
```