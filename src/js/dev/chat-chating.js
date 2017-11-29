'use strict';

var mockAuthData = {
	code: 0,
	msg: '',
	data: [
		{
			authStatus: 1
		}
	]
};

var chatCheckUserAuth = {
	messageBox: null,
	ajax: null,
	popWindow: null,

	pageObj: null,
	callbackFunctions:{},

	init: function (params) {
		if (params) {
			this.ajax = params.pageObj.ajax;
			this.messageBox = params.pageObj.messageBox;
			this.popWindow = params.pageObj.popWindow;
			this.pageObj = params.pageObj;
		}
	},

	getCheckData:function(params){
		var param = {
			sendParameters:{}
		};

		this.callbackFunctions.successCallback = params.successCallback;
		this.callbackFunctions.errorCallback = params.errorCallback;

		param.url = this.pageObj.requestUrl + 'doc/user_auth_data/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetAuthDataSuccess.bind(this);
		param.onError = this.handleGetAuthData.bind(this);

		this.ajax.send(param);

		//this.handleGetAuthDataSuccess(mockAuthData);
	},

	handleGetAuthDataSuccess: function(responseText){
		if(responseText.code === 0 || responseText.code === '0'){
			this.getUseAuthInfo(responseText.data[0]);
		}else{
			this.handleGetAuthData();
		}
	},

	handleGetAuthData: function(){
		this.pageObj.authStatus = 4;
		if(this.callbackFunctions.errorCallback){
			this.callbackFunctions.errorCallback();
		}
	},

	getUseAuthInfo:function(data){
		if(data){
			this.pageObj.authStatus = parseInt(data.authStatus, 10);
			this.pageObj.authDorctorPhoto = data.photoUrl;

			this.pageObj.doctorInfo.headImg = data.photoUrl;
			this.pageObj.doctorInfo.id = data.doctorId;
			this.pageObj.doctorInfo.name = data.name;
		}

		if(this.callbackFunctions.successCallback){
			this.callbackFunctions.successCallback();
		}

	},

	showNoVerifyTipMessage: function(type){
		var html;
		var skipPage = '../my/my-information.html';

		if(type === 1){
			//recommond
			html = '由于没有通过身份认证，为减少用户的用药风险，您暂时无法使用推荐用药功能。如果您还没有进行过身份认证，建议提交资料进行身份认证。';
		}else if(type === 2){
			//send message
			html = '您尚未通过身份认证审核。如果您还没有进行过身份认证，建议提交资料进行身份认证，以避免医疗咨询风险。';
		}

		if(this.pageObj.authStatus === 0 || this.pageObj.authStatus === 2 || this.pageObj.authStatus === 3){
			skipPage = '../authorization/author-verification.html';
		}

		html = html + '<a class="re-send-msg"  onclick="chatCheckUserAuth.setPageStatus(\'chatStatus\', \'1\');" href="' + skipPage + '">去认证！</a>';
		this.pageObj.sendSysErrorMessage(html);
	},

	setPageStatus: function(key, value){
		window.localStorage.setItem(key, value);
	}

};
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
var chatInitWXAPI = {
	pageObj: null,

	messageBox: null,
	ajax:null,
	popWindow: null,
	wxSDK: null,
	isAPILoadSuccess: false,

	init:function(params) {
		this.wxSDK = new WeixinSDK();

		if (params) {
			//this.ajax = params.pageObj.ajax;
			this.ajax = new Ajax();
			this.messageBox = params.pageObj.messageBox;
			this.popWindow = params.pageObj.popWindow;

			this.pageObj = params.pageObj;
		}
	},

	doInitWXAPI: function(){
		var wxconfig;

		wxconfig = {
			debug: null,
			successCallback: this.wxAPIInitSuccess.bind(this),
			errorCallback: this.wxAPIInitFail.bind(this),
			jsApiList: [
				'startRecord',
				'stopRecord',
				'onVoiceRecordEnd',
				'playVoice',
				'pauseVoice',
				'stopVoice',
				'onVoicePlayEnd',
				'uploadVoice',
				'downloadVoice',

				'chooseImage',
				'previewImage',
				'uploadImage',
				'downloadImage'
			],
			ajax: this.ajax
		};

		this.wxSDK.init(wxconfig);
	},

	wxAPIInitSuccess: function(){
		//this.pageObj.loadPage();

		this.isAPILoadSuccess = true;
		chatMessageAudio.isAPILoadSuccessCallback();
	},

	wxAPIInitFail: function(){
		//this.pageObj.loadPage();
		this.isAPILoadSuccess = false;
	}
};
var chatMarkPatientInfo = {
	pageObj: null,

	messageBox: null,
	ajax:null,
	popWindow: null,

	init:function(params) {
		if (params) {
			this.ajax = params.pageObj.ajax;
			this.messageBox = params.pageObj.messageBox;
			this.popWindow = params.pageObj.popWindow;

			this.pageObj = params.pageObj;
		}
	},

	doMarkPatientInfo: function(){
		var html = [];
		var param = {
			buttons: [],
			space: {}
		};

		param.needMask = true;
		param.space = {
			height: 310,
			left: 10
		};

		html.push('<div class="mark-info-box">');
		html.push('<h1>病情备注<a class="close-pop" onclick="chatMarkPatientInfo.cancelSaveMarkInfo();"></a></h1>');
		html.push('<div class="patient-mark">');
		html.push('<div class="box"><textarea id="patientMarkInfo" placeholder="最多100个字" maxlength="100"></textarea></div>');
		html.push('</div>');
		html.push('<a class="do-save-btn" onclick="chatMarkPatientInfo.doSaveMarkInfo();">确定</a>');
		html.push('</div>');
		param.content = html.join('');

		this.popWindow.show(param);
	},

	doSaveMarkInfo: function(){
		var infoMsg = document.querySelector('#patientMarkInfo').value;
		var res;

		res = this.doValidateInfo(infoMsg);
		if(res.result !== true){
			this.messageBox.show({
				msg: res.msg, //'请输入正确的备注信息'
				type:'alert',
				autoClose: true
			});

			return false;
		}

		var param = {
			sendParameters:{}
		};

		param.sendParameters.patientId = this.pageObj.urlParams['patient_id'];
		param.sendParameters.doctorId = this.pageObj.urlParams['doctor_id'];
		param.sendParameters.content = encodeURIComponent(infoMsg);
		param.url = this.pageObj.requestUrl + 'doc/add_record/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.onSaveMarkInfoSuccess.bind(this);
		param.onError = this.onSaveMarkInfoError.bind(this);

		this.isSavingMsgData = true;

		this.pageObj.showLoading();

		this.ajax.send(param);
	},

	doValidateInfo: function(value){
		if(!value || value === ''){
			return {
				msg:'请输入正确的备注信息',
				result: false
			}
		}

		if(!value.isNormalTextArea(2, 100)){
			return {
				msg:'请将备注信息控制在100字之内',
				result: false
			}
		}

		return {
			msg:'',
			result: true
		}
	},

	cancelSaveMarkInfo: function(){
		this.popWindow.hide();
	},

	onSaveMarkInfoSuccess: function(responseText){

		if(responseText.code === 0 || responseText.code === '0'){
			this.pageObj.hideLoading();
			this.onSaveMarkInfoError({msg: '备注信息添加成功'});
		}else{
			this.onSaveMarkInfoError(responseText);
		}

		this.isSavingMsgData = false;
	},

	onSaveMarkInfoError: function(responseText){
		var msg = responseText.msg;
		if(!msg || msg === ''){
			msg = '网络异常请稍后再试。';
		}
		this.messageBox.show({
			msg: msg,
			type:'alert',
			autoClose: true
		});

		this.isSavingMsgData = false;
		this.cancelSaveMarkInfo();
	}

};
var chatMessageAudio = {
	pageObj: null,

	messageBox: null,
	ajax:null,
	popWindow: null,

	audioInfo:{
		timeLength: 100,
		/*isAPILoadSuccess: true,*/
		timer: 0,
		step: 100,
		localId: null,
		serverId: null
	},

	userPressButtonShortTime: 0,

	isDoingRecord: false,

	playInfo:{
		isPlayingPanel: null,
		isPlaying: false,
		playingAudio: null,
		isEnding: false,
		timer: 0,
		step: 1
	},

	hasTriggered: false,


	init:function(params) {
		if (params) {
			this.ajax = params.pageObj.ajax;
			this.messageBox = params.pageObj.messageBox;
			this.popWindow = params.pageObj.popWindow;

			this.pageObj = params.pageObj;
		}
	},

	isAudioApiOk: function(){
		if(chatInitWXAPI.isAPILoadSuccess !== true){
			this.messageBox.show({
				msg:'微信音频API初如化失败，请刷新页面重试',
				type:'alert',
				autoClose: true
			});

			return false;
		}else{
			return true;
		}
	},

	isAPILoadSuccessCallback: function(){
		//var info = this.audioInfo;
		var self = this;

		wx.onVoiceRecordEnd({
			complete: function (res) {
				this.isDoingRecord = false;

				self.recordOverTime(res);
			}
		});

		wx.onVoicePlayEnd({
			success: function (res) {
				self.stopAudio(2, res.localId);
			}
		});
	},

	triggerAudioFunction: function(){
		//TODO Just fixed the bug for weixin pop enable the audio device or not
		if(this.hasTriggered === false){
			this.hasTriggered = true;
		}
	},

	startRecord: function(target){

		var self = this;

		if(this.isAudioApiOk() === false){
			return false;
		}

		wx.startRecord({
			success: function(res){
				if(res.errMsg === 'startRecord:ok'){
					this.startSuccess(res, target);
				}
			}.bind(self)
		});
	},

	startSuccess: function(res, target){
		var info = this.audioInfo;

		//chatControlPanel.writeLog('startSuccessCallback:' + JSON.stringify(res));

		this.isDoingRecord = true;
		info.localId = null;
		info.serverId = null;

		chatControlPanel.toggleRecordPanel(target);

		info.timeLength = 0;
		clearInterval(info.timer);
		info.timer = setInterval(function(){
			info.timeLength += info.step;
		}.bind(this), info.step);
	},

	endRecord: function(target){
		var self = this;
		var info = this.audioInfo;

		if(this.isAudioApiOk() === false){
			return false;
		}

		clearInterval(info.timer);
		this.isDoingRecord = false;
		chatControlPanel.toggleRecordPanel(target);

		wx.stopRecord({
			success: function (res) {
				if(res.errMsg === 'stopRecord:ok'){
					this.endRecordSuccess(res);
				}
			}.bind(self)
		});
	},

	endRecordSuccess: function(res){
		var self = this;
		var info = this.audioInfo;

		//chatControlPanel.writeLog('endRecordSuccess:' + JSON.stringify(res));

		if(info.timeLength > 59999){
			info.timeLength = 59999;
		}

		info.localId = res.localId;
		self.completeRecord(res);
	},

	recordOverTime: function(res){
		var info = this.audioInfo;

		clearInterval(info.timer);
		this.isDoingRecord = false;
		chatControlPanel.toggleRecordPanel(document.querySelectorAll('#audioOptPanel div')[0]);

		this.endRecordSuccess(res);
	},

	completeRecord: function(){
		var info = this.audioInfo;
		var self = this;

		wx.uploadVoice({
			localId: info.localId, // 需要上传的音频的本地ID，由stopRecord接口获得
			//isShowProgressTips: 1, // 默认为1，显示进度提示
			success: function (res) {
				info.serverId = res.serverId; // 返回音频的服务器端ID
				self.uploadVoiceSuccessCallback();
			}
		});
	},

	uploadVoiceSuccessCallback: function(){
		this.doSendAudioMessage();
		this.pageObj.hideLoading();
	},

	doSendAudioMessage:function(){
		var info = this.audioInfo;

		this.pageObj.combineSendMsgParams('', 4, info.serverId, info.localId, info.timeLength);
	},

	getCellHtml: function(data, baseUrl){
		var content = [];
		var audioStyle = 'audio-msg fa';
		var videoHtml;
		var mediaId = ' media_id="' + (data['content']['media_id'] || '') + '"';
		var localId = ' local_id="' + (data['content']['local_id'] || '') + '"';
		var width;
		var timeLength = data['content']['timeLength'] || 0;

		if(data.relation === 1){
			audioStyle += ' from-doctor stop-play';
		}else{
			audioStyle += ' from-patient stop-play';
		}

		if(timeLength > 100){
			timeLength = Math.ceil(parseInt(timeLength, 10)/1000);
		}
		timeLength = timeLength > 59 ? 59 : timeLength;
		width = (document.documentElement.clientWidth - 130) * (timeLength/59);

		if(data['media_id'] && data['media_id'] !== '' && data['media_id'] !== 'null' && data['media_id'] !== 'undefined'){
			videoHtml = '';
		}else{
			//videoHtml = '<audio controls="controls" reload="preload" src="' + (baseUrl + data.content.path) + '" type="audio/mpeg"></audio>';
			videoHtml = '<audio controls="controls" src="' + (baseUrl + data.content.path) + '" type="audio/mpeg"></audio>';
		}

		content.push('<span ' + mediaId + localId + ' class="audio-outer"' + ' onclick="chatMessageAudio.playOrPauseAudio(event);" style="width:' + (width || 20) + 'px;">');
		content.push('<span class="' + audioStyle + '"><p class="mask"></p></span>');
		content.push('<div class="fix-bug-iso4">')
		content.push(videoHtml);
		content.push('</div>')
		content.push('</span>');
		content.push('<b class="time-length">' + timeLength + '\'\'' + '</b>');

		return content.join('');
	},

	playOrPauseAudio: function(event){
		var panel = event.currentTarget;
		var audio = panel.querySelectorAll('audio')[0];
		var localId = panel.getAttribute('local_id');

		this.stopAllAudiosPlayExceptCurrent(localId, audio, panel);

	},

	playAudio: function(localId, audio, panel){
		var playInfo = this.playInfo;
		var audioIcon = panel.querySelectorAll('span')[0];

		if(localId && localId !=='' && localId !== 'null' && localId !== 'undefined'){
			this.playAudioFromWX(localId);
		}else{
			this.playAudioFromH5(audio);
		}
		playInfo.isPlaying = true;
		playInfo.isPlayingPanel = panel;

		audioIcon.className = audioIcon.className.replace(' stop-play', ' start-play');
	},

	pauseAudio: function(localId, audio, panel){
		var playInfo = this.playInfo;
		var audioIcon = panel.querySelectorAll('span')[0];

		if(localId && localId !=='' && localId !== 'null' && localId !== 'undefined'){
			this.pauseAudioFromWX(localId);
		}else if(playInfo.playingAudio){
			this.pauseAudioFromH5(audio);
		}

		playInfo.isPlaying = false;

		audioIcon.className = audioIcon.className.replace(' start-play', ' stop-play');
	},

	playAudioFromWX: function(localId){
		wx.playVoice({
			localId: localId
		});

		this.playInfo.playingAudio = null;
	},

	pauseAudioFromWX: function(localId){
		wx.pauseVoice({
			localId: localId
		});
	},

	playAudioFromH5: function(audio){
		var playInfo = this.playInfo;

		playInfo.playingAudio = audio;
		audio.play();

		clearInterval(playInfo.timer);
		playInfo.timer = setInterval(function(){
			if(audio.ended === true){
				this.stopAudio(1, audio);
			}
		}.bind(this), playInfo.step);
	},

	pauseAudioFromH5: function(audio){
		var playInfo = this.playInfo;

		playInfo.playingAudio = audio;
		audio.pause();

		clearInterval(playInfo.timer);
	},

	stopAudio: function(type, localIdOrAudio){
		var playInfo = this.playInfo;
		var panel = playInfo.isPlayingPanel;
		var audioIcon = panel.querySelectorAll('span')[0];

		if(type === 1){
			//h5
			clearInterval(playInfo.timer);
		}else{
			//wx
			wx.stopVoice({
				localId: localIdOrAudio
			});
		}
		audioIcon.className = audioIcon.className.replace(' start-play', ' stop-play');

		playInfo.isPlaying = false;
		playInfo.isPlayingPanel = null;
		playInfo.playingAudio = null;
		playInfo.isEnding = false;
	},

	stopAllAudiosPlayExceptCurrent: function(localId, audio, panel){
		if(this.playInfo.isPlaying === false){
			this.playAudio(localId, audio, panel);
		}else{
			if(panel === this.playInfo.isPlayingPanel){
				this.pauseAudio(localId, audio, panel);
			}else{
				var played_localId = this.playInfo.isPlayingPanel.getAttribute('local_id');
				var played_audio = this.playInfo.isPlayingPanel.querySelectorAll('audio')[0];

				if(played_localId && played_localId !== ''){
					this.stopAudio(2, played_localId);
				}else{
					this.stopAudio(1, played_audio);
				}

				this.playAudio(localId, audio, panel);
			}
		}

		/*for(var key in allPanel){
			if(panel !== allPanel[key]){
				if(allPanel[key].className){
					allPanel[key].className = 'audio-msg from-doctor';
				}
			}
		}*/
	}
};
var mockdata_history = {
	'code': 0,
	'msg': '成功',
	'data': [
		{
			'pageNo': 1,
			'orderBy': 'desc',
			'pageSize': 10,
			'baseUrl': 'http://10.9.2.34',
			'totalPage': 4,
			'totalCount': 34,
			'result': [
				{
					'sendTime': 1449656249711,
					'content': {
						'size': 0,
						'path': '/ci/7019/43397/20151209/1449656248112.jpg',
						'timeLength': 188822
					},
					'relation': 1,
					'to': {
						'headImg': 'http://wx.qlogo.cn/mmopen/PiajxSqBRaEI0HsReaC5orfMRUltNgmETjWpIGq2dYV83xjQWBtpA1Weh8YbA2TcsV8goFPtVyteQarHdcSRuuhqRsEeSd6Xnk93yhaxX9OA/0',
						'id': 43397,
						'name': '龙葵测试'
					},
					'msgFormat': 1,
					'type': 2,
					'id': '5667ffb9e4b02f6cfef067d7',
					'from': {
						'headImg': 'http://10.9.2.10:8090/dri/photo/7019/1446726793940.jpg',
						'id': 7019,
						'name': '邱测试哦明夫妇啊爱你'
					}
				},
				{
					'sendTime': 1449656256860,
					'content': {
						'size': 0,
						'path': 'http://doctormx.dev.7lk.com/trans_recording/cr_7019_43397_20151209_1449656256094.mp3',
						'timeLength': 60
					},
					'relation': 0,
					'to': {
						'headImg': 'http://wx.qlogo.cn/mmopen/PiajxSqBRaEI0HsReaC5orfMRUltNgmETjWpIGq2dYV83xjQWBtpA1Weh8YbA2TcsV8goFPtVyteQarHdcSRuuhqRsEeSd6Xnk93yhaxX9OA/0',
						'id': 43397,
						'name': '龙葵测试'
					},
					'msgFormat': 1,
					'type': 4,
					'id': '5667ffc0e4b02f6cfef067d9',
					'from': {
						'headImg': 'http://10.9.2.10:8090/dri/photo/7019/1446726793940.jpg',
						'id': 7019,
						'name': '邱测试哦明夫妇啊爱你'
					}
				},
				{
					'sendTime': 1449656256860,
					'content': {
						'size': 0,
						'path': 'http://doctormx.dev.7lk.com/trans_recording/cr_7019_43397_20151209_1449656256094.mp3',
						'timeLength': 80
					},
					'relation': 1,
					'to': {
						'headImg': 'http://wx.qlogo.cn/mmopen/PiajxSqBRaEI0HsReaC5orfMRUltNgmETjWpIGq2dYV83xjQWBtpA1Weh8YbA2TcsV8goFPtVyteQarHdcSRuuhqRsEeSd6Xnk93yhaxX9OA/0',
						'id': 43397,
						'name': '龙葵测试'
					},
					'msgFormat': 1,
					'type': 4,
					'id': '5667ffc0e4b02f6cfef067d9',
					'from': {
						'headImg': 'http://10.9.2.10:8090/dri/photo/7019/1446726793940.jpg',
						'id': 7019,
						'name': '邱测试哦明夫妇啊爱你'
					}
				},
				{
					'sendTime': 1452006798350,
					'content':'http://wx.qlogo.cn/mmopen/PiajxSqBRaEI0HsReaC5orfMRUltNgmETjWpIGq2dYV83xjQWBtpA1Weh8YbA2TcsV8goFPtVyteQarHdcSRuuhqRsEeSd6Xnk93yhaxX9OA/0',
					'relation': 1,
					'to': {
						'headImg': 'http://wx.qlogo.cn/mmopen/PiajxSqBRaEI0HsReaC5orfMRUltNgmETjWpIGq2dYV83xjQWBtpA1Weh8YbA2TcsV8goFPtVyteQarHdcSRuuhqRsEeSd6Xnk93yhaxX9OA/0',
						'id': 43397,
						'name': '龙葵测试'
					},
					'msgFormat': 1,
					'type': 1,
					'id': '5667ffc0e4b02f6cfef067d9',
					'from': {
						'headImg': 'http://10.9.2.10:8090/dri/photo/7019/1446726793940.jpg',
						'id': 7019,
						'name': '邱测试哦明夫妇啊爱你'
					}
				}
			],
			'authData': {
				authStatus: 1,
				photoUrl: '../../styles/images/dor_header.png',
				doctorId: 1002,
				name: '张三'
			}
		}
	]
};

