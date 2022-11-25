/*
    Copyright 2014 Google LLC

    Use of this source code is governed by the MIT License, available in this package's LICENSE file
    or at http://opensource.org/licenses/MIT.
 */
const path = require('path');
const util = require('util');

const INFECTED_STRING = 'Infected!';

function addInfected() {
  return util.format('exports.infected = "%s";\n', INFECTED_STRING);
}

function newRequizzle(options) {
  return require('../..')(options);
}

// Load the Jasmine-style matchers as globals
require('expectations');

describe('requizzle', () => {
  describe('basic functionality', () => {
    it('should return "module.exports"', () => {
      const requizzle = newRequizzle({});
      const hello = requizzle('../fixtures/simple');

      expect(hello).toBe('Hello world!');
    });

    it('should not infect required modules by default', () => {
      const options = {
        extras: {
          before: addInfected,
        },
      };
      const requizzle = newRequizzle(options);
      const parent = requizzle('../fixtures/parent');

      expect(parent.infected).toBe('Infected!');
      expect(parent.child.infected).toBe('Not infected!');
    });

    it('should not infect native modules', () => {
      const options = {
        extras: {
          before: addInfected,
        },
      };
      const requizzle = newRequizzle(options);
      const nativeModule = requizzle('path');

      expect(nativeModule.infected).not.toBeDefined();
    });

    it('should not infect `node:` imports of native modules', () => {
      if (process.version.split('.')[0] >= '18') {
        const options = {
          extras: {
            before: addInfected,
          },
        };
        const requizzle = newRequizzle(options);
        const nativeModule = requizzle('node:fs');

        expect(nativeModule.infected).not.toBeDefined();
      }
    });

    it('should throw an error if the filepath is not a string', () => {
      function badFilepath() {
        const requizzle = newRequizzle({});

        requizzle({});
      }

      expect(badFilepath).toThrow();
    });
  });

  describe('wrappers', () => {
    describe('extras wrapper', () => {
      it('should insert code before the module when requested', () => {
        const options = {
          extras: {
            before() {
              return 'exports.before = "before";\n';
            },
          },
        };
        const requizzle = newRequizzle(options);
        const extras = requizzle('../fixtures/extras');

        expect(extras.before).toBeDefined();
        expect(extras.before).toBe('before');
      });

      it('should insert code after the module when requested', () => {
        const options = {
          extras: {
            after() {
              return 'exports.after = "after";\n';
            },
          },
        };
        const requizzle = newRequizzle(options);
        const extras = requizzle('../fixtures/extras');

        expect(extras.after).toBe('after');
      });

      it('should do nothing if the "extras" options are omitted', () => {
        function nullExtras() {
          const options = {
            extras: null,
          };
          const requizzle = newRequizzle(options);

          return requizzle('../fixtures/extras');
        }

        const expectedString = 'fail';

        expect(nullExtras).not.toThrow();
        expect(nullExtras().before).toBe(expectedString);
        expect(nullExtras().after).toBe(expectedString);
      });
    });

    describe('requirepaths wrapper', () => {
      it('should search the extra require paths for modules', () => {
        const options = {
          requirePaths: [path.resolve(__dirname, '../fixtures/subdir')],
        };

        function requireWithPaths() {
          const requizzle = newRequizzle(options);

          return requizzle('../fixtures/hello-parent');
        }

        expect(requireWithPaths).not.toThrow();
        expect(requireWithPaths().greeting).toBe('Hello world!');
      });

      it('should put the extra paths first so they get searched first', () => {
        const extraPath = '/foo/bar/baz';
        const options = {
          requirePaths: [extraPath],
        };
        const requizzle = newRequizzle(options);
        const modulePaths = requizzle('../fixtures/modulepaths');

        expect(modulePaths[0]).toBe(extraPath);
      });

      it('should accept an object with "before" and "after" arrays', () => {
        const extraPaths = {
          before: ['/foo/bar/baz'],
          after: ['/bar/baz/qux'],
        };
        const options = {
          requirePaths: extraPaths,
        };
        const requizzle = newRequizzle(options);
        const modulePaths = requizzle('../fixtures/modulepaths');

        expect(modulePaths[0]).toBe(extraPaths.before[0]);
        expect(modulePaths[modulePaths.length - 1]).toBe(extraPaths.after[0]);
      });

      it('should accept an object that omits the "before" array', () => {
        const afterPath = '/bar/baz/qux';
        let modulePaths;

        function getModulePaths() {
          const requizzle = newRequizzle({
            requirePaths: {
              after: [afterPath],
            },
          });

          return requizzle('../fixtures/modulepaths');
        }

        expect(getModulePaths).not.toThrow();

        modulePaths = getModulePaths();
        expect(modulePaths[modulePaths.length - 1]).toBe(afterPath);
      });

      it('should accept an object that omits the "after" array', () => {
        const beforePath = '/foo/bar/baz';
        let modulePaths;

        function getModulePaths() {
          const requizzle = newRequizzle({
            requirePaths: {
              before: [beforePath],
            },
          });

          return requizzle('../fixtures/modulepaths');
        }

        expect(getModulePaths).not.toThrow();

        modulePaths = getModulePaths();
        expect(modulePaths[0]).toBe(beforePath);
      });

      it('should accept an empty object', () => {
        function getModulePaths() {
          const requizzle = newRequizzle({
            requirePaths: {},
          });

          return requizzle('../fixtures/modulepaths');
        }

        expect(getModulePaths).not.toThrow();
      });

      it('should work if a require path in the module omits the leading dot', () => {
        const options = {
          requirePaths: [path.join(__dirname, '..', 'fixtures')],
        };

        function noLeadingDot() {
          const requizzle = newRequizzle(options);

          return requizzle('../fixtures/noleadingdot');
        }

        expect(noLeadingDot).not.toThrow();
        expect(noLeadingDot()).toBeDefined();
        expect(noLeadingDot().child).toBe('Child module');
      });

      it('should work for modules with no parent', () => {
        const options = {
          requirePaths: [path.join(__dirname, '..', 'fixtures')],
        };
        const requizzle = new (require('../../lib/requizzle'))(options);

        function noParent() {
          return requizzle.requizzle(path.resolve(__dirname, '../fixtures/simple'));
        }

        expect(noParent).not.toThrow();
        expect(noParent()).toBe('Hello world!');
      });
    });

    describe('strict wrapper', () => {
      it('should preserve "use strict" declarations for entire files', () => {
        function requireStrict() {
          const requizzle = newRequizzle({});

          requizzle('../fixtures/strict.js');
        }

        expect(requireStrict).toThrow();
      });

      it('should not add "use strict" declarations to files without them', () => {
        function requireNoStrict() {
          const requizzle = newRequizzle({});

          requizzle('../fixtures/nostrict.js');
        }

        expect(requireNoStrict).not.toThrow();
      });
    });
  });

  describe('infect option', () => {
    const infectOptions = {
      extras: {
        before: addInfected,
      },
      infect: true,
    };

    it('should cause all descendants to inherit changes from the parent', () => {
      const requizzle = newRequizzle(infectOptions);
      const parent = requizzle('../fixtures/parent');

      expect(parent.infected).toBe(INFECTED_STRING);
      expect(parent.child.infected).toBe(INFECTED_STRING);
      expect(parent.child.grandchild.infected).toBe(INFECTED_STRING);
    });

    it('should support circular requires', () => {
      function circularRequire() {
        const requizzle = newRequizzle(infectOptions);

        return requizzle('../fixtures/circular-1');
      }

      expect(circularRequire).not.toThrow();
      expect(circularRequire()).toBe('Hello world!');
    });
  });
});
