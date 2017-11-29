'use strict';

var AnimateCheck = function(){
	this.param = {
		bindObj: null,
		callBack: null
	};

	this.init = function(param){
		this.param = param;
		for(var key in param){
			this.param[key] = param[key];
		}
		this.attachEvent();
	};

	this.handleClick = function(){
		this.toggleCheck();
	};

	this.toggleCheck = function(isOn, value, notNeedDoCallback){
		var bindObj = this.param.bindObj;
		var input = bindObj.querySelectorAll('input')[0];
		var b = bindObj.querySelectorAll('b')[0];

		if(isOn === true || isOn === false){
			bindObj.className = 'animate-check' + (isOn === true ? '' : ' close');
		}else{
			if(bindObj.className.indexOf('close') >= 0){
				bindObj.className = 'animate-check';
				isOn = true;
			}else{
				bindObj.className = 'animate-check close';
				isOn = false;
			}
		}

		input.value = value ? value : (isOn === true ? 1 : 0);

		if(this.param.callBack && notNeedDoCallback !== true){
			this.param.callBack(isOn, input.value);
		}
	};

	this.attachEvent = function(){
		var bindObj = this.param.bindObj;

		bindObj.addEventListener('click', function(){
			this.handleClick();
		}.bind(this));
	}
};