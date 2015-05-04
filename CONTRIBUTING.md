# Contributing to ramjet

Hi there! Contributions to ramjet, such as issues and pull requests, are very much appreciated. This is a short note to help make the process as smooth as possible.

## Reporting bugs

Before submitting an issue, please make sure you're using the latest released version. You can download it from the [releases](https://github.com/Rich-Harris/ramjet/releases) page, or with `npm install ramjet@latest`.

The best issues contain a reproducible demonstration of the bug in the form of a JSFiddle or similar. [This JSFiddle](http://jsfiddle.net/rich_harris/g1y5kyt9/) has a basic setup to get started with. You could also include an animated GIF generated with something like [LICECap](http://www.cockos.com/licecap/) - just drag it into the editing window when you're writing the issue in GitHub, and it will upload it for you.


## Pull requests

To make a pull request, you should first fork this repository and create a new branch for your changes. To test your changes, follow the instructions on the [README](https://github.com/Rich-Harris/ramjet#developing-and-testing).

There isn't a formal style guide for ramjet, so please take care to adhere to existing conventions:

* Tabs, not spaces!
* Use `const` and `let`, not `var` - one declaration per line
* Use ES6 features such as arrow functions and template strings
* Semi-colons
* Single-quotes for strings
* Liberal whitespace

Above all, code should be clean and readable, and commented where necessary. If you add a new feature, make sure you add a test to go along with it (in `demo/test.html`)!


## Small print

There's no contributor license agreement - contributions are made on a common sense basis. Ramjet is distributed under the MIT license, which means your contributions will be too.