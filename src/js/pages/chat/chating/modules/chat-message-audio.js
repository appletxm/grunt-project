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