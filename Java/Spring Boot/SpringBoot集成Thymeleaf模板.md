#1 创建一个maven工程，这个应该都会
#2 pom文件加入下面内容即可(版本号自己改

```
    <parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>1.5.4.RELEASE</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

    <dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-thymeleaf</artifactId>
	</dependency>
```
#3 写一个入口类
#4 写个home.html
#5 在工程的resources目录下创建一个application.properties文件，这个文件是spring-boot用来配置一些工程属性用的

```
# 配置服务器端口，默认是8080，可以不用配置
server.port=8080
# 模板配置
# 这个开发配置为false，避免改了模板还要重启服务器
spring.thymeleaf.cache=false
# 这个是配置模板路径的，默认就是templates，可不用配置
spring.thymeleaf.prefix=classpath:/templates/
# 这个可以不配置，检查模板位置
spring.thymeleaf.check-template-location=true
# 下面3个不做解释了，可以不配置
spring.thymeleaf.suffix=.html
spring.thymeleaf.encoding=UTF-8
spring.thymeleaf.content-type=text/html

# 模板的模式
spring.thymeleaf.mode=HTML5

```










