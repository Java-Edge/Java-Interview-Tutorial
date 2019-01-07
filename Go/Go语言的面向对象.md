go语言仅支持封装，不支持继承和多态。
go语言没有class，只有struct。

# 结构的定义
![](https://img-blog.csdnimg.cn/20201223155119118.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
- go 语言即使是指针，不像 C语言使用`->`也可一直使用`.`引用下去![](https://img-blog.csdnimg.cn/20201223192039227.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
- go 没有构造器，但可使用工厂函数
![](https://img-blog.csdnimg.cn/20201223193155572.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
那么这到底创建在了堆还是栈呢？
不需要知道。如果返回了没人用就在栈上
如果返回了有人用，就在堆，并参与到 GC。
所以没必要知道，编译器自己都知道。

# 参数前后区别
- 参数定义在函数名前后有啥区别呢？
![](https://img-blog.csdnimg.cn/20201223194005570.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
- 使用区别
![](https://img-blog.csdnimg.cn/20201223194043874.png)
Go都是值传递，记住了，和 Java 一样。

# 使用指针作为方法接收者
![](https://img-blog.csdnimg.cn/20201223200025882.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
- 只有使用指针才可以改变结构内容
- nil 指针也可调用方法（Go 很特殊）

# 值接收者 V.S 指针接收者
- 要改变内容必须使用指针接收者
- 结构过大也考虑使用指针接收者
- 一致性:如有指针接收者,最好都是指针接收者


值接收者才是go语言特有的！
值/指针接收者均可接收值/指针