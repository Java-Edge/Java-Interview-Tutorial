各种社交软件里面都有附件的人的需求，在该应用中，我们查询附近 1 公里的食客，同时只需查询出 20 个即可。
解决基于地理位置的搜索，很多数据库品牌都支持：MySQL、MongoDB、Redis 等都能支持地理位置的存储。
- 当用户登录应用时，或者保持用户登录后用户在使用应用时，客户端是可以时刻获取用户位置信息的（前提是用户要开启位置获取的权限），客户端获取到最新的地理位置后，上传到后端服务器进行更新。
- 当用户点击 Near Me 功能时，那么通过后台就可以以当前用户的位置为圆点，距离为半径查询相关的用户展示即可完成

注意 redis 的经纬度有 0.5%的误差，所以精度要求高的比如地图就慎用 redis API！

# 命令
## GEOADD 
GEOADD key longitude latitude member [longitude latitude member …] 添加位置信息

```bash
# 添加单个位置
127.0.0.1:0>GEOADD diner:location 121.446617 31.205593 'zhangsan'
"1"
# 添加多个位置信息
127.0.0.1:0>GEOADD diner:location 121.4465774 31.20485103  'lisi' 121.44534  31.2031 'wangwu'  121.4510648 31.2090667 'zhangliu'
"3"
```
底层使用的 sortedSet 存储。
## GEODIST
计算距离。
```bash
key member1 member2 [unit] 
```
， 其中 unit 为单位 m|km|ft（英尺）|mi（英里）

```bash
# 计算两点间的距离，返回距离的单位是米（m）
127.0.0.1:0>GEODIST diner:location zhangsan lisi m
"82.4241"
# 计算两点间的距离，返回距离的单位是千米（km）
127.0.0.1:0>GEODIST diner:location zhangsan lisi km
"0.0824"
```

## GEOHASH 

```bash
key member [member …]
```

返回一个或多个位置元素的 Geohash。保存到 Redis 中是用 Geohash 位置 52 点整数编码。

