'use strict';

var mockImageList = {
    "code": 0,
    "msg": "成功",
    "data": [
        {
            "pageNo": 1,
            "pageSize": 10,
            "baseUrl":"",
            "result": [
                {
                    "date": "2015-12-3",
                    "images": [
                        "http://10.9.2.34/ci/48457/7070/20151210/6226555883462819523.jpg",
                        "http://rainyin.com/two-dimension-code.png",
                        '../../styles/images/ad_2.png',
                        "http://10.9.2.34/ci/48457/7070/20151210/6226555883462819523.jpg",
                        "http://rainyin.com/two-dimension-code.png"
                    ]
                },

                {
                    "date": "2015-12-2",
                    "images": [
                        "../../styles/images/ad_1.png",
                        "../../styles/images/ad_0.png",
                        '../../styles/images/ad_2.png'
                    ]
                },

                {
                    "date": "2015-6-29",
                    "images": [
                        "../../styles/images/ad_1.png",
                        "../../styles/images/ad_0.png",
                        '../../styles/images/ad_2.png'
                    ]
                }
            ],
            "totalCount": 4,
            "totalPages": 3
        }
    ]
};

var patientChatImages = {
    requestUrl: SYS_VAR.SERVER_ADDRESS,

    messageBox: null,
    ajax:null,
    fullScreenView: null,
    skipPage: null,

    urlParams:{},
    patientId: null,

    baseUrl: '',

    pageInfo:{
        pageNo: 1,
        orderby: 1,
        pageSize: 10
    },

    init: function(){
        this.messageBox = new MessageBox();
        this.ajax = new Ajax();
        this.skipPage = new SkipPage();
        this.fullScreenView = new FullScreenView();

        this.getParamsFromUrl();
        this.resizeImgCell();
        this.getChatImage({
            bindObj: document.querySelector('#chatImagePanel')
        });
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

    getChatImage:function(params){
        var param = {
            sendParameters:{}
        };
        var urlParams = this.urlParams;
        var historyPageInfo = this.pageInfo;

        param.sendParameters.patient_id = this.patientId;
        param.sendParameters.doctor_id = urlParams.doctor_id;

        param.sendParameters.page = historyPageInfo.pageNo;
        param.sendParameters.num = historyPageInfo.pageSize;
        param.sendParameters.orderby  = historyPageInfo.orderby;

        param.url = this.requestUrl + 'doc/patient_img_history/';

        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = this.handleGetInfoSuccess.bind(this);
        param.onError = this.handleError.bind(this);

        this.skipPage.init({
            pageInfo: historyPageInfo,
            bindObj: params.bindObj,
            param: param,
            ajax: this.ajax,
            needSkipNext: true,
            needSkipPrev: false
        });

        this.showLoading();

        //this.handleGetInfoSuccess(mockImageList);
    },

    handleGetInfoSuccess: function(responseText){
        var oHtml = [];
        var box = document.querySelector('#chatImagePanel');
        var noData = '<p class="no-data-tip"></p>';
        var span;

        this.skipPage.isFirstLoad = false;

        if(responseText.code === 0){
            var data = responseText['data'];

            if(data && data !== '' && data[0]){

                if(data[0]['result'] && data[0]['result'].length > 0){

                    this.baseUrl = data[0]['baseUrl'];

                    span = document.createElement('span');
                    oHtml = oHtml.concat(this.getListHtml(data[0]['result']));
                    span.innerHTML = oHtml.join('');

                    box.appendChild(span);

                    document.querySelector('#frameLine').style.display = 'block';
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

    getListHtml: function(data){
        var oHtml = [];
        var self = this;

        data.forEach(function(item){
            oHtml = oHtml.concat(self.getCellHtml(item));
        });

        return oHtml;
    },

    getCellHtml: function(item){
        var html = [];
        var timeStr;
        var images = item['images'];

        timeStr = this.getDateString(item['date']);

        html.push('<div class="periphery-box' + (timeStr === '今天' ? ' on':'') + '">');
        html.push('<span class="time-box">' + timeStr + '</span>');
        html.push('<div class="img-box">');
        html.push('<i class="icon"></i>');

        html.push(this.getImageHtml(images, this.baseUrl));

        html.push('<p class="c"></p>');

        html.push('</div>');
        html.push('</div>');

        return html;
    },

    getDateString: function(date){
        var dateObj = date.split('-');
        //var dateOld = new Date(date);
        var dateNow = new Date();
        var nYear, cYear, nMonth, cMonth, nDay, cDay;
        var timeString;

        nYear = dateNow.getFullYear();
        nMonth = dateNow.getMonth() + 1;
        nDay = dateNow.getDate();

        /* cYear = dateOld.getFullYear();
         cMonth = dateOld.getMonth();
         cDay = dateOld.getDate() + 1;*/

        cYear = parseInt(dateObj[0], 10);
        cMonth = parseInt(dateObj[1], 10);
        cDay = parseInt(dateObj[2], 10);

        if(cYear === nYear){
            if(cMonth === nMonth){

                if(nDay === cDay){
                    timeString = '今天';
                }else if((nDay - 1) === cDay){
                    timeString = '昨天';
                }else{
                    timeString = cMonth + '月' + cDay + '日';
                }
            }else{
                timeString = cMonth + '月' + cDay + '日';
            }
        }else{
            timeString = cYear + '年' + cMonth + '月' + cDay + '日';
        }

        return timeString;
    },

    getImageHtml: function(imageList, baseUrl){
        var html = [];
        var needBaseUrl = false;

        if(!baseUrl || baseUrl === '' || baseUrl === 'null' || baseUrl === 'undefined'){
            baseUrl = SYS_VAR.base_url;
        }

        imageList.forEach(function(url){

            if(url && url !== '' && url !== 'null' && url !== 'undefined'){

                //TODO
                /*if(!(/^(http:)|(https:).+$/).test(url)){
                 url = baseUrl + url;
                 }*/

                needBaseUrl = !(url.indexOf('http:') >= 0 || url.indexOf('https:') >= 0 || url.indexOf('../') >= 0);

                url = needBaseUrl === true ? (baseUrl + url) : url;

                html.push('<span class="image-cell"><div><img src="'+ url +'?s=t" onload="patientChatImages.imgCrop(event)" onclick="patientChatImages.mediaFullScreenView(\'' + url + '\', 1, event);"></div></span>');
            }
        });

        return html.join('');
    },

    resizeImgCell: function(){
        var width = document.documentElement.clientWidth;
        var imgCellWidth = (width - 125)/3;
        var style = '';

        style += '.image-cell{width:' + imgCellWidth + 'px!important; height:' + imgCellWidth + 'px!important;}';
        style += '.image-cell div{height:' + (imgCellWidth - 10) + 'px!important;}';

        document.querySelector('#userDefineStyle').innerHTML = style;
    },

    imgCrop: function(event){
       /* var dom = event.target;
        var w = dom.width;
        var h = dom.height;

        var ibw = document.querySelector('.periphery-box').clientWidth;
        var ibh = ibw / 3
        // console.log(ibh,ibw);
        dom.parentNode.style.height = ibh + 'px';

        if(w > h){
            dom.style.height = '100%';
            dom.style.marginLeft = '-'+ (dom.clientWidth / 2) +'px';
            dom.style.left = '50%';
            dom.style.position = 'relative';
        }else if(h > w){
            dom.style.width = '100%';
            dom.style.marginTop = '-'+((dom.clientHeight-ibh)/2) +'px';
        }else{
            dom.style.width = '100%';
        }*/
    },

    mediaFullScreenView: function(source, type, event){

        this.fullScreenView.show({
            type: type, // type: 1 image, type
            src: source,
            event: event
        });
    },

    showNoDateTip: function(box, oHtml){
        if(this.pageInfo.pageNo === 1){
            box.className = 'patient-chat-images-list ' + 'no-chat-images';
            box.innerHTML = oHtml;
        }
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

patientChatImages.init();