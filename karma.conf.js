module.exports = function(config) {

	config.set({
		colors: true,
		reporters: ['progress', 'coverage'],

		// possible values: config.LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
		// logLevel: config.LOG_DEBUG,

		captureTimeout: 60000,

		exclude: [],

		browsers: ['PhantomJS'],
		frameworks: ['jasmine'],
		port: 9800,

		preprocessors: {
			'src/**/!(*EventEmitter).js': ['ngannotations', 'coverage'],
			'integration/**/*.js': ['ngannotations']
		},

		coverageReporter: {
			type: 'html',
			dir: 'test/coverage/'
		}
	});
};
