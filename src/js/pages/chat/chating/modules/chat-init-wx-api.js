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