# 04-可以无脑将Vue2项目升级到Vue3吗？

Vue 3 如此优秀，是不是应该赶紧把项目都升级到Vue 3？但不是所有项目都适合升级。

## 1 应该从2升到3吗？

如开启一个新项目，直接使用Vue 3最佳选择。

以前独立使用Vue 2 开发应用，不管咋组织代码，无法避免在data、template、methods中上下反复横跳，这种弊端在项目规模上来后更明显。

由于vue-cli基于Webpack开发，当项目规模上来后，每执行一下，调试环境就要1min，大项目之痛！

Vue 3 Composition API带来代码组织方式更利封装代码，维护不再上下横跳。Vite带来更好调试体验。

Vue 3 正式版已发布三年，无论辅助工具，还是周边库都已完善，胜任各种大型项目开发。越来越多公司尝试和体验Vue 3。新项目可直接拥抱Vue 3。

对于Vue 2，官方不再维护，问题和需求，官方不承诺修复和提供解答了。

## 2 兼容问题

Vue 3由于新的响应式系统用Proxy，存在兼容性问题。即如你的应用被要求兼容IE11，就选Vue 2。Vue团队已放弃 Vue 3 对IE11支持。一开始官方是有计划 Vue 3 支持IE11，但由于复杂度和优先级的问题，计划就搁置。

如今浏览器和JavaScript本身已有巨大发展。大部分的前端项目都在直接使用现代语言特性，微软本身也废弃IE了。所以 Vue 3 全面拥抱未来，原来准备投入到Vue 3 上支持IE11的精力转投给Vue 2.7。

## 3 Vue 2.7 有啥？

Vue 2.7 会移植Vue 3 的一些新特性，让你在Vue 2 的生态中，也能享受Vue 3部分新特性。在Vue 3 发布之前，Vue 2 项目中就可以基于@vue/composition-api插件，使用Composition API语法，Vue 2 会直接内置这个插件，在Vue 2 中默认也可以用Compositon来组合代码。

<script setup>语法也在Vue 2得到支持。如想用更精简的方式组织代码，也没问题，因为Vite也支持Vue 2。


综上，要不要使用Vue 3，要“因地制宜”。

