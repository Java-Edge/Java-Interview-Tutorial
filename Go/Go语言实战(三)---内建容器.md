# 1 数组
数组是单一类型元素的编号序列，该单一类型称为元素类型。元素的数量称为长度且为非负数。

>数组类型 = "[" 数组长度 "]" 元素类型 .
数组长度 = 表达式 .
元素类型 = 类型 .

长度是数组类型的一部分，其求值结果必须可表示为 `int` 类型的非负
数组 `a` 的长度可使用内建函数 [`len`]获取， 其元素可通过整数[下标]0 到 `len(a)-1` 寻址
 数组类型总是一维的，但可组合构成多维的类型。
```
[32]byte
[2*N] struct { x, y int32 }
[1000]*float64
[3][5]int
[2][2][2]float64  // 等价于[2]([2]([2]float64))
```
## 构造数组
![](https://upload-images.jianshu.io/upload_images/4685968-21b6511cb0771db4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![运行结果](https://upload-images.jianshu.io/upload_images/4685968-c93e33633eec5e22.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 遍历
- 首先想到这样
![](https://upload-images.jianshu.io/upload_images/4685968-c59b16f93675b8a1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 但是通常使用 range关键字遍历
![](https://upload-images.jianshu.io/upload_images/4685968-30c512bd06035fb5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-621aaf1e5fa8cdb3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 为什么要用 range
![](https://upload-images.jianshu.io/upload_images/4685968-8eae12986ac725c9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 数组是值类型
![](https://upload-images.jianshu.io/upload_images/4685968-2befddde7ce6ce8c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-f8b18c079a3e1e52.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![运行结果](https://upload-images.jianshu.io/upload_images/4685968-a2a3ac6f37c0b7b4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-f137f07f12479533.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
要想传递引用可修改数组,可传指针参数
![](https://upload-images.jianshu.io/upload_images/4685968-3130ca70a71a94d7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 2 切片 (Slice) 的概念
切片是数组连续段的引用及包含此数组的元素的编号序列。 切片类型表示元素类型为数组的所有切片的集。未初始化切片的值为 nil。

>切片类型 = "[" "]" 元素类型 .

类似于数组，切片是可索引的且拥有一个长度
切片 `s` 的长度可通过内建函数 [`len`]获取；不同于数组的是，切片可`在执行过程中被改变`， 其元素可通过整数（§[下标]） 0 到 `len(s)-1` 寻址。 给定元素的切片下标可能小于它在其基本数组中的下标。

切片一旦初始化，就总是伴随着一个包含其元素的基本数组。
因此，切片与其数组及其它本数组的切片共享存储
 与此相反，不同的数组总是表示其不同的存储

切片的基本数组可扩展其切片的结尾
- **容量** 是该扩展的量度
它是切片的长度和切片往后数组的长度之和；长度达到其容量的切片可通过从原切片 （§[Slices](http://docscn.studygolang.com/ref/spec.old#Slices)）‘切下’一个新的来创建。 切片 `a` 的容量可使用内建函数 [`cap(a)`](http://docscn.studygolang.com/ref/spec.old#%E9%95%BF%E5%BA%A6%E4%B8%8E%E5%AE%B9%E9%87%8F) 获取。

给定元素类型 `T` 的一个新的，已初始化的切片值使用内建函数 [`make`](http://docscn.studygolang.com/ref/spec.old#%E5%88%9B%E5%BB%BA%E5%88%87%E7%89%87%E3%80%81%E6%98%A0%E5%B0%84%E4%B8%8E%E4%BF%A1%E9%81%93)创建， 它需要一个切片类型和指定其长度与可选容量的形参：
```
make([]T, length)
make([]T, length, capacity)
```
调用 make将分配一个被返回的切片值所引用的，新的、隐藏的数组。即，执行
```
make([]T, length, capacity)
```
产生切片与分配数组后再对其进行切片相同，因此这两个例子的结果为相同的切片：
```
make([]int, 50, 100)
new([100]int)[0:50]
```
类似于数组，切片总是一维的，但可组合构造更高维的对象
元素为数组的数组，根据其构造，其内部数组的长度始终相同
然而元素为切片的切片（或元素为数组的切片），其长度会动态地改变
此外，其内部的切片必须单独地（通过 make）分配


## 基本定义
![](https://upload-images.jianshu.io/upload_images/4685968-ead1ce9561545a4a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e41c5f608c014cc9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![运行结果](https://upload-images.jianshu.io/upload_images/4685968-12c9801aca625402.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 运行可修改
![](https://upload-images.jianshu.io/upload_images/4685968-2c896e39b6aea368.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# X 交流学习
![](https://upload-images.jianshu.io/upload_images/16782311-8d7acde57fdce062.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)


## [博客](https://blog.csdn.net/qq_33589510)



## [Github](https://github.com/Wasabi1234)

