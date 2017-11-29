'use strict';

var mockAuthData = {
	"code": 0,
	"msg": "成功",
	"data": [
		{
			"doctorId": 11,
			"name": "林林",
			"title": "医师",
			"department": "感染内科",
			"infoStatus": 1,
			"authStatus": 4,

			"photoUrl": "../../styles/images/ad_0.png", //personal
			"emcardUrl": "../../styles/images/ad_1.png", //work
			//"vocatecerUrl": "http://yun.dabai.7lk.com/dri/vocatecer/11/1436365939436.jpg", //qaulity
			'vocatecerUrl' : '',
			"failReason": null
		}
	]
};

var authorVerification = {
	ajax: null,
	messageBox: null,
	uploadImage: null,
	fullScreenViewer: null,

	serverAddress: SYS_VAR.SERVER_ADDRESS,
	authStatusMsg:{
		code_0: '审核中',
		code_1: '已认证',
		code_2: '认证失败',
		code_3: '再次认证',
		code_4: '未认证'
	},
	oldImageInfo:{
		photoUrl: '',
		emcardUrl: '',
		vocatecerUrl: ''
	},
	modifyImage:{
		photoUrl: '',
		emcardUrl: '',
		vocatecerUrl: ''
	},
	currentImageNode: null,
	activeInput: null,
	//dataHasChanged: false,
	totalPhotoNumber: 0,
	totalLoadTimes: 0,

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		this.fullScreenView = new FullScreenView();
		this.uploadImage = new UploadImage(
			{
				fileMemory: 20,
				fileType:['jpeg','png','gif'],
				fileSize:{
					width: 500,
					height: 400
				},
				dip: 0.3,
				messageBox: this.messageBox
			}
		);

		this.getUserVerifyImages();
		this.attachEvent();
	},

	getUserVerifyImages: function(){
		var param = {
			sendParameters:{}
		};
		param.url = this.serverAddress + 'doc/user_auth_data/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetUserImagesSuccess.bind(this);
		param.onError = this.handleGetUserImagesError.bind(this);
		//param.mssage = this.messageBox;

		this.showLoading();

		this.ajax.send(param);

		//this.handleGetUserImagesSuccess(mockAuthData);
	},

	handleGetUserImagesSuccess: function(responseText){

		if(responseText.code === 0){
			this.hideLoading();

			if(responseText.data[0].infoStatus === 1 || responseText.data[0].infoStatus === '1'){
				document.querySelectorAll('.tip-for-upload')[0].style.display = 'none';
				document.querySelectorAll('.tip-msg-fixed')[0].style.display = 'block';
				document.querySelector('#uploadImagePanel').style.display = 'block';
				document.querySelector('#saveVerityImages').style.display = 'block';
				document.querySelector('#authorStatusText').style.display = 'block';
			}else{
				document.querySelectorAll('.tip-for-upload')[0].style.display = 'block';
				return;
			}
			this.showStatusText(responseText.data[0].authStatus);
			this.showImageList(responseText.data[0]);
		}else{
			this.handleGetUserImagesError(responseText);
		}
	},

	handleGetUserImagesError: function(responseText){
		var msg = responseText.msg;

		if(!msg || msg === ''){
			msg = '网络异常，请稍后再试';
		}

		this.messageBox.show({
			msg: msg,
			type: 'alert', 
			autoClose: true
		});
	},

	showImageList: function(data){
		var canEditImage;
		var dd = document.querySelectorAll('#uploadImagePanel dd');

		dd[0].innerHTML = this.getImageCellHtml(data.photoUrl, 'uploadPersonImage', 'photoUrl');
		dd[1].innerHTML = this.getImageCellHtml(data.emcardUrl, 'uploadWorkImage', 'emcardUrl');
		dd[2].innerHTML = this.getImageCellHtml(data.vocatecerUrl, 'uploadQualityImage', 'vocatecerUrl');

		//alert('photoUrl:' + data.photoUrl+'\n emcardUrl:'+data.emcardUrl +'\n vocatecerUrl:'+data.vocatecerUrl);

		canEditImage = data.authStatus !== 1 && data.authStatus !== 0;


		this.setPreloadImage(data.photoUrl, data.emcardUrl, data.vocatecerUrl);

		this.canEditImage(canEditImage);
	},

	showStatusText: function(authStatus){
		var msg = this.authStatusMsg['code_' + authStatus];

		msg = msg ? ('认证状态：<b>' + msg + '</b>') : '';
		document.querySelector('#authorStatusText').innerHTML = msg;
	},

	getImageCellHtml: function(imgUrl, inputId, imgType){
		var html = [];

		if(imgUrl && imgUrl !== '' && imgUrl !== 'null' && imgUrl !== 'undefined'){
			this.totalPhotoNumber++;

			html.push('<b>');
			html.push('<img src="' + imgUrl + '" width="100px" />');
			html.push('<a class="but but-delete-orange" imgType="' + imgType +'"></a>');
			html.push('</b>');
			html.push('<span style="display:none;">');
			html.push('<a class="but but-only-border">上传图片</a>');
			html.push('<input id="' + inputId + '" type="file" accept="image/*" capture="camera" imgType="' + imgType);
			html.push('" onchange="authorVerification.handleInputFileChange(event);"/>');
			html.push('</span>');
		}else{
			html.push('<b style="display:none;">');
			html.push('<img src="../../../../styles/images/blank.png" width="100px"/>');
			html.push('<a class="but but-delete-orange" imgType="' + imgType +'"></a>');
			html.push('</b>');
			html.push('<span>');
			html.push('<a class="but but-only-border">上传图片</a>');
			html.push('<input id="' + inputId + '" type="file" accept="image/*" capture="camera" imgType="' + imgType );
			html.push('" onchange="authorVerification.handleInputFileChange(event);"/>');
			html.push('</span>');
		}

		return html.join('');

	},

	setPreloadImage: function(photoUrl, emcardUrl, vocatecerUrl){
		var preloadPanel = document.querySelector('#preLoadImageDiv');
		var imgStr = '';

		imgStr += '<img src="' + photoUrl + '" id="pImg_photoUrl" onload="authorVerification.handleImgLoadEvent();"/>';
		imgStr += '<img src="' + emcardUrl + '" id="pImg_emcardUrl" onload="authorVerification.handleImgLoadEvent();"/>';
		imgStr += '<img src="' + vocatecerUrl + '" id="pImg_vocatecerUrl" onload="authorVerification.handleImgLoadEvent();"/>';

		preloadPanel.innerHTML = imgStr;

		//this.getImageDataUrlFromCanves();
	},

	handleImgLoadEvent: function(){
		this.totalLoadTimes++;
		if(this.totalLoadTimes === this.totalPhotoNumber){
			this.getImageDataUrlFromCanves();
		}
	},

	getImageDataUrlFromCanves: function() {
		var images = document.querySelectorAll('#preLoadImageDiv img');
		var matchArray;
		var loadImageCount = 0;

		if (images.length <= 0) {
			return false;
		}

		matchArray = [
			{
				'canvas': null, //document.querySelector('#photoUrl'),
				'url': this.oldImageInfo.photoUrl,
				'img': images[0]
			},
			{
				'canvas': null, //document.querySelector('#emcardUrl'),
				'url': this.oldImageInfo.emcardUrl,
				'img': images[1]
			},
			{
				'canvas': null, //document.querySelector('#vocatecerUrl'),
				'url': this.oldImageInfo.vocatecerUrl,
				'img': images[2]
			}
		];

		matchArray[0]['canvas'] = document.createElement('canvas');
		matchArray[1]['canvas'] = document.createElement('canvas');
		matchArray[2]['canvas'] = document.createElement('canvas');

		matchArray[0]['canvas'].setAttribute('id', 'photoUrl');
		matchArray[1]['canvas'].setAttribute('id', 'emcardUrl');
		matchArray[2]['canvas'].setAttribute('id', 'vocatecerUrl');

		try {

			for (var i = 0; i < matchArray.length; i++) {
				var img = matchArray[i]['img'];
				var canvas = matchArray[i]['canvas'];
				var url = matchArray[i]['url'];

				loadImageCount++;

				img.setAttribute('crossOrigin', 'Anonymous');

				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;
				canvas.getContext('2d').drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, img.naturalWidth, img.naturalHeight);
				//url = canvas.toDataURL('image/jpeg', 1);

				this.oldImageInfo[canvas.getAttribute('id')] = canvas.toDataURL('image/jpeg', 1);
				this.modifyImage[canvas.getAttribute('id')] = canvas.toDataURL('image/jpeg', 1);

				if (loadImageCount === this.totalPhotoNumber) {
					this.destroyImagePreLoadCanvas(matchArray);
				}
			}

		} catch (e) {
			alert(e);
		}
	},

	destroyImagePreLoadCanvas: function(matchArray){
		var preloadPanel = document.querySelector('#preLoadImageDiv');
		for(var i =0; i < matchArray.length; i++){
			preloadPanel.appendChild(matchArray[i]['canvas']);
			matchArray[i]['img'].onload = null;
		}

		document.querySelectorAll('body')[0].removeChild(preloadPanel);
	},

	handleInputFileChange: function(event){
		this.currentImageNode = event.target.parentNode.parentNode.querySelectorAll('img')[0];
		this.activeInput = event.target;
		
		this.uploadImage.checkImage(event.target.files, this.currentImageNode, this.afterImageCheckCallback.bind(this));
	},

	afterImageCheckCallback: function(imageBase64){

		if(imageBase64){
			this.activeInput.parentNode.style.display = 'none';
			this.currentImageNode.parentNode.style.display = 'block';
			this.modifyImage[this.activeInput.getAttribute('imgType')] = imageBase64;
		}

		this.activeInput.files = null;
		this.currentImageNode = null;
		this.activeInput = null;
	},

	handleClick: function(event){
		var tageName = event.target.tagName.toLowerCase();

		if(tageName === 'a'){
			this.deleteImage(event.target);
			event.stopPropagation();
		}else if(tageName === 'img'){
			this.imageBigView(event.target, event);
			event.stopPropagation();
		}
	},

	deleteImage: function(target){
		var parentNode = target.parentNode;
		var inputNode = parentNode.nextSibling;
		var inputNodeHtml = inputNode.innerHTML;

		inputNode.innerHTML = '';
		inputNode.innerHTML = inputNodeHtml;

		this.modifyImage[target.getAttribute('imgType')] = '';
		parentNode.style.display = 'none';
		inputNode.style.display = 'block';
	},

	doSaveVerifyImages: function(){
		var canBeUploadImage = this.validateImages();

		if(canBeUploadImage){
			var param = {
				sendParameters:{}
			};

			for(var type in this.modifyImage){
				param.sendParameters[type] = this.modifyImage[type];
			}

			param.url = this.serverAddress + 'doc/up_licence/';
			param.type = 'POST';
			param.asyn = true;
			param.onSuccess = this.handleSaveImagesSuccess.bind(this);
			param.onError = this.handleSaveImagesError.bind(this);
			param.needPostJson = true;
			param.mssage = this.messageBox;


			param.sendParameters['phoneFile'] = param.sendParameters['photoUrl'];
			param.sendParameters['emCardFile'] = param.sendParameters['emcardUrl'];
			param.sendParameters['vocateFile'] = param.sendParameters['vocatecerUrl'];

			delete param.sendParameters['photoUrl'];
			delete param.sendParameters['emcardUrl'];
			delete param.sendParameters['vocatecerUrl'];

			this.ajax.send(param);
		}
		
	},

	validateImages: function(){
		var newImages = this.modifyImage;
		var oldImages = this.oldImageInfo;
		var count = 0;
		var imageTitles = {
			photoUrl:'个人图片',
			emcardUrl: '工作证',
			vocatecerUrl: '职业资格证'
		};
		var empltyImages = [];
		var canBeUpload = true;

		for(var imageType in newImages){
			if(newImages[imageType] !== oldImages[imageType]){
				count++;
			}

			if(newImages[imageType] === '' || newImages[imageType] === undefined || newImages[imageType] === null || newImages[imageType] === 'undefined' || newImages[imageType] === 'null'){
				empltyImages.push(imageType);
			}
		}

		if(empltyImages.length > 0){
			var msgStr = '请上传您的';
			for(var i = 0; i < empltyImages.length; i++){
				var dot = (i === empltyImages.length - 1) ? '' : '、';
				msgStr += (imageTitles[empltyImages[i]] + dot)
			}
			this.messageBox.show({
				msg: msgStr, 
				type:'alert', 
				autoClose: true
			});

			canBeUpload = false;
		}

		if(count === 0){
			this.messageBox.show({
				msg: '您的图片还没有任何的修改', 
				type:'alert', 
				autoClose: true
			});

			canBeUpload = false;
		}

		return canBeUpload;

	},

	handleSaveImagesSuccess: function(responseText){
		if(responseText.code === 0 || responseText.code === '0'){
			this.messageBox.show({
				msg: '您的图片已提交，请耐心等待我们的审批', 
				type:'alert', 
				autoClose: true
			});

			this.canEditImage(false);
			this.showStatusText(0);

		}else{
			this.handleSaveImagesError(responseText);
		}
	},

	handleSaveImagesError: function(responseText){
		this.messageBox.show({
			msg: responseText.msg || '', 
			type:'alert', 
			autoClose: true
		});
	},

	canEditImage: function(isCanEdit){
		var deleteButs = document.querySelectorAll('#uploadImagePanel .but-delete-orange');
		var display = ''
		if(isCanEdit){
			display = 'block';
		}else{
			display = 'none';
		}

		document.querySelector('#saveVerityImages').style.display = display;

		for(var i=0; i<deleteButs.length; i++){
			deleteButs[i].style.display = display;
		}
	},

	imageBigView: function(image, event){
		//window.location.href = image.getAttribute('src');
		this.fullScreenView.show({
			type: 1,
			src: image.getAttribute('src'),
			event: event
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
	},

	attachEvent: function(){
		var uploadPanel = document.querySelector('#uploadImagePanel');
		var saveVerify = document.querySelector('#saveVerityImages');

		uploadPanel.addEventListener('click', function(event){
			this.handleClick(event);

		}.bind(this), false);

		saveVerify.addEventListener('click', function(){
			this.doSaveVerifyImages();

		}.bind(this), false);
	}
};

authorVerification.init();