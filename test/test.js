import * as sander from 'sander';
import * as path from 'path';
import Nightmare from 'nightmare';
import compareScreenshots from './compareScreenshots.js';

const samples = sander.readdirSync( 'test/samples' )
	.filter( file => file[0] !== '.' )
	.map( file => {
		return {
			file: path.resolve( 'test/samples', file ),
			title: file.replace( '.html', '' ),
			html: sander.readFileSync( 'test/samples', file, { encoding: 'utf-8' })
		};
	});

const templates = {
	standalone: sander.readFileSync( 'test/templates/standalone.html', { encoding: 'utf-8' }),
	viewer: sander.readFileSync( 'test/templates/viewer.html', { encoding: 'utf-8' })
};

const ramjetSrc = sander.readFileSync( 'dist/ramjet.umd.js' );
const ramjetDataUri = `data:application/javascript;base64,${ramjetSrc.toString( 'base64' )}`;


// create viewer
const blocks = samples.map( sample => {
	const screenshots = [ 'actual', 'expected', 'diff' ].map( type => `
		<div class='screenshot-column'>
			<h2>${type}</h2>

			<img src='screenshots/${sample.title}/${type}/000.png'>
			<img src='screenshots/${sample.title}/${type}/020.png'>
			<img src='screenshots/${sample.title}/${type}/040.png'>
			<img src='screenshots/${sample.title}/${type}/060.png'>
			<img src='screenshots/${sample.title}/${type}/080.png'>
			<img src='screenshots/${sample.title}/${type}/100.png'>
		</div>
	` ).join( '\n' );

	return `
		<article>
			<h1>${sample.title}</h1>
			<button class='go'>go</button>
			<button class='show-all'>show start and end</button>

			<!--<div class='test-area'>-->
				${sample.html}
			<!--</div>-->

			<div class='screenshots'>
				${screenshots}
			</div>
		</article>
	`;
});

const viewer = templates.viewer
	.replace( '__TESTS__', blocks.join( '\n' ) )
	.replace( '__RAMJET__', ramjetDataUri );

sander.writeFileSync( 'test/viewer.html', viewer );



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

	const html = templates.standalone
		.replace( '__TEST__', sample.html )
		.replace( '__RAMJET__', ramjetDataUri );

	const url = `data:text/html,${encodeURIComponent(html)}`;

	nightmare
		.goto( url )
		.evaluate( () => {
			setTimeout( test );
		})
		.run( function () {} );
}

runNextTest();
