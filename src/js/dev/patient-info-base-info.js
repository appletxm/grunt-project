'use strict';
var mockPatientDetail = {
    data: [
        {
            "patientId": 10,
            "phone": "11111112222",
            "name": "刘德华",
            "remarkName": "隔壁小王",
            "age": 30,
            "gender": "男",
            "maritalStatus": "未婚",
            "weight": 68,
            "height": 186,
            "city": "广东湛江坡头区",
            "smokeHistory": "日吸烟量：平均2支;开始吸烟年龄：18;吸烟状态：吸烟",
            "pastDisease": "过往1,过往6,测试其他",
            "hereditaryDisease": "遗传3,遗传4,测试其他",
            "familyHistory": "父亲：家族2,家族21,家族22,其他病史1;母亲：家族5,家族22,其他病史2;兄弟姐妹：家族11,家族22,其他病史3;子女：家族22,其他病史4;",
            "drinkHstory": "饮酒频率：偶尔;日饮酒量：123两;已戒酒，戒酒年龄2岁;饮酒种类：啤酒,红酒,洋酒,其他酒",
            "medicationAllergy": "过敏7,过敏8,其他过敏",
            "headUrl": ""
        }
    ],
    msg: "success",
    code: 0
};

var patientBaseInfo = {
	server: SYS_VAR.SERVER_ADDRESS,

	messageBox: null,
	ajax:null,
    requestUrl: SYS_VAR.SERVER_ADDRESS,

    urlParams:{},
    patientId: null,

	init: function(){
		this.messageBox = new MessageBox();
		this.ajax       = new Ajax();

        this.showLoading();
        this.getParamsFromUrl();
        this.getPatientDetail();
	},

    getParamsFromUrl: function(){
        var search = window.location.search;
        this.urlParams = search.getValueFromUrl();
        this.patientId = parseInt(this.urlParams['patient_id'], 10);

        this.urlParams = decodeURIComponent(window.localStorage.getItem('patientInfo'));
        this.urlParams = JSON.parse(this.urlParams);

        this.setOpenChatButton();
    },

    getPatientDetail: function(){
        var param = {
            sendParameters:{
                'patientId': parseInt(this.urlParams['patient_id'], 10)
            }
        };

        var url ='doc/patient_detail/';
        var callbackFunction = this.handleGetInfoSuccess;
        this.doRequest(url, param, callbackFunction);

        //this.handleGetInfoSuccess(mockPatientDetail);
    },

    doRequest: function(url, params, callbackFunction){
        var param = params;
        param.url = this.requestUrl + url;
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = callbackFunction.bind(this);
        param.onError = this.handleGetError.bind(this);

        this.ajax.send(param);
    },

    handleGetInfoSuccess: function(responseText){
        var oHtml = [];
        var box = document.querySelector('#base-info');

        if(responseText.code === 0){
            var data = responseText['data'][0];
            if(data && data !== ''){
                var splitGap = ';'

                var smoke = data['smokeHistory'].split(splitGap);
                var drink = data['drinkHstory'].split(splitGap);
                var family = data['familyHistory'].split(splitGap);
                var allergy = data['medicationAllergy'].split(splitGap);

                oHtml.push('<dl><dt>婚姻情况</dt><dd><span>'+ (data['maritalStatus'] || '无') +'</span></dd></dl>');
                oHtml.push('<dl><dt>身高</dt><dd><span>'+ (data['height'] || '无') +'</span></dd></dl>');
                oHtml.push('<dl><dt>体重</dt><dd><span>'+ (data['weight'] || '无') +'</span></dd></dl>');
                oHtml.push('<dl><dt>药物过敏史</dt><dd><span>'+ allergy.join(';<br/>') +'</span></dd></dl>');
                oHtml.push('<dl><dt>既往病史</dt><dd><span>'+ data['pastDisease'] +'</span></dd></dl>');
                oHtml.push('<dl><dt>家庭病史</dt><dd><span>'+ family.join(';<br/>') +'</span></dd></dl>');
                oHtml.push('<dl><dt>遗传病史</dt><dd><span>'+ (data['hereditaryDisease'] || '无') +'</span></dd></dl>');
                oHtml.push('<dl><dt>吸烟状况</dt><dd><span>'+ smoke.join(';<br/>') +'</span></dd></dl>');
                oHtml.push('<dl><dt>饮酒状况</dt><dd><span>'+ drink.join(';<br/>') +'</span></dd></dl>');
            }

            this.hideLoading();
        }else{
            this.handleGetError(responseText);
        }

        box.innerHTML = oHtml.join('');
    },

    handleGetError:function(responseText){
        var msg = responseText.msg;

        if(msg === '' || !msg){
            msg = '网络异常，请稍后再试';
        }

        this.messageBox.show({
            msg: msg,
            type:'alert',
            autoClose: true
        });
    },

    setOpenChatButton: function(){
        var param = this.urlParams;
        var chatUrl = '../chat/chat.html';
        var foot = document.querySelectorAll('footer')[0];

        chatUrl += '?patient_id=' + encodeURIComponent(param['patient_id']);
        chatUrl += '&patient_name=' + encodeURIComponent(param['patient_name']);
        chatUrl += '&patient_icon=' + encodeURIComponent(param['patient_icon']);
        chatUrl += '&doctor_id=' + encodeURIComponent(param['doctor_id']);

        foot.innerHTML = '<a href="' + chatUrl + '">发送消息</a>';
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
    }

};

patientBaseInfo.init();