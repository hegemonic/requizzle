'use strict';

var path = require('path');

function requirePaths(parentModule, paths) {
	if (!parentModule) {
		return paths;
	}

	return paths.slice(0).map(function(p) {
		return path.resolve(parentModule.filepath, p);
	});
}

exports.before = function before(targetPath, parentModule, opts) {
	var resolvedPaths = requirePaths(parentModule, opts);
	return 'module.paths = module.paths.concat(' + JSON.stringify(resolvedPaths) + ');\n';
};

exports.after = function after(targetPath, parentModule, opts) {
	return '';
};
