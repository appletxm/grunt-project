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