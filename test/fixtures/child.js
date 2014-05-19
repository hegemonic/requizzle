'use strict';

exports.child = 'Child module';
exports.grandchild = require('./grandchild');
exports.infected = exports.infected || 'Not infected!';
exports.parentId = module.parent.id;
