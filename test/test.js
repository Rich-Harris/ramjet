import * as sander from 'sander';
import * as path from 'path';
import Nightmare from 'nightmare';

import compareScreenshots from './utils/compareScreenshots.js';
import samples from './utils/samples.js';
import * as templates from './utils/templates.js';

// run automated tests
const nightmare = Nightmare({ show: true })
	.viewport( 800, 400 );

let currentTest;

const handlers = {
	next () {
		compareScreenshots( currentTest ).then( runNextTest );
	},

	screenshot ({ name }) {
		const dest = path.resolve( 'test/screenshots', currentTest, 'actual', name + '.png' );
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
	const sample = samples.shift();

	if ( !sample ) {
		nightmare.end( function () {
			console.log( 'all done!' );
		});
		return;
	}

	currentTest = sample.title;

	sander.rimrafSync( 'test/screenshots', currentTest, 'actual' );
	sander.mkdirSync( 'test/screenshots', currentTest, 'actual' );
	sander.mkdirSync( 'test/screenshots', currentTest, 'diff' );

	const html = templates.standalone.replace( '__TEST__', sample.html );

	const url = `data:text/html,${encodeURIComponent(html)}`;

	nightmare
		.goto( url )
		.evaluate( () => {
			setTimeout( test );
		})
		.run( function () {} );
}

runNextTest();
