KISSY.add(function (S, Node,Base) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * 
     * @class WKimage
     * @constructor
     * @extends Base
     */
    function WKimage(comConfig){
        var self = this;
        //调用父类构造函数
        WKimage.superclass.constructor.call(self, comConfig);
        this.initializer();
    };
    WKimage.prototype.tpl = {
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
    WKimage.prototype.view = function(){
        var self = this;
        self.$image = $(self.tpl.wrap);
        self.ele.append(self.$image);

        self.view.setImagePlatePosition = function(){
            self.$image.width(self.ele.width()).show();
            var top = ($(window).height()-self.$image.outerHeight())/2-self.top;
            var left = ($(window).width()-self.$image.width())/2-self.left;
            if(top<0){
                top = 5;
            }
            self.$image.css({
                zIndex:100,
                left:left,
                top:top
            });
        }
        self.view.setImagePlatePosition();
        self.$overlay = self.tool.overlay({
            ele:self.$image
        }).$overlay;
        self.view.preview = function(result){

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
                if(!self.browser.msie || (self.browser.msie&&parseInt(self.browser.version)>9) ){

                    template.one(".rotatel").css("display","block");
                    template.one(".rotate").css("display","block");

                    self.event.rotate(template.one(".rotatel"),"left");
                    self.event.rotate(template.one(".rotate"));
                }
                return template;
        }
        self.view.pixeler = function(img,angle,callback){
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
        self.view.insertImage = function(ul){
            var len = ul.length,lastp;
            S.each(ul.children(".queue-file"),function(dom,index){
                var img = $(dom).one("img");
                img.attr("src",img.attr('src'));
                var p = $("<p style='text-align:center'></p>");
                p.append($(dom).one("img"));
                self.$insertArea.before(p);
                $(dom).remove();
                if(index==len-1){
                    lastp = p;
                }
            });
            self.$insertArea.remove();
            self.$overlay.remove();
            self.tool.setCart(lastp.one("img")[0],self.get("range"));
        }
        self.$insertArea = self.tool.insertArea();
    };
    WKimage.prototype.event = function(){
        var self = this;
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
                        target.html("").append(self.view.preview(result));
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
                        self.view.insertImage($("#J_UploaderQueue"));
                        self.$image.remove();
                    });
                    
                return false;
            });
        });
        
        self.$image.all(".close").on("click",function(){
            self.$image.remove();
            self.$overlay.remove();
            self.$wrap.one(".insertArea").remove();
            self.$wrap.fire("blur");
        });
        self.event.rotate = function(dom,type){
            dom.on("click",function(){
                var parent = $(this).parent();
                var li = $(this).parent().parent();
                var angle = type=="left"?270:90;
                //_class.plugin.rotate(li.one("img")[0],angle);
                parent.hide();
                self.view.pixeler(li.one("img"),angle,function(url){
                    li.one("img").attr('src',url);
                    li.attr("angle",-angle);
                });
            });
        },
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
            self.view.setImagePlatePosition();
            self.tool.realign($("#J_UploaderQueue"));
        });
    };
    
    S.extend(WKimage, Base, /** @lends WKeditor.prototype*/{
        initializer:function(){
            this.ele = this.get("ele");
            this.left = this.get("left");
            this.top = this.get("top");
            this.$wrap = this.get("$wrap");
            this.tool = this.get("tool");
            this.browser = this.tool.browser();
            this.view();
            this.event();
        }
    }, {ATTRS : /** @lends WKeditor*/{
    }});
    return WKimage;
}, {requires:['node','base']});