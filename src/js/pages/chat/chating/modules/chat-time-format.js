var chatTimeFormat = {
	pageObj: null,

	init: function (params) {
		if (params) {
			this.pageObj = params.pageObj;
		}

		this.formatTime = new FormatTime();
	},

	/*formatTime: function(times){
		var dateStr = '';
		var timeObj = {};
		var date = new Date();
		var month, day, hour, minute, second;

		date.setTime(parseInt(times, 10));

		month = (date.getMonth() + 1);
		month = month < 10 ? ('0' + month) : month;

		day = date.getDate();
		day = day < 10 ? ('0' + day) : day;

		hour = date.getHours();
		hour = hour < 10 ? ('0' + hour) : hour;

		minute = date.getMinutes();
		minute = minute < 10 ? ('0' + minute) : minute;

		second = date.getSeconds();
		second = second < 10 ? ('0' + second) : second;

		dateStr += date.getFullYear() + '-' + month +'-'+ day + ' ' + hour + ':' + minute + ':' + second;

		timeObj.year = date.getFullYear();
		timeObj.month = date.getMonth();
		timeObj.day = date.getDate();
		timeObj.hour = date.getHours();
		timeObj.minute = date.getMinutes();
		timeObj.second = date.getSeconds();

		return {
			dateStr: dateStr,
			time: timeObj
		};
	},*/

	getTimeText: function(times) {
		var currentDate = new Date();
		var messageTimeObj = this.formatTime.getString(times);
		var currentTimeObj = this.formatTime.getString(currentDate.getTime())
		var messageTime = messageTimeObj.time;
		var currentTime = currentTimeObj.time;
		var dateStr;
		var twoM = 2*60*1000;
		var twoMto24H = 24*(60*60*1000);
		var beforeYesterday = 2*twoMto24H;
		var beforeBeforeYesterday= 3*twoMto24H;
		var timeGap = currentDate.getTime() - times;
		var yearGap = currentTime.year - messageTime.year;
		var monthDayStr = (messageTime.month + 1) + '月' + messageTime.day + '日' + messageTime.hour + ':' + messageTime.minute;

		//alert(currentTimeObj.dateStr + ' : ' + messageTimeObj.dateStr);

		if(timeGap <= twoM){
			dateStr = '';
		}else if(timeGap > twoM && timeGap <= twoMto24H){
			if(currentTime.day - messageTime.day === 1){
				dateStr = '昨天 ' + messageTime.hour + ':' + messageTime.minute;
			}else{
				dateStr = messageTime.hour + ':' + messageTime.minute;
			}
		}else if(timeGap > twoMto24H && timeGap <= beforeYesterday){
			if(currentTime.day - messageTime.day === 2){
				dateStr = '前天 ' + messageTime.hour + ':' + messageTime.minute;
			}else{
				dateStr = '昨天 ' + messageTime.hour + ':' + messageTime.minute;
			}
		}else if(timeGap > beforeYesterday && timeGap <= beforeBeforeYesterday){
			if(currentTime.day - messageTime.day >= 3){
				dateStr = monthDayStr;
			}else{
				dateStr = '前天 ' + messageTime.hour + ':' + messageTime.minute;
			}
		}else if(yearGap === 0){
			dateStr = monthDayStr;
		}else if(yearGap === 1){
			dateStr = '去年 ' + monthDayStr;
		}else if(yearGap === 2) {
			dateStr = '前年 ' + monthDayStr;
		}else{
			dateStr = messageTime.year + '年' + monthDayStr;
		}

		return dateStr;
	}
};