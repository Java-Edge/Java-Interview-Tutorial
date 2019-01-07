
# 联系我
![](http://upload-images.jianshu.io/upload_images/4685968-6a8b28d2fd95e8b7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "图片标题") 
1.[Java开发技术交流Q群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)

2.[完整博客链接](https://blog.csdn.net/qq_33589510)

3.[个人知乎](http://www.zhihu.com/people/shi-shu-sheng-)

4.[gayhub](https://github.com/Wasabi1234)

# [本文源码](https://github.com/Wasabi1234/Vue2.xQunar)
本章将快速讲解部分 Vue 基础语法，通过 TodoList 功能的编写，在熟悉基础语法的基础上，扩展解析 MVVM 模式及前端组件化的概念及优势。

# 1  最简单的案例
- [下载安装](https://cn.vuejs.org/v2/guide/installation.html)
![](https://upload-images.jianshu.io/upload_images/4685968-a492826369978c5e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 原生实现打印
![](https://upload-images.jianshu.io/upload_images/4685968-bb273904be198452.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-1905d3f1467d33a5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 1.1 创建一个 Vue 实例
每个 Vue 应用都是通过用 `Vue` 函数创建一个新的 **Vue 实例**开始的：
```
var app = new Vue({
  // 选项
})
```
当创建一个 Vue 实例时，你可以传入一个**选项对象**.
本教程主要描述的就是如何使用这些选项来创建你想要的行为.

一个 Vue 应用由一个通过 `new Vue` 创建的**根 Vue 实例**，以及可选的嵌套的、可复用的组件树组成.

现在，你只需要明白所有的 Vue 组件都是 Vue 实例，并且接受相同的选项对象 (一些根实例特有的选项除外).

回到案例演示,若使用Vue.js 该如何实现打印呢?
![](https://upload-images.jianshu.io/upload_images/4685968-5488271eeab37e4f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 无问题,正常打印
![](https://upload-images.jianshu.io/upload_images/4685968-dd70ee230d411451.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 1.2 数据与方法
当一个 Vue 实例被创建时，它向 Vue 的**响应式系统**中加入了其 `data` 对象中能找到的所有的属性.
当这些属性的值发生改变时，视图将会产生“响应”，即匹配更新为新的值.
```
// 我们的数据对象
var data = { a: 1 }

// 该对象被加入到一个 Vue 实例中
var app = new Vue({
  data: data
})

// 获得这个实例上的属性
// 返回源数据中对应的字段
app.a == data.a // => true

// 设置属性也会影响到原始数据
app.a = 2
data.a // => 2

// ……反之亦然
data.a = 3
app.a // => 3
```

当这些数据改变时，视图会进行重渲染.
值得注意的是只有当实例被创建时 data 中存在的属性才是响应式的。也就是说如果你添加一个新的属性
比如：
```
app.b = 'hi'
```
那么对 b 的改动将不会触发任何视图的更新。如果你知道你会在晚些时候需要一个属性，但是一开始它为空或不存在，那么你仅需要设置一些初始值.
比如：
```
data: {
  newTodoText: '',
  visitCount: 0,
  hideCompletedTodos: false,
  todos: [],
  error: null
}
```

这里唯一的例外是使用 `Object.freeze()`，这会阻止修改现有的属性，也意味着响应系统无法再追踪变化.
```
var obj = {
  foo: 'bar'
}

Object.freeze(obj)

new Vue({
  el: '#app',
  data: obj
})
```

```
<div id="app">
  <p>{{ foo }}</p>
  <!-- 这里的 `foo` 不会更新！ -->
  <button v-on:click="foo = 'baz'">Change it</button>
</div>
```
- 非接管区域内内容,并不感冒它.
![](https://upload-images.jianshu.io/upload_images/4685968-97c02948a70e0565.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 而会原封不动输出.
![](https://upload-images.jianshu.io/upload_images/4685968-ddc16dc3b7f6d813.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 最古老的直接操作DOM的定时操作.
![](https://upload-images.jianshu.io/upload_images/4685968-6ebd9658e45db21f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


- Vue.js 版本代码,不需要再管 dom 操作,而是将注意力都放在对于数据的管理;
数据是什么,页面也就展示什么.

除了数据属性，Vue 实例还暴露了一些有用的实例属性与方法.
它们都有`前缀 $`，以便与用户定义的属性区分开来.
例如：
```
var data = { a: 1 }
var vm = new Vue({
  el: '#example',
  data: data
})

vm.$data === data // => true
vm.$el === document.getElementById('example') // => true

// $watch 是一个实例方法
vm.$watch('a', function (newValue, oldValue) {
  // 这个回调将在 `vm.a` 改变后调用
})
```
![](https://upload-images.jianshu.io/upload_images/4685968-9670f04dc8d6652f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 3 开发TodoList（v-model、v-for、v-on）
## 3.1 列表渲染
### 3.1.1  用 `v-for` 把一个数组对应为一组元素
我们用 `v-for` 指令根据一组数组的选项列表进行渲染。`v-for` 指令需要使用 `item in items` 形式的特殊语法，`items` 是源数据数组并且 `item` 是数组元素迭代的别名。
```
<ul id="example-1">
  <li v-for="item in items">
    {{ item.message }}
  </li>
</ul>
```
```
var example1 = new Vue({
  el: '#example-1',
  data: {
    items: [
      { message: 'Foo' },
      { message: 'Bar' }
    ]
  }
})
```
结果：
```
Foo
Bar
```
在 `v-for` 块中，我们拥有对父作用域属性的完全访问权限.
`v-for` 还支持一个可选的第二个参数为当前项的索引.
```
<ul id="example-2">
  <li v-for="(item, index) in items">
    {{ parentMessage }} - {{ index }} - {{ item.message }}
  </li>
</ul>
```
```
var example2 = new Vue({
  el: '#example-2',
  data: {
    parentMessage: 'Parent',
    items: [
      { message: 'Foo' },
      { message: 'Bar' }
    ]
  }
})
```
结果：
```
Parent - 0 - Foo
Parent - 1 - Bar
```
你也可以用 `of` 替代 `in` 作为分隔符，因为它是最接近 JavaScript 迭代器的语法：
```
<div v-for="item of items"></div>
```

### 3.1.2  一个对象的 `v-for`
也可用 `v-for` 通过一个对象的属性来迭代.


在遍历对象时，是按 `Object.keys()` 的结果遍历，但是不能保证它的结果在不同的 JavaScript 引擎下是一致的.
```
<ul id="v-for-object" class="demo">
  <li v-for="value in object">
    {{ value }}
  </li>
</ul>
```
```
new Vue({
  el: '#v-for-object',
  data: {
    object: {
      firstName: 'John',
      lastName: 'Doe',
      age: 30
    }
  }
})
```
- 也可以提供第二个的参数为键名：
```
<div v-for="(value, key) in object">
  {{ key }}: {{ value }}
</div>
```
- 第三个参数为索引
```
<div v-for="(value, key, index) in object">
  {{ index }}. {{ key }}: {{ value }}
</div>
```

>在遍历对象时，是按 Object.keys() 的结果遍历，但是不能保证它的结果在不同的 JavaScript 引擎下是一致的。

### 3.1.3  key
当 Vue.js 用 `v-for` 正在更新已渲染过的元素列表时，它默认用“就地复用”策略。如果数据项的顺序被改变，Vue 将不会移动 DOM 元素来匹配数据项的顺序， 而是简单复用此处每个元素，并且确保它在特定索引下显示已被渲染过的每个元素。这个类似 Vue 1.x 的 `track-by="$index"` 。

这个默认的模式是高效的，但是只适用于**不依赖子组件状态或临时 DOM 状态 (例如：表单输入值) 的列表渲染输出**。

为了给 Vue 一个提示，以便它能跟踪每个节点的身份，从而重用和重新排序现有元素，你需要为每项提供一个唯一 `key` 属性。理想的 `key` 值是每项都有的唯一 id。这个特殊的属性相当于 Vue 1.x 的 `track-by` ，但它的工作方式类似于一个属性，所以你需要用 `v-bind` 来绑定动态值 (在这里使用简写)：
```
<div v-for="item in items" :key="item.id">
  <!-- 内容 -->
</div>
```
建议尽可能在使用 `v-for` 时提供 `key`，除非遍历输出的 DOM 内容非常简单，或者是刻意依赖默认行为以获取性能上的提升.

因为它是 Vue 识别节点的一个通用机制，`key` 并不与 `v-for` 特别关联.

不要使用对象或数组之类的非原始类型值作为 `v-for` 的 `key`。用字符串或数类型的值取而代之.

## 3.2 回到案例
- 最初文件
![](https://upload-images.jianshu.io/upload_images/4685968-710e5d66100ca863.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 最初效果
![](https://upload-images.jianshu.io/upload_images/4685968-9cf4c2e9af14b02e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- Vue版实现同效
![](https://upload-images.jianshu.io/upload_images/4685968-12a629dd3c82029a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

下面开始逐步实现 todolist功能

## 3.3 事件处理
### 3.3.1  监听事件
可以用 `v-on` 指令监听 DOM 事件，并在触发时运行一些 JavaScript 代码。
```
<div id="example-1">
  <button v-on:click="counter += 1">Add 1</button>
  <p>The button above has been clicked {{ counter }} times.</p>
</div>
```
```
var example1 = new Vue({
  el: '#example-1',
  data: {
    counter: 0
  }
})
```
![](https://upload-images.jianshu.io/upload_images/4685968-52b16eb7b024198c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 3.3.2 事件处理方法
然而许多事件处理逻辑会更为复杂，所以直接把 JavaScript 代码写在 `v-on` 指令中是不可行的,因此 `v-on` 还可以接收一个需要调用的方法名称.
```
<div id="example-2">
  <!-- `greet` 是在下面定义的方法名 -->
  <button v-on:click="greet">Greet</button>
</div>
```
```
var example2 = new Vue({
  el: '#example-2',
  data: {
    name: 'Vue.js'
  },
  // 在 `methods` 对象中定义方法
  methods: {
    greet: function (event) {
      // `this` 在方法里指向当前 Vue 实例
      alert('Hello ' + this.name + '!')
      // `event` 是原生 DOM 事件
      if (event) {
        alert(event.target.tagName)
      }
    }
  }
})

// 也可以用 JavaScript 直接调用方法
example2.greet() // => 'Hello Vue.js!'
```

## 3.4 回到案例
来试试绑定点击事件~
![](https://upload-images.jianshu.io/upload_images/4685968-bdd44325b7b8172e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-178318ab61f5655c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-41418250bd5c0033.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


## 3.5  表单输入绑定
### 3.5.1  基础用法
可用 `v-model` 指令在表单 `<input>`、`<textarea>` 及 `<select>` 元素上创建双向数据绑定.
它会根据控件类型自动选取正确的方法来更新元素。尽管有些神奇，但 `v-model` 本质上不过是语法糖。它负责监听用户的输入事件以更新数据，并对一些极端场景进行一些特殊处理.

>`v-model` 会忽略所有表单元素的 `value`、`checked`、`selected` 特性的初始值而总是将 Vue 实例的数据作为数据来源。你应该通过 JavaScript 在组件的 `data` 选项中声明初始值。

>对于需要使用[输入法](https://zh.wikipedia.org/wiki/%E8%BE%93%E5%85%A5%E6%B3%95) (如中文、日文、韩文等) 的语言，你会发现 `v-model` 不会在输入法组合文字过程中得到更新。如果你也想处理这个过程，请使用 `input` 事件。

- [文本]
```
<input v-model="message" placeholder="edit me">
<p>Message is: {{ message }}</p>
```

- [多行文本]
```
<p style="white-space: pre-line;">{{ message }}</p>
<br>
<textarea v-model="message" placeholder="add multiple lines"></textarea>
```

 |

Multiline message is:
<textarea placeholder="add multiple lines"></textarea>

>在文本区域插值 (`<textarea></textarea>`) 并不会生效，应用 `v-model` 来代替。

- [复选框]
单个复选框，绑定到布尔值：
```
<input type="checkbox" id="checkbox" v-model="checked">
<label for="checkbox">{{ checked }}</label>
```

多个复选框，绑定到同一个数组：
```
<div id='example-3'>
  <input type="checkbox" id="jack" value="Jack" v-model="checkedNames">
  <label for="jack">Jack</label>
  <input type="checkbox" id="john" value="John" v-model="checkedNames">
  <label for="john">John</label>
  <input type="checkbox" id="mike" value="Mike" v-model="checkedNames">
  <label for="mike">Mike</label>
  <br>
  <span>Checked names: {{ checkedNames }}</span>
</div>
```
```
new Vue({
  el: '#example-3',
  data: {
    checkedNames: []
  }
})
```

- [单选按钮]
```
<div id="example-4">
  <input type="radio" id="one" value="One" v-model="picked">
  <label for="one">One</label>
  <br>
  <input type="radio" id="two" value="Two" v-model="picked">
  <label for="two">Two</label>
  <br>
  <span>Picked: {{ picked }}</span>
</div>
```
```
new Vue({
  el: '#example-4',
  data: {
    picked: ''
  }
})
```
- [选择框]
单选时：
```
<div id="example-5">
  <select v-model="selected">
    <option disabled value="">请选择</option>
    <option>A</option>
    <option>B</option>
    <option>C</option>
  </select>
  <span>Selected: {{ selected }}</span>
</div>
```
```
new Vue({
  el: '...',
  data: {
    selected: ''
  }
})
```

>如果 v-model 表达式的初始值未能匹配任何选项，<select> 元素将被渲染为“未选中”状态。在 iOS 中，这会使用户无法选择第一个选项。因为这样的情况下，iOS 不会触发 change 事件。因此，更推荐像上面这样提供一个值为空的禁用选项。

## 3.6 回到案例:实现表单数据绑定
- 初始时值为空串.
![](https://upload-images.jianshu.io/upload_images/4685968-6d099323e177dffa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 产生输入后,值发生变化
![](https://upload-images.jianshu.io/upload_images/4685968-a7de5078703affa4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 在控制台改变值后,页面值随之改变!
![](https://upload-images.jianshu.io/upload_images/4685968-47a9c5ae950e82dc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 如何使得点击事件可以发现输入框的值呢?

![](https://upload-images.jianshu.io/upload_images/4685968-525d91c5f12e0955.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

来来来,让我们快速进入下一个任务,要实现输入内容提交后打印,何解?
![](https://upload-images.jianshu.io/upload_images/4685968-bbc8b2f5b28d76cb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
如此即可实现,是不是很简单呢~
![](https://upload-images.jianshu.io/upload_images/4685968-6a3f8d63b6491904.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
可是发现好麻烦呀,每次提交,都需要手动请出前一次输入的内容,何解?
![](https://upload-images.jianshu.io/upload_images/4685968-88da1cc13bb18f8a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
是不是很简单~

至此,todolist 功能实现完毕,无任何DOM操作,全程只操作数据!
Vue完美!
此为MVVM模式~

# 4 MVVM模式
![](https://upload-images.jianshu.io/upload_images/4685968-41ac333103664a85.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

让我们尝试使用 jq 实现一个 todolist
- 首先引入 jQuery
![](https://upload-images.jianshu.io/upload_images/4685968-51a87a3ba7e187ab.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 新建 jquery.html 文件以实现功能
![](https://upload-images.jianshu.io/upload_images/4685968-c64a97d31e664bdb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 效果
![](https://upload-images.jianshu.io/upload_images/4685968-c1dcee06dbb796c3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

希望每次点击时,往 input ul 列表中添加该内容,如何实现呢?
- 设置一下 id
![](https://upload-images.jianshu.io/upload_images/4685968-e3706da9fcc172cd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7038bbc91b0ec7ca.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![即可实现](https://upload-images.jianshu.io/upload_images/4685968-c034d9125871adfd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 若想自动清除框中内容
![](https://upload-images.jianshu.io/upload_images/4685968-4318d86cdee13a22.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-91bbe5738a749092.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 这种代码是符合MVP模式的!
由于没有使用AJAX,M层并无体现,不讨论,只讨论VP
当V层代码被改变时,P层代码会响应执行业务逻辑,通过 dom 操作再改变V层 / AJAX获取数据操作M层
所以最核心的时P层.大部分代码都是在做 dom操作.

- Vue 官方MVVM模式架构
![](https://upload-images.jianshu.io/upload_images/4685968-cb787683fa8f2a8e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
无需关注VM层的实现,Vue内置已经帮助了我们.
所以编码重点只在V,M层,我们主要操作的都是数据.
又由于数据与界面的互相影响,其实只需要注重M层代码开发.

# 5 前端组件化
组件可使得代码架构更加清晰!

## 5.1 组件基础
### [基本示例]
这里有一个 Vue 组件的示例：
```
// 定义一个名为 button-counter 的新组件
Vue.component('button-counter', {
  data: function () {
    return {
      count: 0
    }
  },
  template: '<button v-on:click="count++">You clicked me {{ count }} times.</button>'
})
```

组件是可复用的 Vue 实例，且带有一个名字：在这个例子中是 <button-counter>.
我们可以在一个通过 new Vue 创建的 Vue 根实例中，把这个组件作为自定义元素来使用：
```
<div id="components-demo">
  <button-counter></button-counter>
</div>
```
```
new Vue({ el: '#components-demo' })
```

因为组件是可复用的 Vue 实例，所以它们与 new Vue 接收相同的选项，例如 data、computed、watch、methods 以及生命周期钩子等.
仅有的例外是像 el 这样根实例特有的选项.

## 5.2 组件的复用
你可以将组件进行任意次数的复用：
```
<div id="components-demo">
  <button-counter></button-counter>
  <button-counter></button-counter>
  <button-counter></button-counter>
</div>
```
注意当点击按钮时，每个组件都会各自独立维护它的 count。因为你每用一次组件，就会有一个它的新实例被创建。

### `data` 必须是一个函数
我们定义这个 `<button-counter>` 组件时，你可能会发现它的 `data` 并不是像这样直接提供一个对象：
```
data: {
 count: 0
}
```
取而代之的是，**一个组件的 `data` 选项必须是一个函数**，因此每个实例可以维护一份被返回对象的独立的拷贝：
```
data: function () {
 return {
 count: 0
 }
}
```
如果 Vue 没有这条规则，点击一个按钮就可能会影响到*其它所有实例*

## 5.3 组件的组织
通常一个应用会以一棵嵌套的组件树的形式来组织：
![](https://upload-images.jianshu.io/upload_images/4685968-cde42cd56da45f8c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

例如，你可能会有页头、侧边栏、内容区等组件，每个组件又包含了其它的如导航链接、博文之类的组件。

为了能在模板中使用，这些组件必须先注册以便 Vue 能够识别.
这里有两种组件的注册类型：全局注册和局部注册.
至此，我们的组件都只是通过 Vue.component 全局注册的：
```
Vue.component('my-component-name', {
  // ... options ...
})
```

全局注册的组件可以用在其被注册之后的任何 (通过 `new Vue`) 新创建的 Vue 根实例，也包括其组件树中的所有子组件的模板中.

## 通过 Prop 向子组件传递数据
如果你不能向这个组件传递某一篇博文的标题或内容之类的我们想展示的数据的话，它是没有办法使用的。这也正是 prop 的由来。

Prop 是你可以在组件上注册的一些自定义特性.
当一个值传递给一个 prop 特性的时候，它就变成了那个组件实例的一个属性.
为了给博文组件传递一个标题，我们可以用一个 `props` 选项将其包含在该组件可接受的 prop 列表中：
```
Vue.component('blog-post', {
  props: ['title'],
  template: '<h3>{{ title }}</h3>'
})
```

一个组件默认可以拥有任意数量的 prop，任何值都可以传递给任何 prop。在上述模板中，你会发现我们能够在组件实例中访问这个值，就像访问 data 中的值一样。

一个 prop 被注册之后，你就可以像这样把数据作为一个自定义特性传递进来：
```
<blog-post title="My journey with Vue"></blog-post>
<blog-post title="Blogging with Vue"></blog-post>
<blog-post title="Why Vue is so fun"></blog-post>
```

然而在一个典型的应用中，你可能在 data 里有一个博文的数组：
```
new Vue({
  el: '#blog-post-demo',
  data: {
    posts: [
      { id: 1, title: 'My journey with Vue' },
      { id: 2, title: 'Blogging with Vue' },
      { id: 3, title: 'Why Vue is so fun' }
    ]
  }
})
```
并想要为每篇博文渲染一个组件：
```
<blog-post
  v-for="post in posts"
  v-bind:key="post.id"
  v-bind:title="post.title"
></blog-post>
```
如上所示，你会发现我们可以使用 `v-bind` 来动态传递 prop。这在你一开始不清楚要渲染的具体内容，比如[从一个 API 获取博文列表]的时候，是非常有用的。

# 6 组件思想改造TodoList
## 6.1 组件注册
### 6.1.1 组件名
在注册一个组件的时候，我们始终需要给它一个名字.
比如在全局注册的时候我们已经看到了：
```
Vue.component('my-component-name', { /* ... */ })
```
该组件名就是 `Vue.component` 的第一个参数.

你给予组件的名字可能取决于你打算拿它来做什么.
当直接在 DOM 中使用一个组件 (而不是在字符串模板或单文件组件时，我们强烈推荐遵循 [W3C 规范](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name)中的自定义组件名 (字母全小写且必须包含一个连字符).
这会帮助你避免和当前以及未来的 HTML 元素相冲突。

### 6.1.2 组件名大小写
定义组件名的方式有两种

#### 使用 kebab-case
```
Vue.component('my-component-name', { /* ... */ })
```
当使用 kebab-case (短横线分隔命名) 定义一个组件时，你也必须在引用这个自定义元素时使用 kebab-case，例如 `<my-component-name>`.

#### 使用 PascalCase
```
Vue.component('MyComponentName', { /* ... */ })
```
当使用 PascalCase (首字母大写命名) 定义一个组件时,你在引用这个自定义元素时两种命名法都可以使用.
也就是说 <my-component-name> 和 <MyComponentName> 都是可接受的.

>注意，尽管如此，直接在 DOM (即非字符串的模板) 中使用时只有 kebab-case 是有效的。

## 6.2 全局注册

到目前为止，我们只用过 `Vue.component` 来创建组件：
```
Vue.component('my-component-name', {
  // ... 选项 ...
})
```
这些组件是全局注册的。也就是说它们在注册之后可以用在任何新创建的 Vue 根实例 (new Vue) 的模板中。比如：
```
Vue.component('component-a', { /* ... */ })
Vue.component('component-b', { /* ... */ })
Vue.component('component-c', { /* ... */ })

new Vue({ el: '#app' })
```
```
<div id="app">
  <component-a></component-a>
  <component-b></component-b>
  <component-c></component-c>
</div>
```
在所有子组件中也是如此，也就是说这三个组件在各自内部也都可以相互使用.

## 6.3 局部注册

全局注册往往是不够理想的。比如，如果你使用一个像 webpack 这样的构建系统，全局注册所有的组件意味着即便你已经不再使用一个组件了，它仍然会被包含在你最终的构建结果中。这造成了用户下载的 JavaScript 的无谓的增加。

在这些情况下，你可以通过一个普通的 JS 对象来定义组件：
```
var ComponentA = { /* ... */ }
var ComponentB = { /* ... */ }
var ComponentC = { /* ... */ }
```
然后在 components 选项中定义你想要使用的组件
```
new Vue({
  el: '#app',
  components: {
    'component-a': ComponentA,
    'component-b': ComponentB
  }
})
```
对于 components 对象中的每个属性来说，其属性名就是自定义元素的名字，其属性值就是这个组件的选项对象.

注意局部注册的组件在其子组件中不可用.
例如，如果你希望 ComponentA 在 ComponentB 中可用，则你需要这样写：
```
var ComponentA = { /* ... */ }

var ComponentB = {
  components: {
    'component-a': ComponentA
  },
  // ...
}
```

每个列表项都是页面一部分,自然可当做组件处理~
![](https://upload-images.jianshu.io/upload_images/4685968-6c181d3a3ec4e9b4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-505a79b4040b759c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#  7 简单的组件间传值
- 父组件即为最外部的 Vue 实例.
![](https://upload-images.jianshu.io/upload_images/4685968-a49187869a9be054.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- root id 下的内容其实就是父组件的 template.
![](https://upload-images.jianshu.io/upload_images/4685968-ab66714c6b4f56c3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 此即为子组件
![](https://upload-images.jianshu.io/upload_images/4685968-836acecc4adadefc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 并在父标签中通过标签方式使用了该组件.
![](https://upload-images.jianshu.io/upload_images/4685968-a3dce6ca9cce48c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 7.1 本节通关任务
- 我们期望,点击 hello/world 时,会将其删除,这里就涉及到了子组件如何向父组件传值.
![](https://upload-images.jianshu.io/upload_images/4685968-09a2b4738687f2d6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/4685968-b1895844c0e50f12.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 成功效果显示
![](https://upload-images.jianshu.io/upload_images/4685968-9c1cfd0b8d821a81.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

那么再想想怎么才能实现任务呢?首先考虑下数据应该放在哪里呢?  
父组件的数据决定了子组件到底显示多少个数据,所以实现删除,通过点击子组件,要将数据传递给父组件,让父组件去改变数据,子组件的数据随之消失/增加.

看看如何实现,子组件向父组件传值:
- 点击子组件时,子组件会向外触发一个 delete 事件.
![](https://upload-images.jianshu.io/upload_images/4685968-db8fd50cc3c68905.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 在父组件的模板中创建子组件且监听子组件的 delete事件
![](https://upload-images.jianshu.io/upload_images/4685968-0e5b7b398882afbc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 因此,也应该在父组件中定义该监听事件.
![](https://upload-images.jianshu.io/upload_images/4685968-05ab7066f60b7dd7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 成功效果显示
![](https://upload-images.jianshu.io/upload_images/4685968-7422bfde8d8ec50f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 下面实现了点击后删除全部显示的列表,那么如何做到点一个删一个呢?
![](https://upload-images.jianshu.io/upload_images/4685968-0d190c791d49d792.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

那么在向子组件传值时,不仅需要传一个 content 内容,还需要索引!将索引传递给子组件, 这样在发生点击事件时,子组件就把对应的索引再次传递给父组件,使其感知到所需删除的数据.
![](https://upload-images.jianshu.io/upload_images/4685968-11661381161619fc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-12afb3367ba27c64.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 其实 v-bind 是可省略滴!
![](https://upload-images.jianshu.io/upload_images/4685968-e3ba60ce471ccb94.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 参考
https://coding.imooc.com/class/203.html
https://cn.vuejs.org/v2/guide/events.html
