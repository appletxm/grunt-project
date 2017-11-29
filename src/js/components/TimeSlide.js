var TimeSlide = function(){
	this.params = {
		scrollCell: 50,
		scrollBigCell: 90,
		animateTimer:0,
		animateStep: 300,
		countTimer: 0,
		countStep: 10,
		countNumber: 0,
		countMin: 10,

		hoursObj: null,
		minutesObj: null,
		secondsObj: null,

		pageInfo:{
			start: {
				pageY: 0
			},
			end: {
				pageY: 0
			},
			move:{
				startY: 0,
				endY:0
			}
		}
	};
	this.isTouching = false;

	this.init = function(params){

		if(params){
			for(var param in params){
				this.params[param] = params[param];
			}
		}

		if(params.timeFormat){
			this.getFormat(params.timeFormat);
		}else{
			this.getFormat('00:00');
		}

		this.buildTimePanel();

		setTimeout(function(){
			this.setDefaultValue();
			this.resizeTimePanel();
			this.attacheEvent();
		}.bind(this), 0);
	};

	this.getFormat = function(timeFormat){
		var format = timeFormat.split(':');
		this.currentTime = {};
		if((/^\d+$/).test(format[0])){
			this.currentTime.hours = parseInt(format[0], 10);
		}
		if((/^\d+$/).test(format[1])){
			this.currentTime.minutes = parseInt(format[1], 10);
		}
		if((/^\d+$/).test(format[2])){
			this.currentTime.seconds = parseInt(format[2], 10);
		}
	};

	this.buildTimePanel = function(){
		var params = this.params;
		var time = this.currentTime;
		var hoursHtml = [];
		var minuteHtml = [];
		var secondHtml = [];
		var width = 0;

		if((typeof time.hours).toLowerCase() === 'number'){
			hoursHtml = this.getTimeHtml(24, 'hours');
			width += params.width;
		}

		if((typeof time.minutes).toLowerCase() === 'number'){
			minuteHtml = this.getTimeHtml(60, 'minutes', this.params.timeStep);
			width += params.width;
		}

		if((typeof time.seconds).toLowerCase() === 'number'){
			secondHtml = this.getTimeHtml(60, 'seconds', this.params.timeStep);
			width += params.width;
		}

		/*console.info(hoursHtml, minuteHtml, secondHtml);
		console.info(params.triggerTouchObj);*/

		params.triggerTouchObj.innerHTML = this.getGapHtml() + hoursHtml.join('') + minuteHtml.join('') + secondHtml.join('');
		params.triggerTouchObj.style.width = width + 'px';
	};

	this.getGapHtml = function(){
		var gapHtml = [];
		var top = Math.floor(this.params.showTimeSize/2)*this.params.scrollCell + 'px';

		gapHtml.push('<div class="slide-gap" style="top:' + top + ';">');
		gapHtml.push('<span>:</span>');
		if((typeof this.currentTime.seconds).toLowerCase() === 'number'){
			gapHtml.push('<span>:</span>');
		}
		gapHtml.push('</div>');

		return gapHtml.join('');
	};

	this.getTimeHtml = function(len, type, timeStep){
		var html = [];
		var timeHtmlStar = '<div class="time-slider-outer" for="' + (type||'') + '"><ul for="' + (type||'') + '">';
		var timeHtmlEnd = '</ul><div class="time-mask-top" for="' + (type||'') + '"></div><div class="time-mask-foot" for="' + (type||'') + '"></div></div>';

		html.push(timeHtmlStar);

		html.push('<li></li>');
		if(this.params.showTimeSize && this.params.showTimeSize > 3){
			html.push('<li></li>');
		}

		for(var i = 0; i< len; i++){
			var modNo = i % (timeStep || 1);
			if(modNo === 0 || i === len - 1){
				html.push('<li for="' + (type||'') + '">' + (i < 10 ? '0' + i: i) + '</li>');
			}
		}
		html.push('<li></li>');
		html.push(timeHtmlEnd);

		return html;
	};

	this.setDefaultValue = function(){
		var time = this.currentTime;
		var panels = this.params.triggerTouchObj.querySelectorAll('.time-slider-outer');
		var attrFor;

		for(var i = 0; i < panels.length; i++){
			attrFor = panels[i].getAttribute('for');
			if(attrFor){
				this.params[attrFor + 'Obj'] = panels[i].querySelectorAll('ul')[0]
			}
		}

		if((typeof time.hours).toLowerCase() === 'number'){
			this.doScroll(this.params.hoursObj, parseInt(time.hours, 10));
		}
		if((typeof time.minutes).toLowerCase() === 'number'){
			var minutesStep = Math.ceil(parseInt(time.minutes, 10)/this.params.timeStep);
			this.doScroll(this.params.minutesObj, minutesStep);
		}
		if((typeof time.seconds).toLowerCase() === 'number'){
			var secondsStep = Math.ceil(parseInt(time.seconds, 10)/this.params.timeStep);
			this.doScroll(this.params.secondsObj, secondsStep);
		}

		this.setShowValue();
	};

	this.doScroll = function(obj, step){
		if(step < 0){
			step = 0;
		}
		obj.style.top = '-' + (step * this.params.scrollCell) + 'px';
	};

	this.setShowValue = function(){
		var time = this.currentTime;
		var text = '';

		if((typeof time.hours).toLowerCase() === 'number'){
			text += time.hours < 10 ? '0' + time.hours : time.hours;
		}

		if((typeof time.minutes).toLowerCase() === 'number'){
			text += ':';
			text += time.minutes < 10 ? '0' + time.minutes : time.minutes;
		}

		if((typeof time.seconds).toLowerCase() === 'number'){
			text += ':';
			text += time.seconds < 10 ? '0' + time.seconds : time.seconds;
		}

		if(this.params.showTimeObj){
			this.params.showTimeObj.innerHTML = text;
		}
	};

	this.handleTouchStar = function(event){
		var pageInfo = this.params.pageInfo;

		pageInfo.start.pageY = event.pageY || event.touches[0].pageY;
		pageInfo.move.startY = pageInfo.start.pageY;

		this.params.countTimer = setInterval(function(){
			this.params.countNumber ++;
		}.bind(this), this.params.countStep);

		this.isTouching = true;

		event.preventDefault();
		event.stopPropagation();
	};

	this.handleTouchMove = function(event){
		var pageInfo = this.params.pageInfo;

		pageInfo.end.pageY = event.pageY || event.touches[0].pageY;

		if(this.isTouching){
			pageInfo.move.startY = pageInfo.move.endY;
			pageInfo.move.endY = pageInfo.end.pageY;

			//this.doTouchMoveScroll(this.params[event.target.getAttribute('for') + 'Obj'], event.target.getAttribute('for'));
		}

		event.preventDefault();
		event.stopPropagation();
	};

	/*this.doTouchMoveScroll = function(obj, type){
	 var pageMove = this.params.pageInfo.move;
	 var gap = pageMove.endY - pageMove.startY;
	 var mT = obj.style.top.replace('px', '');

	 *//*if(gap < 0){
	 mT = parseInt(mT, 10) + gap;
	 }else if(gap > 0){
	 mT = parseInt(mT, 10) + gap;
	 }*//*
	 mT = parseInt(mT, 10) + gap;
	 //console.info('gap:', gap, 'mT:', mT);

	 if(mT > 0){
	 mT = 0;
	 }
	 obj.style.top = mT + 'px';
	 };*/

	this.handleTouchEnd = function(event){
		var forAttr;
		var scrollObj = null;

		clearInterval(this.params.countTimer);
		forAttr = event.target.getAttribute('for');

		if(forAttr){
			scrollObj = this.params[forAttr + 'Obj'];
			if(scrollObj){
				if(this.isTouching === true){
					this.handleScroll(scrollObj, forAttr);
				}else{
					this.handleScroll(scrollObj, forAttr);
				}
			}
		}

		event.preventDefault();
		event.stopPropagation();
	};

	this.handleScroll = function(triggerObj, type){
		var pageInfo = this.params.pageInfo;
		var gap = pageInfo.end.pageY - pageInfo.start.pageY;
		var needFastSkip = false;
		var maxTime = 0;
		var time;
		var timeStep;

		time = this.currentTime[type];

		if(type === 'hours'){
			maxTime = 23;
			timeStep = 1;
		}
		if(type === 'minutes' || type === 'seconds'){
			maxTime = 59;
			timeStep = this.params.timeStep;
		}

		if(this.params.countNumber < this.params.countMin){
			needFastSkip = true;
		}

		if((type === 'minutes' || type === 'seconds') && time === maxTime){
			time = maxTime + 1;
		}

		if(gap < 0){
			if(needFastSkip){
				time = time + this.params.fastSkip * timeStep;
			}else{
				time = time + timeStep;
			}
		}else if(gap > 0){
			if(needFastSkip){
				time = time - this.params.fastSkip * timeStep;
			}else{
				time = time - timeStep;
			}
		}

		if(time >= maxTime){
			time = maxTime;
		}

		if(time <= 0){
			time = 0;
		}

		//console.info(maxTime, time, ((type === 'minutes' || type === 'seconds') && time >= maxTime) ? (time - 1) : time);

		this.currentTime[type] = time;

		this.doScroll(triggerObj, Math.ceil(time/timeStep));
		this.setShowValue();
		this.clearAfterScroll();
	};

	this.clearAfterScroll = function(){
		this.params.pageInfo = {
			start: {
				pageY: 0
			},
			end: {
				pageY: 0
			},
			move:{
				startY: 0,
				endY:0
			}
		}
		this.params.countNumber = 0;
		this.isTouching = false;
	};

	this.resizeTimePanel = function(){
		var param = this.params;
		var timePanel, timeBar, height, maskHeight, panelFoot, panelTop;
		if(param.showTimeSize > 3){
			height = param.scrollCell * param.showTimeSize;
			maskHeight = Math.floor(param.showTimeSize/2)*param.scrollCell;
			timePanel = this.params.triggerTouchObj;
			timeBar = timePanel.querySelectorAll('.time-slider-outer');
			panelFoot = timePanel.querySelectorAll('.time-mask-top');
			panelTop = timePanel.querySelectorAll('.time-mask-foot');

			timePanel.style.height = height + 'px';
			for(var i = 0; i < timeBar.length; i++){
				timeBar[i].style.height = height + 'px';
				panelFoot[i].style.height = maskHeight + 'px';
				panelTop[i].style.height = maskHeight + 'px';
			}
		}
	};

	this.resetTimePanel = function(time){
		if(!time){
			time = {};

			if(this.params.hoursObj){
				time.hours = 0;
			}
			if(this.params.minutesObj){
				time.minutes = 0;
			}
			if(this.params.secondsObj){
				time.seconds = 0;
			}

		}
		if(this.params.hoursObj){
			this.currentTime.hours = 0;
			this.doScroll(this.params.hoursObj, parseInt(time.hours, 10));
		}
		if(this.params.minutesObj){
			var minutesStep = Math.ceil(parseInt(time.minutes, 10)/this.params.timeStep);
			this.doScroll(this.params.minutesObj, minutesStep);
			this.currentTime.minutes = 0;
		}
		if(this.params.secondsObj){
			var secondsStep = Math.ceil(parseInt(time.seconds, 10)/this.params.timeStep);
			this.doScroll(this.params.secondsObj, secondsStep);
			this.currentTime.seconds = 0;
		}
	};

	this.attacheEvent = function(){
		var panel = this.params.triggerTouchObj;

		panel.addEventListener('touchstart', function(event){
			this.handleTouchStar(event);
		}.bind(this));

		panel.addEventListener('touchmove', function(event){
			this.handleTouchMove(event);
		}.bind(this));

		panel.addEventListener('touchend', function(event){
			this.handleTouchEnd(event);
		}.bind(this));
	};
};