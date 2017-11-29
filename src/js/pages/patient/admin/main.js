var patientAdmin = {
    server: SYS_VAR.SERVER_ADDRESS,

    messageBox: null,
    ajax:null,
    popWindow: null,
    slideTab: null,

    requestUrl: SYS_VAR.SERVER_ADDRESS,
    hasLoadedLatestMessage: false,
    hasLoadedPatientList: false,

    init: function(){
        this.messageBox = new MessageBox();
        this.ajaxForMessage = new Ajax();
        this.ajaxForPatient = new Ajax();
        this.popWindow = new PopWindow();
        this.slideTab = new SlideTabs();
        this.skipPage = new SkipPage();
        this.slideTab.init({
            trigger: document.querySelector('#tabControl'),
            responser: document.querySelectorAll('.tab-con'),
            selectedCss: 'selected'
        });

        this.doctorId = getQueryString('doctorId');

        timeFormat.init({
            pageObj: patientAdmin
        });

        abcSideBar.init({
            pageObj: patientAdmin
        });

        latestMessage.init({
            pageObj: patientAdmin
        });

        patientList.init({
            pageObj: patientAdmin
        });

        searchPatient.init({
            pageObj: patientAdmin
        });

        this.hasLoadedLatestMessage = true;
        latestMessage.getLatestMessage();
        this.attachEvent();
    },

    doRequest: function(url, params, callbackFunction, context, ajax){
        var param = params
        param.url = this.requestUrl + url;
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = callbackFunction.bind(context || this);
        param.onError = this.handleGetError.bind(this);
        //param.mssage = this.messageBox;

        this.showLoading();

        ajax.send(param);
    },

    handleGetError:function(responseText){
        var msg = responseText.msg;

        this.hideLoading();

        if(!msg || msg === ''){
            msg = '系统异常，请稍后重试。';
        }

        this.messageBox.show({
            msg: msg,
            type:'alert',
            autoClose: true
        });
    },

    showPatientInfo: function(event){
        var page = '../patient-info/patient-info.html',
            target = event.currentTarget,
            patientId = encodeURIComponent(target.getAttribute('data-patient-id')),
            patientName = encodeURIComponent(target.getAttribute('data-patient-name')),
            patientIcon = encodeURIComponent(target.getAttribute('data-patient-img')),
            doctorId = encodeURIComponent(target.getAttribute('data-doctor-id')),
            param = '?patient_id=' + patientId + '&patient_name=' + patientName + '&doctor_id=' + doctorId + '&patient_icon=' + patientIcon;

        window.location.href = page + param;
    },

    getPatientDefaultIcon: function(patientImg){
        var oldDefaultIcon = 'patient_header.png';
        var newDefaultIcon = SYS_VAR.STATIC_ADDRESS + 'styles/images/patient_default.png';

        if(!patientImg || patientImg === '' || patientImg === 'null' || patientImg === 'undefined'){
            patientImg = newDefaultIcon;
        }else if(patientImg.indexOf(oldDefaultIcon) >= 0){
            patientImg = newDefaultIcon;
        }

        return patientImg;
    },

    showPatientChatMessage: function(event){
        var url = event.currentTarget.getAttribute('data-url');
        window.location.href = url;
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
        var patientQnaList = document.querySelector('#patient-qna-list');
        var myPatientList = document.querySelector('#my-patient');

        // 获取我的患者
        patientQnaList.addEventListener('click', function(){
            latestMessage.handleLatestMessage();
        }.bind(this));

        // 获取我的患者
        myPatientList.addEventListener('click', function(){
            patientList.handlePatientList();
        }.bind(this));

    }
};

patientAdmin.init();
