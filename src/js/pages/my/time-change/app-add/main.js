
var myTimeAppAdd={
	serverAddress: SYS_VAR.SERVER_ADDRESS,
	ajax: null,
	messageBox: null,
	popWindow: null,
	currentEditTimeObj: null,
	timeSlideStartTime: null,
	timeSlideEndTime: null,

	readyTimeList: [],
	workTime:{},

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		this.timeSlideStartTime = new TimeSlide();
		this.timeSlideEndTime = new TimeSlide();
		this.popWindow = new PopWindow();

		this.timeSlideStartTime.init({
			triggerTouchObj: document.querySelectorAll('#startTime .slide-panel')[0],
			width: 50,
			scrollCell: 50,
			fastSkip: 5,
			timeFormat: '00:00',
			timeStep: 5,
			showTimeSize: 5
		});

		this.timeSlideEndTime.init({
			triggerTouchObj: document.querySelectorAll('#endTime .slide-panel')[0],
			width: 50,
			scrollCell: 50,
			fastSkip: 5,
			timeFormat: '00:00',
			timeStep: 5,
			showTimeSize: 5
		});

		this.getDoctorTime();
		this.attachEvent();
	},

	getDoctorTime: function(){
		var param = {
			sendParameters:{}
		};
		param.url = this.serverAddress + 'doc/time_list';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetTimeSuccess.bind(this);
		param.onError = this.handleError.bind(this);
		param.mssage = this.msessageBox;

		this.ajax.send(param);

		/*this.handleGetTimeSuccess({
			"code": 0,
			"msg": "成功",
			"data": [
				{
					"cloudWorkTime": [
						{
							"workId": 17864,
							"weekIndex": 3,
							"work": "10:00-11:30;13:00-13:30;14:30-15:30"
						},
						{
							"workId": 17864,
							"weekIndex": 4,
							"work": "18:00-19:00;21:00-22:00"
						}
					]
				}
			]
		});*/
	},

	handleGetTimeSuccess:function(responseText){
		if(responseText.code === 0 || responseText.code === '0'){
			this.readyTimeList = responseText.data[0]['cloudWorkTime'];
		}
	},

	handleError: function(responseText){
		var msg = responseText.msg;

		if(msg || msg === ''){
			msg = '网络异常，请稍后再试。';
		}
		this.messageBox.show({
			msg: msg,
			type:'alert',
			autoClose: true
		});
	},

	handleClick: function(event){
		var target = event.target;
		var label = target.tagName.toLowerCase();

		if(label === 'dt'){
			target = target.parentNode;
		}
		if(label === 'dd'){
			target = target.parentNode;
		}
		if(target.getAttribute('for') === 'week'){
			this.showWeekChooseBox();
		}else if(target.getAttribute('for') === 'time'){
			this.showSetTimeBox(document.querySelector('#timeText'));
		}

		event.preventDefault();
	},

	showWeekChooseBox: function(){
		var param = {
			buttons: [],
			space: {}
		};

		param.needMask = true;
		param.space = {
			height: 310
		};

		param.title = '请选择出诊日期';
		param.content = this.getWeekendHtml();
		param.buttons.push(
			{
				text: '取 消',
				css: 'cancel x1',
				callback: 'myTimeAppAdd.cancelChooseWeekCallback()'
			}
		);

		this.popWindow.show(param);
	},

	showSetTimeBox: function(timeObj){
		var timeString;
		var split;
		var startTime;
		var endTime;

		if((/^\d{2}:\d{2}-\d{2}:\d{2}$/).test(timeObj.innerHTML)){
			timeString = timeObj.innerHTML;
		}else{
			timeString = '00:00-00:00';
		}
		split = timeString.split('-');
		startTime = split[0];
		endTime = split[1];

		this.currentEditTimeObj = timeObj;

		this.timeSlideStartTime.params.timeFormat = startTime;
		this.timeSlideEndTime.params.timeFormat = endTime;
		this.timeSlideStartTime.getFormat(startTime);
		this.timeSlideEndTime.getFormat(endTime);
		this.timeSlideStartTime.setDefaultValue();
		this.timeSlideEndTime.setDefaultValue();

		document.querySelector('#userTimePanel').style.display = 'block';
	},

	handleTimePopClick: function(event){
		var target = event.target;
		var label = target.tagName.toLowerCase();

		if(label === 'a' && target.className.indexOf('close-pop') >=0){
			this.hideTimePop();
		}
		if(label === 'input' && target.getAttribute('id').indexOf('resetTime') >=0){
			this.resetTimePop();
		}
		if(label === 'input' && target.getAttribute('id').indexOf('keepTime') >=0){
			this.setTimeToList();
		}
	},

	hideTimePop: function(){
		document.querySelector('#userTimePanel').style.display = 'none';
	},

	resetTimePop: function(){
		this.timeSlideStartTime.resetTimePanel();
		this.timeSlideEndTime.resetTimePanel();
	},

	setTimeToList: function(){
		var start = this.timeSlideStartTime.currentTime;
		var end = this.timeSlideEndTime.currentTime;
		var obj = this.currentEditTimeObj;
		var timeString;

		var startH = (start.hours < 10) ? '0' + start.hours : start.hours;
		var startM = (start.minutes < 10) ? '0' + start.minutes : start.minutes;
		var endH = (end.hours < 10) ? '0' + end.hours : end.hours;
		var endM = (end.minutes < 10) ? '0' + end.minutes : end.minutes;

		if((startH + ':' + startM) > (endH + ':' + endM)){
			this.messageBox.show({
				msg: '开始时间不能大于结束时间',
				type:'alert',
				autoClose: true
			});

			return false;
		}

		timeString =  startH + ':' + startM + '-' + endH + ':' + endM;

		this.workTime.workTime = timeString;
		obj.innerHTML = timeString;
		this.hideTimePop();
	},

	getWeekendHtml: function(){
		var html = [];
		var weeks = ['星期一', '星期二', '星期三', '星期四','星期五', '星期六', '星期日'];

		html.push('<ul class="mask-time" style="display: block;">');
		for(var i=0; i<7; i++){
			html.push('<li value="' + (i + 1) + '" onclick="myTimeAppAdd.selectWeek(event);">' + weeks[i] + '</li>');
		}
		html.push('</ul>');

		return html.join('');
	},

	selectWeek: function(event){
		var li = event.currentTarget;

		document.querySelector('#weekText').innerHTML = li.innerHTML;
		this.workTime.weekIndex = parseInt(li.getAttribute('value'), 10);
		this.cancelChooseWeekCallback();
	},

	cancelChooseWeekCallback: function(){
		this.popWindow.hide();
	},

	checkTimeHasBeenAdded: function(){
		var list = this.readyTimeList;
		var workTime = this.workTime;
		var isConflicted = false;

		for(var i=0; i<list.length; i++){
			if(list[i].weekIndex === workTime.weekIndex){

				if(list[i].work.indexOf(workTime.workTime) >= 0){
					isConflicted = true;
					break;
				}
			}
		}

		return isConflicted;
	},

	doValidate: function(){
		var res = {};

		if(!this.workTime.weekIndex){
			res.msg = '请选择出诊日期';
			res.status = false;
			return res;
		}

		if(!this.workTime.workTime){
			res.msg = '请选择出诊时间';
			res.status = false;
			return res;
		}

		if(this.checkTimeHasBeenAdded()){
			res.msg = '选择的时间点与已经有时间点冲突，请重新选择';
			res.status = false;
			return res;
		}

		return {
			msg: '',
			status: true
		};
	},

	doSaveNewTime: function(){
		var param = {
			sendParameters:{}
		};
		var validateRes;

		validateRes = this.doValidate();

		if(validateRes.status === false){
			this.messageBox.show({
				msg: validateRes.msg,
				type:'alert',
				autoClose: true
			});
			return false;
		}

		param.sendParameters.sendTime = new Date().getTime();
		param.sendParameters = this.workTime;

		param.url = this.serverAddress + 'doc/add_cloud_time';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleSaveTimeSuccess.bind(this);
		param.onError = this.handleSaveTimeError.bind(this);
		//param.mssage = this.msessageBox;

		this.showLoading();

		this.ajax.send(param);

		/*this.handleSaveTimeSuccess({
			data: [],
			msg: "success",
			code: 0
		});*/
	},

	handleSaveTimeSuccess: function(responseText){
		if(responseText.code === 0 || responseText.code === '0'){
			window.location.href = 'my-time-change-app.html';
		}else{
			this.handleSaveTimeError(responseText);
		}
	},

	handleSaveTimeError: function(responseText){
		this.messageBox.show({
			msg:responseText.msg || '保存出诊时间失败，请重试',
			type:'alert', 
			autoClose: true
		});
	},

	showLoading: function(){
		this.messageBox.show({
			msg:'<span class="fa fa-spinner fa-pulse fa-2x fa-fw"></span>',
			type:'loading',
			autoClose: false
		});
	},

	hideLoading: function(){
		this.messageBox.hide();
	},

	attachEvent: function(){
		var timePanel = document.querySelector('#baiyuTime');
		var slideTimePanel = document.querySelector('#userTimePanel');
		var saveBut = document.querySelector('#saveTime');

		timePanel.addEventListener('click', function(event){
			this.handleClick(event);
		}.bind(this));

		slideTimePanel.addEventListener('click', function(event){
			this.handleTimePopClick(event);
		}.bind(this));

		saveBut.addEventListener('click', function(event){
			this.doSaveNewTime();
		}.bind(this));
	}
};

myTimeAppAdd.init();