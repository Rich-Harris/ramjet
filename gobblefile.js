/*global require, module, __dirname */
var gobble = require( 'gobble' );
var babel = require( 'rollup-plugin-babel' );
var npm = require( 'rollup-plugin-npm' );

gobble.cwd( __dirname );

var lib = gobble([
	gobble( 'src' ).transform( 'rollup', {
		entry: 'ramjet.js',
		dest: 'ramjet.umd.js',
		format: 'umd',
		moduleName: 'ramjet',
		plugins: [ babel({ include: 'src/**' }), npm({ jsnext: true }) ],
		sourceMap: true
	}),

	gobble( 'src' ).transform( 'rollup', {
		entry: 'ramjet.js',
		dest: 'ramjet.es6.js',
		format: 'es6',
		plugins: [ babel({ include: 'src/**' }), npm({ jsnext: true }) ],
		sourceMap: true
	})
]);

var demo = gobble([
	gobble([ 'src', 'demo/app' ])
		.transform( 'ractive', {
			type: 'es6'
		})
		.transform( 'rollup', {
			entry: 'main.js',
			dest: 'app.js',
			format: 'cjs',
			plugins: [ babel({ include: 'src/**' }) ]
		})
		.transform( 'derequire' )
		.transform( 'browserify', {
			entries: [ './app' ],
			dest: 'app.js',
			standalone: 'app'
		}),

	gobble( 'demo/files' )
]);

var built;

if ( gobble.env() === 'production' ) {
	built = gobble([
		lib,
		lib.include( 'ramjet.umd.js' ).transform( 'uglifyjs', { ext: '.min.js' })
	]);
} else {
	built = gobble([
		demo,
		lib
	]);
}

module.exports = built;
