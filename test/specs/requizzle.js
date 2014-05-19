/*global describe, expect, it */
'use strict';

var path = require('path');
var util = require('util');

var INFECTED_STRING = 'Infected!';

function addInfected(targetPath, parentModule) {
	return util.format('exports.infected = "%s";\n', INFECTED_STRING);
}

// Load the Jasmine-style matchers as globals
require('expectations');

describe('requizzle', function() {
	var requizzle = require('../..');

	it('should exist', function() {
		expect(requizzle).toBeDefined();
	});

	it('should be a function', function() {
		expect(typeof requizzle).toBe('function');
	});

	describe('basic functionality', function() {
		it('should return "module.exports"', function() {
			var hello = requizzle('../fixtures/simple');

			expect(hello).toBe('Hello world!');
		});

		it('should not infect required modules by default', function() {
			var options = {
				extras: {
					before: addInfected
				}
			};
			var parent = requizzle('../fixtures/parent', options);

			expect(parent.infected).toBe('Infected!');
			expect(parent.child.infected).toBe('Not infected!');
		});

		it('should not infect native modules', function() {
			var options = {
				extras: {
					before: addInfected
				}
			};
			var nativeModule = requizzle('path', options);

			expect(nativeModule.infected).not.toBeDefined();
		});

		it('should throw an error if the filepath is not a string', function() {
			function badFilepath() {
				requizzle({});
			}

			expect(badFilepath).toThrow();
		});
	});

	describe('wrappers', function() {
		describe('extras wrapper', function() {
			it('should insert code before the module when requested', function() {
				var options = {
					extras: {
						before: function(targetPath, parentModule) {
							return 'exports.before = "before";\n';
						}
					}
				};
				var extras = requizzle('../fixtures/extras', options);

				expect(extras.before).toBeDefined();
				expect(extras.before).toBe('before');
			});

			it('should insert code after the module when requested', function() {
				var options = {
					extras: {
						after: function(targetPath, parentModule) {
							return 'exports.after = "after";\n';
						}
					}
				};
				var extras = requizzle('../fixtures/extras', options);

				expect(extras.after).toBe('after');
			});

			it('should do nothing if the "extras" options are omitted', function() {
				function nullExtras() {
					var options = {
						extras: null
					};
					return requizzle('../fixtures/extras', options);
				}

				var expectedString = 'fail';

				expect(nullExtras).not.toThrow();
				expect(nullExtras().before).toBe(expectedString);
				expect(nullExtras().after).toBe(expectedString);
			});
		});

		describe('requirepaths wrapper', function() {
			it('should search the extra require paths for modules', function() {
				var options = {
					requirePaths: [path.resolve(__dirname, '../fixtures/subdir')]
				};

				function requireWithPaths() {
					return requizzle('../fixtures/hello-parent', options);
				}

				expect(requireWithPaths).not.toThrow();
				expect(requireWithPaths().greeting).toBe('Hello world!');
			});

			it('should work if a require path in the module omits the leading dot', function() {
				var options = {
					requirePaths: [path.join(__dirname, '..', 'fixtures')]
				};

				function noLeadingDot() {
					return requizzle('../fixtures/noleadingdot', options);
				}

				expect(noLeadingDot).not.toThrow();
				expect(noLeadingDot()).toBeDefined();
				expect(noLeadingDot().child).toBe('Child module');
			});

			it('should work for modules with no parent', function() {
				var options = {
					requirePaths: [path.join(__dirname, '..', 'fixtures')]
				};
				var r = require('../../lib/requizzle');

				function noParent() {
					return r(path.resolve(__dirname, '../fixtures/simple'), null, options);
				}

				expect(noParent).not.toThrow();
				expect(noParent()).toBe('Hello world!');
			});
		});

		describe('strict wrapper', function() {
			it('should preserve "use strict" declarations for entire files', function() {
				function requireStrict() {
					requizzle('../fixtures/strict.js');
				}

				expect(requireStrict).toThrow();
			});

			it('should not add "use strict" declarations to files without them', function() {
				function requireNoStrict() {
					requizzle('../fixtures/nostrict.js');
				}

				expect(requireNoStrict).not.toThrow();
			});
		});
	});

	describe('infect option', function() {
		var infectOptions = {
			extras: {
				before: addInfected
			},
			infect: true
		};

		it('should cause all descendants to inherit changes from the parent', function() {
			var parent = requizzle('../fixtures/parent', infectOptions);

			expect(parent.infected).toBe(INFECTED_STRING);
			expect(parent.child.infected).toBe(INFECTED_STRING);
			expect(parent.child.grandchild.infected).toBe(INFECTED_STRING);
		});

		it('should support circular requires', function() {
			function circularRequire() {
				return requizzle('../fixtures/circular-1', infectOptions);
			}

			expect(circularRequire).not.toThrow();
			expect(circularRequire()).toBe('Hello world!');
		});


	});
});
