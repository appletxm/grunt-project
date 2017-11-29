/**
 all string validate
**/
String.prototype.isNumber = function(minLen, maxLen){
	var range;
	var reg;
	var value = this;

	range = getRegExpRange(minLen, maxLen);
	reg = new RegExp('^\\d' + range + '$');

	return reg.test(value);
};

String.prototype.isNormalText = function(minLen, maxLen){
	var range;
	var value = this;
	var regName;
	var regSpecialLetter = new RegExp('[~|!|@|#|$|%|^|&|*]', 'g');

	range = getRegExpRange(minLen, maxLen);
	regName = new RegExp('^(\\d|\\w|[\u4E00-\u9FA5])' + range + '$');

	return regName.test(value) && !regSpecialLetter.test(value);
};

String.prototype.isNormalTextArea = function(minLen, maxLen){
	var range;
	var value = this;
	var regName;

	range = getRegExpRange(minLen, maxLen);
	regName = new RegExp('^.' + range + '$');

	return regName.test(value);
};

String.prototype.isPassword = function(minLen, maxLen){
	var range;
	var value = this;
	var reg;

	range = getRegExpRange(minLen, maxLen);
	reg = new RegExp('^.' + range + '$');

	return reg.test(value);
};

String.prototype.isPhoneNumber = function(){
	var range;
	var reg;
	var value = this;

	//range = getRegExpRange(8, false);
	//reg = new RegExp('^((13[0-9])|(15[^4,\\D])|(18\\d))|(177)\\d' + range + '$');
	range = getRegExpRange(10, false);
	reg = new RegExp('^1\\d' + range + '$');

	return reg.test(value);
};

String.prototype.getValueFromUrl = function(){
	var keys = [];
	var values = [];
	var urlParams = {};

	if(this !== ''){
		keys = this.match(/(.[^?|&]+)=/g);
		values= this.match(/=(.[^&]*)/g);

		if(!keys || !values){
			return {};
		}

		for(var i=0; i<keys.length; i++){
			var key = keys[i].replace(/=|\?|&/g, '');
			var value = decodeURIComponent(values[i]).replace('=', '');

			urlParams[key] = value;
		}
	}

	return urlParams;
};

// 去掉前后空格
String.prototype.trim=function() {
	return this.replace(/(^\s*)|(\s*$)/g,'');
}

function getRegExpRange(minLen, maxLen){
	var range;

	if(minLen && (typeof minLen).toLowerCase() === 'number'){
		if(maxLen && (typeof maxLen).toLowerCase() === 'number'){
			range = '{' + minLen + ',' + maxLen + '}';
		}else if(maxLen === false){
			range = '{' + minLen + '}';
		}else{
			range = '{' + minLen + ',}';
		}
	}

	return range;
}

function getQueryString(name){
	var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r!=null)return  unescape(r[2]); return null;
}