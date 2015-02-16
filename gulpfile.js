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

	// NOTE: don't join the template strings, it will break Slush!
	wrapper = '(function(undefined){\n\n<' + '%= contents %>\n}());';

diAnnotations.logger.enabled = false;
diAnnotations.constants.MODULE = 'angular.module(\'repository\')';

gulp.task('min', function() {
	var pipe = pipeline(
		gulp.src(['src/module.js', 'src/**/!(*spec).js']),
		annotations(),
		concat('app.js'),
		wrap(wrapper),
		gulp.dest('public'),
		uglify(),
		rename({
			suffix: '.min'
		}),
		gulp.dest('public')
	);

	pipe.on('error', createLogger('min'));
	return pipe;
});

gulp.task('sass', function() {
	var pipe = pipeline(
		gulp.src('scss/**/*.scss'),
		sass({
			outputStyle: 'nested',
			errLogToConsole: true
		}),
		concat('app.css'),
		gulp.dest('public')
	);

	pipe.on('error', createLogger('sass'));
	return pipe;
});

gulp.task('mocks', function() {
	var pipe = pipeline(
		gulp.src(['mocks/module.js', 'mocks/**/*.js']),
		concat('mocks.js'),
		wrap(wrapper),
		gulp.dest('public')
	);

	pipe.on('error', createLogger('mocks'));
	return pipe;
})


gulp.task('views', function() {
	var pipe = pipeline(
		gulp.src('views/**/*.html'),
		templateCache({
			output: 'views.js',
			strip: 'views',
			moduleName: 'app',
			minify: {
				collapseBooleanAttributes: true,
				collapseWhitespace: true
			}
		}),
		gulp.dest('public')
	);

	pipe.on('error', createLogger('views'));
	return pipe;
});

gulp.task('serve', function() {
	require('./server');
});

// @see https://github.com/karma-runner/gulp-karma#do-we-need-a-plugin
gulp.task('test', function(done) {
	karma.start({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	}, done);
});

gulp.task('tdd', function(done) {
	karma.start({
		configFile: __dirname + '/karma.conf.js',
		singleRun: false
	}, done);
});

gulp.task('watch', function() {
	livereload.listen();

	function handleChanges(stream) {
		stream.on('change', livereload.changed);
	}

	handleChanges(gulp.watch('src/**/*.js', ['min']));
	handleChanges(gulp.watch('scss/**/*.scss', ['sass']));
	handleChanges(gulp.watch('views/**/*.html', ['views']));
	handleChanges(gulp.watch('mocks/**/*.js', ['mocks']));
});

gulp.task('build', ['min', 'sass', 'mocks', 'views']);

gulp.task('default', ['min', 'sass', 'mocks', 'views', 'watch']);

function createLogger(name) {
	return function() {
		var i = arguments.length,
			args = new Array(i);

		while (i--) args[i] = arguments[i];

		args.unshift(colors.red('>>' + name) + ': ');
		log.apply(null, args);
	};
}
