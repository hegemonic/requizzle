'use strict';

var _ = require('underscore');
var Requizzle = require('./lib/requizzle');

module.exports = function requizzle(options) {
	var instance;

	if (!options || typeof options !== 'object') {
		throw new TypeError('Requizzle\'s options parameter must be a non-null object.');
	}
	options = _.clone(options);
	options.parent = module.parent;

	return function(filepath) {
		instance = instance || new Requizzle(options);
		return instance.requizzle(filepath);
	};
};
module.exports.Requizzle = Requizzle;

// force Node.js to reload this module each time it's required, so module.parent is always correct
delete require.cache[__filename];
