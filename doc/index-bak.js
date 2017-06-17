/**
 * @fileoverview 
 * @author changyuan.lcy/核心 <changyuan.lcy@alibaba-inc.com>
 * @module WKeditor
 **/
KISSY.add(function (S, Node,Base,XTemplate) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * 
     * @class WKeditor
     * @constructor
     * @extends Base
     */
    function WKeditor(comConfig) {

        var self = this;
        //调用父类构造函数
        WKeditor.superclass.constructor.call(self, comConfig);
        this.ele = this.get("ele");
        this.init();
    }
    WKeditor.prototype.init = function(){
        this.view();
        this.event();
        if(this.get("plugin")){
            this.plugin(this.get("plugin"));
        }
        if(this.get("font")){
            this.font(this.get("font"));
        }
    };
    WKeditor.prototype.tpl = {
        wrap:$("<div class='WKeditor_wrap'></div>"),
        plugin:[
            {name:"product",label:"插入产品"},
            {name:"video",label:"插入视频"},
            {name:"image",label:"插入图片"}
        ]
    };
    WKeditor.prototype.view = function(){
        var self = this;
        
        this.view.init = function(){
            self.$wrap = $(self.tpl.wrap);
            self.$wrap.attr("contenteditable",true);
            self.$wrap.html(self.get("message"));
            self.plugin();
            self.ele.append(self.$wrap);
        };
        this.view.init();

    };
    WKeditor.prototype.plugin = function(config){
        var self = this;
        this.plugin.tpl = {
            plugin:{
                product:"插入产品",
                video:"插入视频",
                image:"插入图片"
            },
            wrap:"<div class='WKeditor_plugin'></div>",
            btn:"<div class='box'>[data]<button class='{name}' title='{text}'></button>[/data]</div>"
        };
        this.plugin.init = function(){
            self.plugin.view();
            self.plugin.event();
        };
        this.plugin.view = function(){
            self.$plugin = $(self.plugin.tpl.wrap),
                arr = [],
                temp = "",
                i = 0;

            for(var name in config){
                arr[i] = {
                    name:name,
                    text:self.plugin.tpl.plugin[name]
                };
                i++;
            }
            temp = self.tool.template(self.plugin.tpl.btn,{data:arr});
            self.$plugin.append(temp);

            self.ele.append(self.$plugin);
            self.$plugin.height(self.$plugin.all("button").length*37);
        };

        this.plugin.event = function(){
            self.$plugin.delegate("button","click",function(e){
            
                var name = $(this).attr("class");
                self[name]();
                return false;
            });
        };
        this.plugin.init();
    };
    WKeditor.prototype.event = function(){
        var self = this;

        self.$wrap
            .on("click",function(){
                if(self.tool.removeHTML(self.$wrap.html())==self.tool.removeHTML(self.get("message"))){
                    $(this).html("");
                }
                $(this).fire("focus");
            })

            .on("blur",function(){
                if($(this).html().replace("<span></span>","").replace("<br>","") == ''){
                    $(this).html(self.get("message"));
                }   
            })

            .on("mousedown",function(e){
                self.set("mousedown",true);
                self.set("mouseOD",{
                    left:e.clientX,
                    top:e.clientY+$(window).scrollTop()
                });
                self.$font.hide();
                if(self.get("range")){
                    self.tool.setCart(self.$wrap[0],self.get("range"));
                }
            })

            .on("mouseup",function(e){
                self.set("mouseOU",{
                    left:e.clientX,
                    top:e.clientY+$(window).scrollTop()
                });
                self.set("mousedown",false);

                var range = self.tool.getRange();
                var l =  self.get("mouseOD").left-(self.get("mouseOD").left-self.get("mouseOU").left)/2-self.$font.width()/2;
                var t =  self.get("mouseOD").top-(self.get("mouseOD").top-self.get("mouseOU").top)/2-self.$font.height()-20;
        

                //console.log(l,t);

                if((l+self.$font.width()/2)<self.ele.offset().left){
                    l = self.ele.offset().left-self.$font.width()/2;
                }
                if((l+self.$font.width()/2)>self.ele.offset().left+self.ele.width()){
                    l = self.ele.offset().left+self.ele.width()-self.$font.width()/2;
                }
                if(t<self.ele.offset().top){
                    t = self.ele.offset().top-self.$font.height()-10;
                }
                if(t>(self.ele.offset().top+self.ele.height())){
                    t = self.ele.offset().top+self.ele.height()-self.$font.height()-10;
                }
                setTimeout(function(){
                    try{
                        if(range.selectText){
                            self.set("range",range);
                            self.$font.show();
                            self.$font.css({
                                left:l,
                                top:t
                            });
                        }
                    }catch(e){

                    }
                },1);
            })

            .on("mousemove",function(e){
                var element = e.target;
                switch(element.tagName.toLowerCase()){
                    case "img":
                        self.event.showImgOp(element);
                    break;
                    default:
                        self.event.hideImgOp();
                    break;
                }
            })

            .on("keydown",function(e){
                if(e.keyCode == 13){
                    
                    setTimeout(function(){
                        S.each(self.$wrap.all("p"),function(dom){
                            if($(dom).all("img").length == 0 && $(dom).all("embed").length==0 && $(dom).all("video").length==0){
                                 $(dom).removeAttr("class").removeAttr("style");
                            } 
                        });
                        self.tool.formatBlock(self);
                    },10);
                }
            })[0]
            .onpaste = function(e){
                self.event.shotImg(e);
            };
        $(document)
            .on("mouseup",function(e){

            if(self.get("mousedown")){
                self.$wrap.fire("mouseup",e);
                self.set("mouseOU",{
                    left:e.clientX,
                    top:e.clientY+$(window).scrollTop()
                });
            }else if(S.inArray(e.target,self.$font.all("button"))){
            }else{
                self.$font.hide();
            }
            return false;
        });

        self.event.shotImg = function(e){
            var clipboardData = e.clipboardData;
            if(clipboardData&&clipboardData.items){
                items = clipboardData.items;
                var item = items[0];
                if (item.kind == 'file' && item.type == 'image/png') {  
                    var fileReader = new FileReader();  
                      
                    fileReader.onloadend = function (d) {  
                        var d = this.result.substr( this.result.indexOf(',')+1);
                        var img =  document.createElement("img");
                        img.src = 'data:image/jpeg;base64,'+d;
                        //area.append(img);
                        self.tool.insert(img,self.tool.getRange());
                        return;
                    };
                    fileReader.readAsDataURL(item.getAsFile());
                } 
            }
        }
        self.event.showImgOp = function(el){
            var $area = self.ele;
            var img = $(el);
            void function removeBtn(){
                var button = $area.all(".removeImage");
                if($area.all(".removeImage").length==0){
                    button = $("<button class='removeImage'></button>");
                    $area.append(button);
                }
                button.css({
                    left:img.offset().left+img.width()-33,
                    top:img.offset().top,
                    position:"absolute",
                    display:"block"
                });
                button.on("click",function(){
                    if(img.attr("loadingid")){
                        var loadingimg = $("#editorMain").all("img[loadingid="+img.attr("loadingid")+"]");
                        if(loadingimg.length>0){
                            loadingimg.remove();
                        }
                    }
                    img.remove();
                    button.hide();
                    return false;
                });
            }();
            function centerBtn(){
                var button = $area.all(".centerImage");
                if($area.all(".centerImage").length==0){
                    button = $("<button class='centerImage'>居中</button>");
                    $area.append(button);
                }
                button.css({
                    left:img.offset().left+img.width()-33-46,
                    top:img.offset().top,
                    position:"absolute",
                    display:"block"
                });
                button.detach("click").on("click",function(){
                    var p = $("<p style='text-align:center'></p>");
                    img.before(p);
                    p.append(img);
                    self.event.hideImgOp();
                    
                    return false;
                });
            }
            if(img.parent().css("text-align")!="center"){
                centerBtn();
            }
        }
        self.event.hideImgOp = function(){
            var $area = self.ele;
            
            void function removeBtn(){
                var button = $area.all(".removeImage");
                if(button){
                    button.hide();
                }
            }();
            void function centerBtn(){
                var button = $area.all(".centerImage");
                if(button){
                    button.hide();
                }
            }();
        }
    };
    WKeditor.prototype.reg = {
        hrefReg:/http:\/\/[a-zA-Z\d.]*wanke.etao.com[\/a-zA-Z\d?=.&+%]*/g,
        cdnReg:/taobaocdn[.a-z]*\/tfscom/,
        fliterReg:"IMG|P|SPAN|FONT|A|UL|LI|DIV|H1|H2|H3|H4|H5|H6|BR|EMBED|EM|VIDEO|B|STRONG|U|LABEL|BIG|S|I|OL|DL|DD|DT|SUB|SUP"
    };
    WKeditor.prototype.language = {
        video:'请粘贴视频地址',
        video2:'支持淘宝、优酷、土豆、酷6、搜狐网站视频链接',
        product:'请输入你想分享的东西名称',
        save:"正在保存...",
        saveSuc:"保存成功"
    };
    WKeditor.prototype.command = {
        /**
         * 设置字体加粗
         */
        setFontBold:function(){
           document.execCommand("Bold",false,true);
        },
        /**
         * 设置内容斜体
         */
        setContentItalic:function(){
            document.execCommand("Italic",false,true);
        },
        /**
         * 设置内容下划线
         */
        setContentUnderline:function(){
            document.execCommand('Underline',false,true);
        },
        /**
         * 设置文字大小
         * @param  {[type]} size [description]
         */
        setFontSize:function(size){
            document.execCommand('FontSize',false,size);
            if(size=="2"){
                document.execCommand("RemoveFormat");
            }
        },
        /**
         * 插入无序列表
         */
        insertUnorderedList:function(){
            document.execCommand('InsertUnorderedList',false,null);
        }
    }

    WKeditor.prototype.image = function(config){
        var self = this;
        this.image.init = function(){
            self.image.view();
            self.image.event();
        };
        this.image.tpl = {
            wrap:'<div class="WKeditor_image_plate" id="WKeditor_image_plate">\
                <div class="uploadBox">\
                    <p class="canDragMsg">（拖拽图片可修改顺序）</p>\
                    <ul id="J_UploaderQueue" class="grid"></ul>\
                    <div class="box">\
                        <p class="top">可拖动多张本地图片到这里上传<br/>或</p>\
                        <div class="up_btn"><a href="javascript:void(0)" class="btn-uploader wk-btn btn-bg-blue btn-large"><span class="btn-text">选择文件</span><div class="file-input-wrapper" style="overflow: hidden;"><input type="file" name="Filedata" hidefocus="true" class="file-input" style="" multiple="multiple"></div></a>\
                        <a class="btn-confirm wk-btn btn-bg-blue btn-large">确认插入</a></div>\
                        <p class="text">Jpg，Gif，PNG,单张最大6M</br>图片尺寸超过480*270像素可以在首页展示缩略图</p>\
                    </div>\
                </div><div class="close">×</div>\
            </div>'
        };

        this.image.view = function(){
            self.$image = $(self.image.tpl.wrap);
            self.ele.append(self.$image);
            self.$image.width(self.ele.width()).show();
            self.$image.css({
                zIndex:100,
                left:($(window).width()-self.$image.width())/2,
                top:($(window).height()-self.$image.height())/2
            });
            $.plugin("Dmimi.overlay",{
                ele:self.$image
            },function(obj){
                self.$overlay = obj.$overlay;
            });
            self.image.view.preview = function(i){

                    var template = $('<li class="queue-file"><div class="imageBox">'+
                        '<div class="pic"><img loadid="'+i+'"/></div>'+
                        '<div class="operate"><span title="左旋" class="rotatel"></span>'+
                        '<span title="右旋" class="rotate"></span>'+
                        '<span title="删除" class="del-pic"></span></div></div></li>');
                    template.on("mouseenter",function(){
                        template.all(".operate").show();
                    }).on("mouseleave",function(){
                        template.all(".operate").hide();
                    });
                    template.all(".del-pic").on("click",function(){
                        var self = this;
                        Wanke.T.confirmDelete(function(){
                            $(self).parent().parent().parent().remove();
                            _class.tool.realign($("#J_UploaderQueue"),"ani");
                            if($("#J_UploaderQueue").children().length==0){
                                uploadRest();
                            }
                        },"确定要删除这张图吗？");
                    });
                    //_class.tool.rotate(template.one(".rotatel"),"left");
                    //_class.tool.rotate(template.one(".rotate"));
                    return template;
            }
        };

        this.image.event = function(){
            $.plugin("Dmimi.uploader",{
                input:$(".btn-uploader").get(),
                btn:$(".btn-confirm").get(),
                select:function(files){

                    files = files[0];

                    for(var i=0;i<files.length;i++){
                        var img = document.createElement("img");
                        img.file = files[i];
                        img.t = +new Date();
                        var reader = new FileReader();  
                        reader.onload = (function(aImg) { 
                            return function(e) {
                                //aImg.src = e.target.result;
                                $("#J_UploaderQueue").all("img[loadid="+aImg.t+"]").attr("src",e.target.result);
                            }; 
                        })(img);
                        reader.readAsDataURL(files[i]);
                        $("#J_UploaderQueue").append(self.image.view.preview(img.t));
                    }
                    $.plugin("Dmimi.realign",{ele:$("#J_UploaderQueue")});
                    self.event.drag();
                }

            });
            
            self.$image.all(".close").on("click",function(){
                self.$image.remove();
                self.$overlay.remove();
            });
            self.event.drag = function(){
                $("#J_UploaderQueue").all(".queue-file").drag(
                    function(e){
                        // down
                        this.x = e.clientX - parseInt($(this).css("left"));
                        this.y = e.clientY - parseInt($(this).css("top"));
                        $(this).css({
                            "opacity":1,
                            zIndex:89
                        });
                        self.event.dragDown = true;
                        $("#J_UploaderQueue").all(".queue-space").on("mouseenter",function(){
                            if(self.event.dragDown){
                                $(this).css({
                                    opacity:1
                                }).animate({
                                    width:parseInt($(this).attr("space"))-6
                                },100);
                                self.event.space = $(this);
                            }
                        }).on("mouseleave",function(){
                            $(this).css({
                                opacity:0
                            });
                            self.event.space = null;
                        });
                    },
                    function(e){
                        // move
                        var left = e.clientX-this.x;
                        var top =  e.clientY-this.y;
                        $(this).css({
                            left:left,
                            top:top
                        });
                    },
                    function(){
                        // press
                        if(self.event.space){
                            self.event.space.before($(this));
                            $(this).animate({
                                width:100,
                                height:100
                            });
                            $.plugin("Dmimi.realign",{ele:$("#J_UploaderQueue"),ani:true});
                            self.event.space = null;
                        }else{
                            $(this).animate({
                                left:$(this).attr('dleft'),
                                top:$(this).attr('dtop'),
                                width:100,
                                height:100
                            });
                        }
                        $(this).css({
                            "opacity":1,
                            zIndex:88
                        })
                        self.event.dragDown = false;
                    }
                );
            }
        };
        this.image.init();
    };
    /*
        @param {array} 配置font组件 ["hugeFont","largeFont","normalFont","strongFont"]
    */
    WKeditor.prototype.font = function(config){
        var self = this;
        this.font.init = function(){
            self.font.reset();
            self.font.view();
            self.font.event();
        };
        this.font.tpl = {
            font:{
                hugeFont:{
                    text:"超大字体",
                    size:"6",
                    command:"setFontSize"
                },
                largeFont:{
                    text:"大字体",
                    size:"4",
                    command:"setFontSize"
                },
                normalFont:{
                    text:"正常字体",
                    size:"2",
                    command:"setFontSize"
                },
                strongFont:{
                    text:"文字加粗",
                    command:"setFontBold"
                },
                listText:{
                    text:"列表",
                    command:"insertUnorderedList"
                },
                italicText:{
                    text:"斜体",
                    command:"setContentItalic"
                }
            },
            wrap:"<div class='WKeditor_font_plate'></div>",
            btn:"<div class='box'>{{#each data}}<button command='{{command}}' {{#if size}} size='{{size}}' {{/if}}  class='{{name}} command' title='{{text}}'></button>{{/each}}</div>",
            arrow: "<div class='arrow'></div>"
        };

        this.font.view = function(){
            self.$font = $(self.font.tpl.wrap),
                arr = [],
                temp = "";

            for(var i=0,len=config.length;i<len;i++){
                arr[i] = {
                    name:config[i],
                    command:self.font.tpl.font[config[i]].command,
                    size:self.font.tpl.font[config[i]].size,
                    text:self.font.tpl.font[config[i]].text
                };
            }
            temp = new XTemplate(self.font.tpl.btn).render({data:arr})
            self.$font.append(temp);
            self.$font.append(self.font.tpl.arrow);
            self.$font.width(self.$font.all("button").length*32);

            self.ele.append(self.$font);
        };

        this.font.event = function(){
            self.$font.all("button").on("click",function(e){
                var command = $(this).attr("command");
                if(command=="setFontSize"){
                    self.command[command]($(this).attr("size"));
                }else{
                    self.command[command]();
                }
                return false;
            });
        };
        this.font.reset = function(){
            self.ele.all(".WKeditor_font_plate").remove();
        };
        this.font.init();
    };
    WKeditor.prototype.tool = {
        browser:function(){
            var userAgent = window.navigator.userAgent.toLowerCase(); 
            var object = { 
                version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1], 
                safari: /webkit/.test( userAgent ) && !(/chrome/i.test(userAgent) && /webkit/i.test(userAgent) && /mozilla/i.test(userAgent)), 
                opera: /opera/.test( userAgent ), 
                msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ), 
                mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent )&& !(/chrome/i.test(userAgent) && /webkit/i.test(userAgent) && /mozilla/i.test(userAgent)),
                chrome: /chrome/i.test(userAgent) && /webkit/i.test(userAgent) && /mozilla/i.test(userAgent)
            };
            return object;
        },
        formatBlock:function(self){
            document.execCommand('FormatBlock',false,'p');
            document.execCommand("RemoveFormat");
        },
        /**
         * 移除HTML代码
         * @param  {[type]} str 字符串
         */
        removeHTML:function(str) {
            str = str.toLowerCase();
            str = str.replace(/<\/?[^>]*>/g,''); //去除HTML tag
            str = str.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
            str = str.replace(/[\r\n\s"]/ig,"");
            return str;
        },
        getSelection:function(){
            return window.getSelection ? window.getSelection() : document.selection;
        },
        getRange:function(){
            try{
                var range = this.getSelection().createRange ? this.getSelection().createRange() : this.getSelection().getRangeAt(0);
              
                range.selectText = range.text ? range.text : range.toString();
                return range;
            }catch(e){}
        },
        //设置光标位置
        setCart:function(dom,range) {
            if(document.selection&&parseInt(this.browser().version)<9){
                range.collapse(false);
                range.select();
            }else{
                range.setStartAfter(dom);
                range.collapse(true);
                this.getSelection().removeAllRanges();
                this.getSelection().addRange(range);
            }
        },
        //插入到光标位置
        insert:function(dom,range){
            var selection = this.getSelection(),
                browser = this.browser();
            if (!window.getSelection || (browser.msie && parseInt(browser.version)<10)){
                range.pasteHTML(dom);
            }else{
                var hasR = dom;
                var hasR_lastChild = hasR.lastChild;
                while (hasR_lastChild && hasR_lastChild.nodeName.toLowerCase() == "br" && hasR_lastChild.previousSibling && hasR_lastChild.previousSibling.nodeName.toLowerCase() == "br") {
                    var e = hasR_lastChild;
                    hasR_lastChild = hasR_lastChild.previousSibling;
                    hasR.removeChild(e)
                }                                
                range.insertNode(hasR);
                if (hasR_lastChild) {
                    range.setEndAfter(hasR_lastChild);
                    range.setStartAfter(hasR_lastChild);
                }
            }
            this.setCart(dom,range);
        }
    }
    S.extend(WKeditor, Base, /** @lends WKeditor.prototype*/{

    }, {ATTRS : /** @lends WKeditor*/{
    }});
    return WKeditor;
}, {requires:['node', 'base' ,'xtemplate']});



