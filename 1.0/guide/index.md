## 综述

WKeditor是一款非常简洁且新颖的富文本编辑器，目前在玩客项目中使用。

* 版本：1.0
* 作者：changyuan.lcy
* demo：[http://gallery.kissyui.com/WKeditor/1.0/demo/index.html](http://gallery.kissyui.com/WKeditor/1.0/demo/index.html)

## 初始化组件

    S.use('gallery/WKeditor/1.0/index', function (S, WKeditor) {
         var comConfig = {
                message:'<div class="message"><h3>请输入正文</h3><p>小提示：<br>\
                            1. 鼠标选中已输入文字可修改文字样式。<br>\
                            2. 支持粘帖截图。<br>\
                            3. 移动到未居中的图片上出现居中按钮。<br></div>',
                font:[
                    "hugeFont","largeFont","normalFont","strongFont","listText"//,"italicText"
                ],
                ele:S.one("#WKeditor")
          };
          var Editor = new WKeditor(comConfig);
    })

## API说明
* @message {String} 输入提示
* @font {Array} 文本操作按钮，默认提供以上列出的5种。
* @ele {node} 渲染的节点