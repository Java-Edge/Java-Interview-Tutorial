# 
- JPA是趋势

- Mybatis是国内现状
![](https://img-blog.csdnimg.cn/2020012511033278.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200125111905510.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 版本对应表![在这里插入图片描述](https://img-blog.csdnimg.cn/20200125112019732.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- Maven 安装方式
![](https://img-blog.csdnimg.cn/20200125112342231.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- mybatis 只是持久层的框架，连接数据库我们还需要数据库驱动，注意不需要指定版本，sb starer 已经指定好了版本
![](https://img-blog.csdnimg.cn/20200125112706794.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 接着，自然是配置数据库了
![](https://img-blog.csdnimg.cn/20200125113333551.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

- 新建 dao 层

- 单元测试不可忘
![](https://img-blog.csdnimg.cn/20200125164756433.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

- 数据库中字段值
![](https://img-blog.csdnimg.cn/20200125164635713.png)
- 然而，我们却查得为 null 字段![](https://img-blog.csdnimg.cn/20200125164848785.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 因为 Java 驼峰命名，而数据库是下划线分割命名，导致不匹配，幸好 mybatis 已经为我们解决
![](https://img-blog.csdnimg.cn/20200125165120956.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 有值啦！
![](https://img-blog.csdnimg.cn/20200125165220280.png)

- 假如有很多 mapper 类，并不需要每个都显式注解@Mapper,在启动类添加扫描注解即可
![](https://img-blog.csdnimg.cn/20200125170133647.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)



## xml 语句
- 注意指定mapper文件路径
![](https://img-blog.csdnimg.cn/20200125181626705.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)