![image-20230906221203933](https://p.ipic.vip/eeturu.png)

## 4 Vue 3 不兼容的写法

兼容性变更，官方有 [迁移指南](https://v3-migration.vuejs.org/)。

主要针对有Vue 2开发经验，希望更快适应Vue 3的。全面实战Vue 3 之前，不必完整阅读官方指南，因为Vue 3大部分 API 兼容Vue 2 。

Vue 2 使用new Vue()新建应用，有一些全局配置直接挂在 Vue，如：

- Vue.use使用插件
- Vue.component注册全局组件

```js
// 注册一个el-counter组件，全局可用
Vue.component('el-counter', {
  data(){
    return {count: 1}
  },
  // 直接渲染一个按钮，点击按钮时，按钮内的数字会累加
  template: '<button @click="count++">Clicked {{ count }} times.</button>'
})

let VueRouter = require('vue-router')
Vue.use(VueRouter)
```

然后要注册路由插件，即Vue 2使用vue-router。形式直接，但由于全局Vue只有一个，所以当我们在一个页面的多个应用中独立使用Vue就难了。

### 案例



```js
// 在Vue上先注册一个组件el-counter
Vue.component('el-counter',...)
// 创建两个Vue的实例
new Vue({el:'#app1'})
new Vue({el:'#app2'})
```

这两个实例都自动都拥有el-couter这组件，但易混淆。为解决这问题，Vue 3 引入一个新API createApp，即新增了App的概念。

全局的组件、插件都独立地注册在这App内部，解决了俩实例易混淆的问题。

### 使用 createApp

```js
const { createApp } = Vue
const app = createApp({})
app.component(...)
app.use(...)
app.mount('#app1')

const app2 = createApp({})
app2.mount('#app2')
```

createApp移除了很多常见写法，如在createApp中，就不支持filter、$on、$off、$set、$delete等API。当然都能实现类似功能。

Vue 3的v-model 用法也改了。讲到组件化需深度使用v-model时细讲。

Vue 3 还有很多小细节的更新，如slot和slot-scope两者实现合并，而directive注册指令的API等也有变化。

## 5 Vue3生态现状

Vue生态现所有官方库工具都全面支持Vue3，但仍有生态库处候选或刚发布状态。 所以，升级Vue3过程，除了Vue3本身语法变化，生态也要注意选择。有些周边生态库可能还存在不稳定情况，时刻关注GitHub。

Vue-cli4已提供内置选项，当然可选择它支持的 Vue 2。如你对 Vite 不放心，Vue-cli4 也全面支持 Vue 3。

vue-router是复杂项目必不可少的路由库，包含写法变化，如从 new Router变 createRouter；全面拥抱 Composition API 风格，提供方法：

- useRouter
- useRoute

Vuex 4.0 也支持 Vue3。Vue 官方成员还发布 Pinia，Pinia API 接近 Vuex5 设计，且对 Composition API 特别友好，更优雅。

其他生态如 Nuxt、组件库Ant-design-vue、Element都有 Vue3 版。

## 6 使用自动化升级工具进行Vue的升级

Vue 2 升级到 Vue 3 后，对语法的改变之处，挨个替换写法即可。 **但对于复杂项目，我们需要借助几个自动化工具来帮我们过渡。**

Vue 3项目有个 @vue/compat 库，这是一个 Vue 3 的构建版本，提供兼容 Vue 2 的行为。这版本默认运行在 Vue 2 下，它的大部分 API 和 Vue 2 保持一致。当使用那些在 Vue 3 发生变化或废弃的特性时，这版本会警告，从而避免兼容性问题，帮你很好迁移项目。通过升级的提示信息，@vue/compat还很好帮助你学习版本差异。



先把项目依赖的 Vue 版本换成3并引入@vue/compat 。

```diff
"dependencies": {
-  "vue": "^2.6.12",
+  "vue": "^3.2.19",
+  "@vue/compat": "^3.2.19"
   ...
},
"devDependencies": {
-  "vue-template-compiler": "^2.6.12"
+  "@vue/compiler-sfc": "^3.2.19"
}

```

给 vue 设置别名@vue/compat，也就是以 compat 作为入口，代码如下：

```js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.resolve.alias.set('vue', '@vue/compat')
    ......
  }
}
```

这时就会在控制台看到很多警告及优化建议。

在 @vue/compat 提供很多建议后，自己还要慢慢修改。但另一个角度看，“偷懒”是优秀程序员的标志，社区就有能够做自动化替换的工具，好用的就是“阿里妈妈”的 gogocode， [官方文档](https://gogocode.io/zh/docs/vue/vue2-to-vue3) 。

### 自动化替换工具的原理

和 Vue 的 Compiler 优化的原理一样，利用编译原理做代码替换。

如下图利用 babel 分析左边 Vue 2 的源码，解析成 AST，然后根据Vue 3 的写法对 AST 进行转换，最后生成新的 Vue 3 代码：

![image-20230906223444275](https://p.ipic.vip/sv36o7.png)

对替换过程的中间编译成的 AST，可理解为用 JavaScript 的对象去描述这段代码，这和虚拟 DOM 的理念有一些相似，我们基于这个对象去做优化，最终映射生成新的Vue 3代码。

## 7 总结

何时该升级 Vue 3，什么时候该继续使用 Vue 2的兼容版本。

现在，Vue 3官方生态整体稳定，新项目完全可直接Vue 3。那些需长期维护的项目，也很有必要升级。Vue 2很快停止更新，如项目需兼容 IE11，就继续用 Vue 2.7。这样保持好项目兼容性前提下，还可体验到 Composition API 便利。

升级Vue过程中，可利用官方和社区工具，帮助高效升级。可使用compat给出提醒，项目中设置@vue/compat作为 vue 的别名，这样内部就会把所有和 Vue 2 的语法相关的升级信息提示出来，逐个替换即可或直接使用 gogocode 进行自动化批量替换。

全面拥抱 Vue 3 也是离开舒适圈的挑战，带来不只新框架体验，也可能更好潜力与待遇。