// 测试数据
var mock_result = {
	data: [
        {
           "result": [
                /*{
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
                },
                {
                    id: 16495,
                    name: "【999】三九感冒灵胶囊 12粒",
                    commonName: "感冒灵胶囊",
                    spec: "6g装",
                    usage: "口服，一次2粒，一日3次。",
                    image: "http://img.jxdyf.com/product/0000/011/11632_L1.jpg",
                    salePrice: "10.90",
                    marketPrice: "13.08",
                    manufacturer: "天津金耀",
                    addNum: 0,
                    added: true,
                    skus: [
                        {
                            skuId: 15511,
                            name: "999感冒灵胶囊",
                            salePrice: "10.90",
                            prescribed: false
                        }
                    ],
                    prescribed: false
                }*/
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

var prescriptionsSearch = {
    ajax: null,
    popWindow: null,
    messageBox: null,
    searchFromDatabase: null,
    requestUrl: SYS_VAR.SERVER_ADDRESS,

    // 是否滚动到下一页
    scrollPage: 0,
    key: '',
    page: 1,
    totalPages: 0,
    num: 20,
    orderBy: 'default',
    order: 0,
    isFirstLoad: true,
    urlParameters:{},

    selectedList:[],

    init: function(){
        this.ajax = new Ajax();
        this.messageBox = new MessageBox();
        this.popWindow = new PopWindow();
        this.searchFromDatabase = new SearchFromDatabase();

        this.searchFromDatabase.init({
            ajax: this.ajax,
            tipList: {
                action: this.requestUrl + 'doc/search_list/'
                //,mockData: mock_return
            },
            callback: this.handleDoSearch.bind(this),
            messageBox: this.messageBox,
            beforeSearchFunction : this.resetPageInfo.bind(this),
            pageObj: prescriptionsSearch,
            pageObjString: 'prescriptionsSearch',
            searchObjString: 'searchFromDatabase',
            bindObj: document.querySelector('#searchBinObj'),
            tipText: '输入药品名称搜索'
        });

        this.attachEvent();
        this.getUrlParameters();
    },

    getUrlParameters: function(){
        var url = window.location.search;
        var ids;
        var params;

        if(!url || url === ''){
            return false;
        }

        params = url.getValueFromUrl();

        /*for(var key in params){
            this.urlParameters[key] = params[key];
        }*/

        this.urlParameters = params;

        if(this.urlParameters['flag'] === 1 || this.urlParameters['flag'] === '1'){
            if(this.urlParameters['medication_ids'] && this.urlParameters['medication_ids'] !== '' && this.urlParameters['medication_ids'] !== 'null' && this.urlParameters['medication_ids'] !== 'undefined'){
                ids = this.urlParameters['medication_ids'].split(',');
                for(var i = 0; i<ids[i]; i++){
                    this.selectedList.push(parseInt(ids[i], 10));
                }
            }

            document.title = (this.urlParameters['group_name'] + '　') || '分组名';
        }else{
            this.getFavoriteMedicine();
        }
    },

    getFavoriteMedicine: function(){
        var param = {
            sendParameters:{
                'page': 1,
                'num': 500
            }
        };

        param.url = this.requestUrl + 'doc/medication_box/';
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = this.handleGetFavoriteMedicineSuccess.bind(this);
        param.onError = this.handleGetError.bind(this);

        this.showLoading();

        this.ajax.send(param);
    },

    handleGetFavoriteMedicineSuccess: function(responseText){
        if(responseText.code === 0 || responseText.code === '0'){
            this.getMedicineIds(responseText.data);
            this.hideLoading();
        }else{
            this.getMedicineIds([]);
        }
    },

    getMedicineIds: function(data){
        var list = [];
        var ids = [];

        if(data.length > 0){
            for(var i = 0; i<data.length; i++){
                list = list.concat(data[i]['voList']);
            }
        }

        for(var j = 0 ; j < list.length; j++){
            ids.push(list[j]['id']);
        }

        this.urlParameters['medication_ids'] = ids.join(',');
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
                        document.querySelectorAll('body')[0].scrollTop = 0;
                        window.onscroll = function(event){
                            this.handleScroll(event);
                        }.bind(this);
                    }.bind(this), 0);
                }
            }else{
                this.handleGetError({
                    msg: '没有找到您要想的药品~'
                });
            }
        }else{
            this.handleGetError(responseText);
        }
    },

    getListHtml: function(list){
        var content = [];

        if (list.length > 0) {
            for(var i=0; i < list.length; i++){
                var addTips = '添加到常用药';
                var addClass = 'add-store';
                var skuId = list[i].skus[0].skuId;
                var checkHtml;
                var name;
                var spanHtml = [];
                var event;
                var url;

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

                event = 'onclick="prescriptionsSearch.handleSearchListClick(event);"';
                checkHtml = 'class="add-recommond"';

                if(this.urlParameters['flag'] === '0'){
                    if(list[i].added === true || list[i].added === 'true'){
                        checkHtml = 'class="add-recommond selected"';
                    }
                }else{
                    if(this.checkMedicineInPrescription(list[i].id)){
                        checkHtml = 'class="add-recommond selected"';
                    }
                }

                url = '../medical/medical-detail.html?medicalId=' + list[i].id +'&isAdded=' + (list[i].added || true);

                spanHtml.push('<span ' + checkHtml + ' id="add-recommond-' + list[i].id + '"');
                spanHtml.push(' hasAddToStore="0" productId="' + list[i].id + '"');
                spanHtml.push(' usage="' + encodeURIComponent(list[i].usage || '') + '"');
                spanHtml.push(' spec="' + encodeURIComponent(list[i].spec || '') + '"');
                spanHtml.push(' skuId="' + skuId + '"');
                spanHtml.push(' productSize="' + encodeURIComponent(list[i].usage || '') + '"');
                spanHtml.push(' productName="' + encodeURIComponent(list[i].name || '') + '"');
                spanHtml.push(' commonName="' + encodeURIComponent(list[i].commonName || '') + '"'+ '></span>');

                content.push('<dl ' + event + '>');
                content.push('<dt><a href="' + url + '">');
                content.push('<img src="' + list[i].image + '?s=t" width="100" />');
                content.push('</a>');
                content.push('</dt>');

                content.push('<dd>');
                content.push('<i class="tit">' + name + '</i>');
                content.push('<i class="size">' + (list[i].manufacturer || list[i].usage) + '</i>');
                content.push('<b>¥' + list[i].salePrice + '</b>');
                //content.push('<span class="price">市场价 <em>￥ ' + medicalList[i].marketPrice + '</em></span>');

                content.push(spanHtml.join(''));

                content.push('</dd>');

                content.push('</dl>');

            }
        } else {
            content.push('<div class="no-data-tip"></div>');
        }


        return content.join('');
    },

    handleGetError:function(responseText, isAddItems, id){
        var msg = responseText.msg;

        if(isAddItems === true){
            this.selectedList.splice(this.selectedList.indexOf(id), 1);
        }else if(isAddItems === false){
            this.selectedList.push(id);
        }

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

        if(label !== 'a' && label !== 'img' && label !== 'dt'){
            event.preventDefault();
            span = event.currentTarget.querySelectorAll('.add-recommond')[0];

            this.editMedicineFromList(span, target);

        }
    },

    editMedicineFromList: function(span){
        var id;

        id = parseInt(span.getAttribute('productId'), 10);

        if(span.className.indexOf('selected') >= 0){
            this.selectedList.splice(this.selectedList.indexOf(id), 1);
            this.handleSaveEvent(span, false, id);
        }else{
            this.selectedList.push(id);
            this.handleSaveEvent(span, true, id);
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
    },

    handleScroll: function(){
        var body = document.querySelectorAll('body')[0];

        if(this.isFirstLoad === true){
            return false;
        }

        if(body.scrollTop === (body.scrollHeight - document.documentElement.clientHeight)){
            this.page ++;

            if(this.page <= this.totalPages){
                 this.handleDoSearch();
            }else{
                this.page = this.totalPages;
            }
        }
    },

    resetPageInfo: function(){
        window.onscroll = null;
        this.page = 1;
    },

    checkMedicineInPrescription: function(id){
        var ids = this.urlParameters['medication_ids'];
        var reg = new RegExp ('(' + id + ')', 'g');

        if(ids && ids.match(reg) && ids.match(reg).length > 0){
            return true;
        }

        return false;
    },

    handleSaveEvent: function(span, isAddItems, id){
        var param = {
            sendParameters:{}
        };

        if(this['urlParameters']['flag'] === '1' || this['urlParameters']['flag'] === 1){
            param.url = this.requestUrl + (isAddItems ? 'doc/medication_group_add_medic/' : 'doc/medication_group_remove_medic/');
            param.sendParameters['id'] = this['urlParameters']['group_id'];

            if(isAddItems === true){
                param.sendParameters['medicationIds'] = (this['selectedList'].length === 0) ? id : this['selectedList'].toString();
            }else{
                param.sendParameters['medicationIds'] = id;
            }

        }else{
            param.url = this.requestUrl + (isAddItems ? 'doc/medication_add_box/' : 'doc/medication_remove_box/');
            param.sendParameters['pid'] = id;
        }

        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = function(responseText){
            this.handleSaveListSuccess(responseText, span, isAddItems);
        }.bind(this);
        param.onError = function(responseText){
            this.handleGetError(responseText, isAddItems, id);
        }.bind(this);

        this.showLoading();

        this.ajax.send(param);
    },

    handleSaveListSuccess:function(responseText, span, isAddItems){
        if(responseText.code === 0 || responseText.code === '0'){
            this.showResultTipMessage(span, isAddItems);
        }else{
            this.handleGetError(responseText);
        }
    },

    showResultTipMessage: function(span, isAddItems){
        if(isAddItems === true){
            span.className = 'add-recommond selected';
        }else{
            span.className = 'add-recommond';
        }

        this.messageBox.show({
            msg: (isAddItems ? '添加成功！' : '删除成功'),
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
        var filterBar = document.querySelector('#filterBar');

        // 按条件排序
        filterBar.addEventListener('click', function(event){
            this.resetPageInfo();
            this.handleFilterBar(event);
        }.bind(this));

        window.onscroll = function(){
            this.handleScroll();
        }.bind(this);
    }
};

prescriptionsSearch.init();