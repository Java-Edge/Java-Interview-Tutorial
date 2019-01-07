ReactJS 的核心思想是组件化，即按功能封装成一个一个的组件，各个组件维护自己的状态和 UI，当状态发生变化时，会自定重新渲染整个组件，多个组件一起协作共同构成了 ReactJS 应用。

为了能够更好的创建和使用组件，我们首先要了解组件的生命周期。
生命周期
![](https://upload-images.jianshu.io/upload_images/4685968-9e91a1f72a17aadd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e238445a7ad94b0a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 1 组件的生命周期
创建阶段、实例化阶段、更新阶段、销毁阶段。
下面对各个阶段分别进行介绍。
## 1.1加载阶段
![](https://upload-images.jianshu.io/upload_images/4685968-7cd305fda1660409.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


*   该阶段主要发生在创建组件类的时候，即调用 `React.createClass` 时触发
*   这个阶段只会触发一个 `getDefaultProps` 方法，该方法会返回一个对象并缓存。然后与父组件指定的 `props` 对象合并，最后赋值给 `this.props` 作为该组件的默认属性。



## 1.2 实例化阶段
该阶段主要发生在实例化组件类的时候，也就是该组件类被调用的时候触发。
这个阶段会触发一系列的流程，按执行顺序如下
（1）`getInitialState`：初始化组件的 state 的值。其返回值会赋值给组件的 this.state 属性。
（2）`componentWillMount`：根据业务逻辑来对 state 进行相应的操作。
（3）`render`：根据 state 的值，生成页面需要的虚拟 DOM 结构，并返回该结构。
（4）`componentDidMount`：对根据虚拟 DOM 结构而生的真实 DOM 进行相应的处理。组件内部可以通过 ReactDOM.findDOMNode(this) 来获取当前组件的节点，然后就可以像 Web 开发中那样操作里面的 DOM 元素了。


## 1.3 更新阶段
![](https://upload-images.jianshu.io/upload_images/4685968-05443c196248ac99.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


这主要发生在用户操作之后或者父组件有更新的时候，此时会根据用户的操作行为进行相应得页面结构的调整。这个阶段也会触发一系列的流程，按执行顺序如下：
（1）componentWillReceiveProps：当组件接收到新的 props 时，会触发该函数。在改函数中，通常可以调用 this.setState 方法来完成对 state 的修改。
（2）shouldComponentUpdate：该方法用来拦截新的 props 或 state，然后根据事先设定好的判断逻辑，做出最后要不要更新组件的决定。
（3）componentWillUpdate：当上面的方法拦截返回 true 的时候，就可以在该方法中做一些更新之前的操作。
（4）render：根据一系列的 diff 算法，生成需要更新的虚拟 DOM 数据。（注意：在 render 中最好只做数据和模板的组合，不应进行 state 等逻辑的修改，这样组件结构更加清晰）
（5）componentDidUpdate：该方法在组件的更新已经同步到 DOM 中去后触发，我们常在该方法中做一 DOM 操作。
![](https://upload-images.jianshu.io/upload_images/4685968-dff8fe4c8fb67e62.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 1.4 销毁阶段
![](https://upload-images.jianshu.io/upload_images/4685968-15fa8bc699a18747.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这个阶段只会触发一个叫 componentWillUnmount 的方法。
当组件需要从 DOM 中移除的时候，我们通常会做一些取消事件绑定、移除虚拟 DOM 中对应的组件数据结构、销毁一些无效的定时器等工作。这些事情都可以在这个方法中处理。
![](https://upload-images.jianshu.io/upload_images/4685968-d367fba0a0ab92bd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
import React from 'react';
import ReactDOM from 'react-dom';


class Component extends React.Component{
    // 构造函数
    constructor(props){
        super(props)
        this.state = {
            data: 'Old State'
        }
        console.log('初始化数据','constructor');
    }
    // 组件将要加载
    componentWillMount(){
        console.log('componentWillMount');
    }
    // 组件加载完成
    componentDidMount(){
        console.log('componentDidMount');
    }
    // 将要接收父组件传来的props
    componentWillReceiveProps(){
        console.log('componentWillReceiveProps');
    }
    // 子组件是不是应该更新
    shouldComponentUpdate(){
        console.log('shouldComponentUpdate');
        return true;
    }
    // 组件将要更新
    componentWillUpdate(){
        console.log('componentWillUpdate');
    }
    // 组件更新完成
    componentDidUpdate(){
        console.log('componentDidUpdate');
    }
    // 组件即将销毁
    componentWillUnmount(){
        console.log('componentWillUnmount');
    }
    // 处理点击事件
    handleClick(){
        console.log('更新数据：');
        this.setState({
            data: 'New State'
        });
    }
    // 渲染
    render(){
        console.log('render')
        return (
            <div>
                <div>Props: {this.props.data}</div>
                <button onClick={()=>{this.handleClick()}}>更新组件</button>
            </div>
        );
    }
}

class App extends React.Component{
    // 构造函数
    constructor(props){
        super(props)
        this.state = {
            data: 'Old Props',
            hasChild: true
        }
        console.log('初始化数据','constructor');
    }
    onPropsChange(){
        console.log('更新props:');
        this.setState({
            data: 'New Props'
        });
    }
    onDestoryChild(){
        console.log('干掉子组件：');
        this.setState({
            hasChild: false
        });
    }
    render(){
        return (
            <div>
                {
                    this.state.hasChild ? <Component data={this.state.data}/> : null
                }
                <button onClick={()=>{this.onPropsChange()}}>改变Props</button>
                <button onClick={()=>{this.onDestoryChild()}}>干掉子组件</button>
            </div>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('app')
);
```
