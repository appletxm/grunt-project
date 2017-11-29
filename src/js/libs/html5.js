/*
* create html5 labels for ie7~8
* */
(function() {
	var html5Labels = ['abbr', 'article', 'aside', 'audio', 'canvas', 'details', 'dialog', 'figure','footer', 'header', 'mark', 'menu', 'meter', 'nav', 'output', 'progress', 'section', 'time', 'video', 'audio'];
	for(var i=0; i<html5Labels.length; i++){
		document.createElement(html5Labels[i]);
	}
})();