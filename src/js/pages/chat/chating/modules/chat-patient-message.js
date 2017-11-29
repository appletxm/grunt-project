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