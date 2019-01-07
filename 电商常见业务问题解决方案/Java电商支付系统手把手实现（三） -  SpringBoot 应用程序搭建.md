# 1 软件版本要对齐
- java
![](https://img-blog.csdnimg.cn/20200124215221610.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- Intellij IDEA Ultimate
![](https://img-blog.csdnimg.cn/20200124220604492.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- Maven
![](https://img-blog.csdnimg.cn/2020012421553824.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- SpringBoot
2.1.7（强制必须）

#  2 新建应用
![](https://img-blog.csdnimg.cn/20200124220650921.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 确保你的科学上网方式正常
![](https://img-blog.csdnimg.cn/20200124220423417.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 只修改标志范围内的![](https://img-blog.csdnimg.cn/20200124220800448.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 注意可能 sb 的版本号找不到 2.1.7，先默认，之后再改，目前只勾选 Spring Web
![](https://img-blog.csdnimg.cn/20200124221046928.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200124221222210.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 配置为本地 maven 路径
![](https://img-blog.csdnimg.cn/20200124221704605.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 修改为 2.1.7 版本
![](https://img-blog.csdnimg.cn/20200124222222883.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

- IDEA(开发是过程)
- Java命令( 部署是最终结果&调试)
# 3 MyBatis V.S JPA
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
- 新建 pojo 包
![](https://img-blog.csdnimg.cn/20200125132420461.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
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


# 参考
- 高性能 MySQL 第三版
- 实战支付+电商双系统

