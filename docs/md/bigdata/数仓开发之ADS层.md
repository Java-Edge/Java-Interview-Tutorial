# 数仓开发之ADS层

## 0 前言

ADS（Application Data Store）层通常是数据仓库架构中的应用层，也经常被称为展现层或者报表层。它为最终用户查询和报表分析提供了优化的、经常被查询的数据视图。ADS层中的数据是清洗、转换和聚合后的结果数据，它反映的是业务过程的最终状态，方便用户直接进行决策支持的数据分析。

在实际应用中，ADS层通常不需要压缩存储的原因主要包括：

1. **查询性能**：ADS层的数据需要经常被访问，压缩存储可能会影响数据查询的性能。在进行数据分析和生成报表时，需要快速访问数据，压缩数据需要在查询时解压，这会增加额外的CPU负担，导致响应时间变长。
2. **数据量**：与DWD（Data Warehouse Detail）或DWS（Data Warehouse Summary）层级相比，ADS层通常包含业务需求所需的汇总或细节数据，数据量相对较小，因此压缩带来的存储空间节约效果并不明显。基本也不太需要分区表了
3. **用户体验**：ADS层的数据需要直接呈现给最终用户，用户期望快速的查询和响应。如果数据被压缩，可能会因为解压过程中的延迟而影响用户体验。
4. **存储成本逐渐降低**：随着存储成本的不断下降，数据压缩为了节省存储空间的需求逐渐减少，对于查询性能的优先级更高。
5. **运维简化**：未压缩的数据简化了数据的管理和运维工作，如备份、恢复和传输等操作都更加简单高效。
6. **数据的即席查询需求**：ADS层面对数据的操作可能是动态和即席的，为了不阻碍数据探索的灵活性，通常会避免数据压缩。
7. 用户体验感好，数分都喜欢用MySQL 这种流行的标准 SQL 语句了，并不想学习 Hive SQL，那就需要同步到 MySQL，免去压缩就能方便同步。

虽然压缩存储对于节省成本和优化DWD或DWS层级的较大数据集来说是有益的，但对于ADS层，通常会根据实际需求和场景来权衡是否进行压缩。在设计数据仓库时，合理规划各层的存储和查询效率是关键。对于ADS层，保证快速的查询响应时间和良好的用户体验是优先考虑的因素。

但 MySQL 有主键唯一非空要求，但 Hive 很自由，这就有同步问题，所以需要 vin+mon 成为主键同步给 MySQL。

## 1 行程主题

### 1.1 行程相关统计

#### 当月汇总建表

使用overwrite避免数据重复

- hive处理完数据后，赶快同步到MySQL中。因为下一次hive处理数据，会覆盖写到当前表格
- hive处理数据每次覆盖写入，同时合并之前的数据，保证原始数据和导入数据的精度一致

```sql
drop table if exists ads_mileage_stat_last_month;
create external table ads_mileage_stat_last_month
(
    vin          string comment '汽车唯一ID',
    mon          string comment '统计月份',
    avg_mileage  int comment '日均里程',
    avg_speed    decimal(16, 2) comment '平均时速',
    danger_count decimal(16, 2) comment '平均百公里急加减速次数'
) comment '里程相关统计'
row format delimited fields terminated by '\t'
location '/warehouse/car_data/ads/ads_mileage_stat_last_month';
```

#### 当月汇总数据装载

```sql
insert overwrite table ads_mileage_stat_last_month
select *
from ads_mileage_stat_last_month
union
select
    vin,
    '2023-05',
    cast(avg(total_mileage) as int) avg_mileage,
    cast(sum(total_speed)/sum(running_count) as decimal(16,2)) avg_speed,
    cast(nvl(sum(danger_count) / sum(total_mileage) * 1000 ,0) as decimal(16,2))
from dws_car_mileage_1d
where substr(dt,0,7)='2023-05'
group by vin;
```

