#目录
![](http://upload-images.jianshu.io/upload_images/4685968-34f845d539264d16.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/4685968-2dcb1f1680786bc9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#无SpringMVC全局异常时的流程图
![](http://upload-images.jianshu.io/upload_images/4685968-11e86660294cec5c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#SpringMVC全局异常流程图
![其实是一个ModelAndView对象](http://upload-images.jianshu.io/upload_images/4685968-29cfa37601caf919.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#配置文件
```java
applicationcontext.xml

<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:aop="http://www.springframework.org/schema/aop"
       xmlns:tx="http://www.springframework.org/schema/tx" xmlns:jdbc="http://www.springframework.org/schema/jdbc"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:task="http://www.springframework.org/schema/task"
       xsi:schemaLocation="http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd
     http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
     http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx.xsd
     http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop.xsd http://www.springframework.org/schema/task http://www.springframework.org/schema/task/spring-task.xsd">

    <context:component-scan base-package="com.mmall">
        <!-- 扫描controller的职责交给dispatcher-servlet.xml,所以排除 -->
        <context:exclude-filter type="annotation" expression="org.springframework.stereotype.Controller" />
    </context:component-scan>

    <aop:aspectj-autoproxy/>

    <!-- spring schedule -->
    <context:property-placeholder location="classpath:datasource.properties"/>
    <task:annotation-driven/>

    <import resource="applicationContext-spring-session.xml"/>
    <import resource="applicationContext-datasource.xml"/>

</beans>
```

```java
dispacher-servlet.xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:p="http://www.springframework.org/schema/p"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc" xmlns:aop="http://www.springframework.org/schema/aop"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
	http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd
	http://www.springframework.org/schema/mvc
	http://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <!-- springmvc扫描包指定到controller，防止重复扫描 -->
    <context:component-scan base-package="com.mmall.controller" annotation-config="true" use-default-filters="false">
        <context:include-filter type="annotation" expression="org.springframework.stereotype.Controller"/>
    </context:component-scan>

    <mvc:annotation-driven>
        <mvc:message-converters>
            <bean class="org.springframework.http.converter.StringHttpMessageConverter">
                <property name="supportedMediaTypes">
                    <list>
                        <value>text/plain;charset=UTF-8</value>
                        <value>text/html;charset=UTF-8</value>
                    </list>
                </property>
            </bean>
            <bean class="org.springframework.http.converter.json.MappingJacksonHttpMessageConverter">
                <property name="supportedMediaTypes">
                    <list>
                        <value>application/json;charset=UTF-8</value>
                    </list>
                </property>
            </bean>
        </mvc:message-converters>
    </mvc:annotation-driven>
    
    <mvc:interceptors>
        <!-- 定义在这里的，所有的都会拦截-->
        <mvc:interceptor>
            <!--manage/a.do  /manage/*-->
            <!--manage/b.do  /manage/*-->
            <!--manage/product/save.do /manage/**-->
            <!--manage/order/detail.do /manage/**-->
            <mvc:mapping path="/manage/**"/>
            <!--<mvc:exclude-mapping path="/manage/user/login.do"/>-->
            <bean class="com.mmall.controller.common.interceptor.AuthorityInterceptor" />
        </mvc:interceptor>

    </mvc:interceptors>
</beans>

```
