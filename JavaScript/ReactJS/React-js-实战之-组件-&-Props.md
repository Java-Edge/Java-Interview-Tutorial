> 组件可以将UI切分成一些独立的、可复用的部件，这样就只需专注于构建每一个单独的部件

组件从概念上看就像是函数，它可以接收任意的输入值（称之为`props`），并返回一个需要在页面上展示的React元素

# 函数定义/类定义组件
定义一个组件最简单的方式是使用JavaScript函数
![](https://upload-images.jianshu.io/upload_images/4685968-f04e96ffc70b4bc2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
该函数是一个有效的React组件，它接收一个单一的“props”对象并返回了一个React元素。我们之所以称这种类型的组件为函数定义组件，是因为从字面上来看，它就是一个JavaScript函数。

- 也可使用 [ES6 class](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes) 来定义一个组件
![](https://upload-images.jianshu.io/upload_images/4685968-8379d630a347cf5f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

上面两个组件在React中是相同的

下节讨论类的一些额外特性。在那之前，都将使用较为简洁的函数定义组件。
# 组件渲染
- 在前面，我们遇到的React元素都只是DOM标签
![](https://upload-images.jianshu.io/upload_images/4685968-0327c8319f6beb38.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- React元素也可以是用户自定义的组件
![](https://upload-images.jianshu.io/upload_images/4685968-57e405160022a195.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

当React遇到的元素是用户自定义的组件，它会将JSX属性作为单个对象传递给该组件，这个对象称之为`props`

例如,这段代码会在页面上渲染出”Hello,sss”
![](https://upload-images.jianshu.io/upload_images/4685968-50eb4010d7e3227d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们来回顾一下在这个例子中发生了什么：
- 我们对`<Welcome name="sss" />`元素调用了`ReactDOM.render()`
- React将`{name: 'sss'}`作为`props`传入并调用`Welcome`组件
- Welcome组件将`<h1>Hello, sss</h1>`元素作为结果返回。
- React DOM将DOM更新为<h1>Hello, sss</h1>

>警告:
组件名称必须以大写字母开头。
例如，<div /> 表示一个DOM标签，但 <Welcome /> 表示一个组件，并且在使用该组件时你必须定义或引入之

# 组合组件
组件可以在它的输出中引用其它组件，这就可以让我们用同一组件来抽象出任意层次的细节
在React应用中，按钮、表单、对话框、整个屏幕的内容等，这些通常都被表示为组件

例如，我们可以创建一个App组件，用来多次渲染Welcome组件
![](https://upload-images.jianshu.io/upload_images/4685968-248a7ffb078869ef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

通常，一个新的React应用程序的顶部是一个App组件
但是，如果要将React集成到现有应用程序中，则可以从下而上使用像Button这样的小组件作为开始，并逐渐运用到视图层的顶部

>警告:
组件的返回值只能有一个根元素
这也是要用一个`<div>`来包裹所有`<Welcome />`元素的原因
# 提取组件
你可以将组件切分为更小的组件，这没什么好担心的。

例如，来看看这个Comment组件：
![](https://upload-images.jianshu.io/upload_images/4685968-dd80dabce51ddc38.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这个组件接收author(对象)、text(字符串)、以及date(Date对象)作为props，用来描述一个社交媒体网站上的评论

这个组件由于嵌套，变得难以被修改，可复用的部分也难以被复用
所以让我们从这个组件中提取出一些小组件

- 首先，我们来提取Avatar组件：
![](https://upload-images.jianshu.io/upload_images/4685968-93581a61844ad2c1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Avatar作为Comment的内部组件，不需要知道是否被渲染
因此我们将author改为一个更通用的名字user

建议从`组件自身的角度`来命名props，而`不是根据使用组件的上下文`命名

现在我们可以对Comment组件做一些小小的调整
![](https://upload-images.jianshu.io/upload_images/4685968-f5404d292712c4bd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

接下来，我们要提取一个UserInfo组件，用来渲染Avatar旁边的用户名
![](https://upload-images.jianshu.io/upload_images/4685968-a478923b52f0f897.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这可以让我们进一步简化Comment组件
![](https://upload-images.jianshu.io/upload_images/4685968-47ba258c51f58db2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

提取组件一开始看起来像是一项单调乏味的工作，但是在大型应用中，构建可复用的组件完全是值得的
当你的UI中有一部分重复使用了好几次（比如，Button、Panel、Avatar），或者其自身就足够复杂（比如，App、FeedStory、Comment），类似这些都是抽象成一个可复用组件的绝佳选择，这也是一个比较好的做法

# Props的只读性
无论是使用[函数或是类](https://react.docschina.org/docs/components-and-props.html#%E5%87%BD%E6%95%B0%E5%AE%9A%E4%B9%89/%E7%B1%BB%E5%AE%9A%E4%B9%89%E7%BB%84%E4%BB%B6)来声明一个组件，它决不能修改它自己的props
- 来看这个`sum`函数
![](https://upload-images.jianshu.io/upload_images/4685968-f85a8baa9be752cd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
类似于上面的这种函数称为[“纯函数”](https://en.wikipedia.org/wiki/Pure_function)，它没有改变它自己的输入值，当传入的值相同时，总是会返回相同的结果

与之相对的是非纯函数，它会改变它自身的输入值
![](https://upload-images.jianshu.io/upload_images/4685968-a92b74c26f25fbf2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

React是非常灵活的，但它也有一个严格的规则：

**所有的React组件必须像纯函数那样使用它们的props**

当然，应用的界面是随时间动态变化的，下节介绍一种称为“state”的新概念，State可以在不违反上述规则的情况下，根据用户操作、网络响应、或者其他状态变化，使组件动态的响应并改变组件的输出



# sublime 插件安装
用Package Control安装
按下`Ctrl+Shift+P`调出命令面板 
输入`install` 调出 `Install Package` 选项并回车，然后在列表中选中要安装的插件
 
![](https://upload-images.jianshu.io/upload_images/4685968-269620ccb50bb392.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- function形式
![](https://upload-images.jianshu.io/upload_images/4685968-7904f8f781784156.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-79b1365a8053f4c6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
es6形式
![](https://upload-images.jianshu.io/upload_images/4685968-9d0a3a9a4b8d3a67.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e0b71c715c7fe75d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- state属性
    - 用来存储组件自身需要的数据。它是可以改变的，它的每次改变都会引发组件的更新。这也是 ReactJS 中的关键点之一。
    - 即每次数据的更新都是通过修改 state 属性的值，然后 ReactJS 内部会监听 state 属性的变化，一旦发生变化，就会触发组件的 render 方法来更新 DOM 结构。
- props属性介绍：
    - props 是一个对象，是组件用来接收外面传来的参数的。
    - 组件内部是不允许修改自己的 props 属性，只能通过父组件来修改。上面的 getDefaultProps 方法便是处理 props 的默认值的。
![](https://upload-images.jianshu.io/upload_images/4685968-4341391ce68b715a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#组件间通信
父子组件间通信
这种情况下很简单，就是通过 props 属性传递，在父组件给子组件设置 props，然后子组件就可以通过 props 访问到父组件的数据／方法，这样就搭建起了父子组件间通信的桥梁。
```
import React, { Component } from 'react';
import { render } from 'react-dom';

class GroceryList extends Component {
  handleClick(i) {
    console.log('You clicked: ' + this.props.items[i]);
  }

  render() {
    return (
      <div>
        {this.props.items.map((item, i) => {
          return (
            <div onClick={this.handleClick.bind(this, i)} key={i}>{item}</div>
          );
        })}
      </div>
    );
  }
}

render(
  <GroceryList items={['Apple', 'Banana', 'Cranberry']} />, mountNode
);
```
div 可以看作一个子组件，指定它的 onClick 事件调用父组件的方法。
父组件访问子组件？用 refs
![在子组件改变父组件属性](https://upload-images.jianshu.io/upload_images/4685968-a79ae5a9b6f9c771.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
import React from 'react';
import ReactDOM from 'react-dom';

// 基础组件写法
function Component(){
    return <h1>I am sss</h1>
}

class ES6Component extends React.Component{
    render(){
        return <h1>I am sss in es6</h1>
    }
}

ReactDOM.render(
    <div>
        <Component/>
        <ES6Component/>
    </div>,
    document.getElementById('app')
);

// status && props
class Component extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        setTimeout(()=>{
            this.setState({
                name: 'sss Test'
            })
        },2000)
        return <h1>I am {this.state.name}</h1>
    }
}

ReactDOM.render(
    <div>
        <Component name="sss"/>
    </div>,
    document.getElementById('app')
);


// 事件处理方式1
class Component extends React.Component{
    constructor(props){
        super(props);
        this.state={
            name : 'sss',
            age : 18
        }
        this.handleClick = this.handleClick.bind(this)
    }
    handleClick(){
        this.setState({
            age : this.state.age + 1
        });
    }
    render(){
        return (
        <div>
            <h1>I am {this.state.name}</h1>
            <p>I am {this.state.age} years old!</p>
            <button onClick={this.handleClick}>加一岁</button>
        </div>
        );
    }
}



// 事件处理方式2
class Component extends React.Component{
    constructor(props){
        super(props);
        this.state={
            name : 'sss',
            age : 18
        }
    }
    handleClick(){
        this.setState({
            age : this.state.age + 1
        });
    }
    onValueChange(e){
        this.setState({
            age : e.target.value
        });
    }
    render(){
        return (
        <div>
            <h1>I am {this.state.name}</h1>
            <p>I am {this.state.age} years old!</p>
            <button onClick={(e) => {this.handleClick(e)}}>加一岁</button>
            <input type="text" onChange={(e) => {this.onValueChange(e)}}/>
        </div>
        );
    }
}



// 组件的组合方式
class Component extends React.Component{
    constructor(props){
        super(props);
        this.state={
            name : 'sss',
            age : 18
        }
    }
    handleClick(){
        this.setState({
            age : this.state.age + 1
        });
    }
    onValueChange(e){
        this.setState({
            age : e.target.value
        });
    }
    render(){
        return (
        <div>
            <h1>I am {this.state.name}</h1>
            <p>I am {this.state.age} years old!</p>
            <button onClick={(e) => {this.handleClick(e)}}>加一岁</button>
            <input type="text" onChange={(e) => {this.onValueChange(e)}}/>
        </div>
        );
    }
}

class Title extends React.Component{
    constructor(props){
        super(props);
    }
    render(props){
        return <h1>{this.props.children}</h1>
    }

}
class App extends React.Component{
    render(){
        return (
            <div className="">
                {/* 容器式组件 */}
                <Title>
                    <span>App Span</span>
                    <a href="">link</a>
                </Title>
                <hr/>
                {/* 单纯组件 */}
                <Component/>
            </div>
        );
    }
}


// 数据传递和状态提升
class Child1 extends React.Component{
    constructor(props){
        super(props);
    }
    handleClick(){
        this.props.changeChild2Color('red');
    }
    render(){
        return (
        <div>
            <h1>Child1： {this.props.bgColor}</h1>
            <button onClick={(e) => {this.handleClick(e)}}>改变child2 颜色</button>
        </div>
        );
    }
}
class Child2 extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return (
        <div style={{background:this.props.bgColor}}>
            <h1>Child2背景颜色： {this.props.bgColor}</h1>
        </div>
        );
    }
}

class Father extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            child2BgColor: '#999'
        }
    }
    onChild2BgColorChange(color){
        this.setState({
            child2BgColor : color
        })
    }
    render(props){
        return (
        <div>
            <Child1 changeChild2Color={(color) => {this.onChild2BgColorChange(color)}}/>
            <Child2 bgColor={this.state.child2BgColor}/>
        </div>
        );
    }

}
```
