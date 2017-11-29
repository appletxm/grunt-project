var abcSideBar = {
	messageBox: null,
	pageObj: null,

	init: function(params){
		if(params){
			this.pageObj = params.pageObj;
			this.messageBox = params.pageObj['messageBox'];
		}
	},

	showABCSideBar: function(params){
		var list = params.list || [];
		var panel = params.bindObj;
		var outer;
		var mask;
		var inner;

		if(params.list.length <= 1){
			return false;
		}

		outer = document.createElement('span');
		outer.className = params.css || 'abc-side-bar-outer';
		outer.setAttribute('id', 'abcSideBarOuter')

		mask = document.createElement('div');
		mask.className = 'abc-side-bar-mask';

		inner = document.createElement('span');
		inner.innerHTML = this.getSideBarHtml(list).join('');

		outer.appendChild(mask);
		outer.appendChild(inner);
		panel.appendChild(outer);
	},

	getSideBarHtml: function(list){
		var content = [];
		var height;
		//var floatNumb;

		height = ((1/list.length)*100 + '%');
		//floatNumb = parseFloat(((1/list.length) + '').match(/(\d.\d\d)/g)[0]);
		//height = (floatNumb*100 + '%');

		content.push('<ul id="sideBarLit" class="abc-side-bar-list" ontouchstart="abcSideBar.slideBarScroll(event);" ontouchmove="abcSideBar.touchMoveScroll(event);">');


		list.forEach(function(key){
			var value;

			if(key === '#'){
				value =  'other';
			}else{
				value = key;
			}

			content.push('<li style="height:' + height + ';"><a for-id="ABC_key_' + value + '">' + key + '</a></li>');
		});
		content.push('</ul>');

		return content;
	},

	slideBarScroll: function(event){
		var target = event.target;
		var label = target.tagName.toLowerCase();

		if(label === 'a'){
			this.doSlideBarScroll(target);
		}

		event.stopPropagation();
		event.preventDefault();
	},

	touchMoveScroll: function(event){
		var navDom = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);

		if(navDom && navDom.tagName.toLowerCase() === 'a'){
			this.doSlideBarScroll(navDom);
		}

		event.preventDefault();
		event.stopPropagation();
	},

	doSlideBarScroll: function(target){
		var a = document.querySelector('#' + target.getAttribute('for-id'));
		if(a){
			this.getTopForNavigator(a);
		}
	},

	getTopForNavigator: function(node, offset){
		//var gap = document.querySelector('#listContent').offsetTop;
		var gap = 0;

		if(!offset){
			var offset = {};
			offset.top = 0;
			offset.left = 0;
		}

		offset.top += node.offsetTop - gap;
		offset.left += node.offsetLeft;

		this.doNavigatorScroll(offset);
	},

	doNavigatorScroll:function(offset){
		var body = document.querySelector('#patient-list');
		var gap = 3;

		body.scrollTop = offset.top + gap;

	}
};
// 测试数据
var mockGetLatestMessageList = {
	"data": [
		[
			[29,{'patient_remark': '潜水的鱼备注', 'patient_name': '潜水的鱼', 'patient_id': 29, 'last_time': 1450942056000, 'count': 0, 'patient_img': 'http://wx.qlogo.cn/mmopen/K8iaLV5wicvbutWgZ8XOtHkSdRLAd6ZpQiar5icTC7Q9l9hU16Z3UlpaTZ1tS1bL82Q89w5GXsqKKicickyicGvw7a3vw/0', "last_msg" : "abc"}],
			[24, {"count": 20, "patient_img": "http://wx.qlogo.cn/mmopen/5nv6lZBCcSFIiaFrgDn2iaKIZQlcnO4dU8F59fnSA1PT1EHpWcaLhWiaC5vqszcEVDBZKF8DDcYlut0KcjPelOSdhcqNEasTTrn/0", "last_time": 1442815514740, "patient_name": "\u5927\u8d1d", "patient_id": 24,  "last_msg" : "abc"}]
		],

		[
			[24, {'patient_remark': null, 'patient_name': '许小娟', 'patient_id': 24, 'last_time': 1450775403000, 'count': 0, 'patient_img': 'http://wx.qlogo.cn/mmopen/S9AS0PYRpIwzjI4dt7LPbCIP8WfHjtapsny3HvrTc9gdtd2agvFTMZaUdMo55XQSpiafibDoUUt5Zp8qVBIia25dBfyy29AXFc9/0', "last_msg" : "abc"}],
		],

		{
			totalCount: 10,
			totalPage: 3,
			pageNo: 1
		}
	],
	"code": 0,
	"msg": "success"
};

