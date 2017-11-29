var mockDetail = {
	"code": 0,
	"msg": "success",
	"data":[{
		userId: 11,
		name: "张医生",
		gender: "女",
		phone: "13212345678",
		title: "主院医师",
		department: "神经内科",
		hospital: "南方医院",
		introduction: "这是医生的简介",
		expertise: "确认修改信息了啊"
	}]
};

var mockSummary = {
	code: 0,
	msg: '',
	data: [
		{
			name: '唐唐',
			department: '儿科',
			title: '医师',
			photoUrl: '../../styles/images/dor_header.png'
		}
	]
};

var mockQr = {
	code:0,
	msg:'',
	data:[{
		doctor_qrurl: '../../styles/images/code.png',
		patient_qrurl: '../../styles/images/code.png'
	}]
};

var myCode = {
	ajax: null,
	messageBox: null,
	wxSDK: null,
	personalInfo:{},
	currentPageIndex:0,
	pageMax: 2,

	touchInfo:{
		start: {
			pageX: null
		},
		end: {
			pageX: null
		}
	},

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		this.wxSDK = new WeixinSDK();

		this.showLoading();

		this.wxSDK.init({
			debug: null,
			errorCallback: this.getVerificationInfo.bind(this),
			successCallback: this.getVerificationInfo.bind(this),
			jsApiList: [
				'onMenuShareTimeline',
				'onMenuShareAppMessage'
			],
			ajax: this.ajax
		});

		this.attachEvent();
	},
	
	getVerificationInfo: function() {
		var param = {
			sendParameters:{}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/user_auth_data/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetInfoSuccess.bind(this);
		param.onError = this.handleError.bind(this);

		this.ajax.send(param);

		//this.handleGetInfoSuccess(mockSummary);
	},
	
	handleGetInfoSuccess:function(responseText) {

		if(responseText.code === 0) {
			// 填入用户信息
			this.personalInfo = responseText.data[0];

			if(!responseText.data[0].photoUrl || responseText.data[0].photoUrl === ''){
				this.personalInfo.photoUrl = SYS_VAR.STATIC_ADDRESS + '/styles/images/dor_header.png';
			}

			this.getMyInformation();
		} else {
			this.handleError(responseText);
		}
	},

	getMyInformation:function(){
		var param = {
			sendParameters:{}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/get_info/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetMyInformationSuccess.bind(this);
		param.onError = this.handleError.bind(this);

		this.ajax.send(param);

		//this.handleGetMyInformationSuccess(mockDetail);
	},

	handleGetMyInformationSuccess:function(responseText){

		if(responseText.code === 0) {
			if (responseText.data && responseText.data.length > 0) {
				var info = responseText.data[0];
				for (var key in info) {
					if (!this.personalInfo[key]) {
						this.personalInfo[key] = info[key];
					}
				}

				this.showDoctorInfo(this.personalInfo);
				this.getQRCode();
			}
		}
	},

	showDoctorInfo: function(info){
		var html = [];
		var img;

		if(!info.photoUrl || info.photoUrl === '' || info.photoUrl === 'null' || info.photoUrl === 'undefined'){
			img = '<img src="../../../../styles/images/dor_header.png" />';
		}else{
			img = '<img src="' + info.photoUrl + '" />';
		}

		html.push(img);
		html.push('<h1 for="qrTitle">' + (info.name || '') + '</h1>');
		html.push('<span for="qrDepartment">' + (info.department || '') + '</span>');
		html.push('<span for="qrLevel">' + (info.title || '') + '</span>');
		html.push('<i>' + (info.hospital || '') + '</i>');

        var doctorInfo = document.querySelectorAll('.doctor-info');
		for(var i=0; i < doctorInfo.length; i++){
			doctorInfo[i].innerHTML = html.join('');
		}

		/*if (info.authStatus === 1) {
		 this.getQRCode();
		 } else {
		 // 显示未认证图片及文案
		 document.querySelectorAll('.no-data-tip')[0].style.display = 'block';
		 document.querySelectorAll('.my-code')[0].style.display = 'none';
		 }*/
	},

	getQRCode:function(){
		var param = {
			sendParameters:{}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/emit_qrcode/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetQRSuccess.bind(this);
		param.onError = this.handleError.bind(this);

		this.ajax.send(param);

		//this.handleGetQRSuccess(mockQr);
	},

	handleGetQRSuccess:function(responseText){

		if(responseText.code === 0){
			//basic path: /data/doctormx.t.7lk.com/auth_pics
			document.querySelector('#doctor_qr').innerHTML = '<img src="' + responseText.data[0].doctor_qrurl + '"/><p class="tip-show-msg">使用微信扫一扫进行绑定</p>';
			document.querySelector('#patient_qr').innerHTML = '<img src="' + responseText.data[0].patient_qrurl + '"/><p class="tip-show-msg">使用微信扫一扫进行绑定</p>';

			this.personalInfo['doctor_qrurl'] = responseText.data[0].doctor_qrurl;
			this.personalInfo['patient_qrurl'] = responseText.data[0].patient_qrurl;

			this.generateShareData();
			this.hideLoading();
		}else{
			this.handleError(responseText);
		}
	},

	handleError:function(responseText){
		var msg = responseText.msg;

		this.hideLoading();

		if(!msg || msg === ''){
			msg = '网络异常，请稍后重试';
		}
		
		this.messageBox.show({
			msg: msg,
			type:'alert', 
			autoClose: true
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

	handleStart: function(event){
		this.touchInfo.start.pageX = event.pageX || event.touches[0].pageX;

		event.preventDefault();
		event.stopPropagation();
	},

	handleMove: function(event){
		this.touchInfo.end.pageX = event.pageX || event.touches[0].pageX;

		event.preventDefault();
		event.stopPropagation();
	},

	handleEnd: function(event){
		var position = 1;
		var startPageX = this.touchInfo.start.pageX;
		var endPageX = this.touchInfo.end.pageX;

		if(endPageX !== null){
			if(startPageX > endPageX){
				position = 1
			}else if(startPageX < endPageX){
				position = 0;
			}else{
				position = null;
			}

			this.handleScroll(position);
			this.generateShareData();

			event.preventDefault();
			event.stopPropagation();
		}
	},

	handleScroll: function(position){
		var panels = document.querySelectorAll('.code-panel');
		var dots = document.querySelectorAll('.dot li');
		var left = '-150%';
		var lastIndex;
		var time = 300;

		lastIndex = this.currentPageIndex;

		if(position === 1){
			this.currentPageIndex ++;
		}else{
			left = '150%';
			this.currentPageIndex --;
		}

		if(this.currentPageIndex >= this.pageMax){
			this.currentPageIndex = 0;
		}

		if(this.currentPageIndex < 0){
			this.currentPageIndex = this.pageMax - 1;
		}

		for(var i=0; i<panels.length; i++){
			if(i !== lastIndex){
				panels[i].style.left = position ? '150%' : '-150%';
			}
		}

		setTimeout(function(){
			panels[lastIndex].className = panels[lastIndex].className + ' animate';
			panels[lastIndex].style.left = left;

			setTimeout(function(){
				panels[lastIndex].className = panels[lastIndex].className.replace(/\s{1}animate/g, '');
				panels[lastIndex].style.left = position ? '150%' : '-150%';
			}.bind(this), time);

			panels[this.currentPageIndex].className = panels[this.currentPageIndex].className + ' animate';
			panels[this.currentPageIndex].style.left = '50%';

			this.touchInfo.start.pageX = null;
			this.touchInfo.end.pageX = null;
		}.bind(this), 0);

		dots[lastIndex].className = '';
		dots[this.currentPageIndex].className = 'selected';
	},

	generateShareData: function(){
		var title, link, desc, urlParams, name;

		name = this.personalInfo.name.indexOf('医生') >= 0 ? this.personalInfo.name : (this.personalInfo.name + '医生');
		urlParams = '?' + 'name=' + encodeURIComponent(name);
		urlParams += '&' + 'department=' + encodeURIComponent(this.personalInfo.department);
		urlParams += '&' + 'title=' + encodeURIComponent(this.personalInfo.title);
		urlParams += '&' + 'hospital=' + encodeURIComponent(this.personalInfo.hospital);
		urlParams += '&' + 'photoUrl=' + encodeURIComponent(this.personalInfo.photoUrl);

		if(this.currentPageIndex === 1){
			urlParams += '&type=doctor';
			urlParams += '&' + 'codeImg=' + encodeURIComponent(this.personalInfo.doctor_qrurl);

			// desc = '推荐你使用大白云诊，推广期内完成注册认证，即得20元现金！';
			desc = '推荐您使用大白云诊，开启移动医疗之旅！'; //TODO
		}else{
			urlParams += '&type=patient';
			urlParams += '&' + 'codeImg=' + encodeURIComponent(this.personalInfo.patient_qrurl);

			desc = '你好，我是' + name + '！欢迎关注我的大白云诊公众号，以便为你提供一对一诊疗服务。';
		}

		title = '大白云诊邀请函';
		link = SYS_VAR.STATIC_ADDRESS + '/templates/my/my-code-share.html' + urlParams;

		// 获取“分享到朋友圈”按钮点击状态及自定义分享内容接口
		wx.onMenuShareTimeline({
			title: title,
			desc: desc,
			link: link,
			imgUrl: this.personalInfo.photoUrl
		});
		// 获取“分享给朋友”按钮点击状态及自定义分享内容接口
		wx.onMenuShareAppMessage({
			title: title,
			desc: desc,
			link: link,
			imgUrl: this.personalInfo.photoUrl
		});
	},

	attachEvent: function(){
		var panel = document.querySelector('#myCode');

		panel.addEventListener('touchstart', function(event){
			this.handleStart(event);
		}.bind(this));

		panel.addEventListener('touchmove', function(event){
			this.handleMove(event);
		}.bind(this));

		panel.addEventListener('touchend', function(event){
			this.handleEnd(event);
		}.bind(this));
	}
};

myCode.init();