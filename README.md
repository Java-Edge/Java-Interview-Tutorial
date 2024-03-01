# 编程严选网

## 0 本地启动项目
1. 检查node是否有安装
2. 下载资源包：npm install
3. 启动服务： npm run dev

https://www.bilibili.com/video/BV1vb411m7NY

视频前两节即可学会本地启动 Vuepress项目，还可学到其他相关配置。

## 1 图片调整路径
docs/.vuepress/public/images
不建议存储源文件，请直接使用 oos 图床存储图片。

## 2 提交文章
1. 新增 md 文件
在 md 目录新建 concurrency 目录，新建00-Java并发编程.md文件，将文章内容放进去
2. 修改 config.js，配置专栏和下面文章路径
```js
{
    text: '并发编程',
    items: [
        {text: '00-Java并发编程', link: '/md/concurrency/00-Java并发编程.md'},
    ]
},
```
3. 修改 config.js，配置专栏侧边导航栏
如
```js
"/md/concurrency/": [
    {
        title: "并发编程",
        collapsable: false,
        sidebarDepth: 0,
        children: [
            "00-Java并发编程.md"
        ]
    }
],
```
4. 本地调试，浏览器前端能正常看到文章，即可提交代码

## 3 Git GUI 工具
建议下载 Github Desktop，可视化提交文章相关数据。
