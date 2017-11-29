'use strict';

var mockCaseFilesDetail = {
    "code": 0,
    "msg": "成功",
    "data": [
        {
            "id": "kfjskdljdfvkds",
            "hospital": "广东省人民医院广东省人民医院广东省人民医院广东省人民医院",
            "department": "产科",
            "doctor": "张三丰",
            "vistingTime": "1328373457449",
            "description": "病情描述",
            "adviceList": [
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
                    "imgUrl":"../../styles/images/ad_2.png"
                }
            ],
            "prescriptionList": [
                {
                    "imgUrl":"../../styles/images/ad_0.png"
                },
                {
                    "imgUrl":"../../styles/images/ad_1.png"
                },
                {
                    "imgUrl":"../../styles/images/ad_2.png"
                }
            ],
            "checkList": [
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
    ]
};

var patientCaseFilesDetails = {
    messageBox: null,
    ajax:null,
    fullScreenViewer: null,

    requestUrl: SYS_VAR.SERVER_ADDRESS,

    urlParams:{},
    patientId: null,
    caseId: null,

	init: function(){
        this.messageBox = new MessageBox();
        this.ajax = new Ajax();
        this.fullScreenView = new FullScreenView();

        this.getParamsFromUrl();
        this.getPCFileDetail();
	},

    getParamsFromUrl: function(){
        var search = window.location.search;
        this.urlParams = search.getValueFromUrl();

        this.patientId  = this.urlParams['patient_id'];
        this.patientId = parseInt(this.patientId, 10);
        this.caseId = this.urlParams['case_file_id'];
        this.urlParams = decodeURIComponent(window.localStorage.getItem('patientInfo'));
        this.urlParams = JSON.parse(this.urlParams);

        this.setOpenChatButton();
    },

    getPCFileDetail: function(){
        var _self = this,
            param = {
                url: SYS_VAR.SERVER_ADDRESS + 'doc/patient_case_detail/',
                type: 'GET',
                asyn: true,
                onSuccess: _self.handleGetInfoSuccess.bind(_self),
                onError: _self.handleError.bind(_self),
                sendParameters:{
                    patientId : _self.patientId,
                    caseId: _self.caseId
                }
            };

        this.showLoading();

        this.ajax.send(param);

        //this.handleGetInfoSuccess(mockCaseFilesDetail);
    },

    handleGetInfoSuccess: function(responseText){
        var oHtml = [];
        var box = document.querySelector('#caseFileDetails');
        var noData = '<p class="no-data-tip no-case-file"></p>';

        if(responseText.code === 0){
            var data = responseText['data'];
            if(data && data !== '' && data[0]){
                oHtml = oHtml.concat(this.getDetailHtml(data[0]));
                box.innerHTML = oHtml.join('');
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

    getDetailHtml: function(data){
        var oHtml = [];
        var adviceList = '<i>患者未上传医嘱</i>';
        var prescriptionList = '<i>患者未上传处方单</i>';
        var checkList = '<i>患者未上传检查单</i>';
        var date, timeStr;

        if(data['adviceList'] && data['adviceList'].length > 0){
            adviceList = this.getImageHtml(data['adviceList']);
        }
        if(data['prescriptionList'] && data['prescriptionList'].length > 0){
            prescriptionList = this.getImageHtml(data['prescriptionList']);
        }
        if(data['checkList'] && data['checkList'].length > 0){
            checkList = this.getImageHtml(data['checkList']);
        }

        date = this.dateChange(parseInt(data['vistingTime'], 10));
        timeStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

        oHtml.push('<h6>病情描述</h6>');
        oHtml.push('<p class="case-details">' + (data['description'] || '<i>患者末填写病情描述</i>') + '</p>');

        oHtml.push('<div class="images-box">');

        oHtml.push('<dl>');
        oHtml.push('<dt>医嘱</dt>');
        oHtml.push('<dd>');
        oHtml.push(adviceList);
        oHtml.push('</dd>');
        oHtml.push(' </dl>');

        oHtml.push('<dl>');
        oHtml.push('<dt>处方单</dt>');
        oHtml.push('<dd>');
        oHtml.push(prescriptionList);
        oHtml.push('</dd>');
        oHtml.push(' </dl>');

        oHtml.push('<dl>');
        oHtml.push('<dt>检查单</dt>');
        oHtml.push('<dd>');
        oHtml.push(checkList);
        oHtml.push('</dd>');
        oHtml.push(' </dl>');

        oHtml.push('</div>');

        oHtml.push('<div class="table-wrap">');
        oHtml.push('<table class="msg-table">');
        oHtml.push('<tr>');
        oHtml.push('<td class="title">就诊时间</td>');
        oHtml.push('<td class="value">' + timeStr + '</td>');
        oHtml.push('</tr>');
        oHtml.push('<tr class="no-after-arrow">');
        oHtml.push('<td class="title">就诊医院</td>');
        oHtml.push('<td class="value">' + (data['hospital'] || '') + '</td>');
        oHtml.push('</tr>');
        oHtml.push('<tr class="no-after-arrow">');
        oHtml.push('<td class="title">就诊科室</td>');
        oHtml.push('<td class="value">' +  (data['department'] || '') + '</td>');
        oHtml.push('</tr>');
        oHtml.push('<tr class="no-after-arrow">');
        oHtml.push('<td class="title">医生</td>');
        oHtml.push('<td class="value">' +  (data['doctor'] || '') + '</td>');
        oHtml.push('</tr>');
        oHtml.push('</table>');
        oHtml.push('</div>');

        return oHtml;
    },

    mediaFullScreenView: function(source, type, event){
        this.fullScreenView.show({
            type: type, // type: 1 image, type
            src: source,
            event: event
        });
    },

    getImageHtml: function(imageList){
        var html = [];

        imageList.forEach(function(image){
            var url = image['imgUrl'];

            if(url && url !== '' && url !== 'null' && url !== 'undefined'){
                html.push('<span><img src="'+ url +'?s=t" onclick="patientCaseFilesDetails.mediaFullScreenView(\'' + url + '\', 1, event);" width="80" height="80"></span>');
            }
        });

        return html.join('');
    },

    dateChange: function(time){
        var date = new Date();
        var paramType;

        paramType = (typeof time).toLowerCase();

        if(paramType === 'number'){
            date.setTime(time);
        }

        return date;
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

patientCaseFilesDetails.init();