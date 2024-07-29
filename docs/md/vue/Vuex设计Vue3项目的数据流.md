# Vuex设计Vue3项目的数据流

## 1 前端数据管理

首先，我们需要掌握前端的数据怎么管理，现代Web应用都是由三大件构成，分别是：组件、数据和路由。

有一些数据组件之间需要共享时如何实现？定义一个全局变量，任何组件需要数据的时候都去这个全局变量中获取。一些通用的数据，比如用户登录信息，以及一个跨层级的组件通信都可以通过这个全局变量很好地实现。在下面的代码中我们使用\_store这个全局变量存储数据。

```js
window._store = {}
```

数据存储的结构图如下，任何组件内部都可以通过window.\_store获取数据并且修改。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/cec8dc94dcb5bc37a07235aefc5a0367.png)

但这样就会产生一个问题，window.\_store并不是响应式的，如果在Vue项目中直接使用，那么就无法自动更新页面。所以我们需要用ref和reactive去把数据包裹成响应式数据，并且提供统一的操作方法，这其实就是数据管理框架Vuex的雏形了。

## 2 Vuex是啥？

其意义，就是管理我们项目的数据。

组件化机制搭建整个项目，每个组件内部有自己的数据和模板。但总有些数据要共享，如当前登录的用户名、权限等数据，如都在组件内部传递，很混乱。

如把开发项目比作公司，项目中各种数据像办公用品。很多小公司初创不需管理太多，随便拿办公用品。但是公司大了，就要专门的办公用品申报流程，对数据做统一申请发放，才方便做资产管理。 **Vuex就相当于项目大管家，集中式存储管理应用的所有组件的状态**。

## 3 上手使用

src/store目录就是留给Vuex，项目目录下执行命令安装：

```bash
$ npm install vuex@next
```

### 3.1 创建数据存储

src/store下新建index.js。

用createStore创建一个数据存储，称store。

store内部还需要一个mutation配置去修改数据，可理解为数据更新的申请单，mutation内部函数会把state作为参数，直接操作state.count即可完成数据修改。

```js
import { createStore } from 'vuex'

const store = createStore({
  state () {
    return {
      count: 666
    }
  },
  mutations: {
    add (state) {
      state.count++
    }
  }
})
```

### 3.2 注册数据源

在Vue的组件系统外，多了一个数据源，里面只有一个变量count，且有一个方法可累加count。然后，在Vue中注册该数据源，在项目入口文件src/main.js，使用app.use(store)进行注册，Vue和Vuex就连接上了：

```js
...
import store from "./store";

...
app.use(store);
```

用 `.use` 即可注册路由，使用 `.mount` 即可把 Vue 这个应用挂载到页面上：

```js
const app = createApp(App)
app.use(store)
    .use(router)
    .mount('#app')
```

### 3.3 新建Count.vue组件

在src/components下新建Count.vue组件。

初始化值和修改的函数有①、②两个变化：

必须用add，不能直接操作 store.state.count +=1，因为这数据属Vuex统一管理，要用store.commit(‘add’)去触发Vuex中的mutation去修改数据。

```vue
<template>
<!-- 点击触发add方法 -->
<div @click="add">
  	<!-- 渲染count变量 -->
    {{count}}
</div>
</template>

<script setup>
import { computed } from 'vue'
// useStore去获取数据源
import {useStore} from 'vuex'
let store = useStore()
// ① count不是使用ref直接定义，而是使用计算属性返回store.state.count，即刚才在src/store/index.js中定义的count
let count = computed(()=>store.state.count)

// ② 用来修改数据
function add(){
    store.commit('add')
}
</script>
```

相比ref方式，真简单，那啥时数据用Vuex管理，啥时又要放在组件内部用ref管理？对于一个数据：

- 如只是组件内部使用，就ref管理
- 如需跨组件，跨页面共享时，就要把数据从Vue组件内部抽离，放在Vuex管理

如项目中的登录用户名，页面右上角要显示，有些信息弹窗也要显示。这样的数据就要放在Vuex统一管理。每当需要抽离这样的数据，都要思考这个数据的初始化、更新逻辑。

如下图，项目初始化时没有登录状态，用户登录成功后，才获取用户名信息，去修改Vuex数据，再通过Vuex派发到所有组件：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/3a8b635e97a255bd8ceacca4182d0e4b.png)

## 4 手写Vuex

先创建一个变量store存储数据。下一步就是把store的数据包转成响应式数据，并提供给Vue组件用。