var chatMessageHistory = {
	pageObj: null,

	messageBox: null,
	ajax:null,
	popWindow: null,
	skipPage: null,
	fullScreenViewer: null,

	init:function(params){
		if(params){
			this.ajax = params.pageObj.ajax;
			this.messageBox = params.pageObj.messageBox;
			this.popWindow = params.pageObj.popWindow;
			this.skipPage = params.pageObj.skipPage;
			this.fullScreenView = params.pageObj.fullScreenView;

			this.pageObj = params.pageObj;
		}

	},

	getHistoryMessage:function(params){
		var param = {
			sendParameters:{}
		};
		var urlParams = this.pageObj.urlParams;
		var historyPageInfo = this.pageObj.historyPageInfo;
		var chatConfig = this.pageObj.chatConfig;

		param.sendParameters.patient_id = urlParams.patient_id;
		param.sendParameters.doctor_id = urlParams.doctor_id;

		param.sendParameters.page = historyPageInfo.pageNo;
		param.sendParameters.num = historyPageInfo.pageSize;
		param.sendParameters.orderby  = historyPageInfo.orderby;
		param.sendParameters.needAuthData = this.skipPage.isFirstLoad;

		param.url = chatConfig.chatGetHistoryServer + 'chat_api/first_connect/';

		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.onGetHistorySuccess.bind(this);
		param.onError = this.onGetHistoryError.bind(this);

		this.skipPage.init({
			pageInfo: historyPageInfo,
			bindObj: params.bindObj,
			param: param,
			ajax: this.ajax,
			needSkipNext: false,
			needSkipPrev: true,
			messageBox: this.messageBox,
			scrollObj: params.bindObj
		});

		//this.onGetHistorySuccess(mockdata_history);
	},

	onGetHistorySuccess: function(responseText){
		if(responseText.code === 0 || responseText.code === '0'){
			this.pageObj.hideLoading();

			if(this.skipPage.isFirstLoad === true){
				this.getPatientandDoctorInfo(responseText.data[0]);
				chatCheckUserAuth.getUseAuthInfo(responseText.data[0].authData);
			}

			this.showHistoryMessage(responseText.data[0]);

			if(this.skipPage.isFirstLoad === true){
				chatMessageAudio.triggerAudioFunction();
				chatRecommend.getRecommondMessage();
				chatPatientMessage.startGetPatientMessageTimer();
			}
		}else{
			this.onGetHistoryError(responseText);
		}
	},

	onGetHistoryError: function(responseText){

		this.messageBox.show({
			msg:responseText.msg || '获取聊天记录失败',
			type:'alert',
			autoClose: true
		});
	},

	getPatientandDoctorInfo: function(data){
		var defaultDorIcon = SYS_VAR.STATIC_ADDRESS + 'styles/images/dor_header.png';
		var defaultPatientIcon = SYS_VAR.STATIC_ADDRESS + 'styles/images/patient_header.png';
		var info = data.result;
		var patientInfo = this.pageObj.patientInfo;
		var doctorInfo = this.pageObj.doctorInfo;
		var authDoctorPhoto = this.pageObj.authDorctorPhoto;
		var urlParams = this.pageObj.urlParams;

		if(info && info.length > 0){

			if(info[0].relation === '0' || info[0].relation === 0){
				patientInfo = info[0].from;
				doctorInfo = info[0].to;
			}else{
				patientInfo = info[0].to;
				doctorInfo = info[0].from;
			}

			this.pageObj.baseUrl = data.baseUrl;

			if(patientInfo.headImg && patientInfo.headImg !== '' && patientInfo.headImg !== 'null' && patientInfo.headImg !== 'undefined'){

				if(patientInfo.headImg.indexOf('http:/') < 0){
					patientInfo.headImg = data.baseUrl + '/' + patientInfo.headImg;
				}
			}else{
				patientInfo.headImg = defaultPatientIcon;
			}

			if(doctorInfo.headImg && doctorInfo.headImg !== '' && doctorInfo.headImg !== 'null' && doctorInfo.headImg !== 'undefined'){
				if(doctorInfo.headImg.indexOf('http:/') < 0){
					doctorInfo.headImg = data.baseUrl + '/' + doctorInfo.headImg;
				}
			}else{
				if(authDoctorPhoto && authDoctorPhoto !== '' && authDoctorPhoto !== 'null' && authDoctorPhoto !== 'undefined'){
					doctorInfo.headImg = authDoctorPhoto;
				}else{
					doctorInfo.headImg = defaultDorIcon;
				}
			}
		}else{
			patientInfo.headImg = urlParams['patient_icon'] ? decodeURIComponent(urlParams['patient_icon']) : defaultPatientIcon;
			patientInfo.name = urlParams['patient_name'] ? urlParams['patient_name'] : '患者';
			patientInfo.id = urlParams['patient_id'];
		}

		this.pageObj.patientInfo = patientInfo;
		this.pageObj.doctorInfo = doctorInfo;
	},

	showHistoryMessage: function(data){
		var html = '';
		var result = data.result;
		var pageNo = data.pageNo || 1;

		for(var i=0; i < result.length; i++){
			html += this.pageObj.getCellMessageHtml(result[i], data.baseUrl);
		}

		this.pageObj.addMessageToPanel(html, true, pageNo, pageNo === 1);
	}

};
var chatMessageImage = {
	pageObj: null,

	messageBox: null,
	ajax:null,
	popWindow: null,

	imageInfo:{},

	init:function(params) {
		if (params) {
			this.ajax = params.pageObj.ajax;
			this.messageBox = params.pageObj.messageBox;
			this.popWindow = params.pageObj.popWindow;

			this.pageObj = params.pageObj;
		}

		this.preloadImage();
	},

	preloadImage: function(){
		var imgLoading = new Image();
		/*var imgAudioAni = new Image();
		var imgAudio = new Image();*/
		imgLoading.setAttribute('src', '../../styles/images/loading.gif');
		/*imgAudioAni.setAttribute('src', '../../styles/images/voice_animate.gif');
		imgAudio.setAttribute('src', '../../styles/images/voice_static.png');*/
	},

	chooseImageFile: function(){
		var info = this.imageInfo;

		info.localId = null;
		info.serverId = null;

		if(this.isImageApiOk() === false){
			return false;
		}

		wx.chooseImage({
			count: 1, // 默认9
			sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function (res) {
				info.localId = res.localIds[0]; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
				chatMessageImage.uploadImageToWXServer(info.localId);
			}
		});
	},

	uploadImageToWXServer: function(localId){
		var info = this.imageInfo;

		wx.uploadImage({
			localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
			isShowProgressTips: 1, // 默认为1，显示进度提示
			success: function (res) {
				//alert('uploadImage:' + JSON.stringify(res));
				info.serverId = res.serverId; // 返回图片的服务器端ID
				chatMessageImage.uploadImageSuccessCallback();
			}
		});
	},

	uploadImageSuccessCallback: function(){
		var info = this.imageInfo;

		//alert('uploadImageSuccessCallback:' + info.localId + ':' + info.serverId);

		this.pageObj.combineSendMsgParams('', 2, info.serverId, info.localId, 0);

	},

	getCellHtml: function(data, baseUrl){
		var content = [];
		var localId = data['content']['local_id'];
		//var mediaId = data['content']['media_id'];

		content.push('<div class="image-msg">');

		if(localId && localId !== '' && localId !== 'null' && localId !== 'undefined'){
			content.push('<img src="' + localId + '" height="160" onclick="chat.mediaFullScreenView(\'' + localId +'\', 1, event);" onload="chat.scrollToMsg();" />');
		}else{
			content.push((data.content.path && data.content.path !== '')? '<img src="' + (baseUrl + data.content.path) + '?s=t" height="160" onclick="chat.mediaFullScreenView(\'' + (baseUrl + data.content.path) +'\', 1, event);" onload="chat.scrollToMsg();" />' : '');
		}

		content.push('</div>');

		return content.join('');
	},

	isImageApiOk: function(){
		if(chatInitWXAPI.isAPILoadSuccess !== true){
			this.messageBox.show({
				msg:'微信图片API初如化失败，请刷新页面重试',
				type:'alert',
				autoClose: true
			});

			return false;
		}else{
			return true;
		}
	}

};
var mockPatientData= {
	'code': 0,
	'msg': 'success',
	'data': [{
		'result': [
			{
				"sendTime":1302238374929,
				"content": "么么哒",
				"from": {
					"headImg": "/user/ws.png",
					"id": 1015006,
					"name": "王三"
				},
				"to": {
					"headImg": "/user/ls.png",
					"id": 1015006,
					"name": "李四"
				},
				"relation":0,
				"type": 1
			},
			{
				"sendTime":1302238374929,
				"content": "么么哒",
				"from": {
					"headImg": "/user/ws.png",
					"id": 1015006,
					"name": "王三"
				},
				"to": {
					"headImg": "/user/ls.png",
					"id": 1015006,
					"name": "李四"
				},
				"relation":0,
				"type": 1
			}]
	}]
};

