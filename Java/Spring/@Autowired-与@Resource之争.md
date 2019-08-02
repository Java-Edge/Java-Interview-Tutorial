# 1  共同点
- 都可以用来装配bean.
- 都可以写在字段上
- 或写在setter方法上


# 2 @Autowired 默认按 类型 装配（该注解是属Spring）
默认要求依赖对象必须存在，如果要允许`null`值，可以设置它的`required`属性为`false`
```
@Autowired(required=false) 
```

若我们想使用名称装配可以结合`@Qualifier`注解一起食用，如下：
```
@Autowired() @Qualifier("baseDao")    
private BaseDao baseDao;
```

# 3 @Resource 默认按 名称 装配(JDK1.6开始支持的注解)
## 名称可以通过name属性进行指定
若没有指定`name`属性
- 当注解写在字段上时，默认取字段名，按照名称查找
- 如果注解写在setter方法上默认取属性名进行装配
- 当找不到与名称匹配的bean时才按照类型进行装配

> name属性一旦指定，就只会按照名称进行装配。

只不过注解处理器我们使用的是Spring提供的，是一样的，无所谓解耦不解耦的说法，两个在便利程度上是等同的。
```
@Resource(name="baseDao")    
private BaseDao baseDao; 

```

> **byName** 通过参数名自动装配，如果一个bean的name 和另外一个bean的 property 相同，就自动装配
**byType** 通过参数的数据类型自动自动装配，如果一个bean的数据类型和另外一个bean的property属性的数据类型兼容，就自动装配

-----------------------------------------------------------------------------------------------------------------------------------------

# 4 实例
我们可以通过 @Autowired / @Resource 在 Bean 类中使用自动注入功能
但是 Bean 一般还是需要在 XML 文件中通过 <bean> 进行定义 —— 也就是说，在 XML 配置文件中定义 Bean，通过@Autowired 或 @Resource 为 Bean 的成员变量、方法入参或构造函数入参提供自动注入的功能。

