/**
parameters includes below value;
images: //Array 
needHref: //Boolean
autoSlide: //Boolean
autoTime: //number
position: 0// 1:left to right, 0:right to left
**/

var SlideImage = function(){
	this.param = {};
	this.slideImage = {
		slidePanel: null,
		imagePanel: null,
		dotPanel: null
	};
	this.currentPicIndex = 0;
	this.imageLi = null;
	this.touchInfo = {
		start:{
			pageX: 0,
			pageY: 0
		},
		end:{
			pageX: 0,
			pageY: 0
		}
	};

	this.init = function(param){
		this.param = param;

		if(this.param.position === null || this.param.position === undefined){
			this.param.position = 1;
		}

		this.buildImagePanel(param.images);
	};

	this.buildImagePanel = function(images){
        var imageHtml = '';
        var dotHtml = '';
		var leftStyle = '';
        var slide = [];

		if(this.param.position === 1){
			leftStyle = 'style="left:-100%;"';
		}else{
			leftStyle = 'style="left:100%;"';
		}

        if(images && images.length > 0){
        	slide = this.slideImage;

            slide.imagePanel = document.createElement('ul');
            slide.dotPanel = document.createElement('ul');

            slide.imagePanel.className = 'image';
            slide.dotPanel.className = 'dot';

            for(var i = 0; i<images.length; i++){
                imageHtml += '<li slideIndex="' + i + '" ' + ((i === 0)?'':leftStyle)+ '><img id="image1" src="' + images[i] + '" slideIndex="' + i + '"/></li>';
                dotHtml += '<li class="' + (i === 0 ? 'selected':'') + '"></li>';
            }

            this.slideImage.imagePanel.innerHTML = imageHtml;
            this.slideImage.dotPanel.innerHTML = dotHtml;
            this.param.bind.appendChild(this.slideImage.imagePanel);
        	this.param.bind.appendChild(this.slideImage.dotPanel);

        	setTimeout(function(){
        		this.resizePanel();
        		this.activeSlide();
        	}.bind(this), 1000);

        	this.attachEvent();
        }

    };

    this.startAutoSlide = function(){
    	if(this.param.images.length > 1){
    		if(this.param.autoSlide){
	    		this.param.timer = setInterval(function(){
	    			this.doSlideEvent(this.currentPicIndex, this.param.position);
	    		}.bind(this), this.param.autoTime);
	    	}
    	}
    };


    this.resizePanel = function(){
    	var pageWidth = document.documentElement.clientWidth;
    	var images = this.param.bind.querySelectorAll('img');
    	var ul = this.param.bind.querySelectorAll('.image')[0];
    	var height = 0;

    	for(var i=0; i < images.length; i++){
    		height = Math.max(height, images[i].naturalHeight);
    	}
    	ul.setAttribute('style', 'height:'+ height + 'px');

    };

    this.handleTouchStart = function(event){
    	this.clearSlide();
	    this.touchInfo.start.pageX = event.pageX || event.touches[0].pageX;
	    event.preventDefault();
	    event.stopPropagation();
    };

	this.handleTouchMove = function(event){
		this.touchInfo.end.pageX = event.pageX || event.touches[0].pageX;
		event.preventDefault();
		event.stopPropagation();
	};

    this.handleTouchEnd = function(event){
    	var touchInfo = this.touchInfo;
    	var nodeIndex = 0;

	    event.preventDefault();
	    event.stopPropagation();

    	nodeIndex = parseInt(event.target.getAttribute('slideIndex'), 10);

    	//alert(touchInfo.start.pageX + ':' + touchInfo.end.pageX + ':'+ nodeIndex);

    	if(touchInfo.start.pageX - touchInfo.end.pageX < 0){
    		this.doSlideEvent(nodeIndex, 1);
    	}else if(touchInfo.start.pageX - touchInfo.end.pageX > 0){
    		this.doSlideEvent(nodeIndex, 0);
    	}

    	this.activeSlide();
    };

    this.doSlideEvent = function(nodeIndex, position){
    	//var currentNode = null;
    	//var nextNode = null;
    	var oldIndex = nodeIndex;

    	if(this.param.images.length <= 1){
    		return false;
    	}

    	if(!this.imageLi){
    		this.imageLi = this.param.bind.querySelectorAll('.image li');
    	}

    	if(position === 1){
    		nodeIndex--;
	    	if(nodeIndex < 0){
	    		nodeIndex = this.imageLi.length - 1;
	    	}
    	}else{
    		nodeIndex++;
    		if(nodeIndex >= this.imageLi.length){
	    		nodeIndex = 0;
	    	}
    	}
    	this.currentPicIndex = nodeIndex;
    	
    	this.selectedDot(this.currentPicIndex);
    	this.doAnimate(this.imageLi, this.currentPicIndex, oldIndex, position);

    };

    this.selectedDot = function(currentIndex){
    	var li = this.param.bind.querySelectorAll('.dot li');
    	for(var i=0; i< li.length; i++){
    		if(i === currentIndex){
    			li[i].className = 'selected';
    		}else{
    			li[i].className = '';
    		}
    	}
    };

    this.doAnimate = function(li, fadeInNodeIndex, fadeOutNodeIndex, position){
    	var animateTime = 510;
    	//var fadeInNode = li[fadeInNodeIndex];
    	//var fadeOutNode = li[fadeOutNodeIndex];

    	for(var i = 0; i < li.length; i++){
    		if(i !== fadeOutNodeIndex){
    			li[i].style.top = '-9999px';
				li[i].style.left = position === 1 ? '-100%':'100%';
				li[i].style.top = '0';
				li[i].className = 'active';
    		}
    	}

		li[fadeOutNodeIndex].className = 'active';
		li[fadeOutNodeIndex].style.left = position === 1 ? '100%':'-100%';
		setTimeout(function(){
			li[fadeOutNodeIndex].className = '';
    		li[fadeOutNodeIndex].style.top = '-9999px';
    		li[fadeOutNodeIndex].style.left = position === 1 ? '-100%':'100%';
    		li[fadeOutNodeIndex].style.top = '0';
    	}, animateTime);

    	li[fadeInNodeIndex].style.left = 0;

    };

    this.clearSlide = function(){
    	if(this.param.autoSlide){
    		clearInterval(this.param.timer);
    	}
    };

    this.activeSlide = function(){
    	if(this.param.autoSlide){
    		this.startAutoSlide();
    	}
    };

    this.attachEvent = function(){

        this.param.bind.addEventListener('touchstart', function(event){
	        this.handleTouchStart(event);
        }.bind(this));

	    this.param.bind.addEventListener('touchmove', function(event){
		    this.handleTouchMove(event);
	    }.bind(this));

        this.param.bind.addEventListener('touchend', function(event){
	        this.handleTouchEnd(event);
        }.bind(this));

		window.addEventListener('resize', function(){
			this.resizePanel();
		}.bind(this));

		window.addEventListener('blur', function(){
			this.clearSlide();
		}.bind(this));
		window.addEventListener('unload', function(){
			this.clearSlide();
		}.bind(this));
		window.addEventListener('focus', function(){
			this.activeSlide();
		}.bind(this));
    };

};