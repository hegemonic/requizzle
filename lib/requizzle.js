'use strict';

/** @module lib/requizzle */

var _ = require('underscore');
var loader = require('./loader');
var Module = require('module');
var path = require('path');

var defaultInstance;
var defaultOptions = {
	_cache: {}
};

/**
 * Function that returns text to swizzle into the module.
 *
 * @typedef module:lib/requizzle~wrapperFunction
 * @type {function}
 * @param {string} targetPath - The path to the target module.
 * @param {string} parentModulePath - The path to the module that is requiring the target module.
 * @return {string} The text to insert before or after the module's source code.
 */

/**
 * Options for the wrappers that will be swizzled into the target module.
 *
 * @typedef module:lib/requizzle~options
 * @type {Object}
 * @property {Object=} options.extras - Functions that generate text to swizzle into the target
 * module.
 * @property {module:lib/requizzle~wrapperFunction} options.extras.after - Function that returns
 * text to insert after the module's source code.
 * @property {module:lib/requizzle~wrapperFunction} options.extras.before - Function that returns
 * text to insert before the module's source code.
 * @property {(Array.<string>|string)} options.requirePaths - Additional paths to search when
 * resolving module paths in the target module.
 */

function isNativeModule(targetPath, parentModule) {
	var lookupPaths = Module._resolveLookupPaths(targetPath, parentModule);

	if (lookupPaths[0] === targetPath && lookupPaths[1].length === 0) {
		return true;
	}

	return false;
}

/**
 * Load the module, swizzling in the requested features.
 *
 * @param {!string} targetPath - The path to the module that will be loaded.
 * @param {!Module} parentModule - The parent module.
 * @param {!module:lib/requizzle~options} opts - Options for swizzling the module.
 * @return {Module} The swizzled module.
 */
function requizzle(targetPath, parentModule, opts) {
	var targetModule;
	var wrapper;

	// Resolve the filename relative to the parent module
	targetPath = Module._resolveFilename(targetPath, parentModule);

	wrapper = loader.createWrapper(targetPath, parentModule, opts);
	targetModule = loader.load(targetPath, parentModule, wrapper, opts);

	return targetModule;
}

/**
 * Create a `Requizzle` instance. If you provide options, Requizzle will default to those options
 * when you call {@link Requizzle#require}.
 *
 * @class
 * @param {module:lib/requizzle~options} options - Options for the wrappers that will be swizzled
 * into the target module.
 */
function Requizzle(options) {
	options = _.extend(options || {}, defaultOptions);

	this.requizzle = function(targetPath, parentModule, opts) {
		var loadedModule;

		if (isNativeModule(targetPath, parentModule)) {
			return require(targetPath);
		}

		opts = _.extend(opts || {}, options);
		loadedModule = requizzle(targetPath, parentModule, opts);

		return loadedModule.exports;
	};

}

defaultInstance = new Requizzle();
module.exports = defaultInstance.requizzle;
module.exports.Requizzle = Requizzle;
