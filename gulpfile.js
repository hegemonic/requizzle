/*
	Copyright (c) 2014 Google Inc. All rights reserved.

	Use of this source code is governed by the MIT License, available in this package's LICENSE file
	or at http://opensource.org/licenses/MIT.
 */
'use strict';

var eslint = require('gulp-eslint');
var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

var paths = {
	code: [
		'*.js',
		'lib/**/*.js'
	],
	lint: [
		'*.js',
		'lib/**/*.js',
		'test/**/*.js'
	],
	testSpecs: ['test/specs/*.js']
};

gulp.task('mocha', function() {
	gulp.src(paths.testSpecs)
		.pipe(mocha());
});

gulp.task('mocha-coverage', function(cb) {
	var enforcerOptions = {
		thresholds: {
			global: 100
		}
	};

	gulp.src(paths.code)
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on('finish', function() {
			gulp.src(paths.testSpecs)
				.pipe(mocha())
				.pipe(istanbul.writeReports())
				.pipe(istanbul.enforceThresholds(enforcerOptions))
				.on('error', function(err) {
					cb(err);
				})
				.on('finish', cb);
		});
});

gulp.task('lint', function() {
	gulp.src(paths.lint)
		.pipe(eslint())
		.pipe(eslint.failAfterError())
		.pipe(eslint.format());
});

gulp.task('test', ['mocha-coverage', 'lint']);
gulp.task('default', ['test']);