var chatPatientMessage = {
	messageBox: null,
	ajax: null,
	popWindow: null,

	pageObj: null,
	callbackFunctions:{},

	init: function (params) {
		if (params) {
			this.ajax = params.pageObj.ajax;
			this.messageBox = params.pageObj.messageBox;
			this.popWindow = params.pageObj.popWindow;
			this.pageObj = params.pageObj;
		}
	},

	startGetPatientMessageTimer: function(){
		clearInterval(this.pageObj.getPatientMsgTimer);

		this.pageObj.getPatientMsgTimer = setInterval(function(){

			if(chatMessageHistory.skipPage.isGettingData === false && this.pageObj.isSavingMsgData === false){
				this.getPatientMessage();
			}

		}.bind(this), this.pageObj.chatConfig.chatSaveMessageTimeStep);
	},

	getPatientMessage: function(){
		var param = {
			sendParameters:{}
		};
		var urlParams = this.pageObj.urlParams;
		var chatConfig = this.pageObj.chatConfig;

		param.sendParameters.patient_id = urlParams.patient_id;
		param.sendParameters.doctor_id = urlParams.doctor_id;

		param.url = chatConfig.chatGetHistoryServer + 'chat_api/poll_connect/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.onGetPatientMsgSuccess.bind(this);
		param.onError = this.onGetPatientMsgError.bind(this);

		this.ajax.send(param);

		//this.onGetPatientMsgSuccess(mockPatientData);
	},

	onGetPatientMsgSuccess: function(responseText){
		var html = '';
		var self = this;
		var list = [];


		if(responseText.code === 0 || responseText.code === '0'){

			try{
				list = responseText.data[0].result;

				if(list && list.length >0){
					for(var i=0; i < list.length; i++){
						html += self.pageObj.getCellMessageHtml(list[i], this.pageObj.baseUrl);
					}

					this.pageObj.addMessageToPanel(html, true, null, true);
				}

			}catch(e){
				alert(e);
			}
		}
	},

	onGetPatientMsgError: function(responseText){
	}

};
var chatRecommend = {
	messageBox: null,
	ajax: null,
	popWindow: null,

	pageObj: null,
	callbackFunctions:{},

	init: function (params) {
		if (params) {
			this.ajax = params.pageObj.ajax;
			this.messageBox = params.pageObj.messageBox;
			this.popWindow = params.pageObj.popWindow;
			this.pageObj = params.pageObj;
		}
	},

	getRecommondMessage: function(){
		var recommondData;
		var recommondList = [];
		var param = {
			content: {}
		};
		var sendToServerMessage = {};

		recommondData = window.localStorage.getItem('recommondData');

		if(recommondData && recommondData !== ''){

			recommondData = decodeURIComponent(recommondData);

			recommondList = new Function('return ' + recommondData + ';')();

			param.from = this.pageObj.doctorInfo;
			param.to = this.pageObj.patientInfo;
			param.sendTime = new Date().getTime();

			param.content.recommandId = '000000001';
			param.content.items = recommondList;
			param.relation = 1;

			param.type = 16;

			window.localStorage.removeItem('recommondData');

			sendToServerMessage.message = param;
			this.pageObj.currentSendMessage = sendToServerMessage;

			this.pageObj.doSaveMessage(sendToServerMessage);
		}
	},

	getRecommondHtml: function(data){
		var recommondList = [];
		var html = [];
		var detailUrl = SYS_VAR.STATIC_ADDRESS + 'templates/medical/medical-detail.html';
		var medicalName;
		var userDefinedBillItems = 0;

		if(data){
			recommondList = data.content.items;

			html.push('<span class="recommond-list">');
			html.push('<i>建议服用以下药物：</i>');

			for(var i=0; i<recommondList.length; i++){

				userDefinedBillItems = 0;

				html.push('<div>');

				if(!recommondList[i].productName || recommondList[i].productName === ''){
					medicalName = '药品';
				}else{
					medicalName = recommondList[i].productName;
				}

				if(recommondList[i].commonName && recommondList[i].commonName !== ''){
					medicalName += '（' + recommondList[i].commonName + '）';
				}

				html.push('<a href="' + detailUrl + '?medicalId=' + recommondList[i].productId + '">');
				html.push(medicalName);
				html.push('</a>');

				if(recommondList[i].quantity && recommondList[i].quantity !== '' && recommondList[i].quantity !== '0' && recommondList[i].quantity !== 0){
					html.push(' x ' + (recommondList[i].quantity || 0));
				}

				if(!recommondList[i].usage){
					if(recommondList[i].timePayDay && recommondList[i].timePayDay !== '' && recommondList[i].timePayDay !== '0' && recommondList[i].timePayDay !== 0){
						html.push('<p>1日' + recommondList[i].timePayDay + '次</p>');
						userDefinedBillItems ++;
					}

					if(recommondList[i].timePayUnit && recommondList[i].timePayUnit !== '' && recommondList[i].timePayUnit !== '0' && recommondList[i].timePayUnit !== 0 && userDefinedBillItems === 1){
						html.push('<p>1次' + recommondList[i].timePayUnit + '' + (recommondList[i].unit || '') + '</p>');
						userDefinedBillItems ++;
					}
				}else{
					var usageSplit = recommondList[i].usage.split(',');
					usageSplit.forEach(function(str){
						html.push('<p>' + str + '</p>');
					});
				}

				if(recommondList[i].bakup && recommondList[i].bakup !== ''){
					html.push('<p>' + recommondList[i].bakup + '</p>');
				}

				html.push('<p style="margin-top:8px; height:0; font-size:0; line-height:0;"></p>');

				html.push('</div>');

			}

			html.push('<p class="text-right">以上药品由七乐康提供</p>');
			html.push('</span>');
		}

		return html.join('');
	},



	doRecommondMedical: function(){
		this.skipPageToDoRecommend('templates/medical/medical-search.html');
	},

	skipPageToDoRecommend: function(url){
		var page = SYS_VAR.STATIC_ADDRESS + url;
		var params;
		var urlParams = this.pageObj.urlParams;

		if(this.pageObj.authStatus !== 1){
			chatCheckUserAuth.showNoVerifyTipMessage(1);
		}else {
			params = '?type=recommond';
			params += '&patient_id=' + urlParams.patient_id;
			params +='&doctor_id=' + urlParams.doctor_id;
			params += '&patient_name=' + urlParams.patient_name;

			window.location.href = page + params;
		}
	}

};
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
var chat = {
	chatConfig:{
		chatHistoryCount: SYS_VAR.CHAT_HISTORY_COUNT,
		chatGetHistoryServer: SYS_VAR.CHAT_GET_HISTORY_SERVER,
		chatSaveDoctorMessageServer: SYS_VAR.CHAT_SAVE_DOCTOR_MESSAGE_SERVER,
		chatSaveMessageTimeStep: SYS_VAR.CHAT_GET_MESSAGE_TIME_STEP,
		chatGetPatientMessageServer: SYS_VAR.CHAT_GET_PATIENT_MESSAGE_SERVER,
		iconWidth:50
	},
	getPatientMsgTimer: 0,
	urlParams:{
		patient_id: '',
		doctor_id: ''
	},
	patientInfo:{
		id: 0,
		name: '',
		headImg: ''
	},
	doctorInfo:{
		id: 0,
		name: '',
		headImg: ''
	},
	historyPageInfo : {
		pageNo: 1,
		orderby:1,
		pageSize: SYS_VAR.CHAT_HISTORY_COUNT
	},
	baseUrl: '',
	simpleLen: 7,

	messageBox: null,
	ajax:null,
	popWindow: null,
	chatPanel: null,
	skipPage: null,
	fullScreenViewer: null,

	authStatus:4,
	authDorctorPhoto: null,

	isSavingMsgData: false,

	requestUrl: SYS_VAR.SERVER_ADDRESS,
	currentSendMessage: {},

	init:function(){
		this.messageBox = new MessageBox();
		this.ajax = new Ajax();
		this.popWindow = new PopWindow();
		this.chatPanel = document.querySelectorAll('.chat-msg-list')[0];
		this.skipPage = new SkipPage();
		this.fullScreenView = new FullScreenView();

		this.getPatientId();

		chatTimeFormat.init({
			pageObj: chat
		});

		chatCheckUserAuth.init({
			pageObj: chat
		});

		chatMessageHistory.init({
			pageObj: chat
		});

		chatRecommend.init({
			pageObj: chat
		});

		chatPatientMessage.init({
			pageObj: chat
		});

		chatControlPanel.init({
			pageObj: chat
		});

		chatMessageAudio.init({
			pageObj: chat
		});

		chatMessageImage.init({
			pageObj: chat
		});

		chatMarkPatientInfo.init({
			pageObj: chat
		});

		chatInitWXAPI.init({
			pageObj: chat
		});

		this.loadPage();
		this.attachEvent();
	},

	loadPage: function(){
		this.showLoading();

		chatMessageHistory.getHistoryMessage({
			bindObj: document.querySelector('#chatMsgList')
		});

		chatInitWXAPI.doInitWXAPI();
	},

	getPatientId: function(){
		var searchStr = window.location.search.replace('?', '');
		var keys = searchStr.match(/(.[^?|&]+)=/g);
		var values= searchStr.match(/=(.[^&]*)/g);
		var self = this;
		var title;

		if(searchStr === ''){
			self.urlParams['patient_id'] = window.localStorage.getItem('patient_id');
			self.urlParams['doctor_id'] = window.localStorage.getItem('doctor_id');
			self.urlParams['patient_name'] = window.localStorage.getItem('patient_name');
		}else{
			if(!keys || !values){
				return false;
			}

			for(var i=0; i<keys.length; i++){
				var key = keys[i].replace(/=|\?|&/g, '');
				var value = decodeURIComponent(values[i]).replace('=', '');
				if((/^\d{1,}$/).test(value)){
					value = parseInt(value, 10);
				}
				self.urlParams[key] = value;

			}
			window.localStorage.setItem('patient_id', self.urlParams['patient_id']);
			window.localStorage.setItem('doctor_id', self.urlParams['doctor_id']);
			window.localStorage.setItem('patient_name', self.urlParams['patient_name']);
		}

		title = self.urlParams['patient_name'] || '患者';
		document.querySelectorAll('title')[0].innerHTML = title + '　';
	},

	hackTitle: function(){
		/*var $body = $('body');
		 document.title = 'title';
		 var $iframe = $('<iframe src="/favicon.ico"></iframe>').on('load', function() {
		 setTimeout(function() {
		 $iframe.off('load').remove();
		 }, 0);
		 }).appendTo($body);*/
	},

	getCellMessageHtml:function(data, baseUrl){
				var html = '';
				var typeStyle = '';
				var headerIcon, content = '', dateStr, userDetailUrl, patientIcon;


				dateStr = this.getDateString(parseInt(data.sendTime, 10));

				//baseUrl = (data.content.path && data.content.path.indexOf('http:/') >= 0) ? '' : 'http://yun.dabai.7lk.com';
				if(data.content.path && data.content.path.indexOf('http:/') >= 0){
					baseUrl = '';
				}

				if(data.relation === 0 || data.relation === '0'){
				}else{
					typeStyle = 'my-msg';
				}

				patientIcon = this.getPatientDefaultIcon(this.urlParams['patient_icon'], typeStyle === 'my-msg' ? data.to : data.from);

				userDetailUrl = '../../templates/patient-info/patient-info.html';
				userDetailUrl += '?patient_id=' + encodeURIComponent(this.patientInfo.id);
				userDetailUrl += '&patient_name=' + encodeURIComponent(this.urlParams['patient_name']);
				userDetailUrl += '&patient_icon=' + encodeURIComponent(patientIcon);
				userDetailUrl += '&doctor_id=' + encodeURIComponent(this.urlParams['doctor_id']);

				headerIcon = (typeStyle === 'my-msg') ? this.doctorInfo.headImg : patientIcon;

				if(data.type === '1' || data.type === 1){  //text
					content = data.content;
				}else if(data.type === '2' || data.type === 2){ //image
					content = chatMessageImage.getCellHtml(data, baseUrl);
				}else if(data.type === '4' || data.type === 4){ //audio
					content = chatMessageAudio.getCellHtml(data, baseUrl);
				}else if(data.type === '8' || data.type === 8){ //video
					content = '<video controls="controls" preload="preload" width="240" src="' + (baseUrl + data.content.path) + '" type="video/mp4"></video>';
				}else if(data.type === '16' || data.type === 16){
					content = chatRecommend.getRecommondHtml(data);
				}else if(data.type === '32' || data.type === 32){
					content = this.getMedicalHelpHtml(data);
				}

				if(dateStr && dateStr !== ''){
					html += '<header class="current-time"><span>' + dateStr + '</span></header>';
				}

				html += '<dl class="' + typeStyle + '">';
				if(typeStyle === ''){
					html += '<dt><a href="' + userDetailUrl + '"><img src="' + headerIcon + '?s=t" width="' + this.chatConfig.iconWidth + '" height="40"/></a></dt>';
				}else{
					html += '<dt><img src="' + headerIcon + '?s=t" width="' + this.chatConfig.iconWidth + '" height="40" /></dt>';
				}
				html += '<dd>' + content + '</dd></dl>';
				html += '</dl>';

				return html;

	},

	getPatientDefaultIcon: function(patientIcon, data){
		var oldDefault = 'patient_header.png';
		var newDefaultIcon = SYS_VAR.STATIC_ADDRESS + 'styles/images/patient_default.png';
		var headImg = data.headImg || '';

		if(!patientIcon || patientIcon === '' || patientIcon === 'null' || patientIcon === 'undefined'){
			if(!headImg ||headImg === '' || headImg === 'null' || headImg === 'undefined'){
				patientIcon = newDefaultIcon;
			}else if(headImg.indexOf(oldDefault) >= 0){
				patientIcon = newDefaultIcon;
			}else{
				patientIcon = headImg;
			}
		}else if(patientIcon.indexOf(oldDefault) >= 0){
			patientIcon = newDefaultIcon;
		}

		data.headImg = patientIcon;

		return patientIcon;
	},

	getDateString: function(times){
		return chatTimeFormat.getTimeText(times);
	},

	getMedicalHelpHtml: function(data){
		var html = '';

		html += '<span class="medical-help">';
		html += data.content.dest || '';
		html += '<b>';

		for(var i=0; i< data.content.keys.length; i++){
			html += (data.content.keys[i] + ((i === data.content.keys.length)? '' :'、'));
		}
		html += '</b>';
		html += ('<i>' + data.content.orgin || '' + '</i>');
		html += '</span>';

		return html;
	},

	doSendTextMessage: function(event, msgObj, afterSendMsgUiCallback){
		var msgText = msgObj.value;

		if(!msgText  || msgText === ''){
			return false;
		}

		if((/^\s+$/).test(msgText)){
			this.messageBox.show({
				msg:'不能发送空文本',
				type:'alert',
				autoClose: true
			});

			msgObj.value = '';
			msgText = '';
			return false
		}

		msgText = msgText.trim();

		this.combineSendMsgParams(msgText, 1)

		msgObj.value = '';
		if(afterSendMsgUiCallback){
			afterSendMsgUiCallback(false);
		}
		if(event){
			event.preventDefault();
		}
	},

	combineSendMsgParams: function(content, type, mediaId, localId, timeLength){
		var param = {};
		var sendToServerMessage = {};

		param.from = this.doctorInfo;
		param.to = this.patientInfo;
		param.sendTime = new Date().getTime();

		param.relation = 1;
		param.type = type;

		if(type === 4 || type === 2){
			param.content = {};
		}else if(type === 1){
			param.content = content;
		}

		if(mediaId){
			param['content']['media_id'] = mediaId;
		}
		if(localId){
			param['content']['local_id'] = localId;
		}
		if((/^\d+$/).test(timeLength + '')){
			param['content']['timeLength'] = timeLength;
		}

		if(!param.from.id || param.from.id  === '' || param.from.id  === '0'){
			param.from.id = this.urlParams.doctor_id;
		}
		if(!param.to.id || param.to.id  === '' || param.to.id === '0'){
			param.to.id = this.urlParams.patient_id;
		}

		sendToServerMessage.message = param;
		this.currentSendMessage = sendToServerMessage;
		this.doSaveMessage(sendToServerMessage);
	},

	doSaveMessage: function(message){
		var param = {
			sendParameters:{}
		};

		param.sendParameters.message = message;
		param.url = this.chatConfig.chatSaveDoctorMessageServer + 'msg_center/h5_api/';
		param.type = 'POST';
		param.asyn = true;
		param.onSuccess = this.onSaveMessageSuccess.bind(this);
		param.onError = this.onSaveMessageError.bind(this);

		this.isSavingMsgData = true;

		this.showSendMessage();

		//alert(JSON.stringify(message));

		this.ajax.send(param);

		/*this.onSaveMessageSuccess({
		 msg: '',
		 code: 0,
		 data: [
		 {}
		 ]
		 });*/
	},

	onSaveMessageSuccess: function(responseText){
		if(responseText.code === 0 || responseText.code === '0'){
			this.currentSendMessage = {};
		}else{
			this.onSaveMessageError(responseText);
		}

		this.isSavingMsgData = false;
	},

	onSaveMessageError: function(responseText){
		var html = '';

		if(responseText.code === '-101' || responseText.code === -101){
			html = '医生不能主动发起咨询';
		}else if(responseText.code === '-21' || responseText.code === -21 || responseText.code === '-22' || responseText.code === -22){
			html = this.getResendMsgHtml();
		}else{
			html = this.getResendMsgHtml();
		}

		if(html !== ''){
			this.sendSysErrorMessage(html);
		}

		this.currentSendMessage = {};
		this.isSavingMsgData = false;
	},

	getResendMsgHtml: function(){
		var simpleMsg = '';
		var html;
		var msg;

		msg = encodeURIComponent(JSON.stringify(this.currentSendMessage));

		if(this.currentSendMessage.message.content && this.currentSendMessage.message.content.length > this.simpleLen){
			simpleMsg = this.currentSendMessage.message.content.substr(0, this.simpleLen) + '...';
			simpleMsg = '“' + simpleMsg + '”';
		}

		html = '可能由于网络原因，信息' + simpleMsg + '发送失败<a class="re-send-msg" msg="' + msg + '" onclick="chat.doReSendMessage(event);">点击重新发送</a>';

		return html;
	},

	showSendMessage: function(){
		var html;
		var riskTip;
		var newRiskTip;
		var date = new Date();

		html = this.getCellMessageHtml(this.currentSendMessage.message || this.currentSendMessage, this.baseUrl);
		this.addMessageToPanel(html, true, null, true);

		if(this.authStatus !== 1){
			riskTip = window.localStorage.getItem('riskTip');
			newRiskTip = this.urlParams['doctor_id'] + ':' + date.getFullYear() + date.getMonth() + date.getDate();

			if(!riskTip || riskTip === '' || riskTip !== newRiskTip){
				chatCheckUserAuth.showNoVerifyTipMessage(2);
				window.localStorage.setItem('riskTip', newRiskTip);
			}
		}else{
			window.localStorage.removeItem('riskTip');
		}
	},

	doReSendMessage: function(event){
		this.currentSendMessage = JSON.parse(decodeURIComponent(event.currentTarget.getAttribute('msg')));
		this.currentSendMessage.message.sendTime = new Date().getTime();
		this.doSaveMessage(this.currentSendMessage);
	},

	sendSysErrorMessage: function(html){
		var dateStr;
		var headHtml = '';

		dateStr = this.getDateString(new Date().getTime());

		if(dateStr && dateStr !== '') {
			headHtml = '<header class="current-time"><span>' + dateStr + '</span></header>';
		}

		html = headHtml + '<div class="send-msg-failed"><i></i><span>' + html + '</span></div>';

		this.addMessageToPanel(html, true, null, true);
	},

	addMessageToPanel: function(html, needInserHtml, pageNo, needScrollToBottom){
		var span = null;

		if(needInserHtml){
			if(pageNo){
				this.skipPage.appendHtmlNode(html, this.chatPanel, pageNo);
			}else{
				span = document.createElement('span');
				span.innerHTML = html;
				this.chatPanel.appendChild(span);
			}
			
		}else{
			this.chatPanel.innerHTML = html;
		}

		this.scrollToMsg(needScrollToBottom);
		
	},

	mediaFullScreenView: function(source, type, event){

		//window.location.href = image.getAttribute('src');
		this.fullScreenView.show({
			type: type, // type: 1 image, type
			src: source,
			event: event
		});
	},

	scrollToMsg: function(needScrollToBottom){
		setTimeout(function(){
			if(needScrollToBottom === true){
				var body = document.querySelector('#chatMsgList');
				body.scrollTop = body.scrollHeight - body.clientHeight;
			}
		}, 0);
	},

	clearCache: function(){
		if(window.localStorage){
			window.localStorage.removeItem('patient_id');
			window.localStorage.removeItem('doctor_id');
			window.localStorage.removeItem('recommondData');
		}

	},

	sendLiveStatusToMsgToServer: function(onLine){

		var param = {
			sendParameters:{}
		};
		var url = onLine ? 'chat_api/online/' : 'chat_api/offline/';

		param.sendParameters.patient_id = this.urlParams.patient_id;
		param.sendParameters.doctor_id = this.urlParams.doctor_id;

		param.url = this.chatConfig.chatGetHistoryServer + url;
		param.type = 'GET';
		param.asyn = true;

		this.ajax.send(param);

		if(onLine === false){
			this.leaveChat();
		}

		return false;
	},

	leaveChat: function(){
		//this.clearCache();
		//this.sendLeaveMsgToServer();
		window.location.href = '../patient/patient-admin.html?doctorId=' + this.urlParams['doctor_id'];
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
		window.addEventListener('beforeUnload', function(){
			this.sendLiveStatusToMsgToServer(false);
		}.bind(this));
	}

};

chat.init();