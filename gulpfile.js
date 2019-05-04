/*
    Copyright (c) 2014 Google Inc. All rights reserved.

    Use of this source code is governed by the MIT License, available in this package's LICENSE file
    or at http://opensource.org/licenses/MIT.
 */
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const gulpMocha = require('gulp-mocha');

const paths = {
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

function mocha(cb) {
    gulp.src(paths.testSpecs)
        .pipe(gulpMocha());

    cb();
}

function lint(cb) {
    gulp.src(paths.lint)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());

    cb();
}

exports.lint = lint;
exports.mocha = mocha;
exports.test = gulp.series(mocha, lint);

exports.default = exports.test;