在Vue中有 [provide/inject](https://v3.cn.vuejs.org/guide/component-provide-inject.html#%E5%A4%84%E7%90%86%E5%93%8D%E5%BA%94%E6%80%A7) 这两个函数专门用来做数据共享，provide注册数据后，所有子组件都可通过inject获取数据。

完成刚才的数据转换，进入src/store文件夹，新建gvuex.js。如下代码用一个Store类管理数据，类内部使用\_state存储数据，使用mutations存储数据修改的函数，注意state已用reactive包裹成响应式数据。

```js
import { inject, reactive } from 'vue'

const STORE_KEY = '__store__'
function useStore() {
  return inject(STORE_KEY)
}
function createStore(options) {
  return new Store(options)
}
class Store {
  constructor(options) {
    this._state = reactive({
      data: options.state()
    })
    this._mutations = options.mutations
  }
}
export { createStore, useStore }
```

上面代码还暴露createStore去创建Store的实例，且可在任意组件的setup函数内，使用useStore去获取store的实例。下一步我们回到src/store/index.js，把vuex改成 ./gvuex。

下面代码用createStore创建一个store实例，且实例内部使用state定义count变量和修改count值的add函数：

```js
// import { createStore } from 'vuex'
import { createStore } from './gvuex'
const store = ...
export default store
```

最终用store的方式，在项目入口文件src/main.js中使用app.use(store)注册。为了让useStore能正常工作，下面的代码中，我们需要给store新增一个install方法，这个方法会在app.use函数内部执行。我们通过app.provide函数注册store给全局的组件使用：

```js
class Store {
  // main.js入口处app.use(store)的时候，会执行这个函数
  install(app) {
    app.provide(STORE_KEY, this)
  }
}
```

下面的代码中，Store类内部变量\_state存储响应式数据，读取state的时候直接获取响应式数据\_state.data，并且提供了commit函数去执行用户配置好的mutations。

```js
import { inject, reactive } from 'vue'
const STORE_KEY = '__store__'
function useStore() {
  return inject(STORE_KEY)
}
function createStore(options) {
  return new Store(options)
}
class Store {
  constructor(options) {
    this.$options = options
    this._state = reactive({
      data: options.state
    })
    this._mutations = options.mutations
  }
  get state() {
    return this._state.data
  }
  commit = (type, payload) => {
    const entry = this._mutations[type]
    entry && entry(this.state, payload)
  }
  install(app) {
    app.provide(STORE_KEY, this)
  }
}
export { createStore, useStore }
```

这样在组件内部，我们就可以使用这个迷你的Vuex去实现一个累加器了。下面的代码中，我们使用useStore获取store的实例，并且使用计算属性返回count，在修改count的时候使用store.commit(‘add’)来修改count的值。

```js
import {useStore} from '../store/gvuex'
let store =useStore()
let count = computed(()=>store.state.count)
function add(){
    store.commit('add')
}
```

这样借助vue的插件机制和reactive响应式功能，我们只用30行代码，就实现了一个最迷你的数据管理工具，也就是一个迷你的Vuex实现。

结合例子，正式介绍一下Vuex看一看Vuex具体咋用。

## 5 Vuex实战

Vuex就是一个公用版ref，提供响应式数据给整个项目使用。现在的功能还比较简单，项目大部分情况都是像之前的清单应用一样，除了简单的数据修改，还会有一些异步任务的触发，这些场景Vuex都有专门的处理方式。

在Vuex中，你可以使用getters配置，来实现computed的功能，比如我们想显示累加器数字乘以2之后的值，那么我们就需要引入getters配置。

下面的代码中，我们实现了计算累加器数字乘以2以后的值。我们在Vuex中新增了getters配置，其实getters配置和Vue中的computed是一样的写法和功能。我们配置了doubule函数，用于显示count乘以2的计算结果。

```js
import { createStore } from 'vuex'
const store = createStore({
  state () {
    return {
      count: 666
    }
  },
  getters:{
    double(state){
          return state.count*2
      }
  },
  mutations: {
    add (state) {
      state.count++
    }
  }
})

export default store

```

然后，我们可以很方便地在组件中使用getters，把double处理和计算的逻辑交给Vuex。

```js
let double = computed(()=>store.getters.double)
```

实际项目开发中，有很多数据我们都是从网络请求中获取到的。在Vuex中，mutation的设计就是用来实现同步地修改数据。如果数据是异步修改的，我们需要一个新的配置action。现在我们模拟一个异步的场景，就是点击按钮之后的1秒，再去做数据的修改。

面对这种异步的修改需求，在Vuex中你需要新增action的配置，在action中你可以做任意的异步处理。这里我们使用setTimeout来模拟延时，然后在action内部调用mutation就可以了。

听起来是不是很绕？不过你不用担心，下面的代码就很清晰地演示了这个过程。

首先，我们在createStore的配置中，新增了actions配置，这个配置中所有的函数，可以通过解构获得commit函数。内部的异步任务完成后，就随时可以调用commit来执行mutations去更新数据。

```js
const store = createStore({
  state () {
    return {
      count: 666
    }
  },
  ...
  actions:{
      asyncAdd({commit}){
          setTimeout(()=>{
            commit('add')
          },1000)
      }
  }
})
```

**action并不是直接修改数据，而是通过mutations去修改，这是我提醒你需要注意的**。actions的调用方式是使用store.dispatch，在下面的代码中你可以看到这样的变化效果：页面中新增了一个asyncAdd的按钮，点击后会延迟一秒做累加。

```js
function asyncAdd(){
    store.dispatch('asyncAdd')
}
```

执行效果：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/d07df967ed262e3fd02751fdc55171b4.gif)

