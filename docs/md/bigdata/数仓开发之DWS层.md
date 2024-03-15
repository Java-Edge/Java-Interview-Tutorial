

# 数仓开发之DWS层

## 1 单次粒度汇总表

### 1.1 单次行程汇总表

#### 建表语句

```sql
drop table if exists dws_electricity_single_trip_detail;

create external table dws_electricity_single_trip_detail

(

  `id`           string comment '行程id',

  `vin`          string comment '汽车唯一编码',

  `start_timestamp`    bigint comment '开始时间',

  `end_timestamp`     bigint comment '结束时间',

  `start_mileage`     int comment '开始里程',

  `end_mileage`      int comment '结束里程',

  `start_soc`       int comment '行程开始soc, 单位：0.1%',

  `end_soc`        int comment '行程结束soc, 单位：0.1%',

  `avg_speed`       decimal(16, 2) comment '平均时速',

  `car_avg_voltage`    decimal(16, 2) comment '汽车平均电压',

  `car_avg_electric_current`    decimal(16, 2) comment '汽车平均电流',

  `battery_avg_max_temperature`    decimal(16, 2) comment '电池组最高温度的平均温度',

  `battery_mid_max_temperature`    decimal(16, 2) comment '电池组最高温度的中位数',

  `battery_avg_min_temperature`    decimal(16, 2) comment '电池组最低温度的平均温度',

  `battery_mid_min_temperature`    decimal(16, 2) comment '电池组最低温度的中位数',

  `battery_avg_max_voltage`      decimal(16, 2) comment '电池组最高电压的平均电压',

  `battery_mid_max_voltage`      decimal(16, 2) comment '电池组最高电压的中位数',

  `battery_avg_min_voltage`      decimal(16, 2) comment '电池组最低电压的平均电压',

  `battery_mid_min_voltage`      decimal(16, 2) comment '电池组最低电压的中位数'

) comment '单次行程汇总表'

  partitioned by (`dt` string comment '统计日期')

  stored as orc

  location '/warehouse/car_data/dws/dws_electricity_single_trip_detail'

  tblproperties ('orc.compress' = 'snappy');
```

#### 首日装载

```sql
INSERT OVERWRITE TABLE dws_electricity_single_trip_detail PARTITION (dt)
SELECT
  CONCAT(vin, '-', MIN(`timestamp`)) AS id,
  vin,
  MIN(`timestamp`) AS start_timestamp,
  MAX(`timestamp`) AS end_timestamp,
  MIN(mileage) AS start_mileage,
  MAX(mileage) AS end_mileage,
  MAX(soc) AS start_soc,
  MIN(soc) AS end_soc,
  AVG(velocity) AS avg_speed,
  AVG(voltage) AS car_avg_voltage,
  AVG(electric_current) AS car_avg_electric_current,
  AVG(max_temperature) AS battery_avg_max_temperature,
  COLLECT_LIST(max_temperature)[CAST(COUNT(*) / 2 AS INT)] AS battery_mid_max_temperature,
  AVG(min_temperature) AS battery_avg_min_temperature,
  COLLECT_LIST(min_temperature)[CAST(COUNT(*) / 2 AS INT)] AS battery_mid_min_temperature,
  AVG(max_voltage) AS battery_avg_max_voltage,
  COLLECT_LIST(max_voltage)[CAST(COUNT(*) / 2 AS INT)] AS battery_mid_max_voltage,
  AVG(min_voltage) AS battery_avg_min_voltage,
  COLLECT_LIST(min_voltage)[CAST(COUNT(*) / 2 AS INT)] AS battery_mid_min_voltage,
  dt
FROM (
  SELECT
    vin,
    velocity,
    mileage,
    voltage,
    electric_current,
    soc,
    max_temperature,
    max_voltage,
    min_temperature,
    min_voltage,
    `timestamp`,
    dt,
    SUM(mark) OVER (PARTITION BY vin ORDER BY `timestamp`) AS singer_trip
  FROM (
    SELECT
      vin,
      velocity,
      mileage,
      voltage,
      electric_current,
      soc,
      max_temperature,
      max_voltage,
      min_temperature,
      min_voltage,
      `timestamp`,
      dt,
      IF((LAG(`timestamp`, 1, 0) OVER (PARTITION BY vin ORDER BY `timestamp`) - `timestamp`) < -60000, 1, 0) AS mark
    FROM dwd_car_running_electricity_inc
    WHERE dt <= '2023-05-02'
  ) t1
) t2
GROUP BY dt, vin, singer_trip;
```

#### 日装载

```sql
INSERT OVERWRITE TABLE dws_electricity_single_trip_detail PARTITION (dt='2023-05-03')
SELECT
  CONCAT(vin, '-', MIN(`timestamp`)) AS id,
  vin,
  MIN(`timestamp`) AS start_timestamp,
  MAX(`timestamp`) AS end_timestamp,
  MIN(mileage) AS start_mileage,
  MAX(mileage) AS end_mileage,
  MAX(soc) AS start_soc,
  MIN(soc) AS end_soc,
  AVG(velocity) AS avg_speed,
  AVG(voltage) AS car_avg_voltage,
  AVG(electric_current) AS car_avg_electric_current,
  AVG(max_temperature) AS battery_avg_max_temperature,
  COLLECT_LIST(max_temperature)[CAST(COUNT(*) / 2 AS INT)] AS battery_mid_max_temperature,
  AVG(min_temperature) AS battery_avg_min_temperature,
  COLLECT_LIST(min_temperature)[CAST(COUNT(*) / 2 AS INT)] AS battery_mid_min_temperature,
  AVG(max_voltage) AS battery_avg_max_voltage,
  COLLECT_LIST(max_voltage)[CAST(COUNT(*) / 2 AS INT)] AS battery_mid_max_voltage,
  AVG(min_voltage) AS battery_avg_min_voltage,
  COLLECT_LIST(min_voltage)[CAST(COUNT(*) / 2 AS INT)] AS battery_mid_min_voltage
FROM (
  SELECT
    vin,
    velocity,
    mileage,
    voltage,
    electric_current,
    soc,
    max_temperature,
    max_voltage,
    min_temperature,
    min_voltage,
    `timestamp`,
    dt,
    SUM(mark) OVER (PARTITION BY vin ORDER BY `timestamp`) AS singer_trip
  FROM (
    SELECT
      vin,
      velocity,
      mileage,
      voltage,
      electric_current,
      soc,
      max_temperature,
      max_voltage,
      min_temperature,
      min_voltage,
      `timestamp`,
      dt,
      IF((LAG(`timestamp`, 1, 0) OVER (PARTITION BY vin ORDER BY `timestamp`) - `timestamp`) < -60000, 1, 0) AS mark
    FROM dwd_car_running_electricity_inc
    WHERE dt = '2023-05-03'
  ) t1
) t2
GROUP BY vin, singer_trip;
```

