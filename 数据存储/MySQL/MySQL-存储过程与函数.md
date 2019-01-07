触发器,函数,存储过程
# 1 存储过程与函数的区别
本质上没区别，执行的本质都一样。

函数有且只能返回一个变量
存储过程可以返回多个

　　 
函数可以嵌入在sql中使用的,可以在select中调用
存储过程要让sql的query 可以执行， 需要把 `mysql_real_connect` 的最后一个参数设置为`CLIENT_MULTI_STATEMENTS` 

函数限制比较多，比如不能用临时表，只能用表变量．还有一些函数都不可用等等．
存储过程的限制相对就比较少。 

1）存储过程实现的功能要复杂一点,功能强大，可以执行包括修改表等一系列数据库操作
函数的实现的功能针对性比较强,用户定义函数不能用于执行一组修改全局数据库状态的操作。

2）存储过程来说可以返回参数，如记录集，而函数只能返回值或者表对象
函数只能返回一个变量；而存储过程可以返回多个。存储过程的参数可以有IN,OUT,INOUT三种类型，而函数只能有IN类~~存储过程声明时不需要返回类型，而函数声明时需要描述返回类型，且函数体中必须包含一个有效的RETURN语句。

3）存储过程，可以使用非确定函数，不允许在用户定义函数主体中内置非确定函数。

4）存储过程一般是作为一个独立的部分来执行（ EXECUTE 语句执行），而函数可以作为查询语句的一个部分来调用（SELECT调用），由于函数可以返回一个表对象，因此它可以在查询语句中位于FROM关键字的后面。 SQL语句中不可用存储过程，而可以使用函数。 

当存储过程和函数被执行的时候，SQL Manager会到procedure cache中去取相应的查询语句，如果在procedure cache里没有相应的查询语句，SQL Manager就会对存储过程和函数进行编译。 

Procedure cache中保存的是执行计划 (execution plan) ，当编译好之后就执行execution plan
之后SQL SERVER会根据每个execution plan的实际情况来考虑是否要在cache中保存这个plan，评判的标准一个是这个execution plan可能被使用的频率；其次是生成这个plan的代价，也就是编译的耗时。保存在cache中的plan在下次执行时就不用再编译了。

# 2 MYSql存储过程的作用及语法
**作用：** 
　　1、使用存过过程，很多相似性的删除，更新，新增等操作就变得轻松了，并且以后也便于管理！ 
　　2、存储过程因为SQL语句已经预编绎过了，因此运行的速度比较快。 
　　3、存储过程可以接受参数、输出参数、返回单个或多个结果集以及返回值。可以向程序返回错误原因。 
　　4、存储过程运行比较稳定，不会有太多的错误。只要一次成功，以后都会按这个程序运行。 
　　5、存储过程主要是在服务器上运行，减少对客户机的压力。 
　　6、存储过程可以包含程序流、逻辑以及对数据库的查询。同时可以实体封装和隐藏了数据逻辑。 
　　7、存储过程可以在单个存储过程中执行一系列SQL语句。 
　　8、存储过程可以从自己的存储过程内引用其它存储过程，这可以简化一系列复杂语句。

**一、创建存储过程**

```
create procedure sp_name()
begin
.........
end
```

**二、调用存储过程**

```
call sp_name()
```

注意：存储过程名称后面必须加括号，哪怕该存储过程没有参数传递

**三、删除存储过程**

```
drop procedure sp_name//
```

注意：不能在一个存储过程中删除另一个存储过程，只能调用另一个存储过程

**四、区块，条件，循环** 
**1、区块定义，常用**

```
begin
......
end;
```

也可以给区块起别名，如：

```
lable:begin
...........
end lable;
```

可以用leave lable;跳出区块，执行区块以后的代码

**2、条件语句**

```
if 条件 then
statement
else
statement
end if;
```

**3、循环语句** 
**(1)while循环**

```
[label:] WHILE expression DO

statements

END WHILE [label] ;
```

**(2)、loop循环**

```
[label:] LOOP

statements

END LOOP [label];
```

**(3)、repeat until循环**

```
[label:] REPEAT

statements

UNTIL expression

END REPEAT [label] ;
```

**五、其他常用命令** 
1.show procedure status 
显示数据库中所有存储的存储过程基本信息，包括所属数据库，存储过程名称，创建时间等 
2.show create procedure sp_name 
显示某一个存储过程的详细信息

**函数function示例**

```
CREATE DEFINER=`root`@`%` FUNCTION `spr_checkadmin`(acckey varchar(32), accpwd varchar(64)) RETURNS int(11)
BEGIN
DECLARE x INT;
SELECT COUNT(*) INTO x FROM admins WHERE account=acckey AND passwd=accpwd;
RETURN(x);
END;
```

**单个返回值的存储过程**

```
CREATE DEFINER=`root`@`%` PROCEDURE `spr_getuserstorage`(tok varchar(128))
BEGIN
DECLARE acc VARCHAR(32);
DECLARE pkgid VARCHAR(32);
DECLARE regdate DATETIME;
DECLARE logindate DATETIME;
DECLARE sumsize BIGINT;
SELECT account INTO acc FROM userinfo WHERE token=tok;
IF (acc != NULL) THEN
SELECT SUM(filesize) INTO sumsize FROM userfiles WHERE account=acc;
SELECT packageid, registerdate, lastlogindate INTO pkgid, regdate, logindate FROM userinfo WHERE account=acc;
SELECT 0,pkgid,regdate,logindate;
ELSE
SELECT(-1);
END IF;
```

**多个返回值存储过程**

```
CREATE DEFINER=`root`@`%` PROCEDURE `spr_queryfolderallfile`(sToken varchar(32), OUT sfid varchar(32), OUT sfext varchar(32))
BEGIN
DECLARE acc CHAR(32);
SELECT account INTO acc FROM userinfo WHERE token=sToken;
IF (acc != NULL) THEN
SELECT fileid, fileext INTO sfid, sfext FROM userfiles WHERE account=acc AND filetype=1;
END IF;
END;
```
