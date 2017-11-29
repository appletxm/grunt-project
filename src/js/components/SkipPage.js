/**
 @parameters
 pageInfo: //json {
	pageSize //number
	totalCount //number
	totalPages //number
	orderby //number 0:asc 1:desc
	pageNo //number
}

 bindObj: //dom
 param: {
	url: //
	sendParameters: //
	type: //get post
	asyn: //boolean
	onSuccess: //function
	onError: //function
}//obj
 ajax: //obj
 needSkipNext: //boolean
 needSkipPrev: //boolean
 messageBox: //obj
 **/

var SkipPage = function () {
	this.configs = {};
	this.isFirstLoad = true;
	this.isGettingData = false;
	this.originalOnSuccess = null;
	this.originalOnError = null;
	this.skipPosition = 0; //0: scroll up, 1: scroll down;

	this.init = function (param) {
		this.configs = param;

		this.originalOnSuccess = this.configs.param.onSuccess;
		this.originalOnError = this.configs.param.onError;

		this.configs.param.onError = this.onError.bind(this);
		this.configs.param.onSuccess = this.onSuccess.bind(this);
		//this.configs.param.mssage = this.configs.messageBox;

		this.loadData(this.configs.param);

		this.attachEvent();
	};

	this.loadData = function (param) {
		if(this.isFirstLoad === false){
			this.starAnimate();
		}

		this.isGettingData = true;

		this.configs.ajax.send(param);
	};

	this.onSuccess = function (responseText) {

		if (responseText.code === 0 || responseText.code === '0') {

			this.setPageInfo(responseText);

			if (this.originalOnSuccess) {
				this.originalOnSuccess(responseText);
			}

			this.endAnimate();
		} else {
			this.onError(responseText);
		}

		this.isGettingData = false;
	};

	this.setPageInfo = function (responseText) {
		var pageInfo;

		if(this.configs.isSelfInterface === true){
			pageInfo = responseText.data[2];
		}else{
			pageInfo = responseText.data[0];
		}

		this.configs.pageInfo.totalCount = pageInfo.totalCount || 0;
		this.configs.pageInfo.totalPage = pageInfo.totalPage || 0;
		this.configs.pageInfo.pageNo = pageInfo.pageNo | 0;
		this.configs.param.sendParameters.page = pageInfo.pageNo || 0;
	};

	this.onError = function (responseText) {

		if (this.originalOnError) {
			this.originalOnError(responseText);
		}

		this.isGettingData = false;
	};

	this.handleScroll = function (event) {
		var body = this.configs.scrollObj || document.querySelectorAll('body')[0];

		if (this.isFirstLoad === true) {
			return false;
		}

		if(this.isGettingData === true){
			return false;
		}

		if (body.scrollTop <= 0 && this.configs.needSkipPrev) {
			this.loadPreviousPage();
			return false;
		}

		if (body.scrollTop >= (body.scrollHeight - body.clientHeight) && this.configs.needSkipNext) {
			this.loadNextPage();
			return false;
		}

	};

	this.loadPreviousPage = function () {
		var pageInfo = this.configs.pageInfo;

		if (pageInfo.pageNo === this.configs.pageInfo.totalPage) {
			/*this.configs.messageBox.show({
				 msg:'您当前已是最后一页',
				 type:'alert',
				 autoClose: true
			 });*/
		} else {
			this.configs.param.sendParameters.page++;

			this.skipPosition = 0;
			this.loadData(this.configs.param);
		}
	};

	this.loadNextPage = function () {
		var pageInfo = this.configs.pageInfo;

		if (pageInfo.pageNo === this.configs.pageInfo.totalPage) {
			/*this.configs.messageBox.show({
				msg: '您当前已是最后一页',
				type: 'alert',
				autoClose: true
			});*/
		} else {
			this.configs.param.sendParameters.page++;
			this.skipPosition = 1;
			this.loadData(this.configs.param);
		}
	};

	this.appendHtmlNode = function (html, bindObj, pageNo) {
		var span;

		span = document.createElement('span');
		span.setAttribute('id', 'page_' + pageNo);
		span.innerHTML = html;

		if (this.skipPosition === 1 || this.isFirstLoad === true) {
			bindObj.appendChild(span);
		} else if (this.skipPosition === 0) {
			if (bindObj.childNodes && bindObj.childNodes.length >= 1) {
				bindObj.insertBefore(span, bindObj.childNodes[0]);
			} else {
				bindObj.appendChild(span);
			}
		}

		setTimeout(function () {
			this.doScroll();
			this.isFirstLoad = false;
		}.bind(this), 0);

	};

	this.doScroll = function () {
		var body = this.configs.scrollObj || document.querySelectorAll('body')[0];
		var scrollTop = (this.configs.scrollObj || body).scrollTop;
		var gap = 10;
		var pageObj;
		var height;


		if (this.isFirstLoad === true) {
			body.scrollTop = body.scrollHeight - document.documentElement.clientHeight - gap;
			return false;
		}

		pageObj = document.querySelector('#page_' + this.configs.pageInfo.pageNo);
		height = window.getComputedStyle(pageObj, null).height;
		if (!height || height === 'auto') {
			height = pageObj.getBoundingClientRect().height;
		}

		if (this.skipPosition === 1) {
			scrollTop = scrollTop - (height || gap) + gap;

		} else if (this.skipPosition === 0) {
			scrollTop = scrollTop + (height || gap) - gap;
		}

		body.scrollTop = scrollTop;
	};

	this.starAnimate = function () {
		var msg = this.configs.messageBox;
		var loadingHtml = '<span class="fa fa-spinner fa-pulse fa-2x fa-fw"></span>数据加载...';

		if (msg) {
			msg.show({
				msg: loadingHtml,
				type: 'loading',
				autoClose: false
			});
		}

	};

	this.endAnimate = function () {
		var msg = this.configs.messageBox;

		if (msg) {
			msg.hide();
		}
	};

	this.attachEvent = function () {
		var scrollDom = this.configs.scrollObj || window;

		scrollDom.addEventListener('scroll', function (event) {
			this.handleScroll(event);
		}.bind(this));

	};

};