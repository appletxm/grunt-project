var SearchFromCache = function(){
	this.params = {};

	this.init = function(){
	};

	this.showSearchBox = function(params) {
		var html;
		var pageObjName;
		var pageObj;
		var searchJSObjName = null;

		if(params){
			for(var param in params){
				this.params[param] = params[param];
			}
		}

		pageObjName = this.params.pageJSObjName;
		pageObj = this.params.pageJSObj;

		html = this.getAddNewItemHtml();

		if(!this.params.popWindow && this.params.bindObj){
			this.params.bindObj.innerHTML = html;
		}else{
			if(pageObjName && pageObj && pageObj.searchFromCache){
				searchJSObjName = pageObjName + '.searchFromCache';
			}

			this.showPopSearchBox(searchJSObjName, html);
		}
	};

	this.showPopSearchBox = function(searchJSObjName, html){
		var popParams = {
			buttons: []
		};

		popParams.needMask = true;
		popParams.title = this.params.title || '';
		popParams.space = {
			height: 150
		};

		popParams.content = html;
		popParams.buttons.push(
			{
				text: '添 加',
				css: 'save x2',
				callback: searchJSObjName + '.doSaveNewItemName()'
			},
			{
				text: '取 消',
				css: 'cancel x2',
				callback: searchJSObjName + '.cancelNewHospitalCallback()'
			}
		);

		this.params.popWindow.show(popParams);
	};

	this.getAddNewItemHtml =  function(){
		var html = '';
		var params = this.params;
		var pageObjName = params.pageJSObjName;
		var pageObj = params.pageJSObj;
		var inputEventName = null;
		var clearEventName = null;
		var inputLen = params.inputLen || 100;

		if(pageObjName && pageObj && pageObj.searchFromCache){
			inputEventName = pageObjName + '.searchFromCache' + '.inputNewName(event);';
			clearEventName = pageObjName + '.searchFromCache' + '.clearSearch(event);';
		}

		html += '<div id="newHospitalPanel" class="user-input-search">';
		html += '<span>';
		html += '<i><input id="newHospitalName" oninput="' + inputEventName + '" value="" placeholder="' + (params.placeHolder || '') + '" maxlength="' + inputLen +'" size="' + inputLen + '"></i>';
		html += '<a id="clearKey" class="clear" onclick="' + clearEventName + '">x</a>';
		html += '</span>';
		html += '<ul id="relativeList"></ul>';
		html += '</div>';

		return html;
	};

	this.doSaveNewItemName = function(){
		var name = document.querySelector('#newHospitalName').value;
		var list = this.params.cacheDataList;

		if(!name || name === '' || !name.isNormalText(2, 50)){
			if(this.params.messageBox){
				this.params.messageBox.show({
					msg: this.params.errorMsg,
					type:'alert',
					autoClose: true
				});
			}
			return;
		}

		for(var i = 0; i < list.length; i++){
			if(list[i].name === name){
				this.params.selectedTipListCallback(list[i].id);
			}
		}

		if(this.params.okCallBack){
			this.params.okCallBack(name);
		}
	};

	this.inputNewName = function(event){
		var matchList = [];
		var list = this.params.cacheDataList;
		var key = event.currentTarget.value || '';
		var clearBut = document.querySelector('#clearKey');

		key = key.replace(/\s|\n|\b/g,'');

		if(key.length > 0){
			clearBut.style.display = 'block';
		}else{
			clearBut.style.display = 'none';
		}

		for(var i=0; i<list.length; i++){
			var index = list[i].name.indexOf(key);

			if(index >= 0){
				matchList.push(list[i]);
			}
		}

		this.showTipList(matchList);
	};

	this.showTipList = function(list){
		var panel = document.querySelector('#relativeList');
		var html = [];
		var params = this.params;
		var pageObjName = params.pageJSObjName;
		var pageObj = params.pageJSObj;
		var selectEventName = null;

		if(pageObjName && pageObj && pageObj.searchFromCache){
			selectEventName = pageObjName + '.searchFromCache' + '.selectSearchItem(event);';
		}

		for(var i =0; i<list.length; i++){
			html.push('<li hId="' + list[i].id + '" onclick="' + selectEventName + '">' + list[i].name + '</li>');
		}

		panel.innerHTML = html.join('');
	};

	this.selectSearchItem = function(event){
		var target = event.currentTarget;

		if(this.params.selectedTipListCallback){
			this.params.selectedTipListCallback(target.getAttribute('hId'));
		}

		document.querySelector('#newHospitalName').value = target.innerHTML;
		document.querySelector('#relativeList').innerHTML = '';
		document.querySelector('#clearKey').style.display = 'block';

		event.stopPropagation();
	};

	this.clearSearch = function(event){
		event.currentTarget.style.display = 'none';
		document.querySelector('#newHospitalName').value = '';
		document.querySelector('#relativeList').innerHTML = '';

		event.stopPropagation();
	};

	this.cancelNewHospitalCallback = function(){
		this.params.popWindow.hide();
		if(this.params.cancelCallBack){
			this.params.cancelCallBack();
		}
	};


};