1. **数据覆盖与累加**：通过`INSERT OVERWRITE`结合`UNION`操作，语句实现了数据的重写和更新。它首先把`ads_mileage_stat_last_month`表中本月之前的所有数据插回表中，然后添加本月的统计数据，这样就能确保表中包含最全面的数据。
2. **NULL值处理**：使用`nvl`函数来处理可能出现的空值（NULL）。在计算危险指数时，如果总里程数为0（即没有危险计数），则使用`nvl`函数将比率设为0，这样就避免了除以零的错误。
3. **条件筛选**：通过`WHERE`子句筛选特定月份（`'2023-05'`）的数据，这为对数据仓库中的时间序列数据进行分层处理提供了灵活性。
4. **分组聚合**：通过`GROUP BY`子句对不同的`vin`（车辆识别号码）进行分组，并分别计算相关指标。这样每个`vin`都有其对应的平均里程、平均速度等统计值。
5. **效率考虑**：`SELECT * FROM ads_mileage_stat_last_month UNION SELECT...`确保不用重复计算先前月份的统计；只为新的月份重新计算和添加数据，提高了效率。
6. **数据清洗与准备**：在`avg_speed`的计算中，使用`sum(total_speed)/sum(running_count)`来计算平均速度，同时处理了可能的空值和异常值，为数据分析提供干净、准确的数据源。

整体上，这个设计考虑到了数据更新的效



有时候也会使用最近7天的数据进行合并统计

#### 最近7日汇总建表语句

```sql
drop table if exists ads_mileage_stat_last_7d;
create external table ads_mileage_stat_last_7d
(
    vin          string comment '汽车唯一ID',
    dt          string comment '统计日期',
    avg_mileage  int comment '日均里程',
    avg_speed    decimal(16, 2) comment '平均时速分子',
    danger_count decimal(16, 2) comment '平均百公里急加减速次数'
) comment '里程相关统计'
    row format delimited fields terminated by '\t'
    location '/warehouse/car_data/ads/ads_mileage_stat_last_7d';
```

4) 最近7日汇总数据装载

```sql
insert overwrite table ads_mileage_stat_last_7d
select *
from  ads_mileage_stat_last_7d
union
select vin,
       '2023-05-02',
        cast(avg(total_mileage) as int) avg_mileage,
    	cast(sum(total_speed)/sum(running_count) as decimal(16,2)) avg_speed,
    	cast(nvl(sum(danger_count) / sum(total_mileage) * 1000 ,0) as decimal(16,2))
from dws_car_mileage_1d
where dt<='2023-05-02' and dt > date_sub('2023-05-02',7)
group by vin;
```

### 1.2 车型里程相关统计

#### 建表

```sql
drop table if exists ads_car_type_mileage_stat_last_month;
create external table ads_car_type_mileage_stat_last_month
(
    car_type    string comment '车型',
    mon          string comment '统计月份',
    avg_mileage  int comment '日均里程',
    avg_speed    decimal(16, 2) comment '平均时速分子',
    danger_count decimal(16, 2) comment '平均百公里急加减速次数'
) comment '车型里程相关统计'
    row format delimited fields terminated by '\t'
    location '/warehouse/car_data/ads/ads_car_type_mileage_stat_last_month';
```

#### 数据装载

```sql
insert overwrite table ads_car_type_mileage_stat_last_month
select *
from  ads_car_type_mileage_stat_last_month
union
select type,
       '2023-05',
       cast(avg(total_mileage) as int) avg_mileage,
       cast(sum(total_speed)/sum(running_count) as decimal(16,2)) avg_speed,
       cast( sum(danger_count)/sum(total_mileage) * 1000 as decimal(16,2)) danger_count
from dws_car_mileage_1d s
         join (
             select 
                id,
                type
             from dim_car_info_full
             where dt='2023-05-02'
        )car_info
        on s.vin=car_info.id
where substr(s.dt, 1, 7) = '2023-05' 
group by type;
```

## 2 告警主题

### 2.1 告警情况单月统计

#### 建表

