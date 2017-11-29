var userAuthData = {
	code:0,
	msg:'',
	data:[
		{
			authStatus: 2
		}
	]
};

var bankListData = {
	code: 0,
	msg: '',
	data: [
		{
			userBankId: '0001',
			bankName: '农行',
			shortNum: '6788'
		},
		{
			userBankId: '0001',
			bankName: '农行',
			shortNum: '6788'
		}
	]
};

var pointCard = {
	ajax: null,
	messageBox: null,
	popWindow: null,
	removeCardList: [],
	authStatus: 4,

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		this.popWindow = new PopWindow();
		
		this.attachEvent();

		this.checkUserAuthData();
	},

	checkUserAuthData:function(){
		var param = {
			sendParameters:{}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/user_auth_data/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetAuthDataSuccess.bind(this);
		param.onError = this.handleGetAuthDataError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);

		//this.handleGetAuthDataSuccess(userAuthData);
	},

	handleGetAuthDataSuccess: function(responseText){
		if(responseText.code === 0 || responseText.code === '0'){
			this.authStatus = parseInt(responseText.data[0].authStatus, 10);
			this.getCardList();
		}else{
			this.handleGetAuthDataError();
		}
	},

	handleGetAuthDataError: function(){
		this.authStatus = 4;
		this.getCardList();
	},

	getCardList:function(){
		var param = {
			sendParameters:{}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/query_banks/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetCardSuccess.bind(this);
		param.onError = this.handleGetCardError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);

		//this.handleGetCardSuccess(bankListData);

	},

	handleGetCardSuccess:function(responseText){
		if(responseText.code === 0) {
			var cardList = responseText.data;
			var deleteBut = document.querySelector('#deleteSelectedCard');
			var panel = document.querySelectorAll('.my-card ul')[0];
			var noDataTip = document.querySelectorAll('.no-data-tip')[0];
			var footer = document.querySelectorAll('footer')[0];

			footer.style.display = 'block';

			if(cardList.length <= 0){
				deleteBut.style.display = 'none';
				noDataTip.style.display = 'block';
				return false;
			}else{
				deleteBut.style.display = 'block';
				noDataTip.style.display = 'none';

				var i = 0;
				var html = '';

				for(; i < cardList.length; i++){
					html = html + '<li forId="' + cardList[i].userBankId +'">' + cardList[i].bankName + '（<i>尾号为' + cardList[i].shortNum + '</i>）</li>';
				}

				panel.innerHTML = html;
			}
		} else {
			this.handleGetCardError(responseText);
		}
	},

	handleGetCardError:function(responseText){
		this.handleAllError(responseText);
	},

	handleDeleteCardSuccess:function(){
		/*this.getCardList();
		this.removeCardList = [];
		this.popWindow.hide();*/

		window.location.reload();
	},

	handleDeleteCardError:function(responseText){
		this.handleAllError(responseText);
		this.popWindow.hide();
	},

	handleAllError: function(responseText){
		var msg = responseText.msg;

		if(!msg || msg === ''){
			msg = '网络异常，请稍后再试';
		}

		this.messageBox.show({
			msg: msg,
			type:'alert',
			autoClose: true
		});
	},

	handleClick: function(event){
		event.stopPropagation();

		if(event.target.tagName.toLowerCase() === 'li'){
			this.toggleSelected(event);
			event.preventDefault();
		}else if(event.target.tagName.toLowerCase() === 'a'){

		}
		
	},

	toggleSelected: function(event){
		var row = event.target;
		var className = row.className;
		var i = 0;

		if(className && className.indexOf('row-check') >= 0){
			row.className = '';
			for(;i < this.removeCardList.length; i++){
				if(this.removeCardList[i] === row.getAttribute('forid')){
					this.removeCardList.splice(i, 1);
				}
			}

		}else{
			row.className = 'row-check';
			this.removeCardList.push(row.getAttribute('forid'));
		}
	},

	deleteSelectedCard: function(){
		var list = this.removeCardList;

		if(list.length <= 0){
			this.messageBox.show({
				msg: '请选择要删除的银行卡？',
				type: 'alert',
				autoClose: true
			});
		}else{
			this.showDeleteConfirm()
		}
	},

	showDeleteConfirm: function(){
		var param = {
			buttons: [],
			space: {}
		};

		param.needMask = true;
		param.content = '<div class="tip-msg-fixed">确认要删除？</div>';
		param.title = '温馨提示';
		param.space = {
			height: 80
		};
		param.buttons.push(
			{
				text: '确认',
				css: 'save x2',
				callback: 'pointCard.doDeleteCard()'
			},
			{
				text: '取 消',
				css: 'cancel x2',
				callback: 'pointCard.cancelDelete()'
			}
		);

		this.popWindow.show(param);
	},

	doDeleteCard: function(list){
		list = this.removeCardList;

		var param = {
			sendParameters:{
				'del_Banks' : list.join(",")
			}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/del_banks/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = pointCard.handleDeleteCardSuccess.bind(this);
		param.onError = pointCard.handleDeleteCardError.bind(this);
		param.mssage = this.messageBox;

		this.popWindow.popWindow.querySelectorAll('.container')[0].style.display = 'none';

		this.ajax.send(param);
		//this.handleDeleteCardSuccess();
	},

	cancelDelete: function(){
		this.popWindow.hide();
	},

	doAddCard: function(event){
		/*if(!this.authStatus || this.authStatus !== 1){
			this.messageBox.show({
				 msg: '用户没有通过认证，不能添加银行卡',
				 type: 'alert',
				 autoClose: true
			});

			event.preventDefault();
		}*/
	},

	attachEvent: function(){
		var listPanel = document.querySelectorAll('.my-card')[0];
		var deleteBut = document.querySelector('#deleteSelectedCard');
		var addBut = document.querySelector('#addBankCard');

		listPanel.addEventListener('click', function(event){
			this.handleClick(event);
		}.bind(this));

		deleteBut.addEventListener('click', function(){
			this.deleteSelectedCard();
		}.bind(this));

		addBut.addEventListener('click', function(event){
			this.doAddCard(event);
		}.bind(this));
	}
};

pointCard.init();