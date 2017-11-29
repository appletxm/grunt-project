var mockLatestPatient = {
    "code": 0,
    "msg": "成功",
    "data": [
        {
            "id": 4,
            "patientIcon": "http://file-www.sioe.cn/201109/14/222211817.jpg",
            "name": "dfd",
            "remarkName": "隔壁小王",
            "gender": null,
            "age": 123,
            "createTime": 1434680904000
        }
    ]
};

var latestPatient = {
    server: SYS_VAR.SERVER_ADDRESS,

    messageBox: null,
    ajax:null,

    doctorId: null,

    requestUrl: SYS_VAR.SERVER_ADDRESS,

    init: function(){
        this.messageBox = new MessageBox();
        this.ajax = new Ajax();

        this.doctorId = getQueryString('doctorId');

        this.getLatestPatient();
    },

    getLatestPatient: function(){
        var param = {
            sendParameters:{
                patientIds: ''
            }
        };

        var url = 'doc/patient_new_list/';
        var callbackFunction = this.handleGetInfoSuccess;
        this.doRequest(url, param, callbackFunction);

        //this.handleGetInfoSuccess(mockLatestPatient);
    },

    doRequest: function(url, params, callbackFunction){
        var param = params
        param.url = this.requestUrl + url;
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = callbackFunction.bind(this);
        param.onError = this.handleGetError.bind(this);
        //param.mssage = this.messageBox;

        this.showLoading();

        this.ajax.send(param);
    },

    handleGetInfoSuccess: function(responseText){
        if(responseText.code === 0 || responseText.code === '0'){
            this.getLatestPatientHtml(responseText.data);
            this.hideLoading();
        }else{
            this.handleGetError(responseText);
        }
    },

    getLatestPatientHtml: function(list){
        var content = [];
        var panel = document.querySelector('#patientList');

        for(var i=0; i < list.length; i++){
            //var chatUrl = '../chat/chat.html';
            var chatUrl = '../patient-info/patient-info.html';
            var gender = list[i].gender == 1 ? '男': '女';
            var age = list[i].age || '无';

            chatUrl += '?patient_id=' +  encodeURIComponent(list[i].id);
            chatUrl += '&patient_name=' +  encodeURIComponent(list[i].remarkName || list[i].name);
            chatUrl += '&patient_icon=' +  encodeURIComponent(list[i].patientIcon);
            chatUrl += '&doctor_id=' + encodeURIComponent(this.doctorId);

            if(!age || age === '' || age === 'null' || age === 'undefined'){
                age = '';
            }else{
                age += '岁';
            }

            content.push('<a class="latest" href="' + chatUrl + '">');
            content.push('<dl>');
            content.push('<dt><img src="' + list[i].patientIcon + '" width="50" height="50" /></dt>');
            content.push('<dd>');
            content.push('<b>' + (list[i].remarkName || list[i].name) + '</b>');
            content.push('<i>' + gender + ' ' + age + '</i>');
            content.push('</dd>');
            content.push('</dl>');
            content.push('</a>');
        }

        panel.innerHTML =  content.join('');
    },

    handleGetError:function(responseText){
        var msg = responseText.msg;

        this.hideLoading();

        if(!msg || msg === ''){
            msg = '系统异常，请稍后重试。';
        }

        this.messageBox.show({
            msg: msg,
            type:'alert',
            autoClose: true
        });
    },

    showPatientInfo: function(patientId, patientName, patientIcon, doctorId){
        var page = '../patient-info/patient-info.html';
        var param = '?patient_id=' + patientId + '&patient_name=' + patientName + '&doctor_id=' + doctorId + '&patient_icon=' + patientIcon;

        window.location.href = page + param;
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

    }
};

latestPatient.init();
