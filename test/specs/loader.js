/*
    Copyright 2014 Google LLC

    Use of this source code is governed by the MIT License, available in this package's LICENSE file
    or at http://opensource.org/licenses/MIT.
 */
const path = require('path');

// Load the Jasmine-style matchers as globals
require('expectations');

describe('loader', () => {
  let cacheStub;
  const loader = require('../../lib/loader');

  beforeEach(() => {
    cacheStub = {
      module: {},
      source: {},
    };
  });

  it('should exist', () => {
    expect(loader).toBeDefined();
  });

  it('should be an object', () => {
    expect(typeof loader).toBe('object');
  });

  it('should export a "createWrapper" method', () => {
    expect(loader.createWrapper).toBeDefined();
    expect(typeof loader.createWrapper).toBe('function');
  });

  it('should export a "load" method', () => {
    expect(loader.load).toBeDefined();
    expect(typeof loader.load).toBe('function');
  });

  // wrapper functionality is covered in the `requizzle` tests
  describe('createWrapper', () => {
    it('should return an object with "before" and "after" arrays', () => {
      const wrapper = loader.createWrapper(
        path.resolve(__dirname, 'requizzle.js'),
        path.resolve(__dirname, 'index.js'),
        cacheStub,
        {}
      );

      expect(typeof wrapper).toBe('object');
      expect(wrapper.before).toBeDefined();
      expect(wrapper.after).toBeDefined();
      expect(Array.isArray(wrapper.before)).toBe(true);
      expect(Array.isArray(wrapper.after)).toBe(true);
    });
  });

  // loader functionality is covered in the `requizzle` tests
  describe('load', () => {
    it('should return a Module object', () => {
      const Module = require('module');
      const wrapper = {
        before: [],
        after: [],
      };
      const loaded = loader.load(
        path.resolve(__dirname, 'index.js'),
        module.parent,
        wrapper,
        cacheStub,
        {}
      );

      expect(loaded instanceof Module).toBe(true);
    });
  });
});
