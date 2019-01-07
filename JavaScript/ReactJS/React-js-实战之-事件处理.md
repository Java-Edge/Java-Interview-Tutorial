# 0 联系我
![](http://upload-images.jianshu.io/upload_images/4685968-6a8b28d2fd95e8b7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "图片标题") 
1.[Java开发技术交流Q群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)

2.[完整博客链接](https://blog.csdn.net/qq_33589510)

3.[个人知乎](http://www.zhihu.com/people/shi-shu-sheng-)

4.[gayhub](https://github.com/Wasabi1234)

React 元素的事件处理和 DOM元素的很相似。但是有一点语法上的不同:

React事件绑定属性的命名采用驼峰式写法，而不是小写。
如果采用 JSX 的语法你需要传入一个函数作为事件处理函数，而不是一个字符串(DOM元素的写法)
例如，传统的 HTML：
![](https://upload-images.jianshu.io/upload_images/4685968-042e501a230172b2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
React 中稍稍有点不同
![](https://upload-images.jianshu.io/upload_images/4685968-561dfa41bf3a69ca.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在 React 中另一个不同是你不能使用返回 false 的方式阻止默认行为。你必须明确的使用 preventDefault。例如，传统的 HTML 中阻止链接默认打开一个新页面，你可以这样写：
![](https://upload-images.jianshu.io/upload_images/4685968-f58eff6983ece4ce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
在 React，应该这样来写
![](https://upload-images.jianshu.io/upload_images/4685968-ae179d1f7aa58e74.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
在这里，`e` 是一个合成事件。React 根据 [W3C spec](https://www.w3.org/TR/DOM-Level-3-Events/) 来定义这些合成事件，所以你不需要担心跨浏览器的兼容性问题。查看 [SyntheticEvent](https://react.docschina.org/docs/events.html) 参考指南来了解更多。

使用 React 的时候通常你不需要使用 `addEventListener` 为一个已创建的 DOM 元素添加监听器。你仅仅需要在这个元素初始渲染的时候提供一个监听器。

- 当使用 [ES6 class](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes) 语法来定义一个组件的时候，事件处理器会成为类的一个方法.
例如，下面的 `Toggle` 组件渲染一个让用户切换开关状态的按钮：
![](https://upload-images.jianshu.io/upload_images/4685968-f814833acfca66db.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

必须谨慎对待 JSX 回调函数中的 `this`，类的方法默认是不会绑定`this` 的.
如果你忘记绑定 `this.handleClick` 并把它传入 `onClick`, 当你调用这个函数的时候 `this` 的值会是 `undefined`.

这并不是 React 的特殊行为；它是[函数如何在 JavaScript 中运行](https://www.smashingmagazine.com/2014/01/understanding-javascript-function-prototype-bind/)的一部分。通常情况下，如果你没有在方法后面添加 `()` ，例如 `onClick={this.handleClick}`，你应该为这个方法绑定 `this`。

如果使用 `bind` 让你很烦，这里有两种方式可以解决。如果你正在使用实验性的[属性初始化器语法](https://babeljs.io/docs/plugins/transform-class-properties/)，你可以使用属性初始化器来正确的绑定回调函数：
