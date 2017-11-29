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

var mockDisturb = {
    "code": 0,
    "msg": "成功",
    "data": [
    {
        "users": [1,3,4,52393]
    }
]};

var mockSetOk = {
    "code": 0,
    "msg": "成功",
    "data": []
};

var patientInfoNew = {
	server: SYS_VAR.SERVER_ADDRESS,

	messageBox: null,
	ajax:null,
    setTopMsgCheck: null,
    setNoDisturbCheck: null,

    urlParams:{},
    patientId: null,

    requestUrl: SYS_VAR.SERVER_ADDRESS,

	init: function(){
		this.messageBox = new MessageBox();
		this.ajax       = new Ajax();
        this.setTopMsgCheck = new AnimateCheck();
        this.setNoDisturbCheck = new AnimateCheck();

        this.setTopMsgCheck.init({
            bindObj: document.querySelector('#setTopMsg'),
            callBack: this.setMessagesTop.bind(this)
        });
        this.setNoDisturbCheck.init({
            bindObj: document.querySelector('#setNoDisturb'),
            callBack: this.setMessagesDisturb.bind(this)
        });

        this.showLoading();
        this.getParamsFromUrl();
        this.getPatientDetail();
	},

    getParamsFromUrl: function(){
        var search = window.location.search;
        this.urlParams = search.getValueFromUrl();

        window.localStorage.setItem('patientInfo', encodeURIComponent(JSON.stringify(this.urlParams)));

        this.setOpenChatButton();
    },

    getPatientDetail: function(){
        var param = {
            sendParameters:{
                'patientId': parseInt(this.urlParams['patient_id'], 10)
            }
        };

        var url ='doc/patient_detail/';
        var callbackFunction = this.getPatientDetailSuccess;
        this.doRequest(url, param, callbackFunction);

        //this.getPatientDetailSuccess(mockPatientDetail);
    },

    doRequest: function(url, params, callbackFunction){
        var param = params;
        param.url = this.requestUrl + url;
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = callbackFunction.bind(this);
        param.onError = this.handleGetError.bind(this);

        //alert(JSON.stringify(param));

        this.ajax.send(param);
    },

    getPatientDetailSuccess: function(responseText){
        this.setPatientInfo(responseText);
        this.getMessagesTop();
    },

    setPatientInfo: function(responseText){
        var panel = document.querySelector('#patientBaseInfo');
        var html = [];
        var info;
        var headIcon;
        var name;

        if(responseText.code === 0 || responseText.code === '0'){
            info = responseText.data[0];

            if(!info){
                this.handleGetError({
                    msg: '获取患者详情失败，请稍后再试。'
                });
                return false;
            }

            if(info['headUrl'] && info['headUrl'] !== '' && info['headUrl'] !== 'null' && info['headUrl'] !== 'undefined'){
                headIcon = info['headUrl'];
            }else{
                headIcon = '../../styles/images/patient_default.png';
            }

            name = info['remarkName'] || info['name'];

            html.push('<a href="patient-info-base.html?patient_id=' + info['patientId'] + '">');
            html.push('<div class="patient-photo">');
            html.push('<img id="headUrl" src="' + headIcon + '?s=t" width="100" />');
            html.push('</div>');
            html.push('<p>');
            html.push('<span id="name">' + name + '</span>');
            html.push('<samll id="city">' + info['city'] + '</samll>');
            html.push('</p>');
            html.push('</a>');

            document.querySelector('#name-note').innerHTML = name;
            document.querySelector('#noto-name').setAttribute('href', 'patient-info-name-note.html?patient_id=' + info['patientId'] + '&remark_name=' + encodeURIComponent(name));
            document.querySelector('#patient-case-files').setAttribute('href', 'patient-case-files.html?patient_id=' + info['patientId']);
            document.querySelector('#patient-chat-images').setAttribute('href', 'patient-chat-images.html?patient_id=' + info['patientId']);
            document.querySelector('#patient-illness-note').setAttribute('href', 'patient-illness-note.html?patient_id=' + info['patientId']);
        }

        panel.innerHTML = html.join('');
    },

    getMessagesTop: function(){
        var url ='doc/msg_top/',
            callbackFunction,
            param = {
                sendParameters:{}
            };

        callbackFunction =  function(responseText){
            this.handleGetStatusSuccess(responseText, this.setTopMsgCheck, 'top');
        };

        this.doRequest(url, param, callbackFunction);

        //this.handleGetStatusSuccess(mockDisturb, this.setTopMsgCheck, 'top');
    },

    setMessagesTop: function(){
        var url ='doc/msg_top_set/',
            check = this.setTopMsgCheck.param.bindObj,
            input,
            callbackFunction,
            param = {
                sendParameters:{}
            };

        input = check.querySelectorAll('input')[0];

        param.sendParameters.topId = parseInt(this.urlParams['patient_id'], 10);
        param.sendParameters.operate = parseInt(input.value, 10);

        callbackFunction =  function(responseText){
           this.handleSetStatusSuccess(responseText, this.setTopMsgCheck);
        };

        this.showLoading();

        this.doRequest(url, param, callbackFunction);

        //this.handleSetStatusSuccess(mockSetOk, this.setTopMsgCheck);
    },

    getMessagesDisturb: function(){
        var  url ='doc/shield/',
            callbackFunction,
            param = {
                sendParameters:{}
            };

        callbackFunction =  function(responseText){
            this.handleGetStatusSuccess(responseText, this.setNoDisturbCheck, 'disturb');
        };

        this.doRequest(url, param, callbackFunction);

        //this.handleGetStatusSuccess(mockDisturb, this.setNoDisturbCheck, 'disturb');
    },

    setMessagesDisturb: function(){
        var url ='doc/shield_set/',
            check = this.setNoDisturbCheck.param.bindObj,
            input,
            callbackFunction,
            param = {
                sendParameters:{}
            };

        input = check.querySelectorAll('input')[0];

        param.sendParameters.shieldId = parseInt(this.urlParams['patient_id'], 10);
        param.sendParameters.operate = parseInt(input.value, 10);

        callbackFunction =  function(responseText){
            this.handleSetStatusSuccess(responseText, this.setNoDisturbCheck);
        };

        this.showLoading();

        this.doRequest(url, param, callbackFunction);

        //this.handleSetStatusSuccess(mockSetOk, this.setNoDisturbCheck);
    },

    handleGetStatusSuccess: function(responseText, check, type){
        var toggle = false;

        if(responseText.code === 0 || responseText.code === '0'){
            toggle = this.checkPatientHasInTheList(responseText.data ? responseText.data[0] : {});

            this.toggleCheck(check, toggle, toggle?1:0, true);

            if(type === 'disturb'){
                this.hideLoading();
            }
        }else{
            this.handleGetError(responseText);
        }

        if(type !== 'disturb'){
            this.getMessagesDisturb();
        }
    },

    handleSetStatusSuccess: function(responseText, check){
        if(responseText.code === 0 || responseText.code === '0'){
            this.hideLoading();
        }else{
            this.handleGetError(responseText);
            this.reSetCheck(check);
        }
    },

    checkPatientHasInTheList: function(data){
        var isInTheListDisturbed = false;

        if(data && data['users']){
            var users = data['users'];
            if(users.toString().indexOf(this.urlParams['patient_id']) >= 0){
                isInTheListDisturbed = true;
            }
        }

        return isInTheListDisturbed;
    },

    toggleCheck:function(check, toggle, value, notNeedDoCallback){
        check.toggleCheck(toggle, value, notNeedDoCallback);
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

    reSetCheck: function(check){
        var input = check.param.bindObj;
        var value = parseInt(input.querySelectorAll('input')[0], 10);
        var toggle = false;

        if(value === 1){
            value = 0;
        }else{
            value = 1;
            toggle = true;
        }

        this.toggleCheck(check, toggle, value, true);
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

patientInfoNew.init();