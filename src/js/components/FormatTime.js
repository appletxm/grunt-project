var FormatTime = function(){
	this.getString = function(times) {
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

		dateStr += date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;

		timeObj.year = date.getFullYear();
		timeObj.month = date.getMonth();
		timeObj.day = date.getDate();
		timeObj.hour = date.getHours();
		timeObj.minute = date.getMinutes();
		timeObj.second = date.getSeconds();

		return {
			dateStr: dateStr,
			time: timeObj
		}
	};
};
