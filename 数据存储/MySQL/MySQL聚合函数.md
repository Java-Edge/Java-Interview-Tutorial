一般情况下，我们需要的聚合数据(总和，平均数，最大最小值等)并不总是存储在表中。 但可以通过执行存储数据的计算来获取它。

例如，由于orderDetails表仅存储每个项目的数量和价格，无法通过从orderdetails表直接查询获得每个订单的总金额。必须为每个订单查询项目的数量和价格，并计算订单的总额。
要在查询中执行此类计算，就要使用聚合函数了。

聚合函数对一组值执行计算并返回单个值。

MySQL提供了许多聚合函数，包括AVG，COUNT，SUM，MIN，MAX等。
除COUNT函数外，其它聚合函数在执行计算时会忽略NULL值。
# AVG
计算一组值的平均值。

```sql
AVG(expression)
```

可以使用AVG()函数通过使用以下查询来计算products表中所有产品的平均价格：
```sql
mysql> SELECT AVG(buyPrice) average_buy_price
FROM products;
+-------------------+
| average_buy_price |
+-------------------+
| 54.395182         |
+-------------------+
1 row in set
```
# COUNT
返回表中的行数。
比如获取products表中的产品数量：
```sql
mysql> SELECT COUNT(*) AS Total
FROM products;
+-------+
| Total |
+-------+
|   110 |
+-------+
1 row in set
```
COUNT()函数有几个表单，如COUNT(*)和COUNT(DISTINCT expression)

# SUM()
返回一组值的总和。如果找不到匹配行，则SUM()函数返回NULL值。

比如获得每个产品的总销售量，搭配GROUP BY：
```sql
mysql> SELECT productCode,sum(priceEach * quantityOrdered) total
FROM orderdetails
GROUP by productCode;
+-------------+-----------+
| productCode | total     |
+-------------+-----------+
| S10_1678    | 90157.77  |
| S700_3505   | 84992.25  |
****** 此处省略了一大波数据 ********
| S700_3962   | 78919.06  |
| S700_4002   | 71753.93  |
| S72_1253    | 42692.53  |
| S72_3212    | 47550.40  |
+-------------+-----------+
109 rows in set
```
要更详细地查看结果，可以将orderdetails表连接到products表中：
```sql
SELECT P.productCode,
       P.productName,
       SUM(priceEach * quantityOrdered) total
FROM orderdetails O
INNER JOIN products  P ON O.productCode = P.productCode
GROUP by productCode
ORDER BY total;
SQL
执行上面查询语句，得到以下结果 - 
mysql> SELECT P.productCode,
       P.productName,
       SUM(priceEach * quantityOrdered) total
FROM orderdetails O
INNER JOIN products  P ON O.productCode = P.productCode
GROUP by productCode
ORDER BY total;
+-------------+---------------------------------------------+-----------+
| productCode | productName                                 | total     |
+-------------+---------------------------------------------+-----------+
| S24_1937    | 1939 Chevrolet Deluxe Coupe                 | 28052.94  |
| S24_3969    | 1936 Mercedes Benz 500k Roadster            | 29763.39  |
| S24_2972    | 1982 Lamborghini Diablo                     | 30972.87  |
| S24_2840    | 1958 Chevy Corvette Limited Edition         | 31627.96  |
****** 此处省略了一大波数据 ************************************************
| S12_3891    | 1969 Ford Falcon                            | 152543.02 |
| S12_1099    | 1968 Ford Mustang                           | 161531.48 |
| S10_4698    | 2003 Harley-Davidson Eagle Drag Bike        | 170686.00 |
| S10_1949    | 1952 Alpine Renault 1300                    | 190017.96 |
| S12_1108    | 2001 Ferrari Enzo                           | 190755.86 |
| S18_3232    | 1992 Ferrari 360 Spider red                 | 276839.98 |
+-------------+---------------------------------------------+-----------+
109 rows in set
```


# MAX()
返回一组值中的最大值。
```sql
MAX(expression)
```

例如，获取products表中最昂贵的产品
```sql
mysql> SELECT MAX(buyPrice) highest_price FROM products;
+---------------+
| highest_price |
+---------------+
| 103.42        |
+---------------+
1 row in set
```

# MIN()
返回一组值中的最小值
```sql
MIN(expression)
```

比如在products表查找最低价格产品：
```sql
mysql> SELECT MIN(buyPrice) lowest_price FROM Products;
+--------------+
| lowest_price |
+--------------+
| 15.91        |
+--------------+
1 row in set
```