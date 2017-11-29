var myInfoChangePhone = {
	ajax: null,
	messageBox: null,
	validateTarget: null,
	validateCodeActive: false,
	phoneNoisOk: false,

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		this.validateTarget = document.querySelector('#getVerifyCode');
		this.attachEvent();
	},

	doSave:function(event){
		var param = {
			sendParameters:{
				'phone': document.querySelector('#phone').value,
				'verifyCode': document.querySelector('#verifyCode').value
			}
		};

		//alert(JSON.stringify(param.sendParameters));

		if(!this.doValidate(true)){
			return false;
		}

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/info_update/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.hanlderSaveSuccess.bind(this);
		param.onError = this.hanlderSaveError.bind(this);
		//param.mssage = this.messageBox;

		this.ajax.send(param);

	},

	hanlderSaveSuccess:function(responseText){

		if(responseText.code === 0){
			window.location.href="my-information.html";
		}else{
			this.hanlderSaveError(responseText);
		}
	},
	
	sendSMS: function(event) {
		if(this.doValidate(false)) {
			var param = {
				sendParameters:{
					'actionType': '3',
					'phoneNum': document.querySelector('#phone').value
				}
			};

			param.url = SYS_VAR.SERVER_ADDRESS + 'doc/get_sms/';
			param.type = 'GET';
			param.asyn = true;
			param.onSuccess = this.hanlderSendSMSSuccess.bind(this);
			param.onError = this.hanlderSaveError.bind(this);
			//param.mssage = this.messageBox;

			this.ajax.send(param);
		}
	},
	
	hanlderSendSMSSuccess:function(responseText) {
		if(responseText.code === 0) {
			// 倒计时
			this.messageBox.show({
				msg:'短信已发送到您的手机，请注意查收', 
				type:'alert', 
				autoClose: true
			});
			
			this.validateTarget.className += ' actived';
			this.startCutDownTimer();

			this.validateCodeActive = true;
			this.phoneNoisOk = true;
			
		} else {
			this.phoneNoisOk = false;
			this.hanlderSaveError(responseText);
		}
	},

	hanlderSaveError:function(responseText){
		this.messageBox.show({
			msg:responseText.msg, 
			type:'alert', 
			autoClose: true
		});
	},
	
	doValidate: function(valideCode) {
		var phone = document.querySelector('#phone').value;
		var verifyCode = document.querySelector('#verifyCode').value;
		
		if(phone && phone.match(/[1][1-9][0-9]{9}/g)) {
			
		} else {
			this.messageBox.show({
				msg:'请输入正确的手机号', 
				type:'alert', 
				autoClose: true
			});

			return false;
		}

		/*if(this.phoneNoisOk === false){
			this.messageBox.show({
				msg:'手机号已注册', 
				type:'alert', 
				autoClose: true
			});
			return false;
		}*/

		if(valideCode) {
			if(verifyCode && verifyCode.match(/[0-9]{4}/g)){
				
			} else {
				this.messageBox.show({
					msg:'请输入验证码', 
					type:'alert', 
					autoClose: true
				});

				return false;
			}
		}
			
		return true;
	},
	
	doSendSMS:function(event){
		this.sendSMS();
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
	
	attachEvent: function(){
		var saveBut = document.querySelector('#save');
		var verifyBut = document.querySelector('#getVerifyCode');
		
		saveBut.addEventListener('click', function(event){
			this.doSave(event);
		}.bind(this));
		
		verifyBut.addEventListener('click', function(event){
			this.sendSMS(event);
		}.bind(this));
	}
};

myInfoChangePhone.init();