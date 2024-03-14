# 数仓开发之DWD层

## 1 设计要点

### 1.1 设计依据

维度建模理论，该层存储维度模型的事实表。

### 1.2 数据存储格式

orc列式存储+snappy压缩。

### 1.3 表命名规范

```bash
dwd_数据域_表名_单分区增量全量标识（inc/full）
```

## 2 构建业务总线矩阵

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/wps1-0226813.jpg) 

## 3 相关表

### 3.1 电动模式行驶日志事实表

#### 3.1.1 建表

```sql
DROP TABLE IF EXISTS dwd_car_running_electricity_inc;

CREATE EXTERNAL TABLE dwd_car_running_electricity_inc (
  `vin` string COMMENT '汽车唯一ID',
  `velocity` int COMMENT '车速',
  `mileage` int COMMENT '里程',
  `voltage` int COMMENT '总电压',
  `electric_current` int COMMENT '总电流',
  `soc` int COMMENT 'SOC',
  `dc_status` int COMMENT 'DC-DC状态',
  `gear` int COMMENT '挡位',
  `insulation_resistance` int COMMENT '绝缘电阻',
  `motor_count` int COMMENT '驱动电机个数',
  `motor_list` array<struct<
    `id`: int,
    `status`: int,
    `rev`: int,
    `torque`: int,
    `controller_temperature`: int,
    `temperature`: int,
    `voltage`: int,
    `electric_current`: int COMMENT '驱动电机列表',
  `fuel_cell_dc_status` int COMMENT '高压DC-DC状态',
  `engine_status` int COMMENT '发动机状态',
  `crankshaft_speed` int COMMENT '曲轴转速',
  `fuel_consume_rate` int COMMENT '燃料消耗率',
  `max_voltage_battery_pack_id` int COMMENT '最高电压电池子系统号',
  `max_voltage_battery_id` int COMMENT '最高电压电池单体代号',
  `max_voltage` int COMMENT '电池单体电压最高值',
  `min_temperature_subsystem_id` int COMMENT '最低电压电池子系统号',
  `min_voltage_battery_id` int COMMENT '最低电压电池单体代号',
  `min_voltage` int COMMENT '电池单体电压最低值',
  `max_temperature_subsystem_id` int COMMENT '最高温度子系统号',
  `max_temperature_probe_id` int COMMENT '最高温度探针号',
  `max_temperature` int COMMENT '最高温度值',
  `min_voltage_battery_pack_id` int COMMENT '最低温度子系统号',
  `min_temperature_probe_id` int COMMENT '最低温度探针号',
  `min_temperature` int COMMENT '最低温度值',
  `battery_count` int COMMENT '单体电池总数',
  `battery_pack_count` int COMMENT '单体电池包总数',
  `battery_voltages` array<int> COMMENT '单体电池电压值列表',
  `battery_temperature_probe_count` int COMMENT '单体电池温度探针总数',
  `battery_pack_temperature_count` int COMMENT '单体电池包总数',
  `battery_temperatures` array<int> COMMENT '单体电池温度值列表',
  `timestamp` bigint COMMENT '日志采集时间'
)
COMMENT '电动模式行驶日志事实表'
PARTITIONED BY (dt string COMMENT '统计日期')
STORED AS ORC
LOCATION '/warehouse/car_data/dwd/dwd_car_running_electricity_inc'
TBLPROPERTIES ('orc.compress' = 'snappy');
```

#### 3.1.2 数据装载

##### ① 首日装载

日志在数仓刚成立的第一天肯定会有历史数据的嘛，我们要把历史数据按 dt 放到前面的分区里，即它应该在哪就放入哪个分区。这就涉及 Hive 的动态分区。

```sql
SET hive.exec.dynamic.partition.mode=nonstrict;
-- OVERWRITE 保证幂等性
INSERT OVERWRITE TABLE car_data.dwd_car_running_electricity_inc
-- 动态分区，不要写等于多少
PARTITION(dt)
SELECT
  `vin`,
  ...
  `timestamp`,、
  -- 这里最后加上分区字段
  `dt`
FROM car_data.ods_car_data_inc
WHERE dt <= '2024-03-14'
  AND car_status = 1
  AND execution_mode = 1;
```

结果执行报错啦！

![image-20240314102105263](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20240314102105263.png)

因为 hive 严格模式不允许使用一级分区上直接使用动态分区，比如这里 dt 是一级分区，所以被禁止在其上直接动态分区。咋办呢？

- 在 dt 之后加上 hour 小时，就不直接啦
- 或直接关闭严格模式！`set hive.exec.dynamic.partition.mode=nonstrict;`

