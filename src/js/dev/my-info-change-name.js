var myInfoChangeName = {
	ajax: null,
	messageBox: null,
	removeCardList: [],
	userNameLen:{
		max: 16,
		min: 2
	},

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		
		this.attachEvent();
		this.initValue();
	},
	
	initValue: function(){
		
		var keys = window.location.search.match(/(.[^?|&]+)=/g);
		var values= window.location.search.match(/=(.[^&]*)/g);
		var self = this;

		if(!keys || !values){
			return false;
		}
		urlParams = {};
		keys.forEach(function(key, index){
			urlParams[key.replace(/=|\?|&/g, '')] = values[index].replace('=', '');
		});
		document.querySelector('#name').value = decodeURIComponent(urlParams['name']);
		
	},

	doSave:function(){
		var name = document.querySelector('#name').value;
		var msg = '';

		if((!name) || name == '') {
			msg = '请输入正确的姓名';
		}

		if(!name.isNormalText(this.userNameLen.min, this.userNameLen.max)) {
			msg = '请输入正确的姓名';
		}

		if(msg !== ''){
			this.messageBox.show({
				msg: msg,
				type:'alert',
				autoClose: true
			});
			return ;
		}

		var param = {
			sendParameters:{
				'name': name
			}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/info_update/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.hanlderSaveSuccess.bind(this);
		param.onError = this.hanlderSaveError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);

	},

	hanlderSaveSuccess:function(responseText){

		if(responseText.code === 0){
			window.location.href="my-information.html";
		}else{
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
	
	attachEvent: function(){
		var saveBut = document.querySelector('#save');

		saveBut.addEventListener('click', function(){
			this.doSave();
		}.bind(this));
	}
};

myInfoChangeName.init();