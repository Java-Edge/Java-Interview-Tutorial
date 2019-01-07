![](https://upload-images.jianshu.io/upload_images/4685968-5df25ffdb579daec.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 1 搭建
先看 pom 文件
```
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.mmall</groupId>
	<artifactId>demo2</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>war</packaging>

	<name>demo2</name>
	<description>Demo project for Apache Shiro</description>

	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>1.5.6.RELEASE</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
		<java.version>1.8</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>

		<dependency>
			<groupId>org.mybatis.spring.boot</groupId>
			<artifactId>mybatis-spring-boot-starter</artifactId>
			<version>1.3.1</version>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>mysql</groupId>
			<artifactId>mysql-connector-java</artifactId>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-tomcat</artifactId>
			<scope>provided</scope>
		</dependency>
		<dependency>
			<groupId>org.apache.shiro</groupId>
			<artifactId>shiro-core</artifactId>
			<version>1.2.3</version>
		</dependency>
		<dependency>
			<groupId>org.apache.shiro</groupId>
			<artifactId>shiro-spring</artifactId>
			<version>1.2.3</version>
		</dependency>
		<dependency>
			<groupId>com.alibaba</groupId>
			<artifactId>druid</artifactId>
			<version>1.0.20</version>
		</dependency>
		<dependency>
			<groupId>org.apache.commons</groupId>
			<artifactId>commons-lang3</artifactId>
			<version>3.4</version>
		</dependency>
		<dependency>
			<groupId>org.springframework</groupId>
			<artifactId>spring-context-support</artifactId>
			<version>4.2.3.RELEASE</version>
		</dependency>

		<dependency>
			<groupId>org.apache.tomcat.embed</groupId>
			<artifactId>tomcat-embed-jasper</artifactId>
		</dependency>

		<dependency>
			<groupId>javax.servlet</groupId>
			<artifactId>javax.servlet-api</artifactId>
		</dependency>
		<dependency>
			<groupId>javax.servlet</groupId>
			<artifactId>jstl</artifactId>
		</dependency>
	</dependencies>


	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>


</project>
```
# 2 连接数据库与配置 mybatis
## 新建各种 model 基本类
![](https://upload-images.jianshu.io/upload_images/4685968-76ad7482b35d120d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-1594522ca374a5f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-bcd439e66d20005f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 数据库层接口
![](https://upload-images.jianshu.io/upload_images/4685968-094e8eeed0d57417.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 服务层实现 
![](https://upload-images.jianshu.io/upload_images/4685968-638c56c4fdb68350.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-deb25212fc3011ab.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- mapper 文件
![](https://upload-images.jianshu.io/upload_images/4685968-68a050282b9ef633.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 数据库建表
![](https://upload-images.jianshu.io/upload_images/4685968-16da42afd63a042b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-46417b0792f280a5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/4685968-4c78fe3aeca93ba7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7d27b7266e2710f0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/4685968-e911cb2ca5b5af8b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-4ade42ebb9c0acb1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/4685968-921be08b6ea890a8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-6f98c2f1df0ba1a6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 权限管理实际操作1
Realm 实现类
![](https://upload-images.jianshu.io/upload_images/4685968-8fefdebcb4783f02.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
密码转换验证类
![](https://upload-images.jianshu.io/upload_images/4685968-84b0b3d0c7252d19.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
配置类
![](https://upload-images.jianshu.io/upload_images/4685968-95589395519c9e0a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#  权限管理实际操作2
![登录页面](https://upload-images.jianshu.io/upload_images/4685968-b5e27b78714732f5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![首页](https://upload-images.jianshu.io/upload_images/4685968-244f5fe1514741d8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
