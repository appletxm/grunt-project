var pointAdmin = {
	ajax: null,
	messageBox: null,
	removeCardList: [],

	authStatus:4,

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		
		this.attachEvent();

		//this.getPointList();
		this.checkUserAuthData();
	},

	getPointList:function(){
		var param = {
			sendParameters:{}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/query_points/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.hanlderGetPointSuccess.bind(this);
		param.onError = this.hanlderGetPointError.bind(this);
		param.mssage = this.msessageBox;

		this.ajax.send(param);

	},

	hanlderGetPointSuccess:function(responseText){
		if(responseText.code === 0){
			if(responseText.data && responseText.data.length > 0) {
				var info = responseText.data[0];
				document.querySelector('#canMentionPoint').innerHTML = info.canMentionPoint;
				document.querySelector('#totalPoint').innerHTML = info.totalPoint;
				document.querySelector('#grandMention').innerHTML = info.grandMention;
			}
		}else{
			this.hanlderGetPointError(responseText);
		}
	},

	hanlderGetPointError:function(responseText){
		this.messageBox.show({
				msg:responseText.msg, 
				type:'alert', 
				autoClose: true
			});
	},
	
	applyCash: function() {
		var canMentionPoint = document.querySelector('#canMentionPoint').innerHTML;
		var msg = '';

		canMentionPoint = canMentionPoint ? Number(canMentionPoint) : 0;

		if(canMentionPoint < 2000 && this.authStatus !== 1) {
			msg = '积分不足2000且未通过身份认证，无法申请提现！';
		}else if(canMentionPoint < 2000 && this.authStatus === 1) {
			msg = '积分不足2000，无法申请提现！';
		}else if(canMentionPoint >= 2000 && this.authStatus !== 1) {
			msg = '尚未通过身份认证，无法申请提现！';
		}else{
			window.location.href = "point-cash.html";
		}

		if(msg !== ''){
			this.messageBox.show({
				msg: msg,
				type:'alert',
				autoClose: true
			});
		}
	},

	checkUserAuthData:function(){
		var param = {
			sendParameters:{}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/user_auth_data/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetAuthDataSuccess.bind(this);
		param.onError = this.handleGetAuthData.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);
	},

	handleGetAuthDataSuccess: function(responseText){
		if(responseText.code === 0 || responseText.code === '0'){
			this.authStatus = parseInt(responseText.data[0].authStatus, 10);
			this.getPointList();
		}else{
			this.handleGetAuthData();
		}
	},

	handleGetAuthData: function(){
		this.authStatus = 4;
		this.getPointList();
	},
	
	attachEvent: function(){

		var applyBut = document.querySelector('#apply');

		applyBut.addEventListener('click', function(){
			this.applyCash();
		}.bind(this));
	}
};

pointAdmin.init();