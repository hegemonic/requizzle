/*global describe, expect, it */
'use strict';

var path = require('path');

// Load the Jasmine-style matchers as globals
require('expectations');

describe('loader', function() {
	var loader = require('../../lib/loader');

	it('should exist', function() {
		expect(loader).toBeDefined();
	});

	it('should be an object', function() {
		expect(typeof loader).toBe('object');
	});

	it('should export a "createWrapper" method', function() {
		expect(loader.createWrapper).toBeDefined();
		expect(typeof loader.createWrapper).toBe('function');
	});

	it('should export a "load" method', function() {
		expect(loader.load).toBeDefined();
		expect(typeof loader.load).toBe('function');
	});

	// wrapper functionality is covered in the `requizzle` tests
	describe('createWrapper', function() {
		it('should return an object with "before" and "after" arrays', function() {
			var wrapper = loader.createWrapper(path.resolve(__dirname, 'requizzle.js'),
				path.resolve(__dirname, 'index.js'), {});

			expect(typeof wrapper).toBe('object');
			expect(wrapper.before).toBeDefined();
			expect(wrapper.after).toBeDefined();
			expect(Array.isArray(wrapper.before)).toBe(true);
			expect(Array.isArray(wrapper.after)).toBe(true);
		});
	});

	// loader functionality is covered in the `requizzle` tests
	describe('load', function() {
		it('should return a Module object', function() {
			var Module = require('module');
			var wrapper = {before: [], after: []};
			var loaded = loader.load(path.resolve(__dirname, 'index.js'), module.parent, wrapper,
				{});

			expect(loaded instanceof Module).toBe(true);
		});
	});
});
