
/**
parameters includes below value;
url: // String URL
type: // String GET or POST 
sendParameters: //JSON if the ajax is post then these parameters will be keep here
asyn: //Boolean if need asyn it should be set true
onSuccess: //callbacks function
onError: //callback function
cache:  //Boolean
isJsonp: //Boolean if the ajax is jsonp
callback: //String just use for jsonp
needNewScript: //Boolean just use for jsonp
mssage: //Object jsut use for halding ajax message

**/
var Ajax = function(){
	this.xmlHttp = null;
	this.parameters = {};
	this.msgs = {
		paramError: '参数有误'
	}

	this.GetXmlHttpObject = function(){
		var xmlHttp=null;
		try{
			// Firefox, Opera 8.0+, Safari
			xmlHttp=new XMLHttpRequest();
		}
		catch (e){
			// Internet Explorer
			try{
				xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
			}
			catch (e){
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
		}
		return xmlHttp;
	};

	this.xmlHttp = this.GetXmlHttpObject();

	this.send = function(parameters){
		var param = parameters;
		this.parameters = parameters;

		if (!param.timeout) {
			param.timeout = 20 * 1000;
		}

		if(!param.url || param.url === ''){
			if(param.onError){
				param.onError({
					msg: this.msgs.paramError
				});
			}
			return false;
		}else{
			this.starAnimate();
			this.doAjax(parameters);
		}
	};

	this.doAjax = function(parameters){
		var url,
			sendParam;

		this.parameters = parameters;

		if(!parameters.cache){
			url = (parameters.url.indexOf('?') >= 0) ? (parameters.url + '&timer=' + Math.random()) : (parameters.url + '?timer=' + Math.random());
		}

		if(parameters.type === 'GET'){
			sendParam = parameters.sendParameters ? this.getGetParameters(parameters.sendParameters) : null;
			url = url.indexOf('?') >=0 ? (url + '&' + sendParam) : (url + '?' + sendParam);
			sendParam = null;
		}else{
			sendParam = parameters.sendParameters ? this.getPostParameters(parameters.sendParameters) : null;
			//sendParam = parameters.sendParameters;
		}

		if(parameters.isJsonp && parameters.needNewScript){
            	this.doJsonpNewScript(parameters);
        }else{
        	this.xmlHttp.onreadystatechange = this.stateChanged.bind(this);

			this.xmlHttp.open(parameters.type , url, parameters.asyn || false);

			if(parameters.type === 'POST'){
				try{
					this.xmlHttp.setRequestHeader("Content-Type", "text/json");
				}catch(e){
					alert(e);
				}

			}

			this.xmlHttp.send(this.parameters.needPostJson ? JSON.stringify(this.parameters.sendParameters) : sendParam);
        }
	};

	this.getGetParameters = function(postParameters){
		var paramStr = "";

		if((typeof postParameters).toLowerCase() === 'object'){
			for(var param in postParameters){
				paramStr += param + "=" + postParameters[param] + "&"
			}
		}

		paramStr = paramStr.substring(0, paramStr.length - 1);
		
		return paramStr;
	};

	this.getPostParameters = function(postParameters){
		var paramStr = "";

		if((typeof postParameters).toLowerCase() === 'object'){
			for(var param in postParameters){
				paramStr += param + "=" + JSON.stringify(postParameters[param])+ "&"
			}
		}

		paramStr = paramStr.substring(0, paramStr.length - 1);
		
		return paramStr;
	};

	this.stateChanged = function(){
		var param = this.xmlHttp;

		if (this.xmlHttp.readyState === 4){
			if (this.xmlHttp.status == 200) {
				this.onSuccess(this.xmlHttp.responseText);
	        }else{
	        	this.onError(this.xmlHttp.responseText);
	        }
		}
	};

	this.onSuccess = function(responseText){
		var param = this.parameters;
		var result;

        if(this.parameters.isJsonp){
        	this.doJsonpNewFunction(responseText);
        }else{
        	result = JSON.parse(responseText);
        	
        	if(result.code === '0' || result.code === 0){
        		this.endAnimate();
        	}

        	if(param.onSuccess){
				param.onSuccess(result);
			}
        }
	};

	this.onError = function(responseText){
		var param = this.parameters;

		if(param.onError){
			param.onError({
	        	msg: this.xmlHttp.responseText
	        });
		}
	};

	this.doJsonpNewScript = function(parameters){
		var script,
			url,
			body;

		body = document.querySelectorAll('body')[0];
		url = parameters.url;
		url = (url.indexOf('?') >= 0) ? ('&callback=' + parameters.callback) : ('?callback=' + parameters.callback);

		script = document.querySelector('dynamicScript');
		if(script && script.length > 0){
			body.removeChild(script);
		}
		script = document.createElement('script');
		script.setAttribute('src', url);
		script.setAttribute('id', 'dynamicScript');
		body.appendChild(script);

		this.endAnimate();
	};

	this.doJsonpNewFunction = function(responseText){
		var callBackFunction = new Function(responseText);
		callBackFunction();
	};

	this.starAnimate = function(){
		var msg = this.parameters.mssage;

		if(msg){
			msg.show({
				msg:'<span class="fa fa-spinner fa-pulse fa-2x fa-fw"></span>', 
				type:'loading', 
				autoClose: false
			});
		}
		
	};

	this.endAnimate = function(){
		var msg = this.parameters.mssage;

		if(msg){
			msg.hide();
		}
	};

};