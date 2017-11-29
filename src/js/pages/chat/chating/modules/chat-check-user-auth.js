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