- 订单服务源码
https://github.com/Wasabi1234/SpringCloud_OrderDemo
- 商品服务源码
https://github.com/Wasabi1234/SpringCloud_ProductDemo
- 商品服务模块全部源码
https://github.com/Wasabi1234/productdemo
## 4.1  微服务拆分的起点
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550369_4685968-042925eaab82e84a.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550303_4685968-ee59d11b5c06ba9f.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550754_4685968-7755a50293d64677.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550672_4685968-e1b4504fce5b99d3.png)
## 4.2 康威定律和微服务
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550403_4685968-4977f90ef22568ae.png)
![沟通的问题会影响系统的设计](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550884_4685968-611b2b3a9be72a8a.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634554120_4685968-ca9e7694aa5668c5.png)
## 4.3 点餐业务服务拆分分析
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550226_4685968-2ed4805c9a22c35f.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550308_4685968-dbd9517212234eed.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550629_4685968-b3bd5fc2abab46c0.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550333_4685968-268b330ce9941318.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550308_4685968-3c84846025265eab.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550912_4685968-92f834b0a81bc5cd.png)
## 4.4 商品服务API和SQL介绍
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550501_4685968-af53eac30a627264.png)
## 4.5 商品服务编码实战(上)
在 IDEA 中新建项目
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550294_4685968-1ba94b0fc18b4e83.png)
![项目初始化 pom 文件](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550470_4685968-efb57c6681d98c53.png)
- web 和 webflux
旧版只有web一种模式，默认使用web。新版需指定，新增依赖
`org.springframework.boot.spring-boot-starter-web`
![为启动类添加该注解](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550697_4685968-36f40111d07834da.png)
![基本配置信息](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550709_4685968-7bb4f8757e15f554.png)
启动该类,将此服务注册到 eureka 上去
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550475_4685968-4684dc0feba86fd1.png)
![添加所需依赖](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550393_4685968-b6019061b87c1a0d.png)
![业务需求](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550285_4685968-ea2fe3d00fbc3789.png)
![配置数据库相关信息](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550233_4685968-bca5fdd15a0de806.png)
![添加 lombok 依赖](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550529_4685968-600733e1222d69df.png)
![编写dto类](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550194_4685968-c5055963719ceb46.png)
开始单元测试
![编写测试类](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550337_4685968-7fead72de82acae6.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550280_4685968-2f2cbfb1b431666e.png)
![必须要有此二注解,否则空指针异常](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550245_4685968-9574d3e17fcc40ac.png)
![测试通过](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634551786_4685968-bdb429749dd14cbd.png)
开始编码第二个功能
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550375_4685968-cdb5d879d524cf2d.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550315_4685968-c75b5f17c12858e3.png)
![测试通过](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634551507_4685968-744d6d64bf2f4c74.png)
## 4.6 商品服务编码实战(中)
![编写service 层](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550567_4685968-618732d8f313184e.png)
编码技巧,测试类可以直接继承启动类的测试类,减少注解个数,做到了最大可能的解耦
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550135_4685968-4a779983daf3a290.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550684_4685968-422d8b5809ead622.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550891_4685968-d2d5eef590dddd0c.png)
编写 vo 包下的类
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634551360_4685968-8d204aab16a0b1ea.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550602_4685968-008ea5c882904275.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634551485_4685968-d936ba762101c693.png)
## 4.7 商品服务编码实战(下)
完成 controller 类
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550508_4685968-08f7050bcbe1c156.png)
启动程序
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550739_4685968-22fc27466c21bfa8.png)
![优化返回值](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550426_4685968-0678768ce9bd50ae.png)
## 4.8 订单服务API和sql介绍
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550305_4685968-2c29041de939222f.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634551339_4685968-c5571c7e6de78f4c.png)
![业务需求](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550273_4685968-c1a272c93df12340.png)
## 4.9 订单服务dao
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550901_4685968-fb687616f460a5bb.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550194_4685968-f2344ed092db163c.png)

![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550396_4685968-dbdead19800e1e4a.png)
启动
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550310_4685968-571197a3e1205212.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550194_4685968-401d9ffad64e74c8.png)
![配置数据库信息并正常启动](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634551903_4685968-8e70bf3a79d10ad9.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550194_4685968-f16ed29a3f925786.png)
![save数据成功](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550307_4685968-df4f3b15853cb2ed.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550385_4685968-8d13f2046978010a.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550544_4685968-ec8fc1251bf7bd76.png)
## 4.10 订单服务service
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550105_4685968-ff62c86da0d988ec.png)
## 4.11 订单服务controller
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550336_4685968-d26cb5b5951655c7.png)
![自定义异常](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634551253_4685968-cd39d18f248fcef1.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550788_4685968-a3997dfdac5fd451.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634551678_4685968-37a30452b7c48f43.png)
![sb 引用了 gson, 所以不需要指定版本](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550290_4685968-582538d15a29edff.png)
![测试接口](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550307_4685968-dce317cdd1542039.png)

## 4.12 再看拆数据
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634550303_4685968-1e57f113611b8686.png)
![](https://uploadfiles.nowcoder.com/files/20190616/5088755_1560634551175_4685968-7d2ae008cd9d0665.png)
