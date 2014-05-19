/*global describe, expect, it */
'use strict';

// Load the Jasmine-style matchers as globals
require('expectations');

describe('index', function() {
	var index = require('../..');

	it('should exist', function() {
		expect(index).toBeDefined();
	});

	it('should be a function', function() {
		expect(typeof index).toBe('function');
	});

	it('should have a "Requizzle" property', function() {
		expect(index.Requizzle).toBeDefined();
	});

	it('should return the module when called with a valid module path', function() {
		var simpleModule = index('../fixtures/simple');

		expect(typeof simpleModule).toBe('string');
		expect(simpleModule).toBe('Hello world!');
	});

	describe('Requizzle', function() {
		var Requizzle = index.Requizzle;

		it('should be a function', function() {
			expect(typeof Requizzle).toBe('function');
		});

		it('should return a Requizzle instance when called with "new"', function() {
			expect((new Requizzle()) instanceof Requizzle).toBe(true);
		});
	});
});
