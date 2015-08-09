/* jshint node:true, strict: false */
var gulp = require('gulp'),
	fs = require('fs'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	diAnnotations = require('angular-di-annotations'),
	annotations = diAnnotations.Stream,
	wrap = require('gulp-wrap'),
	pipeline = require('multipipe'),
	karma = require('karma').server,

	wrapper = {
		angular: fs.readFileSync('./wrappers/angular.js').toString(),
		handbag: fs.readFileSync('./wrappers/handbag.js').toString()
	};

diAnnotations.logger.enabled = false;

var PATH = {
	sourceFiles: ['src/module.js', 'src/**/*.js'],
	dist: 'dist',
	distFile: 'repository.js',
	karmaUnit: __dirname + '/karma.conf.js'
};

gulp.task('min', function() {
	diAnnotations.constants.MODULE = 'modl';
	diAnnotations.constants.INJECTABLE = "%module%.%type%('%name%', %value%);";

	var pipe = pipeline(
		gulp.src(PATH.sourceFiles),
		annotations(),
		concat(PATH.distFile),
		wrap(wrapper.angular),
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

gulp.task('minhbag', function() {
	diAnnotations.constants.MODULE = '';
	diAnnotations.constants.INJECTABLE = "handbag.provide('%name%', %value%);";

	var pipe = pipeline(
		gulp.src(PATH.sourceFiles),
		annotations(),
		concat(PATH.distFile),
		wrap(wrapper.handbag),
		rename({
			basename: 'repository-handbag'
		}),
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
	'vendor/angular/angular.js',
	'vendor/angular-mocks/angular-mocks.js',
	'vendor/es5-shim/es5-shim.js',
	'vendor/da-event-emitter/src/EventEmitter.js',
	'test/JSONHttpRequest.js',
	'test/jasmine-fixtures.js'
];

var fixtures = {
	pattern: 'test/fixtures/**/*.json',
	watched: true,
	served: true,
	included: false
};

var unitFiles = vendorFiles.concat([
	fixtures,
	'test/module.js',
	'src/**/*.js',
	'test/setup.js',
	'test/unit/**/*.spec.js',
]);

var integrationFiles = vendorFiles.concat([fixtures,
	'test/module.js',
	'src/**/*.js',
	'test/setup.js',
	'integration/module.js',
	'integration/*.js',

	'test/integration/*.spec.js'
]);

// @see https://github.com/karma-runner/gulp-karma#do-we-need-a-plugin
gulp.task('unit', function(done) {
	diAnnotations.constants.MODULE = 'angular.module("repository")';
	diAnnotations.constants.INJECTABLE = "%module%.%type%('%name%', %value%);";
	karma.start({
		configFile: PATH.karmaUnit,
		singleRun: true,
		files: unitFiles
	}, done);
});

gulp.task('tdd', function(done) {
	diAnnotations.constants.MODULE = 'angular.module("repository")';
	diAnnotations.constants.INJECTABLE = "%module%.%type%('%name%', %value%);";
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
gulp.task('build', ['min']);
gulp.task('buildhbag', ['minhbag']);
gulp.task('default', ['tdd']);
