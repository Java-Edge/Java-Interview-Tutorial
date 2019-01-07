很多应用比如签到送积分、签到领取奖励：
- 签到 1 天送 10 积分，连续签到 2 天送 20 积分，3 天送 30 积分，4 天以上均送 50 积分等
- 如果连续签到中断，则重置计数，每月初重置计数
- 显示用户某个月的签到次数
- 在日历控件上展示用户每月签到情况，可以切换年月显示

最简单的设计思路就是利用MySQL保存签到数据（t_user_sign），如下：
|字段名  | 描述 |
|--|--|
|  id| 数据表主键（AUTO_INCREMENT） |
| fk_diner_id| 	用户 ID| 
| sign_date	| 签到日期（如 2010-11-11）| 
| amount| 	连续签到天数（如 2）| 
大概一条数据 50B，可计算得到一千万用户连续签到五年，则为 800G 左右。

- 用户签到：往此表插入一条数据，并更新连续签到天数
- 查询根据签到日期查询
- 统计根据 amount 统计

如果这样存数据，对于用户量大的应用，db可能扛不住，比如 1000W 用户，一天一条，那么一个月就是 3 亿数据，非常庞大。

# 使用bitmap
Bitmaps，位图，不是 Redis 的基本数据类型（比如 Strings、Lists、Sets、Hashes），而是基于 String 数据类型的按位操作，高阶数据类型的一种。Bitmaps 支持最大位数 232 位。使用 512M 内存就可以存储多达 42.9 亿的字节信息（232 = 4,294,967,296）。

它由一组 bit 位组成，每个 bit 位对应 0 和 1 两个状态，虽然内部还是采用 String 类型存储，但 Redis 提供了一些指令用于直接操作位图，可以把它看作是一个 bit 数组，数组的下标就是偏移量。
## 优点
内存开销小、效率高且操作简单，很适合用于签到这类场景。比如按月进行存储，一个月最多 31 天，那么我们将该月用户的签到缓存二进制就是 00000000000000000000000000000000，当某天签到将 0 改成 1 即可，而且 Redis 提供对 bitmap 的很多操作比如存储、获取、统计等指令，使用起来非常方便。

## 常用命令
|命令  | 功能 |  参数 |
|--|--|--|
| SETBIT |   指定偏移量 bit 位置设置值|key offset value【0=< offset< 2^32】|
|GETBIT|查询指定偏移位置的 bit 值|		key offset
|BITCOUNT|   统计指定字节区间 bit 为 1 的数量 |	key [start end]【@LBN】
|BITFIELD|    操作多字节位域  |	key [GET type offset] [SET type offset value] [INCRBY type offset increment] [OVERFLOW WRAP/SAT/FAIL]
|BITPOS|查询指定字节区间第一个被设置成 1 的 bit 位的位置  |	key bit [start] [end]【@LBN】 |  |

# 代码实现
![](https://img-blog.csdnimg.cn/20210128141629760.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 位运算判断是否签到
![](https://img-blog.csdnimg.cn/20210128142405821.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210128142415746.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210128142523549.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 统计用户签到情况
获取用户某月签到情况，默认当前月，返回当前月的所有日期以及该日期的签到情况。

SignController
![](https://img-blog.csdnimg.cn/20210128173453153.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

SignService：
获取某月签到情况，默认当月：
- 获取登录用户信息
- 构建 Redis 保存的 Key
- 获取月份的总天数（考虑 2 月闰、平年）
- 通过 BITFIELD 指令获取当前月的所有签到数据
- 遍历进行判断是否签到，并存入 TreeMap 方便排序
![](https://img-blog.csdnimg.cn/20210128173342301.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 总结
由于 String 数据类型的最大长度是 512M，所以 String 支持的位数是 2^32 位。512M 表示字节 Byte 长度，换算成位 bit 需要乘以 8，即 512  2^10  2^10 * 8=2^32；
Strings 的最大长度是 512M，还能存更大的数据？当然不能，但是我们可以换种实现思路，就是将大 key 换成小 key，这样存储的大小完全不受限。