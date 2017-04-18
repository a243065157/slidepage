/**
 * Created by 24306 on 2017/4/17.
 */
(function ($) {
    "use strict";
    /*说明:获取浏览器前缀*/
    /*实现：判断某个元素的css样式中是否存在transition属性*/
    /*参数：dom元素*/
    /*返回值：boolean，有则返回浏览器样式前缀，否则返回false*/
    var _prefix = (function (temp) {
        var aPrefix = ["webkit", "Moz", "o", "ms"],
            props = "";
        for (var i in aPrefix) {
            props = aPrefix[i] + "Transition";
            if (temp.style[props] !== undefined) {
                return "-" + aPrefix[i].toLowerCase() + "-";
            }
        }
        return false;
    })(document.createElement(PageSwitch));
    var PrivateFun = function () {
        // 私有方法
    }
    var PageSwitch = (function () {
        function PageSwitch(element, options) {
            // 传递插件配置
            this.settings = $.extend(true, $.fn.PageSwitch.defaults, options || {});
            this.element = element;
            this.init();
        }

        // 初始化INIT
        PageSwitch.prototype = {
            // 有下划线代表私有方法，反之代表公有方法
            // 初始化插件
            init: function () {
                var me = this;
                me.selectors = me.settings.selectors;
                me.sections = me.element.find(me.selectors.sections);
                me.section = me.element.find(me.selectors.section);
                me.direction = me.settings.direction == "vertical" ? true : false;
                me.pagesCount = me.pagesCounts();
                me.canScroll = true;
                me.index = (me.settings.index >= 0 && me.settings.index < me.pagesCount) ? me.settings.index : 0;
                if (!me.direction) {
                    me._initLayout();
                }
                if (me.settings.pagination) {
                    me._initPaging();
                }
                me._initEvent();
            },
            // 初始化dom结构，布局，分页以及绑定事件
            pagesCounts: function () {
                return this.section.length;
            },
            // 获取的宽度或高度
            swichLength: function () {
                return this.direction ? this.element.height() : this.element.width();
            },
            // 上一页
            prve: function () {
                var me = this;
                if (me.index > 0) {
                    me.index--;
                } else if (me.settings.loop) {
                    me.index = me.pagesCount - 1;
                }
                me._scrollPage();
            },
            // 下一页
            next: function () {
                var me = this;
                if (me.index < me.pagesCount) {
                    me.index++;
                } else if (me.settings.loop) {
                    me.index = 0;
                }
                me._scrollPage();
            },
            // 主要针对横向滑动情况进行布局
            _initLayout: function () {
                var me = this;
                var width = (me.pagesCount * 100) + "%",
                    cellWidth = (100 / me.pagesCount).toFixed(2) + "%";
                me.sections.width(width);
                me.section.width(cellWidth).css("float", "left");

                var me = this;
                if (!me.direction) {
                    var width = (me.pagesCount * 100) + "%",
                        cellWidth = (100 / me.pagesCount).toFixed(2) + "%";
                    me.sections.width(width);
                    me.section.width(cellWidth).css("float", "left");
                }
                if (me.index) {
                    me._scrollPage(true);
                }

            },
            // 实现分页DOM结构以及CSS样式
            _initPaging: function () {
                var me = this,
                    pageClass = me.selectors.page.substring(1),//添加分页标签的Class
                    activeClass = me.selectors.active.substring(1);//添加活动页的Class
                var pageHTML = "<ul class=" + pageClass + ">";
                for (var i = 0; i < me.pagesCount; i++) {
                    pageHTML += "<li></li>";
                }
                pageHTML += "</ul>";
                me.element.append(pageHTML);
                // 初始化分页DOM结构
                var pages = me.element.find(me.selectors.page);
                me.pageItem = pages.find("li");
                me.pageItem.eq(me.index).addClass(me.activeClass);
                if (me.direction) {
                    pages.addClass("vertial");
                } else {
                    pages.addClass("horizontal");
                }
            },
            // 初始化插件事件
            _initEvent: function () {
                var me = this;
                // 利用on事件的委托功能来为还未创建的标签绑定事件  实现点击分页器滑动至相应标签
                me.element.on("click", me.selectors.page + " li", function () {
                    me.index = $(this).index();
                    me._scrollPage();
                });
                // 绑定鼠标滚轮事件
                me.element.on("mousewheel DOMMouseScroll", function (e) {
                    // 兼容IE以及火狐浏览器
                    if (me.canScroll) {
                        var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
                        if (delta > 0 && (me.index && !me.settings.loop || me.settings.loop)) {
                            me.prve();
                        } else if (delta < 0 && (me.index < (me.pagesCount - 1) && !me.settings.loop || me.settings.loop)) {
                            me.next();
                        }
                    }

                });
                // 绑定键盘
                if (me.settings.keyboard) {
                    $(window).on("keydown", function (e) {
                        if (me.canScroll) {
                            var keyCode = e.keyCode;
                            if (keyCode == 37 || keyCode == 38) {
                                me.prve();
                            } else if (keyCode == 39 || keyCode == 40) {
                                me.next();
                            }
                        }
                    });
                }
                ;
                // 改变屏幕尺寸时滑动
                $(window).resize(function () {
                    var currentLength = me.swichLength(),
                        offset = me.settings.direction ? me.section.eq(me.index).offset().top : me.section.eq(me.index).offset().left;
                    if (Math.abs(offset) > currentLength / 2 && me.index < (me.pagesCount - 1)) {
                        me.index++;
                    }
                    if (me.index) {
                        me._scrollPage();
                    }
                });
                // 添加滑动动画效果
                me.sections.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend", function () {
                    if (me.settings.callback && $.type(me.settings.callback) == "function") {
                        me.settings.callback();
                        me.canScroll = true;
                    }
                });
            },
            // 滑动
            _scrollPage: function () {

                var me = this,
                    dest = me.section.eq(me.index).position();
                if (!dest) return;
                // 是否支持CSS3属性
                if (_prefix) {
                    var translate = me.direction ? "translateY(-" + dest.top + "px)" : "translateX(-" + dest.left + "px)";
                    me.sections.css(_prefix + "transition", "all " + me.settings.duration + "ms " + me.settings.easing);
                    me.sections.css(_prefix + "transform", translate);
                } else {
                    var animateCss = me.direction ? {top: -dest.top} : {left: -dest.left};
                    me.sections.animate(animateCss, me.settings.duration, function () {
                        me.canScroll = true;
                        if (me.settings.callback) {
                            me.settings.callback();
                        }
                    });
                }
            }

        }
        return PageSwitch;
    })();
    $.fn.PageSwitch = function (options) {
        return this.each(function () {
            var me = $(this),
                instance = me.data("Pageswitch");
            if (!instance) {
                instance = new PageSwitch(me, options);
                me.data("Pageswitch", instance);
            }
            if ($.type(options) === "string")  return instance[options]();
            // $("div").PageSwitch("init");
        })
    }
    // 配置项，默认
    $.fn.PageSwitch.defaults = {
        selectors: {
            sections: ".sections",
            section: ".section",
            page: ".pages",
            active: ".active"
        },
        index: 0,
        easing: "ease",
        duration: 500,
        loop: false,
        pagination: true,
        keyboard: true,
        direction: "vertical",
        callback: ""
    }
    // 可通过在标签中添加data=pageswitch来初始化对象，但是此方法不能配置参数
    // $(function(){
    //     $("[data-PageSwitch]").PageSwitch();
    // })
})(jQuery);