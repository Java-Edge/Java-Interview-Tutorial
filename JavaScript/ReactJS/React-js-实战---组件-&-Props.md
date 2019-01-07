# 0 联系我
![](http://upload-images.jianshu.io/upload_images/4685968-6a8b28d2fd95e8b7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "图片标题") 
1.[Java开发技术交流Q群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)

2.[完整博客链接](https://blog.csdn.net/qq_33589510)

3.[个人知乎](http://www.zhihu.com/people/shi-shu-sheng-)

4.[gayhub](https://github.com/Wasabi1234)

>组件可以将UI切分成一些独立的、可复用的部件,这样你就只需专注于构建每一个单独的部件.

组件从概念上看就像是函数，它可以接收任意的输入值（称之为“props”），并返回一个需要在页面上展示的React元素.

# 1 函数定义/类定义组件
定义一个组件最简单的方式是使用JavaScript函数：
```
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```
该函数是一个有效的React组件，它接收一个单一的“props”对象并返回了一个React元素.
我们之所以称这种类型的组件为函数定义组件，是因为从字面上来看，它就是一个JavaScript函数.

你也可以使用 [ES6 class](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes) 来定义一个组件:
```
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```
上面两个组件在React中是相同的.

我们将在[下一节]讨论类的一些额外特性。在那之前，我们都将使用较为简洁的函数定义组件。

# 2 组件渲染
在前面，我们遇到的React元素都只是DOM标签：
```
const element = <div />;
```

然而，React元素也可以是用户自定义的组件

```
const element = <Welcome name="Sara" />;
```
当React遇到的元素是用户自定义的组件，它会将JSX属性作为单个对象传递给该组件，这个对象称之为“props”。

例如,这段代码会在页面上渲染出”Hello,Sara”:
![](https://upload-images.jianshu.io/upload_images/4685968-43ff9c0eb2a8aea8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
我们来回顾一下在这个例子中发生了什么：

- 我们对<Welcome name="Sara" />元素调用了ReactDOM.render()方法
- React将{name: 'Sara'}作为props传入并调用Welcome组件
- Welcome组件将<h1>Hello, Sara</h1>元素作为结果返回。
- React DOM将DOM更新为<h1>Hello, Sara</h1>。

>警告:
组件名称必须以大写字母开头。
例如，<div /> 表示一个DOM标签，但 <Welcome /> 表示一个组件，并且在使用该组件时你必须定义或引入它。

# 3 组合组件
组件可以在它的输出中引用其它组件，这就可以让我们用同一组件来抽象出任意层次的细节.
在React应用中，按钮、表单、对话框、整个屏幕的内容等，这些通常都被表示为组件.

例如，我们可以创建一个`App`组件，用来多次渲染`Welcome`组件
![](https://upload-images.jianshu.io/upload_images/4685968-e9066fb9559577a5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

通常，一个新的React应用程序的顶部是一个`App`组件.
但是，如果要将React集成到现有应用程序中，则可以从下而上使用像`Button`这样的小组件作为开始，并逐渐运用到视图层的顶部.

>  组件的返回值只能有一个根元素。这也是我们要用一个`<div>`来包裹所有`<Welcome />`元素的原因。

## 4 提取组件
可以将组件切分为更小的组件

例如，来看看这个Comment组件
```
function formatDate(date) {
  return date.toLocaleDateString();
}

function Comment(props) {
  return (
    <div className="Comment">
      <div className="UserInfo">
        <img className="Avatar"
             src={props.author.avatarUrl}
             alt={props.author.name} />
        <div className="UserInfo-name">
          {props.author.name}
        </div>
      </div>
      <div className="Comment-text">
        {props.text}
      </div>
      <div className="Comment-date">
        {formatDate(props.date)}
      </div>
    </div>
  );
}

const comment = {
  date: new Date(),
  text: 'I hope you enjoy learning React!',
  author: {
    name: 'Hello Kitty',
    avatarUrl: 'http://placekitten.com/g/64/64'
  }
};
ReactDOM.render(
  <Comment
    date={comment.date}
    text={comment.text}
    author={comment.author} />,
  document.getElementById('root')
);
```
![](https://upload-images.jianshu.io/upload_images/4685968-f93aaee5d22df7a4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这个组件接收author(对象)、text(字符串)、以及date(Date对象)作为props，用来描述一个社交媒体网站上的评论.

这个组件由于嵌套，变得难以被修改，可复用的部分也难以被复用。所以让我们从这个组件中提取出一些小组件。

首先，我们来提取Avatar组件
```
function Avatar(props) {
  return (
    <img className="Avatar"
      src={props.user.avatarUrl}
      alt={props.user.name}
    />
  );
}
```
Avatar作为Comment的内部组件，不需要知道是否被渲染.
因此我们将author改为一个更通用的名字user。

我们建议从组件自身的角度来命名props，而不是根据使用组件的上下文命名。

现在我们可以对Comment组件做一些小小的调整：
```
function Comment(props) {
  return (
    <div className="Comment">
      <div className="UserInfo">
        <Avatar user={props.author} />
        <div className="UserInfo-name">
          {props.author.name}
        </div>
      </div>
      <div className="Comment-text">
        {props.text}
      </div>
      <div className="Comment-date">
        {formatDate(props.date)}
      </div>
    </div>
  );
}
```
接下来，我们要提取一个UserInfo组件，用来渲染Avatar旁边的用户名：
```
function UserInfo(props) {
  return (
    <div className="UserInfo">
      <Avatar user={props.user} />
      <div className="UserInfo-name">
        {props.user.name}
      </div>
    </div>
  );
}
```
这可以让我们进一步简化Comment组件：
```
function Comment(props) {
  return (
    <div className="Comment">
      <UserInfo user={props.author} />
      <div className="Comment-text">
        {props.text}
      </div>
      <div className="Comment-date">
        {formatDate(props.date)}
      </div>
    </div>
  );
}
```
- 最终代码
```
function formatDate(date) {
  return date.toLocaleDateString();
}

function Avatar(props) {
  return (
    <img className="Avatar"
         src={props.user.avatarUrl}
         alt={props.user.name} />
  );
}

function UserInfo(props) {
  return (
    <div className="UserInfo">
      <Avatar user={props.user} />
      <div className="UserInfo-name">
        {props.user.name}
      </div>
    </div>
  );
}

function Comment(props) {
  return (
    <div className="Comment">
      <UserInfo user={props.author} />
      <div className="Comment-text">
        {props.text}
      </div>
      <div className="Comment-date">
        {formatDate(props.date)}
      </div>
    </div>
  );
}

const comment = {
  date: new Date(),
  text: 'I hope you enjoy learning React!',
  author: {
    name: 'Hello Kitty',
    avatarUrl: 'http://placekitten.com/g/64/64'
  }
};
ReactDOM.render(
  <Comment
    date={comment.date}
    text={comment.text}
    author={comment.author} />,
  document.getElementById('root')
);
```
提取组件一开始看起来像是一项单调乏味的工作，但是在大型应用中，构建可复用的组件完全是值得的.
当你的UI中有一部分重复使用了好几次（比如，Button、Panel、Avatar），或者其自身就足够复杂（比如，App、FeedStory、Comment），类似这些都是抽象成一个可复用组件的绝佳选择，这也是一个比较好的做法.

# 5 Props的只读性
无论是使用[函数或是类](https://react.docschina.org/docs/components-and-props.html#%E5%87%BD%E6%95%B0%E5%AE%9A%E4%B9%89/%E7%B1%BB%E5%AE%9A%E4%B9%89%E7%BB%84%E4%BB%B6)来声明一个组件，它决不能修改它自己的props.

来看这个`sum`函数
```
function sum(a, b) {
  return a + b;
}
```
类似于上面的这种函数称为[“纯函数”](https://en.wikipedia.org/wiki/Pure_function)，它没有改变它自己的输入值，当传入的值相同时，总是会返回相同的结果。

与之相对的是非纯函数，它会改变它自身的输入值
```
function withdraw(account, amount) {
  account.total -= amount;
}
```

React是非常灵活的，但它也有一个严格的规则：

**所有的React组件必须像纯函数那样使用它们的props。**

当然，应用的界面是随时间动态变化的，我们将在[下一节](https://react.docschina.org/docs/state-and-lifecycle.html)介绍一种称为“state”的新概念，State可以在不违反上述规则的情况下，根据用户操作、网络响应、或者其他状态变化，使组件动态的响应并改变组件的输出。


