/**
 parameters includes below value;
 ajax: //Object
 tipList: {
        action: //String tip search action,
        callBack: //Function tip search action callback function
    }
 action: // String  do search action
 callback: // Function just handle the event after search
 beforeSearchFunction: //Function  just callback the function before click the search button
 messagebox: // Object  just use for handle all of the message from server
 pageObj: //Object  the page which need search component
 pageObjString: //String  the page object name
 searchObjString: //String the search object name
 bindObj: //dom the search plugin bind html dom object
 tipText: //String place holder and tip text,
 **/

var SearchFromDatabase = function(){
	this.params = {};
	this.objects = {};
	this.key = null;
	this.page = 1;
	this.number = 10;

	this.init = function(params){
		for(var key in params){
			this.params[key] = params[key];
		}

		this.createTemplate();
		setTimeout(function(){
			this.getSearchObjects();
			this.attachEvent();
		}.bind(this), 10);
	};

	this.createTemplate = function(){
		var params = this.params;
		var content = [];
		var submitEvent;

		submitEvent = 'onsubmit="return ' + params.pageObjString + '.' + params.searchObjString + '.handleKeyBoardSearch();"';

		content.push('<div class="form-search">');
		content.push('<form ' + submitEvent + '>');
		content.push('<span>');
		content.push('<i>' + params.tipText + '</i>');
		content.push('<input type="search" value="" placeholder="' + params.tipText + '" >');
		content.push('</span>');
		content.push('</form>');

		if(params.tipList){
			content.push('<div class="search-tip-list-outer" style="display:none;">');
			content.push('<div class="form-list search-tip-list" style="display:block;">');
			content.push('</div>');
			content.push('</div>');
		}

		params.bindObj.innerHTML = content.join('');
	};

	this.handleSearchPanelClick =  function(){
		var span = this.objects.span;
		var input = this.objects.input;

		if(span.className.indexOf('selected') < 0){
			span.className = 'selected';
			input.style.display = 'block';
			input.focus();
		}
	};

	this.getSearchObjects = function(){
		this.objects.input = this.params.bindObj.querySelectorAll('input')[0];
		this.objects.span = this.params.bindObj.querySelectorAll('span')[0];
		this.objects.form = this.params.bindObj.querySelectorAll('form')[0];

		if(this.params.tipList){
			this.objects.tipOuter = this.params.bindObj.querySelectorAll('.search-tip-list-outer')[0];
			this.objects.tipList = this.params.bindObj.querySelectorAll('.search-tip-list')[0];
		}
	};

	this.handleSearchInput = function(event){
		var param = {
			sendParameters:{}
		};

		this.key = this.objects.input.value;

		if(!this.params.tipList){
			return false;
		}

		if(this.key.trim() === ''){
			this.objects.tipList.innerHTML = '';
			return false;
		}

		param.sendParameters['query_str'] = this.key;
		param.url = this.params.tipList.action;
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleSearchInputSuccess.bind(this);
		param.onError = this.handleGetError.bind(this);

		this.objects.tipList.innerHTML = '<span class="fa fa-spinner fa-pulse fa-2x fa-fw"></span>';
		this.objects.tipOuter.className =  'search-tip-list-outer' +' ' + ' actived';

		if(this.params.tipList.mockData){
			this.handleSearchInputSuccess(this.params.tipList.mockData);
		}else{
			this.params.ajax.send(param);
		}

		event.preventDefault();
	};

	this.handleSearchInputSuccess = function(responseText){
		var content = '';
		var list = [];
		var tipListOuter = this.objects.tipOuter;

		tipListOuter.className =  'search-tip-list-outer';

		if(responseText.code === 0){
			list = responseText.data;

			if(list && list.length > 0){
				for(var i=0; i < list.length; i++){
					content += '<a href="javascript:void(0);" id="'+ list[i] +'">' + list[i] + '</a>';
				}

				this.objects.tipList.innerHTML = content;
				tipListOuter.style.display = 'block';
			}else{
				this.hideTipList();
			}

		}else{
			this.handleGetError(responseText);
		}
	};

	this.handleGetError = function(responseText){
		var msg = responseText.msg;

		this.hideTipList();

		if(!responseText.msg || responseText.msg === ''){
			msg = '网络异常，请稍后再试';
		}
		this.params.messageBox.show({
			msg: msg,
			type:'alert',
			autoClose: true
		});
	};

	this.handleSearchTipList = function(event){
		var target = event.target;
		var label = target.tagName.toLowerCase();

		if(label === 'a'){
			this.key = target.getAttribute('id').trim();
			this.objects.input.value = this.key;

			//this.hideTipList();
			this.handleDoSearch();
		}

	};

	this.handleDoSearch = function(){
		this.key = this.objects.input.value;

		if(this.key.trim() == ''){
			this.messageBox.show({
				msg: '请输入搜索关键字',
				type:'alert',
				autoClose: true
			});
			return false;
		}

		this.objects.input.blur();

		/*if(this.params.pageObj && this.params.pageObj.showLoading){
			this.params.pageObj.showLoading();
		}*/

		if(this.params.beforeSearchFunction){
			this.params.beforeSearchFunction();
		}

		if(this.params.callback){
			this.params.callback(this.key);
		}

		this.hideTipList();

	};

	this.handleKeyBoardSearch = function(){
		try{
			this.handleDoSearch();
		}catch(e){
			return false;
		}

		return false;
	};

	this.handleBlur = function(event){
		var input = event.currentTarget;
		var span = input.parentNode;

		if(!input.value || input.value === ''){
			span.className = '';
		}
	};

	this.hideTipList = function(){
		this.objects.tipList.innerHTML = '';
		this.objects.tipOuter.className = 'search-tip-list-outer';
		this.objects.tipOuter.style.display = 'none';
	};

	this.attachEvent = function(){
		this.params.bindObj.addEventListener('click', function(){
			this.handleSearchPanelClick()
		}.bind(this));

		this.objects.input.addEventListener('input', function(){
			this.handleSearchInput(event);
		}.bind(this));

		this.objects.input.addEventListener('blur', function(){
			this.handleBlur(event);
		}.bind(this));

		if(this.params.tipList){
			this.objects.tipList.addEventListener('click', function(event){
				this.handleSearchTipList(event);
			}.bind(this));
		}
	};


};