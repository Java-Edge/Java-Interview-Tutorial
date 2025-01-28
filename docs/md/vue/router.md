# 11-Vue3最新Router带来哪些颠覆性变化？

## 1 前后端开发模式的演变

jQuery时代对大部分Web项目，前端都不能控制路由，要依赖后端项目的路由系统。通常，前端项目也部署在后端项目的模板里，项目执行示意图：

![](https://p.ipic.vip/ex9q3u.png)

jQuery时代前端都要学会在后端模板如JSP里写代码。此时，前端工程师无需了解路由。对每次的页面跳转，都由后端负责重新渲染模板。

前端依赖后端，且前端无需负责路由，有很多优点，如开发速度快、后端也承担部分前端任务，所以至今很多内部管理系统还这样。

也有缺点，如：

- 前后端项目无法分离
- 页面跳转由于需重新刷新整个页面、等待时间较长，让交互体验下降

为提高页面交互体验，很多前端做不同尝试。前端开发模式变化，项目结构也变化。目前前端开发中，用户访问页面后代码执行的过程：

![](https://p.ipic.vip/nunekr.png)

- 用户访问路由后，无论URL地址，都直接渲染一个前端的入口文件index.html，然后在index.html文件中加载JS、CSS
- 之后，js获取当前页面地址及当前路由匹配的组件
- 再去动态渲染当前页面

用户在页面上点击时，也不需刷新页面，而直接通过JS重新计算出匹配的路由渲染。

前后两个示意图中，绿色的部分表示的就是前端负责的内容。后面这架构下，前端获得路由的控制权，在js中控制路由系统。也因此，页面跳转时就不需刷新页面，网页浏览体验提高。 这种所有路由都渲染一个前端入口文件的方式，是单页面应用程序（SPA）的雏形。

通过js动态控制数据去提高用户体验的方式并不新奇，Ajax让数据获取不需刷新页面，SPA应用让路由跳转也不需要刷新页面。这种开发模式在jQuery时代就出来，浏览器路由的变化可以通过pushState来操作，这种纯前端开发应用的方式，以前称Pjax （pushState+ Ajax）。之后，这种开发模式在MVVM框架时代放异彩，现在大部分使用Vue/React/Angular应用都这种架构。

SPA应用相比于模板的开发方式，对前端更友好，如：

- 前端对项目控制权更大
- 交互体验更丝滑
- 前端项目终于可独立部署

完成了前后端系统完全分离。

## 2 前端路由的实现原理

通过URL区分路由的机制，有两种实现：

- hash模式，通过URL中#后面的内容做区分，hash-router
- history模式，路由看起来和正常URL一致

对应vue-router的函数：

- createWebHashHistory
- createWebHistory

![](https://p.ipic.vip/upar9u.png)

### 2.1 hash 模式

单页应用在页面交互、页面跳转上都是无刷新的，极大提高用户访问网页的体验。 为实现单页应用，前端路由的需求也变重要。

类似服务端路由，前端路由实现也简单，就是匹配不同 URL 路径，进行解析，然后动态渲染出区域 HTML 内容。但URL每次变化都会造成页面的刷新。解决思路：改变 URL 时保证页面的不刷新。

2014年前，大家通过 hash 实现前端路由，URL hash 中的 # 类似下面这种 # ：

```plain
http://www.xxx.com/#/login
```

之后，在进行页面跳转操作时，hash 值变化并不会导致浏览器页面刷新，只会触发hashchange事件。在下面的代码中，通过对hashchange事件的监听，就可在fn函数内部进行动态地页面切换。

```javascript
window.addEventListener('hashchange',fn)
```

### 2.2 history 模式

2014年后HTML5标准发布，浏览器多API：pushState 和 replaceState。可改变 URL 地址，并且浏览器不会向后端发送请求，就能用另外一种方式实现前端路由。

监听popstate事件，可监听到通过pushState修改路由的变化。并且在fn函数中，我们实现了页面的更新

```js
window.addEventListener('popstate', fn)
```

## 3 手写vue-router

- src/router目录新建grouter文件夹
- 并在grouter文件夹内部新建index.js

手写Vuex的基础，在index.js写代码。

先用Router类去管理路由，并用createWebHashHistory返回hash模式相关的监听代码及返回当前URL和监听hashchange事件的方法

```javascript
import {ref,inject} from 'vue'
const ROUTER_KEY = '__router__'

function createRouter(options){
    return new Router(options)
}

function useRouter(){
    return inject(ROUTER_KEY)
}
function createWebHashHistory(){
    function bindEvents(fn){
        window.addEventListener('hashchange',fn)
    }
    return {
        bindEvents,
        url:window.location.hash.slice(1) || '/'
    }
}
class Router {
    constructor(options) {
        this.history = options.history
        this.routes = options.routes
        this.current = ref(this.history.url)

        this.history.bindEvents(()=>{
            this.current.value = window.location.hash.slice(1)
        })
    }
   	// 通过Router类install方法注册Router实例
    install(app) {
        app.provide(ROUTER_KEY,this)
    }
}
// 暴露createRouter方法创建Router实例
// 暴露useRouter方法，获取路由实例
export {createRouter,createWebHashHistory,useRouter}
```

回到src/router/index.js：

```javascript
import {createRouter, createWebHashHistory} from './grouter/index'

const router = createRouter({
  history: createWebHashHistory(),
  // 使用routes作为页面参数传递给createRouter函数
  routes
})
```

注册两个内置组件router-view和router-link。在createRouter创建的Router实例上，current返回当前路由地址，并用ref包裹成响应式数据。

router-view组件功能，就是current变化时，去匹配current地址对应组件，然后动态渲染到router-view。

### 实现RouterView组件

src/router/grouter新建RouterView.vue。

```vue
<template>
 		4. 在template内部使用component组件动态渲染
    <component :is="comp"></component>
</template>
<script setup>

import {computed } from 'vue'
import { useRouter } from '../grouter/index'
// 1. 先用useRouter获取当前路由的实例
let router = useRouter()

// 3. 最后通过计算属性返回comp变量
const comp = computed(()=>{
  	// 2. 通过当前的路由，即router.current.value值，在用户路由配置route中计算出匹配的组件
    const route = router.routes.find(
        (route) => route.path === router.current.value
    )
    return route?route.component : null
})
</script>
```

### 实现router-link组件

grouter下新建RouterILink.vue。template依然是渲染一个a标签，只是把a标签的href属性前面加了个一个#， 就实现了hash的修改。

```vue
<template>
    <a :href="'#'+props.to">
        <slot />
    </a>
</template>

<script setup>
import {defineProps} from 'vue'
let props = defineProps({
    to:{type:String,required:true}
})

</script>
```

然后，回到grouter/index.js中，我们注册router-link和router-view这两个组件, 这样hash模式的迷你vue-router就算实现了。这里我演示了支持hash模式迷你vue-router，那你不妨进一步思考一下，history模式又该如何实现。

```javascript
import {ref,inject} from 'vue'
import RouterLink from './RouterLink.vue'
import RouterView from './RouterView.vue'
class Router{
    ....
    install(app){
        app.provide(ROUTER_KEY,this)
        app.component("router-link",RouterLink)
        app.component("router-view",RouterView)
    }
}

```

**实际上，vue-router还需要处理很多额外的任务，比如路由懒加载、路由的正则匹配等等**。在今天了解了vue-router原理之后，等到课程最后一部分剖析vue-router源码的那一讲时，你就可以真正感受到“玩具版”的router和实战开发中的router的区别。

## 4 vue-router实战

 **路由匹配的语法** 上，vue-router支持动态路由。有一用户页面使用User组件，但每个用户的信息不一，需给每个用户配置单独的路由入口，就可按下面代码样式配置路由。

冒号开头的id就是路由的动态部分，会同时匹配/user/dasheng和/user/javaedge， 详见 [官方文档的路由匹配语法部分](https://next.router.vuejs.org/zh/guide/essentials/route-matching-syntax.html)。

```javascript
const routes = [
  { path: '/users/:id', component: User },
]
```

有些页面，只有管理员才可访问，普通用户访问提示无权限。得用vue-router的 **导航守卫功能** ，即访问路由页面之前进行权限认证，做到页面级控制，只允许某些用户访问。

项目庞大后，如果首屏加载文件太大，就可能影响性能。可用vue-router的 **动态导入功能**，把不常用的路由组件单独打包，当访问到这个路由的时候再进行加载，这也是vue项目常见优化方式。

## 5 总结

回顾前后端开发模式的演变，也即前端项目经历的从最初的嵌入到后端内部发布，再到现在的前后端分离的过程，而这一过程也见证了前端SPA应用的发展。

前端路由实现的两种方式，即通过监听不同的浏览器事件，实现hash模式和history模式。之后，根据这个原理，手写vue-router，通过createRouter创建路由实例，并在app.use函数内部执行router-link和router-view组件的注册，最后在router-view组件内部动态的渲染组件。

### Vue Router 路由实现步骤

**路由配置**：

```js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/login.vue')
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true } // 需要登录权限
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
```

**路由守卫**：

```js
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    // 需要登录但未登录，重定向到登录页
    next({ 
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})
```



1. **登录组件中使用路由**

```js
<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const login = async () => {
  try {
    await doLogin()
    // 登录成功后跳转
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    handleError(error)
  }
}

const logout = async () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>
```

1. **主应用挂载路由**

```js
import { createApp } from 'vue'
import router from './router'
import App from './App.vue'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

1. **路由视图渲染**

```js
<template>
  <router-view></router-view>
</template>
```

路由流程:

1. 配置路由表
2. 设置路由守卫
3. 组件中注入路由
4. 应用挂载路由
5. 视图渲染组件

使用方式:

- 声明式: `<router-link to="/login">`
- 编程式: `router.push('/login')`

## FAQ

60行代码实现hash模式的迷你vue-router，支持history模式的迷你vue-router咋实现？

实现支持 **history 模式** 的迷你 Vue Router 的核心是利用 HTML5 提供的 `pushState` 和 `replaceState` API，以及监听 `popstate` 事件来响应浏览器的回退、前进等操作。以下是支持 history 模式的迷你 Vue Router 的实现步骤：

------

### 实现 history 模式的 createWebHistory 方法

在 `src/router/grouter/index.js` 中修改或新增以下代码，用于返回 history 模式相关的监听逻辑：

```javascript
function createWebHistory() {
    function bindEvents(fn) {
        window.addEventListener('popstate', fn);
    }

    function push(url) {
        history.pushState(null, '', url); // 修改浏览器地址但不刷新页面
    }

    return {
        bindEvents,
        push,
        url: window.location.pathname || '/', // 获取当前路径
    };
}
```

------

### 修改 Router 类

扩展 Router 类，支持 history 模式的路由变化处理：

```javascript
class Router {
    constructor(options) {
        this.history = options.history;
        this.routes = options.routes;
        this.current = ref(this.history.url);

        this.history.bindEvents(() => {
            this.current.value = window.location.pathname;
        });
    }

    // 编程式导航（例如 router.push('/path')）
    push(url) {
        this.history.push(url);
        this.current.value = url;
    }

    install(app) {
        app.provide(ROUTER_KEY, this);
        app.component('router-link', RouterLink);
        app.component('router-view', RouterView);
    }
}
```

------

### 修改 RouterLink 组件

支持 `history` 模式的 RouterLink 组件不需要 `#` 前缀，使用编程式导航：

```vue
<template>
    <a @click.prevent="navigate">{{ $slots.default() }}</a>
</template>

<script setup>
import { defineProps, inject } from 'vue';

const props = defineProps({
    to: { type: String, required: true },
});

const router = inject('__router__');

function navigate() {
    router.push(props.to);
}
</script>
```

------

### 注册 Vue Router

在 `src/router/index.js` 中注册使用 `createWebHistory` 的路由实例：

```javascript
import { createRouter, createWebHistory } from './grouter/index';

const routes = [
    { path: '/', component: Home },
    { path: '/about', component: About },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
```

------

### 配置 Web 服务

要支持 history 模式，需要配置服务器以处理所有的路径。以 Nginx 为例，配置如下：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /path/to/your/app;
        index index.html;
        try_files $uri /index.html;
    }
}
```

------

### 扩展内容

对比 `hash` 模式和 `history` 模式的特点：

| 特点           | Hash 模式                   | History 模式              |
| -------------- | --------------------------- | ------------------------- |
| URL 格式       | `http://example.com/#/path` | `http://example.com/path` |
| 浏览器刷新处理 | 不需后端额外支持            | 需服务器配置支持          |
| SEO            | 不友好                      | 更友好                    |
| 实现复杂度     | 简单                        | 较复杂                    |

------

**思考扩展**
 在实现基础的 `history` 模式后，可以尝试支持以下功能：

1. 动态路由加载（按需加载）。
2. 路由守卫的实现（`beforeEach` 等）。
3. 嵌套路由的实现。

通过实现这些功能，能够更全面掌握 Vue Router 的设计原理和核心机制！