var chatRecommend = {
	messageBox: null,
	ajax: null,
	popWindow: null,

	pageObj: null,
	callbackFunctions:{},

	init: function (params) {
		if (params) {
			this.ajax = params.pageObj.ajax;
			this.messageBox = params.pageObj.messageBox;
			this.popWindow = params.pageObj.popWindow;
			this.pageObj = params.pageObj;
		}
	},

	getRecommondMessage: function(){
		var recommondData;
		var recommondList = [];
		var param = {
			content: {}
		};
		var sendToServerMessage = {};

		recommondData = window.localStorage.getItem('recommondData');

		if(recommondData && recommondData !== ''){

			recommondData = decodeURIComponent(recommondData);

			recommondList = new Function('return ' + recommondData + ';')();

			param.from = this.pageObj.doctorInfo;
			param.to = this.pageObj.patientInfo;
			param.sendTime = new Date().getTime();

			param.content.recommandId = '000000001';
			param.content.items = recommondList;
			param.relation = 1;

			param.type = 16;

			window.localStorage.removeItem('recommondData');

			sendToServerMessage.message = param;
			this.pageObj.currentSendMessage = sendToServerMessage;

			this.pageObj.doSaveMessage(sendToServerMessage);
		}
	},

	getRecommondHtml: function(data){
		var recommondList = [];
		var html = [];
		var detailUrl = SYS_VAR.STATIC_ADDRESS + 'templates/medical/medical-detail.html';
		var medicalName;
		var userDefinedBillItems = 0;

		if(data){
			recommondList = data.content.items;

			html.push('<span class="recommond-list">');
			html.push('<i>建议服用以下药物：</i>');

			for(var i=0; i<recommondList.length; i++){

				userDefinedBillItems = 0;

				html.push('<div>');

				if(!recommondList[i].productName || recommondList[i].productName === ''){
					medicalName = '药品';
				}else{
					medicalName = recommondList[i].productName;
				}

				if(recommondList[i].commonName && recommondList[i].commonName !== ''){
					medicalName += '（' + recommondList[i].commonName + '）';
				}

				html.push('<a href="' + detailUrl + '?medicalId=' + recommondList[i].productId + '">');
				html.push(medicalName);
				html.push('</a>');

				if(recommondList[i].quantity && recommondList[i].quantity !== '' && recommondList[i].quantity !== '0' && recommondList[i].quantity !== 0){
					html.push(' x ' + (recommondList[i].quantity || 0));
				}

				if(!recommondList[i].usage){
					if(recommondList[i].timePayDay && recommondList[i].timePayDay !== '' && recommondList[i].timePayDay !== '0' && recommondList[i].timePayDay !== 0){
						html.push('<p>1日' + recommondList[i].timePayDay + '次</p>');
						userDefinedBillItems ++;
					}

					if(recommondList[i].timePayUnit && recommondList[i].timePayUnit !== '' && recommondList[i].timePayUnit !== '0' && recommondList[i].timePayUnit !== 0 && userDefinedBillItems === 1){
						html.push('<p>1次' + recommondList[i].timePayUnit + '' + (recommondList[i].unit || '') + '</p>');
						userDefinedBillItems ++;
					}
				}else{
					var usageSplit = recommondList[i].usage.split(',');
					usageSplit.forEach(function(str){
						html.push('<p>' + str + '</p>');
					});
				}

				if(recommondList[i].bakup && recommondList[i].bakup !== ''){
					html.push('<p>' + recommondList[i].bakup + '</p>');
				}

				html.push('<p style="margin-top:8px; height:0; font-size:0; line-height:0;"></p>');

				html.push('</div>');

			}

			html.push('<p class="text-right">以上药品由七乐康提供</p>');
			html.push('</span>');
		}

		return html.join('');
	},



	doRecommondMedical: function(){
		this.skipPageToDoRecommend('templates/medical/medical-search.html');
	},

	skipPageToDoRecommend: function(url){
		var page = SYS_VAR.STATIC_ADDRESS + url;
		var params;
		var urlParams = this.pageObj.urlParams;

		if(this.pageObj.authStatus !== 1){
			chatCheckUserAuth.showNoVerifyTipMessage(1);
		}else {
			params = '?type=recommond';
			params += '&patient_id=' + urlParams.patient_id;
			params +='&doctor_id=' + urlParams.doctor_id;
			params += '&patient_name=' + urlParams.patient_name;

			window.location.href = page + params;
		}
	}

};