var latestMessage = {
	ajax: null,
	messageBox: null,
	requestUrl: SYS_VAR.SERVER_ADDRESS,

	pageInfo:{
		page: 1,
		num: 10
	},

	pageObj: null,

	init: function(params){
		if(params){
			this.pageObj = params.pageObj;

			this.ajax = params.pageObj['ajaxForMessage'];
			this.messageBox = params.pageObj['messageBox'];

			this.skipPage = params.pageObj['skipPage'];
		}
	},

	getLatestMessage: function(){
		var param = {
			sendParameters:{}
		};
		var bindObj;

		bindObj = document.querySelector('#patient-latest-list');

		param.sendParameters.doctor_id = this.pageObj.doctorId;
		param.sendParameters.page = this.pageInfo.page;
		param.sendParameters.num = this.pageInfo.num;
		param.url = this.requestUrl + 'chat_api/get_consult';

		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.getLatestMessageSuccess.bind(this);
		param.onError = patientAdmin.handleGetError.bind(patientAdmin);

		this.pageObj.showLoading();

		this.skipPage.init({
			pageInfo: this.pageInfo,
			bindObj: bindObj,
			param: param,
			ajax: this.ajax,
			needSkipNext: true,
			needSkipPrev: false,
			messageBox: this.messageBox,
			scrollObj: bindObj,
			isSelfInterface: true
		});

		//this.getLatestMessageSuccess(mockGetLatestMessageList);
	},

	getLatestMessageSuccess: function(responseText){
		var content;
		var panel = document.querySelector("#patient-latest-list");
		var list = [];
		var noData = '<p class="no-data-tip no-data-latest-msg"></p>';
		var ul;

		if(responseText.code === 0){

			this.pageObj.hideLoading();

			this.skipPage.isFirstLoad = false;

			if(responseText.data && responseText.data.length > 0) {
				list = this.getNewLatestMessageData(responseText.data);

				if(list.length > 0){
					content = this.getLatestMsgListHtml(list);
				}else{
					content = this.pageInfo.page === 1 ? noData : '';
				}
			}else{
				content = this.pageInfo.page === 1 ? noData : '';
			}

			if(content !== noData){
				ul = document.createElement('ul');
				ul.className = 'cm-list cm-list-border-top cm-list-t-img-ctrl';
				ul.innerHTML = content;
				panel.appendChild(ul);
			}else{
				if(this.pageInfo.page === 1){
					panel.innerHTML = content;
				}
			}
		}else{
			this.pageObj.handleGetError(responseText);
		}
	},

	getNewLatestMessageData: function(data){
		var list = [];

		if(data[0] && data[0].length > 0){
			data[0].map(function(item){
				item[1]['isTop'] = true;
			});

			list = list.concat(data[0]);
		}

		if(data[1] && data[1].length > 0){
			list = list.concat(data[1]);
		}

		return list;
	},

	getLatestMsgListHtml: function(patientList){
		var content, patientName, patientImg, detailParams, timeStr;

		for(var i=0; i < patientList.length; i++){
			var chatUrl = '../chat/chat.html',
				countNo = '';

			patientName = patientList[i][1].patient_remark || patientList[i][1].patient_name;
			patientImg = patientList[i][1].patient_img;
			timeStr = timeFormat.getTimeText(patientList[i][1].last_time);

			//alert(patientName + ':' + patientImg);

			patientImg = this.pageObj.getPatientDefaultIcon(patientList[i][1].patient_img);
			patientList[i][1].patient_img = patientImg;

			chatUrl += '?doctor_id=' + encodeURIComponent(this.pageObj.doctorId);
			chatUrl += '&patient_id=' +  encodeURIComponent(patientList[i][0]);
			chatUrl += '&patient_name=' +  encodeURIComponent(patientName);
			chatUrl += '&patient_icon=' + encodeURIComponent(patientImg);

			detailParams = '\'' + encodeURIComponent(patientList[i][0]) + '\'';
			detailParams += ',' + '\'' + encodeURIComponent(patientName) + '\'';
			detailParams += ',' + '\'' + encodeURIComponent(patientImg) + '\'';
			detailParams += ',' + '\'' + encodeURIComponent(this.pageObj.doctorId) + '\'';

			if(patientList[i][1].count > 0){
				countNo = patientList[i][1].count;
				countNo = countNo > 99 ? (99 + '+') : countNo;
			}

			if(patientList[i][1].isTop === true){
				patientList[i].topClass = 'top-message';
			}else{
				patientList[i].topClass = '';
			}

			patientList[i][1].chatUrl = chatUrl;
			patientList[i][1].countNo = countNo;
			patientList[i][1].last_time = timeStr;
			patientList[i][1].doctorId = this.pageObj.doctorId;
		}

		content = template(document.getElementById('qna-list-tpl').innerHTML, {
			list: patientList
		});

		return content;
	},

	getFormatTime: function(time){

	},

	handleLatestMessage: function(){
		if(this.pageObj.hasLoadedLatestMessage === false){
			this.pageObj.hasLoadedLatestMessage = true;
			this.getLatestMessage();
		}
	}
};
// 测试数据
var mockMyPatientList = {
	"code": 0,
	"msg": "成功",
	"data": [
		{
			"key": "#",
			"voList": [
				{
					"id": 1,
					"patientIcon": "",
					"name": "士大夫似的1",
					"gender": '男',
					"age": 31,
					"createTime": 1433312904000
				}
			]
		},
		{
			"key": "A",
			"voList": [
				{
					"id": 1,
					"patientIcon": "http://file-www.sioe.cn/201109/14/222211817.jpg",
					"name": "士大夫似的1",
					"gender": '男',
					"age": 31,
					"createTime": 1433312904000
				}
			]
		},
		{
			"key": "B",
			"voList": [
				{
					"id": 1,
					"patientIcon": "http://file-www.sioe.cn/201109/14/222211817.jpg",
					"name": "士大夫似的1",
					"gender": '男',
					"age": 31,
					"createTime": 1433312904000
				}
			]
		},
		{
			"key": "D",
			"voList": [
				{
					"id": 1,
					"patientIcon": "http://file-www.sioe.cn/201109/14/222211817.jpg",
					"name": "士大夫似的1",
					"gender": '男',
					"age": 31,
					"createTime": 1433312904000
				}
			]
		},{
			"key": "F",
			"voList": [
				{
					"id": 1,
					"patientIcon": "http://file-www.sioe.cn/201109/14/222211817.jpg",
					"name": "士大夫似的1",
					"gender": '男',
					"age": 31,
					"createTime": 1433312904000
				}
			]
		},
		{
			"key": "G",
			"voList": [
				{
					"id": 1,
					"patientIcon": "http://file-www.sioe.cn/201109/14/222211817.jpg",
					"name": "士大夫似的1",
					"gender": '男',
					"age": 31,
					"createTime": 1433312904000
				}
			]
		},
		{
			"key": "W",
			"voList": [
				{
					"id": 1,
					"patientIcon": "http://file-www.sioe.cn/201109/14/222211817.jpg",
					"name": "士大夫似的1",
					"gender": '男',
					"age": 31,
					"createTime": 1433312904000
				}
			]
		}
	]
};

