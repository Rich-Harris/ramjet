import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

export default readdirSync( 'test/samples' )
	.filter( file => file[0] !== '.' )
	.map( file => {
		return {
			file: resolve( 'test/samples', file ),
			title: file.replace( '.html', '' ),
			html: readFileSync( resolve( 'test/samples', file ), 'utf-8' )
		};
	});
