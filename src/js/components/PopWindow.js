
/**
parameters includes below value
title: //String
buttons: //Array config the footer buttons
	buttons:[
		{'text':'确认'， callback: xxxx}
	]
space //Object
	space:{
		top: 20,
		left: 20
	}
needMask: //Blooean	

content: //String just the show html code
contentClickCallback: //Function callback function
**/
var PopWindow = function(){

	this.showPanelParameters = {};
	this.popWindow = null;
	
	this.init = function(){
		this.createWindowPanel();
		this.attacheEvent();
	};

	this.createWindowPanel = function(){
		var pop = document.createElement('div');
		var html = '';
		html += '<div class="mask"></div>';
		html += '<div class="container">';
		html += '<header>选择银行</header>';
		html += '<div class="body"></div>';
		html += '<footer></footer>';
		html += '</div>';

		document.querySelectorAll('body')[0].appendChild(pop);
		pop.className = 'pop-window';
		pop.innerHTML = html;
		this.popWindow = pop;

	};

	this.show = function(param){
		var pop = this.popWindow;
		var mask,header,footer, body,footerHtml = '';

		this.showPanelParameters = param;

		mask = pop.querySelectorAll('.mask')[0];
		header = pop.querySelectorAll('header')[0];
		footer = pop.querySelectorAll('footer')[0];
		body = pop.querySelectorAll('.body')[0];

		if(param.buttons && param.buttons.length > 0){
			for(var i=0; i < param.buttons.length; i++){
				var clickHtml = param.buttons[i].callback ? ('onclick="'+ param.buttons[i].callback +'"') : '';
				footerHtml += '<a class="'+ (param.buttons[i].css || 'save') +'"' + clickHtml + '>' + (param.buttons[i].text || '')  + '</a>';
			}
			footer.innerHTML = footerHtml;
			footer.style.display = 'block';
		}else{
			footer.style.display = 'none';
		}

		if(param.title){
			header.innerHTML = param.title || '';
			header.style.display = 'block';
		}else{
			header.style.display = 'none';
		}


		if(param.needMask){
			mask.style.display = 'block';
		}

		body.innerHTML = param.content || '';
		pop.style.display = 'block';

		setTimeout(function(){
			this.resizeWindow(param, pop, header, footer, pop.querySelectorAll('.container')[0], body);
		}.bind(this), 0);

	};

	this.resizeWindow = function(param, pop, header, footer, container, body){
		var pW = document.documentElement.clientWidth;
		var pH = document.documentElement.clientHeight;
		var gapTop = (param.space && param.space.top)? param.space.top : 20;
		var gapLeft = (param.space && param.space.left)? param.space.left : 20;
		var style;
		var gapHeight = (param.title ? 41 : 0) + ((param.buttons && param.buttons.length > 0) ? 40 : 0);

		var cW = pW - gapLeft*2;
		var cH = pH - gapTop*2;
		var bH = cH - gapHeight;
		var mT = -(cH/2);
		var mL = -(cW/2);

		if(param.space.height && param.space.height > 0){
			bH = param.space.height;
			cH = bH + gapHeight;
			mT = -cH/2;
		}

		if(param.space.width && param.space.width > 0){
			cW = param.space.width;
			mL = -cW/2;
		}

		style = ('width:'+ cW +'px;') + ('height:'+ cH +'px;') + ('margin:' + mT + 'px ' + mL + 'px;');

		container.setAttribute('style', style);
		body.setAttribute('style', 'width:'+ cW +'px;' + 'height:'+ bH +'px;');
		
	};

	this.hide = function(){
		var mask = null;
		var pop = this.popWindow;
		if(pop){
			pop.style.display = 'none';
			mask = pop.querySelectorAll('.mask');
			mask[0].style.display = 'none';
		}
	};

	this.handleContentClick = function(event){
		var param = this.showPanelParameters;
		if(param.contentClickCallback && (typeof param.contentClickCallback).toLowerCase() === 'function'){
			param.contentClickCallback(event);
		}
		
		event.stopPropagation();
		event.preventDefault();
	};

	this.handleResizePopEvent = function(){
		var pop = this.popWindow;
		var header,footer, body;

		header = pop.querySelectorAll('header')[0];
		footer = pop.querySelectorAll('footer')[0];
		body = pop.querySelectorAll('.body')[0];

		this.resizeWindow(this.showPanelParameters, pop, header, footer, pop.querySelectorAll('.container')[0], body);
	};

	this.attacheEvent = function(){
		var pop = this.popWindow;
		var body = pop.querySelectorAll('.body')[0];
		var browser = navigator.userAgent.toLowerCase();

		body.addEventListener('click', function(event){
			this.handleContentClick(event);
		}.bind(this), false);

		body.addEventListener('touchmove', function(event){
			event.stopPropagation();
			//event.preventDefault();
		});

		this.popWindow.addEventListener('touchmove', function(event){
			event.stopPropagation();
			event.preventDefault();
		});

		//TODO just the android phone need to do these, iphone no need

		if(browser.indexOf('android') >= 0 && browser.indexOf('qqbrowser') >= 0){
			window.addEventListener('resize', function(event){
				this.handleResizePopEvent();
				event.stopPropagation();
				event.preventDefault();
			}.bind(this));
		}
	};

	this.init();
};