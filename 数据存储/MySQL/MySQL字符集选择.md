> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

`所有在使用“utf8”的MySQL和MariaDB用户都应该改用“utf8mb4”，永远都不要再使用“utf8”。`


MySQL的“utf8”不是真正的UTF-8。“utf8”只支持每个字符最多三个字节，而真正的UTF-8是每个字符最多四个字节。
- MySQL一直没有修复这个bug，他们在2010年发布了一个叫作“utf8mb4”的字符集，绕过这个问题。
![](https://img-blog.csdnimg.cn/20200124024614228.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

几乎所有的网络应用都使用了Unicode字符集。Unicode字符集包含了上百万个字符。最简单的编码是UTF-32，每个字符使用32位。这样做最简单，因为一直以来，计算机将32位视为数字，而计算机最在行的就是处理数字。但问题是，这样太浪费空间了。

UTF-8可以节省空间，在UTF-8中，字符“C”只需要8位，一些不常用的字符，比如“”需要32位。其他的字符可能使用16位或24位。一篇类似本文这样的文章，如果使用UTF-8编码，占用的空间只有UTF-32的四分之一左右。
但是MySQL的“utf8”字符集与其他程序还不兼容！
MySQL从4.1版本开始支持UTF-8，也就是2003年，而今天使用的UTF-8标准（RFC 3629）是随后才出现的。
旧版的UTF-8标准（RFC 2279）最多支持每个字符6个字节。2002年3月28日，MySQL开发者在第一个MySQL 4.1预览版中使用了RFC 2279。
同年9月，他们对MySQL源代码进行了一次调整：“UTF8现在最多只支持3个字节的序列”。

# utf8mb4字符集
支持BMP和补充字符。

每个多字节字符最多需要四个字节。

utf8mb4与utf8mb3字符集形成对比，后者仅支持BMP字符，每个字符最多使用三个字节：

对于BMP字符，utf8mb4和utf8mb3具有相同的存储特征：相同的代码值，相同的编码，相同的长度。

对于补充字符，utf8mb4需要四个字节来存储它，而utf8mb3根本不能存储该字符。 将utf8mb3列转换为utf8mb4时，无需担心转换辅助字符的麻烦，因为将没有补充字符。

utf8mb4是utf8mb3的超集，因此对于诸如以下串联的操作，结果具有字符集utf8mb4和utf8mb4_col的排序规则：

```sql
SELECT CONCAT(utf8mb3_col, utf8mb4_col);
```
同样，WHERE子句中的以下比较根据utf8mb4_col的排序规则进行：

```sql
SELECT * FROM utf8mb3_tbl, utf8mb4_tbl
WHERE utf8mb3_tbl.utf8mb3_col = utf8mb4_tbl.utf8mb4_col;
```
# 字符集选择
1. 纯拉丁字符能表示的内容，没必要选择latin1之外编码，因为这会节省大量的存储空间
2. 如果我们可以确定不需要存放多种语言，就没必要非得使用UTF8或者其他UNICODE字符类型，这回造成大量的存储空间浪费。
3. MySQL的数据类型可以精确到字段，所以当我们需要大型数据库中存放多字节数据的时候，可以通过对不同表不同字段使用不同的数据类型来较大程度减小数据存储量，进而降低I0操作次数并提高缓存命中率。

# 总结
如果你在使用MySQL或MariaDB，不要再用“utf8”编码，而用“utf8mb4”。

- 推荐阅读
[将现有数据库的字符编码从“utf8”转成“utf8mb4”。](https://mathiasbynens.be/notes/mysql-utf8mb4#utf8-to-utf8mb4)


参考
- https://medium.com/@adamhooper/in-mysql-never-use-utf8-use-utf8mb4-11761243e434
- [MySQL 官方手册](https://dev.mysql.com/doc/refman/8.0/en/charset-unicode.html)