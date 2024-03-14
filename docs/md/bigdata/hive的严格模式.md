# hive的严格模式

## 1 参数控制

一项配置，旨在阻止执行某些可能导致效率低下的查询操作。主要是通过以下几个配置参数控制的：

### 1.1 hive.mapred.mode

- 默认值：
  - Hive 0.x: `nonstrict`
  - Hive 1.x: `nonstrict`
  - Hive 2.x: `strict` ([HIVE-12413](https://issues.apache.org/jira/browse/HIVE-12413))
- 添加于：Hive 0.3.0

Hive 操作执行的模式。在 `strict` 模式下，一些风险较高的查询不允许运行。如阻止：

- 全表扫描（参见 [HIVE-10454](https://issues.apache.org/jira/browse/HIVE-10454)）
-  [ORDER BY](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+SortBy#LanguageManualSortBy-SyntaxofOrderBy) 需 LIMIT 子句

- 没有WHERE子句的查询（可能会扫描整个表）
- 无分区键的查询（对分区表而言，如果不使用分区键进行查询，也可能会扫描整个表）

### 1.2 hive.strict.checks.large.query

若置true，Hive会对大查询大数据做析假以限制（如，防止笛卡尔积）

### 1.3 hive.strict.checks.no.partition.filter

若设置为true，Hive会要求分区表的查询须含有分区列的过滤条件，为防止查询无意中扫描全表。

### 1.4 hive.strict.checks.bucketing

置true时，Hive会检查对于bucketed表的查询是否使用了正确的数据集合方法。

## 2 开启

```sql
SET hive.mapred.mode=STRICT;
```

## 3 关闭

```sql
SET hive.mapred.mode=nonstrict;
```

严格模式下，如果你必须执行全表扫描或者不指定分区键的查询，你需要明确告知Hive你知晓这些潜在的效率问题并且接受后果。这可以通过在查询时添加相关的LIMIT子句，或者在查询中使用分区过滤条件来实现。

例如，在严格模式下，下面的查询会被阻止：

```sql
SELECT * FROM sales; -- 无WHERE子句，可能扫描全表
```

你需要这样修改查询以避免被阻止：

```sql
SELECT * FROM sales WHERE sale_date = '2023-04-15'; -- 使用WHERE子句限制扫描
```

者：

```sql
SELECT * FROM sales LIMIT 100; -- 使用LIMIT子句限制返回结果的数量
```

## 4 总结

开启严格模式是一种好的实践，因为它可以帮助我们避免执行一些可能导致计算资源浪费的低效查询。这在处理大型数据集和维护生产环境时尤其重要。但是，在某些情况下，如果我们知道所执行的操作是确定的，并且我们需要执行全表扫描这样的操作，可临时关闭严格模式。