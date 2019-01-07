# 1 安装
## 1.1  兼容性
Vue **不支持** IE8 及以下版本，因为 Vue 使用了 IE8 无法模拟的 ECMAScript 5 特性
但它支持所有[兼容 ECMAScript 5 的浏览器](https://caniuse.com/#feat=es5)

## 1.2 更新日志
最新稳定版本：2.5.17
## 1.3 Vue Devtools
在使用 Vue 时，推荐在浏览器安装 [Vue Devtools](https://github.com/vuejs/vue-devtools#vue-devtools)。它允许你在一个更友好的界面中审查和调试 Vue 应用。
![](https://upload-images.jianshu.io/upload_images/4685968-0c30470350606f20.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 1.4 直接用 `<script>` 引入
直接下载并用 `<script>` 标签引入，`Vue` 会被注册为一个全局变量

在开发环境下不要使用压缩版本，不然你就失去了所有常见错误相关的警告!
- [开发版本](https://vuejs.org/js/vue.js)
包含完整的警告和调试模式
- [生产版本](https://vuejs.org/js/vue.min.js)
删除了警告，30.90KB min+gzip
## 1.5 [CDN](https://cn.vuejs.org/v2/guide/installation.html#CDN "CDN")
我们推荐链接到一个你可以手动更新的指定版本号：
```
<script src="https://cdn.jsdelivr.net/npm/vue@2.5.17/dist/vue.js"></script>
```
Vue 也可以在 [unpkg](https://unpkg.com/vue@2.5.17/dist/vue.js) 和 [cdnjs](https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.17/vue.js) 上获取 (cdnjs 的版本更新可能略滞后)。

请确认了解[不同构建版本](https://cn.vuejs.org/v2/guide/installation.html#%E5%AF%B9%E4%B8%8D%E5%90%8C%E6%9E%84%E5%BB%BA%E7%89%88%E6%9C%AC%E7%9A%84%E8%A7%A3%E9%87%8A)并在你发布的站点中使用**生产环境版本**，把 `vue.js` 换成 `vue.min.js`。这是一个更小的构建，可以带来比开发环境下更快的速度体验。
## 1.6 NPM
在用 Vue 构建大型应用时推荐使用 NPM 安装
NPM 能很好地和诸如 [webpack](https://webpack.js.org/) 或 [Browserify](http://browserify.org/) 模块打包器配合使用。同时 Vue 也提供配套工具来开发[单文件组件](https://cn.vuejs.org/v2/guide/single-file-components.html)。
```
# 最新稳定版
$ npm install vue
```
## 1.7 命令行工具 (CLI)
Vue 提供了一个[官方的 CLI](https://github.com/vuejs/vue-cli)，为单页面应用 (SPA) 快速搭建繁杂的脚手架。它为现代前端工作流提供了 batteries-included 的构建设置。只需要几分钟的时间就可以运行起来并带有热重载、保存时 lint 校验，以及生产环境可用的构建版本。更多详情可查阅 [Vue CLI 的文档](https://cli.vuejs.org/)。

>CLI 工具假定用户对 Node.js 和相关构建工具有一定程度的了解。如果你是新手，我们强烈建议先在不用构建工具的情况下通读[指南](https://cn.vuejs.org/v2/guide/)，在熟悉 Vue 本身之后再使用 CLI。

