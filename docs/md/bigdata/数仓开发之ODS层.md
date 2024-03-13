# 数仓开发之ODS层

优秀可靠的数仓体系，需要良好的数据分层结构。合理的分层，能够使数据体系更加清晰，使复杂问题得以简化。以下是该项目的分层规划。

## 1 设计要点

（1）ODS层的表结构设计依托于从业务系统同步过来的数据结构

（2）ODS层要保存全部历史数据，故其压缩格式应选择压缩比较高的，此处选择gzip

（3）ODS层表名的命名规范为：ods_表名_单分区增量全量标识（inc/full）。

## 2 相关表

### 2.1 整车日志表（增量日志表）

```sql

create external table ods_car_data_inc

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

  \`timestamp\`                  bigint comment '日志采集时间'

) 

  comment '整车日志表'

  partitioned by (`dt` string comment '统计日期')

  ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.JsonSerDe'

  location '/warehouse/car_data/ods/ods_car_data_inc';
```

### 2.2 汽车信息表（全量表）

```sql
drop table if exists ods_car_info_full;
CREATE EXTERNAL TABLE IF NOT EXISTS ods_car_info_full (
  `id` string COMMENT '车辆唯一编码',
  `type_id` string COMMENT '车型ID',
  `type` string COMMENT '车型',
  `sale_type` string COMMENT '销售车型',
  `trademark` string COMMENT '品牌',
  `company` string COMMENT '厂商',
  `seating_capacity` int COMMENT '准载人数',
  `power_type` string COMMENT '车辆动力类型',
  `charge_type` string COMMENT '车辆支持充电类型',
  `category` string COMMENT '车辆分类',
  `weight_kg` int COMMENT '总质量（kg）',
  `warranty` string COMMENT '整车质保期（年/万公里）'
)
COMMENT '整车信息表'
PARTITIONED BY (dt string COMMENT '统计日期')
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t'
LOCATION '/warehouse/car_data/ods/ods_car_info_full';
```

## 3 数据装载

```shell
#!/bin/bash

APP='car_data'

# 判断第二个参数是否填写 如果填写使用作为日期 如果没有填写 默认使用昨天作为日期
if [ -n "$2" ]; then
	# statements
	do_date=$2
else
	do_date=`date -d '-1 day' +%F`
fi

case "$1" in
  "ods_car_data_inc")
    hive -e "LOAD DATA INPATH '/origin_data/car_data_ful1/$do_date' INTO TABLE $APP.ods_car_data_inc PARTITION (dt='$do_date');"
    ;;
  "ods_car_info_full")
    hive -e "LOAD DATA INPATH '/origin_data/car_info_full/$do_date' INTO TABLE $APP.ods_car_info_full PARTITION (dt='$do_date');"
    ;;
  "all")
    hive -e "LOAD DATA INPATH '/origin_data/car_data_ful1/$do_date' INTO TABLE $APP.ods_car_data_inc PARTITION (dt='$do_date');"
    hive -e "LOAD DATA INPATH '/origin_data/car_info_full/$do_date' INTO TABLE $APP.ods_car_info_full PARTITION (dt='$do_date');"
    ;;
  *)
    echo "Usage: $0 {ods_car_data_inc|ods_car_info_full|all}"
    ;;
esac
```

确保在Hive加载数据之前，数据文件已经存在于对应的HDFS路径中，且表的分区字段名是正确的。在运行脚本之前，授予其执行权限，使用以下命令。然后根据你的需求执行脚本：

```bash
./your_script_name.sh ods_car_data_inc
./your_script_name.sh ods_car_info_full

./your_script_name.sh all 2024-03-11
```

写好脚本，以后放入 dophinschedule 调度器每天跑就行。实现将 HDFS 数据载入 ods表 中。