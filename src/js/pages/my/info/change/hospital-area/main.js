var cityListData = {
	code: 0,
	"msg": "success",
	"data":[
		{
			id: 123123,
			name: "广州"
		},
		{
			id: 123124,
			name: "佛山"
		}
	]
};

var myInfoChangeHospitalArea = {
	ajax: null,
	messageBox: null,

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();

		this.attachEvent();
		this.getCityList();
	},

	getCityList: function() {
		var keys = window.location.search.match(/(.[^?|&]+)=/g);
		var values= window.location.search.match(/=(.[^&]*)/g);
		var self = this;

		if(!keys || !values){
			return false;
		}
		var urlParams = {};
		keys.forEach(function(key, index){
			urlParams[key.replace(/=|\?|&/g, '')] = values[index].replace('=', '');
		});

		document.querySelector('#city_list').innerHTML = '<a class="selected">' + decodeURIComponent(urlParams['name']) + '</a>';

		var param = {
			sendParameters:{
				'pid' : urlParams['pid']
			}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/city_list/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetCitySuccess.bind(this);
		param.onError = this.handleError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);

		//this.handleGetCitySuccess(cityListData);
	},

	handleGetCitySuccess: function(responseText) {
		var panel = document.querySelector('#city_list');
		var html = panel.innerHTML;

		if(responseText.code === 0) {
			var cityList = responseText.data;
			html += this.getCityListHtml(cityList);
			panel.innerHTML = html;
		} else {
			this.handleError(responseText);
		}
	},

	getCityListHtml: function(cityList){
		var html = '';
		for(var i=0; i<cityList.length; i++){
			html += '<a href="my-info-change-hospital-list.html?cityId=' + cityList[i].id + '&name=' + cityList[i].name + '">' + cityList[i].name + '</a>';
		}
		return html;
	},


	handleError:function(responseText){
		this.messageBox.show({
			msg:responseText.msg,
			type:'alert',
			autoClose: true
		});
	},

	attachEvent: function(){

	}
};

myInfoChangeHospitalArea.init();