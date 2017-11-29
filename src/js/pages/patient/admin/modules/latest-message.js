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