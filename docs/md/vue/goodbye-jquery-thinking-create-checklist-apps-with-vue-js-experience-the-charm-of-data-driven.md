# 告别 jQuery 思维：用 Vue.js 轻松打造清单应用，体验数据驱动的魅力

## 0 前言

团队的项目是用Vue.js开发的，但并不熟悉Vue的具体技术细节，所以我决定带他先做一个清单应用，先在整体上熟悉这个框架。带你们做个清单应用，更多的是一种模拟的场景，并不需要对号入座到真实的工作场景下。

## 1 任务分解

有一个输入框，供我们输入数据；下方有一个列表，显示着所有我们要做的事情。

在输入框输入内容后，敲下回车，下面就会新增一条数据。对于每个要做的事情，你还可以用复选框标记，标记后文字就会变灰，并带有一个删除的效果，表示这事已做完。

![](https://p.ipic.vip/1akdw1.png)

清单应用麻雀虽小，五脏俱全。不管入门哪个框架，都可写一个清单体验。

只有简单jQuery开发经验，先要思想转变。对比

## 2 jQuery V.S Vue.js

做一个输入框，里面输入的任何数据都会在页面上同步显示。

### 2.1 jQuery开发思路

1. 先找到输入框，给输入框绑定输入事件
2. 输入的同时，我们获取输入的值
3. 再找到对应的html标签，更新标签的内容

代码：

```html
<div>
    <h2 id="app"></h2>
    <input type="text" id="todo-input">
</div>
<script src="jquery.min.js"></script>
<script>
    // 1. 先找到输入框，然后持续监听输入
    $('#todo-input').on('input',function(){
        let val = $(this).val() // 2. 之后一直等待到输入值被获取
        $('#app').html(val) // 3. 最后找到标签所在的前端页面位置，进行内容的修改
    })
</script>
```

jQuery开发逻辑就是先找到目标元素，再进行对应修改。

而Vue.js不再思考页面的元素咋操作，而是思考数据咋变化。即只需操作数据，至于数据和页面的同步问题，Vue帮我们处理。Vue让前端能专注数据本身操作，而数据和页面的同步问题，由Vue负责。 

### 2.2 Vue开发思路

我们需要一个数据，在输入框的代码和h2标签的代码内使用。只需操作数据，再交给Vue去管理数据和页面的同步。

Vue下，想页面显示一个数据:

- 先在代码的data里声明数据
- 输入框代码里用v-model标记输入框和数据的同步
- HTML模板里，两个花括号标记，来显示数据，如{{title}}∂

#### 对应代码

```vue
<div id="app">
  <h2>{{title}}</h2>
  <input type="text" v-model="title">
</div>

<script src="https://unpkg.com/vue@next"></script>
<script>
const App = {
  data() {
    return {
      title: "" // 定义一个数据
    }
  }
}
// 启动应用
Vue.createApp(App).mount('#app')
</script>
```

## 3 清单页面的渲染

- 输入框输入数据
- 输入框下方要有个列表，显示所有输入的值

按Vue思考方式，需一个数组，再用v-for循环渲染。

### 代码

```vue
<div id="app">
  <h2>{{title}}</h2>
  <input type="text" v-model="title">
  <ul>
    <li v-for="todo in todos">{{todo}}</li>
  </ul>
</div>

<script src="https://unpkg.com/vue@next"></script>
<script>
const App = {
  data() {
    return {
      title: "", // 定义一个数据
      todos:['吃饭','睡觉'] // 再定义一个数据todos，输入一个数组
    }
  }
}
// 启动应用
Vue.createApp(App).mount('#app')
</script>
```

先放两个假数据，如在标签里直接写{{todos}}，就会看到显示的是数组，但不是想要的，我们需要显示一个列表。

Vue中只要渲染列表，都用v-for：

```xml
<li v-for="todo in todos">{{todo}}</li>
```

循环遍历todos这个数据， 每一条遍历的结果叫todo，再把这个数据渲染出来，页面就能显示一个列表：

![](https://p.ipic.vip/di4aqn.png)

## 4 处理用户交互

上步主要考虑：实现前端页面的一个输入框及能显示输入值的一个列表的功能。

下一步，就是回车时，让列表新增一条。按Vue思维：

- 监听用户的输入。在监听中，若判断到用户的输入是回车，就执行一个函数
- 在执行的这个函数内部，把title追加到todos最后面位置，并清空title

### 代码

```vue
<div id="app">
  <input type="text" v-model="title" @keydown.enter="addTodo">
  <ul>
    <li v-for="todo in todos">{{todo}}</li>
  </ul>
</div>

<script src="https://unpkg.com/vue@next"></script>
<script>
const App = {
  data() {
    return {
      title: "", // 定义一个数据
      todos:['吃饭','睡觉']
    }
  },
  methods:{
    addTodo(){
      this.todos.push(this.title)
      this.title = ""
    }
  }
}
// 启动应用
Vue.createApp(App).mount('#app')
</script>
```

@标记用户的交互：

- @click是点击
- @keydown是键盘敲下

监听回车键，那么我们就用@keydown.enter=“addTodo” 。

监听到用户的输入后，对要执行的函数，新增一个methods配置。函数内部，this可直接读到data里数据，无需考虑咋找到标签。只需如下一行就能让列表自动新增一条， 这就是数据驱动页面。

```js
this.todos.push(this.title)
```

## 5 额外信息的显示

实现标记清单中某项是否完成。

目前代码设计，输入只能是字符串格式。而标记功能，却是把列表中的某项，用灰色的字体背景和中划线来标记，以此表示这一条内容是已完成内容。

想实现，需改造数据结构，把内容的数据类型，从简单的字符串类型改为对象。

### 代码

```vue
  <ul>
    <li v-for="todo in todos">
      <input type="checkbox" v-model="todo.done">
      <span :class="{done:todo.done}"> {{todo.title}}</span>
    </li>
  </ul>

<script>
const App = {
  data() {
    return {
      title: "",
      todos:[
        {title:'吃饭',done:false},
        {title:'睡觉',done:true}
      ]
    }
  },
  methods:{
    addTodo(){
      this.todos.push({
        title:this.title,
        done:false
      })
      this.title = ""
    }
  }
}
</script>

<style>
  .done{
    color:gray;
    text-decoration: line-through;
  }
</style>
```

### 改造思路

对todos数组，除了title，还要加个done字段，标记列表中的某项内容是否完成，并且渲染时用todo.title。

前面对列表中每项用无序列表示。但若想在列表中实现对某些选项的同时多选，得用复选框。对每条信息，都要加个复选框，所以用v-model绑定这done字段，实现数据里能记录用户操作的状态。

还需根据done字段显示某行样式。Vue的冒号":" 开头的属性是用来传递数据，这里的写法就是根据todo.done决定是否有done这个class。最后，当加上".done"的样式后，左图就是效果，右图是涉及到".done"的相关代码：

![](https://p.ipic.vip/bas4ue.png)

## 6 进一步优化

还想增加两个功能：

- 在前端页面显示的列表的最下面，显示一下列表项目中没完成的项目的比例
- 新增一个清理的按钮，用来删掉已经标记为完成的列表中的一条或多条数据

### 第一个功能的代码（模版里写js）

```html
<div>
  {{todos.filter(v=>!v.done).length}}
  /
  {{todos.length}}
</div>
```

这段代码增加到上步最后的完整代码中，运行代码，从下图所示的前端页面运行时状态中，可见其中显示的未完成比例的数据也没问题。

![](https://p.ipic.vip/enb003.png)

代码看起来丑且性能差，且需要二次计算的数据。模板里写JS，看着代码也乱。Vue对此设计了

### 计算属性

用计算属性实现二次计算需求：

```vue
  <div>
    {{active}}  / {{all}}
  </div>

<script>
  computed:{
    active(){
      return this.todos.filter(v=>!v.done).length
    },
    all(){
      return this.todos.length
    }
  }
</script>
```

新增属性computed，其配置active、all都是函数。俩函数返回的计算后的值，在模板里可直接当做数据来用，这样把js的计算逻辑依然放在js，避免臃肿模板。

computed计算属性还内置缓存功能，如果依赖数据没变化，多次使用计算属性会直接返回缓存结果，相比直接写在模板，性能也提升。

计算属性不仅可以用来返回数据，有些时候我们也需要修改计算属性，如新增一个全选的复选框：

- 全选框在勾选与取消勾选两个状态之间的切换，会把所有清单内的数据都同步勾选
- 清单内的项目如果全部选中或者取消，也会修改全选框的状态

所以全选框这计算属性，就有了修改的需求。此时computed的配置就不能是函数，要变成一个对象，分别实现：

- get函数，之前的返回值
- set，修改计算属性要执行的函数

### computed修改后的代码

```vue
<div>
  全选<input type="checkbox" v-model="allDone">
  <span> {{active}}  / {{all}} </span>
</div>

<script>
computed:{
  active(){
    return this.todos.filter(v=>!v.done).length
  },
  all(){
    return this.todos.length
  },
  // 和没有全选框时的computed属性的配置代码相比，新增一个allDone的计算属性，页面中直接用checbox绑定
  allDone: {
      // allDone会返回啥值，只需判断计算属性active是否为0
      get: function () {
        return this.active === 0
      },
      // 修改allDone，即前端页面切换全选框时，直接遍历todos，把里面done字段直接和allDone同步
      set: function (val) {
        this.todos.forEach(todo=>{
          todo.done = val
        });
      }
  }
}
</script>
```

 实现新增一个全选的复选框后的效果：

![](/Users/javaedge/Pictures/Vue3images/428106/273d37ca7e59a40ac0d5a537203f41cf【海量资源：666java.com】.gif)

## 7 条件渲染

新增一个“清理”的按钮，点击之后把已完成的数据删除，功能需求很简单，但是有一个额外的要求，就是列表中没有标记为完成的某一项列表数据时，这个按钮是不显示的。

这种在特定条件下才显示，或者隐藏的需求也很常见，我们称之为条件渲染。在Vue中，我们使用v-if 来实现条件渲染。

### 代码

```vue
<button v-if="active<all" @click="clear">清理</button>
<script>
  methods:{
    clear(){
      this.todos = this.todos.filter(v=>!v.done)
    }
  }
</script>
```

active＜all时，显示清理按钮，即v-if后面值true时，显示清理按钮，false时不显示。

@click的作用是绑定点击事件。

还可用v-else配合v-if，当todos是空的时候，显示一条“暂无数据”的信息：

```xml
  <ul v-if="todos.length">
    <li v-for="todo in todos">
      <input type="checkbox" v-model="todo.done">
      <span :class="{done:todo.done}"> {{todo.title}}</span>
    </li>
  </ul>
  <div v-else>
    暂无数据
  </div>

```

当我们实现了清理按钮的功能，并且也实现了列表为空时，能够显示“暂无数据”的信息后，我们看下清单应用的最终效果。

 ![](/Users/javaedge/Pictures/Vue3images/428106/3c8ddf81d6b478069d6b1dec7b605572【海量资源：666java.com】.gif)

## 8 总结

先扭转之前jQuery开发思路，弄明白jQuery和Vue开发思路区别。从寻找DOM到数据驱动，前端开发的一次巨大变革。

Vue的入门做清单应用：先要有输入框能输入文本，并且在输入框下方循环显示清单，我们用到了v-model，v-for这些功能。这些v-开头的属性都是Vue自带写法，我们通过{{}}包裹的形式显示数据。

用户输入完成后回车新增一条数据，就用到@开头的几个属性，@keyup和@click都是绑定对应的交互事件。

最后，通过computed，我们能对页面数据的显示进行优化。我们所需要关心的，就是数据的变化。

## FAQ

现在所有的操作状态一刷新就都没了，咋解决？