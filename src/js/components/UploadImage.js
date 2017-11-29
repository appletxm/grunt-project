var UploadImage = function(param){

	this.canvas = null;
	//this.imageBase64 = null;
	this.param = {};

	this.init = function(param){
		this.param = param;

		this.createCanvas();
	};

	this.checkImage = function(files, bindNode, callback){
		var validateType = false;
		var fileSize = Math.ceil(files[0].size/1024);
		var reader = new FileReader();

		this.param.fileType.forEach(function(type){
			if(files[0].type.indexOf(type) >= 0){
				validateType = true;
			}
		});

		if(!validateType){
			this.param.messageBox.show({
				msg:'请选择正确的图片文件', 
				type:'alert', 
				autoClose: true
			});
			return false;
		}

		//read the image file
		reader.onload = function(){
			var url = reader.result;
			if(fileSize > this.param.fileMemory){
				this.reduceImage(url, bindNode, callback);
			}else{
				this.setImageURL(url, bindNode, callback);
			}
			
		}.bind(this);
		reader.readAsDataURL(files[0]);
	};

	this.setImageURL = function(url, bindNode, callback){
		if(bindNode){
			bindNode.setAttribute('src', url);
		}
		if(callback){
			callback(url);
		}
	};

	this.reduceImage = function(url, bindNode, callback){
		var image = new Image();

		image.src = url;
		image.onload = function(){
			this.setImageToCanvas(image, bindNode, callback);
		}.bind(this);

	};

	this.setImageToCanvas = function(image, bindNode, callback){
		var canvas = this.canvas;
		var userPicSize = this.param.fileSize;
		var scale = 1;

		var width = image.naturalWidth || 0;
		var height = image.naturalHeight || 0;

		if(width > userPicSize.width && height > userPicSize.height){
			var widthScale = userPicSize.width / width;
			var heightScale = userPicSize.height / height;
			scale = Math.min(widthScale, heightScale);

		}else if(width > userPicSize.width){
			scale = userPicSize.width/width;
		}

		else if(height > userPicSize.height){
			scale = userPicSize.height/height;
		}
		width = parseInt(scale * width,10);
		height = parseInt(scale * height, 10);


		canvas.setAttribute('width', width);
		canvas.setAttribute('height', height);

		var context = canvas.getContext('2d');
		context.drawImage(image, 0, 0, width, height);
		var url = canvas.toDataURL('image/jpeg', this.param.dip);

		this.setImageURL(url, bindNode, callback);
	};

	this.createCanvas = function(){
		this.canvas = document.createElement('canvas');
	};

	this.init(param);
};