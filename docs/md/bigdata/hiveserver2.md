# hiveserver2

## 1 简介

Apache Hive的一部分，是一个服务接口，允许客户端使用JDBC或Thrift协议来执行查询、获取结果及管理Hive的服务。即它提供了一个机制，使得外部客户端程序可以与Hive进行交互。

## 2 主要特性

- **多客户端并发**：HiveServer2支持多客户端同时并发访问和执行查询
- **会话管理**：HiveServer2可维护和管理用户会话，每个客户端连接都在自己的会话中执行
- **安全访问**：集成安全功能，可配置基于LDAP的身份验证、Kerberos等安全机制
- **JDBC和ODBC接口**：提供标准JDBC和ODBC接口，这让它能与各种企业级应用以及BI（商业智能）工具兼容
- **Thrift服务**：除JDBC和ODBC，还提供Thrift服务接口，允许各种编程语言创建客户端以访问Hive

HiveServer2是Hive的核心组件之一，是HiveServer升级版，提供更好性能、稳定性与可伸缩性。在大数据生态系统中，HiveServer2是执行SQL风格查询、数据挖掘和管理大规模数据集的重要工具。正是通过如HiveServer2这样的服务，Hive才能在整个Hadoop生态系统中发挥其强大的数据仓库功能。