> ##### hive.exec.dynamic.partition.mode
>
> - 默认值：`strict`
> - 添加于：Hive 0.6.0
>
>  `strict` 模式下，用户在进行操作可能会意外覆盖所有分区的情况下，须至少指定一个静态分区。而 `nonstrict` 模式下，允许所有分区被[dynamic](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DML#LanguageManualDML-DynamicPartitionInserts)。
>
> 置 `nonstrict` 以支持[INSERT ... VALUES, UPDATE, 和 DELETE](https://cwiki.apache.org/confluence/display/Hive/Hive+Transactions)事务（Hive 0.14.0 及更高版本）。关于开启 Hive 事务所需的完整参数列表，请参见 **[hive.txn.manager](https://cwiki.apache.org/confluence/display/Hive/Configuration+Properties#ConfigurationProperties-hive.txn.manager)**。
>
> ##### hive.exec.max.dynamic.partitions
>
> - 默认值：`1000`
> - 添加于：Hive 0.6.0
>
> 允许创建的最大[dynamic partitions](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DML#LanguageManualDML-DynamicPartitionInserts)总数。

之所以默认严格模式，是避免你在第一级目录制造太多数据，导致数据覆盖问题（比如你直接 insert overwrite，那这一级目录所有数据都会重写覆盖了！）。毕竟动态分区，你就无法确定到底会生成哪些分区。

我们这里因为业务上不担心历史数据覆盖问题，本就只需要第一天分区的数据，所以可直接关闭严格模式。

再重新执行语句动态分区即可。

##### ② 每日装载

```sql
INSERT OVERWRITE TABLE car_data.dwd_car_running_electricity_inc
# 不用再使用动态分区了，即`PARTITION(dt)`变`PARTITION(dt='2024-03-14')`
PARTITION(dt='2024-03-14')
SELECT
  `vin`,
  ...
  `timestamp`
   # 注意这里也不需要再加 dt 字段
FROM car_data.ods_car_data_inc;
WHERE dt = '2024-03-14'
  AND car_status = 1
  AND execution_mode = 1;
```

### 3.2 混动模式行驶日志事实表

#### 3.2.1 建表

```sql
drop table if exists dwd_car_running_hybrid_inc;
create external table dwd_car_running_hybrid_inc
(
    `vin`                                         string comment '汽车唯一ID',
    `velocity`                                    int comment '车速',
    `mileage`                                     int comment '里程',
    `voltage`                                     int comment '总电压',
    `electric_current`                            int comment '总电流',
    `soc`                                         int comment 'SOC',
    `dc_status`                                   int comment 'DC-DC状态',
    `gear`                                        int comment '挡位',
    `insulation_resistance`                       int comment '绝缘电阻',
    `motor_count`                                 int comment '驱动电机个数',
    `motor_list`                                  array<struct<`id` :int, `status` :int, `rev` :int, `torque` :int,
                                                               `controller_temperature` :int, `temperature` :int,
                                                               `voltage`
                                                               :int, `electric_current` :int>> comment '驱动电机列表',
    `fuel_cell_dc_status`                         int comment '高压DC-DC状态',
    `engine_status`                               int comment '发动机状态',
    `crankshaft_speed`                            int comment '曲轴转速',
    `fuel_consume_rate`                           int comment '燃料消耗率',
    `max_voltage_battery_pack_id`                 int comment '最高电压电池子系统号',
    `max_voltage_battery_id`                      int comment '最高电压电池单体代号',
    `max_voltage`                                 int comment '电池单体电压最高值',
    `min_temperature_subsystem_id`                int comment '最低电压电池子系统号',
    `min_voltage_battery_id`                      int comment '最低电压电池单体代号',
    `min_voltage`                                 int comment '电池单体电压最低值',
        `max_temperature_subsystem_id`                int comment '最高温度子系统号',
    `max_temperature_probe_id`                    int comment '最高温度探针号',
    `max_temperature`                             int comment '最高温度值',
    `min_voltage_battery_pack_id`                 int comment '最低温度子系统号',
    `min_temperature_probe_id`                    int comment '最低温度探针号',
    `min_temperature`                             int comment '最低温度值',
    `battery_count`                               int comment '单体电池总数',
    `battery_pack_count`                          int comment '单体电池包总数',
    `battery_voltages`                            array<int> comment '单体电池电压值列表',
    `battery_temperature_probe_count`             int comment '单体电池温度探针总数',
    `battery_pack_temperature_count`              int comment '单体电池包总数',
    `battery_temperatures`                        array<int> comment '单体电池温度值列表',
    `timestamp`                                   bigint comment '日志采集时间'
)
comment '混动模式行驶日志事实表'
partitioned by (`dt` string comment '统计日期')
stored as orc
location '/warehouse/car_data/dwd/dwd_car_running_hybrid_inc'
tblproperties ('orc.compress' = 'snappy');
```

#### 3.2.2 数据装载

##### 首日装载

```sql
set hive.exec.dynamic.partition.mode=nonstrict;
insert overwrite table car_data.dwd_car_running_hybrid_inc partition(dt)
select
    `vin`,
    ...
    \`timestamp\`,
    `dt`
from car_data.ods_car_data_inc
where dt <= '2023-05-02'
and car_status=1
and execution_mode=2;
```

##### 每日装载

```sql
insert overwrite table car_data.dwd_car_running_hybrid_inc partition(dt='2023-05-03')
select
    `vin`,
    ...
    \`timestamp\`
from car_data.ods_car_data_inc
where dt='2023-05-03'
and car_status=1
and execution_mode=2;
```

### 3.3 新能源燃料模式行驶日志事实表

#### 3.3.1 建表

```sql
Drop table if exists dwd_car_running_fuel_inc;
create external table dwd_car_running_fuel_inc
(
    `vin`                                         string comment '汽车唯一ID',
    `velocity`                                    int comment '车速',
    `mileage`                                     int comment '里程',
    `voltage`                                     int comment '总电压',
    `electric_current`                            int comment '总电流',
    `soc`                                         int comment 'SOC',
    `dc_status`                                   int comment 'DC-DC状态',
    `gear`                                        int comment '挡位',
    `insulation_resistance`                       int comment '绝缘电阻',
    `fuel_cell_voltage`                           int comment '燃料电池电压',
    `fuel_cell_current`                           int comment '燃料电池电流',
    `fuel_cell_consume_rate`                      int comment '燃料消耗率',
    `fuel_cell_temperature_probe_count`           int comment '燃料电池温度探针总数',
    `fuel_cell_temperature`                       int comment '燃料电池温度值',
    `fuel_cell_max_temperature`                   int comment '氢系统中最高温度',
    `fuel_cell_max_temperature_probe_id`          int comment '氢系统中最高温度探针号',
    `fuel_cell_max_hydrogen_consistency`          int comment '氢气最高浓度',
    `fuel_cell_max_hydrogen_consistency_probe_id` int comment '氢气最高浓度传感器代号',
    `fuel_cell_max_hydrogen_pressure`             int comment '氢气最高压力',
    `fuel_cell_max_hydrogen_pressure_probe_id`    int comment '氢气最高压力传感器代号',
    `fuel_cell_dc_status`                         int comment '高压DC-DC状态',
    `engine_status`                               int comment '发动机状态',
    `crankshaft_speed`                            int comment '曲轴转速',
    `fuel_consume_rate`                           int comment '燃料消耗率',
    `max_voltage_battery_pack_id`                 int comment '最高电压电池子系统号',
    `max_voltage_battery_id`                      int comment '最高电压电池单体代号',
    `max_voltage`                                 int comment '电池单体电压最高值',
    `min_temperature_subsystem_id`                int comment '最低电压电池子系统号',
    `min_voltage_battery_id`                      int comment '最低电压电池单体代号',
    `min_voltage`                                 int comment '电池单体电压最低值',
    `max_temperature_subsystem_id`                int comment '最高温度子系统号',
    `max_temperature_probe_id`                    int comment '最高温度探针号',
    `max_temperature`                             int comment '最高温度值',
    `min_voltage_battery_pack_id`                 int comment '最低温度子系统号',
    `min_temperature_probe_id`                    int comment '最低温度探针号',
    `min_temperature`                             int comment '最低温度值',
    `timestamp`                                   bigint comment '日志采集时间'
)
comment '新能源燃料模式行驶日志事实表'
partitioned by (`dt` string comment '统计日期')
stored as orc
location '/warehouse/car_data/dwd/dwd_car_running_fuel_inc'
tblproperties ('orc.compress' = 'snappy');
```

#### 3.3.2 数据装载

##### ① 首日装载

```sql
insert overwrite table dwd_car_running_fuel_inc partition(dt)
select
    `vin`,
    ...
    \`timestamp\`,
    dt
from ods_car_data_inc
where dt<='2023-05-02'
and car_status=1
and execution_mode=3;
```

##### ② 每日装载

```sql
insert overwrite table dwd_car_running_fuel_inc partition(dt='2023-05-03')
select
    `vin`,
    ...
    \`timestamp\`
from ods_car_data_inc
where dt='2023-05-03'
and car_status=1
and execution_mode=3;
```

### 3.4 充电桩充电日志事实表

#### 3.4.1 建表

```sql
drop table if exists dwd_car_parking_charging_inc;
create external table dwd_car_parking_charging_inc
(
    `vin`                                         string comment '汽车唯一ID',
    `voltage`                                     int comment '总电压',
    `electric_current`                            int comment '总电流',
    `soc`                                         int comment 'SOC',
    `dc_status`                                   int comment 'DC-DC状态',
    `gear`                                        int comment '挡位',
    `insulation_resistance`                       int comment '绝缘电阻',
    `engine_status`                               int comment '发动机状态',
    `crankshaft_speed`                            int comment '曲轴转速',
    `fuel_consume_rate`                           int comment '燃料消耗率',
    `max_voltage_battery_pack_id`                 int comment '最高电压电池子系统号',
    `max_voltage_battery_id`                      int comment '最高电压电池单体代号',
    `max_voltage`                                 int comment '电池单体电压最高值',
    `min_temperature_subsystem_id`                int comment '最低电压电池子系统号',
    `min_voltage_battery_id`                      int comment '最低电压电池单体代号',
    `min_voltage`                                 int comment '电池单体电压最低值',
    `max_temperature_subsystem_id`                int comment '最高温度子系统号',
    `max_temperature_probe_id`                    int comment '最高温度探针号',
    `max_temperature`                             int comment '最高温度值',
    `min_voltage_battery_pack_id`                 int comment '最低温度子系统号',
    `min_temperature_probe_id`                    int comment '最低温度探针号',
    `min_temperature`                             int comment '最低温度值',
    `battery_count`                               int comment '单体电池总数',
    `battery_pack_count`                          int comment '单体电池包总数',
    `battery_voltages`                            array<int> comment '单体电池电压值列表',
    `battery_temperature_probe_count`             int comment '单体电池温度探针总数',
    `battery_pack_temperature_count`              int comment '单体电池包总数',
    `battery_temperatures`                        array<int> comment '单体电池温度值列表',
    `timestamp`                                   bigint comment '日志采集时间'
)
comment '充电桩充电日志事实表'
partitioned by (`dt` string comment '统计日期')
stored as orc
location '/warehouse/car_data/dwd/dwd_car_parking_charging_inc'
tblproperties ('orc.compress' = 'snappy');
```

#### 3.4.2 数据装载

##### ① 首日装载

```sql
insert overwrite table dwd_car_parking_charging_inc partition(dt)
select
    `vin`,
    ...
    \`timestamp\`,
    dt
from ods_car_data_inc
where dt<='2023-05-02'
and car_status=2
and charge_status=1;
```

##### ② 每日装载

```sql
insert overwrite table dwd_car_parking_charging_inc partition(dt='2023-05-03')
select
    `vin`,
    ...
    \`timestamp\`
from ods_car_data_inc
where dt='2023-05-03'
and car_status=2
and charge_status=1;
```

### 3.5 行驶充电日志事实表

#### 3.5.1 建表

```sql
drop table if exists dwd_car_running_charging_inc;

create external table dwd_car_running_charging_inc

(

  `vin`                     string comment '汽车唯一ID',

  `velocity`                   int comment '车速',

  `mileage`                   int comment '里程',

  `voltage`                   int comment '总电压',

  `electric_current`               int comment '总电流',

  `soc`                     int comment 'SOC',

  `dc_status`                  int comment 'DC-DC状态',

  `gear`                     int comment '挡位',

  `insulation_resistance`            int comment '绝缘电阻',

  `motor_count`                 int comment '驱动电机个数',

  `motor_list`                  array<struct<`id` :int, `status` :int, `rev` :int, `torque` :int,

​                                `controller_temperature` :int, `temperature` :int,

​                                `voltage`

​                                :int, `electric_current` :int>> comment '驱动电机列表',

  `fuel_cell_voltage`              int comment '燃料电池电压',

  `fuel_cell_current`              int comment '燃料电池电流',

  `fuel_cell_consume_rate`            int comment '燃料消耗率',

  `fuel_cell_temperature_probe_count`      int comment '燃料电池温度探针总数',

  `fuel_cell_temperature`            int comment '燃料电池温度值',

  `fuel_cell_max_temperature`          int comment '氢系统中最高温度',

  `fuel_cell_max_temperature_probe_id`      int comment '氢系统中最高温度探针号',

  `fuel_cell_max_hydrogen_consistency`      int comment '氢气最高浓度',

  `fuel_cell_max_hydrogen_consistency_probe_id` int comment '氢气最高浓度传感器代号',

  `fuel_cell_max_hydrogen_pressure`       int comment '氢气最高压力',

  `fuel_cell_max_hydrogen_pressure_probe_id`   int comment '氢气最高压力传感器代号',

  `fuel_cell_dc_status`             int comment '高压DC-DC状态',

  `engine_status`                int comment '发动机状态',

  `crankshaft_speed`               int comment '曲轴转速',

  `fuel_consume_rate`              int comment '燃料消耗率',

  `max_voltage_battery_pack_id`         int comment '最高电压电池子系统号',

  `max_voltage_battery_id`            int comment '最高电压电池单体代号',

  `max_voltage`                 int comment '电池单体电压最高值',

  `min_temperature_subsystem_id`         int comment '最低电压电池子系统号',

  `min_voltage_battery_id`            int comment '最低电压电池单体代号',

  `min_voltage`                 int comment '电池单体电压最低值',

  `max_temperature_subsystem_id`         int comment '最高温度子系统号',

  `max_temperature_probe_id`           int comment '最高温度探针号',

  `max_temperature`               int comment '最高温度值',

  `min_voltage_battery_pack_id`         int comment '最低温度子系统号',

  `min_temperature_probe_id`           int comment '最低温度探针号',

  `min_temperature`               int comment '最低温度值',

  `battery_count`                int comment '单体电池总数',

  `battery_pack_count`              int comment '单体电池包总数',

  `battery_voltages`               array<int> comment '单体电池电压值列表',

  `battery_temperature_probe_count`       int comment '单体电池温度探针总数',

  `battery_pack_temperature_count`        int comment '单体电池包总数',

  `battery_temperatures`             array<int> comment '单体电池温度值列表',

  `timestamp`                  bigint comment '日志采集时间'

)

comment '充电桩充电日志事实表'

partitioned by (`dt` string comment '统计日期')

stored as orc

location '/warehouse/car_data/dwd/dwd_car_running_charging_inc'

tblproperties ('orc.compress' = 'snappy');
```

#### 3.5.2 数据装载

##### 首日装载

```sql
insert overwrite table dwd_car_running_charging_inc partition(dt)

select

  `vin`,
  ...
  \`timestamp\`,

  dt

from ods_car_data_inc

where dt<='2023-05-02'

and car_status=1

and charge_status=2;
```

#####  ② 每日装载

```sql
insert overwrite table dwd_car_running_charging_inc partition(dt='2023-05-03')

select

  `vin`,
  ...

  \`timestamp\`

from ods_car_data_inc

where dt='2023-05-03'

and car_status=1

and charge_status=2;
```

### 3.6 故障告警日志事实表

#### 建表语句

```sql
drop table if exists dwd_car_alarm_inc;

create external table dwd_car_alarm_inc

(

  `vin`                     string comment '汽车唯一ID',

  `car_status`                  int comment '车辆状态',

  `charge_status`                int comment '充电状态',

  `execution_mode`                int comment '运行模式',

  `velocity`                   int comment '车速',

  `mileage`                   int comment '里程',

  `voltage`                   int comment '总电压',

  `electric_current`               int comment '总电流',

  `soc`                     int comment 'SOC',

  `dc_status`                  int comment 'DC-DC状态',

  `gear`                     int comment '挡位',

  `insulation_resistance`            int comment '绝缘电阻',

  `motor_count`                 int comment '驱动电机个数',

  `motor_list`                  array<struct<`id` :int, `status` :int, `rev` :int, `torque` :int,

​                                `controller_temperature` :int, `temperature` :int,

​                                `voltage`

​                                :int, `electric_current` :int>> comment '驱动电机列表',

  `fuel_cell_voltage`              int comment '燃料电池电压',

  `fuel_cell_current`              int comment '燃料电池电流',

  `fuel_cell_consume_rate`            int comment '燃料消耗率',

  `fuel_cell_temperature_probe_count`      int comment '燃料电池温度探针总数',

  `fuel_cell_temperature`            int comment '燃料电池温度值',

  `fuel_cell_max_temperature`          int comment '氢系统中最高温度',

  `fuel_cell_max_temperature_probe_id`      int comment '氢系统中最高温度探针号',

  `fuel_cell_max_hydrogen_consistency`      int comment '氢气最高浓度',

  `fuel_cell_max_hydrogen_consistency_probe_id` int comment '氢气最高浓度传感器代号',

  `fuel_cell_max_hydrogen_pressure`       int comment '氢气最高压力',

  `fuel_cell_max_hydrogen_pressure_probe_id`   int comment '氢气最高压力传感器代号',

  `fuel_cell_dc_status`             int comment '高压DC-DC状态',

  `engine_status`                int comment '发动机状态',

  `crankshaft_speed`               int comment '曲轴转速',

  `fuel_consume_rate`              int comment '燃料消耗率',

  `max_voltage_battery_pack_id`         int comment '最高电压电池子系统号',

  `max_voltage_battery_id`            int comment '最高电压电池单体代号',

  `max_voltage`                 int comment '电池单体电压最高值',

  `min_temperature_subsystem_id`         int comment '最低电压电池子系统号',

  `min_voltage_battery_id`            int comment '最低电压电池单体代号',

  `min_voltage`                 int comment '电池单体电压最低值',

  `max_temperature_subsystem_id`         int comment '最高温度子系统号',

  `max_temperature_probe_id`           int comment '最高温度探针号',

  `max_temperature`               int comment '最高温度值',

  `min_voltage_battery_pack_id`         int comment '最低温度子系统号',

  `min_temperature_probe_id`           int comment '最低温度探针号',

  `min_temperature`               int comment '最低温度值',

  `alarm_level`                 int comment '报警级别',

  `alarm_sign`                  int comment '通用报警标志',

  `custom_battery_alarm_count`          int comment '可充电储能装置故障总数N1',

  `custom_battery_alarm_list`          array<int> comment '可充电储能装置故障代码列表',

  `custom_motor_alarm_count`           int comment '驱动电机故障总数N2',

  `custom_motor_alarm_list`           array<int> comment '驱动电机故障代码列表',

  `custom_engine_alarm_count`          int comment '发动机故障总数N3',

  `custom_engine_alarm_list`           array<int> comment '发动机故障代码列表',

  `other_alarm_count`              int comment '其他故障总数N4',

  `other_alarm_list`               array<int> comment '其他故障代码列表',

  `battery_count`                int comment '单体电池总数',

  `battery_pack_count`              int comment '单体电池包总数',

  `battery_voltages`               array<int> comment '单体电池电压值列表',

  `battery_temperature_probe_count`       int comment '单体电池温度探针总数',

  `battery_pack_temperature_count`        int comment '单体电池包总数',

  `battery_temperatures`             array<int> comment '单体电池温度值列表',

  `timestamp`                  bigint comment '日志采集时间'

)

comment '故障充电日志事实表'

partitioned by (`dt` string comment '统计日期')

stored as orc

location '/warehouse/car_data/dwd/dwd_car_alarm_inc'

tblproperties ('orc.compress' = 'snappy');
```

#### 数据装载

##### 首日装载

```sql
insert overwrite table dwd_car_alarm_inc partition(dt)

select

  `vin`,

  ...

  \`timestamp\`,

  dt

from ods_car_data_inc

where dt<='2023-05-02'

and alarm_level>0;
```

##### 每日装载

```sql
insert overwrite table dwd_car_alarm_inc partition(dt='2023-05-03')

select

  `vin`,

...

  \`timestamp\`

from ods_car_data_inc

where dt='2023-05-03'

and alarm_level>0;
```

### 3.7 驱动电机日志事实表

#### 3.7.1 建表



```sql
drop table if exists dwd_car_motor_inc;

create external table dwd_car_motor_inc

(

  `vin` string comment '汽车唯一ID',

  `id`  int comment '电机ID',

  `status` int comment '电机状态',

  `rev`  int comment '电机转速',

  `torque`  int comment '电机转矩',

  `controller_temperature`  int comment '电机控制器温度',

  `temperature`  int comment '电机温度',

  `voltage` int comment '电机控制器输入电压',

`electric_current` int comment '电机控制器直流母线电流',

`timestamp`      bigint comment '日志采集时间'

)
comment '驱动电机日志事实表'
partitioned by (`dt` string comment '统计日期')
stored as orc
location '/warehouse/car_data/dwd/dwd_car_motor_inc'
tblproperties ('orc.compress' = 'snappy');
```

#### 3.7.2 数据装载

##### ① 首日装载

```sql
set hive.exec.dynamic.partition.mode=nonstrict;
insert overwrite table dwd_car_motor_inc partition(dt)
select
  vin,
  motor.id ,
  motor.status,
  motor.rev,
  motor.torque,
  motor.controller_temperature,
  motor.temperature,
  motor.voltage,
  motor.electric_current,
  `timestamp` ,
  dt
from ods_car_data_inc
lateral view explode(motor_list) tmp as motor
where dt<='2023-05-02';
```

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240314150812184.png)

原本的一行数据就炸裂成了两行数据，区别当然也就是不同的电机日志(motor.id)，完整炸裂结果：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240314151028915.png)

##### ② 每日装载

````sql
insert overwrite table dwd_car_motor_inc partition(dt='2023-05-03')
select
  vin,
  ...
	`timestamp`
from ods_car_data_inc
lateral view explode(motor_list) tmp as motor
where dt='2023-05-03';
````
## 4 数据装载脚本

不想天天写 SQL，还是需要脚本来定时执行。

### 4.1 首日装载

home/atguigu/bin目录下创建ods_to_dwd_init.sh

vim ods_to_dwd_init.sh

```shell
#!/bin/bash
APP='car_data'

if [ -n "$2" ]; then
    do_date=$2
else
    do_date=$(date -d '-1 day' +%F)
fi

dwd_car_running_electricity_inc="set hive.exec.dynamic.partition.mode=nonstrict;
insert overwrite table ${APP}.dwd_car_running_electricity_inc partition(dt)
select
    `vin`,
    `velocity`,
    `mileage`,
    `voltage`,
    `electric_current`,
    `soc`,
    `dc_status`,
    `gear`,
    `insulation_resistance`,
    `motor_count`,
    `motor_list`,
    `fuel_cell_dc_status`,
    `engine_status`,
    `crankshaft_speed`,
    `fuel_consume_rate`  ,
    `max_voltage_battery_pack_id`,
    `max_voltage_battery_id`,
    `max_voltage`,
    `min_temperature_subsystem_id`,
    `min_voltage_battery_id`,
    `min_voltage`,
    `max_temperature_subsystem_id`,
    `max_temperature_probe_id`,
    `max_temperature`,
    `min_voltage_battery_pack_id`,
    `min_temperature_probe_id`,
    `min_temperature`,
    `battery_count`,
    `battery_pack_count`,
    `battery_voltages`,
    `battery_temperature_probe_count`,
    `battery_pack_temperature_count`,
    `battery_temperatures`,
    \`timestamp\`,
    `dt`
from ${APP}.ods_car_data_inc
where dt <='$do_date'
and car_status=1
and execution_mode=1;
"

dwd_car_running_hybrid_inc="set hive.exec.dynamic.partition.mode=nonstrict;
insert overwrite table ${APP}.dwd_car_running_hybrid_inc partition(dt)
select
    `vin`,
    `velocity`,
    `mileage`,
    `voltage`,
    `electric_current`,
    `soc`,
    `dc_status`,
    `gear`,
    `insulation_resistance`,
    `motor_count`,
    `motor_list`,
    `fuel_cell_dc_status`,
    `engine_status`,
    `crankshaft_speed`,
    `fuel_consume_rate`  ,
    `max_voltage_battery_pack_id`,
    `max_voltage_battery_id`,
    `max_voltage`,
    `min_temperature_subsystem_id`,
    `min_voltage_battery_id`,
    `min_voltage`,
    `max_temperature_subsystem_id`,
    `max_temperature_probe_id`,
    `max_temperature`,
    `min_voltage_battery_pack_id`,
    `min_temperature_probe_id`,
    `min_temperature`,
    `battery_count`,
    `battery_pack_count`,
    `battery_voltages`,
    `battery_temperature_probe_count`,
    `battery_pack_temperature_count`,
    `battery_temperatures`,
    \`timestamp\`,
    `dt`
from ${APP}.ods_car_data_inc
where dt<='${do_date}'
and car_status=1
and execution_mode=2;
"

dwd_car_running_fuel_inc="set hive.exec.dynamic.partition.mode=nonstrict;
insert overwrite table ${APP}.dwd_car_running_fuel_inc partition(dt)
select
    `vin`,
    `velocity`,
    `mileage`,
    `voltage`,
    `electric_current`,
    `soc`,
    `dc_status`,
    `gear`,
    `insulation_resistance`,
    `fuel_cell_voltage`,
    `fuel_cell_current`,
    `fuel_cell_consume_rate`,
    `fuel_cell_temperature_probe_count`,
    `fuel_cell_temperature`,
    `fuel_cell_max_temperature`,
    `fuel_cell_max_temperature_probe_id`,
    `fuel_cell_max_hydrogen_consistency`,
    `fuel_cell_max_hydrogen_consistency_probe_id`,
    `fuel_cell_max_hydrogen_pressure`,
    `fuel_cell_max_hydrogen_pressure_probe_id`,
    `fuel_cell_dc_status`,
    `engine_status`,
    `crankshaft_speed`,
    `fuel_consume_rate`,
    `max_voltage_battery_pack_id`,
    `max_voltage_battery_id`,
    `max_voltage`,
    `min_temperature_subsystem_id`,
    `min_voltage_battery_id`,
    `min_voltage`,
    `max_temperature_subsystem_id`,
    `max_temperature_probe_id`,
    `max_temperature`,
    `min_voltage_battery_pack_id`,
    `min_temperature_probe_id`,
    `min_temperature`,
    \`timestamp\`,
    dt
from ${APP}.ods_car_data_inc
where dt<='${do_date}'
and car_status=1
and execution_mode=3;
"

dwd_car_parking_charging_inc="set hive.exec.dynamic.partition.mode=nonstrict;
insert overwrite table ${APP}.dwd_car_parking_charging_inc partition(dt)
select
    `vin`,
    `voltage`,
    `electric_current`,
    `soc`,
    `dc_status`,
    `gear`,
    `insulation_resistance`,
    `engine_status`,
    `crankshaft_speed`,
    `fuel_consume_rate`,
    `max_voltage_battery_pack_id`,
    `max_voltage_battery_id`,
    `max_voltage`,
    `min_temperature_subsystem_id`,
    `min_voltage_battery_id`,
    `min_voltage`,
    `max_temperature_subsystem_id`,
    `max_temperature_probe_id`,
    `max_temperature`,
    `min_voltage_battery_pack_id`,
    `min_temperature_probe_id`,
    `min_temperature`,
    `battery_count`,
    `battery_pack_count`,
    `battery_voltages`,
    `battery_temperature_probe_count`,
    `battery_pack_temperature_count`,
    `battery_temperatures`,
    \`timestamp\`,
    dt
from ${APP}.ods_car_data_inc
where dt<='${do_date}'
and car_status=2
and charge_status=1;
"

dwd_car_running_charging_inc="set hive.exec.dynamic.partition.mode=nonstrict;
insert overwrite table ${APP}.dwd_car_running_charging_inc partition(dt)
select
    `vin`,
    `velocity`,
    `mileage`,
    `voltage`,
    `electric_current`,
    `soc`,
    `dc_status`,
    `gear`,
    `insulation_resistance`,
    `motor_count`,
    `motor_list`,
    `fuel_cell_voltage`,
    `fuel_cell_current`,
    `fuel_cell_consume_rate`,
    `fuel_cell_temperature_probe_count`,
    `fuel_cell_temperature`,
    `fuel_cell_max_temperature`,
    `fuel_cell_max_temperature_probe_id`,
    `fuel_cell_max_hydrogen_consistency`,
    `fuel_cell_max_hydrogen_consistency_probe_id`,
    `fuel_cell_max_hydrogen_pressure`,
    `fuel_cell_max_hydrogen_pressure_probe_id`,
    `fuel_cell_dc_status`,
    `engine_status`,
    `crankshaft_speed`,
    `fuel_consume_rate`,
    `max_voltage_battery_pack_id`,
    `max_voltage_battery_id`,
    `max_voltage`,
    `min_temperature_subsystem_id`,
    `min_voltage_battery_id`,
    `min_voltage`,
    `max_temperature_subsystem_id`,
    `max_temperature_probe_id`,
    `max_temperature`,
    `min_voltage_battery_pack_id`,
    `min_temperature_probe_id`,
    `min_temperature`,
    `battery_count`,
    `battery_pack_count`,
    `battery_voltages`,
    `battery_temperature_probe_count`,
    `battery_pack_temperature_count`,
    `battery_temperatures`,
    \`timestamp\`,
    dt
from ${APP}.ods_car_data_inc
where dt<='${do_date}'
and car_status=1
and charge_status=2;
"
dwd_car_alarm_inc="set hive.exec.dynamic.partition.mode=nonstrict;
insert overwrite table ${APP}.dwd_car_alarm_inc partition(dt)
select
    `vin`,
    `car_status`,
    `charge_status`,
    `execution_mode`,
    `velocity`,
    `mileage`,
    `voltage`,
    `electric_current`,
    `soc`,
    `dc_status`,
    `gear`,
    `insulation_resistance`,
    `motor_count`,
    `motor_list`,
    `fuel_cell_voltage`,
    `fuel_cell_current`,
    `fuel_cell_consume_rate`,
    `fuel_cell_temperature_probe_count`,
    `fuel_cell_temperature`,
    `fuel_cell_max_temperature`,
    `fuel_cell_max_temperature_probe_id`,
    `fuel_cell_max_hydrogen_consistency`,
    `fuel_cell_max_hydrogen_consistency_probe_id`,
    `fuel_cell_max_hydrogen_pressure`,
    `fuel_cell_max_hydrogen_pressure_probe_id`,
    `fuel_cell_dc_status`,
    `engine_status`,
    `crankshaft_speed`,
    `fuel_consume_rate`,
    `max_voltage_battery_pack_id`,
    `max_voltage_battery_id`,
    `max_voltage`,
    `min_temperature_subsystem_id`,
    `min_voltage_battery_id`,
    `min_voltage`,
    `max_temperature_subsystem_id`,
    `max_temperature_probe_id`,
    `max_temperature`,
    `min_voltage_battery_pack_id`,
    `min_temperature_probe_id`,
    `min_temperature`,
    `alarm_level`,
    `alarm_sign`,
    `custom_battery_alarm_count`,
    `custom_battery_alarm_list`,
    `custom_motor_alarm_count`,
    `custom_motor_alarm_list`,
    `custom_engine_alarm_count`,
    `custom_engine_alarm_list`,
    `other_alarm_count`,
    `other_alarm_list`,
    `battery_count`,
    `battery_pack_count`,
    `battery_voltages`,
    `battery_temperature_probe_count`,
    `battery_pack_temperature_count`,
    `battery_temperatures`,
    \`timestamp\`,
    dt
from ${APP}.ods_car_data_inc
where dt<='${do_date}'
and alarm_level>0;
"

dwd_car_motor_inc="set hive.exec.dynamic.partition.mode=nonstrict;
insert overwrite table ${APP}.dwd_car_motor_inc partition(dt)
select
    vin,
    motor.id ,
    motor.status,
    motor.rev,
    motor.torque,
    motor.controller_temperature,
    motor.temperature,
    motor.voltage,
motor.electric_current,
\`timestamp\`,
    dt
from ${APP}.ods_car_data_inc
lateral view explode(motor_list) tmp as motor
where dt<='${do_date}';
"

case $1 in
'dwd_car_running_electricity_inc')
    hive -e "$dwd_car_running_electricity_inc"
    ;;
'dwd_car_running_hybrid_inc')
    hive -e "$dwd_car_running_hybrid_inc"
    ;;
'dwd_car_running_fuel_inc')
    hive -e "$dwd_car_running_fuel_inc"
    ;;
'dwd_car_parking_charging_inc')
    hive -e "$dwd_car_parking_charging_inc"
    ;;
'dwd_car_running_charging_inc')
    hive -e "$dwd_car_running_charging_inc"
    ;;
'dwd_car_alarm_inc')
    hive -e "$dwd_car_alarm_inc"
;;
'dwd_car_motor_inc')
    hive -e "$dwd_car_motor_inc"
    ;;
"all")
    hive -e "$dwd_car_running_electricity_inc$dwd_car_running_hybrid_inc$dwd_car_running_fuel_inc$dwd_car_parking_charging_inc$dwd_car_running_charging_inc$dwd_car_alarm_inc$dwd_car_motor_inc"
    ;;
esac
```

```bash
chmod +x ods_to_dwd_init.sh

ods_to_dwd_init.sh all 2024-03-14
```

### 4.2 每日装载

```shell
#!/bin/bash

APP='car_data'
if [ -n "$2" ]; then
    do_date=$2
else
    do_date=$(date -d '-1 day' +%F)
fi

dwd_car_running_electricity_inc="insert overwrite table ${APP}.dwd_car_running_electricity_inc partition(dt='${do_date}')
select
    vin,
    velocity,
    mileage,
    voltage,
    electric_current,
    soc,
    dc_status,
    gear,
    insulation_resistance,
    motor_count,
    motor_list,
    fuel_cell_dc_status,
    engine_status,
    crankshaft_speed,
    fuel_consume_rate  ,
    max_voltage_battery_pack_id,
    max_voltage_battery_id,
    max_voltage,
    min_temperature_subsystem_id,
    min_voltage_battery_id,
    min_voltage,
    max_temperature_subsystem_id,
    max_temperature_probe_id,
    max_temperature,
    min_voltage_battery_pack_id,
    min_temperature_probe_id,
    min_temperature,
    battery_count,
    battery_pack_count,
    battery_voltages,
    battery_temperature_probe_count,
    battery_pack_temperature_count,
    battery_temperatures,
    \`timestamp\`
from ${APP}.ods_car_data_inc
where dt='${do_date}'
and car_status=1
and execution_mode=1;
"

dwd_car_running_hybrid_inc="insert overwrite table ${APP}.dwd_car_running_hybrid_inc partition(dt='${do_date}')
select
    vin,
    velocity,
    mileage,
    voltage,
    electric_current,
    soc,
    dc_status,
    gear,
    insulation_resistance,
    motor_count,
    motor_list,
    fuel_cell_dc_status,
    engine_status,
    crankshaft_speed,
    fuel_consume_rate  ,
    max_voltage_battery_pack_id,
    max_voltage_battery_id,
    max_voltage,
    min_temperature_subsystem_id,
    min_voltage_battery_id,
    min_voltage,
    max_temperature_subsystem_id,
    max_temperature_probe_id,
    max_temperature,
    min_voltage_battery_pack_id,
    min_temperature_probe_id,
    min_temperature,
    battery_count,
    battery_pack_count,
    battery_voltages,
    battery_temperature_probe_count,
    battery_pack_temperature_count,
    battery_temperatures,
    \`timestamp\`
from ${APP}.ods_car_data_inc
where dt='${do_date}'
and car_status=1
and execution_mode=2;
"

dwd_car_running_fuel_inc="insert overwrite table ${APP}.dwd_car_running_fuel_inc partition(dt='${do_date}')
select
    vin,
    velocity,
    mileage,
    voltage,
    electric_current,
    soc,
    dc_status,
    gear,
    insulation_resistance,
    fuel_cell_voltage,
    fuel_cell_current,
    fuel_cell_consume_rate,
    fuel_cell_temperature_probe_count,
    fuel_cell_temperature,
    fuel_cell_max_temperature,
    fuel_cell_max_temperature_probe_id,
    fuel_cell_max_hydrogen_consistency,
    fuel_cell_max_hydrogen_consistency_probe_id,
    fuel_cell_max_hydrogen_pressure,
    fuel_cell_max_hydrogen_pressure_probe_id,
    fuel_cell_dc_status,
    engine_status,
    crankshaft_speed,
    fuel_consume_rate,
    max_voltage_battery_pack_id,
    max_voltage_battery_id,
    max_voltage,
    min_temperature_subsystem_id,
    min_voltage_battery_id,
    min_voltage,
    max_temperature_subsystem_id,
    max_temperature_probe_id,
    max_temperature,
    min_voltage_battery_pack_id,
    min_temperature_probe_id,
    min_temperature,
    \`timestamp\`
from ${APP}.ods_car_data_inc
where dt='${do_date}'
and car_status=1
and execution_mode=3;
"

dwd_car_parking_charging_inc="insert overwrite table ${APP}.dwd_car_parking_charging_inc partition(dt='${do_date}')
select
    vin,
    voltage,
    electric_current,
    soc,
    dc_status,
    gear,
    insulation_resistance,
    engine_status,
    crankshaft_speed,
    fuel_consume_rate,
    max_voltage_battery_pack_id,
    max_voltage_battery_id,
    max_voltage,
    min_temperature_subsystem_id,
    min_voltage_battery_id,
    min_voltage,
    max_temperature_subsystem_id,
    max_temperature_probe_id,
    max_temperature,
    min_voltage_battery_pack_id,
    min_temperature_probe_id,
    min_temperature,
    battery_count,
    battery_pack_count,
    battery_voltages,
    battery_temperature_probe_count,
    battery_pack_temperature_count,
    battery_temperatures,
    \`timestamp\`
from ${APP}.ods_car_data_inc
where dt='${do_date}'
and car_status=2
and charge_status=1;
"

dwd_car_running_charging_inc="insert overwrite table ${APP}.dwd_car_running_charging_inc partition(dt='${do_date}')
select
    vin,
    velocity,
    mileage,
    voltage,
    electric_current,
    soc,
    dc_status,
    gear,
    insulation_resistance,
    motor_count,
    motor_list,
    fuel_cell_voltage,
    fuel_cell_current,
    fuel_cell_consume_rate,
    fuel_cell_temperature_probe_count,
    fuel_cell_temperature,
    fuel_cell_max_temperature,
    fuel_cell_max_temperature_probe_id,
    fuel_cell_max_hydrogen_consistency,
    fuel_cell_max_hydrogen_consistency_probe_id,
    fuel_cell_max_hydrogen_pressure,
    fuel_cell_max_hydrogen_pressure_probe_id,
    fuel_cell_dc_status,
    engine_status,
    crankshaft_speed,
    fuel_consume_rate,
    max_voltage_battery_pack_id,
    max_voltage_battery_id,
    max_voltage,
    min_temperature_subsystem_id,
    min_voltage_battery_id,
    min_voltage,
    max_temperature_subsystem_id,
    max_temperature_probe_id,
    max_temperature,
    min_voltage_battery_pack_id,
    min_temperature_probe_id,
    min_temperature,
    battery_count,
    battery_pack_count,
    battery_voltages,
    battery_temperature_probe_count,
    battery_pack_temperature_count,
    battery_temperatures,
    \`timestamp\`
from ${APP}.ods_car_data_inc
where dt='${do_date}'
and car_status=1
and charge_status=2;
"

dwd_car_alarm_inc="insert overwrite table ${APP}.dwd_car_alarm_inc partition(dt='${do_date}')
select
    vin,
    car_status,
    charge_status,
    execution_mode,
    velocity,
    mileage,
    voltage,
    electric_current,
    soc,
    dc_status,
    gear,
    insulation_resistance,
    motor_count,
    motor_list,
    fuel_cell_voltage,
    fuel_cell_current,
    fuel_cell_consume_rate,
    fuel_cell_temperature_probe_count,
    fuel_cell_temperature,
    fuel_cell_max_temperature,
    fuel_cell_max_temperature_probe_id,
    fuel_cell_max_hydrogen_consistency,
    fuel_cell_max_hydrogen_consistency_probe_id,
    fuel_cell_max_hydrogen_pressure,
    fuel_cell_max_hydrogen_pressure_probe_id,
    fuel_cell_dc_status,
    engine_status,
    crankshaft_speed,
    fuel_consume_rate,
    max_voltage_battery_pack_id,
    max_voltage_battery_id,
    max_voltage,
    min_temperature_subsystem_id,
    min_voltage_battery_id,
    min_voltage,
    max_temperature_subsystem_id,
    max_temperature_probe_id,
    max_temperature,
    min_voltage_battery_pack_id,
    min_temperature_probe_id,
    min_temperature,
    alarm_level,
    alarm_sign,
    custom_battery_alarm_count,
    custom_battery_alarm_list,
    custom_motor_alarm_count,
    custom_motor_alarm_list,
    custom_engine_alarm_count,
    custom_engine_alarm_list,
    other_alarm_count,
    other_alarm_list,
    battery_count,
    battery_pack_count,
    battery_voltages,
    battery_temperature_probe_count,
    battery_pack_temperature_count,
    battery_temperatures,
    \`timestamp\`
from ${APP}.ods_car_data_inc
where dt='${do_date}'
and alarm_level>0;
"
dwd_car_alarm_inc="insert overwrite table ${APP}.dwd_car_motor_inc partition(dt='${do_date}')
select
    vin,
    motor.id ,
    motor.status,
    motor.rev,
    motor.torque,
    motor.controller_temperature,
    motor.temperature,
    motor.voltage,
motor.electric_current,
\`timestamp\`
from ${APP}.ods_car_data_inc
lateral view explode(motor_list) tmp as motor
where dt<='${do_date}';
"
case $1 in
'dwd_car_running_electricity_inc')
    hive -e "$dwd_car_running_electricity_inc"
    ;;
'dwd_car_running_hybrid_inc')
    hive -e "$dwd_car_running_hybrid_inc"
    ;;
'dwd_car_running_fuel_inc')
    hive -e "$dwd_car_running_fuel_inc"
    ;;
'dwd_car_parking_charging_inc')
    hive -e "$dwd_car_parking_charging_inc"
    ;;
'dwd_car_running_charging_inc')
    hive -e "$dwd_car_running_charging_inc"
    ;;
'dwd_car_alarm_inc')
    hive -e "$dwd_car_alarm_inc"
;;
'dwd_car_motor_inc')
    hive -e "$dwd_car_motor_inc"
    ;;

"all")
    hive -e "$dwd_car_running_electricity_inc$dwd_car_running_hybrid_inc$dwd_car_running_fuel_inc$dwd_car_parking_charging_inc$dwd_car_running_charging_inc$dwd_car_alarm_inc$dwd_car_motor_inc"
    ;;
esac
```

```bash
chmod +x ods_to_dwd.sh
```



## 5 一劳永逸关闭严格模式

为了避免每个 SQL 都得写一次关闭严格模式，可直接更该 hive 配置，即修改hive-site.xml文件。

```xml
<!-- 动态分区的模式 -->
<property>
    <name>hive.exec.dynamic.partition.mode</name>
    <value>nonstrict</value>
    <description>
      In strict mode, the user must specify at least one static partition
      in case the user accidentally overwrites all partitions.
      In nonstrict mode all partitions are allowed to be dynamic.
    </description>
</property>
```

vim改完后，再启动 hiveserver2