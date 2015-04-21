var gobble = require( 'gobble' );

gobble.cwd( __dirname );

var babelWhitelist = [
	'es6.arrowFunctions',
	'es6.blockScoping',
	'es6.classes',
	'es6.constants',
	'es6.destructuring',
	'es6.parameters.default',
	'es6.parameters.rest',
	'es6.properties.shorthand',
	'es6.templateLiterals'
];

var lib = gobble( 'src' )
	.transform( 'babel', {
		whitelist: babelWhitelist,
		sourceMap: false
	})
	.transform( 'esperanto-bundle', {
		entry: 'ramjet',
		type: 'umd',
		name: 'ramjet',
		sourceMap: false
	});

var demo = gobble([
	gobble([ 'src', 'demo/app' ])
		.transform( 'ractive', {
			type: 'es6'
		})
		.transform( 'babel', {
			whitelist: babelWhitelist,
			inputSourceMap: false
		})
		.transform( 'esperanto-bundle', {
			entry: 'main',
			dest: 'app.js',
			type: 'cjs'
		})
		.transform( 'derequire' )
		.transform( 'browserify', {
			entries: [ './app' ],
			dest: 'app.js',
			standalone: 'app'
		}),

	gobble( 'demo/scss' )
		.transform( 'sass', { src: 'main.scss', dest: 'main.css' }),

	gobble( 'demo/files' )
]);

module.exports = gobble([ demo, lib ]);