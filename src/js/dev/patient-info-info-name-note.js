'use strict';

var patientInfoNameNote = {
	server: SYS_VAR.SERVER_ADDRESS,

	messageBox: null,
	ajax:null,
	popWindow: null,
	slideTab: null,
    patientId: 0,
    patientNameNote: null,
    requestUrl: SYS_VAR.SERVER_ADDRESS,

	init: function(){
		this.messageBox = new MessageBox();
		this.ajax = new Ajax();

        this.getParamsFromUrl();
        this.settingInfo();
        this.attachEvent();
	},

    getParamsFromUrl: function(){
        var url = window.location.search,
            getVal = url.getValueFromUrl();

        this.patientId = getVal['patient_id'];
        this.patientId = parseInt(this.patientId, 10);
        this.patientNameNote = getVal['remark_name'] ? getVal['remark_name'] : '';

        this.urlParams = decodeURIComponent(window.localStorage.getItem('patientInfo'));
        this.urlParams = JSON.parse(this.urlParams);
    },

    settingInfo: function(){
        var noteInput = document.querySelector('#note');

        noteInput.value = this.patientNameNote;
    },

    setPatientNote: function(){
        var _self = this,
            param = {
                url : SYS_VAR.SERVER_ADDRESS + 'doc/remark_name/',
                type : 'GET',
                asyn : true,
                onSuccess : _self.handleSetSuccess.bind(_self),
                onError : _self.handleError.bind(_self),
                sendParameters:{
                    patientId : _self.patientId,
                    remarkName : document.querySelector('#note').value
                }
            };

        this.showLoading();

        this.ajax.send(param);
    },

    handleSetSuccess: function(){
        var self = this;var pageUlr = 'patient-info.html';
        var param = self.urlParams;

        this.messageBox.show({
            msg: '保存成功！',
            type:'alert',
            autoClose: true
        });

        param['patient_name'] = document.querySelector('#note').value;
        window.localStorage.setItem('patientInfo', encodeURIComponent(JSON.stringify(param)));

        setTimeout(function(){
            pageUlr += '?patient_id=' + encodeURIComponent(self.patientId);
            pageUlr += '&patient_name=' + encodeURIComponent(param['patient_name']);
            pageUlr += '&patient_icon=' + encodeURIComponent(param['patient_icon']);
            pageUlr += '&doctor_id=' + encodeURIComponent(param['doctor_id']);
            window.location.href = pageUlr;
        }, 500);
    },

    handleError:function(responseText){
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

    showLoading: function(){
        this.messageBox.show({
            msg:'<span class="fa fa-spinner fa-pulse fa-2x fa-fw"></span>',
            type:'loading',
            autoClose: false
        });
    },

    attachEvent: function(){
        var saveBtn = document.querySelector('#save');

        saveBtn.addEventListener('click', this.setPatientNote.bind(this));
    }
};

patientInfoNameNote.init();