/**
parameters includes below value;
msg: // String URL
type: // String alter/error/loading 
autoClose: //Boolean
**/
var MessageBox = function(){
	this.showTime = 2000;
	this.animateTimer = 0;
	this.animateTimeStep = 450;
	this.timer = 0;
	this.msgDom = null;
	this.msgCss = {
		normal: 'tipMsg',
		active: 'tipMsgActived',
		alert: 'alert',
		loading: 'loading',
		body: 'msg-body',
		bodyActive: 'msg-body-actived',
		loadingActive: 'loading-actived'
	};
	this.messageParams = {};

	this.show = function(message){
		var domArray = [],
			msgDom,
			mask;

		this.messageParams = message;
		
		msgDom = document.querySelectorAll('.' + this.msgCss.normal);

		if(msgDom.length > 0){
			for(var dom in msgDom){
				if((/\d/).test(dom)){
					domArray.push(msgDom[dom]);
				}
			}
			this.msgDom = domArray[domArray.length - 1];
			this.msgBody = document.querySelectorAll('.msg-body')[0];
		}else{
			this.msgDom = document.createElement('div');
			this.msgBody = document.createElement('div');
			mask = document.createElement('div');
			mask.className = 'mask';

			this.msgDom.appendChild(mask);
			this.msgDom.appendChild(this.msgBody);
			document.querySelectorAll('body')[0].appendChild(this.msgDom);
		}

		this.buildMessageHTML(message);
	};

	this.buildMessageHTML = function(message){
		var msgHtml;
		var className;

		if(message.type === 'loading'){
			msgHtml = '<span class="fa fa-spinner fa-pulse"></span>';
		}else{
			msgHtml = message.msg || '';
		}

		this.msgBody.className = this.msgCss.body + ' ' + message.type;
		this.msgDom.className = this.msgCss.normal + ' ' + this.msgCss.active;

		setTimeout(function(){
			className = this.msgCss.body + ' ' + message.type + ' ' + (message.type === 'loading' ? this.msgCss.loadingActive : this.msgCss.bodyActive);

			this.msgBody.className = className;
			this.msgBody.innerHTML = msgHtml;

			if(message.autoClose === true){

				clearTimeout(this.animateTimer);
				clearTimeout(this.timer);

				this.timer = setTimeout(function(){
					this.hide();
				}.bind(this), this.showTime);
			}

		}.bind(this), 10);
	};

	this.hide = function(){
		if (this.msgBody) {
			this.msgBody.className = this.msgCss.body + ' ' + (this.messageParams.type || '');
			this.msgBody.innerHTML = '';
		}

		this.messageParams = {};

		this.animateTimer = setTimeout(function () {
			if (this.msgDom) {
				this.msgDom.className = this.msgCss.normal;
			}
			if (this.msgBody) {
				this.msgBody.className = this.msgCss.body;
			 }
		}.bind(this), this.animateTimeStep);
	};

};