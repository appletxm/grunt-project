var chatControlPanel = {
	messageBox: null,
	ajax: null,
	popWindow: null,

	pageObj: null,
	callbackFunctions:{},

	recordTimer:{
		triggerTimer: 0,
		maxTimeLength: 30,
		step: 1,
		count: 0,
		countTimer: 0
	},

	init: function (params) {
		if (params) {
			this.ajax = params.pageObj.ajax;
			this.messageBox = params.pageObj.messageBox;
			this.popWindow = params.pageObj.popWindow;
			this.pageObj = params.pageObj;
		}

		this.attachEvent();
	},

	handleControlPanelClick: function(event){
		var target = event.target;
		var label = target.tagName.toLowerCase();
		var eventStr = target.getAttribute('event');

		if(label === 'a' && eventStr === 'openExternal'){
			this.handleExtPanelToggle(event);

		}else if(label === 'a' && eventStr === 'sendMsg'){
			this.handleSendMsg(event);

		}else if(label === 'a' && eventStr === 'openAudio'){
			this.handleAudioPanelToggle(event, true);

		}else if(label === 'a' && eventStr === 'closeAudio'){
			this.handleAudioPanelToggle(event, false);

		}else if(label === 'a' && eventStr === 'recommendMedical'){
			chatRecommend.doRecommondMedical();

		}else if(label === 'a' && eventStr === 'markInformation'){
			chatMarkPatientInfo.doMarkPatientInfo();

		}else if(label === 'a' && eventStr === 'sendImage'){
			chatMessageImage.chooseImageFile();

		}else if(label === 'a' && eventStr === 'recommendPrescription'){
			chatRecommend.skipPageToDoRecommend('templates/prescriptions/prescriptions-recommend.html');
		}
	},

	handleAudioPanelTouchStart: function(event){
		this.clearStartTimer();

		this.recordTimer.countTimer = setInterval(function(){
			this.recordTimer.count ++;
			if(this.recordTimer.count >= this.recordTimer.maxTimeLength){
				this.clearStartTimer();
				this.startRecord(event.currentTarget);
			}
		}.bind(this), this.recordTimer.step);


		event.stopPropagation();
		event.preventDefault();
	},

	handleAudioPanelTouchEnd: function(event){
		this.clearStartTimer();

		if(chatMessageAudio.isDoingRecord === true){
			this.endRecord(event.currentTarget);
		}

		event.stopPropagation();
		event.preventDefault();
	},

	startRecord: function(target){
		if(chatMessageAudio.isDoingRecord === false) {
			chatMessageAudio.startRecord(target);
		}
	},

	endRecord: function(target){
		chatMessageAudio.endRecord(target);
	},

	handleSendMsg: function(event){
		var input = document.querySelector('#msgText');
		var eventInput = {target: input};
		this.pageObj.doSendTextMessage(event, input, function(){
			this.toggleTextMsgOpt(eventInput);
		}.bind(this));
		//this.pageObj.doSendTextMessage(event, document.querySelector('#msgText'));

		setTimeout(function(){
			this.afterSendMessageScroll();
		}.bind(this), 50);

		event.stopPropagation();
	},

	handleExtPanelToggle: function(event){
		this.toggleExternalOpt();
		//this.toggleAudioOpt(false, true);

		event.stopPropagation();
	},

	handleAudioPanelToggle: function(event, flag){
		this.toggleAudioOpt(flag);

		event.stopPropagation();
	},

	toggleExternalOpt: function(isShowPanel){
		var chatPanel;

		chatPanel = document.querySelector('#chatMain');

		if(isShowPanel !== true  && isShowPanel !== false){
			if(chatPanel.className.indexOf('chat-show-external') >= 0){
				isShowPanel = false;
			}else{
				isShowPanel = true;
			}
		}

		chatPanel.className = isShowPanel === false ? 'chat-main' : 'chat-main chat-show-external';
	},

	toggleTextMsgOpt: function(event){
		var addBut = document.querySelectorAll('#chatControlPanel a[event="openExternal"]')[0];
		var sendBut = document.querySelector('#sendMsg');
		var needSendBut = false;

		if(!event.target.value || event.target.value === ''){
			needSendBut = false;
		}else{
			needSendBut = true;
		}

		addBut.style.display = needSendBut === true ? 'none' : 'block';
		sendBut.style.display = needSendBut === true ? 'block' : 'none';

		//this.toggleExternalOpt(false);
	},

	toggleAudioOpt: function(isShowPanel, isOpenExtPanel){
		var panel, audioPanel, input, openAudioBut;

		panel = document.querySelector('#chatControlPanel');
		input = panel.querySelector('#msgText');
		audioPanel = panel.querySelector('#audioOptPanel');
		openAudioBut = document.querySelectorAll('#chatControlPanel a[event="openAudio"]')[0];

		audioPanel.style.display = isShowPanel === true ? 'block' : 'none';

		if(isShowPanel === false){
			input.style.display = 'inline';
			openAudioBut.style.display = 'inline';

			if(isOpenExtPanel !== true){
				input.focus();
			}
		}else{
			input.style.display = 'none';
			openAudioBut.style.display = 'none';
		}

		if(isShowPanel === true){
			this.toggleExternalOpt(false);
		}
	},

	toggleRecordPanel: function(target){
		if(!target){
			target = document.querySelector('#audioRecordButton');
		}

		target.className = chatMessageAudio.isDoingRecord === true ? 'selected' : '';
		target.innerHTML = chatMessageAudio.isDoingRecord === true ? '松开 结束' : '按住 说话';
	},

	afterSendMessageScroll: function(){
		this.pageObj.scrollToMsg();
		/*setTimeout(function(){
			document.querySelector('#msgText').focus();
		}, 1000);*/
	},

	clearStartTimer: function(){
		clearTimeout(this.recordTimer.triggerTimer);
		clearTimeout(this.recordTimer.countTimer);
		this.recordTimer.count = 0;
	},

	writeLog: function(log){
		//TODO just for test touch event
		var logPanel;
		var span;

		if(document.querySelector('#logPanel')){
			logPanel = document.querySelector('#logPanel');
		}else{
			logPanel = document.createElement('div');
			logPanel.setAttribute('id', 'logPanel');
			logPanel.setAttribute('style', 'background: #fff; position: fixed; top:0;  bottom: 150px; overflow:auto; left:0; right:0; opacity:0.8; z-index: 30; font-size: 12px; line-height: 18px;');
			document.querySelectorAll('body')[0].appendChild(logPanel);
		}

		span = document.createElement('span');
		span.innerHTML = '<p>' + log + '</p>';
		logPanel.appendChild(span);
	},

	attachEvent: function(){
		var controlPanel = document.querySelector('#chatControlPanel');
		var audioRecordButton = document.querySelector('#audioRecordButton');
		var inputBox = document.querySelector('#msgText');

		controlPanel.addEventListener('touchstart', function(event){
			this.handleControlPanelClick(event);
		}.bind(this));

		audioRecordButton.addEventListener('touchstart', function(event){
			this.handleAudioPanelTouchStart(event);
		}.bind(this));

		/*audioRecordButton.addEventListener('touchmove', function(event){
			this.handleAudioPanelTouchEnd(event);
		}.bind(this));*/

		audioRecordButton.addEventListener('touchend', function(event){
			this.handleAudioPanelTouchEnd(event);
		}.bind(this));

		inputBox.addEventListener('input', function(event){
			this.toggleTextMsgOpt(event);
		}.bind(this));

		inputBox.addEventListener('focus', function(event){
			this.toggleTextMsgOpt(event);
		}.bind(this));
	}
};