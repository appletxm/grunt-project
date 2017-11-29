'use strict';

var mockDepartData = {
	"code": 0,
	"msg": "成功",
	"data": [{
		"departmentList": [
			{
				"parentId": 1,
				"departName": "肿瘤内科大一",
				"departId": 8
			},
			{
				"parentId": 1,
				"departName": "肿瘤内科大二",
				"departId": 9,
				"secondDepart": [
					{
						"id": 90,
						"name": "感染内科一",
						"parentId": 9
					},
					{
						"id": 91,
						"name": "感染内科二",
						"parentId": 9
					}
				]
			},
			{
				"parentId": null,
				"departName": "很长的一个科室名称很长很长",
				"departId": 6
			}
		]
	}]
};

var myInfoChangeDepart = {
	ajax: null,
	messageBox: null,
	popWindow: null,
	searchFromCache: null,

	departmentList: [],
	departmentCacheList: [],
	selectedDepartId: null,

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		this.popWindow = new PopWindow();
		this.searchFromCache = new SearchFromCache();
		
		this.attachEvent();
		this.getDepartList();
	},
	
	getDepartList: function() {
		
		var param = {
			sendParameters:{}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/department_and_title/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetLevelSuccess.bind(this);
		param.onError = this.handleError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);

		//this.handleGetLevelSuccess(mockDepartData);
	},

	handleGetLevelSuccess: function(responseText) {
		var html;

		if(responseText.code === 0) {
			this.departmentList = responseText.data[0].departmentList;
			this.orderList();

			html = this.getDepartListHtml(this.departmentList)

			document.querySelector('#depart_list').innerHTML = html;
		} else {
			this.handleError(responseText);
		}
	},

	orderList: function(){
		var listHaveNextLevel = [];
		var listNoNextLevel = [];
		var list = this.departmentList;

		for(var i = 0; i < list.length; i++){
			list[i]['id'] = list[i]['departId'];
			list[i]['name'] = list[i]['departName'];

			if(!list[i]['secondDepart'] || list[i]['secondDepart'].length <= 0){
				listNoNextLevel.push(list[i]);
			}else{
				listHaveNextLevel.push(list[i]);
			}
		}

		this.departmentList = listNoNextLevel.concat(listHaveNextLevel);
		this.departmentCacheList = listNoNextLevel;
	},

	getDepartListHtml: function(departList){
		var html = '';

		for(var i=0; i<departList.length; i++){
			var secondLevel = departList[i].secondDepart;
			var arrowText;
			var parentId;
			var clickOrHref;

			if(!secondLevel || secondLevel.length <= 0){
				parentId = '';
				arrowText = 'class="check-list no-arrow"';
				clickOrHref = 'onclick="myInfoChangeDepart.selectedDepartment(event)"'
			}else{
				parentId = departList[i].parentId;
				arrowText = 'class=""';
				clickOrHref = 'href="my-info-change-depart-second.html?parentId=' + departList[i].departId + '"';
			}
			html += '<a ' + clickOrHref + ' parentId="' + parentId + '" value="' + departList[i].departId + '" ' + arrowText + '>' + departList[i].departName + '</a>';
		}

		html += '<a onclick="myInfoChangeDepart.addNewDepartment();">其他</a>';

		return html;
	},

	addNewDepartment: function(){
		var params;

		params = {
			popWindow: this.popWindow,
			title: '输入自定义科室名',
			placeHolder: '输入自定义科室名',
			pageJSObjName: 'myInfoChangeDepart',
			pageJSObj: myInfoChangeDepart,
			cacheDataList: this.departmentCacheList,
			okCallBack: this.doSaveNewDepart.bind(this),
			cancelCallBack: this.cancelNewDepartCallback.bind(this),
			selectedTipListCallback: this.selectSearchItem.bind(this),
			messageBox: this.messageBox,
			errorMsg: '请输入正确的科室名称',
			inputLen: 10,
			mask: true
		}

		this.searchFromCache.showSearchBox(params);
	},

	doSaveNewDepart: function(name){

		if(this.selectedDepartId){
			this.doSave(this.selectedDepartId);
		}else{
			this.doSave(0, name);
		}
		this.selectedDepartId = null;
	},

	cancelNewDepartCallback: function(){
		this.popWindow.hide();
	},

	selectSearchItem: function(hId){
		this.selectedDepartId = hId;
	},

	selectedDepartment:function(event){
		var target = event.currentTarget;
		var value = target.getAttribute("value");
		var parentId = target.getAttribute("parentId");

		this.toggleChecked(target);

		this.doSave(value);
	},

	doSave: function(value, departName){
		var param = {
			sendParameters:{
				'departmentId': value
			}
		};

		if(departName && departName !== ''){
			param.sendParameters['customDepartment'] = departName
		}

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/info_update/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleSaveSuccess.bind(this);
		param.onError = this.handleError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);
	},

	toggleChecked: function(target){
		var list = document.querySelectorAll('#depart_list .check-list');

		for(var i =0; i<list.length; i++){
			if(target === list[i]){
				list[i].className = 'check-list no-arrow checked';
			}else{
				list[i].className = 'check-list no-arrow';
			}
		}
	},

	handleSaveSuccess:function(responseText){
		if(responseText.code === 0){
			window.location.href = "my-information.html";
		}else{
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
	
	attachEvent: function(){
	}
};

myInfoChangeDepart.init();