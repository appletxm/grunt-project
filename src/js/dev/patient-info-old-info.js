var mockPatientDetail = {
	data: [
            {
            "patientId": 10,
            "phone": "11111112222",
            "name": "刘德华",
            "age": 30,
            "gender": "男",
            "maritalStatus": "未婚",
            "weight": 68,
            "height": 186,
            "city": "广东湛江坡头区",
            "smokeHistory": "日吸烟量：平均2支;开始吸烟年龄：18;吸烟状态：吸烟",
            "pastDisease": "过往1,过往6,测试其他",
            "hereditaryDisease": "遗传3,遗传4,测试其他",
            "familyHistory": "父亲：家族2,家族21,家族22,其他病史1;母亲：家族5,家族22,其他病史2;兄弟姐妹：家族11,家族22,其他病史3;子女：家族22,其他病史4;",
            "drinkHstory": "饮酒频率：偶尔;日饮酒量：123两;已戒酒，戒酒年龄2岁;饮酒种类：啤酒,红酒,洋酒,其他酒",
            "medicationAllergy": "过敏7,过敏8,其他过敏",
            "headUrl": "http://file-www.sioe.cn/201109/14/222211817.jpg"
            }
    ],
	msg: "success",
	code: 0
}

var patientInfo = {
	server: SYS_VAR.SERVER_ADDRESS,

	messageBox: null,
	ajax:null,
	popWindow: null,
	slideTab: null,
    requestUrl: SYS_VAR.SERVER_ADDRESS,

	init: function(){
		this.messageBox = new MessageBox();
		this.ajax = new Ajax();
		this.popWindow = new PopWindow();
        this.patientId = getQueryString('patientId');
		this.getPatientDetail();
	},

    doRequest: function(uri, params, callbackFunction){
        var param = params
        param.url = this.requestUrl + uri;
        param.type = 'GET';
        param.asyn = true;
        param.onSuccess = callbackFunction.bind(this);
        param.onError = this.handleGetError.bind(this);
        //param.mssage = this.messageBox;

        this.ajax.send(param);
    },

    handleGetError:function(responseText){
        this.messageBox.show({
            msg: responseText.msg,
            type:'alert',
            autoClose: true
        });
    },

	getPatientDetail: function(){
        var param = {
            sendParameters:{
                'patientId': this.patientId
            }
        };

        var uri = 'doc/patient_detail/';
        var callbackFunction = this.getPatientDetailSuccess;
        this.doRequest(uri, param, callbackFunction);
        //this.getPatientDetailSuccess(mockPatientDetail);
	},

    getPatientDetailSuccess: function(responseText){
        if(responseText.code === 0){
            if(responseText.data && responseText.data.length > 0) {
                var patientDetail = responseText.data[0];
                document.querySelector("#maritalStatus").innerHTML = patientDetail.maritalStatus !== '' && patientDetail.maritalStatus ? patientDetail.maritalStatus : '无';
                document.querySelector("#weight").innerHTML = patientDetail.weight !== '' && patientDetail.weight ? patientDetail.weight : '无';
                document.querySelector("#medicationAllergy").innerHTML = patientDetail.medicationAllergy;
                document.querySelector("#pastDisease").innerHTML = patientDetail.pastDisease;
                document.querySelector("#familyHistory").innerHTML = patientDetail.familyHistory;
                document.querySelector("#hereditaryDisease").innerHTML = patientDetail.hereditaryDisease;
                document.querySelector("#smokeHistory").innerHTML = patientDetail.smokeHistory;
                document.querySelector("#drinkHstory").innerHTML = patientDetail.drinkHstory;
                document.querySelector("#name").innerHTML = patientDetail.name;
                // document.querySelector("#age").innerHTML = patientDetail.age;
                document.querySelector("#city").innerHTML = patientDetail.city;

                document.querySelector("#headUrl").src = patientDetail.headUrl;
                document.querySelector("#sex").className = patientDetail.gender == '男' ? 'male' : 'female';
            }
        }

    }

};

patientInfo.init();