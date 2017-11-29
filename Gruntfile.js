module.exports = function(grunt) {
	var ipAddress = 'localhost';// if you want to use the ip address for you web site please set the ip from you computer
	var uglifyJsConfig = getJsFiles(grunt);
	var concatConfig = concatJsFiles(grunt);

	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		watch: {
			less: {
				files: ['src/**/*.less'],
				tasks:['less:development'],
				options: {
					livereload: '<%=connect.options.livereload%>'
				}
			},
			js: {
				files: ['src/js/components/*.js', 'src/js/pages/**/*.js'],
				tasks:['concat', 'uglify'],
				options: {
					livereload: '<%=connect.options.livereload%>'
				}
			},
			html:{
				files: ['src/**/*.html'],
				options: {
					livereload: '<%=connect.options.livereload%>'
				}
			}
		},

		clean:{
			js: ['src/js/dist/*.*'],
			js: ['src/js/dev/*.*'],
			css: ['src/styles/*.css']
		},

		less:{
			development: {
				options: {
					compress: true,
					yuicompress: true,
					sourceMap: false,
					outputSourceFiles: false,
					sourceMapURL: 'main.css.map',
          			sourceMapFilename: 'src/styles/main.css.map'
				},
				files: {
					'src/styles/base.css'				: 'src/styles/common/base.less',
					'src/styles/page-patient.css'		: 'src/styles/pages/patient/page-patient.less',
					'src/styles/page-patient-info.css'	: 'src/styles/pages/patient-info/page-patient.less',
					'src/styles/page-point.css'			: 'src/styles/pages/point/page-point.less',
					'src/styles/page-my.css'			: 'src/styles/pages/my/page-my.less',
					'src/styles/page-main.css'			: 'src/styles/pages/main/page-main.less',
					'src/styles/page-chat.css'			: 'src/styles/pages/chat/page-chat.less',
					'src/styles/page-author.css'		: 'src/styles/pages/author/page-author.less',
					'src/styles/page-error.css'			: 'src/styles/pages/error/page-error.less',
					'src/styles/page-prescriptions.css'	: 'src/styles/pages/prescriptions/page-prescriptions.less',
					'src/styles/page-medical.css'	    : 'src/styles/pages/medical/page-medical.less'
				}
			},

			production: {
				options: {
					cleancss: true,
					modifyVars: {
						imgPath: '"images/"',
						fontPath: '"font-awesome-4.3.0/fonts/"'
					},
					compress: true,
					yuicompress: true,

					optimization: 2
				},
				files: {
					'src/styles/global.css': 'src/styles/global.less'
				}
			},

			dist:{
				options:{
					compress: false,
					yuicompress: false,
					plugins: [new (require('less-plugin-clean-css'))({advanced: true})]
				},
				files: {
					'dist/styles/global.css': 'src/styles/global.less'
				}
			}
		},

		concat: concatConfig,

		uglify: uglifyJsConfig,

		connect: {
			options: {
				port: 9000,
				//hostname: 'localhost',
				hostname: ipAddress,
				livereload: 35729
			},

			server: {
				options: {
					open: 'http://' + ipAddress + ':9000/src/'
					//open:true,
					//base: ['src']//主目录
				}
			}
		}
	});

	grunt.registerTask('server', [
		'clean',
		'connect:server',
		'less:development',
		// 'less:production',
		'concat',
		'uglify',
		'watch'
	]);

	grunt.registerTask('compress', [
		'clean',
		'less:development',
		'concat',
		'uglify'
	]);


};

//config uglify function
function getJsFiles(grunt){
	//uglify js config
	var jsFiles = [];
	var components = grunt.file.expand('src/js/components/*.js');
	var pages = grunt.file.expand('src/js/dev/*.js');
	var newPath = 'src/js/dist/';
	var fileName;
	var uglifyJsOptions = {
		my_target: {
			files: {}
		}
	};

	components.forEach(function(component){
		jsFiles.push(component)
	});
	pages.forEach(function(page){
		jsFiles.push(page)
	});

	jsFiles.forEach(function(file){
		var fileArray = [];

		fileName = file.split('/').pop();
		fileArray.push(file);

		uglifyJsOptions.my_target.files[newPath + fileName.replace('.js', '') + '.min.' + 'js'] = fileArray;
	});

	uglifyJsOptions.my_target.files[newPath + 'components.min.js'] = components;

	return uglifyJsOptions;
}

//config concat function
function concatJsFiles(grunt){
	var dest = 'src/js/dev/';
	var pathPrefix = 'src\\/js\\/pages\\/';
	var pathSupfix = '\\/modules';
	//var components = grunt.file.expand('src/js/components/*.js');
	var pagesJsFiles = grunt.file.expand('src/js/pages/**');
	var concatConfigs = {};

	pagesJsFiles.forEach(function(file){
		var reg = new RegExp(pathPrefix+'(.*?)\/(modules\/.*\\.js|main\\.js)', 'g');
		var match = reg.exec(file);
		if(match !== null)
		{
			var compressFileName = match[1].replace(/\//g, '-');
			var fileModulePath = pathPrefix.replace(/\\/g,'') + match[1];

			concatConfigs[compressFileName] = {};
			if(match[2].indexOf('modules') >= 0)
			{
				concatConfigs[compressFileName] = {
					src :[fileModulePath + '/modules/*.js', fileModulePath + '/main.js'],
					dest : dest + compressFileName + '.js'
				};
			}else{
				concatConfigs[compressFileName] = {
					src :[fileModulePath + '/main.js'],
					dest : dest + compressFileName + '.js'
				};
			}
		}
	});

	//console.info(concatConfigs);

	return concatConfigs;
}
