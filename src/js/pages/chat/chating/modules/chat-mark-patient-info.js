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