var patientList = {
	ajax: null,
	messageBox: null,
	requestUrl: SYS_VAR.SERVER_ADDRESS,

	pageObj: null,
	abcKeyList: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M','N', 'O', 'P', 'Q', 'R', 'S','T','U','V','W','X','Y','Z', '#'],

	init: function(params){
		if(params){
			this.pageObj = params.pageObj;

			this.ajax = params.pageObj['ajaxForPatient'];
			this.messageBox = params.pageObj['messageBox'];
		}
	},

	getMyPatientList: function(){
		var param = {
			sendParameters:{
			}
		};

		var url = 'doc/get_group_list/';
		var callbackFunction = this.getMyPatientListSuccess;
		this.pageObj.doRequest(url, param, callbackFunction, patientList, this.ajax);

		//this.getMyPatientListSuccess(mockMyPatientList);
	},

	getMyPatientListSuccess: function(responseText){
		var content = [];
		var panel = document.querySelector("#patient-list");

		if(responseText.code === 0){
			if(responseText.data && responseText.data.length > 0) {
				var list = responseText.data;
				content = content.concat(this.getABCHtmlList(responseText.data));
			}else{
				content.push('<p class="no-data-tip no-data-patient"></p>');
			}
			panel.innerHTML = content.join('');


			//TODO just comment for next version
			abcSideBar.showABCSideBar({
				list: this.abcKeyList,
				bindObj: document.querySelector("#listContent")
			});

			//TODO just comment for next version
			//this.getLatestPatient();

			this.pageObj.hideLoading();
		} else {
			this.pageObj.handleGetError(responseText);
		}
	},

	getABCHtmlList: function(data){
		var content = [];
		var self = this;

		data.forEach(function(item){
			var voList = item['voList'];
			//self.abcKeyList.push(item['key']);
			var label = item['key'];
			var key;

			if(label === '#'){
				key = 'other';
			}else{
				key = item['key'];
			}

			content.push('<a name="key_' + key + '" class="navigate-key" id="ABC_key_' + key + '">' + label + '</a>');

			content.push('<span>');
			content.push(self.getPatientListHtml(voList));
			content.push('</span>');
		});

		return content;
	},

	getPatientListHtml: function(list){
		var content;
		var patientIcon;

		for(var i = 0; i < list.length; i++){
			var chatUrl = '../patient-info/patient-info.html',
				gender = list[i].gender == 1 ? '男': '女',
				age = list[i].age;

			patientIcon = this.pageObj.getPatientDefaultIcon(list[i].patientIcon)
			list[i].patientIcon = patientIcon;

			//alert((list[i].remarkName || list[i].name) + ' : ' + patientIcon);

			chatUrl += '?patient_id=' +  encodeURIComponent(list[i].id);
			chatUrl += '&patient_name=' +  encodeURIComponent(list[i].remarkName || list[i].name);
			chatUrl += '&patient_icon=' +  encodeURIComponent(list[i].patientIcon);
			chatUrl += '&doctor_id=' + encodeURIComponent(this.pageObj.doctorId);

			if(!age || age === '' || age === 'null' || age === 'undefined'){
				age = '';
			}else{
				age += '岁';
			}

			list[i].chatUrl = chatUrl;
			list[i].genderStr = gender;
			list[i].ageStr = age;
		}

		content = template(document.getElementById('patient-list-tpl').innerHTML, {
			list: list
		});

		return content;
	},

	handlePatientList: function(){
		var abcBar;
		var abcBarStyle;

		if(this.pageObj.hasLoadedPatientList === false){
			this.pageObj.hasLoadedPatientList = true;
			this.getMyPatientList();
		}else{
			abcBar = document.querySelector('#abcSideBarOuter');
			abcBarStyle = abcBar ? abcBar.style : null;

			if(abcBarStyle && abcBar.style.display && abcBar.style.display === 'none'){
				searchPatient.showOrHidePatientList(true);
			}

		}
	},

	getLatestPatient: function(){
		var param = {
			sendParameters:{
				patientIds: ''
			}
		};

		var url = 'doc/patient_new_list/';
		var callbackFunction = this.setLatestHref;
		this.pageObj.doRequest(url, param, callbackFunction, patientList);
	},

	setLatestHref: function(responseText){
		var a = document.querySelector('#latestPatient');
		var url = 'patient-list-latest.html';

		if(responseText.code === '0' || responseText.code === 0){
			if(responseText.data && responseText.data.length > 0){
				url = url + '?doctorId=' + this.pageObj.doctorId;
				a.setAttribute('href', url);
			}
			this.pageObj.hideLoading();
		}else{
			this.pageObj.handleGetError(responseText);
		}
	}
};
// 测试数据
var mockSearchPatientList = {
	"code": 0,
	"msg": "成功",
	"data": [
		{
			"id": 1,
			"patientIcon": "http://file-www.sioe.cn/201109/14/222211817.jpg",
			"name": "我叫被搜索1",
			"gender": 1,
			"age": 123,
			"createTime": 1434680904000
		}
	]
};

