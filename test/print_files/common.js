/**
 * 存放一些共通的js方法
 */

/**
 * 日期格式化
 * @param fmt
 * @returns {*}
 */
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}


var Common = {
    /**
     * 格式化数字格式 xxx,xxx.xx
     * @returns {string|*}
     */
    toMoneyFormat: function (num) {
        if (typeof num == "undefined")
            return "0";

        if (typeof num == "string") {
            //有","说明格式化过了，不再进行格式化
            if (num.indexOf(",") != -1) return num;
            num = parseFloat(num);
        }
        //四舍五入 两位小数
        num = num.toFixed(2);

        //格式化整数部分为xxx,xxx,xxx
        var split = num.split(".");
        var integers = split[0].split("");
        var integer = "";
        for (var i = integers.length - 1, j = 1; 0 <= i; i--, j++) {
            integer = integers[i] + integer;
            if (j % 3 == 0 && i != 0) {
                integer = "," + integer;
            }
        }

        num = integer + "." + split[1];
        return num;
    },
    /** 适配yyyy-MM-dd hh:mm:ss **/
    yyyy_MM_dd: function(date) {
        if(date == undefined || date == null || date == "") return "";
        return date.split(' ')[0].trim();
    },
    /** 将yyyy_MM_dd 转成 yyyy-MM-dd hh:mm:ss **/
    toDateFormat: function(date){
        if(date == undefined || date == null || date == "") return "";
        return date + " 00:00:00";
    },
    /**
     * 得到当前页面的基本路径
     * @returns http://localhost:8080/crm/
     */
    getBasePath: function () {
        var projectName = ""
        var basePath = location.protocol + "//" + location.hostname +
            ":" + location.port + "/" + projectName;


        return basePath;
    },
    timeoutValidate: function (rst) {
        //超时校验
        if (rst.rstCode == "137") {
            window.location.href = Common.getBasePath() + "login.html";
        }

        return false;
    },
    /**
     * 注销
     */
    logout: function () {
        var url = this.getBasePath() + "user/logout";
        $.get(url, {}, function (result) {
            if (result.rstCode == "0") {
                // Common.clearAllCookie();
				window.localStorage.clear();
                window.location.href = Common.getBasePath() + "logout.html";
            } else {
                Modal.alert({message: result.rstMsg});
            }
        });
    },
    parseURL: function (target) {
        //不存在参数的情况下返回空串
        if (target.indexOf("?") == -1)
            return "";

        var url = target.split("?")[1];
        var para = url.split("&");
        var len = para.length;
        var res = {};
        var arr = [];
        for (var i = 0; i < len; i++) {
            arr = para[i].split("=");
            res[arr[0]] = arr[1];
        }
        return res;
    },
    clearAllCookie: function () {
        var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
        if (keys) {
            for (var i = keys.length; i--;)
                document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
        }
    },
    getCookie: function (key) {
        var arr, reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");

        if (arr = document.cookie.match(reg))
            return decodeURI(arr[2]);
        else
            return "";
    },
    showCookieData: function () {
        //显示localStorage数据
        $(".cookie-data").each(function () {
            var mapper = $(this).attr("data-mapper");
            $(this).html(window.localStorage.getItem(mapper));
        });

        var realName = window.localStorage.getItem("realName");
        var role = window.localStorage.getItem("role");

        if (realName == "" || role == "" ||
            realName == undefined || role == undefined ||
            realName == null || role == null) {
            //localStorage取不到的情况下去session中重新取值
            Common.refreshLocalStorage();
        } else {
            $(".top-menu a").html("<a href='javascript:Common.logout();' class='system'>退出系统</a>");
        }

        //Common.refreshLocalStorage();
    },
    showPage: function (list, count, pageNo, pageSize) {
        if (count > 0) {
            var options = {
                bootstrapMajorVersion: 3,
                currentPage: pageNo,//默认为1
                //numberOfPages:pageSize,
                totalPages: Math.ceil(count / pageSize),
                size: "normal",
                alignment: "right",

                itemTexts: function (type, page, current) {
                    switch (type) {
                        case "first":
                            return "首页";
                        case "prev":
                            return "上一页";
                        case "next":
                            return "下一页";
                        case "last":
                            return "末页";
                        case "page":
                            return page;
                    }
                },
                //为操作按钮绑定页码改变事件
                onPageChanged: function (event, oldPage, newPage) {
                    list.refresh(newPage, pageSize);
                },
            }
            //显示分页组件
            $('#paging').bootstrapPaginator(options);
        } else {
            $('#paging').html("");
        }
    },
    refreshFoot: function (list, pageNo, pageSize) {
        var count = $("#count").text();

        if (pageSize != -1) {
            $("#pages").html(Math.ceil(count / pageSize));
            list.page(count, pageNo, pageSize);
        } else {
            $("#pages").html(1);
            list.page(count, 1, count);
        }
    },
    showChild: function (_this) {
        var display = $(_this).next().first().css("display");
        $(_this).siblings().not(".parent").not(":first-child").css("display", "none");
        if (display === "none") {
            $(_this).next().css("display", "table-row");
        }
    },
    //todo:简单的权限控制
    permission: function () {
        var role = localStorage.getItem('role');
        if (role == "采购员") {
            $("#menu7").remove();
            // $(".sale-permission").remove();
        } else if (role == "销售员") {
            $("#menu7").remove();
            // $(".purchase-permission").remove();
        } else {

        }
    },
    /** 统一处理返回的dto **/
    checkResult: function(result) {
        if (result.rstCode != "0") {
            Modal.alert('<button class="btn btn-success btn-lg">' + result.rstMsg + '</button>');
            return false;
        }

        if (result.data.count == 0) {
            Modal.alert('<button class="btn btn-success btn-lg">暂无数据</button>');
            return false;
        }

        return true;
    },
    //刷新localStorage
    refreshLocalStorage: function() {
        var url = Common.getBasePath() + "user/getUserInfo/reload";
        $.get(url, {}, function(result){
            if (result.rstCode == "0") {
                window.localStorage.setItem('role', result.data.role);
                window.localStorage.setItem('realName', result.data.realName);
                //显示localStorage数据
                $(".cookie-data").each(function () {
                    var mapper = $(this).attr("data-mapper");
                    $(this).html(window.localStorage.getItem(mapper));
                });
            } else {
                $('.cookie-data').html("");
                $(".top-menu a").html("<a href='../login.html' class='system'>登录系统</a>");
            }
       });
    },
    menuItem: function(url, index, title) {

        // 获取标识数据
        var dataUrl = url,
            dataIndex = index,
            menuName = title,
            flag = true;
        if (dataUrl == undefined || $.trim(dataUrl).length == 0)return false;

        // 选项卡菜单已存在
        $('.J_menuTab', parent.document).each(function () {
            if ($(this).data('id') == dataUrl) {
                if (!$(this).hasClass('active')) {
                    $(this).addClass('active').siblings('.J_menuTab').removeClass('active');
                    scrollToTab(this);
                    // 显示tab对应的内容区
                    // $('.J_mainContent .J_iframe').each(function () {
                    //     if ($(this).data('id') == dataUrl) {
                    //         $(this).show().siblings('.J_iframe').hide();
                    //         return false;
                    //     }
                    // });
                    var str1 = '<iframe class="J_iframe" name="iframe' + dataIndex + '" width="100%" height="100%" src="' + dataUrl + '" frameborder="0" data-id="' + dataUrl + '" seamless></iframe>';
                    $('.J_mainContent', parent.document).find('iframe.J_iframe').hide().parents('.J_mainContent').append(str1);

                    // 添加选项卡
                    $('.J_menuTabs .page-tabs-content', parent.document).append(str);
                }
                flag = false;
                return false;
            }
        });

        // 选项卡菜单不存在
        if (flag) {
            var str = '<a href="javascript:;" class="active J_menuTab" data-id="' + dataUrl + '">' + menuName + ' <i class="fa fa-times-circle"></i></a>';
            $('.J_menuTab', parent.document).removeClass('active');

            // 添加选项卡对应的iframe
            var str1 = '<iframe class="J_iframe" name="iframe' + dataIndex + '" width="100%" height="100%" src="' + dataUrl + '" frameborder="0" data-id="' + dataUrl + '" seamless></iframe>';
            $('.J_mainContent', parent.document).find('iframe.J_iframe').hide().parents('.J_mainContent').append(str1);

            // 添加选项卡
            $('.J_menuTabs .page-tabs-content', parent.document).append(str);
            scrollToTab($('.J_menuTab.active', parent.document));
        }
        return false;
    }
}
