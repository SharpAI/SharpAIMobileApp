moment.defineLocale('zh-cn', {  
    months : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),  
    monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),  
    weekdays : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),  
    weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),  
    weekdaysMin : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),  
    longDateFormat : {  
        LT : 'Ah点mm分',  
        LTS : 'Ah点m分s秒',  
        L : 'YYYY-MM-DD',  
        LL : 'YYYY年MMMD日',  
        LLL : 'YYYY年MMMD日Ah点mm分',  
        LLLL : 'YYYY年MMMD日ddddAh点mm分',  
        l : 'YYYY-MM-DD',  
        ll : 'YYYY年MMMD日',  
        lll : 'YYYY年MMMD日Ah点mm分',  
        llll : 'YYYY年MMMD日ddddAh点mm分'  
    },  
    meridiemParse: /Late night|Morning|Morning|Noon|Afternoon|Night/,  
    meridiemHour: function (hour, meridiem) {  
        if (hour === 12) {  
            hour = 0;  
        }  
        if (meridiem === 'Late night' || meridiem === 'Morning' ||  
                meridiem === 'Morning') {  
            return hour;  
        } else if (meridiem === 'Afternoon' || meridiem === 'Night') {  
            return hour + 12;  
        } else {  
            // '中午'  
            return hour >= 11 ? hour : hour + 12;  
        }  
    },  
    meridiem : function (hour, minute, isLower) {  
        var hm = hour * 100 + minute;  
        if (hm < 600) {  
            return 'Late night ';  
        } else if (hm < 900) {  
            return 'Morning ';  
        } else if (hm < 1130) {  
            return 'Morning ';  
        } else if (hm < 1230) {  
            return 'Noon ';  
        } else if (hm < 1800) {  
            return 'Afternoon ';  
        } else {  
            return 'Night ';  
        }  
    },  
    calendar : {  
        sameDay : function () {  
            return this.minutes() === 0 ? '[Today]Ah[]' : '[Today]LT';  
        },  
        nextDay : function () {  
            return this.minutes() === 0 ? '[Tomorrow]Ah[]' : '[Tomorrow]LT';  
        },  
        lastDay : function () {  
            return this.minutes() === 0 ? '[Yesterday]Ah[]' : '[Yesterday]LT';  
        },  
        nextWeek : function () {  
            var startOfWeek, prefix;  
            startOfWeek = moment().startOf('week');  
            prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[Next]' : '[This]';  
            return this.minutes() === 0 ? prefix + 'dddAh ' : prefix + 'dddAh minutes';  
        },  
        lastWeek : function () {  
            var startOfWeek, prefix;  
            startOfWeek = moment().startOf('week');  
            prefix = this.unix() < startOfWeek.unix()  ? '[Last]' : '[This]';  
            return this.minutes() === 0 ? prefix + 'dddAh' : prefix + 'dddAh minutes';  
        },  
        sameElse : 'LL'  
    },  
    ordinalParse: /\d{1,2}(Day|Month|Week)/,  
    ordinal : function (number, period) {  
        switch (period) {  
        case 'd':  
        case 'D':  
        case 'DDD':  
            return number + ' Day';  
        case 'M':  
            return number + ' Month';  
        case 'w':  
        case 'W':  
            return number + ' Week';  
        default:  
            return number;  
        }  
    },  
    relativeTime : {  
        future : '%s',  
        past : '%s ago',  
        s : ' seconds',  
        m : '1 minute',  
        mm : '%d minutes',  
        h : '1 hour',  
        hh : '%d hours',  
        d : '1 day',  
        dd : '%d days',  
        M : '1 month',  
        MM : '%d months',  
        y : '1 year',  
        yy : '%d years'  
    },  
    week : {  
        // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效  
        dow : 1, // Monday is the first day of the week.  
        doy : 4  // The week that contains Jan 4th is the first week of the year.  
    }  
});  
get_diff_time = function(dateTimeStamp){
var minute = 1000 * 60;
var hour = minute * 60;
var day = hour * 24;
var halfamonth = day * 15;
var month = day * 30;
var now = new Date().getTime();
var diffValue = now - dateTimeStamp;
if(diffValue < 0){return;}
var monthC =diffValue/month;
var weekC =diffValue/(7*day);
var dayC =diffValue/day;
var hourC =diffValue/hour;
var minC =diffValue/minute;
if(monthC>=1){
    if(parseInt(monthC) >= 12)
        result="1 year ago";
    else
        result="" + parseInt(monthC) + " months ago";
}
else if(weekC>=1){
    result="" + parseInt(weekC) + " weeks ago";
}
else if(dayC>=1){
    result=""+ parseInt(dayC) +" days ago";
}
else if(hourC>=1){
    result=""+ parseInt(hourC) +" hours ago";
}
else if(minC>=1){
    result=""+ parseInt(minC) +" minutes ago";
}else
result=" Just ";
return result;
};

format_date = function(val, format){
  var now = null;
  try{now = new Date(val);}catch(ex){return val;}
  var o = {
      "M+": now.getMonth() + 1,  //month
      "d+": now.getDate(),     //day
      "h+": now.getHours(),    //hour
      "m+": now.getMinutes(),  //minute
      "s+": now.getSeconds(), //second
      "q+": Math.floor((now.getMonth() + 3) / 3),  //quarter
      "S": now.getMilliseconds() //millisecond
  };

  if (/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, (now.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
      if (new RegExp("(" + k + ")").test(format)) {
          format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
      }
  }
  return format;
};

get_diff_time2 = function(curTime,lastTime){
lastTime = lastTime || 0;
var minute = 1000 * 60;
var hour = minute * 60;
var day = hour * 24;
var halfamonth = day * 15;
var month = day * 30;
var diffValue = curTime - lastTime;
var result = {
    isShow: false
}
if(diffValue < 0){return;}
if(diffValue > 5*minute){
    result.isShow = true;
    result.time = getTimeStr(curTime);
    result.lastTime = curTime;
}
return result;
};
function getTimeStr(dateTimeStamp){
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var halfamonth = day * 15;
    var month = day * 30;
    var now = new Date().getTime();
    var diffValue = now - dateTimeStamp;
    if(isToday(dateTimeStamp)){
        return moment(dateTimeStamp).format("ahh:mm");
    }else if(isYesterday(dateTimeStamp)){
        return ' yesterday '+moment(dateTimeStamp).format("ahh:minutes");
    }else if(isWithinAweek(dateTimeStamp)){
        return moment(dateTimeStamp).format('ddd ahh:mm');
    }else if(isCurYear(dateTimeStamp)){
        return moment(dateTimeStamp).format('MMMD day ahh:minutes');
    }else {
        return moment(dateTimeStamp).format('ll ahh:minutes');
    }
    
}
function isToday(dateTimeStamp){
    var today = moment();
    if(moment(dateTimeStamp).isSame(today,'day')){
        return true;
    }
    return false;
}
function isYesterday(dateTimeStamp){
    var yesterday = moment().subtract(1, 'day');
    if(moment(dateTimeStamp).isSame(yesterday,'day')){
        return true;
    }
    return false;
}
function isWithinAweek(dateTimeStamp){
    var A_WEEK_OLD = moment().subtract(7, 'days').startOf('day');
    if(moment(dateTimeStamp).isAfter(A_WEEK_OLD,'day')){
        return true;
    }
    return false;
}
function isCurYear(dateTimeStamp){
    if(moment(dateTimeStamp).isSame(moment(),'year')){
        return true;
    }
    return false;
}