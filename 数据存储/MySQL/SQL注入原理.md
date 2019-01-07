sql注入是一种网络攻击，持久层框架都会自己处理该问题，所以日常开发感觉不到，但是为了面试我们还是得熟悉。

# 原理
将sql代码伪装到输入参数，传递到服务器解析并执行的一种攻击手法。

即在一些对server端发起的请求参数中植入一些sql代码，server端在执行sql操作时，会拼接对应参数，同时也将一些sql注入攻击的“sql”拼接起来，导致会执行一些预期之外的操作。

#  案例
在登录界面包括用户名和密码输入框，以及提交按钮，输入用户名和密码，提交。
登录时调用接口/user/login/ 加上参数username、password，首先连接数据库，然后后台对请求参数中携带的用户名、密码进行参数校验，即sql的查询过程。假设正确的用户名和密码为ls和123456，输入正确的用户名和密码、提交，相当于调用了以下的SQL语句。

```sql
SELECT * FROM user WHERE username = 'ls' AND password = '123456'
```

sql中会将#及--以后的字符串当做注释处理，如果我们使用“' or 1=1 #” 作为用户名参数，那么服务端构建的sql语句就如下：

```sql
select * from users where username='' or 1=1#' and password='123456'
```
而#会忽略后面的语句，因此上面的sql也等价于：

```sql
select * from users where username='' or 1=1
```
而1=1属于常等型条件，因此这个sql便成为了如下，查询出所有的登陆用户。

```sql
select * from users
```
其实上面的sql注入只是在参数层面做了些手脚，如果是引入了一些功能性的sql那就更危险了，比如上面的登陆接口，如果用户名使用这个“' or 1=1;delete * from users; #”，那么在";"之后相当于是另外一条新的sql，这个sql是删除全表，是非常危险的操作，因此sql注入这种还是需要特别注意的。
# 解决sql注入
## sql预编译
### MySQL的预编译
在服务器启动时，mysql client把sql语句模板（变量采用占位符）发给mysql服务器，mysql服务器对sql语句模板进行编译，编译之后根据语句的优化分析对相应的索引进行优化，在最终绑定参数时把相应的参数传送给mysql服务器，直接执行，节省了sql查询时间，以及mysql服务器的资源，达到一次编译、多次执行的目的，除此之外，还可以防止SQL注入。

## 何时真正防止SQL注入
当将绑定的参数传到mysql服务器，mysql服务器对参数进行编译，即填充到相应的占位符的过程中，做了转义操作。
Java 的 jdbc就有预编译功能，不仅提升性能，而且防止sql注入。
```sql
String sql = "select id, no from user where id=?";
PreparedStatement ps = conn.prepareStatement(sql);
ps.setInt(1, id);
ps.executeQuery();
```

### 严格的参数校验
在一些不该有特殊字符的参数中提前进行特殊字符校验即可。

### 框架支持-mybatis

mybatis就能很好的完成对sql注入的预防，如下两个mapper文件，前者就可以预防，而后者不行。

```xml
<select id="selectByNameAndPassword" parameterType="java.util.Map" resultMap="BaseResultMap">
select id, username, password, role
from user
where username = #{username,jdbcType=VARCHAR}
and password = #{password,jdbcType=VARCHAR}
</select>

<select id="selectByNameAndPassword" parameterType="java.util.Map" resultMap="BaseResultMap">
select id, username, password, role
from user
where username = ${username,jdbcType=VARCHAR}
and password = ${password,jdbcType=VARCHAR}
</select>
```

#将传入的数据都当成一个字符串，会对自动传入的数据加一个双引号。
如: `where username=#{username}`，如果传入的值是111,那么解析成sql时的值为`where username="111"`, 如果传入的值是id，则解析成的sql为

```sql
where username="id"
```
如果传入的值是111,那么解析成sql时的值为where username=111；如果传入的值是;drop table user;，则解析成的sql为：select id, username, password, role from user where username=;drop table user;

# 总结
如果不是真的要执行功能型的sql如删除表、创建表等，还是需要用#来避免sql注入。mybatis底层还是使用jdbc的预编译功能。
