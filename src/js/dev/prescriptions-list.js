'use strict';

var mockListData = {
    data:[{
        'id'           : 3,
        'doctorId'     : 1,
        'name'         : '分组',
        'medicationIds': '16495,10049,7044',
        'createdAt'    : '2015-06-23 23:24:48',
        'changedAt'    : null
    },{
        'id'           : 4,
        'doctorId'     : 1,
        'name'         : '分组1',
        'medicationIds': '16495,10049,7044,7044',
        'createdAt'    : '2015-06-23 23:24:48',
        'changedAt'    : null
    }],
    msg: '成功',
    code: 0
};

var mockSaveRes = {
    data:[],
    msg: '成功',
    code: 0
};

var presctiptionsList = {
    ajax: null,
    messageBox: null,
    listDelID: [],

    init:function(){
        this.messageBox = new MessageBox();
        this.ajax = new Ajax();

        this.attachEvent();

        this.getPresctiptionsList();
    },
    // 获取处方药列表
    getPresctiptionsList: function(){
        var param = {
            sendParameters:{}
        };

        param.url = SYS_VAR.SERVER_ADDRESS + 'doc/medication_group_list/';
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = this.handleGetInfoSuccess.bind(this);
        param.onError = this.handleError.bind(this);

        this.showLoading();

        this.ajax.send(param);

        //this.handleGetInfoSuccess(mockListData);
    },
    // 请求成功时函数
    handleGetInfoSuccess: function(responseText){
        var html = document.querySelector('#prescriptions-list ul').innerHTML;

        responseText['data'].forEach(function(element){
            var leng  = element['medicationIds'] === '' ? [] : element['medicationIds'].split(','),
                title = encodeURIComponent(element['name']),
                ids   = encodeURIComponent(element['medicationIds']);

            html += '<li><a href="prescriptions-drug-list.html?flag=1&group_id=' + element['id'] + '&group_name='+ title +'&medication_ids='+ ids +'">' + element['name'] + '(' + leng.length + ')</a><i data-id="' + element['id'] + '" class="delBtn"></i></li>';
        });

        document.querySelector('#prescriptions-list ul').innerHTML = html;

        this.hideLoading();
    },
    // 请求出错时函数
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

        this.listDelID = [];
    },
    // 保存编辑后的处方药列表
    doSavePresctiptionsList: function(){
        var param = {
            sendParameters:{}
        };

        param['sendParameters']['ids'] = this.listDelID.join();

        param.url = SYS_VAR.SERVER_ADDRESS + 'doc/medication_group_remove/';
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = this.handleSaveListSuccess.bind(this);
        param.onError = this.handleError.bind(this);

        this.ajax.send(param);

        //this.handleSaveListSuccess(mockSaveRes);
    },
    // 保存列表成功时函数
    handleSaveListSuccess: function(responseText){
        if(responseText['code'] === 0 || responseText['code'] === '0'){
            this.messageBox.show({
                msg: '保存成功！',
                type:'alert',
                autoClose: true
            });
            this.listDelID = [];
        }
    },
    // 监听事件
    attachEvent: function(){
        var delBtn     = document.querySelector('#del'),
            saveBtn    = document.querySelector('#save'),
            listDelBtn = document.querySelector('#prescriptions-list ul');

        delBtn.addEventListener('click', this.delPrescriptions.bind(this));
        saveBtn.addEventListener('click', this.saveEditList.bind(this));

        listDelBtn.addEventListener('click', this.listDelBtn.bind(this));
    },
    // 保存删除后的列表事件
    saveEditList: function(event){
        var listChild = document.querySelectorAll('#prescriptions-list li');
        var btnGroup  = document.querySelectorAll('.btn-group');

        for(var i = 0; i < listChild.length; i++){
            listChild[i].childNodes[0].className = '';
            if(listChild[i].childNodes[1]){
                listChild[i].childNodes[1].style.display = 'none';
            }
        }

        if(this.listDelID.length > 0){
            this.doSavePresctiptionsList();
        }

        btnGroup[0].style.display = 'block';
        btnGroup[1].style.display = 'none';

        event.stopPropagation();
        event.preventDefault();
    },
    // 底部删除按钮点击事件
    delPrescriptions: function(event){
        var listChild = document.querySelectorAll('#prescriptions-list li');
        var btnGroup  = document.querySelectorAll('.btn-group');

        for(var i = 0; i < listChild.length; i++){
            listChild[i].childNodes[0].className = 'no-arrow';
            if(listChild[i].childNodes[1]){
                listChild[i].childNodes[1].style.display = 'block';
            }
        }

        btnGroup[0].style.display = 'none';
        btnGroup[1].style.display = 'block';

        event.stopPropagation();
    },
    // 列表内删除按钮
    listDelBtn: function(event){
        // 如果被点击的是i元素
        if(event.target && event.target.nodeName === 'I') {
            var thisID = event.target.getAttribute('data-id');
            var child = event.target.parentNode;
            child.parentNode.removeChild(child);

            if(thisID){
                this.listDelID.push(thisID);
            }
        }
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

presctiptionsList.init();