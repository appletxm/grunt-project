var authorLogin = {
	ajax: null,
	messageBox: null,
	validateTarget: null,
	validateCodeActive: false,

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		this.attachEvent();
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
		param.onSuccess = this.onSuccess.bind(this);
		param.onError = this.onError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);
	},

	validate: function(){
		var phoneNo = document.querySelector('#phoneNo').value;
		var password = document.querySelector('#password').value;

		if(!phoneNo || phoneNo === '' ||  !(/^1[1-9][0-9]\d{4,8}$/).test(phoneNo)){
			return {
				res: false,
				msg:'请输入正确的手机号码'
			}
		}

		if(!password || password === ''){
			return {
				res: false,
				msg:'请输入您的密码'
			}
		}

        return {res: true, msg: ''}
	},

	onSuccess: function(responseText){
		if(responseText.code === 0){
			var params = window.location.search;
			var reg = new RegExp("redirect_uri=([^&?]*)", "ig");

			if(params.match(reg)) {
				var redirect_uri = params.match(reg)[0].substring("redirect_uri".length + 1);
				window.location.href = redirect_uri;
			} else {
				//window.close();
				WeixinJSBridge.call("closeWindow");
			}
            //window.location.href = '../../templates/my/my-information.html';
		}else{
			this.onError(responseText);
		}
	},

	onError: function(responseText){
		clearTimeout(this.messageBox.timer);

		setTimeout(function(){
			this.messageBox.show({
				msg:responseText.msg || '', 
				type:'alert', 
				autoClose: true
			});
		}.bind(this), 0);
	},


	attachEvent: function(){
		var bindObj = document.querySelector('#bindUser');

		bindObj.addEventListener('click', function(event){
			this.doBind();
		}.bind(this), false);
	}
};

authorLogin.init();
