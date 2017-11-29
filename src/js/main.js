
/*
define(['js/config.js'], function(config){
	//console.info(requirejs.s.contexts._.config);
	var requirejsConfig = requirejs.s.contexts._.config,
		url = window.location.href,
		currentApp = 'index';

	requirejsConfig.baseUrl = config.baseUrl;
	requirejsConfig.paths = config.paths;

	if(url.indexOf('about') >= 0){
		currentApp = 'about';
	}

	requirejs([config.app[currentApp].module], function(module){
		requirejs([config.app[currentApp].page], function(page){
			if(page.bootStrap && typeof page.bootStrap === 'function'){
				page.bootStrap();
			}
		});

	});

});*/
