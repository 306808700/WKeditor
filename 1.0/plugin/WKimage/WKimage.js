KISSY.add(function (S, Node,Base) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * @class WKimage
     */
    function WKimage(option){
        var self = this;
        self.options = option;
    };
    WKimage.prototype.tpl = {
        wrap:'<div class="WKeditor_image_plate">\
            <div class="uploadBox">\
                <p class="canDragMsg">（拖拽图片可修改顺序）</p>\
                <ul id="J_UploaderQueue" class="grid"></ul>\
                <div class="WK_box">\
                    <p class="WK_top">可拖动多张本地图片到这里上传<br/>或</p>\
                    <div class="up_btn"><input type="file" class="g-u" id="J_UploaderBtn" value="选择文件" name="Filedata" >\
                    <a class="btn-confirm wk-btn btn-bg-blue btn-large">确认插入</a></div>\
                    <p class="WK_text">Jpg，Gif，PNG,单张最大6M</br>图片尺寸超过480*270像素可以在首页展示缩略图</p>\
                </div>\
            </div><div class="close">×</div>\
        </div>'
    };
    WKimage.prototype.view = function(){
        var self = this;
        self.$image = $(self.tpl.wrap);
        $("body").append(self.$image);

        self.view.setImagePlatePosition = function(){
            self.$image.width(self.ele.width()).show();
            var top = ($(window).height()-self.$image.outerHeight())/2+$(window).scrollTop();
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
                            self.view.uploadRest();
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
        self.view.pixeler = function(src,angle,callback){
            KISSY.use('pixeler', function(S, Pixeler) {
                var pixeler = new Pixeler();
                function getCanvasUrl(src){
                    pixeler.processImage('rotate', {
                        dataURL: src,
                        angle: angle,
                        type: 'jpeg',
                        callback: function(dataURL) {
                            callback(dataURL);
                        }
                    });
                }

                if(src.name){
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        getCanvasUrl(e.target.result)
                    };
                    reader.readAsDataURL(src);
                }else{
                    getCanvasUrl(src)
                }
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
            self.tool.setCart(lastp.one("img")[0],self.options.range);
        };
        self.view.uploadRest = function(){
            self.$image.one(".up_btn").css({
                width:90
            });
            $("#J_UploaderQueue").hide();
            $(".btn-confirm").hide();
        }
        self.$insertArea = self.tool.insertArea();
    };
    WKimage.prototype.event = function(){
        var self = this;
        var btn = self.$image.one("#J_UploaderBtn");
        
        S.use('gallery/uploader/1.4/index,gallery/uploader/1.4/themes/default/index,gallery/uploader/1.4/themes/default/style.css',function (S, Uploader,DefaultTheme) {
            
            
                //上传插件
                var plugins = 'gallery/uploader/1.4/plugins/auth/auth,' +
                    'gallery/uploader/1.4/plugins/urlsInput/urlsInput,' +
                    'gallery/uploader/1.4/plugins/proBars/proBars';

                S.use(plugins,function(S,Auth,UrlsInput,ProBars,Filedrop,Preview,TagConfig){
                    

                    S.all('#J_uploadTemp').fire('focus').hide();
                    var multiple = self.config.multiple|| true;

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
                        action:self.config.action,
                        multiple:multiple,
                        autoUpload:"true"
                    });
                    if(!self.browser.msie){
                        self.event.html5Upload(self.$image);
                    }
                    
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
                        allowExts:self.config.allowExts
                        
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

                        target.one(".upload-cancel").on("click",function(){
                            $(this).next().fire("click");
                            self.$uploader.uploadFiles("waiting");
                        });
                        
                        
                        target.one(".waiting-status").remove();
                        target.addClass("queue-file");
                        if(self.options.uploaderkey){
                            return;
                        }
                        self.tool.realign(S.one("#J_UploaderQueue"));
                        self.options.uploaderkey = setTimeout(function(){
                            self.tool.realign(S.one("#J_UploaderQueue"));
                            clearTimeout(self.options.uploaderkey);
                            self.options.uploaderkey = null
                            self.tool.dragSort(self);
                        },100);
                     
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

                            self.view.uploadRest();
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
        /* 让支持html5的浏览器支持此功能 */
        self.event.html5Upload = function(dom){
            var box = dom.one(".uploadBox")[0];
            document.addEventListener("dragenter", function(e){  
                box.style.backgroundColor = '#fff';  
            }, false);  
            document.addEventListener("dragleave", function(e){  
                box.style.borderColor = '#999';  
            }, false);  
            box.addEventListener("dragenter", function(e){  
                box.style.borderColor = '#999';  
                box.style.backgroundColor = 'transparent';  
            }, false);  
            box.addEventListener("dragleave", function(e){  
                box.style.backgroundColor = '#fff';  
            }, false);
            box.addEventListener("dragover", function(e){  
                e.stopPropagation();  
                e.preventDefault();
                box.style.borderColor = '#999';  
                box.style.backgroundColor = '#f4ffa8';  
            }, false);  
            box.addEventListener("drop", function(e){
                box.style.backgroundColor = 'transparent';
                box.style.borderColor = '#999';
                e.stopPropagation();  
                e.preventDefault();
                var files = e.dataTransfer.files;
                for(var i=0;i<files.length;i++){
                    var file = files[i];
                    var img = document.createElement("img");
                    img.file = file;
                    
                    var testFile = {
                        'name':file.name,
                        'size':file.size,
                        'type':file.type,
                        status: "waiting",
                        textSize: file.size/1024+"kB"
                    };
                    //var queue = _class._default.uploader.get('queue');
                   // var testFile = queue.add(testFile);
                    //    testFile.data = file;
                    
                    //_class._default.uploader.fire("select",{file:[testFile]});

                    var $li = $("<li class='queue-file'></li>");
                    $li.append(self.view.preview({
                        url:"",
                        resize_url:"",
                        width:0,
                        height:0
                    }));

                    $li.one(".pic").html("").append(img);
                    
                    S.one("#J_UploaderQueue").append($li);
                    var reader = new FileReader();  
                    reader.onload = (function(aImg) { 
                        return function(e) {
                            aImg.src = e.target.result;
                            
                        }; 
                    })(img);
                    reader.readAsDataURL(file);
                }
                $("#J_UploaderQueue").show();
                $(".btn-confirm").show();
                self.$image.one(".up_btn").css({
                    width:205
                });
                self.tool.realign(S.one("#J_UploaderQueue"));
                self.tool.dragSort(self);
            }, false);
        };
        self.event.rotate = function(dom,type){
            dom.on("click",function(){
                var parent = $(this).parent();
                var li = $(this).parent().parent();
                var angle = type=="left"?270:90;
                //_class.plugin.rotate(li.one("img")[0],angle);
                parent.hide();
                self.view.pixeler(li.one("img")[0].fileValue || li.one("img").attr("src"),angle,function(url){
                    li.one("img").attr('src',url);
                    if(li.one("img")[0].fileValue){
                        delete li.one("img")[0].fileValue;
                    }
                });
            });
        };
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
        };
        $(window).on("resize",function(){
            self.view.setImagePlatePosition();
            self.tool.realign($("#J_UploaderQueue"));
        });
    };
    WKimage.prototype.init = function(config){
        this.ele = this.options.ele;
        this.left = this.options.left;
        this.top = this.options.top;
        this.$wrap = this.options.$wrap;
        this.tool = this.options.tool;


        this.browser = this.tool.browser();
        this.config = config;
        this.view();
        this.event();
    };
    return WKimage;
}, {requires:['node','./WKimage.css']});