```sql
drop table if exists ads_alarm_stat_last_month;
create external table ads_alarm_stat_last_month
(
    vin            string comment '汽车唯一ID',
    mon          string comment '统计月份',
    alarm_count    int comment '告警次数',
    l1_alarm_count int comment '一级告警次数',
    l2_alarm_count int comment '二级告警次数',
    l3_alarm_count int comment '三级告警次数'
) comment '告警相关统计'
    row format delimited fields terminated by '\t'
    location '/warehouse/car_data/ads/ads_alarm_stat_last_month';
```

2) 数据装载

```sql
insert overwrite table ads_alarm_stat_last_month
select *
from ads_alarm_stat_last_month
union
select vin,
       '2023-05',
       sum(alarm_count),
       sum(l1_alarm_count),
       sum(l2_alarm_count),
       sum(l3_alarm_count)
from dws_car_alarm_1d
where substr(dt, 0, 7) = '2023-05'
group by vin;
```

## 3 温控主题

### 3.1 温控情况单月统计

#### 建表

```sql
drop table if exists ads_temperature_stat_last_month;
create external table ads_temperature_stat_last_month
(
    vin                                string comment '汽车唯一ID',
    mon          string comment '统计月份',
    max_motor_temperature              int comment '电机最高温度',
    avg_motor_temperature              decimal(16, 2) comment '电机平均温度',
    max_motor_controller_temperature   int comment '电机控制器最高温度',
    avg_motor_controller_temperature   decimal(16, 2) comment '电机控制器平均温度',
    max_battery_temperature            int comment '最高电池温度',
    battery_temperature_abnormal_count int comment '电池温度异常值次数'
) comment '温控相关统计'
    row format delimited fields terminated by '\t'
    location '/warehouse/car_data/ads/ads_temperature_stat_last_month';
```

#### 数据装载

```sql
insert overwrite table ads_temperature_stat_last_month
select *
from ads_temperature_stat_last_month
union
select
    motor.vin,
    '2023-05' mon,
    max_motor_temperature,
    cast(avg_motor_temperature as decimal(16,2)) avg_motor_temperature,
    max_motor_controller_temperature,
    cast(avg_motor_controller_temperature as decimal(16,2)) avg_motor_controller_temperature,    	battery_temperature_abnormal_count
from (
     select
        vin,
        max(max_motor_temperature) max_motor_temperature,
        avg(avg_motor_temperature) avg_motor_temperature,
        max(max_motor_controller_temperature) max_motor_controller_temperature,
        avg(avg_motor_controller_temperature) avg_motor_controller_temperature
    from dws_car_motor_1d
    where substr(dt, 0, 7) = '2023-05'
    group by vin
)motor
join
    (
    select
        vin,
        max(max_battery_temperature) max_battery_temperature,
        sum(battery_temperature_abnormal_count) battery_temperature_abnormal_count
    from dws_car_battery_1d
    where substr(dt, 0, 7) = '2023-05'
    group by vin
)battery
on motor.vin=battery.vin;
```

## 4 能耗主题

### 4.1 能耗相关分析

#### 建表

```sql
drop table if exists ads_consume_stat_last_month;
create external table ads_consume_stat_last_month
(
    vin                   string comment '汽车唯一ID',
    mon          string comment '统计月份',
    soc_per_charge        decimal(16, 2) comment '次均充电电量',
    duration_per_charge   decimal(16, 2) comment '次均充电时长',
    charge_count          int comment '充电次数',
    fast_charge_count     int comment '快充次数',
    slow_charge_count     int comment '慢充次数',
    fully_charge_count    int comment '深度充电次数',
    soc_per_100km         decimal(16, 2) comment 'soc百公里平均消耗',
    soc_per_run           decimal(16, 2) comment '每次里程soc平均消耗',
    soc_last_100km        decimal(16, 2) comment '最近百公里soc消耗'
) comment '能耗主题统计'
    row format delimited fields terminated by '\t'
    location '/warehouse/car_data/ads/ads_consume_stat_last_month';
```

#### 数据装载

