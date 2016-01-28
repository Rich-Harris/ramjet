import { readFileSync } from 'fs';

const styles = readFileSync( 'test/templates/styles.css', 'utf-8' );
const ramjetSrc = readFileSync( 'dist/ramjet.umd.js' );
const ramjetDataUri = `data:application/javascript;base64,${ramjetSrc.toString( 'base64' )}`;

export const standalone = readFileSync( 'test/templates/standalone.html', 'utf-8' )
	.replace( '__STYLES__ {}', styles )
	.replace( '__RAMJET__', ramjetDataUri );

export const viewer = readFileSync( 'test/templates/viewer.html', 'utf-8' )
	.replace( '__STYLES__ {}', styles )
	.replace( '__RAMJET__', ramjetDataUri );
