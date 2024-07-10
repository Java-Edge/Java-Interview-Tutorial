# 04-BFF 架构简介

## 1 概念

BFF，Backends For Frontends（服务于前端的后端），Sam Newman曾在他的博客中写了一篇相关文章Pattern: Backends For Frontends，在文章中Sam Newman详细地说明了BFF。

BFF就是服务器设计API时会考虑到不同设备需求，即为不同设备提供不同API接口，虽然它们可能实现相同功能，但因不同设备的特殊性，它们对服务端的API访问也各有其特点，需区别处理。因此出现了类似下图的

## 2 设计方式

### 2.1 图一

![](https://img-blog.csdnimg.cn/20210111125135224.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

### 2.2 图二

![](https://img-blog.csdnimg.cn/2021011112514673.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

客户端都不是直接访问服务器的公共接口，而是调用BFF层提供的接口，BFF层再调用基层的公共服务，不同的客户端拥有不同BFF层，它们定制客户端需要的API。图一、图二不同在于是否需要为相似的设备人，如IOS和android分别提供一个BFF，这需根据现实情况决定。

## 3 BFF V.S 多端公用、单一的API

### 3.1 满足不同客户端特殊交互引起的对新接口的要求

所以一开始就会针对相应设备设计好对应接口。若使用单一、通用API，而一开始并没有考虑到特殊需求，则有新请求需要出现时，可能出现：

- 若添加新接口，易造成接口不稳定
- 若考虑在原有接口上修改，可能产生一些耦合，破坏单一职责

#### 案例

因为移动APP的屏幕限制，在某个列表页，我们只需展示一些关键信息，但由于调用的是服务端提供统一的API，服务端在设计时只考虑到web端，就返回了所有字段，但这些对移动端都无用。

优化性能时处理这样的问题，服务器端就需新增接口或通过引入相关耦合来解决。而使用BFF，很大程度能避免这类问题。

### 3.2 当由于某客户端需调用多个不同服务端接口，来实现某功能

可直接在对应BFF层编写相应API，而不影响基层公共服务，且客户端不用直接向多个后台发起调用，可优化性能。

BFF带来便利好处同时，也会引起一些问题：代码重复，加大开发工作量等。

所以在使用时需要结合现实情况仔细斟酌，符合项目的应用开发背景。例如蚂蚁财富使用BFF的场景如下：

![](https://img-blog.csdnimg.cn/20210111125334162.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

参考

- https://samnewman.io/patterns/architectural/bff/