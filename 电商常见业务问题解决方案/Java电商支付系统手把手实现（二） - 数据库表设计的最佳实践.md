# 1 数据库设计
## 1.1 表关系梳理
- 仔细思考业务关系，得到如下表关系图
![](https://img-blog.csdnimg.cn/20200115020506177.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
## 1.2 用户表结构
![](https://img-blog.csdnimg.cn/20200121014332479.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
## 1.3 分类表结构
![](https://img-blog.csdnimg.cn/20200121020536729.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
id=0为根节点，分类其实是树状结构

## 1.4 商品表结构
![](https://img-blog.csdnimg.cn/20200121020705305.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 注意价格字段的类型为 decimal

## 1.5 支付信息表结构
![](https://img-blog.csdnimg.cn/20200121021541829.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

## 1.6 订单表结构
![](https://img-blog.csdnimg.cn/20200121021648129.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 乍一看，有必要搞这么多种的时间嘛？有以下诸多原因
	- 前端显示需要，那就必须存着呀！
	- 方便定位排查问题，比如某用户投诉某订单一直不发货，肯定就需要时间去定位
	- 方便数据分析，比如需要计算从用户支付到最终发出商品的平均时间
	- 根据订单状态确认相应订单时间

## 1.7 订单明细表
由于价格等变动因素，需要记录用户购买时的商品相关属性详情，我们在做表关联时，遇到这种可变因素，要考虑是否做存档。
![](https://img-blog.csdnimg.cn/20200124020125215.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
## 1.8 收货地址
![](https://img-blog.csdnimg.cn/20200124020350170.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
# 2  索引
## 2.1 唯一索引
唯一索引unique,保证数据唯一性
比如：
- 用户表中的用户名字段，写相同的用户名就会报错。
![](https://img-blog.csdnimg.cn/20200124020508773.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 订单表中的订单号
![](https://img-blog.csdnimg.cn/20200124020613334.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
## 2.2 单索引及组合索引
对单/多个字段做索引叫单/组合索引
![](https://img-blog.csdnimg.cn/2020012402153647.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
# 3 时间戳
用于定位排查业务问题
- create_ time: 创建时间
- update_ _time: 更新时间

因此，每个表里基本都有该两个字段哦！

# 4 总结
在数据库设计时，注意如下几点
- 表关系
- 单索引及组合索引
- 表结构
- 时间戳
- 唯一索引
# 参考
- 高性能 MySQL 第三版
- Java支付电商平台实战