var registerBind = {
	ajax: null,
	messageBox: null,
	currentLoginType: 0, //0: rgister, 1: bind
	validateTarget: null,
	validateCodeActive: false,

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		this.attachEvent();
	},

	handlePanelClick: function(event){
		var target = event.target
		if(target.getAttribute('id') === 'chooseUserType' || target.tagName.toLowerCase() === 'b'){
			if(target.tagName.toLowerCase() === 'b'){
				target = target.parentNode;
			}
			this.changeLoginType(target);
		}else if(target.getAttribute('id') === 'getValidateCode'){
			this.getValidateCode(target);
		}else if(target.getAttribute('id') === 'doRegister'){
			this.doRegister();
		}else if(target.getAttribute('id') === 'doBind'){
			this.doBind();
		}
	},

	changeLoginType: function(target){
		var checkBoX = target.querySelectorAll('b')[0];

		if(checkBoX.className.indexOf('selected') >= 0){
			this.changeToRegister(target);
		}else{
			this.changeToLogin(target);
		}
	},

	changeToRegister: function(target){
		this.currentLoginType = 0;
		target.querySelectorAll('b')[0].className = '';
		document.querySelectorAll('.passwordPanel')[0].style.display = 'none';
		document.querySelector('#doBind').style.display = 'none';
		document.querySelectorAll('.validatePanel')[0].style.display = 'block';
		document.querySelector('#doRegister').style.display = 'block';
	},

	changeToLogin: function(target){
		this.currentLoginType = 1;
		target.querySelectorAll('b')[0].className = 'selected';
		document.querySelectorAll('.passwordPanel')[0].style.display = 'block';
		document.querySelector('#doBind').style.display = 'block';
		document.querySelectorAll('.validatePanel')[0].style.display = 'none';
		document.querySelector('#doRegister').style.display = 'none';
	},

	getValidateCode: function(target){
		var phoneNo = document.querySelector('#phoneNo').value;
		if(!(phoneNo && phoneNo !== '' && (/^1[0-9][0-9]\d{4,8}$/).test(phoneNo))){
			this.messageBox.show({
				msg:'请输入正确的手机号码', 
				type:'alert', 
				autoClose: true
			});
			return;
		}
		if(!this.validateCodeActive){
			this.sendCodeToUser();
		}
		
	},

	sendCodeToUser: function(){
		var phoneNo = document.querySelector('#phoneNo').value;
		var param = {
			sendParameters:{
				'actionType': '1',
				'phoneNum': document.querySelector('#phoneNo').value
			}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/get_sms/';
		param.type = 'GET';
		param.asyn = true;
		//param.isJsonp = true;
		//param.callback = 'pointCard.jsonpCallback';
		param.onSuccess = this.hanlderSendSMSSuccess.bind(this);
		param.onError = this.onError.bind(this);
		param.mssage = this.messageBox;
		this.ajax.send(param);

	},
	
	hanlderSendSMSSuccess:function(responseText) {
		if(responseText.code === 0) {
			this.messageBox.show({
				msg:'短信已发送到您的手机，请注意查收', 
				type:'alert', 
				autoClose: true
			});
			
			this.validateTarget = document.querySelector('#getValidateCode');
			this.validateTarget.className = 'actived';
			this.startCutDownTimer();

			this.validateCodeActive = true;
		} else {
			this.onError(responseText);
		}
	},

	startCutDownTimer: function(){
		var count = 60;

		this.validateTarget.innerHTML = '<b>' + count + '</b>秒后重试';

		var timer = setInterval(function(){
			if(count >= 0){
				this.validateTarget.innerHTML = '<b>' + count + '</b>秒后重试';
				count --;
			}else{
				this.validateTarget.innerHTML = '获取验证码';
				this.validateTarget.className = '';
				this.validateCodeActive = false;
				clearInterval(timer);
			}
			
		}.bind(this), 1000);
	},


	doRegister: function(){
		var res = this.validate();
		if(!res.res) {
			this.messageBox.show({
				msg:res.msg, 
				type:'alert', 
				autoClose: true
			});			
			return;
		}
		
		var param = {
			sendParameters:{
				'phoneNum' : document.querySelector('#phoneNo').value,
				'verifyCode' : document.querySelector('#validateCode').value
			}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/register/';
		param.type = 'GET';
		param.asyn = true;
		//param.isJsonp = true;
		//param.callback = 'pointCard.jsonpCallback';
		param.onSuccess = this.onSuccess.bind(this);
		param.onError = this.onError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);
	},

	doBind: function(){
		var res = this.validate();
		if(!res.res) {
			this.messageBox.show({
				msg:res.msg, 
				type:'alert', 
				autoClose: true
			});		
			return;			
		}
		
		var param = {
			sendParameters:{
				'phoneNum' : document.querySelector('#phoneNo').value,
				'password' : document.querySelector('#password').value
			}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/login/';
		param.type = 'GET';
		param.asyn = true;
		//param.isJsonp = true;
		//param.callback = 'pointCard.jsonpCallback';
		param.onSuccess = this.onSuccess.bind(this);
		param.onError = this.onError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);
	},

	validate: function(){
		var phoneNo = document.querySelector('#phoneNo').value;
		var password = document.querySelector('#password').value;
		var validateCode = document.querySelector('#validateCode').value;

		if(!(phoneNo && phoneNo !== '' && (/^1[1-9][0-9]\d{4,8}$/).test(phoneNo))){
			return {
				res: false,
				msg:'请输入正确的手机号码'
			}
		}
		/*
		if(this.currentLoginType === 0){
            if(!(validateCode && (/^[0-9]{4,8}$/).test(validateCode))){
                return {
                    res: false,
                    msg:'验证码格式不正确'
                }
            }
		}else{
            if(!password){
                return {
                    res: false,
                    msg:'请输入密码'
                }
            }
		}
		*/
        return {res: true, msg: ''}
	},

	onSuccess: function(responseText){
		if(responseText.code === 0){
			/*var params = window.location.search;
			var reg = new RegExp("redirect_uri=([^&?]*)", "ig");
			if(params.match(reg)) {
				var redirect_uri = params.match(reg)[0].substring("redirect_uri".length + 1);
				window.location.href = redirect_uri;
			} else {
				window.close();
			}*/
            window.location.href = '../../../../templates/my/my-information.html';
		}else{
			this.onError(responseText);
		}
	},

	onError: function(responseText){
		this.messageBox.show({
			msg:responseText.msg, 
			type:'alert', 
			autoClose: true
		});
	},


	attachEvent: function(){
		var authorRegisterPanel = document.querySelector('#authorRegisterPanel');

		authorRegisterPanel.addEventListener('click', function(event){
			this.handlePanelClick(event);
		}.bind(this), false);
	}
};

registerBind.init();