由于是离线数仓，本身就无法精确处理跨夜还在行驶的汽车，所以就需要实时数仓才能更加精确。

### 1.2 单次充电记录汇总表

#### 建表语句

```sql
drop table if exists dws_single_charge_detail_inc;

create external table dws_single_charge_detail_inc

(

  `id`           string comment '充电id',

  `vin`          string comment '汽车唯一编码',

  `start_timestamp`    bigint comment '开始时间',

  `end_timestamp`     bigint comment '结束时间',

  `start_soc`       int comment '充电开始soc, 单位：0.1%',

  `end_soc`        int comment '充电结束soc, 单位：0.1%',

  `max_total_voltage`   int comment '总电压MAX',

  `min_total_voltage`   int comment '总电压MIN',

  `avg_total_voltage`   decimal(16, 2) comment '总电压AVG',

  `max_current`      int comment '总电流MAX',

  `min_current`      int comment '总电流MIN',

  `avg_current`      decimal(16, 2) comment '总电流AVG',

  `battery_avg_max_temperature`    decimal(16, 2) comment '电池组最高温度的平均温度',

  `battery_mid_max_temperature`    decimal(16, 2) comment '电池组最高温度的中位数',

  `battery_avg_min_temperature`    decimal(16, 2) comment '电池组最低温度的平均温度',

  `battery_mid_min_temperature`    decimal(16, 2) comment '电池组最低温度的中位数',

  `battery_avg_max_voltage`      decimal(16, 2) comment '电池组最高电压的平均电压',

  `battery_mid_max_voltage`      decimal(16, 2) comment '电池组最高电压的中位数',

  `battery_avg_min_voltage`      decimal(16, 2) comment '电池组最低电压的平均电压',

  `battery_mid_min_voltage`      decimal(16, 2) comment '电池组最低电压的中位数'

) comment '单次充电汇总表'

  partitioned by (`dt` string comment '统计日期')

  stored as orc

  location '/warehouse/car_data/dws/dws_single_charge_detail_inc'

  tblproperties ('orc.compress' = 'snappy');
```

#### 首日装载

```sql
INSERT OVERWRITE TABLE dws_single_charge_detail_inc PARTITION (dt)
SELECT
  CONCAT(vin, '-', MIN(`timestamp`)) AS id,
  vin,
  MIN(`timestamp`) AS start_timestamp,
  MAX(`timestamp`) AS end_timestamp,
  MAX(soc) AS start_soc,
  MIN(soc) AS end_soc,
  MAX(voltage) AS max_total_voltage,
  MIN(voltage) AS min_total_voltage,
  AVG(voltage) AS avg_total_voltage,
  MAX(electric_current) AS max_current,
  MIN(electric_current) AS min_current,
  AVG(electric_current) AS avg_current,
  AVG(max_temperature) AS battery_avg_max_temperature,
  COLLECT_LIST(max_temperature)[CAST(COUNT(*) / 2 AS INT)] AS battery_mid_max_temperature,
  AVG(min_temperature) AS battery_avg_min_temperature,
  COLLECT_LIST(min_temperature)[CAST(COUNT(*) / 2 AS INT)] AS battery_mid_min_temperature,
  AVG(max_voltage) AS battery_avg_max_voltage,
  COLLECT_LIST(max_voltage)[CAST(COUNT(*) / 2 AS INT)] AS battery_mid_max_voltage,
  AVG(min_voltage) AS battery_avg_min_voltage,
  COLLECT_LIST(min_voltage)[CAST(COUNT(*) / 2 AS INT)] AS battery_mid_min_voltage,
  dt
FROM (
  SELECT
    vin,
    voltage,
    electric_current,
    soc,
    max_temperature,
    max_voltage,
    min_temperature,
    min_voltage,
    `timestamp`,
    dt,
    SUM(mark) OVER (PARTITION BY vin ORDER BY `timestamp`) AS singer_trip
  FROM (
    SELECT
      vin,
      voltage,
      electric_current,
      soc,
      max_temperature,
      max_voltage,
      min_temperature,
      min_voltage,
      `timestamp`,
      dt,
      IF((LAG(`timestamp`, 1, 0) OVER (PARTITION BY vin ORDER BY `timestamp`) - `timestamp`) < -60000, 1, 0) AS mark
    FROM dwd_car_parking_charging_inc
    WHERE dt <= '2023-05-02'
  ) t1
) t2
GROUP BY dt, vin, singer_trip;
```

#### 每日装载

