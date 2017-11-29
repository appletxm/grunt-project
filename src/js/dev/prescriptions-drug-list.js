'use strict';

//模拟数据
var mockData = {
    data: [{
        id: 1107,
        name: '【999】三九感冒灵胶囊 12粒',
        commonName: '感冒灵胶囊',
        spec: '6g装',
        usage: '口服，一次2粒，一日3次。',
        image: 'http://img.jxdyf.com/product/0000/011/11632_L1.jpg',
        salePrice: '10.90',
        marketPrice: '13.08',
        addNum: 0,
        added: false,
        skus: [{
            skuId: 15511,
            name: '999感冒灵胶囊',
            salePrice: '10.90',
            prescribed: false
        }],
        prescribed: false
    },{
        id: 1108,
        name: '【999】三九感冒灵胶囊 12粒',
        commonName: '感冒灵胶囊',
        spec: '6g装',
        usage: '口服，一次2粒，一日3次。',
        image: 'http://img.jxdyf.com/product/0000/011/11632_L1.jpg',
        salePrice: '10.90',
        marketPrice: '13.08',
        addNum: 0,
        added: false,
        skus: [{
            skuId: 15511,
            name: '999感冒灵胶囊',
            salePrice: '10.90',
            prescribed: false
        }],
        prescribed: false
    }],
    msg: '成功',
    code: 0
};

var mockPrescriptionData = {
    data: [
        {
            id: 3,
            doctorId: 1,
            name: "分组",
            medicationIds: "16495,10049,7044",
            createdAt: "2015-06-23 23:24:48",
            changedAt: null
        }
    ],
    msg: "success",
    code: 0
};

//模拟返回成功
var mockResult = {
    data:[],
    msg: '成功',
    code: 0
};

