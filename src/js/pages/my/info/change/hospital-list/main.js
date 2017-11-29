var hospitalData = {
	code:0,
	msg: '',
	data:[
		{
			id: 00001,
			name: '中国医院'
		},
		{
			id: 00002,
			name: '中国医院内容'
		},
		{
			id: 00003,
			name: '每家用医院大院好用的东西'
		},
		{
			id: 00004,
			name: '是一家美容院'
		}
	]
};

var myInfoChangeHospitalList = {
	ajax: null,
	messageBox: null,
	searchFromCache: null,
	popWindow: null,

	urlParams:{},
	hospitalList:[],
	selectedHospitalId: null,

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		this.popWindow = new PopWindow();
		this.searchFromCache = new SearchFromCache();
		
		this.attachEvent();
		this.getHospitalList();
	},
	
	getHospitalList: function() {

		this.urlParams = window.location.search.getValueFromUrl();
		
		document.querySelector('#hospital_list').innerHTML = '<a class="selected">' + decodeURIComponent(this.urlParams['name']) + '</a>';
		
		var param = {
			sendParameters:{
				'cityId' : this.urlParams['cityId']
			}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/hospital_list/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetHospitalListSuccess.bind(this);
		param.onError = this.handleError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);

		//this.handleGetHospitalListSuccess(hospitalData);
	},
	
	handleGetHospitalListSuccess: function(responseText) {
		var listPanel = document.querySelector('#hospital_list');
		var html = listPanel.innerHTML;

		if(responseText.code === 0) {
			this.hospitalList = responseText.data;
			listPanel.innerHTML = html + this.getHospitalListHtml(this.hospitalList);

		} else {
			this.handleError(responseText);
		}
	},

	getHospitalListHtml: function(hospitalList){
		var html = '';

		for(var i=0; i<hospitalList.length; i++){
			html += '<a onclick="myInfoChangeHospitalList.selectHospitalFromList(event)" value="' + hospitalList[i].id + '">' + hospitalList[i].name + '</a>';
		}

		html += '<a onclick="myInfoChangeHospitalList.addNewHospital();">其他</a>';

		return html;
	},

	selectHospitalFromList: function(event){
		this.doSave(event.target.getAttribute('value'));
	},

	doSave: function(id, cityId) {
		var param = {
			sendParameters:{
				'hospitalId': id
			}
		};

		if(cityId){
			param.sendParameters['cityId'] = cityId;
			param.sendParameters['hospitalId'] = 0;
			param.sendParameters['hospitalName'] = id;
		}

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/info_update/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleSaveSuccess.bind(this);
		param.onError = this.handleError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);
	},
	
	handleSaveSuccess: function(responseText) {
		if(responseText.code === 0) {
			window.location.href = "my-information.html";
		} else {
			this.handleError(responseText);
		}
	},

	handleError:function(responseText){
		var msg = responseText.msg;
		if(!msg || msg === ''){
			msg = '网络异常，请稍后重试!';
		}
		this.messageBox.show({
			msg: msg,
			type:'alert', 
			autoClose: true
		});
	},

	addNewHospital: function(){
		var params = {
			popWindow: this.popWindow,
			title: '输入医院名称',
			placeHolder: '请输入医院名称',
			pageJSObjName: 'myInfoChangeHospitalList',
			pageJSObj: myInfoChangeHospitalList,
			cacheDataList: this.hospitalList,
			okCallBack: this.doSaveNewHospital.bind(this),
			cancelCallBack: this.cancelNewHospitalCallback.bind(this),
			selectedTipListCallback: this.selectSearchItem.bind(this),
			messageBox: this.messageBox,
			errorMsg: '请输入正确的医院名称'
		}

		this.searchFromCache.showSearchBox(params);
	},

	selectSearchItem: function(hId){
		this.selectedHospitalId = hId;
	},

	doSaveNewHospital: function(name){
		if(this.selectedHospitalId){
			this.doSave(this.selectedHospitalId);
		}else{
			this.doSave(name, this.urlParams['cityId']);
		}
		this.selectedHospitalId = null;
	},

	cancelNewHospitalCallback: function(){
		//this.popWindow.hide();
	},
	
	attachEvent: function(){
		
	}
};

myInfoChangeHospitalList.init();