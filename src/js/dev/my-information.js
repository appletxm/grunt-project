var informationData = {
	"code": 0,
	"msg": "success",
	"data":[
		{
			userId: 11,
			name: "张医生",
			gender: "女",
			phone: "13212345678",
			title: "主院医师",
			department: "神经内科",
			hospital: "南方医院",
			introduction: "这是医生的简介",
			expertise: "确认修改信息了啊"
		}
	]
};

var userAuthData = {
	"code": 0,
	"msg": "成功",
	"data": [
		{
			"doctorId": 6980,
			"name": "符雯云",
			"title": "副主任医师",
			"department": "骨科",
			"infoStatus": 1,
			"authStatus": 2,

			"bankStatus": 1,
			"photoUrl": "http://10.9.2.10:8090/dri/photo/6980/1444460128422.png",
			"emcardUrl": "http://10.9.2.10:8090/dri/emcard/6980/1444460128461.png",
			"vocatecerUrl": "http://10.9.2.10:8090/dri/vocatecer/6980/1444460128474.png",
			"failReason": null,
			"photoSmple": "http://10.9.2.10:8090/dri/head/def/photo_sample.png",
			"emcardSample": "http://10.9.2.10:8090/dri/head/def/emcard_sample.png",
			"vocatecerSample": "http://10.9.2.10:8090/dri/head/def/vocatecer_sample.png"
		}
	]
};

var myInformation = {
	ajax: null,
	messageBox: null,
	removeCardList: [],
	canModify:false,

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		
		this.getAuthData();
	},
	
	getAuthData:function(){
		var param = {
			sendParameters:{}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/user_auth_data/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetAuthDataSuccess.bind(this);
		param.onError = this.handlerError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);

		//this.handleGetAuthDataSuccess(userAuthData);
	},
	
	handleGetAuthDataSuccess:function(responseText){
		if(responseText.code === 0) {
			var status = responseText.data[0].authStatus;
			this.canModify = (status === 2 || status === 4);

			// 如在不能修改的状态，那么就不能跳去身份认证界面
			if(this.canModify) {
				document.querySelector('#toVerify').style.display = 'block';
			}
			this.getMyInformation();
		} else {
			this.handlerError(responseText)
		}
	},

	getMyInformation:function(){
		var param = {
			sendParameters:{}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/get_info/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetMyInformationSuccess.bind(this);
		param.onError = this.handlerError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);

		//this.handleGetMyInformationSuccess(informationData);
	},

	handleGetMyInformationSuccess:function(responseText){
		if(responseText.code === 0){
			if(responseText.data && responseText.data.length > 0) {
				var info = responseText.data[0];
				var html = '';
				var levelUrl;
				var tipInputName;

				tipInputName = (info.name && info.name !== '') ? '真实姓名' : '请输入您的真实姓名';
				levelUrl = 'href="my-info-change-level.html?title=' + encodeURIComponent(this.nullToBlank(info.title)) + '"';

				html += '<a ' + (this.canModify?('href="my-info-change-name.html?name=' + this.nullToBlank(info.name) + '"'):'class="no-arrow"') + '>' + tipInputName + '<span id="name">' + this.nullToBlank(info.name) + '<span></a>';
				html += '<a ' + (this.canModify?'href="my-info-change-gender.html"':'class="no-arrow"') + '>性别<span id="gender">' + this.nullToBlank(info.gender) + '<span></a>';
				html += '<a href="my-info-change-phone.html">手机号码<span id="phone">' + this.nullToBlank(info.phone) + '<span></a>';
				html += '<a ' + (this.canModify?'href="my-info-change-hospital.html" class="gapTop"':'class="no-arrow gapTop"') + '>医院<span id="hospital">' + this.nullToBlank(info.hospital) + '<span></a>';
				html += '<a ' + (this.canModify?'href="my-info-change-derpart.html"':'class="no-arrow"') + '>科室<span id="department">' + this.nullToBlank(info.department) + '<span></a>';
				html += '<a ' + (this.canModify?levelUrl:'class="no-arrow"') + '>职称<span id="title">' + this.nullToBlank(info.title) + '<span></a>';
				html += '<a href="my-info-change-major.html?expertise=' + this.nullToBlank(info.expertise) + '" class="gapTop">擅长<span id="expertise">' + this.nullToBlank(info.expertise) + '<span></a>';
				html += '<a href="my-info-change-introduce.html?introduction=' + this.nullToBlank(info.introduction) + '">个人简介<span id="introduction">' + this.nullToBlank(info.introduction) + '<span></a>';

				document.querySelector('#info_list').innerHTML = html;
			}
		}else{
			this.handlerError(responseText);
		}
	},
	
	nullToBlank:function(value) {
		return value?value:'';
	},

	handlerError:function(responseText){
		this.messageBox.show({
			msg:responseText.msg, 
			type:'alert', 
			autoClose: true
		});
	}
};

myInformation.init();