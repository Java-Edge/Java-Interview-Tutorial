# 03-Go的数组array和切片slice语法详解

## 1 数组

同一种数据类型的固定长度的序列。

### 1.1 定义

```go
// 语法：
var a [len]int
//e.g.
var a [5]int
```

数组长度须常量，且是类型的组成部分。一旦定义，长度不能变。

**长度是数组类型的一部分**，因此，`var a[5] int`和`var a[10]int`是不同类型。

### 1.2 元素访问

可通过下标访问，下标范围：0~len-1：

```bash
for i := 0; i < len(a); i++ {
}
for index, v := range a {
}
```

> 为何使用 range
> 意义明确，美观
> C++ :没有类似能力
> Java/Python :只能for each value ,不能同时获取i, V

- 访问越界
  如果下标在数组合法范围之外，则触发访问越界，会panic

### 1.3 数组是值类型

赋值和传参会复制整个数组，而非指针。因此改变副本的值，不会改变本身的值。

`[10]int`和`[20]int`是不同类型，调用`func f(arr [10]int)` 会拷贝数组。

支持 "=="、"!=" 操作符，因为内存总是被初始化过的。但如果我们就是想引用传递的效果呢？

- 指针数组 [n]*T
- 数组指针 *[n]T

太复杂了，所以Go 一般不直接使用数组，而是切片！

## 2 切片

slice 并不是数组或数组指针，Slice本身没有数据，是对底层array的一个视图。
它通过内部指针和相关属性引用数组片段，以实现变长方案。

切片是数组的一个引用，因此切片是引用类型。但自身是结构体，值拷贝传递。
切片长度可变，切片就是个可变数组。
遍历方式和数组一样：

- len()长度表示可用元素数量，读写操作不能超过该限制
- cap可以求出slice最大扩张容量，不能超出数组限制。0 <= len(slice) <= len(array)，其中array是slice引用的数组。

### 2.0 定义

var 变量名 []类型，如

```go
var str []string  var arr []int
```

如 slice == nil，那么 len、cap 结果都等于 0。

```go
arr := [...]int{0, 1, 2, 3, 4, 5, 6, 7}
s := arr[2:6]
s[0] = 10
arr变为[0, 1, 10, 3, 4, 5, 6, 7]
```

### 2.1 创建



```go
func main() {
   // 1.声明切片
   var s1 []int
   if s1 == nil {
      fmt.Println("是空")
   } else {
      fmt.Println("不是空")
   }
   
   // 2.:=
   s2 := []int{}
   
   // 3.make()
   var s3 []int = make([]int, 0)
   fmt.Println(s1, s2, s3)
   
   // 4.初始化赋值
   var s4 []int = make([]int, 0, 0)
   fmt.Println(s4)
   s5 := []int{1, 2, 3}
   fmt.Println(s5)
   
   // 5.从数组切片
   arr := [5]int{1, 2, 3, 4, 5}
   var s6 []int
   
   // 前包后不包
   s6 = arr[1:4]
   fmt.Println(s6)
}
```

### 2.2 初始化



```go
// 全局：
var arr = [...]int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}
var slice0 []int = arr[start:end] 
var slice1 []int = arr[:end]        
var slice2 []int = arr[start:]        
var slice3 []int = arr[:] 
var slice4 = arr[:len(arr)-1]      //去掉切片的最后一个元素
// 局部：
arr2 := [...]int{9, 8, 7, 6, 5, 4, 3, 2, 1, 0}
slice5 := arr[start:end]
slice6 := arr[:end]        
slice7 := arr[start:]     
slice8 := arr[:]  
slice9 := arr[:len(arr)-1] //去掉切片的最后一个元素
```

### 2.3 Reslice



```go
arr := [...]int{0, 1, 2, 3, 4, 5, 6, 7}
s := arr[2:]
s := arr[:]
s = s[:5]
```

### 2.4 扩展 slice

s1 因为是视图，所以即使本身不存在 s1[4]，但还是能取得该值

```go
arr := [...]int{0, 1, 2, 3, 4, 5, 6, 7}
fmt.Println("arr =", arr)
s1 = arr[2:6] // [2 3 4 5]  len(s1)=4, cap(s1)=6
s2 = s1[3:5] // [s1[3], s1[4]] 即[5 6], len(s2)=2, cap(s2)=3
```

但 slice 只能向后扩展，不能向前哦：s[i]不可以超越len(s)，向后扩展不可以超越底层数组cap(s)：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/05/48211e5b30ce22e001f4f647e0cbc0b8.png)

### 2.5 slice咋实现的



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/05/3d2100e3ca70c27eba54d5160f062c32.png)

### 2.6 append 切片追加

添加元素时如果超越cap，系统会重新分配更大的底层数组。
由于值传递的关系，必须接收append的返回值。