```sql
INSERT OVERWRITE TABLE dws_single_charge_detail_inc PARTITION (dt='2023-05-03')
SELECT
  CONCAT(vin, '-', MIN(`timestamp`)) AS id,
  vin,
  MIN(`timestamp`) AS start_timestamp,
  MAX(`timestamp`) AS end_timestamp,
  MAX(soc) AS start_soc,
  MIN(soc) AS end_soc,
  MAX(voltage) AS max_total_voltage,
  MIN(voltage) AS min_total_voltage,
  AVG(voltage) AS avg_total_voltage,
  MAX(electric_current) AS max_current,
  MIN(electric_current) AS min_current,
  AVG(electric_current) AS avg_current,
  AVG(max_temperature) AS battery_avg_max_temperature,
  COLLECT_LIST(max_temperature)[CAST(COUNT(*) / 2 AS INT)] AS battery_mid_max_temperature,
  AVG(min_temperature) AS battery_avg_min_temperature,
  COLLECT_LIST(min_temperature)[CAST(COUNT(*) / 2 AS INT)] AS battery_mid_min_temperature,
  AVG(max_voltage) AS battery_avg_max_voltage,
  COLLECT_LIST(max_voltage)[CAST(COUNT(*) / 2 AS INT)] AS battery_mid_max_voltage,
  AVG(min_voltage) AS battery_avg_min_voltage,
  COLLECT_LIST(min_voltage)[CAST(COUNT(*) / 2 AS INT)] AS battery_mid_min_voltage
FROM (
  SELECT
    vin,
    voltage,
    electric_current,
    soc,
    max_temperature,
    max_voltage,
    min_temperature,
    min_voltage,
    `timestamp`,
    dt,
    SUM(mark) OVER (PARTITION BY vin ORDER BY `timestamp`) AS singer_trip
  FROM (
    SELECT
      vin,
      voltage,
      electric_current,
      soc,
      max_temperature,
      max_voltage,
      min_temperature,
      min_voltage,
      `timestamp`,
      dt,
      IF((LAG(`timestamp`, 1, 0) OVER (PARTITION BY vin ORDER BY `timestamp`) - `timestamp`) < -60000, 1, 0) AS mark
    FROM dwd_car_parking_charging_inc
    WHERE dt = '2023-05-03'
  ) t1
) t2
GROUP BY vin, singer_trip;
```

同理，也无法精确处理跨天还在充电的汽车，就导致拿不到充电结束的时间了呀！只能等要做 T+30的日志数据时，再对之前数据做一次修正。

### 1.3 装载脚本

#### 首日装载

```bash
vim dwd_to_dws_single_init.sh
```

编写内容：

```shell
#!/bin/bash

APP='car_data'

if [ -n "$2" ]; then
  do_date=$2
else
  do_date=$(date -d '-1 day' +%F)
fi

dws_electricity_single_trip_detail="
INSERT OVERWRITE TABLE ${APP}.dws_electricity_single_trip_detail PARTITION (dt)
SELECT
  CONCAT(vin,'-',MIN(\`timestamp\`)) AS id,
  vin,
  MIN(\`timestamp\`) AS start_timestamp,
  MAX(\`timestamp\`) AS end_timestamp,
  MIN(mileage) AS start_mileage,
  MAX(mileage) AS end_mileage,
  MAX(soc) AS start_soc,
  MIN(soc) AS end_soc,
  AVG(velocity) AS avg_speed,
  AVG(voltage) AS car_avg_voltage,
  AVG(electric_current) AS car_avg_electric_current,
  AVG(max_temperature) AS battery_avg_max_temperature,
  COLLECT_LIST(max_temperature)[CAST(COUNT(*)/2 AS INT)] AS battery_mid_max_temperature,
  AVG(min_temperature) AS battery_avg_min_temperature,
  COLLECT_LIST(min_temperature)[CAST(COUNT(*)/2 AS INT)] AS battery_mid_min_temperature,
  AVG(max_voltage) AS battery_avg_max_voltage,
  COLLECT_LIST(max_voltage)[CAST(COUNT(*)/2 AS INT)] AS battery_mid_max_voltage,
  AVG(min_voltage) AS battery_avg_min_voltage,
  COLLECT_LIST(min_voltage)[CAST(COUNT(*)/2 AS INT)] AS battery_mid_min_voltage,
  dt
FROM (
  SELECT
    vin,
    velocity,
    mileage,
    voltage,
    electric_current,
    soc,
    max_temperature,
    max_voltage,
    min_temperature,
    min_voltage,
    \`timestamp\`,
    dt,
    SUM(mark) OVER (PARTITION BY vin ORDER BY \`timestamp\`) AS singer_trip
  FROM (
    SELECT
      vin,
      velocity,
      mileage,
      voltage,
      electric_current,
      soc,
      max_temperature,
      max_voltage,
      min_temperature,
      min_voltage,
      \`timestamp\`,
      dt,
      IF((LAG(\`timestamp\`, 1, 0) OVER (PARTITION BY vin ORDER BY \`timestamp\`) - \`timestamp\`) < -60000, 1, 0) AS mark
    FROM ${APP}.dwd_car_running_electricity_inc
    WHERE dt <= '${do_date}'
  ) t1
) t2
GROUP BY dt, vin, singer_trip;
"

dws_single_charge_detail_inc="
INSERT OVERWRITE TABLE ${APP}.dws_single_charge_detail_inc PARTITION (dt)
SELECT
  CONCAT(vin,'-',MIN(\`timestamp\`)) AS id,
  vin,
  MIN(\`timestamp\`) AS start_timestamp,
  MAX(\`timestamp\`) AS end_timestamp,
  MAX(soc) AS start_soc,
  MIN(soc) AS end_soc,
  MAX(voltage) AS max_total_voltage,
  MIN(voltage) AS min_total_voltage,
  AVG(voltage) AS avg_total_voltage,
  MAX(electric_current) AS max_current,
  MIN(electric_current) AS min_current,
  AVG(electric_current) AS avg_current,
  AVG(max_temperature) AS battery_avg_max_temperature,
  COLLECT_LIST(max_temperature)[CAST(COUNT(*)/2 AS INT)] AS battery_mid_max_temperature,
  AVG(min_temperature) AS battery_avg_min_temperature,
  COLLECT_LIST(min_temperature)[CAST(COUNT(*)/2 AS INT)] AS battery_mid_min_temperature,
  AVG(max_voltage) AS battery_avg_max_voltage,
  COLLECT_LIST(max_voltage)[CAST(COUNT(*)/2 AS INT)] AS battery_mid_max_voltage,
  AVG(min_voltage) AS battery_avg_min_voltage,
  COLLECT_LIST(min_voltage)[CAST(COUNT(*)/2 AS INT)] AS battery_mid_min_voltage,
  dt
FROM (
  SELECT
    vin,
    voltage,
    electric_current,
    soc,
    max_temperature,
    max_voltage,
    min_temperature,
    min_voltage,
    \`timestamp\`,
    dt,
    SUM(mark) OVER (PARTITION BY vin ORDER BY \`timestamp\`) AS singer_trip
  FROM (
    SELECT
      vin,
      voltage,
      electric_current,
      soc,
      max_temperature,
      max_voltage,
      min_temperature,
      min_voltage,
      \`timestamp\`,
      dt,
      IF((LAG(\`timestamp\`, 1, 0) OVER (PARTITION BY vin ORDER BY \`timestamp\`) - \`timestamp\`) < -60000, 1, 0) AS mark
    FROM ${APP}.dwd_car_parking_charging_inc
    WHERE dt <= '${do_date}'
  ) t1
) t2
GROUP BY dt, vin, singer_trip;
"

case $1 in
修正后的脚本如下所示：

```bash
#!/bin/bash

