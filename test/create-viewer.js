import { writeFileSync } from 'fs';
import samples from './utils/samples.js';
import * as templates from './utils/templates.js';

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

const viewer = templates.viewer.replace( '__TESTS__', blocks.join( '\n' ) );

writeFileSync( 'test/viewer.html', viewer );
