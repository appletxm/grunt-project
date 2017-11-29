/**
type: number// type: 1 image, type: 2 video
src: //string media source 
**/
var FullScreenView = function(){

	this.fullScreenView = null;
	this.container = null;
	this.body = null;
	this.classNames = {
		normal: 'full-screen-view',
		active: 'full-screen-view-show',
		loading: 'full-screen-view-loading'
	}
	
	this.init = function(){
		this.createFullScreenView();
		this.attacheEvent();
	};

	this.createFullScreenView = function(){
		var viewer = document.createElement('div');
		var html = '';
		html += '<div class="mask"></div>';
		html += '<div class="container"></div>';

		viewer.className = 'full-screen-view';
		viewer.innerHTML = html;
		document.querySelectorAll('body')[0].appendChild(viewer);
		this.fullScreenView = viewer;

		setTimeout(function(){
			this.container = this.fullScreenView.querySelectorAll('.container')[0];
		}.bind(this), 0);
		
	};

	this.handleMaskClick = function(event){
		this.hide();
	};

	this.show = function(param){
		var html = '';

		if(param.src && param.src !== '' && param.src !== 'null' && param.src !== 'undefined'){
			if(param.type === 1){
				html = '<img src="' + param.src + '" />';
			}else if(param.type === 2){
				html = '<video controls="controls" preload="preload" width="240" src="' + param.src + '" type="video/mp4"></video>';
			}

			this.container.innerHTML = html;

			//setTimeout(function(){
				if(param.type === 1){
					this.body = this.container.querySelectorAll('img')[0];
				}else if(param.type === 2){
					this.body = this.container.querySelectorAll('video')[0];
				}

				//this.imgLoading(param.event);

				this.body.onload = function(){

					this.resizePanel();

					if(param.event){
						this.setImagePanelToTrigger(param.event);
					}else{
						this.body.style.display = 'block';
					}
				}.bind(this);
			//}.bind(this), 10);
		}
		
	};

	this.setImagePanelToTrigger = function(trigger){
		var top, left, width, height, styles;

		top = trigger.clientY - trigger.offsetY;
		left = trigger.clientX - trigger.offsetX;
		width = trigger.target.clientWidth;
		height = trigger.target.clientHeight;

		styles = 'width:' + width +'px;';
		styles += 'height:' + height +'px;';
		styles += 'top:' + top +'px;';
		styles += 'left:' + left +'px;';
		styles += 'display:block;';

		this.fullScreenView.setAttribute('style', styles);

		setTimeout(function(){
			this.fullScreenView.className = this.classNames.normal + ' ' + this.classNames.active;
		}.bind(this), 0);

	};

	this.imgLoading = function(trigger){
		var top, left, width, height, styles;

		top = trigger.clientY - trigger.offsetY;
		left = trigger.clientX - trigger.offsetX;
		width = trigger.target.clientWidth;
		height = trigger.target.clientHeight;

		styles = 'width:' + width +'px;';
		styles += 'height:' + height +'px;';
		styles += 'top:' + top +'px;';
		styles += 'left:' + left +'px;';

		this.fullScreenView.className = this.classNames.normal + ' ' + this.classNames.loading;

		this.fullScreenView.setAttribute('style', styles);
	};

	this.hide = function(){
		this.fullScreenView.className = this.classNames.normal;
		setTimeout(function(){
			this.container.innerHTML = '';
			this.fullScreenView.removeAttribute('style');
			this.body.onload = null;
			this.body = null;
		}.bind(this), 310);
	};

	this.resizePanel = function(){
		var width = document.documentElement.clientWidth;
		var height = document.documentElement.clientHeight;
		var bw;
		var bh;
		var scale = 1;

		if(!this.body){
			return false;
		}

		bw = this.body.naturalWidth || this.body.clientWidth;
		bh = this.body.naturalHeight || this.body.clientHeight;

		//console.info(width, height, bw, bh, this.body);

		if(bw > width){
			scale = width/bw;

			var tbh = scale*bh;
			if(tbh > height){
				scale = height/bh;
			}
		}else{
			if(bh > height){
				scale = height/bh;
			}
		}


		bh = scale * bh;
		bw = scale * bw;

		//console.info('scale:', scale, 'bw:', bw, 'bh:', bh);

		var left = parseInt((width - bw)/2, 10);
		var top = parseInt((height - bh)/2, 10);

		this.body.setAttribute('style', 'width:' + bw + 'px; height:' + bh + 'px; left:' + left+ 'px; top:' + top + 'px;');
		this.fullScreenView.querySelectorAll('.mask')[0].setAttribute('style', 'top:0; bottom:0;');
	};

	this.attacheEvent = function(){
		var viewer = this.fullScreenView;
		var mask = viewer.querySelectorAll('.mask')[0];
		var container = viewer.querySelectorAll('.container')[0];

		container.addEventListener('click', function(event){
			this.handleMaskClick(event);

		}.bind(this), false);

		viewer.addEventListener('touchmove', function(event){
			event.stopPropagation();
			event.preventDefault();
		});

		window.addEventListener('resize', function(event){
			this.resizePanel();
		}.bind(this));

		document.querySelectorAll('body')[0].addEventListener('onorientationchange', function(){
			this.resizePanel();
		}.bind(this));
		
	};

	this.init();
};