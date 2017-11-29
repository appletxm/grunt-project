var timeFormat = {
	pageObj: null,

	init: function (params) {
		if (params) {
			this.pageObj = params.pageObj;
		}

		this.formatTime = new FormatTime();
	},

	getTimeText: function(times) {
		var currentDate = new Date();
		var messageTime = this.formatTime.getString(times).time;
		var currentTime = this.formatTime.getString(currentDate.getTime()).time;
		var dateStr;
		var oneM = 60*1000;
		var oneMtoOneH = 60*oneM;
		var beforeYesterday = 24*oneMtoOneH;
		var days30 = 30*24*oneMtoOneH;
		var timeGap = currentDate.getTime() - times;
		var yearGap = currentTime.year - messageTime.year;
		var monthDayStr = messageTime.month + '月' + messageTime.day + '日' + messageTime.hour + ':' + messageTime.minute;

		if(timeGap <= oneM){
			dateStr = '刚刚';
		}else if(timeGap > oneM && timeGap <= oneMtoOneH){
			dateStr = Math.floor(timeGap/1000/60) + '分钟前';
		}else if(timeGap > oneMtoOneH && timeGap <= beforeYesterday){
			dateStr = Math.floor(timeGap/1000/60/60) + '小时前';
		}else if(timeGap > beforeYesterday && timeGap <= days30){
			dateStr = Math.floor(timeGap/1000/60/60/24) + '天前';
		}else if(yearGap === 0){
			dateStr = Math.abs(currentTime.month - messageTime.month) + '月前';
		}else if(yearGap > 1) {
			dateStr = yearGap + '年前';
		}else{
			dateStr = messageTime.year + '年' + monthDayStr;
		}

		return dateStr;
	}
};