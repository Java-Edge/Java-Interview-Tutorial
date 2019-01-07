# 0 前言
全是干货的技术殿堂

> `文章收录在我的 GitHub 仓库，欢迎Star/fork：`
[Java-Interview-Tutorial](https://github.com/Wasabi1234/Java-Interview-Tutorial)
https://github.com/Wasabi1234/Java-Interview-Tutorial

this 是函数运行时，在函数体内部自动生成的一个对象，只能在函数体内部使用。

教科书般的解释,字都认识,怎么连在一起还是不知道啥意思呢?

# 1 this的值究竟是什么呢？
函数的不同场合，this有不同值。

总的来说，this就是函数运行时所在的环境对象。



## 1.1 简单函数调用
函数的最通常用法，属全局性调用，因此this就代表全局对象。

- 看下面案例
![](https://img-blog.csdnimg.cn/20200303121227747.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 1.2 作为对象方法的调用
函数还可以作为某个对象的方法调用，这时this就指这个上级对象。
![](https://img-blog.csdnimg.cn/20200303121422511.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

记住一条：当function被作为method调用时，this指向调用对象。另外，JavaScript并不是OO的，而是object based的一种语言。


## 1.3 构造函数
所谓构造函数，就是通过这个函数，可以生成一个新对象。这时，this就指这个新对象。

![](https://img-blog.csdnimg.cn/20200303115649894.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200303115806899.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 上面两套代码等效
可以写class test,但本质上new test()的时候，还是test构造函数,差不多，class主要是向java之类的语言抄的,可以直接当java的类用,但本质上test还是个构造函数,因为js一开始就没有class
只能用构造函数，函数test运行时，内部会自动有一个this对象可以使用。
![](https://img-blog.csdnimg.cn/20200303121924181.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

运行结果为1。为了表明这时this不是全局对象，我们对代码做一些改变：
![](https://img-blog.csdnimg.cn/20200303122032193.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)运行结果为2，表明全局变量x的值根本没变。

## 1.4 apply 调用

apply()是函数的一个方法，作用是改变函数的调用对象。它的第一个参数就表示改变后的调用这个函数的对象。因此，这时this指的就是这第一个参数。
![](https://img-blog.csdnimg.cn/2020030312210928.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)


apply()的参数为空时，默认调用全局对象。因此，这时的运行结果为0，证明this指的是全局对象。

如果把最后一行代码修改为

![](https://img-blog.csdnimg.cn/20200303122139135.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
运行结果就变成了1，证明了这时this代表的是对象obj。

# 2 深入内存分析
学懂 JavaScript 语言，一个标志就是理解下面两种写法，可能有不一样的结果。

![](https://img-blog.csdnimg.cn/20200303122759428.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
上面代码中，虽然obj.foo和foo指向同一个函数，但是执行结果可能不一样。请看下面的例子。
![](https://img-blog.csdnimg.cn/20200303123037386.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 对于obj.foo()来说，foo运行在obj环境，所以this指向obj
- 对于foo()来说，foo运行在全局环境，所以this指向全局环境。所以，两者的运行结果不一样。

为什么会这样？函数的运行环境到底是谁决定的？为什么obj.foo()就是在obj环境执行，而一旦var foo = obj.foo，foo()就变成全局环境执行了？

带着灵魂的思考,我们深入解析下
## 2.1 内存布局
![](https://img-blog.csdnimg.cn/20200303124123927.png)
上面的代码将一个对象赋值给变量obj.

- JS 引擎会先在内存里面，生成一个对象`{ foo: 5 }`，然后把这个对象的内存地址赋值给变量obj。
![](https://img-blog.csdnimg.cn/20200303124158211.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

变量obj是一个地址（reference）。后面如果要读取obj.foo，引擎先从obj拿到内存地址，然后再从该地址读出原始的对象，返回它的foo属性。

原始的对象以字典结构保存，每一个属性名都对应一个属性描述对象。举例来说，上面例子的foo属性，实际上是以下面的形式保存的。
![](https://img-blog.csdnimg.cn/20200303124411665.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
```bash
{
  foo: {
    [[value]]: 5
    [[writable]]: true
    [[enumerable]]: true
    [[configurable]]: true
  }
}
```

注意，foo属性的值保存在属性描述对象的value属性里面。

# 3 函数
这样的结构是很清晰的，问题在于属性的值可能是一个函数。
![](https://img-blog.csdnimg.cn/20200303124533209.png)

- 引擎会将函数单独保存在内存中，然后再将函数的地址赋值给foo属性的value属性
![](https://img-blog.csdnimg.cn/20200303124656558.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

```bash
{
  foo: {
    [[value]]: 函数的地址
    ...
  }
}
```

由于函数是一个单独的值，所以它可以在不同的环境（上下文）执行。

![](https://img-blog.csdnimg.cn/20200303124754971.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 4 环境变量
JavaScript 允许在函数体内部，引用当前环境的其他变量。
![](https://img-blog.csdnimg.cn/20200303125054228.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
上面代码中，函数体里面使用了变量x。该变量由运行环境提供。

现在问题就来了，由于函数可以在不同的运行环境执行，所以需要有一种机制，能够在函数体内部获得当前的运行环境（context）。所以，this就出现了，它的设计目的就是在函数体内部，指代函数当前的运行环境。
![](https://img-blog.csdnimg.cn/20200303125513273.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
上面代码中，函数体里面的this.x就是指当前运行环境的x。


```javascript
var f = function () {
  console.log(this.x);
}

var x = 1;
var obj = {
  f: f,
  x: 2,
};

// 单独执行
f() // 1

// obj 环境执行
obj.f() // 2
```

上面代码中，函数f在全局环境执行，this.x指向全局环境的x。

![](https://img-blog.csdnimg.cn/20200303125602713.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

在obj环境执行，this.x指向obj.x。

![](https://img-blog.csdnimg.cn/20200303125614741.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

回到本文开头提出的问题，obj.foo()是通过obj找到foo，所以就是在obj环境执行。一旦var foo = obj.foo，变量foo就直接指向函数本身，所以foo()就变成在全局环境执行。
# 参考

- [Javascript 的 this 用法](https://www.ruanyifeng.com/blog/2010/04/using_this_keyword_in_javascript.html)
- [JavaScript 的 this 原理](https://www.ruanyifeng.com/blog/2018/06/javascript-this.html)