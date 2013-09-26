/*
combined files : 

gallery/WKeditor/1.0/index

*/
/**
 * @fileoverview 
 * @author changyuan.lcy/核心 <changyuan.lcy@alibaba-inc.com>
 * @module WKeditor
 **/

KISSY.add('WKeditor/1.0/index',function (S, Node,Base,XTemplate) {
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
        this.initializer();
    }
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
            btn:"<div class='box'>{{#each data}}<button class='{{name}}' title='{{text}}'></button>{{/each}}</div>",
            arrow:"<div class='arrow-outer'><div class='arrow-shadow'></div></div>"
        };
        this.plugin.init = function(){
            self.plugin.view();
            self.plugin.event();
        };
        this.plugin.view = function(){
            
            self.$plugin = $(self.plugin.tpl.wrap);

            var arr = [],
                temp = "",
                i = 0;

            for(var name in config){
                arr[i] = {
                    name:name,
                    text:self.plugin.tpl.plugin[name]
                };
                i++;
            }
            temp = new XTemplate(self.plugin.tpl.btn).render({data:arr});
            self.$plugin.append(temp);
            self.$plugin.append(self.plugin.tpl.arrow);
            self.$plugin.height(self.$plugin.all("button").length*33);
            self.$plugin.one(".arrow-outer").css({
                top:(self.$plugin.height())/2-11
            });
            self.ele.append(self.$plugin);
        };

        this.plugin.event = function(){
            self.$plugin.delegate("click","button",function(e){
                var name = $(e.target).attr("class");
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
                var range = self.tool.getRange();
                self.set("range",range);
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
                self.set("range",range);
                setTimeout(function(){
                    try{
                        if(range.selectText){
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
                button.detach().on("click",function(){
                    if(img.attr("loadingid")){
                        var loadingimg = $("#editorMain").all("img[loadingid="+img.attr("loadingid")+"]");
                        if(loadingimg.length>0){
                            loadingimg.remove();
                        }
                    }
                    self.tool.setCart(img.parent()[0],self.get("range"));
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
            wrap:'<div class="WKeditor_image_plate">\
                <div class="uploadBox">\
                    <p class="canDragMsg">（拖拽图片可修改顺序）</p>\
                    <ul id="J_UploaderQueue" class="grid"></ul>\
                    <div class="box">\
                        <p class="top">可拖动多张本地图片到这里上传<br/>或</p>\
                        <div class="up_btn"><input type="file" class="g-u" id="J_UploaderBtn" value="选择文件" name="Filedata" >\
                        <a class="btn-confirm wk-btn btn-bg-blue btn-large">确认插入</a></div>\
                        <p class="text">Jpg，Gif，PNG,单张最大6M</br>图片尺寸超过480*270像素可以在首页展示缩略图</p>\
                    </div>\
                </div><div class="close">×</div>\
            </div>'
        };

        this.image.view = function(){
            self.$image = $(self.image.tpl.wrap);
            self.ele.append(self.$image);

            self.image.view.setImagePlatePosition = function(){
                self.$image.width(self.ele.width()).show();
                var top = ($(window).height()-self.$image.outerHeight())/2;
                var left = ($(window).width()-self.$image.width())/2;
                if(top<0){
                    top = 5;
                }
                self.$image.css({
                    zIndex:100,
                    left:left,
                    top:top
                });
            }
            self.image.view.setImagePlatePosition();
            self.$overlay = self.tool.overlay({
                ele:self.$image
            }).$overlay;
            self.image.view.preview = function(result){

                    var src = result.url||"";

                    var template = $('<div class="imageBox">'+
                        '<div class="pic"><img src="'+src+'"/></div>'+
                        '<div class="operate"><span title="左旋" class="rotatel"></span>'+
                        '<span title="右旋" class="rotate"></span>'+
                        '<span title="删除" class="del-pic"></span></div></div>');
                    template.on("mouseenter",function(){
                        template.one(".operate").show();
                    }).on("mouseleave",function(){
                        template.one(".operate").hide();
                    });
                    template.one(".del-pic").on("click",function(){
                        //Wanke.T.confirmDelete(function(){
                            $(this).parent().parent().parent().remove();
                            self.tool.realign(S.one("#J_UploaderQueue"),"ani");
                            if($("#J_UploaderQueue").children().length==0){
                                uploadRest();
                            }
                       // },"确定要删除这张图吗？");

                    });
                    if(!self.browser.msie || (self.browser.msie&&parseInt(self.browser.version)>8) ){
                        self.image.event.rotate(template.one(".rotatel"),"left");
                        self.image.event.rotate(template.one(".rotate"));
                    }
                    return template;
            }
            self.image.view.pixeler = function(img,angle,callback){
                KISSY.use('pixeler', function(S, Pixeler) {
                    var pixeler = new Pixeler();
                    pixeler.processImage('rotate', {
                        dataURL: img.attr("src"),
                        angle: angle,
                        type: 'jpeg',
                        callback: function(dataURL) {
                            callback(dataURL);
                        }
                    });
                });
            }
            self.image.view.insertImage = function(ul,tempDiv){
                var lastp;
                var len = ul.children(".queue-file").length;
                var $insertArea = $("<div class='insertArea'></div>");
                if(self.tool.removeHTML(self.$wrap.html())==self.tool.removeHTML(self.get("message"))){
                    self.$wrap.fire("click");
                    self.$wrap.fire("focus");
                    self.set("range",self.tool.getRange());
                }
                self.tool.insert($insertArea[0],self.get("range"));
                S.each(ul.children(".queue-file"),function(dom,index){
                    var img = $(dom).one("img");
                    img.attr("src",img.attr('src').replace("_100x100",""));
                    var p = $("<p style='text-align:center'></p>");
                    p.append($(dom).one("img"));
                    $insertArea.before(p);
                    $(dom).remove();
                    if(index==len-1){
                        lastp = p;
                    }
                });
                $insertArea.remove();
                self.$overlay.remove();
                self.tool.setCart(lastp.one("img")[0],self.get("range"));
            }
        };

        this.image.event = function(){
            var btn = self.$image.one("#J_UploaderBtn");
            function uploadRest(){
                self.$image.one(".up_btn").css({
                    width:90
                });
                $("#J_UploaderQueue").hide();
                $(".btn-confirm").hide();
            }
            S.use('gallery/uploader/1.4/index,gallery/uploader/1.4/themes/default/index,gallery/uploader/1.4/themes/default/style.css',function (S, Uploader,DefaultTheme) {
                
                
                    //上传插件
                    var plugins = 'gallery/uploader/1.4/plugins/auth/auth,' +
                        'gallery/uploader/1.4/plugins/urlsInput/urlsInput,' +
                        'gallery/uploader/1.4/plugins/proBars/proBars';

                    S.use(plugins,function(S,Auth,UrlsInput,ProBars,Filedrop,Preview,TagConfig){
                        

                        S.all('#J_uploadTemp').fire('focus').hide();
                        var multiple = "true";

                        var type = "flash";
                        if(self.browser.mozilla||self.browser.safari||self.browser.chrome){
                            type = "ajax";
                        }

                        if(self.browser.safari){
                            multiple = false;
                        }
                        self.$uploader = new Uploader('#J_UploaderBtn',{
                            //处理上传的服务器端脚本路径
                            type:type,
                            //手动控制flash的尺寸
                            swfSize:{"width":90, "height":45},
                            action:self.get("plugin").image.action,
                            multiple:multiple,
                            autoUpload:"true"
                        });
                        
                        
                        var addFileBtn = self.$image.one(".ks-uploader-button");
                        

                        //使用主题
                        self.$uploader.theme(new DefaultTheme({
                            queueTarget:'#J_UploaderQueue'
                        }))
                        //验证插件
                        .plug(new Auth({
                             //最多上传个数
                            max:100,
                            //图片最大允许大小
                            maxSize:10*1024,
                            allowExts:'jpg,gif,png,jpeg'
                            
                        }))
                        //url保存插件
                        .plug(new UrlsInput({target:'#J_Urls'}))
                        //进度条集合
                        .plug(new ProBars({}));

                        

                        self.$uploader.on("select",function(ev){
                            $("#J_UploaderQueue").show();
                            $(".btn-confirm").show();
                            self.$image.one(".up_btn").css({
                                width:205
                            });
                        });
                        self.$uploader.on("add",function(ev){
                            var target = ev.file.target;
                           // var space = $("<li class='queue-space'></li>");
                           // target.before(space);
                         
                            target.one(".upload-cancel").on("click",function(){
                                $(this).next().fire("click");
                                self.$uploader.uploadFiles("waiting");
                            });
                            
                            
                            target.one(".waiting-status").remove();
                            target.addClass("queue-file");
                            
                            if(self.get("uploaderkey")){
                                return;
                            }
                            self.set("uploaderkey",setTimeout(function(){
                                self.tool.realign(S.one("#J_UploaderQueue"));
                                clearTimeout(self.get("uploaderkey"));
                                self.set("uploaderkey",null);
                                self.tool.dragSort(self);
                            },100));
                         
                        });
                        self.$uploader.on("success",function(ev){
                            var result = ev.file.result;
                            var target = ev.file.target;
                            target.html("").append(self.image.view.preview(result));
                           // _class.tool.realign(S.one("#J_UploaderQueue"));
                           // _class.plugin.dragSort(target);
                        });
                        self.$uploader.on("error",function(ev){
                            var target = ev.file.target;
                            var queue = self.$uploader.get('queue');    
                            target.one(".error-status").one("span").text("不符合要求");
                            target.one(".error-status").one("a").addClass("del-pic");
                            
                            //ev.file.target.remove();
                        });
                        self.$uploader.on("remove",function(ev){
                            //ev.file.target.remove();
                            var target =ev.file.target;
                            target.remove();
                            self.tool.realign(S.one("#J_UploaderQueue"));
                            if(S.one("#J_UploaderQueue").children(".queue-file").length==0){

                                uploadRest();
                            }
                            
                        });
                        self.$image.one('.btn-confirm').on("click",function(){
                            if($("#J_UploaderQueue").one(".error-status")){
                                alert("有不符合或未传完的图片!");
                                return;
                            }
                            self.image.view.insertImage($("#J_UploaderQueue"));
                            self.$image.remove();
                        });
                        
                    return false;
                });
            });
            
            self.$image.all(".close").on("click",function(){
                self.$image.remove();
                self.$overlay.remove();
            });
            self.image.event.rotate = function(dom,type){
                dom.on("click",function(){
                    var parent = $(this).parent();
                    var li = $(this).parent().parent();
                    var angle = type=="left"?270:90;
                    //_class.plugin.rotate(li.one("img")[0],angle);
                    parent.hide();
                    self.image.view.pixeler(li.one("img"),angle,function(url){
                        li.one("img").attr('src',url);
                        li.attr("angle",-angle);
                    });
                });
            },
            self.image.event.drag = function(){
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
                            //$.plugin("Dmimi.realign",{ele:$("#J_UploaderQueue"),ani:true});
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
            $(window).on("resize",function(){
                self.image.view.setImagePlatePosition();
                self.tool.realign($("#J_UploaderQueue"));
            });
        };
        this.image.init();
    };
    WKeditor.prototype.video = function(config){
        var self = this;

        this.video.init = function(){
            self.video.view();
            self.video.event();
        };
        this.video.tpl = {
            wrap:'<div class="WKeditor_video_plate">\
                <table><tr><td width="80%">\
                <input key="toClear" title="请粘贴视频地址" placeholder="粘帖flash视频地址"/>\
                </td><td width="20%"><a href="javascript:void(0);" class="btn-confirm wk-btn btn-bg-blue btn-large">确认上传</a></td></tr></table>\
                <div class="close">×</div></div>'
        };

        this.video.view = function(){
            self.$video = $(self.video.tpl.wrap);
            self.ele.append(self.$video);

            self.video.view.setVideoPlatePosition = function(){
                self.$video.width(self.ele.width()).show();
                var top = ($(window).height()-self.$video.outerHeight())/2;
                var left = ($(window).width()-self.$video.width())/2;
                if(top<0){
                    top = 5;
                }
                self.$video.css({
                    zIndex:100,
                    left:left,
                    top:top
                });
            }
            self.video.view.setVideoPlatePosition();
            self.$overlay = self.tool.overlay({
                ele:self.$video
            }).$overlay;
            self.video.view.preview = function(result){
                var p = $("<p class='videoBox' style='text-align:center'></p>");
                var embed = document.createElement("embed");
                embed.setAttribute("height","400");
                embed.setAttribute("width","480");
                //embed.setAttribute("style","margin:0 auto;")
                embed.setAttribute("allowscriptaccess","never");
                embed.setAttribute("pluginspage","http://get.adobe.com/cn/flashplayer/");
                embed.setAttribute("allowfullscreen","true");
                embed.setAttribute("quality","high");
                embed.setAttribute("type","application/x-shockwave-flash");
                embed.setAttribute("wmode","transparent");
                embed.setAttribute("style","display:inline-block");
                embed.setAttribute("src",result);
                p.append(embed);
                return p;   
            }
            self.video.view.insertVideo = function(url){
                var lastp;
                var $insertArea = $("<div class='insertArea'></div>");
                var p = self.video.view.preview(url);
                self.$wrap.fire("click");
                self.set("range",self.tool.getRange());
                self.tool.insert($insertArea[0],self.get("range"));
                $insertArea.before(p);
                $insertArea.remove();
                self.$overlay.remove();
                self.$video.remove();
                self.tool.setCart(p[0],self.get("range"));
            }
        };

        this.video.event = function(){
            var btn = self.$video.one(".btn-confirm");

            btn.on("click",function(){
                var url = self.$video.one("input").val();
                self.video.view.insertVideo(url);
            });
            $(window).on("resize",function(){
                self.video.view.setVideoPlatePosition();
            });
            self.$video.one(".close").on("click",function(){
                self.$video.remove();
                self.$overlay.remove();
            });
        };
        this.video.init();
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
    WKeditor.prototype.tool = function(){
        var self = this;
        return {
            dragSort:function(self){
                self._default = {};
                this.drag.apply($("#J_UploaderQueue").all(".queue-file"),[
                    function(e){
                        // down
                        this.x = e.clientX - parseInt($(this).css("left"));
                        this.y = e.clientY - parseInt($(this).css("top"));
                        $(this).css({
                            "opacity":1,
                            zIndex:89
                        });
                        self._default.dragDown = true;
                        $("#J_UploaderQueue").all(".queue-space").css({
                            opacity:0,
                            width:parseInt($("#J_UploaderQueue").attr("space"))-6
                        });
                        /*
                        $("#J_UploaderQueue").all(".queue-space").on("mouseenter",function(){
                            if(_class._default.dragDown){
                                $(this).css({
                                    opacity:1
                                }).animate({
                                    width:parseInt($(this).attr("space"))-6
                                },1/4);
                                _class._default.space = $(this);
                            }
                        }).on("mouseleave",function(){
                            $(this).css({
                                opacity:0
                            });
                            _class._default.space = null;
                        });
                        */
                    },
                    function(e){
                        // move
                        var left = e.clientX-this.x;
                        var top =  e.clientY-this.y;
                        $(this).css({
                            left:left,
                            top:top
                        });

                        function inSpace(x,y){
                            S.each($("#J_UploaderQueue").all(".queue-space"),function(dom){
                                var l,t,w,h;
                                l = $(dom).offset().left;
                                t = $(dom).offset().top;
                                w = $(dom).width();
                                h = $(dom).height();
                                if(x>l&&x<(l+w)&&y>t&&y<(t+h)){
                                    $(dom).css({
                                        opacity:1
                                    });
                                    self._default.space = $(dom);
                                }else{
                                    $(dom).css({
                                        opacity:0
                                    });
                                }
                            });
                        }
                        inSpace(e.clientX,e.clientY+$(window).scrollTop());

                    },
                    function(){
                        // press
                        if(self._default.space){
                            self._default.space.before($(this));
                            $(this).animate({
                                width:100,
                                height:100
                            },1/5);
                            self.tool.realign($("#J_UploaderQueue"),"ani");
                            self._default.space = null;
                        }else{
                            $(this).animate({
                                left:$(this).attr('dleft'),
                                top:$(this).attr('dtop'),
                                width:100,
                                height:100
                            },1/3);
                        }
                        $(this).css({
                            "opacity":1,
                            zIndex:88
                        })
                        self._default.dragDown = false;
                    },
                ]);
            },
            drag:function(downCallback,moveCallback,upCallback){
                var ele = this;
                S.each(ele,function(dom){
                    dom.downCallback = downCallback;
                    dom.moveCallback = moveCallback;
                    dom.upCallback = upCallback;

                    $(dom).css({cursor:"move"});
                    $(dom).on("mousedown",function(e){
                        e.preventDefault();

                        dom.downCallback(e);
                        document.onmousemove = function(e){
                            e = e||event;
                            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                            dom.moveCallback(e);
                            //IE 去除容器内拖拽图片问题 
                            if (document.all){
                                e.returnValue = false;
                            }

                        }
                        $(document).on("mouseup",function(e){
                            document.onmousemove = null;
                            $(document).detach("mouseup");
                            dom.upCallback(e);
                        });
                    });
                });
                return ele;
            },
            /*
                用于图片列表重排
            */
            realign:function(ul,ani){
                var ele = ul;
                var w = ele.width(),
                    opts = {
                        minSpace:20,
                        width:100,
                        height:100
                    },
                    num = Math.floor(w/opts.width),
                    child = ele.children(".queue-file"),
                    expresstion = function(num){
                        return (w-opts.width*num)/(num+1);
                    },
                    left = 0,
                    top = 0;
                function findTNum(num){
                    w = ele.width();
                    var space = expresstion(num);
                    if(space>opts.minSpace){
                        var line = 0;
                        S.each(child,function(dom,index){
                            left = (opts.width+space)*(index%num)+space;
                            top = (opts.height+space)*(Math.floor(index/num))+space;
                            if(ani){
                                $(dom).animate({
                                    left:left,
                                    top:top
                                },1/4);
                            }else{
                                $(dom).css({
                                    left:left,
                                    top:top
                                });
                            }
                            $(dom).attr('dleft',left).attr("dtop",top);
                        });
                        ele.height((Math.ceil(child.length/num))*(opts.height+space)+space);
                        ele.attr("num",num).attr("space",space);
                        // setSpace
                        ele.all(".queue-space").remove();
                        ele.all(".beQs").removeClass("beQs");

                        var qs = $("<li class='queue-space'></li>");
                        qs.css({
                            opacity:0,
                            background:"#f8f8f8"
                        });
                        S.each(child,function(dom,index){
                            if($(dom).hasClass("beQs")){
                                return;
                            }
                            if(!$(dom).prev()||!$(dom).prev().hasClass("queue-space")||$(dom).prev().hasClass("linelast")){
                                $(dom).before(qs.clone());
                            }
                            if((index+1)%num==0){
                                $(dom).after(qs.clone().addClass("linelast"));
                            }
                            else if(index==child.length-1){
                                $(dom).after(qs.clone());
                            }
                            $(dom).addClass("beQs");
                        });
                        S.each(ele.children(".queue-space"),function(dom,index){
                            left = (opts.width+space)*(index%(num+1));
                            top = (opts.height+space)*(Math.floor(index/(num+1)))+space;
                            $(dom).css({
                                left:left,
                                top:top
                            }).attr("space",space);
                        });
                    }else{
                        num--;
                        if(num>0){
                            findTNum(num);
                        }
                    }
                }
                findTNum(num);
            },
            overlay:function(options){
                var opts = S.merge(options,{
                    opacity:0.6,
                    background:"#666",
                    zIndex:999
                });
                var _class = {
                    view:function(){
                        _class.$overlay.css({
                            top:0,
                            left:0,
                            height:$(document).height(),
                            width:$(window).width(),
                            position:"absolute",
                            opacity:opts.opacity,
                            background:opts.background,
                            zIndex:parseInt(opts.ele.css("z-index"))-1||opts.zIndex
                        });
                    },
                    event:function(){
                        $(window).on("resize",function(){
                            _class.view();
                        });
                    },
                    init:function(){
                        _class.$overlay = $("<div class='overlay'></div>");
                        _class.$overlay.appendTo($("body"));
                        _class.view();
                        _class.event();
                    }
                };
                _class.init();
                return _class;
            },
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
                if(document.selection&&parseInt(self.browser.version)<9){
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
                var selection = this.getSelection();
                if (!window.getSelection || (self.browser.msie && parseInt(self.browser.version)<10)){
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
        };
    }
    S.extend(WKeditor, Base, /** @lends WKeditor.prototype*/{
        initializer:function(){
            this.view();
            this.event();
            if(this.get("plugin")){
                this.plugin(this.get("plugin"));
            }
            if(this.get("font")){
                this.font(this.get("font"));
            }
            this.tool = this.tool();
            this.browser = this.tool.browser();
        }
    }, {ATTRS : /** @lends WKeditor*/{
    }});

    var WKimgPlate = {    
        pluginInitializer:function(){},
        pluginDestructor:function(){}
    };
    return WKeditor;
}, {requires:['node', 'base' ,'xtemplate']});




