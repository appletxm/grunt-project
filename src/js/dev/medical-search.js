// 测试数据
var mock_medicine = {
    data: [
        {
            "key": "K",
            "voList": [
                {
                    id: 7,
                    name: "克痤隐酮凝胶 安徽安科 6g",
                    commonName: "克痤隐酮凝胶",
                    manufacturer:"xx制药厂",
                    sale:true,
                    usage: "外用，涂敷患处，一日2次。",
                    image: "http://img.jxdyf.com/product/0000/011/11632_L1.jpg",
                    salePrice: "40.00",
                    marketPrice: "36.00",

                    skus: [
                        {
                            skuId: 13888,
                            name: "克痤隐酮凝胶",
                            salePrice: "40.00"
                        }
                    ],
                    prescribed: false
                },
                {
                    id: 7,
                    name: "克痤隐酮凝胶 安徽安科 6g",
                    commonName: "克痤隐酮凝胶",
                    manufacturer:"xx制药厂",
                    sale:true,
                    usage: "外用，涂敷患处，一日2次。",
                    image: "http://img.jxdyf.com/product/0000/011/11632_L1.jpg",
                    salePrice: "40.00",
                    marketPrice: "36.00",

                    skus: [
                        {
                            skuId: 13888,
                            name: "克痤隐酮凝胶",
                            salePrice: "40.00"
                        }
                    ],
                    prescribed: false
                }
            ]
        }
    ],

    msg: "success",
    code: 0
};

