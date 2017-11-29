'use strict';
var myTimeHospital={
	serverAddress: SYS_VAR.SERVER_ADDRESS,
	ajax: null,
	messageBox: null,

	timeSet: {},

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		this.getDoctorTime();

		this.attachEvent();
	},

	getDoctorTime: function(){
		var param = {
			sendParameters:{}
		};

		param.sendParameters.status = 0;
		param.sendParameters.time = 0;
		param.sendParameters.sendTime = new Date().getTime();
		param.sendParameters.action = 'get';


		param.url = this.serverAddress + 'doc/time_list';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetTimeSuccess.bind(this);
		param.onError = this.handleError.bind(this);
		//param.mssage = this.msessageBox;

		this.showLoading();

		this.ajax.send(param);

		/*this.handleGetTimeSuccess({
			"code": 0,
			"msg": "成功",
			"data": [
				{
					"cloudWorkTime": [
						{
							"workId": 17864,
							"weekIndex": 7,
							"work": "09:00-22:00"
						}
					],
					"workTime": [
						{
							"workId": 400,
							"weekIndex": 1,
							"am": 1,
							"pm": 1,
							"night": 0
						},
						{
							"workId": 405,
							"weekIndex": 5,
							"am": 1,
							"pm": 0,
							"night": 1
						}
					]
				}
			]
		});*/
	},

	handleGetTimeSuccess:function(responseText){

		if(responseText.code === 0 || responseText.code === '0'){
			this.showHospitalTime(responseText.data[0]);
			this.hideLoading();
		}else{
			this.handleError(responseText);
		}
	},

	handleError: function(responseText){
		var msg = responseText.msg
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

		if(label === 'i'){
			if(!target.className  || target.className.indexOf('selected') < 0){
				target.className = 'selected';
			}else{
				target.className = '';
			}
		}

		event.preventDefault();
	},

	showHospitalTime: function(data){
		var timeLines = document.querySelectorAll('#hospitalTime .basic-row');

		data.workTime.forEach(function(week){
			var weekIndex = parseInt(week.weekIndex, 10);
			var dayObj = timeLines[weekIndex];
			var timeObj = null;

			if(dayObj){
				timeObj = dayObj.querySelectorAll('i');
				if(week.am === 1){
					timeObj[0].className = 'selected';
				}

				if(week.pm === 1){
					timeObj[1].className = 'selected';
				}

				if(week.night === 1){
					timeObj[2].className = 'selected';
				}
			}
		});
	},

	doSetTime: function(){
		var param = {
			sendParameters:{}
		};
		var saveTimes = [];
		var timeLines = document.querySelectorAll('#hospitalTime .basic-row');
		for(var i = 1; i < timeLines.length; i++){
			var timeObjs = timeLines[i].querySelectorAll('i');
			var timeDay = {
				'weekIndex': i,
				'am': (timeObjs[0].className && timeObjs[0].className.indexOf('selected') >= 0) ? 1:0,
				'pm': (timeObjs[1].className && timeObjs[1].className.indexOf('selected') >= 0) ? 1:0,
				'night': (timeObjs[2].className && timeObjs[2].className.indexOf('selected') >= 0) ? 1:0
			};

			saveTimes.push(timeDay);
		}

		param.sendParameters.sendTime = new Date().getTime();
		param.sendParameters.works = JSON.stringify(saveTimes);

		param.url = this.serverAddress + 'doc/save_work_time';
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
			this.messageBox.show({
				msg: '保存成功',
				type:'alert',
				autoClose: true
			});

		}else{
			this.handleSaveTimeError(responseText);
		}

		setTimeout(function(){
			WeixinJSBridge.call("closeWindow");
		}, 500);
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
		var timePanel = document.querySelector('#hospitalTime');
		var but = document.querySelector('#saveTime');

		timePanel.addEventListener('click', function(event){
			this.handleClick(event);
		}.bind(this));

		but.addEventListener('click', function(event){
			this.doSetTime(event);
		}.bind(this));
	}
};

myTimeHospital.init();