```sql
with single_trip as (
    select
        vin,
        start_soc,
        end_soc,
        start_mileage,
        end_mileage,
        start_timestamp,
        end_timestamp,
        dt
    from dws_electricity_single_trip_detail
    where substr(dt,1,7)='2023-05'
),a0  as (
    select
        vin,
        avg(soc) soc_per_charge,
        avg(duration) duration_per_charge,
        count(*) charge_count,
        sum(`if`(avg_current>=180,1,0)) fast_charge_count,
        sum(`if`(avg_current<180,1,0))  slow_charge_count,
        sum(fully_charge) fully_charge_count
    from (
         select
            vin,
            max(soc) - min(soc) soc,
            (max(`timestamp`) - min(`timestamp`))/1000 duration,
            avg(electric_current) avg_current,
            `if`(min(soc)<=20 and max(soc)>=80,1,0) fully_charge
        from (
             select
                vin,
                soc,
                electric_current,
                `timestamp`,
                sum(`if`(dif_ts > 60000,1,0)) over (partition by vin order by `timestamp`) mark
            from (
                 select
                    vin,
                    soc,
                    electric_current,
                    `timestamp`,
                   `timestamp`- lag(`timestamp`,1,0) over (partition by vin order by `timestamp`) dif_ts
                from dwd_car_parking_charging_inc
                where substr(dt,0,7)='2023-05'
            )a1
        )a2
        group by vin,mark
    )a3
    group by vin
)
insert overwrite table ads_consume_stat_last_month
select *
from ads_consume_stat_last_month
union
select
    a0.vin,
    '2023-05' mon,
    cast(nvl(soc_per_charge,0) as decimal(16,2)),
    cast(nvl(duration_per_charge,0) as decimal(16,2)),
    charge_count,
    fast_charge_count,
    slow_charge_count,
    fully_charge_count,
    cast(nvl(soc_per_100km,0) as decimal(16,2)),
    cast(nvl(soc_per_run,0) as decimal(16,2)),
    cast(nvl(soc_last_100km,0) as decimal(16,2))
from (
     select
        vin,
        sum(start_soc - end_soc) / sum(end_mileage-start_mileage) * 1000  soc_per_100km,
        avg(start_soc - end_soc) soc_per_run,
        sum(`if`( lag_sum_mi<1000 and last_sum_mi >= 1000,last_sum_soc,0)) /
        sum(`if`( lag_sum_mi<1000 and last_sum_mi >= 1000,last_sum_mi,0))  * 1000 soc_last_100km
    from (
         select
            vin,
            start_soc,
            end_soc,
            start_mileage,
            end_mileage,
            end_timestamp,
            last_sum_mi,
            last_sum_soc,
            lag(last_sum_mi,1,0)over (partition by vin order by end_timestamp desc) lag_sum_mi
        from (
             select
                vin,
                start_soc,
                end_soc,
                start_mileage,
                end_mileage,
                end_timestamp,
                sum(end_mileage - start_mileage) over (partition by vin order by end_timestamp desc ) last_sum_mi,
                sum(start_soc - end_soc) over (partition by vin order by end_timestamp desc ) last_sum_soc
            from (
                 select
                    t1.vin,
                    t1.start_soc,
                    nvl(t2.end_soc,t1.end_soc) end_soc,
                    t1.start_mileage,
                    nvl(t2.end_mileage,t1.end_mileage) end_mileage,
                    t1.start_timestamp,
                    nvl(t2.end_timestamp,t1.end_timestamp) end_timestamp,
                    lag(t2.vin,1,null)over (partition by t1.vin order by t1.start_timestamp) del_mark
                from single_trip t1
                left join single_trip t2
                on t1.vin=t2.vin and  datediff(t2.dt,t1.dt)=1 and t2.start_timestamp-t1.end_timestamp=30000
            )t3
            where del_mark is null
        )t4
    )t5
    group by vin
)t6 join a0
on t6.vin=a0.vin;
```

### 4.2 车型能耗相关统计

#### 建表

