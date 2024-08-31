window.onload = function() {
    themeDefaultContent = $(
      '#app > .theme-container>.page > .theme-default-content'
    );
  
    themeDefaultContent.attr('id', 'container');
    btw = new BTWPlugin(); // 注意btw需要是个全局变量,把const去掉
    btw.init({
        id: 'container',
        blogId: '31809-1711934972129-598',
        name: 'JavaEdge',
        qrcode: 'https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/qrcode_for_gh_ab5f6d46c1ff_258.jpg',
        keyword: '编程严选网',
    });
  };