var favoriteMedicine = {
    ajax: null,
    popWindow: null,
    messageBox: null,
    requestUrl: SYS_VAR.SERVER_ADDRESS,

    mainPageObj: null,

    deleteMedicine:{},

    pageInfo:{
      pageSize: 500,
        pageNo: 1
    },

    init: function(params){
        if(params){
            this.mainPageObj = params.pageObj;

            this.ajax = params.pageObj['ajax'];
            this.messageBox = params.pageObj['messageBox'];
            this.popWindow = params.pageObj['popWindow'];
        }

        //this.getFavoriteMedicine();
        this.attachEvent();
    },

    getFavoriteMedicine: function(){
        var param = {
            sendParameters:{
                'page': this.pageInfo.pageNo,
                'num': this.pageInfo.pageSize
            }
        };

        param.url = this.requestUrl + 'doc/medication_box/';
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = this.handleGetFavoriteMedicineSuccess.bind(this);
        param.onError = this.mainPageObj.handleGetError.bind(this);
        //param.mssage = this.messageBox;

        this.ajax.send(param);

        this.mainPageObj.showLoading();

        //this.handleGetFavoriteMedicineSuccess(mock_medicine);
    },

    handleGetFavoriteMedicineSuccess: function(responseText){

        if(responseText.code === 0 || responseText.code === '0'){
            this.showFavoriteMedicineList(responseText.data);
        }/*else{
            this.mainPageObj.handleGetError(responseText);
        }*/

        this.mainPageObj.hideLoading();

        //prescription.getPrescription();
    },

    showFavoriteMedicineList: function(data){
        var list = [];
        var panel = document.querySelector('#myFavoriteMedicineList');
        //var numbObj = document.querySelector('#myFavoriteMedicineNumber');

        if(data.length > 0){
            for(var i = 0; i<data.length; i++){
                list = list.concat(data[i]['voList']);
            }
        }

        //numbObj.innerHTML = '(' + list.length + ')';
        panel.innerHTML = this.mainPageObj.getListHtml(list, 2);
    },

    handleAddOrRemoveStore: function(productId, target, isAdded){
        var param = {
            sendParameters:{
                'pid': productId,
                'doctor_id': ''
            }
        };

        param.url = this.requestUrl + (isAdded ? 'doc/medication_add_box/' : 'doc/medication_remove_box/');
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = function(responseText){
            this.handleAddOrRemoveStoreSuccess(responseText, target, isAdded);
        }.bind(this);

        param.onError = this.mainPageObj.handleGetError.bind(this);

        this.ajax.send(param);

        this.mainPageObj.showLoading();

        //this.handleAddOrRemoveStoreSuccess(mock_return, target, isAdded);
    },

    //添加删除常用药成功，提示医生
    handleAddOrRemoveStoreSuccess:function(responseText, target, isAdded){
        var label = target.tagName.toLowerCase();

        if(responseText.code === 0){
            this.messageBox.show({
                msg: isAdded ? '添加常用药成功' : '删除常用药成功',
                type:'alert',
                autoClose: true
            });

            if(label === 'span' && target.className.indexOf('add-recommond') >= 0){
                this.updateMedicineList(target);
            }else{
                target.className = isAdded ? 'add-store add-store-success' : 'add-store';
            }

            this.deleteMedicine = {};
            this.mainPageObj.hideLoading();
        }else{
            this.mainPageObj.handleGetError(responseText);
            this.deleteMedicine = {};
        }
    },

    handlePanelClick: function(event){
        var target = event.target;
        var label = target.tagName.toLowerCase();
        var display;
        var number;

        if(label === 'h2'){
            number = (/\d+/).exec(target.querySelectorAll('b')[0].innerHTML);
            number = number ? parseInt(number, 10) : 0;

            if(number > 0){
                display = target.nextElementSibling.style.display;
                if(display === 'none'){
                    target.nextElementSibling.style.display = 'block';
                    target.className = target.className + ' selected';
                }else{
                    target.nextElementSibling.style.display = 'none';
                    target.className = target.className.replace(' selected', '');
                }
            }

            event.preventDefault();
            event.stopPropagation();
        }

        //TODO just remove the medicine from the favorite medical box
        /*if(label === 'span' && target.className.indexOf('add-recommond') >= 0){
            this.deleteMedicine.id = parseInt(target.getAttribute('productId'), 10);
            this.deleteMedicine.target = target;

            this.confirmRemoveMedicine();
            //this.handleAddOrRemoveStore(parseInt(target.getAttribute('productId'), 10), target, false);
        }*/
    },

    confirmRemoveMedicine: function(){
        var html = '';
        var param = {
            buttons: [],
            space: {}
        };
        //var medicine = this.deleteMedicine;

        param.needMask = true;
        param.title = '删除常用药确认';
        param.space = {
            height: 80
        };

        html += '<p class="tip-msg-fixed">确认要从常用药品列表删除此药物？</p>';

        param.content = html;
        param.buttons.push(
            {
                text: '确 认',
                css: 'save',
                callback: 'favoriteMedicine.confirmDeleteCallback()'
            },
            {
                text: '取 消',
                css: 'cancel',
                callback: 'favoriteMedicine.cancelDeleteCallback()'
            }
        );

        this.popWindow.show(param);
    },

    confirmDeleteCallback: function(){
        this.handleAddOrRemoveStore(this.deleteMedicine.id, this.deleteMedicine.target, false);
        this.popWindow.hide();
    },

    cancelDeleteCallback: function(){
        this.popWindow.hide();
    },

    updateMedicineList: function(target){
        var dl = target.parentNode.parentNode;
        dl.parentNode.removeChild(dl);
    },

    attachEvent: function(){
        var favoriteMedicinePanel = document.querySelector('#myFavoriteMedicineList');

        favoriteMedicinePanel.onclick = function(event){
            this.handlePanelClick(event);
        }.bind(this);
    }
};