var presctiptionsList = {
    ajax: null,
    messageBox: null,
    goodsDelID: [],
    flagID: null,
    groupID: null,
    getIdsFromData: [],
    title: null,

    init:function(){
        this.messageBox = new MessageBox();
        this.ajax = new Ajax();
        this.getNameAjax = new Ajax();

        this.getURLparameter();
        this.styleRevise();
        this.attachEvent();
        this.getPrescriptionName();
        this.getPresctiptionsDrugList();
    },

    getPrescriptionName: function(){
        var flagID = parseInt(this.flagID, 10),
            _self = this,
            param;

        if(flagID !== 1){
            return false;
        }

        param = {
            url: SYS_VAR.SERVER_ADDRESS + 'doc/medication_group_list/',
            type: 'GET',
            asyn: true,
            onSuccess: _self.getPrescriptionSuccess.bind(_self),
            onError: _self.handleError.bind(_self),
            sendParameters:{}
        };

        _self.getNameAjax.send(param);

        //_self.getPrescriptionSuccess(mockPrescriptionData);
    },

    getPrescriptionSuccess: function(responseText){
        var list, _self = this;

        if(responseText.code === 0 || responseText.code === '0'){
            list = responseText.data;

            console.info(list);
        }

        if(list && list.length > 0){
            list.forEach(function(item){
                if(item.id === parseInt(_self.groupID, 10)){
                    _self.title = item.name;
                    document.querySelector('#rename-box input').value = _self.title;
                }
            });
        }
    },

    // 获取url参数
    getURLparameter: function(){
        var url = window.location.search,
            getVal = url.getValueFromUrl();

        this.flagID        = getVal['flag'];
        this.groupID       = getVal['group_id'];
        //this.medicationIds = getVal['medication_ids'];

        if(this.flagID === 0 || this.flagID === '0'){
            this.title   = '常用药';
            document.querySelector('#rename-box input').value = this.title;
        }
    },

    // 样式调整
    styleRevise: function(){
        var renameInp = document.querySelector('#rename-box input');
        // this.flagID 0:表示常用药，1:表示处方单
        if(this.flagID === 0 || this.flagID === '0'){
            renameInp.setAttribute('readOnly', 'readOnly');
        }

        this.showLoading();
    },

    // 获取处方药品列表
    getPresctiptionsDrugList: function(){
        var flagID = parseInt(this.flagID, 10),
            _self = this,
            param = {
                url           : SYS_VAR.SERVER_ADDRESS + (flagID === 1 ? 'doc/medication_group_detail/' : 'doc/medication_box/'),
                type          : 'GET',
                asyn          : true,
                onSuccess     : _self.handleGetInfoSuccess.bind(_self),
                onError       : _self.handleError.bind(_self),
                sendParameters:{}
            };

        if(flagID === 1){
            param['sendParameters']['id'] = _self.groupID;
        }else{
            param['sendParameters']['page'] = 1;
            param['sendParameters']['num']  = 500;
        }

        _self.ajax.send(param);

        //this.handleGetInfoSuccess(mockData); //模拟数据
    },

    // 请求成功时函数
    handleGetInfoSuccess: function(responseText){
        var html = [];
        var self = this;
        var flagID = parseInt(this.flagID, 10);

        html.push(document.querySelector('#prescriptions-drug-list ul').innerHTML ? document.querySelector('#prescriptions-drug-list ul').innerHTML : '');
        if(flagID === 1){
            if(responseText['data'].length > 0){
                responseText['data'].forEach(function(element){
                    html.push('<li>');
                    html.push('<div class="left-img-box">');
	                html.push('<a href="../medical/medical-detail.html?medicalId=' + element['id'] + '&isAdded=' + element['added'] + '">');
                    html.push('<img src="'+ element['image'] +'?s=t" width="80" />');
	                html.push('</a></div>');
                    html.push('<div class="right-info-box">');
                    html.push('<p class="nowrap title">'+ element['name'] +'</p>');
                    html.push('<p class="nowrap">'+ element['commonName'] +'</p>');
                    html.push('<p><b>&yen;'+ element['salePrice'] +'</b></p>');
	                html.push('</div>');
                    html.push('<i class="del-goods" data-id="'+ element['id'] +'"></i>');
                    html.push('</li>');

                    self.getIdsFromData.push(element['id']);
                });
            }else{
                html.push('<li>暂无药品哦！</li>');
            }
        }else{
            if(responseText['data'].length > 0){
                responseText['data'][0]['voList'].forEach(function(element){
                    html.push('<li>');
                    html.push('<div class="left-img-box">');
	                html.push('<a href="../medical/medical-detail.html?medicalId=' + element['id'] + '&isAdded=true">');
                    html.push('<img src="'+ element['image'] +'?s=t" />');
	                html.push('</a></div>');
                    html.push('<div class="right-info-box">');
                    html.push('<p class="nowrap title">'+ element['name'] +'</p>');
                    html.push('<p class="nowrap">'+ element['commonName'] +'</p>');
                    html.push('<p><b>&yen;'+ element['salePrice'] +'</b></p>');
	                html.push('</div>');
                    html.push('<i class="del-goods" data-id="'+ element['id'] +'"></i>');
                    html.push('</li>');

                    self.getIdsFromData.push(element['id']);
                });
            }else{
                html.push('<li>暂无药品哦！</li>');
            }
        }

        this.medicationIds = this.getIdsFromData.toString();

        document.querySelector('#prescriptions-drug-list ul').innerHTML = html.join('');

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

        this.goodsDelID = [];

    },

    // 保存删除
    saveEditList: function(event){
        var listChild = document.querySelectorAll('#prescriptions-drug-list li i');
        var btnGroup  = document.querySelectorAll('.btn-group');

        for(var i = 0; i < listChild.length; i++){
            listChild[i].style.display = 'none';
        }

        if(this.goodsDelID.length > 0){
            this.doSaveDelGoods();
        }

        btnGroup[0].style.display = 'block';
        btnGroup[1].style.display = 'none';

        event.stopPropagation();
    },

    // 底部删除按钮点击事件
    delGoods: function(event){
        var listChild = document.querySelectorAll('#prescriptions-drug-list li i');
        var btnGroup;

        if(listChild.length === 0){
            return false;
        }

        for(var i = 0; i < listChild.length; i++){
            listChild[i].style.display = 'block';
        }

        btnGroup  = document.querySelectorAll('.btn-group');
        btnGroup[0].style.display = 'none';
        btnGroup[1].style.display = 'block';

        event.stopPropagation();
    },

    // 列表内删除按钮
    listDelBtn: function(event){
        var reg;

        // 如果被点击的是i元素
        if(event.target && event.target.nodeName === 'I') {
            var thisID = event.target.getAttribute('data-id'),
                child = event.target.parentNode;
            child.parentNode.removeChild(child);

            reg = new RegExp('' + thisID + '\\,?', 'g');
            this.medicationIds = this.medicationIds.replace(reg, '')
        }

        if(this.flagID === 0 || this.flagID === '0'){
            this.doDelCyDrug(thisID);
        }else{
            if(thisID){
                this.goodsDelID.push(thisID);
            }
        }
    },
    // 添加按钮点击事件

    addGoods: function(){
        var url = '../prescriptions/prescriptions-search.html';

        url += '?group_id='+ this.groupID;
        url += '&flag='+ this.flagID;
        url += '&group_name=' + encodeURIComponent(this.title);
        url += '&medication_ids=' + encodeURIComponent(this.medicationIds);

        window.location.href = url;

        //window.location.href = '../prescriptions/prescriptions-search.html?group_id='+ this.groupID +'&flag='+ this.flagID + '&group_name=' + this.title + '&medication_ids=' + ids;
    },

    // 删除常用药请求
    doDelCyDrug: function(id){
        var _self = this,
            param = {
                url           : SYS_VAR.SERVER_ADDRESS + 'doc/medication_remove_box/',
                type          : 'GET',
                asyn          : true,
                onSuccess     : _self.handleSaveDelSuccess.bind(_self),
                onError       : _self.handleDelError.bind(_self),
                sendParameters:{
                    pid : id
                }
            };

        _self.ajax.send(param);
    },

    // 删除处方药
    doSaveDelGoods: function(){
        var _self = this,
            param;

        param = {
            url           : SYS_VAR.SERVER_ADDRESS + 'doc/medication_group_remove_medic/',
            type          : 'GET',
            asyn          : true,
            onSuccess     : _self.handleSaveDelSuccess.bind(_self),
            onError       : _self.handleDelError.bind(_self),
            sendParameters:{
                id           : _self.groupID,
                medicationIds: _self.goodsDelID.join()
            }
        };

        _self.ajax.send(param);

        //this.handleSaveDelSuccess(mockResult);
    },

    handleSaveDelSuccess: function(responseText){
        if(responseText.code === '0' || responseText.code === 0){
            this.messageBox.show({
                msg      : '保存成功！',
                type     :'alert',
                autoClose: true
            });

            this.goodsDelID = [];
        }else{
            this.handleDelError(responseText);
        }

    },

    handleDelError: function(responseText){
        var msg = responseText.msg;

        if(!msg || msg === ''){
            msg = '网络异常，请稍后重试';
        }

        this.messageBox.show({
            msg      : msg,
            type     :'alert',
            autoClose: true
        });

        setTimeout(function(){
            window.location.reload();
        }, 500);
    },

    // 修改后的处方单名称save
    saveNameFuc: function(event){
        var val   = event.target.value,
            _self = this,
            param;

        if(val === ''){
            this.messageBox.show({
                msg      : '处方单名称不能为空！',
                type     :'alert',
                autoClose: true
            });

            return false;
        }

        param = {
            url           : SYS_VAR.SERVER_ADDRESS + 'doc/medication_group_modify/',
            type          : 'GET',
            asyn          : true,
            onSuccess     : _self.handleSaveNameSuccess.bind(_self),
            onError       : _self.handleError.bind(_self),
            sendParameters: {
                id  : _self.groupID,
                name: val
            }
        };

        _self.ajax.send(param);

        //this.handleSaveNameSuccess(mockResult);
    },

    handleSaveNameSuccess: function(responseText){
        if(responseText.code === '0' || responseText.code === 0){
            this.messageBox.show({
                msg      : '保存成功！',
                type     :'alert',
                autoClose: true
            });

            this.title = document.querySelector('#rename-box input').value;
        }else{
            this.handleDelError(responseText);
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
    },

    // 监听事件
    attachEvent: function(){
        var delBtn      = document.querySelector('#del'),
            addBtn      = document.querySelector('#add'),
            saveBtn     = document.querySelector('#save'),
            listDelBtn  = document.querySelector('#prescriptions-drug-list ul'),
            renameInput = document.querySelector('#rename-box input'),
            flagID      = parseInt(this.flagID, 10);

        delBtn.addEventListener('click', function(event){
            this.delGoods(event);
        }.bind(this));
        addBtn.addEventListener('click', this.addGoods.bind(this));
        saveBtn.addEventListener('click', this.saveEditList.bind(this));
        listDelBtn.addEventListener('click', this.listDelBtn.bind(this));

        // 判断是否为常用药 是就不添加此事件
        if(flagID !== 0){
            renameInput.addEventListener('blur', this.saveNameFuc.bind(this));
        }
    }
};

presctiptionsList.init();