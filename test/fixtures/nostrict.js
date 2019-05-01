var myObject = module.exports = {};

// Writing to the `hello` property will be silently ignored in non-strict mode.
Object.defineProperty(myObject, 'hello', {
    writable: false
});

myObject.hello = 'world';
