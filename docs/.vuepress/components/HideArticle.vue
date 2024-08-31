<template>
    <div>
  
    </div>
  </template>
  
  <script>
  
    export default {
      name: 'HideArticle',
      data() {
        return {
  
        }
      },
  
      mounted() {
  
       import('../../public/js/btwplugin')  // 引入那段代码脚本,直接把那段代码写到这里不行?还真不行,依旧会报btw is not defined
       // 或者使用require('../../public/js/btwplugin');当然最好是在上面定义,monted里面调用
  
      }
    }
  </script>
  
  <style lang="scss" scoped>
  
  </style>  