```sql
drop table if exists ads_car_type_consume_stat_last_month;

create external table ads_car_type_consume_stat_last_month

(

  car_type       string comment '车型',

  mon      string comment '统计月份',

  avg_soc_per_charge     decimal(16, 2) comment '平均每次充电电量',

  avg_duration_per_charge  decimal(16, 2) comment '平均每次充电时长',

  avg_charge_count      int comment '平均充电次数',

  avg_fast_charge_count   int comment '平均快充次数',

  avg_slow_charge_count   int comment '平均慢充次数',

  avg_fully_charge_count   int comment '平均深度充电次数',

  soc_per_100km     decimal(16, 2) comment 'soc百公里平均消耗',

  soc_per_run      decimal(16, 2) comment '每次里程soc平均消耗',

  soc_last_100km     decimal(16, 2) comment '最近百公里soc平均消耗'

) comment '车型能耗主题统计'

  row format delimited fields terminated by '\t'

  location '/warehouse/car_data/ads/ads_car_type_consume_stat_last_month';
```

#### 数据装载

```sql
insert overwrite table ads_car_type_consume_stat_last_month

select *

from ads_car_type_consume_stat_last_month

union

select

  type,

  '2023-05' mon,

  cast(avg(soc_per_charge) as decimal(16,2)) avg_soc_per_charge,

  cast(avg(duration_per_charge) as decimal(16,2)) avg_duration_per_charge,

  cast(avg(charge_count) as int) avg_charge_count,

  cast(avg(fast_charge_count) as int) avg_fast_charge_count,

  cast(avg(slow_charge_count) as int ) avg_slow_charge_count,

  cast( avg(fully_charge_count) as int ) avg_fully_charge_count,

  cast(avg(soc_per_100km) as decimal(16,2)) soc_per_100km,

  cast(avg(soc_per_run) as decimal(16,2)) soc_per_run,

  cast(avg(soc_last_100km) as decimal(16,2))soc_last_100km

from (

   select

​    vin,

​    mon,

​    soc_per_charge,

​    duration_per_charge,

​    charge_count,

​    fast_charge_count,

​    slow_charge_count,

​    fully_charge_count,

​    soc_per_100km,

​    soc_per_run,

​    soc_last_100km

  from ads_consume_stat_last_month

  where mon='2023-05'

)consume

join (

  select

​    id,

​    type

  from dim_car_info_full

  where dt='2023-05-03'

)car_info

on vin=id

group by type;
```

**10.5** **装载脚本**

```bash
vim dws_to_ads.sh
```

编写如下内容

