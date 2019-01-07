
本章学习Feign,包括Feign的自定义配置,实现文件上传,进一步实现代码的重用,Feign性能优化,Feign与RestTemplate的对比与选择.

# 1 使用Feign实现远程HTTP调用
- Feign是Netflix开源的声明式HTTP客户端
![](https://img-blog.csdnimg.cn/20191025204118757.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 添加依赖
![在这里插入图片描述](https://img-blog.csdnimg.cn/20191025204952758.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191025205145890.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 新建包及接口
![](https://img-blog.csdnimg.cn/20191025210841456.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 服务实现类![](https://img-blog.csdnimg.cn/20191025210953205.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191025211050630.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 2 Feign的组成
 ![](https://img-blog.csdnimg.cn/20191025212258599.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
 - 查找![](https://img-blog.csdnimg.cn/20191025212925964.png)
1. 默认的Feign : 使用的URLConnection性能差
![](https://img-blog.csdnimg.cn/20191025213120656.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
2. 和ribbon配合的 : 使用了代理模式,其实也就是feign-default的代理
![](https://img-blog.csdnimg.cn/20191025213405205.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
3. contract
由于feign默认的注解是非Spring MVC型的
![](https://img-blog.csdnimg.cn/20191027120749386.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 通过该默认类实现了MVC注解
![](https://img-blog.csdnimg.cn/20191027120948785.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 细粒度配置自定义
默认的Feign是不打印日志的

- 自定义Feign日志级别
![](https://img-blog.csdnimg.cn/20191027122742733.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

下面将设置为FULL级别

## Java代码方式 - 指定日志级别
- 接口类
![](https://img-blog.csdnimg.cn/20191027123311391.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 日志配置类![](https://img-blog.csdnimg.cn/20191027123458373.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 配置文件
![](https://img-blog.csdnimg.cn/20191027124148687.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 注意坑,如果在feign配置类加了该注解,就必须放在compscan包以外,以免复制上下文重复扫描问题
![](https://img-blog.csdnimg.cn/20191027124609675.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)


## 配置属性方式 - 指定日志级别
将之前的Java配置类的注解注释掉

- 配置文件
![](https://img-blog.csdnimg.cn/20191027133543532.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 全局配置
### Java代码方式 - 指定日志级别
◆ ~~方式一:让父子上下文ComponentScan重叠(强烈不建议使用)~~ 
◆ 方式二[唯一正确的途径] :
`@EnableFeignClients(defaultConfiguration=xxx.class)`

- 先将之前的细粒度配置注释掉!
![](https://img-blog.csdnimg.cn/20191027133816550.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 找到启动类的EFC注解并指定为配置类
![](https://img-blog.csdnimg.cn/20191027134017297.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

### 配置属性方式 - 指定日志级别
- 恢复之前的配置文件信息并修改如下
![](https://img-blog.csdnimg.cn/20191027134547582.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 支持的配置项
- 代码方式

![](https://img-blog.csdnimg.cn/20191027134719207.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 属性方式
![](https://img-blog.csdnimg.cn/2019102713474860.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 配置最佳实践总结
- Ribbon配置 VS Feigne配置
![](https://img-blog.csdnimg.cn/20191027134923667.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- Feign代码方式 VS 属性方式
![](https://img-blog.csdnimg.cn/2019102713531191.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 最佳实践
- 尽量使用属性配置,属性方式实现不了的情况下再考虑用代码配置
- 在同一个微服务内尽量保持单一性,比如统一使用属性配置,不要两种方式混用,增加定位代码的复杂性


# Feign的继承
- UserCenter中的
![](https://img-blog.csdnimg.cn/20191027135557829.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- ContentCenter中的,使其继承上面的代码
![](https://img-blog.csdnimg.cn/20191027135645564.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 关于继承特性的争议
◆ 官方观点:不建议使用
![](https://img-blog.csdnimg.cn/2019102714012733.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
这里继承会产生紧耦合

◆  业界观点:很多公司使用
比如User服务修改了字段,而Content服务却不知道,没有修改,那么调用时就会报错
◆ 个人观点:权衡利弊

此处有争议,不赘述



# 多参数请求构造
比如在User服务中有这样一个请求
![](https://img-blog.csdnimg.cn/20191027140548743.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191027140624824.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
那么如何使用Feign去请求这样的API呢?

回到Content服务,写代码
- 写一测试类
![](https://img-blog.csdnimg.cn/20191027140816898.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 在测试启动类添加该测试项目
![](https://img-blog.csdnimg.cn/20191027140927640.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 启动报错,根据error提示,添加配置,之后正常启动!
![](https://img-blog.csdnimg.cn/20191027141047829.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

因为现在有两个client都叫user-client(测试类也叫user-client), 重名了,所以Spring创建代理时会有问题,加上上述配置即可解决 

- 但是此刻这样访问依旧报错405![](https://img-blog.csdnimg.cn/2019102714135827.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- Feign端服务代码, 还需要添加注解
![](https://img-blog.csdnimg.cn/20191027141502901.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 推荐阅读
[如何使用Feign构造多参数的请求](https://www.imooc.com/article/289000#comment)
# Feign脱离Ribbon使用
在Content服务写代码
![](https://img-blog.csdnimg.cn/20191027142226295.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 测试类添加测试项目
![](https://img-blog.csdnimg.cn/20191027142454193.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 直接访问即可!

# RestTemplate VS Feign
![](https://img-blog.csdnimg.cn/2019102717150224.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 如何选择?
◆ 原则:尽量用Feign ,杜绝使用RestTemplate
◆ 事无绝对，合理选择


# Feign性能优化
## 连接池 [提升15%左右]
- 添加依赖
![](https://img-blog.csdnimg.cn/20191027171924743.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 配置文件
![](https://img-blog.csdnimg.cn/20191027172059880.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
> 使用okhttp同理配置如上两步骤

## 日志级别
因为默认不打印日志哦!建议设置为basic,不要为full哦

# 常见问题总结 - 推荐阅读
[Feign常见问题总结](https://www.imooc.com/article/289005)

# 现有架构总结
![](https://img-blog.csdnimg.cn/20191027172518256.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 参考
Open Feign官网