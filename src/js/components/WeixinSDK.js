var WeixinSDK = function(){
	this.params = {
		tokenTime: 0,
		timeStep: 7200*1000 - 20*1000
	};
	this.wxConfig = null;

	this.init = function(params){

		params.app_id = SYS_VAR.app_id;
		params.app_secret = SYS_VAR.app_secret;
		params.url = encodeURIComponent(window.location.href.split('#')[0]);
		params.interfaceUrl = SYS_VAR.SERVER_ADDRESS + 'doc/share_qrcode_info';

		for(var key in params){
			if(!this.params[key]){
				this.params[key] = params[key];
			}
		}

		this.getSignature();
	};

	this.getSignature = function(){
		var params = this.params;
		var ajaxParam = {
			sendParameters:{}
		};

		ajaxParam.sendParameters.share_url = params.url;

		ajaxParam.url = params.interfaceUrl;
		ajaxParam.type = 'GET';
		ajaxParam.asyn = true;
		ajaxParam.onSuccess = this.handleGetSignatureSuccess.bind(this);
		ajaxParam.onError = this.handleError.bind(this);

		params.ajax.send(ajaxParam);

		/*this.handleGetSignatureSuccess({
			code: 0,
			msg: '',
			data: [
				{
				"noncestr": "doctor_weixin",
				"signature": "6f2db19c9ffd8c728417c6fb3ed3af2ae0bbdd9e",
				"timestamp": 1446035028.6967702,
				"access_token": "iHJeRHj1UVBE_z7nwqDzlHrZleWhDMkY90bI6UBXO6kHWbR6cFqAHp0Yg6hre-XAmlx8rmAiZ02uxj6VRVruPuIr-sb0lkgc9FfBMOt-FB4PXAmANAGOR", "ticket": "sM4AOVdWfPE4DxkXGEs8VC4mxvH0M0hiQJoU8tOtVLjg3bTWeQyPjPArEkTePM2fLQG3jwKdTCNcLizvv3MhYQ"}
			]
		});*/
	};

	this.handleGetSignatureSuccess = function(responseText){
		var info = responseText;

		if(info.code === 0 || info.code === '0'){
			this.wxConfig = info.data[0];

			this.getWXAPIInitConfig();
		}else{
			this.handleError(responseText);
		}
	};

	this.getWXAPIInitConfig = function () {
		var callBackParam = {};

		if(this.wxConfig){
			callBackParam = {
				debug: this.params.debug || null,
				appId: this.params.app_id,
				jsApiList: this.params.jsApiList,
				timestamp: this.wxConfig.timestamp,
				nonceStr: this.wxConfig.noncestr,
				signature: this.wxConfig.signature
			}
		}else{
			callBackParam = null;
		}

		this.doWXAPIInit(callBackParam);
	};

	this.doWXAPIInit = function (wxConfig) {
		var params = this.params;

		if (wxConfig) {
			wx.config(wxConfig);

			wx.ready(function () {
				params.successCallback();
			}.bind(this));

			wx.error(function () {
				params.errorCallback();
			}.bind(this));
		} else {
			params.errorCallback();
		}
	};

	this.handleError = function () {
		this.wxConfig = null;
		this.getWXAPIInitConfig();
	};
}