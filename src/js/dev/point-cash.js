var mockData = {
	msg: '',
	code: 0,
	data:[{
		authStatus: 1,
		grandMention: 2454,
		totalPoint: 2057,
		canMentionPoint: 2057,
		minApplyPoint: 2000,
		bankCard: null,
		canMentionMon: 20570
	}]
};

var bankListData ={
	code: 0,
		msg: '',
	data:[
		{
			userBankId: '000009',
			bankName: '中国银行',
			shortNum: '34567',
			longNum: '33456789000034567'
		}
	]
};

var pointCash = {
	ajax: null,
	messageBox: null,
	popWindow: null,
	bankList:[],
	selectedBankInfo: {
		userBankId: '',
		name:''
	},

	init:function(){
		this.messageBox = new MessageBox();
		this.ajax = new Ajax();
		this.popWindow = new PopWindow();
		this.attachEvent();
		this.getPointInfo();
	},
	
	getPointInfo: function() {
		var param = {
			sendParameters:{}
		};
		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/query_points/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetPointSuccess.bind(this);
		param.onError = this.handleGetPointError.bind(this);
		param.mssage = this.msessageBox;

		this.ajax.send(param);

		//this.handleGetPointSuccess(mockData);
	},
	
	handleGetPointSuccess:function(responseText){

		if(responseText.code === 0){
			if(responseText.data && responseText.data.length > 0) {
				var info = responseText.data[0];
				var canMentionMon;
				var canMentionMonYuan;

				canMentionMon = canMentionMonYuan = info.canMentionMon;
				if(canMentionMonYuan) {
					canMentionMonYuan = (canMentionMonYuan / 100.0).toFixed(2);
				}

				if(info.bankCard){
					this.selectedBankInfo.userBankId = info.bankCard.userBankId;
					this.selectedBankInfo.name = info.bankCard.bankName;
					this.selectedBankInfo.combineName = info.bankCard.bankName + "(" + info.bankCard.shortNum + ")";
					this.selectedBankInfo.bankCardNumA = info.bankCard.longNum || 0;
					this.selectedBankInfo.branch = info.bankCard.branch || '';
				}

				document.querySelector('#canMentionMonYuan').innerHTML = canMentionMonYuan;
				document.querySelector('#canMentionMon').innerHTML = canMentionMon;
				document.querySelector('#bank').innerHTML = this.selectedBankInfo.combineName || '请选择银行卡';
			}
		}else{
			this.handleGetPointError(responseText);
		}
	},

	handleGetPointError:function(responseText){
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

	applyCash: function(){
		if(this.doValidate()){
			var param = {};
			param.url = SYS_VAR.SERVER_ADDRESS + 'doc/apply_cash/';
			param.type = 'GET';
			param.asyn = true;
			param.sendParameters = {
				'card_id': this.selectedBankInfo.userBankId,
				'mentionMon': document.querySelector('#canMentionMon').innerHTML
			};
			param.onSuccess = this.applyCashSuccess.bind(this);
			param.onError = this.applyCashError.bind(this);
			param.mssage = this.messageBox;

			this.ajax.send(param);
		}
	},

	doValidate: function(){
		
		if(!this.selectedBankInfo.userBankId || this.selectedBankInfo.userBankId === ''){
			this.messageBox.show({
				msg:'请选择银行卡',
				type:'alert', 
				autoClose: true
			});
			return false;
		}

		if(!this.selectedBankInfo.branch || this.selectedBankInfo.branch === ''){
			this.showAddBranchMessage();
			return false;
		}

		return true;
	},

	showBankList: function(html){
		var param = {
			buttons: [],
			space: {}
		};

		param.needMask = true;
		param.title = '选择银行卡';
		param.space = {
			top: 50,
			left: 20
		};
		param.content = html;
		param.buttons.push(
			{
				text: '取 消',
				css: 'cancel x1',
				callback: 'pointCash.cancelSelectBankCallback()'
			}
		);

		this.popWindow.show(param);
	},

	selectedBankCallback: function(event){
		var target = event.currentTarget;

		var branch = target.getAttribute('branch');

		this.selectedBankInfo.userBankId = target.getAttribute('userBankId');
		this.selectedBankInfo.name = target.getAttribute('realName');
		this.selectedBankInfo.combineName = target.getAttribute('name');
		this.selectedBankInfo.bankCardNumA = target.getAttribute('cardNo');
		this.selectedBankInfo.branch = target.getAttribute('branch') || '';

		if(!branch || branch === ''){
			this.showAddBranchMessage();
		}else{
			document.querySelector('#bank').innerHTML = this.selectedBankInfo.name;
			this.popWindow.hide();
		}
	},

	cancelSelectBankCallback: function(){
		this.popWindow.hide();
	},

	getBankList: function(){
		if(this.bankList.length > 0) {
			var html = this.getBankListHtml(this.bankList);
			this.showBankList(html);
			return;
		}

		var param = {};
		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/query_banks/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.getBankListSuccess.bind(this);
		param.onError = this.getBankListError.bind(this);
		param.mssage = this.msessageBox;

		this.ajax.send(param);

		//this.getBankListSuccess(bankListData);
	},

	getBankListHtml: function(bankList){

		var html = '<div class="my-card" style="padding-bottom:0;"><div class="my-time card-list">';
		for(var i=0; i<bankList.length; i++){
			var branch = bankList[i].branch;

			if(!branch || branch === '' || branch === 'null' || branch === 'undefined'){
				branch = '';
			}

			html += '<dl userBankId="' + bankList[i].userBankId + '" branch="' + branch + '" onclick="pointCash.selectedBankCallback(event)" name="' + bankList[i].bankName + '(' + bankList[i].shortNum + ')" realName="' + bankList[i].bankName + '" cardNo="' + (bankList[i].longNum || 0) +'">';
			html += '<dt style="display:none;"></dt><dd style="margin-left:0;">' + bankList[i].bankName + '<span class="gray">(' + bankList[i].shortNum + ')</span></dd>';
			html += '</dl>';
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
			this.getBankListError(responseText);
		}
	},

	getBankListError: function(responseText){
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
	
	applyCashSuccess: function(responseText) {
		if(responseText.code === 0) {
			window.location.href = 'point-admin.html';
		} else {
			this.applyCashError(responseText);
		}
	},

	showAddBranchMessage: function(){
		var param = {
			buttons: [],
			space: {}
		};

		param.needMask = true;
		param.space = {
			height: 100
		};
		param.content = '<div class="tip-msg-fixed">需补充当前银行卡的开户信息才可以成功提现哦~</div>';
		param.title = '温馨提示';
		param.buttons.push(
			{
				text: '立即去完善',
				css: 'save x2',
				callback: 'pointCash.addBranchInfo()'
			},
			{
				text: '取 消',
				css: 'cancel x2',
				callback: 'pointCash.cancelAddBranchInfo()'
			}
		);

		this.popWindow.show(param);
	},

	cancelAddBranchInfo: function(){
		this.popWindow.hide();
	},

	addBranchInfo: function(){
		var bank = this.selectedBankInfo;
		var id;
		var name;
		var no;
		var combineName;

		id = encodeURIComponent(bank.userBankId);
		name = encodeURIComponent(bank.name);
		combineName = encodeURIComponent(bank.combineName);
		no = encodeURIComponent(bank.bankCardNumA);

		window.location = 'point-card-add-card.html?userBankId=' + id + '&name=' + name + '&bankCardNum=' + no + '&combineName=' + combineName;
	},

	applyCashError: function(responseText) {
		this.messageBox.show({
			msg:responseText.msg, 
			type:'alert', 
			autoClose: true
		});
	},

	attachEvent: function(){
		var but = document.querySelector('#chooseBank');
		var addBut = document.querySelector('#save');

		but.addEventListener('click', function(){
			this.getBankList();

		}.bind(this), false);

		addBut.addEventListener('click', function(){
			this.applyCash();

		}.bind(this), false);
	}
};

pointCash.init();
