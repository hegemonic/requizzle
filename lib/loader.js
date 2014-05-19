'use strict';

var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var Module = require('module');

var originalWrapper = Module.wrapper.slice(0);

function wrap(wrappers, script) {
	return wrappers[0] + script + wrappers[1];
}

function replaceWrapper(wrapperObj) {
	var joiner = '\n';
	var before = wrapperObj.before.join(joiner);
	var after = wrapperObj.after.join(joiner);
	var wrappers = [
		originalWrapper[0] + before,
		after + originalWrapper[1]
	];

	Module.wrap = wrap.bind(null, wrappers);
}

function restoreWrapper() {
	Module.wrap = wrap.bind(null, originalWrapper);
}

var createModule = exports.createModule = function createModule(targetPath, parentModule) {
	return new Module(Module._resolveFilename(targetPath, parentModule), parentModule);
};

/**
 * Wrapper for `require()` to prevent the target module's dependencies from being swizzled.
 *
 * @param {!Module} targetModule - The module that is being swizzled.
 * @param {!function} nodeRequire - The original `require()` method for the target module.
 * @param {!string} filepath - The value passed to `require()`.
 * @return {!Module} The requested module dependency.
 */
function requireProxy(targetModule, nodeRequire, filepath) {
	restoreWrapper();
	targetModule.require = nodeRequire;

	return nodeRequire.call(targetModule, filepath);
}

/**
 * Wrapper for `require()` to swizzle the target module's dependencies, using the same settings as
 * the target module.
 *
 * @param {!Module} targetModule - The module that is being swizzled.
 * @param {!Object} opts - The Requizzle options object.
 * @param {!string} filepath - The value passed to `require()`.
 * @return {!Module} The requested module dependency.
 */
function infectProxy(targetModule, opts, filepath) {
	var moduleExports;
	var Requizzle = require('./requizzle').Requizzle;
	var requizzle = new Requizzle();

	moduleExports = requizzle.requizzle(filepath, targetModule, opts);

	return moduleExports;
}

var load = exports.load = function load(targetPath, parentModule, wrapper, opts) {
	var nodeRequire;
	var targetModule;

	// Handle circular requires, and avoid reloading modules unnecessarily
	if (opts._cache && opts._cache[targetPath]) {
		return opts._cache[targetPath];
	}

	targetModule = createModule(targetPath, parentModule);
	nodeRequire = targetModule.require;

	if (opts.infect) {
		targetModule.require = function(filepath) {
			return infectProxy(targetModule, opts, filepath);
		};
	} else {
		targetModule.require = function(filepath) {
			return requireProxy(targetModule, nodeRequire, filepath);
		};
	}

	// update the wrapper before we load the target module
	replaceWrapper(wrapper);
	// if necessary, cache the target module before we load it, so its dependencies can use the
	// cached module
	if (opts.infect) {
		opts._cache[targetModule.id] = targetModule;
	}

	targetModule.load(targetModule.id);

	// make sure the wrapper is restored even if the target module doesn't load any dependencies
	restoreWrapper();

	return targetModule;
};

/**
 * Check whether the entire module includes a `'use strict'` declaration.
 *
 * @param {string} src - The source file to check.
 * @return {boolean} Set to `true` if the module includes a `use strict` declaration.
 */
function detectStrictMode(src) {
	return (/^\s*(?:["']use strict["'])[ \t]*(?:[\r\n]|;)/g).test(src);
}

exports.createWrapper = function createWrapper(targetPath, parentModule, options) {
	var src;
	var wrapperObject = {
		before: [],
		after: []
	};

	function add(wrapperFunctions, opts) {
		var params = [targetPath, parentModule, opts];

		['before', 'after'].forEach(function(item) {
			var result = wrapperFunctions[item].apply(null, params);

			if (result) {
				wrapperObject[item].push(result);
			}
		});
	}

	// Preserve the module's `use strict` declaration if present
	src = fs.readFileSync(targetPath, 'utf8');
	if (detectStrictMode(src) === true) {
		add(require('./wrappers/strict'));
	}

	if (options.requirePaths) {
		add(require('./wrappers/requirepaths'), options.requirePaths);
	}

	if (options.extras) {
		add(require('./wrappers/extras'), options.extras);
	}

	return wrapperObject;
};
