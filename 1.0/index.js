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
        self.comConfig = comConfig;
        WKeditor.superclass.constructor.call(self, comConfig);
        this.initializer();
    }
    WKeditor.prototype.tpl = {
        wrap:$("<div class='WKeditor_wrap'></div>")
    };
    WKeditor.prototype.view = function(){
        var self = this;
        
        this.view.init = function(){
            self.set("$wrap",$(self.tpl.wrap));
            self.$wrap = self.get("$wrap");
            self.$wrap.attr("contenteditable",true);
            //self.$wrap.html(self.get("message"));
            self.view.message();
            self.ele.append(self.$wrap);
        };
        this.view.message = function(){
            self.$message = $(self.get("message"));
            self.ele.append(self.$message);
            self.$message.on("click",function(){
                self.$wrap.fire("focus");
                $(this).hide();
            });
            self.$message.show();
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
                if(self.plugin.tpl.plugin[name]){
                    arr[i] = {
                        name:name,
                        text:self.plugin.tpl.plugin[name]
                    };
                    i++;
                }
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
                self.$wrap.fire("focus");
                self.set("range",self.tool.getRange());

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
                self.$message.hide();
            })

            .on("blur",function(){
                if($(this).html().replace("<span></span>","").replace("<br>","") == ''){
                    self.$message.show();
                }   
            })
            .on("mousedown",function(){
                self.set('range',self.tool.getRange());
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
                if(self.browser.chrome||self.browser.mozilla){
                    self.event.shotImg(e);
                }
            };
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
    WKeditor.prototype.image = function(){
        var self = this;
        KISSY.use("WKimage",function(S,WKimage){
            var Wkimage = new WKimage(self.getAttrVals());
        });
    };
    WKeditor.prototype.video = function(){
        var self = this;
        KISSY.use("WKvideo",function(S,WKvideo){
            
            var WKvideo = new WKvideo(self.getAttrVals());
        });
    };
    WKeditor.prototype.font = function(config){
        var self = this;
        KISSY.use("WKfont",function(S,WKfont){
            self.set("config",config);
            var WKfont = new WKfont(self.getAttrVals());
        });
    };
    WKeditor.prototype.tool = function(){
        var self = this;
        return {
            insertArea:function(){
                var id = +new Date();
                var $insertArea = $("<div class='insertArea' id='"+id+"'></div>");
                if(self.tool.removeHTML(self.$wrap.html())==self.tool.removeHTML(self.get("message"))){
                    self.$wrap.fire("click");
                    self.$wrap.fire("focus");
                    self.set("range",self.tool.getRange());
                }
                self.tool.insert($insertArea[0],self.get("range"));
                self.$message.hide();
                return $("#"+id);
            },
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
                var range;
                try{
                    range = this.getSelection().createRange ? this.getSelection().createRange() : this.getSelection().getRangeAt(0);
                    range.selectText = range.text ? range.text : range.toString();
                }catch(e){}
                return range;
            },
            //设置光标位置
            setCart:function(dom,range) {

                try{
                    if(document.selection&&parseInt(self.browser.version)<9){
                        range.collapse(false);
                        range.select();
                    }else{
                        range.setStartAfter(dom);
                        range.collapse(true);
                        this.getSelection().removeAllRanges();
                        this.getSelection().addRange(range);
                    }
                }catch(e){

                }
            },
            //插入到光标位置
            insert:function(dom,range){
                var selection = this.getSelection();
                if (!window.getSelection || (self.browser.msie && parseInt(self.browser.version)<9)){
                    range.pasteHTML(dom.outerHTML);
                    range.select();
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
            this.ele = this.get("ele");
            this.set("left",this.ele.offset().left);
            this.set("top",this.ele.offset().top);
            this.view();
            this.event();
            if(this.get("plugin")){
                this.plugin(this.get("plugin"));
            }
            if(this.get("plugin").font){
                this.font(this.get("plugin").font);
            }
            this.tool = this.tool();
            this.set("tool",this.tool);
            this.browser = this.tool.browser();
        }
    }, {ATTRS : /** @lends WKeditor*/{
    }});

    return WKeditor;
}, {requires:['node', 'base' ,'xtemplate']});