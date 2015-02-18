/* jshint node:true, strict: false */
var gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	diAnnotations = require('angular-di-annotations'),
	annotations = diAnnotations.Stream,
	wrap = require('gulp-wrap'),
	pipeline = require('multipipe'),
	karma = require('karma').server,

	wrapper = '(function(undefined){\n\n<%= contents %>\n}());';

diAnnotations.logger.enabled = false;
diAnnotations.constants.MODULE = 'angular.module(\'repository\')';

var PATH = {
	sourceFiles: ['src/module.js', 'src/**/*.js'],
	dist: 'dist',
	distFile: 'repository.js',
	karmaUnit: __dirname + '/karma.conf.js'
};

gulp.task('min', function() {
	var pipe = pipeline(
		gulp.src(PATH.sourceFiles),
		annotations(),
		concat(PATH.distFile),
		wrap(wrapper),
		gulp.dest(PATH.dist),
		uglify(),
		rename({
			suffix: '.min'
		}),
		gulp.dest(PATH.dist)
	);

	pipe.on('error', function(err) {
		console.log(err);
	});

	return pipe;
});

var vendorFiles = [
	'vendor/angular.js',
	'vendor/angular-mocks.js',
	'vendor/es5-shim.min.js',
	'vendor/EventEmitter.js',
	'vendor/JSONHttpRequest.js',
	'vendor/jasmine-fixtures.js'
];

var fixtures = {
	pattern: '**/test/fixtures/**/*.json',
	watched: true,
	served: true,
	included: false
};

var unitFiles = vendorFiles.concat([
	fixtures,
	'src/module.js',
	'src/**/*.js',
	'test/setup.js',
	'test/unit/**/*.spec.js',
]);

var integrationFiles = vendorFiles.concat([fixtures,
	'src/module.js',
	'src/**/*.js',
	'test/setup.js',
	'integration/module.js',
	'integration/*.js',

	'test/integration/*.spec.js'
]);

// @see https://github.com/karma-runner/gulp-karma#do-we-need-a-plugin
gulp.task('unit', function(done) {
	karma.start({
		configFile: PATH.karmaUnit,
		singleRun: true,
		files: unitFiles
	}, done);
});

gulp.task('tdd', function(done) {
	karma.start({
		configFile: PATH.karmaUnit,
		singleRun: false,
		autoWatch: true,
		files: unitFiles
	}, done);
});

gulp.task('integration', ['unit'], function(done) {
	karma.start({
		configFile: PATH.karmaUnit,
		singleRun: true,
		files: integrationFiles
	}, done);
});

gulp.task('integration-tdd', ['unit'], function(done) {
	karma.start({
		configFile: PATH.karmaUnit,
		singleRun: false,
		autoWatch: true,
		files: integrationFiles
	}, done);
});

gulp.task('test', ['integration']);
gulp.task('build', ['test', 'min']);
gulp.task('default', ['tdd']);
