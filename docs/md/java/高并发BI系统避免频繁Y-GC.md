# 高并发BI系统避免频繁Y-GC

## 1 业务背景

商家使用你的平台，产生大量数据，基于这些数据你要为商家提供一些数据报表，如：

- 每个商家每天有多少访客？
- 有多少交易？
- 付费转化率是多少？

这就需要BI系统，Business Intelligence，商业智能。让商家能更好了解经营状况，然后让老板“智能”去调整经营策略，提升业绩。

所以类似这样的BI系统，先会从我们提供给商家日常使用的一个平台上会采集出来很多商家日常经营数据：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/watermark%252Ctype_d3F5LXplbmhlaQ%252Cshadow_50%252Ctext_SmF2YUVkZ2U%253D%252Csize_20%252Ccolor_FFFFFF%252Ct_70%252Cg_se%252Cx_16.png)

接着对这些经营数据依托各种大数据计算平台如Hadoop、Spark、Flink等得到数据报表：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/%E5%A4%A7%E6%95%B0%E6%8D%AE%E8%AE%A1%E7%AE%97%E5%B9%B3%E5%8F%B0.png)

再将计算好的各种数据分析报表持久化，如MySQL、ES、HBase：

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90%E6%8A%A5%E8%A1%A8%E6%8C%81%E4%B9%85%E5%8C%96.png)﻿

最后，基于持久化的数据报表，基于Java开发BI系统，通过该系统把各种存储好的数据暴露给前端，允许前端基于各种条件对存储好的数据进行复杂筛选和分析：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/%E6%95%B0%E6%8D%AE%E6%9A%B4%E9%9C%B2%E7%BB%99%E5%89%8D%E7%AB%AF.png)



## 2 系统初期部署架构

初期使用商家不多就几千个，刚开始系统部署简单，几台4核8G机器部署BI系统，给堆内存中的新生代分配内存约1.5G，Eden区约1G：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/%E7%B3%BB%E7%BB%9F%E5%88%9D%E6%9C%9F%E9%83%A8%E7%BD%B2%E6%9E%B6%E6%9E%84.png)﻿

## 3  自动刷新报表 + 大数据量报表

在突然使用系统的商家数量开始暴涨时，在BI系统中有种数据报表，支持前端页面有一个JS脚本，自动每隔几s发送请求到后台刷新数据，即“**实时数据报表**”：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/%E8%87%AA%E5%8A%A8%E5%88%B7%E6%96%B0%E6%8A%A5%E8%A1%A8.png)

假设仅几万商家作为你的系统用户，可能同时打开那个实时报表的商家就有几千个。然后每个商家打开实时报表之后，前端页面都会每隔几s请求后台加载最新数据，BI系统部署的每台机器每s请求达到几百，假设500个请求/s。然后每个请求会加载出来一张报表需要的大量数据，因为BI系统可能还需要针对那些数据进行内存中的现场计算加工一下，才返给前端。

每个请求约需加载100kb数据进行计算，因此每秒500个请求，就需要加载出来50MB数据到内存进行计算：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/%E6%95%B0%E6%8D%AE%E5%88%B0%E5%86%85%E5%AD%98.png)﻿

## 4 频繁YGC

上述系统运行模型下，每s会加载50M数据到Eden区，只要200s，就会填满Eden，然后触发Y-GC。1G左右的Eden进行Y-GC其实速度较快了，可能几十ms搞定。

所以对系统性能影响并不大。而且BI场景下，基本上每次Y-GC后，存活对象可能就几十甚至几MB。所以若仅是这样，可能BI系统运行几min后，卡顿10ms，但对终端用户和系统性能几乎无影响：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/%E9%A2%91%E7%B9%81YGC.png)

## 5 使用大内存机器

随商家越来越多，并发压力越来越大，高峰期10万请求/s。若还是4核8G，那可能要部署上百台机器抗10万并发。

所以一般提升机器配置，本身BI就是吃内存系统，所以我们将部署机器全面提升到16核32G。每台机器可抗几千并发，部署二三十台。

若用大内存机器，则新生代至少分到20G，Eden区占16G以上：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/%E4%BD%BF%E7%94%A8%E5%A4%A7%E5%86%85%E5%AD%98%E6%9C%BA%E5%99%A8.png)

此时几千请求/s，每s大概加载到内存中几百MB数据，大概可能几十s甚至1min左右填满Eden区，开始执行Y-GC，回收那么大的内存，速度会慢很多，也许此时就会导致系统卡顿个几百ms或1s：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/%E7%B3%BB%E7%BB%9F%E5%8D%A1%E9%A1%BF.png)

要是系统卡顿时间过长，必然导致瞬间很多请求积压排队，严重时导致线上前端请求频繁超时：前端请求后，发现1、2s还没返回就超时报错。

## 6 G1优化大内存机器Y-GC

采用G1应对大内存Y-GC过慢问题。对G1设置预期停顿时间，如100ms，让G1保证每次Y-GC时最多停顿100ms，避免影响用户使用。这样，也许Y-GC频率更高，但每次停顿时间很小，对系统影响就不那么大了。

## 7 总结

通常Y-GC哪怕发生很频繁，其实一般都对系统造成不了太大的影响。只有在你机器内存特别大时，要注意Y-GC也可能导致较长时停顿，针对大内存机器推荐直接G1。