# Vue.js 与 Axios 实战：从发送 AJAX 请求到 API 代理配置全攻略

## 0 前言

Axios，流行的 js 库，用于发送 AJAX 请求。本文介绍Vue中咋用 Axios 发 AJAX 请求。

## 1 安装

先在项目中安装 Axios。进入项目目录运行：

```bash
cnpm install axios@0.17.1 --save
```

## 2 发送 AJAX 请求

在 Vue 组件中用它发 AJAX 请求。

### 示例

```vue
<template>
  <div>
    <button @click="getData">获取数据</button>
    <div v-if="data">{{ data }}</div>
  </div>
</template>

<script>
// 先导 Axios 库
import axios from 'axios';

export default {
  data() {
    return {
      // 在组件的data()方法定义一个data属性，存储从服务器获取的数据
      data: null,
    };
  },
  methods: {
    //  定义该方法，用于发送 AJAX 请求并更新组件的data属性
    getData() {
      axios
        .get('/api/data')
        .then((response) => {
          this.data = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>
```

在 `getData` 方法中，用 `axios.get` 方法发送 GET 请求。该方法接受一个 URL 参数，用于指定要请求的服务器端点。本例用 `/api/data` 作为 URL。

再用 Promise 的 `then` 方法处理响应，如果：

- 请求成功，`then` 将接收一个响应对象，并将响应数据存储到组件的 `data` 属性中
- 请求失败，则用 Promise 的 `catch` 方法处理错误

最后，在组件模板中，用一个按钮触发 `getData` 方法，并根据是否有数据来显示数据。

## 3 项目实战

组件很多，若每个组件都发 HTTP 请求，性能太差。咋优化？希望整个首页只发送一个 ajax 请求。显然，在 Home.vue 里发送最好不过。 

组件有个生命周期函数 mounted：

```js
methods: {
  getHomeInfo () {
    // 本地 mock 数据
    // axios.get('/api/index.json?city=' + this.city)
    axios.get('/static/mock/index.json')
      .then(this.getHomeInfoSuccess)
  },
  getHomeInfoSuccess (res) {
  }
},
mounted () {
  this.getHomeInfo()
}
```

有人觉得，本地mock 执行

```js
axios.get('/static/mock/index.json')
        .then(this.getHomeInfoSuccess)
```

上线前，再改成

```js
axios.get('/api/index.json?city=' + this.city)
```

真麻烦，万一忘了，很烦。还好 Vue 帮解决这问题。修改脚手架文件：index.js

![](https://img-blog.csdnimg.cn/71c97ccf0cdb41af97c6ad7a924eb25e.png)

```js
'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')

module.exports = {
  dev: {

    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    /**
     * webpack-dev-server 提供的功能
     * 
     * /api开头的请求代理到http://localhost:8080/static/mock
     * proxyTable是一个对象，用于配置代理规则
     * '/api'是代理规则的路径，表示所有以/api开头的请求都会被代理
     * target是代理的目标地址，即将请求转发到的地址
     * pathRewrite是路径重写规则，用于将请求路径中的'/api'替换成'/static/mock'
     */
    proxyTable: {
      '/api': {
        target: 'http://localhost:8080',
        pathRewrite: {
          '^/api': '/static/mock'
        }
      }
    },
```

改变了配置项，所以需要重启服务：

可见，请求成功，拿到数据了：

![](https://p.ipic.vip/z9gh9v.png)

## 4 总结

功能强大的 js 库，可发送 AJAX 请求。在 Vue 中使用 Axios 可轻松与服务器进行通信，并从服务器获取数据。