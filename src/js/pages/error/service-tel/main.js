
var error={
	serverAddress: SYS_VAR.SERVER_ADDRESS,
	ajax: null,

	init: function(){
		this.ajax = new Ajax();

		this.getServiceTel();
	},

	getServiceTel: function(){
		var param = {
			sendParameters:{}
		};

		param.sendParameters.sendTime = new Date().getTime();
		param.sendParameters.action = 'get';
		param.url = this.serverAddress + 'chat_api/get_consult';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetStatusSuccess.bind(this);

		this.ajax.send(param);
	},

	handleGetStatusSuccess:function(responseText){

		if(responseText.code === 0 || responseText.code === '0'){
			this.showTel(responseText.data);
		}else{
			this.showTel('020-29198502');
		}
	},

	showTel: function(tel){
		document.querySelector('#serviceTel').innerHTML = '<a href="tel://' + tel.replace(/-|_/g, '') + '">' + tel + '</a>';
	}
};

error.init();