Vuex在整体上的逻辑如下图所示，从宏观来说，Vue的组件负责渲染页面，组件中用到跨页面的数据，就是用state来存储，但是Vue不能直接修改state，而是要通过actions/mutations去做数据的修改。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/aa4a2b4f993c402f84b1ff920b13a878.png)

Vuex官方结构图，拆解了Vuex在Vue全家桶中的定位，项目也用Vuex管理所有的跨组件的数据，并且我们也会在Vuex内部根据功能模块去做拆分，会把用户、权限等不同模块的组件分开去管理。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/f5b43c26ffb900c0cbbb1aa61a898afa.png)

由于Vuex所有的数据修改都是通过mutations来完成的，因而我们可以很方便地监控到数据的动态变化，后面我们可以借助官方的调试工具，非常方便地去调试项目中的数据变化。

回到正在做的这个项目中，有大量的数据交互需求、用户的登录状态、登录的有效期、布局的设置，不同用户还会有不同的菜单权限等。

不过面对眼花缭乱的交互需求，你不能自乱阵脚。总体来说， **我们在决定一个数据是否用Vuex来管理的时候，核心就是要思考清楚，这个数据是否有共享给其他页面或者是其他组件的需要**。如果需要，就放置在Vuex中管理；如果不需要，就应该放在组件内部使用ref或者reactive去管理。

## 6 下一代Vuex

Vuex由于在API的设计上，对TypeScript的类型推导的支持比较复杂，用起来很是痛苦。因为我们的项目一直用的都是JavaScript，你可能感触并不深，但对于使用TypeScript的用户来说，Vuex的这种问题是很明显的。

为了解决Vuex的这个问题，Vuex的作者最近发布了一个新的作品叫Pinia，并将其称之为下一代的Vuex。Pinia的API的设计非常接近Vuex5的提案，首先，Pinia不需要Vuex自定义复杂的类型去支持TypeScript，天生对类型推断就非常友好，并且对Vue Devtool的支持也非常好，是一个很有潜力的状态管理框架。

## 7 总结

从前端数据管理概念开始讲起。每个组件内部有自己的数据和模板，那共享的数据怎么科学管理呢？这就需要Vuex。

Vuex是一个状态和数据管理的框架，负责管理项目中多个组件和多个页面共享的数据。在开发项目的时候，我们就会把数据分成两个部分，一种数据是在某个组件内部使用，我们使用ref或者reactive定义即可，另外一种数据需要跨页面共享，就需要使用Vuex来进行管理。

之后，我们还讲到了Vuex带来了几个新的概念，我们使用state定义数据，使用mutation定义修改数据的逻辑，并且在组件中使用commit去调用mutations。在此基础之上，还可以用getters去实现Vuex世界的计算属性，使用action来去定义异步任务，并且在内部调用mutation去同步数据。

Vuex的出现，让我们整个项目中的数据流动变得非常自然。数据流向组件，但组件不能直接修改数据，而是要通过mutation提出申请，mutation去修改数据，形成了一个圆环。这种方式对于我们项目的开发、维护和调试都是有很大的帮助。之后，我们一起手写了一个迷你的Vuex，通过实战巩固前面的学习。

最后，简单介绍Pinia框架，即下一代Vuex。