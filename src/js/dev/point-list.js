var mockPointList = {
	"code": 0,
	"msg": "成功",
	"data": [
		{
			"pageNo": 1,
			"pageSize": 10,
			"orderBy": null,
			"order": null,
			"result": [
				{
					"list": [
						{
							"id": 466,
							"type": 2, //积分类型 1认证，2推广医生，3 咨询，4推荐购药，5好评，6主动购药，7推广患者，50提现
							"pointLog": "好评积分",
							"integralNum": 50,
							"createTime": "07-15",
							"status": 1,

							"remark": "可提现"
						}
					],
					"stage": "2015-07"
				},
				{
					"list": [
						{
							"id": 501,
							"pointLog": "注册并通过身份认证",
							"integralNum": 200,
							"createTime": "06-15",
							"status": 3,
							"type": 4, //积分类型 1认证，2推广医生，3 咨询，4推荐购药，5好评，6主动购药，7推广患者，50提现
							"remark": "已经提现"
						},
						{
							"id": 503,
							"pointLog": "回复患者咨询",
							"integralNum": 100,
							"createTime": "06-12",
							"status": 3,
							"type": 6, //积分类型 1认证，2推广医生，3 咨询，4推荐购药，5好评，6主动购药，7推广患者，50提现
							"remark": "已经提现"
						}
					],
					"stage": "2015-06"
				}
			],
			"totalCount": 30,
			"totalPages": 3,
			"orderBySetted": false,
			"hasNext": false,
			"nextPage": 1,
			"hasPre": false,
			"prePage": 1,
			"first": 0
		}
	]
};

var pointList = {
	ajax: null,
	messageBox: null,
	removePointList: [],
	pageInfo:{
		pageNo: 1,
		pageSize: 20
	},

	init: function(){
		this.ajax = new Ajax();
		this.messageBox = new MessageBox();
		
		this.attachEvent();
		this.getPointList ();
	},

	getPointList:function(){
		var param = {
			sendParameters:{
				'page': this.pageInfo.pageNo,
				'num': this.pageInfo.pageSize
			}
		};

		param.url = SYS_VAR.SERVER_ADDRESS + 'doc/point_history/';
		param.type = 'GET';
		param.asyn = true;
		param.onSuccess = this.handleGetPointListSuccess.bind(this);
		param.onError = this.handleGetPointListError.bind(this);
		param.mssage = this.messageBox;

		this.ajax.send(param);

		//this.handleGetPointListSuccess(mockPointList);

	},

	handleGetPointListSuccess:function(responseText){
		if(responseText.code === 0){
			if(this.pageInfo.pageNo === 1){
				this.getPageInfo(responseText);
			}
			this.buildPointListHtml(responseText);
		}else{
			this.handleGetPointListError(responseText);
		}
	},

	getPageInfo: function(responseText){
		var pageInfo = this.pageInfo;

		pageInfo.totalCount = responseText.data[0].totalCount;
		pageInfo.totalPages = responseText.data[0].totalPages;
	},

	buildPointListHtml: function(responseText){
		var info, pointList, content = [], panel, span;

		panel = document.querySelector('#point-list');

		if(responseText.data && responseText.data[0].result && responseText.data[0].result.length > 0) {
			info = responseText.data[0];
			pointList = info.result;

			for(var i=0; i < pointList.length; i++){
				var monData = pointList[i]['list'];
				var monthPanel;

				monthPanel = document.querySelector('#stage_' + pointList[i].stage);

				if(!monthPanel){
					content.push('<p class="tip-show-msg" id="stage_' + pointList[i].stage + '">' + pointList[i].stage + '</p>');
				}

				for (var j=0; j < monData.length; j++){
					var remark = '&nbsp;';
					var needSkip;
					var goToDetail;
					var type = parseInt(monData[j]['type'] || 1, 10);

					if(monData[j]['status'] === 3 || monData[j]['status'] === '3'){
						remark = monData[j].remark;
					}

					//alert(monData[j].pointLog + ':' + type);

					if(type === 4 || type === 6){
						needSkip = ' class="need-skip"';
						goToDetail = ' onclick="pointList.skipToDetail(' + monData[j].id + ', \'' + monData[j].pointLog + '\'' + ',\'' + monData[j].remark + '\'' + ');"';
					}else{
						needSkip = '';
						goToDetail = '';
					}

					content.push('<dl id="point_log_' + monData[j].id + '"' + needSkip + goToDetail + '>');
					content.push('<dt>'+monData[j].pointLog + '<span class="black">' + monData[j].integralNum + '</span></dt>');
					content.push('<dd><i>' + monData[j].createTime + '</i><span>' + remark + '</span></dd>');
					content.push('</dl>');
				}
			}

			if(this.pageInfo.pageNo === 1){
				panel.innerHTML = content.join('');
			}else{
				span = document.createElement('span');
				span.innerHTML = content.join('');
				panel.appendChild(span);
			}
			document.querySelector('#loadMore').style.display = 'block';
		} else if(this.pageInfo.pageNo == 1){
			panel.innerHTML = '<p class="no-data-tip no-point-list-tip"></p>';
		}
	},

	skipToDetail: function(id, pointLog, remark){
		window.location.href = 'point-detail.html?point_id=' + encodeURIComponent(id) + '&point_log=' + encodeURIComponent(pointLog) + '&remark=' + encodeURIComponent(remark);
	},

	handleGetPointListError:function(responseText){
		var msg = responseText.msg;

		if(!msg || msg === ''){
			msg = '网络异常，请稍后再试';
		}

		this.messageBox.show({
			msg: msg,
			type:'alert', 
			autoClose: true
		});
	},

	handleLoadMore:function(){

		if(this.pageInfo.pageNo >= this.pageInfo.totalPages){
			return false;
		}

		this.pageInfo.pageNo += 1;
		this.getPointList();
	},

	attachEvent: function(){
		var loadMore = document.querySelector('#loadMore');

		loadMore.addEventListener('click', function(){
			this.handleLoadMore();
		}.bind(this));
	}
};

pointList.init();