# 1 变量定义
![](https://upload-images.jianshu.io/upload_images/4685968-dcc545a0c25312cd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
var 语句定义了一个变量的列表；跟函数的参数列表一样，类型在后面。
就像在这个例子中看到的一样，`var` 语句可以定义在包或函数级别。

![](https://upload-images.jianshu.io/upload_images/4685968-c761b0b8887cb33b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-24cbfe3978b0a256.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
变量一旦定义了,就必须使用到,否则报错
![](https://upload-images.jianshu.io/upload_images/4685968-d9849076af8bd39e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
根据变量内容即可判断变量类型,无须再显式声明
![](https://upload-images.jianshu.io/upload_images/4685968-c033e5c0f088b243.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-49d94f156dd5b46e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-399b556331d40c82.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 总结
![](https://upload-images.jianshu.io/upload_images/4685968-159e6852758c709a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d1adadf8cea48117.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 2 内置变量类型
![](https://upload-images.jianshu.io/upload_images/4685968-ab2098c4512d04c3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 复数机制
![](https://upload-images.jianshu.io/upload_images/4685968-a3af538c25f3a461.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
验证欧拉公式
![](https://upload-images.jianshu.io/upload_images/4685968-e316fa9f439a6702.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 强制类型转换
![sqrt源码](https://upload-images.jianshu.io/upload_images/4685968-eb4bae006a5dee01.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
传参 int 直接报错
![](https://upload-images.jianshu.io/upload_images/4685968-01e1a1da01217af9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
因为没有隐式转换,只有显式的强制类型转换
![](https://upload-images.jianshu.io/upload_images/4685968-c22fda2c24ab0e0d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-82cd955ce6fe0838.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 3 常量与枚举
![](https://upload-images.jianshu.io/upload_images/4685968-8de62a5eb0bf7618.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![常量的定义](https://upload-images.jianshu.io/upload_images/4685968-793b802cb1aeb54d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-f5bd95e7786dbed5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
使用 iota 在 const 块定义中实现自增值
![iota = 0](https://upload-images.jianshu.io/upload_images/4685968-727bc25d5d409b51.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-26d00599bd2cab78.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![内存进制大小数值](https://upload-images.jianshu.io/upload_images/4685968-d052ac5984efae3f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![使用常量定义枚举类型](https://upload-images.jianshu.io/upload_images/4685968-61754fdce22e95a2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 常量定义要点回顾
![](https://upload-images.jianshu.io/upload_images/4685968-38af7e8d959d8bcf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 4 条件语句
## if
"If"语句根据一个布尔表达式的值指定两个分支的条件来执行。 若该表达式求值为true，则执行"if"分支，否则执行"else"分支
```
If语句 = "if" [ 简单语句 ";" ] 表达式 块 [ "else" ( If语句 | 块 ) ] .
```
```
if x > max {
	x = max
}
```
![](https://upload-images.jianshu.io/upload_images/4685968-1030048192aa8c60.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
工具方法,该方法有两个返回值哦!
![](https://upload-images.jianshu.io/upload_images/4685968-d455cae29784ba11.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![文件位置](https://upload-images.jianshu.io/upload_images/4685968-0f10aeb7c16461b1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-b3966cbf6a39a7dc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-023df8ffbbbdd0a6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## switch
"Switch"语句提供多路执行。表达式或类型说明符与"switch"中的"cases"相比较从而决定执行哪一分支。
```
Switch语句 = 表达式选择语句 | 类型选择语句 
```
![](https://upload-images.jianshu.io/upload_images/4685968-43a05a5d91b99c5b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c1f3b76493c2ba18.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-aa6666c6a42f0616.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-84520d3418ef0700.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-34463d922ce507b7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 循环
![](https://upload-images.jianshu.io/upload_images/4685968-afd40ac5b52b975d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-3994aac2770e4490.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0a56457977716208.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ead89acd1f82240d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-12979092e66a0dc5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-4c16122e1ce2a270.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-db220303bd7260ea.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-52430de72c205b31.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-28865bac63f52d6b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 5 函数
- 参数 参数类型,
![](https://upload-images.jianshu.io/upload_images/4685968-7ede8751dc54c5fc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-341698877c01a08c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- Go的函数可以返回多个值
![多返回值](https://upload-images.jianshu.io/upload_images/4685968-822efa5637e6f0b3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 若参数过多,这样并不是一种清晰的写法
![](https://upload-images.jianshu.io/upload_images/4685968-fdd54a3889db81c3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
建议如下最佳实践!
![](https://upload-images.jianshu.io/upload_images/4685968-704fe54da0cece27.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 多返回值函数,只接收一个返回值
![](https://upload-images.jianshu.io/upload_images/4685968-c582a9c2b3fb2933.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 对于多返回值参数,一般可用于返回`值 + error`
![](https://upload-images.jianshu.io/upload_images/4685968-c850ba0c797cd2cd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
比如这样,控制台输出就很难看,因为error直接程序中断了
![](https://upload-images.jianshu.io/upload_images/4685968-88ec2aed632194da.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-bf666abd6bf34d57.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d3e2f0d88b15b07a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c5d32e7246e69988.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 亦可写成匿名函数
![](https://upload-images.jianshu.io/upload_images/4685968-212c829f3b098030.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-50f02de0b6e82784.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
无默认参数,有可变参数,可变参数类型其实是[] type 类型
![](https://upload-images.jianshu.io/upload_images/4685968-98976a75ee0cbe25.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-91c8fb4da3fff9f0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-f516bfbbed050cf0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#  6 指针
![](https://upload-images.jianshu.io/upload_images/4685968-48f45af0ade89920.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 6.1 参数传递
![](https://upload-images.jianshu.io/upload_images/4685968-fae13000a0e0e46d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-cbdaefbf665f5318.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-433a6d23da7d5e90.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![1](https://upload-images.jianshu.io/upload_images/4685968-878f29183b7cc5f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![2](https://upload-images.jianshu.io/upload_images/4685968-37024340d43a58eb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![3](https://upload-images.jianshu.io/upload_images/4685968-e03a16755081e3f5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-26869ed2467509bd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c7b7a157d43769e0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
当然啦,还有最简单的
![](https://upload-images.jianshu.io/upload_images/4685968-b0283ef0cae97b30.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


# X 交流学习
![](https://upload-images.jianshu.io/upload_images/16782311-8d7acde57fdce062.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)


## [博客](https://blog.csdn.net/qq_33589510)



## [Github](https://github.com/Wasabi1234)

