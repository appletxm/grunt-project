var mockPointDetail = {
	"code": 0,
	"msg": "成功",
	"data": [
		{
			"type": 4,
			"status": 1,

			"remark": "预计7天后解锁",
			"patientName": "xx患者",
			"remarkName": "隔壁小王",
			"point": 200,
			"amount": "10.00",
			"createdAt": "2015-10-23 18:14:53",
			"skus": [
				{
					"pid": 1000,
					"skuId": 10000,
					"name": "康泰克",
					"commonName": "美扑伪麻片",
					"salePrice": "10.00",
					"quantity": 2,
					"point": 200,
					"manufacturer": "中美天津史克制药有限公司"
				}
			]
		}
	]
};

var pointDetail = {
	ajax: null,
	messageBox: null,

	urlParams:{},

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();

		this.getUrlParams();
		this.getPointDetail();
	},

	getUrlParams: function(){
		this.urlParams = window.location.search.getValueFromUrl();

		document.querySelectorAll('title')[0].innerHTML = this.urlParams['point_log'];
	},

	getPointDetail:function(){
		var param = {
			sendParameters:{}
		};

		if(!this.urlParams['point_id'] || this.urlParams['point_id'] === ''){
			this.handleGetError({
				msg: '积分ID不正确，获取不了积分明细'
			});
			return false;
		}

		param.sendParameters.id = parseInt(this.urlParams['point_id'], 10);

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/point_buy_detail/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetInfoSuccess.bind(this);
		param.onError = this.handleGetError.bind(this);

		this.showLoading();

		this.ajax.send(param);

		//this.handleGetInfoSuccess(mockPointDetail);
	},

	handleGetInfoSuccess:function(responseText){

		if(responseText.code === 0 || responseText.code === '0'){
			if(responseText.data && responseText.data[0] && responseText.data.length > 0) {
				var info = responseText.data[0];

				this.getDetailHeaderHtml(info);
				this.getBasicHtml(info);
				this.getProDetailHtml(info);
				this.hideLoading();
			}
		}else{
			this.handleGetError(responseText);
		}
	},

	getDetailHeaderHtml: function(data){
		var content = [];
		var panel = document.querySelector('#headInfo');
		var point = data['point'];

		if(point && point !== '' && point !== 'unll' && point !== 'undefined'){
			point = '+' + point;
		}else{
			point = 0;
		}

		content.push('<b class="price">' + point + '</b>');
		content.push('<span>' + (data['remark'] || '') + '</span>');
		content.push('<i>' + (this.urlParams['point_log'] || '') + '</i>');
		content.push('<p class="c"></p>');

		panel.innerHTML =  content.join('');
	},

	getBasicHtml: function(data){
		var content = [];
		var panel = document.querySelector('#basicSection');

		content.push('<dl>');
		content.push('<dt>发生时间</dt>');
		content.push('<dd>' + (data['createdAt'] || '') + '</dd>');
		content.push('</dl>');
		content.push('<dl>');
		content.push('<dt>商品总额</dt>');
		content.push('<dd class="price">' + (data['amount']? '￥' + data['amount'] : '') +' </dd>');
		content.push('</dl>');
		content.push('<dl>');
		content.push('<dt>积分来源</dt>');
		content.push('<dd>' + (this.urlParams['point_log'] || '') + '</dd>');
		content.push('</dl>');
		content.push('<dl>');
		content.push('<dt>患者姓名</dt>');
		content.push('<dd>' + (data['remarkName'] || data['patientName']) + '</dd>');
		content.push('</dl>');

		panel.innerHTML =  content.join('');
	},

	getProDetailHtml: function(data){
		var content = [];
		var panel = document.querySelector('#proDetail');
		var list = data['skus'] || [];

		content.push('<h1>商品详情</h1>');

		list.forEach(function(item){

			var name = item['name'];
			var price = item['salePrice'];

			if(item['commonName'] && item['commonName'] !== '' && item['commonName'] !== 'unll' && item['commonName'] !== 'undefined'){
				name = name + '(' + item['commonName'] + ')';
			}

			if(item['quantity'] && item['quantity'] !== ''){
				name = name + 'X' + item['quantity'];
			}

			if(price && price !== '' && price !== 'unll' && price !== 'undefined'){
				price = '￥' + price;
			}

			content.push('<dl>');
			content.push('<dt><span class="point-flag">' + (item['point'] || 0) + '</span></dt>');
			content.push('<dd>');
			content.push('<b>' + name + '</b>');
			content.push('<i>' + (item['manufacturer'] || '') + '</i>');
			content.push('<i>商品金额：<em class="price">' + price + '</em></i>');
			content.push('</dd>');
			content.push('</dl>');
		});



		panel.innerHTML =  content.join('');
	},

	handleGetError:function(responseText){
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

	showLoading: function(){
		this.messageBox.show({
			msg:'<span class="fa fa-spinner fa-pulse fa-2x fa-fw"></span>',
			type:'loading',
			autoClose: false
		});
	},

	hideLoading: function(){
		this.messageBox.hide();
	}
};

pointDetail.init();