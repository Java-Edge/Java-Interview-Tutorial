![](https://upload-images.jianshu.io/upload_images/4685968-53bf2f140e5d98b6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
在项目中引入并使用 JSX
![添加支持](https://upload-images.jianshu.io/upload_images/4685968-885c2e2934da887a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![插件支持](https://upload-images.jianshu.io/upload_images/4685968-3b3c3bb8534b0bef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![引入依赖](https://upload-images.jianshu.io/upload_images/4685968-ac431d8dfbd065e8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
React提供的环境搭建工具演示
![新建test项目](https://upload-images.jianshu.io/upload_images/4685968-6b349de565dcfe28.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-89c21d67a9f1465d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![yarn start](https://upload-images.jianshu.io/upload_images/4685968-8380585894f4d26e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![可以将配置文件提出来](https://upload-images.jianshu.io/upload_images/4685968-6e25f2ebf830e983.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![yarn eject](https://upload-images.jianshu.io/upload_images/4685968-be7f41ac5a936de5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
配置文件可读性差,因此不考虑使用这种现成方式写项目,跳过吧
![](https://upload-images.jianshu.io/upload_images/4685968-d89aeda48085e76c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们来观察一下声明的这个变量：
```
const element = <h1>Hello, world!</h1>;
```
这种看起来可能有些奇怪的标签语法既不是字符串也不是 HTML
它被称为 JSX， 一种 JavaScript 的语法扩展
推荐在 React 中使用 JSX 来描述用户界面
JSX 乍看起来可能比较像是模版语言，但事实上它完全是在 JavaScript 内部实现的

JSX 用来声明 React 当中的元素。在下节会详细介绍元素是如何被渲染出来的

先来看看 JSX 的基本使用方法
# 在 JSX 中使用表达式
可任意地在 JSX 当中使用 [JavaScript 表达式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators#Expressions)，在 JSX 当中的表达式要包含在大括号里

例如 `2 + 2`， `user.firstName`， 以及 `formatName(user)` 都是可以使用的
```
function formatName(user) {
  return user.firstName + ' ' + user.lastName;
}

const user = {
  firstName: 'Harper',
  lastName: 'Perez'
};

const element = (
  <h1>
    Hello, {formatName(user)}!
  </h1>
);

ReactDOM.render(
  element,
  document.getElementById('root')
);
```
- [在 CodePen 上试试](http://codepen.io/gaearon/pen/PGEjdG?editors=0010)
![](https://upload-images.jianshu.io/upload_images/4685968-11e62e4e052c1251.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

书写 JSX 的时候一般都会带上换行和缩进，这样可以增强代码的可读性
同样推荐在 JSX 代码的外面扩上一个小括号，这样可以防止 [分号自动插入](http://stackoverflow.com/q/2846283) 的 bug

# JSX 本身其实也是一种表达式
在编译后，JSX 其实会被转化为普通的 JavaScript 对象

这意味着，你其实可以在 if 或者 for 语句里使用 JSX，将它赋值给变量，当作参数传入，作为返回值都可以
```
function getGreeting(user) {
  if (user) {
    return <h1>Hello, {formatName(user)}!</h1>;
  }
  return <h1>Hello, Stranger.</h1>;
}
```
# JSX 属性
## 使用引号来定义以字符串为值的属性
```
const element = <div tabIndex="0"></div>;
```
## 使用大括号来定义以 JavaScript 表达式为值的属性
```
const element = <img src={user.avatarUrl}></img>;
```
切记你使用了大括号包裹的 JavaScript 表达式时就不要再到外面套引号了
`JSX 会将引号当中的内容识别为字符串而不是表达式`
# JSX 嵌套
若 JSX 标签是闭合式的，需在结尾处用` />`, 就好像 XML/HTML 一样
![](https://upload-images.jianshu.io/upload_images/4685968-17b57bc0c305a801.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

JSX 标签同样可以相互嵌套
![](https://upload-images.jianshu.io/upload_images/4685968-c93c07aa27a4a1bd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

>**警告:**
因为 JSX 的特性更接近 JavaScript 而不是 HTML , 所以 React DOM 使用 `camelCase` 小驼峰命名 来定义属性的名称，而不是使用 HTML 的属性名称
如 `class` 变成了 [`className`](https://developer.mozilla.org/en-US/docs/Web/API/Element/className)
而 `tabindex` 则对应着 [`tabIndex`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/tabIndex)
# JSX 防注入攻击
可放心在 JSX 当中使用用户输入
![](https://upload-images.jianshu.io/upload_images/4685968-79ba2b05aafa51f4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

React DOM 在渲染之前默认会 [过滤](http://stackoverflow.com/questions/7381974/which-characters-need-to-be-escaped-on-html) 所有传入的值
它可以确保你的应用不会被注入攻击。所有的内容在渲染之前都被转换成了字符串。这样可以有效地防止 [XSS(跨站脚本)](https://en.wikipedia.org/wiki/Cross-site_scripting) 攻击

# JSX 代表 Objects
Babel 转译器会把 JSX 转换成一个名为 `React.createElement()`的方法调用

下面两种代码的作用是完全相同的
![](https://upload-images.jianshu.io/upload_images/4685968-565f21c6af404a14.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-5f28df4f5a1994e8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

`React.createElement() `首先会进行一些避免bug的检查，之后会返回一个类似下面例子的对象
![](https://upload-images.jianshu.io/upload_images/4685968-cc428b56170551aa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这样的对象被称为 “React 元素”。它代表所有你在屏幕上看到的东西。React 通过读取这些对象来构建 DOM 并保持数据内容一致。

我们将在下一个章节当中介绍更多有关 React 元素 是如何渲染成 DOM 的内容。

>Tip:
如果你是在使用本地编辑器编写 JSX 代码的话，推荐你去装一个支持 JSX 高亮的插件，这样更方便之后的开发学习。
# JSX 的怪异之处
JSX 偶尔也比较奇怪。针对在使用JSX 构建组件时可能会遇到的常见问题，本节汇总了一些小技巧、提示和策略来供你应对。
- 单一根节点
React 组件只能渲染一个根节点。想要了解这个限制的原因，我们先来看看render函数的一个返回示例：

```
return(  
    <h1>Hello World</h1> 
) 
```

它会被转换成一条语句：

`return React.createElement("h1",null,"Hello World"); `

但是，下面的代码却不是合法的：

```
return (  
<h1>Hello World</h1> 
<h2>Have a nice day</h2> 
) 
```

需要明确的是，这并非JSX 的限制，而是JavaScript 的一个特性：一条返回语句只能返回单个值，而在前面的代码中我们尝试返回两条语句(两次React.createElement 调用)。解决的方法非常简单：就像你在普通JavaScript 中会做的那样，将所有返回值包含到一个根对象中。

```
return (  
<div> 
<h1>Hello World</h1> 
<h2>Have a nice day</h2> 
</div> 
) 
```

它完全有效，因为它会被转换成：

```
return React.createElement("div",null,  
React.createElement("h1",null,"Hello World"),  
React.createElement("h2",null," Have a nice day"),  
) 
```

它返回单个值，并且是通过合法的JavaScript 完成的。

- 条件语句
如果语句不兼容于JSX，看上去像是JSX 的限制所致，实际上却是因为JSX 只是普通的JavaScript
回顾一下JSX 是如何被转换为普通JavaScript 
如下JSX
```
return (  
      <div className="salutation">Hello JSX</div> 
) 
```
会被转换成这样的JavaScript
```
return (  
    React.createElement("div",{className:"salutation"},"Hello JSX");  
) 
```

然而，如果尝试在JSX 的中间编写if 语句，例如：
`<div className={if (condition) { "salutation" }}>Hello JSX</div> `

它就会被转换成一个非法的JavaScript 表达式，如图2-1 所示：

[![image](http://upload-images.jianshu.io/upload_images/4685968-55ce124f80c28fab.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)](https://s1.51cto.com/wyfs02/M02/96/4A/wKioL1ke8qCD28MXAAA3kuzHIgA061.jpg) 

- 有什么解决方法？
尽管并无可能在JSX 中使用“if”语句，但仍有根据条件渲染内容的方法，包括使用三元表达式和将条件赋值给一个变量(空值和未定义的值都会被React 进行处理，JSX在转义时什么都不会输出)。

使用三元表达式

如果你有一个非常简单的表达式，可以使用三元形式：

```
render() {  
  return (  
    <div className={condition ? "salutation" : ""}> 
      Hello JSX  
    </div> 
  )  
} 
```

这段代码会被转换成一段合法的JavaScript：

```
React.createElement("div",{className: condition ?"salutation" : ""},  
"Hello JSX"); 
```

三元形式还可用来有条件地渲染整个节点：
```
<div> 
{condition ?  
<span>Hello JSX</span> 
: null}  
</div> 
```

将条件外置

如果三元表达式还不能应付你的要求，解决方法是不要在JSX 的中间使用条件。简单地将条件语句移动到外部(就像你在第2 章中隐藏和显示ContactItem 细节时所采取的方法)。

下面是原先的代码：
```

1.  render() {  
2.  return (  
3.  <div className={if (condition) { "salutation" }}> 
4.  Hello JSX  
5.  </div> 
6.  )  
7.  } 

```

将条件移动到JSX 的外部，就像：

```
render() {  
let className;  
if(condition){  
className = "salutation";  
}  
return (  
<div className={className}>Hello JSX</div> 
)  
} 
```
React 知道如何处理未定义的值，如果条件为假，它甚至不会在div 标签中创建class特性。

