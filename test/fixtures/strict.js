'use strict';

var myObject = module.exports = {};

// Writing to the `hello` property will throw a `TypeError` in strict mode.
Object.defineProperty(myObject, 'hello', {
    writable: false
});

myObject.hello = 'world';
