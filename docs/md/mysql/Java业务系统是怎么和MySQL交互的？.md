# Java业务系统是怎么和MySQL交互的？

很多crud boy眼中的数据库：

<img src="https://my-img.javaedge.com.cn/javaedge-blog/2024/09/28faab638f48f1db6e77bfbb990e31ca.png" style="zoom:60%;" />

但使用MySQL时，总会遇到各种烦人问题，什么偶尔死锁、性能丢人、各种异常报错。一般人都会Google博客，尝试解决问题，最后虽然是解决了问题，但可能也没搞懂背后原理。

所以才需要精通MySQL底层原理，探索在解决MySQL各种问题时，如何凭借原理去快速分析、排查和解决问题。

## MySQL驱动有啥用？

要在Java系统访问MySQL，得加个MySQL驱动依赖，才能和MySQL建立连接，然后执行CRUD：maven配置，这段maven配置中就引入了一个MySQL驱动。**mysql-connector-java**就是Java语言使用的MySQL驱动。

<img src="https://img-blog.csdnimg.cn/9dff711d03274520af640bbfae4a599b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16" style="zoom:70%;" />

访问MySQL，就得和MySQL建立网络连接，而这就由MySQL驱动负责，他会在底层和MySQL建立网络连接，有此连接，才能发送请求给MySQL服务器：

<img src="https://my-img.javaedge.com.cn/javaedge-blog/2024/09/bd527dd176ed8defae6f09d8b3ce7197.png" style="zoom:67%;" />

和MySQL有了网络连接后，Java业务代码就能基于此连接，执行CRUD语句了：

<img src="https://my-img.javaedge.com.cn/javaedge-blog/2024/09/a599ff14a80dd24705ad30b512845dd6.png" style="zoom:67%;" />

## 数据库连接池有啥用？

一个Java系统只会和MySQL建立一个连接吗？

肯定不止的，用Java开发的Web系统部署在Tomcat，Tomcat本身就有多个线程并发处理接收到的大量请求﻿：

<img src="https://my-img.javaedge.com.cn/javaedge-blog/2024/09/72b9b210b9906de3cee94e998d7abd62.png" style="zoom:67%;" />

﻿若Tomcat中的多个线程并发处理多个请求时，都去抢夺一个连接访问MySQL，那效率肯定很低：

<img src="https://my-img.javaedge.com.cn/javaedge-blog/2024/09/86f362fc608f3f16cbb3cbd904ea2cac.png" style="zoom:67%;" />

若Tomcat中的上百个线程，每个线程在每次访问MySQL时，都基于MySQL驱动去创建一个数据库连接，然后执行SQL语句，然后执行完后再销毁该连接。这样并发频繁创建数据库连接，又频繁销毁数据库连接的操作可不好，因为每次建立一个数据库连接都很耗时，好不容易建好连接，执行完SQL，还把它给销毁，下次又得重新建立数据库连接，效率肯定低下：

<img src="https://my-img.javaedge.com.cn/javaedge-blog/2024/09/39ecd8964a2948e6377568f9b419995e.png" style="zoom:67%;" />﻿

所以得使用一个数据库连接池：在一个池子里维护多个数据库连接，让多个线程使用池中不同数据库连接去执行SQL，执行完SQL后，不是销毁数据库连接，而是将连接放回池，后续复用。

数据库连接池的机制解决了：

- 多个线程并发使用多个数据库连接执行SQL
- 避免了数据库连接使用完之后就销毁

<img src="https://my-img.javaedge.com.cn/javaedge-blog/2024/09/3954294cb91d65a93c232eec5961bfa7.png" style="zoom:67%;" />

## MySQL本身的连接池干嘛的？

很多系统要与MySQL建立大量连接，那MySQL必然也得维护与系统之间的各个连接，所以**MySQL架构体系中的第一个环节，就是连接池**。

MySQL本身的连接池就维护了与系统之间的多个数据库连接：

<img src="https://my-img.javaedge.com.cn/javaedge-blog/2024/09/3ef62836450b9d2840911e6a99fd9119.png" style="zoom:67%;" />