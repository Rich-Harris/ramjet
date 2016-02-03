import { resolve } from 'path';
import { writeFileSync } from 'sander';
import samples from './utils/samples.js';
import * as templates from './utils/templates.js';

// create viewer
const blocks = samples.map( sample => {
	const screenshots = [ 'actual', 'expected', 'diff' ].map( type => `
		<div class='screenshot-column'>
			<h2>${type}</h2>

			${
				[ '000', '020', '040', '060', '080', '100' ].map( pos => {
					const src = `../screenshots/${sample.title}/${type}/${pos}.png`;
					return `<a href='${src}'><img src='${src}'></a>`;
				}).join( '\n' )
			}
		</div>
	` ).join( '\n' );

	return `
		<article>
			<h1><a href='${sample.title}.html'>${sample.title}</a></h1>

			<div class='controls'>
				<button class='go'>go</button>
				<button class='show-all'>show start and end</button>

				<label>
					<input type='range' min='0' max='100' value='0'> <span class='range-value'>0</span>
				</label>
			</div>

			<!--<div class='test-area'>-->
				${sample.html}
			<!--</div>-->

			<div class='screenshots'>
				${screenshots}
			</div>
		</article>
	`;
});

blocks.forEach( ( block, i ) => {
	const { title } = samples[i];
	const html = templates.viewer.replace( '__TESTS__', block );

	writeFileSync( resolve( 'test/viewer', `${title}.html` ), html );
});

const viewer = templates.viewer.replace( '__TESTS__', blocks.join( '\n' ) );
writeFileSync( 'test/viewer/index.html', viewer );
