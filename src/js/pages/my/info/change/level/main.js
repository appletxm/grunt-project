var myInfoChangeLevel = {
	ajax: null,
	messageBox: null,
	title: null,

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		
		this.attachEvent();
		this.getUrlTitle();
	},

	getUrlTitle: function(){
		var urlParams = window.location.search.getValueFromUrl();

		this.title = decodeURIComponent(urlParams['title'] || '');

		this.getLevelList();
	},
	
	getLevelList: function() {
		
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
	},
	
	handleGetLevelSuccess: function(responseText) {
		if(responseText.code === 0) {
			var titleList = responseText.data[0].titleList;
			document.querySelector('#level_list').innerHTML = this.getLevelListHtml(titleList);
		} else {
			this.handleError(responseText);
		}
	},

	getLevelListHtml: function(titleList){
		var html = '';
		var arrowText;

		for(var i=0; i<titleList.length; i++){

			if(this.title === titleList[i].titleName){
				arrowText = 'class="check-list no-arrow checked"';
			}else{
				arrowText = 'class="check-list no-arrow"';
			}
			html += '<a ' + arrowText + ' value="' + titleList[i].titleId + '"' + ' onclick="myInfoChangeLevel.doSave(event)">' + titleList[i].titleName + '</a>';
		}

		return html;
	},

	doSave:function(event){
		var target = event.currentTarget;
		var value = target.getAttribute("value");
		
		var param = {
			sendParameters:{
				'titleId': value
			}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/info_update/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleSaveSuccess.bind(this);
		param.onError = this.handleError.bind(this);
		param.mssage = this.messageBox;

		this.toggleChecked(target);
		this.ajax.send(param);

	},

	handleSaveSuccess:function(responseText){
		if(responseText.code === 0){
			window.location.href="my-information.html";
		}else{
			this.handleError(responseText);
		}
	},

	toggleChecked: function(target){
		var list = document.querySelectorAll('#level_list .check-list');

		for(var i =0; i<list.length; i++){
			if(target === list[i]){
				list[i].className = 'check-list no-arrow checked';
			}else{
				list[i].className = 'check-list no-arrow';
			}
		}
	},

	handleError:function(responseText){
		this.messageBox.show({
			msg:responseText.msg, 
			type:'alert', 
			autoClose: true
		});
	},
	
	attachEvent: function(){
	}
};

myInfoChangeLevel.init();