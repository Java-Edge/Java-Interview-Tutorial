- 订单服务源码
https://github.com/Wasabi1234/SpringCloud_OrderDemo
- 商品服务源码
https://github.com/Wasabi1234/SpringCloud_ProductDemo
![](https://upload-images.jianshu.io/upload_images/4685968-ad371531c6d8285c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##注册中心Eureka Server
![新建项目](https://upload-images.jianshu.io/upload_images/4685968-5a71804525ced7aa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
使用`@EnableEurekaServer`
![](https://upload-images.jianshu.io/upload_images/4685968-8f872f99b4f4ee78.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
就可以让应用变为Eureka服务器，这是因为spring boot封装了Eureka Server，让你可以嵌入到应用中直接使用
直接运行成功如下
![](https://upload-images.jianshu.io/upload_images/4685968-b71a68b2ab5fa2c5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
但是不断报异常,why?
![](https://upload-images.jianshu.io/upload_images/4685968-ffff1cc04f1e8dae.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这是因为该应用虽然是 Server 端,但也同时是 Client 端,也需要一个注册中心将自己注册进去
为消除其异常,修改下配置
配置需要注册的地址,也就是往自己身上注册
![](https://upload-images.jianshu.io/upload_images/4685968-5444a86900c252ec.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
通过观察源码,知道其实是一个 map, 所以配置如下
![](https://upload-images.jianshu.io/upload_images/4685968-a8bef88b3212cbae.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
启动仍旧报错,其实正常问题,因为服务端自己又是 Server, 又是 Client, 服务端未启动完成时,客户端肯定是无法找到服务端的
但是 eureka 的服务端/客户端采用心跳通信方式
![](https://upload-images.jianshu.io/upload_images/4685968-8490f8c61a8437d5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
可看到地址已随配置被改变

接下来配置实例名
![](https://upload-images.jianshu.io/upload_images/4685968-b3c897df2e1a808d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![实例名被修改成功](https://upload-images.jianshu.io/upload_images/4685968-a5e87119a55b8331.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
但是该应用本身就是个注册中心,不需要将其显示在注册实例中,通过以下配置
![](https://upload-images.jianshu.io/upload_images/4685968-4d01658c06938041.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
为防止冲突,将端口号回改为默认
![](https://upload-images.jianshu.io/upload_images/4685968-529e7846d3eebe19.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a3f5ec7b14ad4818.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##服务中心
![](https://upload-images.jianshu.io/upload_images/4685968-d7357881e6753775.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
为避免每次手动启动,将应用打成 war 包(jar)
![](https://upload-images.jianshu.io/upload_images/4685968-ca3cbad66bc521ff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![通过 java 命令启动](https://upload-images.jianshu.io/upload_images/4685968-e12123e91852144e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![启动成功效果](https://upload-images.jianshu.io/upload_images/4685968-45a0ad8761acf47f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![Mac 下 Ctrl+C 退出服务](https://upload-images.jianshu.io/upload_images/4685968-f6dc9b1b90c1a948.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![后台执行](https://upload-images.jianshu.io/upload_images/4685968-4ddcc8bd748bf6b5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![查看其相关进程信息](https://upload-images.jianshu.io/upload_images/4685968-5c4b493f78c0dd91.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
如此该应用就方便了我们,不需要每次都去手动启动应用,在后台会重启,若想杀死进程直接 kill
![](https://upload-images.jianshu.io/upload_images/4685968-16b1e4b0e40b0199.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 3.3 Eureka Client的使用
![](https://upload-images.jianshu.io/upload_images/4685968-ee8af491e5a312a5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- `@EnableDiscoveryClient`注解
这通过`META-INF/spring.factories`查找`DiscoveryClient`接口的实现
Discovery Client的实现将在`org.springframework.cloud.client.discovery.EnableDiscoveryClient`键下的`spring.factories`中添加一个配置类。
`DiscoveryClient`实现的示例是[Spring Cloud Netflix Eureka](http://cloud.spring.io/spring-cloud-netflix/)，[Spring Cloud Consul发现](http://cloud.spring.io/spring-cloud-consul/)和[Spring Cloud Zookeeper发现](http://cloud.spring.io/spring-cloud-zookeeper/)。

默认情况下，`DiscoveryClient`的实现将使用远程发现服务器自动注册本地Spring Boot服务器。可以通过在`@EnableDiscoveryClient`中设置`autoRegister=false`来禁用此功能。

启动Server, 再启动 Client
![发现并没有注册成功实例](https://upload-images.jianshu.io/upload_images/4685968-9da416ccd633c799.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
因为没有配置注册目标地址信息
![](https://upload-images.jianshu.io/upload_images/4685968-197f5e1401d5a4ed.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
之后再次重启,依旧无法注册成功,几经勘察,添加以下依赖后,成功运行,注册到服务器
![](https://upload-images.jianshu.io/upload_images/4685968-dab3e741646d87da.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
再指定 client 名字
![](https://upload-images.jianshu.io/upload_images/4685968-77b7e08397aab65e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
发现成功注册
![](https://upload-images.jianshu.io/upload_images/4685968-447ae3cea24861ce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
此为 client 应用ip 地址
![](https://upload-images.jianshu.io/upload_images/4685968-393a5ff147bfb1f1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
但其实可以自定义
![](https://upload-images.jianshu.io/upload_images/4685968-ab9f1d0f812c5310.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
接着点击进入那个链接,URL如下
![](https://upload-images.jianshu.io/upload_images/4685968-9cc1d2a8e2e5772a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- Eureka保证AP
有时会发现如下红色警戒!
![](https://upload-images.jianshu.io/upload_images/4685968-273265cd6cea62c2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
Eureka看明白了这一点，因此在设计时就优先保证可用性。我们可以容忍注册中心返回的是几分钟以前的注册信息，但不能接受服务直接down掉不可用。也就是说，服务注册功能对可用性的要求要高于一致性。
如果Eureka服务节点在短时间里丢失了大量的心跳连接(注：可能发生了网络故障)，那么这个 Eureka节点会进入“自我保护模式”，同时保留那些“心跳死亡”的服务注册信息不过期。此时，这个Eureka节点对于新的服务还能提供注册服务，对于“死亡”的仍然保留，以防还有客户端向其发起请求。当网络故障恢复后，这个Eureka节点会退出“自我保护模式”。Eureka的哲学是，同时保留“好数据”与“坏数据”总比丢掉任何数据要更好。
在开发模式,最好关闭该模式(默认是开启的),仅能在开发环境关闭!,生产环境禁止关闭!!!
![](https://upload-images.jianshu.io/upload_images/4685968-a04f2186501ce1a3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 3.4 Eureka的高可用
如果一台 eureka宕机了咋办呢,为了实现高可用,如果直接加一台服务器并无任何卵用,考虑将两台 eureka 互相注册
![](https://upload-images.jianshu.io/upload_images/4685968-d12648840d93b02b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
复制得到两份 eureka,并以端口区分
![](https://upload-images.jianshu.io/upload_images/4685968-20facd35bb36e065.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
将 eureka1注册到 eureka2上并启动
![](https://upload-images.jianshu.io/upload_images/4685968-7efb11a69e156076.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
将 eureka2注册到 eureka1上并启动
![](https://upload-images.jianshu.io/upload_images/4685968-7aaa1fa687b23a84.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-cb47b9201d61c0c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0da2ce887cb5af39.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
发现 client 在1,2同时都注册成功了!
假如此时 eureka1宕机了,会发生什么呢?
![](https://upload-images.jianshu.io/upload_images/4685968-8cce7c085770d214.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
我们来将1给关闭
![](https://upload-images.jianshu.io/upload_images/4685968-643a84de83f0d6b7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-592e41cb42871f9e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-1d6610d19c76af99.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
发现2依旧存活,并且 client 还在连接

若此时再 client 端重启又会发生什么呢?
![](https://upload-images.jianshu.io/upload_images/4685968-c0f3fd2b929bd58d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
因为无法注册,自然报错了,E2上也没有 client 端再连接了
![](https://upload-images.jianshu.io/upload_images/4685968-e944f363b9c4fbc7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
那么问题来了,怎么才能保证 E1宕机后, client 仍能注册在 E2上呢?只要保持每次都同时往两个 E 注册
![](https://upload-images.jianshu.io/upload_images/4685968-8642b72f32139f60.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
同理可得,当有3个 E 时,如此相互注册
![](https://upload-images.jianshu.io/upload_images/4685968-0ded453fe1710c1e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-77be07292929c33f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a13abb86e126efb8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
新建 E3
![](https://upload-images.jianshu.io/upload_images/4685968-ad37a6853df9330d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-343fbe2ac6417892.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-92f2e16d47fc8154.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
对于我们的开发环境,部署一个 E 即可,不再集群
## 3.5 Eureka总结
![](https://upload-images.jianshu.io/upload_images/4685968-c768943eef432bcd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 3.6 分布式下服务注册的地位和原理
![](https://upload-images.jianshu.io/upload_images/4685968-c6b9c15c3c66fa36.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-8354a578001f2386.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
A 类比青楼中的嫖客, B 类比青楼女子,注册中心呢就相当于青楼中的妈咪
一般 嫖客服务一来,就肯定直接点名春花还是秋月呀,直接问妈咪要花魁就行
![](https://upload-images.jianshu.io/upload_images/4685968-62be3e8cab095c1b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ecfee658cd5a50b8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
