# 02-Seata客户端全局事务配置与实现

根据 [官方文档](https://seata.io/zh-cn/docs/ops/deploy-guide-beginner.html)：

![](https://img-blog.csdnimg.cn/2b56b88e0f784238bf86958cb16f7e1a.png)

这也是 1.4 和 1.5 的区别。

https://github.com/seata/seata/tree/master/script/client/conf：

![](https://img-blog.csdnimg.cn/464bf94135d744c1b05730d0d1a6aa46.png)

## yml 配置

```yml
seata:
  enabled: true
```

注意如下默认配置，我们需要定制化修改：

![](https://img-blog.csdnimg.cn/b66ec259ef6940799c6d33b42a173522.png)

```yml
seata:
  enabled: true
  tx-service-group: javaedge_tx_group
  service:
    vgroup-mapping:
      javaedge_tx_group: SEATA_GROUP
    grouplist:
      SEATA_GROUP: localhost:8091
  config:
    nacos:
      server-addr: localhost:8848
      username: nacos
      password: nacos
  registry:
    nacos:
      server-addr: localhost:8848
      username: nacos
      password: nacos
```

还没完：

```
  config:
    nacos:
      server-addr: localhost:8848
      username: nacos
      password: nacos
  registry:
    nacos:
      server-addr: localhost:8848
      username: nacos
      password: nacos
```

