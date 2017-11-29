var myInfoChangeMajor = {
	ajax: null,
	messageBox: null,
	removeCardList: [],

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
		document.querySelector('#expertise').value = decodeURIComponent(urlParams['expertise']);
		
	},

	doSave:function(event){
		var expertise = document.querySelector('#expertise').value
		if(expertise && expertise.length > 300) {
			this.messageBox.show({
				msg:'请输入少于300字的内容', 
				type:'alert', 
				autoClose: true
			});
			return;
		}
		var param = {
			sendParameters:{
				'expertise': expertise,
				'update_expertise': true
			}
		};

		if(expertise === ''){
			param.sendParameters['delType'] = 1;
		}

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

		saveBut.addEventListener('click', function(event){
			this.doSave(event);
		}.bind(this));
	}
};

myInfoChangeMajor.init();