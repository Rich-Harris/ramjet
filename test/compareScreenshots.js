import * as sander from 'sander';
import * as path from 'path';
import Jimp from 'jimp';

export default function compareScreenshots ( test ) {
	const dir = path.resolve( 'test/tests', test, 'screenshots' );

	const expected = path.resolve( dir, 'expected' );
	const actual = path.resolve( dir, 'actual' );

	const files = sander.readdirSync( actual );

	return files.reduce( ( promise, file ) => {
		return promise.then( () => {
			if ( !sander.existsSync( expected, file ) ) {
				console.log( `Missing ${test}/screenshots/expected/${file}` );
				return null;
			}

			return Promise.all([
				Jimp.read( path.resolve( actual, file ) ),
				Jimp.read( path.resolve( expected, file ) )
			]).then( ([ actual, expected ]) => {
				const diff = Jimp.diff( actual, expected );

				diff.image.write( path.resolve( dir, 'diff', file ) );

				console.log( `${test} : ${file} : ${diff.percent * 100}% difference` );
			});
		});
	}, Promise.resolve() );

}