var searchPatient = {
	ajax: null,
	messageBox: null,
	searchFromDatabase: null,

	requestUrl: SYS_VAR.SERVER_ADDRESS,

	pageObj: null,

	init: function(params){
		if(params){
			this.pageObj = params.pageObj;

			this.ajax = params.pageObj['ajaxForPatient'];
			this.messageBox = params.pageObj['messageBox'];
			this.searchFromDatabase = new SearchFromDatabase();

			this.searchFromDatabase.init({
				callback: searchPatient.doSearch.bind(this),
				messageBox: searchPatient.messageBox,
				pageObj: searchPatient,
				pageObjString: 'searchPatient',
				searchObjString: 'searchFromDatabase',
				bindObj: document.querySelector('#searchBinObj'),
				tipText: '搜索',
				onchangeCallback: searchPatient.handleInputChange.bind(searchPatient)
			});

			this.attacheEvent();
		}
	},

	doSearch: function(searchKey){
		searchKey = searchKey || this.searchFromDatabase.key;

		if(!searchKey){
			return;
		}

		var param = {
			sendParameters:{
				'key': searchKey
			}
		};

		var url = 'doc/search_patient/';
		var callbackFunction = this.doSearchSuccess;

		this.clearSearchList();

		this.pageObj.doRequest(url, param, callbackFunction, searchPatient, this.ajax);
		this.showOrHidePatientList(false);

		//this.doSearchSuccess(mockSearchPatientList);
	},

	doSearchSuccess: function(responseText){
		var content = [];
		var panel = document.querySelector("#patient-search-list");

		if(responseText.code === 0){

			if(responseText.data && responseText.data.length > 0) {
				content.push('<span>');
				content = content.concat(patientList.getPatientListHtml(responseText.data));
				content.push('</span>');

				panel.innerHTML = content.join('');
				this.showOrHidePatientList(false);

				this.pageObj.hideLoading();
			} else {
				this.pageObj.handleGetError({'msg': '没有找到您要搜索的患者'});
			}
		} else {
			this.pageObj.handleGetError(responseText);
		}
	},

	showOrHidePatientList: function(isShow){
		var patientList = document.querySelector('#patient-list');
		var patientSearchList = document.querySelector('#patient-search-list');
		var input = document.querySelectorAll('#searchBinObj input')[0];

		//TODO just comment the abc bar for next version
		/*var abcBar = document.querySelector('#abcSideBarOuter');
		abcBar.style.display = isShow ? 'block' : 'none';*/

		patientList.style.display = isShow ? 'block' : 'none';
		patientSearchList.style.display = isShow ? 'none' : 'block';
		input.value = isShow ? '' : input.value;
	},

	handleInputChange: function(event){
		var value = event.currentTarget.querySelectorAll('input')[0].value;

		if(!value || value === ''){
			this.showOrHidePatientList(true);
		}
	},

	clearSearchList: function(){
		document.querySelector('#patient-search-list').innerHTML = '';
	},

	attacheEvent: function(){
		var searchPanel = document.querySelector('#searchBinObj'),
			input = document.querySelectorAll('#searchBinObj input')[0];

		searchPanel.addEventListener('keyup', function(){
			this.handleInputChange(event);
		}.bind(this));

		input.addEventListener('focus', function(){
			document.querySelector('#abcSideBarOuter').style.display = 'none';
		});

		input.addEventListener('blur', function(){
			if(this.value === ''){
				document.querySelector('#abcSideBarOuter').style.display = 'block';
			}
		});
	}
};
var timeFormat = {
	pageObj: null,

	init: function (params) {
		if (params) {
			this.pageObj = params.pageObj;
		}

		this.formatTime = new FormatTime();
	},

	getTimeText: function(times) {
		var currentDate = new Date();
		var messageTime = this.formatTime.getString(times).time;
		var currentTime = this.formatTime.getString(currentDate.getTime()).time;
		var dateStr;
		var oneM = 60*1000;
		var oneMtoOneH = 60*oneM;
		var beforeYesterday = 24*oneMtoOneH;
		var days30 = 30*24*oneMtoOneH;
		var timeGap = currentDate.getTime() - times;
		var yearGap = currentTime.year - messageTime.year;
		var monthDayStr = messageTime.month + '月' + messageTime.day + '日' + messageTime.hour + ':' + messageTime.minute;

		if(timeGap <= oneM){
			dateStr = '刚刚';
		}else if(timeGap > oneM && timeGap <= oneMtoOneH){
			dateStr = Math.floor(timeGap/1000/60) + '分钟前';
		}else if(timeGap > oneMtoOneH && timeGap <= beforeYesterday){
			dateStr = Math.floor(timeGap/1000/60/60) + '小时前';
		}else if(timeGap > beforeYesterday && timeGap <= days30){
			dateStr = Math.floor(timeGap/1000/60/60/24) + '天前';
		}else if(yearGap === 0){
			dateStr = Math.abs(currentTime.month - messageTime.month) + '月前';
		}else if(yearGap > 1) {
			dateStr = yearGap + '年前';
		}else{
			dateStr = messageTime.year + '年' + monthDayStr;
		}

		return dateStr;
	}
};
var patientAdmin = {
    server: SYS_VAR.SERVER_ADDRESS,

    messageBox: null,
    ajax:null,
    popWindow: null,
    slideTab: null,

    requestUrl: SYS_VAR.SERVER_ADDRESS,
    hasLoadedLatestMessage: false,
    hasLoadedPatientList: false,

    init: function(){
        this.messageBox = new MessageBox();
        this.ajaxForMessage = new Ajax();
        this.ajaxForPatient = new Ajax();
        this.popWindow = new PopWindow();
        this.slideTab = new SlideTabs();
        this.skipPage = new SkipPage();
        this.slideTab.init({
            trigger: document.querySelector('#tabControl'),
            responser: document.querySelectorAll('.tab-con'),
            selectedCss: 'selected'
        });

        this.doctorId = getQueryString('doctorId');

        timeFormat.init({
            pageObj: patientAdmin
        });

        abcSideBar.init({
            pageObj: patientAdmin
        });

        latestMessage.init({
            pageObj: patientAdmin
        });

        patientList.init({
            pageObj: patientAdmin
        });

        searchPatient.init({
            pageObj: patientAdmin
        });

        this.hasLoadedLatestMessage = true;
        latestMessage.getLatestMessage();
        this.attachEvent();
    },

    doRequest: function(url, params, callbackFunction, context, ajax){
        var param = params
        param.url = this.requestUrl + url;
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = callbackFunction.bind(context || this);
        param.onError = this.handleGetError.bind(this);
        //param.mssage = this.messageBox;

        this.showLoading();

        ajax.send(param);
    },

    handleGetError:function(responseText){
        var msg = responseText.msg;

        this.hideLoading();

        if(!msg || msg === ''){
            msg = '系统异常，请稍后重试。';
        }

        this.messageBox.show({
            msg: msg,
            type:'alert',
            autoClose: true
        });
    },

    showPatientInfo: function(event){
        var page = '../patient-info/patient-info.html',
            target = event.currentTarget,
            patientId = encodeURIComponent(target.getAttribute('data-patient-id')),
            patientName = encodeURIComponent(target.getAttribute('data-patient-name')),
            patientIcon = encodeURIComponent(target.getAttribute('data-patient-img')),
            doctorId = encodeURIComponent(target.getAttribute('data-doctor-id')),
            param = '?patient_id=' + patientId + '&patient_name=' + patientName + '&doctor_id=' + doctorId + '&patient_icon=' + patientIcon;

        window.location.href = page + param;
    },

    getPatientDefaultIcon: function(patientImg){
        var oldDefaultIcon = 'patient_header.png';
        var newDefaultIcon = SYS_VAR.STATIC_ADDRESS + 'styles/images/patient_default.png';

        if(!patientImg || patientImg === '' || patientImg === 'null' || patientImg === 'undefined'){
            patientImg = newDefaultIcon;
        }else if(patientImg.indexOf(oldDefaultIcon) >= 0){
            patientImg = newDefaultIcon;
        }

        return patientImg;
    },

    showPatientChatMessage: function(event){
        var url = event.currentTarget.getAttribute('data-url');
        window.location.href = url;
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
        var patientQnaList = document.querySelector('#patient-qna-list');
        var myPatientList = document.querySelector('#my-patient');

        // 获取我的患者
        patientQnaList.addEventListener('click', function(){
            latestMessage.handleLatestMessage();
        }.bind(this));

        // 获取我的患者
        myPatientList.addEventListener('click', function(){
            patientList.handlePatientList();
        }.bind(this));

    }
};

patientAdmin.init();
