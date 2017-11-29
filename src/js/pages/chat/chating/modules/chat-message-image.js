var chatMessageImage = {
	pageObj: null,

	messageBox: null,
	ajax:null,
	popWindow: null,

	imageInfo:{},

	init:function(params) {
		if (params) {
			this.ajax = params.pageObj.ajax;
			this.messageBox = params.pageObj.messageBox;
			this.popWindow = params.pageObj.popWindow;

			this.pageObj = params.pageObj;
		}

		this.preloadImage();
	},

	preloadImage: function(){
		var imgLoading = new Image();
		/*var imgAudioAni = new Image();
		var imgAudio = new Image();*/
		imgLoading.setAttribute('src', '../../styles/images/loading.gif');
		/*imgAudioAni.setAttribute('src', '../../styles/images/voice_animate.gif');
		imgAudio.setAttribute('src', '../../styles/images/voice_static.png');*/
	},

	chooseImageFile: function(){
		var info = this.imageInfo;

		info.localId = null;
		info.serverId = null;

		if(this.isImageApiOk() === false){
			return false;
		}

		wx.chooseImage({
			count: 1, // 默认9
			sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function (res) {
				info.localId = res.localIds[0]; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
				chatMessageImage.uploadImageToWXServer(info.localId);
			}
		});
	},

	uploadImageToWXServer: function(localId){
		var info = this.imageInfo;

		wx.uploadImage({
			localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
			isShowProgressTips: 1, // 默认为1，显示进度提示
			success: function (res) {
				//alert('uploadImage:' + JSON.stringify(res));
				info.serverId = res.serverId; // 返回图片的服务器端ID
				chatMessageImage.uploadImageSuccessCallback();
			}
		});
	},

	uploadImageSuccessCallback: function(){
		var info = this.imageInfo;

		//alert('uploadImageSuccessCallback:' + info.localId + ':' + info.serverId);

		this.pageObj.combineSendMsgParams('', 2, info.serverId, info.localId, 0);

	},

	getCellHtml: function(data, baseUrl){
		var content = [];
		var localId = data['content']['local_id'];
		//var mediaId = data['content']['media_id'];

		content.push('<div class="image-msg">');

		if(localId && localId !== '' && localId !== 'null' && localId !== 'undefined'){
			content.push('<img src="' + localId + '" height="160" onclick="chat.mediaFullScreenView(\'' + localId +'\', 1, event);" onload="chat.scrollToMsg();" />');
		}else{
			content.push((data.content.path && data.content.path !== '')? '<img src="' + (baseUrl + data.content.path) + '?s=t" height="160" onclick="chat.mediaFullScreenView(\'' + (baseUrl + data.content.path) +'\', 1, event);" onload="chat.scrollToMsg();" />' : '');
		}

		content.push('</div>');

		return content.join('');
	},

	isImageApiOk: function(){
		if(chatInitWXAPI.isAPILoadSuccess !== true){
			this.messageBox.show({
				msg:'微信图片API初如化失败，请刷新页面重试',
				type:'alert',
				autoClose: true
			});

			return false;
		}else{
			return true;
		}
	}

};