'use strict';

var mockDepartList = {
	"code": 0,
	"msg": "成功",
	"data": [{
		"departmentList": [
			{
				"parentId": 1,
				"departName": "肿瘤内科大一",
				"departId": 8,
				"secondDepart": []
			},
			{
				"parentId": 1,
				"departName": "肿瘤内科大二",
				"departId": 9,
				"secondDepart": [
					{
						"id": 90,
						"name": "感染内科一",
						"parentId": 9,
						"departName": "肿瘤内科大一",
						"departId": 8
					},
					{
						"id": 91,
						"name": "感染内科二",
						"parentId": 9,
						"departName": "肿瘤内科大一",
						"departId": 8
					}
				]
			},
			{
				"parentId": null,
				"departName": "很长的一个科室名称很长很长",
				"departId": 6,
				"secondDepart": []
			}
		]
	}]
};

var myInfoChangeDepartSecond = {
	ajax: null,
	messageBox: null,
	popWindow: null,

	departmentList: [],
	selectedDepartId: null,
	parentId: null,
	parentInfo: {},

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		this.popWindow = new PopWindow();

		this.parentId = window.location.search.getValueFromUrl()['parentId'];
		this.parentId = parseInt(this.parentId, 10);

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

		//this.handleGetLevelSuccess(mockDepartList);
	},
	
	handleGetLevelSuccess: function(responseText) {
		var html;

		if(responseText.code === 0) {
			this.departmentList = responseText.data[0].departmentList;

			this.orderList();

			html = this.getDepartListHtml(this.departmentList);

			document.querySelector('#depart_list').innerHTML = html;
		} else {
			this.handleError(responseText);
		}
	},

	orderList: function(){
		var list = this.departmentList;
		var secondList;

		for(var i = 0; i < list.length; i++){
			if(list[i]['departId'] === this.parentId){
				this.parentInfo.id = list[i]['departId'];
				this.parentInfo.name = list[i]['departName'];
				secondList = list[i]['secondDepart'] || [];
			}
		}

		if(secondList && secondList.length > 0){
			for(var j=0; j<secondList.length; j++){
				secondList[j]['id'] = secondList[j]['departId'];
				secondList[j]['name'] = secondList[j]['departName'];
			}
		}

		this.departmentList = secondList;
	},

	getDepartListHtml: function(departList){
		var html = '';
		var parentId;

		parentId = this.parentInfo.parentId;

		html += '<a class="selected" href="my-info-change-derpart.html">' + this.parentInfo.name + '</a>';

		departList = departList ? departList : [];

		for(var i=0; i<departList.length; i++){
			var secondLevel = departList[i]['secondDepart'];
			var arrowText;
			var clickOrHref;

			if(!secondLevel || secondLevel.length <= 0){
				arrowText = 'class="check-list no-arrow"';
				clickOrHref = 'onclick="myInfoChangeDepartSecond.selectedDepartment(event)"'
			}else{
				parentId = departList[i].parentId;
				arrowText = 'class=""';
				clickOrHref = 'href="my-info-change-depart-second.html?parentId=' + departList[i].id + '"';
			}
			html += '<a ' + clickOrHref + ' parentId="' + parentId + '" value="' + departList[i].id + '" ' + arrowText + '>' + departList[i].name + '</a>';
		}

		return html;
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

myInfoChangeDepartSecond.init();