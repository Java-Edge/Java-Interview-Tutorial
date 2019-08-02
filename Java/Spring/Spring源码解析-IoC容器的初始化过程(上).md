严格来说,容器的初始化过程主要包括
 - BeanDefinition的Resource定位
 - BeanDefinition的载入和解析
 - BeanDefinition在容器中的注册

在初始化的过程当中,我们会看到一个又一个的方法被调用,换句话说,其实是通过调用一些方法来完成IoC容器初始化的.

`refresh()方法`,其实标志**容器初始化过程的正式启动**.

Spring之所以把这三个基本过程分开,并使用不同模块
如使用相应的**ResourceLoader**、**BeanDefinitionReader**等模块,是因为这样可以让用户更灵活地对这三个过程进行裁剪或扩展,定义出最适合自己的IoC容器的初始化过程.
#  1 BeanDefinition的Resource定位
**BeanDefinition**
从字面上理解,它代表着Bean的定义.
其实,它就是完整的描述了在Spring配置文件中定义的节点中的所有信息,包括各种子节点.
不太恰当地说,我们可以把它理解为配置文件中一个个<bean></bean>节点所包含的信息


在**ApplicationContext**中,Spring已经为我们提供了一系列加载不同Resource的读取器的实现**DefaultListableBeanFactory**只是一个纯粹的IoC容器,需要为它提供特定的读取器才能完成这些功能.
但使用**DefaultListableBeanFactory**这种更底层的容器能提高定制IoC容器的灵活性.

至于常用的**ApplicationContext**见名知义,如
- **FileSystemXmlApplicationContext**
- **ClassPathXmlApplicationContext**
- **XmlWebApplicationContext**
- ...

下面将以**FileSystemXmlApplicationContext**为例,分析怎么完成Resource定位
![ApplicationContext继承体系](http://upload-images.jianshu.io/upload_images/4685968-28e4fd8babdb5881.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
从实现角度,我们近距离关心以**FileSystemXmlApplicationContext**为核心的继承体系
![](http://upload-images.jianshu.io/upload_images/4685968-7cd374f07190bbf7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
package org.springframework.context.support;

public class FileSystemXmlApplicationContext extends AbstractXmlApplicationContext {

    public FileSystemXmlApplicationContext() {
    }

    // @param 父上下文
    public FileSystemXmlApplicationContext(ApplicationContext parent) {
        super(parent);
    }
 
    // 这个构造函数的configLocation包含BeanDefinition所在的文件路径
    public FileSystemXmlApplicationContext(String configLocation) throws BeansException {
        this(new String[] {configLocation}, true, null);
    }

    // 这个构造函数允许configLocation包含多个BeanDefinition的文件路径
    public FileSystemXmlApplicationContext(String... configLocations) throws BeansException {
        this(configLocations, true, null);
    }

    
    // 这个构造函数允许configLocation包含多个BeanDefinition的文件路径的同时
    // 还允许指定自己的双亲IoC容器
    public FileSystemXmlApplicationContext(String[] configLocations, ApplicationContext parent) throws BeansException {
        this(configLocations, true, parent);
    }

    public FileSystemXmlApplicationContext(String[] configLocations, boolean refresh) throws BeansException {
        this(configLocations, refresh, null);
    }

    // 在对象的初始化过程中,调用refresh方法载入BeanDefinition,这个refresh启动了
    // BeanDefinition的载入过程,我们会在下面详解
    public FileSystemXmlApplicationContext(String[] configLocations, boolean refresh, ApplicationContext parent)
            throws BeansException {

        super(parent);
        setConfigLocations(configLocations);
        if (refresh) {
            refresh();
        }
    }

    // 这是应用于文件系统的Resourse的实现,通过构造一个FileSystemResource得到一个在文件系统中定位的BeanDefinition
    // 这个getResourceByPath是在BeanDefinitionReader中被调用的
    // loadBeanDefinition采用了模板模式,具体的定位实现实际上是由各个子类完成的
    @Override
    protected Resource getResourceByPath(String path) {
        if (path != null && path.startsWith("/")) {
            path = path.substring(1);
        }
        return new FileSystemResource(path);
    }
}
```
 我们可以发现，在FileSystemXmlApplicationContext中不管调用哪个构造函数，最终都是会调用这个包含了refresh方法的构造函数，因此我们可以很容易得出结论：触发对`BeanDefinition`资源定位过程的`refresh`的调用是在`FileSystemXmlApplicationContext`的构造函数中启动的.
![](http://upload-images.jianshu.io/upload_images/4685968-5635a0bc0b268228?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
 根据上图及**FileSystemXmlApplicationContext**中含有***refresh()***方法的构造函数的分析,可清楚地看到整个**BeanDefinition**资源定位的过程.
该过程最初是由***refresh()***触发,而***refresh()***的调用是在**FileSystemXmlApplicationContext**的构造函数中启动的,大致调用过程如下图
![](http://upload-images.jianshu.io/upload_images/4685968-18bf13dff31cd6e6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
看了调用过程,我们可能好奇这个`FileSystemXmlAppplicationContext`在什么地方定义了`BeanDefinition`的读入器`BeanDefinitionReader`的呢?
关于这个读入器的配置,我们到其基类  `AbstractRefreshableApplicationContext`  的 ` refreshBeanFactory()  `方法看看
![](http://upload-images.jianshu.io/upload_images/4685968-eef2f481155ad199?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
刚才我们提到,***refresh()***的调用是在**FileSystemXmlApplicationContext**的构造函数中启动的
而这个***refresh()***又是从**AbstractApplicationContext**继承而来
因此,结合前面方法时序图知***refreshBeanFactory()***被**FileSystemXmlApplicationContext**构造函数中的***refresh()***调用.
在这个方法（***refreshBeanFactory()***）中，通过***createBeanFactory()***构建了一个容器供**ApplicationContext**使用.
这个容器就是前面我们提到的**DefaultListableBeanFactory**,同时它还启动了***loadBeanDefinition()***来载入**BeanDefinition**,这里和以编程式使用IoC容器的过程很相似
在**AbstractRefreshableApplictionContext**中,这里是使用**BeanDefinitionReader**载入Bean定义的地方,因为允许有多种载入方式,这里通过一个抽象函数把具体的实现委托给子类完成

从前面的方法调用栈可以发现***refreshBeanFactory***方法中调用的***loadBeanDefinitions***方法其实最终是调用**AbstractBeanDefinitionReader**里面的***loadBeanDefinitions***方法
![](http://upload-images.jianshu.io/upload_images/4685968-60cb490082e9b896.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
对于取得**Resource**的具体过程，我们来看看`DefaultResourceLoader`怎样完成
![](http://upload-images.jianshu.io/upload_images/4685968-bcb69b628fc42ae2?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
上图中 `getResourcePath()`将会被`FileSystemXmlApplicationContext`实现.
该方法返回的是一个`FileSystemResource`对象,通过这个对象,Spring可以进行相关的I/O操作,完成`BeanDefinition`的定位.

如果是其他的`ApplicationContext`,那么会对应生成其他种类的`Resource`，比如`ClassPathResource`、`ServletContextResource`等

所以**BeanDefinition**的定位到这里就完成了.
在**BeanDefinition**定位完成的基础上,就可以通过返回的**Resource**对象进行**BeanDefinition**的载入了.
在定位过程完成后,为**BeanDefinition**的载入创造了I/O操作的条件,但具体的数据还没有开始读入.这些读入将在下面介绍的**BeanDefinition**的载入和解析中来完成.

























































