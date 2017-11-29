var mock_result =
{
    data: [
        {
            skuId: 13888,
            name: "【999】三九感冒灵胶囊 12粒",
            commonName: "三九感冒灵胶囊",
            images: [
                "../../styles/images/ad_0.png",
               "../../styles/images/ad_1.png",
               "../../styles/images/ad_2.png"
            ],
            manufacturer: "天津金耀",
            character: "",
            approvalNum: "国药准字H12021197",
            spec: "",
            packaging: "",
            indications: "",
            usage: "",
            adverseReactions: "",
            taboo: "",
            attention: "国药准字H12021197国药准 字H12021197国药准字H12021197国药准字H12021197国药 准字H12021197国药准字H12021197国药准字H12021197国药准字H12021197国药准 字H12021197国药准字H12021197国药准字H12021197国药 准字H12021197国药准字H12021197",
            drugInteractions: "",
            toxicology: "",
            storage: "",
            effective: "24个月",
            prescribed: true
        }
    ],
    msg: "success",
    code: 0
};

var mock_return = {
	data: [],
	msg: "success",
	code: 0
};

var medicalDetail = {
    ajax: null,
    messageBox: null,
    slideImage: null,

    requestUrl: SYS_VAR.SERVER_ADDRESS,
    medicalId: getQueryString('medicalId'),
    isAdded: getQueryString('isAdded'),

    slideImageConfig : {
        bind: document.querySelector('#medicalImageSlide'),
        images: [],
        autoSlide: true,
        autoTime: 3000,
        position: 0
    },


    init: function(){
        this.ajax = new Ajax();
        this.messageBox = new MessageBox();
        this.slideImage = new SlideImage();
        
        this.getMedicalDetail();
        this.attachEvent();
    },

    getMedicalDetail:function(){

        var param = {
            sendParameters:{
                'doctorId': '',
                'pid': this.medicalId
            }
        };

        param.url = this.requestUrl + 'doc/medication_detail/';
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = this.handleGetMedicalDetailSuccess.bind(this);
        param.onError = this.handleGetError.bind(this);
        param.mssage = this.msessageBox;

        this.ajax.send(param);
        
        //this.handleGetMedicalDetailSuccess(mock_result);
    },

    handleGetMedicalDetailSuccess:function(responseText){

        if(responseText.code === 0){
            if(responseText.data && responseText.data.length > 0) {
                var medical = responseText.data[0];

                document.querySelector('#prescribed').innerText = medical.prescribed ? '是': '否';
                document.querySelector('#commonName').innerText = medical.commonName;
                document.querySelector('#manufacturer').innerText = medical.manufacturer;
                document.querySelector('#character').innerText = medical.character;
                document.querySelector('#spec').innerText = medical.spec;
                document.querySelector('#packaging').innerText = medical.packaging;
                document.querySelector('#indications').innerText = medical.indications;
                document.querySelector('#usage').innerText = medical.usage;
                document.querySelector('#adverseReactions').innerText = medical.adverseReactions;
                document.querySelector('#taboo').innerText = medical.taboo;
                document.querySelector('#attention').innerText = medical.attention;
                document.querySelector('#drugInteractions').innerText = medical.drugInteractions;
                document.querySelector('#toxicology').innerText = medical.toxicology;
                document.querySelector('#storage').innerText = medical.storage;
                document.querySelector('#effective').innerText = medical.effective;
                document.querySelector('#approvalNum').innerText = medical.approvalNum;
                
                if(medical.images && medical.images.length >= 0){
                    this.slideImageConfig.images = medical.images;
                    this.slideImage.init(this.slideImageConfig);
                }
               
                //this.changeFooter();
            }
        }else{
            this.handleGetError(responseText);
        }
    },

    handleGetError:function(responseText){
        this.messageBox.show({
            msg: responseText.msg,
            type:'alert',
            autoClose: true
        });
    },

    handleFooter:function(event){
        var target = event.target;

        if(target.getAttribute('data-action') == '0'){
            // 添加常用药
            this.uri = 'doc/medication_add_box/';
            this.handleStore(event);
        }else if(target.getAttribute('data-action') == '1'){
            // 取消常用药
            this.uri = 'medication_remove_box/';
            this.handleStore(event);
        }
    },

    // 添加到常用药
    handleStore:function(event){
        var param = {
            sendParameters:{
                'pid': this.medicalId,
                'doctor_id': ''
            }
        };

        param.url = this.requestUrl + this.uri;
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = this.handleStoreSuccess.bind(this);
        param.onError = this.handleGetError.bind(this);
        param.mssage = this.msessageBox;

        this.ajax.send(param);
        //this.handleStoreSuccess(mock_return);
    },

    //添加常用药成功，提示医生
    handleStoreSuccess:function(responseText){
        if(responseText.code === 0){
            this.messageBox.show({
                msg: '处理成功',
                type:'alert',
                autoClose: true
            });
            this.isAdded = this.isAdded =='true'? 'false': 'true';
            this.changeFooter();
        }else{
            this.handleGetError(responseText);
        }
    },

    changeFooter: function(){
        var handleButton = '';
        if(this.isAdded == 'true'){
            handleButton = '<a data-action="1">取消常用药</a>';
        }else{
            handleButton = '<a data-action="0">添加到常用药</a>';
        }
        document.querySelector('footer').innerHTML = handleButton;
    },

    attachEvent: function(){

        var footer = document.querySelector('footer');

        // 添加到常用药、取消常用药
        footer.addEventListener('click', function(event){
            this.handleFooter(event);
        }.bind(this));
    }
};

medicalDetail.init();