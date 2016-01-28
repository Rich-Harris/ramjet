import * as sander from 'sander';
import * as path from 'path';
import Nightmare from 'nightmare';
import compareScreenshots from './compareScreenshots.js';

const tests = sander.readdirSync( 'test/tests' ).filter( dir => dir[0] !== '.' );

const nightmare = Nightmare({ show: true });

let currentTest;

const handlers = {
	next () {
		compareScreenshots( currentTest ).then( runNextTest );
	},

	screenshot ({ name }) {
		const dest = path.resolve( 'test/tests', currentTest, 'screenshots/actual', name + '.png' );
		nightmare.screenshot( dest );
	}
};

nightmare.on( 'console', function ( type, command, data ) {
	if ( command !== '__action' ) {
		console[ type ].apply( console, arguments );
		return;
	}

	const handler = handlers[ data.type ];

	if ( !handler ) {
		console.error( `no handler for '${data.type}'` );
	} else {
		handler( data.options );

		nightmare
			.evaluate( ( id ) => {
				setTimeout( function () {
					if ( window.actionHandlers[ id ] ) window.actionHandlers[ id ]( null, null );
				});
			}, data.id )
			.run( () => {} );
	}
});

nightmare.on( 'page', ( type, message, data ) => {
	if ( type === 'error' ) {
		console.error( message );
		console.error( data );
	}
});

function runNextTest () {
	const test = tests.shift();

	if ( !test ) {
		nightmare.end( function () {
			console.log( 'all done!' );
		});
		return;
	}

	currentTest = test;
	const dir = path.resolve( 'test/tests', test );

	sander.rimrafSync( dir, 'screenshots/actual' );
	sander.mkdirSync( dir, 'screenshots/actual' );
	sander.mkdirSync( dir, 'screenshots/diff' );

	nightmare
		.goto( 'file://' + path.resolve( 'test/tests', test, 'index.html' ) )
		.evaluate( () => {
			setTimeout( test );
		})
		.run( function () {} );
}

runNextTest();
