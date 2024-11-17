# 01-Seata客户端依赖坐标引入与踩坑排雷

## 1 官方推荐配置

spring-cloud-starter-alibaba-seata推荐依赖配置方式

```xml
<dependency>
    <groupId>io.seata</groupId>
    <artifactId>seata-spring-boot-starter</artifactId>
    <version>1.5.2</version>
</dependency>

<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
    <version>最新版本</version>
    <exclusions>
        <exclusion>
            <groupId>io.seata</groupId>
            <artifactId>seata-spring-boot-starter</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

为啥这样呢？先看

## 2 逆官网配置



```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
</dependency>
```

刷新 maven，可见依赖的 1.4.2 版本：

![](https://img-blog.csdnimg.cn/85457daeaa47488bb50c2427475118b8.png)

## 3 调整路线

但我们要用最新 1.5.2 版本，就要调整，先排除原有依赖：

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
    <exclusions>
        <exclusion>
            <groupId>io.seata</groupId>
            <artifactId>seata-spring-boot-starter</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

再加段配置：

```xml
<dependency>
    <groupId>io.seata</groupId>
    <artifactId>seata-spring-boot-starter</artifactId>
    <version>1.5.2</version>
</dependency>
```

完成：

![](https://img-blog.csdnimg.cn/57121382a3dd450ab1a76c66a3a9bdbd.png)

