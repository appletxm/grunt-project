var cityListData = {
	code: 0,
	"msg": "success",
	"data":[
		{
			id: 123123,
			name: "广东"
		},
		{
			id: 123124,
			name: "广西"
		}
	]
};

var myInfoChangeHospital = {
	ajax: null,
	messageBox: null,

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();

		this.attachEvent();
		this.getCityList();
	},

	getCityList: function() {

		var param = {
			sendParameters:{
				'pid' : 1
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
		if(responseText.code === 0) {
			var cityList = responseText.data;
			document.querySelector('#city_list').innerHTML = this.getCityListHtml(cityList);
		} else {
			this.handleError(responseText);
		}
	},

	getCityListHtml: function(cityList){
		var html = '';
		for(var i=0; i<cityList.length; i++){
			html += '<a href="my-info-change-hospital-area.html?pid=' + cityList[i].id + '&name=' + cityList[i].name + '">' + cityList[i].name + '</a>';
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

myInfoChangeHospital.init();