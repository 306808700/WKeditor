## 综述

WKeditor是一款非常简洁且新颖的富文本编辑器，目前在玩客项目中使用。

* 版本：1.1
* 作者：changyuan.lcy
* demo：[http://gallery.kissyui.com/WKeditor/1.0/demo/index.html](http://gallery.kissyui.com/WKeditor/1.0/demo/index.html)

## 初始化组件

    S.use('WKeditor/1.0/index,', function (S, WKeditor) {
        var opt = {
            ele: S.one("#WKeditor"), // 容器
            message: '<div class="message">输入提示</div>',
            font: ["hugeFont", "largeFont", "normalFont", "strongFont", "listText"]
        };
        var Editor = new WKeditor(opt);
    });

* @ele {node} 渲染的节点
* @message {String} 输入提示
* @font {Array} 文本操作按钮，默认提供以上列出的5种。

## 基本功能
* 五种文字格式排版，当然还可以根据需求自由添加多个。
* 支持粘帖图片，以及QQ截图的粘帖，不过需要高级浏览器。
* 粘帖内容过滤。
* 提供视频、图片、模版 三种插入板功能，当然同样的可根据使用场景自由添加或减少。
* 详见自定义扩展

## 配置过滤器
    
    // 默认配置
    Editor.reg.fliterReg = "IMG|P|SPAN|FONT|A|UL|LI|DIV|H1|H2|H3|H4|H5|H6|BR|EMBED|EM|VIDEO|B|STRONG|U|LABEL|BIG|S|I|OL|DL|DD|DT|SUB|SUP" 

* 设置编辑器正文允许的标签格式
* 当你粘帖web word text 或者其他软件的文本进编辑器时候。
* 不在配置里面的标签将会自动过滤删除


## 自定义扩展 
    
    // 文本格式扩展
    Editor.addFont(object function);

    // 插入板扩展
    Editor.plug(object function);

* @param {object} 会根据name、title、value 生成一个button 按钮
* @param {function} 按钮点击触发所执行的函数


## 自定义文本格式 实例
    
    // @设置红色
    // 你可以通过.ForeColor 设置样式
    Editor.addFont({name:"ForeColor",title:"文本颜色",value:"红"},function(e){
          document.execCommand('ForeColor',false,'red');
    });

*你可以自定义多个文本格式命令，以符合自身项目需求。

## 自定义插件 实例
    
    // 你可以通过.my 去设置按钮样式
    Editor.plug({name:"my",title:"插入模版",value:"模"},function(){
        // console.log(Editor);
    });

*你可以自定义多个插件，以符合自身项目需求。

##  官方插件【图片上传】

    Editor.plug({name:"image",text:"插入图片"},function(){
        var self = this;
        KISSY.use("WKimage,WKimage.css",function(S,WKimage){
            var config = {
                action:"upload.php",
                allowExts:"jpg,gif,png,jpeg",
                //multiple:true,
            };
            self.WKimage = new WKimage(self.options);
            self.WKimage.init(config);
        });
    });

* action 后端接口地址
* allowExts 允许的格式
* multiple 默认多选


##  官方插件【视频插入】


    Editor.plug({name:"video",text:"插入视频"},function(){
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

* setUrl 通过这个函数可以与后端通讯得到正确的地址返回， 注：需要同步执行。


## 接口

* 获取光标位置 Editor.tool.getRange();
* 光标位置插入 Editor.tool.insert(dom,range); // range 参数可以为空表示当前焦点位置;
* 更多接口可以console.log(Editor)  查看

## 外观皮肤【style】
*  id#WKeditor 父节点
* .WKeditor_wrap 正文
* .WKeditor_message 提示文字样式
* .WKeditor_image_plate 插入图片功能板
* .WKeditor_font_plate 文本格式按钮功能板
* .WKeditor_video_plate 插入视频功能板


## 更多功能需求，请在github 提问，或者直接旺旺【核心】。