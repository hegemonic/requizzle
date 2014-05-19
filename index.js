'use strict';

var r = require('./lib/requizzle');

module.exports = function requizzle(filepath, options) {
	return r(filepath, module.parent, options);
};
module.exports.Requizzle = r.Requizzle;

// force Node.js to reload this module each time it's required, so module.parent is always correct
delete require.cache[__filename];
