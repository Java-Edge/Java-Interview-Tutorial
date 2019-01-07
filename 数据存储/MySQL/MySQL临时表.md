> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

- 面试频率可不低哦，大家务必掌握，避免阴沟翻船！![](https://img-blog.csdnimg.cn/20200825225748108.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

临时表在我们需要保存一些临时数据时非常有用。
临时表只在`当前连接`可见，当关闭连接时，MySQL会自动删除表并释放所有空间。

> 临时表在MySQL 3.23版本添加。
    
如果你使用Java的MySQL客户端程序连接MySQL数据库服务器来创建临时表，那么只有在关闭客户端程序时才会销毁临时表，当然也可手动销毁。

# 实例
- 建表
![](https://img-blog.csdnimg.cn/20200825223741329.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

- 插入数据
![](https://img-blog.csdnimg.cn/20200825223534264.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- 查询![](https://img-blog.csdnimg.cn/20200825223508176.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

当使用 SHOW TABLES显示数据表列表时，无法看到所建的表。

若退出当前MySQL会话，再使用 SELECT命令来读取原先创建的临时表数据，那你会发现数据库中没有该表的存在，因为在你退出时该临时表已经被销毁了。

# 删除MySQL 临时表
默认情况下，当断开与数据库的连接后，临时表就会自动被销毁。当然也可以在当前MySQL会话使用 DROP TABLE 命令来手动删除临时表。

以下是手动删除临时表的实例：
![](https://img-blog.csdnimg.cn/20200825224115177.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

#  场景案例
比如你的系统有高并发同时写库的需求。假设10w条数据量同时写入：
1. 多线程，建临时表，分别写到临时表，再入库
2. 从源端控制，不允许同时写入多条

![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
