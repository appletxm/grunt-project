
var myTime={
	serverAddress: SYS_VAR.SERVER_ADDRESS,
	ajax: null,
	messageBox: null,
	popWindow: null,

	timeSwitchStatus: 1,  //1:open, 0:close
	timeLength: 0,
	timeSwitcher: null,
	timeChooser: null,
	cutDownTimer:0,

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		this.popWindow = new PopWindow();
		this.getDoctorTimeStatus();
		
		this.attachEvent();
	},

	getDoctorTimeStatus: function(){
		var param = {
			sendParameters:{}
		};

		param.sendParameters.status = 0;
		param.sendParameters.time = 0;
		param.sendParameters.sendTime = new Date().getTime();
		param.sendParameters.action = 'get';


		param.url = this.serverAddress + 'msg_center/h5_api/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.hanlderGetStatusSuccess.bind(this);
		param.onError = this.hanlderGetStatusError.bind(this);
		param.mssage = this.msessageBox;

		this.ajax.send(param);

		/*this.hanlderGetStatusSuccess({
			code: 0,
			msg: '',
			data: [{
				result:[{
					status: 0,
					time: 2100000,
					remainTime: 1800000
				}]
			}]
		});*/
	},

	hanlderGetStatusSuccess:function(responseText){

		if(responseText.code === 0 || responseText.code === '0'){
			this.showTimeStatus(responseText.data[0].result[0]);

			if(responseText.data[0].result[0].status === 0 || responseText.data[0].result[0].status === '0'){
				this.showRemainTime(0);
			}else{
				this.showRemainTime(responseText.data[0].result[0].remainTime);
			}
		}else{
			this.hanlderGetStatusError(responseText);
			this.showRemainTime(0);
		}
	},

	showTimeStatus: function(result){

		if(result.status === 0 || result.status === '0'){ //close time set

			this.toggleTimeSwitch(false);
		}else{
			this.toggleTimeSwitch(true);
			this.setChooser(result.time);
		}
	},

	setChooser: function(time){
		document.querySelector('#showTimeText').innerHTML = (time / 60) / 1000;

	},

	hanlderGetStatusError: function(responseText){
		this.toggleTimeSwitch(true);
	},

	toggleTimeSwitch:function(flog){
		var input;

		this.timeSwitcher = document.querySelector('#timeSwitch');
		this.timeChooser = document.querySelector('#timeChoose');
		this.timeTip = document.querySelector('#timeCutDown');

		input = this.timeSwitcher.querySelectorAll('input')[0];

		if(flog === true){
			this.timeSwitcher.className = 'animate-check';
			this.timeChooser.style.display = 'block';
			this.timeTip.style.display = 'block';
			input.value = 1;
			this.timeSwitchStatus = 1;
		}else{
			this.timeSwitcher.className = 'animate-check close';
			this.timeChooser.style.display = 'none';
			this.timeTip.style.display = 'none';
			input.value = 0;
			this.timeSwitchStatus = 0;
		}
		
	},

	handleClick: function(event){

		var target = event.target;
		var label = target.tagName.toLowerCase();

		if(label === 'span' || label === 'b'){
			this.doToggleTime();
		};

		event.preventDefault();
	},

	handleChange: function(target){
		var time = target.getAttribute("value");

		document.querySelector('#showTimeText').innerHTML = time;

		this.showRemainTime(parseInt(time, 10)*60*1000);
	},

	getTimeListHtml: function(){
		var html = [];

		html.push('<ul class="mask-time" style="display: block;">');
		html.push('<li value="10">10分钟</li>');
		html.push('<li value="15">15分钟</li>');
		html.push('<li value="20">20分钟</li>');
		html.push('<li value="25">25分钟</li>');
		html.push('<li value="30">30分钟</li>');
		html.push('<li value="35">35分钟</li>');
		html.push('<li value="40">40分钟</li>');
		html.push('<li value="45">45分钟</li>');
		html.push('<li value="50">50分钟</li>');
		html.push('<li value="55">55分钟</li>');
		html.push('<li value="60">1小时</li>');
		html.push('<li value="120">2小时</li>');
		html.push('<li value="720">12小时</li>');
		html.push('</ul>');

		return html.join('');
	},

	showTimeList: function(){
		var html = '';
		var param = {
			buttons: [],
			space: {}
		};

		html = this.getTimeListHtml();

		param.needMask = true;
		param.title = '选择出诊时长';
		param.space = {
			top: 100,
			left: 50
		};
		param.contentClickCallback = this.selectedTimeCallback.bind(this);
		param.content = html;
		param.buttons.push(
			{
				text: '取 消',
				css: 'cancel x1',
				callback: 'myTime.closeTimeList()'
			}
		);

		this.popWindow.show(param);
		this.messageBox.hide();
	},

	selectedTimeCallback: function(event){
		var target = event.target;
		var value = '';

		if(target.tagName.toLowerCase() === 'li'){
			this.handleChange(target);
			this.closeTimeList();
		}
	},

	closeTimeList: function(){
		this.popWindow.hide();
	},

	doToggleTime:function(){
		var input = this.timeSwitcher.querySelectorAll('input')[0];

		this.timeSwitchStatus = parseInt(input.value, 10);

		this.timeSwitchStatus = (this.timeSwitchStatus === 1)? 0:1;
		input.value = this.timeSwitchStatus;

		this.toggleTimeSwitch(this.timeSwitchStatus === 1);
	},

	showRemainTime: function(time){
		var cutDownPanel = document.querySelector('#timeCutDown');
		var text = cutDownPanel.querySelectorAll('b')[0];
		var date = new Date();
		var hours = 0;
		var minutes = 0;
		var seconds = 0;

		if(time === 0 || time === '0'){
			text.innerTHTML = '00:00:00';
			cutDownPanel.style.display = 'none';
		}else{
			date.setTime(date.getTime() + time);

			hours = date.getHours();
			minutes = date.getMinutes();
			seconds = date.getSeconds();

			hours = hours < 10 ? ('0' + hours) : hours;
			minutes = minutes < 10 ? ('0' + minutes) : minutes;
			seconds = seconds < 10 ? ('0' + seconds) : seconds;

			text.innerHTML = hours + ':' + minutes + ':' + seconds;

			cutDownPanel.style.display = 'block';
		}
	},

	doSetTime: function(){
		var param = {
			sendParameters:{}
		};
		var time = 0;

		time = document.querySelector('#showTimeText').innerHTML || '0';
		time = parseInt(time, 10);

		if(time === 0){
			this.messageBox.show({
				msg: '请选择出诊时间', 
				type:'alert', 
				autoClose: true
			});

			return false;
		}

		param.sendParameters.status = this.timeSwitchStatus;
		param.sendParameters.time = (this.timeSwitchStatus === 1) ? (time*60*1000) : 0;
		param.sendParameters.sendTime = new Date().getTime();
		param.sendParameters.action = 'set';

		param.url = this.serverAddress + 'msg_center/h5_api/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.hanlderSaveTimeSuccess.bind(this);
		param.onError = this.hanlderSaveTimeError.bind(this);
		param.mssage = this.msessageBox;

		this.ajax.send(param);

		/*this.hanlderSaveTimeSuccess({
			code: 0,
			msg: '',
			data: [{
				result:[{
					status: 1,
					time: 2100000,
					remainTime: 1800000
				}]
			}]
		});*/
	},

	hanlderSaveTimeSuccess: function(responseText){
		var time  = document.querySelector('#showTimeText').innerHTML || '0';

		if(responseText.code === 0 || responseText.code === '0'){
			this.messageBox.show({
				msg: '保存成功', 
				type:'alert', 
				autoClose: true
			});

			if(this.timeSwitchStatus === 1){
				this.showRemainTime(parseInt(time, 10)*60*1000);
			}
			
		}else{
			this.hanlderSaveTimeError(responseText);
		}
		
	},

	hanlderSaveTimeError: function(responseText){
		this.messageBox.show({
			msg:responseText.msg || '保存出诊时间失败，请重试', 
			type:'alert', 
			autoClose: true
		});

		this.showRemainTime(0);
	},

	attachEvent: function(){

		var timePanel = document.querySelector('#myTimepanel');
		var timeChoose = document.querySelector('#timeChoose');
		//var select = timePanel.querySelectorAll('select')[0];
		var but = document.querySelector('#saveTime');

		timePanel.addEventListener('click', function(event){
			this.handleClick(event);
		}.bind(this));

		timeChoose.addEventListener('click', function(event){
			this.showTimeList(event);
		}.bind(this));

		but.addEventListener('click', function(event){
			this.doSetTime(event);
		}.bind(this));
	}
};

myTime.init();