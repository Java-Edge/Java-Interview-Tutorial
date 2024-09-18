# MySQL 9.0更新

# 1 MySQL 9.0新特性

## 1 VECTOR 类型支持

MySQL 9.0 支持 [`VECTOR`](https://dev.mysql.com/doc/refman/9.0/en/vector.html) 列类型。向量是一个数据结构，它由条目列表（4 字节浮点值）组成，可以表示为二进制字符串值或列表格式字符串。`VECTOR` 列在声明时需指定最大长度或条目数量（括号内），默认值为 2048，最大值为 16383。

可用以下示例，通过 `CREATE TABLE` 创建带有 `VECTOR` 列的 [`InnoDB`](https://dev.mysql.com/doc/refman/9.0/en/innodb-storage-engine.html) 表：

```sql
mysql> CREATE TABLE v1 (c1 VECTOR(5000));
Query OK, 0 rows affected (0.03 sec)
```

### 向量列的限制

- `VECTOR` 列不能用作任何类型的键。这包括主键、外键、唯一键和分区键。

- 某些类型的 MySQL 函数和运算符不接受向量作为参数。这些函数包括但不限于数值函数和运算符、时间函数、全文搜索函数、XML 函数、位函数和 JSON 函数。

  向量可以与某些但非所有字符串和加密函数一起使用

- `VECTOR` 不能与任何其他类型进行比较，并且只能与另一个 `VECTOR` 进行相等性比较

[`VECTOR_DIM()`](https://dev.mysql.com/doc/refman/9.0/en/vector-functions.html#function_vector-dim)（也在 MySQL 9.0 中新增）返回向量的长度。提供了用于不同表示之间转换的函数。[`STRING_TO_VECTOR()`](https://dev.mysql.com/doc/refman/9.0/en/vector-functions.html#function_string-to-vector)（别名：`TO_VECTOR()`）采用列表格式表示的向量并返回二进制字符串表示；`VECTOR_TO_STRING()`（别名：`FROM_VECTOR()`）执行相反的操作，如下所示：

```sql
mysql> SELECT STRING_TO_VECTOR('[2, 3, 5, 7]');
+------------------------------------------------------+
| TO_VECTOR('[2, 3, 5, 7]')                            |
+------------------------------------------------------+
| 0x00000040000040400000A0400000E040                   |
+------------------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT VECTOR_TO_STRING(0x00000040000040400000A0400000E040);
+------------------------------------------------------+
| VECTOR_TO_STRING(0x00000040000040400000A0400000E040) |
+------------------------------------------------------+
| [2.00000e+00,3.00000e+00,5.00000e+00,7.00000e+00]    |
+------------------------------------------------------+
1 row in set (0.00 sec)
```

## 2 内联和隐式外键约束

MySQL 现在强制执行内联外键规范，这在以前版本中被解析器接受但忽略。MySQL 9.0 还接受对父表主键列的隐式引用。

考虑以下通过该语句创建的父表 `person`：

```sql
CREATE TABLE person (
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name CHAR(60) NOT NULL
);
```

  若要创建具有 `person` 外键 `owner` 的表 `shirt`，MySQL 现在根据标准接受并正确处理以下任何一种 [`CREATE TABLE`](https://dev.mysql.com/doc/refman/9.0/en/create-table.html) 语句：

  ```sql
CREATE TABLE shirt (
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    style ENUM('tee', 'polo', 'dress') NOT NULL,
    color ENUM('red', 'blue', 'yellow', 'white', 'black') NOT NULL,
    owner SMALLINT UNSIGNED NOT NULL,
    
    FOREIGN KEY (owner) REFERENCES person (id)
);

CREATE TABLE shirt (
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    style ENUM('tee', 'polo', 'dress') NOT NULL,
    color ENUM('red', 'blue', 'yellow', 'white', 'black') NOT NULL,
    owner SMALLINT UNSIGNED NOT NULL,
    
    FOREIGN KEY (owner) REFERENCES person
);

CREATE TABLE shirt (
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    style ENUM('tee', 'polo', 'dress') NOT NULL,
    color ENUM('red', 'blue', 'yellow', 'white', 'black') NOT NULL,
    owner SMALLINT UNSIGNED NOT NULL REFERENCES person (id)
);

CREATE TABLE shirt (
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    style ENUM('tee', 'polo', 'dress') NOT NULL,
    color ENUM('red', 'blue', 'yellow', 'white', 'black') NOT NULL,
    owner SMALLINT UNSIGNED NOT NULL REFERENCES person
);
  ```

以前版本的 MySQL 中，只有上述显示的第一个语句会创建外键。

## 3 将 EXPLAIN ANALYZE 的 JSON 输出保存到变量中

现在支持将 [`EXPLAIN ANALYZE`](https://dev.mysql.com/doc/refman/9.0/en/explain.html) 的 [`JSON`](https://dev.mysql.com/doc/refman/9.0/en/json.html) 输出保存到用户变量中，语法如下所示：

```sql
EXPLAIN ANALYZE FORMAT=JSON INTO @variable select_stmt
```

随后可以将该变量作为 MySQL JSON 函数的 JSON 参数使用（请参见 [第 14.17 节，“JSON 函数”](https://dev.mysql.com/doc/refman/9.0/en/json-functions.html)）。`INTO` 子句仅支持 `FORMAT=JSON`，且必须显式指定 `FORMAT`。此形式的 `EXPLAIN ANALYZE` 还支持可选的 `FOR SCHEMA` 或 `FOR DATABASE` 子句。

注意：仅当 [`explain_json_format_version`](https://dev.mysql.com/doc/refman/9.0/en/server-system-variables.html#sysvar_explain_json_format_version) 服务器系统变量设置为 `2` 时，此功能才可用；否则，尝试使用它将引发 [`ER_EXPLAIN_ANALYZE_JSON_FORMAT_VERSION_NOT_SUPPORTED`](https://dev.mysql.com/doc/mysql-errors/9.0/en/server-error-reference.html#error_er_explain_analyze_json_format_version_not_supported) 错误（EXPLAIN ANALYZE 在 explain_json_format_version=1 的情况下不支持 FORMAT=JSON）。

## 4 准备语句中的事件 DDL

从 MySQL 9.0.0 开始，以下语句可以进行准备：

- [`CREATE EVENT`](https://dev.mysql.com/doc/refman/9.0/en/create-event.html)
- [`ALTER EVENT`](https://dev.mysql.com/doc/refman/9.0/en/alter-event.html)
- [`DROP EVENT`](https://dev.mysql.com/doc/refman/9.0/en/drop-event.html)

这些语句不支持位置参数（`?` 占位符）；必须使用字符串字面值、系统变量和用户变量的某种组合来组装准备语句的文本。一种实现可重用性的方法是，在存储过程的主体中组装例如 `CREATE EVENT` 语句的文本，并将该语句的任何变量部分作为 `IN` 参数传递给存储过程；使用 [`PREPARE`](https://dev.mysql.com/doc/refman/9.0/en/prepare.html) 准备组装的文本；使用所需的参数值调用过程。

## 5 性能模式系统变量表

MySQL 9.0 为性能模式新增了两个表，这些表提供有关服务器系统变量的信息。列表如下：

- [`variables_metadata`](https://dev.mysql.com/doc/refman/9.0/en/performance-schema-variables-metadata-table.html) 表提供了有关系统变量的一般信息。此信息包括 MySQL 服务器识别的每个系统变量的名称、范围、类型、范围（如果适用）和描述。

  此表中的两列（`MIN_VALUE` 和 `MAX_VALUE`）旨在替换 [`variables_info`](https://dev.mysql.com/doc/refman/9.0/en/performance-schema-variables-info-table.html) 表中已废弃的列。

- [`global_variable_attributes`](https://dev.mysql.com/doc/refman/9.0/en/performance-schema-global-variable-attributes-table.html) 表提供有关服务器分配给全局系统变量的属性-值对的信息。

## 6 EXPLAIN FORMAT=JSON 的增强功能

[`EXPLAIN FORMAT=JSON`](https://dev.mysql.com/doc/refman/9.0/en/explain.html#explain-execution-plan) 的输出现在包括有关连接列的信息。

## 7 包含 LIMIT 1 的相关子查询

以前，为了有资格转换为带派生表的外部左连接，子查询不能包含 `LIMIT` 子句。在 MySQL 9.0 中，此限制略微放宽，使得包含 `LIMIT 1` 的子查询现在可以以这种方式进行转换。

`LIMIT` 子句必须仅使用字面值 `1`。如果 `LIMIT` 子句包含其他值，或者使用占位符 (`?`) 或变量，则无法使用子查询到派生表的转换进行优化。

以下是在 MySQL 9.0 中废弃的功能：

# 2 MySQL 9.0 中废弃的功能

以下功能在 MySQL 9.0 中被废弃，可能会在未来的版本中被移除。对于显示的替代方案，应用程序应更新以使用它们。
对于使用在 MySQL 9.0 中被废弃、在后续版本中移除的功能的应用程序，当从 MySQL 9.0 源复制到运行后续版本的副本时，语句可能会失败，或者源和副本上的效果可能不同。为了避免这些问题，使用在 9.0 中被废弃功能的应用程序应进行修订，以避免使用它们，并在可能的情况下使用替代方案。

### 性能模式 variables_info 表列

性能模式的 `variables_info` 表中的 `MIN_VALUE` 和 `MAX_VALUE` 列现在被废弃，并可能在未来的 MySQL 版本中被移除。相反，请使用 `variables_metadata` 表的列（参见 [MySQL 9.0 中新增或更改的功能](https://dev.mysql.com/doc/refman/9.0/en/mysql-nutshell.html#mysql-nutshell-additions)），这些列具有相同的名称。

### 更新事务性和非事务性表的事务

MySQL 9.0.0 废弃了同时更新事务性表和非事务性或非组合表的事务。这样的事务现在会在客户端和错误日志中写入一个废弃警告。只有 `InnoDB` 和 `BLACKHOLE` 存储引擎是事务性和组合性的（`NDBCLUSTER` 是事务性的但不是组合性的）。这意味着只有以下存储引擎的组合不会引发废弃警告：

- `InnoDB` 和 `BLACKHOLE`
- `MyISAM` 和 `Merge`
- `performance_schema` 和任何其他存储引擎
- `TempTable` 和任何其他存储引擎

# 3 MySQL 9.0 中移除的功能

以下项目已过时，并在 MySQL 9.0 中被移除。对于显示的替代方案，应用程序应更新以使用它们。
对于在 MySQL 8.4 中使用在 MySQL 9.0 中移除的功能的应用程序，当从 MySQL 8.4 源复制到 MySQL 9.0 副本时，语句可能会失败，或者源和副本上的效果可能不同。为了避免这些问题，使用在 MySQL 9.0 中移除功能的应用程序应进行修订，以避免使用它们，并在可能的情况下使用替代方案。

### mysql_native_password 插件

MySQL 8.0 中被废弃的 mysql_native_password 认证插件已被移除。服务器现在拒绝来自没有 `CLIENT_PLUGIN_AUTH` 能力的旧客户端程序的 `mysql_native` 认证请求。
由于这个更改，以下服务器选项和变量也已移除：

- `--mysql-native-password` 服务器选项
- `--mysql-native-password-proxy-users` 服务器选项
- `default_authentication_plugin` 服务器系统变量

为了向后兼容，`mysql_native_password` 在客户端仍然可用，这样 MySQL 9.0 客户端程序可以连接到早期版本的 MySQL 服务器。在 MySQL 9.0 中，以前版本的客户端程序内置的 MySQL 本地认证插件已转换为在运行时必须加载的插件。

参考：

- https://dev.mysql.com/doc/refman/9.0/en/mysql-nutshell.html