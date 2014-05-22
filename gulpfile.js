/*
	Copyright (c) 2014 Google Inc. All rights reserved.

	Use of this source code is governed by the MIT License, available in this package's LICENSE file
	or at http://opensource.org/licenses/MIT.
 */
'use strict';

var eslint = require('gulp-eslint');
var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var istanbulEnforcer = require('gulp-istanbul-enforcer');
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
			statements: 100,
			branches: 100,
			lines: 100,
			functions: 100
		},
		coverageDirectory: 'coverage',
		rootDirectory: ''
	};

	gulp.src(paths.code)
		.pipe(istanbul())
		.on('finish', function() {
			gulp.src(paths.testSpecs)
				.pipe(mocha())
				.pipe(istanbul.writeReports())
				.pipe(istanbulEnforcer(enforcerOptions))
				.on('error', function(err) {
					cb(err);
				})
				.on('finish', cb);
		});
});

gulp.task('lint', function() {
	gulp.src(paths.lint)
		.pipe(eslint())
		.pipe(eslint.format());
});

gulp.task('test', ['mocha-coverage', 'lint']);
gulp.task('default', ['test']);
