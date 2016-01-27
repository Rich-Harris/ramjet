import * as sander from 'sander';
import * as path from 'path';

import Nightmare from 'nightmare';

const tests = sander.readdirSync( 'test/tests' );



function runNextTest () {
	const test = tests.shift();

	if ( !test ) {
		console.log( 'all done!' );
		return;
	}

	const dir = path.resolve( 'test/tests', test );

	sander.rimrafSync( dir, 'screenshots/actual' );
	sander.mkdirSync( dir, 'screenshots/actual' );

	var nightmare = Nightmare({ show: true });

	var handlers = {
		__action ( options ) {
			console.log( 'options', options )
		},

		next () {
			nightmare.end( runNextTest );
		},

		screenshot ( options ) {
			const { name } = options;
			const dest = path.resolve( 'test/tests', test, 'screenshots/actual', name + '.png' );
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
						window.actionHandlers[ id ]( null, null );
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

	nightmare
		.goto( 'file://' + path.resolve( 'test/tests', test, 'index.html' ) )
		.evaluate( () => {
			setTimeout( test );
		})
		.run( function () {} );
}

runNextTest();
