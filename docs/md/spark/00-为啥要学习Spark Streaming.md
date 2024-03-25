# 00-为啥要学习Spark Streaming

本专栏从实时数据产生和流向的各个环节出发，通过集成主流的：

- 分布式日志收集框架Flume
- 分布式消息队列Kafka
- 分布式列式数据库HBase
- 当前非常火爆的Spark Streaming

打造实时流处理项目实战，让你掌握实时处理的整套处理流程，达到大数据中级研发工程师的水平！

## 前提

适合有编程基础，想转行投身大数据行业的工程师，对你的学习能力及基础要求如下：

1、熟悉常用Linux命令的使用

2、掌握Hadoop、Spark的基本使用

3、至少熟悉一门编程语言Java/Scala/Python

#### 基于Flume+Kafka+Spark Streaming打造企业大数据流处理平台

流行框架打造通用平台，直接应用于企业项目：

- 处理流程剖析
- 日志产生器
- 使用Flume采集日志
- 将Flume收集到的数据输出到Kafka
- Spark Streaming消费Kafka的数据进行统计
- Spark Streaming如何高效的读写数据到Hbase
- 本地测试和生产环境使用的拓展
- Java开发Spark要点拓展

## 原理+场景，彻底搞懂Spark Streaming

全面了解Spark Streaming的特性及场景应用，完成各个不同维度的统计分析。

#### 日志收集框架Flume

Flume架构及核心组件

Flume&JDK环境部署

Flume实战案例

#### 分布式消息队列Kafka

Kafka架构及核心概念 / Zookeeper安装

Kafka单、多broker部署及使用

Kafka Producer Java API编程

Kafka Consumer Java API编程

#### 1.入门

Spark Streaming概述及应用场景

Spark Streaming集成Spark生态系统使用

从词频统计功能着手入门Spark Streaming

Spark Streaming工作原理(粗/细粒度)

#### 2.核心

StreamingContext/Dstream

Input DStreams和Receivers

Transformation和Output Operations

Spark Streaming处理socket/文件系统数据

#### 3.进阶

updateStateByKey算子的使用

统计结果写入到MySQL数据库

窗口函数的使用、黑名单过滤

Spark Streaming整合Spark SQL操作

#### Streaming整合Flume

Push和Pull两种方式介绍

与Flume Agent配置

本地、服务器环境联调

整合Spark Streaming应用开发

#### Streaming整合Kafka

版本选择详解

Receiver和Direct两种方式

本地、服务器环境联调

整合Spark Streaming应用开发及测试

## 总结

渐进式学习让你彻底学会整套流程的开发

需求分析 → 数据清洗 → 数据统计分析 → 统计结果入库 → 数据可视化