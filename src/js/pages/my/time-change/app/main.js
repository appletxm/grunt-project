
var myTimeApp={
	serverAddress: SYS_VAR.SERVER_ADDRESS,
	ajax: null,
	messageBox: null,

	deleteTimeList: [],

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();

		this.getDoctorTime();
		this.attachEvent();
	},

	getDoctorTime: function(){
		var param = {
			sendParameters:{}
		};

		param.url = this.serverAddress + 'doc/time_list';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetTimeSuccess.bind(this);
		param.onError = this.handleError.bind(this);
		//param.mssage = this.msessageBox;

		this.showLoading();

		this.ajax.send(param);

		/*this.handleGetTimeSuccess({
			"code": 0,
			"msg": "成功",
			"data": [
				{
					"cloudWorkTime": [
						{
							"workId": 17864,
							"weekIndex": 7,
							"work": "09:00-22:00"
						}
					],
					"workTime": [
						{
							"workId": 400,
							"weekIndex": 1,
							"am": 1,
							"pm": 0,
							"night": 1
						}
					]
				}
			]
		});*/
	},

	handleGetTimeSuccess:function(responseText){
		if(responseText.code === 0 || responseText.code === '0'){

			this.showHospitalTime(responseText.data[0]);
			this.hideLoading();
		}else{
			this.handleError(responseText);
		}
	},

	handleError: function(responseText){
		var msg = responseText.msg;

		if(msg || msg === ''){
			msg = '网络异常，请稍后再试。';
		}
		this.messageBox.show({
			msg: msg,
			type:'alert',
			autoClose: true
		});
	},

	handleClick: function(event){
		var target = event.target;
		var label = target.tagName.toLowerCase();

		if(label === 'span'){
			this.toggleSelectedTime(target);
		}

		event.preventDefault();
	},

	toggleSelectedTime: function(target){
		var list = this.deleteTimeList;
		var forWeek = target.getAttribute('forWeek');
		var time = {};
		var seekIndex = -1;

		list.forEach(function(cell, index){
			if(cell[forWeek]){
				seekIndex = index;
				return false;
			}
		});

		if(seekIndex === -1){
			time[forWeek] = target.innerHTML;
			target.className = target.className + ' ' + 'checked';
			list.push(time);
		}else{
			list.splice(seekIndex, 1);
			target.className = target.className.replace(' checked', '');
		}
	},

	showHospitalTime: function(data){
		var timeLines = document.querySelectorAll('#baiyuTime dd');
		var weeks = data.cloudWorkTime;

		weeks.forEach(function(week){
			var weekIndex = parseInt(week.weekIndex, 10) - 1;
			var dayObj = timeLines[weekIndex];
			var times;
			var html = [];

			if(week.work && week.work !== '' && week.work !== 'null' && week.work !== 'undefined'){

				times = (week.work || '').split(';');

				if(times.length > 0){
					for(var j=0; j<times.length; j++){
						html.push('<span class="check-input" forWeek="' + weekIndex + '_' + j +'">' + times[j] + '</span>');
					}
					dayObj.innerHTML = html.join('');
				}
			}else{
				week.work = '';
				dayObj.innerHTML = '';
			}

		});

		if(weeks.length > 0){
			document.querySelector('#deleteSelectedTime').style.display = 'block';
		}
	},

	deleteSelectedTime: function(){
		var list = this.deleteTimeList;
		var param = {
			sendParameters:{}
		};
		var saveTimes;

		if(list.length <= 0){
			this.messageBox.show({
				msg: '请选择要删除的时间点',
				type:'alert',
				autoClose: true
			});

			return false;
		}

		saveTimes = this.getSaveWorks();
		//console.info(saveTimes);
		param.sendParameters.works = encodeURIComponent(JSON.stringify(saveTimes));

		param.url = this.serverAddress + 'doc/edit_cloud_time';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleSaveTimeSuccess.bind(this);
		param.onError = this.handleSaveTimeError.bind(this);
		//param.mssage = this.msessageBox;

		this.showLoading();

		this.ajax.send(param);

		/*this.handleSaveTimeSuccess({
			data: [],
			msg: "success",
			code: 0
		});*/
	},

	getSaveWorks: function(){
		var saveWorks = [];
		var timeLines;

		timeLines = document.querySelectorAll('#baiyuTime dd');
		for(var i=0; i<timeLines.length; i++){
			var weekIndex = parseInt(timeLines[i].getAttribute('forWeek'), 10) + 1;
			var works = [];
			var spans = timeLines[i].querySelectorAll('span[class$="input"]');
			if(spans.length > 0){
				for(var j=0; j<spans.length; j++){
					works.push(spans[j].innerHTML);
				}

				saveWorks.push({
					'weekIndex': weekIndex,
					'work': works.join(';')
				});
			}
		}

		return saveWorks;
	},

	handleSaveTimeSuccess: function(responseText){

		if(responseText.code === 0 || responseText.code === '0'){

			this.deleteTimeList = [];

			/*setTimeout(function(){
			 this.getDoctorTime();
			 }.bind(this), 30);*/

			window.location.reload();
		}else{
			this.handleSaveTimeError(responseText);
		}
	},

	handleSaveTimeError: function(responseText){

		this.messageBox.show({
			msg:responseText.msg || '删除出诊时间失败，请重试',
			type:'alert', 
			autoClose: true
		});
	},

	addNewWorkTime: function(){
		window.location.href = 'my-time-change-app-new.html';
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
		var timePanel = document.querySelector('#baiyuTime');
		var butAdd = document.querySelector('#addNewTime');
		var butDelete = document.querySelector('#deleteSelectedTime');

		timePanel.addEventListener('click', function(event){
			this.handleClick(event);
		}.bind(this));

		butAdd.addEventListener('click', function(){
			this.addNewWorkTime();
		}.bind(this));

		butDelete.addEventListener('click', function(){
			this.deleteSelectedTime();
		}.bind(this));
	}
};

myTimeApp.init();