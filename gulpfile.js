/* jshint node:true, strict: false */
var gulp = require('gulp'),
	util = require('gulp-util'),
	concat = require('gulp-concat'),
	sass = require('gulp-sass'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	templateCache = require('gulp-templatecache'),
	diAnnotations = require('angular-di-annotations'),
	annotations = diAnnotations.Stream,
	wrap = require('gulp-wrap'),
	pipeline = require('multipipe'),
	colors = util.colors,
	log = util.log,
	livereload = require('gulp-livereload'),
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

gulp.task('min', ['test'], function() {
	return pipeline(
		gulp.src(PATH.sourceFiles),
		annotations(),
		concat(PATH.distFile),
		wrap(wrapper),
		gulp.dest(PATH.dist),
		uglify(),
		rename({
			suffix: '.min'
		}),
		gulp.dest(PATH.dist),
		createLogger('min')
	);
});

gulp.task('serve', function() {
	require('./server');
});

// @see https://github.com/karma-runner/gulp-karma#do-we-need-a-plugin
gulp.task('test', function(done) {
	karma.start({
		configFile: PATH.karmaUnit,
		singleRun: true
	}, done);
});

gulp.task('tdd', function(done) {
	karma.start({
		configFile: PATH.karmaUnit,
		singleRun: false,
		autoWatch: true
	}, done);
});

gulp.task('watch', function() {
	livereload.listen();

	function handleChanges(stream) {
		stream.on('change', livereload.changed);
	}

	handleChanges(gulp.watch('src/**/*.js', ['min']));
});

gulp.task('build', ['min']);
gulp.task('default', ['test', 'min', 'watch']);

function createLogger(name) {
	return function() {
		var i = arguments.length,
			args = new Array(i);

		while (i--) args[i] = arguments[i];

		args.unshift(colors.red('>>' + name) + ': ');
		log.apply(null, args);
	};
}
