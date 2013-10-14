## 综述

WKeditor是一款非常简洁且新颖的富文本编辑器，目前在玩客项目中使用。

* 版本：1.0
* 作者：changyuan.lcy
* demo：[http://gallery.kissyui.com/WKeditor/1.0/demo/index.html](http://gallery.kissyui.com/WKeditor/1.0/demo/index.html)

## 初始化组件

    S.use('WKeditor/1.0/index,', function (S, WKeditor) {
        var comConfig = {
            message:'<div class="message">输入提示</div>',
            font:[
                "hugeFont","largeFont","normalFont","strongFont","listText"
            ],
            ele:S.one("#WKeditor")
        }
        var Editor = new WKeditor(comConfig);
    });

## API说明
* @message {String} 输入提示
* @font {Array} 文本操作按钮，默认提供以上列出的5种。
* @ele {node} 渲染的节点

## 插件调用
* @param {object} 会根据name 和 text 生成一个button 按钮
* @param {function} 按钮点击触发所执行的函数

## 调用规范

    Editor.plug(object function);


##  使用插件【图片上传】

    Editor.plug({
        name:"image",
        text:"插入图片"
    },function(){
        var self = this;
        KISSY.use("WKimage,WKimage.css",function(S,WKimage){
            var config = {
                action:"upload.php",
                allowExts:"jpg,gif,png,jpeg"
                //dragSort:true
            };
            self.WKimage = new WKimage(self.options);
            self.WKimage.init(config);
        });
    });


##  使用插件【视频插入】


    Editor.plug({
        name:"video",
        text:"插入视频"
    },function(){
        var self = this;
        KISSY.use("WKvideo,WKvideo.css",function(S,WKvideo){
            var config = {
                setUrl:function(url){
                    /*
                        你可以通过这个方法设置正确的链接。
                    */
                    return url;
                }
            };
            self.WKvideo = new WKvideo(self.options);
            self.WKvideo.init(config);
        });
    });

## 配置过滤器

    Editor.reg.fliterReg = "IMG|P|SPAN|FONT|A|UL|LI|DIV|H1|H2|H3|H4|H5|H6|BR|EMBED|EM|VIDEO|B|STRONG|U|LABEL|BIG|S|I|OL|DL|DD|DT|SUB|SUP" 

* 设置编辑器正文允许的标签格式
* 不在配置里面的标签将会自动过滤删除


## 接口
* 你可以通过consoloe 打印 Editor 实例或插件 WKimage , WKvideo 浏览其类结构

## 外观皮肤【style】
* # WKeditor 父节点
* .WKeditor_wrap 正文
* .WKeditor_message 提示文字样式
* .WKeditor_image_plate 插入图片功能板
* .WKeditor_font_plate 文本格式按钮功能板
* .WKeditor_video_plate 插入视频功能板