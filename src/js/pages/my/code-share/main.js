
var myCodeShare = {
	params:{},

	init: function() {
		var url = window.location.search;
		this.params = url.getValueFromUrl();

		for(var key in this.params){
			this.params[key] = decodeURIComponent(this.params[key]);
		}

		this.buildSharePage();
	},

	buildSharePage: function(){
		/*
		 name, department, title, hospital, type: doctor/patient, codeImg
		 */
		var params = this.params;
		var html = [];

		document.querySelectorAll('title')[0].innerHTML = params.name || '医生分享';

		if(params.type === 'doctor'){
			html.push('<div class="code-panel doctor-code-panel" style="left: 50%;">');
			html.push('<h2>邀请医生</h2>');
		}else{
			html.push('<div class="code-panel patient-code-panel">');
			html.push('<h2>添加患者</h2>');
		}

		html.push('<div class="doctor-info">');
		html.push('<img src="' + params.photoUrl + '" />');
		html.push('<h1 for="qrTitle">' + (params.name || '') + '</h1>');
		html.push('<span for="qrDepartment">' + (params.department || '') + '</span>');
		html.push('<span for="qrLevel">' + (params.title || '') + '</span>');
		html.push('<i>' + (params.hospital || '') + '</i>');
		html.push('</div>');

		html.push('<div class="tab-con patient_code" id="patient_qr">');
		html.push('<img src="' + params.codeImg + '"/><p class="tip-show-msg">使用微信扫一扫进行绑定</p>');
		html.push('</div>');

		html.push('</div>');

		document.querySelector('#myCode').innerHTML = html.join('');
 	}
};

myCodeShare.init();