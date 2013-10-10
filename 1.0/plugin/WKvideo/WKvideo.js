

KISSY.add(function (S, Node,Base) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * 
     * @class WKvideo
     * @constructor
     * @extends Base
     */
    function WKvideo(comConfig){
        var self = this;
        //调用父类构造函数
        WKvideo.superclass.constructor.call(self, comConfig);
        this.initializer();
    };
    WKvideo.prototype.tpl = {
        wrap:'<div class="WKeditor_video_plate">\
            <table><tr><td width="80%">\
            <input key="toClear" title="请粘贴视频地址" placeholder="粘帖flash视频地址"/>\
            </td><td width="20%"><a href="javascript:void(0);" class="btn-confirm wk-btn btn-bg-blue btn-large">确认上传</a></td></tr></table>\
            <div class="close">×</div></div>'
    };

    WKvideo.prototype.view = function(){
        var self = this;
        self.$video = $(self.tpl.wrap);
        $("body").append(self.$video);

        self.view.setVideoPlatePosition = function(){
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
        self.view.setVideoPlatePosition();
        self.$overlay = self.tool.overlay({
            ele:self.$video
        }).$overlay;
        self.view.preview = function(result){
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
        self.view.insertVideo = function(url){
            if(url.indexOf(".swf")==-1){
                alert("只能支持swf格式地址");
                return;
            }
            function doit (url){
                var p = self.view.preview(url);
                self.$insertArea.before(p);
                self.$insertArea.remove();
                self.$overlay.remove();
                self.$video.remove();
                self.tool.setCart(p[0],self.get("range"));
            }
            if(self.config.setUrl){
                doit(self.config.setUrl(url));
            }else{
                doit(url);   
            }
        }
        self.$insertArea = self.tool.insertArea();
    };

    WKvideo.prototype.event = function(){
        var self = this;
        var btn = self.$video.one(".btn-confirm");

        btn.on("click",function(){
            var url = self.$video.one("input").val();
            self.view.insertVideo(url);
        });
        $(window).on("resize",function(){
            self.view.setVideoPlatePosition();
        });
        self.$video.one(".close").on("click",function(){
            self.$video.remove();
            self.$overlay.remove();
            self.$insertArea.remove();
            self.$wrap.fire("blur");
        });
    };
    S.extend(WKvideo, Base, /** @lends WKeditor.prototype*/{
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
    return WKvideo;
}, {requires:['node','base']});