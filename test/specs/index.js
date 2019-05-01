/*
	Copyright (c) 2014 Google Inc. All rights reserved.

	Use of this source code is governed by the MIT License, available in this package's LICENSE file
	or at http://opensource.org/licenses/MIT.
 */
/* global describe, expect, it */
'use strict';

// Load the Jasmine-style matchers as globals
require('expectations');

describe('index', function() {
	var requizzle = require('../..');

	it('should exist', function() {
		expect(requizzle).toBeDefined();
	});

	it('should be a function', function() {
		expect(typeof requizzle).toBe('function');
	});

	it('should have a Requizzle property', function() {
		expect(requizzle.Requizzle).toBeDefined();
	});

	it('should throw an error when the "options" parameter is missing', function() {
		function missingOptions() {
			return requizzle();
		}

		expect(missingOptions).toThrow();
	});

	it('should throw an error when the "options" parameter is not an object', function() {
		function badOptions() {
			return requizzle('hi');
		}

		expect(badOptions).toThrow();
	});

	describe('Requizzle', function() {
		it('should be a function', function() {
			expect(typeof requizzle.Requizzle).toBe('function');
		});

		it('should return a new Requizzle instance when called with "new"', function() {
			function newInstance() {
				return new requizzle.Requizzle({});
			}

			expect(newInstance).not.toThrow();
			expect(newInstance() instanceof requizzle.Requizzle).toBe(true);
		});
	});
});
