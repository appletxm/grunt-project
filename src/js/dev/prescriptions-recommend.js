var recommend = {
    ajax: null,
    popWindow: null,
    messageBox: null,
    requestUrl: SYS_VAR.SERVER_ADDRESS,

    recommendList:[],
    isFromPrescription: null,

    pageObj: null,

    init: function(params){
        if(params){
            this.pageObj = params.pageObj;

            this.ajax = params.pageObj['ajax'];
            this.messageBox = params.pageObj['messageBox'];
            this.popWindow = params.pageObj['popWindow'];
        }

        this.attachEvent();
    },

    showRecommendBox: function(target, isFromPrescription){
        var html = [];
        var productId,skuId,productName,commonName,productSize,hasAddToStore,usage,spec;
        var param = {
            buttons: [],
            space: {}
        };

        this.isFromPrescription = isFromPrescription;

        productId = target.getAttribute('productId') || '';

        skuId = target.getAttribute('skuId') || '';
        productName = decodeURIComponent(target.getAttribute('productName') || '');
        commonName = decodeURIComponent(target.getAttribute('commonName') || '');
        //productSize = target.parentNode.querySelectorAll('.size')[0].innerHTML;
        productSize = decodeURIComponent(target.getAttribute('productSize') || '');
        hasAddToStore = parseInt(target.getAttribute('hasAddToStore') || 0, 10);
        spec = decodeURIComponent(target.getAttribute('spec') || '');
        usage = decodeURIComponent(target.getAttribute('usage') || '');

        param.needMask = true;
        param.space = {
            top: 10,
            left: 10
        };

        html.push('<div class="recommand-tip-box" hasAddToStore="' + hasAddToStore +
        '" productId="'+ productId +
        '" productName="' + (productName || '') +
        '" commonName="' +  (commonName || '') +
        '" productSize="' + productSize +
        '" usage="' + (usage || '') +
        '" skuId="' + skuId + '">');

        if(!commonName || commonName === ''){
            commonName = '';
        }else{
            commonName = '（' + commonName + '）';
        }

        html.push('<h1>' + productName + commonName + '<a class="close-pop" onclick="recommend.cancelSelectCallback();"></a></h1>');
        html.push('<div class="pro-usage">常规用法：' + usage + '</div>');

        html.push('<dl>');
        html.push('<dt>规格</dt><dd><i>' + spec + '</i></dd>');
        html.push('</dl>');

        html.push('<dl>');
        html.push('<dt><span class="red">*</span> 数量</dt>');
        html.push('<dd>');
        html.push('<span class="number-pick">');
        html.push('<input type="button" value="-" onclick="recommend.changeNumber(0, \'medicalNumber\');" />');
        html.push('<input id="medicalNumber" oninput="recommend.validateNumber(\'medicalNumber\' ,99);" type="tel" value="1" />');
        html.push('<input type="button" value="+" onclick="recommend.changeNumber(1, \'medicalNumber\');" />');
        html.push('</span>');
        html.push('</dd>')
        html.push('</dl>');

        //html.push('<p class="gapTop"></p>');

        html.push('<dl class="gapTop">');
        html.push('<dt>一日</dt>');
        html.push('<dd>');
        html.push('<span class="number-pick">');
        html.push('<input type="button" value="-"  onclick="recommend.changeNumber(0, \'timePayDay\');" />');
        html.push('<input id="timePayDay" oninput="recommend.validateNumber(\'timePayDay\', 99);" type="tel" value="" />');
        html.push('<input type="button" value="+" onclick="recommend.changeNumber(1, \'timePayDay\');" />');
        html.push('</span>次');
        html.push('</dd>');
        html.push('</dl>');

        html.push('<dl>');
        html.push('<dt>每次</dt>');
        html.push('<dd>');
        html.push('<span class="number-pick">');
        html.push('<input type="button" value="-" onclick="recommend.changeNumber(0, \'timePayUnit\');" />');
        html.push('<input id="timePayUnit" oninput="recommend.validateNumber(\'timePayUnit\', 99);" type="tel" value="" />');
        html.push('<input type="button" value="+" onclick="recommend.changeNumber(1, \'timePayUnit\');" />');
        html.push('</span>');

        html.push('<span id="unitList" class="unit-list">');
        html.push('<input type="hidden" id="unitText" value="片">');
        html.push('<a class="selected" forUnit="片" onclick="recommend.chooseUnit(event, \'片\', \'unitText\');">片</a>');

        html.push('<i>');
        html.push('<a forUnit="粒" onclick="recommend.chooseUnit(event, \'粒\', \'unitText\');">粒</a>');
        html.push('<a forUnit="包" onclick="recommend.chooseUnit(event, \'包\', \'unitText\');">包</a>');
        html.push('<a forUnit="盒" onclick="recommend.chooseUnit(event, \'盒\', \'unitText\');">盒</a>');
        html.push('<a forUnit="单位" onclick="recommend.chooseUnit(event, \'单位\',  \'unitText\');">单位</a>');
        html.push('</i>');

        html.push('</span>');
        html.push('</dd>');
        html.push('</dl>');

        /*html.push('<dl>');
         html.push('<dt>用法</dt><dd><span class="drop-down">');
         html.push('<i id="medicalUsage" onclick="recommend.showUsageDropDownList(\'usageDropDown\');">口服</i>');
         html.push('<ul id="usageDropDown" onclick="recommend.changeUsage(event, \'medicalUsage\');" style="display:none;"><li>口服</li><li>外用</li><li>注射</li></ul>');
         html.push('</span></dd>');
         html.push('</dl>');*/

        html.push('<dl class="gapTop">');
        html.push('<dt>备注</dt><dd><div class="text-outer"><textarea id="backUp" placeholder="以上的用法用量信息，不进行点选，则不会向患者展示。"></textarea></div></dd>');
        html.push('</dl>');

        html.push('<a class="do-save-recommond" onclick="recommend.confirmSelectCallback(event, recommend.isFromPrescription);">确定</a>');

        html.push('</div>');

        param.content = html.join('');

        this.showPopWindow(param);
    },

    changeNumber: function(type, inputId, max){
        var obj = document.querySelector('#' + inputId);
        var value;
        var max = max || 99;

        if(!(/^\d+$/).test(obj.value)){
            obj.value = '';
        }

        value = parseInt((obj.value === '') ? 0 : obj.value, 10);

        if(type === 0){
            value --;
        }else{
            value ++
        }

        if(value <= 0){

            if(inputId === 'medicalNumber'){
                value = 1;
            }else{
                value = '';
            }
        }

        if(value > max){
            value = max;
        }

        obj.value = value;

    },

    validateNumber: function(inputId, max){
        var obj = document.querySelector('#' + inputId);
        var value;
        var numbers, numbersStr = '';
        var max = max || 99;

        if(!(/^\d+$/).test(obj.value)){
            numbers = obj.value.match(/\d/g);
            if(numbers && numbers.length >= 1){
                for(var i=0; i<numbers.length; i++){
                    numbersStr += numbers[i];
                }
                obj.value = numbersStr;
            }else{
                if(inputId === 'medicalNumber'){
                    obj.value = '1';
                }else{
                    obj.value = '';
                }
            }
        }

        value = parseInt((obj.value === '') ? 0 : obj.value, 10);

        if(value > max){
            obj.value = max;
        }
    },

    chooseUnit: function(event, text, inputId){
        var obj, unitList;
        if(event.currentTarget.className.indexOf('selected') < 0){
            unitList = document.querySelectorAll('#unitList a');
            for(var i = 0; i<unitList.length; i++){
                if(unitList[i] === event.currentTarget){
                    unitList[i].className = 'selected';
                }else{
                    unitList[i].className = '';
                }
            }
            obj = document.querySelector('#' + inputId);
            obj.value = text;
        }

    },

    confirmSelectCallback: function(event, isFromPrescription){
        var param = {};
        var isAddItemIndex = null;

        param = this.getDataFromHtmlDom();

        this.recommendList.map(function(cell, index){
            if(cell['productId'] === param.productId){
                isAddItemIndex = index;
            }
        });

        if(!(/^\d+$/).test(isAddItemIndex + '')){
            this.recommendList.push(param);
        }else{
            this.recommendList[isAddItemIndex] = param;
        }

        this.toggleCheckMedicineItem(param.productId);
        this.changeRecommendNumber(this.recommendList.length);
        this.changeRecommendButtonStatus();

        this.hidePopWindow();

        if(isFromPrescription && isFromPrescription.callBack){
            isFromPrescription.callBack();
        }

        if(event){
            event.preventDefault();
            event.stopPropagation();
        }
    },

    getDataFromHtmlDom: function(){
        var dataObj = document.querySelectorAll('.recommand-tip-box')[0];
        var productId;
        var param = {};
        var number, timePayDay, timePayUnit;

        number = dataObj.querySelector('#medicalNumber').value;
        timePayDay = dataObj.querySelector('#timePayDay').value;
        timePayUnit = dataObj.querySelector('#timePayUnit').value;

        if(!timePayDay || timePayDay === '' || timePayDay === '0'){
            timePayDay = 0;
        }

        if(!timePayUnit || timePayUnit === '' || timePayUnit === '0'){
            timePayUnit = 0;
        }

        param.quantity = number;
        param.timePayDay = timePayDay;
        param.timePayUnit = timePayUnit;
        param.unit = dataObj.querySelector('#unitText').value || '';

        productId = dataObj.getAttribute('productId');
        param.bakup = dataObj.querySelector('#backUp').value || '';
        param.commonName = dataObj.getAttribute('commonName') || '';
        param.productName = dataObj.getAttribute('productName') || '';
        param.productId = productId;
        param.skuId = dataObj.getAttribute('skuId');
        param.spec = '';
        param.combin = '';
        param.hasAddToStore = parseInt(dataObj.getAttribute('hasAddToStore'), 10);
        //param.usage = dataObj.getAttribute('usage') || '';
        //param.usage = dataObj.querySelector('#medicalUsage').innerHTML || '口服';

        return param;
    },

    toggleCheckMedicineItem: function(productId){
        var span;

        span = document.querySelectorAll('span.add-recommond');
        for(var i=0; i<span.length; i++){
            if(parseInt(span[i].getAttribute('productId'), 10) === parseInt(productId, 10)){
                span[i].className = 'add-recommond selected';
            }
        }
    },

    cancelSelectCallback: function(){
        //this.pageObj.togglePrescriptionCheck(this.pageObj.currentPrescription);
        this.hidePopWindow();
    },

    checkHasAddedRecommend: function(id){
        var checkHtml = 'class="add-recommond"';

        id = parseInt(id, 10);

        if(this.recommendList.length > 0){
            for(var j = 0; j<this.recommendList.length; j++){
                if(parseInt(this.recommendList[j].productId, 10) === id){
                    checkHtml = 'class="add-recommond selected"';
                }
            }
        }

        return checkHtml;
    },

    doRecommend: function(event){
        var param = {
            buttons: [],
            space: {}
        };
        var list = this.recommendList;

        if(list.length === 0){
            this.messageBox.show({
                msg:'请先选择要推荐的处方单',
                type:'alert',
                autoClose: true
            });
            return;
        }

        this.frozenOrUnFrozenBackground(true);

        param.needMask = true;
        //param.title = '用药确认';
        param.space = {
            height: 350,
            left: 20
        };

        param.content = this.getRecommendListHtml(list);

        this.showPopWindow(param);

        if(event){
            event.stopPropagation();
        }
    },

    getRecommendListHtml: function(list){
        var html = [];
        var name;
        var recommendDefaultName;

        html.push('<div class="recommand-tip-box recommand-list-box">');
        html.push('<h1>用药确认<a class="close-pop" onclick="recommend.cancelDoRecommendCallback();"></a></h1>');
        html.push('<div class="list-body" id="recommendListBody">');
        html.push('<ul>');

        for(var i=0; i<list.length; i++){
            if(list[i].commonName && list[i].commonName !== ''){
                name = list[i].productName + '(' + list[i].commonName + ')';
                recommendDefaultName = list[0].commonName.substr(0, 6) + '的处方单';
            }else{
                name = list[i].productName;
                recommendDefaultName = '处方单';
            }

            html.push('<li productId="' + list[i].productId + '">');
            html.push('<span class="no-gap">' + name +'</span>');
            //html.push('<a class="add-recommond selected" onclick="recommend.deleteItemFromList(event, ' + list[i].productId  + ');"></a>');
            html.push('</li>');
        }
        html.push('</ul>');

        html.push('</div>');

        html.push('<a class="do-save-recommond" onclick="recommend.confirmDoRecommendCallback();">推荐</a>');

        return html.join('');
    },

    deleteItemFromList: function(event, productId){
        event.target.parentNode.style.display = 'none';

        this.doDeleteRecommendItem(productId, true);
    },

    doDeleteRecommendItem: function(productId, needClearList){
        var span;

        for(var i=0; i < this.recommendList.length; i++){
            if(this.recommendList[i].productId == productId){
                this.recommendList.splice(i, 1);
            }
        }

        this.changeRecommendNumber(this.recommendList.length);

        this.changeRecommendButtonStatus();

        if(needClearList === true){
            span = document.querySelectorAll('span.add-recommond');

            for(var i=0; i<span.length; i++){
                if(parseInt(span[i].getAttribute('productId'), 10) === parseInt(productId, 10)){
                    span[i].className = 'add-recommond';
                }
            }
        }
    },

    popDoAddToStore: function(event, productId){
        //console.info(event, productId);
    },

    showUsageDropDownList: function(listId){
        var obj = document.querySelector('#' + listId);
        obj.style.display = 'block';
    },

    changeUsage:function(event, usageId){
        var obj = document.querySelector('#' + usageId);
        obj.innerHTML = event.target.innerHTML;
        event.currentTarget.style.display = 'none';
    },

    cancelDoRecommendCallback: function(){
        this.frozenOrUnFrozenBackground(false);

        this.hidePopWindow();
    },

    confirmDoRecommendCallback: function(){

        this.frozenOrUnFrozenBackground(false);

        if(this.recommendList.length <= 0){
            this.hidePopWindow();
            return false;
        }

        this.sendRecommendDataToChat();

    },

    savePrescription: function(name){
        var medicineIds = [];
        var param = {
            sendParameters:{
                name: name
            }
        };

        for(var i = 0; i<this.recommendList.length; i++){
            medicineIds.push(this.recommendList[i].productId);
        }
        param.sendParameters['medicationIds'] = medicineIds.join(',');

        param.url = this.requestUrl + 'doc/medication_quick_add';
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = this.handleSavePrescriptionSuccess.bind(this);
        param.onError = this.mainPageObj.handleGetError.bind(this);

        this.ajax.send(param);
        this.mainPageObj.showLoading();
    },

    handleSavePrescriptionSuccess: function(responseText){
        if(responseText.code === 0 || responseText.code === '0'){
            this.sendRecommendDataToChat();
        }else{
            this.mainPageObj.handleGetError(responseText);
        }
    },

    sendRecommendDataToChat: function(){
        var recommondData = JSON.stringify(this.recommendList);
        window.localStorage.setItem('recommondData', encodeURIComponent(recommondData));
        window.location.href = this.requestUrl + 'static/templates/chat/chat.html';

        this.hidePopWindow();
    },

    getRecommendListFromPrescription: function(list){
        for(var key in list){
            if((/^\d+$/).test(key)){
                var data = {};
                var dataObj = list[key];
                data.productId = decodeURIComponent(dataObj.getAttribute('productId'));
                data.productName = decodeURIComponent(dataObj.getAttribute('productName'));
                data.commonName = decodeURIComponent(dataObj.getAttribute('commonName'));

                this.recommendList.push(data);
            }
        }

        this.changeRecommendNumber(this.recommendList.length);
        this.changeRecommendButtonStatus();
    },

    changeRecommendButtonStatus: function(){
        var list = this.recommendList;
        var recommandBut = document.querySelector('#recommandMedical');
        var classNmae = 'recommand-but';

        if(list.length > 0){
            classNmae += ' actived'
        }

        recommandBut.className = classNmae;
    },

    changeRecommendNumber: function(number){
        document.querySelector('#recommandNumber').innerHTML = number;
    },

    frozenOrUnFrozenBackground: function(needFrozen){
        var style = 'overflow:hidden!important;';
        var body = document.querySelector('#prescriptionScroll');
        var height = document.documentElement.clientHeight;

        style += 'height:' + height + 'px!important;';

        if(needFrozen === true){
            body.setAttribute('style', style);
        }else{
            body.removeAttribute('style');
        }
    },

    showPopWindow: function(param){
        this.popWindow.show(param);
    },

    hidePopWindow: function(){
        this.popWindow.hide();
    },

    attachEvent: function(){}
};

recommend.init();
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