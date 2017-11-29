
var SlideTabs = function(){
	this.param = {};

	this.init = function(param){
		this.param = param;
		this.attachEvent();
	};

	this.handleTabClick = function(event){
		var target = event.target;
		var label = target.tagName.toLowerCase();
		if(label === 'li' || label === 'span'){
			if(label === 'span'){
				target = target.parentNode;
			}else{
				if(target.className === this.param.selectedCss){
					return false;
				}
			}
		}

		this.doAnimate(target);
	};

	this.doAnimate = function(target){
		var li = this.param.trigger.querySelectorAll('li');

		for(var i=0; i<li.length; i++){
			if(li[i] === target){
				li[i].className = this.param.selectedCss;
			}else{
				li[i].className = '';
			}
		}

		var cons = this.param.responser;
		for(var j=0; j<cons.length; j++){
			if(cons[j].className.indexOf(target.getAttribute('for')) >= 0){
				cons[j].style.display = "block";
			}else{
				cons[j].style.display = "none";
			}
		}

		if(this.param.callBack){
			this.param.callBack(target);
		}
	};

	this.attachEvent = function(){
		this.param.trigger.addEventListener('click', function(event){
			this.handleTabClick(event);
		}.bind(this));
	}
};