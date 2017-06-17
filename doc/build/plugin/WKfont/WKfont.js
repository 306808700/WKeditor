KISSY.add(function (S, Node,XTemplate) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * 
     * @class WKfont
     * @constructor
     * @extends Base
     */
    function WKfont(options){
        var self = this;
        self.options = options;
    };

    WKfont.prototype.tpl = {
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
                text:"还原字体",
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

    WKfont.prototype.view = function(){
        var self = this;
        self.view.render = function(){
            self.$font.width(self.$font.all("button").length*32);
        };
        self.$font = $(self.tpl.wrap),
            arr = [],
            temp = "";
        if(self.config){     
            for(var i=0,len=self.config.length;i<len;i++){
                arr[i] = {
                    name:self.config[i],
                    command:self.tpl.font[self.config[i]].command,
                    size:self.tpl.font[self.config[i]].size,
                    text:self.tpl.font[self.config[i]].text
                };
            }
        }
        temp = new XTemplate(self.tpl.btn).render({data:arr})
        self.$font.append(temp);
        self.$font.append(self.tpl.arrow);
        
        
        self.view.render();
        self.ele.append(self.$font);
    };

    WKfont.prototype.event = function(){
        var self = this;
        self.$font.all("button").on("click",function(e){
            var command = $(this).attr("command");
            if(command=="setFontSize"){
                self.command[command]($(this).attr("size"));
            }else{
                self.command[command]();
            }
            return false;
        });
        self.$wrap.on("mousedown",function(e){
            self.options.mousedown = true;
            self.options.mouseOD = {
                left:e.clientX,
                top:e.clientY+$(window).scrollTop()
            };
            self.$font.hide();
            if(self.options.range){
                self.tool.setCart(self.$wrap[0],self.options.range);
            }
            self.$wrap.fire('click');
        })

        .on("mouseup",function(e){
            self.options.mouseOU = {
                left:e.clientX,
                top:e.clientY+$(window).scrollTop()
            };
            self.options.mousedown = false;

            var range = self.tool.getRange();
            var l =  self.options.mouseOD.left-(self.options.mouseOD.left-self.options.mouseOU.left)/2-self.$font.width()/2;
            var t =  self.options.mouseOD.top-(self.options.mouseOD.top-self.options.mouseOU.top)/2-self.$font.height()-20;
    


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
            self.options.range = range;
            setTimeout(function(){
                try{
                    if(range.selectText){
                        self.$font.show();
                        self.$font.css({
                            left:l-self.left,
                            top:t-self.top
                        });
                    }
                }catch(e){

                }
            },1);
        });
        $(document).on("mouseup",function(e){
            if(self.options.mousedown){
                self.$wrap.fire("mouseup",e);
                self.options.mouseOU = {
                    left:e.clientX,
                    top:e.clientY+$(window).scrollTop()
                };
            }else if(S.inArray(e.target,self.$font.all("button"))){
            }else{
                self.$font.hide();
            }
            return false;
        });
    };
    WKfont.prototype.command = {
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
    };
    WKfont.prototype.init = function(config){
        this.ele = this.options.ele;
        this.left = this.options.left;
        this.top = this.options.top;
        this.$wrap = this.options.$wrap;
        this.config = config;
        this.tool = this.options.tool;
        this.browser = this.tool.browser();
        this.view();
        this.event();
    };
    return WKfont;
}, {requires:['node','xtemplate','./WKfont.css']});