//favoriteMedicine.init();
var recommend = {
    ajax: null,
    popWindow: null,
    messageBox: null,
    requestUrl: SYS_VAR.SERVER_ADDRESS,

    recommendList:[],
    isFromPrescription: null,

    selectedSpan: null,

    init: function(params){
        if(params){
            this.mainPageObj = params.pageObj;

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

        if(target.className.indexOf('selected') >= 0){
            target.className = 'add-recommond';
            this.doDeleteRecommendItem(productId, true);
            return false;
        }else{
            target.className = 'add-recommond selected';
            this.selectedSpan = target;
        }

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

        html.push('<dl>');
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
        html.push('<dd class="">');
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

        html.push('<dl>');
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
        var dataObj = document.querySelectorAll('.recommand-tip-box')[0];
        var productId;
        var span;
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

        this.recommendList.push(param);

        document.querySelector('#recommandNumber').innerHTML = this.recommendList.length;

        span = document.querySelectorAll('span.add-recommond');
        for(var i=0; i<span.length; i++){
            if(parseInt(span[i].getAttribute('productId'), 10) === parseInt(productId, 10)){
                span[i].className = 'add-recommond selected';
            }
        }

        this.changeRecommendButtonStatus();
        this.hidePopWindow();

        if(isFromPrescription && isFromPrescription.callBack){
            isFromPrescription.callBack();
        }

        event.preventDefault();
        event.stopPropagation();
    },

    cancelSelectCallback: function(){
        if(this.selectedSpan){
            this.selectedSpan .className = 'add-recommond';
        }
        this.selectedSpan = null;

        this.hidePopWindow();
    },

    checkHasAddedRecommend: function(id){
        var checkHtml = 'class="ctrl add-recommond"';

        id = parseInt(id, 10);

        if(this.recommendList.length > 0){
            for(var j = 0; j<this.recommendList.length; j++){
                if(parseInt(this.recommendList[j].productId, 10) === id){
                    checkHtml = 'class="ctrl add-recommond selected"';
                }
            }
        }

        return checkHtml;
    },

    doRecommend: function(){
        var param = {
            buttons: [],
            space: {}
        };
        var list = this.recommendList;

        if(list.length === 0){
            this.messageBox.show({
                msg:'请先添加推荐药',
                type:'alert',
                autoClose: true
            });
            return;
        }

        param.needMask = true;
        //param.title = '用药确认';
        param.space = {
            height: 350,
            left: 20
        };

        param.content = this.getRecommendListHtml(list);

        this.showPopWindow(param);

        event.stopPropagation();
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
            html.push('<span>' + name +'</span>');
            html.push('<a class="add-recommond selected" onclick="recommend.deleteItemFromList(event, ' + list[i].productId  + ');"></a>');
            //html.push('<a class="add-to-store" onclick="recommend.popDoAddToStore(event, ' + list[i].productId + ');" style="display:' + (list[i].hasAddToStore?'none':'block') + '">加到常用药</a>');
            //html.push('<a class="added-to-store" onclick="recommend.popDoAddToStore(event, ' + list[i].productId + ');" style="display:' + (list[i].hasAddToStore?'block':'none') + '">已经添加</a>');
            html.push('</li>');
        }
        html.push('</ul>');

        html.push('<div id="recommendSaveToPrescription" class="recommend-save-prescription">');
        html.push('<span class="checked-outer" onclick="recommend.toggleChecked(event);">');
        html.push('<b class="chexk-dot"></b><input type="hidden" value="0" id="savePrescriptionName" />');
        html.push('<label for="savePrescriptionName">保存为处方单，下次推荐直接用</label>');
        html.push('</span>');
        html.push('<span style="display:none;" class="input-name">');
        html.push('起个名吧 <em>');
        html.push('<input type="text" id="prescriptionName" maxlength="10" size="10" value="' + recommendDefaultName + '" />');
        html.push('<i>（不超过10个字符）</i>');
        html.push('</em>');
        html.push('</span>');
        html.push('</div>');
        html.push('</div>');

        html.push('<a class="do-save-recommond" onclick="recommend.confirmDoRecommendCallback();">推荐</a>');

        html.push('</div>');

        return html.join('');
    },

    toggleChecked: function(event){
        var input = event.currentTarget.querySelector('#savePrescriptionName');
        var body = document.querySelector('#recommendListBody');
        var checkbox = event.currentTarget.querySelectorAll('b')[0];

        if(input.value === '0'){
            input.value = '1';
            checkbox.className = checkbox.className + ' ' + 'selected';
            event.currentTarget.nextElementSibling.style.display = 'block';
            body.scrollTop = body.scrollHeight - body.clientHeight;
        }else{
            input.value = '0';
            checkbox.className = checkbox.className.replace(' selected', '');
            event.currentTarget.nextElementSibling.style.display = 'none';
            body.scrollTop = 0;
        }
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
        document.querySelector('#recommandNumber').innerHTML = this.recommendList.length;
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
        this.hidePopWindow();
    },

    confirmDoRecommendCallback: function(){
        var checkBox;
        var input;

        if(this.recommendList.length <= 0){
            this.hidePopWindow();
            return false;
        }

        checkBox = document.querySelector('#savePrescriptionName');
        input = document.querySelector('#prescriptionName');
        if(checkBox.value === '1'){
            if(input.value === '' || !input.value.isNormalText(2, 10)){
                this.messageBox.show({
                    msg:'请输入正确的处方单名',
                    type:'alert',
                    autoClose: true
                });
                return false;
            }

            this.savePrescription(input.value);
        }else{
            this.sendRecommendDataToChat();
        }

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

    changeRecommendButtonStatus: function(){
        var list = this.recommendList;
        var recommandBut = document.querySelector('#recommandMedical');
        var classNmae = 'recommand-but';

        if(list.length > 0){
            classNmae += ' actived'
        }

        recommandBut.className = classNmae;
    },

    showPopWindow: function(param){
        this.popWindow.show(param);
        this.frozenBackWindowOrNot(true);
    },

    hidePopWindow: function(){
        this.popWindow.hide();
        this.frozenBackWindowOrNot(false);
    },

    frozenBackWindowOrNot: function(needFrozen){
        var searchPanel = document.querySelector('#searchListScroll');
        var prescriptionPanel = document.querySelector('#prescriptionScroll');

        if(searchPanel){
            searchPanel.style.overflow = (needFrozen === true) ? 'hidden' : 'scroll';
        }
        if(prescriptionPanel){
            prescriptionPanel.style.overflow = (needFrozen === true) ? 'hidden' : 'scroll';
        }
    },

    attachEvent: function(){}
};

//recommend.init();
// 测试数据
var mock_result = {
	data: [
        {
           "result": [
               {
                   id: 1107,
                   name: "【999】三九感冒灵胶囊 12粒",
                   commonName: "感冒灵胶囊",
                   spec: "6g装",
                   usage: "口服，一次2粒，一日3次。",
                   image: "http://img.jxdyf.com/product/0000/011/11632_L1.jpg",
                   salePrice: "10.90",
                   marketPrice: "13.08",
                   manufacturer: "天津金耀",
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
            "totalCount": 1,
            "totalPages": 3,
            "pageNo": 1
        },
    ],
    msg: "success",
    code: 0
};

// 测试数据
var mock_return = {
	data: ['搜索药品1','搜索药品2', '搜索药品1搜索药品1搜索药品1'],
	msg: "success",
	code: 0
};

var medicalSearch = {
    ajax: null,
    popWindow: null,
    messageBox: null,
    slideTab: null,
    searchFromDatabase: null,
    requestUrl: SYS_VAR.SERVER_ADDRESS,

    doctorId: getQueryString('doctor_id'),
    patientId: getQueryString('patient_id'),
    patientName: decodeURIComponent(getQueryString('patient_name') || ''),

    // 是否滚动到下一页
    scrollPage: 0,
    key: '',
    page: 1,
    totalPages: 0,
    num: 20,
    orderBy: 'default',
    order: 0,
    isFirstLoad: true,
    isPrescriptionLoaded: false,
    currentTabPage: 0,

    init: function(){
        this.ajax = new Ajax();
        this.messageBox = new MessageBox();
        this.popWindow = new PopWindow();
        this.slideTab = new SlideTabs();
        this.searchFromDatabase = new SearchFromDatabase();

        this.slideTab.init({
            trigger: document.querySelector('#tabControl'),
            responser: document.querySelectorAll('.tab-con'),
            selectedCss: 'selected',
            callBack: this.tabClickCallBack.bind(this)
        });

        this.searchFromDatabase.init({
            ajax: this.ajax,
            tipList: {
                action: this.requestUrl + 'doc/search_list/'
                //,mockData: mock_return
            },
            callback: this.handleDoSearch.bind(this),
            messageBox: this.messageBox,
            beforeSearchFunction : this.resetPageInfo.bind(this),
            pageObj: medicalSearch,
            pageObjString: 'medicalSearch',
            searchObjString: 'searchFromDatabase',
            bindObj: document.querySelector('#searchBinObj'),
            tipText: '搜索'
        });

        recommend.init({
            pageObj: medicalSearch
        });

        favoriteMedicine.init({
            pageObj: medicalSearch
        });

        /*prescription.init({
            pageObj: medicalSearch
        });*/

        this.attachEvent();
    },

    handleDoSearch:function(searchKey){
        this.key = searchKey || this.searchFromDatabase.key;

        if(!this.key || this.key.trim() === ''){
            this.messageBox.show({
                msg: '请输入搜索关键字',
                type:'alert',
                autoClose: true
            });
            return false;
        }

        var param = {
            sendParameters:{
                'doctorId': this.doctorId,
                'key': this.key,
                'page': this.page,
                'num': this.num,
                'orderBy': this.orderBy,
                'order': this.order
            }
        };

        param.url = this.requestUrl + 'doc/search_medication/';
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = this.handleGetPatientMedicalSuccess.bind(this);
        param.onError = this.handleGetError.bind(this);
        //param.mssage = this.messageBox;

        this.showLoading();

        this.ajax.send(param);

        this.isFirstLoad = false;

       //this.handleGetPatientMedicalSuccess(mock_result);
    },

    // 点击“搜索”按钮之后进行药品的搜索
    handleGetPatientMedicalSuccess:function(responseText){
        var medicalList;
        var html;
        var panel = document.querySelector('#medicalSearchList');
        var scrollPanel = document.querySelector('#searchListScroll');

        if(responseText.code === 0){
            this.hideLoading();

            if(responseText.data && responseText.data.length > 0) {
                medicalList = responseText.data[0].result;

                if(medicalList.length === 0){
                    this.handleGetError({
                        msg: '没有找到您要想的药品~'
                    });
                    return false;
                }

                this.totalPages = responseText.data[0].totalPages;

                html = this.getListHtml(medicalList, 1);

                if(this.page === 1) {
                    panel.innerHTML = html;
                } else {
                    var span = document.createElement('span');
                    span.innerHTML = html;
                    panel.appendChild(span);
                }

                if(this.page === 1){
                    setTimeout(function(){
                        scrollPanel.scrollTop = 0;
                        scrollPanel.onscroll = function(event){
                            this.handleScroll(event);
                        }.bind(this);
                    }.bind(this), 0);
                }
            }else{
                this.handleGetError({
                    msg: '没有找到您要想的药品~'
                });
            }

            document.querySelector('#mySearchResult').click();
        }else{
            this.handleGetError(responseText);
        }
    },

    getListHtml: function(list, listType){
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
            event = 'onclick="medicalSearch.handleSearchListClick(event);"';

           /* if(listType === 1){
                //normal list
                event = 'onclick="medicalSearch.handleSearchListClick(event);"';
            }else if(listType === 2){
                //my favorite medicine list
                event = 'onclick="prescription.handleListClick(event);"';
            }else{
                event = 'onclick="favoriteMedicine.handleListClick(event);"';
            }*/

            //spanHtml.push('<span ' + checkHtml + ' id="add-recommond-' + list[i].id + '"');
            spanHtml.push('<span ' + checkHtml);
            spanHtml.push(' hasAddToStore="0" productId="' + list[i].id + '"');
            spanHtml.push(' usage="' + encodeURIComponent(list[i].usage || '') + '"');
            spanHtml.push(' spec="' + encodeURIComponent(list[i].spec || '') + '"');
            spanHtml.push(' skuId="' + skuId + '"');
            spanHtml.push(' productSize="' + encodeURIComponent(list[i].usage || '') + '"');
            spanHtml.push(' productName="' + encodeURIComponent(list[i].name || '') + '"');
            spanHtml.push(' commonName="' + encodeURIComponent(list[i].commonName || '') + '"'+ '></span>');

            content.push('<li class="item" ' + event + '>');
            content.push('<a href="medical-detail.html?medicalId=' + list[i].id +'&isAdded=' + (list[i].added || true) + '">');
            content.push('<img class="img" src="' + list[i].image + '?s=t" width="100" />');
            content.push('</a>');

            content.push('<div>');
            content.push('<h3 class="tit">' + name + '</h3>');
            content.push('<p class="desc">' + (list[i].manufacturer || list[i].usage) + '</p>');
            content.push('<p class="desc price">¥' + list[i].salePrice + '</p>');
            //content.push('<span class="price">市场价 <em>￥ ' + medicalList[i].marketPrice + '</em></span>');

            /*if(listType === 1) {
                content.push('<span class="' + addClass + '" data-id="' + list[i].id + '">' + addTips + '</span> ');
                content.push('<i class="added-tip">已有' + list[i].addNum + '人添加</i>');
            }*/

            content.push('</div>');

            content.push(spanHtml.join(''));

            content.push('</li>');

        }

        return content.join('');
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

    // 数据列表click事件
    handleSearchListClick:function(event){
        var target = event.target;
        var label = target.tagName.toLowerCase();
        var span;

        if(target.className === 'add-store'){
            // 添加到常用药
            favoriteMedicine.handleAddOrRemoveStore(target.getAttribute('data-id'), target, true);

            event.preventDefault();
            event.stopPropagation();
        }

        if(label !== 'a' && label !== 'dt' && label !== 'img'){
            span = event.currentTarget.querySelectorAll('.add-recommond')[0];
            // 添加到推荐列表
            recommend.showRecommendBox(span);

            event.preventDefault();
            event.stopPropagation();
        }
    },

    // 根据不同类型排序药品
    handleFilterBar:function(event){
        var target = event.target;
        if(target.className.indexOf('selected') >= 0){
            return;
        }

        var lis = target.parentNode.querySelectorAll('li');
        for(var i=0; i< lis.length; i++){
            if(lis[i] === target){
                target.className = 'selected';
            }else{
                if(lis[i].className.indexOf('selected') >= 0){
                    lis[i].className = '';
                }
            }
        }

        this.orderBy = target.getAttribute('type');
        this.handleDoSearch();

        event.stopPropagation();
    },

    handleFloatFilterBar: function(event){
        var filterPanel = event.currentTarget.querySelector('#filterBarVerticalInner');
        var mask = event.currentTarget.querySelectorAll('.filter-mask')[0];
        var triggerTarget = event.target;
        var label = triggerTarget.tagName.toLowerCase();

        if(filterPanel.style.display === 'block'){
            filterPanel.style.display = 'none';
            mask.style.display = 'none';
        }else{
            filterPanel.style.display = 'block';
            mask.style.display = 'block';
        }

        if(label === 'li'){
           this.handleFilterBar(event);
        }

        event.stopPropagation();
    },

    handleScroll: function(){
        //var body = document.querySelectorAll('body')[0];
        var body = document.querySelector('#searchListScroll');

        if(this.currentTabPage !== 0){
            return false;
        }

        if(this.isFirstLoad === true){
            return false;
        }

        if(body.scrollTop === (body.scrollHeight - body.clientHeight)){
            this.page ++;
            if(this.page <= this.totalPages){
                 this.handleDoSearch();
            }
        }
    },

    resetPageInfo: function(){
        var scrollPanel = document.querySelector('#medicalSearchList');

        scrollPanel.onscroll = null;
        this.page = 1;
    },

    tabClickCallBack: function(element){
        var moduleName = element.getAttribute('for');
        var freezePanel = document.querySelector('#freezePanel');

        if(moduleName === 'my-search-list'){
            this.currentTabPage = 0;
            freezePanel.className = 'need-freeze';
        }else{
            this.currentTabPage = 1;
            freezePanel.className = 'need-freeze no-need-filter';
        }
    },

    openPrescription: function(){
        //if(this.isPrescriptionLoaded === false){
            favoriteMedicine.getFavoriteMedicine();
            this.isPrescriptionLoaded = true;
        //}
    },

    handleDocumentClick: function(){
        var filter = document.querySelector('#filterBarVerticalInner');

        if(filter.style.display === 'block'){
            filter.style.display = 'none';
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

    attachEvent: function(){
        var openPrescription = document.querySelector('#myPrescription');
        var filterBar = document.querySelector('#filterBar');
        var floatFilterBar = document.querySelector('#filterBarVertical');
        var doRecommendBut = document.querySelector('#recommandMedical');
        var scrollPanel = document.querySelector('#searchListScroll');

        //加载处方单
         openPrescription.addEventListener('click', function(){
            this.openPrescription();
        }.bind(this));

        // 按条件排序
        filterBar.addEventListener('click', function(event){
            this.resetPageInfo();
            this.handleFilterBar(event);
        }.bind(this));

        //浮动排序
        floatFilterBar.addEventListener('click', function(event){
            this.resetPageInfo();
            this.handleFloatFilterBar(event);
        }.bind(this));

         // 推荐用药
        doRecommendBut.addEventListener('click', function(event){
            recommend.doRecommend(event);
        }.bind(this));

        //隐藏浮动排序菜单
        window.addEventListener('click', function(event){
            this.handleDocumentClick(event);
        }.bind(this));

        scrollPanel.onscroll = function(){
            this.handleScroll();
        }.bind(this);
    }
};

medicalSearch.init();