var addCard = {
	ajax: null,
	messageBox: null,
	popWindow: null,
	removeCardList: [],
	bankList:[],
	selectedBackInfo: {
		user: '',
		card:'',
		bank: {},
		branch: ''
	},
	urlParameters:{},
	isModifyData: false,

	init:function(){
		this.messageBox = new MessageBox();
		this.ajax = new Ajax();
		this.popWindow = new PopWindow();

		this.getUrlParameters();
		this.attachEvent();
		this.getUserInfo();
	},

	getUrlParameters: function(){
		var searchStr = window.location.search.replace('?', '');

		if(!searchStr || searchStr === ''){
			return false;
		}

		document.querySelectorAll('title')[0].innerHTML = '修改银行卡';
		this.urlParameters = searchStr.getValueFromUrl();
		this.isModifyData = true;
		this.setDefaultValue(this.urlParameters);
	},

	setDefaultValue: function(bankInfo){
		var carNo = document.querySelector('#cardNo');

		document.querySelector('#chooseBank').innerHTML = '<dt>银行卡</dt><dd id="bank"><input readonly value="' + (bankInfo.name || '') + '" /></dd>';
		carNo.setAttribute('readonly', 'true');
		carNo.setAttribute('value', bankInfo.bankCardNum);

		this.selectedBackInfo.name = bankInfo.name;
		this.selectedBackInfo.id = bankInfo.userBankId;
		this.selectedBackInfo.card = bankInfo.bankCardNum;
	},

	getUserInfo: function(){
		var param = {};
		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/get_info/';
		param.type = 'GET';
		param.asyn = true;
		param.sendParameters = {};
		param.onSuccess = this.handleGetUserInfoSuccess.bind(this);
		param.onError = this.handleError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);

		/*this.handleGetUserInfoSuccess({
			code: 0,
			msg: '',
			data: [
				{
					name: '张三'
				}
			]
		});*/
	},
	
	handleGetUserInfoSuccess: function(responseText) {
		if(responseText.code === 0) {
			document.querySelector('#useName').value = responseText.data[0].name;
		} else {
			this.handleError(responseText);
		}
	},

	addNewCard: function(){
		var validate = this.doValidate();

		if(validate.res !== true){
			this.messageBox.show({
				msg: validate.msg,
				type: 'alert',
				autoClose: true
			});
			return false;
		}

		var param = {};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/add_bank/';
		param.type = 'GET';
		param.asyn = true;
		param.sendParameters = {
			'bankCardNum':validate.cardNo,
			'branch' : validate.branch,
			'userType': 1
		};

		if(this.isModifyData === true){
			param.url = SYS_VAR.SERVER_ADDRESS + 'doc/edit_bank/';
			param.sendParameters['userBankId'] = this.selectedBackInfo.id;
		}else{
			param.sendParameters['name'] = validate.user;
			param.sendParameters['bId'] = this.selectedBackInfo.id;
		}

		//alert(JSON.stringify(param.sendParameters, '\n', '  '));

		param.onSuccess = this.addBankSuccess.bind(this);
		param.onError = this.handleError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);
	},

	doValidate: function(){
		var user = document.querySelector('#useName').value;
		var cardNo = document.querySelector('#cardNo').value;
		var branch = document.querySelector('#branch').value;

		if(!user || user === '' || !user.isNormalText(2, 16)){
			return {
				res: false,
				msg: '没有获取到有效的用户名，请稍后重试'
			};
		}

		if(this.isModifyData !== true){
			if(!this.selectedBackInfo.name || this.selectedBackInfo.name === ''){
				return {
					res: false,
					msg: '请选择银行'
				};
			}

			if(!cardNo || cardNo === '' || !cardNo.isNumber(16, 30)){
				return {
					res: false,
					msg: '请输入正确的银行卡号'
				};
			}
		}

		if(!branch || branch === '' || !branch.isNormalText(5)){
			return {
				res: false,
				msg: '请输入正确的开户行信息'
			};
		}

		return {
			res: true,
			msg: '',
			user: user,
			cardNo: cardNo,
			branch: branch
		};
	},

	showBankList: function(html){
		var param = {
			buttons: [],
			space: {}
		};

		param.needMask = true;
		param.title = '选择银行';
		param.space = {
			top: 50,
			left: 20
		};

		param.content = html;
		param.buttons.push(
			{
				text: '取 消',
				css: 'cancel x1',
				callback: 'addCard.cancelSelectBankCallback()'
			}
		);

		this.popWindow.show(param);
		this.messageBox.hide();
	},

	selectedBankCallback: function(event){
		var target = event.currentTarget;
		
		this.selectedBackInfo.id = target.getAttribute('bId');
		this.selectedBackInfo.bCode = target.getAttribute('bCode');
		this.selectedBackInfo.name = target.getAttribute('bank');

		document.querySelector('#bank').innerText = this.selectedBackInfo.name;
		this.popWindow.hide();
	},

	cancelSelectBankCallback: function(){
		this.popWindow.hide();
	},

	getBankList: function(){
		/*this.bankList = [{
			bId:'00001',
			bCode:'00000',
			bName: 'xxxbank',
			bIcon: '../../styles/images/blank.png',
			branch: ''
		}];*/
		
		if(this.bankList.length > 0) {
			var html = this.getBankListHtml(this.bankList);
			this.showBankList(html);
			return;
		}
		
		var param = {};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/support_banks/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.getBankListSuccess.bind(this);
		param.onError = this.handleError.bind(this);
		param.mssage = this.msessageBox;

		this.ajax.send(param);
		
	},

	getBankListHtml: function(bankList){
		var html = '<div class="my-card" style="padding-bottom:0;"><div class="my-time card-list">';
		for(var i=0; i<bankList.length; i++){
			html += '<dl bId="' + bankList[i].bId + '" bCode="' + bankList[i].bCode + '" onclick="' + 'addCard.selectedBankCallback(event)' + '" bank="' + bankList[i].bName  +'""><dt><img src="' + bankList[i].bIcon +'" height="40" /></dt><dd>' + bankList[i].bName + '</dd></dl>'
		}
		html += '</div></div>';
		return html;
	},

	getBankListSuccess: function(responseText){
		var html = '';
		if(responseText.code === 0){
			this.bankList = responseText.data;
			html = this.getBankListHtml(this.bankList);
			this.showBankList(html);
		}else{
			this.handleError(responseText);
		}
	},
	
	addBankSuccess: function(responseText) {
		if(responseText.code === 0) {
			if(this.isModifyData === true){
				window.location.href = 'point-cash.html';
			}else{
				window.location.href = 'point-card.html';
			}
		} else {
			this.handleError(responseText);
		}
	},

	handleError: function(responseText) {
		this.messageBox.show({
				msg:responseText.msg, 
				type:'alert', 
				autoClose: true
			});
	},

	attachEvent: function(){
		var but = document.querySelector('#chooseBank');
		var addBut = document.querySelector('#addNewCard');

		but.addEventListener('click', function(){
			this.getBankList();

		}.bind(this), false);

		addBut.addEventListener('click', function(){
			this.addNewCard();

		}.bind(this), false);
	}
};

addCard.init();
