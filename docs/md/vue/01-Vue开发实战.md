# Vue开发实战(01)

讲解部分 Vue 基础语法，通过 TodoList 功能编写，在熟悉基础语法的基础上，扩展解析 MVVM 模式及前端组件化的概念及优势。

## 1  案例

### 1.1 下载安装



https://v2.cn.vuejs.org/v2/guide/installation.html：

![](https://img-blog.csdnimg.cn/1e3140534d7d4f4caa775f1b25a84cc7.png)

### 1.2 原生实现打印



```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>JavaEdge</title>
  </head>
  <body>
  <div id="app">
    <script>
      var dom = document.getElementById('app')
      dom.innerHTML = 'JavaEdge'
    </script>
  </div>
  </body>
</html>
```

### 1.3 创建一个 Vue 实例

每个 Vue 应用都是通过用 `Vue` 函数创建一个新的 **Vue 实例** 开始：

```javascript
var app = new Vue({
  // 选项
})
```

创建一个 Vue 实例时，可传入一个**选项对象**。本文教你如何使用这些选项创建你想要的行为。

### 1.4 一个 Vue 应用的组成



- 一个通过 `new Vue` 创建的**根 Vue 实例**
- 可选的嵌套的、可复用的组件树

所有 Vue 组件都是 Vue 实例，并接受相同的选项对象（除了根实例特有选项）。

若使用Vue.js如何实现打印？

```html
<!--Vue.js实现打印-->
<!DOCTYPE html>
<html lang="en" xmlns:v-on="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <title>JavaEdge</title>
    <script src="./vue.js"></script>
</head>
<body>
<div id="app1">
    {{content}}
</div>

<script>
    // 每个 Vue 应用都是通过用 Vue 函数创建一个新的 Vue 实例 开始
    var app1 = new Vue({
        el: "#app1",
        data: {
            content: 'JavaEdge',
        }
    })
</script>
</body>
</html>
```

没问题，正常打印：

![](https://img-blog.csdnimg.cn/6fc7a7c066fb4ebb99bc6e7970415e21.png)



## 2 数据与方法

当一个 Vue 实例被创建时，它向 Vue 的**响应式系统**中加入了其 `data` 对象中能找到的所有的属性。
当这些属性的值发生改变时，视图将“响应”，即匹配更新为新的值。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JavaEdge</title>
    <script src="./vue.js"></script>
</head>
<body>
<div id="app2">
</div>

<script>
    // 我们的数据对象
    var data = { a: 1 }

    // 该对象被加入到一个 Vue 实例中
    var app2 = new Vue({
        data: data
    })

    // 获得这个实例上的属性
    // 返回源数据中对应的字段
    app2.a == data.a // => true

    // 设置属性也会影响到原始数据
    app2.a = 2
    data.a // => 2

    // ……反之亦然
    data.a = 3
    app2.a // => 3
</script>
</body>
</html>
```

当这些数据改变时，视图会重新渲染。

只有当实例被创建时，data 中存在的属性才是响应式的。也就是说若你添加一个新属性，如：

```javascript
app2.b = 'hi'
```

对 b 的改动将不会触发任何视图的更新。



若你知道会在晚些时候需要一个属性，但一开始它为空或不存在，你仅需要设置一些初始值。如：

```javascript
data: {
  newTodoText: '',
  visitCount: 0,
  hideCompletedTodos: false,
  todos: [],
  error: null
}
```

唯一例外是使用 `Object.freeze()`，这会阻止修改现有的属性，即响应系统无法再追踪变化。

```javascript
var obj = {
  foo: 'bar'
}

Object.freeze(obj)

new Vue({
  el: '#app',
  data: obj
})
```

```html
<div id="app">
  <p>{{ foo }}</p>
  <!-- 这里的 `foo` 不会更新！ -->
  <button v-on:click="foo = 'baz'">Change it</button>
</div>
```

### 2.1 接管区域



非接管区域的内容，不care它：

```html
<!--Vue.js实现打印-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JavaEdge</title>
    <script src="../vue.js"></script>
</head>
<body>
<div id="app1">
    {{content}}
</div>
<div>
    {{content}}
</div>

<script>
    // 每个 Vue 应用都是通过用 Vue 函数创建一个新的 Vue 实例 开始
    var app1 = new Vue({
        // 接管数据的区域范围
        el: "#app1",
        // 数据内容
        data: {
            content: 'JavaEdge',
        }
    })
</script>
</body>
</html>
```

会原封不动输出：

![](https://img-blog.csdnimg.cn/39f6baeffda74d4eb7c8e2c699ee8148.png)

### 2.2 定时操作

#### 最古老的操作DOM

```javascript
var dom = document.getElementById('root')
dom.innerHTML = 'JavaEdge'

setTimeout(function () {
    dom.innerHTML = 'bye JavaEdge'
}, 2000);
```

#### Vue.js

无需再管 dom 操作，而是将注意力都放在对数据的管理。
数据是啥，页面就展示啥。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>hello world</title>
    <script src="vue.js"></script>
</head>
<body>
<div id="root">
    {{title}}
</div>

<script>
    var app = new Vue({
        el: "#root",
        data: {
            title: "hello world"
        }
    })

    setTimeout(function () {
        app.$data.title = "bye world"
    }, 2000)
</script>
</body>
</html>
```

### 暴露实例属性与方法

除了数据属性，Vue 实例还暴露一些有用的实例属性与方法。它们都有`前缀 $`，以与用户定义的属性区分。如：

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>hello world</title>
    <script src="vue.js"></script>
</head>
<body>
<div id="example">
    {{title}}
</div>

<script>
    var data = {a: 1}
    var vm = new Vue({
        el: '#example',
        data: data
    })

    // => true
    vm.$data === data
    // => true
    vm.$el === document.getElementById('example')

    // $watch 是一个实例方法
    vm.$watch('a', function (newValue, oldValue) {
        // 这个回调将在 `vm.a` 改变后调用
    })
</script>
</body>
</html>
```

## 3 列表渲染

### 3.1  v-for

把一个数组对应为一组元素。

 `v-for` 根据一组数组的选项列表进行渲染，需使用 `item in items` 语法：

- `items` 是源数据数组
- `item` 是数组元素迭代的别名

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <script src='vue.js'></script>
</head>
<body>
<div id="app">
    <ul id="example-1">
        <li v-for="item in items">
            {{ item.message }}
        </li>
    </ul>
</div>

<script>
    var example1 = new Vue({
        el: '#example-1',
        data: {
            items: [
                { message: 'Foo' },
                { message: 'Bar' }
            ]
        }
    })
</script>
</body>
</html>
```

结果：

```
Foo
Bar
```

在 `v-for` 块中，我们拥有对父作用域属性的完全访问权限。

`v-for` 支持可选的第二个参数为当前项的索引：

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <script src='vue.js'></script>
</head>
<body>
<div id="app">
    <ul id="example-2">
        <li v-for="(item, index) in items">
            {{ parentMessage }} - {{ index }} - {{ item.message }}
        </li>
    </ul>
</div>

<script>
    var example2 = new Vue({
        el: '#example-2',
        data: {
            parentMessage: 'Parent',
            items: [
                {message: 'Foo'},
                {message: 'Bar'}
            ]
        }
    })
</script>
</body>
</html>
```

结果：

```
Parent - 0 - Foo
Parent - 1 - Bar
```

也可用 `of` 替代 `in` 作为分隔符，因为它最接近 JS 迭代器的语法：

```javascript
<div v-for="item of items"></div>
```

### 3.2  一个对象的 `v-for`

也可用 `v-for` 通过一个对象的属性来迭代。


遍历对象时，是按 `Object.keys()` 的结果遍历，但不保证它的结果在不同的 JavaScript 引擎下是一致的。

```javascript
<ul id="v-for-object" class="demo">
  <li v-for="value in object">
    {{ value }}
  </li>
</ul>
```

也可提供第二个的参数为键名：

```javascript
<div v-for="(value, key) in object">
  {{ key }}: {{ value }}
</div>
```

第三个参数为索引：

```javascript
<div v-for="(value, key, index) in object">
  {{ index }}. {{ key }}: {{ value }}
</div>
```

遍历对象时，是按 Object.keys() 的结果遍历，但不保证它的结果在不同 JavaScript 引擎下一致。

### 3.3  key

当 Vue 用 `v-for` 正在更新已渲染过的元素列表时，它默认用“就地复用”策略。若数据项顺序被改变，Vue 不会移动 DOM 元素来匹配数据项的顺序， 而是简单复用此处每个元素，并确保它在特定索引下显示已被渲染过的每个元素。类似 Vue 1.x 的 `track-by="$index"` 。

这默认模式是高效的，但只适用于**不依赖子组件状态或临时 DOM 状态 (例如：表单输入值) 的列表渲染输出**。

为了给 Vue 一个提示，以便它能跟踪每个节点的身份，从而重用和重新排序现有元素，要为每项提供一个唯一 `key` 属性。理想的 `key` 值是每项都有的唯一 id。这特殊属性相当于 Vue 1.x 的 `track-by` ，但其工作方式类似于一个属性，所以你需要用 `v-bind` 来绑定动态值 (在这里使用简写)：

```javascript
<div v-for="item in items" :key="item.id">
  <!-- 内容 -->
</div>
```

建议尽可能使用 `v-for` 时提供 `key`，除非：

- 遍历输出的 DOM 内容简单
- 或刻意依赖默认行为，以获取性能提升

因为它是 Vue 识别节点的一个通用机制，`key` 并不与 `v-for` 特别关联。不要使用对象或数组之类的非原始类型值作为 `v-for` 的 `key`。用字符串或数类型的值取而代之。

### ① 最初文件

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
</head>
<body>
<div id="app">
    <input type="text"/>
    <button>提交</button>
    <ul>
        <li>first</li>
        <li>second</li>
    </ul>
</div>
</body>
</html>
```

效果：

![](https://img-blog.csdnimg.cn/1cbc68c3a6a44352832879bac21d53c1.png)

### ② Vue版

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script src='vue.js'></script>
</head>
<body>
<div id="app">
    <input type="text"/>
    <button>提交</button>
    <ul>
        <li v-for="item in list">{{item}}</li>
    </ul>
</div>

<script>
    var app = new Vue({
        el: '#app',
        data: {
            list: ['first', 'second'],
        }
    })
</script>
</body>
</html>
```



## 4 事件处理

### 4.1  监听事件

 `v-on` 指令监听 DOM 事件，并在触发时运行一些 JS 代码。

```javascript
<!DOCTYPE html>
<html lang="en" xmlns:v-on="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <script src='vue.js'></script>
</head>
<body>
<div id="example-1">
    <button v-on:click="counter += 1">Add 1</button>
    <p>button被点击了{{ counter }}次</p>
</div>

<script>
    var example1 = new Vue({
        el: '#example-1',
        data: {
            counter: 0
        }
    })
</script>
</body>
</html>
```


![](https://img-blog.csdnimg.cn/011c3b6060094791be04e3d1172fed4c.png)

### 4.2 事件处理方法（绑定点击事件）

但许多事件处理逻辑复杂，所以直接把 JS 代码写在 `v-on` 指令中不行， `v-on` 还可接收一个需要调用的方法名称：

```javascript
<!DOCTYPE html>
<html lang="en" xmlns:v-on="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <script src='vue%205/vue.js'></script>
</head>
<body>
<div id="example-2">
    <!-- `greet` 是在下面定义的方法名 -->
    <button v-on:click="greet">Greet</button>
</div>

<script>
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
</script>
</body>
</html>
```

点击 Greet 按钮后弹窗：

![](https://img-blog.csdnimg.cn/6ad39c3bb4ad40c3b3bdadf7ecbbce2a.png)



## 5  表单输入绑定



### 5.5 实现表单数据绑定

初始时值为空串：
![](https://upload-images.jianshu.io/upload_images/4685968-6d099323e177dffa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

产生输入后，值发生变化：
![](https://upload-images.jianshu.io/upload_images/4685968-a7de5078703affa4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在控制台改变值后，页面值随之改变：
![](https://upload-images.jianshu.io/upload_images/4685968-47a9c5ae950e82dc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如何使得点击事件可以发现输入框的值呢？

![](https://upload-images.jianshu.io/upload_images/4685968-525d91c5f12e0955.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



让我们快速进入下一个任务，要实现输入内容提交后打印，何解？



```html
<!DOCTYPE html>
<html lang="en" xmlns:v-on="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <title>TodoList</title>
    <script src='vue.js'></script>
</head>
<body>
<div id="app">
    <input type="text" v-model="inputValue"/>
    <button v-on:click="handleBtnClick">提交</button>
    <ul>
        <li v-for="item in list">{{item}}</li>
    </ul>
</div>

<script>
    var app = new Vue({
        el: '#app',
        data: {
            list: [],
            inputValue: ''
        },
        methods: {
            handleBtnClick: function () {
                this.list.push(this.inputValue)
            }
        }
    })
</script>
</body>
</html>
```

即可实现，是不是很简单呢~

![](https://img-blog.csdnimg.cn/f6334fa35ee5445ca7865e6870d772ef.png)

可是发现好麻烦呀，每次提交，都需要手动清除前一次输入的内容，何解？

```javascript
handleBtnClick: function () {
    this.list.push(this.inputValue)
    this.inputValue = ''
}
```

![](https://img-blog.csdnimg.cn/373cf3ada88e44c8abbe8f99e0430d9d.png)

## 6 总结

是不是很简单~

至此，待办任务功能实现完毕，无任何DOM操作，全程只操作数据！Vue完美！此即为MVVM模式，下回分解MVVM，不见不散！