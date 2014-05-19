'use strict';

function callFunction(targetPath, parentModule, func) {
	if (!func) {
		return '';
	}

	return func(targetPath, parentModule);
}

exports.before = function before(targetPath, parentModule, options) {
	return callFunction(targetPath, parentModule, options.before);
};

exports.after = function after(targetPath, parentModule, options) {
	return callFunction(targetPath, parentModule, options.after);
};
