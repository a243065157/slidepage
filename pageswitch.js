/**
 * Created by 24306 on 2017/4/17.
 */
(function ($) {
    var PrivateFun=function(){
        // 私有方法
    }
    var PageSwitch=(function(){
        function PageSwitch(element,options){
            this.settings=$.extend(true,$.fn.PageSwitch.default,options||{});
            this.elements=element;
            this.init();
        }
        // 初始化INIT
        PageSwitch.prototype={
            init:function(){

            }
        }
        return PageSwitch;
    })();
    $.fn.PageSwitch = function (options) {
        return this.each(function(){
            var me=$(this),
                instance=me.data("Pageswitch");
            if(!instance){
                instance=new PageSwitch(me,options);
                me.data=("Pageswitch",instance);
            }
            if($.type(options)==="string")  return instance[options]();
            $("div").PageSwitch("init");
        })
    }
    // 配置项，默认
    $.fn.PageSwitch.default = {
        selectors: {
            sections: ".sections",
            section: ".section",
            page: ".pages",
            active: ".active"
        },
        index: 0,
        easing:"ease",
        duration:500,
        loop:false,
        pagination:true,
        keyboard:true,
        direction:"vertical",
        callback:""
    }
    // 可通过在标签中添加data=pageswitch来初始化对象，但是此方法不能配置参数
    // $(function(){
    //     $("[data-PageSwitch]").PageSwitch();
    // })
})(jQuery);