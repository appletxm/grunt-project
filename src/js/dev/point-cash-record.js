var mockCashList = {
	msg:'',
	code: 0,
	data:[{
		"pageNo": 1,
		"pageSize": 2,
		"totalCount": 5,
		"totalPages": 3,

		result:[
			{
				stage: '3月',
				list: [
					{
						bankName: '中国银行',
						bankCardNum: 'CB009',
						extraMoney: 10000,
						applyTime: '2015-10-01 10:00:09',
						reason: '审核不通过：提供的银行卡号不正确，请重新填写。',
						"settleStatus": 0
					},
					{
						bankName: '中国银行',
						bankCardNum: 'CB009',
						extraMoney: 50000,
						applyTime: '2015-10-01 10:00:09',
						reason: '提取成功',
						"settleStatus": 1
					}
				]
			}
		]
	}]
};

var pointCashRecord = {
	ajax: null,
	messageBox: null,
	removeCashRecord: [],
	pageInfo:{
		pageNo: 1
	},

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		
		this.getPointCashRecord();
	},

	getPointCashRecord:function(){
		var param = {
			sendParameters:{}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/apply_cash_record/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetPointCashRecordSuccess.bind(this);
		param.onError = this.handleGetPointCashRecordError.bind(this);
		param.mssage = this.msessageBox;

		this.ajax.send(param);

		//this.handleGetPointCashRecordSuccess(mockCashList);
	},

	handleGetPointCashRecordSuccess:function(responseText){
		var recordPanel = document.querySelector('#point-cash-record');

		if(responseText.code === 0){
			if(responseText.data && responseText.data[0].result && responseText.data[0].result.length > 0) {
				var info = responseText.data[0];
                var cashRecord = info.result;
                var content = '';

                for(var i=0; i < cashRecord.length; i++){
                    var subContent = '<p class="tip-show-msg">' + cashRecord[i].stage + '</p>';
					var monData = cashRecord[i]['list'];
					for (var j=0; j < monData.length; j++){
						var status = 'class="orange"';

						if(monData[j].settleStatus && (monData[j].settleStatus === '1' || monData[j].settleStatus === 1)){
							status = 'class="green"';
						}

						subContent +=
							'<dl>' +
							'     <dt>'+monData[j].bankName+'（'+monData[j].bankCardNum+'）<span>￥'+(monData[j].extraMoney / 100.0).toFixed(2)+'</span></dt>' +
							'     <dd><i>'+monData[j].applyTime+'</i><span ' + status + '>'+monData[j].reason+'</span></dd>' +
							'</dl>';
					}
					content += subContent;
                }

				recordPanel.innerHTML = content;
			}
		}else{
			this.handleGetPointCashRecordError(responseText);
		}
	},

	handleGetPointCashRecordError:function(responseText){
		var msg = responseText.msg;

		if(!msg || msg === ''){
			msg = '网络异常，请稍后再试';
		}
		
		this.messageBox.show({
			msg: msg,
			type:'alert', 
			autoClose: true
		});
		
	}
};

pointCashRecord.init();