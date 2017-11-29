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