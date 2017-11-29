var myInfoChangeGender = {
	ajax: null,
	messageBox: null,
	removeCardList: [],

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		
		this.attachEvent();
	},

	toggleChecked: function(target){
		var list = document.querySelectorAll('#gender_list .check-list');

		for(var i =0; i<list.length; i++){
			if(target === list[i]){
				list[i].className = 'check-list no-arrow checked';
			}else{
				list[i].className = 'check-list no-arrow';
			}
		}
	},

	doSave:function(event){
		var param = {
			sendParameters:{
			}
		};
		var target;

		target =  event.target;

		if(target.tagName.toLowerCase() !== 'a') {
			return false;
		}

		this.toggleChecked(target);

		param.sendParameters['gender'] = parseInt(target.getAttribute('value'), 10);
		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/info_update/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleSaveSuccess.bind(this);
		param.onError = this.handleSaveError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);

	},

	handleSaveSuccess:function(responseText){
		if(responseText.code === 0){
			window.location.href="my-information.html";
		}else{
			this.handleSaveError(responseText);
		}
	},

	handleSaveError:function(responseText){
		var msg = responseText.msg;

		if(!msg || msg === ''){
			msg = '网络异常，请稍后再试';
		}

		this.messageBox.show({
			msg: msg,
			type: 'alert',
			autoClose: true
		});
	},
	
	attachEvent: function(){
		var maleBut = document.querySelector('#male');
		var femaleBut = document.querySelector('#female');

		maleBut.addEventListener('click', function(event){
			this.doSave(event);
		}.bind(this));
		femaleBut.addEventListener('click', function(event){
			this.doSave(event);
		}.bind(this));
	}
};

myInfoChangeGender.init();