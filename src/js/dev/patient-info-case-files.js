'use strict';
var mockCaseFilesList = {
    "code": 0,
    "msg": "成功",
    "data": [
        {
            "pageNo": 1,
            "pageSize": 10,
            "orderBy": null,
            "order": null,
            "result": [
            {
                "id": "sjdlkcvdsfj",
                "hospital": "广东省人民医院",
                "department": "产科",
                "vistingTime": '348728373457449',
                "description": "病情描述",
                 "imgs": [
                    {
                        "imgUrl":"../../styles/images/ad_0.png"
                    },
                     {
                         "imgUrl":"../../styles/images/ad_1.png"
                     },
                     {
                         "imgUrl":"../../styles/images/ad_2.png"
                     },
                     {
                         "imgUrl":"../../styles/images/ad_0.png"
                     },
                     {
                         "imgUrl":"../../styles/images/ad_1.png"
                     },
                     {
                         "imgUrl":"../../styles/images/ad_2.png"
                     }
                ]
            }
        ],
        "totalCount": 2,
        "first": 0,
        "orderBySetted": false,
        "totalPages": 1,
        "hasNext": false,
        "nextPage": 1,
        "hasPre": false,
        "prePage": 1
    }]
};

var patientCaseFiles = {
	server: SYS_VAR.SERVER_ADDRESS,

	messageBox: null,
	ajax:null,
    fullScreenViewer: null,

    requestUrl: SYS_VAR.SERVER_ADDRESS,

    urlParams:{},
    patientId: null,

    pageInfo:{
        maxImageCount: 3,
        pageNo: 1,
        pageSize: 20
    },

	init: function(){
        this.messageBox = new MessageBox();
        this.ajax = new Ajax();
        this.fullScreenView = new FullScreenView();
        this.skipPage = new SkipPage();

        this.getParamsFromUrl();
        this.getPCFList();
	},

    getParamsFromUrl: function(){
        var search = window.location.search;
        this.urlParams = search.getValueFromUrl();

        this.patientId  = this.urlParams['patient_id'];
        this.patientId = parseInt(this.patientId, 10);
        this.urlParams = decodeURIComponent(window.localStorage.getItem('patientInfo'));
        this.urlParams = JSON.parse(this.urlParams);

        this.setOpenChatButton();
    },

    getPCFList: function(){
        var _self = this,
            param = {
                url: SYS_VAR.SERVER_ADDRESS + 'doc/patient_case_list/',
                type: 'GET',
                asyn: true,
                timeout: 20 * 1000,
                onSuccess: _self.handleGetInfoSuccess.bind(_self),
                onError: _self.handleError.bind(_self),
                sendParameters:{
                    patientId : _self.patientId,
                    page: _self.pageInfo.pageNo,
                    num: _self.pageInfo.pageSize
                }
            };


        this.skipPage.init({
            pageInfo: this.pageInfo,
            bindObj: document.querySelector('#list-content'),
            param: param,
            ajax: this.ajax,
            needSkipNext: true,
            needSkipPrev: false
        });

        this.showLoading();

        //this.handleGetInfoSuccess(mockCaseFilesList);
    },

    handleGetInfoSuccess: function(responseText){
        var oHtml = '',
            box = document.querySelector('#list-content'),
            noData = '<p class="no-data-tip"></p>';

        if(responseText.code === 0){
            var data = responseText['data'];

            if(data && data[0]){

                if(data[0]['result'] && data[0]['result'].length > 0){
                    oHtml = this.getListHtml(data[0]['result']);
                    box.innerHTML = oHtml;
                }else{
                    this.showNoDateTip(box, noData)
                }
            }else{
                this.showNoDateTip(box, noData)
            }

            this.hideLoading();
        }else{
            this.handleError(responseText);
        }
    },

    showNoDateTip: function(box, oHtml){
        box.innerHTML = oHtml;
    },

    getListHtml: function(data){
        var self = this,
            oHtml = '',
            timeHtml = '';

        data.forEach(function(item){
            var time = item['vistingTime'],
                description = item['description'],
                detail = 'patient-case-files-details.html',
                timeStr;

            detail += '?case_file_id=' + encodeURIComponent(item['id']);
            detail += '&patient_id=' + encodeURIComponent(self.patientId);

            time = self.dateChange(parseInt(time, 10));
            //timeStr = (time.getMonth() + 1) + '-' + time.getDate() + ' ' + time.getHours() + ':' + time.getMinutes();
            timeStr = (time.getMonth() + 1) + '-' + time.getDate();

            if(description.length > 10){
                description = description.substring(0, 10) + '...';
            }

            item.descriptionStr = description;
            item.timeStr = timeStr;
            item.detailUrl = detail;
        });

        //timeHtml = self.showPanelGap(time);

        oHtml = template(document.getElementById('list-content-tpl').innerHTML, {
            list: data
        });

        return oHtml;
    },

    showPanelGap: function(time){
        var html;
        var content = [];

        if(!document.querySelector('#panel_' + time.getFullYear())){
            html = time.getFullYear() + '年' + (time.getMonth() + 1) + '月';
            content.push('<li class="date-gap" id="' + ('panel_' + time.getFullYear()) + '">' + html + '</li>');
        }

        return content;
    },

    dateChange: function(time){
        var date = new Date();
        var paramType;

        paramType = (typeof time).toLowerCase();
        //console.info(paramType, date.getTime());

        if(paramType === 'number'){
            date.setTime(time);
        }

        return date;
    },

    mediaFullScreenView: function(source, type, event){
        this.fullScreenView.show({
            type: type, // type: 1 image, type
            src: source,
            event: event
        });
    },

    handleError: function(responseText){
        var msg = responseText.msg;

        if(msg === '' || !msg){
            msg = '网络异常，请稍后再试';
        }

        this.messageBox.show({
            msg: msg,
            type:'alert',
            autoClose: true
        });
    },

    setOpenChatButton: function(){
        var param = this.urlParams;
        var chatUrl = '../chat/chat.html';
        var foot = document.querySelectorAll('footer')[0];

        chatUrl += '?patient_id=' + encodeURIComponent(param['patient_id']);
        chatUrl += '&patient_name=' + encodeURIComponent(param['patient_name']);
        chatUrl += '&patient_icon=' + encodeURIComponent(param['patient_icon']);
        chatUrl += '&doctor_id=' + encodeURIComponent(param['doctor_id']);

        foot.innerHTML = '<a href="' + chatUrl + '">发送消息</a>';
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

patientCaseFiles.init();