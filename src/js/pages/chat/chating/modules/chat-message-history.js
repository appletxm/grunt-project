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