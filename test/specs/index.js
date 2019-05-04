/*
    Copyright (c) 2014 Google Inc. All rights reserved.

    Use of this source code is governed by the MIT License, available in this package's LICENSE file
    or at http://opensource.org/licenses/MIT.
 */
// Load the Jasmine-style matchers as globals
require('expectations');

describe('index', () => {
    const requizzle = require('../..');

    it('should exist', () => {
        expect(requizzle).toBeDefined();
    });

    it('should be a function', () => {
        expect(typeof requizzle).toBe('function');
    });

    it('should have a Requizzle property', () => {
        expect(requizzle.Requizzle).toBeDefined();
    });

    it('should throw an error when the "options" parameter is missing', () => {
        function missingOptions() {
            return requizzle();
        }

        expect(missingOptions).toThrow();
    });

    it('should throw an error when the "options" parameter is not an object', () => {
        function badOptions() {
            return requizzle('hi');
        }

        expect(badOptions).toThrow();
    });

    describe('Requizzle', () => {
        it('should be a function', () => {
            expect(typeof requizzle.Requizzle).toBe('function');
        });

        it('should return a new Requizzle instance when called with "new"', () => {
            function newInstance() {
                return new requizzle.Requizzle({});
            }

            expect(newInstance).not.toThrow();
            expect(newInstance() instanceof requizzle.Requizzle).toBe(true);
        });
    });
});
