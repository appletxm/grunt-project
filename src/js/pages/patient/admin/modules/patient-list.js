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