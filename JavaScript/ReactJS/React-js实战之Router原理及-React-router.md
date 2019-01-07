
官网文档
https://reacttraining.com/react-router/core/guides/philosophy![](https://upload-images.jianshu.io/upload_images/4685968-67ca40cb6e837668.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-f40443c64e92ffcd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#页面路由
![](https://upload-images.jianshu.io/upload_images/4685968-706c8b6f99cca6af.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#Hash 路由
![](https://upload-images.jianshu.io/upload_images/4685968-bc47ff15c9b05b3f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-33c44c58b040ba7c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# H5路由
只对后退记录有效
![](https://upload-images.jianshu.io/upload_images/4685968-95c601dc2c3a3cf7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-5aac46a5ac6c03cc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
// 页面路由
window.location.href = 'http://www.baidu.com';
history.back();

// hash 路由
window.location = '#hash';
window.onhashchange = function(){
    console.log('current hash:', window.location.hash);
}

// h5 路由
// 推进一个状态
history.pushState('name', 'title', '/path');
// 替换一个状态
history.replaceState('name', 'title', '/path');
// popstate
window.onpopstate = function(){
    console.log(window.location.href);
    console.log(window.location.pathname);
    console.log(window.location.hash);
    console.log(window.location.search);
}
```
![](https://upload-images.jianshu.io/upload_images/4685968-c8daa5e9027c865b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
// react-router
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Switch, Route, Link } from 'react-router-dom'


class A extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return (
            <div>
                Component A

                <Switch>
                    <Route exact path={`${this.props.match.path}`} render={(route) => {
                        return <div>当前组件是不带参数的A</div>
                    }}/>
                    <Route path={`${this.props.match.path}/sub`} render={(route) => {
                        return <div>当前组件是Sub</div>
                    }}/>
                    <Route path={`${this.props.match.path}/:id`} render={(route) => {
                        return <div>当前组件是带参数的A, 参数是：{route.match.params.id}</div>
                    }}/>
                </Switch>
            </div>
        )
    }
}

class B extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return <div>Component B</div>
    }
}

class Wrapper extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return (
            <div>
                <Link to="/a">组件A</Link>
                <br/>
                <Link to="/a/123">带参数的组件A</Link>
                <br/>
                <Link to="/b">组件B</Link>
                <br/>
                <Link to="/a/sub">/a/sub</Link>
                {this.props.children}
            </div>
        );
    }
}

ReactDOM.render(
    <Router>
        <Wrapper>
            <Route path="/a" component={A}/>
            <Route path="/b" component={B}/>
        </Wrapper>
    </Router>,
    document.getElementById('app')
);
```
通过以上代码,首先演示 Hash 路由
![](https://upload-images.jianshu.io/upload_images/4685968-bf4a52c127529f22.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
再演示 H5路由,即修改此处
![](https://upload-images.jianshu.io/upload_images/4685968-a460545892fffcd3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-24cd192d92c218fd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
将参数传给组件
![](https://upload-images.jianshu.io/upload_images/4685968-3db1873ce4fab807.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