GeoHash 将二维经纬度转换成字符串。比如下图展示了北京 9 个区域的 GeoHash 字符串，分别是 WX4ER，WX4G2、WX4G3 等，每一个字符串代表了某一矩形区域。
即这个矩形区域内所有的点（经纬度坐标）都共享相同的 GeoHash 字符串，这样既可保护隐私（只表示大概区域位置而非具体点），又容易做缓存。
比如左上角区域内的用户不断发送位置信息请求餐馆数据，由于这些用户的 GeoHash 字符串都是 WX4ER，所以可把 WX4ER 当作 key，把该区域的餐馆信息当作 value 来进行缓存，而若不使用 GeoHash，由于区域内的用户传来的经纬度各不相同的，很难做缓存。字符串越长，表示的范围越精确。
![](https://img-blog.csdnimg.cn/20210129135113878.png)
## GEOPOS
从key里返回所有给定位置元素的位置（经度和纬度）。

```bash
key member [member …] 
```

```bash
# 返回zhangsan和lisi的位置信息
127.0.0.1:0>GEOPOS diner:location zhangsan lisi
 1)    1)   "121.44661813974380493"
  2)   "31.20559220971455971"
 2)    1)   "121.44657522439956665"
  2)   "31.20485207113603821"
```

## GEORADIUS
```bash
key longitude latitude radius m|km|ft|mi 
	[WITHCOORD] [WITHDIST] [WITHHASH] [COUNT count]
```

给定的经纬度为中心， 返回键包含的位置元素当中， 与中心的距离不超过给定最大距离的所有位置元素。
范围可以使用以下其中一个单位：
- m 表示单位为米
- km 表示单位为千米
- mi 表示单位为英里
- ft 表示单位为英尺

在给定以下可选项时， 命令会返回额外的信息：
- WITHDIST: 在返回位置元素的同时， 将位置元素与中心之间的距离也一并返回。 距离的单位和用户给定的范围单位保持一致
- WITHCOORD: 将位置元素的经度和维度也一并返回
- WITHHASH: 以 52 位有符号整数的形式， 返回位置元素经过原始 geohash 编码的有序集合分值。 这个选项主要用于底层应用或者调试， 实际中的作用并不大。
命令默认返回未排序的位置元素。 通过以下两个参数， 用户可以指定被返回位置元素的排序方式：
- ASC
根据中心的位置， 按照从近到远的方式返回位置元素。
- DESC
根据中心的位置， 按照从远到近的方式返回位置元素。

在默认情况下， GEORADIUS 命令会返回所有匹配的位置元素。 虽然用户可以使用 COUNT 选项去获取前 N 个匹配元素， 但是因为命令在内部可能会需要对所有被匹配的元素进行处理， 所以在对一个非常大的区域进行搜索时， 即使只使用 COUNT 选项去获取少量元素， 命令的执行速度也可能会非常慢。 但是从另一方面来说， 使用 COUNT 选项去减少需要返回的元素数量， 对于减少带宽来说仍然是非常有用的。

```bash
# 以121.446617 31.205593(张三位置)为圆心，3000m为半径，查询返回用户及其位置
127.0.0.1:0>GEORADIUS diner:location 121.446617 31.205593 3000 m WITHCOORD 
 1)    1)   "wangwu"
  2)      1)    "121.44534140825271606"
   2)    "31.20310057881493293"


 2)    1)   "lisi"
  2)      1)    "121.44657522439956665"
   2)    "31.20485207113603821"


 3)    1)   "zhangsan"
  2)      1)    "121.44661813974380493"
   2)    "31.20559220971455971"


 4)    1)   "zhangliu"
  2)      1)    "121.45106524229049683"
   2)    "31.20906731242401833"


# 以121.446617 31.205593(张三位置)为圆心，3000m为半径，查询返回用户及其距离(单位是米)
127.0.0.1:0>GEORADIUS diner:location 121.446617 31.205593 3000 m WITHDIST
 1)    1)   "wangwu"
  2)   "302.6202"

 2)    1)   "lisi"
  2)   "82.5066"

 3)    1)   "zhangsan"
  2)   "0.1396"

 4)    1)   "zhangliu"
  2)   "573.0651"
  
# 以121.446617 31.205593(张三位置)为圆心，3000m为半径，查询返回用户及其距离(单位是米) 由近及远
47.110.246.98:15>GEORADIUS diner:location 121.446617 31.205593 3000 m WITHDIST ASC
 1)    1)   "zhangsan"
  2)   "0.1396"

 2)    1)   "lisi"
  2)   "82.5066"

 3)    1)   "wangwu"
  2)   "302.6202"

 4)    1)   "zhangliu"
  2)   "573.0651"
  

# 以121.446617 31.205593(张三位置)为圆心，3000m为半径，查询返回用户及其GeoHash值
127.0.0.1:0>GEORADIUS diner:location 121.446617 31.205593 3000 m WITHHASH
 1)    1)   "wangwu"
  2)   "4054756135204337"

 2)    1)   "lisi"
  2)   "4054756138536712"

 3)    1)   "zhangsan"
  2)   "4054756138736536"

 4)    1)   "zhangliu"
  2)   "4054756186304127"

# 以121.446617 31.205593(张三位置)为圆心，3000m为半径，查询返回用户及其GeoHash值去2个
127.0.0.1:0>GEORADIUS diner:location 121.446617 31.205593 3000 m WITHHASH COUNT 2
 1)    1)   "zhangsan"
  2)   "4054756138736536"

 2)    1)   "lisi"
  2)   "4054756138536712"
```
## GEORADIUSBYMEMBER
找出位于指定范围内的元素
```bash
key member radius m|km|ft|mi [WITHCOORD] 
	[WITHDIST] [WITHHASH] [COUNT count]
```
- GEORADIUSBYMEMBER 的中心点是由给定的位置元素决定
- GEORADIUS 使用输入的经度和纬度来决定中心点


- 指定成员的位置被用作查询的中心
![](https://img-blog.csdnimg.cn/20210129142205961.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
使用GEOADD添加地理位置信息时，用标准格式的参数 x,y, 所以经度必须在纬度之前。这些坐标的限制是可以被编入索引的，区域面积可以很接近极点但是不能索引。具体的限制，由 EPSG:900913 / EPSG:3785 / OSGEO:41001 规定如下：
• 有效的经度从 - 180 度到 180 度。
• 有效的纬度从 - 85.05112878 度到 85.05112878 度。
当坐标位置超出上述指定范围时，该命令将会返回一个错误。


# 工作原理
sorted set 使用一种称为 Geohash 的技术进行填充。经度和纬度的位是交错的，以形成一个独特的 52 位整数. 我们知道，一个 sorted set 的 double score 可以代表一个 52 位的整数，而不会失去精度。
这种格式允许半径查询检查的 1 + 8 个领域需要覆盖整个半径，并丢弃元素以外的半径。通过计算该区域的范围，通过计算所涵盖的范围，从不太重要的部分的排序集的得分，并计算得分范围为每个区域的 sorted set 中的查询。
## 地球模型（Earth model）
这只是假设地球是一个球体，因为使用的距离公式是 Haversine 公式。这个公式仅适用于地球，而不是一个完美的球体。当在社交网站和其他大多数需要查询半径的应用中使用时，这些偏差都不算问题。但是，在最坏的情况下的偏差可能是 0.5%，所以一些地理位置很关键的应用还是需要谨慎考虑。
# 代码实战
- 更新坐标
![](https://img-blog.csdnimg.cn/20210129142412474.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 查找附近的人
![](https://img-blog.csdnimg.cn/20210129151256329.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)