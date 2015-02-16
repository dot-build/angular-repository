module.exports = function(config) {

	config.set({
		colors: true,

		// test results reporter to use
		// possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
		reporters: ['progress', 'coverage'],

		// level of logging
		// possible values: config.LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
		// logLevel: config.LOG_DEBUG,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 60000,

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: false,

		proxies: {
			'/': 'http://localhost:8000/'
		},

		files: [
			'vendor/angular.js',
			'vendor/angular-mocks.js',
			'vendor/es5-shim.min.js',
			'vendor/EventEmitter.js',
			'vendor/JSONHttpRequest.js',
			'vendor/jasmine-fixtures.js',
			'src/module.js',
			'src/**/*.js',
			// 'integration/**/*.js',
			'test/unit/**/*.spec.js',
			// 'test/integration/**/*.spec.js'
		],

		exclude: [],

		urlRoot: '/__karma__/',

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		// frameworks to use
		browsers: ['PhantomJS'],

		frameworks: ['jasmine'],

		// web server port
		port: 9800,

		// NOTE: the "**/" portion is essential to get the coverage results
		preprocessors: {
			'**/src/**/*.js': ['ngannotations', 'coverage'],
			'**/integration/**/*.js': ['ngannotations']
		},

		coverageReporter: {
			type: 'html',
			dir: 'test/coverage/'
		}
	});
};
