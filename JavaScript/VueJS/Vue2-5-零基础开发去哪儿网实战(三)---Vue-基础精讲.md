# 1  Vue实例
- 基本规范编写
![](https://upload-images.jianshu.io/upload_images/4685968-3238c72459653eb1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0eb9eae10d4312c3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 绑定事件
![](https://upload-images.jianshu.io/upload_images/4685968-706066d6bb88d5ee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 这里的 v-on 其实等价于下面的简易写法
![](https://upload-images.jianshu.io/upload_images/4685968-30d59f9ac26c830e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 没错,直接@即可!
![](https://upload-images.jianshu.io/upload_images/4685968-fc0b718d144019ef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/4685968-45eb8b2ab44e208e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 定义小组件
- 定义其他小组件
![](https://upload-images.jianshu.io/upload_images/4685968-f6ff6b131b865e9b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 使用该小组件
![](https://upload-images.jianshu.io/upload_images/4685968-57d0263104f00dcf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-50f3b7a7629fa124.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

>所以呢,在定义组件时,Vue 底层也会将其编译为一个 Vue 实例,所以可以理解成一个Vue 项目就是很多 小组件/Vue 实例 所构成的.

## 其他骚操作
- 显然,vm 是一个被我们定义的 Vue 实例, 凡实例就有自己的数据与方法.
![](https://upload-images.jianshu.io/upload_images/4685968-f5a42410fed68680.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- vm实例的数据
![](https://upload-images.jianshu.io/upload_images/4685968-18f5aca5eeadd4ff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 该实例负责接管的 DOM 的最外层标签内容
![](https://upload-images.jianshu.io/upload_images/4685968-3f68c765153106b0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 帮助销毁该实例的方法
![](https://upload-images.jianshu.io/upload_images/4685968-430eeecbf2ce9119.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
如何验证?因为之后通过控制台改变数据值后,页面值并无变化,已经不存在双向绑定.

# 2  Vue实例生命周期

## 2.1  实例生命周期钩子
每个 Vue 实例在被创建时都要经过一系列的初始化过程.
例如，需要设置数据监听、编译模板、将实例挂载到 DOM 并在数据变化时更新 DOM 等.
同时在这个过程中也会运行一些叫做**生命周期钩子**的函数，这给了用户在不同阶段添加自己的代码的机会.

比如`created`钩子可以用来在一个实例被创建之后执行代码

![](https://upload-images.jianshu.io/upload_images/4685968-4a9c7c7b7ba24f6b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
也有一些其它的钩子，在实例生命周期的不同阶段被调用，如 [`mounted`](https://cn.vuejs.org/v2/api/#mounted)、[`updated`](https://cn.vuejs.org/v2/api/#updated)和 [`destroyed`](https://cn.vuejs.org/v2/api/#destroyed)。生命周期钩子的 `this` 上下文指向调用它的 Vue 实例.

不要在选项属性或回调上使用箭头函数，比如 `created: () => console.log(this.a)` 或 `vm.$watch('a', newValue => this.myMethod())`。因为箭头函数是和父级上下文绑定在一起的，`this` 不会是如你所预期的 Vue 实例，经常导致 `Uncaught TypeError: Cannot read property of undefined` 或 `Uncaught TypeError: this.myMethod is not a function` 之类的错误。

## 2.2 生命周期图示
下图展示了实例的生命周期。你不需要立马弄明白所有的东西，不过随着你的不断学习和使用，它的参考价值会越来越高
![](https://upload-images.jianshu.io/upload_images/4685968-ed996b4c0f1377c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 3 Vue的模版语法
# 4 计算属性,方法与侦听器
# 5 计算属性的 getter 和 setter
# 6 Vue中的样式绑定
# 7  Vue中的条件渲染
# 8 Vue中的列表渲染
# 9 Vue中的set方法