APP='car_data'

if [ -n "$2" ]; then
  do_date=$2
else
  do_date=$(date -d '-1 day' +%F)
fi

dws_electricity_single_trip_detail="
insert overwrite table ${APP}.dws_electricity_single_trip_detail partition (dt)
select
  concat(vin,'-',min(\`timestamp\`)) id,
  vin,
  min(\`timestamp\`) start_timestamp,
  max(\`timestamp\`) end_timestamp,
  min(mileage) start_mileage,
  max(mileage) end_mileage,
  max(soc) start_soc,
  min(soc) end_soc,
  avg(velocity) avg_speed,
  avg(voltage) car_avg_voltage,
  avg(electric_current) car_avg_electric_current,
  avg(max_temperature) battery_avg_max_temperature,
  collect_list(max_temperature)[cast(count(*)/2 as int)]  battery_mid_max_temperature,
  avg(min_temperature) battery_avg_min_temperature,
  collect_list(min_temperature)[cast(count(*)/2 as int)] battery_mid_min_temperature,
  avg(max_voltage) battery_avg_max_voltage,
  collect_list(max_voltage)[cast(count(*)/2 as int)] battery_mid_max_voltage,
  avg(min_voltage) battery_avg_min_voltage,
  collect_list(min_voltage)[cast(count(*)/2 as int)] battery_mid_min_voltage,
  dt
from (
  select
    vin,
    velocity,
    mileage,
    voltage,
    electric_current,
    soc,
    max_temperature,
    max_voltage,
    min_temperature,
    min_voltage,
    \`timestamp\`,
    dt,
    sum(mark)over (partition by vin order by \`timestamp\`) singer_trip
  from (
    select
      vin,
      velocity,
      mileage,
      voltage,
      electric_current,
      soc,
      max_temperature,
      max_voltage,
      min_temperature,
      min_voltage,
      \`timestamp\`,
      dt,
      if((lag(\`timestamp\`,1,0)over (partition by vin order by \`timestamp\` ) - \`timestamp\`) < -60000,1,0) mark
    from ${APP}.dwd_car_running_electricity_inc
    where dt<='${do_date}'
  )t1
)t2
group by dt,vin,singer_trip;
"

dws_single_charge_detail_inc="insert overwrite table ${APP}.dws_single_charge_detail_inc partition (dt)
select
  concat(vin,'-',min(\`timestamp\`)) id,
  vin,
  min(\`timestamp\`) start_timestamp,
  max(\`timestamp\`) end_timestamp,
  max(soc) start_soc,
  min(soc) end_soc,
  max(voltage) max_total_voltage,
  min(voltage) min_total_voltage,
  avg(voltage) avg_total_voltage,
  max(electric_current) max_current,
  min(electric_current) min_current,
  avg(electric_current) avg_current,
  avg(max_temperature) battery_avg_max_temperature,
  collect_list(max_temperature)[cast(count(*)/2 as int)]  battery_mid_max_temperature,
  avg(min_temperature) battery_avg_min_temperature,
  collect_list(min_temperature)[cast(count(*)/2 as int)] battery_mid_min_temperature,
  avg(max_voltage) battery_avg_max_voltage,
  collect_list(max_voltage)[cast(count(*)/2 as int)] battery_mid_max_voltage,
  avg(min_voltage) battery_avg_min_voltage,
  collect_list(min_voltage)[cast(count(*)/2 as int)] battery_mid_min_voltage,
  dt
from (
  select
    vin,
    voltage,
    electric_current,
    soc,
    max_temperature,
    max_voltage,
    min_temperature,
    min_voltage,
    \`timestamp\`,
    dt,
    sum(mark)over (partition by vin order by \`timestamp\`) singer_trip
  from (
    select
      vin,
      voltage,
      electric_current,
      soc,
      max_temperature,
      max_voltage,
      min_temperature,
      min_voltage,
      \`timestamp\`,
      dt,
      if((lag(\`timestamp\`,1,0)over (partition by vin order by \`timestamp\` ) - \`timestamp\`) < -60000,1,0) mark
    from ${APP}.dwd_car_parking_charging_inc
    where dt<='${do_date}'
  )t1
)t2
group by dt,vin,singer_trip;
"

case $1 in
'dws_electricity_single_trip_detail')
  hive -e "$dws_electricity_single_trip_detail"
  ;;
'dws_single_charge_detail_inc')
  hive -e "$dws_single_charge_detail_inc"
  ;;
"all")
  hive -e "$dws_electricity_single_trip_detail$dws_single_charge_detail_inc"
  ;;
esac
```

```bash
 chmod +x dwd_to_dws_single_init.sh
 
 dwd_to_dws_single_init.sh all 2023-05-02
```

#### 每日装载

```bash
vim dwd_to_dws_single.sh
```

编写内容：

```shell
#!/bin/bash

APP='car_data'

if [ -n "$2" ]; then
  do_date=$2
else
  do_date=$(date -d '-1 day' +%F)
fi

dws_electricity_single_trip_detail="
insert overwrite table ${APP}.dws_electricity_single_trip_detail partition (dt='${do_date}')
select
  concat(vin,'-',min(\`timestamp\`)) id,
  vin,
  min(\`timestamp\`) start_timestamp,
  max(\`timestamp\`) end_timestamp,
  min(mileage) start_mileage,
  max(mileage) end_mileage,
  max(soc) start_soc,
  min(soc) end_soc,
  avg(velocity) avg_speed,
  avg(voltage) car_avg_voltage,
  avg(electric_current) car_avg_electric_current,
  avg(max_temperature) battery_avg_max_temperature,
  percentile(max_temperature, 0.5) battery_mid_max_temperature,
  avg(min_temperature) battery_avg_min_temperature,
  percentile(min_temperature, 0.5) battery_mid_min_temperature,
  avg(max_voltage) battery_avg_max_voltage,
  percentile(max_voltage, 0.5) battery_mid_max_voltage,
  avg(min_voltage) battery_avg_min_voltage,
  percentile(min_voltage, 0.5) battery_mid_min_voltage
from ${APP}.dwd_car_running_electricity_inc
where dt='${do_date}'
group by vin, singer_trip;
"

dws_single_charge_detail_inc="
insert overwrite table ${APP}.dws_single_charge_detail_inc partition (dt='${do_date}')
select
  concat(vin,'-',min(\`timestamp\`)) id,
  vin,
  min(\`timestamp\`) start_timestamp,
  max(\`timestamp\`) end_timestamp,
  max(soc) start_soc,
  min(soc) end_soc,
  max(voltage) max_total_voltage,
  min(voltage) min_total_voltage,
  avg(voltage) avg_total_voltage,
  max(electric_current) max_current,
  min(electric_current) min_current,
  avg(electric_current) avg_current,
  avg(max_temperature) battery_avg_max_temperature,
  percentile(max_temperature, 0.5) battery_mid_max_temperature,
  avg(min_temperature) battery_avg_min_temperature,
  percentile(min_temperature, 0.5) battery_mid_min_temperature,
  avg(max_voltage) battery_avg_max_voltage,
  percentile(max_voltage, 0.5) battery_mid_max_voltage,
  avg(min_voltage) battery_avg_min_voltage,
  percentile(min_voltage, 0.5) battery_mid_min_voltage
from ${APP}.dwd_car_parking_charging_inc
where dt='${do_date}'
group by vin, singer_trip;
"

case $1 in
'dws_electricity_single_trip_detail')
  hive -e "$dws_electricity_single_trip_detail"
  ;;
'dws_single_charge_detail_inc')
  hive -e "$dws_single_charge_detail_inc"
  ;;
"all")
  hive -e "$dws_electricity_single_trip_detail$dws_single_charge_detail_inc"
  ;;
esac
```

```bash
chmod +x dwd_to_dws_single.sh
```

## 2 最近 1 日汇总表

### 2.1 汽车行程单日累计表

#### 2.1.1 建表

```sql
DROP TABLE IF EXISTS dws_car_mileage_1d;

CREATE TABLE dws_car_mileage_1d (
  vin STRING COMMENT '汽车唯一ID',
  total_mileage INT COMMENT '一日累计里程',
  total_speed INT COMMENT '平均时速分子',
  running_count INT COMMENT '平均时速分母',
  danger_count INT COMMENT '单日急加减速次数'
)
COMMENT '汽车行程单日累计表'
PARTITIONED BY (`dt` STRING COMMENT '统计日期')
STORED AS ORC
LOCATION '/warehouse/car_data/dws/dws_car_mileage_1d'
TBLPROPERTIES ('orc.compress' = 'snappy');
```

#### 2.1.2 数据装载

##### ① 首日装载

将`dwd_car_running_electricity_inc`表中截止到指定日期（'2023-05-02'）的汽车行驶数据按照日期和VIN码进行汇总统计，并将结果插入到`dws_car_mileage_1d`表中的对应分区中。

```sql
INSERT OVERWRITE TABLE dws_car_mileage_1d PARTITION (dt)
SELECT
  vin, -- 车辆VIN码
  MAX(mileage) - MIN(mileage) AS total_mileage, -- 总里程
  SUM(velocity) AS total_speed, -- 总速度
  SUM(IF(velocity > 0, 1, 0)) AS running_count, -- 行驶次数
  SUM(IF(dif_vel > 500 OR dif_vel < -500, 1, 0)) AS danger_count, -- 危险操作次数
  dt -- 日期分区字段
FROM (
  SELECT
    vin, -- 车辆VIN码
    mileage, -- 里程
    velocity, -- 速度
    `timestamp`, -- 时间戳
    velocity - LAG(velocity, 1, velocity) OVER (PARTITION BY dt, vin ORDER BY `timestamp`) AS dif_vel, -- 速度变化
    dt -- 日期分区字段
  FROM dwd_car_running_electricity_inc
  WHERE dt <= '2023-05-02' -- 日期筛选条件
) t1
GROUP BY dt, vin; -- 按日期和VIN码分组计算统计指标
```

##### ② 每日装载

选择`dwd_car_running_electricity_inc`表中`dt`字段等于'2023-05-03'的数据，并根据每个VIN码对里程、速度和其他指标进行汇总。然后，将这些汇总结果插入到`dws_car_mileage_1d`表的`dt='2023-05-03'`分区中的对应VIN码行。

```sql
INSERT OVERWRITE TABLE dws_car_mileage_1d PARTITION (dt='2023-05-03')
SELECT
  vin,
  MAX(mileage) - MIN(mileage) AS total_mileage,
  SUM(velocity) AS total_speed,
  SUM(IF(velocity > 0, 1, 0)) AS running_count,
  SUM(IF(dif_vel > 500 OR dif_vel < -500, 1, 0)) AS danger_count
FROM (
  SELECT 
    vin,
    mileage,
    velocity,
    `timestamp`,
    velocity - LAG(velocity, 1, velocity) OVER (PARTITION BY dt, vin ORDER BY `timestamp`) AS dif_vel,
    dt
  FROM dwd_car_running_electricity_inc
  WHERE dt = '2023-05-03'
) t1
GROUP BY vin;
```

### 2.2 汽车告警单日累计表

#### 2.2.1 建表

```sql
DROP TABLE IF EXISTS dws_car_alarm_1d;

CREATE TABLE dws_car_alarm_1d (
  vin STRING COMMENT '汽车唯一ID',
  alarm_count INT COMMENT '告警次数',
  l1_alarm_count INT COMMENT '一级告警次数',
  l2_alarm_count INT COMMENT '二级告警次数',
  l3_alarm_count INT COMMENT '三级告警次数'
)
COMMENT '汽车告警单日累计表'
PARTITIONED BY (`dt` STRING COMMENT '统计日期')
STORED AS ORC
LOCATION '/warehouse/car_data/dws/dws_car_alarm_1d'
TBLPROPERTIES ('orc.compress' = 'snappy');
```

#### 2.2.2 数据装载

##### ① 首日装载

从`dwd_car_alarm_inc`表中选择截止到指定日期（'2023-05-02'）的汽车告警数据，并根据VIN码和日期（dt）进行分组。然后，它计算每个VIN码和日期的告警次数、一级告警次数、二级告警次数和三级告警次数，并将结果插入到`dws_car_alarm_1d`表的相应分区中。

```sql
INSERT INTO dws_car_alarm_1d PARTITION (dt)
SELECT
    vin, -- 汽车唯一ID
    COUNT(*) AS alarm_count, -- 告警次数
    SUM(IF(alarm_level = 1, 1, 0)) AS l1_alarm_count, -- 一级告警次数
    SUM(IF(alarm_level = 2, 1, 0)) AS l2_alarm_count, -- 二级告警次数
    SUM(IF(alarm_level = 3, 1, 0)) AS l3_alarm_count, -- 三级告警次数
    dt -- 统计日期
FROM dwd_car_alarm_inc
WHERE dt <= '2023-05-02' -- 日期筛选条件
GROUP BY vin, dt; -- 按VIN码和日期分组
```

##### ② 每日装载

从`dwd_car_alarm_inc`表中选择日期为'2023-05-03'的汽车告警数据，并根据VIN码进行分组。然后，它计算每个VIN码的告警次数、一级告警次数、二级告警次数和三级告警次数，并将结果插入到`dws_car_alarm_1d`表的指定分区`dt='2023-05-03'`中

```sql
INSERT INTO dws_car_alarm_1d PARTITION (dt = '2023-05-03')
SELECT
    vin, -- 汽车唯一ID
    COUNT(*) AS alarm_count, -- 告警次数
    SUM(IF(alarm_level = 1, 1, 0)) AS l1_alarm_count, -- 一级告警次数
    SUM(IF(alarm_level = 2, 1, 0)) AS l2_alarm_count, -- 二级告警次数
    SUM(IF(alarm_level = 3, 1, 0)) AS l3_alarm_count -- 三级告警次数
FROM dwd_car_alarm_inc
WHERE dt = '2023-05-03' -- 日期筛选条件
GROUP BY vin; -- 按VIN码分组
```

### 2.3 汽车电机信息汇总

#### 2.3.1 建表

```sql
DROP TABLE IF EXISTS dws_car_motor_1d;

CREATE TABLE dws_car_motor_1d (
  vin STRING COMMENT '汽车唯一ID',
  max_motor_temperature INT COMMENT '电机最高温度',
  avg_motor_temperature DECIMAL(16, 2) COMMENT '电机平均温度',
  max_motor_controller_temperature INT COMMENT '电机控制器最高温度',
  avg_motor_controller_temperature DECIMAL(16, 2) COMMENT '电机控制器平均温度'
)
COMMENT '汽车电机单日累计表'
PARTITIONED BY (`dt` STRING COMMENT '统计日期')
STORED AS ORC
LOCATION '/warehouse/car_data/dws/dws_car_motor_1d'
TBLPROPERTIES ('orc.compress' = 'snappy');
```

##### 2.3.2 数据装载

##### ① 首日装载

从`dwd_car_motor_inc`表中选择截止到指定日期（'2023-05-02'）的汽车电机数据，并根据VIN码和日期（dt）进行分组。然后，它计算每个VIN码和日期的xxx，并将结果覆盖写入到`dws_car_motor_1d`表的相应分区中。

```sql
INSERT OVERWRITE TABLE dws_car_motor_1d PARTITION (dt)
SELECT
    vin,
    MAX(temperature) AS max_motor_temperature,
    AVG(temperature) AS avg_motor_temperature,
    MAX(controller_temperature) AS max_motor_controller_temperature,
    AVG(controller_temperature) AS avg_motor_controller_temperature,
    dt
FROM dwd_car_motor_inc
WHERE dt <= '2023-05-02'
GROUP BY dt, vin;
```

##### ② 每日装载

```sql
INSERT OVERWRITE TABLE dws_car_motor_1d PARTITION (dt='2023-05-03')
SELECT
    vin,
    MAX(temperature) AS max_motor_temperature,
    AVG(temperature) AS avg_motor_temperature,
    MAX(controller_temperature) AS max_motor_controller_temperature,
    AVG(controller_temperature) AS avg_motor_controller_temperature
FROM dwd_car_motor_inc
WHERE dt='2023-05-03'
GROUP BY vin;
```

### 2.4 汽车电池组信息汇总

#### 2.4.1 建表

```sql
DROP TABLE IF EXISTS dws_car_battery_1d;

CREATE TABLE dws_car_battery_1d (
  vin STRING COMMENT '汽车唯一ID',
  max_battery_temperature INT COMMENT '最高电池温度',
  battery_temperature_abnormal_count INT COMMENT '电池温度异常值次数',
  avg_voltage_charge DECIMAL(16, 2) COMMENT '充电平均电压',
  avg_voltage_discharge DECIMAL(16, 2) COMMENT '放电平均电压',
  soc_consumed INT COMMENT '每日累计soc消耗'
)
COMMENT '汽车电池单日累计表'
PARTITIONED BY (`dt` STRING COMMENT '统计日期')
STORED AS ORC
LOCATION '/warehouse/car_data/dws/dws_car_battery_1d'
TBLPROPERTIES ('orc.compress' = 'snappy');
```

#### 2.4.2 数据装载

##### ① 首日装载

```sql
WITH t1 AS (
  SELECT
    vin,
    MAX(max_temperature) AS max_battery_temperature,
    SUM(IF(max_temperature > 600, 1, 0)) AS battery_temperature_abnormal_count,
    AVG(voltage) AS avg_voltage_discharge,
    dt
  FROM dwd_car_running_electricity_inc
  WHERE dt <= '2023-05-02'
  GROUP BY vin, dt
),
t2 AS (
  SELECT
    vin,
    MAX(max_temperature) AS max_battery_temperature,
    SUM(IF(max_temperature > 600, 1, 0)) AS battery_temperature_abnormal_count,
    AVG(voltage) AS avg_voltage_charge,
    dt
  FROM dwd_car_parking_charging_inc
  WHERE dt <= '2023-05-02'
  GROUP BY vin, dt
),
t3 AS (
  SELECT
    vin,
    SUM(start_soc - end_soc) AS soc_consumed,
    dt
  FROM dws_electricity_single_trip_detail
  WHERE dt <= '2023-05-02'
  GROUP BY vin, dt
)
INSERT OVERWRITE TABLE dws_car_battery_1d PARTITION (dt)
SELECT
  COALESCE(t1.vin, t2.vin),
  GREATEST(NVL(t1.max_battery_temperature, 0), NVL(t2.max_battery_temperature, 0)) AS max_battery_temperature,
  NVL(t1.battery_temperature_abnormal_count, 0) + NVL(t2.battery_temperature_abnormal_count, 0) AS battery_temperature_abnormal_count,
  NVL(avg_voltage_charge, 0) AS avg_voltage_charge,
  NVL(avg_voltage_discharge, 0) AS avg_voltage_discharge,
  NVL(soc_consumed, 0) AS soc_consumed,
  NVL(t1.dt, t2.dt)
FROM t1
FULL OUTER JOIN t2 ON t1.vin = t2.vin AND t1.dt = t2.dt
LEFT JOIN t3 ON t1.vin = t3.vin AND t1.dt = t3.dt;
```

##### ② 每日装载

汽车会存在只充电或者只放电的情况，为了避免数据join之后丢失，需要使用full join  hive 的full join？

```sql
INSERT OVERWRITE TABLE dws_car_battery_1d PARTITION (dt='2023-05-03')
WITH t1 AS (
  SELECT
    vin,
    MAX(max_temperature) AS max_battery_temperature,
    SUM(IF(max_temperature > 600, 1, 0)) AS battery_temperature_abnormal_count,
    AVG(voltage) AS avg_voltage_discharge,
    dt
  FROM dwd_car_running_electricity_inc
  WHERE dt = '2023-05-03'
  GROUP BY vin, dt
),
t2 AS (
  SELECT
    vin,
    MAX(max_temperature) AS max_battery_temperature,
    SUM(IF(max_temperature > 600, 1, 0)) AS battery_temperature_abnormal_count,
    AVG(voltage) AS avg_voltage_charge,
    dt
  FROM dwd_car_parking_charging_inc
  WHERE dt = '2023-05-03'
  GROUP BY vin, dt
),
t3 AS (
  SELECT
    vin,
    SUM(start_soc - end_soc) AS soc_consumed,
    dt
  FROM dws_electricity_single_trip_detail
  WHERE dt = '2023-05-03'
  GROUP BY vin, dt
)
SELECT
  COALESCE(t1.vin, t2.vin) AS vin,
  GREATEST(NVL(t1.max_battery_temperature, 0), NVL(t2.max_battery_temperature, 0)) AS max_battery_temperature,
  NVL(t1.battery_temperature_abnormal_count, 0) + NVL(t2.battery_temperature_abnormal_count, 0) AS battery_temperature_abnormal_count,
  NVL(avg_voltage_charge, 0) AS avg_voltage_charge,
  NVL(avg_voltage_discharge, 0) AS avg_voltage_discharge,
  NVL(soc_consumed, 0) AS soc_consumed
FROM t1
FULL OUTER JOIN t2 ON t1.vin = t2.vin AND t1.dt = t2.dt
LEFT JOIN t3 ON t1.vin = t3.vin AND t1.dt = t3.dt;
```

使用`FULL OUTER JOIN`合并t1和t2两个子查询的结果。这两个子查询代表两类不同数据：

- t1：从`dwd_car_running_electricity_inc`提取汽车行驶时的电池最大温度、电池温度异常次数和放电时的平均电压
- t2：从`dwd_car_parking_charging_inc`提取汽车充电时的电池最大温度、电池温度异常次数和充电时的平均电压

使用`FULL OUTER JOIN`，因其允许我们合并来自两个不同数据集的相关数据，其中一个数据集可能包含另一个数据集所没有的`vin`（车架号）。如果某个`vin`在t1中有记录而t2中没有，或者在t2有而t1中没有，这种连接将确保所有信息被捕获。`LEFT JOIN`的使用则是为了将这种组合数据再与t3的结果合并，即消耗的社会充电量。

每个子查询 （t1，t2，和t3） 都用`GROUP BY`基于`vin`和`dt`进行分组。`FULL OUTER JOIN`在t1与t2之间使用`ON t1.vin = t2.vin AND t1.dt = t2.dt`作为条件，保证了当`vin`和`dt`匹配时，相关数据可以组合在一起。

t3子查询计算的是单次行驶的总社会充电消耗量（`soc_consumed`），此查询结果通过`LEFT JOIN`和前面的`FULL OUTER JOIN`的结果组合在一起，确保了不论t1还是t2中是否有相应的vin记录，t3中的数据都会被合并进来。

在SELECT子句中，使用了以下函数进行取值：

- `COALESCE`: 用于从t1和t2中选择非空的`vin`值。
- `GREATEST`: 用于选择两个电池最大温度值中更大的一个。
- `NVL`: 用于处理NULL值。如果指定的第一个值是NULL，则返回第二个值（在此查询中通常是0）。

这样，产生的结果将包含每个`vin`的最大电池温度、电池温度的异常计数、充电和放电时平均电压以及消耗的SOC。这就是为什么需要使用`FULL OUTER JOIN`，因为这能够确保包含所有可能的情况，不丢失任何数据，不管数据存在于哪个数据源中。

### 2.5 装载脚本

#### 首日装载

```bash
vim dwd_to_dws_1d_init.sh
```

编写内容

```shell
#!/bin/bash

APP='car_data'

if [ -n "$2" ]; then
  do_date=$2
else
  do_date=$(date -d '-1 day' +%F)
fi

dws_car_mileage_1d="
INSERT INTO ${APP}.dws_car_mileage_1d PARTITION (dt='${do_date}')
SELECT
  vin,
  MAX(mileage) - MIN(mileage),
  SUM(velocity),
  COUNT(IF(velocity > 0, 1, NULL)),
  SUM(IF(dif_vel > 500 OR dif_vel < -500, 1, 0)) danger_count
FROM (
  SELECT
    vin,
    mileage,
    velocity,
    velocity - LAG(velocity, 1, velocity) OVER (PARTITION BY dt, vin ORDER BY timestamp) dif_vel,
    dt
  FROM ${APP}.dwd_car_running_electricity_inc
  WHERE dt <= '${do_date}'
) t1
GROUP BY vin;
"

dws_car_alarm_1d="
INSERT INTO ${APP}.dws_car_alarm_1d PARTITION (dt='${do_date}')
SELECT
  vin,
  COUNT(*),
  SUM(IF(alarm_level = 1, 1, 0)),
  SUM(IF(alarm_level = 2, 1, 0)),
  SUM(IF(alarm_level = 3, 1, 0))
FROM ${APP}.dwd_car_alarm_inc
WHERE dt <= '${do_date}'
GROUP BY vin;
"

dws_car_motor_1d="
INSERT OVERWRITE TABLE ${APP}.dws_car_motor_1d PARTITION (dt='${do_date}')
SELECT
  vin,
  MAX(temperature) max_motor_temperature,
  AVG(temperature) avg_motor_temperature,
  MAX(controller_temperature) max_motor_controller_temperature,
  AVG(controller_temperature) avg_motor_controller_temperature
FROM ${APP}.dwd_car_motor_inc
WHERE dt <= '${do_date}'
GROUP BY vin;
"

dws_car_battery_1d="
WITH t1 AS (
  SELECT
    vin,
    MAX(max_temperature) max_battery_temperature,
    SUM(IF(max_temperature > 600, 1, 0)) battery_temperature_abnormal_count,
    AVG(voltage) avg_voltage_discharge,
    dt
  FROM ${APP}.dwd_car_running_electricity_inc
  WHERE dt <= '${do_date}'
  GROUP BY vin, dt
), t2 AS (
  SELECT
    vin,
    MAX(max_temperature) max_battery_temperature,
    SUM(IF(max_temperature > 600, 1, 0)) battery_temperature_abnormal_count,
    AVG(voltage) avg_voltage_charge,
    dt
  FROM ${APP}.dwd_car_parking_charging_inc
  WHERE dt <= '${do_date}'
  GROUP BY vin, dt
), t3 AS (
  SELECT
    vin,
    SUM(start_soc - end_soc) soc_consumed,
    dt
  FROM ${APP}.dws_electricity_single_trip_detail
  WHERE dt <= '${do_date}'
  GROUP BY vin, dt
)
INSERT OVERWRITE TABLE ${APP}.dws_car_battery_1d PARTITION (dt='${do_date}')
SELECT
  NVL(t1.vin, t2.vin),
  IF(NVL(t1.max_battery_temperature, 0) > NVL(t2.max_battery_temperature, 0), NVL(t1.max_battery_temperature, 0), NVL(t2.max_battery_temperature, 0)) max_battery_temperature,
  NVL(t1.battery_temperature_abnormal_count, 0) + NVL(t2.battery_temperature_abnormal_count, 0) battery_temperature_abnormal_count,
  NVL(avg_voltage_charge, 0) avg_voltage_charge,
  NVL(avg_voltage_discharge, 0) avg_voltage_discharge,
  NVL(soc_consumed, 0) soc_consumed
FROM t1
FULL OUTER JOIN t2 ON t1.vin = t2.vin AND t1.dt = t2.dt
LEFT JOIN t3 ON t1.vin = t3.vin AND t1.dt = t3.dt;
"

case $1 in
  'dws_car_mileage_1d')
    hive -e "$dws_car_mileage_1d"
    ;;
  'dws_car_alarm_1d')
    hive -e "$dws_car_alarm_1d"
    ;;
  'dws_car_motor_1d')
    hive -e "$dws_car_motor_1d"
    ;;
  'dws_car_battery_1d')
    hive -e "$dws_car_battery_1d"
    ;;
  "all")
    hive -e "$dws_car_mileage_1d$dws_car_alarm_1d$dws_car_motor_1d$dws_car_battery_1d"
    ;;
  *)
    echo "Invalid argument. Usage: ./script.sh [dws_car_mileage_1d|dws_car_alarm_1d|dws_car_motor_1d|dws_car_battery_1d|all] [date]"
    exit 1
    ;;
esac
```

```bash
 chmod +x dwd_to_dws_1d.sh
```