var authorSkip = {
	ajax: null,
	messageBox: null,

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		this.attachEvent();
	},

	doAuthor: function(event){
		if(!this.validate()){
			this.messageBox.show({
				msg:'请输入正确的手机号码', 
				type:'alert', 
				autoClose: true
			});
		}else{
			this.doAjax();
		}
		event.preventDefault();
	},

	doAjax: function(){
		var phoneNo = document.querySelector('#phoneNo').value;
		var param = {
			sendParameters:{}
		};

		/*
			url: // String URL
			type: // String GET or POST 
			sendParameters: //JSON if the ajax is post then these parameters will be keep here
			asyn: //Boolean if need asyn it should be set true
			onSuccess: //callbacks function
			onError: //callback function
			cache:  //Boolean
			isJsonp: //Boolean if the ajax is jsonp
			callback: //String just use for jsonp
			needNewScript: //Boolean just use for jsonp
			mssage: //Object jsut use for halding ajax message
		*/

		param.sendParameters.phoneNum = phoneNo;
		param.url = 'http://10.7.31.17:9001/doc/checkphone/';
		param.type = 'GET';
		param.asyn = true;
		//param.isJsonp = true;
		//param.callback = 'authorSkip.jsonpCallback';
		param.onSuccess = this.onSuccess.bind(this);
		param.onError = this.onError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);

	},

	validate: function(){
		var phoneNo = document.querySelector('#phoneNo').value;

		if(phoneNo && phoneNo !== '' && (/^1[3|5|8][0-9]\d{4,8}$/).test(phoneNo)){
			return true
		}else{
			return false;
		}
	},

	onSuccess: function(result){
		if(result.msg.code === 0 || result.msg.code === '0'){
			window.location.href = 'author-login.html?phoneNum=' + document.querySelector('#phoneNo').value;
		}else{
			window.location.href = 'user-register.html?phoneNum=' + document.querySelector('#phoneNo').value;
		}
	},

	onError: function(result){
		this.messageBox.show({
			msg:'请输入正确的手机号码', 
			type:'alert', 
			autoClose: true
		});
	},

	jsonpCallback: function(result){
		console.info('jsonpCallback----', result);
	},


	attachEvent: function(){
		var but = document.querySelector('#doAuthor');

		but.addEventListener('click', function(event){
			this.doAuthor(event);

		}.bind(this), false);
	}
};

authorSkip.init();
