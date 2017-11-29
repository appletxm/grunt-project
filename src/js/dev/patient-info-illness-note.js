'use strict';
var mockIllnessData = {
    "code": 0,
    "msg": "成功",
    "data": [
        {
            "stage": "2015-07-08",
            "list": {
                "patientRecords": [
                    {
                        "id": 9,
                        "patientId": 49,
                        "doctorId": 38,
                        "record": "很健康",
                        "createdAt": "2015-07-08 23:49:02",
                        "createdTimeShort": "23:49"
                    }
                ],
                "medicationRecoms": [
                    {
                        "id": 80,
                        "doctorId": 38,
                        "patientId": 49,
                        "createdAt": "2015-07-08 23:52:06",
                        "createdTimeShort": "23:52",
                        "medicationRecomDetails": "强寿 益智康脑丸 广西强寿 3克*12丸*1板 X1"
                    }
                ]
            }
        },
        {
            "stage": "2015-07-08",
            "list": {
                "patientRecords": [
                    {
                        "id": 9,
                        "patientId": 49,
                        "doctorId": 38,
                        "record": "很健康",
                        "createdAt": "2015-07-08 23:49:02",
                        "createdTimeShort": "23:49"
                    }
                ],
                "medicationRecoms": [
                    {
                        "id": 80,
                        "doctorId": 38,
                        "patientId": 49,
                        "createdAt": "2015-07-08 23:52:06",
                        "createdTimeShort": "23:52",
                        "medicationRecomDetails": "强寿 益智康脑丸 广西强寿 3克*12丸*1板 X1"
                    }
                ]
            }
        }
    ]
};

var patientIllnessNote = {
    requestUrl: SYS_VAR.SERVER_ADDRESS,
    messageBox: null,
    ajax      : null,

    urlParams:{},
    patientId: null,

    stages:[],

	init: function(){
		this.messageBox = new MessageBox();
		this.ajax       = new Ajax();

        this.getParamsFromUrl();
        this.getIllnessList();
	},

    getParamsFromUrl: function(){
        var search = window.location.search;
        this.urlParams = search.getValueFromUrl();

        this.patientId  = this.urlParams['patient_id'];
        this.patientId = parseInt(this.patientId, 10);
        this.urlParams = decodeURIComponent(window.localStorage.getItem('patientInfo'));
        this.urlParams = JSON.parse(this.urlParams);

        this.setOpenChatButton();
    },

    getIllnessList: function(){
        var _self = this,
            param = {
                url: SYS_VAR.SERVER_ADDRESS + 'doc/patient_mark/',
                type: 'GET',
                asyn: true,
                onSuccess: _self.handleGetInfoSuccess.bind(_self),
                onError: _self.handleError.bind(_self),
                sendParameters:{
                    patientId : _self.patientId
                }
            };

        this.showLoading();

        this.ajax.send(param);

        //this.handleGetInfoSuccess(mockIllnessData);
    },

    handleGetInfoSuccess: function(responseText){
        var oHtml;
        var box;
        var noData;

        oHtml = [];
        box = document.querySelector('#illnessNote');
        noData = '<p class="no-data-tip"></p>';

        if(responseText.code === 0){
            var data = responseText['data'];
            if(data && data !== '' && data.length > 0){
                if(data){
                    oHtml = oHtml.concat(this.getListHtml(data));
                    box.innerHTML = oHtml.join('');
                }else{
                    this.showNoDateTip(box, noData)
                }
            }else{
                this.showNoDateTip(box, noData)
            }

            this.hideLoading();
        }else{
            this.handleError(responseText);
        }
    },

    getListHtml: function(data){
        var oHtml = [];
        var self = this;

        data.forEach(function(item){
            oHtml = oHtml.concat(self.getCellHtml(item));
        });

        return oHtml;
    },

    getCellHtml: function(item){
        var html = [];
        var stage = item['stage'];
        var date = stage.split('-');
        var dateGap;
        var patientRecords = item['list']['patientRecords'];
        var medicationRecoms = item['list']['medicationRecoms'];

        dateGap = date[0] + '_' + date[1];

        if(this.stages.indexOf('stage_' + dateGap) < 0){
            this.stages.push('stage_' + dateGap);
            html.push('<h6 id="stage_' + dateGap + '">' + date[0] + '年' + date[1] + '月</h6>');
        }

        html.push('<ul>');
        html.push('<li>');

        if(patientRecords && patientRecords.length > 0){
            patientRecords.forEach(function(record){
                html.push('<p class="time">' + date[1] + '-' + date[2] + ' ' + record['createdTimeShort'] + '</p>');
                html.push('<p class="note" record-id="' + record['id'] + '" doctor-id="' + record['doctorId'] + '"  patient-id="' + record['patientId'] + '">' + record['record'] + '</p>');
            });
        }


        if(medicationRecoms && medicationRecoms.length > 0){
            medicationRecoms.forEach(function(record){
                if(!patientRecords || patientRecords.length <= 0){
                    html.push('<p class="time">' + date[1] + '-' + date[2] + ' ' + record['createdTimeShort'] + '</p>');
                }
                html.push('<p recommend-id="' + record['id'] + '" doctor-id="' + record['doctorId'] + '"  patient-id="' + record['patientId'] + '">' + record['medicationRecomDetails'] + '</p>');
            });
        }

        html.push('</li>');
        html.push('</ul>');

        return html;
    },

    showNoDateTip: function(box, oHtml){
        box.innerHTML = oHtml;
    },

    handleError: function(responseText){
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

patientIllnessNote.init();