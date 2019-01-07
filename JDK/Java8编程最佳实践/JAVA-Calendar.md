 Calendar.getInstance() 中所获得的实例就是一个 "GreogrianCalendar" 对象(与通过 new GregorianCalendar() 获得的结果一致)。

#Calendar 与 Date 的转换
Calendar calendar = Calendar.getInstance();
// 从一个 Calendar 对象中获取 Date 对象
Date date = calendar.getTime();
// 将 Date 对象反应到一个 Calendar 对象中，
// Calendar/GregorianCalendar 没有构造函数可以接受 Date 对象
// 所以我们必需先获得一个实例，然后设置 Date 对象
calendar.setTime(date);
#注意的事项：
##1. Calendar 的 set() 方法

set(int field, int value) - 是用来设置"年/月/日/小时/分钟/秒/微秒"等值

field 的定义在 Calendar 中

set(int year, int month, int day, int hour, int minute, int second) 但没有

set(int year, int month, int day, int hour, int minute, int second, int millisecond) 前面 set(int,int,int,int,int,int) 方法不会自动将 MilliSecond 清为 0。

另外，月份的起始值为０而不是１，所以要设置八月时，我们用７而不是8。

calendar.set(Calendar.MONTH, 7);

我们通常需要在程序逻辑中将它清为 0， Calendar 不是马上就刷新其内部的记录

在 Calendar 的方法中，get() 和 add() 会让 Calendar 立刻刷新。Set() 的这个特性会给我们的开发带来一些意想不到的结果。
##add() 与 roll() 的区别

add() 的功能非常强大，add 可以对 Calendar 的字段进行计算。如果需要减去值，那么使用负数值就可以了，如 add(field, -value)。

add() 有两条规则：

当被修改的字段超出它可以的范围时，那么比它大的字段会自动修正。如：
Calendar cal1 = Calendar.getInstance();
cal1.set(2000, 7, 31, 0, 0 , 0); //2000-8-31
cal1.add(Calendar.MONTH, 1); //2000-9-31 => 2000-10-1，对吗？
System.out.println(cal1.getTime()); //结果是 2000-9-30

另一个规则是，如果比它小的字段是不可变的（由 Calendar 的实现类决定），那么该小字段会修正到变化最小的值。

以上面的例子，9-31 就会变成 9-30，因为变化最小。

Roll() 的规则只有一条：
当被修改的字段超出它可以的范围时，那么比它大的字段不会被修正。如：

Calendar cal1 = Calendar.getInstance();
cal1.set(1999, 5, 6, 0, 0, 0); //1999-6-6, 周日
cal1.roll(Calendar.WEEK_OF_MONTH, -1); //1999-6-1, 周二
cal1.set(1999, 5, 6, 0, 0, 0); //1999-6-6, 周日
cal1.add(Calendar.WEEK_OF_MONTH, -1); //1999-5-30, 周日
WEEK_OF_MONTH 比 MONTH 字段小，所以 roll 不能修正 MONTH 字段。