- 比如下面的beans.xml
![](https://upload-images.jianshu.io/upload_images/16782311-33b1fe625f560db1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-bdeeb0703bbb23c1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


定义了三个bean对象，但是没有了我们所述的的ref指向的内容,如下
![](https://upload-images.jianshu.io/upload_images/16782311-418ad4fdc7435ca7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


-------------------------------------------------------------------------------------------------------

# 5 区别
spring2.5提供了基于注解的配置，可以通过注解的方式来完成注入依赖
在Java代码中可以使用 `@Resource`或者`@Autowired`注解方式来进行注入

但它们之间是有区别的

## 5.1 首先来看一下：
- @Resource默认是按照名称来装配注入的，只有当找不到与名称匹配的bean才会按照类型来装配注入
- @Autowired默认是按照类型装配注入的，如果想按照名称来转配注入，则需要结合`@Qualifier`一起使用
- @Resource注解是由JDK提供，而@Autowired是由Spring提供
- @Resource和@Autowired都可以书写标注在字段或者该字段的setter方法之上

## 5.2 使用注解的方式
- 我们需要修改spring配置文件的头信息
![](https://upload-images.jianshu.io/upload_images/16782311-7f4ed6eba0ca5725.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



- 在基于注解方式配置Spring的配置文件中，你可能会见到
![](https://upload-images.jianshu.io/upload_images/16782311-3f2f1c60a46edb16.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 他的作用是式地向 Spring 容器注册
```
AutowiredAnnotationBeanPostProcessor
CommonAnnotationBeanPostProcessor
PersistenceAnnotationBeanPostProcessor
RequiredAnnotationBeanPostProcessor
```

注册这4个BeanPostProcessor的作用，就是为了你的系统能够识别相应的注解。

例如：

要使用@Autowired，就必须事先在 Spring 容器中声明 `AutowiredAnnotationBeanPostProcessor Bean`

传统声明方式如下
```
<bean class="org.springframework.beans.factory.annotation. AutowiredAnnotationBeanPostProcessor "/> 
```

要使用@ Resource 、@ PostConstruct、@ PreDestroy等注解就必须声明`CommonAnnotationBeanPostProcessor`
```
<bean class="org.springframework.beans.factory.annotation. CommonAnnotationBeanPostProcessor"/> 
```

要使用@PersistenceContext注解，就必须声明`PersistenceAnnotationBeanPostProcessor`的
```
<bean class="org.springframework.beans.factory.annotation.PersistenceAnnotationBeanPostProcessor"/> 
```

要使用 @Required的注解，就必须声明`RequiredAnnotationBeanPostProcessor`
```
<bean class="org.springframework.beans.factory.annotation.RequiredAnnotationBeanPostProcessor"/> 
```

一般来说，这些注解我们还是比较常用，尤其是`Antowired`，在自动注入的时候更是经常使用，所以如果总是需要按照传统的方式一条一条配置显得有些繁琐和没有必要
于是spring给我们提供`<context:annotation-config/>`的简化配置方式，自动帮你完成声明

不过,都2019了,我们一般都会配置`包扫描路径`选项
```
<context:component-scan base-package=”XX.XX”/>
```
该配置项其实也包含了自动注入上述processor的功能，可以将 `<context:annotation-config/> `移除了.

**比如：**

```
<context:component-scan base-package="carPoolingController, carPoolingService, carPoolingDao" />

```
就把controller包下 service包下 dao包下的注解全部扫描了


## 5.3 修改以上配置文件的头信息后，我们就可以在Java代码通过注解方式来注入bean
看下面代码
### 5.3.1 @Resource

```
public class StudentService3 implements IStudentService {
    //@Resource(name="studentDao")放在此处也是可行的
    private IStudentDao studentDao;

    private String id;

    public void setId(String id) {
    this.id = id;
    }
}
```

@Resource(name="studentDao") // 通过此注解完成从spring配置文件中查找名称为studentDao的bean来装配字段studentDao，如果spring配置文件中不存在 studentDao名称的bean则转向按照bean类型进行查找
```
public void setStudentDao(IStudentDao studentDao) {
        this.studentDao = studentDao;
}
public void saveStudent() {
        studentDao.saveStudent();
        System.out.print(",ID 为："+id);
}
```

配置文件添加如下信息

```
<bean id="studentDao" class="com.sss.dao.impl.StudentDao"></bean>
<bean id="studentService3" class="com.sss.service.impl.StudentService3"></bean>

```

### 5.3.2 @Autowired

```
public class StudentService3 implements IStudentService {
  //@Autowired放在此处也是可行的
  private IStudentDao studentDao;

  private String id;

  public void setId(String id) {
       this.id = id;
   }

```
通过此注解完成从spring配置文件中 查找满足studentDao类型的bean
@Qualifier("studentDao")则按照名称经行来查找转配的

```
 public void setStudentDao(IStudentDao studentDao) {
       this.studentDao = studentDao;
  }

  public void saveStudent() {
       studentDao.saveStudent();
       System.out.print(",ID 为："+id);
  }
}

```

配置文件添加如下信息

```
<bean id="studentDao" class="com.wch.dao.impl.StudentDao"></bean>
<bean id="studentService3" class="com.wch.service.impl.StudentService3" />

```
--------------------------

> 当我们在xml里面为类配置注入对象时，会发现xml文件会越来越臃肿，维护起来很麻烦
这时候我们可以使用注解这种机制来为类配置注入对象。

**原生java为我们提供了 javax.annotation.Resource这个注解。**

**spring框架提供了org.springframework.beans.factory.annotation.Autowired。**

一般情况下我们使用 javax.annotation.Resource这个注解，因为这样我们就能实现和spring框架的解藕（不过注解处理器还是Spring提供的）。

# @Resource可以作用于字段和函数上
## 当作用于字段上的时候
如果我们只是简单的这样写

```
@Resource
PersonDao  p;

```

这时候spring注入p的过程是 
- 查找xml中是否有id为p的元素
- 如果没有找到，则看是否有name属性（@Resource name=“”），有则查找name
- 否则查找PersonDao类型的元素

## @Resource可作用于set函数上。
例如：
```
@Resource
public void setP(PersonDao p) {
  this.p = p;
}

```
@Autowired注解是根据类型进行查找，比如PersonDao p，他会去xml文件里查找类型为PersonDao的元素
