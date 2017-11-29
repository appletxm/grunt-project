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