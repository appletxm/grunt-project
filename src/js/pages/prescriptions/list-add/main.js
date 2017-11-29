'use strict';
var prescriptionsListAdd = {
    ajax: null,
    messageBox: null,

    init: function(){
        this.messageBox = new MessageBox();
        this.ajax = new Ajax();
        this.attachEvent();
    },

    attachEvent: function(){
        var saveBtn = document.querySelector('#save');

        saveBtn.addEventListener('click', this.doSaveNewPrescriptions.bind(this));
    },

    doSaveNewPrescriptions: function(){
        var param = {
            sendParameters:{}
        };

        var categoryName = document.querySelector('#name').value;

        param['sendParameters']['name'] = categoryName;

        param.url = SYS_VAR.SERVER_ADDRESS + 'doc/medication_group_add/';
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = this.handleSaveSuccess.bind(this);
        param.onError = this.handleError.bind(this);

        if(categoryName === '' || categoryName === undefined){
            this.messageBox.show({
                msg: '请填写处方单名称后保存！',
                type:'alert',
                autoClose: true
            });
        }else{
            this.ajax.send(param);
        }

        // this.handleSaveSuccess({
        //     data:[],
        //     msg: '成功',
        //     code: 0,
        // });
    },

    handleSaveSuccess: function(){
        this.messageBox.show({
            msg: '保存成功！',
            type:'alert',
            autoClose: true
        });
        setTimeout(function() {
            window.location.href = 'prescriptions-list.html';
        }, 500);
    },

    handleError: function(responseText){
        var msg = responseText.msg;

        if(!msg || msg === ''){
            msg = '网络异常，请稍后重试';
        }

        this.messageBox.show({
            msg: msg,
            type:'alert',
            autoClose: true
        });
    },

};

prescriptionsListAdd.init();