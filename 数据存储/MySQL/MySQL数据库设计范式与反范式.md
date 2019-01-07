> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

# 1 第一范式
该范式是为了排除 重复组 的出现，因此要求数据库的每个列的值域都由原子值组成；每个字段的值都只能是单一值。1971年埃德加·科德提出了第一范式。即表中所有字段都是不可再分的。

## 1.1 实例
重复组通常会出现在会计账上，每一笔记录可能有不定个数的值。
- 举例来说：
![](https://img-blog.csdnimg.cn/20200823233919133.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
> “数量”就是所谓的重复组了，而在这种情况下这份资料就不符合第一范式。


- 再比如，如下联系方式是一个复合属性，就违反了该范式，在数据库中是无法分离出来的。
![](https://img-blog.csdnimg.cn/20190623130240462.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 1.2 解决方案
- 想要消除重复组的话，只要把每笔记录都转化为单一记录即可：
![](https://img-blog.csdnimg.cn/20200823233954666.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- 简单改动即可
![](https://img-blog.csdnimg.cn/20190623130520502.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

即标准的二维表结构。

#  2 第二范式
> 前提：标准的二维表，即第一范式成立

表中必须存在业务主键，并且非主键依赖于`全部`业务主键。

## 2.1 实例
如下博客表
![](https://img-blog.csdnimg.cn/20190623215600583.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- 用户字段作为PK是否可行?
一个用户会对应多个博客记录，且章节标题也能为多个用户所编辑，所以单列字段PK失效

- <用户,章节,标题>的联合PK
用户积分字段只和用户字段依赖，并不依赖整体的PK，依旧不符第二范式


## 2.2 解决方案
`拆分将依赖的字段单独成表`
![](https://img-blog.csdnimg.cn/20190623225502387.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190623225600676.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

从上面可发现:
- 若表的PK只有一个字段，那么它本就符合第二范式
- 若是多个字段组成，则需考虑是否符合第二范式

# 3 第三范式

`表中的非主键列之间不能相互依赖 `

## 3.1 实例 - 课程表
![](https://img-blog.csdnimg.cn/20190623230022400.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

一个字段的PK显然符合第二范式，大部分字段也只依赖PK。然而对于职位字段其实依赖讲师名，所以不符合第三范式。

## 3.2 解决方案
- 将不与PK形成依赖关系的字段直接提出单独成表即可：
![](https://img-blog.csdnimg.cn/20190623231040782.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
 ![](https://img-blog.csdnimg.cn/20190623232055504.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 4 三范式评价
## 优点
- 范式化的更新通常比反范式快
- 当数据较好的范式化后，很少或者没有冗余数据
- 范式化的数据比较小，放在内存中操作较快

## 缺点
- 通常需要进行关联
毕竟阿里规范提到
![](https://img-blog.csdnimg.cn/20200825025806918.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
# 5 反范式（空间换时间）
反范式的过程就是通过冗余数据来提高查询性能，但冗余数据会牺牲数据一致性

## 优点
- 所有的数据都在同一张表中，可以减少表关联
- 更好进行索引优化

## 缺点
- 存在大量冗余数据
- 数据维护成本更高（删除异常，插入异常，更新异常）


在企业中很好能做到严格意义上的范式成者反范式，一般需混合使用。

#  6 综合案例
1. 在一个网站实例中， 这个网站允许用户发送消息，井且一些用户是付费用户。现在想查看付费用户最近的10条信息。在user表 和message表中都存储用户类型(account type)，而不用完全的反范式化。这避免了完全反范式化的插入和删除问题，因为即使没有消息的时候也不会丢失用户信息。这样也不会把user_message表搞得太大，有助高效获取数据
2. 另一个从父表冗余些数据到子表的理由是排序的需要
3. 缓存衍生值也是有用的。如果需要显示每个用户发了多少消息(类似论坛)，可以每次执行一个昂贵的子查询来计算并显示它；也可以在user表中建个num_messages列，每当用户发新消息时更新这个值。

## 范式设计
- 用户表
用户ID、姓名、电话、地址、邮箱
- 订单表
订单ID、用户ID、下单时间、支付类型、订单状态
- 订单商品表
订单ID、商品 ID、商品价格
- 商品表
商品ID、名称、描述、过期时间

```sql
SELECT b.用户名, b.电话, b.地址, a.订单ID,
	   SUM(c.商品价价*C.商品数量) as 订单价格
	   // 上面这就需要三张表的关联了,可能效率就很低了
FROM‘订单表` a
JOIN‘用户表’b ON a用户ID=b.用户ID
JOIN `订单商品表` C ON c.订单ID= b.订单ID
GROUP BY b.用户名，b.电话b.地址,a.订单ID
```
## 反范式设计
- 用户表
用户ID、姓名、电话、地址、邮箱
- 订单表
订单ID、用户ID、下单时间、支付类型、订单状态、订单价格、用户名、电话、地址
- 订单商品表
订单ID、商品 ID、商品数量、商品价格
- 商品表
商品ID、名称、描述、过期时间

```sql
SELECT a.用户名,a.电话.a.地址
,a.订单ID
,a.订单价格
FROM `订单表` a
```

把用户表的地址加到了订单表，这样查询地址时，就不需要把用户表和订单表关联

参考
- [第一范式](https://zh.wikipedia.org/wiki/%E7%AC%AC%E4%B8%80%E6%AD%A3%E8%A6%8F%E5%8C%96)


![](https://img-blog.csdnimg.cn/20200729215420194.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)