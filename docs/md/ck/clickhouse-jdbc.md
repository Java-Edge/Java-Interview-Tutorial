# clickhouse-jdbc 驱动

ClickHouse 有两种 JDBC 驱动实现。

## 0 主要区别

### 驱动类加载路径不同

- ru.yandex.clickhouse.ClickHouseDriver
- com.github.housepower.jdbc.ClickHouseDriver

### 默认连接端口不同

分别为 8123 和 9000（但经过测试，却是相反的）

### 连接协议不同

官方驱动使用 HTTP 协议，而三方驱动使用 TCP 协议

## 1 官方驱动：pom 依赖

只能使用 9000 端口

```xml
<dependency>
    <groupId>ru.yandex.clickhouse</groupId>
    <artifactId>clickhouse-jdbc</artifactId>
    <version>0.3.1</version>
</dependency>
```

版本推荐0.3，因为0.4要 JDK 17。

有些版本`com.clickhouse.jdbc.*` 包含了 ru.yandex.clickhouse.ClickHouseDriver。所以在加载包的时候一定要注意导入的包名。其实就是0.3有这个问题。

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

/**

 * 使用JDBC连接clickhouse
 * 官方驱动：ru.yandex.clickhouse.ClickHouseDriver 只能使用9000端口
   */
    public class clickhouseJDBC {
   public static void main(String[] args) {
       try {
           Class.forName("ru.yandex.clickhouse.ClickHouseDriver");
           String url = "jdbc:clickhouse://192.168.52.140:9000/default";
           String user = "default";
           String password = "";
           Connection conn = DriverManager.getConnection(url, user, password);
           Statement stmt = conn.createStatement();
           ResultSet rs = stmt.executeQuery("select * from default.smt_table");
           while (rs.next()){
               System.out.println(rs.getString(1));
       } catch (Exception e) {
           e.printStackTrace();
       }
   }
}
```



## 2 第三方驱动：pom 依赖

使用 8213 或 9000 端口都可连接

```xml
<!--驱动为com.github.housepower.jdbc.ClickHouseDriver-->
<dependency>
    <groupId>com.github.housepower</groupId>
    <artifactId>clickhouse-native-jdbc</artifactId>
    <version>1.6-stable</version>
</dependency>

```



```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

/**

 * 使用JDBC连接clickhouse
 * 三方提供的驱动：com.github.housepower.jdbc.ClickHouseDriver 使用8213或者9000端口都可以连接
   */
   public class clickhouseJDBC1 {
   public static void main(String[] args) {
       try {
           Class.forName("com.github.housepower.jdbc.ClickHouseDriver");
           String url = "jdbc:clickhouse://192.168.52.140:8123/default";
           String user = "default";
           String password = "";
           Connection conn = DriverManager.getConnection(url, user, password);
           Statement stmt = conn.createStatement();
           ResultSet rs = stmt.executeQuery("select * from default.smt_table");
           while (rs.next()){
               System.out.println(rs.getString(1));
           }
       } catch (Exception e) {
           e.printStackTrace();
       }
   }
   }

```

```xml
<!--        不支持自动分配 sessionid，无法使用-->
<!--        <dependency>-->
<!--            <groupId>ru.yandex.clickhouse</groupId>-->
<!--            <artifactId>clickhouse-jdbc</artifactId>-->
<!--            <version>0.3.2</version>-->
<!--        </dependency>-->
```

参考：

- https://clickhouse.com/docs/en/integrations/java#jdbc-driver