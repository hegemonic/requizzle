# Requizzle #

Swizzle a little something into your Node.js modules.


## What's Requizzle? ##

Requizzle provides a drop-in replacement for Node.js's `require()` function. This replacement
allows you to change a module's source code at runtime.

You can use Requizzle in your test cases, or in production code if you like to live dangerously.
Requizzle has been tested with Node.js 0.10 and 0.11.


## How can I change a module with Requizzle? ##

There are several different ways:

### Look for modules in new places ###

With Requizzle, you can add directories to the module lookup path, which forces Node.js to search
those directories for modules. This can be useful if:

+ You're tired of writing code like `require('../../../../../lib/foo')`.
+ You want to expose your app's modules to external plugins. (Without Requizzle, it can be tough to
do this if the plugin is located outside of your app directory.)

### Add code before or after the module's source code ###

Tamper with modules to your heart's delight by adding arbitrary code before or after the module's
own source code.

### Mess with child modules ###

When you use Requizzle to require a module, you can force each child module's `require` method to
inherit your changes to the parent module. (By default, only the parent module is changed.)


## Will Requizzle break my dependencies? ##

Probably not. It's true that Requizzle gives you plenty of new and exciting ways to tamper with, and
possibly break, your module dependencies. But Requizzle also tries not to break anything on its own.
In particular:

+ **Requizzle preserves strict-mode declarations**.  If a module starts with a strict-mode
declaration, Requizzle keeps it in place. Your changes will appear after the strict-mode
declaration.
+ **Requizzle leaves native modules alone**. If you use Requizzle to load one of Node.js's built-in
modules, such as `fs` or `path`, Requizzle won't mess with it.


## Installation ##

With npm:

    npm install requizzle

With git:

    git clone git://github.com/hegemonic/requizzle.git
    cd requizzle
    npm install


## Usage ##

The Requizzle module exports a single function, which returns a drop-in replacement for
`require()`.

When you call the function, you must pass in an `options` object, which can include any of these
properties:

+ `extras`: A pair of functions that return text to insert before or after the module's source code.
Each function accepts two parameters: `targetPath`, the path to the required module, and
`parentModule`, the `Module` object for the module's parent. Each function must return a string.
    + `extras.before`: A function that returns text to insert before the module's source code.
    + `extras.after`: A function that returns text to insert after the module's source code.
+ `infect`: Determines whether child modules are infected with the same changes as the parent
module. Set to `true` to force child modules to inherit your changes. Defaults to `false`.
+ `requirePaths`: An array of additional paths to search for required modules. For example, if
`requirePaths` is set to `['/usr/lib/junk/modules']`, and you save a JavaScript module at
`/usr/lib/junk/modules/mymodule.js`, you can require the module as `mymodule`. By default, the
require path is not changed.


## Examples ##

```js
var requizzle = require('requizzle');

// Say hello and goodbye to each module.
var logRequire = requizzle({
    extras: {
        before: function(targetPath, parentModule) {
            return 'console.log("Hello %s!", ' + targetPath + ');\n';
        },
        after: function(targetPath, parentModule) {
            return 'console.log("Goodbye %s!", ' + targetPath + ');\n';
        }
    }
});
// Prints "Hello /path/to/mymodule.js!" and "Goodbye /path/to/mymodule.js!"
var myModule = logRequire('mymodule');

// Look for modules in the current module's `lib` directory, and force child
// modules to do the same.
var path = require('path');
var extraPathRequire = requizzle({
    infect: true,
    requirePaths: [path.join(__dirname, 'lib')]
});
// If `foo` needs to require a module in `./lib`, it can use `require('bar')`
// instead of `require('./lib/bar')`.
var foo = extraPathRequire('./foo');
```


## Troubleshooting ##

Here are some problems you may run into when you use Requizzle, along with solutions to each
problem. If you run into any problems that aren't addressed here, please file a new issue!

### Requizzle slowed down my code! A lot! ###

Requizzle adds minimal overhead to the module-loading process. However, your code will run _much_
slower than usual if you do both of the following:

+ Use Requizzle's `infect` option.
+ Require modules that have a lot of `require()` calls within the scope of individual functions.

If Requizzle seems to slow down your app, look for module calls that are within function scope, then
move them to each module's top-level scope. You can find the biggest offenders by using Node.js's
built-in `--prof` option to profile your app, then running [node-tick][] to create a report that
shows the number of ticks per function.

[node-tick]: https://github.com/sidorares/node-tick

### Requizzle made my module do something weird! ###

Do you have any [circular dependencies][circular] in the modules that aren't working? Circular
dependencies can cause unusual behavior with Requizzle, just as they can without Requizzle. Try
breaking the circular dependency.

[circular]: http://nodejs.org/api/modules.html#modules_cycles

### Requizzle violates the [Law of Demeter][demeter]! It's an unnatural abomination! ###

Fair enough.

[demeter]: http://en.wikipedia.org/wiki/Law_of_Demeter


## Changelog ##

+ 0.1.1 (June 2014): If the `requirePaths` option is used, the module loader now searches the extra
paths first rather than last.
+ 0.1.0 (June 2014): Initial release.

## Acknowledgements ##

Requizzle is very loosely adapted from Johannes Ewald's [rewire](https://github.com/jhnns/rewire)
module, which is designed to modify a module's behavior for unit testing. If Requizzle doesn't meet
your needs, please take a look at rewire!


## License ##

[MIT license](LICENSE).