```shell
#!/usr/bin/env bash

APP='car_data'

if [ -n "$2" ]; then
   do_date=$2
else
   do_date=$(date -d '-1 day' +%F)
fi
do_month=$(date -d "${do_date}" +"%Y-%m")

database_init="use car_data;"

ads_mileage_stat_last_month="
insert overwrite table \${APP}.ads_mileage_stat_last_month
select *
from \${APP}.ads_mileage_stat_last_month
union
select vin,
   '\${do_month}',
   cast(avg(total_mileage) as int) avg_mileage,
   cast(sum(total_speed)/sum(running_count) as decimal(16,2)) avg_speed,
   cast(nvl(sum(danger_count) / sum(total_mileage) * 1000 ,0) as decimal(16,2))
from \${APP}.dws_car_mileage_1d
where substr(dt, 0, 7) = '\${do_month}'
group by vin;
"

ads_car_type_mileage_stat_last_month="
insert overwrite table \${APP}.ads_car_type_mileage_stat_last_month
select *
from \${APP}.ads_car_type_mileage_stat_last_month
union
select type,
   '\${do_month}',
   cast(avg(total_mileage) as int) avg_mileage,
   cast(sum(total_speed)/sum(running_count) as decimal(16,2)) avg_speed,
   cast( sum(danger_count)/sum(total_mileage) * 1000 as decimal(16,2)) danger_count
from \${APP}.dws_car_mileage_1d s
   join (
       select
       id,
       type
       from \${APP}.dim_car_info_full
       where dt='\${do_date}'
   )car_info
   on s.vin=car_info.id
where substr(s.dt, 1, 7) = '\${do_month}'
group by type;
"

ads_alarm_stat_last_month="
insert overwrite table \${APP}.ads_alarm_stat_last_month
select *
from \${APP}.ads_alarm_stat_last_month
union
select vin,
   '\${do_month}',
   sum(alarm_count),
   sum(l1_alarm_count),
   sum(l2_alarm_count),
   sum(l3_alarm_count)
from \${APP}.dws_car_alarm_1d
where substr(dt, 0, 7) = '\${do_month}'
group by vin;
"

ads_temperature_stat_last_month="
insert overwrite table \${APP}.ads_temperature_stat_last_month
select *
from \${APP}.ads_temperature_stat_last_month
union
select
 motor.vin,
 '\${do_month}' mon,
 max_motor_temperature,
 cast(avg_motor_temperature as decimal(16,2)) avg_motor_temperature,
 max_motor_controller_temperature,
 cast(avg_motor_controller_temperature as decimal(16,2)) avg_motor_controller_temperature,
 max_battery_temperature,
 battery_temperature_abnormal_count
from (
  select
   vin,
   max(max_motor_temperature) max_motor_temperature,
   avg(avg_motor_temperature) avg_motor_temperature,
   max(max_motor_controller_temperature) max_motor_controller_temperature,
   avg(avg_motor_controller_temperature) avg_motor_controller_temperature
 from \${APP}.dws_car_motor_1d
 where substr(dt, 0, 7) = '\${do_month}'
 group by vin
)motor
join
 (
 select
   vin,
   max(max_battery_temperature) max_battery_temperature,
   sum(battery_temperature_abnormal_count) battery_temperature_abnormal_count
 from \${APP}.dws_car_battery_1d
 where substr(dt, 0, 7) = '\${do_month}'
 group by vin
)battery
on motor.vin=battery.vin;
"

ads_consume_stat_last_month="
with single_trip as (
 select
   vin,
   start_soc,
   end_soc,
   start_mileage,
   end_mileage,
   start_timestamp,
   end_timestamp,
   dt
 from \${APP}.dws_electricity_single_trip_detail
 where substr(dt,1,7)='\${do_month}'
),a0  as (
 select
   vin,
   avg(soc) soc_per_charge,
   avg(duration) duration_per_charge,
   count(*) charge_count,
   sum(if(avg_current>=180,1,0)) fast_charge_count,
   sum(if(avg_current<180,1,0))  slow_charge_count,
   sum(fully_charge) fully_charge_count
 from (
    select
     vin,
     max(soc) - min(soc) soc,
     (max(\`timestamp\`) - min(\`timestamp\`))/1000 duration,
     avg(electric_current) avg_current,
     if(min(soc)<=20 and max(soc)>=80,1,0) fully_charge
   from (
      select
       vin,
       soc,
       electric_current,
       \`timestamp\`,
       sum(if(dif_ts > 60000,1,0)) over (partition by vin order by \`timestamp\`) mark
     from (
        select
         vin,
         soc,
         electric_current,
         \`timestamp\`,
         \`timestamp\`- lag(\`timestamp\`,1,0) over (partition by vin order by \`timestamp\`) dif_ts
       from \${APP}.dwd_car_parking_charging_inc
       where substr(dt,0,7)='\${do_month}'
     )a1
   )a2
   group by vin,mark
 )a3
 group by vin
)
insert overwrite table \${APP}.ads_consume_stat_last_month
select *
from \${APP}.ads_consume_stat_last_month
union
select
 a0.vin,
 '\${do_month}' mon,
 cast(nvl(soc_per_charge,0) as decimal(16,2)),
 cast(nvl(duration_per_charge,0) as decimal(16,2)),
 charge_count,
 fast_charge_count,
 slow_charge_count,
 fully_charge_count,
 cast(nvl(soc_per_100km,0) as decimal(16,2)),
 cast(nvl(soc_per_run,0) as decimal(16,2)),
 cast(nvl(soc_last_100km,0) as decimal(16,2))
from (
  select
   vin,
   sum(start_soc - end_soc) / sum(end_mileage-start_mileage) * 1000  soc_per_100km,
   avg(start_soc - end_soc) soc_per_run,
   sum(if( lag_sum_mi<1000 and last_sum_mi >= 1000,last_sum_soc,0)) /
   sum(if( lag_sum_mi<1000 and last_sum_mi >= 1000,last_sum_mi,0))  * 1000 soc_last_100km
 from (
    select
     vin,
     start_soc,
     end_soc,
     start_mileage,
     end_mileage,
     end_timestamp,
     last_sum_mi,
     last_sum_soc,
     lag(last_sum_mi,1,0)over (partition by vin order by end_timestamp desc) lag_sum_mi
   from (
      select
       vin,
       start_soc,
       end_soc,
       start_mileage,
       end_mileage,
       end_timestamp,
       sum(end_mileage - start_mileage) over (partition by vin order by end_timestamp desc ) last_sum_mi,
       sum(start_soc - end_soc) over (partition by vin order by end_timestamp desc ) last_sum_soc
     from (
        select
         t1.vin,
         t1.start_soc,
         nvl(t2.end_soc,t1.end_soc) end_soc,
         t1.start_mileage,
         nvl(t2.end_mileage,t1.end_mileage) end_mileage,
         t1.start_timestamp,
         nvl(t2.end_timestamp,t1.end_timestamp) end_timestamp,
         lag(t2.vin,1,null)over (partition by t1.vin order by t1.start_timestamp) del_mark
       from single_trip t1
       left join single_trip t2
       on t1.vin=t2.vin and  datediff(t2.dt,t1.dt)=1 and t2.start_timestamp-t1.end_timestamp=30000
     )t3
     where del_mark is null
   )t4
 )t5
 group by vin
)t6 join a0
on t6.vin=a0.vin;
"

ads_car_type_consume_stat_last_month="
insert overwrite table \${APP}.ads_car_type_consume_stat_last_month
select *
from \${APP}.ads_car_type_consume_stat_last_month
union
select
 type,
 '\${do_month}' mon,
 cast(avg(soc_per_charge) as decimal(16,2)) avg_soc_per_charge,
 cast(avg(duration_per_charge) as decimal(16,2)) avg_duration_per_charge,
 cast(avg(charge_count) as int) avg_charge_count,
 cast(avg(fast_charge_count) as int) avg_fast_charge_count,
 cast(avg(slow_charge_count) as int ) avg_slow_charge_count,
 cast( avg(fully_charge_count) as int ) avg_fully_charge_count,
 cast(avg(soc_per_100km) as decimal(16,2)) soc_per_100km,
 cast(avg(soc_per_run) as decimal(16,2)) soc_per_run,
 cast(avg(soc_last_100km) as decimal(16,2))soc_last_100km
from (
  select
   vin,
   mon,
   soc_per_charge,
   duration_per_charge,
   charge_count,
   fast_charge_count,
   slow_charge_count,
   fully_charge_count,
   soc_per_100km,
   soc_per_run,
   soc_last_100km
 from \${APP}.ads_consume_stat_last_month
 where mon='\${do_month}'
)consume
join (
 select
   id,
   type
 from \${APP}.dim_car_info_full
 where dt='\${do_date}'
)car_info
on vin=id
group by type;
"

case $1 in
'ads_mileage_stat_last_month')
 hive -e "$ads_mileage_stat_last_month"
 ;;
'ads_car_type_mileage_stat_last_month')
 hive -e "$ads_car_type_mileage_stat_last_month"
 ;;
'ads_alarm_stat_last_month')
 hive -e "$ads_alarm_stat_last_month"
 ;;
'ads_temperature_stat_last_month')
 hive -e "$ads_temperature_stat_last_month"
 ;;
'ads_consume_stat_last_month')
 hive -e "$ads_consume_stat_last_month"
 ;;
'ads_car_type_consume_stat_last_month')
 hive -e "$ads_car_type_consume_stat_last_month"
 ;;
"all")
 hive -e "${ads_mileage_stat_last_month}${ads_car_type_mileage_stat_last_month}${ads_alarm_stat_last_month}${ads_temperature_stat_last_month}${ads_consume_stat_last_month}${ads_car_type_consume_stat_last_month}"
 ;;
esac
```

```bash
chmod +x dws_to_ads.sh

dws_to_ads.sh all 2023-05-02
```