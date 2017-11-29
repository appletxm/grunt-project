'use strict';
var myTime={
	serverAddress: SYS_VAR.SERVER_ADDRESS,
	ajax: null,
	messageBox: null,
	popWindow: null,

	timeSwitchStatus: 0,  //1:open, 0:close
	timeSwitcher: null,
	timeChooser: null,

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		this.popWindow = new PopWindow();
		this.getDisturbTime();
		this.attachEvent();
	},

	getDisturbTime: function(){
		var param = {
			sendParameters:{}
		};

		param.url = this.serverAddress + 'doc/get_disturb/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.hanlderGetStatusSuccess.bind(this);
		param.onError = this.hanlderGetStatusError.bind(this);
		param.mssage = this.msessageBox;

		this.ajax.send(param);

		// this.hanlderGetStatusSuccess({
		// 	code: 0,
		// 	msg: '成功',
		// 	data: [{
		// 		'beginTime'	: 1301618374929,
		// 		'endTime'	: 1301619374929,
		// 	}]
		// });
	},

	hanlderGetStatusSuccess:function(responseText){
		if(responseText.code === 0 || responseText.code === '0'){
			if (responseText.data) {
				this.showTimeStatus(responseText.data[0]);
			} else {
				this.showTimeStatus();
			}
		}else{
			this.hanlderGetStatusError();
		}
	},

	showTimeStatus: function(data){

		//close time set
		if(data){
			if(data.beginTime === 0 || data.beginTime === '0' || data.beginTime === null || data.beginTime === undefined || data.beginTime === '' && data.endTime === 0 || data.endTime === '0' || data.endTime === null || data.endTime === undefined || data.endTime === ''){
				this.toggleTimeSwitch(false);
				this.timeSwitchStatus = 0;
			}else{
				this.toggleTimeSwitch(true);
				this.timeSwitchStatus = 1;
				this.setChooser(data);
			}
		}else{
			this.setChooser(data);
			this.toggleTimeSwitch(false);
			this.timeSwitchStatus = 0;
		}
	},

	setChooser: function(data){
		// 赋值已设置的时间
		// 设置默认值
		if(data){
			document.querySelector('#startTime').value = data['beginTime'];
			document.querySelector('#endTime').value = data['endTime'];
		}else{
			document.querySelector('#startTime').value = '22:00';
			document.querySelector('#endTime').value = '08:00';
		}
	},

	hanlderGetStatusError: function (responseText) {
		this.toggleTimeSwitch(false);
	},

	toggleTimeSwitch:function(flog){
		var input;

		this.timeSwitcher = document.querySelector('#timeSwitch');
		this.timeChooser = document.querySelector('#timeChoose');

		input = this.timeSwitcher.querySelectorAll('input')[0];

		if(flog){
			this.timeSwitcher.className = 'animate-check';
			this.timeChooser.style.display = 'block';
			input.value = 1;
			this.timeSwitchStatus = 1;
		}else{
			this.timeSwitcher.className = 'animate-check close';
			this.timeChooser.style.display = 'none';
			input.value = 0;
			this.timeSwitchStatus = 0;
		}
	},

	attachEvent: function(){
		var timePanel = document.querySelector('#myTimepanel'),
			saveBtn   = document.querySelector('#save');

		timePanel.addEventListener('click', function(event){
			this.handleClick(event);
		}.bind(this));

		saveBtn.addEventListener('click', this.doSetTime.bind(this));
	},

	handleClick: function(event){
		var target = event.target;
		var label = target.tagName.toLowerCase();

		if(label === 'span' || label === 'b'){
			this.doToggleTime();
		}

		event.preventDefault();
	},

	doToggleTime:function(){
		var input = this.timeSwitcher.querySelectorAll('input')[0];

		this.timeSwitchStatus = parseInt(input.value, 10);
		this.timeSwitchStatus = (this.timeSwitchStatus === 1) ? 0 : 1;
		input.value			  = this.timeSwitchStatus;

		this.toggleTimeSwitch(this.timeSwitchStatus === 1);
	},

	doSetTime: function(){
		var startTime = document.querySelector('#startTime').value ? document.querySelector('#startTime').value : 0;
		var endTime = document.querySelector('#endTime').value ? document.querySelector('#endTime').value : 0;

		var param = {
			sendParameters:{}
		};

		param.sendParameters.operate   = this.timeSwitchStatus;
		param.sendParameters.beginTime = startTime;
		param.sendParameters.endTime   = endTime;

		param.url		= this.serverAddress + 'doc/set_disturb/';
		param.type		= 'GET';
		param.asyn		= true;
		param.onSuccess	= this.hanlderSaveTimeSuccess.bind(this);
		param.onError	= this.hanlderSaveTimeError.bind(this);
		param.mssage	= this.msessageBox;

		if(this.timeSwitchStatus === 1){
			if(startTime !== 0 && endTime !== 0){
				this.ajax.send(param);
			}else{
				this.messageBox.show({
					msg		  : '请设置完成开始时间和结束时间后保存！',
					type	  :'alert',
					autoClose : true
				});
			}
		}else{
			this.ajax.send(param);
		}

		// this.hanlderSaveTimeSuccess({
		// 	code : 0,
		// 	msg  : '成功',
		// 	data : []
		// });
	},

	hanlderSaveTimeSuccess: function(data){
		if(data.code === 0 || data.code === '0'){
			this.messageBox.show({
				msg		  : '保存成功',
				type	  :'alert',
				autoClose : true
			});
			setTimeout(this.closeWindow, 500);
		}else{
			this.hanlderSaveTimeError(data);
		}
	},

	hanlderSaveTimeError: function(data){
		this.messageBox.show({
			msg		  : data.msg || '保存勿扰时间失败，请重试',
			type	  :'alert',
			autoClose : true
		});
	},

	closeWindow: function(){
		// window.close();
		WeixinJSBridge.call("closeWindow");
	}
};

myTime.init();
