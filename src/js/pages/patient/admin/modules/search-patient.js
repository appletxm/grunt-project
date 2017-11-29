// 测试数据
var mockSearchPatientList = {
	"code": 0,
	"msg": "成功",
	"data": [
		{
			"id": 1,
			"patientIcon": "http://file-www.sioe.cn/201109/14/222211817.jpg",
			"name": "我叫被搜索1",
			"gender": 1,
			"age": 123,
			"createTime": 1434680904000
		}
	]
};

var searchPatient = {
	ajax: null,
	messageBox: null,
	searchFromDatabase: null,

	requestUrl: SYS_VAR.SERVER_ADDRESS,

	pageObj: null,

	init: function(params){
		if(params){
			this.pageObj = params.pageObj;

			this.ajax = params.pageObj['ajaxForPatient'];
			this.messageBox = params.pageObj['messageBox'];
			this.searchFromDatabase = new SearchFromDatabase();

			this.searchFromDatabase.init({
				callback: searchPatient.doSearch.bind(this),
				messageBox: searchPatient.messageBox,
				pageObj: searchPatient,
				pageObjString: 'searchPatient',
				searchObjString: 'searchFromDatabase',
				bindObj: document.querySelector('#searchBinObj'),
				tipText: '搜索',
				onchangeCallback: searchPatient.handleInputChange.bind(searchPatient)
			});

			this.attacheEvent();
		}
	},

	doSearch: function(searchKey){
		searchKey = searchKey || this.searchFromDatabase.key;

		if(!searchKey){
			return;
		}

		var param = {
			sendParameters:{
				'key': searchKey
			}
		};

		var url = 'doc/search_patient/';
		var callbackFunction = this.doSearchSuccess;

		this.clearSearchList();

		this.pageObj.doRequest(url, param, callbackFunction, searchPatient, this.ajax);
		this.showOrHidePatientList(false);

		//this.doSearchSuccess(mockSearchPatientList);
	},

	doSearchSuccess: function(responseText){
		var content = [];
		var panel = document.querySelector("#patient-search-list");

		if(responseText.code === 0){

			if(responseText.data && responseText.data.length > 0) {
				content.push('<span>');
				content = content.concat(patientList.getPatientListHtml(responseText.data));
				content.push('</span>');

				panel.innerHTML = content.join('');
				this.showOrHidePatientList(false);

				this.pageObj.hideLoading();
			} else {
				this.pageObj.handleGetError({'msg': '没有找到您要搜索的患者'});
			}
		} else {
			this.pageObj.handleGetError(responseText);
		}
	},

	showOrHidePatientList: function(isShow){
		var patientList = document.querySelector('#patient-list');
		var patientSearchList = document.querySelector('#patient-search-list');
		var input = document.querySelectorAll('#searchBinObj input')[0];

		//TODO just comment the abc bar for next version
		/*var abcBar = document.querySelector('#abcSideBarOuter');
		abcBar.style.display = isShow ? 'block' : 'none';*/

		patientList.style.display = isShow ? 'block' : 'none';
		patientSearchList.style.display = isShow ? 'none' : 'block';
		input.value = isShow ? '' : input.value;
	},

	handleInputChange: function(event){
		var value = event.currentTarget.querySelectorAll('input')[0].value;

		if(!value || value === ''){
			this.showOrHidePatientList(true);
		}
	},

	clearSearchList: function(){
		document.querySelector('#patient-search-list').innerHTML = '';
	},

	attacheEvent: function(){
		var searchPanel = document.querySelector('#searchBinObj'),
			input = document.querySelectorAll('#searchBinObj input')[0];

		searchPanel.addEventListener('keyup', function(){
			this.handleInputChange(event);
		}.bind(this));

		input.addEventListener('focus', function(){
			document.querySelector('#abcSideBarOuter').style.display = 'none';
		});

		input.addEventListener('blur', function(){
			if(this.value === ''){
				document.querySelector('#abcSideBarOuter').style.display = 'block';
			}
		});
	}
};