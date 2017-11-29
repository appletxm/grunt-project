// 测试数据
var mock_prescription = {
    data: [
        {
            id: 3,
            doctorId: 1,
            name: "分组",
            medicationIds: "16495,10049,7044",
            createdAt: "2015-06-23 23:24:48",
            changedAt: null
        },
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

var mock_p_detail = {
    data: [
        {
            id: 1107,
            name: "【999】三九感冒灵胶囊 12粒",
            commonName: "感冒灵胶囊",
            spec: "6g装",
            usage: "口服，一次2粒，一日3次。",
            image: "http://img.7lk.com_1.jpg",
            salePrice: "10.90",
            marketPrice: "13.08",
            addNum: 0,
            added: false,
            skus: [
                {
                    skuId: 15511,
                    name: "999感冒灵胶囊",
                    salePrice: "10.90",
                    prescribed: false
                }
            ],
            prescribed: false
        },
        {
            id: 1107,
            name: "【999】三九感冒灵胶囊 12粒",
            commonName: "感冒灵胶囊",
            spec: "6g装",
            usage: "口服，一次2粒，一日3次。",
            image: "http://img.7lk.com_1.jpg",
            salePrice: "10.90",
            marketPrice: "13.08",
            addNum: 0,
            added: false,
            skus: [
                {
                    skuId: 15511,
                    name: "999感冒灵胶囊",
                    salePrice: "10.90",
                    prescribed: false
                }
            ],
            prescribed: false
        }
    ],
    msg: "success",
    code: 0
}

var prescriptionRecommend = {
    ajax: null,
    popWindow: null,
    messageBox: null,
    requestUrl: SYS_VAR.SERVER_ADDRESS,

    selectedList: null,
    completedTimes: 0,

    currentPrescription: null,

    urlParams:{},

    init: function(params){
        this.ajax = new Ajax();
        this.messageBox = new MessageBox();
        this.popWindow = new PopWindow();

        recommend.init({
            pageObj: prescriptionRecommend
        });

        this.getUrlParams();
        this.getPrescription();
        this.attachEvent();
    },

    getUrlParams: function(){
        var searchStr = window.location.search.replace('?', '');
        this.urlParams = searchStr.getValueFromUrl();
    },

    getPrescription: function(){
        var param = {
            sendParameters:{}
        };

        param.url = this.requestUrl + 'doc/medication_group_list/';
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = this.handleGetPrescriptionSuccess.bind(this);
        param.onError = this.handleGetError.bind(this);
        //param.mssage = this.messageBox;

        this.ajax.send(param);

        this.showLoading();

        //this.handleGetPrescriptionSuccess(mock_prescription);
    },

    handleGetPrescriptionSuccess: function(responseText){
        if(responseText.code === 0 || responseText.code === '0'){
            this.showPrescriptionList(responseText.data);
            this.hideLoading();
        }else{
            this.handleGetError(responseText);
        }
    },

    showPrescriptionList: function(data){
        var panel = document.querySelector('#myPrescriptionList');
        var html;

        if(data.length === 0){
            //html = '<p class="no-data-tip"></p><p class="tip-show-msg"><span>请前往：<a href="prescriptions-list.html">我的处方单</a>添加处方单</span></p>';
            html = '<p class="no-data-tip"></p>';
        }else{
            html = this.getPrescriptionHtml(data);
            document.querySelector('#chooseTipMsg').style.display = 'block';
        }

        panel.innerHTML = html;
    },

    getPrescriptionHtml: function(list){
        var content = [];

        for(var i=0; i < list.length; i++){
            var medicine;
            var medicationIds;

            medicationIds = list[i]['medicationIds'];

            if(!medicationIds || medicationIds === '' || medicationIds === 'undefined' || medicationIds === 'null'){
                medicine = [];
            }else{
                medicine = medicationIds.split(',');
            }

            content.push('<h2 id="' + list[i]['id'] + '" medicationIds="' + list[i]['medicationIds'] + '" class="after-arrow">');
            content.push('<span class="radio-dot send-prescription"');
            content.push(' prescrition-id="' + list[i]['id'] + '"');
            content.push(' for="myPrescription_' + list[i]['id'] + '"');
            content.push(' number="' + medicine.length + '"');
            content.push('>');
            content.push('</span>');
            content.push('<i>' + list[i].name + '</i><b>(' + medicine.length + ')</b>');
            content.push('</h2>');
            content.push('<div id="myPrescription_' + list[i]['id'] + '" class="product-list"></div>');
        }

        return content.join('');
    },

    openOrClosePrescriptDetail: function(target, panel){
        var className;

        if(!panel.innerHTML || panel.innerHTML === ''){
            this.loadMedicineForPrescription(parseInt(target.getAttribute('id'), 10), panel);
            target.className = target.className + ' selected';
        }else{
            className = target.className;

            if(className.indexOf('selected') >= 0){
                target.className = target.className.replace(' selected', '');
                panel.style.display = 'none';
            }else{
                panel.style.display = 'block';
                target.className = target.className + ' selected';
            }
        }
    },

    loadMedicineForPrescription: function(id, panel, callback){
        var param = {
            sendParameters:{
                id: id
            }
        };

        param.url = this.requestUrl + 'doc/medication_group_detail';
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = function(responseText){
            this.handleGetPrescriptionDetailSuccess(responseText, panel, callback);
        }.bind(this);

        param.onError = this.handleGetError.bind(this);
        //param.mssage = this.messageBox;

        this.ajax.send(param);

        this.showLoading();

        /*if(callback){
            this.handleGetPrescriptionDetailSuccess(mock_p_detail, panel, callback);
        }else{
            this.handleGetPrescriptionDetailSuccess(mock_p_detail, panel);
        }*/

    },

    handleGetPrescriptionDetailSuccess: function(responseText, panel, callback){
        if(responseText.code === 0 || responseText.code === '0'){
            this.showPrescriptionDetail(responseText.data, panel);
            this.hideLoading();
            if(callback){
                callback(this.currentPrescription, panel);
            }
        }else{
            this.handleGetError(responseText);
        }
    },

    showPrescriptionDetail: function(list, panel){
        var html;
        html = this.getListHtml(list);
        panel.innerHTML = html;
        panel.style.display = 'block';
    },

    sendPrescription: function(target){
        var panel = document.querySelector('#' + target.getAttribute('for'));
        var number = parseInt(target.getAttribute('number'), 10);
        var id = parseInt(target.getAttribute('prescrition-id'), 10);

        this.currentPrescription = target;
        this.selectedList = panel.querySelectorAll('span');

        if(number > 0){
           if(this.selectedList.length > 0){
               this.togglePrescriptionCheck(target);
           }else{
               this.loadMedicineForPrescription(id, panel, function(target, panel){
                   this.togglePrescriptionCheck(target, panel);
                   this.openOrClosePrescriptDetail(target.parentNode, target.parentNode.nextElementSibling);
               }.bind(this));
           }
        }

    },

    togglePrescriptionCheck: function(target, panel){
        var isAddRecommend = false;
        var allCheck = document.querySelectorAll('#myPrescriptionList h2 span');

        for(var key in allCheck){
            if((/^\d+$/).test(key)){
                if(allCheck[key] === target){
                    if(target.className.indexOf('selected') >= 0){
                        target.className = target.className.replace(' selected', '');
                        isAddRecommend = false;
                    }else{
                        target.className = target.className + ' selected';
                        isAddRecommend = true;
                    }
                }else{
                    allCheck[key].className = allCheck[key].className.replace(' selected', '');
                }
            }
        }

        if(panel){
            this.selectedList = panel.querySelectorAll('span');
        }

        recommend.recommendList = [];
        if(isAddRecommend === true){
            //this.showRecommendBox();
            this.addToRecommendBox();
        }else{
            this.selectedList = null;
            this.currentPrescription = null;
            recommend.changeRecommendButtonStatus();
            recommend.changeRecommendNumber(0);
        }
    },

    showRecommendBox: function(event){
        if(this.selectedList && this.selectedList.length >= 0){
            recommend.showRecommendBox(this.selectedList[this.completedTimes],  {
                callBack: this.confirmSendPrescription.bind(this)
            });
        }else{
            this.messageBox.show({
                msg:'请先选择要推荐的处方单',
                type:'alert',
                autoClose: true
            });
        }

        if(event){
            event.stopPropagation();
        }
    },

    addToRecommendBox: function(){
        var list = this.selectedList;

        recommend.getRecommendListFromPrescription(list);
    },

    confirmSendPrescription: function(){
        if(this.completedTimes === this.selectedList.length - 1){
            recommend.doRecommend();
            recommend.isFromPrescription = null;
            this.completedTimes = 0;
        }else{
            this.completedTimes++;
            this.showRecommendBox();
        }
    },

    getListHtml: function(list){
        var content = [];

        for(var i=0; i < list.length; i++){
            var addTips = '添加到常用药';
            var addClass = 'add-store';
            var skuId = list[i].skus[0].skuId;
            var checkHtml;
            var name;
            var spanHtml = [];
            var event;

            if(list[i].added == true){
                addTips = '已经添加';
                addClass = 'add-store add-store-success';
            }

            if(!list[i].name || list[i].name === '' || list[i].name === 'null' || list[i].name === 'undefined'){
                name = '药品';
            }else{
                name = list[i].name;
            }

            if(list[i].commonName && list[i].commonName !== '' && list[i].commonName !== 'null' && list[i].commonName !== 'undefined'){
                name += '（' + list[i].commonName + '）';
            }

            checkHtml = recommend.checkHasAddedRecommend(list[i].id);
            event = 'onclick="prescriptionRecommend.handleSearchListClick(event);"';

            spanHtml.push('<span style="display:none;" ' + checkHtml);
            spanHtml.push(' hasAddToStore="0" productId="' + list[i].id + '"');
            spanHtml.push(' usage="' + encodeURIComponent(list[i].usage || '') + '"');
            spanHtml.push(' spec="' + encodeURIComponent(list[i].spec || '') + '"');
            spanHtml.push(' skuId="' + skuId + '"');
            spanHtml.push(' productSize="' + encodeURIComponent(list[i].usage || '') + '"');
            spanHtml.push(' productName="' + encodeURIComponent(list[i].name || '') + '"');
            spanHtml.push(' commonName="' + encodeURIComponent(list[i].commonName || '') + '"'+ '></span>');

            content.push('<dl ' + event + ' url="../medical/medical-detail.html?medicalId=' + list[i].id +'&isAdded=' + (list[i].added || true) + '">');
            content.push('<dt><a><img src="' + list[i].image + '?s=t" width="100" /></a></dt>');

            content.push('<dd>');
            content.push('<i class="tit">' + name + '</i>');
            content.push('<i class="size">' + (list[i].manufacturer || list[i].usage) + '</i>');
            content.push('<b>¥' + list[i].salePrice + '</b>');
            //content.push('<span class="price">市场价 <em>￥ ' + medicalList[i].marketPrice + '</em></span>');

            /*if(listType === 1) {
             content.push('<span class="' + addClass + '" data-id="' + list[i].id + '">' + addTips + '</span> ');
             content.push('<i class="added-tip">已有' + list[i].addNum + '人添加</i>');
             }*/

            content.push(spanHtml.join(''));

            content.push('</dd>');

            content.push('</dl>');

        }

        return content.join('');
    },

    handleSearchListClick:function(event){
        var target = event.currentTarget;

        window.location.href = target.getAttribute('url');

        event.preventDefault();
        event.stopPropagation();
    },

    handlePanelClick: function(event){
        var target = event.target;
        var label = target.tagName.toLowerCase();
        var number;

        if(label === 'h2' || label === 'i' || label === 'b'){
            if(label === 'i' || label === 'b'){
                target = target.parentNode;
            }

            number = (/\d+/).exec(target.querySelectorAll('b')[0].innerHTML);
            number = number ? parseInt(number, 10) : 0;

            if(number > 0){
                this.openOrClosePrescriptDetail(target, target.nextElementSibling);

                event.preventDefault();
                event.stopPropagation();
            }

        }else if(label === 'span' && target.className.indexOf('send-prescription') >= 0){
             this.sendPrescription(target);

            event.preventDefault();
            event.stopPropagation();
         }
    },

    handleGetError:function(responseText){
        var msg = responseText.msg;

        if(!responseText.msg || responseText.msg === ''){
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

    hideLoading: function(){
        this.messageBox.hide();
    },

    attachEvent: function(){
        var prescriptionPanel = document.querySelector('#myPrescriptionList');
        var doRecommendBut = document.querySelector('#recommandMedical');

        prescriptionPanel.onclick = function(event){
            this.handlePanelClick(event);
        }.bind(this);

        // 推荐用药
        doRecommendBut.addEventListener('click', function(event){
            //recommend.doRecommend(event);
            this.showRecommendBox(event);
        }.bind(this));
    }
};

prescriptionRecommend.init();